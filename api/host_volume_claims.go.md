# host_volume_claims.go 代码说明文档

> 文件路径：[api/host_volume_claims.go](file:///d:/claude/nomad/api/host_volume_claims.go)
> 总行数：71 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `host_volume_claims.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### TaskGroupHostVolumeClaim

**定义位置**：[L11](file:///d:/claude/nomad/api/host_volume_claims.go#L11)

**中文说明**：TaskGroupHostVolumeClaim 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskGroupHostVolumeClaim struct {
	ID string `mapstructure:"id"`
	Namespace string `mapstructure:"namespace"`
	JobID string `mapstructure:"job_id"`
	TaskGroupName string `mapstructure:"task_group_name"`
	AllocID string `mapstructure:"alloc_id"`
	VolumeID string `mapstructure:"volume_id"`
	VolumeName string `mapstructure:"volume_name"`
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string `mapstructure:"id"`` | 唯一标识符 |
| `Namespace` | `string `mapstructure:"namespace"`` | 命名空间 |
| `JobID` | `string `mapstructure:"job_id"`` | 字符串 |
| `TaskGroupName` | `string `mapstructure:"task_group_name"`` | 字符串 |
| `AllocID` | `string `mapstructure:"alloc_id"`` | 字符串 |
| `VolumeID` | `string `mapstructure:"volume_id"`` | 字符串 |
| `VolumeName` | `string `mapstructure:"volume_name"`` | 字符串 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### TaskGroupHostVolumeClaims

**定义位置**：[L25](file:///d:/claude/nomad/api/host_volume_claims.go#L25)

**中文说明**：TaskGroupHostVolumeClaims 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskGroupHostVolumeClaims struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（2 个）：`List`, `Delete`

### TaskGroupHostVolumeClaimsListRequest

**定义位置**：[L34](file:///d:/claude/nomad/api/host_volume_claims.go#L34)

**中文说明**：TaskGroupHostVolumeClaimsListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type TaskGroupHostVolumeClaimsListRequest struct {
	JobID string
	TaskGroup string
	VolumeName string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `TaskGroup` | `string` | 字符串 |
| `VolumeName` | `string` | 字符串 |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `TaskGroupHostVolumeClaims` | `c *Client` | `` | `*TaskGroupHostVolumeClaims` | [L30](file:///d:/claude/nomad/api/host_volume_claims.go#L30) |
| `List` | `tgvc *TaskGroupHostVolumeClaims` | `req *TaskGroupHostVolumeClaimsListRequest, opts *QueryOptions` | `[]*TaskGroupHostVolumeClaim, *QueryMeta, error` | [L40](file:///d:/claude/nomad/api/host_volume_claims.go#L40) |
| `Delete` | `tgvc *TaskGroupHostVolumeClaims` | `claimID string, opts *WriteOptions` | `*WriteMeta, error` | [L63](file:///d:/claude/nomad/api/host_volume_claims.go#L63) |

## 5. 核心方法详解

### List()

**签名**：`func (tgvc *TaskGroupHostVolumeClaims) List(req *TaskGroupHostVolumeClaimsListRequest, opts *QueryOptions) []*TaskGroupHostVolumeClaim, *QueryMeta, error`

**位置**：[L40](file:///d:/claude/nomad/api/host_volume_claims.go#L40)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `req` | `*TaskGroupHostVolumeClaimsListRequest` | — |
| `opts` | `*QueryOptions` | 选项 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*TaskGroupHostVolumeClaim` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (tgvc *TaskGroupHostVolumeClaims) Delete(claimID string, opts *WriteOptions) *WriteMeta, error`

**位置**：[L63](file:///d:/claude/nomad/api/host_volume_claims.go#L63)

**中文说明**：删除指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `claimID` | `string` | 字符串 |
| `opts` | `*WriteOptions` | 选项 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `net/url` | 标准库 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

