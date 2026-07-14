# Nomad Client 与 Server 通信机制分析

本文档基于 Nomad 源码（`client/`、`nomad/`、`helper/pool/`、`nomad/structs/`），系统梳理 Nomad Client 与 Server 之间的所有通信机制，包括 RPC 协议分层、连接池、流式 RPC、Server 反向调用 Client、心跳机制、分配同步、Server 集群内的请求转发、TLS 安全机制以及关键 RPC 端点清单。所有引用以源码行号为准。

## 1. 总体架构

Nomad Client-Server 通信是双向的：

- **正向（Client → Server）**：Client 通过 RPC 向 Server 注册、心跳、拉取分配、上报状态
- **反向（Server → Client）**：Server 通过已建立的 yamux session 反向调用 Client 的 RPC（如 `FileSystem.Stat`、`ClientAllocations.Stats`、`Allocations.Exec`），用于执行运维操作、读取日志/文件、采集指标

```
   ┌────────────────────────────────┐
   │           Nomad Client          │
   │                                 │
   │  Client.RPC() ────────────────┐│
   │  Client.ClientRPC() (本地)    ││
   │  Client.StreamingRpcHandler() ││
   │                               ││
   │  ┌─────────────────────────┐  ││       ┌──────────────────────────────────┐
   │  │ connPool (helper/pool)  │──┼┼──────▶│            Nomad Server           │
   │  │  - Yamux 客户端会话     │  ││ TCP   │                                  │
   │  │  - 多路复用流           │◀─┼┼───────│  rpcHandler.listen()             │
   │  │  - 连接复用             │  ││       │   ├─ handleConn (magic byte)     │
   │  └─────────────────────────┘  ││       │   │   ├─ RpcRaft → raftLayer     │
   │                               ││       │   │   ├─ RpcTLS → tls.Server     │
   │  rpcConnListener              ││       │   │   ├─ RpcMultiplex → yamux    │
   │   └─ listenConn               ││       │   │   ├─ RpcMultiplexV2 (推荐)   │
   │       └─ handleConn           ││       │   │   ├─ RpcNomad → RPC server   │
   │           ├─ handleNomadConn  ││       │   │   └─ RpcStreaming             │
   │           └─ handleStreamingConn│      │   ├─ handleMultiplexV2            │
   │                                 │       │   │   ├─ handleNomadConn         │
   │  nodeConns (服务端维护)         │       │   │   └─ handleStreamingConn      │
   │   NodeID → yamux.Session        │       │   ├─ nodeConns[NodeID]            │
   │                                 │       │   │   → NodeRpc / NodeStreamingRpc│
   └─────────────────────────────────┘       │   └─ forward() → Leader / Region  │
                                              └──────────────────────────────────┘
```

## 2. RPC 协议分层

