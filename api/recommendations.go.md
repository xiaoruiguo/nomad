# recommendations.go 代码说明文档

> 文件路径：[recommendations.go](file:///d:/claude/nomad/api/recommendations.go)
> 总行数：127 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **推荐（Recommendation）API 客户端**，提供调度推荐的查询和应用操作的客户端方法。

## 2. 类型定义

### Recommendations

**定义位置**：[L7](file:///d:/claude/nomad/api/recommendations.go#L7)

**类型**：struct

```go
	client *Client
```

**关联方法**（5 个）：`List`, `Info`, `Upsert`, `Delete`, `Apply`

### Recommendation

**定义位置**：[L76](file:///d:/claude/nomad/api/recommendations.go#L76)

**类型**：struct

```go
	ID string
	Region string
	Namespace string
	JobID string
	JobVersion uint64
	Group string
	Task string
	Resource string
	Value int
	Current int
	Meta map[string]interface{}
	Stats map[string]float64
	EnforceVersion bool
	SubmitTime int64
	CreateIndex uint64
	ModifyIndex uint64
```

### RecommendationApplyRequest

**定义位置**：[L98](file:///d:/claude/nomad/api/recommendations.go#L98)

**类型**：struct

```go
	Apply []string
	Dismiss []string
	PolicyOverride bool
```

### RecommendationApplyResponse

**定义位置**：[L105](file:///d:/claude/nomad/api/recommendations.go#L105)

**类型**：struct

```go
	UpdatedJobs []*SingleRecommendationApplyResult
	Errors []*SingleRecommendationApplyError
	WriteMeta
```

### SingleRecommendationApplyResult

**定义位置**：[L111](file:///d:/claude/nomad/api/recommendations.go#L111)

**类型**：struct

```go
	Namespace string
	JobID string
	JobModifyIndex uint64
	EvalID string
	EvalCreateIndex uint64
	Warnings string
	Recommendations []string
```

### SingleRecommendationApplyError

**定义位置**：[L121](file:///d:/claude/nomad/api/recommendations.go#L121)

**类型**：struct

```go
	Namespace string
	JobID string
	Recommendations []string
	Error string
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Recommendations` | `c *Client` | - | `*Recommendations` | [L12](file:///d:/claude/nomad/api/recommendations.go#L12) |
| `List` | `r *Recommendations` | `q *QueryOptions` | `[]*Recommendation, *QueryMeta, error` | [L17](file:///d:/claude/nomad/api/recommendations.go#L17) |
| `Info` | `r *Recommendations` | `id string, q *QueryOptions` | `*Recommendation, *QueryMeta, error` | [L27](file:///d:/claude/nomad/api/recommendations.go#L27) |
| `Upsert` | `r *Recommendations` | `rec *Recommendation, q *WriteOptions` | `*Recommendation, *WriteMeta, error` | [L37](file:///d:/claude/nomad/api/recommendations.go#L37) |
| `Delete` | `r *Recommendations` | `ids []string, q *WriteOptions` | `*WriteMeta, error` | [L47](file:///d:/claude/nomad/api/recommendations.go#L47) |
| `Apply` | `r *Recommendations` | `ids []string, policyOverride bool` | `*RecommendationApplyResponse, *WriteMeta, error` | [L60](file:///d:/claude/nomad/api/recommendations.go#L60) |

## 5. 核心方法详解

### List()

**签名**：`func (r *Recommendations) List(q *QueryOptions) []*Recommendation, *QueryMeta, error`

**位置**：[L17](file:///d:/claude/nomad/api/recommendations.go#L17)

### Info()

**签名**：`func (r *Recommendations) Info(id string, q *QueryOptions) *Recommendation, *QueryMeta, error`

**位置**：[L27](file:///d:/claude/nomad/api/recommendations.go#L27)

### Delete()

**签名**：`func (r *Recommendations) Delete(ids []string, q *WriteOptions) *WriteMeta, error`

**位置**：[L47](file:///d:/claude/nomad/api/recommendations.go#L47)

## 6. 依赖关系

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

