# variables.go 代码说明文档

> 文件路径：[variables.go](file:///d:/claude/nomad/api/variables.go)
> 总行数：508 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **变量（Variables）API 客户端**，提供 Nomad Variables 功能的 CRUD 客户端方法。

## 2. 类型定义

### Variables

**定义位置**：[L28](file:///d:/claude/nomad/api/variables.go#L28)

**类型**：struct

```go
	client *Client
```

**关联方法**（20 个）：`Create`, `CheckedCreate`, `Read`, `Peek`, `Update`, `CheckedUpdate`, `Delete`, `CheckedDelete`, `List`, `PrefixList`, `GetItems`, `GetVariableItems`, `RenewLock`, `ReleaseLock`, `AcquireLock`, `lockOperation`, `readInternal`, `deleteInternal`, `deleteChecked`, `writeChecked`

### Variable

**定义位置**：[L360](file:///d:/claude/nomad/api/variables.go#L360)

**类型**：struct

```go
	Namespace string `hcl:"namespace"`
	Path string `hcl:"path"`
	CreateIndex uint64 `hcl:"create_index"`
	ModifyIndex uint64 `hcl:"modify_index"`
	CreateTime int64 `hcl:"create_time"`
	ModifyTime int64 `hcl:"modify_time"`
	Items VariableItems `hcl:"items"`
	Lock *VariableLock `hcl:",lock,optional" json:",omitempty"`
```

**关联方法**（6 个）：`Copy`, `Metadata`, `IsZeroValue`, `AsJSON`, `AsPrettyJSON`, `LockID`

### VariableMetadata

**定义位置**：[L388](file:///d:/claude/nomad/api/variables.go#L388)

**类型**：struct

```go
	Namespace string `hcl:"namespace"`
	Path string `hcl:"path"`
	CreateIndex uint64 `hcl:"create_index"`
	ModifyIndex uint64 `hcl:"modify_index"`
	CreateTime int64 `hcl:"create_time"`
	ModifyTime int64 `hcl:"modify_time"`
	Lock *VariableLock `hcl:",lock,optional" json:",omitempty"`
```

### VariableLock

**定义位置**：[L411](file:///d:/claude/nomad/api/variables.go#L411)

**类型**：struct

```go
	ID string
	TTL string
	LockDelay string
```

### VariableItems

**定义位置**：[L427](file:///d:/claude/nomad/api/variables.go#L427)

**类型定义**：`map[string]string`

### ErrCASConflict

**定义位置**：[L500](file:///d:/claude/nomad/api/variables.go#L500)

**类型**：struct

```go
	CheckIndex uint64
	Conflict *Variable
```

**关联方法**（1 个）：`Error`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `ErrVariableNotFound` | `"variable not found"` |

### 变量

| 名称 | 值 |
|------|----|
| `ErrVariablePathNotFound` | `*ast.CallExpr` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Variables` | `c *Client` | - | `*Variables` | [L33](file:///d:/claude/nomad/api/variables.go#L33) |
| `Create` | `vars *Variables` | `v *Variable, qo *WriteOptions` | `*Variable, *WriteMeta, error` | [L38](file:///d:/claude/nomad/api/variables.go#L38) |
| `CheckedCreate` | `vars *Variables` | `v *Variable, qo *WriteOptions` | `*Variable, *WriteMeta, error` | [L51](file:///d:/claude/nomad/api/variables.go#L51) |
| `Read` | `vars *Variables` | `path string, qo *QueryOptions` | `*Variable, *QueryMeta, error` | [L63](file:///d:/claude/nomad/api/variables.go#L63) |
| `Peek` | `vars *Variables` | `path string, qo *QueryOptions` | `*Variable, *QueryMeta, error` | [L77](file:///d:/claude/nomad/api/variables.go#L77) |
| `Update` | `vars *Variables` | `v *Variable, qo *WriteOptions` | `*Variable, *WriteMeta, error` | [L87](file:///d:/claude/nomad/api/variables.go#L87) |
| `CheckedUpdate` | `vars *Variables` | `v *Variable, qo *WriteOptions` | `*Variable, *WriteMeta, error` | [L101](file:///d:/claude/nomad/api/variables.go#L101) |
| `Delete` | `vars *Variables` | `path string, qo *WriteOptions` | `*WriteMeta, error` | [L113](file:///d:/claude/nomad/api/variables.go#L113) |
| `CheckedDelete` | `vars *Variables` | `path string, checkIndex uint64, qo *WriteOptions` | `*WriteMeta, error` | [L125](file:///d:/claude/nomad/api/variables.go#L125) |
| `List` | `vars *Variables` | `qo *QueryOptions` | `[]*VariableMetadata, *QueryMeta, error` | [L136](file:///d:/claude/nomad/api/variables.go#L136) |
| `PrefixList` | `vars *Variables` | `prefix string, qo *QueryOptions` | `[]*VariableMetadata, *QueryMeta, error` | [L146](file:///d:/claude/nomad/api/variables.go#L146) |
| `GetItems` | `vars *Variables` | `path string, qo *QueryOptions` | `*VariableItems, *QueryMeta, error` | [L158](file:///d:/claude/nomad/api/variables.go#L158) |
| `GetVariableItems` | `vars *Variables` | `path string, qo *QueryOptions` | `VariableItems, *QueryMeta, error` | [L167](file:///d:/claude/nomad/api/variables.go#L167) |
| `RenewLock` | `vars *Variables` | `v *Variable, qo *WriteOptions` | `*VariableMetadata, *WriteMeta, error` | [L186](file:///d:/claude/nomad/api/variables.go#L186) |
| `ReleaseLock` | `vars *Variables` | `v *Variable, qo *WriteOptions` | `*Variable, *WriteMeta, error` | [L198](file:///d:/claude/nomad/api/variables.go#L198) |
| `AcquireLock` | `vars *Variables` | `v *Variable, qo *WriteOptions` | `*Variable, *WriteMeta, error` | [L206](file:///d:/claude/nomad/api/variables.go#L206) |
| `lockOperation` | `vars *Variables` | `v *Variable, qo *WriteOptions, operation string` | `*Variable, *WriteMeta, error` | [L210](file:///d:/claude/nomad/api/variables.go#L210) |
| `readInternal` | `vars *Variables` | `endpoint string, q *QueryOptions` | `*Variable, *QueryMeta, error` | [L225](file:///d:/claude/nomad/api/variables.go#L225) |
| `deleteInternal` | `vars *Variables` | `path string, q *WriteOptions` | `*WriteMeta, error` | [L261](file:///d:/claude/nomad/api/variables.go#L261) |
| `deleteChecked` | `vars *Variables` | `path string, checkIndex uint64, q *WriteOptions` | `*WriteMeta, error` | [L283](file:///d:/claude/nomad/api/variables.go#L283) |
| `writeChecked` | `vars *Variables` | `endpoint string, in *Variable, out *Variable, q *WriteOptions` | `*WriteMeta, error` | [L318](file:///d:/claude/nomad/api/variables.go#L318) |
| `NewVariable` | - | `path string` | `*Variable` | [L431](file:///d:/claude/nomad/api/variables.go#L431) |
| `Copy` | `v *Variable` | - | `*Variable` | [L439](file:///d:/claude/nomad/api/variables.go#L439) |
| `Metadata` | `v *Variable` | - | `*VariableMetadata` | [L451](file:///d:/claude/nomad/api/variables.go#L451) |
| `IsZeroValue` | `v *Variable` | - | `bool` | [L464](file:///d:/claude/nomad/api/variables.go#L464) |
| `cleanPathString` | - | `path string` | `string` | [L471](file:///d:/claude/nomad/api/variables.go#L471) |
| `AsJSON` | `v *Variable` | - | `string` | [L476](file:///d:/claude/nomad/api/variables.go#L476) |
| `AsPrettyJSON` | `v *Variable` | - | `string` | [L484](file:///d:/claude/nomad/api/variables.go#L484) |
| `LockID` | `v *Variable` | - | `string` | [L492](file:///d:/claude/nomad/api/variables.go#L492) |
| `Error` | `e *ErrCASConflict` | - | `string` | [L505](file:///d:/claude/nomad/api/variables.go#L505) |

## 5. 核心方法详解

### Create()

**签名**：`func (vars *Variables) Create(v *Variable, qo *WriteOptions) *Variable, *WriteMeta, error`

**位置**：[L38](file:///d:/claude/nomad/api/variables.go#L38)

### Update()

**签名**：`func (vars *Variables) Update(v *Variable, qo *WriteOptions) *Variable, *WriteMeta, error`

**位置**：[L87](file:///d:/claude/nomad/api/variables.go#L87)

### Delete()

**签名**：`func (vars *Variables) Delete(path string, qo *WriteOptions) *WriteMeta, error`

**位置**：[L113](file:///d:/claude/nomad/api/variables.go#L113)

### List()

**签名**：`func (vars *Variables) List(qo *QueryOptions) []*VariableMetadata, *QueryMeta, error`

**位置**：[L136](file:///d:/claude/nomad/api/variables.go#L136)

### GetItems()

**签名**：`func (vars *Variables) GetItems(path string, qo *QueryOptions) *VariableItems, *QueryMeta, error`

**位置**：[L158](file:///d:/claude/nomad/api/variables.go#L158)

### GetVariableItems()

**签名**：`func (vars *Variables) GetVariableItems(path string, qo *QueryOptions) VariableItems, *QueryMeta, error`

**位置**：[L167](file:///d:/claude/nomad/api/variables.go#L167)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `net/http` | 标准库 |
| `strings` | 标准库 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [variables_test.go](file:///d:/claude/nomad/api/variables_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

