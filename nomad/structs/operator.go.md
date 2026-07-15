# operator.go 代码说明文档

> 文件路径：[structs/operator.go](file:///d:/claude/nomad/nomad/structs/operator.go)
> 总行数：406 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### RaftServer

**定义位置**：[L17](file:///d:/claude/nomad/nomad/structs/operator.go#L17)

**类型**：struct

```go
	ID raft.ServerID
	Node string
	Address raft.ServerAddress
	Leader bool
	Voter bool
	RaftProtocol string
```

### RaftConfigurationResponse

**定义位置**：[L45](file:///d:/claude/nomad/nomad/structs/operator.go#L45)

**类型**：struct

```go
	Servers []*RaftServer
	Index uint64
```

### RaftPeerByAddressRequest

**定义位置**：[L57](file:///d:/claude/nomad/nomad/structs/operator.go#L57)

**类型**：struct

```go
	Address raft.ServerAddress
	WriteRequest
```

### RaftPeerByIDRequest

**定义位置**：[L69](file:///d:/claude/nomad/nomad/structs/operator.go#L69)

**类型**：struct

```go
	ID raft.ServerID
	WriteRequest
```

### RaftPeerRequest

**定义位置**：[L80](file:///d:/claude/nomad/nomad/structs/operator.go#L80)

**类型**：struct

```go
	RaftIDAddress
	WriteRequest
```

**关联方法**（3 个）：`Validate`, `validateID`, `validateAddress`

### LeadershipTransferResponse

**定义位置**：[L111](file:///d:/claude/nomad/nomad/structs/operator.go#L111)

**类型**：struct

```go
	From RaftIDAddress
	To RaftIDAddress
	Noop bool
	Err error
```

### RaftIDAddress

**定义位置**：[L118](file:///d:/claude/nomad/nomad/structs/operator.go#L118)

**类型**：struct

```go
	Address raft.ServerAddress
	ID raft.ServerID
```

### AutopilotSetConfigRequest

**定义位置**：[L131](file:///d:/claude/nomad/nomad/structs/operator.go#L131)

**类型**：struct

```go
	Datacenter string
	Config AutopilotConfig
	CAS bool
	WriteRequest
```

**关联方法**（1 个）：`RequestDatacenter`

### AutopilotConfig

**定义位置**：[L151](file:///d:/claude/nomad/nomad/structs/operator.go#L151)

**类型**：struct

```go
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
```

**关联方法**（1 个）：`Copy`

### SchedulerAlgorithm

**定义位置**：[L202](file:///d:/claude/nomad/nomad/structs/operator.go#L202)

**类型定义**：`string`

### SchedulerConfiguration

**定义位置**：[L219](file:///d:/claude/nomad/nomad/structs/operator.go#L219)

**类型**：struct

```go
	SchedulerAlgorithm SchedulerAlgorithm `hcl:"scheduler_algorithm"`
	PreemptionConfig PreemptionConfig `hcl:"preemption_config"`
	MemoryOversubscriptionEnabled bool `hcl:"memory_oversubscription_enabled"`
	RejectJobRegistration bool `hcl:"reject_job_registration"`
	PauseEvalBroker bool `hcl:"pause_eval_broker"`
	NodeLimitForFeasibilityChecks uint `hcl:"node_limit_for_feasibility_checks"`
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（6 个）：`Copy`, `EffectiveSchedulerAlgorithm`, `GetNodeLimitForFeasibilityChecks`, `WithNodePool`, `Canonicalize`, `Validate`

### SchedulerConfigurationResponse

**定义位置**：[L317](file:///d:/claude/nomad/nomad/structs/operator.go#L317)

**类型**：struct

```go
	SchedulerConfig *SchedulerConfiguration
	QueryMeta
```

### SchedulerSetConfigurationResponse

**定义位置**：[L326](file:///d:/claude/nomad/nomad/structs/operator.go#L326)

**类型**：struct

```go
	Updated bool
	WriteMeta
```

### PreemptionConfig

**定义位置**：[L335](file:///d:/claude/nomad/nomad/structs/operator.go#L335)

**类型**：struct

```go
	SystemSchedulerEnabled bool `hcl:"system_scheduler_enabled"`
	SysBatchSchedulerEnabled bool `hcl:"sysbatch_scheduler_enabled"`
	BatchSchedulerEnabled bool `hcl:"batch_scheduler_enabled"`
	ServiceSchedulerEnabled bool `hcl:"service_scheduler_enabled"`
```

### SchedulerSetConfigRequest

**定义位置**：[L351](file:///d:/claude/nomad/nomad/structs/operator.go#L351)

**类型**：struct

```go
	Config SchedulerConfiguration
	CAS bool
	WriteRequest
```

### SnapshotSaveRequest

**定义位置**：[L363](file:///d:/claude/nomad/nomad/structs/operator.go#L363)

**类型**：struct

```go
	QueryOptions
```

### SnapshotSaveResponse

**定义位置**：[L369](file:///d:/claude/nomad/nomad/structs/operator.go#L369)

**类型**：struct

```go
	SnapshotChecksum string
	ErrorCode int `codec:",omitempty"`
	ErrorMsg string `codec:",omitempty"`
	QueryMeta
```

### SnapshotRestoreRequest

**定义位置**：[L384](file:///d:/claude/nomad/nomad/structs/operator.go#L384)

**类型**：struct

```go
	WriteRequest
```

### SnapshotRestoreResponse

**定义位置**：[L388](file:///d:/claude/nomad/nomad/structs/operator.go#L388)

**类型**：struct

```go
	ErrorCode int `codec:",omitempty"`
	ErrorMsg string `codec:",omitempty"`
	QueryMeta
```

### UpgradeCheckVaultWorkloadIdentityRequest

**定义位置**：[L395](file:///d:/claude/nomad/nomad/structs/operator.go#L395)

**类型**：struct

```go
	QueryOptions
```

### UpgradeCheckVaultWorkloadIdentityResponse

**定义位置**：[L399](file:///d:/claude/nomad/nomad/structs/operator.go#L399)

**类型**：struct

```go
	JobsWithoutVaultIdentity []*JobListStub
	OutdatedNodes []*NodeListStub
	VaultTokens []*VaultAccessor
	QueryMeta
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `SchedulerAlgorithmBinpack` | `"binpack"` |
| `SchedulerAlgorithmSpread` | `"spread"` |
| `DefaultNodeLimitForFeasibilityChecks` | `100` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Validate` | `r *RaftPeerRequest` | - | `error` | [L87](file:///d:/claude/nomad/nomad/structs/operator.go#L87) |
| `validateID` | `r *RaftPeerRequest` | - | `error` | [L97](file:///d:/claude/nomad/nomad/structs/operator.go#L97) |
| `validateAddress` | `r *RaftPeerRequest` | - | `error` | [L104](file:///d:/claude/nomad/nomad/structs/operator.go#L104) |
| `NewRaftIDAddress` | - | `a raft.ServerAddress, id raft.ServerID` | `RaftIDAddress` | [L125](file:///d:/claude/nomad/nomad/structs/operator.go#L125) |
| `RequestDatacenter` | `op *AutopilotSetConfigRequest` | - | `string` | [L146](file:///d:/claude/nomad/nomad/structs/operator.go#L146) |
| `Copy` | `a *AutopilotConfig` | - | `*AutopilotConfig` | [L190](file:///d:/claude/nomad/nomad/structs/operator.go#L190) |
| `Copy` | `s *SchedulerConfiguration` | - | `*SchedulerConfiguration` | [L252](file:///d:/claude/nomad/nomad/structs/operator.go#L252) |
| `EffectiveSchedulerAlgorithm` | `s *SchedulerConfiguration` | - | `SchedulerAlgorithm` | [L261](file:///d:/claude/nomad/nomad/structs/operator.go#L261) |
| `GetNodeLimitForFeasibilityChecks` | `s *SchedulerConfiguration` | - | `uint` | [L269](file:///d:/claude/nomad/nomad/structs/operator.go#L269) |
| `WithNodePool` | `s *SchedulerConfiguration` | `pool *NodePool` | `*SchedulerConfiguration` | [L278](file:///d:/claude/nomad/nomad/structs/operator.go#L278) |
| `Canonicalize` | `s *SchedulerConfiguration` | - | - | [L296](file:///d:/claude/nomad/nomad/structs/operator.go#L296) |
| `Validate` | `s *SchedulerConfiguration` | - | `error` | [L302](file:///d:/claude/nomad/nomad/structs/operator.go#L302) |

## 5. 核心方法详解

### Validate()

**签名**：`func (r *RaftPeerRequest) Validate() error`

**位置**：[L87](file:///d:/claude/nomad/nomad/structs/operator.go#L87)

### GetNodeLimitForFeasibilityChecks()

**签名**：`func (s *SchedulerConfiguration) GetNodeLimitForFeasibilityChecks() uint`

**位置**：[L269](file:///d:/claude/nomad/nomad/structs/operator.go#L269)

### Validate()

**签名**：`func (s *SchedulerConfiguration) Validate() error`

**位置**：[L302](file:///d:/claude/nomad/nomad/structs/operator.go#L302)

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

- **Raft 共识**：使用 HashiCorp Raft 库实现分布式共识，保证状态一致性
- **调度器模式**：实现调度器接口，从评估队列获取评估并产生调度计划
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [operator_test.go](file:///d:/claude/nomad/nomad/structs/operator_test.go) | 对应测试文件 |

