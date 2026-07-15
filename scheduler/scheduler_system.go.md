# scheduler_system.go 代码说明文档

> 文件路径：[scheduler/scheduler_system.go](file:///d:/claude/nomad/scheduler/scheduler_system.go)
> 总行数：912 行
> 所属包：`scheduler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **调度器包**（`scheduler/`），实现 Nomad 的调度逻辑，包括评估处理、节点筛选、分配计划和抢占策略。当前文件 `scheduler_system.go` 提供相关调度功能。

## 2. 类型定义

### SystemScheduler

**定义位置**：[L33](file:///d:/claude/nomad/scheduler/scheduler_system.go#L33)

**中文说明**：SystemScheduler 与调度器（Scheduler）相关，调度器负责将作业分配到合适的节点。

**类型**：struct

```go
type SystemScheduler struct {
	logger log.Logger
	eventsCh chan<- interface{}
	state sstructs.State
	planner sstructs.Planner
	eval *structs.Evaluation
	job *structs.Job
	plan *structs.Plan
	planResult *structs.PlanResult
	ctx *feasible.EvalContext
	stack *feasible.SystemStack
	nodes []*structs.Node
	notReadyNodes map[string]struct{...}
	nodesByDC map[string]int
	deployment *structs.Deployment
	failedTGAllocs map[string]*structs.AllocMetric
	queuedAllocs map[string]int
	planAnnotations *structs.PlanAnnotations
	tgCandidateNodeCounts map[string]int
	tgDestructiveUpdateCounts map[string]int
	tgExistingCanaryCount map[string]int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `log.Logger` | 日志记录器 |
| `eventsCh` | `chan<- interface{}` | 接口类型，可持有任意值 |
| `state` | `sstructs.State` | 状态 |
| `planner` | `sstructs.Planner` | 计划器，管理分配方案 |
| `eval` | `*structs.Evaluation` | — |
| `job` | `*structs.Job` | — |
| `plan` | `*structs.Plan` | — |
| `planResult` | `*structs.PlanResult` | — |
| `ctx` | `*feasible.EvalContext` | 上下文，用于控制请求的生命周期 |
| `stack` | `*feasible.SystemStack` | — |
| `nodes` | `[]*structs.Node` | 列表 |
| `notReadyNodes` | `map[string]struct{...}` | 映射表 |
| `nodesByDC` | `map[string]int` | 映射表 |
| `deployment` | `*structs.Deployment` | — |
| `failedTGAllocs` | `map[string]*structs.AllocMetric` | 映射表 |
| `queuedAllocs` | `map[string]int` | 映射表 |
| `planAnnotations` | `*structs.PlanAnnotations` | — |
| `tgCandidateNodeCounts` | `map[string]int` | 映射表 |
| `tgDestructiveUpdateCounts` | `map[string]int` | 映射表 |
| `tgExistingCanaryCount` | `map[string]int` | 映射表 |

**关联方法**（11 个）：`Process`, `process`, `setJob`, `computeJobAllocs`, `computePlacements`, `addBlocked`, `canHandle`, `evictAndPlace`, `evictUnneededCanaries`, `isDeploymentComplete`, `setDeploymentStatusAndUpdates`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `maxSystemScheduleAttempts` | `—` | `5` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewSystemScheduler` | - | `logger log.Logger, eventsCh chan<- interface{}, state sstructs.State, planner...` | `sstructs.Scheduler` | [L62](file:///d:/claude/nomad/scheduler/scheduler_system.go#L62) |
| `Process` | `s *SystemScheduler` | `eval *structs.Evaluation` | `err error` | [L72](file:///d:/claude/nomad/scheduler/scheduler_system.go#L72) |
| `process` | `s *SystemScheduler` | `` | `bool, error` | [L116](file:///d:/claude/nomad/scheduler/scheduler_system.go#L116) |
| `setJob` | `s *SystemScheduler` | `job *structs.Job` | `error` | [L209](file:///d:/claude/nomad/scheduler/scheduler_system.go#L209) |
| `computeJobAllocs` | `s *SystemScheduler` | `` | `error` | [L229](file:///d:/claude/nomad/scheduler/scheduler_system.go#L229) |
| `computePlacements` | `s *SystemScheduler` | `reconcilerResult *reconciler.NodeReconcileResult, nodeByID map[string]*struct...` | `error` | [L476](file:///d:/claude/nomad/scheduler/scheduler_system.go#L476) |
| `addBlocked` | `s *SystemScheduler` | `node *structs.Node` | `error` | [L653](file:///d:/claude/nomad/scheduler/scheduler_system.go#L653) |
| `canHandle` | `s *SystemScheduler` | `trigger string` | `bool` | [L670](file:///d:/claude/nomad/scheduler/scheduler_system.go#L670) |
| `evictAndPlace` | `s *SystemScheduler` | `reconciled *reconciler.NodeReconcileResult, desc string` | `` | [L693](file:///d:/claude/nomad/scheduler/scheduler_system.go#L693) |
| `evictUnneededCanaries` | `s *SystemScheduler` | `requiredCanaries int, tgName string, buckets *reconciler.NodeReconcileResult` | `[]string` | [L751](file:///d:/claude/nomad/scheduler/scheduler_system.go#L751) |
| `isDeploymentComplete` | `s *SystemScheduler` | `dstate *structs.DeploymentState, isCanarying bool` | `bool` | [L847](file:///d:/claude/nomad/scheduler/scheduler_system.go#L847) |
| `setDeploymentStatusAndUpdates` | `s *SystemScheduler` | `deploymentComplete bool, job *structs.Job` | `[]*structs.DeploymentStatusUpdate` | [L862](file:///d:/claude/nomad/scheduler/scheduler_system.go#L862) |

## 5. 核心方法详解

### NewSystemScheduler()

**签名**：`func NewSystemScheduler(logger log.Logger, eventsCh chan<- interface{}, state sstructs.State, planner sstructs.Planner) sstructs.Scheduler`

**位置**：[L62](file:///d:/claude/nomad/scheduler/scheduler_system.go#L62)

**中文说明**：创建并返回一个新的 SystemScheduler 实例。

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

**签名**：`func (s *SystemScheduler) Process(eval *structs.Evaluation) err error`

**位置**：[L72](file:///d:/claude/nomad/scheduler/scheduler_system.go#L72)

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
| `maps` | 标准库 |
| `math` | 标准库 |
| `runtime/debug` | 标准库 |
| `slices` | 标准库 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/feasible` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/reconciler` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [scheduler_system_test.go](file:///d:/claude/nomad/scheduler/scheduler_system_test.go) | 对应测试文件 |
| [annotate.go](file:///d:/claude/nomad/scheduler/annotate.go) | 同目录源文件 |
| [doc.go](file:///d:/claude/nomad/scheduler/doc.go) | 同目录源文件 |
| [generic_sched.go](file:///d:/claude/nomad/scheduler/generic_sched.go) | 同目录源文件 |
| [scheduler.go](file:///d:/claude/nomad/scheduler/scheduler.go) | 同目录源文件 |
| [scheduler_ce.go](file:///d:/claude/nomad/scheduler/scheduler_ce.go) | 同目录源文件 |

