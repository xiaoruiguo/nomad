# operator.go 代码说明文档

> 文件路径：[operator.go](file:///d:/claude/nomad/api/operator.go)
> 总行数：514 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **运维（Operator）API 客户端**，提供 Raft 管理、调度器配置、快照、自动舵、密钥环等运维操作的客户端方法。

## 2. 类型定义

### Operator

**定义位置**：[L18](file:///d:/claude/nomad/api/operator.go#L18)

**类型**：struct

```go
	c *Client
```

**关联方法**（15 个）：`RaftGetConfiguration`, `RaftRemovePeerByAddress`, `RaftRemovePeerByID`, `RaftTransferLeadershipByAddress`, `RaftTransferLeadershipByID`, `SchedulerGetConfiguration`, `SchedulerSetConfiguration`, `SchedulerCASConfiguration`, `Snapshot`, `SnapshotRestore`, `LicensePut`, `ApplyLicense`, `LicenseGet`, `UpgradeCheckVaultWorkloadIdentity`, `Utilization`

### RaftServer

**定义位置**：[L28](file:///d:/claude/nomad/api/operator.go#L28)

**类型**：struct

```go
	ID string
	Node string
	Address string
	Leader bool
	Voter bool
	RaftProtocol string
```

### RaftConfiguration

**定义位置**：[L55](file:///d:/claude/nomad/api/operator.go#L55)

**类型**：struct

```go
	Servers []*RaftServer
	Index uint64
```

### SchedulerConfiguration

**定义位置**：[L169](file:///d:/claude/nomad/api/operator.go#L169)

**类型**：struct

```go
	SchedulerAlgorithm SchedulerAlgorithm
	PreemptionConfig PreemptionConfig
	MemoryOversubscriptionEnabled bool
	RejectJobRegistration bool
	PauseEvalBroker bool
	NodeLimitForFeasibilityChecks uint
	CreateIndex uint64
	ModifyIndex uint64
```

### SchedulerConfigurationResponse

**定义位置**：[L201](file:///d:/claude/nomad/api/operator.go#L201)

**类型**：struct

```go
	SchedulerConfig *SchedulerConfiguration
	QueryMeta
```

### SchedulerSetConfigurationResponse

**定义位置**：[L210](file:///d:/claude/nomad/api/operator.go#L210)

**类型**：struct

```go
	Updated bool
	WriteMeta
```

### SchedulerAlgorithm

**定义位置**：[L221](file:///d:/claude/nomad/api/operator.go#L221)

**类型定义**：`string`

### PreemptionConfig

**定义位置**：[L229](file:///d:/claude/nomad/api/operator.go#L229)

**类型**：struct

```go
	SystemSchedulerEnabled bool
	SysBatchSchedulerEnabled bool
	BatchSchedulerEnabled bool
	ServiceSchedulerEnabled bool
```

### License

**定义位置**：[L305](file:///d:/claude/nomad/api/operator.go#L305)

**类型**：struct

```go
	LicenseID string
	CustomerID string
	InstallationID string
	IssueTime time.Time
	StartTime time.Time
	ExpirationTime time.Time
	TerminationTime time.Time
	NonProduction bool
	Product string
	Flags map[string]interface{}
	Modules []string
	Features []string
```

### LicenseReply

**定义位置**：[L345](file:///d:/claude/nomad/api/operator.go#L345)

**类型**：struct

```go
	License *License
	ConfigOutdated bool
	QueryMeta
```

### ApplyLicenseOptions

**定义位置**：[L351](file:///d:/claude/nomad/api/operator.go#L351)

**类型**：struct

```go
	Force bool
```

### LeadershipTransferResponse

**定义位置**：[L421](file:///d:/claude/nomad/api/operator.go#L421)

**类型**：struct

```go
	From RaftServer
	To RaftServer
	Noop bool
	Err error
	WriteMeta
```

### VaultWorkloadIdentityUpgradeCheck

**定义位置**：[L432](file:///d:/claude/nomad/api/operator.go#L432)

**类型**：struct

```go
	JobsWithoutVaultIdentity []*JobListStub
	OutdatedNodes []*NodeListStub
	VaultTokens []*VaultAccessor
```

**关联方法**（1 个）：`Ready`

### VaultAccessor

**定义位置**：[L458](file:///d:/claude/nomad/api/operator.go#L458)

**类型**：struct

```go
	AllocID string
	Task string
	NodeID string
	Accessor string
	CreationTTL int
	CreateIndex uint64
```

### OperatorUtilizationOptions

**定义位置**：[L490](file:///d:/claude/nomad/api/operator.go#L490)

**类型**：struct

```go
	TodayOnly bool
```

### OperatorUtilizationSnapshotResponse

**定义位置**：[L494](file:///d:/claude/nomad/api/operator.go#L494)

**类型**：struct

```go
	Bundle []byte
	WriteMeta
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `SchedulerAlgorithmBinpack` | `"binpack"` |
| `SchedulerAlgorithmSpread` | `"spread"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Operator` | `c *Client` | - | `*Operator` | [L23](file:///d:/claude/nomad/api/operator.go#L23) |
| `RaftGetConfiguration` | `op *Operator` | `q *QueryOptions` | `*RaftConfiguration, error` | [L64](file:///d:/claude/nomad/api/operator.go#L64) |
| `RaftRemovePeerByAddress` | `op *Operator` | `address string, q *WriteOptions` | `error` | [L90](file:///d:/claude/nomad/api/operator.go#L90) |
| `RaftRemovePeerByID` | `op *Operator` | `id string, q *WriteOptions` | `error` | [L110](file:///d:/claude/nomad/api/operator.go#L110) |
| `RaftTransferLeadershipByAddress` | `op *Operator` | `address string, q *WriteOptions` | `error` | [L130](file:///d:/claude/nomad/api/operator.go#L130) |
| `RaftTransferLeadershipByID` | `op *Operator` | `id string, q *WriteOptions` | `error` | [L150](file:///d:/claude/nomad/api/operator.go#L150) |
| `SchedulerGetConfiguration` | `op *Operator` | `q *QueryOptions` | `*SchedulerConfigurationResponse, *QueryMeta, error` | [L237](file:///d:/claude/nomad/api/operator.go#L237) |
| `SchedulerSetConfiguration` | `op *Operator` | `conf *SchedulerConfiguration, q *WriteOptions` | `*SchedulerSetConfigurationResponse, *WriteMeta, error` | [L247](file:///d:/claude/nomad/api/operator.go#L247) |
| `SchedulerCASConfiguration` | `op *Operator` | `conf *SchedulerConfiguration, q *WriteOptions` | `*SchedulerSetConfigurationResponse, *WriteMeta, error` | [L259](file:///d:/claude/nomad/api/operator.go#L259) |
| `Snapshot` | `op *Operator` | `q *QueryOptions` | `io.ReadCloser, error` | [L271](file:///d:/claude/nomad/api/operator.go#L271) |
| `SnapshotRestore` | `op *Operator` | `in io.Reader, q *WriteOptions` | `*WriteMeta, error` | [L296](file:///d:/claude/nomad/api/operator.go#L296) |
| `LicensePut` | `op *Operator` | `license string, q *WriteOptions` | `*WriteMeta, error` | [L355](file:///d:/claude/nomad/api/operator.go#L355) |
| `ApplyLicense` | `op *Operator` | `license string, opts *ApplyLicenseOptions, q *WriteOptions` | `*WriteMeta, error` | [L359](file:///d:/claude/nomad/api/operator.go#L359) |
| `LicenseGet` | `op *Operator` | `q *QueryOptions` | `*LicenseReply, *QueryMeta, error` | [L384](file:///d:/claude/nomad/api/operator.go#L384) |
| `Ready` | `v *VaultWorkloadIdentityUpgradeCheck` | - | `bool` | [L449](file:///d:/claude/nomad/api/operator.go#L449) |
| `UpgradeCheckVaultWorkloadIdentity` | `op *Operator` | `q *QueryOptions` | `*VaultWorkloadIdentityUpgradeCheck, *QueryMeta, error` | [L481](file:///d:/claude/nomad/api/operator.go#L481) |
| `Utilization` | `op *Operator` | `opts *OperatorUtilizationOptions, w *WriteOptions` | `*OperatorUtilizationSnapshotResponse, *WriteMeta, error` | [L501](file:///d:/claude/nomad/api/operator.go#L501) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `io` | 标准库 |
| `net/http` | 标准库 |
| `net/url` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **流式响应**：返回 `io.ReadCloser` 或 channel，支持流式数据读取（如日志流、事件流）
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [operator_test.go](file:///d:/claude/nomad/api/operator_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

