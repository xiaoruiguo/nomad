# Nomad IPv4 / IPv6 代码实现与差异分析

> 本文档分析 Nomad 中 IPv4 与 IPv6 的代码实现、处理差异及演进历程。
> 基于 Nomad 1.8.x 源码。

---

## 目录

1. 总体架构
2. 地址族定义与类型系统
3. 地址归一化层（ipaddr 包）
4. 网络指纹采集（fingerprint）
5. Allocation 网络状态
6. CNI / Bridge 网络配置
7. iptables 规则管理
8. 服务注册地址模式
9. 环境变量注入
10. Docker 驱动 IPv6 支持
11. DNS / resolv.conf 处理
12. Consul Connect / Envoy
13. Server 通信与 retry_join
14. 云平台元数据指纹
15. IPv4 vs IPv6 差异总览
16. 历史演进（Changelog）
17. 代码文件索引

---

## 1. 总体架构

Nomad 的 IPv4/IPv6 处理分布在以下层次：

```
┌─────────────────────────────────────────────────────────┐
│ 配置层 (command/agent/config.go)                        │
│   bind_addr / addresses / advertise 归一化              │
├─────────────────────────────────────────────────────────┤
│ 地址工具层 (helper/ipaddr)                              │
│   NormalizeAddr / IsAny (RFC 5942/5952)                │
├─────────────────────────────────────────────────────────┤
│ 网络指纹层 (client/fingerprint)                         │
│   接口探测 / 地址族分类 / 排序                           │
├─────────────────────────────────────────────────────────┤
│ Allocation 网络层 (client/allocrunner)                  │
│   CNI/Bridge 配置 / 状态采集 / iptables                │
├─────────────────────────────────────────────────────────┤
│ 服务注册层 (client/serviceregistration)                 │
│   address_mode / alloc / alloc_ipv6                    │
├─────────────────────────────────────────────────────────┤
│ 驱动层 (drivers/docker)                                 │
│   ipv4_address / ipv6_address / advertise_ipv6         │
├─────────────────────────────────────────────────────────┤
│ DNS 层 (lib/resolvconf)                                 │
│   IPv4/IPv6 nameserver 过滤                             │
└─────────────────────────────────────────────────────────┘
```

**核心设计原则**：IPv4 为默认优先，IPv6 作为可选增强。通过 `PreferredAddressFamily` 配置和 `address_mode` 字段实现地址族选择。

---

## 2. 地址族定义与类型系统

### 2.1 NodeNetworkAF 类型

