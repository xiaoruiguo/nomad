# plugin.go 代码说明文档

> 文件路径：[plugins/csi/plugin.go](file:///d:/claude/nomad/plugins/csi/plugin.go)
> 总行数：1084 行
> 所属包：`csi`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **CSI 插件接口子包**（`plugins/csi`），定义容器存储接口（CSI）插件的客户端实现，通过 gRPC 与 CSI 控制器和节点服务通信，管理卷的创建、挂载和快照。

## 2. 类型定义

### CSIPlugin

**定义位置**：[L21](file:///d:/claude/nomad/plugins/csi/plugin.go#L21)

**中文说明**：CSIPlugin 与插件（Plugin）相关，实现可扩展的功能模块。

**类型**：interface

```go
type CSIPlugin interface {
	base.BasePlugin base.BasePlugin
	PluginProbe func(...)
	PluginGetInfo func(...)
	PluginGetCapabilities func(...)
	ControllerGetCapabilities func(...)
	ControllerPublishVolume func(...)
	ControllerUnpublishVolume func(...)
	ControllerValidateCapabilities func(...)
	ControllerCreateVolume func(...)
	ControllerDeleteVolume func(...)
	ControllerListVolumes func(...)
	ControllerExpandVolume func(...)
	ControllerCreateSnapshot func(...)
	ControllerDeleteSnapshot func(...)
	ControllerListSnapshots func(...)
	NodeGetCapabilities func(...)
	NodeGetInfo func(...)
	NodeStageVolume func(...)
	NodeUnstageVolume func(...)
	NodePublishVolume func(...)
	NodeUnpublishVolume func(...)
	NodeExpandVolume func(...)
	Close func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `base.BasePlugin` | `base.BasePlugin` | — |
| `PluginProbe` | `func(...)` | — |
| `PluginGetInfo` | `func(...)` | — |
| `PluginGetCapabilities` | `func(...)` | — |
| `ControllerGetCapabilities` | `func(...)` | — |
| `ControllerPublishVolume` | `func(...)` | — |
| `ControllerUnpublishVolume` | `func(...)` | — |
| `ControllerValidateCapabilities` | `func(...)` | — |
| `ControllerCreateVolume` | `func(...)` | — |
| `ControllerDeleteVolume` | `func(...)` | — |
| `ControllerListVolumes` | `func(...)` | — |
| `ControllerExpandVolume` | `func(...)` | — |
| `ControllerCreateSnapshot` | `func(...)` | — |
| `ControllerDeleteSnapshot` | `func(...)` | — |
| `ControllerListSnapshots` | `func(...)` | — |
| `NodeGetCapabilities` | `func(...)` | — |
| `NodeGetInfo` | `func(...)` | — |
| `NodeStageVolume` | `func(...)` | — |
| `NodeUnstageVolume` | `func(...)` | — |
| `NodePublishVolume` | `func(...)` | — |
| `NodeUnpublishVolume` | `func(...)` | — |
| `NodeExpandVolume` | `func(...)` | — |
| `Close` | `func(...)` | 关闭对象。 |

### NodePublishVolumeRequest

**定义位置**：[L117](file:///d:/claude/nomad/plugins/csi/plugin.go#L117)

**中文说明**：NodePublishVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodePublishVolumeRequest struct {
	ExternalID string
	PublishContext map[string]string
	StagingTargetPath string
	TargetPath string
	VolumeCapability *VolumeCapability
	Readonly bool
	Secrets structs.CSISecrets
	VolumeContext map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalID` | `string` | 字符串 |
| `PublishContext` | `map[string]string` | 映射表 |
| `StagingTargetPath` | `string` | 字符串 |
| `TargetPath` | `string` | 字符串 |
| `VolumeCapability` | `*VolumeCapability` | — |
| `Readonly` | `bool` | 布尔值 |
| `Secrets` | `structs.CSISecrets` | — |
| `VolumeContext` | `map[string]string` | 映射表 |

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### NodeStageVolumeRequest

**定义位置**：[L193](file:///d:/claude/nomad/plugins/csi/plugin.go#L193)

**中文说明**：NodeStageVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeStageVolumeRequest struct {
	ExternalID string
	PublishContext map[string]string
	StagingTargetPath string
	VolumeCapability *VolumeCapability
	Secrets structs.CSISecrets
	VolumeContext map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalID` | `string` | 字符串 |
| `PublishContext` | `map[string]string` | 映射表 |
| `StagingTargetPath` | `string` | 字符串 |
| `VolumeCapability` | `*VolumeCapability` | — |
| `Secrets` | `structs.CSISecrets` | — |
| `VolumeContext` | `map[string]string` | 映射表 |

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### PluginCapabilitySet

**定义位置**：[L256](file:///d:/claude/nomad/plugins/csi/plugin.go#L256)

**中文说明**：PluginCapabilitySet 与插件（Plugin）相关，实现可扩展的功能模块。

**类型**：struct

```go
type PluginCapabilitySet struct {
	hasControllerService bool
	hasTopologies bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `hasControllerService` | `bool` | 布尔值 |
| `hasTopologies` | `bool` | 布尔值 |

**关联方法**（3 个）：`HasControllerService`, `HasToplogies`, `IsEqual`

### ControllerCapabilitySet

**定义位置**：[L306](file:///d:/claude/nomad/plugins/csi/plugin.go#L306)

**中文说明**：ControllerCapabilitySet 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ControllerCapabilitySet struct {
	HasCreateDeleteVolume bool
	HasPublishUnpublishVolume bool
	HasListVolumes bool
	HasGetCapacity bool
	HasCreateDeleteSnapshot bool
	HasListSnapshots bool
	HasCloneVolume bool
	HasPublishReadonly bool
	HasExpandVolume bool
	HasListVolumesPublishedNodes bool
	HasVolumeCondition bool
	HasGetVolume bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `HasCreateDeleteVolume` | `bool` | 布尔值 |
| `HasPublishUnpublishVolume` | `bool` | 布尔值 |
| `HasListVolumes` | `bool` | 布尔值 |
| `HasGetCapacity` | `bool` | 布尔值 |
| `HasCreateDeleteSnapshot` | `bool` | 布尔值 |
| `HasListSnapshots` | `bool` | 布尔值 |
| `HasCloneVolume` | `bool` | 布尔值 |
| `HasPublishReadonly` | `bool` | 布尔值 |
| `HasExpandVolume` | `bool` | 布尔值 |
| `HasListVolumesPublishedNodes` | `bool` | 布尔值 |
| `HasVolumeCondition` | `bool` | 布尔值 |
| `HasGetVolume` | `bool` | 布尔值 |

### ControllerValidateVolumeRequest

**定义位置**：[L361](file:///d:/claude/nomad/plugins/csi/plugin.go#L361)

**中文说明**：ControllerValidateVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ControllerValidateVolumeRequest struct {
	ExternalID string
	Secrets structs.CSISecrets
	Capabilities []*VolumeCapability
	Parameters map[string]string
	Context map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalID` | `string` | 字符串 |
| `Secrets` | `structs.CSISecrets` | — |
| `Capabilities` | `[]*VolumeCapability` | 列表 |
| `Parameters` | `map[string]string` | 参数 |
| `Context` | `map[string]string` | 上下文，用于控制请求的生命周期 |

**关联方法**（1 个）：`ToCSIRepresentation`

### ControllerPublishVolumeRequest

**定义位置**：[L388](file:///d:/claude/nomad/plugins/csi/plugin.go#L388)

**中文说明**：ControllerPublishVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ControllerPublishVolumeRequest struct {
	ExternalID string
	NodeID string
	ReadOnly bool
	VolumeCapability *VolumeCapability
	Secrets structs.CSISecrets
	VolumeContext map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalID` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `ReadOnly` | `bool` | 布尔值 |
| `VolumeCapability` | `*VolumeCapability` | — |
| `Secrets` | `structs.CSISecrets` | — |
| `VolumeContext` | `map[string]string` | 映射表 |

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerPublishVolumeResponse

**定义位置**：[L422](file:///d:/claude/nomad/plugins/csi/plugin.go#L422)

**中文说明**：ControllerPublishVolumeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ControllerPublishVolumeResponse struct {
	PublishContext map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PublishContext` | `map[string]string` | 映射表 |

### ControllerUnpublishVolumeRequest

**定义位置**：[L426](file:///d:/claude/nomad/plugins/csi/plugin.go#L426)

**中文说明**：ControllerUnpublishVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ControllerUnpublishVolumeRequest struct {
	ExternalID string
	NodeID string
	Secrets structs.CSISecrets
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalID` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `Secrets` | `structs.CSISecrets` | — |

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerUnpublishVolumeResponse

**定义位置**：[L456](file:///d:/claude/nomad/plugins/csi/plugin.go#L456)

**中文说明**：ControllerUnpublishVolumeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

### ControllerCreateVolumeRequest

**定义位置**：[L458](file:///d:/claude/nomad/plugins/csi/plugin.go#L458)

**中文说明**：ControllerCreateVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ControllerCreateVolumeRequest struct {
	Name string
	CapacityRange *CapacityRange
	VolumeCapabilities []*VolumeCapability
	Parameters map[string]string
	Secrets structs.CSISecrets
	ContentSource *VolumeContentSource
	AccessibilityRequirements *TopologyRequirement
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `CapacityRange` | `*CapacityRange` | — |
| `VolumeCapabilities` | `[]*VolumeCapability` | 列表 |
| `Parameters` | `map[string]string` | 参数 |
| `Secrets` | `structs.CSISecrets` | — |
| `ContentSource` | `*VolumeContentSource` | — |
| `AccessibilityRequirements` | `*TopologyRequirement` | — |

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### VolumeContentSource

**定义位置**：[L521](file:///d:/claude/nomad/plugins/csi/plugin.go#L521)

**中文说明**：VolumeContentSource 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type VolumeContentSource struct {
	SnapshotID string
	CloneID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SnapshotID` | `string` | 字符串 |
| `CloneID` | `string` | 字符串 |

**关联方法**（1 个）：`ToCSIRepresentation`

### TopologyRequirement

**定义位置**：[L558](file:///d:/claude/nomad/plugins/csi/plugin.go#L558)

**中文说明**：TopologyRequirement 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type TopologyRequirement struct {
	Requisite []*Topology
	Preferred []*Topology
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Requisite` | `[]*Topology` | 列表 |
| `Preferred` | `[]*Topology` | 列表 |

**关联方法**（1 个）：`ToCSIRepresentation`

### ControllerCreateVolumeResponse

**定义位置**：[L590](file:///d:/claude/nomad/plugins/csi/plugin.go#L590)

**中文说明**：ControllerCreateVolumeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ControllerCreateVolumeResponse struct {
	Volume *Volume
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*Volume` | — |

### Volume

**定义位置**：[L605](file:///d:/claude/nomad/plugins/csi/plugin.go#L605)

**中文说明**：Volume 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type Volume struct {
	CapacityBytes int64
	ExternalVolumeID string
	VolumeContext map[string]string
	ContentSource *VolumeContentSource
	AccessibleTopology []*Topology
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CapacityBytes` | `int64` | — |
| `ExternalVolumeID` | `string` | 字符串 |
| `VolumeContext` | `map[string]string` | 映射表 |
| `ContentSource` | `*VolumeContentSource` | — |
| `AccessibleTopology` | `[]*Topology` | 列表 |

### ControllerDeleteVolumeRequest

**定义位置**：[L616](file:///d:/claude/nomad/plugins/csi/plugin.go#L616)

**中文说明**：ControllerDeleteVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ControllerDeleteVolumeRequest struct {
	ExternalVolumeID string
	Secrets structs.CSISecrets
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalVolumeID` | `string` | 字符串 |
| `Secrets` | `structs.CSISecrets` | — |

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerExpandVolumeRequest

**定义位置**：[L638](file:///d:/claude/nomad/plugins/csi/plugin.go#L638)

**中文说明**：ControllerExpandVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ControllerExpandVolumeRequest struct {
	ExternalVolumeID string
	RequiredBytes int64
	LimitBytes int64
	Capability *VolumeCapability
	Secrets structs.CSISecrets
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalVolumeID` | `string` | 字符串 |
| `RequiredBytes` | `int64` | — |
| `LimitBytes` | `int64` | — |
| `Capability` | `*VolumeCapability` | — |
| `Secrets` | `structs.CSISecrets` | — |

**关联方法**（2 个）：`Validate`, `ToCSIRepresentation`

### ControllerExpandVolumeResponse

**定义位置**：[L676](file:///d:/claude/nomad/plugins/csi/plugin.go#L676)

**中文说明**：ControllerExpandVolumeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ControllerExpandVolumeResponse struct {
	CapacityBytes int64
	NodeExpansionRequired bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CapacityBytes` | `int64` | — |
| `NodeExpansionRequired` | `bool` | 布尔值 |

### ControllerListVolumesRequest

**定义位置**：[L681](file:///d:/claude/nomad/plugins/csi/plugin.go#L681)

**中文说明**：ControllerListVolumesRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ControllerListVolumesRequest struct {
	MaxEntries int32
	StartingToken string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MaxEntries` | `int32` | — |
| `StartingToken` | `string` | 字符串 |

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerListVolumesResponse

**定义位置**：[L703](file:///d:/claude/nomad/plugins/csi/plugin.go#L703)

**中文说明**：ControllerListVolumesResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ControllerListVolumesResponse struct {
	Entries []*ListVolumesResponse_Entry
	NextToken string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Entries` | `[]*ListVolumesResponse_Entry` | 列表 |
| `NextToken` | `string` | 字符串 |

### ListVolumesResponse_Entry

**定义位置**：[L741](file:///d:/claude/nomad/plugins/csi/plugin.go#L741)

**中文说明**：ListVolumesResponse_Entry 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type ListVolumesResponse_Entry struct {
	Volume *Volume
	Status *ListVolumesResponse_VolumeStatus
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*Volume` | — |
| `Status` | `*ListVolumesResponse_VolumeStatus` | 状态 |

### ListVolumesResponse_VolumeStatus

**定义位置**：[L746](file:///d:/claude/nomad/plugins/csi/plugin.go#L746)

**中文说明**：ListVolumesResponse_VolumeStatus 是一个状态结构体，描述对象或操作的当前状态。

**类型**：struct

```go
type ListVolumesResponse_VolumeStatus struct {
	PublishedNodeIds []string
	VolumeCondition *VolumeCondition
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PublishedNodeIds` | `[]string` | 列表 |
| `VolumeCondition` | `*VolumeCondition` | — |

### VolumeCondition

**定义位置**：[L751](file:///d:/claude/nomad/plugins/csi/plugin.go#L751)

**中文说明**：VolumeCondition 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type VolumeCondition struct {
	Abnormal bool
	Message string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Abnormal` | `bool` | 布尔值 |
| `Message` | `string` | 消息 |

### ControllerCreateSnapshotRequest

**定义位置**：[L756](file:///d:/claude/nomad/plugins/csi/plugin.go#L756)

**中文说明**：ControllerCreateSnapshotRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ControllerCreateSnapshotRequest struct {
	VolumeID string
	Name string
	Secrets structs.CSISecrets
	Parameters map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VolumeID` | `string` | 字符串 |
| `Name` | `string` | 名称 |
| `Secrets` | `structs.CSISecrets` | — |
| `Parameters` | `map[string]string` | 参数 |

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerCreateSnapshotResponse

**定义位置**：[L782](file:///d:/claude/nomad/plugins/csi/plugin.go#L782)

**中文说明**：ControllerCreateSnapshotResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ControllerCreateSnapshotResponse struct {
	Snapshot *Snapshot
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Snapshot` | `*Snapshot` | 快照 |

### Snapshot

**定义位置**：[L786](file:///d:/claude/nomad/plugins/csi/plugin.go#L786)

**中文说明**：Snapshot 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Snapshot struct {
	ID string
	SourceVolumeID string
	SizeBytes int64
	CreateTime int64
	IsReady bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `SourceVolumeID` | `string` | 字符串 |
| `SizeBytes` | `int64` | — |
| `CreateTime` | `int64` | — |
| `IsReady` | `bool` | 布尔值 |

### ControllerDeleteSnapshotRequest

**定义位置**：[L794](file:///d:/claude/nomad/plugins/csi/plugin.go#L794)

**中文说明**：ControllerDeleteSnapshotRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ControllerDeleteSnapshotRequest struct {
	SnapshotID string
	Secrets structs.CSISecrets
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SnapshotID` | `string` | 字符串 |
| `Secrets` | `structs.CSISecrets` | — |

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerListSnapshotsRequest

**定义位置**：[L813](file:///d:/claude/nomad/plugins/csi/plugin.go#L813)

**中文说明**：ControllerListSnapshotsRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ControllerListSnapshotsRequest struct {
	MaxEntries int32
	StartingToken string
	Secrets structs.CSISecrets
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MaxEntries` | `int32` | — |
| `StartingToken` | `string` | 字符串 |
| `Secrets` | `structs.CSISecrets` | — |

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerListSnapshotsResponse

**定义位置**：[L859](file:///d:/claude/nomad/plugins/csi/plugin.go#L859)

**中文说明**：ControllerListSnapshotsResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ControllerListSnapshotsResponse struct {
	Entries []*ListSnapshotsResponse_Entry
	NextToken string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Entries` | `[]*ListSnapshotsResponse_Entry` | 列表 |
| `NextToken` | `string` | 字符串 |

### ListSnapshotsResponse_Entry

**定义位置**：[L864](file:///d:/claude/nomad/plugins/csi/plugin.go#L864)

**中文说明**：ListSnapshotsResponse_Entry 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ListSnapshotsResponse_Entry struct {
	Snapshot *Snapshot
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Snapshot` | `*Snapshot` | 快照 |

### NodeCapabilitySet

**定义位置**：[L868](file:///d:/claude/nomad/plugins/csi/plugin.go#L868)

**中文说明**：NodeCapabilitySet 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeCapabilitySet struct {
	HasStageUnstageVolume bool
	HasGetVolumeStats bool
	HasExpandVolume bool
	HasVolumeCondition bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `HasStageUnstageVolume` | `bool` | 布尔值 |
| `HasGetVolumeStats` | `bool` | 布尔值 |
| `HasExpandVolume` | `bool` | 布尔值 |
| `HasVolumeCondition` | `bool` | 布尔值 |

### VolumeAccessMode

**定义位置**：[L899](file:///d:/claude/nomad/plugins/csi/plugin.go#L899)

**中文说明**：VolumeAccessMode 与卷（Volume）相关，管理持久化存储。

**类型定义**：`type VolumeAccessMode csipbv1.VolumeCapability_AccessMode_Mode`

**关联方法**（2 个）：`String`, `ToCSIRepresentation`

### VolumeAccessType

**定义位置**：[L923](file:///d:/claude/nomad/plugins/csi/plugin.go#L923)

**中文说明**：VolumeAccessType 与卷（Volume）相关，管理持久化存储。

**类型定义**：`type VolumeAccessType int32`

**关联方法**（1 个）：`String`

### VolumeCapability

**定义位置**：[L943](file:///d:/claude/nomad/plugins/csi/plugin.go#L943)

**中文说明**：VolumeCapability 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type VolumeCapability struct {
	AccessType VolumeAccessType
	AccessMode VolumeAccessMode
	MountVolume *structs.CSIMountOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AccessType` | `VolumeAccessType` | — |
| `AccessMode` | `VolumeAccessMode` | — |
| `MountVolume` | `*structs.CSIMountOptions` | — |

**关联方法**（1 个）：`ToCSIRepresentation`

### CapacityRange

**定义位置**：[L1018](file:///d:/claude/nomad/plugins/csi/plugin.go#L1018)

**中文说明**：CapacityRange 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type CapacityRange struct {
	RequiredBytes int64
	LimitBytes int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `RequiredBytes` | `int64` | — |
| `LimitBytes` | `int64` | — |

**关联方法**（2 个）：`Validate`, `ToCSIRepresentation`

### NodeExpandVolumeRequest

**定义位置**：[L1046](file:///d:/claude/nomad/plugins/csi/plugin.go#L1046)

**中文说明**：NodeExpandVolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeExpandVolumeRequest struct {
	ExternalVolumeID string
	CapacityRange *CapacityRange
	Capability *VolumeCapability
	TargetPath string
	StagingPath string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExternalVolumeID` | `string` | 字符串 |
| `CapacityRange` | `*CapacityRange` | — |
| `Capability` | `*VolumeCapability` | — |
| `TargetPath` | `string` | 字符串 |
| `StagingPath` | `string` | 字符串 |

**关联方法**（2 个）：`Validate`, `ToCSIRepresentation`

### NodeExpandVolumeResponse

**定义位置**：[L1081](file:///d:/claude/nomad/plugins/csi/plugin.go#L1081)

**中文说明**：NodeExpandVolumeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NodeExpandVolumeResponse struct {
	CapacityBytes int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CapacityBytes` | `int64` | — |

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `_` | `fmt.Stringer` | `VolumeAccessModeUnknown` | — |
| `VolumeAccessModeUnknown` | `—` | `VolumeAccessMode(csipbv1.VolumeCapability_AccessMode_UNKN...` | — |
| `VolumeAccessModeSingleNodeWriter` | `—` | `VolumeAccessMode(csipbv1.VolumeCapability_AccessMode_SING...` | — |
| `VolumeAccessModeSingleNodeReaderOnly` | `—` | `VolumeAccessMode(csipbv1.VolumeCapability_AccessMode_SING...` | — |
| `VolumeAccessModeMultiNodeReaderOnly` | `—` | `VolumeAccessMode(csipbv1.VolumeCapability_AccessMode_MULT...` | — |
| `VolumeAccessModeMultiNodeSingleWriter` | `—` | `VolumeAccessMode(csipbv1.VolumeCapability_AccessMode_MULT...` | — |
| `VolumeAccessModeMultiNodeMultiWriter` | `—` | `VolumeAccessMode(csipbv1.VolumeCapability_AccessMode_MULT...` | — |
| `_` | `fmt.Stringer` | `VolumeAccessTypeBlock` | — |
| `VolumeAccessTypeBlock` | `VolumeAccessType` | `1` | — |
| `VolumeAccessTypeMount` | `VolumeAccessType` | `2` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ToCSIRepresentation` | `r *NodePublishVolumeRequest` | `` | `*csipbv1.NodePublishVolumeRequest` | [L160](file:///d:/claude/nomad/plugins/csi/plugin.go#L160) |
| `Validate` | `r *NodePublishVolumeRequest` | `` | `error` | [L177](file:///d:/claude/nomad/plugins/csi/plugin.go#L177) |
| `ToCSIRepresentation` | `r *NodeStageVolumeRequest` | `` | `*csipbv1.NodeStageVolumeRequest` | [L225](file:///d:/claude/nomad/plugins/csi/plugin.go#L225) |
| `Validate` | `r *NodeStageVolumeRequest` | `` | `error` | [L240](file:///d:/claude/nomad/plugins/csi/plugin.go#L240) |
| `HasControllerService` | `p *PluginCapabilitySet` | `` | `bool` | [L261](file:///d:/claude/nomad/plugins/csi/plugin.go#L261) |
| `HasToplogies` | `p *PluginCapabilitySet` | `` | `bool` | [L268](file:///d:/claude/nomad/plugins/csi/plugin.go#L268) |
| `IsEqual` | `p *PluginCapabilitySet` | `o *PluginCapabilitySet` | `bool` | [L272](file:///d:/claude/nomad/plugins/csi/plugin.go#L272) |
| `NewTestPluginCapabilitySet` | - | `topologies bool, controller bool` | `*PluginCapabilitySet` | [L276](file:///d:/claude/nomad/plugins/csi/plugin.go#L276) |
| `NewPluginCapabilitySet` | - | `capabilities *csipbv1.GetPluginCapabilitiesResponse` | `*PluginCapabilitySet` | [L283](file:///d:/claude/nomad/plugins/csi/plugin.go#L283) |
| `NewControllerCapabilitySet` | - | `resp *csipbv1.ControllerGetCapabilitiesResponse` | `*ControllerCapabilitySet` | [L321](file:///d:/claude/nomad/plugins/csi/plugin.go#L321) |
| `ToCSIRepresentation` | `r *ControllerValidateVolumeRequest` | `` | `*csipbv1.ValidateVolumeCapabilitiesRequest` | [L369](file:///d:/claude/nomad/plugins/csi/plugin.go#L369) |
| `ToCSIRepresentation` | `r *ControllerPublishVolumeRequest` | `` | `*csipbv1.ControllerPublishVolumeRequest` | [L397](file:///d:/claude/nomad/plugins/csi/plugin.go#L397) |
| `Validate` | `r *ControllerPublishVolumeRequest` | `` | `error` | [L412](file:///d:/claude/nomad/plugins/csi/plugin.go#L412) |
| `ToCSIRepresentation` | `r *ControllerUnpublishVolumeRequest` | `` | `*csipbv1.ControllerUnpublishVolumeRequest` | [L432](file:///d:/claude/nomad/plugins/csi/plugin.go#L432) |
| `Validate` | `r *ControllerUnpublishVolumeRequest` | `` | `error` | [L444](file:///d:/claude/nomad/plugins/csi/plugin.go#L444) |
| `ToCSIRepresentation` | `r *ControllerCreateVolumeRequest` | `` | `*csipbv1.CreateVolumeRequest` | [L471](file:///d:/claude/nomad/plugins/csi/plugin.go#L471) |
| `Validate` | `r *ControllerCreateVolumeRequest` | `` | `error` | [L492](file:///d:/claude/nomad/plugins/csi/plugin.go#L492) |
| `ToCSIRepresentation` | `vcr *VolumeContentSource` | `` | `*csipbv1.VolumeContentSource` | [L526](file:///d:/claude/nomad/plugins/csi/plugin.go#L526) |
| `newVolumeContentSource` | - | `src *csipbv1.VolumeContentSource` | `*VolumeContentSource` | [L551](file:///d:/claude/nomad/plugins/csi/plugin.go#L551) |
| `ToCSIRepresentation` | `tr *TopologyRequirement` | `` | `*csipbv1.TopologyRequirement` | [L563](file:///d:/claude/nomad/plugins/csi/plugin.go#L563) |
| `newTopologies` | - | `src []*csipbv1.Topology` | `[]*Topology` | [L582](file:///d:/claude/nomad/plugins/csi/plugin.go#L582) |
| `NewCreateVolumeResponse` | - | `resp *csipbv1.CreateVolumeResponse` | `*ControllerCreateVolumeResponse` | [L594](file:///d:/claude/nomad/plugins/csi/plugin.go#L594) |
| `ToCSIRepresentation` | `r *ControllerDeleteVolumeRequest` | `` | `*csipbv1.DeleteVolumeRequest` | [L621](file:///d:/claude/nomad/plugins/csi/plugin.go#L621) |
| `Validate` | `r *ControllerDeleteVolumeRequest` | `` | `error` | [L631](file:///d:/claude/nomad/plugins/csi/plugin.go#L631) |
| `Validate` | `r *ControllerExpandVolumeRequest` | `` | `error` | [L646](file:///d:/claude/nomad/plugins/csi/plugin.go#L646) |
| `ToCSIRepresentation` | `r *ControllerExpandVolumeRequest` | `` | `*csipbv1.ControllerExpandVolumeRequest` | [L661](file:///d:/claude/nomad/plugins/csi/plugin.go#L661) |
| `ToCSIRepresentation` | `r *ControllerListVolumesRequest` | `` | `*csipbv1.ListVolumesRequest` | [L686](file:///d:/claude/nomad/plugins/csi/plugin.go#L686) |
| `Validate` | `r *ControllerListVolumesRequest` | `` | `error` | [L696](file:///d:/claude/nomad/plugins/csi/plugin.go#L696) |
| `NewListVolumesResponse` | - | `resp *csipbv1.ListVolumesResponse` | `*ControllerListVolumesResponse` | [L708](file:///d:/claude/nomad/plugins/csi/plugin.go#L708) |
| `ToCSIRepresentation` | `r *ControllerCreateSnapshotRequest` | `` | `*csipbv1.CreateSnapshotRequest` | [L763](file:///d:/claude/nomad/plugins/csi/plugin.go#L763) |
| `Validate` | `r *ControllerCreateSnapshotRequest` | `` | `error` | [L772](file:///d:/claude/nomad/plugins/csi/plugin.go#L772) |
| `ToCSIRepresentation` | `r *ControllerDeleteSnapshotRequest` | `` | `*csipbv1.DeleteSnapshotRequest` | [L799](file:///d:/claude/nomad/plugins/csi/plugin.go#L799) |
| `Validate` | `r *ControllerDeleteSnapshotRequest` | `` | `error` | [L806](file:///d:/claude/nomad/plugins/csi/plugin.go#L806) |
| `ToCSIRepresentation` | `r *ControllerListSnapshotsRequest` | `` | `*csipbv1.ListSnapshotsRequest` | [L819](file:///d:/claude/nomad/plugins/csi/plugin.go#L819) |
| `Validate` | `r *ControllerListSnapshotsRequest` | `` | `error` | [L827](file:///d:/claude/nomad/plugins/csi/plugin.go#L827) |
| `NewListSnapshotsResponse` | - | `resp *csipbv1.ListSnapshotsResponse` | `*ControllerListSnapshotsResponse` | [L834](file:///d:/claude/nomad/plugins/csi/plugin.go#L834) |
| `NewNodeCapabilitySet` | - | `resp *csipbv1.NodeGetCapabilitiesResponse` | `*NodeCapabilitySet` | [L875](file:///d:/claude/nomad/plugins/csi/plugin.go#L875) |
| `String` | `a *VolumeAccessMode` | `` | `string` | [L912](file:///d:/claude/nomad/plugins/csi/plugin.go#L912) |
| `ToCSIRepresentation` | `a *VolumeAccessMode` | `` | `csipbv1.VolumeCapability_AccessMode_Mode` | [L916](file:///d:/claude/nomad/plugins/csi/plugin.go#L916) |
| `String` | `v *VolumeAccessType` | `` | `string` | [L932](file:///d:/claude/nomad/plugins/csi/plugin.go#L932) |
| `VolumeCapabilityFromStructs` | - | `sAccessType structs.VolumeAttachmentMode, sAccessMode structs.VolumeAccessMod...` | `*VolumeCapability, error` | [L951](file:///d:/claude/nomad/plugins/csi/plugin.go#L951) |
| `ToCSIRepresentation` | `c *VolumeCapability` | `` | `*csipbv1.VolumeCapability` | [L993](file:///d:/claude/nomad/plugins/csi/plugin.go#L993) |
| `Validate` | `c *CapacityRange` | `` | `error` | [L1023](file:///d:/claude/nomad/plugins/csi/plugin.go#L1023) |
| `ToCSIRepresentation` | `c *CapacityRange` | `` | `*csipbv1.CapacityRange` | [L1036](file:///d:/claude/nomad/plugins/csi/plugin.go#L1036) |
| `Validate` | `r *NodeExpandVolumeRequest` | `` | `error` | [L1054](file:///d:/claude/nomad/plugins/csi/plugin.go#L1054) |
| `ToCSIRepresentation` | `r *NodeExpandVolumeRequest` | `` | `*csipbv1.NodeExpandVolumeRequest` | [L1068](file:///d:/claude/nomad/plugins/csi/plugin.go#L1068) |

## 5. 核心方法详解

### Validate()

**签名**：`func (r *NodePublishVolumeRequest) Validate() error`

**位置**：[L177](file:///d:/claude/nomad/plugins/csi/plugin.go#L177)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Validate()

**签名**：`func (r *NodeStageVolumeRequest) Validate() error`

**位置**：[L240](file:///d:/claude/nomad/plugins/csi/plugin.go#L240)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### NewTestPluginCapabilitySet()

**签名**：`func NewTestPluginCapabilitySet(topologies bool, controller bool) *PluginCapabilitySet`

**位置**：[L276](file:///d:/claude/nomad/plugins/csi/plugin.go#L276)

**中文说明**：创建并返回一个新的 TestPluginCapabilitySet 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `topologies` | `bool` | 布尔值 |
| `controller` | `bool` | 布尔值 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*PluginCapabilitySet` | — |

### NewPluginCapabilitySet()

**签名**：`func NewPluginCapabilitySet(capabilities *csipbv1.GetPluginCapabilitiesResponse) *PluginCapabilitySet`

**位置**：[L283](file:///d:/claude/nomad/plugins/csi/plugin.go#L283)

**中文说明**：创建并返回一个新的 PluginCapabilitySet 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `capabilities` | `*csipbv1.GetPluginCapabilitiesResponse` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*PluginCapabilitySet` | — |

### NewControllerCapabilitySet()

**签名**：`func NewControllerCapabilitySet(resp *csipbv1.ControllerGetCapabilitiesResponse) *ControllerCapabilitySet`

**位置**：[L321](file:///d:/claude/nomad/plugins/csi/plugin.go#L321)

**中文说明**：创建并返回一个新的 ControllerCapabilitySet 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `resp` | `*csipbv1.ControllerGetCapabilitiesResponse` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ControllerCapabilitySet` | — |

### Validate()

**签名**：`func (r *ControllerPublishVolumeRequest) Validate() error`

**位置**：[L412](file:///d:/claude/nomad/plugins/csi/plugin.go#L412)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Validate()

**签名**：`func (r *ControllerUnpublishVolumeRequest) Validate() error`

**位置**：[L444](file:///d:/claude/nomad/plugins/csi/plugin.go#L444)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Validate()

**签名**：`func (r *ControllerCreateVolumeRequest) Validate() error`

**位置**：[L492](file:///d:/claude/nomad/plugins/csi/plugin.go#L492)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### NewCreateVolumeResponse()

**签名**：`func NewCreateVolumeResponse(resp *csipbv1.CreateVolumeResponse) *ControllerCreateVolumeResponse`

**位置**：[L594](file:///d:/claude/nomad/plugins/csi/plugin.go#L594)

**中文说明**：创建并返回一个新的 CreateVolumeResponse 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `resp` | `*csipbv1.CreateVolumeResponse` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ControllerCreateVolumeResponse` | — |

### Validate()

**签名**：`func (r *ControllerDeleteVolumeRequest) Validate() error`

**位置**：[L631](file:///d:/claude/nomad/plugins/csi/plugin.go#L631)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Validate()

**签名**：`func (r *ControllerExpandVolumeRequest) Validate() error`

**位置**：[L646](file:///d:/claude/nomad/plugins/csi/plugin.go#L646)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Validate()

**签名**：`func (r *ControllerListVolumesRequest) Validate() error`

**位置**：[L696](file:///d:/claude/nomad/plugins/csi/plugin.go#L696)

**中文说明**：验证对象的有效性。

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
| `fmt` | 标准库 |
| `google.golang.org/grpc` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/container-storage-interface/spec/lib/go/csi` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **gRPC 通信**：使用 gRPC 进行进程间通信
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [client.go](file:///d:/claude/nomad/plugins/csi/client.go) | 同目录源文件 |

