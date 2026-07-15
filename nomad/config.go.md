# config.go 代码说明文档

> 文件路径：[config.go](file:///d:/claude/nomad/nomad/config.go)
> 总行数：750 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件定义 **Server 运行时配置**，包括 Raft、Serf、RPC、调度器等配置参数，支持从文件和环境变量加载。

## 2. 类型定义

### Config

**定义位置**：[L40](file:///d:/claude/nomad/nomad/config.go#L40)

**类型**：struct

```go
	BootstrapExpect int
	DataDir string
	DevMode bool
	EnableDebug bool
	EnableEventBroker bool
	EventBufferSize int64
	JobMaxSourceSize int
	LogOutput io.Writer
	Logger log.InterceptLogger
	RPCAddr *net.TCPAddr
	ClientRPCAdvertise *net.TCPAddr
	ServerRPCAdvertise *net.TCPAddr
	RaftConfig *raft.Config
	RaftTimeout time.Duration
	NonVoter bool
	RedundancyZone string
	UpgradeVersion string
	SerfConfig *serf.Config
	NodeName string
	NodeID string
	Region string
	AuthoritativeRegion string
	Datacenter string
	Build string
	Revision string
	NumSchedulers int
	EnabledSchedulers []string
	ReconcileInterval time.Duration
	EvalGCInterval time.Duration
	EvalGCThreshold time.Duration
	BatchEvalGCThreshold time.Duration
	JobGCInterval time.Duration
	JobGCThreshold time.Duration
	NodeGCInterval time.Duration
	NodeGCThreshold time.Duration
	DeploymentGCInterval time.Duration
	DeploymentGCThreshold time.Duration
	CSIPluginGCInterval time.Duration
	CSIPluginGCThreshold time.Duration
	CSIVolumeClaimGCInterval time.Duration
	CSIVolumeClaimGCThreshold time.Duration
	OneTimeTokenGCInterval time.Duration
	ACLTokenExpirationGCInterval time.Duration
	ACLTokenExpirationGCThreshold time.Duration
	RootKeyGCInterval time.Duration
	RootKeyGCThreshold time.Duration
	RootKeyRotationThreshold time.Duration
	VariablesRekeyInterval time.Duration
	EvalNackTimeout time.Duration
	EvalDeliveryLimit int
	EvalNackInitialReenqueueDelay time.Duration
	EvalNackSubsequentReenqueueDelay time.Duration
	EvalFailedFollowupBaselineDelay time.Duration
	EvalReapCancelableInterval time.Duration
	EvalFailedFollowupDelayRange time.Duration
	NodePlanRejectionEnabled bool
	NodePlanRejectionThreshold int
	NodePlanRejectionWindow time.Duration
	MinHeartbeatTTL time.Duration
	MaxHeartbeatsPerSecond float64
	HeartbeatGrace time.Duration
	FailoverHeartbeatTTL time.Duration
	ConsulConfigs map[string]*config.ConsulConfig
	VaultConfigs map[string]*config.VaultConfig
	RPCHoldTimeout time.Duration
	TLSConfig *config.TLSConfig
	ACLEnabled bool
	ReplicationBackoff time.Duration
	ReplicationToken string
	ACLTokenMinExpirationTTL time.Duration
	ACLTokenMaxExpirationTTL time.Duration
	SentinelGCInterval time.Duration
	SentinelConfig *config.SentinelConfig
	StatsCollectionInterval time.Duration
	DisableDispatchedJobSummaryMetrics bool
	DisableQuotaUtilizationMetrics bool
	DisableRPCRateMetricsLabels bool
	AutopilotConfig *structs.AutopilotConfig
	ServerHealthInterval time.Duration
	AutopilotInterval time.Duration
	DefaultSchedulerConfig structs.SchedulerConfiguration `hcl:"default_scheduler_config"`
	RPCHandshakeTimeout time.Duration
	RPCMaxConnsPerClient int
	RPCSessionConfig *yamux.Config
	RPCDialTimeout time.Duration
	LicenseConfig *LicenseConfig
	SearchConfig *structs.SearchConfig
	RaftLogStoreConfig *RaftLogStoreConfig
	RaftBoltNoFreelistSync bool
	AgentShutdown func(...)
	DeploymentQueryRateLimit float64
	JobDefaultPriority int
	JobMaxPriority int
	JobTrackedVersions int
	JobMaxCount int
	Reporting *config.ReportingConfig
	OIDCIssuer string
	KEKProviderConfigs []*structs.KEKProviderConfig
	StartTimeout time.Duration
	NodeIntroductionConfig *structs.NodeIntroductionConfig
	LogFile string `hcl:"log_file"`
```

**关联方法**（7 个）：`Copy`, `ConsulServiceIdentity`, `ConsulTaskIdentity`, `VaultIdentityConfig`, `GetVaultForIdentity`, `GetDefaultConsul`, `GetDefaultVault`

### RaftLogStoreConfig

**定义位置**：[L482](file:///d:/claude/nomad/nomad/config.go#L482)

**类型**：struct

```go
	Backend string
	BoltDBNoFreelistSync bool
	WALSegmentSize int
	DisableLogCache bool
	VerificationEnabled bool
	VerificationInterval time.Duration
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `DefaultRegion` | `"global"` |
| `DefaultDC` | `"dc1"` |
| `DefaultSerfPort` | `4648` |
| `LogStoreBackendBoltDB` | `"boltdb"` |
| `LogStoreBackendWAL` | `"wal"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `DefaultRPCAddr` | - | - | `*net.TCPAddr` | [L35](file:///d:/claude/nomad/nomad/config.go#L35) |
| `Copy` | `c *Config` | - | `*Config` | [L503](file:///d:/claude/nomad/nomad/config.go#L503) |
| `ConsulServiceIdentity` | `c *Config` | `cluster string` | `*structs.WorkloadIdentity` | [L538](file:///d:/claude/nomad/nomad/config.go#L538) |
| `ConsulTaskIdentity` | `c *Config` | `cluster string` | `*structs.WorkloadIdentity` | [L549](file:///d:/claude/nomad/nomad/config.go#L549) |
| `VaultIdentityConfig` | `c *Config` | `cluster string` | `*structs.WorkloadIdentity` | [L560](file:///d:/claude/nomad/nomad/config.go#L560) |
| `GetVaultForIdentity` | `c *Config` | `wi *structs.WorkloadIdentity` | `*config.VaultConfig` | [L572](file:///d:/claude/nomad/nomad/config.go#L572) |
| `GetDefaultConsul` | `c *Config` | - | `*config.ConsulConfig` | [L584](file:///d:/claude/nomad/nomad/config.go#L584) |
| `GetDefaultVault` | `c *Config` | - | `*config.VaultConfig` | [L588](file:///d:/claude/nomad/nomad/config.go#L588) |
| `workloadIdentityFromConfig` | - | `widConfig *config.WorkloadIdentityConfig` | `*structs.WorkloadIdentity` | [L594](file:///d:/claude/nomad/nomad/config.go#L594) |
| `DefaultConfig` | - | - | `*Config` | [L622](file:///d:/claude/nomad/nomad/config.go#L622) |

## 5. 核心方法详解

### GetVaultForIdentity()

**签名**：`func (c *Config) GetVaultForIdentity(wi *structs.WorkloadIdentity) *config.VaultConfig`

**位置**：[L572](file:///d:/claude/nomad/nomad/config.go#L572)

### GetDefaultConsul()

**签名**：`func (c *Config) GetDefaultConsul() *config.ConsulConfig`

**位置**：[L584](file:///d:/claude/nomad/nomad/config.go#L584)

### GetDefaultVault()

**签名**：`func (c *Config) GetDefaultVault() *config.VaultConfig`

**位置**：[L588](file:///d:/claude/nomad/nomad/config.go#L588)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `io` | 标准库 |
| `net` | 标准库 |
| `os` | 标准库 |
| `runtime` | 标准库 |
| `slices` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/deploymentwatcher` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs/config` | 内部包 |
| `github.com/hashicorp/nomad/scheduler` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/memberlist` | 第三方库 |
| `github.com/hashicorp/raft` | 第三方库 |
| `github.com/hashicorp/serf/serf` | 第三方库 |
| `github.com/hashicorp/yamux` | 第三方库 |

## 7. 设计模式与技术特点

- **Raft 共识**：使用 HashiCorp Raft 库实现分布式共识，保证状态一致性
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|

