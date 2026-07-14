# Nomad Gossip 协议机制与代码实现分析

## 概述

Nomad 使用 **Gossip 协议**（基于 HashiCorp 的 [Serf](https://github.com/hashicorp/serf) 和 [memberlist](https://github.com/hashicorp/memberlist) 库）实现 **Server 节点间的成员发现、故障检测和元数据传播**。Gossip 协议是 Nomad 多区域联邦（Multi-Region Federation）和 Server 集群自管理的基石。

### 核心作用
1. **成员发现（Membership）**：Server 启动后通过 Gossip 发现其他 Server，自动加入集群。
2. **故障检测（Failure Detection）**：使用 SWIM 风格的 gossip 协议检测节点故障，无需中心化心跳。
3. **元数据传播（Metadata Propagation）**：传播 Server 的 region、datacenter、RPC 地址、版本等信息。
4. **Raft 集群引导（Raft Bootstrap）**：基于 Gossip 发现的成员自动引导 Raft 集群。
5. **跨区域路由（Cross-Region Routing）**：通过 WAN gossip 池实现跨区域的 Server 发现和 RPC 转发。
6. **加密通信（Encryption）**：可选的 AES 加密保护 gossip 流量。

### 与 Raft 的关系
- **Gossip**：最终一致性的成员管理，用于发现"有哪些 Server"。
- **Raft**：强一致性的共识协议，用于日志复制和领导者选举。
- Gossip 发现的成员变化会触发 Leader 将其同步到 Raft 配置中（`reconcile`）。

---

## 1. 技术栈与依赖

| 组件 | 库 | 用途 |
|------|-----|------|
| Serf | `github.com/hashicorp/serf/serf` | Gossip 协议封装，提供事件通知、成员管理 |
| memberlist | `github.com/hashicorp/memberlist` | 底层 gossip 实现（SWIM 协议） |
| go-discover | `github.com/hashicorp/go-discover` | 云环境自动发现节点地址 |
| go-netaddrs | `github.com/hashicorp/go-netaddrs` | 通过命令或 DNS 解析地址 |

### 关键配置选择
- **WAN Timing**：Nomad 使用 `memberlist.DefaultWANConfig()` 而非 LAN 配置，因为 gossip 用于跨区域通信，需要更宽松的超时和更长的探测间隔。
- **文件位置**：[nomad/config.go:734-740](file:///d:/claude/nomad/nomad/config.go#L734-L740)

```go
// Serf should use the WAN timing, since we are using it
// to communicate between DC's
c.SerfConfig.MemberlistConfig = memberlist.DefaultWANConfig()
c.SerfConfig.MemberlistConfig.BindPort = DefaultSerfPort

c.SerfConfig.MsgpackUseNewTimeFormat = true
c.SerfConfig.MemberlistConfig.MsgpackUseNewTimeFormat = true
```

- **ReconnectTimeout**：默认延长至 3 天（而非 Serf 默认 24 小时），避免短暂故障后节点被过早移除。
  - 文件位置：[nomad/config.go:732](file:///d:/claude/nomad/nomad/config.go#L732)

```go
c.SerfConfig.ReconnectTimeout = 3 * 24 * time.Hour
```

---

## 2. 核心端口与网络

| 端口 | 协议 | 用途 |
|------|------|------|
| 4648 | TCP + UDP | Serf gossip 通信（成员发现、故障检测） |
| 4647 | TCP | Nomad RPC（Raft 复制、Server 间通信） |
| 4646 | TCP | HTTP API |

- **常量定义**：[nomad/config.go:32](file:///d:/claude/nomad/nomad/config.go#L32)
  ```go
  DefaultSerfPort = 4648
  ```

- **TCP + UDP 双协议**：memberlist 同时使用 TCP（传输完整状态）和 UDP（gossip 消息、probe）。
- **WAN 模式**：跨 DC 通信，长超时；LAN 模式：同 DC，短超时（Nomad 不使用 LAN 模式）。

---

## 3. Serf 初始化（setupSerf）

### 核心函数
- **文件**：[nomad/server.go:1737-1806](file:///d:/claude/nomad/nomad/server.go#L1737-L1806)
- **函数签名**：
  ```go
  func (s *Server) setupSerf(conf *serf.Config, ch chan serf.Event, path string) (*serf.Serf, error)
  ```

### 关键配置项

#### 3.1 节点名
```go
conf.NodeName = fmt.Sprintf("%s.%s", s.config.NodeName, s.config.Region)
```
- 格式：`<NodeName>.<Region>`，确保跨区域唯一性。

#### 3.2 Tags（元数据）
Serf 通过 Tags 携带 Server 元信息，被其他节点解析：

| Tag | 含义 | 示例 |
|-----|------|------|
| `role` | 节点角色（固定为 `nomad`） | `nomad` |
| `region` | 所在区域 | `global` |
| `dc` | 数据中心 | `dc1` |
| `build` | Nomad 版本 | `1.8.0` |
| `revision` | Git commit | `abc123` |
| `vsn` | 旧版 API 主版本（兼容 v1.2） | `1` |
| `raft_vsn` | Raft 协议版本 | `3` |
| `id` | Server 唯一 ID | `server-uuid` |
| `rpc_addr` | Client 用的 RPC IP | `10.0.0.1` |
| `port` | Server 间 RPC 端口 | `4647` |
| `bootstrap` | 是否单节点集群 | `1` |
| `expect` | 预期引导节点数 | `3` |
| `nonvoter` | 非投票节点 | `1` |
| `AutopilotRZTag` | 冗余区 | `zone-a` |
| `AutopilotVersionTag` | 升级版本 | `1.8` |

代码位置：[nomad/server.go:1740-1767](file:///d:/claude/nomad/nomad/server.go#L1740-L1767)

#### 3.3 事件通道
```go
conf.EventCh = ch  // s.eventCh，由 serfEventHandler 消费
```

#### 3.4 快照路径
```go
if !s.config.DevMode {
    conf.SnapshotPath = filepath.Join(s.config.DataDir, path)
    // path = "serf/" 本地区域或 "serf_wan/" WAN 区域
}
```
- Serf 定期将成员状态快照到磁盘，重启后可快速恢复。

#### 3.5 关键参数
```go
// LeavePropagateDelay: 离开意图广播延迟，确保 99.9% 节点收到
conf.LeavePropagateDelay = 1 * time.Second

// 禁用自动名称冲突解决（Nomad 尚未完全支持）
conf.EnableNameConflictResolution = false

// Merge Delegate: 阻止非 Nomad server 加入
conf.Merge = &serfMergeDelegate{}
```

#### 3.6 创建 Serf 实例
```go
return serf.Create(conf)
```

---

## 4. 事件处理机制（serfEventHandler）

### 事件循环
- **文件**：[nomad/serf.go:24-58](file:///d:/claude/nomad/nomad/serf.go#L24-L58)

```go
func (s *Server) serfEventHandler() {
    for {
        select {
        case e := <-s.eventCh:
            switch e.EventType() {
            case serf.EventMemberJoin:
                s.updatePeer(e.(serf.MemberEvent))
                s.maybeBootstrap()
                s.localMemberEvent(e.(serf.MemberEvent))
            case serf.EventMemberFailed, serf.EventMemberUpdate:
                s.updatePeer(e.(serf.MemberEvent))
            case serf.EventMemberLeave, serf.EventMemberReap:
                s.deletePeer(e.(serf.MemberEvent))
                s.localMemberEvent(e.(serf.MemberEvent))
            case serf.EventUser, serf.EventQuery: // Ignore
            default:
                s.logger.Warn("unhandled serf event", "event", log.Fmt("%#v", e))
            }
        case <-s.shutdownCh:
            return
        }
    }
}
```

### 事件类型处理

| 事件 | 处理函数 | 说明 |
|------|---------|------|
| `EventMemberJoin` | `updatePeer` + `maybeBootstrap` + `localMemberEvent` | 新成员加入：更新缓存、尝试引导、通知 Leader |
| `EventMemberFailed` | `updatePeer` | 成员故障：更新缓存（状态变为 Failed） |
| `EventMemberUpdate` | `updatePeer` | 元数据变更：更新缓存 |
| `EventMemberLeave` | `deletePeer` + `localMemberEvent` | 主动离开：删除缓存、通知 Leader 移除 Raft peer |
| `EventMemberReap` | `deletePeer` + `localMemberEvent` | 被回收：删除缓存、通知 Leader 移除 Raft peer |
| `EventUser`/`EventQuery` | 忽略 | 用户事件和查询（Nomad 未使用） |

---

## 5. Peer Cache（成员缓存）

### 数据结构
- **文件**：[nomad/peers/peers.go:160-180](file:///d:/claude/nomad/nomad/peers/peers.go#L160-L180)

```go
type PeerCache struct {
    region     string                            // 本地区域
    allPeers   map[string][]*Parts               // 所有 peer（含 Failed，用于版本检查）
    alivePeers map[string][]*Parts               // 仅 Alive peer（用于 RPC 路由）
    localPeers map[raft.ServerAddress]*Parts     // 本地区域 Alive peer（按 Raft 地址索引）
    peersLock  sync.RWMutex
}
```

### 三层缓存设计

| 缓存 | 用途 | 包含状态 |
|------|------|---------|
| `allPeers` | 版本检查（如最小 Raft 协议版本） | Alive + Failed |
| `alivePeers` | 跨区域 RPC 路由 | 仅 Alive |
| `localPeers` | 本地区域 RPC 路由 | 仅 Alive，仅本区域 |

### 更新逻辑
- **`UpdatePeerSet(parts)`**：[nomad/peers/peers.go:265-279](file:///d:/claude/nomad/nomad/peers/peers.go#L265-L279)
  - 更新 `allPeers`（所有状态）
  - 若 Alive：更新 `alivePeers` 和 `localPeers`
  - 若非 Alive：从 `alivePeers` 和 `localPeers` 删除

- **`PeerDelete(parts)`**：[nomad/peers/peers.go:292-301](file:///d:/claude/nomad/nomad/peers/peers.go#L292-L301)
  - 从所有三个缓存中删除

### 查询接口

| 方法 | 用途 |
|------|------|
| `LocalPeer(addr)` | 按地址查本区域 peer |
| `LocalPeers()` | 列出本区域所有 Alive peer |
| `LocalPeersServerInfo()` | 本区域 peer 的 RPC 地址（用于 Client） |
| `RegionNum()` | 已知区域数（含 Alive peer） |
| `RegionNames()` | 已知区域名列表 |
| `RegionPeers(region)` | 指定区域的 Alive peer 列表 |
| `ServersMeetMinimumVersion(region, min, checkFailed)` | 版本检查 |

---

## 6. 成员解析（IsNomadServer）

- **文件**：[nomad/peers/peers.go:72-145](file:///d:/claude/nomad/nomad/peers/peers.go#L72-L145)

### 解析逻辑
从 Serf Member 的 Tags 解析出 Nomad Server 信息：

```go
func IsNomadServer(m serf.Member) (bool, *Parts) {
    if m.Tags["role"] != "nomad" {
        return false, nil
    }
    // 解析 id, region, datacenter, bootstrap, expect, rpc_addr, port, build, raft_vsn, nonvoter
    // 构造 Parts 结构体
    return true, parts
}
```

### Parts 结构
```go
type Parts struct {
    Name        string
    ID          string
    Region      string
    Datacenter  string
    Port        int
    Bootstrap   bool
    Expect      int
    Build       version.Version
    RaftVersion int
    Addr        net.Addr          // Serf 地址（IP:Port）
    RPCAddr     net.Addr          // RPC 地址（rpc_addr:Port）
    Status      serf.MemberStatus
    NonVoter    bool
    Tags        map[string]string
    MajorVersion int               // 已废弃，保留兼容
}
```

---

## 7. Raft 集群引导（maybeBootstrap）

- **文件**：[nomad/serf.go:88-228](file:///d:/claude/nomad/nomad/serf.go#L88-L228)

### 触发条件
1. `BootstrapExpect > 0`（配置了预期节点数）
2. 尚未引导过（`s.bootstrapped` 为 false）
3. Raft 日志为空（`LastIndex() == 0`）

### 引导流程

```go
func (s *Server) maybeBootstrap() {
    // 1. 检查前置条件
    if s.config.BootstrapExpect == 0 || s.bootstrapped.Load() {
        return
    }

    // 2. 检查 Raft 日志是否为空
    index, err := s.raftStore.LastIndex()
    if index != 0 {
        s.bootstrapped.Store(true)
        return
    }

    // 3. 扫描所有 Serf 成员
    members := s.serf.Members()
    var servers []peers.Parts
    voters := 0
    for _, serfMem := range members {
        valid, p := peers.IsNomadServer(serfMem)
        if !valid || p.Region != s.config.Region {
            continue
        }
        // 校验 expect 一致性
        if p.Expect != 0 && p.Expect != s.config.BootstrapExpect {
            return  // 冲突，放弃
        }
        if p.Bootstrap {
            return  // 已有 bootstrap 节点
        }
        if !p.NonVoter {
            voters++
        }
        servers = append(servers, *p)
    }

    // 4. 检查 voter 数量是否达到预期
    if voters < s.config.BootstrapExpect {
        return
    }

    // 5. 查询每个 server 的 Raft peer 状态（避免误引导）
    for _, server := range servers {
        var peers []string
        // 通过 RPC 调用 Status.Peers
        // 若任何 server 已有 peer，放弃引导
        if len(peers) > 0 {
            s.bootstrapped.Store(true)
            return
        }
    }

    // 6. 构造 Raft 配置并引导
    var configuration raft.Configuration
    for _, server := range servers {
        suffrage := raft.Voter
        if server.NonVoter {
            suffrage = raft.Nonvoter
        }
        configuration.Servers = append(configuration.Servers, raft.Server{
            ID:      raft.ServerID(server.ID),
            Address: raft.ServerAddress(server.Addr.String()),
            Suffrage: suffrage,
        })
    }
    future := s.raft.BootstrapCluster(configuration)
    s.bootstrapped.Store(true)
}
```

### BootstrapExpect 取值

| 值 | 行为 |
|----|------|
| `1` | 单节点集群，立即成为 Leader |
| `N > 1` | 等待连接 N 个 server 后引导 |
| `0` | 等待从其他节点获取 Raft 配置 |

---

## 8. Leader 协调（reconcile）

当节点成为 Leader 后，会持续将 Serf 成员状态与 Raft 配置同步。

### 8.1 Leader 循环
- **文件**：[nomad/leader.go:249-329](file:///d:/claude/nomad/nomad/leader.go#L249-L329)

```go
func (s *Server) leaderLoop(stopCh chan struct{}) {
    var reconcileCh chan serf.Member
    establishedLeader := false

RECONCILE:
    reconcileCh = nil
    interval := time.After(s.config.ReconcileInterval)

    // 1. Raft barrier 确保 FSM 已追上
    barrier := s.raft.Barrier(barrierWriteTimeout)

    // 2. 建立领导权
    if !establishedLeader {
        if err := s.establishLeadership(stopCh); err != nil {
            // 失败处理...
        }
        establishedLeader = true
    }

    // 3. 全量协调
    if err := s.reconcile(); err != nil {
        goto WAIT
    }

    // 4. 开始监听增量事件
    reconcileCh = s.reconcileCh

WAIT:
    for {
        select {
        case <-stopCh:
            return
        case <-interval:
            goto RECONCILE  // 定期全量协调
        case member := <-reconcileCh:
            s.reconcileMember(member)  // 增量协调
        }
    }
}
```

### 8.2 全量协调（reconcile）
- **文件**：[nomad/leader.go:1494-1506](file:///d:/claude/nomad/nomad/leader.go#L1494-L1506)

```go
func (s *Server) reconcile() error {
    members := s.serf.Members()
    for _, member := range members {
        if err := s.reconcileMember(member); err != nil {
            return err
        }
    }
    return nil
}
```

### 8.3 单成员协调（reconcileMember）
- **文件**：[nomad/leader.go:1507-1527](file:///d:/claude/nomad/nomad/leader.go#L1507-L1527)

```go
func (s *Server) reconcileMember(serfMem serf.Member) error {
    valid, parts := peers.IsNomadServer(serfMem)
    if !valid || parts.Region != s.config.Region {
        return nil  // 只协调本区域成员
    }

    switch serfMem.Status {
    case serf.StatusAlive:
        return s.addRaftPeer(serfMem, parts)
    case serf.StatusLeft, StatusReap:
        return s.removeRaftPeer(serfMem, parts)
    }
    return nil
}
```

### 8.4 添加 Raft Peer（addRaftPeer）
- **文件**：[nomad/leader.go:1529-1613](file:///d:/claude/nomad/nomad/leader.go#L1529-L1613)

**关键逻辑**：
1. 检查是否已有 bootstrap 节点冲突
2. 获取当前 Raft 配置
3. 若已在配置中（ID 和地址都匹配）：no-op
4. 若地址相同但 ID 不同：先移除旧 server
5. 若 ID 相同但地址不同：先移除旧 server
6. 根据最小 Raft 协议版本选择 API：
   - `>= 3`：`AddNonvoter`（支持非投票节点）
   - `== 2` 且对方 `>= 3`：`AddVoter`
   - 否则：`AddPeer`（旧 API）

### 8.5 移除 Raft Peer（removeRaftPeer）
- **文件**：[nomad/leader.go:1615-1671](file:///d:/claude/nomad/nomad/leader.go#L1615-L1671)

```go
func (s *Server) removeRaftPeer(m serf.Member, parts *peers.Parts) error {
    addr := (&net.TCPAddr{IP: m.Addr, Port: parts.Port}).String()
    configFuture := s.raft.GetConfiguration()

    minRaftProtocol, _ := s.MinRaftProtocol()
    for _, server := range configFuture.Configuration().Servers {
        if server.ID == raft.ServerID(parts.ID) || server.Address == raft.ServerAddress(addr) {
            if minRaftProtocol >= 2 {
                future := s.raft.RemoveServer(server.ID, 0, 0)  // 按 ID 移除
            } else {
                future := s.raft.RemovePeer(raft.ServerAddress(addr))  // 按地址移除
            }
            break
        }
    }
    return nil
}
```

### 8.6 localMemberEvent 触发
- **文件**：[nomad/serf.go:233-253](file:///d:/claude/nomad/nomad/serf.go#L233-L253)

```go
func (s *Server) localMemberEvent(me serf.MemberEvent) {
    if !s.IsLeader() {
        return  // 只有 Leader 处理
    }
    isReap := me.EventType() == serf.EventMemberReap
    for _, m := range me.Members {
        if isReap {
            m.Status = StatusReap
        }
        select {
        case s.reconcileCh <- m:  // 发送到 Leader 循环
        default:  // 队列满则丢弃（定期全量协调会补上）
        }
    }
}
```

---

## 9. 加入集群（Join）

### 9.1 主动加入
- **文件**：[nomad/server.go:2079-2081](file:///d:/claude/nomad/nomad/server.go#L2079-L2081)

```go
func (s *Server) Join(addrs []string) (int, error) {
    return s.serf.Join(addrs, true)  // true = 忽略旧节点
}
```

### 9.2 重试加入（retry_join）
- **文件**：[command/agent/retry_join.go:178-211](file:///d:/claude/nomad/command/agent/retry_join.go#L178-L211)

```go
func (r *retryJoiner) RetryJoin() {
    attempt := 0
    for {
        var addrs []string
        for _, addr := range r.joinCfg.RetryJoin {
            // 支持自动发现：
            // - "exec=..." 执行命令获取地址
            // - "provider=..." 云提供商发现
            // - 其他：原样传递（DNS 解析）
            servers, err := r.autoDiscover.Addrs(addr, r.logger)
            addrs = append(addrs, servers...)
        }

        if len(addrs) > 0 {
            numJoined, err := r.joinFunc(addrs)
            if err == nil {
                return  // 成功
            }
        }

        attempt++
        if r.joinCfg.RetryMaxAttempts > 0 && attempt > r.joinCfg.RetryMaxAttempts {
            close(r.errCh)  // 通知 agent 退出
            return
        }
        time.Sleep(r.joinCfg.RetryInterval)
    }
}
```

### 9.3 配置入口
- **文件**：[command/agent/command.go:965-1031](file:///d:/claude/nomad/command/agent/command.go#L965-L1031)

| 配置块 | joinFunc | 效果 |
|--------|---------|------|
| `server_join` (Server) | `c.agent.server.Join` | 调用 Serf.Join 加入 gossip 池 |
| `server_join` (Client) | `c.agent.client.SetServers` | 直接设置已知 Server 列表（Client 不参与 gossip） |

### 9.4 自动发现支持
- **`exec=`**：执行命令，输出 IP 地址
- **`provider=`**：使用 go-discover 从 AWS/GCP/Azure 等发现
- **其他**：原样传递，由 Serf 通过 DNS 解析

---

## 10. 跨区域联邦（WAN Federation）

### 10.1 设计
Nomad 的 gossip 是**单一全局 gossip 池**，所有区域的 Server 都在同一个 Serf 集群中。通过 `region` tag 区分区域。

### 10.2 跨区域 RPC 转发
- **文件**：[nomad/rpc.go:704-721](file:///d:/claude/nomad/nomad/rpc.go#L704-L721)

```go
func (r *rpcHandler) findRegionServer(region string) (*peers.Parts, error) {
    servers := r.srv.peersCache.RegionPeers(region)
    if len(servers) == 0 {
        return nil, structs.ErrNoRegionPath
    }
    // 随机选择一个 Alive server
    offset := rand.Intn(len(servers))
    return servers[offset], nil
}

func (r *rpcHandler) forwardRegion(region, method string, args, reply interface{}) error {
    server, err := r.findRegionServer(region)
    if err != nil {
        return err
    }
    metrics.IncrCounter([]string{"nomad", "rpc", "cross-region", region}, 1)
    return r.srv.connPool.RPC(region, server.Addr, method, args, reply)
}
```

### 10.3 转发决策（forward）
- **文件**：[nomad/rpc.go:586-607](file:///d:/claude/nomad/nomad/rpc.go#L586-L607)

```go
func (r *rpcHandler) forward(method string, info structs.RPCInfo, args, reply interface{}) (bool, error) {
    region := info.RequestRegion()
    
    // 跨区域：转发到目标区域
    if region != r.srv.config.Region {
        info.SetForwarded()
        err := r.forwardRegion(region, method, args, reply)
        return true, err
    }

    // 本区域读：允许 stale
    if info.IsRead() && info.AllowStaleRead() {
        return false, nil
    }

    // 本区域写：转发到 Leader
    remoteServer, err := r.getLeaderForRPC()
    if remoteServer == nil {
        return false, nil  // 自己是 Leader
    }
    info.SetForwarded()
    err = r.forwardLeader(remoteServer, method, args, reply)
    return true, err
}
```

### 10.4 联邦复制
Leader 通过 `forwardRegion` 从权威区域（AuthoritativeRegion）复制数据：
- **文件**：[nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go)
- 复制内容：ACL Policies、ACL Roles、Namespaces、Node Pools、Auth Methods、Binding Rules

```go
// 示例：ACL Policy 复制
err := s.forwardRegion(s.config.AuthoritativeRegion, "ACL.PolicyList", &req, &resp)
```

---

## 11. 加密（Encryption）

### 11.1 密钥管理
- **文件**：[command/agent/keyring.go](file:///d:/claude/nomad/command/agent/keyring.go)

### 11.2 密钥文件
- **路径**：`<data_dir>/server/serf.keyring`
- **格式**：JSON 数组，包含 base64 编码的密钥

```go
func initKeyring(path, key string, l log.Logger) error {
    // 验证密钥
    if keyBytes, err := base64.StdEncoding.DecodeString(key); err != nil {
        return fmt.Errorf("Invalid key: %s", err)
    }
    if err := memberlist.ValidateKey(keyBytes); err != nil {
        return fmt.Errorf("Invalid key: %s", err)
    }
    
    // 推荐 AES-256（32 字节）
    if len(key) < 32 {
        // 警告：使用 AES-128 或 AES-192
    }

    keys := append(keys, key)
    keyringBytes, _ := json.Marshal(keys)
    // 写入文件
}
```

### 11.3 加载密钥环
```go
func loadKeyringFile(c *serf.Config) error {
    // 读取 JSON 文件
    // base64 解码
    // 创建 memberlist.Keyring
    c.MemberlistConfig.Keyring = keyring
}
```

### 11.4 运行时密钥管理
- **HTTP API**：`/v1/agent/keyring/{list,install,use,remove}`
- **文件**：[command/agent/agent_endpoint.go:634-711](file:///d:/claude/nomad/command/agent/agent_endpoint.go#L634-L711)

```go
func (s *HTTPServer) KeyringOperationRequest(resp, req) {
    kmgr := srv.KeyManager()  // serf.KeyManager
    switch op {
    case "list":
        sresp, err = kmgr.ListKeys()
    case "install":
        sresp, err = kmgr.InstallKey(args.Key)
    case "use":
        sresp, err = kmgr.UseKey(args.Key)
    case "remove":
        sresp, err = kmgr.RemoveKey(args.Key)
    }
}
```

- **CLI**：`nomad operator gossip keyring {list,install,use,remove,generate}`
- **文件**：[command/operator_gossip_keyring.go](file:///d:/claude/nomad/command/operator_gossip_keyring.go)

### 11.5 密钥轮换流程
1. `install` 新密钥（所有节点收到）
2. `use` 新密钥作为主密钥
3. `remove` 旧密钥

---

## 12. Merge Delegate（合并委托）

- **文件**：[nomad/merge.go](file:///d:/claude/nomad/nomad/merge.go)

```go
type serfMergeDelegate struct{}

func (md *serfMergeDelegate) NotifyMerge(members []*serf.Member) error {
    for _, m := range members {
        ok, _ := peers.IsNomadServer(*m)
        if !ok {
            return fmt.Errorf("member '%s' is not a server", m.Name)
        }
    }
    return nil
}
```

**作用**：当两个 gossip 集群意外合并时（如网络分区恢复），验证所有成员都是 Nomad Server，拒绝非 Server 节点混入。

---

## 13. Autopilot 健康集成

### 13.1 Serf 状态映射
- **文件**：[nomad/autopilot.go:141-168](file:///d:/claude/nomad/nomad/autopilot.go#L141-L168)

```go
func autopilotToServerHealth(srv *autopilot.ServerState) structs.ServerHealth {
    srvHealth := structs.ServerHealth{
        ID:          string(srv.Server.ID),
        Name:        srv.Server.Name,
        // ... 其他字段
    }
    switch srv.Server.NodeStatus {
    case autopilot.NodeAlive:
        srvHealth.SerfStatus = serf.StatusAlive
    case autopilot.NodeLeft:
        srvHealth.SerfStatus = serf.StatusLeft
    case autopilot.NodeFailed:
        srvHealth.SerfStatus = serf.StatusFailed
    }
    return srvHealth
}
```

### 13.2 最小 Raft 协议版本
- **文件**：[nomad/autopilot.go:177-193](file:///d:/claude/nomad/nomad/autopilot.go#L177-L193)

```go
func minRaftProtocol(members []*peers.Parts) (int, error) {
    minVersion := -1
    for _, m := range members {
        if m.Status != serf.StatusAlive {
            continue  // 只考虑 Alive 节点
        }
        if minVersion == -1 || m.RaftVersion < minVersion {
            minVersion = m.RaftVersion
        }
    }
    return minVersion, nil
}
```

**用途**：决定使用哪代 Raft API（`AddNonvoter` vs `AddVoter` vs `AddPeer`）。

---

## 14. Consul 服务发现集成

除了静态 `retry_join`，Nomad Server 还可通过 Consul 服务发现加入集群。

- **文件**：[nomad/server.go:1095-1124](file:///d:/claude/nomad/nomad/server.go#L1095-L1124)

```go
// 查询 Consul 中所有 advertising nomad 服务的 server
nomadServerServices := ...
numServersContacted, err := s.Join(nomadServerServices)
```

**流程**：
1. 查询 Consul 多个 datacenter 的 `nomad` 服务
2. 调用 `s.Join()` 加入 gossip
3. 失败则按 `peersPollInterval` 重试

---

## 15. 数据流总结

### 15.1 Server 启动加入集群

```
1. nomad agent -server
   └─> command/agent/command.go
       ├─> handleRetryJoin()  ──────────────┐
       │   └─> retryJoiner.RetryJoin()      │
       │       └─> s.Join(addrs)            │
       │           └─> serf.Join()          │
       │               ├─> TCP 连接目标      │
       │               ├─> 交换成员信息      │
       │               └─> 触发 EventMemberJoin
       │                                   │
2. serfEventHandler 收到事件  <────────────┘
   ├─> updatePeer()  → 更新 peersCache
   ├─> maybeBootstrap() → 尝试 Raft 引导
   └─> localMemberEvent()
       └─> reconcileCh → leaderLoop
           └─> reconcileMember()
               └─> addRaftPeer() → raft.AddVoter()
```

### 15.2 故障检测与处理

```
1. memberlist 探测节点无响应
   └─> 标记为 Suspect → Failed
       └─> 触发 EventMemberFailed

2. serfEventHandler
   └─> updatePeer()
       └─> peersCache.UpdatePeerSet(parts)
           ├─> allPeers 更新（状态变 Failed）
           ├─> alivePeers 删除
           └─> localPeers 删除

3. Leader 周期性 reconcile (ReconcileInterval)
   └─> reconcileMember()
       └─> 若 Failed：不操作（等待恢复或 Reap）
       └─> 若 Reap：removeRaftPeer()
           └─> raft.RemoveServer()
```

### 15.3 跨区域 RPC

```
Client (region=us) → Server (region=us)
  └─> RPC: Region=eu
      └─> rpcHandler.forward()
          ├─> region != local → forwardRegion("eu")
          │   └─> findRegionServer("eu")
          │       └─> peersCache.RegionPeers("eu")  // 从 gossip 缓存
          │       └─> 随机选一个 Alive server
          │   └─> connPool.RPC(region, server.Addr, ...)
          └─> 转发到目标区域 Server
```

---

## 16. 关键配置参数

| 参数 | 默认值 | 说明 | 文件 |
|------|--------|------|------|
| `DefaultSerfPort` | 4648 | Gossip 端口 | [config.go:32](file:///d:/claude/nomad/nomad/config.go#L32) |
| `ReconnectTimeout` | 3 天 | 故障节点重连超时 | [config.go:732](file:///d:/claude/nomad/nomad/config.go#L732) |
| `LeavePropagateDelay` | 1 秒 | 离开意图传播延迟 | [server.go:1787](file:///d:/claude/nomad/nomad/server.go#L1787) |
| `BootstrapExpect` | 0 | 预期引导节点数 | [config.go:52](file:///d:/claude/nomad/nomad/config.go#L52) |
| `ReconcileInterval` | 配置 | Leader 全量协调间隔 | [leader.go:258](file:///d:/claude/nomad/nomad/leader.go#L258) |
| `maxPeerRetries` | 6 | 引导时查询 peer 状态重试次数 | [serf.go:19](file:///d:/claude/nomad/nomad/serf.go#L19) |
| `peerRetryBase` | 1 秒 | 引导重试基础间隔 | [serf.go:22](file:///d:/claude/nomad/nomad/serf.go#L22) |

### memberlist WAN 默认值（来自库）
| 参数 | 值 | 说明 |
|------|-----|------|
| `ProbeInterval` | 5 秒 | 探测间隔 |
| `ProbeTimeout` | 3 秒 | 探测超时 |
| `SuspicionMult` | 6 | Suspect 状态超时倍数 |
| `GossipInterval` | 500 毫秒 | Gossip 消息广播间隔 |
| `GossipNodes` | 4 | 每次 gossip 选择的节点数 |
| `GossipToTheDeadTime` | 30 秒 | 向 dead 节点 gossip 的时间 |

---

## 17. 代码文件索引

### 核心实现
| 文件 | 职责 |
|------|------|
| [nomad/serf.go](file:///d:/claude/nomad/nomad/serf.go) | Serf 事件处理、Peer 缓存更新、Raft 引导 |
| [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | `setupSerf` 初始化、`Join` 方法 |
| [nomad/config.go](file:///d:/claude/nomad/nomad/config.go) | Serf/Memberlist 默认配置 |
| [nomad/merge.go](file:///d:/claude/nomad/nomad/merge.go) | 集群合并验证 |
| [nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go) | Leader 协调、Raft peer 增删 |
| [nomad/peers/peers.go](file:///d:/claude/nomad/nomad/peers/peers.go) | Peer 缓存、成员解析 |
| [nomad/autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | Serf 状态与健康映射 |
| [nomad/rpc.go](file:///d:/claude/nomad/nomad/rpc.go) | 跨区域 RPC 转发 |

### Agent 与 CLI
| 文件 | 职责 |
|------|------|
| [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | `handleRetryJoin` 入口 |
| [command/agent/retry_join.go](file:///d:/claude/nomad/command/agent/retry_join.go) | `retryJoiner` 重试逻辑 |
| [command/agent/keyring.go](file:///d:/claude/nomad/command/agent/keyring.go) | 密钥文件初始化与加载 |
| [command/agent/agent_endpoint.go](file:///d:/claude/nomad/command/agent/agent_endpoint.go) | HTTP API 密钥管理 |
| [command/operator_gossip_keyring.go](file:///d:/claude/nomad/command/operator_gossip_keyring.go) | CLI 密钥管理命令 |
| [command/server_join.go](file:///d:/claude/nomad/command/server_join.go) | `nomad server join` 命令 |

---

## 18. 与 Consul/Vault 的区别

| 特性 | Nomad | Consul | Vault |
|------|-------|--------|-------|
| Gossip 用途 | Server 发现 | Server + Client 发现 | 不使用 |
| 端口 | 4648 | 8301 (LAN), 8302 (WAN) | - |
| 库 | Serf + memberlist | Serf + memberlist | - |
| Client 参与 | 否 | 是 | - |
| WAN 联邦 | 单一 gossip 池 | LAN + WAN 分离 | - |

**关键差异**：
- Nomad 只有 Server 参与 gossip（Client 不参与）。
- Nomad 使用**单一 gossip 池**（所有区域的 Server 在同一池），通过 `region` tag 区分；Consul 使用 LAN 和 WAN 两个分离的池。
- Client 通过 `server_join` 配置或 Consul 服务发现获取 Server 列表，通过 RPC 通信，不依赖 gossip。

---

## 19. 设计亮点与权衡

### 19.1 亮点
1. **WAN Timing**：跨区域通信的合理性预设。
2. **三层 Peer 缓存**：`allPeers`（版本检查）、`alivePeers`（跨区路由）、`localPeers`（本区路由）职责清晰。
3. **Merge Delegate**：防止非 Nomad 节点混入。
4. **幂等引导**：`maybeBootstrap` 多重检查避免误引导。
5. **增量 + 全量协调**：`reconcileCh` 增量处理 + 定期 `reconcile` 全量对账。

### 19.2 权衡
1. **单一 gossip 池 vs 分离池**：
   - 优点：简单，跨区域发现天然支持。
   - 缺点：跨区域故障可能影响 gossip 整体收敛。
2. **WAN Timing**：跨区域友好但同区域可能反应较慢。
3. **ReconnectTimeout = 3 天**：减少误删但可能延长脏状态。
4. **Client 不参与 gossip**：简化设计但 Client 依赖配置或 Consul 发现 Server。

---

## 总结

Nomad 的 Gossip 协议实现围绕 **Serf + memberlist** 构建，承担 **Server 集群的成员发现、故障检测和元数据传播**。其核心设计为：

1. **单一 gossip 池**跨区域通信，使用 WAN timing。
2. **Tags 携带元数据**（region, dc, rpc_addr, port, build, raft_vsn 等）。
3. **事件驱动**架构：Serf 事件 → `serfEventHandler` → 更新 PeerCache + 触发 Leader 协调。
4. **Leader 协调** Raft 配置：`reconcileMember` 将 Serf 成员同步到 Raft。
5. **自动引导**：`maybeBootstrap` 基于 `BootstrapExpect` 自动初始化 Raft 集群。
6. **加密支持**：AES 加密 + 运行时密钥轮换。
7. **自动发现**：支持 `exec=`、`provider=`、DNS、Consul 服务发现。

Gossip 是 Nomad 多区域联邦的基础，使 Nomad 能在无中心化注册中心的情况下实现 Server 集群的自管理和跨区域路由。
