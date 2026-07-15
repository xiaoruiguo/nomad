# node_endpoint.go 代码说明文档

> 文件路径：[node_endpoint.go](file:///d:/claude/nomad/command/agent/node_endpoint.go)
> 总行数：216 行
> 所属包：`agent`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件是 **HTTP API 端点实现**，负责 `node` 相关的 HTTP 请求处理，包括请求解析、ACL 鉴权、调用 Server/Client RPC、响应格式化等。端点通过 `http.go` 中的路由注册表挂载到 HTTP 服务器。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NodesRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L15](file:///d:/claude/nomad/command/agent/node_endpoint.go#L15) |
| `NodeSpecificRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L45](file:///d:/claude/nomad/command/agent/node_endpoint.go#L45) |
| `nodeForceEvaluate` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, nodeID string` | `interface{}, error` | [L68](file:///d:/claude/nomad/command/agent/node_endpoint.go#L68) |
| `nodeAllocations` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, nodeID string` | `interface{}, error` | [L86](file:///d:/claude/nomad/command/agent/node_endpoint.go#L86) |
| `nodeToggleDrain` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, nodeID string` | `interface{}, error` | [L117](file:///d:/claude/nomad/command/agent/node_endpoint.go#L117) |
| `nodeToggleEligibility` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, nodeID string` | `interface{}, error` | [L153](file:///d:/claude/nomad/command/agent/node_endpoint.go#L153) |
| `nodeQuery` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, nodeID string` | `interface{}, error` | [L177](file:///d:/claude/nomad/command/agent/node_endpoint.go#L177) |
| `nodePurge` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, nodeID string` | `interface{}, error` | [L201](file:///d:/claude/nomad/command/agent/node_endpoint.go#L201) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `net/http` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [node_endpoint_test.go](file:///d:/claude/nomad/command/agent/node_endpoint_test.go) | 对应测试文件 |
| [agent.go](file:///d:/claude/nomad/command/agent/agent.go) | Agent 核心实现 |
| [http.go](file:///d:/claude/nomad/command/agent/http.go) | HTTP 服务器实现 |
| [config.go](file:///d:/claude/nomad/command/agent/config.go) | 配置定义 |

