# executor_universal_linux.go 代码说明文档

> 文件路径：[drivers/shared/executor/executor_universal_linux.go](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go)
> 总行数：298 行
> 所属包：`executor`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0
> Build Tag：`linux`

---

## 1. 文件定位与核心职责

该文件属于 **驱动共享工具子包**（`drivers/shared`），提供各任务驱动的共享功能，包括驱动事件处理、重启策略、执行器接口、网络配置、资源隔离和选择器逻辑等。

**平台特定实现**：此文件为 **Linux** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

### runningFunc

**定义位置**：[L77](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go#L77)

**类型定义**：`func(...)`

### cleanupFunc

**定义位置**：[L83](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go#L83)

**类型定义**：`func(...)`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `setSubCmdCgroup` | `e *UniversalExecutor` | `cmd *exec.Cmd, cgroup string` | `func(...), error` | [L26](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go#L26) |
| `ListProcesses` | `e *UniversalExecutor` | - | `set.Collection[procstats.ProcessID]` | [L55](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go#L55) |
| `statCG` | `e *UniversalExecutor` | `cgroup string` | `int, func(...), error` | [L65](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go#L65) |
| `configureResourceContainer` | `e *UniversalExecutor` | `command *ExecCommand, pid int` | `runningFunc, cleanupFunc, error` | [L89](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go#L89) |
| `enterCG1` | `e *UniversalExecutor` | `statsCgroup string, cpusetCgroup string` | `runningFunc, cleanupFunc` | [L143](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go#L143) |
| `configureCG1` | `e *UniversalExecutor` | `cgroup string, command *ExecCommand` | `error` | [L181](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go#L181) |
| `configureCG2` | `e *UniversalExecutor` | `cgroup string, command *ExecCommand` | - | [L233](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go#L233) |
| `setOomAdj` | `e *UniversalExecutor` | `oomScore int32` | `error` | [L270](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go#L270) |
| `computeCPU` | ` *UniversalExecutor` | `command *ExecCommand` | `uint64` | [L276](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go#L276) |
| `withNetworkIsolation` | - | `f func(...), spec *drivers.NetworkIsolationSpec` | `error` | [L283](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go#L283) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `strconv` | 标准库 |
| `syscall` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cgroupslib` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/nsutil` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/executor/procstats` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/opencontainers/cgroups` | 第三方库 |
| `golang.org/x/sys/unix` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **平台特定实现**：通过 build tag 机制实现 Linux 平台支持
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [executor_universal_linux_test.go](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux_test.go) | 对应测试文件 |

