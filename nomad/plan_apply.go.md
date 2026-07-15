# plan_apply.go 代码说明文档

> 文件路径：[nomad/plan_apply.go](file:///d:/claude/nomad/nomad/plan_apply.go)
> 总行数：788 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad 核心包**（`nomad/`），实现 Server/Client 核心功能，包括 Raft 共识、状态管理、调度系统、RPC 处理等。当前文件 `plan_apply.go` 提供相关功能实现。

## 2. 类型定义

### planner

**定义位置**：[L24](file:///d:/claude/nomad/nomad/plan_apply.go#L24)

**中文说明**：planner 与计划（Plan）相关，计划是调度器提交的分配方案。

**类型**：struct

```go
type planner struct {
	srv *Server
	planQueue *PlanQueue
	badNodeTracker BadNodeTracker
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `srv` | `*Server` | 关联的 Server 实例 |
| `planQueue` | `*PlanQueue` | — |
| `badNodeTracker` | `BadNodeTracker` | — |

**关联方法**（4 个）：`planApply`, `snapshotMinIndex`, `applyPlan`, `asyncPlanWait`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newPlanner` | - | `s *Server` | `*planner, error` | [L39](file:///d:/claude/nomad/nomad/plan_apply.go#L39) |
| `planApply` | `p *planner` | `` | `` | [L96](file:///d:/claude/nomad/nomad/plan_apply.go#L96) |
| `snapshotMinIndex` | `p *planner` | `prevPlanResultIndex uint64, planSnapshotIndex uint64` | `*state.StateSnapshot, error` | [L217](file:///d:/claude/nomad/nomad/plan_apply.go#L217) |
| `applyPlan` | `p *planner` | `plan *structs.Plan, result *structs.PlanResult, snap *state.StateSnapshot` | `raft.ApplyFuture, error` | [L241](file:///d:/claude/nomad/nomad/plan_apply.go#L241) |
| `normalizePreemptedAlloc` | - | `preemptedAlloc *structs.Allocation, now int64` | `*structs.AllocationDiff` | [L341](file:///d:/claude/nomad/nomad/plan_apply.go#L341) |
| `normalizeStoppedAlloc` | - | `stoppedAlloc *structs.Allocation, now int64` | `*structs.AllocationDiff` | [L353](file:///d:/claude/nomad/nomad/plan_apply.go#L353) |
| `appendNamespacedJobID` | - | `jobIDs map[structs.NamespacedID]struct{...}, alloc *structs.Allocation` | `` | [L364](file:///d:/claude/nomad/nomad/plan_apply.go#L364) |
| `updateAllocTimestamps` | - | `allocations []*structs.Allocation, timestamp int64` | `` | [L373](file:///d:/claude/nomad/nomad/plan_apply.go#L373) |
| `signAllocIdentities` | - | `signer claimSigner, job *structs.Job, allocations []*structs.Allocation, ns *...` | `error` | [L382](file:///d:/claude/nomad/nomad/plan_apply.go#L382) |
| `asyncPlanWait` | `p *planner` | `indexCh chan<- uint64, future raft.ApplyFuture, result *structs.PlanResult, p...` | `` | [L414](file:///d:/claude/nomad/nomad/plan_apply.go#L414) |
| `evaluatePlan` | - | `pool *EvaluatePool, snap *state.StateSnapshot, plan *structs.Plan, logger log...` | `*structs.PlanResult, error` | [L444](file:///d:/claude/nomad/nomad/plan_apply.go#L444) |
| `evaluatePlanPlacements` | - | `pool *EvaluatePool, snap *state.StateSnapshot, plan *structs.Plan, logger log...` | `*structs.PlanResult, error` | [L483](file:///d:/claude/nomad/nomad/plan_apply.go#L483) |
| `correctDeploymentCanaries` | - | `result *structs.PlanResult` | `` | [L656](file:///d:/claude/nomad/nomad/plan_apply.go#L656) |
| `evaluateNodePlan` | - | `snap *state.StateSnapshot, plan *structs.Plan, nodeID string` | `bool, string, error` | [L693](file:///d:/claude/nomad/nomad/plan_apply.go#L693) |
| `isValidForDisconnectedNode` | - | `plan *structs.Plan, nodeID string` | `bool` | [L765](file:///d:/claude/nomad/nomad/plan_apply.go#L765) |
| `isValidForDownNode` | - | `plan *structs.Plan, nodeID string` | `bool` | [L778](file:///d:/claude/nomad/nomad/plan_apply.go#L778) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `runtime` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/raft` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **Raft 集成**：与 HashiCorp Raft 库交互，处理共识协议相关操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标
- **后台协程**：启动 goroutine 执行后台任务

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [plan_apply_test.go](file:///d:/claude/nomad/nomad/plan_apply_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/acl.go) | 同目录源文件 |
| [acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/nomad/alloc_endpoint.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | 同目录源文件 |
| [autopilot_ce.go](file:///d:/claude/nomad/nomad/autopilot_ce.go) | 同目录源文件 |

