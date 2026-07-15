# stats_fetcher.go 代码说明文档

> 文件路径：[stats_fetcher.go](file:///d:/claude/nomad/nomad/stats_fetcher.go)
> 总行数：152 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **统计获取器**，从集群节点收集资源使用统计信息。

## 2. 类型定义

### StatsFetcher

**定义位置**：[L26](file:///d:/claude/nomad/nomad/stats_fetcher.go#L26)

**类型**：struct

```go
	logger log.Logger
	pool *pool.ConnPool
	region string
	localID raft.ServerID
	localServer *Server
	inflight map[raft.ServerID]struct{...}
	inflightLock sync.Mutex
```

**关联方法**（3 个）：`SetLocalServer`, `fetch`, `Fetch`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewStatsFetcher` | - | `logger log.Logger, pool *pool.ConnPool, region string` | `*StatsFetcher` | [L37](file:///d:/claude/nomad/nomad/stats_fetcher.go#L37) |
| `SetLocalServer` | `f *StatsFetcher` | `srv *Server` | - | [L48](file:///d:/claude/nomad/nomad/stats_fetcher.go#L48) |
| `fetch` | `f *StatsFetcher` | `server *autopilot.Server, replyCh chan *autopilot.ServerStats` | - | [L57](file:///d:/claude/nomad/nomad/stats_fetcher.go#L57) |
| `Fetch` | `f *StatsFetcher` | `ctx context.Context, servers map[raft.ServerID]*autopilot.Server` | `map[raft.ServerID]*autopilot.ServerStats` | [L100](file:///d:/claude/nomad/nomad/stats_fetcher.go#L100) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `net` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/helper/pool` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/raft` | 第三方库 |
| `github.com/hashicorp/raft-autopilot` | 第三方库 |

## 7. 设计模式与技术特点

- **Raft 共识**：使用 HashiCorp Raft 库实现分布式共识，保证状态一致性
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [stats_fetcher_test.go](file:///d:/claude/nomad/nomad/stats_fetcher_test.go) | 对应测试文件 |

