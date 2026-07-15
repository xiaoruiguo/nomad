# streaming_rpc.go 代码说明文档

> 文件路径：[structs/streaming_rpc.go](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go)
> 总行数：76 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### StreamingRpcHeader

**定义位置**：[L14](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L14)

**类型**：struct

```go
	Method string
```

### StreamingRpcAck

**定义位置**：[L21](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L21)

**类型**：struct

```go
	Error string
```

### StreamingRpcHandler

**定义位置**：[L28](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L28)

**类型定义**：`func(...)`

### StreamingRpcRegistry

**定义位置**：[L31](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L31)

**类型**：struct

```go
	registry map[string]StreamingRpcHandler
```

**关联方法**（2 个）：`Register`, `GetHandler`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewStreamingRpcRegistry` | - | - | `*StreamingRpcRegistry` | [L37](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L37) |
| `Register` | `s *StreamingRpcRegistry` | `method string, handler StreamingRpcHandler` | - | [L44](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L44) |
| `GetHandler` | `s *StreamingRpcRegistry` | `method string` | `StreamingRpcHandler, error` | [L49](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L49) |
| `Bridge` | - | `a io.ReadWriteCloser, b io.ReadWriteCloser` | - | [L59](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L59) |

## 5. 核心方法详解

### Register()

**签名**：`func (s *StreamingRpcRegistry) Register(method string, handler StreamingRpcHandler) `

**位置**：[L44](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L44)

### GetHandler()

**签名**：`func (s *StreamingRpcRegistry) GetHandler(method string) StreamingRpcHandler, error`

**位置**：[L49](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L49)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `io` | 标准库 |
| `sync` | 标准库 |

## 7. 设计模式与技术特点

- **流式响应**：支持流式数据传输，用于事件订阅和长连接场景
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态

## 8. 相关文件

| 文件 | 关系 |
|------|------|

