# util.go 代码说明文档

> 文件路径：[scheduler/util.go](file:///d:/claude/nomad/scheduler/util.go)
> 总行数：966 行
> 所属包：`scheduler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **调度器包**（`scheduler/`），实现 Nomad 的调度逻辑，包括评估处理、节点筛选、分配计划和抢占策略。当前文件 `util.go` 提供相关调度功能。

## 2. 类型定义

### comparison

**定义位置**：[L140](file:///d:/claude/nomad/scheduler/util.go#L140)

**中文说明**：comparison 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type comparison struct {
	modified bool
	label string
	before any
	after any
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `modified` | `bool` | 布尔值 |
| `label` | `string` | 字符串 |
| `before` | `any` | — |
| `after` | `any` | — |

**关联方法**（1 个）：`String`

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `same` | `—` | `comparison{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `readyNodesInDCsAndPool` | - | `state sstructs.State, dcs []string, pool string` | `[]*structs.Node, map[string]struct{...}, map[string]int, ...` | [L23](file:///d:/claude/nomad/scheduler/util.go#L23) |
| `retryMax` | - | `max int, cb func(...), reset func(...)` | `error` | [L67](file:///d:/claude/nomad/scheduler/util.go#L67) |
| `progressMade` | - | `result *structs.PlanResult` | `bool` | [L93](file:///d:/claude/nomad/scheduler/util.go#L93) |
| `taintedNodes` | - | `state sstructs.State, allocs []*structs.Allocation` | `map[string]*structs.Node, error` | [L103](file:///d:/claude/nomad/scheduler/util.go#L103) |
| `difference` | - | `label string, before any, after any` | `comparison` | [L147](file:///d:/claude/nomad/scheduler/util.go#L147) |
| `String` | `c *comparison` | `` | `string` | [L158](file:///d:/claude/nomad/scheduler/util.go#L158) |
| `tasksUpdated` | - | `jobA *structs.Job, jobB *structs.Job, taskGroup string` | `comparison` | [L167](file:///d:/claude/nomad/scheduler/util.go#L167) |
| `nonNetworkResourcesUpdated` | - | `a *structs.Resources, b *structs.Resources` | `comparison` | [L299](file:///d:/claude/nomad/scheduler/util.go#L299) |
| `consulUpdated` | - | `consulA *structs.Consul, consulB *structs.Consul` | `comparison` | [L327](file:///d:/claude/nomad/scheduler/util.go#L327) |
| `connectServiceUpdated` | - | `servicesA []*structs.Service, servicesB []*structs.Service` | `comparison` | [L352](file:///d:/claude/nomad/scheduler/util.go#L352) |
| `volumeMountsUpdated` | - | `a []*structs.VolumeMount, b []*structs.VolumeMount` | `comparison` | [L378](file:///d:/claude/nomad/scheduler/util.go#L378) |
| `volumeMountUpdated` | - | `mountA *structs.VolumeMount, mountB *structs.VolumeMount` | `comparison` | [L391](file:///d:/claude/nomad/scheduler/util.go#L391) |
| `connectUpdated` | - | `connectA *structs.ConsulConnect, connectB *structs.ConsulConnect` | `comparison` | [L409](file:///d:/claude/nomad/scheduler/util.go#L409) |
| `connectSidecarServiceUpdated` | - | `ssA *structs.ConsulSidecarService, ssB *structs.ConsulSidecarService` | `comparison` | [L442](file:///d:/claude/nomad/scheduler/util.go#L442) |
| `networkUpdated` | - | `netA []*structs.NetworkResource, netB []*structs.NetworkResource` | `comparison` | [L466](file:///d:/claude/nomad/scheduler/util.go#L466) |
| `networkPortMap` | - | `n *structs.NetworkResource` | `structs.AllocatedPorts` | [L505](file:///d:/claude/nomad/scheduler/util.go#L505) |
| `renderTemplatesUpdated` | - | `a *structs.RestartPolicy, b *structs.RestartPolicy, msg string` | `comparison` | [L528](file:///d:/claude/nomad/scheduler/util.go#L528) |
| `setStatus` | - | `logger log.Logger, planner sstructs.Planner, eval *structs.Evaluation, spawne...` | `error` | [L544](file:///d:/claude/nomad/scheduler/util.go#L544) |
| `inplaceUpdate` | - | `ctx feasible.Context, eval *structs.Evaluation, job *structs.Job, stack feasi...` | `destructive []reconciler.AllocTuple, inplace []reconciler...` | [L571](file:///d:/claude/nomad/scheduler/util.go#L571) |
| `desiredUpdates` | - | `diff *reconciler.NodeReconcileResult, inplaceUpdates []reconciler.AllocTuple,...` | `map[string]*structs.DesiredUpdates` | [L706](file:///d:/claude/nomad/scheduler/util.go#L706) |
| `adjustQueuedAllocations` | - | `logger log.Logger, result *structs.PlanResult, queuedAllocs map[string]int` | `` | [L748](file:///d:/claude/nomad/scheduler/util.go#L748) |
| `updateNonTerminalAllocsToLost` | - | `plan *structs.Plan, tainted map[string]*structs.Node, allocs []*structs.Alloc...` | `` | [L777](file:///d:/claude/nomad/scheduler/util.go#L777) |
| `genericAllocUpdateFn` | - | `ctx feasible.Context, stack feasible.Stack, evalID string` | `reconciler.AllocUpdateType` | [L805](file:///d:/claude/nomad/scheduler/util.go#L805) |
| `mergeNodeFiltered` | - | `acc *structs.AllocMetric, curr *structs.AllocMetric` | `*structs.AllocMetric` | [L943](file:///d:/claude/nomad/scheduler/util.go#L943) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `slices` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/feasible` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/reconciler` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [util_test.go](file:///d:/claude/nomad/scheduler/util_test.go) | 对应测试文件 |
| [annotate.go](file:///d:/claude/nomad/scheduler/annotate.go) | 同目录源文件 |
| [doc.go](file:///d:/claude/nomad/scheduler/doc.go) | 同目录源文件 |
| [generic_sched.go](file:///d:/claude/nomad/scheduler/generic_sched.go) | 同目录源文件 |
| [scheduler.go](file:///d:/claude/nomad/scheduler/scheduler.go) | 同目录源文件 |
| [scheduler_ce.go](file:///d:/claude/nomad/scheduler/scheduler_ce.go) | 同目录源文件 |

