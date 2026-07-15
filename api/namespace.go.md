# namespace.go 代码说明文档

> 文件路径：[namespace.go](file:///d:/claude/nomad/api/namespace.go)
> 总行数：172 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **命名空间（Namespace）API 客户端**，提供命名空间 CRUD 操作的客户端方法。

## 2. 类型定义

### Namespaces

**定义位置**：[L12](file:///d:/claude/nomad/api/namespace.go#L12)

**类型**：struct

```go
	client *Client
```

**关联方法**（5 个）：`List`, `PrefixList`, `Info`, `Register`, `Delete`

### Namespace

**定义位置**：[L72](file:///d:/claude/nomad/api/namespace.go#L72)

**类型**：struct

```go
	Name string
	Description string
	Quota string
	Capabilities *NamespaceCapabilities `hcl:"capabilities,block"`
	NodePoolConfiguration *NamespaceNodePoolConfiguration `hcl:"node_pool_config,block"`
	VaultConfiguration *NamespaceVaultConfiguration `hcl:"vault,block"`
	ConsulConfiguration *NamespaceConsulConfiguration `hcl:"consul,block"`
	Meta map[string]string
	CreateIndex uint64
	ModifyIndex uint64
	RequiredExtraClaims map[string]string
	OptionalExtraClaims map[string]string
```

### NamespaceCapabilities

**定义位置**：[L89](file:///d:/claude/nomad/api/namespace.go#L89)

**类型**：struct

```go
	EnabledTaskDrivers []string `hcl:"enabled_task_drivers"`
	DisabledTaskDrivers []string `hcl:"disabled_task_drivers"`
	EnabledNetworkModes []string `hcl:"enabled_network_modes"`
	DisabledNetworkModes []string `hcl:"disabled_network_modes"`
```

### NamespaceNodePoolConfiguration

**定义位置**：[L98](file:///d:/claude/nomad/api/namespace.go#L98)

**类型**：struct

```go
	Default string
	Allowed []string
	Denied []string
```

### NamespaceVaultConfiguration

**定义位置**：[L106](file:///d:/claude/nomad/api/namespace.go#L106)

**类型**：struct

```go
	Default string
	Allowed []string
	Denied []string
```

### NamespaceConsulConfiguration

**定义位置**：[L128](file:///d:/claude/nomad/api/namespace.go#L128)

**类型**：struct

```go
	Default string
	Allowed []string
	Denied []string
```

### NamespaceIndexSort

**定义位置**：[L150](file:///d:/claude/nomad/api/namespace.go#L150)

**类型定义**：`[]*Namespace`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### NamespacedID

**定义位置**：[L166](file:///d:/claude/nomad/api/namespace.go#L166)

**类型**：struct

```go
	Namespace string
	ID string
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Namespaces` | `c *Client` | - | `*Namespaces` | [L17](file:///d:/claude/nomad/api/namespace.go#L17) |
| `List` | `n *Namespaces` | `q *QueryOptions` | `[]*Namespace, *QueryMeta, error` | [L22](file:///d:/claude/nomad/api/namespace.go#L22) |
| `PrefixList` | `n *Namespaces` | `prefix string, q *QueryOptions` | `[]*Namespace, *QueryMeta, error` | [L33](file:///d:/claude/nomad/api/namespace.go#L33) |
| `Info` | `n *Namespaces` | `name string, q *QueryOptions` | `*Namespace, *QueryMeta, error` | [L44](file:///d:/claude/nomad/api/namespace.go#L44) |
| `Register` | `n *Namespaces` | `namespace *Namespace, q *WriteOptions` | `*WriteMeta, error` | [L54](file:///d:/claude/nomad/api/namespace.go#L54) |
| `Delete` | `n *Namespaces` | `namespace string, q *WriteOptions` | `*WriteMeta, error` | [L63](file:///d:/claude/nomad/api/namespace.go#L63) |
| `Len` | `n *NamespaceIndexSort` | - | `int` | [L152](file:///d:/claude/nomad/api/namespace.go#L152) |
| `Less` | `n *NamespaceIndexSort` | `i int, j int` | `bool` | [L156](file:///d:/claude/nomad/api/namespace.go#L156) |
| `Swap` | `n *NamespaceIndexSort` | `i int, j int` | - | [L160](file:///d:/claude/nomad/api/namespace.go#L160) |

## 5. 核心方法详解

### List()

**签名**：`func (n *Namespaces) List(q *QueryOptions) []*Namespace, *QueryMeta, error`

**位置**：[L22](file:///d:/claude/nomad/api/namespace.go#L22)

### Info()

**签名**：`func (n *Namespaces) Info(name string, q *QueryOptions) *Namespace, *QueryMeta, error`

**位置**：[L44](file:///d:/claude/nomad/api/namespace.go#L44)

### Register()

**签名**：`func (n *Namespaces) Register(namespace *Namespace, q *WriteOptions) *WriteMeta, error`

**位置**：[L54](file:///d:/claude/nomad/api/namespace.go#L54)

### Delete()

**签名**：`func (n *Namespaces) Delete(namespace string, q *WriteOptions) *WriteMeta, error`

**位置**：[L63](file:///d:/claude/nomad/api/namespace.go#L63)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `sort` | 标准库 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [namespace_test.go](file:///d:/claude/nomad/api/namespace_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

