# tracker.go 代码说明文档

> 文件路径：[client/allochealth/tracker.go](file:///d:/claude/nomad/client/allochealth/tracker.go)
> 总行数：774 行
> 所属包：`allochealth`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **客户端子包**（`client/`），实现 Nomad 客户端的功能组件。

## 2. 类型定义

### Tracker

**定义位置**：[L35](file:///d:/claude/nomad/client/allochealth/tracker.go#L35)

**中文说明**：Tracker 是一个跟踪器，记录和跟踪特定对象的状态信息。

**类型**：struct

```go
type Tracker struct {
	ctx context.Context
	cancelFn context.CancelFunc
	alloc *structs.Allocation
	tg *structs.TaskGroup
	minHealthyTime time.Duration
	checkLookupInterval time.Duration
	useChecks bool
	consulCheckCount int
	nomadCheckCount int
	allocUpdates *cstructs.AllocListener
	consulClient serviceregistration.Handler
	checkStore checkstore.Shim
	healthy chan bool
	allocStopped chan struct{...}
	lifecycleTasks map[string]string
	lock sync.Mutex
	tasksHealthy bool
	allocFailed bool
	checksHealthy bool
	taskHealth map[string]*taskHealthState
	taskEnvs map[string]*taskenv.TaskEnv
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `cancelFn` | `context.CancelFunc` | 取消函数 |
| `alloc` | `*structs.Allocation` | — |
| `tg` | `*structs.TaskGroup` | — |
| `minHealthyTime` | `time.Duration` | 时间间隔 |
| `checkLookupInterval` | `time.Duration` | 时间间隔 |
| `useChecks` | `bool` | 布尔值 |
| `consulCheckCount` | `int` | — |
| `nomadCheckCount` | `int` | — |
| `allocUpdates` | `*cstructs.AllocListener` | — |
| `consulClient` | `serviceregistration.Handler` | — |
| `checkStore` | `checkstore.Shim` | — |
| `healthy` | `chan bool` | 是否健康 |
| `allocStopped` | `chan struct{...}` | 信号通道 |
| `lifecycleTasks` | `map[string]string` | 映射表 |
| `lock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `tasksHealthy` | `bool` | 布尔值 |
| `allocFailed` | `bool` | 布尔值 |
| `checksHealthy` | `bool` | 布尔值 |
| `taskHealth` | `map[string]*taskHealthState` | 映射表 |
| `taskEnvs` | `map[string]*taskenv.TaskEnv` | 映射表 |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（10 个）：`Start`, `HealthyCh`, `AllocStoppedCh`, `TaskEvents`, `setTaskHealth`, `setCheckHealth`, `markAllocStopped`, `watchTaskEvents`, `watchConsulEvents`, `watchNomadEvents`

### healthyFuture

**定义位置**：[L412](file:///d:/claude/nomad/client/allochealth/tracker.go#L412)

**中文说明**：healthyFuture 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type healthyFuture struct {
	timer *time.Timer
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `timer` | `*time.Timer` | 时间点 |

**关联方法**（3 个）：`disable`, `wait`, `C`

### taskHealthState

**定义位置**：[L705](file:///d:/claude/nomad/client/allochealth/tracker.go#L705)

**中文说明**：taskHealthState 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type taskHealthState struct {
	task *structs.Task
	state *structs.TaskState
	taskRegistrations *serviceregistration.ServiceRegistrations
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `task` | `*structs.Task` | — |
| `state` | `*structs.TaskState` | 状态 |
| `taskRegistrations` | `*serviceregistration.ServiceRegistrations` | — |

**关联方法**（1 个）：`event`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `AllocHealthEventSource` | `—` | `"Alloc Unhealthy"` | — |
| `checkLookupInterval` | `—` | `500 * time.Millisecond` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewTracker` | - | `parentCtx context.Context, logger hclog.Logger, alloc *structs.Allocation, al...` | `*Tracker` | [L117](file:///d:/claude/nomad/client/allochealth/tracker.go#L117) |
| `countChecks` | - | `services []*structs.Service` | `consul int, nomad int` | [L173](file:///d:/claude/nomad/client/allochealth/tracker.go#L173) |
| `Start` | `t *Tracker` | `` | `` | [L186](file:///d:/claude/nomad/client/allochealth/tracker.go#L186) |
| `HealthyCh` | `t *Tracker` | `` | `<-chan bool` | [L201](file:///d:/claude/nomad/client/allochealth/tracker.go#L201) |
| `AllocStoppedCh` | `t *Tracker` | `` | `<-chan struct{...}` | [L207](file:///d:/claude/nomad/client/allochealth/tracker.go#L207) |
| `TaskEvents` | `t *Tracker` | `` | `map[string]*structs.TaskEvent` | [L214](file:///d:/claude/nomad/client/allochealth/tracker.go#L214) |
| `setTaskHealth` | `t *Tracker` | `healthy bool, terminal bool` | `` | [L239](file:///d:/claude/nomad/client/allochealth/tracker.go#L239) |
| `setCheckHealth` | `t *Tracker` | `healthy bool` | `bool` | [L281](file:///d:/claude/nomad/client/allochealth/tracker.go#L281) |
| `markAllocStopped` | `t *Tracker` | `` | `` | [L306](file:///d:/claude/nomad/client/allochealth/tracker.go#L306) |
| `watchTaskEvents` | `t *Tracker` | `` | `` | [L313](file:///d:/claude/nomad/client/allochealth/tracker.go#L313) |
| `newHealthyFuture` | - | `` | `*healthyFuture` | [L418](file:///d:/claude/nomad/client/allochealth/tracker.go#L418) |
| `disable` | `h *healthyFuture` | `` | `` | [L426](file:///d:/claude/nomad/client/allochealth/tracker.go#L426) |
| `wait` | `h *healthyFuture` | `dur time.Duration` | `` | [L438](file:///d:/claude/nomad/client/allochealth/tracker.go#L438) |
| `C` | `h *healthyFuture` | `` | `<-chan time.Time` | [L446](file:///d:/claude/nomad/client/allochealth/tracker.go#L446) |
| `watchConsulEvents` | `t *Tracker` | `` | `` | [L456](file:///d:/claude/nomad/client/allochealth/tracker.go#L456) |
| `evaluateConsulChecks` | - | `services []*structs.Service, registrations *serviceregistration.AllocRegistra...` | `bool` | [L559](file:///d:/claude/nomad/client/allochealth/tracker.go#L559) |
| `watchNomadEvents` | `t *Tracker` | `` | `` | [L628](file:///d:/claude/nomad/client/allochealth/tracker.go#L628) |
| `event` | `t *taskHealthState` | `deadline time.Time, healthyDeadline time.Duration, minHealthyTime time.Durati...` | `string, bool` | [L714](file:///d:/claude/nomad/client/allochealth/tracker.go#L714) |

## 5. 核心方法详解

### NewTracker()

**签名**：`func NewTracker(parentCtx context.Context, logger hclog.Logger, alloc *structs.Allocation, allocUpdates *cstructs.AllocListener, allocEnv *taskenv.TaskEnv, consulClient serviceregistration.Handler, checkStore checkstore.Shim, minHealthyTime time.Duration, useChecks bool) *Tracker`

**位置**：[L117](file:///d:/claude/nomad/client/allochealth/tracker.go#L117)

**中文说明**：创建并返回一个新的 Tracker 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `parentCtx` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `logger` | `hclog.Logger` | 日志记录器 |
| `alloc` | `*structs.Allocation` | — |
| `allocUpdates` | `*cstructs.AllocListener` | — |
| `allocEnv` | `*taskenv.TaskEnv` | — |
| `consulClient` | `serviceregistration.Handler` | — |
| `checkStore` | `checkstore.Shim` | — |
| `minHealthyTime` | `time.Duration` | 时间间隔 |
| `useChecks` | `bool` | 布尔值 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Tracker` | — |

### Start()

**签名**：`func (t *Tracker) Start() `

**位置**：[L186](file:///d:/claude/nomad/client/allochealth/tracker.go#L186)

**中文说明**：启动 启动 监视器.

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/serviceregistration` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration/checks/checkstore` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/consul/api` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [tracker_test.go](file:///d:/claude/nomad/client/allochealth/tracker_test.go) | 对应测试文件 |

