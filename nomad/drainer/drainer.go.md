# drainer.go 代码说明文档

> 文件路径：[drainer/drainer.go](file:///d:/claude/nomad/nomad/drainer/drainer.go)
> 总行数：443 行
> 所属包：`drainer`
> 版权：Copyright IBM Corp. 2015, 2025
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **节点排水子包**（`nomad/drainer`），实现节点排水（drain）逻辑，优雅迁移节点上的分配到其他节点，包括排水堆调度、作业监视、节点监视等。

## 2. 类型定义

### RaftApplier

**定义位置**：[L49](file:///d:/claude/nomad/nomad/drainer/drainer.go#L49)

**类型**：interface

```go
	AllocUpdateDesiredTransition
	NodesDrainComplete
```

### NodeTracker

**定义位置**：[L56](file:///d:/claude/nomad/nomad/drainer/drainer.go#L56)

**类型**：interface

```go
	TrackedNodes
	Remove
	Update
```

### DrainingJobWatcherFactory

**定义位置**：[L70](file:///d:/claude/nomad/nomad/drainer/drainer.go#L70)

**类型定义**：`func(...)`

### DrainingNodeWatcherFactory

**定义位置**：[L73](file:///d:/claude/nomad/nomad/drainer/drainer.go#L73)

**类型定义**：`func(...)`

### DrainDeadlineNotifierFactory

**定义位置**：[L76](file:///d:/claude/nomad/nomad/drainer/drainer.go#L76)

**类型定义**：`func(...)`

### allocMigrateBatcher

**定义位置**：[L96](file:///d:/claude/nomad/nomad/drainer/drainer.go#L96)

**类型**：struct

```go
	updates []*structs.Allocation
	updateFuture *structs.BatchFuture
	updateTimer *time.Timer
	batchWindow time.Duration
	sync.Mutex
```

### NodeDrainerConfig

**定义位置**：[L115](file:///d:/claude/nomad/nomad/drainer/drainer.go#L115)

**类型**：struct

```go
	Logger log.Logger
	Raft RaftApplier
	JobFactory DrainingJobWatcherFactory
	NodeFactory DrainingNodeWatcherFactory
	DrainDeadlineFactory DrainDeadlineNotifierFactory
	StateQueriesPerSecond float64
	BatchUpdateInterval time.Duration
```

### NodeDrainer

**定义位置**：[L133](file:///d:/claude/nomad/nomad/drainer/drainer.go#L133)

**类型**：struct

```go
	enabled bool
	logger log.Logger
	nodes map[string]*drainingNode
	nodeWatcher DrainingNodeWatcher
	nodeFactory DrainingNodeWatcherFactory
	jobWatcher DrainingJobWatcher
	jobFactory DrainingJobWatcherFactory
	deadlineNotifier DrainDeadlineNotifier
	deadlineNotifierFactory DrainDeadlineNotifierFactory
	state *state.StateStore
	queryLimiter *rate.Limiter
	raft RaftApplier
	batcher allocMigrateBatcher
	ctx context.Context
	exitFn context.CancelFunc
	l sync.RWMutex
```

**关联方法**（8 个）：`SetEnabled`, `flush`, `run`, `handleDeadlinedNodes`, `handleJobAllocDrain`, `handleMigratedAllocs`, `batchDrainAllocs`, `drainAllocs`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `LimitStateQueriesPerSecond` | `100.0` |
| `BatchUpdateInterval` | `1 * time.Second` |
| `NodeDeadlineCoalesceWindow` | `5 * time.Second` |
| `NodeDrainEventComplete` | `"Node drain complete"` |
| `NodeDrainEventDetailDeadlined` | `"deadline_reached"` |

### 变量

| 名称 | 值 |
|------|----|
| `stateReadErrorDelay` | `1 * time.Second` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GetDrainingJobWatcher` | - | `ctx context.Context, limiter *rate.Limiter, state *state.StateStore, logger ...` | `DrainingJobWatcher` | [L79](file:///d:/claude/nomad/nomad/drainer/drainer.go#L79) |
| `GetDeadlineNotifier` | - | `ctx context.Context` | `DrainDeadlineNotifier` | [L84](file:///d:/claude/nomad/nomad/drainer/drainer.go#L84) |
| `GetNodeWatcherFactory` | - | - | `DrainingNodeWatcherFactory` | [L89](file:///d:/claude/nomad/nomad/drainer/drainer.go#L89) |
| `NewNodeDrainer` | - | `c *NodeDrainerConfig` | `*NodeDrainer` | [L176](file:///d:/claude/nomad/nomad/drainer/drainer.go#L176) |
| `SetEnabled` | `n *NodeDrainer` | `enabled bool, state *state.StateStore` | - | [L192](file:///d:/claude/nomad/nomad/drainer/drainer.go#L192) |
| `flush` | `n *NodeDrainer` | `state *state.StateStore` | - | [L208](file:///d:/claude/nomad/nomad/drainer/drainer.go#L208) |
| `run` | `n *NodeDrainer` | `ctx context.Context` | - | [L228](file:///d:/claude/nomad/nomad/drainer/drainer.go#L228) |
| `handleDeadlinedNodes` | `n *NodeDrainer` | `nodes []string` | - | [L246](file:///d:/claude/nomad/nomad/drainer/drainer.go#L246) |
| `handleJobAllocDrain` | `n *NodeDrainer` | `req *DrainRequest` | - | [L287](file:///d:/claude/nomad/nomad/drainer/drainer.go#L287) |
| `handleMigratedAllocs` | `n *NodeDrainer` | `allocs []*structs.Allocation` | - | [L295](file:///d:/claude/nomad/nomad/drainer/drainer.go#L295) |
| `batchDrainAllocs` | `n *NodeDrainer` | `allocs []*structs.Allocation` | `uint64, error` | [L360](file:///d:/claude/nomad/nomad/drainer/drainer.go#L360) |
| `drainAllocs` | `n *NodeDrainer` | `future *structs.BatchFuture, allocs []*structs.Allocation` | - | [L396](file:///d:/claude/nomad/nomad/drainer/drainer.go#L396) |

## 5. 核心方法详解

### GetDrainingJobWatcher()

**签名**：`func GetDrainingJobWatcher(ctx context.Context, limiter *rate.Limiter, state *state.StateStore, logger log.Logger) DrainingJobWatcher`

**位置**：[L79](file:///d:/claude/nomad/nomad/drainer/drainer.go#L79)

### GetDeadlineNotifier()

**签名**：`func GetDeadlineNotifier(ctx context.Context) DrainDeadlineNotifier`

**位置**：[L84](file:///d:/claude/nomad/nomad/drainer/drainer.go#L84)

### GetNodeWatcherFactory()

**签名**：`func GetNodeWatcherFactory() DrainingNodeWatcherFactory`

**位置**：[L89](file:///d:/claude/nomad/nomad/drainer/drainer.go#L89)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `golang.org/x/time/rate` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|

