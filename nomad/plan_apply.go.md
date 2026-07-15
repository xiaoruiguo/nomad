# plan_apply.go 代码说明文档

> 文件路径：[plan_apply.go](file:///d:/claude/nomad/nomad/plan_apply.go)
> 总行数：788 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **计划应用器（PlanApplier）**，将调度器产生的计划（Plan）应用到状态存储，包括冲突检测、资源分配、原子提交。

## 2. 类型定义

### planner

**定义位置**：[L24](file:///d:/claude/nomad/nomad/plan_apply.go#L24)

**类型**：struct

```go
	srv *Server
	planQueue *PlanQueue
	badNodeTracker BadNodeTracker
```

**关联方法**（4 个）：`planApply`, `snapshotMinIndex`, `applyPlan`, `asyncPlanWait`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newPlanner` | - | `s *Server` | `*planner, error` | [L39](file:///d:/claude/nomad/nomad/plan_apply.go#L39) |
| `planApply` | `p *planner` | - | - | [L96](file:///d:/claude/nomad/nomad/plan_apply.go#L96) |
| `snapshotMinIndex` | `p *planner` | `prevPlanResultIndex uint64, planSnapshotIndex uint64` | `*state.StateSnapshot, error` | [L217](file:///d:/claude/nomad/nomad/plan_apply.go#L217) |
| `applyPlan` | `p *planner` | `plan *structs.Plan, result *structs.PlanResult, snap *state.StateSnapshot` | `raft.ApplyFuture, error` | [L241](file:///d:/claude/nomad/nomad/plan_apply.go#L241) |
| `normalizePreemptedAlloc` | - | `preemptedAlloc *structs.Allocation, now int64` | `*structs.AllocationDiff` | [L341](file:///d:/claude/nomad/nomad/plan_apply.go#L341) |
| `normalizeStoppedAlloc` | - | `stoppedAlloc *structs.Allocation, now int64` | `*structs.AllocationDiff` | [L353](file:///d:/claude/nomad/nomad/plan_apply.go#L353) |
| `appendNamespacedJobID` | - | `jobIDs map[structs.NamespacedID]struct{...}, alloc *structs.Allocation` | - | [L364](file:///d:/claude/nomad/nomad/plan_apply.go#L364) |
| `updateAllocTimestamps` | - | `allocations []*structs.Allocation, timestamp int64` | - | [L373](file:///d:/claude/nomad/nomad/plan_apply.go#L373) |
| `signAllocIdentities` | - | `signer claimSigner, job *structs.Job, allocations []*structs.Allocation, ns ...` | `error` | [L382](file:///d:/claude/nomad/nomad/plan_apply.go#L382) |
| `asyncPlanWait` | `p *planner` | `indexCh chan uint64, future raft.ApplyFuture, result *structs.PlanResult, pe...` | - | [L414](file:///d:/claude/nomad/nomad/plan_apply.go#L414) |
| `evaluatePlan` | - | `pool *EvaluatePool, snap *state.StateSnapshot, plan *structs.Plan, logger lo...` | `*structs.PlanResult, error` | [L444](file:///d:/claude/nomad/nomad/plan_apply.go#L444) |
| `evaluatePlanPlacements` | - | `pool *EvaluatePool, snap *state.StateSnapshot, plan *structs.Plan, logger lo...` | `*structs.PlanResult, error` | [L483](file:///d:/claude/nomad/nomad/plan_apply.go#L483) |
| `correctDeploymentCanaries` | - | `result *structs.PlanResult` | - | [L656](file:///d:/claude/nomad/nomad/plan_apply.go#L656) |
| `evaluateNodePlan` | - | `snap *state.StateSnapshot, plan *structs.Plan, nodeID string` | `bool, string, error` | [L693](file:///d:/claude/nomad/nomad/plan_apply.go#L693) |
| `isValidForDisconnectedNode` | - | `plan *structs.Plan, nodeID string` | `bool` | [L765](file:///d:/claude/nomad/nomad/plan_apply.go#L765) |
| `isValidForDownNode` | - | `plan *structs.Plan, nodeID string` | `bool` | [L778](file:///d:/claude/nomad/nomad/plan_apply.go#L778) |

## 5. 核心方法详解

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

- **组合模式**：结构体嵌入 Server 引用，通过组合获取 Server 上下文
- **Raft 共识**：使用 HashiCorp Raft 库实现分布式共识，保证状态一致性
- **RPC 端点模式**：定义 RPC 端点结构体，将 Server 引用注入端点，处理特定资源的 RPC 请求
- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [plan_apply_test.go](file:///d:/claude/nomad/nomad/plan_apply_test.go) | 对应测试文件 |

