# network.go 代码说明文档

> 文件路径：[nomad/structs/network.go](file:///d:/claude/nomad/nomad/structs/network.go)
> 总行数：799 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 21 个方法/函数。

## 2. 类型定义

### NetworkIndex

**定义位置**：[L45](file:///d:/claude/nomad/nomad/structs/network.go#L45)

**中文说明**：NetworkIndex 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type NetworkIndex struct {
	TaskNetworks []*NetworkResource
	GroupNetworks []*NodeNetworkResource
	HostNetworks map[string][]NodeNetworkAddress
	UsedPorts map[string]Bitmap
	AvailBandwidth map[string]int
	UsedBandwidth map[string]int
	MinDynamicPort int
	MaxDynamicPort int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TaskNetworks` | `[]*NetworkResource` | 列表 |
| `GroupNetworks` | `[]*NodeNetworkResource` | 列表 |
| `HostNetworks` | `map[string][]NodeNetworkAddress` | 映射表 |
| `UsedPorts` | `map[string]Bitmap` | 映射表 |
| `AvailBandwidth` | `map[string]int` | 映射表 |
| `UsedBandwidth` | `map[string]int` | 带宽 通过 设备 |
| `MinDynamicPort` | `int` | — |
| `MaxDynamicPort` | `int` | — |

**关联方法**（11 个）：`getUsedPortsFor`, `Copy`, `Release`, `SetNode`, `AddAllocs`, `AddReserved`, `AddReservedPorts`, `AddReservedPortsForIP`, `yieldIP`, `AssignPorts`, `AssignTaskNetwork`

### ClientHostNetworkConfig

**定义位置**：[L783](file:///d:/claude/nomad/nomad/structs/network.go#L783)

**中文说明**：ClientHostNetworkConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type ClientHostNetworkConfig struct {
	Name string `hcl:",key"`
	CIDR string `hcl:"cidr"`
	Interface string `hcl:"interface"`
	ReservedPorts string `hcl:"reserved_ports"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:",key"`` | 名称 |
| `CIDR` | `string `hcl:"cidr"`` | 字符串 |
| `Interface` | `string `hcl:"interface"`` | 字符串 |
| `ReservedPorts` | `string `hcl:"reserved_ports"`` | 字符串 |

**关联方法**（1 个）：`Copy`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `DefaultMinDynamicPort` | `—` | `20000` | — |
| `DefaultMaxDynamicPort` | `—` | `32000` | — |
| `maxRandPortAttempts` | `—` | `20` | — |
| `MaxValidPort` | `—` | `65536` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `bitmapPool` | `—` | `new(sync.Pool)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewNetworkIndex` | - | `` | `*NetworkIndex` | [L75](file:///d:/claude/nomad/nomad/structs/network.go#L75) |
| `getUsedPortsFor` | `idx *NetworkIndex` | `ip string` | `Bitmap` | [L86](file:///d:/claude/nomad/nomad/structs/network.go#L86) |
| `Copy` | `idx *NetworkIndex` | `` | `*NetworkIndex` | [L102](file:///d:/claude/nomad/nomad/structs/network.go#L102) |
| `copyNetworkResources` | - | `resources []*NetworkResource` | `[]*NetworkResource` | [L133](file:///d:/claude/nomad/nomad/structs/network.go#L133) |
| `copyNodeNetworks` | - | `resources []*NodeNetworkResource` | `[]*NodeNetworkResource` | [L146](file:///d:/claude/nomad/nomad/structs/network.go#L146) |
| `copyAvailAddresses` | - | `a map[string][]NodeNetworkAddress` | `map[string][]NodeNetworkAddress` | [L159](file:///d:/claude/nomad/nomad/structs/network.go#L159) |
| `Release` | `idx *NetworkIndex` | `` | `` | [L179](file:///d:/claude/nomad/nomad/structs/network.go#L179) |
| `SetNode` | `idx *NetworkIndex` | `node *Node` | `error` | [L201](file:///d:/claude/nomad/nomad/structs/network.go#L201) |
| `AddAllocs` | `idx *NetworkIndex` | `allocs []*Allocation` | `collide bool, reason string` | [L312](file:///d:/claude/nomad/nomad/structs/network.go#L312) |
| `AddReserved` | `idx *NetworkIndex` | `n *NetworkResource` | `collide bool, reasons []string` | [L368](file:///d:/claude/nomad/nomad/structs/network.go#L368) |
| `AddReservedPorts` | `idx *NetworkIndex` | `ports AllocatedPorts` | `collide bool, reasons []string` | [L393](file:///d:/claude/nomad/nomad/structs/network.go#L393) |
| `AddReservedPortsForIP` | `idx *NetworkIndex` | `ports []uint64, ip string` | `collide bool, reasons []string` | [L415](file:///d:/claude/nomad/nomad/structs/network.go#L415) |
| `yieldIP` | `idx *NetworkIndex` | `cb func(...)` | `` | [L436](file:///d:/claude/nomad/nomad/structs/network.go#L436) |
| `incIP` | - | `ip net.IP` | `` | [L450](file:///d:/claude/nomad/nomad/structs/network.go#L450) |
| `AssignPorts` | `idx *NetworkIndex` | `ask *NetworkResource` | `AllocatedPorts, error` | [L470](file:///d:/claude/nomad/nomad/structs/network.go#L470) |
| `AssignTaskNetwork` | `idx *NetworkIndex` | `ask *NetworkResource` | `out *NetworkResource, err error` | [L576](file:///d:/claude/nomad/nomad/structs/network.go#L576) |
| `getDynamicPortsPrecise` | - | `nodeUsed Bitmap, portsInOffer []int, minDynamicPort int, maxDynamicPort int, ...` | `[]int, error` | [L660](file:///d:/claude/nomad/nomad/structs/network.go#L660) |
| `getDynamicPortsStochastic` | - | `nodeUsed Bitmap, portsInOffer []int, minDynamicPort int, maxDynamicPort int, ...` | `[]int, error` | [L705](file:///d:/claude/nomad/nomad/structs/network.go#L705) |
| `isPortReserved` | - | `haystack []int, needle int` | `bool` | [L746](file:///d:/claude/nomad/nomad/structs/network.go#L746) |
| `AllocatedPortsToNetworkResouce` | - | `ask *NetworkResource, ports AllocatedPorts, node *NodeResources` | `*NetworkResource` | [L757](file:///d:/claude/nomad/nomad/structs/network.go#L757) |
| `Copy` | `p *ClientHostNetworkConfig` | `` | `*ClientHostNetworkConfig` | [L790](file:///d:/claude/nomad/nomad/structs/network.go#L790) |

## 5. 核心方法详解

### NewNetworkIndex()

**签名**：`func NewNetworkIndex() *NetworkIndex`

**位置**：[L75](file:///d:/claude/nomad/nomad/structs/network.go#L75)

**中文说明**：创建并返回一个新的 NetworkIndex 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NetworkIndex` | — |

### Copy()

**签名**：`func (idx *NetworkIndex) Copy() *NetworkIndex`

**位置**：[L102](file:///d:/claude/nomad/nomad/structs/network.go#L102)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NetworkIndex` | — |

### Copy()

**签名**：`func (p *ClientHostNetworkConfig) Copy() *ClientHostNetworkConfig`

**位置**：[L790](file:///d:/claude/nomad/nomad/structs/network.go#L790)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ClientHostNetworkConfig` | 关联的 Client 实例 |

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
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [network_test.go](file:///d:/claude/nomad/nomad/structs/network_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

