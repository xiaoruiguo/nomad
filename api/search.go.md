# search.go 代码说明文档

> 文件路径：[search.go](file:///d:/claude/nomad/api/search.go)
> 总行数：102 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **搜索（Search）API 客户端**，提供前缀搜索（节点/作业/分配等）的客户端方法。

## 2. 类型定义

### Search

**定义位置**：[L10](file:///d:/claude/nomad/api/search.go#L10)

**类型**：struct

```go
	client *Client
```

**关联方法**（2 个）：`PrefixSearch`, `FuzzySearch`

### SearchResponse

**定义位置**：[L32](file:///d:/claude/nomad/api/search.go#L32)

**类型**：struct

```go
	Matches map[contexts.Context][]string
	Truncations map[contexts.Context]bool
	QueryMeta
```

### SearchRequest

**定义位置**：[L38](file:///d:/claude/nomad/api/search.go#L38)

**类型**：struct

```go
	Prefix string
	Context contexts.Context
	QueryOptions
```

### FuzzyMatch

**定义位置**：[L69](file:///d:/claude/nomad/api/search.go#L69)

**类型**：struct

```go
	ID string
	Scope []string `json:",omitempty"`
```

### FuzzySearchResponse

**定义位置**：[L76](file:///d:/claude/nomad/api/search.go#L76)

**类型**：struct

```go
	Matches map[contexts.Context][]FuzzyMatch
	Truncations map[contexts.Context]bool
	QueryMeta
```

### FuzzySearchRequest

**定义位置**：[L90](file:///d:/claude/nomad/api/search.go#L90)

**类型**：struct

```go
	Text string
	Context contexts.Context
	QueryOptions
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Search` | `c *Client` | - | `*Search` | [L15](file:///d:/claude/nomad/api/search.go#L15) |
| `PrefixSearch` | `s *Search` | `prefix string, context contexts.Context, q *QueryOptions` | `*SearchResponse, *QueryMeta, error` | [L20](file:///d:/claude/nomad/api/search.go#L20) |
| `FuzzySearch` | `s *Search` | `text string, context contexts.Context, q *QueryOptions` | `*FuzzySearchResponse, *QueryMeta, error` | [L45](file:///d:/claude/nomad/api/search.go#L45) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/api/contexts` | 内部包 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [search_test.go](file:///d:/claude/nomad/api/search_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

