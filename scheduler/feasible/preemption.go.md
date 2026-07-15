# preemption.go 代码说明文档

> 文件路径：[feasible/preemption.go](file:///d:/claude/nomad/scheduler/feasible/preemption.go)
> 总行数：806 行
> 所属包：`feasible`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **可行性检查子包**（`scheduler/feasible`），实现调度器的可行性检查和评分迭代器栈。包含节点过滤（约束、驱动、设备、网络）、评分（装箱、分散、资源利用率）、抢占、排名等核心调度算法。是调度决策的核心引擎，采用迭代器链模式（Iterator Chain）实现可组合的调度管道。

## 2. 类型定义

### groupedAllocs

**定义位置**：[L20](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L20)

**类型**：struct

```go
	priority int
	allocs []*structs.Allocation
```

### allocInfo

**定义位置**：[L25](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L25)

**类型**：struct

```go
	maxParallel int
	resources *structs.ComparableResources
```

**关联方法**（1 个）：`Copy`

### PreemptionResource

**定义位置**：[L39](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L39)

**类型**：interface

```go
	MeetsRequirements
	Distance
```

### NetworkPreemptionResource

**定义位置**：[L49](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L49)

**类型**：struct

```go
	availableResources *structs.NetworkResource
	resourceNeeded *structs.NetworkResource
```

**关联方法**（2 个）：`MeetsRequirements`, `Distance`

### BasePreemptionResource

**定义位置**：[L68](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L68)

**类型**：struct

```go
	availableResources *structs.ComparableResources
	resourceNeeded *structs.ComparableResources
```

**关联方法**（2 个）：`MeetsRequirements`, `Distance`

### PreemptionResourceFactory

**定义位置**：[L83](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L83)

**类型定义**：`func(...)`

### Preemptor

**定义位置**：[L108](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L108)

**类型**：struct

```go
	currentPreemptions map[structs.NamespacedID]map[string]int
	allocDetails map[string]*allocInfo
	jobPriority int
	jobID *structs.NamespacedID
	nodeRemainingResources *structs.ComparableResources
	currentAllocs []*structs.Allocation
	ctx Context
```

**关联方法**（10 个）：`Copy`, `SetNode`, `SetCandidates`, `SetPreemptions`, `getNumPreemptions`, `PreemptForTaskGroup`, `PreemptForNetwork`, `PreemptForDevice`, `filterSuperset`, `distanceComparatorForNetwork`

### deviceGroupAllocs

**定义位置**：[L486](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L486)

**类型**：struct

```go
	allocs []*structs.Allocation
	deviceInstances map[string]int
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `maxParallelPenalty` | `50.0` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Copy` | `ai *allocInfo` | - | `*allocInfo` | [L30](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L30) |
| `MeetsRequirements` | `n *NetworkPreemptionResource` | - | `bool` | [L54](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L54) |
| `Distance` | `n *NetworkPreemptionResource` | - | `float64` | [L63](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L63) |
| `MeetsRequirements` | `b *BasePreemptionResource` | - | `bool` | [L73](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L73) |
| `Distance` | `b *BasePreemptionResource` | - | `float64` | [L78](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L78) |
| `GetNetworkPreemptionResourceFactory` | - | - | `PreemptionResourceFactory` | [L86](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L86) |
| `GetBasePreemptionResourceFactory` | - | - | `PreemptionResourceFactory` | [L97](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L97) |
| `NewPreemptor` | - | `jobPriority int, ctx Context, jobID *structs.NamespacedID` | `*Preemptor` | [L136](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L136) |
| `Copy` | `p *Preemptor` | - | `*Preemptor` | [L146](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L146) |
| `SetNode` | `p *Preemptor` | `node *structs.Node` | - | [L164](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L164) |
| `SetCandidates` | `p *Preemptor` | `allocs []*structs.Allocation` | - | [L175](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L175) |
| `SetPreemptions` | `p *Preemptor` | `allocs []*structs.Allocation` | - | [L197](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L197) |
| `getNumPreemptions` | `p *Preemptor` | `alloc *structs.Allocation` | `int` | [L216](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L216) |
| `PreemptForTaskGroup` | `p *Preemptor` | `resourceAsk *structs.AllocatedResources` | `[]*structs.Allocation` | [L227](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L227) |
| `PreemptForNetwork` | `p *Preemptor` | `networkResourceAsk *structs.NetworkResource, netIdx *structs.NetworkIndex` | `[]*structs.Allocation` | [L299](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L299) |
| `newAllocDeviceGroup` | - | - | `*deviceGroupAllocs` | [L493](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L493) |
| `PreemptForDevice` | `p *Preemptor` | `ask *structs.RequestedDevice, devAlloc *deviceAllocator` | `[]*structs.Allocation` | [L501](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L501) |
| `selectBestAllocs` | - | `preemptionOptions []*deviceGroupAllocs, neededCount int` | `[]*structs.Allocation` | [L588](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L588) |
| `basicResourceDistance` | - | `resourceAsk *structs.ComparableResources, resourceUsed *structs.ComparableRe...` | `float64` | [L637](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L637) |
| `networkResourceDistance` | - | `resourceUsed *structs.NetworkResource, resourceNeeded *structs.NetworkResource` | `float64` | [L656](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L656) |
| `scoreForTaskGroup` | - | `resourceAsk *structs.ComparableResources, resourceUsed *structs.ComparableRe...` | `float64` | [L669](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L669) |
| `scoreForNetwork` | - | `resourceUsed *structs.NetworkResource, resourceNeeded *structs.NetworkResour...` | `float64` | [L679](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L679) |
| `filterAndGroupPreemptibleAllocs` | - | `jobPriority int, current []*structs.Allocation` | `[]*groupedAllocs` | [L692](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L692) |
| `filterSuperset` | `p *Preemptor` | `bestAllocs []*structs.Allocation, nodeRemainingResources *structs.Comparable...` | `[]*structs.Allocation` | [L731](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L731) |
| `distanceComparatorForNetwork` | `p *Preemptor` | `allocs []*structs.Allocation, networkResourceAsk *structs.NetworkResource, i...` | `bool` | [L767](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L767) |

## 5. 核心方法详解

### NewPreemptor()

**签名**：`func NewPreemptor(jobPriority int, ctx Context, jobID *structs.NamespacedID) *Preemptor`

**位置**：[L136](file:///d:/claude/nomad/scheduler/feasible/preemption.go#L136)

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
- **抢占调度**：实现抢占逻辑，通过停止低优先级分配为高优先级作业释放资源

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [preemption_test.go](file:///d:/claude/nomad/scheduler/feasible/preemption_test.go) | 对应测试文件 |

