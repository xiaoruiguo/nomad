# alloc.go 代码说明文档

> 文件路径：[structs/alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go)
> 总行数：1604 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### Allocation

**定义位置**：[L47](file:///d:/claude/nomad/nomad/structs/alloc.go#L47)

**类型**：struct

```go
	_struct bool `codec:",omitempty"`
	ID string
	Namespace string
	EvalID string
	Name string
	NodeID string
	NodeName string
	JobID string
	Job *Job
	TaskGroup string
	Resources *Resources
	SharedResources *Resources
	TaskResources map[string]*Resources
	AllocatedResources *AllocatedResources
	Metrics *AllocMetric
	DesiredStatus string
	DesiredDescription string
	DesiredTransition DesiredTransition
	ClientStatus string
	ClientDescription string
	TaskStates map[string]*TaskState
	AllocStates []*AllocState
	PreviousAllocation string
	NextAllocation string
	DeploymentID string
	DeploymentStatus *AllocDeploymentStatus
	RescheduleTracker *RescheduleTracker
	NetworkStatus *AllocNetworkStatus
	FollowupEvalID string
	PreemptedAllocations []string
	PreemptedByAllocation string
	SignedIdentities map[string]string `json:"-"`
	SigningKeyID string
	CreateIndex uint64
	ModifyIndex uint64
	AllocModifyIndex uint64
	CreateTime int64
	ModifyTime int64
```

**关联方法**（51 个）：`GetID`, `Sanitize`, `GetNamespace`, `GetCreateIndex`, `ReservedCores`, `ConsulNamespace`, `ConsulNamespaceForTask`, `JobNamespacedID`, `Index`, `Copy`, `CopySkipJob`, `Canonicalize`, `copyImpl`, `TerminalStatus`, `MaxRunDuration`, `MaxRunDurationDeadline`, `MaxRunDurationExpired`, `ServerTerminalStatus`, `ClientTerminalStatus`, `ShouldReschedule`, `RescheduleEligible`, `RescheduleInfo`, `LastEventTime`, `ReschedulePolicy`, `MigrateStrategy`, `NextRescheduleTime`, `nextRescheduleTime`, `NextRescheduleTimeByTime`, `ShouldClientStop`, `WaitClientStop`, `DisconnectTimeout`, `ReplaceOnDisconnect`, `NextDelay`, `Terminated`, `SetStop`, `AppendState`, `RanSuccessfully`, `ShouldMigrate`, `SetEventDisplayMessages`, `LookupTask`, `Stub`, `AllocationDiff`, `Expired`, `LastUnknown`, `NeedsToReconnect`, `FollowupEvalForReconnect`, `LastStartOfTask`, `HasAnyPausedTasks`, `LastRescheduleFailed`, `ServiceProviderNamespace`, `ServiceProviderNamespaceForTask`

### AllocationDiff

**定义位置**：[L946](file:///d:/claude/nomad/nomad/structs/alloc.go#L946)

**类型定义**：`Allocation`

### AllocListStub

**定义位置**：[L949](file:///d:/claude/nomad/nomad/structs/alloc.go#L949)

**类型**：struct

```go
	ID string
	EvalID string
	Name string
	Namespace string
	NodeID string
	NodeName string
	JobID string
	JobType string
	JobVersion uint64
	TaskGroup string
	AllocatedResources *AllocatedResources `json:",omitempty"`
	DesiredStatus string
	DesiredDescription string
	ClientStatus string
	ClientDescription string
	DesiredTransition DesiredTransition
	TaskStates map[string]*TaskState
	DeploymentStatus *AllocDeploymentStatus
	FollowupEvalID string
	NextAllocation string
	RescheduleTracker *RescheduleTracker
	PreemptedAllocations []string
	PreemptedByAllocation string
	CreateIndex uint64
	ModifyIndex uint64
	CreateTime int64
	ModifyTime int64
```

**关联方法**（3 个）：`SetEventDisplayMessages`, `RescheduleEligible`, `ClientTerminalStatus`

### AllocStubFields

**定义位置**：[L1006](file:///d:/claude/nomad/nomad/structs/alloc.go#L1006)

**类型**：struct

```go
	Resources bool
	TaskStates bool
```

### AllocMetric

**定义位置**：[L1026](file:///d:/claude/nomad/nomad/structs/alloc.go#L1026)

**类型**：struct

```go
	NodesEvaluated int
	NodesFiltered int
	NodesInPool int
	NodePool string
	NodesAvailable map[string]int
	ClassFiltered map[string]int
	ConstraintFiltered map[string]int
	NodesExhausted int
	ClassExhausted map[string]int
	DimensionExhausted map[string]int
	QuotaExhausted []string
	ResourcesExhausted map[string]*Resources
	Scores map[string]float64
	ScoreMetaData []*NodeScoreMeta
	nodeScoreMeta *NodeScoreMeta
	topScores *kheap.ScoreHeap
	AllocationTime time.Duration
	CoalescedFailures int
```

**关联方法**（9 个）：`Copy`, `EvaluateNode`, `FilterNode`, `ExhaustedNode`, `ExhaustQuota`, `ExhaustResources`, `ScoreNode`, `PopulateScoreMetaData`, `MaxNormScore`

### AllocServiceRegistrationsRequest

**定义位置**：[L1246](file:///d:/claude/nomad/nomad/structs/alloc.go#L1246)

**类型**：struct

```go
	AllocID string
	QueryOptions
```

### AllocServiceRegistrationsResponse

**定义位置**：[L1253](file:///d:/claude/nomad/nomad/structs/alloc.go#L1253)

**类型**：struct

```go
	Services []*ServiceRegistration
	QueryMeta
```

### AllocInfo

**定义位置**：[L1320](file:///d:/claude/nomad/nomad/structs/alloc.go#L1320)

**类型**：struct

```go
	AllocID string
	Group string
	Task string
	JobID string
	Namespace string
```

### AllocNetworkStatus

**定义位置**：[L1343](file:///d:/claude/nomad/nomad/structs/alloc.go#L1343)

**类型**：struct

```go
	InterfaceName string
	Address string
	AddressIPv6 string
	DNS *DNSConfig
```

**关联方法**（3 个）：`Copy`, `Equal`, `IsZero`

### NetworkStatus

**定义位置**：[L1401](file:///d:/claude/nomad/nomad/structs/alloc.go#L1401)

**类型**：interface

```go
	NetworkStatus
```

### AllocDeploymentStatus

**定义位置**：[L1408](file:///d:/claude/nomad/nomad/structs/alloc.go#L1408)

**类型**：struct

```go
	Healthy *bool
	Timestamp time.Time
	Canary bool
	ModifyIndex uint64
```

**关联方法**（6 个）：`HasHealth`, `IsHealthy`, `IsUnhealthy`, `IsCanary`, `Copy`, `Equal`

### DesiredTransition

**定义位置**：[L1496](file:///d:/claude/nomad/nomad/structs/alloc.go#L1496)

**类型**：struct

```go
	Migrate *bool
	Reschedule *bool
	ForceReschedule *bool
	NoShutdownDelay *bool
	MigrateDisablePlacement *bool
```

**关联方法**（6 个）：`Merge`, `ShouldMigrate`, `ShouldReschedule`, `ShouldForceReschedule`, `ShouldIgnoreShutdownDelay`, `ShouldDisableMigrationPlacement`

### AllocStateField

**定义位置**：[L1593](file:///d:/claude/nomad/nomad/structs/alloc.go#L1593)

**类型定义**：`uint8`

### AllocState

**定义位置**：[L1599](file:///d:/claude/nomad/nomad/structs/alloc.go#L1599)

**类型**：struct

```go
	Field AllocStateField
	Value string
	Time time.Time
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `AllocDesiredStatusRun` | `"run"` |
| `AllocDesiredStatusStop` | `"stop"` |
| `AllocDesiredStatusEvict` | `"evict"` |
| `AllocTimeoutReasonMaxRunDuration` | `"allocation exceeded max_run_duration"` |
| `AllocClientStatusPending` | `"pending"` |
| `AllocClientStatusRunning` | `"running"` |
| `AllocClientStatusComplete` | `"complete"` |
| `AllocClientStatusFailed` | `"failed"` |
| `AllocClientStatusLost` | `"lost"` |
| `AllocClientStatusUnknown` | `"unknown"` |
| `AllocServiceRegistrationsRPCMethod` | `"Alloc.GetServiceRegistrations"` |
| `AllocStateFieldClientStatus` | `iota` |

### 变量

| 名称 | 值 |
|------|----|
| `terminalAllocationStatuses` | `[]string{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GetID` | `a *Allocation` | - | `string` | [L182](file:///d:/claude/nomad/nomad/structs/alloc.go#L182) |
| `Sanitize` | `a *Allocation` | - | `*Allocation` | [L192](file:///d:/claude/nomad/nomad/structs/alloc.go#L192) |
| `GetNamespace` | `a *Allocation` | - | `string` | [L205](file:///d:/claude/nomad/nomad/structs/alloc.go#L205) |
| `GetCreateIndex` | `a *Allocation` | - | `uint64` | [L214](file:///d:/claude/nomad/nomad/structs/alloc.go#L214) |
| `ReservedCores` | `a *Allocation` | - | `*idset.Set[hw.CoreID]` | [L222](file:///d:/claude/nomad/nomad/structs/alloc.go#L222) |
| `ConsulNamespace` | `a *Allocation` | - | `string` | [L239](file:///d:/claude/nomad/nomad/structs/alloc.go#L239) |
| `ConsulNamespaceForTask` | `a *Allocation` | `taskName string` | `string` | [L243](file:///d:/claude/nomad/nomad/structs/alloc.go#L243) |
| `JobNamespacedID` | `a *Allocation` | - | `NamespacedID` | [L253](file:///d:/claude/nomad/nomad/structs/alloc.go#L253) |
| `Index` | `a *Allocation` | - | `uint` | [L259](file:///d:/claude/nomad/nomad/structs/alloc.go#L259) |
| `AllocIndexFromName` | - | `allocName string, jobID string, taskGroup string` | `uint` | [L265](file:///d:/claude/nomad/nomad/structs/alloc.go#L265) |
| `Copy` | `a *Allocation` | - | `*Allocation` | [L278](file:///d:/claude/nomad/nomad/structs/alloc.go#L278) |
| `CopySkipJob` | `a *Allocation` | - | `*Allocation` | [L283](file:///d:/claude/nomad/nomad/structs/alloc.go#L283) |
| `Canonicalize` | `a *Allocation` | - | - | [L291](file:///d:/claude/nomad/nomad/structs/alloc.go#L291) |
| `copyImpl` | `a *Allocation` | `job bool` | `*Allocation` | [L317](file:///d:/claude/nomad/nomad/structs/alloc.go#L317) |
| `TerminalStatus` | `a *Allocation` | - | `bool` | [L358](file:///d:/claude/nomad/nomad/structs/alloc.go#L358) |
| `MaxRunDuration` | `a *Allocation` | - | `time.Duration, bool` | [L366](file:///d:/claude/nomad/nomad/structs/alloc.go#L366) |
| `MaxRunDurationDeadline` | `a *Allocation` | - | `time.Time, bool` | [L388](file:///d:/claude/nomad/nomad/structs/alloc.go#L388) |
| `MaxRunDurationExpired` | `a *Allocation` | `now time.Time` | `bool` | [L407](file:///d:/claude/nomad/nomad/structs/alloc.go#L407) |
| `ServerTerminalStatus` | `a *Allocation` | - | `bool` | [L425](file:///d:/claude/nomad/nomad/structs/alloc.go#L425) |
| `ClientTerminalStatus` | `a *Allocation` | - | `bool` | [L435](file:///d:/claude/nomad/nomad/structs/alloc.go#L435) |
| `ShouldReschedule` | `a *Allocation` | `reschedulePolicy *ReschedulePolicy, failTime time.Time` | `bool` | [L441](file:///d:/claude/nomad/nomad/structs/alloc.go#L441) |
| `RescheduleEligible` | `a *Allocation` | `reschedulePolicy *ReschedulePolicy, failTime time.Time` | `bool` | [L458](file:///d:/claude/nomad/nomad/structs/alloc.go#L458) |
| `RescheduleInfo` | `a *Allocation` | - | `int, int` | [L462](file:///d:/claude/nomad/nomad/structs/alloc.go#L462) |
| `LastEventTime` | `a *Allocation` | - | `time.Time` | [L469](file:///d:/claude/nomad/nomad/structs/alloc.go#L469) |
| `ReschedulePolicy` | `a *Allocation` | - | `*ReschedulePolicy` | [L486](file:///d:/claude/nomad/nomad/structs/alloc.go#L486) |
| `MigrateStrategy` | `a *Allocation` | - | `*MigrateStrategy` | [L495](file:///d:/claude/nomad/nomad/structs/alloc.go#L495) |
| `NextRescheduleTime` | `a *Allocation` | - | `time.Time, bool` | [L505](file:///d:/claude/nomad/nomad/structs/alloc.go#L505) |
| `nextRescheduleTime` | `a *Allocation` | `failTime time.Time, reschedulePolicy *ReschedulePolicy` | `time.Time, bool` | [L524](file:///d:/claude/nomad/nomad/structs/alloc.go#L524) |
| `NextRescheduleTimeByTime` | `a *Allocation` | `t time.Time` | `time.Time, bool` | [L540](file:///d:/claude/nomad/nomad/structs/alloc.go#L540) |
| `ShouldClientStop` | `a *Allocation` | - | `bool` | [L550](file:///d:/claude/nomad/nomad/structs/alloc.go#L550) |
| `WaitClientStop` | `a *Allocation` | - | `time.Time` | [L564](file:///d:/claude/nomad/nomad/structs/alloc.go#L564) |
| `DisconnectTimeout` | `a *Allocation` | `now time.Time` | `time.Time` | [L596](file:///d:/claude/nomad/nomad/structs/alloc.go#L596) |
| `ReplaceOnDisconnect` | `a *Allocation` | - | `bool` | [L613](file:///d:/claude/nomad/nomad/structs/alloc.go#L613) |
| `NextDelay` | `a *Allocation` | - | `time.Duration` | [L626](file:///d:/claude/nomad/nomad/structs/alloc.go#L626) |
| `Terminated` | `a *Allocation` | - | `bool` | [L671](file:///d:/claude/nomad/nomad/structs/alloc.go#L671) |
| `SetStop` | `a *Allocation` | `clientStatus string, clientDesc string` | - | [L681](file:///d:/claude/nomad/nomad/structs/alloc.go#L681) |
| `AppendState` | `a *Allocation` | `field AllocStateField, value string` | - | [L690](file:///d:/claude/nomad/nomad/structs/alloc.go#L690) |
| `RanSuccessfully` | `a *Allocation` | - | `bool` | [L705](file:///d:/claude/nomad/nomad/structs/alloc.go#L705) |
| `ShouldMigrate` | `a *Allocation` | - | `bool` | [L721](file:///d:/claude/nomad/nomad/structs/alloc.go#L721) |
| `SetEventDisplayMessages` | `a *Allocation` | - | - | [L745](file:///d:/claude/nomad/nomad/structs/alloc.go#L745) |
| `LookupTask` | `a *Allocation` | `name string` | `*Task` | [L751](file:///d:/claude/nomad/nomad/structs/alloc.go#L751) |
| `Stub` | `a *Allocation` | `fields *AllocStubFields` | `*AllocListStub` | [L765](file:///d:/claude/nomad/nomad/structs/alloc.go#L765) |
| `AllocationDiff` | `a *Allocation` | - | `*AllocationDiff` | [L811](file:///d:/claude/nomad/nomad/structs/alloc.go#L811) |
| `Expired` | `a *Allocation` | `now time.Time` | `bool` | [L817](file:///d:/claude/nomad/nomad/structs/alloc.go#L817) |
| `LastUnknown` | `a *Allocation` | - | `time.Time` | [L843](file:///d:/claude/nomad/nomad/structs/alloc.go#L843) |
| `NeedsToReconnect` | `a *Allocation` | - | `bool` | [L866](file:///d:/claude/nomad/nomad/structs/alloc.go#L866) |
| `FollowupEvalForReconnect` | `a *Allocation` | `clientUpdate *Allocation` | `string, bool` | [L887](file:///d:/claude/nomad/nomad/structs/alloc.go#L887) |
| `LastStartOfTask` | `a *Allocation` | `taskName string` | `time.Time` | [L903](file:///d:/claude/nomad/nomad/structs/alloc.go#L903) |
| `HasAnyPausedTasks` | `a *Allocation` | - | `bool` | [L918](file:///d:/claude/nomad/nomad/structs/alloc.go#L918) |
| `LastRescheduleFailed` | `a *Allocation` | - | `bool` | [L935](file:///d:/claude/nomad/nomad/structs/alloc.go#L935) |
| `SetEventDisplayMessages` | `a *AllocListStub` | - | - | [L982](file:///d:/claude/nomad/nomad/structs/alloc.go#L982) |
| `RescheduleEligible` | `a *AllocListStub` | `reschedulePolicy *ReschedulePolicy, failTime time.Time` | `bool` | [L988](file:///d:/claude/nomad/nomad/structs/alloc.go#L988) |
| `ClientTerminalStatus` | `a *AllocListStub` | - | `bool` | [L993](file:///d:/claude/nomad/nomad/structs/alloc.go#L993) |
| `setDisplayMsg` | - | `taskStates map[string]*TaskState` | - | [L997](file:///d:/claude/nomad/nomad/structs/alloc.go#L997) |
| `NewAllocStubFields` | - | - | `*AllocStubFields` | [L1015](file:///d:/claude/nomad/nomad/structs/alloc.go#L1015) |
| `Copy` | `a *AllocMetric` | - | `*AllocMetric` | [L1092](file:///d:/claude/nomad/nomad/structs/alloc.go#L1092) |
| `EvaluateNode` | `a *AllocMetric` | - | - | [L1109](file:///d:/claude/nomad/nomad/structs/alloc.go#L1109) |
| `FilterNode` | `a *AllocMetric` | `node *Node, constraint string` | - | [L1113](file:///d:/claude/nomad/nomad/structs/alloc.go#L1113) |
| `ExhaustedNode` | `a *AllocMetric` | `node *Node, dimension string` | - | [L1129](file:///d:/claude/nomad/nomad/structs/alloc.go#L1129) |
| `ExhaustQuota` | `a *AllocMetric` | `dimensions []string` | - | [L1145](file:///d:/claude/nomad/nomad/structs/alloc.go#L1145) |
| `ExhaustResources` | `a *AllocMetric` | `tg *TaskGroup` | - | [L1155](file:///d:/claude/nomad/nomad/structs/alloc.go#L1155) |
| `ScoreNode` | `a *AllocMetric` | `node *Node, name string, score float64` | - | [L1183](file:///d:/claude/nomad/nomad/structs/alloc.go#L1183) |
| `PopulateScoreMetaData` | `a *AllocMetric` | - | - | [L1212](file:///d:/claude/nomad/nomad/structs/alloc.go#L1212) |
| `MaxNormScore` | `a *AllocMetric` | - | `*NodeScoreMeta` | [L1228](file:///d:/claude/nomad/nomad/structs/alloc.go#L1228) |
| `ServiceProviderNamespace` | `a *Allocation` | - | `string` | [L1267](file:///d:/claude/nomad/nomad/structs/alloc.go#L1267) |
| `ServiceProviderNamespaceForTask` | `a *Allocation` | `taskName string` | `string` | [L1301](file:///d:/claude/nomad/nomad/structs/alloc.go#L1301) |
| `Copy` | `a *AllocNetworkStatus` | - | `*AllocNetworkStatus` | [L1350](file:///d:/claude/nomad/nomad/structs/alloc.go#L1350) |
| `Equal` | `a *AllocNetworkStatus` | `o *AllocNetworkStatus` | `bool` | [L1362](file:///d:/claude/nomad/nomad/structs/alloc.go#L1362) |
| `IsZero` | `a *AllocNetworkStatus` | - | `bool` | [L1386](file:///d:/claude/nomad/nomad/structs/alloc.go#L1386) |
| `HasHealth` | `a *AllocDeploymentStatus` | - | `bool` | [L1427](file:///d:/claude/nomad/nomad/structs/alloc.go#L1427) |
| `IsHealthy` | `a *AllocDeploymentStatus` | - | `bool` | [L1433](file:///d:/claude/nomad/nomad/structs/alloc.go#L1433) |
| `IsUnhealthy` | `a *AllocDeploymentStatus` | - | `bool` | [L1443](file:///d:/claude/nomad/nomad/structs/alloc.go#L1443) |
| `IsCanary` | `a *AllocDeploymentStatus` | - | `bool` | [L1452](file:///d:/claude/nomad/nomad/structs/alloc.go#L1452) |
| `Copy` | `a *AllocDeploymentStatus` | - | `*AllocDeploymentStatus` | [L1460](file:///d:/claude/nomad/nomad/structs/alloc.go#L1460) |
| `Equal` | `a *AllocDeploymentStatus` | `o *AllocDeploymentStatus` | `bool` | [L1475](file:///d:/claude/nomad/nomad/structs/alloc.go#L1475) |
| `Merge` | `d *DesiredTransition` | `o *DesiredTransition` | - | [L1526](file:///d:/claude/nomad/nomad/structs/alloc.go#L1526) |
| `ShouldMigrate` | `d *DesiredTransition` | - | `bool` | [L1549](file:///d:/claude/nomad/nomad/structs/alloc.go#L1549) |
| `ShouldReschedule` | `d *DesiredTransition` | - | `bool` | [L1558](file:///d:/claude/nomad/nomad/structs/alloc.go#L1558) |
| `ShouldForceReschedule` | `d *DesiredTransition` | - | `bool` | [L1567](file:///d:/claude/nomad/nomad/structs/alloc.go#L1567) |
| `ShouldIgnoreShutdownDelay` | `d *DesiredTransition` | - | `bool` | [L1576](file:///d:/claude/nomad/nomad/structs/alloc.go#L1576) |
| `ShouldDisableMigrationPlacement` | `d *DesiredTransition` | - | `bool` | [L1585](file:///d:/claude/nomad/nomad/structs/alloc.go#L1585) |

## 5. 核心方法详解

### GetID()

**签名**：`func (a *Allocation) GetID() string`

**位置**：[L182](file:///d:/claude/nomad/nomad/structs/alloc.go#L182)

### GetNamespace()

**签名**：`func (a *Allocation) GetNamespace() string`

**位置**：[L205](file:///d:/claude/nomad/nomad/structs/alloc.go#L205)

### GetCreateIndex()

**签名**：`func (a *Allocation) GetCreateIndex() uint64`

**位置**：[L214](file:///d:/claude/nomad/nomad/structs/alloc.go#L214)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `container/heap` | 标准库 |
| `maps` | 标准库 |
| `slices` | 标准库 |
| `strconv` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/idset` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib/hw` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/lib/kheap` | 内部包 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [alloc_test.go](file:///d:/claude/nomad/nomad/structs/alloc_test.go) | 对应测试文件 |

