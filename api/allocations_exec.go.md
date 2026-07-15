# allocations_exec.go 代码说明文档

> 文件路径：[allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go)
> 总行数：259 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **分配（Allocation）API 客户端**，提供分配查询、停止、信号、统计、GC 等操作的客户端方法。

## 2. 类型定义

### execSession

**定义位置**：[L26](file:///d:/claude/nomad/api/allocations_exec.go#L26)

**类型**：struct

```go
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
	terminalSizeCh chan TerminalSize
	q *QueryOptions
```

**关联方法**（4 个）：`run`, `startConnection`, `startTransmit`, `startReceiving`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `heartbeatInterval` | `10 * time.Second` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `run` | `s *execSession` | `ctx context.Context` | `exitCode int, err error` | [L44](file:///d:/claude/nomad/api/allocations_exec.go#L44) |
| `startConnection` | `s *execSession` | - | `*websocket.Conn, error` | [L76](file:///d:/claude/nomad/api/allocations_exec.go#L76) |
| `startTransmit` | `s *execSession` | `ctx context.Context, conn *websocket.Conn` | `chan error` | [L125](file:///d:/claude/nomad/api/allocations_exec.go#L125) |
| `startReceiving` | `s *execSession` | `ctx context.Context, conn *websocket.Conn` | `chan int, chan error` | [L217](file:///d:/claude/nomad/api/allocations_exec.go#L217) |

## 5. 核心方法详解

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

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **WebSocket 支持**：使用 gorilla/websocket 进行实时双向通信（如 exec、日志流）
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

