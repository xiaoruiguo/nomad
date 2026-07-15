# structs.go 代码说明文档

> 文件路径：[nomad/structs/structs.go](file:///d:/claude/nomad/nomad/structs/structs.go)
> 总行数：10939 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义接口类型、定义结构体类型、包含 401 个方法/函数。

## 2. 类型定义

### MessageType

**定义位置**：[L62](file:///d:/claude/nomad/nomad/structs/structs.go#L62)

**类型定义**：`type MessageType uint8`

### NamespacedID

**定义位置**：[L233](file:///d:/claude/nomad/nomad/structs/structs.go#L233)

**中文说明**：NamespacedID 与命名空间（Namespace）相关，提供资源隔离。

**类型**：struct

```go
type NamespacedID struct {
	ID string
	Namespace string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Namespace` | `string` | 命名空间 |

**关联方法**（1 个）：`String`

### RPCInfo

**定义位置**：[L251](file:///d:/claude/nomad/nomad/structs/structs.go#L251)

**中文说明**：RPCInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：interface

```go
type RPCInfo interface {
	RequestRegion func(...)
	IsRead func(...)
	AllowStaleRead func(...)
	IsForwarded func(...)
	SetForwarded func(...)
	TimeToBlock func(...)
	SetTimeToBlock func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `RequestRegion` | `func(...)` | — |
| `IsRead` | `func(...)` | — |
| `AllowStaleRead` | `func(...)` | — |
| `IsForwarded` | `func(...)` | — |
| `SetForwarded` | `func(...)` | — |
| `TimeToBlock` | `func(...)` | — |
| `SetTimeToBlock` | `func(...)` | — |

### InternalRpcInfo

**定义位置**：[L266](file:///d:/claude/nomad/nomad/structs/structs.go#L266)

**中文说明**：InternalRpcInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type InternalRpcInfo struct {
	Forwarded bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Forwarded` | `bool` | 布尔值 |

**关联方法**（2 个）：`IsForwarded`, `SetForwarded`

### QueryOptions

**定义位置**：[L282](file:///d:/claude/nomad/nomad/structs/structs.go#L282)

**中文说明**：QueryOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type QueryOptions struct {
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
	InternalRpcInfo InternalRpcInfo
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Region` | `string` | 区域 |
| `Namespace` | `string` | 命名空间 |
| `MinQueryIndex` | `uint64` | 索引值（uint64） |
| `MaxQueryTime` | `time.Duration` | 时间间隔 |
| `AllowStale` | `bool` | 布尔值 |
| `Prefix` | `string` | 字符串 |
| `AuthToken` | `string` | 字符串 |
| `Filter` | `string` | 字符串 |
| `PerPage` | `int32` | — |
| `NextToken` | `string` | 字符串 |
| `Reverse` | `bool` | 布尔值 |
| `identity` | `*AuthenticatedIdentity` | — |
| `InternalRpcInfo` | `InternalRpcInfo` | — |

**关联方法**（9 个）：`TimeToBlock`, `SetTimeToBlock`, `RequestRegion`, `RequestNamespace`, `IsRead`, `AllowStaleRead`, `GetAuthToken`, `SetIdentity`, `GetIdentity`

### AgentPprofRequest

**定义位置**：[L392](file:///d:/claude/nomad/nomad/structs/structs.go#L392)

**中文说明**：AgentPprofRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AgentPprofRequest struct {
	ReqType pprof.ReqType
	Profile string
	Seconds int
	Debug int
	GC int
	NodeID string
	ServerID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ReqType` | `pprof.ReqType` | — |
| `Profile` | `string` | 字符串 |
| `Seconds` | `int` | — |
| `Debug` | `int` | — |
| `GC` | `int` | — |
| `NodeID` | `string` | 字符串 |
| `ServerID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### AgentPprofResponse

**定义位置**：[L419](file:///d:/claude/nomad/nomad/structs/structs.go#L419)

**中文说明**：AgentPprofResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type AgentPprofResponse struct {
	AgentID string
	Payload []byte
	HTTPHeaders map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AgentID` | `string` | 字符串 |
| `Payload` | `[]byte` | 字节数组 |
| `HTTPHeaders` | `map[string]string` | 映射表 |

### WriteRequest

**定义位置**：[L431](file:///d:/claude/nomad/nomad/structs/structs.go#L431)

**中文说明**：WriteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type WriteRequest struct {
	Region string
	Namespace string
	AuthToken string
	IdempotencyToken string
	identity *AuthenticatedIdentity
	InternalRpcInfo InternalRpcInfo
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Region` | `string` | 区域 |
| `Namespace` | `string` | 命名空间 |
| `AuthToken` | `string` | 字符串 |
| `IdempotencyToken` | `string` | 字符串 |
| `identity` | `*AuthenticatedIdentity` | — |
| `InternalRpcInfo` | `InternalRpcInfo` | — |

**关联方法**（9 个）：`TimeToBlock`, `SetTimeToBlock`, `RequestRegion`, `RequestNamespace`, `IsRead`, `AllowStaleRead`, `GetAuthToken`, `SetIdentity`, `GetIdentity`

### AuthenticatedIdentity

**定义位置**：[L509](file:///d:/claude/nomad/nomad/structs/structs.go#L509)

**中文说明**：AuthenticatedIdentity 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type AuthenticatedIdentity struct {
	ACLToken *ACLToken
	Claims *IdentityClaims
	ClientID string
	TLSName string
	RemoteIP net.IP
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLToken` | `*ACLToken` | — |
| `Claims` | `*IdentityClaims` | — |
| `ClientID` | `string` | 字符串 |
| `TLSName` | `string` | 字符串 |
| `RemoteIP` | `net.IP` | — |

**关联方法**（4 个）：`GetACLToken`, `GetClaims`, `String`, `IsExpired`

### RequestWithIdentity

**定义位置**：[L577](file:///d:/claude/nomad/nomad/structs/structs.go#L577)

**中文说明**：RequestWithIdentity 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type RequestWithIdentity interface {
	GetAuthToken func(...)
	SetIdentity func(...)
	GetIdentity func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `GetAuthToken` | `func(...)` | 获取AuthToken的信息。 |
| `SetIdentity` | `func(...)` | — |
| `GetIdentity` | `func(...)` | 获取Identity的信息。 |

### QueryMeta

**定义位置**：[L585](file:///d:/claude/nomad/nomad/structs/structs.go#L585)

**中文说明**：QueryMeta 是一个元数据结构体，包含对象的附加元信息。

**类型**：struct

```go
type QueryMeta struct {
	Index uint64
	LastContact time.Duration
	KnownLeader bool
	NextToken string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Index` | `uint64` | 索引 |
| `LastContact` | `time.Duration` | 时间间隔 |
| `KnownLeader` | `bool` | 布尔值 |
| `NextToken` | `string` | 字符串 |

### WriteMeta

**定义位置**：[L605](file:///d:/claude/nomad/nomad/structs/structs.go#L605)

**中文说明**：WriteMeta 是一个元数据结构体，包含对象的附加元信息。

**类型**：struct

```go
type WriteMeta struct {
	Index uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Index` | `uint64` | 索引 |

### NodeDeregisterRequest

**定义位置**：[L612](file:///d:/claude/nomad/nomad/structs/structs.go#L612)

**中文说明**：NodeDeregisterRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeDeregisterRequest struct {
	NodeID string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### NodeBatchDeregisterRequest

**定义位置**：[L619](file:///d:/claude/nomad/nomad/structs/structs.go#L619)

**中文说明**：NodeBatchDeregisterRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeBatchDeregisterRequest struct {
	NodeIDs []string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeIDs` | `[]string` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### NodeServerInfo

**定义位置**：[L626](file:///d:/claude/nomad/nomad/structs/structs.go#L626)

**中文说明**：NodeServerInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type NodeServerInfo struct {
	RPCAdvertiseAddr string
	RPCMajorVersion int32
	RPCMinorVersion int32
	Datacenter string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `RPCAdvertiseAddr` | `string` | 字符串 |
| `RPCMajorVersion` | `int32` | — |
| `RPCMinorVersion` | `int32` | — |
| `Datacenter` | `string` | 数据中心 |

### NodeUpdateDrainRequest

**定义位置**：[L644](file:///d:/claude/nomad/nomad/structs/structs.go#L644)

**中文说明**：NodeUpdateDrainRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeUpdateDrainRequest struct {
	NodeID string
	DrainStrategy *DrainStrategy
	MarkEligible bool
	NodeEvent *NodeEvent
	UpdatedAt int64
	Meta map[string]string
	UpdatedBy string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 字符串 |
| `DrainStrategy` | `*DrainStrategy` | — |
| `MarkEligible` | `bool` | 布尔值 |
| `NodeEvent` | `*NodeEvent` | — |
| `UpdatedAt` | `int64` | — |
| `Meta` | `map[string]string` | 元数据 |
| `UpdatedBy` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### BatchNodeUpdateDrainRequest

**定义位置**：[L669](file:///d:/claude/nomad/nomad/structs/structs.go#L669)

**中文说明**：BatchNodeUpdateDrainRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type BatchNodeUpdateDrainRequest struct {
	Updates map[string]*DrainUpdate
	NodeEvents map[string]*NodeEvent
	UpdatedAt int64
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Updates` | `map[string]*DrainUpdate` | 映射表 |
| `NodeEvents` | `map[string]*NodeEvent` | 映射表 |
| `UpdatedAt` | `int64` | — |
| `WriteRequest` | `WriteRequest` | — |

### DrainUpdate

**定义位置**：[L683](file:///d:/claude/nomad/nomad/structs/structs.go#L683)

**中文说明**：DrainUpdate 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type DrainUpdate struct {
	DrainStrategy *DrainStrategy
	MarkEligible bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DrainStrategy` | `*DrainStrategy` | — |
| `MarkEligible` | `bool` | 布尔值 |

### NodeUpdateEligibilityRequest

**定义位置**：[L692](file:///d:/claude/nomad/nomad/structs/structs.go#L692)

**中文说明**：NodeUpdateEligibilityRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeUpdateEligibilityRequest struct {
	NodeID string
	Eligibility string
	NodeEvent *NodeEvent
	UpdatedAt int64
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 字符串 |
| `Eligibility` | `string` | 字符串 |
| `NodeEvent` | `*NodeEvent` | — |
| `UpdatedAt` | `int64` | — |
| `WriteRequest` | `WriteRequest` | — |

### NodeEvaluateRequest

**定义位置**：[L706](file:///d:/claude/nomad/nomad/structs/structs.go#L706)

**中文说明**：NodeEvaluateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeEvaluateRequest struct {
	NodeID string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### NodeSpecificRequest

**定义位置**：[L712](file:///d:/claude/nomad/nomad/structs/structs.go#L712)

**中文说明**：NodeSpecificRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeSpecificRequest struct {
	NodeID string
	SecretID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 字符串 |
| `SecretID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### JobRegisterRequest

**定义位置**：[L720](file:///d:/claude/nomad/nomad/structs/structs.go#L720)

**中文说明**：JobRegisterRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobRegisterRequest struct {
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
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Submission` | `*JobSubmission` | — |
| `Job` | `*Job` | — |
| `EnforceIndex` | `bool` | 布尔值 |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `PreserveCounts` | `bool` | 布尔值 |
| `PreserveResources` | `bool` | 布尔值 |
| `PolicyOverride` | `bool` | 布尔值 |
| `EvalPriority` | `int` | — |
| `Eval` | `*Evaluation` | — |
| `Deployment` | `*Deployment` | — |
| `WriteRequest` | `WriteRequest` | — |

### JobDeregisterRequest

**定义位置**：[L765](file:///d:/claude/nomad/nomad/structs/structs.go#L765)

**中文说明**：JobDeregisterRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobDeregisterRequest struct {
	JobID string
	Purge bool
	Global bool
	EvalPriority int
	NoShutdownDelay bool
	Eval *Evaluation
	SubmitTime int64
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `Purge` | `bool` | 布尔值 |
| `Global` | `bool` | 布尔值 |
| `EvalPriority` | `int` | — |
| `NoShutdownDelay` | `bool` | 布尔值 |
| `Eval` | `*Evaluation` | — |
| `SubmitTime` | `int64` | — |
| `WriteRequest` | `WriteRequest` | — |

### JobEvaluateRequest

**定义位置**：[L799](file:///d:/claude/nomad/nomad/structs/structs.go#L799)

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

**定义位置**：[L806](file:///d:/claude/nomad/nomad/structs/structs.go#L806)

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

### JobSubmissionRequest

**定义位置**：[L812](file:///d:/claude/nomad/nomad/structs/structs.go#L812)

**中文说明**：JobSubmissionRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobSubmissionRequest struct {
	JobID string
	Version uint64
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `Version` | `uint64` | 版本号 |
| `QueryOptions` | `QueryOptions` | — |

### JobSubmissionResponse

**定义位置**：[L821](file:///d:/claude/nomad/nomad/structs/structs.go#L821)

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

### JobSpecificRequest

**定义位置**：[L828](file:///d:/claude/nomad/nomad/structs/structs.go#L828)

**中文说明**：JobSpecificRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobSpecificRequest struct {
	JobID string
	All bool
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `All` | `bool` | 布尔值 |
| `QueryOptions` | `QueryOptions` | — |

### JobListRequest

**定义位置**：[L835](file:///d:/claude/nomad/nomad/structs/structs.go#L835)

**中文说明**：JobListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobListRequest struct {
	QueryOptions QueryOptions
	Fields *JobStubFields
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |
| `Fields` | `*JobStubFields` | — |

### JobStubFields

**定义位置**：[L841](file:///d:/claude/nomad/nomad/structs/structs.go#L841)

**中文说明**：JobStubFields 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobStubFields struct {
	Meta bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `bool` | 元数据 |

### JobPlanRequest

**定义位置**：[L847](file:///d:/claude/nomad/nomad/structs/structs.go#L847)

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

### JobScaleRequest

**定义位置**：[L857](file:///d:/claude/nomad/nomad/structs/structs.go#L857)

**中文说明**：JobScaleRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobScaleRequest struct {
	JobID string
	Target map[string]string
	Count *int64
	Message string
	Error bool
	Meta map[string]interface{}
	PolicyOverride bool
	EnforceIndex bool
	JobModifyIndex uint64
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `Target` | `map[string]string` | 映射表 |
| `Count` | `*int64` | 计数 |
| `Message` | `string` | 消息 |
| `Error` | `bool` | 错误信息 |
| `Meta` | `map[string]interface{}` | 元数据 |
| `PolicyOverride` | `bool` | 布尔值 |
| `EnforceIndex` | `bool` | 布尔值 |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `WriteRequest` | `WriteRequest` | — |

**关联方法**（1 个）：`Validate`

### JobSummaryRequest

**定义位置**：[L914](file:///d:/claude/nomad/nomad/structs/structs.go#L914)

**中文说明**：JobSummaryRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobSummaryRequest struct {
	JobID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### JobScaleStatusRequest

**定义位置**：[L920](file:///d:/claude/nomad/nomad/structs/structs.go#L920)

**中文说明**：JobScaleStatusRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobScaleStatusRequest struct {
	JobID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### JobDispatchRequest

**定义位置**：[L926](file:///d:/claude/nomad/nomad/structs/structs.go#L926)

**中文说明**：JobDispatchRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobDispatchRequest struct {
	JobID string
	Payload []byte
	Meta map[string]string
	WriteRequest WriteRequest
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
| `WriteRequest` | `WriteRequest` | — |
| `IdPrefixTemplate` | `string` | 字符串 |
| `Priority` | `int` | — |

### JobValidateRequest

**定义位置**：[L936](file:///d:/claude/nomad/nomad/structs/structs.go#L936)

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

### JobRevertRequest

**定义位置**：[L942](file:///d:/claude/nomad/nomad/structs/structs.go#L942)

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

### JobStabilityRequest

**定义位置**：[L957](file:///d:/claude/nomad/nomad/structs/structs.go#L957)

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

**定义位置**：[L968](file:///d:/claude/nomad/nomad/structs/structs.go#L968)

**中文说明**：JobStabilityResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobStabilityResponse struct {
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WriteMeta` | `WriteMeta` | — |

### NodeListRequest

**定义位置**：[L973](file:///d:/claude/nomad/nomad/structs/structs.go#L973)

**中文说明**：NodeListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeListRequest struct {
	QueryOptions QueryOptions
	Fields *NodeStubFields
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |
| `Fields` | `*NodeStubFields` | — |

### EvalUpdateRequest

**定义位置**：[L980](file:///d:/claude/nomad/nomad/structs/structs.go#L980)

**中文说明**：EvalUpdateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type EvalUpdateRequest struct {
	Evals []*Evaluation
	EvalToken string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Evals` | `[]*Evaluation` | 列表 |
| `EvalToken` | `string` | 评估令牌 |
| `WriteRequest` | `WriteRequest` | — |

### EvalReapRequest

**定义位置**：[L991](file:///d:/claude/nomad/nomad/structs/structs.go#L991)

**中文说明**：EvalReapRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type EvalReapRequest struct {
	Evals []string
	Allocs []string
	Filter string
	PerPage int32
	NextToken string
	UserInitiated bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Evals` | `[]string` | 列表 |
| `Allocs` | `[]string` | 列表 |
| `Filter` | `string` | 字符串 |
| `PerPage` | `int32` | — |
| `NextToken` | `string` | 字符串 |
| `UserInitiated` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### EvalSpecificRequest

**定义位置**：[L1010](file:///d:/claude/nomad/nomad/structs/structs.go#L1010)

**中文说明**：EvalSpecificRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type EvalSpecificRequest struct {
	EvalID string
	IncludeRelated bool
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalID` | `string` | 字符串 |
| `IncludeRelated` | `bool` | 布尔值 |
| `QueryOptions` | `QueryOptions` | — |

### EvalAckRequest

**定义位置**：[L1017](file:///d:/claude/nomad/nomad/structs/structs.go#L1017)

**中文说明**：EvalAckRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type EvalAckRequest struct {
	EvalID string
	Token string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalID` | `string` | 字符串 |
| `Token` | `string` | 令牌，用于认证或标识 |
| `WriteRequest` | `WriteRequest` | — |

### EvalDequeueRequest

**定义位置**：[L1024](file:///d:/claude/nomad/nomad/structs/structs.go#L1024)

**中文说明**：EvalDequeueRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type EvalDequeueRequest struct {
	Schedulers []string
	Timeout time.Duration
	SchedulerVersion uint16
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Schedulers` | `[]string` | 列表 |
| `Timeout` | `time.Duration` | 超时时间 |
| `SchedulerVersion` | `uint16` | — |
| `WriteRequest` | `WriteRequest` | — |

### EvalListRequest

**定义位置**：[L1032](file:///d:/claude/nomad/nomad/structs/structs.go#L1032)

**中文说明**：EvalListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type EvalListRequest struct {
	FilterJobID string
	FilterEvalStatus string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `FilterJobID` | `string` | 字符串 |
| `FilterEvalStatus` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

**关联方法**（1 个）：`ShouldBeFiltered`

### EvalCountRequest

**定义位置**：[L1051](file:///d:/claude/nomad/nomad/structs/structs.go#L1051)

**中文说明**：EvalCountRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type EvalCountRequest struct {
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |

### PlanRequest

**定义位置**：[L1056](file:///d:/claude/nomad/nomad/structs/structs.go#L1056)

**中文说明**：PlanRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type PlanRequest struct {
	Plan *Plan
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Plan` | `*Plan` | — |
| `WriteRequest` | `WriteRequest` | — |

### ApplyPlanResultsRequest

**定义位置**：[L1064](file:///d:/claude/nomad/nomad/structs/structs.go#L1064)

**中文说明**：ApplyPlanResultsRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ApplyPlanResultsRequest struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocsStopped` | `[]*AllocationDiff` | 列表 |
| `AllocsUpdated` | `[]*Allocation` | 列表 |
| `Evals` | `[]*Evaluation` | 列表 |
| `Job` | `*Job` | — |
| `Deployment` | `*Deployment` | — |
| `DeploymentUpdates` | `[]*DeploymentStatusUpdate` | 列表 |
| `EvalID` | `string` | 字符串 |
| `AllocsPreempted` | `[]*AllocationDiff` | 列表 |
| `PreemptionEvals` | `[]*Evaluation` | 列表 |
| `IneligibleNodes` | `[]string` | 列表 |
| `UpdatedAt` | `int64` | — |

### AllocUpdateRequest

**定义位置**：[L1114](file:///d:/claude/nomad/nomad/structs/structs.go#L1114)

**中文说明**：AllocUpdateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocUpdateRequest struct {
	Alloc []*Allocation
	Evals []*Evaluation
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Alloc` | `[]*Allocation` | 列表 |
| `Evals` | `[]*Evaluation` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### AllocUpdateDesiredTransitionRequest

**定义位置**：[L1128](file:///d:/claude/nomad/nomad/structs/structs.go#L1128)

**中文说明**：AllocUpdateDesiredTransitionRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocUpdateDesiredTransitionRequest struct {
	Allocs map[string]*DesiredTransition
	Evals []*Evaluation
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Allocs` | `map[string]*DesiredTransition` | 映射表 |
| `Evals` | `[]*Evaluation` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### AllocStopRequest

**定义位置**：[L1140](file:///d:/claude/nomad/nomad/structs/structs.go#L1140)

**中文说明**：AllocStopRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocStopRequest struct {
	AllocID string
	NoShutdownDelay bool
	Reschedule bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `NoShutdownDelay` | `bool` | 布尔值 |
| `Reschedule` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### AllocStopResponse

**定义位置**：[L1149](file:///d:/claude/nomad/nomad/structs/structs.go#L1149)

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

### AllocListRequest

**定义位置**：[L1157](file:///d:/claude/nomad/nomad/structs/structs.go#L1157)

**中文说明**：AllocListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocListRequest struct {
	QueryOptions QueryOptions
	Fields *AllocStubFields
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |
| `Fields` | `*AllocStubFields` | — |

### AllocSpecificRequest

**定义位置**：[L1164](file:///d:/claude/nomad/nomad/structs/structs.go#L1164)

**中文说明**：AllocSpecificRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocSpecificRequest struct {
	AllocID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### AllocSignalRequest

**定义位置**：[L1170](file:///d:/claude/nomad/nomad/structs/structs.go#L1170)

**中文说明**：AllocSignalRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocSignalRequest struct {
	AllocID string
	Task string
	Signal string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `Task` | `string` | 字符串 |
| `Signal` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### AllocPauseRequest

**定义位置**：[L1178](file:///d:/claude/nomad/nomad/structs/structs.go#L1178)

**中文说明**：AllocPauseRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocPauseRequest struct {
	AllocID string
	Task string
	ScheduleState TaskScheduleState
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `Task` | `string` | 字符串 |
| `ScheduleState` | `TaskScheduleState` | — |
| `QueryOptions` | `QueryOptions` | — |

### AllocGetPauseStateRequest

**定义位置**：[L1186](file:///d:/claude/nomad/nomad/structs/structs.go#L1186)

**中文说明**：AllocGetPauseStateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocGetPauseStateRequest struct {
	AllocID string
	Task string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `Task` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### AllocGetPauseStateResponse

**定义位置**：[L1193](file:///d:/claude/nomad/nomad/structs/structs.go#L1193)

**中文说明**：AllocGetPauseStateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type AllocGetPauseStateResponse struct {
	ScheduleState TaskScheduleState
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ScheduleState` | `TaskScheduleState` | — |

### AllocsGetRequest

**定义位置**：[L1198](file:///d:/claude/nomad/nomad/structs/structs.go#L1198)

**中文说明**：AllocsGetRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocsGetRequest struct {
	AllocIDs []string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocIDs` | `[]string` | 列表 |
| `QueryOptions` | `QueryOptions` | — |

### AllocRestartRequest

**定义位置**：[L1204](file:///d:/claude/nomad/nomad/structs/structs.go#L1204)

**中文说明**：AllocRestartRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocRestartRequest struct {
	AllocID string
	TaskName string
	AllTasks bool
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `TaskName` | `string` | 字符串 |
| `AllTasks` | `bool` | 布尔值 |
| `QueryOptions` | `QueryOptions` | — |

### PeriodicForceRequest

**定义位置**：[L1213](file:///d:/claude/nomad/nomad/structs/structs.go#L1213)

**中文说明**：PeriodicForceRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type PeriodicForceRequest struct {
	JobID string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### ServerMembersResponse

**定义位置**：[L1219](file:///d:/claude/nomad/nomad/structs/structs.go#L1219)

**中文说明**：ServerMembersResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ServerMembersResponse struct {
	ServerName string
	ServerRegion string
	ServerDC string
	Members []*ServerMember
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ServerName` | `string` | 字符串 |
| `ServerRegion` | `string` | 字符串 |
| `ServerDC` | `string` | 字符串 |
| `Members` | `[]*ServerMember` | 关联的 Server 实例 |

### ServerMember

**定义位置**：[L1227](file:///d:/claude/nomad/nomad/structs/structs.go#L1227)

**中文说明**：ServerMember 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ServerMember struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Addr` | `net.IP` | 地址 |
| `Port` | `uint16` | 端口 |
| `Tags` | `map[string]string` | 标签 |
| `Status` | `string` | 状态 |
| `ProtocolMin` | `uint8` | — |
| `ProtocolMax` | `uint8` | — |
| `ProtocolCur` | `uint8` | — |
| `DelegateMin` | `uint8` | — |
| `DelegateMax` | `uint8` | — |
| `DelegateCur` | `uint8` | — |

### ClusterMetadata

**定义位置**：[L1242](file:///d:/claude/nomad/nomad/structs/structs.go#L1242)

**中文说明**：ClusterMetadata 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ClusterMetadata struct {
	ClusterID string
	CreateTime int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ClusterID` | `string` | 字符串 |
| `CreateTime` | `int64` | — |

### VaultAccessor

**定义位置**：[L1252](file:///d:/claude/nomad/nomad/structs/structs.go#L1252)

**中文说明**：VaultAccessor 与 Vault 集成相关，用于密钥管理和动态凭据。

**类型**：struct

```go
type VaultAccessor struct {
	AllocID string
	Task string
	NodeID string
	Accessor string
	CreationTTL int
	CreateIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `Task` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `Accessor` | `string` | 字符串 |
| `CreationTTL` | `int` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |

### GenericRequest

**定义位置**：[L1265](file:///d:/claude/nomad/nomad/structs/structs.go#L1265)

**中文说明**：GenericRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type GenericRequest struct {
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |

### DeploymentListRequest

**定义位置**：[L1270](file:///d:/claude/nomad/nomad/structs/structs.go#L1270)

**中文说明**：DeploymentListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentListRequest struct {
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |

### DeploymentDeleteRequest

**定义位置**：[L1275](file:///d:/claude/nomad/nomad/structs/structs.go#L1275)

**中文说明**：DeploymentDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentDeleteRequest struct {
	Deployments []string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Deployments` | `[]string` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### DeploymentStatusUpdateRequest

**定义位置**：[L1282](file:///d:/claude/nomad/nomad/structs/structs.go#L1282)

**中文说明**：DeploymentStatusUpdateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentStatusUpdateRequest struct {
	Eval *Evaluation
	DeploymentUpdate *DeploymentStatusUpdate
	Job *Job
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Eval` | `*Evaluation` | — |
| `DeploymentUpdate` | `*DeploymentStatusUpdate` | — |
| `Job` | `*Job` | — |

### DeploymentAllocHealthRequest

**定义位置**：[L1299](file:///d:/claude/nomad/nomad/structs/structs.go#L1299)

**中文说明**：DeploymentAllocHealthRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentAllocHealthRequest struct {
	DeploymentID string
	HealthyAllocationIDs []string
	UnhealthyAllocationIDs []string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `HealthyAllocationIDs` | `[]string` | 列表 |
| `UnhealthyAllocationIDs` | `[]string` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### ApplyDeploymentAllocHealthRequest

**定义位置**：[L1313](file:///d:/claude/nomad/nomad/structs/structs.go#L1313)

**中文说明**：ApplyDeploymentAllocHealthRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ApplyDeploymentAllocHealthRequest struct {
	DeploymentAllocHealthRequest DeploymentAllocHealthRequest
	Timestamp time.Time
	DeploymentUpdate *DeploymentStatusUpdate
	Job *Job
	Eval *Evaluation
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentAllocHealthRequest` | `DeploymentAllocHealthRequest` | — |
| `Timestamp` | `time.Time` | 时间戳 |
| `DeploymentUpdate` | `*DeploymentStatusUpdate` | 可选 字段 到 更新 状态 的 部署 |
| `Job` | `*Job` | — |
| `Eval` | `*Evaluation` | — |

### DeploymentPromoteRequest

**定义位置**：[L1332](file:///d:/claude/nomad/nomad/structs/structs.go#L1332)

**中文说明**：DeploymentPromoteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentPromoteRequest struct {
	DeploymentID string
	All bool
	Groups []string
	PromotedAt int64
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `All` | `bool` | 布尔值 |
| `Groups` | `[]string` | 列表 |
| `PromotedAt` | `int64` | — |
| `WriteRequest` | `WriteRequest` | — |

### ApplyDeploymentPromoteRequest

**定义位置**：[L1348](file:///d:/claude/nomad/nomad/structs/structs.go#L1348)

**中文说明**：ApplyDeploymentPromoteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ApplyDeploymentPromoteRequest struct {
	DeploymentPromoteRequest DeploymentPromoteRequest
	Eval *Evaluation
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentPromoteRequest` | `DeploymentPromoteRequest` | — |
| `Eval` | `*Evaluation` | — |

### DeploymentPauseRequest

**定义位置**：[L1356](file:///d:/claude/nomad/nomad/structs/structs.go#L1356)

**中文说明**：DeploymentPauseRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentPauseRequest struct {
	DeploymentID string
	Pause bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `Pause` | `bool` | 暂停 设置 暂停 状态 |
| `WriteRequest` | `WriteRequest` | — |

### DeploymentRunRequest

**定义位置**：[L1367](file:///d:/claude/nomad/nomad/structs/structs.go#L1367)

**中文说明**：DeploymentRunRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentRunRequest struct {
	DeploymentID string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### DeploymentUnblockRequest

**定义位置**：[L1375](file:///d:/claude/nomad/nomad/structs/structs.go#L1375)

**中文说明**：DeploymentUnblockRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentUnblockRequest struct {
	DeploymentID string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### DeploymentCancelRequest

**定义位置**：[L1383](file:///d:/claude/nomad/nomad/structs/structs.go#L1383)

**中文说明**：DeploymentCancelRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentCancelRequest struct {
	DeploymentID string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### DeploymentSpecificRequest

**定义位置**：[L1391](file:///d:/claude/nomad/nomad/structs/structs.go#L1391)

**中文说明**：DeploymentSpecificRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentSpecificRequest struct {
	DeploymentID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### DeploymentFailRequest

**定义位置**：[L1397](file:///d:/claude/nomad/nomad/structs/structs.go#L1397)

**中文说明**：DeploymentFailRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentFailRequest struct {
	DeploymentID string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### ScalingPolicySpecificRequest

**定义位置**：[L1403](file:///d:/claude/nomad/nomad/structs/structs.go#L1403)

**中文说明**：ScalingPolicySpecificRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ScalingPolicySpecificRequest struct {
	ID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `QueryOptions` | `QueryOptions` | — |

### SingleScalingPolicyResponse

**定义位置**：[L1409](file:///d:/claude/nomad/nomad/structs/structs.go#L1409)

**中文说明**：SingleScalingPolicyResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SingleScalingPolicyResponse struct {
	Policy *ScalingPolicy
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Policy` | `*ScalingPolicy` | 策略 |
| `QueryMeta` | `QueryMeta` | — |

### ScalingPolicyListRequest

**定义位置**：[L1415](file:///d:/claude/nomad/nomad/structs/structs.go#L1415)

**中文说明**：ScalingPolicyListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ScalingPolicyListRequest struct {
	Job string
	Type string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Job` | `string` | 字符串 |
| `Type` | `string` | 类型 |
| `QueryOptions` | `QueryOptions` | — |

### ScalingPolicyListResponse

**定义位置**：[L1422](file:///d:/claude/nomad/nomad/structs/structs.go#L1422)

**中文说明**：ScalingPolicyListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ScalingPolicyListResponse struct {
	Policies []*ScalingPolicyListStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Policies` | `[]*ScalingPolicyListStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### SingleDeploymentResponse

**定义位置**：[L1428](file:///d:/claude/nomad/nomad/structs/structs.go#L1428)

**中文说明**：SingleDeploymentResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SingleDeploymentResponse struct {
	Deployment *Deployment
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Deployment` | `*Deployment` | — |
| `QueryMeta` | `QueryMeta` | — |

### GenericResponse

**定义位置**：[L1435](file:///d:/claude/nomad/nomad/structs/structs.go#L1435)

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

### VersionResponse

**定义位置**：[L1440](file:///d:/claude/nomad/nomad/structs/structs.go#L1440)

**中文说明**：VersionResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type VersionResponse struct {
	Build string
	Versions map[string]int
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Build` | `string` | 字符串 |
| `Versions` | `map[string]int` | 映射表 |
| `QueryMeta` | `QueryMeta` | — |

### JobRegisterResponse

**定义位置**：[L1447](file:///d:/claude/nomad/nomad/structs/structs.go#L1447)

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

**定义位置**：[L1460](file:///d:/claude/nomad/nomad/structs/structs.go#L1460)

**中文说明**：JobDeregisterResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobDeregisterResponse struct {
	EvalID string
	EvalCreateIndex uint64
	JobModifyIndex uint64
	VolumeEvalID string
	VolumeEvalIndex uint64
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalID` | `string` | 字符串 |
| `EvalCreateIndex` | `uint64` | 索引值（uint64） |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `VolumeEvalID` | `string` | 字符串 |
| `VolumeEvalIndex` | `uint64` | 索引值（uint64） |
| `QueryMeta` | `QueryMeta` | — |

### JobValidateResponse

**定义位置**：[L1470](file:///d:/claude/nomad/nomad/structs/structs.go#L1470)

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

### NodeDrainUpdateResponse

**定义位置**：[L1487](file:///d:/claude/nomad/nomad/structs/structs.go#L1487)

**中文说明**：NodeDrainUpdateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NodeDrainUpdateResponse struct {
	NodeModifyIndex uint64
	EvalIDs []string
	EvalCreateIndex uint64
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeModifyIndex` | `uint64` | 索引值（uint64） |
| `EvalIDs` | `[]string` | 列表 |
| `EvalCreateIndex` | `uint64` | 索引值（uint64） |
| `WriteMeta` | `WriteMeta` | — |

### NodeEligibilityUpdateResponse

**定义位置**：[L1495](file:///d:/claude/nomad/nomad/structs/structs.go#L1495)

**中文说明**：NodeEligibilityUpdateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NodeEligibilityUpdateResponse struct {
	NodeModifyIndex uint64
	EvalIDs []string
	EvalCreateIndex uint64
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeModifyIndex` | `uint64` | 索引值（uint64） |
| `EvalIDs` | `[]string` | 列表 |
| `EvalCreateIndex` | `uint64` | 索引值（uint64） |
| `WriteMeta` | `WriteMeta` | — |

### NodeAllocsResponse

**定义位置**：[L1503](file:///d:/claude/nomad/nomad/structs/structs.go#L1503)

**中文说明**：NodeAllocsResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NodeAllocsResponse struct {
	Allocs []*Allocation
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Allocs` | `[]*Allocation` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### NodeClientAllocsResponse

**定义位置**：[L1509](file:///d:/claude/nomad/nomad/structs/structs.go#L1509)

**中文说明**：NodeClientAllocsResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NodeClientAllocsResponse struct {
	Allocs map[string]uint64
	MigrateTokens map[string]string
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Allocs` | `map[string]uint64` | 无符号 64 位整数 |
| `MigrateTokens` | `map[string]string` | 映射表 |
| `QueryMeta` | `QueryMeta` | — |

### SingleNodeResponse

**定义位置**：[L1520](file:///d:/claude/nomad/nomad/structs/structs.go#L1520)

**中文说明**：SingleNodeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SingleNodeResponse struct {
	Node *Node
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Node` | `*Node` | — |
| `QueryMeta` | `QueryMeta` | — |

### NodeListResponse

**定义位置**：[L1526](file:///d:/claude/nomad/nomad/structs/structs.go#L1526)

**中文说明**：NodeListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NodeListResponse struct {
	Nodes []*NodeListStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Nodes` | `[]*NodeListStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### SingleJobResponse

**定义位置**：[L1532](file:///d:/claude/nomad/nomad/structs/structs.go#L1532)

**中文说明**：SingleJobResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SingleJobResponse struct {
	Job *Job
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Job` | `*Job` | — |
| `QueryMeta` | `QueryMeta` | — |

### JobSummaryResponse

**定义位置**：[L1538](file:///d:/claude/nomad/nomad/structs/structs.go#L1538)

**中文说明**：JobSummaryResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobSummaryResponse struct {
	JobSummary *JobSummary
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobSummary` | `*JobSummary` | — |
| `QueryMeta` | `QueryMeta` | — |

### JobScaleStatusResponse

**定义位置**：[L1544](file:///d:/claude/nomad/nomad/structs/structs.go#L1544)

**中文说明**：JobScaleStatusResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobScaleStatusResponse struct {
	JobScaleStatus *JobScaleStatus
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobScaleStatus` | `*JobScaleStatus` | — |
| `QueryMeta` | `QueryMeta` | — |

### JobScaleStatus

**定义位置**：[L1549](file:///d:/claude/nomad/nomad/structs/structs.go#L1549)

**中文说明**：JobScaleStatus 是一个状态结构体，描述对象或操作的当前状态。

**类型**：struct

```go
type JobScaleStatus struct {
	JobID string
	Namespace string
	JobCreateIndex uint64
	JobModifyIndex uint64
	JobStopped bool
	TaskGroups map[string]*TaskGroupScaleStatus
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `Namespace` | `string` | 命名空间 |
| `JobCreateIndex` | `uint64` | 索引值（uint64） |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `JobStopped` | `bool` | 布尔值 |
| `TaskGroups` | `map[string]*TaskGroupScaleStatus` | 映射表 |

### TaskGroupScaleStatus

**定义位置**：[L1559](file:///d:/claude/nomad/nomad/structs/structs.go#L1559)

**中文说明**：TaskGroupScaleStatus 是一个状态结构体，描述对象或操作的当前状态。

**类型**：struct

```go
type TaskGroupScaleStatus struct {
	Desired int
	Placed int
	Running int
	Healthy int
	Unhealthy int
	Events []*ScalingEvent
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Desired` | `int` | — |
| `Placed` | `int` | — |
| `Running` | `int` | 是否运行中 |
| `Healthy` | `int` | 是否健康 |
| `Unhealthy` | `int` | — |
| `Events` | `[]*ScalingEvent` | 列表 |

### JobDispatchResponse

**定义位置**：[L1568](file:///d:/claude/nomad/nomad/structs/structs.go#L1568)

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

### JobListResponse

**定义位置**：[L1577](file:///d:/claude/nomad/nomad/structs/structs.go#L1577)

**中文说明**：JobListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobListResponse struct {
	Jobs []*JobListStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Jobs` | `[]*JobListStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### JobVersionsRequest

**定义位置**：[L1583](file:///d:/claude/nomad/nomad/structs/structs.go#L1583)

**中文说明**：JobVersionsRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobVersionsRequest struct {
	JobID string
	Diffs bool
	DiffVersion *uint64
	DiffTagName string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `Diffs` | `bool` | 布尔值 |
| `DiffVersion` | `*uint64` | 无符号 64 位整数 |
| `DiffTagName` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### JobVersionsResponse

**定义位置**：[L1592](file:///d:/claude/nomad/nomad/structs/structs.go#L1592)

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

### JobPlanResponse

**定义位置**：[L1599](file:///d:/claude/nomad/nomad/structs/structs.go#L1599)

**中文说明**：JobPlanResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobPlanResponse struct {
	Annotations *PlanAnnotations
	FailedTGAllocs map[string]*AllocMetric
	JobModifyIndex uint64
	CreatedEvals []*Evaluation
	Diff *JobDiff
	NextPeriodicLaunch time.Time
	Warnings string
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Annotations` | `*PlanAnnotations` | — |
| `FailedTGAllocs` | `map[string]*AllocMetric` | 映射表 |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `CreatedEvals` | `[]*Evaluation` | 列表 |
| `Diff` | `*JobDiff` | — |
| `NextPeriodicLaunch` | `time.Time` | 时间点 |
| `Warnings` | `string` | 字符串 |
| `WriteMeta` | `WriteMeta` | — |

### SingleAllocResponse

**定义位置**：[L1631](file:///d:/claude/nomad/nomad/structs/structs.go#L1631)

**中文说明**：SingleAllocResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SingleAllocResponse struct {
	Alloc *Allocation
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Alloc` | `*Allocation` | — |
| `QueryMeta` | `QueryMeta` | — |

### AllocsGetResponse

**定义位置**：[L1638](file:///d:/claude/nomad/nomad/structs/structs.go#L1638)

**中文说明**：AllocsGetResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type AllocsGetResponse struct {
	Allocs []*Allocation
	SignedIdentities []SignedWorkloadIdentity
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Allocs` | `[]*Allocation` | 列表 |
| `SignedIdentities` | `[]SignedWorkloadIdentity` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### JobAllocationsResponse

**定义位置**：[L1648](file:///d:/claude/nomad/nomad/structs/structs.go#L1648)

**中文说明**：JobAllocationsResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobAllocationsResponse struct {
	Allocations []*AllocListStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Allocations` | `[]*AllocListStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### JobEvaluationsResponse

**定义位置**：[L1654](file:///d:/claude/nomad/nomad/structs/structs.go#L1654)

**中文说明**：JobEvaluationsResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobEvaluationsResponse struct {
	Evaluations []*Evaluation
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Evaluations` | `[]*Evaluation` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### SingleEvalResponse

**定义位置**：[L1660](file:///d:/claude/nomad/nomad/structs/structs.go#L1660)

**中文说明**：SingleEvalResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SingleEvalResponse struct {
	Eval *Evaluation
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Eval` | `*Evaluation` | — |
| `QueryMeta` | `QueryMeta` | — |

### EvalDequeueResponse

**定义位置**：[L1666](file:///d:/claude/nomad/nomad/structs/structs.go#L1666)

**中文说明**：EvalDequeueResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type EvalDequeueResponse struct {
	Eval *Evaluation
	Token string
	WaitIndex uint64
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Eval` | `*Evaluation` | — |
| `Token` | `string` | 令牌，用于认证或标识 |
| `WaitIndex` | `uint64` | 索引值（uint64） |
| `QueryMeta` | `QueryMeta` | — |

**关联方法**（1 个）：`GetWaitIndex`

### PlanResponse

**定义位置**：[L1693](file:///d:/claude/nomad/nomad/structs/structs.go#L1693)

**中文说明**：PlanResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type PlanResponse struct {
	Result *PlanResult
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Result` | `*PlanResult` | 结果 |
| `WriteMeta` | `WriteMeta` | — |

### AllocListResponse

**定义位置**：[L1699](file:///d:/claude/nomad/nomad/structs/structs.go#L1699)

**中文说明**：AllocListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type AllocListResponse struct {
	Allocations []*AllocListStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Allocations` | `[]*AllocListStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### DeploymentListResponse

**定义位置**：[L1705](file:///d:/claude/nomad/nomad/structs/structs.go#L1705)

**中文说明**：DeploymentListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type DeploymentListResponse struct {
	Deployments []*Deployment
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Deployments` | `[]*Deployment` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### EvalListResponse

**定义位置**：[L1711](file:///d:/claude/nomad/nomad/structs/structs.go#L1711)

**中文说明**：EvalListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type EvalListResponse struct {
	Evaluations []*Evaluation
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Evaluations` | `[]*Evaluation` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### EvalCountResponse

**定义位置**：[L1717](file:///d:/claude/nomad/nomad/structs/structs.go#L1717)

**中文说明**：EvalCountResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type EvalCountResponse struct {
	Count int
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Count` | `int` | 计数 |
| `QueryMeta` | `QueryMeta` | — |

### EvalAllocationsResponse

**定义位置**：[L1723](file:///d:/claude/nomad/nomad/structs/structs.go#L1723)

**中文说明**：EvalAllocationsResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type EvalAllocationsResponse struct {
	Allocations []*AllocListStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Allocations` | `[]*AllocListStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### PeriodicForceResponse

**定义位置**：[L1729](file:///d:/claude/nomad/nomad/structs/structs.go#L1729)

**中文说明**：PeriodicForceResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type PeriodicForceResponse struct {
	EvalID string
	EvalCreateIndex uint64
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalID` | `string` | 字符串 |
| `EvalCreateIndex` | `uint64` | 索引值（uint64） |
| `WriteMeta` | `WriteMeta` | — |

### DeploymentUpdateResponse

**定义位置**：[L1738](file:///d:/claude/nomad/nomad/structs/structs.go#L1738)

**中文说明**：DeploymentUpdateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type DeploymentUpdateResponse struct {
	EvalID string
	EvalCreateIndex uint64
	DeploymentModifyIndex uint64
	RevertedJobVersion *uint64
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalID` | `string` | 字符串 |
| `EvalCreateIndex` | `uint64` | 索引值（uint64） |
| `DeploymentModifyIndex` | `uint64` | 索引值（uint64） |
| `RevertedJobVersion` | `*uint64` | 无符号 64 位整数 |
| `WriteMeta` | `WriteMeta` | — |

### NodeConnQueryResponse

**定义位置**：[L1752](file:///d:/claude/nomad/nomad/structs/structs.go#L1752)

**中文说明**：NodeConnQueryResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NodeConnQueryResponse struct {
	Connected bool
	Established time.Time
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Connected` | `bool` | 布尔值 |
| `Established` | `time.Time` | 时间点 |
| `QueryMeta` | `QueryMeta` | — |

### HostDataRequest

**定义位置**：[L1764](file:///d:/claude/nomad/nomad/structs/structs.go#L1764)

**中文说明**：HostDataRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type HostDataRequest struct {
	ServerID string
	NodeID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ServerID` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### HostDataResponse

**定义位置**：[L1771](file:///d:/claude/nomad/nomad/structs/structs.go#L1771)

**中文说明**：HostDataResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type HostDataResponse struct {
	AgentID string
	HostData *host.HostData
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AgentID` | `string` | 字符串 |
| `HostData` | `*host.HostData` | — |

### EmitNodeEventsRequest

**定义位置**：[L1778](file:///d:/claude/nomad/nomad/structs/structs.go#L1778)

**中文说明**：EmitNodeEventsRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type EmitNodeEventsRequest struct {
	NodeEvents map[string][]*NodeEvent
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeEvents` | `map[string][]*NodeEvent` | 映射表 |
| `WriteRequest` | `WriteRequest` | — |

### EmitNodeEventsResponse

**定义位置**：[L1788](file:///d:/claude/nomad/nomad/structs/structs.go#L1788)

**中文说明**：EmitNodeEventsResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type EmitNodeEventsResponse struct {
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WriteMeta` | `WriteMeta` | — |

### NodeEvent

**定义位置**：[L1802](file:///d:/claude/nomad/nomad/structs/structs.go#L1802)

**中文说明**：NodeEvent 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeEvent struct {
	Message string
	Subsystem string
	Details map[string]string
	Timestamp time.Time
	CreateIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Message` | `string` | 消息 |
| `Subsystem` | `string` | 字符串 |
| `Details` | `map[string]string` | 映射表 |
| `Timestamp` | `time.Time` | 时间戳 |
| `CreateIndex` | `uint64` | 索引值（uint64） |

**关联方法**（6 个）：`String`, `Copy`, `SetMessage`, `SetSubsystem`, `SetTimestamp`, `AddDetail`

### DrainSpec

**定义位置**：[L1898](file:///d:/claude/nomad/nomad/structs/structs.go#L1898)

**中文说明**：DrainSpec 是一个规格定义结构体，描述对象的规格参数。

**类型**：struct

```go
type DrainSpec struct {
	Deadline time.Duration
	IgnoreSystemJobs bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Deadline` | `time.Duration` | 截止时间 |
| `IgnoreSystemJobs` | `bool` | 布尔值 |

### DrainStrategy

**定义位置**：[L1909](file:///d:/claude/nomad/nomad/structs/structs.go#L1909)

**中文说明**：DrainStrategy 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type DrainStrategy struct {
	DrainSpec DrainSpec
	ForceDeadline time.Time
	StartedAt time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DrainSpec` | `DrainSpec` | — |
| `ForceDeadline` | `time.Time` | 时间点 |
| `StartedAt` | `time.Time` | 时间点 |

**关联方法**（3 个）：`Copy`, `DeadlineTime`, `Equal`

### DrainStatus

**定义位置**：[L1981](file:///d:/claude/nomad/nomad/structs/structs.go#L1981)

**中文说明**：DrainStatus 是一个状态结构体，描述对象或操作的当前状态。

**类型定义**：`type DrainStatus string`

### DrainMetadata

**定义位置**：[L1984](file:///d:/claude/nomad/nomad/structs/structs.go#L1984)

**中文说明**：DrainMetadata 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type DrainMetadata struct {
	StartedAt time.Time
	UpdatedAt time.Time
	Status DrainStatus
	AccessorID string
	Meta map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `StartedAt` | `time.Time` | 时间点 |
| `UpdatedAt` | `time.Time` | 时间点 |
| `Status` | `DrainStatus` | 状态 |
| `AccessorID` | `string` | 字符串 |
| `Meta` | `map[string]string` | 元数据 |

**关联方法**（1 个）：`Copy`

### Node

**定义位置**：[L2014](file:///d:/claude/nomad/nomad/structs/structs.go#L2014)

**中文说明**：Node 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type Node struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `SecretID` | `string` | 字符串 |
| `Datacenter` | `string` | 数据中心 |
| `Name` | `string` | 名称 |
| `CgroupParent` | `string` | 字符串 |
| `HTTPAddr` | `string` | 字符串 |
| `TLSEnabled` | `bool` | 布尔值 |
| `Attributes` | `map[string]string` | 映射表 |
| `NodeResources` | `*NodeResources` | — |
| `ReservedResources` | `*NodeReservedResources` | — |
| `Links` | `map[string]string` | 映射表 |
| `Meta` | `map[string]string` | 元数据 |
| `NodeClass` | `string` | 字符串 |
| `NodePool` | `string` | 字符串 |
| `ComputedClass` | `string` | 字符串 |
| `DrainStrategy` | `*DrainStrategy` | — |
| `SchedulingEligibility` | `string` | 字符串 |
| `Status` | `string` | 状态 |
| `StatusDescription` | `string` | 字符串 |
| `IdentitySigningKeyID` | `string` | 字符串 |
| `StatusUpdatedAt` | `int64` | — |
| `Events` | `[]*NodeEvent` | 列表 |
| `Drivers` | `map[string]*DriverInfo` | 映射表 |
| `CSIControllerPlugins` | `map[string]*CSIInfo` | 映射表 |
| `CSINodePlugins` | `map[string]*CSIInfo` | 映射表 |
| `HostVolumes` | `map[string]*ClientHostVolumeConfig` | 关联的 Client 实例 |
| `GCVolumesOnNodeGC` | `bool` | 布尔值 |
| `HostNetworks` | `map[string]*ClientHostNetworkConfig` | 关联的 Client 实例 |
| `LastDrain` | `*DrainMetadata` | — |
| `NodeMaxAllocs` | `int` | — |
| `LastMissedHeartbeatIndex` | `uint64` | 索引值（uint64） |
| `LastAllocUpdateIndex` | `uint64` | 索引值（uint64） |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（11 个）：`GetID`, `Sanitize`, `Ready`, `Canonicalize`, `Copy`, `UnresponsiveStatus`, `TerminalStatus`, `IsInAnyDC`, `IsInPool`, `HasEvent`, `Stub`

### NodeListStub

**定义位置**：[L2336](file:///d:/claude/nomad/nomad/structs/structs.go#L2336)

**中文说明**：NodeListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type NodeListStub struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Address` | `string` | 地址 |
| `ID` | `string` | 唯一标识符 |
| `Attributes` | `map[string]string `json:",omitempty"`` | 映射表 |
| `Datacenter` | `string` | 数据中心 |
| `Name` | `string` | 名称 |
| `NodePool` | `string` | 字符串 |
| `NodeClass` | `string` | 字符串 |
| `Version` | `string` | 版本号 |
| `Drain` | `bool` | 布尔值 |
| `SchedulingEligibility` | `string` | 字符串 |
| `Status` | `string` | 状态 |
| `StatusDescription` | `string` | 字符串 |
| `Drivers` | `map[string]*DriverInfo` | 映射表 |
| `HostVolumes` | `map[string]*ClientHostVolumeConfig` | 关联的 Client 实例 |
| `NodeResources` | `*NodeResources `json:",omitempty"`` | — |
| `ReservedResources` | `*NodeReservedResources `json:",omitempty"`` | — |
| `LastDrain` | `*DrainMetadata` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### NodeStubFields

**定义位置**：[L2359](file:///d:/claude/nomad/nomad/structs/structs.go#L2359)

**中文说明**：NodeStubFields 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeStubFields struct {
	Resources bool
	OS bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Resources` | `bool` | 布尔值 |
| `OS` | `bool` | 布尔值 |

### Resources

**定义位置**：[L2366](file:///d:/claude/nomad/nomad/structs/structs.go#L2366)

**中文说明**：Resources 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Resources struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CPU` | `int` | — |
| `Cores` | `int` | — |
| `MemoryMB` | `int` | — |
| `MemoryMaxMB` | `int` | — |
| `DiskMB` | `int` | — |
| `IOPS` | `int` | — |
| `Networks` | `Networks` | — |
| `Devices` | `ResourceDevices` | — |
| `NUMA` | `*NUMA` | — |
| `SecretsMB` | `int` | — |

**关联方法**（10 个）：`DiskInBytes`, `Validate`, `Merge`, `Equal`, `Canonicalize`, `MeetsMinResources`, `Copy`, `NetIndex`, `Add`, `GoString`

### ResourceDevices

**定义位置**：[L2527](file:///d:/claude/nomad/nomad/structs/structs.go#L2527)

**中文说明**：ResourceDevices 与设备（Device）相关，管理硬件资源如 GPU/FPGA。

**类型定义**：`type ResourceDevices []*RequestedDevice`

**关联方法**（2 个）：`Copy`, `Equal`

### NodeNetworkResource

**定义位置**：[L2683](file:///d:/claude/nomad/nomad/structs/structs.go#L2683)

**中文说明**：NodeNetworkResource 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeNetworkResource struct {
	Mode string
	Device string
	MacAddress string
	Speed int
	Addresses []NodeNetworkAddress
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Mode` | `string` | 字符串 |
| `Device` | `string` | 字符串 |
| `MacAddress` | `string` | 字符串 |
| `Speed` | `int` | — |
| `Addresses` | `[]NodeNetworkAddress` | 列表 |

**关联方法**（3 个）：`Equal`, `Copy`, `HasAlias`

### NodeNetworkAF

**定义位置**：[L2723](file:///d:/claude/nomad/nomad/structs/structs.go#L2723)

**中文说明**：NodeNetworkAF 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型定义**：`type NodeNetworkAF string`

**关联方法**（1 个）：`Validate`

### NodeNetworkAddress

**定义位置**：[L2738](file:///d:/claude/nomad/nomad/structs/structs.go#L2738)

**中文说明**：NodeNetworkAddress 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeNetworkAddress struct {
	Family NodeNetworkAF
	Alias string
	Address string
	ReservedPorts string
	Gateway string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Family` | `NodeNetworkAF` | — |
| `Alias` | `string` | 字符串 |
| `Address` | `string` | 地址 |
| `ReservedPorts` | `string` | 字符串 |
| `Gateway` | `string` | 字符串 |

### AllocatedPortMapping

**定义位置**：[L2746](file:///d:/claude/nomad/nomad/structs/structs.go#L2746)

**中文说明**：AllocatedPortMapping 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocatedPortMapping struct {
	_struct bool `codec:",omitempty"`
	Label string
	Value int
	To int
	HostIP string
	IgnoreCollision bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `_struct` | `bool `codec:",omitempty"`` | 布尔值 |
| `Label` | `string` | 字符串 |
| `Value` | `int` | 值 |
| `To` | `int` | — |
| `HostIP` | `string` | 字符串 |
| `IgnoreCollision` | `bool` | 布尔值 |

**关联方法**（2 个）：`Copy`, `Equal`

### AllocatedPorts

**定义位置**：[L2786](file:///d:/claude/nomad/nomad/structs/structs.go#L2786)

**中文说明**：AllocatedPorts 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型定义**：`type AllocatedPorts []AllocatedPortMapping`

**关联方法**（2 个）：`Equal`, `Get`

### Port

**定义位置**：[L2804](file:///d:/claude/nomad/nomad/structs/structs.go#L2804)

**中文说明**：Port 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Port struct {
	_struct bool `codec:",omitempty"`
	Label string
	Value int
	To int
	HostNetwork string
	IgnoreCollision bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `_struct` | `bool `codec:",omitempty"`` | 布尔值 |
| `Label` | `string` | 字符串 |
| `Value` | `int` | 值 |
| `To` | `int` | — |
| `HostNetwork` | `string` | 字符串 |
| `IgnoreCollision` | `bool` | 布尔值 |

### DNSConfig

**定义位置**：[L2831](file:///d:/claude/nomad/nomad/structs/structs.go#L2831)

**中文说明**：DNSConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type DNSConfig struct {
	Servers []string
	Searches []string
	Options []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Servers` | `[]string` | 列表 |
| `Searches` | `[]string` | 列表 |
| `Options` | `[]string` | 选项 |

**关联方法**（3 个）：`Equal`, `Copy`, `IsZero`

### NetworkResource

**定义位置**：[L2874](file:///d:/claude/nomad/nomad/structs/structs.go#L2874)

**中文说明**：NetworkResource 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type NetworkResource struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `_struct` | `bool `codec:",omitempty"`` | 布尔值 |
| `Mode` | `string` | 字符串 |
| `Device` | `string` | 字符串 |
| `CIDR` | `string` | 字符串 |
| `IP` | `string` | 字符串 |
| `Hostname` | `string `json:",omitempty"`` | 字符串 |
| `MBits` | `int` | 吞吐量 |
| `DNS` | `*DNSConfig` | — |
| `ReservedPorts` | `[]Port` | 列表 |
| `DynamicPorts` | `[]Port` | 列表 |
| `CNI` | `*CNIConfig` | — |

**关联方法**（8 个）：`Hash`, `Equal`, `Canonicalize`, `Copy`, `Add`, `GoString`, `PortLabels`, `IsIPv6`

### Networks

**定义位置**：[L2983](file:///d:/claude/nomad/nomad/structs/structs.go#L2983)

**类型定义**：`type Networks []*NetworkResource`

**关联方法**（5 个）：`Copy`, `Port`, `NetIndex`, `Modes`, `Equal`

### RequestedDevice

**定义位置**：[L3042](file:///d:/claude/nomad/nomad/structs/structs.go#L3042)

**中文说明**：RequestedDevice 与设备（Device）相关，管理硬件资源如 GPU/FPGA。

**类型**：struct

```go
type RequestedDevice struct {
	Name string
	Count uint64
	Constraints Constraints
	Affinities Affinities
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Count` | `uint64` | 计数 |
| `Constraints` | `Constraints` | — |
| `Affinities` | `Affinities` | — |

**关联方法**（5 个）：`String`, `Equal`, `Copy`, `ID`, `Validate`

### NodeResources

**定义位置**：[L3154](file:///d:/claude/nomad/nomad/structs/structs.go#L3154)

**中文说明**：NodeResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeResources struct {
	Cpu LegacyNodeCpuResources
	Processors NodeProcessorResources
	Memory NodeMemoryResources
	Disk NodeDiskResources
	Devices []*NodeDeviceResource
	NodeNetworks []*NodeNetworkResource
	Networks Networks
	MinDynamicPort int
	MaxDynamicPort int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Cpu` | `LegacyNodeCpuResources` | — |
| `Processors` | `NodeProcessorResources` | — |
| `Memory` | `NodeMemoryResources` | — |
| `Disk` | `NodeDiskResources` | — |
| `Devices` | `[]*NodeDeviceResource` | 列表 |
| `NodeNetworks` | `[]*NodeNetworkResource` | 列表 |
| `Networks` | `Networks` | — |
| `MinDynamicPort` | `int` | — |
| `MaxDynamicPort` | `int` | — |

**关联方法**（4 个）：`Copy`, `Comparable`, `Merge`, `Equal`

### NodeMemoryResources

**定义位置**：[L3380](file:///d:/claude/nomad/nomad/structs/structs.go#L3380)

**中文说明**：NodeMemoryResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeMemoryResources struct {
	MemoryMB int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MemoryMB` | `int64` | — |

**关联方法**（2 个）：`Merge`, `Equal`

### NodeDiskResources

**定义位置**：[L3412](file:///d:/claude/nomad/nomad/structs/structs.go#L3412)

**中文说明**：NodeDiskResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeDiskResources struct {
	DiskMB int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DiskMB` | `int64` | — |

**关联方法**（2 个）：`Merge`, `Equal`

### DeviceIdTuple

**定义位置**：[L3443](file:///d:/claude/nomad/nomad/structs/structs.go#L3443)

**中文说明**：DeviceIdTuple 与设备（Device）相关，管理硬件资源如 GPU/FPGA。

**类型**：struct

```go
type DeviceIdTuple struct {
	Vendor string
	Type string
	Name string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Vendor` | `string` | 字符串 |
| `Type` | `string` | 类型 |
| `Name` | `string` | 名称 |

**关联方法**（3 个）：`String`, `Matches`, `Equal`

### NodeDeviceResource

**定义位置**：[L3491](file:///d:/claude/nomad/nomad/structs/structs.go#L3491)

**中文说明**：NodeDeviceResource 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeDeviceResource struct {
	Vendor string
	Type string
	Name string
	Instances []*NodeDevice
	Attributes map[string]*psstructs.Attribute
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Vendor` | `string` | 字符串 |
| `Type` | `string` | 类型 |
| `Name` | `string` | 名称 |
| `Instances` | `[]*NodeDevice` | 列表 |
| `Attributes` | `map[string]*psstructs.Attribute` | 映射表 |

**关联方法**（3 个）：`ID`, `Copy`, `Equal`

### NodeDevice

**定义位置**：[L3579](file:///d:/claude/nomad/nomad/structs/structs.go#L3579)

**中文说明**：NodeDevice 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeDevice struct {
	ID string
	Healthy bool
	HealthDescription string
	Locality *NodeDeviceLocality
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | ID is ID 的 设备. |
| `Healthy` | `bool` | 是否健康 |
| `HealthDescription` | `string` | 字符串 |
| `Locality` | `*NodeDeviceLocality` | — |

**关联方法**（2 个）：`Equal`, `Copy`

### NodeDeviceLocality

**定义位置**：[L3633](file:///d:/claude/nomad/nomad/structs/structs.go#L3633)

**中文说明**：NodeDeviceLocality 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeDeviceLocality struct {
	PciBusID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PciBusID` | `string` | 字符串 |

**关联方法**（2 个）：`Equal`, `Copy`

### NodeReservedResources

**定义位置**：[L3666](file:///d:/claude/nomad/nomad/structs/structs.go#L3666)

**中文说明**：NodeReservedResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeReservedResources struct {
	Cpu NodeReservedCpuResources
	Memory NodeReservedMemoryResources
	Disk NodeReservedDiskResources
	Networks NodeReservedNetworkResources
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Cpu` | `NodeReservedCpuResources` | — |
| `Memory` | `NodeReservedMemoryResources` | — |
| `Disk` | `NodeReservedDiskResources` | — |
| `Networks` | `NodeReservedNetworkResources` | — |

**关联方法**（2 个）：`Copy`, `Comparable`

### NodeReservedCpuResources

**定义位置**：[L3708](file:///d:/claude/nomad/nomad/structs/structs.go#L3708)

**中文说明**：NodeReservedCpuResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeReservedCpuResources struct {
	CpuShares int64
	ReservedCpuCores []uint16
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CpuShares` | `int64` | — |
| `ReservedCpuCores` | `[]uint16` | 列表 |

### NodeReservedMemoryResources

**定义位置**：[L3714](file:///d:/claude/nomad/nomad/structs/structs.go#L3714)

**中文说明**：NodeReservedMemoryResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeReservedMemoryResources struct {
	MemoryMB int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MemoryMB` | `int64` | — |

### NodeReservedDiskResources

**定义位置**：[L3719](file:///d:/claude/nomad/nomad/structs/structs.go#L3719)

**中文说明**：NodeReservedDiskResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeReservedDiskResources struct {
	DiskMB int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DiskMB` | `int64` | — |

### NodeReservedNetworkResources

**定义位置**：[L3724](file:///d:/claude/nomad/nomad/structs/structs.go#L3724)

**中文说明**：NodeReservedNetworkResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeReservedNetworkResources struct {
	ReservedHostPorts string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ReservedHostPorts` | `string` | 字符串 |

### AllocatedResources

**定义位置**：[L3732](file:///d:/claude/nomad/nomad/structs/structs.go#L3732)

**中文说明**：AllocatedResources 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocatedResources struct {
	Tasks map[string]*AllocatedTaskResources
	TaskLifecycles map[string]*TaskLifecycleConfig
	Shared AllocatedSharedResources
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Tasks` | `map[string]*AllocatedTaskResources` | 映射表 |
| `TaskLifecycles` | `map[string]*TaskLifecycleConfig` | 映射表 |
| `Shared` | `AllocatedSharedResources` | — |

**关联方法**（5 个）：`UsesCores`, `Copy`, `Comparable`, `OldTaskResources`, `Canonicalize`

### AllocatedTaskResources

**定义位置**：[L3874](file:///d:/claude/nomad/nomad/structs/structs.go#L3874)

**中文说明**：AllocatedTaskResources 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocatedTaskResources struct {
	Cpu AllocatedCpuResources
	Memory AllocatedMemoryResources
	Networks Networks
	Devices []*AllocatedDeviceResource
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Cpu` | `AllocatedCpuResources` | — |
| `Memory` | `AllocatedMemoryResources` | — |
| `Networks` | `Networks` | — |
| `Devices` | `[]*AllocatedDeviceResource` | 列表 |

**关联方法**（6 个）：`Copy`, `NetIndex`, `Add`, `Max`, `Comparable`, `Subtract`

### AllocatedSharedResources

**定义位置**：[L3997](file:///d:/claude/nomad/nomad/structs/structs.go#L3997)

**中文说明**：AllocatedSharedResources 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocatedSharedResources struct {
	Networks Networks
	DiskMB int64
	Ports AllocatedPorts
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Networks` | `Networks` | — |
| `DiskMB` | `int64` | — |
| `Ports` | `AllocatedPorts` | — |

**关联方法**（4 个）：`Copy`, `Add`, `Subtract`, `Canonicalize`

### AllocatedCpuResources

**定义位置**：[L4057](file:///d:/claude/nomad/nomad/structs/structs.go#L4057)

**中文说明**：AllocatedCpuResources 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocatedCpuResources struct {
	CpuShares int64
	ReservedCores []uint16
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CpuShares` | `int64` | — |
| `ReservedCores` | `[]uint16` | 列表 |

**关联方法**（3 个）：`Add`, `Subtract`, `Max`

### AllocatedMemoryResources

**定义位置**：[L4107](file:///d:/claude/nomad/nomad/structs/structs.go#L4107)

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

**关联方法**（3 个）：`Add`, `Subtract`, `Max`

### AllocatedDevices

**定义位置**：[L4151](file:///d:/claude/nomad/nomad/structs/structs.go#L4151)

**中文说明**：AllocatedDevices 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型定义**：`type AllocatedDevices []*AllocatedDeviceResource`

**关联方法**（1 个）：`Index`

### AllocatedDeviceResource

**定义位置**：[L4170](file:///d:/claude/nomad/nomad/structs/structs.go#L4170)

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

**关联方法**（3 个）：`ID`, `Add`, `Copy`

### ComparableResources

**定义位置**：[L4216](file:///d:/claude/nomad/nomad/structs/structs.go#L4216)

**中文说明**：ComparableResources 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ComparableResources struct {
	Flattened AllocatedTaskResources
	Shared AllocatedSharedResources
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Flattened` | `AllocatedTaskResources` | — |
| `Shared` | `AllocatedSharedResources` | — |

**关联方法**（5 个）：`Add`, `Subtract`, `Copy`, `Superset`, `NetIndex`

### JobSubmission

**定义位置**：[L4324](file:///d:/claude/nomad/nomad/structs/structs.go#L4324)

**中文说明**：JobSubmission 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobSubmission struct {
	Source string
	Format string
	VariableFlags map[string]string
	Variables string
	Namespace string
	JobID string
	Version uint64
	JobModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Source` | `string` | 字符串 |
| `Format` | `string` | 字符串 |
| `VariableFlags` | `map[string]string` | 映射表 |
| `Variables` | `string` | 字符串 |
| `Namespace` | `string` | 命名空间 |
| `JobID` | `string` | 字符串 |
| `Version` | `uint64` | 版本号 |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（2 个）：`Hash`, `Copy`

### Job

**定义位置**：[L4388](file:///d:/claude/nomad/nomad/structs/structs.go#L4388)

**中文说明**：Job 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type Job struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Stop` | `bool` | 布尔值 |
| `Region` | `string` | 区域 |
| `Namespace` | `string` | 命名空间 |
| `ID` | `string` | 唯一标识符 |
| `ParentID` | `string` | 字符串 |
| `Name` | `string` | 名称 |
| `Type` | `string` | 类型 |
| `Priority` | `int` | — |
| `AllAtOnce` | `bool` | 布尔值 |
| `Datacenters` | `[]string` | 列表 |
| `NodePool` | `string` | 字符串 |
| `Constraints` | `[]*Constraint` | 列表 |
| `Affinities` | `[]*Affinity` | 列表 |
| `Spreads` | `[]*Spread` | 列表 |
| `TaskGroups` | `[]*TaskGroup` | 列表 |
| `Update` | `UpdateStrategy` | — |
| `Multiregion` | `*Multiregion` | — |
| `Periodic` | `*PeriodicConfig` | — |
| `ParameterizedJob` | `*ParameterizedJobConfig` | — |
| `Dispatched` | `bool` | 布尔值 |
| `DispatchIdempotencyToken` | `string` | 字符串 |
| `Payload` | `[]byte` | 字节数组 |
| `Meta` | `map[string]string` | 元数据 |
| `ConsulNamespace` | `string` | 字符串 |
| `VaultNamespace` | `string` | 字符串 |
| `NomadTokenID` | `string` | 字符串 |
| `Status` | `string` | Job 状态 |
| `StatusDescription` | `string` | 字符串 |
| `Stable` | `bool` | 布尔值 |
| `Version` | `uint64` | 版本号 |
| `SubmitTime` | `int64` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `UI` | `*JobUIConfig` | — |
| `VersionTag` | `*JobVersionTag` | — |

**关联方法**（30 个）：`NamespacedID`, `GetID`, `GetNamespace`, `GetIDforWorkloadIdentity`, `GetCreateIndex`, `GetModifyIndex`, `Canonicalize`, `Copy`, `Validate`, `generateServiceShutdownDelayWarnings`, `Warnings`, `LookupTaskGroup`, `CombinedTaskMeta`, `Stopped`, `HasUpdateStrategy`, `Stub`, `IsPeriodic`, `IsPeriodicActive`, `IsParameterized`, `IsMultiregion`, `IsPlugin`, `HasPlugin`, `Vault`, `Secrets`, `ConnectTasks`, `RequiredSignals`, `SpecChanged`, `SetSubmitTime`, `GetScalingPolicies`, `UsesDeployments`

### JobVersionTag

**定义位置**：[L4528](file:///d:/claude/nomad/nomad/structs/structs.go#L4528)

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

### JobApplyTagRequest

**定义位置**：[L4534](file:///d:/claude/nomad/nomad/structs/structs.go#L4534)

**中文说明**：JobApplyTagRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type JobApplyTagRequest struct {
	JobID string
	Name string
	Tag *JobVersionTag
	Version uint64
	Latest bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `Name` | `string` | 名称 |
| `Tag` | `*JobVersionTag` | — |
| `Version` | `uint64` | 版本号 |
| `Latest` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### JobTagResponse

**定义位置**：[L4543](file:///d:/claude/nomad/nomad/structs/structs.go#L4543)

**中文说明**：JobTagResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobTagResponse struct {
	Name string
	Description string
	TaggedTime int64
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Description` | `string` | 描述信息 |
| `TaggedTime` | `int64` | — |
| `QueryMeta` | `QueryMeta` | — |

### JobUIConfig

**定义位置**：[L4561](file:///d:/claude/nomad/nomad/structs/structs.go#L4561)

**中文说明**：JobUIConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type JobUIConfig struct {
	Description string
	Links []*JobUILink
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Description` | `string` | 描述信息 |
| `Links` | `[]*JobUILink` | 列表 |

**关联方法**（1 个）：`Copy`

### JobUILink

**定义位置**：[L4566](file:///d:/claude/nomad/nomad/structs/structs.go#L4566)

**中文说明**：JobUILink 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobUILink struct {
	Label string
	Url string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Label` | `string` | 字符串 |
| `Url` | `string` | URL 地址 |

**关联方法**（1 个）：`Copy`

### JobListStub

**定义位置**：[L5289](file:///d:/claude/nomad/nomad/structs/structs.go#L5289)

**中文说明**：JobListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type JobListStub struct {
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
| `NodePool` | `string` | 字符串 |
| `Multiregion` | `*Multiregion` | — |
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

### JobSummary

**定义位置**：[L5313](file:///d:/claude/nomad/nomad/structs/structs.go#L5313)

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

**关联方法**（1 个）：`Copy`

### JobChildrenSummary

**定义位置**：[L5345](file:///d:/claude/nomad/nomad/structs/structs.go#L5345)

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

**关联方法**（1 个）：`Copy`

### TaskGroupSummary

**定义位置**：[L5364](file:///d:/claude/nomad/nomad/structs/structs.go#L5364)

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

### UpdateStrategy

**定义位置**：[L5406](file:///d:/claude/nomad/nomad/structs/structs.go#L5406)

**中文说明**：UpdateStrategy 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type UpdateStrategy struct {
	Stagger time.Duration
	MaxParallel int
	HealthCheck string
	MinHealthyTime time.Duration
	HealthyDeadline time.Duration
	ProgressDeadline time.Duration
	AutoRevert bool
	AutoPromote bool
	Canary int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Stagger` | `time.Duration` | 时间间隔 |
| `MaxParallel` | `int` | — |
| `HealthCheck` | `string` | 字符串 |
| `MinHealthyTime` | `time.Duration` | 时间间隔 |
| `HealthyDeadline` | `time.Duration` | 时间间隔 |
| `ProgressDeadline` | `time.Duration` | 时间间隔 |
| `AutoRevert` | `bool` | 布尔值 |
| `AutoPromote` | `bool` | 布尔值 |
| `Canary` | `int` | — |

**关联方法**（4 个）：`Copy`, `Validate`, `IsEmpty`, `Rolling`

### Multiregion

**定义位置**：[L5524](file:///d:/claude/nomad/nomad/structs/structs.go#L5524)

**中文说明**：Multiregion 与区域（Region）相关，Nomad 的多区域联邦单元。

**类型**：struct

```go
type Multiregion struct {
	Strategy *MultiregionStrategy
	Regions []*MultiregionRegion
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Strategy` | `*MultiregionStrategy` | — |
| `Regions` | `[]*MultiregionRegion` | 列表 |

**关联方法**（3 个）：`Canonicalize`, `Diff`, `Copy`

### MultiregionStrategy

**定义位置**：[L5571](file:///d:/claude/nomad/nomad/structs/structs.go#L5571)

**中文说明**：MultiregionStrategy 与区域（Region）相关，Nomad 的多区域联邦单元。

**类型**：struct

```go
type MultiregionStrategy struct {
	MaxParallel int
	OnFailure string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MaxParallel` | `int` | — |
| `OnFailure` | `string` | 字符串 |

### MultiregionRegion

**定义位置**：[L5576](file:///d:/claude/nomad/nomad/structs/structs.go#L5576)

**中文说明**：MultiregionRegion 与区域（Region）相关，Nomad 的多区域联邦单元。

**类型**：struct

```go
type MultiregionRegion struct {
	Name string
	Count int
	Datacenters []string
	NodePool string
	Meta map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Count` | `int` | 计数 |
| `Datacenters` | `[]string` | 列表 |
| `NodePool` | `string` | 字符串 |
| `Meta` | `map[string]string` | 元数据 |

### Namespace

**定义位置**：[L5585](file:///d:/claude/nomad/nomad/structs/structs.go#L5585)

**中文说明**：Namespace 与命名空间（Namespace）相关，提供资源隔离。

**类型**：struct

```go
type Namespace struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Description` | `string` | 描述信息 |
| `Quota` | `string` | 字符串 |
| `Capabilities` | `*NamespaceCapabilities` | — |
| `NodePoolConfiguration` | `*NamespaceNodePoolConfiguration` | — |
| `VaultConfiguration` | `*NamespaceVaultConfiguration` | — |
| `ConsulConfiguration` | `*NamespaceConsulConfiguration` | — |
| `Meta` | `map[string]string` | 元数据 |
| `Hash` | `[]byte` | 字节数组 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `RequiredExtraClaims` | `map[string]string` | 映射表 |
| `OptionalExtraClaims` | `map[string]string` | 映射表 |

**关联方法**（3 个）：`Validate`, `SetHash`, `Copy`

### NamespaceCapabilities

**定义位置**：[L5624](file:///d:/claude/nomad/nomad/structs/structs.go#L5624)

**中文说明**：NamespaceCapabilities 与命名空间（Namespace）相关，提供资源隔离。

**类型**：struct

```go
type NamespaceCapabilities struct {
	EnabledTaskDrivers []string
	DisabledTaskDrivers []string
	EnabledNetworkModes []string
	DisabledNetworkModes []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EnabledTaskDrivers` | `[]string` | 列表 |
| `DisabledTaskDrivers` | `[]string` | 列表 |
| `EnabledNetworkModes` | `[]string` | 列表 |
| `DisabledNetworkModes` | `[]string` | 列表 |

### NamespaceNodePoolConfiguration

**定义位置**：[L5633](file:///d:/claude/nomad/nomad/structs/structs.go#L5633)

**中文说明**：NamespaceNodePoolConfiguration 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NamespaceNodePoolConfiguration struct {
	Default string
	Allowed []string
	Denied []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Default` | `string` | 默认 is 节点池 被 jobs 在 此 命名空间 该 don't 指定 节点池 的 其 own. |
| `Allowed` | `[]string` | 列表 |
| `Denied` | `[]string` | 列表 |

### NamespaceListRequest

**定义位置**：[L5818](file:///d:/claude/nomad/nomad/structs/structs.go#L5818)

**中文说明**：NamespaceListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NamespaceListRequest struct {
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |

### NamespaceListResponse

**定义位置**：[L5823](file:///d:/claude/nomad/nomad/structs/structs.go#L5823)

**中文说明**：NamespaceListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NamespaceListResponse struct {
	Namespaces []*Namespace
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespaces` | `[]*Namespace` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### NamespaceSpecificRequest

**定义位置**：[L5829](file:///d:/claude/nomad/nomad/structs/structs.go#L5829)

**中文说明**：NamespaceSpecificRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NamespaceSpecificRequest struct {
	Name string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `QueryOptions` | `QueryOptions` | — |

### SingleNamespaceResponse

**定义位置**：[L5835](file:///d:/claude/nomad/nomad/structs/structs.go#L5835)

**中文说明**：SingleNamespaceResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SingleNamespaceResponse struct {
	Namespace *Namespace
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `*Namespace` | 命名空间 |
| `QueryMeta` | `QueryMeta` | — |

### NamespaceSetRequest

**定义位置**：[L5841](file:///d:/claude/nomad/nomad/structs/structs.go#L5841)

**中文说明**：NamespaceSetRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NamespaceSetRequest struct {
	Namespaces []string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespaces` | `[]string` | 列表 |
| `QueryOptions` | `QueryOptions` | — |

### NamespaceSetResponse

**定义位置**：[L5847](file:///d:/claude/nomad/nomad/structs/structs.go#L5847)

**中文说明**：NamespaceSetResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NamespaceSetResponse struct {
	Namespaces map[string]*Namespace
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespaces` | `map[string]*Namespace` | 映射表 |
| `QueryMeta` | `QueryMeta` | — |

### NamespaceDeleteRequest

**定义位置**：[L5853](file:///d:/claude/nomad/nomad/structs/structs.go#L5853)

**中文说明**：NamespaceDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NamespaceDeleteRequest struct {
	Namespaces []string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespaces` | `[]string` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### NamespaceUpsertRequest

**定义位置**：[L5859](file:///d:/claude/nomad/nomad/structs/structs.go#L5859)

**中文说明**：NamespaceUpsertRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NamespaceUpsertRequest struct {
	Namespaces []*Namespace
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespaces` | `[]*Namespace` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### PeriodicConfig

**定义位置**：[L5874](file:///d:/claude/nomad/nomad/structs/structs.go#L5874)

**中文说明**：PeriodicConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type PeriodicConfig struct {
	Enabled bool
	Spec string
	Specs []string
	SpecType string
	ProhibitOverlap bool
	TimeZone string
	location *time.Location
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Enabled` | `bool` | 是否启用 |
| `Spec` | `string` | 字符串 |
| `Specs` | `[]string` | 列表 |
| `SpecType` | `string` | 字符串 |
| `ProhibitOverlap` | `bool` | 布尔值 |
| `TimeZone` | `string` | 字符串 |
| `location` | `*time.Location` | — |

**关联方法**（5 个）：`Copy`, `Validate`, `Canonicalize`, `Next`, `GetLocation`

### PeriodicLaunch

**定义位置**：[L6053](file:///d:/claude/nomad/nomad/structs/structs.go#L6053)

**中文说明**：PeriodicLaunch 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type PeriodicLaunch struct {
	ID string
	Namespace string
	Launch time.Time
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Namespace` | `string` | 命名空间 |
| `Launch` | `time.Time` | 时间点 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### ParameterizedJobConfig

**定义位置**：[L6074](file:///d:/claude/nomad/nomad/structs/structs.go#L6074)

**中文说明**：ParameterizedJobConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type ParameterizedJobConfig struct {
	Payload string
	MetaRequired []string
	MetaOptional []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Payload` | `string` | 字符串 |
| `MetaRequired` | `[]string` | 列表 |
| `MetaOptional` | `[]string` | 列表 |

**关联方法**（3 个）：`Validate`, `Canonicalize`, `Copy`

### DispatchPayloadConfig

**定义位置**：[L6132](file:///d:/claude/nomad/nomad/structs/structs.go#L6132)

**中文说明**：DispatchPayloadConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type DispatchPayloadConfig struct {
	File string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `File` | `string` | 字符串 |

**关联方法**（2 个）：`Copy`, `Validate`

### TaskLifecycleConfig

**定义位置**：[L6164](file:///d:/claude/nomad/nomad/structs/structs.go#L6164)

**中文说明**：TaskLifecycleConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type TaskLifecycleConfig struct {
	Hook string
	Sidecar bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Hook` | `string` | 字符串 |
| `Sidecar` | `bool` | 布尔值 |

**关联方法**（2 个）：`Copy`, `Validate`

### JobScalingEvents

**定义位置**：[L6252](file:///d:/claude/nomad/nomad/structs/structs.go#L6252)

**中文说明**：JobScalingEvents 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobScalingEvents struct {
	Namespace string
	JobID string
	ScalingEvents map[string][]*ScalingEvent
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string` | 命名空间 |
| `JobID` | `string` | 字符串 |
| `ScalingEvents` | `map[string][]*ScalingEvent` | 映射表 |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（1 个）：`Copy`

### ScalingEvent

**定义位置**：[L6289](file:///d:/claude/nomad/nomad/structs/structs.go#L6289)

**中文说明**：ScalingEvent 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ScalingEvent struct {
	Time int64
	Count *int64
	PreviousCount int64
	Message string
	Error bool
	Meta map[string]interface{}
	EvalID *string
	CreateIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Time` | `int64` | 时间戳 |
| `Count` | `*int64` | 计数 |
| `PreviousCount` | `int64` | — |
| `Message` | `string` | 消息 |
| `Error` | `bool` | 错误信息 |
| `Meta` | `map[string]interface{}` | 元数据 |
| `EvalID` | `*string` | 字符串 |
| `CreateIndex` | `uint64` | 索引值（uint64） |

**关联方法**（1 个）：`Copy`

### ScalingEventRequest

**定义位置**：[L6330](file:///d:/claude/nomad/nomad/structs/structs.go#L6330)

**中文说明**：ScalingEventRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ScalingEventRequest struct {
	Namespace string
	JobID string
	TaskGroup string
	ScalingEvent *ScalingEvent
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string` | 命名空间 |
| `JobID` | `string` | 字符串 |
| `TaskGroup` | `string` | 字符串 |
| `ScalingEvent` | `*ScalingEvent` | — |

### ScalingPolicy

**定义位置**：[L6339](file:///d:/claude/nomad/nomad/structs/structs.go#L6339)

**中文说明**：ScalingPolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type ScalingPolicy struct {
	ID string
	Type string
	Target map[string]string
	Policy map[string]interface{}
	Min int64
	Max int64
	Enabled bool
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Type` | `string` | 类型 |
| `Target` | `map[string]string` | 映射表 |
| `Policy` | `map[string]interface{}` | 策略 |
| `Min` | `int64` | 最小值 |
| `Max` | `int64` | 最大值 |
| `Enabled` | `bool` | 是否启用 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（7 个）：`JobKey`, `Canonicalize`, `Copy`, `Validate`, `validateTargetHorizontal`, `Diff`, `Stub`

### ScalingPolicyListStub

**定义位置**：[L6532](file:///d:/claude/nomad/nomad/structs/structs.go#L6532)

**中文说明**：ScalingPolicyListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type ScalingPolicyListStub struct {
	ID string
	Enabled bool
	Type string
	Target map[string]string
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Enabled` | `bool` | 是否启用 |
| `Type` | `string` | 类型 |
| `Target` | `map[string]string` | 映射表 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### RestartPolicy

**定义位置**：[L6542](file:///d:/claude/nomad/nomad/structs/structs.go#L6542)

**中文说明**：RestartPolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type RestartPolicy struct {
	Attempts int
	Interval time.Duration
	Delay time.Duration
	Mode string
	RenderTemplates bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Attempts` | `int` | — |
| `Interval` | `time.Duration` | 时间间隔 |
| `Delay` | `time.Duration` | 延迟时间 |
| `Mode` | `string` | 字符串 |
| `RenderTemplates` | `bool` | 布尔值 |

**关联方法**（2 个）：`Copy`, `Validate`

### ReschedulePolicy

**定义位置**：[L6611](file:///d:/claude/nomad/nomad/structs/structs.go#L6611)

**中文说明**：ReschedulePolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type ReschedulePolicy struct {
	Attempts int
	Interval time.Duration
	Delay time.Duration
	DelayFunction string
	MaxDelay time.Duration
	Unlimited bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Attempts` | `int` | — |
| `Interval` | `time.Duration` | 时间间隔 |
| `Delay` | `time.Duration` | 延迟时间 |
| `DelayFunction` | `string` | 字符串 |
| `MaxDelay` | `time.Duration` | 时间间隔 |
| `Unlimited` | `bool` | 布尔值 |

**关联方法**（5 个）：`Copy`, `Enabled`, `Validate`, `validateDelayParams`, `viableAttempts`

### MigrateStrategy

**定义位置**：[L6821](file:///d:/claude/nomad/nomad/structs/structs.go#L6821)

**中文说明**：MigrateStrategy 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type MigrateStrategy struct {
	MaxParallel int
	HealthCheck string
	MinHealthyTime time.Duration
	HealthyDeadline time.Duration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MaxParallel` | `int` | — |
| `HealthCheck` | `string` | 字符串 |
| `MinHealthyTime` | `time.Duration` | 时间间隔 |
| `HealthyDeadline` | `time.Duration` | 时间间隔 |

**关联方法**（1 个）：`Validate`

### TaskGroup

**定义位置**：[L6877](file:///d:/claude/nomad/nomad/structs/structs.go#L6877)

**中文说明**：TaskGroup 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskGroup struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Count` | `int` | 计数 |
| `Update` | `*UpdateStrategy` | — |
| `Migrate` | `*MigrateStrategy` | — |
| `Constraints` | `[]*Constraint` | 列表 |
| `Scaling` | `*ScalingPolicy` | — |
| `RestartPolicy` | `*RestartPolicy` | — |
| `Disconnect` | `*DisconnectStrategy` | — |
| `Tasks` | `[]*Task` | 列表 |
| `EphemeralDisk` | `*EphemeralDisk` | — |
| `Meta` | `map[string]string` | 元数据 |
| `ReschedulePolicy` | `*ReschedulePolicy` | — |
| `Affinities` | `[]*Affinity` | 列表 |
| `Spreads` | `[]*Spread` | 列表 |
| `Networks` | `Networks` | — |
| `Consul` | `*Consul` | — |
| `Services` | `[]*Service` | 列表 |
| `Volumes` | `map[string]*VolumeRequest` | 映射表 |
| `ShutdownDelay` | `*time.Duration` | 时间间隔 |
| `MaxRunDuration` | `*time.Duration` | 时间间隔 |
| `StopAfterClientDisconnect` | `*time.Duration` | 时间间隔 |
| `MaxClientDisconnect` | `*time.Duration` | 时间间隔 |
| `PreventRescheduleOnLost` | `bool` | 布尔值 |

**关联方法**（20 个）：`Copy`, `Canonicalize`, `NomadServices`, `ConsulServices`, `filterServices`, `Validate`, `validateNetworks`, `validateServices`, `validateScriptChecksInGroupServices`, `validateScalingPolicy`, `Warnings`, `LookupTask`, `UsesConnect`, `UsesConnectGateway`, `GoString`, `Replace`, `GetDisconnectLostAfter`, `GetDisconnectStopTimeout`, `GetConstraints`, `SetConstraints`

### CheckRestart

**定义位置**：[L7751](file:///d:/claude/nomad/nomad/structs/structs.go#L7751)

**中文说明**：CheckRestart 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type CheckRestart struct {
	Limit int
	Grace time.Duration
	IgnoreWarnings bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Limit` | `int` | 限制 |
| `Grace` | `time.Duration` | 时间间隔 |
| `IgnoreWarnings` | `bool` | 布尔值 |

**关联方法**（3 个）：`Copy`, `Equal`, `Validate`

### LogConfig

**定义位置**：[L7811](file:///d:/claude/nomad/nomad/structs/structs.go#L7811)

**中文说明**：LogConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type LogConfig struct {
	MaxFiles int
	MaxFileSizeMB int
	Disabled bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MaxFiles` | `int` | — |
| `MaxFileSizeMB` | `int` | — |
| `Disabled` | `bool` | 是否禁用 |

**关联方法**（3 个）：`Equal`, `Copy`, `Validate`

### Task

**定义位置**：[L7880](file:///d:/claude/nomad/nomad/structs/structs.go#L7880)

**中文说明**：Task 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type Task struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Driver` | `string` | 字符串 |
| `User` | `string` | 字符串 |
| `Config` | `map[string]interface{}` | 配置 |
| `Env` | `map[string]string` | 映射表 |
| `Services` | `[]*Service` | 列表 |
| `Vault` | `*Vault` | — |
| `Secrets` | `[]*Secret` | 列表 |
| `Consul` | `*Consul` | — |
| `Templates` | `[]*Template` | 列表 |
| `Constraints` | `[]*Constraint` | 列表 |
| `Affinities` | `[]*Affinity` | 列表 |
| `Resources` | `*Resources` | — |
| `RestartPolicy` | `*RestartPolicy` | — |
| `DispatchPayload` | `*DispatchPayloadConfig` | — |
| `Lifecycle` | `*TaskLifecycleConfig` | — |
| `Meta` | `map[string]string` | 元数据 |
| `KillTimeout` | `time.Duration` | 时间间隔 |
| `LogConfig` | `*LogConfig` | — |
| `Artifacts` | `[]*TaskArtifact` | 列表 |
| `Leader` | `bool` | 布尔值 |
| `ShutdownDelay` | `time.Duration` | 时间间隔 |
| `VolumeMounts` | `[]*VolumeMount` | 列表 |
| `ScalingPolicies` | `[]*ScalingPolicy` | 列表 |
| `KillSignal` | `string` | 字符串 |
| `Kind` | `TaskKind` | 种类 |
| `CSIPluginConfig` | `*TaskCSIPluginConfig` | — |
| `Identity` | `*WorkloadIdentity` | — |
| `Identities` | `[]*WorkloadIdentity` | 列表 |
| `Actions` | `[]*Action` | 列表 |
| `Schedule` | `*TaskSchedule` | — |

**关联方法**（17 个）：`UsesCores`, `UsesConnect`, `UsesConnectSidecar`, `IsPrestart`, `IsMain`, `IsPoststart`, `IsPoststop`, `GetIdentity`, `GetAction`, `IdentityHandle`, `Copy`, `Canonicalize`, `GoString`, `Validate`, `Warnings`, `GetConstraints`, `SetConstraints`

### TaskKind

**定义位置**：[L8645](file:///d:/claude/nomad/nomad/structs/structs.go#L8645)

**中文说明**：TaskKind 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型定义**：`type TaskKind string`

**关联方法**（9 个）：`Name`, `Value`, `hasPrefix`, `IsConnectProxy`, `IsConnectNative`, `IsConnectIngress`, `IsConnectTerminating`, `IsConnectMesh`, `IsAnyConnectGateway`

### Template

**定义位置**：[L8788](file:///d:/claude/nomad/nomad/structs/structs.go#L8788)

**中文说明**：Template 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Template struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SourcePath` | `string` | 字符串 |
| `DestPath` | `string` | 字符串 |
| `EmbeddedTmpl` | `string` | 字符串 |
| `ChangeMode` | `string` | 字符串 |
| `ChangeSignal` | `string` | 字符串 |
| `ChangeScript` | `*ChangeScript` | — |
| `Once` | `bool` | 布尔值 |
| `Splay` | `time.Duration` | 时间间隔 |
| `Perms` | `string` | 字符串 |
| `Uid` | `*int` | — |
| `Gid` | `*int` | — |
| `LeftDelim` | `string` | 字符串 |
| `RightDelim` | `string` | 字符串 |
| `Envvars` | `bool` | 布尔值 |
| `VaultGrace` | `time.Duration` | 时间间隔 |
| `Wait` | `*WaitConfig` | — |
| `ErrMissingKey` | `bool` | 布尔值 |

**关联方法**（6 个）：`Equal`, `Copy`, `Canonicalize`, `Validate`, `Warnings`, `DiffID`

### ChangeScript

**定义位置**：[L9007](file:///d:/claude/nomad/nomad/structs/structs.go#L9007)

**中文说明**：ChangeScript 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ChangeScript struct {
	Command string
	Args []string
	Timeout time.Duration
	FailOnError bool
	RunOnFirstRender bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Command` | `string` | 字符串 |
| `Args` | `[]string` | 参数 |
| `Timeout` | `time.Duration` | 超时时间 |
| `FailOnError` | `bool` | 布尔值 |
| `RunOnFirstRender` | `bool` | 布尔值 |

**关联方法**（3 个）：`Equal`, `Copy`, `Validate`

### WaitConfig

**定义位置**：[L9071](file:///d:/claude/nomad/nomad/structs/structs.go#L9071)

**中文说明**：WaitConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type WaitConfig struct {
	Min *time.Duration
	Max *time.Duration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Min` | `*time.Duration` | 最小值 |
| `Max` | `*time.Duration` | 最大值 |

**关联方法**（3 个）：`Copy`, `Equal`, `Validate`

### TaskState

**定义位置**：[L9135](file:///d:/claude/nomad/nomad/structs/structs.go#L9135)

**中文说明**：TaskState 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskState struct {
	State string
	Failed bool
	Restarts uint64
	LastRestart time.Time
	StartedAt time.Time
	FinishedAt time.Time
	Events []*TaskEvent
	Paused TaskScheduleState
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `State` | `string` | 状态 |
| `Failed` | `bool` | 布尔值 |
| `Restarts` | `uint64` | 无符号 64 位整数 |
| `LastRestart` | `time.Time` | 时间点 |
| `StartedAt` | `time.Time` | 时间点 |
| `FinishedAt` | `time.Time` | 时间点 |
| `Events` | `[]*TaskEvent` | 列表 |
| `Paused` | `TaskScheduleState` | 是否已暂停 |

**关联方法**（4 个）：`Canonicalize`, `Copy`, `Successful`, `Equal`

### TaskEvent

**定义位置**：[L9353](file:///d:/claude/nomad/nomad/structs/structs.go#L9353)

**中文说明**：TaskEvent 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskEvent struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string` | 类型 |
| `Time` | `int64` | 时间戳 |
| `Message` | `string` | 消息 |
| `DisplayMessage` | `string` | 字符串 |
| `Details` | `map[string]string` | 映射表 |
| `FailsTask` | `bool` | 布尔值 |
| `RestartReason` | `string` | 字符串 |
| `SetupError` | `string` | 字符串 |
| `DriverError` | `string` | 字符串 |
| `ExitCode` | `int` | — |
| `Signal` | `int` | — |
| `KillTimeout` | `time.Duration` | 时间间隔 |
| `KillError` | `string` | 字符串 |
| `KillReason` | `string` | 字符串 |
| `StartDelay` | `int64` | — |
| `DownloadError` | `string` | 字符串 |
| `ValidationError` | `string` | 字符串 |
| `DiskLimit` | `int64` | — |
| `FailedSibling` | `string` | 字符串 |
| `VaultError` | `string` | 字符串 |
| `TaskSignalReason` | `string` | 字符串 |
| `TaskSignal` | `string` | 字符串 |
| `DriverMessage` | `string` | 字符串 |
| `GenericSource` | `string` | 字符串 |

**关联方法**（27 个）：`PopulateEventDisplayMessage`, `GoString`, `Equal`, `SetDisplayMessage`, `SetMessage`, `Copy`, `SetSetupError`, `SetFailsTask`, `SetDriverError`, `SetExitCode`, `SetSignal`, `SetSignalText`, `SetExitMessage`, `SetKillError`, `SetKillReason`, `SetRestartDelay`, `SetRestartReason`, `SetTaskSignalReason`, `SetTaskSignal`, `SetDownloadError`, `SetValidationError`, `SetKillTimeout`, `SetDiskLimit`, `SetFailedSibling`, `SetVaultRenewalError`, `SetDriverMessage`, `SetOOMKilled`

### TaskArtifact

**定义位置**：[L9773](file:///d:/claude/nomad/nomad/structs/structs.go#L9773)

**中文说明**：TaskArtifact 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskArtifact struct {
	GetterSource string
	GetterOptions map[string]string
	GetterHeaders map[string]string
	GetterMode string
	GetterInsecure bool
	RelativeDest string
	Chown bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `GetterSource` | `string` | 字符串 |
| `GetterOptions` | `map[string]string` | 映射表 |
| `GetterHeaders` | `map[string]string` | 映射表 |
| `GetterMode` | `string` | 字符串 |
| `GetterInsecure` | `bool` | 布尔值 |
| `RelativeDest` | `string` | 字符串 |
| `Chown` | `bool` | 布尔值 |

**关联方法**（7 个）：`Equal`, `Copy`, `GoString`, `DiffID`, `Hash`, `Validate`, `validateChecksum`

### Constraint

**定义位置**：[L9980](file:///d:/claude/nomad/nomad/structs/structs.go#L9980)

**中文说明**：Constraint 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Constraint struct {
	LTarget string
	RTarget string
	Operand string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `LTarget` | `string` | 字符串 |
| `RTarget` | `string` | 字符串 |
| `Operand` | `string` | 字符串 |

**关联方法**（5 个）：`Equal`, `Copy`, `String`, `Validate`, `DiffID`

### Constraints

**定义位置**：[L10082](file:///d:/claude/nomad/nomad/structs/structs.go#L10082)

**类型定义**：`type Constraints []*Constraint`

**关联方法**（1 个）：`Equal`

### Affinity

**定义位置**：[L10108](file:///d:/claude/nomad/nomad/structs/structs.go#L10108)

**中文说明**：Affinity 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Affinity struct {
	LTarget string
	RTarget string
	Operand string
	Weight int8
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `LTarget` | `string` | 字符串 |
| `RTarget` | `string` | 字符串 |
| `Operand` | `string` | 字符串 |
| `Weight` | `int8` | — |

**关联方法**（5 个）：`Equal`, `Copy`, `String`, `Validate`, `DiffID`

### Spread

**定义位置**：[L10204](file:///d:/claude/nomad/nomad/structs/structs.go#L10204)

**中文说明**：Spread 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Spread struct {
	Attribute string
	Weight int8
	SpreadTarget []*SpreadTarget
	str string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Attribute` | `string` | 字符串 |
| `Weight` | `int8` | — |
| `SpreadTarget` | `[]*SpreadTarget` | 列表 |
| `str` | `string` | 字符串 |

**关联方法**（4 个）：`Equal`, `Copy`, `String`, `Validate`

### Affinities

**定义位置**：[L10234](file:///d:/claude/nomad/nomad/structs/structs.go#L10234)

**类型定义**：`type Affinities []*Affinity`

**关联方法**（1 个）：`Equal`

### SpreadTarget

**定义位置**：[L10309](file:///d:/claude/nomad/nomad/structs/structs.go#L10309)

**中文说明**：SpreadTarget 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type SpreadTarget struct {
	Value string
	Percent uint8
	str string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Value` | `string` | 值 |
| `Percent` | `uint8` | — |
| `str` | `string` | 字符串 |

**关联方法**（3 个）：`Copy`, `String`, `Equal`

### EphemeralDisk

**定义位置**：[L10352](file:///d:/claude/nomad/nomad/structs/structs.go#L10352)

**中文说明**：EphemeralDisk 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type EphemeralDisk struct {
	Sticky bool
	SizeMB int
	Migrate bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Sticky` | `bool` | 布尔值 |
| `SizeMB` | `int` | — |
| `Migrate` | `bool` | 布尔值 |

**关联方法**（3 个）：`Equal`, `Validate`, `Copy`

### Vault

**定义位置**：[L10419](file:///d:/claude/nomad/nomad/structs/structs.go#L10419)

**中文说明**：Vault 与 Vault 集成相关，用于密钥管理和动态凭据。

**类型**：struct

```go
type Vault struct {
	Role string
	Namespace string
	Cluster string
	Env bool
	DisableFile bool
	ChangeMode string
	ChangeSignal string
	AllowTokenExpiration bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Role` | `string` | 角色 |
| `Namespace` | `string` | 命名空间 |
| `Cluster` | `string` | 字符串 |
| `Env` | `bool` | 布尔值 |
| `DisableFile` | `bool` | 布尔值 |
| `ChangeMode` | `string` | 字符串 |
| `ChangeSignal` | `string` | 字符串 |
| `AllowTokenExpiration` | `bool` | 布尔值 |

**关联方法**（5 个）：`IdentityName`, `Equal`, `Copy`, `Canonicalize`, `Validate`

### Secret

**定义位置**：[L10528](file:///d:/claude/nomad/nomad/structs/structs.go#L10528)

**中文说明**：Secret 与密钥（Secret）相关，管理敏感数据。

**类型**：struct

```go
type Secret struct {
	Name string
	Provider string
	Path string
	Config map[string]any
	Env map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Provider` | `string` | 字符串 |
| `Path` | `string` | 路径 |
| `Config` | `map[string]any` | 配置 |
| `Env` | `map[string]string` | 映射表 |

**关联方法**（4 个）：`Equal`, `Copy`, `Validate`, `Canonicalize`

### RescheduleTracker

**定义位置**：[L10625](file:///d:/claude/nomad/nomad/structs/structs.go#L10625)

**中文说明**：RescheduleTracker 是一个跟踪器，记录和跟踪特定对象的状态信息。

**类型**：struct

```go
type RescheduleTracker struct {
	Events []*RescheduleEvent
	LastReschedule RescheduleTrackerAnnotation
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Events` | `[]*RescheduleEvent` | 列表 |
| `LastReschedule` | `RescheduleTrackerAnnotation` | — |

**关联方法**（3 个）：`Copy`, `RescheduleEligible`, `rescheduleInfo`

### RescheduleTrackerAnnotation

**定义位置**：[L10633](file:///d:/claude/nomad/nomad/structs/structs.go#L10633)

**类型定义**：`type RescheduleTrackerAnnotation string`

### RescheduleEvent

**定义位置**：[L10695](file:///d:/claude/nomad/nomad/structs/structs.go#L10695)

**中文说明**：RescheduleEvent 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type RescheduleEvent struct {
	RescheduleTime int64
	PrevAllocID string
	PrevNodeID string
	Delay time.Duration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `RescheduleTime` | `int64` | — |
| `PrevAllocID` | `string` | 字符串 |
| `PrevNodeID` | `string` | 字符串 |
| `Delay` | `time.Duration` | 延迟时间 |

**关联方法**（1 个）：`Copy`

### NodeScoreMeta

**定义位置**：[L10727](file:///d:/claude/nomad/nomad/structs/structs.go#L10727)

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

**关联方法**（4 个）：`Copy`, `String`, `Score`, `Data`

### DesiredUpdates

**定义位置**：[L10756](file:///d:/claude/nomad/nomad/structs/structs.go#L10756)

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

**关联方法**（1 个）：`GoString`

### KeyringResponse

**定义位置**：[L10810](file:///d:/claude/nomad/nomad/structs/structs.go#L10810)

**中文说明**：KeyringResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type KeyringResponse struct {
	Messages map[string]string
	Keys map[string]int
	NumNodes int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Messages` | `map[string]string` | 映射表 |
| `Keys` | `map[string]int` | 映射表 |
| `NumNodes` | `int` | — |

### KeyringRequest

**定义位置**：[L10817](file:///d:/claude/nomad/nomad/structs/structs.go#L10817)

**中文说明**：KeyringRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type KeyringRequest struct {
	Key string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Key` | `string` | 键 |

### RecoverableError

**定义位置**：[L10823](file:///d:/claude/nomad/nomad/structs/structs.go#L10823)

**中文说明**：RecoverableError 是一个错误类型，描述特定的错误情况。

**类型**：struct

```go
type RecoverableError struct {
	Err string
	Recoverable bool
	wrapped error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Err` | `string` | 错误信息 |
| `Recoverable` | `bool` | 布尔值 |
| `wrapped` | `error` | 错误信息 |

**关联方法**（4 个）：`Error`, `IsRecoverable`, `IsUnrecoverable`, `Unwrap`

### Recoverable

**定义位置**：[L10868](file:///d:/claude/nomad/nomad/structs/structs.go#L10868)

**中文说明**：Recoverable 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type Recoverable interface {
	error error
	IsRecoverable func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `error` | `error` | — |
| `IsRecoverable` | `func(...)` | — |

### WrappedServerError

**定义位置**：[L10884](file:///d:/claude/nomad/nomad/structs/structs.go#L10884)

**中文说明**：WrappedServerError 是一个错误类型，描述特定的错误情况。

**类型**：struct

```go
type WrappedServerError struct {
	Err error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Err` | `error` | 错误信息 |

**关联方法**（3 个）：`IsRecoverable`, `Error`, `IsServerSide`

### ServerSideError

**定义位置**：[L10909](file:///d:/claude/nomad/nomad/structs/structs.go#L10909)

**中文说明**：ServerSideError 是一个错误类型，描述特定的错误情况。

**类型**：interface

```go
type ServerSideError interface {
	error error
	IsServerSide func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `error` | `error` | — |
| `IsServerSide` | `func(...)` | — |

### RpcError

**定义位置**：[L10924](file:///d:/claude/nomad/nomad/structs/structs.go#L10924)

**中文说明**：RpcError 是一个错误类型，描述特定的错误情况。

**类型**：struct

```go
type RpcError struct {
	Message string
	Code *int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Message` | `string` | 消息 |
| `Code` | `*int64` | — |

**关联方法**（1 个）：`Error`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `NodeRegisterRequestType` | `MessageType` | `0` | — |
| `NodeDeregisterRequestType` | `MessageType` | `1` | — |
| `NodeUpdateStatusRequestType` | `MessageType` | `2` | — |
| `NodeUpdateDrainRequestType` | `MessageType` | `3` | — |
| `JobRegisterRequestType` | `MessageType` | `4` | — |
| `JobDeregisterRequestType` | `MessageType` | `5` | — |
| `EvalUpdateRequestType` | `MessageType` | `6` | — |
| `EvalDeleteRequestType` | `MessageType` | `7` | — |
| `AllocUpdateRequestType` | `MessageType` | `8` | — |
| `AllocClientUpdateRequestType` | `MessageType` | `9` | — |
| `ReconcileJobSummariesRequestType` | `MessageType` | `10` | — |
| `VaultAccessorRegisterRequestType` | `MessageType` | `11` | — |
| `VaultAccessorDeregisterRequestType` | `MessageType` | `12` | — |
| `ApplyPlanResultsRequestType` | `MessageType` | `13` | — |
| `DeploymentStatusUpdateRequestType` | `MessageType` | `14` | — |
| `DeploymentPromoteRequestType` | `MessageType` | `15` | — |
| `DeploymentAllocHealthRequestType` | `MessageType` | `16` | — |
| `DeploymentDeleteRequestType` | `MessageType` | `17` | — |
| `JobStabilityRequestType` | `MessageType` | `18` | — |
| `ACLPolicyUpsertRequestType` | `MessageType` | `19` | — |
| `ACLPolicyDeleteRequestType` | `MessageType` | `20` | — |
| `ACLTokenUpsertRequestType` | `MessageType` | `21` | — |
| `ACLTokenDeleteRequestType` | `MessageType` | `22` | — |
| `ACLTokenBootstrapRequestType` | `MessageType` | `23` | — |
| `AutopilotRequestType` | `MessageType` | `24` | — |
| `UpsertNodeEventsType` | `MessageType` | `25` | — |
| `JobBatchDeregisterRequestType` | `MessageType` | `26` | — |
| `AllocUpdateDesiredTransitionRequestType` | `MessageType` | `27` | — |
| `NodeUpdateEligibilityRequestType` | `MessageType` | `28` | — |
| `BatchNodeUpdateDrainRequestType` | `MessageType` | `29` | — |
| `SchedulerConfigRequestType` | `MessageType` | `30` | — |
| `NodeBatchDeregisterRequestType` | `MessageType` | `31` | — |
| `ClusterMetadataRequestType` | `MessageType` | `32` | — |
| `ServiceIdentityAccessorRegisterRequestType` | `MessageType` | `33` | — |
| `ServiceIdentityAccessorDeregisterRequestType` | `MessageType` | `34` | — |
| `CSIVolumeRegisterRequestType` | `MessageType` | `35` | — |
| `CSIVolumeDeregisterRequestType` | `MessageType` | `36` | — |
| `CSIVolumeClaimRequestType` | `MessageType` | `37` | — |
| `ScalingEventRegisterRequestType` | `MessageType` | `38` | — |
| `CSIVolumeClaimBatchRequestType` | `MessageType` | `39` | — |
| `CSIPluginDeleteRequestType` | `MessageType` | `40` | — |
| `EventSinkUpsertRequestType` | `MessageType` | `41` | — |
| `EventSinkDeleteRequestType` | `MessageType` | `42` | — |
| `BatchEventSinkUpdateProgressType` | `MessageType` | `43` | — |
| `OneTimeTokenUpsertRequestType` | `MessageType` | `44` | — |
| `OneTimeTokenDeleteRequestType` | `MessageType` | `45` | — |
| `OneTimeTokenExpireRequestType` | `MessageType` | `46` | — |
| `ServiceRegistrationUpsertRequestType` | `MessageType` | `47` | — |
| `ServiceRegistrationDeleteByIDRequestType` | `MessageType` | `48` | — |
| `ServiceRegistrationDeleteByNodeIDRequestType` | `MessageType` | `49` | — |
| `VarApplyStateRequestType` | `MessageType` | `50` | — |
| `RootKeyMetaUpsertRequestType` | `MessageType` | `51` | — |
| `WrappedRootKeysDeleteRequestType` | `MessageType` | `52` | — |
| `ACLRolesUpsertRequestType` | `MessageType` | `53` | — |
| `ACLRolesDeleteByIDRequestType` | `MessageType` | `54` | — |
| `ACLAuthMethodsUpsertRequestType` | `MessageType` | `55` | — |
| `ACLAuthMethodsDeleteRequestType` | `MessageType` | `56` | — |
| `ACLBindingRulesUpsertRequestType` | `MessageType` | `57` | — |
| `ACLBindingRulesDeleteRequestType` | `MessageType` | `58` | — |
| `NodePoolUpsertRequestType` | `MessageType` | `59` | — |
| `NodePoolDeleteRequestType` | `MessageType` | `60` | — |
| `JobVersionTagRequestType` | `MessageType` | `61` | — |
| `WrappedRootKeysUpsertRequestType` | `MessageType` | `62` | — |
| `NamespaceUpsertRequestType` | `MessageType` | `64` | — |
| `NamespaceDeleteRequestType` | `MessageType` | `65` | — |
| `HostVolumeRegisterRequestType` | `MessageType` | `75` | — |
| `HostVolumeDeleteRequestType` | `MessageType` | `76` | — |
| `TaskGroupHostVolumeClaimDeleteRequestType` | `MessageType` | `77` | — |
| `SystemInitializationType` | `MessageType` | `127` | — |
| `IgnoreUnknownTypeFlag` | `MessageType` | `128` | — |
| `MsgTypeTestSetup` | `MessageType` | `IgnoreUnknownTypeFlag` | — |
| `GetterModeAny` | `—` | `"any"` | — |
| `GetterModeFile` | `—` | `"file"` | — |
| `GetterModeDir` | `—` | `"dir"` | — |
| `maxPolicyDescriptionLength` | `—` | `256` | — |
| `maxTokenNameLength` | `—` | `256` | — |
| `ACLClientToken` | `—` | `"client"` | — |
| `ACLManagementToken` | `—` | `"management"` | — |
| `DefaultNamespace` | `—` | `"default"` | — |
| `DefaultNamespaceDescription` | `—` | `"Default shared namespace"` | — |
| `AllNamespacesSentinel` | `—` | `"*"` | — |
| `maxNamespaceDescriptionLength` | `—` | `256` | — |
| `JitterFraction` | `—` | `16` | — |
| `MaxRetainedNodeEvents` | `—` | `10` | — |
| `MaxRetainedNodeScores` | `—` | `5` | — |
| `NormScorerName` | `—` | `"normalized-score"` | — |
| `MaxBlockingRPCQueryTime` | `—` | `300 * time.Second` | — |
| `DefaultBlockingRPCQueryTime` | `—` | `300 * time.Second` | — |
| `RateMetricRead` | `—` | `"read"` | — |
| `RateMetricList` | `—` | `"list"` | — |
| `RateMetricWrite` | `—` | `"write"` | — |
| `SecretProviderVault` | `—` | `"vault"` | — |
| `NodeEventSubsystemDrain` | `—` | `"Drain"` | — |
| `NodeEventSubsystemDriver` | `—` | `"Driver"` | — |
| `NodeEventSubsystemHeartbeat` | `—` | `"Heartbeat"` | — |
| `NodeEventSubsystemCluster` | `—` | `"Cluster"` | — |
| `NodeEventSubsystemScheduler` | `—` | `"Scheduler"` | — |
| `NodeEventSubsystemStorage` | `—` | `"Storage"` | — |
| `NodeStatusInit` | `—` | `"initializing"` | — |
| `NodeStatusReady` | `—` | `"ready"` | — |
| `NodeStatusDown` | `—` | `"down"` | — |
| `NodeStatusDisconnected` | `—` | `"disconnected"` | — |
| `NodeSchedulingEligible` | `—` | `"eligible"` | — |
| `NodeSchedulingIneligible` | `—` | `"ineligible"` | — |
| `DrainStatusDraining` | `DrainStatus` | `"draining"` | — |
| `DrainStatusComplete` | `DrainStatus` | `"complete"` | — |
| `DrainStatusCanceled` | `DrainStatus` | `"canceled"` | — |
| `BytesInMegabyte` | `—` | `1024 * 1024` | — |
| `MemoryNoLimit` | `—` | `-1` | — |
| `NodeNetworkAF_IPv4` | `NodeNetworkAF` | `"ipv4"` | — |
| `NodeNetworkAF_IPv6` | `NodeNetworkAF` | `"ipv6"` | — |
| `JobTypeCore` | `—` | `"_core"` | — |
| `JobTypeService` | `—` | `"service"` | — |
| `JobTypeBatch` | `—` | `"batch"` | — |
| `JobTypeSystem` | `—` | `"system"` | — |
| `JobTypeSysBatch` | `—` | `"sysbatch"` | — |
| `JobStatusPending` | `—` | `"pending"` | — |
| `JobStatusRunning` | `—` | `"running"` | — |
| `JobStatusDead` | `—` | `"dead"` | — |
| `JobMinPriority` | `—` | `1` | — |
| `JobDefaultPriority` | `—` | `50` | — |
| `JobDefaultMaxPriority` | `—` | `100` | — |
| `JobMaxPriority` | `—` | `math.MaxInt16 - 1` | — |
| `JobDefaultMaxCount` | `—` | `50000` | — |
| `CoreJobPriority` | `—` | `math.MaxInt16` | — |
| `JobDefaultTrackedVersions` | `—` | `6` | — |
| `JobTrackedScalingEvents` | `—` | `20` | — |
| `UpdateStrategyHealthCheck_Checks` | `—` | `"checks"` | — |
| `UpdateStrategyHealthCheck_TaskStates` | `—` | `"task_states"` | — |
| `UpdateStrategyHealthCheck_Manual` | `—` | `"manual"` | — |
| `PeriodicSpecCron` | `—` | `"cron"` | — |
| `PeriodicSpecTest` | `—` | `"_internal_test"` | — |
| `PeriodicLaunchSuffix` | `—` | `"/periodic-"` | — |
| `DispatchPayloadForbidden` | `—` | `"forbidden"` | — |
| `DispatchPayloadOptional` | `—` | `"optional"` | — |
| `DispatchPayloadRequired` | `—` | `"required"` | — |
| `DispatchLaunchSuffix` | `—` | `"/dispatch-"` | — |
| `TaskLifecycleHookPrestart` | `—` | `"prestart"` | — |
| `TaskLifecycleHookPoststart` | `—` | `"poststart"` | — |
| `TaskLifecycleHookPoststop` | `—` | `"poststop"` | — |
| `RestartPolicyModeDelay` | `—` | `"delay"` | — |
| `RestartPolicyModeFail` | `—` | `"fail"` | — |
| `RestartPolicyMinInterval` | `—` | `5 * time.Second` | — |
| `ReasonWithinPolicy` | `—` | `"Restart within policy"` | — |
| `ScalingTargetNamespace` | `—` | `"Namespace"` | — |
| `ScalingTargetJob` | `—` | `"Job"` | — |
| `ScalingTargetGroup` | `—` | `"Group"` | — |
| `ScalingTargetTask` | `—` | `"Task"` | — |
| `ScalingPolicyTypeHorizontal` | `—` | `"horizontal"` | — |
| `ReschedulePolicyMinInterval` | `—` | `15 * time.Second` | — |
| `ReschedulePolicyMinDelay` | `—` | `5 * time.Second` | — |
| `MigrateStrategyHealthChecks` | `—` | `"checks"` | — |
| `MigrateStrategyHealthStates` | `—` | `"task_states"` | — |
| `DefaultKillTimeout` | `—` | `5 * time.Second` | — |
| `ConnectProxyPrefix` | `—` | `"connect-proxy"` | — |
| `ConnectNativePrefix` | `—` | `"connect-native"` | — |
| `ConnectIngressPrefix` | `—` | `"connect-ingress"` | — |
| `ConnectTerminatingPrefix` | `—` | `"connect-terminating"` | — |
| `ConnectMeshPrefix` | `—` | `"connect-mesh"` | — |
| `TemplateChangeModeNoop` | `—` | `"noop"` | — |
| `TemplateChangeModeSignal` | `—` | `"signal"` | — |
| `TemplateChangeModeRestart` | `—` | `"restart"` | — |
| `TemplateChangeModeScript` | `—` | `"script"` | — |
| `TaskStatePending` | `—` | `"pending"` | — |
| `TaskStateRunning` | `—` | `"running"` | — |
| `TaskStateDead` | `—` | `"dead"` | — |
| `TaskSetupFailure` | `—` | `"Setup Failure"` | — |
| `TaskDriverFailure` | `—` | `"Driver Failure"` | — |
| `TaskReceived` | `—` | `"Received"` | — |
| `TaskFailedValidation` | `—` | `"Failed Validation"` | — |
| `TaskStarted` | `—` | `"Started"` | — |
| `TaskPausing` | `—` | `"Pausing"` | — |
| `TaskTerminated` | `—` | `"Terminated"` | — |
| `TaskKilling` | `—` | `"Killing"` | — |
| `TaskKilled` | `—` | `"Killed"` | — |
| `TaskRestarting` | `—` | `"Restarting"` | — |
| `TaskNotRestarting` | `—` | `"Not Restarting"` | — |
| `TaskRestartSignal` | `—` | `"Restart Signaled"` | — |
| `TaskSignaling` | `—` | `"Signaling"` | — |
| `TaskDownloadingArtifacts` | `—` | `"Downloading Artifacts"` | — |
| `TaskArtifactDownloadFailed` | `—` | `"Failed Artifact Download"` | — |
| `TaskBuildingTaskDir` | `—` | `"Building Task Directory"` | — |
| `TaskSetup` | `—` | `"Task Setup"` | — |
| `TaskDiskExceeded` | `—` | `"Disk Resources Exceeded"` | — |
| `TaskSiblingFailed` | `—` | `"Sibling Task Failed"` | — |
| `TaskDriverMessage` | `—` | `"Driver"` | — |
| `TaskLeaderDead` | `—` | `"Leader Task Dead"` | — |
| `TaskMainDead` | `—` | `"Main Tasks Dead"` | — |
| `TaskHookFailed` | `—` | `"Task hook failed"` | — |
| `TaskHookMessage` | `—` | `"Task hook message"` | — |
| `TaskRestoreFailed` | `—` | `"Failed Restoring Task"` | — |
| `TaskPluginUnhealthy` | `—` | `"Plugin became unhealthy"` | — |
| `TaskPluginHealthy` | `—` | `"Plugin became healthy"` | — |
| `TaskClientReconnected` | `—` | `"Reconnected"` | — |
| `TaskWaitingShuttingDownDelay` | `—` | `"Waiting for shutdown delay"` | — |
| `TaskSkippingShutdownDelay` | `—` | `"Skipping shutdown delay"` | — |
| `TaskRunning` | `—` | `"Running"` | — |
| `ConstraintDistinctProperty` | `—` | `"distinct_property"` | — |
| `ConstraintDistinctHosts` | `—` | `"distinct_hosts"` | — |
| `ConstraintRegex` | `—` | `"regexp"` | — |
| `ConstraintVersion` | `—` | `"version"` | — |
| `ConstraintSemver` | `—` | `"semver"` | — |
| `ConstraintSetContains` | `—` | `"set_contains"` | — |
| `ConstraintSetContainsAll` | `—` | `"set_contains_all"` | — |
| `ConstraintSetContainsAny` | `—` | `"set_contains_any"` | — |
| `ConstraintAttributeIsSet` | `—` | `"is_set"` | — |
| `ConstraintAttributeIsNotSet` | `—` | `"is_not_set"` | — |
| `VaultChangeModeNoop` | `—` | `"noop"` | — |
| `VaultChangeModeSignal` | `—` | `"signal"` | — |
| `VaultChangeModeRestart` | `—` | `"restart"` | — |
| `LastRescheduleSuccess` | `RescheduleTrackerAnnotation` | `"ok"` | — |
| `LastRescheduleFailedToPlace` | `RescheduleTrackerAnnotation` | `"no placement"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ValidPolicyName` | `—` | `regexp.MustCompile("^[a-zA-Z0-9-]{1,128}$")` | — |
| `b32` | `—` | `base32.NewEncoding(strings.ToLower("abcdefghijklmnopqrstu...` | — |
| `validNamespaceName` | `—` | `regexp.MustCompile("^[a-zA-Z0-9-]{1,128}$")` | — |
| `validSecretName` | `—` | `regexp.MustCompile("^[a-zA-Z0-9_]{1,128}$")` | — |
| `DefaultUpdateStrategy` | `—` | `&UpdateStrategy{...}` | — |
| `DefaultServiceJobRestartPolicy` | `—` | `RestartPolicy{...}` | — |
| `DefaultBatchJobRestartPolicy` | `—` | `RestartPolicy{...}` | — |
| `DefaultServiceJobReschedulePolicy` | `—` | `ReschedulePolicy{...}` | — |
| `DefaultBatchJobReschedulePolicy` | `—` | `ReschedulePolicy{...}` | — |
| `RescheduleDelayFunctions` | `—` | `[...<nil>]string{...}` | — |
| `TemplateChangeModeInvalidError` | `—` | `errors.New("Invalid change mode. Must be one of the follo...` | — |
| `VaultUnrecoverableError` | `—` | `regexp.MustCompile(`Code:\s+40(0\|3\|4)`)` | — |
| `MsgpackHandle` | `—` | `*ast.FuncLit()` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewNamespacedID` | - | `id string, ns string` | `NamespacedID` | [L239](file:///d:/claude/nomad/nomad/structs/structs.go#L239) |
| `String` | `n *NamespacedID` | `` | `string` | [L246](file:///d:/claude/nomad/nomad/structs/structs.go#L246) |
| `IsForwarded` | `i *InternalRpcInfo` | `` | `bool` | [L272](file:///d:/claude/nomad/nomad/structs/structs.go#L272) |
| `SetForwarded` | `i *InternalRpcInfo` | `` | `` | [L277](file:///d:/claude/nomad/nomad/structs/structs.go#L277) |
| `TimeToBlock` | `q *QueryOptions` | `` | `time.Duration` | [L338](file:///d:/claude/nomad/nomad/structs/structs.go#L338) |
| `SetTimeToBlock` | `q *QueryOptions` | `t time.Duration` | `` | [L350](file:///d:/claude/nomad/nomad/structs/structs.go#L350) |
| `RequestRegion` | `q *QueryOptions` | `` | `string` | [L354](file:///d:/claude/nomad/nomad/structs/structs.go#L354) |
| `RequestNamespace` | `q *QueryOptions` | `` | `string` | [L363](file:///d:/claude/nomad/nomad/structs/structs.go#L363) |
| `IsRead` | `q *QueryOptions` | `` | `bool` | [L371](file:///d:/claude/nomad/nomad/structs/structs.go#L371) |
| `AllowStaleRead` | `q *QueryOptions` | `` | `bool` | [L375](file:///d:/claude/nomad/nomad/structs/structs.go#L375) |
| `GetAuthToken` | `q *QueryOptions` | `` | `string` | [L379](file:///d:/claude/nomad/nomad/structs/structs.go#L379) |
| `SetIdentity` | `q *QueryOptions` | `identity *AuthenticatedIdentity` | `` | [L383](file:///d:/claude/nomad/nomad/structs/structs.go#L383) |
| `GetIdentity` | `q *QueryOptions` | `` | `*AuthenticatedIdentity` | [L387](file:///d:/claude/nomad/nomad/structs/structs.go#L387) |
| `TimeToBlock` | `w *WriteRequest` | `` | `time.Duration` | [L456](file:///d:/claude/nomad/nomad/structs/structs.go#L456) |
| `SetTimeToBlock` | `w *WriteRequest` | `_ time.Duration` | `` | [L460](file:///d:/claude/nomad/nomad/structs/structs.go#L460) |
| `RequestRegion` | `w *WriteRequest` | `` | `string` | [L463](file:///d:/claude/nomad/nomad/structs/structs.go#L463) |
| `RequestNamespace` | `w *WriteRequest` | `` | `string` | [L473](file:///d:/claude/nomad/nomad/structs/structs.go#L473) |
| `IsRead` | `w *WriteRequest` | `` | `bool` | [L481](file:///d:/claude/nomad/nomad/structs/structs.go#L481) |
| `AllowStaleRead` | `w *WriteRequest` | `` | `bool` | [L485](file:///d:/claude/nomad/nomad/structs/structs.go#L485) |
| `GetAuthToken` | `w *WriteRequest` | `` | `string` | [L489](file:///d:/claude/nomad/nomad/structs/structs.go#L489) |
| `SetIdentity` | `w *WriteRequest` | `identity *AuthenticatedIdentity` | `` | [L493](file:///d:/claude/nomad/nomad/structs/structs.go#L493) |
| `GetIdentity` | `w *WriteRequest` | `` | `*AuthenticatedIdentity` | [L497](file:///d:/claude/nomad/nomad/structs/structs.go#L497) |
| `GetACLToken` | `ai *AuthenticatedIdentity` | `` | `*ACLToken` | [L531](file:///d:/claude/nomad/nomad/structs/structs.go#L531) |
| `GetClaims` | `ai *AuthenticatedIdentity` | `` | `*IdentityClaims` | [L538](file:///d:/claude/nomad/nomad/structs/structs.go#L538) |
| `String` | `ai *AuthenticatedIdentity` | `` | `string` | [L545](file:///d:/claude/nomad/nomad/structs/structs.go#L545) |
| `IsExpired` | `ai *AuthenticatedIdentity` | `now time.Time` | `bool` | [L567](file:///d:/claude/nomad/nomad/structs/structs.go#L567) |
| `Validate` | `r *JobScaleRequest` | `` | `error` | [L878](file:///d:/claude/nomad/nomad/structs/structs.go#L878) |
| `ShouldBeFiltered` | `req *EvalListRequest` | `e *Evaluation` | `bool` | [L1040](file:///d:/claude/nomad/nomad/structs/structs.go#L1040) |
| `GetWaitIndex` | `e *EvalDequeueResponse` | `` | `uint64` | [L1679](file:///d:/claude/nomad/nomad/structs/structs.go#L1679) |
| `String` | `ne *NodeEvent` | `` | `string` | [L1810](file:///d:/claude/nomad/nomad/structs/structs.go#L1810) |
| `Copy` | `ne *NodeEvent` | `` | `*NodeEvent` | [L1819](file:///d:/claude/nomad/nomad/structs/structs.go#L1819) |
| `NewNodeEvent` | - | `` | `*NodeEvent` | [L1828](file:///d:/claude/nomad/nomad/structs/structs.go#L1828) |
| `SetMessage` | `ne *NodeEvent` | `msg string` | `*NodeEvent` | [L1833](file:///d:/claude/nomad/nomad/structs/structs.go#L1833) |
| `SetSubsystem` | `ne *NodeEvent` | `sys string` | `*NodeEvent` | [L1839](file:///d:/claude/nomad/nomad/structs/structs.go#L1839) |
| `SetTimestamp` | `ne *NodeEvent` | `ts time.Time` | `*NodeEvent` | [L1845](file:///d:/claude/nomad/nomad/structs/structs.go#L1845) |
| `AddDetail` | `ne *NodeEvent` | `k string, v string` | `*NodeEvent` | [L1851](file:///d:/claude/nomad/nomad/structs/structs.go#L1851) |
| `ShouldDrainNode` | - | `status string` | `bool` | [L1868](file:///d:/claude/nomad/nomad/structs/structs.go#L1868) |
| `ValidNodeStatus` | - | `status string` | `bool` | [L1880](file:///d:/claude/nomad/nomad/structs/structs.go#L1880) |
| `Copy` | `d *DrainStrategy` | `` | `*DrainStrategy` | [L1921](file:///d:/claude/nomad/nomad/structs/structs.go#L1921) |
| `DeadlineTime` | `d *DrainStrategy` | `` | `infinite bool, deadline time.Time` | [L1934](file:///d:/claude/nomad/nomad/structs/structs.go#L1934) |
| `Equal` | `d *DrainStrategy` | `o *DrainStrategy` | `bool` | [L1953](file:///d:/claude/nomad/nomad/structs/structs.go#L1953) |
| `Copy` | `m *DrainMetadata` | `` | `*DrainMetadata` | [L2003](file:///d:/claude/nomad/nomad/structs/structs.go#L2003) |
| `GetID` | `n *Node` | `` | `string` | [L2145](file:///d:/claude/nomad/nomad/structs/structs.go#L2145) |
| `Sanitize` | `n *Node` | `` | `*Node` | [L2154](file:///d:/claude/nomad/nomad/structs/structs.go#L2154) |
| `Ready` | `n *Node` | `` | `bool` | [L2167](file:///d:/claude/nomad/nomad/structs/structs.go#L2167) |
| `Canonicalize` | `n *Node` | `` | `` | [L2171](file:///d:/claude/nomad/nomad/structs/structs.go#L2171) |
| `Copy` | `n *Node` | `` | `*Node` | [L2226](file:///d:/claude/nomad/nomad/structs/structs.go#L2226) |
| `UnresponsiveStatus` | `n *Node` | `` | `bool` | [L2249](file:///d:/claude/nomad/nomad/structs/structs.go#L2249) |
| `TerminalStatus` | `n *Node` | `` | `bool` | [L2260](file:///d:/claude/nomad/nomad/structs/structs.go#L2260) |
| `IsInAnyDC` | `n *Node` | `datacenters []string` | `bool` | [L2269](file:///d:/claude/nomad/nomad/structs/structs.go#L2269) |
| `IsInPool` | `n *Node` | `pool string` | `bool` | [L2280](file:///d:/claude/nomad/nomad/structs/structs.go#L2280) |
| `HasEvent` | `n *Node` | `msg string` | `bool` | [L2285](file:///d:/claude/nomad/nomad/structs/structs.go#L2285) |
| `Stub` | `n *Node` | `fields *NodeStubFields` | `*NodeListStub` | [L2295](file:///d:/claude/nomad/nomad/structs/structs.go#L2295) |
| `DefaultResources` | - | `` | `*Resources` | [L2387](file:///d:/claude/nomad/nomad/structs/structs.go#L2387) |
| `MinResources` | - | `` | `*Resources` | [L2400](file:///d:/claude/nomad/nomad/structs/structs.go#L2400) |
| `DiskInBytes` | `r *Resources` | `` | `int64` | [L2409](file:///d:/claude/nomad/nomad/structs/structs.go#L2409) |
| `Validate` | `r *Resources` | `` | `error` | [L2419](file:///d:/claude/nomad/nomad/structs/structs.go#L2419) |
| `Merge` | `r *Resources` | `other *Resources` | `` | [L2476](file:///d:/claude/nomad/nomad/structs/structs.go#L2476) |
| `Equal` | `r *Resources` | `o *Resources` | `bool` | [L2506](file:///d:/claude/nomad/nomad/structs/structs.go#L2506) |
| `Copy` | `d *ResourceDevices` | `` | `ResourceDevices` | [L2532](file:///d:/claude/nomad/nomad/structs/structs.go#L2532) |
| `Equal` | `d *ResourceDevices` | `o *ResourceDevices` | `bool` | [L2546](file:///d:/claude/nomad/nomad/structs/structs.go#L2546) |
| `Canonicalize` | `r *Resources` | `` | `` | [L2572](file:///d:/claude/nomad/nomad/structs/structs.go#L2572) |
| `MeetsMinResources` | `r *Resources` | `` | `error` | [L2593](file:///d:/claude/nomad/nomad/structs/structs.go#L2593) |
| `Copy` | `r *Resources` | `` | `*Resources` | [L2606](file:///d:/claude/nomad/nomad/structs/structs.go#L2606) |
| `NetIndex` | `r *Resources` | `n *NetworkResource` | `int` | [L2626](file:///d:/claude/nomad/nomad/structs/structs.go#L2626) |
| `Add` | `r *Resources` | `delta *Resources` | `` | [L2633](file:///d:/claude/nomad/nomad/structs/structs.go#L2633) |
| `GoString` | `r *Resources` | `` | `string` | [L2678](file:///d:/claude/nomad/nomad/structs/structs.go#L2678) |
| `Equal` | `n *NodeNetworkResource` | `o *NodeNetworkResource` | `bool` | [L2694](file:///d:/claude/nomad/nomad/structs/structs.go#L2694) |
| `Copy` | `n *NodeNetworkResource` | `` | `*NodeNetworkResource` | [L2698](file:///d:/claude/nomad/nomad/structs/structs.go#L2698) |
| `HasAlias` | `n *NodeNetworkResource` | `alias string` | `bool` | [L2714](file:///d:/claude/nomad/nomad/structs/structs.go#L2714) |
| `Validate` | `n *NodeNetworkAF` | `` | `error` | [L2731](file:///d:/claude/nomad/nomad/structs/structs.go#L2731) |
| `Copy` | `m *AllocatedPortMapping` | `` | `*AllocatedPortMapping` | [L2757](file:///d:/claude/nomad/nomad/structs/structs.go#L2757) |
| `Equal` | `m *AllocatedPortMapping` | `o *AllocatedPortMapping` | `bool` | [L2767](file:///d:/claude/nomad/nomad/structs/structs.go#L2767) |
| `Equal` | `p *AllocatedPorts` | `o AllocatedPorts` | `bool` | [L2788](file:///d:/claude/nomad/nomad/structs/structs.go#L2788) |
| `Get` | `p *AllocatedPorts` | `label string` | `AllocatedPortMapping, bool` | [L2794](file:///d:/claude/nomad/nomad/structs/structs.go#L2794) |
| `Equal` | `d *DNSConfig` | `o *DNSConfig` | `bool` | [L2837](file:///d:/claude/nomad/nomad/structs/structs.go#L2837) |
| `Copy` | `d *DNSConfig` | `` | `*DNSConfig` | [L2854](file:///d:/claude/nomad/nomad/structs/structs.go#L2854) |
| `IsZero` | `d *DNSConfig` | `` | `bool` | [L2865](file:///d:/claude/nomad/nomad/structs/structs.go#L2865) |
| `Hash` | `n *NetworkResource` | `` | `uint32` | [L2890](file:///d:/claude/nomad/nomad/structs/structs.go#L2890) |
| `Equal` | `n *NetworkResource` | `other *NetworkResource` | `bool` | [L2905](file:///d:/claude/nomad/nomad/structs/structs.go#L2905) |
| `Canonicalize` | `n *NetworkResource` | `` | `` | [L2909](file:///d:/claude/nomad/nomad/structs/structs.go#L2909) |
| `Copy` | `n *NetworkResource` | `` | `*NetworkResource` | [L2932](file:///d:/claude/nomad/nomad/structs/structs.go#L2932) |
| `Add` | `n *NetworkResource` | `delta *NetworkResource` | `` | [L2952](file:///d:/claude/nomad/nomad/structs/structs.go#L2952) |
| `GoString` | `n *NetworkResource` | `` | `string` | [L2960](file:///d:/claude/nomad/nomad/structs/structs.go#L2960) |
| `PortLabels` | `n *NetworkResource` | `` | `map[string]int` | [L2965](file:///d:/claude/nomad/nomad/structs/structs.go#L2965) |
| `IsIPv6` | `n *NetworkResource` | `` | `bool` | [L2977](file:///d:/claude/nomad/nomad/structs/structs.go#L2977) |
| `Copy` | `ns *Networks` | `` | `Networks` | [L2985](file:///d:/claude/nomad/nomad/structs/structs.go#L2985) |
| `Port` | `ns *Networks` | `label string` | `AllocatedPortMapping` | [L2998](file:///d:/claude/nomad/nomad/structs/structs.go#L2998) |
| `NetIndex` | `ns *Networks` | `n *NetworkResource` | `int` | [L3025](file:///d:/claude/nomad/nomad/structs/structs.go#L3025) |
| `Modes` | `ns *Networks` | `` | `*set.Set[string]` | [L3035](file:///d:/claude/nomad/nomad/structs/structs.go#L3035) |
| `String` | `r *RequestedDevice` | `` | `string` | [L3066](file:///d:/claude/nomad/nomad/structs/structs.go#L3066) |
| `Equal` | `r *RequestedDevice` | `o *RequestedDevice` | `bool` | [L3070](file:///d:/claude/nomad/nomad/structs/structs.go#L3070) |
| `Copy` | `r *RequestedDevice` | `` | `*RequestedDevice` | [L3083](file:///d:/claude/nomad/nomad/structs/structs.go#L3083) |
| `ID` | `r *RequestedDevice` | `` | `*DeviceIdTuple` | [L3095](file:///d:/claude/nomad/nomad/structs/structs.go#L3095) |
| `Validate` | `r *RequestedDevice` | `` | `error` | [L3120](file:///d:/claude/nomad/nomad/structs/structs.go#L3120) |
| `Copy` | `n *NodeResources` | `` | `*NodeResources` | [L3181](file:///d:/claude/nomad/nomad/structs/structs.go#L3181) |
| `Comparable` | `n *NodeResources` | `` | `*ComparableResources` | [L3216](file:///d:/claude/nomad/nomad/structs/structs.go#L3216) |
| `Merge` | `n *NodeResources` | `o *NodeResources` | `` | [L3244](file:///d:/claude/nomad/nomad/structs/structs.go#L3244) |
| `lookupNetworkByDevice` | - | `nets []*NodeNetworkResource, name string` | `int, *NodeNetworkResource` | [L3276](file:///d:/claude/nomad/nomad/structs/structs.go#L3276) |
| `Equal` | `n *NodeResources` | `o *NodeResources` | `bool` | [L3285](file:///d:/claude/nomad/nomad/structs/structs.go#L3285) |
| `Equal` | `ns *Networks` | `o *Networks` | `bool` | [L3320](file:///d:/claude/nomad/nomad/structs/structs.go#L3320) |
| `DevicesEquals` | - | `d1 []*NodeDeviceResource, d2 []*NodeDeviceResource` | `bool` | [L3343](file:///d:/claude/nomad/nomad/structs/structs.go#L3343) |
| `NodeNetworksEquals` | - | `n1 []*NodeNetworkResource, n2 []*NodeNetworkResource` | `bool` | [L3360](file:///d:/claude/nomad/nomad/structs/structs.go#L3360) |
| `Merge` | `n *NodeMemoryResources` | `o *NodeMemoryResources` | `` | [L3385](file:///d:/claude/nomad/nomad/structs/structs.go#L3385) |
| `Equal` | `n *NodeMemoryResources` | `o *NodeMemoryResources` | `bool` | [L3395](file:///d:/claude/nomad/nomad/structs/structs.go#L3395) |
| `Merge` | `n *NodeDiskResources` | `o *NodeDiskResources` | `` | [L3417](file:///d:/claude/nomad/nomad/structs/structs.go#L3417) |
| `Equal` | `n *NodeDiskResources` | `o *NodeDiskResources` | `bool` | [L3426](file:///d:/claude/nomad/nomad/structs/structs.go#L3426) |
| `String` | `id *DeviceIdTuple` | `` | `string` | [L3449](file:///d:/claude/nomad/nomad/structs/structs.go#L3449) |
| `Matches` | `id *DeviceIdTuple` | `other *DeviceIdTuple` | `bool` | [L3458](file:///d:/claude/nomad/nomad/structs/structs.go#L3458) |
| `Equal` | `id *DeviceIdTuple` | `o *DeviceIdTuple` | `bool` | [L3479](file:///d:/claude/nomad/nomad/structs/structs.go#L3479) |
| `ID` | `n *NodeDeviceResource` | `` | `*DeviceIdTuple` | [L3499](file:///d:/claude/nomad/nomad/structs/structs.go#L3499) |
| `Copy` | `n *NodeDeviceResource` | `` | `*NodeDeviceResource` | [L3511](file:///d:/claude/nomad/nomad/structs/structs.go#L3511) |
| `Equal` | `n *NodeDeviceResource` | `o *NodeDeviceResource` | `bool` | [L3533](file:///d:/claude/nomad/nomad/structs/structs.go#L3533) |
| `Equal` | `n *NodeDevice` | `o *NodeDevice` | `bool` | [L3595](file:///d:/claude/nomad/nomad/structs/structs.go#L3595) |
| `Copy` | `n *NodeDevice` | `` | `*NodeDevice` | [L3617](file:///d:/claude/nomad/nomad/structs/structs.go#L3617) |
| `Equal` | `n *NodeDeviceLocality` | `o *NodeDeviceLocality` | `bool` | [L3638](file:///d:/claude/nomad/nomad/structs/structs.go#L3638) |
| `Copy` | `n *NodeDeviceLocality` | `` | `*NodeDeviceLocality` | [L3654](file:///d:/claude/nomad/nomad/structs/structs.go#L3654) |
| `Copy` | `n *NodeReservedResources` | `` | `*NodeReservedResources` | [L3673](file:///d:/claude/nomad/nomad/structs/structs.go#L3673) |
| `Comparable` | `n *NodeReservedResources` | `` | `*ComparableResources` | [L3685](file:///d:/claude/nomad/nomad/structs/structs.go#L3685) |
| `UsesCores` | `a *AllocatedResources` | `` | `bool` | [L3743](file:///d:/claude/nomad/nomad/structs/structs.go#L3743) |
| `Copy` | `a *AllocatedResources` | `` | `*AllocatedResources` | [L3752](file:///d:/claude/nomad/nomad/structs/structs.go#L3752) |
| `Comparable` | `a *AllocatedResources` | `` | `*ComparableResources` | [L3780](file:///d:/claude/nomad/nomad/structs/structs.go#L3780) |
| `OldTaskResources` | `a *AllocatedResources` | `` | `map[string]*Resources` | [L3841](file:///d:/claude/nomad/nomad/structs/structs.go#L3841) |
| `Canonicalize` | `a *AllocatedResources` | `` | `` | [L3856](file:///d:/claude/nomad/nomad/structs/structs.go#L3856) |
| `Copy` | `a *AllocatedTaskResources` | `` | `*AllocatedTaskResources` | [L3881](file:///d:/claude/nomad/nomad/structs/structs.go#L3881) |
| `NetIndex` | `a *AllocatedTaskResources` | `n *NetworkResource` | `int` | [L3904](file:///d:/claude/nomad/nomad/structs/structs.go#L3904) |
| `Add` | `a *AllocatedTaskResources` | `delta *AllocatedTaskResources` | `` | [L3908](file:///d:/claude/nomad/nomad/structs/structs.go#L3908) |
| `Max` | `a *AllocatedTaskResources` | `other *AllocatedTaskResources` | `` | [L3937](file:///d:/claude/nomad/nomad/structs/structs.go#L3937) |
| `Comparable` | `a *AllocatedTaskResources` | `` | `*ComparableResources` | [L3968](file:///d:/claude/nomad/nomad/structs/structs.go#L3968) |
| `Subtract` | `a *AllocatedTaskResources` | `delta *AllocatedTaskResources` | `` | [L3987](file:///d:/claude/nomad/nomad/structs/structs.go#L3987) |
| `Copy` | `a *AllocatedSharedResources` | `` | `AllocatedSharedResources` | [L4003](file:///d:/claude/nomad/nomad/structs/structs.go#L4003) |
| `Add` | `a *AllocatedSharedResources` | `delta *AllocatedSharedResources` | `` | [L4011](file:///d:/claude/nomad/nomad/structs/structs.go#L4011) |
| `Subtract` | `a *AllocatedSharedResources` | `delta *AllocatedSharedResources` | `` | [L4020](file:///d:/claude/nomad/nomad/structs/structs.go#L4020) |
| `Canonicalize` | `a *AllocatedSharedResources` | `` | `` | [L4039](file:///d:/claude/nomad/nomad/structs/structs.go#L4039) |
| `Add` | `a *AllocatedCpuResources` | `delta *AllocatedCpuResources` | `` | [L4062](file:///d:/claude/nomad/nomad/structs/structs.go#L4062) |
| `Subtract` | `a *AllocatedCpuResources` | `delta *AllocatedCpuResources` | `` | [L4077](file:///d:/claude/nomad/nomad/structs/structs.go#L4077) |
| `Max` | `a *AllocatedCpuResources` | `other *AllocatedCpuResources` | `` | [L4092](file:///d:/claude/nomad/nomad/structs/structs.go#L4092) |
| `Add` | `a *AllocatedMemoryResources` | `delta *AllocatedMemoryResources` | `` | [L4112](file:///d:/claude/nomad/nomad/structs/structs.go#L4112) |
| `Subtract` | `a *AllocatedMemoryResources` | `delta *AllocatedMemoryResources` | `` | [L4125](file:///d:/claude/nomad/nomad/structs/structs.go#L4125) |
| `Max` | `a *AllocatedMemoryResources` | `other *AllocatedMemoryResources` | `` | [L4138](file:///d:/claude/nomad/nomad/structs/structs.go#L4138) |
| `Index` | `a *AllocatedDevices` | `d *AllocatedDeviceResource` | `int` | [L4155](file:///d:/claude/nomad/nomad/structs/structs.go#L4155) |
| `ID` | `a *AllocatedDeviceResource` | `` | `*DeviceIdTuple` | [L4181](file:///d:/claude/nomad/nomad/structs/structs.go#L4181) |
| `Add` | `a *AllocatedDeviceResource` | `delta *AllocatedDeviceResource` | `` | [L4193](file:///d:/claude/nomad/nomad/structs/structs.go#L4193) |
| `Copy` | `a *AllocatedDeviceResource` | `` | `*AllocatedDeviceResource` | [L4201](file:///d:/claude/nomad/nomad/structs/structs.go#L4201) |
| `Add` | `c *ComparableResources` | `delta *ComparableResources` | `` | [L4221](file:///d:/claude/nomad/nomad/structs/structs.go#L4221) |
| `Subtract` | `c *ComparableResources` | `delta *ComparableResources` | `` | [L4230](file:///d:/claude/nomad/nomad/structs/structs.go#L4230) |
| `Copy` | `c *ComparableResources` | `` | `*ComparableResources` | [L4239](file:///d:/claude/nomad/nomad/structs/structs.go#L4239) |
| `Superset` | `c *ComparableResources` | `other *ComparableResources` | `bool, string` | [L4250](file:///d:/claude/nomad/nomad/structs/structs.go#L4250) |
| `NetIndex` | `c *ComparableResources` | `n *NetworkResource` | `int` | [L4272](file:///d:/claude/nomad/nomad/structs/structs.go#L4272) |
| `Hash` | `js *JobSubmission` | `` | `string` | [L4363](file:///d:/claude/nomad/nomad/structs/structs.go#L4363) |
| `Copy` | `js *JobSubmission` | `` | `*JobSubmission` | [L4368](file:///d:/claude/nomad/nomad/structs/structs.go#L4368) |
| `Copy` | `tv *JobVersionTag` | `` | `*JobVersionTag` | [L4550](file:///d:/claude/nomad/nomad/structs/structs.go#L4550) |
| `Copy` | `j *JobUIConfig` | `` | `*JobUIConfig` | [L4571](file:///d:/claude/nomad/nomad/structs/structs.go#L4571) |
| `Copy` | `l *JobUILink` | `` | `*JobUILink` | [L4588](file:///d:/claude/nomad/nomad/structs/structs.go#L4588) |
| `NamespacedID` | `j *Job` | `` | `NamespacedID` | [L4599](file:///d:/claude/nomad/nomad/structs/structs.go#L4599) |
| `GetID` | `j *Job` | `` | `string` | [L4607](file:///d:/claude/nomad/nomad/structs/structs.go#L4607) |
| `GetNamespace` | `j *Job` | `` | `string` | [L4617](file:///d:/claude/nomad/nomad/structs/structs.go#L4617) |
| `GetIDforWorkloadIdentity` | `j *Job` | `` | `string` | [L4626](file:///d:/claude/nomad/nomad/structs/structs.go#L4626) |
| `GetCreateIndex` | `j *Job` | `` | `uint64` | [L4635](file:///d:/claude/nomad/nomad/structs/structs.go#L4635) |
| `GetModifyIndex` | `j *Job` | `` | `uint64` | [L4644](file:///d:/claude/nomad/nomad/structs/structs.go#L4644) |
| `Canonicalize` | `j *Job` | `` | `` | [L4653](file:///d:/claude/nomad/nomad/structs/structs.go#L4653) |
| `Copy` | `j *Job` | `` | `*Job` | [L4704](file:///d:/claude/nomad/nomad/structs/structs.go#L4704) |
| `Validate` | `j *Job` | `` | `error` | [L4732](file:///d:/claude/nomad/nomad/structs/structs.go#L4732) |
| `generateServiceShutdownDelayWarnings` | `j *Job` | `` | `[]error` | [L4883](file:///d:/claude/nomad/nomad/structs/structs.go#L4883) |
| `generateTaskGroupServiceShutdownDelayWarnings` | - | `tg *TaskGroup` | `[]error` | [L4893](file:///d:/claude/nomad/nomad/structs/structs.go#L4893) |
| `Warnings` | `j *Job` | `` | `error` | [L4951](file:///d:/claude/nomad/nomad/structs/structs.go#L4951) |
| `LookupTaskGroup` | `j *Job` | `name string` | `*TaskGroup` | [L4990](file:///d:/claude/nomad/nomad/structs/structs.go#L4990) |
| `CombinedTaskMeta` | `j *Job` | `groupName string, taskName string` | `map[string]string` | [L5005](file:///d:/claude/nomad/nomad/structs/structs.go#L5005) |
| `Stopped` | `j *Job` | `` | `bool` | [L5040](file:///d:/claude/nomad/nomad/structs/structs.go#L5040) |
| `HasUpdateStrategy` | `j *Job` | `` | `bool` | [L5045](file:///d:/claude/nomad/nomad/structs/structs.go#L5045) |
| `Stub` | `j *Job` | `summary *JobSummary, fields *JobStubFields` | `*JobListStub` | [L5056](file:///d:/claude/nomad/nomad/structs/structs.go#L5056) |
| `IsPeriodic` | `j *Job` | `` | `bool` | [L5089](file:///d:/claude/nomad/nomad/structs/structs.go#L5089) |
| `IsPeriodicActive` | `j *Job` | `` | `bool` | [L5095](file:///d:/claude/nomad/nomad/structs/structs.go#L5095) |
| `IsParameterized` | `j *Job` | `` | `bool` | [L5100](file:///d:/claude/nomad/nomad/structs/structs.go#L5100) |
| `IsMultiregion` | `j *Job` | `` | `bool` | [L5105](file:///d:/claude/nomad/nomad/structs/structs.go#L5105) |
| `IsPlugin` | `j *Job` | `` | `bool` | [L5110](file:///d:/claude/nomad/nomad/structs/structs.go#L5110) |
| `HasPlugin` | `j *Job` | `id string` | `bool` | [L5122](file:///d:/claude/nomad/nomad/structs/structs.go#L5122) |
| `Vault` | `j *Job` | `` | `map[string]map[string]*Vault` | [L5134](file:///d:/claude/nomad/nomad/structs/structs.go#L5134) |
| `Secrets` | `j *Job` | `` | `map[string][]string` | [L5157](file:///d:/claude/nomad/nomad/structs/structs.go#L5157) |
| `ConnectTasks` | `j *Job` | `` | `[]TaskKind` | [L5189](file:///d:/claude/nomad/nomad/structs/structs.go#L5189) |
| `RequiredSignals` | `j *Job` | `` | `map[string]map[string][]string` | [L5205](file:///d:/claude/nomad/nomad/structs/structs.go#L5205) |
| `SpecChanged` | `j *Job` | `new *Job` | `bool` | [L5259](file:///d:/claude/nomad/nomad/structs/structs.go#L5259) |
| `SetSubmitTime` | `j *Job` | `` | `` | [L5283](file:///d:/claude/nomad/nomad/structs/structs.go#L5283) |
| `Copy` | `js *JobSummary` | `` | `*JobSummary` | [L5332](file:///d:/claude/nomad/nomad/structs/structs.go#L5332) |
| `Copy` | `jc *JobChildrenSummary` | `` | `*JobChildrenSummary` | [L5352](file:///d:/claude/nomad/nomad/structs/structs.go#L5352) |
| `Copy` | `u *UpdateStrategy` | `` | `*UpdateStrategy` | [L5451](file:///d:/claude/nomad/nomad/structs/structs.go#L5451) |
| `Validate` | `u *UpdateStrategy` | `` | `error` | [L5461](file:///d:/claude/nomad/nomad/structs/structs.go#L5461) |
| `IsEmpty` | `u *UpdateStrategy` | `` | `bool` | [L5504](file:///d:/claude/nomad/nomad/structs/structs.go#L5504) |
| `Rolling` | `u *UpdateStrategy` | `` | `bool` | [L5520](file:///d:/claude/nomad/nomad/structs/structs.go#L5520) |
| `Canonicalize` | `m *Multiregion` | `` | `` | [L5529](file:///d:/claude/nomad/nomad/structs/structs.go#L5529) |
| `Diff` | `m *Multiregion` | `m2 *Multiregion` | `bool` | [L5539](file:///d:/claude/nomad/nomad/structs/structs.go#L5539) |
| `Copy` | `m *Multiregion` | `` | `*Multiregion` | [L5543](file:///d:/claude/nomad/nomad/structs/structs.go#L5543) |
| `Validate` | `n *Namespace` | `` | `error` | [L5653](file:///d:/claude/nomad/nomad/structs/structs.go#L5653) |
| `SetHash` | `n *Namespace` | `` | `[]byte` | [L5700](file:///d:/claude/nomad/nomad/structs/structs.go#L5700) |
| `Copy` | `n *Namespace` | `` | `*Namespace` | [L5775](file:///d:/claude/nomad/nomad/structs/structs.go#L5775) |
| `Copy` | `p *PeriodicConfig` | `` | `*PeriodicConfig` | [L5903](file:///d:/claude/nomad/nomad/structs/structs.go#L5903) |
| `Validate` | `p *PeriodicConfig` | `` | `error` | [L5912](file:///d:/claude/nomad/nomad/structs/structs.go#L5912) |
| `Canonicalize` | `p *PeriodicConfig` | `` | `` | [L5956](file:///d:/claude/nomad/nomad/structs/structs.go#L5956) |
| `CronParseNext` | - | `fromTime time.Time, spec string` | `t time.Time, err error` | [L5968](file:///d:/claude/nomad/nomad/structs/structs.go#L5968) |
| `Next` | `p *PeriodicConfig` | `fromTime time.Time` | `time.Time, error` | [L5986](file:///d:/claude/nomad/nomad/structs/structs.go#L5986) |
| `GetLocation` | `p *PeriodicConfig` | `` | `*time.Location` | [L6037](file:///d:/claude/nomad/nomad/structs/structs.go#L6037) |
| `Validate` | `d *ParameterizedJobConfig` | `` | `error` | [L6085](file:///d:/claude/nomad/nomad/structs/structs.go#L6085) |
| `Canonicalize` | `d *ParameterizedJobConfig` | `` | `` | [L6102](file:///d:/claude/nomad/nomad/structs/structs.go#L6102) |
| `Copy` | `d *ParameterizedJobConfig` | `` | `*ParameterizedJobConfig` | [L6108](file:///d:/claude/nomad/nomad/structs/structs.go#L6108) |
| `DispatchedID` | - | `templateID string, idPrefixTemplate string, t time.Time` | `string` | [L6121](file:///d:/claude/nomad/nomad/structs/structs.go#L6121) |
| `Copy` | `d *DispatchPayloadConfig` | `` | `*DispatchPayloadConfig` | [L6137](file:///d:/claude/nomad/nomad/structs/structs.go#L6137) |
| `Validate` | `d *DispatchPayloadConfig` | `` | `error` | [L6146](file:///d:/claude/nomad/nomad/structs/structs.go#L6146) |
| `Copy` | `d *TaskLifecycleConfig` | `` | `*TaskLifecycleConfig` | [L6169](file:///d:/claude/nomad/nomad/structs/structs.go#L6169) |
| `Validate` | `d *TaskLifecycleConfig` | `` | `error` | [L6178](file:///d:/claude/nomad/nomad/structs/structs.go#L6178) |
| `Copy` | `j *JobScalingEvents` | `` | `*JobScalingEvents` | [L6265](file:///d:/claude/nomad/nomad/structs/structs.go#L6265) |
| `NewScalingEvent` | - | `message string` | `*ScalingEvent` | [L6281](file:///d:/claude/nomad/nomad/structs/structs.go#L6281) |
| `Copy` | `e *ScalingEvent` | `` | `*ScalingEvent` | [L6315](file:///d:/claude/nomad/nomad/structs/structs.go#L6315) |
| `JobKey` | `p *ScalingPolicy` | `` | `string` | [L6367](file:///d:/claude/nomad/nomad/structs/structs.go#L6367) |
| `Canonicalize` | `p *ScalingPolicy` | `job *Job, tg *TaskGroup, task *Task` | `` | [L6382](file:///d:/claude/nomad/nomad/structs/structs.go#L6382) |
| `Copy` | `p *ScalingPolicy` | `` | `*ScalingPolicy` | [L6403](file:///d:/claude/nomad/nomad/structs/structs.go#L6403) |
| `Validate` | `p *ScalingPolicy` | `` | `error` | [L6430](file:///d:/claude/nomad/nomad/structs/structs.go#L6430) |
| `validateTargetHorizontal` | `p *ScalingPolicy` | `` | `mErr multierror.Error` | [L6461](file:///d:/claude/nomad/nomad/structs/structs.go#L6461) |
| `Diff` | `p *ScalingPolicy` | `p2 *ScalingPolicy` | `bool` | [L6481](file:///d:/claude/nomad/nomad/structs/structs.go#L6481) |
| `Stub` | `p *ScalingPolicy` | `` | `*ScalingPolicyListStub` | [L6489](file:///d:/claude/nomad/nomad/structs/structs.go#L6489) |
| `GetScalingPolicies` | `j *Job` | `` | `[]*ScalingPolicy` | [L6505](file:///d:/claude/nomad/nomad/structs/structs.go#L6505) |
| `UsesDeployments` | `j *Job` | `` | `bool` | [L6521](file:///d:/claude/nomad/nomad/structs/structs.go#L6521) |
| `Copy` | `r *RestartPolicy` | `` | `*RestartPolicy` | [L6561](file:///d:/claude/nomad/nomad/structs/structs.go#L6561) |
| `Validate` | `r *RestartPolicy` | `` | `error` | [L6570](file:///d:/claude/nomad/nomad/structs/structs.go#L6570) |
| `NewRestartPolicy` | - | `jobType string` | `*RestartPolicy` | [L6593](file:///d:/claude/nomad/nomad/structs/structs.go#L6593) |
| `Copy` | `r *ReschedulePolicy` | `` | `*ReschedulePolicy` | [L6634](file:///d:/claude/nomad/nomad/structs/structs.go#L6634) |
| `Enabled` | `r *ReschedulePolicy` | `` | `bool` | [L6643](file:///d:/claude/nomad/nomad/structs/structs.go#L6643) |
| `Validate` | `r *ReschedulePolicy` | `` | `error` | [L6652](file:///d:/claude/nomad/nomad/structs/structs.go#L6652) |
| `isValidDelayFunction` | - | `delayFunc string` | `bool` | [L6712](file:///d:/claude/nomad/nomad/structs/structs.go#L6712) |
| `validateDelayParams` | `r *ReschedulePolicy` | `` | `error` | [L6721](file:///d:/claude/nomad/nomad/structs/structs.go#L6721) |
| `viableAttempts` | `r *ReschedulePolicy` | `` | `bool, int, time.Duration` | [L6738](file:///d:/claude/nomad/nomad/structs/structs.go#L6738) |
| `NewReschedulePolicy` | - | `jobType string` | `*ReschedulePolicy` | [L6804](file:///d:/claude/nomad/nomad/structs/structs.go#L6804) |
| `DefaultMigrateStrategy` | - | `` | `*MigrateStrategy` | [L6832](file:///d:/claude/nomad/nomad/structs/structs.go#L6832) |
| `Validate` | `m *MigrateStrategy` | `` | `error` | [L6841](file:///d:/claude/nomad/nomad/structs/structs.go#L6841) |
| `Copy` | `tg *TaskGroup` | `` | `*TaskGroup` | [L6966](file:///d:/claude/nomad/nomad/structs/structs.go#L6966) |
| `Canonicalize` | `tg *TaskGroup` | `job *Job` | `` | [L7025](file:///d:/claude/nomad/nomad/structs/structs.go#L7025) |
| `NomadServices` | `tg *TaskGroup` | `` | `[]*Service` | [L7086](file:///d:/claude/nomad/nomad/structs/structs.go#L7086) |
| `ConsulServices` | `tg *TaskGroup` | `` | `[]*Service` | [L7092](file:///d:/claude/nomad/nomad/structs/structs.go#L7092) |
| `filterServices` | `tg *TaskGroup` | `f func(...)` | `[]*Service` | [L7098](file:///d:/claude/nomad/nomad/structs/structs.go#L7098) |
| `Validate` | `tg *TaskGroup` | `j *Job` | `error` | [L7116](file:///d:/claude/nomad/nomad/structs/structs.go#L7116) |
| `validateNetworks` | `tg *TaskGroup` | `` | `error` | [L7308](file:///d:/claude/nomad/nomad/structs/structs.go#L7308) |
| `validateServices` | `tg *TaskGroup` | `` | `error` | [L7437](file:///d:/claude/nomad/nomad/structs/structs.go#L7437) |
| `validateScriptChecksInGroupServices` | `tg *TaskGroup` | `` | `error` | [L7569](file:///d:/claude/nomad/nomad/structs/structs.go#L7569) |
| `validateScalingPolicy` | `tg *TaskGroup` | `j *Job` | `error` | [L7588](file:///d:/claude/nomad/nomad/structs/structs.go#L7588) |
| `Warnings` | `tg *TaskGroup` | `j *Job` | `error` | [L7620](file:///d:/claude/nomad/nomad/structs/structs.go#L7620) |
| `LookupTask` | `tg *TaskGroup` | `name string` | `*Task` | [L7669](file:///d:/claude/nomad/nomad/structs/structs.go#L7669) |
| `UsesConnect` | `tg *TaskGroup` | `` | `bool` | [L7683](file:///d:/claude/nomad/nomad/structs/structs.go#L7683) |
| `UsesConnectGateway` | `tg *TaskGroup` | `` | `bool` | [L7696](file:///d:/claude/nomad/nomad/structs/structs.go#L7696) |
| `GoString` | `tg *TaskGroup` | `` | `string` | [L7707](file:///d:/claude/nomad/nomad/structs/structs.go#L7707) |
| `Replace` | `tg *TaskGroup` | `` | `bool` | [L7713](file:///d:/claude/nomad/nomad/structs/structs.go#L7713) |
| `GetDisconnectLostAfter` | `tg *TaskGroup` | `` | `time.Duration` | [L7723](file:///d:/claude/nomad/nomad/structs/structs.go#L7723) |
| `GetDisconnectStopTimeout` | `tg *TaskGroup` | `` | `*time.Duration` | [L7733](file:///d:/claude/nomad/nomad/structs/structs.go#L7733) |
| `GetConstraints` | `tg *TaskGroup` | `` | `[]*Constraint` | [L7741](file:///d:/claude/nomad/nomad/structs/structs.go#L7741) |
| `SetConstraints` | `tg *TaskGroup` | `newConstraints []*Constraint` | `` | [L7745](file:///d:/claude/nomad/nomad/structs/structs.go#L7745) |
| `Copy` | `c *CheckRestart` | `` | `*CheckRestart` | [L7757](file:///d:/claude/nomad/nomad/structs/structs.go#L7757) |
| `Equal` | `c *CheckRestart` | `o *CheckRestart` | `bool` | [L7767](file:///d:/claude/nomad/nomad/structs/structs.go#L7767) |
| `Validate` | `c *CheckRestart` | `` | `error` | [L7787](file:///d:/claude/nomad/nomad/structs/structs.go#L7787) |
| `Equal` | `l *LogConfig` | `o *LogConfig` | `bool` | [L7817](file:///d:/claude/nomad/nomad/structs/structs.go#L7817) |
| `Copy` | `l *LogConfig` | `` | `*LogConfig` | [L7837](file:///d:/claude/nomad/nomad/structs/structs.go#L7837) |
| `DefaultLogConfig` | - | `` | `*LogConfig` | [L7849](file:///d:/claude/nomad/nomad/structs/structs.go#L7849) |
| `Validate` | `l *LogConfig` | `disk *EphemeralDisk` | `error` | [L7860](file:///d:/claude/nomad/nomad/structs/structs.go#L7860) |
| `UsesCores` | `t *Task` | `` | `bool` | [L7988](file:///d:/claude/nomad/nomad/structs/structs.go#L7988) |
| `UsesConnect` | `t *Task` | `` | `bool` | [L7996](file:///d:/claude/nomad/nomad/structs/structs.go#L7996) |
| `UsesConnectSidecar` | `t *Task` | `` | `bool` | [L8000](file:///d:/claude/nomad/nomad/structs/structs.go#L8000) |
| `IsPrestart` | `t *Task` | `` | `bool` | [L8004](file:///d:/claude/nomad/nomad/structs/structs.go#L8004) |
| `IsMain` | `t *Task` | `` | `bool` | [L8009](file:///d:/claude/nomad/nomad/structs/structs.go#L8009) |
| `IsPoststart` | `t *Task` | `` | `bool` | [L8013](file:///d:/claude/nomad/nomad/structs/structs.go#L8013) |
| `IsPoststop` | `t *Task` | `` | `bool` | [L8018](file:///d:/claude/nomad/nomad/structs/structs.go#L8018) |
| `GetIdentity` | `t *Task` | `name string` | `*WorkloadIdentity` | [L8023](file:///d:/claude/nomad/nomad/structs/structs.go#L8023) |
| `GetAction` | `t *Task` | `name string` | `*Action` | [L8032](file:///d:/claude/nomad/nomad/structs/structs.go#L8032) |
| `IdentityHandle` | `t *Task` | `identity *WorkloadIdentity` | `*WIHandle` | [L8043](file:///d:/claude/nomad/nomad/structs/structs.go#L8043) |
| `Copy` | `t *Task` | `` | `*Task` | [L8051](file:///d:/claude/nomad/nomad/structs/structs.go#L8051) |
| `Canonicalize` | `t *Task` | `job *Job, tg *TaskGroup` | `` | [L8109](file:///d:/claude/nomad/nomad/structs/structs.go#L8109) |
| `GoString` | `t *Task` | `` | `string` | [L8191](file:///d:/claude/nomad/nomad/structs/structs.go#L8191) |
| `Validate` | `t *Task` | `jobType string, tg *TaskGroup` | `error` | [L8196](file:///d:/claude/nomad/nomad/structs/structs.go#L8196) |
| `validateServices` | - | `t *Task, tgNetworks Networks` | `error` | [L8434](file:///d:/claude/nomad/nomad/structs/structs.go#L8434) |
| `Warnings` | `t *Task` | `` | `error` | [L8592](file:///d:/claude/nomad/nomad/structs/structs.go#L8592) |
| `GetConstraints` | `t *Task` | `` | `[]*Constraint` | [L8629](file:///d:/claude/nomad/nomad/structs/structs.go#L8629) |
| `SetConstraints` | `t *Task` | `newConstraints []*Constraint` | `` | [L8633](file:///d:/claude/nomad/nomad/structs/structs.go#L8633) |
| `NewTaskKind` | - | `name string, identifier string` | `TaskKind` | [L8647](file:///d:/claude/nomad/nomad/structs/structs.go#L8647) |
| `Name` | `k *TaskKind` | `` | `string` | [L8652](file:///d:/claude/nomad/nomad/structs/structs.go#L8652) |
| `Value` | `k *TaskKind` | `` | `string` | [L8658](file:///d:/claude/nomad/nomad/structs/structs.go#L8658) |
| `hasPrefix` | `k *TaskKind` | `prefix string` | `bool` | [L8665](file:///d:/claude/nomad/nomad/structs/structs.go#L8665) |
| `IsConnectProxy` | `k *TaskKind` | `` | `bool` | [L8670](file:///d:/claude/nomad/nomad/structs/structs.go#L8670) |
| `IsConnectNative` | `k *TaskKind` | `` | `bool` | [L8675](file:///d:/claude/nomad/nomad/structs/structs.go#L8675) |
| `IsConnectIngress` | `k *TaskKind` | `` | `bool` | [L8680](file:///d:/claude/nomad/nomad/structs/structs.go#L8680) |
| `IsConnectTerminating` | `k *TaskKind` | `` | `bool` | [L8685](file:///d:/claude/nomad/nomad/structs/structs.go#L8685) |
| `IsConnectMesh` | `k *TaskKind` | `` | `bool` | [L8690](file:///d:/claude/nomad/nomad/structs/structs.go#L8690) |
| `IsAnyConnectGateway` | `k *TaskKind` | `` | `bool` | [L8696](file:///d:/claude/nomad/nomad/structs/structs.go#L8696) |
| `ValidateConnectProxyService` | - | `serviceName string, tgServices []*Service` | `error` | [L8734](file:///d:/claude/nomad/nomad/structs/structs.go#L8734) |
| `DefaultTemplate` | - | `` | `*Template` | [L8857](file:///d:/claude/nomad/nomad/structs/structs.go#L8857) |
| `Equal` | `t *Template` | `o *Template` | `bool` | [L8865](file:///d:/claude/nomad/nomad/structs/structs.go#L8865) |
| `Copy` | `t *Template` | `` | `*Template` | [L8908](file:///d:/claude/nomad/nomad/structs/structs.go#L8908) |
| `Canonicalize` | `t *Template` | `` | `` | [L8921](file:///d:/claude/nomad/nomad/structs/structs.go#L8921) |
| `Validate` | `t *Template` | `` | `error` | [L8927](file:///d:/claude/nomad/nomad/structs/structs.go#L8927) |
| `Warnings` | `t *Template` | `` | `error` | [L8989](file:///d:/claude/nomad/nomad/structs/structs.go#L8989) |
| `DiffID` | `t *Template` | `` | `string` | [L9001](file:///d:/claude/nomad/nomad/structs/structs.go#L9001) |
| `Equal` | `cs *ChangeScript` | `o *ChangeScript` | `bool` | [L9023](file:///d:/claude/nomad/nomad/structs/structs.go#L9023) |
| `Copy` | `cs *ChangeScript` | `` | `*ChangeScript` | [L9042](file:///d:/claude/nomad/nomad/structs/structs.go#L9042) |
| `Validate` | `cs *ChangeScript` | `` | `error` | [L9056](file:///d:/claude/nomad/nomad/structs/structs.go#L9056) |
| `Copy` | `wc *WaitConfig` | `` | `*WaitConfig` | [L9077](file:///d:/claude/nomad/nomad/structs/structs.go#L9077) |
| `Equal` | `wc *WaitConfig` | `o *WaitConfig` | `bool` | [L9095](file:///d:/claude/nomad/nomad/structs/structs.go#L9095) |
| `Validate` | `wc *WaitConfig` | `` | `error` | [L9109](file:///d:/claude/nomad/nomad/structs/structs.go#L9109) |
| `NewTaskState` | - | `` | `*TaskState` | [L9170](file:///d:/claude/nomad/nomad/structs/structs.go#L9170) |
| `Canonicalize` | `ts *TaskState` | `` | `` | [L9178](file:///d:/claude/nomad/nomad/structs/structs.go#L9178) |
| `Copy` | `ts *TaskState` | `` | `*TaskState` | [L9184](file:///d:/claude/nomad/nomad/structs/structs.go#L9184) |
| `Successful` | `ts *TaskState` | `` | `bool` | [L9204](file:///d:/claude/nomad/nomad/structs/structs.go#L9204) |
| `Equal` | `ts *TaskState` | `o *TaskState` | `bool` | [L9208](file:///d:/claude/nomad/nomad/structs/structs.go#L9208) |
| `PopulateEventDisplayMessage` | `e *TaskEvent` | `` | `` | [L9446](file:///d:/claude/nomad/nomad/structs/structs.go#L9446) |
| `GoString` | `e *TaskEvent` | `` | `string` | [L9569](file:///d:/claude/nomad/nomad/structs/structs.go#L9569) |
| `Equal` | `e *TaskEvent` | `o *TaskEvent` | `bool` | [L9577](file:///d:/claude/nomad/nomad/structs/structs.go#L9577) |
| `SetDisplayMessage` | `e *TaskEvent` | `msg string` | `*TaskEvent` | [L9602](file:///d:/claude/nomad/nomad/structs/structs.go#L9602) |
| `SetMessage` | `e *TaskEvent` | `msg string` | `*TaskEvent` | [L9608](file:///d:/claude/nomad/nomad/structs/structs.go#L9608) |
| `Copy` | `e *TaskEvent` | `` | `*TaskEvent` | [L9614](file:///d:/claude/nomad/nomad/structs/structs.go#L9614) |
| `NewTaskEvent` | - | `event string` | `*TaskEvent` | [L9623](file:///d:/claude/nomad/nomad/structs/structs.go#L9623) |
| `SetSetupError` | `e *TaskEvent` | `err error` | `*TaskEvent` | [L9633](file:///d:/claude/nomad/nomad/structs/structs.go#L9633) |
| `SetFailsTask` | `e *TaskEvent` | `` | `*TaskEvent` | [L9641](file:///d:/claude/nomad/nomad/structs/structs.go#L9641) |
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
| `Copy` | `ta *TaskArtifact` | `` | `*TaskArtifact` | [L9826](file:///d:/claude/nomad/nomad/structs/structs.go#L9826) |
| `GoString` | `ta *TaskArtifact` | `` | `string` | [L9841](file:///d:/claude/nomad/nomad/structs/structs.go#L9841) |
| `DiffID` | `ta *TaskArtifact` | `` | `string` | [L9846](file:///d:/claude/nomad/nomad/structs/structs.go#L9846) |
| `hashStringMap` | - | `h hash.Hash, m map[string]string` | `` | [L9851](file:///d:/claude/nomad/nomad/structs/structs.go#L9851) |
| `Hash` | `ta *TaskArtifact` | `` | `string` | [L9865](file:///d:/claude/nomad/nomad/structs/structs.go#L9865) |
| `Validate` | `ta *TaskArtifact` | `` | `error` | [L9883](file:///d:/claude/nomad/nomad/structs/structs.go#L9883) |
| `validateChecksum` | `ta *TaskArtifact` | `` | `error` | [L9915](file:///d:/claude/nomad/nomad/structs/structs.go#L9915) |
| `Equal` | `c *Constraint` | `o *Constraint` | `bool` | [L9987](file:///d:/claude/nomad/nomad/structs/structs.go#L9987) |
| `Copy` | `c *Constraint` | `` | `*Constraint` | [L9994](file:///d:/claude/nomad/nomad/structs/structs.go#L9994) |
| `String` | `c *Constraint` | `` | `string` | [L10005](file:///d:/claude/nomad/nomad/structs/structs.go#L10005) |
| `Validate` | `c *Constraint` | `` | `error` | [L10009](file:///d:/claude/nomad/nomad/structs/structs.go#L10009) |
| `DiffID` | `c *Constraint` | `` | `string` | [L10078](file:///d:/claude/nomad/nomad/structs/structs.go#L10078) |
| `Equal` | `xs *Constraints` | `ys *Constraints` | `bool` | [L10085](file:///d:/claude/nomad/nomad/structs/structs.go#L10085) |
| `Equal` | `a *Affinity` | `o *Affinity` | `bool` | [L10116](file:///d:/claude/nomad/nomad/structs/structs.go#L10116) |
| `Copy` | `a *Affinity` | `` | `*Affinity` | [L10133](file:///d:/claude/nomad/nomad/structs/structs.go#L10133) |
| `String` | `a *Affinity` | `` | `string` | [L10145](file:///d:/claude/nomad/nomad/structs/structs.go#L10145) |
| `Validate` | `a *Affinity` | `` | `error` | [L10149](file:///d:/claude/nomad/nomad/structs/structs.go#L10149) |
| `DiffID` | `a *Affinity` | `` | `string` | [L10199](file:///d:/claude/nomad/nomad/structs/structs.go#L10199) |
| `Equal` | `s *Spread` | `o *Spread` | `bool` | [L10219](file:///d:/claude/nomad/nomad/structs/structs.go#L10219) |
| `Equal` | `xs *Affinities` | `ys *Affinities` | `bool` | [L10237](file:///d:/claude/nomad/nomad/structs/structs.go#L10237) |
| `Copy` | `s *Spread` | `` | `*Spread` | [L10259](file:///d:/claude/nomad/nomad/structs/structs.go#L10259) |
| `String` | `s *Spread` | `` | `string` | [L10270](file:///d:/claude/nomad/nomad/structs/structs.go#L10270) |
| `Validate` | `s *Spread` | `` | `error` | [L10278](file:///d:/claude/nomad/nomad/structs/structs.go#L10278) |
| `Copy` | `s *SpreadTarget` | `` | `*SpreadTarget` | [L10320](file:///d:/claude/nomad/nomad/structs/structs.go#L10320) |
| `String` | `s *SpreadTarget` | `` | `string` | [L10330](file:///d:/claude/nomad/nomad/structs/structs.go#L10330) |
| `Equal` | `s *SpreadTarget` | `o *SpreadTarget` | `bool` | [L10338](file:///d:/claude/nomad/nomad/structs/structs.go#L10338) |
| `DefaultEphemeralDisk` | - | `` | `*EphemeralDisk` | [L10365](file:///d:/claude/nomad/nomad/structs/structs.go#L10365) |
| `Equal` | `d *EphemeralDisk` | `o *EphemeralDisk` | `bool` | [L10371](file:///d:/claude/nomad/nomad/structs/structs.go#L10371) |
| `Validate` | `d *EphemeralDisk` | `` | `error` | [L10387](file:///d:/claude/nomad/nomad/structs/structs.go#L10387) |
| `Copy` | `d *EphemeralDisk` | `` | `*EphemeralDisk` | [L10395](file:///d:/claude/nomad/nomad/structs/structs.go#L10395) |
| `IdentityName` | `v *Vault` | `` | `string` | [L10454](file:///d:/claude/nomad/nomad/structs/structs.go#L10454) |
| `Equal` | `v *Vault` | `o *Vault` | `bool` | [L10458](file:///d:/claude/nomad/nomad/structs/structs.go#L10458) |
| `Copy` | `v *Vault` | `` | `*Vault` | [L10484](file:///d:/claude/nomad/nomad/structs/structs.go#L10484) |
| `Canonicalize` | `v *Vault` | `` | `` | [L10494](file:///d:/claude/nomad/nomad/structs/structs.go#L10494) |
| `Validate` | `v *Vault` | `` | `error` | [L10508](file:///d:/claude/nomad/nomad/structs/structs.go#L10508) |
| `Equal` | `s *Secret` | `o *Secret` | `bool` | [L10536](file:///d:/claude/nomad/nomad/structs/structs.go#L10536) |
| `Copy` | `s *Secret` | `` | `*Secret` | [L10557](file:///d:/claude/nomad/nomad/structs/structs.go#L10557) |
| `Validate` | `s *Secret` | `` | `error` | [L10578](file:///d:/claude/nomad/nomad/structs/structs.go#L10578) |
| `Canonicalize` | `s *Secret` | `` | `` | [L10614](file:///d:/claude/nomad/nomad/structs/structs.go#L10614) |
| `Copy` | `rt *RescheduleTracker` | `` | `*RescheduleTracker` | [L10640](file:///d:/claude/nomad/nomad/structs/structs.go#L10640) |
| `RescheduleEligible` | `rt *RescheduleTracker` | `reschedulePolicy *ReschedulePolicy, failTime time.Time` | `bool` | [L10654](file:///d:/claude/nomad/nomad/structs/structs.go#L10654) |
| `rescheduleInfo` | `rt *RescheduleTracker` | `reschedulePolicy *ReschedulePolicy, failTime time.Time` | `int, int` | [L10674](file:///d:/claude/nomad/nomad/structs/structs.go#L10674) |
| `NewRescheduleEvent` | - | `rescheduleTime int64, prevAllocID string, prevNodeID string, delay time.Duration` | `*RescheduleEvent` | [L10709](file:///d:/claude/nomad/nomad/structs/structs.go#L10709) |
| `Copy` | `re *RescheduleEvent` | `` | `*RescheduleEvent` | [L10716](file:///d:/claude/nomad/nomad/structs/structs.go#L10716) |
| `Copy` | `s *NodeScoreMeta` | `` | `*NodeScoreMeta` | [L10733](file:///d:/claude/nomad/nomad/structs/structs.go#L10733) |
| `String` | `s *NodeScoreMeta` | `` | `string` | [L10742](file:///d:/claude/nomad/nomad/structs/structs.go#L10742) |
| `Score` | `s *NodeScoreMeta` | `` | `float64` | [L10746](file:///d:/claude/nomad/nomad/structs/structs.go#L10746) |
| `Data` | `s *NodeScoreMeta` | `` | `interface{}` | [L10750](file:///d:/claude/nomad/nomad/structs/structs.go#L10750) |
| `GoString` | `d *DesiredUpdates` | `` | `string` | [L10771](file:///d:/claude/nomad/nomad/structs/structs.go#L10771) |
| `Decode` | - | `buf []byte, out interface{}` | `error` | [L10796](file:///d:/claude/nomad/nomad/structs/structs.go#L10796) |
| `Encode` | - | `t MessageType, msg interface{}` | `[]byte, error` | [L10801](file:///d:/claude/nomad/nomad/structs/structs.go#L10801) |
| `NewRecoverableError` | - | `e error, recoverable bool` | `error` | [L10831](file:///d:/claude/nomad/nomad/structs/structs.go#L10831) |
| `WrapRecoverable` | - | `msg string, err error` | `error` | [L10846](file:///d:/claude/nomad/nomad/structs/structs.go#L10846) |
| `Error` | `r *RecoverableError` | `` | `string` | [L10850](file:///d:/claude/nomad/nomad/structs/structs.go#L10850) |
| `IsRecoverable` | `r *RecoverableError` | `` | `bool` | [L10854](file:///d:/claude/nomad/nomad/structs/structs.go#L10854) |
| `IsUnrecoverable` | `r *RecoverableError` | `` | `bool` | [L10858](file:///d:/claude/nomad/nomad/structs/structs.go#L10858) |
| `Unwrap` | `r *RecoverableError` | `` | `error` | [L10862](file:///d:/claude/nomad/nomad/structs/structs.go#L10862) |
| `IsRecoverable` | - | `e error` | `bool` | [L10875](file:///d:/claude/nomad/nomad/structs/structs.go#L10875) |
| `NewWrappedServerError` | - | `e error` | `error` | [L10889](file:///d:/claude/nomad/nomad/structs/structs.go#L10889) |
| `IsRecoverable` | `r *WrappedServerError` | `` | `bool` | [L10895](file:///d:/claude/nomad/nomad/structs/structs.go#L10895) |
| `Error` | `r *WrappedServerError` | `` | `string` | [L10899](file:///d:/claude/nomad/nomad/structs/structs.go#L10899) |
| `IsServerSide` | `r *WrappedServerError` | `` | `bool` | [L10903](file:///d:/claude/nomad/nomad/structs/structs.go#L10903) |
| `IsServerSide` | - | `e error` | `bool` | [L10916](file:///d:/claude/nomad/nomad/structs/structs.go#L10916) |
| `NewRpcError` | - | `err error, code *int64` | `*RpcError` | [L10929](file:///d:/claude/nomad/nomad/structs/structs.go#L10929) |
| `Error` | `r *RpcError` | `` | `string` | [L10936](file:///d:/claude/nomad/nomad/structs/structs.go#L10936) |

## 5. 核心方法详解

### NewNamespacedID()

**签名**：`func NewNamespacedID(id string, ns string) NamespacedID`

**位置**：[L239](file:///d:/claude/nomad/nomad/structs/structs.go#L239)

**中文说明**：创建并返回一个新的 NamespacedID 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | `string` | 唯一标识符 |
| `ns` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `NamespacedID` | — |

### Validate()

**签名**：`func (r *JobScaleRequest) Validate() error`

**位置**：[L878](file:///d:/claude/nomad/nomad/structs/structs.go#L878)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Copy()

**签名**：`func (ne *NodeEvent) Copy() *NodeEvent`

**位置**：[L1819](file:///d:/claude/nomad/nomad/structs/structs.go#L1819)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NodeEvent` | — |

### NewNodeEvent()

**签名**：`func NewNodeEvent() *NodeEvent`

**位置**：[L1828](file:///d:/claude/nomad/nomad/structs/structs.go#L1828)

**中文说明**：创建并返回一个新的 NodeEvent 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NodeEvent` | — |

### Copy()

**签名**：`func (d *DrainStrategy) Copy() *DrainStrategy`

**位置**：[L1921](file:///d:/claude/nomad/nomad/structs/structs.go#L1921)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DrainStrategy` | — |

### Copy()

**签名**：`func (m *DrainMetadata) Copy() *DrainMetadata`

**位置**：[L2003](file:///d:/claude/nomad/nomad/structs/structs.go#L2003)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DrainMetadata` | — |

### Copy()

**签名**：`func (n *Node) Copy() *Node`

**位置**：[L2226](file:///d:/claude/nomad/nomad/structs/structs.go#L2226)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Node` | — |

### Validate()

**签名**：`func (r *Resources) Validate() error`

**位置**：[L2419](file:///d:/claude/nomad/nomad/structs/structs.go#L2419)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Copy()

**签名**：`func (d *ResourceDevices) Copy() ResourceDevices`

**位置**：[L2532](file:///d:/claude/nomad/nomad/structs/structs.go#L2532)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `ResourceDevices` | — |

### Copy()

**签名**：`func (r *Resources) Copy() *Resources`

**位置**：[L2606](file:///d:/claude/nomad/nomad/structs/structs.go#L2606)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Resources` | — |

### Copy()

**签名**：`func (n *NodeNetworkResource) Copy() *NodeNetworkResource`

**位置**：[L2698](file:///d:/claude/nomad/nomad/structs/structs.go#L2698)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NodeNetworkResource` | — |

### Validate()

**签名**：`func (n *NodeNetworkAF) Validate() error`

**位置**：[L2731](file:///d:/claude/nomad/nomad/structs/structs.go#L2731)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

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
- **IO 操作**：涉及文件或数据流的读写操作
- **加密安全**：使用 Go crypto 标准库实现加密、签名或 TLS 通信
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **对象池模式**：实现对象池，复用资源减少分配开销
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [structs_test.go](file:///d:/claude/nomad/nomad/structs/structs_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

