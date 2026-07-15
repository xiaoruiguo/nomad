# recommendations.go 代码说明文档

> 文件路径：[api/recommendations.go](file:///d:/claude/nomad/api/recommendations.go)
> 总行数：127 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `recommendations.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Recommendations

**定义位置**：[L7](file:///d:/claude/nomad/api/recommendations.go#L7)

**中文说明**：Recommendations 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Recommendations struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（5 个）：`List`, `Info`, `Upsert`, `Delete`, `Apply`

### Recommendation

**定义位置**：[L76](file:///d:/claude/nomad/api/recommendations.go#L76)

**中文说明**：Recommendation 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Recommendation struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Region` | `string` | 区域 |
| `Namespace` | `string` | 命名空间 |
| `JobID` | `string` | 字符串 |
| `JobVersion` | `uint64` | 无符号 64 位整数 |
| `Group` | `string` | 字符串 |
| `Task` | `string` | 字符串 |
| `Resource` | `string` | 字符串 |
| `Value` | `int` | 值 |
| `Current` | `int` | — |
| `Meta` | `map[string]interface{}` | 元数据 |
| `Stats` | `map[string]float64` | 映射表 |
| `EnforceVersion` | `bool` | 布尔值 |
| `SubmitTime` | `int64` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### RecommendationApplyRequest

**定义位置**：[L98](file:///d:/claude/nomad/api/recommendations.go#L98)

**中文说明**：RecommendationApplyRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type RecommendationApplyRequest struct {
	Apply []string
	Dismiss []string
	PolicyOverride bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Apply` | `[]string` | 列表 |
| `Dismiss` | `[]string` | 列表 |
| `PolicyOverride` | `bool` | 布尔值 |

### RecommendationApplyResponse

**定义位置**：[L105](file:///d:/claude/nomad/api/recommendations.go#L105)

**中文说明**：RecommendationApplyResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type RecommendationApplyResponse struct {
	UpdatedJobs []*SingleRecommendationApplyResult
	Errors []*SingleRecommendationApplyError
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `UpdatedJobs` | `[]*SingleRecommendationApplyResult` | 列表 |
| `Errors` | `[]*SingleRecommendationApplyError` | 列表 |
| `WriteMeta` | `WriteMeta` | — |

### SingleRecommendationApplyResult

**定义位置**：[L111](file:///d:/claude/nomad/api/recommendations.go#L111)

**中文说明**：SingleRecommendationApplyResult 是一个结果结构体，封装操作执行的结果。

**类型**：struct

```go
type SingleRecommendationApplyResult struct {
	Namespace string
	JobID string
	JobModifyIndex uint64
	EvalID string
	EvalCreateIndex uint64
	Warnings string
	Recommendations []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string` | 命名空间 |
| `JobID` | `string` | 字符串 |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `EvalID` | `string` | 字符串 |
| `EvalCreateIndex` | `uint64` | 索引值（uint64） |
| `Warnings` | `string` | 字符串 |
| `Recommendations` | `[]string` | 列表 |

### SingleRecommendationApplyError

**定义位置**：[L121](file:///d:/claude/nomad/api/recommendations.go#L121)

**中文说明**：SingleRecommendationApplyError 是一个错误类型，描述特定的错误情况。

**类型**：struct

```go
type SingleRecommendationApplyError struct {
	Namespace string
	JobID string
	Recommendations []string
	Error string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string` | 命名空间 |
| `JobID` | `string` | 字符串 |
| `Recommendations` | `[]string` | 列表 |
| `Error` | `string` | 错误信息 |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Recommendations` | `c *Client` | `` | `*Recommendations` | [L12](file:///d:/claude/nomad/api/recommendations.go#L12) |
| `List` | `r *Recommendations` | `q *QueryOptions` | `[]*Recommendation, *QueryMeta, error` | [L17](file:///d:/claude/nomad/api/recommendations.go#L17) |
| `Info` | `r *Recommendations` | `id string, q *QueryOptions` | `*Recommendation, *QueryMeta, error` | [L27](file:///d:/claude/nomad/api/recommendations.go#L27) |
| `Upsert` | `r *Recommendations` | `rec *Recommendation, q *WriteOptions` | `*Recommendation, *WriteMeta, error` | [L37](file:///d:/claude/nomad/api/recommendations.go#L37) |
| `Delete` | `r *Recommendations` | `ids []string, q *WriteOptions` | `*WriteMeta, error` | [L47](file:///d:/claude/nomad/api/recommendations.go#L47) |
| `Apply` | `r *Recommendations` | `ids []string, policyOverride bool` | `*RecommendationApplyResponse, *WriteMeta, error` | [L60](file:///d:/claude/nomad/api/recommendations.go#L60) |

## 5. 核心方法详解

### List()

**签名**：`func (r *Recommendations) List(q *QueryOptions) []*Recommendation, *QueryMeta, error`

**位置**：[L17](file:///d:/claude/nomad/api/recommendations.go#L17)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*Recommendation` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Info()

**签名**：`func (r *Recommendations) Info(id string, q *QueryOptions) *Recommendation, *QueryMeta, error`

**位置**：[L27](file:///d:/claude/nomad/api/recommendations.go#L27)

**中文说明**：返回对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | `string` | 唯一标识符 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Recommendation` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (r *Recommendations) Delete(ids []string, q *WriteOptions) *WriteMeta, error`

**位置**：[L47](file:///d:/claude/nomad/api/recommendations.go#L47)

**中文说明**：删除指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ids` | `[]string` | 列表 |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Apply()

**签名**：`func (r *Recommendations) Apply(ids []string, policyOverride bool) *RecommendationApplyResponse, *WriteMeta, error`

**位置**：[L60](file:///d:/claude/nomad/api/recommendations.go#L60)

**中文说明**：应用对象的变更。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ids` | `[]string` | 列表 |
| `policyOverride` | `bool` | 布尔值 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*RecommendationApplyResponse` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

## 6. 依赖关系

该文件无导入包。

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

