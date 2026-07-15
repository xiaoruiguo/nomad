# plan.go 代码说明文档

> 文件路径：[structs/plan.go](file:///d:/claude/nomad/nomad/structs/plan.go)
> 总行数：355 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### Plan

**定义位置**：[L11](file:///d:/claude/nomad/nomad/structs/plan.go#L11)

**类型**：struct

```go
	_struct bool `codec:",omitempty"`
	EvalID string
	EvalToken string
	Priority int
	AllAtOnce bool
	Job *Job
	JobInfo *PlanJobTuple
	NodeUpdate map[string][]*Allocation
	NodeAllocation map[string][]*Allocation
	Annotations *PlanAnnotations
	Deployment *Deployment
	DeploymentUpdates []*DeploymentStatusUpdate
	NodePreemptions map[string][]*Allocation
	SnapshotIndex uint64
```

**关联方法**（8 个）：`GoString`, `AppendStoppedAlloc`, `AppendPreemptedAlloc`, `AppendUnknownAlloc`, `PopUpdate`, `AppendAlloc`, `IsNoOp`, `NormalizeAllocations`

### PlanJobTuple

**定义位置**：[L78](file:///d:/claude/nomad/nomad/structs/plan.go#L78)

**类型**：struct

```go
	Namespace string
	ID string
```

### PlanResult

**定义位置**：[L286](file:///d:/claude/nomad/nomad/structs/plan.go#L286)

**类型**：struct

```go
	NodeUpdate map[string][]*Allocation
	NodeAllocation map[string][]*Allocation
	Deployment *Deployment
	DeploymentUpdates []*DeploymentStatusUpdate
	NodePreemptions map[string][]*Allocation
	RejectedNodes []string
	IneligibleNodes []string
	RefreshIndex uint64
	AllocIndex uint64
```

**关联方法**（2 个）：`IsNoOp`, `FullCommit`

### PlanAnnotations

**定义位置**：[L348](file:///d:/claude/nomad/nomad/structs/plan.go#L348)

**类型**：struct

```go
	DesiredTGUpdates map[string]*DesiredUpdates
	PreemptedAllocs []*AllocListStub
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GoString` | `p *Plan` | - | `string` | [L83](file:///d:/claude/nomad/nomad/structs/plan.go#L83) |
| `AppendStoppedAlloc` | `p *Plan` | `alloc *Allocation, desiredDesc string, clientStatus string, followupEvalID s...` | - | [L151](file:///d:/claude/nomad/nomad/structs/plan.go#L151) |
| `AppendPreemptedAlloc` | `p *Plan` | `alloc *Allocation, preemptingAllocID string` | - | [L191](file:///d:/claude/nomad/nomad/structs/plan.go#L191) |
| `AppendUnknownAlloc` | `p *Plan` | `alloc *Allocation` | - | [L219](file:///d:/claude/nomad/nomad/structs/plan.go#L219) |
| `PopUpdate` | `p *Plan` | `alloc *Allocation` | - | [L227](file:///d:/claude/nomad/nomad/structs/plan.go#L227) |
| `AppendAlloc` | `p *Plan` | `alloc *Allocation, job *Job` | - | [L243](file:///d:/claude/nomad/nomad/structs/plan.go#L243) |
| `IsNoOp` | `p *Plan` | - | `bool` | [L253](file:///d:/claude/nomad/nomad/structs/plan.go#L253) |
| `NormalizeAllocations` | `p *Plan` | - | - | [L262](file:///d:/claude/nomad/nomad/structs/plan.go#L262) |
| `IsNoOp` | `p *PlanResult` | - | `bool` | [L326](file:///d:/claude/nomad/nomad/structs/plan.go#L326) |
| `FullCommit` | `p *PlanResult` | `plan *Plan` | `bool, int, int` | [L335](file:///d:/claude/nomad/nomad/structs/plan.go#L335) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Server 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [plan_test.go](file:///d:/claude/nomad/nomad/structs/plan_test.go) | 对应测试文件 |

