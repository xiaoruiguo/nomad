# handle.go 代码说明文档

> 文件路径：[drivers/mock/handle.go](file:///d:/claude/nomad/drivers/mock/handle.go)
> 总行数：101 行
> 所属包：`mock`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Mock 驱动子包**（`drivers/mock`），实现 Nomad 的模拟驱动，用于测试和开发，模拟任务执行的各种状态和行为（成功、失败、日志等）。

## 2. 类型定义

### taskHandle

**定义位置**：[L17](file:///d:/claude/nomad/drivers/mock/handle.go#L17)

**中文说明**：taskHandle 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type taskHandle struct {
	logger hclog.Logger
	pluginExitAfter time.Duration
	killAfter time.Duration
	waitCh chan interface{}
	taskConfig *drivers.TaskConfig
	command Command
	execCommand *Command
	stateLock sync.RWMutex
	procState drivers.TaskState
	startedAt time.Time
	completedAt time.Time
	exitResult *drivers.ExitResult
	kill context.CancelFunc
	killCh <-chan struct{...}
	Recovered bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `pluginExitAfter` | `time.Duration` | 时间间隔 |
| `killAfter` | `time.Duration` | 时间间隔 |
| `waitCh` | `chan interface{}` | 通道 |
| `taskConfig` | `*drivers.TaskConfig` | — |
| `command` | `Command` | — |
| `execCommand` | `*Command` | — |
| `stateLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |
| `procState` | `drivers.TaskState` | — |
| `startedAt` | `time.Time` | 时间点 |
| `completedAt` | `time.Time` | 时间点 |
| `exitResult` | `*drivers.ExitResult` | — |
| `kill` | `context.CancelFunc` | 取消函数，用于取消上下文 |
| `killCh` | `<-chan struct{...}` | 信号通道 |
| `Recovered` | `bool` | 布尔值 |

**关联方法**（3 个）：`TaskStatus`, `IsRunning`, `run`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `TaskStatus` | `h *taskHandle` | `` | `*drivers.TaskStatus` | [L44](file:///d:/claude/nomad/drivers/mock/handle.go#L44) |
| `IsRunning` | `h *taskHandle` | `` | `bool` | [L59](file:///d:/claude/nomad/drivers/mock/handle.go#L59) |
| `run` | `h *taskHandle` | `` | `` | [L65](file:///d:/claude/nomad/drivers/mock/handle.go#L65) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/fifo` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [command.go](file:///d:/claude/nomad/drivers/mock/command.go) | 同目录源文件 |
| [driver.go](file:///d:/claude/nomad/drivers/mock/driver.go) | 同目录源文件 |
| [state.go](file:///d:/claude/nomad/drivers/mock/state.go) | 同目录源文件 |
| [utils.go](file:///d:/claude/nomad/drivers/mock/utils.go) | 同目录源文件 |

