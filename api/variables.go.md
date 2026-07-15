# variables.go 代码说明文档

> 文件路径：[api/variables.go](file:///d:/claude/nomad/api/variables.go)
> 总行数：508 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `variables.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Variables

**定义位置**：[L28](file:///d:/claude/nomad/api/variables.go#L28)

**中文说明**：Variables 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Variables struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（20 个）：`Create`, `CheckedCreate`, `Read`, `Peek`, `Update`, `CheckedUpdate`, `Delete`, `CheckedDelete`, `List`, `PrefixList`, `GetItems`, `GetVariableItems`, `RenewLock`, `ReleaseLock`, `AcquireLock`, `lockOperation`, `readInternal`, `deleteInternal`, `deleteChecked`, `writeChecked`

### Variable

**定义位置**：[L360](file:///d:/claude/nomad/api/variables.go#L360)

**中文说明**：Variable 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Variable struct {
	Namespace string `hcl:"namespace"`
	Path string `hcl:"path"`
	CreateIndex uint64 `hcl:"create_index"`
	ModifyIndex uint64 `hcl:"modify_index"`
	CreateTime int64 `hcl:"create_time"`
	ModifyTime int64 `hcl:"modify_time"`
	Items VariableItems `hcl:"items"`
	Lock *VariableLock `hcl:",lock,optional" json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string `hcl:"namespace"`` | 命名空间 |
| `Path` | `string `hcl:"path"`` | 路径 |
| `CreateIndex` | `uint64 `hcl:"create_index"`` | 索引值（uint64） |
| `ModifyIndex` | `uint64 `hcl:"modify_index"`` | 索引值（uint64） |
| `CreateTime` | `int64 `hcl:"create_time"`` | — |
| `ModifyTime` | `int64 `hcl:"modify_time"`` | — |
| `Items` | `VariableItems `hcl:"items"`` | — |
| `Lock` | `*VariableLock `hcl:",lock,optional" json:",omitempty"`` | 互斥锁，保护并发访问 |

**关联方法**（6 个）：`Copy`, `Metadata`, `IsZeroValue`, `AsJSON`, `AsPrettyJSON`, `LockID`

### VariableMetadata

**定义位置**：[L388](file:///d:/claude/nomad/api/variables.go#L388)

**中文说明**：VariableMetadata 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type VariableMetadata struct {
	Namespace string `hcl:"namespace"`
	Path string `hcl:"path"`
	CreateIndex uint64 `hcl:"create_index"`
	ModifyIndex uint64 `hcl:"modify_index"`
	CreateTime int64 `hcl:"create_time"`
	ModifyTime int64 `hcl:"modify_time"`
	Lock *VariableLock `hcl:",lock,optional" json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string `hcl:"namespace"`` | 命名空间 |
| `Path` | `string `hcl:"path"`` | 路径 |
| `CreateIndex` | `uint64 `hcl:"create_index"`` | 索引值（uint64） |
| `ModifyIndex` | `uint64 `hcl:"modify_index"`` | 索引值（uint64） |
| `CreateTime` | `int64 `hcl:"create_time"`` | — |
| `ModifyTime` | `int64 `hcl:"modify_time"`` | — |
| `Lock` | `*VariableLock `hcl:",lock,optional" json:",omitempty"`` | 互斥锁，保护并发访问 |

### VariableLock

**定义位置**：[L411](file:///d:/claude/nomad/api/variables.go#L411)

**中文说明**：VariableLock 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type VariableLock struct {
	ID string
	TTL string
	LockDelay string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `TTL` | `string` | 生存时间（TTL） |
| `LockDelay` | `string` | 字符串 |

### VariableItems

**定义位置**：[L427](file:///d:/claude/nomad/api/variables.go#L427)

**类型定义**：`type VariableItems map[string]string`

### ErrCASConflict

**定义位置**：[L500](file:///d:/claude/nomad/api/variables.go#L500)

**中文说明**：ErrCASConflict 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ErrCASConflict struct {
	CheckIndex uint64
	Conflict *Variable
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CheckIndex` | `uint64` | 索引值（uint64） |
| `Conflict` | `*Variable` | — |

**关联方法**（1 个）：`Error`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ErrVariableNotFound` | `—` | `"variable not found"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ErrVariablePathNotFound` | `—` | `errors.New("variable not found")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Variables` | `c *Client` | `` | `*Variables` | [L33](file:///d:/claude/nomad/api/variables.go#L33) |
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
| `Copy` | `v *Variable` | `` | `*Variable` | [L439](file:///d:/claude/nomad/api/variables.go#L439) |
| `Metadata` | `v *Variable` | `` | `*VariableMetadata` | [L451](file:///d:/claude/nomad/api/variables.go#L451) |
| `IsZeroValue` | `v *Variable` | `` | `bool` | [L464](file:///d:/claude/nomad/api/variables.go#L464) |
| `cleanPathString` | - | `path string` | `string` | [L471](file:///d:/claude/nomad/api/variables.go#L471) |
| `AsJSON` | `v *Variable` | `` | `string` | [L476](file:///d:/claude/nomad/api/variables.go#L476) |
| `AsPrettyJSON` | `v *Variable` | `` | `string` | [L484](file:///d:/claude/nomad/api/variables.go#L484) |
| `LockID` | `v *Variable` | `` | `string` | [L492](file:///d:/claude/nomad/api/variables.go#L492) |
| `Error` | `e *ErrCASConflict` | `` | `string` | [L505](file:///d:/claude/nomad/api/variables.go#L505) |

## 5. 核心方法详解

### Create()

**签名**：`func (vars *Variables) Create(v *Variable, qo *WriteOptions) *Variable, *WriteMeta, error`

**位置**：[L38](file:///d:/claude/nomad/api/variables.go#L38)

**中文说明**：创建 用于 创建 变量.

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `v` | `*Variable` | — |
| `qo` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Variable` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Read()

**签名**：`func (vars *Variables) Read(path string, qo *QueryOptions) *Variable, *QueryMeta, error`

**位置**：[L63](file:///d:/claude/nomad/api/variables.go#L63)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `path` | `string` | 路径 |
| `qo` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Variable` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Update()

**签名**：`func (vars *Variables) Update(v *Variable, qo *WriteOptions) *Variable, *WriteMeta, error`

**位置**：[L87](file:///d:/claude/nomad/api/variables.go#L87)

**中文说明**：更新 用于 更新 变量.

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `v` | `*Variable` | — |
| `qo` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Variable` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (vars *Variables) Delete(path string, qo *WriteOptions) *WriteMeta, error`

**位置**：[L113](file:///d:/claude/nomad/api/variables.go#L113)

**中文说明**：删除 用于 删除 变量

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `path` | `string` | 路径 |
| `qo` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

### List()

**签名**：`func (vars *Variables) List(qo *QueryOptions) []*VariableMetadata, *QueryMeta, error`

**位置**：[L136](file:///d:/claude/nomad/api/variables.go#L136)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `qo` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*VariableMetadata` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### NewVariable()

**签名**：`func NewVariable(path string) *Variable`

**位置**：[L431](file:///d:/claude/nomad/api/variables.go#L431)

**中文说明**：创建并返回一个新的 Variable 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `path` | `string` | 路径 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Variable` | — |

### Copy()

**签名**：`func (v *Variable) Copy() *Variable`

**位置**：[L439](file:///d:/claude/nomad/api/variables.go#L439)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Variable` | — |

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

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **HTTP 服务**：提供 HTTP API 端点或客户端
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [variables_test.go](file:///d:/claude/nomad/api/variables_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

