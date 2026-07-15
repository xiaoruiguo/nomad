# script_check_hook.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/script_check_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go)
> 总行数：446 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### scriptCheckHookConfig

**定义位置**：[L30](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L30)

**类型**：struct

```go
	alloc *structs.Allocation
	task *structs.Task
	consul serviceregistration.Handler
	arHookResources *cstructs.AllocHookResources
	logger log.Logger
	shutdownWait time.Duration
```

### scriptCheckHook

**定义位置**：[L41](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L41)

**类型**：struct

```go
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
```

**关联方法**（8 个）：`Name`, `Prestart`, `Poststart`, `Update`, `upsertChecks`, `Stop`, `newScriptChecks`, `associated`

### TTLUpdater

**定义位置**：[L287](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L287)

**类型**：interface

```go
	UpdateTTL
```

### scriptCheck

**定义位置**：[L293](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L293)

**类型**：struct

```go
	id string
	consulNamespace string
	ttlUpdater TTLUpdater
	check *structs.ServiceCheck
	lastCheckOk bool
	tasklet
```

**关联方法**（2 个）：`Copy`, `updateTTL`

### scriptCheckConfig

**定义位置**：[L303](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L303)

**类型**：struct

```go
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
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `defaultShutdownWait` | `time.Minute` |
| `updateTTLBackoffBaseline` | `1 * time.Second` |
| `updateTTLBackoffLimit` | `3 * time.Second` |

### 变量

| 名称 | 值 |
|------|----|
| `_` | `&scriptCheckHook{...}` |
| `_` | `&scriptCheckHook{...}` |
| `_` | `&scriptCheckHook{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newScriptCheckHook` | - | `c scriptCheckHookConfig` | `*scriptCheckHook` | [L74](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L74) |
| `Name` | `h *scriptCheckHook` | - | `string` | [L95](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L95) |
| `Prestart` | `h *scriptCheckHook` | `ctx context.Context, req *interfaces.TaskPrestartRequest, _ *interfaces.Task...` | `error` | [L101](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L101) |
| `Poststart` | `h *scriptCheckHook` | `ctx context.Context, req *interfaces.TaskPoststartRequest, _ *interfaces.Tas...` | `error` | [L111](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L111) |
| `Update` | `h *scriptCheckHook` | `ctx context.Context, req *interfaces.TaskUpdateRequest, _ *interfaces.TaskUp...` | `error` | [L128](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L128) |
| `upsertChecks` | `h *scriptCheckHook` | - | `error` | [L145](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L145) |
| `Stop` | `h *scriptCheckHook` | `ctx context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskS...` | `error` | [L173](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L173) |
| `newScriptChecks` | `h *scriptCheckHook` | - | `map[string]*scriptCheck` | [L194](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L194) |
| `associated` | ` *scriptCheckHook` | `task string, serviceTask string, checkTask string` | `bool` | [L275](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L275) |
| `newScriptCheck` | - | `config *scriptCheckConfig` | `*scriptCheck` | [L322](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L322) |
| `Copy` | `sc *scriptCheck` | - | `*scriptCheck` | [L362](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L362) |
| `newScriptCheckCallback` | - | `s *scriptCheck` | `taskletCallback` | [L369](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L369) |
| `updateTTL` | `sc *scriptCheck` | `ctx context.Context, msg string, state string` | `error` | [L425](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L425) |

## 5. 核心方法详解

### Update()

**签名**：`func (h *scriptCheckHook) Update(ctx context.Context, req *interfaces.TaskUpdateRequest, _ *interfaces.TaskUpdateResponse) error`

**位置**：[L128](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L128)

### Stop()

**签名**：`func (h *scriptCheckHook) Stop(ctx context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskStopResponse) error`

**位置**：[L173](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook.go#L173)

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
- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [script_check_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/script_check_hook_test.go) | 对应测试文件 |

