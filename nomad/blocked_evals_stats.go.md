# blocked_evals_stats.go 代码说明文档

> 文件路径：[blocked_evals_stats.go](file:///d:/claude/nomad/nomad/blocked_evals_stats.go)
> 总行数：300 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **阻塞评估统计**，收集和报告阻塞评估的统计信息。

## 2. 类型定义

### BlockedStats

**定义位置**：[L14](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L14)

**类型**：struct

```go
	TotalEscaped int
	TotalBlocked int
	TotalQuotaLimit int
	BlockedResources *BlockedResourcesStats
	lock sync.RWMutex
```

**关联方法**（8 个）：`Reset`, `Block`, `Copy`, `Unblock`, `UnblockAll`, `unblockImpl`, `decrementEscaped`, `prune`

### classInDC

**定义位置**：[L34](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L34)

**类型**：struct

```go
	dc string
	class string
	nodepool string
```

### BlockedResourcesStats

**定义位置**：[L215](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L215)

**类型**：struct

```go
	ByJob map[structs.NamespacedID]BlockedResourcesSummary
	ByClassInDC map[classInDC]BlockedResourcesSummary
```

**关联方法**（3 个）：`Copy`, `Add`, `Subtract`

### BlockedResourcesSummary

**定义位置**：[L270](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L270)

**类型**：struct

```go
	Timestamp time.Time
	CPU int
	MemoryMB int
```

**关联方法**（3 个）：`Add`, `Subtract`, `IsZero`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewBlockedStats` | - | - | `*BlockedStats` | [L41](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L41) |
| `Reset` | `b *BlockedStats` | - | - | [L47](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L47) |
| `Block` | `b *BlockedStats` | `eval *structs.Evaluation` | - | [L59](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L59) |
| `Copy` | `b *BlockedStats` | - | `*BlockedStats` | [L82](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L82) |
| `Unblock` | `b *BlockedStats` | `eval *structs.Evaluation, escaped bool` | - | [L97](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L97) |
| `UnblockAll` | `b *BlockedStats` | `evals map[*structs.Evaluation]string, escaped int` | - | [L105](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L105) |
| `unblockImpl` | `b *BlockedStats` | `eval *structs.Evaluation, escaped bool` | - | [L120](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L120) |
| `decrementEscaped` | `b *BlockedStats` | - | - | [L134](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L134) |
| `prune` | `b *BlockedStats` | `cutoff time.Time` | - | [L141](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L141) |
| `generateResourceStats` | - | `eval *structs.Evaluation` | `*BlockedResourcesStats` | [L164](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L164) |
| `NewBlockedResourcesStats` | - | - | `*BlockedResourcesStats` | [L221](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L221) |
| `Copy` | `b *BlockedResourcesStats` | - | `*BlockedResourcesStats` | [L229](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L229) |
| `Add` | `b *BlockedResourcesStats` | `a *BlockedResourcesStats` | `*BlockedResourcesStats` | [L245](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L245) |
| `Subtract` | `b *BlockedResourcesStats` | `a *BlockedResourcesStats` | `*BlockedResourcesStats` | [L258](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L258) |
| `Add` | `b *BlockedResourcesSummary` | `a BlockedResourcesSummary` | `BlockedResourcesSummary` | [L278](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L278) |
| `Subtract` | `b *BlockedResourcesSummary` | `a BlockedResourcesSummary` | `BlockedResourcesSummary` | [L288](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L288) |
| `IsZero` | `b *BlockedResourcesSummary` | - | `bool` | [L297](file:///d:/claude/nomad/nomad/blocked_evals_stats.go#L297) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [blocked_evals_stats_test.go](file:///d:/claude/nomad/nomad/blocked_evals_stats_test.go) | 对应测试文件 |

