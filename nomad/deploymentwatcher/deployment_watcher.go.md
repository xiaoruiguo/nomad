# deployment_watcher.go 代码说明文档

> 文件路径：[nomad/deploymentwatcher/deployment_watcher.go](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go)
> 总行数：1024 行
> 所属包：`deploymentwatcher`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `deploymentwatcher` 包，定义接口类型、定义结构体类型、包含 25 个方法/函数。

## 2. 类型定义

### deploymentTriggers

**定义位置**：[L38](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L38)

**中文说明**：deploymentTriggers 与部署（Deployment）相关，部署管理作业的滚动更新过程。

**类型**：interface

```go
type deploymentTriggers interface {
	createUpdate func(...)
	upsertJob func(...)
	upsertDeploymentStatusUpdate func(...)
	upsertDeploymentPromotion func(...)
	upsertDeploymentAllocHealth func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `createUpdate` | `func(...)` | 创建新的Update。 |
| `upsertJob` | `func(...)` | — |
| `upsertDeploymentStatusUpdate` | `func(...)` | — |
| `upsertDeploymentPromotion` | `func(...)` | — |
| `upsertDeploymentAllocHealth` | `func(...)` | — |

### deploymentWatcher

**定义位置**：[L60](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L60)

**中文说明**：deploymentWatcher 是一个监视器，持续监控特定资源的状态变化并触发相应处理。

**类型**：struct

```go
type deploymentWatcher struct {
	queryLimiter *rate.Limiter
	deploymentTriggers deploymentTriggers
	DeploymentRPC DeploymentRPC
	JobRPC JobRPC
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `queryLimiter` | `*rate.Limiter` | — |
| `deploymentTriggers` | `deploymentTriggers` | — |
| `DeploymentRPC` | `DeploymentRPC` | — |
| `JobRPC` | `JobRPC` | — |
| `state` | `*state.StateStore` | 状态 |
| `deploymentID` | `string` | 字符串 |
| `deploymentUpdateCh` | `chan struct{...}` | 信号通道 |
| `d` | `*structs.Deployment` | — |
| `j` | `*structs.Job` | j is job 部署 is 用于 |
| `outstandingBatch` | `bool` | 布尔值 |
| `outstandingAllowReplacements` | `map[string]*structs.DesiredTransition` | 映射表 |
| `latestEval` | `uint64` | 无符号 64 位整数 |
| `logger` | `log.Logger` | 日志记录器 |
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `exitFn` | `context.CancelFunc` | 取消函数，用于取消上下文 |
| `l` | `sync.RWMutex` | 读写锁，保护并发访问 |

**关联方法**（24 个）：`updateDeployment`, `getDeployment`, `setAllocHealth`, `handleRollbackValidity`, `PromoteDeployment`, `autoPromoteDeployment`, `PauseDeployment`, `FailDeployment`, `StopWatch`, `watch`, `handleAllocUpdate`, `shouldFail`, `shouldFailEarly`, `getDeploymentProgressCutoff`, `doneGroups`, `latestStableJob`, `createBatchedUpdate`, `getEval`, `getDeploymentStatusUpdate`, `getStatus`, `getAllocsCh`, `getAllocs`, `getAllocsImpl`, `jobEvalStatus`

### allocUpdateResult

**定义位置**：[L590](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L590)

**中文说明**：allocUpdateResult 是一个结果结构体，封装操作执行的结果。

**类型**：struct

```go
type allocUpdateResult struct {
	createEval bool
	failDeployment bool
	rollback bool
	allowReplacements []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `createEval` | `bool` | 布尔值 |
| `failDeployment` | `bool` | 布尔值 |
| `rollback` | `bool` | 布尔值 |
| `allowReplacements` | `[]string` | 列表 |

### allocUpdates

**定义位置**：[L911](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L911)

**中文说明**：allocUpdates 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type allocUpdates struct {
	allocs []*structs.AllocListStub
	index uint64
	err error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `allocs` | `[]*structs.AllocListStub` | 列表 |
| `index` | `uint64` | 索引 |
| `err` | `error` | 错误信息 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `perJobEvalBatchPeriod` | `—` | `1 * time.Second` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `allowRescheduleTransition` | `—` | `&structs.DesiredTransition{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newDeploymentWatcher` | - | `parent context.Context, queryLimiter *rate.Limiter, logger log.Logger, state ...` | `*deploymentWatcher` | [L112](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L112) |
| `updateDeployment` | `w *deploymentWatcher` | `d *structs.Deployment` | `` | [L140](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L140) |
| `getDeployment` | `w *deploymentWatcher` | `` | `*structs.Deployment` | [L153](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L153) |
| `setAllocHealth` | `w *deploymentWatcher` | `req *structs.DeploymentAllocHealthRequest, resp *structs.DeploymentUpdateResp...` | `error` | [L159](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L159) |
| `handleRollbackValidity` | `w *deploymentWatcher` | `rollbackJob *structs.Job, desc string` | `*structs.Job, string` | [L247](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L247) |
| `PromoteDeployment` | `w *deploymentWatcher` | `req *structs.DeploymentPromoteRequest, resp *structs.DeploymentUpdateResponse` | `error` | [L260](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L260) |
| `autoPromoteDeployment` | `w *deploymentWatcher` | `allocs []*structs.AllocListStub` | `error` | [L284](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L284) |
| `PauseDeployment` | `w *deploymentWatcher` | `req *structs.DeploymentPauseRequest, resp *structs.DeploymentUpdateResponse` | `error` | [L326](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L326) |
| `FailDeployment` | `w *deploymentWatcher` | `req *structs.DeploymentFailRequest, resp *structs.DeploymentUpdateResponse` | `error` | [L357](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L357) |
| `StopWatch` | `w *deploymentWatcher` | `` | `` | [L408](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L408) |
| `watch` | `w *deploymentWatcher` | `` | `` | [L417](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L417) |
| `handleAllocUpdate` | `w *deploymentWatcher` | `allocs []*structs.AllocListStub` | `allocUpdateResult, error` | [L599](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L599) |
| `shouldFail` | `w *deploymentWatcher` | `` | `fail bool, rollback bool, err error` | [L656](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L656) |
| `shouldFailEarly` | `w *deploymentWatcher` | `deployment *structs.Deployment, alloc *structs.AllocListStub, dstate *structs...` | `bool` | [L702](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L702) |
| `getDeploymentProgressCutoff` | `w *deploymentWatcher` | `d *structs.Deployment` | `time.Time` | [L729](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L729) |
| `doneGroups` | `w *deploymentWatcher` | `d *structs.Deployment` | `map[string]bool` | [L754](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L754) |
| `latestStableJob` | `w *deploymentWatcher` | `` | `*structs.Job, error` | [L796](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L796) |
| `createBatchedUpdate` | `w *deploymentWatcher` | `allowReplacements []string, forIndex uint64` | `` | [L820](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L820) |
| `getEval` | `w *deploymentWatcher` | `` | `*structs.Evaluation` | [L861](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L861) |
| `getDeploymentStatusUpdate` | `w *deploymentWatcher` | `status string, desc string` | `*structs.DeploymentStatusUpdate` | [L890](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L890) |
| `getStatus` | `w *deploymentWatcher` | `` | `string` | [L905](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L905) |
| `getAllocsCh` | `w *deploymentWatcher` | `index uint64` | `<-chan *allocUpdates` | [L921](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L921) |
| `getAllocs` | `w *deploymentWatcher` | `index uint64` | `[]*structs.AllocListStub, uint64, error` | [L937](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L937) |
| `getAllocsImpl` | `w *deploymentWatcher` | `ws memdb.WatchSet, state *state.StateStore` | `interface{}, uint64, error` | [L950](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L950) |
| `jobEvalStatus` | `w *deploymentWatcher` | `` | `latestIndex uint64, err error` | [L985](file:///d:/claude/nomad/nomad/deploymentwatcher/deployment_watcher.go#L985) |

## 5. 核心方法详解

该文件无导出的核心方法。

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
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **后台协程**：启动 goroutine 执行后台任务

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [batcher.go](file:///d:/claude/nomad/nomad/deploymentwatcher/batcher.go) | 同目录源文件 |
| [deployments_watcher.go](file:///d:/claude/nomad/nomad/deploymentwatcher/deployments_watcher.go) | 同目录源文件 |
| [doc.go](file:///d:/claude/nomad/nomad/deploymentwatcher/doc.go) | 同目录源文件 |
| [multiregion_ce.go](file:///d:/claude/nomad/nomad/deploymentwatcher/multiregion_ce.go) | 同目录源文件 |

