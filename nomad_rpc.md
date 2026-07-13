# Nomad Client 与 Server RPC 通信分析

本文档详细分析 Nomad 集群中 Client（节点 Agent）与 Server（调度器/领导者）之间的 RPC 通信实现，涵盖协议握手、连接复用、流式 RPC、跨服务器转发、Raft 一致性集成等关键机制。

---

## 1. 总体架构概览

Nomad 的 RPC 通信复用 Go 标准库 `net/rpc`，并在其之上叠加了若干自定义层：

```
┌────────────────────────────────────────────────────────────────────┐
│                  Caller (CLI / Agent / Server)                     │
│                                                                    │
│   api.Client.Jobs().Register(...)        server.RPC(method,args,r) │
│        │                                            │               │
│        ▼                                            ▼               │
│  ┌─────────────────┐                    ┌──────────────────────┐   │
│  │  HTTP API layer │                    │  Nomad RPC Client    │   │
│  │  (/v1/...)      │                    │  (Client.rpc)        │   │
│  └────────┬────────┘                    └──────────┬───────────┘   │
│           │                                         │               │
│           │        ┌─────────────────────────────────┐             │
│           │        │     helper/pool.ConnPool        │             │
│           │        │  - TCP dial + yamux multiplex   │             │
│           │        │  - TLS upgrade                  │             │
│           │        │  - conn caching & reaping       │             │
│           │        └────────────┬────────────────────┘             │
│           │                     │                                  │
└───────────┼─────────────────────┼──────────────────────────────────┘
            │                     │
            ▼                     ▼
       ┌────────────────────────────────────────┐
       │           Network (TCP)                │
       │   Magic byte 区分 RPC 类型             │
       └────────────────┬───────────────────────┘
                        │
                        ▼
       ┌────────────────────────────────────────────┐
       │      Server.rpcHandler.listen              │
       │      (nomad/rpc.go)                        │
       │  ┌─────────────────────────────────────┐   │
       │  │  handleConn (单字节路由)            │   │
       │  │   RpcNomad      → rpc.Server        │   │
       │  │   RpcRaft       → raftLayer.Handoff │   │
       │  │   RpcMultiplex  → yamux.Server      │   │
       │  │   RpcTLS        → tls.Server(再次)  │   │
       │  │   RpcStreaming  → streamingRpcs     │   │
       │  │   RpcMultiplexV2→ yamux.Server(V2)  │   │
       │  └─────────────────────────────────────┘   │
       └────────────────────────────────────────────┘
                        │
                        ▼
       ┌────────────────────────────────────────────┐
       │  setupRpcServer: 30+ Endpoint 注册         │
       │  (ACL/Job/Node/Alloc/Deploy/CSI/...)       │
       │  Endpoint 内部 → forward() / raftApply()   │
       └────────────────────────────────────────────┘
```

### 通信角色

| 角色 | 包路径 | 说明 |
|------|--------|------|
| **Server** | `nomad` (包名同目录名) | 接受 RPC，持有 Raft 状态机，调度评估，向 Client 转发 Client-* RPC |
| **Client** | `client` | 节点上的 Agent，向 Server 注册节点、汇报状态，并接受 Server 反向发起的 RPC（如 `Allocations.Exec`） |
| **连接池** | `helper/pool` | 复用 TCP 连接 + yamux 多路复用，所有跨节点 RPC 都经过它 |

---

## 2. RPC 协议握手（Magic Byte）

