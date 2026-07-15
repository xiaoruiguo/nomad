# consul.go 代码说明文档

> 文件路径：[api/consul.go](file:///d:/claude/nomad/api/consul.go)
> 总行数：837 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `consul.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Consul

**定义位置**：[L13](file:///d:/claude/nomad/api/consul.go#L13)

**中文说明**：Consul 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type Consul struct {
	Namespace string `mapstructure:"namespace" hcl:"namespace,optional"`
	Cluster string `mapstructure:"cluster" hcl:"cluster,optional"`
	Partition string `mapstructure:"partition" hcl:"partition,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string `mapstructure:"namespace" hcl:"namespace,optional"`` | 命名空间 |
| `Cluster` | `string `mapstructure:"cluster" hcl:"cluster,optional"`` | 字符串 |
| `Partition` | `string `mapstructure:"partition" hcl:"partition,optional"`` | 字符串 |

**关联方法**（3 个）：`Canonicalize`, `Copy`, `MergeNamespace`

### ConsulConnect

**定义位置**：[L61](file:///d:/claude/nomad/api/consul.go#L61)

**中文说明**：ConsulConnect 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulConnect struct {
	Native bool `hcl:"native,optional"`
	Gateway *ConsulGateway `hcl:"gateway,block"`
	SidecarService *ConsulSidecarService `mapstructure:"sidecar_service" hcl:"sidecar_service,block"`
	SidecarTask *SidecarTask `mapstructure:"sidecar_task" hcl:"sidecar_task,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Native` | `bool `hcl:"native,optional"`` | 布尔值 |
| `Gateway` | `*ConsulGateway `hcl:"gateway,block"`` | — |
| `SidecarService` | `*ConsulSidecarService `mapstructure:"sidecar_service" hcl:"sidecar_service,block"`` | — |
| `SidecarTask` | `*SidecarTask `mapstructure:"sidecar_task" hcl:"sidecar_task,block"`` | — |

**关联方法**（1 个）：`Canonicalize`

### ConsulSidecarService

**定义位置**：[L80](file:///d:/claude/nomad/api/consul.go#L80)

**中文说明**：ConsulSidecarService 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulSidecarService struct {
	Tags []string `hcl:"tags,optional"`
	Port string `hcl:"port,optional"`
	Proxy *ConsulProxy `hcl:"proxy,block"`
	DisableDefaultTCPCheck bool `mapstructure:"disable_default_tcp_check" hcl:"disable_default_tcp_check,optional"`
	Meta map[string]string `hcl:"meta,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Tags` | `[]string `hcl:"tags,optional"`` | 标签 |
| `Port` | `string `hcl:"port,optional"`` | 端口 |
| `Proxy` | `*ConsulProxy `hcl:"proxy,block"`` | — |
| `DisableDefaultTCPCheck` | `bool `mapstructure:"disable_default_tcp_check" hcl:"disable_default_tcp_check,optional"`` | 布尔值 |
| `Meta` | `map[string]string `hcl:"meta,block"`` | 元数据 |

**关联方法**（1 个）：`Canonicalize`

### SidecarTask

**定义位置**：[L106](file:///d:/claude/nomad/api/consul.go#L106)

**中文说明**：SidecarTask 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type SidecarTask struct {
	Name string `hcl:"name,optional"`
	Driver string `hcl:"driver,optional"`
	User string `hcl:"user,optional"`
	Config map[string]interface{} `hcl:"config,block"`
	Env map[string]string `hcl:"env,block"`
	Resources *Resources `hcl:"resources,block"`
	Meta map[string]string `hcl:"meta,block"`
	KillTimeout *time.Duration `mapstructure:"kill_timeout" hcl:"kill_timeout,optional"`
	LogConfig *LogConfig `mapstructure:"logs" hcl:"logs,block"`
	ShutdownDelay *time.Duration `mapstructure:"shutdown_delay" hcl:"shutdown_delay,optional"`
	KillSignal string `mapstructure:"kill_signal" hcl:"kill_signal,optional"`
	VolumeMounts []*VolumeMount `hcl:"volume_mount,block"`
	Identities []*WorkloadIdentity `hcl:"identity,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:"name,optional"`` | 名称 |
| `Driver` | `string `hcl:"driver,optional"`` | 字符串 |
| `User` | `string `hcl:"user,optional"`` | 字符串 |
| `Config` | `map[string]interface{} `hcl:"config,block"`` | 配置 |
| `Env` | `map[string]string `hcl:"env,block"`` | 映射表 |
| `Resources` | `*Resources `hcl:"resources,block"`` | — |
| `Meta` | `map[string]string `hcl:"meta,block"`` | 元数据 |
| `KillTimeout` | `*time.Duration `mapstructure:"kill_timeout" hcl:"kill_timeout,optional"`` | 时间间隔 |
| `LogConfig` | `*LogConfig `mapstructure:"logs" hcl:"logs,block"`` | — |
| `ShutdownDelay` | `*time.Duration `mapstructure:"shutdown_delay" hcl:"shutdown_delay,optional"`` | 时间间隔 |
| `KillSignal` | `string `mapstructure:"kill_signal" hcl:"kill_signal,optional"`` | 字符串 |
| `VolumeMounts` | `[]*VolumeMount `hcl:"volume_mount,block"`` | 列表 |
| `Identities` | `[]*WorkloadIdentity `hcl:"identity,block"`` | 列表 |

**关联方法**（1 个）：`Canonicalize`

### ConsulProxy

**定义位置**：[L165](file:///d:/claude/nomad/api/consul.go#L165)

**中文说明**：ConsulProxy 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulProxy struct {
	LocalServiceAddress string `mapstructure:"local_service_address" hcl:"local_service_address,optional"`
	LocalServicePort int `mapstructure:"local_service_port" hcl:"local_service_port,optional"`
	Expose *ConsulExposeConfig `mapstructure:"expose" hcl:"expose,block"`
	ExposeConfig *ConsulExposeConfig
	Upstreams []*ConsulUpstream `hcl:"upstreams,block"`
	TransparentProxy *ConsulTransparentProxy `mapstructure:"transparent_proxy" hcl:"transparent_proxy,block"`
	Config map[string]interface{} `hcl:"config,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `LocalServiceAddress` | `string `mapstructure:"local_service_address" hcl:"local_service_address,optional"`` | 字符串 |
| `LocalServicePort` | `int `mapstructure:"local_service_port" hcl:"local_service_port,optional"`` | — |
| `Expose` | `*ConsulExposeConfig `mapstructure:"expose" hcl:"expose,block"`` | — |
| `ExposeConfig` | `*ConsulExposeConfig` | — |
| `Upstreams` | `[]*ConsulUpstream `hcl:"upstreams,block"`` | 列表 |
| `TransparentProxy` | `*ConsulTransparentProxy `mapstructure:"transparent_proxy" hcl:"transparent_proxy,block"`` | — |
| `Config` | `map[string]interface{} `hcl:"config,block"`` | 配置 |

**关联方法**（1 个）：`Canonicalize`

### ConsulMeshGateway

**定义位置**：[L203](file:///d:/claude/nomad/api/consul.go#L203)

**中文说明**：ConsulMeshGateway 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulMeshGateway struct {
	Mode string `mapstructure:"mode" hcl:"mode,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Mode` | `string `mapstructure:"mode" hcl:"mode,optional"`` | 字符串 |

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulUpstream

**定义位置**：[L236](file:///d:/claude/nomad/api/consul.go#L236)

**中文说明**：ConsulUpstream 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulUpstream struct {
	DestinationName string `mapstructure:"destination_name" hcl:"destination_name,optional"`
	DestinationNamespace string `mapstructure:"destination_namespace" hcl:"destination_namespace,optional"`
	DestinationPeer string `mapstructure:"destination_peer" hcl:"destination_peer,optional"`
	DestinationPartition string `mapstructure:"destination_partition" hcl:"destination_partition,optional"`
	DestinationType string `mapstructure:"destination_type" hcl:"destination_type,optional"`
	LocalBindPort int `mapstructure:"local_bind_port" hcl:"local_bind_port,optional"`
	Datacenter string `mapstructure:"datacenter" hcl:"datacenter,optional"`
	LocalBindAddress string `mapstructure:"local_bind_address" hcl:"local_bind_address,optional"`
	LocalBindSocketPath string `mapstructure:"local_bind_socket_path" hcl:"local_bind_socket_path,optional"`
	LocalBindSocketMode string `mapstructure:"local_bind_socket_mode" hcl:"local_bind_socket_mode,optional"`
	MeshGateway *ConsulMeshGateway `mapstructure:"mesh_gateway" hcl:"mesh_gateway,block"`
	Config map[string]any `mapstructure:"config" hcl:"config,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DestinationName` | `string `mapstructure:"destination_name" hcl:"destination_name,optional"`` | 字符串 |
| `DestinationNamespace` | `string `mapstructure:"destination_namespace" hcl:"destination_namespace,optional"`` | 字符串 |
| `DestinationPeer` | `string `mapstructure:"destination_peer" hcl:"destination_peer,optional"`` | 字符串 |
| `DestinationPartition` | `string `mapstructure:"destination_partition" hcl:"destination_partition,optional"`` | 字符串 |
| `DestinationType` | `string `mapstructure:"destination_type" hcl:"destination_type,optional"`` | 字符串 |
| `LocalBindPort` | `int `mapstructure:"local_bind_port" hcl:"local_bind_port,optional"`` | — |
| `Datacenter` | `string `mapstructure:"datacenter" hcl:"datacenter,optional"`` | 数据中心 |
| `LocalBindAddress` | `string `mapstructure:"local_bind_address" hcl:"local_bind_address,optional"`` | 字符串 |
| `LocalBindSocketPath` | `string `mapstructure:"local_bind_socket_path" hcl:"local_bind_socket_path,optional"`` | 字符串 |
| `LocalBindSocketMode` | `string `mapstructure:"local_bind_socket_mode" hcl:"local_bind_socket_mode,optional"`` | 字符串 |
| `MeshGateway` | `*ConsulMeshGateway `mapstructure:"mesh_gateway" hcl:"mesh_gateway,block"`` | — |
| `Config` | `map[string]any `mapstructure:"config" hcl:"config,block"`` | 配置 |

**关联方法**（2 个）：`Copy`, `Canonicalize`

### ConsulTransparentProxy

**定义位置**：[L275](file:///d:/claude/nomad/api/consul.go#L275)

**中文说明**：ConsulTransparentProxy 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulTransparentProxy struct {
	UID string `mapstructure:"uid" hcl:"uid,optional"`
	OutboundPort uint16 `mapstructure:"outbound_port" hcl:"outbound_port,optional"`
	ExcludeInboundPorts []string `mapstructure:"exclude_inbound_ports" hcl:"exclude_inbound_ports,optional"`
	ExcludeOutboundPorts []uint16 `mapstructure:"exclude_outbound_ports" hcl:"exclude_outbound_ports,optional"`
	ExcludeOutboundCIDRs []string `mapstructure:"exclude_outbound_cidrs" hcl:"exclude_outbound_cidrs,optional"`
	ExcludeUIDs []string `mapstructure:"exclude_uids" hcl:"exclude_uids,optional"`
	NoDNS bool `mapstructure:"no_dns" hcl:"no_dns,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `UID` | `string `mapstructure:"uid" hcl:"uid,optional"`` | 字符串 |
| `OutboundPort` | `uint16 `mapstructure:"outbound_port" hcl:"outbound_port,optional"`` | — |
| `ExcludeInboundPorts` | `[]string `mapstructure:"exclude_inbound_ports" hcl:"exclude_inbound_ports,optional"`` | 列表 |
| `ExcludeOutboundPorts` | `[]uint16 `mapstructure:"exclude_outbound_ports" hcl:"exclude_outbound_ports,optional"`` | 列表 |
| `ExcludeOutboundCIDRs` | `[]string `mapstructure:"exclude_outbound_cidrs" hcl:"exclude_outbound_cidrs,optional"`` | 列表 |
| `ExcludeUIDs` | `[]string `mapstructure:"exclude_uids" hcl:"exclude_uids,optional"`` | 列表 |
| `NoDNS` | `bool `mapstructure:"no_dns" hcl:"no_dns,optional"`` | 布尔值 |

**关联方法**（1 个）：`Canonicalize`

### ConsulExposeConfig

**定义位置**：[L327](file:///d:/claude/nomad/api/consul.go#L327)

**中文说明**：ConsulExposeConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type ConsulExposeConfig struct {
	Paths []*ConsulExposePath `mapstructure:"path" hcl:"path,block"`
	Path []*ConsulExposePath
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Paths` | `[]*ConsulExposePath `mapstructure:"path" hcl:"path,block"`` | 列表 |
| `Path` | `[]*ConsulExposePath` | 路径 |

**关联方法**（1 个）：`Canonicalize`

### ConsulExposePath

**定义位置**：[L346](file:///d:/claude/nomad/api/consul.go#L346)

**中文说明**：ConsulExposePath 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulExposePath struct {
	Path string `hcl:"path,optional"`
	Protocol string `hcl:"protocol,optional"`
	LocalPathPort int `mapstructure:"local_path_port" hcl:"local_path_port,optional"`
	ListenerPort string `mapstructure:"listener_port" hcl:"listener_port,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Path` | `string `hcl:"path,optional"`` | 路径 |
| `Protocol` | `string `hcl:"protocol,optional"`` | 字符串 |
| `LocalPathPort` | `int `mapstructure:"local_path_port" hcl:"local_path_port,optional"`` | — |
| `ListenerPort` | `string `mapstructure:"listener_port" hcl:"listener_port,optional"`` | 字符串 |

### ConsulGateway

**定义位置**：[L354](file:///d:/claude/nomad/api/consul.go#L354)

**中文说明**：ConsulGateway 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulGateway struct {
	Proxy *ConsulGatewayProxy `hcl:"proxy,block"`
	Ingress *ConsulIngressConfigEntry `hcl:"ingress,block"`
	Terminating *ConsulTerminatingConfigEntry `hcl:"terminating,block"`
	Mesh *ConsulMeshConfigEntry `hcl:"mesh,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Proxy` | `*ConsulGatewayProxy `hcl:"proxy,block"`` | — |
| `Ingress` | `*ConsulIngressConfigEntry `hcl:"ingress,block"`` | — |
| `Terminating` | `*ConsulTerminatingConfigEntry `hcl:"terminating,block"`` | — |
| `Mesh` | `*ConsulMeshConfigEntry `hcl:"mesh,block"`` | — |

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulGatewayBindAddress

**定义位置**：[L389](file:///d:/claude/nomad/api/consul.go#L389)

**中文说明**：ConsulGatewayBindAddress 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulGatewayBindAddress struct {
	Name string `hcl:",label"`
	Address string `mapstructure:"address" hcl:"address,optional"`
	Port int `mapstructure:"port" hcl:"port,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:",label"`` | 名称 |
| `Address` | `string `mapstructure:"address" hcl:"address,optional"`` | 地址 |
| `Port` | `int `mapstructure:"port" hcl:"port,optional"`` | 端口 |

### ConsulGatewayProxy

**定义位置**：[L405](file:///d:/claude/nomad/api/consul.go#L405)

**中文说明**：ConsulGatewayProxy 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulGatewayProxy struct {
	ConnectTimeout *time.Duration `mapstructure:"connect_timeout" hcl:"connect_timeout,optional"`
	EnvoyGatewayBindTaggedAddresses bool `mapstructure:"envoy_gateway_bind_tagged_addresses" hcl:"envoy_gateway_bind_tagged_addresses,optional"`
	EnvoyGatewayBindAddresses map[string]*ConsulGatewayBindAddress `mapstructure:"envoy_gateway_bind_addresses" hcl:"envoy_gateway_bind_addresses,block"`
	EnvoyGatewayNoDefaultBind bool `mapstructure:"envoy_gateway_no_default_bind" hcl:"envoy_gateway_no_default_bind,optional"`
	EnvoyDNSDiscoveryType string `mapstructure:"envoy_dns_discovery_type" hcl:"envoy_dns_discovery_type,optional"`
	Config map[string]interface{} `hcl:"config,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ConnectTimeout` | `*time.Duration `mapstructure:"connect_timeout" hcl:"connect_timeout,optional"`` | 时间间隔 |
| `EnvoyGatewayBindTaggedAddresses` | `bool `mapstructure:"envoy_gateway_bind_tagged_addresses" hcl:"envoy_gateway_bind_tagged_addresses,optional"`` | 布尔值 |
| `EnvoyGatewayBindAddresses` | `map[string]*ConsulGatewayBindAddress `mapstructure:"envoy_gateway_bind_addresses" hcl:"envoy_gateway_bind_addresses,block"`` | 映射表 |
| `EnvoyGatewayNoDefaultBind` | `bool `mapstructure:"envoy_gateway_no_default_bind" hcl:"envoy_gateway_no_default_bind,optional"`` | 布尔值 |
| `EnvoyDNSDiscoveryType` | `string `mapstructure:"envoy_dns_discovery_type" hcl:"envoy_dns_discovery_type,optional"`` | 字符串 |
| `Config` | `map[string]interface{} `hcl:"config,block"`` | 配置 |

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulGatewayTLSSDSConfig

**定义位置**：[L466](file:///d:/claude/nomad/api/consul.go#L466)

**中文说明**：ConsulGatewayTLSSDSConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type ConsulGatewayTLSSDSConfig struct {
	ClusterName string `hcl:"cluster_name,optional" mapstructure:"cluster_name"`
	CertResource string `hcl:"cert_resource,optional" mapstructure:"cert_resource"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ClusterName` | `string `hcl:"cluster_name,optional" mapstructure:"cluster_name"`` | 字符串 |
| `CertResource` | `string `hcl:"cert_resource,optional" mapstructure:"cert_resource"`` | 字符串 |

**关联方法**（1 个）：`Copy`

### ConsulGatewayTLSConfig

**定义位置**：[L490](file:///d:/claude/nomad/api/consul.go#L490)

**中文说明**：ConsulGatewayTLSConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type ConsulGatewayTLSConfig struct {
	Enabled bool `hcl:"enabled,optional"`
	TLSMinVersion string `hcl:"tls_min_version,optional" mapstructure:"tls_min_version"`
	TLSMaxVersion string `hcl:"tls_max_version,optional" mapstructure:"tls_max_version"`
	CipherSuites []string `hcl:"cipher_suites,optional" mapstructure:"cipher_suites"`
	SDS *ConsulGatewayTLSSDSConfig `hcl:"sds,block" mapstructure:"sds"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Enabled` | `bool `hcl:"enabled,optional"`` | 是否启用 |
| `TLSMinVersion` | `string `hcl:"tls_min_version,optional" mapstructure:"tls_min_version"`` | 字符串 |
| `TLSMaxVersion` | `string `hcl:"tls_max_version,optional" mapstructure:"tls_max_version"`` | 字符串 |
| `CipherSuites` | `[]string `hcl:"cipher_suites,optional" mapstructure:"cipher_suites"`` | 列表 |
| `SDS` | `*ConsulGatewayTLSSDSConfig `hcl:"sds,block" mapstructure:"sds"`` | — |

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulHTTPHeaderModifiers

**定义位置**：[L539](file:///d:/claude/nomad/api/consul.go#L539)

**中文说明**：ConsulHTTPHeaderModifiers 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulHTTPHeaderModifiers struct {
	Add map[string]string `hcl:"add,block" mapstructure:"add"`
	Set map[string]string `hcl:"set,block" mapstructure:"set"`
	Remove []string `hcl:"remove,optional" mapstructure:"remove"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Add` | `map[string]string `hcl:"add,block" mapstructure:"add"`` | 映射表 |
| `Set` | `map[string]string `hcl:"set,block" mapstructure:"set"`` | 映射表 |
| `Remove` | `[]string `hcl:"remove,optional" mapstructure:"remove"`` | 列表 |

**关联方法**（2 个）：`Copy`, `Canonicalize`

### ConsulIngressService

**定义位置**：[L585](file:///d:/claude/nomad/api/consul.go#L585)

**中文说明**：ConsulIngressService 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulIngressService struct {
	Name string `hcl:"name,optional"`
	Hosts []string `hcl:"hosts,optional"`
	TLS *ConsulGatewayTLSConfig `hcl:"tls,block" mapstructure:"tls"`
	RequestHeaders *ConsulHTTPHeaderModifiers `hcl:"request_headers,block" mapstructure:"request_headers"`
	ResponseHeaders *ConsulHTTPHeaderModifiers `hcl:"response_headers,block" mapstructure:"response_headers"`
	MaxConnections *uint32 `hcl:"max_connections,optional" mapstructure:"max_connections"`
	MaxPendingRequests *uint32 `hcl:"max_pending_requests,optional" mapstructure:"max_pending_requests"`
	MaxConcurrentRequests *uint32 `hcl:"max_concurrent_requests,optional" mapstructure:"max_concurrent_requests"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:"name,optional"`` | 名称 |
| `Hosts` | `[]string `hcl:"hosts,optional"`` | 列表 |
| `TLS` | `*ConsulGatewayTLSConfig `hcl:"tls,block" mapstructure:"tls"`` | TLS 配置 |
| `RequestHeaders` | `*ConsulHTTPHeaderModifiers `hcl:"request_headers,block" mapstructure:"request_headers"`` | — |
| `ResponseHeaders` | `*ConsulHTTPHeaderModifiers `hcl:"response_headers,block" mapstructure:"response_headers"`` | — |
| `MaxConnections` | `*uint32 `hcl:"max_connections,optional" mapstructure:"max_connections"`` | — |
| `MaxPendingRequests` | `*uint32 `hcl:"max_pending_requests,optional" mapstructure:"max_pending_requests"`` | — |
| `MaxConcurrentRequests` | `*uint32 `hcl:"max_concurrent_requests,optional" mapstructure:"max_concurrent_requests"`` | — |

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulIngressListener

**定义位置**：[L660](file:///d:/claude/nomad/api/consul.go#L660)

**中文说明**：ConsulIngressListener 是一个监听器，监听网络连接或事件。

**类型**：struct

```go
type ConsulIngressListener struct {
	Port int `hcl:"port,optional"`
	Protocol string `hcl:"protocol,optional"`
	Services []*ConsulIngressService `hcl:"service,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Port` | `int `hcl:"port,optional"`` | 端口 |
| `Protocol` | `string `hcl:"protocol,optional"`` | 字符串 |
| `Services` | `[]*ConsulIngressService `hcl:"service,block"`` | 列表 |

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulIngressConfigEntry

**定义位置**：[L705](file:///d:/claude/nomad/api/consul.go#L705)

**中文说明**：ConsulIngressConfigEntry 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulIngressConfigEntry struct {
	TLS *ConsulGatewayTLSConfig `hcl:"tls,block"`
	Listeners []*ConsulIngressListener `hcl:"listener,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TLS` | `*ConsulGatewayTLSConfig `hcl:"tls,block"`` | TLS 配置 |
| `Listeners` | `[]*ConsulIngressListener `hcl:"listener,block"`` | 列表 |

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulLinkedService

**定义位置**：[L752](file:///d:/claude/nomad/api/consul.go#L752)

**中文说明**：ConsulLinkedService 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulLinkedService struct {
	Name string `hcl:"name,optional"`
	CAFile string `hcl:"ca_file,optional" mapstructure:"ca_file"`
	CertFile string `hcl:"cert_file,optional" mapstructure:"cert_file"`
	KeyFile string `hcl:"key_file,optional" mapstructure:"key_file"`
	SNI string `hcl:"sni,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:"name,optional"`` | 名称 |
| `CAFile` | `string `hcl:"ca_file,optional" mapstructure:"ca_file"`` | 字符串 |
| `CertFile` | `string `hcl:"cert_file,optional" mapstructure:"cert_file"`` | 字符串 |
| `KeyFile` | `string `hcl:"key_file,optional" mapstructure:"key_file"`` | 字符串 |
| `SNI` | `string `hcl:"sni,optional"`` | 字符串 |

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulTerminatingConfigEntry

**定义位置**：[L782](file:///d:/claude/nomad/api/consul.go#L782)

**中文说明**：ConsulTerminatingConfigEntry 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulTerminatingConfigEntry struct {
	Services []*ConsulLinkedService `hcl:"service,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Services` | `[]*ConsulLinkedService `hcl:"service,block"`` | 列表 |

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulMeshConfigEntry

**定义位置**：[L825](file:///d:/claude/nomad/api/consul.go#L825)

**中文说明**：ConsulMeshConfigEntry 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

**关联方法**（2 个）：`Canonicalize`, `Copy`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `defaultIngressListenerProtocol` | `—` | `"tcp"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `defaultGatewayConnectTimeout` | `—` | `5 * time.Second` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Canonicalize` | `c *Consul` | `` | `` | [L27](file:///d:/claude/nomad/api/consul.go#L27) |
| `Copy` | `c *Consul` | `` | `*Consul` | [L42](file:///d:/claude/nomad/api/consul.go#L42) |
| `MergeNamespace` | `c *Consul` | `namespace *string` | `` | [L53](file:///d:/claude/nomad/api/consul.go#L53) |
| `Canonicalize` | `cc *ConsulConnect` | `` | `` | [L68](file:///d:/claude/nomad/api/consul.go#L68) |
| `Canonicalize` | `css *ConsulSidecarService` | `` | `` | [L88](file:///d:/claude/nomad/api/consul.go#L88) |
| `Canonicalize` | `st *SidecarTask` | `` | `` | [L122](file:///d:/claude/nomad/api/consul.go#L122) |
| `Canonicalize` | `cp *ConsulProxy` | `` | `` | [L179](file:///d:/claude/nomad/api/consul.go#L179) |
| `Canonicalize` | `c *ConsulMeshGateway` | `` | `` | [L220](file:///d:/claude/nomad/api/consul.go#L220) |
| `Copy` | `c *ConsulMeshGateway` | `` | `*ConsulMeshGateway` | [L225](file:///d:/claude/nomad/api/consul.go#L225) |
| `Copy` | `cu *ConsulUpstream` | `` | `*ConsulUpstream` | [L251](file:///d:/claude/nomad/api/consul.go#L251) |
| `Canonicalize` | `cu *ConsulUpstream` | `` | `` | [L262](file:///d:/claude/nomad/api/consul.go#L262) |
| `Canonicalize` | `tp *ConsulTransparentProxy` | `` | `` | [L309](file:///d:/claude/nomad/api/consul.go#L309) |
| `Canonicalize` | `cec *ConsulExposeConfig` | `` | `` | [L332](file:///d:/claude/nomad/api/consul.go#L332) |
| `Canonicalize` | `g *ConsulGateway` | `` | `` | [L368](file:///d:/claude/nomad/api/consul.go#L368) |
| `Copy` | `g *ConsulGateway` | `` | `*ConsulGateway` | [L377](file:///d:/claude/nomad/api/consul.go#L377) |
| `Canonicalize` | `p *ConsulGatewayProxy` | `` | `` | [L414](file:///d:/claude/nomad/api/consul.go#L414) |
| `Copy` | `p *ConsulGatewayProxy` | `` | `*ConsulGatewayProxy` | [L433](file:///d:/claude/nomad/api/consul.go#L433) |
| `Copy` | `c *ConsulGatewayTLSSDSConfig` | `` | `*ConsulGatewayTLSSDSConfig` | [L475](file:///d:/claude/nomad/api/consul.go#L475) |
| `Canonicalize` | `tc *ConsulGatewayTLSConfig` | `` | `` | [L512](file:///d:/claude/nomad/api/consul.go#L512) |
| `Copy` | `tc *ConsulGatewayTLSConfig` | `` | `*ConsulGatewayTLSConfig` | [L515](file:///d:/claude/nomad/api/consul.go#L515) |
| `Copy` | `h *ConsulHTTPHeaderModifiers` | `` | `*ConsulHTTPHeaderModifiers` | [L554](file:///d:/claude/nomad/api/consul.go#L554) |
| `Canonicalize` | `h *ConsulHTTPHeaderModifiers` | `` | `` | [L566](file:///d:/claude/nomad/api/consul.go#L566) |
| `Canonicalize` | `s *ConsulIngressService` | `` | `` | [L621](file:///d:/claude/nomad/api/consul.go#L621) |
| `Copy` | `s *ConsulIngressService` | `` | `*ConsulIngressService` | [L634](file:///d:/claude/nomad/api/consul.go#L634) |
| `Canonicalize` | `l *ConsulIngressListener` | `` | `` | [L666](file:///d:/claude/nomad/api/consul.go#L666) |
| `Copy` | `l *ConsulIngressListener` | `` | `*ConsulIngressListener` | [L681](file:///d:/claude/nomad/api/consul.go#L681) |
| `Canonicalize` | `e *ConsulIngressConfigEntry` | `` | `` | [L717](file:///d:/claude/nomad/api/consul.go#L717) |
| `Copy` | `e *ConsulIngressConfigEntry` | `` | `*ConsulIngressConfigEntry` | [L733](file:///d:/claude/nomad/api/consul.go#L733) |
| `Canonicalize` | `s *ConsulLinkedService` | `` | `` | [L760](file:///d:/claude/nomad/api/consul.go#L760) |
| `Copy` | `s *ConsulLinkedService` | `` | `*ConsulLinkedService` | [L764](file:///d:/claude/nomad/api/consul.go#L764) |
| `Canonicalize` | `e *ConsulTerminatingConfigEntry` | `` | `` | [L789](file:///d:/claude/nomad/api/consul.go#L789) |
| `Copy` | `e *ConsulTerminatingConfigEntry` | `` | `*ConsulTerminatingConfigEntry` | [L803](file:///d:/claude/nomad/api/consul.go#L803) |
| `Canonicalize` | `e *ConsulMeshConfigEntry` | `` | `` | [L829](file:///d:/claude/nomad/api/consul.go#L829) |
| `Copy` | `e *ConsulMeshConfigEntry` | `` | `*ConsulMeshConfigEntry` | [L831](file:///d:/claude/nomad/api/consul.go#L831) |

## 5. 核心方法详解

### Copy()

**签名**：`func (c *Consul) Copy() *Consul`

**位置**：[L42](file:///d:/claude/nomad/api/consul.go#L42)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Consul` | — |

### Copy()

**签名**：`func (c *ConsulMeshGateway) Copy() *ConsulMeshGateway`

**位置**：[L225](file:///d:/claude/nomad/api/consul.go#L225)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ConsulMeshGateway` | — |

### Copy()

**签名**：`func (cu *ConsulUpstream) Copy() *ConsulUpstream`

**位置**：[L251](file:///d:/claude/nomad/api/consul.go#L251)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ConsulUpstream` | — |

### Copy()

**签名**：`func (g *ConsulGateway) Copy() *ConsulGateway`

**位置**：[L377](file:///d:/claude/nomad/api/consul.go#L377)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ConsulGateway` | — |

### Copy()

**签名**：`func (p *ConsulGatewayProxy) Copy() *ConsulGatewayProxy`

**位置**：[L433](file:///d:/claude/nomad/api/consul.go#L433)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ConsulGatewayProxy` | — |

### Copy()

**签名**：`func (c *ConsulGatewayTLSSDSConfig) Copy() *ConsulGatewayTLSSDSConfig`

**位置**：[L475](file:///d:/claude/nomad/api/consul.go#L475)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ConsulGatewayTLSSDSConfig` | — |

### Copy()

**签名**：`func (tc *ConsulGatewayTLSConfig) Copy() *ConsulGatewayTLSConfig`

**位置**：[L515](file:///d:/claude/nomad/api/consul.go#L515)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ConsulGatewayTLSConfig` | — |

### Copy()

**签名**：`func (h *ConsulHTTPHeaderModifiers) Copy() *ConsulHTTPHeaderModifiers`

**位置**：[L554](file:///d:/claude/nomad/api/consul.go#L554)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ConsulHTTPHeaderModifiers` | — |

### Copy()

**签名**：`func (s *ConsulIngressService) Copy() *ConsulIngressService`

**位置**：[L634](file:///d:/claude/nomad/api/consul.go#L634)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ConsulIngressService` | — |

### Copy()

**签名**：`func (l *ConsulIngressListener) Copy() *ConsulIngressListener`

**位置**：[L681](file:///d:/claude/nomad/api/consul.go#L681)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ConsulIngressListener` | — |

### Copy()

**签名**：`func (e *ConsulIngressConfigEntry) Copy() *ConsulIngressConfigEntry`

**位置**：[L733](file:///d:/claude/nomad/api/consul.go#L733)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ConsulIngressConfigEntry` | — |

### Copy()

**签名**：`func (s *ConsulLinkedService) Copy() *ConsulLinkedService`

**位置**：[L764](file:///d:/claude/nomad/api/consul.go#L764)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ConsulLinkedService` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `maps` | 标准库 |
| `slices` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [consul_test.go](file:///d:/claude/nomad/api/consul_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

