# logmon.go 代码说明文档

> 文件路径：[logmon/logmon.go](file:///d:/claude/nomad/client/logmon/logmon.go)
> 总行数：300 行
> 所属包：`logmon`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **日志监控子包**（`client/logmon`），监控任务的日志输出并进行轮转。

## 2. 类型定义

### LogConfig

**定义位置**：[L26](file:///d:/claude/nomad/client/logmon/logmon.go#L26)

**类型**：struct

```go
	LogDir string
	StdoutLogFile string
	StderrLogFile string
	StdoutFifo string
	StderrFifo string
	MaxFiles int
	MaxFileSizeMB int
```

### LogMon

**定义位置**：[L49](file:///d:/claude/nomad/client/logmon/logmon.go#L49)

**类型**：interface

```go
	Start
	Stop
```

### logmonImpl

**定义位置**：[L60](file:///d:/claude/nomad/client/logmon/logmon.go#L60)

**类型**：struct

```go
	logger hclog.Logger
	tl *TaskLogger
	lock sync.Mutex
```

**关联方法**（3 个）：`Start`, `start`, `Stop`

### TaskLogger

**定义位置**：[L104](file:///d:/claude/nomad/client/logmon/logmon.go#L104)

**类型**：struct

```go
	config *LogConfig
	lro *logRotatorWrapper
	lre *logRotatorWrapper
```

**关联方法**（2 个）：`IsRunning`, `Close`

### logRotatorWrapper

**定义位置**：[L178](file:///d:/claude/nomad/client/logmon/logmon.go#L178)

**类型**：struct

```go
	fifoPath string
	rotatorWriter io.WriteCloser
	hasFinishedCopied chan struct{...}
	logger hclog.Logger
	processOutReader io.ReadCloser
	openCompleted chan struct{...}
```

**关联方法**（3 个）：`isRunning`, `start`, `Close`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `processOutputCloseTolerance` | `2 * time.Second` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewLogMon` | - | `logger hclog.Logger` | `LogMon` | [L54](file:///d:/claude/nomad/client/logmon/logmon.go#L54) |
| `Start` | `l *logmonImpl` | `cfg *LogConfig` | `error` | [L66](file:///d:/claude/nomad/client/logmon/logmon.go#L66) |
| `start` | `l *logmonImpl` | `cfg *LogConfig` | `error` | [L86](file:///d:/claude/nomad/client/logmon/logmon.go#L86) |
| `Stop` | `l *logmonImpl` | - | `error` | [L95](file:///d:/claude/nomad/client/logmon/logmon.go#L95) |
| `IsRunning` | `tl *TaskLogger` | - | `bool` | [L115](file:///d:/claude/nomad/client/logmon/logmon.go#L115) |
| `Close` | `tl *TaskLogger` | - | - | [L122](file:///d:/claude/nomad/client/logmon/logmon.go#L122) |
| `NewTaskLogger` | - | `cfg *LogConfig, logger hclog.Logger` | `*TaskLogger, error` | [L141](file:///d:/claude/nomad/client/logmon/logmon.go#L141) |
| `isRunning` | `l *logRotatorWrapper` | - | `bool` | [L189](file:///d:/claude/nomad/client/logmon/logmon.go#L189) |
| `newLogRotatorWrapper` | - | `path string, logger hclog.Logger, rotator io.WriteCloser` | `*logRotatorWrapper, error` | [L200](file:///d:/claude/nomad/client/logmon/logmon.go#L200) |
| `start` | `l *logRotatorWrapper` | `openFn func(...)` | - | [L234](file:///d:/claude/nomad/client/logmon/logmon.go#L234) |
| `Close` | `l *logRotatorWrapper` | - | - | [L263](file:///d:/claude/nomad/client/logmon/logmon.go#L263) |

## 5. 核心方法详解

### Start()

**签名**：`func (l *logmonImpl) Start(cfg *LogConfig) error`

**位置**：[L66](file:///d:/claude/nomad/client/logmon/logmon.go#L66)

### Stop()

**签名**：`func (l *logmonImpl) Stop() error`

**位置**：[L95](file:///d:/claude/nomad/client/logmon/logmon.go#L95)

### Close()

**签名**：`func (tl *TaskLogger) Close() `

**位置**：[L122](file:///d:/claude/nomad/client/logmon/logmon.go#L122)

### Close()

**签名**：`func (l *logRotatorWrapper) Close() `

**位置**：[L263](file:///d:/claude/nomad/client/logmon/logmon.go#L263)

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
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [logmon_test.go](file:///d:/claude/nomad/client/logmon/logmon_test.go) | 对应测试文件 |

