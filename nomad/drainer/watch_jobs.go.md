# watch_jobs.go 代码说明文档

> 文件路径：[nomad/drainer/watch_jobs.go](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go)
> 总行数：509 行
> 所属包：`drainer`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `drainer` 包，定义接口类型、定义结构体类型、包含 15 个方法/函数。

## 2. 类型定义

### DrainRequest

**定义位置**：[L20](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L20)

**中文说明**：DrainRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DrainRequest struct {
	Allocs []*structs.Allocation
	Resp *structs.BatchFuture
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Allocs` | `[]*structs.Allocation` | 列表 |
| `Resp` | `*structs.BatchFuture` | — |

### DrainingJobWatcher

**定义位置**：[L33](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L33)

**中文说明**：DrainingJobWatcher 是一个监视器，持续监控特定资源的状态变化并触发相应处理。

**类型**：interface

```go
type DrainingJobWatcher interface {
	RegisterJobs func(...)
	Drain func(...)
	Migrated func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `RegisterJobs` | `func(...)` | 注册Jobs。 |
| `Drain` | `func(...)` | — |
| `Migrated` | `func(...)` | — |

### drainingJobWatcher

**定义位置**：[L47](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L47)

**中文说明**：drainingJobWatcher 是一个监视器，持续监控特定资源的状态变化并触发相应处理。

**类型**：struct

```go
type drainingJobWatcher struct {
	ctx context.Context
	logger log.Logger
	state *state.StateStore
	limiter *rate.Limiter
	jobs map[structs.NamespacedID]struct{...}
	queryCtx context.Context
	queryCancel context.CancelFunc
	drainCh chan *DrainRequest
	migratedCh chan []*structs.Allocation
	l sync.RWMutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `logger` | `log.Logger` | 日志记录器 |
| `state` | `*state.StateStore` | 状态 |
| `limiter` | `*rate.Limiter` | — |
| `jobs` | `map[structs.NamespacedID]struct{...}` | 映射表 |
| `queryCtx` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `queryCancel` | `context.CancelFunc` | 取消函数，用于取消上下文 |
| `drainCh` | `chan *DrainRequest` | 通道 |
| `migratedCh` | `chan []*structs.Allocation` | 通道 |
| `l` | `sync.RWMutex` | 读写锁，保护并发访问 |

**关联方法**（9 个）：`RegisterJobs`, `Drain`, `Migrated`, `deregisterJob`, `watch`, `getJobAllocs`, `getJobAllocsImpl`, `drainingJobs`, `getQueryCtx`

### jobResult

**定义位置**：[L285](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L285)

**中文说明**：jobResult 是一个结果结构体，封装操作执行的结果。

**类型**：struct

```go
type jobResult struct {
	drain []*structs.Allocation
	migrated []*structs.Allocation
	done bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `drain` | `[]*structs.Allocation` | 列表 |
| `migrated` | `[]*structs.Allocation` | 列表 |
| `done` | `bool` | 布尔值 |

**关联方法**（1 个）：`String`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewDrainRequest` | - | `allocs []*structs.Allocation` | `*DrainRequest` | [L25](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L25) |
| `NewDrainingJobWatcher` | - | `ctx context.Context, limiter *rate.Limiter, state *state.StateStore, logger l...` | `*drainingJobWatcher` | [L73](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L73) |
| `RegisterJobs` | `w *drainingJobWatcher` | `jobs []structs.NamespacedID` | `` | [L96](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L96) |
| `Drain` | `w *drainingJobWatcher` | `` | `<-chan *DrainRequest` | [L121](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L121) |
| `Migrated` | `w *drainingJobWatcher` | `` | `<-chan []*structs.Allocation` | [L127](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L127) |
| `deregisterJob` | `w *drainingJobWatcher` | `jobID string, namespace string` | `` | [L132](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L132) |
| `watch` | `w *drainingJobWatcher` | `` | `` | [L144](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L144) |
| `newJobResult` | - | `` | `*jobResult` | [L298](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L298) |
| `String` | `r *jobResult` | `` | `string` | [L304](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L304) |
| `handleJob` | - | `snap *state.StateSnapshot, job *structs.Job, allocs []*structs.Allocation, la...` | `*jobResult, error` | [L309](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L309) |
| `handleTaskGroup` | - | `snap *state.StateSnapshot, batch bool, tg *structs.TaskGroup, allocs []*struc...` | `error` | [L345](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L345) |
| `getJobAllocs` | `w *drainingJobWatcher` | `ctx context.Context, minIndex uint64` | `map[structs.NamespacedID][]*structs.Allocation, uint64, e...` | [L429](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L429) |
| `getJobAllocsImpl` | `w *drainingJobWatcher` | `ws memdb.WatchSet, state *state.StateStore` | `interface{}, uint64, error` | [L446](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L446) |
| `drainingJobs` | `w *drainingJobWatcher` | `` | `map[structs.NamespacedID]struct{...}` | [L486](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L486) |
| `getQueryCtx` | `w *drainingJobWatcher` | `` | `context.Context` | [L504](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L504) |

## 5. 核心方法详解

### NewDrainRequest()

**签名**：`func NewDrainRequest(allocs []*structs.Allocation) *DrainRequest`

**位置**：[L25](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L25)

**中文说明**：创建并返回一个新的 DrainRequest 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `allocs` | `[]*structs.Allocation` | 列表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DrainRequest` | — |

### NewDrainingJobWatcher()

**签名**：`func NewDrainingJobWatcher(ctx context.Context, limiter *rate.Limiter, state *state.StateStore, logger log.Logger) *drainingJobWatcher`

**位置**：[L73](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L73)

**中文说明**：创建并返回一个新的 DrainingJobWatcher 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `limiter` | `*rate.Limiter` | — |
| `state` | `*state.StateStore` | 状态 |
| `logger` | `log.Logger` | 日志记录器 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*drainingJobWatcher` | — |

### Drain()

**签名**：`func (w *drainingJobWatcher) Drain() <-chan *DrainRequest`

**位置**：[L121](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L121)

**返回值**：

| 类型 | 说明 |
|------|------|
| `<-chan *DrainRequest` | 通道 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `golang.org/x/time/rate` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [watch_jobs_test.go](file:///d:/claude/nomad/nomad/drainer/watch_jobs_test.go) | 对应测试文件 |
| [drain_heap.go](file:///d:/claude/nomad/nomad/drainer/drain_heap.go) | 同目录源文件 |
| [drain_testing.go](file:///d:/claude/nomad/nomad/drainer/drain_testing.go) | 同目录源文件 |
| [drainer.go](file:///d:/claude/nomad/nomad/drainer/drainer.go) | 同目录源文件 |
| [drainer_util.go](file:///d:/claude/nomad/nomad/drainer/drainer_util.go) | 同目录源文件 |
| [draining_node.go](file:///d:/claude/nomad/nomad/drainer/draining_node.go) | 同目录源文件 |

