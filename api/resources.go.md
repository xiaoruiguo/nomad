# resources.go 代码说明文档

> 文件路径：[api/resources.go](file:///d:/claude/nomad/api/resources.go)
> 总行数：333 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `resources.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Resources

**定义位置**：[L13](file:///d:/claude/nomad/api/resources.go#L13)

**中文说明**：Resources 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Resources struct {
	CPU *int `hcl:"cpu,optional"`
	Cores *int `hcl:"cores,optional"`
	MemoryMB *int `mapstructure:"memory" hcl:"memory,optional"`
	MemoryMaxMB *int `mapstructure:"memory_max" hcl:"memory_max,optional"`
	DiskMB *int `mapstructure:"disk" hcl:"disk,optional"`
	Networks []*NetworkResource `hcl:"network,block"`
	Devices []*RequestedDevice `hcl:"device,block"`
	NUMA *NUMAResource `hcl:"numa,block"`
	SecretsMB *int `mapstructure:"secrets" hcl:"secrets,optional"`
	IOPS *int `hcl:"iops,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CPU` | `*int `hcl:"cpu,optional"`` | — |
| `Cores` | `*int `hcl:"cores,optional"`` | — |
| `MemoryMB` | `*int `mapstructure:"memory" hcl:"memory,optional"`` | — |
| `MemoryMaxMB` | `*int `mapstructure:"memory_max" hcl:"memory_max,optional"`` | — |
| `DiskMB` | `*int `mapstructure:"disk" hcl:"disk,optional"`` | — |
| `Networks` | `[]*NetworkResource `hcl:"network,block"`` | 列表 |
| `Devices` | `[]*RequestedDevice `hcl:"device,block"`` | 列表 |
| `NUMA` | `*NUMAResource `hcl:"numa,block"`` | — |
| `SecretsMB` | `*int `mapstructure:"secrets" hcl:"secrets,optional"`` | — |
| `IOPS` | `*int `hcl:"iops,optional"`` | — |

**关联方法**（2 个）：`Canonicalize`, `Merge`

### NUMAResource

**定义位置**：[L116](file:///d:/claude/nomad/api/resources.go#L116)

**中文说明**：NUMAResource 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type NUMAResource struct {
	Affinity string `hcl:"affinity,optional"`
	Devices []string `hcl:"devices,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Affinity` | `string `hcl:"affinity,optional"`` | 字符串 |
| `Devices` | `[]string `hcl:"devices,optional"`` | 列表 |

**关联方法**（2 个）：`Copy`, `Canonicalize`

### Port

**定义位置**：[L147](file:///d:/claude/nomad/api/resources.go#L147)

**中文说明**：Port 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Port struct {
	Label string `hcl:",label"`
	Value int `hcl:"static,optional"`
	To int `hcl:"to,optional"`
	HostNetwork string `hcl:"host_network,optional"`
	IgnoreCollision bool `hcl:"ignore_collision,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Label` | `string `hcl:",label"`` | 字符串 |
| `Value` | `int `hcl:"static,optional"`` | 值 |
| `To` | `int `hcl:"to,optional"`` | — |
| `HostNetwork` | `string `hcl:"host_network,optional"`` | 字符串 |
| `IgnoreCollision` | `bool `hcl:"ignore_collision,optional"`` | 布尔值 |

### DNSConfig

**定义位置**：[L155](file:///d:/claude/nomad/api/resources.go#L155)

**中文说明**：DNSConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type DNSConfig struct {
	Servers []string `mapstructure:"servers" hcl:"servers,optional"`
	Searches []string `mapstructure:"searches" hcl:"searches,optional"`
	Options []string `mapstructure:"options" hcl:"options,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Servers` | `[]string `mapstructure:"servers" hcl:"servers,optional"`` | 列表 |
| `Searches` | `[]string `mapstructure:"searches" hcl:"searches,optional"`` | 列表 |
| `Options` | `[]string `mapstructure:"options" hcl:"options,optional"`` | 选项 |

### CNIConfig

**定义位置**：[L160](file:///d:/claude/nomad/api/resources.go#L160)

**中文说明**：CNIConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type CNIConfig struct {
	Args map[string]string `hcl:"args,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Args` | `map[string]string `hcl:"args,optional"`` | 参数 |

### NetworkResource

**定义位置**：[L166](file:///d:/claude/nomad/api/resources.go#L166)

**中文说明**：NetworkResource 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type NetworkResource struct {
	Mode string `hcl:"mode,optional"`
	Device string `hcl:"device,optional"`
	CIDR string `hcl:"cidr,optional"`
	IP string `hcl:"ip,optional"`
	DNS *DNSConfig `hcl:"dns,block"`
	ReservedPorts []Port `hcl:"reserved_ports,block"`
	DynamicPorts []Port `hcl:"port,block"`
	Hostname string `hcl:"hostname,optional"`
	MBits *int `hcl:"mbits,optional"`
	CNI *CNIConfig `hcl:"cni,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Mode` | `string `hcl:"mode,optional"`` | 字符串 |
| `Device` | `string `hcl:"device,optional"`` | 字符串 |
| `CIDR` | `string `hcl:"cidr,optional"`` | 字符串 |
| `IP` | `string `hcl:"ip,optional"`` | 字符串 |
| `DNS` | `*DNSConfig `hcl:"dns,block"`` | — |
| `ReservedPorts` | `[]Port `hcl:"reserved_ports,block"`` | 列表 |
| `DynamicPorts` | `[]Port `hcl:"port,block"`` | 列表 |
| `Hostname` | `string `hcl:"hostname,optional"`` | 字符串 |
| `MBits` | `*int `hcl:"mbits,optional"`` | — |
| `CNI` | `*CNIConfig `hcl:"cni,block"`` | — |

**关联方法**（3 个）：`Megabits`, `Canonicalize`, `HasPorts`

### NodeDeviceResource

**定义位置**：[L212](file:///d:/claude/nomad/api/resources.go#L212)

**中文说明**：NodeDeviceResource 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeDeviceResource struct {
	Vendor string
	Type string
	Name string
	Instances []*NodeDevice
	Attributes map[string]*Attribute
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Vendor` | `string` | 字符串 |
| `Type` | `string` | 类型 指定 类型 的 设备 |
| `Name` | `string` | 名称 |
| `Instances` | `[]*NodeDevice` | 列表 |
| `Attributes` | `map[string]*Attribute` | 映射表 |

**关联方法**（1 个）：`ID`

### NodeDevice

**定义位置**：[L234](file:///d:/claude/nomad/api/resources.go#L234)

**中文说明**：NodeDevice 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeDevice struct {
	ID string
	Healthy bool
	HealthDescription string
	Locality *NodeDeviceLocality
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | ID is ID 的 设备. |
| `Healthy` | `bool` | 是否健康 |
| `HealthDescription` | `string` | 字符串 |
| `Locality` | `*NodeDeviceLocality` | — |

### Attribute

**定义位置**：[L252](file:///d:/claude/nomad/api/resources.go#L252)

**中文说明**：Attribute 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Attribute struct {
	FloatVal *float64 `json:"Float,omitempty"`
	IntVal *int64 `json:"Int,omitempty"`
	StringVal *string `json:"String,omitempty"`
	BoolVal *bool `json:"Bool,omitempty"`
	Unit string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `FloatVal` | `*float64 `json:"Float,omitempty"`` | — |
| `IntVal` | `*int64 `json:"Int,omitempty"`` | — |
| `StringVal` | `*string `json:"String,omitempty"`` | 字符串 |
| `BoolVal` | `*bool `json:"Bool,omitempty"`` | 布尔值 |
| `Unit` | `string` | 字符串 |

**关联方法**（1 个）：`String`

### NodeDeviceLocality

**定义位置**：[L294](file:///d:/claude/nomad/api/resources.go#L294)

**中文说明**：NodeDeviceLocality 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeDeviceLocality struct {
	PciBusID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PciBusID` | `string` | 字符串 |

### RequestedDevice

**定义位置**：[L300](file:///d:/claude/nomad/api/resources.go#L300)

**中文说明**：RequestedDevice 与设备（Device）相关，管理硬件资源如 GPU/FPGA。

**类型**：struct

```go
type RequestedDevice struct {
	Name string `hcl:",label"`
	Count *uint64 `hcl:"count,optional"`
	Constraints []*Constraint `hcl:"constraint,block"`
	Affinities []*Affinity `hcl:"affinity,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:",label"`` | 名称 |
| `Count` | `*uint64 `hcl:"count,optional"`` | 计数 |
| `Constraints` | `[]*Constraint `hcl:"constraint,block"`` | 列表 |
| `Affinities` | `[]*Affinity `hcl:"affinity,block"`` | 列表 |

**关联方法**（1 个）：`Canonicalize`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Canonicalize` | `r *Resources` | `` | `` | [L33](file:///d:/claude/nomad/api/resources.go#L33) |
| `DefaultResources` | - | `` | `*Resources` | [L64](file:///d:/claude/nomad/api/resources.go#L64) |
| `MinResources` | - | `` | `*Resources` | [L77](file:///d:/claude/nomad/api/resources.go#L77) |
| `Merge` | `r *Resources` | `other *Resources` | `` | [L86](file:///d:/claude/nomad/api/resources.go#L86) |
| `Copy` | `n *NUMAResource` | `` | `*NUMAResource` | [L125](file:///d:/claude/nomad/api/resources.go#L125) |
| `Canonicalize` | `n *NUMAResource` | `` | `` | [L135](file:///d:/claude/nomad/api/resources.go#L135) |
| `Megabits` | `n *NetworkResource` | `` | `int` | [L190](file:///d:/claude/nomad/api/resources.go#L190) |
| `Canonicalize` | `n *NetworkResource` | `` | `` | [L197](file:///d:/claude/nomad/api/resources.go#L197) |
| `HasPorts` | `n *NetworkResource` | `` | `bool` | [L202](file:///d:/claude/nomad/api/resources.go#L202) |
| `ID` | `r *NodeDeviceResource` | `` | `string` | [L229](file:///d:/claude/nomad/api/resources.go#L229) |
| `String` | `a *Attribute` | `` | `string` | [L269](file:///d:/claude/nomad/api/resources.go#L269) |
| `Canonicalize` | `d *RequestedDevice` | `` | `` | [L324](file:///d:/claude/nomad/api/resources.go#L324) |

## 5. 核心方法详解

### Copy()

**签名**：`func (n *NUMAResource) Copy() *NUMAResource`

**位置**：[L125](file:///d:/claude/nomad/api/resources.go#L125)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NUMAResource` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `slices` | 标准库 |
| `strconv` | 标准库 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [resources_test.go](file:///d:/claude/nomad/api/resources_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

