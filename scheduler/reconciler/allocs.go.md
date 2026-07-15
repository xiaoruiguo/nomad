# allocs.go 代码说明文档

> 文件路径：[reconciler/allocs.go](file:///d:/claude/nomad/scheduler/reconciler/allocs.go)
> 总行数：444 行
> 所属包：`reconciler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **协调器子包**（`scheduler/reconciler`），实现服务/批处理作业的状态协调逻辑。比较现有分配状态与期望状态的差异，计算需要创建、更新、停止、迁移的分配集合。是 GenericScheduler 的第一阶段，将期望状态转换为具体的放置计划。

## 2. 类型定义

### PlacementResult

**定义位置**：[L23](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L23)

**类型**：interface

```go
	TaskGroup
	Name
	Canary
	PreviousAllocation
	SetPreviousAllocation
	IsRescheduling
	StopPreviousAlloc
	PreviousLost
	DowngradeNonCanary
	MinJobVersion
```

### AllocStopResult

**定义位置**：[L57](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L57)

**类型**：struct

```go
	Alloc *structs.Allocation
	ClientStatus string
	StatusDescription string
	FollowupEvalID string
```

### AllocPlaceResult

**定义位置**：[L66](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L66)

**类型**：struct

```go
	name string
	canary bool
	taskGroup *structs.TaskGroup
	previousAlloc *structs.Allocation
	reschedule bool
	lost bool
	downgradeNonCanary bool
	minJobVersion uint64
```

**关联方法**（11 个）：`TaskGroup`, `Name`, `Canary`, `PreviousAllocation`, `SetPreviousAllocation`, `IsRescheduling`, `StopPreviousAlloc`, `DowngradeNonCanary`, `MinJobVersion`, `PreviousLost`, `SetTaskGroup`

### allocDestructiveResult

**定义位置**：[L95](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L95)

**类型**：struct

```go
	placeName string
	placeTaskGroup *structs.TaskGroup
	stopAlloc *structs.Allocation
	stopStatusDescription string
```

**关联方法**（10 个）：`TaskGroup`, `Name`, `Canary`, `PreviousAllocation`, `SetPreviousAllocation`, `IsRescheduling`, `StopPreviousAlloc`, `DowngradeNonCanary`, `MinJobVersion`, `PreviousLost`

### allocMatrix

**定义位置**：[L116](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L116)

**类型定义**：`map[string]allocSet`

### allocSet

**定义位置**：[L145](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L145)

**类型定义**：`map[string]*structs.Allocation`

**关联方法**（7 个）：`GoString`, `nameSet`, `nameOrder`, `difference`, `union`, `fromKeys`, `update`

### AllocNameIndex

**定义位置**：[L235](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L235)

**类型**：struct

```go
	job, taskGroup string
	count int
	b structs.Bitmap
	duplicates map[uint]int
```

**关联方法**（5 个）：`Highest`, `IsDuplicate`, `UnsetIndex`, `NextCanaries`, `Next`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `TaskGroup` | `a *AllocPlaceResult` | - | `*structs.TaskGroup` | [L78](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L78) |
| `Name` | `a *AllocPlaceResult` | - | `string` | [L79](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L79) |
| `Canary` | `a *AllocPlaceResult` | - | `bool` | [L80](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L80) |
| `PreviousAllocation` | `a *AllocPlaceResult` | - | `*structs.Allocation` | [L81](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L81) |
| `SetPreviousAllocation` | `a *AllocPlaceResult` | `alloc *structs.Allocation` | - | [L82](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L82) |
| `IsRescheduling` | `a *AllocPlaceResult` | - | `bool` | [L85](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L85) |
| `StopPreviousAlloc` | `a *AllocPlaceResult` | - | `bool, string` | [L86](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L86) |
| `DowngradeNonCanary` | `a *AllocPlaceResult` | - | `bool` | [L87](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L87) |
| `MinJobVersion` | `a *AllocPlaceResult` | - | `uint64` | [L88](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L88) |
| `PreviousLost` | `a *AllocPlaceResult` | - | `bool` | [L89](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L89) |
| `SetTaskGroup` | `a *AllocPlaceResult` | `tg *structs.TaskGroup` | - | [L90](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L90) |
| `TaskGroup` | `a *allocDestructiveResult` | - | `*structs.TaskGroup` | [L102](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L102) |
| `Name` | `a *allocDestructiveResult` | - | `string` | [L103](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L103) |
| `Canary` | `a *allocDestructiveResult` | - | `bool` | [L104](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L104) |
| `PreviousAllocation` | `a *allocDestructiveResult` | - | `*structs.Allocation` | [L105](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L105) |
| `SetPreviousAllocation` | `a *allocDestructiveResult` | `alloc *structs.Allocation` | - | [L106](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L106) |
| `IsRescheduling` | `a *allocDestructiveResult` | - | `bool` | [L107](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L107) |
| `StopPreviousAlloc` | `a *allocDestructiveResult` | - | `bool, string` | [L108](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L108) |
| `DowngradeNonCanary` | `a *allocDestructiveResult` | - | `bool` | [L111](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L111) |
| `MinJobVersion` | `a *allocDestructiveResult` | - | `uint64` | [L112](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L112) |
| `PreviousLost` | `a *allocDestructiveResult` | - | `bool` | [L113](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L113) |
| `newAllocMatrix` | - | `job *structs.Job, allocs []*structs.Allocation` | `allocMatrix` | [L120](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L120) |
| `GoString` | `set *allocSet` | - | `string` | [L148](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L148) |
| `nameSet` | `set *allocSet` | - | `map[string]struct{...}` | [L162](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L162) |
| `nameOrder` | `set *allocSet` | - | `[]*structs.Allocation` | [L171](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L171) |
| `difference` | `set *allocSet` | `others ...allocSet` | `allocSet` | [L184](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L184) |
| `union` | `set *allocSet` | `others ...allocSet` | `allocSet` | [L200](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L200) |
| `fromKeys` | `set *allocSet` | `keys []string` | `allocSet` | [L211](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L211) |
| `update` | `set *allocSet` | `other allocSet` | `updated allocSet` | [L223](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L223) |
| `newAllocNameIndex` | - | `job string, taskGroup string, count int, in allocSet` | `*AllocNameIndex` | [L251](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L251) |
| `bitmapFrom` | - | `input allocSet, minSize uint` | `structs.Bitmap, map[uint]int` | [L267](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L267) |
| `Highest` | `a *AllocNameIndex` | `n uint` | `map[string]struct{...}` | [L325](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L325) |
| `IsDuplicate` | `a *AllocNameIndex` | `idx uint` | `bool` | [L341](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L341) |
| `UnsetIndex` | `a *AllocNameIndex` | `idx uint` | - | [L347](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L347) |
| `NextCanaries` | `a *AllocNameIndex` | `n uint, existing allocSet, destructive allocSet` | `[]string` | [L362](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L362) |
| `Next` | `a *AllocNameIndex` | `n uint` | `[]string` | [L419](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L419) |

## 5. 核心方法详解

### Next()

**签名**：`func (a *AllocNameIndex) Next(n uint) []string`

**位置**：[L419](file:///d:/claude/nomad/scheduler/reconciler/allocs.go#L419)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [allocs_test.go](file:///d:/claude/nomad/scheduler/reconciler/allocs_test.go) | 对应测试文件 |

