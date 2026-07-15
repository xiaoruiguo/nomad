# handle.go 代码说明文档

> 文件路径：[drivers/qemu/handle.go](file:///d:/claude/nomad/drivers/qemu/handle.go)
> 总行数：83 行
> 所属包：`qemu`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **QEMU 驱动子包**（`drivers/qemu`），实现 Nomad 的 QEMU 任务驱动，通过 QEMU 虚拟机运行镜像文件，支持端口映射和资源限制。

## 2. 类型定义

### taskHandle

**定义位置**：[L18](file:///d:/claude/nomad/drivers/qemu/handle.go#L18)

**中文说明**：taskHandle 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type taskHandle struct {
	exec executor.Executor
	pid int
	pluginClient *plugin.Client
	logger hclog.Logger
	monitorPath string
	stateLock sync.RWMutex
	taskConfig *drivers.TaskConfig
	procState drivers.TaskState
	startedAt time.Time
	completedAt time.Time
	exitResult *drivers.ExitResult
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `exec` | `executor.Executor` | — |
| `pid` | `int` | — |
| `pluginClient` | `*plugin.Client` | — |
| `logger` | `hclog.Logger` | 日志记录器 |
| `monitorPath` | `string` | 字符串 |
| `stateLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |
| `taskConfig` | `*drivers.TaskConfig` | — |
| `procState` | `drivers.TaskState` | — |
| `startedAt` | `time.Time` | 时间点 |
| `completedAt` | `time.Time` | 时间点 |
| `exitResult` | `*drivers.ExitResult` | — |

**关联方法**（3 个）：`TaskStatus`, `IsRunning`, `run`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `TaskStatus` | `h *taskHandle` | `` | `*drivers.TaskStatus` | [L35](file:///d:/claude/nomad/drivers/qemu/handle.go#L35) |
| `IsRunning` | `h *taskHandle` | `` | `bool` | [L52](file:///d:/claude/nomad/drivers/qemu/handle.go#L52) |
| `run` | `h *taskHandle` | `` | `` | [L58](file:///d:/claude/nomad/drivers/qemu/handle.go#L58) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `strconv` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/drivers/shared/executor` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-plugin` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **插件架构**：使用 `go-plugin` 框架实现插件化扩展
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [driver.go](file:///d:/claude/nomad/drivers/qemu/driver.go) | 同目录源文件 |
| [driver_bsd.go](file:///d:/claude/nomad/drivers/qemu/driver_bsd.go) | 同目录源文件 |
| [driver_fallback.go](file:///d:/claude/nomad/drivers/qemu/driver_fallback.go) | 同目录源文件 |
| [driver_linux.go](file:///d:/claude/nomad/drivers/qemu/driver_linux.go) | 同目录源文件 |
| [state.go](file:///d:/claude/nomad/drivers/qemu/state.go) | 同目录源文件 |

