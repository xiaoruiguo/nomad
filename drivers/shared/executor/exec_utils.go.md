# exec_utils.go 代码说明文档

> 文件路径：[drivers/shared/executor/exec_utils.go](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go)
> 总行数：289 行
> 所属包：`executor`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **驱动共享工具子包**（`drivers/shared`），提供各任务驱动的共享功能，包括驱动事件处理、重启策略、执行器接口、网络配置、资源隔离和选择器逻辑等。

## 2. 类型定义

### execHelper

**定义位置**：[L21](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go#L21)

**类型**：struct

```go
	logger hclog.Logger
	newTerminal func(...)
	setTTY func(...)
	setIO func(...)
	processStart func(...)
	processWait func(...)
```

**关联方法**（3 个）：`run`, `runTTY`, `runNoTTY`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `run` | `e *execHelper` | `ctx context.Context, tty bool, stream drivers.ExecTaskStream` | `error` | [L41](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go#L41) |
| `runTTY` | `e *execHelper` | `ctx context.Context, stream drivers.ExecTaskStream` | `error` | [L48](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go#L48) |
| `runNoTTY` | `e *execHelper` | `ctx context.Context, stream drivers.ExecTaskStream` | `error` | [L95](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go#L95) |
| `cmdExitResult` | - | `ps *os.ProcessState, err error` | `*drivers.ExecTaskStreamingResponseMsg` | [L147](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go#L147) |
| `handleStdin` | - | `logger hclog.Logger, stdin io.WriteCloser, stream drivers.ExecTaskStream, er...` | - | [L175](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go#L175) |
| `handleStdout` | - | `logger hclog.Logger, reader io.Reader, wg *sync.WaitGroup, send func(...), e...` | - | [L206](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go#L206) |
| `handleStderr` | - | `logger hclog.Logger, reader io.Reader, wg *sync.WaitGroup, send func(...), e...` | - | [L243](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go#L243) |
| `isClosedError` | - | `err error` | `bool` | [L280](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go#L280) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `sync` | 标准库 |
| `syscall` | 标准库 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/proto` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|

