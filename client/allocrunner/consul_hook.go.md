# consul_hook.go 代码说明文档

> 文件路径：[client/allocrunner/consul_hook.go](file:///d:/claude/nomad/client/allocrunner/consul_hook.go)
> 总行数：422 行
> 所属包：`allocrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### consulHook

**定义位置**：[L26](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L26)

**中文说明**：consulHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：struct

```go
type consulHook struct {
	alloc *structs.Allocation
	allocdir allocdir.Interface
	widmgr widmgr.IdentityManager
	consulConfigs map[string]*structsc.ConsulConfig
	consulClientConstructor consul.ConsulClientFunc
	resourcesBackend *resourcesBackend
	logger log.Logger
	shutdownCtx context.Context
	shutdownCancelFn context.CancelFunc
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `alloc` | `*structs.Allocation` | — |
| `allocdir` | `allocdir.Interface` | — |
| `widmgr` | `widmgr.IdentityManager` | — |
| `consulConfigs` | `map[string]*structsc.ConsulConfig` | 映射表 |
| `consulClientConstructor` | `consul.ConsulClientFunc` | — |
| `resourcesBackend` | `*resourcesBackend` | — |
| `logger` | `log.Logger` | 日志记录器 |
| `shutdownCtx` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `shutdownCancelFn` | `context.CancelFunc` | 取消函数，用于取消上下文 |

**关联方法**（10 个）：`Name`, `Prerun`, `prepareConsulTokensForTask`, `prepareConsulTokensForServices`, `getConsulToken`, `clientForCluster`, `Postrun`, `Shutdown`, `Destroy`, `revokeTokens`

### consulHookConfig

**定义位置**：[L39](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L39)

**中文说明**：consulHookConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type consulHookConfig struct {
	alloc *structs.Allocation
	allocdir allocdir.Interface
	widmgr widmgr.IdentityManager
	db cstate.StateDB
	consulConfigs map[string]*structsc.ConsulConfig
	consulClientConstructor consul.ConsulClientFunc
	hookResources *cstructs.AllocHookResources
	logger log.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `alloc` | `*structs.Allocation` | — |
| `allocdir` | `allocdir.Interface` | — |
| `widmgr` | `widmgr.IdentityManager` | — |
| `db` | `cstate.StateDB` | — |
| `consulConfigs` | `map[string]*structsc.ConsulConfig` | 映射表 |
| `consulClientConstructor` | `consul.ConsulClientFunc` | — |
| `hookResources` | `*cstructs.AllocHookResources` | — |
| `logger` | `log.Logger` | 日志记录器 |

### resourcesBackend

**定义位置**：[L327](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L327)

**中文说明**：resourcesBackend 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type resourcesBackend struct {
	allocID string
	hookResources *cstructs.AllocHookResources
	db cstate.StateDB
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `allocID` | `string` | 字符串 |
| `hookResources` | `*cstructs.AllocHookResources` | — |
| `db` | `cstate.StateDB` | — |

**关联方法**（3 个）：`loadAllocTokens`, `setConsulTokens`, `getConsulTokens`

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `_` | `interfaces.RunnerPrerunHook` | `(*consulHook)(nil)` | — |
| `_` | `interfaces.RunnerPostrunHook` | `(*consulHook)(nil)` | — |
| `_` | `interfaces.RunnerDestroyHook` | `(*consulHook)(nil)` | — |
| `_` | `interfaces.ShutdownHook` | `(*consulHook)(nil)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newConsulHook` | - | `cfg consulHookConfig` | `*consulHook` | [L57](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L57) |
| `Name` | ` *consulHook` | `` | `string` | [L81](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L81) |
| `Prerun` | `h *consulHook` | `allocEnv *taskenv.TaskEnv` | `error` | [L85](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L85) |
| `prepareConsulTokensForTask` | `h *consulHook` | `task *structs.Task, tg *structs.TaskGroup, tokens map[string]map[string]*cons...` | `error` | [L134](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L134) |
| `prepareConsulTokensForServices` | `h *consulHook` | `services []*structs.Service, tg *structs.TaskGroup, tokens map[string]map[str...` | `error` | [L192](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L192) |
| `getConsulToken` | `h *consulHook` | `cluster string, req consul.JWTLoginRequest` | `*consulapi.ACLToken, error` | [L253](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L253) |
| `clientForCluster` | `h *consulHook` | `cluster string` | `consul.Client, error` | [L267](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L267) |
| `Postrun` | `h *consulHook` | `` | `error` | [L277](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L277) |
| `Shutdown` | `h *consulHook` | `` | `` | [L282](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L282) |
| `Destroy` | `h *consulHook` | `` | `error` | [L288](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L288) |
| `revokeTokens` | `h *consulHook` | `tokens map[string]map[string]*consulapi.ACLToken` | `error` | [L299](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L299) |
| `newResourcesBackend` | - | `allocID string, hr *cstructs.AllocHookResources, db cstate.StateDB` | `*resourcesBackend` | [L333](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L333) |
| `decodeACLToken` | - | `b64ACLToken string, token *consulapi.ACLToken` | `error` | [L341](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L341) |
| `encodeACLToken` | - | `token *consulapi.ACLToken` | `string, error` | [L356](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L356) |
| `loadAllocTokens` | `rs *resourcesBackend` | `` | `map[string]map[string]*consulapi.ACLToken, error` | [L366](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L366) |
| `setConsulTokens` | `rs *resourcesBackend` | `m map[string]map[string]*consulapi.ACLToken` | `error` | [L394](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L394) |
| `getConsulTokens` | `rs *resourcesBackend` | `` | `map[string]map[string]*consulapi.ACLToken` | [L419](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L419) |

## 5. 核心方法详解

### Shutdown()

**签名**：`func (h *consulHook) Shutdown() `

**位置**：[L282](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L282)

**中文说明**：关闭对象，释放相关资源。

### Destroy()

**签名**：`func (h *consulHook) Destroy() error`

**位置**：[L288](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L288)

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `encoding/base64` | 标准库 |
| `encoding/json` | 标准库 |
| `fmt` | 标准库 |
| `github.com/hashicorp/nomad/client/allocdir` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/consul` | 内部包 |
| `github.com/hashicorp/nomad/client/state` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/client/widmgr` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs/config` | 内部包 |
| `github.com/hashicorp/consul/api` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [consul_hook_test.go](file:///d:/claude/nomad/client/allocrunner/consul_hook_test.go) | 对应测试文件 |
| [alloc_runner.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go) | 同目录源文件 |
| [alloc_runner_ce.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_ce.go) | 同目录源文件 |
| [alloc_runner_hooks.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_hooks.go) | 同目录源文件 |
| [allocdir_hook.go](file:///d:/claude/nomad/client/allocrunner/allocdir_hook.go) | 同目录源文件 |
| [checks_hook.go](file:///d:/claude/nomad/client/allocrunner/checks_hook.go) | 同目录源文件 |

