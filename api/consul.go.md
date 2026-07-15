# consul.go 代码说明文档

> 文件路径：[consul.go](file:///d:/claude/nomad/api/consul.go)
> 总行数：837 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **Consul 集成 API 客户端**，提供 Consul 相关配置和查询的客户端方法。

## 2. 类型定义

### Consul

**定义位置**：[L13](file:///d:/claude/nomad/api/consul.go#L13)

**类型**：struct

```go
	Namespace string `mapstructure:"namespace" hcl:"namespace,optional"`
	Cluster string `mapstructure:"cluster" hcl:"cluster,optional"`
	Partition string `mapstructure:"partition" hcl:"partition,optional"`
```

**关联方法**（3 个）：`Canonicalize`, `Copy`, `MergeNamespace`

### ConsulConnect

**定义位置**：[L61](file:///d:/claude/nomad/api/consul.go#L61)

**类型**：struct

```go
	Native bool `hcl:"native,optional"`
	Gateway *ConsulGateway `hcl:"gateway,block"`
	SidecarService *ConsulSidecarService `mapstructure:"sidecar_service" hcl:"sidecar_service,block"`
	SidecarTask *SidecarTask `mapstructure:"sidecar_task" hcl:"sidecar_task,block"`
```

**关联方法**（1 个）：`Canonicalize`

### ConsulSidecarService

**定义位置**：[L80](file:///d:/claude/nomad/api/consul.go#L80)

**类型**：struct

```go
	Tags []string `hcl:"tags,optional"`
	Port string `hcl:"port,optional"`
	Proxy *ConsulProxy `hcl:"proxy,block"`
	DisableDefaultTCPCheck bool `mapstructure:"disable_default_tcp_check" hcl:"disable_default_tcp_check,optional"`
	Meta map[string]string `hcl:"meta,block"`
```

**关联方法**（1 个）：`Canonicalize`

### SidecarTask

**定义位置**：[L106](file:///d:/claude/nomad/api/consul.go#L106)

**类型**：struct

```go
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
```

**关联方法**（1 个）：`Canonicalize`

### ConsulProxy

**定义位置**：[L165](file:///d:/claude/nomad/api/consul.go#L165)

**类型**：struct

```go
	LocalServiceAddress string `mapstructure:"local_service_address" hcl:"local_service_address,optional"`
	LocalServicePort int `mapstructure:"local_service_port" hcl:"local_service_port,optional"`
	Expose *ConsulExposeConfig `mapstructure:"expose" hcl:"expose,block"`
	ExposeConfig *ConsulExposeConfig
	Upstreams []*ConsulUpstream `hcl:"upstreams,block"`
	TransparentProxy *ConsulTransparentProxy `mapstructure:"transparent_proxy" hcl:"transparent_proxy,block"`
	Config map[string]interface{} `hcl:"config,block"`
```

**关联方法**（1 个）：`Canonicalize`

### ConsulMeshGateway

**定义位置**：[L203](file:///d:/claude/nomad/api/consul.go#L203)

**类型**：struct

```go
	Mode string `mapstructure:"mode" hcl:"mode,optional"`
```

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulUpstream

**定义位置**：[L236](file:///d:/claude/nomad/api/consul.go#L236)

**类型**：struct

```go
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
```

**关联方法**（2 个）：`Copy`, `Canonicalize`

### ConsulTransparentProxy

**定义位置**：[L275](file:///d:/claude/nomad/api/consul.go#L275)

**类型**：struct

```go
	UID string `mapstructure:"uid" hcl:"uid,optional"`
	OutboundPort uint16 `mapstructure:"outbound_port" hcl:"outbound_port,optional"`
	ExcludeInboundPorts []string `mapstructure:"exclude_inbound_ports" hcl:"exclude_inbound_ports,optional"`
	ExcludeOutboundPorts []uint16 `mapstructure:"exclude_outbound_ports" hcl:"exclude_outbound_ports,optional"`
	ExcludeOutboundCIDRs []string `mapstructure:"exclude_outbound_cidrs" hcl:"exclude_outbound_cidrs,optional"`
	ExcludeUIDs []string `mapstructure:"exclude_uids" hcl:"exclude_uids,optional"`
	NoDNS bool `mapstructure:"no_dns" hcl:"no_dns,optional"`
```

**关联方法**（1 个）：`Canonicalize`

### ConsulExposeConfig

**定义位置**：[L327](file:///d:/claude/nomad/api/consul.go#L327)

**类型**：struct

```go
	Paths []*ConsulExposePath `mapstructure:"path" hcl:"path,block"`
	Path []*ConsulExposePath
```

**关联方法**（1 个）：`Canonicalize`

### ConsulExposePath

**定义位置**：[L346](file:///d:/claude/nomad/api/consul.go#L346)

**类型**：struct

```go
	Path string `hcl:"path,optional"`
	Protocol string `hcl:"protocol,optional"`
	LocalPathPort int `mapstructure:"local_path_port" hcl:"local_path_port,optional"`
	ListenerPort string `mapstructure:"listener_port" hcl:"listener_port,optional"`
```

### ConsulGateway

**定义位置**：[L354](file:///d:/claude/nomad/api/consul.go#L354)

**类型**：struct

```go
	Proxy *ConsulGatewayProxy `hcl:"proxy,block"`
	Ingress *ConsulIngressConfigEntry `hcl:"ingress,block"`
	Terminating *ConsulTerminatingConfigEntry `hcl:"terminating,block"`
	Mesh *ConsulMeshConfigEntry `hcl:"mesh,block"`
```

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulGatewayBindAddress

**定义位置**：[L389](file:///d:/claude/nomad/api/consul.go#L389)

**类型**：struct

```go
	Name string `hcl:",label"`
	Address string `mapstructure:"address" hcl:"address,optional"`
	Port int `mapstructure:"port" hcl:"port,optional"`
```

### ConsulGatewayProxy

**定义位置**：[L405](file:///d:/claude/nomad/api/consul.go#L405)

**类型**：struct

```go
	ConnectTimeout *time.Duration `mapstructure:"connect_timeout" hcl:"connect_timeout,optional"`
	EnvoyGatewayBindTaggedAddresses bool `mapstructure:"envoy_gateway_bind_tagged_addresses" hcl:"envoy_gateway_bind_tagged_addresses,optional"`
	EnvoyGatewayBindAddresses map[string]*ConsulGatewayBindAddress `mapstructure:"envoy_gateway_bind_addresses" hcl:"envoy_gateway_bind_addresses,block"`
	EnvoyGatewayNoDefaultBind bool `mapstructure:"envoy_gateway_no_default_bind" hcl:"envoy_gateway_no_default_bind,optional"`
	EnvoyDNSDiscoveryType string `mapstructure:"envoy_dns_discovery_type" hcl:"envoy_dns_discovery_type,optional"`
	Config map[string]interface{} `hcl:"config,block"`
```

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulGatewayTLSSDSConfig

**定义位置**：[L466](file:///d:/claude/nomad/api/consul.go#L466)

**类型**：struct

```go
	ClusterName string `hcl:"cluster_name,optional" mapstructure:"cluster_name"`
	CertResource string `hcl:"cert_resource,optional" mapstructure:"cert_resource"`
```

**关联方法**（1 个）：`Copy`

### ConsulGatewayTLSConfig

**定义位置**：[L490](file:///d:/claude/nomad/api/consul.go#L490)

**类型**：struct

```go
	Enabled bool `hcl:"enabled,optional"`
	TLSMinVersion string `hcl:"tls_min_version,optional" mapstructure:"tls_min_version"`
	TLSMaxVersion string `hcl:"tls_max_version,optional" mapstructure:"tls_max_version"`
	CipherSuites []string `hcl:"cipher_suites,optional" mapstructure:"cipher_suites"`
	SDS *ConsulGatewayTLSSDSConfig `hcl:"sds,block" mapstructure:"sds"`
```

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulHTTPHeaderModifiers

**定义位置**：[L539](file:///d:/claude/nomad/api/consul.go#L539)

**类型**：struct

```go
	Add map[string]string `hcl:"add,block" mapstructure:"add"`
	Set map[string]string `hcl:"set,block" mapstructure:"set"`
	Remove []string `hcl:"remove,optional" mapstructure:"remove"`
```

**关联方法**（2 个）：`Copy`, `Canonicalize`

### ConsulIngressService

**定义位置**：[L585](file:///d:/claude/nomad/api/consul.go#L585)

**类型**：struct

```go
	Name string `hcl:"name,optional"`
	Hosts []string `hcl:"hosts,optional"`
	TLS *ConsulGatewayTLSConfig `hcl:"tls,block" mapstructure:"tls"`
	RequestHeaders *ConsulHTTPHeaderModifiers `hcl:"request_headers,block" mapstructure:"request_headers"`
	ResponseHeaders *ConsulHTTPHeaderModifiers `hcl:"response_headers,block" mapstructure:"response_headers"`
	MaxConnections *uint32 `hcl:"max_connections,optional" mapstructure:"max_connections"`
	MaxPendingRequests *uint32 `hcl:"max_pending_requests,optional" mapstructure:"max_pending_requests"`
	MaxConcurrentRequests *uint32 `hcl:"max_concurrent_requests,optional" mapstructure:"max_concurrent_requests"`
```

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulIngressListener

**定义位置**：[L660](file:///d:/claude/nomad/api/consul.go#L660)

**类型**：struct

```go
	Port int `hcl:"port,optional"`
	Protocol string `hcl:"protocol,optional"`
	Services []*ConsulIngressService `hcl:"service,block"`
```

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulIngressConfigEntry

**定义位置**：[L705](file:///d:/claude/nomad/api/consul.go#L705)

**类型**：struct

```go
	TLS *ConsulGatewayTLSConfig `hcl:"tls,block"`
	Listeners []*ConsulIngressListener `hcl:"listener,block"`
```

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulLinkedService

**定义位置**：[L752](file:///d:/claude/nomad/api/consul.go#L752)

**类型**：struct

```go
	Name string `hcl:"name,optional"`
	CAFile string `hcl:"ca_file,optional" mapstructure:"ca_file"`
	CertFile string `hcl:"cert_file,optional" mapstructure:"cert_file"`
	KeyFile string `hcl:"key_file,optional" mapstructure:"key_file"`
	SNI string `hcl:"sni,optional"`
```

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulTerminatingConfigEntry

**定义位置**：[L782](file:///d:/claude/nomad/api/consul.go#L782)

**类型**：struct

```go
	Services []*ConsulLinkedService `hcl:"service,block"`
```

**关联方法**（2 个）：`Canonicalize`, `Copy`

### ConsulMeshConfigEntry

**定义位置**：[L825](file:///d:/claude/nomad/api/consul.go#L825)

**类型**：struct

**关联方法**（2 个）：`Canonicalize`, `Copy`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `defaultIngressListenerProtocol` | `"tcp"` |

### 变量

| 名称 | 值 |
|------|----|
| `defaultGatewayConnectTimeout` | `5 * time.Second` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Canonicalize` | `c *Consul` | - | - | [L27](file:///d:/claude/nomad/api/consul.go#L27) |
| `Copy` | `c *Consul` | - | `*Consul` | [L42](file:///d:/claude/nomad/api/consul.go#L42) |
| `MergeNamespace` | `c *Consul` | `namespace *string` | - | [L53](file:///d:/claude/nomad/api/consul.go#L53) |
| `Canonicalize` | `cc *ConsulConnect` | - | - | [L68](file:///d:/claude/nomad/api/consul.go#L68) |
| `Canonicalize` | `css *ConsulSidecarService` | - | - | [L88](file:///d:/claude/nomad/api/consul.go#L88) |
| `Canonicalize` | `st *SidecarTask` | - | - | [L122](file:///d:/claude/nomad/api/consul.go#L122) |
| `Canonicalize` | `cp *ConsulProxy` | - | - | [L179](file:///d:/claude/nomad/api/consul.go#L179) |
| `Canonicalize` | `c *ConsulMeshGateway` | - | - | [L220](file:///d:/claude/nomad/api/consul.go#L220) |
| `Copy` | `c *ConsulMeshGateway` | - | `*ConsulMeshGateway` | [L225](file:///d:/claude/nomad/api/consul.go#L225) |
| `Copy` | `cu *ConsulUpstream` | - | `*ConsulUpstream` | [L251](file:///d:/claude/nomad/api/consul.go#L251) |
| `Canonicalize` | `cu *ConsulUpstream` | - | - | [L262](file:///d:/claude/nomad/api/consul.go#L262) |
| `Canonicalize` | `tp *ConsulTransparentProxy` | - | - | [L309](file:///d:/claude/nomad/api/consul.go#L309) |
| `Canonicalize` | `cec *ConsulExposeConfig` | - | - | [L332](file:///d:/claude/nomad/api/consul.go#L332) |
| `Canonicalize` | `g *ConsulGateway` | - | - | [L368](file:///d:/claude/nomad/api/consul.go#L368) |
| `Copy` | `g *ConsulGateway` | - | `*ConsulGateway` | [L377](file:///d:/claude/nomad/api/consul.go#L377) |
| `Canonicalize` | `p *ConsulGatewayProxy` | - | - | [L414](file:///d:/claude/nomad/api/consul.go#L414) |
| `Copy` | `p *ConsulGatewayProxy` | - | `*ConsulGatewayProxy` | [L433](file:///d:/claude/nomad/api/consul.go#L433) |
| `Copy` | `c *ConsulGatewayTLSSDSConfig` | - | `*ConsulGatewayTLSSDSConfig` | [L475](file:///d:/claude/nomad/api/consul.go#L475) |
| `Canonicalize` | `tc *ConsulGatewayTLSConfig` | - | - | [L512](file:///d:/claude/nomad/api/consul.go#L512) |
| `Copy` | `tc *ConsulGatewayTLSConfig` | - | `*ConsulGatewayTLSConfig` | [L515](file:///d:/claude/nomad/api/consul.go#L515) |
| `Copy` | `h *ConsulHTTPHeaderModifiers` | - | `*ConsulHTTPHeaderModifiers` | [L554](file:///d:/claude/nomad/api/consul.go#L554) |
| `Canonicalize` | `h *ConsulHTTPHeaderModifiers` | - | - | [L566](file:///d:/claude/nomad/api/consul.go#L566) |
| `Canonicalize` | `s *ConsulIngressService` | - | - | [L621](file:///d:/claude/nomad/api/consul.go#L621) |
| `Copy` | `s *ConsulIngressService` | - | `*ConsulIngressService` | [L634](file:///d:/claude/nomad/api/consul.go#L634) |
| `Canonicalize` | `l *ConsulIngressListener` | - | - | [L666](file:///d:/claude/nomad/api/consul.go#L666) |
| `Copy` | `l *ConsulIngressListener` | - | `*ConsulIngressListener` | [L681](file:///d:/claude/nomad/api/consul.go#L681) |
| `Canonicalize` | `e *ConsulIngressConfigEntry` | - | - | [L717](file:///d:/claude/nomad/api/consul.go#L717) |
| `Copy` | `e *ConsulIngressConfigEntry` | - | `*ConsulIngressConfigEntry` | [L733](file:///d:/claude/nomad/api/consul.go#L733) |
| `Canonicalize` | `s *ConsulLinkedService` | - | - | [L760](file:///d:/claude/nomad/api/consul.go#L760) |
| `Copy` | `s *ConsulLinkedService` | - | `*ConsulLinkedService` | [L764](file:///d:/claude/nomad/api/consul.go#L764) |
| `Canonicalize` | `e *ConsulTerminatingConfigEntry` | - | - | [L789](file:///d:/claude/nomad/api/consul.go#L789) |
| `Copy` | `e *ConsulTerminatingConfigEntry` | - | `*ConsulTerminatingConfigEntry` | [L803](file:///d:/claude/nomad/api/consul.go#L803) |
| `Canonicalize` | `e *ConsulMeshConfigEntry` | - | - | [L829](file:///d:/claude/nomad/api/consul.go#L829) |
| `Copy` | `e *ConsulMeshConfigEntry` | - | `*ConsulMeshConfigEntry` | [L831](file:///d:/claude/nomad/api/consul.go#L831) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `maps` | 标准库 |
| `slices` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [consul_test.go](file:///d:/claude/nomad/api/consul_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

