# eval_broker.go 代码说明文档

> 文件路径：[nomad/eval_broker.go](file:///d:/claude/nomad/nomad/eval_broker.go)
> 总行数：1130 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad 核心包**（`nomad/`），实现 Server/Client 核心功能，包括 Raft 共识、状态管理、调度系统、RPC 处理等。当前文件 `eval_broker.go` 提供相关功能实现。

## 2. 类型定义

### EvalBroker

**定义位置**：[L53](file:///d:/claude/nomad/nomad/eval_broker.go#L53)

**中文说明**：EvalBroker 是一个代理器，分发和管理待处理的消息或任务。

**类型**：struct

```go
type EvalBroker struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `nackTimeout` | `time.Duration` | 时间间隔 |
| `deliveryLimit` | `int` | — |
| `enabled` | `bool` | 是否启用 |
| `enabledNotifier` | `*broker.GenericNotifier` | — |
| `stats` | `*BrokerStats` | — |
| `evals` | `map[string]int` | 映射表 |
| `jobEvals` | `map[structs.NamespacedID]string` | 映射表 |
| `pending` | `map[structs.NamespacedID]PendingEvaluations` | 映射表 |
| `cancelable` | `[]*structs.Evaluation` | 列表 |
| `ready` | `map[string]ReadyEvaluations` | 是否就绪 |
| `unack` | `map[string]*unackEval` | 映射表 |
| `waiting` | `map[string]chan struct{...}` | 信号通道 |
| `requeue` | `map[string]*structs.Evaluation` | 映射表 |
| `timeWait` | `map[string]*time.Timer` | 时间点 |
| `delayedEvalCancelFunc` | `context.CancelFunc` | 取消函数，用于取消上下文 |
| `delayHeap` | `*delayheap.DelayHeap` | — |
| `delayedEvalsUpdateCh` | `chan struct{...}` | 信号通道 |
| `initialNackDelay` | `time.Duration` | 时间间隔 |
| `subsequentNackDelay` | `time.Duration` | 时间间隔 |
| `enqueuedTime` | `map[string]time.Time` | 时间点 |
| `dequeuedTime` | `map[string]time.Time` | 时间点 |
| `l` | `sync.RWMutex` | 读写锁，保护并发访问 |

**关联方法**（28 个）：`Enabled`, `SetEnabled`, `Enqueue`, `Restore`, `EnqueueAll`, `processEnqueue`, `processWaitingEnqueue`, `enqueueWaiting`, `enqueueLocked`, `Dequeue`, `scanForSchedulers`, `dequeueForSched`, `waitForSchedulers`, `Outstanding`, `OutstandingReset`, `Ack`, `Nack`, `nackReenqueueDelay`, `PauseNackTimeout`, `ResumeNackTimeout`, `handleAckNackLocked`, `DropWaiting`, `flush`, `runDelayedEvalsWatcher`, `nextDelayedEval`, `Stats`, `Cancelable`, `EmitStats`

### unackEval

**定义位置**：[L125](file:///d:/claude/nomad/nomad/eval_broker.go#L125)

**中文说明**：unackEval 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型**：struct

```go
type unackEval struct {
	Eval *structs.Evaluation
	Token string
	NackTimer *time.Timer
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Eval` | `*structs.Evaluation` | — |
| `Token` | `string` | 令牌，用于认证或标识 |
| `NackTimer` | `*time.Timer` | 时间点 |

### ReadyEvaluations

**定义位置**：[L133](file:///d:/claude/nomad/nomad/eval_broker.go#L133)

**中文说明**：ReadyEvaluations 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型定义**：`type ReadyEvaluations []*structs.Evaluation`

**关联方法**（6 个）：`Len`, `Less`, `Swap`, `Push`, `Pop`, `Peek`

### PendingEvaluations

**定义位置**：[L137](file:///d:/claude/nomad/nomad/eval_broker.go#L137)

**中文说明**：PendingEvaluations 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型定义**：`type PendingEvaluations []*structs.Evaluation`

**关联方法**（6 个）：`Len`, `Less`, `Swap`, `Push`, `Pop`, `MarkForCancel`

### evalWrapper

**定义位置**：[L868](file:///d:/claude/nomad/nomad/eval_broker.go#L868)

**中文说明**：evalWrapper 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型**：struct

```go
type evalWrapper struct {
	eval *structs.Evaluation
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `eval` | `*structs.Evaluation` | — |

**关联方法**（3 个）：`Data`, `ID`, `Namespace`

### BrokerStats

**定义位置**：[L1019](file:///d:/claude/nomad/nomad/eval_broker.go#L1019)

**中文说明**：BrokerStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type BrokerStats struct {
	TotalReady int
	TotalUnacked int
	TotalPending int
	TotalWaiting int
	TotalCancelable int
	DelayedEvals map[string]*structs.Evaluation
	ByScheduler map[string]*SchedulerStats
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TotalReady` | `int` | — |
| `TotalUnacked` | `int` | — |
| `TotalPending` | `int` | — |
| `TotalWaiting` | `int` | — |
| `TotalCancelable` | `int` | — |
| `DelayedEvals` | `map[string]*structs.Evaluation` | 映射表 |
| `ByScheduler` | `map[string]*SchedulerStats` | 映射表 |

### SchedulerStats

**定义位置**：[L1030](file:///d:/claude/nomad/nomad/eval_broker.go#L1030)

**中文说明**：SchedulerStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type SchedulerStats struct {
	Ready int
	Unacked int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Ready` | `int` | 是否就绪 |
| `Unacked` | `int` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `failedQueue` | `—` | `"_failed"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ErrNotOutstanding` | `—` | `errors.New("evaluation is not outstanding")` | — |
| `ErrTokenMismatch` | `—` | `errors.New("evaluation token does not match")` | — |
| `ErrNackTimeoutReached` | `—` | `errors.New("evaluation nack timeout reached")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewEvalBroker` | - | `ctx context.Context, timeout time.Duration, initialNackDelay time.Duration, s...` | `*EvalBroker, error` | [L146](file:///d:/claude/nomad/nomad/eval_broker.go#L146) |
| `Enabled` | `b *EvalBroker` | `` | `bool` | [L179](file:///d:/claude/nomad/nomad/eval_broker.go#L179) |
| `SetEnabled` | `b *EvalBroker` | `enabled bool` | `` | [L187](file:///d:/claude/nomad/nomad/eval_broker.go#L187) |
| `Enqueue` | `b *EvalBroker` | `eval *structs.Evaluation` | `` | [L214](file:///d:/claude/nomad/nomad/eval_broker.go#L214) |
| `Restore` | `b *EvalBroker` | `eval *structs.Evaluation` | `` | [L223](file:///d:/claude/nomad/nomad/eval_broker.go#L223) |
| `EnqueueAll` | `b *EvalBroker` | `evals map[*structs.Evaluation]string` | `` | [L239](file:///d:/claude/nomad/nomad/eval_broker.go#L239) |
| `processEnqueue` | `b *EvalBroker` | `eval *structs.Evaluation, token string, trackTime bool` | `` | [L254](file:///d:/claude/nomad/nomad/eval_broker.go#L254) |
| `processWaitingEnqueue` | `b *EvalBroker` | `eval *structs.Evaluation, trackTime bool` | `` | [L300](file:///d:/claude/nomad/nomad/eval_broker.go#L300) |
| `enqueueWaiting` | `b *EvalBroker` | `eval *structs.Evaluation, trackTime bool` | `` | [L309](file:///d:/claude/nomad/nomad/eval_broker.go#L309) |
| `enqueueLocked` | `b *EvalBroker` | `eval *structs.Evaluation, sched string, trackTime bool` | `` | [L320](file:///d:/claude/nomad/nomad/eval_broker.go#L320) |
| `Dequeue` | `b *EvalBroker` | `schedulers []string, timeout time.Duration` | `*structs.Evaluation, string, error` | [L385](file:///d:/claude/nomad/nomad/eval_broker.go#L385) |
| `scanForSchedulers` | `b *EvalBroker` | `schedulers []string` | `*structs.Evaluation, string, error` | [L435](file:///d:/claude/nomad/nomad/eval_broker.go#L435) |
| `dequeueForSched` | `b *EvalBroker` | `sched string` | `*structs.Evaluation, string, error` | [L493](file:///d:/claude/nomad/nomad/eval_broker.go#L493) |
| `waitForSchedulers` | `b *EvalBroker` | `schedulers []string, timeoutCh <-chan time.Time` | `bool` | [L529](file:///d:/claude/nomad/nomad/eval_broker.go#L529) |
| `Outstanding` | `b *EvalBroker` | `evalID string` | `string, bool` | [L570](file:///d:/claude/nomad/nomad/eval_broker.go#L570) |
| `OutstandingReset` | `b *EvalBroker` | `evalID string, token string` | `error` | [L582](file:///d:/claude/nomad/nomad/eval_broker.go#L582) |
| `Ack` | `b *EvalBroker` | `evalID string, token string` | `error` | [L599](file:///d:/claude/nomad/nomad/eval_broker.go#L599) |
| `Nack` | `b *EvalBroker` | `evalID string, token string` | `error` | [L678](file:///d:/claude/nomad/nomad/eval_broker.go#L678) |
| `nackReenqueueDelay` | `b *EvalBroker` | `prevDequeues int` | `time.Duration` | [L728](file:///d:/claude/nomad/nomad/eval_broker.go#L728) |
| `PauseNackTimeout` | `b *EvalBroker` | `evalID string, token string` | `error` | [L742](file:///d:/claude/nomad/nomad/eval_broker.go#L742) |
| `ResumeNackTimeout` | `b *EvalBroker` | `evalID string, token string` | `error` | [L760](file:///d:/claude/nomad/nomad/eval_broker.go#L760) |
| `handleAckNackLocked` | `b *EvalBroker` | `eval *structs.Evaluation` | `` | [L774](file:///d:/claude/nomad/nomad/eval_broker.go#L774) |
| `DropWaiting` | `b *EvalBroker` | `eval *structs.Evaluation` | `` | [L804](file:///d:/claude/nomad/nomad/eval_broker.go#L804) |
| `flush` | `b *EvalBroker` | `` | `` | [L822](file:///d:/claude/nomad/nomad/eval_broker.go#L822) |
| `Data` | `d *evalWrapper` | `` | `interface{}` | [L872](file:///d:/claude/nomad/nomad/eval_broker.go#L872) |
| `ID` | `d *evalWrapper` | `` | `string` | [L876](file:///d:/claude/nomad/nomad/eval_broker.go#L876) |
| `Namespace` | `d *evalWrapper` | `` | `string` | [L880](file:///d:/claude/nomad/nomad/eval_broker.go#L880) |
| `runDelayedEvalsWatcher` | `b *EvalBroker` | `ctx context.Context, updateCh <-chan struct{...}` | `` | [L886](file:///d:/claude/nomad/nomad/eval_broker.go#L886) |
| `nextDelayedEval` | `b *EvalBroker` | `` | `*structs.Evaluation, time.Time` | [L922](file:///d:/claude/nomad/nomad/eval_broker.go#L922) |
| `Stats` | `b *EvalBroker` | `` | `*BrokerStats` | [L939](file:///d:/claude/nomad/nomad/eval_broker.go#L939) |
| `Cancelable` | `b *EvalBroker` | `batchSize int` | `[]*structs.Evaluation` | [L968](file:///d:/claude/nomad/nomad/eval_broker.go#L968) |
| `EmitStats` | `b *EvalBroker` | `period time.Duration, stopCh <-chan struct{...}` | `` | [L984](file:///d:/claude/nomad/nomad/eval_broker.go#L984) |
| `Len` | `r *ReadyEvaluations` | `` | `int` | [L1036](file:///d:/claude/nomad/nomad/eval_broker.go#L1036) |
| `Less` | `r *ReadyEvaluations` | `i int, j int` | `bool` | [L1043](file:///d:/claude/nomad/nomad/eval_broker.go#L1043) |
| `Swap` | `r *ReadyEvaluations` | `i int, j int` | `` | [L1051](file:///d:/claude/nomad/nomad/eval_broker.go#L1051) |
| `Push` | `r *ReadyEvaluations` | `e interface{}` | `` | [L1056](file:///d:/claude/nomad/nomad/eval_broker.go#L1056) |
| `Pop` | `r *ReadyEvaluations` | `` | `interface{}` | [L1061](file:///d:/claude/nomad/nomad/eval_broker.go#L1061) |
| `Peek` | `r *ReadyEvaluations` | `` | `*structs.Evaluation` | [L1070](file:///d:/claude/nomad/nomad/eval_broker.go#L1070) |
| `Len` | `p *PendingEvaluations` | `` | `int` | [L1079](file:///d:/claude/nomad/nomad/eval_broker.go#L1079) |
| `Less` | `p *PendingEvaluations` | `i int, j int` | `bool` | [L1086](file:///d:/claude/nomad/nomad/eval_broker.go#L1086) |
| `Swap` | `p *PendingEvaluations` | `i int, j int` | `` | [L1094](file:///d:/claude/nomad/nomad/eval_broker.go#L1094) |
| `Push` | `p *PendingEvaluations` | `e interface{}` | `` | [L1099](file:///d:/claude/nomad/nomad/eval_broker.go#L1099) |
| `Pop` | `p *PendingEvaluations` | `` | `interface{}` | [L1104](file:///d:/claude/nomad/nomad/eval_broker.go#L1104) |
| `MarkForCancel` | `p *PendingEvaluations` | `` | `[]*structs.Evaluation` | [L1116](file:///d:/claude/nomad/nomad/eval_broker.go#L1116) |

## 5. 核心方法详解

### NewEvalBroker()

**签名**：`func NewEvalBroker(ctx context.Context, timeout time.Duration, initialNackDelay time.Duration, subsequentNackDelay time.Duration, deliveryLimit int) *EvalBroker, error`

**位置**：[L146](file:///d:/claude/nomad/nomad/eval_broker.go#L146)

**中文说明**：创建并返回一个新的 EvalBroker 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `timeout` | `time.Duration` | 超时时间 |
| `initialNackDelay` | `time.Duration` | 时间间隔 |
| `subsequentNackDelay` | `time.Duration` | 时间间隔 |
| `deliveryLimit` | `int` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*EvalBroker` | — |
| `error` | 错误信息 |

### Enqueue()

**签名**：`func (b *EvalBroker) Enqueue(eval *structs.Evaluation) `

**位置**：[L214](file:///d:/claude/nomad/nomad/eval_broker.go#L214)

**中文说明**：将对象加入队列。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `eval` | `*structs.Evaluation` | — |

### Restore()

**签名**：`func (b *EvalBroker) Restore(eval *structs.Evaluation) `

**位置**：[L223](file:///d:/claude/nomad/nomad/eval_broker.go#L223)

**中文说明**：从快照恢复对象的状态。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `eval` | `*structs.Evaluation` | — |

### Dequeue()

**签名**：`func (b *EvalBroker) Dequeue(schedulers []string, timeout time.Duration) *structs.Evaluation, string, error`

**位置**：[L385](file:///d:/claude/nomad/nomad/eval_broker.go#L385)

**中文说明**：从队列中取出对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `schedulers` | `[]string` | 列表 |
| `timeout` | `time.Duration` | 超时时间 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*structs.Evaluation` | — |
| `string` | 字符串 |
| `error` | 错误信息 |

### Stats()

**签名**：`func (b *EvalBroker) Stats() *BrokerStats`

**位置**：[L939](file:///d:/claude/nomad/nomad/eval_broker.go#L939)

**中文说明**：返回对象的统计信息。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*BrokerStats` | — |

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

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **指标收集**：使用 `go-metrics` 收集运行时指标
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [eval_broker_test.go](file:///d:/claude/nomad/nomad/eval_broker_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/acl.go) | 同目录源文件 |
| [acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/nomad/alloc_endpoint.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | 同目录源文件 |
| [autopilot_ce.go](file:///d:/claude/nomad/nomad/autopilot_ce.go) | 同目录源文件 |

