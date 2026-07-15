# reconcile_node.go 代码说明文档

> 文件路径：[reconciler/reconcile_node.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go)
> 总行数：602 行
> 所属包：`reconciler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **协调器子包**（`scheduler/reconciler`），实现服务/批处理作业的状态协调逻辑。比较现有分配状态与期望状态的差异，计算需要创建、更新、停止、迁移的分配集合。是 GenericScheduler 的第一阶段，将期望状态转换为具体的放置计划。

## 2. 类型定义

### NodeReconciler

**定义位置**：[L16](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L16)

**类型**：struct

```go
	DeploymentOld *structs.Deployment
	DeploymentCurrent *structs.Deployment
	DeploymentUpdates []*structs.DeploymentStatusUpdate
	compatHasSameVersionAllocs bool
```

**关联方法**（5 个）：`Compute`, `computeForNode`, `cancelUnnededSystemDeployments`, `createDeployment`, `compatNodeTooOldForDeployment`

### AllocTuple

**定义位置**：[L565](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L565)

**类型**：struct

```go
	Name string
	TaskGroup *structs.TaskGroup
	Alloc *structs.Allocation
	Canary bool
```

### NodeReconcileResult

**定义位置**：[L573](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L573)

**类型**：struct

```go
	Place, Update, Migrate, Stop, Ignore, Lost, Disconnecting, Reconnecting []AllocTuple
```

**关联方法**（2 个）：`Fields`, `Append`

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `minVersionSystemDeployments` | `version.Must(version.NewVersion("1.11.0"))` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewNodeReconciler` | - | `deployment *structs.Deployment` | `*NodeReconciler` | [L27](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L27) |
| `Compute` | `nr *NodeReconciler` | `job *structs.Job, readyNodes []*structs.Node, notReadyNodes map[string]struc...` | `*NodeReconcileResult` | [L36](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L36) |
| `computeForNode` | `nr *NodeReconciler` | `job *structs.Job, nodeID string, eligibleNodes map[string]*structs.Node, not...` | `*NodeReconcileResult` | [L108](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L108) |
| `cancelUnnededSystemDeployments` | `nr *NodeReconciler` | `j *structs.Job` | - | [L431](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L431) |
| `createDeployment` | `nr *NodeReconciler` | `job *structs.Job, tg *structs.TaskGroup, dstate *structs.DeploymentState, up...` | - | [L472](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L472) |
| `compatNodeTooOldForDeployment` | `nr *NodeReconciler` | `node *structs.Node` | `bool` | [L534](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L534) |
| `materializeSystemTaskGroups` | - | `job *structs.Job` | `map[string]*structs.TaskGroup` | [L549](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L549) |
| `Fields` | `d *NodeReconcileResult` | - | `[]any` | [L577](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L577) |
| `Append` | `d *NodeReconcileResult` | `other *NodeReconcileResult` | - | [L592](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L592) |

## 5. 核心方法详解

### NewNodeReconciler()

**签名**：`func NewNodeReconciler(deployment *structs.Deployment) *NodeReconciler`

**位置**：[L27](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L27)

### Compute()

**签名**：`func (nr *NodeReconciler) Compute(job *structs.Job, readyNodes []*structs.Node, notReadyNodes map[string]struct{...}, taintedNodes map[string]*structs.Node, live []*structs.Allocation, terminal structs.TerminalByNodeByName) *NodeReconcileResult`

**位置**：[L36](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L36)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `slices` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |
| `github.com/hashicorp/go-version` | 第三方库 |

## 7. 设计模式与技术特点

- **状态协调模式**：比较现有状态与期望状态的差异，计算最小变更集合

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [reconcile_node_test.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node_test.go) | 对应测试文件 |

