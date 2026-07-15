# filters.go 代码说明文档

> 文件路径：[scheduler/reconciler/filters.go](file:///d:/claude/nomad/scheduler/reconciler/filters.go)
> 总行数：604 行
> 所属包：`reconciler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **调度器包**（`scheduler/`），实现 Nomad 的调度逻辑和算法。

## 2. 类型定义

### allocCategory

**定义位置**：[L114](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L114)

**中文说明**：allocCategory 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型定义**：`type allocCategory string`

### allocContext

**定义位置**：[L127](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L127)

**中文说明**：allocContext 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type allocContext struct {
	alloc *structs.Allocation
	shouldReconnect bool
	taintedNode *structs.Node
	nodeIsTainted bool
	now time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `alloc` | `*structs.Allocation` | — |
| `shouldReconnect` | `bool` | 布尔值 |
| `taintedNode` | `*structs.Node` | — |
| `nodeIsTainted` | `bool` | 布尔值 |
| `now` | `time.Time` | 时间点 |

### classificationRule

**定义位置**：[L135](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L135)

**中文说明**：classificationRule 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type classificationRule struct {
	category allocCategory
	condition func(...)
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `category` | `allocCategory` | — |
| `condition` | `func(...)` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `categoryUntainted` | `allocCategory` | `"untainted"` | — |
| `categoryMigrate` | `allocCategory` | `"migrate"` | — |
| `categoryLost` | `allocCategory` | `"lost"` | — |
| `categoryDisconnecting` | `allocCategory` | `"disconnecting"` | — |
| `categoryReconnecting` | `allocCategory` | `"reconnecting"` | — |
| `categoryIgnore` | `allocCategory` | `"ignore"` | — |
| `categoryExpiring` | `allocCategory` | `"expiring"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `classificationRules` | `—` | `[]classificationRule{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `filterAndStopAll` | `set *allocSet` | `cs ClusterState` | `uint64, []AllocStopResult` | [L16](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L16) |
| `filterServerTerminalAllocs` | `set *allocSet` | `` | `remaining allocSet` | [L41](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L41) |
| `filterByTerminal` | `set *allocSet` | `` | `nonTerminal allocSet` | [L54](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L54) |
| `filterByServerTerminal` | `set *allocSet` | `` | `nonTerminal allocSet` | [L65](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L65) |
| `filterByDeployment` | `set *allocSet` | `id string` | `match allocSet, nonmatch allocSet` | [L77](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L77) |
| `filterOldTerminalAllocs` | `set *allocSet` | `a ReconcilerState` | `remain allocSet, ignore allocSet` | [L93](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L93) |
| `classifyAllocs` | `set *allocSet` | `state ClusterState` | `untainted allocSet, migrate allocSet, lost allocSet, disc...` | [L305](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L305) |
| `filterOutByClientStatus` | `set *allocSet` | `clientStatuses ...string` | `allocSet` | [L365](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L365) |
| `filterByClientStatus` | `set *allocSet` | `clientStatus string` | `allocSet` | [L378](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L378) |
| `filterByRescheduleable` | `set *allocSet` | `isBatch bool, isDisconnecting bool, now time.Time, evalID string, deployment ...` | `untainted allocSet, rescheduleNow allocSet, rescheduleLat...` | [L395](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L395) |
| `shouldFilter` | - | `alloc *structs.Allocation, isBatch bool` | `untainted bool, ignore bool` | [L461](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L461) |
| `updateByReschedulable` | - | `alloc *structs.Allocation, now time.Time, evalID string, d *structs.Deploymen...` | `rescheduleNow bool, rescheduleLater bool, rescheduleTime ...` | [L526](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L526) |
| `delayByStopAfter` | `set *allocSet` | `` | `later []*delayedRescheduleInfo` | [L569](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L569) |
| `delayByLostAfter` | `set *allocSet` | `now time.Time` | `[]*delayedRescheduleInfo, error` | [L591](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L591) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `slices` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [filters_test.go](file:///d:/claude/nomad/scheduler/reconciler/filters_test.go) | 对应测试文件 |
| [allocs.go](file:///d:/claude/nomad/scheduler/reconciler/allocs.go) | 同目录源文件 |
| [doc.go](file:///d:/claude/nomad/scheduler/reconciler/doc.go) | 同目录源文件 |
| [reconcile_cluster.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go) | 同目录源文件 |
| [reconcile_node.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go) | 同目录源文件 |
| [reconnecting_picker.go](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go) | 同目录源文件 |

