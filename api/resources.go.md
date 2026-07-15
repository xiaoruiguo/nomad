# resources.go 代码说明文档

> 文件路径：[resources.go](file:///d:/claude/nomad/api/resources.go)
> 总行数：333 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **资源（Resources）API 类型定义**，提供 CPU/内存/磁盘等资源需求的数据结构。

## 2. 类型定义

### Resources

**定义位置**：[L13](file:///d:/claude/nomad/api/resources.go#L13)

**类型**：struct

```go
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
```

**关联方法**（2 个）：`Canonicalize`, `Merge`

### NUMAResource

**定义位置**：[L116](file:///d:/claude/nomad/api/resources.go#L116)

**类型**：struct

```go
	Affinity string `hcl:"affinity,optional"`
	Devices []string `hcl:"devices,optional"`
```

**关联方法**（2 个）：`Copy`, `Canonicalize`

### Port

**定义位置**：[L147](file:///d:/claude/nomad/api/resources.go#L147)

**类型**：struct

```go
	Label string `hcl:",label"`
	Value int `hcl:"static,optional"`
	To int `hcl:"to,optional"`
	HostNetwork string `hcl:"host_network,optional"`
	IgnoreCollision bool `hcl:"ignore_collision,optional"`
```

### DNSConfig

**定义位置**：[L155](file:///d:/claude/nomad/api/resources.go#L155)

**类型**：struct

```go
	Servers []string `mapstructure:"servers" hcl:"servers,optional"`
	Searches []string `mapstructure:"searches" hcl:"searches,optional"`
	Options []string `mapstructure:"options" hcl:"options,optional"`
```

### CNIConfig

**定义位置**：[L160](file:///d:/claude/nomad/api/resources.go#L160)

**类型**：struct

```go
	Args map[string]string `hcl:"args,optional"`
```

### NetworkResource

**定义位置**：[L166](file:///d:/claude/nomad/api/resources.go#L166)

**类型**：struct

```go
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
```

**关联方法**（3 个）：`Megabits`, `Canonicalize`, `HasPorts`

### NodeDeviceResource

**定义位置**：[L212](file:///d:/claude/nomad/api/resources.go#L212)

**类型**：struct

```go
	Vendor string
	Type string
	Name string
	Instances []*NodeDevice
	Attributes map[string]*Attribute
```

**关联方法**（1 个）：`ID`

### NodeDevice

**定义位置**：[L234](file:///d:/claude/nomad/api/resources.go#L234)

**类型**：struct

```go
	ID string
	Healthy bool
	HealthDescription string
	Locality *NodeDeviceLocality
```

### Attribute

**定义位置**：[L252](file:///d:/claude/nomad/api/resources.go#L252)

**类型**：struct

```go
	FloatVal *float64 `json:"Float,omitempty"`
	IntVal *int64 `json:"Int,omitempty"`
	StringVal *string `json:"String,omitempty"`
	BoolVal *bool `json:"Bool,omitempty"`
	Unit string
```

**关联方法**（1 个）：`String`

### NodeDeviceLocality

**定义位置**：[L294](file:///d:/claude/nomad/api/resources.go#L294)

**类型**：struct

```go
	PciBusID string
```

### RequestedDevice

**定义位置**：[L300](file:///d:/claude/nomad/api/resources.go#L300)

**类型**：struct

```go
	Name string `hcl:",label"`
	Count *uint64 `hcl:"count,optional"`
	Constraints []*Constraint `hcl:"constraint,block"`
	Affinities []*Affinity `hcl:"affinity,block"`
```

**关联方法**（1 个）：`Canonicalize`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Canonicalize` | `r *Resources` | - | - | [L33](file:///d:/claude/nomad/api/resources.go#L33) |
| `DefaultResources` | - | - | `*Resources` | [L64](file:///d:/claude/nomad/api/resources.go#L64) |
| `MinResources` | - | - | `*Resources` | [L77](file:///d:/claude/nomad/api/resources.go#L77) |
| `Merge` | `r *Resources` | `other *Resources` | - | [L86](file:///d:/claude/nomad/api/resources.go#L86) |
| `Copy` | `n *NUMAResource` | - | `*NUMAResource` | [L125](file:///d:/claude/nomad/api/resources.go#L125) |
| `Canonicalize` | `n *NUMAResource` | - | - | [L135](file:///d:/claude/nomad/api/resources.go#L135) |
| `Megabits` | `n *NetworkResource` | - | `int` | [L190](file:///d:/claude/nomad/api/resources.go#L190) |
| `Canonicalize` | `n *NetworkResource` | - | - | [L197](file:///d:/claude/nomad/api/resources.go#L197) |
| `HasPorts` | `n *NetworkResource` | - | `bool` | [L202](file:///d:/claude/nomad/api/resources.go#L202) |
| `ID` | `r *NodeDeviceResource` | - | `string` | [L229](file:///d:/claude/nomad/api/resources.go#L229) |
| `String` | `a *Attribute` | - | `string` | [L269](file:///d:/claude/nomad/api/resources.go#L269) |
| `Canonicalize` | `d *RequestedDevice` | - | - | [L324](file:///d:/claude/nomad/api/resources.go#L324) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `slices` | 标准库 |
| `strconv` | 标准库 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [resources_test.go](file:///d:/claude/nomad/api/resources_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

