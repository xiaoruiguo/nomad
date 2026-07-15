# stack.go 代码说明文档

> 文件路径：[scheduler/feasible/stack.go](file:///d:/claude/nomad/scheduler/feasible/stack.go)
> 总行数：529 行
> 所属包：`feasible`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **可行性检查子包**（`scheduler/feasible`），实现节点可行性检查器，根据约束、资源、节点池等条件筛选符合条件的节点。

## 2. 类型定义

### Stack

**定义位置**：[L26](file:///d:/claude/nomad/scheduler/feasible/stack.go#L26)

**中文说明**：Stack 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type Stack interface {
	SetNodes func(...)
	SetJob func(...)
	Select func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `SetNodes` | `func(...)` | — |
| `SetJob` | `func(...)` | — |
| `Select` | `func(...)` | — |

### SelectOptions

**定义位置**：[L37](file:///d:/claude/nomad/scheduler/feasible/stack.go#L37)

**中文说明**：SelectOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type SelectOptions struct {
	PenaltyNodeIDs map[string]struct{...}
	PreferredNodes []*structs.Node
	Preempt bool
	AllocName string
	AllocationHostVolumeIDs []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PenaltyNodeIDs` | `map[string]struct{...}` | 映射表 |
| `PreferredNodes` | `[]*structs.Node` | 列表 |
| `Preempt` | `bool` | 布尔值 |
| `AllocName` | `string` | 字符串 |
| `AllocationHostVolumeIDs` | `[]string` | 列表 |

### GenericStack

**定义位置**：[L47](file:///d:/claude/nomad/scheduler/feasible/stack.go#L47)

**中文说明**：GenericStack 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type GenericStack struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `batch` | `bool` | 布尔值 |
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `source` | `*StaticIterator` | — |
| `wrappedChecks` | `*FeasibilityWrapper` | — |
| `quota` | `FeasibleIterator` | — |
| `jobVersion` | `*uint64` | 无符号 64 位整数 |
| `jobNamespace` | `string` | 字符串 |
| `jobID` | `string` | 字符串 |
| `jobConstraint` | `*ConstraintChecker` | — |
| `taskGroupDrivers` | `*DriverChecker` | — |
| `taskGroupConstraint` | `*ConstraintChecker` | — |
| `taskGroupDevices` | `*DeviceChecker` | — |
| `taskGroupHostVolumes` | `*HostVolumeChecker` | — |
| `taskGroupCSIVolumes` | `*CSIVolumeChecker` | — |
| `taskGroupNetwork` | `*NetworkChecker` | — |
| `taskGroupSecrets` | `*SecretsProviderChecker` | — |
| `distinctHostsConstraint` | `*DistinctHostsIterator` | — |
| `distinctPropertyConstraint` | `*DistinctPropertyIterator` | — |
| `binPack` | `*BinPackIterator` | — |
| `jobAntiAff` | `*JobAntiAffinityIterator` | — |
| `nodeReschedulingPenalty` | `*NodeReschedulingPenaltyIterator` | — |
| `limit` | `*LimitIterator` | 限制 |
| `maxScore` | `*MaxScoreIterator` | — |
| `nodeAffinity` | `*NodeAffinityIterator` | — |
| `spread` | `*SpreadIterator` | — |
| `scoreNorm` | `*ScoreNormalizationIterator` | — |
| `nodeLimitForFeasibilityChecks` | `int` | — |

**关联方法**（4 个）：`SetNodes`, `SetJob`, `SetSchedulerConfiguration`, `Select`

### SystemStack

**定义位置**：[L210](file:///d:/claude/nomad/scheduler/feasible/stack.go#L210)

**中文说明**：SystemStack 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type SystemStack struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `source` | `*StaticIterator` | — |
| `jobNamespace` | `string` | 字符串 |
| `jobID` | `string` | 字符串 |
| `wrappedChecks` | `*FeasibilityWrapper` | — |
| `quota` | `FeasibleIterator` | — |
| `jobConstraint` | `*ConstraintChecker` | — |
| `taskGroupDrivers` | `*DriverChecker` | — |
| `taskGroupConstraint` | `*ConstraintChecker` | — |
| `taskGroupDevices` | `*DeviceChecker` | — |
| `taskGroupHostVolumes` | `*HostVolumeChecker` | — |
| `taskGroupCSIVolumes` | `*CSIVolumeChecker` | — |
| `taskGroupNetwork` | `*NetworkChecker` | — |
| `taskGroupSecrets` | `*SecretsProviderChecker` | — |
| `distinctPropertyConstraint` | `*DistinctPropertyIterator` | — |
| `binPack` | `*BinPackIterator` | — |
| `scoreNorm` | `*ScoreNormalizationIterator` | — |

**关联方法**（4 个）：`SetNodes`, `SetJob`, `SetSchedulerConfiguration`, `Select`

### TgConstrainTuple

**定义位置**：[L519](file:///d:/claude/nomad/scheduler/feasible/stack.go#L519)

**中文说明**：TgConstrainTuple 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type TgConstrainTuple struct {
	Constraints []*structs.Constraint
	Drivers map[string]struct{...}
	Secrets map[string]struct{...}
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Constraints` | `[]*structs.Constraint` | 列表 |
| `Drivers` | `map[string]struct{...}` | 映射表 |
| `Secrets` | `map[string]struct{...}` | 映射表 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `skipScoreThreshold` | `—` | `0.0` | — |
| `maxSkip` | `—` | `3` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `SetNodes` | `s *GenericStack` | `baseNodes []*structs.Node` | `` | [L79](file:///d:/claude/nomad/scheduler/feasible/stack.go#L79) |
| `SetJob` | `s *GenericStack` | `job *structs.Job` | `` | [L102](file:///d:/claude/nomad/scheduler/feasible/stack.go#L102) |
| `SetSchedulerConfiguration` | `s *GenericStack` | `schedConfig *structs.SchedulerConfiguration` | `` | [L131](file:///d:/claude/nomad/scheduler/feasible/stack.go#L131) |
| `Select` | `s *GenericStack` | `tg *structs.TaskGroup, options *SelectOptions` | `*RankedNode` | [L136](file:///d:/claude/nomad/scheduler/feasible/stack.go#L136) |
| `NewSystemStack` | - | `sysbatch bool, ctx Context` | `*SystemStack` | [L237](file:///d:/claude/nomad/scheduler/feasible/stack.go#L237) |
| `SetNodes` | `s *SystemStack` | `baseNodes []*structs.Node` | `` | [L326](file:///d:/claude/nomad/scheduler/feasible/stack.go#L326) |
| `SetJob` | `s *SystemStack` | `job *structs.Job` | `` | [L331](file:///d:/claude/nomad/scheduler/feasible/stack.go#L331) |
| `SetSchedulerConfiguration` | `s *SystemStack` | `schedConfig *structs.SchedulerConfiguration` | `` | [L349](file:///d:/claude/nomad/scheduler/feasible/stack.go#L349) |
| `Select` | `s *SystemStack` | `tg *structs.TaskGroup, options *SelectOptions` | `*RankedNode` | [L353](file:///d:/claude/nomad/scheduler/feasible/stack.go#L353) |
| `NewGenericStack` | - | `batch bool, ctx Context` | `*GenericStack` | [L394](file:///d:/claude/nomad/scheduler/feasible/stack.go#L394) |
| `TaskGroupConstraints` | - | `tg *structs.TaskGroup` | `TgConstrainTuple` | [L498](file:///d:/claude/nomad/scheduler/feasible/stack.go#L498) |

## 5. 核心方法详解

### NewSystemStack()

**签名**：`func NewSystemStack(sysbatch bool, ctx Context) *SystemStack`

**位置**：[L237](file:///d:/claude/nomad/scheduler/feasible/stack.go#L237)

**中文说明**：创建并返回一个新的 SystemStack 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `sysbatch` | `bool` | 布尔值 |
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*SystemStack` | — |

### NewGenericStack()

**签名**：`func NewGenericStack(batch bool, ctx Context) *GenericStack`

**位置**：[L394](file:///d:/claude/nomad/scheduler/feasible/stack.go#L394)

**中文说明**：创建并返回一个新的 GenericStack 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `batch` | `bool` | 布尔值 |
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*GenericStack` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `math` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [stack_test.go](file:///d:/claude/nomad/scheduler/feasible/stack_test.go) | 对应测试文件 |
| [context.go](file:///d:/claude/nomad/scheduler/feasible/context.go) | 同目录源文件 |
| [device.go](file:///d:/claude/nomad/scheduler/feasible/device.go) | 同目录源文件 |
| [doc.go](file:///d:/claude/nomad/scheduler/feasible/doc.go) | 同目录源文件 |
| [feasible.go](file:///d:/claude/nomad/scheduler/feasible/feasible.go) | 同目录源文件 |
| [numa_ce.go](file:///d:/claude/nomad/scheduler/feasible/numa_ce.go) | 同目录源文件 |

