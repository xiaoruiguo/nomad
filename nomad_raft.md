# Nomad Raft 技术实现深度分析

> 文档主题：分析 Nomad 集群中 Raft 共识算法的实现细节
> 源码仓库：[d:/claude/nomad](file:///d:/claude/nomad)
> 主要源文件：[nomad/server.go](file:///d:/claude/nomad/nomad/server.go)、[nomad/fsm.go](file:///d:/claude/nomad/nomad/fsm.go)、[nomad/raft_rpc.go](file:///d:/claude/nomad/nomad/raft_rpc.go)、[nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go)、[nomad/serf.go](file:///d:/claude/nomad/nomad/serf.go)、[nomad/autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go)、[nomad/config.go](file:///d:/claude/nomad/nomad/config.go)
> 底层库：[github.com/hashicorp/raft](https://github.com/hashicorp/raft)（hashicorp/raft v1.x）

---

## 目录

1. [总体架构概览](#1-总体架构概览)
2. [Raft 配置体系](#2-raft-配置体系)
3. [setupRaft 初始化流程](#3-setupraft-初始化流程)
4. [日志存储后端（BoltDB / WAL）](#4-日志存储后端boltdb--wal)
5. [快照存储（FileSnapshotStore）](#5-快照存储filesnapshotstore)
6. [FSM 有限状态机](#6-fsm-有限状态机)
7. [RaftLayer 自定义网络传输层](#7-raftlayer-自定义网络传输层)
8. [集群引导（Bootstrap）](#8-集群引导bootstrap)
9. [领导权选举与 leaderLoop](#9-领导权选举与-leaderloop)
10. [Autopilot 自动集群管理](#10-autopilot-自动集群管理)
11. [peers.json 灾难恢复机制](#11-peersjson-灾难恢复机制)
12. [Raft 统计指标输出](#12-raft-统计指标输出)
13. [helper/raftutil 辅助包](#13-helperraftutil-辅助包)
14. [关键调用链汇总](#14-关键调用链汇总)
15. [源码索引](#15-源码索引)

---

## 1. 总体架构概览

Nomad Server 通过 Raft 共识算法实现强一致性。整体架构由以下组件协作：

```
┌─────────────────────────────────────────────────────────────────┐
│                     Nomad Server                                │
│                                                                 │
│  ┌────────────────┐    ┌────────────────┐    ┌──────────────┐  │
│  │  RPC Layer     │───▶│  RaftLayer     │───▶│  Raft Core   │  │
│  │  (Yamux/TLS)   │    │ (StreamLayer)  │    │  (hashicorp) │  │
│  └────────────────┘    └────────────────┘    └──────┬───────┘  │
│                                                      │          │
│                       ┌──────────────────────────────┤          │
│                       ▼                              ▼          │
│                ┌────────────┐              ┌─────────────────┐  │
│                │   FSM      │◀─────────────│  LogStore       │  │
│                │ (nomadFSM) │   Apply()    │ (BoltDB / WAL)  │  │
│                └─────┬──────┘              └─────────────────┘  │
│                      │                                          │
│                      ▼                                          │
│                ┌────────────┐              ┌─────────────────┐  │
│                │ StateStore │              │ SnapshotStore   │  │
│                │ (memdb)    │              │ (FileSnapshot)  │  │
│                └────────────┘              └─────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Serf (Gossip)  ────▶  maybeBootstrap  ────▶  Raft Peers │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Autopilot  ────▶  RemoveFailedServer / NotifyState      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**核心组件说明**：

| 组件 | 文件 | 职责 |
|------|------|------|
| Raft Core | 第三方库 `hashicorp/raft` | 实现共识协议、领导选举、日志复制 |
| FSM | [nomad/fsm.go](file:///d:/claude/nomad/nomad/fsm.go) | 应用 Raft 日志到状态机 |
| RaftLayer | [nomad/raft_rpc.go](file:///d:/claude/nomad/nomad/raft_rpc.go) | 自定义 StreamLayer，复用 RPC 连接 |
| setupRaft | [nomad/server.go#L1344-L1601](file:///d:/claude/nomad/nomad/server.go#L1344-L1601) | 初始化所有 Raft 组件 |
| leaderLoop | [nomad/leader.go#L248-L370](file:///d:/claude/nomad/nomad/leader.go#L248-L370) | 领导权维护循环 |
| Serf | [nomad/serf.go](file:///d:/claude/nomad/nomad/serf.go) | 成员发现与多节点引导 |
| Autopilot | [nomad/autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | 自动故障服务器清理 |

---

## 2. Raft 配置体系

### 2.1 RaftConfig 定义

**位置**：[nomad/config.go#L100-L104](file:///d:/claude/nomad/nomad/config.go#L100-L104)

```go
// RaftConfig is the configuration used for Raft in the local DC
RaftConfig *raft.Config

// RaftTimeout is applied to any network traffic for raft. Defaults to 10s.
RaftTimeout time.Duration
```

`RaftConfig` 嵌入 `*raft.Config`，由 hashicorp/raft 库定义，包含以下关键字段：

| 字段 | 默认值 | 说明 |
|------|--------|------|
| `ProtocolVersion` | 3 | Raft 协议版本（Nomad 使用 v3） |
| `LocalID` | 由 setupRaft 设置 | 本节点 ServerID |
| `HeartbeatTimeout` | 1s | 心跳超时 |
| `ElectionTimeout` | 1s | 选举超时 |
| `CommitTimeout` | 50ms | 提交超时 |
| `SnapshotThreshold` | 8192 | 触发快照的日志条目数 |
| `SnapshotInterval` | 120s | 快照检查间隔 |
| `TrailingLogs` | 10240 | 快照后保留的尾部日志数 |

### 2.2 RaftLogStoreConfig

**位置**：[nomad/config.go#L481-L501](file:///d:/claude/nomad/nomad/config.go#L481-L501)

```go
type RaftLogStoreConfig struct {
    Backend              string        // "boltdb" 或 "wal"
    BoltDBNoFreelistSync bool          // BoltDB 是否同步 freelist
    WALSegmentSize       int           // WAL 段大小（字节）
    DisableLogCache      bool          // 禁用内存日志缓存
    VerificationEnabled  bool          // 启用在线日志校验
    VerificationInterval time.Duration // 校验间隔
}
```

### 2.3 日志存储后端常量

**位置**：[nomad/config.go#L473-L479](file:///d:/claude/nomad/nomad/config.go#L473-L479)

```go
const (
    LogStoreBackendBoltDB = "boltdb"  // 原始 BoltDB 后端
    LogStoreBackendWAL    = "wal"     // 新的 segment-based WAL 后端
)
```

---

## 3. setupRaft 初始化流程

**位置**：[nomad/server.go#L1344-L1601](file:///d:/claude/nomad/nomad/server.go#L1344-L1601)

### 3.1 流程图

```
setupRaft()
    │
    ├─[1] 创建 FSM (NewFSM)
    │
    ├─[2] 创建 NetworkTransport (使用 RaftLayer)
    │
    ├─[3] 设置 RaftConfig.Logger / LocalID
    │       └─ ProtocolVersion >= 3 时使用 NodeID
    │
    ├─[4] 区分 DevMode：
    │       ├─ DevMode: InmemStore + DiscardSnapshotStore
    │       └─ 正常模式:
    │           ├─ 创建 raft 数据目录
    │           ├─ 写入 version 文件
    │           ├─ 选择 LogStore 后端 (BoltDB 或 WAL)
    │           ├─ 创建 LogCache 包装
    │           ├─ 创建 FileSnapshotStore
    │           └─ 处理 peers.json 灾难恢复
    │
    ├─[5] 单节点集群：自动 BootstrapCluster
    │
    └─[6] raft.NewRaft() 组装最终实例
```

### 3.2 关键代码解析

#### 步骤 1：创建 FSM

**位置**：[server.go#L1356-L1373](file:///d:/claude/nomad/nomad/server.go#L1356-L1373)

```go
fsmConfig := &FSMConfig{
    EvalBroker:         s.evalBroker,
    Periodic:           s.periodicDispatcher,
    Blocked:            s.blockedEvals,
    Encrypter:          s.encrypter,
    Logger:             s.logger,
    Region:             s.Region(),
    EnableEventBroker:  s.config.EnableEventBroker,
    EventBufferSize:    s.config.EventBufferSize,
    JobTrackedVersions: s.config.JobTrackedVersions,
}
s.fsm, err = NewFSM(fsmConfig)
```

#### 步骤 2：创建 NetworkTransport

**位置**：[server.go#L1375-L1389](file:///d:/claude/nomad/nomad/server.go#L1375-L1389)

```go
netConfig := &raft.NetworkTransportConfig{
    Stream:                  s.raftLayer,  // 复用 RPC 连接的 RaftLayer
    MaxPool:                 3,
    Timeout:                 s.config.RaftTimeout,
    Logger:                  logger,
    MsgpackUseNewTimeFormat: true,
}
trans := raft.NewNetworkTransportWithConfig(netConfig)
```

#### 步骤 3：设置 LocalID

**位置**：[server.go#L1395-L1400](file:///d:/claude/nomad/nomad/server.go#L1395-L1400)

```go
// ProtocolVersion 2: LocalID 必须等于网络地址
s.config.RaftConfig.LocalID = raft.ServerID(trans.LocalAddr())
// ProtocolVersion 3: 使用永久 ID（NodeID）
if s.config.RaftConfig.ProtocolVersion >= 3 {
    s.config.RaftConfig.LocalID = raft.ServerID(s.config.NodeID)
}
```

#### 步骤 4：组装 Raft 实例

**位置**：[server.go#L1596-L1599](file:///d:/claude/nomad/nomad/server.go#L1596-L1599)

```go
s.raft, err = raft.NewRaft(
    s.config.RaftConfig,  // 配置
    s.fsm,                // FSM
    log,                  // LogStore
    stable,               // StableStore
    snap,                 // SnapshotStore
    trans,                // Transport
)
```

---

## 4. 日志存储后端（BoltDB / WAL）

### 4.1 后端选择逻辑

**位置**：[server.go#L1431-L1487](file:///d:/claude/nomad/nomad/server.go#L1431-L1487)

```go
backend := LogStoreBackendBoltDB
if s.config.RaftLogStoreConfig != nil && s.config.RaftLogStoreConfig.Backend != "" {
    backend = s.config.RaftLogStoreConfig.Backend
}

switch backend {
case LogStoreBackendWAL:
    // 检查是否存在旧的 BoltDB 存储（需要先迁移）
    // 创建 wal 目录
    // 调用 openRaftWAL()
case LogStoreBackendBoltDB:
    // 创建 raftboltdb，可选 NoFreelistSync
    // 启动 bboltdb 指标发布
default:
    return fmt.Errorf("unsupported raft log store backend: %q", backend)
}
```

### 4.2 BoltDB 后端

**位置**：[server.go#L1461-L1484](file:///d:/claude/nomad/nomad/server.go#L1461-L1484)

- 数据文件路径：`<DataDir>/server/raft/raft.db`
- 选项：
  - `NoSync: false` — 每次日志写入都 fsync
  - `NoFreelistSync` — 可配置，禁用可提升性能
  - `MsgpackUseNewTimeFormat: true`
- 启动 `boltStore.RunMetrics()` 发布 bbolt 内部指标

### 4.3 WAL 后端

**位置**：[server.go#L1603-L1622](file:///d:/claude/nomad/nomad/server.go#L1603-L1622)（openRaftWAL）

```go
func (s *Server) openRaftWAL(dir string) (*raftwal.WAL, error) {
    mc := walmetrics.NewGoMetricsCollector(
        []string{"nomad", "raft", "wal"}, nil, nil,
    )
    walStore, err := raftwal.Open(dir,
        raftwal.WithLogger(s.logger.Named("wal")),
        raftwal.WithSegmentSize(s.config.RaftLogStoreConfig.WALSegmentSize),
        raftwal.WithMetricsCollector(mc),
    )
    return walStore, nil
}
```

WAL 后端特点：
- 基于 segment 的预写日志（Write-Ahead Log）
- 支持自定义段大小（`WALSegmentSize`）
- 集成 `go-metrics` 指标采集
- **不能直接从 BoltDB 切换到 WAL**，必须使用 `nomad operator raft migrate-backend` 命令在停机时迁移（[server.go#L1442-L1448](file:///d:/claude/nomad/nomad/server.go#L1442-L1448)）

### 4.4 LogCache 包装

**位置**：[server.go#L1501-L1512](file:///d:/claude/nomad/nomad/server.go#L1501-L1512)

```go
if disableLogCache {
    log = store
} else {
    cacheStore, err := raft.NewLogCache(raftLogCacheSize, store)
    log = cacheStore
}
```

`LogCache` 在内存中缓存最近的日志条目，减少对底层存储的读取压力。`raftLogCacheSize` 默认 512。

### 4.5 在线校验

**位置**：[server.go#L1496-L1499](file:///d:/claude/nomad/nomad/server.go#L1496-L1499)

```go
if s.config.RaftLogStoreConfig != nil && s.config.RaftLogStoreConfig.VerificationEnabled {
    s.startRaftLogVerifier()  // 后台周期性校验日志存储
}
```

---

## 5. 快照存储（FileSnapshotStore）

**位置**：[server.go#L1514-L1522](file:///d:/claude/nomad/nomad/server.go#L1514-L1522)

```go
snapshots, err := raft.NewFileSnapshotStore(path, snapshotsRetained, s.config.LogOutput)
```

| 参数 | 值 | 说明 |
|------|----|------|
| `path` | `<DataDir>/server/raft/` | 快照存储目录 |
| `snapshotsRetained` | 3 | 保留的快照数量 |
| `LogOutput` | 配置的日志输出 | 快照操作日志 |

**快照文件命名规则**：`<lastIndex>-<timestamp>.snap`，存储在 `raft/` 目录下。

---

## 6. FSM 有限状态机

### 6.1 nomadFSM 结构

**位置**：[nomad/fsm.go#L130-L155](file:///d:/claude/nomad/nomad/fsm.go#L130-L155)

```go
type nomadFSM struct {
    evalBroker         *EvalBroker          // 评估队列
    blockedEvals       *BlockedEvals        // 阻塞评估
    periodicDispatcher *PeriodicDispatch    // 周期任务派发
    encrypter          *Encrypter           // 加密器
    logger             hclog.Logger
    state              *state.StateStore    // 状态存储（memdb）
    config             *FSMConfig
    enterpriseAppliers  LogAppliers         // 企业版日志应用器
    enterpriseRestorers SnapshotRestorers   // 企业版快照恢复器
    stateLock          sync.RWMutex         // 保护 State() 调用
}
```

### 6.2 NewFSM 构造

**位置**：[nomad/fsm.go#L201-L235](file:///d:/claude/nomad/nomad/fsm.go#L201-L235)

```go
func NewFSM(config *FSMConfig) (*nomadFSM, error) {
    state, err := state.NewStateStore(sconfig)
    fsm := &nomadFSM{
        evalBroker:          config.EvalBroker,
        periodicDispatcher:  config.Periodic,
        blockedEvals:        config.Blocked,
        encrypter:           config.Encrypter,
        state:               state,
        // ...
    }
    fsm.registerLogAppliers()        // 注册所有日志应用器
    fsm.registerSnapshotRestorers()  // 注册所有快照恢复器
    return fsm, nil
}
```

### 6.3 Apply 方法（日志应用）

**位置**：[nomad/fsm.go#L250-L1546](file:///d:/claude/nomad/nomad/fsm.go#L250-L1546)

`Apply` 是 Raft 日志应用的核心入口。每条 Raft 日志的第一个字节是 `MessageType`，FSM 根据消息类型分发到不同的应用器。

**消息类型分发（部分）**：

| MessageType | 处理函数 | 说明 |
|-------------|----------|------|
| `NodeRegisterRequestType` | `applyUpsertNode` | 注册节点 |
| `NodeDeregisterRequestType` | `applyDeregisterNode` | 注销节点 |
| `NodeUpdateStatusRequestType` | `applyStatusUpdate` | 节点状态更新 |
| `NodeUpdateDrainRequestType` | `applyDrainUpdate` | 节点 drain 更新 |
| `NodePoolUpsertRequestType` | `applyNodePoolUpsert` | 节点池创建/更新 |
| `NodePoolDeleteRequestType` | `applyNodePoolDelete` | 节点池删除 |
| `JobRegisterRequestType` | `applyUpsertJob` | 作业注册 |
| `JobDeregisterRequestType` | `applyDeregisterJob` | 作业注销 |
| `EvalUpdateRequestType` | `applyUpdateEval` | 评估更新 |
| `EvalDeleteRequestType` | `applyDeleteEval` | 评估删除 |
| `AllocUpdateRequestType` | `applyAllocUpdate` | 分配更新 |
| `AllocClientUpdateRequestType` | `applyAllocClientUpdate` | 客户端分配更新 |
| `ApplyPlanResultsRequestType` | `applyPlanResults` | 调度计划应用 |
| `DeploymentStatusUpdateRequestType` | `applyDeploymentStatusUpdate` | 部署状态更新 |
| `ACLPolicyUpsertRequestType` | `applyACLPolicyUpsert` | ACL 策略创建/更新 |
| `ACLTokenUpsertRequestType` | `applyACLTokenUpsert` | ACL 令牌创建/更新 |
| `CSIVolumeRegisterRequestType` | `applyCSIVolumeRegister` | CSI 卷注册 |
| `AutopilotRequestType` | `applyAutopilotUpdate` | Autopilot 配置更新 |
| `ClusterMetadataRequestType` | `applyClusterMetadata` | 集群元数据更新 |
| `SchedulerConfigRequestType` | `applySchedulerConfigUpdate` | 调度器配置更新 |

**IgnoreUnknownTypeFlag 机制**：[fsm.go#L254-L261](file:///d:/claude/nomad/nomad/fsm.go#L254-L261)

```go
ignoreUnknown := false
if msgType&structs.IgnoreUnknownTypeFlag == structs.IgnoreUnknownTypeFlag {
    msgType &= ^structs.IgnoreUnknownTypeFlag
    ignoreUnknown = true
}
```

新命令可标记为"旧版本可安全忽略"，避免旧版本收到新命令时崩溃。

### 6.4 Snapshot 方法

**位置**：[nomad/fsm.go#L1548-L1559](file:///d:/claude/nomad/nomad/fsm.go#L1548-L1559)

```go
func (n *nomadFSM) Snapshot() (raft.FSMSnapshot, error) {
    snap, err := n.state.Snapshot()
    ns := &nomadSnapshot{snap: snap}
    return ns, nil
}
```

返回 `nomadSnapshot`，它包装 `state.StateSnapshot`，允许并发修改。

### 6.5 Restore / restoreImpl 方法

**位置**：[nomad/fsm.go#L1561-L1598](file:///d:/claude/nomad/nomad/fsm.go#L1561-L1598)

```go
func (n *nomadFSM) Restore(old io.ReadCloser) error {
    return n.restoreImpl(old, nil)
}

func (n *nomadFSM) restoreImpl(old io.ReadCloser, filter *FSMFilter) error {
    defer old.Close()
    // 创建全新的 StateStore（丢弃旧状态）
    newState, err := state.NewStateStore(config)
    restore, err := newState.Restore()
    defer restore.Abort()
    dec := codec.NewDecoder(old, structs.MsgpackHandle)
    // 逐条解码并恢复...
}
```

恢复过程：
1. 创建全新的 StateStore
2. 通过 msgpack 解码快照流
3. 根据 SnapshotType 调用对应的 restorer
4. 完成后用新 StateStore 替换旧的（通过 stateLock 保护）

### 6.6 Persist 方法（快照写入）

**位置**：[nomad/fsm.go#L2515-L3350](file:///d:/claude/nomad/nomad/fsm.go#L2515-L3350)

`Persist` 按顺序写入所有快照类型：

```go
func (s *nomadSnapshot) Persist(sink raft.SnapshotSink) error {
    encoder := codec.NewEncoder(sink, structs.MsgpackHandle)
    header := SnapshotHeader{}
    encoder.Encode(&header)
    s.persistIndexes(sink, encoder)
    s.persistNodes(sink, encoder)
    s.persistNodePools(sink, encoder)
    s.persistJobs(sink, encoder)
    s.persistEvals(sink, encoder)
    s.persistAllocs(sink, encoder)
    s.persistPeriodicLaunches(sink, encoder)
    s.persistJobSummaries(sink, encoder)
    s.persistJobVersions(sink, encoder)
    s.persistDeployments(sink, encoder)
    s.persistScalingPolicies(sink, encoder)
    s.persistScalingEvents(sink, encoder)
    s.persistCSIPlugins(sink, encoder)
    s.persistCSIVolumes(sink, encoder)
    s.persistACLPolicies(sink, encoder)
    s.persistACLTokens(sink, encoder)
    // ... 更多类型
}
```

### 6.7 SnapshotType 常量

**位置**：[nomad/fsm.go#L32-L78](file:///d:/claude/nomad/nomad/fsm.go#L32-L78)

| 常量 | 值 | 说明 |
|------|----|------|
| `NodeSnapshot` | 0 | 节点快照 |
| `JobSnapshot` | 1 | 作业快照 |
| `IndexSnapshot` | 2 | 索引快照 |
| `EvalSnapshot` | 3 | 评估快照 |
| `AllocSnapshot` | 4 | 分配快照 |
| `PeriodicLaunchSnapshot` | 6 | 周期任务启动记录 |
| `JobSummarySnapshot` | 7 | 作业摘要 |
| `DeploymentSnapshot` | 10 | 部署 |
| `ACLPolicySnapshot` | 11 | ACL 策略 |
| `ACLTokenSnapshot` | 12 | ACL 令牌 |
| `SchedulerConfigSnapshot` | 13 | 调度器配置 |
| `ClusterMetadataSnapshot` | 14 | 集群元数据 |
| `ScalingPolicySnapshot` | 16 | 弹性伸缩策略 |
| `CSIPluginSnapshot` | 17 | CSI 插件 |
| `CSIVolumeSnapshot` | 18 | CSI 卷 |
| `VariablesSnapshot` | 22 | 变量存储 |
| `RootKeyMetaSnapshot` | 24 | 根密钥元数据 |
| `RootKeySnapshot` | 30 | 包装的根密钥 |
| `NamespaceSnapshot` | 64 | 命名空间（企业版起始） |
| `TimeTableSnapshot` | 5 | 已弃用（1.9.2+） |
| `VaultAccessorSnapshot` | 8 | 已弃用（1.10.0+） |
| `EventSinkSnapshot` | 20 | 已弃用（1.0+） |

---

## 7. RaftLayer 自定义网络传输层

**位置**：[nomad/raft_rpc.go](file:///d:/claude/nomad/nomad/raft_rpc.go)

### 7.1 设计目标

RaftLayer 实现 `raft.StreamLayer` 接口，**复用 Nomad RPC 连接**传输 Raft 流量，避免为 Raft 单独开端口。

### 7.2 RaftLayer 结构

**位置**：[raft_rpc.go#L20-L35](file:///d:/claude/nomad/nomad/raft_rpc.go#L20-L35)

```go
type RaftLayer struct {
    addr       net.Addr          // 监听地址
    connCh     chan net.Conn     // 接收连接的通道
    tlsWrap    tlsutil.Wrapper   // TLS 包装器
    tlsWrapLock sync.RWMutex
    closed     bool
    closeCh    chan struct{}
    closeLock  sync.Mutex
}
```

### 7.3 关键方法

| 方法 | 位置 | 职责 |
|------|------|------|
| `NewRaftLayer` | [L40-L48](file:///d:/claude/nomad/nomad/raft_rpc.go#L40-L48) | 创建 RaftLayer |
| `Handoff` | [L52-L61](file:///d:/claude/nomad/nomad/raft_rpc.go#L52-L61) | 将 RPC 连接移交给 Raft 层 |
| `Accept` | [L65-L72](file:///d:/claude/nomad/nomad/raft_rpc.go#L65-L72) | 等待并返回新连接 |
| `Close` | [L75-L84](file:///d:/claude/nomad/nomad/raft_rpc.go#L75-L84) | 关闭 Raft 层 |
| `ReloadTLS` | [L95-L99](file:///d:/claude/nomad/nomad/raft_rpc.go#L95-L99) | 热更新 TLS 配置 |
| `Dial` | [L107-L137](file:///d:/claude/nomad/nomad/raft_rpc.go#L107-L137) | 拨号到远端 Raft 节点 |

### 7.4 Dial 方法详解

**位置**：[raft_rpc.go#L107-L137](file:///d:/claude/nomad/nomad/raft_rpc.go#L107-L137)

```go
func (l *RaftLayer) Dial(address raft.ServerAddress, timeout time.Duration) (net.Conn, error) {
    conn, err := net.DialTimeout("tcp", string(address), timeout)
    // 如果配置了 TLS：
    //   1. 写入 RpcTLS 字节，通知对端切换到 TLS
    //   2. 用 tlsWrapper 包装连接
    // 写入 RpcRaft 字节，标识这是 Raft 流量
    _, err = conn.Write([]byte{byte(pool.RpcRaft)})
    return conn, err
}
```

**连接复用机制**：
1. Nomad RPC 服务器在主端口（默认 4647）接收所有连接
2. 读取第一个字节判断连接类型（RPC、Raft、TLS 等）
3. 若是 Raft 连接，调用 `RaftLayer.Handoff()` 移交给 Raft 层
4. Raft 层通过 `connCh` 传递给 `Accept()`，由 hashicorp/raft 处理

---

## 8. 集群引导（Bootstrap）

Nomad 支持两种引导方式：**单节点引导**和**多节点引导**。

### 8.1 单节点引导

**位置**：[server.go#L1572-L1593](file:///d:/claude/nomad/nomad/server.go#L1572-L1593)

```go
if s.isSingleServerCluster() {
    hasState, err := raft.HasExistingState(log, stable, snap)
    if !hasState {
        configuration := raft.Configuration{
            Servers: []raft.Server{
                {
                    ID:      s.config.RaftConfig.LocalID,
                    Address: trans.LocalAddr(),
                },
            },
        }
        raft.BootstrapCluster(s.config.RaftConfig,
            log, stable, snap, trans, configuration)
    }
}
```

`isSingleServerCluster` 判定：[server.go#L2314-L2316](file:///d:/claude/nomad/nomad/server.go#L2314-L2316)

```go
func (s *Server) isSingleServerCluster() bool {
    return s.config.BootstrapExpect == 1
}
```

### 8.2 多节点引导（maybeBootstrap）

**位置**：[nomad/serf.go#L87-L229](file:///d:/claude/nomad/nomad/serf.go#L87-L229)

多节点引导通过 Serf gossip 协议发现成员后触发：

```
maybeBootstrap()
    │
    ├─[1] 检查 BootstrapExpect > 0 且未引导过
    │
    ├─[2] 检查 raftStore.LastIndex() == 0（无提交日志）
    │
    ├─[3] 扫描 Serf 成员，收集同 Region 的有效 server
    │      └─ 检查 Expect 值一致性、无 bootstrap 模式冲突
    │
    ├─[4] 检查 voters >= BootstrapExpect
    │
    ├─[5] RPC 查询每个 server 的 Status.Peers
    │      └─ 任一 server 报告有 peers，则放弃引导
    │
    └─[6] 调用 raft.BootstrapCluster(configuration)
```

**关键代码**：[serf.go#L192-L225](file:///d:/claude/nomad/nomad/serf.go#L192-L225)

```go
for _, server := range servers {
    addr := server.Addr.String()
    var id raft.ServerID
    if minRaftVersion >= 3 {
        id = raft.ServerID(server.ID)
    } else {
        id = raft.ServerID(addr)
    }
    suffrage := raft.Voter
    if server.NonVoter {
        suffrage = raft.Nonvoter
    }
    peer := raft.Server{
        ID:       id,
        Address:  raft.ServerAddress(addr),
        Suffrage: suffrage,
    }
    configuration.Servers = append(configuration.Servers, peer)
}
future := s.raft.BootstrapCluster(configuration)
```

---

## 9. 领导权选举与 leaderLoop

### 9.1 monitorLeadership

**位置**：[nomad/leader.go#L111-L176](file:///d:/claude/nomad/nomad/leader.go#L111-L176)

监听 `raft.LeaderCh()` 的状态变化，触发 `leaderStep`：

```go
leaderCh := s.raft.LeaderCh()
for {
    select {
    case isLeader := <-leaderCh:
        if wasLeader != isLeader {
            leaderStep(isLeader)  // 启动或停止 leaderLoop
        } else if wasLeader && isLeader {
            // 瞬时丢失又获得领导权，重启 leaderLoop
            leaderStep(false)
            leaderStep(true)
        }
    case <-s.shutdownCh:
        return
    }
}
```

### 9.2 leaderLoop

**位置**：[nomad/leader.go#L248-L370](file:///d:/claude/nomad/nomad/leader.go#L248-L370)

```
leaderLoop(stopCh)
    │
    ├─ RECONCILE 标签：
    │   ├─ 设置 reconcile 定时器
    │   ├─ 调用 raft.Barrier() 等待 FSM 追上 Raft 日志
    │   ├─ 首次成为 leader：调用 establishLeadership()
    │   │   └─ 失败则 revokeLeadership + leadershipTransfer
    │   ├─ 调用 reconcile() 修复缺失数据
    │   └─ 进入 WAIT 循环
    │
    └─ WAIT 循环：
        ├─ <-stopCh: 失去领导权，返回
        ├─ <-s.shutdownCh: 服务器关闭，返回
        ├─ <-interval: 周期性回到 RECONCILE
        ├─ <-reconcileCh: Serf 成员变更，reconcileMember
        └─ <-s.reassertLeaderCh: 重新建立领导权
```

**Barrier 调用**：[leader.go#L259-L263](file:///d:/claude/nomad/nomad/leader.go#L259-L263)

```go
barrier := s.raft.Barrier(barrierWriteTimeout)
if err := barrier.Error(); err != nil {
    s.logger.Error("failed to wait for barrier", "error", err)
    goto WAIT
}
```

`Barrier` 确保所有已提交的 Raft 日志都应用到 FSM 后才继续，保证状态一致。

### 9.3 establishLeadership

**位置**：[nomad/leader.go#L378-L470+](file:///d:/claude/nomad/nomad/leader.go#L378-L470)

新 leader 上任时执行的初始化工作：

| 步骤 | 调用 | 说明 |
|------|------|------|
| 1 | `s.setLeaderAcl(uuid.Generate())` | 生成 leader ACL 令牌 |
| 2 | `s.handlePausableWorkers(true)` | 暂停 worker，让出 CPU 给调度 |
| 3 | `s.getOrCreateAutopilotConfig()` | 初始化 Autopilot 配置 |
| 4 | `s.autopilot.Start(s.shutdownCtx)` | 启动 Autopilot 例程 |
| 5 | `s.getOrCreateSchedulerConfig()` | 初始化调度器配置 |
| 6 | `s.ClusterMetadata()` | 初始化集群元数据 |
| 7 | `s.planQueue.SetEnabled(true)` | 启用 plan 队列 |
| 8 | `go s.planApply()` | 启动 plan 调度器 |
| 9 | `s.handleEvalBrokerStateChange()` | 处理 eval broker 状态 |
| 10 | `s.deploymentWatcher.SetEnabled(true, ...)` | 启用部署监控 |
| 11 | `s.nodeDrainer.SetEnabled(true, ...)` | 启用节点 drain |
| 12 | `s.volumeWatcher.SetEnabled(true, ...)` | 启用卷监控 |
| 13 | `s.restoreEvals()` | 恢复评估队列 |
| 14 | `s.periodicDispatcher.SetEnabled(true)` | 启用周期任务派发 |
| 15 | `s.setConsistentReadReady()` | 标记一致读就绪 |
| 16 | `go s.initializeKeyring(stopCh)` | 初始化根密钥环 |
| 17 | `s.restorePeriodicDispatcher()` | 恢复周期任务状态 |
| 18 | `go s.schedulePeriodic(stopCh)` | 调度周期任务 |
| 19 | `go s.reapFailedEvaluations(stopCh)` | 清理失败评估 |
| 20 | `go s.reapDupBlockedEvaluations(stopCh)` | 清理重复阻塞评估 |
| 21 | `go s.reapCancelableEvaluations(stopCh)` | 清理可取消评估 |
| 22 | `go s.periodicUnblockFailedEvals(stopCh)` | 周期解阻失败评估 |
| 23 | `go s.publishJobSummaryMetrics(stopCh)` | 发布作业摘要指标 |
| 24 | `go s.publishJobStatusMetrics(stopCh)` | 发布作业状态指标 |
| 25 | `s.restoreLockTTLTimers()` | 恢复变量锁 TTL 计时器 |

### 9.4 leadershipTransferToServer

**位置**：[nomad/leader.go#L178-L219](file:///d:/claude/nomad/nomad/leader.go#L178-L219)

支持手动转移领导权（用于优雅降级）：

```go
func (s *Server) leadershipTransferToServer(to structs.RaftIDAddress) error {
    for i := 0; i < retryCount; i++ {
        err := s.raft.LeadershipTransferToServer(to.ID, to.Address).Error()
        if err == nil {
            return nil
        }
        // 特殊错误不重试：
        // - "cannot transfer leadership to itself"
        // - raft.ErrRaftShutdown
        // - raft.ErrUnsupportedProtocol (Raft < 3)
    }
}
```

---

## 10. Autopilot 自动集群管理

**位置**：[nomad/autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go)

### 10.1 AutopilotDelegate

**位置**：[autopilot.go#L32-L34](file:///d:/claude/nomad/nomad/autopilot.go#L32-L34)

`AutopilotDelegate` 实现 `autopilot.ApplicationIntegration` 接口，作为 Nomad 与 hashicorp/autopilot 库的桥梁。

### 10.2 核心方法

| 方法 | 位置 | 职责 |
|------|------|------|
| `AutopilotConfig` | [L39-L54](file:///d:/claude/nomad/nomad/autopilot.go#L39-L54) | 返回当前 Autopilot 配置 |
| `FetchServerStats` | [L59-L61](file:///d:/claude/nomad/nomad/autopilot.go#L59-L61) | 获取服务器统计（带外） |
| `KnownServers` | [L66-L68](file:///d:/claude/nomad/nomad/autopilot.go#L66-L68) | 返回已知服务器列表 |
| `NotifyState` | [L73-L82](file:///d:/claude/nomad/nomad/autopilot.go#L73-L82) | 接收 Autopilot 状态通知 |
| `RemoveFailedServer` | [L88-L98](file:///d:/claude/nomad/nomad/autopilot.go#L88-L98) | 移除故障服务器 |

### 10.3 NotifyState 实现

**位置**：[autopilot.go#L73-L82](file:///d:/claude/nomad/nomad/autopilot.go#L73-L82)

```go
func (d *AutopilotDelegate) NotifyState(state *autopilot.State) {
    if d.server.raft.State() == raft.Leader {
        metrics.SetGauge([]string{"nomad", "autopilot", "failure_tolerance"},
            float32(state.FailureTolerance))
        if state.Healthy {
            metrics.SetGauge([]string{"nomad", "autopilot", "healthy"}, 1)
        } else {
            metrics.SetGauge([]string{"nomad", "autopilot", "healthy"}, 0)
        }
    }
}
```

### 10.4 AutopilotConfig 字段

| 字段 | 说明 |
|------|------|
| `CleanupDeadServers` | 自动清理故障服务器 |
| `LastContactThreshold` | 最后联系阈值 |
| `MaxTrailingLogs` | 最大滞后日志数 |
| `MinQuorum` | 最小法定人数 |
| `ServerStabilizationTime` | 服务器稳定时间 |

---

## 11. peers.json 灾难恢复机制

**位置**：[server.go#L1524-L1569](file:///d:/claude/nomad/nomad/server.go#L1524-L1569)

### 11.1 peers.info 哨兵机制

为了避免在新版本中误用旧的 `peers.json`，Nomad 使用 `peers.info` 文件作为哨兵：

```go
peersFile := filepath.Join(path, "peers.json")
peersInfoFile := filepath.Join(path, "peers.info")
if _, err := os.Stat(peersInfoFile); os.IsNotExist(err) {
    // 首次启动：创建 peers.info，并删除遗留的 peers.json
    os.WriteFile(peersInfoFile, []byte(peersInfoContent), 0644)
    if _, err := os.Stat(peersFile); err == nil {
        os.Remove(peersFile)
    }
}
```

### 11.2 peers.json 恢复流程

当操作员手动放置 `peers.json` 进行灾难恢复时：

```go
} else if _, err := os.Stat(peersFile); err == nil {
    s.logger.Info("found peers.json file, recovering Raft configuration...")
    var configuration raft.Configuration
    if s.config.RaftConfig.ProtocolVersion < 3 {
        configuration, err = raft.ReadPeersJSON(peersFile)
    } else {
        configuration, err = raft.ReadConfigJSON(peersFile)
    }
    // 创建临时 FSM 进行恢复
    tmpFsm, err := NewFSM(fsmConfig)
    raft.RecoverCluster(s.config.RaftConfig, tmpFsm,
        log, stable, snap, trans, configuration)
    // 恢复成功后删除 peers.json
    os.Remove(peersFile)
}
```

**恢复流程**：
1. 检测 `peers.json` 是否存在
2. 根据 Raft 协议版本选择解析方式（JSON vs 旧格式）
3. 创建临时 FSM
4. 调用 `raft.RecoverCluster()` 重写 Raft 配置
5. 删除 `peers.json`

---

## 12. Raft 统计指标输出

**位置**：[server.go#L2201-L2225](file:///d:/claude/nomad/nomad/server.go#L2201-L2225)

```go
func (s *Server) EmitRaftStats(period time.Duration, stopCh <-chan struct{}) {
    timer, stop := helper.NewSafeTimer(period)
    defer stop()
    for {
        timer.Reset(period)
        select {
        case <-timer.C:
            lastIndex := s.raft.LastIndex()
            metrics.SetGauge([]string{"raft", "lastIndex"}, float32(lastIndex))
            appliedIndex := s.raft.AppliedIndex()
            metrics.SetGauge([]string{"raft", "appliedIndex"}, float32(appliedIndex))
            stateStoreSnapshotIndex, err := s.State().LatestIndex()
            metrics.SetGauge([]string{"state", "snapshotIndex"}, float32(stateStoreSnapshotIndex))
        case <-stopCh:
            return
        }
    }
}
```

**输出指标**：

| 指标名 | 类型 | 说明 |
|--------|------|------|
| `raft.lastIndex` | Gauge | Raft 最后日志索引 |
| `raft.appliedIndex` | Gauge | 已应用到 FSM 的索引 |
| `state.snapshotIndex` | Gauge | 状态存储最新快照索引 |

通过对比 `lastIndex` 和 `appliedIndex` 可以判断 FSM 是否滞后于 Raft 日志。

---

## 13. helper/raftutil 辅助包

**位置**：[helper/raftutil/](file:///d:/claude/nomad/helper/raftutil)

### 13.1 RaftStore 接口

**位置**：[helper/raftutil/state.go#L27-L33](file:///d:/claude/nomad/helper/raftutil/state.go#L27-L33)

抽象 Raft 存储接口，用于查询状态。

### 13.2 RaftStateInfo

**位置**：[helper/raftutil/state.go#L38-L48](file:///d:/claude/nomad/helper/raftutil/state.go#L38-L48)

包含 Raft 状态信息（当前 leader、term、commit index 等）。

### 13.3 LogEntries 解码

**位置**：[helper/raftutil/state.go#L105-L202](file:///d:/claude/nomad/helper/raftutil/state.go#L105-L202)

提供从 Raft 日志存储中读取并解码日志条目的工具函数，用于调试和迁移。

### 13.4 FSMHelper

**位置**：[helper/raftutil/fsm.go#L29-L82](file:///d:/claude/nomad/helper/raftutil/fsm.go#L29-L82)

FSM 辅助类，用于在停机状态下重放日志或检查状态。

### 13.5 MigrateToWAL

**位置**：[helper/raftutil/migrate.go#L48-L154](file:///d:/claude/nomad/helper/raftutil/migrate.go#L48-L154)

实现从 BoltDB 后端到 WAL 后端的迁移逻辑，对应 CLI 命令 `nomad operator raft migrate-backend`。

---

## 14. 关键调用链汇总

### 14.1 Raft 初始化调用链

```
Server.NewServer()
    └─ setupRaft()                                    [server.go#L1344]
        ├─ NewFSM()                                   [fsm.go#L202]
        │   └─ state.NewStateStore()
        │   └─ registerLogAppliers()
        │   └─ registerSnapshotRestorers()
        ├─ raft.NewNetworkTransportWithConfig()       [server.go#L1388]
        ├─ raftboltdb.New() / openRaftWAL()           [server.go#L1468/L1455]
        ├─ raft.NewLogCache()                         [server.go#L1506]
        ├─ raft.NewFileSnapshotStore()                [server.go#L1515]
        ├─ raft.HasExistingState()                    [server.go#L1575]
        ├─ raft.BootstrapCluster()                    [server.go#L1588]
        └─ raft.NewRaft()                             [server.go#L1596]
```

### 14.2 写请求调用链

```
Client RPC
    └─ Server.{Endpoint}.Apply()
        └─ s.raft.Apply(req)
            └─ hashicorp/raft 复制到多数派
                └─ FSM.Apply(log)                     [fsm.go#L250]
                    └─ switch msgType
                        ├─ applyUpsertNode()
                        ├─ applyUpsertJob()
                        ├─ applyUpdateEval()
                        ├─ applyAllocUpdate()
                        ├─ applyACLPolicyUpsert()
                        └─ ... (50+ 应用器)
```

### 14.3 领导权变更调用链

```
raft.LeaderCh() 触发
    └─ monitorLeadership()                            [leader.go#L111]
        └─ leaderStep(true)
            └─ leaderLoop(stopCh)                     [leader.go#L248]
                ├─ raft.Barrier()                     [leader.go#L259]
                ├─ establishLeadership(stopCh)        [leader.go#L378]
                │   ├─ setLeaderAcl()
                │   ├─ autopilot.Start()
                │   ├─ planQueue.SetEnabled(true)
                │   ├─ deploymentWatcher.SetEnabled(true)
                │   ├─ nodeDrainer.SetEnabled(true)
                │   ├─ volumeWatcher.SetEnabled(true)
                │   ├─ restoreEvals()
                │   ├─ periodicDispatcher.SetEnabled(true)
                │   ├─ setConsistentReadReady()
                │   └─ 启动多个后台 goroutine
                ├─ reconcile()
                └─ 进入 WAIT 循环
```

### 14.4 快照调用链

```
raft 触发快照（SnapshotThreshold 或周期）
    └─ FSM.Snapshot()                                 [fsm.go#L1548]
        └─ state.StateStore.Snapshot()
            └─ 返回 nomadSnapshot
                └─ Persist(sink)                      [fsm.go#L2515]
                    ├─ persistIndexes()
                    ├─ persistNodes()
                    ├─ persistJobs()
                    ├─ persistEvals()
                    ├─ persistAllocs()
                    └─ ... (20+ persist 方法)

恢复时：
    └─ FSM.Restore(old)                               [fsm.go#L1563]
        └─ restoreImpl(old, nil)                      [fsm.go#L1574]
            ├─ state.NewStateStore()  (全新)
            ├─ codec.NewDecoder(old)
            └─ 循环调用 restorer 恢复每种类型
```

### 14.5 集群引导调用链

```
单节点：
    setupRaft()
        └─ isSingleServerCluster() == true            [server.go#L2314]
            └─ raft.BootstrapCluster({单节点配置})

多节点：
    Serf 成员变更事件
        └─ maybeBootstrap()                           [serf.go#L87]
            ├─ 收集 Serf 成员
            ├─ RPC 查询每个 server 的 peers
            └─ raft.BootstrapCluster({多节点配置})
```

---

## 15. 源码索引

### 15.1 核心源文件

| 文件 | 行数 | 说明 |
|------|------|------|
| [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | 2300+ | setupRaft、EmitRaftStats、isSingleServerCluster |
| [nomad/fsm.go](file:///d:/claude/nomad/nomad/fsm.go) | 3355+ | FSM 实现：Apply、Snapshot、Restore、Persist |
| [nomad/raft_rpc.go](file:///d:/claude/nomad/nomad/raft_rpc.go) | 137 | RaftLayer 实现 |
| [nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go) | 470+ | monitorLeadership、leaderLoop、establishLeadership |
| [nomad/serf.go](file:///d:/claude/nomad/nomad/serf.go) | 229+ | maybeBootstrap 多节点引导 |
| [nomad/autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | 100+ | AutopilotDelegate |
| [nomad/config.go](file:///d:/claude/nomad/nomad/config.go) | 500+ | RaftConfig、RaftLogStoreConfig |
| [helper/raftutil/state.go](file:///d:/claude/nomad/helper/raftutil/state.go) | 202 | RaftStore 接口、日志解码 |
| [helper/raftutil/fsm.go](file:///d:/claude/nomad/helper/raftutil/fsm.go) | 82 | FSMHelper |
| [helper/raftutil/migrate.go](file:///d:/claude/nomad/helper/raftutil/migrate.go) | 154 | MigrateToWAL 迁移工具 |

### 15.2 关键代码位置索引

#### server.go

| 功能 | 行号 |
|------|------|
| setupRaft 函数 | [L1344-L1601](file:///d:/claude/nomad/nomad/server.go#L1344-L1601) |
| FSM 创建 | [L1356-L1373](file:///d:/claude/nomad/nomad/server.go#L1356-L1373) |
| NetworkTransport 创建 | [L1375-L1389](file:///d:/claude/nomad/nomad/server.go#L1375-L1389) |
| LocalID 设置 | [L1395-L1400](file:///d:/claude/nomad/nomad/server.go#L1395-L1400) |
| DevMode 存储 | [L1407-L1412](file:///d:/claude/nomad/nomad/server.go#L1407-L1412) |
| BoltDB 后端 | [L1461-L1484](file:///d:/claude/nomad/nomad/server.go#L1461-L1484) |
| WAL 后端 | [L1439-L1459](file:///d:/claude/nomad/nomad/server.go#L1439-L1459) |
| LogCache 包装 | [L1501-L1512](file:///d:/claude/nomad/nomad/server.go#L1501-L1512) |
| FileSnapshotStore | [L1514-L1522](file:///d:/claude/nomad/nomad/server.go#L1514-L1522) |
| peers.json 处理 | [L1524-L1569](file:///d:/claude/nomad/nomad/server.go#L1524-L1569) |
| 单节点 Bootstrap | [L1572-L1593](file:///d:/claude/nomad/nomad/server.go#L1572-L1593) |
| raft.NewRaft | [L1596-L1599](file:///d:/claude/nomad/nomad/server.go#L1596-L1599) |
| openRaftWAL | [L1603-L1622](file:///d:/claude/nomad/nomad/server.go#L1603-L1622) |
| EmitRaftStats | [L2201-L2225](file:///d:/claude/nomad/nomad/server.go#L2201-L2225) |
| isSingleServerCluster | [L2314-L2316](file:///d:/claude/nomad/nomad/server.go#L2314-L2316) |

#### fsm.go

| 功能 | 行号 |
|------|------|
| SnapshotType 常量 | [L32-L78](file:///d:/claude/nomad/nomad/fsm.go#L32-L78) |
| LogApplier 类型 | [L117](file:///d:/claude/nomad/nomad/fsm.go#L117) |
| nomadFSM 结构 | [L130-L155](file:///d:/claude/nomad/nomad/fsm.go#L130-L155) |
| FSMConfig | [L169-L199](file:///d:/claude/nomad/nomad/fsm.go#L169-L199) |
| NewFSM | [L201-L235](file:///d:/claude/nomad/nomad/fsm.go#L201-L235) |
| Apply 方法 | [L250-L1546](file:///d:/claude/nomad/nomad/fsm.go#L250-L1546) |
| Snapshot 方法 | [L1548-L1559](file:///d:/claude/nomad/nomad/fsm.go#L1548-L1559) |
| Restore 方法 | [L1561-L1565](file:///d:/claude/nomad/nomad/fsm.go#L1561-L1565) |
| restoreImpl 方法 | [L1574-L2350](file:///d:/claude/nomad/nomad/fsm.go#L1574-L2350) |
| Persist 方法 | [L2515-L3350](file:///d:/claude/nomad/nomad/fsm.go#L2515-L3350) |

#### raft_rpc.go

| 功能 | 行号 |
|------|------|
| RaftLayer 结构 | [L20-L35](file:///d:/claude/nomad/nomad/raft_rpc.go#L20-L35) |
| NewRaftLayer | [L40-L48](file:///d:/claude/nomad/nomad/raft_rpc.go#L40-L48) |
| Handoff | [L52-L61](file:///d:/claude/nomad/nomad/raft_rpc.go#L52-L61) |
| Accept | [L65-L72](file:///d:/claude/nomad/nomad/raft_rpc.go#L65-L72) |
| Close | [L75-L84](file:///d:/claude/nomad/nomad/raft_rpc.go#L75-L84) |
| ReloadTLS | [L95-L99](file:///d:/claude/nomad/nomad/raft_rpc.go#L95-L99) |
| Dial | [L107-L137](file:///d:/claude/nomad/nomad/raft_rpc.go#L107-L137) |

#### leader.go

| 功能 | 行号 |
|------|------|
| monitorLeadership | [L111-L176](file:///d:/claude/nomad/nomad/leader.go#L111-L176) |
| leadershipTransferToServer | [L178-L219](file:///d:/claude/nomad/nomad/leader.go#L178-L219) |
| leaderLoop | [L248-L370](file:///d:/claude/nomad/nomad/leader.go#L248-L370) |
| Barrier 调用 | [L259-L263](file:///d:/claude/nomad/nomad/leader.go#L259-L263) |
| establishLeadership | [L378-L470+](file:///d:/claude/nomad/nomad/leader.go#L378-L470) |

#### serf.go

| 功能 | 行号 |
|------|------|
| maybeBootstrap | [L87-L229](file:///d:/claude/nomad/nomad/serf.go#L87-L229) |
| LastIndex 检查 | [L99-L116](file:///d:/claude/nomad/nomad/serf.go#L99-L116) |
| Serf 成员扫描 | [L118-L148](file:///d:/claude/nomad/nomad/serf.go#L118-L148) |
| Peers 查询 | [L150-L188](file:///d:/claude/nomad/nomad/serf.go#L150-L188) |
| BootstrapCluster 调用 | [L192-L225](file:///d:/claude/nomad/nomad/serf.go#L192-L225) |

#### autopilot.go

| 功能 | 行号 |
|------|------|
| AutopilotDelegate 结构 | [L32-L34](file:///d:/claude/nomad/nomad/autopilot.go#L32-L34) |
| AutopilotConfig 方法 | [L39-L54](file:///d:/claude/nomad/nomad/autopilot.go#L39-L54) |
| FetchServerStats | [L59-L61](file:///d:/claude/nomad/nomad/autopilot.go#L59-L61) |
| KnownServers | [L66-L68](file:///d:/claude/nomad/nomad/autopilot.go#L66-L68) |
| NotifyState | [L73-L82](file:///d:/claude/nomad/nomad/autopilot.go#L73-L82) |
| RemoveFailedServer | [L88-L98](file:///d:/claude/nomad/nomad/autopilot.go#L88-L98) |
| MinRaftProtocol | [L102-L104](file:///d:/claude/nomad/nomad/autopilot.go#L102-L104) |

#### config.go

| 功能 | 行号 |
|------|------|
| RaftConfig 字段 | [L100-L101](file:///d:/claude/nomad/nomad/config.go#L100-L101) |
| RaftTimeout | [L103-L104](file:///d:/claude/nomad/nomad/config.go#L103-L104) |
| LogStoreBackend 常量 | [L473-L479](file:///d:/claude/nomad/nomad/config.go#L473-L479) |
| RaftLogStoreConfig 结构 | [L481-L501](file:///d:/claude/nomad/nomad/config.go#L481-L501) |

---

## 附录 A：Raft 协议版本说明

| 版本 | 关键特性 |
|------|----------|
| 1 | 初始版本（已不支持） |
| 2 | LocalID 必须等于网络地址 |
| 3 | 使用永久 ServerID，支持 LeadershipTransfer，当前 Nomad 默认版本 |

**版本判断逻辑**：[server.go#L1398-L1400](file:///d:/claude/nomad/nomad/server.go#L1398-L1400)

```go
if s.config.RaftConfig.ProtocolVersion >= 3 {
    s.config.RaftConfig.LocalID = raft.ServerID(s.config.NodeID)
}
```

## 附录 B：Raft 日志消息类型（部分）

定义在 [nomad/structs/structs.go](file:///d:/claude/nomad/nomad/structs/structs.go) 的 `MessageType` 常量：

| 消息类型 | 数值 | 说明 |
|----------|------|------|
| NodeRegisterRequestType | 0x00 | 节点注册 |
| NodeDeregisterRequestType | 0x01 | 节点注销 |
| JobRegisterRequestType | 0x02 | 作业注册 |
| JobDeregisterRequestType | 0x03 | 作业注销 |
| EvalUpdateRequestType | 0x04 | 评估更新 |
| EvalDeleteRequestType | 0x05 | 评估删除 |
| AllocUpdateRequestType | 0x06 | 分配更新 |
| AllocClientUpdateRequestType | 0x07 | 客户端分配更新 |

完整列表参见 `structs.MessageType` 定义及 `IgnoreUnknownTypeFlag` 标记机制（[fsm.go#L254-L261](file:///d:/claude/nomad/nomad/fsm.go#L254-L261)）。

## 附录 C：常用 Raft 操作 API

Server 对外暴露的 Raft 操作（在多个 RPC handler 中调用）：

| 操作 | 方法 | 说明 |
|------|------|------|
| `s.raft.Apply(log)` | 提交日志 | 阻塞等待日志提交 |
| `s.raft.Barrier(timeout)` | 屏障 | 等待所有已提交日志应用到 FSM |
| `s.raft.LeaderCh()` | 领导权通道 | 返回领导权变更通知通道 |
| `s.raft.State()` | 状态查询 | 返回 Leader/Follower/Candidate |
| `s.raft.LeaderWithID()` | Leader ID | 当前 leader 的 ServerID |
| `s.raft.LastIndex()` | 最后索引 | 最后一条日志索引 |
| `s.raft.AppliedIndex()` | 已应用索引 | 已应用到 FSM 的索引 |
| `s.raft.LeadershipTransferToServer(id, addr)` | 领导权转移 | 手动转移到指定 server |
| `s.raft.BootstrapCluster(config)` | 集群引导 | 初始化集群配置 |
| `s.raft.Snapshot()` | 触发快照 | 手动触发快照 |

---

> 本文档基于 Nomad 源码分析生成，覆盖 Raft 共识算法在 Nomad 中的完整实现细节，包括初始化、日志存储、FSM、领导选举、快照恢复、集群引导等核心机制。
