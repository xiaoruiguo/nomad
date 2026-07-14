# Nomad Job 调度系统技术分析

> 文档定位：深入剖析 Nomad 调度器（scheduler）子系统的架构、核心接口、调度算法、协调流程与配置实践，作为理解 Nomad 任务编排机制的工程参考。

---

## 目录

1. [总体架构](#1-总体架构)
2. [核心接口与组件](#2-核心接口与组件)
3. [调度器类型对比](#3-调度器类型对比)
4. [Worker 调度循环](#4-worker-调度循环)
5. [GenericScheduler 详解（service / batch）](#5-genericscheduler-详解service--batch)
6. [SystemScheduler 详解（system / sysbatch）](#6-systemscheduler-详解system--sysbatch)
7. [可行性与评分链路（Stack）](#7-可行性与评分链路stack)
8. [评分算法详解](#8-评分算法详解)
9. [协调器 Reconciler](#9-协调器-reconciler)
10. [抢占 Preemption](#10-抢占-preemption)
11. [部署 Deployment 管理](#11-部署-deployment-管理)
12. [Plan 提交与冲突解决](#12-plan-提交与冲突解决)
13. [触发与重试机制](#13-触发与重试机制)
14. [配置项参考](#14-配置项参考)
15. [关键代码文件索引](#15-关键代码文件索引)

---

## 1. 总体架构

Nomad 调度系统采用 **评估驱动（Evaluation-driven）** 的异步架构，由以下关键角色协作完成：

```
                ┌────────────────────────────────────────────────┐
                │              Nomad Server (Leader)             │
                │                                                │
  Job Register  │  ┌──────────┐  enqueue   ┌────────────────┐   │
  ───────────►  │  │ EvalBroker│  ────────► │ EvalBroker     │   │
                │  └──────────┘            │  (FIFO+Priority)│   │
                │                          └──────┬─────────┘   │
                │                                 │ dequeue     │
                │                          ┌──────▼─────────┐   │
                │                          │    Worker      │   │
                │                          │  (多并发实例)   │   │
                │                          └──────┬─────────┘   │
                │                                 │ invoke      │
                │                          ┌──────▼─────────┐   │
                │                          │   Scheduler    │   │
                │                          │ service/batch/ │   │
                │                          │ system/sysbatch│   │
                │                          └──────┬─────────┘   │
                │                                 │             │
                │           ┌─────────────────────┼─────────┐   │
                │           ▼                     ▼         ▼   │
                │   ┌──────────────┐   ┌──────────────┐ ┌─────┐│
                │   │  Reconciler  │   │ Feasible Stack│ │Plan ││
                │   │  (期望vs现状) │   │ (过滤+评分)   │ │提交 ││
                │   └──────────────┘   └──────────────┘ └──┬──┘│
                │                                          │   │
                │                          Raft Apply ◄────┘   │
                └────────────────────────────────────────────────┘
```

### 核心数据流

1. **API/状态变更** → 写入 Raft 日志 → 触发创建 `Evaluation`（评估）
2. **EvalBroker** 将 `Evaluation` 入队，按 `Priority`、`SchedulerName` 分组
3. **Worker** 通过阻塞 RPC 从 EvalBroker 取出评估
4. **Scheduler** 调用 `Process(eval)` 计算变更
5. **Reconciler** 比对期望态与现状，决定 stop / inplace update / place
6. **Feasible Stack** 过滤可用节点并评分选出最优节点
7. **Plan** 提交至 Leader，由其做并发冲突检测，最终通过 Raft 应用

---

## 2. 核心接口与组件

### 2.1 Scheduler 接口

[scheduler/structs/interfaces.go](file:///d:/claude/nomad/scheduler/structs/interfaces.go) 定义顶层接口：

```go
// Scheduler 是调度器顶层接口，处理单个 Evaluation
type Scheduler interface {
    Process(*structs.Evaluation) error
}

// Factory 用于实例化调度器
type Factory func(log.Logger, chan<- interface{}, State, Planner) Scheduler
```

### 2.2 State 接口（只读集群状态）

```go
type State interface {
    Nodes(ws memdb.WatchSet) (memdb.ResultIterator, error)
    NodesByNodePool(ws memdb.WatchSet, poolName string) (memdb.ResultIterator, error)
    NodeByID(ws memdb.WatchSet, nodeID string) (*structs.Node, error)
    AllocsByJob(ws memdb.WatchSet, namespace, jobID string, all bool) ([]*structs.Allocation, error)
    AllocsByNode(ws memdb.WatchSet, node string) ([]*structs.Allocation, error)
    AllocByID(ws memdb.WatchSet, allocID string) (*structs.Allocation, error)
    JobByID(ws memdb.WatchSet, namespace, id string) (*structs.Job, error)
    JobByIDAndVersion(ws memdb.WatchSet, namespace, id string, version uint64) (*structs.Job, error)
    LatestDeploymentByJobID(ws memdb.WatchSet, namespace, jobID string) (*structs.Deployment, error)
    SchedulerConfig() (uint64, *structs.SchedulerConfiguration, error)
    CSIVolumeByID(memdb.WatchSet, string, string) (*structs.CSIVolume, error)
    HostVolumeByID(memdb.WatchSet, string, string, bool) (*structs.HostVolume, error)
    // ... 更多查询方法
}
```

State 是**不可变视图**，让调度器在乐观并发模型下基于快照决策。

### 2.3 Planner 接口（计划提交）

```go
type Planner interface {
    SubmitPlan(*structs.Plan) (*structs.PlanResult, State, error)
    UpdateEval(*structs.Evaluation) error
    CreateBlockedEval(*structs.Evaluation) error
    ReblockEval(*structs.Evaluation) error
    // ...
}
```

`Planner` 由 Worker 实现，调度器通过它把变更计划送回 Server 协调。

### 2.4 调度器注册表

[scheduler/scheduler.go](file:///d:/claude/nomad/scheduler/scheduler.go)：

```go
var BuiltinSchedulers = map[string]structs.Factory{
    "service":  NewServiceScheduler,
    "batch":    NewBatchScheduler,
    "system":   NewSystemScheduler,
    "sysbatch": NewSysBatchScheduler,
}

const SchedulerVersion uint16 = 1
```

`NewScheduler(name, ...)` 根据 name 从 map 取 Factory 实例化调度器。`SchedulerVersion` 用于 Leader 与 Worker 之间版本兼容性校验，防止跨版本 dequeue。

---

## 3. 调度器类型对比

| 类型       | 工厂函数                | 适用场景                         | 关键特性                                                   |
|------------|-------------------------|----------------------------------|------------------------------------------------------------|
| `service`  | `NewServiceScheduler`   | 长期运行的服务                   | 高质量放置；支持 canary、滚动更新、抢占、重调度             |
| `batch`    | `NewBatchScheduler`     | 短期批处理任务                   | 快速决策（仅 2 次重试）；Power-of-Two-Choices；失败可重跑   |
| `system`   | `NewSystemScheduler`    | 在每个符合条件的节点上运行       | 不计数；每节点一个 alloc；支持 canary/抢占                   |
| `sysbatch` | `NewSysBatchScheduler`  | 系统级批处理（每节点跑一次）     | 成功后退出；不会因成功退出而重启                             |

### 重试次数对比

```go
// scheduler/generic_sched.go
maxServiceScheduleAttempts = 5
maxBatchScheduleAttempts   = 2

// scheduler/scheduler_system.go
maxSystemScheduleAttempts  = 5
```

### 行为差异

| 维度         | service          | batch            | system             | sysbatch          |
|--------------|------------------|------------------|--------------------|-------------------|
| Reconciler   | ClusterReconciler| ClusterReconciler| NodeReconciler     | NodeReconciler    |
| 节点选择     | 全集群评分择优   | 全集群评分择优   | 每节点一个 alloc   | 每节点一个 alloc  |
| 失败重启     | 是               | 是（按 ReschedulePolicy）| 是            | 否                |
| 部署管理     | 完整 Deployment  | 完整 Deployment  | 简化 Deployment    | 简化 Deployment   |
| 抢占         | 支持             | 支持             | 支持               | 支持              |

---

## 4. Worker 调度循环

[nomad/worker.go](file:///d:/claude/nomad/nomad/worker.go) 中的 `Worker` 是 Server 侧的消费者。

### 4.1 主循环

```go
// 简化版主循环
for {
    if w.workerShuttingDown() { return }

    // 1. 阻塞 dequeue 一个评估
    eval, token, waitIndex, shutdown := w.dequeueEvaluation(dequeueTimeout)
    if shutdown { return }

    // 2. 等待 Raft 日志追上 waitIndex
    snap, err := w.snapshotMinIndex(waitIndex, raftSyncLimit)
    if err != nil {
        w.sendNack(eval, token)
        continue
    }

    // 3. 调用调度器
    w.setWorkloadStatus(WorkloadScheduling)
    if err := w.invokeScheduler(snap, eval, token); err != nil {
        w.sendNack(eval, token)
        continue
    }

    // 4. Ack 完成
    w.sendAck(eval, token)
}
```

### 4.2 Dequeue 请求

```go
req := structs.EvalDequeueRequest{
    Schedulers:       w.enabledSchedulers, // 该 Worker 能处理的调度器类型
    Timeout:          timeout,
    SchedulerVersion: scheduler.SchedulerVersion,
    WriteRequest: structs.WriteRequest{Region: w.srv.config.Region},
}
```

只有 `enabledSchedulers` 列表中的调度器类型才会被该 Worker 取走。Server 启动时根据配置启用对应 Worker。

### 4.3 SubmitPlan 实现

`Worker.SubmitPlan` 满足 `Planner` 接口：

```go
func (w *Worker) SubmitPlan(plan *structs.Plan) (*structs.PlanResult, sstructs.State, error) {
    // 通过 RPC 把 Plan 发送到 Leader
    // Leader 做并发冲突检测，返回 PlanResult 与（可能刷新的）State
}
```

如果 Plan 部分提交或产生冲突，调度器可基于刷新后的 State 再次尝试。

---

## 5. GenericScheduler 详解（service / batch）

[scheduler/generic_sched.go](file:///d:/claude/nomad/scheduler/generic_sched.go)

### 5.1 结构定义

```go
type GenericScheduler struct {
    logger   log.Logger
    eventsCh chan<- interface{}
    state    sstructs.State
    planner  sstructs.Planner
    batch    bool  // true=batch；false=service

    eval       *structs.Evaluation
    job        *structs.Job
    plan       *structs.Plan
    planResult *structs.PlanResult
    ctx        *feasible.EvalContext
    stack      *feasible.GenericStack

    followUpEvals []*structs.Evaluation  // 带 WaitUntil 的延迟重调度
    deployment    *structs.Deployment
    blocked       *structs.Evaluation    // 资源不足时阻塞
    failedTGAllocs map[string]*structs.AllocMetric
    queuedAllocs   map[string]int
    planAnnotations *structs.PlanAnnotations
}
```

`NewServiceScheduler` 与 `NewBatchScheduler` 仅 `batch` 字段不同：

```go
func NewServiceScheduler(...) sstructs.Scheduler {
    return &GenericScheduler{..., batch: false}
}
func NewBatchScheduler(...) sstructs.Scheduler {
    return &GenericScheduler{..., batch: true}
}
```

### 5.2 Process 主流程

```go
func (s *GenericScheduler) Process(eval *structs.Evaluation) (err error) {
    defer func() {
        if r := recover(); r != nil {
            s.logger.Error("processing eval panicked scheduler", ...)
            err = fmt.Errorf("failed to process eval: %v", r)
        }
    }()

    s.eval = eval
    // 校验 TriggeredBy 合法性
    switch eval.TriggeredBy { ... }

    // 重试：service=5，batch=2；只要 progressMade 即重置计数
    progress := func() bool { return progressMade(s.planResult) }
    limit := maxServiceScheduleAttempts
    if s.batch { limit = maxBatchScheduleAttempts }
    if err := retryMax(limit, s.process, progress); err != nil {
        // 失败处理：创建 BlockedEval 等待资源
        s.createBlockedEval(true)
        ...
    }
}
```

### 5.3 process 内部步骤

```go
func (s *GenericScheduler) process() (bool, error) {
    // 1. 取 Job
    s.job, err = s.state.JobByID(ws, s.eval.Namespace, s.eval.JobID)

    // 2. 取最新 Deployment
    s.deployment, err = s.state.LatestDeploymentByJobID(ws, ...)

    // 3. 创建 Plan
    s.plan = s.eval.MakePlan(s.job)

    // 4. 构建 EvalContext 与 Stack
    s.ctx = feasible.NewEvalContext()
    s.stack = feasible.NewGenericStack(s.batch, s.ctx)
    s.stack.SetJob(s.job)
    s.stack.SetSchedulerConfiguration(schedConfig)

    // 5. 协调：决定 place/stop/inplace
    s.computeJobAllocs()

    // 6. 提交 Plan
    s.planResult, newState, err = s.planner.SubmitPlan(s.plan)
    // 7. 根据结果决定是否重试
    return progress, err
}
```

### 5.4 computeJobAllocs（协调+放置）

```go
func (s *GenericScheduler) computeJobAllocs() error {
    allocs, _ := s.state.AllocsByJob(...)
    tainted, _ := taintedNodes(s.state, allocs)
    updateNonTerminalAllocsToLost(s.plan, tainted, allocs)

    // 调用 Reconciler
    r := reconciler.NewAllocReconciler(...)
    result := r.Compute()

    // 应用 ReconcileResults 到 Plan
    s.plan.Deployment = result.Deployment
    s.plan.DeploymentUpdates = result.DeploymentUpdates

    for _, stop := range result.Stop {
        s.plan.AppendStoppedAlloc(stop.Alloc, ...)
    }
    for _, update := range result.InplaceUpdate {
        s.ctx.Plan().AppendAlloc(update, nil)
    }
    // ...

    if len(result.Place)+len(result.DestructiveUpdate) == 0 {
        return nil
    }
    return s.computePlacements(destructive, place, ...)
}
```

### 5.5 computePlacements（节点选择）

```go
func (s *GenericScheduler) computePlacements(destructive, place, nameIndex) error {
    nodes, byDC, err := s.setNodes(s.job)  // 拉取并打乱节点
    s.stack.SetNodes(nodes)

    for _, p := range place {
        option := s.stack.Select(p.TaskGroup(), &feasible.SelectOptions{
            PenaltyNodeIDs: ...,
            AllocName:      ...,
        })
        if option == nil {
            // 无可用节点：记录失败指标
            s.failedTGAllocs[tg.Name] = &structs.AllocMetric{...}
            continue
        }
        // 创建新 alloc 并加入 Plan
        alloc := newAlloc(s.eval, s.job, p, option)
        s.plan.AppendAlloc(alloc, option.PreemptedAllocs)
    }
    return nil
}
```

---

## 6. SystemScheduler 详解（system / sysbatch）

[scheduler/scheduler_system.go](file:///d:/claude/nomad/scheduler/scheduler_system.go) 与 [scheduler/scheduler_sysbatch.go](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go)。

### 6.1 结构

```go
type SystemScheduler struct {
    logger   log.Logger
    state    sstructs.State
    planner  sstructs.Planner
    eval     *structs.Evaluation
    job      *structs.Job
    plan     *structs.Plan
    planResult *structs.PlanResult
    ctx      *feasible.EvalContext
    stack    *feasible.SystemStack

    nodes         []*structs.Node
    notReadyNodes map[string]struct{}
    nodesByDC     map[string]int
    deployment    *structs.Deployment

    tgCandidateNodeCounts     map[string]int
    tgDestructiveUpdateCounts map[string]int
    tgExistingCanaryCount     map[string]int
}
```

### 6.2 computeJobAllocs（节点级协调）

System 调度器使用 `NodeReconciler`（不同于 service/batch 的 `ClusterReconciler`）：

```go
func (s *SystemScheduler) computeJobAllocs() error {
    s.nodes, s.notReadyNodes, s.nodesByDC, err = readyNodesInDCsAndPool(
        s.state, s.job.Datacenters, s.job.NodePool)

    nr := reconciler.NewNodeReconciler(s.deployment)
    result := nr.Compute(s.job, s.nodes, s.notReadyNodes, tainted, live, term)

    // 处理 place / stop / inplace update / destructive update / canary
    ...
}
```

### 6.3 SystemStack 与 GenericStack 的差异

- SystemStack 不使用 `LimitIterator`（因为要遍历所有节点）
- 不使用 `BinPackIterator`（不做装箱评分）
- 仍然支持 ConstraintChecker、DriverChecker、NodeAffinity 等
- 每节点一次 Select，按顺序处理

### 6.4 sysbatch 的特殊行为

`sysbatch` 复用 `SystemScheduler`，但：
- 任务成功后即视为完成（不像 system 会重启）
- 通过 `Job.Type == "sysbatch"` 在调度时区分对待

---

## 7. 可行性与评分链路（Stack）

[scheduler/feasible/stack.go](file:///d:/claude/nomad/scheduler/feasible/stack.go)

### 7.1 Stack 接口

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

### 7.2 GenericStack 的迭代器链

`NewGenericStack` 构造时按顺序串联迭代器：

```
StaticIterator (源)
    │
    ▼
FeasibilityWrapper (job 级 + task group 级约束检查)
    │  ├── ConstraintChecker (job)
    │  ├── DistinctHostsIterator
    │  ├── DistinctPropertyIterator
    │  ├── DriverChecker
    │  ├── ConstraintChecker (task group)
    │  ├── DeviceChecker
    │  ├── HostVolumeChecker
    │  ├── CSIVolumeChecker
    │  ├── NetworkChecker
    │  └── SecretsProviderChecker
    ▼
QuotaIterator (命名空间配额检查)
    ▼
FeasibleRankIterator (基础评分)
    ▼
BinPackIterator (装箱评分)
    ▼
JobAntiAffinityIterator (同 job 反亲和惩罚)
    ▼
NodeReschedulingPenaltyIterator (失败节点惩罚)
    ▼
NodeAffinityIterator (节点亲和加分)
    ▼
SpreadIterator (跨属性分散加分)
    ▼
ScoreNormalizationIterator (归一化)
    ▼
LimitIterator (限制评估节点数)
    ▼
MaxScoreIterator (取最高分)
```

### 7.3 LimitIterator：性能关键

```go
// scheduler/feasible/stack.go SetNodes
limit := 2
if n := len(baseNodes); !s.batch && n > 0 {
    logLimit := int(math.Ceil(math.Log2(float64(n))))
    if logLimit > limit { limit = logLimit }
}
s.limit.SetLimit(limit)
```

- batch：固定 2（Power-of-Two-Choices）
- service：`max(2, ceil(log2(N)))`，在大集群也只评估少数节点

但当 task group 配置了 affinity 或 spread 时，会放宽限制：

```go
if s.nodeAffinity.hasAffinities() || s.spread.hasSpreads() {
    if tg.Count < s.nodeLimitForFeasibilityChecks {
        s.limit.SetLimit(s.nodeLimitForFeasibilityChecks)  // 默认 100
    } else {
        s.limit.SetLimit(tg.Count)
    }
}
```

### 7.4 FeasibilityChecker 接口

[scheduler/feasible/feasible.go](file:///d:/claude/nomad/scheduler/feasible/feasible.go)：

```go
type FeasibleIterator interface {
    Next() *structs.Node
    Reset()
}

type FeasibilityChecker interface {
    Feasible(*structs.Node) bool
}
```

每个检查器实现 `FeasibilityChecker`，被 `FeasibilityWrapper` 串联调用。常见的过滤原因常量：

```go
FilterConstraintHostVolumes                    = "missing compatible host volumes"
FilterConstraintDrivers                        = "missing drivers"
FilterConstraintDevices                        = "missing devices"
FilterConstraintSecrets                        = "missing secrets provider"
FilterConstraintCSIVolumeNotFoundTemplate      = "missing CSI Volume %s"
FilterConstraintCSIVolumeNoReadTemplate        = "CSI volume %s is unschedulable or has exhausted its available reader claims"
FilterConstraintCSIVolumeNoWriteTemplate       = "CSI volume %s is unschedulable or is read-only"
FilterConstraintCSIVolumeInUseTemplate         = "CSI volume %s has exhausted its available writer claims"
```

### 7.5 TaskGroupConstraints：聚合任务组需求

`TaskGroupConstraints(tg)` 聚合任务组内所有 task 的：
- `Drivers`：所需驱动列表
- `Constraints`：合并的约束条件
- `Resources`：累加资源需求
- `Secrets`：所需 secrets provider

然后由对应的 Checker 统一判断节点是否满足整组需求。

---

## 8. 评分算法详解

[scheduler/feasible/rank.go](file:///d:/claude/nomad/scheduler/feasible/rank.go) 与相关迭代器文件。

### 8.1 RankedNode 结构

```go
type RankedNode struct {
    Node           *structs.Node
    FinalScore     float64
    Scores         []float64
    TaskResources  map[string]*structs.AllocatedTaskResources
    TaskLifecycles map[string]*structs.TaskLifecycleConfig
    AllocResources *structs.AllocatedSharedResources
    Proposed       []*structs.Allocation       // 缓存的节点上待提交 alloc
    PreemptedAllocs []*structs.Allocation      // 抢占掉的低优先级 alloc
}
```

### 8.2 BinPackIterator（装箱评分）

`binPackingMaxFitScore = 18.0`（最大可能分数，用于归一化）

装箱评分原则：**优先填满已使用的节点**，避免资源碎片化。

- 计算节点剩余资源能否满足 task group 需求
- 越紧凑（剩余越少）得分越高
- 受 `scheduler_config.scheduler_algorithm` 控制：
  - `binpack`（默认）：上述策略
  - `spread`：尽量分散

### 8.3 JobAntiAffinityIterator（同 job 反亲和）

同一 job 的多个 alloc 尽量不落在同一节点。每存在一个该 job 的 alloc，给该节点施加惩罚分。

### 8.4 NodeReschedulingPenaltyIterator（失败惩罚）

`SelectOptions.PenaltyNodeIDs` 中包含最近失败过的节点 ID。这些节点会被施加惩罚分，降低再次被选中的概率，避免抖动。

### 8.5 NodeAffinityIterator（节点亲和）

根据 job/task group 的 `Affinities` 字段，对匹配属性（如 `node.class == "high-mem"`）的节点加分。属性权重越高加分越多。

### 8.6 SpreadIterator（分散）

[scheduler/feasible/spread.go](file:///d:/claude/nomad/scheduler/feasible/spread.go)：

```go
type SpreadIterator struct {
    jobSpreads        []*structs.Spread        // job 级 spread
    tgSpreadInfo      map[string]spreadAttributeMap
    sumSpreadWeights  int32
    lowestSpreadBoost float64
    groupPropertySets map[string][]*propertySet
}
```

根据 `SpreadTarget.Attribute` 和 `SpreadTarget.Weight` 计算每个属性值上的目标分布比例，给距离目标偏离较小的节点加分。

例如：

```hcl
spread {
  attribute = "${node.datacenter}"
  weight    = 80
  target "dc1" { percent = 50 }
  target "dc2" { percent = 50 }
}
```

### 8.7 ScoreNormalizationIterator

把各类评分（binpack、affinity、spread、penalty 等）归一化到 [0, 1]，再按各自权重叠加成 `FinalScore`，供 `MaxScoreIterator` 选出最高分节点。

### 8.8 MaxScoreIterator 与 LimitIterator

- `LimitIterator`：限制评估的节点数量（见 7.3），跳过分数低于 `skipScoreThreshold = 0.0` 的节点，最多跳过 `maxSkip = 3` 个
- `MaxScoreIterator`：在 limit 范围内选出最终得分最高的节点

---

## 9. 协调器 Reconciler

[scheduler/reconciler/](file:///d:/claude/nomad/scheduler/reconciler) 目录。

### 9.1 两种协调器

| 协调器            | 文件                          | 用于               | 输入                            | 输出                       |
|-------------------|-------------------------------|--------------------|---------------------------------|----------------------------|
| `AllocReconciler` | `reconcile_cluster.go`        | service / batch    | job + 全集群 existing allocs    | place/stop/inplace/...     |
| `NodeReconciler`  | `reconcile_node.go`           | system / sysbatch  | job + 每节点的 allocs           | 每节点 place/stop/...      |

### 9.2 AllocReconciler 输入

```go
type ReconcilerState struct {
    Job               *structs.Job
    JobID             string
    JobIsBatch        bool
    DeploymentOld     *structs.Deployment
    DeploymentCurrent *structs.Deployment
    DeploymentPaused  bool
    DeploymentFailed  bool
    ExistingAllocs    []*structs.Allocation
    EvalID            string
    EvalPriority      int
}
```

### 9.3 ReconcileResults 输出

```go
type ReconcileResults struct {
    Deployment         *structs.Deployment                  // 要创建/更新的部署
    DeploymentUpdates  []*structs.DeploymentStatusUpdate     // 部署状态变更
    Place              []AllocPlaceResult                   // 新放置
    DestructiveUpdate  []AllocPlaceResult                   // 破坏性更新（先建后停）
    InplaceUpdate      []*structs.Allocation                // 原地更新
    AttributeUpdates   []*structs.Allocation                // 仅属性变更
    Stop               []AllocStopResult                    // 停止
    DelayedReschedule  map[string][]*structs.Allocation     // 延迟重调度
    DesiredFollowupEvals map[string][]*structs.Evaluation   // 跟随评估
    DesiredTGUpdates   map[string]*structs.DesiredUpdates   // 期望更新统计
    DisconnectUpdates []*structs.Allocation
    ReconnectUpdates  []*structs.Allocation
}
```

### 9.4 协调流程

```
r.Compute()
    │
    ├─► materializeTaskGroups(job)          # 计算期望 task group 数量
    │
    ├─► filter existing allocs by:          # 分类现有 allocs
    │     - 当前 job 版本 vs 老版本
    │     - 是否 terminal
    │     - 是否在 tainted 节点
    │     - 是否 canary
    │
    ├─► 决定 stop:
    │     - job 已停止 → 全部 stop
    │     - task group count 减少 → 多余的 stop
    │     - tainted 节点上的 alloc → stop + reschedule
    │     - 老版本非 canary → stop（destructive update）
    │
    ├─► 决定 inplace update:
    │     - 仅资源/约束变化且节点仍可满足
    │
    ├─► 决定 destructive update:
    │     - 镜像/命令变更，需先建新的再停旧的
    │
    ├─► 决定 place:
    │     - 期望数量 > 现有数量 → 新建
    │
    └─► 处理 deployment:
          - 创建/更新 deployment 状态
          - 推进 canary → promote → rolling update
```

### 9.5 NodeReconciler.Compute

```go
func (nr *NodeReconciler) Compute(
    job *structs.Job,
    readyNodes []*structs.Node,
    notReadyNodes map[string]struct{},
    taintedNodes map[string]*structs.Node,
    live []*structs.Allocation,
    terminal structs.TerminalByNodeByName,
) *NodeReconcileResult
```

按节点维度循环：

```
for each nodeID, allocs := range nodeAllocs {
    diff := nr.computeForNode(job, nodeID, eligibleNodes, ...)
    // diff 包含：place / update / migrate / evict / destructiveUpdate / inplaceUpdate
    result.Append(diff)
}
```

每个节点都应有一个该 job 的 alloc；若无则 place；若 alloc 是老版本则按 update 策略处理。

### 9.6 reconnectingPicker

[scheduler/reconciler/reconnecting_picker.go](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go) 处理断连客户端重连后的 alloc 恢复策略。当 client 离线后再回来，其上的 alloc 可能已被标记 lost，picker 决定是否复用、重建或放弃。

---

## 10. 抢占 Preemption

[scheduler/feasible/preemption.go](file:///d:/claude/nomad/scheduler/feasible/preemption.go)

### 10.1 触发条件

- 高优先级 job 无法找到资源
- `SelectOptions.Preempt = true`（由调度器在重试无果后开启）
- 仅 service / batch / system / sysbatch 在特定路径下启用

### 10.2 资源抽象

```go
type PreemptionResource interface {
    MeetsRequirements() bool
    Distance() float64
}

type BasePreemptionResource struct {        // CPU/Memory/Disk
    availableResources *structs.ComparableResources
    resourceNeeded     *structs.ComparableResources
}

type NetworkPreemptionResource struct {     // 网络 MBits
    availableResources *structs.NetworkResource
    resourceNeeded     *structs.NetworkResource
}
```

### 10.3 抢占算法

1. 在节点上找出所有低优先级 alloc（按 `Priority` 排序）
2. 累加这些 alloc 的资源直到满足新 alloc 需求
3. 计算抢占的"成本"（被抢占 alloc 数量、优先级差距、资源距离）
4. 选出总成本最低的节点
5. 把被抢占 alloc 放入 `RankedNode.PreemptedAllocs`，由 Plan 提交时一并 stop

### 10.4 maxParallel 惩罚

```go
const maxParallelPenalty = 50.0
```

为避免同一 job 的过多 alloc 同时被抢占，超出 `migrate.max_parallel` 后施加 50.0 的惩罚分。

### 10.5 抢占评估反馈

被抢占的 alloc 会触发 `EvalTriggerPreemption` 评估，让原 job 在其他节点重新调度。

---

## 11. 部署 Deployment 管理

### 11.1 Deployment 数据结构

Deployment 在 Raft 状态机中持久化，记录 job 的某次版本发布进度：

- `JobVersion`：对应的 job 版本
- `Status`：`running` / `paused` / `cancelled` / `successful` / `failed`
- `TaskGroups`：每个 task group 的部署状态（Promoted、PlacedCanaries、DesiredCanaries、HealthyAllocs、PlacedAllocs 等）

### 11.2 Canary 部署流程（service）

```
1. job 更新 → 创建新 deployment
2. Reconciler 计算 DesiredCanaries（按 update.canary 数量）
3. 放置 canary alloc（新版本，但非 promoted）
4. 运维通过 API promote：
   - Reconciler 推进：先停老 alloc，再建新 alloc，按 max_parallel 滚动
5. 全部完成后 deployment → successful
```

### 11.3 System 部署流程

System 部署较简化：

```go
// scheduler_system.go
tgCandidateNodeCounts     map[string]int
tgDestructiveUpdateCounts map[string]int
tgExistingCanaryCount     map[string]int
```

- Canary 在部分节点上先放（受 `update.canary` 控制，相对总候选节点数比例）
- Promote 后按节点批次推进 destructive update
- 通过 `NodeReconciler.computeForNode` 决定每节点是 canary、destructive 还是 inplace

### 11.4 滚动更新参数

```hcl
job "example" {
  update {
    max_parallel      = 2
    health_check      = "checks"
    min_healthy_time  = "10s"
    healthy_deadline  = "5m"
    progress_deadline = "10m"
    auto_revert       = true
    auto_promote      = false
    canary            = 1
    stagger           = "30s"
  }
}
```

- `max_parallel`：同时更新的 alloc 数
- `canary`：先放几个 canary 验证
- `auto_promote`：canary 健康后自动 promote
- `auto_revert`：失败自动回滚到上一稳定版本
- `stagger`：同节点上 task 间的间隔

### 11.5 回滚

通过 `downgradedJobForPlacement`（generic_sched.go）查找历史 deployment 中最近 promoted 或非 canary 版本：

```go
for _, d := range deployments {
    if dstate := d.TaskGroups[tgName]; dstate != nil &&
       (dstate.Promoted || dstate.DesiredCanaries == 0) {
        job, err := s.state.JobByIDAndVersion(nil, ns, jobID, d.JobVersion)
        return d.ID, job, err
    }
}
```

---

## 12. Plan 提交与冲突解决

### 12.1 Plan 结构

```go
type Plan struct {
    EvalID          string
    Job             *Job
    NodeUpdate      map[string][]*Allocation    // 要 stop 的 alloc（按节点）
    NodeAllocation  map[string][]*Allocation    // 要 place 的 alloc（按节点）
    NodePreemptions map[string][]*Allocation    // 抢占的 alloc
    Deployment      *Deployment
    DeploymentUpdates []*DeploymentStatusUpdate
    Annotations     *PlanAnnotations
}
```

### 12.2 提交流程

```
Scheduler.Plan  ──► Worker.SubmitPlan
                          │
                          ▼ RPC
                  Leader.processPlan
                          │
                          ├─► 取 Raft 快照
                          │
                          ├─► 对每个节点：
                          │     - 验证资源是否仍够（其他 plan 可能已提交）
                          │     - 验证节点未 tainted
                          │     - 验证 alloc 未被其他 plan 改动
                          │
                          ├─► 生成 PlanResult：
                          │     - FullCommit: 所有节点都接受
                          │     - Partial: 部分节点接受
                          │     - Refresh: 状态已变，建议刷新重试
                          │
                          └─► 返回 PlanResult + (可能刷新的) State
```

### 12.3 FullCommit 判定

```go
fullCommit, expected, actual := result.FullCommit(s.plan)
if !fullCommit {
    // 部分提交，重试
    return false, fmt.Errorf("missing state refresh after partial commit")
}
```

调度器通过 `retryMax` 在 `progressMade` 时重置计数；若部分提交但取得了进展，则继续重试。

### 12.4 BlockedEval

当所有节点都无法放置（资源不足或约束不满足）时，调度器创建 `BlockedEval`：

```go
func (s *GenericScheduler) createBlockedEval(blockedOnNodes bool) error {
    s.blocked = s.eval.CreateBlockedEval(...)
    // BlockedEval 放入 EvalBroker.blocked 队列
    // 当集群状态变化（新节点加入、节点资源释放）时会被重新激活
}
```

---

## 13. 触发与重试机制

### 13.1 Evaluation 触发原因

[scheduler/generic_sched.go](file:///d:/claude/nomad/scheduler/generic_sched.go) Process 中校验：

```go
switch eval.TriggeredBy {
case structs.EvalTriggerJobRegister:         // job 注册/更新
case structs.EvalTriggerJobDeregister:       // job 注销
case structs.EvalTriggerNodeDrain:           // 节点进入 drain
case structs.EvalTriggerNodeUpdate:          // 节点属性变化
case structs.EvalTriggerAllocStop:           // alloc 被显式停止
case structs.EvalTriggerAllocReschedule:     // alloc 请求重调度
case structs.EvalTriggerRollingUpdate:       // 部署推进
case structs.EvalTriggerQueuedAllocs:        // 排队 alloc 计数
case structs.EvalTriggerPeriodicJob:         // 周期 job 触发
case structs.EvalTriggerMaxPlans:            // 计划数上限
case structs.EvalTriggerDeploymentWatcher:   // 部署健康检查结果
case structs.EvalTriggerRetryFailedAlloc:    // 失败 alloc 重试
case structs.EvalTriggerFailedFollowUp:      // 跟随 eval 失败
case structs.EvalTriggerPreemption:          // 被抢占后重调度
case structs.EvalTriggerScaling:             // 水平伸缩
case structs.EvalTriggerMaxDisconnectTimeout: // 客户端断连超时
case structs.EvalTriggerReconnect:           // 客户端重连
}
```

### 13.2 retryMax 机制

```go
func retryMax(max int, fn func() (bool, error), progress func() bool) error {
    for i := 0; i < max; i++ {
        progressed, err := fn()
        if err == nil { return nil }
        if progressed || progress() {
            i = 0  // 有进展则重置计数
        }
    }
    return err
}
```

### 13.3 progressMade 判定

```go
func progressMade(result *structs.PlanResult) bool {
    if result == nil { return false }
    if result.RefreshIndex != 0 { return true }
    // 任何 alloc 被 stop 或 place 都算进展
    for _, allocs := range result.NodeUpdate { if len(allocs) > 0 { return true } }
    for _, allocs := range result.NodeAllocation { if len(allocs) > 0 { return true } }
    return false
}
```

### 13.4 FollowUpEvals（延迟重调度）

```go
followUpEvals []*structs.Evaluation
```

某些 alloc 因 `ReschedulePolicy.Delay` 需要延迟重试，调度器创建带 `WaitUntil` 的 follow-up eval，EvalBroker 到时间才释放。

### 13.5 BlockedEval 重新激活

集群状态变化（节点加入、节点资源释放、job 删除等）触发 `EvalBroker.unblock`，把对应 `BlockedEval` 重新放回 ready 队列。

---

## 14. 配置项参考

### 14.1 Job 级配置

```hcl
job "example" {
  type        = "service"   # service | batch | system | sysbatch
  priority    = 50          # 0-100，影响抢占顺序
  all_at_once = false       # 是否要求所有 alloc 一起放置

  region      = "global"
  datacenters = ["dc1", "dc2"]
  node_pool   = "production"

  constraint { ... }
  affinity    { ... }
  spread      { ... }

  update {
    max_parallel      = 2
    canary            = 1
    auto_promote      = false
    auto_revert       = true
    health_check      = "checks"
    min_healthy_time  = "10s"
    healthy_deadline  = "5m"
    progress_deadline = "10m"
    stagger           = "30s"
  }

  migrate {
    max_parallel   = 1
    health_check   = "checks"
    min_healthy_time = "10s"
    healthy_deadline = "5m"
  }

  reschedule {
    attempts       = 3
    interval       = "1h"
    delay          = "30s"
    delay_function = "exponential"
    max_delay      = "1h"
    unlimited      = false
  }

  group "web" {
    count = 3
    task "server" { ... }
  }
}
```

### 14.2 Server scheduler_config

```hcl
server {
  scheduler_config {
    scheduler_algorithm     = "binpack"   # binpack | spread
    preemption_config {
      system_scheduler_enabled  = true
      sysbatch_scheduler_enabled = true
      batch_scheduler_enabled   = false
      service_scheduler_enabled = false
    }
    rejection_reasons  = true
  }
}
```

通过 `State.SchedulerConfig()` 暴露给调度器：

- `scheduler_algorithm`：默认评分算法
- `preemption_config`：各调度器类型是否允许抢占
- `rejection_reasons`：是否在 AllocMetric 中记录详细拒绝原因
- `node_limit_for_feasibility_checks`：当有 affinity/spread 时的最大评估节点数（默认 100）

### 14.3 Worker 配置

```hcl
server {
  enabled_schedulers = ["service", "batch", "system", "sysbatch"]
  num_workers        = 3
}
```

- `enabled_schedulers`：该 server 启用的调度器类型
- `num_workers`：Worker goroutine 数量

---

## 15. 关键代码文件索引

### 15.1 调度器入口与类型

| 文件                                              | 作用                                         |
|---------------------------------------------------|----------------------------------------------|
| [scheduler/scheduler.go](file:///d:/claude/nomad/scheduler/scheduler.go) | 调度器注册表与 `NewScheduler` 入口          |
| [scheduler/structs/interfaces.go](file:///d:/claude/nomad/scheduler/structs/interfaces.go) | `Scheduler`/`State`/`Planner` 顶层接口      |
| [scheduler/generic_sched.go](file:///d:/claude/nomad/scheduler/generic_sched.go) | service/batch 调度器实现                    |
| [scheduler/scheduler_system.go](file:///d:/claude/nomad/scheduler/scheduler_system.go) | system 调度器实现                            |
| [scheduler/scheduler_sysbatch.go](file:///d:/claude/nomad/scheduler/scheduler_sysbatch.go) | sysbatch 调度器实现                          |
| [scheduler/util.go](file:///d:/claude/nomad/scheduler/util.go) | 公共工具：taintedNodes、retryMax、progressMade 等 |
| [scheduler/annotate.go](file:///d:/claude/nomad/scheduler/annotate.go) | PlanAnnotations 计算                         |

### 15.2 可行性与评分

| 文件                                              | 作用                                         |
|---------------------------------------------------|----------------------------------------------|
| [scheduler/feasible/stack.go](file:///d:/claude/nomad/scheduler/feasible/stack.go) | Stack 接口、GenericStack、SystemStack        |
| [scheduler/feasible/feasible.go](file:///d:/claude/nomad/scheduler/feasible/feasible.go) | FeasibleIterator/FeasibilityChecker 接口与过滤原因 |
| [scheduler/feasible/rank.go](file:///d:/claude/nomad/scheduler/feasible/rank.go) | RankedNode、RankIterator、FeasibleRankIterator |
| [scheduler/feasible/spread.go](file:///d:/claude/nomad/scheduler/feasible/spread.go) | SpreadIterator 分散评分                      |
| [scheduler/feasible/preemption.go](file:///d:/claude/nomad/scheduler/feasible/preemption.go) | 抢占算法                                     |
| [scheduler/feasible/select.go](file:///d:/claude/nomad/scheduler/feasible/select.go) | MaxScoreIterator、LimitIterator              |
| [scheduler/feasible/context.go](file:///d:/claude/nomad/scheduler/feasible/context.go) | EvalContext：状态/Plan/eligibility 缓存      |
| [scheduler/feasible/device.go](file:///d:/claude/nomad/scheduler/feasible/device.go) | DeviceChecker：GPU/FPGA 等设备               |
| [scheduler/feasible/propertyset.go](file:///d:/claude/nomad/scheduler/feasible/propertyset.go) | spread 用的属性集合                          |
| [scheduler/feasible/numa_ce.go](file:///d:/claude/nomad/scheduler/feasible/numa_ce.go) | NUMA 亲和（CE 版）                           |

### 15.3 协调器

| 文件                                              | 作用                                         |
|---------------------------------------------------|----------------------------------------------|
| [scheduler/reconciler/reconcile_cluster.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go) | AllocReconciler（service/batch）             |
| [scheduler/reconciler/reconcile_node.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go) | NodeReconciler（system/sysbatch）            |
| [scheduler/reconciler/allocs.go](file:///d:/claude/nomad/scheduler/reconciler/allocs.go) | 结果类型定义                                 |
| [scheduler/reconciler/filters.go](file:///d:/claude/nomad/scheduler/reconciler/filters.go) | alloc 过滤器（按版本/状态/节点）             |
| [scheduler/reconciler/reconnecting_picker.go](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go) | 客户端重连 alloc 恢复策略                    |

### 15.4 Server 侧驱动

| 文件                                              | 作用                                         |
|---------------------------------------------------|----------------------------------------------|
| [nomad/worker.go](file:///d:/claude/nomad/nomad/worker.go) | Worker：dequeue eval、invoke scheduler、SubmitPlan |
| [nomad/eval_broker.go](file:///d:/claude/nomad/nomad/eval_broker.go) | EvalBroker：评估队列（ready/blocked）        |
| [nomad/plan_apply.go](file:///d:/claude/nomad/nomad/plan_apply.go) | Leader 端 Plan 处理与冲突检测                |
| [nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go) | Leader 启动 EvalBroker、Worker 等            |

### 15.5 数据结构

| 文件                                              | 作用                                         |
|---------------------------------------------------|----------------------------------------------|
| [nomad/structs/eval.go](file:///d:/claude/nomad/nomad/structs/eval.go) | Evaluation 数据结构与触发原因常量            |
| [nomad/structs/plan.go](file:///d:/claude/nomad/nomad/structs/plan.go) | Plan / PlanResult / PlanAnnotations          |
| [nomad/structs/deployment.go](file:///d:/claude/nomad/nomad/structs/deployment.go) | Deployment 与 DeploymentStatus               |
| [nomad/structs/allocation.go](file:///d:/claude/nomad/nomad/structs/allocation.go) | Allocation 数据结构                          |
| [nomad/structs/job.go](file:///d:/claude/nomad/nomad/structs/job.go) | Job/TaskGroup/Task 与 Update/Migrate/Reschedule Policy |

---

## 附录 A：典型调用链

### A.1 service job 注册到放置完成

```
1. POST /v1/jobs
   └─► Server.RegisterJob → Raft Apply → 创建 Eval(EvalTriggerJobRegister)

2. EvalBroker.Enqueue(eval)

3. Worker.dequeueEvaluation() 返回 eval

4. Worker.invokeScheduler()
   ├─► NewScheduler("service", ...)
   ├─► scheduler.Process(eval)
   │   ├─► retryMax(5, process, progress)
   │   │   ├─► state.JobByID
   │   │   ├─► state.LatestDeploymentByJobID
   │   │   ├─► eval.MakePlan
   │   │   ├─► feasible.NewEvalContext + NewGenericStack
   │   │   ├─► computeJobAllocs
   │   │   │   ├─► state.AllocsByJob
   │   │   │   ├─► taintedNodes
   │   │   │   ├─► reconciler.NewAllocReconciler
   │   │   │   ├─► r.Compute() → ReconcileResults
   │   │   │   ├─► 应用 Stop/InplaceUpdate 到 Plan
   │   │   │   └─► computePlacements
   │   │   │       ├─► setNodes (拉取并打乱)
   │   │   │       ├─► stack.SetNodes / SetJob
   │   │   │       └─► for each place:
   │   │   │           ├─► stack.Select(tg, opts)
   │   │   │           │   ├─► FeasibilityWrapper (约束/驱动/设备/网络/卷)
   │   │   │           │   ├─► BinPackIterator
   │   │   │           │   ├─► JobAntiAffinity
   │   │   │           │   ├─► NodeReschedulingPenalty
   │   │   │           │   ├─► NodeAffinity
   │   │   │           │   ├─► SpreadIterator
   │   │   │           │   ├─► ScoreNormalization
   │   │   │           │   ├─► LimitIterator (log2(N) 或 2 for batch)
   │   │   │           │   └─► MaxScoreIterator
   │   │   │           └─► plan.AppendAlloc(alloc, preemptedAllocs)
   │   │   └─► planner.SubmitPlan(plan)
   │   │       ├─► Worker.SubmitPlan → RPC → Leader.processPlan
   │   │       │   ├─► Raft snapshot
   │   │       │   ├─► 每节点冲突检测
   │   │       │   └─► 返回 PlanResult (FullCommit/Partial/Refresh)
   │   │       └─► 若 Partial/Refresh → progressMade → 重试
   │   └─► setStatus(EvalStatusComplete)
   └─► Worker.sendAck(eval, token)
```

### A.2 节点 drain 触发 reschedule

```
1. POST /v1/node/{id}/drain
   └─► Server.DrainNode → Raft Apply → 节点状态变 Draining
   └─► 创建受影响 job 的 Eval(EvalTriggerNodeDrain)

2-4. 同 A.1，Reconciler 检测到 tainted 节点：
   ├─► existing allocs on tainted node → Stop + DesiredFollowupEvals
   ├─► result.Place 增加新 alloc
   └─► stack.Select 排除 tainted 节点（FeasibilityWrapper 过滤）
```

---

## 附录 B：调度性能优化要点

1. **LimitIterator**：避免评估全集群节点，service 用 `log2(N)`，batch 用 2
2. **节点打乱**：`ShuffleNodes` 用 latest index 作为随机种子，保证可重现
3. **Eligibility 缓存**：`EvalContext.Eligibility()` 跨 task group 缓存节点-驱动可行性
4. **ProposedAllocs 缓存**：`RankedNode.Proposed` 缓存节点上待提交 alloc，避免重复计算
5. **ScoreNormalization**：归一化避免单一指标压倒其他
6. **Affinity/Spread 时放宽 limit**：保证统计意义
7. **retryMax 配合 progressMade**：避免无进展死循环
8. **BlockedEval**：资源不足时不阻塞 Worker，单独排队

---

## 附录 C：常见问题排查

| 现象                          | 可能原因                                                     | 排查方法                                                     |
|-------------------------------|--------------------------------------------------------------|--------------------------------------------------------------|
| alloc 一直 pending           | 资源不足；约束太严；驱动缺失                                 | 查看 `AllocMetric`；开启 `rejection_reasons`                 |
| eval 一直 blocked            | 节点全部 tainted；quota 超限                                 | `nomad eval status`；检查节点状态与 namespace quota          |
| 调度抖动（不停 reschedule）  | 节点不健康；task 启动失败                                    | 查看 `RescheduleEvent`；`NodeReschedulingPenalty` 是否生效   |
| 部署卡住不推进               | `healthy_deadline` 未到；`max_parallel` 太小；health check 失败 | `nomad deployment status`；查看 alloc health                 |
| canary 不 promote            | `auto_promote=false`；canary 未达 healthy                    | 手动 `nomad deployment promote`                              |
| 同节点多 alloc（本应分散）   | `spread`/`affinity` 配置缺失；`limit` 过小                   | 增加 `affinity`；调整 `node_limit_for_feasibility_checks`    |
| 抢占未发生                   | `preemption_config` 未开启；优先级差距不够                   | 检查 server config；提高 job priority                        |

---

文档完。
