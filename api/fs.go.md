# fs.go 代码说明文档

> 文件路径：[api/fs.go](file:///d:/claude/nomad/api/fs.go)
> 总行数：434 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `fs.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### AllocFileInfo

**定义位置**：[L35](file:///d:/claude/nomad/api/fs.go#L35)

**中文说明**：AllocFileInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type AllocFileInfo struct {
	Name string
	IsDir bool
	Size int64
	FileMode string
	ModTime time.Time
	ContentType string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `IsDir` | `bool` | 布尔值 |
| `Size` | `int64` | 大小 |
| `FileMode` | `string` | 字符串 |
| `ModTime` | `time.Time` | 时间点 |
| `ContentType` | `string` | 字符串 |

### StreamFrame

**定义位置**：[L45](file:///d:/claude/nomad/api/fs.go#L45)

**中文说明**：StreamFrame 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type StreamFrame struct {
	Offset int64 `json:",omitempty"`
	Data []byte `json:",omitempty"`
	File string `json:",omitempty"`
	FileEvent string `json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Offset` | `int64 `json:",omitempty"`` | 偏移量 |
| `Data` | `[]byte `json:",omitempty"`` | 数据 |
| `File` | `string `json:",omitempty"`` | 字符串 |
| `FileEvent` | `string `json:",omitempty"`` | 字符串 |

**关联方法**（1 个）：`IsHeartbeat`

### AllocFS

**定义位置**：[L58](file:///d:/claude/nomad/api/fs.go#L58)

**中文说明**：AllocFS 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocFS struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（6 个）：`List`, `Stat`, `ReadAt`, `Cat`, `Stream`, `Logs`

### FrameReader

**定义位置**：[L327](file:///d:/claude/nomad/api/fs.go#L327)

**中文说明**：FrameReader 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type FrameReader struct {
	frames <-chan *StreamFrame
	errCh <-chan error
	cancelCh chan struct{...}
	closedLock sync.Mutex
	closed bool
	unblockTime time.Duration
	frame *StreamFrame
	frameOffset int
	byteOffset int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `frames` | `<-chan *StreamFrame` | 通道 |
| `errCh` | `<-chan error` | 错误通道 |
| `cancelCh` | `chan struct{...}` | 信号通道 |
| `closedLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `closed` | `bool` | 是否已关闭 |
| `unblockTime` | `time.Duration` | 时间间隔 |
| `frame` | `*StreamFrame` | — |
| `frameOffset` | `int` | — |
| `byteOffset` | `int` | — |

**关联方法**（4 个）：`SetUnblockTime`, `Offset`, `Read`, `Close`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `OriginStart` | `—` | `"start"` | — |
| `OriginEnd` | `—` | `"end"` | — |
| `FSLogNameStdout` | `—` | `"stdout"` | — |
| `FSLogNameStderr` | `—` | `"stderr"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `IsHeartbeat` | `s *StreamFrame` | `` | `bool` | [L53](file:///d:/claude/nomad/api/fs.go#L53) |
| `AllocFS` | `c *Client` | `` | `*AllocFS` | [L63](file:///d:/claude/nomad/api/fs.go#L63) |
| `List` | `a *AllocFS` | `alloc *Allocation, path string, q *QueryOptions` | `[]*AllocFileInfo, *QueryMeta, error` | [L71](file:///d:/claude/nomad/api/fs.go#L71) |
| `Stat` | `a *AllocFS` | `alloc *Allocation, path string, q *QueryOptions` | `*AllocFileInfo, *QueryMeta, error` | [L93](file:///d:/claude/nomad/api/fs.go#L93) |
| `ReadAt` | `a *AllocFS` | `alloc *Allocation, path string, offset int64, limit int64, q *QueryOptions` | `io.ReadCloser, error` | [L116](file:///d:/claude/nomad/api/fs.go#L116) |
| `Cat` | `a *AllocFS` | `alloc *Allocation, path string, q *QueryOptions` | `io.ReadCloser, error` | [L132](file:///d:/claude/nomad/api/fs.go#L132) |
| `Stream` | `a *AllocFS` | `alloc *Allocation, path string, origin string, offset int64, cancel <-chan st...` | `<-chan *StreamFrame, <-chan error` | [L152](file:///d:/claude/nomad/api/fs.go#L152) |
| `queryClientNode` | - | `c *Client, alloc *Allocation, reqPath string, q *QueryOptions, customizeQ fun...` | `io.ReadCloser, error` | [L207](file:///d:/claude/nomad/api/fs.go#L207) |
| `Logs` | `a *AllocFS` | `alloc *Allocation, follow bool, task string, logType string, origin string, o...` | `<-chan *StreamFrame, <-chan error` | [L260](file:///d:/claude/nomad/api/fs.go#L260) |
| `NewFrameReader` | - | `frames <-chan *StreamFrame, errCh <-chan error, cancelCh chan struct{...}` | `*FrameReader` | [L345](file:///d:/claude/nomad/api/fs.go#L345) |
| `SetUnblockTime` | `f *FrameReader` | `d time.Duration` | `` | [L355](file:///d:/claude/nomad/api/fs.go#L355) |
| `Offset` | `f *FrameReader` | `` | `int` | [L360](file:///d:/claude/nomad/api/fs.go#L360) |
| `Read` | `f *FrameReader` | `p []byte` | `n int, err error` | [L366](file:///d:/claude/nomad/api/fs.go#L366) |
| `Close` | `f *FrameReader` | `` | `error` | [L423](file:///d:/claude/nomad/api/fs.go#L423) |

## 5. 核心方法详解

### List()

**签名**：`func (a *AllocFS) List(alloc *Allocation, path string, q *QueryOptions) []*AllocFileInfo, *QueryMeta, error`

**位置**：[L71](file:///d:/claude/nomad/api/fs.go#L71)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `alloc` | `*Allocation` | — |
| `path` | `string` | 路径 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*AllocFileInfo` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### NewFrameReader()

**签名**：`func NewFrameReader(frames <-chan *StreamFrame, errCh <-chan error, cancelCh chan struct{...}) *FrameReader`

**位置**：[L345](file:///d:/claude/nomad/api/fs.go#L345)

**中文说明**：创建并返回一个新的 FrameReader 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `frames` | `<-chan *StreamFrame` | 通道 |
| `errCh` | `<-chan error` | 错误通道 |
| `cancelCh` | `chan struct{...}` | 信号通道 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*FrameReader` | — |

### Read()

**签名**：`func (f *FrameReader) Read(p []byte) n int, err error`

**位置**：[L366](file:///d:/claude/nomad/api/fs.go#L366)

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

**签名**：`func (f *FrameReader) Close() error`

**位置**：[L423](file:///d:/claude/nomad/api/fs.go#L423)

**中文说明**：关闭对象。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net` | 标准库 |
| `strconv` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [fs_test.go](file:///d:/claude/nomad/api/fs_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

