# vault_hook.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/vault_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go)
> 总行数：537 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### vaultTokenUpdateHandler

**定义位置**：[L43](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L43)

**中文说明**：vaultTokenUpdateHandler 是一个处理器，处理特定类型的事件或请求。

**类型**：interface

```go
type vaultTokenUpdateHandler interface {
	updatedVaultToken func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `updatedVaultToken` | `func(...)` | 更新指定的dVaultToken。 |

### vaultHookConfig

**定义位置**：[L55](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L55)

**中文说明**：vaultHookConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type vaultHookConfig struct {
	vaultBlock *structs.Vault
	vaultConfigsFunc func(...)
	clientFunc vaultclient.VaultClientFunc
	events ti.EventEmitter
	lifecycle ti.TaskLifecycle
	updater vaultTokenUpdateHandler
	logger log.Logger
	alloc *structs.Allocation
	task *structs.Task
	widmgr widmgr.IdentityManager
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `vaultBlock` | `*structs.Vault` | 互斥锁，保护并发访问 |
| `vaultConfigsFunc` | `func(...)` | — |
| `clientFunc` | `vaultclient.VaultClientFunc` | — |
| `events` | `ti.EventEmitter` | — |
| `lifecycle` | `ti.TaskLifecycle` | — |
| `updater` | `vaultTokenUpdateHandler` | — |
| `logger` | `log.Logger` | 日志记录器 |
| `alloc` | `*structs.Allocation` | — |
| `task` | `*structs.Task` | — |
| `widmgr` | `widmgr.IdentityManager` | — |

### vaultHook

**定义位置**：[L68](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L68)

**中文说明**：vaultHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：struct

```go
type vaultHook struct {
	vaultBlock *structs.Vault
	vaultConfig *sconfig.VaultConfig
	vaultConfigsFunc func(...)
	eventEmitter ti.EventEmitter
	lifecycle ti.TaskLifecycle
	updater vaultTokenUpdateHandler
	client vaultclient.VaultClient
	clientFunc vaultclient.VaultClientFunc
	logger log.Logger
	ctx context.Context
	cancel context.CancelFunc
	privateDirTokenPath string
	secretsDirTokenPath string
	alloc *structs.Allocation
	task *structs.Task
	firstRun bool
	widmgr widmgr.IdentityManager
	widName string
	allowTokenExpiration bool
	future *tokenFuture
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `vaultBlock` | `*structs.Vault` | 互斥锁，保护并发访问 |
| `vaultConfig` | `*sconfig.VaultConfig` | — |
| `vaultConfigsFunc` | `func(...)` | — |
| `eventEmitter` | `ti.EventEmitter` | — |
| `lifecycle` | `ti.TaskLifecycle` | — |
| `updater` | `vaultTokenUpdateHandler` | — |
| `client` | `vaultclient.VaultClient` | — |
| `clientFunc` | `vaultclient.VaultClientFunc` | — |
| `logger` | `log.Logger` | 日志记录器 |
| `ctx` | `context.Context` | ctx 和 取消 are 用于 杀死 long 运行中的 令牌 管理器 |
| `cancel` | `context.CancelFunc` | 取消 |
| `privateDirTokenPath` | `string` | 字符串 |
| `secretsDirTokenPath` | `string` | 字符串 |
| `alloc` | `*structs.Allocation` | 分配 is 分配 |
| `task` | `*structs.Task` | — |
| `firstRun` | `bool` | 布尔值 |
| `widmgr` | `widmgr.IdentityManager` | — |
| `widName` | `string` | 字符串 |
| `allowTokenExpiration` | `bool` | 布尔值 |
| `future` | `*tokenFuture` | — |

**关联方法**（8 个）：`Name`, `Prestart`, `Stop`, `Shutdown`, `run`, `deriveVaultToken`, `deriveVaultTokenJWT`, `writeToken`

### tokenFuture

**定义位置**：[L479](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L479)

**中文说明**：tokenFuture 与令牌（Token）相关，用于身份认证。

**类型**：struct

```go
type tokenFuture struct {
	waiting []chan struct{...}
	token string
	set bool
	m sync.Mutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `waiting` | `[]chan struct{...}` | 信号通道 |
| `token` | `string` | 令牌，用于认证或标识 |
| `set` | `bool` | 布尔值 |
| `m` | `sync.Mutex` | 互斥锁，保护并发访问 |

**关联方法**（4 个）：`Wait`, `Set`, `Clear`, `Get`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `vaultBackoffBaseline` | `—` | `5 * time.Second` | — |
| `vaultBackoffLimit` | `—` | `3 * time.Minute` | — |
| `vaultTokenFile` | `—` | `"vault_token"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `updatedVaultToken` | `tr *TaskRunner` | `token string` | `` | [L47](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L47) |
| `newVaultHook` | - | `config *vaultHookConfig` | `*vaultHook` | [L127](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L127) |
| `Name` | ` *vaultHook` | `` | `string` | [L151](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L151) |
| `Prestart` | `h *vaultHook` | `ctx context.Context, req *interfaces.TaskPrestartRequest, resp *interfaces.Ta...` | `error` | [L155](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L155) |
| `Stop` | `h *vaultHook` | `ctx context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskSt...` | `error` | [L213](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L213) |
| `Shutdown` | `h *vaultHook` | `` | `` | [L219](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L219) |
| `run` | `h *vaultHook` | `token string` | `` | [L227](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L227) |
| `deriveVaultToken` | `h *vaultHook` | `` | `string, int, bool` | [L365](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L365) |
| `deriveVaultTokenJWT` | `h *vaultHook` | `` | `string, int, error` | [L405](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L405) |
| `writeToken` | `h *vaultHook` | `token string` | `error` | [L453](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L453) |
| `newTokenFuture` | - | `` | `*tokenFuture` | [L487](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L487) |
| `Wait` | `f *tokenFuture` | `` | `<-chan struct{...}` | [L493](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L493) |
| `Set` | `f *tokenFuture` | `token string` | `*tokenFuture` | [L508](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L508) |
| `Clear` | `f *tokenFuture` | `` | `*tokenFuture` | [L522](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L522) |
| `Get` | `f *tokenFuture` | `` | `string` | [L532](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L532) |

## 5. 核心方法详解

### Stop()

**签名**：`func (h *vaultHook) Stop(ctx context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskStopResponse) error`

**位置**：[L213](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L213)

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

### Shutdown()

**签名**：`func (h *vaultHook) Shutdown() `

**位置**：[L219](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L219)

**中文说明**：关闭对象，释放相关资源。

### Wait()

**签名**：`func (f *tokenFuture) Wait() <-chan struct{...}`

**位置**：[L493](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L493)

**返回值**：

| 类型 | 说明 |
|------|------|
| `<-chan struct{...}` | 信号通道 |

### Set()

**签名**：`func (f *tokenFuture) Set(token string) *tokenFuture`

**位置**：[L508](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L508)

**中文说明**：设置 设置 令牌 值 和 解除阻塞 任意 caller 的 等待

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `token` | `string` | 令牌，用于认证或标识 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*tokenFuture` | — |

### Get()

**签名**：`func (f *tokenFuture) Get() string`

**位置**：[L532](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L532)

**中文说明**：获取对象的信息。

**返回值**：

| 类型 | 说明 |
|------|------|
| `string` | 字符串 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `os` | 标准库 |
| `path` | 标准库 |
| `path/filepath` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/vaultclient` | 内部包 |
| `github.com/hashicorp/nomad/client/widmgr` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs/config` | 内部包 |
| `github.com/hashicorp/consul-template/signals` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [vault_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook_test.go) | 对应测试文件 |
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go) | 同目录源文件 |
| [consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |

