# stats_hook.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/stats_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go)
> 总行数：194 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### StatsUpdater

**定义位置**：[L21](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L21)

**类型**：interface

```go
	UpdateStats
```

### statsHook

**定义位置**：[L26](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L26)

**类型**：struct

```go
	updater StatsUpdater
	interval time.Duration
	cancel context.CancelFunc
	doPublish bool
	mu sync.Mutex
	logger hclog.Logger
```

**关联方法**（6 个）：`Name`, `Poststart`, `Exited`, `collectResourceUsageStats`, `callStatsWithRetry`, `Shutdown`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newStatsHook` | - | `su StatsUpdater, interval time.Duration, doPublish bool, logger hclog.Logger` | `*statsHook` | [L42](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L42) |
| `Name` | ` *statsHook` | - | `string` | [L52](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L52) |
| `Poststart` | `h *statsHook` | `_ context.Context, req *interfaces.TaskPoststartRequest, _ *interfaces.TaskP...` | `error` | [L56](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L56) |
| `Exited` | `h *statsHook` | `context.Context, *interfaces.TaskExitedRequest, *interfaces.TaskExitedResponse` | `error` | [L82](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L82) |
| `collectResourceUsageStats` | `h *statsHook` | `ctx context.Context, handle interfaces.DriverStats` | - | [L102](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L102) |
| `callStatsWithRetry` | `h *statsHook` | `ctx context.Context, handle interfaces.DriverStats` | `chan *cstructs.TaskResourceUsage, error` | [L139](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L139) |
| `Shutdown` | `h *statsHook` | - | - | [L184](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L184) |

## 5. 核心方法详解

### Shutdown()

**签名**：`func (h *statsHook) Shutdown() `

**位置**：[L184](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L184)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [stats_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook_test.go) | 对应测试文件 |

