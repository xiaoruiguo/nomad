# identity_hook.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/identity_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go)
> 总行数：264 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### tokenSetter

**定义位置**：[L35](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go#L35)

**类型**：interface

```go
	setNomadToken
```

### identityHook

**定义位置**：[L39](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go#L39)

**类型**：struct

```go
	alloc *structs.Allocation
	task *structs.Task
	taskDir *allocdir.TaskDir
	envBuilder *taskenv.Builder
	lifecycle ti.TaskLifecycle
	ts tokenSetter
	widmgr widmgr.IdentityManager
	logger log.Logger
	stopCtx context.Context
	stop context.CancelFunc
```

**关联方法**（8 个）：`Name`, `Prestart`, `watchIdentity`, `signalTask`, `setDefaultToken`, `setAltToken`, `Stop`, `Shutdown`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `wiTokenFile` | `"nomad_token"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newIdentityHook` | - | `tr *TaskRunner, logger log.Logger` | `*identityHook` | [L53](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go#L53) |
| `Name` | ` *identityHook` | - | `string` | [L70](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go#L70) |
| `Prestart` | `h *identityHook` | `ctx context.Context, _ *interfaces.TaskPrestartRequest, _ *interfaces.TaskPr...` | `error` | [L74](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go#L74) |
| `watchIdentity` | `h *identityHook` | `wid *structs.WorkloadIdentity, runCh chan struct{...}` | - | [L117](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go#L117) |
| `signalTask` | `h *identityHook` | `wid *structs.WorkloadIdentity` | `error` | [L196](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go#L196) |
| `setDefaultToken` | `h *identityHook` | - | `error` | [L210](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go#L210) |
| `setAltToken` | `h *identityHook` | `widspec *structs.WorkloadIdentity, rawJWT string` | `error` | [L236](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go#L236) |
| `Stop` | `h *identityHook` | `context.Context, *interfaces.TaskStopRequest, *interfaces.TaskStopResponse` | `error` | [L255](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go#L255) |
| `Shutdown` | `h *identityHook` | - | - | [L261](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go#L261) |

## 5. 核心方法详解

### Stop()

**签名**：`func (h *identityHook) Stop(context.Context, *interfaces.TaskStopRequest, *interfaces.TaskStopResponse) error`

**位置**：[L255](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go#L255)

### Shutdown()

**签名**：`func (h *identityHook) Shutdown() `

**位置**：[L261](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook.go#L261)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `path/filepath` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocdir` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/client/widmgr` | 内部包 |
| `github.com/hashicorp/nomad/helper/users` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/consul-template/signals` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [identity_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/identity_hook_test.go) | 对应测试文件 |

