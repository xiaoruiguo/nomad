# reconcile_node.go 代码说明文档

> 文件路径：[scheduler/reconciler/reconcile_node.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go)
> 总行数：602 行
> 所属包：`reconciler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **调度器包**（`scheduler/`），实现 Nomad 的调度逻辑和算法。

## 2. 类型定义

### NodeReconciler

**定义位置**：[L16](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L16)

**中文说明**：NodeReconciler 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeReconciler struct {
	DeploymentOld *structs.Deployment
	DeploymentCurrent *structs.Deployment
	DeploymentUpdates []*structs.DeploymentStatusUpdate
	compatHasSameVersionAllocs bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentOld` | `*structs.Deployment` | — |
| `DeploymentCurrent` | `*structs.Deployment` | — |
| `DeploymentUpdates` | `[]*structs.DeploymentStatusUpdate` | 列表 |
| `compatHasSameVersionAllocs` | `bool` | 布尔值 |

**关联方法**（5 个）：`Compute`, `computeForNode`, `cancelUnnededSystemDeployments`, `createDeployment`, `compatNodeTooOldForDeployment`

### AllocTuple

**定义位置**：[L565](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L565)

**中文说明**：AllocTuple 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocTuple struct {
	Name string
	TaskGroup *structs.TaskGroup
	Alloc *structs.Allocation
	Canary bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `TaskGroup` | `*structs.TaskGroup` | — |
| `Alloc` | `*structs.Allocation` | — |
| `Canary` | `bool` | 布尔值 |

### NodeReconcileResult

**定义位置**：[L573](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L573)

**中文说明**：NodeReconcileResult 是一个结果结构体，封装操作执行的结果。

**类型**：struct

```go
type NodeReconcileResult struct {
	Place, Update, Migrate, Stop, Ignore, Lost, Disconnecting, Reconnecting []AllocTuple
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Place, Update, Migrate, Stop, Ignore, Lost, Disconnecting, Reconnecting` | `[]AllocTuple` | 列表 |

**关联方法**（2 个）：`Fields`, `Append`

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `minVersionSystemDeployments` | `—` | `version.Must(version.NewVersion("1.11.0"))` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewNodeReconciler` | - | `deployment *structs.Deployment` | `*NodeReconciler` | [L27](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L27) |
| `Compute` | `nr *NodeReconciler` | `job *structs.Job, readyNodes []*structs.Node, notReadyNodes map[string]struct...` | `*NodeReconcileResult` | [L36](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L36) |
| `computeForNode` | `nr *NodeReconciler` | `job *structs.Job, nodeID string, eligibleNodes map[string]*structs.Node, notR...` | `*NodeReconcileResult` | [L108](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L108) |
| `cancelUnnededSystemDeployments` | `nr *NodeReconciler` | `j *structs.Job` | `` | [L431](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L431) |
| `createDeployment` | `nr *NodeReconciler` | `job *structs.Job, tg *structs.TaskGroup, dstate *structs.DeploymentState, upd...` | `` | [L472](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L472) |
| `compatNodeTooOldForDeployment` | `nr *NodeReconciler` | `node *structs.Node` | `bool` | [L534](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L534) |
| `materializeSystemTaskGroups` | - | `job *structs.Job` | `map[string]*structs.TaskGroup` | [L549](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L549) |
| `Fields` | `d *NodeReconcileResult` | `` | `[]any` | [L577](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L577) |
| `Append` | `d *NodeReconcileResult` | `other *NodeReconcileResult` | `` | [L592](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L592) |

## 5. 核心方法详解

### NewNodeReconciler()

**签名**：`func NewNodeReconciler(deployment *structs.Deployment) *NodeReconciler`

**位置**：[L27](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go#L27)

**中文说明**：创建并返回一个新的 NodeReconciler 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `deployment` | `*structs.Deployment` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NodeReconciler` | — |

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

- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [reconcile_node_test.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node_test.go) | 对应测试文件 |
| [allocs.go](file:///d:/claude/nomad/scheduler/reconciler/allocs.go) | 同目录源文件 |
| [doc.go](file:///d:/claude/nomad/scheduler/reconciler/doc.go) | 同目录源文件 |
| [filters.go](file:///d:/claude/nomad/scheduler/reconciler/filters.go) | 同目录源文件 |
| [reconcile_cluster.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go) | 同目录源文件 |
| [reconnecting_picker.go](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go) | 同目录源文件 |

