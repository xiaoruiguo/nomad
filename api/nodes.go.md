# nodes.go 代码说明文档

> 文件路径：[api/nodes.go](file:///d:/claude/nomad/api/nodes.go)
> 总行数：976 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `nodes.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Nodes

**定义位置**：[L32](file:///d:/claude/nomad/api/nodes.go#L32)

**中文说明**：Nodes 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type Nodes struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（18 个）：`List`, `PrefixList`, `PrefixListOpts`, `Info`, `UpdateDrain`, `UpdateDrainOpts`, `MonitorDrain`, `monitorDrainMultiplex`, `monitorDrainNode`, `monitorDrainAllocs`, `ToggleEligibility`, `Allocations`, `CSIVolumes`, `ForceEvaluate`, `Stats`, `GC`, `GcAlloc`, `Purge`

### NodeUpdateDrainRequest

**定义位置**：[L76](file:///d:/claude/nomad/api/nodes.go#L76)

**中文说明**：NodeUpdateDrainRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeUpdateDrainRequest struct {
	NodeID string
	DrainSpec *DrainSpec
	MarkEligible bool
	Meta map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 字符串 |
| `DrainSpec` | `*DrainSpec` | — |
| `MarkEligible` | `bool` | 布尔值 |
| `Meta` | `map[string]string` | 元数据 |

### NodeDrainUpdateResponse

**定义位置**：[L93](file:///d:/claude/nomad/api/nodes.go#L93)

**中文说明**：NodeDrainUpdateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NodeDrainUpdateResponse struct {
	NodeModifyIndex uint64
	EvalIDs []string
	EvalCreateIndex uint64
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeModifyIndex` | `uint64` | 索引值（uint64） |
| `EvalIDs` | `[]string` | 列表 |
| `EvalCreateIndex` | `uint64` | 索引值（uint64） |
| `WriteMeta` | `WriteMeta` | — |

### DrainOptions

**定义位置**：[L101](file:///d:/claude/nomad/api/nodes.go#L101)

**中文说明**：DrainOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type DrainOptions struct {
	DrainSpec *DrainSpec
	MarkEligible bool
	Meta map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DrainSpec` | `*DrainSpec` | — |
| `MarkEligible` | `bool` | 布尔值 |
| `Meta` | `map[string]string` | 元数据 |

### MonitorMsgLevel

**定义位置**：[L151](file:///d:/claude/nomad/api/nodes.go#L151)

**类型定义**：`type MonitorMsgLevel int`

### MonitorMessage

**定义位置**：[L161](file:///d:/claude/nomad/api/nodes.go#L161)

**中文说明**：MonitorMessage 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type MonitorMessage struct {
	Level MonitorMsgLevel
	Message string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Level` | `MonitorMsgLevel` | — |
| `Message` | `string` | 消息 |

**关联方法**（1 个）：`String`

### NodeUpdateEligibilityRequest

**定义位置**：[L399](file:///d:/claude/nomad/api/nodes.go#L399)

**中文说明**：NodeUpdateEligibilityRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeUpdateEligibilityRequest struct {
	NodeID string
	Eligibility string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 字符串 |
| `Eligibility` | `string` | 字符串 |

### NodeEligibilityUpdateResponse

**定义位置**：[L406](file:///d:/claude/nomad/api/nodes.go#L406)

**中文说明**：NodeEligibilityUpdateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NodeEligibilityUpdateResponse struct {
	NodeModifyIndex uint64
	EvalIDs []string
	EvalCreateIndex uint64
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeModifyIndex` | `uint64` | 索引值（uint64） |
| `EvalIDs` | `[]string` | 列表 |
| `EvalCreateIndex` | `uint64` | 索引值（uint64） |
| `WriteMeta` | `WriteMeta` | — |

### NodePurgeResponse

**定义位置**：[L501](file:///d:/claude/nomad/api/nodes.go#L501)

**中文说明**：NodePurgeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NodePurgeResponse struct {
	EvalIDs []string
	EvalCreateIndex uint64
	NodeModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalIDs` | `[]string` | 列表 |
| `EvalCreateIndex` | `uint64` | 索引值（uint64） |
| `NodeModifyIndex` | `uint64` | 索引值（uint64） |

### DriverInfo

**定义位置**：[L508](file:///d:/claude/nomad/api/nodes.go#L508)

**中文说明**：DriverInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type DriverInfo struct {
	Attributes map[string]string
	Detected bool
	Healthy bool
	HealthDescription string
	UpdateTime time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Attributes` | `map[string]string` | 映射表 |
| `Detected` | `bool` | 布尔值 |
| `Healthy` | `bool` | 是否健康 |
| `HealthDescription` | `string` | 字符串 |
| `UpdateTime` | `time.Time` | 时间点 |

### HostVolumeInfo

**定义位置**：[L517](file:///d:/claude/nomad/api/nodes.go#L517)

**中文说明**：HostVolumeInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type HostVolumeInfo struct {
	Path string
	ReadOnly bool
	ID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Path` | `string` | 路径 |
| `ReadOnly` | `bool` | 布尔值 |
| `ID` | `string` | 唯一标识符 |

### HostNetworkInfo

**定义位置**：[L525](file:///d:/claude/nomad/api/nodes.go#L525)

**中文说明**：HostNetworkInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type HostNetworkInfo struct {
	Name string
	CIDR string
	Interface string
	ReservedPorts string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `CIDR` | `string` | 字符串 |
| `Interface` | `string` | 字符串 |
| `ReservedPorts` | `string` | 字符串 |

### DrainStatus

**定义位置**：[L532](file:///d:/claude/nomad/api/nodes.go#L532)

**中文说明**：DrainStatus 是一个状态结构体，描述对象或操作的当前状态。

**类型定义**：`type DrainStatus string`

### DrainMetadata

**定义位置**：[L535](file:///d:/claude/nomad/api/nodes.go#L535)

**中文说明**：DrainMetadata 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type DrainMetadata struct {
	StartedAt time.Time
	UpdatedAt time.Time
	Status DrainStatus
	AccessorID string
	Meta map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `StartedAt` | `time.Time` | 时间点 |
| `UpdatedAt` | `time.Time` | 时间点 |
| `Status` | `DrainStatus` | 状态 |
| `AccessorID` | `string` | 字符串 |
| `Meta` | `map[string]string` | 元数据 |

### Node

**定义位置**：[L544](file:///d:/claude/nomad/api/nodes.go#L544)

**中文说明**：Node 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type Node struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Datacenter` | `string` | 数据中心 |
| `Name` | `string` | 名称 |
| `HTTPAddr` | `string` | 字符串 |
| `TLSEnabled` | `bool` | 布尔值 |
| `Attributes` | `map[string]string` | 映射表 |
| `Resources` | `*Resources` | — |
| `Reserved` | `*Resources` | — |
| `NodeResources` | `*NodeResources` | — |
| `ReservedResources` | `*NodeReservedResources` | — |
| `Links` | `map[string]string` | 映射表 |
| `Meta` | `map[string]string` | 元数据 |
| `NodeClass` | `string` | 字符串 |
| `NodePool` | `string` | 字符串 |
| `CgroupParent` | `string` | 字符串 |
| `Drain` | `bool` | 布尔值 |
| `DrainStrategy` | `*DrainStrategy` | — |
| `SchedulingEligibility` | `string` | 字符串 |
| `Status` | `string` | 状态 |
| `StatusDescription` | `string` | 字符串 |
| `StatusUpdatedAt` | `int64` | — |
| `Events` | `[]*NodeEvent` | 列表 |
| `Drivers` | `map[string]*DriverInfo` | 映射表 |
| `HostVolumes` | `map[string]*HostVolumeInfo` | 映射表 |
| `GCVolumesOnNodeGC` | `bool` | 布尔值 |
| `HostNetworks` | `map[string]*HostNetworkInfo` | 映射表 |
| `CSIControllerPlugins` | `map[string]*CSIInfo` | 映射表 |
| `CSINodePlugins` | `map[string]*CSIInfo` | 映射表 |
| `LastDrain` | `*DrainMetadata` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `NodeMaxAllocs` | `int` | — |

### NodeResources

**定义位置**：[L584](file:///d:/claude/nomad/api/nodes.go#L584)

**中文说明**：NodeResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeResources struct {
	Cpu NodeCpuResources
	Memory NodeMemoryResources
	Disk NodeDiskResources
	Networks []*NetworkResource
	Devices []*NodeDeviceResource
	MinDynamicPort int
	MaxDynamicPort int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Cpu` | `NodeCpuResources` | — |
| `Memory` | `NodeMemoryResources` | — |
| `Disk` | `NodeDiskResources` | — |
| `Networks` | `[]*NetworkResource` | 列表 |
| `Devices` | `[]*NodeDeviceResource` | 列表 |
| `MinDynamicPort` | `int` | — |
| `MaxDynamicPort` | `int` | — |

### NodeCpuResources

**定义位置**：[L595](file:///d:/claude/nomad/api/nodes.go#L595)

**中文说明**：NodeCpuResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeCpuResources struct {
	CpuShares int64
	TotalCpuCores uint16
	ReservableCpuCores []uint16
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CpuShares` | `int64` | — |
| `TotalCpuCores` | `uint16` | — |
| `ReservableCpuCores` | `[]uint16` | 列表 |

### NodeMemoryResources

**定义位置**：[L601](file:///d:/claude/nomad/api/nodes.go#L601)

**中文说明**：NodeMemoryResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeMemoryResources struct {
	MemoryMB int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MemoryMB` | `int64` | — |

### NodeDiskResources

**定义位置**：[L605](file:///d:/claude/nomad/api/nodes.go#L605)

**中文说明**：NodeDiskResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeDiskResources struct {
	DiskMB int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DiskMB` | `int64` | — |

### NodeReservedResources

**定义位置**：[L609](file:///d:/claude/nomad/api/nodes.go#L609)

**中文说明**：NodeReservedResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeReservedResources struct {
	Cpu NodeReservedCpuResources
	Memory NodeReservedMemoryResources
	Disk NodeReservedDiskResources
	Networks NodeReservedNetworkResources
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Cpu` | `NodeReservedCpuResources` | — |
| `Memory` | `NodeReservedMemoryResources` | — |
| `Disk` | `NodeReservedDiskResources` | — |
| `Networks` | `NodeReservedNetworkResources` | — |

### NodeReservedCpuResources

**定义位置**：[L616](file:///d:/claude/nomad/api/nodes.go#L616)

**中文说明**：NodeReservedCpuResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeReservedCpuResources struct {
	CpuShares uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CpuShares` | `uint64` | 无符号 64 位整数 |

### NodeReservedMemoryResources

**定义位置**：[L620](file:///d:/claude/nomad/api/nodes.go#L620)

**中文说明**：NodeReservedMemoryResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeReservedMemoryResources struct {
	MemoryMB uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MemoryMB` | `uint64` | 无符号 64 位整数 |

### NodeReservedDiskResources

**定义位置**：[L624](file:///d:/claude/nomad/api/nodes.go#L624)

**中文说明**：NodeReservedDiskResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeReservedDiskResources struct {
	DiskMB uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DiskMB` | `uint64` | 无符号 64 位整数 |

### NodeReservedNetworkResources

**定义位置**：[L628](file:///d:/claude/nomad/api/nodes.go#L628)

**中文说明**：NodeReservedNetworkResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeReservedNetworkResources struct {
	ReservedHostPorts string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ReservedHostPorts` | `string` | 字符串 |

### CSITopologyRequest

**定义位置**：[L632](file:///d:/claude/nomad/api/nodes.go#L632)

**中文说明**：CSITopologyRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type CSITopologyRequest struct {
	Required []*CSITopology `hcl:"required"`
	Preferred []*CSITopology `hcl:"preferred"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Required` | `[]*CSITopology `hcl:"required"`` | 列表 |
| `Preferred` | `[]*CSITopology `hcl:"preferred"`` | 列表 |

### CSITopology

**定义位置**：[L637](file:///d:/claude/nomad/api/nodes.go#L637)

**中文说明**：CSITopology 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type CSITopology struct {
	Segments map[string]string `hcl:"segments"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Segments` | `map[string]string `hcl:"segments"`` | 映射表 |

### CSINodeInfo

**定义位置**：[L643](file:///d:/claude/nomad/api/nodes.go#L643)

**中文说明**：CSINodeInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type CSINodeInfo struct {
	ID string
	MaxVolumes int64
	AccessibleTopology *CSITopology
	RequiresNodeStageVolume bool
	SupportsStats bool
	SupportsExpand bool
	SupportsCondition bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `MaxVolumes` | `int64` | — |
| `AccessibleTopology` | `*CSITopology` | — |
| `RequiresNodeStageVolume` | `bool` | 布尔值 |
| `SupportsStats` | `bool` | 布尔值 |
| `SupportsExpand` | `bool` | 布尔值 |
| `SupportsCondition` | `bool` | 布尔值 |

### CSIControllerInfo

**定义位置**：[L664](file:///d:/claude/nomad/api/nodes.go#L664)

**中文说明**：CSIControllerInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type CSIControllerInfo struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SupportsCreateDelete` | `bool` | 布尔值 |
| `SupportsAttachDetach` | `bool` | 布尔值 |
| `SupportsListVolumes` | `bool` | 布尔值 |
| `SupportsGetCapacity` | `bool` | 布尔值 |
| `SupportsCreateDeleteSnapshot` | `bool` | 布尔值 |
| `SupportsListSnapshots` | `bool` | 布尔值 |
| `SupportsClone` | `bool` | 布尔值 |
| `SupportsReadOnlyAttach` | `bool` | 布尔值 |
| `SupportsExpand` | `bool` | 布尔值 |
| `SupportsListVolumesAttachedNodes` | `bool` | 布尔值 |
| `SupportsCondition` | `bool` | 布尔值 |
| `SupportsGet` | `bool` | 布尔值 |

### CSIInfo

**定义位置**：[L712](file:///d:/claude/nomad/api/nodes.go#L712)

**中文说明**：CSIInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type CSIInfo struct {
	PluginID string
	AllocID string
	Healthy bool
	HealthDescription string
	UpdateTime time.Time
	RequiresControllerPlugin bool
	RequiresTopologies bool
	ControllerInfo *CSIControllerInfo `json:",omitempty"`
	NodeInfo *CSINodeInfo `json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PluginID` | `string` | 字符串 |
| `AllocID` | `string` | 字符串 |
| `Healthy` | `bool` | 是否健康 |
| `HealthDescription` | `string` | 字符串 |
| `UpdateTime` | `time.Time` | 时间点 |
| `RequiresControllerPlugin` | `bool` | 布尔值 |
| `RequiresTopologies` | `bool` | 布尔值 |
| `ControllerInfo` | `*CSIControllerInfo `json:",omitempty"`` | — |
| `NodeInfo` | `*CSINodeInfo `json:",omitempty"`` | — |

### DrainStrategy

**定义位置**：[L725](file:///d:/claude/nomad/api/nodes.go#L725)

**中文说明**：DrainStrategy 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type DrainStrategy struct {
	DrainSpec DrainSpec
	ForceDeadline time.Time
	StartedAt time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DrainSpec` | `DrainSpec` | — |
| `ForceDeadline` | `time.Time` | 时间点 |
| `StartedAt` | `time.Time` | 时间点 |

**关联方法**（2 个）：`Equal`, `String`

### DrainSpec

**定义位置**：[L738](file:///d:/claude/nomad/api/nodes.go#L738)

**中文说明**：DrainSpec 是一个规格定义结构体，描述对象的规格参数。

**类型**：struct

```go
type DrainSpec struct {
	Deadline time.Duration
	IgnoreSystemJobs bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Deadline` | `time.Duration` | 截止时间 |
| `IgnoreSystemJobs` | `bool` | 布尔值 |

### NodeEvent

**定义位置**：[L782](file:///d:/claude/nomad/api/nodes.go#L782)

**中文说明**：NodeEvent 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeEvent struct {
	Message string
	Subsystem string
	Details map[string]string
	Timestamp time.Time
	CreateIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Message` | `string` | 消息 |
| `Subsystem` | `string` | 字符串 |
| `Details` | `map[string]string` | 映射表 |
| `Timestamp` | `time.Time` | 时间戳 |
| `CreateIndex` | `uint64` | 索引值（uint64） |

### HostStats

**定义位置**：[L791](file:///d:/claude/nomad/api/nodes.go#L791)

**中文说明**：HostStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type HostStats struct {
	Memory *HostMemoryStats
	CPU []*HostCPUStats
	DiskStats []*HostDiskStats
	AllocDirStats *HostDiskStats
	DeviceStats []*DeviceGroupStats
	Uptime uint64
	CPUTicksConsumed float64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Memory` | `*HostMemoryStats` | — |
| `CPU` | `[]*HostCPUStats` | 列表 |
| `DiskStats` | `[]*HostDiskStats` | 列表 |
| `AllocDirStats` | `*HostDiskStats` | — |
| `DeviceStats` | `[]*DeviceGroupStats` | 列表 |
| `Uptime` | `uint64` | 无符号 64 位整数 |
| `CPUTicksConsumed` | `float64` | — |

### HostMemoryStats

**定义位置**：[L801](file:///d:/claude/nomad/api/nodes.go#L801)

**中文说明**：HostMemoryStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type HostMemoryStats struct {
	Total uint64
	Available uint64
	Used uint64
	Free uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Total` | `uint64` | 无符号 64 位整数 |
| `Available` | `uint64` | 无符号 64 位整数 |
| `Used` | `uint64` | 无符号 64 位整数 |
| `Free` | `uint64` | 无符号 64 位整数 |

### HostCPUStats

**定义位置**：[L808](file:///d:/claude/nomad/api/nodes.go#L808)

**中文说明**：HostCPUStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type HostCPUStats struct {
	CPU string
	User float64
	System float64
	Idle float64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CPU` | `string` | 字符串 |
| `User` | `float64` | — |
| `System` | `float64` | — |
| `Idle` | `float64` | — |

### HostDiskStats

**定义位置**：[L815](file:///d:/claude/nomad/api/nodes.go#L815)

**中文说明**：HostDiskStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type HostDiskStats struct {
	Device string
	Mountpoint string
	Size uint64
	Used uint64
	Available uint64
	UsedPercent float64
	InodesUsedPercent float64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Device` | `string` | 字符串 |
| `Mountpoint` | `string` | 字符串 |
| `Size` | `uint64` | 大小 |
| `Used` | `uint64` | 无符号 64 位整数 |
| `Available` | `uint64` | 无符号 64 位整数 |
| `UsedPercent` | `float64` | — |
| `InodesUsedPercent` | `float64` | — |

### DeviceGroupStats

**定义位置**：[L827](file:///d:/claude/nomad/api/nodes.go#L827)

**中文说明**：DeviceGroupStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type DeviceGroupStats struct {
	Vendor string
	Type string
	Name string
	InstanceStats map[string]*DeviceStats
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Vendor` | `string` | 字符串 |
| `Type` | `string` | 类型 |
| `Name` | `string` | 名称 |
| `InstanceStats` | `map[string]*DeviceStats` | 映射表 |

### DeviceStats

**定义位置**：[L837](file:///d:/claude/nomad/api/nodes.go#L837)

**中文说明**：DeviceStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type DeviceStats struct {
	Summary *StatValue
	Stats *StatObject
	Timestamp time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Summary` | `*StatValue` | — |
| `Stats` | `*StatObject` | — |
| `Timestamp` | `time.Time` | 时间戳 |

### StatObject

**定义位置**：[L851](file:///d:/claude/nomad/api/nodes.go#L851)

**中文说明**：StatObject 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type StatObject struct {
	Nested map[string]*StatObject
	Attributes map[string]*StatValue
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Nested` | `map[string]*StatObject` | 映射表 |
| `Attributes` | `map[string]*StatValue` | 映射表 |

### StatValue

**定义位置**：[L862](file:///d:/claude/nomad/api/nodes.go#L862)

**中文说明**：StatValue 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type StatValue struct {
	FloatNumeratorVal *float64 `json:",omitempty"`
	FloatDenominatorVal *float64 `json:",omitempty"`
	IntNumeratorVal *int64 `json:",omitempty"`
	IntDenominatorVal *int64 `json:",omitempty"`
	StringVal *string `json:",omitempty"`
	BoolVal *bool `json:",omitempty"`
	Unit string `json:",omitempty"`
	Desc string `json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `FloatNumeratorVal` | `*float64 `json:",omitempty"`` | — |
| `FloatDenominatorVal` | `*float64 `json:",omitempty"`` | — |
| `IntNumeratorVal` | `*int64 `json:",omitempty"`` | — |
| `IntDenominatorVal` | `*int64 `json:",omitempty"`` | — |
| `StringVal` | `*string `json:",omitempty"`` | 字符串 |
| `BoolVal` | `*bool `json:",omitempty"`` | 布尔值 |
| `Unit` | `string `json:",omitempty"`` | 字符串 |
| `Desc` | `string `json:",omitempty"`` | 描述信息 |

**关联方法**（1 个）：`String`

### NodeListStub

**定义位置**：[L921](file:///d:/claude/nomad/api/nodes.go#L921)

**中文说明**：NodeListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type NodeListStub struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Address` | `string` | 地址 |
| `ID` | `string` | 唯一标识符 |
| `Attributes` | `map[string]string `json:",omitempty"`` | 映射表 |
| `Datacenter` | `string` | 数据中心 |
| `Name` | `string` | 名称 |
| `NodeClass` | `string` | 字符串 |
| `NodePool` | `string` | 字符串 |
| `Version` | `string` | 版本号 |
| `Drain` | `bool` | 布尔值 |
| `SchedulingEligibility` | `string` | 字符串 |
| `Status` | `string` | 状态 |
| `StatusDescription` | `string` | 字符串 |
| `Drivers` | `map[string]*DriverInfo` | 映射表 |
| `NodeResources` | `*NodeResources `json:",omitempty"`` | — |
| `ReservedResources` | `*NodeReservedResources `json:",omitempty"`` | — |
| `LastDrain` | `*DrainMetadata` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### NodeIndexSort

**定义位置**：[L943](file:///d:/claude/nomad/api/nodes.go#L943)

**中文说明**：NodeIndexSort 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型定义**：`type NodeIndexSort []*NodeListStub`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### nodeEvalResponse

**定义位置**：[L958](file:///d:/claude/nomad/api/nodes.go#L958)

**中文说明**：nodeEvalResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type nodeEvalResponse struct {
	EvalID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalID` | `string` | 字符串 |

### AllocationSort

**定义位置**：[L963](file:///d:/claude/nomad/api/nodes.go#L963)

**中文说明**：AllocationSort 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型定义**：`type AllocationSort []*Allocation`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `NodeStatusInit` | `—` | `"initializing"` | — |
| `NodeStatusReady` | `—` | `"ready"` | — |
| `NodeStatusDown` | `—` | `"down"` | — |
| `NodeStatusDisconnected` | `—` | `"disconnected"` | — |
| `NodeSchedulingEligible` | `—` | `"eligible"` | — |
| `NodeSchedulingIneligible` | `—` | `"ineligible"` | — |
| `DrainStatusDraining` | `DrainStatus` | `"draining"` | — |
| `DrainStatusComplete` | `DrainStatus` | `"complete"` | — |
| `DrainStatusCanceled` | `DrainStatus` | `"canceled"` | — |
| `MonitorMsgLevelNormal` | `MonitorMsgLevel` | `0` | — |
| `MonitorMsgLevelInfo` | `MonitorMsgLevel` | `1` | — |
| `MonitorMsgLevelWarn` | `MonitorMsgLevel` | `2` | — |
| `MonitorMsgLevelError` | `MonitorMsgLevel` | `3` | — |
| `NodeEventSubsystemDrain` | `—` | `"Drain"` | — |
| `NodeEventSubsystemDriver` | `—` | `"Driver"` | — |
| `NodeEventSubsystemHeartbeat` | `—` | `"Heartbeat"` | — |
| `NodeEventSubsystemCluster` | `—` | `"Cluster"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Nodes` | `c *Client` | `` | `*Nodes` | [L37](file:///d:/claude/nomad/api/nodes.go#L37) |
| `List` | `n *Nodes` | `q *QueryOptions` | `[]*NodeListStub, *QueryMeta, error` | [L42](file:///d:/claude/nomad/api/nodes.go#L42) |
| `PrefixList` | `n *Nodes` | `prefix string` | `[]*NodeListStub, *QueryMeta, error` | [L52](file:///d:/claude/nomad/api/nodes.go#L52) |
| `PrefixListOpts` | `n *Nodes` | `prefix string, opts *QueryOptions` | `[]*NodeListStub, *QueryMeta, error` | [L56](file:///d:/claude/nomad/api/nodes.go#L56) |
| `Info` | `n *Nodes` | `nodeID string, q *QueryOptions` | `*Node, *QueryMeta, error` | [L66](file:///d:/claude/nomad/api/nodes.go#L66) |
| `UpdateDrain` | `n *Nodes` | `nodeID string, spec *DrainSpec, markEligible bool, q *WriteOptions` | `*NodeDrainUpdateResponse, error` | [L120](file:///d:/claude/nomad/api/nodes.go#L120) |
| `UpdateDrainOpts` | `n *Nodes` | `nodeID string, opts *DrainOptions, q *WriteOptions` | `*NodeDrainUpdateResponse, error` | [L132](file:///d:/claude/nomad/api/nodes.go#L132) |
| `Messagef` | - | `lvl MonitorMsgLevel, msg string, args ...interface{}` | `*MonitorMessage` | [L167](file:///d:/claude/nomad/api/nodes.go#L167) |
| `String` | `m *MonitorMessage` | `` | `string` | [L174](file:///d:/claude/nomad/api/nodes.go#L174) |
| `MonitorDrain` | `n *Nodes` | `ctx context.Context, nodeID string, index uint64, ignoreSys bool` | `<-chan *MonitorMessage` | [L181](file:///d:/claude/nomad/api/nodes.go#L181) |
| `monitorDrainMultiplex` | `n *Nodes` | `ctx context.Context, cancel func(...), outCh chan<- *MonitorMessage, nodeCh <...` | `` | [L203](file:///d:/claude/nomad/api/nodes.go#L203) |
| `monitorDrainNode` | `n *Nodes` | `ctx context.Context, nodeID string, index uint64, nodeCh chan<- *MonitorMessage` | `` | [L256](file:///d:/claude/nomad/api/nodes.go#L256) |
| `monitorDrainAllocs` | `n *Nodes` | `ctx context.Context, nodeID string, ignoreSys bool, allocCh chan<- *MonitorMe...` | `` | [L313](file:///d:/claude/nomad/api/nodes.go#L313) |
| `ToggleEligibility` | `n *Nodes` | `nodeID string, eligible bool, q *WriteOptions` | `*NodeEligibilityUpdateResponse, error` | [L414](file:///d:/claude/nomad/api/nodes.go#L414) |
| `Allocations` | `n *Nodes` | `nodeID string, q *QueryOptions` | `[]*Allocation, *QueryMeta, error` | [L435](file:///d:/claude/nomad/api/nodes.go#L435) |
| `CSIVolumes` | `n *Nodes` | `nodeID string, q *QueryOptions` | `[]*CSIVolumeListStub, error` | [L445](file:///d:/claude/nomad/api/nodes.go#L445) |
| `ForceEvaluate` | `n *Nodes` | `nodeID string, q *WriteOptions` | `string, *WriteMeta, error` | [L456](file:///d:/claude/nomad/api/nodes.go#L456) |
| `Stats` | `n *Nodes` | `nodeID string, q *QueryOptions` | `*HostStats, error` | [L465](file:///d:/claude/nomad/api/nodes.go#L465) |
| `GC` | `n *Nodes` | `nodeID string, q *QueryOptions` | `error` | [L475](file:///d:/claude/nomad/api/nodes.go#L475) |
| `GcAlloc` | `n *Nodes` | `allocID string, q *QueryOptions` | `error` | [L482](file:///d:/claude/nomad/api/nodes.go#L482) |
| `Purge` | `n *Nodes` | `nodeID string, q *QueryOptions` | `*NodePurgeResponse, *QueryMeta, error` | [L490](file:///d:/claude/nomad/api/nodes.go#L490) |
| `Equal` | `d *DrainStrategy` | `o *DrainStrategy` | `bool` | [L748](file:///d:/claude/nomad/api/nodes.go#L748) |
| `String` | `d *DrainStrategy` | `` | `string` | [L767](file:///d:/claude/nomad/api/nodes.go#L767) |
| `String` | `v *StatValue` | `` | `string` | [L886](file:///d:/claude/nomad/api/nodes.go#L886) |
| `Len` | `n *NodeIndexSort` | `` | `int` | [L945](file:///d:/claude/nomad/api/nodes.go#L945) |
| `Less` | `n *NodeIndexSort` | `i int, j int` | `bool` | [L949](file:///d:/claude/nomad/api/nodes.go#L949) |
| `Swap` | `n *NodeIndexSort` | `i int, j int` | `` | [L953](file:///d:/claude/nomad/api/nodes.go#L953) |
| `Len` | `a *AllocationSort` | `` | `int` | [L965](file:///d:/claude/nomad/api/nodes.go#L965) |
| `Less` | `a *AllocationSort` | `i int, j int` | `bool` | [L969](file:///d:/claude/nomad/api/nodes.go#L969) |
| `Swap` | `a *AllocationSort` | `i int, j int` | `` | [L973](file:///d:/claude/nomad/api/nodes.go#L973) |

## 5. 核心方法详解

### List()

**签名**：`func (n *Nodes) List(q *QueryOptions) []*NodeListStub, *QueryMeta, error`

**位置**：[L42](file:///d:/claude/nomad/api/nodes.go#L42)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*NodeListStub` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Info()

**签名**：`func (n *Nodes) Info(nodeID string, q *QueryOptions) *Node, *QueryMeta, error`

**位置**：[L66](file:///d:/claude/nomad/api/nodes.go#L66)

**中文说明**：返回对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `nodeID` | `string` | 字符串 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Node` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Stats()

**签名**：`func (n *Nodes) Stats(nodeID string, q *QueryOptions) *HostStats, error`

**位置**：[L465](file:///d:/claude/nomad/api/nodes.go#L465)

**中文说明**：返回对象的统计信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `nodeID` | `string` | 字符串 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*HostStats` | — |
| `error` | 错误信息 |

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

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [nodes_test.go](file:///d:/claude/nomad/api/nodes_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

