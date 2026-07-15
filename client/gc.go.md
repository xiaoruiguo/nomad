# gc.go 代码说明文档

> 文件路径：[gc.go](file:///d:/claude/nomad/client/gc.go)
> 总行数：350 行
> 所属包：`client`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 Nomad Client 核心包（`client`），提供 Client 节点运行所需的功能。

## 2. 类型定义

### GCConfig

**定义位置**：[L23](file:///d:/claude/nomad/client/gc.go#L23)

**类型**：struct

```go
	MaxAllocs int
	DiskUsageThreshold float64
	InodeUsageThreshold float64
	Interval time.Duration
	ReservedDiskMB int
	ParallelDestroys int
```

### AllocCounter

**定义位置**：[L36](file:///d:/claude/nomad/client/gc.go#L36)

**类型**：interface

```go
	NumAllocs
```

### AllocGarbageCollector

**定义位置**：[L41](file:///d:/claude/nomad/client/gc.go#L41)

**类型**：struct

```go
	config *GCConfig
	allocRunners *IndexedGCAllocPQ
	statsCollector hoststats.NodeStatsCollector
	allocCounter AllocCounter
	destroyCh chan struct{...}
	shutdownCh chan struct{...}
	triggerCh chan struct{...}
	logger hclog.Logger
```

**关联方法**（8 个）：`Run`, `Trigger`, `keepUsageBelowThreshold`, `destroyAllocRunner`, `Stop`, `Collect`, `CollectAll`, `MarkForCollection`

### GCAlloc

**定义位置**：[L242](file:///d:/claude/nomad/client/gc.go#L242)

**类型**：struct

```go
	timeStamp time.Time
	allocID string
	allocRunner interfaces.AllocRunner
	index int
```

### GCAllocPQImpl

**定义位置**：[L249](file:///d:/claude/nomad/client/gc.go#L249)

**类型定义**：`[]*GCAlloc`

**关联方法**（5 个）：`Len`, `Less`, `Swap`, `Push`, `Pop`

### IndexedGCAllocPQ

**定义位置**：[L283](file:///d:/claude/nomad/client/gc.go#L283)

**类型**：struct

```go
	index map[string]*GCAlloc
	heap GCAllocPQImpl
	pqLock sync.Mutex
```

**关联方法**（4 个）：`Push`, `Pop`, `Remove`, `Length`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `MB` | `1024 * 1024` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewAllocGarbageCollector` | - | `logger hclog.Logger, statsCollector hoststats.NodeStatsCollector, ac AllocCo...` | `*AllocGarbageCollector` | [L69](file:///d:/claude/nomad/client/gc.go#L69) |
| `Run` | `a *AllocGarbageCollector` | - | - | [L92](file:///d:/claude/nomad/client/gc.go#L92) |
| `Trigger` | `a *AllocGarbageCollector` | - | - | [L110](file:///d:/claude/nomad/client/gc.go#L110) |
| `keepUsageBelowThreshold` | `a *AllocGarbageCollector` | - | `error` | [L120](file:///d:/claude/nomad/client/gc.go#L120) |
| `destroyAllocRunner` | `a *AllocGarbageCollector` | `allocID string, ar interfaces.AllocRunner, reason string` | - | [L175](file:///d:/claude/nomad/client/gc.go#L175) |
| `Stop` | `a *AllocGarbageCollector` | - | - | [L198](file:///d:/claude/nomad/client/gc.go#L198) |
| `Collect` | `a *AllocGarbageCollector` | `allocID string` | `bool` | [L204](file:///d:/claude/nomad/client/gc.go#L204) |
| `CollectAll` | `a *AllocGarbageCollector` | - | - | [L216](file:///d:/claude/nomad/client/gc.go#L216) |
| `MarkForCollection` | `a *AllocGarbageCollector` | `allocID string, ar interfaces.AllocRunner` | - | [L234](file:///d:/claude/nomad/client/gc.go#L234) |
| `Len` | `pq *GCAllocPQImpl` | - | `int` | [L251](file:///d:/claude/nomad/client/gc.go#L251) |
| `Less` | `pq *GCAllocPQImpl` | `i int, j int` | `bool` | [L255](file:///d:/claude/nomad/client/gc.go#L255) |
| `Swap` | `pq *GCAllocPQImpl` | `i int, j int` | - | [L259](file:///d:/claude/nomad/client/gc.go#L259) |
| `Push` | `pq *GCAllocPQImpl` | `x interface{}` | - | [L265](file:///d:/claude/nomad/client/gc.go#L265) |
| `Pop` | `pq *GCAllocPQImpl` | - | `interface{}` | [L272](file:///d:/claude/nomad/client/gc.go#L272) |
| `NewIndexedGCAllocPQ` | - | - | `*IndexedGCAllocPQ` | [L290](file:///d:/claude/nomad/client/gc.go#L290) |
| `Push` | `i *IndexedGCAllocPQ` | `allocID string, ar interfaces.AllocRunner` | `bool` | [L299](file:///d:/claude/nomad/client/gc.go#L299) |
| `Pop` | `i *IndexedGCAllocPQ` | - | `*GCAlloc` | [L317](file:///d:/claude/nomad/client/gc.go#L317) |
| `Remove` | `i *IndexedGCAllocPQ` | `allocID string` | `*GCAlloc` | [L331](file:///d:/claude/nomad/client/gc.go#L331) |
| `Length` | `i *IndexedGCAllocPQ` | - | `int` | [L344](file:///d:/claude/nomad/client/gc.go#L344) |

## 5. 核心方法详解

### Run()

**签名**：`func (a *AllocGarbageCollector) Run() `

**位置**：[L92](file:///d:/claude/nomad/client/gc.go#L92)

### Stop()

**签名**：`func (a *AllocGarbageCollector) Stop() `

**位置**：[L198](file:///d:/claude/nomad/client/gc.go#L198)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `container/heap` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/hoststats` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [gc_test.go](file:///d:/claude/nomad/client/gc_test.go) | 对应测试文件 |

