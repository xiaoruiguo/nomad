# logmon_hook.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/logmon_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go)
> 总行数：249 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### logmonHook

**定义位置**：[L34](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go#L34)

**类型**：struct

```go
	runner *TaskRunner
	logmon logmon.LogMon
	logmonPluginClient *plugin.Client
	config *logmonHookConfig
	logger hclog.Logger
```

**关联方法**（7 个）：`Name`, `launchLogMon`, `Prestart`, `isLoggingDisabled`, `prestartOneLoop`, `Stop`, `reattach`

### logmonHookConfig

**定义位置**：[L46](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go#L46)

**类型**：struct

```go
	logDir string
	disabled bool
	stdoutFifo string
	stderrFifo string
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `logmonReattachKey` | `"reattach_config"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newLogMonHook` | - | `tr *TaskRunner, logger hclog.Logger` | `*logmonHook` | [L53](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go#L53) |
| `newLogMonHookConfig` | - | `taskName string, logCfg *structs.LogConfig, logDir string` | `*logmonHookConfig` | [L63](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go#L63) |
| `Name` | ` *logmonHook` | - | `string` | [L87](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go#L87) |
| `launchLogMon` | `h *logmonHook` | `reattachConfig *plugin.ReattachConfig` | `error` | [L91](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go#L91) |
| `reattachConfigFromHookData` | - | `data map[string]string` | `*plugin.ReattachConfig, error` | [L102](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go#L102) |
| `Prestart` | `h *logmonHook` | `ctx context.Context, req *interfaces.TaskPrestartRequest, resp *interfaces.T...` | `error` | [L116](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go#L116) |
| `isLoggingDisabled` | `h *logmonHook` | - | `bool` | [L153](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go#L153) |
| `prestartOneLoop` | `h *logmonHook` | `ctx context.Context, req *interfaces.TaskPrestartRequest` | `error` | [L168](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go#L168) |
| `Stop` | `h *logmonHook` | `_ context.Context, req *interfaces.TaskStopRequest, _ *interfaces.TaskStopRe...` | `error` | [L212](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go#L212) |
| `reattach` | `h *logmonHook` | `req *interfaces.TaskStopRequest` | `error` | [L236](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go#L236) |

## 5. 核心方法详解

### Stop()

**签名**：`func (h *logmonHook) Stop(_ context.Context, req *interfaces.TaskStopRequest, _ *interfaces.TaskStopResponse) error`

**位置**：[L212](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook.go#L212)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `encoding/json` | 标准库 |
| `fmt` | 标准库 |
| `google.golang.org/grpc/codes` | 标准库 |
| `google.golang.org/grpc/status` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `runtime` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/logmon` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-plugin` | 第三方库 |

## 7. 设计模式与技术特点

- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **gRPC 通信**：使用 gRPC 进行进程间通信
- **插件架构**：使用 `go-plugin` 框架实现插件化扩展

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [logmon_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/logmon_hook_test.go) | 对应测试文件 |

