# Nomad Server 启动流程分析

本文档基于 Nomad 源码（`command/agent`、`nomad`、`helper` 等包），系统梳理 Nomad Server 的启动链路、`NewServer` 各阶段、关键后台协程、Leader 选主流程以及优雅关闭过程。所有代码位置以源码行号引用。

## 1. 总体架构

Nomad Server 是控制面的核心组件，承担集群元数据存储、调度决策、状态同步等职责。其核心子系统包括：

```
                         ┌────────────────────────────────────────────┐
                         │              nomad agent                    │
                         │  (command/agent/agent.go: NewAgent)         │
                         └─────────────┬──────────────────────────────┘
                                       │ setupServer()
                                       ▼
        ┌─────────────────────────────────────────────────────────────┐
        │             nomad.NewServer  (nomad/server.go:336)          │
        │                                                            │
        │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────────┐  │
        │  │  RPC    │  │  Raft   │  │  Serf   │  │  FSM/State   │  │
        │  │ Listener│  │ Consensu│  │  Gossip │  │  (MemDB)     │  │
        │  └─────────┘  └─────────┘  └─────────┘  └──────────────┘  │
        │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
        │  │ Eval     │ │ Plan     │ │ Worker   │ │ Deployment   │  │
        │  │ Broker   │ │ Queue    │ │ Pool     │ │ /Volume      │  │
        │  │ /Blocked │ │ /Planner │ │          │ │ Watchers     │  │
        │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
        │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
        │  │ Heartbeat│ │ Periodic │ │ Node     │ │ Autopilot    │  │
        │  │ Timers   │ │ Dispatch │ │ Drainer  │ │ (Raft)       │  │
        │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
        │  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
        │  │ Encrypter│ │ OIDC     │ │ Auth     │                   │
        │  │ /Keyring │ │ Cache    │ │          │                   │
        │  └──────────┘ └──────────┘ └──────────┘                   │
        └─────────────────────────────────────────────────────────────┘
```

### 1.1 关键设计原则

- **强一致性**：所有元数据写入经 Raft 共识，FSM 作为状态机应用日志
- **Leader-Follower**：仅 Leader 处理写入、调度评估、心跳定时器等 leader-only 子系统
- **Region 隔离**：每个 Region 拥有独立的 Server 集群和 Raft 组，跨 Region 通过 WAN gossip 联邦
- **流式 RPC**：除传统 RPC 外，提供 streaming RPC 用于事件流、文件系统访问等长连接场景

## 2. 启动入口链路

### 2.1 `nomad agent` 命令 → `NewAgent`

启动入口位于 `command/agent/agent.go:150` 的 `NewAgent` 函数：

```go
// command/agent/agent.go
func NewAgent(config *Config, ...) (*Agent, error) {
    a := &Agent{...}
    ...
    if err := a.setupServer(); err != nil {
        return nil, err
    }
    ...
}
```

### 2.2 `Agent.setupServer`

`setupServer`（[command/agent/agent.go:1175](file:///d:/claude/nomad/command/agent/agent.go#L1175)）负责：

1. **校验启用开关**：`a.config.Server.Enabled` 为 false 直接返回
2. **构建 Server 配置**：调用 `a.serverConfig()` 生成 `*nomad.Config`
3. **设置节点 ID**：`a.setupNodeID(conf)` 生成或恢复持久化的 NodeID
4. **配置 Gossip 密钥环**：`a.setupKeyrings(conf)` 设置 Serf 加密
5. **创建 Server**：调用 `nomad.NewServer(conf, a.consulCatalog, a.consulConfigEntriesFunc)`
6. **注册 Consul 服务**：当 `AutoAdvertise` 启用时，向 Consul 注册 HTTP/RPC/Serf 三种服务及健康检查

### 2.3 Server 配置关键项

`Config` 结构体（[nomad/config.go](file:///d:/claude/nomad/nomad/config.go)）核心字段：

| 字段 | 说明 |
|---|---|
| `Region` / `Datacenter` | 集群拓扑定位 |
| `NodeID` / `NodeName` | 节点身份 |
| `DataDir` | 持久化目录（raft、keystore 等） |
| `RPCAddr` / `SerfConfig` | 监听地址 |
| `BootstrapExpect` | 期望参与节点数（用于自动 bootstrapping） |
| `RaftConfig` | Raft 协议参数（protocol version、超时等） |
| `RaftLogStoreConfig` | 日志存储后端（BoltDB / WAL） |
| `TLSConfig` | TLS 配置 |
| `NumSchedulers` / `EnabledSchedulers` | 调度器工作池配置 |
| `ACLEnabled` / `AuthoritativeRegion` | ACL 与多区域复制 |
| `LicenseConfig` | 企业版许可证（CE 版空实现） |

## 3. `NewServer` 核心启动流程

`NewServer`（[nomad/server.go:336](file:///d:/claude/nomad/nomad/server.go#L336)）按顺序完成 22 个阶段：

### 阶段 1：TLS 与日志初始化

```go
tlsConf, err := tlsutil.NewTLSConfiguration(config.TLSConfig, true, true)
incomingTLS, tlsWrap, err := getTLSConf(config.TLSConfig.EnableRPC, tlsConf, config.Region)
logger := config.Logger.ResetNamedIntercept("nomad")
```

- 构建入站/出站 TLS 包装器
- 当 `VerifyServerHostname=true` 时，安装 `rpcNameAndRegionValidator` 校验证书 SAN 必须匹配 `client.<region>.nomad` 或 `server.*.nomad`

### 阶段 2：许可证校验

```go
if err = config.LicenseConfig.Validate(); err != nil {
    return nil, err
}
```

CE 版为空实现；企业版校验许可证有效性。

### 阶段 3：Server 结构体初始化

[nomad/server.go:371-403](file:///d:/claude/nomad/nomad/server.go#L371-L403) 构造 `Server` 结构体（定义见 [nomad/server.go:116](file:///d:/claude/nomad/nomad/server.go#L116)），关键字段：

- `connPool`：到其他 Server 的 RPC 连接池（`serverRPCCache` 缓存大小、`serverMaxStreams` 最大流）
- `rpcServer` / `streamingRpcs`：标准 RPC 和流式 RPC 注册表
- `peersCache`：Serf 成员解析缓存
- `reconcileCh`：将 Serf 事件传递给 leader loop
- `readyForConsistentReads`：原子标志，标记本地 FSM 是否赶上 Leader
- `lockTTLTimer` / `lockDelayTimer`：变量锁的 TTL 和延迟计时器（仅 Leader 维护）
- `shutdownCtx` / `shutdownCancel` / `shutdownCh`：关闭信号链

### 阶段 4：超时上下文与 EvalBroker

```go
startupTimeout, startupCancel := context.WithTimeout(s.shutdownCtx, s.config.StartTimeout)
defer startupCancel()

evalBroker, err := NewEvalBroker(s.shutdownCtx, ...)
s.evalBroker = evalBroker
s.blockedEvals = NewBlockedEvals(s.evalBroker, s.logger)
```

- `EvalBroker`（[nomad/eval_broker.go:146](file:///d:/claude/nomad/nomad/eval_broker.go#L146)）：调度评估队列，支持 NACK/重投递、交付限制
- `BlockedEvals`：因资源不足而被阻塞的评估，待集群容量变化后重投

### 阶段 5：RPC Handler、Planner、Heartbeater

```go
s.rpcHandler = newRpcHandler(s)
planner, err := newPlanner(s)
s.planner = planner
s.nodeHeartbeater = newNodeHeartbeater(s)
s.periodicDispatcher = NewPeriodicDispatch(s.logger, s)
s.statsFetcher = NewStatsFetcher(...)
s.consulConfigEntries = NewConsulConfigsAPI(...)
```

- `rpcHandler`（[nomad/rpc.go](file:///d:/claude/nomad/nomad/rpc.go)）：封装 RPC 监听、连接处理、流式 RPC 分发
- `planner`（[nomad/plan_apply.go](file:///d:/claude/nomad/nomad/plan_apply.go)）：调度计划应用器，从 `planQueue` 取计划评估并经 Raft 提交
- `nodeHeartbeater`（[nomad/heartbeat.go:49](file:///d:/claude/nomad/nomad/heartbeat.go#L49)）：追踪 Client 心跳 TTL，超时将节点标记为 down

### 阶段 6：Encrypter 与 OIDC

```go
keystorePath := filepath.Join(s.config.DataDir, "keystore")
encrypter, err := NewEncrypter(s, keystorePath)
s.encrypter = encrypter

if iss := config.OIDCIssuer; iss != "" {
    s.oidcDisco, err = structs.NewOIDCDiscoveryConfig(iss)
}
s.oidcProviderCache = oidc.NewProviderCache()
s.oidcRequestCache = oidc.NewRequestCache(6 * time.Minute)
```

- `Encrypter`（[nomad/encrypter.go](file:///d:/claude/nomad/nomad/encrypter.go)）：根密钥环，用于加密 Variables 和签署 Workload Identity JWT
- `oidcDisco`：外部 IdP 用于验证 Workload Identity 的发现端点配置

### 阶段 7：RPC 层初始化

```go
if err := s.setupRPC(tlsWrap); err != nil { ... }
```

`setupRPC`（[nomad/server.go:1203](file:///d:/claude/nomad/nomad/server.go#L1203)）：

1. `setupRpcServer`：向 `rpcServer` 注册所有 endpoint（ACL、Alloc、CSI、Deployment、Eval、Job、Keyring、Namespace、Node、NodePool、Periodic、Plan、Region、Scaling、Search、ServiceRegistration、Status、System、Variables、HostVolume 等）
2. `setupStreamingEndpoints`：注册流式 endpoint（ClientAllocations、FileSystem、Agent、Event、Operator）
3. `createRPCListener`：在 `config.RPCAddr` 上监听 TCP
4. 计算 `clientRpcAdvertise`（Client → Server 的 RPC 地址）和 `serverRpcAdvertise`（Server ↔ Server 的 RPC 地址，默认从 Serf advertise 派生）
5. 创建 `RaftLayer`（`raftRPC.go`）：Raft 传输层，复用同一 TCP 端口（通过 magic byte 区分 Raft / Nomad RPC）

### 阶段 8：Authenticator

```go
s.auth = auth.NewAuthenticator(&auth.AuthenticatorConfig{
    StateFn:        s.State,
    GetLeaderACLFn: s.getLeaderAcl,
    AclsEnabled:    s.config.ACLEnabled,
    VerifyTLS:      ...,
    Region:         s.Region(),
    Encrypter:      s.encrypter,
})
```

`auth.Authenticator` 负责解析请求中的 ACL token、签名验证 Workload Identity、应用 TLS 验证策略。

### 阶段 9：Raft 初始化

```go
if err := s.setupRaft(); err != nil { ... }
```

`setupRaft`（[nomad/server.go:1345](file:///d:/claude/nomad/nomad/server.go#L1345)）：

1. **FSM 创建**：`NewFSM(fsmConfig)`（[nomad/fsm.go:202](file:///d:/claude/nomad/nomad/fsm.go#L202)）构造状态机，内含 `state.StateStore`（MemDB）、`evalBroker`、`periodicDispatcher`、`blockedEvals`、`encrypter`，并注册所有 log applier 和 snapshot restorer
2. **Raft 传输层**：基于 `raftLayer` 创建 `raft.NetworkTransport`
3. **LogStore / StableStore / SnapshotStore**：
   - **Dev 模式**：`raft.NewInmemStore` + discard snapshot
   - **生产模式**：根据 `RaftLogStoreConfig.Backend` 选择
     - `BoltDB`：`raftboltdb.New`（`raft.db`），支持 `NoFreelistSync` 优化
     - `WAL`：`raftwal.Open`（`wal/` 目录），需先迁移旧 BoltDB
   - 旧 BoltDB → WAL 迁移需通过 `nomad operator raft migrate-backend` 离线完成
4. **LogCache 包装**：`raft.NewLogCache(raftLogCacheSize, store)` 提升读性能（除非 `DisableLogCache`）
5. **peers.json 恢复**：通过 `peers.info` sentinel 避免误用旧 peers.json；若手动放置 peers.json，则调用 `raft.RecoverCluster` 恢复
6. **单节点自举**：`isSingleServerCluster()` 且无现存状态时，调用 `raft.BootstrapCluster` 单节点配置
7. **创建 Raft 实例**：`raft.NewRaft(s.config.RaftConfig, s.fsm, log, stable, snap, trans)`

可选的 `startRaftLogVerifier`（[nomad/server.go:1663](file:///d:/claude/nomad/nomad/server.go#L1663)）：每 5 分钟验证存储健康（BoltDB 统计、WAL 单调性）。

### 阶段 10：Serf WAN 初始化

```go
s.serf, err = s.setupSerf(config.SerfConfig, s.eventCh, serfSnapshot)
```

`setupSerf`（[nomad/server.go:1738](file:///d:/claude/nomad/nomad/server.go#L1738)）配置 Serf：

- NodeName = `<NodeName>.<Region>`
- Tags：`role=nomad`、`region`、`dc`、`build`、`revision`、`vsn`、`raft_vsn`、`id`、`rpc_addr`、`port`、`bootstrap`、`expect`、`nonvoter`、`redundancy_zone`、`upgrade_version`
- SnapshotPath = `<DataDir>/serf.snapshot`
- `LeavePropagateDelay = 1s`（确保 leave 意图扩散）
- 禁用自动名称冲突解决

### 阶段 11：调度 Worker 池

```go
if err := s.setupWorkers(s.shutdownCtx); err != nil { ... }
```

`setupWorkers`（[nomad/server.go:1930](file:///d:/claude/nomad/nomad/server.go#L1930)）→ `setupWorkersLocked`（[nomad/server.go:1944](file:///d:/claude/nomad/nomad/server.go#L1944)）：

1. 校验 `EnabledSchedulers` 包含 `_core` 且都为已知类型（`scheduler.BuiltinSchedulers`）
2. 启动 `NumSchedulers` 个 `Worker`：`NewWorker(ctx, s, poolArgs)`（[nomad/worker.go:128](file:///d:/claude/nomad/nomad/worker.go#L128)）
3. 每个 Worker 通过 `workerShutdownGroup.AddCh(w.ShutdownCh())` 跟踪生命周期
4. 同时启动 `listenWorkerEvents` goroutine 收集 Worker 事件

`Worker.run`（[nomad/worker.go:398](file:///d:/claude/nomad/nomad/worker.go#L398)）主循环：
1. `dequeueEvaluation`：通过 `Eval.Dequeue` RPC 阻塞获取评估
2. `snapshotMinIndex`：等待本地 FSM 追上评估的 `waitIndex`
3. `invokeScheduler`：根据 eval 类型选择 `scheduler.BuiltinSchedulers[eval.Type]` 处理
4. `sendAck` / `sendNack`：向 Leader 确认或退回评估

### 阶段 12：Consul Syncer

```go
if err := s.setupConsulSyncer(); err != nil { ... }
```

`setupConsulSyncer`（[nomad/server.go:1142](file:///d:/claude/nomad/nomad/server.go#L1142)）：若 `ServerAutoJoin=true`，调用 `setupBootstrapHandler`（[nomad/server.go:962](file:///d:/claude/nomad/nomad/server.go#L962)）启动周期性 Consul 查询，当本节点失联且无 Leader 时通过 Consul 重新发现同伴并自举。

### 阶段 13-14：Deployment/Volume Watcher

```go
if err := s.setupDeploymentWatcher(); err != nil { ... }
if err := s.setupVolumeWatcher(); err != nil { ... }
```

- `setupDeploymentWatcher`（[nomad/server.go:1156](file:///d:/claude/nomad/nomad/server.go#L1156)）：构建 `deploymentwatcher.Watcher`，通过 Raft shim 推进部署状态转换
- `setupVolumeWatcher`（[nomad/server.go:1178](file:///d:/claude/nomad/nomad/server.go#L1178)）：构建 `volumewatcher.Watcher`，处理 CSI 卷声明释放

两者仅在 Leader 上启用。

### 阶段 15：EvalBroker 通知器

```go
go s.evalBroker.enabledNotifier.Run()
```

订阅 `EvalBroker.SetEnabled` 状态变化事件。

### 阶段 16：Node Drainer

```go
s.setupNodeDrainer()
```

`setupNodeDrainer`（[nomad/server.go:1187](file:///d:/claude/nomad/nomad/server.go#L1187)）：创建 `drainer.NodeDrainer`，封装节点排空逻辑（仅在 Leader 启用）。

### 阶段 17：Enterprise 状态

```go
if err := s.setupEnterprise(config); err != nil { return nil, err }
```

CE 版（[nomad/server_setup_ce.go:22](file:///d:/claude/nomad/nomad/server_setup_ce.go#L22)）：仅创建 OSS 版 `autopilot.Autopilot` 实例，使用 `AutopilotDelegate` 作为 raft-autopilot delegate。

企业版会附加 License、Namespaces、Multiregion 等扩展。

### 阶段 18：监控领导权变化

```go
go s.monitorLeadership()
```

详见第 4 节。

### 阶段 19：Serf 事件处理

```go
go s.serfEventHandler()
```

`serfEventHandler`（[nomad/serf.go:34](file:///d:/claude/nomad/nomad/serf.go#L34)）从 `eventCh` 读取事件：

- `EventMemberJoin`：`updatePeer` + `maybeBootstrap` + `localMemberEvent`
- `EventMemberFailed` / `EventMemberUpdate`：仅 `updatePeer`
- `EventMemberLeave` / `EventMemberReap`：`deletePeer` + `localMemberEvent`

`maybeBootstrap`（[nomad/serf.go:78](file:///d:/claude/nomad/nomad/serf.go#L78)）：当 `BootstrapExpect > 0` 且 raft 日志为空时，扫描 Serf 成员，达到期望数后调用 `raft.BootstrapCluster` 一次性自举集群。

### 阶段 20：启动 RPC 监听器

```go
s.startRPCListener()
```

`startRPCListener`（[nomad/server.go:589](file:///d:/claude/nomad/nomad/server.go#L589)）：

```go
ctx, cancel := context.WithCancel(context.Background())
s.rpcCancel = cancel
go s.listen(ctx)
```

`rpcHandler.listen`（[nomad/rpc.go:196](file:///d:/claude/nomad/nomad/rpc.go#L196)）Accept 循环：
- 可选 `connLimiter.Accept` 限流（per-IP/全局连接上限）
- 每个连接启动 `handleConn` goroutine

`handleConn`（[nomad/rpc.go:280](file:///d:/claude/nomad/nomad/rpc.go#L280)）读取首个 magic byte：
- `RaftRPC`：交给 `raftLayer.Handoff` 给 Raft 传输层
- 否则：作为 Nomad RPC，按是否启用 TLS 握手，再注册 per-conn RPC server

### 阶段 21：指标与后台任务

```go
go evalBroker.EmitStats(time.Second, s.shutdownCh)
go s.planQueue.EmitStats(time.Second, s.shutdownCh)
go s.planner.badNodeTracker.EmitStats(time.Second, s.shutdownCh)
go s.blockedEvals.EmitStats(time.Second, s.shutdownCh)
go s.heartbeatStats()
go s.EmitRaftStats(10*time.Second, s.shutdownCh)
s.startEnterpriseBackground()
```

定期向 metrics 系统输出队列长度、Raft 状态、心跳等指标。

### 阶段 22：Keyring 复制器与就绪等待

```go
s.keyringReplicator = NewKeyringReplicator(s, encrypter)
if err := s.encrypter.IsReady(startupTimeout); err != nil {
    _ = s.Shutdown()
    return nil, fmt.Errorf("failed to wait for keyring decryption to complete: %v", err)
}
return s, nil
```

- `KeyringReplicator`：Follower 从 Leader 复制根密钥
- `encrypter.IsReady`：阻塞等待密钥环解密完成（在 `StartTimeout` 内），否则启动失败

## 4. Leader 选举与领导权管理

### 4.1 `monitorLeadership` 主循环

[nomad/leader.go:111](file:///d:/claude/nomad/nomad/leader.go#L111) 订阅 `raft.LeaderCh()`：

```go
for {
    select {
    case isLeader := <-leaderCh:
        if wasLeader != isLeader {
            wasLeader = isLeader
            leaderStep(isLeader)  // 启动或停止 leaderLoop
        } else if wasLeader && isLeader {
            // 短暂失去又获得领导权：重启 leaderLoop 让 FSM 追赶
            leaderStep(false)
            leaderStep(true)
        }
    case <-s.shutdownCh:
        ...
    }
}
```

### 4.2 `leaderLoop`

[nomad/leader.go:248](file:///d:/claude/nomad/nomad/leader.go#L248) 核心：

1. **Raft Barrier**：`s.raft.Barrier(barrierWriteTimeout)` 等待本地 FSM 追上 Leader
2. **首次成为 Leader**：调用 `establishLeadership`（详见 4.3）
3. **`reconcile`**：扫描 Serf 成员，调用 `reconcileMember`（[nomad/leader.go:1508](file:///d:/claude/nomad/nomad/leader.go#L1508)）根据成员状态调用 `addRaftPeer` / `removeRaftPeer` 维护 Raft 配置
4. **事件循环**：
   - `<-stopCh`：失去领导权，返回（deferred `revokeLeadership`）
   - `<-s.shutdownCh`：服务器关闭
   - `<-interval`：定期 reconcile（`ReconcileInterval`）
   - `member := <-reconcileCh`：Serf 事件触发增量 reconcile
   - `errCh := <-s.reassertLeaderCh`：重新建立领导权（snapshot 恢复后用）

### 4.3 `establishLeadership`

[nomad/leader.go:378](file:///d:/claude/nomad/nomad/leader.go#L378) 执行所有 Leader-only 初始化：

1. **生成 Leader ACL**：`s.setLeaderAcl(uuid.Generate())`（管理权限的内部 token）
2. **暂停部分 Worker**：`handlePausableWorkers(true)` 暂停 3/4 的 Worker，让出 CPU 给 plan applier
3. **启动 Autopilot**：`s.autopilot.Start(s.shutdownCtx)`，开始健康检查与晋升 follower
4. **启用 Plan Queue**：`s.planQueue.SetEnabled(true)`
5. **启动 Plan Applier**：`go s.planApply()`（[nomad/plan_apply.go:96](file:///d:/claude/nomad/nomad/plan_apply.go#L96)），从 planQueue 取计划评估并提交 Raft
6. **启用 EvalBroker / BlockedEvals**：除非 operator 暂停
7. **启用 Deployment / NodeDrainer / Volume Watcher**
8. **`restoreEvals`**：从状态存储恢复未完成评估到 broker
9. **启用 PeriodicDispatcher** + `restorePeriodicDispatcher`
10. **`setConsistentReadReady`**：标记 RPC 可服务一致读
11. **后台清理任务**：
    - `initializeKeyring`：创建首个根密钥
    - `schedulePeriodic`：周期性任务调度
    - `reapFailedEvaluations` / `reapDupBlockedEvals` / `reapCancelableEvaluations`：清理失败/重复/可取消评估
    - `periodicUnblockFailedEvals`：周期性解锁失败 alloc 的评估
    - `publishJobSummaryMetrics` / `publishJobStatusMetrics`：发布指标
12. **恢复 Variable Lock TTL 定时器**：`restoreLockTTLTimers`
13. **`initializeHeartbeatTimers`**：扫描所有节点，为每个非终态节点创建 TTL 计时器（[nomad/heartbeat.go:59](file:///d:/claude/nomad/nomad/heartbeat.go#L59)）
14. **ACL 复制**（仅非 Authoritative Region）：`replicateACLPolicies` + `replicateACLTokens`
15. **Authoritative Region**：`schedulePeriodicAuthoritative` 周期性 GC 过期全局 token

### 4.4 `revokeLeadership`

[nomad/leader.go:1422](file:///d:/claude/nomad/nomad/leader.go#L1422) 失去领导权时反向操作：

1. `resetConsistentReadReady`：禁用一致读
2. 清空 leader ACL
3. 停止 Autopilot、PlanQueue、EvalBroker、BlockedEvals、PeriodicDispatcher、DeploymentWatcher、NodeDrainer、VolumeWatcher
4. 停止所有 lock TTL/delay 计时器
5. `clearAllHeartbeatTimers`：清除所有节点心跳计时器
6. `handlePausableWorkers(false)`：恢复暂停的 Worker

## 5. 关键数据结构

### 5.1 `Server` 结构体

定义于 [nomad/server.go:116](file:///d:/claude/nomad/nomad/server.go#L116)，关键分组：

| 类别 | 字段 |
|---|---|
| 共识层 | `raft`、`raftLayer`、`raftStore`、`raftTransport`、`fsm` |
| 网络层 | `connPool`、`rpcListener`、`clientRpcAdvertise`、`serverRpcAdvertise`、`rpcTLS`、`tlsWrap` |
| Gossip | `serf`、`peersCache`、`eventCh`、`reconcileCh` |
| RPC | `rpcServer`、`rpcHandler`、`streamingRpcs`、`nodeConns` |
| 调度 | `evalBroker`、`blockedEvals`、`planQueue`、`planner`、`workers`、`workerLock` |
| Leader-only | `autopilot`、`periodicDispatcher`、`deploymentWatcher`、`nodeDrainer`、`volumeWatcher`、`nodeHeartbeater`、`lockTTLTimer`、`lockDelayTimer`、`leaderAcl` |
| 安全 | `encrypter`、`auth`、`oidcProviderCache`、`oidcRequestCache`、`oidcDisco` |
| 状态 | `readyForConsistentReads`、`bootstrapped`、`left`、`shutdown`、`shutdownCtx` |

### 5.2 `Worker` 结构体

[nomad/worker.go:92](file:///d:/claude/nomad/nomad/worker.go#L92)：

- `enabledSchedulers`：本地缓存的调度器类型列表（避免并发访问 `config.EnabledSchedulers`）
- `pauseFlag` / `pauseCond`：Leader 切换时暂停/恢复机制
- `failures` / `failureBackoff`： dequeue 失败的退避计数
- `evalToken`：当前处理的评估的 ack token
- `snapshotIndex`：调度器首次启动时的快照索引

### 5.3 `FSMConfig` 与 `nomadFSM`

[nomad/fsm.go:169](file:///d:/claude/nomad/nomad/fsm.go#L169)：

- 持有 `state.StateStore`（MemDB 后端）
- 注册 `LogApplier`（按 `structs.MessageType` 分派）和 `SnapshotRestorer`
- 通过 `evalBroker` / `periodicDispatcher` / `blockedEvals` / `encrypter` 在 Apply 时同步通知这些组件

## 6. 关键后台 Goroutine 清单

`NewServer` 启动后会运行以下后台协程：

| Goroutine | 启动位置 | 触发条件 | 职责 |
|---|---|---|---|
| `monitorLeadership` | server.go:552 | 始终 | 监听 Raft leader 变化，启停 leaderLoop |
| `serfEventHandler` | server.go:555 | 始终 | 处理 Serf 成员事件，触发 reconcile/bootstrap |
| `listen` (RPC Accept) | server.go:592 | 始终 | Accept RPC 连接，分发到 handleConn |
| `evalBroker.enabledNotifier.Run` | server.go:526 | 始终 | 广播 EvalBroker 启用状态变化 |
| `evalBroker.EmitStats` | server.go:565 | 始终 | 每秒发布队列指标 |
| `planQueue.EmitStats` | server.go:568 | 始终 | 每秒发布 plan 队列指标 |
| `badNodeTracker.EmitStats` | server.go:571 | 始终 | 发布坏节点追踪指标 |
| `blockedEvals.EmitStats` | server.go:574 | 始终 | 发布阻塞评估指标 |
| `heartbeatStats` | server.go:577 | 始终 | 发布心跳定时器指标 |
| `EmitRaftStats` | server.go:580 | 始终 | 每 10s 发布 Raft 与 state store 指标 |
| `boltStore.RunMetrics` | server.go:1521 | BoltDB 后端 | 周期性发布 bbolt 统计 |
| `startRaftLogVerifier` | server.go:1663 | 启用验证时 | 每 5 分钟验证 raft store 健康 |
| `Worker.run` × N | worker.go:398 | 始终 | 从 EvalBroker 取评估并调度 |
| `listenWorkerEvents` | server.go:1933 | 始终 | 收集 Worker 状态变化事件 |
| `setupBootstrapHandler` | server.go:962 | Consul AutoJoin | 周期性 Consul 查询，重新自举 |
| **Leader-only** | | | |
| `leaderLoop` | leader.go:248 | 成为 Leader | 维护领导权、reconcile、reassert |
| `planApply` | plan_apply.go:96 | 成为 Leader | 从 planQueue 取计划并应用 |
| `autopilot.Start` | leader.go:392 | 成为 Leader | 健康检查与 follower 晋升 |
| `initializeKeyring` | leader.go:444 | 成为 Leader | 创建首个根密钥 |
| `schedulePeriodic` | leader.go:453 | 成为 Leader | 周期任务调度 |
| `reapFailedEvaluations` | leader.go:459 | 成为 Leader | 清理失败评估 |
| `reapDupBlockedEvals` | leader.go:462 | 成为 Leader | 清理重复阻塞评估 |
| `reapCancelableEvaluations` | leader.go:465 | 成为 Leader | 清理可取消评估 |
| `periodicUnblockFailedEvals` | leader.go:471 | 成为 Leader | 周期性解锁失败评估 |
| `publishJobSummaryMetrics` | leader.go:477 | 成为 Leader | 发布 job summary 指标 |
| `publishJobStatusMetrics` | leader.go:480 | 成为 Leader | 发布 job status 指标 |
| `lockTTLTimer.EmitMetrics` | leader.go:489 | 成为 Leader | 发布锁 TTL 指标 |
| `lockDelayTimer.EmitMetrics` | leader.go:490 | 成为 Leader | 发布锁延迟指标 |
| `schedulePeriodicAuthoritative` 或 `replicateACLPolicies/Tokens` | leader.go:506-510 | ACL 启用 | Authoritative GC / 非 Authoritative 复制 |
| `keyringReplicator` | server.go:585 | Follower | 从 Leader 复制根密钥 |

## 7. 关闭流程

### 7.1 `Leave`（优雅离开）

[nomad/server.go:829](file:///d:/claude/nomad/nomad/server.go#L829) `Leave()`：

1. 标记 `s.left = true`
2. 检查 raft peers 数量
3. **Leader 且多节点**：调用 `raft.RemoveServer` 安全移除自己以缩减仲裁
4. **非 Leader**：发起 Serf `Leave`，等待 raft 配置移除自己（最多 `raftRemoveGracePeriod`）
5. 返回后由调用方调用 `Shutdown`

### 7.2 `Shutdown`

[nomad/server.go:744](file:///d:/claude/nomad/nomad/server.go#L744) `Shutdown()`：

1. 设置 `s.shutdown = true`，调用 `s.shutdownCancel()`（关闭 `shutdownCtx`）
2. 停止所有 Worker：`stopOldWorkers(s.workers)` + 等待 `workerShutdownGroup`（最多 `workerShutdownGracePeriod`）
3. `serf.Shutdown()`
4. 关闭 Raft：`raftTransport.Close()` → `raftLayer.Close()` → `raft.Shutdown()` → `raftStore.Close()`
5. 关闭 RPC listener：`rpcListener.Close()`
6. 关闭连接池：`connPool.Shutdown()`
7. 关闭 FSM：`fsm.Close()`（停止事件 broker）
8. 停止 Consul config entries：`consulConfigEntries.Stop()`
9. 关闭 OIDC provider cache：`oidcProviderCache.Shutdown()`

注意：Leader 状态下 `Shutdown` 不会主动调用 `revokeLeadership`；而是通过 `monitorLeadership` 监听 `raft.LeaderCh()` 关闭后失去领导权触发。但 `shutdownCtx` 取消会让 `leaderLoop` 的 `<-s.shutdownCh` 退出，从而触发 deferred `revokeLeadership`。

## 8. 启动流程图

```
nomad agent
   │
   ▼
NewAgent (agent.go:150)
   │
   ├─ setupServer (agent.go:1175)
   │    ├─ serverConfig()           # 构建 Config
   │    ├─ setupNodeID()            # 持久化 NodeID
   │    ├─ setupKeyrings()          # Gossip 加密
   │    └─ nomad.NewServer()        # ↓↓↓
   │
   ▼
NewServer (server.go:336)
   │
   ├─[1] TLS 配置 + 日志
   ├─[2] License 校验
   ├─[3] Server 结构体初始化 + shutdownCtx
   ├─[4] EvalBroker + BlockedEvals
   ├─[5] rpcHandler / planner / nodeHeartbeater / periodicDispatcher
   │       statsFetcher / consulConfigEntries
   ├─[6] Encrypter + OIDC 配置
   ├─[7] setupRPC (server.go:1203)
   │       ├─ setupRpcServer         # 注册所有 endpoint
   │       ├─ setupStreamingEndpoints
   │       ├─ createRPCListener     # TCP 监听
   │       └─ NewRaftLayer           # Raft 传输层
   ├─[8] Authenticator
   ├─[9] setupRaft (server.go:1345)
   │       ├─ NewFSM                 # 状态机 + state store
   │       ├─ raft.NetworkTransport
   │       ├─ 选择 BoltDB / WAL 后端
   │       ├─ peers.json 恢复检查
   │       ├─ 单节点自举
   │       └─ raft.NewRaft
   ├─[10] setupSerf (server.go:1738)
   │       └─ serf.Create
   ├─[11] setupWorkers (server.go:1930)
   │       └─ 启动 N 个 Worker
   ├─[12] setupConsulSyncer
   │       └─ setupBootstrapHandler (可选 Consul AutoJoin)
   ├─[13] setupDeploymentWatcher
   ├─[14] setupVolumeWatcher
   ├─[15] evalBroker.enabledNotifier.Run
   ├─[16] setupNodeDrainer
   ├─[17] setupEnterprise (CE: Autopilot OSS)
   ├─[18] go monitorLeadership       # 监听 leaderCh
   ├─[19] go serfEventHandler        # Serf 事件
   ├─[20] startRPCListener           # go listen(ctx)
   ├─[21] 指标后台协程（EvalBroker/PlanQueue/Heartbeat/Raft stats）
   ├─[22] NewKeyringReplicator + encrypter.IsReady (等待解密)
   │
   ▼
返回 *Server，由 Agent 注册 Consul 服务

================== 运行期 ==================

Raft 选举 → leaderCh 触发
   │
   ▼
monitorLeadership (leader.go:111)
   │
   ▼
leaderLoop (leader.go:248)
   ├─ raft.Barrier           # FSM 追赶
   ├─ establishLeadership    # 首次成为 Leader
   │    ├─ setLeaderAcl
   │    ├─ handlePausableWorkers(true)
   │    ├─ autopilot.Start
   │    ├─ planQueue.SetEnabled + go planApply
   │    ├─ evalBroker.SetEnabled + restoreEvals
   │    ├─ deploymentWatcher / nodeDrainer / volumeWatcher.SetEnabled
   │    ├─ periodicDispatcher.SetEnabled + restorePeriodicDispatcher
   │    ├─ setConsistentReadReady
   │    ├─ initializeKeyring
   │    ├─ 多个 reap*/periodic*/publish* goroutine
   │    ├─ restoreLockTTLTimers
   │    ├─ initializeHeartbeatTimers
   │    └─ ACL 复制（非 Authoritative）/ GC（Authoritative）
   ├─ reconcile              # Serf 成员 vs Raft 配置
   └─ 事件循环（stopCh / shutdownCh / interval / reconcileCh / reassertLeaderCh）
```

## 9. 文件索引

| 文件 | 主要内容 |
|---|---|
| [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | `NewAgent`、`setupServer`、Consul 服务注册 |
| [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | `Server` 结构体、`NewServer`、`setupRPC`、`setupRaft`、`setupSerf`、`setupWorkers`、`Shutdown`、`Leave` |
| [nomad/server_setup_ce.go](file:///d:/claude/nomad/nomad/server_setup_ce.go) | CE 版 `setupEnterprise`（Autopilot OSS） |
| [nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go) | `monitorLeadership`、`leaderLoop`、`establishLeadership`、`revokeLeadership`、`reconcile` |
| [nomad/serf.go](file:///d:/claude/nomad/nomad/serf.go) | `serfEventHandler`、`maybeBootstrap`、`updatePeer` |
| [nomad/rpc.go](file:///d:/claude/nomad/nomad/rpc.go) | `rpcHandler.listen`、`handleConn`、`handleStreamingConn` |
| [nomad/raft_rpc.go](file:///d:/claude/nomad/nomad/raft_rpc.go) | `RaftLayer`（Raft over TCP，与 Nomad RPC 复用端口） |
| [nomad/fsm.go](file:///d:/claude/nomad/nomad/fsm.go) | `nomadFSM`、`NewFSM`、`Apply`、`Snapshot`、`Restore` |
| [nomad/eval_broker.go](file:///d:/claude/nomad/nomad/eval_broker.go) | `EvalBroker` 评估队列 |
| [nomad/blocked_evals.go](file:///d:/claude/nomad/nomad/blocked_evals.go) | `BlockedEvals` 阻塞评估追踪 |
| [nomad/plan_apply.go](file:///d:/claude/nomad/nomad/plan_apply.go) | `planner.planApply` 计划评估与应用 |
| [nomad/plan_queue.go](file:///d:/claude/nomad/nomad/plan_queue.go) | `PlanQueue` 计划队列 |
| [nomad/worker.go](file:///d:/claude/nomad/nomad/worker.go) | `Worker` 调度工作协程 |
| [nomad/heartbeat.go](file:///d:/claude/nomad/nomad/heartbeat.go) | `nodeHeartbeater` 节点心跳 TTL |
| [nomad/periodic.go](file:///d:/claude/nomad/nomad/periodic.go) | `PeriodicDispatch` 周期任务调度 |
| [nomad/autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | `AutopilotDelegate`（CE 版 promoter） |
| [nomad/encrypter.go](file:///d:/claude/nomad/nomad/encrypter.go) | `Encrypter` 根密钥环 |
| [nomad/consul.go](file:///d:/claude/nomad/nomad/consul.go) | Consul 配置条目管理 |
| [nomad/config.go](file:///d:/claude/nomad/nomad/config.go) | `Config` Server 配置结构 |
| [nomad/state/](file:///d:/claude/nomad/nomad/state) | MemDB 状态存储实现 |
| [scheduler/](file:///d:/claude/nomad/scheduler) | 调度器实现（service、batch、system、sysbatch、_core） |
| [helper/pool/](file:///d:/claude/nomad/helper/pool) | RPC 连接池 |
| [helper/tlsutil/](file:///d:/claude/nomad/helper/tlsutil) | TLS 工具 |
| [nomad/deploymentwatcher/](file:///d:/claude/nomad/nomad/deploymentwatcher) | 部署状态监视器 |
| [nomad/volumewatcher/](file:///d:/claude/nomad/nomad/volumewatcher) | CSI 卷监视器 |
| [nomad/drainer/](file:///d:/claude/nomad/nomad/drainer) | 节点排空器 |

## 10. 与 Client 启动的差异

| 维度 | Server | Client |
|---|---|---|
| 共识 | Raft 成员，参与日志复制 | 无 Raft，仅心跳到 Server |
| 状态存储 | FSM + MemDB（强一致） | BoltDB 本地状态（最终一致） |
| 网络发现 | Serf WAN gossip + Consul AutoJoin | Serf LAN + Server RPC |
| 插件 | 无 driver/device 插件 | 加载并运行 driver/device/CSI 插件 |
| 调度 | EvalBroker + Worker 池 + PlanQueue | AllocRunner 执行分配 |
| Leader 概念 | 有 Leader/Follower 角色 | 无 |
| 指纹 | 仅 Serf/Raft 自身属性 | FingerprintManager 探测主机硬件/软件 |
| TLS 校验 | 校验证书 SAN = `server.*.nomad` 或 `client.<region>.nomad` | 仅校验 `server.<region>.nomad` |
| 关闭 | Leave + Shutdown（移除 raft peer） | 优雅停止所有 AllocRunner |

---

本文档基于 Nomad 源码分析整理，覆盖 Server 启动从命令行入口到运行态的完整链路。如需深入了解某个子系统（如 Raft 日志应用、调度器算法、Autopilot 晋升逻辑等），可参考对应文件索引中的源码。
