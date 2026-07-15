# host_volumes.go 代码说明文档

> 文件路径：[api/host_volumes.go](file:///d:/claude/nomad/api/host_volumes.go)
> 总行数：254 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `host_volumes.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### HostVolume

**定义位置**：[L10](file:///d:/claude/nomad/api/host_volumes.go#L10)

**中文说明**：HostVolume 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type HostVolume struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string `mapstructure:"namespace" hcl:"namespace"`` | 命名空间 |
| `ID` | `string `mapstructure:"id" hcl:"id"`` | 唯一标识符 |
| `Name` | `string `mapstructure:"name" hcl:"name"`` | 名称 |
| `PluginID` | `string `mapstructure:"plugin_id" hcl:"plugin_id"`` | 字符串 |
| `NodePool` | `string `mapstructure:"node_pool" hcl:"node_pool"`` | 字符串 |
| `NodeID` | `string `mapstructure:"node_id" hcl:"node_id"`` | 字符串 |
| `Constraints` | `[]*Constraint `json:",omitempty" hcl:"constraint"`` | 列表 |
| `RequestedCapacityMinBytes` | `int64 `mapstructure:"capacity_min" hcl:"capacity_min"`` | — |
| `RequestedCapacityMaxBytes` | `int64 `mapstructure:"capacity_max" hcl:"capacity_max"`` | — |
| `CapacityBytes` | `int64 `mapstructure:"capacity" hcl:"capacity"`` | — |
| `RequestedCapabilities` | `[]*HostVolumeCapability `hcl:"capability"`` | 列表 |
| `Parameters` | `map[string]string `json:",omitempty"`` | 参数 |
| `HostPath` | `string `mapstructure:"host_path" hcl:"host_path"`` | 字符串 |
| `State` | `HostVolumeState` | 状态 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `ModifyTime` | `int64` | — |
| `Allocations` | `[]*AllocationListStub `json:",omitempty" mapstructure:"-" hcl:"-"`` | 列表 |

### HostVolumeState

**定义位置**：[L82](file:///d:/claude/nomad/api/host_volumes.go#L82)

**中文说明**：HostVolumeState 与卷（Volume）相关，管理持久化存储。

**类型定义**：`type HostVolumeState string`

### HostVolumeCapability

**定义位置**：[L91](file:///d:/claude/nomad/api/host_volumes.go#L91)

**中文说明**：HostVolumeCapability 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type HostVolumeCapability struct {
	AttachmentMode HostVolumeAttachmentMode `mapstructure:"attachment_mode" hcl:"attachment_mode"`
	AccessMode HostVolumeAccessMode `mapstructure:"access_mode" hcl:"access_mode"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AttachmentMode` | `HostVolumeAttachmentMode `mapstructure:"attachment_mode" hcl:"attachment_mode"`` | — |
| `AccessMode` | `HostVolumeAccessMode `mapstructure:"access_mode" hcl:"access_mode"`` | — |

### HostVolumeAttachmentMode

**定义位置**：[L98](file:///d:/claude/nomad/api/host_volumes.go#L98)

**中文说明**：HostVolumeAttachmentMode 与卷（Volume）相关，管理持久化存储。

**类型定义**：`type HostVolumeAttachmentMode string`

### HostVolumeAccessMode

**定义位置**：[L108](file:///d:/claude/nomad/api/host_volumes.go#L108)

**中文说明**：HostVolumeAccessMode 与卷（Volume）相关，管理持久化存储。

**类型定义**：`type HostVolumeAccessMode string`

### HostVolumeStub

**定义位置**：[L120](file:///d:/claude/nomad/api/host_volumes.go#L120)

**中文说明**：HostVolumeStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type HostVolumeStub struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string` | 命名空间 |
| `ID` | `string` | 唯一标识符 |
| `Name` | `string` | 名称 |
| `PluginID` | `string` | 字符串 |
| `NodePool` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `CapacityBytes` | `int64` | — |
| `State` | `HostVolumeState` | 状态 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `ModifyTime` | `int64` | — |

### HostVolumes

**定义位置**：[L138](file:///d:/claude/nomad/api/host_volumes.go#L138)

**中文说明**：HostVolumes 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type HostVolumes struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（5 个）：`Create`, `Register`, `Get`, `List`, `Delete`

### HostVolumeCreateRequest

**定义位置**：[L147](file:///d:/claude/nomad/api/host_volumes.go#L147)

**中文说明**：HostVolumeCreateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type HostVolumeCreateRequest struct {
	Volume *HostVolume
	PolicyOverride bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*HostVolume` | — |
| `PolicyOverride` | `bool` | 布尔值 |

### HostVolumeRegisterRequest

**定义位置**：[L154](file:///d:/claude/nomad/api/host_volumes.go#L154)

**中文说明**：HostVolumeRegisterRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type HostVolumeRegisterRequest struct {
	Volume *HostVolume
	PolicyOverride bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*HostVolume` | — |
| `PolicyOverride` | `bool` | 布尔值 |

### HostVolumeCreateResponse

**定义位置**：[L161](file:///d:/claude/nomad/api/host_volumes.go#L161)

**中文说明**：HostVolumeCreateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type HostVolumeCreateResponse struct {
	Volume *HostVolume
	Warnings string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*HostVolume` | — |
| `Warnings` | `string` | 字符串 |

### HostVolumeRegisterResponse

**定义位置**：[L166](file:///d:/claude/nomad/api/host_volumes.go#L166)

**中文说明**：HostVolumeRegisterResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type HostVolumeRegisterResponse struct {
	Volume *HostVolume
	Warnings string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*HostVolume` | — |
| `Warnings` | `string` | 字符串 |

### HostVolumeListRequest

**定义位置**：[L171](file:///d:/claude/nomad/api/host_volumes.go#L171)

**中文说明**：HostVolumeListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type HostVolumeListRequest struct {
	NodeID string
	NodePool string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 字符串 |
| `NodePool` | `string` | 字符串 |

### HostVolumeDeleteRequest

**定义位置**：[L176](file:///d:/claude/nomad/api/host_volumes.go#L176)

**中文说明**：HostVolumeDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type HostVolumeDeleteRequest struct {
	ID string
	Force bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Force` | `bool` | 布尔值 |

### HostVolumeDeleteResponse

**定义位置**：[L181](file:///d:/claude/nomad/api/host_volumes.go#L181)

**中文说明**：HostVolumeDeleteResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `HostVolumeStatePending` | `HostVolumeState` | `"pending"` | — |
| `HostVolumeStateReady` | `HostVolumeState` | `"ready"` | — |
| `HostVolumeStateUnavailable` | `HostVolumeState` | `"unavailable"` | — |
| `HostVolumeAttachmentModeUnknown` | `HostVolumeAttachmentMode` | `""` | — |
| `HostVolumeAttachmentModeBlockDevice` | `HostVolumeAttachmentMode` | `"block-device"` | — |
| `HostVolumeAttachmentModeFilesystem` | `HostVolumeAttachmentMode` | `"file-system"` | — |
| `HostVolumeAccessModeUnknown` | `HostVolumeAccessMode` | `""` | — |
| `HostVolumeAccessModeSingleNodeReader` | `HostVolumeAccessMode` | `"single-node-reader-only"` | — |
| `HostVolumeAccessModeSingleNodeWriter` | `HostVolumeAccessMode` | `"single-node-writer"` | — |
| `HostVolumeAccessModeSingleNodeSingleWriter` | `HostVolumeAccessMode` | `"single-node-single-writer"` | — |
| `HostVolumeAccessModeSingleNodeMultiWriter` | `HostVolumeAccessMode` | `"single-node-multi-writer"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `HostVolumes` | `c *Client` | `` | `*HostVolumes` | [L143](file:///d:/claude/nomad/api/host_volumes.go#L143) |
| `Create` | `hv *HostVolumes` | `req *HostVolumeCreateRequest, opts *WriteOptions` | `*HostVolumeCreateResponse, *WriteMeta, error` | [L185](file:///d:/claude/nomad/api/host_volumes.go#L185) |
| `Register` | `hv *HostVolumes` | `req *HostVolumeRegisterRequest, opts *WriteOptions` | `*HostVolumeRegisterResponse, *WriteMeta, error` | [L196](file:///d:/claude/nomad/api/host_volumes.go#L196) |
| `Get` | `hv *HostVolumes` | `id string, opts *QueryOptions` | `*HostVolume, *QueryMeta, error` | [L206](file:///d:/claude/nomad/api/host_volumes.go#L206) |
| `List` | `hv *HostVolumes` | `req *HostVolumeListRequest, opts *QueryOptions` | `[]*HostVolumeStub, *QueryMeta, error` | [L221](file:///d:/claude/nomad/api/host_volumes.go#L221) |
| `Delete` | `hv *HostVolumes` | `req *HostVolumeDeleteRequest, opts *WriteOptions` | `*HostVolumeDeleteResponse, *WriteMeta, error` | [L242](file:///d:/claude/nomad/api/host_volumes.go#L242) |

## 5. 核心方法详解

### Create()

**签名**：`func (hv *HostVolumes) Create(req *HostVolumeCreateRequest, opts *WriteOptions) *HostVolumeCreateResponse, *WriteMeta, error`

**位置**：[L185](file:///d:/claude/nomad/api/host_volumes.go#L185)

**中文说明**：创建新的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `req` | `*HostVolumeCreateRequest` | — |
| `opts` | `*WriteOptions` | 选项 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*HostVolumeCreateResponse` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Register()

**签名**：`func (hv *HostVolumes) Register(req *HostVolumeRegisterRequest, opts *WriteOptions) *HostVolumeRegisterResponse, *WriteMeta, error`

**位置**：[L196](file:///d:/claude/nomad/api/host_volumes.go#L196)

**中文说明**：注册对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `req` | `*HostVolumeRegisterRequest` | — |
| `opts` | `*WriteOptions` | 选项 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*HostVolumeRegisterResponse` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Get()

**签名**：`func (hv *HostVolumes) Get(id string, opts *QueryOptions) *HostVolume, *QueryMeta, error`

**位置**：[L206](file:///d:/claude/nomad/api/host_volumes.go#L206)

**中文说明**：获取对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | `string` | 唯一标识符 |
| `opts` | `*QueryOptions` | 选项 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*HostVolume` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### List()

**签名**：`func (hv *HostVolumes) List(req *HostVolumeListRequest, opts *QueryOptions) []*HostVolumeStub, *QueryMeta, error`

**位置**：[L221](file:///d:/claude/nomad/api/host_volumes.go#L221)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `req` | `*HostVolumeListRequest` | — |
| `opts` | `*QueryOptions` | 选项 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*HostVolumeStub` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (hv *HostVolumes) Delete(req *HostVolumeDeleteRequest, opts *WriteOptions) *HostVolumeDeleteResponse, *WriteMeta, error`

**位置**：[L242](file:///d:/claude/nomad/api/host_volumes.go#L242)

**中文说明**：删除指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `req` | `*HostVolumeDeleteRequest` | — |
| `opts` | `*WriteOptions` | 选项 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*HostVolumeDeleteResponse` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `net/url` | 标准库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

