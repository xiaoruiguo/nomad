# core_sched.go 代码说明文档

> 文件路径：[core_sched.go](file:///d:/claude/nomad/nomad/core_sched.go)
> 总行数：1401 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2025
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **核心调度器**，处理系统级评估（如垃圾回收、节点排水），周期性清理过期对象。

## 2. 类型定义

### CoreScheduler

**定义位置**：[L28](file:///d:/claude/nomad/nomad/core_sched.go#L28)

**类型**：struct

```go
	srv *Server
	snap *state.StateSnapshot
	logger log.Logger
	planner sstructs.Planner
	customThresholdForObject map[string]*time.Duration
```

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
| `allocGCEligible` | - | `a *structs.Allocation, job *structs.Job, gcTime time.Time, cutoffTime time.T...` | `bool` | [L690](file:///d:/claude/nomad/nomad/core_sched.go#L690) |
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

- **组合模式**：结构体嵌入 Server 引用，通过组合获取 Server 上下文
- **RPC 端点模式**：定义 RPC 端点结构体，将 Server 引用注入端点，处理特定资源的 RPC 请求
- **调度器模式**：实现调度器接口，从评估队列获取评估并产生调度计划
- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [core_sched_test.go](file:///d:/claude/nomad/nomad/core_sched_test.go) | 对应测试文件 |

