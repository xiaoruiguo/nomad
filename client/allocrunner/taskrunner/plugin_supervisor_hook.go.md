# plugin_supervisor_hook.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/plugin_supervisor_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go)
> 总行数：496 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### csiPluginSupervisorHook

**定义位置**：[L34](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L34)

**中文说明**：csiPluginSupervisorHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：struct

```go
type csiPluginSupervisorHook struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `alloc` | `*structs.Allocation` | — |
| `task` | `*structs.Task` | — |
| `runner` | `*TaskRunner` | — |
| `mountPoint` | `string` | 字符串 |
| `socketMountPoint` | `string` | 字符串 |
| `socketPath` | `string` | 字符串 |
| `caps` | `*drivers.Capabilities` | — |
| `eventEmitter` | `ti.EventEmitter` | — |
| `lifecycle` | `ti.TaskLifecycle` | — |
| `supervisorIsRunningLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `supervisorIsRunning` | `bool` | 布尔值 |
| `shutdownCtx` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `shutdownCancelFn` | `context.CancelFunc` | 取消函数，用于取消上下文 |
| `previousHealthState` | `bool` | 布尔值 |

**关联方法**（9 个）：`Name`, `Prestart`, `setSocketHook`, `Poststart`, `ensureSupervisorLoop`, `registerPlugin`, `supervisorLoopOnce`, `Stop`, `restartTask`

### csiPluginSupervisorHookConfig

**定义位置**：[L59](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L59)

**中文说明**：csiPluginSupervisorHookConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type csiPluginSupervisorHookConfig struct {
	clientStateDirPath string
	events ti.EventEmitter
	runner *TaskRunner
	lifecycle ti.TaskLifecycle
	capabilities *drivers.Capabilities
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `clientStateDirPath` | `string` | 字符串 |
| `events` | `ti.EventEmitter` | — |
| `runner` | `*TaskRunner` | — |
| `lifecycle` | `ti.TaskLifecycle` | — |
| `capabilities` | `*drivers.Capabilities` | — |
| `logger` | `hclog.Logger` | 日志记录器 |

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `_` | `interfaces.TaskPrestartHook` | `&csiPluginSupervisorHook{...}` | — |
| `_` | `interfaces.TaskPoststartHook` | `&csiPluginSupervisorHook{...}` | — |
| `_` | `interfaces.TaskStopHook` | `&csiPluginSupervisorHook{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newCSIPluginSupervisorHook` | - | `config *csiPluginSupervisorHookConfig` | `*csiPluginSupervisorHook` | [L102](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L102) |
| `Name` | ` *csiPluginSupervisorHook` | `` | `string` | [L145](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L145) |
| `Prestart` | `h *csiPluginSupervisorHook` | `ctx context.Context, req *interfaces.TaskPrestartRequest, resp *interfaces.Ta...` | `error` | [L154](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L154) |
| `setSocketHook` | `h *csiPluginSupervisorHook` | `` | `` | [L219](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L219) |
| `Poststart` | `h *csiPluginSupervisorHook` | `ctx context.Context, _ *interfaces.TaskPoststartRequest, _ *interfaces.TaskPo...` | `error` | [L240](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L240) |
| `ensureSupervisorLoop` | `h *csiPluginSupervisorHook` | `ctx context.Context` | `` | [L269](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L269) |
| `registerPlugin` | `h *csiPluginSupervisorHook` | `client csi.CSIPlugin, socketPath string` | `func(...), error` | [L376](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L376) |
| `supervisorLoopOnce` | `h *csiPluginSupervisorHook` | `ctx context.Context, client csi.CSIPlugin` | `bool, error` | [L443](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L443) |
| `Stop` | `h *csiPluginSupervisorHook` | `_ context.Context, req *interfaces.TaskStopRequest, _ *interfaces.TaskStopRes...` | `error` | [L463](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L463) |
| `restartTask` | `h *csiPluginSupervisorHook` | `ctx context.Context, reason error` | `` | [L472](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L472) |
| `ensureMountpointInserted` | - | `mounts []*drivers.MountConfig, mount *drivers.MountConfig` | `[]*drivers.MountConfig` | [L486](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L486) |

## 5. 核心方法详解

### Stop()

**签名**：`func (h *csiPluginSupervisorHook) Stop(_ context.Context, req *interfaces.TaskStopRequest, _ *interfaces.TaskStopResponse) error`

**位置**：[L463](file:///d:/claude/nomad/client/allocrunner/taskrunner/plugin_supervisor_hook.go#L463)

**中文说明**：停止对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `_` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `req` | `*interfaces.TaskStopRequest` | — |
| `_` | `*interfaces.TaskStopResponse` | — |

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

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **后台协程**：启动 goroutine 执行后台任务

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go) | 同目录源文件 |
| [consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |

