# spread.go 代码说明文档

> 文件路径：[feasible/spread.go](file:///d:/claude/nomad/scheduler/feasible/spread.go)
> 总行数：294 行
> 所属包：`feasible`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **可行性检查子包**（`scheduler/feasible`），实现调度器的可行性检查和评分迭代器栈。包含节点过滤（约束、驱动、设备、网络）、评分（装箱、分散、资源利用率）、抢占、排名等核心调度算法。是调度决策的核心引擎，采用迭代器链模式（Iterator Chain）实现可组合的调度管道。

## 2. 类型定义

### SpreadIterator

**定义位置**：[L19](file:///d:/claude/nomad/scheduler/feasible/spread.go#L19)

**类型**：struct

```go
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
```

**关联方法**（6 个）：`Reset`, `SetJob`, `SetTaskGroup`, `hasSpreads`, `Next`, `computeSpreadInfo`

### spreadAttributeMap

**定义位置**：[L50](file:///d:/claude/nomad/scheduler/feasible/spread.go#L50)

**类型定义**：`map[string]*spreadInfo`

### spreadInfo

**定义位置**：[L52](file:///d:/claude/nomad/scheduler/feasible/spread.go#L52)

**类型**：struct

```go
	weight int8
	desiredCounts map[string]float64
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `implicitTarget` | `"*"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewSpreadIterator` | - | `ctx Context, source RankIterator` | `*SpreadIterator` | [L57](file:///d:/claude/nomad/scheduler/feasible/spread.go#L57) |
| `Reset` | `iter *SpreadIterator` | - | - | [L68](file:///d:/claude/nomad/scheduler/feasible/spread.go#L68) |
| `SetJob` | `iter *SpreadIterator` | `job *structs.Job` | - | [L77](file:///d:/claude/nomad/scheduler/feasible/spread.go#L77) |
| `SetTaskGroup` | `iter *SpreadIterator` | `tg *structs.TaskGroup` | - | [L90](file:///d:/claude/nomad/scheduler/feasible/spread.go#L90) |
| `hasSpreads` | `iter *SpreadIterator` | - | `bool` | [L124](file:///d:/claude/nomad/scheduler/feasible/spread.go#L124) |
| `Next` | `iter *SpreadIterator` | - | `*RankedNode` | [L128](file:///d:/claude/nomad/scheduler/feasible/spread.go#L128) |
| `evenSpreadScoreBoost` | - | `pset *propertySet, option *structs.Node` | `float64` | [L214](file:///d:/claude/nomad/scheduler/feasible/spread.go#L214) |
| `computeSpreadInfo` | `iter *SpreadIterator` | `tg *structs.TaskGroup` | - | [L268](file:///d:/claude/nomad/scheduler/feasible/spread.go#L268) |

## 5. 核心方法详解

### NewSpreadIterator()

**签名**：`func NewSpreadIterator(ctx Context, source RankIterator) *SpreadIterator`

**位置**：[L57](file:///d:/claude/nomad/scheduler/feasible/spread.go#L57)

### Reset()

**签名**：`func (iter *SpreadIterator) Reset() `

**位置**：[L68](file:///d:/claude/nomad/scheduler/feasible/spread.go#L68)

### Next()

**签名**：`func (iter *SpreadIterator) Next() *RankedNode`

**位置**：[L128](file:///d:/claude/nomad/scheduler/feasible/spread.go#L128)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **迭代器链模式**：实现迭代器接口，通过组合形成可配置的调度管道，每个迭代器负责一个调度阶段（过滤、评分、限制等）

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [spread_test.go](file:///d:/claude/nomad/scheduler/feasible/spread_test.go) | 对应测试文件 |

