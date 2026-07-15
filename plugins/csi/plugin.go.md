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

**类型**：interface

```go
	base.BasePlugin
	PluginProbe
	PluginGetInfo
	PluginGetCapabilities
	ControllerGetCapabilities
	ControllerPublishVolume
	ControllerUnpublishVolume
	ControllerValidateCapabilities
	ControllerCreateVolume
	ControllerDeleteVolume
	ControllerListVolumes
	ControllerExpandVolume
	ControllerCreateSnapshot
	ControllerDeleteSnapshot
	ControllerListSnapshots
	NodeGetCapabilities
	NodeGetInfo
	NodeStageVolume
	NodeUnstageVolume
	NodePublishVolume
	NodeUnpublishVolume
	NodeExpandVolume
	Close
```

### NodePublishVolumeRequest

**定义位置**：[L117](file:///d:/claude/nomad/plugins/csi/plugin.go#L117)

**类型**：struct

```go
	ExternalID string
	PublishContext map[string]string
	StagingTargetPath string
	TargetPath string
	VolumeCapability *VolumeCapability
	Readonly bool
	Secrets structs.CSISecrets
	VolumeContext map[string]string
```

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### NodeStageVolumeRequest

**定义位置**：[L193](file:///d:/claude/nomad/plugins/csi/plugin.go#L193)

**类型**：struct

```go
	ExternalID string
	PublishContext map[string]string
	StagingTargetPath string
	VolumeCapability *VolumeCapability
	Secrets structs.CSISecrets
	VolumeContext map[string]string
```

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### PluginCapabilitySet

**定义位置**：[L256](file:///d:/claude/nomad/plugins/csi/plugin.go#L256)

**类型**：struct

```go
	hasControllerService bool
	hasTopologies bool
```

**关联方法**（3 个）：`HasControllerService`, `HasToplogies`, `IsEqual`

### ControllerCapabilitySet

**定义位置**：[L306](file:///d:/claude/nomad/plugins/csi/plugin.go#L306)

**类型**：struct

```go
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
```

### ControllerValidateVolumeRequest

**定义位置**：[L361](file:///d:/claude/nomad/plugins/csi/plugin.go#L361)

**类型**：struct

```go
	ExternalID string
	Secrets structs.CSISecrets
	Capabilities []*VolumeCapability
	Parameters map[string]string
	Context map[string]string
```

**关联方法**（1 个）：`ToCSIRepresentation`

### ControllerPublishVolumeRequest

**定义位置**：[L388](file:///d:/claude/nomad/plugins/csi/plugin.go#L388)

**类型**：struct

```go
	ExternalID string
	NodeID string
	ReadOnly bool
	VolumeCapability *VolumeCapability
	Secrets structs.CSISecrets
	VolumeContext map[string]string
```

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerPublishVolumeResponse

**定义位置**：[L422](file:///d:/claude/nomad/plugins/csi/plugin.go#L422)

**类型**：struct

```go
	PublishContext map[string]string
```

### ControllerUnpublishVolumeRequest

**定义位置**：[L426](file:///d:/claude/nomad/plugins/csi/plugin.go#L426)

**类型**：struct

```go
	ExternalID string
	NodeID string
	Secrets structs.CSISecrets
```

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerUnpublishVolumeResponse

**定义位置**：[L456](file:///d:/claude/nomad/plugins/csi/plugin.go#L456)

**类型**：struct

### ControllerCreateVolumeRequest

**定义位置**：[L458](file:///d:/claude/nomad/plugins/csi/plugin.go#L458)

**类型**：struct

```go
	Name string
	CapacityRange *CapacityRange
	VolumeCapabilities []*VolumeCapability
	Parameters map[string]string
	Secrets structs.CSISecrets
	ContentSource *VolumeContentSource
	AccessibilityRequirements *TopologyRequirement
```

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### VolumeContentSource

**定义位置**：[L521](file:///d:/claude/nomad/plugins/csi/plugin.go#L521)

**类型**：struct

```go
	SnapshotID string
	CloneID string
```

**关联方法**（1 个）：`ToCSIRepresentation`

### TopologyRequirement

**定义位置**：[L558](file:///d:/claude/nomad/plugins/csi/plugin.go#L558)

**类型**：struct

```go
	Requisite []*Topology
	Preferred []*Topology
```

**关联方法**（1 个）：`ToCSIRepresentation`

### ControllerCreateVolumeResponse

**定义位置**：[L590](file:///d:/claude/nomad/plugins/csi/plugin.go#L590)

**类型**：struct

```go
	Volume *Volume
```

### Volume

**定义位置**：[L605](file:///d:/claude/nomad/plugins/csi/plugin.go#L605)

**类型**：struct

```go
	CapacityBytes int64
	ExternalVolumeID string
	VolumeContext map[string]string
	ContentSource *VolumeContentSource
	AccessibleTopology []*Topology
```

### ControllerDeleteVolumeRequest

**定义位置**：[L616](file:///d:/claude/nomad/plugins/csi/plugin.go#L616)

**类型**：struct

```go
	ExternalVolumeID string
	Secrets structs.CSISecrets
```

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerExpandVolumeRequest

**定义位置**：[L638](file:///d:/claude/nomad/plugins/csi/plugin.go#L638)

**类型**：struct

```go
	ExternalVolumeID string
	RequiredBytes int64
	LimitBytes int64
	Capability *VolumeCapability
	Secrets structs.CSISecrets
```

**关联方法**（2 个）：`Validate`, `ToCSIRepresentation`

### ControllerExpandVolumeResponse

**定义位置**：[L676](file:///d:/claude/nomad/plugins/csi/plugin.go#L676)

**类型**：struct

```go
	CapacityBytes int64
	NodeExpansionRequired bool
```

### ControllerListVolumesRequest

**定义位置**：[L681](file:///d:/claude/nomad/plugins/csi/plugin.go#L681)

**类型**：struct

```go
	MaxEntries int32
	StartingToken string
```

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerListVolumesResponse

**定义位置**：[L703](file:///d:/claude/nomad/plugins/csi/plugin.go#L703)

**类型**：struct

```go
	Entries []*ListVolumesResponse_Entry
	NextToken string
```

### ListVolumesResponse_Entry

**定义位置**：[L741](file:///d:/claude/nomad/plugins/csi/plugin.go#L741)

**类型**：struct

```go
	Volume *Volume
	Status *ListVolumesResponse_VolumeStatus
```

### ListVolumesResponse_VolumeStatus

**定义位置**：[L746](file:///d:/claude/nomad/plugins/csi/plugin.go#L746)

**类型**：struct

```go
	PublishedNodeIds []string
	VolumeCondition *VolumeCondition
```

### VolumeCondition

**定义位置**：[L751](file:///d:/claude/nomad/plugins/csi/plugin.go#L751)

**类型**：struct

```go
	Abnormal bool
	Message string
```

### ControllerCreateSnapshotRequest

**定义位置**：[L756](file:///d:/claude/nomad/plugins/csi/plugin.go#L756)

**类型**：struct

```go
	VolumeID string
	Name string
	Secrets structs.CSISecrets
	Parameters map[string]string
```

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerCreateSnapshotResponse

**定义位置**：[L782](file:///d:/claude/nomad/plugins/csi/plugin.go#L782)

**类型**：struct

```go
	Snapshot *Snapshot
```

### Snapshot

**定义位置**：[L786](file:///d:/claude/nomad/plugins/csi/plugin.go#L786)

**类型**：struct

```go
	ID string
	SourceVolumeID string
	SizeBytes int64
	CreateTime int64
	IsReady bool
```

### ControllerDeleteSnapshotRequest

**定义位置**：[L794](file:///d:/claude/nomad/plugins/csi/plugin.go#L794)

**类型**：struct

```go
	SnapshotID string
	Secrets structs.CSISecrets
```

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerListSnapshotsRequest

**定义位置**：[L813](file:///d:/claude/nomad/plugins/csi/plugin.go#L813)

**类型**：struct

```go
	MaxEntries int32
	StartingToken string
	Secrets structs.CSISecrets
```

**关联方法**（2 个）：`ToCSIRepresentation`, `Validate`

### ControllerListSnapshotsResponse

**定义位置**：[L859](file:///d:/claude/nomad/plugins/csi/plugin.go#L859)

**类型**：struct

```go
	Entries []*ListSnapshotsResponse_Entry
	NextToken string
```

### ListSnapshotsResponse_Entry

**定义位置**：[L864](file:///d:/claude/nomad/plugins/csi/plugin.go#L864)

**类型**：struct

```go
	Snapshot *Snapshot
```

### NodeCapabilitySet

**定义位置**：[L868](file:///d:/claude/nomad/plugins/csi/plugin.go#L868)

**类型**：struct

```go
	HasStageUnstageVolume bool
	HasGetVolumeStats bool
	HasExpandVolume bool
	HasVolumeCondition bool
```

### VolumeAccessMode

**定义位置**：[L899](file:///d:/claude/nomad/plugins/csi/plugin.go#L899)

**类型定义**：`csipbv1.VolumeCapability_AccessMode_Mode`

**关联方法**（2 个）：`String`, `ToCSIRepresentation`

### VolumeAccessType

**定义位置**：[L923](file:///d:/claude/nomad/plugins/csi/plugin.go#L923)

**类型定义**：`int32`

**关联方法**（1 个）：`String`

### VolumeCapability

**定义位置**：[L943](file:///d:/claude/nomad/plugins/csi/plugin.go#L943)

**类型**：struct

```go
	AccessType VolumeAccessType
	AccessMode VolumeAccessMode
	MountVolume *structs.CSIMountOptions
```

**关联方法**（1 个）：`ToCSIRepresentation`

### CapacityRange

**定义位置**：[L1018](file:///d:/claude/nomad/plugins/csi/plugin.go#L1018)

**类型**：struct

```go
	RequiredBytes int64
	LimitBytes int64
```

**关联方法**（2 个）：`Validate`, `ToCSIRepresentation`

### NodeExpandVolumeRequest

**定义位置**：[L1046](file:///d:/claude/nomad/plugins/csi/plugin.go#L1046)

**类型**：struct

```go
	ExternalVolumeID string
	CapacityRange *CapacityRange
	Capability *VolumeCapability
	TargetPath string
	StagingPath string
```

**关联方法**（2 个）：`Validate`, `ToCSIRepresentation`

### NodeExpandVolumeResponse

**定义位置**：[L1081](file:///d:/claude/nomad/plugins/csi/plugin.go#L1081)

**类型**：struct

```go
	CapacityBytes int64
```

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `_` | `VolumeAccessModeUnknown` |
| `VolumeAccessModeUnknown` | `VolumeAccessMode(csipbv1.VolumeCapability_AccessMode_UNKN...` |
| `VolumeAccessModeSingleNodeWriter` | `VolumeAccessMode(csipbv1.VolumeCapability_AccessMode_SING...` |
| `VolumeAccessModeSingleNodeReaderOnly` | `VolumeAccessMode(csipbv1.VolumeCapability_AccessMode_SING...` |
| `VolumeAccessModeMultiNodeReaderOnly` | `VolumeAccessMode(csipbv1.VolumeCapability_AccessMode_MULT...` |
| `VolumeAccessModeMultiNodeSingleWriter` | `VolumeAccessMode(csipbv1.VolumeCapability_AccessMode_MULT...` |
| `VolumeAccessModeMultiNodeMultiWriter` | `VolumeAccessMode(csipbv1.VolumeCapability_AccessMode_MULT...` |
| `_` | `VolumeAccessTypeBlock` |
| `VolumeAccessTypeBlock` | `1` |
| `VolumeAccessTypeMount` | `2` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ToCSIRepresentation` | `r *NodePublishVolumeRequest` | - | `*csipbv1.NodePublishVolumeRequest` | [L160](file:///d:/claude/nomad/plugins/csi/plugin.go#L160) |
| `Validate` | `r *NodePublishVolumeRequest` | - | `error` | [L177](file:///d:/claude/nomad/plugins/csi/plugin.go#L177) |
| `ToCSIRepresentation` | `r *NodeStageVolumeRequest` | - | `*csipbv1.NodeStageVolumeRequest` | [L225](file:///d:/claude/nomad/plugins/csi/plugin.go#L225) |
| `Validate` | `r *NodeStageVolumeRequest` | - | `error` | [L240](file:///d:/claude/nomad/plugins/csi/plugin.go#L240) |
| `HasControllerService` | `p *PluginCapabilitySet` | - | `bool` | [L261](file:///d:/claude/nomad/plugins/csi/plugin.go#L261) |
| `HasToplogies` | `p *PluginCapabilitySet` | - | `bool` | [L268](file:///d:/claude/nomad/plugins/csi/plugin.go#L268) |
| `IsEqual` | `p *PluginCapabilitySet` | `o *PluginCapabilitySet` | `bool` | [L272](file:///d:/claude/nomad/plugins/csi/plugin.go#L272) |
| `NewTestPluginCapabilitySet` | - | `topologies bool, controller bool` | `*PluginCapabilitySet` | [L276](file:///d:/claude/nomad/plugins/csi/plugin.go#L276) |
| `NewPluginCapabilitySet` | - | `capabilities *csipbv1.GetPluginCapabilitiesResponse` | `*PluginCapabilitySet` | [L283](file:///d:/claude/nomad/plugins/csi/plugin.go#L283) |
| `NewControllerCapabilitySet` | - | `resp *csipbv1.ControllerGetCapabilitiesResponse` | `*ControllerCapabilitySet` | [L321](file:///d:/claude/nomad/plugins/csi/plugin.go#L321) |
| `ToCSIRepresentation` | `r *ControllerValidateVolumeRequest` | - | `*csipbv1.ValidateVolumeCapabilitiesRequest` | [L369](file:///d:/claude/nomad/plugins/csi/plugin.go#L369) |
| `ToCSIRepresentation` | `r *ControllerPublishVolumeRequest` | - | `*csipbv1.ControllerPublishVolumeRequest` | [L397](file:///d:/claude/nomad/plugins/csi/plugin.go#L397) |
| `Validate` | `r *ControllerPublishVolumeRequest` | - | `error` | [L412](file:///d:/claude/nomad/plugins/csi/plugin.go#L412) |
| `ToCSIRepresentation` | `r *ControllerUnpublishVolumeRequest` | - | `*csipbv1.ControllerUnpublishVolumeRequest` | [L432](file:///d:/claude/nomad/plugins/csi/plugin.go#L432) |
| `Validate` | `r *ControllerUnpublishVolumeRequest` | - | `error` | [L444](file:///d:/claude/nomad/plugins/csi/plugin.go#L444) |
| `ToCSIRepresentation` | `r *ControllerCreateVolumeRequest` | - | `*csipbv1.CreateVolumeRequest` | [L471](file:///d:/claude/nomad/plugins/csi/plugin.go#L471) |
| `Validate` | `r *ControllerCreateVolumeRequest` | - | `error` | [L492](file:///d:/claude/nomad/plugins/csi/plugin.go#L492) |
| `ToCSIRepresentation` | `vcr *VolumeContentSource` | - | `*csipbv1.VolumeContentSource` | [L526](file:///d:/claude/nomad/plugins/csi/plugin.go#L526) |
| `newVolumeContentSource` | - | `src *csipbv1.VolumeContentSource` | `*VolumeContentSource` | [L551](file:///d:/claude/nomad/plugins/csi/plugin.go#L551) |
| `ToCSIRepresentation` | `tr *TopologyRequirement` | - | `*csipbv1.TopologyRequirement` | [L563](file:///d:/claude/nomad/plugins/csi/plugin.go#L563) |
| `newTopologies` | - | `src []*csipbv1.Topology` | `[]*Topology` | [L582](file:///d:/claude/nomad/plugins/csi/plugin.go#L582) |
| `NewCreateVolumeResponse` | - | `resp *csipbv1.CreateVolumeResponse` | `*ControllerCreateVolumeResponse` | [L594](file:///d:/claude/nomad/plugins/csi/plugin.go#L594) |
| `ToCSIRepresentation` | `r *ControllerDeleteVolumeRequest` | - | `*csipbv1.DeleteVolumeRequest` | [L621](file:///d:/claude/nomad/plugins/csi/plugin.go#L621) |
| `Validate` | `r *ControllerDeleteVolumeRequest` | - | `error` | [L631](file:///d:/claude/nomad/plugins/csi/plugin.go#L631) |
| `Validate` | `r *ControllerExpandVolumeRequest` | - | `error` | [L646](file:///d:/claude/nomad/plugins/csi/plugin.go#L646) |
| `ToCSIRepresentation` | `r *ControllerExpandVolumeRequest` | - | `*csipbv1.ControllerExpandVolumeRequest` | [L661](file:///d:/claude/nomad/plugins/csi/plugin.go#L661) |
| `ToCSIRepresentation` | `r *ControllerListVolumesRequest` | - | `*csipbv1.ListVolumesRequest` | [L686](file:///d:/claude/nomad/plugins/csi/plugin.go#L686) |
| `Validate` | `r *ControllerListVolumesRequest` | - | `error` | [L696](file:///d:/claude/nomad/plugins/csi/plugin.go#L696) |
| `NewListVolumesResponse` | - | `resp *csipbv1.ListVolumesResponse` | `*ControllerListVolumesResponse` | [L708](file:///d:/claude/nomad/plugins/csi/plugin.go#L708) |
| `ToCSIRepresentation` | `r *ControllerCreateSnapshotRequest` | - | `*csipbv1.CreateSnapshotRequest` | [L763](file:///d:/claude/nomad/plugins/csi/plugin.go#L763) |
| `Validate` | `r *ControllerCreateSnapshotRequest` | - | `error` | [L772](file:///d:/claude/nomad/plugins/csi/plugin.go#L772) |
| `ToCSIRepresentation` | `r *ControllerDeleteSnapshotRequest` | - | `*csipbv1.DeleteSnapshotRequest` | [L799](file:///d:/claude/nomad/plugins/csi/plugin.go#L799) |
| `Validate` | `r *ControllerDeleteSnapshotRequest` | - | `error` | [L806](file:///d:/claude/nomad/plugins/csi/plugin.go#L806) |
| `ToCSIRepresentation` | `r *ControllerListSnapshotsRequest` | - | `*csipbv1.ListSnapshotsRequest` | [L819](file:///d:/claude/nomad/plugins/csi/plugin.go#L819) |
| `Validate` | `r *ControllerListSnapshotsRequest` | - | `error` | [L827](file:///d:/claude/nomad/plugins/csi/plugin.go#L827) |
| `NewListSnapshotsResponse` | - | `resp *csipbv1.ListSnapshotsResponse` | `*ControllerListSnapshotsResponse` | [L834](file:///d:/claude/nomad/plugins/csi/plugin.go#L834) |
| `NewNodeCapabilitySet` | - | `resp *csipbv1.NodeGetCapabilitiesResponse` | `*NodeCapabilitySet` | [L875](file:///d:/claude/nomad/plugins/csi/plugin.go#L875) |
| `String` | `a *VolumeAccessMode` | - | `string` | [L912](file:///d:/claude/nomad/plugins/csi/plugin.go#L912) |
| `ToCSIRepresentation` | `a *VolumeAccessMode` | - | `csipbv1.VolumeCapability_AccessMode_Mode` | [L916](file:///d:/claude/nomad/plugins/csi/plugin.go#L916) |
| `String` | `v *VolumeAccessType` | - | `string` | [L932](file:///d:/claude/nomad/plugins/csi/plugin.go#L932) |
| `VolumeCapabilityFromStructs` | - | `sAccessType structs.VolumeAttachmentMode, sAccessMode structs.VolumeAccessMo...` | `*VolumeCapability, error` | [L951](file:///d:/claude/nomad/plugins/csi/plugin.go#L951) |
| `ToCSIRepresentation` | `c *VolumeCapability` | - | `*csipbv1.VolumeCapability` | [L993](file:///d:/claude/nomad/plugins/csi/plugin.go#L993) |
| `Validate` | `c *CapacityRange` | - | `error` | [L1023](file:///d:/claude/nomad/plugins/csi/plugin.go#L1023) |
| `ToCSIRepresentation` | `c *CapacityRange` | - | `*csipbv1.CapacityRange` | [L1036](file:///d:/claude/nomad/plugins/csi/plugin.go#L1036) |
| `Validate` | `r *NodeExpandVolumeRequest` | - | `error` | [L1054](file:///d:/claude/nomad/plugins/csi/plugin.go#L1054) |
| `ToCSIRepresentation` | `r *NodeExpandVolumeRequest` | - | `*csipbv1.NodeExpandVolumeRequest` | [L1068](file:///d:/claude/nomad/plugins/csi/plugin.go#L1068) |

## 5. 核心方法详解

### Validate()

**签名**：`func (r *NodePublishVolumeRequest) Validate() error`

**位置**：[L177](file:///d:/claude/nomad/plugins/csi/plugin.go#L177)

### Validate()

**签名**：`func (r *NodeStageVolumeRequest) Validate() error`

**位置**：[L240](file:///d:/claude/nomad/plugins/csi/plugin.go#L240)

### NewTestPluginCapabilitySet()

**签名**：`func NewTestPluginCapabilitySet(topologies bool, controller bool) *PluginCapabilitySet`

**位置**：[L276](file:///d:/claude/nomad/plugins/csi/plugin.go#L276)

### NewPluginCapabilitySet()

**签名**：`func NewPluginCapabilitySet(capabilities *csipbv1.GetPluginCapabilitiesResponse) *PluginCapabilitySet`

**位置**：[L283](file:///d:/claude/nomad/plugins/csi/plugin.go#L283)

### NewControllerCapabilitySet()

**签名**：`func NewControllerCapabilitySet(resp *csipbv1.ControllerGetCapabilitiesResponse) *ControllerCapabilitySet`

**位置**：[L321](file:///d:/claude/nomad/plugins/csi/plugin.go#L321)

### Validate()

**签名**：`func (r *ControllerPublishVolumeRequest) Validate() error`

**位置**：[L412](file:///d:/claude/nomad/plugins/csi/plugin.go#L412)

### Validate()

**签名**：`func (r *ControllerUnpublishVolumeRequest) Validate() error`

**位置**：[L444](file:///d:/claude/nomad/plugins/csi/plugin.go#L444)

### Validate()

**签名**：`func (r *ControllerCreateVolumeRequest) Validate() error`

**位置**：[L492](file:///d:/claude/nomad/plugins/csi/plugin.go#L492)

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

## 8. 相关文件

| 文件 | 关系 |
|------|------|

