# script_check_hook.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/script_check_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go)
> 总行数：446 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### scriptCheckHookConfig

**定义位置**：[L30](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L30)

**中文说明**：scriptCheckHookConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type scriptCheckHookConfig struct {
	alloc *structs.Allocation
	task *structs.Task
	consul serviceregistration.Handler
	arHookResources *cstructs.AllocHookResources
	logger log.Logger
	shutdownWait time.Duration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `alloc` | `*structs.Allocation` | — |
| `task` | `*structs.Task` | — |
| `consul` | `serviceregistration.Handler` | — |
| `arHookResources` | `*cstructs.AllocHookResources` | — |
| `logger` | `log.Logger` | 日志记录器 |
| `shutdownWait` | `time.Duration` | 时间间隔 |

### scriptCheckHook

**定义位置**：[L41](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L41)

**中文说明**：scriptCheckHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：struct

```go
type scriptCheckHook struct {
	consul serviceregistration.Handler
	groupConsulNamespace string
	taskConsulNamespace string
	alloc *structs.Allocation
	task *structs.Task
	logger log.Logger
	shutdownWait time.Duration
	shutdownCh chan struct{...}
	arHookResources *cstructs.AllocHookResources
	driverExec tinterfaces.ScriptExecutor
	taskEnv *taskenv.TaskEnv
	scripts map[string]*scriptCheck
	runningScripts map[string]*taskletHandle
	mu sync.Mutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `consul` | `serviceregistration.Handler` | — |
| `groupConsulNamespace` | `string` | 字符串 |
| `taskConsulNamespace` | `string` | 字符串 |
| `alloc` | `*structs.Allocation` | — |
| `task` | `*structs.Task` | — |
| `logger` | `log.Logger` | 日志记录器 |
| `shutdownWait` | `time.Duration` | 时间间隔 |
| `shutdownCh` | `chan struct{...}` | 关闭信号通道，当收到关闭信号时触发清理流程 |
| `arHookResources` | `*cstructs.AllocHookResources` | — |
| `driverExec` | `tinterfaces.ScriptExecutor` | — |
| `taskEnv` | `*taskenv.TaskEnv` | — |
| `scripts` | `map[string]*scriptCheck` | 映射表 |
| `runningScripts` | `map[string]*taskletHandle` | 映射表 |
| `mu` | `sync.Mutex` | 互斥锁，保护并发访问 |

**关联方法**（8 个）：`Name`, `Prestart`, `Poststart`, `Update`, `upsertChecks`, `Stop`, `newScriptChecks`, `associated`

### TTLUpdater

**定义位置**：[L287](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L287)

**中文说明**：TTLUpdater 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type TTLUpdater interface {
	UpdateTTL func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `UpdateTTL` | `func(...)` | 更新指定的TTL。 |

### scriptCheck

**定义位置**：[L293](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L293)

**中文说明**：scriptCheck 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type scriptCheck struct {
	id string
	consulNamespace string
	ttlUpdater TTLUpdater
	check *structs.ServiceCheck
	lastCheckOk bool
	tasklet tasklet
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `id` | `string` | 唯一标识符 |
| `consulNamespace` | `string` | 字符串 |
| `ttlUpdater` | `TTLUpdater` | — |
| `check` | `*structs.ServiceCheck` | — |
| `lastCheckOk` | `bool` | 布尔值 |
| `tasklet` | `tasklet` | — |

**关联方法**（2 个）：`Copy`, `updateTTL`

### scriptCheckConfig

**定义位置**：[L303](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L303)

**中文说明**：scriptCheckConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type scriptCheckConfig struct {
	allocID string
	taskName string
	serviceID string
	consulNamespace string
	check *structs.ServiceCheck
	ttlUpdater TTLUpdater
	driverExec tinterfaces.ScriptExecutor
	taskEnv *taskenv.TaskEnv
	logger log.Logger
	shutdownCh chan struct{...}
	isGroup bool
	checkID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `allocID` | `string` | 字符串 |
| `taskName` | `string` | 字符串 |
| `serviceID` | `string` | 字符串 |
| `consulNamespace` | `string` | 字符串 |
| `check` | `*structs.ServiceCheck` | — |
| `ttlUpdater` | `TTLUpdater` | — |
| `driverExec` | `tinterfaces.ScriptExecutor` | — |
| `taskEnv` | `*taskenv.TaskEnv` | — |
| `logger` | `log.Logger` | 日志记录器 |
| `shutdownCh` | `chan struct{...}` | 关闭信号通道，当收到关闭信号时触发清理流程 |
| `isGroup` | `bool` | 布尔值 |
| `checkID` | `string` | 字符串 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `defaultShutdownWait` | `—` | `time.Minute` | — |
| `updateTTLBackoffBaseline` | `—` | `1 * time.Second` | — |
| `updateTTLBackoffLimit` | `—` | `3 * time.Second` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `_` | `interfaces.TaskPoststartHook` | `&scriptCheckHook{...}` | — |
| `_` | `interfaces.TaskUpdateHook` | `&scriptCheckHook{...}` | — |
| `_` | `interfaces.TaskStopHook` | `&scriptCheckHook{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newScriptCheckHook` | - | `c scriptCheckHookConfig` | `*scriptCheckHook` | [L74](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L74) |
| `Name` | `h *scriptCheckHook` | `` | `string` | [L95](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L95) |
| `Prestart` | `h *scriptCheckHook` | `ctx context.Context, req *interfaces.TaskPrestartRequest, _ *interfaces.TaskP...` | `error` | [L101](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L101) |
| `Poststart` | `h *scriptCheckHook` | `ctx context.Context, req *interfaces.TaskPoststartRequest, _ *interfaces.Task...` | `error` | [L111](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L111) |
| `Update` | `h *scriptCheckHook` | `ctx context.Context, req *interfaces.TaskUpdateRequest, _ *interfaces.TaskUpd...` | `error` | [L128](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L128) |
| `upsertChecks` | `h *scriptCheckHook` | `` | `error` | [L145](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L145) |
| `Stop` | `h *scriptCheckHook` | `ctx context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskSt...` | `error` | [L173](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L173) |
| `newScriptChecks` | `h *scriptCheckHook` | `` | `map[string]*scriptCheck` | [L194](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L194) |
| `associated` | ` *scriptCheckHook` | `task string, serviceTask string, checkTask string` | `bool` | [L275](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L275) |
| `newScriptCheck` | - | `config *scriptCheckConfig` | `*scriptCheck` | [L322](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L322) |
| `Copy` | `sc *scriptCheck` | `` | `*scriptCheck` | [L362](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L362) |
| `newScriptCheckCallback` | - | `s *scriptCheck` | `taskletCallback` | [L369](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L369) |
| `updateTTL` | `sc *scriptCheck` | `ctx context.Context, msg string, state string` | `error` | [L425](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L425) |

## 5. 核心方法详解

### Update()

**签名**：`func (h *scriptCheckHook) Update(ctx context.Context, req *interfaces.TaskUpdateRequest, _ *interfaces.TaskUpdateResponse) error`

**位置**：[L128](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L128)

**中文说明**：更新指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `req` | `*interfaces.TaskUpdateRequest` | — |
| `_` | `*interfaces.TaskUpdateResponse` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Stop()

**签名**：`func (h *scriptCheckHook) Stop(ctx context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskStopResponse) error`

**位置**：[L173](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L173)

**中文说明**：停止对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `req` | `*interfaces.TaskStopRequest` | — |
| `resp` | `*interfaces.TaskStopResponse` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Copy()

**签名**：`func (sc *scriptCheck) Copy() *scriptCheck`

**位置**：[L362](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L362)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*scriptCheck` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/command/agent/consul` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/consul/api` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [script_check_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook_test.go) | 对应测试文件 |
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go) | 同目录源文件 |
| [consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |

