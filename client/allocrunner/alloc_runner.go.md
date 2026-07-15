# alloc_runner.go 代码说明文档

> 文件路径：[allocrunner/alloc_runner.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go)
> 总行数：1651 行
> 所属包：`allocrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），实现分配（Allocation）的运行生命周期管理，包括预启动钩子、网络配置、Consul 集成、CSI 卷挂载、健康检查等。AllocRunner 是 Client 节点上每个分配的控制器。

## 2. 类型定义

### allocRunner

**定义位置**：[L50](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L50)

**类型**：struct

```go
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
```

**关联方法**（54 个）：`initTaskRunners`, `WaitCh`, `Run`, `shouldRun`, `runTasks`, `Alloc`, `setAlloc`, `GetAllocDir`, `Restore`, `restoreCores`, `persistDeploymentStatus`, `TaskStateUpdated`, `handleTaskStateUpdates`, `killTasks`, `clientAlloc`, `SetClientStatus`, `SetNetworkStatus`, `NetworkStatus`, `setIndexes`, `AllocState`, `Update`, `handleAllocUpdates`, `handleAllocUpdate`, `Listener`, `EnforceMaxRunDurationTimeout`, `maxRunDurationExceeded`, `destroyImpl`, `PersistState`, `Destroy`, `IsDestroyed`, `IsWaiting`, `isShuttingDown`, `DestroyCh`, `ShutdownCh`, `Shutdown`, `IsMigrating`, `StatsReporter`, `LatestAllocStats`, `GetTaskEventHandler`, `Restart`, `RestartTask`, `RestartRunning`, `RestartAll`, `restartTasks`, `Signal`, `Reconnect`, `GetTaskExecHandler`, `GetTaskDriverCapabilities`, `AcknowledgeState`, `persistLastAcknowledgedState`, `GetUpdatePriority`, `SetCSIVolumes`, `GetCSIVolumes`, `setHookStatsHandler`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewAllocRunner` | - | `config *config.AllocRunnerConfig` | `interfaces.AllocRunner, error` | [L236](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L236) |
| `initTaskRunners` | `ar *allocRunner` | `tasks []*structs.Task` | `error` | [L327](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L327) |
| `WaitCh` | `ar *allocRunner` | - | `chan struct{...}` | [L368](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L368) |
| `Run` | `ar *allocRunner` | - | - | [L374](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L374) |
| `shouldRun` | `ar *allocRunner` | - | `bool` | [L421](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L421) |
| `runTasks` | `ar *allocRunner` | - | - | [L444](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L444) |
| `Alloc` | `ar *allocRunner` | - | `*structs.Allocation` | [L456](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L456) |
| `setAlloc` | `ar *allocRunner` | `updated *structs.Allocation` | - | [L462](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L462) |
| `GetAllocDir` | `ar *allocRunner` | - | `allocdir.Interface` | [L469](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L469) |
| `Restore` | `ar *allocRunner` | - | `error` | [L475](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L475) |
| `restoreCores` | `ar *allocRunner` | `res *structs.AllocatedResources` | - | [L524](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L524) |
| `persistDeploymentStatus` | `ar *allocRunner` | `ds *structs.AllocDeploymentStatus` | - | [L532](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L532) |
| `TaskStateUpdated` | `ar *allocRunner` | - | - | [L552](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L552) |
| `handleTaskStateUpdates` | `ar *allocRunner` | - | - | [L566](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L566) |
| `hasNonSidecarTasks` | - | `tasks []*taskrunner.TaskRunner` | `bool` | [L709](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L709) |
| `hasSidecarTasks` | - | `tasks map[string]*taskrunner.TaskRunner` | `bool` | [L720](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L720) |
| `killTasks` | `ar *allocRunner` | - | `map[string]*structs.TaskState` | [L733](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L733) |
| `clientAlloc` | `ar *allocRunner` | `taskStates map[string]*structs.TaskState` | `*structs.Allocation` | [L854](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L854) |
| `getClientStatus` | - | `taskStates map[string]*structs.TaskState` | `status string, description string` | [L932](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L932) |
| `SetClientStatus` | `ar *allocRunner` | `clientStatus string` | - | [L966](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L966) |
| `SetNetworkStatus` | `ar *allocRunner` | `s *structs.AllocNetworkStatus` | - | [L972](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L972) |
| `NetworkStatus` | `ar *allocRunner` | - | `*structs.AllocNetworkStatus` | [L986](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L986) |
| `setIndexes` | `ar *allocRunner` | `update *structs.Allocation` | - | [L994](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L994) |
| `AllocState` | `ar *allocRunner` | - | `*state.State` | [L1004](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1004) |
| `Update` | `ar *allocRunner` | `update *structs.Allocation` | - | [L1031](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1031) |
| `handleAllocUpdates` | `ar *allocRunner` | - | - | [L1065](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1065) |
| `handleAllocUpdate` | `ar *allocRunner` | `update *structs.Allocation` | - | [L1079](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1079) |
| `Listener` | `ar *allocRunner` | - | `*cstructs.AllocListener` | [L1106](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1106) |
| `EnforceMaxRunDurationTimeout` | `ar *allocRunner` | `deadline time.Time` | - | [L1110](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1110) |
| `maxRunDurationExceeded` | `ar *allocRunner` | - | `bool` | [L1131](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1131) |
| `destroyImpl` | `ar *allocRunner` | - | - | [L1137](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1137) |
| `PersistState` | `ar *allocRunner` | - | `error` | [L1176](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1176) |
| `Destroy` | `ar *allocRunner` | - | - | [L1216](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1216) |
| `IsDestroyed` | `ar *allocRunner` | - | `bool` | [L1252](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1252) |
| `IsWaiting` | `ar *allocRunner` | - | `bool` | [L1262](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1262) |
| `isShuttingDown` | `ar *allocRunner` | - | `bool` | [L1268](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1268) |
| `DestroyCh` | `ar *allocRunner` | - | `chan struct{...}` | [L1276](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1276) |
| `ShutdownCh` | `ar *allocRunner` | - | `chan struct{...}` | [L1282](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1282) |
| `Shutdown` | `ar *allocRunner` | - | - | [L1289](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1289) |
| `IsMigrating` | `ar *allocRunner` | - | `bool` | [L1342](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1342) |
| `StatsReporter` | `ar *allocRunner` | - | `interfaces.AllocStatsReporter` | [L1346](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1346) |
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
| `AcknowledgeState` | `ar *allocRunner` | `a *state.State` | - | [L1557](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1557) |
| `persistLastAcknowledgedState` | `ar *allocRunner` | `a *state.State` | - | [L1565](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1565) |
| `GetUpdatePriority` | `ar *allocRunner` | `a *structs.Allocation` | `cstructs.AllocUpdatePriority` | [L1579](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1579) |
| `SetCSIVolumes` | `ar *allocRunner` | `vols map[string]*state.CSIVolumeStub` | `error` | [L1615](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1615) |
| `GetCSIVolumes` | `ar *allocRunner` | - | `map[string]*state.CSIVolumeStub, error` | [L1621](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1621) |
| `setHookStatsHandler` | `ar *allocRunner` | `ns string` | - | [L1642](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1642) |

