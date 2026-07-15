# eval_broker.go 代码说明文档

> 文件路径：[eval_broker.go](file:///d:/claude/nomad/nomad/eval_broker.go)
> 总行数：1130 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **评估队列代理（EvalBroker）**，管理待处理评估的分发和确认，支持优先级和公平调度。是调度器的工作队列。

## 2. 类型定义

### EvalBroker

**定义位置**：[L53](file:///d:/claude/nomad/nomad/eval_broker.go#L53)

**类型**：struct

```go
	nackTimeout time.Duration
	deliveryLimit int
	enabled bool
	enabledNotifier *broker.GenericNotifier
	stats *BrokerStats
	evals map[string]int
	jobEvals map[structs.NamespacedID]string
	pending map[structs.NamespacedID]PendingEvaluations
	cancelable []*structs.Evaluation
	ready map[string]ReadyEvaluations
	unack map[string]*unackEval
	waiting map[string]chan struct{...}
	requeue map[string]*structs.Evaluation
	timeWait map[string]*time.Timer
	delayedEvalCancelFunc context.CancelFunc
	delayHeap *delayheap.DelayHeap
	delayedEvalsUpdateCh chan struct{...}
	initialNackDelay time.Duration
	subsequentNackDelay time.Duration
	enqueuedTime map[string]time.Time
	dequeuedTime map[string]time.Time
	l sync.RWMutex
```

**关联方法**（28 个）：`Enabled`, `SetEnabled`, `Enqueue`, `Restore`, `EnqueueAll`, `processEnqueue`, `processWaitingEnqueue`, `enqueueWaiting`, `enqueueLocked`, `Dequeue`, `scanForSchedulers`, `dequeueForSched`, `waitForSchedulers`, `Outstanding`, `OutstandingReset`, `Ack`, `Nack`, `nackReenqueueDelay`, `PauseNackTimeout`, `ResumeNackTimeout`, `handleAckNackLocked`, `DropWaiting`, `flush`, `runDelayedEvalsWatcher`, `nextDelayedEval`, `Stats`, `Cancelable`, `EmitStats`

### unackEval

**定义位置**：[L125](file:///d:/claude/nomad/nomad/eval_broker.go#L125)

**类型**：struct

```go
	Eval *structs.Evaluation
	Token string
	NackTimer *time.Timer
```

### ReadyEvaluations

**定义位置**：[L133](file:///d:/claude/nomad/nomad/eval_broker.go#L133)

**类型定义**：`[]*structs.Evaluation`

**关联方法**（6 个）：`Len`, `Less`, `Swap`, `Push`, `Pop`, `Peek`

### PendingEvaluations

**定义位置**：[L137](file:///d:/claude/nomad/nomad/eval_broker.go#L137)

**类型定义**：`[]*structs.Evaluation`

**关联方法**（6 个）：`Len`, `Less`, `Swap`, `Push`, `Pop`, `MarkForCancel`

### evalWrapper

**定义位置**：[L868](file:///d:/claude/nomad/nomad/eval_broker.go#L868)

**类型**：struct

```go
	eval *structs.Evaluation
```

**关联方法**（3 个）：`Data`, `ID`, `Namespace`

### BrokerStats

**定义位置**：[L1019](file:///d:/claude/nomad/nomad/eval_broker.go#L1019)

**类型**：struct

```go
	TotalReady int
	TotalUnacked int
	TotalPending int
	TotalWaiting int
	TotalCancelable int
	DelayedEvals map[string]*structs.Evaluation
	ByScheduler map[string]*SchedulerStats
```

### SchedulerStats

**定义位置**：[L1030](file:///d:/claude/nomad/nomad/eval_broker.go#L1030)

**类型**：struct

```go
	Ready int
	Unacked int
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `failedQueue` | `"_failed"` |

### 变量

| 名称 | 值 |
|------|----|
| `ErrNotOutstanding` | `errors.New("evaluation is not outstanding")` |
| `ErrTokenMismatch` | `errors.New("evaluation token does not match")` |
| `ErrNackTimeoutReached` | `errors.New("evaluation nack timeout reached")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewEvalBroker` | - | `ctx context.Context, timeout time.Duration, initialNackDelay time.Duration, ...` | `*EvalBroker, error` | [L146](file:///d:/claude/nomad/nomad/eval_broker.go#L146) |
| `Enabled` | `b *EvalBroker` | - | `bool` | [L179](file:///d:/claude/nomad/nomad/eval_broker.go#L179) |
| `SetEnabled` | `b *EvalBroker` | `enabled bool` | - | [L187](file:///d:/claude/nomad/nomad/eval_broker.go#L187) |
| `Enqueue` | `b *EvalBroker` | `eval *structs.Evaluation` | - | [L214](file:///d:/claude/nomad/nomad/eval_broker.go#L214) |
| `Restore` | `b *EvalBroker` | `eval *structs.Evaluation` | - | [L223](file:///d:/claude/nomad/nomad/eval_broker.go#L223) |
| `EnqueueAll` | `b *EvalBroker` | `evals map[*structs.Evaluation]string` | - | [L239](file:///d:/claude/nomad/nomad/eval_broker.go#L239) |
| `processEnqueue` | `b *EvalBroker` | `eval *structs.Evaluation, token string, trackTime bool` | - | [L254](file:///d:/claude/nomad/nomad/eval_broker.go#L254) |
| `processWaitingEnqueue` | `b *EvalBroker` | `eval *structs.Evaluation, trackTime bool` | - | [L300](file:///d:/claude/nomad/nomad/eval_broker.go#L300) |
| `enqueueWaiting` | `b *EvalBroker` | `eval *structs.Evaluation, trackTime bool` | - | [L309](file:///d:/claude/nomad/nomad/eval_broker.go#L309) |
| `enqueueLocked` | `b *EvalBroker` | `eval *structs.Evaluation, sched string, trackTime bool` | - | [L320](file:///d:/claude/nomad/nomad/eval_broker.go#L320) |
| `Dequeue` | `b *EvalBroker` | `schedulers []string, timeout time.Duration` | `*structs.Evaluation, string, error` | [L385](file:///d:/claude/nomad/nomad/eval_broker.go#L385) |
| `scanForSchedulers` | `b *EvalBroker` | `schedulers []string` | `*structs.Evaluation, string, error` | [L435](file:///d:/claude/nomad/nomad/eval_broker.go#L435) |
| `dequeueForSched` | `b *EvalBroker` | `sched string` | `*structs.Evaluation, string, error` | [L493](file:///d:/claude/nomad/nomad/eval_broker.go#L493) |
| `waitForSchedulers` | `b *EvalBroker` | `schedulers []string, timeoutCh chan time.Time` | `bool` | [L529](file:///d:/claude/nomad/nomad/eval_broker.go#L529) |
| `Outstanding` | `b *EvalBroker` | `evalID string` | `string, bool` | [L570](file:///d:/claude/nomad/nomad/eval_broker.go#L570) |
| `OutstandingReset` | `b *EvalBroker` | `evalID string, token string` | `error` | [L582](file:///d:/claude/nomad/nomad/eval_broker.go#L582) |
| `Ack` | `b *EvalBroker` | `evalID string, token string` | `error` | [L599](file:///d:/claude/nomad/nomad/eval_broker.go#L599) |
| `Nack` | `b *EvalBroker` | `evalID string, token string` | `error` | [L678](file:///d:/claude/nomad/nomad/eval_broker.go#L678) |
| `nackReenqueueDelay` | `b *EvalBroker` | `prevDequeues int` | `time.Duration` | [L728](file:///d:/claude/nomad/nomad/eval_broker.go#L728) |
| `PauseNackTimeout` | `b *EvalBroker` | `evalID string, token string` | `error` | [L742](file:///d:/claude/nomad/nomad/eval_broker.go#L742) |
| `ResumeNackTimeout` | `b *EvalBroker` | `evalID string, token string` | `error` | [L760](file:///d:/claude/nomad/nomad/eval_broker.go#L760) |
| `handleAckNackLocked` | `b *EvalBroker` | `eval *structs.Evaluation` | - | [L774](file:///d:/claude/nomad/nomad/eval_broker.go#L774) |
| `DropWaiting` | `b *EvalBroker` | `eval *structs.Evaluation` | - | [L804](file:///d:/claude/nomad/nomad/eval_broker.go#L804) |
| `flush` | `b *EvalBroker` | - | - | [L822](file:///d:/claude/nomad/nomad/eval_broker.go#L822) |
| `Data` | `d *evalWrapper` | - | `interface{}` | [L872](file:///d:/claude/nomad/nomad/eval_broker.go#L872) |
| `ID` | `d *evalWrapper` | - | `string` | [L876](file:///d:/claude/nomad/nomad/eval_broker.go#L876) |
| `Namespace` | `d *evalWrapper` | - | `string` | [L880](file:///d:/claude/nomad/nomad/eval_broker.go#L880) |
| `runDelayedEvalsWatcher` | `b *EvalBroker` | `ctx context.Context, updateCh chan struct{...}` | - | [L886](file:///d:/claude/nomad/nomad/eval_broker.go#L886) |
| `nextDelayedEval` | `b *EvalBroker` | - | `*structs.Evaluation, time.Time` | [L922](file:///d:/claude/nomad/nomad/eval_broker.go#L922) |
| `Stats` | `b *EvalBroker` | - | `*BrokerStats` | [L939](file:///d:/claude/nomad/nomad/eval_broker.go#L939) |
| `Cancelable` | `b *EvalBroker` | `batchSize int` | `[]*structs.Evaluation` | [L968](file:///d:/claude/nomad/nomad/eval_broker.go#L968) |
| `EmitStats` | `b *EvalBroker` | `period time.Duration, stopCh chan struct{...}` | - | [L984](file:///d:/claude/nomad/nomad/eval_broker.go#L984) |
| `Len` | `r *ReadyEvaluations` | - | `int` | [L1036](file:///d:/claude/nomad/nomad/eval_broker.go#L1036) |
| `Less` | `r *ReadyEvaluations` | `i int, j int` | `bool` | [L1043](file:///d:/claude/nomad/nomad/eval_broker.go#L1043) |
| `Swap` | `r *ReadyEvaluations` | `i int, j int` | - | [L1051](file:///d:/claude/nomad/nomad/eval_broker.go#L1051) |
| `Push` | `r *ReadyEvaluations` | `e interface{}` | - | [L1056](file:///d:/claude/nomad/nomad/eval_broker.go#L1056) |
| `Pop` | `r *ReadyEvaluations` | - | `interface{}` | [L1061](file:///d:/claude/nomad/nomad/eval_broker.go#L1061) |
| `Peek` | `r *ReadyEvaluations` | - | `*structs.Evaluation` | [L1070](file:///d:/claude/nomad/nomad/eval_broker.go#L1070) |
| `Len` | `p *PendingEvaluations` | - | `int` | [L1079](file:///d:/claude/nomad/nomad/eval_broker.go#L1079) |
| `Less` | `p *PendingEvaluations` | `i int, j int` | `bool` | [L1086](file:///d:/claude/nomad/nomad/eval_broker.go#L1086) |
| `Swap` | `p *PendingEvaluations` | `i int, j int` | - | [L1094](file:///d:/claude/nomad/nomad/eval_broker.go#L1094) |
| `Push` | `p *PendingEvaluations` | `e interface{}` | - | [L1099](file:///d:/claude/nomad/nomad/eval_broker.go#L1099) |
| `Pop` | `p *PendingEvaluations` | - | `interface{}` | [L1104](file:///d:/claude/nomad/nomad/eval_broker.go#L1104) |
| `MarkForCancel` | `p *PendingEvaluations` | - | `[]*structs.Evaluation` | [L1116](file:///d:/claude/nomad/nomad/eval_broker.go#L1116) |

## 5. 核心方法详解

### Restore()

**签名**：`func (b *EvalBroker) Restore(eval *structs.Evaluation) `

**位置**：[L223](file:///d:/claude/nomad/nomad/eval_broker.go#L223)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `container/heap` | 标准库 |
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `math/rand` | 标准库 |
| `strconv` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/broker` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/lib/delayheap` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |

## 7. 设计模式与技术特点

- **调度器模式**：实现调度器接口，从评估队列获取评估并产生调度计划
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [eval_broker_test.go](file:///d:/claude/nomad/nomad/eval_broker_test.go) | 对应测试文件 |

