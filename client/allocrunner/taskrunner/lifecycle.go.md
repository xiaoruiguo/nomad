# lifecycle.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/lifecycle.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go)
> 总行数：188 行
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
| `Restart` | `tr *TaskRunner` | `ctx context.Context, event *structs.TaskEvent, failure bool` | `error` | [L17](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L17) |
| `ForceRestart` | `tr *TaskRunner` | `ctx context.Context, event *structs.TaskEvent, failure bool` | `error` | [L39](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L39) |
| `restartImpl` | `tr *TaskRunner` | `ctx context.Context, event *structs.TaskEvent, failure bool` | `error` | [L74](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L74) |
| `Exec` | `tr *TaskRunner` | `timeout time.Duration, cmd string, args []string` | `[]byte, int, error` | [L131](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L131) |
| `Signal` | `tr *TaskRunner` | `event *structs.TaskEvent, s string` | `error` | [L143](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L143) |
| `Kill` | `tr *TaskRunner` | `ctx context.Context, event *structs.TaskEvent` | `error` | [L163](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L163) |
| `IsRunning` | `tr *TaskRunner` | - | `bool` | [L185](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L185) |

## 5. 核心方法详解

### Restart()

**签名**：`func (tr *TaskRunner) Restart(ctx context.Context, event *structs.TaskEvent, failure bool) error`

**位置**：[L17](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L17)

### Signal()

**签名**：`func (tr *TaskRunner) Signal(event *structs.TaskEvent, s string) error`

**位置**：[L143](file:///d:/claude/nomad/client/allocrunner/taskrunner/lifecycle.go#L143)

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

