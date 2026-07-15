# csi.go 代码说明文档

> 文件路径：[csi.go](file:///d:/claude/nomad/api/csi.go)
> 总行数：659 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **CSI（容器存储接口）API 客户端**，提供 CSI 卷和插件的 CRUD 操作客户端方法。

## 2. 类型定义

### CSIVolumes

**定义位置**：[L15](file:///d:/claude/nomad/api/csi.go#L15)

**类型**：struct

```go
	client *Client
```

**关联方法**（16 个）：`List`, `ListExternal`, `PluginList`, `Info`, `Register`, `RegisterOpts`, `Deregister`, `Create`, `CreateOpts`, `Delete`, `DeleteOpts`, `Detach`, `CreateSnapshot`, `DeleteSnapshot`, `ListSnapshotsOpts`, `ListSnapshots`

### CSIVolumeAttachmentMode

**定义位置**：[L242](file:///d:/claude/nomad/api/csi.go#L242)

**类型定义**：`string`

### CSIVolumeAccessMode

**定义位置**：[L252](file:///d:/claude/nomad/api/csi.go#L252)

**类型定义**：`string`

### CSIMountOptions

**定义位置**：[L270](file:///d:/claude/nomad/api/csi.go#L270)

**类型**：struct

```go
	FSType string `hcl:"fs_type,optional"`
	MountFlags []string `hcl:"mount_flags,optional"`
	ExtraKeysHCL []string `hcl1:",unusedKeys" json:"-"`
```

**关联方法**（1 个）：`Merge`

### CSISecrets

**定义位置**：[L298](file:///d:/claude/nomad/api/csi.go#L298)

**类型定义**：`map[string]string`

### CSIVolume

**定义位置**：[L323](file:///d:/claude/nomad/api/csi.go#L323)

**类型**：struct

```go
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
```

### CSIVolumeCapability

**定义位置**：[L393](file:///d:/claude/nomad/api/csi.go#L393)

**类型**：struct

```go
	AccessMode CSIVolumeAccessMode `mapstructure:"access_mode" hcl:"access_mode"`
	AttachmentMode CSIVolumeAttachmentMode `mapstructure:"attachment_mode" hcl:"attachment_mode"`
```

### CSIVolumeIndexSort

**定义位置**：[L400](file:///d:/claude/nomad/api/csi.go#L400)

**类型定义**：`[]*CSIVolumeListStub`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### CSIVolumeListStub

**定义位置**：[L415](file:///d:/claude/nomad/api/csi.go#L415)

**类型**：struct

```go
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
```

### CSIVolumeListExternalResponse

**定义位置**：[L444](file:///d:/claude/nomad/api/csi.go#L444)

**类型**：struct

```go
	Volumes []*CSIVolumeExternalStub
	NextToken string
```

### CSIVolumeExternalStub

**定义位置**：[L451](file:///d:/claude/nomad/api/csi.go#L451)

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

### CSIVolumeExternalStubSort

**定义位置**：[L465](file:///d:/claude/nomad/api/csi.go#L465)

**类型定义**：`[]*CSIVolumeExternalStub`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### CSIVolumeCreateRequest

**定义位置**：[L479](file:///d:/claude/nomad/api/csi.go#L479)

**类型**：struct

```go
	Volumes []*CSIVolume
	PolicyOverride bool
	WriteRequest
```

### CSIVolumeCreateResponse

**定义位置**：[L488](file:///d:/claude/nomad/api/csi.go#L488)

**类型**：struct

```go
	Volumes []*CSIVolume
	Warnings string
	QueryMeta
```

### CSIVolumeRegisterRequest

**定义位置**：[L494](file:///d:/claude/nomad/api/csi.go#L494)

**类型**：struct

```go
	Volumes []*CSIVolume
	PolicyOverride bool
	WriteRequest
```

### CSIVolumeRegisterResponse

**定义位置**：[L503](file:///d:/claude/nomad/api/csi.go#L503)

**类型**：struct

```go
	Volumes []*CSIVolume
	Warnings string
	QueryMeta
```

### CSIVolumeDeregisterRequest

**定义位置**：[L509](file:///d:/claude/nomad/api/csi.go#L509)

**类型**：struct

```go
	VolumeIDs []string
	WriteRequest
```

### CSIVolumeDeleteRequest

**定义位置**：[L514](file:///d:/claude/nomad/api/csi.go#L514)

**类型**：struct

```go
	ExternalVolumeID string
	Secrets CSISecrets
	WriteRequest
```

### CSISnapshot

**定义位置**：[L521](file:///d:/claude/nomad/api/csi.go#L521)

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

### CSISnapshotSort

**定义位置**：[L538](file:///d:/claude/nomad/api/csi.go#L538)

**类型定义**：`[]*CSISnapshot`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### CSISnapshotCreateRequest

**定义位置**：[L552](file:///d:/claude/nomad/api/csi.go#L552)

**类型**：struct

```go
	Snapshots []*CSISnapshot
	WriteRequest
```

### CSISnapshotCreateResponse

**定义位置**：[L557](file:///d:/claude/nomad/api/csi.go#L557)

**类型**：struct

```go
	Snapshots []*CSISnapshot
	QueryMeta
```

### CSISnapshotListRequest

**定义位置**：[L566](file:///d:/claude/nomad/api/csi.go#L566)

**类型**：struct

```go
	PluginID string
	Secrets CSISecrets
	QueryOptions
```

### CSISnapshotListResponse

**定义位置**：[L572](file:///d:/claude/nomad/api/csi.go#L572)

**类型**：struct

```go
	Snapshots []*CSISnapshot
	NextToken string
	QueryMeta
```

### CSIPlugins

**定义位置**：[L579](file:///d:/claude/nomad/api/csi.go#L579)

**类型**：struct

```go
	client *Client
```

**关联方法**（2 个）：`List`, `Info`

### CSIPlugin

**定义位置**：[L584](file:///d:/claude/nomad/api/csi.go#L584)

**类型**：struct

```go
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
```

### CSIPluginListStub

**定义位置**：[L606](file:///d:/claude/nomad/api/csi.go#L606)

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

### CSIPluginIndexSort

**定义位置**：[L620](file:///d:/claude/nomad/api/csi.go#L620)

**类型定义**：`[]*CSIPluginListStub`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `CSIVolumeAttachmentModeUnknown` | `""` |
| `CSIVolumeAttachmentModeBlockDevice` | `"block-device"` |
| `CSIVolumeAttachmentModeFilesystem` | `"file-system"` |
| `CSIVolumeAccessModeUnknown` | `""` |
| `CSIVolumeAccessModeSingleNodeReader` | `"single-node-reader-only"` |
| `CSIVolumeAccessModeSingleNodeWriter` | `"single-node-writer"` |
| `CSIVolumeAccessModeMultiNodeReader` | `"multi-node-reader-only"` |
| `CSIVolumeAccessModeMultiNodeSingleWriter` | `"multi-node-single-writer"` |
| `CSIVolumeAccessModeMultiNodeMultiWriter` | `"multi-node-multi-writer"` |
| `CSIVolumeTypeHost` | `"host"` |
| `CSIVolumeTypeCSI` | `"csi"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `CSIVolumes` | `c *Client` | - | `*CSIVolumes` | [L20](file:///d:/claude/nomad/api/csi.go#L20) |
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
| `Merge` | `o *CSIMountOptions` | `p *CSIMountOptions` | - | [L283](file:///d:/claude/nomad/api/csi.go#L283) |
| `SetHeadersFromCSISecrets` | `o *QueryOptions` | `secrets CSISecrets` | - | [L300](file:///d:/claude/nomad/api/csi.go#L300) |
| `SetHeadersFromCSISecrets` | `o *WriteOptions` | `secrets CSISecrets` | - | [L311](file:///d:/claude/nomad/api/csi.go#L311) |
| `Len` | `v *CSIVolumeIndexSort` | - | `int` | [L402](file:///d:/claude/nomad/api/csi.go#L402) |
| `Less` | `v *CSIVolumeIndexSort` | `i int, j int` | `bool` | [L406](file:///d:/claude/nomad/api/csi.go#L406) |
| `Swap` | `v *CSIVolumeIndexSort` | `i int, j int` | - | [L410](file:///d:/claude/nomad/api/csi.go#L410) |
| `Len` | `v *CSIVolumeExternalStubSort` | - | `int` | [L467](file:///d:/claude/nomad/api/csi.go#L467) |
| `Less` | `v *CSIVolumeExternalStubSort` | `i int, j int` | `bool` | [L471](file:///d:/claude/nomad/api/csi.go#L471) |
| `Swap` | `v *CSIVolumeExternalStubSort` | `i int, j int` | - | [L475](file:///d:/claude/nomad/api/csi.go#L475) |
| `Len` | `v *CSISnapshotSort` | - | `int` | [L540](file:///d:/claude/nomad/api/csi.go#L540) |
| `Less` | `v *CSISnapshotSort` | `i int, j int` | `bool` | [L544](file:///d:/claude/nomad/api/csi.go#L544) |
| `Swap` | `v *CSISnapshotSort` | `i int, j int` | - | [L548](file:///d:/claude/nomad/api/csi.go#L548) |
| `Len` | `v *CSIPluginIndexSort` | - | `int` | [L622](file:///d:/claude/nomad/api/csi.go#L622) |
| `Less` | `v *CSIPluginIndexSort` | `i int, j int` | `bool` | [L626](file:///d:/claude/nomad/api/csi.go#L626) |
| `Swap` | `v *CSIPluginIndexSort` | `i int, j int` | - | [L630](file:///d:/claude/nomad/api/csi.go#L630) |
| `CSIPlugins` | `c *Client` | - | `*CSIPlugins` | [L635](file:///d:/claude/nomad/api/csi.go#L635) |
| `List` | `v *CSIPlugins` | `q *QueryOptions` | `[]*CSIPluginListStub, *QueryMeta, error` | [L640](file:///d:/claude/nomad/api/csi.go#L640) |
| `Info` | `v *CSIPlugins` | `id string, q *QueryOptions` | `*CSIPlugin, *QueryMeta, error` | [L651](file:///d:/claude/nomad/api/csi.go#L651) |

## 5. 核心方法详解

### List()

**签名**：`func (v *CSIVolumes) List(q *QueryOptions) []*CSIVolumeListStub, *QueryMeta, error`

**位置**：[L25](file:///d:/claude/nomad/api/csi.go#L25)

### ListExternal()

**签名**：`func (v *CSIVolumes) ListExternal(pluginID string, q *QueryOptions) *CSIVolumeListExternalResponse, *QueryMeta, error`

**位置**：[L39](file:///d:/claude/nomad/api/csi.go#L39)

### Info()

**签名**：`func (v *CSIVolumes) Info(id string, q *QueryOptions) *CSIVolume, *QueryMeta, error`

**位置**：[L66](file:///d:/claude/nomad/api/csi.go#L66)

### Register()

**签名**：`func (v *CSIVolumes) Register(vol *CSIVolume, w *WriteOptions) *WriteMeta, error`

**位置**：[L78](file:///d:/claude/nomad/api/csi.go#L78)

### Deregister()

**签名**：`func (v *CSIVolumes) Deregister(id string, force bool, w *WriteOptions) error`

**位置**：[L101](file:///d:/claude/nomad/api/csi.go#L101)

### Create()

**签名**：`func (v *CSIVolumes) Create(vol *CSIVolume, w *WriteOptions) []*CSIVolume, *WriteMeta, error`

**位置**：[L109](file:///d:/claude/nomad/api/csi.go#L109)

### Delete()

**签名**：`func (v *CSIVolumes) Delete(externalVolID string, w *WriteOptions) error`

**位置**：[L136](file:///d:/claude/nomad/api/csi.go#L136)

### ListSnapshotsOpts()

**签名**：`func (v *CSIVolumes) ListSnapshotsOpts(req *CSISnapshotListRequest) *CSISnapshotListResponse, *QueryMeta, error`

**位置**：[L190](file:///d:/claude/nomad/api/csi.go#L190)

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

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [csi_test.go](file:///d:/claude/nomad/api/csi_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

