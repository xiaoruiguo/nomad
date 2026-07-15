# plugins.go 代码说明文档

> 文件路径：[client/allocrunner/cni/plugins.go](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go)
> 总行数：60 行
> 所属包：`cni`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### Generic

**定义位置**：[L7](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L7)

**中文说明**：Generic 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Generic struct {
	Type string `json:"type"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string `json:"type"`` | 类型 |

### Bridge

**定义位置**：[L13](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L13)

**中文说明**：Bridge 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Bridge struct {
	Type string `json:"type"`
	Bridgename string `json:"bridge"`
	IpMasq bool `json:"ipMasq"`
	IsGateway bool `json:"isGateway"`
	ForceAddress bool `json:"forceAddress"`
	HairpinMode bool `json:"hairpinMode"`
	Ipam IPAM `json:"ipam"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string `json:"type"`` | 类型 |
| `Bridgename` | `string `json:"bridge"`` | 字符串 |
| `IpMasq` | `bool `json:"ipMasq"`` | 布尔值 |
| `IsGateway` | `bool `json:"isGateway"`` | 布尔值 |
| `ForceAddress` | `bool `json:"forceAddress"`` | 布尔值 |
| `HairpinMode` | `bool `json:"hairpinMode"`` | 布尔值 |
| `Ipam` | `IPAM `json:"ipam"`` | — |

### IPAM

**定义位置**：[L22](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L22)

**中文说明**：IPAM 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type IPAM struct {
	Type string `json:"type"`
	Ranges [][]Range `json:"ranges"`
	Routes []Route `json:"routes"`
	DataDir string `json:"dataDir"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string `json:"type"`` | 类型 |
| `Ranges` | `[][]Range `json:"ranges"`` | 列表 |
| `Routes` | `[]Route `json:"routes"`` | 列表 |
| `DataDir` | `string `json:"dataDir"`` | 字符串 |

### Range

**定义位置**：[L28](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L28)

**中文说明**：Range 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Range struct {
	Subnet string `json:"subnet"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Subnet` | `string `json:"subnet"`` | 字符串 |

### Route

**定义位置**：[L31](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L31)

**中文说明**：Route 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Route struct {
	Dst string `json:"dst"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Dst` | `string `json:"dst"`` | 字符串 |

### Firewall

**定义位置**：[L37](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L37)

**中文说明**：Firewall 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Firewall struct {
	Type string `json:"type"`
	Backend string `json:"backend"`
	AdminChainName string `json:"iptablesAdminChainName"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string `json:"type"`` | 类型 |
| `Backend` | `string `json:"backend"`` | 字符串 |
| `AdminChainName` | `string `json:"iptablesAdminChainName"`` | 字符串 |

### Portmap

**定义位置**：[L45](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L45)

**中文说明**：Portmap 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Portmap struct {
	Type string `json:"type"`
	Capabilities PortmapCapabilities `json:"capabilities"`
	Snat bool `json:"snat"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string `json:"type"`` | 类型 |
| `Capabilities` | `PortmapCapabilities `json:"capabilities"`` | — |
| `Snat` | `bool `json:"snat"`` | 布尔值 |

### PortmapCapabilities

**定义位置**：[L50](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L50)

**中文说明**：PortmapCapabilities 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type PortmapCapabilities struct {
	Portmappings bool `json:"portMappings"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Portmappings` | `bool `json:"portMappings"`` | 布尔值 |

### ConsulCNI

**定义位置**：[L56](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L56)

**中文说明**：ConsulCNI 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulCNI struct {
	Type string `json:"type"`
	LogLevel string `json:"log_level"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string `json:"type"`` | 类型 |
| `LogLevel` | `string `json:"log_level"`` | 字符串 |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

该文件未定义方法。

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

该文件无导入包。

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [bridge.go](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go) | 同目录源文件 |

