# stats_hook.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/stats_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go)
> 总行数：194 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### StatsUpdater

**定义位置**：[L21](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L21)

**中文说明**：StatsUpdater 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type StatsUpdater interface {
	UpdateStats func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `UpdateStats` | `func(...)` | 更新指定的Stats。 |

### statsHook

**定义位置**：[L26](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L26)

**中文说明**：statsHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：struct

```go
type statsHook struct {
	updater StatsUpdater
	interval time.Duration
	cancel context.CancelFunc
	doPublish bool
	mu sync.Mutex
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `updater` | `StatsUpdater` | — |
| `interval` | `time.Duration` | 时间间隔 |
| `cancel` | `context.CancelFunc` | 取消 |
| `doPublish` | `bool` | 布尔值 |
| `mu` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（6 个）：`Name`, `Poststart`, `Exited`, `collectResourceUsageStats`, `callStatsWithRetry`, `Shutdown`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newStatsHook` | - | `su StatsUpdater, interval time.Duration, doPublish bool, logger hclog.Logger` | `*statsHook` | [L42](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L42) |
| `Name` | ` *statsHook` | `` | `string` | [L52](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L52) |
| `Poststart` | `h *statsHook` | `_ context.Context, req *interfaces.TaskPoststartRequest, _ *interfaces.TaskPo...` | `error` | [L56](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L56) |
| `Exited` | `h *statsHook` | `context.Context, *interfaces.TaskExitedRequest, *interfaces.TaskExitedResponse` | `error` | [L82](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L82) |
| `collectResourceUsageStats` | `h *statsHook` | `ctx context.Context, handle interfaces.DriverStats` | `` | [L102](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L102) |
| `callStatsWithRetry` | `h *statsHook` | `ctx context.Context, handle interfaces.DriverStats` | `<-chan *cstructs.TaskResourceUsage, error` | [L139](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L139) |
| `Shutdown` | `h *statsHook` | `` | `` | [L184](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L184) |

## 5. 核心方法详解

### Shutdown()

**签名**：`func (h *statsHook) Shutdown() `

**位置**：[L184](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook.go#L184)

**中文说明**：关闭对象，释放相关资源。

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
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [stats_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/stats_hook_test.go) | 对应测试文件 |
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go) | 同目录源文件 |
| [consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |

