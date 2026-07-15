# deployments_watcher.go 代码说明文档

> 文件路径：[deploymentwatcher/deployments_watcher.go](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go)
> 总行数：485 行
> 所属包：`deploymentwatcher`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **部署监视器子包**（`nomad/deploymentwatcher`），监视部署状态变化，触发部署自动提升（promote）、回滚（rollback）等操作，协调部署的渐进式更新。

## 2. 类型定义

### DeploymentRaftEndpoints

**定义位置**：[L40](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L40)

**类型**：interface

```go
	UpsertJob
	UpdateDeploymentStatus
	UpdateDeploymentPromotion
	UpdateDeploymentAllocHealth
	UpdateAllocDesiredTransition
```

### Watcher

**定义位置**：[L63](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L63)

**类型**：struct

```go
	enabled bool
	logger log.Logger
	queryLimiter *rate.Limiter
	updateBatchDuration time.Duration
	raft DeploymentRaftEndpoints
	state *state.StateStore
	deploymentRPC DeploymentRPC
	jobRPC JobRPC
	watchers map[string]*deploymentWatcher
	allocUpdateBatcher *AllocUpdateBatcher
	ctx context.Context
	exitFn context.CancelFunc
	l sync.RWMutex
```

**关联方法**（24 个）：`SetEnabled`, `flush`, `watchDeployments`, `getDeploys`, `getDeploysImpl`, `removeDeletedDeployments`, `add`, `addLocked`, `remove`, `removeByIDLocked`, `forceAdd`, `getOrCreateWatcher`, `SetAllocHealth`, `PromoteDeployment`, `PauseDeployment`, `FailDeployment`, `RunDeployment`, `UnblockDeployment`, `CancelDeployment`, `createUpdate`, `upsertJob`, `upsertDeploymentStatusUpdate`, `upsertDeploymentPromotion`, `upsertDeploymentAllocHealth`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `LimitStateQueriesPerSecond` | `100.0` |
| `CrossDeploymentUpdateBatchDuration` | `250 * time.Millisecond` |

### 变量

| 名称 | 值 |
|------|----|
| `notEnabled` | `fmt.Errorf("deployment watcher not enabled")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewDeploymentsWatcher` | - | `logger log.Logger, raft DeploymentRaftEndpoints, deploymentRPC DeploymentRPC...` | `*Watcher` | [L103](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L103) |
| `SetEnabled` | `w *Watcher` | `enabled bool, state *state.StateStore` | - | [L123](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L123) |
| `flush` | `w *Watcher` | `enabled bool` | - | [L144](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L144) |
| `watchDeployments` | `w *Watcher` | `ctx context.Context` | - | [L167](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L167) |
| `getDeploys` | `w *Watcher` | `ctx context.Context, minIndex uint64` | `[]*structs.Deployment, uint64, error` | [L200](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L200) |
| `getDeploysImpl` | `w *Watcher` | `ws memdb.WatchSet, store *state.StateStore` | `interface{}, uint64, error` | [L215](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L215) |
| `removeDeletedDeployments` | `w *Watcher` | `deployments []*structs.Deployment` | - | [L243](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L243) |
| `add` | `w *Watcher` | `d *structs.Deployment` | `error` | [L264](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L264) |
| `addLocked` | `w *Watcher` | `d *structs.Deployment` | `*deploymentWatcher, error` | [L273](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L273) |
| `remove` | `w *Watcher` | `d *structs.Deployment` | - | [L311](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L311) |
| `removeByIDLocked` | `w *Watcher` | `id string` | - | [L317](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L317) |
| `forceAdd` | `w *Watcher` | `dID string` | `*deploymentWatcher, error` | [L332](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L332) |
| `getOrCreateWatcher` | `w *Watcher` | `dID string` | `*deploymentWatcher, error` | [L351](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L351) |
| `SetAllocHealth` | `w *Watcher` | `req *structs.DeploymentAllocHealthRequest, resp *structs.DeploymentUpdateRes...` | `error` | [L371](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L371) |
| `PromoteDeployment` | `w *Watcher` | `req *structs.DeploymentPromoteRequest, resp *structs.DeploymentUpdateResponse` | `error` | [L383](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L383) |
| `PauseDeployment` | `w *Watcher` | `req *structs.DeploymentPauseRequest, resp *structs.DeploymentUpdateResponse` | `error` | [L394](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L394) |
| `FailDeployment` | `w *Watcher` | `req *structs.DeploymentFailRequest, resp *structs.DeploymentUpdateResponse` | `error` | [L404](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L404) |
| `RunDeployment` | `w *Watcher` | `req *structs.DeploymentRunRequest, resp *structs.DeploymentUpdateResponse` | `error` | [L415](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L415) |
| `UnblockDeployment` | `w *Watcher` | `req *structs.DeploymentUnblockRequest, resp *structs.DeploymentUpdateResponse` | `error` | [L426](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L426) |
| `CancelDeployment` | `w *Watcher` | `req *structs.DeploymentCancelRequest, resp *structs.DeploymentUpdateResponse` | `error` | [L438](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L438) |
| `createUpdate` | `w *Watcher` | `allocs map[string]*structs.DesiredTransition, eval *structs.Evaluation` | `uint64, error` | [L449](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L449) |
| `upsertJob` | `w *Watcher` | `job *structs.Job` | `uint64, error` | [L458](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L458) |
| `upsertDeploymentStatusUpdate` | `w *Watcher` | `u *structs.DeploymentStatusUpdate, e *structs.Evaluation, j *structs.Job` | `uint64, error` | [L464](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L464) |
| `upsertDeploymentPromotion` | `w *Watcher` | `req *structs.ApplyDeploymentPromoteRequest` | `uint64, error` | [L476](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L476) |
| `upsertDeploymentAllocHealth` | `w *Watcher` | `req *structs.ApplyDeploymentAllocHealthRequest` | `uint64, error` | [L482](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go#L482) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `golang.org/x/time/rate` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [deployments_watcher_test.go](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher_test.go) | 对应测试文件 |

