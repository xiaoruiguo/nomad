# feasible.go 代码说明文档

> 文件路径：[scheduler/feasible/feasible.go](file:///d:/claude/nomad/scheduler/feasible/feasible.go)
> 总行数：1827 行
> 所属包：`feasible`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **可行性检查子包**（`scheduler/feasible`），实现节点可行性检查器，根据约束、资源、节点池等条件筛选符合条件的节点。

## 2. 类型定义

### FeasibleIterator

**定义位置**：[L60](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L60)

**中文说明**：FeasibleIterator 是一个迭代器，按顺序遍历集合元素。

**类型**：interface

```go
type FeasibleIterator interface {
	Next func(...)
	Reset func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Next` | `func(...)` | — |
| `Reset` | `func(...)` | — |

### ContextualIterator

**定义位置**：[L71](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L71)

**中文说明**：ContextualIterator 是一个迭代器，按顺序遍历集合元素。

**类型**：interface

```go
type ContextualIterator interface {
	SetJob func(...)
	SetTaskGroup func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `SetJob` | `func(...)` | — |
| `SetTaskGroup` | `func(...)` | — |

### FeasibilityChecker

**定义位置**：[L78](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L78)

**中文说明**：FeasibilityChecker 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type FeasibilityChecker interface {
	Feasible func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Feasible` | `func(...)` | — |

### StaticIterator

**定义位置**：[L85](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L85)

**中文说明**：StaticIterator 是一个迭代器，按顺序遍历集合元素。

**类型**：struct

```go
type StaticIterator struct {
	ctx Context
	nodes []*structs.Node
	offset int
	seen int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `nodes` | `[]*structs.Node` | 列表 |
| `offset` | `int` | 偏移量 |
| `seen` | `int` | — |

**关联方法**（3 个）：`Next`, `Reset`, `SetNodes`

### SecretsProviderChecker

**定义位置**：[L165](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L165)

**中文说明**：SecretsProviderChecker 与密钥（Secret）相关，管理敏感数据。

**类型**：struct

```go
type SecretsProviderChecker struct {
	ctx Context
	secrets map[string]struct{...}
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `secrets` | `map[string]struct{...}` | 映射表 |

**关联方法**（3 个）：`SetSecrets`, `Feasible`, `hasSecrets`

### HostVolumeChecker

**定义位置**：[L209](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L209)

**中文说明**：HostVolumeChecker 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type HostVolumeChecker struct {
	ctx Context
	volumeReqs []*structs.VolumeRequest
	namespace string
	jobID string
	taskGroupName string
	unmetClaims []*structs.TaskGroupHostVolumeClaim
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `volumeReqs` | `[]*structs.VolumeRequest` | 列表 |
| `namespace` | `string` | 命名空间 |
| `jobID` | `string` | 字符串 |
| `taskGroupName` | `string` | 字符串 |
| `unmetClaims` | `[]*structs.TaskGroupHostVolumeClaim` | 列表 |

**关联方法**（4 个）：`SetVolumes`, `Feasible`, `hasVolumes`, `hostVolumeIsAvailable`

### CSIVolumeChecker

**定义位置**：[L471](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L471)

**中文说明**：CSIVolumeChecker 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type CSIVolumeChecker struct {
	ctx Context
	namespace string
	jobID string
	volumes map[string]*structs.VolumeRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `namespace` | `string` | 命名空间 |
| `jobID` | `string` | 字符串 |
| `volumes` | `map[string]*structs.VolumeRequest` | 映射表 |

**关联方法**（5 个）：`SetJobID`, `SetNamespace`, `SetVolumes`, `Feasible`, `isFeasible`

### NetworkChecker

**定义位置**：[L621](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L621)

**中文说明**：NetworkChecker 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type NetworkChecker struct {
	ctx Context
	networkMode string
	ports []structs.Port
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `networkMode` | `string` | 字符串 |
| `ports` | `[]structs.Port` | 列表 |

**关联方法**（4 个）：`SetNetwork`, `Feasible`, `hasHostNetworks`, `hasNetwork`

### DriverChecker

**定义位置**：[L718](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L718)

**中文说明**：DriverChecker 与任务驱动（Driver）相关，驱动负责任务的实际执行。

**类型**：struct

```go
type DriverChecker struct {
	ctx Context
	drivers map[string]struct{...}
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `drivers` | `map[string]struct{...}` | 映射表 |

**关联方法**（3 个）：`SetDrivers`, `Feasible`, `hasDrivers`

### DistinctHostsIterator

**定义位置**：[L790](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L790)

**中文说明**：DistinctHostsIterator 是一个迭代器，按顺序遍历集合元素。

**类型**：struct

```go
type DistinctHostsIterator struct {
	ctx Context
	source FeasibleIterator
	tg *structs.TaskGroup
	job *structs.Job
	tgDistinctHosts bool
	jobDistinctHosts bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `source` | `FeasibleIterator` | — |
| `tg` | `*structs.TaskGroup` | — |
| `job` | `*structs.Job` | — |
| `tgDistinctHosts` | `bool` | 布尔值 |
| `jobDistinctHosts` | `bool` | 布尔值 |

**关联方法**（6 个）：`SetTaskGroup`, `SetJob`, `hasDistinctHostsConstraint`, `Next`, `satisfiesDistinctHosts`, `Reset`

### DistinctPropertyIterator

**定义位置**：[L897](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L897)

**中文说明**：DistinctPropertyIterator 是一个迭代器，按顺序遍历集合元素。

**类型**：struct

```go
type DistinctPropertyIterator struct {
	ctx Context
	source FeasibleIterator
	tg *structs.TaskGroup
	job *structs.Job
	hasDistinctPropertyConstraints bool
	jobPropertySets []*propertySet
	groupPropertySets map[string][]*propertySet
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `source` | `FeasibleIterator` | — |
| `tg` | `*structs.TaskGroup` | — |
| `job` | `*structs.Job` | — |
| `hasDistinctPropertyConstraints` | `bool` | 布尔值 |
| `jobPropertySets` | `[]*propertySet` | 列表 |
| `groupPropertySets` | `map[string][]*propertySet` | 映射表 |

**关联方法**（5 个）：`SetTaskGroup`, `SetJob`, `Next`, `satisfiesProperties`, `Reset`

### ConstraintChecker

**定义位置**：[L1002](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1002)

**中文说明**：ConstraintChecker 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ConstraintChecker struct {
	ctx ConstraintContext
	constraints []*structs.Constraint
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `ConstraintContext` | 上下文，用于控制请求的生命周期 |
| `constraints` | `[]*structs.Constraint` | 列表 |

**关联方法**（3 个）：`SetConstraints`, `Feasible`, `meetsConstraint`

### FeasibilityWrapper

**定义位置**：[L1363](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1363)

**中文说明**：FeasibilityWrapper 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type FeasibilityWrapper struct {
	ctx Context
	source FeasibleIterator
	jobCheckers []FeasibilityChecker
	tgCheckers []FeasibilityChecker
	tgAvailable []FeasibilityChecker
	tg string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `source` | `FeasibleIterator` | — |
| `jobCheckers` | `[]FeasibilityChecker` | 列表 |
| `tgCheckers` | `[]FeasibilityChecker` | 列表 |
| `tgAvailable` | `[]FeasibilityChecker` | 列表 |
| `tg` | `string` | 字符串 |

**关联方法**（4 个）：`SetTaskGroup`, `Reset`, `Next`, `available`

### DeviceChecker

**定义位置**：[L1507](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1507)

**中文说明**：DeviceChecker 与设备（Device）相关，管理硬件资源如 GPU/FPGA。

**类型**：struct

```go
type DeviceChecker struct {
	ctx Context
	required []*structs.RequestedDevice
	requiresDevices bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `required` | `[]*structs.RequestedDevice` | 列表 |
| `requiresDevices` | `bool` | 布尔值 |

**关联方法**（3 个）：`SetTaskGroup`, `Feasible`, `hasDevices`

### VerConstraints

**定义位置**：[L1783](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1783)

**中文说明**：VerConstraints 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type VerConstraints interface {
	Check func(...)
	String func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Check` | `func(...)` | — |
| `String` | `func(...)` | — |

### verConstraintParser

**定义位置**：[L1790](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1790)

**类型定义**：`type verConstraintParser func(...)`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `FilterConstraintHostVolumes` | `—` | `"missing compatible host volumes"` | — |
| `FilterConstraintCSIPluginTemplate` | `—` | `"CSI plugin %s is missing from client %s"` | — |
| `FilterConstraintCSIPluginUnhealthyTemplate` | `—` | `"CSI plugin %s is unhealthy on client %s"` | — |
| `FilterConstraintCSIPluginMaxVolumesTemplate` | `—` | `"CSI plugin %s has the maximum number of volumes on clien...` | — |
| `FilterConstraintCSIVolumesLookupFailed` | `—` | `"CSI volume lookup failed"` | — |
| `FilterConstraintCSIVolumeNotFoundTemplate` | `—` | `"missing CSI Volume %s"` | — |
| `FilterConstraintCSIVolumeNoReadTemplate` | `—` | `"CSI volume %s is unschedulable or has exhausted its avai...` | — |
| `FilterConstraintCSIVolumeNoWriteTemplate` | `—` | `"CSI volume %s is unschedulable or is read-only"` | — |
| `FilterConstraintCSIVolumeInUseTemplate` | `—` | `"CSI volume %s has exhausted its available writer claims"` | — |
| `FilterConstraintCSIVolumeGCdAllocationTemplate` | `—` | `"CSI volume %s has exhausted its available writer claims ...` | — |
| `FilterConstraintDrivers` | `—` | `"missing drivers"` | — |
| `FilterConstraintDevices` | `—` | `"missing devices"` | — |
| `FilterConstraintSecrets` | `—` | `"missing secrets provider"` | — |
| `FilterConstraintsCSIPluginTopology` | `—` | `"did not meet topology requirement"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `predatesBridgeFingerprint` | `—` | `mustBridgeConstraint()` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `mustBridgeConstraint` | - | `` | `version.Constraints` | [L49](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L49) |
| `NewStaticIterator` | - | `ctx Context, nodes []*structs.Node` | `*StaticIterator` | [L93](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L93) |
| `Next` | `iter *StaticIterator` | `` | `*structs.Node` | [L101](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L101) |
| `Reset` | `iter *StaticIterator` | `` | `` | [L120](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L120) |
| `SetNodes` | `iter *StaticIterator` | `nodes []*structs.Node` | `` | [L124](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L124) |
| `ShuffleNodes` | - | `plan *structs.Plan, index uint64, nodes []*structs.Node` | `` | [L134](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L134) |
| `NewRandomIterator` | - | `ctx Context, nodes []*structs.Node` | `*StaticIterator` | [L156](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L156) |
| `NewSecretsProviderChecker` | - | `ctx Context, secrets map[string]struct{...}` | `*SecretsProviderChecker` | [L170](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L170) |
| `SetSecrets` | `s *SecretsProviderChecker` | `secrets map[string]struct{...}` | `` | [L177](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L177) |
| `Feasible` | `s *SecretsProviderChecker` | `option *structs.Node` | `bool` | [L182](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L182) |
| `hasSecrets` | `s *SecretsProviderChecker` | `option *structs.Node` | `bool` | [L194](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L194) |
| `NewHostVolumeChecker` | - | `ctx Context` | `*HostVolumeChecker` | [L219](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L219) |
| `SetVolumes` | `h *HostVolumeChecker` | `allocName string, ns string, jobID string, taskGroupName string, volumes map[...` | `` | [L230](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L230) |
| `proposedAllocMeetsClaim` | - | `proposed *structs.Allocation, claim *structs.TaskGroupHostVolumeClaim, vol *s...` | `bool` | [L292](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L292) |
| `Feasible` | `h *HostVolumeChecker` | `candidate *structs.Node` | `bool` | [L312](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L312) |
| `hasVolumes` | `h *HostVolumeChecker` | `n *structs.Node` | `bool` | [L321](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L321) |
| `hostVolumeIsAvailable` | `h *HostVolumeChecker` | `vol *structs.HostVolume, reqAccess structs.VolumeAccessMode, reqAttach struct...` | `bool` | [L393](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L393) |
| `NewCSIVolumeChecker` | - | `ctx Context` | `*CSIVolumeChecker` | [L478](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L478) |
| `SetJobID` | `c *CSIVolumeChecker` | `jobID string` | `` | [L484](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L484) |
| `SetNamespace` | `c *CSIVolumeChecker` | `namespace string` | `` | [L488](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L488) |
| `SetVolumes` | `c *CSIVolumeChecker` | `allocName string, volumes map[string]*structs.VolumeRequest` | `` | [L492](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L492) |
| `Feasible` | `c *CSIVolumeChecker` | `n *structs.Node` | `bool` | [L513](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L513) |
| `isFeasible` | `c *CSIVolumeChecker` | `n *structs.Node` | `bool, string` | [L523](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L523) |
| `NewNetworkChecker` | - | `ctx Context` | `*NetworkChecker` | [L627](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L627) |
| `SetNetwork` | `c *NetworkChecker` | `network *structs.NetworkResource` | `` | [L631](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L631) |
| `Feasible` | `c *NetworkChecker` | `option *structs.Node` | `bool` | [L642](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L642) |
| `hasHostNetworks` | `c *NetworkChecker` | `option *structs.Node` | `bool` | [L674](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L674) |
| `hasNetwork` | `c *NetworkChecker` | `option *structs.Node` | `bool` | [L698](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L698) |
| `NewDriverChecker` | - | `ctx Context, drivers map[string]struct{...}` | `*DriverChecker` | [L724](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L724) |
| `SetDrivers` | `c *DriverChecker` | `d map[string]struct{...}` | `` | [L731](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L731) |
| `Feasible` | `c *DriverChecker` | `option *structs.Node` | `bool` | [L735](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L735) |
| `hasDrivers` | `c *DriverChecker` | `option *structs.Node` | `bool` | [L747](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L747) |
| `NewDistinctHostsIterator` | - | `ctx Context, source FeasibleIterator` | `*DistinctHostsIterator` | [L803](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L803) |
| `SetTaskGroup` | `iter *DistinctHostsIterator` | `tg *structs.TaskGroup` | `` | [L810](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L810) |
| `SetJob` | `iter *DistinctHostsIterator` | `job *structs.Job` | `` | [L815](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L815) |
| `hasDistinctHostsConstraint` | `iter *DistinctHostsIterator` | `constraints []*structs.Constraint` | `bool` | [L820](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L820) |
| `Next` | `iter *DistinctHostsIterator` | `` | `*structs.Node` | [L837](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L837) |
| `satisfiesDistinctHosts` | `iter *DistinctHostsIterator` | `option *structs.Node` | `bool` | [L861](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L861) |
| `Reset` | `iter *DistinctHostsIterator` | `` | `` | [L890](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L890) |
| `NewDistinctPropertyIterator` | - | `ctx Context, source FeasibleIterator` | `*DistinctPropertyIterator` | [L909](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L909) |
| `SetTaskGroup` | `iter *DistinctPropertyIterator` | `tg *structs.TaskGroup` | `` | [L917](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L917) |
| `SetJob` | `iter *DistinctPropertyIterator` | `job *structs.Job` | `` | [L937](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L937) |
| `Next` | `iter *DistinctPropertyIterator` | `` | `*structs.Node` | [L952](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L952) |
| `satisfiesProperties` | `iter *DistinctPropertyIterator` | `option *structs.Node, set []*propertySet` | `bool` | [L974](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L974) |
| `Reset` | `iter *DistinctPropertyIterator` | `` | `` | [L985](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L985) |
| `NewConstraintChecker` | - | `ctx ConstraintContext, constraints []*structs.Constraint` | `*ConstraintChecker` | [L1008](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1008) |
| `SetConstraints` | `c *ConstraintChecker` | `constraints []*structs.Constraint` | `` | [L1015](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1015) |
| `Feasible` | `c *ConstraintChecker` | `option *structs.Node` | `bool` | [L1019](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1019) |
| `meetsConstraint` | `c *ConstraintChecker` | `constraint *structs.Constraint, option *structs.Node` | `bool` | [L1030](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1030) |
| `resolveTarget` | - | `target string, node *structs.Node` | `string, bool` | [L1041](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1041) |
| `checkConstraint` | - | `ctx ConstraintContext, operand string, lVal interface{}, rVal interface{}, lF...` | `bool` | [L1081](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1081) |
| `checkAffinity` | - | `ctx Context, operand string, lVal interface{}, rVal interface{}, lFound bool,...` | `bool` | [L1119](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1119) |
| `checkAttributeAffinity` | - | `ctx Context, operand string, lVal *psstructs.Attribute, rVal *psstructs.Attri...` | `bool` | [L1124](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1124) |
| `checkOrder` | - | `operand string, lVal any, rVal any` | `bool` | [L1130](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1130) |
| `checkIntegralOrder` | - | `op string, lVal string, rVal string` | `bool, bool` | [L1146](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1146) |
| `checkFloatOrder` | - | `op string, lVal string, rVal string` | `bool, bool` | [L1159](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1159) |
| `checkLexicalOrder` | - | `op string, lVal string, rVal string` | `bool` | [L1172](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1172) |
| `compareOrder` | - | `op string, left T, right T` | `bool` | [L1177](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1177) |
| `checkVersionMatch` | - | `parse verConstraintParser, lVal interface{}, rVal interface{}` | `bool` | [L1194](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1194) |
| `checkAttributeVersionMatch` | - | `parse verConstraintParser, lVal *psstructs.Attribute, rVal *psstructs.Attribute` | `bool` | [L1230](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1230) |
| `checkRegexpMatch` | - | `ctx ConstraintContext, lVal interface{}, rVal interface{}` | `bool` | [L1265](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1265) |
| `checkSetContainsAll` | - | `lVal interface{}, rVal interface{}` | `bool` | [L1298](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1298) |
| `checkSetContainsAny` | - | `lVal interface{}, rVal interface{}` | `bool` | [L1330](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1330) |
| `NewFeasibilityWrapper` | - | `ctx Context, source FeasibleIterator, jobCheckers []FeasibilityChecker, tgChe...` | `*FeasibilityWrapper` | [L1374](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1374) |
| `SetTaskGroup` | `w *FeasibilityWrapper` | `tg string` | `` | [L1385](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1385) |
| `Reset` | `w *FeasibilityWrapper` | `` | `` | [L1389](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1389) |
| `Next` | `w *FeasibilityWrapper` | `` | `*structs.Node` | [L1395](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1395) |
| `available` | `w *FeasibilityWrapper` | `option *structs.Node` | `bool` | [L1491](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1491) |
| `NewDeviceChecker` | - | `ctx Context` | `*DeviceChecker` | [L1518](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1518) |
| `SetTaskGroup` | `c *DeviceChecker` | `tg *structs.TaskGroup` | `` | [L1524](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1524) |
| `Feasible` | `c *DeviceChecker` | `option *structs.Node` | `bool` | [L1532](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1532) |
| `hasDevices` | `c *DeviceChecker` | `option *structs.Node` | `bool` | [L1541](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1541) |
| `nodeDeviceMatches` | - | `ctx Context, d *structs.NodeDeviceResource, req *structs.RequestedDevice` | `bool` | [L1603](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1603) |
| `resolveDeviceTarget` | - | `target string, d *structs.NodeDeviceResource` | `*psstructs.Attribute, bool` | [L1629](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1629) |
| `checkAttributeConstraint` | - | `ctx ConstraintContext, operand string, lVal *psstructs.Attribute, rVal *psstr...` | `bool` | [L1666](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1666) |
| `newVersionConstraintParser` | - | `ctx ConstraintContext` | `verConstraintParser` | [L1792](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1792) |
| `newSemverConstraintParser` | - | `ctx ConstraintContext` | `verConstraintParser` | [L1810](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1810) |

## 5. 核心方法详解

### NewStaticIterator()

**签名**：`func NewStaticIterator(ctx Context, nodes []*structs.Node) *StaticIterator`

**位置**：[L93](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L93)

**中文说明**：创建并返回一个新的 StaticIterator 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `nodes` | `[]*structs.Node` | 列表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*StaticIterator` | — |

### NewRandomIterator()

**签名**：`func NewRandomIterator(ctx Context, nodes []*structs.Node) *StaticIterator`

**位置**：[L156](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L156)

**中文说明**：创建并返回一个新的 RandomIterator 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `nodes` | `[]*structs.Node` | 列表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*StaticIterator` | — |

### NewSecretsProviderChecker()

**签名**：`func NewSecretsProviderChecker(ctx Context, secrets map[string]struct{...}) *SecretsProviderChecker`

**位置**：[L170](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L170)

**中文说明**：创建并返回一个新的 SecretsProviderChecker 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `secrets` | `map[string]struct{...}` | 映射表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*SecretsProviderChecker` | — |

### NewHostVolumeChecker()

**签名**：`func NewHostVolumeChecker(ctx Context) *HostVolumeChecker`

**位置**：[L219](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L219)

**中文说明**：创建并返回一个新的 HostVolumeChecker 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*HostVolumeChecker` | — |

### NewCSIVolumeChecker()

**签名**：`func NewCSIVolumeChecker(ctx Context) *CSIVolumeChecker`

**位置**：[L478](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L478)

**中文说明**：创建并返回一个新的 CSIVolumeChecker 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*CSIVolumeChecker` | — |

### NewNetworkChecker()

**签名**：`func NewNetworkChecker(ctx Context) *NetworkChecker`

**位置**：[L627](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L627)

**中文说明**：创建并返回一个新的 NetworkChecker 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NetworkChecker` | — |

### NewDriverChecker()

**签名**：`func NewDriverChecker(ctx Context, drivers map[string]struct{...}) *DriverChecker`

**位置**：[L724](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L724)

**中文说明**：创建并返回一个新的 DriverChecker 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `drivers` | `map[string]struct{...}` | 映射表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DriverChecker` | — |

### NewDistinctHostsIterator()

**签名**：`func NewDistinctHostsIterator(ctx Context, source FeasibleIterator) *DistinctHostsIterator`

**位置**：[L803](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L803)

**中文说明**：创建并返回一个新的 DistinctHostsIterator 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `source` | `FeasibleIterator` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DistinctHostsIterator` | — |

### NewDistinctPropertyIterator()

**签名**：`func NewDistinctPropertyIterator(ctx Context, source FeasibleIterator) *DistinctPropertyIterator`

**位置**：[L909](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L909)

**中文说明**：创建并返回一个新的 DistinctPropertyIterator 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `source` | `FeasibleIterator` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DistinctPropertyIterator` | — |

### NewConstraintChecker()

**签名**：`func NewConstraintChecker(ctx ConstraintContext, constraints []*structs.Constraint) *ConstraintChecker`

**位置**：[L1008](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1008)

**中文说明**：创建并返回一个新的 ConstraintChecker 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `ConstraintContext` | 上下文，用于控制请求的生命周期 |
| `constraints` | `[]*structs.Constraint` | 列表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ConstraintChecker` | — |

### NewFeasibilityWrapper()

**签名**：`func NewFeasibilityWrapper(ctx Context, source FeasibleIterator, jobCheckers []FeasibilityChecker, tgCheckers []FeasibilityChecker, tgAvailable []FeasibilityChecker) *FeasibilityWrapper`

**位置**：[L1374](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1374)

**中文说明**：创建并返回一个新的 FeasibilityWrapper 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |
| `source` | `FeasibleIterator` | — |
| `jobCheckers` | `[]FeasibilityChecker` | 列表 |
| `tgCheckers` | `[]FeasibilityChecker` | 列表 |
| `tgAvailable` | `[]FeasibilityChecker` | 列表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*FeasibilityWrapper` | — |

### NewDeviceChecker()

**签名**：`func NewDeviceChecker(ctx Context) *DeviceChecker`

**位置**：[L1518](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1518)

**中文说明**：创建并返回一个新的 DeviceChecker 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `Context` | 上下文，用于控制请求的生命周期 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DeviceChecker` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `cmp` | 标准库 |
| `encoding/binary` | 标准库 |
| `fmt` | 标准库 |
| `math/rand` | 标准库 |
| `reflect` | 标准库 |
| `regexp` | 标准库 |
| `slices` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/helper/constraints/semver` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-version` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [feasible_test.go](file:///d:/claude/nomad/scheduler/feasible/feasible_test.go) | 对应测试文件 |
| [context.go](file:///d:/claude/nomad/scheduler/feasible/context.go) | 同目录源文件 |
| [device.go](file:///d:/claude/nomad/scheduler/feasible/device.go) | 同目录源文件 |
| [doc.go](file:///d:/claude/nomad/scheduler/feasible/doc.go) | 同目录源文件 |
| [numa_ce.go](file:///d:/claude/nomad/scheduler/feasible/numa_ce.go) | 同目录源文件 |
| [preemption.go](file:///d:/claude/nomad/scheduler/feasible/preemption.go) | 同目录源文件 |

