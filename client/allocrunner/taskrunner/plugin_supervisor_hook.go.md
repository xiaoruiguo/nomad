# plugin_supervisor_hook.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/plugin_supervisor_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go)
> 总行数：496 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### csiPluginSupervisorHook

**定义位置**：[L34](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L34)

**类型**：struct

```go
	logger hclog.Logger
	alloc *structs.Allocation
	task *structs.Task
	runner *TaskRunner
	mountPoint string
	socketMountPoint string
	socketPath string
	caps *drivers.Capabilities
	eventEmitter ti.EventEmitter
	lifecycle ti.TaskLifecycle
	supervisorIsRunningLock sync.Mutex
	supervisorIsRunning bool
	shutdownCtx context.Context
	shutdownCancelFn context.CancelFunc
	previousHealthState bool
```

**关联方法**（9 个）：`Name`, `Prestart`, `setSocketHook`, `Poststart`, `ensureSupervisorLoop`, `registerPlugin`, `supervisorLoopOnce`, `Stop`, `restartTask`

### csiPluginSupervisorHookConfig

**定义位置**：[L59](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L59)

**类型**：struct

```go
	clientStateDirPath string
	events ti.EventEmitter
	runner *TaskRunner
	lifecycle ti.TaskLifecycle
	capabilities *drivers.Capabilities
	logger hclog.Logger
```

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `_` | `&csiPluginSupervisorHook{...}` |
| `_` | `&csiPluginSupervisorHook{...}` |
| `_` | `&csiPluginSupervisorHook{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newCSIPluginSupervisorHook` | - | `config *csiPluginSupervisorHookConfig` | `*csiPluginSupervisorHook` | [L102](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L102) |
| `Name` | ` *csiPluginSupervisorHook` | - | `string` | [L145](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L145) |
| `Prestart` | `h *csiPluginSupervisorHook` | `ctx context.Context, req *interfaces.TaskPrestartRequest, resp *interfaces.T...` | `error` | [L154](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L154) |
| `setSocketHook` | `h *csiPluginSupervisorHook` | - | - | [L219](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L219) |
| `Poststart` | `h *csiPluginSupervisorHook` | `ctx context.Context, _ *interfaces.TaskPoststartRequest, _ *interfaces.TaskP...` | `error` | [L240](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L240) |
| `ensureSupervisorLoop` | `h *csiPluginSupervisorHook` | `ctx context.Context` | - | [L269](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L269) |
| `registerPlugin` | `h *csiPluginSupervisorHook` | `client csi.CSIPlugin, socketPath string` | `func(...), error` | [L376](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L376) |
| `supervisorLoopOnce` | `h *csiPluginSupervisorHook` | `ctx context.Context, client csi.CSIPlugin` | `bool, error` | [L443](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L443) |
| `Stop` | `h *csiPluginSupervisorHook` | `_ context.Context, req *interfaces.TaskStopRequest, _ *interfaces.TaskStopRe...` | `error` | [L463](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L463) |
| `restartTask` | `h *csiPluginSupervisorHook` | `ctx context.Context, reason error` | - | [L472](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L472) |
| `ensureMountpointInserted` | - | `mounts []*drivers.MountConfig, mount *drivers.MountConfig` | `[]*drivers.MountConfig` | [L486](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L486) |

## 5. 核心方法详解

### Stop()

**签名**：`func (h *csiPluginSupervisorHook) Stop(_ context.Context, req *interfaces.TaskStopRequest, _ *interfaces.TaskStopResponse) error`

**位置**：[L463](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L463)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/dynamicplugins` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/csi` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/LK4D4/joincontext` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|

