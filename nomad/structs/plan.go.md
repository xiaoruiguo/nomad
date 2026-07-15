# plan.go 代码说明文档

> 文件路径：[nomad/structs/plan.go](file:///d:/claude/nomad/nomad/structs/plan.go)
> 总行数：355 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 10 个方法/函数。

## 2. 类型定义

### Plan

**定义位置**：[L11](file:///d:/claude/nomad/nomad/structs/plan.go#L11)

**中文说明**：Plan 与计划（Plan）相关，计划是调度器提交的分配方案。

**类型**：struct

```go
type Plan struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `_struct` | `bool `codec:",omitempty"`` | 布尔值 |
| `EvalID` | `string` | 字符串 |
| `EvalToken` | `string` | 评估令牌 |
| `Priority` | `int` | — |
| `AllAtOnce` | `bool` | 布尔值 |
| `Job` | `*Job` | — |
| `JobInfo` | `*PlanJobTuple` | — |
| `NodeUpdate` | `map[string][]*Allocation` | 映射表 |
| `NodeAllocation` | `map[string][]*Allocation` | 映射表 |
| `Annotations` | `*PlanAnnotations` | — |
| `Deployment` | `*Deployment` | — |
| `DeploymentUpdates` | `[]*DeploymentStatusUpdate` | 列表 |
| `NodePreemptions` | `map[string][]*Allocation` | 映射表 |
| `SnapshotIndex` | `uint64` | 快照索引，标记调度器首次调用的位置 |

**关联方法**（8 个）：`GoString`, `AppendStoppedAlloc`, `AppendPreemptedAlloc`, `AppendUnknownAlloc`, `PopUpdate`, `AppendAlloc`, `IsNoOp`, `NormalizeAllocations`

### PlanJobTuple

**定义位置**：[L78](file:///d:/claude/nomad/nomad/structs/plan.go#L78)

**中文说明**：PlanJobTuple 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type PlanJobTuple struct {
	Namespace string
	ID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string` | 命名空间 |
| `ID` | `string` | 唯一标识符 |

### PlanResult

**定义位置**：[L286](file:///d:/claude/nomad/nomad/structs/plan.go#L286)

**中文说明**：PlanResult 是一个结果结构体，封装操作执行的结果。

**类型**：struct

```go
type PlanResult struct {
	NodeUpdate map[string][]*Allocation
	NodeAllocation map[string][]*Allocation
	Deployment *Deployment
	DeploymentUpdates []*DeploymentStatusUpdate
	NodePreemptions map[string][]*Allocation
	RejectedNodes []string
	IneligibleNodes []string
	RefreshIndex uint64
	AllocIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeUpdate` | `map[string][]*Allocation` | 映射表 |
| `NodeAllocation` | `map[string][]*Allocation` | 映射表 |
| `Deployment` | `*Deployment` | 部署 is 部署 该 was 已提交的. |
| `DeploymentUpdates` | `[]*DeploymentStatusUpdate` | 列表 |
| `NodePreemptions` | `map[string][]*Allocation` | 映射表 |
| `RejectedNodes` | `[]string` | 列表 |
| `IneligibleNodes` | `[]string` | 列表 |
| `RefreshIndex` | `uint64` | 索引值（uint64） |
| `AllocIndex` | `uint64` | 索引值（uint64） |

**关联方法**（2 个）：`IsNoOp`, `FullCommit`

### PlanAnnotations

**定义位置**：[L348](file:///d:/claude/nomad/nomad/structs/plan.go#L348)

**中文说明**：PlanAnnotations 与计划（Plan）相关，计划是调度器提交的分配方案。

**类型**：struct

```go
type PlanAnnotations struct {
	DesiredTGUpdates map[string]*DesiredUpdates
	PreemptedAllocs []*AllocListStub
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DesiredTGUpdates` | `map[string]*DesiredUpdates` | 映射表 |
| `PreemptedAllocs` | `[]*AllocListStub` | 列表 |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GoString` | `p *Plan` | `` | `string` | [L83](file:///d:/claude/nomad/nomad/structs/plan.go#L83) |
| `AppendStoppedAlloc` | `p *Plan` | `alloc *Allocation, desiredDesc string, clientStatus string, followupEvalID st...` | `` | [L151](file:///d:/claude/nomad/nomad/structs/plan.go#L151) |
| `AppendPreemptedAlloc` | `p *Plan` | `alloc *Allocation, preemptingAllocID string` | `` | [L191](file:///d:/claude/nomad/nomad/structs/plan.go#L191) |
| `AppendUnknownAlloc` | `p *Plan` | `alloc *Allocation` | `` | [L219](file:///d:/claude/nomad/nomad/structs/plan.go#L219) |
| `PopUpdate` | `p *Plan` | `alloc *Allocation` | `` | [L227](file:///d:/claude/nomad/nomad/structs/plan.go#L227) |
| `AppendAlloc` | `p *Plan` | `alloc *Allocation, job *Job` | `` | [L243](file:///d:/claude/nomad/nomad/structs/plan.go#L243) |
| `IsNoOp` | `p *Plan` | `` | `bool` | [L253](file:///d:/claude/nomad/nomad/structs/plan.go#L253) |
| `NormalizeAllocations` | `p *Plan` | `` | `` | [L262](file:///d:/claude/nomad/nomad/structs/plan.go#L262) |
| `IsNoOp` | `p *PlanResult` | `` | `bool` | [L326](file:///d:/claude/nomad/nomad/structs/plan.go#L326) |
| `FullCommit` | `p *PlanResult` | `plan *Plan` | `bool, int, int` | [L335](file:///d:/claude/nomad/nomad/structs/plan.go#L335) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [plan_test.go](file:///d:/claude/nomad/nomad/structs/plan_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

