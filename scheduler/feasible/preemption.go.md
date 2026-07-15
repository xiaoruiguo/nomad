# preemption.go 代码说明文档

> 文件路径：[scheduler/feasible/preemption.go](file:///d:/claude/nomad/scheduler/feasible/preemption.go)
> 总行数：806 行
> 所属包：`feasible`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **可行性检查子包**（`scheduler/feasible`），实现节点可行性检查器，根据约束、资源、节点池等条件筛选符合条件的节点。

## 2. 类型定义

### groupedAllocs

**定义位置**：[L20](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L20)

**中文说明**：groupedAllocs 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type groupedAllocs struct {
	priority int
	allocs []*structs.Allocation
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `priority` | `int` | — |
| `allocs` | `[]*structs.Allocation` | 列表 |

### allocInfo

**定义位置**：[L25](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L25)

**中文说明**：allocInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type allocInfo struct {
	maxParallel int
	resources *structs.ComparableResources
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `maxParallel` | `int` | — |
| `resources` | `*structs.ComparableResources` | — |

**关联方法**（1 个）：`Copy`

### PreemptionResource

**定义位置**：[L39](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L39)

**中文说明**：PreemptionResource 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type PreemptionResource interface {
	MeetsRequirements func(...)
	Distance func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `MeetsRequirements` | `func(...)` | — |
| `Distance` | `func(...)` | — |

### NetworkPreemptionResource

**定义位置**：[L49](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L49)

**中文说明**：NetworkPreemptionResource 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type NetworkPreemptionResource struct {
	availableResources *structs.NetworkResource
	resourceNeeded *structs.NetworkResource
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `availableResources` | `*structs.NetworkResource` | — |
| `resourceNeeded` | `*structs.NetworkResource` | — |

**关联方法**（2 个）：`MeetsRequirements`, `Distance`

### BasePreemptionResource

**定义位置**：[L68](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L68)

**中文说明**：BasePreemptionResource 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type BasePreemptionResource struct {
	availableResources *structs.ComparableResources
	resourceNeeded *structs.ComparableResources
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `availableResources` | `*structs.ComparableResources` | — |
| `resourceNeeded` | `*structs.ComparableResources` | — |

**关联方法**（2 个）：`MeetsRequirements`, `Distance`

### PreemptionResourceFactory

**定义位置**：[L83](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L83)

**中文说明**：PreemptionResourceFactory 是一个工厂，负责创建对象实例。

**类型定义**：`type PreemptionResourceFactory func(...)`

### Preemptor

**定义位置**：[L108](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L108)

**中文说明**：Preemptor 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Preemptor struct {
	currentPreemptions map[structs.NamespacedID]map[string]int
	allocDetails map[string]*allocInfo
	jobPriority int
	jobID *structs.NamespacedID
	nodeRemainingResources *structs.ComparableResources
	currentAllocs []*structs.Allocation
	ctx Context
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `currentPreemptions` | `map[structs.NamespacedID]map[string]int` | 映射表 |
| `allocDetails` | `map[string]*allocInfo` | 映射表 |
| `jobPriority` | `int` | — |
| `jobID` | `*structs.NamespacedID` | — |
| `nodeRemainingResources` | `*structs.ComparableResources` | — |
| `currentAllocs` | `[]*structs.Allocation` | 列表 |
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |

**关联方法**（10 个）：`Copy`, `SetNode`, `SetCandidates`, `SetPreemptions`, `getNumPreemptions`, `PreemptForTaskGroup`, `PreemptForNetwork`, `PreemptForDevice`, `filterSuperset`, `distanceComparatorForNetwork`

### deviceGroupAllocs

**定义位置**：[L486](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L486)

**中文说明**：deviceGroupAllocs 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type deviceGroupAllocs struct {
	allocs []*structs.Allocation
	deviceInstances map[string]int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `allocs` | `[]*structs.Allocation` | 列表 |
| `deviceInstances` | `map[string]int` | 映射表 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `maxParallelPenalty` | `—` | `50.0` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Copy` | `ai *allocInfo` | `` | `*allocInfo` | [L30](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L30) |
| `MeetsRequirements` | `n *NetworkPreemptionResource` | `` | `bool` | [L54](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L54) |
| `Distance` | `n *NetworkPreemptionResource` | `` | `float64` | [L63](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L63) |
| `MeetsRequirements` | `b *BasePreemptionResource` | `` | `bool` | [L73](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L73) |
| `Distance` | `b *BasePreemptionResource` | `` | `float64` | [L78](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L78) |
| `GetNetworkPreemptionResourceFactory` | - | `` | `PreemptionResourceFactory` | [L86](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L86) |
| `GetBasePreemptionResourceFactory` | - | `` | `PreemptionResourceFactory` | [L97](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L97) |
| `NewPreemptor` | - | `jobPriority int, ctx Context, jobID *structs.NamespacedID` | `*Preemptor` | [L136](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L136) |
| `Copy` | `p *Preemptor` | `` | `*Preemptor` | [L146](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L146) |
| `SetNode` | `p *Preemptor` | `node *structs.Node` | `` | [L164](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L164) |
| `SetCandidates` | `p *Preemptor` | `allocs []*structs.Allocation` | `` | [L175](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L175) |
| `SetPreemptions` | `p *Preemptor` | `allocs []*structs.Allocation` | `` | [L197](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L197) |
| `getNumPreemptions` | `p *Preemptor` | `alloc *structs.Allocation` | `int` | [L216](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L216) |
| `PreemptForTaskGroup` | `p *Preemptor` | `resourceAsk *structs.AllocatedResources` | `[]*structs.Allocation` | [L227](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L227) |
| `PreemptForNetwork` | `p *Preemptor` | `networkResourceAsk *structs.NetworkResource, netIdx *structs.NetworkIndex` | `[]*structs.Allocation` | [L299](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L299) |
| `newAllocDeviceGroup` | - | `` | `*deviceGroupAllocs` | [L493](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L493) |
| `PreemptForDevice` | `p *Preemptor` | `ask *structs.RequestedDevice, devAlloc *deviceAllocator` | `[]*structs.Allocation` | [L501](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L501) |
| `selectBestAllocs` | - | `preemptionOptions []*deviceGroupAllocs, neededCount int` | `[]*structs.Allocation` | [L588](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L588) |
| `basicResourceDistance` | - | `resourceAsk *structs.ComparableResources, resourceUsed *structs.ComparableRes...` | `float64` | [L637](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L637) |
| `networkResourceDistance` | - | `resourceUsed *structs.NetworkResource, resourceNeeded *structs.NetworkResource` | `float64` | [L656](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L656) |
| `scoreForTaskGroup` | - | `resourceAsk *structs.ComparableResources, resourceUsed *structs.ComparableRes...` | `float64` | [L669](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L669) |
| `scoreForNetwork` | - | `resourceUsed *structs.NetworkResource, resourceNeeded *structs.NetworkResourc...` | `float64` | [L679](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L679) |
| `filterAndGroupPreemptibleAllocs` | - | `jobPriority int, current []*structs.Allocation` | `[]*groupedAllocs` | [L692](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L692) |
| `filterSuperset` | `p *Preemptor` | `bestAllocs []*structs.Allocation, nodeRemainingResources *structs.ComparableR...` | `[]*structs.Allocation` | [L731](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L731) |
| `distanceComparatorForNetwork` | `p *Preemptor` | `allocs []*structs.Allocation, networkResourceAsk *structs.NetworkResource, i ...` | `bool` | [L767](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L767) |

## 5. 核心方法详解

### Copy()

**签名**：`func (ai *allocInfo) Copy() *allocInfo`

**位置**：[L30](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L30)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*allocInfo` | — |

### NewPreemptor()

**签名**：`func NewPreemptor(jobPriority int, ctx Context, jobID *structs.NamespacedID) *Preemptor`

**位置**：[L136](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L136)

**中文说明**：创建并返回一个新的 Preemptor 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `jobPriority` | `int` | — |
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `jobID` | `*structs.NamespacedID` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Preemptor` | — |

### Copy()

**签名**：`func (p *Preemptor) Copy() *Preemptor`

**位置**：[L146](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L146)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Preemptor` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `maps` | 标准库 |
| `math` | 标准库 |
| `sort` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [preemption_test.go](file:///d:/claude/nomad/scheduler/feasible/preemption_test.go) | 对应测试文件 |
| [context.go](file:///d:/claude/nomad/scheduler/feasible/context.go) | 同目录源文件 |
| [device.go](file:///d:/claude/nomad/scheduler/feasible/device.go) | 同目录源文件 |
| [doc.go](file:///d:/claude/nomad/scheduler/feasible/doc.go) | 同目录源文件 |
| [feasible.go](file:///d:/claude/nomad/scheduler/feasible/feasible.go) | 同目录源文件 |
| [numa_ce.go](file:///d:/claude/nomad/scheduler/feasible/numa_ce.go) | 同目录源文件 |

