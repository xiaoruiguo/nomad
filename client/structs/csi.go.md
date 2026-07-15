# csi.go 代码说明文档

> 文件路径：[client/structs/csi.go](file:///d:/claude/nomad/client/structs/csi.go)
> 总行数：500 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **客户端子包**（`client/`），实现 Nomad 客户端的功能组件。

## 2. 类型定义

### CSIVolumeMountOptions

**定义位置**：[L16](file:///d:/claude/nomad/client/structs/csi.go#L16)

**中文说明**：CSIVolumeMountOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type CSIVolumeMountOptions struct {
	Filesystem string
	MountFlags []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Filesystem` | `string` | 字符串 |
| `MountFlags` | `[]string` | 列表 |

**关联方法**（1 个）：`ToCSIMountOptions`

### CSIControllerRequest

**定义位置**：[L41](file:///d:/claude/nomad/client/structs/csi.go#L41)

**中文说明**：CSIControllerRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：interface

```go
type CSIControllerRequest interface {
	SetControllerNodeID func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `SetControllerNodeID` | `func(...)` | — |

### CSIControllerQuery

**定义位置**：[L47](file:///d:/claude/nomad/client/structs/csi.go#L47)

**中文说明**：CSIControllerQuery 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type CSIControllerQuery struct {
	ControllerNodeID string
	PluginID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ControllerNodeID` | `string` | 字符串 |
| `PluginID` | `string` | 字符串 |

**关联方法**（1 个）：`SetControllerNodeID`

### ClientCSIControllerValidateVolumeRequest

**定义位置**：[L59](file:///d:/claude/nomad/client/structs/csi.go#L59)

**中文说明**：ClientCSIControllerValidateVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientCSIControllerValidateVolumeRequest struct {
	VolumeID string
	VolumeCapabilities []*structs.CSIVolumeCapability
	MountOptions *structs.CSIMountOptions
	Secrets structs.CSISecrets
	AttachmentMode structs.VolumeAttachmentMode
	AccessMode structs.VolumeAccessMode
	Parameters map[string]string
	Context map[string]string
	CSIControllerQuery CSIControllerQuery
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VolumeID` | `string` | 字符串 |
| `VolumeCapabilities` | `[]*structs.CSIVolumeCapability` | 列表 |
| `MountOptions` | `*structs.CSIMountOptions` | — |
| `Secrets` | `structs.CSISecrets` | — |
| `AttachmentMode` | `structs.VolumeAttachmentMode` | — |
| `AccessMode` | `structs.VolumeAccessMode` | — |
| `Parameters` | `map[string]string` | 参数 |
| `Context` | `map[string]string` | 上下文，用于控制请求的生命周期 |
| `CSIControllerQuery` | `CSIControllerQuery` | — |

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerValidateVolumeResponse

**定义位置**：[L106](file:///d:/claude/nomad/client/structs/csi.go#L106)

**中文说明**：ClientCSIControllerValidateVolumeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

### ClientCSIControllerAttachVolumeRequest

**定义位置**：[L109](file:///d:/claude/nomad/client/structs/csi.go#L109)

**中文说明**：ClientCSIControllerAttachVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientCSIControllerAttachVolumeRequest struct {
	VolumeID string
	ClientCSINodeID string
	AttachmentMode structs.VolumeAttachmentMode
	AccessMode structs.VolumeAccessMode
	MountOptions *CSIVolumeMountOptions
	ReadOnly bool
	Secrets structs.CSISecrets
	VolumeContext map[string]string
	CSIControllerQuery CSIControllerQuery
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VolumeID` | `string` | 字符串 |
| `ClientCSINodeID` | `string` | 字符串 |
| `AttachmentMode` | `structs.VolumeAttachmentMode` | — |
| `AccessMode` | `structs.VolumeAccessMode` | — |
| `MountOptions` | `*CSIVolumeMountOptions` | — |
| `ReadOnly` | `bool` | 布尔值 |
| `Secrets` | `structs.CSISecrets` | — |
| `VolumeContext` | `map[string]string` | 映射表 |
| `CSIControllerQuery` | `CSIControllerQuery` | — |

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerAttachVolumeResponse

**定义位置**：[L168](file:///d:/claude/nomad/client/structs/csi.go#L168)

**中文说明**：ClientCSIControllerAttachVolumeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ClientCSIControllerAttachVolumeResponse struct {
	PublishContext map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PublishContext` | `map[string]string` | 映射表 |

### ClientCSIControllerDetachVolumeRequest

**定义位置**：[L185](file:///d:/claude/nomad/client/structs/csi.go#L185)

**中文说明**：ClientCSIControllerDetachVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientCSIControllerDetachVolumeRequest struct {
	VolumeID string
	ClientCSINodeID string
	Secrets structs.CSISecrets
	CSIControllerQuery CSIControllerQuery
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VolumeID` | `string` | 字符串 |
| `ClientCSINodeID` | `string` | 字符串 |
| `Secrets` | `structs.CSISecrets` | — |
| `CSIControllerQuery` | `CSIControllerQuery` | — |

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerDetachVolumeResponse

**定义位置**：[L213](file:///d:/claude/nomad/client/structs/csi.go#L213)

**中文说明**：ClientCSIControllerDetachVolumeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

### ClientCSIControllerCreateVolumeRequest

**定义位置**：[L218](file:///d:/claude/nomad/client/structs/csi.go#L218)

**中文说明**：ClientCSIControllerCreateVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientCSIControllerCreateVolumeRequest struct {
	Name string
	VolumeCapabilities []*structs.CSIVolumeCapability
	MountOptions *structs.CSIMountOptions
	Parameters map[string]string
	Secrets structs.CSISecrets
	CapacityMin int64
	CapacityMax int64
	SnapshotID string
	CloneID string
	RequestedTopologies *structs.CSITopologyRequest
	CSIControllerQuery CSIControllerQuery
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `VolumeCapabilities` | `[]*structs.CSIVolumeCapability` | 列表 |
| `MountOptions` | `*structs.CSIMountOptions` | — |
| `Parameters` | `map[string]string` | 参数 |
| `Secrets` | `structs.CSISecrets` | — |
| `CapacityMin` | `int64` | — |
| `CapacityMax` | `int64` | — |
| `SnapshotID` | `string` | 字符串 |
| `CloneID` | `string` | 字符串 |
| `RequestedTopologies` | `*structs.CSITopologyRequest` | — |
| `CSIControllerQuery` | `CSIControllerQuery` | — |

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerCreateVolumeResponse

**定义位置**：[L285](file:///d:/claude/nomad/client/structs/csi.go#L285)

**中文说明**：ClientCSIControllerCreateVolumeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ClientCSIControllerCreateVolumeResponse struct {
	ExternalVolumeID string
	CapacityBytes int64
	VolumeContext map[string]string
	Topologies []*structs.CSITopology
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalVolumeID` | `string` | 字符串 |
| `CapacityBytes` | `int64` | — |
| `VolumeContext` | `map[string]string` | 映射表 |
| `Topologies` | `[]*structs.CSITopology` | 列表 |

### ClientCSIControllerExpandVolumeRequest

**定义位置**：[L295](file:///d:/claude/nomad/client/structs/csi.go#L295)

**中文说明**：ClientCSIControllerExpandVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientCSIControllerExpandVolumeRequest struct {
	ExternalVolumeID string
	CapacityRange *csi.CapacityRange
	Secrets structs.CSISecrets
	VolumeCapability *csi.VolumeCapability
	CSIControllerQuery CSIControllerQuery
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalVolumeID` | `string` | 字符串 |
| `CapacityRange` | `*csi.CapacityRange` | — |
| `Secrets` | `structs.CSISecrets` | — |
| `VolumeCapability` | `*csi.VolumeCapability` | — |
| `CSIControllerQuery` | `CSIControllerQuery` | — |

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerExpandVolumeResponse

**定义位置**：[L317](file:///d:/claude/nomad/client/structs/csi.go#L317)

**中文说明**：ClientCSIControllerExpandVolumeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ClientCSIControllerExpandVolumeResponse struct {
	CapacityBytes int64
	NodeExpansionRequired bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CapacityBytes` | `int64` | — |
| `NodeExpansionRequired` | `bool` | 布尔值 |

### ClientCSIControllerDeleteVolumeRequest

**定义位置**：[L325](file:///d:/claude/nomad/client/structs/csi.go#L325)

**中文说明**：ClientCSIControllerDeleteVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientCSIControllerDeleteVolumeRequest struct {
	ExternalVolumeID string
	Secrets structs.CSISecrets
	CSIControllerQuery CSIControllerQuery
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalVolumeID` | `string` | 字符串 |
| `Secrets` | `structs.CSISecrets` | — |
| `CSIControllerQuery` | `CSIControllerQuery` | — |

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerDeleteVolumeResponse

**定义位置**：[L339](file:///d:/claude/nomad/client/structs/csi.go#L339)

**中文说明**：ClientCSIControllerDeleteVolumeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

### ClientCSIControllerListVolumesRequest

**定义位置**：[L344](file:///d:/claude/nomad/client/structs/csi.go#L344)

**中文说明**：ClientCSIControllerListVolumesRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientCSIControllerListVolumesRequest struct {
	MaxEntries int32
	StartingToken string
	CSIControllerQuery CSIControllerQuery
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MaxEntries` | `int32` | — |
| `StartingToken` | `string` | 字符串 |
| `CSIControllerQuery` | `CSIControllerQuery` | — |

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerListVolumesResponse

**定义位置**：[L360](file:///d:/claude/nomad/client/structs/csi.go#L360)

**中文说明**：ClientCSIControllerListVolumesResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ClientCSIControllerListVolumesResponse struct {
	Entries []*structs.CSIVolumeExternalStub
	NextToken string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Entries` | `[]*structs.CSIVolumeExternalStub` | 列表 |
| `NextToken` | `string` | 字符串 |

### ClientCSIControllerCreateSnapshotRequest

**定义位置**：[L368](file:///d:/claude/nomad/client/structs/csi.go#L368)

**中文说明**：ClientCSIControllerCreateSnapshotRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientCSIControllerCreateSnapshotRequest struct {
	ExternalSourceVolumeID string
	Name string
	Secrets structs.CSISecrets
	Parameters map[string]string
	CSIControllerQuery CSIControllerQuery
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalSourceVolumeID` | `string` | 字符串 |
| `Name` | `string` | 名称 |
| `Secrets` | `structs.CSISecrets` | — |
| `Parameters` | `map[string]string` | 参数 |
| `CSIControllerQuery` | `CSIControllerQuery` | — |

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerCreateSnapshotResponse

**定义位置**：[L386](file:///d:/claude/nomad/client/structs/csi.go#L386)

**中文说明**：ClientCSIControllerCreateSnapshotResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ClientCSIControllerCreateSnapshotResponse struct {
	ID string
	ExternalSourceVolumeID string
	SizeBytes int64
	CreateTime int64
	IsReady bool
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

### ClientCSIControllerDeleteSnapshotRequest

**定义位置**：[L397](file:///d:/claude/nomad/client/structs/csi.go#L397)

**中文说明**：ClientCSIControllerDeleteSnapshotRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientCSIControllerDeleteSnapshotRequest struct {
	ID string
	Secrets structs.CSISecrets
	CSIControllerQuery CSIControllerQuery
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Secrets` | `structs.CSISecrets` | — |
| `CSIControllerQuery` | `CSIControllerQuery` | — |

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerDeleteSnapshotResponse

**定义位置**：[L411](file:///d:/claude/nomad/client/structs/csi.go#L411)

**中文说明**：ClientCSIControllerDeleteSnapshotResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

### ClientCSIControllerListSnapshotsRequest

**定义位置**：[L416](file:///d:/claude/nomad/client/structs/csi.go#L416)

**中文说明**：ClientCSIControllerListSnapshotsRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientCSIControllerListSnapshotsRequest struct {
	MaxEntries int32
	StartingToken string
	Secrets structs.CSISecrets
	CSIControllerQuery CSIControllerQuery
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MaxEntries` | `int32` | — |
| `StartingToken` | `string` | 字符串 |
| `Secrets` | `structs.CSISecrets` | — |
| `CSIControllerQuery` | `CSIControllerQuery` | — |

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerListSnapshotsResponse

**定义位置**：[L434](file:///d:/claude/nomad/client/structs/csi.go#L434)

**中文说明**：ClientCSIControllerListSnapshotsResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ClientCSIControllerListSnapshotsResponse struct {
	Entries []*structs.CSISnapshot
	NextToken string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Entries` | `[]*structs.CSISnapshot` | 列表 |
| `NextToken` | `string` | 字符串 |

### ClientCSINodeDetachVolumeRequest

**定义位置**：[L442](file:///d:/claude/nomad/client/structs/csi.go#L442)

**中文说明**：ClientCSINodeDetachVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientCSINodeDetachVolumeRequest struct {
	PluginID string
	VolumeID string
	VolumeNamespace string
	AllocID string
	NodeID string
	ExternalID string
	AttachmentMode structs.VolumeAttachmentMode
	AccessMode structs.VolumeAccessMode
	ReadOnly bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PluginID` | `string` | ID 的 插件 该 管理 卷 (必需) |
| `VolumeID` | `string` | 字符串 |
| `VolumeNamespace` | `string` | 字符串 |
| `AllocID` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `ExternalID` | `string` | 字符串 |
| `AttachmentMode` | `structs.VolumeAttachmentMode` | — |
| `AccessMode` | `structs.VolumeAccessMode` | — |
| `ReadOnly` | `bool` | 布尔值 |

### ClientCSINodeDetachVolumeResponse

**定义位置**：[L457](file:///d:/claude/nomad/client/structs/csi.go#L457)

**中文说明**：ClientCSINodeDetachVolumeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

### ClientCSINodeExpandVolumeRequest

**定义位置**：[L462](file:///d:/claude/nomad/client/structs/csi.go#L462)

**中文说明**：ClientCSINodeExpandVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientCSINodeExpandVolumeRequest struct {
	PluginID string
	VolumeID string
	VolumeNamespace string
	ExternalID string
	Capacity *csi.CapacityRange
	Claim *structs.CSIVolumeClaim
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PluginID` | `string` | ID 的 插件 该 管理 卷 (必需) |
| `VolumeID` | `string` | 字符串 |
| `VolumeNamespace` | `string` | 字符串 |
| `ExternalID` | `string` | 字符串 |
| `Capacity` | `*csi.CapacityRange` | — |
| `Claim` | `*structs.CSIVolumeClaim` | — |

**关联方法**（1 个）：`Validate`

### ClientCSINodeExpandVolumeResponse

**定义位置**：[L497](file:///d:/claude/nomad/client/structs/csi.go#L497)

**中文说明**：ClientCSINodeExpandVolumeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ClientCSINodeExpandVolumeResponse struct {
	CapacityBytes int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CapacityBytes` | `int64` | — |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ToCSIMountOptions` | `c *CSIVolumeMountOptions` | `` | `*structs.CSIMountOptions` | [L28](file:///d:/claude/nomad/client/structs/csi.go#L28) |
| `SetControllerNodeID` | `c *CSIControllerQuery` | `nodeID string` | `` | [L55](file:///d:/claude/nomad/client/structs/csi.go#L55) |
| `ToCSIRequest` | `c *ClientCSIControllerValidateVolumeRequest` | `` | `*csi.ControllerValidateVolumeRequest, error` | [L82](file:///d:/claude/nomad/client/structs/csi.go#L82) |
| `ToCSIRequest` | `c *ClientCSIControllerAttachVolumeRequest` | `` | `*csi.ControllerPublishVolumeRequest, error` | [L144](file:///d:/claude/nomad/client/structs/csi.go#L144) |
| `ToCSIRequest` | `c *ClientCSIControllerDetachVolumeRequest` | `` | `*csi.ControllerUnpublishVolumeRequest` | [L202](file:///d:/claude/nomad/client/structs/csi.go#L202) |
| `ToCSIRequest` | `req *ClientCSIControllerCreateVolumeRequest` | `` | `*csi.ControllerCreateVolumeRequest, error` | [L233](file:///d:/claude/nomad/client/structs/csi.go#L233) |
| `ToCSIRequest` | `req *ClientCSIControllerExpandVolumeRequest` | `` | `*csi.ControllerExpandVolumeRequest` | [L304](file:///d:/claude/nomad/client/structs/csi.go#L304) |
| `ToCSIRequest` | `req *ClientCSIControllerDeleteVolumeRequest` | `` | `*csi.ControllerDeleteVolumeRequest` | [L332](file:///d:/claude/nomad/client/structs/csi.go#L332) |
| `ToCSIRequest` | `req *ClientCSIControllerListVolumesRequest` | `` | `*csi.ControllerListVolumesRequest` | [L353](file:///d:/claude/nomad/client/structs/csi.go#L353) |
| `ToCSIRequest` | `req *ClientCSIControllerCreateSnapshotRequest` | `` | `*csi.ControllerCreateSnapshotRequest, error` | [L377](file:///d:/claude/nomad/client/structs/csi.go#L377) |
| `ToCSIRequest` | `req *ClientCSIControllerDeleteSnapshotRequest` | `` | `*csi.ControllerDeleteSnapshotRequest` | [L404](file:///d:/claude/nomad/client/structs/csi.go#L404) |
| `ToCSIRequest` | `req *ClientCSIControllerListSnapshotsRequest` | `` | `*csi.ControllerListSnapshotsRequest` | [L426](file:///d:/claude/nomad/client/structs/csi.go#L426) |
| `Validate` | `req *ClientCSINodeExpandVolumeRequest` | `` | `error` | [L476](file:///d:/claude/nomad/client/structs/csi.go#L476) |

## 5. 核心方法详解

### Validate()

**签名**：`func (req *ClientCSINodeExpandVolumeRequest) Validate() error`

**位置**：[L476](file:///d:/claude/nomad/client/structs/csi.go#L476)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/csi` | 内部包 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [csi_test.go](file:///d:/claude/nomad/client/structs/csi_test.go) | 对应测试文件 |
| [allochook.go](file:///d:/claude/nomad/client/structs/allochook.go) | 同目录源文件 |
| [broadcaster.go](file:///d:/claude/nomad/client/structs/broadcaster.go) | 同目录源文件 |
| [enum.go](file:///d:/claude/nomad/client/structs/enum.go) | 同目录源文件 |
| [host_volumes.go](file:///d:/claude/nomad/client/structs/host_volumes.go) | 同目录源文件 |
| [structs.go](file:///d:/claude/nomad/client/structs/structs.go) | 同目录源文件 |

