# plan_apply_node_tracker.go 代码说明文档

> 文件路径：[nomad/plan_apply_node_tracker.go](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go)
> 总行数：214 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad 核心包**（`nomad/`），实现 Server/Client 核心功能，包括 Raft 共识、状态管理、调度系统、RPC 处理等。当前文件 `plan_apply_node_tracker.go` 提供相关功能实现。

## 2. 类型定义

### BadNodeTracker

**定义位置**：[L17](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L17)

**中文说明**：BadNodeTracker 是一个跟踪器，记录和跟踪特定对象的状态信息。

**类型**：interface

```go
type BadNodeTracker interface {
	Add func(...)
	EmitStats func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Add` | `func(...)` | — |
| `EmitStats` | `func(...)` | 发送Stats相关的事件或指标。 |

### NoopBadNodeTracker

**定义位置**：[L24](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L24)

**中文说明**：NoopBadNodeTracker 是一个跟踪器，记录和跟踪特定对象的状态信息。

**类型**：struct

**关联方法**（2 个）：`EmitStats`, `Add`

### CachedBadNodeTracker

**定义位置**：[L40](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L40)

**中文说明**：CachedBadNodeTracker 是一个跟踪器，记录和跟踪特定对象的状态信息。

**类型**：struct

```go
type CachedBadNodeTracker struct {
	logger hclog.Logger
	cache *lru.TwoQueueCache[string, *badNodeStats]
	limiter *rate.Limiter
	window time.Duration
	threshold int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `cache` | `*lru.TwoQueueCache[string, *badNodeStats]` | 字符串 |
| `limiter` | `*rate.Limiter` | — |
| `window` | `time.Duration` | 时间间隔 |
| `threshold` | `int` | — |

**关联方法**（4 个）：`Add`, `EmitStats`, `isBad`, `emitStats`

### CachedBadNodeTrackerConfig

**定义位置**：[L48](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L48)

**中文说明**：CachedBadNodeTrackerConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type CachedBadNodeTrackerConfig struct {
	CacheSize int
	RateLimit float64
	BurstSize int
	Window time.Duration
	Threshold int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CacheSize` | `int` | — |
| `RateLimit` | `float64` | — |
| `BurstSize` | `int` | — |
| `Window` | `time.Duration` | 时间间隔 |
| `Threshold` | `int` | — |

### badNodeStats

**定义位置**：[L164](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L164)

**中文说明**：badNodeStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type badNodeStats struct {
	id string
	history []time.Time
	window time.Duration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `id` | `string` | 唯一标识符 |
| `history` | `[]time.Time` | 时间点 |
| `window` | `time.Duration` | 时间间隔 |

**关联方法**（3 个）：`score`, `record`, `countActive`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `EmitStats` | `n *NoopBadNodeTracker` | `time.Duration, <-chan struct{...}` | `` | [L26](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L26) |
| `Add` | `n *NoopBadNodeTracker` | `string` | `bool` | [L27](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L27) |
| `DefaultCachedBadNodeTrackerConfig` | - | `` | `CachedBadNodeTrackerConfig` | [L56](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L56) |
| `NewCachedBadNodeTracker` | - | `logger hclog.Logger, config CachedBadNodeTrackerConfig` | `*CachedBadNodeTracker, error` | [L73](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L73) |
| `Add` | `c *CachedBadNodeTracker` | `nodeID string` | `bool` | [L98](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L98) |
| `EmitStats` | `c *CachedBadNodeTracker` | `period time.Duration, stopCh <-chan struct{...}` | `` | [L113](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L113) |
| `isBad` | `c *CachedBadNodeTracker` | `t time.Time, stats *badNodeStats` | `bool` | [L131](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L131) |
| `emitStats` | `c *CachedBadNodeTracker` | `` | `` | [L150](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L150) |
| `newBadNodeStats` | - | `id string, window time.Duration` | `*badNodeStats` | [L171](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L171) |
| `score` | `s *badNodeStats` | `t time.Time` | `int` | [L179](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L179) |
| `record` | `s *badNodeStats` | `t time.Time` | `` | [L191](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L191) |
| `countActive` | `s *badNodeStats` | `t time.Time` | `int, int` | [L197](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L197) |

## 5. 核心方法详解

### NewCachedBadNodeTracker()

**签名**：`func NewCachedBadNodeTracker(logger hclog.Logger, config CachedBadNodeTrackerConfig) *CachedBadNodeTracker, error`

**位置**：[L73](file:///d:/claude/nomad/nomad/plan_apply_node_tracker.go#L73)

**中文说明**：创建并返回一个新的 CachedBadNodeTracker 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `config` | `CachedBadNodeTrackerConfig` | 配置 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*CachedBadNodeTracker` | — |
| `error` | 错误信息 |

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
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标
- **缓存模式**：实现缓存机制，减少重复计算或 I/O 操作
- **后台协程**：启动 goroutine 执行后台任务
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [plan_apply_node_tracker_test.go](file:///d:/claude/nomad/nomad/plan_apply_node_tracker_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/acl.go) | 同目录源文件 |
| [acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/nomad/alloc_endpoint.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | 同目录源文件 |
| [autopilot_ce.go](file:///d:/claude/nomad/nomad/autopilot_ce.go) | 同目录源文件 |