Nomad 的 RPC 建立在 TCP 之上，通过首字节（magic byte）区分协议类型。所有 RPC 类型定义在 [helper/pool/conn.go](file:///d:/claude/nomad/helper/pool/conn.go)：

```go
type RPCType byte

const (
    RpcNomad       RPCType = 0x01  // 标准 Nomad RPC（msgpack-rpc）
    RpcRaft        RPCType = 0x02  // Raft 传输（与 Nomad RPC 复用端口）
    RpcMultiplex   RPCType = 0x03  // Yamux 多路复用（V1，仅 Nomad RPC）
    RpcTLS         RPCType = 0x04  // 升级为 TLS 连接
    RpcStreaming   RPCType = 0x05  // 流式 RPC（长连接，自定义协议）
    RpcMultiplexV2 RPCType = 0x06  // Yamux 多路复用（V2，支持流式 + 普通 RPC）
)
```

### 2.1 协议协商顺序

Client 连接 Server 时依次写入（[helper/pool/pool.go:427-466](file:///d:/claude/nomad/helper/pool/pool.go#L427-L466)）：

1. （可选）`RpcTLS` 字节 → 完成 TLS 握手
2. `RpcMultiplexV2` 字节 → 建立 Yamux 客户端会话
3. 在每个 Yamux stream 上写入 `RpcNomad` 或 `RpcStreaming` 字节，区分本次 RPC 类型

Server 端 `handleConn`（[nomad/rpc.go:282](file:///d:/claude/nomad/nomad/rpc.go#L282)）读取首字节后分发：
- `RpcTLS`：包装 TLS 后递归调用 `handleConn`，再次读取下一字节
- `RpcMultiplexV2`：进入 `handleMultiplexV2`，创建 Yamux server，循环 `Accept()` 子流，每个子流再读一字节区分 `RpcNomad` / `RpcStreaming`
- `RpcRaft`：交给 `raftLayer.Handoff`，由 Raft 传输层接管
- `RpcStreaming`（顶层）：直接处理流式 RPC（未多路复用的旧路径）

### 2.2 标准 RPC（RpcNomad）

使用 `net/rpc` + msgpack 编码（[helper/pool/pool.go:23-29](file:///d:/claude/nomad/helper/pool/pool.go#L23-L29)）：

```go
func NewClientCodec(conn io.ReadWriteCloser) rpc.ClientCodec {
    return msgpackrpc.NewCodecFromHandle(true, true, conn, structs.MsgpackHandle)
}
func NewServerCodec(conn io.ReadWriteCloser) rpc.ServerCodec {
    return msgpackrpc.NewCodecFromHandle(true, true, conn, structs.MsgpackHandle)
}
```

Server 端 `handleNomadConn`（[nomad/rpc.go:439](file:///d:/claude/nomad/nomad/rpc.go#L439)）循环 `ServeRequest` 处理请求；Client 端通过 `connPool.RPC` 获取 codec 后调用 `msgpackrpc.CallWithCodec`。

### 2.3 流式 RPC（RpcStreaming）

流式 RPC 用于需要长连接或双向数据流的场景，如文件读取、日志流、`exec` 终端、事件订阅。协议握手见 [nomad/structs/streaming_rpc.go](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go)：

```
Client                                  Server
  │                                       │
  │── RpcStreaming byte ─────────────────▶│ (在 Yamux stream 上)
  │── StreamingRpcHeader{Method} (encode)─▶│
  │                                       │   streamingRpcs.GetHandler(Method)
  │◀──────── StreamingRpcAck{Error?} ──────│
  │                                       │
  │   handler(conn) 双向 io.Copy           │
  │◀─────────────────────────────────────▶│
```

- `StreamingRpcHeader`：携带方法名
- `StreamingRpcAck`：服务端确认是否找到 handler
- 之后由 handler 接管连接，可自由定义子协议（如 `FsStreamRequest`、`ExecRequest`）

`StreamingRpcHandler` 类型定义为 `func(conn io.ReadWriteCloser)`（[nomad/structs/streaming_rpc.go:28](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L28)）。

`StreamingRpcRegistry`（[nomad/structs/streaming_rpc.go:31-55](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L31-L55)）维护方法名到 handler 的映射，支持 `Register` 和 `GetHandler`。

`structs.Bridge(a, b)`（[nomad/structs/streaming_rpc.go:58-73](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L58-L73)）在两个 `io.ReadWriteCloser` 之间双向 `io.Copy`，用于将 Server 端连接桥接到 Client 端连接。

## 3. 连接池（ConnPool）

`ConnPool`（[helper/pool/pool.go:155-220](file:///d:/claude/nomad/helper/pool/pool.go#L155-L220)）是 Client 与 Server、Server 与 Server 之间共享的连接管理器，核心特性：

### 3.1 数据结构

```go
type ConnPool struct {
    sync.Mutex
    pool        map[string]*Conn     // addr.String() → 复用连接
    limiter     map[string]chan struct{}  // 防止并发拨号同一地址
    maxTime     time.Duration        // 空闲回收周期（默认 0=不回收）
    maxStreams  int                  // 每连接最大空闲 stream 数
    dialTimeout time.Duration
    tlsWrap     tlsutil.RegionWrapper
    yamuxCfg    *yamux.Config
    connListener chan<- *Conn        // 通知 Client 有新连接（用于反向 RPC）
}
```

### 3.2 关键方法

| 方法 | 位置 | 说明 |
|---|---|---|
| `NewPool` | [pool.go:240](file:///d:/claude/nomad/helper/pool/pool.go#L240) | 创建池；`maxTime > 0` 时启动 `reap` 协程 |
| `acquire` | [pool.go:333](file:///d:/claude/nomad/helper/pool/pool.go#L333) | 获取或建立连接；首个线程拨号，其他线程通过 `limiter` 等待 |
| `getNewConn` | [pool.go:391](file:///d:/claude/nomad/helper/pool/pool.go#L391) | 拨号 → (可选)TLS → 写 `RpcMultiplexV2` → `yamux.Client` |
| `getRPCClient` | [pool.go:464](file:///d:/claude/nomad/helper/pool/pool.go#L464) | 获取或新建一个 Yamux stream + codec |
| `RPC` | [pool.go:547](file:///d:/claude/nomad/helper/pool/pool.go#L547) | 标准 RPC 调用：取 client → 调用 → 成功归还/失败关闭 |
| `StreamingRPC` | [pool.go:489](file:///d:/claude/nomad/helper/pool/pool.go#L489) | 流式 RPC：开新 stream → 写 `RpcStreaming` 字节 → 返回 raw conn |
| `clearConn` | [pool.go:451](file:///d:/claude/nomad/helper/pool/pool.go#L451) | 出错时清除连接 |
| `reap` | [pool.go:563](file:///d:/claude/nomad/helper/pool/pool.go#L563) | 周期回收空闲连接（`refCount==0 && lastUsed < maxTime`） |
| `SetConnListener` | [pool.go:311](file:///d:/claude/nomad/helper/pool/pool.go#L311) | 注册新连接监听器（Client 用来接收反向 RPC） |
| `ReloadTLS` | [pool.go:296](file:///d:/claude/nomad/helper/pool/pool.go#L296) | 热重载 TLS（关闭所有旧连接） |

### 3.3 连接复用机制

`Conn`（[helper/pool/pool.go:73-95](file:///d:/claude/nomad/helper/pool/pool.go#L73-L95)）封装一个 Yamux session：

- `refCount`：当前活跃 stream 数，>0 时不会被回收
- `clients`：`list.List` 缓存空闲 `StreamClient`，最多 `maxStreams` 个
- `getClient`：优先取空闲 client，否则开新 stream 并写入 `RpcNomad` 字节
- `returnClient`：用完归还；满了则直接关闭
- `Shrink()`：归还时调用，缩小 Yamux 内部缓冲以释放内存

## 4. Client → Server 通信

### 4.1 RPC 入口

`Client.RPC`（[client/rpc.go:48](file:///d:/claude/nomad/client/rpc.go#L48)）是 Client 所有正向 RPC 的入口：

```go
func (c *Client) RPC(method string, args any, reply any) error {
    // 1. 阻塞等待节点注册完成（除了 Node.Register 用 UnauthenticatedRPC）
    select {
    case <-c.registeredCh:
    case <-c.shutdownCh:
        return nil
    }
    return c.rpc(method, args, reply)
}
```

`Client.rpc`（[client/rpc.go:68](file:///d:/claude/nomad/client/rpc.go#L68)）核心逻辑：

1. **本地直连优化**：若 `config.RPCHandler != nil`（即 Client 与 Server 同进程，dev 模式或 agent 同时启用 Client+Server），直接调用本地 Server 的 RPC，跳过网络
2. **计算 deadline**：`RPCHoldTimeout`（Leader 选举容忍时间）+ blocking query 的 `TimeToBlock`
3. **FindServer**：从 `servers.Manager` 取首个 server
4. **connPool.RPC**：执行实际 RPC
5. **失败处理**：
   - `NotifyFailedServer`：将该 server 轮转到列表末尾
   - `canRetry`：仅 `ErrNoLeader` 或读请求的 EOF 错误才自动重试
   - 重试前 `RandomStagger(RPCHoldTimeout/JitterFraction)` 随机退避，避免惊群
6. **deadline 到期**：blocking query 最后一次以 `TimeToBlock=0` 立即尝试

`UnauthenticatedRPC`（[client/rpc.go:59](file:///d:/claude/nomad/client/rpc.go#L59)）跳过 `registeredCh` 等待，仅 `Node.Register` 使用。

### 4.2 流式 RPC 入口

`Client.RemoteStreamingRpcHandler`（[client/rpc.go:178](file:///d:/claude/nomad/client/rpc.go#L178)）：

1. `FindServer` 选 server
2. `streamingRpcConn`（[client/rpc.go:217](file:///d:/claude/nomad/client/rpc.go#L217)）：拨号 → (可选)TLS → 写 `RpcStreaming` 字节 → 发送 `StreamingRpcHeader` → 等待 `StreamingRpcAck`
3. 返回 `bridgedStreamingRpcHandler(conn)`：将此连接与本地调用方连接桥接（`structs.Bridge`）

### 4.3 本地 Client RPC

`Client.ClientRPC`（[client/rpc.go:39](file:///d:/claude/nomad/client/rpc.go#L39)）使用 `InmemCodec` 直接调用 Client 自己的 `rpcServer`，用于同进程内（如测试或 Server 反向调用 Client 时由 Server 端在本地转发）。

`Client.StreamingRpcHandler`（[client/rpc.go:51](file:///d:/claude/nomad/client/rpc.go#L51)）返回本地注册的流式 handler。

## 5. Server → Client 反向 RPC

这是 Nomad 通信机制中最巧妙的部分：Server 主动调用 Client 上的 RPC，复用 Client 发起的 Yamux session。

### 5.1 连接追踪

Server 端维护 `nodeConns map[string][]*nodeConnState`（[nomad/client_rpc.go:21-31](file:///d:/claude/nomad/nomad/client_rpc.go#L21-L31)）：

```go
type nodeConnState struct {
    Session    *yamux.Session  // Yamux 服务端会话（来自 Client 拨入的连接）
    Established time.Time
    Ctx        *RPCContext
}
```

- `addNodeConn`（[client_rpc.go:62](file:///d:/claude/nomad/nomad/client_rpc.go#L62)）：在 `Node.Register`、`Node.UpdateStatus`、`Node.GetClientAllocs` 等 Client 发起的 RPC 中调用，将 `ctx.NodeID` 与当前连接的 Yamux session 关联
- `removeNodeConn`（[client_rpc.go:87](file:///d:/claude/nomad/nomad/client_rpc.go#L87)）：连接关闭时移除
- `getNodeConn`（[client_rpc.go:27](file:///d:/claude/nomad/nomad/client_rpc.go#L27)）：返回该 NodeID 最新建立的连接

### 5.2 forwardClientRPC

`Server.forwardClientRPC`（[nomad/client_rpc.go:202](file:///d:/claude/nomad/nomad/client_rpc.go#L202)）是反向 RPC 的核心入口：

```go
func (s *Server) forwardClientRPC(method, nodeID string, args, reply any) error {
    // 1. 校验节点存在且支持 RPC
    snap, _ := s.State().Snapshot()
    getNodeForRpc(snap, nodeID)

    // 2. 本地有连接：直接调用
    state, ok := s.getNodeConn(nodeID)
    if !ok {
        // 3. 本地无连接：找其他 Server 转发
        return findNodeConnAndForward(s, nodeID, method, args, reply)
    }
    return NodeRpc(state.Session, method, args, reply)
}
```

### 5.3 NodeRpc（标准反向 RPC）

`NodeRpc`（[nomad/client_rpc.go:237](file:///d:/claude/nomad/nomad/client_rpc.go#L237)）在 Yamux session 上开新 stream，写 `RpcNomad` 字节，然后通过 msgpack-rpc 调用 Client 上注册的 endpoint（如 `FileSystem.Stat`、`ClientAllocations.Stats`）。

### 5.4 NodeStreamingRpc（流式反向 RPC）

`NodeStreamingRpc`（[nomad/client_rpc.go:259](file:///d:/claude/nomad/nomad/client_rpc.go#L259)）类似，但写 `RpcStreaming` 字节，发送 `StreamingRpcHeader`，等待 `StreamingRpcAck`，返回 raw conn 给调用方。

### 5.5 跨 Server 二跳转发

`findNodeConnAndForward`（[nomad/client_rpc.go:316](file:///d:/claude/nomad/nomad/client_rpc.go#L316)）：

1. `serverWithNodeConn`（[client_rpc.go:118](file:///d:/claude/nomad/nomad/client_rpc.go#L118)）：通过 `Status.HasNodeConn` RPC 询问本 Region 所有其他 Server，找到与目标 Client 有连接的 Server（取最新建立的）
2. `forwardServer`：将原 RPC 转发给该 Server，由其执行 `NodeRpc`

流式 RPC 的跨 Server 转发见 [nomad/client_fs_endpoint.go:58](file:///d:/claude/nomad/nomad/client_fs_endpoint.go#L58) `forwardRegionStreamingRpc` 和 [nomad/client_fs_endpoint.go:319](file:///d:/claude/nomad/nomad/client_fs_endpoint.go#L319)：通过 `connPool.StreamingRPC` 建立到目标 Server 的流式连接，再用 `structs.Bridge` 双向桥接到调用方。

### 5.6 Client 端接收反向 RPC

Client 在 `setupClientRpc`（[client/rpc.go:258](file:///d:/claude/nomad/client/rpc.go#L258)）中：

1. `connPool.SetConnListener(conns)`：注册连接监听器
2. `rpcConnListener` goroutine（[client/rpc.go:291](file:///d:/claude/nomad/client/rpc.go#L291)）等待新连接
3. 每个新连接启动 `listenConn`（[client/rpc.go:307](file:///d:/claude/nomad/client/rpc.go#L307)）→ 循环 `AcceptStream` → `handleConn`
4. `handleConn`（[client/rpc.go:330](file:///d:/claude/nomad/client/rpc.go#L330)）读取首字节：
   - `RpcNomad` → `handleNomadConn`：通过 Client 的 `rpcServer` 处理
   - `RpcStreaming` → `handleStreamingConn`：解码 header → 查找本地 handler → 发 ack → 调用 handler

注意：Client 接收反向 RPC 时不主动写 `RpcMultiplexV2` 字节，因为 Client 拨入时已经用 Yamux 客户端模式建立 session，Server 端的 `handleMultiplexV2` 会接受并创建 Yamux server，Client 端的 `rpcConnListener` 通过 `conn.AcceptStream` 接收 Server 反向打开的 stream。

## 6. Server 集群内转发

### 6.1 forward（Leader 转发 + Region 转发）

`rpcHandler.forward`（[nomad/rpc.go:630](file:///d:/claude/nomad/nomad/rpc.go#L630)）在所有写 RPC 和部分读 RPC 开头调用：

```go
func (r *rpcHandler) forward(method string, info structs.RPCInfo, args, reply) (bool, error) {
    region := info.RequestRegion()

    // 1. 跨 Region 转发
    if region != r.srv.config.Region {
        info.SetForwarded()
        return true, r.forwardRegion(region, method, args, reply)
    }

    // 2. 允许 stale read：本地处理
    if info.IsRead() && info.AllowStaleRead() {
        return false, nil
    }

    // 3. 转发给 Leader
    remoteServer, err := r.getLeaderForRPC()
    if remoteServer == nil {
        return false, nil  // 本地是 Leader
    }
    info.SetForwarded()
    return true, r.forwardLeader(remoteServer, method, args, reply)
}
```

`getLeaderForRPC`（[nomad/rpc.go:656](file:///d:/claude/nomad/nomad/rpc.go#L656)）：
- 若本地是 Leader：等待 `readyForConsistentReads` 标志后返回 nil
- 若非 Leader：返回已知 Leader 地址；若 Leader 未知或未就绪，返回 `ErrNoLeader` 或 `ErrNotReadyForConsistentReads`

### 6.2 ACL 复制与多 Region

- 非 Authoritative Region 的 Leader 会通过 `replicateACLPolicies` / `replicateACLTokens` 周期性从 Authoritative Region 拉取 ACL 数据
- 跨 Region 请求由 `forwardRegion` 通过 WAN gossip 找到目标 Region 的 Server 并转发

## 7. 心跳与节点状态机制

### 7.1 Client 端心跳

`Client.registerAndHeartbeat`（[client/client.go:1878](file:///d:/claude/nomad/client/client.go#L1878)）：

1. `retryRegisterNode` → `registerNode`（[client/client.go:2186](file:///d:/claude/nomad/client/client.go#L2186)）：调用 `Node.Register`，Server 返回 `HeartbeatTTL`
2. 进入循环，按 `heartbeatTTL` 定时调用 `updateNodeStatus`（[client/client.go:2240](file:///d:/claude/nomad/client/client.go#L2240)）→ `Node.UpdateStatus`
3. 失败时按 `getHeartbeatRetryIntv`（[client/client.go:1977](file:///d:/claude/nomad/client/client.go#L1977)）退避重试，并触发 `triggerDiscovery` 重新发现 Server
4. 收到 "node not found" 错误时重新注册

### 7.2 Server 端心跳管理

`nodeHeartbeater`（[nomad/heartbeat.go:49](file:///d:/claude/nomad/nomad/heartbeat.go#L49)）维护 `heartbeatTimers map[string]*time.Timer`：

- **Leader-only**：仅在 `establishLeadership` 时调用 `initializeHeartbeatTimers` 为所有非终态节点创建定时器
- `Reset`（[heartbeat.go:97](file:///d:/claude/nomad/nomad/heartbeat.go#L97)）：每次 `Node.UpdateStatus` 时由 Leader 调用，重新计算 TTL：

```go
ttl := helper.RateScaledInterval(MaxHeartbeatsPerSecond, MinHeartbeatTTL, n)
ttl += helper.RandomStagger(ttl)
resetHeartbeatTimerLocked(id, ttl+HeartbeatGrace)
```

  TTL 随集群节点数 `n` 增加而拉长，避免大集群压垮 Leader。

- `invalidateHeartbeat`（[heartbeat.go:142](file:///d:/claude/nomad/nomad/heartbeat.go#L142)）：定时器到期时调用 `Node.UpdateStatus` 将节点置为 `down` 或 `disconnected`（取决于 alloc 是否配置了 `max_client_disconnect`）

- `clearAllHeartbeatTimers`：失去 Leader 资格时清除所有定时器

## 8. 分配同步机制

### 8.1 Client 拉取分配（watchAllocations）

`Client.watchAllocations`（[client/client.go:2491](file:///d:/claude/nomad/client/client.go#L2491)）使用 blocking query 长轮询：

1. `Node.GetClientAllocs`（[client/client.go:2549](file:///d:/claude/nomad/client/client.go#L2549)）：返回 `map[allocID]AllocModifyIndex`，使用 `MinQueryIndex` 实现阻塞查询
2. 与本地已知 alloc 的 `AllocModifyIndex` 对比，过滤出需更新的 alloc ID 列表
3. `Alloc.GetAllocs`（[client/client.go:2640](file:///d:/claude/nomad/client/client.go#L2640)）：批量拉取完整 allocation 对象
4. 通过 `updates` channel 传递给 `run` 主循环，由 `AllocRunner` 处理

### 8.2 Client 上报分配状态（allocSync）

`Client.allocSync`（[client/client.go:2382](file:///d:/claude/nomad/client/client.go#L2382)）批量上报：

1. `pendingUpdates.nextBatch(c, updateTicks)`：取出待上报的 alloc 状态更新
2. `Node.UpdateAlloc`（[client/client.go:2433](file:///d:/claude/nomad/client/client.go#L2433)）：批量发送 `AllocUpdateRequest`
3. 失败时 `pendingUpdates.restore(toSync)` 回退，等待重试
4. 成功后 `AcknowledgeState` 通知 AllocRunner 状态已持久化

### 8.3 Server 端端点

| RPC | 位置 | 调用方 | 说明 |
|---|---|---|---|
| `Node.Register` | [node_endpoint.go:96](file:///d:/claude/nomad/nomad/node_endpoint.go#L96) | Client | 节点注册，返回 HeartbeatTTL + 触发 evals |
| `Node.UpdateStatus` | [node_endpoint.go:655](file:///d:/claude/nomad/nomad/node_endpoint.go#L655) | Client / Server 内部（心跳超时） | 心跳与状态变更 |
| `Node.UpdateDrain` | [node_endpoint.go:904](file:///d:/claude/nomad/nomad/node_endpoint.go#L904) | Client | 节点排空 |
| `Node.GetClientAllocs` | [node_endpoint.go:1344](file:///d:/claude/nomad/nomad/node_endpoint.go#L1344) | Client | 阻塞查询节点的 alloc 列表 |
| `Node.UpdateAlloc` | [node_endpoint.go:1505](file:///d:/claude/nomad/nomad/node_endpoint.go#L1505) | Client | 上报 alloc 状态 |
| `Node.EmitEvents` | [node_endpoint.go:1962](file:///d:/claude/nomad/nomad/node_endpoint.go#L1962) | Client | 上报节点事件 |
| `Node.GetNode` | [node_endpoint.go:1184](file:///d:/claude/nomad/nomad/node_endpoint.go#L1184) | Client（drain 检查） | 查询节点详情 |
| `Alloc.GetAlloc` | [alloc_endpoint.go:131](file:///d:/claude/nomad/nomad/alloc_endpoint.go#L131) | Client / CLI | 查询单个 alloc |
| `Alloc.GetAllocs` | [alloc_endpoint.go:191](file:///d:/claude/nomad/nomad/alloc_endpoint.go#L191) | Client | 批量查询 alloc |

## 9. Server → Client 反向 RPC 端点清单

Server 通过 `forwardClientRPC` / `NodeStreamingRpc` 调用 Client 上注册的 RPC：

| 反向 RPC | Server 端入口 | Client 端 endpoint | 类型 |
|---|---|---|---|
| `ClientStats.Stats` | [nomad/client_stats_endpoint.go](file:///d:/claude/nomad/nomad/client_stats_endpoint.go) | [client/client_stats_endpoint.go](file:///d:/claude/nomad/client/client_stats_endpoint.go) | 标准 |
| `ClientAllocations.GarbageCollect` | [nomad/client_alloc_endpoint.go:40](file:///d:/claude/nomad/nomad/client_alloc_endpoint.go#L40) | [client/alloc_endpoint.go](file:///d:/claude/nomad/client/alloc_endpoint.go) | 标准 |
| `ClientAllocations.GarbageCollectAll` | [nomad/client_alloc_endpoint.go](file:///d:/claude/nomad/nomad/client_alloc_endpoint.go) | 同上 | 标准 |
| `ClientAllocations.Stats` | 同上 | 同上 | 标准 |
| `ClientAllocations.Restart` | 同上 | 同上 | 标准 |
| `ClientAllocations.SetPauseState` | 同上 | 同上 | 标准 |
| `ClientAllocations.Exec` | [nomad/client_alloc_endpoint.go:36](file:///d:/claude/nomad/nomad/client_alloc_endpoint.go#L36) | [client/alloc_endpoint.go:33](file:///d:/claude/nomad/client/alloc_endpoint.go#L33) | **流式** |
| `FileSystem.List` | [nomad/client_fs_endpoint.go:115](file:///d:/claude/nomad/nomad/client_fs_endpoint.go#L115) | [client/fs_endpoint.go](file:///d:/claude/nomad/client/fs_endpoint.go) | 标准 |
| `FileSystem.Stat` | [nomad/client_fs_endpoint.go:175](file:///d:/claude/nomad/nomad/client_fs_endpoint.go#L175) | 同上 | 标准 |
| `FileSystem.Stream` | [nomad/client_fs_endpoint.go:37](file:///d:/claude/nomad/nomad/client_fs_endpoint.go#L37) | [client/fs_endpoint.go:84](file:///d:/claude/nomad/client/fs_endpoint.go#L84) | **流式** |
| `FileSystem.Logs` | [nomad/client_fs_endpoint.go:36](file:///d:/claude/nomad/nomad/client_fs_endpoint.go#L36) | [client/fs_endpoint.go:83](file:///d:/claude/nomad/client/fs_endpoint.go#L83) | **流式** |
| `Agent.Monitor` | [nomad/client_agent_endpoint.go:36](file:///d:/claude/nomad/nomad/client_agent_endpoint.go#L36) | [client/agent_endpoint.go:31](file:///d:/claude/nomad/client/agent_endpoint.go#L31) | **流式** |
| `Agent.MonitorExport` | [nomad/client_agent_endpoint.go:37](file:///d:/claude/nomad/nomad/client_agent_endpoint.go#L37) | [client/agent_endpoint.go:32](file:///d:/claude/nomad/client/agent_endpoint.go#L32) | **流式** |
| `NodeMeta.Read` | [nomad/node_meta_endpoint.go](file:///d:/claude/nomad/nomad/node_meta_endpoint.go) | [client/node_meta_endpoint.go](file:///d:/claude/nomad/client/node_meta_endpoint.go) | 标准 |
| `NodeMeta.Apply` | 同上 | 同上 | 标准 |
| `NodeIdentity.Renew` | [nomad/node_identity_endpoint.go](file:///d:/claude/nomad/nomad/node_identity_endpoint.go) | [client/node_identity_endpoint.go](file:///d:/claude/nomad/client/node_identity_endpoint.go) | 标准 |
| `HostVolume.Delete` | [nomad/host_volume_endpoint.go](file:///d:/claude/nomad/nomad/host_volume_endpoint.go) | [client/host_volume_endpoint.go](file:///d:/claude/nomad/client/host_volume_endpoint.go) | 标准 |

Server 端注册的流式 endpoint 见 `setupStreamingEndpoints`（[nomad/server.go:1268](file:///d:/claude/nomad/nomad/server.go#L1268)）：`Allocations.Exec`、`FileSystem.Logs`、`FileSystem.Stream`、`Agent.Monitor`、`Agent.MonitorExport`、`Event.Stream`、`Operator.SnapshotSave`、`Operator.SnapshotRestore`。

## 10. TLS 安全机制

### 10.1 TLS 包装

`tlsutil.NewTLSConfiguration`（在 `NewServer` / `NewClient` 阶段调用）生成两个 wrapper：

- `tlsWrap`：`tlsutil.RegionWrapper`，用于出站连接（Client/Server 拨号到其他 Server）
- `rpcTLS`：`*tls.Config`，用于入站连接（Server 接受 RPC 时 `tls.Server`）

### 10.2 证书 SAN 校验

当 `VerifyServerHostname=true` 时：
- **Server 端**：通过 `rpcNameAndRegionValidator` 校验客户端证书 SAN 必须匹配 `client.<region>.nomad` 或 `server.*.nomad`
- **Client 端**：`tlsWrap(region, conn)` 在 TLS 握手时校验服务端证书 SAN 匹配 `server.<region>.nomad`
- **Raft 连接**：额外校验 `server.<region>.nomad`（见 [nomad/rpc.go:329](file:///d:/claude/nomad/nomad/rpc.go#L329) `validateRaftTLS`）

### 10.3 RPCUpgradeMode

`TLSConfig.RPCUpgradeMode=true`（默认）时，允许已建立的明文连接通过写 `RpcTLS` 字节升级为 TLS；`false` 时直接拒绝非 TLS 连接。

### 10.4 反向 RPC 的 TLS

Client 拨入 Server 时建立 TLS 连接，但 Server 反向调用 Client 时复用同一 Yamux session，**不再额外做 TLS 握手**（Yamux stream 已经在 TLS 隧道内）。Client 端 `streamingRpcConn` 和 `connPool.getNewConn` 都只在初始拨号时做 TLS。

## 11. 连接限制与防护

### 11.1 Server 端连接限制

`rpcHandler`（[nomad/rpc.go:46-86](file:///d:/claude/nomad/nomad/rpc.go#L46-L86)）：

- `connLimiter`：每 IP 最大连接数（`RPCMaxConnsPerClient`），在 `Accept` 后立即检查
- `streamLimiter`：每 IP 最大流式连接数（`connLimit - LimitsNonStreamingConnsPerClient`），预留连接给 Raft 和普通 RPC
- `RPCHandshakeTimeout`：未认证连接的首字节读取超时，防止资源耗尽

### 11.2 Client 端 Server 选择

`servers.Manager`（[client/servers/manager.go:147](file:///d:/claude/nomad/client/servers/manager.go#L147)）：

- `FindServer`：总是返回列表首位
- `NotifyFailedServer`：失败时 `cycle()` 将首位轮到末尾
- `RebalanceServers`（[manager.go:309](file:///d:/claude/nomad/client/servers/manager.go#L309)）：每 `clientRPCMinReuseDuration`（5min）shuffle 一次，通过 `Ping` 找健康 server
- `newRebalanceConnsPerSecPerServer = 64`：限制 rebalance 速率，避免大集群同时切换 server

### 11.3 RPC 限流

`srv.MeasureRPCRate(endpoint, metric, args)`（在所有 RPC endpoint 开头调用）基于 token bucket 限流，参数：
- `RPCRateLimit` / `RPCRateBurst`：每 endpoint 类型的速率与突发
- `RateMetricWrite` / `RateMetricRead` / `RateMetricList`：区分 RPC 类型

## 12. 关键数据流示例

### 12.1 Client 注册流程

```
Client                                    Server (Leader)
  │                                          │
  │── Node.Register (UnauthenticatedRPC) ───▶│
  │   args: Node, SecretID, IntroToken       │
  │                                          │   1. forward("Node.Register") → 本地是 Leader
  │                                          │   2. AuthenticateNodeIdentityGenerator
  │                                          │   3. 校验 SecretID / IntroToken
  │                                          │   4. raftApply(NodeRegisterRequest)
  │                                          │   5. nodeHeartbeater.Reset(nodeID) → TTL
  │                                          │   6. addNodeConn(ctx) → 缓存 Yamux session
  │                                          │   7. 触发 eval（如果有分配）
  │◀── NodeUpdateResponse ───────────────────│
  │   HeartbeatTTL, EvalIDs, Index           │
  │                                          │
  │   close(registeredCh) → 解除 RPC 阻塞     │
```

### 12.2 Server 反向调用 Client（如 exec）

```
CLI → Server (Leader)                      Client
  │                                          │
  │── Allocations.Exec (streaming) ─────────▶│
  │   (CLI 与 Server 建立 stream)            │
  │                                          │   1. forwardClientRPC("ClientAllocations.Exec", nodeID, ...)
  │                                          │   2. getNodeConn(nodeID) → yamux.Session
  │                                          │   3. NodeStreamingRpc(session, "Allocations.Exec")
  │                                          │       ├─ session.Open() (新 stream)
  │                                          │       ├─ write RpcStreaming byte
  │                                          │       ├─ encode StreamingRpcHeader{Method}
  │                                          │       └─ decode StreamingRpcAck
  │                                          │◀─ handleStreamingConn (client/rpc.go:416)
  │                                          │      ├─ decode StreamingRpcHeader
  │                                          │      ├─ streamingRpcs.GetHandler("Allocations.Exec")
  │                                          │      ├─ encode StreamingRpcAck
  │                                          │      └─ handler(conn) → exec 子进程
  │                                          │
  │   structs.Bridge(CLI_conn, client_conn)  │
  │◀─────────────────────────────────────────│  (双向 io.Copy)
```

### 12.3 跨 Server 转发（如 Server A 无 Client 连接）

```
Client → Server B (有连接)              Server A (无连接) → CLI
                                          │
                                          │── FileSystem.List RPC ──▶
                                          │   (CLI 调用 Server A)
                                          │
                                          │   forwardClientRPC:
                                          │     getNodeConn(nodeID) → 未命中
                                          │     findNodeConnAndForward:
                                          │       serverWithNodeConn → 询问所有 peer
                                          │       Status.HasNodeConn → Server B 命中
                                          │       forwardServer(ServerB, "FileSystem.List", args)
                                          │                                           │
                                          │◀──────────────────────────────────────────│
                                          │   Server B 执行 NodeRpc(session, ...)     │
                                          │       ↓                                    │
                                          │   Client.handleNomadConn 处理             │
                                          │       ↓                                    │
                                          │   返回结果给 Server B → Server A → CLI     │
```

## 13. 文件索引

### 13.1 Client 端

| 文件 | 主要内容 |
|---|---|
| [client/rpc.go](file:///d:/claude/nomad/client/rpc.go) | `Client.RPC` / `UnauthenticatedRPC` / `rpc` / `RemoteStreamingRpcHandler` / `streamingRpcConn` / `setupClientRpc` / `rpcConnListener` / `listenConn` / `handleConn` / `handleNomadConn` / `handleStreamingConn` |
| [client/client.go](file:///d:/claude/nomad/client/client.go) | `registerAndHeartbeat` / `registerNode` / `updateNodeStatus` / `watchAllocations` / `allocSync` / `triggerDiscovery` |
| [client/servers/manager.go](file:///d:/claude/nomad/client/servers/manager.go) | `Manager` Server 选择与 rebalance |
| [client/alloc_endpoint.go](file:///d:/claude/nomad/client/alloc_endpoint.go) | Client 端 `Allocations.Exec` 流式 handler |
| [client/fs_endpoint.go](file:///d:/claude/nomad/client/fs_endpoint.go) | Client 端 `FileSystem.Logs` / `FileSystem.Stream` |
| [client/agent_endpoint.go](file:///d:/claude/nomad/client/agent_endpoint.go) | Client 端 `Agent.Monitor` / `Agent.MonitorExport` |
| [client/drain.go](file:///d:/claude/nomad/client/drain.go) | `Node.UpdateDrain` 调用 |

### 13.2 Server 端

| 文件 | 主要内容 |
|---|---|
| [nomad/rpc.go](file:///d:/claude/nomad/nomad/rpc.go) | `rpcHandler` / `listen` / `handleConn` / `handleMultiplex` / `handleMultiplexV2` / `handleNomadConn` / `handleStreamingConn` / `forward` / `getLeaderForRPC` / `streamingRpc` / `streamingRpcImpl` / `setQueryMeta` |
| [nomad/client_rpc.go](file:///d:/claude/nomad/nomad/client_rpc.go) | `nodeConnState` / `nodeConns` 管理 / `getNodeConn` / `addNodeConn` / `removeNodeConn` / `serverWithNodeConn` / `forwardClientRPC` / `NodeRpc` / `NodeStreamingRpc` / `findNodeConnAndForward` |
| [nomad/client_alloc_endpoint.go](file:///d:/claude/nomad/nomad/client_alloc_endpoint.go) | `ClientAllocations` 反向 RPC（Stats/GC/Restart/Exec） |
| [nomad/client_fs_endpoint.go](file:///d:/claude/nomad/nomad/client_fs_endpoint.go) | `FileSystem` 反向 RPC（List/Stat/Stream/Logs）+ `forwardRegionStreamingRpc` |
| [nomad/client_agent_endpoint.go](file:///d:/claude/nomad/nomad/client_agent_endpoint.go) | `Agent` 反向 RPC（Monitor/MonitorExport） |
| [nomad/node_endpoint.go](file:///d:/claude/nomad/nomad/node_endpoint.go) | `Node.Register` / `UpdateStatus` / `UpdateDrain` / `GetClientAllocs` / `UpdateAlloc` / `EmitEvents` / `GetNode` |
| [nomad/alloc_endpoint.go](file:///d:/claude/nomad/nomad/alloc_endpoint.go) | `Alloc.GetAlloc` / `Alloc.GetAllocs` |
| [nomad/heartbeat.go](file:///d:/claude/nomad/nomad/heartbeat.go) | `nodeHeartbeater` TTL 管理 |
| [nomad/raft_rpc.go](file:///d:/claude/nomad/nomad/raft_rpc.go) | `RaftLayer` Raft 传输层（与 Nomad RPC 复用端口） |
| [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | `setupRPC` / `setupRpcServer` / `setupStreamingEndpoints` / `StreamingRpcHandler` |

### 13.3 共享基础设施

| 文件 | 主要内容 |
|---|---|
| [helper/pool/pool.go](file:///d:/claude/nomad/helper/pool/pool.go) | `ConnPool` / `Conn` / `StreamClient` / 连接复用 / 回收 |
| [helper/pool/conn.go](file:///d:/claude/nomad/helper/pool/conn.go) | `RPCType` 常量定义 |
| [nomad/structs/streaming_rpc.go](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go) | `StreamingRpcHeader` / `StreamingRpcAck` / `StreamingRpcHandler` / `StreamingRpcRegistry` / `Bridge` |
| [helper/tlsutil/](file:///d:/claude/nomad/helper/tlsutil) | TLS 配置与 wrapper |
| [client/config/config.go](file:///d:/claude/nomad/client/config/config.go) | `RPCHandler` 接口（本地直连优化） |

## 14. 通信机制总结

| 机制 | 方向 | 协议 | 典型场景 |
|---|---|---|---|
| 标准 RPC | Client → Server | Tcp + (TLS) + Yamux + msgpack-rpc | 注册、心跳、拉取分配、上报状态 |
| 标准 RPC | Server → Client | Yamux stream + msgpack-rpc（复用 Client 拨入连接） | Stats、GC、Restart、List、Stat |
| 流式 RPC | Client → Server | Tcp + (TLS) + Yamux + Streaming header | Event.Stream、Snapshot |
| 流式 RPC | Server → Client | Yamux stream + Streaming header | FileSystem.Logs/Stream、Allocations.Exec、Agent.Monitor |
| Leader 转发 | Follower → Leader | connPool.RPC | 写请求必须由 Leader 处理 |
| Region 转发 | Server → 远端 Region Server | connPool.RPC + WAN gossip | 跨 Region 查询 |
| 跨 Server 二跳 | Server A → Server B → Client | `Status.HasNodeConn` + `forwardServer` + `NodeRpc` | Server A 无目标 Client 连接时 |
| 本地直连 | Client → 同进程 Server | InmemCodec（无网络） | Dev 模式、agent 同时启用 Client+Server |
| Raft 传输 | Server ↔ Server | Tcp + (TLS) + RaftLayer（复用 RPC 端口） | Raft 日志复制、投票、快照 |
| Gossip | Server ↔ Server | UDP Serf | 成员发现、故障检测 |
| 心跳 | Client → Server | 标准 RPC（`Node.UpdateStatus`） | 周期性存活报告 |
| 阻塞查询 | Client → Server | 标准 RPC + `MinQueryIndex` | 长轮询分配变更 |

---

本文档基于 Nomad 源码分析整理，覆盖 Client-Server 双向通信的全部机制。如需深入了解某个 RPC 端点的参数与返回值，可参考 [nomad/structs/](file:///d:/claude/nomad/nomad/structs) 下的请求/响应结构体定义。
