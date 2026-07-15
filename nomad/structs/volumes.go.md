# volumes.go 代码说明文档

> 文件路径：[structs/volumes.go](file:///d:/claude/nomad/nomad/structs/volumes.go)
> 总行数：375 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### ClientHostVolumeConfig

**定义位置**：[L30](file:///d:/claude/nomad/nomad/structs/volumes.go#L30)

**类型**：struct

```go
	Name string `hcl:",key"`
	Path string `hcl:"path"`
	ReadOnly bool `hcl:"read_only"`
	ID string `hcl:"-"`
```

**关联方法**（2 个）：`Equal`, `Copy`

### VolumeRequest

**定义位置**：[L108](file:///d:/claude/nomad/nomad/structs/volumes.go#L108)

**类型**：struct

```go
	Name string
	Type string
	Source string
	ReadOnly bool
	Sticky bool
	AccessMode VolumeAccessMode
	AttachmentMode VolumeAttachmentMode
	MountOptions *CSIMountOptions
	PerAlloc bool
```

**关联方法**（4 个）：`Equal`, `Validate`, `Copy`, `VolumeID`

### VolumeAttachmentMode

**定义位置**：[L275](file:///d:/claude/nomad/nomad/structs/volumes.go#L275)

**类型定义**：`string`

### VolumeAccessMode

**定义位置**：[L279](file:///d:/claude/nomad/nomad/structs/volumes.go#L279)

**类型定义**：`string`

### VolumeMount

**定义位置**：[L283](file:///d:/claude/nomad/nomad/structs/volumes.go#L283)

**类型**：struct

```go
	Volume string
	Destination string
	ReadOnly bool
	PropagationMode string
	SELinuxLabel string
```

**关联方法**（6 个）：`Hash`, `Equal`, `Copy`, `Validate`, `MountPropagationModeIsValid`, `SELinuxLabelIsValid`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `VolumeTypeHost` | `"host"` |
| `VolumeMountPropagationPrivate` | `"private"` |
| `VolumeMountPropagationHostToTask` | `"host-to-task"` |
| `VolumeMountPropagationBidirectional` | `"bidirectional"` |
| `SELinuxSharedVolume` | `"z"` |
| `SELinuxPrivateVolume` | `"Z"` |

### 变量

| 名称 | 值 |
|------|----|
| `errVolMountInvalidPropagationMode` | `fmt.Errorf("volume mount has an invalid propagation mode")` |
| `errVolMountInvalidSELinuxLabel` | `fmt.Errorf("volume mount has an invalid SELinux label")` |
| `errVolMountEmptyVol` | `fmt.Errorf("volume mount references an empty volume")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Equal` | `p *ClientHostVolumeConfig` | `o *ClientHostVolumeConfig` | `bool` | [L38](file:///d:/claude/nomad/nomad/structs/volumes.go#L38) |
| `Copy` | `p *ClientHostVolumeConfig` | - | `*ClientHostVolumeConfig` | [L48](file:///d:/claude/nomad/nomad/structs/volumes.go#L48) |
| `CopyMapStringClientHostVolumeConfig` | - | `m map[string]*ClientHostVolumeConfig` | `map[string]*ClientHostVolumeConfig` | [L58](file:///d:/claude/nomad/nomad/structs/volumes.go#L58) |
| `CopySliceClientHostVolumeConfig` | - | `s []*ClientHostVolumeConfig` | `[]*ClientHostVolumeConfig` | [L71](file:///d:/claude/nomad/nomad/structs/volumes.go#L71) |
| `HostVolumeSliceMerge` | - | `a []*ClientHostVolumeConfig, b []*ClientHostVolumeConfig` | `[]*ClientHostVolumeConfig` | [L85](file:///d:/claude/nomad/nomad/structs/volumes.go#L85) |
| `Equal` | `v *VolumeRequest` | `o *VolumeRequest` | `bool` | [L120](file:///d:/claude/nomad/nomad/structs/volumes.go#L120) |
| `Validate` | `v *VolumeRequest` | `jobType string, taskGroupCount int, canaries int` | `error` | [L147](file:///d:/claude/nomad/nomad/structs/volumes.go#L147) |
| `Copy` | `v *VolumeRequest` | - | `*VolumeRequest` | [L238](file:///d:/claude/nomad/nomad/structs/volumes.go#L238) |
| `VolumeID` | `v *VolumeRequest` | `tgName string` | `string` | [L252](file:///d:/claude/nomad/nomad/structs/volumes.go#L252) |
| `CopyMapVolumeRequest` | - | `s map[string]*VolumeRequest` | `map[string]*VolumeRequest` | [L260](file:///d:/claude/nomad/nomad/structs/volumes.go#L260) |
| `Hash` | `v *VolumeMount` | - | `string` | [L292](file:///d:/claude/nomad/nomad/structs/volumes.go#L292) |
| `Equal` | `v *VolumeMount` | `o *VolumeMount` | `bool` | [L296](file:///d:/claude/nomad/nomad/structs/volumes.go#L296) |
| `Copy` | `v *VolumeMount` | - | `*VolumeMount` | [L316](file:///d:/claude/nomad/nomad/structs/volumes.go#L316) |
| `Validate` | `v *VolumeMount` | - | `error` | [L326](file:///d:/claude/nomad/nomad/structs/volumes.go#L326) |
| `MountPropagationModeIsValid` | `v *VolumeMount` | - | `bool` | [L345](file:///d:/claude/nomad/nomad/structs/volumes.go#L345) |
| `SELinuxLabelIsValid` | `v *VolumeMount` | - | `bool` | [L354](file:///d:/claude/nomad/nomad/structs/volumes.go#L354) |
| `CopySliceVolumeMount` | - | `s []*VolumeMount` | `[]*VolumeMount` | [L363](file:///d:/claude/nomad/nomad/structs/volumes.go#L363) |

## 5. 核心方法详解

### Validate()

**签名**：`func (v *VolumeRequest) Validate(jobType string, taskGroupCount int, canaries int) error`

**位置**：[L147](file:///d:/claude/nomad/nomad/structs/volumes.go#L147)

### Validate()

**签名**：`func (v *VolumeMount) Validate() error`

**位置**：[L326](file:///d:/claude/nomad/nomad/structs/volumes.go#L326)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [volumes_test.go](file:///d:/claude/nomad/nomad/structs/volumes_test.go) | 对应测试文件 |

