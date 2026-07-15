# util.go 代码说明文档

> 文件路径：[util.go](file:///d:/claude/nomad/scheduler/util.go)
> 总行数：966 行
> 所属包：`scheduler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件提供 **调度器工具函数**，包括节点过滤、就绪节点查询、数据中心匹配、抢占评估等通用辅助功能，被各调度器实现共享使用。

## 2. 类型定义

### comparison

**定义位置**：[L140](file:///d:/claude/nomad/scheduler/util.go#L140)

**类型**：struct

```go
	modified bool
	label string
	before any
	after any
```

**关联方法**（1 个）：`String`

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `same` | `comparison{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `readyNodesInDCsAndPool` | - | `state sstructs.State, dcs []string, pool string` | `[]*structs.Node, map[string]struct{...}, map[string]int,...` | [L23](file:///d:/claude/nomad/scheduler/util.go#L23) |
| `retryMax` | - | `max int, cb func(...), reset func(...)` | `error` | [L67](file:///d:/claude/nomad/scheduler/util.go#L67) |
| `progressMade` | - | `result *structs.PlanResult` | `bool` | [L93](file:///d:/claude/nomad/scheduler/util.go#L93) |
| `taintedNodes` | - | `state sstructs.State, allocs []*structs.Allocation` | `map[string]*structs.Node, error` | [L103](file:///d:/claude/nomad/scheduler/util.go#L103) |
| `difference` | - | `label string, before any, after any` | `comparison` | [L147](file:///d:/claude/nomad/scheduler/util.go#L147) |
| `String` | `c *comparison` | - | `string` | [L158](file:///d:/claude/nomad/scheduler/util.go#L158) |
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
| `setStatus` | - | `logger log.Logger, planner sstructs.Planner, eval *structs.Evaluation, spawn...` | `error` | [L544](file:///d:/claude/nomad/scheduler/util.go#L544) |
| `inplaceUpdate` | - | `ctx feasible.Context, eval *structs.Evaluation, job *structs.Job, stack feas...` | `destructive []reconciler.AllocTuple, inplace []reconcile...` | [L571](file:///d:/claude/nomad/scheduler/util.go#L571) |
| `desiredUpdates` | - | `diff *reconciler.NodeReconcileResult, inplaceUpdates []reconciler.AllocTuple...` | `map[string]*structs.DesiredUpdates` | [L706](file:///d:/claude/nomad/scheduler/util.go#L706) |
| `adjustQueuedAllocations` | - | `logger log.Logger, result *structs.PlanResult, queuedAllocs map[string]int` | - | [L748](file:///d:/claude/nomad/scheduler/util.go#L748) |
| `updateNonTerminalAllocsToLost` | - | `plan *structs.Plan, tainted map[string]*structs.Node, allocs []*structs.Allo...` | - | [L777](file:///d:/claude/nomad/scheduler/util.go#L777) |
| `genericAllocUpdateFn` | - | `ctx feasible.Context, stack feasible.Stack, evalID string` | `reconciler.AllocUpdateType` | [L805](file:///d:/claude/nomad/scheduler/util.go#L805) |
| `mergeNodeFiltered` | - | `acc *structs.AllocMetric, curr *structs.AllocMetric` | `*structs.AllocMetric` | [L943](file:///d:/claude/nomad/scheduler/util.go#L943) |

## 5. 核心方法详解

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

- **MemDB 状态访问**：通过 MemDB 事务读取集群状态，支持多版本并发控制（MVCC）
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [util_test.go](file:///d:/claude/nomad/scheduler/util_test.go) | 对应测试文件 |

