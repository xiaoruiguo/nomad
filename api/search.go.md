# search.go 代码说明文档

> 文件路径：[api/search.go](file:///d:/claude/nomad/api/search.go)
> 总行数：102 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `search.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Search

**定义位置**：[L10](file:///d:/claude/nomad/api/search.go#L10)

**中文说明**：Search 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Search struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（2 个）：`PrefixSearch`, `FuzzySearch`

### SearchResponse

**定义位置**：[L32](file:///d:/claude/nomad/api/search.go#L32)

**中文说明**：SearchResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SearchResponse struct {
	Matches map[contexts.Context][]string
	Truncations map[contexts.Context]bool
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Matches` | `map[contexts.Context][]string` | 映射表 |
| `Truncations` | `map[contexts.Context]bool` | 映射表 |
| `QueryMeta` | `QueryMeta` | — |

### SearchRequest

**定义位置**：[L38](file:///d:/claude/nomad/api/search.go#L38)

**中文说明**：SearchRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type SearchRequest struct {
	Prefix string
	Context contexts.Context
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Prefix` | `string` | 字符串 |
| `Context` | `contexts.Context` | 上下文，用于控制请求的生命周期 |
| `QueryOptions` | `QueryOptions` | — |

### FuzzyMatch

**定义位置**：[L69](file:///d:/claude/nomad/api/search.go#L69)

**中文说明**：FuzzyMatch 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type FuzzyMatch struct {
	ID string
	Scope []string `json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Scope` | `[]string `json:",omitempty"`` | 列表 |

### FuzzySearchResponse

**定义位置**：[L76](file:///d:/claude/nomad/api/search.go#L76)

**中文说明**：FuzzySearchResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type FuzzySearchResponse struct {
	Matches map[contexts.Context][]FuzzyMatch
	Truncations map[contexts.Context]bool
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Matches` | `map[contexts.Context][]FuzzyMatch` | 映射表 |
| `Truncations` | `map[contexts.Context]bool` | 映射表 |
| `QueryMeta` | `QueryMeta` | — |

### FuzzySearchRequest

**定义位置**：[L90](file:///d:/claude/nomad/api/search.go#L90)

**中文说明**：FuzzySearchRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type FuzzySearchRequest struct {
	Text string
	Context contexts.Context
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Text` | `string` | 字符串 |
| `Context` | `contexts.Context` | 上下文，用于控制请求的生命周期 |
| `QueryOptions` | `QueryOptions` | — |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Search` | `c *Client` | `` | `*Search` | [L15](file:///d:/claude/nomad/api/search.go#L15) |
| `PrefixSearch` | `s *Search` | `prefix string, context contexts.Context, q *QueryOptions` | `*SearchResponse, *QueryMeta, error` | [L20](file:///d:/claude/nomad/api/search.go#L20) |
| `FuzzySearch` | `s *Search` | `text string, context contexts.Context, q *QueryOptions` | `*FuzzySearchResponse, *QueryMeta, error` | [L45](file:///d:/claude/nomad/api/search.go#L45) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/api/contexts` | 内部包 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [search_test.go](file:///d:/claude/nomad/api/search_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

