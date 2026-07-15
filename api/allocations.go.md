# allocations.go 代码说明文档

> 文件路径：[allocations.go](file:///d:/claude/nomad/api/allocations.go)
> 总行数：666 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **分配（Allocation）API 客户端**，提供分配查询、停止、信号、统计、GC 等操作的客户端方法。

## 2. 类型定义

### Allocations

**定义位置**：[L41](file:///d:/claude/nomad/api/allocations.go#L41)

**类型**：struct

```go
	client *Client
```

**关联方法**（14 个）：`List`, `PrefixList`, `Info`, `Exec`, `Stats`, `Checks`, `GC`, `Restart`, `RestartAllTasks`, `Stop`, `Signal`, `SetPauseState`, `GetPauseState`, `Services`

### AllocStopResponse

**定义位置**：[L201](file:///d:/claude/nomad/api/allocations.go#L201)

**类型**：struct

```go
	EvalID string
	WriteMeta
```

### Allocation

**定义位置**：[L254](file:///d:/claude/nomad/api/allocations.go#L254)

**类型**：struct

```go
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
```

**关联方法**（5 个）：`Stub`, `ServerTerminalStatus`, `ClientTerminalStatus`, `GetTaskGroup`, `RescheduleInfo`

### AllocationMetric

**定义位置**：[L292](file:///d:/claude/nomad/api/allocations.go#L292)

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
	AllocationTime time.Duration
	CoalescedFailures int
	ScoreMetaData []*NodeScoreMeta
```

### NodeScoreMeta

**定义位置**：[L314](file:///d:/claude/nomad/api/allocations.go#L314)

**类型**：struct

```go
	NodeID string
	Scores map[string]float64
	NormScore float64
```

### AllocationListStub

**定义位置**：[L380](file:///d:/claude/nomad/api/allocations.go#L380)

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

### AllocDeploymentStatus

**定义位置**：[L412](file:///d:/claude/nomad/api/allocations.go#L412)

**类型**：struct

```go
	Healthy *bool
	Timestamp time.Time
	Canary bool
	ModifyIndex uint64
```

### AllocNetworkStatus

**定义位置**：[L422](file:///d:/claude/nomad/api/allocations.go#L422)

**类型**：struct

```go
	InterfaceName string
	Address string
	AddressIPv6 string
	DNS *DNSConfig
```

### AllocatedResources

**定义位置**：[L429](file:///d:/claude/nomad/api/allocations.go#L429)

**类型**：struct

```go
	Tasks map[string]*AllocatedTaskResources
	Shared AllocatedSharedResources
```

### AllocatedTaskResources

**定义位置**：[L434](file:///d:/claude/nomad/api/allocations.go#L434)

**类型**：struct

```go
	Cpu AllocatedCpuResources
	Memory AllocatedMemoryResources
	Networks []*NetworkResource
	Devices []*AllocatedDeviceResource
```

### AllocatedSharedResources

**定义位置**：[L441](file:///d:/claude/nomad/api/allocations.go#L441)

**类型**：struct

```go
	DiskMB int64
	Networks []*NetworkResource
	Ports []PortMapping
```

### PortMapping

**定义位置**：[L447](file:///d:/claude/nomad/api/allocations.go#L447)

**类型**：struct

```go
	Label string
	Value int
	To int
	HostIP string
```

### AllocatedCpuResources

**定义位置**：[L454](file:///d:/claude/nomad/api/allocations.go#L454)

**类型**：struct

```go
	CpuShares int64
```

### AllocatedMemoryResources

**定义位置**：[L458](file:///d:/claude/nomad/api/allocations.go#L458)

**类型**：struct

```go
	MemoryMB int64
	MemoryMaxMB int64
```

### AllocatedDeviceResource

**定义位置**：[L463](file:///d:/claude/nomad/api/allocations.go#L463)

**类型**：struct

```go
	Vendor string
	Type string
	Name string
	DeviceIDs []string
```

### AllocIndexSort

**定义位置**：[L471](file:///d:/claude/nomad/api/allocations.go#L471)

**类型定义**：`[]*AllocationListStub`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### AllocationRestartRequest

**定义位置**：[L519](file:///d:/claude/nomad/api/allocations.go#L519)

**类型**：struct

```go
	TaskName string
	AllTasks bool
```

### AllocSignalRequest

**定义位置**：[L524](file:///d:/claude/nomad/api/allocations.go#L524)

**类型**：struct

```go
	Task string
	Signal string
```

### AllocPauseRequest

**定义位置**：[L529](file:///d:/claude/nomad/api/allocations.go#L529)

**类型**：struct

```go
	Task string
	ScheduleState string
```

### AllocGetPauseResponse

**定义位置**：[L536](file:///d:/claude/nomad/api/allocations.go#L536)

**类型**：struct

```go
	ScheduleState string
```

### GenericResponse

**定义位置**：[L546](file:///d:/claude/nomad/api/allocations.go#L546)

**类型**：struct

```go
	WriteMeta
```

### RescheduleTracker

**定义位置**：[L551](file:///d:/claude/nomad/api/allocations.go#L551)

**类型**：struct

```go
	Events []*RescheduleEvent
	LastReschedule string
```

### RescheduleEvent

**定义位置**：[L557](file:///d:/claude/nomad/api/allocations.go#L557)

**类型**：struct

```go
	RescheduleTime int64
	PrevAllocID string
	PrevNodeID string
```

### DesiredTransition

**定义位置**：[L571](file:///d:/claude/nomad/api/allocations.go#L571)

**类型**：struct

```go
	Migrate *bool
	Reschedule *bool
	ForceReschedule *bool
	NoShutdownDelay *bool
	MigrateDisablePlacement *bool
```

**关联方法**（5 个）：`ShouldMigrate`, `ShouldReschedule`, `ShouldIgnoreShutdownDelay`, `ShouldForceReschedule`, `ShouldDisableMigrationPlacement`

### ExecStreamingIOOperation

**定义位置**：[L620](file:///d:/claude/nomad/api/allocations.go#L620)

**类型**：struct

```go
	Data []byte `json:"data,omitempty"`
	Close bool `json:"close,omitempty"`
```

### TerminalSize

**定义位置**：[L626](file:///d:/claude/nomad/api/allocations.go#L626)

**类型**：struct

```go
	Height int `json:"height,omitempty"`
	Width int `json:"width,omitempty"`
```

### ExecStreamingInput

**定义位置**：[L636](file:///d:/claude/nomad/api/allocations.go#L636)

**类型**：struct

```go
	Stdin *ExecStreamingIOOperation `json:"stdin,omitempty"`
	TTYSize *TerminalSize `json:"tty_size,omitempty"`
```

### ExecStreamingExitResult

**定义位置**：[L642](file:///d:/claude/nomad/api/allocations.go#L642)

**类型**：struct

```go
	ExitCode int `json:"exit_code"`
```

### ExecStreamingOutput

**定义位置**：[L650](file:///d:/claude/nomad/api/allocations.go#L650)

**类型**：struct

```go
	Stdout *ExecStreamingIOOperation `json:"stdout,omitempty"`
	Stderr *ExecStreamingIOOperation `json:"stderr,omitempty"`
	Exited bool `json:"exited,omitempty"`
	Result *ExecStreamingExitResult `json:"result,omitempty"`
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `AllocDesiredStatusRun` | `"run"` |
| `AllocDesiredStatusStop` | `"stop"` |
| `AllocDesiredStatusEvict` | `"evict"` |
| `AllocClientStatusPending` | `"pending"` |
| `AllocClientStatusRunning` | `"running"` |
| `AllocClientStatusComplete` | `"complete"` |
| `AllocClientStatusFailed` | `"failed"` |
| `AllocClientStatusLost` | `"lost"` |
| `AllocClientStatusUnknown` | `"unknown"` |
| `AllocRestartReasonWithinPolicy` | `"Restart within policy"` |

### 变量

| 名称 | 值 |
|------|----|
| `NodeDownErr` | `*ast.CallExpr` |
| `execStreamingInputHeartbeat` | `*ast.CompositeLit` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Allocations` | `c *Client` | - | `*Allocations` | [L46](file:///d:/claude/nomad/api/allocations.go#L46) |
| `List` | `a *Allocations` | `q *QueryOptions` | `[]*AllocationListStub, *QueryMeta, error` | [L51](file:///d:/claude/nomad/api/allocations.go#L51) |
| `PrefixList` | `a *Allocations` | `prefix string` | `[]*AllocationListStub, *QueryMeta, error` | [L61](file:///d:/claude/nomad/api/allocations.go#L61) |
| `Info` | `a *Allocations` | `allocID string, q *QueryOptions` | `*Allocation, *QueryMeta, error` | [L66](file:///d:/claude/nomad/api/allocations.go#L66) |
| `Exec` | `a *Allocations` | `ctx context.Context, alloc *Allocation, task string, tty bool, command []str...` | `exitCode int, err error` | [L92](file:///d:/claude/nomad/api/allocations.go#L92) |
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
| `Stub` | `a *Allocation` | - | `*AllocationListStub` | [L321](file:///d:/claude/nomad/api/allocations.go#L321) |
| `ServerTerminalStatus` | `a *Allocation` | - | `bool` | [L358](file:///d:/claude/nomad/api/allocations.go#L358) |
| `ClientTerminalStatus` | `a *Allocation` | - | `bool` | [L369](file:///d:/claude/nomad/api/allocations.go#L369) |
| `Len` | `a *AllocIndexSort` | - | `int` | [L473](file:///d:/claude/nomad/api/allocations.go#L473) |
| `Less` | `a *AllocIndexSort` | `i int, j int` | `bool` | [L477](file:///d:/claude/nomad/api/allocations.go#L477) |
| `Swap` | `a *AllocIndexSort` | `i int, j int` | - | [L481](file:///d:/claude/nomad/api/allocations.go#L481) |
| `GetTaskGroup` | `a *Allocation` | - | `*TaskGroup` | [L485](file:///d:/claude/nomad/api/allocations.go#L485) |
| `RescheduleInfo` | `a *Allocation` | `t time.Time` | `int, int` | [L496](file:///d:/claude/nomad/api/allocations.go#L496) |
| `ShouldMigrate` | `d *DesiredTransition` | - | `bool` | [L594](file:///d:/claude/nomad/api/allocations.go#L594) |
| `ShouldReschedule` | `d *DesiredTransition` | - | `bool` | [L599](file:///d:/claude/nomad/api/allocations.go#L599) |
| `ShouldIgnoreShutdownDelay` | `d *DesiredTransition` | - | `bool` | [L605](file:///d:/claude/nomad/api/allocations.go#L605) |
| `ShouldForceReschedule` | `d *DesiredTransition` | - | `bool` | [L610](file:///d:/claude/nomad/api/allocations.go#L610) |
| `ShouldDisableMigrationPlacement` | `d *DesiredTransition` | - | `bool` | [L615](file:///d:/claude/nomad/api/allocations.go#L615) |
| `AllocSuffix` | - | `name string` | `string` | [L658](file:///d:/claude/nomad/api/allocations.go#L658) |

## 5. 核心方法详解

### Allocations()

**签名**：`func (c *Client) Allocations() *Allocations`

**位置**：[L46](file:///d:/claude/nomad/api/allocations.go#L46)

### List()

**签名**：`func (a *Allocations) List(q *QueryOptions) []*AllocationListStub, *QueryMeta, error`

**位置**：[L51](file:///d:/claude/nomad/api/allocations.go#L51)

### Info()

**签名**：`func (a *Allocations) Info(allocID string, q *QueryOptions) *Allocation, *QueryMeta, error`

**位置**：[L66](file:///d:/claude/nomad/api/allocations.go#L66)

### Restart()

**签名**：`func (a *Allocations) Restart(alloc *Allocation, taskName string, q *QueryOptions) error`

**位置**：[L155](file:///d:/claude/nomad/api/allocations.go#L155)

### Stop()

**签名**：`func (a *Allocations) Stop(alloc *Allocation, q *QueryOptions) *AllocStopResponse, error`

**位置**：[L188](file:///d:/claude/nomad/api/allocations.go#L188)

### Signal()

**签名**：`func (a *Allocations) Signal(alloc *Allocation, q *QueryOptions, task string, signal string) error`

**位置**：[L213](file:///d:/claude/nomad/api/allocations.go#L213)

### GetPauseState()

**签名**：`func (a *Allocations) GetPauseState(alloc *Allocation, q *QueryOptions, task string) string, *QueryMeta, error`

**位置**：[L238](file:///d:/claude/nomad/api/allocations.go#L238)

### GetTaskGroup()

**签名**：`func (a *Allocation) GetTaskGroup() *TaskGroup`

**位置**：[L485](file:///d:/claude/nomad/api/allocations.go#L485)

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

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [allocations_test.go](file:///d:/claude/nomad/api/allocations_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

