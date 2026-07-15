# executor_basic.go 代码说明文档

> 文件路径：[drivers/shared/executor/executor_basic.go](file:///d:/claude/nomad/drivers/shared/executor/executor_basic.go)
> 总行数：45 行
> 所属包：`executor`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0
> Build Tag：`!linux && !windows`

---

## 1. 文件定位与核心职责

该文件属于 **驱动共享工具子包**（`drivers/shared`），提供各任务驱动的共享功能，包括驱动事件处理、重启策略、执行器接口、网络配置、资源隔离和选择器逻辑等。

**构建标签**：`!linux && !windows`

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewExecutorWithIsolation` | - | `logger hclog.Logger, compute cpustats.Compute` | `Executor` | [L18](file:///d:/claude/nomad/drivers/shared/executor/executor_basic.go#L18) |
| `configureResourceContainer` | `e *UniversalExecutor` | `_ *ExecCommand, _ int` | `func(...), func(...), error` | [L24](file:///d:/claude/nomad/drivers/shared/executor/executor_basic.go#L24) |
| `start` | `e *UniversalExecutor` | `command *ExecCommand` | `error` | [L30](file:///d:/claude/nomad/drivers/shared/executor/executor_basic.go#L30) |
| `withNetworkIsolation` | - | `f func(...), _ *drivers.NetworkIsolationSpec` | `error` | [L34](file:///d:/claude/nomad/drivers/shared/executor/executor_basic.go#L34) |
| `ListProcesses` | `e *UniversalExecutor` | - | `set.Collection[int]` | [L38](file:///d:/claude/nomad/drivers/shared/executor/executor_basic.go#L38) |
| `setSubCmdCgroup` | `e *UniversalExecutor` | `*exec.Cmd, string` | `func(...), error` | [L42](file:///d:/claude/nomad/drivers/shared/executor/executor_basic.go#L42) |

## 5. 核心方法详解

### NewExecutorWithIsolation()

**签名**：`func NewExecutorWithIsolation(logger hclog.Logger, compute cpustats.Compute) Executor`

**位置**：[L18](file:///d:/claude/nomad/drivers/shared/executor/executor_basic.go#L18)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `os/exec` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cpustats` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/executor/procstats` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|

