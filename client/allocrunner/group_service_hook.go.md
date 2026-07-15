# group_service_hook.go 代码说明文档

> 文件路径：[allocrunner/group_service_hook.go](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go)
> 总行数：339 行
> 所属包：`allocrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），实现分配（Allocation）的运行生命周期管理，包括预启动钩子、网络配置、Consul 集成、CSI 卷挂载、健康检查等。AllocRunner 是 Client 节点上每个分配的控制器。

## 2. 类型定义

### groupServiceHook

**定义位置**：[L28](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L28)

**类型**：struct

```go
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
```

**关联方法**（11 个）：`Name`, `Prerun`, `preRunLocked`, `Update`, `PreTaskRestart`, `PreKill`, `preKillLocked`, `Postrun`, `deregisterLocked`, `getWorkloadServicesLocked`, `setCheckIDs`

### groupServiceHookConfig

**定义位置**：[L64](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L64)

**类型**：struct

```go
	alloc *structs.Allocation
	restarter serviceregistration.WorkloadRestarter
	networkStatus structs.NetworkStatus
	shutdownDelayCtx context.Context
	logger hclog.Logger
	providerNamespace string
	serviceRegWrapper *wrapper.HandlerWrapper
	hookResources *cstructs.AllocHookResources
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `groupServiceHookName` | `"group_services"` |

### 变量

| 名称 | 值 |
|------|----|
| `_` | `(*groupServiceHook)(nil)` |
| `_` | `(*groupServiceHook)(nil)` |
| `_` | `(*groupServiceHook)(nil)` |
| `_` | `(*groupServiceHook)(nil)` |
| `_` | `(*groupServiceHook)(nil)` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newGroupServiceHook` | - | `cfg groupServiceHookConfig` | `*groupServiceHook` | [L82](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L82) |
| `Name` | ` *groupServiceHook` | - | `string` | [L128](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L128) |
| `Prerun` | `h *groupServiceHook` | `allocEnv *taskenv.TaskEnv` | `error` | [L132](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L132) |
| `preRunLocked` | `h *groupServiceHook` | `env *taskenv.TaskEnv` | `error` | [L146](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L146) |
| `Update` | `h *groupServiceHook` | `req *interfaces.RunnerUpdateRequest` | `error` | [L164](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L164) |
| `PreTaskRestart` | `h *groupServiceHook` | - | `error` | [L212](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L212) |
| `PreKill` | `h *groupServiceHook` | - | - | [L226](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L226) |
| `preKillLocked` | `h *groupServiceHook` | - | - | [L233](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L233) |
| `Postrun` | `h *groupServiceHook` | - | `error` | [L262](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L262) |
| `deregisterLocked` | `h *groupServiceHook` | - | - | [L270](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L270) |
| `getWorkloadServicesLocked` | `h *groupServiceHook` | - | `*serviceregistration.WorkloadServices` | [L287](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L287) |
| `setCheckIDs` | `h *groupServiceHook` | `services *serviceregistration.WorkloadServices` | - | [L328](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L328) |

## 5. 核心方法详解

### Update()

**签名**：`func (h *groupServiceHook) Update(req *interfaces.RunnerUpdateRequest) error`

**位置**：[L164](file:///d:/claude/nomad/client/allocrunner/group_service_hook.go#L164)

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

- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [group_service_hook_test.go](file:///d:/claude/nomad/client/allocrunner/group_service_hook_test.go) | 对应测试文件 |

