# generic_sched.go 代码说明文档

> 文件路径：[scheduler/generic_sched.go](file:///d:/claude/nomad/scheduler/generic_sched.go)
> 总行数：955 行
> 所属包：`scheduler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **调度器包**（`scheduler/`），实现 Nomad 的调度逻辑，包括评估处理、节点筛选、分配计划和抢占策略。当前文件 `generic_sched.go` 提供相关调度功能。

## 2. 类型定义

### SetStatusError

**定义位置**：[L39](file:///d:/claude/nomad/scheduler/generic_sched.go#L39)

**中文说明**：SetStatusError 是一个错误类型，描述特定的错误情况。

**类型**：struct

```go
type SetStatusError struct {
	Err error
	EvalStatus string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Err` | `error` | 错误信息 |
| `EvalStatus` | `string` | 字符串 |

**关联方法**（1 个）：`Error`

### GenericScheduler

**定义位置**：[L53](file:///d:/claude/nomad/scheduler/generic_sched.go#L53)

**中文说明**：GenericScheduler 与调度器（Scheduler）相关，调度器负责将作业分配到合适的节点。

**类型**：struct

```go
type GenericScheduler struct {
	logger log.Logger
	eventsCh chan<- interface{}
	state sstructs.State
	planner sstructs.Planner
	batch bool
	eval *structs.Evaluation
	job *structs.Job
	plan *structs.Plan
	planResult *structs.PlanResult
	ctx *feasible.EvalContext
	stack *feasible.GenericStack
	followUpEvals []*structs.Evaluation
	deployment *structs.Deployment
	blocked *structs.Evaluation
	failedTGAllocs map[string]*structs.AllocMetric
	queuedAllocs map[string]int
	planAnnotations *structs.PlanAnnotations
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `log.Logger` | 日志记录器 |
| `eventsCh` | `chan<- interface{}` | 接口类型，可持有任意值 |
| `state` | `sstructs.State` | 状态 |
| `planner` | `sstructs.Planner` | 计划器，管理分配方案 |
| `batch` | `bool` | 布尔值 |
| `eval` | `*structs.Evaluation` | — |
| `job` | `*structs.Job` | — |
| `plan` | `*structs.Plan` | — |
| `planResult` | `*structs.PlanResult` | — |
| `ctx` | `*feasible.EvalContext` | 上下文，用于控制请求的生命周期 |
| `stack` | `*feasible.GenericStack` | — |
| `followUpEvals` | `[]*structs.Evaluation` | 列表 |
| `deployment` | `*structs.Deployment` | — |
| `blocked` | `*structs.Evaluation` | — |
| `failedTGAllocs` | `map[string]*structs.AllocMetric` | 映射表 |
| `queuedAllocs` | `map[string]int` | 映射表 |
| `planAnnotations` | `*structs.PlanAnnotations` | — |

**关联方法**（11 个）：`Process`, `createBlockedEval`, `process`, `computeJobAllocs`, `downgradedJobForPlacement`, `computePlacements`, `setJob`, `setNodes`, `findPreferredNode`, `selectNextOption`, `handlePreemptions`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `maxServiceScheduleAttempts` | `—` | `5` | — |
| `maxBatchScheduleAttempts` | `—` | `2` | — |
| `maxPastRescheduleEvents` | `—` | `5` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Error` | `s *SetStatusError` | `` | `string` | [L44](file:///d:/claude/nomad/scheduler/generic_sched.go#L44) |
| `NewServiceScheduler` | - | `logger log.Logger, eventsCh chan<- interface{}, state sstructs.State, planner...` | `sstructs.Scheduler` | [L80](file:///d:/claude/nomad/scheduler/generic_sched.go#L80) |
| `NewBatchScheduler` | - | `logger log.Logger, eventsCh chan<- interface{}, state sstructs.State, planner...` | `sstructs.Scheduler` | [L92](file:///d:/claude/nomad/scheduler/generic_sched.go#L92) |
| `Process` | `s *GenericScheduler` | `eval *structs.Evaluation` | `err error` | [L104](file:///d:/claude/nomad/scheduler/generic_sched.go#L104) |
| `createBlockedEval` | `s *GenericScheduler` | `planFailure bool` | `error` | [L180](file:///d:/claude/nomad/scheduler/generic_sched.go#L180) |
| `process` | `s *GenericScheduler` | `` | `bool, error` | [L203](file:///d:/claude/nomad/scheduler/generic_sched.go#L203) |
| `computeJobAllocs` | `s *GenericScheduler` | `` | `error` | [L324](file:///d:/claude/nomad/scheduler/generic_sched.go#L324) |
| `downgradedJobForPlacement` | `s *GenericScheduler` | `p reconciler.PlacementResult` | `string, *structs.Job, error` | [L444](file:///d:/claude/nomad/scheduler/generic_sched.go#L444) |
| `computePlacements` | `s *GenericScheduler` | `destructive []reconciler.PlacementResult, place []reconciler.PlacementResult,...` | `error` | [L482](file:///d:/claude/nomad/scheduler/generic_sched.go#L482) |
| `markFailedToReschedule` | - | `plan *structs.Plan, original *structs.Allocation, job *structs.Job` | `` | [L724](file:///d:/claude/nomad/scheduler/generic_sched.go#L724) |
| `swapAllocInPlan` | - | `plan *structs.Plan, original *structs.Allocation, updated *structs.Allocation` | `` | [L742](file:///d:/claude/nomad/scheduler/generic_sched.go#L742) |
| `setJob` | `s *GenericScheduler` | `job *structs.Job` | `error` | [L759](file:///d:/claude/nomad/scheduler/generic_sched.go#L759) |
| `setNodes` | `s *GenericScheduler` | `job *structs.Job` | `[]*structs.Node, map[string]int, error` | [L779](file:///d:/claude/nomad/scheduler/generic_sched.go#L779) |
| `needsToSetNodes` | - | `a *structs.Job, b *structs.Job` | `bool` | [L791](file:///d:/claude/nomad/scheduler/generic_sched.go#L791) |
| `getSelectOptions` | - | `prevAllocation *structs.Allocation, preferredNode *structs.Node` | `*feasible.SelectOptions` | [L797](file:///d:/claude/nomad/scheduler/generic_sched.go#L797) |
| `annotateRescheduleTracker` | - | `prev *structs.Allocation, note structs.RescheduleTrackerAnnotation` | `` | [L822](file:///d:/claude/nomad/scheduler/generic_sched.go#L822) |
| `UpdateRescheduleTracker` | - | `alloc *structs.Allocation, prev *structs.Allocation, now time.Time` | `` | [L833](file:///d:/claude/nomad/scheduler/generic_sched.go#L833) |
| `findPreferredNode` | `s *GenericScheduler` | `place reconciler.PlacementResult` | `*structs.Node, error` | [L873](file:///d:/claude/nomad/scheduler/generic_sched.go#L873) |
| `selectNextOption` | `s *GenericScheduler` | `tg *structs.TaskGroup, selectOptions *feasible.SelectOptions` | `*feasible.RankedNode` | [L906](file:///d:/claude/nomad/scheduler/generic_sched.go#L906) |
| `handlePreemptions` | `s *GenericScheduler` | `option *feasible.RankedNode, alloc *structs.Allocation, missing reconciler.Pl...` | `` | [L933](file:///d:/claude/nomad/scheduler/generic_sched.go#L933) |

## 5. 核心方法详解

### NewServiceScheduler()

**签名**：`func NewServiceScheduler(logger log.Logger, eventsCh chan<- interface{}, state sstructs.State, planner sstructs.Planner) sstructs.Scheduler`

**位置**：[L80](file:///d:/claude/nomad/scheduler/generic_sched.go#L80)

**中文说明**：创建并返回一个新的 ServiceScheduler 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `log.Logger` | 日志记录器 |
| `eventsCh` | `chan<- interface{}` | 接口类型，可持有任意值 |
| `state` | `sstructs.State` | 状态 |
| `planner` | `sstructs.Planner` | 计划器，管理分配方案 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `sstructs.Scheduler` | — |

### NewBatchScheduler()

**签名**：`func NewBatchScheduler(logger log.Logger, eventsCh chan<- interface{}, state sstructs.State, planner sstructs.Planner) sstructs.Scheduler`

**位置**：[L92](file:///d:/claude/nomad/scheduler/generic_sched.go#L92)

**中文说明**：创建并返回一个新的 BatchScheduler 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `log.Logger` | 日志记录器 |
| `eventsCh` | `chan<- interface{}` | 接口类型，可持有任意值 |
| `state` | `sstructs.State` | 状态 |
| `planner` | `sstructs.Planner` | 计划器，管理分配方案 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `sstructs.Scheduler` | — |

### Process()

**签名**：`func (s *GenericScheduler) Process(eval *structs.Evaluation) err error`

**位置**：[L104](file:///d:/claude/nomad/scheduler/generic_sched.go#L104)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `eval` | `*structs.Evaluation` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `err error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `runtime/debug` | 标准库 |
| `slices` | 标准库 |
| `sort` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/feasible` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/reconciler` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [generic_sched_test.go](file:///d:/claude/nomad/scheduler/generic_sched_test.go) | 对应测试文件 |
| [annotate.go](file:///d:/claude/nomad/scheduler/annotate.go) | 同目录源文件 |
| [doc.go](file:///d:/claude/nomad/scheduler/doc.go) | 同目录源文件 |
| [scheduler.go](file:///d:/claude/nomad/scheduler/scheduler.go) | 同目录源文件 |
| [scheduler_ce.go](file:///d:/claude/nomad/scheduler/scheduler_ce.go) | 同目录源文件 |
| [scheduler_sysbatch.go](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go) | 同目录源文件 |

