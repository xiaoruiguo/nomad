# scheduler_sysbatch.go 代码说明文档

> 文件路径：[scheduler_sysbatch.go](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go)
> 总行数：546 行
> 所属包：`scheduler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **系统批处理调度器（SysBatchScheduler）**，用于 sysbatch 类型作业。类似系统调度器，将作业调度到所有节点，但在任务成功完成后视为完成（不像 system 作业会持续运行）。适用于一次性运维任务。

## 2. 类型定义

### SysBatchScheduler

**定义位置**：[L29](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go#L29)

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
	limitReached bool
	failedTGAllocs map[string]*structs.AllocMetric
	queuedAllocs map[string]int
	planAnnotations *structs.PlanAnnotations
```

**关联方法**（7 个）：`Process`, `process`, `setJob`, `computeJobAllocs`, `computePlacements`, `addBlocked`, `canHandle`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `maxSysBatchScheduleAttempts` | `2` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewSysBatchScheduler` | - | `logger log.Logger, eventsCh chan interface{}, state sstructs.State, planner ...` | `sstructs.Scheduler` | [L53](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go#L53) |
| `Process` | `s *SysBatchScheduler` | `eval *structs.Evaluation` | `err error` | [L63](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go#L63) |
| `process` | `s *SysBatchScheduler` | - | `bool, error` | [L107](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go#L107) |
| `setJob` | `s *SysBatchScheduler` | `job *structs.Job` | `error` | [L192](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go#L192) |
| `computeJobAllocs` | `s *SysBatchScheduler` | - | `error` | [L212](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go#L212) |
| `computePlacements` | `s *SysBatchScheduler` | `place []reconciler.AllocTuple, existingByTaskGroup map[string]bool` | `error` | [L306](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go#L306) |
| `addBlocked` | `s *SysBatchScheduler` | `node *structs.Node` | `error` | [L475](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go#L475) |
| `canHandle` | `s *SysBatchScheduler` | `trigger string` | `bool` | [L492](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go#L492) |
| `evictAndPlace` | - | `ctx feasible.Context, job *structs.Job, diff *reconciler.NodeReconcileResult...` | `bool` | [L515](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go#L515) |

## 5. 核心方法详解

### NewSysBatchScheduler()

**签名**：`func NewSysBatchScheduler(logger log.Logger, eventsCh chan interface{}, state sstructs.State, planner sstructs.Planner) sstructs.Scheduler`

**位置**：[L53](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go#L53)

### Process()

**签名**：`func (s *SysBatchScheduler) Process(eval *structs.Evaluation) err error`

**位置**：[L63](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go#L63)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `runtime/debug` | 标准库 |
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
| [scheduler_sysbatch_test.go](file:///d:/claude/nomad/scheduler/scheduler_sysbatch_test.go) | 对应测试文件 |

