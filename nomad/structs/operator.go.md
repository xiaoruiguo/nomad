# operator.go 代码说明文档

> 文件路径：[nomad/structs/operator.go](file:///d:/claude/nomad/nomad/structs/operator.go)
> 总行数：406 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 12 个方法/函数。

## 2. 类型定义

### RaftServer

**定义位置**：[L17](file:///d:/claude/nomad/nomad/structs/operator.go#L17)

**中文说明**：RaftServer 与 Raft 共识相关，用于维护集群状态的一致性。

**类型**：struct

```go
type RaftServer struct {
	ID raft.ServerID
	Node string
	Address raft.ServerAddress
	Leader bool
	Voter bool
	RaftProtocol string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `raft.ServerID` | 唯一标识符 |
| `Node` | `string` | 字符串 |
| `Address` | `raft.ServerAddress` | 地址 |
| `Leader` | `bool` | 布尔值 |
| `Voter` | `bool` | 布尔值 |
| `RaftProtocol` | `string` | 字符串 |

### RaftConfigurationResponse

**定义位置**：[L45](file:///d:/claude/nomad/nomad/structs/operator.go#L45)

**中文说明**：RaftConfigurationResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type RaftConfigurationResponse struct {
	Servers []*RaftServer
	Index uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Servers` | `[]*RaftServer` | 列表 |
| `Index` | `uint64` | 索引 |

### RaftPeerByAddressRequest

**定义位置**：[L57](file:///d:/claude/nomad/nomad/structs/operator.go#L57)

**中文说明**：RaftPeerByAddressRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type RaftPeerByAddressRequest struct {
	Address raft.ServerAddress
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Address` | `raft.ServerAddress` | 地址 |
| `WriteRequest` | `WriteRequest` | — |

### RaftPeerByIDRequest

**定义位置**：[L69](file:///d:/claude/nomad/nomad/structs/operator.go#L69)

**中文说明**：RaftPeerByIDRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type RaftPeerByIDRequest struct {
	ID raft.ServerID
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `raft.ServerID` | ID is 对等节点 ID 到 移除. |
| `WriteRequest` | `WriteRequest` | — |

### RaftPeerRequest

**定义位置**：[L80](file:///d:/claude/nomad/nomad/structs/operator.go#L80)

**中文说明**：RaftPeerRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type RaftPeerRequest struct {
	RaftIDAddress RaftIDAddress
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `RaftIDAddress` | `RaftIDAddress` | — |
| `WriteRequest` | `WriteRequest` | — |

**关联方法**（3 个）：`Validate`, `validateID`, `validateAddress`

### LeadershipTransferResponse

**定义位置**：[L111](file:///d:/claude/nomad/nomad/structs/operator.go#L111)

**中文说明**：LeadershipTransferResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type LeadershipTransferResponse struct {
	From RaftIDAddress
	To RaftIDAddress
	Noop bool
	Err error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `From` | `RaftIDAddress` | — |
| `To` | `RaftIDAddress` | — |
| `Noop` | `bool` | 布尔值 |
| `Err` | `error` | 错误信息 |

### RaftIDAddress

**定义位置**：[L118](file:///d:/claude/nomad/nomad/structs/operator.go#L118)

**中文说明**：RaftIDAddress 与 Raft 共识相关，用于维护集群状态的一致性。

**类型**：struct

```go
type RaftIDAddress struct {
	Address raft.ServerAddress
	ID raft.ServerID
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Address` | `raft.ServerAddress` | 地址 |
| `ID` | `raft.ServerID` | 唯一标识符 |

### AutopilotSetConfigRequest

**定义位置**：[L131](file:///d:/claude/nomad/nomad/structs/operator.go#L131)

**中文说明**：AutopilotSetConfigRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AutopilotSetConfigRequest struct {
	Datacenter string
	Config AutopilotConfig
	CAS bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Datacenter` | `string` | 数据中心 |
| `Config` | `AutopilotConfig` | 配置 |
| `CAS` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

**关联方法**（1 个）：`RequestDatacenter`

### AutopilotConfig

**定义位置**：[L151](file:///d:/claude/nomad/nomad/structs/operator.go#L151)

**中文说明**：AutopilotConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type AutopilotConfig struct {
	CleanupDeadServers bool
	ServerStabilizationTime time.Duration
	LastContactThreshold time.Duration
	MaxTrailingLogs uint64
	MinQuorum uint
	EnableRedundancyZones bool
	DisableUpgradeMigration bool
	EnableCustomUpgrades bool
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CleanupDeadServers` | `bool` | 布尔值 |
| `ServerStabilizationTime` | `time.Duration` | 时间间隔 |
| `LastContactThreshold` | `time.Duration` | 时间间隔 |
| `MaxTrailingLogs` | `uint64` | 无符号 64 位整数 |
| `MinQuorum` | `uint` | — |
| `EnableRedundancyZones` | `bool` | 布尔值 |
| `DisableUpgradeMigration` | `bool` | 布尔值 |
| `EnableCustomUpgrades` | `bool` | 布尔值 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（1 个）：`Copy`

### SchedulerAlgorithm

**定义位置**：[L202](file:///d:/claude/nomad/nomad/structs/operator.go#L202)

**中文说明**：SchedulerAlgorithm 与调度器（Scheduler）相关，调度器负责将作业分配到合适的节点。

**类型定义**：`type SchedulerAlgorithm string`

### SchedulerConfiguration

**定义位置**：[L219](file:///d:/claude/nomad/nomad/structs/operator.go#L219)

**中文说明**：SchedulerConfiguration 与调度器（Scheduler）相关，调度器负责将作业分配到合适的节点。

**类型**：struct

```go
type SchedulerConfiguration struct {
	SchedulerAlgorithm SchedulerAlgorithm `hcl:"scheduler_algorithm"`
	PreemptionConfig PreemptionConfig `hcl:"preemption_config"`
	MemoryOversubscriptionEnabled bool `hcl:"memory_oversubscription_enabled"`
	RejectJobRegistration bool `hcl:"reject_job_registration"`
	PauseEvalBroker bool `hcl:"pause_eval_broker"`
	NodeLimitForFeasibilityChecks uint `hcl:"node_limit_for_feasibility_checks"`
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SchedulerAlgorithm` | `SchedulerAlgorithm `hcl:"scheduler_algorithm"`` | — |
| `PreemptionConfig` | `PreemptionConfig `hcl:"preemption_config"`` | — |
| `MemoryOversubscriptionEnabled` | `bool `hcl:"memory_oversubscription_enabled"`` | 布尔值 |
| `RejectJobRegistration` | `bool `hcl:"reject_job_registration"`` | 布尔值 |
| `PauseEvalBroker` | `bool `hcl:"pause_eval_broker"`` | 布尔值 |
| `NodeLimitForFeasibilityChecks` | `uint `hcl:"node_limit_for_feasibility_checks"`` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（6 个）：`Copy`, `EffectiveSchedulerAlgorithm`, `GetNodeLimitForFeasibilityChecks`, `WithNodePool`, `Canonicalize`, `Validate`

### SchedulerConfigurationResponse

**定义位置**：[L317](file:///d:/claude/nomad/nomad/structs/operator.go#L317)

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

**定义位置**：[L326](file:///d:/claude/nomad/nomad/structs/operator.go#L326)

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

### PreemptionConfig

**定义位置**：[L335](file:///d:/claude/nomad/nomad/structs/operator.go#L335)

**中文说明**：PreemptionConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type PreemptionConfig struct {
	SystemSchedulerEnabled bool `hcl:"system_scheduler_enabled"`
	SysBatchSchedulerEnabled bool `hcl:"sysbatch_scheduler_enabled"`
	BatchSchedulerEnabled bool `hcl:"batch_scheduler_enabled"`
	ServiceSchedulerEnabled bool `hcl:"service_scheduler_enabled"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SystemSchedulerEnabled` | `bool `hcl:"system_scheduler_enabled"`` | 布尔值 |
| `SysBatchSchedulerEnabled` | `bool `hcl:"sysbatch_scheduler_enabled"`` | 布尔值 |
| `BatchSchedulerEnabled` | `bool `hcl:"batch_scheduler_enabled"`` | 布尔值 |
| `ServiceSchedulerEnabled` | `bool `hcl:"service_scheduler_enabled"`` | 布尔值 |

### SchedulerSetConfigRequest

**定义位置**：[L351](file:///d:/claude/nomad/nomad/structs/operator.go#L351)

**中文说明**：SchedulerSetConfigRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type SchedulerSetConfigRequest struct {
	Config SchedulerConfiguration
	CAS bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Config` | `SchedulerConfiguration` | 配置 |
| `CAS` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### SnapshotSaveRequest

**定义位置**：[L363](file:///d:/claude/nomad/nomad/structs/operator.go#L363)

**中文说明**：SnapshotSaveRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type SnapshotSaveRequest struct {
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |

### SnapshotSaveResponse

**定义位置**：[L369](file:///d:/claude/nomad/nomad/structs/operator.go#L369)

**中文说明**：SnapshotSaveResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SnapshotSaveResponse struct {
	SnapshotChecksum string
	ErrorCode int `codec:",omitempty"`
	ErrorMsg string `codec:",omitempty"`
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SnapshotChecksum` | `string` | 字符串 |
| `ErrorCode` | `int `codec:",omitempty"`` | — |
| `ErrorMsg` | `string `codec:",omitempty"`` | 字符串 |
| `QueryMeta` | `QueryMeta` | — |

### SnapshotRestoreRequest

**定义位置**：[L384](file:///d:/claude/nomad/nomad/structs/operator.go#L384)

**中文说明**：SnapshotRestoreRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type SnapshotRestoreRequest struct {
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WriteRequest` | `WriteRequest` | — |

### SnapshotRestoreResponse

**定义位置**：[L388](file:///d:/claude/nomad/nomad/structs/operator.go#L388)

**中文说明**：SnapshotRestoreResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SnapshotRestoreResponse struct {
	ErrorCode int `codec:",omitempty"`
	ErrorMsg string `codec:",omitempty"`
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ErrorCode` | `int `codec:",omitempty"`` | — |
| `ErrorMsg` | `string `codec:",omitempty"`` | 字符串 |
| `QueryMeta` | `QueryMeta` | — |

### UpgradeCheckVaultWorkloadIdentityRequest

**定义位置**：[L395](file:///d:/claude/nomad/nomad/structs/operator.go#L395)

**中文说明**：UpgradeCheckVaultWorkloadIdentityRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type UpgradeCheckVaultWorkloadIdentityRequest struct {
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |

### UpgradeCheckVaultWorkloadIdentityResponse

**定义位置**：[L399](file:///d:/claude/nomad/nomad/structs/operator.go#L399)

**中文说明**：UpgradeCheckVaultWorkloadIdentityResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type UpgradeCheckVaultWorkloadIdentityResponse struct {
	JobsWithoutVaultIdentity []*JobListStub
	OutdatedNodes []*NodeListStub
	VaultTokens []*VaultAccessor
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobsWithoutVaultIdentity` | `[]*JobListStub` | 列表 |
| `OutdatedNodes` | `[]*NodeListStub` | 列表 |
| `VaultTokens` | `[]*VaultAccessor` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `SchedulerAlgorithmBinpack` | `SchedulerAlgorithm` | `"binpack"` | — |
| `SchedulerAlgorithmSpread` | `SchedulerAlgorithm` | `"spread"` | — |
| `DefaultNodeLimitForFeasibilityChecks` | `—` | `100` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Validate` | `r *RaftPeerRequest` | `` | `error` | [L87](file:///d:/claude/nomad/nomad/structs/operator.go#L87) |
| `validateID` | `r *RaftPeerRequest` | `` | `error` | [L97](file:///d:/claude/nomad/nomad/structs/operator.go#L97) |
| `validateAddress` | `r *RaftPeerRequest` | `` | `error` | [L104](file:///d:/claude/nomad/nomad/structs/operator.go#L104) |
| `NewRaftIDAddress` | - | `a raft.ServerAddress, id raft.ServerID` | `RaftIDAddress` | [L125](file:///d:/claude/nomad/nomad/structs/operator.go#L125) |
| `RequestDatacenter` | `op *AutopilotSetConfigRequest` | `` | `string` | [L146](file:///d:/claude/nomad/nomad/structs/operator.go#L146) |
| `Copy` | `a *AutopilotConfig` | `` | `*AutopilotConfig` | [L190](file:///d:/claude/nomad/nomad/structs/operator.go#L190) |
| `Copy` | `s *SchedulerConfiguration` | `` | `*SchedulerConfiguration` | [L252](file:///d:/claude/nomad/nomad/structs/operator.go#L252) |
| `EffectiveSchedulerAlgorithm` | `s *SchedulerConfiguration` | `` | `SchedulerAlgorithm` | [L261](file:///d:/claude/nomad/nomad/structs/operator.go#L261) |
| `GetNodeLimitForFeasibilityChecks` | `s *SchedulerConfiguration` | `` | `uint` | [L269](file:///d:/claude/nomad/nomad/structs/operator.go#L269) |
| `WithNodePool` | `s *SchedulerConfiguration` | `pool *NodePool` | `*SchedulerConfiguration` | [L278](file:///d:/claude/nomad/nomad/structs/operator.go#L278) |
| `Canonicalize` | `s *SchedulerConfiguration` | `` | `` | [L296](file:///d:/claude/nomad/nomad/structs/operator.go#L296) |
| `Validate` | `s *SchedulerConfiguration` | `` | `error` | [L302](file:///d:/claude/nomad/nomad/structs/operator.go#L302) |

## 5. 核心方法详解

### Validate()

**签名**：`func (r *RaftPeerRequest) Validate() error`

**位置**：[L87](file:///d:/claude/nomad/nomad/structs/operator.go#L87)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### NewRaftIDAddress()

**签名**：`func NewRaftIDAddress(a raft.ServerAddress, id raft.ServerID) RaftIDAddress`

**位置**：[L125](file:///d:/claude/nomad/nomad/structs/operator.go#L125)

**中文说明**：创建并返回一个新的 RaftIDAddress 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `a` | `raft.ServerAddress` | — |
| `id` | `raft.ServerID` | 唯一标识符 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `RaftIDAddress` | — |

### Copy()

**签名**：`func (a *AutopilotConfig) Copy() *AutopilotConfig`

**位置**：[L190](file:///d:/claude/nomad/nomad/structs/operator.go#L190)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*AutopilotConfig` | — |

### Copy()

**签名**：`func (s *SchedulerConfiguration) Copy() *SchedulerConfiguration`

**位置**：[L252](file:///d:/claude/nomad/nomad/structs/operator.go#L252)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*SchedulerConfiguration` | — |

### Validate()

**签名**：`func (s *SchedulerConfiguration) Validate() error`

**位置**：[L302](file:///d:/claude/nomad/nomad/structs/operator.go#L302)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `net/netip` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/go-uuid` | 第三方库 |
| `github.com/hashicorp/raft` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **Raft 集成**：与 HashiCorp Raft 库交互，处理共识协议相关操作
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [operator_test.go](file:///d:/claude/nomad/nomad/structs/operator_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

