# executor_windows.go 代码说明文档

> 文件路径：[drivers/shared/executor/executor_windows.go](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go)
> 总行数：196 行
> 所属包：`executor`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0
> Build Tag：`windows`

---

## 1. 文件定位与核心职责

该文件属于 **驱动共享工具子包**（`drivers/shared`），提供各任务驱动的共享功能，包括驱动事件处理、重启策略、执行器接口、网络配置、资源隔离和选择器逻辑等。

**平台特定实现**：此文件为 **Windows** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `_LOGON_SERVICE` | `uint32` | `5` | — |
| `_PROVIDER_DEFAULT` | `uint32` | `0` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `advapiDll` | `—` | `windows.NewLazySystemDLL("advapi32.dll")` | — |
| `procLogonUserW` | `—` | `advapiDll.NewProc("LogonUserW")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewExecutorWithIsolation` | - | `logger hclog.Logger, compute cpustats.Compute` | `Executor` | [L26](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go#L26) |
| `configureResourceContainer` | `e *UniversalExecutor` | `_ *ExecCommand, _ int` | `func(...), func(...), error` | [L32](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go#L32) |
| `start` | `e *UniversalExecutor` | `command *ExecCommand` | `error` | [L38](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go#L38) |
| `withNetworkIsolation` | - | `f func(...), _ *drivers.NetworkIsolationSpec` | `error` | [L42](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go#L42) |
| `setCmdUser` | - | `cmd *exec.Cmd, user string` | `error` | [L46](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go#L46) |
| `createUserToken` | - | `domain string, username string` | `*syscall.Token, error` | [L81](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go#L81) |
| `ListProcesses` | `e *UniversalExecutor` | `` | `set.Collection[int]` | [L106](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go#L106) |
| `setSubCmdCgroup` | `e *UniversalExecutor` | `*exec.Cmd, string` | `func(...), error` | [L110](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go#L110) |
| `setNewProcessGroup` | `e *UniversalExecutor` | `` | `error` | [L117](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go#L117) |
| `killProcessTree` | `e *UniversalExecutor` | `proc *os.Process` | `error` | [L155](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go#L155) |
| `sendCtrlBreak` | - | `pid int` | `error` | [L178](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go#L178) |
| `shutdownProcess` | `e *UniversalExecutor` | `_ os.Signal, proc *os.Process` | `error` | [L188](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go#L188) |

## 5. 核心方法详解

### NewExecutorWithIsolation()

**签名**：`func NewExecutorWithIsolation(logger hclog.Logger, compute cpustats.Compute) Executor`

**位置**：[L26](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go#L26)

**中文说明**：创建并返回一个新的 ExecutorWithIsolation 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `compute` | `cpustats.Compute` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `Executor` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `runtime` | 标准库 |
| `strings` | 标准库 |
| `syscall` | 标准库 |
| `unsafe` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cpustats` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/executor/procstats` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `golang.org/x/sys/windows` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **平台特定实现**：通过 build tag 机制实现 Windows 平台支持
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [executor_windows_test.go](file:///d:/claude/nomad/drivers/shared/executor/executor_windows_test.go) | 对应测试文件 |
| [exec_utils.go](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go) | 同目录源文件 |
| [executor.go](file:///d:/claude/nomad/drivers/shared/executor/executor.go) | 同目录源文件 |
| [executor_basic.go](file:///d:/claude/nomad/drivers/shared/executor/executor_basic.go) | 同目录源文件 |
| [executor_linux.go](file:///d:/claude/nomad/drivers/shared/executor/executor_linux.go) | 同目录源文件 |
| [executor_linux_cgo.go](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go) | 同目录源文件 |

