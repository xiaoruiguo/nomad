# network.go 代码说明文档

> 文件路径：[fingerprint/network.go](file:///d:/claude/nomad/client/fingerprint/network.go)
> 总行数：426 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。

## 2. 类型定义

### NetworkFingerprint

**定义位置**：[L32](file:///d:/claude/nomad/client/fingerprint/network.go#L32)

**类型**：struct

```go
	StaticFingerprinter
	logger log.Logger
	interfaceDetector NetworkInterfaceDetector
```

**关联方法**（5 个）：`Reload`, `Fingerprint`, `createNodeNetworkResources`, `createNetworkResources`, `findInterface`

### NetworkInterfaceDetector

**定义位置**：[L44](file:///d:/claude/nomad/client/fingerprint/network.go#L44)

**类型**：interface

```go
	Interfaces
	InterfaceByName
	Addrs
```

### DefaultNetworkInterfaceDetector

**定义位置**：[L51](file:///d:/claude/nomad/client/fingerprint/network.go#L51)

**类型**：struct

**关联方法**（3 个）：`Interfaces`, `InterfaceByName`, `Addrs`

### LessFunc

**定义位置**：[L354](file:///d:/claude/nomad/client/fingerprint/network.go#L354)

**类型定义**：`func(...)`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `defaultNetworkSpeed` | `1000` |
| `networkDisallowLinkLocalOption` | `"fingerprint.network.disallow_link_local"` |
| `networkDisallowLinkLocalDefault` | `false` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Reload` | `f *NetworkFingerprint` | - | - | [L39](file:///d:/claude/nomad/client/fingerprint/network.go#L39) |
| `Interfaces` | `b *DefaultNetworkInterfaceDetector` | - | `[]net.Interface, error` | [L54](file:///d:/claude/nomad/client/fingerprint/network.go#L54) |
| `InterfaceByName` | `b *DefaultNetworkInterfaceDetector` | `name string` | `*net.Interface, error` | [L58](file:///d:/claude/nomad/client/fingerprint/network.go#L58) |
| `Addrs` | `b *DefaultNetworkInterfaceDetector` | `intf *net.Interface` | `[]net.Addr, error` | [L62](file:///d:/claude/nomad/client/fingerprint/network.go#L62) |
| `NewNetworkFingerprint` | - | `logger log.Logger` | `Fingerprint` | [L68](file:///d:/claude/nomad/client/fingerprint/network.go#L68) |
| `Fingerprint` | `f *NetworkFingerprint` | `req *FingerprintRequest, resp *FingerprintResponse` | `error` | [L73](file:///d:/claude/nomad/client/fingerprint/network.go#L73) |
| `createNodeNetworkResources` | `f *NetworkFingerprint` | `ifaces []net.Interface, disallowLinkLocal bool, conf *config.Config` | `[]*structs.NodeNetworkResource, error` | [L140](file:///d:/claude/nomad/client/fingerprint/network.go#L140) |
| `deriveAddressAliases` | - | `iface net.Interface, addr net.IP, config *config.Config` | `aliases []string` | [L221](file:///d:/claude/nomad/client/fingerprint/network.go#L221) |
| `createNetworkResources` | `f *NetworkFingerprint` | `throughput int, intf *net.Interface, disallowLinkLocal bool, preferredAF str...` | `[]*structs.NetworkResource, error` | [L271](file:///d:/claude/nomad/client/fingerprint/network.go#L271) |
| `findInterface` | `f *NetworkFingerprint` | `deviceName string` | `*net.Interface, error` | [L332](file:///d:/claude/nomad/client/fingerprint/network.go#L332) |
| `sortResources` | - | `res []T, less LessFunc[T]` | - | [L357](file:///d:/claude/nomad/client/fingerprint/network.go#L357) |
| `lessNetworkResourceIPv4` | - | `a *structs.NetworkResource, b *structs.NetworkResource` | `bool` | [L364](file:///d:/claude/nomad/client/fingerprint/network.go#L364) |
| `lessNetworkResourceIPv6` | - | `a *structs.NetworkResource, b *structs.NetworkResource` | `bool` | [L368](file:///d:/claude/nomad/client/fingerprint/network.go#L368) |
| `lessNodeNetworkResourceIPv4` | - | `a *structs.NodeNetworkResource, b *structs.NodeNetworkResource` | `bool` | [L372](file:///d:/claude/nomad/client/fingerprint/network.go#L372) |
| `lessNodeNetworkResourceIPv6` | - | `a *structs.NodeNetworkResource, b *structs.NodeNetworkResource` | `bool` | [L385](file:///d:/claude/nomad/client/fingerprint/network.go#L385) |
| `lessNodeNetworkAddressIPv4` | - | `a structs.NodeNetworkAddress, b structs.NodeNetworkAddress` | `bool` | [L394](file:///d:/claude/nomad/client/fingerprint/network.go#L394) |
| `lessNodeNetworkAddressIPv6` | - | `a structs.NodeNetworkAddress, b structs.NodeNetworkAddress` | `bool` | [L398](file:///d:/claude/nomad/client/fingerprint/network.go#L398) |
| `sortNetworkResources` | - | `res []*structs.NetworkResource, preferredAF structs.NodeNetworkAF` | - | [L403](file:///d:/claude/nomad/client/fingerprint/network.go#L403) |
| `sortNodeNetworkResources` | - | `res []*structs.NodeNetworkResource, preferredAF structs.NodeNetworkAF` | - | [L411](file:///d:/claude/nomad/client/fingerprint/network.go#L411) |
| `sortNodeNetworkAddresses` | - | `res []structs.NodeNetworkAddress, preferredAF structs.NodeNetworkAF` | - | [L419](file:///d:/claude/nomad/client/fingerprint/network.go#L419) |

## 5. 核心方法详解

### Fingerprint()

**签名**：`func (f *NetworkFingerprint) Fingerprint(req *FingerprintRequest, resp *FingerprintResponse) error`

**位置**：[L73](file:///d:/claude/nomad/client/fingerprint/network.go#L73)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `net` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/client/config` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-sockaddr` | 第三方库 |
| `github.com/hashicorp/go-sockaddr/template` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [network_test.go](file:///d:/claude/nomad/client/fingerprint/network_test.go) | 对应测试文件 |

