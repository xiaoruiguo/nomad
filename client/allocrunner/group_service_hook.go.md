# group_service_hook.go 代码说明文档

> 文件路径：[client/allocrunner/group_service_hook.go](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go)
> 总行数：339 行
> 所属包：`allocrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### groupServiceHook

**定义位置**：[L28](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L28)

**中文说明**：groupServiceHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：struct

```go
type groupServiceHook struct {
	allocID string
	jobID string
	group string
	tg *structs.TaskGroup
	namespace string
	restarter serviceregistration.WorkloadRestarter
	prerun bool
	deregistered bool
	networkStatus structs.NetworkStatus
	shutdownDelayCtx context.Context
	providerNamespace string
	serviceRegWrapper *wrapper.HandlerWrapper
	hookResources *cstructs.AllocHookResources
	logger hclog.Logger
	canary bool
	services []*structs.Service
	networks structs.Networks
	ports structs.AllocatedPorts
	delay time.Duration
	mu sync.Mutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `allocID` | `string` | 字符串 |
| `jobID` | `string` | 字符串 |
| `group` | `string` | 字符串 |
| `tg` | `*structs.TaskGroup` | — |
| `namespace` | `string` | 命名空间 |
| `restarter` | `serviceregistration.WorkloadRestarter` | — |
| `prerun` | `bool` | 布尔值 |
| `deregistered` | `bool` | 布尔值 |
| `networkStatus` | `structs.NetworkStatus` | — |
| `shutdownDelayCtx` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `providerNamespace` | `string` | 字符串 |
| `serviceRegWrapper` | `*wrapper.HandlerWrapper` | — |
| `hookResources` | `*cstructs.AllocHookResources` | — |
| `logger` | `hclog.Logger` | 日志记录器 |
| `canary` | `bool` | 布尔值 |
| `services` | `[]*structs.Service` | 列表 |
| `networks` | `structs.Networks` | — |
| `ports` | `structs.AllocatedPorts` | — |
| `delay` | `time.Duration` | 延迟时间 |
| `mu` | `sync.Mutex` | 互斥锁，保护并发访问 |

**关联方法**（11 个）：`Name`, `Prerun`, `preRunLocked`, `Update`, `PreTaskRestart`, `PreKill`, `preKillLocked`, `Postrun`, `deregisterLocked`, `getWorkloadServicesLocked`, `setCheckIDs`

### groupServiceHookConfig

**定义位置**：[L64](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L64)

**中文说明**：groupServiceHookConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type groupServiceHookConfig struct {
	alloc *structs.Allocation
	restarter serviceregistration.WorkloadRestarter
	networkStatus structs.NetworkStatus
	shutdownDelayCtx context.Context
	logger hclog.Logger
	providerNamespace string
	serviceRegWrapper *wrapper.HandlerWrapper
	hookResources *cstructs.AllocHookResources
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `alloc` | `*structs.Allocation` | — |
| `restarter` | `serviceregistration.WorkloadRestarter` | — |
| `networkStatus` | `structs.NetworkStatus` | — |
| `shutdownDelayCtx` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `logger` | `hclog.Logger` | 日志记录器 |
| `providerNamespace` | `string` | 字符串 |
| `serviceRegWrapper` | `*wrapper.HandlerWrapper` | — |
| `hookResources` | `*cstructs.AllocHookResources` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `groupServiceHookName` | `—` | `"group_services"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `_` | `interfaces.RunnerPrerunHook` | `(*groupServiceHook)(nil)` | — |
| `_` | `interfaces.RunnerPreKillHook` | `(*groupServiceHook)(nil)` | — |
| `_` | `interfaces.RunnerPostrunHook` | `(*groupServiceHook)(nil)` | — |
| `_` | `interfaces.RunnerUpdateHook` | `(*groupServiceHook)(nil)` | — |
| `_` | `interfaces.RunnerTaskRestartHook` | `(*groupServiceHook)(nil)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newGroupServiceHook` | - | `cfg groupServiceHookConfig` | `*groupServiceHook` | [L82](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L82) |
| `Name` | ` *groupServiceHook` | `` | `string` | [L128](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L128) |
| `Prerun` | `h *groupServiceHook` | `allocEnv *taskenv.TaskEnv` | `error` | [L132](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L132) |
| `preRunLocked` | `h *groupServiceHook` | `env *taskenv.TaskEnv` | `error` | [L146](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L146) |
| `Update` | `h *groupServiceHook` | `req *interfaces.RunnerUpdateRequest` | `error` | [L164](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L164) |
| `PreTaskRestart` | `h *groupServiceHook` | `` | `error` | [L212](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L212) |
| `PreKill` | `h *groupServiceHook` | `` | `` | [L226](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L226) |
| `preKillLocked` | `h *groupServiceHook` | `` | `` | [L233](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L233) |
| `Postrun` | `h *groupServiceHook` | `` | `error` | [L262](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L262) |
| `deregisterLocked` | `h *groupServiceHook` | `` | `` | [L270](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L270) |
| `getWorkloadServicesLocked` | `h *groupServiceHook` | `` | `*serviceregistration.WorkloadServices` | [L287](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L287) |
| `setCheckIDs` | `h *groupServiceHook` | `services *serviceregistration.WorkloadServices` | `` | [L328](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L328) |

## 5. 核心方法详解

### Update()

**签名**：`func (h *groupServiceHook) Update(req *interfaces.RunnerUpdateRequest) error`

**位置**：[L164](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L164)

**中文说明**：更新指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `req` | `*interfaces.RunnerUpdateRequest` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration/wrapper` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/command/agent/consul` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [group_service_hook_test.go](file:///d:/claude/nomad/client/allocrunner/group_service_hook_test.go) | 对应测试文件 |
| [alloc_runner.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go) | 同目录源文件 |
| [alloc_runner_ce.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_ce.go) | 同目录源文件 |
| [alloc_runner_hooks.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_hooks.go) | 同目录源文件 |
| [allocdir_hook.go](file:///d:/claude/nomad/client/allocrunner/allocdir_hook.go) | 同目录源文件 |
| [checks_hook.go](file:///d:/claude/nomad/client/allocrunner/checks_hook.go) | 同目录源文件 |

