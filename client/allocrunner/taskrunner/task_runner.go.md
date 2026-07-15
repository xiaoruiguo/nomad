# task_runner.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/task_runner.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go)
> 总行数：1703 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### TaskRunner

**定义位置**：[L78](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L78)

**类型**：struct

```go
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
	serversContactedCh chan struct{...}
	startConditionMetCh chan struct{...}
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
```

**关联方法**（37 个）：`initLabels`, `MarkFailedKill`, `Run`, `shouldShutdown`, `handleTaskExitResult`, `emitExitResultEvent`, `handleUpdates`, `shouldRestart`, `assignCgroup`, `runDriver`, `initDriver`, `handleKill`, `killTask`, `persistLocalState`, `buildTaskConfig`, `Restore`, `restoreHandle`, `UpdateState`, `updateStateImpl`, `EmitEvent`, `AppendEvent`, `appendEvent`, `WaitCh`, `Update`, `SetNetworkIsolation`, `SetNetworkStatus`, `triggerUpdateHooks`, `Shutdown`, `LatestResourceUsage`, `UpdateStats`, `setGaugeForMemory`, `setGaugeForCPU`, `emitStats`, `TaskExecHandler`, `DriverCapabilities`, `shutdownDelayCancel`, `setHookStatsHandler`

### Config

**定义位置**：[L298](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L298)

**类型**：struct

```go
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
	StartConditionMetCh chan struct{...}
	ShutdownDelayCtx context.Context
	ShutdownDelayCancelFn context.CancelFunc
	ServiceRegWrapper *wrapper.HandlerWrapper
	Getter cinterfaces.ArtifactGetter
	Wranglers cinterfaces.ProcessWranglers
	AllocHookResources *cstructs.AllocHookResources
	WIDMgr widmgr.IdentityManager
	Users dynamic.Pool
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `defaultMaxEvents` | `10` |
| `killBackoffBaseline` | `5 * time.Second` |
| `killBackoffLimit` | `2 * time.Minute` |
| `killFailureLimit` | `5` |
| `triggerUpdateChCap` | `1` |
| `restartChCap` | `1` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewTaskRunner` | - | `config *Config` | `*TaskRunner, error` | [L376](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L376) |
| `initLabels` | `tr *TaskRunner` | - | - | [L493](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L493) |
| `MarkFailedKill` | `tr *TaskRunner` | `reason string` | - | [L555](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L555) |
| `Run` | `tr *TaskRunner` | - | - | [L570](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L570) |
| `shouldShutdown` | `tr *TaskRunner` | - | `bool` | [L800](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L800) |
| `handleTaskExitResult` | `tr *TaskRunner` | `result *drivers.ExitResult` | `retryWait bool` | [L817](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L817) |
| `emitExitResultEvent` | `tr *TaskRunner` | `result *drivers.ExitResult` | - | [L853](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L853) |
| `handleUpdates` | `tr *TaskRunner` | - | - | [L869](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L869) |
| `shouldRestart` | `tr *TaskRunner` | - | `bool, time.Duration` | [L884](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L884) |
| `assignCgroup` | `tr *TaskRunner` | `taskConfig *drivers.TaskConfig` | - | [L910](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L910) |
| `runDriver` | `tr *TaskRunner` | - | `error` | [L918](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L918) |
| `initDriver` | `tr *TaskRunner` | - | `error` | [L1015](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1015) |
| `handleKill` | `tr *TaskRunner` | `resultCh chan *drivers.ExitResult` | `*drivers.ExitResult` | [L1044](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1044) |
| `killTask` | `tr *TaskRunner` | `handle *DriverHandle, resultCh chan *drivers.ExitResult` | `*drivers.ExitResult, error` | [L1129](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1129) |
| `persistLocalState` | `tr *TaskRunner` | - | `error` | [L1159](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1159) |
| `buildTaskConfig` | `tr *TaskRunner` | - | `*drivers.TaskConfig` | [L1169](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1169) |
| `Restore` | `tr *TaskRunner` | - | `error` | [L1247](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1247) |
| `restoreHandle` | `tr *TaskRunner` | `taskHandle *drivers.TaskHandle, net *drivers.DriverNetwork` | `success bool` | [L1295](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1295) |
| `UpdateState` | `tr *TaskRunner` | `state string, event *structs.TaskEvent` | - | [L1332](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1332) |
| `updateStateImpl` | `tr *TaskRunner` | `state string` | `error` | [L1355](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1355) |
| `EmitEvent` | `tr *TaskRunner` | `event *structs.TaskEvent` | - | [L1393](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1393) |
| `AppendEvent` | `tr *TaskRunner` | `event *structs.TaskEvent` | - | [L1414](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1414) |
| `appendEvent` | `tr *TaskRunner` | `event *structs.TaskEvent` | `error` | [L1428](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1428) |
| `WaitCh` | `tr *TaskRunner` | - | `chan struct{...}` | [L1454](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1454) |
| `Update` | `tr *TaskRunner` | `update *structs.Allocation` | - | [L1463](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1463) |
| `SetNetworkIsolation` | `tr *TaskRunner` | `n *drivers.NetworkIsolationSpec` | - | [L1488](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1488) |
| `SetNetworkStatus` | `tr *TaskRunner` | `s *structs.AllocNetworkStatus` | - | [L1498](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1498) |
| `triggerUpdateHooks` | `tr *TaskRunner` | - | - | [L1512](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1512) |
| `Shutdown` | `tr *TaskRunner` | - | - | [L1522](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1522) |
| `LatestResourceUsage` | `tr *TaskRunner` | - | `*cstructs.TaskResourceUsage` | [L1538](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1538) |
| `UpdateStats` | `tr *TaskRunner` | `ru *cstructs.TaskResourceUsage` | - | [L1552](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1552) |
| `setGaugeForMemory` | `tr *TaskRunner` | `ru *cstructs.TaskResourceUsage` | - | [L1562](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1562) |
| `setGaugeForCPU` | `tr *TaskRunner` | `ru *cstructs.TaskResourceUsage` | - | [L1600](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1600) |
| `emitStats` | `tr *TaskRunner` | `ru *cstructs.TaskResourceUsage` | - | [L1629](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1629) |
| `appendTaskEvent` | - | `state *structs.TaskState, event *structs.TaskEvent, capacity int` | - | [L1648](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1648) |
| `TaskExecHandler` | `tr *TaskRunner` | - | `drivermanager.TaskExecHandler` | [L1665](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1665) |
| `DriverCapabilities` | `tr *TaskRunner` | - | `*drivers.Capabilities, error` | [L1674](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1674) |
| `shutdownDelayCancel` | `tr *TaskRunner` | - | - | [L1680](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1680) |
| `setHookStatsHandler` | `tr *TaskRunner` | `ns string` | - | [L1694](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1694) |

## 5. 核心方法详解

### Run()

**签名**：`func (tr *TaskRunner) Run()`

**位置**：[L570](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L570)

**功能**：TaskRunner 主运行循环，管理单个任务的完整生命周期。

**执行流程**：
1. **恢复检查**：若任务已死（`TaskStateDead`），清理驱动句柄，执行停止钩子后返回
2. **更新处理器**：启动 `handleUpdates` goroutine，异步处理分配更新和 Vault Token 更新
3. **服务器等待**：若恢复失败，等待 Server 联系后再重启（#1795 修复）
4. **主循环（MAIN）**：
   - 等待启动条件满足（`startConditionMetCh`）
   - 执行预启动钩子（`prestart()`）：
     - 创建任务目录
     - 下载 artifacts
     - 渲染模板（consul-template）
     - 注入 Vault 密钥
   - 运行任务（`runDriver()`）：
     - 启动驱动插件
     - 等待任务退出
     - 收集退出结果
   - 执行后停止钩子（`poststop()`）：
     - 清理任务目录
     - 移除模板
     - 撤销 Vault Token
5. **重启循环（RESTART）**：
   - 根据重启策略决定是否重启
   - 计算重启延迟
   - 等待延迟后回到 MAIN 循环

**状态机**：pending → running → dead（正常）或 pending → running → pending（重启）

---

### prestart()

**功能**：执行预启动钩子链。

**钩子包括**：
- `validateHook` — 验证任务配置
- `allocDirHook` — 创建任务目录
- `artifactHook` — 下载 artifacts
- `templateHook` — 渲染模板
- `dispatchHook` — 处理 dispatch payload
- `vaultHook` — 注入 Vault 密钥和 Token

---

### Update()

**签名**：`func (tr *TaskRunner) Update(update *structs.Allocation)`

**位置**：[L1463](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1463)

**功能**：处理分配更新，通知 TaskRunner 配置变化。

**处理**：将更新放入 `triggerUpdateCh`，由 `handleUpdates` 异步处理，触发模板重新渲染、Vault Token 更新等。

---

### Shutdown()

**签名**：`func (tr *TaskRunner) Shutdown()`

**位置**：[L1522](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go#L1522)

**功能**：优雅关闭任务，等待任务自然退出。

---

### Kill() / forceKill()

**功能**：强制终止任务，发送 SIGKILL 信号。

---

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
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [task_runner_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_test.go) | 对应测试文件 |

