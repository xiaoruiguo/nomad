# peers.go 代码说明文档

> 文件路径：[nomad/peers/peers.go](file:///d:/claude/nomad/nomad/peers/peers.go)
> 总行数：415 行
> 所属包：`peers`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `peers` 包，定义结构体类型、包含 18 个方法/函数。

## 2. 类型定义

### Parts

**定义位置**：[L32](file:///d:/claude/nomad/nomad/peers/peers.go#L32)

**中文说明**：Parts 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Parts struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `ID` | `string` | 唯一标识符 |
| `Region` | `string` | 区域 |
| `Datacenter` | `string` | 数据中心 |
| `Port` | `int` | 端口 |
| `Bootstrap` | `bool` | 布尔值 |
| `Expect` | `int` | — |
| `Build` | `version.Version` | — |
| `RaftVersion` | `int` | — |
| `Addr` | `net.Addr` | 地址 |
| `RPCAddr` | `net.Addr` | — |
| `Status` | `serf.MemberStatus` | 状态 |
| `NonVoter` | `bool` | 布尔值 |
| `Tags` | `map[string]string` | 标签 |
| `MajorVersion` | `int` | — |

**关联方法**（2 个）：`String`, `Copy`

### PeerCache

**定义位置**：[L154](file:///d:/claude/nomad/nomad/peers/peers.go#L154)

**中文说明**：PeerCache 是一个缓存，存储常用数据以减少重复计算或 I/O。

**类型**：struct

```go
type PeerCache struct {
	region string
	allPeers map[string][]*Parts
	alivePeers map[string][]*Parts
	localPeers map[raft.ServerAddress]*Parts
	peersLock sync.RWMutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `region` | `string` | 区域 |
| `allPeers` | `map[string][]*Parts` | 映射表 |
| `alivePeers` | `map[string][]*Parts` | 映射表 |
| `localPeers` | `map[raft.ServerAddress]*Parts` | 映射表 |
| `peersLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |

**关联方法**（13 个）：`LocalPeer`, `LocalPeers`, `LocalPeersServerInfo`, `RegionNum`, `RegionNames`, `RegionPeers`, `UpdatePeerSet`, `peerSetLocalLocked`, `peerSetLocked`, `PeerDelete`, `peerDeleteLocalLocked`, `peerDeleteLocked`, `ServersMeetMinimumVersion`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `deprecatedAPIMajorVersion` | `—` | `1` | — |
| `AllRegions` | `—` | `""` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `String` | `p *Parts` | `` | `string` | [L57](file:///d:/claude/nomad/nomad/peers/peers.go#L57) |
| `Copy` | `p *Parts` | `` | `*Parts` | [L61](file:///d:/claude/nomad/nomad/peers/peers.go#L61) |
| `IsNomadServer` | - | `m serf.Member` | `bool, *Parts` | [L72](file:///d:/claude/nomad/nomad/peers/peers.go#L72) |
| `NewPeerCache` | - | `localRegion string` | `*PeerCache` | [L179](file:///d:/claude/nomad/nomad/peers/peers.go#L179) |
| `LocalPeer` | `p *PeerCache` | `addr raft.ServerAddress` | `*Parts` | [L188](file:///d:/claude/nomad/nomad/peers/peers.go#L188) |
| `LocalPeers` | `p *PeerCache` | `` | `[]*Parts` | [L195](file:///d:/claude/nomad/nomad/peers/peers.go#L195) |
| `LocalPeersServerInfo` | `p *PeerCache` | `` | `[]*structs.NodeServerInfo` | [L208](file:///d:/claude/nomad/nomad/peers/peers.go#L208) |
| `RegionNum` | `p *PeerCache` | `` | `int` | [L226](file:///d:/claude/nomad/nomad/peers/peers.go#L226) |
| `RegionNames` | `p *PeerCache` | `` | `[]string` | [L234](file:///d:/claude/nomad/nomad/peers/peers.go#L234) |
| `RegionPeers` | `p *PeerCache` | `region string` | `[]*Parts` | [L248](file:///d:/claude/nomad/nomad/peers/peers.go#L248) |
| `UpdatePeerSet` | `p *PeerCache` | `parts *Parts` | `` | [L267](file:///d:/claude/nomad/nomad/peers/peers.go#L267) |
| `peerSetLocalLocked` | `p *PeerCache` | `parts *Parts` | `` | [L288](file:///d:/claude/nomad/nomad/peers/peers.go#L288) |
| `peerSetLocked` | `p *PeerCache` | `peers map[string][]*Parts, parts *Parts` | `` | [L294](file:///d:/claude/nomad/nomad/peers/peers.go#L294) |
| `PeerDelete` | `p *PeerCache` | `parts *Parts` | `` | [L318](file:///d:/claude/nomad/nomad/peers/peers.go#L318) |
| `peerDeleteLocalLocked` | `p *PeerCache` | `parts *Parts` | `` | [L332](file:///d:/claude/nomad/nomad/peers/peers.go#L332) |
| `peerDeleteLocked` | `p *PeerCache` | `peers map[string][]*Parts, parts *Parts` | `` | [L338](file:///d:/claude/nomad/nomad/peers/peers.go#L338) |
| `ServersMeetMinimumVersion` | `p *PeerCache` | `region string, minVersion *version.Version, checkFailedServers bool` | `bool` | [L361](file:///d:/claude/nomad/nomad/peers/peers.go#L361) |
| `regionServersMeetMinimumVersion` | - | `peers []*Parts, minVersion *version.Version, checkFailedServers bool` | `bool` | [L398](file:///d:/claude/nomad/nomad/peers/peers.go#L398) |

## 5. 核心方法详解

### Copy()

**签名**：`func (p *Parts) Copy() *Parts`

**位置**：[L61](file:///d:/claude/nomad/nomad/peers/peers.go#L61)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Parts` | — |

### NewPeerCache()

**签名**：`func NewPeerCache(localRegion string) *PeerCache`

**位置**：[L179](file:///d:/claude/nomad/nomad/peers/peers.go#L179)

**中文说明**：创建并返回一个新的 PeerCache 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `localRegion` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*PeerCache` | — |

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

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **Raft 集成**：与 HashiCorp Raft 库交互，处理共识协议相关操作
- **缓存模式**：实现缓存机制，减少重复计算或 I/O 操作
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [peers_test.go](file:///d:/claude/nomad/nomad/peers/peers_test.go) | 对应测试文件 |

