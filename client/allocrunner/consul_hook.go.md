# consul_hook.go 代码说明文档

> 文件路径：[allocrunner/consul_hook.go](file:///d:/claude/nomad/client/allocrunner/consul_hook.go)
> 总行数：422 行
> 所属包：`allocrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），实现分配（Allocation）的运行生命周期管理，包括预启动钩子、网络配置、Consul 集成、CSI 卷挂载、健康检查等。AllocRunner 是 Client 节点上每个分配的控制器。

## 2. 类型定义

### consulHook

**定义位置**：[L26](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L26)

**类型**：struct

```go
	alloc *structs.Allocation
	allocdir allocdir.Interface
	widmgr widmgr.IdentityManager
	consulConfigs map[string]*structsc.ConsulConfig
	consulClientConstructor consul.ConsulClientFunc
	resourcesBackend *resourcesBackend
	logger log.Logger
	shutdownCtx context.Context
	shutdownCancelFn context.CancelFunc
```

**关联方法**（10 个）：`Name`, `Prerun`, `prepareConsulTokensForTask`, `prepareConsulTokensForServices`, `getConsulToken`, `clientForCluster`, `Postrun`, `Shutdown`, `Destroy`, `revokeTokens`

### consulHookConfig

**定义位置**：[L39](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L39)

**类型**：struct

```go
	alloc *structs.Allocation
	allocdir allocdir.Interface
	widmgr widmgr.IdentityManager
	db cstate.StateDB
	consulConfigs map[string]*structsc.ConsulConfig
	consulClientConstructor consul.ConsulClientFunc
	hookResources *cstructs.AllocHookResources
	logger log.Logger
```

### resourcesBackend

**定义位置**：[L327](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L327)

**类型**：struct

```go
	allocID string
	hookResources *cstructs.AllocHookResources
	db cstate.StateDB
```

**关联方法**（3 个）：`loadAllocTokens`, `setConsulTokens`, `getConsulTokens`

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `_` | `(*consulHook)(nil)` |
| `_` | `(*consulHook)(nil)` |
| `_` | `(*consulHook)(nil)` |
| `_` | `(*consulHook)(nil)` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newConsulHook` | - | `cfg consulHookConfig` | `*consulHook` | [L57](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L57) |
| `Name` | ` *consulHook` | - | `string` | [L81](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L81) |
| `Prerun` | `h *consulHook` | `allocEnv *taskenv.TaskEnv` | `error` | [L85](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L85) |
| `prepareConsulTokensForTask` | `h *consulHook` | `task *structs.Task, tg *structs.TaskGroup, tokens map[string]map[string]*con...` | `error` | [L134](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L134) |
| `prepareConsulTokensForServices` | `h *consulHook` | `services []*structs.Service, tg *structs.TaskGroup, tokens map[string]map[st...` | `error` | [L192](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L192) |
| `getConsulToken` | `h *consulHook` | `cluster string, req consul.JWTLoginRequest` | `*consulapi.ACLToken, error` | [L253](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L253) |
| `clientForCluster` | `h *consulHook` | `cluster string` | `consul.Client, error` | [L267](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L267) |
| `Postrun` | `h *consulHook` | - | `error` | [L277](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L277) |
| `Shutdown` | `h *consulHook` | - | - | [L282](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L282) |
| `Destroy` | `h *consulHook` | - | `error` | [L288](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L288) |
| `revokeTokens` | `h *consulHook` | `tokens map[string]map[string]*consulapi.ACLToken` | `error` | [L299](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L299) |
| `newResourcesBackend` | - | `allocID string, hr *cstructs.AllocHookResources, db cstate.StateDB` | `*resourcesBackend` | [L333](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L333) |
| `decodeACLToken` | - | `b64ACLToken string, token *consulapi.ACLToken` | `error` | [L341](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L341) |
| `encodeACLToken` | - | `token *consulapi.ACLToken` | `string, error` | [L356](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L356) |
| `loadAllocTokens` | `rs *resourcesBackend` | - | `map[string]map[string]*consulapi.ACLToken, error` | [L366](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L366) |
| `setConsulTokens` | `rs *resourcesBackend` | `m map[string]map[string]*consulapi.ACLToken` | `error` | [L394](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L394) |
| `getConsulTokens` | `rs *resourcesBackend` | - | `map[string]map[string]*consulapi.ACLToken` | [L419](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L419) |

## 5. 核心方法详解

### Shutdown()

**签名**：`func (h *consulHook) Shutdown() `

**位置**：[L282](file:///d:/claude/nomad/client/allocrunner/consul_hook.go#L282)

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

- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [consul_hook_test.go](file:///d:/claude/nomad/client/allocrunner/consul_hook_test.go) | 对应测试文件 |

