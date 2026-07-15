# allocations_exec.go 代码说明文档

> 文件路径：[api/allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go)
> 总行数：259 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `allocations_exec.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### execSession

**定义位置**：[L26](file:///d:/claude/nomad/api/allocations_exec.go#L26)

**中文说明**：execSession 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type execSession struct {
	client *Client
	alloc *Allocation
	job string
	task string
	tty bool
	command []string
	action string
	stdin io.Reader
	stdout io.Writer
	stderr io.Writer
	terminalSizeCh <-chan TerminalSize
	q *QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |
| `alloc` | `*Allocation` | — |
| `job` | `string` | 字符串 |
| `task` | `string` | 字符串 |
| `tty` | `bool` | 布尔值 |
| `command` | `[]string` | 列表 |
| `action` | `string` | 字符串 |
| `stdin` | `io.Reader` | — |
| `stdout` | `io.Writer` | — |
| `stderr` | `io.Writer` | — |
| `terminalSizeCh` | `<-chan TerminalSize` | 通道 |
| `q` | `*QueryOptions` | — |

**关联方法**（4 个）：`run`, `startConnection`, `startTransmit`, `startReceiving`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `heartbeatInterval` | `—` | `10 * time.Second` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `run` | `s *execSession` | `ctx context.Context` | `exitCode int, err error` | [L44](file:///d:/claude/nomad/api/allocations_exec.go#L44) |
| `startConnection` | `s *execSession` | `` | `*websocket.Conn, error` | [L76](file:///d:/claude/nomad/api/allocations_exec.go#L76) |
| `startTransmit` | `s *execSession` | `ctx context.Context, conn *websocket.Conn` | `<-chan error` | [L125](file:///d:/claude/nomad/api/allocations_exec.go#L125) |
| `startReceiving` | `s *execSession` | `ctx context.Context, conn *websocket.Conn` | `<-chan int, <-chan error` | [L217](file:///d:/claude/nomad/api/allocations_exec.go#L217) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net/url` | 标准库 |
| `strconv` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/gorilla/websocket` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |
| [constraint.go](file:///d:/claude/nomad/api/constraint.go) | 同目录源文件 |

