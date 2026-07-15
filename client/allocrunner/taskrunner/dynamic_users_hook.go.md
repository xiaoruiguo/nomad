# dynamic_users_hook.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/dynamic_users_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/dynamic_users_hook.go)
> 总行数：125 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### dynamicUsersHook

**定义位置**：[L24](file:///d:/claude/nomad/client/allocrunner/taskrunner/dynamic_users_hook.go#L24)

**中文说明**：dynamicUsersHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：struct

```go
type dynamicUsersHook struct {
	shutdownCtx context.Context
	logger hclog.Logger
	usable bool
	lock *sync.Mutex
	pool dynamic.Pool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `shutdownCtx` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `logger` | `hclog.Logger` | 日志记录器 |
| `usable` | `bool` | 布尔值 |
| `lock` | `*sync.Mutex` | 互斥锁，保护并发访问 |
| `pool` | `dynamic.Pool` | — |

**关联方法**（3 个）：`Name`, `Prestart`, `Stop`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `dynamicUsersHookName` | `—` | `"workload_users"` | — |
| `dynamicUsersStateKey` | `—` | `"dynamic_user_ugid"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newDynamicUsersHook` | - | `ctx context.Context, usable bool, logger hclog.Logger, pool dynamic.Pool` | `*dynamicUsersHook` | [L33](file:///d:/claude/nomad/client/allocrunner/taskrunner/dynamic_users_hook.go#L33) |
| `Name` | ` *dynamicUsersHook` | `` | `string` | [L43](file:///d:/claude/nomad/client/allocrunner/taskrunner/dynamic_users_hook.go#L43) |
| `Prestart` | `h *dynamicUsersHook` | `_ context.Context, request *interfaces.TaskPrestartRequest, response *interfa...` | `error` | [L48](file:///d:/claude/nomad/client/allocrunner/taskrunner/dynamic_users_hook.go#L48) |
| `Stop` | `h *dynamicUsersHook` | `_ context.Context, request *interfaces.TaskStopRequest, response *interfaces....` | `error` | [L95](file:///d:/claude/nomad/client/allocrunner/taskrunner/dynamic_users_hook.go#L95) |

## 5. 核心方法详解

### Stop()

**签名**：`func (h *dynamicUsersHook) Stop(_ context.Context, request *interfaces.TaskStopRequest, response *interfaces.TaskStopResponse) error`

**位置**：[L95](file:///d:/claude/nomad/client/allocrunner/taskrunner/dynamic_users_hook.go#L95)

**中文说明**：停止对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `_` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `request` | `*interfaces.TaskStopRequest` | 请求 |
| `response` | `*interfaces.TaskStopResponse` | 响应 |

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
| `github.com/hashicorp/nomad/helper/users/dynamic` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [dynamic_users_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/dynamic_users_hook_test.go) | 对应测试文件 |
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go) | 同目录源文件 |
| [consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |

