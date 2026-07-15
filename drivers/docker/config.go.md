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

**类型**：struct

```go
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
```

### DockerAuth

**定义位置**：[L518](file:///d:/claude/nomad/drivers/docker/config.go#L518)

**类型**：struct

```go
	Username string `codec:"username"`
	Password string `codec:"password"`
	ServerAddr string `codec:"server_address"`
```

### DockerDevice

**定义位置**：[L524](file:///d:/claude/nomad/drivers/docker/config.go#L524)

**类型**：struct

```go
	HostPath string `codec:"host_path"`
	ContainerPath string `codec:"container_path"`
	CgroupPermissions string `codec:"cgroup_permissions"`
```

**关联方法**（1 个）：`toDockerDevice`

### DockerLogging

**定义位置**：[L557](file:///d:/claude/nomad/drivers/docker/config.go#L557)

**类型**：struct

```go
	Type string `codec:"type"`
	Driver string `codec:"driver"`
	Config hclutils.MapStrStr `codec:"config"`
```

### DockerHealthchecks

**定义位置**：[L563](file:///d:/claude/nomad/drivers/docker/config.go#L563)

**类型**：struct

```go
	Disable bool `codec:"disable"`
```

**关联方法**（1 个）：`Disabled`

### DockerMount

**定义位置**：[L571](file:///d:/claude/nomad/drivers/docker/config.go#L571)

**类型**：struct

```go
	Type string `codec:"type"`
	Target string `codec:"target"`
	Source string `codec:"source"`
	ReadOnly bool `codec:"readonly"`
	BindOptions DockerBindOptions `codec:"bind_options"`
	VolumeOptions DockerVolumeOptions `codec:"volume_options"`
	TmpfsOptions DockerTmpfsOptions `codec:"tmpfs_options"`
```

**关联方法**（1 个）：`toDockerHostMount`

### DockerVolumeOptions

**定义位置**：[L624](file:///d:/claude/nomad/drivers/docker/config.go#L624)

**类型**：struct

```go
	NoCopy bool `codec:"no_copy"`
	Labels hclutils.MapStrStr `codec:"labels"`
	DriverConfig DockerVolumeDriverConfig `codec:"driver_config"`
```

### DockerBindOptions

**定义位置**：[L630](file:///d:/claude/nomad/drivers/docker/config.go#L630)

**类型**：struct

```go
	Propagation string `codec:"propagation"`
```

### DockerTmpfsOptions

**定义位置**：[L634](file:///d:/claude/nomad/drivers/docker/config.go#L634)

**类型**：struct

```go
	SizeBytes int64 `codec:"size"`
	Mode int `codec:"mode"`
```

### DockerVolumeDriverConfig

**定义位置**：[L640](file:///d:/claude/nomad/drivers/docker/config.go#L640)

**类型**：struct

```go
	Name string `codec:"name"`
	Options hclutils.MapStrStr `codec:"options"`
```

### ContainerGCConfig

**定义位置**：[L647](file:///d:/claude/nomad/drivers/docker/config.go#L647)

**类型**：struct

```go
	Enabled bool `codec:"enabled"`
	DryRun bool `codec:"dry_run"`
	PeriodStr string `codec:"period"`
	period time.Duration `codec:"-"`
	CreationGraceStr string `codec:"creation_grace"`
	CreationGrace time.Duration `codec:"-"`
```

### DriverConfig

**定义位置**：[L667](file:///d:/claude/nomad/drivers/docker/config.go#L667)

**类型**：struct

```go
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
```

### AuthConfig

**定义位置**：[L698](file:///d:/claude/nomad/drivers/docker/config.go#L698)

**类型**：struct

```go
	Config string `codec:"config"`
	Helper string `codec:"helper"`
```

### TLSConfig

**定义位置**：[L703](file:///d:/claude/nomad/drivers/docker/config.go#L703)

**类型**：struct

```go
	Cert string `codec:"cert"`
	Key string `codec:"key"`
	CA string `codec:"ca"`
```

### GCConfig

**定义位置**：[L709](file:///d:/claude/nomad/drivers/docker/config.go#L709)

**类型**：struct

```go
	Image bool `codec:"image"`
	ImageDelay string `codec:"image_delay"`
	imageDelayDuration time.Duration `codec:"-"`
	Container bool `codec:"container"`
	DanglingContainers ContainerGCConfig `codec:"dangling_containers"`
```

### VolumeConfig

**定义位置**：[L718](file:///d:/claude/nomad/drivers/docker/config.go#L718)

**类型**：struct

```go
	Enabled bool `codec:"enabled"`
	SelinuxLabel string `codec:"selinuxlabel"`
```

### LoggingConfig

**定义位置**：[L723](file:///d:/claude/nomad/drivers/docker/config.go#L723)

**类型**：struct

```go
	Type string `codec:"type"`
	Config map[string]string `codec:"config"`
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `NoSuchContainerError` | `"No such container"` |
| `ContainerNotRunningError` | `"is not running"` |
| `pluginName` | `"docker"` |
| `fingerprintPeriod` | `30 * time.Second` |
| `dockerTimeout` | `5 * time.Minute` |
| `dockerAuthHelperPrefix` | `"docker-credential-"` |
| `danglingContainersCreationGraceMinimum` | `1 * time.Minute` |
| `pullActivityTimeoutMinimum` | `1 * time.Minute` |

### 变量

| 名称 | 值 |
|------|----|
| `PluginID` | `loader.PluginID{...}` |
| `PluginConfig` | `&loader.InternalPluginConfig{...}` |
| `pluginInfo` | `&base.PluginInfoResponse{...}` |
| `danglingContainersBlock` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` |
| `configSpec` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` |
| `mountBodySpec` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` |
| `healthchecksBodySpec` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` |
| `taskConfigSpec` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` |
| `driverCapabilities` | `&drivers.Capabilities{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `PluginLoader` | - | `opts map[string]string` | `map[string]interface{}, error` | [L51](file:///d:/claude/nomad/drivers/docker/config.go#L51) |
| `toDockerDevice` | `d *DockerDevice` | - | `containerapi.DeviceMapping, error` | [L530](file:///d:/claude/nomad/drivers/docker/config.go#L530) |
| `Disabled` | `dh *DockerHealthchecks` | - | `bool` | [L567](file:///d:/claude/nomad/drivers/docker/config.go#L567) |
| `toDockerHostMount` | `m *DockerMount` | - | `mount.Mount, error` | [L581](file:///d:/claude/nomad/drivers/docker/config.go#L581) |
| `PluginInfo` | `d *Driver` | - | `*base.PluginInfoResponse, error` | [L728](file:///d:/claude/nomad/drivers/docker/config.go#L728) |
| `ConfigSchema` | `d *Driver` | - | `*hclspec.Spec, error` | [L732](file:///d:/claude/nomad/drivers/docker/config.go#L732) |
| `SetConfig` | `d *Driver` | `c *base.Config` | `error` | [L739](file:///d:/claude/nomad/drivers/docker/config.go#L739) |
| `TaskConfigSchema` | `d *Driver` | - | `*hclspec.Spec, error` | [L834](file:///d:/claude/nomad/drivers/docker/config.go#L834) |
| `Capabilities` | `d *Driver` | - | `*drivers.Capabilities, error` | [L840](file:///d:/claude/nomad/drivers/docker/config.go#L840) |

## 5. 核心方法详解

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

