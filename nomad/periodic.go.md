# periodic.go 代码说明文档

> 文件路径：[nomad/periodic.go](file:///d:/claude/nomad/nomad/periodic.go)
> 总行数：609 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad 核心包**（`nomad/`），实现 Server/Client 核心功能，包括 Raft 共识、状态管理、调度系统、RPC 处理等。当前文件 `periodic.go` 提供相关功能实现。

## 2. 类型定义

### PeriodicDispatch

**定义位置**：[L26](file:///d:/claude/nomad/nomad/periodic.go#L26)

**中文说明**：PeriodicDispatch 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type PeriodicDispatch struct {
	dispatcher JobEvalDispatcher
	enabled bool
	tracked map[structs.NamespacedID]*structs.Job
	heap *periodicHeap
	updateCh chan struct{...}
	stopFn context.CancelFunc
	logger log.Logger
	l sync.RWMutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `dispatcher` | `JobEvalDispatcher` | — |
| `enabled` | `bool` | 是否启用 |
| `tracked` | `map[structs.NamespacedID]*structs.Job` | 映射表 |
| `heap` | `*periodicHeap` | — |
| `updateCh` | `chan struct{...}` | 信号通道 |
| `stopFn` | `context.CancelFunc` | 取消函数，用于取消上下文 |
| `logger` | `log.Logger` | 日志记录器 |
| `l` | `sync.RWMutex` | 读写锁，保护并发访问 |

**关联方法**（15 个）：`SetEnabled`, `Tracked`, `Add`, `Remove`, `removeLocked`, `ForceEval`, `shouldRun`, `run`, `dispatch`, `nextLaunch`, `createEval`, `deriveJob`, `derivedJobID`, `LaunchTime`, `flush`

### JobEvalDispatcher

**定义位置**：[L41](file:///d:/claude/nomad/nomad/periodic.go#L41)

**中文说明**：JobEvalDispatcher 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型**：interface

```go
type JobEvalDispatcher interface {
	DispatchJob func(...)
	RunningChildren func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `DispatchJob` | `func(...)` | — |
| `RunningChildren` | `func(...)` | 运行ningChildren的主循环。 |

### periodicHeap

**定义位置**：[L469](file:///d:/claude/nomad/nomad/periodic.go#L469)

**中文说明**：periodicHeap 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type periodicHeap struct {
	index map[structs.NamespacedID]*periodicJob
	heap periodicHeapImp
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `index` | `map[structs.NamespacedID]*periodicJob` | 索引 |
| `heap` | `periodicHeapImp` | — |

**关联方法**（7 个）：`Push`, `Pop`, `Peek`, `Contains`, `Update`, `Remove`, `Length`

### periodicJob

**定义位置**：[L474](file:///d:/claude/nomad/nomad/periodic.go#L474)

**中文说明**：periodicJob 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type periodicJob struct {
	job *structs.Job
	next time.Time
	index int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `job` | `*structs.Job` | — |
| `next` | `time.Time` | 时间点 |
| `index` | `int` | 索引 |

### periodicHeapImp

**定义位置**：[L567](file:///d:/claude/nomad/nomad/periodic.go#L567)

**类型定义**：`type periodicHeapImp []*periodicJob`

**关联方法**（5 个）：`Len`, `Less`, `Swap`, `Push`, `Pop`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `DispatchJob` | `s *Server` | `job *structs.Job` | `*structs.Evaluation, error` | [L52](file:///d:/claude/nomad/nomad/periodic.go#L52) |
| `RunningChildren` | `s *Server` | `job *structs.Job` | `bool, error` | [L87](file:///d:/claude/nomad/nomad/periodic.go#L87) |
| `NewPeriodicDispatch` | - | `logger log.Logger, dispatcher JobEvalDispatcher` | `*PeriodicDispatch` | [L140](file:///d:/claude/nomad/nomad/periodic.go#L140) |
| `SetEnabled` | `p *PeriodicDispatch` | `enabled bool` | `` | [L153](file:///d:/claude/nomad/nomad/periodic.go#L153) |
| `Tracked` | `p *PeriodicDispatch` | `` | `[]*structs.Job` | [L173](file:///d:/claude/nomad/nomad/periodic.go#L173) |
| `Add` | `p *PeriodicDispatch` | `job *structs.Job` | `error` | [L188](file:///d:/claude/nomad/nomad/periodic.go#L188) |
| `Remove` | `p *PeriodicDispatch` | `namespace string, jobID string` | `error` | [L244](file:///d:/claude/nomad/nomad/periodic.go#L244) |
| `removeLocked` | `p *PeriodicDispatch` | `jobID structs.NamespacedID` | `error` | [L255](file:///d:/claude/nomad/nomad/periodic.go#L255) |
| `ForceEval` | `p *PeriodicDispatch` | `namespace string, jobID string` | `*structs.Evaluation, error` | [L283](file:///d:/claude/nomad/nomad/periodic.go#L283) |
| `shouldRun` | `p *PeriodicDispatch` | `` | `bool` | [L307](file:///d:/claude/nomad/nomad/periodic.go#L307) |
| `run` | `p *PeriodicDispatch` | `ctx context.Context, updateCh <-chan struct{...}` | `` | [L315](file:///d:/claude/nomad/nomad/periodic.go#L315) |
| `dispatch` | `p *PeriodicDispatch` | `job *structs.Job, launchTime time.Time` | `` | [L340](file:///d:/claude/nomad/nomad/periodic.go#L340) |
| `nextLaunch` | `p *PeriodicDispatch` | `` | `*structs.Job, time.Time` | [L375](file:///d:/claude/nomad/nomad/periodic.go#L375) |
| `createEval` | `p *PeriodicDispatch` | `periodicJob *structs.Job, time time.Time` | `*structs.Evaluation, error` | [L393](file:///d:/claude/nomad/nomad/periodic.go#L393) |
| `deriveJob` | `p *PeriodicDispatch` | `periodicJob *structs.Job, time time.Time` | `derived *structs.Job, err error` | [L410](file:///d:/claude/nomad/nomad/periodic.go#L410) |
| `derivedJobID` | `p *PeriodicDispatch` | `periodicJob *structs.Job, time time.Time` | `string` | [L440](file:///d:/claude/nomad/nomad/periodic.go#L440) |
| `LaunchTime` | `p *PeriodicDispatch` | `jobID string` | `time.Time, error` | [L446](file:///d:/claude/nomad/nomad/periodic.go#L446) |
| `flush` | `p *PeriodicDispatch` | `` | `` | [L461](file:///d:/claude/nomad/nomad/periodic.go#L461) |
| `NewPeriodicHeap` | - | `` | `*periodicHeap` | [L480](file:///d:/claude/nomad/nomad/periodic.go#L480) |
| `Push` | `p *periodicHeap` | `job *structs.Job, next time.Time` | `error` | [L487](file:///d:/claude/nomad/nomad/periodic.go#L487) |
| `Pop` | `p *periodicHeap` | `` | `*periodicJob` | [L502](file:///d:/claude/nomad/nomad/periodic.go#L502) |
| `Peek` | `p *periodicHeap` | `` | `*periodicJob` | [L516](file:///d:/claude/nomad/nomad/periodic.go#L516) |
| `Contains` | `p *periodicHeap` | `job *structs.Job` | `bool` | [L524](file:///d:/claude/nomad/nomad/periodic.go#L524) |
| `Update` | `p *periodicHeap` | `job *structs.Job, next time.Time` | `error` | [L533](file:///d:/claude/nomad/nomad/periodic.go#L533) |
| `Remove` | `p *periodicHeap` | `job *structs.Job` | `error` | [L549](file:///d:/claude/nomad/nomad/periodic.go#L549) |
| `Length` | `p *periodicHeap` | `` | `int` | [L563](file:///d:/claude/nomad/nomad/periodic.go#L563) |
| `Len` | `h *periodicHeapImp` | `` | `int` | [L569](file:///d:/claude/nomad/nomad/periodic.go#L569) |
| `Less` | `h *periodicHeapImp` | `i int, j int` | `bool` | [L571](file:///d:/claude/nomad/nomad/periodic.go#L571) |
| `Swap` | `h *periodicHeapImp` | `i int, j int` | `` | [L588](file:///d:/claude/nomad/nomad/periodic.go#L588) |
| `Push` | `h *periodicHeapImp` | `x interface{}` | `` | [L594](file:///d:/claude/nomad/nomad/periodic.go#L594) |
| `Pop` | `h *periodicHeapImp` | `` | `interface{}` | [L601](file:///d:/claude/nomad/nomad/periodic.go#L601) |

## 5. 核心方法详解

### NewPeriodicDispatch()

**签名**：`func NewPeriodicDispatch(logger log.Logger, dispatcher JobEvalDispatcher) *PeriodicDispatch`

**位置**：[L140](file:///d:/claude/nomad/nomad/periodic.go#L140)

**中文说明**：创建并返回一个新的 PeriodicDispatch 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `log.Logger` | 日志记录器 |
| `dispatcher` | `JobEvalDispatcher` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*PeriodicDispatch` | — |

### NewPeriodicHeap()

**签名**：`func NewPeriodicHeap() *periodicHeap`

**位置**：[L480](file:///d:/claude/nomad/nomad/periodic.go#L480)

**中文说明**：创建并返回一个新的 PeriodicHeap 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*periodicHeap` | — |

### Update()

**签名**：`func (p *periodicHeap) Update(job *structs.Job, next time.Time) error`

**位置**：[L533](file:///d:/claude/nomad/nomad/periodic.go#L533)

**中文说明**：更新指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `job` | `*structs.Job` | — |
| `next` | `time.Time` | 时间点 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

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
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [periodic_test.go](file:///d:/claude/nomad/nomad/periodic_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/acl.go) | 同目录源文件 |
| [acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/nomad/alloc_endpoint.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | 同目录源文件 |
| [autopilot_ce.go](file:///d:/claude/nomad/nomad/autopilot_ce.go) | 同目录源文件 |

