# evaluations.go 代码说明文档

> 文件路径：[evaluations.go](file:///d:/claude/nomad/api/evaluations.go)
> 总行数：185 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **评估（Evaluation）API 客户端**，提供评估查询、列表、计数等操作的客户端方法。

## 2. 类型定义

### Evaluations

**定义位置**：[L12](file:///d:/claude/nomad/api/evaluations.go#L12)

**类型**：struct

```go
	client *Client
```

**关联方法**（7 个）：`List`, `PrefixList`, `Count`, `Info`, `Delete`, `DeleteOpts`, `Allocations`

### Evaluation

**定义位置**：[L99](file:///d:/claude/nomad/api/evaluations.go#L99)

**类型**：struct

```go
	ID string
	Priority int
	Type string
	TriggeredBy string
	Namespace string
	JobID string
	JobModifyIndex uint64
	NodeID string
	NodeModifyIndex uint64
	DeploymentID string
	Status string
	StatusDescription string
	Wait time.Duration
	WaitUntil time.Time
	NextEval string
	PreviousEval string
	BlockedEval string
	RelatedEvals []*EvaluationStub
	FailedTGAllocs map[string]*AllocationMetric
	PlanAnnotations *PlanAnnotations
	ClassEligibility map[string]bool
	EscapedComputedClass bool
	QuotaLimitReached string
	AnnotatePlan bool
	QueuedAllocations map[string]int
	SnapshotIndex uint64
	CreateIndex uint64
	ModifyIndex uint64
	CreateTime int64
	ModifyTime int64
```

### EvaluationStub

**定义位置**：[L134](file:///d:/claude/nomad/api/evaluations.go#L134)

**类型**：struct

```go
	ID string
	Priority int
	Type string
	TriggeredBy string
	Namespace string
	JobID string
	NodeID string
	DeploymentID string
	Status string
	StatusDescription string
	WaitUntil time.Time
	NextEval string
	PreviousEval string
	BlockedEval string
	CreateIndex uint64
	ModifyIndex uint64
	CreateTime int64
	ModifyTime int64
```

### EvalDeleteRequest

**定义位置**：[L155](file:///d:/claude/nomad/api/evaluations.go#L155)

**类型**：struct

```go
	EvalIDs []string
	Filter string
	WriteRequest
```

### EvalDeleteResponse

**定义位置**：[L161](file:///d:/claude/nomad/api/evaluations.go#L161)

**类型**：struct

```go
	Count int
```

### EvalCountResponse

**定义位置**：[L165](file:///d:/claude/nomad/api/evaluations.go#L165)

**类型**：struct

```go
	Count int
	QueryMeta
```

### EvalIndexSort

**定义位置**：[L172](file:///d:/claude/nomad/api/evaluations.go#L172)

**类型定义**：`[]*Evaluation`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `EvalStatusBlocked` | `"blocked"` |
| `EvalStatusPending` | `"pending"` |
| `EvalStatusComplete` | `"complete"` |
| `EvalStatusFailed` | `"failed"` |
| `EvalStatusCancelled` | `"canceled"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Evaluations` | `c *Client` | - | `*Evaluations` | [L17](file:///d:/claude/nomad/api/evaluations.go#L17) |
| `List` | `e *Evaluations` | `q *QueryOptions` | `[]*Evaluation, *QueryMeta, error` | [L22](file:///d:/claude/nomad/api/evaluations.go#L22) |
| `PrefixList` | `e *Evaluations` | `prefix string` | `[]*Evaluation, *QueryMeta, error` | [L32](file:///d:/claude/nomad/api/evaluations.go#L32) |
| `Count` | `e *Evaluations` | `q *QueryOptions` | `*EvalCountResponse, *QueryMeta, error` | [L37](file:///d:/claude/nomad/api/evaluations.go#L37) |
| `Info` | `e *Evaluations` | `evalID string, q *QueryOptions` | `*Evaluation, *QueryMeta, error` | [L47](file:///d:/claude/nomad/api/evaluations.go#L47) |
| `Delete` | `e *Evaluations` | `evalIDs []string, w *WriteOptions` | `*WriteMeta, error` | [L57](file:///d:/claude/nomad/api/evaluations.go#L57) |
| `DeleteOpts` | `e *Evaluations` | `req *EvalDeleteRequest, w *WriteOptions` | `*EvalDeleteResponse, *WriteMeta, error` | [L69](file:///d:/claude/nomad/api/evaluations.go#L69) |
| `Allocations` | `e *Evaluations` | `evalID string, q *QueryOptions` | `[]*AllocationListStub, *QueryMeta, error` | [L80](file:///d:/claude/nomad/api/evaluations.go#L80) |
| `Len` | `e *EvalIndexSort` | - | `int` | [L174](file:///d:/claude/nomad/api/evaluations.go#L174) |
| `Less` | `e *EvalIndexSort` | `i int, j int` | `bool` | [L178](file:///d:/claude/nomad/api/evaluations.go#L178) |
| `Swap` | `e *EvalIndexSort` | `i int, j int` | - | [L182](file:///d:/claude/nomad/api/evaluations.go#L182) |

## 5. 核心方法详解

### Evaluations()

**签名**：`func (c *Client) Evaluations() *Evaluations`

**位置**：[L17](file:///d:/claude/nomad/api/evaluations.go#L17)

### List()

**签名**：`func (e *Evaluations) List(q *QueryOptions) []*Evaluation, *QueryMeta, error`

**位置**：[L22](file:///d:/claude/nomad/api/evaluations.go#L22)

### Info()

**签名**：`func (e *Evaluations) Info(evalID string, q *QueryOptions) *Evaluation, *QueryMeta, error`

**位置**：[L47](file:///d:/claude/nomad/api/evaluations.go#L47)

### Delete()

**签名**：`func (e *Evaluations) Delete(evalIDs []string, w *WriteOptions) *WriteMeta, error`

**位置**：[L57](file:///d:/claude/nomad/api/evaluations.go#L57)

### Allocations()

**签名**：`func (e *Evaluations) Allocations(evalID string, q *QueryOptions) []*AllocationListStub, *QueryMeta, error`

**位置**：[L80](file:///d:/claude/nomad/api/evaluations.go#L80)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `sort` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [evaluations_test.go](file:///d:/claude/nomad/api/evaluations_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

