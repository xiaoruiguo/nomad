# jobs.go 代码说明文档

> 文件路径：[jobs.go](file:///d:/claude/nomad/api/jobs.go)
> 总行数：1725 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **作业（Job）API 客户端**，提供作业提交、查询、修改、停止、验证、计划、调度等操作的客户端方法，是 Nomad API 最核心的客户端之一。

## 2. 类型定义

### Jobs

**定义位置**：[L68](file:///d:/claude/nomad/api/jobs.go#L68)

**类型**：struct

```go
	client *Client
```

**关联方法**（38 个）：`ParseHCL`, `ParseHCLOpts`, `Validate`, `Register`, `EnforceRegister`, `RegisterOpts`, `List`, `ListOptions`, `PrefixList`, `Info`, `Scale`, `ScaleWithRequest`, `ScaleStatus`, `Versions`, `VersionByTag`, `VersionsOpts`, `Submission`, `Allocations`, `Deployments`, `LatestDeployment`, `Evaluations`, `Deregister`, `DeregisterOpts`, `ForceEvaluate`, `EvaluateWithOpts`, `PeriodicForce`, `Plan`, `PlanOpts`, `Summary`, `Dispatch`, `DispatchOpts`, `Revert`, `Stable`, `Services`, `ActionExec`, `TagVersionOpts`, `TagVersion`, `UntagVersion`

### JobsParseRequest

**定义位置**：[L73](file:///d:/claude/nomad/api/jobs.go#L73)

**类型**：struct

```go
	JobHCL string
	Variables string
	Canonicalize bool
```

### RegisterOptions

**定义位置**：[L122](file:///d:/claude/nomad/api/jobs.go#L122)

**类型**：struct

```go
	EnforceIndex bool
	ModifyIndex uint64
	PolicyOverride bool
	PreserveCounts bool
	PreserveResources bool
	EvalPriority int
	Submission *JobSubmission
```

### JobListFields

**定义位置**：[L169](file:///d:/claude/nomad/api/jobs.go#L169)

**类型**：struct

```go
	Meta bool
```

### JobListOptions

**定义位置**：[L172](file:///d:/claude/nomad/api/jobs.go#L172)

**类型**：struct

```go
	Fields *JobListFields
```

### VersionsOptions

**定义位置**：[L291](file:///d:/claude/nomad/api/jobs.go#L291)

**类型**：struct

```go
	Diffs bool
	DiffTag string
	DiffVersion *uint64
```

### DeregisterOptions

**定义位置**：[L408](file:///d:/claude/nomad/api/jobs.go#L408)

**类型**：struct

```go
	Purge bool
	Global bool
	EvalPriority int
	NoShutdownDelay bool
```

### PlanOptions

**定义位置**：[L490](file:///d:/claude/nomad/api/jobs.go#L490)

**类型**：struct

```go
	Diff bool
	PolicyOverride bool
```

### DispatchOptions

**定义位置**：[L535](file:///d:/claude/nomad/api/jobs.go#L535)

**类型**：struct

```go
	JobID string
	Meta map[string]string
	Payload []byte
	IdPrefixTemplate string
	Priority int
```

### periodicForceResponse

**定义位置**：[L618](file:///d:/claude/nomad/api/jobs.go#L618)

**类型**：struct

```go
	EvalID string
```

### UpdateStrategy

**定义位置**：[L623](file:///d:/claude/nomad/api/jobs.go#L623)

**类型**：struct

```go
	Stagger *time.Duration `mapstructure:"stagger" hcl:"stagger,optional"`
	MaxParallel *int `mapstructure:"max_parallel" hcl:"max_parallel,optional"`
	HealthCheck *string `mapstructure:"health_check" hcl:"health_check,optional"`
	MinHealthyTime *time.Duration `mapstructure:"min_healthy_time" hcl:"min_healthy_time,optional"`
	HealthyDeadline *time.Duration `mapstructure:"healthy_deadline" hcl:"healthy_deadline,optional"`
	ProgressDeadline *time.Duration `mapstructure:"progress_deadline" hcl:"progress_deadline,optional"`
	Canary *int `mapstructure:"canary" hcl:"canary,optional"`
	AutoRevert *bool `mapstructure:"auto_revert" hcl:"auto_revert,optional"`
	AutoPromote *bool `mapstructure:"auto_promote" hcl:"auto_promote,optional"`
```

**关联方法**（4 个）：`Copy`, `Merge`, `Canonicalize`, `Empty`

### Multiregion

**定义位置**：[L824](file:///d:/claude/nomad/api/jobs.go#L824)

**类型**：struct

```go
	Strategy *MultiregionStrategy `hcl:"strategy,block"`
	Regions []*MultiregionRegion `hcl:"region,block"`
```

**关联方法**（2 个）：`Canonicalize`, `Copy`

### MultiregionStrategy

**定义位置**：[L884](file:///d:/claude/nomad/api/jobs.go#L884)

**类型**：struct

```go
	MaxParallel *int `mapstructure:"max_parallel" hcl:"max_parallel,optional"`
	OnFailure *string `mapstructure:"on_failure" hcl:"on_failure,optional"`
```

### MultiregionRegion

**定义位置**：[L889](file:///d:/claude/nomad/api/jobs.go#L889)

**类型**：struct

```go
	Name string `hcl:",label"`
	Count *int `hcl:"count,optional"`
	Datacenters []string `hcl:"datacenters,optional"`
	NodePool string `hcl:"node_pool,optional"`
	Meta map[string]string `hcl:"meta,block"`
```

### PeriodicConfig

**定义位置**：[L898](file:///d:/claude/nomad/api/jobs.go#L898)

**类型**：struct

```go
	Enabled *bool `hcl:"enabled,optional"`
	Spec *string `hcl:"cron,optional"`
	Specs []string `hcl:"crons,optional"`
	SpecType *string
	ProhibitOverlap *bool `mapstructure:"prohibit_overlap" hcl:"prohibit_overlap,optional"`
	TimeZone *string `mapstructure:"time_zone" hcl:"time_zone,optional"`
```

**关联方法**（3 个）：`Canonicalize`, `Next`, `GetLocation`

### ParameterizedJobConfig

**定义位置**：[L981](file:///d:/claude/nomad/api/jobs.go#L981)

**类型**：struct

```go
	Payload string `hcl:"payload,optional"`
	MetaRequired []string `mapstructure:"meta_required" hcl:"meta_required,optional"`
	MetaOptional []string `mapstructure:"meta_optional" hcl:"meta_optional,optional"`
```

### JobSubmission

**定义位置**：[L992](file:///d:/claude/nomad/api/jobs.go#L992)

**类型**：struct

```go
	Source string
	Format string
	VariableFlags map[string]string
	Variables string
```

**关联方法**（2 个）：`Canonicalize`, `Copy`

### JobUIConfig

**定义位置**：[L1010](file:///d:/claude/nomad/api/jobs.go#L1010)

**类型**：struct

```go
	Description string `hcl:"description,optional"`
	Links []*JobUILink `hcl:"link,block"`
```

**关联方法**（2 个）：`Canonicalize`, `Copy`

### JobUILink

**定义位置**：[L1015](file:///d:/claude/nomad/api/jobs.go#L1015)

**类型**：struct

```go
	Label string `hcl:"label,optional"`
	URL string `hcl:"url,optional"`
```

**关联方法**（1 个）：`Copy`

### JobVersionTag

**定义位置**：[L1056](file:///d:/claude/nomad/api/jobs.go#L1056)

**类型**：struct

```go
	Name string
	Description string
	TaggedTime int64
```

**关联方法**（1 个）：`Copy`

### Job

**定义位置**：[L1105](file:///d:/claude/nomad/api/jobs.go#L1105)

**类型**：struct

```go
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
```

**关联方法**（13 个）：`IsPeriodic`, `IsParameterized`, `IsMultiregion`, `Canonicalize`, `LookupTaskGroup`, `SetMeta`, `AddDatacenter`, `Constrain`, `AddAffinity`, `AddTaskGroup`, `AddPeriodicConfig`, `AddSpread`, `GetScalingPoliciesPerTaskGroup`

### JobSummary

**定义位置**：[L1266](file:///d:/claude/nomad/api/jobs.go#L1266)

**类型**：struct

```go
	JobID string
	Namespace string
	Summary map[string]TaskGroupSummary
	Children *JobChildrenSummary
	CreateIndex uint64
	ModifyIndex uint64
```

### JobChildrenSummary

**定义位置**：[L1278](file:///d:/claude/nomad/api/jobs.go#L1278)

**类型**：struct

```go
	Pending int64
	Running int64
	Dead int64
```

**关联方法**（1 个）：`Sum`

### TaskGroupSummary

**定义位置**：[L1294](file:///d:/claude/nomad/api/jobs.go#L1294)

**类型**：struct

```go
	Queued int
	Complete int
	Failed int
	Running int
	Starting int
	Lost int
	Unknown int
```

### JobListStub

**定义位置**：[L1306](file:///d:/claude/nomad/api/jobs.go#L1306)

**类型**：struct

```go
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
```

### JobIDSort

**定义位置**：[L1328](file:///d:/claude/nomad/api/jobs.go#L1328)

**类型定义**：`[]*JobListStub`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### WriteRequest

**定义位置**：[L1434](file:///d:/claude/nomad/api/jobs.go#L1434)

**类型**：struct

```go
	Region string
	Namespace string
	SecretID string
```

### JobValidateRequest

**定义位置**：[L1446](file:///d:/claude/nomad/api/jobs.go#L1446)

**类型**：struct

```go
	Job *Job
	WriteRequest
```

### JobValidateResponse

**定义位置**：[L1452](file:///d:/claude/nomad/api/jobs.go#L1452)

**类型**：struct

```go
	DriverConfigValidated bool
	ValidationErrors []string
	Error string
	Warnings string
```

### JobRevertRequest

**定义位置**：[L1469](file:///d:/claude/nomad/api/jobs.go#L1469)

**类型**：struct

```go
	JobID string
	JobVersion uint64
	EnforcePriorVersion *uint64
	WriteRequest
```

### JobRegisterRequest

**定义位置**：[L1484](file:///d:/claude/nomad/api/jobs.go#L1484)

**类型**：struct

```go
	Submission *JobSubmission
	Job *Job
	EnforceIndex bool `json:",omitempty"`
	JobModifyIndex uint64 `json:",omitempty"`
	PolicyOverride bool `json:",omitempty"`
	PreserveCounts bool `json:",omitempty"`
	PreserveResources bool `json:",omitempty"`
	EvalPriority int `json:",omitempty"`
	WriteRequest
```

### JobRegisterResponse

**定义位置**：[L1509](file:///d:/claude/nomad/api/jobs.go#L1509)

**类型**：struct

```go
	EvalID string
	EvalCreateIndex uint64
	JobModifyIndex uint64
	Warnings string
	QueryMeta
```

### JobDeregisterResponse

**定义位置**：[L1522](file:///d:/claude/nomad/api/jobs.go#L1522)

**类型**：struct

```go
	EvalID string
	EvalCreateIndex uint64
	JobModifyIndex uint64
	QueryMeta
```

### JobPlanRequest

**定义位置**：[L1529](file:///d:/claude/nomad/api/jobs.go#L1529)

**类型**：struct

```go
	Job *Job
	Diff bool
	PolicyOverride bool
	WriteRequest
```

### JobPlanResponse

**定义位置**：[L1536](file:///d:/claude/nomad/api/jobs.go#L1536)

**类型**：struct

```go
	JobModifyIndex uint64
	CreatedEvals []*Evaluation
	Diff *JobDiff
	Annotations *PlanAnnotations
	FailedTGAllocs map[string]*AllocationMetric
	NextPeriodicLaunch time.Time
	Warnings string
```

### JobDiff

**定义位置**：[L1549](file:///d:/claude/nomad/api/jobs.go#L1549)

**类型**：struct

```go
	Type string
	ID string
	Fields []*FieldDiff
	Objects []*ObjectDiff
	TaskGroups []*TaskGroupDiff
```

### TaskGroupDiff

**定义位置**：[L1557](file:///d:/claude/nomad/api/jobs.go#L1557)

**类型**：struct

```go
	Type string
	Name string
	Fields []*FieldDiff
	Objects []*ObjectDiff
	Tasks []*TaskDiff
	Updates map[string]uint64
```

### TaskDiff

**定义位置**：[L1566](file:///d:/claude/nomad/api/jobs.go#L1566)

**类型**：struct

```go
	Type string
	Name string
	Fields []*FieldDiff
	Objects []*ObjectDiff
	Annotations []string
```

### FieldDiff

**定义位置**：[L1574](file:///d:/claude/nomad/api/jobs.go#L1574)

**类型**：struct

```go
	Type string
	Name string
	Old, New string
	Annotations []string
```

### ObjectDiff

**定义位置**：[L1581](file:///d:/claude/nomad/api/jobs.go#L1581)

**类型**：struct

```go
	Type string
	Name string
	Fields []*FieldDiff
	Objects []*ObjectDiff
```

### PlanAnnotations

**定义位置**：[L1588](file:///d:/claude/nomad/api/jobs.go#L1588)

**类型**：struct

```go
	DesiredTGUpdates map[string]*DesiredUpdates
	PreemptedAllocs []*AllocationListStub
```

### DesiredUpdates

**定义位置**：[L1593](file:///d:/claude/nomad/api/jobs.go#L1593)

**类型**：struct

```go
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
```

### JobDispatchRequest

**定义位置**：[L1608](file:///d:/claude/nomad/api/jobs.go#L1608)

**类型**：struct

```go
	JobID string
	Payload []byte
	Meta map[string]string
	IdPrefixTemplate string
	Priority int
```

### JobDispatchResponse

**定义位置**：[L1616](file:///d:/claude/nomad/api/jobs.go#L1616)

**类型**：struct

```go
	DispatchedJobID string
	EvalID string
	EvalCreateIndex uint64
	JobCreateIndex uint64
	WriteMeta
```

### JobVersionsResponse

**定义位置**：[L1625](file:///d:/claude/nomad/api/jobs.go#L1625)

**类型**：struct

```go
	Versions []*Job
	Diffs []*JobDiff
	QueryMeta
```

### JobSubmissionResponse

**定义位置**：[L1632](file:///d:/claude/nomad/api/jobs.go#L1632)

**类型**：struct

```go
	Submission *JobSubmission
	QueryMeta
```

### JobStabilityRequest

**定义位置**：[L1638](file:///d:/claude/nomad/api/jobs.go#L1638)

**类型**：struct

```go
	JobID string
	JobVersion uint64
	Stable bool
	WriteRequest
```

### JobStabilityResponse

**定义位置**：[L1649](file:///d:/claude/nomad/api/jobs.go#L1649)

**类型**：struct

```go
	JobModifyIndex uint64
	WriteMeta
```

### JobEvaluateRequest

**定义位置**：[L1655](file:///d:/claude/nomad/api/jobs.go#L1655)

**类型**：struct

```go
	JobID string
	EvalOptions EvalOptions
	WriteRequest
```

### EvalOptions

**定义位置**：[L1662](file:///d:/claude/nomad/api/jobs.go#L1662)

**类型**：struct

```go
	ForceReschedule bool
```

### JobStatusesRequest

**定义位置**：[L1696](file:///d:/claude/nomad/api/jobs.go#L1696)

**类型**：struct

```go
	Jobs []NamespacedID
	IncludeChildren bool
```

### TagVersionRequest

**定义位置**：[L1703](file:///d:/claude/nomad/api/jobs.go#L1703)

**类型**：struct

```go
	Version uint64
	Latest bool
	Description string
	WriteRequest
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `JobTypeService` | `"service"` |
| `JobTypeBatch` | `"batch"` |
| `JobTypeSystem` | `"system"` |
| `JobTypeSysbatch` | `"sysbatch"` |
| `JobDefaultPriority` | `50` |
| `PeriodicSpecCron` | `"cron"` |
| `DefaultNamespace` | `"default"` |
| `GlobalRegion` | `"global"` |
| `RegisterEnforceIndexErrPrefix` | `"Enforcing job modify index"` |
| `JobPeriodicLaunchSuffix` | `"/periodic-"` |
| `JobDispatchLaunchSuffix` | `"/dispatch-"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Jobs` | `c *Client` | - | `*Jobs` | [L88](file:///d:/claude/nomad/api/jobs.go#L88) |
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
| `Scale` | `j *Jobs` | `jobID string, group string, count *int, message string, error bool, meta map...` | `*JobRegisterResponse, *WriteMeta, error` | [L218](file:///d:/claude/nomad/api/jobs.go#L218) |
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
| `Dispatch` | `j *Jobs` | `jobID string, meta map[string]string, payload []byte, idPrefixTemplate strin...` | `*JobDispatchResponse, *WriteMeta, error` | [L543](file:///d:/claude/nomad/api/jobs.go#L543) |
| `DispatchOpts` | `j *Jobs` | `opts *DispatchOptions, q *WriteOptions` | `*JobDispatchResponse, *WriteMeta, error` | [L557](file:///d:/claude/nomad/api/jobs.go#L557) |
| `Revert` | `j *Jobs` | `jobID string, version uint64, enforcePriorVersion *uint64, q *WriteOptions, ...` | `*JobRegisterResponse, *WriteMeta, error` | [L576](file:///d:/claude/nomad/api/jobs.go#L576) |
| `Stable` | `j *Jobs` | `jobID string, version uint64, stable bool, q *WriteOptions` | `*JobStabilityResponse, *WriteMeta, error` | [L593](file:///d:/claude/nomad/api/jobs.go#L593) |
| `Services` | `j *Jobs` | `jobID string, q *QueryOptions` | `[]*ServiceRegistration, *QueryMeta, error` | [L611](file:///d:/claude/nomad/api/jobs.go#L611) |
| `DefaultUpdateStrategy` | - | - | `*UpdateStrategy` | [L637](file:///d:/claude/nomad/api/jobs.go#L637) |
| `Copy` | `u *UpdateStrategy` | - | `*UpdateStrategy` | [L651](file:///d:/claude/nomad/api/jobs.go#L651) |
| `Merge` | `u *UpdateStrategy` | `o *UpdateStrategy` | - | [L697](file:///d:/claude/nomad/api/jobs.go#L697) |
| `Canonicalize` | `u *UpdateStrategy` | - | - | [L739](file:///d:/claude/nomad/api/jobs.go#L739) |
| `Empty` | `u *UpdateStrategy` | - | `bool` | [L780](file:///d:/claude/nomad/api/jobs.go#L780) |
| `Canonicalize` | `m *Multiregion` | - | - | [L829](file:///d:/claude/nomad/api/jobs.go#L829) |
| `Copy` | `m *Multiregion` | - | `*Multiregion` | [L859](file:///d:/claude/nomad/api/jobs.go#L859) |
| `Canonicalize` | `p *PeriodicConfig` | - | - | [L907](file:///d:/claude/nomad/api/jobs.go#L907) |
| `Next` | `p *PeriodicConfig` | `fromTime time.Time` | `time.Time, error` | [L932](file:///d:/claude/nomad/api/jobs.go#L932) |
| `cronParseNext` | - | `fromTime time.Time, spec string` | `t time.Time, err error` | [L958](file:///d:/claude/nomad/api/jobs.go#L958) |
| `GetLocation` | `p *PeriodicConfig` | - | `*time.Location, error` | [L972](file:///d:/claude/nomad/api/jobs.go#L972) |
| `Canonicalize` | `j *JobUIConfig` | - | - | [L1020](file:///d:/claude/nomad/api/jobs.go#L1020) |
| `Copy` | `j *JobUIConfig` | - | `*JobUIConfig` | [L1030](file:///d:/claude/nomad/api/jobs.go#L1030) |
| `Copy` | `j *JobUILink` | - | `*JobUILink` | [L1045](file:///d:/claude/nomad/api/jobs.go#L1045) |
| `Copy` | `j *JobVersionTag` | - | `*JobVersionTag` | [L1062](file:///d:/claude/nomad/api/jobs.go#L1062) |
| `Canonicalize` | `js *JobSubmission` | - | - | [L1074](file:///d:/claude/nomad/api/jobs.go#L1074) |
| `Copy` | `js *JobSubmission` | - | `*JobSubmission` | [L1091](file:///d:/claude/nomad/api/jobs.go#L1091) |
| `IsPeriodic` | `j *Job` | - | `bool` | [L1152](file:///d:/claude/nomad/api/jobs.go#L1152) |
| `IsParameterized` | `j *Job` | - | `bool` | [L1157](file:///d:/claude/nomad/api/jobs.go#L1157) |
| `IsMultiregion` | `j *Job` | - | `bool` | [L1162](file:///d:/claude/nomad/api/jobs.go#L1162) |
| `Canonicalize` | `j *Job` | - | - | [L1166](file:///d:/claude/nomad/api/jobs.go#L1166) |
| `LookupTaskGroup` | `j *Job` | `name string` | `*TaskGroup` | [L1256](file:///d:/claude/nomad/api/jobs.go#L1256) |
| `Sum` | `jc *JobChildrenSummary` | - | `int` | [L1284](file:///d:/claude/nomad/api/jobs.go#L1284) |
| `Len` | `j *JobIDSort` | - | `int` | [L1330](file:///d:/claude/nomad/api/jobs.go#L1330) |
| `Less` | `j *JobIDSort` | `a int, b int` | `bool` | [L1334](file:///d:/claude/nomad/api/jobs.go#L1334) |
| `Swap` | `j *JobIDSort` | `a int, b int` | - | [L1338](file:///d:/claude/nomad/api/jobs.go#L1338) |
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
| `GetScalingPoliciesPerTaskGroup` | `j *Job` | - | `map[string]*ScalingPolicy` | [L1425](file:///d:/claude/nomad/api/jobs.go#L1425) |
| `ActionExec` | `j *Jobs` | `ctx context.Context, alloc *Allocation, job string, task string, tty bool, c...` | `exitCode int, err error` | [L1668](file:///d:/claude/nomad/api/jobs.go#L1668) |
| `TagVersionOpts` | `j *Jobs` | `jobID string, name string, req *TagVersionRequest, q *WriteOptions` | `*WriteMeta, error` | [L1710](file:///d:/claude/nomad/api/jobs.go#L1710) |
| `TagVersion` | `j *Jobs` | `jobID string, version uint64, name string, description string, q *WriteOptions` | `*WriteMeta, error` | [L1714](file:///d:/claude/nomad/api/jobs.go#L1714) |
| `UntagVersion` | `j *Jobs` | `jobID string, name string, q *WriteOptions` | `*WriteMeta, error` | [L1722](file:///d:/claude/nomad/api/jobs.go#L1722) |

## 5. 核心方法详解

### Validate()

**签名**：`func (j *Jobs) Validate(job *Job, q *WriteOptions) (*JobValidateResponse, *WriteMeta, error)`

**位置**：[L111](file:///d:/claude/nomad/api/jobs.go#L111)

**功能**：提交作业到 `/v1/validate` 端点进行验证，不实际注册。

**实现**：构造 `JobValidateRequest{Job: job}`，PUT 到 `/v1/validate`，返回 `JobValidateResponse`（含 `ValidationErrors`/`DriverConfigValidationErrors`/`Warnings`）。

---

### Register() / EnforceRegister() / RegisterOpts()

**位置**：[L134](file:///d:/claude/nomad/api/jobs.go#L134)、[L141](file:///d:/claude/nomad/api/jobs.go#L141)、[L150](file:///d:/claude/nomad/api/jobs.go#L150)

**功能**：注册或更新作业，触发评估。

**三个变体**：
- `Register(job, q)` — 基础注册，委托给 `RegisterOpts(job, nil, q)`
- `EnforceRegister(job, modifyIndex, q)` — 乐观并发控制，仅当作业当前 `ModifyIndex` 等于指定值时才注册
- `RegisterOpts(job, opts, q)` — 完整选项注册

**RegisterOpts 实现细节**：
1. 构造 `JobRegisterRequest{Job: job}`
2. 若 `opts.EnforceIndex == true`，设置 `req.EnforceIndex = true` 和 `req.JobModifyIndex = opts.ModifyIndex`
3. 复制 `PolicyOverride`/`PreserveCounts`/`PreserveResources`/`EvalPriority`/`Submission` 到请求
4. PUT 到 `/v1/jobs`，返回 `JobRegisterResponse{EvalID, Index, JobModifyIndex, Warnings}`

**EnforceIndex 用途**：防止并发修改丢失——如果两人同时编辑作业，后提交者会因 `ModifyIndex` 不匹配而失败。

---

### List() / ListOptions()

**位置**：[L177](file:///d:/claude/nomad/api/jobs.go#L177)、[L182](file:///d:/claude/nomad/api/jobs.go#L182)

**功能**：列出所有作业（返回精简的 `JobListStub`）。

**实现**：
- GET `/v1/jobs`
- `ListOptions` 支持通过 `Fields.Meta = true` 在 URL 添加 `?meta=true` 查询参数，控制是否返回作业元数据
- 支持分页（`QueryOptions.PerPage`/`NextToken`）和过滤（`QueryOptions.Filter`）

---

### Info()

**位置**：[L208](file:///d:/claude/nomad/api/jobs.go#L208)

**功能**：查询单个作业详情。

**实现**：GET `/v1/job/{jobID}`，返回完整 `Job` 对象。

---

### Scale() / ScaleWithRequest() / ScaleStatus()

**位置**：[L218](file:///d:/claude/nomad/api/jobs.go#L218)

**功能**：扩缩容作业的任务组。

**Scale 实现**：
1. 构造 `JobScaleRequest{JobID, TargetGroup, Count, Message, Error, Meta}`
2. POST 到 `/v1/job/{jobID}/scale`
3. 返回 `JobRegisterResponse`（含新 EvalID）

**count 参数语义**：`*int` 类型，`nil` 表示不改变计数，非 nil 表示设置新计数。

---

### Deregister() / DeregisterOpts()

**位置**：[L398](file:///d:/claude/nomad/api/jobs.go#L398)

**功能**：注销作业。

**实现**：DELETE `/v1/job/{jobID}?purge={purge}`，返回评估 ID。

**purge 参数**：`true` 立即从 Raft 日志中删除作业（跳过终止阶段），`false` 先优雅停止再删除。

---

### Plan() / PlanOpts()

**位置**：[L495](file:///d:/claude/nomad/api/jobs.go#L495)

**功能**：提交作业计划（dry-run），返回 Diff 和失败原因，不实际注册。

**实现**：POST `/v1/job/{jobID}/plan`，请求体含 `Job`/`Diff`/`PolicyOverride`。响应 `JobPlanResponse` 含 `Diff`（作业级差异）、`FailedTGAllocs`（分配失败统计）、`Annotations`。

---

### Dispatch()

**位置**：[L543](file:///d:/claude/nomad/api/jobs.go#L543)

**功能**：派生参数化作业实例。

**实现**：POST `/v1/job/{jobID}/dispatch`，请求体含 `Meta`（参数覆盖）/`Payload`（输入数据）。响应 `JobDispatchResponse` 含 `DispatchedJobID`（格式 `{jobID}/dispatch-{timestamp}`）。

---

### Revert() / Stable() / TagVersion()

**位置**：[L576](file:///d:/claude/nomad/api/jobs.go#L576)

**功能**：作业版本管理。

- `Revert(jobID, version, enforcePriorVersion, q)` — 回滚到指定版本
- `Stable(jobID, version, stable, q)` — 标记版本为稳定/不稳定
- `TagVersion(jobID, version, tag, q)` / `UntagVersion(jobID, tag, q)` — 为版本打标签/移除标签

---

### ParseHCL() / ParseHCLOpts()

**位置**：[L73](file:///d:/claude/nomad/api/jobs.go#L73)

**功能**：将 HCL 作业规格解析为 `Job` 对象。

**实现**：POST `/v1/jobs/parse`，请求体 `JobsParseRequest{JobHCL, Variables, Canonicalize}`，响应为 JSON 格式的 `Job`。

---

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

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [jobs_test.go](file:///d:/claude/nomad/api/jobs_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

