# task_runner_getters.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/task_runner_getters.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go)
> 总行数：151 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Alloc` | `tr *TaskRunner` | - | `*structs.Allocation` | [L11](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L11) |
| `setAlloc` | `tr *TaskRunner` | `updated *structs.Allocation, task *structs.Task` | - | [L18](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L18) |
| `IsLeader` | `tr *TaskRunner` | - | `bool` | [L30](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L30) |
| `IsPoststopTask` | `tr *TaskRunner` | - | `bool` | [L35](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L35) |
| `IsSidecarTask` | `tr *TaskRunner` | - | `bool` | [L40](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L40) |
| `Task` | `tr *TaskRunner` | - | `*structs.Task` | [L44](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L44) |
| `TaskState` | `tr *TaskRunner` | - | `*structs.TaskState` | [L50](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L50) |
| `getVaultToken` | `tr *TaskRunner` | - | `string` | [L56](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L56) |
| `setVaultToken` | `tr *TaskRunner` | `token string` | - | [L65](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L65) |
| `getNomadToken` | `tr *TaskRunner` | - | `string` | [L82](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L82) |
| `setNomadToken` | `tr *TaskRunner` | `token string` | - | [L88](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L88) |
| `getDriverHandle` | `tr *TaskRunner` | - | `*DriverHandle` | [L99](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L99) |
| `setDriverHandle` | `tr *TaskRunner` | `handle *DriverHandle` | - | [L107](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L107) |
| `clearDriverHandle` | `tr *TaskRunner` | - | - | [L116](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L116) |
| `setKillErr` | `tr *TaskRunner` | `err error` | - | [L126](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L126) |
| `getKillErr` | `tr *TaskRunner` | - | `error` | [L133](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L133) |
| `hookState` | `tr *TaskRunner` | `name string` | `*state.HookState` | [L141](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_getters.go#L141) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Client 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|

