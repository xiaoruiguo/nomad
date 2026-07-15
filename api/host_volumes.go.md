# host_volumes.go 代码说明文档

> 文件路径：[host_volumes.go](file:///d:/claude/nomad/api/host_volumes.go)
> 总行数：254 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **主机卷（Host Volume）API 客户端**，提供主机卷的 CRUD 操作客户端方法。

## 2. 类型定义

### HostVolume

**定义位置**：[L10](file:///d:/claude/nomad/api/host_volumes.go#L10)

**类型**：struct

```go
	Namespace string `mapstructure:"namespace" hcl:"namespace"`
	ID string `mapstructure:"id" hcl:"id"`
	Name string `mapstructure:"name" hcl:"name"`
	PluginID string `mapstructure:"plugin_id" hcl:"plugin_id"`
	NodePool string `mapstructure:"node_pool" hcl:"node_pool"`
	NodeID string `mapstructure:"node_id" hcl:"node_id"`
	Constraints []*Constraint `json:",omitempty" hcl:"constraint"`
	RequestedCapacityMinBytes int64 `mapstructure:"capacity_min" hcl:"capacity_min"`
	RequestedCapacityMaxBytes int64 `mapstructure:"capacity_max" hcl:"capacity_max"`
	CapacityBytes int64 `mapstructure:"capacity" hcl:"capacity"`
	RequestedCapabilities []*HostVolumeCapability `hcl:"capability"`
	Parameters map[string]string `json:",omitempty"`
	HostPath string `mapstructure:"host_path" hcl:"host_path"`
	State HostVolumeState
	CreateIndex uint64
	CreateTime int64
	ModifyIndex uint64
	ModifyTime int64
	Allocations []*AllocationListStub `json:",omitempty" mapstructure:"-" hcl:"-"`
```

### HostVolumeState

**定义位置**：[L82](file:///d:/claude/nomad/api/host_volumes.go#L82)

**类型定义**：`string`

### HostVolumeCapability

**定义位置**：[L91](file:///d:/claude/nomad/api/host_volumes.go#L91)

**类型**：struct

```go
	AttachmentMode HostVolumeAttachmentMode `mapstructure:"attachment_mode" hcl:"attachment_mode"`
	AccessMode HostVolumeAccessMode `mapstructure:"access_mode" hcl:"access_mode"`
```

### HostVolumeAttachmentMode

**定义位置**：[L98](file:///d:/claude/nomad/api/host_volumes.go#L98)

**类型定义**：`string`

### HostVolumeAccessMode

**定义位置**：[L108](file:///d:/claude/nomad/api/host_volumes.go#L108)

**类型定义**：`string`

### HostVolumeStub

**定义位置**：[L120](file:///d:/claude/nomad/api/host_volumes.go#L120)

**类型**：struct

```go
	Namespace string
	ID string
	Name string
	PluginID string
	NodePool string
	NodeID string
	CapacityBytes int64
	State HostVolumeState
	CreateIndex uint64
	CreateTime int64
	ModifyIndex uint64
	ModifyTime int64
```

### HostVolumes

**定义位置**：[L138](file:///d:/claude/nomad/api/host_volumes.go#L138)

**类型**：struct

```go
	client *Client
```

**关联方法**（5 个）：`Create`, `Register`, `Get`, `List`, `Delete`

### HostVolumeCreateRequest

**定义位置**：[L147](file:///d:/claude/nomad/api/host_volumes.go#L147)

**类型**：struct

```go
	Volume *HostVolume
	PolicyOverride bool
```

### HostVolumeRegisterRequest

**定义位置**：[L154](file:///d:/claude/nomad/api/host_volumes.go#L154)

**类型**：struct

```go
	Volume *HostVolume
	PolicyOverride bool
```

### HostVolumeCreateResponse

**定义位置**：[L161](file:///d:/claude/nomad/api/host_volumes.go#L161)

**类型**：struct

```go
	Volume *HostVolume
	Warnings string
```

### HostVolumeRegisterResponse

**定义位置**：[L166](file:///d:/claude/nomad/api/host_volumes.go#L166)

**类型**：struct

```go
	Volume *HostVolume
	Warnings string
```

### HostVolumeListRequest

**定义位置**：[L171](file:///d:/claude/nomad/api/host_volumes.go#L171)

**类型**：struct

```go
	NodeID string
	NodePool string
```

### HostVolumeDeleteRequest

**定义位置**：[L176](file:///d:/claude/nomad/api/host_volumes.go#L176)

**类型**：struct

```go
	ID string
	Force bool
```

### HostVolumeDeleteResponse

**定义位置**：[L181](file:///d:/claude/nomad/api/host_volumes.go#L181)

**类型**：struct

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `HostVolumeStatePending` | `"pending"` |
| `HostVolumeStateReady` | `"ready"` |
| `HostVolumeStateUnavailable` | `"unavailable"` |
| `HostVolumeAttachmentModeUnknown` | `""` |
| `HostVolumeAttachmentModeBlockDevice` | `"block-device"` |
| `HostVolumeAttachmentModeFilesystem` | `"file-system"` |
| `HostVolumeAccessModeUnknown` | `""` |
| `HostVolumeAccessModeSingleNodeReader` | `"single-node-reader-only"` |
| `HostVolumeAccessModeSingleNodeWriter` | `"single-node-writer"` |
| `HostVolumeAccessModeSingleNodeSingleWriter` | `"single-node-single-writer"` |
| `HostVolumeAccessModeSingleNodeMultiWriter` | `"single-node-multi-writer"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `HostVolumes` | `c *Client` | - | `*HostVolumes` | [L143](file:///d:/claude/nomad/api/host_volumes.go#L143) |
| `Create` | `hv *HostVolumes` | `req *HostVolumeCreateRequest, opts *WriteOptions` | `*HostVolumeCreateResponse, *WriteMeta, error` | [L185](file:///d:/claude/nomad/api/host_volumes.go#L185) |
| `Register` | `hv *HostVolumes` | `req *HostVolumeRegisterRequest, opts *WriteOptions` | `*HostVolumeRegisterResponse, *WriteMeta, error` | [L196](file:///d:/claude/nomad/api/host_volumes.go#L196) |
| `Get` | `hv *HostVolumes` | `id string, opts *QueryOptions` | `*HostVolume, *QueryMeta, error` | [L206](file:///d:/claude/nomad/api/host_volumes.go#L206) |
| `List` | `hv *HostVolumes` | `req *HostVolumeListRequest, opts *QueryOptions` | `[]*HostVolumeStub, *QueryMeta, error` | [L221](file:///d:/claude/nomad/api/host_volumes.go#L221) |
| `Delete` | `hv *HostVolumes` | `req *HostVolumeDeleteRequest, opts *WriteOptions` | `*HostVolumeDeleteResponse, *WriteMeta, error` | [L242](file:///d:/claude/nomad/api/host_volumes.go#L242) |

## 5. 核心方法详解

### Create()

**签名**：`func (hv *HostVolumes) Create(req *HostVolumeCreateRequest, opts *WriteOptions) *HostVolumeCreateResponse, *WriteMeta, error`

**位置**：[L185](file:///d:/claude/nomad/api/host_volumes.go#L185)

### Register()

**签名**：`func (hv *HostVolumes) Register(req *HostVolumeRegisterRequest, opts *WriteOptions) *HostVolumeRegisterResponse, *WriteMeta, error`

**位置**：[L196](file:///d:/claude/nomad/api/host_volumes.go#L196)

### Get()

**签名**：`func (hv *HostVolumes) Get(id string, opts *QueryOptions) *HostVolume, *QueryMeta, error`

**位置**：[L206](file:///d:/claude/nomad/api/host_volumes.go#L206)

### List()

**签名**：`func (hv *HostVolumes) List(req *HostVolumeListRequest, opts *QueryOptions) []*HostVolumeStub, *QueryMeta, error`

**位置**：[L221](file:///d:/claude/nomad/api/host_volumes.go#L221)

### Delete()

**签名**：`func (hv *HostVolumes) Delete(req *HostVolumeDeleteRequest, opts *WriteOptions) *HostVolumeDeleteResponse, *WriteMeta, error`

**位置**：[L242](file:///d:/claude/nomad/api/host_volumes.go#L242)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `net/url` | 标准库 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

