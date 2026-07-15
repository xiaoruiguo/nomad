# reconcile_cluster.go 代码说明文档

> 文件路径：[reconciler/reconcile_cluster.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go)
> 总行数：1690 行
> 所属包：`reconciler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **协调器子包**（`scheduler/reconciler`），实现服务/批处理作业的状态协调逻辑。比较现有分配状态与期望状态的差异，计算需要创建、更新、停止、迁移的分配集合。是 GenericScheduler 的第一阶段，将期望状态转换为具体的放置计划。

## 2. 类型定义

### AllocUpdateType

**定义位置**：[L42](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L42)

**类型定义**：`func(...)`

### AllocReconcilerOption

**定义位置**：[L45](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L45)

**类型定义**：`func(...)`

### ReconcilerState

**定义位置**：[L48](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L48)

**类型**：struct

```go
	Job *structs.Job
	JobID string
	JobIsBatch bool
	DeploymentOld *structs.Deployment
	DeploymentCurrent *structs.Deployment
	DeploymentPaused bool
	DeploymentFailed bool
	ExistingAllocs []*structs.Allocation
	EvalID string
	EvalPriority int
```

### AllocReconciler

**定义位置**：[L68](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L68)

**类型**：struct

```go
	logger log.Logger
	allocUpdateFn AllocUpdateType
	jobState ReconcilerState
	reconnectingPicker reconnectingPickerInterface
	clusterState ClusterState
```

**关联方法**（23 个）：`Compute`, `handleStop`, `computeDeploymentComplete`, `computeGroup`, `setDeploymentStatusAndUpdates`, `initializeDeploymentState`, `computeCanaries`, `cancelUnneededCanaries`, `computeUnderProvisionedBy`, `placeAllocs`, `computeDestructiveUpdates`, `computeMigrations`, `createDeployment`, `isDeploymentComplete`, `computeStop`, `computeReconnecting`, `reconcileReconnecting`, `computeUpdates`, `createRescheduleLaterEvals`, `appendReconnectingUpdates`, `createLaterEvals`, `createTimeoutLaterEvals`, `computeDisconnecting`

### ReconcileResults

**定义位置**：[L90](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L90)

**类型**：struct

```go
	Deployment *structs.Deployment
	DeploymentUpdates []*structs.DeploymentStatusUpdate
	Place []AllocPlaceResult
	DestructiveUpdate []allocDestructiveResult
	InplaceUpdate []*structs.Allocation
	Stop []AllocStopResult
	AttributeUpdates allocSet
	DisconnectUpdates allocSet
	ReconnectUpdates allocSet
	DesiredTGUpdates map[string]*structs.DesiredUpdates
	DesiredFollowupEvals map[string][]*structs.Evaluation
	TaskGroupAllocNameIndexes map[string]*AllocNameIndex
```

**关联方法**（2 个）：`Merge`, `Fields`

### delayedRescheduleInfo

**定义位置**：[L193](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L193)

**类型**：struct

```go
	allocID string
	alloc *structs.Allocation
	rescheduleTime time.Time
