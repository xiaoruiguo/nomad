# deployments.go 代码说明文档

> 文件路径：[api/deployments.go](file:///d:/claude/nomad/api/deployments.go)
> 总行数：308 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `deployments.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Deployments

**定义位置**：[L12](file:///d:/claude/nomad/api/deployments.go#L12)

**中文说明**：Deployments 与部署（Deployment）相关，部署管理作业的滚动更新过程。

**类型**：struct

```go
type Deployments struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（10 个）：`List`, `PrefixList`, `Info`, `Allocations`, `Fail`, `Pause`, `PromoteAll`, `PromoteGroups`, `Unblock`, `SetAllocHealth`

### Deployment

**定义位置**：[L154](file:///d:/claude/nomad/api/deployments.go#L154)

**中文说明**：Deployment 与部署（Deployment）相关，部署管理作业的滚动更新过程。

**类型**：struct

```go
type Deployment struct {
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
| `JobID` | `string` | 字符串 |
| `JobVersion` | `uint64` | 无符号 64 位整数 |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `JobSpecModifyIndex` | `uint64` | 索引值（uint64） |
| `JobCreateIndex` | `uint64` | 索引值（uint64） |
| `IsMultiregion` | `bool` | 布尔值 |
| `TaskGroups` | `map[string]*DeploymentState` | 映射表 |
| `Status` | `string` | 状态 的 部署 |
| `StatusDescription` | `string` | 字符串 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyTime` | `int64` | — |

### DeploymentState

**定义位置**：[L203](file:///d:/claude/nomad/api/deployments.go#L203)

**中文说明**：DeploymentState 与部署（Deployment）相关，部署管理作业的滚动更新过程。

**类型**：struct

```go
type DeploymentState struct {
	PlacedCanaries []string
	AutoRevert bool
	ProgressDeadline time.Duration
	RequireProgressBy time.Time
	Promoted bool
	DesiredCanaries int
	DesiredTotal int
	PlacedAllocs int
	HealthyAllocs int
	UnhealthyAllocs int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PlacedCanaries` | `[]string` | 列表 |
| `AutoRevert` | `bool` | 布尔值 |
| `ProgressDeadline` | `time.Duration` | 时间间隔 |
| `RequireProgressBy` | `time.Time` | 时间点 |
| `Promoted` | `bool` | 布尔值 |
| `DesiredCanaries` | `int` | — |
| `DesiredTotal` | `int` | — |
| `PlacedAllocs` | `int` | — |
| `HealthyAllocs` | `int` | — |
| `UnhealthyAllocs` | `int` | — |

### DeploymentIndexSort

**定义位置**：[L218](file:///d:/claude/nomad/api/deployments.go#L218)

**中文说明**：DeploymentIndexSort 与部署（Deployment）相关，部署管理作业的滚动更新过程。

**类型定义**：`type DeploymentIndexSort []*Deployment`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### DeploymentUpdateResponse

**定义位置**：[L235](file:///d:/claude/nomad/api/deployments.go#L235)

**中文说明**：DeploymentUpdateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type DeploymentUpdateResponse struct {
	EvalID string
	EvalCreateIndex uint64
	DeploymentModifyIndex uint64
	RevertedJobVersion *uint64
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalID` | `string` | 字符串 |
| `EvalCreateIndex` | `uint64` | 索引值（uint64） |
| `DeploymentModifyIndex` | `uint64` | 索引值（uint64） |
| `RevertedJobVersion` | `*uint64` | 无符号 64 位整数 |
| `WriteMeta` | `WriteMeta` | — |

### DeploymentAllocHealthRequest

**定义位置**：[L245](file:///d:/claude/nomad/api/deployments.go#L245)

**中文说明**：DeploymentAllocHealthRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentAllocHealthRequest struct {
	DeploymentID string
	HealthyAllocationIDs []string
	UnhealthyAllocationIDs []string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `HealthyAllocationIDs` | `[]string` | 列表 |
| `UnhealthyAllocationIDs` | `[]string` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### DeploymentPromoteRequest

**定义位置**：[L259](file:///d:/claude/nomad/api/deployments.go#L259)

**中文说明**：DeploymentPromoteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentPromoteRequest struct {
	DeploymentID string
	All bool
	Groups []string
	PromotedAt int64
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `All` | `bool` | 布尔值 |
| `Groups` | `[]string` | 列表 |
| `PromotedAt` | `int64` | — |
| `WriteRequest` | `WriteRequest` | — |

### DeploymentPauseRequest

**定义位置**：[L275](file:///d:/claude/nomad/api/deployments.go#L275)

**中文说明**：DeploymentPauseRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentPauseRequest struct {
	DeploymentID string
	Pause bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `Pause` | `bool` | 暂停 设置 暂停 状态 |
| `WriteRequest` | `WriteRequest` | — |

### DeploymentSpecificRequest

**定义位置**：[L286](file:///d:/claude/nomad/api/deployments.go#L286)

**中文说明**：DeploymentSpecificRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentSpecificRequest struct {
	DeploymentID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### DeploymentFailRequest

**定义位置**：[L292](file:///d:/claude/nomad/api/deployments.go#L292)

**中文说明**：DeploymentFailRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentFailRequest struct {
	DeploymentID string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### DeploymentUnblockRequest

**定义位置**：[L298](file:///d:/claude/nomad/api/deployments.go#L298)

**中文说明**：DeploymentUnblockRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type DeploymentUnblockRequest struct {
	DeploymentID string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentID` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### SingleDeploymentResponse

**定义位置**：[L304](file:///d:/claude/nomad/api/deployments.go#L304)

**中文说明**：SingleDeploymentResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SingleDeploymentResponse struct {
	Deployment *Deployment
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Deployment` | `*Deployment` | — |
| `QueryMeta` | `QueryMeta` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `DeploymentStatusRunning` | `—` | `"running"` | — |
| `DeploymentStatusPaused` | `—` | `"paused"` | — |
| `DeploymentStatusFailed` | `—` | `"failed"` | — |
| `DeploymentStatusSuccessful` | `—` | `"successful"` | — |
| `DeploymentStatusCancelled` | `—` | `"cancelled"` | — |
| `DeploymentStatusPending` | `—` | `"pending"` | — |
| `DeploymentStatusBlocked` | `—` | `"blocked"` | — |
| `DeploymentStatusUnblocking` | `—` | `"unblocking"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Deployments` | `c *Client` | `` | `*Deployments` | [L17](file:///d:/claude/nomad/api/deployments.go#L17) |
| `List` | `d *Deployments` | `q *QueryOptions` | `[]*Deployment, *QueryMeta, error` | [L22](file:///d:/claude/nomad/api/deployments.go#L22) |
| `PrefixList` | `d *Deployments` | `prefix string` | `[]*Deployment, *QueryMeta, error` | [L32](file:///d:/claude/nomad/api/deployments.go#L32) |
| `Info` | `d *Deployments` | `deploymentID string, q *QueryOptions` | `*Deployment, *QueryMeta, error` | [L37](file:///d:/claude/nomad/api/deployments.go#L37) |
| `Allocations` | `d *Deployments` | `deploymentID string, q *QueryOptions` | `[]*AllocationListStub, *QueryMeta, error` | [L48](file:///d:/claude/nomad/api/deployments.go#L48) |
| `Fail` | `d *Deployments` | `deploymentID string, q *WriteOptions` | `*DeploymentUpdateResponse, *WriteMeta, error` | [L59](file:///d:/claude/nomad/api/deployments.go#L59) |
| `Pause` | `d *Deployments` | `deploymentID string, pause bool, q *WriteOptions` | `*DeploymentUpdateResponse, *WriteMeta, error` | [L72](file:///d:/claude/nomad/api/deployments.go#L72) |
| `PromoteAll` | `d *Deployments` | `deploymentID string, q *WriteOptions` | `*DeploymentUpdateResponse, *WriteMeta, error` | [L86](file:///d:/claude/nomad/api/deployments.go#L86) |
| `PromoteGroups` | `d *Deployments` | `deploymentID string, groups []string, q *WriteOptions` | `*DeploymentUpdateResponse, *WriteMeta, error` | [L100](file:///d:/claude/nomad/api/deployments.go#L100) |
| `Unblock` | `d *Deployments` | `deploymentID string, q *WriteOptions` | `*DeploymentUpdateResponse, *WriteMeta, error` | [L114](file:///d:/claude/nomad/api/deployments.go#L114) |
| `SetAllocHealth` | `d *Deployments` | `deploymentID string, healthy []string, unhealthy []string, q *WriteOptions` | `*DeploymentUpdateResponse, *WriteMeta, error` | [L128](file:///d:/claude/nomad/api/deployments.go#L128) |
| `Len` | `d *DeploymentIndexSort` | `` | `int` | [L220](file:///d:/claude/nomad/api/deployments.go#L220) |
| `Less` | `d *DeploymentIndexSort` | `i int, j int` | `bool` | [L224](file:///d:/claude/nomad/api/deployments.go#L224) |
| `Swap` | `d *DeploymentIndexSort` | `i int, j int` | `` | [L228](file:///d:/claude/nomad/api/deployments.go#L228) |

## 5. 核心方法详解

### List()

**签名**：`func (d *Deployments) List(q *QueryOptions) []*Deployment, *QueryMeta, error`

**位置**：[L22](file:///d:/claude/nomad/api/deployments.go#L22)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*Deployment` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Info()

**签名**：`func (d *Deployments) Info(deploymentID string, q *QueryOptions) *Deployment, *QueryMeta, error`

**位置**：[L37](file:///d:/claude/nomad/api/deployments.go#L37)

**中文说明**：返回对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `deploymentID` | `string` | 字符串 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Deployment` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `sort` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [deployments_test.go](file:///d:/claude/nomad/api/deployments_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

