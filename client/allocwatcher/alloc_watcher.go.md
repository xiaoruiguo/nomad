# alloc_watcher.go 代码说明文档

> 文件路径：[allocwatcher/alloc_watcher.go](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go)
> 总行数：706 行
> 所属包：`allocwatcher`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配监视器子包**（`client/allocwatcher`），监视分配的迁移和更新，协调新旧分配的平滑过渡。

## 2. 类型定义

### RPCer

**定义位置**：[L34](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L34)

**类型**：interface

```go
	RPC
```

### terminated

**定义位置**：[L41](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L41)

**类型**：interface

```go
	Terminated
```

### AllocRunnerMeta

**定义位置**：[L47](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L47)

**类型**：interface

```go
	GetAllocDir
	Listener
	Alloc
```

### Config

**定义位置**：[L53](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L53)

**类型**：struct

```go
	Alloc *structs.Allocation
	PreviousRunner AllocRunnerMeta
	PreemptedRunners map[string]AllocRunnerMeta
	RPC RPCer
	Config *config.Config
	MigrateToken string
	Logger hclog.Logger
```

### localPrevAlloc

**定义位置**：[L182](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L182)

**类型**：struct

```go
	allocID string
	prevAllocID string
	tasks []*structs.Task
	sticky bool
	prevAllocDir allocdir.Interface
	prevListener *cstructs.AllocListener
	prevStatus terminated
	waiting bool
	migrating bool
	waitingLock sync.RWMutex
	logger hclog.Logger
```

**关联方法**（4 个）：`IsWaiting`, `IsMigrating`, `Wait`, `Migrate`

### remotePrevAlloc

**定义位置**：[L288](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L288)

**类型**：struct

```go
	allocID string
	prevAllocID string
	tasks []*structs.Task
	config *config.Config
	migrate bool
	rpc RPCer
	nodeID string
	waiting bool
	migrating bool
	waitingLock sync.RWMutex
	logger hclog.Logger
	migrateToken string
```

**关联方法**（7 个）：`IsWaiting`, `IsMigrating`, `Wait`, `Migrate`, `getNodeAddr`, `migrateAllocDir`, `streamAllocDir`

### NoopPrevAlloc

**定义位置**：[L696](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L696)

**类型**：struct

**关联方法**（4 个）：`Wait`, `Migrate`, `IsWaiting`, `IsMigrating`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `getRemoteRetryIntv` | `30 * time.Second` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newMigratorForAlloc` | - | `c Config, tg *structs.TaskGroup, watchedAllocID string, m AllocRunnerMeta` | `config.PrevAllocMigrator` | [L78](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L78) |
| `newWatcherForAlloc` | - | `c Config, watchedAllocID string, m AllocRunnerMeta` | `config.PrevAllocWatcher` | [L117](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L117) |
| `NewAllocWatcher` | - | `c Config` | `config.PrevAllocWatcher, config.PrevAllocMigrator` | [L148](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L148) |
| `IsWaiting` | `p *localPrevAlloc` | - | `bool` | [L216](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L216) |
| `IsMigrating` | `p *localPrevAlloc` | - | `bool` | [L224](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L224) |
| `Wait` | `p *localPrevAlloc` | `ctx context.Context` | `error` | [L232](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L232) |
| `Migrate` | `p *localPrevAlloc` | `ctx context.Context, dest allocdir.Interface` | `error` | [L266](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L266) |
| `IsWaiting` | `p *remotePrevAlloc` | - | `bool` | [L327](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L327) |
| `IsMigrating` | `p *remotePrevAlloc` | - | `bool` | [L335](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L335) |
| `Wait` | `p *remotePrevAlloc` | `ctx context.Context` | `error` | [L343](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L343) |
| `Migrate` | `p *remotePrevAlloc` | `ctx context.Context, dest allocdir.Interface` | `error` | [L429](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L429) |
| `getNodeAddr` | `p *remotePrevAlloc` | `ctx context.Context, nodeID string` | `string, error` | [L476](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L476) |
| `migrateAllocDir` | `p *remotePrevAlloc` | `ctx context.Context, nodeAddr string` | `*allocdir.AllocDir, error` | [L515](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L515) |
| `streamAllocDir` | `p *remotePrevAlloc` | `ctx context.Context, resp io.ReadCloser, dest string` | `error` | [L554](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L554) |
| `Wait` | ` *NoopPrevAlloc` | `context.Context` | `error` | [L699](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L699) |
| `Migrate` | ` *NoopPrevAlloc` | `context.Context, allocdir.Interface` | `error` | [L702](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L702) |
| `IsWaiting` | ` *NoopPrevAlloc` | - | `bool` | [L704](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L704) |
| `IsMigrating` | ` *NoopPrevAlloc` | - | `bool` | [L705](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L705) |

## 5. 核心方法详解

### Wait()

**签名**：`func (p *localPrevAlloc) Wait(ctx context.Context) error`

**位置**：[L232](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L232)

### Wait()

**签名**：`func (p *remotePrevAlloc) Wait(ctx context.Context) error`

**位置**：[L343](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L343)

### Wait()

**签名**：`func ( *NoopPrevAlloc) Wait(context.Context) error`

**位置**：[L699](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L699)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `archive/tar` | 标准库 |
| `context` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `sync` | 标准库 |
| `syscall` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/client/allocdir` | 内部包 |
| `github.com/hashicorp/nomad/client/config` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/escapingfs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [alloc_watcher_test.go](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher_test.go) | 对应测试文件 |