```

### ClusterState

**定义位置**：[L245](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L245)

**类型**：struct

```go
	TaintedNodes map[string]*structs.Node
	Now time.Time
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `batchedFailedAllocWindowSize` | `5 * time.Second` |
| `rescheduleWindowSize` | `1 * time.Second` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Merge` | `r *ReconcileResults` | `new *ReconcileResults` | - | [L140](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L140) |
| `Fields` | `r *ReconcileResults` | - | `[]any` | [L204](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L204) |
| `NewAllocReconciler` | - | `logger log.Logger, allocUpdateFn AllocUpdateType, reconcilerState Reconciler...` | `*AllocReconciler` | [L252](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L252) |
| `Compute` | `a *AllocReconciler` | - | `*ReconcileResults` | [L272](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L272) |
| `handleStop` | `a *AllocReconciler` | `m allocMatrix` | `map[string]*structs.DesiredUpdates, []AllocStopResult` | [L316](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L316) |
| `markStop` | - | `allocs allocSet, clientStatus string, statusDescription string` | `[]AllocStopResult` | [L333](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L333) |
| `markDelayed` | - | `allocs allocSet, clientStatus string, statusDescription string, followupEval...` | `[]AllocStopResult` | [L347](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L347) |
| `computeDeploymentComplete` | `a *AllocReconciler` | `result *ReconcileResults, m allocMatrix` | `*ReconcileResults, bool` | [L363](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L363) |
| `computeGroup` | `a *AllocReconciler` | `group string, all allocSet` | `*ReconcileResults, bool` | [L383](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L383) |
| `cancelUnneededServiceDeployments` | - | `j *structs.Job, d *structs.Deployment` | `*structs.Deployment, *structs.Deployment, []*structs.Dep...` | [L575](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L575) |
| `setDeploymentStatusAndUpdates` | `a *AllocReconciler` | `deploymentComplete bool, createdDeployment *structs.Deployment` | `[]*structs.DeploymentStatusUpdate` | [L619](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L619) |
| `initializeDeploymentState` | `a *AllocReconciler` | `group string, tg *structs.TaskGroup` | `*structs.DeploymentState, bool` | [L668](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L668) |
| `requiresCanaries` | - | `tg *structs.TaskGroup, dstate *structs.DeploymentState, destructive allocSet...` | `bool` | [L689](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L689) |
| `computeCanaries` | `a *AllocReconciler` | `tg *structs.TaskGroup, dstate *structs.DeploymentState, destructive allocSet...` | - | [L699](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L699) |
| `cancelUnneededCanaries` | `a *AllocReconciler` | `all *allocSet, group string, result *ReconcileResults` | `canaries allocSet` | [L730](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L730) |
| `computeUnderProvisionedBy` | `a *AllocReconciler` | `group *structs.TaskGroup, untainted allocSet, destructive allocSet, migrate ...` | `int` | [L791](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L791) |
| `computePlacements` | - | `group *structs.TaskGroup, nameIndex *AllocNameIndex, untainted allocSet, mig...` | `[]AllocPlaceResult` | [L836](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L836) |
| `placeAllocs` | `a *AllocReconciler` | `deploymentPlaceReady bool, desiredChanges *structs.DesiredUpdates, place []A...` | `int, []AllocPlaceResult, []AllocStopResult` | [L899](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L899) |
| `computeDestructiveUpdates` | `a *AllocReconciler` | `destructive allocSet, underProvisionedBy int, desiredChanges *structs.Desire...` | `[]allocDestructiveResult` | [L979](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L979) |
| `computeMigrations` | `a *AllocReconciler` | `migrate allocSet, isCanarying bool, tg *structs.TaskGroup, result *Reconcile...` | - | [L1002](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1002) |
| `createDeployment` | `a *AllocReconciler` | `groupName string, strategy *structs.UpdateStrategy, existingDeployment bool,...` | `*structs.Deployment` | [L1037](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1037) |
| `isDeploymentComplete` | `a *AllocReconciler` | `groupName string, destructive allocSet, inplace allocSet, migrate allocSet, ...` | `bool` | [L1076](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1076) |
| `computeStop` | `a *AllocReconciler` | `group *structs.TaskGroup, nameIndex *AllocNameIndex, untainted *allocSet, mi...` | - | [L1101](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1101) |
| `computeReconnecting` | `a *AllocReconciler` | `untainted *allocSet, migrate *allocSet, lost *allocSet, disconnecting *alloc...` | - | [L1229](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1229) |
| `reconcileReconnecting` | `a *AllocReconciler` | `reconnecting allocSet, all allocSet, tg *structs.TaskGroup` | `allocSet, allocSet, []AllocStopResult` | [L1272](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1272) |
| `computeUpdates` | `a *AllocReconciler` | `untainted allocSet, group *structs.TaskGroup, result *ReconcileResults` | `inplace allocSet, destructive allocSet` | [L1382](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1382) |
| `createRescheduleLaterEvals` | `a *AllocReconciler` | `rescheduleLater []*delayedRescheduleInfo, all allocSet, migrate allocSet, gr...` | - | [L1412](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1412) |
| `appendReconnectingUpdates` | `a *AllocReconciler` | `reconnecting allocSet` | `allocSet` | [L1450](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1450) |
| `createLaterEvals` | `a *AllocReconciler` | `rescheduleLater []*delayedRescheduleInfo, triggeredBy string` | `map[string]string, []*structs.Evaluation` | [L1488](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1488) |
| `createTimeoutLaterEvals` | `a *AllocReconciler` | `disconnecting allocSet, tgName string` | `map[string]string, []*structs.Evaluation` | [L1548](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1548) |
| `computeDisconnecting` | `a *AllocReconciler` | `disconnecting allocSet, untainted *allocSet, rescheduleNow *allocSet, resche...` | `timeoutLaterEvals map[string]string` | [L1618](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1618) |
| `appendUnknownDisconnectingUpdates` | - | `disconnecting allocSet, allocIDToFollowupEvalID map[string]string` | `allocSet` | [L1656](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1656) |
| `emitRescheduleInfo` | - | `alloc *structs.Allocation, followupEval *structs.Evaluation` | - | [L1673](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L1673) |

## 5. 核心方法详解

### NewAllocReconciler()

**签名**：`func NewAllocReconciler(logger log.Logger, allocUpdateFn AllocUpdateType, reconcilerState ReconcilerState, clusterState ClusterState, opts ...AllocReconcilerOption) *AllocReconciler`

**位置**：[L252](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L252)

### Compute()

**签名**：`func (a *AllocReconciler) Compute() *ReconcileResults`

**位置**：[L272](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go#L272)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `slices` | 标准库 |
| `sort` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |

## 7. 设计模式与技术特点

- **状态协调模式**：比较现有状态与期望状态的差异，计算最小变更集合
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集调度器运行时指标（调度耗时、放置数量等）

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [reconcile_cluster_test.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster_test.go) | 对应测试文件 |

