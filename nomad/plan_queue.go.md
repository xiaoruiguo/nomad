# plan_queue.go 代码说明文档

> 文件路径：[nomad/plan_queue.go](file:///d:/claude/nomad/nomad/plan_queue.go)
> 总行数：267 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad 核心包**（`nomad/`），实现 Server/Client 核心功能，包括 Raft 共识、状态管理、调度系统、RPC 处理等。当前文件 `plan_queue.go` 提供相关功能实现。

## 2. 类型定义

### PlanFuture

**定义位置**：[L24](file:///d:/claude/nomad/nomad/plan_queue.go#L24)

**中文说明**：PlanFuture 与计划（Plan）相关，计划是调度器提交的分配方案。

**类型**：interface

```go
type PlanFuture interface {
	Wait func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Wait` | `func(...)` | — |

### PlanQueue

**定义位置**：[L33](file:///d:/claude/nomad/nomad/plan_queue.go#L33)

**中文说明**：PlanQueue 是一个队列，按先进先出顺序管理待处理项。

**类型**：struct

```go
type PlanQueue struct {
	enabled bool
	stats *QueueStats
	ready PendingPlans
	waitCh chan struct{...}
	l sync.RWMutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `enabled` | `bool` | 是否启用 |
| `stats` | `*QueueStats` | — |
| `ready` | `PendingPlans` | 是否就绪 |
| `waitCh` | `chan struct{...}` | 信号通道 |
| `l` | `sync.RWMutex` | 读写锁，保护并发访问 |

**关联方法**（7 个）：`Enabled`, `SetEnabled`, `Enqueue`, `Dequeue`, `Flush`, `Stats`, `EmitStats`

### pendingPlan

**定义位置**：[L56](file:///d:/claude/nomad/nomad/plan_queue.go#L56)

**中文说明**：pendingPlan 与计划（Plan）相关，计划是调度器提交的分配方案。

**类型**：struct

```go
type pendingPlan struct {
	plan *structs.Plan
	enqueueTime time.Time
	result *structs.PlanResult
	errCh chan error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `plan` | `*structs.Plan` | — |
| `enqueueTime` | `time.Time` | 时间点 |
| `result` | `*structs.PlanResult` | 结果 |
| `errCh` | `chan error` | 错误通道 |

**关联方法**（2 个）：`Wait`, `respond`

### PendingPlans

**定义位置**：[L78](file:///d:/claude/nomad/nomad/plan_queue.go#L78)

**中文说明**：PendingPlans 与计划（Plan）相关，计划是调度器提交的分配方案。

**类型定义**：`type PendingPlans []*pendingPlan`

**关联方法**（6 个）：`Len`, `Less`, `Swap`, `Push`, `Pop`, `Peek`

### QueueStats

**定义位置**：[L220](file:///d:/claude/nomad/nomad/plan_queue.go#L220)

**中文说明**：QueueStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type QueueStats struct {
	Depth int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Depth` | `int` | — |

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `planQueueFlushed` | `—` | `fmt.Errorf("plan queue flushed")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewPlanQueue` | - | `` | `*PlanQueue, error` | [L44](file:///d:/claude/nomad/nomad/plan_queue.go#L44) |
| `Wait` | `p *pendingPlan` | `` | `*structs.PlanResult, error` | [L64](file:///d:/claude/nomad/nomad/plan_queue.go#L64) |
| `respond` | `p *pendingPlan` | `result *structs.PlanResult, err error` | `` | [L70](file:///d:/claude/nomad/nomad/plan_queue.go#L70) |
| `Enabled` | `q *PlanQueue` | `` | `bool` | [L81](file:///d:/claude/nomad/nomad/plan_queue.go#L81) |
| `SetEnabled` | `q *PlanQueue` | `enabled bool` | `` | [L89](file:///d:/claude/nomad/nomad/plan_queue.go#L89) |
| `Enqueue` | `q *PlanQueue` | `plan *structs.Plan` | `PlanFuture, error` | [L99](file:///d:/claude/nomad/nomad/plan_queue.go#L99) |
| `Dequeue` | `q *PlanQueue` | `timeout time.Duration` | `*pendingPlan, error` | [L130](file:///d:/claude/nomad/nomad/plan_queue.go#L130) |
| `Flush` | `q *PlanQueue` | `` | `` | [L168](file:///d:/claude/nomad/nomad/plan_queue.go#L168) |
| `Stats` | `q *PlanQueue` | `` | `*QueueStats` | [L189](file:///d:/claude/nomad/nomad/plan_queue.go#L189) |
| `EmitStats` | `q *PlanQueue` | `period time.Duration, stopCh <-chan struct{...}` | `` | [L202](file:///d:/claude/nomad/nomad/plan_queue.go#L202) |
| `Len` | `p *PendingPlans` | `` | `int` | [L225](file:///d:/claude/nomad/nomad/plan_queue.go#L225) |
| `Less` | `p *PendingPlans` | `i int, j int` | `bool` | [L233](file:///d:/claude/nomad/nomad/plan_queue.go#L233) |
| `Swap` | `p *PendingPlans` | `i int, j int` | `` | [L241](file:///d:/claude/nomad/nomad/plan_queue.go#L241) |
| `Push` | `p *PendingPlans` | `e interface{}` | `` | [L246](file:///d:/claude/nomad/nomad/plan_queue.go#L246) |
| `Pop` | `p *PendingPlans` | `` | `interface{}` | [L251](file:///d:/claude/nomad/nomad/plan_queue.go#L251) |
| `Peek` | `p *PendingPlans` | `` | `*pendingPlan` | [L260](file:///d:/claude/nomad/nomad/plan_queue.go#L260) |

## 5. 核心方法详解

### NewPlanQueue()

**签名**：`func NewPlanQueue() *PlanQueue, error`

**位置**：[L44](file:///d:/claude/nomad/nomad/plan_queue.go#L44)

**中文说明**：创建并返回一个新的 PlanQueue 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*PlanQueue` | — |
| `error` | 错误信息 |

### Wait()

**签名**：`func (p *pendingPlan) Wait() *structs.PlanResult, error`

**位置**：[L64](file:///d:/claude/nomad/nomad/plan_queue.go#L64)

**中文说明**：等待 用于 阻塞 用于 计划 结果 或 potential 错误

**返回值**：

| 类型 | 说明 |
|------|------|
| `*structs.PlanResult` | — |
| `error` | 错误信息 |

### Enqueue()

**签名**：`func (q *PlanQueue) Enqueue(plan *structs.Plan) PlanFuture, error`

**位置**：[L99](file:///d:/claude/nomad/nomad/plan_queue.go#L99)

**中文说明**：将对象加入队列。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `plan` | `*structs.Plan` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `PlanFuture` | — |
| `error` | 错误信息 |

### Dequeue()

**签名**：`func (q *PlanQueue) Dequeue(timeout time.Duration) *pendingPlan, error`

**位置**：[L130](file:///d:/claude/nomad/nomad/plan_queue.go#L130)

**中文说明**：从队列中取出对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `timeout` | `time.Duration` | 超时时间 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*pendingPlan` | — |
| `error` | 错误信息 |

### Flush()

**签名**：`func (q *PlanQueue) Flush() `

**位置**：[L168](file:///d:/claude/nomad/nomad/plan_queue.go#L168)

**中文说明**：刷新对象，清空缓存数据。

### Stats()

**签名**：`func (q *PlanQueue) Stats() *QueueStats`

**位置**：[L189](file:///d:/claude/nomad/nomad/plan_queue.go#L189)

**中文说明**：返回对象的统计信息。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*QueueStats` | — |

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
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [plan_queue_test.go](file:///d:/claude/nomad/nomad/plan_queue_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/acl.go) | 同目录源文件 |
| [acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/nomad/alloc_endpoint.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | 同目录源文件 |
| [autopilot_ce.go](file:///d:/claude/nomad/nomad/autopilot_ce.go) | 同目录源文件 |

