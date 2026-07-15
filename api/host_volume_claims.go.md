# host_volume_claims.go 代码说明文档

> 文件路径：[host_volume_claims.go](file:///d:/claude/nomad/api/host_volume_claims.go)
> 总行数：71 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **主机卷（Host Volume）API 客户端**，提供主机卷的 CRUD 操作客户端方法。

## 2. 类型定义

### TaskGroupHostVolumeClaim

**定义位置**：[L11](file:///d:/claude/nomad/api/host_volume_claims.go#L11)

**类型**：struct

```go
	ID string `mapstructure:"id"`
	Namespace string `mapstructure:"namespace"`
	JobID string `mapstructure:"job_id"`
	TaskGroupName string `mapstructure:"task_group_name"`
	AllocID string `mapstructure:"alloc_id"`
	VolumeID string `mapstructure:"volume_id"`
	VolumeName string `mapstructure:"volume_name"`
	CreateIndex uint64
	ModifyIndex uint64
```

### TaskGroupHostVolumeClaims

**定义位置**：[L25](file:///d:/claude/nomad/api/host_volume_claims.go#L25)

**类型**：struct

```go
	client *Client
```

**关联方法**（2 个）：`List`, `Delete`

### TaskGroupHostVolumeClaimsListRequest

**定义位置**：[L34](file:///d:/claude/nomad/api/host_volume_claims.go#L34)

**类型**：struct

```go
	JobID string
	TaskGroup string
	VolumeName string
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `TaskGroupHostVolumeClaims` | `c *Client` | - | `*TaskGroupHostVolumeClaims` | [L30](file:///d:/claude/nomad/api/host_volume_claims.go#L30) |
| `List` | `tgvc *TaskGroupHostVolumeClaims` | `req *TaskGroupHostVolumeClaimsListRequest, opts *QueryOptions` | `[]*TaskGroupHostVolumeClaim, *QueryMeta, error` | [L40](file:///d:/claude/nomad/api/host_volume_claims.go#L40) |
| `Delete` | `tgvc *TaskGroupHostVolumeClaims` | `claimID string, opts *WriteOptions` | `*WriteMeta, error` | [L63](file:///d:/claude/nomad/api/host_volume_claims.go#L63) |

## 5. 核心方法详解

### List()

**签名**：`func (tgvc *TaskGroupHostVolumeClaims) List(req *TaskGroupHostVolumeClaimsListRequest, opts *QueryOptions) []*TaskGroupHostVolumeClaim, *QueryMeta, error`

**位置**：[L40](file:///d:/claude/nomad/api/host_volume_claims.go#L40)

### Delete()

**签名**：`func (tgvc *TaskGroupHostVolumeClaims) Delete(claimID string, opts *WriteOptions) *WriteMeta, error`

**位置**：[L63](file:///d:/claude/nomad/api/host_volume_claims.go#L63)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `net/url` | 标准库 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

