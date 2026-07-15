# fs.go 代码说明文档

> 文件路径：[fs.go](file:///d:/claude/nomad/api/fs.go)
> 总行数：434 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **文件系统（FS）API 客户端**，提供分配文件系统访问（ls/cat/stat/stream）的客户端方法。

## 2. 类型定义

### AllocFileInfo

**定义位置**：[L35](file:///d:/claude/nomad/api/fs.go#L35)

**类型**：struct

```go
	Name string
	IsDir bool
	Size int64
	FileMode string
	ModTime time.Time
	ContentType string
```

### StreamFrame

**定义位置**：[L45](file:///d:/claude/nomad/api/fs.go#L45)

**类型**：struct

```go
	Offset int64 `json:",omitempty"`
	Data []byte `json:",omitempty"`
	File string `json:",omitempty"`
	FileEvent string `json:",omitempty"`
```

**关联方法**（1 个）：`IsHeartbeat`

### AllocFS

**定义位置**：[L58](file:///d:/claude/nomad/api/fs.go#L58)

**类型**：struct

```go
	client *Client
```

**关联方法**（6 个）：`List`, `Stat`, `ReadAt`, `Cat`, `Stream`, `Logs`

### FrameReader

**定义位置**：[L327](file:///d:/claude/nomad/api/fs.go#L327)

**类型**：struct

```go
	frames chan *StreamFrame
	errCh chan error
	cancelCh chan struct{...}
	closedLock sync.Mutex
	closed bool
	unblockTime time.Duration
	frame *StreamFrame
	frameOffset int
	byteOffset int
```

**关联方法**（4 个）：`SetUnblockTime`, `Offset`, `Read`, `Close`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `OriginStart` | `"start"` |
| `OriginEnd` | `"end"` |
| `FSLogNameStdout` | `"stdout"` |
| `FSLogNameStderr` | `"stderr"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `IsHeartbeat` | `s *StreamFrame` | - | `bool` | [L53](file:///d:/claude/nomad/api/fs.go#L53) |
| `AllocFS` | `c *Client` | - | `*AllocFS` | [L63](file:///d:/claude/nomad/api/fs.go#L63) |
| `List` | `a *AllocFS` | `alloc *Allocation, path string, q *QueryOptions` | `[]*AllocFileInfo, *QueryMeta, error` | [L71](file:///d:/claude/nomad/api/fs.go#L71) |
| `Stat` | `a *AllocFS` | `alloc *Allocation, path string, q *QueryOptions` | `*AllocFileInfo, *QueryMeta, error` | [L93](file:///d:/claude/nomad/api/fs.go#L93) |
| `ReadAt` | `a *AllocFS` | `alloc *Allocation, path string, offset int64, limit int64, q *QueryOptions` | `io.ReadCloser, error` | [L116](file:///d:/claude/nomad/api/fs.go#L116) |
| `Cat` | `a *AllocFS` | `alloc *Allocation, path string, q *QueryOptions` | `io.ReadCloser, error` | [L132](file:///d:/claude/nomad/api/fs.go#L132) |
| `Stream` | `a *AllocFS` | `alloc *Allocation, path string, origin string, offset int64, cancel chan str...` | `chan *StreamFrame, chan error` | [L152](file:///d:/claude/nomad/api/fs.go#L152) |
| `queryClientNode` | - | `c *Client, alloc *Allocation, reqPath string, q *QueryOptions, customizeQ fu...` | `io.ReadCloser, error` | [L207](file:///d:/claude/nomad/api/fs.go#L207) |
| `Logs` | `a *AllocFS` | `alloc *Allocation, follow bool, task string, logType string, origin string, ...` | `chan *StreamFrame, chan error` | [L260](file:///d:/claude/nomad/api/fs.go#L260) |
| `NewFrameReader` | - | `frames chan *StreamFrame, errCh chan error, cancelCh chan struct{...}` | `*FrameReader` | [L345](file:///d:/claude/nomad/api/fs.go#L345) |
| `SetUnblockTime` | `f *FrameReader` | `d time.Duration` | - | [L355](file:///d:/claude/nomad/api/fs.go#L355) |
| `Offset` | `f *FrameReader` | - | `int` | [L360](file:///d:/claude/nomad/api/fs.go#L360) |
| `Read` | `f *FrameReader` | `p []byte` | `n int, err error` | [L366](file:///d:/claude/nomad/api/fs.go#L366) |
| `Close` | `f *FrameReader` | - | `error` | [L423](file:///d:/claude/nomad/api/fs.go#L423) |

## 5. 核心方法详解

### List()

**签名**：`func (a *AllocFS) List(alloc *Allocation, path string, q *QueryOptions) []*AllocFileInfo, *QueryMeta, error`

**位置**：[L71](file:///d:/claude/nomad/api/fs.go#L71)

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

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **流式响应**：返回 `io.ReadCloser` 或 channel，支持流式数据读取（如日志流、事件流）
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [fs_test.go](file:///d:/claude/nomad/api/fs_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

