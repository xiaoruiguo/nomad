# network.go 代码说明文档

> 文件路径：[structs/network.go](file:///d:/claude/nomad/nomad/structs/network.go)
> 总行数：799 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### NetworkIndex

**定义位置**：[L45](file:///d:/claude/nomad/nomad/structs/network.go#L45)

**类型**：struct

```go
	TaskNetworks []*NetworkResource
	GroupNetworks []*NodeNetworkResource
	HostNetworks map[string][]NodeNetworkAddress
	UsedPorts map[string]Bitmap
	AvailBandwidth map[string]int
	UsedBandwidth map[string]int
	MinDynamicPort int
	MaxDynamicPort int
```

**关联方法**（11 个）：`getUsedPortsFor`, `Copy`, `Release`, `SetNode`, `AddAllocs`, `AddReserved`, `AddReservedPorts`, `AddReservedPortsForIP`, `yieldIP`, `AssignPorts`, `AssignTaskNetwork`

### ClientHostNetworkConfig

**定义位置**：[L783](file:///d:/claude/nomad/nomad/structs/network.go#L783)

**类型**：struct

```go
	Name string `hcl:",key"`
	CIDR string `hcl:"cidr"`
	Interface string `hcl:"interface"`
	ReservedPorts string `hcl:"reserved_ports"`
```

**关联方法**（1 个）：`Copy`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `DefaultMinDynamicPort` | `20000` |
| `DefaultMaxDynamicPort` | `32000` |
| `maxRandPortAttempts` | `20` |
| `MaxValidPort` | `65536` |

### 变量

| 名称 | 值 |
|------|----|
| `bitmapPool` | `new(sync.Pool)` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewNetworkIndex` | - | - | `*NetworkIndex` | [L75](file:///d:/claude/nomad/nomad/structs/network.go#L75) |
| `getUsedPortsFor` | `idx *NetworkIndex` | `ip string` | `Bitmap` | [L86](file:///d:/claude/nomad/nomad/structs/network.go#L86) |
| `Copy` | `idx *NetworkIndex` | - | `*NetworkIndex` | [L102](file:///d:/claude/nomad/nomad/structs/network.go#L102) |
| `copyNetworkResources` | - | `resources []*NetworkResource` | `[]*NetworkResource` | [L133](file:///d:/claude/nomad/nomad/structs/network.go#L133) |
| `copyNodeNetworks` | - | `resources []*NodeNetworkResource` | `[]*NodeNetworkResource` | [L146](file:///d:/claude/nomad/nomad/structs/network.go#L146) |
| `copyAvailAddresses` | - | `a map[string][]NodeNetworkAddress` | `map[string][]NodeNetworkAddress` | [L159](file:///d:/claude/nomad/nomad/structs/network.go#L159) |
| `Release` | `idx *NetworkIndex` | - | - | [L179](file:///d:/claude/nomad/nomad/structs/network.go#L179) |
| `SetNode` | `idx *NetworkIndex` | `node *Node` | `error` | [L201](file:///d:/claude/nomad/nomad/structs/network.go#L201) |
| `AddAllocs` | `idx *NetworkIndex` | `allocs []*Allocation` | `collide bool, reason string` | [L312](file:///d:/claude/nomad/nomad/structs/network.go#L312) |
| `AddReserved` | `idx *NetworkIndex` | `n *NetworkResource` | `collide bool, reasons []string` | [L368](file:///d:/claude/nomad/nomad/structs/network.go#L368) |
| `AddReservedPorts` | `idx *NetworkIndex` | `ports AllocatedPorts` | `collide bool, reasons []string` | [L393](file:///d:/claude/nomad/nomad/structs/network.go#L393) |
| `AddReservedPortsForIP` | `idx *NetworkIndex` | `ports []uint64, ip string` | `collide bool, reasons []string` | [L415](file:///d:/claude/nomad/nomad/structs/network.go#L415) |
| `yieldIP` | `idx *NetworkIndex` | `cb func(...)` | - | [L436](file:///d:/claude/nomad/nomad/structs/network.go#L436) |
| `incIP` | - | `ip net.IP` | - | [L450](file:///d:/claude/nomad/nomad/structs/network.go#L450) |
| `AssignPorts` | `idx *NetworkIndex` | `ask *NetworkResource` | `AllocatedPorts, error` | [L470](file:///d:/claude/nomad/nomad/structs/network.go#L470) |
| `AssignTaskNetwork` | `idx *NetworkIndex` | `ask *NetworkResource` | `out *NetworkResource, err error` | [L576](file:///d:/claude/nomad/nomad/structs/network.go#L576) |
| `getDynamicPortsPrecise` | - | `nodeUsed Bitmap, portsInOffer []int, minDynamicPort int, maxDynamicPort int,...` | `[]int, error` | [L660](file:///d:/claude/nomad/nomad/structs/network.go#L660) |
| `getDynamicPortsStochastic` | - | `nodeUsed Bitmap, portsInOffer []int, minDynamicPort int, maxDynamicPort int,...` | `[]int, error` | [L705](file:///d:/claude/nomad/nomad/structs/network.go#L705) |
| `isPortReserved` | - | `haystack []int, needle int` | `bool` | [L746](file:///d:/claude/nomad/nomad/structs/network.go#L746) |
| `AllocatedPortsToNetworkResouce` | - | `ask *NetworkResource, ports AllocatedPorts, node *NodeResources` | `*NetworkResource` | [L757](file:///d:/claude/nomad/nomad/structs/network.go#L757) |
| `Copy` | `p *ClientHostNetworkConfig` | - | `*ClientHostNetworkConfig` | [L790](file:///d:/claude/nomad/nomad/structs/network.go#L790) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `math/rand` | 标准库 |
| `net` | 标准库 |
| `slices` | 标准库 |
| `sync` | 标准库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [network_test.go](file:///d:/claude/nomad/nomad/structs/network_test.go) | 对应测试文件 |

