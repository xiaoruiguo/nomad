# allocations.go 代码说明文档

> 文件路径：[api/allocations.go](file:///d:/claude/nomad/api/allocations.go)
> 总行数：666 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `allocations.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Allocations

**定义位置**：[L41](file:///d:/claude/nomad/api/allocations.go#L41)

**中文说明**：Allocations 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type Allocations struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（14 个）：`List`, `PrefixList`, `Info`, `Exec`, `Stats`, `Checks`, `GC`, `Restart`, `RestartAllTasks`, `Stop`, `Signal`, `SetPauseState`, `GetPauseState`, `Services`

### AllocStopResponse

**定义位置**：[L201](file:///d:/claude/nomad/api/allocations.go#L201)

**中文说明**：AllocStopResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type AllocStopResponse struct {
	EvalID string
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalID` | `string` | 字符串 |
| `WriteMeta` | `WriteMeta` | — |

### Allocation

**定义位置**：[L254](file:///d:/claude/nomad/api/allocations.go#L254)

**中文说明**：Allocation 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type Allocation struct {
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
	TaskResources map[string]*Resources
	AllocatedResources *AllocatedResources
	Services map[string]string
	Metrics *AllocationMetric
	DesiredStatus string
	DesiredDescription string
	DesiredTransition DesiredTransition
	ClientStatus string
	ClientDescription string
	TaskStates map[string]*TaskState
	DeploymentID string
	DeploymentStatus *AllocDeploymentStatus
	FollowupEvalID string
	PreviousAllocation string
	NextAllocation string
	RescheduleTracker *RescheduleTracker
	NetworkStatus *AllocNetworkStatus
	PreemptedAllocations []string
	PreemptedByAllocation string
	CreateIndex uint64
	ModifyIndex uint64
	AllocModifyIndex uint64
	CreateTime int64
	ModifyTime int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Namespace` | `string` | 命名空间 |
| `EvalID` | `string` | 字符串 |
| `Name` | `string` | 名称 |
| `NodeID` | `string` | 字符串 |
| `NodeName` | `string` | 字符串 |
| `JobID` | `string` | 字符串 |
| `Job` | `*Job` | — |
| `TaskGroup` | `string` | 字符串 |
| `Resources` | `*Resources` | — |
| `TaskResources` | `map[string]*Resources` | 映射表 |
| `AllocatedResources` | `*AllocatedResources` | — |
| `Services` | `map[string]string` | 映射表 |
| `Metrics` | `*AllocationMetric` | — |
| `DesiredStatus` | `string` | 字符串 |
| `DesiredDescription` | `string` | 字符串 |
| `DesiredTransition` | `DesiredTransition` | — |
| `ClientStatus` | `string` | 字符串 |
| `ClientDescription` | `string` | 字符串 |
| `TaskStates` | `map[string]*TaskState` | 映射表 |
| `DeploymentID` | `string` | 字符串 |
| `DeploymentStatus` | `*AllocDeploymentStatus` | — |
| `FollowupEvalID` | `string` | 字符串 |
| `PreviousAllocation` | `string` | 字符串 |
| `NextAllocation` | `string` | 字符串 |
| `RescheduleTracker` | `*RescheduleTracker` | — |
| `NetworkStatus` | `*AllocNetworkStatus` | — |
| `PreemptedAllocations` | `[]string` | 列表 |
| `PreemptedByAllocation` | `string` | 字符串 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `AllocModifyIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyTime` | `int64` | — |

**关联方法**（5 个）：`Stub`, `ServerTerminalStatus`, `ClientTerminalStatus`, `GetTaskGroup`, `RescheduleInfo`

### AllocationMetric

**定义位置**：[L292](file:///d:/claude/nomad/api/allocations.go#L292)

**中文说明**：AllocationMetric 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocationMetric struct {
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
	AllocationTime time.Duration
	CoalescedFailures int
	ScoreMetaData []*NodeScoreMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodesEvaluated` | `int` | — |
| `NodesFiltered` | `int` | — |
| `NodesInPool` | `int` | — |
| `NodePool` | `string` | 字符串 |
| `NodesAvailable` | `map[string]int` | 映射表 |
| `ClassFiltered` | `map[string]int` | 映射表 |
| `ConstraintFiltered` | `map[string]int` | 映射表 |
| `NodesExhausted` | `int` | — |
| `ClassExhausted` | `map[string]int` | 映射表 |
| `DimensionExhausted` | `map[string]int` | 映射表 |
| `QuotaExhausted` | `[]string` | 列表 |
| `ResourcesExhausted` | `map[string]*Resources` | 映射表 |
| `Scores` | `map[string]float64` | 映射表 |
| `AllocationTime` | `time.Duration` | 时间间隔 |
| `CoalescedFailures` | `int` | — |
| `ScoreMetaData` | `[]*NodeScoreMeta` | 列表 |

### NodeScoreMeta

**定义位置**：[L314](file:///d:/claude/nomad/api/allocations.go#L314)

**中文说明**：NodeScoreMeta 是一个元数据结构体，包含对象的附加元信息。

**类型**：struct

```go
type NodeScoreMeta struct {
	NodeID string
	Scores map[string]float64
	NormScore float64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 字符串 |
| `Scores` | `map[string]float64` | 映射表 |
| `NormScore` | `float64` | — |

### AllocationListStub

**定义位置**：[L380](file:///d:/claude/nomad/api/allocations.go#L380)

**中文说明**：AllocationListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type AllocationListStub struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `EvalID` | `string` | 字符串 |
| `Name` | `string` | 名称 |
| `Namespace` | `string` | 命名空间 |
| `NodeID` | `string` | 字符串 |
| `NodeName` | `string` | 字符串 |
| `JobID` | `string` | 字符串 |
| `JobType` | `string` | 字符串 |
| `JobVersion` | `uint64` | 无符号 64 位整数 |
| `TaskGroup` | `string` | 字符串 |
| `AllocatedResources` | `*AllocatedResources `json:",omitempty"`` | — |
| `DesiredStatus` | `string` | 字符串 |
| `DesiredDescription` | `string` | 字符串 |
| `ClientStatus` | `string` | 字符串 |
| `ClientDescription` | `string` | 字符串 |
| `TaskStates` | `map[string]*TaskState` | 映射表 |
| `DeploymentStatus` | `*AllocDeploymentStatus` | — |
| `FollowupEvalID` | `string` | 字符串 |
| `NextAllocation` | `string` | 字符串 |
| `RescheduleTracker` | `*RescheduleTracker` | — |
| `PreemptedAllocations` | `[]string` | 列表 |
| `PreemptedByAllocation` | `string` | 字符串 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyTime` | `int64` | — |

### AllocDeploymentStatus

**定义位置**：[L412](file:///d:/claude/nomad/api/allocations.go#L412)

**中文说明**：AllocDeploymentStatus 是一个状态结构体，描述对象或操作的当前状态。

**类型**：struct

```go
type AllocDeploymentStatus struct {
	Healthy *bool
	Timestamp time.Time
	Canary bool
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Healthy` | `*bool` | 是否健康 |
| `Timestamp` | `time.Time` | 时间戳 |
| `Canary` | `bool` | 布尔值 |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### AllocNetworkStatus

**定义位置**：[L422](file:///d:/claude/nomad/api/allocations.go#L422)

**中文说明**：AllocNetworkStatus 是一个状态结构体，描述对象或操作的当前状态。

**类型**：struct

```go
type AllocNetworkStatus struct {
	InterfaceName string
	Address string
	AddressIPv6 string
	DNS *DNSConfig
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `InterfaceName` | `string` | 字符串 |
| `Address` | `string` | 地址 |
| `AddressIPv6` | `string` | 字符串 |
| `DNS` | `*DNSConfig` | — |

### AllocatedResources

**定义位置**：[L429](file:///d:/claude/nomad/api/allocations.go#L429)

**中文说明**：AllocatedResources 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocatedResources struct {
	Tasks map[string]*AllocatedTaskResources
	Shared AllocatedSharedResources
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Tasks` | `map[string]*AllocatedTaskResources` | 映射表 |
| `Shared` | `AllocatedSharedResources` | — |

### AllocatedTaskResources

**定义位置**：[L434](file:///d:/claude/nomad/api/allocations.go#L434)

**中文说明**：AllocatedTaskResources 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocatedTaskResources struct {
	Cpu AllocatedCpuResources
	Memory AllocatedMemoryResources
	Networks []*NetworkResource
	Devices []*AllocatedDeviceResource
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Cpu` | `AllocatedCpuResources` | — |
| `Memory` | `AllocatedMemoryResources` | — |
| `Networks` | `[]*NetworkResource` | 列表 |
| `Devices` | `[]*AllocatedDeviceResource` | 列表 |

### AllocatedSharedResources

**定义位置**：[L441](file:///d:/claude/nomad/api/allocations.go#L441)

**中文说明**：AllocatedSharedResources 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocatedSharedResources struct {
	DiskMB int64
	Networks []*NetworkResource
	Ports []PortMapping
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DiskMB` | `int64` | — |
| `Networks` | `[]*NetworkResource` | 列表 |
| `Ports` | `[]PortMapping` | 列表 |

### PortMapping

**定义位置**：[L447](file:///d:/claude/nomad/api/allocations.go#L447)

**中文说明**：PortMapping 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type PortMapping struct {
	Label string
	Value int
	To int
	HostIP string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Label` | `string` | 字符串 |
| `Value` | `int` | 值 |
| `To` | `int` | — |
| `HostIP` | `string` | 字符串 |

### AllocatedCpuResources

**定义位置**：[L454](file:///d:/claude/nomad/api/allocations.go#L454)

**中文说明**：AllocatedCpuResources 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocatedCpuResources struct {
	CpuShares int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CpuShares` | `int64` | — |

### AllocatedMemoryResources

**定义位置**：[L458](file:///d:/claude/nomad/api/allocations.go#L458)

**中文说明**：AllocatedMemoryResources 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocatedMemoryResources struct {
	MemoryMB int64
	MemoryMaxMB int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MemoryMB` | `int64` | — |
| `MemoryMaxMB` | `int64` | — |

### AllocatedDeviceResource

**定义位置**：[L463](file:///d:/claude/nomad/api/allocations.go#L463)

**中文说明**：AllocatedDeviceResource 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocatedDeviceResource struct {
	Vendor string
	Type string
	Name string
	DeviceIDs []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Vendor` | `string` | 字符串 |
| `Type` | `string` | 类型 |
| `Name` | `string` | 名称 |
| `DeviceIDs` | `[]string` | 列表 |

### AllocIndexSort

**定义位置**：[L471](file:///d:/claude/nomad/api/allocations.go#L471)

**中文说明**：AllocIndexSort 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型定义**：`type AllocIndexSort []*AllocationListStub`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### AllocationRestartRequest

**定义位置**：[L519](file:///d:/claude/nomad/api/allocations.go#L519)

**中文说明**：AllocationRestartRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocationRestartRequest struct {
	TaskName string
	AllTasks bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TaskName` | `string` | 字符串 |
| `AllTasks` | `bool` | 布尔值 |

### AllocSignalRequest

**定义位置**：[L524](file:///d:/claude/nomad/api/allocations.go#L524)

**中文说明**：AllocSignalRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocSignalRequest struct {
	Task string
	Signal string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Task` | `string` | 字符串 |
| `Signal` | `string` | 字符串 |

### AllocPauseRequest

**定义位置**：[L529](file:///d:/claude/nomad/api/allocations.go#L529)

**中文说明**：AllocPauseRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocPauseRequest struct {
	Task string
	ScheduleState string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Task` | `string` | 字符串 |
| `ScheduleState` | `string` | 字符串 |

### AllocGetPauseResponse

**定义位置**：[L536](file:///d:/claude/nomad/api/allocations.go#L536)

**中文说明**：AllocGetPauseResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type AllocGetPauseResponse struct {
	ScheduleState string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ScheduleState` | `string` | 字符串 |

### GenericResponse

**定义位置**：[L546](file:///d:/claude/nomad/api/allocations.go#L546)

**中文说明**：GenericResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type GenericResponse struct {
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WriteMeta` | `WriteMeta` | — |

### RescheduleTracker

**定义位置**：[L551](file:///d:/claude/nomad/api/allocations.go#L551)

**中文说明**：RescheduleTracker 是一个跟踪器，记录和跟踪特定对象的状态信息。

**类型**：struct

```go
type RescheduleTracker struct {
	Events []*RescheduleEvent
	LastReschedule string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Events` | `[]*RescheduleEvent` | 列表 |
| `LastReschedule` | `string` | 字符串 |

### RescheduleEvent

**定义位置**：[L557](file:///d:/claude/nomad/api/allocations.go#L557)

**中文说明**：RescheduleEvent 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type RescheduleEvent struct {
	RescheduleTime int64
	PrevAllocID string
	PrevNodeID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `RescheduleTime` | `int64` | — |
| `PrevAllocID` | `string` | 字符串 |
| `PrevNodeID` | `string` | 字符串 |

### DesiredTransition

**定义位置**：[L571](file:///d:/claude/nomad/api/allocations.go#L571)

**中文说明**：DesiredTransition 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type DesiredTransition struct {
	Migrate *bool
	Reschedule *bool
	ForceReschedule *bool
	NoShutdownDelay *bool
	MigrateDisablePlacement *bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Migrate` | `*bool` | 布尔值 |
| `Reschedule` | `*bool` | 布尔值 |
| `ForceReschedule` | `*bool` | 布尔值 |
| `NoShutdownDelay` | `*bool` | 布尔值 |
| `MigrateDisablePlacement` | `*bool` | 布尔值 |

**关联方法**（5 个）：`ShouldMigrate`, `ShouldReschedule`, `ShouldIgnoreShutdownDelay`, `ShouldForceReschedule`, `ShouldDisableMigrationPlacement`

### ExecStreamingIOOperation

**定义位置**：[L620](file:///d:/claude/nomad/api/allocations.go#L620)

**中文说明**：ExecStreamingIOOperation 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ExecStreamingIOOperation struct {
	Data []byte `json:"data,omitempty"`
	Close bool `json:"close,omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Data` | `[]byte `json:"data,omitempty"`` | 数据 |
| `Close` | `bool `json:"close,omitempty"`` | 布尔值 |

### TerminalSize

**定义位置**：[L626](file:///d:/claude/nomad/api/allocations.go#L626)

**中文说明**：TerminalSize 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type TerminalSize struct {
	Height int `json:"height,omitempty"`
	Width int `json:"width,omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Height` | `int `json:"height,omitempty"`` | — |
| `Width` | `int `json:"width,omitempty"`` | — |

### ExecStreamingInput

**定义位置**：[L636](file:///d:/claude/nomad/api/allocations.go#L636)

**中文说明**：ExecStreamingInput 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ExecStreamingInput struct {
	Stdin *ExecStreamingIOOperation `json:"stdin,omitempty"`
	TTYSize *TerminalSize `json:"tty_size,omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Stdin` | `*ExecStreamingIOOperation `json:"stdin,omitempty"`` | — |
| `TTYSize` | `*TerminalSize `json:"tty_size,omitempty"`` | — |

### ExecStreamingExitResult

**定义位置**：[L642](file:///d:/claude/nomad/api/allocations.go#L642)

**中文说明**：ExecStreamingExitResult 是一个结果结构体，封装操作执行的结果。

**类型**：struct

```go
type ExecStreamingExitResult struct {
	ExitCode int `json:"exit_code"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExitCode` | `int `json:"exit_code"`` | — |

### ExecStreamingOutput

**定义位置**：[L650](file:///d:/claude/nomad/api/allocations.go#L650)

**中文说明**：ExecStreamingOutput 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ExecStreamingOutput struct {
	Stdout *ExecStreamingIOOperation `json:"stdout,omitempty"`
	Stderr *ExecStreamingIOOperation `json:"stderr,omitempty"`
	Exited bool `json:"exited,omitempty"`
	Result *ExecStreamingExitResult `json:"result,omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Stdout` | `*ExecStreamingIOOperation `json:"stdout,omitempty"`` | — |
| `Stderr` | `*ExecStreamingIOOperation `json:"stderr,omitempty"`` | — |
| `Exited` | `bool `json:"exited,omitempty"`` | 布尔值 |
| `Result` | `*ExecStreamingExitResult `json:"result,omitempty"`` | 结果 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `AllocDesiredStatusRun` | `—` | `"run"` | — |
| `AllocDesiredStatusStop` | `—` | `"stop"` | — |
| `AllocDesiredStatusEvict` | `—` | `"evict"` | — |
| `AllocClientStatusPending` | `—` | `"pending"` | — |
| `AllocClientStatusRunning` | `—` | `"running"` | — |
| `AllocClientStatusComplete` | `—` | `"complete"` | — |
| `AllocClientStatusFailed` | `—` | `"failed"` | — |
| `AllocClientStatusLost` | `—` | `"lost"` | — |
| `AllocClientStatusUnknown` | `—` | `"unknown"` | — |
| `AllocRestartReasonWithinPolicy` | `—` | `"Restart within policy"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `NodeDownErr` | `—` | `errors.New("node down")` | — |
| `execStreamingInputHeartbeat` | `—` | `ExecStreamingInput{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Allocations` | `c *Client` | `` | `*Allocations` | [L46](file:///d:/claude/nomad/api/allocations.go#L46) |
| `List` | `a *Allocations` | `q *QueryOptions` | `[]*AllocationListStub, *QueryMeta, error` | [L51](file:///d:/claude/nomad/api/allocations.go#L51) |
| `PrefixList` | `a *Allocations` | `prefix string` | `[]*AllocationListStub, *QueryMeta, error` | [L61](file:///d:/claude/nomad/api/allocations.go#L61) |
| `Info` | `a *Allocations` | `allocID string, q *QueryOptions` | `*Allocation, *QueryMeta, error` | [L66](file:///d:/claude/nomad/api/allocations.go#L66) |
| `Exec` | `a *Allocations` | `ctx context.Context, alloc *Allocation, task string, tty bool, command []stri...` | `exitCode int, err error` | [L92](file:///d:/claude/nomad/api/allocations.go#L92) |
| `Stats` | `a *Allocations` | `alloc *Allocation, q *QueryOptions` | `*AllocResourceUsage, error` | [L120](file:///d:/claude/nomad/api/allocations.go#L120) |
| `Checks` | `a *Allocations` | `allocID string, q *QueryOptions` | `AllocCheckStatuses, error` | [L131](file:///d:/claude/nomad/api/allocations.go#L131) |
| `GC` | `a *Allocations` | `alloc *Allocation, q *QueryOptions` | `error` | [L142](file:///d:/claude/nomad/api/allocations.go#L142) |
| `Restart` | `a *Allocations` | `alloc *Allocation, taskName string, q *QueryOptions` | `error` | [L155](file:///d:/claude/nomad/api/allocations.go#L155) |
| `RestartAllTasks` | `a *Allocations` | `alloc *Allocation, q *QueryOptions` | `error` | [L173](file:///d:/claude/nomad/api/allocations.go#L173) |
| `Stop` | `a *Allocations` | `alloc *Allocation, q *QueryOptions` | `*AllocStopResponse, error` | [L188](file:///d:/claude/nomad/api/allocations.go#L188) |
| `Signal` | `a *Allocations` | `alloc *Allocation, q *QueryOptions, task string, signal string` | `error` | [L213](file:///d:/claude/nomad/api/allocations.go#L213) |
| `SetPauseState` | `a *Allocations` | `alloc *Allocation, q *QueryOptions, task string, state string` | `error` | [L225](file:///d:/claude/nomad/api/allocations.go#L225) |
| `GetPauseState` | `a *Allocations` | `alloc *Allocation, q *QueryOptions, task string` | `string, *QueryMeta, error` | [L238](file:///d:/claude/nomad/api/allocations.go#L238) |
| `Services` | `a *Allocations` | `allocID string, q *QueryOptions` | `[]*ServiceRegistration, *QueryMeta, error` | [L247](file:///d:/claude/nomad/api/allocations.go#L247) |
| `Stub` | `a *Allocation` | `` | `*AllocationListStub` | [L321](file:///d:/claude/nomad/api/allocations.go#L321) |
| `ServerTerminalStatus` | `a *Allocation` | `` | `bool` | [L358](file:///d:/claude/nomad/api/allocations.go#L358) |
| `ClientTerminalStatus` | `a *Allocation` | `` | `bool` | [L369](file:///d:/claude/nomad/api/allocations.go#L369) |
| `Len` | `a *AllocIndexSort` | `` | `int` | [L473](file:///d:/claude/nomad/api/allocations.go#L473) |
| `Less` | `a *AllocIndexSort` | `i int, j int` | `bool` | [L477](file:///d:/claude/nomad/api/allocations.go#L477) |
| `Swap` | `a *AllocIndexSort` | `i int, j int` | `` | [L481](file:///d:/claude/nomad/api/allocations.go#L481) |
| `GetTaskGroup` | `a *Allocation` | `` | `*TaskGroup` | [L485](file:///d:/claude/nomad/api/allocations.go#L485) |
| `RescheduleInfo` | `a *Allocation` | `t time.Time` | `int, int` | [L496](file:///d:/claude/nomad/api/allocations.go#L496) |
| `ShouldMigrate` | `d *DesiredTransition` | `` | `bool` | [L594](file:///d:/claude/nomad/api/allocations.go#L594) |
| `ShouldReschedule` | `d *DesiredTransition` | `` | `bool` | [L599](file:///d:/claude/nomad/api/allocations.go#L599) |
| `ShouldIgnoreShutdownDelay` | `d *DesiredTransition` | `` | `bool` | [L605](file:///d:/claude/nomad/api/allocations.go#L605) |
| `ShouldForceReschedule` | `d *DesiredTransition` | `` | `bool` | [L610](file:///d:/claude/nomad/api/allocations.go#L610) |
| `ShouldDisableMigrationPlacement` | `d *DesiredTransition` | `` | `bool` | [L615](file:///d:/claude/nomad/api/allocations.go#L615) |
| `AllocSuffix` | - | `name string` | `string` | [L658](file:///d:/claude/nomad/api/allocations.go#L658) |

## 5. 核心方法详解

### List()

**签名**：`func (a *Allocations) List(q *QueryOptions) []*AllocationListStub, *QueryMeta, error`

**位置**：[L51](file:///d:/claude/nomad/api/allocations.go#L51)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*AllocationListStub` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Info()

**签名**：`func (a *Allocations) Info(allocID string, q *QueryOptions) *Allocation, *QueryMeta, error`

**位置**：[L66](file:///d:/claude/nomad/api/allocations.go#L66)

**中文说明**：返回对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `allocID` | `string` | 字符串 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Allocation` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Stats()

**签名**：`func (a *Allocations) Stats(alloc *Allocation, q *QueryOptions) *AllocResourceUsage, error`

**位置**：[L120](file:///d:/claude/nomad/api/allocations.go#L120)

**中文说明**：返回对象的统计信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `alloc` | `*Allocation` | — |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*AllocResourceUsage` | — |
| `error` | 错误信息 |

### Stop()

**签名**：`func (a *Allocations) Stop(alloc *Allocation, q *QueryOptions) *AllocStopResponse, error`

**位置**：[L188](file:///d:/claude/nomad/api/allocations.go#L188)

**中文说明**：停止对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `alloc` | `*Allocation` | — |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*AllocStopResponse` | — |
| `error` | 错误信息 |

### Signal()

**签名**：`func (a *Allocations) Signal(alloc *Allocation, q *QueryOptions, task string, signal string) error`

**位置**：[L213](file:///d:/claude/nomad/api/allocations.go#L213)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `alloc` | `*Allocation` | — |
| `q` | `*QueryOptions` | — |
| `task` | `string` | 字符串 |
| `signal` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `io` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [allocations_test.go](file:///d:/claude/nomad/api/allocations_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |
| [constraint.go](file:///d:/claude/nomad/api/constraint.go) | 同目录源文件 |

