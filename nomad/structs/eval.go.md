# eval.go 代码说明文档

> 文件路径：[nomad/structs/eval.go](file:///d:/claude/nomad/nomad/structs/eval.go)
> 总行数：523 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 15 个方法/函数。

## 2. 类型定义

### Evaluation

**定义位置**：[L110](file:///d:/claude/nomad/nomad/structs/eval.go#L110)

**中文说明**：Evaluation 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型**：struct

```go
type Evaluation struct {
	_struct bool `codec:",omitempty"`
	ID string
	Namespace string
	Priority int
	Type string
	TriggeredBy string
	JobID string
	JobModifyIndex uint64
	NodeID string
	NodeModifyIndex uint64
	DeploymentID string
	Status string
	StatusDescription string
	Wait time.Duration
	WaitUntil time.Time
	NextEval string
	PreviousEval string
	BlockedEval string
	RelatedEvals []*EvaluationStub
	FailedTGAllocs map[string]*AllocMetric
	PlanAnnotations *PlanAnnotations
	ClassEligibility map[string]bool
	QuotaLimitReached string
	EscapedComputedClass bool
	AnnotatePlan bool
	QueuedAllocations map[string]int
	LeaderACL string
	SnapshotIndex uint64
	CreateIndex uint64
	ModifyIndex uint64
	CreateTime int64
	ModifyTime int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `_struct` | `bool `codec:",omitempty"`` | 布尔值 |
| `ID` | `string` | 唯一标识符 |
| `Namespace` | `string` | 命名空间 |
| `Priority` | `int` | — |
| `Type` | `string` | 类型 |
| `TriggeredBy` | `string` | 字符串 |
| `JobID` | `string` | 字符串 |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `NodeID` | `string` | 字符串 |
| `NodeModifyIndex` | `uint64` | 索引值（uint64） |
| `DeploymentID` | `string` | 字符串 |
| `Status` | `string` | 状态 的 评估 |
| `StatusDescription` | `string` | 字符串 |
| `Wait` | `time.Duration` | 时间间隔 |
| `WaitUntil` | `time.Time` | 时间点 |
| `NextEval` | `string` | 字符串 |
| `PreviousEval` | `string` | 字符串 |
| `BlockedEval` | `string` | 字符串 |
| `RelatedEvals` | `[]*EvaluationStub` | 列表 |
| `FailedTGAllocs` | `map[string]*AllocMetric` | 映射表 |
| `PlanAnnotations` | `*PlanAnnotations` | — |
| `ClassEligibility` | `map[string]bool` | 映射表 |
| `QuotaLimitReached` | `string` | 字符串 |
| `EscapedComputedClass` | `bool` | 布尔值 |
| `AnnotatePlan` | `bool` | 布尔值 |
| `QueuedAllocations` | `map[string]int` | 映射表 |
| `LeaderACL` | `string` | 领导者的管理 ACL 令牌 |
| `SnapshotIndex` | `uint64` | 快照索引，标记调度器首次调用的位置 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyTime` | `int64` | — |

**关联方法**（15 个）：`GetID`, `GetNamespace`, `GetCreateIndex`, `TerminalStatus`, `GoString`, `RelatedIDs`, `Stub`, `Copy`, `ShouldEnqueue`, `ShouldBlock`, `MakePlan`, `NextRollingEval`, `CreateBlockedEval`, `CreateFailedFollowUpEval`, `UpdateModifyTime`

### EvaluationStub

**定义位置**：[L236](file:///d:/claude/nomad/nomad/structs/eval.go#L236)

**中文说明**：EvaluationStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type EvaluationStub struct {
	ID string
	Namespace string
	Priority int
	Type string
	TriggeredBy string
	JobID string
	NodeID string
	DeploymentID string
	Status string
	StatusDescription string
	WaitUntil time.Time
	NextEval string
	PreviousEval string
	BlockedEval string
	CreateIndex uint64
	ModifyIndex uint64
	CreateTime int64
	ModifyTime int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Namespace` | `string` | 命名空间 |
| `Priority` | `int` | — |
| `Type` | `string` | 类型 |
| `TriggeredBy` | `string` | 字符串 |
| `JobID` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `DeploymentID` | `string` | 字符串 |
| `Status` | `string` | 状态 |
| `StatusDescription` | `string` | 字符串 |
| `WaitUntil` | `time.Time` | 时间点 |
| `NextEval` | `string` | 字符串 |
| `PreviousEval` | `string` | 字符串 |
| `BlockedEval` | `string` | 字符串 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyTime` | `int64` | — |

### EvalDeleteRequest

**定义位置**：[L507](file:///d:/claude/nomad/nomad/structs/eval.go#L507)

**中文说明**：EvalDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type EvalDeleteRequest struct {
	EvalIDs []string
	Filter string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalIDs` | `[]string` | 列表 |
| `Filter` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### EvalDeleteResponse

**定义位置**：[L519](file:///d:/claude/nomad/nomad/structs/eval.go#L519)

**中文说明**：EvalDeleteResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type EvalDeleteResponse struct {
	Count int
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Count` | `int` | 计数 |
| `WriteMeta` | `WriteMeta` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `EvalTriggerJobRegister` | `—` | `"job-register"` | — |
| `EvalTriggerJobDeregister` | `—` | `"job-deregister"` | — |
| `EvalTriggerPeriodicJob` | `—` | `"periodic-job"` | — |
| `EvalTriggerNodeDrain` | `—` | `"node-drain"` | — |
| `EvalTriggerNodeUpdate` | `—` | `"node-update"` | — |
| `EvalTriggerAllocStop` | `—` | `"alloc-stop"` | — |
| `EvalTriggerScheduled` | `—` | `"scheduled"` | — |
| `EvalTriggerRollingUpdate` | `—` | `"rolling-update"` | — |
| `EvalTriggerDeploymentWatcher` | `—` | `"deployment-watcher"` | — |
| `EvalTriggerFailedFollowUp` | `—` | `"failed-follow-up"` | — |
| `EvalTriggerMaxPlans` | `—` | `"max-plan-attempts"` | — |
| `EvalTriggerRetryFailedAlloc` | `—` | `"alloc-failure"` | — |
| `EvalTriggerQueuedAllocs` | `—` | `"queued-allocs"` | — |
| `EvalTriggerPreemption` | `—` | `"preemption"` | — |
| `EvalTriggerScaling` | `—` | `"job-scaling"` | — |
| `EvalTriggerMaxDisconnectTimeout` | `—` | `"max-disconnect-timeout"` | — |
| `EvalTriggerReconnect` | `—` | `"reconnect"` | — |
| `EvalTriggerAllocReschedule` | `—` | `"alloc-reschedule"` | — |
| `EvalStatusBlocked` | `—` | `"blocked"` | — |
| `EvalStatusPending` | `—` | `"pending"` | — |
| `EvalStatusComplete` | `—` | `"complete"` | — |
| `EvalStatusFailed` | `—` | `"failed"` | — |
| `EvalStatusCancelled` | `—` | `"canceled"` | — |
| `EvalDeleteRPCMethod` | `—` | `"Eval.Delete"` | — |
| `CoreJobEvalGC` | `—` | `"eval-gc"` | — |
| `CoreJobNodeGC` | `—` | `"node-gc"` | — |
| `CoreJobJobGC` | `—` | `"job-gc"` | — |
| `CoreJobDeploymentGC` | `—` | `"deployment-gc"` | — |
| `CoreJobCSIVolumeClaimGC` | `—` | `"csi-volume-claim-gc"` | — |
| `CoreJobCSIPluginGC` | `—` | `"csi-plugin-gc"` | — |
| `CoreJobOneTimeTokenGC` | `—` | `"one-time-token-gc"` | — |
| `CoreJobLocalTokenExpiredGC` | `—` | `"local-token-expired-gc"` | — |
| `CoreJobGlobalTokenExpiredGC` | `—` | `"global-token-expired-gc"` | — |
| `CoreJobRootKeyRotateOrGC` | `—` | `"root-key-rotate-gc"` | — |
| `CoreJobVariablesRekey` | `—` | `"variables-rekey"` | — |
| `CoreJobForceGC` | `—` | `"force-gc"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GetID` | `e *Evaluation` | `` | `string` | [L258](file:///d:/claude/nomad/nomad/structs/eval.go#L258) |
| `GetNamespace` | `e *Evaluation` | `` | `string` | [L266](file:///d:/claude/nomad/nomad/structs/eval.go#L266) |
| `GetCreateIndex` | `e *Evaluation` | `` | `uint64` | [L275](file:///d:/claude/nomad/nomad/structs/eval.go#L275) |
| `TerminalStatus` | `e *Evaluation` | `` | `bool` | [L284](file:///d:/claude/nomad/nomad/structs/eval.go#L284) |
| `GoString` | `e *Evaluation` | `` | `string` | [L293](file:///d:/claude/nomad/nomad/structs/eval.go#L293) |
| `RelatedIDs` | `e *Evaluation` | `` | `[]string` | [L297](file:///d:/claude/nomad/nomad/structs/eval.go#L297) |
| `Stub` | `e *Evaluation` | `` | `*EvaluationStub` | [L314](file:///d:/claude/nomad/nomad/structs/eval.go#L314) |
| `Copy` | `e *Evaluation` | `` | `*Evaluation` | [L341](file:///d:/claude/nomad/nomad/structs/eval.go#L341) |
| `ShouldEnqueue` | `e *Evaluation` | `` | `bool` | [L380](file:///d:/claude/nomad/nomad/structs/eval.go#L380) |
| `ShouldBlock` | `e *Evaluation` | `` | `bool` | [L393](file:///d:/claude/nomad/nomad/structs/eval.go#L393) |
| `MakePlan` | `e *Evaluation` | `j *Job` | `*Plan` | [L406](file:///d:/claude/nomad/nomad/structs/eval.go#L406) |
| `NextRollingEval` | `e *Evaluation` | `wait time.Duration` | `*Evaluation` | [L426](file:///d:/claude/nomad/nomad/structs/eval.go#L426) |
| `CreateBlockedEval` | `e *Evaluation` | `classEligibility map[string]bool, escaped bool, quotaReached string, failedTG...` | `*Evaluation` | [L448](file:///d:/claude/nomad/nomad/structs/eval.go#L448) |
| `CreateFailedFollowUpEval` | `e *Evaluation` | `wait time.Duration` | `*Evaluation` | [L474](file:///d:/claude/nomad/nomad/structs/eval.go#L474) |
| `UpdateModifyTime` | `e *Evaluation` | `` | `` | [L495](file:///d:/claude/nomad/nomad/structs/eval.go#L495) |

## 5. 核心方法详解

### Copy()

**签名**：`func (e *Evaluation) Copy() *Evaluation`

**位置**：[L341](file:///d:/claude/nomad/nomad/structs/eval.go#L341)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Evaluation` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

