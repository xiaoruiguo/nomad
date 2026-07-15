# watch_jobs.go 代码说明文档

> 文件路径：[drainer/watch_jobs.go](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go)
> 总行数：509 行
> 所属包：`drainer`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **节点排水子包**（`nomad/drainer`），实现节点排水（drain）逻辑，优雅迁移节点上的分配到其他节点，包括排水堆调度、作业监视、节点监视等。

## 2. 类型定义

### DrainRequest

**定义位置**：[L20](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L20)

**类型**：struct

```go
	Allocs []*structs.Allocation
	Resp *structs.BatchFuture
```

### DrainingJobWatcher

**定义位置**：[L33](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L33)

**类型**：interface

```go
	RegisterJobs
	Drain
	Migrated
```

### drainingJobWatcher

**定义位置**：[L47](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L47)

**类型**：struct

```go
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
```

**关联方法**（9 个）：`RegisterJobs`, `Drain`, `Migrated`, `deregisterJob`, `watch`, `getJobAllocs`, `getJobAllocsImpl`, `drainingJobs`, `getQueryCtx`

### jobResult

**定义位置**：[L285](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L285)

**类型**：struct

```go
	drain []*structs.Allocation
	migrated []*structs.Allocation
	done bool
```

**关联方法**（1 个）：`String`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewDrainRequest` | - | `allocs []*structs.Allocation` | `*DrainRequest` | [L25](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L25) |
| `NewDrainingJobWatcher` | - | `ctx context.Context, limiter *rate.Limiter, state *state.StateStore, logger ...` | `*drainingJobWatcher` | [L73](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L73) |
| `RegisterJobs` | `w *drainingJobWatcher` | `jobs []structs.NamespacedID` | - | [L96](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L96) |
| `Drain` | `w *drainingJobWatcher` | - | `chan *DrainRequest` | [L121](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L121) |
| `Migrated` | `w *drainingJobWatcher` | - | `chan []*structs.Allocation` | [L127](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L127) |
| `deregisterJob` | `w *drainingJobWatcher` | `jobID string, namespace string` | - | [L132](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L132) |
| `watch` | `w *drainingJobWatcher` | - | - | [L144](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L144) |
| `newJobResult` | - | - | `*jobResult` | [L298](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L298) |
| `String` | `r *jobResult` | - | `string` | [L304](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L304) |
| `handleJob` | - | `snap *state.StateSnapshot, job *structs.Job, allocs []*structs.Allocation, l...` | `*jobResult, error` | [L309](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L309) |
| `handleTaskGroup` | - | `snap *state.StateSnapshot, batch bool, tg *structs.TaskGroup, allocs []*stru...` | `error` | [L345](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L345) |
| `getJobAllocs` | `w *drainingJobWatcher` | `ctx context.Context, minIndex uint64` | `map[structs.NamespacedID][]*structs.Allocation, uint64, ...` | [L429](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L429) |
| `getJobAllocsImpl` | `w *drainingJobWatcher` | `ws memdb.WatchSet, state *state.StateStore` | `interface{}, uint64, error` | [L446](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L446) |
| `drainingJobs` | `w *drainingJobWatcher` | - | `map[structs.NamespacedID]struct{...}` | [L486](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L486) |
| `getQueryCtx` | `w *drainingJobWatcher` | - | `context.Context` | [L504](file:///d:/claude/nomad/nomad/drainer/watch_jobs.go#L504) |

## 5. 核心方法详解

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
- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [watch_jobs_test.go](file:///d:/claude/nomad/nomad/drainer/watch_jobs_test.go) | 对应测试文件 |

