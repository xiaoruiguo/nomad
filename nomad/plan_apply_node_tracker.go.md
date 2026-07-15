# plan_apply_node_tracker.go 代码说明文档

> 文件路径：[plan_apply_node_tracker.go](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go)
> 总行数：214 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **计划应用节点追踪器**，追踪计划应用过程中节点状态的变化，防止并发冲突。

## 2. 类型定义

### BadNodeTracker

**定义位置**：[L17](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L17)

**类型**：interface

```go
	Add
	EmitStats
```

### NoopBadNodeTracker

**定义位置**：[L24](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L24)

**类型**：struct

**关联方法**（2 个）：`EmitStats`, `Add`

### CachedBadNodeTracker

**定义位置**：[L40](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L40)

**类型**：struct

```go
	logger hclog.Logger
	cache *lru.TwoQueueCache[string, *badNodeStats]
	limiter *rate.Limiter
	window time.Duration
	threshold int
```

**关联方法**（4 个）：`Add`, `EmitStats`, `isBad`, `emitStats`

### CachedBadNodeTrackerConfig

**定义位置**：[L48](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L48)

**类型**：struct

```go
	CacheSize int
	RateLimit float64
	BurstSize int
	Window time.Duration
	Threshold int
```

### badNodeStats

**定义位置**：[L164](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L164)

**类型**：struct

```go
	id string
	history []time.Time
	window time.Duration
```

**关联方法**（3 个）：`score`, `record`, `countActive`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `EmitStats` | `n *NoopBadNodeTracker` | `time.Duration, chan struct{...}` | - | [L26](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L26) |
| `Add` | `n *NoopBadNodeTracker` | `string` | `bool` | [L27](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L27) |
| `DefaultCachedBadNodeTrackerConfig` | - | - | `CachedBadNodeTrackerConfig` | [L56](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L56) |
| `NewCachedBadNodeTracker` | - | `logger hclog.Logger, config CachedBadNodeTrackerConfig` | `*CachedBadNodeTracker, error` | [L73](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L73) |
| `Add` | `c *CachedBadNodeTracker` | `nodeID string` | `bool` | [L98](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L98) |
| `EmitStats` | `c *CachedBadNodeTracker` | `period time.Duration, stopCh chan struct{...}` | - | [L113](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L113) |
| `isBad` | `c *CachedBadNodeTracker` | `t time.Time, stats *badNodeStats` | `bool` | [L131](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L131) |
| `emitStats` | `c *CachedBadNodeTracker` | - | - | [L150](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L150) |
| `newBadNodeStats` | - | `id string, window time.Duration` | `*badNodeStats` | [L171](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L171) |
| `score` | `s *badNodeStats` | `t time.Time` | `int` | [L179](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L179) |
| `record` | `s *badNodeStats` | `t time.Time` | - | [L191](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L191) |
| `countActive` | `s *badNodeStats` | `t time.Time` | `int, int` | [L197](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L197) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/golang-lru/v2` | 第三方库 |
| `golang.org/x/time/rate` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [plan_apply_node_tracker_test.go](file:///d:/claude/nomad/nomad/plan_apply_node_tracker_test.go) | 对应测试文件 |

