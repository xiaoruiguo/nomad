# search.go 代码说明文档

> 文件路径：[nomad/structs/search.go](file:///d:/claude/nomad/nomad/structs/search.go)
> 总行数：146 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 1 个方法/函数。

## 2. 类型定义

### Context

**定义位置**：[L8](file:///d:/claude/nomad/nomad/structs/search.go#L8)

**类型定义**：`type Context string`

### SearchConfig

**定义位置**：[L40](file:///d:/claude/nomad/nomad/structs/search.go#L40)

**中文说明**：SearchConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type SearchConfig struct {
	FuzzyEnabled bool `hcl:"fuzzy_enabled"`
	LimitQuery int `hcl:"limit_query"`
	LimitResults int `hcl:"limit_results"`
	MinTermLength int `hcl:"min_term_length"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `FuzzyEnabled` | `bool `hcl:"fuzzy_enabled"`` | 布尔值 |
| `LimitQuery` | `int `hcl:"limit_query"`` | — |
| `LimitResults` | `int `hcl:"limit_results"`` | — |
| `MinTermLength` | `int `hcl:"min_term_length"`` | — |

**关联方法**（1 个）：`Copy`

### SearchResponse

**定义位置**：[L78](file:///d:/claude/nomad/nomad/structs/search.go#L78)

**中文说明**：SearchResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SearchResponse struct {
	Matches map[Context][]string
	Truncations map[Context]bool
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Matches` | `map[Context][]string` | 映射表 |
| `Truncations` | `map[Context]bool` | 映射表 |
| `QueryMeta` | `QueryMeta` | — |

### SearchRequest

**定义位置**：[L92](file:///d:/claude/nomad/nomad/structs/search.go#L92)

**中文说明**：SearchRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type SearchRequest struct {
	Prefix string
	Context Context
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Prefix` | `string` | 字符串 |
| `Context` | `Context` | 上下文，用于控制请求的生命周期 |
| `QueryOptions` | `QueryOptions` | — |

### FuzzyMatch

**定义位置**：[L113](file:///d:/claude/nomad/nomad/structs/search.go#L113)

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

**定义位置**：[L120](file:///d:/claude/nomad/nomad/structs/search.go#L120)

**中文说明**：FuzzySearchResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type FuzzySearchResponse struct {
	Matches map[Context][]FuzzyMatch
	Truncations map[Context]bool
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Matches` | `map[Context][]FuzzyMatch` | 映射表 |
| `Truncations` | `map[Context]bool` | 映射表 |
| `QueryMeta` | `QueryMeta` | — |

### FuzzySearchRequest

**定义位置**：[L134](file:///d:/claude/nomad/nomad/structs/search.go#L134)

**中文说明**：FuzzySearchRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type FuzzySearchRequest struct {
	Text string
	Context Context
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Text` | `string` | 字符串 |
| `Context` | `Context` | 上下文，用于控制请求的生命周期 |
| `QueryOptions` | `QueryOptions` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `Allocs` | `Context` | `"allocs"` | — |
| `Deployments` | `Context` | `"deployment"` | — |
| `Evals` | `Context` | `"evals"` | — |
| `Jobs` | `Context` | `"jobs"` | — |
| `Nodes` | `Context` | `"nodes"` | — |
| `NodePools` | `Context` | `"node_pools"` | — |
| `Namespaces` | `Context` | `"namespaces"` | — |
| `Quotas` | `Context` | `"quotas"` | — |
| `Recommendations` | `Context` | `"recommendations"` | — |
| `ScalingPolicies` | `Context` | `"scaling_policy"` | — |
| `Plugins` | `Context` | `"plugins"` | — |
| `Variables` | `Context` | `"vars"` | — |
| `Volumes` | `Context` | `"volumes"` | — |
| `HostVolumes` | `Context` | `"host_volumes"` | — |
| `Groups` | `Context` | `"groups"` | — |
| `Services` | `Context` | `"services"` | — |
| `Tasks` | `Context` | `"tasks"` | — |
| `Images` | `Context` | `"images"` | — |
| `Commands` | `Context` | `"commands"` | — |
| `Classes` | `Context` | `"classes"` | — |
| `All` | `Context` | `"all"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Copy` | `s *SearchConfig` | `` | `*SearchConfig` | [L67](file:///d:/claude/nomad/nomad/structs/search.go#L67) |

## 5. 核心方法详解

### Copy()

**签名**：`func (s *SearchConfig) Copy() *SearchConfig`

**位置**：[L67](file:///d:/claude/nomad/nomad/structs/search.go#L67)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*SearchConfig` | — |

## 6. 依赖关系

该文件无导入包。

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

