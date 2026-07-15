# structs.go 代码说明文档

> 文件路径：[scheduler/structs/structs.go](file:///d:/claude/nomad/scheduler/structs/structs.go)
> 总行数：248 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **调度器包**（`scheduler/`），实现 Nomad 的调度逻辑和算法。

## 2. 类型定义

### PortCollisionEvent

**定义位置**：[L20](file:///d:/claude/nomad/scheduler/structs/structs.go#L20)

**中文说明**：PortCollisionEvent 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type PortCollisionEvent struct {
	Reason string
	Node *structs.Node
	Allocations []*structs.Allocation
	NetIndex *structs.NetworkIndex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Reason` | `string` | 字符串 |
| `Node` | `*structs.Node` | — |
| `Allocations` | `[]*structs.Allocation` | 列表 |
| `NetIndex` | `*structs.NetworkIndex` | — |

**关联方法**（2 个）：`Copy`, `Sanitize`

### PlanBuilder

**定义位置**：[L73](file:///d:/claude/nomad/scheduler/structs/structs.go#L73)

**中文说明**：PlanBuilder 是一个构建器，用于分步构建复杂对象。

**类型**：struct

```go
type PlanBuilder struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `State` | `*state.StateStore` | 状态 |
| `Planner` | `Planner` | 计划器，管理分配方案 |
| `planLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `Plans` | `[]*structs.Plan` | 列表 |
| `Evals` | `[]*structs.Evaluation` | 列表 |
| `CreateEvals` | `[]*structs.Evaluation` | 列表 |
| `ReblockEvals` | `[]*structs.Evaluation` | 列表 |
| `nextIndex` | `uint64` | 索引值（uint64） |
| `nextIndexLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `serversMeetMinimumVersion` | `bool` | 布尔值 |
| `noSubmit` | `bool` | 布尔值 |

**关联方法**（7 个）：`SubmitPlan`, `SetNoSubmit`, `UpdateEval`, `CreateEval`, `ReblockEval`, `ServersMeetMinimumVersion`, `NextIndex`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Copy` | `ev *PortCollisionEvent` | `` | `*PortCollisionEvent` | [L31](file:///d:/claude/nomad/scheduler/structs/structs.go#L31) |
| `Sanitize` | `ev *PortCollisionEvent` | `` | `*PortCollisionEvent` | [L48](file:///d:/claude/nomad/scheduler/structs/structs.go#L48) |
| `NewPlanWithStateAndIndex` | - | `state *state.StateStore, nextIndex uint64, serversMeetMinimumVersion bool` | `*PlanBuilder` | [L66](file:///d:/claude/nomad/scheduler/structs/structs.go#L66) |
| `SubmitPlan` | `p *PlanBuilder` | `plan *structs.Plan` | `*structs.PlanResult, State, error` | [L94](file:///d:/claude/nomad/scheduler/structs/structs.go#L94) |
| `updateCreateTimestamp` | - | `allocations []*structs.Allocation, now int64` | `` | [L176](file:///d:/claude/nomad/scheduler/structs/structs.go#L176) |
| `SetNoSubmit` | `p *PlanBuilder` | `` | `` | [L187](file:///d:/claude/nomad/scheduler/structs/structs.go#L187) |
| `UpdateEval` | `p *PlanBuilder` | `eval *structs.Evaluation` | `error` | [L191](file:///d:/claude/nomad/scheduler/structs/structs.go#L191) |
| `CreateEval` | `p *PlanBuilder` | `eval *structs.Evaluation` | `error` | [L202](file:///d:/claude/nomad/scheduler/structs/structs.go#L202) |
| `ReblockEval` | `p *PlanBuilder` | `eval *structs.Evaluation` | `error` | [L213](file:///d:/claude/nomad/scheduler/structs/structs.go#L213) |
| `ServersMeetMinimumVersion` | `p *PlanBuilder` | `_ *version.Version, _ bool` | `bool` | [L236](file:///d:/claude/nomad/scheduler/structs/structs.go#L236) |
| `NextIndex` | `p *PlanBuilder` | `` | `uint64` | [L241](file:///d:/claude/nomad/scheduler/structs/structs.go#L241) |

## 5. 核心方法详解

### Copy()

**签名**：`func (ev *PortCollisionEvent) Copy() *PortCollisionEvent`

**位置**：[L31](file:///d:/claude/nomad/scheduler/structs/structs.go#L31)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*PortCollisionEvent` | — |

### NewPlanWithStateAndIndex()

**签名**：`func NewPlanWithStateAndIndex(state *state.StateStore, nextIndex uint64, serversMeetMinimumVersion bool) *PlanBuilder`

**位置**：[L66](file:///d:/claude/nomad/scheduler/structs/structs.go#L66)

**中文说明**：创建并返回一个新的 PlanWithStateAndIndex 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `state` | `*state.StateStore` | 状态 |
| `nextIndex` | `uint64` | 索引值（uint64） |
| `serversMeetMinimumVersion` | `bool` | 布尔值 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*PlanBuilder` | — |

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

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [const.go](file:///d:/claude/nomad/scheduler/structs/const.go) | 同目录源文件 |
| [doc.go](file:///d:/claude/nomad/scheduler/structs/doc.go) | 同目录源文件 |
| [interfaces.go](file:///d:/claude/nomad/scheduler/structs/interfaces.go) | 同目录源文件 |

