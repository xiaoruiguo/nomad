# feasible.go 代码说明文档

> 文件路径：[feasible/feasible.go](file:///d:/claude/nomad/scheduler/feasible/feasible.go)
> 总行数：1827 行
> 所属包：`feasible`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **可行性检查子包**（`scheduler/feasible`），实现调度器的可行性检查和评分迭代器栈。包含节点过滤（约束、驱动、设备、网络）、评分（装箱、分散、资源利用率）、抢占、排名等核心调度算法。是调度决策的核心引擎，采用迭代器链模式（Iterator Chain）实现可组合的调度管道。

## 2. 类型定义

### FeasibleIterator

**定义位置**：[L60](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L60)

**类型**：interface

```go
	Next
	Reset
```

### ContextualIterator

**定义位置**：[L71](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L71)

**类型**：interface

```go
	SetJob
	SetTaskGroup
```

### FeasibilityChecker

**定义位置**：[L78](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L78)

**类型**：interface

```go
	Feasible
```

### StaticIterator

**定义位置**：[L85](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L85)

**类型**：struct

```go
	ctx Context
	nodes []*structs.Node
	offset int
	seen int
```

**关联方法**（3 个）：`Next`, `Reset`, `SetNodes`

### SecretsProviderChecker

**定义位置**：[L165](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L165)

**类型**：struct

```go
	ctx Context
	secrets map[string]struct{...}
```

**关联方法**（3 个）：`SetSecrets`, `Feasible`, `hasSecrets`

### HostVolumeChecker

**定义位置**：[L209](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L209)

**类型**：struct

```go
	ctx Context
	volumeReqs []*structs.VolumeRequest
	namespace string
	jobID string
	taskGroupName string
	unmetClaims []*structs.TaskGroupHostVolumeClaim
```

**关联方法**（4 个）：`SetVolumes`, `Feasible`, `hasVolumes`, `hostVolumeIsAvailable`

### CSIVolumeChecker

**定义位置**：[L471](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L471)

**类型**：struct

```go
	ctx Context
	namespace string
	jobID string
	volumes map[string]*structs.VolumeRequest
```

**关联方法**（5 个）：`SetJobID`, `SetNamespace`, `SetVolumes`, `Feasible`, `isFeasible`

### NetworkChecker

**定义位置**：[L621](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L621)

**类型**：struct

```go
	ctx Context
	networkMode string
	ports []structs.Port
```

**关联方法**（4 个）：`SetNetwork`, `Feasible`, `hasHostNetworks`, `hasNetwork`

### DriverChecker

**定义位置**：[L718](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L718)

**类型**：struct

```go
	ctx Context
	drivers map[string]struct{...}
```

**关联方法**（3 个）：`SetDrivers`, `Feasible`, `hasDrivers`

### DistinctHostsIterator

**定义位置**：[L790](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L790)

**类型**：struct

```go
	ctx Context
	source FeasibleIterator
	tg *structs.TaskGroup
	job *structs.Job
	tgDistinctHosts bool
	jobDistinctHosts bool
```

**关联方法**（6 个）：`SetTaskGroup`, `SetJob`, `hasDistinctHostsConstraint`, `Next`, `satisfiesDistinctHosts`, `Reset`

### DistinctPropertyIterator

**定义位置**：[L897](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L897)

**类型**：struct

```go
	ctx Context
	source FeasibleIterator
	tg *structs.TaskGroup
	job *structs.Job
	hasDistinctPropertyConstraints bool
	jobPropertySets []*propertySet
	groupPropertySets map[string][]*propertySet
```

**关联方法**（5 个）：`SetTaskGroup`, `SetJob`, `Next`, `satisfiesProperties`, `Reset`

### ConstraintChecker

**定义位置**：[L1002](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1002)

**类型**：struct

```go
	ctx ConstraintContext
	constraints []*structs.Constraint
```

**关联方法**（3 个）：`SetConstraints`, `Feasible`, `meetsConstraint`

### FeasibilityWrapper

**定义位置**：[L1363](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1363)

**类型**：struct

```go
	ctx Context
	source FeasibleIterator
	jobCheckers []FeasibilityChecker
	tgCheckers []FeasibilityChecker
	tgAvailable []FeasibilityChecker
	tg string
```

**关联方法**（4 个）：`SetTaskGroup`, `Reset`, `Next`, `available`

### DeviceChecker

**定义位置**：[L1507](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1507)

**类型**：struct

```go
	ctx Context
	required []*structs.RequestedDevice
	requiresDevices bool
```

**关联方法**（3 个）：`SetTaskGroup`, `Feasible`, `hasDevices`

### VerConstraints

**定义位置**：[L1783](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1783)

**类型**：interface

```go
	Check
	String
```

### verConstraintParser

**定义位置**：[L1790](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1790)

**类型定义**：`func(...)`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `FilterConstraintHostVolumes` | `"missing compatible host volumes"` |
| `FilterConstraintCSIPluginTemplate` | `"CSI plugin %s is missing from client %s"` |
| `FilterConstraintCSIPluginUnhealthyTemplate` | `"CSI plugin %s is unhealthy on client %s"` |
| `FilterConstraintCSIPluginMaxVolumesTemplate` | `"CSI plugin %s has the maximum number of volumes on clien...` |
| `FilterConstraintCSIVolumesLookupFailed` | `"CSI volume lookup failed"` |
| `FilterConstraintCSIVolumeNotFoundTemplate` | `"missing CSI Volume %s"` |
| `FilterConstraintCSIVolumeNoReadTemplate` | `"CSI volume %s is unschedulable or has exhausted its avai...` |
| `FilterConstraintCSIVolumeNoWriteTemplate` | `"CSI volume %s is unschedulable or is read-only"` |
| `FilterConstraintCSIVolumeInUseTemplate` | `"CSI volume %s has exhausted its available writer claims"` |
| `FilterConstraintCSIVolumeGCdAllocationTemplate` | `"CSI volume %s has exhausted its available writer claims ...` |
| `FilterConstraintDrivers` | `"missing drivers"` |
| `FilterConstraintDevices` | `"missing devices"` |
| `FilterConstraintSecrets` | `"missing secrets provider"` |
| `FilterConstraintsCSIPluginTopology` | `"did not meet topology requirement"` |

### 变量

| 名称 | 值 |
|------|----|
| `predatesBridgeFingerprint` | `mustBridgeConstraint()` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `mustBridgeConstraint` | - | - | `version.Constraints` | [L49](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L49) |
| `NewStaticIterator` | - | `ctx Context, nodes []*structs.Node` | `*StaticIterator` | [L93](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L93) |
| `Next` | `iter *StaticIterator` | - | `*structs.Node` | [L101](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L101) |
| `Reset` | `iter *StaticIterator` | - | - | [L120](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L120) |
| `SetNodes` | `iter *StaticIterator` | `nodes []*structs.Node` | - | [L124](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L124) |
| `ShuffleNodes` | - | `plan *structs.Plan, index uint64, nodes []*structs.Node` | - | [L134](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L134) |
| `NewRandomIterator` | - | `ctx Context, nodes []*structs.Node` | `*StaticIterator` | [L156](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L156) |
| `NewSecretsProviderChecker` | - | `ctx Context, secrets map[string]struct{...}` | `*SecretsProviderChecker` | [L170](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L170) |
| `SetSecrets` | `s *SecretsProviderChecker` | `secrets map[string]struct{...}` | - | [L177](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L177) |
| `Feasible` | `s *SecretsProviderChecker` | `option *structs.Node` | `bool` | [L182](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L182) |
| `hasSecrets` | `s *SecretsProviderChecker` | `option *structs.Node` | `bool` | [L194](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L194) |
| `NewHostVolumeChecker` | - | `ctx Context` | `*HostVolumeChecker` | [L219](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L219) |
| `SetVolumes` | `h *HostVolumeChecker` | `allocName string, ns string, jobID string, taskGroupName string, volumes map...` | - | [L230](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L230) |
| `proposedAllocMeetsClaim` | - | `proposed *structs.Allocation, claim *structs.TaskGroupHostVolumeClaim, vol *...` | `bool` | [L292](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L292) |
| `Feasible` | `h *HostVolumeChecker` | `candidate *structs.Node` | `bool` | [L312](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L312) |
| `hasVolumes` | `h *HostVolumeChecker` | `n *structs.Node` | `bool` | [L321](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L321) |
| `hostVolumeIsAvailable` | `h *HostVolumeChecker` | `vol *structs.HostVolume, reqAccess structs.VolumeAccessMode, reqAttach struc...` | `bool` | [L393](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L393) |
| `NewCSIVolumeChecker` | - | `ctx Context` | `*CSIVolumeChecker` | [L478](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L478) |
| `SetJobID` | `c *CSIVolumeChecker` | `jobID string` | - | [L484](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L484) |
| `SetNamespace` | `c *CSIVolumeChecker` | `namespace string` | - | [L488](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L488) |
| `SetVolumes` | `c *CSIVolumeChecker` | `allocName string, volumes map[string]*structs.VolumeRequest` | - | [L492](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L492) |
| `Feasible` | `c *CSIVolumeChecker` | `n *structs.Node` | `bool` | [L513](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L513) |
| `isFeasible` | `c *CSIVolumeChecker` | `n *structs.Node` | `bool, string` | [L523](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L523) |
| `NewNetworkChecker` | - | `ctx Context` | `*NetworkChecker` | [L627](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L627) |
| `SetNetwork` | `c *NetworkChecker` | `network *structs.NetworkResource` | - | [L631](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L631) |
| `Feasible` | `c *NetworkChecker` | `option *structs.Node` | `bool` | [L642](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L642) |
| `hasHostNetworks` | `c *NetworkChecker` | `option *structs.Node` | `bool` | [L674](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L674) |
| `hasNetwork` | `c *NetworkChecker` | `option *structs.Node` | `bool` | [L698](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L698) |
| `NewDriverChecker` | - | `ctx Context, drivers map[string]struct{...}` | `*DriverChecker` | [L724](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L724) |
| `SetDrivers` | `c *DriverChecker` | `d map[string]struct{...}` | - | [L731](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L731) |
| `Feasible` | `c *DriverChecker` | `option *structs.Node` | `bool` | [L735](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L735) |
| `hasDrivers` | `c *DriverChecker` | `option *structs.Node` | `bool` | [L747](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L747) |
| `NewDistinctHostsIterator` | - | `ctx Context, source FeasibleIterator` | `*DistinctHostsIterator` | [L803](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L803) |
| `SetTaskGroup` | `iter *DistinctHostsIterator` | `tg *structs.TaskGroup` | - | [L810](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L810) |
| `SetJob` | `iter *DistinctHostsIterator` | `job *structs.Job` | - | [L815](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L815) |
| `hasDistinctHostsConstraint` | `iter *DistinctHostsIterator` | `constraints []*structs.Constraint` | `bool` | [L820](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L820) |
| `Next` | `iter *DistinctHostsIterator` | - | `*structs.Node` | [L837](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L837) |
| `satisfiesDistinctHosts` | `iter *DistinctHostsIterator` | `option *structs.Node` | `bool` | [L861](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L861) |
| `Reset` | `iter *DistinctHostsIterator` | - | - | [L890](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L890) |
| `NewDistinctPropertyIterator` | - | `ctx Context, source FeasibleIterator` | `*DistinctPropertyIterator` | [L909](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L909) |
| `SetTaskGroup` | `iter *DistinctPropertyIterator` | `tg *structs.TaskGroup` | - | [L917](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L917) |
| `SetJob` | `iter *DistinctPropertyIterator` | `job *structs.Job` | - | [L937](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L937) |
| `Next` | `iter *DistinctPropertyIterator` | - | `*structs.Node` | [L952](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L952) |
| `satisfiesProperties` | `iter *DistinctPropertyIterator` | `option *structs.Node, set []*propertySet` | `bool` | [L974](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L974) |
| `Reset` | `iter *DistinctPropertyIterator` | - | - | [L985](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L985) |
| `NewConstraintChecker` | - | `ctx ConstraintContext, constraints []*structs.Constraint` | `*ConstraintChecker` | [L1008](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1008) |
| `SetConstraints` | `c *ConstraintChecker` | `constraints []*structs.Constraint` | - | [L1015](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1015) |
| `Feasible` | `c *ConstraintChecker` | `option *structs.Node` | `bool` | [L1019](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1019) |
| `meetsConstraint` | `c *ConstraintChecker` | `constraint *structs.Constraint, option *structs.Node` | `bool` | [L1030](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1030) |
| `resolveTarget` | - | `target string, node *structs.Node` | `string, bool` | [L1041](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1041) |
| `checkConstraint` | - | `ctx ConstraintContext, operand string, lVal interface{}, rVal interface{}, l...` | `bool` | [L1081](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1081) |
| `checkAffinity` | - | `ctx Context, operand string, lVal interface{}, rVal interface{}, lFound bool...` | `bool` | [L1119](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1119) |
| `checkAttributeAffinity` | - | `ctx Context, operand string, lVal *psstructs.Attribute, rVal *psstructs.Attr...` | `bool` | [L1124](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1124) |
| `checkOrder` | - | `operand string, lVal any, rVal any` | `bool` | [L1130](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1130) |
| `checkIntegralOrder` | - | `op string, lVal string, rVal string` | `bool, bool` | [L1146](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1146) |
| `checkFloatOrder` | - | `op string, lVal string, rVal string` | `bool, bool` | [L1159](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1159) |
| `checkLexicalOrder` | - | `op string, lVal string, rVal string` | `bool` | [L1172](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1172) |
| `compareOrder` | - | `op string, left T, right T` | `bool` | [L1177](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1177) |
| `checkVersionMatch` | - | `parse verConstraintParser, lVal interface{}, rVal interface{}` | `bool` | [L1194](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1194) |
| `checkAttributeVersionMatch` | - | `parse verConstraintParser, lVal *psstructs.Attribute, rVal *psstructs.Attrib...` | `bool` | [L1230](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1230) |
| `checkRegexpMatch` | - | `ctx ConstraintContext, lVal interface{}, rVal interface{}` | `bool` | [L1265](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1265) |
| `checkSetContainsAll` | - | `lVal interface{}, rVal interface{}` | `bool` | [L1298](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1298) |
| `checkSetContainsAny` | - | `lVal interface{}, rVal interface{}` | `bool` | [L1330](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1330) |
| `NewFeasibilityWrapper` | - | `ctx Context, source FeasibleIterator, jobCheckers []FeasibilityChecker, tgCh...` | `*FeasibilityWrapper` | [L1374](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1374) |
| `SetTaskGroup` | `w *FeasibilityWrapper` | `tg string` | - | [L1385](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1385) |
| `Reset` | `w *FeasibilityWrapper` | - | - | [L1389](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1389) |
| `Next` | `w *FeasibilityWrapper` | - | `*structs.Node` | [L1395](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1395) |
| `available` | `w *FeasibilityWrapper` | `option *structs.Node` | `bool` | [L1491](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1491) |
| `NewDeviceChecker` | - | `ctx Context` | `*DeviceChecker` | [L1518](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1518) |
| `SetTaskGroup` | `c *DeviceChecker` | `tg *structs.TaskGroup` | - | [L1524](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1524) |
| `Feasible` | `c *DeviceChecker` | `option *structs.Node` | `bool` | [L1532](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1532) |
| `hasDevices` | `c *DeviceChecker` | `option *structs.Node` | `bool` | [L1541](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1541) |
| `nodeDeviceMatches` | - | `ctx Context, d *structs.NodeDeviceResource, req *structs.RequestedDevice` | `bool` | [L1603](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1603) |
| `resolveDeviceTarget` | - | `target string, d *structs.NodeDeviceResource` | `*psstructs.Attribute, bool` | [L1629](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1629) |
| `checkAttributeConstraint` | - | `ctx ConstraintContext, operand string, lVal *psstructs.Attribute, rVal *psst...` | `bool` | [L1666](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1666) |
| `newVersionConstraintParser` | - | `ctx ConstraintContext` | `verConstraintParser` | [L1792](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1792) |
| `newSemverConstraintParser` | - | `ctx ConstraintContext` | `verConstraintParser` | [L1810](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L1810) |

## 5. 核心方法详解

### NewStaticIterator()

**签名**：`func NewStaticIterator(ctx Context, nodes []*structs.Node) *StaticIterator`

**位置**：[L93](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L93)

### Next()

**签名**：`func (iter *StaticIterator) Next() *structs.Node`

**位置**：[L101](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L101)

### Reset()

**签名**：`func (iter *StaticIterator) Reset() `

**位置**：[L120](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L120)

### NewRandomIterator()

**签名**：`func NewRandomIterator(ctx Context, nodes []*structs.Node) *StaticIterator`

**位置**：[L156](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L156)

### NewSecretsProviderChecker()

**签名**：`func NewSecretsProviderChecker(ctx Context, secrets map[string]struct{...}) *SecretsProviderChecker`

**位置**：[L170](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L170)

### Feasible()

**签名**：`func (s *SecretsProviderChecker) Feasible(option *structs.Node) bool`

**位置**：[L182](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L182)

### NewHostVolumeChecker()

**签名**：`func NewHostVolumeChecker(ctx Context) *HostVolumeChecker`

**位置**：[L219](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L219)

### Feasible()

**签名**：`func (h *HostVolumeChecker) Feasible(candidate *structs.Node) bool`

**位置**：[L312](file:///d:/claude/nomad/scheduler/feasible/feasible.go#L312)

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
- **迭代器链模式**：实现迭代器接口，通过组合形成可配置的调度管道，每个迭代器负责一个调度阶段（过滤、评分、限制等）
- **MemDB 状态访问**：通过 MemDB 事务读取集群状态，支持多版本并发控制（MVCC）

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [feasible_test.go](file:///d:/claude/nomad/scheduler/feasible/feasible_test.go) | 对应测试文件 |

