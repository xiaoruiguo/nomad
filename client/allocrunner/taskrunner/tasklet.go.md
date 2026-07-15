# tasklet.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/tasklet.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/tasklet.go)
> 总行数：162 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### contextExec

**定义位置**：[L17](file:///d:/claude/nomad/client/allocrunner/taskrunner/tasklet.go#L17)

**中文说明**：contextExec 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type contextExec struct {
	pctx context.Context
	exec interfaces.ScriptExecutor
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `pctx` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `exec` | `interfaces.ScriptExecutor` | — |

**关联方法**（1 个）：`Exec`

### execResult

**定义位置**：[L34](file:///d:/claude/nomad/client/allocrunner/taskrunner/tasklet.go#L34)

**中文说明**：execResult 是一个结果结构体，封装操作执行的结果。

**类型**：struct

```go
type execResult struct {
	output []byte
	code int
	err error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `output` | `[]byte` | 字节数组 |
| `code` | `int` | — |
| `err` | `error` | 错误信息 |

### tasklet

**定义位置**：[L69](file:///d:/claude/nomad/client/allocrunner/taskrunner/tasklet.go#L69)

**中文说明**：tasklet 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type tasklet struct {
	Command string
	Args []string
	Interval time.Duration
	Timeout time.Duration
	exec interfaces.ScriptExecutor
	callback taskletCallback
	logger log.Logger
	shutdownCh <-chan struct{...}
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Command` | `string` | 字符串 |
| `Args` | `[]string` | 参数 |
| `Interval` | `time.Duration` | 时间间隔 |
| `Timeout` | `time.Duration` | 超时时间 |
| `exec` | `interfaces.ScriptExecutor` | — |
| `callback` | `taskletCallback` | — |
| `logger` | `log.Logger` | 日志记录器 |
| `shutdownCh` | `<-chan struct{...}` | 关闭信号通道，当收到关闭信号时触发清理流程 |

**关联方法**（1 个）：`run`

### taskletHandle

**定义位置**：[L82](file:///d:/claude/nomad/client/allocrunner/taskrunner/tasklet.go#L82)

**中文说明**：taskletHandle 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type taskletHandle struct {
	cancel func(...)
	exitCh chan struct{...}
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `cancel` | `func(...)` | 取消 |
| `exitCh` | `chan struct{...}` | 信号通道 |

**关联方法**（1 个）：`wait`

### taskletCallback

**定义位置**：[L95](file:///d:/claude/nomad/client/allocrunner/taskrunner/tasklet.go#L95)

**中文说明**：taskletCallback 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型定义**：`type taskletCallback func(...)`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newContextExec` | - | `ctx context.Context, exec interfaces.ScriptExecutor` | `*contextExec` | [L26](file:///d:/claude/nomad/client/allocrunner/taskrunner/tasklet.go#L26) |
| `Exec` | `c *contextExec` | `timeout time.Duration, cmd string, args []string` | `[]byte, int, error` | [L42](file:///d:/claude/nomad/client/allocrunner/taskrunner/tasklet.go#L42) |
| `wait` | `t *taskletHandle` | `` | `<-chan struct{...}` | [L89](file:///d:/claude/nomad/client/allocrunner/taskrunner/tasklet.go#L89) |
| `run` | `t *tasklet` | `` | `*taskletHandle` | [L100](file:///d:/claude/nomad/client/allocrunner/taskrunner/tasklet.go#L100) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/interfaces` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [tasklet_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/tasklet_test.go) | 对应测试文件 |
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go) | 同目录源文件 |
| [consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |

