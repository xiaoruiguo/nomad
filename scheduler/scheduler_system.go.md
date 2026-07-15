# scheduler_system.go 代码说明文档

> 文件路径：[scheduler_system.go](file:///d:/claude/nomad/scheduler/scheduler_system.go)
> 总行数：912 行
> 所属包：`scheduler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **系统调度器（SystemScheduler）**，用于 system 类型作业。将作业调度到所有符合条件的客户端节点上，确保每个节点运行一个实例。适用于基础设施类作业（如监控代理、日志收集器）。

## 2. 类型定义

### SystemScheduler

**定义位置**：[L33](file:///d:/claude/nomad/scheduler/scheduler_system.go#L33)

**类型**：struct

```go
	logger log.Logger
	eventsCh chan interface{}
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
```

**关联方法**（11 个）：`Process`, `process`, `setJob`, `computeJobAllocs`, `computePlacements`, `addBlocked`, `canHandle`, `evictAndPlace`, `evictUnneededCanaries`, `isDeploymentComplete`, `setDeploymentStatusAndUpdates`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `maxSystemScheduleAttempts` | `5` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewSystemScheduler` | - | `logger log.Logger, eventsCh chan interface{}, state sstructs.State, planner ...` | `sstructs.Scheduler` | [L62](file:///d:/claude/nomad/scheduler/scheduler_system.go#L62) |
| `Process` | `s *SystemScheduler` | `eval *structs.Evaluation` | `err error` | [L72](file:///d:/claude/nomad/scheduler/scheduler_system.go#L72) |
| `process` | `s *SystemScheduler` | - | `bool, error` | [L116](file:///d:/claude/nomad/scheduler/scheduler_system.go#L116) |
| `setJob` | `s *SystemScheduler` | `job *structs.Job` | `error` | [L209](file:///d:/claude/nomad/scheduler/scheduler_system.go#L209) |
| `computeJobAllocs` | `s *SystemScheduler` | - | `error` | [L229](file:///d:/claude/nomad/scheduler/scheduler_system.go#L229) |
| `computePlacements` | `s *SystemScheduler` | `reconcilerResult *reconciler.NodeReconcileResult, nodeByID map[string]*struc...` | `error` | [L476](file:///d:/claude/nomad/scheduler/scheduler_system.go#L476) |
| `addBlocked` | `s *SystemScheduler` | `node *structs.Node` | `error` | [L653](file:///d:/claude/nomad/scheduler/scheduler_system.go#L653) |
| `canHandle` | `s *SystemScheduler` | `trigger string` | `bool` | [L670](file:///d:/claude/nomad/scheduler/scheduler_system.go#L670) |
| `evictAndPlace` | `s *SystemScheduler` | `reconciled *reconciler.NodeReconcileResult, desc string` | - | [L693](file:///d:/claude/nomad/scheduler/scheduler_system.go#L693) |
| `evictUnneededCanaries` | `s *SystemScheduler` | `requiredCanaries int, tgName string, buckets *reconciler.NodeReconcileResult` | `[]string` | [L751](file:///d:/claude/nomad/scheduler/scheduler_system.go#L751) |
| `isDeploymentComplete` | `s *SystemScheduler` | `dstate *structs.DeploymentState, isCanarying bool` | `bool` | [L847](file:///d:/claude/nomad/scheduler/scheduler_system.go#L847) |
| `setDeploymentStatusAndUpdates` | `s *SystemScheduler` | `deploymentComplete bool, job *structs.Job` | `[]*structs.DeploymentStatusUpdate` | [L862](file:///d:/claude/nomad/scheduler/scheduler_system.go#L862) |

## 5. 核心方法详解

### NewSystemScheduler()

**签名**：`func NewSystemScheduler(logger log.Logger, eventsCh chan interface{}, state sstructs.State, planner sstructs.Planner) sstructs.Scheduler`

**位置**：[L62](file:///d:/claude/nomad/scheduler/scheduler_system.go#L62)

### Process()

**签名**：`func (s *SystemScheduler) Process(eval *structs.Evaluation) err error`

**位置**：[L72](file:///d:/claude/nomad/scheduler/scheduler_system.go#L72)

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

- **调度器模式**：实现 Scheduler 接口的 Process 方法，处理评估并产生调度计划
- **工厂模式**：提供调度器工厂函数，通过名称创建不同类型的调度器实例
- **MemDB 状态访问**：通过 MemDB 事务读取集群状态，支持多版本并发控制（MVCC）
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [scheduler_system_test.go](file:///d:/claude/nomad/scheduler/scheduler_system_test.go) | 对应测试文件 |

