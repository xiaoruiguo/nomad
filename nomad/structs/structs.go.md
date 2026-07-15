# structs.go 代码说明文档

> 文件路径：[structs/structs.go](file:///d:/claude/nomad/nomad/structs/structs.go)
> 总行数：10939 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### MessageType

**定义位置**：[L62](file:///d:/claude/nomad/nomad/structs/structs.go#L62)

**类型定义**：`uint8`

### NamespacedID

**定义位置**：[L233](file:///d:/claude/nomad/nomad/structs/structs.go#L233)

**类型**：struct

```go
	ID string
	Namespace string
```

**关联方法**（1 个）：`String`

### RPCInfo

**定义位置**：[L251](file:///d:/claude/nomad/nomad/structs/structs.go#L251)

**类型**：interface

```go
	RequestRegion
	IsRead
	AllowStaleRead
	IsForwarded
	SetForwarded
	TimeToBlock
	SetTimeToBlock
```

### InternalRpcInfo

**定义位置**：[L266](file:///d:/claude/nomad/nomad/structs/structs.go#L266)

**类型**：struct

```go
	Forwarded bool
```

**关联方法**（2 个）：`IsForwarded`, `SetForwarded`

### QueryOptions

**定义位置**：[L282](file:///d:/claude/nomad/nomad/structs/structs.go#L282)

**类型**：struct

```go
	Region string
	Namespace string
	MinQueryIndex uint64
	MaxQueryTime time.Duration
	AllowStale bool
	Prefix string
	AuthToken string
	Filter string
	PerPage int32
	NextToken string
	Reverse bool
	identity *AuthenticatedIdentity
	InternalRpcInfo
```

**关联方法**（9 个）：`TimeToBlock`, `SetTimeToBlock`, `RequestRegion`, `RequestNamespace`, `IsRead`, `AllowStaleRead`, `GetAuthToken`, `SetIdentity`, `GetIdentity`

### AgentPprofRequest

**定义位置**：[L392](file:///d:/claude/nomad/nomad/structs/structs.go#L392)

**类型**：struct

```go
	ReqType pprof.ReqType
	Profile string
	Seconds int
	Debug int
	GC int
	NodeID string
	ServerID string
	QueryOptions
```

### AgentPprofResponse

**定义位置**：[L419](file:///d:/claude/nomad/nomad/structs/structs.go#L419)

**类型**：struct

```go
	AgentID string
	Payload []byte
	HTTPHeaders map[string]string
```

### WriteRequest

**定义位置**：[L431](file:///d:/claude/nomad/nomad/structs/structs.go#L431)

**类型**：struct

```go
	Region string
	Namespace string
	AuthToken string
	IdempotencyToken string
	identity *AuthenticatedIdentity
	InternalRpcInfo
```

**关联方法**（9 个）：`TimeToBlock`, `SetTimeToBlock`, `RequestRegion`, `RequestNamespace`, `IsRead`, `AllowStaleRead`, `GetAuthToken`, `SetIdentity`, `GetIdentity`

### AuthenticatedIdentity

**定义位置**：[L509](file:///d:/claude/nomad/nomad/structs/structs.go#L509)

**类型**：struct

```go
	ACLToken *ACLToken
	Claims *IdentityClaims
	ClientID string
	TLSName string
	RemoteIP net.IP
```

**关联方法**（4 个）：`GetACLToken`, `GetClaims`, `String`, `IsExpired`

### RequestWithIdentity

**定义位置**：[L577](file:///d:/claude/nomad/nomad/structs/structs.go#L577)

**类型**：interface

```go
	GetAuthToken
	SetIdentity
	GetIdentity
```

### QueryMeta

**定义位置**：[L585](file:///d:/claude/nomad/nomad/structs/structs.go#L585)

**类型**：struct

```go
	Index uint64
	LastContact time.Duration
	KnownLeader bool
	NextToken string
```

### WriteMeta

**定义位置**：[L605](file:///d:/claude/nomad/nomad/structs/structs.go#L605)

**类型**：struct

```go
	Index uint64
```

### NodeDeregisterRequest

**定义位置**：[L612](file:///d:/claude/nomad/nomad/structs/structs.go#L612)

**类型**：struct

```go
	NodeID string
	WriteRequest
```

### NodeBatchDeregisterRequest

**定义位置**：[L619](file:///d:/claude/nomad/nomad/structs/structs.go#L619)

**类型**：struct

```go
	NodeIDs []string
	WriteRequest
```

### NodeServerInfo

**定义位置**：[L626](file:///d:/claude/nomad/nomad/structs/structs.go#L626)

**类型**：struct

```go
	RPCAdvertiseAddr string
	RPCMajorVersion int32
	RPCMinorVersion int32
	Datacenter string
```

### NodeUpdateDrainRequest

**定义位置**：[L644](file:///d:/claude/nomad/nomad/structs/structs.go#L644)

**类型**：struct

```go
	NodeID string
	DrainStrategy *DrainStrategy
	MarkEligible bool
	NodeEvent *NodeEvent
	UpdatedAt int64
	Meta map[string]string
	UpdatedBy string
	WriteRequest
```

### BatchNodeUpdateDrainRequest

**定义位置**：[L669](file:///d:/claude/nomad/nomad/structs/structs.go#L669)

**类型**：struct

```go
	Updates map[string]*DrainUpdate
	NodeEvents map[string]*NodeEvent
	UpdatedAt int64
	WriteRequest
```

### DrainUpdate

**定义位置**：[L683](file:///d:/claude/nomad/nomad/structs/structs.go#L683)

**类型**：struct

```go
	DrainStrategy *DrainStrategy
	MarkEligible bool
```

### NodeUpdateEligibilityRequest

**定义位置**：[L692](file:///d:/claude/nomad/nomad/structs/structs.go#L692)

**类型**：struct

```go
	NodeID string
	Eligibility string
	NodeEvent *NodeEvent
	UpdatedAt int64
	WriteRequest
```

### NodeEvaluateRequest

**定义位置**：[L706](file:///d:/claude/nomad/nomad/structs/structs.go#L706)

**类型**：struct

```go
	NodeID string
	WriteRequest
```

### NodeSpecificRequest

**定义位置**：[L712](file:///d:/claude/nomad/nomad/structs/structs.go#L712)

**类型**：struct

```go
	NodeID string
	SecretID string
	QueryOptions
```

### JobRegisterRequest

**定义位置**：[L720](file:///d:/claude/nomad/nomad/structs/structs.go#L720)

**类型**：struct

```go
	Submission *JobSubmission
	Job *Job
	EnforceIndex bool
	JobModifyIndex uint64
	PreserveCounts bool
	PreserveResources bool
	PolicyOverride bool
	EvalPriority int
	Eval *Evaluation
	Deployment *Deployment
	WriteRequest
```

### JobDeregisterRequest

**定义位置**：[L765](file:///d:/claude/nomad/nomad/structs/structs.go#L765)

**类型**：struct

```go
	JobID string
	Purge bool
	Global bool
	EvalPriority int
	NoShutdownDelay bool
	Eval *Evaluation
	SubmitTime int64
	WriteRequest
```

### JobEvaluateRequest

**定义位置**：[L799](file:///d:/claude/nomad/nomad/structs/structs.go#L799)

**类型**：struct

```go
	JobID string
	EvalOptions EvalOptions
	WriteRequest
```

### EvalOptions

**定义位置**：[L806](file:///d:/claude/nomad/nomad/structs/structs.go#L806)

**类型**：struct

```go
	ForceReschedule bool
```

### JobSubmissionRequest

**定义位置**：[L812](file:///d:/claude/nomad/nomad/structs/structs.go#L812)

**类型**：struct

```go
	JobID string
	Version uint64
	QueryOptions
```

### JobSubmissionResponse

**定义位置**：[L821](file:///d:/claude/nomad/nomad/structs/structs.go#L821)

**类型**：struct

```go
	Submission *JobSubmission
	QueryMeta
```

### JobSpecificRequest

**定义位置**：[L828](file:///d:/claude/nomad/nomad/structs/structs.go#L828)

**类型**：struct

```go
	JobID string
	All bool
	QueryOptions
```

### JobListRequest

**定义位置**：[L835](file:///d:/claude/nomad/nomad/structs/structs.go#L835)

**类型**：struct

```go
	QueryOptions
	Fields *JobStubFields
```

### JobStubFields

**定义位置**：[L841](file:///d:/claude/nomad/nomad/structs/structs.go#L841)

**类型**：struct

```go
	Meta bool
```

### JobPlanRequest

**定义位置**：[L847](file:///d:/claude/nomad/nomad/structs/structs.go#L847)

**类型**：struct

```go
	Job *Job
	Diff bool
	PolicyOverride bool
	WriteRequest
```

### JobScaleRequest

**定义位置**：[L857](file:///d:/claude/nomad/nomad/structs/structs.go#L857)

**类型**：struct

```go
	JobID string
	Target map[string]string
	Count *int64
	Message string
	Error bool
	Meta map[string]interface{}
	PolicyOverride bool
	EnforceIndex bool
	JobModifyIndex uint64
	WriteRequest
```

**关联方法**（1 个）：`Validate`

### JobSummaryRequest

**定义位置**：[L914](file:///d:/claude/nomad/nomad/structs/structs.go#L914)

**类型**：struct

```go
	JobID string
	QueryOptions
```

### JobScaleStatusRequest

**定义位置**：[L920](file:///d:/claude/nomad/nomad/structs/structs.go#L920)

**类型**：struct

```go
	JobID string
	QueryOptions
```

### JobDispatchRequest

**定义位置**：[L926](file:///d:/claude/nomad/nomad/structs/structs.go#L926)

**类型**：struct

```go
	JobID string
	Payload []byte
	Meta map[string]string
	WriteRequest
	IdPrefixTemplate string
	Priority int
```

### JobValidateRequest

**定义位置**：[L936](file:///d:/claude/nomad/nomad/structs/structs.go#L936)

**类型**：struct

```go
	Job *Job
	WriteRequest
```

### JobRevertRequest

**定义位置**：[L942](file:///d:/claude/nomad/nomad/structs/structs.go#L942)

**类型**：struct

```go
	JobID string
	JobVersion uint64
	EnforcePriorVersion *uint64
	WriteRequest
```

### JobStabilityRequest

**定义位置**：[L957](file:///d:/claude/nomad/nomad/structs/structs.go#L957)

**类型**：struct

```go
	JobID string
	JobVersion uint64
	Stable bool
	WriteRequest
```

### JobStabilityResponse

**定义位置**：[L968](file:///d:/claude/nomad/nomad/structs/structs.go#L968)

**类型**：struct

```go
	WriteMeta
```

### NodeListRequest

**定义位置**：[L973](file:///d:/claude/nomad/nomad/structs/structs.go#L973)

**类型**：struct

```go
	QueryOptions
	Fields *NodeStubFields
```

### EvalUpdateRequest

**定义位置**：[L980](file:///d:/claude/nomad/nomad/structs/structs.go#L980)

**类型**：struct

```go
	Evals []*Evaluation
	EvalToken string
	WriteRequest
```

### EvalReapRequest

**定义位置**：[L991](file:///d:/claude/nomad/nomad/structs/structs.go#L991)

**类型**：struct

```go
	Evals []string
	Allocs []string
	Filter string
	PerPage int32
	NextToken string
	UserInitiated bool
	WriteRequest
```

### EvalSpecificRequest

**定义位置**：[L1010](file:///d:/claude/nomad/nomad/structs/structs.go#L1010)

**类型**：struct

```go
	EvalID string
	IncludeRelated bool
	QueryOptions
```

### EvalAckRequest

**定义位置**：[L1017](file:///d:/claude/nomad/nomad/structs/structs.go#L1017)

**类型**：struct

```go
	EvalID string
	Token string
	WriteRequest
```

### EvalDequeueRequest

**定义位置**：[L1024](file:///d:/claude/nomad/nomad/structs/structs.go#L1024)

**类型**：struct

```go
	Schedulers []string
	Timeout time.Duration
	SchedulerVersion uint16
	WriteRequest
```

### EvalListRequest

**定义位置**：[L1032](file:///d:/claude/nomad/nomad/structs/structs.go#L1032)

**类型**：struct

```go
	FilterJobID string
	FilterEvalStatus string
	QueryOptions
```

**关联方法**（1 个）：`ShouldBeFiltered`

### EvalCountRequest

**定义位置**：[L1051](file:///d:/claude/nomad/nomad/structs/structs.go#L1051)

**类型**：struct

```go
	QueryOptions
```

### PlanRequest

**定义位置**：[L1056](file:///d:/claude/nomad/nomad/structs/structs.go#L1056)

**类型**：struct

```go
	Plan *Plan
	WriteRequest
```

### ApplyPlanResultsRequest

**定义位置**：[L1064](file:///d:/claude/nomad/nomad/structs/structs.go#L1064)

**类型**：struct

```go
	AllocsStopped []*AllocationDiff
	AllocsUpdated []*Allocation
	Evals []*Evaluation
	Job *Job
	Deployment *Deployment
	DeploymentUpdates []*DeploymentStatusUpdate
	EvalID string
	AllocsPreempted []*AllocationDiff
	PreemptionEvals []*Evaluation
	IneligibleNodes []string
	UpdatedAt int64
```

### AllocUpdateRequest

**定义位置**：[L1114](file:///d:/claude/nomad/nomad/structs/structs.go#L1114)

**类型**：struct

```go
	Alloc []*Allocation
	Evals []*Evaluation
	WriteRequest
```

### AllocUpdateDesiredTransitionRequest

**定义位置**：[L1128](file:///d:/claude/nomad/nomad/structs/structs.go#L1128)

**类型**：struct

```go
	Allocs map[string]*DesiredTransition
	Evals []*Evaluation
	WriteRequest
```

### AllocStopRequest

**定义位置**：[L1140](file:///d:/claude/nomad/nomad/structs/structs.go#L1140)

**类型**：struct

```go
	AllocID string
	NoShutdownDelay bool
	Reschedule bool
	WriteRequest
```

### AllocStopResponse

**定义位置**：[L1149](file:///d:/claude/nomad/nomad/structs/structs.go#L1149)

**类型**：struct

```go
	EvalID string
	WriteMeta
```

### AllocListRequest

**定义位置**：[L1157](file:///d:/claude/nomad/nomad/structs/structs.go#L1157)

**类型**：struct

```go
	QueryOptions
	Fields *AllocStubFields
```

### AllocSpecificRequest

**定义位置**：[L1164](file:///d:/claude/nomad/nomad/structs/structs.go#L1164)

**类型**：struct

```go
	AllocID string
	QueryOptions
```

### AllocSignalRequest

**定义位置**：[L1170](file:///d:/claude/nomad/nomad/structs/structs.go#L1170)

**类型**：struct

```go
	AllocID string
	Task string
	Signal string
	QueryOptions
```

### AllocPauseRequest

**定义位置**：[L1178](file:///d:/claude/nomad/nomad/structs/structs.go#L1178)

**类型**：struct

```go
	AllocID string
	Task string
	ScheduleState TaskScheduleState
	QueryOptions
```

### AllocGetPauseStateRequest

**定义位置**：[L1186](file:///d:/claude/nomad/nomad/structs/structs.go#L1186)

**类型**：struct

```go
	AllocID string
	Task string
	QueryOptions
```

### AllocGetPauseStateResponse

**定义位置**：[L1193](file:///d:/claude/nomad/nomad/structs/structs.go#L1193)

**类型**：struct

```go
	ScheduleState TaskScheduleState
```

### AllocsGetRequest

**定义位置**：[L1198](file:///d:/claude/nomad/nomad/structs/structs.go#L1198)

**类型**：struct

```go
	AllocIDs []string
	QueryOptions
```

### AllocRestartRequest

**定义位置**：[L1204](file:///d:/claude/nomad/nomad/structs/structs.go#L1204)

**类型**：struct

```go
	AllocID string
	TaskName string
	AllTasks bool
	QueryOptions
```

### PeriodicForceRequest

**定义位置**：[L1213](file:///d:/claude/nomad/nomad/structs/structs.go#L1213)

**类型**：struct

```go
	JobID string
	WriteRequest
```

### ServerMembersResponse

**定义位置**：[L1219](file:///d:/claude/nomad/nomad/structs/structs.go#L1219)

**类型**：struct

```go
	ServerName string
	ServerRegion string
	ServerDC string
	Members []*ServerMember
```

### ServerMember

**定义位置**：[L1227](file:///d:/claude/nomad/nomad/structs/structs.go#L1227)

**类型**：struct

```go
	Name string
	Addr net.IP
	Port uint16
	Tags map[string]string
	Status string
	ProtocolMin uint8
	ProtocolMax uint8
	ProtocolCur uint8
	DelegateMin uint8
	DelegateMax uint8
	DelegateCur uint8
```

### ClusterMetadata

**定义位置**：[L1242](file:///d:/claude/nomad/nomad/structs/structs.go#L1242)

**类型**：struct

```go
	ClusterID string
	CreateTime int64
```

### VaultAccessor

**定义位置**：[L1252](file:///d:/claude/nomad/nomad/structs/structs.go#L1252)

**类型**：struct

```go
	AllocID string
	Task string
	NodeID string
	Accessor string
	CreationTTL int
	CreateIndex uint64
```

### GenericRequest

**定义位置**：[L1265](file:///d:/claude/nomad/nomad/structs/structs.go#L1265)

**类型**：struct

```go
	QueryOptions
```

### DeploymentListRequest

**定义位置**：[L1270](file:///d:/claude/nomad/nomad/structs/structs.go#L1270)

**类型**：struct

```go
	QueryOptions
```

### DeploymentDeleteRequest

**定义位置**：[L1275](file:///d:/claude/nomad/nomad/structs/structs.go#L1275)

**类型**：struct

```go
	Deployments []string
	WriteRequest
```

### DeploymentStatusUpdateRequest

**定义位置**：[L1282](file:///d:/claude/nomad/nomad/structs/structs.go#L1282)

**类型**：struct

```go
	Eval *Evaluation
	DeploymentUpdate *DeploymentStatusUpdate
	Job *Job
```

### DeploymentAllocHealthRequest

**定义位置**：[L1299](file:///d:/claude/nomad/nomad/structs/structs.go#L1299)

**类型**：struct

```go
	DeploymentID string
	HealthyAllocationIDs []string
	UnhealthyAllocationIDs []string
	WriteRequest
```

### ApplyDeploymentAllocHealthRequest

**定义位置**：[L1313](file:///d:/claude/nomad/nomad/structs/structs.go#L1313)

**类型**：struct

```go
	DeploymentAllocHealthRequest
	Timestamp time.Time
	DeploymentUpdate *DeploymentStatusUpdate
	Job *Job
	Eval *Evaluation
```

### DeploymentPromoteRequest

**定义位置**：[L1332](file:///d:/claude/nomad/nomad/structs/structs.go#L1332)

**类型**：struct

```go
	DeploymentID string
	All bool
	Groups []string
	PromotedAt int64
	WriteRequest
```

### ApplyDeploymentPromoteRequest

**定义位置**：[L1348](file:///d:/claude/nomad/nomad/structs/structs.go#L1348)

**类型**：struct

```go
	DeploymentPromoteRequest
	Eval *Evaluation
```

### DeploymentPauseRequest

**定义位置**：[L1356](file:///d:/claude/nomad/nomad/structs/structs.go#L1356)

**类型**：struct

```go
	DeploymentID string
	Pause bool
	WriteRequest
```

### DeploymentRunRequest

**定义位置**：[L1367](file:///d:/claude/nomad/nomad/structs/structs.go#L1367)

**类型**：struct

```go
	DeploymentID string
	WriteRequest
```

### DeploymentUnblockRequest

**定义位置**：[L1375](file:///d:/claude/nomad/nomad/structs/structs.go#L1375)

**类型**：struct

```go
	DeploymentID string
	WriteRequest
```

### DeploymentCancelRequest

**定义位置**：[L1383](file:///d:/claude/nomad/nomad/structs/structs.go#L1383)

**类型**：struct

```go
	DeploymentID string
	WriteRequest
```

### DeploymentSpecificRequest

**定义位置**：[L1391](file:///d:/claude/nomad/nomad/structs/structs.go#L1391)

**类型**：struct

```go
	DeploymentID string
	QueryOptions
```

### DeploymentFailRequest

**定义位置**：[L1397](file:///d:/claude/nomad/nomad/structs/structs.go#L1397)

**类型**：struct

```go
	DeploymentID string
	WriteRequest
```

### ScalingPolicySpecificRequest

**定义位置**：[L1403](file:///d:/claude/nomad/nomad/structs/structs.go#L1403)

**类型**：struct

```go
	ID string
	QueryOptions
```

### SingleScalingPolicyResponse

**定义位置**：[L1409](file:///d:/claude/nomad/nomad/structs/structs.go#L1409)

**类型**：struct

```go
	Policy *ScalingPolicy
	QueryMeta
```

### ScalingPolicyListRequest

**定义位置**：[L1415](file:///d:/claude/nomad/nomad/structs/structs.go#L1415)

**类型**：struct

```go
	Job string
	Type string
	QueryOptions
```

### ScalingPolicyListResponse

**定义位置**：[L1422](file:///d:/claude/nomad/nomad/structs/structs.go#L1422)

**类型**：struct

```go
	Policies []*ScalingPolicyListStub
	QueryMeta
```

### SingleDeploymentResponse

**定义位置**：[L1428](file:///d:/claude/nomad/nomad/structs/structs.go#L1428)

**类型**：struct

```go
	Deployment *Deployment
	QueryMeta
```

### GenericResponse

**定义位置**：[L1435](file:///d:/claude/nomad/nomad/structs/structs.go#L1435)

**类型**：struct

```go
	WriteMeta
```

### VersionResponse

**定义位置**：[L1440](file:///d:/claude/nomad/nomad/structs/structs.go#L1440)

**类型**：struct

```go
	Build string
	Versions map[string]int
	QueryMeta
```

### JobRegisterResponse

**定义位置**：[L1447](file:///d:/claude/nomad/nomad/structs/structs.go#L1447)

**类型**：struct

```go
	EvalID string
	EvalCreateIndex uint64
	JobModifyIndex uint64
	Warnings string
	QueryMeta
```

### JobDeregisterResponse

**定义位置**：[L1460](file:///d:/claude/nomad/nomad/structs/structs.go#L1460)

**类型**：struct

```go
	EvalID string
	EvalCreateIndex uint64
	JobModifyIndex uint64
	VolumeEvalID string
	VolumeEvalIndex uint64
	QueryMeta
```

### JobValidateResponse

**定义位置**：[L1470](file:///d:/claude/nomad/nomad/structs/structs.go#L1470)

**类型**：struct

```go
	DriverConfigValidated bool
	ValidationErrors []string
	Error string
	Warnings string
```

### NodeDrainUpdateResponse

**定义位置**：[L1487](file:///d:/claude/nomad/nomad/structs/structs.go#L1487)

**类型**：struct

```go
	NodeModifyIndex uint64
	EvalIDs []string
	EvalCreateIndex uint64
	WriteMeta
```

### NodeEligibilityUpdateResponse

**定义位置**：[L1495](file:///d:/claude/nomad/nomad/structs/structs.go#L1495)

**类型**：struct

```go
	NodeModifyIndex uint64
	EvalIDs []string
	EvalCreateIndex uint64
	WriteMeta
```

### NodeAllocsResponse

**定义位置**：[L1503](file:///d:/claude/nomad/nomad/structs/structs.go#L1503)

**类型**：struct

```go
	Allocs []*Allocation
	QueryMeta
```

### NodeClientAllocsResponse

**定义位置**：[L1509](file:///d:/claude/nomad/nomad/structs/structs.go#L1509)

**类型**：struct

```go
	Allocs map[string]uint64
	MigrateTokens map[string]string
	QueryMeta
```

### SingleNodeResponse

**定义位置**：[L1520](file:///d:/claude/nomad/nomad/structs/structs.go#L1520)

**类型**：struct

```go
	Node *Node
	QueryMeta
```

### NodeListResponse

**定义位置**：[L1526](file:///d:/claude/nomad/nomad/structs/structs.go#L1526)

**类型**：struct

```go
	Nodes []*NodeListStub
	QueryMeta
```

### SingleJobResponse

**定义位置**：[L1532](file:///d:/claude/nomad/nomad/structs/structs.go#L1532)

**类型**：struct

```go
	Job *Job
	QueryMeta
```

### JobSummaryResponse

**定义位置**：[L1538](file:///d:/claude/nomad/nomad/structs/structs.go#L1538)

**类型**：struct

```go
	JobSummary *JobSummary
	QueryMeta
```

### JobScaleStatusResponse

**定义位置**：[L1544](file:///d:/claude/nomad/nomad/structs/structs.go#L1544)

**类型**：struct

```go
	JobScaleStatus *JobScaleStatus
	QueryMeta
```

### JobScaleStatus

**定义位置**：[L1549](file:///d:/claude/nomad/nomad/structs/structs.go#L1549)

**类型**：struct

```go
	JobID string
	Namespace string
	JobCreateIndex uint64
	JobModifyIndex uint64
	JobStopped bool
	TaskGroups map[string]*TaskGroupScaleStatus
```

### TaskGroupScaleStatus

**定义位置**：[L1559](file:///d:/claude/nomad/nomad/structs/structs.go#L1559)

**类型**：struct

```go
	Desired int
	Placed int
	Running int
	Healthy int
	Unhealthy int
	Events []*ScalingEvent
```

### JobDispatchResponse

**定义位置**：[L1568](file:///d:/claude/nomad/nomad/structs/structs.go#L1568)

**类型**：struct

```go
	DispatchedJobID string
	EvalID string
	EvalCreateIndex uint64
	JobCreateIndex uint64
	WriteMeta
```

### JobListResponse

**定义位置**：[L1577](file:///d:/claude/nomad/nomad/structs/structs.go#L1577)

**类型**：struct

```go
	Jobs []*JobListStub
	QueryMeta
```

### JobVersionsRequest

**定义位置**：[L1583](file:///d:/claude/nomad/nomad/structs/structs.go#L1583)

**类型**：struct

```go
	JobID string
	Diffs bool
	DiffVersion *uint64
	DiffTagName string
	QueryOptions
```

### JobVersionsResponse

**定义位置**：[L1592](file:///d:/claude/nomad/nomad/structs/structs.go#L1592)

**类型**：struct

```go
	Versions []*Job
	Diffs []*JobDiff
	QueryMeta
```

### JobPlanResponse

**定义位置**：[L1599](file:///d:/claude/nomad/nomad/structs/structs.go#L1599)

**类型**：struct

```go
	Annotations *PlanAnnotations
	FailedTGAllocs map[string]*AllocMetric
	JobModifyIndex uint64
	CreatedEvals []*Evaluation
	Diff *JobDiff
	NextPeriodicLaunch time.Time
	Warnings string
	WriteMeta
```

### SingleAllocResponse

**定义位置**：[L1631](file:///d:/claude/nomad/nomad/structs/structs.go#L1631)

**类型**：struct

```go
	Alloc *Allocation
	QueryMeta
```

### AllocsGetResponse

**定义位置**：[L1638](file:///d:/claude/nomad/nomad/structs/structs.go#L1638)

**类型**：struct

```go
	Allocs []*Allocation
	SignedIdentities []SignedWorkloadIdentity
	QueryMeta
```

### JobAllocationsResponse

**定义位置**：[L1648](file:///d:/claude/nomad/nomad/structs/structs.go#L1648)

**类型**：struct

```go
	Allocations []*AllocListStub
	QueryMeta
```

### JobEvaluationsResponse

**定义位置**：[L1654](file:///d:/claude/nomad/nomad/structs/structs.go#L1654)

**类型**：struct

```go
	Evaluations []*Evaluation
	QueryMeta
```

### SingleEvalResponse

**定义位置**：[L1660](file:///d:/claude/nomad/nomad/structs/structs.go#L1660)

**类型**：struct

```go
	Eval *Evaluation
	QueryMeta
```

### EvalDequeueResponse

**定义位置**：[L1666](file:///d:/claude/nomad/nomad/structs/structs.go#L1666)

**类型**：struct

```go
	Eval *Evaluation
	Token string
	WaitIndex uint64
	QueryMeta
```

**关联方法**（1 个）：`GetWaitIndex`

### PlanResponse

**定义位置**：[L1693](file:///d:/claude/nomad/nomad/structs/structs.go#L1693)

**类型**：struct

```go
	Result *PlanResult
	WriteMeta
```

### AllocListResponse

**定义位置**：[L1699](file:///d:/claude/nomad/nomad/structs/structs.go#L1699)

**类型**：struct

```go
	Allocations []*AllocListStub
	QueryMeta
```

### DeploymentListResponse

**定义位置**：[L1705](file:///d:/claude/nomad/nomad/structs/structs.go#L1705)

**类型**：struct

```go
	Deployments []*Deployment
	QueryMeta
```

### EvalListResponse

**定义位置**：[L1711](file:///d:/claude/nomad/nomad/structs/structs.go#L1711)

**类型**：struct

```go
	Evaluations []*Evaluation
	QueryMeta
```

### EvalCountResponse

**定义位置**：[L1717](file:///d:/claude/nomad/nomad/structs/structs.go#L1717)

**类型**：struct

```go
	Count int
	QueryMeta
```

### EvalAllocationsResponse

**定义位置**：[L1723](file:///d:/claude/nomad/nomad/structs/structs.go#L1723)

**类型**：struct

```go
	Allocations []*AllocListStub
	QueryMeta
```

### PeriodicForceResponse

**定义位置**：[L1729](file:///d:/claude/nomad/nomad/structs/structs.go#L1729)

**类型**：struct

```go
	EvalID string
	EvalCreateIndex uint64
	WriteMeta
```

### DeploymentUpdateResponse

**定义位置**：[L1738](file:///d:/claude/nomad/nomad/structs/structs.go#L1738)

**类型**：struct

```go
	EvalID string
	EvalCreateIndex uint64
	DeploymentModifyIndex uint64
	RevertedJobVersion *uint64
	WriteMeta
```

### NodeConnQueryResponse

**定义位置**：[L1752](file:///d:/claude/nomad/nomad/structs/structs.go#L1752)

**类型**：struct

```go
	Connected bool
	Established time.Time
	QueryMeta
```

### HostDataRequest

**定义位置**：[L1764](file:///d:/claude/nomad/nomad/structs/structs.go#L1764)

**类型**：struct

```go
	ServerID string
	NodeID string
	QueryOptions
```

### HostDataResponse

**定义位置**：[L1771](file:///d:/claude/nomad/nomad/structs/structs.go#L1771)

**类型**：struct

```go
	AgentID string
	HostData *host.HostData
```

### EmitNodeEventsRequest

**定义位置**：[L1778](file:///d:/claude/nomad/nomad/structs/structs.go#L1778)

**类型**：struct

```go
	NodeEvents map[string][]*NodeEvent
	WriteRequest
```

### EmitNodeEventsResponse

**定义位置**：[L1788](file:///d:/claude/nomad/nomad/structs/structs.go#L1788)

**类型**：struct

```go
	WriteMeta
```

### NodeEvent

**定义位置**：[L1802](file:///d:/claude/nomad/nomad/structs/structs.go#L1802)

**类型**：struct

```go
	Message string
	Subsystem string
	Details map[string]string
	Timestamp time.Time
	CreateIndex uint64
```

**关联方法**（6 个）：`String`, `Copy`, `SetMessage`, `SetSubsystem`, `SetTimestamp`, `AddDetail`

### DrainSpec

**定义位置**：[L1898](file:///d:/claude/nomad/nomad/structs/structs.go#L1898)

**类型**：struct

```go
	Deadline time.Duration
	IgnoreSystemJobs bool
```

### DrainStrategy

**定义位置**：[L1909](file:///d:/claude/nomad/nomad/structs/structs.go#L1909)

**类型**：struct

```go
	DrainSpec
	ForceDeadline time.Time
	StartedAt time.Time
```

**关联方法**（3 个）：`Copy`, `DeadlineTime`, `Equal`

### DrainStatus

**定义位置**：[L1981](file:///d:/claude/nomad/nomad/structs/structs.go#L1981)

**类型定义**：`string`

### DrainMetadata

**定义位置**：[L1984](file:///d:/claude/nomad/nomad/structs/structs.go#L1984)

**类型**：struct

```go
	StartedAt time.Time
	UpdatedAt time.Time
	Status DrainStatus
	AccessorID string
	Meta map[string]string
```

**关联方法**（1 个）：`Copy`

### Node

**定义位置**：[L2014](file:///d:/claude/nomad/nomad/structs/structs.go#L2014)

**类型**：struct

```go
	ID string
	SecretID string
	Datacenter string
	Name string
	CgroupParent string
	HTTPAddr string
	TLSEnabled bool
	Attributes map[string]string
	NodeResources *NodeResources
	ReservedResources *NodeReservedResources
	Links map[string]string
	Meta map[string]string
	NodeClass string
	NodePool string
	ComputedClass string
	DrainStrategy *DrainStrategy
	SchedulingEligibility string
	Status string
	StatusDescription string
	IdentitySigningKeyID string
	StatusUpdatedAt int64
	Events []*NodeEvent
	Drivers map[string]*DriverInfo
	CSIControllerPlugins map[string]*CSIInfo
	CSINodePlugins map[string]*CSIInfo
	HostVolumes map[string]*ClientHostVolumeConfig
	GCVolumesOnNodeGC bool
	HostNetworks map[string]*ClientHostNetworkConfig
	LastDrain *DrainMetadata
	NodeMaxAllocs int
	LastMissedHeartbeatIndex uint64
	LastAllocUpdateIndex uint64
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（11 个）：`GetID`, `Sanitize`, `Ready`, `Canonicalize`, `Copy`, `UnresponsiveStatus`, `TerminalStatus`, `IsInAnyDC`, `IsInPool`, `HasEvent`, `Stub`

### NodeListStub

**定义位置**：[L2336](file:///d:/claude/nomad/nomad/structs/structs.go#L2336)

**类型**：struct

```go
	Address string
	ID string
	Attributes map[string]string `json:",omitempty"`
	Datacenter string
	Name string
	NodePool string
	NodeClass string
	Version string
	Drain bool
	SchedulingEligibility string
	Status string
	StatusDescription string
	Drivers map[string]*DriverInfo
	HostVolumes map[string]*ClientHostVolumeConfig
	NodeResources *NodeResources `json:",omitempty"`
	ReservedResources *NodeReservedResources `json:",omitempty"`
	LastDrain *DrainMetadata
	CreateIndex uint64
	ModifyIndex uint64
```

### NodeStubFields

**定义位置**：[L2359](file:///d:/claude/nomad/nomad/structs/structs.go#L2359)

**类型**：struct

```go
	Resources bool
	OS bool
```

### Resources

**定义位置**：[L2366](file:///d:/claude/nomad/nomad/structs/structs.go#L2366)

**类型**：struct

```go
	CPU int
	Cores int
	MemoryMB int
	MemoryMaxMB int
	DiskMB int
	IOPS int
	Networks Networks
	Devices ResourceDevices
	NUMA *NUMA
	SecretsMB int
```

**关联方法**（10 个）：`DiskInBytes`, `Validate`, `Merge`, `Equal`, `Canonicalize`, `MeetsMinResources`, `Copy`, `NetIndex`, `Add`, `GoString`

### ResourceDevices

**定义位置**：[L2527](file:///d:/claude/nomad/nomad/structs/structs.go#L2527)

**类型定义**：`[]*RequestedDevice`

**关联方法**（2 个）：`Copy`, `Equal`

### NodeNetworkResource

**定义位置**：[L2683](file:///d:/claude/nomad/nomad/structs/structs.go#L2683)

**类型**：struct

```go
	Mode string
	Device string
	MacAddress string
	Speed int
	Addresses []NodeNetworkAddress
```

**关联方法**（3 个）：`Equal`, `Copy`, `HasAlias`

### NodeNetworkAF

**定义位置**：[L2723](file:///d:/claude/nomad/nomad/structs/structs.go#L2723)

**类型定义**：`string`

**关联方法**（1 个）：`Validate`

### NodeNetworkAddress

**定义位置**：[L2738](file:///d:/claude/nomad/nomad/structs/structs.go#L2738)

**类型**：struct

```go
	Family NodeNetworkAF
	Alias string
	Address string
	ReservedPorts string
	Gateway string
```

### AllocatedPortMapping

**定义位置**：[L2746](file:///d:/claude/nomad/nomad/structs/structs.go#L2746)

**类型**：struct

```go
	_struct bool `codec:",omitempty"`
	Label string
	Value int
	To int
	HostIP string
	IgnoreCollision bool
```

**关联方法**（2 个）：`Copy`, `Equal`

### AllocatedPorts

**定义位置**：[L2786](file:///d:/claude/nomad/nomad/structs/structs.go#L2786)

**类型定义**：`[]AllocatedPortMapping`

**关联方法**（2 个）：`Equal`, `Get`

### Port

**定义位置**：[L2804](file:///d:/claude/nomad/nomad/structs/structs.go#L2804)

**类型**：struct

```go
	_struct bool `codec:",omitempty"`
	Label string
	Value int
	To int
	HostNetwork string
	IgnoreCollision bool
```

### DNSConfig

**定义位置**：[L2831](file:///d:/claude/nomad/nomad/structs/structs.go#L2831)

**类型**：struct

```go
	Servers []string
	Searches []string
	Options []string
```

**关联方法**（3 个）：`Equal`, `Copy`, `IsZero`

### NetworkResource

**定义位置**：[L2874](file:///d:/claude/nomad/nomad/structs/structs.go#L2874)

**类型**：struct

```go
	_struct bool `codec:",omitempty"`
	Mode string
	Device string
	CIDR string
	IP string
	Hostname string `json:",omitempty"`
	MBits int
	DNS *DNSConfig
	ReservedPorts []Port
	DynamicPorts []Port
	CNI *CNIConfig
```

**关联方法**（8 个）：`Hash`, `Equal`, `Canonicalize`, `Copy`, `Add`, `GoString`, `PortLabels`, `IsIPv6`

### Networks

**定义位置**：[L2983](file:///d:/claude/nomad/nomad/structs/structs.go#L2983)

**类型定义**：`[]*NetworkResource`

**关联方法**（5 个）：`Copy`, `Port`, `NetIndex`, `Modes`, `Equal`

### RequestedDevice

**定义位置**：[L3042](file:///d:/claude/nomad/nomad/structs/structs.go#L3042)

**类型**：struct

```go
	Name string
	Count uint64
	Constraints Constraints
	Affinities Affinities
```

**关联方法**（5 个）：`String`, `Equal`, `Copy`, `ID`, `Validate`

### NodeResources

**定义位置**：[L3154](file:///d:/claude/nomad/nomad/structs/structs.go#L3154)

**类型**：struct

```go
	Cpu LegacyNodeCpuResources
	Processors NodeProcessorResources
	Memory NodeMemoryResources
	Disk NodeDiskResources
	Devices []*NodeDeviceResource
	NodeNetworks []*NodeNetworkResource
	Networks Networks
	MinDynamicPort int
	MaxDynamicPort int
```

**关联方法**（4 个）：`Copy`, `Comparable`, `Merge`, `Equal`

### NodeMemoryResources

**定义位置**：[L3380](file:///d:/claude/nomad/nomad/structs/structs.go#L3380)

**类型**：struct

```go
	MemoryMB int64
```

**关联方法**（2 个）：`Merge`, `Equal`

### NodeDiskResources

**定义位置**：[L3412](file:///d:/claude/nomad/nomad/structs/structs.go#L3412)

**类型**：struct

```go
	DiskMB int64
```

**关联方法**（2 个）：`Merge`, `Equal`

### DeviceIdTuple

**定义位置**：[L3443](file:///d:/claude/nomad/nomad/structs/structs.go#L3443)

**类型**：struct

```go
	Vendor string
	Type string
	Name string
```

**关联方法**（3 个）：`String`, `Matches`, `Equal`

### NodeDeviceResource

**定义位置**：[L3491](file:///d:/claude/nomad/nomad/structs/structs.go#L3491)

**类型**：struct

```go
	Vendor string
	Type string
	Name string
	Instances []*NodeDevice
	Attributes map[string]*psstructs.Attribute
```

**关联方法**（3 个）：`ID`, `Copy`, `Equal`

### NodeDevice

**定义位置**：[L3579](file:///d:/claude/nomad/nomad/structs/structs.go#L3579)

**类型**：struct

```go
	ID string
	Healthy bool
	HealthDescription string
	Locality *NodeDeviceLocality
```

**关联方法**（2 个）：`Equal`, `Copy`

### NodeDeviceLocality

**定义位置**：[L3633](file:///d:/claude/nomad/nomad/structs/structs.go#L3633)

**类型**：struct

```go
	PciBusID string
```

**关联方法**（2 个）：`Equal`, `Copy`

### NodeReservedResources

**定义位置**：[L3666](file:///d:/claude/nomad/nomad/structs/structs.go#L3666)

**类型**：struct

```go
	Cpu NodeReservedCpuResources
	Memory NodeReservedMemoryResources
	Disk NodeReservedDiskResources
	Networks NodeReservedNetworkResources
```

**关联方法**（2 个）：`Copy`, `Comparable`

### NodeReservedCpuResources

**定义位置**：[L3708](file:///d:/claude/nomad/nomad/structs/structs.go#L3708)

**类型**：struct

```go
	CpuShares int64
	ReservedCpuCores []uint16
```

### NodeReservedMemoryResources

**定义位置**：[L3714](file:///d:/claude/nomad/nomad/structs/structs.go#L3714)

**类型**：struct

```go
	MemoryMB int64
```

### NodeReservedDiskResources

**定义位置**：[L3719](file:///d:/claude/nomad/nomad/structs/structs.go#L3719)

**类型**：struct

```go
	DiskMB int64
```

### NodeReservedNetworkResources

**定义位置**：[L3724](file:///d:/claude/nomad/nomad/structs/structs.go#L3724)

**类型**：struct

```go
	ReservedHostPorts string
```

### AllocatedResources

**定义位置**：[L3732](file:///d:/claude/nomad/nomad/structs/structs.go#L3732)

**类型**：struct

```go
	Tasks map[string]*AllocatedTaskResources
	TaskLifecycles map[string]*TaskLifecycleConfig
	Shared AllocatedSharedResources
```

**关联方法**（5 个）：`UsesCores`, `Copy`, `Comparable`, `OldTaskResources`, `Canonicalize`

### AllocatedTaskResources

**定义位置**：[L3874](file:///d:/claude/nomad/nomad/structs/structs.go#L3874)

**类型**：struct

```go
	Cpu AllocatedCpuResources
	Memory AllocatedMemoryResources
	Networks Networks
	Devices []*AllocatedDeviceResource
```

**关联方法**（6 个）：`Copy`, `NetIndex`, `Add`, `Max`, `Comparable`, `Subtract`

### AllocatedSharedResources

**定义位置**：[L3997](file:///d:/claude/nomad/nomad/structs/structs.go#L3997)

**类型**：struct

```go
	Networks Networks
	DiskMB int64
	Ports AllocatedPorts
```

**关联方法**（4 个）：`Copy`, `Add`, `Subtract`, `Canonicalize`

### AllocatedCpuResources

**定义位置**：[L4057](file:///d:/claude/nomad/nomad/structs/structs.go#L4057)

**类型**：struct

```go
	CpuShares int64
	ReservedCores []uint16
```

**关联方法**（3 个）：`Add`, `Subtract`, `Max`

### AllocatedMemoryResources

**定义位置**：[L4107](file:///d:/claude/nomad/nomad/structs/structs.go#L4107)

**类型**：struct

```go
	MemoryMB int64
	MemoryMaxMB int64
```

**关联方法**（3 个）：`Add`, `Subtract`, `Max`

### AllocatedDevices

**定义位置**：[L4151](file:///d:/claude/nomad/nomad/structs/structs.go#L4151)

**类型定义**：`[]*AllocatedDeviceResource`

**关联方法**（1 个）：`Index`

### AllocatedDeviceResource

**定义位置**：[L4170](file:///d:/claude/nomad/nomad/structs/structs.go#L4170)

**类型**：struct

```go
	Vendor string
	Type string
	Name string
	DeviceIDs []string
```

**关联方法**（3 个）：`ID`, `Add`, `Copy`

### ComparableResources

**定义位置**：[L4216](file:///d:/claude/nomad/nomad/structs/structs.go#L4216)

**类型**：struct

```go
	Flattened AllocatedTaskResources
	Shared AllocatedSharedResources
```

**关联方法**（5 个）：`Add`, `Subtract`, `Copy`, `Superset`, `NetIndex`

### JobSubmission

**定义位置**：[L4324](file:///d:/claude/nomad/nomad/structs/structs.go#L4324)

**类型**：struct

```go
	Source string
	Format string
	VariableFlags map[string]string
	Variables string
	Namespace string
	JobID string
	Version uint64
	JobModifyIndex uint64
```

**关联方法**（2 个）：`Hash`, `Copy`

### Job

**定义位置**：[L4388](file:///d:/claude/nomad/nomad/structs/structs.go#L4388)

**类型**：struct

```go
	Stop bool
	Region string
	Namespace string
	ID string
	ParentID string
	Name string
	Type string
	Priority int
	AllAtOnce bool
	Datacenters []string
	NodePool string
	Constraints []*Constraint
	Affinities []*Affinity
	Spreads []*Spread
	TaskGroups []*TaskGroup
	Update UpdateStrategy
	Multiregion *Multiregion
	Periodic *PeriodicConfig
	ParameterizedJob *ParameterizedJobConfig
	Dispatched bool
	DispatchIdempotencyToken string
	Payload []byte
	Meta map[string]string
	ConsulNamespace string
	VaultNamespace string
	NomadTokenID string
	Status string
	StatusDescription string
	Stable bool
	Version uint64
	SubmitTime int64
	CreateIndex uint64
	ModifyIndex uint64
	JobModifyIndex uint64
	UI *JobUIConfig
	VersionTag *JobVersionTag
```

**关联方法**（30 个）：`NamespacedID`, `GetID`, `GetNamespace`, `GetIDforWorkloadIdentity`, `GetCreateIndex`, `GetModifyIndex`, `Canonicalize`, `Copy`, `Validate`, `generateServiceShutdownDelayWarnings`, `Warnings`, `LookupTaskGroup`, `CombinedTaskMeta`, `Stopped`, `HasUpdateStrategy`, `Stub`, `IsPeriodic`, `IsPeriodicActive`, `IsParameterized`, `IsMultiregion`, `IsPlugin`, `HasPlugin`, `Vault`, `Secrets`, `ConnectTasks`, `RequiredSignals`, `SpecChanged`, `SetSubmitTime`, `GetScalingPolicies`, `UsesDeployments`

### JobVersionTag

**定义位置**：[L4528](file:///d:/claude/nomad/nomad/structs/structs.go#L4528)

**类型**：struct

```go
	Name string
	Description string
	TaggedTime int64
```

**关联方法**（1 个）：`Copy`

### JobApplyTagRequest

**定义位置**：[L4534](file:///d:/claude/nomad/nomad/structs/structs.go#L4534)

**类型**：struct

```go
	JobID string
	Name string
	Tag *JobVersionTag
	Version uint64
	Latest bool
	WriteRequest
```

### JobTagResponse

**定义位置**：[L4543](file:///d:/claude/nomad/nomad/structs/structs.go#L4543)

**类型**：struct

```go
	Name string
	Description string
	TaggedTime int64
	QueryMeta
```

### JobUIConfig

**定义位置**：[L4561](file:///d:/claude/nomad/nomad/structs/structs.go#L4561)

**类型**：struct

```go
	Description string
	Links []*JobUILink
```

**关联方法**（1 个）：`Copy`

### JobUILink

**定义位置**：[L4566](file:///d:/claude/nomad/nomad/structs/structs.go#L4566)

**类型**：struct

```go
	Label string
	Url string
```

**关联方法**（1 个）：`Copy`

### JobListStub

**定义位置**：[L5289](file:///d:/claude/nomad/nomad/structs/structs.go#L5289)

**类型**：struct

```go
	ID string
	ParentID string
	Name string
	Namespace string `json:",omitempty"`
	Datacenters []string
	NodePool string
	Multiregion *Multiregion
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

### JobSummary

**定义位置**：[L5313](file:///d:/claude/nomad/nomad/structs/structs.go#L5313)

**类型**：struct

```go
	JobID string
	Namespace string
	Summary map[string]TaskGroupSummary
	Children *JobChildrenSummary
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（1 个）：`Copy`

### JobChildrenSummary

**定义位置**：[L5345](file:///d:/claude/nomad/nomad/structs/structs.go#L5345)

**类型**：struct

```go
	Pending int64
	Running int64
	Dead int64
```

**关联方法**（1 个）：`Copy`

### TaskGroupSummary

**定义位置**：[L5364](file:///d:/claude/nomad/nomad/structs/structs.go#L5364)

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

### UpdateStrategy

**定义位置**：[L5406](file:///d:/claude/nomad/nomad/structs/structs.go#L5406)

**类型**：struct

```go
	Stagger time.Duration
	MaxParallel int
	HealthCheck string
	MinHealthyTime time.Duration
	HealthyDeadline time.Duration
	ProgressDeadline time.Duration
	AutoRevert bool
	AutoPromote bool
	Canary int
```

**关联方法**（4 个）：`Copy`, `Validate`, `IsEmpty`, `Rolling`

### Multiregion

**定义位置**：[L5524](file:///d:/claude/nomad/nomad/structs/structs.go#L5524)

**类型**：struct

```go
	Strategy *MultiregionStrategy
	Regions []*MultiregionRegion
```

**关联方法**（3 个）：`Canonicalize`, `Diff`, `Copy`

### MultiregionStrategy

**定义位置**：[L5571](file:///d:/claude/nomad/nomad/structs/structs.go#L5571)

**类型**：struct

```go
	MaxParallel int
	OnFailure string
```

### MultiregionRegion

**定义位置**：[L5576](file:///d:/claude/nomad/nomad/structs/structs.go#L5576)

**类型**：struct

```go
	Name string
	Count int
	Datacenters []string
	NodePool string
	Meta map[string]string
```

### Namespace

**定义位置**：[L5585](file:///d:/claude/nomad/nomad/structs/structs.go#L5585)

**类型**：struct

```go
	Name string
	Description string
	Quota string
	Capabilities *NamespaceCapabilities
	NodePoolConfiguration *NamespaceNodePoolConfiguration
	VaultConfiguration *NamespaceVaultConfiguration
	ConsulConfiguration *NamespaceConsulConfiguration
	Meta map[string]string
	Hash []byte
	CreateIndex uint64
	ModifyIndex uint64
	RequiredExtraClaims map[string]string
	OptionalExtraClaims map[string]string
```

**关联方法**（3 个）：`Validate`, `SetHash`, `Copy`

### NamespaceCapabilities

**定义位置**：[L5624](file:///d:/claude/nomad/nomad/structs/structs.go#L5624)

**类型**：struct

```go
	EnabledTaskDrivers []string
	DisabledTaskDrivers []string
	EnabledNetworkModes []string
	DisabledNetworkModes []string
```

### NamespaceNodePoolConfiguration

**定义位置**：[L5633](file:///d:/claude/nomad/nomad/structs/structs.go#L5633)

**类型**：struct

```go
	Default string
	Allowed []string
	Denied []string
```

### NamespaceListRequest

**定义位置**：[L5818](file:///d:/claude/nomad/nomad/structs/structs.go#L5818)

**类型**：struct

```go
	QueryOptions
```

### NamespaceListResponse

**定义位置**：[L5823](file:///d:/claude/nomad/nomad/structs/structs.go#L5823)

**类型**：struct

```go
	Namespaces []*Namespace
	QueryMeta
```

### NamespaceSpecificRequest

**定义位置**：[L5829](file:///d:/claude/nomad/nomad/structs/structs.go#L5829)

**类型**：struct

```go
	Name string
	QueryOptions
```

### SingleNamespaceResponse

**定义位置**：[L5835](file:///d:/claude/nomad/nomad/structs/structs.go#L5835)

**类型**：struct

```go
	Namespace *Namespace
	QueryMeta
```

### NamespaceSetRequest

**定义位置**：[L5841](file:///d:/claude/nomad/nomad/structs/structs.go#L5841)

**类型**：struct

```go
	Namespaces []string
	QueryOptions
```

### NamespaceSetResponse

**定义位置**：[L5847](file:///d:/claude/nomad/nomad/structs/structs.go#L5847)

**类型**：struct

```go
	Namespaces map[string]*Namespace
	QueryMeta
```

### NamespaceDeleteRequest

**定义位置**：[L5853](file:///d:/claude/nomad/nomad/structs/structs.go#L5853)

**类型**：struct

```go
	Namespaces []string
	WriteRequest
```

### NamespaceUpsertRequest

**定义位置**：[L5859](file:///d:/claude/nomad/nomad/structs/structs.go#L5859)

**类型**：struct

```go
	Namespaces []*Namespace
	WriteRequest
```

### PeriodicConfig

**定义位置**：[L5874](file:///d:/claude/nomad/nomad/structs/structs.go#L5874)

**类型**：struct

```go
	Enabled bool
	Spec string
	Specs []string
	SpecType string
	ProhibitOverlap bool
	TimeZone string
	location *time.Location
```

**关联方法**（5 个）：`Copy`, `Validate`, `Canonicalize`, `Next`, `GetLocation`

### PeriodicLaunch

**定义位置**：[L6053](file:///d:/claude/nomad/nomad/structs/structs.go#L6053)

**类型**：struct

```go
	ID string
	Namespace string
	Launch time.Time
	CreateIndex uint64
	ModifyIndex uint64
```

### ParameterizedJobConfig

**定义位置**：[L6074](file:///d:/claude/nomad/nomad/structs/structs.go#L6074)

**类型**：struct

```go
	Payload string
	MetaRequired []string
	MetaOptional []string
```

**关联方法**（3 个）：`Validate`, `Canonicalize`, `Copy`

### DispatchPayloadConfig

**定义位置**：[L6132](file:///d:/claude/nomad/nomad/structs/structs.go#L6132)

**类型**：struct

```go
	File string
```

**关联方法**（2 个）：`Copy`, `Validate`

### TaskLifecycleConfig

**定义位置**：[L6164](file:///d:/claude/nomad/nomad/structs/structs.go#L6164)

**类型**：struct

```go
	Hook string
	Sidecar bool
```

**关联方法**（2 个）：`Copy`, `Validate`

### JobScalingEvents

**定义位置**：[L6252](file:///d:/claude/nomad/nomad/structs/structs.go#L6252)

**类型**：struct

```go
	Namespace string
	JobID string
	ScalingEvents map[string][]*ScalingEvent
	ModifyIndex uint64
```

**关联方法**（1 个）：`Copy`

### ScalingEvent

**定义位置**：[L6289](file:///d:/claude/nomad/nomad/structs/structs.go#L6289)

**类型**：struct

```go
	Time int64
	Count *int64
	PreviousCount int64
	Message string
	Error bool
	Meta map[string]interface{}
	EvalID *string
	CreateIndex uint64
```

**关联方法**（1 个）：`Copy`

### ScalingEventRequest

**定义位置**：[L6330](file:///d:/claude/nomad/nomad/structs/structs.go#L6330)

**类型**：struct

```go
	Namespace string
	JobID string
	TaskGroup string
	ScalingEvent *ScalingEvent
```

### ScalingPolicy

**定义位置**：[L6339](file:///d:/claude/nomad/nomad/structs/structs.go#L6339)

**类型**：struct

```go
	ID string
	Type string
	Target map[string]string
	Policy map[string]interface{}
	Min int64
	Max int64
	Enabled bool
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（7 个）：`JobKey`, `Canonicalize`, `Copy`, `Validate`, `validateTargetHorizontal`, `Diff`, `Stub`

### ScalingPolicyListStub

**定义位置**：[L6532](file:///d:/claude/nomad/nomad/structs/structs.go#L6532)

**类型**：struct

```go
	ID string
	Enabled bool
	Type string
	Target map[string]string
	CreateIndex uint64
	ModifyIndex uint64
```

### RestartPolicy

**定义位置**：[L6542](file:///d:/claude/nomad/nomad/structs/structs.go#L6542)

**类型**：struct

```go
	Attempts int
	Interval time.Duration
	Delay time.Duration
	Mode string
	RenderTemplates bool
```

**关联方法**（2 个）：`Copy`, `Validate`

### ReschedulePolicy

**定义位置**：[L6611](file:///d:/claude/nomad/nomad/structs/structs.go#L6611)

**类型**：struct

```go
	Attempts int
	Interval time.Duration
	Delay time.Duration
	DelayFunction string
	MaxDelay time.Duration
	Unlimited bool
```

**关联方法**（5 个）：`Copy`, `Enabled`, `Validate`, `validateDelayParams`, `viableAttempts`

### MigrateStrategy

**定义位置**：[L6821](file:///d:/claude/nomad/nomad/structs/structs.go#L6821)

**类型**：struct

```go
	MaxParallel int
	HealthCheck string
	MinHealthyTime time.Duration
	HealthyDeadline time.Duration
```

**关联方法**（1 个）：`Validate`

### TaskGroup

**定义位置**：[L6877](file:///d:/claude/nomad/nomad/structs/structs.go#L6877)

**类型**：struct

```go
	Name string
	Count int
	Update *UpdateStrategy
	Migrate *MigrateStrategy
	Constraints []*Constraint
	Scaling *ScalingPolicy
	RestartPolicy *RestartPolicy
	Disconnect *DisconnectStrategy
	Tasks []*Task
	EphemeralDisk *EphemeralDisk
	Meta map[string]string
	ReschedulePolicy *ReschedulePolicy
	Affinities []*Affinity
	Spreads []*Spread
	Networks Networks
	Consul *Consul
	Services []*Service
	Volumes map[string]*VolumeRequest
	ShutdownDelay *time.Duration
	MaxRunDuration *time.Duration
	StopAfterClientDisconnect *time.Duration
	MaxClientDisconnect *time.Duration
	PreventRescheduleOnLost bool
```

**关联方法**（20 个）：`Copy`, `Canonicalize`, `NomadServices`, `ConsulServices`, `filterServices`, `Validate`, `validateNetworks`, `validateServices`, `validateScriptChecksInGroupServices`, `validateScalingPolicy`, `Warnings`, `LookupTask`, `UsesConnect`, `UsesConnectGateway`, `GoString`, `Replace`, `GetDisconnectLostAfter`, `GetDisconnectStopTimeout`, `GetConstraints`, `SetConstraints`

### CheckRestart

**定义位置**：[L7751](file:///d:/claude/nomad/nomad/structs/structs.go#L7751)

**类型**：struct

```go
	Limit int
	Grace time.Duration
	IgnoreWarnings bool
```

**关联方法**（3 个）：`Copy`, `Equal`, `Validate`

### LogConfig

**定义位置**：[L7811](file:///d:/claude/nomad/nomad/structs/structs.go#L7811)

**类型**：struct

```go
	MaxFiles int
	MaxFileSizeMB int
	Disabled bool
```

**关联方法**（3 个）：`Equal`, `Copy`, `Validate`

### Task

**定义位置**：[L7880](file:///d:/claude/nomad/nomad/structs/structs.go#L7880)

**类型**：struct

```go
	Name string
	Driver string
	User string
	Config map[string]interface{}
	Env map[string]string
	Services []*Service
	Vault *Vault
	Secrets []*Secret
	Consul *Consul
	Templates []*Template
	Constraints []*Constraint
	Affinities []*Affinity
	Resources *Resources
	RestartPolicy *RestartPolicy
	DispatchPayload *DispatchPayloadConfig
	Lifecycle *TaskLifecycleConfig
	Meta map[string]string
	KillTimeout time.Duration
	LogConfig *LogConfig
	Artifacts []*TaskArtifact
	Leader bool
	ShutdownDelay time.Duration
	VolumeMounts []*VolumeMount
	ScalingPolicies []*ScalingPolicy
	KillSignal string
	Kind TaskKind
	CSIPluginConfig *TaskCSIPluginConfig
	Identity *WorkloadIdentity
	Identities []*WorkloadIdentity
	Actions []*Action
	Schedule *TaskSchedule
```

**关联方法**（17 个）：`UsesCores`, `UsesConnect`, `UsesConnectSidecar`, `IsPrestart`, `IsMain`, `IsPoststart`, `IsPoststop`, `GetIdentity`, `GetAction`, `IdentityHandle`, `Copy`, `Canonicalize`, `GoString`, `Validate`, `Warnings`, `GetConstraints`, `SetConstraints`

### TaskKind

**定义位置**：[L8645](file:///d:/claude/nomad/nomad/structs/structs.go#L8645)

**类型定义**：`string`

**关联方法**（9 个）：`Name`, `Value`, `hasPrefix`, `IsConnectProxy`, `IsConnectNative`, `IsConnectIngress`, `IsConnectTerminating`, `IsConnectMesh`, `IsAnyConnectGateway`

### Template

**定义位置**：[L8788](file:///d:/claude/nomad/nomad/structs/structs.go#L8788)

**类型**：struct

```go
	SourcePath string
	DestPath string
	EmbeddedTmpl string
	ChangeMode string
	ChangeSignal string
	ChangeScript *ChangeScript
	Once bool
	Splay time.Duration
	Perms string
	Uid *int
	Gid *int
	LeftDelim string
	RightDelim string
	Envvars bool
	VaultGrace time.Duration
	Wait *WaitConfig
	ErrMissingKey bool
```

**关联方法**（6 个）：`Equal`, `Copy`, `Canonicalize`, `Validate`, `Warnings`, `DiffID`

### ChangeScript

**定义位置**：[L9007](file:///d:/claude/nomad/nomad/structs/structs.go#L9007)

**类型**：struct

```go
	Command string
	Args []string
	Timeout time.Duration
	FailOnError bool
	RunOnFirstRender bool
```

**关联方法**（3 个）：`Equal`, `Copy`, `Validate`

### WaitConfig

**定义位置**：[L9071](file:///d:/claude/nomad/nomad/structs/structs.go#L9071)

**类型**：struct

```go
	Min *time.Duration
	Max *time.Duration
```

**关联方法**（3 个）：`Copy`, `Equal`, `Validate`

### TaskState

**定义位置**：[L9135](file:///d:/claude/nomad/nomad/structs/structs.go#L9135)

**类型**：struct

```go
	State string
	Failed bool
	Restarts uint64
	LastRestart time.Time
	StartedAt time.Time
	FinishedAt time.Time
	Events []*TaskEvent
	Paused TaskScheduleState
```

**关联方法**（4 个）：`Canonicalize`, `Copy`, `Successful`, `Equal`

### TaskEvent

**定义位置**：[L9353](file:///d:/claude/nomad/nomad/structs/structs.go#L9353)

**类型**：struct

```go
	Type string
	Time int64
	Message string
	DisplayMessage string
	Details map[string]string
	FailsTask bool
	RestartReason string
	SetupError string
	DriverError string
	ExitCode int
	Signal int
	KillTimeout time.Duration
	KillError string
	KillReason string
	StartDelay int64
	DownloadError string
	ValidationError string
	DiskLimit int64
	FailedSibling string
	VaultError string
	TaskSignalReason string
	TaskSignal string
	DriverMessage string
	GenericSource string
```

**关联方法**（27 个）：`PopulateEventDisplayMessage`, `GoString`, `Equal`, `SetDisplayMessage`, `SetMessage`, `Copy`, `SetSetupError`, `SetFailsTask`, `SetDriverError`, `SetExitCode`, `SetSignal`, `SetSignalText`, `SetExitMessage`, `SetKillError`, `SetKillReason`, `SetRestartDelay`, `SetRestartReason`, `SetTaskSignalReason`, `SetTaskSignal`, `SetDownloadError`, `SetValidationError`, `SetKillTimeout`, `SetDiskLimit`, `SetFailedSibling`, `SetVaultRenewalError`, `SetDriverMessage`, `SetOOMKilled`

### TaskArtifact

**定义位置**：[L9773](file:///d:/claude/nomad/nomad/structs/structs.go#L9773)

**类型**：struct

```go
	GetterSource string
	GetterOptions map[string]string
	GetterHeaders map[string]string
	GetterMode string
	GetterInsecure bool
	RelativeDest string
	Chown bool
```

**关联方法**（7 个）：`Equal`, `Copy`, `GoString`, `DiffID`, `Hash`, `Validate`, `validateChecksum`

### Constraint

**定义位置**：[L9980](file:///d:/claude/nomad/nomad/structs/structs.go#L9980)

**类型**：struct

```go
	LTarget string
	RTarget string
	Operand string
```

**关联方法**（5 个）：`Equal`, `Copy`, `String`, `Validate`, `DiffID`

### Constraints

**定义位置**：[L10082](file:///d:/claude/nomad/nomad/structs/structs.go#L10082)

**类型定义**：`[]*Constraint`

**关联方法**（1 个）：`Equal`

### Affinity

**定义位置**：[L10108](file:///d:/claude/nomad/nomad/structs/structs.go#L10108)

**类型**：struct

```go
	LTarget string
	RTarget string
	Operand string
	Weight int8
```

**关联方法**（5 个）：`Equal`, `Copy`, `String`, `Validate`, `DiffID`

### Spread

**定义位置**：[L10204](file:///d:/claude/nomad/nomad/structs/structs.go#L10204)

**类型**：struct

```go
	Attribute string
	Weight int8
	SpreadTarget []*SpreadTarget
	str string
```

**关联方法**（4 个）：`Equal`, `Copy`, `String`, `Validate`

### Affinities

**定义位置**：[L10234](file:///d:/claude/nomad/nomad/structs/structs.go#L10234)

**类型定义**：`[]*Affinity`

**关联方法**（1 个）：`Equal`

### SpreadTarget

**定义位置**：[L10309](file:///d:/claude/nomad/nomad/structs/structs.go#L10309)

**类型**：struct

```go
	Value string
	Percent uint8
	str string
```

**关联方法**（3 个）：`Copy`, `String`, `Equal`

### EphemeralDisk

**定义位置**：[L10352](file:///d:/claude/nomad/nomad/structs/structs.go#L10352)

**类型**：struct

```go
	Sticky bool
	SizeMB int
	Migrate bool
```

**关联方法**（3 个）：`Equal`, `Validate`, `Copy`

### Vault

**定义位置**：[L10419](file:///d:/claude/nomad/nomad/structs/structs.go#L10419)

**类型**：struct

```go
	Role string
	Namespace string
	Cluster string
	Env bool
	DisableFile bool
	ChangeMode string
	ChangeSignal string
	AllowTokenExpiration bool
```

**关联方法**（5 个）：`IdentityName`, `Equal`, `Copy`, `Canonicalize`, `Validate`

### Secret

**定义位置**：[L10528](file:///d:/claude/nomad/nomad/structs/structs.go#L10528)

**类型**：struct

```go
	Name string
	Provider string
	Path string
	Config map[string]any
	Env map[string]string
```

**关联方法**（4 个）：`Equal`, `Copy`, `Validate`, `Canonicalize`

### RescheduleTracker

**定义位置**：[L10625](file:///d:/claude/nomad/nomad/structs/structs.go#L10625)

**类型**：struct

```go
	Events []*RescheduleEvent
	LastReschedule RescheduleTrackerAnnotation
```

**关联方法**（3 个）：`Copy`, `RescheduleEligible`, `rescheduleInfo`

### RescheduleTrackerAnnotation

**定义位置**：[L10633](file:///d:/claude/nomad/nomad/structs/structs.go#L10633)

**类型定义**：`string`

### RescheduleEvent

**定义位置**：[L10695](file:///d:/claude/nomad/nomad/structs/structs.go#L10695)

**类型**：struct

```go
	RescheduleTime int64
	PrevAllocID string
	PrevNodeID string
	Delay time.Duration
```

**关联方法**（1 个）：`Copy`

### NodeScoreMeta

**定义位置**：[L10727](file:///d:/claude/nomad/nomad/structs/structs.go#L10727)

**类型**：struct

```go
	NodeID string
	Scores map[string]float64
	NormScore float64
```

**关联方法**（4 个）：`Copy`, `String`, `Score`, `Data`

### DesiredUpdates

**定义位置**：[L10756](file:///d:/claude/nomad/nomad/structs/structs.go#L10756)

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

**关联方法**（1 个）：`GoString`

### KeyringResponse

**定义位置**：[L10810](file:///d:/claude/nomad/nomad/structs/structs.go#L10810)

**类型**：struct

```go
	Messages map[string]string
	Keys map[string]int
	NumNodes int
```

### KeyringRequest

**定义位置**：[L10817](file:///d:/claude/nomad/nomad/structs/structs.go#L10817)

**类型**：struct

```go
	Key string
```

### RecoverableError

**定义位置**：[L10823](file:///d:/claude/nomad/nomad/structs/structs.go#L10823)

**类型**：struct

```go
	Err string
	Recoverable bool
	wrapped error
```

**关联方法**（4 个）：`Error`, `IsRecoverable`, `IsUnrecoverable`, `Unwrap`

### Recoverable

**定义位置**：[L10868](file:///d:/claude/nomad/nomad/structs/structs.go#L10868)

**类型**：interface

```go
	error
	IsRecoverable
```

### WrappedServerError

**定义位置**：[L10884](file:///d:/claude/nomad/nomad/structs/structs.go#L10884)

**类型**：struct

```go
	Err error
```

**关联方法**（3 个）：`IsRecoverable`, `Error`, `IsServerSide`

### ServerSideError

**定义位置**：[L10909](file:///d:/claude/nomad/nomad/structs/structs.go#L10909)

**类型**：interface

```go
	error
	IsServerSide
```

### RpcError

**定义位置**：[L10924](file:///d:/claude/nomad/nomad/structs/structs.go#L10924)

**类型**：struct

```go
	Message string
	Code *int64
```

**关联方法**（1 个）：`Error`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `NodeRegisterRequestType` | `0` |
| `NodeDeregisterRequestType` | `1` |
| `NodeUpdateStatusRequestType` | `2` |
| `NodeUpdateDrainRequestType` | `3` |
| `JobRegisterRequestType` | `4` |
| `JobDeregisterRequestType` | `5` |
| `EvalUpdateRequestType` | `6` |
| `EvalDeleteRequestType` | `7` |
| `AllocUpdateRequestType` | `8` |
| `AllocClientUpdateRequestType` | `9` |
| `ReconcileJobSummariesRequestType` | `10` |
| `VaultAccessorRegisterRequestType` | `11` |
| `VaultAccessorDeregisterRequestType` | `12` |
| `ApplyPlanResultsRequestType` | `13` |
| `DeploymentStatusUpdateRequestType` | `14` |
| `DeploymentPromoteRequestType` | `15` |
| `DeploymentAllocHealthRequestType` | `16` |
| `DeploymentDeleteRequestType` | `17` |
| `JobStabilityRequestType` | `18` |
| `ACLPolicyUpsertRequestType` | `19` |
| `ACLPolicyDeleteRequestType` | `20` |
| `ACLTokenUpsertRequestType` | `21` |
| `ACLTokenDeleteRequestType` | `22` |
| `ACLTokenBootstrapRequestType` | `23` |
| `AutopilotRequestType` | `24` |
| `UpsertNodeEventsType` | `25` |
| `JobBatchDeregisterRequestType` | `26` |
| `AllocUpdateDesiredTransitionRequestType` | `27` |
| `NodeUpdateEligibilityRequestType` | `28` |
| `BatchNodeUpdateDrainRequestType` | `29` |
| `SchedulerConfigRequestType` | `30` |
| `NodeBatchDeregisterRequestType` | `31` |
| `ClusterMetadataRequestType` | `32` |
| `ServiceIdentityAccessorRegisterRequestType` | `33` |
| `ServiceIdentityAccessorDeregisterRequestType` | `34` |
| `CSIVolumeRegisterRequestType` | `35` |
| `CSIVolumeDeregisterRequestType` | `36` |
| `CSIVolumeClaimRequestType` | `37` |
| `ScalingEventRegisterRequestType` | `38` |
| `CSIVolumeClaimBatchRequestType` | `39` |
| `CSIPluginDeleteRequestType` | `40` |
| `EventSinkUpsertRequestType` | `41` |
| `EventSinkDeleteRequestType` | `42` |
| `BatchEventSinkUpdateProgressType` | `43` |
| `OneTimeTokenUpsertRequestType` | `44` |
| `OneTimeTokenDeleteRequestType` | `45` |
| `OneTimeTokenExpireRequestType` | `46` |
| `ServiceRegistrationUpsertRequestType` | `47` |
| `ServiceRegistrationDeleteByIDRequestType` | `48` |
| `ServiceRegistrationDeleteByNodeIDRequestType` | `49` |
| `VarApplyStateRequestType` | `50` |
| `RootKeyMetaUpsertRequestType` | `51` |
| `WrappedRootKeysDeleteRequestType` | `52` |
| `ACLRolesUpsertRequestType` | `53` |
| `ACLRolesDeleteByIDRequestType` | `54` |
| `ACLAuthMethodsUpsertRequestType` | `55` |
| `ACLAuthMethodsDeleteRequestType` | `56` |
| `ACLBindingRulesUpsertRequestType` | `57` |
| `ACLBindingRulesDeleteRequestType` | `58` |
| `NodePoolUpsertRequestType` | `59` |
| `NodePoolDeleteRequestType` | `60` |
| `JobVersionTagRequestType` | `61` |
| `WrappedRootKeysUpsertRequestType` | `62` |
| `NamespaceUpsertRequestType` | `64` |
| `NamespaceDeleteRequestType` | `65` |
| `HostVolumeRegisterRequestType` | `75` |
| `HostVolumeDeleteRequestType` | `76` |
| `TaskGroupHostVolumeClaimDeleteRequestType` | `77` |
| `SystemInitializationType` | `127` |
| `IgnoreUnknownTypeFlag` | `128` |
| `MsgTypeTestSetup` | `IgnoreUnknownTypeFlag` |
| `GetterModeAny` | `"any"` |
| `GetterModeFile` | `"file"` |
| `GetterModeDir` | `"dir"` |
| `maxPolicyDescriptionLength` | `256` |
| `maxTokenNameLength` | `256` |
| `ACLClientToken` | `"client"` |
| `ACLManagementToken` | `"management"` |
| `DefaultNamespace` | `"default"` |
| `DefaultNamespaceDescription` | `"Default shared namespace"` |
| `AllNamespacesSentinel` | `"*"` |
| `maxNamespaceDescriptionLength` | `256` |
| `JitterFraction` | `16` |
| `MaxRetainedNodeEvents` | `10` |
| `MaxRetainedNodeScores` | `5` |
| `NormScorerName` | `"normalized-score"` |
| `MaxBlockingRPCQueryTime` | `300 * time.Second` |
| `DefaultBlockingRPCQueryTime` | `300 * time.Second` |
| `RateMetricRead` | `"read"` |
| `RateMetricList` | `"list"` |
| `RateMetricWrite` | `"write"` |
| `SecretProviderVault` | `"vault"` |
| `NodeEventSubsystemDrain` | `"Drain"` |
| `NodeEventSubsystemDriver` | `"Driver"` |
| `NodeEventSubsystemHeartbeat` | `"Heartbeat"` |
| `NodeEventSubsystemCluster` | `"Cluster"` |
| `NodeEventSubsystemScheduler` | `"Scheduler"` |
| `NodeEventSubsystemStorage` | `"Storage"` |
| `NodeStatusInit` | `"initializing"` |
| `NodeStatusReady` | `"ready"` |
| `NodeStatusDown` | `"down"` |
| `NodeStatusDisconnected` | `"disconnected"` |
| `NodeSchedulingEligible` | `"eligible"` |
| `NodeSchedulingIneligible` | `"ineligible"` |
| `DrainStatusDraining` | `"draining"` |
| `DrainStatusComplete` | `"complete"` |
| `DrainStatusCanceled` | `"canceled"` |
| `BytesInMegabyte` | `1024 * 1024` |
| `MemoryNoLimit` | `-1` |
| `NodeNetworkAF_IPv4` | `"ipv4"` |
| `NodeNetworkAF_IPv6` | `"ipv6"` |
| `JobTypeCore` | `"_core"` |
| `JobTypeService` | `"service"` |
| `JobTypeBatch` | `"batch"` |
| `JobTypeSystem` | `"system"` |
| `JobTypeSysBatch` | `"sysbatch"` |
| `JobStatusPending` | `"pending"` |
| `JobStatusRunning` | `"running"` |
| `JobStatusDead` | `"dead"` |
| `JobMinPriority` | `1` |
| `JobDefaultPriority` | `50` |
| `JobDefaultMaxPriority` | `100` |
| `JobMaxPriority` | `math.MaxInt16 - 1` |
| `JobDefaultMaxCount` | `50000` |
| `CoreJobPriority` | `math.MaxInt16` |
| `JobDefaultTrackedVersions` | `6` |
| `JobTrackedScalingEvents` | `20` |
| `UpdateStrategyHealthCheck_Checks` | `"checks"` |
| `UpdateStrategyHealthCheck_TaskStates` | `"task_states"` |
| `UpdateStrategyHealthCheck_Manual` | `"manual"` |
| `PeriodicSpecCron` | `"cron"` |
| `PeriodicSpecTest` | `"_internal_test"` |
| `PeriodicLaunchSuffix` | `"/periodic-"` |
| `DispatchPayloadForbidden` | `"forbidden"` |
| `DispatchPayloadOptional` | `"optional"` |
| `DispatchPayloadRequired` | `"required"` |
| `DispatchLaunchSuffix` | `"/dispatch-"` |
| `TaskLifecycleHookPrestart` | `"prestart"` |
| `TaskLifecycleHookPoststart` | `"poststart"` |
| `TaskLifecycleHookPoststop` | `"poststop"` |
| `RestartPolicyModeDelay` | `"delay"` |
| `RestartPolicyModeFail` | `"fail"` |
| `RestartPolicyMinInterval` | `5 * time.Second` |
| `ReasonWithinPolicy` | `"Restart within policy"` |
| `ScalingTargetNamespace` | `"Namespace"` |
| `ScalingTargetJob` | `"Job"` |
| `ScalingTargetGroup` | `"Group"` |
| `ScalingTargetTask` | `"Task"` |
| `ScalingPolicyTypeHorizontal` | `"horizontal"` |
| `ReschedulePolicyMinInterval` | `15 * time.Second` |
| `ReschedulePolicyMinDelay` | `5 * time.Second` |
| `MigrateStrategyHealthChecks` | `"checks"` |
| `MigrateStrategyHealthStates` | `"task_states"` |
| `DefaultKillTimeout` | `5 * time.Second` |
| `ConnectProxyPrefix` | `"connect-proxy"` |
| `ConnectNativePrefix` | `"connect-native"` |
| `ConnectIngressPrefix` | `"connect-ingress"` |
| `ConnectTerminatingPrefix` | `"connect-terminating"` |
| `ConnectMeshPrefix` | `"connect-mesh"` |
| `TemplateChangeModeNoop` | `"noop"` |
| `TemplateChangeModeSignal` | `"signal"` |
| `TemplateChangeModeRestart` | `"restart"` |
| `TemplateChangeModeScript` | `"script"` |
| `TaskStatePending` | `"pending"` |
| `TaskStateRunning` | `"running"` |
| `TaskStateDead` | `"dead"` |
| `TaskSetupFailure` | `"Setup Failure"` |
| `TaskDriverFailure` | `"Driver Failure"` |
| `TaskReceived` | `"Received"` |
| `TaskFailedValidation` | `"Failed Validation"` |
| `TaskStarted` | `"Started"` |
| `TaskPausing` | `"Pausing"` |
| `TaskTerminated` | `"Terminated"` |
| `TaskKilling` | `"Killing"` |
| `TaskKilled` | `"Killed"` |
| `TaskRestarting` | `"Restarting"` |
| `TaskNotRestarting` | `"Not Restarting"` |
| `TaskRestartSignal` | `"Restart Signaled"` |
| `TaskSignaling` | `"Signaling"` |
| `TaskDownloadingArtifacts` | `"Downloading Artifacts"` |
| `TaskArtifactDownloadFailed` | `"Failed Artifact Download"` |
| `TaskBuildingTaskDir` | `"Building Task Directory"` |
| `TaskSetup` | `"Task Setup"` |
| `TaskDiskExceeded` | `"Disk Resources Exceeded"` |
| `TaskSiblingFailed` | `"Sibling Task Failed"` |
| `TaskDriverMessage` | `"Driver"` |
| `TaskLeaderDead` | `"Leader Task Dead"` |
| `TaskMainDead` | `"Main Tasks Dead"` |
| `TaskHookFailed` | `"Task hook failed"` |
| `TaskHookMessage` | `"Task hook message"` |
| `TaskRestoreFailed` | `"Failed Restoring Task"` |
| `TaskPluginUnhealthy` | `"Plugin became unhealthy"` |
| `TaskPluginHealthy` | `"Plugin became healthy"` |
| `TaskClientReconnected` | `"Reconnected"` |
| `TaskWaitingShuttingDownDelay` | `"Waiting for shutdown delay"` |
| `TaskSkippingShutdownDelay` | `"Skipping shutdown delay"` |
| `TaskRunning` | `"Running"` |
| `ConstraintDistinctProperty` | `"distinct_property"` |
| `ConstraintDistinctHosts` | `"distinct_hosts"` |
| `ConstraintRegex` | `"regexp"` |
| `ConstraintVersion` | `"version"` |
| `ConstraintSemver` | `"semver"` |
| `ConstraintSetContains` | `"set_contains"` |
| `ConstraintSetContainsAll` | `"set_contains_all"` |
| `ConstraintSetContainsAny` | `"set_contains_any"` |
| `ConstraintAttributeIsSet` | `"is_set"` |
| `ConstraintAttributeIsNotSet` | `"is_not_set"` |
| `VaultChangeModeNoop` | `"noop"` |
| `VaultChangeModeSignal` | `"signal"` |
| `VaultChangeModeRestart` | `"restart"` |
| `LastRescheduleSuccess` | `"ok"` |
| `LastRescheduleFailedToPlace` | `"no placement"` |

### 变量

| 名称 | 值 |
|------|----|
| `ValidPolicyName` | `regexp.MustCompile("^[a-zA-Z0-9-]{1,128}$")` |
| `b32` | `base32.NewEncoding(strings.ToLower("abcdefghijklmnopqrstu...` |
| `validNamespaceName` | `regexp.MustCompile("^[a-zA-Z0-9-]{1,128}$")` |
| `validSecretName` | `regexp.MustCompile("^[a-zA-Z0-9_]{1,128}$")` |
| `DefaultUpdateStrategy` | `&UpdateStrategy{...}` |
| `DefaultServiceJobRestartPolicy` | `RestartPolicy{...}` |
| `DefaultBatchJobRestartPolicy` | `RestartPolicy{...}` |
| `DefaultServiceJobReschedulePolicy` | `ReschedulePolicy{...}` |
| `DefaultBatchJobReschedulePolicy` | `ReschedulePolicy{...}` |
| `RescheduleDelayFunctions` | `[]string{...}` |
| `TemplateChangeModeInvalidError` | `errors.New("Invalid change mode. Must be one of the follo...` |
| `VaultUnrecoverableError` | `regexp.MustCompile(`Code:\s+40(0\|3\|4)`)` |
| `MsgpackHandle` | `*ast.FuncLit()` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewNamespacedID` | - | `id string, ns string` | `NamespacedID` | [L239](file:///d:/claude/nomad/nomad/structs/structs.go#L239) |
| `String` | `n *NamespacedID` | - | `string` | [L246](file:///d:/claude/nomad/nomad/structs/structs.go#L246) |
| `IsForwarded` | `i *InternalRpcInfo` | - | `bool` | [L272](file:///d:/claude/nomad/nomad/structs/structs.go#L272) |
| `SetForwarded` | `i *InternalRpcInfo` | - | - | [L277](file:///d:/claude/nomad/nomad/structs/structs.go#L277) |
| `TimeToBlock` | `q *QueryOptions` | - | `time.Duration` | [L338](file:///d:/claude/nomad/nomad/structs/structs.go#L338) |
| `SetTimeToBlock` | `q *QueryOptions` | `t time.Duration` | - | [L350](file:///d:/claude/nomad/nomad/structs/structs.go#L350) |
| `RequestRegion` | `q *QueryOptions` | - | `string` | [L354](file:///d:/claude/nomad/nomad/structs/structs.go#L354) |
| `RequestNamespace` | `q *QueryOptions` | - | `string` | [L363](file:///d:/claude/nomad/nomad/structs/structs.go#L363) |
| `IsRead` | `q *QueryOptions` | - | `bool` | [L371](file:///d:/claude/nomad/nomad/structs/structs.go#L371) |
| `AllowStaleRead` | `q *QueryOptions` | - | `bool` | [L375](file:///d:/claude/nomad/nomad/structs/structs.go#L375) |
| `GetAuthToken` | `q *QueryOptions` | - | `string` | [L379](file:///d:/claude/nomad/nomad/structs/structs.go#L379) |
| `SetIdentity` | `q *QueryOptions` | `identity *AuthenticatedIdentity` | - | [L383](file:///d:/claude/nomad/nomad/structs/structs.go#L383) |
| `GetIdentity` | `q *QueryOptions` | - | `*AuthenticatedIdentity` | [L387](file:///d:/claude/nomad/nomad/structs/structs.go#L387) |
| `TimeToBlock` | `w *WriteRequest` | - | `time.Duration` | [L456](file:///d:/claude/nomad/nomad/structs/structs.go#L456) |
| `SetTimeToBlock` | `w *WriteRequest` | `_ time.Duration` | - | [L460](file:///d:/claude/nomad/nomad/structs/structs.go#L460) |
| `RequestRegion` | `w *WriteRequest` | - | `string` | [L463](file:///d:/claude/nomad/nomad/structs/structs.go#L463) |
| `RequestNamespace` | `w *WriteRequest` | - | `string` | [L473](file:///d:/claude/nomad/nomad/structs/structs.go#L473) |
| `IsRead` | `w *WriteRequest` | - | `bool` | [L481](file:///d:/claude/nomad/nomad/structs/structs.go#L481) |
| `AllowStaleRead` | `w *WriteRequest` | - | `bool` | [L485](file:///d:/claude/nomad/nomad/structs/structs.go#L485) |
| `GetAuthToken` | `w *WriteRequest` | - | `string` | [L489](file:///d:/claude/nomad/nomad/structs/structs.go#L489) |
| `SetIdentity` | `w *WriteRequest` | `identity *AuthenticatedIdentity` | - | [L493](file:///d:/claude/nomad/nomad/structs/structs.go#L493) |
| `GetIdentity` | `w *WriteRequest` | - | `*AuthenticatedIdentity` | [L497](file:///d:/claude/nomad/nomad/structs/structs.go#L497) |
| `GetACLToken` | `ai *AuthenticatedIdentity` | - | `*ACLToken` | [L531](file:///d:/claude/nomad/nomad/structs/structs.go#L531) |
| `GetClaims` | `ai *AuthenticatedIdentity` | - | `*IdentityClaims` | [L538](file:///d:/claude/nomad/nomad/structs/structs.go#L538) |
| `String` | `ai *AuthenticatedIdentity` | - | `string` | [L545](file:///d:/claude/nomad/nomad/structs/structs.go#L545) |
| `IsExpired` | `ai *AuthenticatedIdentity` | `now time.Time` | `bool` | [L567](file:///d:/claude/nomad/nomad/structs/structs.go#L567) |
| `Validate` | `r *JobScaleRequest` | - | `error` | [L878](file:///d:/claude/nomad/nomad/structs/structs.go#L878) |
| `ShouldBeFiltered` | `req *EvalListRequest` | `e *Evaluation` | `bool` | [L1040](file:///d:/claude/nomad/nomad/structs/structs.go#L1040) |
| `GetWaitIndex` | `e *EvalDequeueResponse` | - | `uint64` | [L1679](file:///d:/claude/nomad/nomad/structs/structs.go#L1679) |
| `String` | `ne *NodeEvent` | - | `string` | [L1810](file:///d:/claude/nomad/nomad/structs/structs.go#L1810) |
| `Copy` | `ne *NodeEvent` | - | `*NodeEvent` | [L1819](file:///d:/claude/nomad/nomad/structs/structs.go#L1819) |
| `NewNodeEvent` | - | - | `*NodeEvent` | [L1828](file:///d:/claude/nomad/nomad/structs/structs.go#L1828) |
| `SetMessage` | `ne *NodeEvent` | `msg string` | `*NodeEvent` | [L1833](file:///d:/claude/nomad/nomad/structs/structs.go#L1833) |
| `SetSubsystem` | `ne *NodeEvent` | `sys string` | `*NodeEvent` | [L1839](file:///d:/claude/nomad/nomad/structs/structs.go#L1839) |
| `SetTimestamp` | `ne *NodeEvent` | `ts time.Time` | `*NodeEvent` | [L1845](file:///d:/claude/nomad/nomad/structs/structs.go#L1845) |
| `AddDetail` | `ne *NodeEvent` | `k string, v string` | `*NodeEvent` | [L1851](file:///d:/claude/nomad/nomad/structs/structs.go#L1851) |
| `ShouldDrainNode` | - | `status string` | `bool` | [L1868](file:///d:/claude/nomad/nomad/structs/structs.go#L1868) |
| `ValidNodeStatus` | - | `status string` | `bool` | [L1880](file:///d:/claude/nomad/nomad/structs/structs.go#L1880) |
| `Copy` | `d *DrainStrategy` | - | `*DrainStrategy` | [L1921](file:///d:/claude/nomad/nomad/structs/structs.go#L1921) |
| `DeadlineTime` | `d *DrainStrategy` | - | `infinite bool, deadline time.Time` | [L1934](file:///d:/claude/nomad/nomad/structs/structs.go#L1934) |
| `Equal` | `d *DrainStrategy` | `o *DrainStrategy` | `bool` | [L1953](file:///d:/claude/nomad/nomad/structs/structs.go#L1953) |
| `Copy` | `m *DrainMetadata` | - | `*DrainMetadata` | [L2003](file:///d:/claude/nomad/nomad/structs/structs.go#L2003) |
| `GetID` | `n *Node` | - | `string` | [L2145](file:///d:/claude/nomad/nomad/structs/structs.go#L2145) |
| `Sanitize` | `n *Node` | - | `*Node` | [L2154](file:///d:/claude/nomad/nomad/structs/structs.go#L2154) |
| `Ready` | `n *Node` | - | `bool` | [L2167](file:///d:/claude/nomad/nomad/structs/structs.go#L2167) |
| `Canonicalize` | `n *Node` | - | - | [L2171](file:///d:/claude/nomad/nomad/structs/structs.go#L2171) |
| `Copy` | `n *Node` | - | `*Node` | [L2226](file:///d:/claude/nomad/nomad/structs/structs.go#L2226) |
| `UnresponsiveStatus` | `n *Node` | - | `bool` | [L2249](file:///d:/claude/nomad/nomad/structs/structs.go#L2249) |
| `TerminalStatus` | `n *Node` | - | `bool` | [L2260](file:///d:/claude/nomad/nomad/structs/structs.go#L2260) |
| `IsInAnyDC` | `n *Node` | `datacenters []string` | `bool` | [L2269](file:///d:/claude/nomad/nomad/structs/structs.go#L2269) |
| `IsInPool` | `n *Node` | `pool string` | `bool` | [L2280](file:///d:/claude/nomad/nomad/structs/structs.go#L2280) |
| `HasEvent` | `n *Node` | `msg string` | `bool` | [L2285](file:///d:/claude/nomad/nomad/structs/structs.go#L2285) |
| `Stub` | `n *Node` | `fields *NodeStubFields` | `*NodeListStub` | [L2295](file:///d:/claude/nomad/nomad/structs/structs.go#L2295) |
| `DefaultResources` | - | - | `*Resources` | [L2387](file:///d:/claude/nomad/nomad/structs/structs.go#L2387) |
| `MinResources` | - | - | `*Resources` | [L2400](file:///d:/claude/nomad/nomad/structs/structs.go#L2400) |
| `DiskInBytes` | `r *Resources` | - | `int64` | [L2409](file:///d:/claude/nomad/nomad/structs/structs.go#L2409) |
| `Validate` | `r *Resources` | - | `error` | [L2419](file:///d:/claude/nomad/nomad/structs/structs.go#L2419) |
| `Merge` | `r *Resources` | `other *Resources` | - | [L2476](file:///d:/claude/nomad/nomad/structs/structs.go#L2476) |
| `Equal` | `r *Resources` | `o *Resources` | `bool` | [L2506](file:///d:/claude/nomad/nomad/structs/structs.go#L2506) |
| `Copy` | `d *ResourceDevices` | - | `ResourceDevices` | [L2532](file:///d:/claude/nomad/nomad/structs/structs.go#L2532) |
| `Equal` | `d *ResourceDevices` | `o *ResourceDevices` | `bool` | [L2546](file:///d:/claude/nomad/nomad/structs/structs.go#L2546) |
| `Canonicalize` | `r *Resources` | - | - | [L2572](file:///d:/claude/nomad/nomad/structs/structs.go#L2572) |
| `MeetsMinResources` | `r *Resources` | - | `error` | [L2593](file:///d:/claude/nomad/nomad/structs/structs.go#L2593) |
| `Copy` | `r *Resources` | - | `*Resources` | [L2606](file:///d:/claude/nomad/nomad/structs/structs.go#L2606) |
| `NetIndex` | `r *Resources` | `n *NetworkResource` | `int` | [L2626](file:///d:/claude/nomad/nomad/structs/structs.go#L2626) |
| `Add` | `r *Resources` | `delta *Resources` | - | [L2633](file:///d:/claude/nomad/nomad/structs/structs.go#L2633) |
| `GoString` | `r *Resources` | - | `string` | [L2678](file:///d:/claude/nomad/nomad/structs/structs.go#L2678) |
| `Equal` | `n *NodeNetworkResource` | `o *NodeNetworkResource` | `bool` | [L2694](file:///d:/claude/nomad/nomad/structs/structs.go#L2694) |
| `Copy` | `n *NodeNetworkResource` | - | `*NodeNetworkResource` | [L2698](file:///d:/claude/nomad/nomad/structs/structs.go#L2698) |
| `HasAlias` | `n *NodeNetworkResource` | `alias string` | `bool` | [L2714](file:///d:/claude/nomad/nomad/structs/structs.go#L2714) |
| `Validate` | `n *NodeNetworkAF` | - | `error` | [L2731](file:///d:/claude/nomad/nomad/structs/structs.go#L2731) |
| `Copy` | `m *AllocatedPortMapping` | - | `*AllocatedPortMapping` | [L2757](file:///d:/claude/nomad/nomad/structs/structs.go#L2757) |
| `Equal` | `m *AllocatedPortMapping` | `o *AllocatedPortMapping` | `bool` | [L2767](file:///d:/claude/nomad/nomad/structs/structs.go#L2767) |
| `Equal` | `p *AllocatedPorts` | `o AllocatedPorts` | `bool` | [L2788](file:///d:/claude/nomad/nomad/structs/structs.go#L2788) |
| `Get` | `p *AllocatedPorts` | `label string` | `AllocatedPortMapping, bool` | [L2794](file:///d:/claude/nomad/nomad/structs/structs.go#L2794) |
| `Equal` | `d *DNSConfig` | `o *DNSConfig` | `bool` | [L2837](file:///d:/claude/nomad/nomad/structs/structs.go#L2837) |
| `Copy` | `d *DNSConfig` | - | `*DNSConfig` | [L2854](file:///d:/claude/nomad/nomad/structs/structs.go#L2854) |
| `IsZero` | `d *DNSConfig` | - | `bool` | [L2865](file:///d:/claude/nomad/nomad/structs/structs.go#L2865) |
| `Hash` | `n *NetworkResource` | - | `uint32` | [L2890](file:///d:/claude/nomad/nomad/structs/structs.go#L2890) |
| `Equal` | `n *NetworkResource` | `other *NetworkResource` | `bool` | [L2905](file:///d:/claude/nomad/nomad/structs/structs.go#L2905) |
| `Canonicalize` | `n *NetworkResource` | - | - | [L2909](file:///d:/claude/nomad/nomad/structs/structs.go#L2909) |
| `Copy` | `n *NetworkResource` | - | `*NetworkResource` | [L2932](file:///d:/claude/nomad/nomad/structs/structs.go#L2932) |
| `Add` | `n *NetworkResource` | `delta *NetworkResource` | - | [L2952](file:///d:/claude/nomad/nomad/structs/structs.go#L2952) |
| `GoString` | `n *NetworkResource` | - | `string` | [L2960](file:///d:/claude/nomad/nomad/structs/structs.go#L2960) |
| `PortLabels` | `n *NetworkResource` | - | `map[string]int` | [L2965](file:///d:/claude/nomad/nomad/structs/structs.go#L2965) |
| `IsIPv6` | `n *NetworkResource` | - | `bool` | [L2977](file:///d:/claude/nomad/nomad/structs/structs.go#L2977) |
| `Copy` | `ns *Networks` | - | `Networks` | [L2985](file:///d:/claude/nomad/nomad/structs/structs.go#L2985) |
| `Port` | `ns *Networks` | `label string` | `AllocatedPortMapping` | [L2998](file:///d:/claude/nomad/nomad/structs/structs.go#L2998) |
| `NetIndex` | `ns *Networks` | `n *NetworkResource` | `int` | [L3025](file:///d:/claude/nomad/nomad/structs/structs.go#L3025) |
| `Modes` | `ns *Networks` | - | `*set.Set[string]` | [L3035](file:///d:/claude/nomad/nomad/structs/structs.go#L3035) |
| `String` | `r *RequestedDevice` | - | `string` | [L3066](file:///d:/claude/nomad/nomad/structs/structs.go#L3066) |
| `Equal` | `r *RequestedDevice` | `o *RequestedDevice` | `bool` | [L3070](file:///d:/claude/nomad/nomad/structs/structs.go#L3070) |
| `Copy` | `r *RequestedDevice` | - | `*RequestedDevice` | [L3083](file:///d:/claude/nomad/nomad/structs/structs.go#L3083) |
| `ID` | `r *RequestedDevice` | - | `*DeviceIdTuple` | [L3095](file:///d:/claude/nomad/nomad/structs/structs.go#L3095) |
| `Validate` | `r *RequestedDevice` | - | `error` | [L3120](file:///d:/claude/nomad/nomad/structs/structs.go#L3120) |
| `Copy` | `n *NodeResources` | - | `*NodeResources` | [L3181](file:///d:/claude/nomad/nomad/structs/structs.go#L3181) |
| `Comparable` | `n *NodeResources` | - | `*ComparableResources` | [L3216](file:///d:/claude/nomad/nomad/structs/structs.go#L3216) |
| `Merge` | `n *NodeResources` | `o *NodeResources` | - | [L3244](file:///d:/claude/nomad/nomad/structs/structs.go#L3244) |
| `lookupNetworkByDevice` | - | `nets []*NodeNetworkResource, name string` | `int, *NodeNetworkResource` | [L3276](file:///d:/claude/nomad/nomad/structs/structs.go#L3276) |
| `Equal` | `n *NodeResources` | `o *NodeResources` | `bool` | [L3285](file:///d:/claude/nomad/nomad/structs/structs.go#L3285) |
| `Equal` | `ns *Networks` | `o *Networks` | `bool` | [L3320](file:///d:/claude/nomad/nomad/structs/structs.go#L3320) |
| `DevicesEquals` | - | `d1 []*NodeDeviceResource, d2 []*NodeDeviceResource` | `bool` | [L3343](file:///d:/claude/nomad/nomad/structs/structs.go#L3343) |
| `NodeNetworksEquals` | - | `n1 []*NodeNetworkResource, n2 []*NodeNetworkResource` | `bool` | [L3360](file:///d:/claude/nomad/nomad/structs/structs.go#L3360) |
| `Merge` | `n *NodeMemoryResources` | `o *NodeMemoryResources` | - | [L3385](file:///d:/claude/nomad/nomad/structs/structs.go#L3385) |
| `Equal` | `n *NodeMemoryResources` | `o *NodeMemoryResources` | `bool` | [L3395](file:///d:/claude/nomad/nomad/structs/structs.go#L3395) |
| `Merge` | `n *NodeDiskResources` | `o *NodeDiskResources` | - | [L3417](file:///d:/claude/nomad/nomad/structs/structs.go#L3417) |
| `Equal` | `n *NodeDiskResources` | `o *NodeDiskResources` | `bool` | [L3426](file:///d:/claude/nomad/nomad/structs/structs.go#L3426) |
| `String` | `id *DeviceIdTuple` | - | `string` | [L3449](file:///d:/claude/nomad/nomad/structs/structs.go#L3449) |
| `Matches` | `id *DeviceIdTuple` | `other *DeviceIdTuple` | `bool` | [L3458](file:///d:/claude/nomad/nomad/structs/structs.go#L3458) |
| `Equal` | `id *DeviceIdTuple` | `o *DeviceIdTuple` | `bool` | [L3479](file:///d:/claude/nomad/nomad/structs/structs.go#L3479) |
| `ID` | `n *NodeDeviceResource` | - | `*DeviceIdTuple` | [L3499](file:///d:/claude/nomad/nomad/structs/structs.go#L3499) |
| `Copy` | `n *NodeDeviceResource` | - | `*NodeDeviceResource` | [L3511](file:///d:/claude/nomad/nomad/structs/structs.go#L3511) |
| `Equal` | `n *NodeDeviceResource` | `o *NodeDeviceResource` | `bool` | [L3533](file:///d:/claude/nomad/nomad/structs/structs.go#L3533) |
| `Equal` | `n *NodeDevice` | `o *NodeDevice` | `bool` | [L3595](file:///d:/claude/nomad/nomad/structs/structs.go#L3595) |
| `Copy` | `n *NodeDevice` | - | `*NodeDevice` | [L3617](file:///d:/claude/nomad/nomad/structs/structs.go#L3617) |
| `Equal` | `n *NodeDeviceLocality` | `o *NodeDeviceLocality` | `bool` | [L3638](file:///d:/claude/nomad/nomad/structs/structs.go#L3638) |
| `Copy` | `n *NodeDeviceLocality` | - | `*NodeDeviceLocality` | [L3654](file:///d:/claude/nomad/nomad/structs/structs.go#L3654) |
| `Copy` | `n *NodeReservedResources` | - | `*NodeReservedResources` | [L3673](file:///d:/claude/nomad/nomad/structs/structs.go#L3673) |
| `Comparable` | `n *NodeReservedResources` | - | `*ComparableResources` | [L3685](file:///d:/claude/nomad/nomad/structs/structs.go#L3685) |
| `UsesCores` | `a *AllocatedResources` | - | `bool` | [L3743](file:///d:/claude/nomad/nomad/structs/structs.go#L3743) |
| `Copy` | `a *AllocatedResources` | - | `*AllocatedResources` | [L3752](file:///d:/claude/nomad/nomad/structs/structs.go#L3752) |
| `Comparable` | `a *AllocatedResources` | - | `*ComparableResources` | [L3780](file:///d:/claude/nomad/nomad/structs/structs.go#L3780) |
| `OldTaskResources` | `a *AllocatedResources` | - | `map[string]*Resources` | [L3841](file:///d:/claude/nomad/nomad/structs/structs.go#L3841) |
| `Canonicalize` | `a *AllocatedResources` | - | - | [L3856](file:///d:/claude/nomad/nomad/structs/structs.go#L3856) |
| `Copy` | `a *AllocatedTaskResources` | - | `*AllocatedTaskResources` | [L3881](file:///d:/claude/nomad/nomad/structs/structs.go#L3881) |
| `NetIndex` | `a *AllocatedTaskResources` | `n *NetworkResource` | `int` | [L3904](file:///d:/claude/nomad/nomad/structs/structs.go#L3904) |
| `Add` | `a *AllocatedTaskResources` | `delta *AllocatedTaskResources` | - | [L3908](file:///d:/claude/nomad/nomad/structs/structs.go#L3908) |
| `Max` | `a *AllocatedTaskResources` | `other *AllocatedTaskResources` | - | [L3937](file:///d:/claude/nomad/nomad/structs/structs.go#L3937) |
| `Comparable` | `a *AllocatedTaskResources` | - | `*ComparableResources` | [L3968](file:///d:/claude/nomad/nomad/structs/structs.go#L3968) |
| `Subtract` | `a *AllocatedTaskResources` | `delta *AllocatedTaskResources` | - | [L3987](file:///d:/claude/nomad/nomad/structs/structs.go#L3987) |
| `Copy` | `a *AllocatedSharedResources` | - | `AllocatedSharedResources` | [L4003](file:///d:/claude/nomad/nomad/structs/structs.go#L4003) |
| `Add` | `a *AllocatedSharedResources` | `delta *AllocatedSharedResources` | - | [L4011](file:///d:/claude/nomad/nomad/structs/structs.go#L4011) |
| `Subtract` | `a *AllocatedSharedResources` | `delta *AllocatedSharedResources` | - | [L4020](file:///d:/claude/nomad/nomad/structs/structs.go#L4020) |
| `Canonicalize` | `a *AllocatedSharedResources` | - | - | [L4039](file:///d:/claude/nomad/nomad/structs/structs.go#L4039) |
| `Add` | `a *AllocatedCpuResources` | `delta *AllocatedCpuResources` | - | [L4062](file:///d:/claude/nomad/nomad/structs/structs.go#L4062) |
| `Subtract` | `a *AllocatedCpuResources` | `delta *AllocatedCpuResources` | - | [L4077](file:///d:/claude/nomad/nomad/structs/structs.go#L4077) |
| `Max` | `a *AllocatedCpuResources` | `other *AllocatedCpuResources` | - | [L4092](file:///d:/claude/nomad/nomad/structs/structs.go#L4092) |
| `Add` | `a *AllocatedMemoryResources` | `delta *AllocatedMemoryResources` | - | [L4112](file:///d:/claude/nomad/nomad/structs/structs.go#L4112) |
| `Subtract` | `a *AllocatedMemoryResources` | `delta *AllocatedMemoryResources` | - | [L4125](file:///d:/claude/nomad/nomad/structs/structs.go#L4125) |
| `Max` | `a *AllocatedMemoryResources` | `other *AllocatedMemoryResources` | - | [L4138](file:///d:/claude/nomad/nomad/structs/structs.go#L4138) |
| `Index` | `a *AllocatedDevices` | `d *AllocatedDeviceResource` | `int` | [L4155](file:///d:/claude/nomad/nomad/structs/structs.go#L4155) |
| `ID` | `a *AllocatedDeviceResource` | - | `*DeviceIdTuple` | [L4181](file:///d:/claude/nomad/nomad/structs/structs.go#L4181) |
| `Add` | `a *AllocatedDeviceResource` | `delta *AllocatedDeviceResource` | - | [L4193](file:///d:/claude/nomad/nomad/structs/structs.go#L4193) |
| `Copy` | `a *AllocatedDeviceResource` | - | `*AllocatedDeviceResource` | [L4201](file:///d:/claude/nomad/nomad/structs/structs.go#L4201) |
| `Add` | `c *ComparableResources` | `delta *ComparableResources` | - | [L4221](file:///d:/claude/nomad/nomad/structs/structs.go#L4221) |
| `Subtract` | `c *ComparableResources` | `delta *ComparableResources` | - | [L4230](file:///d:/claude/nomad/nomad/structs/structs.go#L4230) |
| `Copy` | `c *ComparableResources` | - | `*ComparableResources` | [L4239](file:///d:/claude/nomad/nomad/structs/structs.go#L4239) |
| `Superset` | `c *ComparableResources` | `other *ComparableResources` | `bool, string` | [L4250](file:///d:/claude/nomad/nomad/structs/structs.go#L4250) |
| `NetIndex` | `c *ComparableResources` | `n *NetworkResource` | `int` | [L4272](file:///d:/claude/nomad/nomad/structs/structs.go#L4272) |
| `Hash` | `js *JobSubmission` | - | `string` | [L4363](file:///d:/claude/nomad/nomad/structs/structs.go#L4363) |
| `Copy` | `js *JobSubmission` | - | `*JobSubmission` | [L4368](file:///d:/claude/nomad/nomad/structs/structs.go#L4368) |
| `Copy` | `tv *JobVersionTag` | - | `*JobVersionTag` | [L4550](file:///d:/claude/nomad/nomad/structs/structs.go#L4550) |
| `Copy` | `j *JobUIConfig` | - | `*JobUIConfig` | [L4571](file:///d:/claude/nomad/nomad/structs/structs.go#L4571) |
| `Copy` | `l *JobUILink` | - | `*JobUILink` | [L4588](file:///d:/claude/nomad/nomad/structs/structs.go#L4588) |
| `NamespacedID` | `j *Job` | - | `NamespacedID` | [L4599](file:///d:/claude/nomad/nomad/structs/structs.go#L4599) |
| `GetID` | `j *Job` | - | `string` | [L4607](file:///d:/claude/nomad/nomad/structs/structs.go#L4607) |
| `GetNamespace` | `j *Job` | - | `string` | [L4617](file:///d:/claude/nomad/nomad/structs/structs.go#L4617) |
| `GetIDforWorkloadIdentity` | `j *Job` | - | `string` | [L4626](file:///d:/claude/nomad/nomad/structs/structs.go#L4626) |
| `GetCreateIndex` | `j *Job` | - | `uint64` | [L4635](file:///d:/claude/nomad/nomad/structs/structs.go#L4635) |
| `GetModifyIndex` | `j *Job` | - | `uint64` | [L4644](file:///d:/claude/nomad/nomad/structs/structs.go#L4644) |
| `Canonicalize` | `j *Job` | - | - | [L4653](file:///d:/claude/nomad/nomad/structs/structs.go#L4653) |
| `Copy` | `j *Job` | - | `*Job` | [L4704](file:///d:/claude/nomad/nomad/structs/structs.go#L4704) |
| `Validate` | `j *Job` | - | `error` | [L4732](file:///d:/claude/nomad/nomad/structs/structs.go#L4732) |
| `generateServiceShutdownDelayWarnings` | `j *Job` | - | `[]error` | [L4883](file:///d:/claude/nomad/nomad/structs/structs.go#L4883) |
| `generateTaskGroupServiceShutdownDelayWarnings` | - | `tg *TaskGroup` | `[]error` | [L4893](file:///d:/claude/nomad/nomad/structs/structs.go#L4893) |
| `Warnings` | `j *Job` | - | `error` | [L4951](file:///d:/claude/nomad/nomad/structs/structs.go#L4951) |
| `LookupTaskGroup` | `j *Job` | `name string` | `*TaskGroup` | [L4990](file:///d:/claude/nomad/nomad/structs/structs.go#L4990) |
| `CombinedTaskMeta` | `j *Job` | `groupName string, taskName string` | `map[string]string` | [L5005](file:///d:/claude/nomad/nomad/structs/structs.go#L5005) |
| `Stopped` | `j *Job` | - | `bool` | [L5040](file:///d:/claude/nomad/nomad/structs/structs.go#L5040) |
| `HasUpdateStrategy` | `j *Job` | - | `bool` | [L5045](file:///d:/claude/nomad/nomad/structs/structs.go#L5045) |
| `Stub` | `j *Job` | `summary *JobSummary, fields *JobStubFields` | `*JobListStub` | [L5056](file:///d:/claude/nomad/nomad/structs/structs.go#L5056) |
| `IsPeriodic` | `j *Job` | - | `bool` | [L5089](file:///d:/claude/nomad/nomad/structs/structs.go#L5089) |
| `IsPeriodicActive` | `j *Job` | - | `bool` | [L5095](file:///d:/claude/nomad/nomad/structs/structs.go#L5095) |
| `IsParameterized` | `j *Job` | - | `bool` | [L5100](file:///d:/claude/nomad/nomad/structs/structs.go#L5100) |
| `IsMultiregion` | `j *Job` | - | `bool` | [L5105](file:///d:/claude/nomad/nomad/structs/structs.go#L5105) |
| `IsPlugin` | `j *Job` | - | `bool` | [L5110](file:///d:/claude/nomad/nomad/structs/structs.go#L5110) |
| `HasPlugin` | `j *Job` | `id string` | `bool` | [L5122](file:///d:/claude/nomad/nomad/structs/structs.go#L5122) |
| `Vault` | `j *Job` | - | `map[string]map[string]*Vault` | [L5134](file:///d:/claude/nomad/nomad/structs/structs.go#L5134) |
| `Secrets` | `j *Job` | - | `map[string][]string` | [L5157](file:///d:/claude/nomad/nomad/structs/structs.go#L5157) |
| `ConnectTasks` | `j *Job` | - | `[]TaskKind` | [L5189](file:///d:/claude/nomad/nomad/structs/structs.go#L5189) |
| `RequiredSignals` | `j *Job` | - | `map[string]map[string][]string` | [L5205](file:///d:/claude/nomad/nomad/structs/structs.go#L5205) |
| `SpecChanged` | `j *Job` | `new *Job` | `bool` | [L5259](file:///d:/claude/nomad/nomad/structs/structs.go#L5259) |
| `SetSubmitTime` | `j *Job` | - | - | [L5283](file:///d:/claude/nomad/nomad/structs/structs.go#L5283) |
| `Copy` | `js *JobSummary` | - | `*JobSummary` | [L5332](file:///d:/claude/nomad/nomad/structs/structs.go#L5332) |
| `Copy` | `jc *JobChildrenSummary` | - | `*JobChildrenSummary` | [L5352](file:///d:/claude/nomad/nomad/structs/structs.go#L5352) |
| `Copy` | `u *UpdateStrategy` | - | `*UpdateStrategy` | [L5451](file:///d:/claude/nomad/nomad/structs/structs.go#L5451) |
| `Validate` | `u *UpdateStrategy` | - | `error` | [L5461](file:///d:/claude/nomad/nomad/structs/structs.go#L5461) |
| `IsEmpty` | `u *UpdateStrategy` | - | `bool` | [L5504](file:///d:/claude/nomad/nomad/structs/structs.go#L5504) |
| `Rolling` | `u *UpdateStrategy` | - | `bool` | [L5520](file:///d:/claude/nomad/nomad/structs/structs.go#L5520) |
| `Canonicalize` | `m *Multiregion` | - | - | [L5529](file:///d:/claude/nomad/nomad/structs/structs.go#L5529) |
| `Diff` | `m *Multiregion` | `m2 *Multiregion` | `bool` | [L5539](file:///d:/claude/nomad/nomad/structs/structs.go#L5539) |
| `Copy` | `m *Multiregion` | - | `*Multiregion` | [L5543](file:///d:/claude/nomad/nomad/structs/structs.go#L5543) |
| `Validate` | `n *Namespace` | - | `error` | [L5653](file:///d:/claude/nomad/nomad/structs/structs.go#L5653) |
| `SetHash` | `n *Namespace` | - | `[]byte` | [L5700](file:///d:/claude/nomad/nomad/structs/structs.go#L5700) |
| `Copy` | `n *Namespace` | - | `*Namespace` | [L5775](file:///d:/claude/nomad/nomad/structs/structs.go#L5775) |
| `Copy` | `p *PeriodicConfig` | - | `*PeriodicConfig` | [L5903](file:///d:/claude/nomad/nomad/structs/structs.go#L5903) |
| `Validate` | `p *PeriodicConfig` | - | `error` | [L5912](file:///d:/claude/nomad/nomad/structs/structs.go#L5912) |
| `Canonicalize` | `p *PeriodicConfig` | - | - | [L5956](file:///d:/claude/nomad/nomad/structs/structs.go#L5956) |
| `CronParseNext` | - | `fromTime time.Time, spec string` | `t time.Time, err error` | [L5968](file:///d:/claude/nomad/nomad/structs/structs.go#L5968) |
| `Next` | `p *PeriodicConfig` | `fromTime time.Time` | `time.Time, error` | [L5986](file:///d:/claude/nomad/nomad/structs/structs.go#L5986) |
| `GetLocation` | `p *PeriodicConfig` | - | `*time.Location` | [L6037](file:///d:/claude/nomad/nomad/structs/structs.go#L6037) |
| `Validate` | `d *ParameterizedJobConfig` | - | `error` | [L6085](file:///d:/claude/nomad/nomad/structs/structs.go#L6085) |
| `Canonicalize` | `d *ParameterizedJobConfig` | - | - | [L6102](file:///d:/claude/nomad/nomad/structs/structs.go#L6102) |
| `Copy` | `d *ParameterizedJobConfig` | - | `*ParameterizedJobConfig` | [L6108](file:///d:/claude/nomad/nomad/structs/structs.go#L6108) |
| `DispatchedID` | - | `templateID string, idPrefixTemplate string, t time.Time` | `string` | [L6121](file:///d:/claude/nomad/nomad/structs/structs.go#L6121) |
| `Copy` | `d *DispatchPayloadConfig` | - | `*DispatchPayloadConfig` | [L6137](file:///d:/claude/nomad/nomad/structs/structs.go#L6137) |
| `Validate` | `d *DispatchPayloadConfig` | - | `error` | [L6146](file:///d:/claude/nomad/nomad/structs/structs.go#L6146) |
| `Copy` | `d *TaskLifecycleConfig` | - | `*TaskLifecycleConfig` | [L6169](file:///d:/claude/nomad/nomad/structs/structs.go#L6169) |
| `Validate` | `d *TaskLifecycleConfig` | - | `error` | [L6178](file:///d:/claude/nomad/nomad/structs/structs.go#L6178) |
| `Copy` | `j *JobScalingEvents` | - | `*JobScalingEvents` | [L6265](file:///d:/claude/nomad/nomad/structs/structs.go#L6265) |
| `NewScalingEvent` | - | `message string` | `*ScalingEvent` | [L6281](file:///d:/claude/nomad/nomad/structs/structs.go#L6281) |
| `Copy` | `e *ScalingEvent` | - | `*ScalingEvent` | [L6315](file:///d:/claude/nomad/nomad/structs/structs.go#L6315) |
| `JobKey` | `p *ScalingPolicy` | - | `string` | [L6367](file:///d:/claude/nomad/nomad/structs/structs.go#L6367) |
| `Canonicalize` | `p *ScalingPolicy` | `job *Job, tg *TaskGroup, task *Task` | - | [L6382](file:///d:/claude/nomad/nomad/structs/structs.go#L6382) |
| `Copy` | `p *ScalingPolicy` | - | `*ScalingPolicy` | [L6403](file:///d:/claude/nomad/nomad/structs/structs.go#L6403) |
| `Validate` | `p *ScalingPolicy` | - | `error` | [L6430](file:///d:/claude/nomad/nomad/structs/structs.go#L6430) |
| `validateTargetHorizontal` | `p *ScalingPolicy` | - | `mErr multierror.Error` | [L6461](file:///d:/claude/nomad/nomad/structs/structs.go#L6461) |
| `Diff` | `p *ScalingPolicy` | `p2 *ScalingPolicy` | `bool` | [L6481](file:///d:/claude/nomad/nomad/structs/structs.go#L6481) |
| `Stub` | `p *ScalingPolicy` | - | `*ScalingPolicyListStub` | [L6489](file:///d:/claude/nomad/nomad/structs/structs.go#L6489) |
| `GetScalingPolicies` | `j *Job` | - | `[]*ScalingPolicy` | [L6505](file:///d:/claude/nomad/nomad/structs/structs.go#L6505) |
| `UsesDeployments` | `j *Job` | - | `bool` | [L6521](file:///d:/claude/nomad/nomad/structs/structs.go#L6521) |
| `Copy` | `r *RestartPolicy` | - | `*RestartPolicy` | [L6561](file:///d:/claude/nomad/nomad/structs/structs.go#L6561) |
| `Validate` | `r *RestartPolicy` | - | `error` | [L6570](file:///d:/claude/nomad/nomad/structs/structs.go#L6570) |
| `NewRestartPolicy` | - | `jobType string` | `*RestartPolicy` | [L6593](file:///d:/claude/nomad/nomad/structs/structs.go#L6593) |
| `Copy` | `r *ReschedulePolicy` | - | `*ReschedulePolicy` | [L6634](file:///d:/claude/nomad/nomad/structs/structs.go#L6634) |
| `Enabled` | `r *ReschedulePolicy` | - | `bool` | [L6643](file:///d:/claude/nomad/nomad/structs/structs.go#L6643) |
| `Validate` | `r *ReschedulePolicy` | - | `error` | [L6652](file:///d:/claude/nomad/nomad/structs/structs.go#L6652) |
| `isValidDelayFunction` | - | `delayFunc string` | `bool` | [L6712](file:///d:/claude/nomad/nomad/structs/structs.go#L6712) |
| `validateDelayParams` | `r *ReschedulePolicy` | - | `error` | [L6721](file:///d:/claude/nomad/nomad/structs/structs.go#L6721) |
| `viableAttempts` | `r *ReschedulePolicy` | - | `bool, int, time.Duration` | [L6738](file:///d:/claude/nomad/nomad/structs/structs.go#L6738) |
| `NewReschedulePolicy` | - | `jobType string` | `*ReschedulePolicy` | [L6804](file:///d:/claude/nomad/nomad/structs/structs.go#L6804) |
| `DefaultMigrateStrategy` | - | - | `*MigrateStrategy` | [L6832](file:///d:/claude/nomad/nomad/structs/structs.go#L6832) |
| `Validate` | `m *MigrateStrategy` | - | `error` | [L6841](file:///d:/claude/nomad/nomad/structs/structs.go#L6841) |
| `Copy` | `tg *TaskGroup` | - | `*TaskGroup` | [L6966](file:///d:/claude/nomad/nomad/structs/structs.go#L6966) |
| `Canonicalize` | `tg *TaskGroup` | `job *Job` | - | [L7025](file:///d:/claude/nomad/nomad/structs/structs.go#L7025) |
| `NomadServices` | `tg *TaskGroup` | - | `[]*Service` | [L7086](file:///d:/claude/nomad/nomad/structs/structs.go#L7086) |
| `ConsulServices` | `tg *TaskGroup` | - | `[]*Service` | [L7092](file:///d:/claude/nomad/nomad/structs/structs.go#L7092) |
| `filterServices` | `tg *TaskGroup` | `f func(...)` | `[]*Service` | [L7098](file:///d:/claude/nomad/nomad/structs/structs.go#L7098) |
| `Validate` | `tg *TaskGroup` | `j *Job` | `error` | [L7116](file:///d:/claude/nomad/nomad/structs/structs.go#L7116) |
| `validateNetworks` | `tg *TaskGroup` | - | `error` | [L7308](file:///d:/claude/nomad/nomad/structs/structs.go#L7308) |
| `validateServices` | `tg *TaskGroup` | - | `error` | [L7437](file:///d:/claude/nomad/nomad/structs/structs.go#L7437) |
| `validateScriptChecksInGroupServices` | `tg *TaskGroup` | - | `error` | [L7569](file:///d:/claude/nomad/nomad/structs/structs.go#L7569) |
| `validateScalingPolicy` | `tg *TaskGroup` | `j *Job` | `error` | [L7588](file:///d:/claude/nomad/nomad/structs/structs.go#L7588) |
| `Warnings` | `tg *TaskGroup` | `j *Job` | `error` | [L7620](file:///d:/claude/nomad/nomad/structs/structs.go#L7620) |
| `LookupTask` | `tg *TaskGroup` | `name string` | `*Task` | [L7669](file:///d:/claude/nomad/nomad/structs/structs.go#L7669) |
| `UsesConnect` | `tg *TaskGroup` | - | `bool` | [L7683](file:///d:/claude/nomad/nomad/structs/structs.go#L7683) |
| `UsesConnectGateway` | `tg *TaskGroup` | - | `bool` | [L7696](file:///d:/claude/nomad/nomad/structs/structs.go#L7696) |
| `GoString` | `tg *TaskGroup` | - | `string` | [L7707](file:///d:/claude/nomad/nomad/structs/structs.go#L7707) |
| `Replace` | `tg *TaskGroup` | - | `bool` | [L7713](file:///d:/claude/nomad/nomad/structs/structs.go#L7713) |
| `GetDisconnectLostAfter` | `tg *TaskGroup` | - | `time.Duration` | [L7723](file:///d:/claude/nomad/nomad/structs/structs.go#L7723) |
| `GetDisconnectStopTimeout` | `tg *TaskGroup` | - | `*time.Duration` | [L7733](file:///d:/claude/nomad/nomad/structs/structs.go#L7733) |
| `GetConstraints` | `tg *TaskGroup` | - | `[]*Constraint` | [L7741](file:///d:/claude/nomad/nomad/structs/structs.go#L7741) |
| `SetConstraints` | `tg *TaskGroup` | `newConstraints []*Constraint` | - | [L7745](file:///d:/claude/nomad/nomad/structs/structs.go#L7745) |
| `Copy` | `c *CheckRestart` | - | `*CheckRestart` | [L7757](file:///d:/claude/nomad/nomad/structs/structs.go#L7757) |
| `Equal` | `c *CheckRestart` | `o *CheckRestart` | `bool` | [L7767](file:///d:/claude/nomad/nomad/structs/structs.go#L7767) |
| `Validate` | `c *CheckRestart` | - | `error` | [L7787](file:///d:/claude/nomad/nomad/structs/structs.go#L7787) |
| `Equal` | `l *LogConfig` | `o *LogConfig` | `bool` | [L7817](file:///d:/claude/nomad/nomad/structs/structs.go#L7817) |
| `Copy` | `l *LogConfig` | - | `*LogConfig` | [L7837](file:///d:/claude/nomad/nomad/structs/structs.go#L7837) |
| `DefaultLogConfig` | - | - | `*LogConfig` | [L7849](file:///d:/claude/nomad/nomad/structs/structs.go#L7849) |
| `Validate` | `l *LogConfig` | `disk *EphemeralDisk` | `error` | [L7860](file:///d:/claude/nomad/nomad/structs/structs.go#L7860) |
| `UsesCores` | `t *Task` | - | `bool` | [L7988](file:///d:/claude/nomad/nomad/structs/structs.go#L7988) |
| `UsesConnect` | `t *Task` | - | `bool` | [L7996](file:///d:/claude/nomad/nomad/structs/structs.go#L7996) |
| `UsesConnectSidecar` | `t *Task` | - | `bool` | [L8000](file:///d:/claude/nomad/nomad/structs/structs.go#L8000) |
| `IsPrestart` | `t *Task` | - | `bool` | [L8004](file:///d:/claude/nomad/nomad/structs/structs.go#L8004) |
| `IsMain` | `t *Task` | - | `bool` | [L8009](file:///d:/claude/nomad/nomad/structs/structs.go#L8009) |
| `IsPoststart` | `t *Task` | - | `bool` | [L8013](file:///d:/claude/nomad/nomad/structs/structs.go#L8013) |
| `IsPoststop` | `t *Task` | - | `bool` | [L8018](file:///d:/claude/nomad/nomad/structs/structs.go#L8018) |
| `GetIdentity` | `t *Task` | `name string` | `*WorkloadIdentity` | [L8023](file:///d:/claude/nomad/nomad/structs/structs.go#L8023) |
| `GetAction` | `t *Task` | `name string` | `*Action` | [L8032](file:///d:/claude/nomad/nomad/structs/structs.go#L8032) |
| `IdentityHandle` | `t *Task` | `identity *WorkloadIdentity` | `*WIHandle` | [L8043](file:///d:/claude/nomad/nomad/structs/structs.go#L8043) |
| `Copy` | `t *Task` | - | `*Task` | [L8051](file:///d:/claude/nomad/nomad/structs/structs.go#L8051) |
| `Canonicalize` | `t *Task` | `job *Job, tg *TaskGroup` | - | [L8109](file:///d:/claude/nomad/nomad/structs/structs.go#L8109) |
| `GoString` | `t *Task` | - | `string` | [L8191](file:///d:/claude/nomad/nomad/structs/structs.go#L8191) |
| `Validate` | `t *Task` | `jobType string, tg *TaskGroup` | `error` | [L8196](file:///d:/claude/nomad/nomad/structs/structs.go#L8196) |
| `validateServices` | - | `t *Task, tgNetworks Networks` | `error` | [L8434](file:///d:/claude/nomad/nomad/structs/structs.go#L8434) |
| `Warnings` | `t *Task` | - | `error` | [L8592](file:///d:/claude/nomad/nomad/structs/structs.go#L8592) |
| `GetConstraints` | `t *Task` | - | `[]*Constraint` | [L8629](file:///d:/claude/nomad/nomad/structs/structs.go#L8629) |
| `SetConstraints` | `t *Task` | `newConstraints []*Constraint` | - | [L8633](file:///d:/claude/nomad/nomad/structs/structs.go#L8633) |
| `NewTaskKind` | - | `name string, identifier string` | `TaskKind` | [L8647](file:///d:/claude/nomad/nomad/structs/structs.go#L8647) |
| `Name` | `k *TaskKind` | - | `string` | [L8652](file:///d:/claude/nomad/nomad/structs/structs.go#L8652) |
| `Value` | `k *TaskKind` | - | `string` | [L8658](file:///d:/claude/nomad/nomad/structs/structs.go#L8658) |
| `hasPrefix` | `k *TaskKind` | `prefix string` | `bool` | [L8665](file:///d:/claude/nomad/nomad/structs/structs.go#L8665) |
| `IsConnectProxy` | `k *TaskKind` | - | `bool` | [L8670](file:///d:/claude/nomad/nomad/structs/structs.go#L8670) |
| `IsConnectNative` | `k *TaskKind` | - | `bool` | [L8675](file:///d:/claude/nomad/nomad/structs/structs.go#L8675) |
| `IsConnectIngress` | `k *TaskKind` | - | `bool` | [L8680](file:///d:/claude/nomad/nomad/structs/structs.go#L8680) |
| `IsConnectTerminating` | `k *TaskKind` | - | `bool` | [L8685](file:///d:/claude/nomad/nomad/structs/structs.go#L8685) |
| `IsConnectMesh` | `k *TaskKind` | - | `bool` | [L8690](file:///d:/claude/nomad/nomad/structs/structs.go#L8690) |
| `IsAnyConnectGateway` | `k *TaskKind` | - | `bool` | [L8696](file:///d:/claude/nomad/nomad/structs/structs.go#L8696) |
| `ValidateConnectProxyService` | - | `serviceName string, tgServices []*Service` | `error` | [L8734](file:///d:/claude/nomad/nomad/structs/structs.go#L8734) |
| `DefaultTemplate` | - | - | `*Template` | [L8857](file:///d:/claude/nomad/nomad/structs/structs.go#L8857) |
| `Equal` | `t *Template` | `o *Template` | `bool` | [L8865](file:///d:/claude/nomad/nomad/structs/structs.go#L8865) |
| `Copy` | `t *Template` | - | `*Template` | [L8908](file:///d:/claude/nomad/nomad/structs/structs.go#L8908) |
| `Canonicalize` | `t *Template` | - | - | [L8921](file:///d:/claude/nomad/nomad/structs/structs.go#L8921) |
| `Validate` | `t *Template` | - | `error` | [L8927](file:///d:/claude/nomad/nomad/structs/structs.go#L8927) |
| `Warnings` | `t *Template` | - | `error` | [L8989](file:///d:/claude/nomad/nomad/structs/structs.go#L8989) |
| `DiffID` | `t *Template` | - | `string` | [L9001](file:///d:/claude/nomad/nomad/structs/structs.go#L9001) |
| `Equal` | `cs *ChangeScript` | `o *ChangeScript` | `bool` | [L9023](file:///d:/claude/nomad/nomad/structs/structs.go#L9023) |
| `Copy` | `cs *ChangeScript` | - | `*ChangeScript` | [L9042](file:///d:/claude/nomad/nomad/structs/structs.go#L9042) |
| `Validate` | `cs *ChangeScript` | - | `error` | [L9056](file:///d:/claude/nomad/nomad/structs/structs.go#L9056) |
| `Copy` | `wc *WaitConfig` | - | `*WaitConfig` | [L9077](file:///d:/claude/nomad/nomad/structs/structs.go#L9077) |
| `Equal` | `wc *WaitConfig` | `o *WaitConfig` | `bool` | [L9095](file:///d:/claude/nomad/nomad/structs/structs.go#L9095) |
| `Validate` | `wc *WaitConfig` | - | `error` | [L9109](file:///d:/claude/nomad/nomad/structs/structs.go#L9109) |
| `NewTaskState` | - | - | `*TaskState` | [L9170](file:///d:/claude/nomad/nomad/structs/structs.go#L9170) |
| `Canonicalize` | `ts *TaskState` | - | - | [L9178](file:///d:/claude/nomad/nomad/structs/structs.go#L9178) |
| `Copy` | `ts *TaskState` | - | `*TaskState` | [L9184](file:///d:/claude/nomad/nomad/structs/structs.go#L9184) |
| `Successful` | `ts *TaskState` | - | `bool` | [L9204](file:///d:/claude/nomad/nomad/structs/structs.go#L9204) |
| `Equal` | `ts *TaskState` | `o *TaskState` | `bool` | [L9208](file:///d:/claude/nomad/nomad/structs/structs.go#L9208) |
| `PopulateEventDisplayMessage` | `e *TaskEvent` | - | - | [L9446](file:///d:/claude/nomad/nomad/structs/structs.go#L9446) |
| `GoString` | `e *TaskEvent` | - | `string` | [L9569](file:///d:/claude/nomad/nomad/structs/structs.go#L9569) |
| `Equal` | `e *TaskEvent` | `o *TaskEvent` | `bool` | [L9577](file:///d:/claude/nomad/nomad/structs/structs.go#L9577) |
| `SetDisplayMessage` | `e *TaskEvent` | `msg string` | `*TaskEvent` | [L9602](file:///d:/claude/nomad/nomad/structs/structs.go#L9602) |
| `SetMessage` | `e *TaskEvent` | `msg string` | `*TaskEvent` | [L9608](file:///d:/claude/nomad/nomad/structs/structs.go#L9608) |
| `Copy` | `e *TaskEvent` | - | `*TaskEvent` | [L9614](file:///d:/claude/nomad/nomad/structs/structs.go#L9614) |
| `NewTaskEvent` | - | `event string` | `*TaskEvent` | [L9623](file:///d:/claude/nomad/nomad/structs/structs.go#L9623) |
| `SetSetupError` | `e *TaskEvent` | `err error` | `*TaskEvent` | [L9633](file:///d:/claude/nomad/nomad/structs/structs.go#L9633) |
| `SetFailsTask` | `e *TaskEvent` | - | `*TaskEvent` | [L9641](file:///d:/claude/nomad/nomad/structs/structs.go#L9641) |
| `SetDriverError` | `e *TaskEvent` | `err error` | `*TaskEvent` | [L9647](file:///d:/claude/nomad/nomad/structs/structs.go#L9647) |
| `SetExitCode` | `e *TaskEvent` | `c int` | `*TaskEvent` | [L9655](file:///d:/claude/nomad/nomad/structs/structs.go#L9655) |
| `SetSignal` | `e *TaskEvent` | `s int` | `*TaskEvent` | [L9661](file:///d:/claude/nomad/nomad/structs/structs.go#L9661) |
| `SetSignalText` | `e *TaskEvent` | `s string` | `*TaskEvent` | [L9667](file:///d:/claude/nomad/nomad/structs/structs.go#L9667) |
| `SetExitMessage` | `e *TaskEvent` | `err error` | `*TaskEvent` | [L9672](file:///d:/claude/nomad/nomad/structs/structs.go#L9672) |
| `SetKillError` | `e *TaskEvent` | `err error` | `*TaskEvent` | [L9680](file:///d:/claude/nomad/nomad/structs/structs.go#L9680) |
| `SetKillReason` | `e *TaskEvent` | `r string` | `*TaskEvent` | [L9688](file:///d:/claude/nomad/nomad/structs/structs.go#L9688) |
| `SetRestartDelay` | `e *TaskEvent` | `delay time.Duration` | `*TaskEvent` | [L9694](file:///d:/claude/nomad/nomad/structs/structs.go#L9694) |
| `SetRestartReason` | `e *TaskEvent` | `reason string` | `*TaskEvent` | [L9700](file:///d:/claude/nomad/nomad/structs/structs.go#L9700) |
| `SetTaskSignalReason` | `e *TaskEvent` | `r string` | `*TaskEvent` | [L9706](file:///d:/claude/nomad/nomad/structs/structs.go#L9706) |
| `SetTaskSignal` | `e *TaskEvent` | `s os.Signal` | `*TaskEvent` | [L9712](file:///d:/claude/nomad/nomad/structs/structs.go#L9712) |
| `SetDownloadError` | `e *TaskEvent` | `err error` | `*TaskEvent` | [L9718](file:///d:/claude/nomad/nomad/structs/structs.go#L9718) |
| `SetValidationError` | `e *TaskEvent` | `err error` | `*TaskEvent` | [L9726](file:///d:/claude/nomad/nomad/structs/structs.go#L9726) |
| `SetKillTimeout` | `e *TaskEvent` | `timeout time.Duration, maxTimeout time.Duration` | `*TaskEvent` | [L9734](file:///d:/claude/nomad/nomad/structs/structs.go#L9734) |
| `SetDiskLimit` | `e *TaskEvent` | `limit int64` | `*TaskEvent` | [L9741](file:///d:/claude/nomad/nomad/structs/structs.go#L9741) |
| `SetFailedSibling` | `e *TaskEvent` | `sibling string` | `*TaskEvent` | [L9747](file:///d:/claude/nomad/nomad/structs/structs.go#L9747) |
| `SetVaultRenewalError` | `e *TaskEvent` | `err error` | `*TaskEvent` | [L9753](file:///d:/claude/nomad/nomad/structs/structs.go#L9753) |
| `SetDriverMessage` | `e *TaskEvent` | `m string` | `*TaskEvent` | [L9761](file:///d:/claude/nomad/nomad/structs/structs.go#L9761) |
| `SetOOMKilled` | `e *TaskEvent` | `oom bool` | `*TaskEvent` | [L9767](file:///d:/claude/nomad/nomad/structs/structs.go#L9767) |
| `Equal` | `ta *TaskArtifact` | `o *TaskArtifact` | `bool` | [L9803](file:///d:/claude/nomad/nomad/structs/structs.go#L9803) |
| `Copy` | `ta *TaskArtifact` | - | `*TaskArtifact` | [L9826](file:///d:/claude/nomad/nomad/structs/structs.go#L9826) |
| `GoString` | `ta *TaskArtifact` | - | `string` | [L9841](file:///d:/claude/nomad/nomad/structs/structs.go#L9841) |
| `DiffID` | `ta *TaskArtifact` | - | `string` | [L9846](file:///d:/claude/nomad/nomad/structs/structs.go#L9846) |
| `hashStringMap` | - | `h hash.Hash, m map[string]string` | - | [L9851](file:///d:/claude/nomad/nomad/structs/structs.go#L9851) |
| `Hash` | `ta *TaskArtifact` | - | `string` | [L9865](file:///d:/claude/nomad/nomad/structs/structs.go#L9865) |
| `Validate` | `ta *TaskArtifact` | - | `error` | [L9883](file:///d:/claude/nomad/nomad/structs/structs.go#L9883) |
| `validateChecksum` | `ta *TaskArtifact` | - | `error` | [L9915](file:///d:/claude/nomad/nomad/structs/structs.go#L9915) |
| `Equal` | `c *Constraint` | `o *Constraint` | `bool` | [L9987](file:///d:/claude/nomad/nomad/structs/structs.go#L9987) |
| `Copy` | `c *Constraint` | - | `*Constraint` | [L9994](file:///d:/claude/nomad/nomad/structs/structs.go#L9994) |
| `String` | `c *Constraint` | - | `string` | [L10005](file:///d:/claude/nomad/nomad/structs/structs.go#L10005) |
| `Validate` | `c *Constraint` | - | `error` | [L10009](file:///d:/claude/nomad/nomad/structs/structs.go#L10009) |
| `DiffID` | `c *Constraint` | - | `string` | [L10078](file:///d:/claude/nomad/nomad/structs/structs.go#L10078) |
| `Equal` | `xs *Constraints` | `ys *Constraints` | `bool` | [L10085](file:///d:/claude/nomad/nomad/structs/structs.go#L10085) |
| `Equal` | `a *Affinity` | `o *Affinity` | `bool` | [L10116](file:///d:/claude/nomad/nomad/structs/structs.go#L10116) |
| `Copy` | `a *Affinity` | - | `*Affinity` | [L10133](file:///d:/claude/nomad/nomad/structs/structs.go#L10133) |
| `String` | `a *Affinity` | - | `string` | [L10145](file:///d:/claude/nomad/nomad/structs/structs.go#L10145) |
| `Validate` | `a *Affinity` | - | `error` | [L10149](file:///d:/claude/nomad/nomad/structs/structs.go#L10149) |
| `DiffID` | `a *Affinity` | - | `string` | [L10199](file:///d:/claude/nomad/nomad/structs/structs.go#L10199) |
| `Equal` | `s *Spread` | `o *Spread` | `bool` | [L10219](file:///d:/claude/nomad/nomad/structs/structs.go#L10219) |
| `Equal` | `xs *Affinities` | `ys *Affinities` | `bool` | [L10237](file:///d:/claude/nomad/nomad/structs/structs.go#L10237) |
| `Copy` | `s *Spread` | - | `*Spread` | [L10259](file:///d:/claude/nomad/nomad/structs/structs.go#L10259) |
| `String` | `s *Spread` | - | `string` | [L10270](file:///d:/claude/nomad/nomad/structs/structs.go#L10270) |
| `Validate` | `s *Spread` | - | `error` | [L10278](file:///d:/claude/nomad/nomad/structs/structs.go#L10278) |
| `Copy` | `s *SpreadTarget` | - | `*SpreadTarget` | [L10320](file:///d:/claude/nomad/nomad/structs/structs.go#L10320) |
| `String` | `s *SpreadTarget` | - | `string` | [L10330](file:///d:/claude/nomad/nomad/structs/structs.go#L10330) |
| `Equal` | `s *SpreadTarget` | `o *SpreadTarget` | `bool` | [L10338](file:///d:/claude/nomad/nomad/structs/structs.go#L10338) |
| `DefaultEphemeralDisk` | - | - | `*EphemeralDisk` | [L10365](file:///d:/claude/nomad/nomad/structs/structs.go#L10365) |
| `Equal` | `d *EphemeralDisk` | `o *EphemeralDisk` | `bool` | [L10371](file:///d:/claude/nomad/nomad/structs/structs.go#L10371) |
| `Validate` | `d *EphemeralDisk` | - | `error` | [L10387](file:///d:/claude/nomad/nomad/structs/structs.go#L10387) |
| `Copy` | `d *EphemeralDisk` | - | `*EphemeralDisk` | [L10395](file:///d:/claude/nomad/nomad/structs/structs.go#L10395) |
| `IdentityName` | `v *Vault` | - | `string` | [L10454](file:///d:/claude/nomad/nomad/structs/structs.go#L10454) |
| `Equal` | `v *Vault` | `o *Vault` | `bool` | [L10458](file:///d:/claude/nomad/nomad/structs/structs.go#L10458) |
| `Copy` | `v *Vault` | - | `*Vault` | [L10484](file:///d:/claude/nomad/nomad/structs/structs.go#L10484) |
| `Canonicalize` | `v *Vault` | - | - | [L10494](file:///d:/claude/nomad/nomad/structs/structs.go#L10494) |
| `Validate` | `v *Vault` | - | `error` | [L10508](file:///d:/claude/nomad/nomad/structs/structs.go#L10508) |
| `Equal` | `s *Secret` | `o *Secret` | `bool` | [L10536](file:///d:/claude/nomad/nomad/structs/structs.go#L10536) |
| `Copy` | `s *Secret` | - | `*Secret` | [L10557](file:///d:/claude/nomad/nomad/structs/structs.go#L10557) |
| `Validate` | `s *Secret` | - | `error` | [L10578](file:///d:/claude/nomad/nomad/structs/structs.go#L10578) |
| `Canonicalize` | `s *Secret` | - | - | [L10614](file:///d:/claude/nomad/nomad/structs/structs.go#L10614) |
| `Copy` | `rt *RescheduleTracker` | - | `*RescheduleTracker` | [L10640](file:///d:/claude/nomad/nomad/structs/structs.go#L10640) |
| `RescheduleEligible` | `rt *RescheduleTracker` | `reschedulePolicy *ReschedulePolicy, failTime time.Time` | `bool` | [L10654](file:///d:/claude/nomad/nomad/structs/structs.go#L10654) |
| `rescheduleInfo` | `rt *RescheduleTracker` | `reschedulePolicy *ReschedulePolicy, failTime time.Time` | `int, int` | [L10674](file:///d:/claude/nomad/nomad/structs/structs.go#L10674) |
| `NewRescheduleEvent` | - | `rescheduleTime int64, prevAllocID string, prevNodeID string, delay time.Dura...` | `*RescheduleEvent` | [L10709](file:///d:/claude/nomad/nomad/structs/structs.go#L10709) |
| `Copy` | `re *RescheduleEvent` | - | `*RescheduleEvent` | [L10716](file:///d:/claude/nomad/nomad/structs/structs.go#L10716) |
| `Copy` | `s *NodeScoreMeta` | - | `*NodeScoreMeta` | [L10733](file:///d:/claude/nomad/nomad/structs/structs.go#L10733) |
| `String` | `s *NodeScoreMeta` | - | `string` | [L10742](file:///d:/claude/nomad/nomad/structs/structs.go#L10742) |
| `Score` | `s *NodeScoreMeta` | - | `float64` | [L10746](file:///d:/claude/nomad/nomad/structs/structs.go#L10746) |
| `Data` | `s *NodeScoreMeta` | - | `interface{}` | [L10750](file:///d:/claude/nomad/nomad/structs/structs.go#L10750) |
| `GoString` | `d *DesiredUpdates` | - | `string` | [L10771](file:///d:/claude/nomad/nomad/structs/structs.go#L10771) |
| `Decode` | - | `buf []byte, out interface{}` | `error` | [L10796](file:///d:/claude/nomad/nomad/structs/structs.go#L10796) |
| `Encode` | - | `t MessageType, msg interface{}` | `[]byte, error` | [L10801](file:///d:/claude/nomad/nomad/structs/structs.go#L10801) |
| `NewRecoverableError` | - | `e error, recoverable bool` | `error` | [L10831](file:///d:/claude/nomad/nomad/structs/structs.go#L10831) |
| `WrapRecoverable` | - | `msg string, err error` | `error` | [L10846](file:///d:/claude/nomad/nomad/structs/structs.go#L10846) |
| `Error` | `r *RecoverableError` | - | `string` | [L10850](file:///d:/claude/nomad/nomad/structs/structs.go#L10850) |
| `IsRecoverable` | `r *RecoverableError` | - | `bool` | [L10854](file:///d:/claude/nomad/nomad/structs/structs.go#L10854) |
| `IsUnrecoverable` | `r *RecoverableError` | - | `bool` | [L10858](file:///d:/claude/nomad/nomad/structs/structs.go#L10858) |
| `Unwrap` | `r *RecoverableError` | - | `error` | [L10862](file:///d:/claude/nomad/nomad/structs/structs.go#L10862) |
| `IsRecoverable` | - | `e error` | `bool` | [L10875](file:///d:/claude/nomad/nomad/structs/structs.go#L10875) |
| `NewWrappedServerError` | - | `e error` | `error` | [L10889](file:///d:/claude/nomad/nomad/structs/structs.go#L10889) |
| `IsRecoverable` | `r *WrappedServerError` | - | `bool` | [L10895](file:///d:/claude/nomad/nomad/structs/structs.go#L10895) |
| `Error` | `r *WrappedServerError` | - | `string` | [L10899](file:///d:/claude/nomad/nomad/structs/structs.go#L10899) |
| `IsServerSide` | `r *WrappedServerError` | - | `bool` | [L10903](file:///d:/claude/nomad/nomad/structs/structs.go#L10903) |
| `IsServerSide` | - | `e error` | `bool` | [L10916](file:///d:/claude/nomad/nomad/structs/structs.go#L10916) |
| `NewRpcError` | - | `err error, code *int64` | `*RpcError` | [L10929](file:///d:/claude/nomad/nomad/structs/structs.go#L10929) |
| `Error` | `r *RpcError` | - | `string` | [L10936](file:///d:/claude/nomad/nomad/structs/structs.go#L10936) |

## 5. 核心方法详解

### GetAuthToken()

**签名**：`func (q *QueryOptions) GetAuthToken() string`

**位置**：[L379](file:///d:/claude/nomad/nomad/structs/structs.go#L379)

### GetIdentity()

**签名**：`func (q *QueryOptions) GetIdentity() *AuthenticatedIdentity`

**位置**：[L387](file:///d:/claude/nomad/nomad/structs/structs.go#L387)

### GetAuthToken()

**签名**：`func (w *WriteRequest) GetAuthToken() string`

**位置**：[L489](file:///d:/claude/nomad/nomad/structs/structs.go#L489)

### GetIdentity()

**签名**：`func (w *WriteRequest) GetIdentity() *AuthenticatedIdentity`

**位置**：[L497](file:///d:/claude/nomad/nomad/structs/structs.go#L497)

### GetACLToken()

**签名**：`func (ai *AuthenticatedIdentity) GetACLToken() *ACLToken`

**位置**：[L531](file:///d:/claude/nomad/nomad/structs/structs.go#L531)

### GetClaims()

**签名**：`func (ai *AuthenticatedIdentity) GetClaims() *IdentityClaims`

**位置**：[L538](file:///d:/claude/nomad/nomad/structs/structs.go#L538)

### Validate()

**签名**：`func (r *JobScaleRequest) Validate() error`

**位置**：[L878](file:///d:/claude/nomad/nomad/structs/structs.go#L878)

### GetWaitIndex()

**签名**：`func (e *EvalDequeueResponse) GetWaitIndex() uint64`

**位置**：[L1679](file:///d:/claude/nomad/nomad/structs/structs.go#L1679)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `crypto/md5` | 标准库 |
| `crypto/sha1` | 标准库 |
| `crypto/sha256` | 标准库 |
| `crypto/sha512` | 标准库 |
| `encoding/base32` | 标准库 |
| `encoding/base64` | 标准库 |
| `encoding/hex` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `hash` | 标准库 |
| `hash/crc32` | 标准库 |
| `maps` | 标准库 |
| `math` | 标准库 |
| `net` | 标准库 |
| `os` | 标准库 |
| `reflect` | 标准库 |
| `regexp` | 标准库 |
| `slices` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/idset` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib/hw` | 内部包 |
| `github.com/hashicorp/nomad/command/agent/host` | 内部包 |
| `github.com/hashicorp/nomad/command/agent/pprof` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/args` | 内部包 |
| `github.com/hashicorp/nomad/helper/constraints/semver` | 内部包 |
| `github.com/hashicorp/nomad/helper/escapingfs` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/hashicorp/cronexpr` | 第三方库 |
| `github.com/hashicorp/go-msgpack/v2/codec` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/hashicorp/go-version` | 第三方库 |
| `github.com/miekg/dns` | 第三方库 |
| `github.com/mitchellh/copystructure` | 第三方库 |
| `github.com/ryanuber/go-glob` | 第三方库 |
| `golang.org/x/crypto/blake2b` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [structs_test.go](file:///d:/claude/nomad/nomad/structs/structs_test.go) | 对应测试文件 |

