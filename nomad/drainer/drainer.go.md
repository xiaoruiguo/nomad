# drainer.go 代码说明文档

> 文件路径：[nomad/drainer/drainer.go](file:///d:/claude/nomad/nomad/drainer/drainer.go)
> 总行数：443 行
> 所属包：`drainer`
> 版权：Copyright IBM Corp. 2015, 2025
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `drainer` 包，定义接口类型、定义结构体类型、包含 12 个方法/函数。

## 2. 类型定义

### RaftApplier

**定义位置**：[L49](file:///d:/claude/nomad/nomad/drainer/drainer.go#L49)

**中文说明**：RaftApplier 与 Raft 共识相关，用于维护集群状态的一致性。

**类型**：interface

```go
type RaftApplier interface {
	AllocUpdateDesiredTransition func(...)
	NodesDrainComplete func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `AllocUpdateDesiredTransition` | `func(...)` | — |
| `NodesDrainComplete` | `func(...)` | — |

### NodeTracker

**定义位置**：[L56](file:///d:/claude/nomad/nomad/drainer/drainer.go#L56)

**中文说明**：NodeTracker 是一个跟踪器，记录和跟踪特定对象的状态信息。

**类型**：interface

```go
type NodeTracker interface {
	TrackedNodes func(...)
	Remove func(...)
	Update func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `TrackedNodes` | `func(...)` | — |
| `Remove` | `func(...)` | — |
| `Update` | `func(...)` | 更新指定的对象。 |

### DrainingJobWatcherFactory

**定义位置**：[L70](file:///d:/claude/nomad/nomad/drainer/drainer.go#L70)

**中文说明**：DrainingJobWatcherFactory 是一个工厂，负责创建对象实例。

**类型定义**：`type DrainingJobWatcherFactory func(...)`

### DrainingNodeWatcherFactory

**定义位置**：[L73](file:///d:/claude/nomad/nomad/drainer/drainer.go#L73)

**中文说明**：DrainingNodeWatcherFactory 是一个工厂，负责创建对象实例。

**类型定义**：`type DrainingNodeWatcherFactory func(...)`

### DrainDeadlineNotifierFactory

**定义位置**：[L76](file:///d:/claude/nomad/nomad/drainer/drainer.go#L76)

**中文说明**：DrainDeadlineNotifierFactory 是一个工厂，负责创建对象实例。

**类型定义**：`type DrainDeadlineNotifierFactory func(...)`

### allocMigrateBatcher

**定义位置**：[L96](file:///d:/claude/nomad/nomad/drainer/drainer.go#L96)

**中文说明**：allocMigrateBatcher 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type allocMigrateBatcher struct {
	updates []*structs.Allocation
	updateFuture *structs.BatchFuture
	updateTimer *time.Timer
	batchWindow time.Duration
	sync.Mutex sync.Mutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `updates` | `[]*structs.Allocation` | 列表 |
| `updateFuture` | `*structs.BatchFuture` | updateFuture 用于 等待 用于 待处理的 批处理 更新 到 完成. 此 可能是 nil 如果 无 批处理 is 待处理的. |
| `updateTimer` | `*time.Timer` | 时间点 |
| `batchWindow` | `time.Duration` | 时间间隔 |
| `sync.Mutex` | `sync.Mutex` | 互斥锁，保护并发访问 |

### NodeDrainerConfig

**定义位置**：[L115](file:///d:/claude/nomad/nomad/drainer/drainer.go#L115)

**中文说明**：NodeDrainerConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type NodeDrainerConfig struct {
	Logger log.Logger
	Raft RaftApplier
	JobFactory DrainingJobWatcherFactory
	NodeFactory DrainingNodeWatcherFactory
	DrainDeadlineFactory DrainDeadlineNotifierFactory
	StateQueriesPerSecond float64
	BatchUpdateInterval time.Duration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Logger` | `log.Logger` | 日志记录器 |
| `Raft` | `RaftApplier` | Raft 共识实例 |
| `JobFactory` | `DrainingJobWatcherFactory` | — |
| `NodeFactory` | `DrainingNodeWatcherFactory` | — |
| `DrainDeadlineFactory` | `DrainDeadlineNotifierFactory` | — |
| `StateQueriesPerSecond` | `float64` | — |
| `BatchUpdateInterval` | `time.Duration` | 时间间隔 |

### NodeDrainer

**定义位置**：[L133](file:///d:/claude/nomad/nomad/drainer/drainer.go#L133)

**中文说明**：NodeDrainer 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeDrainer struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `enabled` | `bool` | 是否启用 |
| `logger` | `log.Logger` | 日志记录器 |
| `nodes` | `map[string]*drainingNode` | 映射表 |
| `nodeWatcher` | `DrainingNodeWatcher` | — |
| `nodeFactory` | `DrainingNodeWatcherFactory` | — |
| `jobWatcher` | `DrainingJobWatcher` | — |
| `jobFactory` | `DrainingJobWatcherFactory` | — |
| `deadlineNotifier` | `DrainDeadlineNotifier` | — |
| `deadlineNotifierFactory` | `DrainDeadlineNotifierFactory` | — |
| `state` | `*state.StateStore` | 状态 |
| `queryLimiter` | `*rate.Limiter` | — |
| `raft` | `RaftApplier` | Raft 共识实例 |
| `batcher` | `allocMigrateBatcher` | — |
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `exitFn` | `context.CancelFunc` | 取消函数，用于取消上下文 |
| `l` | `sync.RWMutex` | 读写锁，保护并发访问 |

**关联方法**（8 个）：`SetEnabled`, `flush`, `run`, `handleDeadlinedNodes`, `handleJobAllocDrain`, `handleMigratedAllocs`, `batchDrainAllocs`, `drainAllocs`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `LimitStateQueriesPerSecond` | `—` | `100.0` | — |
| `BatchUpdateInterval` | `—` | `1 * time.Second` | — |
| `NodeDeadlineCoalesceWindow` | `—` | `5 * time.Second` | — |
| `NodeDrainEventComplete` | `—` | `"Node drain complete"` | — |
| `NodeDrainEventDetailDeadlined` | `—` | `"deadline_reached"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `stateReadErrorDelay` | `—` | `1 * time.Second` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GetDrainingJobWatcher` | - | `ctx context.Context, limiter *rate.Limiter, state *state.StateStore, logger l...` | `DrainingJobWatcher` | [L79](file:///d:/claude/nomad/nomad/drainer/drainer.go#L79) |
| `GetDeadlineNotifier` | - | `ctx context.Context` | `DrainDeadlineNotifier` | [L84](file:///d:/claude/nomad/nomad/drainer/drainer.go#L84) |
| `GetNodeWatcherFactory` | - | `` | `DrainingNodeWatcherFactory` | [L89](file:///d:/claude/nomad/nomad/drainer/drainer.go#L89) |
| `NewNodeDrainer` | - | `c *NodeDrainerConfig` | `*NodeDrainer` | [L176](file:///d:/claude/nomad/nomad/drainer/drainer.go#L176) |
| `SetEnabled` | `n *NodeDrainer` | `enabled bool, state *state.StateStore` | `` | [L192](file:///d:/claude/nomad/nomad/drainer/drainer.go#L192) |
| `flush` | `n *NodeDrainer` | `state *state.StateStore` | `` | [L208](file:///d:/claude/nomad/nomad/drainer/drainer.go#L208) |
| `run` | `n *NodeDrainer` | `ctx context.Context` | `` | [L228](file:///d:/claude/nomad/nomad/drainer/drainer.go#L228) |
| `handleDeadlinedNodes` | `n *NodeDrainer` | `nodes []string` | `` | [L246](file:///d:/claude/nomad/nomad/drainer/drainer.go#L246) |
| `handleJobAllocDrain` | `n *NodeDrainer` | `req *DrainRequest` | `` | [L287](file:///d:/claude/nomad/nomad/drainer/drainer.go#L287) |
| `handleMigratedAllocs` | `n *NodeDrainer` | `allocs []*structs.Allocation` | `` | [L295](file:///d:/claude/nomad/nomad/drainer/drainer.go#L295) |
| `batchDrainAllocs` | `n *NodeDrainer` | `allocs []*structs.Allocation` | `uint64, error` | [L360](file:///d:/claude/nomad/nomad/drainer/drainer.go#L360) |
| `drainAllocs` | `n *NodeDrainer` | `future *structs.BatchFuture, allocs []*structs.Allocation` | `` | [L396](file:///d:/claude/nomad/nomad/drainer/drainer.go#L396) |

## 5. 核心方法详解

### NewNodeDrainer()

**签名**：`func NewNodeDrainer(c *NodeDrainerConfig) *NodeDrainer`

**位置**：[L176](file:///d:/claude/nomad/nomad/drainer/drainer.go#L176)

**中文说明**：创建并返回一个新的 NodeDrainer 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `c` | `*NodeDrainerConfig` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NodeDrainer` | — |

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
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **后台协程**：启动 goroutine 执行后台任务
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [drain_heap.go](file:///d:/claude/nomad/nomad/drainer/drain_heap.go) | 同目录源文件 |
| [drain_testing.go](file:///d:/claude/nomad/nomad/drainer/drain_testing.go) | 同目录源文件 |
| [drainer_util.go](file:///d:/claude/nomad/nomad/drainer/drainer_util.go) | 同目录源文件 |
| [draining_node.go](file:///d:/claude/nomad/nomad/drainer/draining_node.go) | 同目录源文件 |
| [watch_jobs.go](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go) | 同目录源文件 |