## 5. 核心方法详解

### Run()

**签名**：`func (ar *allocRunner) Run()`

**位置**：[L374](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L374)

**功能**：AllocRunner 主运行循环，管理分配的完整生命周期。

**执行流程**：
1. 启动任务状态更新处理器（`handleTaskStateUpdates`）
2. 启动分配更新处理器（`handleAllocUpdates`）
3. 检查是否已关闭（`taskStateUpdateHandlerCh`）
4. 若分配非终态（`shouldRun()`），执行预运行钩子（`prerun()`）：
   - 创建分配目录
   - 挂载 CSI 卷
   - 配置网络（CNI/bridge/iptables）
   - 设置 Consul 服务注册
   - 注入身份令牌
5. 运行所有任务（`runTasks()`，阻塞直到所有任务退出）
6. 若非关闭中，执行后运行钩子（`postrun()`）清理资源
7. 关闭 `waitCh` 通知等待者

**钩子链**：AllocRunner 使用预运行/后运行钩子模式，每个钩子实现 `RunnerHook` 接口，在分配状态转换时被调用。

---

### prerun()

**功能**：执行预运行钩子链。

**钩子包括**：
- `allocdirHook` — 创建分配目录结构
- `networkHook` — 配置网络命名空间
- `groupServiceHook` — 注册服务到 Consul/Nomad
- `checksHook` — 设置健康检查
- `csiHook` — 挂载 CSI 卷
- `consulGRPCSockHook` — 设置 Consul gRPC socket
- `identityHook` — 注入工作负载身份
- `healthHook` — 启动健康监控

---

### runTasks()

**功能**：启动并运行所有任务，阻塞直到全部退出。

**流程**：
1. 为每个任务创建 `TaskRunner`
2. 并行启动所有 TaskRunner
3. 等待所有 TaskRunner 完成
4. 根据任务状态更新分配的客户端状态

---

### Update()

**签名**：`func (ar *allocRunner) Update(update *structs.Allocation)`

**位置**：[L1031](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1031)

**功能**：处理 Server 推送的分配更新。

**处理逻辑**：
1. 更新 `ar.alloc` 为新的分配对象
2. 通知所有 TaskRunner 更新（任务配置变化、计数变化等）
3. 触发分配更新处理器（`allocUpdatedCh`）
4. 若分配被标记为停止/销毁，触发相应流程

---

### Shutdown() / Destroy()

**位置**：[L1289](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L1289)

**功能**：优雅关闭/强制销毁分配。

- `Shutdown()` — 优雅停止，等待任务完成，保留分配目录用于调试
- `Destroy()` — 强制销毁，立即停止所有任务，清理分配目录

---

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
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [alloc_runner_test.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_test.go) | 对应测试文件 |

