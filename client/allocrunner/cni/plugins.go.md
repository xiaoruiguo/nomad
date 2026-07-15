# plugins.go 代码说明文档

> 文件路径：[allocrunner/cni/plugins.go](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go)
> 总行数：60 行
> 所属包：`cni`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CNI 网络子包**（`client/allocrunner/cni`），实现 CNI（容器网络接口）插件调用，为分配配置网络命名空间。

## 2. 类型定义

### Generic

**定义位置**：[L7](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L7)

**类型**：struct

```go
	Type string `json:"type"`
```

### Bridge

**定义位置**：[L13](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L13)

**类型**：struct

```go
	Type string `json:"type"`
	Bridgename string `json:"bridge"`
	IpMasq bool `json:"ipMasq"`
	IsGateway bool `json:"isGateway"`
	ForceAddress bool `json:"forceAddress"`
	HairpinMode bool `json:"hairpinMode"`
	Ipam IPAM `json:"ipam"`
```

### IPAM

**定义位置**：[L22](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L22)

**类型**：struct

```go
	Type string `json:"type"`
	Ranges [][]Range `json:"ranges"`
	Routes []Route `json:"routes"`
	DataDir string `json:"dataDir"`
```

### Range

**定义位置**：[L28](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L28)

**类型**：struct

```go
	Subnet string `json:"subnet"`
```

### Route

**定义位置**：[L31](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L31)

**类型**：struct

```go
	Dst string `json:"dst"`
```

### Firewall

**定义位置**：[L37](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L37)

**类型**：struct

```go
	Type string `json:"type"`
	Backend string `json:"backend"`
	AdminChainName string `json:"iptablesAdminChainName"`
```

### Portmap

**定义位置**：[L45](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L45)

**类型**：struct

```go
	Type string `json:"type"`
	Capabilities PortmapCapabilities `json:"capabilities"`
	Snat bool `json:"snat"`
```

### PortmapCapabilities

**定义位置**：[L50](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L50)

**类型**：struct

```go
	Portmappings bool `json:"portMappings"`
```

### ConsulCNI

**定义位置**：[L56](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go#L56)

**类型**：struct

```go
	Type string `json:"type"`
	LogLevel string `json:"log_level"`
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

该文件未定义方法。

## 5. 核心方法详解

## 6. 依赖关系

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|

