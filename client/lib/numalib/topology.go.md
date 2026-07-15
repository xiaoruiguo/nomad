# topology.go 代码说明文档

> 文件路径：[lib/numalib/topology.go](file:///d:/claude/nomad/client/lib/numalib/topology.go)
> 总行数：328 行
> 所属包：`numalib`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **NUMA 库子包**（`client/lib/numalib`），处理 NUMA（非统一内存访问）拓扑和 CPU 绑定。

## 2. 类型定义

### CoreGrade

**定义位置**：[L23](file:///d:/claude/nomad/client/lib/numalib/topology.go#L23)

**类型定义**：`bool`

**关联方法**（1 个）：`String`

### Cost

**定义位置**：[L49](file:///d:/claude/nomad/client/lib/numalib/topology.go#L49)

**类型定义**：`uint8`

### Topology

**定义位置**：[L56](file:///d:/claude/nomad/client/lib/numalib/topology.go#L56)

**类型**：struct

```go
	nodeIDs *idset.Set[hw.NodeID]
	Nodes []uint8
	Distances SLIT
	Cores []Core
	BusAssociativity map[string]hw.NodeID
	OverrideTotalCompute hw.MHz
	OverrideWitholdCompute hw.MHz
```

**关联方法**（17 个）：`SetNodes`, `SetNodesFrom`, `NodeDistance`, `SupportsNUMA`, `GetNodes`, `NodeCores`, `insert`, `String`, `TotalCompute`, `UsableCompute`, `NumCores`, `NumPCores`, `NumECores`, `UsableCores`, `CoreSpeeds`, `Compute`, `Equal`

### Core

**定义位置**：[L106](file:///d:/claude/nomad/client/lib/numalib/topology.go#L106)

**类型**：struct

```go
	SocketID hw.SocketID
	NodeID hw.NodeID
	ID hw.CoreID
	Grade CoreGrade
	Disable bool
	BaseSpeed hw.MHz
	MaxSpeed hw.MHz
	GuessSpeed hw.MHz
```

**关联方法**（2 个）：`String`, `MHz`

### SLIT

**定义位置**：[L136](file:///d:/claude/nomad/client/lib/numalib/topology.go#L136)

**类型定义**：`[][]Cost`

**关联方法**（1 个）：`cost`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `Performance` | `true` |
| `Efficiency` | `false` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `gradeOf` | - | `siblings *idset.Set[hw.CoreID]` | `CoreGrade` | [L30](file:///d:/claude/nomad/client/lib/numalib/topology.go#L30) |
| `String` | `g *CoreGrade` | - | `string` | [L39](file:///d:/claude/nomad/client/lib/numalib/topology.go#L39) |
| `SetNodes` | `st *Topology` | `nodes *idset.Set[hw.NodeID]` | - | [L90](file:///d:/claude/nomad/client/lib/numalib/topology.go#L90) |
| `SetNodesFrom` | `st *Topology` | `nodes []uint8` | - | [L99](file:///d:/claude/nomad/client/lib/numalib/topology.go#L99) |
| `String` | `c *Core` | - | `string` | [L117](file:///d:/claude/nomad/client/lib/numalib/topology.go#L117) |
| `MHz` | `c *Core` | - | `hw.MHz` | [L124](file:///d:/claude/nomad/client/lib/numalib/topology.go#L124) |
| `cost` | `d *SLIT` | `a hw.NodeID, b hw.NodeID` | `Cost` | [L138](file:///d:/claude/nomad/client/lib/numalib/topology.go#L138) |
| `NodeDistance` | `st *Topology` | `node hw.NodeID, core Core` | `Cost` | [L142](file:///d:/claude/nomad/client/lib/numalib/topology.go#L142) |
| `SupportsNUMA` | `st *Topology` | - | `bool` | [L165](file:///d:/claude/nomad/client/lib/numalib/topology.go#L165) |
| `GetNodes` | `st *Topology` | - | `*idset.Set[hw.NodeID]` | [L175](file:///d:/claude/nomad/client/lib/numalib/topology.go#L175) |
| `NodeCores` | `st *Topology` | `node hw.NodeID` | `*idset.Set[hw.CoreID]` | [L183](file:///d:/claude/nomad/client/lib/numalib/topology.go#L183) |
| `insert` | `st *Topology` | `node hw.NodeID, socket hw.SocketID, core hw.CoreID, grade CoreGrade, max hw....` | - | [L193](file:///d:/claude/nomad/client/lib/numalib/topology.go#L193) |
| `String` | `st *Topology` | - | `string` | [L204](file:///d:/claude/nomad/client/lib/numalib/topology.go#L204) |
| `TotalCompute` | `st *Topology` | - | `hw.MHz` | [L218](file:///d:/claude/nomad/client/lib/numalib/topology.go#L218) |
| `UsableCompute` | `st *Topology` | - | `hw.MHz` | [L237](file:///d:/claude/nomad/client/lib/numalib/topology.go#L237) |
| `NumCores` | `st *Topology` | - | `int` | [L259](file:///d:/claude/nomad/client/lib/numalib/topology.go#L259) |
| `NumPCores` | `st *Topology` | - | `int` | [L264](file:///d:/claude/nomad/client/lib/numalib/topology.go#L264) |
| `NumECores` | `st *Topology` | - | `int` | [L275](file:///d:/claude/nomad/client/lib/numalib/topology.go#L275) |
| `UsableCores` | `st *Topology` | - | `*idset.Set[hw.CoreID]` | [L288](file:///d:/claude/nomad/client/lib/numalib/topology.go#L288) |
| `CoreSpeeds` | `st *Topology` | - | `hw.MHz, hw.MHz` | [L300](file:///d:/claude/nomad/client/lib/numalib/topology.go#L300) |
| `Compute` | `st *Topology` | - | `cpustats.Compute` | [L313](file:///d:/claude/nomad/client/lib/numalib/topology.go#L313) |
| `Equal` | `st *Topology` | `o *Topology` | `bool` | [L320](file:///d:/claude/nomad/client/lib/numalib/topology.go#L320) |

## 5. 核心方法详解

### GetNodes()

**签名**：`func (st *Topology) GetNodes() *idset.Set[hw.NodeID]`

**位置**：[L175](file:///d:/claude/nomad/client/lib/numalib/topology.go#L175)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `runtime` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cpustats` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/idset` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib/hw` | 内部包 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Client 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|

