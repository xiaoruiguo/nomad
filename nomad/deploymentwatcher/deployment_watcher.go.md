# deployment_watcher.go 代码说明文档

> 文件路径：[deploymentwatcher/deployment_watcher.go](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go)
> 总行数：1024 行
> 所属包：`deploymentwatcher`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **部署监视器子包**（`nomad/deploymentwatcher`），监视部署状态变化，触发部署自动提升（promote）、回滚（rollback）等操作，协调部署的渐进式更新。

## 2. 类型定义

### deploymentTriggers

**定义位置**：[L38](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L38)

**类型**：interface

```go
	createUpdate
	upsertJob
	upsertDeploymentStatusUpdate
	upsertDeploymentPromotion
	upsertDeploymentAllocHealth
```

### deploymentWatcher

**定义位置**：[L60](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L60)

**类型**：struct

```go
	queryLimiter *rate.Limiter
	deploymentTriggers
	DeploymentRPC
	JobRPC
	state *state.StateStore
	deploymentID string
	deploymentUpdateCh chan struct{...}
	d *structs.Deployment
	j *structs.Job
	outstandingBatch bool
	outstandingAllowReplacements map[string]*structs.DesiredTransition
	latestEval uint64
	logger log.Logger
	ctx context.Context
	exitFn context.CancelFunc
	l sync.RWMutex
```

**关联方法**（24 个）：`updateDeployment`, `getDeployment`, `setAllocHealth`, `handleRollbackValidity`, `PromoteDeployment`, `autoPromoteDeployment`, `PauseDeployment`, `FailDeployment`, `StopWatch`, `watch`, `handleAllocUpdate`, `shouldFail`, `shouldFailEarly`, `getDeploymentProgressCutoff`, `doneGroups`, `latestStableJob`, `createBatchedUpdate`, `getEval`, `getDeploymentStatusUpdate`, `getStatus`, `getAllocsCh`, `getAllocs`, `getAllocsImpl`, `jobEvalStatus`

### allocUpdateResult

**定义位置**：[L590](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L590)

**类型**：struct

```go
	createEval bool
	failDeployment bool
	rollback bool
	allowReplacements []string
```

### allocUpdates

**定义位置**：[L911](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L911)

**类型**：struct

```go
	allocs []*structs.AllocListStub
	index uint64
	err error
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `perJobEvalBatchPeriod` | `1 * time.Second` |

### 变量

| 名称 | 值 |
|------|----|
| `allowRescheduleTransition` | `&structs.DesiredTransition{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newDeploymentWatcher` | - | `parent context.Context, queryLimiter *rate.Limiter, logger log.Logger, state...` | `*deploymentWatcher` | [L112](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L112) |
| `updateDeployment` | `w *deploymentWatcher` | `d *structs.Deployment` | - | [L140](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L140) |
| `getDeployment` | `w *deploymentWatcher` | - | `*structs.Deployment` | [L153](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L153) |
| `setAllocHealth` | `w *deploymentWatcher` | `req *structs.DeploymentAllocHealthRequest, resp *structs.DeploymentUpdateRes...` | `error` | [L159](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L159) |
| `handleRollbackValidity` | `w *deploymentWatcher` | `rollbackJob *structs.Job, desc string` | `*structs.Job, string` | [L247](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L247) |
| `PromoteDeployment` | `w *deploymentWatcher` | `req *structs.DeploymentPromoteRequest, resp *structs.DeploymentUpdateResponse` | `error` | [L260](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L260) |
| `autoPromoteDeployment` | `w *deploymentWatcher` | `allocs []*structs.AllocListStub` | `error` | [L284](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L284) |
| `PauseDeployment` | `w *deploymentWatcher` | `req *structs.DeploymentPauseRequest, resp *structs.DeploymentUpdateResponse` | `error` | [L326](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L326) |
| `FailDeployment` | `w *deploymentWatcher` | `req *structs.DeploymentFailRequest, resp *structs.DeploymentUpdateResponse` | `error` | [L357](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L357) |
| `StopWatch` | `w *deploymentWatcher` | - | - | [L408](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L408) |
| `watch` | `w *deploymentWatcher` | - | - | [L417](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L417) |
| `handleAllocUpdate` | `w *deploymentWatcher` | `allocs []*structs.AllocListStub` | `allocUpdateResult, error` | [L599](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L599) |
| `shouldFail` | `w *deploymentWatcher` | - | `fail bool, rollback bool, err error` | [L656](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L656) |
| `shouldFailEarly` | `w *deploymentWatcher` | `deployment *structs.Deployment, alloc *structs.AllocListStub, dstate *struct...` | `bool` | [L702](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L702) |
| `getDeploymentProgressCutoff` | `w *deploymentWatcher` | `d *structs.Deployment` | `time.Time` | [L729](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L729) |
| `doneGroups` | `w *deploymentWatcher` | `d *structs.Deployment` | `map[string]bool` | [L754](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L754) |
| `latestStableJob` | `w *deploymentWatcher` | - | `*structs.Job, error` | [L796](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L796) |
| `createBatchedUpdate` | `w *deploymentWatcher` | `allowReplacements []string, forIndex uint64` | - | [L820](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L820) |
| `getEval` | `w *deploymentWatcher` | - | `*structs.Evaluation` | [L861](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L861) |
| `getDeploymentStatusUpdate` | `w *deploymentWatcher` | `status string, desc string` | `*structs.DeploymentStatusUpdate` | [L890](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L890) |
| `getStatus` | `w *deploymentWatcher` | - | `string` | [L905](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L905) |
| `getAllocsCh` | `w *deploymentWatcher` | `index uint64` | `chan *allocUpdates` | [L921](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L921) |
| `getAllocs` | `w *deploymentWatcher` | `index uint64` | `[]*structs.AllocListStub, uint64, error` | [L937](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L937) |
| `getAllocsImpl` | `w *deploymentWatcher` | `ws memdb.WatchSet, state *state.StateStore` | `interface{}, uint64, error` | [L950](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L950) |
| `jobEvalStatus` | `w *deploymentWatcher` | - | `latestIndex uint64, err error` | [L985](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L985) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
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

