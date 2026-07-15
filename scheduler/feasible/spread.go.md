# spread.go 代码说明文档

> 文件路径：[scheduler/feasible/spread.go](file:///d:/claude/nomad/scheduler/feasible/spread.go)
> 总行数：294 行
> 所属包：`feasible`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **可行性检查子包**（`scheduler/feasible`），实现节点可行性检查器，根据约束、资源、节点池等条件筛选符合条件的节点。

## 2. 类型定义

### SpreadIterator

**定义位置**：[L19](file:///d:/claude/nomad/scheduler/feasible/spread.go#L19)

**中文说明**：SpreadIterator 是一个迭代器，按顺序遍历集合元素。

**类型**：struct

```go
type SpreadIterator struct {
	ctx Context
	source RankIterator
	job *structs.Job
	tg *structs.TaskGroup
	jobSpreads []*structs.Spread
	tgSpreadInfo map[string]spreadAttributeMap
	sumSpreadWeights int32
	lowestSpreadBoost float64
	hasSpread bool
	groupPropertySets map[string][]*propertySet
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `source` | `RankIterator` | — |
| `job` | `*structs.Job` | — |
| `tg` | `*structs.TaskGroup` | — |
| `jobSpreads` | `[]*structs.Spread` | 列表 |
| `tgSpreadInfo` | `map[string]spreadAttributeMap` | 映射表 |
| `sumSpreadWeights` | `int32` | — |
| `lowestSpreadBoost` | `float64` | — |
| `hasSpread` | `bool` | 布尔值 |
| `groupPropertySets` | `map[string][]*propertySet` | 映射表 |

**关联方法**（6 个）：`Reset`, `SetJob`, `SetTaskGroup`, `hasSpreads`, `Next`, `computeSpreadInfo`

### spreadAttributeMap

**定义位置**：[L50](file:///d:/claude/nomad/scheduler/feasible/spread.go#L50)

**类型定义**：`type spreadAttributeMap map[string]*spreadInfo`

### spreadInfo

**定义位置**：[L52](file:///d:/claude/nomad/scheduler/feasible/spread.go#L52)

**中文说明**：spreadInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type spreadInfo struct {
	weight int8
	desiredCounts map[string]float64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `weight` | `int8` | — |
| `desiredCounts` | `map[string]float64` | 映射表 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `implicitTarget` | `—` | `"*"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewSpreadIterator` | - | `ctx Context, source RankIterator` | `*SpreadIterator` | [L57](file:///d:/claude/nomad/scheduler/feasible/spread.go#L57) |
| `Reset` | `iter *SpreadIterator` | `` | `` | [L68](file:///d:/claude/nomad/scheduler/feasible/spread.go#L68) |
| `SetJob` | `iter *SpreadIterator` | `job *structs.Job` | `` | [L77](file:///d:/claude/nomad/scheduler/feasible/spread.go#L77) |
| `SetTaskGroup` | `iter *SpreadIterator` | `tg *structs.TaskGroup` | `` | [L90](file:///d:/claude/nomad/scheduler/feasible/spread.go#L90) |
| `hasSpreads` | `iter *SpreadIterator` | `` | `bool` | [L124](file:///d:/claude/nomad/scheduler/feasible/spread.go#L124) |
| `Next` | `iter *SpreadIterator` | `` | `*RankedNode` | [L128](file:///d:/claude/nomad/scheduler/feasible/spread.go#L128) |
| `evenSpreadScoreBoost` | - | `pset *propertySet, option *structs.Node` | `float64` | [L214](file:///d:/claude/nomad/scheduler/feasible/spread.go#L214) |
| `computeSpreadInfo` | `iter *SpreadIterator` | `tg *structs.TaskGroup` | `` | [L268](file:///d:/claude/nomad/scheduler/feasible/spread.go#L268) |

## 5. 核心方法详解

### NewSpreadIterator()

**签名**：`func NewSpreadIterator(ctx Context, source RankIterator) *SpreadIterator`

**位置**：[L57](file:///d:/claude/nomad/scheduler/feasible/spread.go#L57)

**中文说明**：创建并返回一个新的 SpreadIterator 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `source` | `RankIterator` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*SpreadIterator` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [spread_test.go](file:///d:/claude/nomad/scheduler/feasible/spread_test.go) | 对应测试文件 |
| [context.go](file:///d:/claude/nomad/scheduler/feasible/context.go) | 同目录源文件 |
| [device.go](file:///d:/claude/nomad/scheduler/feasible/device.go) | 同目录源文件 |
| [doc.go](file:///d:/claude/nomad/scheduler/feasible/doc.go) | 同目录源文件 |
| [feasible.go](file:///d:/claude/nomad/scheduler/feasible/feasible.go) | 同目录源文件 |
| [numa_ce.go](file:///d:/claude/nomad/scheduler/feasible/numa_ce.go) | 同目录源文件 |

