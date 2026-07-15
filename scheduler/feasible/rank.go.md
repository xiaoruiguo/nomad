# rank.go 代码说明文档

> 文件路径：[feasible/rank.go](file:///d:/claude/nomad/scheduler/feasible/rank.go)
> 总行数：1112 行
> 所属包：`feasible`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **可行性检查子包**（`scheduler/feasible`），实现调度器的可行性检查和评分迭代器栈。包含节点过滤（约束、驱动、设备、网络）、评分（装箱、分散、资源利用率）、抢占、排名等核心调度算法。是调度决策的核心引擎，采用迭代器链模式（Iterator Chain）实现可组合的调度管道。

## 2. 类型定义

### RankedNode

**定义位置**：[L29](file:///d:/claude/nomad/scheduler/feasible/rank.go#L29)

**类型**：struct

```go
	Node *structs.Node
	FinalScore float64
	Scores []float64
	TaskResources map[string]*structs.AllocatedTaskResources
	TaskLifecycles map[string]*structs.TaskLifecycleConfig
	AllocResources *structs.AllocatedSharedResources
	Proposed []*structs.Allocation
	PreemptedAllocs []*structs.Allocation
```

**关联方法**（3 个）：`GoString`, `ProposedAllocs`, `SetTaskResources`

### RankIterator

**定义位置**：[L78](file:///d:/claude/nomad/scheduler/feasible/rank.go#L78)

**类型**：interface

```go
	Next
	Reset
```

### FeasibleRankIterator

**定义位置**：[L89](file:///d:/claude/nomad/scheduler/feasible/rank.go#L89)

**类型**：struct

```go
	ctx Context
	source FeasibleIterator
```

**关联方法**（2 个）：`Next`, `Reset`

### StaticRankIterator

**定义位置**：[L121](file:///d:/claude/nomad/scheduler/feasible/rank.go#L121)

**类型**：struct

```go
	ctx Context
	nodes []*RankedNode
	offset int
	seen int
```

**关联方法**（2 个）：`Next`, `Reset`

### BinPackIterator

**定义位置**：[L161](file:///d:/claude/nomad/scheduler/feasible/rank.go#L161)

**类型**：struct

```go
	ctx Context
	source RankIterator
	evict bool
	priority int
	jobId structs.NamespacedID
	taskGroup *structs.TaskGroup
	memoryOversubscription bool
	scoreFit func(...)
```

**关联方法**（5 个）：`SetJob`, `SetTaskGroup`, `SetSchedulerConfiguration`, `Next`, `Reset`

### JobAntiAffinityIterator

**定义位置**：[L805](file:///d:/claude/nomad/scheduler/feasible/rank.go#L805)

**类型**：struct

```go
	ctx Context
	source RankIterator
	jobID string
	taskGroup string
	desiredCount int
```

**关联方法**（4 个）：`SetJob`, `SetTaskGroup`, `Next`, `Reset`

### NodeReschedulingPenaltyIterator

**定义位置**：[L875](file:///d:/claude/nomad/scheduler/feasible/rank.go#L875)

**类型**：struct

```go
	ctx Context
	source RankIterator
	penaltyNodes map[string]struct{...}
```

**关联方法**（3 个）：`SetPenaltyNodes`, `Next`, `Reset`

### NodeAffinityIterator

**定义位置**：[L919](file:///d:/claude/nomad/scheduler/feasible/rank.go#L919)

**类型**：struct

```go
	ctx Context
	source RankIterator
	jobAffinities []*structs.Affinity
	affinities []*structs.Affinity
```

**关联方法**（5 个）：`SetJob`, `SetTaskGroup`, `Reset`, `hasAffinities`, `Next`

### ScoreNormalizationIterator

**定义位置**：[L1007](file:///d:/claude/nomad/scheduler/feasible/rank.go#L1007)

**类型**：struct

```go
	ctx Context
	source RankIterator
```

**关联方法**（2 个）：`Reset`, `Next`

### PreemptionScoringIterator

**定义位置**：[L1042](file:///d:/claude/nomad/scheduler/feasible/rank.go#L1042)

**类型**：struct

```go
	ctx Context
	source RankIterator
```

**关联方法**（2 个）：`Reset`, `Next`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `binPackingMaxFitScore` | `18.0` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GoString` | `r *RankedNode` | - | `string` | [L46](file:///d:/claude/nomad/scheduler/feasible/rank.go#L46) |
| `ProposedAllocs` | `r *RankedNode` | `ctx Context` | `[]*structs.Allocation, error` | [L50](file:///d:/claude/nomad/scheduler/feasible/rank.go#L50) |
| `SetTaskResources` | `r *RankedNode` | `task *structs.Task, resource *structs.AllocatedTaskResources` | - | [L63](file:///d:/claude/nomad/scheduler/feasible/rank.go#L63) |
| `NewFeasibleRankIterator` | - | `ctx Context, source FeasibleIterator` | `*FeasibleRankIterator` | [L96](file:///d:/claude/nomad/scheduler/feasible/rank.go#L96) |
| `Next` | `iter *FeasibleRankIterator` | - | `*RankedNode` | [L104](file:///d:/claude/nomad/scheduler/feasible/rank.go#L104) |
| `Reset` | `iter *FeasibleRankIterator` | - | - | [L115](file:///d:/claude/nomad/scheduler/feasible/rank.go#L115) |
| `NewStaticRankIterator` | - | `ctx Context, nodes []*RankedNode` | `*StaticRankIterator` | [L129](file:///d:/claude/nomad/scheduler/feasible/rank.go#L129) |
| `Next` | `iter *StaticRankIterator` | - | `*RankedNode` | [L137](file:///d:/claude/nomad/scheduler/feasible/rank.go#L137) |
| `Reset` | `iter *StaticRankIterator` | - | - | [L155](file:///d:/claude/nomad/scheduler/feasible/rank.go#L155) |
| `NewBinPackIterator` | - | `ctx Context, source RankIterator, evict bool, priority int` | `*BinPackIterator` | [L174](file:///d:/claude/nomad/scheduler/feasible/rank.go#L174) |
| `SetJob` | `iter *BinPackIterator` | `job *structs.Job` | - | [L188](file:///d:/claude/nomad/scheduler/feasible/rank.go#L188) |
| `SetTaskGroup` | `iter *BinPackIterator` | `taskGroup *structs.TaskGroup` | - | [L193](file:///d:/claude/nomad/scheduler/feasible/rank.go#L193) |
| `SetSchedulerConfiguration` | `iter *BinPackIterator` | `schedConfig *structs.SchedulerConfiguration` | - | [L197](file:///d:/claude/nomad/scheduler/feasible/rank.go#L197) |
| `Next` | `iter *BinPackIterator` | - | `*RankedNode` | [L210](file:///d:/claude/nomad/scheduler/feasible/rank.go#L210) |
| `Reset` | `iter *BinPackIterator` | - | - | [L798](file:///d:/claude/nomad/scheduler/feasible/rank.go#L798) |
| `NewJobAntiAffinityIterator` | - | `ctx Context, source RankIterator, jobID string` | `*JobAntiAffinityIterator` | [L815](file:///d:/claude/nomad/scheduler/feasible/rank.go#L815) |
| `SetJob` | `iter *JobAntiAffinityIterator` | `job *structs.Job` | - | [L824](file:///d:/claude/nomad/scheduler/feasible/rank.go#L824) |
| `SetTaskGroup` | `iter *JobAntiAffinityIterator` | `tg *structs.TaskGroup` | - | [L828](file:///d:/claude/nomad/scheduler/feasible/rank.go#L828) |
| `Next` | `iter *JobAntiAffinityIterator` | - | `*RankedNode` | [L833](file:///d:/claude/nomad/scheduler/feasible/rank.go#L833) |
| `Reset` | `iter *JobAntiAffinityIterator` | - | - | [L868](file:///d:/claude/nomad/scheduler/feasible/rank.go#L868) |
| `NewNodeReschedulingPenaltyIterator` | - | `ctx Context, source RankIterator` | `*NodeReschedulingPenaltyIterator` | [L883](file:///d:/claude/nomad/scheduler/feasible/rank.go#L883) |
| `SetPenaltyNodes` | `iter *NodeReschedulingPenaltyIterator` | `penaltyNodes map[string]struct{...}` | - | [L891](file:///d:/claude/nomad/scheduler/feasible/rank.go#L891) |
| `Next` | `iter *NodeReschedulingPenaltyIterator` | - | `*RankedNode` | [L895](file:///d:/claude/nomad/scheduler/feasible/rank.go#L895) |
| `Reset` | `iter *NodeReschedulingPenaltyIterator` | - | - | [L912](file:///d:/claude/nomad/scheduler/feasible/rank.go#L912) |
| `NewNodeAffinityIterator` | - | `ctx Context, source RankIterator` | `*NodeAffinityIterator` | [L929](file:///d:/claude/nomad/scheduler/feasible/rank.go#L929) |
| `SetJob` | `iter *NodeAffinityIterator` | `job *structs.Job` | - | [L936](file:///d:/claude/nomad/scheduler/feasible/rank.go#L936) |
| `SetTaskGroup` | `iter *NodeAffinityIterator` | `tg *structs.TaskGroup` | - | [L940](file:///d:/claude/nomad/scheduler/feasible/rank.go#L940) |
| `Reset` | `iter *NodeAffinityIterator` | - | - | [L957](file:///d:/claude/nomad/scheduler/feasible/rank.go#L957) |
| `hasAffinities` | `iter *NodeAffinityIterator` | - | `bool` | [L963](file:///d:/claude/nomad/scheduler/feasible/rank.go#L963) |
| `Next` | `iter *NodeAffinityIterator` | - | `*RankedNode` | [L967](file:///d:/claude/nomad/scheduler/feasible/rank.go#L967) |
| `matchesAffinity` | - | `ctx Context, affinity *structs.Affinity, option *structs.Node` | `bool` | [L994](file:///d:/claude/nomad/scheduler/feasible/rank.go#L994) |
| `NewScoreNormalizationIterator` | - | `ctx Context, source RankIterator` | `*ScoreNormalizationIterator` | [L1014](file:///d:/claude/nomad/scheduler/feasible/rank.go#L1014) |
| `Reset` | `iter *ScoreNormalizationIterator` | - | - | [L1020](file:///d:/claude/nomad/scheduler/feasible/rank.go#L1020) |
| `Next` | `iter *ScoreNormalizationIterator` | - | `*RankedNode` | [L1024](file:///d:/claude/nomad/scheduler/feasible/rank.go#L1024) |
| `NewPreemptionScoringIterator` | - | `ctx Context, source RankIterator` | `RankIterator` | [L1049](file:///d:/claude/nomad/scheduler/feasible/rank.go#L1049) |
| `Reset` | `iter *PreemptionScoringIterator` | - | - | [L1056](file:///d:/claude/nomad/scheduler/feasible/rank.go#L1056) |
| `Next` | `iter *PreemptionScoringIterator` | - | `*RankedNode` | [L1060](file:///d:/claude/nomad/scheduler/feasible/rank.go#L1060) |
| `netPriority` | - | `allocs []*structs.Allocation` | `float64` | [L1078](file:///d:/claude/nomad/scheduler/feasible/rank.go#L1078) |
| `preemptionScore` | - | `netPriority float64` | `float64` | [L1101](file:///d:/claude/nomad/scheduler/feasible/rank.go#L1101) |

## 5. 核心方法详解

### NewFeasibleRankIterator()

**签名**：`func NewFeasibleRankIterator(ctx Context, source FeasibleIterator) *FeasibleRankIterator`

**位置**：[L96](file:///d:/claude/nomad/scheduler/feasible/rank.go#L96)

### Next()

**签名**：`func (iter *FeasibleRankIterator) Next() *RankedNode`

**位置**：[L104](file:///d:/claude/nomad/scheduler/feasible/rank.go#L104)

### Reset()

**签名**：`func (iter *FeasibleRankIterator) Reset() `

**位置**：[L115](file:///d:/claude/nomad/scheduler/feasible/rank.go#L115)

### NewStaticRankIterator()

**签名**：`func NewStaticRankIterator(ctx Context, nodes []*RankedNode) *StaticRankIterator`

**位置**：[L129](file:///d:/claude/nomad/scheduler/feasible/rank.go#L129)

### Next()

**签名**：`func (iter *StaticRankIterator) Next() *RankedNode`

**位置**：[L137](file:///d:/claude/nomad/scheduler/feasible/rank.go#L137)

### Reset()

**签名**：`func (iter *StaticRankIterator) Reset() `

**位置**：[L155](file:///d:/claude/nomad/scheduler/feasible/rank.go#L155)

### NewBinPackIterator()

**签名**：`func NewBinPackIterator(ctx Context, source RankIterator, evict bool, priority int) *BinPackIterator`

**位置**：[L174](file:///d:/claude/nomad/scheduler/feasible/rank.go#L174)

### Next()

**签名**：`func (iter *BinPackIterator) Next() *RankedNode`

**位置**：[L210](file:///d:/claude/nomad/scheduler/feasible/rank.go#L210)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `math` | 标准库 |
| `slices` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/idset` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib/hw` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/safemath` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **迭代器链模式**：实现迭代器接口，通过组合形成可配置的调度管道，每个迭代器负责一个调度阶段（过滤、评分、限制等）
- **抢占调度**：实现抢占逻辑，通过停止低优先级分配为高优先级作业释放资源
- **评分排名**：实现节点评分和排名算法，基于装箱、资源利用率、分散性等指标选择最优节点

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [rank_test.go](file:///d:/claude/nomad/scheduler/feasible/rank_test.go) | 对应测试文件 |

