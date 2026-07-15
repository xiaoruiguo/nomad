# host_volumes.go 代码说明文档

> 文件路径：[structs/host_volumes.go](file:///d:/claude/nomad/nomad/structs/host_volumes.go)
> 总行数：516 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### HostVolume

**定义位置**：[L18](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L18)

**类型**：struct

```go
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
```

**关联方法**（9 个）：`Copy`, `Stub`, `Validate`, `ValidateUpdate`, `CanonicalizeForCreate`, `CanonicalizeForRegister`, `GetNamespace`, `GetID`, `MatchesRequestSource`

### HostVolumeState

**定义位置**：[L89](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L89)

**类型定义**：`string`

### HostVolumeCapability

**定义位置**：[L303](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L303)

**类型**：struct

```go
	AttachmentMode VolumeAttachmentMode
	AccessMode VolumeAccessMode
```

**关联方法**（2 个）：`Copy`, `Validate`

### HostVolumeStub

**定义位置**：[L361](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L361)

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

### HostVolumeCreateRequest

**定义位置**：[L378](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L378)

**类型**：struct

```go
	Volume *HostVolume
	PolicyOverride bool
	WriteRequest
```

### HostVolumeCreateResponse

**定义位置**：[L388](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L388)

**类型**：struct

```go
	Volume *HostVolume
	Warnings string
	WriteMeta
```

### HostVolumeRegisterRequest

**定义位置**：[L396](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L396)

**类型**：struct

```go
	Volume *HostVolume
	PolicyOverride bool
	WriteRequest
```

### HostVolumeRegisterResponse

**定义位置**：[L406](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L406)

**类型**：struct

```go
	Volume *HostVolume
	Warnings string
	WriteMeta
```

### HostVolumeDeleteRequest

**定义位置**：[L414](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L414)

**类型**：struct

```go
	VolumeID string
	Force bool
	WriteRequest
```

### HostVolumeDeleteResponse

**定义位置**：[L420](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L420)

**类型**：struct

```go
	WriteMeta
```

### HostVolumeGetRequest

**定义位置**：[L424](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L424)

**类型**：struct

```go
	ID string
	QueryOptions
```

### HostVolumeGetResponse

**定义位置**：[L429](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L429)

**类型**：struct

```go
	Volume *HostVolume
	QueryMeta
```

### HostVolumeListRequest

**定义位置**：[L434](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L434)

**类型**：struct

```go
	NodeID string
	NodePool string
	QueryOptions
```

### HostVolumeListResponse

**定义位置**：[L440](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L440)

**类型**：struct

```go
	Volumes []*HostVolumeStub
	QueryMeta
```

### TaskGroupHostVolumeClaim

**定义位置**：[L458](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L458)

**类型**：struct

```go
	ID string
	Namespace string
	JobID string
	TaskGroupName string
	AllocID string
	VolumeID string
	VolumeName string
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（4 个）：`ClaimedByAlloc`, `GetNamespace`, `GetID`, `Stub`

### TaskGroupVolumeClaimListRequest

**定义位置**：[L496](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L496)

**类型**：struct

```go
	TaskGroup string
	JobID string
	VolumeName string
	QueryOptions
```

### TaskGroupVolumeClaimListResponse

**定义位置**：[L503](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L503)

**类型**：struct

```go
	Claims []*TaskGroupHostVolumeClaim
	QueryMeta
```

### TaskGroupVolumeClaimDeleteRequest

**定义位置**：[L508](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L508)

**类型**：struct

```go
	ClaimID string
	WriteRequest
```

### TaskGroupVolumeClaimDeleteResponse

**定义位置**：[L513](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L513)

**类型**：struct

```go
	WriteMeta
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `HostVolumeStateUnknown` | `""` |
| `HostVolumeStatePending` | `"pending"` |
| `HostVolumeStateReady` | `"ready"` |
| `HostVolumeStateUnavailable` | `"unavailable"` |
| `DefaultHostVolumePlugin` | `"default"` |
| `HostVolumeAttachmentModeUnknown` | `""` |
| `HostVolumeAttachmentModeBlockDevice` | `"block-device"` |
| `HostVolumeAttachmentModeFilesystem` | `"file-system"` |
| `HostVolumeAccessModeUnknown` | `""` |
| `HostVolumeAccessModeSingleNodeReader` | `"single-node-reader-only"` |
| `HostVolumeAccessModeSingleNodeWriter` | `"single-node-writer"` |
| `HostVolumeAccessModeSingleNodeSingleWriter` | `"single-node-single-writer"` |
| `HostVolumeAccessModeSingleNodeMultiWriter` | `"single-node-multi-writer"` |
| `TaskGroupHostVolumeClaimListRPCMethod` | `"TaskGroupHostVolumeClaim.List"` |
| `TaskGroupHostVolumeClaimDeleteRPCMethod` | `"TaskGroupHostVolumeClaim.Delete"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Copy` | `hv *HostVolume` | - | `*HostVolume` | [L98](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L98) |
| `Stub` | `hv *HostVolume` | - | `*HostVolumeStub, error` | [L110](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L110) |
| `Validate` | `hv *HostVolume` | - | `error` | [L133](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L133) |
| `ValidateUpdate` | `hv *HostVolume` | `existing *HostVolume` | `error` | [L174](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L174) |
| `CanonicalizeForCreate` | `hv *HostVolume` | `existing *HostVolume, now time.Time` | - | [L211](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L211) |
| `CanonicalizeForRegister` | `hv *HostVolume` | `existing *HostVolume, now time.Time` | - | [L251](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L251) |
| `GetNamespace` | `hv *HostVolume` | - | `string` | [L281](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L281) |
| `GetID` | `hv *HostVolume` | - | `string` | [L286](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L286) |
| `MatchesRequestSource` | `hv *HostVolume` | `req *VolumeRequest, alloc *Allocation` | `bool` | [L292](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L292) |
| `Copy` | `hvc *HostVolumeCapability` | - | `*HostVolumeCapability` | [L308](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L308) |
| `Validate` | `hvc *HostVolumeCapability` | - | `error` | [L317](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L317) |
| `ClaimedByAlloc` | `tgvc *TaskGroupHostVolumeClaim` | `otherClaim *TaskGroupHostVolumeClaim` | `bool` | [L473](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L473) |
| `GetNamespace` | `tgvc *TaskGroupHostVolumeClaim` | - | `string` | [L482](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L482) |
| `GetID` | `tgvc *TaskGroupHostVolumeClaim` | - | `string` | [L487](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L487) |
| `Stub` | `tgvc *TaskGroupHostVolumeClaim` | - | `*TaskGroupHostVolumeClaim, error` | [L492](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L492) |

## 5. 核心方法详解

### Validate()

**签名**：`func (hv *HostVolume) Validate() error`

**位置**：[L133](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L133)

### GetNamespace()

**签名**：`func (hv *HostVolume) GetNamespace() string`

**位置**：[L281](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L281)

### GetID()

**签名**：`func (hv *HostVolume) GetID() string`

**位置**：[L286](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L286)

### Validate()

**签名**：`func (hvc *HostVolumeCapability) Validate() error`

**位置**：[L317](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L317)

### GetNamespace()

**签名**：`func (tgvc *TaskGroupHostVolumeClaim) GetNamespace() string`

**位置**：[L482](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L482)

### GetID()

**签名**：`func (tgvc *TaskGroupHostVolumeClaim) GetID() string`

**位置**：[L487](file:///d:/claude/nomad/nomad/structs/host_volumes.go#L487)

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
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [host_volumes_test.go](file:///d:/claude/nomad/nomad/structs/host_volumes_test.go) | 对应测试文件 |

