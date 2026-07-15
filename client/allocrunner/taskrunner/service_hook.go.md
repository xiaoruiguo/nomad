# service_hook.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/service_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go)
> 总行数：266 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### serviceHookConfig

**定义位置**：[L32](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L32)

**中文说明**：serviceHookConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type serviceHookConfig struct {
	alloc *structs.Allocation
	task *structs.Task
	serviceRegWrapper *wrapper.HandlerWrapper
	restarter serviceregistration.WorkloadRestarter
	hookResources *cstructs.AllocHookResources
	logger log.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `alloc` | `*structs.Allocation` | — |
| `task` | `*structs.Task` | — |
| `serviceRegWrapper` | `*wrapper.HandlerWrapper` | — |
| `restarter` | `serviceregistration.WorkloadRestarter` | — |
| `hookResources` | `*cstructs.AllocHookResources` | — |
| `logger` | `log.Logger` | 日志记录器 |

### serviceHook

**定义位置**：[L48](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L48)

**中文说明**：serviceHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：struct

```go
type serviceHook struct {
	allocID string
	jobID string
	groupName string
	taskName string
	namespace string
	restarter serviceregistration.WorkloadRestarter
	logger log.Logger
	tg *structs.TaskGroup
	driverExec tinterfaces.ScriptExecutor
	driverNet *drivers.DriverNetwork
	canary bool
	services []*structs.Service
	networks structs.Networks
	ports structs.AllocatedPorts
	taskEnv *taskenv.TaskEnv
	providerNamespace string
	serviceRegWrapper *wrapper.HandlerWrapper
	initialRegistration bool
	deregistered bool
	hookResources *cstructs.AllocHookResources
	mu sync.Mutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `allocID` | `string` | 字符串 |
| `jobID` | `string` | 字符串 |
| `groupName` | `string` | 字符串 |
| `taskName` | `string` | 字符串 |
| `namespace` | `string` | 命名空间 |
| `restarter` | `serviceregistration.WorkloadRestarter` | — |
| `logger` | `log.Logger` | 日志记录器 |
| `tg` | `*structs.TaskGroup` | — |
| `driverExec` | `tinterfaces.ScriptExecutor` | — |
| `driverNet` | `*drivers.DriverNetwork` | — |
| `canary` | `bool` | 布尔值 |
| `services` | `[]*structs.Service` | 列表 |
| `networks` | `structs.Networks` | — |
| `ports` | `structs.AllocatedPorts` | — |
| `taskEnv` | `*taskenv.TaskEnv` | — |
| `providerNamespace` | `string` | 字符串 |
| `serviceRegWrapper` | `*wrapper.HandlerWrapper` | — |
| `initialRegistration` | `bool` | 布尔值 |
| `deregistered` | `bool` | 布尔值 |
| `hookResources` | `*cstructs.AllocHookResources` | — |
| `mu` | `sync.Mutex` | 互斥锁，保护并发访问 |

**关联方法**（9 个）：`Name`, `Poststart`, `Update`, `updateHookFields`, `PreKilling`, `Exited`, `deregister`, `Stop`, `getWorkloadServices`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `taskServiceHookName` | `—` | `"task_services"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `_` | `interfaces.TaskPoststartHook` | `&serviceHook{...}` | — |
| `_` | `interfaces.TaskPreKillHook` | `&serviceHook{...}` | — |
| `_` | `interfaces.TaskExitedHook` | `&serviceHook{...}` | — |
| `_` | `interfaces.TaskStopHook` | `&serviceHook{...}` | — |
| `_` | `interfaces.TaskUpdateHook` | `&serviceHook{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newServiceHook` | - | `c serviceHookConfig` | `*serviceHook` | [L90](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L90) |
| `Name` | `h *serviceHook` | `` | `string` | [L121](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L121) |
| `Poststart` | `h *serviceHook` | `ctx context.Context, req *interfaces.TaskPoststartRequest, _ *interfaces.Task...` | `error` | [L123](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L123) |
| `Update` | `h *serviceHook` | `ctx context.Context, req *interfaces.TaskUpdateRequest, _ *interfaces.TaskUpd...` | `error` | [L142](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L142) |
| `updateHookFields` | `h *serviceHook` | `req *interfaces.TaskUpdateRequest` | `error` | [L165](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L165) |
| `PreKilling` | `h *serviceHook` | `ctx context.Context, req *interfaces.TaskPreKillRequest, resp *interfaces.Tas...` | `error` | [L196](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L196) |
| `Exited` | `h *serviceHook` | `context.Context, *interfaces.TaskExitedRequest, *interfaces.TaskExitedResponse` | `error` | [L206](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L206) |
| `deregister` | `h *serviceHook` | `` | `` | [L214](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L214) |
| `Stop` | `h *serviceHook` | `ctx context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskSt...` | `error` | [L223](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L223) |
| `getWorkloadServices` | `h *serviceHook` | `` | `*serviceregistration.WorkloadServices` | [L230](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L230) |

## 5. 核心方法详解

### Update()

**签名**：`func (h *serviceHook) Update(ctx context.Context, req *interfaces.TaskUpdateRequest, _ *interfaces.TaskUpdateResponse) error`

**位置**：[L142](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L142)

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

**签名**：`func (h *serviceHook) Stop(ctx context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskStopResponse) error`

**位置**：[L223](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook.go#L223)

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

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration/wrapper` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [service_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/service_hook_test.go) | 对应测试文件 |
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go) | 同目录源文件 |
| [consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |

