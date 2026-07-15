# api_hook.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go)
> 总行数：123 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### apiHook

**定义位置**：[L33](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go#L33)

**类型**：struct

```go
	shutdownCtx context.Context
	srv config.APIListenerRegistrar
	logger hclog.Logger
	lock sync.Mutex
	ln net.Listener
```

**关联方法**（3 个）：`Name`, `Prestart`, `Stop`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newAPIHook` | - | `shutdownCtx context.Context, srv config.APIListenerRegistrar, logger hclog.L...` | `*apiHook` | [L45](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go#L45) |
| `Name` | ` *apiHook` | - | `string` | [L54](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go#L54) |
| `Prestart` | `h *apiHook` | `_ context.Context, req *interfaces.TaskPrestartRequest, resp *interfaces.Tas...` | `error` | [L58](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go#L58) |
| `Stop` | `h *apiHook` | `ctx context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskS...` | `error` | [L93](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go#L93) |
| `apiSocketPath` | - | `taskDir *allocdir.TaskDir` | `string` | [L120](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go#L120) |

## 5. 核心方法详解

### Stop()

**签名**：`func (h *apiHook) Stop(ctx context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskStopResponse) error`

**位置**：[L93](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go#L93)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `net` | 标准库 |
| `net/http` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/client/allocdir` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/config` | 内部包 |
| `github.com/hashicorp/nomad/helper/users` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook_test.go) | 对应测试文件 |

