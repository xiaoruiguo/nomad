# rotator.go 代码说明文档

> 文件路径：[client/logmon/logging/rotator.go](file:///d:/claude/nomad/client/logmon/logging/rotator.go)
> 总行数：353 行
> 所属包：`logging`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **客户端子包**（`client/`），实现 Nomad 客户端的功能组件。

## 2. 类型定义

### FileRotator

**定义位置**：[L39](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L39)

**中文说明**：FileRotator 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type FileRotator struct {
	MaxFiles int
	FileSize int64
	path string
	baseFileName string
	logFileIdx int
	oldestLogFileIdx int
	closed bool
	fileLock sync.Mutex
	currentFile *os.File
	currentWr int64
	bufw *bufio.Writer
	bufLock sync.Mutex
	flushTicker *time.Ticker
	logger hclog.Logger
	purgeCh chan struct{...}
	doneCh chan struct{...}
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MaxFiles` | `int` | — |
| `FileSize` | `int64` | — |
| `path` | `string` | 路径 |
| `baseFileName` | `string` | 字符串 |
| `logFileIdx` | `int` | — |
| `oldestLogFileIdx` | `int` | — |
| `closed` | `bool` | 是否已关闭 |
| `fileLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `currentFile` | `*os.File` | — |
| `currentWr` | `int64` | — |
| `bufw` | `*bufio.Writer` | — |
| `bufLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `flushTicker` | `*time.Ticker` | — |
| `logger` | `hclog.Logger` | 日志记录器 |
| `purgeCh` | `chan struct{...}` | 信号通道 |
| `doneCh` | `chan struct{...}` | 信号通道 |

**关联方法**（10 个）：`Write`, `nextFile`, `lastFile`, `createFile`, `flushPeriodically`, `Close`, `purgeOldFiles`, `flushBuffer`, `writeToBuffer`, `createOrResetBuffer`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `logBufferSize` | `—` | `64 * 1024` | — |
| `bufferFlushDuration` | `—` | `100 * time.Millisecond` | — |
| `lineScanLimit` | `—` | `32 * 1024` | — |
| `newLineDelimiter` | `—` | `'\n'` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewFileRotator` | - | `path string, baseFile string, maxFiles int, fileSize int64, logger hclog.Logger` | `*FileRotator, error` | [L63](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L63) |
| `Write` | `f *FileRotator` | `p []byte` | `n int, err error` | [L89](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L89) |
| `nextFile` | `f *FileRotator` | `` | `error` | [L164](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L164) |
| `lastFile` | `f *FileRotator` | `` | `error` | [L193](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L193) |
| `createFile` | `f *FileRotator` | `` | `error` | [L222](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L222) |
| `flushPeriodically` | `f *FileRotator` | `` | `` | [L241](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L241) |
| `Close` | `f *FileRotator` | `` | `error` | [L254](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L254) |
| `purgeOldFiles` | `f *FileRotator` | `` | `` | [L275](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L275) |
| `flushBuffer` | `f *FileRotator` | `` | `error` | [L326](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L326) |
| `writeToBuffer` | `f *FileRotator` | `p []byte` | `int, error` | [L336](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L336) |
| `createOrResetBuffer` | `f *FileRotator` | `` | `` | [L344](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L344) |

## 5. 核心方法详解

### NewFileRotator()

**签名**：`func NewFileRotator(path string, baseFile string, maxFiles int, fileSize int64, logger hclog.Logger) *FileRotator, error`

**位置**：[L63](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L63)

**中文说明**：创建并返回一个新的 FileRotator 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `path` | `string` | 路径 |
| `baseFile` | `string` | 字符串 |
| `maxFiles` | `int` | — |
| `fileSize` | `int64` | — |
| `logger` | `hclog.Logger` | 日志记录器 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*FileRotator` | — |
| `error` | 错误信息 |

### Write()

**签名**：`func (f *FileRotator) Write(p []byte) n int, err error`

**位置**：[L89](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L89)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `p` | `[]byte` | 字节数组 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `n int` | — |
| `err error` | 错误信息 |

### Close()

**签名**：`func (f *FileRotator) Close() error`

**位置**：[L254](file:///d:/claude/nomad/client/logmon/logging/rotator.go#L254)

**中文说明**：关闭对象。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bufio` | 标准库 |
| `bytes` | 标准库 |
| `fmt` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [rotator_test.go](file:///d:/claude/nomad/client/logmon/logging/rotator_test.go) | 对应测试文件 |

