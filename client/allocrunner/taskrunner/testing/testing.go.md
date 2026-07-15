# testing.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/testing/testing.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go)
> 总行数：162 行
> 所属包：`testing`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器测试工具子包**（`client/allocrunner/taskrunner/testing`），提供任务运行器的测试辅助工具。

## 2. 类型定义

### MockEmitter

**定义位置**：[L15](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L15)

**类型**：struct

```go
	lock sync.Mutex
	events []*structs.TaskEvent
```

**关联方法**（2 个）：`EmitEvent`, `Events`

### MockTaskHooks

**定义位置**：[L33](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L33)

**类型**：struct

```go
	lock sync.Mutex
	RestartCh chan struct{...}
	restarts int
	SignalCh chan struct{...}
	signals []string
	SignalError error
	UnblockCh chan struct{...}
	KillCh chan *structs.TaskEvent
	killEvent *structs.TaskEvent
	EmitEventCh chan *structs.TaskEvent
	events []*structs.TaskEvent
	execCode int
	execErr error
	HasHandle bool
```

**关联方法**（12 个）：`Restart`, `Signal`, `Signals`, `Kill`, `Exec`, `SetupExecTest`, `IsRunning`, `EmitEvent`, `SetState`, `KillEvent`, `Events`, `Restarts`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `EmitEvent` | `m *MockEmitter` | `ev *structs.TaskEvent` | - | [L20](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L20) |
| `Events` | `m *MockEmitter` | - | `[]*structs.TaskEvent` | [L26](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L26) |
| `NewMockTaskHooks` | - | - | `*MockTaskHooks` | [L60](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L60) |
| `Restart` | `m *MockTaskHooks` | `ctx context.Context, event *structs.TaskEvent, failure bool` | `error` | [L69](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L69) |
| `Signal` | `m *MockTaskHooks` | `event *structs.TaskEvent, s string` | `error` | [L81](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L81) |
| `Signals` | `m *MockTaskHooks` | - | `[]string` | [L94](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L94) |
| `Kill` | `m *MockTaskHooks` | `ctx context.Context, event *structs.TaskEvent` | `error` | [L100](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L100) |
| `Exec` | `m *MockTaskHooks` | `timeout time.Duration, cmd string, args []string` | `[]byte, int, error` | [L112](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L112) |
| `SetupExecTest` | `m *MockTaskHooks` | `code int, err error` | - | [L119](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L119) |
| `IsRunning` | `m *MockTaskHooks` | - | `bool` | [L127](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L127) |
| `EmitEvent` | `m *MockTaskHooks` | `event *structs.TaskEvent` | - | [L131](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L131) |
| `SetState` | `m *MockTaskHooks` | `state string, event *structs.TaskEvent` | - | [L143](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L143) |
| `KillEvent` | `m *MockTaskHooks` | - | `*structs.TaskEvent` | [L145](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L145) |
| `Events` | `m *MockTaskHooks` | - | `[]*structs.TaskEvent` | [L151](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L151) |
| `Restarts` | `m *MockTaskHooks` | - | `int` | [L157](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L157) |

## 5. 核心方法详解

### Restart()

**签名**：`func (m *MockTaskHooks) Restart(ctx context.Context, event *structs.TaskEvent, failure bool) error`

**位置**：[L69](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L69)

### Signal()

**签名**：`func (m *MockTaskHooks) Signal(event *structs.TaskEvent, s string) error`

**位置**：[L81](file:///d:/claude/nomad/client/allocrunner/taskrunner/testing/testing.go#L81)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|

