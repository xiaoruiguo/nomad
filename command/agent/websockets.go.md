# websockets.go 代码说明文档

> 文件路径：[websockets.go](file:///d:/claude/nomad/command/agent/websockets.go)
> 总行数：124 行
> 所属包：`agent`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **WebSocket 支持**，用于流式 API（如 `nomad alloc logs -f`、`nomad monitor`）的实时数据推送。

## 2. 类型定义

### wsHandshakeMessage

**定义位置**：[L69](file:///d:/claude/nomad/command/agent/websockets.go#L69)

**类型**：struct

```go
	Version int `json:"version"`
	AuthToken string `json:"auth_token"`
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `ctxKeyWebSocketConn` | `"ws_connection"` |
| `ctxKeyWebSocketAuthToken` | `"ws_auth_token"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `isWebsocketUpgrade` | - | `req *http.Request` | `bool` | [L22](file:///d:/claude/nomad/command/agent/websockets.go#L22) |
| `wrapWebsocketHandler` | `s *HTTPServer` | `handler handlerFn` | `handlerFn` | [L33](file:///d:/claude/nomad/command/agent/websockets.go#L33) |
| `readWsHandshake` | `s *HTTPServer` | `readFn func(...), req *http.Request` | `string, error` | [L75](file:///d:/claude/nomad/command/agent/websockets.go#L75) |
| `getWebsocketConnection` | `s *HTTPServer` | `req *http.Request` | `*websocket.Conn, error` | [L109](file:///d:/claude/nomad/command/agent/websockets.go#L109) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `net/http` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `github.com/gorilla/websocket` | 第三方库 |

## 7. 设计模式与技术特点

- **配置结构体**：使用 `hcl`/`json` 结构标签支持配置文件解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [websockets_test.go](file:///d:/claude/nomad/command/agent/websockets_test.go) | 对应测试文件 |
| [agent.go](file:///d:/claude/nomad/command/agent/agent.go) | Agent 核心实现 |
| [http.go](file:///d:/claude/nomad/command/agent/http.go) | HTTP 服务器实现 |
| [config.go](file:///d:/claude/nomad/command/agent/config.go) | 配置定义 |

