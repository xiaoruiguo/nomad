# plan_queue.go 代码说明文档

> 文件路径：[plan_queue.go](file:///d:/claude/nomad/nomad/plan_queue.go)
> 总行数：267 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **计划队列**，管理调度计划的提交和评估，协调调度器与计划应用器之间的工作流。

## 2. 类型定义

### PlanFuture

**定义位置**：[L24](file:///d:/claude/nomad/nomad/plan_queue.go#L24)

**类型**：interface

```go
	Wait
```

### PlanQueue

**定义位置**：[L33](file:///d:/claude/nomad/nomad/plan_queue.go#L33)

**类型**：struct

```go
	enabled bool
	stats *QueueStats
	ready PendingPlans
	waitCh chan struct{...}
	l sync.RWMutex
```

**关联方法**（7 个）：`Enabled`, `SetEnabled`, `Enqueue`, `Dequeue`, `Flush`, `Stats`, `EmitStats`

### pendingPlan

**定义位置**：[L56](file:///d:/claude/nomad/nomad/plan_queue.go#L56)

**类型**：struct

```go
	plan *structs.Plan
	enqueueTime time.Time
	result *structs.PlanResult
	errCh chan error
```

**关联方法**（2 个）：`Wait`, `respond`

### PendingPlans

**定义位置**：[L78](file:///d:/claude/nomad/nomad/plan_queue.go#L78)

**类型定义**：`[]*pendingPlan`

**关联方法**（6 个）：`Len`, `Less`, `Swap`, `Push`, `Pop`, `Peek`

### QueueStats

**定义位置**：[L220](file:///d:/claude/nomad/nomad/plan_queue.go#L220)

**类型**：struct

```go
	Depth int
```

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `planQueueFlushed` | `fmt.Errorf("plan queue flushed")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewPlanQueue` | - | - | `*PlanQueue, error` | [L44](file:///d:/claude/nomad/nomad/plan_queue.go#L44) |
| `Wait` | `p *pendingPlan` | - | `*structs.PlanResult, error` | [L64](file:///d:/claude/nomad/nomad/plan_queue.go#L64) |
| `respond` | `p *pendingPlan` | `result *structs.PlanResult, err error` | - | [L70](file:///d:/claude/nomad/nomad/plan_queue.go#L70) |
| `Enabled` | `q *PlanQueue` | - | `bool` | [L81](file:///d:/claude/nomad/nomad/plan_queue.go#L81) |
| `SetEnabled` | `q *PlanQueue` | `enabled bool` | - | [L89](file:///d:/claude/nomad/nomad/plan_queue.go#L89) |
| `Enqueue` | `q *PlanQueue` | `plan *structs.Plan` | `PlanFuture, error` | [L99](file:///d:/claude/nomad/nomad/plan_queue.go#L99) |
| `Dequeue` | `q *PlanQueue` | `timeout time.Duration` | `*pendingPlan, error` | [L130](file:///d:/claude/nomad/nomad/plan_queue.go#L130) |
| `Flush` | `q *PlanQueue` | - | - | [L168](file:///d:/claude/nomad/nomad/plan_queue.go#L168) |
| `Stats` | `q *PlanQueue` | - | `*QueueStats` | [L189](file:///d:/claude/nomad/nomad/plan_queue.go#L189) |
| `EmitStats` | `q *PlanQueue` | `period time.Duration, stopCh chan struct{...}` | - | [L202](file:///d:/claude/nomad/nomad/plan_queue.go#L202) |
| `Len` | `p *PendingPlans` | - | `int` | [L225](file:///d:/claude/nomad/nomad/plan_queue.go#L225) |
| `Less` | `p *PendingPlans` | `i int, j int` | `bool` | [L233](file:///d:/claude/nomad/nomad/plan_queue.go#L233) |
| `Swap` | `p *PendingPlans` | `i int, j int` | - | [L241](file:///d:/claude/nomad/nomad/plan_queue.go#L241) |
| `Push` | `p *PendingPlans` | `e interface{}` | - | [L246](file:///d:/claude/nomad/nomad/plan_queue.go#L246) |
| `Pop` | `p *PendingPlans` | - | `interface{}` | [L251](file:///d:/claude/nomad/nomad/plan_queue.go#L251) |
| `Peek` | `p *PendingPlans` | - | `*pendingPlan` | [L260](file:///d:/claude/nomad/nomad/plan_queue.go#L260) |

## 5. 核心方法详解

### Wait()

**签名**：`func (p *pendingPlan) Wait() *structs.PlanResult, error`

**位置**：[L64](file:///d:/claude/nomad/nomad/plan_queue.go#L64)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `container/heap` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [plan_queue_test.go](file:///d:/claude/nomad/nomad/plan_queue_test.go) | 对应测试文件 |

