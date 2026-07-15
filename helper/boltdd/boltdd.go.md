# boltdd.go 代码说明文档

> 文件路径：[boltdd/boltdd.go](file:///d:/claude/nomad/helper/boltdd/boltdd.go)
> 总行数：461 行
> 所属包：`boltdd`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **BoltDB 数据目录子包**（`helper/boltdd`），封装 BoltDB 的数据目录操作，支持隔离的数据存储。

## 2. 类型定义

### ErrNotFound

**定义位置**：[L21](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L21)

**类型**：struct

```go
	name string
```

**关联方法**（1 个）：`Error`

### DB

**定义位置**：[L45](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L45)

**类型**：struct

```go
	rootBuckets map[string]*bucketMeta
	rootBucketsLock sync.Mutex
	boltDB *bbolt.DB
```

**关联方法**（9 个）：`bucket`, `createBucket`, `createBucketIfNotExists`, `Update`, `Batch`, `View`, `isClosed`, `Close`, `BoltDB`

### Tx

**定义位置**：[L181](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L181)

**类型**：struct

```go
	db *DB
	btx *bbolt.Tx
```

**关联方法**（5 个）：`Bucket`, `CreateBucket`, `CreateBucketIfNotExists`, `Writable`, `BoltTx`

### bucketMeta

**定义位置**：[L220](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L220)

**类型**：struct

```go
	hashes map[string][]byte
	hashesLock sync.Mutex
	buckets map[string]*bucketMeta
	bucketsLock sync.Mutex
```

**关联方法**（6 个）：`getHash`, `setHash`, `delHash`, `createBucket`, `deleteBucket`, `getOrCreateBucket`

### Bucket

**定义位置**：[L294](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L294)

**类型**：struct

```go
	bm *bucketMeta
	boltBucket *bbolt.Bucket
```

**关联方法**（9 个）：`Put`, `Get`, `DeletePrefix`, `Delete`, `Bucket`, `CreateBucket`, `CreateBucketIfNotExists`, `DeleteBucket`, `BoltBucket`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Error` | `e *ErrNotFound` | - | `string` | [L25](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L25) |
| `NotFound` | - | `name string` | `error` | [L30](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L30) |
| `IsErrNotFound` | - | `e error` | `bool` | [L35](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L35) |
| `Open` | - | `path string, mode os.FileMode, options *bbolt.Options` | `*DB, error` | [L54](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L54) |
| `New` | - | `bdb *bbolt.DB` | `*DB` | [L64](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L64) |
| `bucket` | `db *DB` | `btx *bbolt.Tx, name []byte` | `*Bucket` | [L71](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L71) |
| `createBucket` | `db *DB` | `btx *bbolt.Tx, name []byte` | `*Bucket, error` | [L93](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L93) |
| `createBucketIfNotExists` | `db *DB` | `btx *bbolt.Tx, name []byte` | `*Bucket, error` | [L116](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L116) |
| `Update` | `db *DB` | `fn func(...)` | `error` | [L140](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L140) |
| `Batch` | `db *DB` | `fn func(...)` | `error` | [L147](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L147) |
| `View` | `db *DB` | `fn func(...)` | `error` | [L154](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L154) |
| `isClosed` | `db *DB` | - | `bool` | [L163](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L163) |
| `Close` | `db *DB` | - | `error` | [L169](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L169) |
| `BoltDB` | `db *DB` | - | `*bbolt.DB` | [L177](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L177) |
| `newTx` | - | `db *DB, btx *bbolt.Tx` | `*Tx` | [L186](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L186) |
| `Bucket` | `tx *Tx` | `name []byte` | `*Bucket` | [L194](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L194) |
| `CreateBucket` | `tx *Tx` | `name []byte` | `*Bucket, error` | [L198](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L198) |
| `CreateBucketIfNotExists` | `tx *Tx` | `name []byte` | `*Bucket, error` | [L204](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L204) |
| `Writable` | `tx *Tx` | - | `bool` | [L209](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L209) |
| `BoltTx` | `tx *Tx` | - | `*bbolt.Tx` | [L214](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L214) |
| `newBucketMeta` | - | - | `*bucketMeta` | [L230](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L230) |
| `getHash` | `bm *bucketMeta` | `hashKey string` | `[]byte` | [L238](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L238) |
| `setHash` | `bm *bucketMeta` | `hashKey string, hashVal []byte` | - | [L246](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L246) |
| `delHash` | `bm *bucketMeta` | `hashKey string` | - | [L253](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L253) |
| `createBucket` | `bm *bucketMeta` | `name []byte` | `*bucketMeta` | [L261](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L261) |
| `deleteBucket` | `bm *bucketMeta` | `name []byte` | - | [L274](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L274) |
| `getOrCreateBucket` | `bm *bucketMeta` | `name []byte` | `*bucketMeta` | [L282](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L282) |
| `newBucket` | - | `b *bucketMeta, bb *bbolt.Bucket` | `*Bucket` | [L301](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L301) |
| `Put` | `b *Bucket` | `key []byte, val interface{}` | `error` | [L309](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L309) |
| `Get` | `b *Bucket` | `key []byte, obj interface{}` | `error` | [L344](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L344) |
| `Iterate` | - | `b *Bucket, prefix []byte, fn func(...)` | `error` | [L364](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L364) |
| `DeletePrefix` | `b *Bucket` | `prefix []byte` | `error` | [L381](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L381) |
| `Delete` | `b *Bucket` | `key []byte` | `error` | [L395](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L395) |
| `Bucket` | `b *Bucket` | `name []byte` | `*Bucket` | [L404](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L404) |
| `CreateBucket` | `b *Bucket` | `name []byte` | `*Bucket, error` | [L418](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L418) |
| `CreateBucketIfNotExists` | `b *Bucket` | `name []byte` | `*Bucket, error` | [L431](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L431) |
| `DeleteBucket` | `b *Bucket` | `name []byte` | `error` | [L444](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L444) |
| `BoltBucket` | `b *Bucket` | - | `*bbolt.Bucket` | [L458](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L458) |

## 5. 核心方法详解

### Open()

**签名**：`func Open(path string, mode os.FileMode, options *bbolt.Options) *DB, error`

**位置**：[L54](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L54)

### New()

**签名**：`func New(bdb *bbolt.DB) *DB`

**位置**：[L64](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L64)

### Update()

**签名**：`func (db *DB) Update(fn func(...)) error`

**位置**：[L140](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L140)

### Close()

**签名**：`func (db *DB) Close() error`

**位置**：[L169](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L169)

### Get()

**签名**：`func (b *Bucket) Get(key []byte, obj interface{}) error`

**位置**：[L344](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L344)

### Delete()

**签名**：`func (b *Bucket) Delete(key []byte) error`

**位置**：[L395](file:///d:/claude/nomad/helper/boltdd/boltdd.go#L395)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `fmt` | 标准库 |
| `go.etcd.io/bbolt` | 标准库 |
| `os` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-msgpack/v2/codec` | 第三方库 |
| `golang.org/x/crypto/blake2b` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [boltdd_test.go](file:///d:/claude/nomad/helper/boltdd/boltdd_test.go) | 对应测试文件 |

