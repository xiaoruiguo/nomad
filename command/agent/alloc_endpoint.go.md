# alloc_endpoint.go 代码说明文档

> 文件路径：[alloc_endpoint.go](file:///d:/claude/nomad/command/agent/alloc_endpoint.go)
> 总行数：806 行
> 所属包：`agent`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件是 **HTTP API 端点实现**，负责 `alloc` 相关的 HTTP 请求处理，包括请求解析、ACL 鉴权、调用 Server/Client RPC、响应格式化等。端点通过 `http.go` 中的路由注册表挂载到 HTTP 服务器。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `allocNotFoundErr` | `"allocation not found"` |
| `resourceNotFoundErr` | `"resource not found"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `AllocsRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L32](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L32) |
| `AllocSpecificRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L77](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L77) |
| `allocGet` | `s *HTTPServer` | `allocID string, resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L104](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L104) |
| `allocStop` | `s *HTTPServer` | `allocID string, resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L146](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L146) |
| `allocServiceRegistrations` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, allocID string` | `interface{}, error` | [L190](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L190) |
| `ClientAllocRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L219](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L219) |
| `ClientGCRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L254](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L254) |
| `allocRestart` | `s *HTTPServer` | `allocID string, resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L286](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L286) |
| `allocGC` | `s *HTTPServer` | `allocID string, resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L335](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L335) |
| `allocSignal` | `s *HTTPServer` | `allocID string, resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L367](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L367) |
| `allocPause` | `s *HTTPServer` | `allocID string, resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L406](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L406) |
| `allocPauseGet` | `s *HTTPServer` | `allocID string, resp http.ResponseWriter, req *http.Request` | `any, error` | [L417](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L417) |
| `allocPauseSet` | `s *HTTPServer` | `allocID string, resp http.ResponseWriter, req *http.Request` | `any, error` | [L451](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L451) |
| `allocSnapshot` | `s *HTTPServer` | `allocID string, resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L505](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L505) |
| `allocStats` | `s *HTTPServer` | `allocID string, resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L522](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L522) |
| `allocChecks` | `s *HTTPServer` | `allocID string, resp http.ResponseWriter, req *http.Request` | `any, error` | [L557](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L557) |
| `allocExec` | `s *HTTPServer` | `allocID string, resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L590](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L590) |
| `execStream` | `s *HTTPServer` | `ws *websocket.Conn, args *cstructs.AllocExecRequest` | `any, error` | [L627](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L627) |
| `execStreamImpl` | `s *HTTPServer` | `ws *websocket.Conn, args *cstructs.AllocExecRequest, handler structs.Streami...` | `any, error` | [L652](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L652) |
| `execStreamHandleError` | `s *HTTPServer` | `ws *websocket.Conn, codedErr HTTPCodedError` | `HTTPCodedError` | [L736](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L736) |
| `toWsCode` | - | `httpCode int` | `int` | [L751](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L751) |
| `isClosedError` | - | `err error` | `bool` | [L762](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L762) |
| `forwardExecInput` | - | `ctx context.Context, encoder *codec.Encoder, ws *websocket.Conn, errCh chan ...` | - | [L781](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L781) |

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
| `net` | 标准库 |
| `net/http` | 标准库 |
| `slices` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/golang/snappy` | 第三方库 |
| `github.com/gorilla/websocket` | 第三方库 |
| `github.com/hashicorp/go-msgpack/v2/codec` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [alloc_endpoint_test.go](file:///d:/claude/nomad/command/agent/alloc_endpoint_test.go) | 对应测试文件 |
| [agent.go](file:///d:/claude/nomad/command/agent/agent.go) | Agent 核心实现 |
| [http.go](file:///d:/claude/nomad/command/agent/http.go) | HTTP 服务器实现 |
| [config.go](file:///d:/claude/nomad/command/agent/config.go) | 配置定义 |

