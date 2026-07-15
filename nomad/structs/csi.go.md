# csi.go 代码说明文档

> 文件路径：[nomad/structs/csi.go](file:///d:/claude/nomad/nomad/structs/csi.go)
> 总行数：1654 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 52 个方法/函数。

## 2. 类型定义

### CSIPluginType

**定义位置**：[L33](file:///d:/claude/nomad/nomad/structs/csi.go#L33)

**中文说明**：CSIPluginType 与插件（Plugin）相关，实现可扩展的功能模块。

**类型定义**：`type CSIPluginType string`

### TaskCSIPluginConfig

**定义位置**：[L63](file:///d:/claude/nomad/nomad/structs/csi.go#L63)

**中文说明**：TaskCSIPluginConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type TaskCSIPluginConfig struct {
	ID string
	Type CSIPluginType
	MountDir string
	StagePublishBaseDir string
	HealthTimeout time.Duration `mapstructure:"health_timeout" hcl:"health_timeout,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Type` | `CSIPluginType` | 类型 |
| `MountDir` | `string` | 字符串 |
| `StagePublishBaseDir` | `string` | 字符串 |
| `HealthTimeout` | `time.Duration `mapstructure:"health_timeout" hcl:"health_timeout,optional"`` | 时间间隔 |

**关联方法**（2 个）：`Equal`, `Copy`

### CSIVolumeCapability

**定义位置**：[L119](file:///d:/claude/nomad/nomad/structs/csi.go#L119)

**中文说明**：CSIVolumeCapability 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type CSIVolumeCapability struct {
	AttachmentMode VolumeAttachmentMode
	AccessMode VolumeAccessMode
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AttachmentMode` | `VolumeAttachmentMode` | — |
| `AccessMode` | `VolumeAccessMode` | — |

### CSIMountOptions

**定义位置**：[L143](file:///d:/claude/nomad/nomad/structs/csi.go#L143)

**中文说明**：CSIMountOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type CSIMountOptions struct {
	FSType string
	MountFlags []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `FSType` | `string` | 字符串 |
| `MountFlags` | `[]string` | 列表 |

**关联方法**（6 个）：`Copy`, `Merge`, `Equal`, `String`, `GoString`, `Sanitize`

### CSISecrets

**定义位置**：[L218](file:///d:/claude/nomad/nomad/structs/csi.go#L218)

**中文说明**：CSISecrets 与密钥（Secret）相关，管理敏感数据。

**类型定义**：`type CSISecrets map[string]string`

**关联方法**（2 个）：`String`, `GoString`

### CSIVolumeClaim

**定义位置**：[L237](file:///d:/claude/nomad/nomad/structs/csi.go#L237)

**中文说明**：CSIVolumeClaim 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type CSIVolumeClaim struct {
	AllocationID string
	NodeID string
	ExternalNodeID string
	Mode CSIVolumeClaimMode
	AccessMode VolumeAccessMode
	AttachmentMode VolumeAttachmentMode
	State CSIVolumeClaimState
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocationID` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `ExternalNodeID` | `string` | 字符串 |
| `Mode` | `CSIVolumeClaimMode` | — |
| `AccessMode` | `VolumeAccessMode` | — |
| `AttachmentMode` | `VolumeAttachmentMode` | — |
| `State` | `CSIVolumeClaimState` | 状态 |

### CSIVolumeClaimState

**定义位置**：[L247](file:///d:/claude/nomad/nomad/structs/csi.go#L247)

**中文说明**：CSIVolumeClaimState 与卷（Volume）相关，管理持久化存储。

**类型定义**：`type CSIVolumeClaimState int`

### CSIVolume

**定义位置**：[L258](file:///d:/claude/nomad/nomad/structs/csi.go#L258)

**中文说明**：CSIVolume 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type CSIVolume struct {
	ID string
	Name string
	ExternalID string
	Namespace string
	RequestedTopologies *CSITopologyRequest
	Topologies []*CSITopology
	AccessMode VolumeAccessMode
	AttachmentMode VolumeAttachmentMode
	MountOptions *CSIMountOptions
	Secrets CSISecrets
	Parameters map[string]string
	Context map[string]string
	Capacity int64
	RequestedCapacityMin int64
	RequestedCapacityMax int64
	RequestedCapabilities []*CSIVolumeCapability
	CloneID string
	SnapshotID string
	ReadAllocs map[string]*Allocation
	WriteAllocs map[string]*Allocation
	ReadClaims map[string]*CSIVolumeClaim `json:"-"`
	WriteClaims map[string]*CSIVolumeClaim `json:"-"`
	PastClaims map[string]*CSIVolumeClaim `json:"-"`
	Schedulable bool
	PluginID string
	Provider string
	ProviderVersion string
	ControllerRequired bool
	ControllersHealthy int
	ControllersExpected int
	NodesHealthy int
	NodesExpected int
	ResourceExhausted time.Time
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
| `Name` | `string` | 名称 |
| `ExternalID` | `string` | 字符串 |
| `Namespace` | `string` | 命名空间 |
| `RequestedTopologies` | `*CSITopologyRequest` | — |
| `Topologies` | `[]*CSITopology` | 列表 |
| `AccessMode` | `VolumeAccessMode` | — |
| `AttachmentMode` | `VolumeAttachmentMode` | — |
| `MountOptions` | `*CSIMountOptions` | — |
| `Secrets` | `CSISecrets` | — |
| `Parameters` | `map[string]string` | 参数 |
| `Context` | `map[string]string` | 上下文，用于控制请求的生命周期 |
| `Capacity` | `int64` | — |
| `RequestedCapacityMin` | `int64` | — |
| `RequestedCapacityMax` | `int64` | — |
| `RequestedCapabilities` | `[]*CSIVolumeCapability` | 列表 |
| `CloneID` | `string` | 字符串 |
| `SnapshotID` | `string` | 字符串 |
| `ReadAllocs` | `map[string]*Allocation` | 映射表 |
| `WriteAllocs` | `map[string]*Allocation` | 映射表 |
| `ReadClaims` | `map[string]*CSIVolumeClaim `json:"-"`` | 映射表 |
| `WriteClaims` | `map[string]*CSIVolumeClaim `json:"-"`` | 映射表 |
| `PastClaims` | `map[string]*CSIVolumeClaim `json:"-"`` | 映射表 |
| `Schedulable` | `bool` | 布尔值 |
| `PluginID` | `string` | 字符串 |
| `Provider` | `string` | 字符串 |
| `ProviderVersion` | `string` | 字符串 |
| `ControllerRequired` | `bool` | 布尔值 |
| `ControllersHealthy` | `int` | — |
| `ControllersExpected` | `int` | — |
| `NodesHealthy` | `int` | — |
| `NodesExpected` | `int` | — |
| `ResourceExhausted` | `time.Time` | 时间点 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyTime` | `int64` | — |

**关联方法**（21 个）：`GetID`, `GetNamespace`, `GetCreateIndex`, `newStructs`, `RemoteID`, `Stub`, `ReadSchedulable`, `WriteSchedulable`, `HasFreeReadClaims`, `HasFreeWriteClaims`, `InUse`, `Copy`, `Sanitize`, `Claim`, `claimRead`, `claimWrite`, `setModesFromClaim`, `claimRelease`, `Equal`, `Validate`, `Merge`

### CSIVolListStub

**定义位置**：[L350](file:///d:/claude/nomad/nomad/structs/csi.go#L350)

**中文说明**：CSIVolListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type CSIVolListStub struct {
	ID string
	Namespace string
	Name string
	ExternalID string
	Topologies []*CSITopology
	AccessMode VolumeAccessMode
	AttachmentMode VolumeAttachmentMode
	CurrentReaders int
	CurrentWriters int
	Schedulable bool
	PluginID string
	Provider string
	ControllerRequired bool
	ControllersHealthy int
	ControllersExpected int
	NodesHealthy int
	NodesExpected int
	ResourceExhausted time.Time
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
| `Namespace` | `string` | 命名空间 |
| `Name` | `string` | 名称 |
| `ExternalID` | `string` | 字符串 |
| `Topologies` | `[]*CSITopology` | 列表 |
| `AccessMode` | `VolumeAccessMode` | — |
| `AttachmentMode` | `VolumeAttachmentMode` | — |
| `CurrentReaders` | `int` | — |
| `CurrentWriters` | `int` | — |
| `Schedulable` | `bool` | 布尔值 |
| `PluginID` | `string` | 字符串 |
| `Provider` | `string` | 字符串 |
| `ControllerRequired` | `bool` | 布尔值 |
| `ControllersHealthy` | `int` | — |
| `ControllersExpected` | `int` | — |
| `NodesHealthy` | `int` | — |
| `NodesExpected` | `int` | — |
| `ResourceExhausted` | `time.Time` | 时间点 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyTime` | `int64` | — |

### CSIVolumeRegisterRequest

**定义位置**：[L882](file:///d:/claude/nomad/nomad/structs/csi.go#L882)

**中文说明**：CSIVolumeRegisterRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeRegisterRequest struct {
	Volumes []*CSIVolume
	Timestamp int64
	PolicyOverride bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volumes` | `[]*CSIVolume` | 列表 |
| `Timestamp` | `int64` | 时间戳 |
| `PolicyOverride` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### CSIVolumeRegisterResponse

**定义位置**：[L893](file:///d:/claude/nomad/nomad/structs/csi.go#L893)

**中文说明**：CSIVolumeRegisterResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIVolumeRegisterResponse struct {
	Volumes []*CSIVolume
	Warnings string
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volumes` | `[]*CSIVolume` | 列表 |
| `Warnings` | `string` | 字符串 |
| `QueryMeta` | `QueryMeta` | — |

### CSIVolumeDeregisterRequest

**定义位置**：[L901](file:///d:/claude/nomad/nomad/structs/csi.go#L901)

**中文说明**：CSIVolumeDeregisterRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeDeregisterRequest struct {
	VolumeIDs []string
	Force bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VolumeIDs` | `[]string` | 列表 |
| `Force` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### CSIVolumeDeregisterResponse

**定义位置**：[L907](file:///d:/claude/nomad/nomad/structs/csi.go#L907)

**中文说明**：CSIVolumeDeregisterResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIVolumeDeregisterResponse struct {
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryMeta` | `QueryMeta` | — |

### CSIVolumeCreateRequest

**定义位置**：[L911](file:///d:/claude/nomad/nomad/structs/csi.go#L911)

**中文说明**：CSIVolumeCreateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeCreateRequest struct {
	Volumes []*CSIVolume
	Timestamp int64
	PolicyOverride bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volumes` | `[]*CSIVolume` | 列表 |
| `Timestamp` | `int64` | 时间戳 |
| `PolicyOverride` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### CSIVolumeCreateResponse

**定义位置**：[L922](file:///d:/claude/nomad/nomad/structs/csi.go#L922)

**中文说明**：CSIVolumeCreateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIVolumeCreateResponse struct {
	Volumes []*CSIVolume
	Warnings string
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volumes` | `[]*CSIVolume` | 列表 |
| `Warnings` | `string` | 字符串 |
| `QueryMeta` | `QueryMeta` | — |

### CSIVolumeDeleteRequest

**定义位置**：[L930](file:///d:/claude/nomad/nomad/structs/csi.go#L930)

**中文说明**：CSIVolumeDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeDeleteRequest struct {
	VolumeIDs []string
	Secrets CSISecrets
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VolumeIDs` | `[]string` | 列表 |
| `Secrets` | `CSISecrets` | — |
| `WriteRequest` | `WriteRequest` | — |

### CSIVolumeDeleteResponse

**定义位置**：[L936](file:///d:/claude/nomad/nomad/structs/csi.go#L936)

**中文说明**：CSIVolumeDeleteResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIVolumeDeleteResponse struct {
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryMeta` | `QueryMeta` | — |

### CSIVolumeExpandRequest

**定义位置**：[L940](file:///d:/claude/nomad/nomad/structs/csi.go#L940)

**中文说明**：CSIVolumeExpandRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeExpandRequest struct {
	VolumeID string
	RequestedCapacityMin int64
	RequestedCapacityMax int64
	Secrets CSISecrets
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VolumeID` | `string` | 字符串 |
| `RequestedCapacityMin` | `int64` | — |
| `RequestedCapacityMax` | `int64` | — |
| `Secrets` | `CSISecrets` | — |
| `WriteRequest` | `WriteRequest` | — |

### CSIVolumeExpandResponse

**定义位置**：[L948](file:///d:/claude/nomad/nomad/structs/csi.go#L948)

**中文说明**：CSIVolumeExpandResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIVolumeExpandResponse struct {
	CapacityBytes int64
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CapacityBytes` | `int64` | — |
| `QueryMeta` | `QueryMeta` | — |

### CSIVolumeClaimMode

**定义位置**：[L953](file:///d:/claude/nomad/nomad/structs/csi.go#L953)

**中文说明**：CSIVolumeClaimMode 与卷（Volume）相关，管理持久化存储。

**类型定义**：`type CSIVolumeClaimMode int`

### CSIVolumeClaimBatchRequest

**定义位置**：[L965](file:///d:/claude/nomad/nomad/structs/csi.go#L965)

**中文说明**：CSIVolumeClaimBatchRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeClaimBatchRequest struct {
	Claims []CSIVolumeClaimRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Claims` | `[]CSIVolumeClaimRequest` | 列表 |

### CSIVolumeClaimRequest

**定义位置**：[L969](file:///d:/claude/nomad/nomad/structs/csi.go#L969)

**中文说明**：CSIVolumeClaimRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeClaimRequest struct {
	VolumeID string
	AllocationID string
	NodeID string
	ExternalNodeID string
	Claim CSIVolumeClaimMode
	AccessMode VolumeAccessMode
	AttachmentMode VolumeAttachmentMode
	State CSIVolumeClaimState
	Timestamp int64
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VolumeID` | `string` | 字符串 |
| `AllocationID` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `ExternalNodeID` | `string` | 字符串 |
| `Claim` | `CSIVolumeClaimMode` | — |
| `AccessMode` | `VolumeAccessMode` | — |
| `AttachmentMode` | `VolumeAttachmentMode` | — |
| `State` | `CSIVolumeClaimState` | 状态 |
| `Timestamp` | `int64` | 时间戳 |
| `WriteRequest` | `WriteRequest` | — |

**关联方法**（1 个）：`ToClaim`

### CSIVolumeClaimResponse

**定义位置**：[L994](file:///d:/claude/nomad/nomad/structs/csi.go#L994)

**中文说明**：CSIVolumeClaimResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIVolumeClaimResponse struct {
	PublishContext map[string]string
	Volume *CSIVolume
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PublishContext` | `map[string]string` | 映射表 |
| `Volume` | `*CSIVolume` | — |
| `QueryMeta` | `QueryMeta` | — |

### CSIVolumeListRequest

**定义位置**：[L1017](file:///d:/claude/nomad/nomad/structs/csi.go#L1017)

**中文说明**：CSIVolumeListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeListRequest struct {
	PluginID string
	NodeID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PluginID` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### CSIVolumeListResponse

**定义位置**：[L1023](file:///d:/claude/nomad/nomad/structs/csi.go#L1023)

**中文说明**：CSIVolumeListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIVolumeListResponse struct {
	Volumes []*CSIVolListStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volumes` | `[]*CSIVolListStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### CSIVolumeExternalListRequest

**定义位置**：[L1032](file:///d:/claude/nomad/nomad/structs/csi.go#L1032)

**中文说明**：CSIVolumeExternalListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeExternalListRequest struct {
	PluginID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PluginID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### CSIVolumeExternalListResponse

**定义位置**：[L1037](file:///d:/claude/nomad/nomad/structs/csi.go#L1037)

**中文说明**：CSIVolumeExternalListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIVolumeExternalListResponse struct {
	Volumes []*CSIVolumeExternalStub
	NextToken string
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volumes` | `[]*CSIVolumeExternalStub` | 列表 |
| `NextToken` | `string` | 字符串 |
| `QueryMeta` | `QueryMeta` | — |

### CSIVolumeExternalStub

**定义位置**：[L1045](file:///d:/claude/nomad/nomad/structs/csi.go#L1045)

**中文说明**：CSIVolumeExternalStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type CSIVolumeExternalStub struct {
	ExternalID string
	CapacityBytes int64
	VolumeContext map[string]string
	CloneID string
	SnapshotID string
	PublishedExternalNodeIDs []string
	IsAbnormal bool
	Status string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalID` | `string` | 字符串 |
| `CapacityBytes` | `int64` | — |
| `VolumeContext` | `map[string]string` | 映射表 |
| `CloneID` | `string` | 字符串 |
| `SnapshotID` | `string` | 字符串 |
| `PublishedExternalNodeIDs` | `[]string` | 列表 |
| `IsAbnormal` | `bool` | 布尔值 |
| `Status` | `string` | 状态 |

### CSIVolumeGetRequest

**定义位置**：[L1057](file:///d:/claude/nomad/nomad/structs/csi.go#L1057)

**中文说明**：CSIVolumeGetRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeGetRequest struct {
	ID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `QueryOptions` | `QueryOptions` | — |

### CSIVolumeGetResponse

**定义位置**：[L1062](file:///d:/claude/nomad/nomad/structs/csi.go#L1062)

**中文说明**：CSIVolumeGetResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIVolumeGetResponse struct {
	Volume *CSIVolume
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*CSIVolume` | — |
| `QueryMeta` | `QueryMeta` | — |

### CSIVolumeUnpublishRequest

**定义位置**：[L1067](file:///d:/claude/nomad/nomad/structs/csi.go#L1067)

**中文说明**：CSIVolumeUnpublishRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeUnpublishRequest struct {
	VolumeID string
	Claim *CSIVolumeClaim
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VolumeID` | `string` | 字符串 |
| `Claim` | `*CSIVolumeClaim` | — |
| `WriteRequest` | `WriteRequest` | — |

### CSIVolumeUnpublishResponse

**定义位置**：[L1073](file:///d:/claude/nomad/nomad/structs/csi.go#L1073)

**中文说明**：CSIVolumeUnpublishResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIVolumeUnpublishResponse struct {
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryMeta` | `QueryMeta` | — |

### CSISnapshot

**定义位置**：[L1078](file:///d:/claude/nomad/nomad/structs/csi.go#L1078)

**中文说明**：CSISnapshot 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type CSISnapshot struct {
	ID string
	ExternalSourceVolumeID string
	SizeBytes int64
	CreateTime int64
	IsReady bool
	SourceVolumeID string
	PluginID string
	Name string
	Secrets CSISecrets
	Parameters map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `ExternalSourceVolumeID` | `string` | 字符串 |
| `SizeBytes` | `int64` | — |
| `CreateTime` | `int64` | — |
| `IsReady` | `bool` | 布尔值 |
| `SourceVolumeID` | `string` | 字符串 |
| `PluginID` | `string` | 字符串 |
| `Name` | `string` | 名称 |
| `Secrets` | `CSISecrets` | — |
| `Parameters` | `map[string]string` | 参数 |

### CSISnapshotCreateRequest

**定义位置**：[L1097](file:///d:/claude/nomad/nomad/structs/csi.go#L1097)

**中文说明**：CSISnapshotCreateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSISnapshotCreateRequest struct {
	Snapshots []*CSISnapshot
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Snapshots` | `[]*CSISnapshot` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### CSISnapshotCreateResponse

**定义位置**：[L1102](file:///d:/claude/nomad/nomad/structs/csi.go#L1102)

**中文说明**：CSISnapshotCreateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSISnapshotCreateResponse struct {
	Snapshots []*CSISnapshot
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Snapshots` | `[]*CSISnapshot` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### CSISnapshotDeleteRequest

**定义位置**：[L1107](file:///d:/claude/nomad/nomad/structs/csi.go#L1107)

**中文说明**：CSISnapshotDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSISnapshotDeleteRequest struct {
	Snapshots []*CSISnapshot
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Snapshots` | `[]*CSISnapshot` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### CSISnapshotDeleteResponse

**定义位置**：[L1112](file:///d:/claude/nomad/nomad/structs/csi.go#L1112)

**中文说明**：CSISnapshotDeleteResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSISnapshotDeleteResponse struct {
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryMeta` | `QueryMeta` | — |

### CSISnapshotListRequest

**定义位置**：[L1120](file:///d:/claude/nomad/nomad/structs/csi.go#L1120)

**中文说明**：CSISnapshotListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSISnapshotListRequest struct {
	PluginID string
	Secrets CSISecrets
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PluginID` | `string` | 字符串 |
| `Secrets` | `CSISecrets` | — |
| `QueryOptions` | `QueryOptions` | — |

### CSISnapshotListResponse

**定义位置**：[L1126](file:///d:/claude/nomad/nomad/structs/csi.go#L1126)

**中文说明**：CSISnapshotListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSISnapshotListResponse struct {
	Snapshots []*CSISnapshot
	NextToken string
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Snapshots` | `[]*CSISnapshot` | 列表 |
| `NextToken` | `string` | 字符串 |
| `QueryMeta` | `QueryMeta` | — |

### CSIPlugin

**定义位置**：[L1133](file:///d:/claude/nomad/nomad/structs/csi.go#L1133)

**中文说明**：CSIPlugin 与插件（Plugin）相关，实现可扩展的功能模块。

**类型**：struct

```go
type CSIPlugin struct {
	ID string
	Provider string
	Version string
	ControllerRequired bool
	Controllers map[string]*CSIInfo
	Nodes map[string]*CSIInfo
	Allocations []*AllocListStub
	ControllerJobs JobDescriptions
	NodeJobs JobDescriptions
	ControllersHealthy int
	ControllersExpected int
	NodesHealthy int
	NodesExpected int
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
| `Provider` | `string` | 字符串 |
| `Version` | `string` | 版本号 |
| `ControllerRequired` | `bool` | 布尔值 |
| `Controllers` | `map[string]*CSIInfo` | 映射表 |
| `Nodes` | `map[string]*CSIInfo` | 映射表 |
| `Allocations` | `[]*AllocListStub` | 列表 |
| `ControllerJobs` | `JobDescriptions` | — |
| `NodeJobs` | `JobDescriptions` | — |
| `ControllersHealthy` | `int` | — |
| `ControllersExpected` | `int` | — |
| `NodesHealthy` | `int` | — |
| `NodesExpected` | `int` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyTime` | `int64` | — |

**关联方法**（13 个）：`newStructs`, `Copy`, `HasControllerCapability`, `HasNodeCapability`, `AddPlugin`, `DeleteNode`, `DeleteNodeForType`, `DeleteAlloc`, `AddJob`, `DeleteJob`, `UpdateExpectedWithJob`, `Stub`, `IsEmpty`

### CSIControllerCapability

**定义位置**：[L1211](file:///d:/claude/nomad/nomad/structs/csi.go#L1211)

**类型定义**：`type CSIControllerCapability byte`

### CSINodeCapability

**定义位置**：[L1263](file:///d:/claude/nomad/nomad/structs/csi.go#L1263)

**中文说明**：CSINodeCapability 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型定义**：`type CSINodeCapability byte`

### JobDescription

**定义位置**：[L1536](file:///d:/claude/nomad/nomad/structs/csi.go#L1536)

**中文说明**：JobDescription 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobDescription struct {
	Namespace string
	ID string
	Expected int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string` | 命名空间 |
| `ID` | `string` | 唯一标识符 |
| `Expected` | `int` | — |

### JobNamespacedDescriptions

**定义位置**：[L1543](file:///d:/claude/nomad/nomad/structs/csi.go#L1543)

**中文说明**：JobNamespacedDescriptions 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型定义**：`type JobNamespacedDescriptions map[string]JobDescription`

**关联方法**（1 个）：`Copy`

### JobDescriptions

**定义位置**：[L1554](file:///d:/claude/nomad/nomad/structs/csi.go#L1554)

**中文说明**：JobDescriptions 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型定义**：`type JobDescriptions map[string]JobNamespacedDescriptions`

**关联方法**（3 个）：`Add`, `Count`, `Delete`

### CSIPluginListStub

**定义位置**：[L1593](file:///d:/claude/nomad/nomad/structs/csi.go#L1593)

**中文说明**：CSIPluginListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type CSIPluginListStub struct {
	ID string
	Provider string
	ControllerRequired bool
	ControllersHealthy int
	ControllersExpected int
	NodesHealthy int
	NodesExpected int
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Provider` | `string` | 字符串 |
| `ControllerRequired` | `bool` | 布尔值 |
| `ControllersHealthy` | `int` | — |
| `ControllersExpected` | `int` | — |
| `NodesHealthy` | `int` | — |
| `NodesExpected` | `int` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### CSIPluginListRequest

**定义位置**：[L1627](file:///d:/claude/nomad/nomad/structs/csi.go#L1627)

**中文说明**：CSIPluginListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIPluginListRequest struct {
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |

### CSIPluginListResponse

**定义位置**：[L1631](file:///d:/claude/nomad/nomad/structs/csi.go#L1631)

**中文说明**：CSIPluginListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIPluginListResponse struct {
	Plugins []*CSIPluginListStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Plugins` | `[]*CSIPluginListStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### CSIPluginGetRequest

**定义位置**：[L1636](file:///d:/claude/nomad/nomad/structs/csi.go#L1636)

**中文说明**：CSIPluginGetRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIPluginGetRequest struct {
	ID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `QueryOptions` | `QueryOptions` | — |

### CSIPluginGetResponse

**定义位置**：[L1641](file:///d:/claude/nomad/nomad/structs/csi.go#L1641)

**中文说明**：CSIPluginGetResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIPluginGetResponse struct {
	Plugin *CSIPlugin
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Plugin` | `*CSIPlugin` | — |
| `QueryMeta` | `QueryMeta` | — |

### CSIPluginDeleteRequest

**定义位置**：[L1646](file:///d:/claude/nomad/nomad/structs/csi.go#L1646)

**中文说明**：CSIPluginDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIPluginDeleteRequest struct {
	ID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `QueryOptions` | `QueryOptions` | — |

### CSIPluginDeleteResponse

**定义位置**：[L1651](file:///d:/claude/nomad/nomad/structs/csi.go#L1651)

**中文说明**：CSIPluginDeleteResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIPluginDeleteResponse struct {
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryMeta` | `QueryMeta` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `CSISocketName` | `—` | `"csi.sock"` | — |
| `CSIIntermediaryDirname` | `—` | `"volumes"` | — |
| `VolumeTypeCSI` | `—` | `"csi"` | — |
| `CSIPluginTypeNode` | `CSIPluginType` | `"node"` | — |
| `CSIPluginTypeController` | `CSIPluginType` | `"controller"` | — |
| `CSIPluginTypeMonolith` | `CSIPluginType` | `"monolith"` | — |
| `CSIVolumeAttachmentModeUnknown` | `VolumeAttachmentMode` | `""` | — |
| `CSIVolumeAttachmentModeBlockDevice` | `VolumeAttachmentMode` | `"block-device"` | — |
| `CSIVolumeAttachmentModeFilesystem` | `VolumeAttachmentMode` | `"file-system"` | — |
| `CSIVolumeAccessModeUnknown` | `VolumeAccessMode` | `""` | — |
| `CSIVolumeAccessModeSingleNodeReader` | `VolumeAccessMode` | `"single-node-reader-only"` | — |
| `CSIVolumeAccessModeSingleNodeWriter` | `VolumeAccessMode` | `"single-node-writer"` | — |
| `CSIVolumeAccessModeMultiNodeReader` | `VolumeAccessMode` | `"multi-node-reader-only"` | — |
| `CSIVolumeAccessModeMultiNodeSingleWriter` | `VolumeAccessMode` | `"multi-node-single-writer"` | — |
| `CSIVolumeAccessModeMultiNodeMultiWriter` | `VolumeAccessMode` | `"multi-node-multi-writer"` | — |
| `CSIVolumeClaimStateTaken` | `CSIVolumeClaimState` | `iota` | — |
| `CSIVolumeClaimStateNodeDetached` | `—` | `` | — |
| `CSIVolumeClaimStateControllerDetached` | `—` | `` | — |
| `CSIVolumeClaimStateReadyToFree` | `—` | `` | — |
| `CSIVolumeClaimStateUnpublishing` | `—` | `` | — |
| `CSIVolumeClaimRead` | `CSIVolumeClaimMode` | `iota` | — |
| `CSIVolumeClaimWrite` | `—` | `` | — |
| `CSIVolumeClaimGC` | `—` | `` | — |
| `CSIControllerSupportsCreateDelete` | `CSIControllerCapability` | `0` | — |
| `CSIControllerSupportsAttachDetach` | `CSIControllerCapability` | `1` | — |
| `CSIControllerSupportsListVolumes` | `CSIControllerCapability` | `2` | — |
| `CSIControllerSupportsGetCapacity` | `CSIControllerCapability` | `3` | — |
| `CSIControllerSupportsCreateDeleteSnapshot` | `CSIControllerCapability` | `4` | — |
| `CSIControllerSupportsListSnapshots` | `CSIControllerCapability` | `5` | — |
| `CSIControllerSupportsClone` | `CSIControllerCapability` | `6` | — |
| `CSIControllerSupportsReadOnlyAttach` | `CSIControllerCapability` | `7` | — |
| `CSIControllerSupportsExpand` | `CSIControllerCapability` | `8` | — |
| `CSIControllerSupportsListVolumesAttachedNodes` | `CSIControllerCapability` | `9` | — |
| `CSIControllerSupportsCondition` | `CSIControllerCapability` | `10` | — |
| `CSIControllerSupportsGet` | `CSIControllerCapability` | `11` | — |
| `CSINodeSupportsStageVolume` | `CSINodeCapability` | `0` | — |
| `CSINodeSupportsStats` | `CSINodeCapability` | `1` | — |
| `CSINodeSupportsExpand` | `CSINodeCapability` | `2` | — |
| `CSINodeSupportsCondition` | `CSINodeCapability` | `3` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `_` | `fmt.Stringer` | `&CSIMountOptions{...}` | — |
| `_` | `fmt.GoStringer` | `&CSIMountOptions{...}` | — |
| `_` | `fmt.Stringer` | `&CSISecrets{...}` | — |
| `_` | `fmt.GoStringer` | `&CSISecrets{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `CSIPluginTypeIsValid` | - | `pt CSIPluginType` | `bool` | [L51](file:///d:/claude/nomad/nomad/structs/csi.go#L51) |
| `Equal` | `t *TaskCSIPluginConfig` | `o *TaskCSIPluginConfig` | `bool` | [L87](file:///d:/claude/nomad/nomad/structs/csi.go#L87) |
| `Copy` | `t *TaskCSIPluginConfig` | `` | `*TaskCSIPluginConfig` | [L106](file:///d:/claude/nomad/nomad/structs/csi.go#L106) |
| `Copy` | `o *CSIMountOptions` | `` | `*CSIMountOptions` | [L154](file:///d:/claude/nomad/nomad/structs/csi.go#L154) |
| `Merge` | `o *CSIMountOptions` | `p *CSIMountOptions` | `` | [L164](file:///d:/claude/nomad/nomad/structs/csi.go#L164) |
| `Equal` | `o *CSIMountOptions` | `p *CSIMountOptions` | `bool` | [L176](file:///d:/claude/nomad/nomad/structs/csi.go#L176) |
| `String` | `o *CSIMountOptions` | `` | `string` | [L194](file:///d:/claude/nomad/nomad/structs/csi.go#L194) |
| `GoString` | `o *CSIMountOptions` | `` | `string` | [L203](file:///d:/claude/nomad/nomad/structs/csi.go#L203) |
| `Sanitize` | `o *CSIMountOptions` | `` | `*CSIMountOptions` | [L208](file:///d:/claude/nomad/nomad/structs/csi.go#L208) |
| `String` | `s *CSISecrets` | `` | `string` | [L225](file:///d:/claude/nomad/nomad/structs/csi.go#L225) |
| `GoString` | `s *CSISecrets` | `` | `string` | [L233](file:///d:/claude/nomad/nomad/structs/csi.go#L233) |
| `GetID` | `v *CSIVolume` | `` | `string` | [L324](file:///d:/claude/nomad/nomad/structs/csi.go#L324) |
| `GetNamespace` | `v *CSIVolume` | `` | `string` | [L333](file:///d:/claude/nomad/nomad/structs/csi.go#L333) |
| `GetCreateIndex` | `v *CSIVolume` | `` | `uint64` | [L342](file:///d:/claude/nomad/nomad/structs/csi.go#L342) |
| `NewCSIVolume` | - | `volumeID string, index uint64` | `*CSIVolume` | [L379](file:///d:/claude/nomad/nomad/structs/csi.go#L379) |
| `newStructs` | `v *CSIVolume` | `` | `` | [L393](file:///d:/claude/nomad/nomad/structs/csi.go#L393) |
| `RemoteID` | `v *CSIVolume` | `` | `string` | [L407](file:///d:/claude/nomad/nomad/structs/csi.go#L407) |
| `Stub` | `v *CSIVolume` | `` | `*CSIVolListStub` | [L414](file:///d:/claude/nomad/nomad/structs/csi.go#L414) |
| `ReadSchedulable` | `v *CSIVolume` | `` | `bool` | [L444](file:///d:/claude/nomad/nomad/structs/csi.go#L444) |
| `WriteSchedulable` | `v *CSIVolume` | `` | `bool` | [L455](file:///d:/claude/nomad/nomad/structs/csi.go#L455) |
| `HasFreeReadClaims` | `v *CSIVolume` | `` | `bool` | [L482](file:///d:/claude/nomad/nomad/structs/csi.go#L482) |
| `HasFreeWriteClaims` | `v *CSIVolume` | `` | `bool` | [L502](file:///d:/claude/nomad/nomad/structs/csi.go#L502) |
| `InUse` | `v *CSIVolume` | `` | `bool` | [L522](file:///d:/claude/nomad/nomad/structs/csi.go#L522) |
| `Copy` | `v *CSIVolume` | `` | `*CSIVolume` | [L528](file:///d:/claude/nomad/nomad/structs/csi.go#L528) |
| `Sanitize` | `v *CSIVolume` | `` | `*CSIVolume` | [L573](file:///d:/claude/nomad/nomad/structs/csi.go#L573) |
| `Claim` | `v *CSIVolume` | `claim *CSIVolumeClaim, alloc *Allocation` | `error` | [L594](file:///d:/claude/nomad/nomad/structs/csi.go#L594) |
| `claimRead` | `v *CSIVolume` | `claim *CSIVolumeClaim, alloc *Allocation` | `error` | [L626](file:///d:/claude/nomad/nomad/structs/csi.go#L626) |
| `claimWrite` | `v *CSIVolume` | `claim *CSIVolumeClaim, alloc *Allocation` | `error` | [L656](file:///d:/claude/nomad/nomad/structs/csi.go#L656) |
| `setModesFromClaim` | `v *CSIVolume` | `claim *CSIVolumeClaim` | `` | [L690](file:///d:/claude/nomad/nomad/structs/csi.go#L690) |
| `claimRelease` | `v *CSIVolume` | `claim *CSIVolumeClaim` | `error` | [L701](file:///d:/claude/nomad/nomad/structs/csi.go#L701) |
| `Equal` | `v *CSIVolume` | `o *CSIVolume` | `bool` | [L721](file:///d:/claude/nomad/nomad/structs/csi.go#L721) |
| `Validate` | `v *CSIVolume` | `` | `error` | [L752](file:///d:/claude/nomad/nomad/structs/csi.go#L752) |
| `Merge` | `v *CSIVolume` | `other *CSIVolume` | `error` | [L794](file:///d:/claude/nomad/nomad/structs/csi.go#L794) |
| `ToClaim` | `req *CSIVolumeClaimRequest` | `` | `*CSIVolumeClaim` | [L982](file:///d:/claude/nomad/nomad/structs/csi.go#L982) |
| `NewCSIPlugin` | - | `id string, index uint64` | `*CSIPlugin` | [L1166](file:///d:/claude/nomad/nomad/structs/csi.go#L1166) |
| `newStructs` | `p *CSIPlugin` | `` | `` | [L1180](file:///d:/claude/nomad/nomad/structs/csi.go#L1180) |
| `Copy` | `p *CSIPlugin` | `` | `*CSIPlugin` | [L1187](file:///d:/claude/nomad/nomad/structs/csi.go#L1187) |
| `HasControllerCapability` | `p *CSIPlugin` | `cap CSIControllerCapability` | `bool` | [L1281](file:///d:/claude/nomad/nomad/structs/csi.go#L1281) |
| `HasNodeCapability` | `p *CSIPlugin` | `cap CSINodeCapability` | `bool` | [L1320](file:///d:/claude/nomad/nomad/structs/csi.go#L1320) |
| `AddPlugin` | `p *CSIPlugin` | `nodeID string, info *CSIInfo` | `error` | [L1345](file:///d:/claude/nomad/nomad/structs/csi.go#L1345) |
| `DeleteNode` | `p *CSIPlugin` | `nodeID string` | `error` | [L1393](file:///d:/claude/nomad/nomad/structs/csi.go#L1393) |
| `DeleteNodeForType` | `p *CSIPlugin` | `nodeID string, pluginType CSIPluginType` | `error` | [L1399](file:///d:/claude/nomad/nomad/structs/csi.go#L1399) |
| `DeleteAlloc` | `p *CSIPlugin` | `allocID string, nodeID string` | `error` | [L1443](file:///d:/claude/nomad/nomad/structs/csi.go#L1443) |
| `AddJob` | `p *CSIPlugin` | `job *Job, summary *JobSummary` | `` | [L1474](file:///d:/claude/nomad/nomad/structs/csi.go#L1474) |
| `DeleteJob` | `p *CSIPlugin` | `job *Job, summary *JobSummary` | `` | [L1479](file:///d:/claude/nomad/nomad/structs/csi.go#L1479) |
| `UpdateExpectedWithJob` | `p *CSIPlugin` | `job *Job, summary *JobSummary, terminal bool` | `` | [L1485](file:///d:/claude/nomad/nomad/structs/csi.go#L1485) |
| `Copy` | `j *JobNamespacedDescriptions` | `` | `JobNamespacedDescriptions` | [L1545](file:///d:/claude/nomad/nomad/structs/csi.go#L1545) |
| `Add` | `j *JobDescriptions` | `job *Job, expected int` | `` | [L1557](file:///d:/claude/nomad/nomad/structs/csi.go#L1557) |
| `Count` | `j *JobDescriptions` | `` | `int` | [L1572](file:///d:/claude/nomad/nomad/structs/csi.go#L1572) |
| `Delete` | `j *JobDescriptions` | `job *Job` | `` | [L1586](file:///d:/claude/nomad/nomad/structs/csi.go#L1586) |
| `Stub` | `p *CSIPlugin` | `` | `*CSIPluginListStub` | [L1605](file:///d:/claude/nomad/nomad/structs/csi.go#L1605) |
| `IsEmpty` | `p *CSIPlugin` | `` | `bool` | [L1619](file:///d:/claude/nomad/nomad/structs/csi.go#L1619) |

## 5. 核心方法详解

### Copy()

**签名**：`func (t *TaskCSIPluginConfig) Copy() *TaskCSIPluginConfig`

**位置**：[L106](file:///d:/claude/nomad/nomad/structs/csi.go#L106)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*TaskCSIPluginConfig` | — |

### Copy()

**签名**：`func (o *CSIMountOptions) Copy() *CSIMountOptions`

**位置**：[L154](file:///d:/claude/nomad/nomad/structs/csi.go#L154)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*CSIMountOptions` | — |

### NewCSIVolume()

**签名**：`func NewCSIVolume(volumeID string, index uint64) *CSIVolume`

**位置**：[L379](file:///d:/claude/nomad/nomad/structs/csi.go#L379)

**中文说明**：创建并返回一个新的 CSIVolume 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `volumeID` | `string` | 字符串 |
| `index` | `uint64` | 索引 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*CSIVolume` | — |

### Copy()

**签名**：`func (v *CSIVolume) Copy() *CSIVolume`

**位置**：[L528](file:///d:/claude/nomad/nomad/structs/csi.go#L528)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*CSIVolume` | — |

### Validate()

**签名**：`func (v *CSIVolume) Validate() error`

**位置**：[L752](file:///d:/claude/nomad/nomad/structs/csi.go#L752)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### NewCSIPlugin()

**签名**：`func NewCSIPlugin(id string, index uint64) *CSIPlugin`

**位置**：[L1166](file:///d:/claude/nomad/nomad/structs/csi.go#L1166)

**中文说明**：创建并返回一个新的 CSIPlugin 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | `string` | 唯一标识符 |
| `index` | `uint64` | 索引 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*CSIPlugin` | — |

### Copy()

**签名**：`func (p *CSIPlugin) Copy() *CSIPlugin`

**位置**：[L1187](file:///d:/claude/nomad/nomad/structs/csi.go#L1187)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*CSIPlugin` | — |

### Copy()

**签名**：`func (j *JobNamespacedDescriptions) Copy() JobNamespacedDescriptions`

**位置**：[L1545](file:///d:/claude/nomad/nomad/structs/csi.go#L1545)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `JobNamespacedDescriptions` | — |

### Delete()

**签名**：`func (j *JobDescriptions) Delete(job *Job) `

**位置**：[L1586](file:///d:/claude/nomad/nomad/structs/csi.go#L1586)

**中文说明**：删除指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `job` | `*Job` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `slices` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [csi_test.go](file:///d:/claude/nomad/nomad/structs/csi_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

