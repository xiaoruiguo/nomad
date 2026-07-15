# host_volumes.go 代码说明文档

> 文件路径：[client/structs/host_volumes.go](file:///d:/claude/nomad/client/structs/host_volumes.go)
> 总行数：116 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **客户端子包**（`client/`），实现 Nomad 客户端的功能组件。

## 2. 类型定义

### HostVolumeState

**定义位置**：[L6](file:///d:/claude/nomad/client/structs/host_volumes.go#L6)

**中文说明**：HostVolumeState 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type HostVolumeState struct {
	ID string
	HostPath string
	CreateReq *ClientHostVolumeCreateRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `HostPath` | `string` | 字符串 |
| `CreateReq` | `*ClientHostVolumeCreateRequest` | 关联的 Client 实例 |

### ClientHostVolumeCreateRequest

**定义位置**：[L12](file:///d:/claude/nomad/client/structs/host_volumes.go#L12)

**中文说明**：ClientHostVolumeCreateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientHostVolumeCreateRequest struct {
	ID string
	Name string
	PluginID string
	Namespace string
	NodeID string
	RequestedCapacityMinBytes int64
	RequestedCapacityMaxBytes int64
	Parameters map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Name` | `string` | 名称 |
| `PluginID` | `string` | 字符串 |
| `Namespace` | `string` | 命名空间 |
| `NodeID` | `string` | 字符串 |
| `RequestedCapacityMinBytes` | `int64` | — |
| `RequestedCapacityMaxBytes` | `int64` | — |
| `Parameters` | `map[string]string` | 参数 |

### ClientHostVolumeCreateResponse

**定义位置**：[L44](file:///d:/claude/nomad/client/structs/host_volumes.go#L44)

**中文说明**：ClientHostVolumeCreateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ClientHostVolumeCreateResponse struct {
	VolumeName string
	VolumeID string
	HostPath string
	CapacityBytes int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VolumeName` | `string` | 字符串 |
| `VolumeID` | `string` | 字符串 |
| `HostPath` | `string` | 字符串 |
| `CapacityBytes` | `int64` | — |

### ClientHostVolumeRegisterRequest

**定义位置**：[L57](file:///d:/claude/nomad/client/structs/host_volumes.go#L57)

**中文说明**：ClientHostVolumeRegisterRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientHostVolumeRegisterRequest struct {
	ID string
	Name string
	NodeID string
	HostPath string
	CapacityBytes int64
	Parameters map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Name` | `string` | 名称 |
| `NodeID` | `string` | 字符串 |
| `HostPath` | `string` | 字符串 |
| `CapacityBytes` | `int64` | — |
| `Parameters` | `map[string]string` | 参数 |

### ClientHostVolumeRegisterResponse

**定义位置**：[L82](file:///d:/claude/nomad/client/structs/host_volumes.go#L82)

**中文说明**：ClientHostVolumeRegisterResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

### ClientHostVolumeDeleteRequest

**定义位置**：[L84](file:///d:/claude/nomad/client/structs/host_volumes.go#L84)

**中文说明**：ClientHostVolumeDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ClientHostVolumeDeleteRequest struct {
	ID string
	Name string
	PluginID string
	Namespace string
	NodeID string
	HostPath string
	Parameters map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Name` | `string` | 名称 |
| `PluginID` | `string` | 字符串 |
| `Namespace` | `string` | 命名空间 |
| `NodeID` | `string` | 字符串 |
| `HostPath` | `string` | 字符串 |
| `Parameters` | `map[string]string` | 参数 |

### ClientHostVolumeDeleteResponse

**定义位置**：[L112](file:///d:/claude/nomad/client/structs/host_volumes.go#L112)

**中文说明**：ClientHostVolumeDeleteResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ClientHostVolumeDeleteResponse struct {
	VolumeName string
	VolumeID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VolumeName` | `string` | 字符串 |
| `VolumeID` | `string` | 字符串 |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

该文件未定义方法。

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

该文件无导入包。

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [allochook.go](file:///d:/claude/nomad/client/structs/allochook.go) | 同目录源文件 |
| [broadcaster.go](file:///d:/claude/nomad/client/structs/broadcaster.go) | 同目录源文件 |
| [csi.go](file:///d:/claude/nomad/client/structs/csi.go) | 同目录源文件 |
| [enum.go](file:///d:/claude/nomad/client/structs/enum.go) | 同目录源文件 |
| [structs.go](file:///d:/claude/nomad/client/structs/structs.go) | 同目录源文件 |