每种 RPC 类型用一个前导字节区分。常量定义在 [helper/pool/conn.go](file:///d:/claude/nomad/helper/pool/conn.go):

```go
type RPCType byte

const (
    RpcNomad       RPCType = 0x01  // 普通 net/rpc 调用
    RpcRaft        RPCType = 0x02  // Raft 复制流量
    RpcMultiplex   RPCType = 0x03  // yamux 多路复用（旧版）
    RpcTLS         RPCType = 0x04  // 升级到 TLS
    RpcStreaming   RPCType = 0x05  // 流式 RPC（Exec/Logs/Events）
    RpcMultiplexV2 RPCType = 0x06  // yamux 多路复用（V2，支持流式子通道）
)
```

**协议处理流程**（服务端）：[nomad/rpc.go:283-411](file:///d:/claude/nomad/nomad/rpc.go#L283-L411) 的 `rpcHandler.handleConn` 读取首字节并按类型分发：

| 首字节 | 处理函数 | 说明 |
|--------|----------|------|
| `RpcNomad` (0x01) | `handleNomadConn` | 直接走 `rpc.Server.ServeRequest`，每个 TCP 连接处理一个 RPC 流 |
| `RpcRaft` (0x02) | `raftLayer.Handoff` | 交给 Raft 库的 `StreamLayer.Accept()` |
| `RpcMultiplex` (0x03) | `handleMultiplex` | 启动 yamux.Server，每个子流一个 `rpc.Server` |
| `RpcTLS` (0x04) | `tls.Server` + 递归 `handleConn` | 完成 TLS 握手后再读下一字节 |
| `RpcStreaming` (0x05) | `handleStreamingConn` | 解码 `StreamingRpcHeader`，按方法名查表分发 |
| `RpcMultiplexV2` (0x06) | `handleMultiplexV2` | yamux.Server，子流首字节再决定 Nomad / Streaming |

### TLS 强制策略

[nomad/rpc.go:299-308](file:///d:/claude/nomad/nomad/rpc.go#L299-L308)：当 `TLSConfig.EnableRPC=true` 且 `RPCUpgradeMode=false` 时，非 TLS 连接立即被关闭；`RPCUpgradeMode=true` 允许明文连接先发送 `RpcTLS` 升级。

---

## 3. Server 端实现

### 3.1 RPC 监听器与处理器

| 文件 | 关键标识 | 作用 |
|------|----------|------|
| [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | `Server.rpcListener` (line 146) | TCP 监听器 |
| [nomad/server.go:589](file:///d:/claude/nomad/nomad/server.go#L589) | `startRPCListener` | 启动监听 goroutine |
| [nomad/server.go:596](file:///d:/claude/nomad/nomad/server.go#L596) | `createRPCListener` | 创建 `*net.TCPListener` |
| [nomad/server.go:1203](file:///d:/claude/nomad/nomad/server.go#L1203) | `setupRPC` | 组装 `rpcHandler`、TLS 包装、raftLayer |
| [nomad/server.go:1296](file:///d:/claude/nomad/nomad/server.go#L1296) | `setupRpcServer` | 注册所有 Endpoint 到 `*rpc.Server` |
| [nomad/rpc.go:43](file:///d:/claude/nomad/nomad/rpc.go#L43) | `rpcHandler` 结构 | 持有 `connLimiter`、`streamLimiter`、`yamuxCfg` |
| [nomad/rpc.go:203](file:///d:/claude/nomad/nomad/rpc.go#L203) | `rpcHandler.listen` | accept 循环 + 限流 |
| [nomad/rpc.go:283](file:///d:/claude/nomad/nomad/rpc.go#L283) | `handleConn` | 单字节路由分发 |

### 3.2 Endpoint 注册

Server 端通过 `setupRpcServer` 把 30+ 个 Endpoint 注册到 `rpc.Server`。每次新连接都会重建一份 `rpc.Server`，以便 Endpoint 持有 per-connection 的 `*RPCContext`（含 TLS 证书链、NodeID 等）。

完整注册列表见 [nomad/server.go:1296-1341](file:///d:/claude/nomad/nomad/server.go#L1296-L1341):

```go
func (s *Server) setupRpcServer(server *rpc.Server, ctx *RPCContext) {
    // 客户端 RPC（无连接上下文，通常转发给具体节点）
    _ = server.Register(NewClientStatsEndpoint(s))
    _ = server.Register(newNodeMetaEndpoint(s))
    _ = server.Register(newNodeIdentityEndpoint(s))

    // 客户端类 RPC（同时注册了 streaming 部分）
    _ = server.Register(NewClientAllocationsEndpoint(s))
    _ = server.Register(NewFileSystemEndpoint(s))
    _ = server.Register(NewAgentEndpoint(s))
    _ = server.Register(NewOperatorEndpoint(s, ctx))

    // 服务端类 RPC（带连接上下文）
    _ = server.Register(NewACLEndpoint(s, ctx))
    _ = server.Register(NewAllocEndpoint(s, ctx))
    _ = server.Register(NewClientCSIEndpoint(s, ctx))
    _ = server.Register(NewCSIVolumeEndpoint(s, ctx))
    _ = server.Register(NewCSIPluginEndpoint(s, ctx))
    _ = server.Register(NewDeploymentEndpoint(s, ctx))
    _ = server.Register(NewEvalEndpoint(s, ctx))
    _ = server.Register(NewJobEndpoints(s, ctx))
    _ = server.Register(NewKeyringEndpoint(s, ctx, s.encrypter))
    _ = server.Register(NewNamespaceEndpoint(s, ctx))
    _ = server.Register(NewNodeEndpoint(s, ctx))
    _ = server.Register(NewNodePoolEndpoint(s, ctx))
    _ = server.Register(NewPeriodicEndpoint(s, ctx))
    _ = server.Register(NewPlanEndpoint(s, ctx))
    _ = server.Register(NewRegionEndpoint(s, ctx))
    _ = server.Register(NewScalingEndpoint(s, ctx))
    _ = server.Register(NewSearchEndpoint(s, ctx))
    _ = server.Register(NewServiceRegistrationEndpoint(s, ctx))
    _ = server.Register(NewStatusEndpoint(s, ctx))
    _ = server.Register(NewSystemEndpoint(s, ctx))
    _ = server.Register(NewVariablesEndpoint(s, ctx, s.encrypter))
    _ = server.Register(NewHostVolumeEndpoint(s, ctx))
    _ = server.Register(NewTaskGroupVolumeClaimEndpoint(s, ctx))
    _ = server.Register(NewClientHostVolumeEndpoint(s, ctx))

    // 企业版占位（CE 为空实现）
    ent := NewEnterpriseEndpoints(s, ctx)
    ent.Register(server)
}
```

#### Endpoint 文件清单（Server 侧）

| Endpoint 类型 | 实现文件 | 主要方法 |
|---------------|----------|----------|
| ACL | [nomad/acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | 策略/令牌/角色/绑定规则/OIDC |
| Alloc | [nomad/alloc_endpoint.go](file:///d:/claude/nomad/nomad/alloc_endpoint.go) | Alloc.List/GetAlloc/Stop |
| ClientAllocations | [nomad/client_alloc_endpoint.go](file:///d:/claude/nomad/nomad/client_alloc_endpoint.go) | Stats/Signal/Restart/GC（转发到 Client） |
| ClientStats | [nomad/client_stats_endpoint.go](file:///d:/claude/nomad/nomad/client_stats_endpoint.go) | ClientStats.Stats |
| ClientMeta | [nomad/client_meta_endpoint.go](file:///d:/claude/nomad/nomad/client_meta_endpoint.go) | ApplyMetadata（转发到 Client） |
| ClientIdentity | [nomad/client_identity_endpoint.go](file:///d:/claude/nomad/nomad/client_identity_endpoint.go) | 节点身份令牌 |
| CSI Volume | [nomad/csi_endpoint.go](file:///d:/claude/nomad/nomad/csi_endpoint.go) | 卷 CRUD/快照/Claim |
| Deployment | [nomad/deployment_endpoint.go](file:///d:/claude/nomad/nomad/deployment_endpoint.go) | 部署 promote/pause/fail |
| Event | [nomad/event_endpoint.go](file:///d:/claude/nomad/nomad/event_endpoint.go) | Event.Stream（流式） |
| Eval | [nomad/eval_endpoint.go](file:///d:/claude/nomad/nomad/eval_endpoint.go) | Eval.Dequeue/List/Reap |
| FileSystem | [nomad/client_fs_endpoint.go](file:///d:/claude/nomad/nomad/client_fs_endpoint.go) | FS.List/Stat/Logs/Stream（部分流式） |
| HostVolume | [nomad/host_volume_endpoint.go](file:///d:/claude/nomad/nomad/host_volume_endpoint.go) | 主机卷 CRUD |
| Job | [nomad/job_endpoint.go](file:///d:/claude/nomad/nomad/job_endpoint.go) | Register/Plan/Scale/Validate |
| Keyring | [nomad/keyring_endpoint.go](file:///d:/claude/nomad/nomad/keyring_endpoint.go) | 加密 Key 轮转 |
| Namespace | [nomad/namespace_endpoint.go](file:///d:/claude/nomad/nomad/namespace_endpoint.go) | 命名空间 CRUD |
| Node | [nomad/node_endpoint.go](file:///d:/claude/nomad/nomad/node_endpoint.go) | 节点注册/Drain/Eligibility |
| NodePool | [nomad/node_pool_endpoint.go](file:///d:/claude/nomad/nomad/node_pool_endpoint.go) | 节点池 |
| Operator | [nomad/operator_endpoint.go](file:///d:/claude/nomad/nomad/operator_endpoint.go) | Raft/Snapshot/Autopilot（含流式） |
| Periodic | [nomad/periodic_endpoint.go](file:///d:/claude/nomad/nomad/periodic_endpoint.go) | 周期任务 |
| Plan | [nomad/plan_endpoint.go](file:///d:/claude/nomad/nomad/plan_endpoint.go) | 调度 Plan |
| Region | [nomad/regions_endpoint.go](file:///d:/claude/nomad/nomad/regions_endpoint.go) | Region.List |
| Scaling | [nomad/scaling_endpoint.go](file:///d:/claude/nomad/nomad/scaling_endpoint.go) | ScalingPolicy |
| Search | [nomad/search_endpoint.go](file:///d:/claude/nomad/nomad/search_endpoint.go) | 模糊搜索 |
| ServiceRegistration | [nomad/service_registration_endpoint.go](file:///d:/claude/nomad/nomad/service_registration_endpoint.go) | 服务注册 |
| Status | [nomad/status_endpoint.go](file:///d:/claude/nomad/nomad/status_endpoint.go) | Leader/Peers/HasNodeConn |
| System | [nomad/system_endpoint.go](file:///d:/claude/nomad/nomad/system_endpoint.go) | GC/Reconcile |
| Variables | [nomad/variables_endpoint.go](file:///d:/claude/nomad/nomad/variables_endpoint.go) | 变量 CRUD |
| TaskGroupHostVolumeClaim | [nomad/task_group_host_volume_claim_endpoint.go](file:///d:/claude/nomad/nomad/task_group_host_volume_claim_endpoint.go) | 任务组主机卷申领 |
| ClientHostVolume | [nomad/client_host_volume_endpoint.go](file:///d:/claude/nomad/nomad/client_host_volume_endpoint.go) | 转发到 Client 的主机卷操作 |

### 3.3 流式 RPC 注册

流式 RPC 通过 `StreamingRpcRegistry` 注册，使用 `RpcStreaming` 字节协商。注册点见各 Endpoint 构造函数：

| 方法名 | 注册文件 | 行号 | 用途 |
|--------|----------|------|------|
| `Agent.Monitor` | [nomad/client_agent_endpoint.go](file:///d:/claude/nomad/nomad/client_agent_endpoint.go#L36) | 36 | Agent 日志监控 |
| `Agent.MonitorExport` | 同上 | 37 | Agent 导出监控数据 |
| `Allocations.Exec` | [nomad/client_alloc_endpoint.go](file:///d:/claude/nomad/nomad/client_alloc_endpoint.go#L36) | 36 | 在 Allocation 中执行命令 |
| `FileSystem.Logs` | [nomad/client_fs_endpoint.go](file:///d:/claude/nomad/nomad/client_fs_endpoint.go#L36) | 36 | 实时日志流 |
| `FileSystem.Stream` | 同上 | 37 | 文件流 |
| `Event.Stream` | [nomad/event_endpoint.go](file:///d:/claude/nomad/nomad/event_endpoint.go#L30) | 30 | 集群事件流 |
| `Operator.SnapshotSave` | [nomad/operator_endpoint.go](file:///d:/claude/nomad/nomad/operator_endpoint.go#L41) | 41 | Raft 快照下载 |
| `Operator.SnapshotRestore` | 同上 | 42 | Raft 快照恢复 |

### 3.4 RPC 转发逻辑（forward）

[nomad/rpc.go:586](file:///d:/claude/nomad/nomad/rpc.go#L586) 的 `forward` 是 Server 端 RPC 路由的核心：

```go
func (r *rpcHandler) forward(method string, info structs.RPCInfo, args, reply interface{}) (bool, error) {
    region := info.RequestRegion()
    // 1) 跨 region → forwardRegion（找对端 region 服务器）
    if region != r.srv.config.Region {
        info.SetForwarded()
        return true, r.forwardRegion(region, method, args, reply)
    }
    // 2) 允许 stale read → 直接本地处理
    if info.IsRead() && info.AllowStaleRead() {
        return false, nil
    }
    // 3) 否则路由到 leader
    remoteServer, err := r.getLeaderForRPC()
    if remoteServer == nil {
        return false, nil  // 本地就是 leader 且已就绪
    }
    info.SetForwarded()
    return true, r.forwardLeader(remoteServer, method, args, reply)
}
```

**三种转发模式：**

| 方法 | 文件 | 触发条件 | 目标 |
|------|------|----------|------|
| `forwardRegion` | [rpc.go:716](file:///d:/claude/nomad/nomad/rpc.go#L716) | `info.RequestRegion() != 本地区域` | 通过 `peersCache.RegionPeers` 随机选一台对端 region server |
| `forwardLeader` | [rpc.go:694](file:///d:/claude/nomad/nomad/rpc.go#L694) | 本地非 leader 且非 stale read | `connPool.RPC` 到 leader 地址 |
| `forwardServer` | [rpc.go:703](file:///d:/claude/nomad/nomad/rpc.go#L703) | 显式指定 server（如 `Agent.Profile` 指定节点） | `connPool.RPC` 到指定地址 |

**Leader 等待：** [rpc.go:608](file:///d:/claude/nomad/nomad/rpc.go#L608) `getLeaderForRPC` 在 `RPCHoldTimeout` 内重试选举中的 leader，超时返回 `ErrNoLeader` / `ErrNotReadyForConsistentReads`。

### 3.5 Server → Client 反向 RPC

Server 持有到 Client 的反向 yamux session（来自 Client 的 multiplex 连接）。相关代码在 [nomad/client_rpc.go](file:///d:/claude/nomad/nomad/client_rpc.go):

| 函数 | 行号 | 用途 |
|------|------|------|
| `nodeConnState` | [client_rpc.go:23](file:///d:/claude/nomad/nomad/client_rpc.go#L23) | 维护 NodeID → yamux.Session 映射 |
| `getNodeConn` | [client_rpc.go:34](file:///d:/claude/nomad/nomad/client_rpc.go#L34) | 查找已连接的 Client |
| `addNodeConn` | [client_rpc.go:78](file:///d:/claude/nomad/nomad/client_rpc.go#L78) | Multiplex 握手完成后登记 |
| `removeNodeConn` | [client_rpc.go:108](file:///d:/claude/nomad/nomad/client_rpc.go#L108) | 连接断开时清理 |
| `forwardClientRPC` | [client_rpc.go:212](file:///d:/claude/nomad/nomad/client_rpc.go#L212) | Server → Client 转发入口 |
| `NodeRpc` | [client_rpc.go:241](file:///d:/claude/nomad/nomad/client_rpc.go#L241) | 通过 yamux session 发起普通 RPC |
| `NodeStreamingRpc` | [client_rpc.go:269](file:///d:/claude/nomad/nomad/client_rpc.go#L269) | 通过 yamux session 发起流式 RPC |
| `findNodeConnAndForward` | [client_rpc.go:309](file:///d:/claude/nomad/nomad/client_rpc.go#L309) | 本地无连接时，通过 `Status.HasNodeConn` 找到持有连接的 server 转发 |

**关键路径**：Server 收到 `ClientAllocations.Stats` → `forward("ClientAllocations.Stats", ...)` → `forwardClientRPC` → `getNodeConn(nodeID)` → 若有 session 用 `NodeRpc`，否则 `findNodeConnAndForward` 跨 server 二跳转发。

### 3.6 Raft 写入路径

Server 处理写请求时，Endpoint 会调用 `raftApply` 把请求编码后通过 Raft 复制：

| 函数 | 文件 | 作用 |
|------|------|------|
| `raftApplyFuture` | [rpc.go:787](file:///d:/claude/nomad/nomad/rpc.go#L787) | 编码 `MessageType` + body，调用 `s.raft.Apply(buf, enqueueLimit)` |
| `raftApply` | [rpc.go:807](file:///d:/claude/nomad/nomad/rpc.go#L807) | 同步等待 Raft 提交，返回 FSM 响应 |

`enqueueLimit = 30 * time.Second` 限制入队等待时长，超过 1MB 的 Raft 命令会记录警告。

---

## 4. Client 端实现

### 4.1 入口与 RPC 接口

Client 既作为 RPC 客户端（向 Server 发请求），又作为 RPC 服务端（接受 Server 反向调用）。

| 文件 | 函数 | 作用 |
|------|------|------|
| [client/rpc.go:39](file:///d:/claude/nomad/client/rpc.go#L39) | `Client.ClientRPC` | 进程内 RPC（通过 `InmemCodec`），不经过网络 |
| [client/rpc.go:47](file:///d:/claude/nomad/client/rpc.go#L47) | `Client.StreamingRpcHandler` | 进程内流式 RPC |
| [client/rpc.go:55](file:///d:/claude/nomad/client/rpc.go#L55) | `Client.RPC` | 向 Server 发起 RPC（阻塞直到节点注册完成） |
| [client/rpc.go:65](file:///d:/claude/nomad/client/rpc.go#L65) | `Client.UnauthenticatedRPC` | 不等待注册（仅用于 `Node.Register`） |
| [client/rpc.go:72](file:///d:/claude/nomad/client/rpc.go#L72) | `Client.rpc` | 重试 + 服务器切换的核心逻辑 |
| [client/rpc.go:127](file:///d:/claude/nomad/client/rpc.go#L127) | `canRetry` | 判断错误是否可重试（无 leader、读 EOF） |
| [client/rpc.go:148](file:///d:/claude/nomad/client/rpc.go#L148) | `RemoteStreamingRpcHandler` | 向 Server 申请流式 RPC |
| [client/rpc.go:159](file:///d:/claude/nomad/client/rpc.go#L159) | `bridgedStreamingRpcHandler` | 双向 io.Copy 桥接 |
| [client/rpc.go:171](file:///d:/claude/nomad/client/rpc.go#L171) | `streamingRpcConn` | 拨号 + TLS 升级 + yamux.Open + 发送 `RpcStreaming` |

### 4.2 RPC 重试策略

[client/rpc.go:72-145](file:///d:/claude/nomad/client/rpc.go#L72-L145) 实现了 deadline-aware 重试：

```go
deadline := time.Now().Add(conf.RPCHoldTimeout)
if info, ok := args.(structs.RPCInfo); ok {
    deadline = deadline.Add(info.TimeToBlock())  // 阻塞查询可等待更久
TRY:
    server := c.servers.FindServer()
    rpcErr = c.connPool.RPC(c.Region(), server.Addr, method, args, reply)
    if rpcErr == nil { return nil }

    c.servers.NotifyFailedServer(server)
    if !canRetry(args, rpcErr) { return rpcErr }

    if time.Now().After(deadline) {
        // 阻塞查询最后再试一次（time-to-block=0）
        return c.RPC(method, args, reply)
    }
    // jitter 等待后 goto TRY
```

**可重试条件：**
- `ErrNoLeader`（无状态变更风险）
- 读请求且服务端返回 EOF（server 关闭）

### 4.3 Client 端 RPC Server

Client 也会接受 Server 反向发起的 RPC。入口 [client/rpc.go:291](file:///d:/claude/nomad/client/rpc.go#L291) `setupClientRpc`：

```go
func (c *Client) setupClientRpc(rpcs map[string]interface{}) {
    c.rpcServer = rpc.NewServer()
    if rpcs != nil {
        // 测试覆盖
        for name, rpc := range rpcs {
            c.rpcServer.RegisterName(name, rpc)
        }
    } else {
        c.endpoints.ClientStats    = &ClientStats{c}
        c.endpoints.CSI            = &CSI{c}
        c.endpoints.FileSystem     = NewFileSystemEndpoint(c)
        c.endpoints.Allocations    = NewAllocationsEndpoint(c)
        c.endpoints.Agent          = NewAgentEndpoint(c)
        c.endpoints.NodeIdentity   = newNodeIdentityEndpoint(c)
        c.endpoints.NodeMeta       = newNodeMetaEndpoint(c)
        c.endpoints.HostVolume     = newHostVolumesEndpoint(c)
        c.setupClientRpcServer(c.rpcServer)
    }
    go c.rpcConnListener()
}
```

#### Client Endpoint 注册（[client/rpc.go:308-316](file:///d:/claude/nomad/client/rpc.go#L308-L316)）

```go
func (c *Client) setupClientRpcServer(server *rpc.Server) {
    server.Register(c.endpoints.ClientStats)
    server.Register(c.endpoints.CSI)
    server.Register(c.endpoints.FileSystem)
    server.Register(c.endpoints.Allocations)
    server.Register(c.endpoints.Agent)
    _ = server.Register(c.endpoints.NodeIdentity)
    server.Register(c.endpoints.NodeMeta)
    server.Register(c.endpoints.HostVolume)
}
```

#### Client Endpoint 文件清单

| Endpoint | 文件 | 主要方法 |
|----------|------|----------|
| ClientStats | [client/client_stats_endpoint.go](file:///d:/claude/nomad/client/client_stats_endpoint.go) | Stats（主机资源） |
| CSI | [client/csi_endpoint.go](file:///d:/claude/nomad/client/csi_endpoint.go) | 卷挂载/卸载（plugin 调用） |
| FileSystem | [client/fs_endpoint.go](file:///d:/claude/nomad/client/fs_endpoint.go) | ls/stat/cat/logs/stream（流式） |
| Allocations | [client/alloc_endpoint.go](file:///d:/claude/nomad/client/alloc_endpoint.go) | Exec/Stats/Signal/Restart/GC |
| Agent | [client/agent_endpoint.go](file:///d:/claude/nomad/client/agent_endpoint.go) | Monitor/MonitorExport（流式） |
| NodeIdentity | [client/nodeidentity_endpoint.go](file:///d:/claude/nomad/client/nodeidentity_endpoint.go) | 节点身份令牌签发 |
| NodeMeta | [client/node_meta_endpoint.go](file:///d:/claude/nomad/client/node_meta_endpoint.go) | 节点元数据读写 |
| HostVolume | [client/host_volume_endpoint.go](file:///d:/claude/nomad/client/host_volume_endpoint.go) | 主机卷 CRUD |

### 4.4 Client 端连接监听器

[client/rpc.go:319-357](file:///d:/claude/nomad/client/rpc.go#L319-L357) 的 `rpcConnListener` + `listenConn` + `handleConn` 与 Server 端结构对称，但只处理 `RpcNomad` 和 `RpcStreaming` 两种字节（Client 不接受 Raft/Multiplex 流量）。

```go
func (c *Client) handleConn(conn net.Conn) {
    buf := make([]byte, 1)
    conn.Read(buf)
    switch pool.RPCType(buf[0]) {
    case pool.RpcNomad:      c.handleNomadConn(conn)   // rpc.Server.ServeRequest
    case pool.RpcStreaming:  c.handleStreamingConn(conn)
    default:                 conn.Close()
    }
}
```

### 4.5 Client 端流式 RPC 注册

| 方法名 | 注册文件 | 行号 |
|--------|----------|------|
| `Allocations.Exec` | [client/alloc_endpoint.go](file:///d:/claude/nomad/client/alloc_endpoint.go#L33) | 33 |
| `Agent.Monitor` | [client/agent_endpoint.go](file:///d:/claude/nomad/client/agent_endpoint.go#L31) | 31 |
| `Agent.MonitorExport` | 同上 | 32 |
| `FileSystem.Logs` | [client/fs_endpoint.go](file:///d:/claude/nomad/client/fs_endpoint.go#L83) | 83 |
| `FileSystem.Stream` | 同上 | 84 |

注意 Server 与 Client 都注册了相同方法名（如 `Allocations.Exec`）：Server 端注册是为了接受 CLI 直连，Client 端注册是为了接受 Server 转发。最终调用都落到 Client 实现上。

---

## 5. 连接池与多路复用

[helper/pool/pool.go](file:///d:/claude/nomad/helper/pool/pool.go) 的 `ConnPool` 是所有跨节点 RPC 的底层抽象。

### 5.1 关键类型

| 类型 | 文件 | 说明 |
|------|------|------|
| `RPCType` | [helper/pool/conn.go:6](file:///d:/claude/nomad/helper/pool/conn.go#L6) | Magic byte 枚举 |
| `Conn` | [pool.go:55](file:///d:/claude/nomad/helper/pool/pool.go#L55) | 单个池化连接（一个 yamux.Session） |
| `StreamClient` | [pool.go:34](file:///d:/claude/nomad/helper/pool/pool.go#L34) | 包装 yamux stream + codec |
| `ConnPool` | [pool.go:230+](file:///d:/claude/nomad/helper/pool/pool.go#L230) | 按 addr 缓存 Conn 的连接池 |

### 5.2 ConnPool 核心方法

| 方法 | 行号 | 作用 |
|------|------|------|
| `NewClientCodec` / `NewServerCodec` | [pool.go:24-30](file:///d:/claude/nomad/helper/pool/pool.go#L24-L30) | msgpack-rpc 编解码器 |
| `Conn.getRPCClient` | [pool.go:86](file:///d:/claude/nomad/helper/pool/pool.go#L86) | 复用或新建 StreamClient，发送 `RpcNomad` 字节 |
| `ConnPool.acquire` | [pool.go:317](file:///d:/claude/nomad/helper/pool/pool.go#L317) | 取/建连接，lead-thread 模式避免惊群 |
| `ConnPool.getNewConn` | [pool.go:388](file:///d:/claude/nomad/helper/pool/pool.go#L388) | TCP 拨号 → 可选 `RpcTLS` → `RpcMultiplexV2` → yamux.Client |
| `ConnPool.clearConn` | [pool.go:448](file:///d:/claude/nomad/helper/pool/pool.go#L448) | 出错时从池中清除并标记 shouldClose |
| `ConnPool.getRPCClient` | [pool.go:466](file:///d:/claude/nomad/helper/pool/pool.go#L466) | acquire + getRPCClient 包装 |
| `ConnPool.StreamingRPC` | [pool.go:493](file:///d:/claude/nomad/helper/pool/pool.go#L493) | 开 yamux stream + 发送 `RpcStreaming` |
| `ConnPool.RPC` | [pool.go:513](file:///d:/claude/nomad/helper/pool/pool.go#L513) | 入口：发起一次 RPC |
| `ConnPool.reap` | [pool.go:549](file:///d:/claude/nomad/helper/pool/pool.go#L549) | 定期回收超时空闲连接 |
| `ConnPool.ReloadTLS` | [pool.go:288](file:///d:/claude/nomad/helper/pool/pool.go#L288) | 运行时热替换 TLS 包装器 |
| `ConnPool.SetConnListener` | [pool.go:302](file:///d:/claude/nomad/helper/pool/pool.go#L302) | 把新建 Conn 通知给 Client，用于反向 RPC 监听 |

### 5.3 连接生命周期

```
Client.RPC()
   │
   ▼
ConnPool.RPC(region, addr, method, args, reply)
   │
   ▼
getRPCClient ──► acquire ──► (cache hit?) ──► Conn.getRPCClient
                   │                                 │
                   ▼ miss                            ▼
              getNewConn                       StreamClient{stream, codec}
                   │                                 │
                   ▼                                 │
        net.DialTimeout("tcp", ...)                  │
        TcpConn.SetKeepAlive(true)                   │
        TcpConn.SetNoDelay(true)                     │
                   │                                 │
                   ▼ (if TLS)                        │
        conn.Write(RpcTLS)                           │
        tlsConn = tlsWrap(region, conn)              │
                   │                                 │
                   ▼                                 │
        conn.Write(RpcMultiplexV2)                   │
        session = yamux.Client(conn, cfg)            │
                   │                                 │
                   ▼                                 │
        c = &Conn{session, ...}                      │
        p.pool[addr] = c                             │
        p.SetConnListener 通知 Client (反向 RPC)     │
                   │                                 │
                   └─────────────────────────────────┘
                                  │
                                  ▼
                       stream.Write(RpcNomad)
                       msgpackrpc.CallWithCodec(codec, method, args, reply)
                                  │
                                  ▼
                       (成功) conn.returnClient(sc)  ← 复用
                       (失败) sc.Close(); clearConn  ← 重建
```

### 5.4 反向 RPC 通道

`ConnPool.SetConnListener` 把每个新建的 `*Conn` 推给 Client 的 `rpcConnListener`，Client 通过 `conn.AcceptStream()` 接受 Server 主动发起的子流。这样 Server 与 Client 共用同一条 TCP 连接做双向通信，避免再开端口。

---

## 6. RPC 类型与协议数据结构

### 6.1 RPCInfo 接口

[nomad/structs/structs.go:251](file:///d:/claude/nomad/nomad/structs/structs.go#L251) 定义了 RPC 元信息接口，所有 RPC 参数都嵌入 `QueryOptions` 或 `WriteRequest` 来满足该接口：

```go
type RPCInfo interface {
    RequestRegion() string
    IsRead() bool
    AllowStaleRead() bool
    IsForwarded() bool
    SetForwarded()
    TimeToBlock() time.Duration
    SetTimeToBlock(t time.Duration)
}
```

| 实现 | 行号 | IsRead | AllowStaleRead | TimeToBlock |
|------|------|--------|----------------|-------------|
| `QueryOptions` | [structs.go:336-375](file:///d:/claude/nomad/nomad/structs/structs.go#L336) | true | `AllowStale` 字段 | `MaxQueryTime` 截断 |
| `WriteRequest` | [structs.go:456-485](file:///d:/claude/nomad/nomad/structs/structs.go#L456) | false | false | 0 |

`InternalRpcInfo`（[structs.go:274](file:///d:/claude/nomad/nomad/structs/structs.go#L274)）通过嵌入方式提供 `IsForwarded/SetForwarded`，避免 API 包暴露内部字段。

### 6.2 流式 RPC 数据结构

[nomad/structs/streaming_rpc.go](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go):

```go
type StreamingRpcHeader struct {
    Method string  // 方法名，如 "Allocations.Exec"
}

type StreamingRpcAck struct {
    Error string  // 路由失败时填充
}

type StreamingRpcHandler func(conn io.ReadWriteCloser)

type StreamingRpcRegistry struct {
    registry map[string]StreamingRpcHandler
}
```

**握手协议：**
1. 客户端发送 `RpcStreaming` 字节
2. 客户端 `Encode(StreamingRpcHeader{Method})`
3. 服务端 `GetHandler(Method)` → `Encode(StreamingRpcAck{})`
4. ack.Error 为空则进入 handler，`io.Copy` 双向桥接

`structs.Bridge(a, b)`（[streaming_rpc.go:64](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go#L64)）是常用的双向桥接工具。

### 6.3 InmemCodec（进程内 RPC）

[helper/codec/inmem.go](file:///d:/claude/nomad/helper/codec/inmem.go) 让 Agent 进程内 CLI 子命令直接走 `rpc.Server.ServeRequest` 而不经过网络，常用于 `nomad agent` 自身调用本地 Client：

```go
func (c *Client) ClientRPC(method string, args, reply interface{}) error {
    codec := &inmem.InmemCodec{Method: method, Args: args, Reply: reply}
    c.rpcServer.ServeRequest(codec)
    return codec.Err
}
```

---

## 7. Raft 层与 RPC 的集成

### 7.1 RaftLayer

[nomad/raft_rpc.go:18](file:///d:/claude/nomad/nomad/raft_rpc.go#L18) 实现 `raft.StreamLayer` 接口，让 Raft 流量复用 RPC TCP 端口：

| 方法 | 行号 | 作用 |
|------|------|------|
| `NewRaftLayer` | [raft_rpc.go:40](file:///d:/claude/nomad/nomad/raft_rpc.go#L40) | 创建带 `connCh` 的层 |
| `Handoff` | [raft_rpc.go:52](file:///d:/claude/nomad/nomad/raft_rpc.go#L52) | `rpcHandler.handleConn` 在收到 `RpcRaft` 字节时调用，把 conn 推入 `connCh` |
| `Accept` | [raft_rpc.go:65](file:///d:/claude/nomad/nomad/raft_rpc.go#L65) | Raft 库从 `connCh` 取连接 |
| `Dial` | [raft_rpc.go:107](file:///d:/claude/nomad/nomad/raft_rpc.go#L107) | Raft 库主动连其他 server：可选 `RpcTLS` + `RpcRaft` |
| `ReloadTLS` | [raft_rpc.go:95](file:///d:/claude/nomad/nomad/raft_rpc.go#L95) | 热替换 TLS 包装 |

### 7.2 Raft TLS 校验

[nomad/rpc.go:325-335](file:///d:/claude/nomad/nomad/rpc.go#L325-L335) `validateRaftTLS` 强制 Raft 连接的证书 CN 必须为 `server.<region>.nomad`，防止 Client 证书冒充 Server 参与 Raft。

### 7.3 Raft Apply

写请求由 Endpoint 编码为 `MessageType` + body，通过 `s.raft.Apply(buf, enqueueLimit)` 提交。FSM 在 `apply()` 中按类型分发到具体处理函数（如 `jobRegister`、`nodeUpdate`），返回值通过 `future.Response()` 取回。

---

## 8. RPC 调用链：典型场景示例

### 8.1 `nomad job run`（CLI → Server，写）

```
1. CLI: command/agent.go: client.Jobs().Register(job, q)
2. API client (api/jobs.go): PUT /v1/jobs → Server HTTP handler
3. Server HTTP handler: jobsRequestHandler
4. jobs.go endpoint: Jobs.Register(args, reply)
5.   forward("Job.Register", info, args, reply)
6.   forwardLeader → connPool.RPC(leader, "Job.Register", args, reply)
7. Leader 端 endpoint: s.raftApply(JobRegisterRequestType, args)
8. Raft 复制 → FSM.Apply → 写入 state store
9. 返回 Index/ModifyIndex
```

### 8.2 `nomad alloc exec`（CLI → Server → Client，流式）

```
1. CLI: client.Allocations().Exec(ctx, allocID, req, q)
2. API client: 申请流式连接（WebSocket 风格）
3. Server HTTP: 转 RPC → StreamingRpcConn
4. Server streamingRpcConn:
   - connPool.StreamingRPC(server, addr)
   - stream.Write(RpcStreaming)
   - Encode(StreamingRpcHeader{"Allocations.Exec"})
5. Server rpcHandler.handleStreamingConn:
   - 查 streamingRpcs["Allocations.Exec"]  (注册在 client_alloc_endpoint.go)
   - 调用 a.exec(conn)
6. a.exec 内部: forwardClientRPC → NodeStreamingRpc(session, "Allocations.Exec")
7. Client.handleStreamingConn:
   - 查 c.streamingRpcs["Allocations.Exec"]
   - 调用 Allocations.exec（实际执行 docker/exec 进入容器）
8. 双向 io.Copy 桥接 stdin/stdout
```

### 8.3 `nomad node status`（CLI → Server，读，stale-able）

```
1. CLI: client.Nodes().List(q)  // q.AllowStale=true
2. HTTP GET /v1/nodes → Server
3. Node.List(args, reply)
4.   forward("Node.List", info, args, reply)
5.   info.IsRead() && info.AllowStaleRead() → 返回 (false, nil)
6. 本地 snapshot 查询 state store
7. setQueryMeta(reply.QueryMeta)  // 填 KnownLeader/LastContact
8. 返回
```

### 8.4 跨 Region 查询（`region=us-west`）

```
1. CLI: client.SetRegion("us-west"); client.Jobs().List(q)
2. Server HTTP → Jobs.List
3.   forward("Job.List", info, args, reply)
4.   info.RequestRegion()=="us-west" != config.Region=="us-east"
5.   forwardRegion("us-west", method, args, reply)
6.   peersCache.RegionPeers("us-west") → 随机选一台 us-west server
7.   connPool.RPC("us-west", addr, "Job.List", args, reply)
8. us-west server 同样走 forward → 本地是 leader → 直接处理
```

---

## 9. 关键配置项

| 配置 | 默认值 | 作用 |
|------|--------|------|
| `RPCMaxConnsPerClient` | 0（不限） | 单 IP 最大 RPC 连接数 |
| `LimitsNonStreamingConnsPerClient` | 2 | 流式连接子配额基数 |
| `RPCHandshakeTimeout` | — | 未认证连接首字节超时 |
| `RPCHoldTimeout` | — | 等待 leader 的最大抖动窗口 |
| `RPCDialTimeout` | 10s (`defaultDialTimeout`) | TCP 拨号超时 |
| `TLSConfig.EnableRPC` | false | RPC 是否强制 TLS |
| `TLSConfig.RPCUpgradeMode` | false | 是否允许明文→TLS 升级 |
| `MaxBlockingRPCQueryTime` | — | `QueryOptions.TimeToBlock` 上限 |
| `raftWarnSize` | 1MB | Raft 命令大小警告阈值 |
| `enqueueLimit` | 30s | Raft 入队等待上限 |

---

## 10. 端到端调用关系总览

### 10.1 Server 端 RPC 入口与转发链

```
TCP Listener (server.go: rpcListener)
        │
        ▼
rpcHandler.listen (rpc.go:203)         ──►  connLimiter 限流
        │
        ▼
rpcHandler.handleConn (rpc.go:283)     ──►  读首字节路由
        │
        ├──► RpcNomad       → rpc.Server + setupRpcServer (server.go:1296)
        │                       │
        │                       ▼
        │                   Endpoint.Register(args, reply)
        │                       │
        │                       ▼
        │                   rpcHandler.forward (rpc.go:586)
        │                       │
        │                       ├──► forwardRegion (跨 region)
        │                       ├──► forwardLeader (本地非 leader)
        │                       └──► (本地是 leader) → 本地处理
        │                                                   │
        │                                                   ▼
        │                                           读: state.Snapshot()
        │                                           写: raftApply (rpc.go:807)
        │
        ├──► RpcRaft        → raftLayer.Handoff (raft_rpc.go:52)
        │
        ├──► RpcMultiplex   → yamux.Server + handleMultiplex (rpc.go:410)
        │
        ├──► RpcMultiplexV2 → handleMultiplexV2
        │
        ├──► RpcTLS         → tls.Server + 递归 handleConn
        │
        └──► RpcStreaming   → handleStreamingConn (rpc.go:524)
                                │
                                ▼
                            streamingRpcs.GetHandler(method)
                                │
                                ▼
                            handler(conn)
                                │
                                ▼
                            (ClientAllocations.exec 等)
                                │
                                ▼
                            forwardClientRPC (client_rpc.go:212)
                                │
                                ├──► NodeRpc (本地有 session)
                                └──► findNodeConnAndForward (跨 server 转发)
```

### 10.2 Client 端 RPC 入口

```
Client.RPC(method, args, reply) (rpc.go:55)
        │
        ▼
Client.rpc (rpc.go:72)               ──► 重试 + 服务器切换
        │
        ▼
connPool.RPC(region, addr, method, args, reply) (pool.go:513)
        │
        ▼
yamux stream + RpcNomad 字节 → msgpackrpc.CallWithCodec


反向通道:
ConnPool.SetConnListener (pool.go:302)
        │
        ▼
Client.rpcConnListener (rpc.go:319)  ──► 接受 server 主动连接
        │
        ▼
Client.listenConn (rpc.go:341)       ──► AcceptStream
        │
        ▼
Client.handleConn (rpc.go:366)
        │
        ├──► RpcNomad      → rpc.Server.ServeRequest (本地 Endpoint)
        └──► RpcStreaming  → handleStreamingConn → streamingRpcs handler
```

---

## 11. 关键文件索引

### Server 端

| 文件 | 用途 |
|------|------|
| [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | Server 主体：监听器、setupRPC、setupRpcServer、leader 检测 |
| [nomad/rpc.go](file:///d:/claude/nomad/nomad/rpc.go) | rpcHandler：accept、handleConn 路由、forward/forwardLeader/forwardRegion/forwardServer、handleStreamingConn、raftApply |
| [nomad/raft_rpc.go](file:///d:/claude/nomad/nomad/raft_rpc.go) | RaftLayer：Raft 流量复用 RPC 端口 |
| [nomad/client_rpc.go](file:///d:/claude/nomad/nomad/client_rpc.go) | Server → Client 反向 RPC：nodeConns 维护、forwardClientRPC、NodeRpc、NodeStreamingRpc、findNodeConnAndForward |
| [nomad/structs/structs.go](file:///d:/claude/nomad/nomad/structs/structs.go) | RPCInfo 接口、QueryOptions、WriteRequest |
| [nomad/structs/streaming_rpc.go](file:///d:/claude/nomad/nomad/structs/streaming_rpc.go) | 流式 RPC 协议结构与注册表 |
| [nomad/endpoints_ce.go](file:///d:/claude/nomad/nomad/endpoints_ce.go) | CE 版企业 Endpoint 占位 |
| [nomad/*_endpoint.go](file:///d:/claude/nomad/nomad) | 各业务 Endpoint（约 30 个） |

### Client 端

| 文件 | 用途 |
|------|------|
| [client/client.go](file:///d:/claude/nomad/client/client.go) | Client 主体：rpcServer、streamingRpcs、endpoints |
| [client/rpc.go](file:///d:/claude/nomad/client/rpc.go) | Client.RPC/UnauthenticatedRPC/RemoteStreamingRpcHandler、setupClientRpc、rpcConnListener、handleConn、handleStreamingConn |
| [client/alloc_endpoint.go](file:///d:/claude/nomad/client/alloc_endpoint.go) | Allocations Endpoint（Exec 等） |
| [client/agent_endpoint.go](file:///d:/claude/nomad/client/agent_endpoint.go) | Agent Endpoint（Monitor） |
| [client/fs_endpoint.go](file:///d:/claude/nomad/client/fs_endpoint.go) | FileSystem Endpoint（Logs/Stream） |
| [client/client_stats_endpoint.go](file:///d:/claude/nomad/client/client_stats_endpoint.go) | ClientStats |
| [client/csi_endpoint.go](file:///d:/claude/nomad/client/csi_endpoint.go) | CSI |
| [client/node_meta_endpoint.go](file:///d:/claude/nomad/client/node_meta_endpoint.go) | NodeMeta |
| [client/nodeidentity_endpoint.go](file:///d:/claude/nomad/client/nodeidentity_endpoint.go) | NodeIdentity |
| [client/host_volume_endpoint.go](file:///d:/claude/nomad/client/host_volume_endpoint.go) | HostVolume |
| [client/testing.go](file:///d:/claude/nomad/client/testing.go) | 测试用 RPC 覆盖 |

### 共享基础设施

| 文件 | 用途 |
|------|------|
| [helper/pool/pool.go](file:///d:/claude/nomad/helper/pool/pool.go) | ConnPool：连接池、yamux 多路复用、RPC/StreamingRPC |
| [helper/pool/conn.go](file:///d:/claude/nomad/helper/pool/conn.go) | RPCType 常量 |
| [helper/codec/inmem.go](file:///d:/claude/nomad/helper/codec/inmem.go) | InmemCodec：进程内 RPC |
| [helper/pool/conn.go](file:///d:/claude/nomad/helper/pool/conn.go) | RPC 类型字节常量 |

---

## 12. 设计要点小结

1. **单端口多协议**：RPC、Raft、流式 RPC 共用同一 TCP 端口，靠 magic byte 区分，简化部署与防火墙配置。
2. **yamux 多路复用**：单条 TCP 连接承载多个并发 RPC，配合 `ConnPool` 按 addr 复用，避免连接风暴。
3. **双向连接复用**：Client → Server 建立的 yamux session 同时被 Server → Client 反向 RPC 使用，无需 Client 开端口。
4. **分层转发**：`forward` 统一处理 region 转发、leader 转发、stale-read 短路；`forwardClientRPC` 处理 Server → Client 转发（含跨 server 二跳）。
5. **deadline-aware 重试**：Client 在 `RPCHoldTimeout + TimeToBlock` 内做 jitter 重试，避免 leader 选举期间雪崩。
6. **per-connection RPCContext**：每条新连接重建 `rpc.Server`，Endpoint 持有 TLS 证书链与 NodeID，便于 ACL 与节点身份校验。
7. **流式 RPC 注册表**：`StreamingRpcRegistry` 提供方法名 → handler 的简单查表，支持 Exec/Logs/Event/Snapshot 等长连接场景。
8. **Raft 写入隔离**：所有写都经 `raftApply` 编码后由 leader 复制，FSM.Apply 是唯一状态变更入口；`InternalRpcInfo.Forwarded` 防止重复转发。
9. **TLS 热升级**：`ConnPool.ReloadTLS` 与 `RaftLayer.ReloadTLS` 支持运行时轮转证书，无需重启。
10. **限流双轨**：`connLimiter`（总连接）与 `streamLimiter`（流式连接）独立配置，保证 Raft/控制 RPC 不被流式 RPC 挤占。
