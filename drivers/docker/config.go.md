# config.go 代码说明文档

> 文件路径：[drivers/docker/config.go](file:///d:/claude/nomad/drivers/docker/config.go)
> 总行数：844 行
> 所属包：`docker`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Docker 驱动子包**（`drivers/docker`），实现 Nomad 的 Docker 任务驱动，通过 Docker API 管理容器的生命周期（创建、启动、停止、销毁）、资源限制、网络配置和日志收集。支持 Docker API 版本协商、认证、健康检查和统计信息收集。

## 2. 类型定义

### TaskConfig

**定义位置**：[L455](file:///d:/claude/nomad/drivers/docker/config.go#L455)

**中文说明**：TaskConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type TaskConfig struct {
	Image string `codec:"image"`
	AdvertiseIPv6Addr bool `codec:"advertise_ipv6_address"`
	Args []string `codec:"args"`
	Auth DockerAuth `codec:"auth"`
	AuthSoftFail bool `codec:"auth_soft_fail"`
	CapAdd []string `codec:"cap_add"`
	CapDrop []string `codec:"cap_drop"`
	CgroupnsMode string `codec:"cgroupns"`
	Command string `codec:"command"`
	ContainerExistsAttempts uint64 `codec:"container_exists_attempts"`
	CPUCFSPeriod int64 `codec:"cpu_cfs_period"`
	CPUHardLimit bool `codec:"cpu_hard_limit"`
	CPUSetCPUs string `codec:"cpuset_cpus"`
	Devices []DockerDevice `codec:"devices"`
	DNSSearchDomains []string `codec:"dns_search_domains"`
	DNSOptions []string `codec:"dns_options"`
	DNSServers []string `codec:"dns_servers"`
	Entrypoint []string `codec:"entrypoint"`
	ExtraHosts []string `codec:"extra_hosts"`
	ForcePull bool `codec:"force_pull"`
	GroupAdd []string `codec:"group_add"`
	Healthchecks DockerHealthchecks `codec:"healthchecks"`
	Hostname string `codec:"hostname"`
	Init bool `codec:"init"`
	Interactive bool `codec:"interactive"`
	IPCMode string `codec:"ipc_mode"`
	IPv4Address string `codec:"ipv4_address"`
	IPv6Address string `codec:"ipv6_address"`
	Isolation string `codec:"isolation"`
	Labels hclutils.MapStrStr `codec:"labels"`
	LoadImage string `codec:"load"`
	Logging DockerLogging `codec:"logging"`
	MacAddress string `codec:"mac_address"`
	MemoryHardLimit int64 `codec:"memory_hard_limit"`
	Mounts []DockerMount `codec:"mount"`
	NetworkAliases []string `codec:"network_aliases"`
	NetworkMode string `codec:"network_mode"`
	OOMScoreAdj int `codec:"oom_score_adj"`
	Runtime string `codec:"runtime"`
	PidsLimit int64 `codec:"pids_limit"`
	PidMode string `codec:"pid_mode"`
	Ports []string `codec:"ports"`
	PortMap hclutils.MapStrInt `codec:"port_map"`
	Privileged bool `codec:"privileged"`
	ImagePullTimeout string `codec:"image_pull_timeout"`
	ReadonlyRootfs bool `codec:"readonly_rootfs"`
	SecurityOpt []string `codec:"security_opt"`
	ShmSize int64 `codec:"shm_size"`
	StorageOpt map[string]string `codec:"storage_opt"`
	Sysctl hclutils.MapStrStr `codec:"sysctl"`
	TTY bool `codec:"tty"`
	Ulimit hclutils.MapStrStr `codec:"ulimit"`
	UTSMode string `codec:"uts_mode"`
	UsernsMode string `codec:"userns_mode"`
	Volumes []string `codec:"volumes"`
	VolumeDriver string `codec:"volume_driver"`
	WorkDir string `codec:"work_dir"`
	MountsList []DockerMount `codec:"mounts"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Image` | `string `codec:"image"`` | 字符串 |
| `AdvertiseIPv6Addr` | `bool `codec:"advertise_ipv6_address"`` | 布尔值 |
| `Args` | `[]string `codec:"args"`` | 参数 |
| `Auth` | `DockerAuth `codec:"auth"`` | — |
| `AuthSoftFail` | `bool `codec:"auth_soft_fail"`` | 布尔值 |
| `CapAdd` | `[]string `codec:"cap_add"`` | 列表 |
| `CapDrop` | `[]string `codec:"cap_drop"`` | 列表 |
| `CgroupnsMode` | `string `codec:"cgroupns"`` | 字符串 |
| `Command` | `string `codec:"command"`` | 字符串 |
| `ContainerExistsAttempts` | `uint64 `codec:"container_exists_attempts"`` | 无符号 64 位整数 |
| `CPUCFSPeriod` | `int64 `codec:"cpu_cfs_period"`` | — |
| `CPUHardLimit` | `bool `codec:"cpu_hard_limit"`` | 布尔值 |
| `CPUSetCPUs` | `string `codec:"cpuset_cpus"`` | 字符串 |
| `Devices` | `[]DockerDevice `codec:"devices"`` | 列表 |
| `DNSSearchDomains` | `[]string `codec:"dns_search_domains"`` | 列表 |
| `DNSOptions` | `[]string `codec:"dns_options"`` | 列表 |
| `DNSServers` | `[]string `codec:"dns_servers"`` | 列表 |
| `Entrypoint` | `[]string `codec:"entrypoint"`` | 列表 |
| `ExtraHosts` | `[]string `codec:"extra_hosts"`` | 列表 |
| `ForcePull` | `bool `codec:"force_pull"`` | 布尔值 |
| `GroupAdd` | `[]string `codec:"group_add"`` | 列表 |
| `Healthchecks` | `DockerHealthchecks `codec:"healthchecks"`` | — |
| `Hostname` | `string `codec:"hostname"`` | 字符串 |
| `Init` | `bool `codec:"init"`` | 布尔值 |
| `Interactive` | `bool `codec:"interactive"`` | 布尔值 |
| `IPCMode` | `string `codec:"ipc_mode"`` | 字符串 |
| `IPv4Address` | `string `codec:"ipv4_address"`` | 字符串 |
| `IPv6Address` | `string `codec:"ipv6_address"`` | 字符串 |
| `Isolation` | `string `codec:"isolation"`` | 字符串 |
| `Labels` | `hclutils.MapStrStr `codec:"labels"`` | 标签 |
| `LoadImage` | `string `codec:"load"`` | 字符串 |
| `Logging` | `DockerLogging `codec:"logging"`` | — |
| `MacAddress` | `string `codec:"mac_address"`` | 字符串 |
| `MemoryHardLimit` | `int64 `codec:"memory_hard_limit"`` | — |
| `Mounts` | `[]DockerMount `codec:"mount"`` | 列表 |
| `NetworkAliases` | `[]string `codec:"network_aliases"`` | 列表 |
| `NetworkMode` | `string `codec:"network_mode"`` | 字符串 |
| `OOMScoreAdj` | `int `codec:"oom_score_adj"`` | — |
| `Runtime` | `string `codec:"runtime"`` | 字符串 |
| `PidsLimit` | `int64 `codec:"pids_limit"`` | — |
| `PidMode` | `string `codec:"pid_mode"`` | 字符串 |
| `Ports` | `[]string `codec:"ports"`` | 列表 |
| `PortMap` | `hclutils.MapStrInt `codec:"port_map"`` | — |
| `Privileged` | `bool `codec:"privileged"`` | 布尔值 |
| `ImagePullTimeout` | `string `codec:"image_pull_timeout"`` | 字符串 |
| `ReadonlyRootfs` | `bool `codec:"readonly_rootfs"`` | 布尔值 |
| `SecurityOpt` | `[]string `codec:"security_opt"`` | 列表 |
| `ShmSize` | `int64 `codec:"shm_size"`` | — |
| `StorageOpt` | `map[string]string `codec:"storage_opt"`` | 映射表 |
| `Sysctl` | `hclutils.MapStrStr `codec:"sysctl"`` | — |
| `TTY` | `bool `codec:"tty"`` | 布尔值 |
| `Ulimit` | `hclutils.MapStrStr `codec:"ulimit"`` | — |
| `UTSMode` | `string `codec:"uts_mode"`` | 字符串 |
| `UsernsMode` | `string `codec:"userns_mode"`` | 字符串 |
| `Volumes` | `[]string `codec:"volumes"`` | 列表 |
| `VolumeDriver` | `string `codec:"volume_driver"`` | 字符串 |
| `WorkDir` | `string `codec:"work_dir"`` | 字符串 |
| `MountsList` | `[]DockerMount `codec:"mounts"`` | 列表 |

### DockerAuth

**定义位置**：[L518](file:///d:/claude/nomad/drivers/docker/config.go#L518)

**中文说明**：DockerAuth 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type DockerAuth struct {
	Username string `codec:"username"`
	Password string `codec:"password"`
	ServerAddr string `codec:"server_address"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Username` | `string `codec:"username"`` | 字符串 |
| `Password` | `string `codec:"password"`` | 字符串 |
| `ServerAddr` | `string `codec:"server_address"`` | 字符串 |

### DockerDevice

**定义位置**：[L524](file:///d:/claude/nomad/drivers/docker/config.go#L524)

**中文说明**：DockerDevice 与设备（Device）相关，管理硬件资源如 GPU/FPGA。

**类型**：struct

```go
type DockerDevice struct {
	HostPath string `codec:"host_path"`
	ContainerPath string `codec:"container_path"`
	CgroupPermissions string `codec:"cgroup_permissions"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `HostPath` | `string `codec:"host_path"`` | 字符串 |
| `ContainerPath` | `string `codec:"container_path"`` | 字符串 |
| `CgroupPermissions` | `string `codec:"cgroup_permissions"`` | 字符串 |

**关联方法**（1 个）：`toDockerDevice`

### DockerLogging

**定义位置**：[L557](file:///d:/claude/nomad/drivers/docker/config.go#L557)

**中文说明**：DockerLogging 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type DockerLogging struct {
	Type string `codec:"type"`
	Driver string `codec:"driver"`
	Config hclutils.MapStrStr `codec:"config"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string `codec:"type"`` | 类型 |
| `Driver` | `string `codec:"driver"`` | 字符串 |
| `Config` | `hclutils.MapStrStr `codec:"config"`` | 配置 |

### DockerHealthchecks

**定义位置**：[L563](file:///d:/claude/nomad/drivers/docker/config.go#L563)

**中文说明**：DockerHealthchecks 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type DockerHealthchecks struct {
	Disable bool `codec:"disable"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Disable` | `bool `codec:"disable"`` | 布尔值 |

**关联方法**（1 个）：`Disabled`

### DockerMount

**定义位置**：[L571](file:///d:/claude/nomad/drivers/docker/config.go#L571)

**中文说明**：DockerMount 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type DockerMount struct {
	Type string `codec:"type"`
	Target string `codec:"target"`
	Source string `codec:"source"`
	ReadOnly bool `codec:"readonly"`
	BindOptions DockerBindOptions `codec:"bind_options"`
	VolumeOptions DockerVolumeOptions `codec:"volume_options"`
	TmpfsOptions DockerTmpfsOptions `codec:"tmpfs_options"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string `codec:"type"`` | 类型 |
| `Target` | `string `codec:"target"`` | 字符串 |
| `Source` | `string `codec:"source"`` | 字符串 |
| `ReadOnly` | `bool `codec:"readonly"`` | 布尔值 |
| `BindOptions` | `DockerBindOptions `codec:"bind_options"`` | — |
| `VolumeOptions` | `DockerVolumeOptions `codec:"volume_options"`` | — |
| `TmpfsOptions` | `DockerTmpfsOptions `codec:"tmpfs_options"`` | — |

**关联方法**（1 个）：`toDockerHostMount`

### DockerVolumeOptions

**定义位置**：[L624](file:///d:/claude/nomad/drivers/docker/config.go#L624)

**中文说明**：DockerVolumeOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type DockerVolumeOptions struct {
	NoCopy bool `codec:"no_copy"`
	Labels hclutils.MapStrStr `codec:"labels"`
	DriverConfig DockerVolumeDriverConfig `codec:"driver_config"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NoCopy` | `bool `codec:"no_copy"`` | 布尔值 |
| `Labels` | `hclutils.MapStrStr `codec:"labels"`` | 标签 |
| `DriverConfig` | `DockerVolumeDriverConfig `codec:"driver_config"`` | — |

### DockerBindOptions

**定义位置**：[L630](file:///d:/claude/nomad/drivers/docker/config.go#L630)

**中文说明**：DockerBindOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type DockerBindOptions struct {
	Propagation string `codec:"propagation"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Propagation` | `string `codec:"propagation"`` | 字符串 |

### DockerTmpfsOptions

**定义位置**：[L634](file:///d:/claude/nomad/drivers/docker/config.go#L634)

**中文说明**：DockerTmpfsOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type DockerTmpfsOptions struct {
	SizeBytes int64 `codec:"size"`
	Mode int `codec:"mode"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SizeBytes` | `int64 `codec:"size"`` | — |
| `Mode` | `int `codec:"mode"`` | — |

### DockerVolumeDriverConfig

**定义位置**：[L640](file:///d:/claude/nomad/drivers/docker/config.go#L640)

**中文说明**：DockerVolumeDriverConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type DockerVolumeDriverConfig struct {
	Name string `codec:"name"`
	Options hclutils.MapStrStr `codec:"options"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `codec:"name"`` | 名称 |
| `Options` | `hclutils.MapStrStr `codec:"options"`` | 选项 |

### ContainerGCConfig

**定义位置**：[L647](file:///d:/claude/nomad/drivers/docker/config.go#L647)

**中文说明**：ContainerGCConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type ContainerGCConfig struct {
	Enabled bool `codec:"enabled"`
	DryRun bool `codec:"dry_run"`
	PeriodStr string `codec:"period"`
	period time.Duration `codec:"-"`
	CreationGraceStr string `codec:"creation_grace"`
	CreationGrace time.Duration `codec:"-"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Enabled` | `bool `codec:"enabled"`` | 是否启用 |
| `DryRun` | `bool `codec:"dry_run"`` | 布尔值 |
| `PeriodStr` | `string `codec:"period"`` | 字符串 |
| `period` | `time.Duration `codec:"-"`` | 时间间隔 |
| `CreationGraceStr` | `string `codec:"creation_grace"`` | 字符串 |
| `CreationGrace` | `time.Duration `codec:"-"`` | 时间间隔 |

### DriverConfig

**定义位置**：[L667](file:///d:/claude/nomad/drivers/docker/config.go#L667)

**中文说明**：DriverConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type DriverConfig struct {
	Endpoint string `codec:"endpoint"`
	Auth AuthConfig `codec:"auth"`
	TLS TLSConfig `codec:"tls"`
	GC GCConfig `codec:"gc"`
	Volumes VolumeConfig `codec:"volumes"`
	AllowPrivileged bool `codec:"allow_privileged"`
	AllowCaps []string `codec:"allow_caps"`
	GPURuntimeName string `codec:"nvidia_runtime"`
	InfraImage string `codec:"infra_image"`
	InfraImagePullTimeout string `codec:"infra_image_pull_timeout"`
	infraImagePullTimeoutDuration time.Duration `codec:"-"`
	ImagePullTimeout string `codec:"image_pull_timeout"`
	ContainerExistsAttempts uint64 `codec:"container_exists_attempts"`
	DisableLogCollection bool `codec:"disable_log_collection"`
	PullActivityTimeout string `codec:"pull_activity_timeout"`
	PidsLimit int64 `codec:"pids_limit"`
	pullActivityTimeoutDuration time.Duration `codec:"-"`
	OOMScoreAdj int `codec:"oom_score_adj"`
	WindowsAllowInsecureContainerAdmin bool `codec:"windows_allow_insecure_container_admin"`
	ExtraLabels []string `codec:"extra_labels"`
	Logging LoggingConfig `codec:"logging"`
	AllowRuntimesList []string `codec:"allow_runtimes"`
	allowRuntimes map[string]struct{...} `codec:"-"`
	disableCpusetManagement bool `codec:"-"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Endpoint` | `string `codec:"endpoint"`` | 字符串 |
| `Auth` | `AuthConfig `codec:"auth"`` | — |
| `TLS` | `TLSConfig `codec:"tls"`` | TLS 配置 |
| `GC` | `GCConfig `codec:"gc"`` | — |
| `Volumes` | `VolumeConfig `codec:"volumes"`` | — |
| `AllowPrivileged` | `bool `codec:"allow_privileged"`` | 布尔值 |
| `AllowCaps` | `[]string `codec:"allow_caps"`` | 列表 |
| `GPURuntimeName` | `string `codec:"nvidia_runtime"`` | 字符串 |
| `InfraImage` | `string `codec:"infra_image"`` | 字符串 |
| `InfraImagePullTimeout` | `string `codec:"infra_image_pull_timeout"`` | 字符串 |
| `infraImagePullTimeoutDuration` | `time.Duration `codec:"-"`` | 时间间隔 |
| `ImagePullTimeout` | `string `codec:"image_pull_timeout"`` | 字符串 |
| `ContainerExistsAttempts` | `uint64 `codec:"container_exists_attempts"`` | 无符号 64 位整数 |
| `DisableLogCollection` | `bool `codec:"disable_log_collection"`` | 布尔值 |
| `PullActivityTimeout` | `string `codec:"pull_activity_timeout"`` | 字符串 |
| `PidsLimit` | `int64 `codec:"pids_limit"`` | — |
| `pullActivityTimeoutDuration` | `time.Duration `codec:"-"`` | 时间间隔 |
| `OOMScoreAdj` | `int `codec:"oom_score_adj"`` | — |
| `WindowsAllowInsecureContainerAdmin` | `bool `codec:"windows_allow_insecure_container_admin"`` | 布尔值 |
| `ExtraLabels` | `[]string `codec:"extra_labels"`` | 列表 |
| `Logging` | `LoggingConfig `codec:"logging"`` | — |
| `AllowRuntimesList` | `[]string `codec:"allow_runtimes"`` | 列表 |
| `allowRuntimes` | `map[string]struct{...} `codec:"-"`` | 映射表 |
| `disableCpusetManagement` | `bool `codec:"-"`` | 布尔值 |

### AuthConfig

**定义位置**：[L698](file:///d:/claude/nomad/drivers/docker/config.go#L698)

**中文说明**：AuthConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type AuthConfig struct {
	Config string `codec:"config"`
	Helper string `codec:"helper"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Config` | `string `codec:"config"`` | 配置 |
| `Helper` | `string `codec:"helper"`` | 字符串 |

### TLSConfig

**定义位置**：[L703](file:///d:/claude/nomad/drivers/docker/config.go#L703)

**中文说明**：TLSConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type TLSConfig struct {
	Cert string `codec:"cert"`
	Key string `codec:"key"`
	CA string `codec:"ca"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Cert` | `string `codec:"cert"`` | 证书 |
| `Key` | `string `codec:"key"`` | 键 |
| `CA` | `string `codec:"ca"`` | 字符串 |

### GCConfig

**定义位置**：[L709](file:///d:/claude/nomad/drivers/docker/config.go#L709)

**中文说明**：GCConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type GCConfig struct {
	Image bool `codec:"image"`
	ImageDelay string `codec:"image_delay"`
	imageDelayDuration time.Duration `codec:"-"`
	Container bool `codec:"container"`
	DanglingContainers ContainerGCConfig `codec:"dangling_containers"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Image` | `bool `codec:"image"`` | 布尔值 |
| `ImageDelay` | `string `codec:"image_delay"`` | 字符串 |
| `imageDelayDuration` | `time.Duration `codec:"-"`` | 时间间隔 |
| `Container` | `bool `codec:"container"`` | 布尔值 |
| `DanglingContainers` | `ContainerGCConfig `codec:"dangling_containers"`` | — |

### VolumeConfig

**定义位置**：[L718](file:///d:/claude/nomad/drivers/docker/config.go#L718)

**中文说明**：VolumeConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type VolumeConfig struct {
	Enabled bool `codec:"enabled"`
	SelinuxLabel string `codec:"selinuxlabel"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Enabled` | `bool `codec:"enabled"`` | 是否启用 |
| `SelinuxLabel` | `string `codec:"selinuxlabel"`` | 字符串 |

### LoggingConfig

**定义位置**：[L723](file:///d:/claude/nomad/drivers/docker/config.go#L723)

**中文说明**：LoggingConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type LoggingConfig struct {
	Type string `codec:"type"`
	Config map[string]string `codec:"config"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string `codec:"type"`` | 类型 |
| `Config` | `map[string]string `codec:"config"`` | 配置 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `NoSuchContainerError` | `—` | `"No such container"` | — |
| `ContainerNotRunningError` | `—` | `"is not running"` | — |
| `pluginName` | `—` | `"docker"` | — |
| `fingerprintPeriod` | `—` | `30 * time.Second` | — |
| `dockerTimeout` | `—` | `5 * time.Minute` | — |
| `dockerAuthHelperPrefix` | `—` | `"docker-credential-"` | — |
| `danglingContainersCreationGraceMinimum` | `—` | `1 * time.Minute` | — |
| `pullActivityTimeoutMinimum` | `—` | `1 * time.Minute` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `PluginID` | `—` | `loader.PluginID{...}` | — |
| `PluginConfig` | `—` | `&loader.InternalPluginConfig{...}` | — |
| `pluginInfo` | `—` | `&base.PluginInfoResponse{...}` | — |
| `danglingContainersBlock` | `—` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` | — |
| `configSpec` | `—` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` | — |
| `mountBodySpec` | `—` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` | — |
| `healthchecksBodySpec` | `—` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` | — |
| `taskConfigSpec` | `—` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` | — |
| `driverCapabilities` | `—` | `&drivers.Capabilities{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `PluginLoader` | - | `opts map[string]string` | `map[string]interface{}, error` | [L51](file:///d:/claude/nomad/drivers/docker/config.go#L51) |
| `toDockerDevice` | `d *DockerDevice` | `` | `containerapi.DeviceMapping, error` | [L530](file:///d:/claude/nomad/drivers/docker/config.go#L530) |
| `Disabled` | `dh *DockerHealthchecks` | `` | `bool` | [L567](file:///d:/claude/nomad/drivers/docker/config.go#L567) |
| `toDockerHostMount` | `m *DockerMount` | `` | `mount.Mount, error` | [L581](file:///d:/claude/nomad/drivers/docker/config.go#L581) |
| `PluginInfo` | `d *Driver` | `` | `*base.PluginInfoResponse, error` | [L728](file:///d:/claude/nomad/drivers/docker/config.go#L728) |
| `ConfigSchema` | `d *Driver` | `` | `*hclspec.Spec, error` | [L732](file:///d:/claude/nomad/drivers/docker/config.go#L732) |
| `SetConfig` | `d *Driver` | `c *base.Config` | `error` | [L739](file:///d:/claude/nomad/drivers/docker/config.go#L739) |
| `TaskConfigSchema` | `d *Driver` | `` | `*hclspec.Spec, error` | [L834](file:///d:/claude/nomad/drivers/docker/config.go#L834) |
| `Capabilities` | `d *Driver` | `` | `*drivers.Capabilities, error` | [L840](file:///d:/claude/nomad/drivers/docker/config.go#L840) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `io/fs` | 标准库 |
| `runtime` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/drivers/shared/capabilities` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/hclutils` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/loader` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/fsisolation` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/hclspec` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/moby/moby/api/types/container` | 第三方库 |
| `github.com/moby/moby/api/types/mount` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [config_test.go](file:///d:/claude/nomad/drivers/docker/config_test.go) | 对应测试文件 |
| [coordinator.go](file:///d:/claude/nomad/drivers/docker/coordinator.go) | 同目录源文件 |
| [cpuset.go](file:///d:/claude/nomad/drivers/docker/cpuset.go) | 同目录源文件 |
| [driver.go](file:///d:/claude/nomad/drivers/docker/driver.go) | 同目录源文件 |
| [driver_default.go](file:///d:/claude/nomad/drivers/docker/driver_default.go) | 同目录源文件 |
| [driver_windows.go](file:///d:/claude/nomad/drivers/docker/driver_windows.go) | 同目录源文件 |

