# alloc_runner.go 代码说明文档

> 文件路径：[client/allocrunner/alloc_runner.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go)
> 总行数：1651 行
> 所属包：`allocrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### allocRunner

**定义位置**：[L50](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L50)

**中文说明**：allocRunner 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type allocRunner struct {
	id string
	logger log.Logger
	clientConfig *config.Config
	clientBaseLabels []metrics.Label
	stateUpdater cinterfaces.AllocStateHandler
	taskStateUpdatedCh chan struct{...}
	taskStateUpdateHandlerCh chan struct{...}
	allocUpdatedCh chan *structs.Allocation
	consulServicesHandler serviceregistration.Handler
	consulProxiesClientFunc consul.SupportedProxiesAPIFunc
	vaultClientFunc vaultclient.VaultClientFunc
	hookStatsHandler interfaces.HookStatsHandler
	waitCh chan struct{...}
	destroyed bool
	destroyCh chan struct{...}
	shutdown bool
	shutdownCh chan struct{...}
	destroyLaunched bool
	shutdownLaunched bool
	destroyedLock sync.Mutex
	alloc *structs.Allocation
	allocLock sync.RWMutex
	state *state.State
	stateLock sync.RWMutex
	lastAcknowledgedState *state.State
	stateDB cstate.StateDB
	allocDir allocdir.Interface
	runnerHooks []interfaces.RunnerHook
	hookResources *cstructs.AllocHookResources
	tasks map[string]*taskrunner.TaskRunner
	deviceStatsReporter cinterfaces.DeviceStatsReporter
	allocBroadcaster *cstructs.AllocBroadcaster
	prevAllocWatcher config.PrevAllocWatcher
	prevAllocMigrator config.PrevAllocMigrator
	dynamicRegistry dynamicplugins.Registry
	csiManager csimanager.Manager
	devicemanager devicemanager.Manager
	driverManager drivermanager.Manager
	serversContactedCh chan struct{...}
	taskCoordinator *tasklifecycle.Coordinator
	shutdownDelayCtx context.Context
	shutdownDelayCancelFn context.CancelFunc
	rpcClient config.RPCer
	serviceRegWrapper *wrapper.HandlerWrapper
	checkStore checkstore.Shim
	getter cinterfaces.ArtifactGetter
	wranglers cinterfaces.ProcessWranglers
	partitions cinterfaces.CPUPartitions
	widsigner widmgr.IdentitySigner
	widmgr widmgr.IdentityManager
	users dynamic.Pool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `id` | `string` | 唯一标识符 |
| `logger` | `log.Logger` | 日志记录器 |
| `clientConfig` | `*config.Config` | 配置对象 |
| `clientBaseLabels` | `[]metrics.Label` | 列表 |
| `stateUpdater` | `cinterfaces.AllocStateHandler` | — |
| `taskStateUpdatedCh` | `chan struct{...}` | 信号通道 |
| `taskStateUpdateHandlerCh` | `chan struct{...}` | 信号通道 |
| `allocUpdatedCh` | `chan *structs.Allocation` | 通道 |
| `consulServicesHandler` | `serviceregistration.Handler` | — |
| `consulProxiesClientFunc` | `consul.SupportedProxiesAPIFunc` | — |
| `vaultClientFunc` | `vaultclient.VaultClientFunc` | — |
| `hookStatsHandler` | `interfaces.HookStatsHandler` | — |
| `waitCh` | `chan struct{...}` | 信号通道 |
| `destroyed` | `bool` | 布尔值 |
| `destroyCh` | `chan struct{...}` | 信号通道 |
| `shutdown` | `bool` | 是否已关闭 |
| `shutdownCh` | `chan struct{...}` | 关闭信号通道，当收到关闭信号时触发清理流程 |
| `destroyLaunched` | `bool` | 布尔值 |
| `shutdownLaunched` | `bool` | 布尔值 |
| `destroyedLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `alloc` | `*structs.Allocation` | — |
| `allocLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |
| `state` | `*state.State` | 状态 |
| `stateLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |
| `lastAcknowledgedState` | `*state.State` | — |
| `stateDB` | `cstate.StateDB` | — |
| `allocDir` | `allocdir.Interface` | — |
| `runnerHooks` | `[]interfaces.RunnerHook` | 列表 |
| `hookResources` | `*cstructs.AllocHookResources` | — |
| `tasks` | `map[string]*taskrunner.TaskRunner` | 映射表 |
| `deviceStatsReporter` | `cinterfaces.DeviceStatsReporter` | — |
| `allocBroadcaster` | `*cstructs.AllocBroadcaster` | — |
| `prevAllocWatcher` | `config.PrevAllocWatcher` | — |
| `prevAllocMigrator` | `config.PrevAllocMigrator` | — |
| `dynamicRegistry` | `dynamicplugins.Registry` | — |
| `csiManager` | `csimanager.Manager` | — |
| `devicemanager` | `devicemanager.Manager` | — |
| `driverManager` | `drivermanager.Manager` | — |
| `serversContactedCh` | `chan struct{...}` | 信号通道 |
| `taskCoordinator` | `*tasklifecycle.Coordinator` | — |
| `shutdownDelayCtx` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `shutdownDelayCancelFn` | `context.CancelFunc` | 取消函数，用于取消上下文 |
| `rpcClient` | `config.RPCer` | — |
| `serviceRegWrapper` | `*wrapper.HandlerWrapper` | — |
| `checkStore` | `checkstore.Shim` | — |
| `getter` | `cinterfaces.ArtifactGetter` | — |
| `wranglers` | `cinterfaces.ProcessWranglers` | — |
| `partitions` | `cinterfaces.CPUPartitions` | — |
| `widsigner` | `widmgr.IdentitySigner` | — |
| `widmgr` | `widmgr.IdentityManager` | — |
| `users` | `dynamic.Pool` | — |

