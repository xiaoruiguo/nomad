# jobs.go 代码说明文档

> 文件路径：[api/jobs.go](file:///d:/claude/nomad/api/jobs.go)
> 总行数：1725 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `jobs.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Jobs

**定义位置**：[L68](file:///d:/claude/nomad/api/jobs.go#L68)

**中文说明**：Jobs 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type Jobs struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（38 个）：`ParseHCL`, `ParseHCLOpts`, `Validate`, `Register`, `EnforceRegister`, `RegisterOpts`, `List`, `ListOptions`, `PrefixList`, `Info`, `Scale`, `ScaleWithRequest`, `ScaleStatus`, `Versions`, `VersionByTag`, `VersionsOpts`, `Submission`, `Allocations`, `Deployments`, `LatestDeployment`, `Evaluations`, `Deregister`, `DeregisterOpts`, `ForceEvaluate`, `EvaluateWithOpts`, `PeriodicForce`, `Plan`, `PlanOpts`, `Summary`, `Dispatch`, `DispatchOpts`, `Revert`, `Stable`, `Services`, `ActionExec`, `TagVersionOpts`, `TagVersion`, `UntagVersion`

### JobsParseRequest

**定义位置**：[L73](file:///d:/claude/nomad/api/jobs.go#L73)

**中文说明**：JobsParseRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobsParseRequest struct {
	JobHCL string
	Variables string
	Canonicalize bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobHCL` | `string` | 字符串 |
| `Variables` | `string` | 字符串 |
| `Canonicalize` | `bool` | 布尔值 |

### RegisterOptions

**定义位置**：[L122](file:///d:/claude/nomad/api/jobs.go#L122)

**中文说明**：RegisterOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type RegisterOptions struct {
	EnforceIndex bool
	ModifyIndex uint64
	PolicyOverride bool
	PreserveCounts bool
	PreserveResources bool
	EvalPriority int
	Submission *JobSubmission
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EnforceIndex` | `bool` | 布尔值 |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `PolicyOverride` | `bool` | 布尔值 |
| `PreserveCounts` | `bool` | 布尔值 |
| `PreserveResources` | `bool` | 布尔值 |
| `EvalPriority` | `int` | — |
| `Submission` | `*JobSubmission` | — |

### JobListFields

**定义位置**：[L169](file:///d:/claude/nomad/api/jobs.go#L169)

**中文说明**：JobListFields 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobListFields struct {
	Meta bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `bool` | 元数据 |

### JobListOptions

**定义位置**：[L172](file:///d:/claude/nomad/api/jobs.go#L172)

**中文说明**：JobListOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type JobListOptions struct {
	Fields *JobListFields
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Fields` | `*JobListFields` | — |

### VersionsOptions

**定义位置**：[L291](file:///d:/claude/nomad/api/jobs.go#L291)

**中文说明**：VersionsOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type VersionsOptions struct {
	Diffs bool
	DiffTag string
	DiffVersion *uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Diffs` | `bool` | 布尔值 |
| `DiffTag` | `string` | 字符串 |
| `DiffVersion` | `*uint64` | 无符号 64 位整数 |

### DeregisterOptions

**定义位置**：[L408](file:///d:/claude/nomad/api/jobs.go#L408)

**中文说明**：DeregisterOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type DeregisterOptions struct {
	Purge bool
	Global bool
	EvalPriority int
	NoShutdownDelay bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Purge` | `bool` | 布尔值 |
| `Global` | `bool` | 布尔值 |
| `EvalPriority` | `int` | — |
| `NoShutdownDelay` | `bool` | 布尔值 |

### PlanOptions

**定义位置**：[L490](file:///d:/claude/nomad/api/jobs.go#L490)

**中文说明**：PlanOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type PlanOptions struct {
	Diff bool
	PolicyOverride bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Diff` | `bool` | 布尔值 |
| `PolicyOverride` | `bool` | 布尔值 |

### DispatchOptions

**定义位置**：[L535](file:///d:/claude/nomad/api/jobs.go#L535)

**中文说明**：DispatchOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type DispatchOptions struct {
	JobID string
	Meta map[string]string
	Payload []byte
	IdPrefixTemplate string
	Priority int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `Meta` | `map[string]string` | 元数据 |
| `Payload` | `[]byte` | 字节数组 |
| `IdPrefixTemplate` | `string` | 字符串 |
| `Priority` | `int` | — |

### periodicForceResponse

**定义位置**：[L618](file:///d:/claude/nomad/api/jobs.go#L618)

**中文说明**：periodicForceResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type periodicForceResponse struct {
	EvalID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalID` | `string` | 字符串 |

### UpdateStrategy

**定义位置**：[L623](file:///d:/claude/nomad/api/jobs.go#L623)

**中文说明**：UpdateStrategy 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type UpdateStrategy struct {
	Stagger *time.Duration `mapstructure:"stagger" hcl:"stagger,optional"`
	MaxParallel *int `mapstructure:"max_parallel" hcl:"max_parallel,optional"`
	HealthCheck *string `mapstructure:"health_check" hcl:"health_check,optional"`
	MinHealthyTime *time.Duration `mapstructure:"min_healthy_time" hcl:"min_healthy_time,optional"`
	HealthyDeadline *time.Duration `mapstructure:"healthy_deadline" hcl:"healthy_deadline,optional"`
	ProgressDeadline *time.Duration `mapstructure:"progress_deadline" hcl:"progress_deadline,optional"`
	Canary *int `mapstructure:"canary" hcl:"canary,optional"`
	AutoRevert *bool `mapstructure:"auto_revert" hcl:"auto_revert,optional"`
	AutoPromote *bool `mapstructure:"auto_promote" hcl:"auto_promote,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Stagger` | `*time.Duration `mapstructure:"stagger" hcl:"stagger,optional"`` | 时间间隔 |
| `MaxParallel` | `*int `mapstructure:"max_parallel" hcl:"max_parallel,optional"`` | — |
| `HealthCheck` | `*string `mapstructure:"health_check" hcl:"health_check,optional"`` | 字符串 |
| `MinHealthyTime` | `*time.Duration `mapstructure:"min_healthy_time" hcl:"min_healthy_time,optional"`` | 时间间隔 |
| `HealthyDeadline` | `*time.Duration `mapstructure:"healthy_deadline" hcl:"healthy_deadline,optional"`` | 时间间隔 |
| `ProgressDeadline` | `*time.Duration `mapstructure:"progress_deadline" hcl:"progress_deadline,optional"`` | 时间间隔 |
| `Canary` | `*int `mapstructure:"canary" hcl:"canary,optional"`` | — |
| `AutoRevert` | `*bool `mapstructure:"auto_revert" hcl:"auto_revert,optional"`` | 布尔值 |
| `AutoPromote` | `*bool `mapstructure:"auto_promote" hcl:"auto_promote,optional"`` | 布尔值 |

**关联方法**（4 个）：`Copy`, `Merge`, `Canonicalize`, `Empty`

### Multiregion

**定义位置**：[L824](file:///d:/claude/nomad/api/jobs.go#L824)

**中文说明**：Multiregion 与区域（Region）相关，Nomad 的多区域联邦单元。

**类型**：struct

```go
type Multiregion struct {
	Strategy *MultiregionStrategy `hcl:"strategy,block"`
	Regions []*MultiregionRegion `hcl:"region,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Strategy` | `*MultiregionStrategy `hcl:"strategy,block"`` | — |
| `Regions` | `[]*MultiregionRegion `hcl:"region,block"`` | 列表 |

**关联方法**（2 个）：`Canonicalize`, `Copy`

### MultiregionStrategy

**定义位置**：[L884](file:///d:/claude/nomad/api/jobs.go#L884)

**中文说明**：MultiregionStrategy 与区域（Region）相关，Nomad 的多区域联邦单元。

**类型**：struct

```go
type MultiregionStrategy struct {
	MaxParallel *int `mapstructure:"max_parallel" hcl:"max_parallel,optional"`
	OnFailure *string `mapstructure:"on_failure" hcl:"on_failure,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MaxParallel` | `*int `mapstructure:"max_parallel" hcl:"max_parallel,optional"`` | — |
| `OnFailure` | `*string `mapstructure:"on_failure" hcl:"on_failure,optional"`` | 字符串 |

### MultiregionRegion

**定义位置**：[L889](file:///d:/claude/nomad/api/jobs.go#L889)

**中文说明**：MultiregionRegion 与区域（Region）相关，Nomad 的多区域联邦单元。

**类型**：struct

```go
type MultiregionRegion struct {
	Name string `hcl:",label"`
	Count *int `hcl:"count,optional"`
	Datacenters []string `hcl:"datacenters,optional"`
	NodePool string `hcl:"node_pool,optional"`
	Meta map[string]string `hcl:"meta,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:",label"`` | 名称 |
| `Count` | `*int `hcl:"count,optional"`` | 计数 |
| `Datacenters` | `[]string `hcl:"datacenters,optional"`` | 列表 |
| `NodePool` | `string `hcl:"node_pool,optional"`` | 字符串 |
| `Meta` | `map[string]string `hcl:"meta,block"`` | 元数据 |

### PeriodicConfig

**定义位置**：[L898](file:///d:/claude/nomad/api/jobs.go#L898)

**中文说明**：PeriodicConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type PeriodicConfig struct {
	Enabled *bool `hcl:"enabled,optional"`
	Spec *string `hcl:"cron,optional"`
	Specs []string `hcl:"crons,optional"`
	SpecType *string
	ProhibitOverlap *bool `mapstructure:"prohibit_overlap" hcl:"prohibit_overlap,optional"`
	TimeZone *string `mapstructure:"time_zone" hcl:"time_zone,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Enabled` | `*bool `hcl:"enabled,optional"`` | 是否启用 |
| `Spec` | `*string `hcl:"cron,optional"`` | 字符串 |
| `Specs` | `[]string `hcl:"crons,optional"`` | 列表 |
| `SpecType` | `*string` | 字符串 |
| `ProhibitOverlap` | `*bool `mapstructure:"prohibit_overlap" hcl:"prohibit_overlap,optional"`` | 布尔值 |
| `TimeZone` | `*string `mapstructure:"time_zone" hcl:"time_zone,optional"`` | 字符串 |

**关联方法**（3 个）：`Canonicalize`, `Next`, `GetLocation`

### ParameterizedJobConfig

**定义位置**：[L981](file:///d:/claude/nomad/api/jobs.go#L981)

**中文说明**：ParameterizedJobConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type ParameterizedJobConfig struct {
	Payload string `hcl:"payload,optional"`
	MetaRequired []string `mapstructure:"meta_required" hcl:"meta_required,optional"`
	MetaOptional []string `mapstructure:"meta_optional" hcl:"meta_optional,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Payload` | `string `hcl:"payload,optional"`` | 字符串 |
| `MetaRequired` | `[]string `mapstructure:"meta_required" hcl:"meta_required,optional"`` | 列表 |
| `MetaOptional` | `[]string `mapstructure:"meta_optional" hcl:"meta_optional,optional"`` | 列表 |

### JobSubmission

**定义位置**：[L992](file:///d:/claude/nomad/api/jobs.go#L992)

**中文说明**：JobSubmission 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobSubmission struct {
	Source string
	Format string
	VariableFlags map[string]string
	Variables string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Source` | `string` | 字符串 |
| `Format` | `string` | 字符串 |
| `VariableFlags` | `map[string]string` | 映射表 |
| `Variables` | `string` | 字符串 |

**关联方法**（2 个）：`Canonicalize`, `Copy`

### JobUIConfig

**定义位置**：[L1010](file:///d:/claude/nomad/api/jobs.go#L1010)

**中文说明**：JobUIConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type JobUIConfig struct {
	Description string `hcl:"description,optional"`
	Links []*JobUILink `hcl:"link,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Description` | `string `hcl:"description,optional"`` | 描述信息 |
| `Links` | `[]*JobUILink `hcl:"link,block"`` | 列表 |

**关联方法**（2 个）：`Canonicalize`, `Copy`

### JobUILink

**定义位置**：[L1015](file:///d:/claude/nomad/api/jobs.go#L1015)

**中文说明**：JobUILink 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobUILink struct {
	Label string `hcl:"label,optional"`
	URL string `hcl:"url,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Label` | `string `hcl:"label,optional"`` | 字符串 |
| `URL` | `string `hcl:"url,optional"`` | URL 地址 |

**关联方法**（1 个）：`Copy`

### JobVersionTag

**定义位置**：[L1056](file:///d:/claude/nomad/api/jobs.go#L1056)

**中文说明**：JobVersionTag 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobVersionTag struct {
	Name string
	Description string
	TaggedTime int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Description` | `string` | 描述信息 |
| `TaggedTime` | `int64` | — |

**关联方法**（1 个）：`Copy`

### Job

**定义位置**：[L1105](file:///d:/claude/nomad/api/jobs.go#L1105)

**中文说明**：Job 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type Job struct {
	Region *string `hcl:"region,optional"`
	Namespace *string `hcl:"namespace,optional"`
	ID *string `hcl:"id,optional"`
	Name *string `hcl:"name,optional"`
	Type *string `hcl:"type,optional"`
	Priority *int `hcl:"priority,optional"`
	AllAtOnce *bool `mapstructure:"all_at_once" hcl:"all_at_once,optional"`
	Datacenters []string `hcl:"datacenters,optional"`
	NodePool *string `mapstructure:"node_pool" hcl:"node_pool,optional"`
	Constraints []*Constraint `hcl:"constraint,block"`
	Affinities []*Affinity `hcl:"affinity,block"`
	TaskGroups []*TaskGroup `hcl:"group,block"`
	Update *UpdateStrategy `hcl:"update,block"`
	Multiregion *Multiregion `hcl:"multiregion,block"`
	Spreads []*Spread `hcl:"spread,block"`
	Periodic *PeriodicConfig `hcl:"periodic,block"`
	ParameterizedJob *ParameterizedJobConfig `hcl:"parameterized,block"`
	Reschedule *ReschedulePolicy `hcl:"reschedule,block"`
	Migrate *MigrateStrategy `hcl:"migrate,block"`
	Meta map[string]string `hcl:"meta,block"`
	UI *JobUIConfig `hcl:"ui,block"`
	Stop *bool
	ParentID *string
	Dispatched bool
	DispatchIdempotencyToken *string
	Payload []byte
	ConsulNamespace *string `mapstructure:"consul_namespace"`
	VaultNamespace *string `mapstructure:"vault_namespace"`
	NomadTokenID *string `mapstructure:"nomad_token_id"`
	Status *string
	StatusDescription *string
	Stable *bool
	Version *uint64
	SubmitTime *int64
	CreateIndex *uint64
	ModifyIndex *uint64
	JobModifyIndex *uint64
	VersionTag *JobVersionTag
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Region` | `*string `hcl:"region,optional"`` | 区域 |
| `Namespace` | `*string `hcl:"namespace,optional"`` | 命名空间 |
| `ID` | `*string `hcl:"id,optional"`` | 唯一标识符 |
| `Name` | `*string `hcl:"name,optional"`` | 名称 |
| `Type` | `*string `hcl:"type,optional"`` | 类型 |
| `Priority` | `*int `hcl:"priority,optional"`` | — |
| `AllAtOnce` | `*bool `mapstructure:"all_at_once" hcl:"all_at_once,optional"`` | 布尔值 |
| `Datacenters` | `[]string `hcl:"datacenters,optional"`` | 列表 |
| `NodePool` | `*string `mapstructure:"node_pool" hcl:"node_pool,optional"`` | 字符串 |
| `Constraints` | `[]*Constraint `hcl:"constraint,block"`` | 列表 |
| `Affinities` | `[]*Affinity `hcl:"affinity,block"`` | 列表 |
| `TaskGroups` | `[]*TaskGroup `hcl:"group,block"`` | 列表 |
| `Update` | `*UpdateStrategy `hcl:"update,block"`` | — |
| `Multiregion` | `*Multiregion `hcl:"multiregion,block"`` | — |
| `Spreads` | `[]*Spread `hcl:"spread,block"`` | 列表 |
| `Periodic` | `*PeriodicConfig `hcl:"periodic,block"`` | — |
| `ParameterizedJob` | `*ParameterizedJobConfig `hcl:"parameterized,block"`` | — |
| `Reschedule` | `*ReschedulePolicy `hcl:"reschedule,block"`` | — |
| `Migrate` | `*MigrateStrategy `hcl:"migrate,block"`` | — |
| `Meta` | `map[string]string `hcl:"meta,block"`` | 元数据 |
| `UI` | `*JobUIConfig `hcl:"ui,block"`` | — |
| `Stop` | `*bool` | 布尔值 |
| `ParentID` | `*string` | 字符串 |
| `Dispatched` | `bool` | 布尔值 |
| `DispatchIdempotencyToken` | `*string` | 字符串 |
| `Payload` | `[]byte` | 字节数组 |
| `ConsulNamespace` | `*string `mapstructure:"consul_namespace"`` | 字符串 |
| `VaultNamespace` | `*string `mapstructure:"vault_namespace"`` | 字符串 |
| `NomadTokenID` | `*string `mapstructure:"nomad_token_id"`` | 字符串 |
| `Status` | `*string` | 状态 |
| `StatusDescription` | `*string` | 字符串 |
| `Stable` | `*bool` | 布尔值 |
| `Version` | `*uint64` | 版本号 |
| `SubmitTime` | `*int64` | — |
| `CreateIndex` | `*uint64` | 索引值（uint64） |
| `ModifyIndex` | `*uint64` | 索引值（uint64） |
| `JobModifyIndex` | `*uint64` | 索引值（uint64） |
| `VersionTag` | `*JobVersionTag` | — |

**关联方法**（13 个）：`IsPeriodic`, `IsParameterized`, `IsMultiregion`, `Canonicalize`, `LookupTaskGroup`, `SetMeta`, `AddDatacenter`, `Constrain`, `AddAffinity`, `AddTaskGroup`, `AddPeriodicConfig`, `AddSpread`, `GetScalingPoliciesPerTaskGroup`

### JobSummary

**定义位置**：[L1266](file:///d:/claude/nomad/api/jobs.go#L1266)

**中文说明**：JobSummary 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobSummary struct {
	JobID string
	Namespace string
	Summary map[string]TaskGroupSummary
	Children *JobChildrenSummary
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `Namespace` | `string` | 命名空间 |
| `Summary` | `map[string]TaskGroupSummary` | 映射表 |
| `Children` | `*JobChildrenSummary` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### JobChildrenSummary

**定义位置**：[L1278](file:///d:/claude/nomad/api/jobs.go#L1278)

**中文说明**：JobChildrenSummary 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobChildrenSummary struct {
	Pending int64
	Running int64
	Dead int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Pending` | `int64` | — |
| `Running` | `int64` | 是否运行中 |
| `Dead` | `int64` | — |

**关联方法**（1 个）：`Sum`

### TaskGroupSummary

**定义位置**：[L1294](file:///d:/claude/nomad/api/jobs.go#L1294)

**中文说明**：TaskGroupSummary 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskGroupSummary struct {
	Queued int
	Complete int
	Failed int
	Running int
	Starting int
	Lost int
	Unknown int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Queued` | `int` | — |
| `Complete` | `int` | — |
| `Failed` | `int` | — |
| `Running` | `int` | 是否运行中 |
| `Starting` | `int` | — |
| `Lost` | `int` | — |
| `Unknown` | `int` | — |

### JobListStub

**定义位置**：[L1306](file:///d:/claude/nomad/api/jobs.go#L1306)

**中文说明**：JobListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type JobListStub struct {
	ID string
	ParentID string
	Name string
	Namespace string `json:",omitempty"`
	Datacenters []string
	Type string
	Priority int
	Periodic bool
	ParameterizedJob bool
	Stop bool
	Status string
	StatusDescription string
	JobSummary *JobSummary
	CreateIndex uint64
	ModifyIndex uint64
	JobModifyIndex uint64
	SubmitTime int64
	Meta map[string]string `json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `ParentID` | `string` | 字符串 |
| `Name` | `string` | 名称 |
| `Namespace` | `string `json:",omitempty"`` | 命名空间 |
| `Datacenters` | `[]string` | 列表 |
| `Type` | `string` | 类型 |
| `Priority` | `int` | — |
| `Periodic` | `bool` | 布尔值 |
| `ParameterizedJob` | `bool` | 布尔值 |
| `Stop` | `bool` | 布尔值 |
| `Status` | `string` | 状态 |
| `StatusDescription` | `string` | 字符串 |
| `JobSummary` | `*JobSummary` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `SubmitTime` | `int64` | — |
| `Meta` | `map[string]string `json:",omitempty"`` | 元数据 |

### JobIDSort

**定义位置**：[L1328](file:///d:/claude/nomad/api/jobs.go#L1328)

**中文说明**：JobIDSort 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型定义**：`type JobIDSort []*JobListStub`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### WriteRequest

**定义位置**：[L1434](file:///d:/claude/nomad/api/jobs.go#L1434)

**中文说明**：WriteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type WriteRequest struct {
	Region string
	Namespace string
	SecretID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Region` | `string` | 区域 |
| `Namespace` | `string` | 命名空间 |
| `SecretID` | `string` | 字符串 |

### JobValidateRequest

**定义位置**：[L1446](file:///d:/claude/nomad/api/jobs.go#L1446)

**中文说明**：JobValidateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobValidateRequest struct {
	Job *Job
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Job` | `*Job` | — |
| `WriteRequest` | `WriteRequest` | — |

### JobValidateResponse

**定义位置**：[L1452](file:///d:/claude/nomad/api/jobs.go#L1452)

**中文说明**：JobValidateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobValidateResponse struct {
	DriverConfigValidated bool
	ValidationErrors []string
	Error string
	Warnings string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DriverConfigValidated` | `bool` | 布尔值 |
| `ValidationErrors` | `[]string` | 列表 |
| `Error` | `string` | 错误信息 |
| `Warnings` | `string` | 字符串 |

### JobRevertRequest

**定义位置**：[L1469](file:///d:/claude/nomad/api/jobs.go#L1469)

**中文说明**：JobRevertRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobRevertRequest struct {
	JobID string
	JobVersion uint64
	EnforcePriorVersion *uint64
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `JobVersion` | `uint64` | 无符号 64 位整数 |
| `EnforcePriorVersion` | `*uint64` | 无符号 64 位整数 |
| `WriteRequest` | `WriteRequest` | — |

### JobRegisterRequest

**定义位置**：[L1484](file:///d:/claude/nomad/api/jobs.go#L1484)

**中文说明**：JobRegisterRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobRegisterRequest struct {
	Submission *JobSubmission
	Job *Job
	EnforceIndex bool `json:",omitempty"`
	JobModifyIndex uint64 `json:",omitempty"`
	PolicyOverride bool `json:",omitempty"`
	PreserveCounts bool `json:",omitempty"`
	PreserveResources bool `json:",omitempty"`
	EvalPriority int `json:",omitempty"`
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Submission` | `*JobSubmission` | — |
| `Job` | `*Job` | — |
| `EnforceIndex` | `bool `json:",omitempty"`` | 布尔值 |
| `JobModifyIndex` | `uint64 `json:",omitempty"`` | 索引值（uint64） |
| `PolicyOverride` | `bool `json:",omitempty"`` | 布尔值 |
| `PreserveCounts` | `bool `json:",omitempty"`` | 布尔值 |
| `PreserveResources` | `bool `json:",omitempty"`` | 布尔值 |
| `EvalPriority` | `int `json:",omitempty"`` | — |
| `WriteRequest` | `WriteRequest` | — |

### JobRegisterResponse

**定义位置**：[L1509](file:///d:/claude/nomad/api/jobs.go#L1509)

**中文说明**：JobRegisterResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobRegisterResponse struct {
	EvalID string
	EvalCreateIndex uint64
	JobModifyIndex uint64
	Warnings string
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalID` | `string` | 字符串 |
| `EvalCreateIndex` | `uint64` | 索引值（uint64） |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `Warnings` | `string` | 字符串 |
| `QueryMeta` | `QueryMeta` | — |

### JobDeregisterResponse

**定义位置**：[L1522](file:///d:/claude/nomad/api/jobs.go#L1522)

**中文说明**：JobDeregisterResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobDeregisterResponse struct {
	EvalID string
	EvalCreateIndex uint64
	JobModifyIndex uint64
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalID` | `string` | 字符串 |
| `EvalCreateIndex` | `uint64` | 索引值（uint64） |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `QueryMeta` | `QueryMeta` | — |

### JobPlanRequest

**定义位置**：[L1529](file:///d:/claude/nomad/api/jobs.go#L1529)

**中文说明**：JobPlanRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobPlanRequest struct {
	Job *Job
	Diff bool
	PolicyOverride bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Job` | `*Job` | — |
| `Diff` | `bool` | 布尔值 |
| `PolicyOverride` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### JobPlanResponse

**定义位置**：[L1536](file:///d:/claude/nomad/api/jobs.go#L1536)

**中文说明**：JobPlanResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobPlanResponse struct {
	JobModifyIndex uint64
	CreatedEvals []*Evaluation
	Diff *JobDiff
	Annotations *PlanAnnotations
	FailedTGAllocs map[string]*AllocationMetric
	NextPeriodicLaunch time.Time
	Warnings string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `CreatedEvals` | `[]*Evaluation` | 列表 |
| `Diff` | `*JobDiff` | — |
| `Annotations` | `*PlanAnnotations` | — |
| `FailedTGAllocs` | `map[string]*AllocationMetric` | 映射表 |
| `NextPeriodicLaunch` | `time.Time` | 时间点 |
| `Warnings` | `string` | 字符串 |

### JobDiff

**定义位置**：[L1549](file:///d:/claude/nomad/api/jobs.go#L1549)

**中文说明**：JobDiff 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobDiff struct {
	Type string
	ID string
	Fields []*FieldDiff
	Objects []*ObjectDiff
	TaskGroups []*TaskGroupDiff
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string` | 类型 |
| `ID` | `string` | 唯一标识符 |
| `Fields` | `[]*FieldDiff` | 列表 |
| `Objects` | `[]*ObjectDiff` | 列表 |
| `TaskGroups` | `[]*TaskGroupDiff` | 列表 |

### TaskGroupDiff

**定义位置**：[L1557](file:///d:/claude/nomad/api/jobs.go#L1557)

**中文说明**：TaskGroupDiff 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskGroupDiff struct {
	Type string
	Name string
	Fields []*FieldDiff
	Objects []*ObjectDiff
	Tasks []*TaskDiff
	Updates map[string]uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string` | 类型 |
| `Name` | `string` | 名称 |
| `Fields` | `[]*FieldDiff` | 列表 |
| `Objects` | `[]*ObjectDiff` | 列表 |
| `Tasks` | `[]*TaskDiff` | 列表 |
| `Updates` | `map[string]uint64` | 无符号 64 位整数 |

### TaskDiff

**定义位置**：[L1566](file:///d:/claude/nomad/api/jobs.go#L1566)

**中文说明**：TaskDiff 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskDiff struct {
	Type string
	Name string
	Fields []*FieldDiff
	Objects []*ObjectDiff
	Annotations []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string` | 类型 |
| `Name` | `string` | 名称 |
| `Fields` | `[]*FieldDiff` | 列表 |
| `Objects` | `[]*ObjectDiff` | 列表 |
| `Annotations` | `[]string` | 列表 |

### FieldDiff

**定义位置**：[L1574](file:///d:/claude/nomad/api/jobs.go#L1574)

**中文说明**：FieldDiff 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type FieldDiff struct {
	Type string
	Name string
	Old, New string
	Annotations []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string` | 类型 |
| `Name` | `string` | 名称 |
| `Old, New` | `string` | 字符串 |
| `Annotations` | `[]string` | 列表 |

### ObjectDiff

**定义位置**：[L1581](file:///d:/claude/nomad/api/jobs.go#L1581)

**中文说明**：ObjectDiff 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ObjectDiff struct {
	Type string
	Name string
	Fields []*FieldDiff
	Objects []*ObjectDiff
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string` | 类型 |
| `Name` | `string` | 名称 |
| `Fields` | `[]*FieldDiff` | 列表 |
| `Objects` | `[]*ObjectDiff` | 列表 |

### PlanAnnotations

**定义位置**：[L1588](file:///d:/claude/nomad/api/jobs.go#L1588)

**中文说明**：PlanAnnotations 与计划（Plan）相关，计划是调度器提交的分配方案。

**类型**：struct

```go
type PlanAnnotations struct {
	DesiredTGUpdates map[string]*DesiredUpdates
	PreemptedAllocs []*AllocationListStub
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DesiredTGUpdates` | `map[string]*DesiredUpdates` | 映射表 |
| `PreemptedAllocs` | `[]*AllocationListStub` | 列表 |

### DesiredUpdates

**定义位置**：[L1593](file:///d:/claude/nomad/api/jobs.go#L1593)

**中文说明**：DesiredUpdates 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type DesiredUpdates struct {
	Ignore uint64
	Place uint64
	Migrate uint64
	Stop uint64
	InPlaceUpdate uint64
	DestructiveUpdate uint64
	Canary uint64
	Preemptions uint64
	Disconnect uint64
	Reconnect uint64
	RescheduleNow uint64
	RescheduleLater uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Ignore` | `uint64` | 无符号 64 位整数 |
| `Place` | `uint64` | 无符号 64 位整数 |
| `Migrate` | `uint64` | 无符号 64 位整数 |
| `Stop` | `uint64` | 无符号 64 位整数 |
| `InPlaceUpdate` | `uint64` | 无符号 64 位整数 |
| `DestructiveUpdate` | `uint64` | 无符号 64 位整数 |
| `Canary` | `uint64` | 无符号 64 位整数 |
| `Preemptions` | `uint64` | 无符号 64 位整数 |
| `Disconnect` | `uint64` | 无符号 64 位整数 |
| `Reconnect` | `uint64` | 无符号 64 位整数 |
| `RescheduleNow` | `uint64` | 无符号 64 位整数 |
| `RescheduleLater` | `uint64` | 无符号 64 位整数 |

### JobDispatchRequest

**定义位置**：[L1608](file:///d:/claude/nomad/api/jobs.go#L1608)

**中文说明**：JobDispatchRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobDispatchRequest struct {
	JobID string
	Payload []byte
	Meta map[string]string
	IdPrefixTemplate string
	Priority int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `Payload` | `[]byte` | 字节数组 |
| `Meta` | `map[string]string` | 元数据 |
| `IdPrefixTemplate` | `string` | 字符串 |
| `Priority` | `int` | — |

### JobDispatchResponse

**定义位置**：[L1616](file:///d:/claude/nomad/api/jobs.go#L1616)

**中文说明**：JobDispatchResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobDispatchResponse struct {
	DispatchedJobID string
	EvalID string
	EvalCreateIndex uint64
	JobCreateIndex uint64
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DispatchedJobID` | `string` | 字符串 |
| `EvalID` | `string` | 字符串 |
| `EvalCreateIndex` | `uint64` | 索引值（uint64） |
| `JobCreateIndex` | `uint64` | 索引值（uint64） |
| `WriteMeta` | `WriteMeta` | — |

### JobVersionsResponse

**定义位置**：[L1625](file:///d:/claude/nomad/api/jobs.go#L1625)

**中文说明**：JobVersionsResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobVersionsResponse struct {
	Versions []*Job
	Diffs []*JobDiff
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Versions` | `[]*Job` | 列表 |
| `Diffs` | `[]*JobDiff` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### JobSubmissionResponse

**定义位置**：[L1632](file:///d:/claude/nomad/api/jobs.go#L1632)

**中文说明**：JobSubmissionResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobSubmissionResponse struct {
	Submission *JobSubmission
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Submission` | `*JobSubmission` | — |
| `QueryMeta` | `QueryMeta` | — |

### JobStabilityRequest

**定义位置**：[L1638](file:///d:/claude/nomad/api/jobs.go#L1638)

**中文说明**：JobStabilityRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobStabilityRequest struct {
	JobID string
	JobVersion uint64
	Stable bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `JobVersion` | `uint64` | 无符号 64 位整数 |
| `Stable` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### JobStabilityResponse

**定义位置**：[L1649](file:///d:/claude/nomad/api/jobs.go#L1649)

**中文说明**：JobStabilityResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobStabilityResponse struct {
	JobModifyIndex uint64
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `WriteMeta` | `WriteMeta` | — |

### JobEvaluateRequest

**定义位置**：[L1655](file:///d:/claude/nomad/api/jobs.go#L1655)

**中文说明**：JobEvaluateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobEvaluateRequest struct {
	JobID string
	EvalOptions EvalOptions
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `EvalOptions` | `EvalOptions` | — |
| `WriteRequest` | `WriteRequest` | — |

### EvalOptions

**定义位置**：[L1662](file:///d:/claude/nomad/api/jobs.go#L1662)

**中文说明**：EvalOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type EvalOptions struct {
	ForceReschedule bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ForceReschedule` | `bool` | 布尔值 |

### JobStatusesRequest

**定义位置**：[L1696](file:///d:/claude/nomad/api/jobs.go#L1696)

**中文说明**：JobStatusesRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobStatusesRequest struct {
	Jobs []NamespacedID
	IncludeChildren bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Jobs` | `[]NamespacedID` | 列表 |
| `IncludeChildren` | `bool` | 布尔值 |

### TagVersionRequest

**定义位置**：[L1703](file:///d:/claude/nomad/api/jobs.go#L1703)

**中文说明**：TagVersionRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type TagVersionRequest struct {
	Version uint64
	Latest bool
	Description string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Version` | `uint64` | 版本号 |
| `Latest` | `bool` | 布尔值 |
| `Description` | `string` | 描述信息 |
| `WriteRequest` | `WriteRequest` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `JobTypeService` | `—` | `"service"` | — |
| `JobTypeBatch` | `—` | `"batch"` | — |
| `JobTypeSystem` | `—` | `"system"` | — |
| `JobTypeSysbatch` | `—` | `"sysbatch"` | — |
| `JobDefaultPriority` | `—` | `50` | — |
| `PeriodicSpecCron` | `—` | `"cron"` | — |
| `DefaultNamespace` | `—` | `"default"` | — |
| `GlobalRegion` | `—` | `"global"` | — |
| `RegisterEnforceIndexErrPrefix` | `—` | `"Enforcing job modify index"` | — |
| `JobPeriodicLaunchSuffix` | `—` | `"/periodic-"` | — |
| `JobDispatchLaunchSuffix` | `—` | `"/dispatch-"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Jobs` | `c *Client` | `` | `*Jobs` | [L88](file:///d:/claude/nomad/api/jobs.go#L88) |
| `ParseHCL` | `j *Jobs` | `jobHCL string, canonicalize bool` | `*Job, error` | [L95](file:///d:/claude/nomad/api/jobs.go#L95) |
| `ParseHCLOpts` | `j *Jobs` | `req *JobsParseRequest` | `*Job, error` | [L105](file:///d:/claude/nomad/api/jobs.go#L105) |
| `Validate` | `j *Jobs` | `job *Job, q *WriteOptions` | `*JobValidateResponse, *WriteMeta, error` | [L111](file:///d:/claude/nomad/api/jobs.go#L111) |
| `Register` | `j *Jobs` | `job *Job, q *WriteOptions` | `*JobRegisterResponse, *WriteMeta, error` | [L134](file:///d:/claude/nomad/api/jobs.go#L134) |
| `EnforceRegister` | `j *Jobs` | `job *Job, modifyIndex uint64, q *WriteOptions` | `*JobRegisterResponse, *WriteMeta, error` | [L139](file:///d:/claude/nomad/api/jobs.go#L139) |
| `RegisterOpts` | `j *Jobs` | `job *Job, opts *RegisterOptions, q *WriteOptions` | `*JobRegisterResponse, *WriteMeta, error` | [L146](file:///d:/claude/nomad/api/jobs.go#L146) |
| `List` | `j *Jobs` | `q *QueryOptions` | `[]*JobListStub, *QueryMeta, error` | [L177](file:///d:/claude/nomad/api/jobs.go#L177) |
| `ListOptions` | `j *Jobs` | `opts *JobListOptions, q *QueryOptions` | `[]*JobListStub, *QueryMeta, error` | [L182](file:///d:/claude/nomad/api/jobs.go#L182) |
| `PrefixList` | `j *Jobs` | `prefix string` | `[]*JobListStub, *QueryMeta, error` | [L202](file:///d:/claude/nomad/api/jobs.go#L202) |
| `Info` | `j *Jobs` | `jobID string, q *QueryOptions` | `*Job, *QueryMeta, error` | [L208](file:///d:/claude/nomad/api/jobs.go#L208) |
| `Scale` | `j *Jobs` | `jobID string, group string, count *int, message string, error bool, meta map[...` | `*JobRegisterResponse, *WriteMeta, error` | [L218](file:///d:/claude/nomad/api/jobs.go#L218) |
| `ScaleWithRequest` | `j *Jobs` | `jobID string, req *ScalingRequest, q *WriteOptions` | `*JobRegisterResponse, *WriteMeta, error` | [L245](file:///d:/claude/nomad/api/jobs.go#L245) |
| `ScaleStatus` | `j *Jobs` | `jobID string, q *QueryOptions` | `*JobScaleStatusResponse, *QueryMeta, error` | [L256](file:///d:/claude/nomad/api/jobs.go#L256) |
| `Versions` | `j *Jobs` | `jobID string, diffs bool, q *QueryOptions` | `[]*Job, []*JobDiff, *QueryMeta, error` | [L267](file:///d:/claude/nomad/api/jobs.go#L267) |
| `VersionByTag` | `j *Jobs` | `jobID string, tag string, q *QueryOptions` | `*Job, *QueryMeta, error` | [L275](file:///d:/claude/nomad/api/jobs.go#L275) |
| `VersionsOpts` | `j *Jobs` | `jobID string, opts *VersionsOptions, q *QueryOptions` | `[]*Job, []*JobDiff, *QueryMeta, error` | [L297](file:///d:/claude/nomad/api/jobs.go#L297) |
| `Submission` | `j *Jobs` | `jobID string, version int, q *QueryOptions` | `*JobSubmission, *QueryMeta, error` | [L321](file:///d:/claude/nomad/api/jobs.go#L321) |
| `Allocations` | `j *Jobs` | `jobID string, allAllocs bool, q *QueryOptions` | `[]*AllocationListStub, *QueryMeta, error` | [L333](file:///d:/claude/nomad/api/jobs.go#L333) |
| `Deployments` | `j *Jobs` | `jobID string, all bool, q *QueryOptions` | `[]*Deployment, *QueryMeta, error` | [L354](file:///d:/claude/nomad/api/jobs.go#L354) |
| `LatestDeployment` | `j *Jobs` | `jobID string, q *QueryOptions` | `*Deployment, *QueryMeta, error` | [L374](file:///d:/claude/nomad/api/jobs.go#L374) |
| `Evaluations` | `j *Jobs` | `jobID string, q *QueryOptions` | `[]*Evaluation, *QueryMeta, error` | [L385](file:///d:/claude/nomad/api/jobs.go#L385) |
| `Deregister` | `j *Jobs` | `jobID string, purge bool, q *WriteOptions` | `string, *WriteMeta, error` | [L398](file:///d:/claude/nomad/api/jobs.go#L398) |
| `DeregisterOpts` | `j *Jobs` | `jobID string, opts *DeregisterOptions, q *WriteOptions` | `string, *WriteMeta, error` | [L433](file:///d:/claude/nomad/api/jobs.go#L433) |
| `ForceEvaluate` | `j *Jobs` | `jobID string, q *WriteOptions` | `string, *WriteMeta, error` | [L454](file:///d:/claude/nomad/api/jobs.go#L454) |
| `EvaluateWithOpts` | `j *Jobs` | `jobID string, opts EvalOptions, q *WriteOptions` | `string, *WriteMeta, error` | [L465](file:///d:/claude/nomad/api/jobs.go#L465) |
| `PeriodicForce` | `j *Jobs` | `jobID string, q *WriteOptions` | `string, *WriteMeta, error` | [L480](file:///d:/claude/nomad/api/jobs.go#L480) |
| `Plan` | `j *Jobs` | `job *Job, diff bool, q *WriteOptions` | `*JobPlanResponse, *WriteMeta, error` | [L495](file:///d:/claude/nomad/api/jobs.go#L495) |
| `PlanOpts` | `j *Jobs` | `job *Job, opts *PlanOptions, q *WriteOptions` | `*JobPlanResponse, *WriteMeta, error` | [L500](file:///d:/claude/nomad/api/jobs.go#L500) |
| `Summary` | `j *Jobs` | `jobID string, q *QueryOptions` | `*JobSummary, *QueryMeta, error` | [L525](file:///d:/claude/nomad/api/jobs.go#L525) |
| `Dispatch` | `j *Jobs` | `jobID string, meta map[string]string, payload []byte, idPrefixTemplate string...` | `*JobDispatchResponse, *WriteMeta, error` | [L543](file:///d:/claude/nomad/api/jobs.go#L543) |
| `DispatchOpts` | `j *Jobs` | `opts *DispatchOptions, q *WriteOptions` | `*JobDispatchResponse, *WriteMeta, error` | [L557](file:///d:/claude/nomad/api/jobs.go#L557) |
| `Revert` | `j *Jobs` | `jobID string, version uint64, enforcePriorVersion *uint64, q *WriteOptions, _...` | `*JobRegisterResponse, *WriteMeta, error` | [L576](file:///d:/claude/nomad/api/jobs.go#L576) |
| `Stable` | `j *Jobs` | `jobID string, version uint64, stable bool, q *WriteOptions` | `*JobStabilityResponse, *WriteMeta, error` | [L593](file:///d:/claude/nomad/api/jobs.go#L593) |
| `Services` | `j *Jobs` | `jobID string, q *QueryOptions` | `[]*ServiceRegistration, *QueryMeta, error` | [L611](file:///d:/claude/nomad/api/jobs.go#L611) |
| `DefaultUpdateStrategy` | - | `` | `*UpdateStrategy` | [L637](file:///d:/claude/nomad/api/jobs.go#L637) |
| `Copy` | `u *UpdateStrategy` | `` | `*UpdateStrategy` | [L651](file:///d:/claude/nomad/api/jobs.go#L651) |
| `Merge` | `u *UpdateStrategy` | `o *UpdateStrategy` | `` | [L697](file:///d:/claude/nomad/api/jobs.go#L697) |
| `Canonicalize` | `u *UpdateStrategy` | `` | `` | [L739](file:///d:/claude/nomad/api/jobs.go#L739) |
| `Empty` | `u *UpdateStrategy` | `` | `bool` | [L780](file:///d:/claude/nomad/api/jobs.go#L780) |
| `Canonicalize` | `m *Multiregion` | `` | `` | [L829](file:///d:/claude/nomad/api/jobs.go#L829) |
| `Copy` | `m *Multiregion` | `` | `*Multiregion` | [L859](file:///d:/claude/nomad/api/jobs.go#L859) |
| `Canonicalize` | `p *PeriodicConfig` | `` | `` | [L907](file:///d:/claude/nomad/api/jobs.go#L907) |
| `Next` | `p *PeriodicConfig` | `fromTime time.Time` | `time.Time, error` | [L932](file:///d:/claude/nomad/api/jobs.go#L932) |
| `cronParseNext` | - | `fromTime time.Time, spec string` | `t time.Time, err error` | [L958](file:///d:/claude/nomad/api/jobs.go#L958) |
| `GetLocation` | `p *PeriodicConfig` | `` | `*time.Location, error` | [L972](file:///d:/claude/nomad/api/jobs.go#L972) |
| `Canonicalize` | `j *JobUIConfig` | `` | `` | [L1020](file:///d:/claude/nomad/api/jobs.go#L1020) |
| `Copy` | `j *JobUIConfig` | `` | `*JobUIConfig` | [L1030](file:///d:/claude/nomad/api/jobs.go#L1030) |
| `Copy` | `j *JobUILink` | `` | `*JobUILink` | [L1045](file:///d:/claude/nomad/api/jobs.go#L1045) |
| `Copy` | `j *JobVersionTag` | `` | `*JobVersionTag` | [L1062](file:///d:/claude/nomad/api/jobs.go#L1062) |
| `Canonicalize` | `js *JobSubmission` | `` | `` | [L1074](file:///d:/claude/nomad/api/jobs.go#L1074) |
| `Copy` | `js *JobSubmission` | `` | `*JobSubmission` | [L1091](file:///d:/claude/nomad/api/jobs.go#L1091) |
| `IsPeriodic` | `j *Job` | `` | `bool` | [L1152](file:///d:/claude/nomad/api/jobs.go#L1152) |
| `IsParameterized` | `j *Job` | `` | `bool` | [L1157](file:///d:/claude/nomad/api/jobs.go#L1157) |
| `IsMultiregion` | `j *Job` | `` | `bool` | [L1162](file:///d:/claude/nomad/api/jobs.go#L1162) |
| `Canonicalize` | `j *Job` | `` | `` | [L1166](file:///d:/claude/nomad/api/jobs.go#L1166) |
| `LookupTaskGroup` | `j *Job` | `name string` | `*TaskGroup` | [L1256](file:///d:/claude/nomad/api/jobs.go#L1256) |
| `Sum` | `jc *JobChildrenSummary` | `` | `int` | [L1284](file:///d:/claude/nomad/api/jobs.go#L1284) |
| `Len` | `j *JobIDSort` | `` | `int` | [L1330](file:///d:/claude/nomad/api/jobs.go#L1330) |
| `Less` | `j *JobIDSort` | `a int, b int` | `bool` | [L1334](file:///d:/claude/nomad/api/jobs.go#L1334) |
| `Swap` | `j *JobIDSort` | `a int, b int` | `` | [L1338](file:///d:/claude/nomad/api/jobs.go#L1338) |
| `NewServiceJob` | - | `id string, name string, region string, pri int` | `*Job` | [L1345](file:///d:/claude/nomad/api/jobs.go#L1345) |
| `NewBatchJob` | - | `id string, name string, region string, pri int` | `*Job` | [L1352](file:///d:/claude/nomad/api/jobs.go#L1352) |
| `NewSystemJob` | - | `id string, name string, region string, pri int` | `*Job` | [L1359](file:///d:/claude/nomad/api/jobs.go#L1359) |
| `NewSysbatchJob` | - | `id string, name string, region string, pri int` | `*Job` | [L1366](file:///d:/claude/nomad/api/jobs.go#L1366) |
| `newJob` | - | `id string, name string, region string, typ string, pri int` | `*Job` | [L1371](file:///d:/claude/nomad/api/jobs.go#L1371) |
| `SetMeta` | `j *Job` | `key string, val string` | `*Job` | [L1382](file:///d:/claude/nomad/api/jobs.go#L1382) |
| `AddDatacenter` | `j *Job` | `dc string` | `*Job` | [L1391](file:///d:/claude/nomad/api/jobs.go#L1391) |
| `Constrain` | `j *Job` | `c *Constraint` | `*Job` | [L1397](file:///d:/claude/nomad/api/jobs.go#L1397) |
| `AddAffinity` | `j *Job` | `a *Affinity` | `*Job` | [L1403](file:///d:/claude/nomad/api/jobs.go#L1403) |
| `AddTaskGroup` | `j *Job` | `grp *TaskGroup` | `*Job` | [L1409](file:///d:/claude/nomad/api/jobs.go#L1409) |
| `AddPeriodicConfig` | `j *Job` | `cfg *PeriodicConfig` | `*Job` | [L1415](file:///d:/claude/nomad/api/jobs.go#L1415) |
| `AddSpread` | `j *Job` | `s *Spread` | `*Job` | [L1420](file:///d:/claude/nomad/api/jobs.go#L1420) |
| `GetScalingPoliciesPerTaskGroup` | `j *Job` | `` | `map[string]*ScalingPolicy` | [L1425](file:///d:/claude/nomad/api/jobs.go#L1425) |
| `ActionExec` | `j *Jobs` | `ctx context.Context, alloc *Allocation, job string, task string, tty bool, co...` | `exitCode int, err error` | [L1668](file:///d:/claude/nomad/api/jobs.go#L1668) |
| `TagVersionOpts` | `j *Jobs` | `jobID string, name string, req *TagVersionRequest, q *WriteOptions` | `*WriteMeta, error` | [L1710](file:///d:/claude/nomad/api/jobs.go#L1710) |
| `TagVersion` | `j *Jobs` | `jobID string, version uint64, name string, description string, q *WriteOptions` | `*WriteMeta, error` | [L1714](file:///d:/claude/nomad/api/jobs.go#L1714) |
| `UntagVersion` | `j *Jobs` | `jobID string, name string, q *WriteOptions` | `*WriteMeta, error` | [L1722](file:///d:/claude/nomad/api/jobs.go#L1722) |

## 5. 核心方法详解

### Validate()

**签名**：`func (j *Jobs) Validate(job *Job, q *WriteOptions) *JobValidateResponse, *WriteMeta, error`

**位置**：[L111](file:///d:/claude/nomad/api/jobs.go#L111)

**中文说明**：验证对象的有效性。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `job` | `*Job` | — |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*JobValidateResponse` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Register()

**签名**：`func (j *Jobs) Register(job *Job, q *WriteOptions) *JobRegisterResponse, *WriteMeta, error`

**位置**：[L134](file:///d:/claude/nomad/api/jobs.go#L134)

**中文说明**：注册对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `job` | `*Job` | — |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*JobRegisterResponse` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### List()

**签名**：`func (j *Jobs) List(q *QueryOptions) []*JobListStub, *QueryMeta, error`

**位置**：[L177](file:///d:/claude/nomad/api/jobs.go#L177)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*JobListStub` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Info()

**签名**：`func (j *Jobs) Info(jobID string, q *QueryOptions) *Job, *QueryMeta, error`

**位置**：[L208](file:///d:/claude/nomad/api/jobs.go#L208)

**中文说明**：返回对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `jobID` | `string` | 字符串 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Job` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Scale()

**签名**：`func (j *Jobs) Scale(jobID string, group string, count *int, message string, error bool, meta map[string]interface{}, q *WriteOptions) *JobRegisterResponse, *WriteMeta, error`

**位置**：[L218](file:///d:/claude/nomad/api/jobs.go#L218)

**中文说明**：扩缩容 用于 扩缩容 job.

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `jobID` | `string` | 字符串 |
| `group` | `string` | 字符串 |
| `count` | `*int` | 计数 |
| `message` | `string` | 消息 |
| `error` | `bool` | 错误信息 |
| `meta` | `map[string]interface{}` | 元数据 |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*JobRegisterResponse` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Deregister()

**签名**：`func (j *Jobs) Deregister(jobID string, purge bool, q *WriteOptions) string, *WriteMeta, error`

**位置**：[L398](file:///d:/claude/nomad/api/jobs.go#L398)

**中文说明**：注销对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `jobID` | `string` | 字符串 |
| `purge` | `bool` | 布尔值 |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `string` | 字符串 |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Plan()

**签名**：`func (j *Jobs) Plan(job *Job, diff bool, q *WriteOptions) *JobPlanResponse, *WriteMeta, error`

**位置**：[L495](file:///d:/claude/nomad/api/jobs.go#L495)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `job` | `*Job` | — |
| `diff` | `bool` | 布尔值 |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*JobPlanResponse` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Dispatch()

**签名**：`func (j *Jobs) Dispatch(jobID string, meta map[string]string, payload []byte, idPrefixTemplate string, q *WriteOptions) *JobDispatchResponse, *WriteMeta, error`

**位置**：[L543](file:///d:/claude/nomad/api/jobs.go#L543)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `jobID` | `string` | 字符串 |
| `meta` | `map[string]string` | 元数据 |
| `payload` | `[]byte` | 字节数组 |
| `idPrefixTemplate` | `string` | 字符串 |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*JobDispatchResponse` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Copy()

**签名**：`func (u *UpdateStrategy) Copy() *UpdateStrategy`

**位置**：[L651](file:///d:/claude/nomad/api/jobs.go#L651)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*UpdateStrategy` | — |

### Copy()

**签名**：`func (m *Multiregion) Copy() *Multiregion`

**位置**：[L859](file:///d:/claude/nomad/api/jobs.go#L859)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Multiregion` | — |

### Copy()

**签名**：`func (j *JobUIConfig) Copy() *JobUIConfig`

**位置**：[L1030](file:///d:/claude/nomad/api/jobs.go#L1030)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*JobUIConfig` | — |

### Copy()

**签名**：`func (j *JobUILink) Copy() *JobUILink`

**位置**：[L1045](file:///d:/claude/nomad/api/jobs.go#L1045)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*JobUILink` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `maps` | 标准库 |
| `net/url` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/cronexpr` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [jobs_test.go](file:///d:/claude/nomad/api/jobs_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

