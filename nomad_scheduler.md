# Nomad Scheduler 技术实现详解

> 本文档深入分析 Nomad 调度器（scheduler）子系统的技术实现，覆盖整体架构、核心接口、调度器类型、reconciler、可行性检查、打分算法、部署管理、抢占机制、Plan 提交与并发控制等关键内容。所有关键代码位置均提供 `file:///` 可点击链接。

---

## 目录

1. [总体架构](#1-总体架构)
2. [核心接口与数据结构](#2-核心接口与数据结构)
3. [调度器类型与工厂](#3-调度器类型与工厂)
4. [Worker 调度循环](#4-worker-调度循环)
5. [EvalBroker 评估队列](#5-evalbroker-评估队列)
6. [GenericScheduler (service/batch)](#6-genericscheduler-servicebatch)
7. [SystemScheduler (system)](#7-systemscheduler-system)
8. [SysBatchScheduler (sysbatch)](#8-sysbatchscheduler-sysbatch)
9. [CoreScheduler 核心调度器](#9-corescheduler-核心调度器)
10. [Reconciler 调谐器](#10-reconciler-调谐器)
11. [Feasible 可行性检查](#11-feasible-可行性检查)
12. [Rank 打分与排序](#12-rank-打分与排序)
13. [Stack 调度栈](#13-stack-调度栈)
14. [Preemption 抢占机制](#14-preemption-抢占机制)
15. [Deployment 部署管理](#15-deployment-部署管理)
16. [Plan 提交与并发控制](#16-plan-提交与并发控制)
17. [BlockedEvals 阻塞评估](#17-blockedevals-阻塞评估)
18. [配置项与调优](#18-配置项与调优)
19. [典型调用链](#19-典型调用链)
20. [代码文件索引](#20-代码文件索引)
21. [设计要点](#21-设计要点)
22. [总结](#22-总结)

---

## 1. 总体架构

### 1.1 调度系统全景

Nomad 调度系统采用 **Evaluation 驱动的异步调度模型**，核心流程为：

```
Job/Node 变更 → 创建 Evaluation → EvalBroker 入队 → Worker 出队
   → 实例化 Scheduler → Reconciler 计算 diff → Feasible 过滤节点
   → Rank 打分排序 → 生成 Plan → Planner 提交 → Raft 应用 → 状态更新
```

### 1.2 核心组件分层

```
┌────────────────────────────────────────────────────────────┐
│                    Nomad Server                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  EvalBroker  │  │   Worker     │  │   Planner    │     │
│  │ (评估队列)    │→ │ (调度工作者) │→ │ (Plan 提交)  │     │
│  └──────────────┘  └──────┬───────┘  └──────────────┘     │
│                           │                                │
│                           ▼                                │
│  ┌──────────────────────────────────────────────────┐     │
│  │              Scheduler (调度器)                  │     │
│  │  ┌────────────┐ ┌──────────┐ ┌──────────────┐  │     │
│  │  │ Generic    │ │ System   │ │ SysBatch     │  │     │
│  │  │ (service/  │ │ (system) │ │ (sysbatch)   │  │     │
│  │  │  batch)    │ │          │ │              │  │     │
│  │  └─────┬──────┘ └────┬─────┘ └──────┬───────┘  │     │
│  │        │             │              │           │     │
│  │        ▼             ▼              ▼           │     │
│  │  ┌──────────────────────────────────────────┐  │     │
│  │  │           Reconciler (调谐器)             │  │     │
│  │  │  AllocReconciler   /  NodeReconciler     │  │     │
│  │  └──────────────────────────────────────────┘  │     │
│  │        │                                       │     │
│  │        ▼                                       │     │
│  │  ┌──────────────────────────────────────────┐  │     │
│  │  │      Feasible (可行性 + 打分)             │  │     │
│  │  │  GenericStack / SystemStack              │  │     │
│  │  │  FeasibilityChecker → RankIterator       │  │     │
│  │  └──────────────────────────────────────────┘  │     │
│  └──────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

### 1.3 关键设计原则

- **乐观并发控制**：多个 Worker 并行处理不同 Eval，通过 Plan 提交时的乐观锁解决冲突
- **不可变状态视图**：调度器通过 `State` 接口读取快照，保证一致性
- **责任分离**：调度器只负责业务逻辑，状态持久化由 Planner 处理
- **失败重试**：调度过程可重试，通过 `retryMax` 包装，进度时重置计数器

---

## 2. 核心接口与数据结构

### 2.1 Scheduler 接口

所有调度器实现统一接口，定义于 [scheduler/structs/interfaces.go](file:///d:/claude/nomad/scheduler/structs/interfaces.go)：

```go
// Scheduler 是调度器的顶层接口。调度器只封装业务逻辑，
// 将各种管道推到 Nomad 本身。它们被调用以一次处理单个评估。
type Scheduler interface {
    // Process 用于处理新的评估。调度器可以自由应用
    // 任何必要的逻辑来进行任务放置。
    Process(*structs.Evaluation) error
}
```

### 2.2 State 接口

State 提供 **不可变的全局状态视图**，让调度器能基于其他调度器的分配做出智能决策：

```go
type State interface {
    Config() *state.StateStoreConfig
    Nodes(ws memdb.WatchSet) (memdb.ResultIterator, error)
    NodesByNodePool(ws memdb.WatchSet, poolName string) (memdb.ResultIterator, error)
    NodeByID(ws memdb.WatchSet, nodeID string) (*structs.Node, error)
    NodePoolByName(ws memdb.WatchSet, poolName string) (*structs.NodePool, error)
    AllocsByJob(ws memdb.WatchSet, namespace, jobID string, all bool) ([]*structs.Allocation, error)
    AllocsByNode(ws memdb.WatchSet, node string) ([]*structs.Allocation, error)
    AllocByID(ws memdb.WatchSet, allocID string) (*structs.Allocation, error)
    AllocsByNodeTerminal(ws memdb.WatchSet, node string, terminal bool) ([]*structs.Allocation, error)
    JobByID(ws memdb.WatchSet, namespace, id string) (*structs.Job, error)
    JobByIDAndVersion(ws memdb.WatchSet, namespace, id string, version uint64) (*structs.Job, error)
    DeploymentsByJobID(ws memdb.WatchSet, namespace, jobID string, all bool) ([]*structs.Deployment, error)
    LatestDeploymentByJobID(ws memdb.WatchSet, namespace, jobID string) (*structs.Deployment, error)
    SchedulerConfig() (uint64, *structs.SchedulerConfiguration, error)
    CSIVolumeByID(memdb.WatchSet, string, string) (*structs.CSIVolume, error)
    HostVolumeByID(memdb.WatchSet, string, string, bool) (*structs.HostVolume, error)
    HostVolumesByNodeID(memdb.WatchSet, string, state.SortOption) (memdb.ResultIterator, error)
    TaskGroupHostVolumeClaimsByFields(memdb.WatchSet, state.TgvcSearchableFields) (memdb.ResultIterator, error)
    LatestIndex() (uint64, error)
}
```

### 2.3 Planner 接口

Planner 用于 **提交任务分配计划**，实现乐观并发：

```go
type Planner interface {
    SubmitPlan(*structs.Plan) (*structs.PlanResult, State, error)
    UpdateEval(*structs.Evaluation) error
    CreateEval(*structs.Evaluation) error
    ReblockEval(*structs.Evaluation) error
    ServersMeetMinimumVersion(minVersion *version.Version, checkFailedServers bool) bool
}
```

### 2.4 Factory 工厂函数

```go
type Factory func(log.Logger, chan<- interface{}, State, Planner) Scheduler
```

### 2.5 核心数据结构

**Evaluation（评估）**：触发调度的核心对象，包含：
- `TriggeredBy`：触发原因（JobRegister、NodeDrain、AllocStop 等，共 16 种）
- `Status`：状态（pending、complete、failed、blocked、canceled）
- `WaitUntil`：延迟执行时间
- `Priority`：优先级
- `AnnotatePlan`：是否需要 Plan 注释

**Plan（计划）**：调度器输出的变更计划：
- `NodeAllocation`：节点上要放置的新分配
- `NodeUpdate`：要停止的分配
- `NodePreemptions`：要抢占的分配
- `Deployment`：部署状态变更
- `SnapshotIndex`：快照索引（乐观锁基础）

**Allocation（分配）**：任务在节点上的实例：
- `NodeID`：目标节点
- `DesiredStatus`：期望状态（run、stop、evict）
- `ClientStatus`：客户端状态（pending、running、complete、failed、lost、unknown）
- `DeploymentStatus`：部署状态（含 canary 标记）
- `RescheduleTracker`：重调度历史

---

## 3. 调度器类型与工厂

### 3.1 调度器注册表

定义于 [scheduler/scheduler.go](file:///d:/claude/nomad/scheduler/scheduler.go)：

```go
const SchedulerVersion uint16 = 1

var BuiltinSchedulers = map[string]structs.Factory{
    "service":  NewServiceScheduler,
    "batch":    NewBatchScheduler,
    "system":   NewSystemScheduler,
    "sysbatch": NewSysBatchScheduler,
}

func NewScheduler(name string, logger log.Logger, eventsCh chan<- interface{},
    state structs.State, planner structs.Planner) (structs.Scheduler, error) {
    factory, ok := BuiltinSchedulers[name]
    if !ok {
        return nil, fmt.Errorf("unknown scheduler '%s'", name)
    }
    return factory(logger, eventsCh, state, planner), nil
}
```

### 3.2 四种调度器对比

| 调度器 | 类型 | 适用场景 | 重试次数 | Reconciler | 打分排序 | 抢占 |
|--------|------|----------|----------|------------|----------|------|
| `service` | GenericScheduler | 长期运行的服务 | 5 | AllocReconciler | 是（BinPack/Spread） | 可配置 |
| `batch` | GenericScheduler | 批处理任务 | 2 | AllocReconciler | 是（简化） | 可配置 |
| `system` | SystemScheduler | 每个节点运行 | 5 | NodeReconciler | 否（全节点） | 默认开启 |
| `sysbatch` | SysBatchScheduler | 一次性系统任务 | 2 | NodeReconciler | 否（全节点） | 可配置 |
| `_core` | CoreScheduler | GC 等管理任务 | - | - | - | - |

### 3.3 调度器版本兼容

`SchedulerVersion` 用于确保 Leader 与出队的 Worker 版本一致。版本不匹配时，Worker 会收到错误并退避 30s：

```go
// worker.go
if strings.Contains(err.Error(), "calling scheduler version") {
    base = backoffSchedulerVersionMismatch  // 30s
}
```

---

## 4. Worker 调度循环

Worker 是 **单线程调度工作者**，每个 Server 可运行多个，负责桥接调度器业务逻辑与底层管道。

### 4.1 Worker 结构

定义于 [nomad/worker.go](file:///d:/claude/nomad/nomad/worker.go)：

```go
type Worker struct {
    srv    *Server
    logger log.Logger
    id     string
    status         WorkerStatus     // Unknown/Starting/Started/Pausing/Paused/...
    workloadStatus SchedulerWorkerStatus
    enabledSchedulers []string
    failures       uint64
    failureBackoff time.Duration
    evalToken      string           // 当前评估令牌
    snapshotIndex  uint64           // 快照索引
}
```

### 4.2 Worker 主循环

```
run() 循环：
  1. dequeueEvaluation(dequeueTimeout=500ms)
     ↓
  2. snapshotMinIndex(waitIndex, raftSyncLimit=5s)
     等待 Raft 日志追上评估索引
     ↓
  3. invokeScheduler(snap, eval, token)
     - 创建 Scheduler 实例（或 CoreScheduler）
     - 调用 sched.Process(eval)
     ↓
  4. sendAck(eval, token)  成功
     sendNack(eval, token) 失败
```

关键代码位于 [nomad/worker.go](file:///d:/claude/nomad/nomad/worker.go) 的 `run` 方法：

```go
func (w *Worker) run(raftSyncLimit time.Duration) {
    defer func() { w.markStopped(); close(w.shutdownCh) }()
    w.setStatuses(WorkerStarted, WorkloadRunning)
    for {
        if w.workerShuttingDown() { return }
        eval, token, waitIndex, shutdown := w.dequeueEvaluation(dequeueTimeout)
        if shutdown { return }
        if w.srv.IsShutdown() { w.sendNack(eval, token); return }

        snap, err := w.snapshotMinIndex(waitIndex, raftSyncLimit)
        if err != nil {
            // 超时/取消/错误 → Nack + continue
            continue
        }

        if err := w.invokeScheduler(snap, eval, token); err != nil {
            w.sendNack(eval, token)
            continue
        }
        w.sendAck(eval, token)
    }
}
```

### 4.3 invokeScheduler 调度器调用

```go
func (w *Worker) invokeScheduler(snap *state.StateSnapshot, eval *structs.Evaluation, token string) error {
    w.evalToken = token
    w.snapshotIndex, _ = snap.LatestIndex()

    var sched sstructs.Scheduler
    if eval.Type == structs.JobTypeCore {
        sched = NewCoreScheduler(w.srv, snap, w)
    } else {
        sched, err = scheduler.NewScheduler(eval.Type, w.logger, w.srv.workersEventCh, snap, w)
    }
    return sched.Process(eval)
}
```

### 4.4 Worker 作为 Planner

Worker 实现了 `Planner` 接口，关键方法：

- `SubmitPlan`：通过 RPC 调用 `Plan.Submit`，处理状态刷新（`RefreshIndex`）
- `UpdateEval`：通过 RPC 调用 `Eval.Update`
- `CreateEval`：通过 RPC 调用 `Eval.Create`
- `ReblockEval`：通过 RPC 调用 `Eval.Reblock`

### 4.5 Worker 退避常量

| 常量 | 值 | 用途 |
|------|----|------|
| `backoffBaselineFast` | 20ms | 出队错误快速退避基线 |
| `backoffBaselineSlow` | 500ms | Plan 提交慢退避基线 |
| `backoffLimitSlow` | 10s | 慢退避上限 |
| `backoffSchedulerVersionMismatch` | 30s | 版本不匹配退避 |
| `dequeueTimeout` | 500ms | 出队超时 |
| `raftSyncLimit` | 5s | Raft 同步等待上限 |
| `dequeueErrGrace` | 10s | 启动后错误日志宽限期 |

---

## 5. EvalBroker 评估队列

EvalBroker 是 **内存中的评估代理**，管理评估的分发，提供至少一次交付语义。

### 5.1 核心结构

定义于 [nomad/eval_broker.go](file:///d:/claude/nomad/nomad/eval_broker.go)：

```go
type EvalBroker struct {
    nackTimeout   time.Duration
    deliveryLimit int
    evals    map[string]int              // 评估ID → 投递次数
    jobEvals map[structs.NamespacedID]string  // Job → 评估ID（序列化）
    pending  map[structs.NamespacedID]PendingEvaluations  // 待处理（按Job）
    ready    map[string]ReadyEvaluations  // 就绪（按调度器类型）
    unack    map[string]*unackEval       // 未确认
    requeue  map[string]*structs.Evaluation
    delayHeap *delayheap.DelayHeap       // 延迟评估堆
}
```

### 5.2 评估流转

```
Enqueue(eval)
   ├─ 有 WaitUntil? → delayHeap（延迟入队）
   └─ 立即入队
       ↓
   pending[jobID]（按Job序列化，同Job只一个就绪）
       ↓
   Dequeue(schedulers)（按调度器类型+优先级出队）
       ↓
   unack[evalID]（带Nack定时器）
       ├─ Ack → 移除
       └─ Nack/超时 → requeue 或 failedQueue（达 deliveryLimit）
```

### 5.3 关键特性

- **优先级队列**：`ReadyEvaluations` 和 `PendingEvaluations` 实现 `container/heap`，按评估优先级排序
- **Job 序列化**：同 Job 的多个评估通过 `jobEvals` 序列化，确保同时只有一个评估在处理
- **至少一次交付**：`nackTimeout` 后未 Ack 则自动重投；达到 `deliveryLimit` 后转入 `failedQueue`
- **Token 机制**：每次出队分配唯一 Token，Ack/Nack 需匹配

---

## 6. GenericScheduler (service/batch)

GenericScheduler 是 **service 和 batch 作业的主调度器**，定义于 [scheduler/generic_sched.go](file:///d:/claude/nomad/scheduler/generic_sched.go)。

### 6.1 结构定义

```go
type GenericScheduler struct {
    logger   log.Logger
    eventsCh chan<- interface{}
    state    sstructs.State
    planner  sstructs.Planner
    batch    bool   // true=batch, false=service

    eval       *structs.Evaluation
    job        *structs.Job
    plan       *structs.Plan
    planResult *structs.PlanResult
    ctx        *feasible.EvalContext
    stack      *feasible.GenericStack

    followUpEvals []*structs.Evaluation  // 延迟重调度评估
    deployment    *structs.Deployment
    blocked       *structs.Evaluation    // 阻塞评估
    failedTGAllocs  map[string]*structs.AllocMetric  // 失败的 TG
    queuedAllocs    map[string]int       // 排队的分配数
    planAnnotations *structs.PlanAnnotations
}
```

### 6.2 Process 主流程

```go
func (s *GenericScheduler) Process(eval *structs.Evaluation) (err error) {
    defer func() {  // panic 恢复
        if r := recover(); r != nil {
            s.logger.Error("processing eval panicked scheduler", "eval_id", eval.ID, "error", r)
            err = fmt.Errorf("failed to process eval: %v", r)
        }
    }()

    s.eval = eval
    // 验证触发原因（16种）
    switch eval.TriggeredBy { ... }

    // 重试逻辑
    progress := func() bool { return progressMade(s.planResult) }
    limit := maxServiceScheduleAttempts  // service: 5, batch: 2
    if s.batch { limit = maxBatchScheduleAttempts }
    if err := retryMax(limit, s.process, progress); err != nil {
        if statusErr, ok := err.(*SetStatusError); ok {
            s.createBlockedEval(true)  // 创建阻塞评估
            return setStatus(...)
        }
        return err
    }

    // 处理阻塞评估
    if s.eval.Status == structs.EvalStatusBlocked && len(s.failedTGAllocs) != 0 {
        return s.planner.ReblockEval(newEval)
    }
    return setStatus(..., structs.EvalStatusComplete, ...)
}
```

### 6.3 process 内部步骤

`s.process()` 是核心处理函数，被 `retryMax` 包装：

```
1. 查询 Job: s.state.JobByID(eval.Namespace, eval.JobID)
2. 初始化 queuedAllocs, followUpEvals
3. 创建 Plan: s.eval.MakePlan(s.job)
4. service 模式: 查询 LatestDeploymentByJobID
5. 创建 EvalContext: feasible.NewEvalContext(...)
6. 构建调度栈: feasible.NewGenericStack(s.batch, s.ctx)
7. setJob(job): 设置节点池调度配置
8. computeJobAllocs(): 调谐 + 计算放置
9. 创建阻塞评估（若有失败放置）
10. 创建 followUpEvals（延迟重调度）
11. SubmitPlan: s.planner.SubmitPlan(s.plan)
12. 处理结果:
    - newState != nil → 状态刷新，重试
    - !fullCommit → 部分提交，重试
    - 成功 → 返回 true
```

### 6.4 computeJobAllocs 核心调谐

```go
func (s *GenericScheduler) computeJobAllocs() error {
    // 1. 获取 job 所有分配
    allocs, _ := s.state.AllocsByJob(ws, s.eval.Namespace, s.eval.JobID, true)
    // 2. 确定 tainted 节点（draining/down/disconnected）
    tainted, _ := taintedNodes(s.state, allocs)
    // 3. 更新 tainted 节点上的非终端分配为 lost
    updateNonTerminalAllocsToLost(s.plan, tainted, allocs)
    // 4. 创建 AllocReconciler 并计算
    r := reconciler.NewAllocReconciler(s.logger,
        genericAllocUpdateFn(s.ctx, s.stack, s.eval.ID),
        reconciler.ReconcilerState{
            Job: s.job, JobID: s.eval.JobID, JobIsBatch: s.batch,
            DeploymentCurrent: s.deployment, ExistingAllocs: allocs,
            EvalID: s.eval.ID, EvalPriority: s.eval.Priority,
        },
        reconciler.ClusterState{TaintedNodes: tainted, Now: time.Now().UTC()})
    result := r.Compute()
    // 5. 应用调谐结果到 Plan（Stop/InplaceUpdate/Disconnect/Reconnect...）
    // 6. 计算放置（Place + DestructiveUpdate）
    return s.computePlacements(destructive, place, result.TaskGroupAllocNameIndexes)
}
```

### 6.5 computePlacements 放置计算

```go
func (s *GenericScheduler) computePlacements(destructive, place, nameIndex) error {
    nodes, byDC, _ := s.setNodes(s.job)
    // 先处理 destructive（释放资源），再处理 place
    for _, results := range [][]reconciler.PlacementResult{destructive, place} {
        for _, missing := range results {
            tg := missing.TaskGroup()
            // 处理 downgrade（canary 部署回退）
            // 查找首选节点（sticky/migrate）
            // 原子停止前驱（destructive update）
            // 选择节点: option := s.selectNextOption(tg, selectOptions)
            if option != nil {
                // 创建新分配并添加到 plan
                alloc := &structs.Allocation{ID: uuid.Generate(), NodeID: option.Node.ID, ...}
                s.handlePreemptions(option, alloc, missing)
                s.plan.AppendAlloc(alloc, downgradedJob)
            } else {
                s.failedTGAllocs[tg.Name] = s.ctx.Metrics()
            }
        }
    }
}
```

### 6.6 selectNextOption 与抢占

```go
func (s *GenericScheduler) selectNextOption(tg *structs.TaskGroup, opts *feasible.SelectOptions) *feasible.RankedNode {
    option := s.stack.Select(tg, opts)
    // 首次无结果时，启用抢占重试
    if option == nil && enablePreemption {
        opts.Preempt = true
        option = s.stack.Select(tg, opts)
    }
    return option
}
```

### 6.7 重调度跟踪

`UpdateRescheduleTracker` 维护重调度历史：
- **有限次数**：只保留 interval 内的事件
- **无限次数**：只保留最后 `maxPastRescheduleEvents=5` 个
- 计算下次延迟 `prev.NextDelay()`（指数退避）

---

## 7. SystemScheduler (system)

SystemScheduler 用于 **system 作业**，定义于 [scheduler/scheduler_system.go](file:///d:/claude/nomad/scheduler/scheduler_system.go)。设计目标是在所有符合条件的节点上运行。

### 7.1 结构定义

```go
type SystemScheduler struct {
    logger   log.Logger
    eventsCh chan<- interface{}
    state    sstructs.State
    planner  sstructs.Planner

    eval, job, plan, planResult
    ctx    *feasible.EvalContext
    stack  *feasible.SystemStack

    nodes         []*structs.Node
    notReadyNodes map[string]struct{}
    nodesByDC     map[string]int
    deployment    *structs.Deployment
    failedTGAllocs, queuedAllocs, planAnnotations

    // 跟踪计数（用于部署状态）
    tgCandidateNodeCounts     map[string]int
    tgDestructiveUpdateCounts map[string]int
    tgExistingCanaryCount     map[string]int
}
```

### 7.2 与 GenericScheduler 的差异

| 维度 | GenericScheduler | SystemScheduler |
|------|------------------|-----------------|
| Reconciler | AllocReconciler（集群级） | NodeReconciler（按节点） |
| Stack | GenericStack（打分排序） | SystemStack（不打分，全节点） |
| 放置策略 | 选择最优节点 | 在每个可行节点放置 |
| 阻塞评估 | 失败时创建 | 不创建 |
| FollowUpEvals | 支持（延迟重调度） | 不支持 |
| Deployment | 完整部署管理 | 简化部署（按节点计数） |
| 重试上限 | 5（service）/2（batch） | 5 |

### 7.3 computeJobAllocs 流程

```
1. 获取 job 所有分配
2. 确定 tainted 节点
3. 更新非终端分配为 lost
4. 分离终端/活跃分配
5. NodeReconciler.Compute()（关键差异）
6. 处理 Stop/Migrate/Lost/Disconnecting
7. 原地更新（inplaceUpdate）
8. 统计计数（CandidateNode/DestructiveUpdate/Canary）
9. evictAndPlace（destructive 当作 evict + 新放置）
10. computePlacements（逐节点放置）
11. 部署状态管理（canary 逻辑）
```

### 7.4 computePlacements（逐节点放置）

与 GenericScheduler 不同，SystemScheduler 逐节点放置：

```go
for _, missing := range reconcilerResult.Place {
    node, ok := nodeByID[missing.Alloc.NodeID]
    nodes[0] = node
    s.stack.SetNodes(nodes)  // 每次只设置一个节点
    option := s.stack.Select(missing.TaskGroup, &feasible.SelectOptions{AllocName: missing.Name})
    // 创建分配或记录失败
}
```

### 7.5 System Canary 部署

System 作业的 canary 逻辑特殊：
- `DesiredTotal` = 候选节点数（运行时才知道）
- `DesiredCanaries` = `ceil(Canary% × destructiveCount)`，上限 `MaxParallel`
- `evictUnneededCanaries`：初始放置所有 canary，确认可行节点后驱逐多余的

---

## 8. SysBatchScheduler (sysbatch)

SysBatchScheduler 用于 **sysbatch 作业**（一次性系统任务），定义于 [scheduler/scheduler_sysbatch.go](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go)。

### 8.1 与 SystemScheduler 的差异

| 维度 | SystemScheduler | SysBatchScheduler |
|------|-----------------|-------------------|
| 任务行为 | 持续运行（失败重启） | 一次性（成功即完成） |
| Deployment | 完整部署管理 | 不支持（`NewNodeReconciler(nil)`） |
| 重试上限 | 5 | 2 |
| `limitReached` | 无 | 有（`evictAndPlace` 返回） |

核心逻辑类似 SystemScheduler，但 `NewNodeReconciler(nil)` 不传 deployment，且重试上限为 2。

---

## 9. CoreScheduler 核心调度器

CoreScheduler 是 **特殊调度器**（类型 `_core`），不调度用户作业，而是执行集群管理任务。

### 9.1 注册

CoreScheduler 不在 `BuiltinSchedulers` 中，由 Worker 直接实例化：

```go
// worker.go
if eval.Type == structs.JobTypeCore {
    sched = NewCoreScheduler(w.srv, snap, w)
}
```

### 9.2 支持的管理任务

定义于 [nomad/core_sched.go](file:///d:/claude/nomad/nomad/core_sched.go)：

| 任务 | 方法 | 功能 |
|------|------|------|
| `CoreJobEvalGC` | `evalGC` | 回收过期评估 |
| `CoreJobNodeGC` | `nodeGC` | 回收过期节点 |
| `CoreJobJobGC` | `jobGC` | 回收过期 Job |
| `CoreJobDeploymentGC` | `deploymentGC` | 回收过期部署 |
| `CoreJobCSIVolumeClaimGC` | `csiVolumeClaimGC` | 回收 CSI 卷声明 |
| `CoreJobCSIPluginGC` | `csiPluginGC` | 回收 CSI 插件 |
| `CoreJobOneTimeTokenGC` | `expiredOneTimeTokenGC` | 回收过期一次性 Token |
| `CoreJobLocalTokenExpiredGC` | `expiredACLTokenGC` | 回收过期本地 ACL Token |
| `CoreJobGlobalTokenExpiredGC` | `expiredACLTokenGC` | 回收过期全局 ACL Token |
| `CoreJobRootKeyRotateOrGC` | `rootKeyRotateOrGC` | 根密钥轮转或回收 |
| `CoreJobVariablesRekey` | `variablesRekey` | 变量重加密 |
| `CoreJobForceGC` | `forceGC` | 强制回收所有 |

`forceGC` 将所有阈值设为 `time.Millisecond`，立即回收所有 eligible 对象。

---

## 10. Reconciler 调谐器

Reconciler 是调度器的 **第一阶段**，比较现有状态与期望状态，计算需要的变更。

### 10.1 AllocReconciler（service/batch）

定义于 [scheduler/reconciler/reconcile_cluster.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go)：

```go
type AllocReconciler struct {
    logger       log.Logger
    allocUpdateFn AllocUpdateType  // 判断更新类型的函数
    jobState     ReconcilerState
    clusterState ClusterState
    reconnectingPicker reconnectingPickerInterface
}

type ReconcilerState struct {
    Job        *structs.Job
    JobID      string
    JobIsBatch bool
    DeploymentOld     *structs.Deployment
    DeploymentCurrent *structs.Deployment
    DeploymentPaused  bool
    DeploymentFailed  bool
    ExistingAllocs    []*structs.Allocation
    EvalID       string
    EvalPriority int
}
```

### 10.2 ReconcileResults 结果集

```go
type ReconcileResults struct {
    Deployment     *structs.Deployment
    DeploymentUpdates []*structs.DeploymentStatusUpdate
    Place             []AllocPlaceResult        // 需要放置
    DestructiveUpdate []allocDestructiveResult  // 破坏性更新
    InplaceUpdate     []*structs.Allocation     // 原地更新
    Stop              []AllocStopResult         // 停止
    AttributeUpdates  allocSet                  // 属性更新
    DisconnectUpdates allocSet                  // 断连更新
    ReconnectUpdates  allocSet                  // 重连更新
    DesiredTGUpdates map[string]*structs.DesiredUpdates
    DesiredFollowupEvals map[string][]*structs.Evaluation  // 延迟重调度
    TaskGroupAllocNameIndexes map[string]*AllocNameIndex   // 名称索引
}
```

### 10.3 六大 Bucket 分类

AllocReconciler 将分配分到 6 个 "bucket"：

1. **migrating**：在 draining 节点上的分配
2. **lost**：已过期或在丢失节点上的分配
3. **disconnecting**：在断连节点上但未过期的分配
4. **reconnecting**：在重连节点上的分配
5. **ignored**：无需操作的分配
6. **expiring**：无法重调度的分配（断连配置丢失）

### 10.4 Cluster Reconciler 流程

```
Compute()
  ↓
cancelUnneededDeployments（3种情况：成功/旧版本/Job停止）
  ↓
handleStop（Job停止则停止所有，处理lost）
  ↓
computeDeploymentComplete（按TaskGroup判断部署完成）
  ↓
computeGroup（每个TG的核心逻辑）：
  - filterOldTerminalAllocs
  - cancelUnneededCanaries
  - classifyAllocs（7个bucket）
  - filterByRescheduleable（rescheduleNow/rescheduleLater）
  - reconcileReconnecting
  - computeStop
  - computeCanaries
  - computePlacements
  - placeAllocs
  - computeDestructiveUpdates
  - computeMigrations
  - createDeployment
  ↓
setDeploymentStatusAndUpdates
  ↓
return *ReconcileResults
```

### 10.5 NodeReconciler（system/sysbatch）

定义于 [scheduler/reconciler/reconcile_node.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go)：

```go
type NodeReconciler struct {
    DeploymentOld     *structs.Deployment
    DeploymentCurrent *structs.Deployment
    DeploymentUpdates []*structs.DeploymentStatusUpdate
    compatHasSameVersionAllocs bool  // COMPAT(1.11.0)
}
```

NodeReconciler 按节点逐个计算，`computeForNode` 返回 8 个集合：Place、Update、Migrate、Stop、Ignore、Lost、Disconnecting、Reconnecting。

---

## 11. Feasible 可行性检查

Feasible 包负责 **过滤不符合条件的节点**，定义于 [scheduler/feasible/](file:///d:/claude/nomad/scheduler/feasible/)。

### 11.1 核心接口

```go
type FeasibleIterator interface {
    Next() *structs.Node
    Reset()
}

type FeasibilityChecker interface {
    Feasible(*structs.Node) bool
}
```

### 11.2 基础迭代器

- **StaticIterator**：按静态顺序返回节点（测试用）
- **RandomIterator**：Fisher-Yates 洗牌后顺序返回（种子来自 EvalID + state index）

### 11.3 可行性检查器

| 检查器 | 检查内容 |
|--------|----------|
| `ConstraintChecker` | Job/TG 约束（属性、版本等） |
| `DriverChecker` | 节点是否有必需的驱动 |
| `DeviceChecker` | 节点是否有必需的设备 |
| `HostVolumeChecker` | 节点是否有必需的 host volume |
| `CSIVolumeChecker` | CSI volume 可用性 |
| `NetworkChecker` | 网络资源 |
| `SecretsProviderChecker` | secrets provider |
| `QuotaIterator` | 命名空间配额 |
| `DistinctHostsIterator` | distinct_hosts 约束 |
| `DistinctPropertyIterator` | distinct_property 约束 |
| `FeasibilityWrapper` | 缓存 computed node class |

### 11.4 过滤原因常量

```go
FilterConstraintHostVolumes                    = "missing compatible host volumes"
FilterConstraintCSIPluginTemplate              = "CSI plugin %s is missing from client %s"
FilterConstraintCSIPluginUnhealthyTemplate     = "CSI plugin %s is unhealthy on client %s"
FilterConstraintDrivers                        = "missing drivers"
FilterConstraintDevices                        = "missing devices"
FilterConstraintSecrets                        = "missing secrets provider"
FilterConstraintsCSIPluginTopology             = "did not meet topology requirement"
```

### 11.5 Computed Node Class 优化

`FeasibilityWrapper` 缓存节点类（computed node class）的可行性结果，避免重复检查相似节点：
- `HasEscaped()`：检查是否有约束逃逸（无法分类的约束）
- `GetClasses()`：获取类资格映射

---

## 12. Rank 打分与排序

Rank 包负责 **对可行节点打分排序**，选择最优放置位置。

### 12.1 RankedNode 结构

```go
type RankedNode struct {
    Node           *structs.Node
    FinalScore     float64
    Scores         []float64
    TaskResources  map[string]*structs.AllocatedTaskResources
    TaskLifecycles map[string]*structs.TaskLifecycleConfig
    AllocResources *structs.AllocatedSharedResources
    Proposed       []*structs.Allocation       // 缓存的提议分配
    PreemptedAllocs []*structs.Allocation      // 需要抢占的分配
}
```

### 12.2 BinPackIterator（装箱算法）

```go
type BinPackIterator struct {
    ctx                    Context
    source                 RankIterator
    evict                  bool       // 是否启用抢占
    priority               int
    jobId                  structs.NamespacedID
    taskGroup              *structs.TaskGroup
    memoryOversubscription bool
    scoreFit               func(*structs.Node, *structs.ComparableResources) float64
}
```

**打分函数**：
- `ScoreFitBinPack`：装箱算法（优先填满节点），最大分 `binPackingMaxFitScore=18.0`
- `ScoreFitSpread`：分散算法（优先分散到不同节点）

**算法切换**通过 `SchedulerConfiguration.EffectiveSchedulerAlgorithm()`。

### 12.3 SpreadIterator（分散算法）

定义于 [scheduler/feasible/spread.go](file:///d:/claude/nomad/scheduler/feasible/spread.go)：

- 按 `spread.Attribute` 分组现有分配
- 计算每个属性值的 `desiredCounts`
- 与 `usedCount` 比较，给偏离目标值的节点加分/减分
- 支持多 spread 块加权，隐式目标 `*` 处理百分比对不到 100 的情况

### 12.4 其他 Rank 迭代器

| 迭代器 | 作用 |
|--------|------|
| `FeasibleRankIterator` | 将 FeasibleIterator 升级为 RankIterator（无打分） |
| `JobAntiAffinityIterator` | Job 反亲和性（同 job 分散） |
| `NodeReschedulingPenaltyIterator` | 重调度惩罚（避免再调度到失败节点） |
| `NodeAffinityIterator` | 节点亲和性 |
| `LimitIterator` | 限制评估节点数（maxSkip=3, skipScoreThreshold=0.0） |
| `MaxScoreIterator` | 选择最高分节点 |
| `ScoreNormalizationIterator` | 分数归一化 |

### 12.5 节点数限制

**GenericStack.SetNodes**：
- batch：固定 2 个（power of two choices）
- service：`max(2, ceil(log2(n)))`
- 有 spread/affinity 时：`max(nodeLimitForFeasibilityChecks, tg.Count)`

---

## 13. Stack 调度栈

Stack 是 **链式迭代器集合**，组合可行性检查与打分排序。

### 13.1 Stack 接口

```go
type Stack interface {
    SetNodes([]*structs.Node)
    SetJob(job *structs.Job)
    Select(tg *structs.TaskGroup, options *SelectOptions) *RankedNode
}

type SelectOptions struct {
    PenaltyNodeIDs          map[string]struct{}
    PreferredNodes          []*structs.Node
    Preempt                 bool
    AllocName               string
    AllocationHostVolumeIDs []string
}
```

### 13.2 GenericStack 迭代器链

```
StaticIterator (源，洗牌后)
  ↓
FeasibilityWrapper (computed class 缓存)
  ├─ ConstraintChecker (job 约束)
  ├─ DriverChecker
  ├─ ConstraintChecker (tg 约束)
  ├─ DeviceChecker
  ├─ HostVolumeChecker
  ├─ CSIVolumeChecker
  ├─ NetworkChecker
  └─ SecretsProviderChecker
  ↓
DistinctHostsIterator
  ↓
DistinctPropertyIterator
  ↓
QuotaIterator (配额检查)
  ↓
FeasibleRankIterator (升级为 RankedNode)
  ↓
BinPackIterator (装箱打分)
  ↓
JobAntiAffinityIterator (job 反亲和)
  ↓
NodeReschedulingPenaltyIterator (重调度惩罚)
  ↓
NodeAffinityIterator (节点亲和)
  ↓
SpreadIterator (分散打分)
  ↓
ScoreNormalizationIterator (归一化)
  ↓
LimitIterator (限制数量)
  ↓
MaxScoreIterator (选最高分)
```

### 13.3 SystemStack 迭代器链

SystemStack 更简单（不打分排序，逐节点检查）：

```
StaticIterator → FeasibilityWrapper → DistinctPropertyIterator
  → QuotaIterator → FeasibleRankIterator → BinPackIterator(抢占)
  → ScoreNormalizationIterator
```

### 13.4 GenericStack.Select 流程

1. 优先尝试 `PreferredNodes`（sticky/migrate 节点）
2. 重置并设置 TG 约束
3. 有 spread/affinity 时调整 limit
4. 选择最高分节点 `s.maxScore.Next()`

---

## 14. Preemption 抢占机制

当资源不足时，调度器可以 **抢占低优先级分配**。

### 14.1 抢占配置

```go
type PreemptionConfig struct {
    SystemSchedulerEnabled    bool  // 默认 true
    SysBatchSchedulerEnabled  bool  // 默认 false
    BatchSchedulerEnabled     bool  // 默认 false
    ServiceSchedulerEnabled   bool  // 默认 false
}
```

### 14.2 抢占算法

1. **过滤候选抢占者**：优先级低于当前 job 的分配
2. **按优先级分组**：从低优先级开始尝试
3. **释放资源直到满足需求**
4. **maxParallel 惩罚**：超过 `max_parallel` 后应用 `maxParallelPenalty=50.0`
5. **选择距离最小的抢占组合**

### 14.3 PreemptionResource 接口

```go
type PreemptionResource interface {
    MeetsRequirements() bool
    Distance() float64  // [0, MaxFloat]，越低越好
}
```

实现：
- `NetworkPreemptionResource`：网络带宽
- `BasePreemptionResource`：CPU/Memory/Disk

### 14.4 抢占结果处理

```go
func (s *GenericScheduler) handlePreemptions(option, alloc, missing) {
    for _, stop := range option.PreemptedAllocs {
        s.plan.AppendPreemptedAlloc(stop, alloc.ID)
        s.planAnnotations.PreemptedAllocs = append(...)
        s.planAnnotations.DesiredTGUpdates[tgName].Preemptions += 1
    }
    alloc.PreemptedAllocations = preemptedAllocIDs
}
```

---

## 15. Deployment 部署管理

### 15.1 Deployment 数据结构

```go
type Deployment struct {
    ID, Namespace, JobID string
    JobVersion, JobModifyIndex, JobSpecModifyIndex uint64
    Status, StatusDescription string
    TaskGroups map[string]*DeploymentState
}

type DeploymentState struct {
    AutoRevert       bool
    Promoted         bool
    PlacedCanaries   []string
    DesiredCanaries  int
    DesiredTotal     int
    PlacedAllocs     int
    HealthyAllocs    int
    UnhealthyAllocs  int
}
```

### 15.2 部署状态流转

```
initializing → pending → running → successful / failed / cancelled
                              ↓
                            paused (手动或自动)
```

### 15.3 Canary 部署

**Service/Batch**：Reconciler 计算 → 放置 canary → Promoted 后 rolling update → `downgradedJobForPlacement` 处理非 canary 回退

**System**：`DesiredTotal` = 候选节点数 → `DesiredCanaries` = `ceil(Canary% × destructiveCount)` → `evictUnneededCanaries`

### 15.4 DeploymentWatcher

独立组件监控部署健康状态，触发评估。定义于 [nomad/deploymentwatcher/](file:///d:/claude/nomad/nomad/deploymentwatcher/)。

---

## 16. Plan 提交与并发控制

### 16.1 Plan 结构

```go
type Plan struct {
    EvalID, EvalToken string
    SnapshotIndex     uint64
    NodeUpdate      map[string][]*structs.Allocation  // 要停止的
    NodeAllocation  map[string][]*structs.Allocation  // 要放置的
    NodePreemptions map[string][]*structs.Allocation  // 要抢占的
    Deployment       *structs.Deployment
    DeploymentUpdates []*structs.DeploymentStatusUpdate
    Annotations *PlanAnnotations
}
```

### 16.2 乐观并发控制

定义于 [nomad/plan_apply.go](file:///d:/claude/nomad/nomad/plan_apply.go)：

planApply goroutine 采用 **重叠验证与应用** 策略：
- 验证 plan N 后开始 Raft 应用
- 等待 Raft 应用期间，乐观验证 plan N+1
- 维护悲观版（Raft 日志）和乐观版（假设事务成功）

### 16.3 冲突处理

调度器收到 PlanResult 后：
1. `RefreshIndex != 0`：状态过期，刷新后重试
2. `!fullCommit`：部分提交，重试
3. `newState != nil`：使用新状态重试

### 16.4 BadNodeTracker

跟踪 plan 被拒绝的节点，检测异常节点。配置：
- `NodePlanRejectionEnabled`
- `NodePlanRejectionWindow`
- `NodePlanRejectionThreshold`

---

## 17. BlockedEvals 阻塞评估

当调度器无法放置所有分配时，创建 **阻塞评估**，等待资源可用时重试。

### 17.1 结构

定义于 [nomad/blocked_evals.go](file:///d:/claude/nomad/nomad/blocked_evals.go)：

```go
type BlockedEvals struct {
    captured map[string]wrappedEval  // 被 computed class 捕获的
    escaped  map[string]wrappedEval  // 逃逸 computed class 的
    system   *systemEvals            // system 作业的
    jobs     map[structs.NamespacedID]string  // 每 job 一个阻塞 eval
    capacityChangeCh chan *capacityUpdate
    unblockIndexes   map[string]unblockEvent
}
```

### 17.2 阻塞与解除阻塞

**阻塞时机**：GenericScheduler 放置失败时调用 `createBlockedEval`

**解除阻塞触发**：
1. `UnblockNode`：节点状态变化（新节点、节点恢复）
2. `UnblockClass`：computed class 容量变化
3. `UnblockQuota`：配额释放
4. `UnblockJob`：job 更新

### 17.3 FollowUpEvals（延迟重调度）

对于可重调度但需要等待的分配，创建 `FollowUpEvals`，通过 `WaitUntil` 设置延迟时间。

---

## 18. 配置项与调优

### 18.1 SchedulerConfiguration

```go
type SchedulerConfiguration struct {
    SchedulerAlgorithm        string  // binpack 或 spread
    PreemptionConfig          PreemptionConfig
    MemoryOversubscriptionEnabled bool
    MaxConcurrentPlanEvals    int
}

// 按 NodePool 覆盖
func (sc *SchedulerConfiguration) WithNodePool(pool *structs.NodePool) *SchedulerConfiguration
```

### 18.2 Worker 配置

| 配置 | 说明 |
|------|------|
| `EnabledSchedulers` | 启用的调度器类型列表 |
| `EvalNackTimeout` | Nack 超时时间 |
| `EvalDeliveryLimit` | 评估最大投递次数 |
| `NumSchedulers` | Worker 数量 |

### 18.3 调度器重试配置

| 调度器 | 最大重试 | 说明 |
|--------|----------|------|
| service | 5 | 更注重放置质量 |
| batch | 2 | 更注重快速决策 |
| system | 5 | 需要保证覆盖 |
| sysbatch | 2 | 一次性任务 |

### 18.4 NodePool 调度配置

每个 NodePool 可覆盖全局调度配置：
- `SchedulerAlgorithm`：binpack 或 spread
- `MemoryOversubscriptionEnabled`
- `NodeLimitForFeasibilityChecks`：spread/affinity 时最小评估节点数

---

## 19. 典型调用链

### 19.1 Service Job 调度完整调用链

```
Job.Register RPC
  → state.UpsertJob
    → EvalBroker.Enqueue(eval[TriggeredBy=JobRegister])
      → Worker.dequeueEvaluation
        → Worker.snapshotMinIndex
        → Worker.invokeScheduler
          → scheduler.NewScheduler("service")
          → GenericScheduler.Process(eval)
            → retryMax(5, process, progressMade)
              → GenericScheduler.process()
                → state.JobByID
                → state.LatestDeploymentByJobID
                → feasible.NewEvalContext
                → feasible.NewGenericStack(batch=false)
                → GenericScheduler.setJob → stack.SetJob → stack.SetSchedulerConfiguration
                → GenericScheduler.computeJobAllocs()
                  → state.AllocsByJob
                  → taintedNodes
                  → updateNonTerminalAllocsToLost
                  → AllocReconciler.Compute()
                    → cancelUnneededDeployments
                    → handleStop
                    → computeDeploymentComplete
                    → computeGroup × N
                      → classifyAllocs (6 buckets)
                      → filterByRescheduleable
                      → computeStop/Canaries/Placements/DestructiveUpdates/Migrations
                  → plan.AppendStoppedAlloc / AppendAlloc
                → GenericScheduler.computePlacements()
                  → readyNodesInDCsAndPool
                  → for each PlacementResult:
                    → findPreferredNode
                    → selectNextOption
                      → stack.Select
                        → GenericStack.Select
                          → maxScore.Next() → BinPack → Spread → Affinity...
                      → (if nil && preemption) stack.Select(preempt=true)
                    → plan.AppendAlloc
                → planner.SubmitPlan
                  → Worker.SubmitPlan
                    → RPC("Plan.Submit")
                    → planApply goroutine
                      → evaluatePlan
                      → applyPlan via Raft
                  → result.FullCommit check
                → (if !fullCommit) return false, retry
                → (if fullCommit) return true
          → sendAck(eval, token)
```

### 19.2 System Job 调度调用链

```
EvalBroker.Enqueue
  → Worker.dequeueEvaluation
    → scheduler.NewScheduler("system")
    → SystemScheduler.Process(eval)
      → retryMax(5, process, progressMade)
        → SystemScheduler.process()
          → readyNodesInDCsAndPool
          → state.LatestDeploymentByJobID
          → feasible.NewSystemStack
          → SystemScheduler.computeJobAllocs()
            → NodeReconciler.Compute()
              → computeForNode × N (per node)
            → inplaceUpdate
            → evictAndPlace
            → SystemScheduler.computePlacements()
              → for each PlacementResult:
                → stack.SetNodes([single_node])
                → stack.Select(tg, options)
                → plan.AppendAlloc
            → deployment canary logic
          → planner.SubmitPlan
```

### 19.3 资源变化触发调度

```
Node.Update RPC (资源变化)
  → state.UpsertNode
    → BlockedEvals.Unblock(nodeClass)
      → capacityChangeCh ← update
        → Unblock goroutine:
          → evalBroker.Enqueue(blockedEval)
            → Worker picks up & reschedules
```

---

## 20. 代码文件索引

### 20.1 scheduler 包

| 文件 | 说明 |
|------|------|
| [scheduler/scheduler.go](file:///d:/claude/nomad/scheduler/scheduler.go) | 调度器注册表与工厂函数 |
| [scheduler/generic_sched.go](file:///d:/claude/nomad/scheduler/generic_sched.go) | GenericScheduler（service/batch）实现 |
| [scheduler/scheduler_system.go](file:///d:/claude/nomad/scheduler/scheduler_system.go) | SystemScheduler 实现 |
| [scheduler/scheduler_sysbatch.go](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go) | SysBatchScheduler 实现 |
| [scheduler/util.go](file:///d:/claude/nomad/scheduler/util.go) | 工具函数（readyNodes, retryMax, taintedNodes, tasksUpdated） |
| [scheduler/annotate.go](file:///d:/claude/nomad/scheduler/annotate.go) | Plan 注释 |
| [scheduler/README.md](file:///d:/claude/nomad/scheduler/README.md) | 架构文档 |

### 20.2 scheduler/structs 包

| 文件 | 说明 |
|------|------|
| [scheduler/structs/interfaces.go](file:///d:/claude/nomad/scheduler/structs/interfaces.go) | Scheduler/State/Planner/Factory 接口 |
| [scheduler/structs/const.go](file:///d:/claude/nomad/scheduler/structs/const.go) | 常量定义 |
| [scheduler/structs/structs.go](file:///d:/claude/nomad/scheduler/structs/structs.go) | 辅助数据结构 |

### 20.3 scheduler/feasible 包

| 文件 | 说明 |
|------|------|
| [scheduler/feasible/feasible.go](file:///d:/claude/nomad/scheduler/feasible/feasible.go) | FeasibleIterator/Checker 接口及实现 |
| [scheduler/feasible/rank.go](file:///d:/claude/nomad/scheduler/feasible/rank.go) | RankIterator/BinPackIterator 实现 |
| [scheduler/feasible/stack.go](file:///d:/claude/nomad/scheduler/feasible/stack.go) | GenericStack/SystemStack 实现 |
| [scheduler/feasible/spread.go](file:///d:/claude/nomad/scheduler/feasible/spread.go) | SpreadIterator 实现 |
| [scheduler/feasible/preemption.go](file:///d:/claude/nomad/scheduler/feasible/preemption.go) | 抢占机制实现 |
| [scheduler/feasible/context.go](file:///d:/claude/nomad/scheduler/feasible/context.go) | EvalContext/Context 接口 |
| [scheduler/feasible/device.go](file:///d:/claude/nomad/scheduler/feasible/device.go) | DeviceChecker 实现 |
| [scheduler/feasible/select.go](file:///d:/claude/nomad/scheduler/feasible/select.go) | 选择逻辑 |
| [scheduler/feasible/propertyset.go](file:///d:/claude/nomad/scheduler/feasible/propertyset.go) | Spread 属性集 |

### 20.4 scheduler/reconciler 包

| 文件 | 说明 |
|------|------|
| [scheduler/reconciler/reconcile_cluster.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go) | AllocReconciler（service/batch） |
| [scheduler/reconciler/reconcile_node.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go) | NodeReconciler（system/sysbatch） |
| [scheduler/reconciler/allocs.go](file:///d:/claude/nomad/scheduler/reconciler/allocs.go) | 分配集合操作 |
| [scheduler/reconciler/filters.go](file:///d:/claude/nomad/scheduler/reconciler/filters.go) | 过滤器 |
| [scheduler/reconciler/reconnecting_picker.go](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go) | 重连选择器 |

### 20.5 nomad 包（调度相关）

| 文件 | 说明 |
|------|------|
| [nomad/worker.go](file:///d:/claude/nomad/nomad/worker.go) | Worker 实现 |
| [nomad/eval_broker.go](file:///d:/claude/nomad/nomad/eval_broker.go) | EvalBroker 评估队列 |
| [nomad/blocked_evals.go](file:///d:/claude/nomad/nomad/blocked_evals.go) | BlockedEvals 阻塞评估 |
| [nomad/plan_apply.go](file:///d:/claude/nomad/nomad/plan_apply.go) | Plan 提交与应用 |
| [nomad/plan_queue.go](file:///d:/claude/nomad/nomad/plan_queue.go) | Plan 队列 |
| [nomad/core_sched.go](file:///d:/claude/nomad/nomad/core_sched.go) | CoreScheduler 核心调度器 |
| [nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go) | Leader 选举与调度启动 |
| [nomad/deploymentwatcher/](file:///d:/claude/nomad/nomad/deploymentwatcher/) | DeploymentWatcher 部署监控 |

---

## 21. 设计要点

### 21.1 Evaluation 驱动异步模型

所有调度都由 Evaluation 触发，解耦了事件源与调度逻辑：
- 16 种触发原因覆盖所有变更场景
- EvalBroker 提供优先级队列 + 至少一次交付
- BlockedEvals 延迟重试直到资源可用

### 21.2 乐观并发控制

多 Worker 并行调度，通过 Plan.SnapshotIndex 实现乐观锁：
- 调度基于快照，不直接修改状态
- Plan 提交时验证快照一致性
- 冲突时自动重试（最多 5 次/2 次）

### 21.3 责任分离

- **Scheduler**：纯业务逻辑（Reconciler + Feasible + Rank）
- **Planner**：状态持久化（Plan 提交 + Raft 应用）
- **Worker**：管道连接（出队 + 调度 + 提交 + Ack）

### 21.4 迭代器链模式

Stack 使用链式迭代器组合可行性检查与打分：
- 每个迭代器只做一件事
- 可自由组合不同调度策略
- GenericStack 和 SystemStack 共享基础迭代器

### 21.5 Reconciler 分离

Reconciler 作为独立阶段，使调度逻辑可测试：
- 纯函数式计算（输入状态 → 输出变更集）
- 不直接操作 Plan
- AllocReconciler vs NodeReconciler 对应不同作业类型

### 21.6 逐步降级策略

资源不足时的降级路径：
1. 正常放置 → 失败
2. 启用抢占 → 仍失败
3. 创建阻塞评估 → 等待资源
4. 资源可用 → 解除阻塞 → 重新调度

### 21.7 节点限制优化

避免全节点扫描的 O(N) 复杂度：
- batch：Power of Two Choices（2 个节点）
- service：log2(N) 个节点
- spread/affinity：动态调整到足够统计样本

### 21.8 Computed Node Class 缓存

相似节点共享可行性结果：
- 同 class 节点只需检查一次
- 逃逸约束（无法分类）单独跟踪
- 大幅减少重复计算

### 21.9 Panic 恢复

所有调度器 Process 方法都有 defer recover，防止单个 eval panic 导致整个 Worker 崩溃：

```go
defer func() {
    if r := recover(); r != nil {
        s.logger.Error("processing eval panicked scheduler - please report this as a bug!", ...)
        err = fmt.Errorf("failed to process eval: %v", r)
    }
}()
```

---

## 22. 总结

Nomad 调度系统是一个精心设计的 **异步、乐观并发、评估驱动** 的调度框架，核心特点包括：

1. **四种调度器**：service（高质量放置）、batch（快速决策）、system（全节点覆盖）、sysbatch（一次性系统任务），通过工厂模式统一管理

2. **两阶段调度**：Reconciler（计算变更集）→ Feasible/Rank（选择节点），解耦逻辑与策略

3. **迭代器链模式**：Stack 组合 FeasibleChecker + RankIterator，灵活构建不同调度策略

4. **乐观并发控制**：多 Worker 并行调度 + Plan.SnapshotIndex 乐观锁 + 自动重试

5. **丰富的调度特性**：canary 部署、rolling update、preemption、reschedule、spread、affinity、distinct constraints

6. **完善的容错机制**：blocked evals、follow-up evals、panic recovery、退避重试、BadNodeTracker

7. **性能优化**：computed node class 缓存、节点数限制（log2(N)）、Fisher-Yates 洗牌、并行 plan 验证

8. **CoreScheduler**：独立管理 GC、密钥轮转、变量重加密等集群运维任务
