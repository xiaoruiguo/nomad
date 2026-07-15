# driver_handle.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/driver_handle.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go)
> 总行数：127 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### DriverHandle

**定义位置**：[L35](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L35)

**中文说明**：DriverHandle 与任务驱动（Driver）相关，驱动负责任务的实际执行。

**类型**：struct

```go
type DriverHandle struct {
	driver drivers.DriverPlugin
	net *drivers.DriverNetwork
	taskID string
	killSignal string
	killTimeout time.Duration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `driver` | `drivers.DriverPlugin` | — |
| `net` | `*drivers.DriverNetwork` | — |
| `taskID` | `string` | 字符串 |
| `killSignal` | `string` | 字符串 |
| `killTimeout` | `time.Duration` | 时间间隔 |

**关联方法**（9 个）：`ID`, `WaitCh`, `SetKillSignal`, `Kill`, `Stats`, `Signal`, `Exec`, `ExecStreaming`, `Network`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewDriverHandle` | - | `driver drivers.DriverPlugin, taskID string, task *structs.Task, maxKillTimeou...` | `*DriverHandle` | [L18](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L18) |
| `ID` | `h *DriverHandle` | `` | `string` | [L43](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L43) |
| `WaitCh` | `h *DriverHandle` | `ctx context.Context` | `<-chan *drivers.ExitResult, error` | [L47](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L47) |
| `SetKillSignal` | `h *DriverHandle` | `signal string` | `` | [L52](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L52) |
| `Kill` | `h *DriverHandle` | `` | `error` | [L56](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L56) |
| `Stats` | `h *DriverHandle` | `ctx context.Context, interval time.Duration` | `<-chan *cstructs.TaskResourceUsage, error` | [L60](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L60) |
| `Signal` | `h *DriverHandle` | `s string` | `error` | [L64](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L64) |
| `Exec` | `h *DriverHandle` | `timeout time.Duration, cmd string, args []string` | `[]byte, int, error` | [L69](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L69) |
| `ExecStreaming` | `h *DriverHandle` | `ctx context.Context, command []string, tty bool, stream drivers.ExecTaskStream` | `error` | [L83](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L83) |
| `Network` | `h *DriverHandle` | `` | `*drivers.DriverNetwork` | [L124](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L124) |

## 5. 核心方法详解

### NewDriverHandle()

**签名**：`func NewDriverHandle(driver drivers.DriverPlugin, taskID string, task *structs.Task, maxKillTimeout time.Duration, net *drivers.DriverNetwork) *DriverHandle`

**位置**：[L18](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L18)

**中文说明**：创建并返回一个新的 DriverHandle 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `driver` | `drivers.DriverPlugin` | — |
| `taskID` | `string` | 字符串 |
| `task` | `*structs.Task` | — |
| `maxKillTimeout` | `time.Duration` | 时间间隔 |
| `net` | `*drivers.DriverNetwork` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DriverHandle` | — |

### Stats()

**签名**：`func (h *DriverHandle) Stats(ctx context.Context, interval time.Duration) <-chan *cstructs.TaskResourceUsage, error`

**位置**：[L60](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L60)

**中文说明**：返回对象的统计信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `interval` | `time.Duration` | 时间间隔 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `<-chan *cstructs.TaskResourceUsage` | 通道 |
| `error` | 错误信息 |

### Signal()

**签名**：`func (h *DriverHandle) Signal(s string) error`

**位置**：[L64](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L64)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `s` | `string` | 字符串 |

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
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/errors` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go) | 同目录源文件 |
| [consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |

