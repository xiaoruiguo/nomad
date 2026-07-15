# server.go 代码说明文档

> 文件路径：[server.go](file:///d:/claude/nomad/nomad/server.go)
> 总行数：2380 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件是 **Nomad Server 核心实现**，定义 `Server` 结构体——Nomad 集群的核心控制器。负责 Raft 共识、RPC 服务、调度协调、状态管理等核心功能的统一管理。是 Server 节点的中央调度器，管理所有子系统的生命周期。

核心职责包括：
- **Raft 共识**：基于 HashiCorp Raft 实现强一致的状态复制，支持 BoltDB 和 WAL 两种日志存储后端
- **RPC 服务**：提供 RPC 监听器、TLS 包装、流式 RPC 端点注册，是 Client 与 Server 通信的入口
- **Serf 集群成员管理**：通过 Serf 实现 Server 间的成员发现、故障检测和 gossip 通信
- **调度系统**：管理调度 Worker 池、评估队列（EvalBroker）、阻塞评估（BlockedEvals）和调度计划（Planner）
- **领导选举**：通过 `monitorLeadership` 监控领导者状态，领导者负责分发评估、运行周期性作业等
- **Consul 集成**：通过 Consul 进行服务发现和自动加入集群
- **部署/卷/节点排空**：管理部署监视器、卷监视器、节点排空器
- **加密与认证**：管理根密钥环（Encrypter）、OIDC 提供者缓存、ACL 认证器
- **Autopilot**：通过 raft-autopilot 实现自动化集群管理（故障转移、服务器淘汰等）

## 2. 类型定义

### raftBackend

**定义位置**：[L108](file:///d:/claude/nomad/nomad/server.go#L108)

**类型**：interface

```go
	raft.LogStore
	raft.StableStore
	Close
```

**中文说明**：Raft 日志存储后端接口，抽象 Raft 所需的日志存储和稳定存储能力。该接口同时被 `*raftboltdb.BoltStore` 和 `*wal.WAL` 两种后端实现满足，使 Server 可以在 BoltDB 和 WAL 两种存储后端之间切换而无需修改业务逻辑。

**接口方法说明**：
- `raft.LogStore`：提供 Raft 日志条目的存储和检索（`FirstIndex`、`LastIndex`、`GetLog`、`StoreLog`、`DeleteRange` 等）
- `raft.StableStore`：提供键值对的持久化存储，用于保存 Raft 当前任期、最后投票等元数据（`Set`、`Get`、`SetUint64`、`GetUint64`）
- `Close() error`：关闭存储，释放底层文件句柄等资源

### Server

**定义位置**：[L116](file:///d:/claude/nomad/nomad/server.go#L116)

**类型**：struct

**中文说明**：`Server` 是 Nomad Server 节点的核心结构体，管理作业队列、调度器、通知总线等所有 Server 端功能。每个 Nomad Server 进程持有一个 `Server` 实例，它是 Raft 共识、RPC 服务、调度协调、状态管理等子系统的统一聚合点。`Server` 通过 `NewServer` 构造函数初始化，构造过程中会依次建立 TLS、评估队列、RPC、Raft、Serf、Worker、Consul 同步器、部署/卷/节点排空监视器、企业版状态等子系统。

#### 结构体字段详解

| 字段名 | 类型 | 中文定义与使用说明 |
|--------|------|-------------------|
| `config` | `*Config` | Server 的配置对象指针，包含区域、数据中心、Raft 配置、TLS 配置、调度器配置等所有启动参数。在 `NewServer` 时传入，后续通过 `Reload` 可部分更新 |
| `logger` | `log.InterceptLogger` | 结构化日志记录器，基于 hclog 的 `InterceptLogger` 接口，支持日志拦截。在 `NewServer` 中通过 `config.Logger.ResetNamedIntercept("nomad")` 创建，命名为 "nomad" |
| `connPool` | `*pool.ConnPool` | 到其他 Nomad Server 的连接池，复用 RPC 连接以减少连接建立开销。通过 `pool.NewPool` 创建，参数包括缓存时长 `serverRPCCache`（2 分钟）、最大流数 `serverMaxStreams`（64）和 TLS 包装器 |
| `raft` | `*raft.Raft` | Raft 共识实例，保护需要强一致性的操作（如作业提交、节点注册）。在 `setupRaft` 中通过 `raft.NewRaft` 创建，是 Server 集群一致性保证的核心 |
| `raftLayer` | `*RaftLayer` | Raft 传输层，基于 TLS 的网络层抽象，提供 Raft 节点间的通信通道。在 `setupRPC` 中通过 `NewRaftLayer` 创建，支持 `ReloadTLS` 进行 TLS 热更新 |
| `raftStore` | `raftBackend` | Raft 日志和稳定存储后端，可以是 BoltDB 或 WAL。在 `setupRaft` 中根据 `RaftLogStoreConfig.Backend` 选择，通过 `verifyRaftStore` 周期性健康检查 |
| `raftInmem` | `*raft.InmemStore` | 开发模式（DevMode）下的内存 Raft 存储，避免磁盘 I/O。仅在 `s.config.DevMode` 为 true 时使用 |
| `raftTransport` | `*raft.NetworkTransport` | Raft 网络传输层，基于 `raftLayer` 构建，管理 Raft 节点间的多路复用连接。通过 `raft.NewNetworkTransportWithConfig` 创建 |
| `reassertLeaderCh` | `chan chan error` | 重新确立领导权的信号通道。当快照恢复等场景导致领导者内存状态大幅变化时，通过此通道通知 leader loop 重新计算领导者状态（如周期性作业、eval broker）。通道元素是 `chan error`，用于回传重新确立的结果 |
| `autopilot` | `*autopilot.Autopilot` | Autopilot 实例，实现自动化集群管理，包括故障检测、服务器淘汰、死节点清理等。通过 `statsFetcher` 收集其他 Server 的状态信息 |
| `fsm` | `*nomadFSM` | Raft 有限状态机，将 Raft 提交的日志应用到 Nomad 状态存储。在 `setupRaft` 中通过 `NewFSM` 创建，`State()` 方法返回其内部的状态存储 |
| `rpcListener` | `net.Listener` | RPC 网络监听器，接受传入的 RPC 连接。在 `createRPCListener` 中通过 `net.ListenTCP` 创建，`reloadTLSConnections` 时会关闭并重建 |
| `listenerCh` | `chan struct{}` | 监听器关闭信号通道，用于在 `reloadTLSConnections` 时等待旧监听器退出后再创建新监听器 |
| `tlsWrap` | `tlsutil.RegionWrapper` | 出站连接的 TLS 包装器，使用锁保护。通过 `tlsConf.OutgoingTLSWrapper()` 创建，`reloadTLSConnections` 时更新 |
| `tlsWrapLock` | `sync.RWMutex` | 保护 `tlsWrap` 字段的读写锁，确保 TLS 配置的热更新是并发安全的 |
| `*rpcHandler` | `*rpcHandler` | RPC 处理器（嵌入），服务和处理 RPC 请求。通过 `newRpcHandler(s)` 创建 |
| `rpcServer` | `*rpc.Server` | 静态 RPC 服务器，供本地 Agent 使用。通过 `rpc.NewServer()` 创建，在 `setupRpcServer` 中注册所有 RPC 端点 |
| `auth` | `*auth.Authenticator` | ACL 认证器，验证请求的身份和权限。通过 `auth.NewAuthenticator` 创建，配置包括状态查询函数、领导者 ACL 获取函数、ACL 是否启用等 |
| `clientRpcAdvertise` | `net.Addr` | 客户端 RPC 广播地址，Nomad 客户端通过此地址连接到本 Server。优先使用 `config.ClientRPCAdvertise`，否则使用 `rpcListener.Addr()` |
| `serverRpcAdvertise` | `net.Addr` | 服务器 RPC 广播地址，其他 Nomad Server 通过此地址连接到本 Server。优先使用 `config.ServerRPCAdvertise`，否则基于 Serf 广播地址 + RPC 端口推导 |
| `rpcTLS` | `*tls.Config` | 传入 TLS 请求的 TLS 配置。在 `getTLSConf` 中创建，当启用 `VerifyServerHostname` 时设置自定义证书验证器 |
| `rpcCancel` | `context.CancelFunc` | RPC 监听器的取消函数，用于在 `reloadTLSConnections` 时取消旧监听器 |
| `streamingRpcs` | `*structs.StreamingRpcRegistry` | 流式 RPC 处理器注册表，管理如事件流、分配日志流等长连接 RPC。通过 `structs.NewStreamingRpcRegistry()` 创建 |
| `nodeConns` | `map[string][]*nodeConnState` | 按 NodeID 索引的多路复用节点连接集合，管理到客户端节点的连接状态。通过 `nodeConnsLock` 保护并发访问 |
| `nodeConnsLock` | `sync.RWMutex` | 保护 `nodeConns` 字段的读写锁 |
| `serf` | `*serf.Serf` | Serf 集群实例，仅包含 Nomad Server，用于多区域联邦和区域内自动集群。在 `setupSerf` 中通过 `serf.Create` 创建 |
| `peersCache` | `*peers.PeerCache` | 解析后的 Nomad Server 成员对等节点缓存，避免每次访问都重新解析 Serf 标签。用于 RPC 连接管理、发现和服务器版本检查。通过 `peers.NewPeerCache(config.Region)` 创建 |
| `bootstrapped` | `*atomic.Bool` | 原子布尔值，指示 Server 是否已完成引导。通过原子操作保证并发安全 |
| `reconcileCh` | `chan serf.Member` | 从 serf 处理器向 leader 管理器传递事件的通道，主要处理服务器加入/离开区域的事件。缓冲大小为 32 |
| `readyForConsistentReads` | `*atomic.Bool` | 原子布尔值，跟踪服务器是否准备好提供一致性读取。在领导权获取后通过 `setConsistentReadReady` 设置为 true，领导权撤销时通过 `resetConsistentReadReady` 重置 |
| `eventCh` | `chan serf.Event` | 从 serf 集群接收事件的通道，缓冲大小为 256。由 `serfEventHandler` 协程消费 |
| `blockedEvals` | `*BlockedEvals` | 阻塞评估管理器，管理因节点容量不足而阻塞的评估。当容量变化时重新调度。通过 `NewBlockedEvals(s.evalBroker, s.logger)` 创建 |
| `evalBroker` | `*EvalBroker` | 评估代理，管理等待分发给子调度器的进行中评估。通过 `NewEvalBroker` 创建，配置包括 NACK 超时、重排延迟和投递限制 |
| `brokerLock` | `sync.Mutex` | 同步 `blockedEvals` 和 `evalBroker` 启用状态变更的互斥锁。在领导权变更或用户修改调度器配置时使用，防止用户操作与领导权转换冲突导致状态不一致 |
| `reapCancelableEvalsCh` | `chan struct{}` | 唤醒可取消评估回收器的信号通道 |
| `deploymentWatcher` | `*deploymentwatcher.Watcher` | 部署监视器，监视部署及其分配，执行必要的转换调用以继续推进部署状态。在 `setupDeploymentWatcher` 中创建 |
| `nodeDrainer` | `*drainer.NodeDrainer` | 节点排空器，从节点排空分配。在 `setupNodeDrainer` 中创建，领导权获取时启用 |
| `volumeWatcher` | `*volumewatcher.Watcher` | 卷监视器，释放卷声明。在 `setupVolumeWatcher` 中创建 |
| `volumeControllerFutures` | `map[string]context.Context` | 插件 ID 到待处理控制器 RPC 的映射。如果给定插件没有待处理的 RPC，可能为 nil |
| `volumeControllerLock` | `sync.Mutex` | 同步 `volumeControllerFutures` 映射访问的互斥锁 |
| `keyringReplicator` | `*KeyringReplicator` | 密钥环复制器，从领导者复制根加密密钥。在 RPC 服务器和 FSM 创建后通过 `NewKeyringReplicator` 创建 |
| `encrypter` | `*Encrypter` | 根密钥环，用于加密变量和签名工作负载身份。在 `NewServer` 中通过 `NewEncrypter(s, keystorePath)` 创建，`IsReady` 等待解密完成 |
| `periodicDispatcher` | `*PeriodicDispatch` | 周期性调度器，跟踪并为周期性作业创建评估。通过 `NewPeriodicDispatch(s.logger, s)` 创建 |
| `*planner` | `*planner` | 计划器（嵌入），管理提交的分配计划，等待领导者处理。通过 `newPlanner(s)` 创建 |
| `*nodeHeartbeater` | `*nodeHeartbeater` | 节点心跳跟踪器（嵌入），跟踪节点心跳过期时间。检测到过期节点时将其状态更新为 'down'。通过 `newNodeHeartbeater(s)` 创建 |
| `consulCatalog` | `consul.CatalogAPI` | Consul 目录 API，用于通过 Consul 发现其他 Nomad Server。在 `NewServer` 中作为参数传入 |
| `consulConfigEntries` | `ConsulConfigsAPI` | Consul 配置条目管理器，管理 Consul 配置条目。通过 `NewConsulConfigsAPI(consulConfigFunc, s.logger)` 创建 |
| `workers` | `[]*Worker` | 调度 Worker 切片，处理评估的调度工作。通过 `workerLock` 保护并发访问 |
| `workerLock` | `sync.RWMutex` | 保护 `workers` 切片的读写锁 |
| `workerConfigLock` | `sync.RWMutex` | 保护调度器 Worker 配置的读写锁，用于 `shouldReloadSchedulers`、`reloadSchedulers` 等配置变更场景 |
| `workersEventCh` | `chan interface{}` | 接收 Worker 事件通知的通道，缓冲大小为 1。由 `listenWorkerEvents` 协程消费，处理如端口冲突等事件 |
| `workerShutdownGroup` | `group.Group` | Worker 关闭组，跟踪运行中的 Worker 协程，使 `Shutdown()` 可以等待它们的完成。通过 `workerShutdownGroup.AddCh(w.ShutdownCh())` 添加 |
| `oidcProviderCache` | `*oidc.ProviderCache` | OIDC 提供者缓存，缓存 OIDC 提供者以避免重复的 HTTP 请求。Server 关闭时必须调用 `Shutdown()`。通过 `oidc.NewProviderCache()` 创建 |
| `oidcRequestCache` | `*oidc.RequestCache` | OIDC 请求缓存，存储 OIDC 请求状态（主要是 PKCE 挑战/验证），使请求状态在 `OIDCAuthURL` 和 `OIDCCompleteAuth` 调用之间持久化。通过 `oidc.NewRequestCache(6 * time.Minute)` 创建，6 分钟比 cap 库中 JWT 过期时间多 1 分钟 |
| `lockTTLTimer` | `*lock.TTLTimer` | 变量锁 TTL 计时器，跟踪变量锁的 TTL。保存在领导者内存中而非状态中，以避免大量 Raft 写入。通过 `lock.NewTTLTimer()` 创建 |
| `lockDelayTimer` | `*lock.DelayTimer` | 变量锁延迟计时器，跟踪变量锁的延迟。同样保存在领导者内存中。通过 `lock.NewDelayTimer()` 创建 |
| `leaderAcl` | `string` | 领导者 ACL 令牌，当前领导者解析时有效的管理 ACL 令牌。通过 `leaderAclLock` 保护 |
| `leaderAclLock` | `sync.Mutex` | 保护 `leaderAcl` 字段的互斥锁 |
| `clusterIDLock` | `sync.Mutex` | 集群 ID 锁，确保 Server 不会在 `ClusterID` 调用中并发建立集群 ID |
| `statsFetcher` | `*StatsFetcher` | 统计获取器，Autopilot 用于检查其他 Nomad Server 的状态。通过 `NewStatsFetcher(s.logger, s.connPool, s.config.Region)` 创建，`SetLocalServer(s)` 设置本地服务器 |
| `reportingManager` | `*reporting.Manager` | 报告管理器，配置和处理所有许可证报告依赖项 |
| `oidcDisco` | `*structs.OIDCDiscoveryConfig` | OIDC 发现配置，由 `Keyring.GetConfig` RPC 和 `/.well-known/openid-configuration` HTTP API 返回。发行者和 JWKS URL 可由用户配置，因此结构体在 `NewServer` 中初始化。**可能为 nil！** 发行者必须由用户显式配置 |
| `EnterpriseState` | `EnterpriseState` | 企业状态（嵌入），用于填充 Pro/Ent 构建的状态。社区版为空实现，企业版通过 build tag 选择实际实现 |
| `left` | `bool` | 标记服务器是否已执行 `Leave` 操作，用于优雅关闭准备 |
| `shutdown` | `bool` | 标记服务器是否已关闭，防止重复关闭。通过 `shutdownLock` 保护 |
| `shutdownLock` | `sync.Mutex` | 保护 `shutdown` 字段和关闭流程的互斥锁 |
| `shutdownCtx` | `context.Context` | 关闭上下文，用于传播关闭信号到所有子系统和后台协程。通过 `context.WithCancel(context.Background())` 创建 |
| `shutdownCancel` | `context.CancelFunc` | 关闭上下文的取消函数，调用时触发 `shutdownCh` 关闭 |
| `shutdownCh` | `<-chan struct{}` | 关闭信号只读通道，当 `shutdownCancel` 被调用时关闭。所有后台协程通过监听此通道感知关闭事件 |

**关联方法**（56 个）：`startRPCListener`, `createRPCListener`, `reloadTLSConnections`, `Shutdown`, `IsShutdown`, `Leave`, `Reload`, `setupBootstrapHandler`, `setupConsulSyncer`, `setupDeploymentWatcher`, `setupVolumeWatcher`, `setupNodeDrainer`, `setupRPC`, `setupStreamingEndpoints`, `setupRpcServer`, `setupRaft`, `openRaftWAL`, `startRaftLogVerifier`, `verifyRaftStore`, `checkRaftVersionFile`, `setupSerf`, `GetSchedulerWorkersInfo`, `GetSchedulerWorkerConfig`, `SetSchedulerWorkerConfig`, `setupWorkers`, `setupWorkersLocked`, `setupNewWorkersLocked`, `stopOldWorkers`, `listenWorkerEvents`, `numPeers`, `IsLeader`, `Join`, `LocalMember`, `Members`, `RemoveFailedNode`, `RemoveFailedNodePrune`, `KeyManager`, `Encrypted`, `State`, `setLeaderAcl`, `getLeaderAcl`, `setConsistentReadReady`, `resetConsistentReadReady`, `isReadyForConsistentReads`, `Regions`, `RPC`, `StreamingRpcHandler`, `Stats`, `EmitRaftStats`, `setReplyQueryMeta`, `Region`, `Datacenter`, `GetConfig`, `ReplicationToken`, `ClusterMetadata`, `isSingleServerCluster`

### SchedulerWorkerPoolArgs

**定义位置**：[L1823](file:///d:/claude/nomad/nomad/server.go#L1823)

**类型**：struct

**中文说明**：`SchedulerWorkerPoolArgs` 是 Nomad Server 调度器 Worker 池的两个关键配置选项。使用前应始终通过 `IsValid()` 或 `IsInvalid()` 验证其合理性。该结构体用于配置变更时检测是否需要重新加载调度器池，并在 `shouldReloadSchedulers`、`reloadSchedulers`、`GetSchedulerWorkerConfig` 等方法中传递。

```go
	NumSchedulers     int
	EnabledSchedulers []string
```

**字段说明**：
| 字段名 | 类型 | 中文定义与使用说明 |
|--------|------|-------------------|
| `NumSchedulers` | `int` | 调度器 Worker 的数量，控制并行处理评估的能力。必须为非负且不超过 CPU 核心数（`runtime.NumCPU()`），通过 `IsValid` 验证 |
| `EnabledSchedulers` | `[]string` | 启用的调度器类型列表，如 `["service", "batch", "system", "_core"]`。必须包含 `_core`（核心调度器）且只引用已知调度器，通过 `IsValid` 验证 |

**关联方法**（3 个）：`IsInvalid`, `IsValid`, `Copy`

## 3. 常量与变量

### 常量

| 名称 | 值 | 中文定义与使用说明 |
|------|----|-------------------|
| `datacenterQueryLimit` | `25` | Nomad Server 查询 Consul 数据中心以查找 `bootstrap_expect` 服务器的最大数量。在 `setupBootstrapHandler` 的 `bootstrapFn` 中使用，限制 Consul 查询的数据中心范围，避免在大规模多数据中心环境下查询过多 |
| `maxStaleLeadership` | `15 * time.Second` | 允许 Nomad Server 在未看到有效 Raft 领导者的最长时间。超时后 Server 会回退到 Consul 查询其他 Nomad Server。在 `setupBootstrapHandler` 中作为 `peersTimeout` 的重置值使用 |
| `peersPollInterval` | `45 * time.Second` | 查询 Consul 获取 Nomad Server 的轮询间隔。在 `setupBootstrapHandler` 的 `bootstrapFn` 中用于设置下一次查询的延迟基础值 |
| `peersPollJitterFactor` | `2` | 查询 Consul Server 时的重试间隔抖动因子。与 `peersPollInterval` 配合使用：`peersPollInterval + helper.RandomStagger(peersPollInterval/peersPollJitterFactor)`，避免集群内所有 Server 同时查询 Consul 造成惊群效应 |
| `raftState` | `"raft/"` | Raft 状态在数据目录中的子目录名。在 `setupRaft` 中通过 `filepath.Join(s.config.DataDir, raftState)` 构建 Raft 数据路径 |
| `serfSnapshot` | `"serf/snapshot"` | Serf 快照在数据目录中的相对路径。在 `NewServer` 中传递给 `setupSerf` 作为 Serf 快照存储路径 |
| `snapshotsRetained` | `2` | 保留的 Raft 快照数量。在 `setupRaft` 中通过 `raft.NewFileSnapshotStore(path, snapshotsRetained, ...)` 创建快照存储时使用 |
| `serverRPCCache` | `2 * time.Minute` | 到 Server 的空闲 RPC 连接保持打开的时长。在 `NewServer` 中作为 `pool.NewPool` 的 `cacheTime` 参数使用 |
| `serverMaxStreams` | `64` | 到 Server 的空闲流保持打开的最大数量。在 `NewServer` 中作为 `pool.NewPool` 的 `maxStreams` 参数使用，控制 Yamux 多路复用的最大流数 |
| `raftLogCacheSize` | `512` | 内存中缓存的 Raft 日志最大数量。用于减少最近提交条目的磁盘 I/O。在 `setupRaft` 中通过 `raft.NewLogCache(raftLogCacheSize, store)` 创建日志缓存 |
| `raftRemoveGracePeriod` | `5 * time.Second` | 等待 `RemovePeer` 复制以优雅离开集群的时间。在 `Leave` 方法中，非领导者 Server 等待被安全移除的超时时间 |
| `workerShutdownGracePeriod` | `5 * time.Second` | Server 关闭时等待 Worker 优雅停止的最大时间。在 `Shutdown` 方法中通过 `context.WithTimeout` 创建超时上下文，超时后强制停止 Worker |
| `defaultConsulDiscoveryInterval` | `3 * time.Second` | 无领导者时轮询 Consul 发现新 Server 的默认间隔。在 `setupBootstrapHandler` 的轮询循环中使用，上次查询成功时使用此间隔 |
| `defaultConsulDiscoveryIntervalRetry` | `9 * time.Second` | 无领导者且上次 Consul 查询失败时的轮询间隔。在 `setupBootstrapHandler` 的轮询循环中使用，比 `defaultConsulDiscoveryInterval` 更长以避免频繁失败重试 |
| `peersInfoContent` | 多行字符串 | 写入 `peers.info` 文件的帮助内容，向操作员解释 `peers.json` 文件的用途和格式。用于 Raft 故障恢复场景，说明不同 Raft 协议版本下 `peers.json` 的 JSON 格式（v2 及以前为地址数组，v3 及以后为含 id、address、non_voter 的对象数组） |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewServer` | - | `config *Config, consulCatalog consul.CatalogAPI, consulConfigFunc consul.Con...` | `*Server, error` | [L336](file:///d:/claude/nomad/nomad/server.go#L336) |
| `startRPCListener` | `s *Server` | - | - | [L589](file:///d:/claude/nomad/nomad/server.go#L589) |
| `createRPCListener` | `s *Server` | - | `*net.TCPListener, error` | [L596](file:///d:/claude/nomad/nomad/server.go#L596) |
| `getTLSConf` | - | `enableRPC bool, tlsConf *tlsutil.Config, region string` | `*tls.Config, tlsutil.RegionWrapper, error` | [L610](file:///d:/claude/nomad/nomad/server.go#L610) |
| `rpcNameAndRegionValidator` | - | `region string` | `func(...)` | [L639](file:///d:/claude/nomad/nomad/server.go#L639) |
| `validateRPCRegionPeer` | - | `name string, region string` | `bool` | [L656](file:///d:/claude/nomad/nomad/server.go#L656) |
| `reloadTLSConnections` | `s *Server` | `newTLSConfig *config.TLSConfig` | `error` | [L676](file:///d:/claude/nomad/nomad/server.go#L676) |
| `Shutdown` | `s *Server` | - | `error` | [L744](file:///d:/claude/nomad/nomad/server.go#L744) |
| `IsShutdown` | `s *Server` | - | `bool` | [L805](file:///d:/claude/nomad/nomad/server.go#L805) |
| `Leave` | `s *Server` | - | `error` | [L815](file:///d:/claude/nomad/nomad/server.go#L815) |
| `Reload` | `s *Server` | `newConfig *Config` | `error` | [L910](file:///d:/claude/nomad/nomad/server.go#L910) |
| `setupBootstrapHandler` | `s *Server` | - | `error` | [L962](file:///d:/claude/nomad/nomad/server.go#L962) |
| `setupConsulSyncer` | `s *Server` | - | `error` | [L1142](file:///d:/claude/nomad/nomad/server.go#L1142) |
| `setupDeploymentWatcher` | `s *Server` | - | `error` | [L1156](file:///d:/claude/nomad/nomad/server.go#L1156) |
| `setupVolumeWatcher` | `s *Server` | - | `error` | [L1178](file:///d:/claude/nomad/nomad/server.go#L1178) |
| `setupNodeDrainer` | `s *Server` | - | - | [L1187](file:///d:/claude/nomad/nomad/server.go#L1187) |
| `setupRPC` | `s *Server` | `tlsWrap tlsutil.RegionWrapper` | `error` | [L1203](file:///d:/claude/nomad/nomad/server.go#L1203) |
| `setupStreamingEndpoints` | `s *Server` | `server *rpc.Server` | - | [L1268](file:///d:/claude/nomad/nomad/server.go#L1268) |
| `setupRpcServer` | `s *Server` | `server *rpc.Server, ctx *RPCContext` | - | [L1296](file:///d:/claude/nomad/nomad/server.go#L1296) |
| `setupRaft` | `s *Server` | - | `error` | [L1345](file:///d:/claude/nomad/nomad/server.go#L1345) |
| `openRaftWAL` | `s *Server` | `dir string` | `*raftwal.WAL, error` | [L1605](file:///d:/claude/nomad/nomad/server.go#L1605) |
| `startRaftLogVerifier` | `s *Server` | - | - | [L1628](file:///d:/claude/nomad/nomad/server.go#L1628) |
| `verifyRaftStore` | `s *Server` | - | - | [L1659](file:///d:/claude/nomad/nomad/server.go#L1659) |
| `checkRaftVersionFile` | `s *Server` | `path string` | `error` | [L1704](file:///d:/claude/nomad/nomad/server.go#L1704) |
| `setupSerf` | `s *Server` | `conf *serf.Config, ch chan serf.Event, path string` | `*serf.Serf, error` | [L1738](file:///d:/claude/nomad/nomad/server.go#L1738) |
| `shouldReloadSchedulers` | - | `s *Server, newPoolArgs *SchedulerWorkerPoolArgs` | `bool, *SchedulerWorkerPoolArgs` | [L1795](file:///d:/claude/nomad/nomad/server.go#L1795) |
| `IsInvalid` | `swpa *SchedulerWorkerPoolArgs` | - | `bool` | [L1829](file:///d:/claude/nomad/nomad/server.go#L1829) |
| `IsValid` | `swpa *SchedulerWorkerPoolArgs` | - | `bool` | [L1837](file:///d:/claude/nomad/nomad/server.go#L1837) |
| `Copy` | `swpa *SchedulerWorkerPoolArgs` | - | `SchedulerWorkerPoolArgs` | [L1860](file:///d:/claude/nomad/nomad/server.go#L1860) |
| `getSchedulerWorkerPoolArgsFromConfigLocked` | - | `c *Config` | `*SchedulerWorkerPoolArgs` | [L1870](file:///d:/claude/nomad/nomad/server.go#L1870) |
| `GetSchedulerWorkersInfo` | `s *Server` | - | `[]WorkerInfo` | [L1879](file:///d:/claude/nomad/nomad/server.go#L1879) |
| `GetSchedulerWorkerConfig` | `s *Server` | - | `SchedulerWorkerPoolArgs` | [L1892](file:///d:/claude/nomad/nomad/server.go#L1892) |
| `SetSchedulerWorkerConfig` | `s *Server` | `newArgs SchedulerWorkerPoolArgs` | `SchedulerWorkerPoolArgs` | [L1898](file:///d:/claude/nomad/nomad/server.go#L1898) |
| `reloadSchedulers` | - | `s *Server, newArgs *SchedulerWorkerPoolArgs` | - | [L1909](file:///d:/claude/nomad/nomad/server.go#L1909) |
| `setupWorkers` | `s *Server` | `ctx context.Context` | `error` | [L1930](file:///d:/claude/nomad/nomad/server.go#L1930) |
| `setupWorkersLocked` | `s *Server` | `ctx context.Context, poolArgs SchedulerWorkerPoolArgs` | `error` | [L1944](file:///d:/claude/nomad/nomad/server.go#L1944) |
| `setupNewWorkersLocked` | `s *Server` | - | `error` | [L1985](file:///d:/claude/nomad/nomad/server.go#L1985) |
| `stopOldWorkers` | `s *Server` | `oldWorkers []*Worker` | - | [L2009](file:///d:/claude/nomad/nomad/server.go#L2009) |
| `listenWorkerEvents` | `s *Server` | - | - | [L2020](file:///d:/claude/nomad/nomad/server.go#L2020) |
| `numPeers` | `s *Server` | - | `int, error` | [L2062](file:///d:/claude/nomad/nomad/server.go#L2062) |
| `IsLeader` | `s *Server` | - | `bool` | [L2072](file:///d:/claude/nomad/nomad/server.go#L2072) |
| `Join` | `s *Server` | `addrs []string` | `int, error` | [L2079](file:///d:/claude/nomad/nomad/server.go#L2079) |
| `LocalMember` | `s *Server` | - | `serf.Member` | [L2084](file:///d:/claude/nomad/nomad/server.go#L2084) |
| `Members` | `s *Server` | - | `[]serf.Member` | [L2089](file:///d:/claude/nomad/nomad/server.go#L2089) |
| `RemoveFailedNode` | `s *Server` | `node string` | `error` | [L2094](file:///d:/claude/nomad/nomad/server.go#L2094) |
| `RemoveFailedNodePrune` | `s *Server` | `node string` | `error` | [L2099](file:///d:/claude/nomad/nomad/server.go#L2099) |
| `KeyManager` | `s *Server` | - | `*serf.KeyManager` | [L2104](file:///d:/claude/nomad/nomad/server.go#L2104) |
| `Encrypted` | `s *Server` | - | `bool` | [L2109](file:///d:/claude/nomad/nomad/server.go#L2109) |
| `State` | `s *Server` | - | `*state.StateStore` | [L2115](file:///d:/claude/nomad/nomad/server.go#L2115) |
| `setLeaderAcl` | `s *Server` | `token string` | - | [L2120](file:///d:/claude/nomad/nomad/server.go#L2120) |
| `getLeaderAcl` | `s *Server` | - | `string` | [L2127](file:///d:/claude/nomad/nomad/server.go#L2127) |
| `setConsistentReadReady` | `s *Server` | - | - | [L2134](file:///d:/claude/nomad/nomad/server.go#L2134) |
| `resetConsistentReadReady` | `s *Server` | - | - | [L2139](file:///d:/claude/nomad/nomad/server.go#L2139) |
| `isReadyForConsistentReads` | `s *Server` | - | `bool` | [L2144](file:///d:/claude/nomad/nomad/server.go#L2144) |
| `Regions` | `s *Server` | - | `[]string` | [L2149](file:///d:/claude/nomad/nomad/server.go#L2149) |
| `RPC` | `s *Server` | `method string, args interface{}, reply interface{}` | `error` | [L2156](file:///d:/claude/nomad/nomad/server.go#L2156) |
| `StreamingRpcHandler` | `s *Server` | `method string` | `structs.StreamingRpcHandler, error` | [L2169](file:///d:/claude/nomad/nomad/server.go#L2169) |
| `Stats` | `s *Server` | - | `map[string]map[string]string` | [L2175](file:///d:/claude/nomad/nomad/server.go#L2175) |
| `EmitRaftStats` | `s *Server` | `period time.Duration, stopCh chan struct{...}` | - | [L2202](file:///d:/claude/nomad/nomad/server.go#L2202) |
| `setReplyQueryMeta` | `s *Server` | `stateStore *state.StateStore, table string, reply *structs.QueryMeta` | `error` | [L2233](file:///d:/claude/nomad/nomad/server.go#L2233) |
| `Region` | `s *Server` | - | `string` | [L2254](file:///d:/claude/nomad/nomad/server.go#L2254) |
| `Datacenter` | `s *Server` | - | `string` | [L2259](file:///d:/claude/nomad/nomad/server.go#L2259) |
| `GetConfig` | `s *Server` | - | `*Config` | [L2264](file:///d:/claude/nomad/nomad/server.go#L2264) |
| `ReplicationToken` | `s *Server` | - | `string` | [L2270](file:///d:/claude/nomad/nomad/server.go#L2270) |
| `ClusterMetadata` | `s *Server` | - | `structs.ClusterMetadata, error` | [L2283](file:///d:/claude/nomad/nomad/server.go#L2283) |
| `isSingleServerCluster` | `s *Server` | - | `bool` | [L2314](file:///d:/claude/nomad/nomad/server.go#L2314) |

## 5. 核心方法详解

### NewServer()

**签名**：`func NewServer(config *Config, consulCatalog consul.CatalogAPI, consulConfigFunc consul.ConfigAPIFunc) (*Server, error)`

**位置**：[L336](file:///d:/claude/nomad/nomad/server.go#L336)

**中文说明**：构造新的 Nomad Server 实例。这是 Server 的主构造函数，按以下顺序初始化各子系统：
1. 验证废弃配置字段（`RaftBoltNoFreelistSync`）
2. 配置 TLS（`tlsutil.NewTLSConfiguration` + `getTLSConf`）
3. 创建日志记录器
4. 验证企业版许可证
5. 创建 `Server` 结构体实例，初始化各字段（连接池、评估代理、阻塞评估、RPC 处理器、计划器、节点心跳、周期性调度、统计获取器、Consul 配置、加密器、OIDC 发现配置、OIDC 缓存）
6. 初始化 RPC 层（`setupRPC`）
7. 创建 ACL 认证器
8. 初始化 Raft（`setupRaft`）
9. 初始化 Serf WAN（`setupSerf`）
10. 初始化调度 Worker（`setupWorkers`）
11. 设置 Consul 同步器（`setupConsulSyncer`）
12. 设置部署监视器（`setupDeploymentWatcher`）
13. 设置卷监视器（`setupVolumeWatcher`）
14. 启动评估代理通知系统
15. 设置节点排空器（`setupNodeDrainer`）
16. 设置企业状态（`setupEnterprise`）
17. 启动领导权监控（`monitorLeadership`）
18. 启动 Serf 事件处理（`serfEventHandler`）
19. 启动 RPC 监听器（`startRPCListener`）
20. 启动各子系统的指标收集协程
21. 启动企业版后台 Worker
22. 创建密钥环复制器
23. 等待密钥环就绪（`encrypter.IsReady`）

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `config` | `*Config` | Server 配置对象，包含区域、数据中心、Raft、TLS、调度器等所有配置 |
| `consulCatalog` | `consul.CatalogAPI` | Consul 目录 API 接口，用于通过 Consul 发现其他 Nomad Server |
| `consulConfigFunc` | `consul.ConfigAPIFunc` | Consul 配置 API 工厂函数，用于创建 Consul 配置条目管理器 |

**返回值**：`*Server`（构造的 Server 实例）和 `error`（构造过程中的错误）

---

### Shutdown()

**签名**：`func (s *Server) Shutdown() error`

**位置**：[L744](file:///d:/claude/nomad/nomad/server.go#L744)

**中文说明**：关闭 Server。按顺序执行：设置关闭标志、调用 `shutdownCancel` 触发关闭信号、停止所有 Worker（带 `workerShutdownGracePeriod` 超时）、关闭 Serf、关闭 Raft（传输层、层、实例、存储）、关闭 RPC 监听器、关闭连接池、关闭 FSM、停止 Consul 配置条目管理、关闭 OIDC 提供者缓存。通过 `shutdownLock` 保证幂等性，重复调用直接返回。

---

### Leave()

**签名**：`func (s *Server) Leave() error`

**位置**：[L815](file:///d:/claude/nomad/nomad/server.go#L815)

**中文说明**：为优雅关闭做准备。设置 `left` 标志，检查 Raft 对等节点数量。如果是领导者且有多于 1 个对等节点，执行 `RemoveServer`（协议版本 ≥3）或 `RemovePeer`（旧版本）安全减少法定人数。离开 gossip 池（`serf.Leave`）。如果不是领导者，在 `raftRemoveGracePeriod` 超时内轮询 Raft 配置，等待被安全移除，确保立即关闭不会导致法定人数丢失。

---

### Reload()

**签名**：`func (s *Server) Reload(newConfig *Config) error`

**位置**：[L910](file:///d:/claude/nomad/nomad/server.go#L910)

**中文说明**：处理 Server 特定配置的重载。并非所有配置字段都支持重载。依次检查并重载：
1. **TLS 配置**：通过 `tlsutil.ShouldReloadRPCConnections` 判断是否需要重载，调用 `reloadTLSConnections`
2. **许可证配置**：如果 `LicenseEnvBytes` 或 `LicensePath` 非空，调用 `EnterpriseState.ReloadLicense`
3. **调度器 Worker 池**：通过 `shouldReloadSchedulers` 判断是否需要重载，调用 `reloadSchedulers`
4. **Raft 配置**：重载 `TrailingLogs`、`SnapshotInterval`、`SnapshotThreshold`、`HeartbeatTimeout`、`ElectionTimeout` 等可重载项

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `newConfig` | `*Config` | 新的配置对象，不能为 nil |

**返回值**：`error`（聚合的重载错误，可能包含多个子错误）

---

### reloadTLSConnections()

**签名**：`func (s *Server) reloadTLSConnections(newTLSConfig *config.TLSConfig) error`

**位置**：[L676](file:///d:/claude/nomad/nomad/server.go#L676)

**中文说明**：更新 Server 的 TLS 配置并重载 RPC 连接。流程：
1. 检查 RPC 监听器和取消函数是否已初始化
2. 创建新的 TLS 配置（`tlsutil.NewTLSConfiguration`）
3. 获取新的入站 TLS 配置和出站 TLS 包装器（`getTLSConf`）
4. 加锁更新 `tlsWrap`
5. 更新 `config.TLSConfig` 保持配置同步
6. 取消旧监听器（`rpcCancel`）
7. 更新认证器的 TLS 验证设置
8. 更新 `rpcTLS` 和连接池的 TLS（`connPool.ReloadTLS`）
9. 关闭旧 RPC 监听器，等待退出（`<-s.listenerCh`）
10. 创建并启动新监听器
11. 重载 Raft 层的 TLS（`raftLayer.ReloadTLS`）并关闭 Raft 传输流

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `newTLSConfig` | `*config.TLSConfig` | 新的 TLS 配置对象 |

---

### setupRaft()

**签名**：`func (s *Server) setupRaft() error`

**位置**：[L1345](file:///d:/claude/nomad/nomad/server.go#L1345)

**中文说明**：设置并初始化 Raft 共识。这是 Server 一致性保证的核心初始化方法，流程：
1. 创建 FSM（有限状态机），配置包括评估代理、周期性调度、阻塞评估、加密器、事件代理等
2. 创建 Raft 网络传输层（`raft.NetworkTransport`），基于 `raftLayer`
3. 设置 Raft 配置（日志记录器、LocalID）
4. **开发模式**：使用内存存储（`raft.NewInmemStore`）和丢弃快照存储
5. **生产模式**：
   - 创建 Raft 数据目录
   - 检查并更新 Raft 版本文件（防止降级）
   - 根据 `RaftLogStoreConfig.Backend` 选择日志存储后端：
     - **WAL**：检测到现有 BoltDB 则报错要求先迁移；否则打开 WAL 存储
     - **BoltDB**：创建 BoltDB 存储，可选 `NoFreelistSync`
   - 可选启动日志存储验证器（`startRaftLogVerifier`）
   - 可选包装日志缓存（`raft.NewLogCache`）
   - 创建文件快照存储
   - 处理 `peers.json` 恢复（首次启动创建 `peers.info` 并删除旧 `peers.json`；存在 `peers.json` 则恢复集群配置）
6. 单服务器集群且状态干净时引导集群（`raft.BootstrapCluster`）
7. 创建 Raft 实例（`raft.NewRaft`）

---

### setupSerf()

**签名**：`func (s *Server) setupSerf(conf *serf.Config, ch chan serf.Event, path string) (*serf.Serf, error)`

**位置**：[L1738](file:///d:/claude/nomad/nomad/server.go#L1738)

**中文说明**：设置并初始化 Serf 集群。配置 Serf 节点名（`NodeName.Region`）、标签（role、region、dc、build、revision、vsn、raft_vsn、id、rpc_addr、port）、引导标志、冗余区域、升级版本等。设置日志记录器、事件通道、快照路径（非开发模式）、离开传播延迟（1 秒）、合并委托，禁用名称冲突解决。通过 `serf.Create` 创建。

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `conf` | `*serf.Config` | Serf 配置对象，由调用方提供 |
| `ch` | `chan serf.Event` | 接收 Serf 事件的通道 |
| `path` | `string` | Serf 快照的相对路径 |

**返回值**：`*serf.Serf`（创建的 Serf 实例）和 `error`

---

### setupBootstrapHandler()

**签名**：`func (s *Server) setupBootstrapHandler() error`

**位置**：[L962](file:///d:/claude/nomad/nomad/server.go#L962)

**中文说明**：创建支持 Consul 回退处理器的闭包。实现一个 `bootstrapFn` 回调，周期性轮询 Consul 查找 Nomad Server。逻辑：
- 如果有 Raft 领导者，重置 `peersTimeout` 为 `maxStaleLeadership`，直接返回
- 如果未引导（`BootstrapExpect != 0`）且对等节点数已达预期，切换到超时策略
- 如果 `peersTimeout` 未超时，跳过查询
- 超时后查询 Consul 数据中心（最多 `datacenterQueryLimit` 个），查找注册的 Nomad Server 服务
- 找到服务器地址后调用 `s.Join` 加入集群
- 启动后台协程周期性执行 `bootstrapFn`，成功间隔 `defaultConsulDiscoveryInterval`，失败间隔 `defaultConsulDiscoveryIntervalRetry`

---

### setupRPC()

**签名**：`func (s *Server) setupRPC(tlsWrap tlsutil.RegionWrapper) error`

**位置**：[L1203](file:///d:/claude/nomad/nomad/server.go#L1203)

**中文说明**：设置 RPC 监听器。流程：
1. 填充静态 RPC 服务器（`setupRpcServer`）
2. 设置流式端点（`setupStreamingEndpoints`）
3. 创建 RPC 监听器（`createRPCListener`）
4. 设置客户端 RPC 广播地址（`clientRpcAdvertise`），验证是 TCP 地址且 IP 可广播
5. 设置服务器 RPC 广播地址（`serverRpcAdvertise`），基于 Serf 广播地址 + RPC 端口推导
6. 创建 Raft 层（`NewRaftLayer`），使用区域特定的 TLS 包装器

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `tlsWrap` | `tlsutil.RegionWrapper` | TLS 区域包装器，用于出站连接的 TLS 包装 |

---

### setupRpcServer()

**签名**：`func (s *Server) setupRpcServer(server *rpc.Server, ctx *RPCContext)`

**位置**：[L1296](file:///d:/claude/nomad/nomad/server.go#L1296)

**中文说明**：用端点填充 RPC 服务器。在启动时调用一次，且每个新 RPC 连接也调用一次，使 RPC 处理器具有每连接上下文。注册的端点包括：
- **无连接上下文的客户端 RPC**：`ClientStats`、`NodeMeta`、`NodeIdentity`
- **流式 + 非流式端点**：`ClientAllocations`、`FileSystem`、`Agent`、`Operator`
- **带连接上下文的端点**：`ACL`、`Alloc`、`ClientCSI`、`CSIVolume`、`CSIPlugin`、`Deployment`、`Eval`、`Job`、`Keyring`、`Namespace`、`Node`、`NodePool`、`Periodic`、`Plan`、`Region`、`Scaling`、`Search`、`ServiceRegistration`、`Status`、`System`、`Variables`、`HostVolume`、`TaskGroupVolumeClaim`、`ClientHostVolume`
- **企业版端点**：通过 `NewEnterpriseEndpoints` 注册

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `server` | `*rpc.Server` | 要填充的 RPC 服务器实例 |
| `ctx` | `*RPCContext` | RPC 连接上下文，启动时为 nil |

---

### setupWorkers()

**签名**：`func (s *Server) setupWorkers(ctx context.Context) error`

**位置**：[L1930](file:///d:/claude/nomad/nomad/server.go#L1930)

**中文说明**：启动调度 Worker。获取当前调度器配置，启动 Worker 事件监听协程（`listenWorkerEvents`），加写锁后调用 `setupWorkersLocked` 创建 Worker。

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | Worker 上下文，用于取消和超时控制 |

---

### setupWorkersLocked()

**签名**：`func (s *Server) setupWorkersLocked(ctx context.Context, poolArgs SchedulerWorkerPoolArgs) error`

**位置**：[L1944](file:///d:/claude/nomad/nomad/server.go#L1944)

**中文说明**：直接操作 `server.config`，非并发安全，调用方需持有 `workerLock`。验证调度器配置（必须启用 `_core` 且只含已知调度器），按 `NumSchedulers` 数量创建 Worker，每个 Worker 的关闭通道加入 `workerShutdownGroup`。

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | Worker 上下文 |
| `poolArgs` | `SchedulerWorkerPoolArgs` | Worker 池配置参数 |

---

### IsValid() (SchedulerWorkerPoolArgs 方法)

**签名**：`func (swpa SchedulerWorkerPoolArgs) IsValid() bool`

**位置**：[L1837](file:///d:/claude/nomad/nomad/server.go#L1837)

**中文说明**：验证池参数是否有效。检查：`NumSchedulers` 非负且不超过 CPU 核心数；`EnabledSchedulers` 列表包含 `_core`（`structs.JobTypeCore`）且只引用已知调度器（`scheduler.BuiltinSchedulers`）。`_core` 不在 `BuiltinSchedulers` 映射中，需特殊跳过检查。

---

### shouldReloadSchedulers()

**签名**：`func shouldReloadSchedulers(s *Server, newPoolArgs *SchedulerWorkerPoolArgs) (bool, *SchedulerWorkerPoolArgs)`

**位置**：[L1795](file:///d:/claude/nomad/nomad/server.go#L1795)

**中文说明**：检查新配置是否需要更新调度器 Worker 池。比较 `NumSchedulers` 和排序后的 `EnabledSchedulers` 列表，任一不同则返回 `true` 和新参数指针。

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `s` | `*Server` | Server 实例 |
| `newPoolArgs` | `*SchedulerWorkerPoolArgs` | 新的 Worker 池参数 |

**返回值**：`bool`（是否需要重载）和 `*SchedulerWorkerPoolArgs`（重载时的新参数，否则为 nil）

---

### reloadSchedulers()

**签名**：`func reloadSchedulers(s *Server, newArgs *SchedulerWorkerPoolArgs)`

**位置**：[L1909](file:///d:/claude/nomad/nomad/server.go#L1909)

**中文说明**：验证参数、加写锁、应用新值到 `s.config`、重启 Worker 池。获取 `workerConfigLock` 和 `workerLock` 写锁后更新配置并调用 `setupNewWorkersLocked`。

---

### ClusterMetadata()

**签名**：`func (s *Server) ClusterMetadata() (structs.ClusterMetadata, error)`

**位置**：[L2283](file:///d:/claude/nomad/nomad/server.go#L2283)

**中文说明**：返回集群元数据（UUID 和时间戳）。任何 Nomad Server 都可调用。如果是领导者且 ID 尚未创建，则现在创建；否则返回错误 "cluster ID not ready yet"。ID 在所有参与的服务器达到最低版本（0.10.4）后才会创建。通过 `clusterIDLock` 防止并发建立集群 ID。

**返回值**：`structs.ClusterMetadata`（集群元数据）和 `error`

---

### RPC()

**签名**：`func (s *Server) RPC(method string, args interface{}, reply interface{}) error`

**位置**：[L2156](file:///d:/claude/nomad/nomad/server.go#L2156)

**中文说明**：发起本地 RPC 调用。创建内存编解码器（`codec.InmemCodec`），通过 `rpcServer.ServeRequest` 处理请求，返回编解码器的错误。

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `method` | `string` | RPC 方法名 |
| `args` | `interface{}` | 请求参数 |
| `reply` | `interface{}` | 响应对象指针 |

---

### Stats()

**签名**：`func (s *Server) Stats() map[string]map[string]string`

**位置**：[L2175](file:///d:/claude/nomad/nomad/server.go#L2175)

**中文说明**：返回各子系统的统计信息用于调试。包含 `nomad`（server、leader、leader_addr、bootstrap、known_regions）、`raft`（Raft 统计 + logstore_backend）、`serf`（Serf 统计）、`runtime`（Go 运行时统计）。

---

### EmitRaftStats()

**签名**：`func (s *Server) EmitRaftStats(period time.Duration, stopCh <-chan struct{})`

**位置**：[L2202](file:///d:/claude/nomad/nomad/server.go#L2202)

**中文说明**：周期性导出 Raft 索引和状态存储快照索引的指标。使用 `helper.NewSafeTimer` 避免定时器竞态。每周期设置 `raft.lastIndex`、`raft.appliedIndex` 和 `state.snapshotIndex` 指标。

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `period` | `time.Duration` | 指标导出周期 |
| `stopCh` | `<-chan struct{}` | 停止信号通道，关闭时退出 |

---

### setReplyQueryMeta()

**签名**：`func (s *Server) setReplyQueryMeta(stateStore *state.StateStore, table string, reply *structs.QueryMeta) error`

**位置**：[L2233](file:///d:/claude/nomad/nomad/server.go#L2233)

**中文说明**：RPC 辅助函数，为读响应填充查询元数据。从索引表获取索引并确保至少为 1（向下取整），设置领导者和最后联系信息。如果 `stateStore` 为 nil，从 `fsm.State()` 获取新句柄。

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `stateStore` | `*state.StateStore` | 状态存储，可为 nil（自动从 FSM 获取） |
| `table` | `string` | 索引表名 |
| `reply` | `*structs.QueryMeta` | 要填充的查询元数据响应 |

---

### getTLSConf()

**签名**：`func getTLSConf(enableRPC bool, tlsConf *tlsutil.Config, region string) (*tls.Config, tlsutil.RegionWrapper, error)`

**位置**：[L610](file:///d:/claude/nomad/nomad/server.go#L610)

**中文说明**：根据操作员配置获取 Server 的 TLS 配置。如果未启用 RPC，返回 nil。否则获取出站 TLS 包装器（`OutgoingTLSWrapper`）和入站 TLS 配置（`IncomingTLSConfig`）。如果启用 `VerifyServerHostname`，克隆入站配置并设置自定义证书验证器（`rpcNameAndRegionValidator`）。

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `enableRPC` | `bool` | 是否启用 RPC TLS |
| `tlsConf` | `*tlsutil.Config` | TLS 工具配置 |
| `region` | `string` | 区域名，用于证书验证 |

**返回值**：`*tls.Config`（入站 TLS 配置）、`tlsutil.RegionWrapper`（出站 TLS 包装器）、`error`

---

### rpcNameAndRegionValidator()

**签名**：`func rpcNameAndRegionValidator(region string) func([][]byte, [][]*x509.Certificate) error`

**位置**：[L639](file:///d:/claude/nomad/nomad/server.go#L639)

**中文说明**：实现 `tls.Config.VerifyPeerCertificate` 签名，在证书验证后调用。忽略原始证书，只检查已验证的证书。验证证书的 DNS 名称或 CommonName 是否符合 RPC 区域对等节点要求（通过 `validateRPCRegionPeer`）。

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `region` | `string` | 本地区域名 |

**返回值**：证书验证函数，验证通过返回 nil，失败返回 "invalid role or region for certificate" 错误

---

### validateRPCRegionPeer()

**签名**：`func validateRPCRegionPeer(name, region string) bool`

**位置**：[L656](file:///d:/claude/nomad/nomad/server.go#L656)

**中文说明**：验证 RPC 对等节点名称是否有效。解析点分隔的名称（如 `server.dc1.nomad`），要求至少 3 部分、最后部分为 `nomad`。客户端只能连接本区域服务器（`client.{region}.nomad`），服务器可连接任何 Nomad RPC 服务用于联邦。

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 证书名称（DNS 名或 CommonName） |
| `region` | `string` | 本地区域名 |

**返回值**：`bool`（是否有效）

---

### GetSchedulerWorkersInfo()

**签名**：`func (s *Server) GetSchedulerWorkersInfo() []WorkerInfo`

**位置**：[L1879](file:///d:/claude/nomad/nomad/server.go#L1879)

**中文说明**：返回所有运行中调度 Worker 的 `WorkerInfo` 切片。加读锁后遍历 `workers`，对每个 Worker 调用 `Info()` 并复制返回。

---

### GetSchedulerWorkerConfig()

**签名**：`func (s *Server) GetSchedulerWorkerConfig() SchedulerWorkerPoolArgs`

**位置**：[L1892](file:///d:/claude/nomad/nomad/server.go#L1892)

**中文说明**：返回服务器当前调度器 Worker 配置的干净副本。加 `workerConfigLock` 读锁后通过 `getSchedulerWorkerPoolArgsFromConfigLocked` 获取并 `Copy`。

---

### SetSchedulerWorkerConfig()

**签名**：`func (s *Server) SetSchedulerWorkerConfig(newArgs SchedulerWorkerPoolArgs) SchedulerWorkerPoolArgs`

**位置**：[L1898](file:///d:/claude/nomad/nomad/server.go#L1898)

**中文说明**：设置新的调度器 Worker 配置。如果 `shouldReloadSchedulers` 返回 true 且新值有效，调用 `reloadSchedulers` 重载。返回最终的 Worker 配置。

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `newArgs` | `SchedulerWorkerPoolArgs` | 新的 Worker 池参数 |

**返回值**：`SchedulerWorkerPoolArgs`（设置后的配置）

---

### GetConfig()

**签名**：`func (s *Server) GetConfig() *Config`

**位置**：[L2264](file:///d:/claude/nomad/nomad/server.go#L2264)

**中文说明**：返回服务器的配置对象，仅供测试使用。

---

### openRaftWAL()

**签名**：`func (s *Server) openRaftWAL(dir string) (*raftwal.WAL, error)`

**位置**：[L1605](file:///d:/claude/nomad/nomad/server.go#L1605)

**中文说明**：在指定目录打开 raft-wal 日志存储。从 `s.config.RaftLogStoreConfig` 读取 WAL 特定选项（段大小），创建 go-metrics 收集器，通过 `raftwal.Open` 打开。

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `dir` | `string` | WAL 存储目录 |

**返回值**：`*raftwal.WAL`（WAL 存储实例）和 `error`

---

### startRaftLogVerifier()

**签名**：`func (s *Server) startRaftLogVerifier()`

**位置**：[L1628](file:///d:/claude/nomad/nomad/server.go#L1628)

**中文说明**：启动后台协程周期性验证 Raft 日志存储（当配置的存储支持验证时）。运行直到 `shutdownCtx` 完成。验证是尽力而为的：任何错误都记录日志，验证器继续按下一个间隔运行。默认间隔 5 分钟，可通过 `VerificationInterval` 配置。

---

### verifyRaftStore()

**签名**：`func (s *Server) verifyRaftStore()`

**位置**：[L1659](file:///d:/claude/nomad/nomad/server.go#L1659)

**中文说明**：对配置的 Raft 存储执行健康检查。验证可读取索引信息（`FirstIndex`、`LastIndex`）。针对不同存储类型执行特定验证：
- **BoltDB**：收集数据库统计（事务数、空闲页、待处理页）
- **WAL**：验证日志索引单调递增（`IsMonotonic`）

由 `startRaftLogVerifier` 周期性调用。

---

### checkRaftVersionFile()

**签名**：`func (s *Server) checkRaftVersionFile(path string) error`

**位置**：[L1704](file:///d:/claude/nomad/nomad/server.go#L1704)

**中文说明**：读取 Raft 版本文件，如果版本与当前配置不兼容则返回错误。如果文件无法读取则尽力检查。防止 Raft 协议降级（不支持从高版本降级到低版本）。

**参数说明**：
| 参数名 | 类型 | 说明 |
|--------|------|------|
| `path` | `string` | Raft 版本文件路径 |

**返回值**：`error`（降级时返回错误，其他情况返回 nil）

---

### listenWorkerEvents()

**签名**：`func (s *Server) listenWorkerEvents()`

**位置**：[L2020](file:///d:/claude/nomad/nomad/server.go#L2020)

**中文说明**：监听调度 Worker 发出的事件并按需记录日志。部分事件可能被跳过以避免重复日志污染。维护 `loggedAt` 映射记录上次记录时间，每 10 秒执行 GC（4 小时过期）。处理 `PortCollisionEvent`（端口冲突事件），按节点 ID 去重，记录警告日志并附上事件 JSON。

---

### 其他辅助方法

| 方法 | 中文说明 |
|------|---------|
| `startRPCListener` | 启动 RPC 监听器协程，调用 `createRPCListener` 创建监听器并启动 `serveRPC` 协程处理传入连接 |
| `createRPCListener` | 创建 TCP 监听器，从配置获取 RPC 地址，使用 `net.ResolveTCPAddr` 和 `net.ListenTCP` 创建 |
| `setupConsulSyncer` | 设置 Consul 同步器，初始化 `consulConfigEntries` 的同步任务，注册配置条目同步器 |
| `setupDeploymentWatcher` | 创建部署监视器实例，配置包括日志记录器、状态查询函数、评估代理、计划器和关闭通道 |
| `setupVolumeWatcher` | 创建卷监视器实例，配置包括日志记录器、状态查询函数、评估代理和关闭通道 |
| `setupNodeDrainer` | 创建节点排空器实例，配置包括状态查询函数、评估代理、计划器、日志记录器、事件代理和关闭通道 |
| `setupStreamingEndpoints` | 在 RPC 服务器上注册流式 RPC 端点，包括事件流、分配日志流、节点事件流、服务部署流等 |
| `IsShutdown` | 返回 Server 是否已关闭，通过 `shutdownLock` 保护读取 `shutdown` 字段 |
| `IsLeader` | 检查本服务器是否为集群领导者，通过 `s.raft.State() == raft.Leader` 判断 |
| `Join` | 让 Nomad 加入 gossip 环，目标地址应为另一个监听 Serf 地址的节点 |
| `LocalMember` | 返回本地节点的 Serf 成员信息 |
| `Members` | 返回 Serf 集群的成员列表 |
| `RemoveFailedNode` | 从集群中移除失败节点（标记为非活跃） |
| `RemoveFailedNodePrune` | 立即从成员列表中移除失败节点（彻底删除） |
| `KeyManager` | 返回 Serf 密钥环管理器，用于管理 gossip 加密密钥 |
| `Encrypted` | 判断 gossip 是否加密，通过 `s.serf.EncryptionEnabled()` 检查 |
| `State` | 返回底层状态存储。**不应直接用于修改状态**，应通过 Raft 提交 |
| `setLeaderAcl` | 存储给定的 ACL 令牌作为当前领导者的 ACL 令牌，加锁后设置 `leaderAcl` |
| `getLeaderAcl` | 获取领导者的 ACL 令牌，加锁后读取 `leaderAcl` |
| `setConsistentReadReady` | 获取领导权后原子设置就绪标志，表示服务器已通过屏障写入，可提供一致性读取 |
| `resetConsistentReadReady` | 领导权撤销时原子重置就绪标志 |
| `isReadyForConsistentReads` | 返回服务器是否准备好提供一致性读取 |
| `Regions` | 返回集群中已知的区域列表，从 `peersCache` 获取并排序 |
| `StreamingRpcHandler` | 获取指定方法的流式 RPC 处理器，从 `streamingRpcs` 注册表查找 |
| `Region` | 返回服务器的区域名（`config.Region`） |
| `Datacenter` | 返回服务器的数据中心名（`config.Datacenter`） |
| `ReplicationToken` | 返回用于复制的令牌（`config.ReplicationToken`），支持未来动态重载 |
| `isSingleServerCluster` | 判断是否为单服务器集群（`config.BootstrapExpect == 1`） |
| `numPeers` | 检查已知对等节点数量（包括本地节点），通过 `raft.GetConfiguration` 获取 |
| `setupNewWorkersLocked` | 持有 `workerLock` 时创建新 Worker 数组并异步停止旧 Worker，调用方需持有写锁 |
| `stopOldWorkers` | 异步停止每个旧 Worker，每个 Worker 在独立协程中调用 `Stop` |
| `IsInvalid` (SchedulerWorkerPoolArgs) | `IsValid` 的反向判断，返回 `!IsValid()` |
| `Copy` (SchedulerWorkerPoolArgs) | 返回 `SchedulerWorkerPoolArgs` 的深拷贝，复制 `EnabledSchedulers` 切片 |
| `getSchedulerWorkerPoolArgsFromConfigLocked` | 从 `Config` 提取 `SchedulerWorkerPoolArgs`，调用方需持有 `workerConfigLock` |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `crypto/tls` | 标准库 |
| `crypto/x509` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `go.etcd.io/bbolt` | 标准库 |
| `net` | 标准库 |
| `net/rpc` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `runtime` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `sync/atomic` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/command/agent/consul` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/codec` | 内部包 |
| `github.com/hashicorp/nomad/helper/goruntime` | 内部包 |
| `github.com/hashicorp/nomad/helper/group` | 内部包 |
| `github.com/hashicorp/nomad/helper/pool` | 内部包 |
| `github.com/hashicorp/nomad/helper/tlsutil` | 内部包 |
| `github.com/hashicorp/nomad/lib/auth/oidc` | 内部包 |
| `github.com/hashicorp/nomad/nomad/auth` | 内部包 |
| `github.com/hashicorp/nomad/nomad/deploymentwatcher` | 内部包 |
| `github.com/hashicorp/nomad/nomad/drainer` | 内部包 |
| `github.com/hashicorp/nomad/nomad/lock` | 内部包 |
| `github.com/hashicorp/nomad/nomad/peers` | 内部包 |
| `github.com/hashicorp/nomad/nomad/reporting` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs/config` | 内部包 |
| `github.com/hashicorp/nomad/nomad/volumewatcher` | 内部包 |
| `github.com/hashicorp/nomad/scheduler` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |
| `github.com/hashicorp/consul/api` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/raft` | 第三方库 |
| `github.com/hashicorp/raft-autopilot` | 第三方库 |
| `github.com/hashicorp/raft-boltdb/v2` | 第三方库 |
| `github.com/hashicorp/raft-wal` | 第三方库 |
| `github.com/hashicorp/raft-wal/metrics` | 第三方库 |
| `github.com/hashicorp/serf/serf` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Raft 共识**：使用 HashiCorp Raft 库实现分布式共识，保证状态一致性
- **调度器模式**：实现调度器接口，从评估队列获取评估并产生调度计划
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [server_test.go](file:///d:/claude/nomad/nomad/server_test.go) | 对应测试文件 |

