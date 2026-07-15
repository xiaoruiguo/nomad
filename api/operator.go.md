# operator.go 代码说明文档

> 文件路径：[api/operator.go](file:///d:/claude/nomad/api/operator.go)
> 总行数：514 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `operator.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Operator

**定义位置**：[L18](file:///d:/claude/nomad/api/operator.go#L18)

**中文说明**：Operator 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Operator struct {
	c *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `c` | `*Client` | 关联的 Client 实例 |

**关联方法**（15 个）：`RaftGetConfiguration`, `RaftRemovePeerByAddress`, `RaftRemovePeerByID`, `RaftTransferLeadershipByAddress`, `RaftTransferLeadershipByID`, `SchedulerGetConfiguration`, `SchedulerSetConfiguration`, `SchedulerCASConfiguration`, `Snapshot`, `SnapshotRestore`, `LicensePut`, `ApplyLicense`, `LicenseGet`, `UpgradeCheckVaultWorkloadIdentity`, `Utilization`

### RaftServer

**定义位置**：[L28](file:///d:/claude/nomad/api/operator.go#L28)

**中文说明**：RaftServer 与 Raft 共识相关，用于维护集群状态的一致性。

**类型**：struct

```go
type RaftServer struct {
	ID string
	Node string
	Address string
	Leader bool
	Voter bool
	RaftProtocol string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Node` | `string` | 字符串 |
| `Address` | `string` | 地址 |
| `Leader` | `bool` | 布尔值 |
| `Voter` | `bool` | 布尔值 |
| `RaftProtocol` | `string` | 字符串 |

### RaftConfiguration

**定义位置**：[L55](file:///d:/claude/nomad/api/operator.go#L55)

**中文说明**：RaftConfiguration 与 Raft 共识相关，用于维护集群状态的一致性。

**类型**：struct

```go
type RaftConfiguration struct {
	Servers []*RaftServer
	Index uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Servers` | `[]*RaftServer` | 列表 |
| `Index` | `uint64` | 索引 |

### SchedulerConfiguration

**定义位置**：[L169](file:///d:/claude/nomad/api/operator.go#L169)

**中文说明**：SchedulerConfiguration 与调度器（Scheduler）相关，调度器负责将作业分配到合适的节点。

**类型**：struct

```go
type SchedulerConfiguration struct {
	SchedulerAlgorithm SchedulerAlgorithm
	PreemptionConfig PreemptionConfig
	MemoryOversubscriptionEnabled bool
	RejectJobRegistration bool
	PauseEvalBroker bool
	NodeLimitForFeasibilityChecks uint
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SchedulerAlgorithm` | `SchedulerAlgorithm` | — |
| `PreemptionConfig` | `PreemptionConfig` | — |
| `MemoryOversubscriptionEnabled` | `bool` | 布尔值 |
| `RejectJobRegistration` | `bool` | 布尔值 |
| `PauseEvalBroker` | `bool` | 布尔值 |
| `NodeLimitForFeasibilityChecks` | `uint` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### SchedulerConfigurationResponse

**定义位置**：[L201](file:///d:/claude/nomad/api/operator.go#L201)

**中文说明**：SchedulerConfigurationResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SchedulerConfigurationResponse struct {
	SchedulerConfig *SchedulerConfiguration
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SchedulerConfig` | `*SchedulerConfiguration` | — |
| `QueryMeta` | `QueryMeta` | — |

### SchedulerSetConfigurationResponse

**定义位置**：[L210](file:///d:/claude/nomad/api/operator.go#L210)

**中文说明**：SchedulerSetConfigurationResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SchedulerSetConfigurationResponse struct {
	Updated bool
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Updated` | `bool` | 布尔值 |
| `WriteMeta` | `WriteMeta` | — |

### SchedulerAlgorithm

**定义位置**：[L221](file:///d:/claude/nomad/api/operator.go#L221)

**中文说明**：SchedulerAlgorithm 与调度器（Scheduler）相关，调度器负责将作业分配到合适的节点。

**类型定义**：`type SchedulerAlgorithm string`

### PreemptionConfig

**定义位置**：[L229](file:///d:/claude/nomad/api/operator.go#L229)

**中文说明**：PreemptionConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type PreemptionConfig struct {
	SystemSchedulerEnabled bool
	SysBatchSchedulerEnabled bool
	BatchSchedulerEnabled bool
	ServiceSchedulerEnabled bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SystemSchedulerEnabled` | `bool` | 布尔值 |
| `SysBatchSchedulerEnabled` | `bool` | 布尔值 |
| `BatchSchedulerEnabled` | `bool` | 布尔值 |
| `ServiceSchedulerEnabled` | `bool` | 布尔值 |

### License

**定义位置**：[L305](file:///d:/claude/nomad/api/operator.go#L305)

**中文说明**：License 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type License struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `LicenseID` | `string` | 字符串 |
| `CustomerID` | `string` | 字符串 |
| `InstallationID` | `string` | 字符串 |
| `IssueTime` | `time.Time` | 时间点 |
| `StartTime` | `time.Time` | 时间点 |
| `ExpirationTime` | `time.Time` | 时间点 |
| `TerminationTime` | `time.Time` | 时间点 |
| `NonProduction` | `bool` | 布尔值 |
| `Product` | `string` | 字符串 |
| `Flags` | `map[string]interface{}` | 映射表 |
| `Modules` | `[]string` | 列表 |
| `Features` | `[]string` | 列表 |

### LicenseReply

**定义位置**：[L345](file:///d:/claude/nomad/api/operator.go#L345)

**中文说明**：LicenseReply 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type LicenseReply struct {
	License *License
	ConfigOutdated bool
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `License` | `*License` | — |
| `ConfigOutdated` | `bool` | 布尔值 |
| `QueryMeta` | `QueryMeta` | — |

### ApplyLicenseOptions

**定义位置**：[L351](file:///d:/claude/nomad/api/operator.go#L351)

**中文说明**：ApplyLicenseOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type ApplyLicenseOptions struct {
	Force bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Force` | `bool` | 布尔值 |

### LeadershipTransferResponse

**定义位置**：[L421](file:///d:/claude/nomad/api/operator.go#L421)

**中文说明**：LeadershipTransferResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type LeadershipTransferResponse struct {
	From RaftServer
	To RaftServer
	Noop bool
	Err error
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `From` | `RaftServer` | — |
| `To` | `RaftServer` | — |
| `Noop` | `bool` | 布尔值 |
| `Err` | `error` | 错误信息 |
| `WriteMeta` | `WriteMeta` | — |

### VaultWorkloadIdentityUpgradeCheck

**定义位置**：[L432](file:///d:/claude/nomad/api/operator.go#L432)

**中文说明**：VaultWorkloadIdentityUpgradeCheck 与 Vault 集成相关，用于密钥管理和动态凭据。

**类型**：struct

```go
type VaultWorkloadIdentityUpgradeCheck struct {
	JobsWithoutVaultIdentity []*JobListStub
	OutdatedNodes []*NodeListStub
	VaultTokens []*VaultAccessor
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobsWithoutVaultIdentity` | `[]*JobListStub` | 列表 |
| `OutdatedNodes` | `[]*NodeListStub` | 列表 |
| `VaultTokens` | `[]*VaultAccessor` | 列表 |

**关联方法**（1 个）：`Ready`

### VaultAccessor

**定义位置**：[L458](file:///d:/claude/nomad/api/operator.go#L458)

**中文说明**：VaultAccessor 与 Vault 集成相关，用于密钥管理和动态凭据。

**类型**：struct

```go
type VaultAccessor struct {
	AllocID string
	Task string
	NodeID string
	Accessor string
	CreationTTL int
	CreateIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `Task` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `Accessor` | `string` | 字符串 |
| `CreationTTL` | `int` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |

### OperatorUtilizationOptions

**定义位置**：[L490](file:///d:/claude/nomad/api/operator.go#L490)

**中文说明**：OperatorUtilizationOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type OperatorUtilizationOptions struct {
	TodayOnly bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TodayOnly` | `bool` | 布尔值 |

### OperatorUtilizationSnapshotResponse

**定义位置**：[L494](file:///d:/claude/nomad/api/operator.go#L494)

**中文说明**：OperatorUtilizationSnapshotResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type OperatorUtilizationSnapshotResponse struct {
	Bundle []byte
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Bundle` | `[]byte` | 字节数组 |
| `WriteMeta` | `WriteMeta` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `SchedulerAlgorithmBinpack` | `SchedulerAlgorithm` | `"binpack"` | — |
| `SchedulerAlgorithmSpread` | `SchedulerAlgorithm` | `"spread"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Operator` | `c *Client` | `` | `*Operator` | [L23](file:///d:/claude/nomad/api/operator.go#L23) |
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
| `Ready` | `v *VaultWorkloadIdentityUpgradeCheck` | `` | `bool` | [L449](file:///d:/claude/nomad/api/operator.go#L449) |
| `UpgradeCheckVaultWorkloadIdentity` | `op *Operator` | `q *QueryOptions` | `*VaultWorkloadIdentityUpgradeCheck, *QueryMeta, error` | [L481](file:///d:/claude/nomad/api/operator.go#L481) |
| `Utilization` | `op *Operator` | `opts *OperatorUtilizationOptions, w *WriteOptions` | `*OperatorUtilizationSnapshotResponse, *WriteMeta, error` | [L501](file:///d:/claude/nomad/api/operator.go#L501) |

## 5. 核心方法详解

### Snapshot()

**签名**：`func (op *Operator) Snapshot(q *QueryOptions) io.ReadCloser, error`

**位置**：[L271](file:///d:/claude/nomad/api/operator.go#L271)

**中文说明**：创建对象的快照。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `io.ReadCloser` | — |
| `error` | 错误信息 |

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

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HTTP 服务**：提供 HTTP API 端点或客户端

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [operator_test.go](file:///d:/claude/nomad/api/operator_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

