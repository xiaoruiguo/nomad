# evaluations.go 代码说明文档

> 文件路径：[api/evaluations.go](file:///d:/claude/nomad/api/evaluations.go)
> 总行数：185 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `evaluations.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Evaluations

**定义位置**：[L12](file:///d:/claude/nomad/api/evaluations.go#L12)

**中文说明**：Evaluations 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型**：struct

```go
type Evaluations struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（7 个）：`List`, `PrefixList`, `Count`, `Info`, `Delete`, `DeleteOpts`, `Allocations`

### Evaluation

**定义位置**：[L99](file:///d:/claude/nomad/api/evaluations.go#L99)

**中文说明**：Evaluation 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型**：struct

```go
type Evaluation struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Priority` | `int` | — |
| `Type` | `string` | 类型 |
| `TriggeredBy` | `string` | 字符串 |
| `Namespace` | `string` | 命名空间 |
| `JobID` | `string` | 字符串 |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `NodeID` | `string` | 字符串 |
| `NodeModifyIndex` | `uint64` | 索引值（uint64） |
| `DeploymentID` | `string` | 字符串 |
| `Status` | `string` | 状态 |
| `StatusDescription` | `string` | 字符串 |
| `Wait` | `time.Duration` | 时间间隔 |
| `WaitUntil` | `time.Time` | 时间点 |
| `NextEval` | `string` | 字符串 |
| `PreviousEval` | `string` | 字符串 |
| `BlockedEval` | `string` | 字符串 |
| `RelatedEvals` | `[]*EvaluationStub` | 列表 |
| `FailedTGAllocs` | `map[string]*AllocationMetric` | 映射表 |
| `PlanAnnotations` | `*PlanAnnotations` | — |
| `ClassEligibility` | `map[string]bool` | 映射表 |
| `EscapedComputedClass` | `bool` | 布尔值 |
| `QuotaLimitReached` | `string` | 字符串 |
| `AnnotatePlan` | `bool` | 布尔值 |
| `QueuedAllocations` | `map[string]int` | 映射表 |
| `SnapshotIndex` | `uint64` | 快照索引，标记调度器首次调用的位置 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyTime` | `int64` | — |

### EvaluationStub

**定义位置**：[L134](file:///d:/claude/nomad/api/evaluations.go#L134)

**中文说明**：EvaluationStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type EvaluationStub struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Priority` | `int` | — |
| `Type` | `string` | 类型 |
| `TriggeredBy` | `string` | 字符串 |
| `Namespace` | `string` | 命名空间 |
| `JobID` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `DeploymentID` | `string` | 字符串 |
| `Status` | `string` | 状态 |
| `StatusDescription` | `string` | 字符串 |
| `WaitUntil` | `time.Time` | 时间点 |
| `NextEval` | `string` | 字符串 |
| `PreviousEval` | `string` | 字符串 |
| `BlockedEval` | `string` | 字符串 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyTime` | `int64` | — |

### EvalDeleteRequest

**定义位置**：[L155](file:///d:/claude/nomad/api/evaluations.go#L155)

**中文说明**：EvalDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type EvalDeleteRequest struct {
	EvalIDs []string
	Filter string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalIDs` | `[]string` | 列表 |
| `Filter` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### EvalDeleteResponse

**定义位置**：[L161](file:///d:/claude/nomad/api/evaluations.go#L161)

**中文说明**：EvalDeleteResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type EvalDeleteResponse struct {
	Count int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Count` | `int` | 计数 |

### EvalCountResponse

**定义位置**：[L165](file:///d:/claude/nomad/api/evaluations.go#L165)

**中文说明**：EvalCountResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type EvalCountResponse struct {
	Count int
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Count` | `int` | 计数 |
| `QueryMeta` | `QueryMeta` | — |

### EvalIndexSort

**定义位置**：[L172](file:///d:/claude/nomad/api/evaluations.go#L172)

**中文说明**：EvalIndexSort 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型定义**：`type EvalIndexSort []*Evaluation`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `EvalStatusBlocked` | `—` | `"blocked"` | — |
| `EvalStatusPending` | `—` | `"pending"` | — |
| `EvalStatusComplete` | `—` | `"complete"` | — |
| `EvalStatusFailed` | `—` | `"failed"` | — |
| `EvalStatusCancelled` | `—` | `"canceled"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Evaluations` | `c *Client` | `` | `*Evaluations` | [L17](file:///d:/claude/nomad/api/evaluations.go#L17) |
| `List` | `e *Evaluations` | `q *QueryOptions` | `[]*Evaluation, *QueryMeta, error` | [L22](file:///d:/claude/nomad/api/evaluations.go#L22) |
| `PrefixList` | `e *Evaluations` | `prefix string` | `[]*Evaluation, *QueryMeta, error` | [L32](file:///d:/claude/nomad/api/evaluations.go#L32) |
| `Count` | `e *Evaluations` | `q *QueryOptions` | `*EvalCountResponse, *QueryMeta, error` | [L37](file:///d:/claude/nomad/api/evaluations.go#L37) |
| `Info` | `e *Evaluations` | `evalID string, q *QueryOptions` | `*Evaluation, *QueryMeta, error` | [L47](file:///d:/claude/nomad/api/evaluations.go#L47) |
| `Delete` | `e *Evaluations` | `evalIDs []string, w *WriteOptions` | `*WriteMeta, error` | [L57](file:///d:/claude/nomad/api/evaluations.go#L57) |
| `DeleteOpts` | `e *Evaluations` | `req *EvalDeleteRequest, w *WriteOptions` | `*EvalDeleteResponse, *WriteMeta, error` | [L69](file:///d:/claude/nomad/api/evaluations.go#L69) |
| `Allocations` | `e *Evaluations` | `evalID string, q *QueryOptions` | `[]*AllocationListStub, *QueryMeta, error` | [L80](file:///d:/claude/nomad/api/evaluations.go#L80) |
| `Len` | `e *EvalIndexSort` | `` | `int` | [L174](file:///d:/claude/nomad/api/evaluations.go#L174) |
| `Less` | `e *EvalIndexSort` | `i int, j int` | `bool` | [L178](file:///d:/claude/nomad/api/evaluations.go#L178) |
| `Swap` | `e *EvalIndexSort` | `i int, j int` | `` | [L182](file:///d:/claude/nomad/api/evaluations.go#L182) |

## 5. 核心方法详解

### List()

**签名**：`func (e *Evaluations) List(q *QueryOptions) []*Evaluation, *QueryMeta, error`

**位置**：[L22](file:///d:/claude/nomad/api/evaluations.go#L22)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*Evaluation` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Info()

**签名**：`func (e *Evaluations) Info(evalID string, q *QueryOptions) *Evaluation, *QueryMeta, error`

**位置**：[L47](file:///d:/claude/nomad/api/evaluations.go#L47)

**中文说明**：返回对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `evalID` | `string` | 字符串 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Evaluation` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (e *Evaluations) Delete(evalIDs []string, w *WriteOptions) *WriteMeta, error`

**位置**：[L57](file:///d:/claude/nomad/api/evaluations.go#L57)

**中文说明**：删除指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `evalIDs` | `[]string` | 列表 |
| `w` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `sort` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [evaluations_test.go](file:///d:/claude/nomad/api/evaluations_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