**关联方法**（54 个）：`initTaskRunners`, `WaitCh`, `Run`, `shouldRun`, `runTasks`, `Alloc`, `setAlloc`, `GetAllocDir`, `Restore`, `restoreCores`, `persistDeploymentStatus`, `TaskStateUpdated`, `handleTaskStateUpdates`, `killTasks`, `clientAlloc`, `SetClientStatus`, `SetNetworkStatus`, `NetworkStatus`, `setIndexes`, `AllocState`, `Update`, `handleAllocUpdates`, `handleAllocUpdate`, `Listener`, `EnforceMaxRunDurationTimeout`, `maxRunDurationExceeded`, `destroyImpl`, `PersistState`, `Destroy`, `IsDestroyed`, `IsWaiting`, `isShuttingDown`, `DestroyCh`, `ShutdownCh`, `Shutdown`, `IsMigrating`, `StatsReporter`, `LatestAllocStats`, `GetTaskEventHandler`, `Restart`, `RestartTask`, `RestartRunning`, `RestartAll`, `restartTasks`, `Signal`, `Reconnect`, `GetTaskExecHandler`, `GetTaskDriverCapabilities`, `AcknowledgeState`, `persistLastAcknowledgedState`, `GetUpdatePriority`, `SetCSIVolumes`, `GetCSIVolumes`, `setHookStatsHandler`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewAllocRunner` | - | `config *config.AllocRunnerConfig` | `interfaces.AllocRunner, error` | [L236](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L236) |
| `initTaskRunners` | `ar *allocRunner` | `tasks []*structs.Task` | `error` | [L327](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L327) |
| `WaitCh` | `ar *allocRunner` | `` | `<-chan struct{...}` | [L368](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L368) |
| `Run` | `ar *allocRunner` | `` | `` | [L374](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L374) |
| `shouldRun` | `ar *allocRunner` | `` | `bool` | [L421](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L421) |
| `runTasks` | `ar *allocRunner` | `` | `` | [L444](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L444) |
| `Alloc` | `ar *allocRunner` | `` | `*structs.Allocation` | [L456](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L456) |
| `setAlloc` | `ar *allocRunner` | `updated *structs.Allocation` | `` | [L462](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L462) |
| `GetAllocDir` | `ar *allocRunner` | `` | `allocdir.Interface` | [L469](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L469) |
| `Restore` | `ar *allocRunner` | `` | `error` | [L475](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L475) |
| `restoreCores` | `ar *allocRunner` | `res *structs.AllocatedResources` | `` | [L524](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L524) |
| `persistDeploymentStatus` | `ar *allocRunner` | `ds *structs.AllocDeploymentStatus` | `` | [L532](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L532) |
| `TaskStateUpdated` | `ar *allocRunner` | `` | `` | [L552](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L552) |
| `handleTaskStateUpdates` | `ar *allocRunner` | `` | `` | [L566](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L566) |
| `hasNonSidecarTasks` | - | `tasks []*taskrunner.TaskRunner` | `bool` | [L709](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L709) |
| `hasSidecarTasks` | - | `tasks map[string]*taskrunner.TaskRunner` | `bool` | [L720](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L720) |
| `killTasks` | `ar *allocRunner` | `` | `map[string]*structs.TaskState` | [L733](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L733) |
| `clientAlloc` | `ar *allocRunner` | `taskStates map[string]*structs.TaskState` | `*structs.Allocation` | [L854](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L854) |
| `getClientStatus` | - | `taskStates map[string]*structs.TaskState` | `status string, description string` | [L932](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L932) |
| `SetClientStatus` | `ar *allocRunner` | `clientStatus string` | `` | [L966](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L966) |
| `SetNetworkStatus` | `ar *allocRunner` | `s *structs.AllocNetworkStatus` | `` | [L972](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L972) |
| `NetworkStatus` | `ar *allocRunner` | `` | `*structs.AllocNetworkStatus` | [L986](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L986) |
| `setIndexes` | `ar *allocRunner` | `update *structs.Allocation` | `` | [L994](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L994) |
| `AllocState` | `ar *allocRunner` | `` | `*state.State` | [L1004](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1004) |
| `Update` | `ar *allocRunner` | `update *structs.Allocation` | `` | [L1031](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1031) |
| `handleAllocUpdates` | `ar *allocRunner` | `` | `` | [L1065](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1065) |
| `handleAllocUpdate` | `ar *allocRunner` | `update *structs.Allocation` | `` | [L1079](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1079) |
| `Listener` | `ar *allocRunner` | `` | `*cstructs.AllocListener` | [L1106](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1106) |
| `EnforceMaxRunDurationTimeout` | `ar *allocRunner` | `deadline time.Time` | `` | [L1110](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1110) |
| `maxRunDurationExceeded` | `ar *allocRunner` | `` | `bool` | [L1131](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1131) |
| `destroyImpl` | `ar *allocRunner` | `` | `` | [L1137](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1137) |
| `PersistState` | `ar *allocRunner` | `` | `error` | [L1176](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1176) |
| `Destroy` | `ar *allocRunner` | `` | `` | [L1216](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1216) |
| `IsDestroyed` | `ar *allocRunner` | `` | `bool` | [L1252](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1252) |
| `IsWaiting` | `ar *allocRunner` | `` | `bool` | [L1262](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1262) |
| `isShuttingDown` | `ar *allocRunner` | `` | `bool` | [L1268](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1268) |
| `DestroyCh` | `ar *allocRunner` | `` | `<-chan struct{...}` | [L1276](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1276) |
| `ShutdownCh` | `ar *allocRunner` | `` | `<-chan struct{...}` | [L1282](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1282) |
| `Shutdown` | `ar *allocRunner` | `` | `` | [L1289](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1289) |
| `IsMigrating` | `ar *allocRunner` | `` | `bool` | [L1342](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1342) |
| `StatsReporter` | `ar *allocRunner` | `` | `interfaces.AllocStatsReporter` | [L1346](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1346) |
| `LatestAllocStats` | `ar *allocRunner` | `taskFilter string` | `*cstructs.AllocResourceUsage, error` | [L1352](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1352) |
| `GetTaskEventHandler` | `ar *allocRunner` | `taskName string` | `drivermanager.EventHandler` | [L1382](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1382) |
| `Restart` | `ar *allocRunner` | `ctx context.Context, event *structs.TaskEvent, failure bool` | `error` | [L1398](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1398) |
| `RestartTask` | `ar *allocRunner` | `taskName string, event *structs.TaskEvent` | `error` | [L1403](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1403) |
| `RestartRunning` | `ar *allocRunner` | `event *structs.TaskEvent` | `error` | [L1413](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1413) |
| `RestartAll` | `ar *allocRunner` | `event *structs.TaskEvent` | `error` | [L1419](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1419) |
| `restartTasks` | `ar *allocRunner` | `ctx context.Context, event *structs.TaskEvent, failure bool, force bool` | `error` | [L1426](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1426) |
| `Signal` | `ar *allocRunner` | `taskName string, signal string` | `error` | [L1477](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1477) |
| `Reconnect` | `ar *allocRunner` | `update *structs.Allocation` | `err error` | [L1502](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1502) |
| `GetTaskExecHandler` | `ar *allocRunner` | `taskName string` | `drivermanager.TaskExecHandler` | [L1537](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1537) |
| `GetTaskDriverCapabilities` | `ar *allocRunner` | `taskName string` | `*drivers.Capabilities, error` | [L1546](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1546) |
| `AcknowledgeState` | `ar *allocRunner` | `a *state.State` | `` | [L1557](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1557) |
| `persistLastAcknowledgedState` | `ar *allocRunner` | `a *state.State` | `` | [L1565](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1565) |
| `GetUpdatePriority` | `ar *allocRunner` | `a *structs.Allocation` | `cstructs.AllocUpdatePriority` | [L1579](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1579) |
| `SetCSIVolumes` | `ar *allocRunner` | `vols map[string]*state.CSIVolumeStub` | `error` | [L1615](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1615) |
| `GetCSIVolumes` | `ar *allocRunner` | `` | `map[string]*state.CSIVolumeStub, error` | [L1621](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1621) |
| `setHookStatsHandler` | `ar *allocRunner` | `ns string` | `` | [L1642](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1642) |

## 5. 核心方法详解

### NewAllocRunner()

**签名**：`func NewAllocRunner(config *config.AllocRunnerConfig) interfaces.AllocRunner, error`

**位置**：[L236](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L236)

**中文说明**：创建并返回一个新的 AllocRunner 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `config` | `*config.AllocRunnerConfig` | 配置 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `interfaces.AllocRunner` | — |
| `error` | 错误信息 |

### Run()

**签名**：`func (ar *allocRunner) Run() `

**位置**：[L374](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L374)

**中文说明**：运行对象的主循环。

### Restore()

**签名**：`func (ar *allocRunner) Restore() error`

**位置**：[L475](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L475)

**中文说明**：从快照恢复对象的状态。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Update()

**签名**：`func (ar *allocRunner) Update(update *structs.Allocation) `

**位置**：[L1031](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1031)

**中文说明**：更新指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `update` | `*structs.Allocation` | — |

### Destroy()

**签名**：`func (ar *allocRunner) Destroy() `

**位置**：[L1216](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1216)

### Shutdown()

**签名**：`func (ar *allocRunner) Shutdown() `

**位置**：[L1289](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1289)

**中文说明**：关闭对象，释放相关资源。

### Signal()

**签名**：`func (ar *allocRunner) Signal(taskName string, signal string) error`

**位置**：[L1477](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1477)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `taskName` | `string` | 字符串 |
| `signal` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `os` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocdir` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/hookstats` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/state` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/tasklifecycle` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/errors` | 内部包 |
| `github.com/hashicorp/nomad/client/config` | 内部包 |
| `github.com/hashicorp/nomad/client/consul` | 内部包 |
| `github.com/hashicorp/nomad/client/devicemanager` | 内部包 |
| `github.com/hashicorp/nomad/client/dynamicplugins` | 内部包 |
| `github.com/hashicorp/nomad/client/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/idset` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib/hw` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/proclib` | 内部包 |
| `github.com/hashicorp/nomad/client/pluginmanager/csimanager` | 内部包 |
| `github.com/hashicorp/nomad/client/pluginmanager/drivermanager` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration/checks/checkstore` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration/wrapper` | 内部包 |
| `github.com/hashicorp/nomad/client/state` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/client/vaultclient` | 内部包 |
| `github.com/hashicorp/nomad/client/widmgr` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/helper/users/dynamic` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/device` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标
- **后台协程**：启动 goroutine 执行后台任务
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [alloc_runner_test.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_test.go) | 对应测试文件 |
| [alloc_runner_ce.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_ce.go) | 同目录源文件 |
| [alloc_runner_hooks.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_hooks.go) | 同目录源文件 |
| [allocdir_hook.go](file:///d:/claude/nomad/client/allocrunner/allocdir_hook.go) | 同目录源文件 |
| [checks_hook.go](file:///d:/claude/nomad/client/allocrunner/checks_hook.go) | 同目录源文件 |
| [consul_grpc_sock_hook.go](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go) | 同目录源文件 |

