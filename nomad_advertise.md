# Nomad Advertise Address 分析

> 本文档分析 Nomad 中 advertise address 的设计、实现、IPv4/IPv6 处理及相关代码。
> 基于 Nomad 1.8.x 源码。

---

## 目录

1. 概念与作用
2. 三层地址体系
3. 数据结构定义
4. 归一化流程
5. IPv4 / IPv6 处理
6. Advertise 地址校验
7. Advertise 地址使用场景
8. 服务注册中的 Address
9. 客户端解析 Server Advertise 地址
10. 配置示例（IPv4 / IPv6）
11. 常见问题与最佳实践
12. 代码文件索引

---

## 1. 概念与作用

### 1.1 什么是 Advertise Address

Advertise address（广告地址）是节点向集群中其他成员**声明**自己可被访问的地址。与 bind address（绑定地址，决定实际监听的网络接口）不同，advertise address 决定的是**其他节点如何找到我**。

在 NAT、公网/私网映射、多网卡等场景下，bind 与 advertise 必须分离：
- bind 决定"我在哪个接口收包"
- advertise 决定"别人应该把包发到哪里"

### 1.2 三类 Advertise 地址

Nomad 有三个协议需要 advertise：

| 协议 | 默认端口 | 用途 |
|------|---------|------|
| HTTP | 4646 | REST API、Web UI、CLI 交互 |
| RPC  | 4647 | Client↔Server、Server↔Server 通信（msgpack-rpc / Yamux） |
| Serf | 4648 | Gossip 成员发现、故障检测（TCP+UDP） |

---

## 2. 三层地址体系

### 2.1 配置块总览

Nomad agent 配置文件中有三组相关配置：

| 配置块 | 结构 | 含义 |
|-------|------|------|
| 顶层 `bind_addr` | string | 全局默认绑定地址，默认 `0.0.0.0` |
| `addresses {}` | `Addresses{HTTP, RPC, Serf}` | 各协议实际**绑定**地址（覆盖 `bind_addr`） |
| `advertise {}` | `AdvertiseAddrs{HTTP, RPC, Serf}` | 各协议**广告**地址（不参与监听） |
| 内部 `normalizedAddrs` | `NormalizedAddrs{HTTP[], RPC, Serf}` | 解析后的 `host:port`，HTTP 支持多绑定 |

### 2.2 优先级

对每个协议（HTTP/RPC/Serf）：

1. **bind 地址**：`addresses.<proto>` → 顶层 `bind_addr` → 默认 `0.0.0.0`
2. **advertise 地址**：`advertise.<proto>` → bind 地址（若可广告）→ 主机名解析 → `GetPrivateIP` 兜底

关键文件：[command/agent/config.go:2348-2410](file:///d:/claude/nomad/command/agent/config.go#L2348-L2410)

---

## 3. 数据结构定义

### 3.1 AdvertiseAddrs 结构

[command/agent/config.go:1640-1656](file:///d:/claude/nomad/command/agent/config.go#L1640-L1656)：

```go
// AdvertiseAddrs is used to control the addresses we advertise out for
// different network services. All are optional and default to BindAddr and
// their default Port.
type AdvertiseAddrs struct {
    HTTP string `hcl:"http"`
    RPC  string `hcl:"rpc"`
    Serf string `hcl:"serf"`
    // ExtraKeysHCL is used by hcl to surface unexpected keys
    ExtraKeysHCL []string `hcl:",unusedKeys" json:"-"`
}
```

### 3.2 Addresses（bind）结构

[command/agent/config.go:1603-1614](file:///d:/claude/nomad/command/agent/config.go#L1603-L1614)：

```go
// Addresses encapsulates all of the addresses we bind to for various
// network services. Everything is optional and defaults to BindAddr.
type Addresses struct {
    HTTP string `hcl:"http"`
    RPC  string `hcl:"rpc"`
    Serf string `hcl:"serf"`
    ExtraKeysHCL []string `hcl:",unusedKeys" json:"-"`
}
```

### 3.3 NormalizedAddrs（内部解析结果）

[command/agent/config.go:1623-1632](file:///d:/claude/nomad/command/agent/config.go#L1623-L1632)：

```go
// NormalizedAddrs is used to control the addresses we advertise out for
// different network services. All are optional and default to BindAddr and
// their default Port.
type NormalizedAddrs struct {
    HTTP []string  // HTTP 支持多绑定（空格分隔）
    RPC  string
    Serf string
}
```

注意：HTTP 是 `[]string`，因为 HTTP 支持同时绑定多个地址；RPC/Serf 只能单地址。

### 3.4 Server 内部字段

[nomad/server.go:164-170](file:///d:/claude/nomad/nomad/server.go#L164-L170)：

```go
// clientRpcAdvertise is the advertised RPC address for Nomad clients to connect
clientRpcAdvertise net.Addr

// serverRpcAdvertise is the advertised RPC address for Nomad servers to connect
serverRpcAdvertise net.Addr
```

- `clientRpcAdvertise`：Client 拨号 Server 时使用的地址（来自 RPC listener 的实际地址或配置）
- `serverRpcAdvertise`：Server 间相互 RPC 通信的地址（默认 Serf advertise IP + RPC port）

---

## 4. 归一化流程

### 4.1 normalizeAddrs 主流程

[command/agent/config.go:2348-2418](file:///d:/claude/nomad/command/agent/config.go#L2348-L2418)：

```go
func (c *Config) normalizeAddrs() error {
    // 1. 归一化 bind_addr（顶层）
    c.BindAddr = ipaddr.NormalizeAddr(c.BindAddr)

    // 2. 归一化各协议 bind 地址（HTTP 支持多地址）
    httpAddrs, err := normalizeMultipleBind(c.Addresses.HTTP, c.BindAddr)
    c.Addresses.HTTP = strings.Join(httpAddrs, " ")

    addr, err := normalizeBind(c.Addresses.RPC, c.BindAddr)
    c.Addresses.RPC = addr

    addr, err = normalizeBind(c.Addresses.Serf, c.BindAddr)
    c.Addresses.Serf = addr

    // 3. 构造 normalizedAddrs（host:port 形式）
    c.normalizedAddrs = &NormalizedAddrs{
        RPC:  normalizeAddrWithPort(c.Addresses.RPC, c.Ports.RPC),
        Serf: normalizeAddrWithPort(c.Addresses.Serf, c.Ports.Serf),
    }
    c.normalizedAddrs.HTTP = make([]string, len(httpAddrs))
    for i, addr := range httpAddrs {
        c.normalizedAddrs.HTTP[i] = normalizeAddrWithPort(addr, c.Ports.HTTP)
    }

    // 4. 归一化 advertise 地址（核心）
    addr, err = normalizeAdvertise(c.AdvertiseAddrs.HTTP, httpAddrs[0], c.Ports.HTTP, c.DevMode)
    c.AdvertiseAddrs.HTTP = addr

    addr, err = normalizeAdvertise(c.AdvertiseAddrs.RPC, c.Addresses.RPC, c.Ports.RPC, c.DevMode)
    c.AdvertiseAddrs.RPC = addr

    // Serf 仅在 Server 启用时归一化
    if c.Server != nil && c.Server.Enabled {
        addr, err = normalizeAdvertise(c.AdvertiseAddrs.Serf, c.Addresses.Serf, c.Ports.Serf, c.DevMode)
        c.AdvertiseAddrs.Serf = addr
    }

    return nil
}
```

### 4.2 normalizeAdvertise 核心函数

[command/agent/config.go:2497-2557](file:///d:/claude/nomad/command/agent/config.go#L2497-L2557)：

```go
// normalizeAdvertise returns a normalized advertise address.
//
// If addr is set, it is used and the default port is appended if no port is set.
// If addr is not set and bind is a valid address, the returned string is the bind+port.
// If addr is not set and bind is not a valid advertise address, the hostname
// is resolved and returned with the port.
//
// Loopback is only considered a valid advertise address in dev mode.
func normalizeAdvertise(addr string, bind string, defport int, dev bool) (string, error) {
    // 1. 解析 go-sockaddr 模板（如 {{ GetInterfaceIP "eth0" }}）
    addr, err := listenerutil.ParseSingleIPTemplate(addr)
    if err != nil {
        return "", fmt.Errorf("Error parsing advertise address template: %v", err)
    }

    // 2. 如果用户显式配置了 advertise，直接使用
    if addr != "" {
        _, _, err = net.SplitHostPort(addr)
        if err != nil {
            if !isMissingPort(err) && !isTooManyColons(err) {
                return "", fmt.Errorf("Error parsing advertise address %q: %v", addr, err)
            }
            // 缺少端口，追加默认端口
            return normalizeAddrWithPort(addr, defport), nil
        }
        return ipaddr.NormalizeAddr(addr), nil
    }

    // 3. 未配置 advertise，回退到 bind 地址
    ips, err := net.LookupIP(bind)
    if err != nil {
        return "", fmt.Errorf("Error resolving bind address %q: %v", bind, err)
    }

    // 4. 遍历解析结果，返回第一个可广告的地址
    for _, ip := range ips {
        if ip.IsLinkLocalUnicast() || ip.IsGlobalUnicast() {
            // 链路本地或全局单播地址可直接广告
            return normalizeAddrWithPort(ip.String(), defport), nil
        }
        if ip.IsLoopback() {
            if dev {
                // dev 模式下 loopback 可用
                return normalizeAddrWithPort(ip.String(), defport), nil
            }
            return "", fmt.Errorf("Defaulting advertise to localhost is unsafe, please set advertise manually")
        }
    }

    // 5. bind 不是合法广告地址，使用 GetPrivateIP 兜底
    addr, err = listenerutil.ParseSingleIPTemplate("{{ GetPrivateIP }}")
    if err != nil {
        return "", fmt.Errorf("Unable to parse default advertise address: %v", err)
    }
    return normalizeAddrWithPort(addr, defport), nil
}
```

#### 决策流程图

```
用户配置了 advertise.<proto>?
├── 是 → 解析模板 → 有端口? → NormalizeAddr 返回
│                    └── 无端口 → 追加默认端口 → NormalizeAddr 返回
└── 否 → LookupIP(bind)
         ├── 找到 IsLinkLocalUnicast / IsGlobalUnicast → 返回 ip:port
         ├── 找到 IsLoopback
         │   ├── dev 模式 → 返回 127.0.0.1:port
         │   └── 非 dev → 报错（unsafe）
         └── 无可用地址 → GetPrivateIP 兜底 → 返回
```

### 4.3 normalizeAddrWithPort

[command/agent/config.go:2469-2471](file:///d:/claude/nomad/command/agent/config.go#L2469-L2471)：

```go
// normalizeAddrWithPort assumes that addr does not contain a port,
// normalizes it per ipv6 RFC-5942 §4, and appends ":{port}".
func normalizeAddrWithPort(addr string, port int) string {
    return ipaddr.NormalizeAddr(net.JoinHostPort(addr, strconv.Itoa(port)))
}
```

关键点：使用 `net.JoinHostPort`，它会对 IPv6 地址自动加方括号（RFC 5952 §6），例如：
- IPv4: `10.0.1.11` + `4647` → `10.0.1.11:4647`
- IPv6: `2001:db8::1` + `4647` → `[2001:db8::1]:4647`

---

## 5. IPv4 / IPv6 处理

### 5.1 RFC 合规性

Nomad 的地址归一化遵循以下 RFC：

| RFC | 标题 | 用途 |
|-----|------|------|
| RFC 3986 | URI 通用语法 | URL 中的 IPv6 主机需方括号 |
| RFC 5942 §4 | IPv6 子网模型 | 地址文本表示一致性 |
| RFC 5952 | IPv6 文本表示规范 | 压缩、大小写、方括号规则 |

相关 changelog：[.changelog/25921.txt](file:///d:/claude/nomad/.changelog/25921.txt)

```
ipv6: bind and advertise addresses are now made to adhere to RFC-5942 §4
```

### 5.2 ipaddr.NormalizeAddr 实现

[helper/ipaddr/ipaddr.go:23-117](file:///d:/claude/nomad/helper/ipaddr/ipaddr.go#L23-L117)：

该函数处理 5 种输入格式：

1. **纯 Host**：`net.ParseIP(addr)` → `ip.String()`（RFC 5942 §4 合规）
2. **[Host]**：去掉方括号后解析，返回不带方括号的规范化 IP
3. **Host:Port**：`net.SplitHostPort` → 用 `net.JoinHostPort` 重组（自动处理 IPv6 方括号）
4. **URL**：`url.Parse` → 规范化 host → 重组 URL（IPv6 主机在 URL 中必须带方括号）
5. **Destination Address**（`user@host:port`）：分离 `@` 后递归处理

#### IPv6 规范化示例

| 输入 | 输出 | 说明 |
|------|------|------|
| `2001:0db8::0001` | `2001:db8::1` | 去前导零、压缩连续零段 |
| `[2001:0db8::0001]` | `2001:db8::1` | 去方括号 |
| `[2001:0db8::0001]:8500` | `[2001:db8::1]:8500` | 保留方括号 + 端口 |
| `2001:DB8:AC3:FE4::1` | `2001:db8:ac3:fe4::1` | 小写化 |
| `2001:0:0:1:0:0:0:1` | `2001:0:0:1::1` | 最长零段压缩 |
| `https://[2001:0db8::0001]:8200` | `https://[2001:db8::1]:8200` | URL 格式 |
| `username@[2001:0db8::0001]:8200` | `username@[2001:db8::1]:8200` | 目标地址格式 |

### 5.3 IsAny 检测

[helper/ipaddr/ipaddr.go:11-19](file:///d:/claude/nomad/helper/ipaddr/ipaddr.go#L11-L19)：

```go
// IsAny checks if the given IP address is an IPv4 or IPv6 ANY address.
func IsAny(ip string) bool {
    return isAnyV4(ip) || isAnyV6(ip)
}

func isAnyV4(ip string) bool { return ip == "0.0.0.0" }
func isAnyV6(ip string) bool { return ip == "::" || ip == "[::]" }
```

用于检测 `0.0.0.0`（IPv4 ANY）和 `::` / `[::]`（IPv6 ANY）。

### 5.4 IPv6 测试用例

[command/agent/config_test.go:971-995](file:///d:/claude/nomad/command/agent/config_test.go#L971-L995)：

```go
func TestConfig_normalizeAddrs_IPv6(t *testing.T) {
    c := &Config{
        Addresses: &Addresses{},
        BindAddr: "0:0::1F",                       // 非规范 IPv6
        Ports: &Ports{HTTP: 4646, RPC: 4647},
        AdvertiseAddrs: &AdvertiseAddrs{
            HTTP: "[A110::0:0:C8]:8080",           // 带方括号、大写、端口
            RPC:  "0:00FA:0:0:0::CE",              // 非规范、无端口
        },
        DevMode: false,
    }
    must.NoError(t, c.normalizeAddrs())

    // bind 被规范化
    test.Eq(t, "::1f", c.Addresses.HTTP)          // 0:0::1F → ::1f
    test.Eq(t, "::1f", c.Addresses.RPC)

    // normalized 带端口 + 方括号
    test.Eq(t, []string{"[::1f]:4646"}, c.normalizedAddrs.HTTP)
    test.Eq(t, "[::1f]:4647", c.normalizedAddrs.RPC)

    // advertise 被规范化
    test.Eq(t, "[a110::c8]:8080", c.AdvertiseAddrs.HTTP)  // 小写、压缩
    test.Eq(t, "[0:fa::ce]:4647", c.AdvertiseAddrs.RPC)   // 追加默认端口
}
```

#### 手动配置 IPv6 loopback 测试

[command/agent/config_test.go:934-967](file:///d:/claude/nomad/command/agent/config_test.go#L934-L967)：

```go
c := &Config{
    BindAddr: "::1",                                // IPv6 loopback
    AdvertiseAddrs: &AdvertiseAddrs{
        HTTP: "::1",
        RPC:  "::1",
    },
}
c.normalizeAddrs()
// 结果：
// c.Addresses.HTTP == "::1"
// c.AdvertiseAddrs.HTTP == "[::1]:4646"  (自动加方括号和端口)
// c.AdvertiseAddrs.RPC  == "[::1]:4647"
```

---

## 6. Advertise 地址校验

### 6.1 Server 启动时校验

[nomad/server.go:1216-1259](file:///d:/claude/nomad/nomad/server.go#L1216-L1259)：

```go
// Client RPC advertise 校验
clientAddr, ok := s.clientRpcAdvertise.(*net.TCPAddr)
if !ok {
    return fmt.Errorf("Client RPC advertise address is not a TCP Address: %v", clientAddr)
}
if clientAddr.IP.IsUnspecified() {
    return fmt.Errorf("Client RPC advertise address is not advertisable: %v", clientAddr)
}

// Server RPC advertise 校验
serverAddr, ok := s.serverRpcAdvertise.(*net.TCPAddr)
if !ok {
    return fmt.Errorf("Server RPC advertise address is not a TCP Address: %v", serverAddr)
}
if serverAddr.IP.IsUnspecified() {
    return fmt.Errorf("Server RPC advertise address is not advertisable: %v", serverAddr)
}
```

**关键约束**：advertise 地址**不能是 unspecified**（`0.0.0.0` 或 `::`），否则 Server 拒绝启动。

### 6.2 serverRpcAdvertise 默认推导

[nomad/server.go:1233-1248](file:///d:/claude/nomad/nomad/server.go#L1233-L1248)：

```go
if s.config.ServerRPCAdvertise != nil {
    s.serverRpcAdvertise = s.config.ServerRPCAdvertise
} else {
    // Default to the Serf Advertise + RPC Port
    serfIP := s.config.SerfConfig.MemberlistConfig.AdvertiseAddr
    if serfIP == "" {
        serfIP = s.config.SerfConfig.MemberlistConfig.BindAddr
    }
    addr := net.JoinHostPort(serfIP, fmt.Sprintf("%d", clientAddr.Port))
    resolved, err := net.ResolveTCPAddr("tcp", addr)
    s.serverRpcAdvertise = resolved
}
```

Server 间 RPC 地址默认 = **Serf advertise IP + RPC port**（因为 Serf 和 RPC 通常在同一接口）。

### 6.3 agent.go 中的地址解析

[command/agent/agent.go:410-431](file:///d:/claude/nomad/command/agent/agent.go#L410-L431)：

```go
// Set up the advertise addresses
rpcAddr, err = net.ResolveTCPAddr("tcp", agentConfig.AdvertiseAddrs.RPC)
if err != nil {
    return nil, fmt.Errorf("Failed to parse RPC advertise address %q: %v", agentConfig.AdvertiseAddrs.RPC, err)
}
serfAddr, err = net.ResolveTCPAddr("tcp", agentConfig.AdvertiseAddrs.Serf)
if err != nil {
    return nil, fmt.Errorf("Failed to parse Serf advertise address %q: %v", agentConfig.AdvertiseAddrs.Serf, err)
}

// Server address = serf advertise IP + rpc port
serverAddr, err := net.ResolveTCPAddr("tcp",
    net.JoinHostPort(serfAddr.IP.String(), fmt.Sprintf("%d", rpcAddr.Port)))

conf.SerfConfig.MemberlistConfig.AdvertiseAddr = serfAddr.IP.String()
conf.SerfConfig.MemberlistConfig.AdvertisePort = serfAddr.Port
conf.ClientRPCAdvertise = rpcAddr
conf.ServerRPCAdvertise = serverAddr
```

注意 `net.JoinHostPort` 对 IPv6 自动加方括号，确保 Serf 能正确解析。

---

## 7. Advertise 地址使用场景

### 7.1 Client 节点注册

[command/agent/agent.go:1015-1016](file:///d:/claude/nomad/command/agent/agent.go#L1015-L1016)：

```go
// Set up the HTTP advertise address
conf.Node.HTTPAddr = agentConfig.AdvertiseAddrs.HTTP
```

Client 启动时把 HTTP advertise 地址写入 `Node.HTTPAddr`，Server 通过此地址访问 Client 的 HTTP API（如流式日志 `/v1/client/fs/logs`）。

### 7.2 Server 间 RPC 寻址

[nomad/server.go:1749-1750](file:///d:/claude/nomad/nomad/server.go#L1749-L1750)：

```go
conf.Tags["rpc_addr"] = s.clientRpcAdvertise.(*net.TCPAddr).IP.String()
conf.Tags["port"] = fmt.Sprintf("%d", s.serverRpcAdvertise.(*net.TCPAddr).Port)
```

Server 通过 Serf gossip 把自己的 RPC advertise 地址广播给其他 Server，其他 Server 据此建立 RPC 连接。

### 7.3 Server 反向 RPC（Server→Client）

Server 用 `clientRpcAdvertise` 通知 Client 拨号目标。Client 主动建立 Yamux session 后，Server 通过该 session 反向调用 Client 的 RPC 方法。

### 7.4 Consul 服务注册

[command/agent/agent.go:1207-1245](file:///d:/claude/nomad/command/agent/agent.go#L1207-L1245)：

当 `consul { auto_advertise = true }` 时，Server 注册 3 个服务到 Consul：

| 服务 Tag | 地址来源 | Check |
|---------|---------|-------|
| `http` | `AdvertiseAddrs.HTTP` | HTTP `/v1/agent/health` |
| `rpc`  | `AdvertiseAddrs.RPC`  | TCP 探测 |
| `serf` | `AdvertiseAddrs.Serf` | TCP 探测 |

Client 仅注册 `http` 服务：[command/agent/agent.go:1408-1418](file:///d:/claude/nomad/command/agent/agent.go#L1408-L1418)。

### 7.5 Client 连接 Server 列表

[command/agent/agent.go:800-817](file:///d:/claude/nomad/command/agent/agent.go#L800-L817)：

```go
// If we are running a server, append both its bind and advertise address so
// that the client can connect to itself.
if a.config.Server != nil && a.config.Server.Enabled {
    advertised := a.config.AdvertiseAddrs
    normalized := a.config.normalizedAddrs
    if advertised == nil || advertised.RPC == "" {
        return fmt.Errorf("AdvertiseAddrs is nil or empty")
    }
    if normalized.RPC == advertised.RPC {
        c.Servers = append(c.Servers, normalized.RPC)
    } else {
        c.Servers = append(c.Servers, normalized.RPC, advertised.RPC)
    }
}
```

Server+Client 合一节点会把 bind 和 advertise 地址都加入 Server 列表，确保本机 Client 能连本机 Server。

---

## 8. 服务注册中的 Address

### 8.1 Service.Address 字段

[nomad/structs/services.go:605-607](file:///d:/claude/nomad/nomad/structs/services.go#L605-L607)：

```go
// Address enables explicitly setting a custom address to use in service
// registration. AddressMode must be "auto" if Address is set.
Address string
```

作业的 `service` 块可设置 `address` 字段，用于在服务注册时覆盖 advertise 地址（例如 EC2 公网 IP）。

### 8.2 AddressMode 模式

[nomad/structs/services.go:565-569](file:///d:/claude/nomad/nomad/structs/services.go#L565-L569)：

```go
AddressModeAuto      = "auto"
AddressModeHost      = "host"
AddressModeDriver    = "driver"
AddressModeAlloc     = "alloc"
AddressModeAllocIPv6 = "alloc_ipv6"
```

| 模式 | 含义 | IPv4/IPv6 |
|------|------|-----------|
| `auto` | 默认，优先用自定义 address，否则 driver 或 host | 取决于配置 |
| `host` | 使用宿主机 IP | IPv4 |
| `driver` | 使用驱动网络 IP（如 Docker bridge） | IPv4 |
| `alloc` | 使用 allocation 网络的 IPv4 地址 | IPv4 |
| `alloc_ipv6` | 使用 allocation 网络的 IPv6 地址 | **IPv6** |

### 8.3 getAddressPort IPv6 处理

[client/serviceregistration/address.go:180-186](file:///d:/claude/nomad/client/serviceregistration/address.go#L180-L186)：

```go
// getAddressPort is a helper function to return the IPv6 or IPv4 address based on the addressMode
func getAddressPort(addressMode string, netStatus *structs.AllocNetworkStatus, port int) (string, int, error) {
    if addressMode == structs.AddressModeAllocIPv6 {
        return netStatus.AddressIPv6, port, nil
    }
    return netStatus.Address, port, nil
}
```

`AllocNetworkStatus` 结构包含两个地址字段：

[api/allocations.go:419-427](file:///d:/claude/nomad/api/allocations.go#L419-L427)：

```go
type AllocNetworkStatus struct {
    InterfaceName string
    Address       string      // IPv4 地址
    AddressIPv6   string      // IPv6 地址
    DNS           *DNSConfig
}
```

### 8.4 自定义 address 与端口映射

[client/serviceregistration/address.go:30-60](file:///d:/claude/nomad/client/serviceregistration/address.go#L30-L60)：

当 `address_mode = "auto"` 且设置了自定义 `address` 时：
- 无 port_label：直接返回自定义 address
- 有 port_label 且是端口映射：返回 `address:port.Value`（忽略映射的 IP，用户需自行路由，如 EC2 公网 IP）
- 有 port_label 且是数字：返回 `address:数字`

---

## 9. 客户端解析 Server Advertise 地址

### 9.1 resolveServer 函数

[client/rpc.go:460-497](file:///d:/claude/nomad/client/rpc.go#L460-L497)：

```go
func resolveServer(s string) (net.Addr, error) {
    const defaultClientPort = "4647"

    host, port, err := net.SplitHostPort(s)
    if err != nil {
        switch {
        case strings.Contains(err.Error(), "missing port"):
            // 缺少端口，追加默认端口
            return resolveServer(s + ":" + defaultClientPort)

        case strings.Contains(err.Error(), "too many colons"):
            // IPv6 地址未加方括号导致歧义
            ip := net.ParseIP(s)
            if ip.To4() == nil && ip.To16() != nil {
                if !strings.HasPrefix(s, "[") {
                    // 自动加方括号重试
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

#### IPv6 兼容性处理

该函数处理 3 种 IPv6 边界情况：

1. **缺少端口**：`2001:db8::1` → 追加 `:4647` → 但 `2001:db8::1:4647` 歧义 → 进入下一轮
2. **太多冒号**：`2001:db8::1:4647`（无法区分地址和端口）→ 检测为 IPv6 → 自动加方括号 `[2001:db8::1]:4647`
3. **空端口**：`[2001:db8::1]:` → 追加默认端口

**要求**：IPv6 地址字符串应符合 RFC 5952，因为端口号（4 位数字）与 IPv6 段（16 位）大小相同，无法歧义消除。

### 9.2 Client 使用 advertise 地址

[client/client.go:2349-2353](file:///d:/claude/nomad/client/client.go#L2349-L2353)：

```go
for _, s := range resp.Servers {
    addr, err := resolveServer(s.RPCAdvertiseAddr)
    if err != nil {
        c.logger.Warn("ignoring invalid server", "error", err, "server", s.RPCAdvertiseAddr)
        continue
    }
    e := &servers.Server{Addr: addr}
    nomadServers = append(nomadServers, e)
}
```

Client 从 Server 获取的 `NodeServerInfo.RPCAdvertiseAddr` 列表中解析出可用的 Server 地址。

---

## 10. 配置示例

### 10.1 IPv4 基础配置

```hcl
# server.hcl (IPv4)
bind_addr = "0.0.0.0"

addresses {
  http = "10.0.1.11"
  rpc  = "10.0.1.11"
  serf = "10.0.1.11"
}

advertise {
  http = "10.0.1.11:4646"
  rpc  = "10.0.1.11:4647"
  serf = "10.0.1.11:4648"
}
```

### 10.2 IPv6 配置

```hcl
# server.hcl (IPv6)
bind_addr = "::"

addresses {
  http = "2001:db8::11"
  rpc  = "2001:db8::11"
  serf = "2001:db8::11"
}

advertise {
  http = "2001:db8::11"     # 自动归一化为 [2001:db8::11]:4646
  rpc  = "[2001:db8::11]:4647"
  serf = "[2001:db8::11]:4648"
}
```

### 10.3 双栈配置（IPv4 + IPv6）

```hcl
# HTTP 支持多地址绑定（空格分隔）
bind_addr = "0.0.0.0"

addresses {
  # HTTP 同时监听 IPv4 和 IPv6
  http = "10.0.1.11 2001:db8::11"
  rpc  = "10.0.1.11"        # RPC/Serf 只能单地址
  serf = "10.0.1.11"
}

advertise {
  http = "10.0.1.11:4646"   # advertise 只能单地址
  rpc  = "10.0.1.11:4647"
  serf = "10.0.1.11:4648"
}
```

### 10.4 NAT/公网映射配置

```hcl
# 内网 bind，公网 advertise（如 AWS EC2）
bind_addr = "10.0.1.11"

addresses {
  http = "10.0.1.11"
  rpc  = "10.0.1.11"
  serf = "10.0.1.11"
}

advertise {
  http = "203.0.113.11:4646"   # 公网 IP
  rpc  = "203.0.113.11:4647"
  serf = "203.0.113.11:4648"
}
```

### 10.5 使用 go-sockaddr 模板

```hcl
# 自动选择私有 IP
advertise {
  http = "{{ GetPrivateIP }}:4646"
  rpc  = "{{ GetPrivateIP }}:4647"
  serf = "{{ GetPrivateIP }}:4648"
}

# 指定网卡
advertise {
  http = "{{ GetInterfaceIP \"eth0\" }}:4646"
  rpc  = "{{ GetInterfaceIP \"eth0\" }}:4647"
  serf = "{{ GetInterfaceIP \"eth0\" }}:4648"
}

# IPv6 网卡
advertise {
  http = "{{ GetInterfaceIP \"eth0\" }}:4646"
  rpc  = "{{ GetInterfaceIP \"eth0\" }}:4647"
  serf = "{{ GetInterfaceIP \"eth0\" }}:4648"
}
```

### 10.6 作业中服务注册的 address

```hcl
job "webapp" {
  group "web" {
    network {
      port "http" { to = 8080 }
    }

    service {
      name = "webapp"
      port = "http"

      # 方式 1：使用宿主机 IPv4（默认）
      address_mode = "host"

      # 方式 2：使用 allocation IPv4
      # address_mode = "alloc"

      # 方式 3：使用 allocation IPv6
      # address_mode = "alloc_ipv6"

      # 方式 4：自定义地址（需 address_mode = "auto"）
      # address_mode = "auto"
      # address      = "203.0.113.50"   # 如 EC2 公网 IP
    }
  }
}
```

---

## 11. 常见问题与最佳实践

### 11.1 常见错误

#### 错误 1：advertise 地址为 0.0.0.0

```
Error: Server RPC advertise address is not advertisable: 0.0.0.0:4647
```

**原因**：未设置 advertise，且 bind 为 `0.0.0.0`，无法推导出可广告地址。
**解决**：显式设置 `advertise { rpc = "10.0.1.11:4647" }`。

#### 错误 2：默认广告到 localhost

```
Error: Defaulting advertise to localhost is unsafe, please set advertise manually
```

**原因**：bind 为 `127.0.0.1` 或 `::1`，非 dev 模式下拒绝自动广告 loopback。
**解决**：设置 `bind_addr` 为非 loopback 地址，或显式配置 advertise。

#### 错误 3：IPv6 地址格式错误

```
Error: Error parsing advertise address "2001:db8::1:4647": too many colons
```

**原因**：IPv6 + 端口未加方括号，无法区分。
**解决**：使用 `[2001:db8::1]:4647` 格式，或仅写 IP 让 Nomad 追加端口。

### 11.2 最佳实践

1. **生产环境必须显式设置 advertise**：不要依赖自动推导，避免多网卡环境选错地址。

2. **IPv6 地址遵循 RFC 5952**：小写、压缩连续零段、带端口时加方括号。Nomad 会自动归一化，但输入规范可减少歧义。

3. **bind 与 advertise 分离**：NAT 环境下 bind 用内网 IP，advertise 用公网 IP。

4. **HTTP 多绑定**：HTTP 支持空格分隔多地址（`addresses.http = "10.0.1.11 2001:db8::11"`），但 advertise 只能单地址。

5. **Serf advertise 必须可达**：Serf gossip 依赖 advertise 地址传播成员信息，不可达会导致节点被标记为 failed。

6. **使用 go-sockaddr 模板**：`{{ GetPrivateIP }}` 或 `{{ GetInterfaceIP "eth0" }}` 可自动选择地址，适合自动化部署。

7. **IPv6 服务注册**：使用 `address_mode = "alloc_ipv6"` 注册 IPv6 服务地址，确保 Consul/Nomad 服务发现返回正确的地址族。

---

## 12. 代码文件索引

### 12.1 核心文件

| 文件 | 关键内容 |
|------|---------|
| [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | `AdvertiseAddrs` 结构、`normalizeAddrs`、`normalizeAdvertise`、`normalizeAddrWithPort` |
| [helper/ipaddr/ipaddr.go](file:///d:/claude/nomad/helper/ipaddr/ipaddr.go) | `NormalizeAddr`（RFC 5942/5952 合规）、`IsAny` |
| [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | advertise 地址解析为 `net.Addr`、Consul 服务注册、Node.HTTPAddr 设置 |
| [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | `clientRpcAdvertise`/`serverRpcAdvertise` 校验与推导、Serf Tags |
| [client/rpc.go](file:///d:/claude/nomad/client/rpc.go) | `resolveServer`（IPv6 兼容解析） |
| [client/client.go](file:///d:/claude/nomad/client/client.go) | 从 Server 列表解析 advertise 地址 |

### 12.2 服务注册相关

| 文件 | 关键内容 |
|------|---------|
| [client/serviceregistration/address.go](file:///d:/claude/nomad/client/serviceregistration/address.go) | `GetAddress`（address_mode 处理）、`getAddressPort`（IPv4/IPv6 选择） |
| [nomad/structs/services.go](file:///d:/claude/nomad/nomad/structs/services.go) | `AddressMode*` 常量、`Service.Address` 字段、校验逻辑 |
| [api/services.go](file:///d:/claude/nomad/api/services.go) | API 层 `Service.Address`、`AddressMode` |
| [api/allocations.go](file:///d:/claude/nomad/api/allocations.go) | `AllocNetworkStatus.Address` / `AddressIPv6` |
| [nomad/structs/alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | `AllocNetworkStatus` 结构定义 |

### 12.3 测试文件

| 文件 | 关键内容 |
|------|---------|
| [command/agent/config_test.go](file:///d:/claude/nomad/command/agent/config_test.go) | `TestConfig_normalizeAddrs_IPv6`、IPv6 loopback 测试 |
| [helper/ipaddr/ipaddr_test.go](file:///d:/claude/nomad/helper/ipaddr/ipaddr_test.go) | `TestNormalizeAddr`（IPv4/IPv6 全覆盖）、`Test_IsAny` |
| [client/serviceregistration/address_test.go](file:///d:/claude/nomad/client/serviceregistration/address_test.go) | `Test_GetAddress`（各 address_mode 场景） |

### 12.4 关键函数索引

| 函数 | 位置 | 作用 |
|------|------|------|
| `normalizeAddrs` | [config.go:2348](file:///d:/claude/nomad/command/agent/config.go#L2348) | 归一化所有 bind/advertise 地址 |
| `normalizeAdvertise` | [config.go:2497](file:///d:/claude/nomad/command/agent/config.go#L2497) | 归一化单个 advertise 地址 |
| `normalizeAddrWithPort` | [config.go:2469](file:///d:/claude/nomad/command/agent/config.go#L2469) | IP + 端口组合（IPv6 自动加方括号） |
| `normalizeBind` | [config.go:2475](file:///d:/claude/nomad/command/agent/config.go#L2475) | 归一化 bind 地址 |
| `NormalizeAddr` | [ipaddr.go:23](file:///d:/claude/nomad/helper/ipaddr/ipaddr.go#L23) | RFC 5942/5952 合规归一化 |
| `IsAny` | [ipaddr.go:11](file:///d:/claude/nomad/helper/ipaddr/ipaddr.go#L11) | 检测 ANY 地址（0.0.0.0 / ::） |
| `resolveServer` | [rpc.go:460](file:///d:/claude/nomad/client/rpc.go#L460) | 解析 Server advertise 地址（IPv6 兼容） |
| `GetAddress` | [address.go:18](file:///d:/claude/nomad/client/serviceregistration/address.go#L18) | 服务注册地址解析 |
| `getAddressPort` | [address.go:181](file:///d:/claude/nomad/client/serviceregistration/address.go#L181) | IPv4/IPv6 地址选择 |
| `AdvertiseAddrs.Merge` | [config.go:3204](file:///d:/claude/nomad/command/agent/config.go#L3204) | 多配置文件合并 |

---

**文档版本**: v1.0
**最后更新**: 2026-07-14
**适用 Nomad 版本**: 1.8.x
