# eval.go 代码说明文档

> 文件路径：[structs/eval.go](file:///d:/claude/nomad/nomad/structs/eval.go)
> 总行数：523 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### Evaluation

**定义位置**：[L110](file:///d:/claude/nomad/nomad/structs/eval.go#L110)

**类型**：struct

```go
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
```

**关联方法**（15 个）：`GetID`, `GetNamespace`, `GetCreateIndex`, `TerminalStatus`, `GoString`, `RelatedIDs`, `Stub`, `Copy`, `ShouldEnqueue`, `ShouldBlock`, `MakePlan`, `NextRollingEval`, `CreateBlockedEval`, `CreateFailedFollowUpEval`, `UpdateModifyTime`

### EvaluationStub

**定义位置**：[L236](file:///d:/claude/nomad/nomad/structs/eval.go#L236)

**类型**：struct

```go
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
```

### EvalDeleteRequest

**定义位置**：[L507](file:///d:/claude/nomad/nomad/structs/eval.go#L507)

**类型**：struct

```go
	EvalIDs []string
	Filter string
	WriteRequest
```

### EvalDeleteResponse

**定义位置**：[L519](file:///d:/claude/nomad/nomad/structs/eval.go#L519)

**类型**：struct

```go
	Count int
	WriteMeta
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `EvalTriggerJobRegister` | `"job-register"` |
| `EvalTriggerJobDeregister` | `"job-deregister"` |
| `EvalTriggerPeriodicJob` | `"periodic-job"` |
| `EvalTriggerNodeDrain` | `"node-drain"` |
| `EvalTriggerNodeUpdate` | `"node-update"` |
| `EvalTriggerAllocStop` | `"alloc-stop"` |
| `EvalTriggerScheduled` | `"scheduled"` |
| `EvalTriggerRollingUpdate` | `"rolling-update"` |
| `EvalTriggerDeploymentWatcher` | `"deployment-watcher"` |
| `EvalTriggerFailedFollowUp` | `"failed-follow-up"` |
| `EvalTriggerMaxPlans` | `"max-plan-attempts"` |
| `EvalTriggerRetryFailedAlloc` | `"alloc-failure"` |
| `EvalTriggerQueuedAllocs` | `"queued-allocs"` |
| `EvalTriggerPreemption` | `"preemption"` |
| `EvalTriggerScaling` | `"job-scaling"` |
| `EvalTriggerMaxDisconnectTimeout` | `"max-disconnect-timeout"` |
| `EvalTriggerReconnect` | `"reconnect"` |
| `EvalTriggerAllocReschedule` | `"alloc-reschedule"` |
| `EvalStatusBlocked` | `"blocked"` |
| `EvalStatusPending` | `"pending"` |
| `EvalStatusComplete` | `"complete"` |
| `EvalStatusFailed` | `"failed"` |
| `EvalStatusCancelled` | `"canceled"` |
| `EvalDeleteRPCMethod` | `"Eval.Delete"` |
| `CoreJobEvalGC` | `"eval-gc"` |
| `CoreJobNodeGC` | `"node-gc"` |
| `CoreJobJobGC` | `"job-gc"` |
| `CoreJobDeploymentGC` | `"deployment-gc"` |
| `CoreJobCSIVolumeClaimGC` | `"csi-volume-claim-gc"` |
| `CoreJobCSIPluginGC` | `"csi-plugin-gc"` |
| `CoreJobOneTimeTokenGC` | `"one-time-token-gc"` |
| `CoreJobLocalTokenExpiredGC` | `"local-token-expired-gc"` |
| `CoreJobGlobalTokenExpiredGC` | `"global-token-expired-gc"` |
| `CoreJobRootKeyRotateOrGC` | `"root-key-rotate-gc"` |
| `CoreJobVariablesRekey` | `"variables-rekey"` |
| `CoreJobForceGC` | `"force-gc"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GetID` | `e *Evaluation` | - | `string` | [L258](file:///d:/claude/nomad/nomad/structs/eval.go#L258) |
| `GetNamespace` | `e *Evaluation` | - | `string` | [L266](file:///d:/claude/nomad/nomad/structs/eval.go#L266) |
| `GetCreateIndex` | `e *Evaluation` | - | `uint64` | [L275](file:///d:/claude/nomad/nomad/structs/eval.go#L275) |
| `TerminalStatus` | `e *Evaluation` | - | `bool` | [L284](file:///d:/claude/nomad/nomad/structs/eval.go#L284) |
| `GoString` | `e *Evaluation` | - | `string` | [L293](file:///d:/claude/nomad/nomad/structs/eval.go#L293) |
| `RelatedIDs` | `e *Evaluation` | - | `[]string` | [L297](file:///d:/claude/nomad/nomad/structs/eval.go#L297) |
| `Stub` | `e *Evaluation` | - | `*EvaluationStub` | [L314](file:///d:/claude/nomad/nomad/structs/eval.go#L314) |
| `Copy` | `e *Evaluation` | - | `*Evaluation` | [L341](file:///d:/claude/nomad/nomad/structs/eval.go#L341) |
| `ShouldEnqueue` | `e *Evaluation` | - | `bool` | [L380](file:///d:/claude/nomad/nomad/structs/eval.go#L380) |
| `ShouldBlock` | `e *Evaluation` | - | `bool` | [L393](file:///d:/claude/nomad/nomad/structs/eval.go#L393) |
| `MakePlan` | `e *Evaluation` | `j *Job` | `*Plan` | [L406](file:///d:/claude/nomad/nomad/structs/eval.go#L406) |
| `NextRollingEval` | `e *Evaluation` | `wait time.Duration` | `*Evaluation` | [L426](file:///d:/claude/nomad/nomad/structs/eval.go#L426) |
| `CreateBlockedEval` | `e *Evaluation` | `classEligibility map[string]bool, escaped bool, quotaReached string, failedT...` | `*Evaluation` | [L448](file:///d:/claude/nomad/nomad/structs/eval.go#L448) |
| `CreateFailedFollowUpEval` | `e *Evaluation` | `wait time.Duration` | `*Evaluation` | [L474](file:///d:/claude/nomad/nomad/structs/eval.go#L474) |
| `UpdateModifyTime` | `e *Evaluation` | - | - | [L495](file:///d:/claude/nomad/nomad/structs/eval.go#L495) |

## 5. 核心方法详解

### GetID()

**签名**：`func (e *Evaluation) GetID() string`

**位置**：[L258](file:///d:/claude/nomad/nomad/structs/eval.go#L258)

### GetNamespace()

**签名**：`func (e *Evaluation) GetNamespace() string`

**位置**：[L266](file:///d:/claude/nomad/nomad/structs/eval.go#L266)

### GetCreateIndex()

**签名**：`func (e *Evaluation) GetCreateIndex() uint64`

**位置**：[L275](file:///d:/claude/nomad/nomad/structs/eval.go#L275)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Server 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|

