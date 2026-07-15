# deployment.go 代码说明文档

> 文件路径：[structs/deployment.go](file:///d:/claude/nomad/nomad/structs/deployment.go)
> 总行数：342 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### Deployment

**定义位置**：[L68](file:///d:/claude/nomad/nomad/structs/deployment.go#L68)

**类型**：struct

```go
	ID string
	Namespace string
	JobID string
	JobVersion uint64
	JobModifyIndex uint64
	JobSpecModifyIndex uint64
	JobCreateIndex uint64
	IsMultiregion bool
	TaskGroups map[string]*DeploymentState
	Status string
	StatusDescription string
	EvalPriority int
	CreateIndex uint64
	ModifyIndex uint64
	CreateTime int64
	ModifyTime int64
```

**关联方法**（11 个）：`Copy`, `Stub`, `Active`, `GetID`, `GetCreateIndex`, `HasPlacedCanaries`, `RequiresPromotion`, `HasAutoPromote`, `GoString`, `GetNamespace`, `IsTerminal`

### DeploymentState

**定义位置**：[L256](file:///d:/claude/nomad/nomad/structs/deployment.go#L256)

**类型**：struct

```go
	AutoRevert bool
	AutoPromote bool
	ProgressDeadline time.Duration
	RequireProgressBy time.Time
	Promoted bool
	PlacedCanaries []string
	DesiredCanaries int
	DesiredTotal int
	PlacedAllocs int
	HealthyAllocs int
	UnhealthyAllocs int
```

**关联方法**（3 个）：`GoString`, `Copy`, `MergeClientValues`

### DeploymentStatusUpdate

**定义位置**：[L329](file:///d:/claude/nomad/nomad/structs/deployment.go#L329)

**类型**：struct

```go
	DeploymentID string
	Status string
	StatusDescription string
	UpdatedAt int64
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `DeploymentStatusRunning` | `"running"` |
| `DeploymentStatusPaused` | `"paused"` |
| `DeploymentStatusFailed` | `"failed"` |
| `DeploymentStatusSuccessful` | `"successful"` |
| `DeploymentStatusCancelled` | `"cancelled"` |
| `DeploymentStatusInitializing` | `"initializing"` |
| `DeploymentStatusPending` | `"pending"` |
| `DeploymentStatusBlocked` | `"blocked"` |
| `DeploymentStatusUnblocking` | `"unblocking"` |
| `DeploymentStatusDescriptionRunning` | `"Deployment is running"` |
| `DeploymentStatusDescriptionRunningNeedsPromotion` | `"Deployment is running but requires manual promotion"` |
| `DeploymentStatusDescriptionRunningAutoPromotion` | `"Deployment is running pending automatic promotion"` |
| `DeploymentStatusDescriptionPaused` | `"Deployment is paused"` |
| `DeploymentStatusDescriptionSuccessful` | `"Deployment completed successfully"` |
| `DeploymentStatusDescriptionStoppedJob` | `"Cancelled because job is stopped"` |
| `DeploymentStatusDescriptionNewerJob` | `"Cancelled due to newer version of job"` |
| `DeploymentStatusDescriptionFailedAllocations` | `"Failed due to unhealthy allocations"` |
| `DeploymentStatusDescriptionProgressDeadline` | `"Failed due to progress deadline"` |
| `DeploymentStatusDescriptionFailedByUser` | `"Deployment marked as failed"` |
| `DeploymentStatusDescriptionFailedByPeer` | `"Failed because of an error in peer region"` |
| `DeploymentStatusDescriptionBlocked` | `"Deployment is complete but waiting for peer region"` |
| `DeploymentStatusDescriptionUnblocking` | `"Deployment is unblocking remaining regions"` |
| `DeploymentStatusDescriptionPendingForPeer` | `"Deployment is pending, waiting for peer region"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `DeploymentStatusDescriptionRollback` | - | `baseDescription string, jobVersion uint64` | `string` | [L50](file:///d:/claude/nomad/nomad/structs/deployment.go#L50) |
| `DeploymentStatusDescriptionRollbackNoop` | - | `baseDescription string, jobVersion uint64` | `string` | [L56](file:///d:/claude/nomad/nomad/structs/deployment.go#L56) |
| `DeploymentStatusDescriptionNoRollbackTarget` | - | `baseDescription string` | `string` | [L62](file:///d:/claude/nomad/nomad/structs/deployment.go#L62) |
| `NewDeployment` | - | `job *Job, evalPriority int, now int64` | `*Deployment` | [L123](file:///d:/claude/nomad/nomad/structs/deployment.go#L123) |
| `Copy` | `d *Deployment` | - | `*Deployment` | [L141](file:///d:/claude/nomad/nomad/structs/deployment.go#L141) |
| `Stub` | `d *Deployment` | - | `*Deployment, error` | [L161](file:///d:/claude/nomad/nomad/structs/deployment.go#L161) |
| `Active` | `d *Deployment` | - | `bool` | [L166](file:///d:/claude/nomad/nomad/structs/deployment.go#L166) |
| `GetID` | `d *Deployment` | - | `string` | [L177](file:///d:/claude/nomad/nomad/structs/deployment.go#L177) |
| `GetCreateIndex` | `d *Deployment` | - | `uint64` | [L186](file:///d:/claude/nomad/nomad/structs/deployment.go#L186) |
| `HasPlacedCanaries` | `d *Deployment` | - | `bool` | [L194](file:///d:/claude/nomad/nomad/structs/deployment.go#L194) |
| `RequiresPromotion` | `d *Deployment` | - | `bool` | [L208](file:///d:/claude/nomad/nomad/structs/deployment.go#L208) |
| `HasAutoPromote` | `d *Deployment` | - | `bool` | [L221](file:///d:/claude/nomad/nomad/structs/deployment.go#L221) |
| `GoString` | `d *Deployment` | - | `string` | [L233](file:///d:/claude/nomad/nomad/structs/deployment.go#L233) |
| `GetNamespace` | `d *Deployment` | - | `string` | [L242](file:///d:/claude/nomad/nomad/structs/deployment.go#L242) |
| `IsTerminal` | `d *Deployment` | - | `bool` | [L249](file:///d:/claude/nomad/nomad/structs/deployment.go#L249) |
| `GoString` | `d *DeploymentState` | - | `string` | [L298](file:///d:/claude/nomad/nomad/structs/deployment.go#L298) |
| `Copy` | `d *DeploymentState` | - | `*DeploymentState` | [L311](file:///d:/claude/nomad/nomad/structs/deployment.go#L311) |
| `MergeClientValues` | `d *DeploymentState` | `c *DeploymentState` | - | [L321](file:///d:/claude/nomad/nomad/structs/deployment.go#L321) |

## 5. 核心方法详解

### GetID()

**签名**：`func (d *Deployment) GetID() string`

**位置**：[L177](file:///d:/claude/nomad/nomad/structs/deployment.go#L177)

### GetCreateIndex()

**签名**：`func (d *Deployment) GetCreateIndex() uint64`

**位置**：[L186](file:///d:/claude/nomad/nomad/structs/deployment.go#L186)

### GetNamespace()

**签名**：`func (d *Deployment) GetNamespace() string`

**位置**：[L242](file:///d:/claude/nomad/nomad/structs/deployment.go#L242)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `slices` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Server 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|

