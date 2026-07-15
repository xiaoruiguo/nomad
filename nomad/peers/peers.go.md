# peers.go 代码说明文档

> 文件路径：[peers/peers.go](file:///d:/claude/nomad/nomad/peers/peers.go)
> 总行数：415 行
> 所属包：`peers`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **对等节点子包**（`nomad/peers`），管理 Raft 集群的对等节点信息，持久化 peer 列表到本地存储。

## 2. 类型定义

### Parts

**定义位置**：[L32](file:///d:/claude/nomad/nomad/peers/peers.go#L32)

**类型**：struct

```go
	Name string
	ID string
	Region string
	Datacenter string
	Port int
	Bootstrap bool
	Expect int
	Build version.Version
	RaftVersion int
	Addr net.Addr
	RPCAddr net.Addr
	Status serf.MemberStatus
	NonVoter bool
	Tags map[string]string
	MajorVersion int
```

**关联方法**（2 个）：`String`, `Copy`

### PeerCache

**定义位置**：[L154](file:///d:/claude/nomad/nomad/peers/peers.go#L154)

**类型**：struct

```go
	region string
	allPeers map[string][]*Parts
	alivePeers map[string][]*Parts
	localPeers map[raft.ServerAddress]*Parts
	peersLock sync.RWMutex
```

**关联方法**（13 个）：`LocalPeer`, `LocalPeers`, `LocalPeersServerInfo`, `RegionNum`, `RegionNames`, `RegionPeers`, `UpdatePeerSet`, `peerSetLocalLocked`, `peerSetLocked`, `PeerDelete`, `peerDeleteLocalLocked`, `peerDeleteLocked`, `ServersMeetMinimumVersion`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `deprecatedAPIMajorVersion` | `1` |
| `AllRegions` | `""` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `String` | `p *Parts` | - | `string` | [L57](file:///d:/claude/nomad/nomad/peers/peers.go#L57) |
| `Copy` | `p *Parts` | - | `*Parts` | [L61](file:///d:/claude/nomad/nomad/peers/peers.go#L61) |
| `IsNomadServer` | - | `m serf.Member` | `bool, *Parts` | [L72](file:///d:/claude/nomad/nomad/peers/peers.go#L72) |
| `NewPeerCache` | - | `localRegion string` | `*PeerCache` | [L179](file:///d:/claude/nomad/nomad/peers/peers.go#L179) |
| `LocalPeer` | `p *PeerCache` | `addr raft.ServerAddress` | `*Parts` | [L188](file:///d:/claude/nomad/nomad/peers/peers.go#L188) |
| `LocalPeers` | `p *PeerCache` | - | `[]*Parts` | [L195](file:///d:/claude/nomad/nomad/peers/peers.go#L195) |
| `LocalPeersServerInfo` | `p *PeerCache` | - | `[]*structs.NodeServerInfo` | [L208](file:///d:/claude/nomad/nomad/peers/peers.go#L208) |
| `RegionNum` | `p *PeerCache` | - | `int` | [L226](file:///d:/claude/nomad/nomad/peers/peers.go#L226) |
| `RegionNames` | `p *PeerCache` | - | `[]string` | [L234](file:///d:/claude/nomad/nomad/peers/peers.go#L234) |
| `RegionPeers` | `p *PeerCache` | `region string` | `[]*Parts` | [L248](file:///d:/claude/nomad/nomad/peers/peers.go#L248) |
| `UpdatePeerSet` | `p *PeerCache` | `parts *Parts` | - | [L267](file:///d:/claude/nomad/nomad/peers/peers.go#L267) |
| `peerSetLocalLocked` | `p *PeerCache` | `parts *Parts` | - | [L288](file:///d:/claude/nomad/nomad/peers/peers.go#L288) |
| `peerSetLocked` | `p *PeerCache` | `peers map[string][]*Parts, parts *Parts` | - | [L294](file:///d:/claude/nomad/nomad/peers/peers.go#L294) |
| `PeerDelete` | `p *PeerCache` | `parts *Parts` | - | [L318](file:///d:/claude/nomad/nomad/peers/peers.go#L318) |
| `peerDeleteLocalLocked` | `p *PeerCache` | `parts *Parts` | - | [L332](file:///d:/claude/nomad/nomad/peers/peers.go#L332) |
| `peerDeleteLocked` | `p *PeerCache` | `peers map[string][]*Parts, parts *Parts` | - | [L338](file:///d:/claude/nomad/nomad/peers/peers.go#L338) |
| `ServersMeetMinimumVersion` | `p *PeerCache` | `region string, minVersion *version.Version, checkFailedServers bool` | `bool` | [L361](file:///d:/claude/nomad/nomad/peers/peers.go#L361) |
| `regionServersMeetMinimumVersion` | - | `peers []*Parts, minVersion *version.Version, checkFailedServers bool` | `bool` | [L398](file:///d:/claude/nomad/nomad/peers/peers.go#L398) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `net` | 标准库 |
| `slices` | 标准库 |
| `strconv` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-version` | 第三方库 |
| `github.com/hashicorp/raft` | 第三方库 |
| `github.com/hashicorp/serf/serf` | 第三方库 |

## 7. 设计模式与技术特点

- **Raft 共识**：使用 HashiCorp Raft 库实现分布式共识，保证状态一致性
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [peers_test.go](file:///d:/claude/nomad/nomad/peers/peers_test.go) | 对应测试文件 |

