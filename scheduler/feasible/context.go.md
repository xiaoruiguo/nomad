# context.go 代码说明文档

> 文件路径：[feasible/context.go](file:///d:/claude/nomad/scheduler/feasible/context.go)
> 总行数：415 行
> 所属包：`feasible`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **可行性检查子包**（`scheduler/feasible`），实现调度器的可行性检查和评分迭代器栈。包含节点过滤（约束、驱动、设备、网络）、评分（装箱、分散、资源利用率）、抢占、排名等核心调度算法。是调度决策的核心引擎，采用迭代器链模式（Iterator Chain）实现可组合的调度管道。

## 2. 类型定义

### Context

**定义位置**：[L20](file:///d:/claude/nomad/scheduler/feasible/context.go#L20)

**类型**：interface

```go
	State
	Plan
	Logger
	Metrics
	Reset
	ProposedAllocs
	RegexpCache
	VersionConstraintCache
	SemverConstraintCache
	Eligibility
	SendEvent
```

### ConstraintContext

**定义位置**：[L59](file:///d:/claude/nomad/scheduler/feasible/context.go#L59)

**类型**：interface

```go
	Metrics
	RegexpCache
	VersionConstraintCache
	SemverConstraintCache
```

### EvalCache

**定义位置**：[L67](file:///d:/claude/nomad/scheduler/feasible/context.go#L67)

**类型**：struct

```go
	reCache map[string]*regexp.Regexp
	versionCache map[string]VerConstraints
	semverCache map[string]VerConstraints
```

**关联方法**（3 个）：`RegexpCache`, `VersionConstraintCache`, `SemverConstraintCache`

### EvalContext

**定义位置**：[L95](file:///d:/claude/nomad/scheduler/feasible/context.go#L95)

**类型**：struct

```go
	EvalCache
	eventsCh chan interface{}
	state sstructs.State
	plan *structs.Plan
	logger log.Logger
	metrics *structs.AllocMetric
	eligibility *EvalEligibility
```

**关联方法**（9 个）：`State`, `Plan`, `Logger`, `Metrics`, `SetState`, `Reset`, `ProposedAllocs`, `Eligibility`, `SendEvent`

### ComputedClassFeasibility

**定义位置**：[L203](file:///d:/claude/nomad/scheduler/feasible/context.go#L203)

**类型定义**：`byte`

### EvalEligibility

**定义位置**：[L226](file:///d:/claude/nomad/scheduler/feasible/context.go#L226)

**类型**：struct

```go
	job map[string]ComputedClassFeasibility
	jobEscaped bool
	taskGroups map[string]map[string]ComputedClassFeasibility
	tgEscapedConstraints map[string]bool
	quotaReached string
```

**关联方法**（10 个）：`Reset`, `SetJob`, `HasEscaped`, `GetClasses`, `JobStatus`, `SetJobEligibility`, `TaskGroupStatus`, `SetTaskGroupEligibility`, `SetQuotaLimitReached`, `QuotaLimitReached`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `EvalComputedClassUnknown` | `iota` |
| `EvalComputedClassIneligible` | `` |
| `EvalComputedClassEligible` | `` |
| `EvalComputedClassEscaped` | `` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `RegexpCache` | `e *EvalCache` | - | `map[string]*regexp.Regexp` | [L73](file:///d:/claude/nomad/scheduler/feasible/context.go#L73) |
| `VersionConstraintCache` | `e *EvalCache` | - | `map[string]VerConstraints` | [L80](file:///d:/claude/nomad/scheduler/feasible/context.go#L80) |
| `SemverConstraintCache` | `e *EvalCache` | - | `map[string]VerConstraints` | [L87](file:///d:/claude/nomad/scheduler/feasible/context.go#L87) |
| `NewEvalContext` | - | `eventsCh chan interface{}, s sstructs.State, p *structs.Plan, log log.Logger` | `*EvalContext` | [L106](file:///d:/claude/nomad/scheduler/feasible/context.go#L106) |
| `State` | `e *EvalContext` | - | `sstructs.State` | [L117](file:///d:/claude/nomad/scheduler/feasible/context.go#L117) |
| `Plan` | `e *EvalContext` | - | `*structs.Plan` | [L121](file:///d:/claude/nomad/scheduler/feasible/context.go#L121) |
| `Logger` | `e *EvalContext` | - | `log.Logger` | [L125](file:///d:/claude/nomad/scheduler/feasible/context.go#L125) |
| `Metrics` | `e *EvalContext` | - | `*structs.AllocMetric` | [L129](file:///d:/claude/nomad/scheduler/feasible/context.go#L129) |
| `SetState` | `e *EvalContext` | `s sstructs.State` | - | [L133](file:///d:/claude/nomad/scheduler/feasible/context.go#L133) |
| `Reset` | `e *EvalContext` | - | - | [L137](file:///d:/claude/nomad/scheduler/feasible/context.go#L137) |
| `ProposedAllocs` | `e *EvalContext` | `nodeID string` | `[]*structs.Allocation, error` | [L141](file:///d:/claude/nomad/scheduler/feasible/context.go#L141) |
| `Eligibility` | `e *EvalContext` | - | `*EvalEligibility` | [L184](file:///d:/claude/nomad/scheduler/feasible/context.go#L184) |
| `SendEvent` | `e *EvalContext` | `event interface{}` | - | [L192](file:///d:/claude/nomad/scheduler/feasible/context.go#L192) |
| `NewEvalEligibility` | - | - | `*EvalEligibility` | [L247](file:///d:/claude/nomad/scheduler/feasible/context.go#L247) |
| `Reset` | `e *EvalEligibility` | - | - | [L256](file:///d:/claude/nomad/scheduler/feasible/context.go#L256) |
| `SetJob` | `e *EvalEligibility` | `job *structs.Job` | - | [L264](file:///d:/claude/nomad/scheduler/feasible/context.go#L264) |
| `HasEscaped` | `e *EvalEligibility` | - | `bool` | [L281](file:///d:/claude/nomad/scheduler/feasible/context.go#L281) |
| `GetClasses` | `e *EvalEligibility` | - | `map[string]bool` | [L297](file:///d:/claude/nomad/scheduler/feasible/context.go#L297) |
| `JobStatus` | `e *EvalEligibility` | `class string` | `ComputedClassFeasibility` | [L336](file:///d:/claude/nomad/scheduler/feasible/context.go#L336) |
| `SetJobEligibility` | `e *EvalEligibility` | `eligible bool, class string` | - | [L349](file:///d:/claude/nomad/scheduler/feasible/context.go#L349) |
| `TaskGroupStatus` | `e *EvalEligibility` | `tg string, class string` | `ComputedClassFeasibility` | [L358](file:///d:/claude/nomad/scheduler/feasible/context.go#L358) |
| `SetTaskGroupEligibility` | `e *EvalEligibility` | `eligible bool, tg string, class string` | - | [L375](file:///d:/claude/nomad/scheduler/feasible/context.go#L375) |
| `SetQuotaLimitReached` | `e *EvalEligibility` | `quota string` | - | [L392](file:///d:/claude/nomad/scheduler/feasible/context.go#L392) |
| `QuotaLimitReached` | `e *EvalEligibility` | - | `string` | [L397](file:///d:/claude/nomad/scheduler/feasible/context.go#L397) |
| `MockContext` | - | `t testing.TB` | `*state.StateStore, *EvalContext` | [L401](file:///d:/claude/nomad/scheduler/feasible/context.go#L401) |

## 5. 核心方法详解

### NewEvalContext()

**签名**：`func NewEvalContext(eventsCh chan interface{}, s sstructs.State, p *structs.Plan, log log.Logger) *EvalContext`

**位置**：[L106](file:///d:/claude/nomad/scheduler/feasible/context.go#L106)

### Plan()

**签名**：`func (e *EvalContext) Plan() *structs.Plan`

**位置**：[L121](file:///d:/claude/nomad/scheduler/feasible/context.go#L121)

### Reset()

**签名**：`func (e *EvalContext) Reset() `

**位置**：[L137](file:///d:/claude/nomad/scheduler/feasible/context.go#L137)

### NewEvalEligibility()

**签名**：`func NewEvalEligibility() *EvalEligibility`

**位置**：[L247](file:///d:/claude/nomad/scheduler/feasible/context.go#L247)

### Reset()

**签名**：`func (e *EvalEligibility) Reset() `

**位置**：[L256](file:///d:/claude/nomad/scheduler/feasible/context.go#L256)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `regexp` | 标准库 |
| `testing` | 标准库 |
| `github.com/hashicorp/nomad/helper/testlog` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **MemDB 状态访问**：通过 MemDB 事务读取集群状态，支持多版本并发控制（MVCC）
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [context_test.go](file:///d:/claude/nomad/scheduler/feasible/context_test.go) | 对应测试文件 |

