# logmon.go 代码说明文档

> 文件路径：[client/logmon/logmon.go](file:///d:/claude/nomad/client/logmon/logmon.go)
> 总行数：300 行
> 所属包：`logmon`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **客户端子包**（`client/`），实现 Nomad 客户端的功能组件。

## 2. 类型定义

### LogConfig

**定义位置**：[L26](file:///d:/claude/nomad/client/logmon/logmon.go#L26)

**中文说明**：LogConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type LogConfig struct {
	LogDir string
	StdoutLogFile string
	StderrLogFile string
	StdoutFifo string
	StderrFifo string
	MaxFiles int
	MaxFileSizeMB int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `LogDir` | `string` | 字符串 |
| `StdoutLogFile` | `string` | 字符串 |
| `StderrLogFile` | `string` | 字符串 |
| `StdoutFifo` | `string` | 字符串 |
| `StderrFifo` | `string` | 字符串 |
| `MaxFiles` | `int` | — |
| `MaxFileSizeMB` | `int` | — |

### LogMon

**定义位置**：[L49](file:///d:/claude/nomad/client/logmon/logmon.go#L49)

**中文说明**：LogMon 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type LogMon interface {
	Start func(...)
	Stop func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Start` | `func(...)` | 启动对象。 |
| `Stop` | `func(...)` | 停止对象。 |

### logmonImpl

**定义位置**：[L60](file:///d:/claude/nomad/client/logmon/logmon.go#L60)

**中文说明**：logmonImpl 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type logmonImpl struct {
	logger hclog.Logger
	tl *TaskLogger
	lock sync.Mutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `tl` | `*TaskLogger` | 日志记录器 |
| `lock` | `sync.Mutex` | 互斥锁，保护并发访问 |

**关联方法**（3 个）：`Start`, `start`, `Stop`

### TaskLogger

**定义位置**：[L104](file:///d:/claude/nomad/client/logmon/logmon.go#L104)

**中文说明**：TaskLogger 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskLogger struct {
	config *LogConfig
	lro *logRotatorWrapper
	lre *logRotatorWrapper
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `config` | `*LogConfig` | 配置 |
| `lro` | `*logRotatorWrapper` | — |
| `lre` | `*logRotatorWrapper` | — |

**关联方法**（2 个）：`IsRunning`, `Close`

### logRotatorWrapper

**定义位置**：[L178](file:///d:/claude/nomad/client/logmon/logmon.go#L178)

**中文说明**：logRotatorWrapper 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type logRotatorWrapper struct {
	fifoPath string
	rotatorWriter io.WriteCloser
	hasFinishedCopied chan struct{...}
	logger hclog.Logger
	processOutReader io.ReadCloser
	openCompleted chan struct{...}
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `fifoPath` | `string` | 字符串 |
| `rotatorWriter` | `io.WriteCloser` | — |
| `hasFinishedCopied` | `chan struct{...}` | 信号通道 |
| `logger` | `hclog.Logger` | 日志记录器 |
| `processOutReader` | `io.ReadCloser` | — |
| `openCompleted` | `chan struct{...}` | 信号通道 |

**关联方法**（3 个）：`isRunning`, `start`, `Close`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `processOutputCloseTolerance` | `—` | `2 * time.Second` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewLogMon` | - | `logger hclog.Logger` | `LogMon` | [L54](file:///d:/claude/nomad/client/logmon/logmon.go#L54) |
| `Start` | `l *logmonImpl` | `cfg *LogConfig` | `error` | [L66](file:///d:/claude/nomad/client/logmon/logmon.go#L66) |
| `start` | `l *logmonImpl` | `cfg *LogConfig` | `error` | [L86](file:///d:/claude/nomad/client/logmon/logmon.go#L86) |
| `Stop` | `l *logmonImpl` | `` | `error` | [L95](file:///d:/claude/nomad/client/logmon/logmon.go#L95) |
| `IsRunning` | `tl *TaskLogger` | `` | `bool` | [L115](file:///d:/claude/nomad/client/logmon/logmon.go#L115) |
| `Close` | `tl *TaskLogger` | `` | `` | [L122](file:///d:/claude/nomad/client/logmon/logmon.go#L122) |
| `NewTaskLogger` | - | `cfg *LogConfig, logger hclog.Logger` | `*TaskLogger, error` | [L141](file:///d:/claude/nomad/client/logmon/logmon.go#L141) |
| `isRunning` | `l *logRotatorWrapper` | `` | `bool` | [L189](file:///d:/claude/nomad/client/logmon/logmon.go#L189) |
| `newLogRotatorWrapper` | - | `path string, logger hclog.Logger, rotator io.WriteCloser` | `*logRotatorWrapper, error` | [L200](file:///d:/claude/nomad/client/logmon/logmon.go#L200) |
| `start` | `l *logRotatorWrapper` | `openFn func(...)` | `` | [L234](file:///d:/claude/nomad/client/logmon/logmon.go#L234) |
| `Close` | `l *logRotatorWrapper` | `` | `` | [L263](file:///d:/claude/nomad/client/logmon/logmon.go#L263) |

## 5. 核心方法详解

### NewLogMon()

**签名**：`func NewLogMon(logger hclog.Logger) LogMon`

**位置**：[L54](file:///d:/claude/nomad/client/logmon/logmon.go#L54)

**中文说明**：创建并返回一个新的 LogMon 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `hclog.Logger` | 日志记录器 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `LogMon` | — |

### Start()

**签名**：`func (l *logmonImpl) Start(cfg *LogConfig) error`

**位置**：[L66](file:///d:/claude/nomad/client/logmon/logmon.go#L66)

**中文说明**：启动对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `cfg` | `*LogConfig` | 配置 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Stop()

**签名**：`func (l *logmonImpl) Stop() error`

**位置**：[L95](file:///d:/claude/nomad/client/logmon/logmon.go#L95)

**中文说明**：停止对象。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Close()

**签名**：`func (tl *TaskLogger) Close() `

**位置**：[L122](file:///d:/claude/nomad/client/logmon/logmon.go#L122)

**中文说明**：关闭对象。

### NewTaskLogger()

**签名**：`func NewTaskLogger(cfg *LogConfig, logger hclog.Logger) *TaskLogger, error`

**位置**：[L141](file:///d:/claude/nomad/client/logmon/logmon.go#L141)

**中文说明**：创建并返回一个新的 TaskLogger 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `cfg` | `*LogConfig` | 配置 |
| `logger` | `hclog.Logger` | 日志记录器 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*TaskLogger` | 日志记录器 |
| `error` | 错误信息 |

### Close()

**签名**：`func (l *logRotatorWrapper) Close() `

**位置**：[L263](file:///d:/claude/nomad/client/logmon/logmon.go#L263)

**中文说明**：关闭对象。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `io` | 标准库 |
| `os` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/fifo` | 内部包 |
| `github.com/hashicorp/nomad/client/logmon/logging` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **后台协程**：启动 goroutine 执行后台任务
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [logmon_test.go](file:///d:/claude/nomad/client/logmon/logmon_test.go) | 对应测试文件 |
| [client.go](file:///d:/claude/nomad/client/logmon/client.go) | 同目录源文件 |
| [plugin.go](file:///d:/claude/nomad/client/logmon/plugin.go) | 同目录源文件 |
| [server.go](file:///d:/claude/nomad/client/logmon/server.go) | 同目录源文件 |
| [z_logmon_cmd.go](file:///d:/claude/nomad/client/logmon/z_logmon_cmd.go) | 同目录源文件 |

