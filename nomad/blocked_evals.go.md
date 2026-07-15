# blocked_evals.go 代码说明文档

> 文件路径：[nomad/blocked_evals.go](file:///d:/claude/nomad/nomad/blocked_evals.go)
> 总行数：875 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad 核心包**（`nomad/`），实现 Server/Client 核心功能，包括 Raft 共识、状态管理、调度系统、RPC 处理等。当前文件 `blocked_evals.go` 提供相关功能实现。

## 2. 类型定义

### BlockedEvals

**定义位置**：[L35](file:///d:/claude/nomad/nomad/blocked_evals.go#L35)

**中文说明**：BlockedEvals 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型**：struct

```go
type BlockedEvals struct {
	logger hclog.Logger
	evalBroker *EvalBroker
	enabled bool
	flushLock sync.RWMutex
	stats *BlockedStats
	l sync.RWMutex
	captured map[string]wrappedEval
	escaped map[string]wrappedEval
	system *systemEvals
	capacityChangeCh chan *capacityUpdate
	jobs map[structs.NamespacedID]string
	unblockIndexes map[string]unblockEvent
	unblockIndexesLock sync.RWMutex
	duplicates []*structs.Evaluation
	duplicateCh chan struct{...}
	stopCh chan struct{...}
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `evalBroker` | `*EvalBroker` | 评估代理器，管理待处理的评估 |
| `enabled` | `bool` | 是否启用 |
| `flushLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |
| `stats` | `*BlockedStats` | — |
| `l` | `sync.RWMutex` | 读写锁，保护并发访问 |
| `captured` | `map[string]wrappedEval` | 映射表 |
| `escaped` | `map[string]wrappedEval` | 映射表 |
| `system` | `*systemEvals` | — |
| `capacityChangeCh` | `chan *capacityUpdate` | 通道 |
| `jobs` | `map[structs.NamespacedID]string` | 映射表 |
| `unblockIndexes` | `map[string]unblockEvent` | 映射表 |
| `unblockIndexesLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |
| `duplicates` | `[]*structs.Evaluation` | 列表 |
| `duplicateCh` | `chan struct{...}` | 信号通道 |
| `stopCh` | `chan struct{...}` | 信号通道 |

**关联方法**（22 个）：`Enabled`, `SetEnabled`, `Block`, `Reblock`, `processBlock`, `processBlockJobDuplicate`, `missedUnblock`, `Untrack`, `untrackImpl`, `Unblock`, `UnblockQuota`, `UnblockClassAndQuota`, `UnblockNode`, `watchCapacity`, `unblock`, `UnblockFailed`, `GetDuplicates`, `Flush`, `EmitStats`, `prune`, `pruneUnblockIndexes`, `pruneStats`

### unblockEvent

**定义位置**：[L98](file:///d:/claude/nomad/nomad/blocked_evals.go#L98)

**中文说明**：unblockEvent 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type unblockEvent struct {
	index uint64
	timestamp time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `index` | `uint64` | 索引 |
| `timestamp` | `time.Time` | 时间戳 |

### capacityUpdate

**定义位置**：[L104](file:///d:/claude/nomad/nomad/blocked_evals.go#L104)

**中文说明**：capacityUpdate 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type capacityUpdate struct {
	computedClass string
	quotaChange string
	nodeID string
	blockedEval *structs.Evaluation
	blockToken string
	untrackJobID structs.NamespacedID
	future chan struct{...}
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `computedClass` | `string` | 字符串 |
| `quotaChange` | `string` | 字符串 |
| `nodeID` | `string` | 字符串 |
| `blockedEval` | `*structs.Evaluation` | — |
| `blockToken` | `string` | 字符串 |
| `untrackJobID` | `structs.NamespacedID` | — |
| `future` | `chan struct{...}` | 信号通道 |

### wrappedEval

**定义位置**：[L120](file:///d:/claude/nomad/nomad/blocked_evals.go#L120)

**中文说明**：wrappedEval 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型**：struct

```go
type wrappedEval struct {
	eval *structs.Evaluation
	token string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `eval` | `*structs.Evaluation` | — |
| `token` | `string` | 令牌，用于认证或标识 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `unblockBuffer` | `—` | `8096` | — |
| `pruneInterval` | `—` | `5 * time.Minute` | — |
| `pruneThreshold` | `—` | `15 * time.Minute` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewBlockedEvals` | - | `evalBroker *EvalBroker, logger hclog.Logger` | `*BlockedEvals` | [L127](file:///d:/claude/nomad/nomad/blocked_evals.go#L127) |
| `Enabled` | `b *BlockedEvals` | `` | `bool` | [L144](file:///d:/claude/nomad/nomad/blocked_evals.go#L144) |
| `SetEnabled` | `b *BlockedEvals` | `enabled bool` | `` | [L152](file:///d:/claude/nomad/nomad/blocked_evals.go#L152) |
| `Block` | `b *BlockedEvals` | `eval *structs.Evaluation` | `chan struct{...}` | [L176](file:///d:/claude/nomad/nomad/blocked_evals.go#L176) |
| `Reblock` | `b *BlockedEvals` | `eval *structs.Evaluation, token string` | `chan struct{...}` | [L202](file:///d:/claude/nomad/nomad/blocked_evals.go#L202) |
| `processBlock` | `b *BlockedEvals` | `eval *structs.Evaluation, token string` | `` | [L227](file:///d:/claude/nomad/nomad/blocked_evals.go#L227) |
| `processBlockJobDuplicate` | `b *BlockedEvals` | `eval *structs.Evaluation` | `newCancelled bool` | [L296](file:///d:/claude/nomad/nomad/blocked_evals.go#L296) |
| `latestEvalIndex` | - | `eval *structs.Evaluation` | `uint64` | [L344](file:///d:/claude/nomad/nomad/blocked_evals.go#L344) |
| `missedUnblock` | `b *BlockedEvals` | `eval *structs.Evaluation` | `bool` | [L357](file:///d:/claude/nomad/nomad/blocked_evals.go#L357) |
| `Untrack` | `b *BlockedEvals` | `jobID string, namespace string` | `chan struct{...}` | [L413](file:///d:/claude/nomad/nomad/blocked_evals.go#L413) |
| `untrackImpl` | `b *BlockedEvals` | `nsID structs.NamespacedID` | `` | [L436](file:///d:/claude/nomad/nomad/blocked_evals.go#L436) |
| `Unblock` | `b *BlockedEvals` | `computedClass string, index uint64` | `chan struct{...}` | [L478](file:///d:/claude/nomad/nomad/blocked_evals.go#L478) |
| `UnblockQuota` | `b *BlockedEvals` | `quota string, index uint64` | `chan struct{...}` | [L508](file:///d:/claude/nomad/nomad/blocked_evals.go#L508) |
| `UnblockClassAndQuota` | `b *BlockedEvals` | `class string, quota string, index uint64` | `chan struct{...}` | [L544](file:///d:/claude/nomad/nomad/blocked_evals.go#L544) |
| `UnblockNode` | `b *BlockedEvals` | `nodeID string` | `chan struct{...}` | [L578](file:///d:/claude/nomad/nomad/blocked_evals.go#L578) |
| `watchCapacity` | `b *BlockedEvals` | `stopCh <-chan struct{...}, changeCh <-chan *capacityUpdate` | `` | [L605](file:///d:/claude/nomad/nomad/blocked_evals.go#L605) |
| `unblock` | `b *BlockedEvals` | `computedClass string, quota string, nodeID string` | `` | [L631](file:///d:/claude/nomad/nomad/blocked_evals.go#L631) |
| `UnblockFailed` | `b *BlockedEvals` | `` | `` | [L706](file:///d:/claude/nomad/nomad/blocked_evals.go#L706) |
| `GetDuplicates` | `b *BlockedEvals` | `timeout time.Duration` | `[]*structs.Evaluation` | [L743](file:///d:/claude/nomad/nomad/blocked_evals.go#L743) |
| `Flush` | `b *BlockedEvals` | `` | `` | [L779](file:///d:/claude/nomad/nomad/blocked_evals.go#L779) |
| `EmitStats` | `b *BlockedEvals` | `period time.Duration, stopCh <-chan struct{...}` | `` | [L802](file:///d:/claude/nomad/nomad/blocked_evals.go#L802) |
| `prune` | `b *BlockedEvals` | `stopCh <-chan struct{...}` | `` | [L842](file:///d:/claude/nomad/nomad/blocked_evals.go#L842) |
| `pruneUnblockIndexes` | `b *BlockedEvals` | `cutoff time.Time` | `` | [L860](file:///d:/claude/nomad/nomad/blocked_evals.go#L860) |
| `pruneStats` | `b *BlockedEvals` | `cutoff time.Time` | `` | [L872](file:///d:/claude/nomad/nomad/blocked_evals.go#L872) |

## 5. 核心方法详解

### NewBlockedEvals()

**签名**：`func NewBlockedEvals(evalBroker *EvalBroker, logger hclog.Logger) *BlockedEvals`

**位置**：[L127](file:///d:/claude/nomad/nomad/blocked_evals.go#L127)

**中文说明**：创建并返回一个新的 BlockedEvals 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `evalBroker` | `*EvalBroker` | 评估代理器，管理待处理的评估 |
| `logger` | `hclog.Logger` | 日志记录器 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*BlockedEvals` | — |

### Block()

**签名**：`func (b *BlockedEvals) Block(eval *structs.Evaluation) chan struct{...}`

**位置**：[L176](file:///d:/claude/nomad/nomad/blocked_evals.go#L176)

**中文说明**：阻塞对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `eval` | `*structs.Evaluation` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `chan struct{...}` | 信号通道 |

### Flush()

**签名**：`func (b *BlockedEvals) Flush() `

**位置**：[L779](file:///d:/claude/nomad/nomad/blocked_evals.go#L779)

**中文说明**：刷新对象，清空缓存数据。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [blocked_evals_test.go](file:///d:/claude/nomad/nomad/blocked_evals_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/acl.go) | 同目录源文件 |
| [acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/nomad/alloc_endpoint.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | 同目录源文件 |
| [autopilot_ce.go](file:///d:/claude/nomad/nomad/autopilot_ce.go) | 同目录源文件 |

