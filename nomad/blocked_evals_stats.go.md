# blocked_evals_stats.go 代码说明文档

> 文件路径：[nomad/blocked_evals_stats.go](file:///d:/claude/nomad/nomad/blocked_evals_stats.go)
> 总行数：300 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad 核心包**（`nomad/`），实现 Server/Client 核心功能，包括 Raft 共识、状态管理、调度系统、RPC 处理等。当前文件 `blocked_evals_stats.go` 提供相关功能实现。

## 2. 类型定义

### BlockedStats

**定义位置**：[L14](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L14)

**中文说明**：BlockedStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type BlockedStats struct {
	TotalEscaped int
	TotalBlocked int
	TotalQuotaLimit int
	BlockedResources *BlockedResourcesStats
	lock sync.RWMutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TotalEscaped` | `int` | — |
| `TotalBlocked` | `int` | — |
| `TotalQuotaLimit` | `int` | — |
| `BlockedResources` | `*BlockedResourcesStats` | — |
| `lock` | `sync.RWMutex` | 互斥锁，保护并发访问 |

**关联方法**（8 个）：`Reset`, `Block`, `Copy`, `Unblock`, `UnblockAll`, `unblockImpl`, `decrementEscaped`, `prune`

### classInDC

**定义位置**：[L34](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L34)

**中文说明**：classInDC 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type classInDC struct {
	dc string
	class string
	nodepool string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `dc` | `string` | 数据中心 |
| `class` | `string` | 字符串 |
| `nodepool` | `string` | 字符串 |

### BlockedResourcesStats

**定义位置**：[L215](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L215)

**中文说明**：BlockedResourcesStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type BlockedResourcesStats struct {
	ByJob map[structs.NamespacedID]BlockedResourcesSummary
	ByClassInDC map[classInDC]BlockedResourcesSummary
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ByJob` | `map[structs.NamespacedID]BlockedResourcesSummary` | 映射表 |
| `ByClassInDC` | `map[classInDC]BlockedResourcesSummary` | 映射表 |

**关联方法**（3 个）：`Copy`, `Add`, `Subtract`

### BlockedResourcesSummary

**定义位置**：[L270](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L270)

**中文说明**：BlockedResourcesSummary 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type BlockedResourcesSummary struct {
	Timestamp time.Time
	CPU int
	MemoryMB int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Timestamp` | `time.Time` | 时间戳 |
| `CPU` | `int` | — |
| `MemoryMB` | `int` | — |

**关联方法**（3 个）：`Add`, `Subtract`, `IsZero`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewBlockedStats` | - | `` | `*BlockedStats` | [L41](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L41) |
| `Reset` | `b *BlockedStats` | `` | `` | [L47](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L47) |
| `Block` | `b *BlockedStats` | `eval *structs.Evaluation` | `` | [L59](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L59) |
| `Copy` | `b *BlockedStats` | `` | `*BlockedStats` | [L82](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L82) |
| `Unblock` | `b *BlockedStats` | `eval *structs.Evaluation, escaped bool` | `` | [L97](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L97) |
| `UnblockAll` | `b *BlockedStats` | `evals map[*structs.Evaluation]string, escaped int` | `` | [L105](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L105) |
| `unblockImpl` | `b *BlockedStats` | `eval *structs.Evaluation, escaped bool` | `` | [L120](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L120) |
| `decrementEscaped` | `b *BlockedStats` | `` | `` | [L134](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L134) |
| `prune` | `b *BlockedStats` | `cutoff time.Time` | `` | [L141](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L141) |
| `generateResourceStats` | - | `eval *structs.Evaluation` | `*BlockedResourcesStats` | [L164](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L164) |
| `NewBlockedResourcesStats` | - | `` | `*BlockedResourcesStats` | [L221](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L221) |
| `Copy` | `b *BlockedResourcesStats` | `` | `*BlockedResourcesStats` | [L229](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L229) |
| `Add` | `b *BlockedResourcesStats` | `a *BlockedResourcesStats` | `*BlockedResourcesStats` | [L245](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L245) |
| `Subtract` | `b *BlockedResourcesStats` | `a *BlockedResourcesStats` | `*BlockedResourcesStats` | [L258](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L258) |
| `Add` | `b *BlockedResourcesSummary` | `a BlockedResourcesSummary` | `BlockedResourcesSummary` | [L278](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L278) |
| `Subtract` | `b *BlockedResourcesSummary` | `a BlockedResourcesSummary` | `BlockedResourcesSummary` | [L288](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L288) |
| `IsZero` | `b *BlockedResourcesSummary` | `` | `bool` | [L297](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L297) |

## 5. 核心方法详解

### NewBlockedStats()

**签名**：`func NewBlockedStats() *BlockedStats`

**位置**：[L41](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L41)

**中文说明**：创建并返回一个新的 BlockedStats 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*BlockedStats` | — |

### Block()

**签名**：`func (b *BlockedStats) Block(eval *structs.Evaluation) `

**位置**：[L59](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L59)

**中文说明**：阻塞对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `eval` | `*structs.Evaluation` | — |

### Copy()

**签名**：`func (b *BlockedStats) Copy() *BlockedStats`

**位置**：[L82](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L82)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*BlockedStats` | — |

### NewBlockedResourcesStats()

**签名**：`func NewBlockedResourcesStats() *BlockedResourcesStats`

**位置**：[L221](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L221)

**中文说明**：创建并返回一个新的 BlockedResourcesStats 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*BlockedResourcesStats` | — |

### Copy()

**签名**：`func (b *BlockedResourcesStats) Copy() *BlockedResourcesStats`

**位置**：[L229](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L229)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*BlockedResourcesStats` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [blocked_evals_stats_test.go](file:///d:/claude/nomad/nomad/blocked_evals_stats_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/acl.go) | 同目录源文件 |
| [acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/nomad/alloc_endpoint.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | 同目录源文件 |
| [autopilot_ce.go](file:///d:/claude/nomad/nomad/autopilot_ce.go) | 同目录源文件 |

