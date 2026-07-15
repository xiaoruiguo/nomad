# nodes.go 代码说明文档

> 文件路径：[nodes.go](file:///d:/claude/nomad/api/nodes.go)
> 总行数：976 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **节点（Node）API 客户端**，提供节点查询、排水、资格管理、节点池操作等客户端方法。

## 2. 类型定义

### Nodes

**定义位置**：[L32](file:///d:/claude/nomad/api/nodes.go#L32)

**类型**：struct

```go
	client *Client
```

**关联方法**（18 个）：`List`, `PrefixList`, `PrefixListOpts`, `Info`, `UpdateDrain`, `UpdateDrainOpts`, `MonitorDrain`, `monitorDrainMultiplex`, `monitorDrainNode`, `monitorDrainAllocs`, `ToggleEligibility`, `Allocations`, `CSIVolumes`, `ForceEvaluate`, `Stats`, `GC`, `GcAlloc`, `Purge`

### NodeUpdateDrainRequest

**定义位置**：[L76](file:///d:/claude/nomad/api/nodes.go#L76)

**类型**：struct

```go
	NodeID string
	DrainSpec *DrainSpec
	MarkEligible bool
	Meta map[string]string
```

### NodeDrainUpdateResponse

**定义位置**：[L93](file:///d:/claude/nomad/api/nodes.go#L93)

**类型**：struct

```go
	NodeModifyIndex uint64
	EvalIDs []string
	EvalCreateIndex uint64
	WriteMeta
```

### DrainOptions

**定义位置**：[L101](file:///d:/claude/nomad/api/nodes.go#L101)

**类型**：struct

```go
	DrainSpec *DrainSpec
	MarkEligible bool
	Meta map[string]string
```

### MonitorMsgLevel

**定义位置**：[L151](file:///d:/claude/nomad/api/nodes.go#L151)

**类型定义**：`int`

### MonitorMessage

**定义位置**：[L161](file:///d:/claude/nomad/api/nodes.go#L161)

**类型**：struct

```go
	Level MonitorMsgLevel
	Message string
```

**关联方法**（1 个）：`String`

### NodeUpdateEligibilityRequest

**定义位置**：[L399](file:///d:/claude/nomad/api/nodes.go#L399)

**类型**：struct

```go
	NodeID string
	Eligibility string
```

### NodeEligibilityUpdateResponse

**定义位置**：[L406](file:///d:/claude/nomad/api/nodes.go#L406)

**类型**：struct

```go
	NodeModifyIndex uint64
	EvalIDs []string
	EvalCreateIndex uint64
	WriteMeta
```

### NodePurgeResponse

**定义位置**：[L501](file:///d:/claude/nomad/api/nodes.go#L501)

**类型**：struct

```go
	EvalIDs []string
	EvalCreateIndex uint64
	NodeModifyIndex uint64
```

### DriverInfo

**定义位置**：[L508](file:///d:/claude/nomad/api/nodes.go#L508)

**类型**：struct

```go
	Attributes map[string]string
	Detected bool
	Healthy bool
	HealthDescription string
	UpdateTime time.Time
```

### HostVolumeInfo

**定义位置**：[L517](file:///d:/claude/nomad/api/nodes.go#L517)

**类型**：struct

```go
	Path string
	ReadOnly bool
	ID string
```

### HostNetworkInfo

**定义位置**：[L525](file:///d:/claude/nomad/api/nodes.go#L525)

**类型**：struct

```go
	Name string
	CIDR string
	Interface string
	ReservedPorts string
```

### DrainStatus

**定义位置**：[L532](file:///d:/claude/nomad/api/nodes.go#L532)

**类型定义**：`string`

### DrainMetadata

**定义位置**：[L535](file:///d:/claude/nomad/api/nodes.go#L535)

**类型**：struct

```go
	StartedAt time.Time
	UpdatedAt time.Time
	Status DrainStatus
	AccessorID string
	Meta map[string]string
```

### Node

**定义位置**：[L544](file:///d:/claude/nomad/api/nodes.go#L544)

**类型**：struct

```go
	ID string
	Datacenter string
	Name string
	HTTPAddr string
	TLSEnabled bool
	Attributes map[string]string
	Resources *Resources
	Reserved *Resources
	NodeResources *NodeResources
	ReservedResources *NodeReservedResources
	Links map[string]string
	Meta map[string]string
	NodeClass string
	NodePool string
	CgroupParent string
	Drain bool
	DrainStrategy *DrainStrategy
	SchedulingEligibility string
	Status string
	StatusDescription string
	StatusUpdatedAt int64
	Events []*NodeEvent
	Drivers map[string]*DriverInfo
	HostVolumes map[string]*HostVolumeInfo
	GCVolumesOnNodeGC bool
	HostNetworks map[string]*HostNetworkInfo
	CSIControllerPlugins map[string]*CSIInfo
	CSINodePlugins map[string]*CSIInfo
	LastDrain *DrainMetadata
	CreateIndex uint64
	ModifyIndex uint64
	NodeMaxAllocs int
```

### NodeResources

**定义位置**：[L584](file:///d:/claude/nomad/api/nodes.go#L584)

**类型**：struct

```go
	Cpu NodeCpuResources
	Memory NodeMemoryResources
	Disk NodeDiskResources
	Networks []*NetworkResource
	Devices []*NodeDeviceResource
	MinDynamicPort int
	MaxDynamicPort int
```

### NodeCpuResources

**定义位置**：[L595](file:///d:/claude/nomad/api/nodes.go#L595)

**类型**：struct

```go
	CpuShares int64
	TotalCpuCores uint16
	ReservableCpuCores []uint16
```

### NodeMemoryResources

**定义位置**：[L601](file:///d:/claude/nomad/api/nodes.go#L601)

**类型**：struct

```go
	MemoryMB int64
```

### NodeDiskResources

**定义位置**：[L605](file:///d:/claude/nomad/api/nodes.go#L605)

**类型**：struct

```go
	DiskMB int64
```

### NodeReservedResources

**定义位置**：[L609](file:///d:/claude/nomad/api/nodes.go#L609)

**类型**：struct

```go
	Cpu NodeReservedCpuResources
	Memory NodeReservedMemoryResources
	Disk NodeReservedDiskResources
	Networks NodeReservedNetworkResources
```

### NodeReservedCpuResources

**定义位置**：[L616](file:///d:/claude/nomad/api/nodes.go#L616)

**类型**：struct

```go
	CpuShares uint64
```

### NodeReservedMemoryResources

**定义位置**：[L620](file:///d:/claude/nomad/api/nodes.go#L620)

**类型**：struct

```go
	MemoryMB uint64
```

### NodeReservedDiskResources

**定义位置**：[L624](file:///d:/claude/nomad/api/nodes.go#L624)

**类型**：struct

```go
	DiskMB uint64
```

### NodeReservedNetworkResources

**定义位置**：[L628](file:///d:/claude/nomad/api/nodes.go#L628)

**类型**：struct

```go
	ReservedHostPorts string
```

### CSITopologyRequest

**定义位置**：[L632](file:///d:/claude/nomad/api/nodes.go#L632)

**类型**：struct

```go
	Required []*CSITopology `hcl:"required"`
	Preferred []*CSITopology `hcl:"preferred"`
```

### CSITopology

**定义位置**：[L637](file:///d:/claude/nomad/api/nodes.go#L637)

**类型**：struct

```go
	Segments map[string]string `hcl:"segments"`
```

### CSINodeInfo

**定义位置**：[L643](file:///d:/claude/nomad/api/nodes.go#L643)

**类型**：struct

```go
	ID string
	MaxVolumes int64
	AccessibleTopology *CSITopology
	RequiresNodeStageVolume bool
	SupportsStats bool
	SupportsExpand bool
	SupportsCondition bool
```

### CSIControllerInfo

**定义位置**：[L664](file:///d:/claude/nomad/api/nodes.go#L664)

**类型**：struct

```go
	SupportsCreateDelete bool
	SupportsAttachDetach bool
	SupportsListVolumes bool
	SupportsGetCapacity bool
	SupportsCreateDeleteSnapshot bool
	SupportsListSnapshots bool
	SupportsClone bool
	SupportsReadOnlyAttach bool
	SupportsExpand bool
	SupportsListVolumesAttachedNodes bool
	SupportsCondition bool
	SupportsGet bool
```

### CSIInfo

**定义位置**：[L712](file:///d:/claude/nomad/api/nodes.go#L712)

**类型**：struct

```go
	PluginID string
	AllocID string
	Healthy bool
	HealthDescription string
	UpdateTime time.Time
	RequiresControllerPlugin bool
	RequiresTopologies bool
	ControllerInfo *CSIControllerInfo `json:",omitempty"`
	NodeInfo *CSINodeInfo `json:",omitempty"`
```

### DrainStrategy

**定义位置**：[L725](file:///d:/claude/nomad/api/nodes.go#L725)

**类型**：struct

```go
	DrainSpec
	ForceDeadline time.Time
	StartedAt time.Time
```

**关联方法**（2 个）：`Equal`, `String`

### DrainSpec

**定义位置**：[L738](file:///d:/claude/nomad/api/nodes.go#L738)

**类型**：struct

```go
	Deadline time.Duration
	IgnoreSystemJobs bool
```

### NodeEvent

**定义位置**：[L782](file:///d:/claude/nomad/api/nodes.go#L782)

**类型**：struct

```go
	Message string
	Subsystem string
	Details map[string]string
	Timestamp time.Time
	CreateIndex uint64
```

### HostStats

**定义位置**：[L791](file:///d:/claude/nomad/api/nodes.go#L791)

**类型**：struct

```go
	Memory *HostMemoryStats
	CPU []*HostCPUStats
	DiskStats []*HostDiskStats
	AllocDirStats *HostDiskStats
	DeviceStats []*DeviceGroupStats
	Uptime uint64
	CPUTicksConsumed float64
```

### HostMemoryStats

**定义位置**：[L801](file:///d:/claude/nomad/api/nodes.go#L801)

**类型**：struct

```go
	Total uint64
	Available uint64
	Used uint64
	Free uint64
```

### HostCPUStats

**定义位置**：[L808](file:///d:/claude/nomad/api/nodes.go#L808)

**类型**：struct

```go
	CPU string
	User float64
	System float64
	Idle float64
```

### HostDiskStats

**定义位置**：[L815](file:///d:/claude/nomad/api/nodes.go#L815)

**类型**：struct

```go
	Device string
	Mountpoint string
	Size uint64
	Used uint64
	Available uint64
	UsedPercent float64
	InodesUsedPercent float64
```

### DeviceGroupStats

**定义位置**：[L827](file:///d:/claude/nomad/api/nodes.go#L827)

**类型**：struct

```go
	Vendor string
	Type string
	Name string
	InstanceStats map[string]*DeviceStats
```

### DeviceStats

**定义位置**：[L837](file:///d:/claude/nomad/api/nodes.go#L837)

**类型**：struct

```go
	Summary *StatValue
	Stats *StatObject
	Timestamp time.Time
```

### StatObject

**定义位置**：[L851](file:///d:/claude/nomad/api/nodes.go#L851)

**类型**：struct

```go
	Nested map[string]*StatObject
	Attributes map[string]*StatValue
```

### StatValue

**定义位置**：[L862](file:///d:/claude/nomad/api/nodes.go#L862)

**类型**：struct

```go
	FloatNumeratorVal *float64 `json:",omitempty"`
	FloatDenominatorVal *float64 `json:",omitempty"`
	IntNumeratorVal *int64 `json:",omitempty"`
	IntDenominatorVal *int64 `json:",omitempty"`
	StringVal *string `json:",omitempty"`
	BoolVal *bool `json:",omitempty"`
	Unit string `json:",omitempty"`
	Desc string `json:",omitempty"`
```

**关联方法**（1 个）：`String`

### NodeListStub

**定义位置**：[L921](file:///d:/claude/nomad/api/nodes.go#L921)

**类型**：struct

```go
	Address string
	ID string
	Attributes map[string]string `json:",omitempty"`
	Datacenter string
	Name string
	NodeClass string
	NodePool string
	Version string
	Drain bool
	SchedulingEligibility string
	Status string
	StatusDescription string
	Drivers map[string]*DriverInfo
	NodeResources *NodeResources `json:",omitempty"`
	ReservedResources *NodeReservedResources `json:",omitempty"`
	LastDrain *DrainMetadata
	CreateIndex uint64
	ModifyIndex uint64
```

### NodeIndexSort

**定义位置**：[L943](file:///d:/claude/nomad/api/nodes.go#L943)

**类型定义**：`[]*NodeListStub`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### nodeEvalResponse

**定义位置**：[L958](file:///d:/claude/nomad/api/nodes.go#L958)

**类型**：struct

```go
	EvalID string
```

### AllocationSort

**定义位置**：[L963](file:///d:/claude/nomad/api/nodes.go#L963)

**类型定义**：`[]*Allocation`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `NodeStatusInit` | `"initializing"` |
| `NodeStatusReady` | `"ready"` |
| `NodeStatusDown` | `"down"` |
| `NodeStatusDisconnected` | `"disconnected"` |
| `NodeSchedulingEligible` | `"eligible"` |
| `NodeSchedulingIneligible` | `"ineligible"` |
| `DrainStatusDraining` | `"draining"` |
| `DrainStatusComplete` | `"complete"` |
| `DrainStatusCanceled` | `"canceled"` |
| `MonitorMsgLevelNormal` | `0` |
| `MonitorMsgLevelInfo` | `1` |
| `MonitorMsgLevelWarn` | `2` |
| `MonitorMsgLevelError` | `3` |
| `NodeEventSubsystemDrain` | `"Drain"` |
| `NodeEventSubsystemDriver` | `"Driver"` |
| `NodeEventSubsystemHeartbeat` | `"Heartbeat"` |
| `NodeEventSubsystemCluster` | `"Cluster"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Nodes` | `c *Client` | - | `*Nodes` | [L37](file:///d:/claude/nomad/api/nodes.go#L37) |
| `List` | `n *Nodes` | `q *QueryOptions` | `[]*NodeListStub, *QueryMeta, error` | [L42](file:///d:/claude/nomad/api/nodes.go#L42) |
| `PrefixList` | `n *Nodes` | `prefix string` | `[]*NodeListStub, *QueryMeta, error` | [L52](file:///d:/claude/nomad/api/nodes.go#L52) |
| `PrefixListOpts` | `n *Nodes` | `prefix string, opts *QueryOptions` | `[]*NodeListStub, *QueryMeta, error` | [L56](file:///d:/claude/nomad/api/nodes.go#L56) |
| `Info` | `n *Nodes` | `nodeID string, q *QueryOptions` | `*Node, *QueryMeta, error` | [L66](file:///d:/claude/nomad/api/nodes.go#L66) |
| `UpdateDrain` | `n *Nodes` | `nodeID string, spec *DrainSpec, markEligible bool, q *WriteOptions` | `*NodeDrainUpdateResponse, error` | [L120](file:///d:/claude/nomad/api/nodes.go#L120) |
| `UpdateDrainOpts` | `n *Nodes` | `nodeID string, opts *DrainOptions, q *WriteOptions` | `*NodeDrainUpdateResponse, error` | [L132](file:///d:/claude/nomad/api/nodes.go#L132) |
| `Messagef` | - | `lvl MonitorMsgLevel, msg string, args ...interface{}` | `*MonitorMessage` | [L167](file:///d:/claude/nomad/api/nodes.go#L167) |
| `String` | `m *MonitorMessage` | - | `string` | [L174](file:///d:/claude/nomad/api/nodes.go#L174) |
| `MonitorDrain` | `n *Nodes` | `ctx context.Context, nodeID string, index uint64, ignoreSys bool` | `chan *MonitorMessage` | [L181](file:///d:/claude/nomad/api/nodes.go#L181) |
| `monitorDrainMultiplex` | `n *Nodes` | `ctx context.Context, cancel func(...), outCh chan *MonitorMessage, nodeCh ch...` | - | [L203](file:///d:/claude/nomad/api/nodes.go#L203) |
| `monitorDrainNode` | `n *Nodes` | `ctx context.Context, nodeID string, index uint64, nodeCh chan *MonitorMessage` | - | [L256](file:///d:/claude/nomad/api/nodes.go#L256) |
| `monitorDrainAllocs` | `n *Nodes` | `ctx context.Context, nodeID string, ignoreSys bool, allocCh chan *MonitorMes...` | - | [L313](file:///d:/claude/nomad/api/nodes.go#L313) |
| `ToggleEligibility` | `n *Nodes` | `nodeID string, eligible bool, q *WriteOptions` | `*NodeEligibilityUpdateResponse, error` | [L414](file:///d:/claude/nomad/api/nodes.go#L414) |
| `Allocations` | `n *Nodes` | `nodeID string, q *QueryOptions` | `[]*Allocation, *QueryMeta, error` | [L435](file:///d:/claude/nomad/api/nodes.go#L435) |
| `CSIVolumes` | `n *Nodes` | `nodeID string, q *QueryOptions` | `[]*CSIVolumeListStub, error` | [L445](file:///d:/claude/nomad/api/nodes.go#L445) |
| `ForceEvaluate` | `n *Nodes` | `nodeID string, q *WriteOptions` | `string, *WriteMeta, error` | [L456](file:///d:/claude/nomad/api/nodes.go#L456) |
| `Stats` | `n *Nodes` | `nodeID string, q *QueryOptions` | `*HostStats, error` | [L465](file:///d:/claude/nomad/api/nodes.go#L465) |
| `GC` | `n *Nodes` | `nodeID string, q *QueryOptions` | `error` | [L475](file:///d:/claude/nomad/api/nodes.go#L475) |
| `GcAlloc` | `n *Nodes` | `allocID string, q *QueryOptions` | `error` | [L482](file:///d:/claude/nomad/api/nodes.go#L482) |
| `Purge` | `n *Nodes` | `nodeID string, q *QueryOptions` | `*NodePurgeResponse, *QueryMeta, error` | [L490](file:///d:/claude/nomad/api/nodes.go#L490) |
| `Equal` | `d *DrainStrategy` | `o *DrainStrategy` | `bool` | [L748](file:///d:/claude/nomad/api/nodes.go#L748) |
| `String` | `d *DrainStrategy` | - | `string` | [L767](file:///d:/claude/nomad/api/nodes.go#L767) |
| `String` | `v *StatValue` | - | `string` | [L886](file:///d:/claude/nomad/api/nodes.go#L886) |
| `Len` | `n *NodeIndexSort` | - | `int` | [L945](file:///d:/claude/nomad/api/nodes.go#L945) |
| `Less` | `n *NodeIndexSort` | `i int, j int` | `bool` | [L949](file:///d:/claude/nomad/api/nodes.go#L949) |
| `Swap` | `n *NodeIndexSort` | `i int, j int` | - | [L953](file:///d:/claude/nomad/api/nodes.go#L953) |
| `Len` | `a *AllocationSort` | - | `int` | [L965](file:///d:/claude/nomad/api/nodes.go#L965) |
| `Less` | `a *AllocationSort` | `i int, j int` | `bool` | [L969](file:///d:/claude/nomad/api/nodes.go#L969) |
| `Swap` | `a *AllocationSort` | `i int, j int` | - | [L973](file:///d:/claude/nomad/api/nodes.go#L973) |

## 5. 核心方法详解

### List()

**签名**：`func (n *Nodes) List(q *QueryOptions) []*NodeListStub, *QueryMeta, error`

**位置**：[L42](file:///d:/claude/nomad/api/nodes.go#L42)

### Info()

**签名**：`func (n *Nodes) Info(nodeID string, q *QueryOptions) *Node, *QueryMeta, error`

**位置**：[L66](file:///d:/claude/nomad/api/nodes.go#L66)

### Allocations()

**签名**：`func (n *Nodes) Allocations(nodeID string, q *QueryOptions) []*Allocation, *QueryMeta, error`

**位置**：[L435](file:///d:/claude/nomad/api/nodes.go#L435)

### ForceEvaluate()

**签名**：`func (n *Nodes) ForceEvaluate(nodeID string, q *WriteOptions) string, *WriteMeta, error`

**位置**：[L456](file:///d:/claude/nomad/api/nodes.go#L456)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [nodes_test.go](file:///d:/claude/nomad/api/nodes_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

