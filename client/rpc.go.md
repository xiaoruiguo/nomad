# rpc.go 代码说明文档

> 文件路径：[client/rpc.go](file:///d:/claude/nomad/client/rpc.go)
> 总行数：530 行
> 所属包：`client`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad Client 核心包**（`client/`），实现客户端节点的主要功能，包括分配管理、任务执行、心跳上报和驱动调度。

## 2. 类型定义

### rpcEndpoints

**定义位置**：[L24](file:///d:/claude/nomad/client/rpc.go#L24)

**中文说明**：rpcEndpoints 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type rpcEndpoints struct {
	ClientStats *ClientStats
	CSI *CSI
	FileSystem *FileSystem
	Allocations *Allocations
	Agent *Agent
	NodeIdentity *NodeIdentity
	NodeMeta *NodeMeta
	HostVolume *HostVolume
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ClientStats` | `*ClientStats` | 关联的 Client 实例 |
| `CSI` | `*CSI` | — |
| `FileSystem` | `*FileSystem` | — |
| `Allocations` | `*Allocations` | — |
| `Agent` | `*Agent` | — |
| `NodeIdentity` | `*NodeIdentity` | — |
| `NodeMeta` | `*NodeMeta` | — |
| `HostVolume` | `*HostVolume` | — |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ClientRPC` | `c *Client` | `method string, args interface{}, reply interface{}` | `error` | [L36](file:///d:/claude/nomad/client/rpc.go#L36) |
| `StreamingRpcHandler` | `c *Client` | `method string` | `structs.StreamingRpcHandler, error` | [L50](file:///d:/claude/nomad/client/rpc.go#L50) |
| `RPC` | `c *Client` | `method string, args any, reply any` | `error` | [L55](file:///d:/claude/nomad/client/rpc.go#L55) |
| `UnauthenticatedRPC` | `c *Client` | `method string, args any, reply any` | `error` | [L68](file:///d:/claude/nomad/client/rpc.go#L68) |
| `rpc` | `c *Client` | `method string, args any, reply any` | `error` | [L74](file:///d:/claude/nomad/client/rpc.go#L74) |
| `canRetry` | - | `args interface{}, err error` | `bool` | [L174](file:///d:/claude/nomad/client/rpc.go#L174) |
| `RemoteStreamingRpcHandler` | `c *Client` | `method string` | `structs.StreamingRpcHandler, error` | [L193](file:///d:/claude/nomad/client/rpc.go#L193) |
| `bridgedStreamingRpcHandler` | - | `sideA io.ReadWriteCloser` | `structs.StreamingRpcHandler` | [L212](file:///d:/claude/nomad/client/rpc.go#L212) |
| `streamingRpcConn` | `c *Client` | `server *servers.Server, method string` | `net.Conn, error` | [L222](file:///d:/claude/nomad/client/rpc.go#L222) |
| `setupClientRpc` | `c *Client` | `rpcs map[string]interface{}` | `` | [L289](file:///d:/claude/nomad/client/rpc.go#L289) |
| `setupClientRpcServer` | `c *Client` | `server *rpc.Server` | `` | [L315](file:///d:/claude/nomad/client/rpc.go#L315) |
| `rpcConnListener` | `c *Client` | `` | `` | [L330](file:///d:/claude/nomad/client/rpc.go#L330) |
| `listenConn` | `c *Client` | `conn *pool.Conn` | `` | [L351](file:///d:/claude/nomad/client/rpc.go#L351) |
| `handleConn` | `c *Client` | `conn net.Conn` | `` | [L370](file:///d:/claude/nomad/client/rpc.go#L370) |
| `handleNomadConn` | `c *Client` | `conn net.Conn` | `` | [L397](file:///d:/claude/nomad/client/rpc.go#L397) |
| `handleStreamingConn` | `c *Client` | `conn net.Conn` | `` | [L419](file:///d:/claude/nomad/client/rpc.go#L419) |
| `resolveServer` | - | `s string` | `net.Addr, error` | [L460](file:///d:/claude/nomad/client/rpc.go#L460) |
| `Ping` | `c *Client` | `srv net.Addr` | `error` | [L496](file:///d:/claude/nomad/client/rpc.go#L496) |
| `rpcRetryWatcher` | `c *Client` | `` | `<-chan struct{...}` | [L509](file:///d:/claude/nomad/client/rpc.go#L509) |
| `fireRpcRetryWatcher` | `c *Client` | `` | `` | [L522](file:///d:/claude/nomad/client/rpc.go#L522) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `io` | 标准库 |
| `net` | 标准库 |
| `net/rpc` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/servers` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/codec` | 内部包 |
| `github.com/hashicorp/nomad/helper/pool` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/go-msgpack/v2/codec` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **指标收集**：使用 `go-metrics` 收集运行时指标
- **后台协程**：启动 goroutine 执行后台任务

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [rpc_test.go](file:///d:/claude/nomad/client/rpc_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/client/acl.go) | 同目录源文件 |
| [agent_endpoint.go](file:///d:/claude/nomad/client/agent_endpoint.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/client/alloc_endpoint.go) | 同目录源文件 |
| [client.go](file:///d:/claude/nomad/client/client.go) | 同目录源文件 |
| [client_stats_endpoint.go](file:///d:/claude/nomad/client/client_stats_endpoint.go) | 同目录源文件 |

