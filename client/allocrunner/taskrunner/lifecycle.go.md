# lifecycle.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/lifecycle.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go)
> 总行数：188 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Restart` | `tr *TaskRunner` | `ctx context.Context, event *structs.TaskEvent, failure bool` | `error` | [L17](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L17) |
| `ForceRestart` | `tr *TaskRunner` | `ctx context.Context, event *structs.TaskEvent, failure bool` | `error` | [L39](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L39) |
| `restartImpl` | `tr *TaskRunner` | `ctx context.Context, event *structs.TaskEvent, failure bool` | `error` | [L74](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L74) |
| `Exec` | `tr *TaskRunner` | `timeout time.Duration, cmd string, args []string` | `[]byte, int, error` | [L131](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L131) |
| `Signal` | `tr *TaskRunner` | `event *structs.TaskEvent, s string` | `error` | [L143](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L143) |
| `Kill` | `tr *TaskRunner` | `ctx context.Context, event *structs.TaskEvent` | `error` | [L163](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L163) |
| `IsRunning` | `tr *TaskRunner` | `` | `bool` | [L185](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L185) |

## 5. 核心方法详解

### Signal()

**签名**：`func (tr *TaskRunner) Signal(event *structs.TaskEvent, s string) error`

**位置**：[L143](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L143)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `event` | `*structs.TaskEvent` | 事件 |
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
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/errors` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go) | 同目录源文件 |
| [consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |

