# blocked_evals.go 代码说明文档

> 文件路径：[blocked_evals.go](file:///d:/claude/nomad/nomad/blocked_evals.go)
> 总行数：875 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **阻塞评估管理器**，管理因资源不足而阻塞的评估，在节点资源变化时重新调度。

## 2. 类型定义

### BlockedEvals

**定义位置**：[L35](file:///d:/claude/nomad/nomad/blocked_evals.go#L35)

**类型**：struct

```go
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
```

**关联方法**（22 个）：`Enabled`, `SetEnabled`, `Block`, `Reblock`, `processBlock`, `processBlockJobDuplicate`, `missedUnblock`, `Untrack`, `untrackImpl`, `Unblock`, `UnblockQuota`, `UnblockClassAndQuota`, `UnblockNode`, `watchCapacity`, `unblock`, `UnblockFailed`, `GetDuplicates`, `Flush`, `EmitStats`, `prune`, `pruneUnblockIndexes`, `pruneStats`

### unblockEvent

**定义位置**：[L98](file:///d:/claude/nomad/nomad/blocked_evals.go#L98)

**类型**：struct

```go
	index uint64
	timestamp time.Time
```

### capacityUpdate

**定义位置**：[L104](file:///d:/claude/nomad/nomad/blocked_evals.go#L104)

**类型**：struct

```go
	computedClass string
	quotaChange string
	nodeID string
	blockedEval *structs.Evaluation
	blockToken string
	untrackJobID structs.NamespacedID
	future chan struct{...}
```

### wrappedEval

**定义位置**：[L120](file:///d:/claude/nomad/nomad/blocked_evals.go#L120)

**类型**：struct

```go
	eval *structs.Evaluation
	token string
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `unblockBuffer` | `8096` |
| `pruneInterval` | `5 * time.Minute` |
| `pruneThreshold` | `15 * time.Minute` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewBlockedEvals` | - | `evalBroker *EvalBroker, logger hclog.Logger` | `*BlockedEvals` | [L127](file:///d:/claude/nomad/nomad/blocked_evals.go#L127) |
| `Enabled` | `b *BlockedEvals` | - | `bool` | [L144](file:///d:/claude/nomad/nomad/blocked_evals.go#L144) |
| `SetEnabled` | `b *BlockedEvals` | `enabled bool` | - | [L152](file:///d:/claude/nomad/nomad/blocked_evals.go#L152) |
| `Block` | `b *BlockedEvals` | `eval *structs.Evaluation` | `chan struct{...}` | [L176](file:///d:/claude/nomad/nomad/blocked_evals.go#L176) |
| `Reblock` | `b *BlockedEvals` | `eval *structs.Evaluation, token string` | `chan struct{...}` | [L202](file:///d:/claude/nomad/nomad/blocked_evals.go#L202) |
| `processBlock` | `b *BlockedEvals` | `eval *structs.Evaluation, token string` | - | [L227](file:///d:/claude/nomad/nomad/blocked_evals.go#L227) |
| `processBlockJobDuplicate` | `b *BlockedEvals` | `eval *structs.Evaluation` | `newCancelled bool` | [L296](file:///d:/claude/nomad/nomad/blocked_evals.go#L296) |
| `latestEvalIndex` | - | `eval *structs.Evaluation` | `uint64` | [L344](file:///d:/claude/nomad/nomad/blocked_evals.go#L344) |
| `missedUnblock` | `b *BlockedEvals` | `eval *structs.Evaluation` | `bool` | [L357](file:///d:/claude/nomad/nomad/blocked_evals.go#L357) |
| `Untrack` | `b *BlockedEvals` | `jobID string, namespace string` | `chan struct{...}` | [L413](file:///d:/claude/nomad/nomad/blocked_evals.go#L413) |
| `untrackImpl` | `b *BlockedEvals` | `nsID structs.NamespacedID` | - | [L436](file:///d:/claude/nomad/nomad/blocked_evals.go#L436) |
| `Unblock` | `b *BlockedEvals` | `computedClass string, index uint64` | `chan struct{...}` | [L478](file:///d:/claude/nomad/nomad/blocked_evals.go#L478) |
| `UnblockQuota` | `b *BlockedEvals` | `quota string, index uint64` | `chan struct{...}` | [L508](file:///d:/claude/nomad/nomad/blocked_evals.go#L508) |
| `UnblockClassAndQuota` | `b *BlockedEvals` | `class string, quota string, index uint64` | `chan struct{...}` | [L544](file:///d:/claude/nomad/nomad/blocked_evals.go#L544) |
| `UnblockNode` | `b *BlockedEvals` | `nodeID string` | `chan struct{...}` | [L578](file:///d:/claude/nomad/nomad/blocked_evals.go#L578) |
| `watchCapacity` | `b *BlockedEvals` | `stopCh chan struct{...}, changeCh chan *capacityUpdate` | - | [L605](file:///d:/claude/nomad/nomad/blocked_evals.go#L605) |
| `unblock` | `b *BlockedEvals` | `computedClass string, quota string, nodeID string` | - | [L631](file:///d:/claude/nomad/nomad/blocked_evals.go#L631) |
| `UnblockFailed` | `b *BlockedEvals` | - | - | [L706](file:///d:/claude/nomad/nomad/blocked_evals.go#L706) |
| `GetDuplicates` | `b *BlockedEvals` | `timeout time.Duration` | `[]*structs.Evaluation` | [L743](file:///d:/claude/nomad/nomad/blocked_evals.go#L743) |
| `Flush` | `b *BlockedEvals` | - | - | [L779](file:///d:/claude/nomad/nomad/blocked_evals.go#L779) |
| `EmitStats` | `b *BlockedEvals` | `period time.Duration, stopCh chan struct{...}` | - | [L802](file:///d:/claude/nomad/nomad/blocked_evals.go#L802) |
| `prune` | `b *BlockedEvals` | `stopCh chan struct{...}` | - | [L842](file:///d:/claude/nomad/nomad/blocked_evals.go#L842) |
| `pruneUnblockIndexes` | `b *BlockedEvals` | `cutoff time.Time` | - | [L860](file:///d:/claude/nomad/nomad/blocked_evals.go#L860) |
| `pruneStats` | `b *BlockedEvals` | `cutoff time.Time` | - | [L872](file:///d:/claude/nomad/nomad/blocked_evals.go#L872) |

## 5. 核心方法详解

### GetDuplicates()

**签名**：`func (b *BlockedEvals) GetDuplicates(timeout time.Duration) []*structs.Evaluation`

**位置**：[L743](file:///d:/claude/nomad/nomad/blocked_evals.go#L743)

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
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [blocked_evals_test.go](file:///d:/claude/nomad/nomad/blocked_evals_test.go) | 对应测试文件 |

