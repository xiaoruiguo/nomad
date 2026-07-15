# structs.go 代码说明文档

> 文件路径：[structs/structs.go](file:///d:/claude/nomad/scheduler/structs/structs.go)
> 总行数：248 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **调度器结构体子包**（`scheduler/structs`），定义调度器层的核心接口和数据结构：Scheduler 接口、State 状态视图接口、Planner 计划提交接口、Plan 计划构建器等。是调度器与 Nomad Server 状态存储之间的抽象层。

## 2. 类型定义

### PortCollisionEvent

**定义位置**：[L20](file:///d:/claude/nomad/scheduler/structs/structs.go#L20)

**类型**：struct

```go
	Reason string
	Node *structs.Node
	Allocations []*structs.Allocation
	NetIndex *structs.NetworkIndex
```

**关联方法**（2 个）：`Copy`, `Sanitize`

### PlanBuilder

**定义位置**：[L73](file:///d:/claude/nomad/scheduler/structs/structs.go#L73)

**类型**：struct

```go
	State *state.StateStore
	Planner Planner
	planLock sync.Mutex
	Plans []*structs.Plan
	Evals []*structs.Evaluation
	CreateEvals []*structs.Evaluation
	ReblockEvals []*structs.Evaluation
	nextIndex uint64
	nextIndexLock sync.Mutex
	serversMeetMinimumVersion bool
	noSubmit bool
```

**关联方法**（7 个）：`SubmitPlan`, `SetNoSubmit`, `UpdateEval`, `CreateEval`, `ReblockEval`, `ServersMeetMinimumVersion`, `NextIndex`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Copy` | `ev *PortCollisionEvent` | - | `*PortCollisionEvent` | [L31](file:///d:/claude/nomad/scheduler/structs/structs.go#L31) |
| `Sanitize` | `ev *PortCollisionEvent` | - | `*PortCollisionEvent` | [L48](file:///d:/claude/nomad/scheduler/structs/structs.go#L48) |
| `NewPlanWithStateAndIndex` | - | `state *state.StateStore, nextIndex uint64, serversMeetMinimumVersion bool` | `*PlanBuilder` | [L66](file:///d:/claude/nomad/scheduler/structs/structs.go#L66) |
| `SubmitPlan` | `p *PlanBuilder` | `plan *structs.Plan` | `*structs.PlanResult, State, error` | [L94](file:///d:/claude/nomad/scheduler/structs/structs.go#L94) |
| `updateCreateTimestamp` | - | `allocations []*structs.Allocation, now int64` | - | [L176](file:///d:/claude/nomad/scheduler/structs/structs.go#L176) |
| `SetNoSubmit` | `p *PlanBuilder` | - | - | [L187](file:///d:/claude/nomad/scheduler/structs/structs.go#L187) |
| `UpdateEval` | `p *PlanBuilder` | `eval *structs.Evaluation` | `error` | [L191](file:///d:/claude/nomad/scheduler/structs/structs.go#L191) |
| `CreateEval` | `p *PlanBuilder` | `eval *structs.Evaluation` | `error` | [L202](file:///d:/claude/nomad/scheduler/structs/structs.go#L202) |
| `ReblockEval` | `p *PlanBuilder` | `eval *structs.Evaluation` | `error` | [L213](file:///d:/claude/nomad/scheduler/structs/structs.go#L213) |
| `ServersMeetMinimumVersion` | `p *PlanBuilder` | `_ *version.Version, _ bool` | `bool` | [L236](file:///d:/claude/nomad/scheduler/structs/structs.go#L236) |
| `NextIndex` | `p *PlanBuilder` | - | `uint64` | [L241](file:///d:/claude/nomad/scheduler/structs/structs.go#L241) |

## 5. 核心方法详解

### NewPlanWithStateAndIndex()

**签名**：`func NewPlanWithStateAndIndex(state *state.StateStore, nextIndex uint64, serversMeetMinimumVersion bool) *PlanBuilder`

**位置**：[L66](file:///d:/claude/nomad/scheduler/structs/structs.go#L66)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-version` | 第三方库 |

## 7. 设计模式与技术特点

- **MemDB 状态访问**：通过 MemDB 事务读取集群状态，支持多版本并发控制（MVCC）
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|

