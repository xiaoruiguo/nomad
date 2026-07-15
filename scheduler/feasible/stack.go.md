# stack.go 代码说明文档

> 文件路径：[feasible/stack.go](file:///d:/claude/nomad/scheduler/feasible/stack.go)
> 总行数：529 行
> 所属包：`feasible`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **可行性检查子包**（`scheduler/feasible`），实现调度器的可行性检查和评分迭代器栈。包含节点过滤（约束、驱动、设备、网络）、评分（装箱、分散、资源利用率）、抢占、排名等核心调度算法。是调度决策的核心引擎，采用迭代器链模式（Iterator Chain）实现可组合的调度管道。

## 2. 类型定义

### Stack

**定义位置**：[L26](file:///d:/claude/nomad/scheduler/feasible/stack.go#L26)

**类型**：interface

```go
	SetNodes
	SetJob
	Select
```

### SelectOptions

**定义位置**：[L37](file:///d:/claude/nomad/scheduler/feasible/stack.go#L37)

**类型**：struct

```go
	PenaltyNodeIDs map[string]struct{...}
	PreferredNodes []*structs.Node
	Preempt bool
	AllocName string
	AllocationHostVolumeIDs []string
```

### GenericStack

**定义位置**：[L47](file:///d:/claude/nomad/scheduler/feasible/stack.go#L47)

**类型**：struct

```go
	batch bool
	ctx Context
	source *StaticIterator
	wrappedChecks *FeasibilityWrapper
	quota FeasibleIterator
	jobVersion *uint64
	jobNamespace string
	jobID string
	jobConstraint *ConstraintChecker
	taskGroupDrivers *DriverChecker
	taskGroupConstraint *ConstraintChecker
	taskGroupDevices *DeviceChecker
	taskGroupHostVolumes *HostVolumeChecker
	taskGroupCSIVolumes *CSIVolumeChecker
	taskGroupNetwork *NetworkChecker
	taskGroupSecrets *SecretsProviderChecker
	distinctHostsConstraint *DistinctHostsIterator
	distinctPropertyConstraint *DistinctPropertyIterator
	binPack *BinPackIterator
	jobAntiAff *JobAntiAffinityIterator
	nodeReschedulingPenalty *NodeReschedulingPenaltyIterator
	limit *LimitIterator
	maxScore *MaxScoreIterator
	nodeAffinity *NodeAffinityIterator
	spread *SpreadIterator
	scoreNorm *ScoreNormalizationIterator
	nodeLimitForFeasibilityChecks int
```

**关联方法**（4 个）：`SetNodes`, `SetJob`, `SetSchedulerConfiguration`, `Select`

### SystemStack

**定义位置**：[L210](file:///d:/claude/nomad/scheduler/feasible/stack.go#L210)

**类型**：struct

```go
	ctx Context
	source *StaticIterator
	jobNamespace string
	jobID string
	wrappedChecks *FeasibilityWrapper
	quota FeasibleIterator
	jobConstraint *ConstraintChecker
	taskGroupDrivers *DriverChecker
	taskGroupConstraint *ConstraintChecker
	taskGroupDevices *DeviceChecker
	taskGroupHostVolumes *HostVolumeChecker
	taskGroupCSIVolumes *CSIVolumeChecker
	taskGroupNetwork *NetworkChecker
	taskGroupSecrets *SecretsProviderChecker
	distinctPropertyConstraint *DistinctPropertyIterator
	binPack *BinPackIterator
	scoreNorm *ScoreNormalizationIterator
```

**关联方法**（4 个）：`SetNodes`, `SetJob`, `SetSchedulerConfiguration`, `Select`

### TgConstrainTuple

**定义位置**：[L519](file:///d:/claude/nomad/scheduler/feasible/stack.go#L519)

**类型**：struct

```go
	Constraints []*structs.Constraint
	Drivers map[string]struct{...}
	Secrets map[string]struct{...}
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `skipScoreThreshold` | `0.0` |
| `maxSkip` | `3` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `SetNodes` | `s *GenericStack` | `baseNodes []*structs.Node` | - | [L79](file:///d:/claude/nomad/scheduler/feasible/stack.go#L79) |
| `SetJob` | `s *GenericStack` | `job *structs.Job` | - | [L102](file:///d:/claude/nomad/scheduler/feasible/stack.go#L102) |
| `SetSchedulerConfiguration` | `s *GenericStack` | `schedConfig *structs.SchedulerConfiguration` | - | [L131](file:///d:/claude/nomad/scheduler/feasible/stack.go#L131) |
| `Select` | `s *GenericStack` | `tg *structs.TaskGroup, options *SelectOptions` | `*RankedNode` | [L136](file:///d:/claude/nomad/scheduler/feasible/stack.go#L136) |
| `NewSystemStack` | - | `sysbatch bool, ctx Context` | `*SystemStack` | [L237](file:///d:/claude/nomad/scheduler/feasible/stack.go#L237) |
| `SetNodes` | `s *SystemStack` | `baseNodes []*structs.Node` | - | [L326](file:///d:/claude/nomad/scheduler/feasible/stack.go#L326) |
| `SetJob` | `s *SystemStack` | `job *structs.Job` | - | [L331](file:///d:/claude/nomad/scheduler/feasible/stack.go#L331) |
| `SetSchedulerConfiguration` | `s *SystemStack` | `schedConfig *structs.SchedulerConfiguration` | - | [L349](file:///d:/claude/nomad/scheduler/feasible/stack.go#L349) |
| `Select` | `s *SystemStack` | `tg *structs.TaskGroup, options *SelectOptions` | `*RankedNode` | [L353](file:///d:/claude/nomad/scheduler/feasible/stack.go#L353) |
| `NewGenericStack` | - | `batch bool, ctx Context` | `*GenericStack` | [L394](file:///d:/claude/nomad/scheduler/feasible/stack.go#L394) |
| `TaskGroupConstraints` | - | `tg *structs.TaskGroup` | `TgConstrainTuple` | [L498](file:///d:/claude/nomad/scheduler/feasible/stack.go#L498) |

## 5. 核心方法详解

### Select()

**签名**：`func (s *GenericStack) Select(tg *structs.TaskGroup, options *SelectOptions) *RankedNode`

**位置**：[L136](file:///d:/claude/nomad/scheduler/feasible/stack.go#L136)

### NewSystemStack()

**签名**：`func NewSystemStack(sysbatch bool, ctx Context) *SystemStack`

**位置**：[L237](file:///d:/claude/nomad/scheduler/feasible/stack.go#L237)

### Select()

**签名**：`func (s *SystemStack) Select(tg *structs.TaskGroup, options *SelectOptions) *RankedNode`

**位置**：[L353](file:///d:/claude/nomad/scheduler/feasible/stack.go#L353)

### NewGenericStack()

**签名**：`func NewGenericStack(batch bool, ctx Context) *GenericStack`

**位置**：[L394](file:///d:/claude/nomad/scheduler/feasible/stack.go#L394)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `math` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **调度栈模式**：实现 Stack 接口，组合多个迭代器形成完整的调度流水线

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [stack_test.go](file:///d:/claude/nomad/scheduler/feasible/stack_test.go) | 对应测试文件 |

