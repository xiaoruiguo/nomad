# filters.go 代码说明文档

> 文件路径：[reconciler/filters.go](file:///d:/claude/nomad/scheduler/reconciler/filters.go)
> 总行数：604 行
> 所属包：`reconciler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **协调器子包**（`scheduler/reconciler`），实现服务/批处理作业的状态协调逻辑。比较现有分配状态与期望状态的差异，计算需要创建、更新、停止、迁移的分配集合。是 GenericScheduler 的第一阶段，将期望状态转换为具体的放置计划。

## 2. 类型定义

### allocCategory

**定义位置**：[L114](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L114)

**类型定义**：`string`

### allocContext

**定义位置**：[L127](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L127)

**类型**：struct

```go
	alloc *structs.Allocation
	shouldReconnect bool
	taintedNode *structs.Node
	nodeIsTainted bool
	now time.Time
```

### classificationRule

**定义位置**：[L135](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L135)

**类型**：struct

```go
	category allocCategory
	condition func(...)
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `categoryUntainted` | `"untainted"` |
| `categoryMigrate` | `"migrate"` |
| `categoryLost` | `"lost"` |
| `categoryDisconnecting` | `"disconnecting"` |
| `categoryReconnecting` | `"reconnecting"` |
| `categoryIgnore` | `"ignore"` |
| `categoryExpiring` | `"expiring"` |

### 变量

| 名称 | 值 |
|------|----|
| `classificationRules` | `[]classificationRule{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `filterAndStopAll` | `set *allocSet` | `cs ClusterState` | `uint64, []AllocStopResult` | [L16](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L16) |
| `filterServerTerminalAllocs` | `set *allocSet` | - | `remaining allocSet` | [L41](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L41) |
| `filterByTerminal` | `set *allocSet` | - | `nonTerminal allocSet` | [L54](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L54) |
| `filterByServerTerminal` | `set *allocSet` | - | `nonTerminal allocSet` | [L65](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L65) |
| `filterByDeployment` | `set *allocSet` | `id string` | `match allocSet, nonmatch allocSet` | [L77](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L77) |
| `filterOldTerminalAllocs` | `set *allocSet` | `a ReconcilerState` | `remain allocSet, ignore allocSet` | [L93](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L93) |
| `classifyAllocs` | `set *allocSet` | `state ClusterState` | `untainted allocSet, migrate allocSet, lost allocSet, dis...` | [L305](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L305) |
| `filterOutByClientStatus` | `set *allocSet` | `clientStatuses ...string` | `allocSet` | [L365](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L365) |
| `filterByClientStatus` | `set *allocSet` | `clientStatus string` | `allocSet` | [L378](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L378) |
| `filterByRescheduleable` | `set *allocSet` | `isBatch bool, isDisconnecting bool, now time.Time, evalID string, deployment...` | `untainted allocSet, rescheduleNow allocSet, rescheduleLa...` | [L395](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L395) |
| `shouldFilter` | - | `alloc *structs.Allocation, isBatch bool` | `untainted bool, ignore bool` | [L461](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L461) |
| `updateByReschedulable` | - | `alloc *structs.Allocation, now time.Time, evalID string, d *structs.Deployme...` | `rescheduleNow bool, rescheduleLater bool, rescheduleTime...` | [L526](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L526) |
| `delayByStopAfter` | `set *allocSet` | - | `later []*delayedRescheduleInfo` | [L569](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L569) |
| `delayByLostAfter` | `set *allocSet` | `now time.Time` | `[]*delayedRescheduleInfo, error` | [L591](file:///d:/claude/nomad/scheduler/reconciler/filters.go#L591) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `slices` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 调度器的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [filters_test.go](file:///d:/claude/nomad/scheduler/reconciler/filters_test.go) | 对应测试文件 |

