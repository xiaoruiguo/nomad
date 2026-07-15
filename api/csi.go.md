# csi.go 代码说明文档

> 文件路径：[api/csi.go](file:///d:/claude/nomad/api/csi.go)
> 总行数：659 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `csi.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### CSIVolumes

**定义位置**：[L15](file:///d:/claude/nomad/api/csi.go#L15)

**中文说明**：CSIVolumes 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type CSIVolumes struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（16 个）：`List`, `ListExternal`, `PluginList`, `Info`, `Register`, `RegisterOpts`, `Deregister`, `Create`, `CreateOpts`, `Delete`, `DeleteOpts`, `Detach`, `CreateSnapshot`, `DeleteSnapshot`, `ListSnapshotsOpts`, `ListSnapshots`

### CSIVolumeAttachmentMode

**定义位置**：[L242](file:///d:/claude/nomad/api/csi.go#L242)

**中文说明**：CSIVolumeAttachmentMode 与卷（Volume）相关，管理持久化存储。

**类型定义**：`type CSIVolumeAttachmentMode string`

### CSIVolumeAccessMode

**定义位置**：[L252](file:///d:/claude/nomad/api/csi.go#L252)

**中文说明**：CSIVolumeAccessMode 与卷（Volume）相关，管理持久化存储。

**类型定义**：`type CSIVolumeAccessMode string`

### CSIMountOptions

**定义位置**：[L270](file:///d:/claude/nomad/api/csi.go#L270)

**中文说明**：CSIMountOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type CSIMountOptions struct {
	FSType string `hcl:"fs_type,optional"`
	MountFlags []string `hcl:"mount_flags,optional"`
	ExtraKeysHCL []string `hcl1:",unusedKeys" json:"-"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `FSType` | `string `hcl:"fs_type,optional"`` | 字符串 |
| `MountFlags` | `[]string `hcl:"mount_flags,optional"`` | 列表 |
| `ExtraKeysHCL` | `[]string `hcl1:",unusedKeys" json:"-"`` | 列表 |

**关联方法**（1 个）：`Merge`

### CSISecrets

**定义位置**：[L298](file:///d:/claude/nomad/api/csi.go#L298)

**中文说明**：CSISecrets 与密钥（Secret）相关，管理敏感数据。

**类型定义**：`type CSISecrets map[string]string`

### CSIVolume

**定义位置**：[L323](file:///d:/claude/nomad/api/csi.go#L323)

**中文说明**：CSIVolume 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type CSIVolume struct {
	ID string
	Name string
	ExternalID string `mapstructure:"external_id" hcl:"external_id"`
	Namespace string
	RequestedTopologies *CSITopologyRequest `hcl:"topology_request"`
	Topologies []*CSITopology
	AccessMode CSIVolumeAccessMode `hcl:"access_mode"`
	AttachmentMode CSIVolumeAttachmentMode `hcl:"attachment_mode"`
	MountOptions *CSIMountOptions `hcl:"mount_options"`
	Secrets CSISecrets `mapstructure:"secrets" hcl:"secrets"`
	Parameters map[string]string `mapstructure:"parameters" hcl:"parameters"`
	Context map[string]string `mapstructure:"context" hcl:"context"`
	Capacity int64 `hcl:"-"`
	RequestedCapacityMin int64 `hcl:"capacity_min"`
	RequestedCapacityMax int64 `hcl:"capacity_max"`
	RequestedCapabilities []*CSIVolumeCapability `hcl:"capability"`
	CloneID string `mapstructure:"clone_id" hcl:"clone_id"`
	SnapshotID string `mapstructure:"snapshot_id" hcl:"snapshot_id"`
	ReadAllocs map[string]*Allocation
	WriteAllocs map[string]*Allocation
	Allocations []*AllocationListStub
	Schedulable bool
	PluginID string `mapstructure:"plugin_id" hcl:"plugin_id"`
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
	ExtraKeysHCL []string `hcl1:",unusedKeys" json:"-"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Name` | `string` | 名称 |
| `ExternalID` | `string `mapstructure:"external_id" hcl:"external_id"`` | 字符串 |
| `Namespace` | `string` | 命名空间 |
| `RequestedTopologies` | `*CSITopologyRequest `hcl:"topology_request"`` | — |
| `Topologies` | `[]*CSITopology` | 列表 |
| `AccessMode` | `CSIVolumeAccessMode `hcl:"access_mode"`` | — |
| `AttachmentMode` | `CSIVolumeAttachmentMode `hcl:"attachment_mode"`` | — |
| `MountOptions` | `*CSIMountOptions `hcl:"mount_options"`` | — |
| `Secrets` | `CSISecrets `mapstructure:"secrets" hcl:"secrets"`` | — |
| `Parameters` | `map[string]string `mapstructure:"parameters" hcl:"parameters"`` | 参数 |
| `Context` | `map[string]string `mapstructure:"context" hcl:"context"`` | 上下文，用于控制请求的生命周期 |
| `Capacity` | `int64 `hcl:"-"`` | — |
| `RequestedCapacityMin` | `int64 `hcl:"capacity_min"`` | — |
| `RequestedCapacityMax` | `int64 `hcl:"capacity_max"`` | — |
| `RequestedCapabilities` | `[]*CSIVolumeCapability `hcl:"capability"`` | 列表 |
| `CloneID` | `string `mapstructure:"clone_id" hcl:"clone_id"`` | 字符串 |
| `SnapshotID` | `string `mapstructure:"snapshot_id" hcl:"snapshot_id"`` | 字符串 |
| `ReadAllocs` | `map[string]*Allocation` | 映射表 |
| `WriteAllocs` | `map[string]*Allocation` | 映射表 |
| `Allocations` | `[]*AllocationListStub` | 列表 |
| `Schedulable` | `bool` | 布尔值 |
| `PluginID` | `string `mapstructure:"plugin_id" hcl:"plugin_id"`` | 字符串 |
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
| `ExtraKeysHCL` | `[]string `hcl1:",unusedKeys" json:"-"`` | 列表 |

### CSIVolumeCapability

**定义位置**：[L393](file:///d:/claude/nomad/api/csi.go#L393)

**中文说明**：CSIVolumeCapability 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type CSIVolumeCapability struct {
	AccessMode CSIVolumeAccessMode `mapstructure:"access_mode" hcl:"access_mode"`
	AttachmentMode CSIVolumeAttachmentMode `mapstructure:"attachment_mode" hcl:"attachment_mode"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AccessMode` | `CSIVolumeAccessMode `mapstructure:"access_mode" hcl:"access_mode"`` | — |
| `AttachmentMode` | `CSIVolumeAttachmentMode `mapstructure:"attachment_mode" hcl:"attachment_mode"`` | — |

### CSIVolumeIndexSort

**定义位置**：[L400](file:///d:/claude/nomad/api/csi.go#L400)

**中文说明**：CSIVolumeIndexSort 与卷（Volume）相关，管理持久化存储。

**类型定义**：`type CSIVolumeIndexSort []*CSIVolumeListStub`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### CSIVolumeListStub

**定义位置**：[L415](file:///d:/claude/nomad/api/csi.go#L415)

**中文说明**：CSIVolumeListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type CSIVolumeListStub struct {
	ID string
	Namespace string
	Name string
	ExternalID string
	Topologies []*CSITopology
	AccessMode CSIVolumeAccessMode
	AttachmentMode CSIVolumeAttachmentMode
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
| `AccessMode` | `CSIVolumeAccessMode` | — |
| `AttachmentMode` | `CSIVolumeAttachmentMode` | — |
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

### CSIVolumeListExternalResponse

**定义位置**：[L444](file:///d:/claude/nomad/api/csi.go#L444)

**中文说明**：CSIVolumeListExternalResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type CSIVolumeListExternalResponse struct {
	Volumes []*CSIVolumeExternalStub
	NextToken string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volumes` | `[]*CSIVolumeExternalStub` | 列表 |
| `NextToken` | `string` | 字符串 |

### CSIVolumeExternalStub

**定义位置**：[L451](file:///d:/claude/nomad/api/csi.go#L451)

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

### CSIVolumeExternalStubSort

**定义位置**：[L465](file:///d:/claude/nomad/api/csi.go#L465)

**中文说明**：CSIVolumeExternalStubSort 与卷（Volume）相关，管理持久化存储。

**类型定义**：`type CSIVolumeExternalStubSort []*CSIVolumeExternalStub`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### CSIVolumeCreateRequest

**定义位置**：[L479](file:///d:/claude/nomad/api/csi.go#L479)

**中文说明**：CSIVolumeCreateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeCreateRequest struct {
	Volumes []*CSIVolume
	PolicyOverride bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volumes` | `[]*CSIVolume` | 列表 |
| `PolicyOverride` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### CSIVolumeCreateResponse

**定义位置**：[L488](file:///d:/claude/nomad/api/csi.go#L488)

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

### CSIVolumeRegisterRequest

**定义位置**：[L494](file:///d:/claude/nomad/api/csi.go#L494)

**中文说明**：CSIVolumeRegisterRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeRegisterRequest struct {
	Volumes []*CSIVolume
	PolicyOverride bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volumes` | `[]*CSIVolume` | 列表 |
| `PolicyOverride` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### CSIVolumeRegisterResponse

**定义位置**：[L503](file:///d:/claude/nomad/api/csi.go#L503)

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

**定义位置**：[L509](file:///d:/claude/nomad/api/csi.go#L509)

**中文说明**：CSIVolumeDeregisterRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeDeregisterRequest struct {
	VolumeIDs []string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VolumeIDs` | `[]string` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### CSIVolumeDeleteRequest

**定义位置**：[L514](file:///d:/claude/nomad/api/csi.go#L514)

**中文说明**：CSIVolumeDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSIVolumeDeleteRequest struct {
	ExternalVolumeID string
	Secrets CSISecrets
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalVolumeID` | `string` | 字符串 |
| `Secrets` | `CSISecrets` | — |
| `WriteRequest` | `WriteRequest` | — |

### CSISnapshot

**定义位置**：[L521](file:///d:/claude/nomad/api/csi.go#L521)

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
| `PluginID` | `string` | CSI 插件 ID |
| `Name` | `string` | 名称 |
| `Secrets` | `CSISecrets` | — |
| `Parameters` | `map[string]string` | 参数 |

### CSISnapshotSort

**定义位置**：[L538](file:///d:/claude/nomad/api/csi.go#L538)

**类型定义**：`type CSISnapshotSort []*CSISnapshot`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### CSISnapshotCreateRequest

**定义位置**：[L552](file:///d:/claude/nomad/api/csi.go#L552)

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

**定义位置**：[L557](file:///d:/claude/nomad/api/csi.go#L557)

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

### CSISnapshotListRequest

**定义位置**：[L566](file:///d:/claude/nomad/api/csi.go#L566)

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

**定义位置**：[L572](file:///d:/claude/nomad/api/csi.go#L572)

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

### CSIPlugins

**定义位置**：[L579](file:///d:/claude/nomad/api/csi.go#L579)

**中文说明**：CSIPlugins 与插件（Plugin）相关，实现可扩展的功能模块。

**类型**：struct

```go
type CSIPlugins struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（2 个）：`List`, `Info`

### CSIPlugin

**定义位置**：[L584](file:///d:/claude/nomad/api/csi.go#L584)

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
	Allocations []*AllocationListStub
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
| `Allocations` | `[]*AllocationListStub` | 列表 |
| `ControllersHealthy` | `int` | — |
| `ControllersExpected` | `int` | — |
| `NodesHealthy` | `int` | — |
| `NodesExpected` | `int` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyTime` | `int64` | — |

### CSIPluginListStub

**定义位置**：[L606](file:///d:/claude/nomad/api/csi.go#L606)

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

### CSIPluginIndexSort

**定义位置**：[L620](file:///d:/claude/nomad/api/csi.go#L620)

**中文说明**：CSIPluginIndexSort 与插件（Plugin）相关，实现可扩展的功能模块。

**类型定义**：`type CSIPluginIndexSort []*CSIPluginListStub`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `CSIVolumeAttachmentModeUnknown` | `CSIVolumeAttachmentMode` | `""` | — |
| `CSIVolumeAttachmentModeBlockDevice` | `CSIVolumeAttachmentMode` | `"block-device"` | — |
| `CSIVolumeAttachmentModeFilesystem` | `CSIVolumeAttachmentMode` | `"file-system"` | — |
| `CSIVolumeAccessModeUnknown` | `CSIVolumeAccessMode` | `""` | — |
| `CSIVolumeAccessModeSingleNodeReader` | `CSIVolumeAccessMode` | `"single-node-reader-only"` | — |
| `CSIVolumeAccessModeSingleNodeWriter` | `CSIVolumeAccessMode` | `"single-node-writer"` | — |
| `CSIVolumeAccessModeMultiNodeReader` | `CSIVolumeAccessMode` | `"multi-node-reader-only"` | — |
| `CSIVolumeAccessModeMultiNodeSingleWriter` | `CSIVolumeAccessMode` | `"multi-node-single-writer"` | — |
| `CSIVolumeAccessModeMultiNodeMultiWriter` | `CSIVolumeAccessMode` | `"multi-node-multi-writer"` | — |
| `CSIVolumeTypeHost` | `—` | `"host"` | — |
| `CSIVolumeTypeCSI` | `—` | `"csi"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `CSIVolumes` | `c *Client` | `` | `*CSIVolumes` | [L20](file:///d:/claude/nomad/api/csi.go#L20) |
| `List` | `v *CSIVolumes` | `q *QueryOptions` | `[]*CSIVolumeListStub, *QueryMeta, error` | [L25](file:///d:/claude/nomad/api/csi.go#L25) |
| `ListExternal` | `v *CSIVolumes` | `pluginID string, q *QueryOptions` | `*CSIVolumeListExternalResponse, *QueryMeta, error` | [L39](file:///d:/claude/nomad/api/csi.go#L39) |
| `PluginList` | `v *CSIVolumes` | `pluginID string` | `[]*CSIVolumeListStub, *QueryMeta, error` | [L61](file:///d:/claude/nomad/api/csi.go#L61) |
| `Info` | `v *CSIVolumes` | `id string, q *QueryOptions` | `*CSIVolume, *QueryMeta, error` | [L66](file:///d:/claude/nomad/api/csi.go#L66) |
| `Register` | `v *CSIVolumes` | `vol *CSIVolume, w *WriteOptions` | `*WriteMeta, error` | [L78](file:///d:/claude/nomad/api/csi.go#L78) |
| `RegisterOpts` | `v *CSIVolumes` | `req *CSIVolumeRegisterRequest, w *WriteOptions` | `*CSIVolumeRegisterResponse, *WriteMeta, error` | [L89](file:///d:/claude/nomad/api/csi.go#L89) |
| `Deregister` | `v *CSIVolumes` | `id string, force bool, w *WriteOptions` | `error` | [L101](file:///d:/claude/nomad/api/csi.go#L101) |
| `Create` | `v *CSIVolumes` | `vol *CSIVolume, w *WriteOptions` | `[]*CSIVolume, *WriteMeta, error` | [L109](file:///d:/claude/nomad/api/csi.go#L109) |
| `CreateOpts` | `v *CSIVolumes` | `req *CSIVolumeCreateRequest, w *WriteOptions` | `*CSIVolumeCreateResponse, *WriteMeta, error` | [L121](file:///d:/claude/nomad/api/csi.go#L121) |
| `Delete` | `v *CSIVolumes` | `externalVolID string, w *WriteOptions` | `error` | [L136](file:///d:/claude/nomad/api/csi.go#L136) |
| `DeleteOpts` | `v *CSIVolumes` | `req *CSIVolumeDeleteRequest, w *WriteOptions` | `error` | [L145](file:///d:/claude/nomad/api/csi.go#L145) |
| `Detach` | `v *CSIVolumes` | `volID string, nodeID string, w *WriteOptions` | `error` | [L157](file:///d:/claude/nomad/api/csi.go#L157) |
| `CreateSnapshot` | `v *CSIVolumes` | `snap *CSISnapshot, w *WriteOptions` | `*CSISnapshotCreateResponse, *WriteMeta, error` | [L163](file:///d:/claude/nomad/api/csi.go#L163) |
| `DeleteSnapshot` | `v *CSIVolumes` | `snap *CSISnapshot, w *WriteOptions` | `error` | [L177](file:///d:/claude/nomad/api/csi.go#L177) |
| `ListSnapshotsOpts` | `v *CSIVolumes` | `req *CSISnapshotListRequest` | `*CSISnapshotListResponse, *QueryMeta, error` | [L190](file:///d:/claude/nomad/api/csi.go#L190) |
| `ListSnapshots` | `v *CSIVolumes` | `pluginID string, secrets string, q *QueryOptions` | `*CSISnapshotListResponse, *QueryMeta, error` | [L217](file:///d:/claude/nomad/api/csi.go#L217) |
| `Merge` | `o *CSIMountOptions` | `p *CSIMountOptions` | `` | [L283](file:///d:/claude/nomad/api/csi.go#L283) |
| `SetHeadersFromCSISecrets` | `o *QueryOptions` | `secrets CSISecrets` | `` | [L300](file:///d:/claude/nomad/api/csi.go#L300) |
| `SetHeadersFromCSISecrets` | `o *WriteOptions` | `secrets CSISecrets` | `` | [L311](file:///d:/claude/nomad/api/csi.go#L311) |
| `Len` | `v *CSIVolumeIndexSort` | `` | `int` | [L402](file:///d:/claude/nomad/api/csi.go#L402) |
| `Less` | `v *CSIVolumeIndexSort` | `i int, j int` | `bool` | [L406](file:///d:/claude/nomad/api/csi.go#L406) |
| `Swap` | `v *CSIVolumeIndexSort` | `i int, j int` | `` | [L410](file:///d:/claude/nomad/api/csi.go#L410) |
| `Len` | `v *CSIVolumeExternalStubSort` | `` | `int` | [L467](file:///d:/claude/nomad/api/csi.go#L467) |
| `Less` | `v *CSIVolumeExternalStubSort` | `i int, j int` | `bool` | [L471](file:///d:/claude/nomad/api/csi.go#L471) |
| `Swap` | `v *CSIVolumeExternalStubSort` | `i int, j int` | `` | [L475](file:///d:/claude/nomad/api/csi.go#L475) |
| `Len` | `v *CSISnapshotSort` | `` | `int` | [L540](file:///d:/claude/nomad/api/csi.go#L540) |
| `Less` | `v *CSISnapshotSort` | `i int, j int` | `bool` | [L544](file:///d:/claude/nomad/api/csi.go#L544) |
| `Swap` | `v *CSISnapshotSort` | `i int, j int` | `` | [L548](file:///d:/claude/nomad/api/csi.go#L548) |
| `Len` | `v *CSIPluginIndexSort` | `` | `int` | [L622](file:///d:/claude/nomad/api/csi.go#L622) |
| `Less` | `v *CSIPluginIndexSort` | `i int, j int` | `bool` | [L626](file:///d:/claude/nomad/api/csi.go#L626) |
| `Swap` | `v *CSIPluginIndexSort` | `i int, j int` | `` | [L630](file:///d:/claude/nomad/api/csi.go#L630) |
| `CSIPlugins` | `c *Client` | `` | `*CSIPlugins` | [L635](file:///d:/claude/nomad/api/csi.go#L635) |
| `List` | `v *CSIPlugins` | `q *QueryOptions` | `[]*CSIPluginListStub, *QueryMeta, error` | [L640](file:///d:/claude/nomad/api/csi.go#L640) |
| `Info` | `v *CSIPlugins` | `id string, q *QueryOptions` | `*CSIPlugin, *QueryMeta, error` | [L651](file:///d:/claude/nomad/api/csi.go#L651) |

## 5. 核心方法详解

### List()

**签名**：`func (v *CSIVolumes) List(q *QueryOptions) []*CSIVolumeListStub, *QueryMeta, error`

**位置**：[L25](file:///d:/claude/nomad/api/csi.go#L25)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*CSIVolumeListStub` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Info()

**签名**：`func (v *CSIVolumes) Info(id string, q *QueryOptions) *CSIVolume, *QueryMeta, error`

**位置**：[L66](file:///d:/claude/nomad/api/csi.go#L66)

**中文说明**：返回对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | `string` | 唯一标识符 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*CSIVolume` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Register()

**签名**：`func (v *CSIVolumes) Register(vol *CSIVolume, w *WriteOptions) *WriteMeta, error`

**位置**：[L78](file:///d:/claude/nomad/api/csi.go#L78)

**中文说明**：注册对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `vol` | `*CSIVolume` | — |
| `w` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Deregister()

**签名**：`func (v *CSIVolumes) Deregister(id string, force bool, w *WriteOptions) error`

**位置**：[L101](file:///d:/claude/nomad/api/csi.go#L101)

**中文说明**：注销对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | `string` | 唯一标识符 |
| `force` | `bool` | 布尔值 |
| `w` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Create()

**签名**：`func (v *CSIVolumes) Create(vol *CSIVolume, w *WriteOptions) []*CSIVolume, *WriteMeta, error`

**位置**：[L109](file:///d:/claude/nomad/api/csi.go#L109)

**中文说明**：创建新的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `vol` | `*CSIVolume` | — |
| `w` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*CSIVolume` | 列表 |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (v *CSIVolumes) Delete(externalVolID string, w *WriteOptions) error`

**位置**：[L136](file:///d:/claude/nomad/api/csi.go#L136)

**中文说明**：删除指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `externalVolID` | `string` | 字符串 |
| `w` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### List()

**签名**：`func (v *CSIPlugins) List(q *QueryOptions) []*CSIPluginListStub, *QueryMeta, error`

**位置**：[L640](file:///d:/claude/nomad/api/csi.go#L640)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*CSIPluginListStub` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Info()

**签名**：`func (v *CSIPlugins) Info(id string, q *QueryOptions) *CSIPlugin, *QueryMeta, error`

**位置**：[L651](file:///d:/claude/nomad/api/csi.go#L651)

**中文说明**：返回对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | `string` | 唯一标识符 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*CSIPlugin` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `net/url` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [csi_test.go](file:///d:/claude/nomad/api/csi_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

