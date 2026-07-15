# propertyset.go 代码说明文档

> 文件路径：[feasible/propertyset.go](file:///d:/claude/nomad/scheduler/feasible/propertyset.go)
> 总行数：374 行
> 所属包：`feasible`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **可行性检查子包**（`scheduler/feasible`），实现调度器的可行性检查和评分迭代器栈。包含节点过滤（约束、驱动、设备、网络）、评分（装箱、分散、资源利用率）、抢占、排名等核心调度算法。是调度决策的核心引擎，采用迭代器链模式（Iterator Chain）实现可组合的调度管道。

## 2. 类型定义

### propertySet

**定义位置**：[L17](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L17)

**类型**：struct

```go
	ctx Context
	logger log.Logger
	jobID string
	namespace string
	taskGroup string
	targetAttribute string
	targetValues *set.Set[string]
	allowedCount uint64
	errorBuilding error
	existingValues map[string]uint64
	proposedValues map[string]uint64
	clearedValues map[string]uint64
```

**关联方法**（15 个）：`SetJobConstraint`, `SetTGConstraint`, `setConstraint`, `SetTargetAttribute`, `setTargetAttributeWithCount`, `SetTargetValues`, `populateExisting`, `PopulateProposed`, `SatisfiesDistinctProperties`, `UsedCount`, `GetCombinedUseMap`, `filterAllocs`, `buildNodeMap`, `populateProperties`, `targetedPropertyValue`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewPropertySet` | - | `ctx Context, job *structs.Job` | `*propertySet` | [L63](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L63) |
| `SetJobConstraint` | `p *propertySet` | `constraint *structs.Constraint` | - | [L78](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L78) |
| `SetTGConstraint` | `p *propertySet` | `constraint *structs.Constraint, taskGroup string` | - | [L85](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L85) |
| `setConstraint` | `p *propertySet` | `constraint *structs.Constraint, taskGroup string` | - | [L90](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L90) |
| `SetTargetAttribute` | `p *propertySet` | `targetAttribute string, taskGroup string` | - | [L110](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L110) |
| `setTargetAttributeWithCount` | `p *propertySet` | `targetAttribute string, allowedCount uint64, taskGroup string` | - | [L116](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L116) |
| `SetTargetValues` | `p *propertySet` | `values []string` | - | [L138](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L138) |
| `populateExisting` | `p *propertySet` | - | - | [L144](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L144) |
| `PopulateProposed` | `p *propertySet` | - | - | [L172](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L172) |
| `SatisfiesDistinctProperties` | `p *propertySet` | `option *structs.Node, tg string` | `bool, string` | [L226](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L226) |
| `UsedCount` | `p *propertySet` | `option *structs.Node, _ string` | `string, string, uint64` | [L243](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L243) |
| `GetCombinedUseMap` | `p *propertySet` | - | `map[string]uint64` | [L263](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L263) |
| `filterAllocs` | `p *propertySet` | `allocs []*structs.Allocation, filterTerminal bool` | `[]*structs.Allocation` | [L294](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L294) |
| `buildNodeMap` | `p *propertySet` | `allocs []*structs.Allocation` | `map[string]*structs.Node, error` | [L319](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L319) |
| `populateProperties` | `p *propertySet` | `allocs []*structs.Allocation, nodes map[string]*structs.Node, properties map...` | - | [L341](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L341) |
| `getProperty` | - | `n *structs.Node, property string` | `string, bool` | [L356](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L356) |
| `targetedPropertyValue` | `p *propertySet` | `propertyValue string` | `string` | [L368](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L368) |

## 5. 核心方法详解

### NewPropertySet()

**签名**：`func NewPropertySet(ctx Context, job *structs.Job) *propertySet`

**位置**：[L63](file:///d:/claude/nomad/scheduler/feasible/propertyset.go#L63)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `strconv` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **MemDB 状态访问**：通过 MemDB 事务读取集群状态，支持多版本并发控制（MVCC）
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|

