# csi.go 代码说明文档

> 文件路径：[structs/csi.go](file:///d:/claude/nomad/nomad/structs/csi.go)
> 总行数：1654 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### CSIPluginType

**定义位置**：[L33](file:///d:/claude/nomad/nomad/structs/csi.go#L33)

**类型定义**：`string`

### TaskCSIPluginConfig

**定义位置**：[L63](file:///d:/claude/nomad/nomad/structs/csi.go#L63)

**类型**：struct

```go
	ID string
	Type CSIPluginType
	MountDir string
	StagePublishBaseDir string
	HealthTimeout time.Duration `mapstructure:"health_timeout" hcl:"health_timeout,optional"`
```

**关联方法**（2 个）：`Equal`, `Copy`

### CSIVolumeCapability

**定义位置**：[L119](file:///d:/claude/nomad/nomad/structs/csi.go#L119)

**类型**：struct

```go
	AttachmentMode VolumeAttachmentMode
	AccessMode VolumeAccessMode
```

### CSIMountOptions

**定义位置**：[L143](file:///d:/claude/nomad/nomad/structs/csi.go#L143)

**类型**：struct

```go
	FSType string
	MountFlags []string
```

**关联方法**（6 个）：`Copy`, `Merge`, `Equal`, `String`, `GoString`, `Sanitize`

### CSISecrets

**定义位置**：[L218](file:///d:/claude/nomad/nomad/structs/csi.go#L218)

**类型定义**：`map[string]string`

**关联方法**（2 个）：`String`, `GoString`

### CSIVolumeClaim

**定义位置**：[L237](file:///d:/claude/nomad/nomad/structs/csi.go#L237)

**类型**：struct

```go
	AllocationID string
	NodeID string
	ExternalNodeID string
	Mode CSIVolumeClaimMode
	AccessMode VolumeAccessMode
	AttachmentMode VolumeAttachmentMode
	State CSIVolumeClaimState
```

### CSIVolumeClaimState

**定义位置**：[L247](file:///d:/claude/nomad/nomad/structs/csi.go#L247)

**类型定义**：`int`

### CSIVolume

**定义位置**：[L258](file:///d:/claude/nomad/nomad/structs/csi.go#L258)

**类型**：struct

```go
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
```

**关联方法**（21 个）：`GetID`, `GetNamespace`, `GetCreateIndex`, `newStructs`, `RemoteID`, `Stub`, `ReadSchedulable`, `WriteSchedulable`, `HasFreeReadClaims`, `HasFreeWriteClaims`, `InUse`, `Copy`, `Sanitize`, `Claim`, `claimRead`, `claimWrite`, `setModesFromClaim`, `claimRelease`, `Equal`, `Validate`, `Merge`

### CSIVolListStub

**定义位置**：[L350](file:///d:/claude/nomad/nomad/structs/csi.go#L350)

**类型**：struct

```go
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
```

### CSIVolumeRegisterRequest

**定义位置**：[L882](file:///d:/claude/nomad/nomad/structs/csi.go#L882)

**类型**：struct

```go
	Volumes []*CSIVolume
	Timestamp int64
	PolicyOverride bool
	WriteRequest
```

### CSIVolumeRegisterResponse

**定义位置**：[L893](file:///d:/claude/nomad/nomad/structs/csi.go#L893)

**类型**：struct

```go
	Volumes []*CSIVolume
	Warnings string
	QueryMeta
```

### CSIVolumeDeregisterRequest

**定义位置**：[L901](file:///d:/claude/nomad/nomad/structs/csi.go#L901)

**类型**：struct

```go
	VolumeIDs []string
	Force bool
	WriteRequest
```

### CSIVolumeDeregisterResponse

**定义位置**：[L907](file:///d:/claude/nomad/nomad/structs/csi.go#L907)

**类型**：struct

```go
	QueryMeta
```

### CSIVolumeCreateRequest

**定义位置**：[L911](file:///d:/claude/nomad/nomad/structs/csi.go#L911)

**类型**：struct

```go
	Volumes []*CSIVolume
	Timestamp int64
	PolicyOverride bool
	WriteRequest
```

### CSIVolumeCreateResponse

**定义位置**：[L922](file:///d:/claude/nomad/nomad/structs/csi.go#L922)

**类型**：struct

```go
	Volumes []*CSIVolume
	Warnings string
	QueryMeta
```

### CSIVolumeDeleteRequest

**定义位置**：[L930](file:///d:/claude/nomad/nomad/structs/csi.go#L930)

**类型**：struct

```go
	VolumeIDs []string
	Secrets CSISecrets
	WriteRequest
```

### CSIVolumeDeleteResponse

**定义位置**：[L936](file:///d:/claude/nomad/nomad/structs/csi.go#L936)

**类型**：struct

```go
	QueryMeta
```

### CSIVolumeExpandRequest

**定义位置**：[L940](file:///d:/claude/nomad/nomad/structs/csi.go#L940)

**类型**：struct

```go
	VolumeID string
	RequestedCapacityMin int64
	RequestedCapacityMax int64
	Secrets CSISecrets
	WriteRequest
```

### CSIVolumeExpandResponse

**定义位置**：[L948](file:///d:/claude/nomad/nomad/structs/csi.go#L948)

**类型**：struct

```go
	CapacityBytes int64
	QueryMeta
```

### CSIVolumeClaimMode

**定义位置**：[L953](file:///d:/claude/nomad/nomad/structs/csi.go#L953)

**类型定义**：`int`

### CSIVolumeClaimBatchRequest

**定义位置**：[L965](file:///d:/claude/nomad/nomad/structs/csi.go#L965)

**类型**：struct

```go
	Claims []CSIVolumeClaimRequest
```

### CSIVolumeClaimRequest

**定义位置**：[L969](file:///d:/claude/nomad/nomad/structs/csi.go#L969)

**类型**：struct

```go
	VolumeID string
	AllocationID string
	NodeID string
	ExternalNodeID string
	Claim CSIVolumeClaimMode
	AccessMode VolumeAccessMode
	AttachmentMode VolumeAttachmentMode
	State CSIVolumeClaimState
	Timestamp int64
	WriteRequest
```

**关联方法**（1 个）：`ToClaim`

### CSIVolumeClaimResponse

**定义位置**：[L994](file:///d:/claude/nomad/nomad/structs/csi.go#L994)

**类型**：struct

```go
	PublishContext map[string]string
	Volume *CSIVolume
	QueryMeta
```

### CSIVolumeListRequest

**定义位置**：[L1017](file:///d:/claude/nomad/nomad/structs/csi.go#L1017)

**类型**：struct

```go
	PluginID string
	NodeID string
	QueryOptions
```

### CSIVolumeListResponse

**定义位置**：[L1023](file:///d:/claude/nomad/nomad/structs/csi.go#L1023)

**类型**：struct

```go
	Volumes []*CSIVolListStub
	QueryMeta
```

### CSIVolumeExternalListRequest

**定义位置**：[L1032](file:///d:/claude/nomad/nomad/structs/csi.go#L1032)

**类型**：struct

```go
	PluginID string
	QueryOptions
```

### CSIVolumeExternalListResponse

**定义位置**：[L1037](file:///d:/claude/nomad/nomad/structs/csi.go#L1037)

**类型**：struct

```go
	Volumes []*CSIVolumeExternalStub
	NextToken string
	QueryMeta
```

### CSIVolumeExternalStub

**定义位置**：[L1045](file:///d:/claude/nomad/nomad/structs/csi.go#L1045)

**类型**：struct

```go
	ExternalID string
	CapacityBytes int64
	VolumeContext map[string]string
	CloneID string
	SnapshotID string
	PublishedExternalNodeIDs []string
	IsAbnormal bool
	Status string
```

### CSIVolumeGetRequest

**定义位置**：[L1057](file:///d:/claude/nomad/nomad/structs/csi.go#L1057)

**类型**：struct

```go
	ID string
	QueryOptions
```

### CSIVolumeGetResponse

**定义位置**：[L1062](file:///d:/claude/nomad/nomad/structs/csi.go#L1062)

**类型**：struct

```go
	Volume *CSIVolume
	QueryMeta
```

### CSIVolumeUnpublishRequest

**定义位置**：[L1067](file:///d:/claude/nomad/nomad/structs/csi.go#L1067)

**类型**：struct

```go
	VolumeID string
	Claim *CSIVolumeClaim
	WriteRequest
```

### CSIVolumeUnpublishResponse

**定义位置**：[L1073](file:///d:/claude/nomad/nomad/structs/csi.go#L1073)

**类型**：struct

```go
	QueryMeta
```

### CSISnapshot

**定义位置**：[L1078](file:///d:/claude/nomad/nomad/structs/csi.go#L1078)

**类型**：struct

```go
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
```

### CSISnapshotCreateRequest

**定义位置**：[L1097](file:///d:/claude/nomad/nomad/structs/csi.go#L1097)

**类型**：struct

```go
	Snapshots []*CSISnapshot
	WriteRequest
```

### CSISnapshotCreateResponse

**定义位置**：[L1102](file:///d:/claude/nomad/nomad/structs/csi.go#L1102)

**类型**：struct

```go
	Snapshots []*CSISnapshot
	QueryMeta
```

### CSISnapshotDeleteRequest

**定义位置**：[L1107](file:///d:/claude/nomad/nomad/structs/csi.go#L1107)

**类型**：struct

```go
	Snapshots []*CSISnapshot
	WriteRequest
```

### CSISnapshotDeleteResponse

**定义位置**：[L1112](file:///d:/claude/nomad/nomad/structs/csi.go#L1112)

**类型**：struct

```go
	QueryMeta
```

### CSISnapshotListRequest

**定义位置**：[L1120](file:///d:/claude/nomad/nomad/structs/csi.go#L1120)

**类型**：struct

```go
	PluginID string
	Secrets CSISecrets
	QueryOptions
```

### CSISnapshotListResponse

**定义位置**：[L1126](file:///d:/claude/nomad/nomad/structs/csi.go#L1126)

**类型**：struct

```go
	Snapshots []*CSISnapshot
	NextToken string
	QueryMeta
```

### CSIPlugin

**定义位置**：[L1133](file:///d:/claude/nomad/nomad/structs/csi.go#L1133)

**类型**：struct

```go
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
```

**关联方法**（13 个）：`newStructs`, `Copy`, `HasControllerCapability`, `HasNodeCapability`, `AddPlugin`, `DeleteNode`, `DeleteNodeForType`, `DeleteAlloc`, `AddJob`, `DeleteJob`, `UpdateExpectedWithJob`, `Stub`, `IsEmpty`

### CSIControllerCapability

**定义位置**：[L1211](file:///d:/claude/nomad/nomad/structs/csi.go#L1211)

**类型定义**：`byte`

### CSINodeCapability

**定义位置**：[L1263](file:///d:/claude/nomad/nomad/structs/csi.go#L1263)

**类型定义**：`byte`

### JobDescription

**定义位置**：[L1536](file:///d:/claude/nomad/nomad/structs/csi.go#L1536)

**类型**：struct

```go
	Namespace string
	ID string
	Expected int
```

### JobNamespacedDescriptions

**定义位置**：[L1543](file:///d:/claude/nomad/nomad/structs/csi.go#L1543)

**类型定义**：`map[string]JobDescription`

**关联方法**（1 个）：`Copy`

### JobDescriptions

**定义位置**：[L1554](file:///d:/claude/nomad/nomad/structs/csi.go#L1554)

**类型定义**：`map[string]JobNamespacedDescriptions`

**关联方法**（3 个）：`Add`, `Count`, `Delete`

### CSIPluginListStub

**定义位置**：[L1593](file:///d:/claude/nomad/nomad/structs/csi.go#L1593)

**类型**：struct

```go
	ID string
	Provider string
	ControllerRequired bool
	ControllersHealthy int
	ControllersExpected int
	NodesHealthy int
	NodesExpected int
	CreateIndex uint64
	ModifyIndex uint64
```

### CSIPluginListRequest

**定义位置**：[L1627](file:///d:/claude/nomad/nomad/structs/csi.go#L1627)

**类型**：struct

```go
	QueryOptions
```

### CSIPluginListResponse

**定义位置**：[L1631](file:///d:/claude/nomad/nomad/structs/csi.go#L1631)

**类型**：struct

```go
	Plugins []*CSIPluginListStub
	QueryMeta
```

### CSIPluginGetRequest

**定义位置**：[L1636](file:///d:/claude/nomad/nomad/structs/csi.go#L1636)

**类型**：struct

```go
	ID string
	QueryOptions
```

### CSIPluginGetResponse

**定义位置**：[L1641](file:///d:/claude/nomad/nomad/structs/csi.go#L1641)

**类型**：struct

```go
	Plugin *CSIPlugin
	QueryMeta
```

### CSIPluginDeleteRequest

**定义位置**：[L1646](file:///d:/claude/nomad/nomad/structs/csi.go#L1646)

**类型**：struct

```go
	ID string
	QueryOptions
```

### CSIPluginDeleteResponse

**定义位置**：[L1651](file:///d:/claude/nomad/nomad/structs/csi.go#L1651)

**类型**：struct

```go
	QueryMeta
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `CSISocketName` | `"csi.sock"` |
| `CSIIntermediaryDirname` | `"volumes"` |
| `VolumeTypeCSI` | `"csi"` |
| `CSIPluginTypeNode` | `"node"` |
| `CSIPluginTypeController` | `"controller"` |
| `CSIPluginTypeMonolith` | `"monolith"` |
| `CSIVolumeAttachmentModeUnknown` | `""` |
| `CSIVolumeAttachmentModeBlockDevice` | `"block-device"` |
| `CSIVolumeAttachmentModeFilesystem` | `"file-system"` |
| `CSIVolumeAccessModeUnknown` | `""` |
| `CSIVolumeAccessModeSingleNodeReader` | `"single-node-reader-only"` |
| `CSIVolumeAccessModeSingleNodeWriter` | `"single-node-writer"` |
| `CSIVolumeAccessModeMultiNodeReader` | `"multi-node-reader-only"` |
| `CSIVolumeAccessModeMultiNodeSingleWriter` | `"multi-node-single-writer"` |
| `CSIVolumeAccessModeMultiNodeMultiWriter` | `"multi-node-multi-writer"` |
| `CSIVolumeClaimStateTaken` | `iota` |
| `CSIVolumeClaimStateNodeDetached` | `` |
| `CSIVolumeClaimStateControllerDetached` | `` |
| `CSIVolumeClaimStateReadyToFree` | `` |
| `CSIVolumeClaimStateUnpublishing` | `` |
| `CSIVolumeClaimRead` | `iota` |
| `CSIVolumeClaimWrite` | `` |
| `CSIVolumeClaimGC` | `` |
| `CSIControllerSupportsCreateDelete` | `0` |
| `CSIControllerSupportsAttachDetach` | `1` |
| `CSIControllerSupportsListVolumes` | `2` |
| `CSIControllerSupportsGetCapacity` | `3` |
| `CSIControllerSupportsCreateDeleteSnapshot` | `4` |
| `CSIControllerSupportsListSnapshots` | `5` |
| `CSIControllerSupportsClone` | `6` |
| `CSIControllerSupportsReadOnlyAttach` | `7` |
| `CSIControllerSupportsExpand` | `8` |
| `CSIControllerSupportsListVolumesAttachedNodes` | `9` |
| `CSIControllerSupportsCondition` | `10` |
| `CSIControllerSupportsGet` | `11` |
| `CSINodeSupportsStageVolume` | `0` |
| `CSINodeSupportsStats` | `1` |
| `CSINodeSupportsExpand` | `2` |
| `CSINodeSupportsCondition` | `3` |

### 变量

| 名称 | 值 |
|------|----|
| `_` | `&CSIMountOptions{...}` |
| `_` | `&CSIMountOptions{...}` |
| `_` | `&CSISecrets{...}` |
| `_` | `&CSISecrets{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `CSIPluginTypeIsValid` | - | `pt CSIPluginType` | `bool` | [L51](file:///d:/claude/nomad/nomad/structs/csi.go#L51) |
| `Equal` | `t *TaskCSIPluginConfig` | `o *TaskCSIPluginConfig` | `bool` | [L87](file:///d:/claude/nomad/nomad/structs/csi.go#L87) |
| `Copy` | `t *TaskCSIPluginConfig` | - | `*TaskCSIPluginConfig` | [L106](file:///d:/claude/nomad/nomad/structs/csi.go#L106) |
| `Copy` | `o *CSIMountOptions` | - | `*CSIMountOptions` | [L154](file:///d:/claude/nomad/nomad/structs/csi.go#L154) |
| `Merge` | `o *CSIMountOptions` | `p *CSIMountOptions` | - | [L164](file:///d:/claude/nomad/nomad/structs/csi.go#L164) |
| `Equal` | `o *CSIMountOptions` | `p *CSIMountOptions` | `bool` | [L176](file:///d:/claude/nomad/nomad/structs/csi.go#L176) |
| `String` | `o *CSIMountOptions` | - | `string` | [L194](file:///d:/claude/nomad/nomad/structs/csi.go#L194) |
| `GoString` | `o *CSIMountOptions` | - | `string` | [L203](file:///d:/claude/nomad/nomad/structs/csi.go#L203) |
| `Sanitize` | `o *CSIMountOptions` | - | `*CSIMountOptions` | [L208](file:///d:/claude/nomad/nomad/structs/csi.go#L208) |
| `String` | `s *CSISecrets` | - | `string` | [L225](file:///d:/claude/nomad/nomad/structs/csi.go#L225) |
| `GoString` | `s *CSISecrets` | - | `string` | [L233](file:///d:/claude/nomad/nomad/structs/csi.go#L233) |
| `GetID` | `v *CSIVolume` | - | `string` | [L324](file:///d:/claude/nomad/nomad/structs/csi.go#L324) |
| `GetNamespace` | `v *CSIVolume` | - | `string` | [L333](file:///d:/claude/nomad/nomad/structs/csi.go#L333) |
| `GetCreateIndex` | `v *CSIVolume` | - | `uint64` | [L342](file:///d:/claude/nomad/nomad/structs/csi.go#L342) |
| `NewCSIVolume` | - | `volumeID string, index uint64` | `*CSIVolume` | [L379](file:///d:/claude/nomad/nomad/structs/csi.go#L379) |
| `newStructs` | `v *CSIVolume` | - | - | [L393](file:///d:/claude/nomad/nomad/structs/csi.go#L393) |
| `RemoteID` | `v *CSIVolume` | - | `string` | [L407](file:///d:/claude/nomad/nomad/structs/csi.go#L407) |
| `Stub` | `v *CSIVolume` | - | `*CSIVolListStub` | [L414](file:///d:/claude/nomad/nomad/structs/csi.go#L414) |
| `ReadSchedulable` | `v *CSIVolume` | - | `bool` | [L444](file:///d:/claude/nomad/nomad/structs/csi.go#L444) |
| `WriteSchedulable` | `v *CSIVolume` | - | `bool` | [L455](file:///d:/claude/nomad/nomad/structs/csi.go#L455) |
| `HasFreeReadClaims` | `v *CSIVolume` | - | `bool` | [L482](file:///d:/claude/nomad/nomad/structs/csi.go#L482) |
| `HasFreeWriteClaims` | `v *CSIVolume` | - | `bool` | [L502](file:///d:/claude/nomad/nomad/structs/csi.go#L502) |
| `InUse` | `v *CSIVolume` | - | `bool` | [L522](file:///d:/claude/nomad/nomad/structs/csi.go#L522) |
| `Copy` | `v *CSIVolume` | - | `*CSIVolume` | [L528](file:///d:/claude/nomad/nomad/structs/csi.go#L528) |
| `Sanitize` | `v *CSIVolume` | - | `*CSIVolume` | [L573](file:///d:/claude/nomad/nomad/structs/csi.go#L573) |
| `Claim` | `v *CSIVolume` | `claim *CSIVolumeClaim, alloc *Allocation` | `error` | [L594](file:///d:/claude/nomad/nomad/structs/csi.go#L594) |
| `claimRead` | `v *CSIVolume` | `claim *CSIVolumeClaim, alloc *Allocation` | `error` | [L626](file:///d:/claude/nomad/nomad/structs/csi.go#L626) |
| `claimWrite` | `v *CSIVolume` | `claim *CSIVolumeClaim, alloc *Allocation` | `error` | [L656](file:///d:/claude/nomad/nomad/structs/csi.go#L656) |
| `setModesFromClaim` | `v *CSIVolume` | `claim *CSIVolumeClaim` | - | [L690](file:///d:/claude/nomad/nomad/structs/csi.go#L690) |
| `claimRelease` | `v *CSIVolume` | `claim *CSIVolumeClaim` | `error` | [L701](file:///d:/claude/nomad/nomad/structs/csi.go#L701) |
| `Equal` | `v *CSIVolume` | `o *CSIVolume` | `bool` | [L721](file:///d:/claude/nomad/nomad/structs/csi.go#L721) |
| `Validate` | `v *CSIVolume` | - | `error` | [L752](file:///d:/claude/nomad/nomad/structs/csi.go#L752) |
| `Merge` | `v *CSIVolume` | `other *CSIVolume` | `error` | [L794](file:///d:/claude/nomad/nomad/structs/csi.go#L794) |
| `ToClaim` | `req *CSIVolumeClaimRequest` | - | `*CSIVolumeClaim` | [L982](file:///d:/claude/nomad/nomad/structs/csi.go#L982) |
| `NewCSIPlugin` | - | `id string, index uint64` | `*CSIPlugin` | [L1166](file:///d:/claude/nomad/nomad/structs/csi.go#L1166) |
| `newStructs` | `p *CSIPlugin` | - | - | [L1180](file:///d:/claude/nomad/nomad/structs/csi.go#L1180) |
| `Copy` | `p *CSIPlugin` | - | `*CSIPlugin` | [L1187](file:///d:/claude/nomad/nomad/structs/csi.go#L1187) |
| `HasControllerCapability` | `p *CSIPlugin` | `cap CSIControllerCapability` | `bool` | [L1281](file:///d:/claude/nomad/nomad/structs/csi.go#L1281) |
| `HasNodeCapability` | `p *CSIPlugin` | `cap CSINodeCapability` | `bool` | [L1320](file:///d:/claude/nomad/nomad/structs/csi.go#L1320) |
| `AddPlugin` | `p *CSIPlugin` | `nodeID string, info *CSIInfo` | `error` | [L1345](file:///d:/claude/nomad/nomad/structs/csi.go#L1345) |
| `DeleteNode` | `p *CSIPlugin` | `nodeID string` | `error` | [L1393](file:///d:/claude/nomad/nomad/structs/csi.go#L1393) |
| `DeleteNodeForType` | `p *CSIPlugin` | `nodeID string, pluginType CSIPluginType` | `error` | [L1399](file:///d:/claude/nomad/nomad/structs/csi.go#L1399) |
| `DeleteAlloc` | `p *CSIPlugin` | `allocID string, nodeID string` | `error` | [L1443](file:///d:/claude/nomad/nomad/structs/csi.go#L1443) |
| `AddJob` | `p *CSIPlugin` | `job *Job, summary *JobSummary` | - | [L1474](file:///d:/claude/nomad/nomad/structs/csi.go#L1474) |
| `DeleteJob` | `p *CSIPlugin` | `job *Job, summary *JobSummary` | - | [L1479](file:///d:/claude/nomad/nomad/structs/csi.go#L1479) |
| `UpdateExpectedWithJob` | `p *CSIPlugin` | `job *Job, summary *JobSummary, terminal bool` | - | [L1485](file:///d:/claude/nomad/nomad/structs/csi.go#L1485) |
| `Copy` | `j *JobNamespacedDescriptions` | - | `JobNamespacedDescriptions` | [L1545](file:///d:/claude/nomad/nomad/structs/csi.go#L1545) |
| `Add` | `j *JobDescriptions` | `job *Job, expected int` | - | [L1557](file:///d:/claude/nomad/nomad/structs/csi.go#L1557) |
| `Count` | `j *JobDescriptions` | - | `int` | [L1572](file:///d:/claude/nomad/nomad/structs/csi.go#L1572) |
| `Delete` | `j *JobDescriptions` | `job *Job` | - | [L1586](file:///d:/claude/nomad/nomad/structs/csi.go#L1586) |
| `Stub` | `p *CSIPlugin` | - | `*CSIPluginListStub` | [L1605](file:///d:/claude/nomad/nomad/structs/csi.go#L1605) |
| `IsEmpty` | `p *CSIPlugin` | - | `bool` | [L1619](file:///d:/claude/nomad/nomad/structs/csi.go#L1619) |

## 5. 核心方法详解

### GetID()

**签名**：`func (v *CSIVolume) GetID() string`

**位置**：[L324](file:///d:/claude/nomad/nomad/structs/csi.go#L324)

### GetNamespace()

**签名**：`func (v *CSIVolume) GetNamespace() string`

**位置**：[L333](file:///d:/claude/nomad/nomad/structs/csi.go#L333)

### GetCreateIndex()

**签名**：`func (v *CSIVolume) GetCreateIndex() uint64`

**位置**：[L342](file:///d:/claude/nomad/nomad/structs/csi.go#L342)

### Validate()

**签名**：`func (v *CSIVolume) Validate() error`

**位置**：[L752](file:///d:/claude/nomad/nomad/structs/csi.go#L752)

### Delete()

**签名**：`func (j *JobDescriptions) Delete(job *Job) `

**位置**：[L1586](file:///d:/claude/nomad/nomad/structs/csi.go#L1586)

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
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [csi_test.go](file:///d:/claude/nomad/nomad/structs/csi_test.go) | 对应测试文件 |

