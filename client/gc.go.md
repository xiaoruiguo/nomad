# gc.go 代码说明文档

> 文件路径：[client/gc.go](file:///d:/claude/nomad/client/gc.go)
> 总行数：350 行
> 所属包：`client`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad Client 核心包**（`client/`），实现客户端节点的主要功能，包括分配管理、任务执行、心跳上报和驱动调度。

## 2. 类型定义

### GCConfig

**定义位置**：[L23](file:///d:/claude/nomad/client/gc.go#L23)

**中文说明**：GCConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type GCConfig struct {
	MaxAllocs int
	DiskUsageThreshold float64
	InodeUsageThreshold float64
	Interval time.Duration
	ReservedDiskMB int
	ParallelDestroys int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MaxAllocs` | `int` | — |
| `DiskUsageThreshold` | `float64` | — |
| `InodeUsageThreshold` | `float64` | — |
| `Interval` | `time.Duration` | 时间间隔 |
| `ReservedDiskMB` | `int` | — |
| `ParallelDestroys` | `int` | — |

### AllocCounter

**定义位置**：[L36](file:///d:/claude/nomad/client/gc.go#L36)

**中文说明**：AllocCounter 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：interface

```go
type AllocCounter interface {
	NumAllocs func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `NumAllocs` | `func(...)` | — |

### AllocGarbageCollector

**定义位置**：[L41](file:///d:/claude/nomad/client/gc.go#L41)

**中文说明**：AllocGarbageCollector 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocGarbageCollector struct {
	config *GCConfig
	allocRunners *IndexedGCAllocPQ
	statsCollector hoststats.NodeStatsCollector
	allocCounter AllocCounter
	destroyCh chan struct{...}
	shutdownCh chan struct{...}
	triggerCh chan struct{...}
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `config` | `*GCConfig` | 配置 |
| `allocRunners` | `*IndexedGCAllocPQ` | — |
| `statsCollector` | `hoststats.NodeStatsCollector` | — |
| `allocCounter` | `AllocCounter` | — |
| `destroyCh` | `chan struct{...}` | 信号通道 |
| `shutdownCh` | `chan struct{...}` | 关闭信号通道，当收到关闭信号时触发清理流程 |
| `triggerCh` | `chan struct{...}` | 信号通道 |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（8 个）：`Run`, `Trigger`, `keepUsageBelowThreshold`, `destroyAllocRunner`, `Stop`, `Collect`, `CollectAll`, `MarkForCollection`

### GCAlloc

**定义位置**：[L242](file:///d:/claude/nomad/client/gc.go#L242)

**中文说明**：GCAlloc 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type GCAlloc struct {
	timeStamp time.Time
	allocID string
	allocRunner interfaces.AllocRunner
	index int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `timeStamp` | `time.Time` | 时间戳 |
| `allocID` | `string` | 字符串 |
| `allocRunner` | `interfaces.AllocRunner` | — |
| `index` | `int` | 索引 |

### GCAllocPQImpl

**定义位置**：[L249](file:///d:/claude/nomad/client/gc.go#L249)

**中文说明**：GCAllocPQImpl 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型定义**：`type GCAllocPQImpl []*GCAlloc`

**关联方法**（5 个）：`Len`, `Less`, `Swap`, `Push`, `Pop`

### IndexedGCAllocPQ

**定义位置**：[L283](file:///d:/claude/nomad/client/gc.go#L283)

**中文说明**：IndexedGCAllocPQ 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type IndexedGCAllocPQ struct {
	index map[string]*GCAlloc
	heap GCAllocPQImpl
	pqLock sync.Mutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `index` | `map[string]*GCAlloc` | 索引 |
| `heap` | `GCAllocPQImpl` | — |
| `pqLock` | `sync.Mutex` | 互斥锁，保护并发访问 |

**关联方法**（4 个）：`Push`, `Pop`, `Remove`, `Length`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `MB` | `—` | `1024 * 1024` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewAllocGarbageCollector` | - | `logger hclog.Logger, statsCollector hoststats.NodeStatsCollector, ac AllocCou...` | `*AllocGarbageCollector` | [L69](file:///d:/claude/nomad/client/gc.go#L69) |
| `Run` | `a *AllocGarbageCollector` | `` | `` | [L92](file:///d:/claude/nomad/client/gc.go#L92) |
| `Trigger` | `a *AllocGarbageCollector` | `` | `` | [L110](file:///d:/claude/nomad/client/gc.go#L110) |
| `keepUsageBelowThreshold` | `a *AllocGarbageCollector` | `` | `error` | [L120](file:///d:/claude/nomad/client/gc.go#L120) |
| `destroyAllocRunner` | `a *AllocGarbageCollector` | `allocID string, ar interfaces.AllocRunner, reason string` | `` | [L175](file:///d:/claude/nomad/client/gc.go#L175) |
| `Stop` | `a *AllocGarbageCollector` | `` | `` | [L198](file:///d:/claude/nomad/client/gc.go#L198) |
| `Collect` | `a *AllocGarbageCollector` | `allocID string` | `bool` | [L204](file:///d:/claude/nomad/client/gc.go#L204) |
| `CollectAll` | `a *AllocGarbageCollector` | `` | `` | [L216](file:///d:/claude/nomad/client/gc.go#L216) |
| `MarkForCollection` | `a *AllocGarbageCollector` | `allocID string, ar interfaces.AllocRunner` | `` | [L234](file:///d:/claude/nomad/client/gc.go#L234) |
| `Len` | `pq *GCAllocPQImpl` | `` | `int` | [L251](file:///d:/claude/nomad/client/gc.go#L251) |
| `Less` | `pq *GCAllocPQImpl` | `i int, j int` | `bool` | [L255](file:///d:/claude/nomad/client/gc.go#L255) |
| `Swap` | `pq *GCAllocPQImpl` | `i int, j int` | `` | [L259](file:///d:/claude/nomad/client/gc.go#L259) |
| `Push` | `pq *GCAllocPQImpl` | `x interface{}` | `` | [L265](file:///d:/claude/nomad/client/gc.go#L265) |
| `Pop` | `pq *GCAllocPQImpl` | `` | `interface{}` | [L272](file:///d:/claude/nomad/client/gc.go#L272) |
| `NewIndexedGCAllocPQ` | - | `` | `*IndexedGCAllocPQ` | [L290](file:///d:/claude/nomad/client/gc.go#L290) |
| `Push` | `i *IndexedGCAllocPQ` | `allocID string, ar interfaces.AllocRunner` | `bool` | [L299](file:///d:/claude/nomad/client/gc.go#L299) |
| `Pop` | `i *IndexedGCAllocPQ` | `` | `*GCAlloc` | [L317](file:///d:/claude/nomad/client/gc.go#L317) |
| `Remove` | `i *IndexedGCAllocPQ` | `allocID string` | `*GCAlloc` | [L331](file:///d:/claude/nomad/client/gc.go#L331) |
| `Length` | `i *IndexedGCAllocPQ` | `` | `int` | [L344](file:///d:/claude/nomad/client/gc.go#L344) |

## 5. 核心方法详解

### NewAllocGarbageCollector()

**签名**：`func NewAllocGarbageCollector(logger hclog.Logger, statsCollector hoststats.NodeStatsCollector, ac AllocCounter, config *GCConfig) *AllocGarbageCollector`

**位置**：[L69](file:///d:/claude/nomad/client/gc.go#L69)

**中文说明**：创建并返回一个新的 AllocGarbageCollector 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `statsCollector` | `hoststats.NodeStatsCollector` | — |
| `ac` | `AllocCounter` | — |
| `config` | `*GCConfig` | 配置 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*AllocGarbageCollector` | — |

### Run()

**签名**：`func (a *AllocGarbageCollector) Run() `

**位置**：[L92](file:///d:/claude/nomad/client/gc.go#L92)

**中文说明**：运行对象的主循环。

### Stop()

**签名**：`func (a *AllocGarbageCollector) Stop() `

**位置**：[L198](file:///d:/claude/nomad/client/gc.go#L198)

**中文说明**：停止对象。

### NewIndexedGCAllocPQ()

**签名**：`func NewIndexedGCAllocPQ() *IndexedGCAllocPQ`

**位置**：[L290](file:///d:/claude/nomad/client/gc.go#L290)

**中文说明**：创建并返回一个新的 IndexedGCAllocPQ 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*IndexedGCAllocPQ` | — |

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
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **后台协程**：启动 goroutine 执行后台任务
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [gc_test.go](file:///d:/claude/nomad/client/gc_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/client/acl.go) | 同目录源文件 |
| [agent_endpoint.go](file:///d:/claude/nomad/client/agent_endpoint.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/client/alloc_endpoint.go) | 同目录源文件 |
| [client.go](file:///d:/claude/nomad/client/client.go) | 同目录源文件 |
| [client_stats_endpoint.go](file:///d:/claude/nomad/client/client_stats_endpoint.go) | 同目录源文件 |

