# periodic.go 代码说明文档

> 文件路径：[periodic.go](file:///d:/claude/nomad/nomad/periodic.go)
> 总行数：609 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **周期性调度器**，管理周期性作业的定时触发和派发，追踪已派发的作业实例。

## 2. 类型定义

### PeriodicDispatch

**定义位置**：[L26](file:///d:/claude/nomad/nomad/periodic.go#L26)

**类型**：struct

```go
	dispatcher JobEvalDispatcher
	enabled bool
	tracked map[structs.NamespacedID]*structs.Job
	heap *periodicHeap
	updateCh chan struct{...}
	stopFn context.CancelFunc
	logger log.Logger
	l sync.RWMutex
```

**关联方法**（15 个）：`SetEnabled`, `Tracked`, `Add`, `Remove`, `removeLocked`, `ForceEval`, `shouldRun`, `run`, `dispatch`, `nextLaunch`, `createEval`, `deriveJob`, `derivedJobID`, `LaunchTime`, `flush`

### JobEvalDispatcher

**定义位置**：[L41](file:///d:/claude/nomad/nomad/periodic.go#L41)

**类型**：interface

```go
	DispatchJob
	RunningChildren
```

### periodicHeap

**定义位置**：[L469](file:///d:/claude/nomad/nomad/periodic.go#L469)

**类型**：struct

```go
	index map[structs.NamespacedID]*periodicJob
	heap periodicHeapImp
```

**关联方法**（7 个）：`Push`, `Pop`, `Peek`, `Contains`, `Update`, `Remove`, `Length`

### periodicJob

**定义位置**：[L474](file:///d:/claude/nomad/nomad/periodic.go#L474)

**类型**：struct

```go
	job *structs.Job
	next time.Time
	index int
```

### periodicHeapImp

**定义位置**：[L567](file:///d:/claude/nomad/nomad/periodic.go#L567)

**类型定义**：`[]*periodicJob`

**关联方法**（5 个）：`Len`, `Less`, `Swap`, `Push`, `Pop`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `DispatchJob` | `s *Server` | `job *structs.Job` | `*structs.Evaluation, error` | [L52](file:///d:/claude/nomad/nomad/periodic.go#L52) |
| `RunningChildren` | `s *Server` | `job *structs.Job` | `bool, error` | [L87](file:///d:/claude/nomad/nomad/periodic.go#L87) |
| `NewPeriodicDispatch` | - | `logger log.Logger, dispatcher JobEvalDispatcher` | `*PeriodicDispatch` | [L140](file:///d:/claude/nomad/nomad/periodic.go#L140) |
| `SetEnabled` | `p *PeriodicDispatch` | `enabled bool` | - | [L153](file:///d:/claude/nomad/nomad/periodic.go#L153) |
| `Tracked` | `p *PeriodicDispatch` | - | `[]*structs.Job` | [L173](file:///d:/claude/nomad/nomad/periodic.go#L173) |
| `Add` | `p *PeriodicDispatch` | `job *structs.Job` | `error` | [L188](file:///d:/claude/nomad/nomad/periodic.go#L188) |
| `Remove` | `p *PeriodicDispatch` | `namespace string, jobID string` | `error` | [L244](file:///d:/claude/nomad/nomad/periodic.go#L244) |
| `removeLocked` | `p *PeriodicDispatch` | `jobID structs.NamespacedID` | `error` | [L255](file:///d:/claude/nomad/nomad/periodic.go#L255) |
| `ForceEval` | `p *PeriodicDispatch` | `namespace string, jobID string` | `*structs.Evaluation, error` | [L283](file:///d:/claude/nomad/nomad/periodic.go#L283) |
| `shouldRun` | `p *PeriodicDispatch` | - | `bool` | [L307](file:///d:/claude/nomad/nomad/periodic.go#L307) |
| `run` | `p *PeriodicDispatch` | `ctx context.Context, updateCh chan struct{...}` | - | [L315](file:///d:/claude/nomad/nomad/periodic.go#L315) |
| `dispatch` | `p *PeriodicDispatch` | `job *structs.Job, launchTime time.Time` | - | [L340](file:///d:/claude/nomad/nomad/periodic.go#L340) |
| `nextLaunch` | `p *PeriodicDispatch` | - | `*structs.Job, time.Time` | [L375](file:///d:/claude/nomad/nomad/periodic.go#L375) |
| `createEval` | `p *PeriodicDispatch` | `periodicJob *structs.Job, time time.Time` | `*structs.Evaluation, error` | [L393](file:///d:/claude/nomad/nomad/periodic.go#L393) |
| `deriveJob` | `p *PeriodicDispatch` | `periodicJob *structs.Job, time time.Time` | `derived *structs.Job, err error` | [L410](file:///d:/claude/nomad/nomad/periodic.go#L410) |
| `derivedJobID` | `p *PeriodicDispatch` | `periodicJob *structs.Job, time time.Time` | `string` | [L440](file:///d:/claude/nomad/nomad/periodic.go#L440) |
| `LaunchTime` | `p *PeriodicDispatch` | `jobID string` | `time.Time, error` | [L446](file:///d:/claude/nomad/nomad/periodic.go#L446) |
| `flush` | `p *PeriodicDispatch` | - | - | [L461](file:///d:/claude/nomad/nomad/periodic.go#L461) |
| `NewPeriodicHeap` | - | - | `*periodicHeap` | [L480](file:///d:/claude/nomad/nomad/periodic.go#L480) |
| `Push` | `p *periodicHeap` | `job *structs.Job, next time.Time` | `error` | [L487](file:///d:/claude/nomad/nomad/periodic.go#L487) |
| `Pop` | `p *periodicHeap` | - | `*periodicJob` | [L502](file:///d:/claude/nomad/nomad/periodic.go#L502) |
| `Peek` | `p *periodicHeap` | - | `*periodicJob` | [L516](file:///d:/claude/nomad/nomad/periodic.go#L516) |
| `Contains` | `p *periodicHeap` | `job *structs.Job` | `bool` | [L524](file:///d:/claude/nomad/nomad/periodic.go#L524) |
| `Update` | `p *periodicHeap` | `job *structs.Job, next time.Time` | `error` | [L533](file:///d:/claude/nomad/nomad/periodic.go#L533) |
| `Remove` | `p *periodicHeap` | `job *structs.Job` | `error` | [L549](file:///d:/claude/nomad/nomad/periodic.go#L549) |
| `Length` | `p *periodicHeap` | - | `int` | [L563](file:///d:/claude/nomad/nomad/periodic.go#L563) |
| `Len` | `h *periodicHeapImp` | - | `int` | [L569](file:///d:/claude/nomad/nomad/periodic.go#L569) |
| `Less` | `h *periodicHeapImp` | `i int, j int` | `bool` | [L571](file:///d:/claude/nomad/nomad/periodic.go#L571) |
| `Swap` | `h *periodicHeapImp` | `i int, j int` | - | [L588](file:///d:/claude/nomad/nomad/periodic.go#L588) |
| `Push` | `h *periodicHeapImp` | `x interface{}` | - | [L594](file:///d:/claude/nomad/nomad/periodic.go#L594) |
| `Pop` | `h *periodicHeapImp` | - | `interface{}` | [L601](file:///d:/claude/nomad/nomad/periodic.go#L601) |

## 5. 核心方法详解

### Update()

**签名**：`func (p *periodicHeap) Update(job *structs.Job, next time.Time) error`

**位置**：[L533](file:///d:/claude/nomad/nomad/periodic.go#L533)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `container/heap` | 标准库 |
| `context` | 标准库 |
| `fmt` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |

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
| [periodic_test.go](file:///d:/claude/nomad/nomad/periodic_test.go) | 对应测试文件 |