[nomad/structs/structs.go:2722-2736](file:///d:/claude/nomad/nomad/structs/structs.go#L2722-L2736)：

```go
type NodeNetworkAF string

const (
    NodeNetworkAF_IPv4 NodeNetworkAF = "ipv4"
    NodeNetworkAF_IPv6 NodeNetworkAF = "ipv6"
)

// Validate validates that NodeNetworkAF has a legal value.
func (n NodeNetworkAF) Validate() error {
    if n == "" || n == NodeNetworkAF_IPv4 || n == NodeNetworkAF_IPv6 {
        return nil
    }
    return fmt.Errorf(`network address family must be one of: "", %q, %q`,
        NodeNetworkAF_IPv4, NodeNetworkAF_IPv6)
}
```

`""`（空）表示"不指定"，由 fingerprinter 按默认顺序选择。

### 2.2 NodeNetworkAddress 结构

[nomad/structs/structs.go:2738-2745](file:///d:/claude/nomad/nomad/structs/structs.go#L2738-L2745)：

```go
type NodeNetworkAddress struct {
    Family        NodeNetworkAF  // "ipv4" 或 "ipv6"
    Alias         string         // 别名（如 eth0、host_network 名）
    Address       string         // IP 地址字符串
    ReservedPorts string
    Gateway       string         // 默认网关
}
```

**每个地址显式标注 Family**，IPv4 和 IPv6 地址作为独立条目存储在同一 `Addresses` 切片中。

### 2.3 NetworkResource.IsIPv6 方法

[nomad/structs/structs.go:2977-2980](file:///d:/claude/nomad/nomad/structs/structs.go#L2977-L2980)：

```go
func (n *NetworkResource) IsIPv6() bool {
    ip := net.ParseIP(n.IP)
    return ip != nil && ip.To4() == nil
}
```

**判断逻辑**：`net.ParseIP` 解析后，`To4() == nil` 表示非 IPv4（即 IPv6）。这是 Go 标准库判断 IPv6 的惯用方法。

> **注意**：IPv4-mapped IPv6 地址（如 `::ffff:1.2.3.4`）会被 `To4()` 返回非 nil，因此被识别为 IPv4。

### 2.4 AllocNetworkStatus 双地址字段

[nomad/structs/alloc.go:1340-1349](file:///d:/claude/nomad/nomad/structs/alloc.go#L1340-L1349)：

```go
type AllocNetworkStatus struct {
    InterfaceName string
    Address       string  // IPv4 地址（主）
    AddressIPv6   string  // IPv6 地址（副）
    DNS           *DNSConfig
}
```

**关键设计**：IPv4 和 IPv6 作为**两个独立字段**存储，而非用 Family 标注的列表。这简化了服务注册的地址选择逻辑。

---

## 3. 地址归一化层（ipaddr 包）

### 3.1 NormalizeAddr 函数

[helper/ipaddr/ipaddr.go:23-117](file:///d:/claude/nomad/helper/ipaddr/ipaddr.go#L23-L117)：

该函数处理 5 种输入格式，确保 IPv6 地址符合 RFC 5942 §4 / RFC 5952：

| 输入格式 | IPv4 示例 | IPv6 示例 |
|---------|----------|----------|
| 纯 Host | `10.0.1.10` → `10.0.1.10` | `2001:0db8::0001` → `2001:db8::1` |
| [Host] | `[10.0.1.10]` → `10.0.1.10` | `[2001:0db8::0001]` → `2001:db8::1` |
| Host:Port | `10.0.1.10:8500` → `10.0.1.10:8500` | `[2001:0db8::0001]:8500` → `[2001:db8::1]:8500` |
| URL | `https://10.0.1.10:8200` | `https://[2001:0db8::0001]:8200` → `https://[2001:db8::1]:8200` |
| user@host:port | `user@10.0.1.10:8200` | `user@[2001:0db8::0001]:8200` → `user@[2001:db8::1]:8200` |

### 3.2 IPv6 归一化规则（RFC 5952）

| 规则 | RFC 章节 | 示例 |
|------|---------|------|
| 去前导零 | §4.1 | `2001:0db8::0001` → `2001:db8::1` |
| 最长零段压缩 | §4.2.3 | `2001:0:0:1:0:0:0:1` → `2001:0:0:1::1` |
| 等长零段取首个 | §4.2.3 | `2001:db8:0:0:1:0:0:1` → `2001:db8::1:0:0:1` |
| 单零段不压缩 | §4.2.2 | `2001:db8:0:1:1:1:1:1` → `2001:db8:0:1:1:1:1:1` |
| 小写化 | §4.3 | `2001:DB8:AC3::1` → `2001:db8:ac3::1` |
| 端口加方括号 | §6 | `2001:db8::1` + `:4647` → `[2001:db8::1]:4647` |

### 3.3 IsAny 函数

[helper/ipaddr/ipaddr.go:11-19](file:///d:/claude/nomad/helper/ipaddr/ipaddr.go#L11-L19)：

```go
func IsAny(ip string) bool {
    return isAnyV4(ip) || isAnyV6(ip)
}
func isAnyV4(ip string) bool { return ip == "0.0.0.0" }
func isAnyV6(ip string) bool { return ip == "::" || ip == "[::]" }
```

**差异**：IPv4 ANY 为 `0.0.0.0`；IPv6 ANY 为 `::` 或 `[::]`（带方括号形式）。

---

## 4. 网络指纹采集（fingerprint）

### 4.1 地址族判定

[client/fingerprint/network.go:171-175](file:///d:/claude/nomad/client/fingerprint/network.go#L171-L175)：

```go
if ip.To4() != nil {
    family = structs.NodeNetworkAF_IPv4
} else {
    family = structs.NodeNetworkAF_IPv6
}
```

**统一判定逻辑**：`ip.To4() != nil` → IPv4，否则 → IPv6。在 fingerprint 层、CNI 层、connect 层均使用此模式。

### 4.2 CIDR 计算

[client/fingerprint/network.go:295-300](file:///d:/claude/nomad/client/fingerprint/network.go#L295-L300)：

```go
newNetwork.IP = ip.String()
if ip.To4() != nil {
    newNetwork.CIDR = newNetwork.IP + "/32"   // IPv4 单地址
} else {
    newNetwork.CIDR = newNetwork.IP + "/128"  // IPv6 单地址
}
```

**差异**：IPv4 掩码长度 32，IPv6 掩码长度 128。

### 4.3 PreferredAddressFamily 排序

[client/fingerprint/network.go:364-424](file:///d:/claude/nomad/client/fingerprint/network.go#L364-L424)：

```go
func lessNetworkResourceIPv4(a, b *structs.NetworkResource) bool {
    return net.ParseIP(a.IP).To4() != nil && net.ParseIP(b.IP).To4() == nil
}
func lessNetworkResourceIPv6(a, b *structs.NetworkResource) bool {
    return net.ParseIP(a.IP).To4() == nil && net.ParseIP(b.IP).To4() != nil
}
// ... 类似的 NodeNetworkResource 和 NodeNetworkAddress 排序函数

func sortNetworkResources(res []*structs.NetworkResource, preferredAF structs.NodeNetworkAF) {
    if preferredAF == structs.NodeNetworkAF_IPv4 {
        sortResources(res, lessNetworkResourceIPv4)  // IPv4 排前
    } else if preferredAF == structs.NodeNetworkAF_IPv6 {
        sortResources(res, lessNetworkResourceIPv6)  // IPv6 排前
    }
    // preferredAF == "" 时不排序，保持系统返回顺序
}
```

**配置方式**：CLI 参数 `-preferred-address-family` 或配置 `client { preferred_address_family = "ipv6" }`。

**差异**：默认不排序（`""`），需显式配置才按地址族优先排序。相关 changelog：[.changelog/23389.txt](file:///d:/claude/nomad/.changelog/23389.txt)。

### 4.4 链路本地地址处理

[client/fingerprint/network.go:185-195](file:///d:/claude/nomad/client/fingerprint/network.go#L185-L195)：

```go
if ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
    linkLocalAddrs = append(linkLocalAddrs, newAddr)
} else {
    networkAddrs = append(networkAddrs, newAddr)
}
```

**统一处理**：IPv4 链路本地（`169.254.0.0/16`）和 IPv6 链路本地（`fe80::/10`）都通过 `IsLinkLocalUnicast()` 检测，归入 `linkLocalAddrs`，仅在无其他地址时才使用。

---

## 5. Allocation 网络状态

### 5.1 CNI 状态采集

[client/allocrunner/networking_cni.go:457-517](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L457-L517)：

```go
setStatus := func(requireSandbox bool) {
    for _, name := range names {
        iface := res.Interfaces[name]
        for _, ipConfig := range iface.IPConfigs {
            isIP4 := ipConfig.IP.To4() != nil
            if netStatus.Address == "" && isIP4 {
                netStatus.Address = ipConfig.IP.String()       // IPv4 存入 Address
            }
            if netStatus.AddressIPv6 == "" && !isIP4 {
                netStatus.AddressIPv6 = ipConfig.IP.String()    // IPv6 存入 AddressIPv6
            }
        }
        if netStatus.Address != "" || netStatus.AddressIPv6 != "" {
            netStatus.InterfaceName = name
            return
        }
    }
}

// Fallback: if no IPv4 address but we have IPv6, copy it to Address field
// for backward compatibility with code that only checks Address field
if netStatus.Address == "" && netStatus.AddressIPv6 != "" {
    netStatus.Address = netStatus.AddressIPv6
}
```

**关键逻辑**：
1. 遍历 CNI 结果中的接口 IP 配置
2. **第一个 IPv4** 存入 `Address`，**第一个 IPv6** 存入 `AddressIPv6`
3. 若无 IPv4 但有 IPv6，将 IPv6 **复制到 `Address`**（向后兼容）

**差异**：IPv4 优先填充 `Address` 字段；IPv6 单独存储并在无 IPv4 时回退。

---

## 6. CNI / Bridge 网络配置

### 6.1 Bridge 双栈子网配置

[client/allocrunner/networking_bridge_linux.go:25-50](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L25-L50)：

```go
const defaultNomadAllocSubnet = "172.26.64.0/20" // IPv4 默认子网

type bridgeNetworkConfigurator struct {
    cni             *cniNetworkConfigurator
    allocSubnetIPv6 string  // IPv6 子网（可选）
    allocSubnetIPv4 string  // IPv4 子网（默认 172.26.64.0/20）
    bridgeName      string
    hairpinMode     bool
    // ...
}

func newBridgeNetworkConfigurator(..., ipv4Range, ipv6Range string, ...) {
    b := &bridgeNetworkConfigurator{
        allocSubnetIPv4: ipv4Range,
        allocSubnetIPv6: ipv6Range,  // 可为空
    }
    if b.allocSubnetIPv4 == "" {
        b.allocSubnetIPv4 = defaultNomadAllocSubnet  // IPv4 总有默认值
    }
    // IPv6 无默认值，需用户配置
}
```

**差异**：
- IPv4 有默认子网 `172.26.64.0/20`
- IPv6 **无默认子网**，必须通过 `bridge_network_allocation_subnet_ipv6` 显式配置

### 6.2 客户端配置

[client/config/config.go:325-333](file:///d:/claude/nomad/client/config/config.go#L325-L333)：

```go
// BridgeNetworkAllocSubnet is the IP subnet to use for address allocation
// for allocations in bridge networking mode. Subnet must be in CIDR
// notation and must be an IPv4 address.
BridgeNetworkAllocSubnet string

// BridgeNetworkAllocSubnetIPv6 is the IP subnet to use for address allocation
// for allocations in bridge networking mode. Subnet must be in CIDR
// notation and must be an IPv6 address.
BridgeNetworkAllocSubnetIPv6 string
```

### 6.3 CNI 网络配置生成

[client/allocrunner/cni/bridge.go:36-50](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go#L36-L50)：

```go
ipRanges := [][]Range{
    {{Subnet: conf.IPv4Subnet}},  // IPv4 总是包含
}
ipRoutes := []Route{
    {Dst: "0.0.0.0/0"},  // IPv4 默认路由
}
if conf.IPv6Subnet != "" {
    ipRanges = append(ipRanges, []Range{{Subnet: conf.IPv6Subnet}})  // 条件添加 IPv6
    ipRoutes = append(ipRoutes, Route{Dst: "::/0"})  // IPv6 默认路由
}
```

**差异**：IPv4 子网和路由无条件添加；IPv6 子网和路由仅在配置了 `IPv6Subnet` 时添加。

### 6.4 转发规则

[client/allocrunner/networking_bridge_linux.go:99-118](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L99-L118)：

```go
func (b *bridgeNetworkConfigurator) ensureForwardingRules() error {
    if b.allocSubnetIPv6 != "" {
        ip6t, err := b.newIPTables(structs.NodeNetworkAF_IPv6)
        if err = ensureChainRule(ip6t, b.bridgeName, b.allocSubnetIPv6); err != nil {
            return err
        }
    }
    ipt, err := b.newIPTables(structs.NodeNetworkAF_IPv4)
    if err = ensureChainRule(ipt, b.bridgeName, b.allocSubnetIPv4); err != nil {
        return err
    }
    return nil
}
```

**差异**：IPv4 转发规则无条件添加；IPv6 转发规则仅在配置了 IPv6 子网时添加。

相关 changelog：[.changelog/23882.txt](file:///d:/claude/nomad/.changelog/23882.txt) — "IPv6 can now be enabled on the Nomad bridge network mode"。

---

## 7. iptables 规则管理

### 7.1 双栈 iptables

[client/allocrunner/networking_iptables.go:21-27](file:///d:/claude/nomad/client/allocrunner/networking_iptables.go#L21-L27)：

```go
// newIPTables provides an *iptables.IPTables for the requested address family
// "ipv6" or "ipv4"
func newIPTables(family structs.NodeNetworkAF) (IPTables, error) {
    if family == structs.NodeNetworkAF_IPv6 {
        return iptables.New(iptables.IPFamily(iptables.ProtocolIPv6), iptables.Timeout(5))
    }
    return iptables.New(iptables.IPFamily(iptables.ProtocolIPv4), iptables.Timeout(5))
}
```

**差异**：
- IPv4 使用 `iptables`（`ProtocolIPv4`）
- IPv6 使用 `ip6tables`（`ProtocolIPv6`）

### 7.2 CNI Teardown 清理

[client/allocrunner/networking_cni.go:601-615](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L601-L615)：

```go
// best effort cleanup ipv6
ipt, iptErr := c.newIPTables(structs.NodeNetworkAF_IPv6)
if iptErr != nil {
    c.logger.Debug("failed to detect ip6tables", "error", iptErr)
} else {
    if err := c.forceCleanup(ipt, alloc.ID); err != nil {
        c.logger.Warn("failed to cleanup iptables", "error", err)
    }
}

// create a real handle to iptables
ipt, iptErr = c.newIPTables(structs.NodeNetworkAF_IPv4)
if iptErr != nil {
    return fmt.Errorf("failed to detect iptables: %w", iptErr)
}
return c.forceCleanup(ipt, alloc.ID)
```

**差异**：
- IPv6 清理为 **best-effort**（失败仅 debug 日志）
- IPv4 清理为 **必需**（失败返回 error）

---

## 8. 服务注册地址模式

### 8.1 AddressMode 常量

[nomad/structs/services.go:565-569](file:///d:/claude/nomad/nomad/structs/services.go#L565-L569)：

```go
AddressModeAuto      = "auto"
AddressModeHost      = "host"
AddressModeDriver    = "driver"
AddressModeAlloc     = "alloc"      // IPv4 allocation 地址
AddressModeAllocIPv6 = "alloc_ipv6" // IPv6 allocation 地址
```

### 8.2 getAddressPort 地址选择

[client/serviceregistration/address.go:180-186](file:///d:/claude/nomad/client/serviceregistration/address.go#L180-L186)：

```go
func getAddressPort(addressMode string, netStatus *structs.AllocNetworkStatus, port int) (string, int, error) {
    if addressMode == structs.AddressModeAllocIPv6 {
        return netStatus.AddressIPv6, port, nil  // 返回 IPv6
    }
    return netStatus.Address, port, nil           // 返回 IPv4
}
```

**差异**：
- `alloc` → `netStatus.Address`（IPv4）
- `alloc_ipv6` → `netStatus.AddressIPv6`（IPv6）

### 8.3 校验限制

[nomad/structs/structs.go:8457-8458](file:///d:/claude/nomad/nomad/structs/structs.go#L8457-L8458)：

```go
if service.AddressMode == AddressModeAllocIPv6 {
    mErr.Errors = append(mErr.Errors, fmt.Errorf(
        "service %q cannot use address_mode=\"alloc_ipv6\", only services defined in a \"group\" block can use this mode",
        service.Name))
}
```

**限制**：`alloc_ipv6` 仅可用于 **group 级别**的 service，不可用于 task 级别的 service（因为 task 网络不产生 `AllocNetworkStatus`）。

相关 changelog：[.changelog/25632.txt](file:///d:/claude/nomad/.changelog/25632.txt) — "Add AllocIPv6 option to allow IPv6 address being used for service registration"。

---

## 9. 环境变量注入

### 9.1 IP 地址族前缀

[client/taskenv/env.go:1006-1017](file:///d:/claude/nomad/client/taskenv/env.go#L1006-L1017)：

```go
func buildPortEnv(envMap map[string]string, p structs.Port, ip string, driverNet *drivers.DriverNetwork) {
    portStr := strconv.Itoa(p.Value)

    var ipFamilyPrefix string
    if strings.Contains(ip, ":") {
        ipFamilyPrefix = "NOMAD_IPv6_"   // IPv6 前缀
    } else {
        ipFamilyPrefix = "NOMAD_IPv4_"   // IPv4 前缀
    }

    envMap[IpPrefix+p.Label] = ip                  // NOMAD_IP_<label>
    envMap[ipFamilyPrefix+p.Label] = ip            // NOMAD_IPv4_<label> 或 NOMAD_IPv6_<label>
    envMap[HostPortPrefix+p.Label] = portStr       // NOMAD_HOST_PORT_<label>
    envMap[AddrPrefix+p.Label] = net.JoinHostPort(ip, portStr) // NOMAD_ADDR_<label>
}
```

**差异**：

| 地址族 | 通用前缀 | 专用前缀 | 示例 |
|-------|---------|---------|------|
| IPv4 | `NOMAD_IP_` | `NOMAD_IPv4_` | `NOMAD_IPv4_http=10.0.1.10` |
| IPv6 | `NOMAD_IP_` | `NOMAD_IPv6_` | `NOMAD_IPv6_http=2001:db8::1` |

**判断方式**：通过 `strings.Contains(ip, ":")` 判断是否为 IPv6（IPv6 含冒号，IPv4 不含）。

> **注意**：`NOMAD_IP_<label>` 总是被设置（不带族标识），向后兼容。`NOMAD_ADDR_<label>` 使用 `net.JoinHostPort` 自动为 IPv6 加方括号。

相关 changelog：[.changelog/16723.txt](file:///d:/claude/nomad/.changelog/16723.txt) — "Fix address for ports in IPv6 networks"。

---

## 10. Docker 驱动 IPv6 支持

### 10.1 IP 地址配置

[drivers/docker/config.go:398-399, 457, 482-483](file:///d:/claude/nomad/drivers/docker/config.go#L398-L399)：

```go
// HCL spec
"ipv4_address":       hclspec.NewAttr("ipv4_address", "string", false),
"ipv6_address":       hclspec.NewAttr("ipv6_address", "string", false),
"advertise_ipv6_address": hclspec.NewAttr("advertise_ipv6_address", "bool", false),

// Go struct
AdvertiseIPv6Addr bool   `codec:"advertise_ipv6_address"`
IPv4Address       string `codec:"ipv4_address"`
IPv6Address       string `codec:"ipv6_address"`
```

### 10.2 IPAM 配置

[drivers/docker/driver.go:1508-1526](file:///d:/claude/nomad/drivers/docker/driver.go#L1508-L1526)：

```go
if driverConfig.IPv4Address != "" || driverConfig.IPv6Address != "" {
    ipamConfig := networkapi.IPAMConfig{}
    if driverConfig.IPv4Address != "" {
        ipv4, err := netip.ParseAddr(driverConfig.IPv4Address)
        ipamConfig.IPv4Address = ipv4
    }
    if driverConfig.IPv6Address != "" {
        ipv6, err := netip.ParseAddr(driverConfig.IPv6Address)
        ipamConfig.IPv6Address = ipv6
    }
}
```

**使用 `netip.ParseAddr`**（较新的 Go 标准库），自动区分 IPv4/IPv6。

### 10.3 Advertise IPv6 地址

[drivers/docker/driver.go:1612-1614](file:///d:/claude/nomad/drivers/docker/driver.go#L1612-L1614)：

```go
ip = net.IPAddress.String()  // 默认 IPv4
if driverConfig.AdvertiseIPv6Addr && net.GlobalIPv6Address.IsValid() {
    ip = net.GlobalIPv6Address.String()  // 优先使用 IPv6
    auto = true
}
```

**差异**：默认 advertise IPv4 地址；设置 `advertise_ipv6_address = true` 时优先使用 IPv6。

---

## 11. DNS / resolv.conf 处理

### 11.1 默认 nameservers

[lib/resolvconf/lib.go:56-62](file:///d:/claude/nomad/lib/resolvconf/lib.go#L56-L62)：

```go
var (
    defaultIPv4NSs = []netip.Addr{
        netip.MustParseAddr("8.8.8.8"),
        netip.MustParseAddr("8.8.4.4"),
    }
    defaultIPv6NSs = []netip.Addr{
        netip.MustParseAddr("2001:4860:4860::8888"),
        netip.MustParseAddr("2001:4860:4860::8844"),
    }
)
```

### 11.2 TransformForLegacyNw

[lib/resolvconf/lib.go:231-247](file:///d:/claude/nomad/lib/resolvconf/lib.go#L231-L247)：

```go
func (rc *ResolvConf) TransformForLegacyNw(ipv6 bool) {
    var filtered []netip.Addr
    for _, addr := range rc.nameServers {
        if !addr.IsLoopback() && (!addr.Is6() || ipv6) {
            filtered = append(filtered, addr)
        }
    }
    rc.nameServers = filtered
    if len(rc.nameServers) == 0 {
        rc.nameServers = defaultNSAddrs(ipv6)
    }
}

func defaultNSAddrs(ipv6 bool) []netip.Addr {
    addrs = append(addrs, defaultIPv4NSs...)
    if ipv6 {
        addrs = append(addrs, defaultIPv6NSs...)
    }
}
```

**差异**：
- `ipv6 = false`：过滤掉所有 IPv6 nameserver，仅保留 IPv4
- `ipv6 = true`：保留 IPv4 和 IPv6 nameserver

**判断方式**：使用 `netip.Addr.Is6()` 方法（比 `To4()` 更语义化）。

---

## 12. Consul Connect / Envoy

### 12.1 Connect Proxy 绑定地址

[command/agent/consul/connect.go:265-271](file:///d:/claude/nomad/command/agent/consul/connect.go#L265-L271)：

```go
func connectProxyBindAddress(networks structs.Networks) string {
    for _, n := range networks {
        if n.IsIPv6() && (n.Mode == "bridge" || strings.HasPrefix(n.Mode, "cni/")) {
            return "::"       // IPv6 bridge/cni 网络用 ::
        }
    }
    return "0.0.0.0"          // 默认 IPv4
}
```

**差异**：
- 当网络为 bridge/cni 且 IP 为 IPv6 时，proxy 绑定 `::`（IPv6 ANY）
- 否则绑定 `0.0.0.0`（IPv4 ANY）

### 12.2 Consul Tagged Addresses

[command/agent/consul/service_client.go:230-240](file:///d:/claude/nomad/command/agent/consul/service_client.go#L230-L240)：

```go
if _, exists := wanted.TaggedAddresses["lan_ipv4"]; !exists {
    delete(existing.TaggedAddresses, "lan_ipv4")
}
if _, exists := wanted.TaggedAddresses["wan_ipv4"]; !exists {
    delete(existing.TaggedAddresses, "wan_ipv4")
}
if _, exists := wanted.TaggedAddresses["lan_ipv6"]; !exists {
    delete(existing.TaggedAddresses, "lan_ipv6")
}
if _, exists := wanted.TaggedAddresses["wan_ipv6"]; !exists {
    delete(existing.TaggedAddresses, "wan_ipv6")
}
```

**Consul 节点注册**：同时管理 `lan_ipv4`、`wan_ipv4`、`lan_ipv6`、`wan_ipv6` 四种 tagged address。

---

## 13. Server 通信与 retry_join

### 13.1 resolveServer IPv6 兼容

[client/rpc.go:460-497](file:///d:/claude/nomad/client/rpc.go#L460-L497)：

```go
func resolveServer(s string) (net.Addr, error) {
    const defaultClientPort = "4647"
    host, port, err := net.SplitHostPort(s)
    if err != nil {
        switch {
        case strings.Contains(err.Error(), "missing port"):
            return resolveServer(s + ":" + defaultClientPort)
        case strings.Contains(err.Error(), "too many colons"):
            // IPv6 地址未加方括号
            ip := net.ParseIP(s)
            if ip.To4() == nil && ip.To16() != nil {
                if !strings.HasPrefix(s, "[") {
                    return resolveServer("[" + s + "]:" + defaultClientPort)
                }
            }
            return nil, err
        default:
            return nil, err
        }
    } else if port == "" {
        return resolveServer(s + defaultClientPort)
    }
    return net.ResolveTCPAddr("tcp", net.JoinHostPort(host, port))
}
```

**IPv6 专属处理**：当 `net.SplitHostPort` 报 "too many colons" 时，检测是否为 IPv6 地址并自动加方括号。IPv4 不会触发此分支。

相关 changelog：[.changelog/20324.txt](file:///d:/claude/nomad/.changelog/20324.txt) — "Fixed a bug where IPv6 addresses were not accepted without ports for `client.servers` blocks"。

### 13.2 retry_join 地址发现

[command/agent/retry_join.go:66-90](file:///d:/claude/nomad/command/agent/retry_join.go#L66-L90)：

```go
// The command may output IPv4 or IPv6 addresses, and IPv6 addresses can
// optionally include a zone index.
func (d autoDiscover) Addrs(cfg string, logger log.Logger) (addrs []string, err error) {
    var ipAddrs []net.IPAddr
    switch {
    case strings.HasPrefix(cfg, "exec="):
        ipAddrs, err = d.netAddrs.IPAddrs(context.Background(), cfg, logger)
        for _, addr := range ipAddrs {
            addrs = append(addrs, addr.IP.String())
        }
    // ...
    }
}
```

使用 `net.IPAddr` 类型，原生支持 IPv6（含 zone index）。相关 changelog：[.changelog/24649.txt](file:///d:/claude/nomad/.changelog/24649.txt)。

---

## 14. 云平台元数据指纹

### 14.1 AWS

[client/fingerprint/env_aws.go:111-184](file:///d:/claude/nomad/client/fingerprint/env_aws.go#L111-L184)：

```go
// IPv4 元数据
"local-ipv4":  true,  // 私有 IPv4
"public-ipv4": true,  // 公有 IPv4

// IPv6 元数据（单独路径查询）
k := "network/interfaces/macs/" + val + "/ipv6s"
resp, err := imdsClient.GetMetadata(ctx, &imds.GetMetadataInput{Path: k})
response.AddAttribute("unique.platform.aws.public-ipv6", addrs[0])
```

**差异**：IPv4 从 IMDS 顶层属性获取；IPv6 需通过 MAC 接口路径单独查询。

### 14.2 Azure

[client/fingerprint/env_azure.go:160-164](file:///d:/claude/nomad/client/fingerprint/env_azure.go#L160-L164)：

```go
"local-ipv4":  {unique: true, path: "network/interface/0/ipv4/ipAddress/0/privateIpAddress"},
"public-ipv4": {unique: true, path: "network/interface/0/ipv4/ipAddress/0/publicIpAddress"},
"local-ipv6":  {unique: true, path: "network/interface/0/ipv6/ipAddress/0/privateIpAddress"},
"public-ipv6": {unique: true, path: "network/interface/0/ipv6/ipAddress/0/publicIpAddress"},
```

**对称设计**：Azure IMDS 对 IPv4/IPv6 提供对称的路径结构。

### 14.3 DigitalOcean

[client/fingerprint/env_digitalocean.go:133-136](file:///d:/claude/nomad/client/fingerprint/env_digitalocean.go#L133-L136)：

```go
"private-ipv4": {unique: true, path: "interfaces/private/0/ipv4/address"},
"public-ipv4":  {unique: true, path: "interfaces/public/0/ipv4/address"},
"private-ipv6": {unique: true, path: "interfaces/private/0/ipv6/address"},
"public-ipv6":  {unique: true, path: "interfaces/public/0/ipv6/address"},
```

同样对称设计。

---

## 15. IPv4 vs IPv6 差异总览

| 维度 | IPv4 | IPv6 | 差异点 |
|------|------|------|--------|
| **ANY 地址** | `0.0.0.0` | `::` / `[::]` | `IsAny` 分别检测 |
| **CIDR 掩码** | `/32` | `/128` | fingerprint 层硬编码 |
| **地址归一化** | 无特殊处理 | RFC 5952 压缩/小写 | `NormalizeAddr` 统一处理 |
| **端口格式** | `ip:port` | `[ip]:port` | `net.JoinHostPort` 自动 |
| **默认子网** | `172.26.64.0/20` | 无默认 | 需显式配置 |
| **默认路由** | `0.0.0.0/0` | `::/0` | CNI 配置条件添加 |
| **iptables** | `iptables` (必需) | `ip6tables` (best-effort) | 清理容错不同 |
| **Alloc 地址字段** | `Address` | `AddressIPv6` | 双字段存储 |
| **服务注册模式** | `alloc` | `alloc_ipv6` | 独立模式常量 |
| **环境变量前缀** | `NOMAD_IPv4_` | `NOMAD_IPv6_` | 按冒号判断 |
| **判断方法** | `To4() != nil` | `To4() == nil` | Go 惯用模式 |
| **Connect 绑定** | `0.0.0.0` | `::` | 按 `IsIPv6()` 选择 |
| **DNS 默认 NS** | `8.8.8.8/8.8.4.4` | `2001:4860:4860::8888/8844` | 条件添加 |
| **Docker advertise** | 默认 | `advertise_ipv6_address` | 需显式启用 |
| **retry_join 解析** | 直接 `SplitHostPort` | 自动加方括号 | "too many colons" 分支 |
| **云元数据** | 顶层属性 | 接口路径查询 | AWS 路径不同 |
| **排序优先级** | 默认不排序 | 需配置 `preferred_address_family` | 可选 |

---

## 16. 历史演进（Changelog）

| 版本/PR | 类型 | 内容 |
|---------|------|------|
| [15411](file:///d:/claude/nomad/.changelog/15411.txt) | bug | consul: 修复使用 IPv6 时服务持续重注册 |
| [16723](file:///d:/claude/nomad/.changelog/16723.txt) | bug | client: 修复 IPv6 网络中端口地址 |
| [20324](file:///d:/claude/nomad/.changelog/20324.txt) | bug | config: 修复 `client.servers` 不接受无端口 IPv6 地址 |
| [23389](file:///d:/claude/nomad/.changelog/23389.txt) | improvement | client: 添加 `preferred_address_family` 配置 |
| [23882](file:///d:/claude/nomad/.changelog/23882.txt) | improvement | networking: bridge 网络模式支持 IPv6 |
| [24649](file:///d:/claude/nomad/.changelog/24649.txt) | bug | discovery: 修复 cloud autojoin 不接受 IPv6 |
| [25632](file:///d:/claude/nomad/.changelog/25632.txt) | bug | consul: 添加 AllocIPv6 选项用于服务注册 |
| [25921](file:///d:/claude/nomad/.changelog/25921.txt) | improvement | ipv6: bind/advertise 地址遵循 RFC-5942 §4 |
| [26910](file:///d:/claude/nomad/.changelog/26910.txt) | bug | networking: 修复 IPv6-only 接口下 bridge/CNI 模式检测失败 |

**演进趋势**：从 IPv4-only → IPv6 兼容（修 bug）→ IPv6 功能增强（bridge/preferred）→ IPv6 完善（RFC 合规、alloc_ipv6）。

---

## 17. 代码文件索引

### 17.1 核心类型定义

| 文件 | 关键内容 |
|------|---------|
| [nomad/structs/structs.go](file:///d:/claude/nomad/nomad/structs/structs.go) | `NodeNetworkAF`、`NodeNetworkAddress`、`NetworkResource.IsIPv6()`、`alloc_ipv6` 校验 |
| [nomad/structs/alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | `AllocNetworkStatus`（Address + AddressIPv6 双字段） |
| [nomad/structs/services.go](file:///d:/claude/nomad/nomad/structs/services.go) | `AddressMode*` 常量、`Service.Address` 字段 |

### 17.2 地址工具

| 文件 | 关键内容 |
|------|---------|
| [helper/ipaddr/ipaddr.go](file:///d:/claude/nomad/helper/ipaddr/ipaddr.go) | `NormalizeAddr`（RFC 5942/5952）、`IsAny` |
| [helper/ipaddr/ipaddr_test.go](file:///d:/claude/nomad/helper/ipaddr/ipaddr_test.go) | IPv4/IPv6 归一化测试 |

### 17.3 网络指纹

| 文件 | 关键内容 |
|------|---------|
| [client/fingerprint/network.go](file:///d:/claude/nomad/client/fingerprint/network.go) | 地址族判定、CIDR 计算、`PreferredAddressFamily` 排序 |
| [client/fingerprint/env_aws.go](file:///d:/claude/nomad/client/fingerprint/env_aws.go) | AWS IPv4/IPv6 元数据 |
| [client/fingerprint/env_azure.go](file:///d:/claude/nomad/client/fingerprint/env_azure.go) | Azure IPv4/IPv6 元数据 |
| [client/fingerprint/env_digitalocean.go](file:///d:/claude/nomad/client/fingerprint/env_digitalocean.go) | DigitalOcean IPv4/IPv6 元数据 |
| [command/agent/host/network.go](file:///d:/claude/nomad/command/agent/host/network.go) | sockaddr IPv4/IPv6 属性 |

### 17.4 Allocation 网络

| 文件 | 关键内容 |
|------|---------|
| [client/allocrunner/networking_cni.go](file:///d:/claude/nomad/client/allocrunner/networking_cni.go) | CNI 状态采集（IPv4/IPv6 分离）、`getPortMapping`、Teardown 清理 |
| [client/allocrunner/networking_bridge_linux.go](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go) | Bridge 双栈子网、转发规则 |
| [client/allocrunner/networking_iptables.go](file:///d:/claude/nomad/client/allocrunner/networking_iptables.go) | `newIPTables`（iptables/ip6tables） |
| [client/allocrunner/cni/bridge.go](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go) | CNI 配置生成（条件添加 IPv6） |
| [client/config/config.go](file:///d:/claude/nomad/client/config/config.go) | `BridgeNetworkAllocSubnet` / `BridgeNetworkAllocSubnetIPv6`、`PreferredAddressFamily` |

### 17.5 服务注册

| 文件 | 关键内容 |
|------|---------|
| [client/serviceregistration/address.go](file:///d:/claude/nomad/client/serviceregistration/address.go) | `GetAddress`、`getAddressPort`（IPv4/IPv6 选择） |
| [client/serviceregistration/checks/result.go](file:///d:/claude/nomad/client/serviceregistration/checks/result.go) | Check 地址模式 |

### 17.6 驱动

| 文件 | 关键内容 |
|------|---------|
| [drivers/docker/driver.go](file:///d:/claude/nomad/drivers/docker/driver.go) | `ipv4_address`/`ipv6_address` IPAM、`advertise_ipv6_address` |
| [drivers/docker/config.go](file:///d:/claude/nomad/drivers/docker/config.go) | Docker 驱动配置 HCL spec |

### 17.7 DNS / 环境变量

| 文件 | 关键内容 |
|------|---------|
| [lib/resolvconf/lib.go](file:///d:/claude/nomad/lib/resolvconf/lib.go) | IPv4/IPv6 nameserver 过滤、默认 NS |
| [client/taskenv/env.go](file:///d:/claude/nomad/client/taskenv/env.go) | `NOMAD_IPv4_`/`NOMAD_IPv6_` 前缀 |

### 17.8 Consul / Connect

| 文件 | 关键内容 |
|------|---------|
| [command/agent/consul/connect.go](file:///d:/claude/nomad/command/agent/consul/connect.go) | `connectProxyBindAddress`（IPv6 → `::`） |
| [command/agent/consul/service_client.go](file:///d:/claude/nomad/command/agent/consul/service_client.go) | `lan_ipv4`/`wan_ipv4`/`lan_ipv6`/`wan_ipv6` tagged addresses |

### 17.9 通信

| 文件 | 关键内容 |
|------|---------|
| [client/rpc.go](file:///d:/claude/nomad/client/rpc.go) | `resolveServer`（IPv6 方括号兼容） |
| [command/agent/retry_join.go](file:///d:/claude/nomad/command/agent/retry_join.go) | `autoDiscover.Addrs`（支持 IPv6 zone index） |
| [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | `-preferred-address-family` CLI 参数 |

### 17.10 关键函数索引

| 函数 | 位置 | IPv4/IPv6 处理 |
|------|------|---------------|
| `NormalizeAddr` | [ipaddr.go:23](file:///d:/claude/nomad/helper/ipaddr/ipaddr.go#L23) | RFC 5952 IPv6 规范化 |
| `IsAny` | [ipaddr.go:11](file:///d:/claude/nomad/helper/ipaddr/ipaddr.go#L11) | 检测 `0.0.0.0` / `::` |
| `IsIPv6` | [structs.go:2977](file:///d:/claude/nomad/nomad/structs/structs.go#L2977) | `To4() == nil` 判断 |
| `createNetworkResources` | [network.go:280](file:///d:/claude/nomad/client/fingerprint/network.go#L280) | CIDR `/32` vs `/128` |
| `sortNetworkResources` | [network.go:403](file:///d:/claude/nomad/client/fingerprint/network.go#L403) | 按地址族排序 |
| `setStatus` | [networking_cni.go:459](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L459) | Address/AddressIPv6 分离 |
| `newIPTables` | [networking_iptables.go:23](file:///d:/claude/nomad/client/allocrunner/networking_iptables.go#L23) | iptables/ip6tables 选择 |
| `getAddressPort` | [address.go:181](file:///d:/claude/nomad/client/serviceregistration/address.go#L181) | `alloc` vs `alloc_ipv6` |
| `buildPortEnv` | [env.go:1003](file:///d:/claude/nomad/client/taskenv/env.go#L1003) | `NOMAD_IPv4_`/`NOMAD_IPv6_` 前缀 |
| `connectProxyBindAddress` | [connect.go:265](file:///d:/claude/nomad/command/agent/consul/connect.go#L265) | `0.0.0.0` vs `::` |
| `resolveServer` | [rpc.go:460](file:///d:/claude/nomad/client/rpc.go#L460) | IPv6 方括号兼容 |
| `TransformForLegacyNw` | [lib.go:231](file:///d:/claude/nomad/lib/resolvconf/lib.go#L231) | IPv6 nameserver 过滤 |
| `defaultNSAddrs` | [lib.go:473](file:///d:/claude/nomad/lib/resolvconf/lib.go#L473) | 条件添加 IPv6 NS |

---

**文档版本**: v1.0
**最后更新**: 2026-07-14
**适用 Nomad 版本**: 1.8.x
