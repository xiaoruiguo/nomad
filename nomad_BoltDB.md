# Nomad 中 BoltDB 代码实现分析

> 文档主题：列出 Nomad 代码库中使用 BoltDB 的所有源文件、函数名和参数等详细信息
> 源码仓库：[d:/claude/nomad](file:///d:/claude/nomad)
> BoltDB 上游库：`go.etcd.io/bbolt`（bbolt 是 etcd 维护的 BoltDB fork）
> Raft BoltDB 适配库：`github.com/hashicorp/raft-boltdb/v2`

---

## 目录

1. [BoltDB 使用概览](#1-boltdb-使用概览)
2. [BoltDB 库依赖关系](#2-boltdb-库依赖关系)
3. [核心封装：helper/boltdd 包](#3-核心封装helperboltdd-包)
4. [Raft 日志存储：raft-boltdb 使用](#4-raft-日志存储raft-boltdb-使用)
5. [客户端状态存储：client/state 包](#5-客户端状态存储clientstate-包)
6. [Raft 工具：helper/raftutil 包](#6-raft-工具helperraftutil-包)
7. [Server 端 Raft 集成](#7-server-端-raft-集成)
8. [测试文件汇总](#8-测试文件汇总)
9. [BoltDB Schema 与 Bucket 结构](#9-boltdb-schema-与-bucket-结构)
10. [关键调用链汇总](#10-关键调用链汇总)
11. [源码文件索引](#11-源码文件索引)

---

## 1. BoltDB 使用概览

Nomad 中 BoltDB 主要用于两大场景：

| 场景 | 包路径 | 用途 |
|------|--------|------|
| Raft 日志/稳定存储 | `github.com/hashicorp/raft-boltdb/v2` | 作为 Raft 共识算法的 LogStore 和 StableStore |
| 客户端本地状态 | `go.etcd.io/bbolt` (直接使用) | 持久化分配、任务、节点元数据等客户端状态 |

**BoltDB 文件分布**：

| 文件 | 路径 | 用途 |
|------|------|------|
| `raft.db` | `<DataDir>/server/raft/raft.db` | Raft 日志和稳定存储 |
| `state.db` | `<DataDir>/client/state.db` | 客户端状态存储 |

---

## 2. BoltDB 库依赖关系

### 2.1 直接依赖

| 导入路径 | 类型 | 用途 |
|----------|------|------|
| `go.etcd.io/bbolt` | 直接依赖 | 原生 bbolt 库，用于客户端状态 |
| `github.com/hashicorp/raft-boltdb/v2` | 直接依赖 | Raft 适配的 BoltDB 包装 |
| `golang.org/x/crypto/blake2b` | 直接依赖 | boltdd 中用于写入去重的哈希 |

### 2.2 使用 bbolt 的文件清单

```
d:\claude\nomad\client\state\db_bolt.go              (客户端状态主实现)
d:\claude\nomad\client\state\upgrade.go              (DB 升级)
d:\claude\nomad\client\state\upgrade_int_test.go     (升级集成测试)
d:\claude\nomad\client\state\upgrade_test.go         (升级单元测试)
d:\claude\nomad\helper\boltdd\boltdd.go             (去重封装)
d:\claude\nomad\helper\boltdd\boltdd_test.go        (去重封装测试)
d:\claude\nomad\helper\raftutil\state.go            (Raft 状态读取)
d:\claude\nomad\helper\raftutil\migrate.go          (BoltDB→WAL 迁移)
d:\claude\nomad\nomad\server.go                     (Server 集成)
```

### 2.3 使用 raft-boltdb 的文件清单

```
d:\claude\nomad\nomad\server.go                              (Raft 初始化)
d:\claude\nomad\helper\raftutil\state.go                    (只读打开 BoltStore)
d:\claude\nomad\helper\raftutil\migrate.go                  (迁移源端)
d:\claude\nomad\helper\raftutil\migrate_test.go             (迁移测试)
d:\claude\nomad\helper\raftutil\migrate_test_helpers.go     (测试辅助)
d:\claude\nomad\helper\raftutil\state_test.go               (state 测试)
```

---

## 3. 核心封装：helper/boltdd 包

### 3.1 文件：[helper/boltdd/boltdd.go](file:///d:/claude/nomad/helper/boltdd/boltdd.go)

`boltdd`（bolt de-duplicate）是 Nomad 对 bbolt 的封装，提供：
- **写入去重**：通过 blake2b 哈希比较，避免重复写入相同值
- **msgpack 编码**：自动使用 msgpack 序列化/反序列化值
- **元数据持久化**：跨事务保存 key 哈希和子 bucket 元信息

#### 3.1.1 错误类型

| 类型/函数 | 签名 | 行号 | 说明 |
|-----------|------|------|------|
| `ErrNotFound` | `struct { name string }` | [L21](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L21) | key 未找到错误 |
| `NotFound` | `func(name string) error` | [L30](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L30) | 创建 ErrNotFound |
| `IsErrNotFound` | `func(e error) bool` | [L35](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L35) | 判断是否 ErrNotFound |

#### 3.1.2 DB 结构与方法

**类型定义**：[L45-L50](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L45-L50)

```go
type DB struct {
    rootBuckets     map[string]*bucketMeta
    rootBucketsLock sync.Mutex
    boltDB          *bbolt.DB
}
```

**DB 方法清单**：

| 方法 | 签名 | 行号 | 说明 |
|------|------|------|------|
| `Open` | `func Open(path string, mode os.FileMode, options *bbolt.Options) (*DB, error)` | [L54](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L54) | 打开/创建 BoltDB 并包装 |
| `New` | `func New(bdb *bbolt.DB) *DB` | [L64](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L64) | 包装已有 bbolt.DB |
| `bucket` | `func (db *DB) bucket(btx *bbolt.Tx, name []byte) *Bucket` | [L71](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L71) | 获取已存在的根 bucket |
| `createBucket` | `func (db *DB) createBucket(btx *bbolt.Tx, name []byte) (*Bucket, error)` | [L93](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L93) | 创建新根 bucket |
| `createBucketIfNotExists` | `func (db *DB) createBucketIfNotExists(btx *bbolt.Tx, name []byte) (*Bucket, error)` | [L116](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L116) | 获取或创建根 bucket |
| `Update` | `func (db *DB) Update(fn func(*Tx) error) error` | [L140](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L140) | 读写事务 |
| `Batch` | `func (db *DB) Batch(fn func(*Tx) error) error` | [L147](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L147) | 批量读写事务（合并并发写） |
| `View` | `func (db *DB) View(fn func(*Tx) error) error` | [L154](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L154) | 只读事务 |
| `isClosed` | `func (db *DB) isClosed() bool` | [L163](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L163) | 判断 DB 是否已关闭 |
| `Close` | `func (db *DB) Close() error` | [L169](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L169) | 关闭 DB 并清理状态 |
| `BoltDB` | `func (db *DB) BoltDB() *bbolt.DB` | [L177](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L177) | 返回底层 bbolt.DB |

#### 3.1.3 Tx 结构与方法

**类型定义**：[L181-L184](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L181-L184)

```go
type Tx struct {
    db  *DB
    btx *bbolt.Tx
}
```

**Tx 方法清单**：

| 方法 | 签名 | 行号 | 说明 |
|------|------|------|------|
| `newTx` | `func newTx(db *DB, btx *bbolt.Tx) *Tx` | [L186](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L186) | 构造 Tx |
| `Bucket` | `func (tx *Tx) Bucket(name []byte) *Bucket` | [L194](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L194) | 获取根 bucket |
| `CreateBucket` | `func (tx *Tx) CreateBucket(name []byte) (*Bucket, error)` | [L198](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L198) | 创建根 bucket |
| `CreateBucketIfNotExists` | `func (tx *Tx) CreateBucketIfNotExists(name []byte) (*Bucket, error)` | [L204](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L204) | 获取或创建根 bucket |
| `Writable` | `func (tx *Tx) Writable() bool` | [L209](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L209) | 事务是否可写 |
| `BoltTx` | `func (tx *Tx) BoltTx() *bbolt.Tx` | [L214](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L214) | 返回底层 bbolt.Tx |

#### 3.1.4 bucketMeta（跨事务元数据）

**类型定义**：[L220-L228](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L220-L228)

```go
type bucketMeta struct {
    hashes      map[string][]byte   // key 到值哈希的映射
    hashesLock  sync.Mutex
    buckets     map[string]*bucketMeta  // 子 bucket 元数据
    bucketsLock sync.Mutex
}
```

**bucketMeta 方法清单**：

| 方法 | 签名 | 行号 | 说明 |
|------|------|------|------|
| `newBucketMeta` | `func newBucketMeta() *bucketMeta` | [L230](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L230) | 构造 bucketMeta |
| `getHash` | `func (bm *bucketMeta) getHash(hashKey string) []byte` | [L238](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L238) | 获取上次写入的哈希 |
| `setHash` | `func (bm *bucketMeta) setHash(hashKey string, hashVal []byte)` | [L246](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L246) | 记录写入哈希 |
| `delHash` | `func (bm *bucketMeta) delHash(hashKey string)` | [L253](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L253) | 删除哈希记录 |
| `createBucket` | `func (bm *bucketMeta) createBucket(name []byte) *bucketMeta` | [L261](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L261) | 创建子 bucket 元数据 |
| `deleteBucket` | `func (bm *bucketMeta) deleteBucket(name []byte)` | [L274](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L274) | 删除子 bucket 元数据 |
| `getOrCreateBucket` | `func (bm *bucketMeta) getOrCreateBucket(name []byte) *bucketMeta` | [L282](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L282) | 获取或创建子 bucket 元数据 |

#### 3.1.5 Bucket 结构与方法

**类型定义**：[L294-L297](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L294-L297)

```go
type Bucket struct {
    bm         *bucketMeta
    boltBucket *bbolt.Bucket
}
```

**Bucket 方法清单**：

| 方法 | 签名 | 行号 | 说明 |
|------|------|------|------|
| `newBucket` | `func newBucket(b *bucketMeta, bb *bbolt.Bucket) *Bucket` | [L301](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L301) | 构造 Bucket |
| `Put` | `func (b *Bucket) Put(key []byte, val interface{}) error` | [L309](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L309) | 写入值（带去重） |
| `Get` | `func (b *Bucket) Get(key []byte, obj interface{}) error` | [L344](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L344) | 读取值 |
| `Iterate` | `func Iterate[T any](b *Bucket, prefix []byte, fn func([]byte, T)) error` | [L364](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L364) | 泛型迭代器 |
| `DeletePrefix` | `func (b *Bucket) DeletePrefix(prefix []byte) error` | [L381](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L381) | 按前缀删除 |
| `Delete` | `func (b *Bucket) Delete(key []byte) error` | [L395](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L395) | 删除单个 key |
| `Bucket` | `func (b *Bucket) Bucket(name []byte) *Bucket` | [L404](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L404) | 获取子 bucket |
| `CreateBucket` | `func (b *Bucket) CreateBucket(name []byte) (*Bucket, error)` | [L418](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L418) | 创建子 bucket |
| `CreateBucketIfNotExists` | `func (b *Bucket) CreateBucketIfNotExists(name []byte) (*Bucket, error)` | [L431](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L431) | 获取或创建子 bucket |
| `DeleteBucket` | `func (b *Bucket) DeleteBucket(name []byte) error` | [L444](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L444) | 删除子 bucket |
| `BoltBucket` | `func (b *Bucket) BoltBucket() *bbolt.Bucket` | [L458](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L458) | 返回底层 bbolt.Bucket |

#### 3.1.6 Put 方法详解（去重核心）

**位置**：[L309-L340](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L309-L340)

```go
func (b *Bucket) Put(key []byte, val interface{}) error {
    var buf bytes.Buffer
    // 1. msgpack 序列化
    codec.NewEncoder(&buf, structs.MsgpackHandle).Encode(val)
    // 2. blake2b 哈希
    hashKey := string(key)
    hashVal := blake2b.Sum256(buf.Bytes())
    // 3. 比较哈希，相同则跳过写入
    lastHash := b.bm.getHash(hashKey)
    if bytes.Equal(hashVal[:], lastHash) {
        return nil
    }
    // 4. 写入 bbolt
    b.boltBucket.Put(key, buf.Bytes())
    // 5. 更新哈希记录
    b.bm.setHash(hashKey, hashVal[:])
    return nil
}
```

---

## 4. Raft 日志存储：raft-boltdb 使用

### 4.1 文件：[nomad/server.go](file:///d:/claude/nomad/nomad/server.go)

#### 4.1.1 raftBackend 接口

**位置**：[L107](file:///d:/claude/nomad/nomad/server.go#L107)

```go
// raftBackend is satisfied by both *raftboltdb.BoltStore and *wal.WAL.
```

#### 4.1.2 setupRaft 中创建 BoltDB 存储

**位置**：[L1461-L1484](file:///d:/claude/nomad/nomad/server.go#L1461-L1484)

```go
case LogStoreBackendBoltDB:
    noFreelistSync := false
    if s.config.RaftLogStoreConfig != nil {
        noFreelistSync = s.config.RaftLogStoreConfig.BoltDBNoFreelistSync
    }
    boltStore, boltErr := raftboltdb.New(raftboltdb.Options{
        Path:   filepath.Join(path, "raft.db"),
        NoSync: false,                          // 每次日志写入都 fsync
        BoltOptions: &bbolt.Options{
            NoFreelistSync: noFreelistSync,
        },
        MsgpackUseNewTimeFormat: true,
    })
    store = boltStore
    s.logger.Info("setting up raft bolt store", "no_freelist_sync", noFreelistSync)
    go boltStore.RunMetrics(s.shutdownCtx, 0)   // 启动 bbolt 指标发布
```

#### 4.1.3 在线校验中的 BoltDB 分支

**位置**：[L1673-L1698](file:///d:/claude/nomad/nomad/server.go#L1673-L1698)

```go
switch store := s.raftStore.(type) {
case *raftboltdb.BoltStore:
    stats := store.Stats()
    s.logger.Debug("raft logstore verifier: BoltDB store verification",
        "first_index", first,
        "last_index", last,
        "open_tx", stats.OpenTxN,
        "free_pages", stats.FreePageN,
        "pending_pages", stats.PendingPageN)
case *raftwal.WAL:
    // ... WAL 校验
}
```

### 4.2 文件：[helper/raftutil/state.go](file:///d:/claude/nomad/helper/raftutil/state.go)

#### 4.2.1 RaftStore 接口

**位置**：[L27-L33](file:///d:/claude/nomad/helper/raftutil/state.go#L27-L33)

```go
type RaftStore interface {
    raft.LogStore
    raft.StableStore
    Close() error
}
```

#### 4.2.2 raftStateInfoBoltDB 函数

**位置**：[L50-L78](file:///d:/claude/nomad/helper/raftutil/state.go#L50-L78)

```go
func raftStateInfoBoltDB(p string) (store RaftStore, firstIdx uint64, lastIdx uint64, err error) {
    opts := raftboltdb.Options{
        Path: p,
        BoltOptions: &bbolt.Options{
            ReadOnly: true,           // 只读模式打开
            Timeout:  1 * time.Second,
        },
        MsgpackUseNewTimeFormat: true,
    }
    s, err := raftboltdb.New(opts)
    // ...
    firstIdx, err = s.FirstIndex()
    lastIdx, err = s.LastIndex()
    return s, firstIdx, lastIdx, nil
}
```

#### 4.2.3 其他函数

| 函数 | 签名 | 行号 | 说明 |
|------|------|------|------|
| `RaftStateInfo` | `func RaftStateInfo(p string) (store RaftStore, firstIdx uint64, lastIdx uint64, err error)` | [L38](file:///d:/claude/nomad/helper/raftutil/state.go#L38) | 自动识别 BoltDB 或 WAL |
| `raftStateInfoWAL` | `func raftStateInfoWAL(p string) (...)` | [L80](file:///d:/claude/nomad/helper/raftutil/state.go#L80) | 打开 WAL 存储 |
| `LogEntries` | `func LogEntries(p string) (<-chan interface{}, <-chan error, error)` | [L105](file:///d:/claude/nomad/helper/raftutil/state.go#L105) | 读取所有日志条目 |
| `decode` | `func decode(e *raft.Log) (*logMessage, error)` | [L151](file:///d:/claude/nomad/helper/raftutil/state.go#L151) | 解码日志条目 |
| `FindRaftStore` | `func FindRaftStore(p string) (storePath string, err error)` | [L244](file:///d:/claude/nomad/helper/raftutil/state.go#L244) | 查找 raft 存储路径 |
| `FindRaftFile` | `func FindRaftFile(p string) (raftpath string, err error)` | [L287](file:///d:/claude/nomad/helper/raftutil/state.go#L287) | 仅查找 BoltDB 文件 |
| `FindRaftDir` | `func FindRaftDir(p string) (string, error)` | [L311](file:///d:/claude/nomad/helper/raftutil/state.go#L311) | 查找 raft 数据目录 |
| `FindFileInPath` | `func FindFileInPath(file string, p string) (path string, err error)` | [L331](file:///d:/claude/nomad/helper/raftutil/state.go#L331) | 递归查找文件 |

### 4.3 文件：[helper/raftutil/migrate.go](file:///d:/claude/nomad/helper/raftutil/migrate.go)

实现 BoltDB → WAL 迁移工具，对应 CLI 命令 `nomad operator raft migrate-backend`。

#### 4.3.1 MigrateToWAL 函数

**位置**：[L48-L154](file:///d:/claude/nomad/helper/raftutil/migrate.go#L48-L154)

```go
func MigrateToWAL(ctx context.Context, raftDir string, progress chan<- string) error
```

**参数**：
- `ctx context.Context`：上下文，支持取消
- `raftDir string`：raft 数据目录（包含 raft.db）
- `progress chan<- string`：进度通知通道（可为 nil）

**返回值**：`error`

**流程**：
1. 预检查（preflightChecks）
2. 创建迁移标记文件 `.migration-in-progress`
3. 用 `raftboltdb.New` 打开源 BoltDB（[L77-L86](file:///d:/claude/nomad/helper/raftutil/migrate.go#L77-L86)）
4. 用 `raftwal.Open` 创建目标 WAL（[L94](file:///d:/claude/nomad/helper/raftutil/migrate.go#L94)）
5. `migrate.CopyLogs` 复制日志（[L105](file:///d:/claude/nomad/helper/raftutil/migrate.go#L105)）
6. `migrate.CopyStable` 复制稳定存储（[L116](file:///d:/claude/nomad/helper/raftutil/migrate.go#L116)）
7. `verifyMigration` 校验数据完整性（[L125](file:///d:/claude/nomad/helper/raftutil/migrate.go#L125)）
8. 关闭两个存储
9. 重命名旧 BoltDB 为 `raft.db.migrated.<timestamp>` 作为备份

#### 4.3.2 辅助函数

| 函数 | 签名 | 行号 | 说明 |
|------|------|------|------|
| `sendProgress` | `func sendProgress(progress chan<- string, msg string)` | [L156](file:///d:/claude/nomad/helper/raftutil/migrate.go#L156) | 非阻塞发送进度 |
| `drainProgress` | `func drainProgress(sub <-chan string, parent chan<- string, wg *sync.WaitGroup)` | [L166](file:///d:/claude/nomad/helper/raftutil/migrate.go#L166) | 转发进度消息 |
| `preflightChecks` | `func preflightChecks(boltPath, walDir, raftDir string) error` | [L182](file:///d:/claude/nomad/helper/raftutil/migrate.go#L182) | 迁移前检查 |
| `cleanupWAL` | `func cleanupWAL(walDir string)` | [L227](file:///d:/claude/nomad/helper/raftutil/migrate.go#L227) | 清理 WAL 目录（Windows 重试） |
| `verifyMigration` | `func verifyMigration(src, dst interface{...}) error` | [L244](file:///d:/claude/nomad/helper/raftutil/migrate.go#L244) | 数据完整性校验 |

---

## 5. 客户端状态存储：client/state 包

### 5.1 文件：[client/state/db_bolt.go](file:///d:/claude/nomad/client/state/db_bolt.go)

这是 Nomad 客户端 BoltDB 状态存储的主实现。

#### 5.1.1 核心结构

**BoltStateDB 结构**：[L178-L182](file:///d:/claude/nomad/client/state/db_bolt.go#L178-L182)

```go
type BoltStateDB struct {
    stateDir string
    db       *boltdd.DB
    logger   hclog.Logger
}
```

#### 5.1.2 Bucket 名称常量

**位置**：[L63-L154](file:///d:/claude/nomad/client/state/db_bolt.go#L63-L154)

| 常量 | 值 | 说明 |
|------|----|------|
| `metaBucketName` | `"meta"` | 元数据 bucket |
| `metaVersionKey` | `"version"` | 版本 key |
| `metaVersion` | `'3'` | 当前版本 |
| `metaUpgradedKey` | `"upgraded"` | 升级时间 key |
| `allocationsBucketName` | `"allocations"` | 分配 bucket |
| `allocKey` | `"alloc"` | 分配对象 key |
| `allocDeployStatusKey` | `"deploy_status"` | 部署状态 key |
| `allocNetworkStatusKey` | `"network_status"` | 网络状态 key |
| `acknowledgedStateKey` | `"acknowledged_state"` | 已确认状态 key |
| `allocVolumeKey` | `"alloc_volume"` | 分配卷 key |
| `allocIdentityKey` | `"alloc_identities"` | 分配身份 key |
| `allocConsulACLTokenKey` | `"alloc_consul_acl_token_identities"` | Consul ACL 令牌 key |
| `checkResultsBucket` | `"check_results"` | 检查结果 bucket |
| `taskLocalStateKey` | `"local_state"` | 任务本地状态 key |
| `taskStateKey` | `"task_state"` | 任务状态 key |
| `devManagerBucket` | `"devicemanager"` | 设备管理器 bucket |
| `driverManagerBucket` | `"drivermanager"` | 驱动管理器 bucket |
| `managerPluginStateKey` | `"plugin_state"` | 插件状态 key |
| `dynamicPluginBucketName` | `"dynamicplugins"` | 动态插件 bucket |
| `registryStateKey` | `"registry_state"` | 注册表状态 key |
| `nodeMetaBucket` | `"nodemeta"` | 节点元数据 bucket |
| `nodeMetaKey` | `"meta"` | 节点元数据 key |
| `nodeBucket` | `"node"` | 节点 bucket |
| `nodeRegistrationKey` | `"node_registration"` | 节点注册 key |
| `hostVolBucket` | `"host_volumes_to_create"` | 主机卷 bucket |
| `nodeIdentityBucket` | `"node_identity"` | 节点身份 bucket |
| `nodeIdentityBucketStateKey` | `"node_identity_state"` | 节点身份状态 key |

**辅助函数**：

| 函数 | 签名 | 行号 | 说明 |
|------|------|------|------|
| `taskBucketName` | `func taskBucketName(taskName string) []byte` | [L157](file:///d:/claude/nomad/client/state/db_bolt.go#L157) | 生成 task bucket 名 |
| `GetStateDBFactory` | `func GetStateDBFactory(devMode bool) NewStateDBFunc` | [L165](file:///d:/claude/nomad/client/state/db_bolt.go#L165) | 获取 StateDB 工厂 |

#### 5.1.3 BoltStateDB 方法完整清单

| 方法 | 签名 | 行号 | 说明 |
|------|------|------|------|
| `NewBoltStateDB` | `func NewBoltStateDB(logger hclog.Logger, stateDir string) (StateDB, error)` | [L186](file:///d:/claude/nomad/client/state/db_bolt.go#L186) | 创建/打开 BoltDB |
| `Name` | `func (s *BoltStateDB) Name() string` | [L223](file:///d:/claude/nomad/client/state/db_bolt.go#L223) | 返回 `"boltdb"` |
| `GetAllAllocations` | `func (s *BoltStateDB) GetAllAllocations() ([]*structs.Allocation, map[string]error, error)` | [L232](file:///d:/claude/nomad/client/state/db_bolt.go#L232) | 获取所有分配 |
| `getAllAllocations` | `func (s *BoltStateDB) getAllAllocations(tx *boltdd.Tx) ([]*structs.Allocation, map[string]error)` | [L254](file:///d:/claude/nomad/client/state/db_bolt.go#L254) | 内部实现 |
| `PutAllocation` | `func (s *BoltStateDB) PutAllocation(alloc *structs.Allocation, opts ...WriteOption) error` | [L293](file:///d:/claude/nomad/client/state/db_bolt.go#L293) | 存储分配 |
| `PutDeploymentStatus` | `func (s *BoltStateDB) PutDeploymentStatus(allocID string, ds *structs.AllocDeploymentStatus) error` | [L322](file:///d:/claude/nomad/client/state/db_bolt.go#L322) | 存储部署状态 |
| `GetDeploymentStatus` | `func (s *BoltStateDB) GetDeploymentStatus(allocID string) (*structs.AllocDeploymentStatus, error)` | [L342](file:///d:/claude/nomad/client/state/db_bolt.go#L342) | 获取部署状态 |
| `PutNetworkStatus` | `func (s *BoltStateDB) PutNetworkStatus(allocID string, ds *structs.AllocNetworkStatus, opts ...WriteOption) error` | [L380](file:///d:/claude/nomad/client/state/db_bolt.go#L380) | 存储网络状态 |
| `GetNetworkStatus` | `func (s *BoltStateDB) GetNetworkStatus(allocID string) (*structs.AllocNetworkStatus, error)` | [L400](file:///d:/claude/nomad/client/state/db_bolt.go#L400) | 获取网络状态 |
| `PutAcknowledgedState` | `func (s *BoltStateDB) PutAcknowledgedState(allocID string, state *arstate.State, opts ...WriteOption) error` | [L433](file:///d:/claude/nomad/client/state/db_bolt.go#L433) | 存储已确认状态 |
| `GetAcknowledgedState` | `func (s *BoltStateDB) GetAcknowledgedState(allocID string) (*arstate.State, error)` | [L448](file:///d:/claude/nomad/client/state/db_bolt.go#L448) | 获取已确认状态 |
| `PutAllocVolumes` | `func (s *BoltStateDB) PutAllocVolumes(allocID string, state *arstate.AllocVolumes, opts ...WriteOption) error` | [L485](file:///d:/claude/nomad/client/state/db_bolt.go#L485) | 存储分配卷 |
| `GetAllocVolumes` | `func (s *BoltStateDB) GetAllocVolumes(allocID string) (*arstate.AllocVolumes, error)` | [L501](file:///d:/claude/nomad/client/state/db_bolt.go#L501) | 获取分配卷 |
| `PutAllocIdentities` | `func (s *BoltStateDB) PutAllocIdentities(allocID string, identities []*structs.SignedWorkloadIdentity, opts ...WriteOption) error` | [L540](file:///d:/claude/nomad/client/state/db_bolt.go#L540) | 存储分配身份 |
| `GetAllocIdentities` | `func (s *BoltStateDB) GetAllocIdentities(allocID string) ([]*structs.SignedWorkloadIdentity, error)` | [L557](file:///d:/claude/nomad/client/state/db_bolt.go#L557) | 获取分配身份 |
| `PutAllocConsulACLTokens` | `func (s *BoltStateDB) PutAllocConsulACLTokens(allocID string, tokens []*cstructs.ConsulACLToken, opts ...WriteOption) error` | [L591](file:///d:/claude/nomad/client/state/db_bolt.go#L591) | 存储 Consul ACL 令牌 |
| `GetAllocConsulACLTokens` | `func (s *BoltStateDB) GetAllocConsulACLTokens(allocID string) ([]*cstructs.ConsulACLToken, error)` | [L606](file:///d:/claude/nomad/client/state/db_bolt.go#L606) | 获取 Consul ACL 令牌 |
| `GetTaskRunnerState` | `func (s *BoltStateDB) GetTaskRunnerState(allocID, taskName string) (*trstate.LocalState, *structs.TaskState, error)` | [L637](file:///d:/claude/nomad/client/state/db_bolt.go#L637) | 获取 TaskRunner 状态 |
| `PutTaskRunnerLocalState` | `func (s *BoltStateDB) PutTaskRunnerLocalState(allocID, taskName string, val *trstate.LocalState) error` | [L693](file:///d:/claude/nomad/client/state/db_bolt.go#L693) | 存储 TaskRunner 本地状态 |
| `PutTaskState` | `func (s *BoltStateDB) PutTaskState(allocID, taskName string, state *structs.TaskState) error` | [L715](file:///d:/claude/nomad/client/state/db_bolt.go#L715) | 存储任务状态 |
| `DeleteTaskBucket` | `func (s *BoltStateDB) DeleteTaskBucket(allocID, taskName string) error` | [L733](file:///d:/claude/nomad/client/state/db_bolt.go#L733) | 删除任务 bucket |
| `DeleteAllocationBucket` | `func (s *BoltStateDB) DeleteAllocationBucket(allocID string, opts ...WriteOption) error` | [L754](file:///d:/claude/nomad/client/state/db_bolt.go#L754) | 删除分配 bucket |
| `Close` | `func (s *BoltStateDB) Close() error` | [L769](file:///d:/claude/nomad/client/state/db_bolt.go#L769) | 关闭数据库 |
| `PutDevicePluginState` | `func (s *BoltStateDB) PutDevicePluginState(ps *dmstate.PluginState) error` | [L841](file:///d:/claude/nomad/client/state/db_bolt.go#L841) | 存储设备插件状态 |
| `GetDevicePluginState` | `func (s *BoltStateDB) GetDevicePluginState() (*dmstate.PluginState, error)` | [L855](file:///d:/claude/nomad/client/state/db_bolt.go#L855) | 获取设备插件状态 |
| `PutDriverPluginState` | `func (s *BoltStateDB) PutDriverPluginState(ps *driverstate.PluginState) error` | [L888](file:///d:/claude/nomad/client/state/db_bolt.go#L888) | 存储驱动插件状态 |
| `GetDriverPluginState` | `func (s *BoltStateDB) GetDriverPluginState() (*driverstate.PluginState, error)` | [L902](file:///d:/claude/nomad/client/state/db_bolt.go#L902) | 获取驱动插件状态 |
| `PutDynamicPluginRegistryState` | `func (s *BoltStateDB) PutDynamicPluginRegistryState(ps *dynamicplugins.RegistryState) error` | [L935](file:///d:/claude/nomad/client/state/db_bolt.go#L935) | 存储动态插件注册表状态 |
| `GetDynamicPluginRegistryState` | `func (s *BoltStateDB) GetDynamicPluginRegistryState() (*dynamicplugins.RegistryState, error)` | [L948](file:///d:/claude/nomad/client/state/db_bolt.go#L948) | 获取动态插件注册表状态 |
| `PutCheckResult` | `func (s *BoltStateDB) PutCheckResult(allocID string, qr *structs.CheckQueryResult) error` | [L984](file:///d:/claude/nomad/client/state/db_bolt.go#L984) | 存储检查结果 |
| `GetCheckResults` | `func (s *BoltStateDB) GetCheckResults() (checks.ClientResults, error)` | [L996](file:///d:/claude/nomad/client/state/db_bolt.go#L996) | 获取检查结果 |
| `DeleteCheckResults` | `func (s *BoltStateDB) DeleteCheckResults(allocID string, checkIDs []structs.CheckID) error` | [L1017](file:///d:/claude/nomad/client/state/db_bolt.go#L1017) | 删除检查结果 |
| `PurgeCheckResults` | `func (s *BoltStateDB) PurgeCheckResults(allocID string) error` | [L1034](file:///d:/claude/nomad/client/state/db_bolt.go#L1034) | 清空分配的检查结果 |
| `PutNodeMeta` | `func (s *BoltStateDB) PutNodeMeta(meta map[string]*string) error` | [L1048](file:///d:/claude/nomad/client/state/db_bolt.go#L1048) | 存储节点元数据 |
| `GetNodeMeta` | `func (s *BoltStateDB) GetNodeMeta() (m map[string]*string, err error)` | [L1061](file:///d:/claude/nomad/client/state/db_bolt.go#L1061) | 获取节点元数据 |
| `PutNodeRegistration` | `func (s *BoltStateDB) PutNodeRegistration(reg *cstructs.NodeRegistration) error` | [L1085](file:///d:/claude/nomad/client/state/db_bolt.go#L1085) | 存储节点注册信息 |
| `GetNodeRegistration` | `func (s *BoltStateDB) GetNodeRegistration() (*cstructs.NodeRegistration, error)` | [L1096](file:///d:/claude/nomad/client/state/db_bolt.go#L1096) | 获取节点注册信息 |
| `PutDynamicHostVolume` | `func (s *BoltStateDB) PutDynamicHostVolume(vol *cstructs.HostVolumeState) error` | [L1113](file:///d:/claude/nomad/client/state/db_bolt.go#L1113) | 存储动态主机卷 |
| `GetDynamicHostVolumes` | `func (s *BoltStateDB) GetDynamicHostVolumes() ([]*cstructs.HostVolumeState, error)` | [L1123](file:///d:/claude/nomad/client/state/db_bolt.go#L1123) | 获取所有动态主机卷 |
| `DeleteDynamicHostVolume` | `func (s *BoltStateDB) DeleteDynamicHostVolume(id string) error` | [L1146](file:///d:/claude/nomad/client/state/db_bolt.go#L1146) | 删除动态主机卷 |
| `PutNodeIdentity` | `func (s *BoltStateDB) PutNodeIdentity(identity string) error` | [L1158](file:///d:/claude/nomad/client/state/db_bolt.go#L1158) | 存储节点身份 JWT |
| `GetNodeIdentity` | `func (s *BoltStateDB) GetNodeIdentity() (string, error)` | [L1171](file:///d:/claude/nomad/client/state/db_bolt.go#L1171) | 获取节点身份 JWT |
| `init` | `func (s *BoltStateDB) init() error` | [L1189](file:///d:/claude/nomad/client/state/db_bolt.go#L1189) | 初始化新 DB 元数据 |
| `updateWithOptions` | `func (s *BoltStateDB) updateWithOptions(opts []WriteOption, updateFn func(tx *boltdd.Tx) error) error` | [L1202](file:///d:/claude/nomad/client/state/db_bolt.go#L1202) | 应用写选项（Batch/Update） |
| `Upgrade` | `func (s *BoltStateDB) Upgrade() error` | [L1216](file:///d:/claude/nomad/client/state/db_bolt.go#L1216) | 升级 DB schema |
| `DB` | `func (s *BoltStateDB) DB() *boltdd.DB` | [L1268](file:///d:/claude/nomad/client/state/db_bolt.go#L1268) | 返回底层 DB（测试用） |

#### 5.1.4 包级辅助函数

| 函数 | 签名 | 行号 | 说明 |
|------|------|------|------|
| `putDeploymentStatusImpl` | `func putDeploymentStatusImpl(tx *boltdd.Tx, allocID string, ds *structs.AllocDeploymentStatus) error` | [L328](file:///d:/claude/nomad/client/state/db_bolt.go#L328) | 事务内实现 |
| `putNetworkStatusImpl` | `func putNetworkStatusImpl(tx *boltdd.Tx, allocID string, ds *structs.AllocNetworkStatus) error` | [L386](file:///d:/claude/nomad/client/state/db_bolt.go#L386) | 事务内实现 |
| `putTaskRunnerLocalStateImpl` | `func putTaskRunnerLocalStateImpl(tx *boltdd.Tx, allocID, taskName string, val *trstate.LocalState) error` | [L701](file:///d:/claude/nomad/client/state/db_bolt.go#L701) | 事务内实现 |
| `putTaskStateImpl` | `func putTaskStateImpl(tx *boltdd.Tx, allocID, taskName string, state *structs.TaskState) error` | [L723](file:///d:/claude/nomad/client/state/db_bolt.go#L723) | 事务内实现 |
| `getAllocationBucket` | `func getAllocationBucket(tx *boltdd.Tx, allocID string) (*boltdd.Bucket, error)` | [L777](file:///d:/claude/nomad/client/state/db_bolt.go#L777) | 获取分配 bucket |
| `getTaskBucket` | `func getTaskBucket(tx *boltdd.Tx, allocID, taskName string) (*boltdd.Bucket, error)` | [L815](file:///d:/claude/nomad/client/state/db_bolt.go#L815) | 获取任务 bucket |
| `keyForCheck` | `func keyForCheck(allocID string, checkID structs.CheckID) []byte` | [L979](file:///d:/claude/nomad/client/state/db_bolt.go#L979) | 生成检查结果 key |
| `getNodeMeta` | `func getNodeMeta(b *boltdd.Bucket) (map[string]*string, error)` | [L1075](file:///d:/claude/nomad/client/state/db_bolt.go#L1075) | 从 bucket 读取节点元数据 |

#### 5.1.5 Entry 包装类型

| 类型 | 字段 | 行号 | 说明 |
|------|------|------|------|
| `allocEntry` | `Alloc *structs.Allocation` | [L250](file:///d:/claude/nomad/client/state/db_bolt.go#L250) | 分配包装 |
| `deployStatusEntry` | `DeploymentStatus *structs.AllocDeploymentStatus` | [L316](file:///d:/claude/nomad/client/state/db_bolt.go#L316) | 部署状态包装 |
| `networkStatusEntry` | `NetworkStatus *structs.AllocNetworkStatus` | [L374](file:///d:/claude/nomad/client/state/db_bolt.go#L374) | 网络状态包装 |
| `acknowledgedStateEntry` | `State *arstate.State` | [L1197](file:///d:/claude/nomad/client/state/db_bolt.go#L1197) | 已确认状态包装 |
| `allocVolumeStatesEntry` | `State *arstate.AllocVolumes` | [L479](file:///d:/claude/nomad/client/state/db_bolt.go#L479) | 分配卷包装 |
| `allocIdentitiesEntry` | `Identities []*structs.SignedWorkloadIdentity` | [L534](file:///d:/claude/nomad/client/state/db_bolt.go#L534) | 分配身份包装 |
| `allocConsulACLTokenEntry` | `Tokens []*cstructs.ConsulACLToken` | [L586](file:///d:/claude/nomad/client/state/db_bolt.go#L586) | Consul 令牌包装 |
| `clientIdentity` | `SignedIdentity string` | [L1154](file:///d:/claude/nomad/client/state/db_bolt.go#L1154) | 客户端身份包装 |

### 5.2 文件：[client/state/upgrade.go](file:///d:/claude/nomad/client/state/upgrade.go)

负责 BoltDB schema 升级（0.8→0.9，1.2→1.3）。

#### 5.2.1 函数清单

| 函数 | 签名 | 行号 | 说明 |
|------|------|------|------|
| `NeedsUpgrade` | `func NeedsUpgrade(bdb *bbolt.DB) (upgradeTo09, upgradeTo13 bool, err error)` | [L22](file:///d:/claude/nomad/client/state/upgrade.go#L22) | 检测是否需要升级 |
| `addMeta` | `func addMeta(tx *bbolt.Tx) error` | [L59](file:///d:/claude/nomad/client/state/upgrade.go#L59) | 写入版本元数据 |
| `backupDB` | `func backupDB(bdb *bbolt.DB, dst string) error` | [L70](file:///d:/claude/nomad/client/state/upgrade.go#L70) | 备份数据库 |
| `UpgradeAllocs` | `func UpgradeAllocs(logger hclog.Logger, tx *boltdd.Tx) error` | [L96](file:///d:/claude/nomad/client/state/upgrade.go#L96) | 升级分配 schema（0.8→0.9） |
| `upgradeAllocBucket` | `func upgradeAllocBucket(logger hclog.Logger, tx *boltdd.Tx, bkt *bbolt.Bucket, allocID string) error` | [L150](file:///d:/claude/nomad/client/state/upgrade.go#L150) | 升级单个分配 bucket |
| `upgradeTaskBucket` | `func upgradeTaskBucket(logger hclog.Logger, bkt *bbolt.Bucket) (*taskRunnerState08, error)` | [L258](file:///d:/claude/nomad/client/state/upgrade.go#L258) | 升级任务 bucket |
| `upgradeOldAllocMutable` | `func upgradeOldAllocMutable(tx *boltdd.Tx, allocID string, oldBytes []byte) error` | [L303](file:///d:/claude/nomad/client/state/upgrade.go#L303) | 升级 0.8 alloc mutable 状态 |
| `UpgradeDynamicPluginRegistry` | `func UpgradeDynamicPluginRegistry(logger hclog.Logger, tx *boltdd.Tx) error` | [L325](file:///d:/claude/nomad/client/state/upgrade.go#L325) | 升级动态插件注册表（1.2→1.3） |

### 5.3 文件：[client/state/interface.go](file:///d:/claude/nomad/client/state/interface.go)

定义 `StateDB` 接口，`BoltStateDB` 是其实现之一。

#### 5.3.1 StateDB 接口

**位置**：[L18-L158](file:///d:/claude/nomad/client/state/interface.go#L18-L158)

接口包含 40+ 方法，覆盖分配、任务、插件、检查、节点等全部客户端状态操作。

#### 5.3.2 写选项

**位置**：[L163-L192](file:///d:/claude/nomad/client/state/interface.go#L163-L192)

| 类型/函数 | 签名 | 说明 |
|-----------|------|------|
| `WriteOptions` | `struct { BatchMode bool }` | 写选项 |
| `WriteOption` | `func(*WriteOptions)` | 选项函数 |
| `mergeWriteOptions` | `func mergeWriteOptions(opts []WriteOption) WriteOptions` | 合并选项 |
| `WithBatchMode` | `func WithBatchMode() WriteOption` | 启用批量模式 |

---

## 6. Raft 工具：helper/raftutil 包

### 6.1 文件清单

| 文件 | 用途 |
|------|------|
| [helper/raftutil/state.go](file:///d:/claude/nomad/helper/raftutil/state.go) | 读取 Raft 状态（支持 BoltDB/WAL） |
| [helper/raftutil/migrate.go](file:///d:/claude/nomad/helper/raftutil/migrate.go) | BoltDB→WAL 迁移 |
| [helper/raftutil/migrate_test_helpers.go](file:///d:/claude/nomad/helper/raftutil/migrate_test_helpers.go) | 迁移测试辅助 |
| [helper/raftutil/state_test.go](file:///d:/claude/nomad/helper/raftutil/state_test.go) | state 测试 |
| [helper/raftutil/migrate_test.go](file:///d:/claude/nomad/helper/raftutil/migrate_test.go) | 迁移测试 |

### 6.2 migrate_test_helpers.go 函数

| 函数 | 签名 | 行号 | 说明 |
|------|------|------|------|
| `newTestBoltStore` | `func newTestBoltStore(t *testing.T, raftDir string, logs []*raft.Log, stableKVs map[string]string, stableUint64s map[string]uint64)` | [L19](file:///d:/claude/nomad/helper/raftutil/migrate_test_helpers.go#L19) | 创建测试用 BoltStore |
| `makeLogs` | `func makeLogs(start, count uint64) []*raft.Log` | [L53](file:///d:/claude/nomad/helper/raftutil/migrate_test_helpers.go#L53) | 生成测试日志 |

---

## 7. Server 端 Raft 集成

### 7.1 文件：[nomad/server.go](file:///d:/claude/nomad/server.go)

#### 7.1.1 setupRaft 中的 BoltDB 创建

详见 [第 4.1.2 节](#412-setraft-中创建-boltdb-存储)。

#### 7.1.2 在线校验中的 BoltDB 分支

详见 [第 4.1.3 节](#413-在线校验中的-boltdb-分支)。

#### 7.1.3 相关配置

**位置**：[nomad/config.go](file:///d:/claude/nomad/nomad/config.go)

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `RaftConfig` | `*raft.Config` | - | Raft 配置 |
| `RaftTimeout` | `time.Duration` | 10s | Raft 网络超时 |
| `RaftLogStoreConfig.Backend` | `string` | `"boltdb"` | 日志存储后端 |
| `RaftLogStoreConfig.BoltDBNoFreelistSync` | `bool` | `false` | BoltDB freelist 同步开关 |
| `RaftLogStoreConfig.VerificationEnabled` | `bool` | `false` | 启用在线校验 |
| `RaftLogStoreConfig.VerificationInterval` | `time.Duration` | - | 校验间隔 |

---

## 8. 测试文件汇总

### 8.1 测试文件清单

| 文件 | 测试内容 |
|------|----------|
| [helper/boltdd/boltdd_test.go](file:///d:/claude/nomad/helper/boltdd/boltdd_test.go) | boltdd 去重封装测试 |
| [client/state/db_test.go](file:///d:/claude/nomad/client/state/db_test.go) | BoltStateDB 单元测试 |
| [client/state/upgrade_test.go](file:///d:/claude/nomad/client/state/upgrade_test.go) | 升级单元测试 |
| [client/state/upgrade_int_test.go](file:///d:/claude/nomad/client/state/upgrade_int_test.go) | 升级集成测试 |
| [helper/raftutil/state_test.go](file:///d:/claude/nomad/helper/raftutil/state_test.go) | RaftStateInfo 测试 |
| [helper/raftutil/migrate_test.go](file:///d:/claude/nomad/helper/raftutil/migrate_test.go) | MigrateToWAL 测试 |
| [helper/raftutil/migrate_test_helpers.go](file:///d:/claude/nomad/helper/raftutil/migrate_test_helpers.go) | 迁移测试辅助 |

### 8.2 主要测试函数

#### boltdd_test.go

| 函数 | 行号 | 说明 |
|------|------|------|
| `setupBoltDB` | [L31](file:///d:/claude/nomad/helper/boltdd/boltdd_test.go#L31) | 创建测试 DB |
| `TestDB_Open` | [L45](file:///d:/claude/nomad/helper/boltdd/boltdd_test.go#L45) | 测试打开 |
| `TestDB_Close` | [L51](file:///d:/claude/nomad/helper/boltdd/boltdd_test.go#L51) | 测试关闭后操作返回 ErrDatabaseNotOpen |
| `TestBucket_Create` | [L69](file:///d:/claude/nomad/helper/boltdd/boltdd_test.go#L69) | 测试 bucket 创建 |

#### db_test.go

| 函数 | 行号 | 说明 |
|------|------|------|
| `setupBoltStateDB` | [L35](file:///d:/claude/nomad/client/state/db_test.go#L35) | 创建 BoltStateDB |
| `testDB` | [L55](file:///d:/claude/nomad/client/state/db_test.go#L55) | 多后端测试辅助 |
| `TestStateDB_Allocations` | [L70](file:///d:/claude/nomad/client/state/db_test.go#L70) | 分配 CRUD 测试 |
| `TestStateDB_Batch` | [L155](file:///d:/claude/nomad/client/state/db_test.go#L155) | 批量模式测试（验证 MaxBatchDelay/MaxBatchSize） |
| `TestStateDB_TaskState` | [L263](file:///d:/claude/nomad/client/state/db_test.go#L263) | 任务状态测试 |
| `TestStateDB_DeviceManager` | [L313](file:///d:/claude/nomad/client/state/db_test.go#L313) | 设备管理器测试 |
| `TestStateDB_DriverManager` | [L338](file:///d:/claude/nomad/client/state/db_test.go#L338) | 驱动管理器测试 |
| `TestStateDB_DynamicRegistry` | [L365](file:///d:/claude/nomad/client/state/db_test.go#L365) | 动态注册表测试 |
| `TestStateDB_HostVolumes` | [L389](file:///d:/claude/nomad/client/state/db_test.go#L389) | 主机卷测试 |
| `TestStateDB_CheckResult` | [L433](file:///d:/claude/nomad/client/state/db_test.go#L433) | 检查结果测试 |
| `TestStateDB_NodeIdentity` | [L496](file:///d:/claude/nomad/client/state/db_test.go#L496) | 节点身份测试 |
| `TestStateDB_ConsulACLToken` | [L514](file:///d:/claude/nomad/client/state/db_test.go#L514) | Consul ACL 令牌测试 |
| `TestStateDB_Upgrade` | [L542](file:///d:/claude/nomad/client/state/db_test.go#L542) | 升级测试 |

---

## 9. BoltDB Schema 与 Bucket 结构

### 9.1 客户端 state.db Schema

**位置**：[client/state/db_bolt.go#L26-L61](file:///d:/claude/nomad/client/state/db_bolt.go#L26-L61)

```
meta/
|--> version -> '3' (not msgpack encoded)
|--> upgraded -> time.Now().Format(timeRFC3339)

allocations/
|--> <alloc-id>/
|   |--> alloc          -> allocEntry{*structs.Allocation}
|   |--> deploy_status  -> deployStatusEntry{*structs.AllocDeploymentStatus}
|   |--> network_status -> networkStatusEntry{*structs.AllocNetworkStatus}
|   |--> acknowledged_state -> acknowledgedStateEntry{*arstate.State}
|   |--> alloc_volumes  -> allocVolumeStatesEntry{arstate.AllocVolumes}
|   |--> alloc_identities -> allocIdentitiesEntry{}
|   |--> alloc_consul_acl_token_identities -> consulACLTokensEntry{}
|   |--> task-<name>/
|   |   |--> local_state -> *trstate.LocalState
|   |   |--> task_state  -> *structs.TaskState
|   |--> checks/
|       |--> check-<id> -> *structs.CheckState

devicemanager/
|--> plugin_state -> *dmstate.PluginState

drivermanager/
|--> plugin_state -> *driverstate.PluginState

dynamicplugins/
|--> registry_state -> *dynamicplugins.RegistryState

nodemeta/
|--> meta -> map[string]*string

node/
|--> registration -> *cstructs.NodeRegistration

node_identity/
|--> node_identity_state -> clientIdentity{SignedIdentity}

host_volumes_to_create/
|--> <vol-id> -> *cstructs.HostVolumeState

check_results/
|--> <allocID>_<checkID> -> *structs.CheckQueryResult
```

### 9.2 Raft raft.db Schema

由 `raft-boltdb/v2` 管理，包含两个内置 bucket：

| Bucket | 用途 |
|--------|------|
| `logs` | Raft 日志条目（LogStore） |
| `conf` | 稳定存储（StableStore）：CurrentTerm、LastVoteTerm、LastVoteCand 等 |

---

## 10. 关键调用链汇总

### 10.1 Raft BoltDB 初始化调用链

```
Server.setupRaft()                                    [server.go#L1344]
    └─ LogStoreBackendBoltDB 分支                     [server.go#L1461]
        ├─ raftboltdb.New(raftboltdb.Options{...})    [server.go#L1468]
        │   └─ bbolt.Open(path, 0600, opts)
        ├─ boltStore.RunMetrics(shutdownCtx, 0)       [server.go#L1483]
        ├─ raft.NewLogCache(raftLogCacheSize, store)  [server.go#L1506]
        └─ raft.NewRaft(cfg, fsm, log, stable, snap, trans)
```

### 10.2 客户端 BoltDB 初始化调用链

```
Client 初始化
    └─ GetStateDBFactory(devMode)                     [db_bolt.go#L165]
        └─ NewBoltStateDB(logger, stateDir)           [db_bolt.go#L186]
            ├─ boltdd.Open(fn, 0600, timeout)         [db_bolt.go#L200]
            │   └─ bbolt.Open(path, mode, options)
            │   └─ New(bdb)  // 包装为 boltdd.DB
            └─ sdb.init()  // 首次运行时初始化 meta bucket
                └─ db.Update(addMeta(tx.BoltTx()))
```

### 10.3 客户端写操作调用链

```
BoltStateDB.PutAllocation(alloc)
    └─ updateWithOptions(opts, updateFn)              [db_bolt.go#L1202]
        ├─ WriteOptions.BatchMode == true → db.Batch(updateFn)
        └─ 否则 → db.Update(updateFn)
            └─ boltdd.DB.Update(fn)                   [boltdd.go#L140]
                └─ bbolt.DB.Update(func(btx) {
                    tx := newTx(db, btx)
                    fn(tx)
                })
                    └─ tx.CreateBucketIfNotExists(allocationsBucketName)
                    └─ allocsBkt.CreateBucketIfNotExists(allocID)
                    └─ allocBkt.Put(allocKey, &allocEntry{Alloc: alloc})
                        └─ blake2b 哈希比较
                        └─ 相同则跳过；不同则 msgpack 编码 + bbolt.Put
```

### 10.4 BoltDB→WAL 迁移调用链

```
CLI: nomad operator raft migrate-backend <data-dir>
    └─ raftutil.MigrateToWAL(ctx, raftDir, progress)  [migrate.go#L48]
        ├─ preflightChecks(boltPath, walDir, raftDir) [migrate.go#L182]
        ├─ raftboltdb.New(raftboltdb.Options{...})    [migrate.go#L77]
        │   // 以读写模式打开源 BoltDB
        ├─ raftwal.Open(walDir)                       [migrate.go#L94]
        ├─ migrate.CopyLogs(ctx, dst, src, batch, progress)  [migrate.go#L105]
        ├─ migrate.CopyStable(ctx, dst, src, nil, nil, progress)  [migrate.go#L116]
        ├─ verifyMigration(src, dst)                  [migrate.go#L125]
        │   ├─ 比较 FirstIndex/LastIndex
        │   ├─ 比较 CurrentTerm、LastVoteTerm
        │   ├─ 比较 LastVoteCand
        │   └─ 抽检日志条目
        ├─ dst.Close(); src.Close()
        └─ os.Rename(boltPath, backupPath)  // 备份旧文件
```

### 10.5 在线校验调用链

```
startRaftLogVerifier() (后台周期任务)
    └─ s.raftStore.FirstIndex() / LastIndex()
    └─ switch store := s.raftStore.(type)
        case *raftboltdb.BoltStore:                   [server.go#L1675]
            stats := store.Stats()
            // 输出 open_tx、free_pages、pending_pages 等指标
        case *raftwal.WAL:
            store.IsMonotonic()
```

---

## 11. 源码文件索引

### 11.1 生产源文件（非测试）

| # | 文件路径 | 行数 | 主要内容 |
|---|----------|------|----------|
| 1 | [helper/boltdd/boltdd.go](file:///d:/claude/nomad/helper/boltdd/boltdd.go) | 460 | boltdd 去重封装（DB、Tx、Bucket、bucketMeta） |
| 2 | [client/state/db_bolt.go](file:///d:/claude/nomad/client/state/db_bolt.go) | 1270 | BoltStateDB 客户端状态存储主实现 |
| 3 | [client/state/upgrade.go](file:///d:/claude/nomad/client/state/upgrade.go) | 352 | BoltDB schema 升级 |
| 4 | [client/state/interface.go](file:///d:/claude/nomad/client/state/interface.go) | 192 | StateDB 接口定义 |
| 5 | [helper/raftutil/state.go](file:///d:/claude/nomad/helper/raftutil/state.go) | 355 | Raft 状态读取工具 |
| 6 | [helper/raftutil/migrate.go](file:///d:/claude/nomad/helper/raftutil/migrate.go) | 344 | BoltDB→WAL 迁移 |
| 7 | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | 2300+ | setupRaft 中 BoltDB 集成 |
| 8 | [nomad/config.go](file:///d:/claude/nomad/nomad/config.go) | 500+ | RaftLogStoreConfig 配置 |

### 11.2 测试源文件

| # | 文件路径 | 行数 | 主要内容 |
|---|----------|------|----------|
| 1 | [helper/boltdd/boltdd_test.go](file:///d:/claude/nomad/helper/boltdd/boltdd_test.go) | 80+ | boltdd 单元测试 |
| 2 | [client/state/db_test.go](file:///d:/claude/nomad/client/state/db_test.go) | 548 | BoltStateDB 单元测试 |
| 3 | [client/state/upgrade_test.go](file:///d:/claude/nomad/client/state/upgrade_test.go) | 200+ | 升级单元测试 |
| 4 | [client/state/upgrade_int_test.go](file:///d:/claude/nomad/client/state/upgrade_int_test.go) | 227+ | 升级集成测试 |
| 5 | [helper/raftutil/state_test.go](file:///d:/claude/nomad/helper/raftutil/state_test.go) | 30+ | RaftStateInfo 测试 |
| 6 | [helper/raftutil/migrate_test.go](file:///d:/claude/nomad/helper/raftutil/migrate_test.go) | 180+ | MigrateToWAL 测试 |
| 7 | [helper/raftutil/migrate_test_helpers.go](file:///d:/claude/nomad/helper/raftutil/migrate_test_helpers.go) | 64 | 迁移测试辅助 |

### 11.3 按使用库分类

#### 使用 `go.etcd.io/bbolt` 的文件

| 文件 | 用途 |
|------|------|
| [helper/boltdd/boltdd.go](file:///d:/claude/nomad/helper/boltdd/boltdd.go) | bbolt 封装 |
| [client/state/db_bolt.go](file:///d:/claude/nomad/client/state/db_bolt.go) | 客户端状态 |
| [client/state/upgrade.go](file:///d:/claude/nomad/client/state/upgrade.go) | schema 升级 |
| [helper/raftutil/state.go](file:///d:/claude/nomad/helper/raftutil/state.go) | Raft 状态读取 |
| [helper/raftutil/migrate.go](file:///d:/claude/nomad/helper/raftutil/migrate.go) | 迁移源端 |
| [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | Raft 集成 |

#### 使用 `github.com/hashicorp/raft-boltdb/v2` 的文件

| 文件 | 用途 |
|------|------|
| [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | Raft 日志存储创建 |
| [helper/raftutil/state.go](file:///d:/claude/nomad/helper/raftutil/state.go) | 只读打开 BoltStore |
| [helper/raftutil/migrate.go](file:///d:/claude/nomad/helper/raftutil/migrate.go) | 迁移源端 |
| [helper/raftutil/migrate_test_helpers.go](file:///d:/claude/nomad/helper/raftutil/migrate_test_helpers.go) | 测试辅助 |
| [helper/raftutil/state_test.go](file:///d:/claude/nomad/helper/raftutil/state_test.go) | state 测试 |
| [helper/raftutil/migrate_test.go](file:///d:/claude/nomad/helper/raftutil/migrate_test.go) | 迁移测试 |

---

## 附录 A：bbolt 关键 API 使用汇总

Nomad 代码中使用的 bbolt API：

| API | 使用位置 | 说明 |
|-----|----------|------|
| `bbolt.Open(path, mode, opts)` | boltdd.go#L55, db_bolt.go#L200 (间接) | 打开/创建数据库 |
| `bbolt.DB.Update(fn)` | boltdd.go#L141 | 读写事务 |
| `bbolt.DB.Batch(fn)` | boltdd.go#L148 | 批量读写事务 |
| `bbolt.DB.View(fn)` | boltdd.go#L155 | 只读事务 |
| `bbolt.DB.Close()` | boltdd.go#L173 | 关闭数据库 |
| `bbolt.Tx.Bucket(name)` | boltdd.go#L72 | 获取 bucket |
| `bbolt.Tx.CreateBucket(name)` | boltdd.go#L94 | 创建 bucket |
| `bbolt.Tx.CreateBucketIfNotExists(name)` | boltdd.go#L117 | 获取或创建 bucket |
| `bbolt.Tx.Writable()` | boltdd.go#L210 | 事务是否可写 |
| `bbolt.Bucket.Put(key, val)` | boltdd.go#L331 | 写入 key-value |
| `bbolt.Bucket.Get(key)` | boltdd.go#L346 | 读取 value |
| `bbolt.Bucket.Delete(key)` | boltdd.go#L396 | 删除 key |
| `bbolt.Bucket.Bucket(name)` | boltdd.go#L405 | 获取子 bucket |
| `bbolt.Bucket.CreateBucket(name)` | boltdd.go#L419 | 创建子 bucket |
| `bbolt.Bucket.CreateBucketIfNotExists(name)` | boltdd.go#L432 | 获取或创建子 bucket |
| `bbolt.Bucket.DeleteBucket(name)` | boltdd.go#L446 | 删除子 bucket |
| `bbolt.Bucket.Cursor()` | boltdd.go#L365 | 获取游标 |
| `bbolt.Bucket.ForEach(fn)` | db_bolt.go#L1130 | 遍历所有 key |
| `bbolt.Cursor.Seek(prefix)` | boltdd.go#L366 | 定位到前缀 |
| `bbolt.Cursor.First()` | upgrade.go#L107 | 第一个 key |
| `bbolt.Cursor.Next()` | boltdd.go#L366, upgrade.go#L107 | 下一个 key |
| `bbolt.Cursor.Delete()` | upgrade.go#L113 | 删除当前 key |
| `bbolt.Tx.WriteTo(w)` | upgrade.go#L77 | 事务写入流（备份） |
| `bbolt.Options{Timeout, ReadOnly, NoFreelistSync}` | 多处 | 打开选项 |
| `bbolt.ErrDatabaseNotOpen` | boltdd.go#L105, L128 | 错误：数据库未打开 |
| `bbolt.ErrTimeout` | db_bolt.go#L201 | 错误：打开超时 |
| `bbolt.ErrBucketNotFound` | boltdd.go#L447 | 错误：bucket 未找到 |

## 附录 B：raft-boltdb 关键 API 使用汇总

| API | 使用位置 | 说明 |
|-----|----------|------|
| `raftboltdb.New(opts)` | server.go#L1468, state.go#L59, migrate.go#L77 | 创建 BoltStore |
| `raftboltdb.NewBoltStore(path)` | migrate_test_helpers.go#L25, state_test.go#L26, migrate_test.go#L152 | 便捷创建（测试用） |
| `raftboltdb.Options{Path, NoSync, BoltOptions, MsgpackUseNewTimeFormat}` | 多处 | 配置选项 |
| `BoltStore.Close()` | state.go（通过 RaftStore 接口） | 关闭 |
| `BoltStore.FirstIndex()` | state.go#L67, server.go#L1661 | 首个日志索引 |
| `BoltStore.LastIndex()` | state.go#L72, server.go#L1667 | 最后日志索引 |
| `BoltStore.GetLog(index, *log)` | state.go#L119 | 获取日志条目 |
| `BoltStore.StoreLogs(logs)` | migrate_test_helpers.go#L29 | 存储日志（测试） |
| `BoltStore.Set(key, val)` | migrate_test_helpers.go#L41, L45 | 设置稳定存储字节值 |
| `BoltStore.SetUint64(key, val)` | migrate_test_helpers.go#L35, L48 | 设置稳定存储 uint64 |
| `BoltStore.Get(key)` | migrate.go#L302 | 获取稳定存储字节值 |
| `BoltStore.GetUint64(key)` | migrate.go#L284 | 获取稳定存储 uint64 |
| `BoltStore.Stats()` | server.go#L1677 | 获取 bbolt 统计信息 |
| `BoltStore.RunMetrics(ctx, interval)` | server.go#L1483 | 启动指标发布 |

---

> 本文档基于 Nomad 源码分析生成，覆盖所有使用 BoltDB（bbolt 和 raft-boltdb）的源文件、函数签名、参数说明、Bucket 结构、调用链和测试文件。
