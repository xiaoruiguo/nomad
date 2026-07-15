# core_sched.go 代码说明文档

> 文件路径：[nomad/core_sched.go](file:///d:/claude/nomad/nomad/core_sched.go)
> 总行数：1401 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2025
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad 核心包**（`nomad/`），实现 Server/Client 核心功能，包括 Raft 共识、状态管理、调度系统、RPC 处理等。当前文件 `core_sched.go` 提供相关功能实现。

## 2. 类型定义

### CoreScheduler

**定义位置**：[L28](file:///d:/claude/nomad/nomad/core_sched.go#L28)

**中文说明**：CoreScheduler 与调度器（Scheduler）相关，调度器负责将作业分配到合适的节点。

**类型**：struct

```go
type CoreScheduler struct {
	srv *Server
	snap *state.StateSnapshot
	logger log.Logger
	planner sstructs.Planner
	customThresholdForObject map[string]*time.Duration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `srv` | `*Server` | 关联的 Server 实例 |
| `snap` | `*state.StateSnapshot` | — |
| `logger` | `log.Logger` | 日志记录器 |
| `planner` | `sstructs.Planner` | 计划器，管理分配方案 |
| `customThresholdForObject` | `map[string]*time.Duration` | 时间间隔 |

**关联方法**（25 个）：`Process`, `forceGC`, `jobGC`, `jobReap`, `partitionJobReap`, `evalGC`, `gcEval`, `evalReap`, `partitionEvalReap`, `nodeGC`, `nodeReap`, `deploymentGC`, `deploymentReap`, `partitionDeploymentReap`, `csiVolumeClaimGC`, `csiPluginGC`, `expiredOneTimeTokenGC`, `expiredACLTokenGC`, `rootKeyRotateOrGC`, `rootKeyGC`, `rootKeyMigrate`, `rootKeyRotate`, `variablesRekey`, `rotateVariables`, `getCutoffTime`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewCoreScheduler` | - | `srv *Server, snap *state.StateSnapshot, planner sstructs.Planner` | `sstructs.Scheduler` | [L46](file:///d:/claude/nomad/nomad/core_sched.go#L46) |
| `Process` | `c *CoreScheduler` | `eval *structs.Evaluation` | `error` | [L58](file:///d:/claude/nomad/nomad/core_sched.go#L58) |
| `forceGC` | `c *CoreScheduler` | `eval *structs.Evaluation` | `error` | [L95](file:///d:/claude/nomad/nomad/core_sched.go#L95) |
| `jobGC` | `c *CoreScheduler` | `eval *structs.Evaluation, customThreshold *time.Duration` | `error` | [L133](file:///d:/claude/nomad/nomad/core_sched.go#L133) |
| `jobReap` | `c *CoreScheduler` | `jobs []*structs.Job, leaderACL string` | `error` | [L225](file:///d:/claude/nomad/nomad/core_sched.go#L225) |
| `partitionJobReap` | `c *CoreScheduler` | `jobs []*structs.Job, leaderACL string, batchSize int` | `[]*structs.JobBatchDeregisterRequest` | [L243](file:///d:/claude/nomad/nomad/core_sched.go#L243) |
| `evalGC` | `c *CoreScheduler` | `customThreshold *time.Duration` | `error` | [L279](file:///d:/claude/nomad/nomad/core_sched.go#L279) |
| `gcEval` | `c *CoreScheduler` | `eval *structs.Evaluation, cutoffTime time.Time, allowBatch bool` | `bool, []string, error` | [L335](file:///d:/claude/nomad/nomad/core_sched.go#L335) |
| `olderVersionTerminalAllocs` | - | `allocs []*structs.Allocation, job *structs.Job, cutoffTime time.Time` | `[]string` | [L403](file:///d:/claude/nomad/nomad/core_sched.go#L403) |
| `evalReap` | `c *CoreScheduler` | `evals []string, allocs []string` | `error` | [L416](file:///d:/claude/nomad/nomad/core_sched.go#L416) |
| `partitionEvalReap` | `c *CoreScheduler` | `evals []string, allocs []string, batchSize int` | `[]*structs.EvalReapRequest` | [L432](file:///d:/claude/nomad/nomad/core_sched.go#L432) |
| `nodeGC` | `c *CoreScheduler` | `eval *structs.Evaluation, customThreshold *time.Duration` | `error` | [L475](file:///d:/claude/nomad/nomad/core_sched.go#L475) |
| `nodeReap` | `c *CoreScheduler` | `eval *structs.Evaluation, nodeIDs []string` | `error` | [L539](file:///d:/claude/nomad/nomad/core_sched.go#L539) |
| `deploymentGC` | `c *CoreScheduler` | `customThreshold *time.Duration` | `error` | [L583](file:///d:/claude/nomad/nomad/core_sched.go#L583) |
| `deploymentReap` | `c *CoreScheduler` | `deployments []string` | `error` | [L646](file:///d:/claude/nomad/nomad/core_sched.go#L646) |
| `partitionDeploymentReap` | `c *CoreScheduler` | `deployments []string, batchSize int` | `[]*structs.DeploymentDeleteRequest` | [L662](file:///d:/claude/nomad/nomad/core_sched.go#L662) |
| `allocGCEligible` | - | `a *structs.Allocation, job *structs.Job, gcTime time.Time, cutoffTime time.Time` | `bool` | [L690](file:///d:/claude/nomad/nomad/core_sched.go#L690) |
| `csiVolumeClaimGC` | `c *CoreScheduler` | `eval *structs.Evaluation, customThreshold *time.Duration` | `error` | [L756](file:///d:/claude/nomad/nomad/core_sched.go#L756) |
| `csiPluginGC` | `c *CoreScheduler` | `eval *structs.Evaluation, customThreshold *time.Duration` | `error` | [L829](file:///d:/claude/nomad/nomad/core_sched.go#L829) |
| `expiredOneTimeTokenGC` | `c *CoreScheduler` | `eval *structs.Evaluation` | `error` | [L876](file:///d:/claude/nomad/nomad/core_sched.go#L876) |
| `expiredACLTokenGC` | `c *CoreScheduler` | `eval *structs.Evaluation, global bool, customThreshold *time.Duration` | `error` | [L890](file:///d:/claude/nomad/nomad/core_sched.go#L890) |
| `rootKeyRotateOrGC` | `c *CoreScheduler` | `eval *structs.Evaluation` | `error` | [L987](file:///d:/claude/nomad/nomad/core_sched.go#L987) |
| `rootKeyGC` | `c *CoreScheduler` | `eval *structs.Evaluation, now time.Time` | `error` | [L1015](file:///d:/claude/nomad/nomad/core_sched.go#L1015) |
| `rootKeyMigrate` | `c *CoreScheduler` | `eval *structs.Evaluation` | `bool, error` | [L1083](file:///d:/claude/nomad/nomad/core_sched.go#L1083) |
| `rootKeyRotate` | `c *CoreScheduler` | `eval *structs.Evaluation, now time.Time` | `bool, error` | [L1127](file:///d:/claude/nomad/nomad/core_sched.go#L1127) |
| `variablesRekey` | `c *CoreScheduler` | `eval *structs.Evaluation` | `error` | [L1232](file:///d:/claude/nomad/nomad/core_sched.go#L1232) |
| `rotateVariables` | `c *CoreScheduler` | `iter memdb.ResultIterator, eval *structs.Evaluation` | `error` | [L1303](file:///d:/claude/nomad/nomad/core_sched.go#L1303) |
| `getCutoffTime` | `c *CoreScheduler` | `configThreshold time.Duration` | `time.Time` | [L1398](file:///d:/claude/nomad/nomad/core_sched.go#L1398) |

## 5. 核心方法详解

### NewCoreScheduler()

**签名**：`func NewCoreScheduler(srv *Server, snap *state.StateSnapshot, planner sstructs.Planner) sstructs.Scheduler`

**位置**：[L46](file:///d:/claude/nomad/nomad/core_sched.go#L46)

**中文说明**：创建并返回一个新的 CoreScheduler 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `srv` | `*Server` | 关联的 Server 实例 |
| `snap` | `*state.StateSnapshot` | — |
| `planner` | `sstructs.Planner` | 计划器，管理分配方案 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `sstructs.Scheduler` | — |

### Process()

**签名**：`func (c *CoreScheduler) Process(eval *structs.Evaluation) error`

**位置**：[L58](file:///d:/claude/nomad/nomad/core_sched.go#L58)

**中文说明**：处理 用于 实现 调度器.调度器 接口

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `eval` | `*structs.Evaluation` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-version` | 第三方库 |
| `golang.org/x/time/rate` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **后台协程**：启动 goroutine 执行后台任务
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [core_sched_test.go](file:///d:/claude/nomad/nomad/core_sched_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/acl.go) | 同目录源文件 |
| [acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/nomad/alloc_endpoint.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | 同目录源文件 |
| [autopilot_ce.go](file:///d:/claude/nomad/nomad/autopilot_ce.go) | 同目录源文件 |

