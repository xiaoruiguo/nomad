# task_runner.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/task_runner.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go)
> 总行数：1703 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### TaskRunner

**定义位置**：[L78](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L78)

**中文说明**：TaskRunner 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskRunner struct {
	allocID string
	taskName string
	taskLeader bool
	taskResources *structs.AllocatedTaskResources
	alloc *structs.Allocation
	allocLock sync.Mutex
	clientConfig *config.Config
	stateUpdater interfaces.TaskStateHandler
	state *structs.TaskState
	localState *state.LocalState
	stateLock sync.RWMutex
	stateDB cstate.StateDB
	restartCh chan struct{...}
	shutdownCtx context.Context
	shutdownCtxCancel context.CancelFunc
	killCtx context.Context
	killCtxCancel context.CancelFunc
	killErr error
	killErrLock sync.Mutex
	shutdownDelayCtx context.Context
	shutdownDelayCancelFn context.CancelFunc
	logger log.Logger
	triggerUpdateCh chan struct{...}
	waitCh chan struct{...}
	driver drivers.DriverPlugin
	driverCapabilities *drivers.Capabilities
	taskSchema hcldec.Spec
	handleLock sync.Mutex
	handle *DriverHandle
	task *structs.Task
	taskLock sync.RWMutex
	taskDir *allocdir.TaskDir
	envBuilder *taskenv.Builder
	restartTracker *restarts.RestartTracker
	runnerHooks []interfaces.TaskHook
	hookResources *hookResources
	allocHookResources *cstructs.AllocHookResources
	consulServiceClient serviceregistration.Handler
	consulProxiesClientFunc consul.SupportedProxiesAPIFunc
	vaultClientFunc vaultclient.VaultClientFunc
	vaultToken string
	vaultTokenLock sync.Mutex
	nomadToken string
	nomadTokenLock sync.Mutex
	baseLabels []metrics.Label
	clientBaseLabels []metrics.Label
	logmonHookConfig *logmonHookConfig
	resourceUsage *cstructs.TaskResourceUsage
	resourceUsageLock sync.Mutex
	deviceStatsReporter cinterfaces.DeviceStatsReporter
	csiManager csimanager.Manager
	devicemanager devicemanager.Manager
	driverManager drivermanager.Manager
	dynamicRegistry dynamicplugins.Registry
	maxEvents int
	serversContactedCh <-chan struct{...}
	startConditionMetCh <-chan struct{...}
	waitOnServers bool
	networkIsolationLock sync.Mutex
	networkIsolationSpec *drivers.NetworkIsolationSpec
	allocNetworkStatusLock sync.Mutex
	allocNetworkStatus *structs.AllocNetworkStatus
	serviceRegWrapper *wrapper.HandlerWrapper
	getter cinterfaces.ArtifactGetter
	wranglers cinterfaces.ProcessWranglers
	widmgr widmgr.IdentityManager
	users dynamic.Pool
	hookStatsHandler interfaces.HookStatsHandler
	pauser *pauseGate
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `allocID` | `string` | 字符串 |
| `taskName` | `string` | 字符串 |
| `taskLeader` | `bool` | 布尔值 |
| `taskResources` | `*structs.AllocatedTaskResources` | — |
| `alloc` | `*structs.Allocation` | — |
| `allocLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `clientConfig` | `*config.Config` | 配置对象 |
| `stateUpdater` | `interfaces.TaskStateHandler` | — |
| `state` | `*structs.TaskState` | 状态 |
| `localState` | `*state.LocalState` | — |
| `stateLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |
| `stateDB` | `cstate.StateDB` | — |
| `restartCh` | `chan struct{...}` | 信号通道 |
| `shutdownCtx` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `shutdownCtxCancel` | `context.CancelFunc` | 取消函数，用于取消上下文 |
| `killCtx` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `killCtxCancel` | `context.CancelFunc` | 取消函数，用于取消上下文 |
| `killErr` | `error` | 错误信息 |
| `killErrLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `shutdownDelayCtx` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `shutdownDelayCancelFn` | `context.CancelFunc` | 取消函数，用于取消上下文 |
| `logger` | `log.Logger` | 日志记录器 |
| `triggerUpdateCh` | `chan struct{...}` | 信号通道 |
| `waitCh` | `chan struct{...}` | 信号通道 |
| `driver` | `drivers.DriverPlugin` | — |
| `driverCapabilities` | `*drivers.Capabilities` | — |
| `taskSchema` | `hcldec.Spec` | — |
| `handleLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `handle` | `*DriverHandle` | 处理 到 运行中的 驱动 |
| `task` | `*structs.Task` | — |
| `taskLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |
| `taskDir` | `*allocdir.TaskDir` | — |
| `envBuilder` | `*taskenv.Builder` | — |
| `restartTracker` | `*restarts.RestartTracker` | — |
| `runnerHooks` | `[]interfaces.TaskHook` | 列表 |
| `hookResources` | `*hookResources` | — |
| `allocHookResources` | `*cstructs.AllocHookResources` | — |
| `consulServiceClient` | `serviceregistration.Handler` | — |
| `consulProxiesClientFunc` | `consul.SupportedProxiesAPIFunc` | — |
| `vaultClientFunc` | `vaultclient.VaultClientFunc` | — |
| `vaultToken` | `string` | 字符串 |
| `vaultTokenLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `nomadToken` | `string` | 字符串 |
| `nomadTokenLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `baseLabels` | `[]metrics.Label` | 列表 |
| `clientBaseLabels` | `[]metrics.Label` | 列表 |
| `logmonHookConfig` | `*logmonHookConfig` | — |
| `resourceUsage` | `*cstructs.TaskResourceUsage` | — |
| `resourceUsageLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `deviceStatsReporter` | `cinterfaces.DeviceStatsReporter` | — |
| `csiManager` | `csimanager.Manager` | — |
| `devicemanager` | `devicemanager.Manager` | — |
| `driverManager` | `drivermanager.Manager` | — |
| `dynamicRegistry` | `dynamicplugins.Registry` | — |
| `maxEvents` | `int` | — |
| `serversContactedCh` | `<-chan struct{...}` | 信号通道 |
| `startConditionMetCh` | `<-chan struct{...}` | 信号通道 |
| `waitOnServers` | `bool` | 布尔值 |
| `networkIsolationLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `networkIsolationSpec` | `*drivers.NetworkIsolationSpec` | — |
| `allocNetworkStatusLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `allocNetworkStatus` | `*structs.AllocNetworkStatus` | — |
| `serviceRegWrapper` | `*wrapper.HandlerWrapper` | — |
| `getter` | `cinterfaces.ArtifactGetter` | — |
| `wranglers` | `cinterfaces.ProcessWranglers` | — |
| `widmgr` | `widmgr.IdentityManager` | — |
| `users` | `dynamic.Pool` | — |
| `hookStatsHandler` | `interfaces.HookStatsHandler` | — |
| `pauser` | `*pauseGate` | — |

**关联方法**（37 个）：`initLabels`, `MarkFailedKill`, `Run`, `shouldShutdown`, `handleTaskExitResult`, `emitExitResultEvent`, `handleUpdates`, `shouldRestart`, `assignCgroup`, `runDriver`, `initDriver`, `handleKill`, `killTask`, `persistLocalState`, `buildTaskConfig`, `Restore`, `restoreHandle`, `UpdateState`, `updateStateImpl`, `EmitEvent`, `AppendEvent`, `appendEvent`, `WaitCh`, `Update`, `SetNetworkIsolation`, `SetNetworkStatus`, `triggerUpdateHooks`, `Shutdown`, `LatestResourceUsage`, `UpdateStats`, `setGaugeForMemory`, `setGaugeForCPU`, `emitStats`, `TaskExecHandler`, `DriverCapabilities`, `shutdownDelayCancel`, `setHookStatsHandler`

### Config

**定义位置**：[L298](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L298)

**中文说明**：Config 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type Config struct {
	Alloc *structs.Allocation
	ClientConfig *config.Config
	Task *structs.Task
	TaskDir *allocdir.TaskDir
	Logger log.Logger
	ClientBaseLabels []metrics.Label
	ConsulServices serviceregistration.Handler
	ConsulProxiesFunc consul.SupportedProxiesAPIFunc
	DynamicRegistry dynamicplugins.Registry
	VaultFunc vaultclient.VaultClientFunc
	StateDB cstate.StateDB
	StateUpdater interfaces.TaskStateHandler
	DeviceStatsReporter cinterfaces.DeviceStatsReporter
	CSIManager csimanager.Manager
	DeviceManager devicemanager.Manager
	DriverManager drivermanager.Manager
	ServersContactedCh chan struct{...}
	StartConditionMetCh <-chan struct{...}
	ShutdownDelayCtx context.Context
	ShutdownDelayCancelFn context.CancelFunc
	ServiceRegWrapper *wrapper.HandlerWrapper
	Getter cinterfaces.ArtifactGetter
	Wranglers cinterfaces.ProcessWranglers
	AllocHookResources *cstructs.AllocHookResources
	WIDMgr widmgr.IdentityManager
	Users dynamic.Pool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Alloc` | `*structs.Allocation` | — |
| `ClientConfig` | `*config.Config` | 配置对象 |
| `Task` | `*structs.Task` | — |
| `TaskDir` | `*allocdir.TaskDir` | — |
| `Logger` | `log.Logger` | 日志记录器 |
| `ClientBaseLabels` | `[]metrics.Label` | 列表 |
| `ConsulServices` | `serviceregistration.Handler` | — |
| `ConsulProxiesFunc` | `consul.SupportedProxiesAPIFunc` | — |
| `DynamicRegistry` | `dynamicplugins.Registry` | — |
| `VaultFunc` | `vaultclient.VaultClientFunc` | — |
| `StateDB` | `cstate.StateDB` | — |
| `StateUpdater` | `interfaces.TaskStateHandler` | — |
| `DeviceStatsReporter` | `cinterfaces.DeviceStatsReporter` | — |
| `CSIManager` | `csimanager.Manager` | — |
| `DeviceManager` | `devicemanager.Manager` | — |
| `DriverManager` | `drivermanager.Manager` | — |
| `ServersContactedCh` | `chan struct{...}` | 信号通道 |
| `StartConditionMetCh` | `<-chan struct{...}` | 信号通道 |
| `ShutdownDelayCtx` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `ShutdownDelayCancelFn` | `context.CancelFunc` | 取消函数，用于取消上下文 |
| `ServiceRegWrapper` | `*wrapper.HandlerWrapper` | — |
| `Getter` | `cinterfaces.ArtifactGetter` | — |
| `Wranglers` | `cinterfaces.ProcessWranglers` | — |
| `AllocHookResources` | `*cstructs.AllocHookResources` | — |
| `WIDMgr` | `widmgr.IdentityManager` | — |
| `Users` | `dynamic.Pool` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `defaultMaxEvents` | `—` | `10` | — |
| `killBackoffBaseline` | `—` | `5 * time.Second` | — |
| `killBackoffLimit` | `—` | `2 * time.Minute` | — |
| `killFailureLimit` | `—` | `5` | — |
| `triggerUpdateChCap` | `—` | `1` | — |
| `restartChCap` | `—` | `1` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewTaskRunner` | - | `config *Config` | `*TaskRunner, error` | [L376](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L376) |
| `initLabels` | `tr *TaskRunner` | `` | `` | [L493](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L493) |
| `MarkFailedKill` | `tr *TaskRunner` | `reason string` | `` | [L555](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L555) |
| `Run` | `tr *TaskRunner` | `` | `` | [L570](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L570) |
| `shouldShutdown` | `tr *TaskRunner` | `` | `bool` | [L800](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L800) |
| `handleTaskExitResult` | `tr *TaskRunner` | `result *drivers.ExitResult` | `retryWait bool` | [L817](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L817) |
| `emitExitResultEvent` | `tr *TaskRunner` | `result *drivers.ExitResult` | `` | [L853](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L853) |
| `handleUpdates` | `tr *TaskRunner` | `` | `` | [L869](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L869) |
| `shouldRestart` | `tr *TaskRunner` | `` | `bool, time.Duration` | [L884](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L884) |
| `assignCgroup` | `tr *TaskRunner` | `taskConfig *drivers.TaskConfig` | `` | [L910](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L910) |
| `runDriver` | `tr *TaskRunner` | `` | `error` | [L918](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L918) |
| `initDriver` | `tr *TaskRunner` | `` | `error` | [L1015](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1015) |
| `handleKill` | `tr *TaskRunner` | `resultCh <-chan *drivers.ExitResult` | `*drivers.ExitResult` | [L1044](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1044) |
| `killTask` | `tr *TaskRunner` | `handle *DriverHandle, resultCh <-chan *drivers.ExitResult` | `*drivers.ExitResult, error` | [L1129](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1129) |
| `persistLocalState` | `tr *TaskRunner` | `` | `error` | [L1159](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1159) |
| `buildTaskConfig` | `tr *TaskRunner` | `` | `*drivers.TaskConfig` | [L1169](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1169) |
| `Restore` | `tr *TaskRunner` | `` | `error` | [L1247](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1247) |
| `restoreHandle` | `tr *TaskRunner` | `taskHandle *drivers.TaskHandle, net *drivers.DriverNetwork` | `success bool` | [L1295](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1295) |
| `UpdateState` | `tr *TaskRunner` | `state string, event *structs.TaskEvent` | `` | [L1332](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1332) |
| `updateStateImpl` | `tr *TaskRunner` | `state string` | `error` | [L1355](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1355) |
| `EmitEvent` | `tr *TaskRunner` | `event *structs.TaskEvent` | `` | [L1393](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1393) |
| `AppendEvent` | `tr *TaskRunner` | `event *structs.TaskEvent` | `` | [L1414](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1414) |
| `appendEvent` | `tr *TaskRunner` | `event *structs.TaskEvent` | `error` | [L1428](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1428) |
| `WaitCh` | `tr *TaskRunner` | `` | `<-chan struct{...}` | [L1454](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1454) |
| `Update` | `tr *TaskRunner` | `update *structs.Allocation` | `` | [L1463](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1463) |
| `SetNetworkIsolation` | `tr *TaskRunner` | `n *drivers.NetworkIsolationSpec` | `` | [L1488](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1488) |
| `SetNetworkStatus` | `tr *TaskRunner` | `s *structs.AllocNetworkStatus` | `` | [L1498](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1498) |
| `triggerUpdateHooks` | `tr *TaskRunner` | `` | `` | [L1512](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1512) |
| `Shutdown` | `tr *TaskRunner` | `` | `` | [L1522](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1522) |
| `LatestResourceUsage` | `tr *TaskRunner` | `` | `*cstructs.TaskResourceUsage` | [L1538](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1538) |
| `UpdateStats` | `tr *TaskRunner` | `ru *cstructs.TaskResourceUsage` | `` | [L1552](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1552) |
| `setGaugeForMemory` | `tr *TaskRunner` | `ru *cstructs.TaskResourceUsage` | `` | [L1562](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1562) |
| `setGaugeForCPU` | `tr *TaskRunner` | `ru *cstructs.TaskResourceUsage` | `` | [L1600](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1600) |
| `emitStats` | `tr *TaskRunner` | `ru *cstructs.TaskResourceUsage` | `` | [L1629](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1629) |
| `appendTaskEvent` | - | `state *structs.TaskState, event *structs.TaskEvent, capacity int` | `` | [L1648](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1648) |
| `TaskExecHandler` | `tr *TaskRunner` | `` | `drivermanager.TaskExecHandler` | [L1665](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1665) |
| `DriverCapabilities` | `tr *TaskRunner` | `` | `*drivers.Capabilities, error` | [L1674](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1674) |
| `shutdownDelayCancel` | `tr *TaskRunner` | `` | `` | [L1680](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1680) |
| `setHookStatsHandler` | `tr *TaskRunner` | `ns string` | `` | [L1694](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1694) |

## 5. 核心方法详解

### NewTaskRunner()

**签名**：`func NewTaskRunner(config *Config) *TaskRunner, error`

**位置**：[L376](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L376)

**中文说明**：创建并返回一个新的 TaskRunner 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `config` | `*Config` | 配置 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*TaskRunner` | — |
| `error` | 错误信息 |

### Run()

**签名**：`func (tr *TaskRunner) Run() `

**位置**：[L570](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L570)

**中文说明**：运行对象的主循环。

### Restore()

**签名**：`func (tr *TaskRunner) Restore() error`

**位置**：[L1247](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1247)

**中文说明**：从快照恢复对象的状态。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Update()

**签名**：`func (tr *TaskRunner) Update(update *structs.Allocation) `

**位置**：[L1463](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1463)

**中文说明**：更新指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `update` | `*structs.Allocation` | — |

### Shutdown()

**签名**：`func (tr *TaskRunner) Shutdown() `

**位置**：[L1522](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1522)

**中文说明**：关闭对象，释放相关资源。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `slices` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocdir` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/hookstats` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/restarts` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/state` | 内部包 |
| `github.com/hashicorp/nomad/client/config` | 内部包 |
| `github.com/hashicorp/nomad/client/consul` | 内部包 |
| `github.com/hashicorp/nomad/client/devicemanager` | 内部包 |
| `github.com/hashicorp/nomad/client/dynamicplugins` | 内部包 |
| `github.com/hashicorp/nomad/client/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/cgroupslib` | 内部包 |
| `github.com/hashicorp/nomad/client/pluginmanager/csimanager` | 内部包 |
| `github.com/hashicorp/nomad/client/pluginmanager/drivermanager` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration/wrapper` | 内部包 |
| `github.com/hashicorp/nomad/client/state` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/client/vaultclient` | 内部包 |
| `github.com/hashicorp/nomad/client/widmgr` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/hclspecutils` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/hclutils` | 内部包 |
| `github.com/hashicorp/nomad/helper/users/dynamic` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/hcl/v2/hcldec` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标
- **后台协程**：启动 goroutine 执行后台任务
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [task_runner_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_test.go) | 对应测试文件 |
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go) | 同目录源文件 |
| [consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |

