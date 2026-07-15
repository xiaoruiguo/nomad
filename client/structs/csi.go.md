# csi.go 代码说明文档

> 文件路径：[structs/csi.go](file:///d:/claude/nomad/client/structs/csi.go)
> 总行数：500 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Client 结构体子包**（`client/structs`），定义 Client 层的数据结构（事件、统计、响应等）。

## 2. 类型定义

### CSIVolumeMountOptions

**定义位置**：[L16](file:///d:/claude/nomad/client/structs/csi.go#L16)

**类型**：struct

```go
	Filesystem string
	MountFlags []string
```

**关联方法**（1 个）：`ToCSIMountOptions`

### CSIControllerRequest

**定义位置**：[L41](file:///d:/claude/nomad/client/structs/csi.go#L41)

**类型**：interface

```go
	SetControllerNodeID
```

### CSIControllerQuery

**定义位置**：[L47](file:///d:/claude/nomad/client/structs/csi.go#L47)

**类型**：struct

```go
	ControllerNodeID string
	PluginID string
```

**关联方法**（1 个）：`SetControllerNodeID`

### ClientCSIControllerValidateVolumeRequest

**定义位置**：[L59](file:///d:/claude/nomad/client/structs/csi.go#L59)

**类型**：struct

```go
	VolumeID string
	VolumeCapabilities []*structs.CSIVolumeCapability
	MountOptions *structs.CSIMountOptions
	Secrets structs.CSISecrets
	AttachmentMode structs.VolumeAttachmentMode
	AccessMode structs.VolumeAccessMode
	Parameters map[string]string
	Context map[string]string
	CSIControllerQuery
```

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerValidateVolumeResponse

**定义位置**：[L106](file:///d:/claude/nomad/client/structs/csi.go#L106)

**类型**：struct

### ClientCSIControllerAttachVolumeRequest

**定义位置**：[L109](file:///d:/claude/nomad/client/structs/csi.go#L109)

**类型**：struct

```go
	VolumeID string
	ClientCSINodeID string
	AttachmentMode structs.VolumeAttachmentMode
	AccessMode structs.VolumeAccessMode
	MountOptions *CSIVolumeMountOptions
	ReadOnly bool
	Secrets structs.CSISecrets
	VolumeContext map[string]string
	CSIControllerQuery
```

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerAttachVolumeResponse

**定义位置**：[L168](file:///d:/claude/nomad/client/structs/csi.go#L168)

**类型**：struct

```go
	PublishContext map[string]string
```

### ClientCSIControllerDetachVolumeRequest

**定义位置**：[L185](file:///d:/claude/nomad/client/structs/csi.go#L185)

**类型**：struct

```go
	VolumeID string
	ClientCSINodeID string
	Secrets structs.CSISecrets
	CSIControllerQuery
```

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerDetachVolumeResponse

**定义位置**：[L213](file:///d:/claude/nomad/client/structs/csi.go#L213)

**类型**：struct

### ClientCSIControllerCreateVolumeRequest

**定义位置**：[L218](file:///d:/claude/nomad/client/structs/csi.go#L218)

**类型**：struct

```go
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
	CSIControllerQuery
```

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerCreateVolumeResponse

**定义位置**：[L285](file:///d:/claude/nomad/client/structs/csi.go#L285)

**类型**：struct

```go
	ExternalVolumeID string
	CapacityBytes int64
	VolumeContext map[string]string
	Topologies []*structs.CSITopology
```

### ClientCSIControllerExpandVolumeRequest

**定义位置**：[L295](file:///d:/claude/nomad/client/structs/csi.go#L295)

**类型**：struct

```go
	ExternalVolumeID string
	CapacityRange *csi.CapacityRange
	Secrets structs.CSISecrets
	VolumeCapability *csi.VolumeCapability
	CSIControllerQuery
```

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerExpandVolumeResponse

**定义位置**：[L317](file:///d:/claude/nomad/client/structs/csi.go#L317)

**类型**：struct

```go
	CapacityBytes int64
	NodeExpansionRequired bool
```

### ClientCSIControllerDeleteVolumeRequest

**定义位置**：[L325](file:///d:/claude/nomad/client/structs/csi.go#L325)

**类型**：struct

```go
	ExternalVolumeID string
	Secrets structs.CSISecrets
	CSIControllerQuery
```

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerDeleteVolumeResponse

**定义位置**：[L339](file:///d:/claude/nomad/client/structs/csi.go#L339)

**类型**：struct

### ClientCSIControllerListVolumesRequest

**定义位置**：[L344](file:///d:/claude/nomad/client/structs/csi.go#L344)

**类型**：struct

```go
	MaxEntries int32
	StartingToken string
	CSIControllerQuery
```

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerListVolumesResponse

**定义位置**：[L360](file:///d:/claude/nomad/client/structs/csi.go#L360)

**类型**：struct

```go
	Entries []*structs.CSIVolumeExternalStub
	NextToken string
```

### ClientCSIControllerCreateSnapshotRequest

**定义位置**：[L368](file:///d:/claude/nomad/client/structs/csi.go#L368)

**类型**：struct

```go
	ExternalSourceVolumeID string
	Name string
	Secrets structs.CSISecrets
	Parameters map[string]string
	CSIControllerQuery
```

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerCreateSnapshotResponse

**定义位置**：[L386](file:///d:/claude/nomad/client/structs/csi.go#L386)

**类型**：struct

```go
	ID string
	ExternalSourceVolumeID string
	SizeBytes int64
	CreateTime int64
	IsReady bool
```

### ClientCSIControllerDeleteSnapshotRequest

**定义位置**：[L397](file:///d:/claude/nomad/client/structs/csi.go#L397)

**类型**：struct

```go
	ID string
	Secrets structs.CSISecrets
	CSIControllerQuery
```

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerDeleteSnapshotResponse

**定义位置**：[L411](file:///d:/claude/nomad/client/structs/csi.go#L411)

**类型**：struct

### ClientCSIControllerListSnapshotsRequest

**定义位置**：[L416](file:///d:/claude/nomad/client/structs/csi.go#L416)

**类型**：struct

```go
	MaxEntries int32
	StartingToken string
	Secrets structs.CSISecrets
	CSIControllerQuery
```

**关联方法**（1 个）：`ToCSIRequest`

### ClientCSIControllerListSnapshotsResponse

**定义位置**：[L434](file:///d:/claude/nomad/client/structs/csi.go#L434)

**类型**：struct

```go
	Entries []*structs.CSISnapshot
	NextToken string
```

### ClientCSINodeDetachVolumeRequest

**定义位置**：[L442](file:///d:/claude/nomad/client/structs/csi.go#L442)

**类型**：struct

```go
	PluginID string
	VolumeID string
	VolumeNamespace string
	AllocID string
	NodeID string
	ExternalID string
	AttachmentMode structs.VolumeAttachmentMode
	AccessMode structs.VolumeAccessMode
	ReadOnly bool
```

### ClientCSINodeDetachVolumeResponse

**定义位置**：[L457](file:///d:/claude/nomad/client/structs/csi.go#L457)

**类型**：struct

### ClientCSINodeExpandVolumeRequest

**定义位置**：[L462](file:///d:/claude/nomad/client/structs/csi.go#L462)

**类型**：struct

```go
	PluginID string
	VolumeID string
	VolumeNamespace string
	ExternalID string
	Capacity *csi.CapacityRange
	Claim *structs.CSIVolumeClaim
```

**关联方法**（1 个）：`Validate`

### ClientCSINodeExpandVolumeResponse

**定义位置**：[L497](file:///d:/claude/nomad/client/structs/csi.go#L497)

**类型**：struct

```go
	CapacityBytes int64
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ToCSIMountOptions` | `c *CSIVolumeMountOptions` | - | `*structs.CSIMountOptions` | [L28](file:///d:/claude/nomad/client/structs/csi.go#L28) |
| `SetControllerNodeID` | `c *CSIControllerQuery` | `nodeID string` | - | [L55](file:///d:/claude/nomad/client/structs/csi.go#L55) |
| `ToCSIRequest` | `c *ClientCSIControllerValidateVolumeRequest` | - | `*csi.ControllerValidateVolumeRequest, error` | [L82](file:///d:/claude/nomad/client/structs/csi.go#L82) |
| `ToCSIRequest` | `c *ClientCSIControllerAttachVolumeRequest` | - | `*csi.ControllerPublishVolumeRequest, error` | [L144](file:///d:/claude/nomad/client/structs/csi.go#L144) |
| `ToCSIRequest` | `c *ClientCSIControllerDetachVolumeRequest` | - | `*csi.ControllerUnpublishVolumeRequest` | [L202](file:///d:/claude/nomad/client/structs/csi.go#L202) |
| `ToCSIRequest` | `req *ClientCSIControllerCreateVolumeRequest` | - | `*csi.ControllerCreateVolumeRequest, error` | [L233](file:///d:/claude/nomad/client/structs/csi.go#L233) |
| `ToCSIRequest` | `req *ClientCSIControllerExpandVolumeRequest` | - | `*csi.ControllerExpandVolumeRequest` | [L304](file:///d:/claude/nomad/client/structs/csi.go#L304) |
| `ToCSIRequest` | `req *ClientCSIControllerDeleteVolumeRequest` | - | `*csi.ControllerDeleteVolumeRequest` | [L332](file:///d:/claude/nomad/client/structs/csi.go#L332) |
| `ToCSIRequest` | `req *ClientCSIControllerListVolumesRequest` | - | `*csi.ControllerListVolumesRequest` | [L353](file:///d:/claude/nomad/client/structs/csi.go#L353) |
| `ToCSIRequest` | `req *ClientCSIControllerCreateSnapshotRequest` | - | `*csi.ControllerCreateSnapshotRequest, error` | [L377](file:///d:/claude/nomad/client/structs/csi.go#L377) |
| `ToCSIRequest` | `req *ClientCSIControllerDeleteSnapshotRequest` | - | `*csi.ControllerDeleteSnapshotRequest` | [L404](file:///d:/claude/nomad/client/structs/csi.go#L404) |
| `ToCSIRequest` | `req *ClientCSIControllerListSnapshotsRequest` | - | `*csi.ControllerListSnapshotsRequest` | [L426](file:///d:/claude/nomad/client/structs/csi.go#L426) |
| `Validate` | `req *ClientCSINodeExpandVolumeRequest` | - | `error` | [L476](file:///d:/claude/nomad/client/structs/csi.go#L476) |

## 5. 核心方法详解

### Validate()

**签名**：`func (req *ClientCSINodeExpandVolumeRequest) Validate() error`

**位置**：[L476](file:///d:/claude/nomad/client/structs/csi.go#L476)

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

