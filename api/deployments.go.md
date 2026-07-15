# deployments.go 代码说明文档

> 文件路径：[deployments.go](file:///d:/claude/nomad/api/deployments.go)
> 总行数：308 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **部署（Deployment）API 客户端**，提供部署查询、暂停、恢复、回滚、设置分配健康状态等操作的客户端方法。

## 2. 类型定义

### Deployments

**定义位置**：[L12](file:///d:/claude/nomad/api/deployments.go#L12)

**类型**：struct

```go
	client *Client
```

**关联方法**（10 个）：`List`, `PrefixList`, `Info`, `Allocations`, `Fail`, `Pause`, `PromoteAll`, `PromoteGroups`, `Unblock`, `SetAllocHealth`

### Deployment

**定义位置**：[L154](file:///d:/claude/nomad/api/deployments.go#L154)

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
	CreateIndex uint64
	ModifyIndex uint64
	CreateTime int64
	ModifyTime int64
```

### DeploymentState

**定义位置**：[L203](file:///d:/claude/nomad/api/deployments.go#L203)

**类型**：struct

```go
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
```

### DeploymentIndexSort

**定义位置**：[L218](file:///d:/claude/nomad/api/deployments.go#L218)

**类型定义**：`[]*Deployment`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### DeploymentUpdateResponse

**定义位置**：[L235](file:///d:/claude/nomad/api/deployments.go#L235)

**类型**：struct

```go
	EvalID string
	EvalCreateIndex uint64
	DeploymentModifyIndex uint64
	RevertedJobVersion *uint64
	WriteMeta
```

### DeploymentAllocHealthRequest

**定义位置**：[L245](file:///d:/claude/nomad/api/deployments.go#L245)

**类型**：struct

```go
	DeploymentID string
	HealthyAllocationIDs []string
	UnhealthyAllocationIDs []string
	WriteRequest
```

### DeploymentPromoteRequest

**定义位置**：[L259](file:///d:/claude/nomad/api/deployments.go#L259)

**类型**：struct

```go
	DeploymentID string
	All bool
	Groups []string
	PromotedAt int64
	WriteRequest
```

### DeploymentPauseRequest

**定义位置**：[L275](file:///d:/claude/nomad/api/deployments.go#L275)

**类型**：struct

```go
	DeploymentID string
	Pause bool
	WriteRequest
```

### DeploymentSpecificRequest

**定义位置**：[L286](file:///d:/claude/nomad/api/deployments.go#L286)

**类型**：struct

```go
	DeploymentID string
	QueryOptions
```

### DeploymentFailRequest

**定义位置**：[L292](file:///d:/claude/nomad/api/deployments.go#L292)

**类型**：struct

```go
	DeploymentID string
	WriteRequest
```

### DeploymentUnblockRequest

**定义位置**：[L298](file:///d:/claude/nomad/api/deployments.go#L298)

**类型**：struct

```go
	DeploymentID string
	WriteRequest
```

### SingleDeploymentResponse

**定义位置**：[L304](file:///d:/claude/nomad/api/deployments.go#L304)

**类型**：struct

```go
	Deployment *Deployment
	QueryMeta
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
| `DeploymentStatusPending` | `"pending"` |
| `DeploymentStatusBlocked` | `"blocked"` |
| `DeploymentStatusUnblocking` | `"unblocking"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Deployments` | `c *Client` | - | `*Deployments` | [L17](file:///d:/claude/nomad/api/deployments.go#L17) |
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
| `Len` | `d *DeploymentIndexSort` | - | `int` | [L220](file:///d:/claude/nomad/api/deployments.go#L220) |
| `Less` | `d *DeploymentIndexSort` | `i int, j int` | `bool` | [L224](file:///d:/claude/nomad/api/deployments.go#L224) |
| `Swap` | `d *DeploymentIndexSort` | `i int, j int` | - | [L228](file:///d:/claude/nomad/api/deployments.go#L228) |

## 5. 核心方法详解

### Deployments()

**签名**：`func (c *Client) Deployments() *Deployments`

**位置**：[L17](file:///d:/claude/nomad/api/deployments.go#L17)

### List()

**签名**：`func (d *Deployments) List(q *QueryOptions) []*Deployment, *QueryMeta, error`

**位置**：[L22](file:///d:/claude/nomad/api/deployments.go#L22)

### Info()

**签名**：`func (d *Deployments) Info(deploymentID string, q *QueryOptions) *Deployment, *QueryMeta, error`

**位置**：[L37](file:///d:/claude/nomad/api/deployments.go#L37)

### Allocations()

**签名**：`func (d *Deployments) Allocations(deploymentID string, q *QueryOptions) []*AllocationListStub, *QueryMeta, error`

**位置**：[L48](file:///d:/claude/nomad/api/deployments.go#L48)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `sort` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [deployments_test.go](file:///d:/claude/nomad/api/deployments_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

