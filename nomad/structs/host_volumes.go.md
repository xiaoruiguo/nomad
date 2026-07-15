# host_volumes.go 代码说明文档

> 文件路径：[nomad/structs/host_volumes.go](file:///d:/claude/nomad/nomad/structs/host_volumes.go)
> 总行数：516 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 15 个方法/函数。

## 2. 类型定义

### HostVolume

**定义位置**：[L18](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L18)

**中文说明**：HostVolume 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type HostVolume struct {
	Namespace string
	ID string
	Name string
	PluginID string
	NodePool string
	NodeID string
	Constraints []*Constraint `json:",omitempty"`
	RequestedCapacityMinBytes int64
	RequestedCapacityMaxBytes int64
	CapacityBytes int64
	RequestedCapabilities []*HostVolumeCapability
	Parameters map[string]string `json:",omitempty"`
	HostPath string
	State HostVolumeState
	CreateIndex uint64
	CreateTime int64
	ModifyIndex uint64
	ModifyTime int64
	Allocations []*AllocListStub `json:",omitempty"`
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
| `Constraints` | `[]*Constraint `json:",omitempty"`` | 列表 |
| `RequestedCapacityMinBytes` | `int64` | — |
| `RequestedCapacityMaxBytes` | `int64` | — |
| `CapacityBytes` | `int64` | — |
| `RequestedCapabilities` | `[]*HostVolumeCapability` | 列表 |
| `Parameters` | `map[string]string `json:",omitempty"`` | 参数 |
| `HostPath` | `string` | 字符串 |
| `State` | `HostVolumeState` | 状态 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `ModifyTime` | `int64` | — |
| `Allocations` | `[]*AllocListStub `json:",omitempty"`` | 列表 |

**关联方法**（9 个）：`Copy`, `Stub`, `Validate`, `ValidateUpdate`, `CanonicalizeForCreate`, `CanonicalizeForRegister`, `GetNamespace`, `GetID`, `MatchesRequestSource`

### HostVolumeState

**定义位置**：[L89](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L89)

**中文说明**：HostVolumeState 与卷（Volume）相关，管理持久化存储。

**类型定义**：`type HostVolumeState string`

### HostVolumeCapability

**定义位置**：[L303](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L303)

**中文说明**：HostVolumeCapability 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type HostVolumeCapability struct {
	AttachmentMode VolumeAttachmentMode
	AccessMode VolumeAccessMode
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AttachmentMode` | `VolumeAttachmentMode` | — |
| `AccessMode` | `VolumeAccessMode` | — |

**关联方法**（2 个）：`Copy`, `Validate`

### HostVolumeStub

**定义位置**：[L361](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L361)

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

### HostVolumeCreateRequest

**定义位置**：[L378](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L378)

**中文说明**：HostVolumeCreateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type HostVolumeCreateRequest struct {
	Volume *HostVolume
	PolicyOverride bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*HostVolume` | — |
| `PolicyOverride` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### HostVolumeCreateResponse

**定义位置**：[L388](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L388)

**中文说明**：HostVolumeCreateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type HostVolumeCreateResponse struct {
	Volume *HostVolume
	Warnings string
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*HostVolume` | — |
| `Warnings` | `string` | 字符串 |
| `WriteMeta` | `WriteMeta` | — |

### HostVolumeRegisterRequest

**定义位置**：[L396](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L396)

**中文说明**：HostVolumeRegisterRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type HostVolumeRegisterRequest struct {
	Volume *HostVolume
	PolicyOverride bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*HostVolume` | — |
| `PolicyOverride` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### HostVolumeRegisterResponse

**定义位置**：[L406](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L406)

**中文说明**：HostVolumeRegisterResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type HostVolumeRegisterResponse struct {
	Volume *HostVolume
	Warnings string
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*HostVolume` | — |
| `Warnings` | `string` | 字符串 |
| `WriteMeta` | `WriteMeta` | — |

### HostVolumeDeleteRequest

**定义位置**：[L414](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L414)

**中文说明**：HostVolumeDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type HostVolumeDeleteRequest struct {
	VolumeID string
	Force bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VolumeID` | `string` | 字符串 |
| `Force` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### HostVolumeDeleteResponse

**定义位置**：[L420](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L420)

**中文说明**：HostVolumeDeleteResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type HostVolumeDeleteResponse struct {
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WriteMeta` | `WriteMeta` | — |

### HostVolumeGetRequest

**定义位置**：[L424](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L424)

**中文说明**：HostVolumeGetRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type HostVolumeGetRequest struct {
	ID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `QueryOptions` | `QueryOptions` | — |

### HostVolumeGetResponse

**定义位置**：[L429](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L429)

**中文说明**：HostVolumeGetResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type HostVolumeGetResponse struct {
	Volume *HostVolume
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*HostVolume` | — |
| `QueryMeta` | `QueryMeta` | — |

### HostVolumeListRequest

**定义位置**：[L434](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L434)

**中文说明**：HostVolumeListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type HostVolumeListRequest struct {
	NodeID string
	NodePool string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 过滤器 |
| `NodePool` | `string` | 过滤器 |
| `QueryOptions` | `QueryOptions` | — |

### HostVolumeListResponse

**定义位置**：[L440](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L440)

**中文说明**：HostVolumeListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type HostVolumeListResponse struct {
	Volumes []*HostVolumeStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volumes` | `[]*HostVolumeStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### TaskGroupHostVolumeClaim

**定义位置**：[L458](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L458)

**中文说明**：TaskGroupHostVolumeClaim 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskGroupHostVolumeClaim struct {
	ID string
	Namespace string
	JobID string
	TaskGroupName string
	AllocID string
	VolumeID string
	VolumeName string
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Namespace` | `string` | 命名空间 |
| `JobID` | `string` | 字符串 |
| `TaskGroupName` | `string` | 字符串 |
| `AllocID` | `string` | 字符串 |
| `VolumeID` | `string` | 字符串 |
| `VolumeName` | `string` | 字符串 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（4 个）：`ClaimedByAlloc`, `GetNamespace`, `GetID`, `Stub`

### TaskGroupVolumeClaimListRequest

**定义位置**：[L496](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L496)

**中文说明**：TaskGroupVolumeClaimListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type TaskGroupVolumeClaimListRequest struct {
	TaskGroup string
	JobID string
	VolumeName string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TaskGroup` | `string` | 字符串 |
| `JobID` | `string` | 字符串 |
| `VolumeName` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### TaskGroupVolumeClaimListResponse

**定义位置**：[L503](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L503)

**中文说明**：TaskGroupVolumeClaimListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type TaskGroupVolumeClaimListResponse struct {
	Claims []*TaskGroupHostVolumeClaim
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Claims` | `[]*TaskGroupHostVolumeClaim` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### TaskGroupVolumeClaimDeleteRequest

**定义位置**：[L508](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L508)

**中文说明**：TaskGroupVolumeClaimDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type TaskGroupVolumeClaimDeleteRequest struct {
	ClaimID string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ClaimID` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### TaskGroupVolumeClaimDeleteResponse

**定义位置**：[L513](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L513)

**中文说明**：TaskGroupVolumeClaimDeleteResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type TaskGroupVolumeClaimDeleteResponse struct {
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WriteMeta` | `WriteMeta` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `HostVolumeStateUnknown` | `HostVolumeState` | `""` | — |
| `HostVolumeStatePending` | `HostVolumeState` | `"pending"` | — |
| `HostVolumeStateReady` | `HostVolumeState` | `"ready"` | — |
| `HostVolumeStateUnavailable` | `HostVolumeState` | `"unavailable"` | — |
| `DefaultHostVolumePlugin` | `—` | `"default"` | — |
| `HostVolumeAttachmentModeUnknown` | `VolumeAttachmentMode` | `""` | — |
| `HostVolumeAttachmentModeBlockDevice` | `VolumeAttachmentMode` | `"block-device"` | — |
| `HostVolumeAttachmentModeFilesystem` | `VolumeAttachmentMode` | `"file-system"` | — |
| `HostVolumeAccessModeUnknown` | `VolumeAccessMode` | `""` | — |
| `HostVolumeAccessModeSingleNodeReader` | `VolumeAccessMode` | `"single-node-reader-only"` | — |
| `HostVolumeAccessModeSingleNodeWriter` | `VolumeAccessMode` | `"single-node-writer"` | — |
| `HostVolumeAccessModeSingleNodeSingleWriter` | `VolumeAccessMode` | `"single-node-single-writer"` | — |
| `HostVolumeAccessModeSingleNodeMultiWriter` | `VolumeAccessMode` | `"single-node-multi-writer"` | — |
| `TaskGroupHostVolumeClaimListRPCMethod` | `—` | `"TaskGroupHostVolumeClaim.List"` | — |
| `TaskGroupHostVolumeClaimDeleteRPCMethod` | `—` | `"TaskGroupHostVolumeClaim.Delete"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Copy` | `hv *HostVolume` | `` | `*HostVolume` | [L98](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L98) |
| `Stub` | `hv *HostVolume` | `` | `*HostVolumeStub, error` | [L110](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L110) |
| `Validate` | `hv *HostVolume` | `` | `error` | [L133](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L133) |
| `ValidateUpdate` | `hv *HostVolume` | `existing *HostVolume` | `error` | [L174](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L174) |
| `CanonicalizeForCreate` | `hv *HostVolume` | `existing *HostVolume, now time.Time` | `` | [L211](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L211) |
| `CanonicalizeForRegister` | `hv *HostVolume` | `existing *HostVolume, now time.Time` | `` | [L251](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L251) |
| `GetNamespace` | `hv *HostVolume` | `` | `string` | [L281](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L281) |
| `GetID` | `hv *HostVolume` | `` | `string` | [L286](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L286) |
| `MatchesRequestSource` | `hv *HostVolume` | `req *VolumeRequest, alloc *Allocation` | `bool` | [L292](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L292) |
| `Copy` | `hvc *HostVolumeCapability` | `` | `*HostVolumeCapability` | [L308](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L308) |
| `Validate` | `hvc *HostVolumeCapability` | `` | `error` | [L317](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L317) |
| `ClaimedByAlloc` | `tgvc *TaskGroupHostVolumeClaim` | `otherClaim *TaskGroupHostVolumeClaim` | `bool` | [L473](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L473) |
| `GetNamespace` | `tgvc *TaskGroupHostVolumeClaim` | `` | `string` | [L482](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L482) |
| `GetID` | `tgvc *TaskGroupHostVolumeClaim` | `` | `string` | [L487](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L487) |
| `Stub` | `tgvc *TaskGroupHostVolumeClaim` | `` | `*TaskGroupHostVolumeClaim, error` | [L492](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L492) |

## 5. 核心方法详解

### Copy()

**签名**：`func (hv *HostVolume) Copy() *HostVolume`

**位置**：[L98](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L98)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*HostVolume` | — |

### Validate()

**签名**：`func (hv *HostVolume) Validate() error`

**位置**：[L133](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L133)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Copy()

**签名**：`func (hvc *HostVolumeCapability) Copy() *HostVolumeCapability`

**位置**：[L308](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L308)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*HostVolumeCapability` | — |

### Validate()

**签名**：`func (hvc *HostVolumeCapability) Validate() error`

**位置**：[L317](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L317)

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
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [host_volumes_test.go](file:///d:/claude/nomad/nomad/structs/host_volumes_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

