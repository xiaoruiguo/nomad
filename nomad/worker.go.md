# worker.go 代码说明文档

> 文件路径：[worker.go](file:///d:/claude/nomad/nomad/worker.go)
> 总行数：916 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **调度工作器（Worker）**，从评估队列获取待处理评估，调用调度器处理，将结果写回状态存储。是调度循环的执行单元。

## 2. 类型定义

### WorkerStatus

**定义位置**：[L58](file:///d:/claude/nomad/nomad/worker.go#L58)

**类型定义**：`int`

### SchedulerWorkerStatus

**定义位置**：[L72](file:///d:/claude/nomad/nomad/worker.go#L72)

**类型定义**：`int`

### Worker

**定义位置**：[L92](file:///d:/claude/nomad/nomad/worker.go#L92)

**类型**：struct

```go
	srv *Server
	logger log.Logger
	start time.Time
	id string
	status WorkerStatus
	workloadStatus SchedulerWorkerStatus
	statusLock sync.RWMutex
	shutdownCh chan struct{...}
	pauseFlag bool
	pauseLock sync.Mutex
	pauseCond *sync.Cond
	ctx context.Context
	cancelFn context.CancelFunc
	enabledSchedulers []string
	failures uint64
	failureBackoff time.Duration
	evalToken string
	snapshotIndex uint64
```

**关联方法**（38 个）：`ID`, `Start`, `Pause`, `Resume`, `Stop`, `IsStarted`, `IsPaused`, `IsStopped`, `isPausable`, `GetStatus`, `setStatuses`, `setStatus`, `setWorkerStatusLocked`, `GetWorkloadStatus`, `setWorkloadStatus`, `setWorkloadStatusLocked`, `Info`, `setPauseFlag`, `maybeWait`, `shutdown`, `markStopped`, `workerShuttingDown`, `run`, `dequeueEvaluation`, `sendAcknowledgement`, `sendNack`, `sendAck`, `snapshotMinIndex`, `invokeScheduler`, `ServersMeetMinimumVersion`, `SubmitPlan`, `UpdateEval`, `CreateEval`, `ReblockEval`, `shouldResubmit`, `backoffErr`, `backoffReset`, `ShutdownCh`

### WorkerInfo

**定义位置**：[L276](file:///d:/claude/nomad/nomad/worker.go#L276)

**类型**：struct

```go
	ID string `json:"id"`
	EnabledSchedulers []string `json:"enabled_schedulers"`
	Started time.Time `json:"started"`
	Status string `json:"status"`
	WorkloadStatus string `json:"workload_status"`
```

**关联方法**（2 个）：`Copy`, `String`

### ErrMinIndexDeadlineExceeded

**定义位置**：[L576](file:///d:/claude/nomad/nomad/worker.go#L576)

**类型**：struct

```go
	waitIndex uint64
	timeout time.Duration
```

**关联方法**（2 个）：`Unwrap`, `Error`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `backoffBaselineFast` | `20 * time.Millisecond` |
| `backoffBaselineSlow` | `500 * time.Millisecond` |
| `backoffLimitSlow` | `10 * time.Second` |
| `backoffSchedulerVersionMismatch` | `30 * time.Second` |
| `dequeueTimeout` | `500 * time.Millisecond` |
| `raftSyncLimit` | `5 * time.Second` |
| `dequeueErrGrace` | `10 * time.Second` |
| `WorkerUnknownStatus` | `iota` |
| `WorkerStarting` | `` |
| `WorkerStarted` | `` |
| `WorkerPausing` | `` |
| `WorkerPaused` | `` |
| `WorkerResuming` | `` |
| `WorkerStopping` | `` |
| `WorkerStopped` | `` |
| `WorkloadUnknownStatus` | `iota` |
| `WorkloadRunning` | `` |
| `WorkloadWaitingToDequeue` | `` |
| `WorkloadWaitingForRaft` | `` |
| `WorkloadScheduling` | `` |
| `WorkloadSubmitting` | `` |
| `WorkloadBackoff` | `` |
| `WorkloadStopped` | `` |
| `WorkloadPaused` | `` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewWorker` | - | `ctx context.Context, srv *Server, args SchedulerWorkerPoolArgs` | `*Worker, error` | [L128](file:///d:/claude/nomad/nomad/worker.go#L128) |
| `newWorker` | - | `ctx context.Context, srv *Server, args SchedulerWorkerPoolArgs` | `*Worker` | [L135](file:///d:/claude/nomad/nomad/worker.go#L135) |
| `ID` | `w *Worker` | - | `string` | [L155](file:///d:/claude/nomad/nomad/worker.go#L155) |
| `Start` | `w *Worker` | - | - | [L161](file:///d:/claude/nomad/nomad/worker.go#L161) |
| `Pause` | `w *Worker` | - | - | [L168](file:///d:/claude/nomad/nomad/worker.go#L168) |
| `Resume` | `w *Worker` | - | - | [L177](file:///d:/claude/nomad/nomad/worker.go#L177) |
| `Stop` | `w *Worker` | - | - | [L187](file:///d:/claude/nomad/nomad/worker.go#L187) |
| `IsStarted` | `w *Worker` | - | `bool` | [L193](file:///d:/claude/nomad/nomad/worker.go#L193) |
| `IsPaused` | `w *Worker` | - | `bool` | [L198](file:///d:/claude/nomad/nomad/worker.go#L198) |
| `IsStopped` | `w *Worker` | - | `bool` | [L203](file:///d:/claude/nomad/nomad/worker.go#L203) |
| `isPausable` | `w *Worker` | - | `bool` | [L207](file:///d:/claude/nomad/nomad/worker.go#L207) |
| `GetStatus` | `w *Worker` | - | `WorkerStatus` | [L219](file:///d:/claude/nomad/nomad/worker.go#L219) |
| `setStatuses` | `w *Worker` | `newWorkerStatus WorkerStatus, newWorkloadStatus SchedulerWorkerStatus` | - | [L228](file:///d:/claude/nomad/nomad/worker.go#L228) |
| `setStatus` | `w *Worker` | `newStatus WorkerStatus` | - | [L239](file:///d:/claude/nomad/nomad/worker.go#L239) |
| `setWorkerStatusLocked` | `w *Worker` | `newStatus WorkerStatus` | - | [L245](file:///d:/claude/nomad/nomad/worker.go#L245) |
| `GetWorkloadStatus` | `w *Worker` | - | `SchedulerWorkerStatus` | [L254](file:///d:/claude/nomad/nomad/worker.go#L254) |
| `setWorkloadStatus` | `w *Worker` | `newStatus SchedulerWorkerStatus` | - | [L262](file:///d:/claude/nomad/nomad/worker.go#L262) |
| `setWorkloadStatusLocked` | `w *Worker` | `newStatus SchedulerWorkerStatus` | - | [L268](file:///d:/claude/nomad/nomad/worker.go#L268) |
| `Copy` | `w *WorkerInfo` | - | `WorkerInfo` | [L284](file:///d:/claude/nomad/nomad/worker.go#L284) |
| `String` | `w *WorkerInfo` | - | `string` | [L296](file:///d:/claude/nomad/nomad/worker.go#L296) |
| `Info` | `w *Worker` | - | `WorkerInfo` | [L302](file:///d:/claude/nomad/nomad/worker.go#L302) |
| `setPauseFlag` | `w *Worker` | `pause bool` | - | [L321](file:///d:/claude/nomad/nomad/worker.go#L321) |
| `maybeWait` | `w *Worker` | - | - | [L330](file:///d:/claude/nomad/nomad/worker.go#L330) |
| `shutdown` | `w *Worker` | - | - | [L364](file:///d:/claude/nomad/nomad/worker.go#L364) |
| `markStopped` | `w *Worker` | - | - | [L379](file:///d:/claude/nomad/nomad/worker.go#L379) |
| `workerShuttingDown` | `w *Worker` | - | `bool` | [L384](file:///d:/claude/nomad/nomad/worker.go#L384) |
| `run` | `w *Worker` | `raftSyncLimit time.Duration` | - | [L398](file:///d:/claude/nomad/nomad/worker.go#L398) |
| `dequeueEvaluation` | `w *Worker` | `timeout time.Duration` | `eval *structs.Evaluation, token string, waitIndex uint64...` | [L477](file:///d:/claude/nomad/nomad/worker.go#L477) |
| `sendAcknowledgement` | `w *Worker` | `eval *structs.Evaluation, token string, ack bool` | - | [L535](file:///d:/claude/nomad/nomad/worker.go#L535) |
| `sendNack` | `w *Worker` | `eval *structs.Evaluation, token string` | - | [L566](file:///d:/claude/nomad/nomad/worker.go#L566) |
| `sendAck` | `w *Worker` | `eval *structs.Evaluation, token string` | - | [L572](file:///d:/claude/nomad/nomad/worker.go#L572) |
| `Unwrap` | ` *ErrMinIndexDeadlineExceeded` | - | `error` | [L583](file:///d:/claude/nomad/nomad/worker.go#L583) |
| `Error` | `e *ErrMinIndexDeadlineExceeded` | - | `string` | [L587](file:///d:/claude/nomad/nomad/worker.go#L587) |
| `snapshotMinIndex` | `w *Worker` | `waitIndex uint64, timeout time.Duration` | `*state.StateSnapshot, error` | [L592](file:///d:/claude/nomad/nomad/worker.go#L592) |
| `invokeScheduler` | `w *Worker` | `snap *state.StateSnapshot, eval *structs.Evaluation, token string` | `error` | [L611](file:///d:/claude/nomad/nomad/worker.go#L611) |
| `ServersMeetMinimumVersion` | `w *Worker` | `minVersion *version.Version, checkFailedServers bool` | `bool` | [L645](file:///d:/claude/nomad/nomad/worker.go#L645) |
| `SubmitPlan` | `w *Worker` | `plan *structs.Plan` | `*structs.PlanResult, sstructs.State, error` | [L651](file:///d:/claude/nomad/nomad/worker.go#L651) |
| `UpdateEval` | `w *Worker` | `eval *structs.Evaluation` | `error` | [L731](file:///d:/claude/nomad/nomad/worker.go#L731) |
| `CreateEval` | `w *Worker` | `eval *structs.Evaluation` | `error` | [L770](file:///d:/claude/nomad/nomad/worker.go#L770) |
| `ReblockEval` | `w *Worker` | `eval *structs.Evaluation` | `error` | [L812](file:///d:/claude/nomad/nomad/worker.go#L812) |
| `shouldResubmit` | `w *Worker` | `err error` | `bool` | [L876](file:///d:/claude/nomad/nomad/worker.go#L876) |
| `backoffErr` | `w *Worker` | `base time.Duration, limit time.Duration` | `bool` | [L893](file:///d:/claude/nomad/nomad/worker.go#L893) |
| `backoffReset` | `w *Worker` | - | - | [L909](file:///d:/claude/nomad/nomad/worker.go#L909) |
| `ShutdownCh` | `w *Worker` | - | `chan struct{...}` | [L913](file:///d:/claude/nomad/nomad/worker.go#L913) |

## 5. 核心方法详解

### Start()

**签名**：`func (w *Worker) Start() `

**位置**：[L161](file:///d:/claude/nomad/nomad/worker.go#L161)

### Stop()

**签名**：`func (w *Worker) Stop() `

**位置**：[L187](file:///d:/claude/nomad/nomad/worker.go#L187)

### GetStatus()

**签名**：`func (w *Worker) GetStatus() WorkerStatus`

**位置**：[L219](file:///d:/claude/nomad/nomad/worker.go#L219)

### GetWorkloadStatus()

**签名**：`func (w *Worker) GetWorkloadStatus() SchedulerWorkerStatus`

**位置**：[L254](file:///d:/claude/nomad/nomad/worker.go#L254)

### Info()

**签名**：`func (w *Worker) Info() WorkerInfo`

**位置**：[L302](file:///d:/claude/nomad/nomad/worker.go#L302)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/scheduler` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/go-version` | 第三方库 |

## 7. 设计模式与技术特点

- **组合模式**：结构体嵌入 Server 引用，通过组合获取 Server 上下文
- **RPC 端点模式**：定义 RPC 端点结构体，将 Server 引用注入端点，处理特定资源的 RPC 请求
- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [worker_test.go](file:///d:/claude/nomad/nomad/worker_test.go) | 对应测试文件 |

