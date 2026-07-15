# search.go 代码说明文档

> 文件路径：[structs/search.go](file:///d:/claude/nomad/nomad/structs/search.go)
> 总行数：146 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### Context

**定义位置**：[L8](file:///d:/claude/nomad/nomad/structs/search.go#L8)

**类型定义**：`string`

### SearchConfig

**定义位置**：[L40](file:///d:/claude/nomad/nomad/structs/search.go#L40)

**类型**：struct

```go
	FuzzyEnabled bool `hcl:"fuzzy_enabled"`
	LimitQuery int `hcl:"limit_query"`
	LimitResults int `hcl:"limit_results"`
	MinTermLength int `hcl:"min_term_length"`
```

**关联方法**（1 个）：`Copy`

### SearchResponse

**定义位置**：[L78](file:///d:/claude/nomad/nomad/structs/search.go#L78)

**类型**：struct

```go
	Matches map[Context][]string
	Truncations map[Context]bool
	QueryMeta
```

### SearchRequest

**定义位置**：[L92](file:///d:/claude/nomad/nomad/structs/search.go#L92)

**类型**：struct

```go
	Prefix string
	Context Context
	QueryOptions
```

### FuzzyMatch

**定义位置**：[L113](file:///d:/claude/nomad/nomad/structs/search.go#L113)

**类型**：struct

```go
	ID string
	Scope []string `json:",omitempty"`
```

### FuzzySearchResponse

**定义位置**：[L120](file:///d:/claude/nomad/nomad/structs/search.go#L120)

**类型**：struct

```go
	Matches map[Context][]FuzzyMatch
	Truncations map[Context]bool
	QueryMeta
```

### FuzzySearchRequest

**定义位置**：[L134](file:///d:/claude/nomad/nomad/structs/search.go#L134)

**类型**：struct

```go
	Text string
	Context Context
	QueryOptions
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `Allocs` | `"allocs"` |
| `Deployments` | `"deployment"` |
| `Evals` | `"evals"` |
| `Jobs` | `"jobs"` |
| `Nodes` | `"nodes"` |
| `NodePools` | `"node_pools"` |
| `Namespaces` | `"namespaces"` |
| `Quotas` | `"quotas"` |
| `Recommendations` | `"recommendations"` |
| `ScalingPolicies` | `"scaling_policy"` |
| `Plugins` | `"plugins"` |
| `Variables` | `"vars"` |
| `Volumes` | `"volumes"` |
| `HostVolumes` | `"host_volumes"` |
| `Groups` | `"groups"` |
| `Services` | `"services"` |
| `Tasks` | `"tasks"` |
| `Images` | `"images"` |
| `Commands` | `"commands"` |
| `Classes` | `"classes"` |
| `All` | `"all"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Copy` | `s *SearchConfig` | - | `*SearchConfig` | [L67](file:///d:/claude/nomad/nomad/structs/search.go#L67) |

## 5. 核心方法详解

## 6. 依赖关系

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|

