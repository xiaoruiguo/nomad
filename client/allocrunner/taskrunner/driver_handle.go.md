# driver_handle.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/driver_handle.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go)
> 总行数：127 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### DriverHandle

**定义位置**：[L35](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L35)

**类型**：struct

```go
	driver drivers.DriverPlugin
	net *drivers.DriverNetwork
	taskID string
	killSignal string
	killTimeout time.Duration
```

**关联方法**（9 个）：`ID`, `WaitCh`, `SetKillSignal`, `Kill`, `Stats`, `Signal`, `Exec`, `ExecStreaming`, `Network`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewDriverHandle` | - | `driver drivers.DriverPlugin, taskID string, task *structs.Task, maxKillTimeo...` | `*DriverHandle` | [L18](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L18) |
| `ID` | `h *DriverHandle` | - | `string` | [L43](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L43) |
| `WaitCh` | `h *DriverHandle` | `ctx context.Context` | `chan *drivers.ExitResult, error` | [L47](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L47) |
| `SetKillSignal` | `h *DriverHandle` | `signal string` | - | [L52](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L52) |
| `Kill` | `h *DriverHandle` | - | `error` | [L56](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L56) |
| `Stats` | `h *DriverHandle` | `ctx context.Context, interval time.Duration` | `chan *cstructs.TaskResourceUsage, error` | [L60](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L60) |
| `Signal` | `h *DriverHandle` | `s string` | `error` | [L64](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L64) |
| `Exec` | `h *DriverHandle` | `timeout time.Duration, cmd string, args []string` | `[]byte, int, error` | [L69](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L69) |
| `ExecStreaming` | `h *DriverHandle` | `ctx context.Context, command []string, tty bool, stream drivers.ExecTaskStream` | `error` | [L83](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L83) |
| `Network` | `h *DriverHandle` | - | `*drivers.DriverNetwork` | [L124](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L124) |

## 5. 核心方法详解

### Signal()

**签名**：`func (h *DriverHandle) Signal(s string) error`

**位置**：[L64](file:///d:/claude/nomad/client/allocrunner/taskrunner/driver_handle.go#L64)

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

## 8. 相关文件

| 文件 | 关系 |
|------|------|

