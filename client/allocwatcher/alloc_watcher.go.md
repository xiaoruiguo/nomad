# alloc_watcher.go 代码说明文档

> 文件路径：[client/allocwatcher/alloc_watcher.go](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go)
> 总行数：706 行
> 所属包：`allocwatcher`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **客户端子包**（`client/`），实现 Nomad 客户端的功能组件。

## 2. 类型定义

### RPCer

**定义位置**：[L34](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L34)

**中文说明**：RPCer 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type RPCer interface {
	RPC func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `RPC` | `func(...)` | — |

### terminated

**定义位置**：[L41](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L41)

**中文说明**：terminated 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type terminated interface {
	Terminated func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Terminated` | `func(...)` | — |

### AllocRunnerMeta

**定义位置**：[L47](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L47)

**中文说明**：AllocRunnerMeta 是一个元数据结构体，包含对象的附加元信息。

**类型**：interface

```go
type AllocRunnerMeta interface {
	GetAllocDir func(...)
	Listener func(...)
	Alloc func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `GetAllocDir` | `func(...)` | 获取AllocDir的信息。 |
| `Listener` | `func(...)` | 列出所有ener。 |
| `Alloc` | `func(...)` | — |

### Config

**定义位置**：[L53](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L53)

**中文说明**：Config 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type Config struct {
	Alloc *structs.Allocation
	PreviousRunner AllocRunnerMeta
	PreemptedRunners map[string]AllocRunnerMeta
	RPC RPCer
	Config *config.Config
	MigrateToken string
	Logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Alloc` | `*structs.Allocation` | — |
| `PreviousRunner` | `AllocRunnerMeta` | — |
| `PreemptedRunners` | `map[string]AllocRunnerMeta` | 映射表 |
| `RPC` | `RPCer` | RPC 相关 |
| `Config` | `*config.Config` | 配置 |
| `MigrateToken` | `string` | 字符串 |
| `Logger` | `hclog.Logger` | 日志记录器 |

### localPrevAlloc

**定义位置**：[L182](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L182)

**中文说明**：localPrevAlloc 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型**：struct

```go
type localPrevAlloc struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `allocID` | `string` | 字符串 |
| `prevAllocID` | `string` | 字符串 |
| `tasks` | `[]*structs.Task` | 列表 |
| `sticky` | `bool` | 布尔值 |
| `prevAllocDir` | `allocdir.Interface` | — |
| `prevListener` | `*cstructs.AllocListener` | — |
| `prevStatus` | `terminated` | — |
| `waiting` | `bool` | 布尔值 |
| `migrating` | `bool` | 布尔值 |
| `waitingLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（4 个）：`IsWaiting`, `IsMigrating`, `Wait`, `Migrate`

### remotePrevAlloc

**定义位置**：[L288](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L288)

**中文说明**：remotePrevAlloc 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型**：struct

```go
type remotePrevAlloc struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `allocID` | `string` | 字符串 |
| `prevAllocID` | `string` | 字符串 |
| `tasks` | `[]*structs.Task` | 列表 |
| `config` | `*config.Config` | 配置 |
| `migrate` | `bool` | 布尔值 |
| `rpc` | `RPCer` | RPC 相关 |
| `nodeID` | `string` | 字符串 |
| `waiting` | `bool` | 布尔值 |
| `migrating` | `bool` | 布尔值 |
| `waitingLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |
| `logger` | `hclog.Logger` | 日志记录器 |
| `migrateToken` | `string` | 字符串 |

**关联方法**（7 个）：`IsWaiting`, `IsMigrating`, `Wait`, `Migrate`, `getNodeAddr`, `migrateAllocDir`, `streamAllocDir`

### NoopPrevAlloc

**定义位置**：[L696](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L696)

**中文说明**：NoopPrevAlloc 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型**：struct

**关联方法**（4 个）：`Wait`, `Migrate`, `IsWaiting`, `IsMigrating`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `getRemoteRetryIntv` | `—` | `30 * time.Second` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newMigratorForAlloc` | - | `c Config, tg *structs.TaskGroup, watchedAllocID string, m AllocRunnerMeta` | `config.PrevAllocMigrator` | [L78](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L78) |
| `newWatcherForAlloc` | - | `c Config, watchedAllocID string, m AllocRunnerMeta` | `config.PrevAllocWatcher` | [L117](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L117) |
| `NewAllocWatcher` | - | `c Config` | `config.PrevAllocWatcher, config.PrevAllocMigrator` | [L148](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L148) |
| `IsWaiting` | `p *localPrevAlloc` | `` | `bool` | [L216](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L216) |
| `IsMigrating` | `p *localPrevAlloc` | `` | `bool` | [L224](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L224) |
| `Wait` | `p *localPrevAlloc` | `ctx context.Context` | `error` | [L232](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L232) |
| `Migrate` | `p *localPrevAlloc` | `ctx context.Context, dest allocdir.Interface` | `error` | [L266](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L266) |
| `IsWaiting` | `p *remotePrevAlloc` | `` | `bool` | [L327](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L327) |
| `IsMigrating` | `p *remotePrevAlloc` | `` | `bool` | [L335](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L335) |
| `Wait` | `p *remotePrevAlloc` | `ctx context.Context` | `error` | [L343](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L343) |
| `Migrate` | `p *remotePrevAlloc` | `ctx context.Context, dest allocdir.Interface` | `error` | [L429](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L429) |
| `getNodeAddr` | `p *remotePrevAlloc` | `ctx context.Context, nodeID string` | `string, error` | [L476](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L476) |
| `migrateAllocDir` | `p *remotePrevAlloc` | `ctx context.Context, nodeAddr string` | `*allocdir.AllocDir, error` | [L515](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L515) |
| `streamAllocDir` | `p *remotePrevAlloc` | `ctx context.Context, resp io.ReadCloser, dest string` | `error` | [L554](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L554) |
| `Wait` | ` *NoopPrevAlloc` | `context.Context` | `error` | [L699](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L699) |
| `Migrate` | ` *NoopPrevAlloc` | `context.Context, allocdir.Interface` | `error` | [L702](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L702) |
| `IsWaiting` | ` *NoopPrevAlloc` | `` | `bool` | [L704](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L704) |
| `IsMigrating` | ` *NoopPrevAlloc` | `` | `bool` | [L705](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L705) |

## 5. 核心方法详解

### NewAllocWatcher()

**签名**：`func NewAllocWatcher(c Config) config.PrevAllocWatcher, config.PrevAllocMigrator`

**位置**：[L148](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L148)

**中文说明**：创建并返回一个新的 AllocWatcher 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `c` | `Config` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `config.PrevAllocWatcher` | — |
| `config.PrevAllocMigrator` | — |

### Wait()

**签名**：`func (p *localPrevAlloc) Wait(ctx context.Context) error`

**位置**：[L232](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L232)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Wait()

**签名**：`func (p *remotePrevAlloc) Wait(ctx context.Context) error`

**位置**：[L343](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L343)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Wait()

**签名**：`func ( *NoopPrevAlloc) Wait(context.Context) error`

**位置**：[L699](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher.go#L699)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `—` | `context.Context` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

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
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [alloc_watcher_test.go](file:///d:/claude/nomad/client/allocwatcher/alloc_watcher_test.go) | 对应测试文件 |
| [doc.go](file:///d:/claude/nomad/client/allocwatcher/doc.go) | 同目录源文件 |
| [group_alloc_watcher.go](file:///d:/claude/nomad/client/allocwatcher/group_alloc_watcher.go) | 同目录源文件 |

