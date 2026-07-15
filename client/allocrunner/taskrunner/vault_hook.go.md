# vault_hook.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/vault_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go)
> 总行数：537 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### vaultTokenUpdateHandler

**定义位置**：[L43](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L43)

**类型**：interface

```go
	updatedVaultToken
```

### vaultHookConfig

**定义位置**：[L55](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L55)

**类型**：struct

```go
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
```

### vaultHook

**定义位置**：[L68](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L68)

**类型**：struct

```go
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
```

**关联方法**（8 个）：`Name`, `Prestart`, `Stop`, `Shutdown`, `run`, `deriveVaultToken`, `deriveVaultTokenJWT`, `writeToken`

### tokenFuture

**定义位置**：[L479](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L479)

**类型**：struct

```go
	waiting []chan struct{...}
	token string
	set bool
	m sync.Mutex
```

**关联方法**（4 个）：`Wait`, `Set`, `Clear`, `Get`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `vaultBackoffBaseline` | `5 * time.Second` |
| `vaultBackoffLimit` | `3 * time.Minute` |
| `vaultTokenFile` | `"vault_token"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `updatedVaultToken` | `tr *TaskRunner` | `token string` | - | [L47](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L47) |
| `newVaultHook` | - | `config *vaultHookConfig` | `*vaultHook` | [L127](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L127) |
| `Name` | ` *vaultHook` | - | `string` | [L151](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L151) |
| `Prestart` | `h *vaultHook` | `ctx context.Context, req *interfaces.TaskPrestartRequest, resp *interfaces.T...` | `error` | [L155](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L155) |
| `Stop` | `h *vaultHook` | `ctx context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskS...` | `error` | [L213](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L213) |
| `Shutdown` | `h *vaultHook` | - | - | [L219](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L219) |
| `run` | `h *vaultHook` | `token string` | - | [L227](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L227) |
| `deriveVaultToken` | `h *vaultHook` | - | `string, int, bool` | [L365](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L365) |
| `deriveVaultTokenJWT` | `h *vaultHook` | - | `string, int, error` | [L405](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L405) |
| `writeToken` | `h *vaultHook` | `token string` | `error` | [L453](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L453) |
| `newTokenFuture` | - | - | `*tokenFuture` | [L487](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L487) |
| `Wait` | `f *tokenFuture` | - | `chan struct{...}` | [L493](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L493) |
| `Set` | `f *tokenFuture` | `token string` | `*tokenFuture` | [L508](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L508) |
| `Clear` | `f *tokenFuture` | - | `*tokenFuture` | [L522](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L522) |
| `Get` | `f *tokenFuture` | - | `string` | [L532](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L532) |

## 5. 核心方法详解

### Stop()

**签名**：`func (h *vaultHook) Stop(ctx context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskStopResponse) error`

**位置**：[L213](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L213)

### Shutdown()

**签名**：`func (h *vaultHook) Shutdown() `

**位置**：[L219](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L219)

### Wait()

**签名**：`func (f *tokenFuture) Wait() chan struct{...}`

**位置**：[L493](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L493)

### Get()

**签名**：`func (f *tokenFuture) Get() string`

**位置**：[L532](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook.go#L532)

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
- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [vault_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/vault_hook_test.go) | 对应测试文件 |

