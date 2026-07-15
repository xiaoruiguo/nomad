# tasks.go 代码说明文档

> 文件路径：[api/tasks.go](file:///d:/claude/nomad/api/tasks.go)
> 总行数：1275 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `tasks.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### ReconcileOption

**定义位置**：[L14](file:///d:/claude/nomad/api/tasks.go#L14)

**类型定义**：`type ReconcileOption string`

### MemoryStats

**定义位置**：[L35](file:///d:/claude/nomad/api/tasks.go#L35)

**中文说明**：MemoryStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type MemoryStats struct {
	RSS uint64
	Cache uint64
	Swap uint64
	Usage uint64
	MaxUsage uint64
	KernelUsage uint64
	KernelMaxUsage uint64
	Measured []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `RSS` | `uint64` | 无符号 64 位整数 |
| `Cache` | `uint64` | 无符号 64 位整数 |
| `Swap` | `uint64` | 无符号 64 位整数 |
| `Usage` | `uint64` | 无符号 64 位整数 |
| `MaxUsage` | `uint64` | 无符号 64 位整数 |
| `KernelUsage` | `uint64` | 无符号 64 位整数 |
| `KernelMaxUsage` | `uint64` | 无符号 64 位整数 |
| `Measured` | `[]string` | 列表 |

### CpuStats

**定义位置**：[L47](file:///d:/claude/nomad/api/tasks.go#L47)

**中文说明**：CpuStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type CpuStats struct {
	SystemMode float64
	UserMode float64
	TotalTicks float64
	ThrottledPeriods uint64
	ThrottledTime uint64
	Percent float64
	Measured []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SystemMode` | `float64` | — |
| `UserMode` | `float64` | — |
| `TotalTicks` | `float64` | — |
| `ThrottledPeriods` | `uint64` | 无符号 64 位整数 |
| `ThrottledTime` | `uint64` | 无符号 64 位整数 |
| `Percent` | `float64` | — |
| `Measured` | `[]string` | 列表 |

### ResourceUsage

**定义位置**：[L58](file:///d:/claude/nomad/api/tasks.go#L58)

**中文说明**：ResourceUsage 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ResourceUsage struct {
	MemoryStats *MemoryStats
	CpuStats *CpuStats
	DeviceStats []*DeviceGroupStats
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MemoryStats` | `*MemoryStats` | — |
| `CpuStats` | `*CpuStats` | — |
| `DeviceStats` | `[]*DeviceGroupStats` | 列表 |

### TaskResourceUsage

**定义位置**：[L66](file:///d:/claude/nomad/api/tasks.go#L66)

**中文说明**：TaskResourceUsage 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskResourceUsage struct {
	ResourceUsage *ResourceUsage
	Timestamp int64
	Pids map[string]*ResourceUsage
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ResourceUsage` | `*ResourceUsage` | — |
| `Timestamp` | `int64` | 时间戳 |
| `Pids` | `map[string]*ResourceUsage` | 映射表 |

### AllocResourceUsage

**定义位置**：[L74](file:///d:/claude/nomad/api/tasks.go#L74)

**中文说明**：AllocResourceUsage 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocResourceUsage struct {
	ResourceUsage *ResourceUsage
	Tasks map[string]*TaskResourceUsage
	Timestamp int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ResourceUsage` | `*ResourceUsage` | — |
| `Tasks` | `map[string]*TaskResourceUsage` | 映射表 |
| `Timestamp` | `int64` | 时间戳 |

### AllocCheckStatus

**定义位置**：[L81](file:///d:/claude/nomad/api/tasks.go#L81)

**中文说明**：AllocCheckStatus 是一个状态结构体，描述对象或操作的当前状态。

**类型**：struct

```go
type AllocCheckStatus struct {
	ID string
	Check string
	Group string
	Mode string
	Output string
	Service string
	Task string
	Status string
	StatusCode int
	Timestamp int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Check` | `string` | 字符串 |
| `Group` | `string` | 字符串 |
| `Mode` | `string` | 字符串 |
| `Output` | `string` | 字符串 |
| `Service` | `string` | 字符串 |
| `Task` | `string` | 字符串 |
| `Status` | `string` | 状态 |
| `StatusCode` | `int` | — |
| `Timestamp` | `int64` | 时间戳 |

### AllocCheckStatuses

**定义位置**：[L96](file:///d:/claude/nomad/api/tasks.go#L96)

**中文说明**：AllocCheckStatuses 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型定义**：`type AllocCheckStatuses map[string]AllocCheckStatus`

### RestartPolicy

**定义位置**：[L100](file:///d:/claude/nomad/api/tasks.go#L100)

**中文说明**：RestartPolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type RestartPolicy struct {
	Interval *time.Duration `hcl:"interval,optional"`
	Attempts *int `hcl:"attempts,optional"`
	Delay *time.Duration `hcl:"delay,optional"`
	Mode *string `hcl:"mode,optional"`
	RenderTemplates *bool `mapstructure:"render_templates" hcl:"render_templates,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Interval` | `*time.Duration `hcl:"interval,optional"`` | 时间间隔 |
| `Attempts` | `*int `hcl:"attempts,optional"`` | — |
| `Delay` | `*time.Duration `hcl:"delay,optional"`` | 延迟时间 |
| `Mode` | `*string `hcl:"mode,optional"`` | 字符串 |
| `RenderTemplates` | `*bool `mapstructure:"render_templates" hcl:"render_templates,optional"`` | 布尔值 |

**关联方法**（1 个）：`Merge`

### DisconnectStrategy

**定义位置**：[L128](file:///d:/claude/nomad/api/tasks.go#L128)

**中文说明**：DisconnectStrategy 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type DisconnectStrategy struct {
	LostAfter *time.Duration `mapstructure:"lost_after" hcl:"lost_after,optional"`
	StopOnClientAfter *time.Duration `mapstructure:"stop_on_client_after" hcl:"stop_on_client_after,optional"`
	Replace *bool `mapstructure:"replace" hcl:"replace,optional"`
	Reconcile *ReconcileOption `mapstructure:"reconcile" hcl:"reconcile,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `LostAfter` | `*time.Duration `mapstructure:"lost_after" hcl:"lost_after,optional"`` | 时间间隔 |
| `StopOnClientAfter` | `*time.Duration `mapstructure:"stop_on_client_after" hcl:"stop_on_client_after,optional"`` | 时间间隔 |
| `Replace` | `*bool `mapstructure:"replace" hcl:"replace,optional"`` | 布尔值 |
| `Reconcile` | `*ReconcileOption `mapstructure:"reconcile" hcl:"reconcile,optional"`` | — |

**关联方法**（1 个）：`Canonicalize`

### ReschedulePolicy

**定义位置**：[L158](file:///d:/claude/nomad/api/tasks.go#L158)

**中文说明**：ReschedulePolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type ReschedulePolicy struct {
	Attempts *int `mapstructure:"attempts" hcl:"attempts,optional"`
	Interval *time.Duration `mapstructure:"interval" hcl:"interval,optional"`
	Delay *time.Duration `mapstructure:"delay" hcl:"delay,optional"`
	DelayFunction *string `mapstructure:"delay_function" hcl:"delay_function,optional"`
	MaxDelay *time.Duration `mapstructure:"max_delay" hcl:"max_delay,optional"`
	Unlimited *bool `mapstructure:"unlimited" hcl:"unlimited,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Attempts` | `*int `mapstructure:"attempts" hcl:"attempts,optional"`` | — |
| `Interval` | `*time.Duration `mapstructure:"interval" hcl:"interval,optional"`` | 时间间隔 |
| `Delay` | `*time.Duration `mapstructure:"delay" hcl:"delay,optional"`` | 延迟时间 |
| `DelayFunction` | `*string `mapstructure:"delay_function" hcl:"delay_function,optional"`` | 字符串 |
| `MaxDelay` | `*time.Duration `mapstructure:"max_delay" hcl:"max_delay,optional"`` | 时间间隔 |
| `Unlimited` | `*bool `mapstructure:"unlimited" hcl:"unlimited,optional"`` | 布尔值 |

**关联方法**（4 个）：`Merge`, `Canonicalize`, `Copy`, `String`

### Affinity

**定义位置**：[L230](file:///d:/claude/nomad/api/tasks.go#L230)

**中文说明**：Affinity 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Affinity struct {
	LTarget string `hcl:"attribute,optional"`
	RTarget string `hcl:"value,optional"`
	Operand string `hcl:"operator,optional"`
	Weight *int8 `hcl:"weight,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `LTarget` | `string `hcl:"attribute,optional"`` | 字符串 |
| `RTarget` | `string `hcl:"value,optional"`` | 字符串 |
| `Operand` | `string `hcl:"operator,optional"`` | 字符串 |
| `Weight` | `*int8 `hcl:"weight,optional"`` | — |

**关联方法**（1 个）：`Canonicalize`

### Spread

**定义位置**：[L326](file:///d:/claude/nomad/api/tasks.go#L326)

**中文说明**：Spread 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Spread struct {
	Attribute string `hcl:"attribute,optional"`
	Weight *int8 `hcl:"weight,optional"`
	SpreadTarget []*SpreadTarget `hcl:"target,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Attribute` | `string `hcl:"attribute,optional"`` | 字符串 |
| `Weight` | `*int8 `hcl:"weight,optional"`` | — |
| `SpreadTarget` | `[]*SpreadTarget `hcl:"target,block"`` | 列表 |

**关联方法**（1 个）：`Canonicalize`

### SpreadTarget

**定义位置**：[L333](file:///d:/claude/nomad/api/tasks.go#L333)

**中文说明**：SpreadTarget 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type SpreadTarget struct {
	Value string `hcl:",label"`
	Percent uint8 `hcl:"percent,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Value` | `string `hcl:",label"`` | 值 |
| `Percent` | `uint8 `hcl:"percent,optional"`` | — |

### EphemeralDisk

**定义位置**：[L360](file:///d:/claude/nomad/api/tasks.go#L360)

**中文说明**：EphemeralDisk 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type EphemeralDisk struct {
	Sticky *bool `hcl:"sticky,optional"`
	Migrate *bool `hcl:"migrate,optional"`
	SizeMB *int `mapstructure:"size" hcl:"size,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Sticky` | `*bool `hcl:"sticky,optional"`` | 布尔值 |
| `Migrate` | `*bool `hcl:"migrate,optional"`` | 布尔值 |
| `SizeMB` | `*int `mapstructure:"size" hcl:"size,optional"`` | — |

**关联方法**（1 个）：`Canonicalize`

### MigrateStrategy

**定义位置**：[L388](file:///d:/claude/nomad/api/tasks.go#L388)

**中文说明**：MigrateStrategy 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type MigrateStrategy struct {
	MaxParallel *int `mapstructure:"max_parallel" hcl:"max_parallel,optional"`
	HealthCheck *string `mapstructure:"health_check" hcl:"health_check,optional"`
	MinHealthyTime *time.Duration `mapstructure:"min_healthy_time" hcl:"min_healthy_time,optional"`
	HealthyDeadline *time.Duration `mapstructure:"healthy_deadline" hcl:"healthy_deadline,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MaxParallel` | `*int `mapstructure:"max_parallel" hcl:"max_parallel,optional"`` | — |
| `HealthCheck` | `*string `mapstructure:"health_check" hcl:"health_check,optional"`` | 字符串 |
| `MinHealthyTime` | `*time.Duration `mapstructure:"min_healthy_time" hcl:"min_healthy_time,optional"`` | 时间间隔 |
| `HealthyDeadline` | `*time.Duration `mapstructure:"healthy_deadline" hcl:"healthy_deadline,optional"`` | 时间间隔 |

**关联方法**（3 个）：`Canonicalize`, `Merge`, `Copy`

### VolumeRequest

**定义位置**：[L448](file:///d:/claude/nomad/api/tasks.go#L448)

**中文说明**：VolumeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type VolumeRequest struct {
	Name string `hcl:"name,label"`
	Type string `hcl:"type,optional"`
	Source string `hcl:"source,optional"`
	ReadOnly bool `hcl:"read_only,optional"`
	Sticky bool `hcl:"sticky,optional"`
	AccessMode string `hcl:"access_mode,optional"`
	AttachmentMode string `hcl:"attachment_mode,optional"`
	MountOptions *CSIMountOptions `hcl:"mount_options,block"`
	PerAlloc bool `hcl:"per_alloc,optional"`
	ExtraKeysHCL []string `hcl1:",unusedKeys,optional" json:"-"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:"name,label"`` | 名称 |
| `Type` | `string `hcl:"type,optional"`` | 类型 |
| `Source` | `string `hcl:"source,optional"`` | 字符串 |
| `ReadOnly` | `bool `hcl:"read_only,optional"`` | 布尔值 |
| `Sticky` | `bool `hcl:"sticky,optional"`` | 布尔值 |
| `AccessMode` | `string `hcl:"access_mode,optional"`` | 字符串 |
| `AttachmentMode` | `string `hcl:"attachment_mode,optional"`` | 字符串 |
| `MountOptions` | `*CSIMountOptions `hcl:"mount_options,block"`` | — |
| `PerAlloc` | `bool `hcl:"per_alloc,optional"`` | 布尔值 |
| `ExtraKeysHCL` | `[]string `hcl1:",unusedKeys,optional" json:"-"`` | 列表 |

### VolumeMount

**定义位置**：[L469](file:///d:/claude/nomad/api/tasks.go#L469)

**中文说明**：VolumeMount 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type VolumeMount struct {
	Volume *string `hcl:"volume,optional"`
	Destination *string `hcl:"destination,optional"`
	ReadOnly *bool `mapstructure:"read_only" hcl:"read_only,optional"`
	PropagationMode *string `mapstructure:"propagation_mode" hcl:"propagation_mode,optional"`
	SELinuxLabel *string `mapstructure:"selinux_label" hcl:"selinux_label,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*string `hcl:"volume,optional"`` | 字符串 |
| `Destination` | `*string `hcl:"destination,optional"`` | 字符串 |
| `ReadOnly` | `*bool `mapstructure:"read_only" hcl:"read_only,optional"`` | 布尔值 |
| `PropagationMode` | `*string `mapstructure:"propagation_mode" hcl:"propagation_mode,optional"`` | 字符串 |
| `SELinuxLabel` | `*string `mapstructure:"selinux_label" hcl:"selinux_label,optional"`` | 字符串 |

**关联方法**（1 个）：`Canonicalize`

### TaskGroup

**定义位置**：[L492](file:///d:/claude/nomad/api/tasks.go#L492)

**中文说明**：TaskGroup 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskGroup struct {
	Name *string `hcl:"name,label"`
	Count *int `hcl:"count,optional"`
	Constraints []*Constraint `hcl:"constraint,block"`
	Affinities []*Affinity `hcl:"affinity,block"`
	Tasks []*Task `hcl:"task,block"`
	Spreads []*Spread `hcl:"spread,block"`
	Volumes map[string]*VolumeRequest `hcl:"volume,block"`
	RestartPolicy *RestartPolicy `hcl:"restart,block"`
	Disconnect *DisconnectStrategy `hcl:"disconnect,block"`
	ReschedulePolicy *ReschedulePolicy `hcl:"reschedule,block"`
	EphemeralDisk *EphemeralDisk `hcl:"ephemeral_disk,block"`
	Update *UpdateStrategy `hcl:"update,block"`
	Migrate *MigrateStrategy `hcl:"migrate,block"`
	Networks []*NetworkResource `hcl:"network,block"`
	Meta map[string]string `hcl:"meta,block"`
	Services []*Service `hcl:"service,block"`
	ShutdownDelay *time.Duration `mapstructure:"shutdown_delay" hcl:"shutdown_delay,optional"`
	MaxRunDuration *time.Duration `mapstructure:"max_run_duration" hcl:"max_run_duration,optional"`
	StopAfterClientDisconnect *time.Duration `mapstructure:"stop_after_client_disconnect" hcl:"stop_after_client_disconnect,optional"`
	MaxClientDisconnect *time.Duration `mapstructure:"max_client_disconnect" hcl:"max_client_disconnect,optional"`
	Scaling *ScalingPolicy `hcl:"scaling,block"`
	Consul *Consul `hcl:"consul,block"`
	PreventRescheduleOnLost *bool `hcl:"prevent_reschedule_on_lost,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `*string `hcl:"name,label"`` | 名称 |
| `Count` | `*int `hcl:"count,optional"`` | 计数 |
| `Constraints` | `[]*Constraint `hcl:"constraint,block"`` | 列表 |
| `Affinities` | `[]*Affinity `hcl:"affinity,block"`` | 列表 |
| `Tasks` | `[]*Task `hcl:"task,block"`` | 列表 |
| `Spreads` | `[]*Spread `hcl:"spread,block"`` | 列表 |
| `Volumes` | `map[string]*VolumeRequest `hcl:"volume,block"`` | 映射表 |
| `RestartPolicy` | `*RestartPolicy `hcl:"restart,block"`` | — |
| `Disconnect` | `*DisconnectStrategy `hcl:"disconnect,block"`` | — |
| `ReschedulePolicy` | `*ReschedulePolicy `hcl:"reschedule,block"`` | — |
| `EphemeralDisk` | `*EphemeralDisk `hcl:"ephemeral_disk,block"`` | — |
| `Update` | `*UpdateStrategy `hcl:"update,block"`` | — |
| `Migrate` | `*MigrateStrategy `hcl:"migrate,block"`` | — |
| `Networks` | `[]*NetworkResource `hcl:"network,block"`` | 列表 |
| `Meta` | `map[string]string `hcl:"meta,block"`` | 元数据 |
| `Services` | `[]*Service `hcl:"service,block"`` | 列表 |
| `ShutdownDelay` | `*time.Duration `mapstructure:"shutdown_delay" hcl:"shutdown_delay,optional"`` | 时间间隔 |
| `MaxRunDuration` | `*time.Duration `mapstructure:"max_run_duration" hcl:"max_run_duration,optional"`` | 时间间隔 |
| `StopAfterClientDisconnect` | `*time.Duration `mapstructure:"stop_after_client_disconnect" hcl:"stop_after_client_disconnect,optional"`` | 时间间隔 |
| `MaxClientDisconnect` | `*time.Duration `mapstructure:"max_client_disconnect" hcl:"max_client_disconnect,optional"`` | 时间间隔 |
| `Scaling` | `*ScalingPolicy `hcl:"scaling,block"`` | — |
| `Consul` | `*Consul `hcl:"consul,block"`` | — |
| `PreventRescheduleOnLost` | `*bool `hcl:"prevent_reschedule_on_lost,optional"`` | 布尔值 |

**关联方法**（8 个）：`Canonicalize`, `Constrain`, `SetMeta`, `AddTask`, `AddAffinity`, `RequireDisk`, `AddSpread`, `ScalingPolicy`

### LogConfig

**定义位置**：[L710](file:///d:/claude/nomad/api/tasks.go#L710)

**中文说明**：LogConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type LogConfig struct {
	MaxFiles *int `mapstructure:"max_files" hcl:"max_files,optional"`
	MaxFileSizeMB *int `mapstructure:"max_file_size" hcl:"max_file_size,optional"`
	Enabled *bool `mapstructure:"enabled" hcl:"enabled,optional"`
	Disabled *bool `mapstructure:"disabled" hcl:"disabled,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MaxFiles` | `*int `mapstructure:"max_files" hcl:"max_files,optional"`` | — |
| `MaxFileSizeMB` | `*int `mapstructure:"max_file_size" hcl:"max_file_size,optional"`` | — |
| `Enabled` | `*bool `mapstructure:"enabled" hcl:"enabled,optional"`` | 是否启用 |
| `Disabled` | `*bool `mapstructure:"disabled" hcl:"disabled,optional"`` | 是否禁用 |

**关联方法**（1 个）：`Canonicalize`

### DispatchPayloadConfig

**定义位置**：[L742](file:///d:/claude/nomad/api/tasks.go#L742)

**中文说明**：DispatchPayloadConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type DispatchPayloadConfig struct {
	File string `hcl:"file,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `File` | `string `hcl:"file,optional"`` | 字符串 |

### TaskLifecycle

**定义位置**：[L752](file:///d:/claude/nomad/api/tasks.go#L752)

**中文说明**：TaskLifecycle 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskLifecycle struct {
	Hook string `mapstructure:"hook" hcl:"hook"`
	Sidecar bool `mapstructure:"sidecar" hcl:"sidecar,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Hook` | `string `mapstructure:"hook" hcl:"hook"`` | 字符串 |
| `Sidecar` | `bool `mapstructure:"sidecar" hcl:"sidecar,optional"`` | 布尔值 |

**关联方法**（1 个）：`Empty`

### Task

**定义位置**：[L763](file:///d:/claude/nomad/api/tasks.go#L763)

**中文说明**：Task 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type Task struct {
	Name string `hcl:"name,label"`
	Driver string `hcl:"driver,optional"`
	User string `hcl:"user,optional"`
	Lifecycle *TaskLifecycle `hcl:"lifecycle,block"`
	Config map[string]interface{} `hcl:"config,block"`
	Constraints []*Constraint `hcl:"constraint,block"`
	Affinities []*Affinity `hcl:"affinity,block"`
	Env map[string]string `hcl:"env,block"`
	Services []*Service `hcl:"service,block"`
	Resources *Resources `hcl:"resources,block"`
	RestartPolicy *RestartPolicy `hcl:"restart,block"`
	Meta map[string]string `hcl:"meta,block"`
	KillTimeout *time.Duration `mapstructure:"kill_timeout" hcl:"kill_timeout,optional"`
	LogConfig *LogConfig `mapstructure:"logs" hcl:"logs,block"`
	Artifacts []*TaskArtifact `hcl:"artifact,block"`
	Vault *Vault `hcl:"vault,block"`
	Consul *Consul `hcl:"consul,block"`
	Templates []*Template `hcl:"template,block"`
	DispatchPayload *DispatchPayloadConfig `hcl:"dispatch_payload,block"`
	VolumeMounts []*VolumeMount `hcl:"volume_mount,block"`
	CSIPluginConfig *TaskCSIPluginConfig `mapstructure:"csi_plugin" json:",omitempty" hcl:"csi_plugin,block"`
	Leader bool `hcl:"leader,optional"`
	ShutdownDelay time.Duration `mapstructure:"shutdown_delay" hcl:"shutdown_delay,optional"`
	KillSignal string `mapstructure:"kill_signal" hcl:"kill_signal,optional"`
	Kind string `hcl:"kind,optional"`
	ScalingPolicies []*ScalingPolicy `hcl:"scaling,block"`
	Secrets []*Secret `hcl:"secret,block"`
	Identity *WorkloadIdentity
	Identities []*WorkloadIdentity `hcl:"identity,block"`
	Actions []*Action `hcl:"action,block"`
	Schedule *TaskSchedule `hcl:"schedule,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:"name,label"`` | 名称 |
| `Driver` | `string `hcl:"driver,optional"`` | 字符串 |
| `User` | `string `hcl:"user,optional"`` | 字符串 |
| `Lifecycle` | `*TaskLifecycle `hcl:"lifecycle,block"`` | — |
| `Config` | `map[string]interface{} `hcl:"config,block"`` | 配置 |
| `Constraints` | `[]*Constraint `hcl:"constraint,block"`` | 列表 |
| `Affinities` | `[]*Affinity `hcl:"affinity,block"`` | 列表 |
| `Env` | `map[string]string `hcl:"env,block"`` | 映射表 |
| `Services` | `[]*Service `hcl:"service,block"`` | 列表 |
| `Resources` | `*Resources `hcl:"resources,block"`` | — |
| `RestartPolicy` | `*RestartPolicy `hcl:"restart,block"`` | — |
| `Meta` | `map[string]string `hcl:"meta,block"`` | 元数据 |
| `KillTimeout` | `*time.Duration `mapstructure:"kill_timeout" hcl:"kill_timeout,optional"`` | 时间间隔 |
| `LogConfig` | `*LogConfig `mapstructure:"logs" hcl:"logs,block"`` | — |
| `Artifacts` | `[]*TaskArtifact `hcl:"artifact,block"`` | 列表 |
| `Vault` | `*Vault `hcl:"vault,block"`` | — |
| `Consul` | `*Consul `hcl:"consul,block"`` | — |
| `Templates` | `[]*Template `hcl:"template,block"`` | 列表 |
| `DispatchPayload` | `*DispatchPayloadConfig `hcl:"dispatch_payload,block"`` | — |
| `VolumeMounts` | `[]*VolumeMount `hcl:"volume_mount,block"`` | 列表 |
| `CSIPluginConfig` | `*TaskCSIPluginConfig `mapstructure:"csi_plugin" json:",omitempty" hcl:"csi_plugin,block"`` | — |
| `Leader` | `bool `hcl:"leader,optional"`` | 布尔值 |
| `ShutdownDelay` | `time.Duration `mapstructure:"shutdown_delay" hcl:"shutdown_delay,optional"`` | 时间间隔 |
| `KillSignal` | `string `mapstructure:"kill_signal" hcl:"kill_signal,optional"`` | 字符串 |
| `Kind` | `string `hcl:"kind,optional"`` | 种类 |
| `ScalingPolicies` | `[]*ScalingPolicy `hcl:"scaling,block"`` | 列表 |
| `Secrets` | `[]*Secret `hcl:"secret,block"`` | 列表 |
| `Identity` | `*WorkloadIdentity` | — |
| `Identities` | `[]*WorkloadIdentity `hcl:"identity,block"`` | 列表 |
| `Actions` | `[]*Action `hcl:"action,block"`` | 列表 |
| `Schedule` | `*TaskSchedule `hcl:"schedule,block"`` | — |

**关联方法**（8 个）：`Canonicalize`, `SetConfig`, `SetMeta`, `Require`, `Constrain`, `AddAffinity`, `SetLogConfig`, `SetLifecycle`

### TaskArtifact

**定义位置**：[L859](file:///d:/claude/nomad/api/tasks.go#L859)

**中文说明**：TaskArtifact 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskArtifact struct {
	GetterSource *string `mapstructure:"source" hcl:"source,optional"`
	GetterOptions map[string]string `mapstructure:"options" hcl:"options,block"`
	GetterHeaders map[string]string `mapstructure:"headers" hcl:"headers,block"`
	GetterMode *string `mapstructure:"mode" hcl:"mode,optional"`
	GetterInsecure *bool `mapstructure:"insecure" hcl:"insecure,optional"`
	RelativeDest *string `mapstructure:"destination" hcl:"destination,optional"`
	Chown bool `mapstructure:"chown" hcl:"chown,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `GetterSource` | `*string `mapstructure:"source" hcl:"source,optional"`` | 字符串 |
| `GetterOptions` | `map[string]string `mapstructure:"options" hcl:"options,block"`` | 映射表 |
| `GetterHeaders` | `map[string]string `mapstructure:"headers" hcl:"headers,block"`` | 映射表 |
| `GetterMode` | `*string `mapstructure:"mode" hcl:"mode,optional"`` | 字符串 |
| `GetterInsecure` | `*bool `mapstructure:"insecure" hcl:"insecure,optional"`` | 布尔值 |
| `RelativeDest` | `*string `mapstructure:"destination" hcl:"destination,optional"`` | 字符串 |
| `Chown` | `bool `mapstructure:"chown" hcl:"chown,optional"`` | 布尔值 |

**关联方法**（1 个）：`Canonicalize`

### WaitConfig

**定义位置**：[L903](file:///d:/claude/nomad/api/tasks.go#L903)

**中文说明**：WaitConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type WaitConfig struct {
	Min *time.Duration `mapstructure:"min" hcl:"min"`
	Max *time.Duration `mapstructure:"max" hcl:"max"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Min` | `*time.Duration `mapstructure:"min" hcl:"min"`` | 最小值 |
| `Max` | `*time.Duration `mapstructure:"max" hcl:"max"`` | 最大值 |

**关联方法**（1 个）：`Copy`

### ChangeScript

**定义位置**：[L919](file:///d:/claude/nomad/api/tasks.go#L919)

**中文说明**：ChangeScript 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ChangeScript struct {
	Command *string `mapstructure:"command" hcl:"command"`
	Args []string `mapstructure:"args" hcl:"args,optional"`
	Timeout *time.Duration `mapstructure:"timeout" hcl:"timeout,optional"`
	FailOnError *bool `mapstructure:"fail_on_error" hcl:"fail_on_error"`
	RunOnFirstRender *bool `mapstructure:"run_on_first_render" hcl:"run_on_first_render,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Command` | `*string `mapstructure:"command" hcl:"command"`` | 字符串 |
| `Args` | `[]string `mapstructure:"args" hcl:"args,optional"`` | 参数 |
| `Timeout` | `*time.Duration `mapstructure:"timeout" hcl:"timeout,optional"`` | 超时时间 |
| `FailOnError` | `*bool `mapstructure:"fail_on_error" hcl:"fail_on_error"`` | 布尔值 |
| `RunOnFirstRender` | `*bool `mapstructure:"run_on_first_render" hcl:"run_on_first_render,optional"`` | 布尔值 |

**关联方法**（1 个）：`Canonicalize`

### Template

**定义位置**：[L945](file:///d:/claude/nomad/api/tasks.go#L945)

**中文说明**：Template 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Template struct {
	SourcePath *string `mapstructure:"source" hcl:"source,optional"`
	DestPath *string `mapstructure:"destination" hcl:"destination,optional"`
	EmbeddedTmpl *string `mapstructure:"data" hcl:"data,optional"`
	ChangeMode *string `mapstructure:"change_mode" hcl:"change_mode,optional"`
	ChangeScript *ChangeScript `mapstructure:"change_script" hcl:"change_script,block"`
	ChangeSignal *string `mapstructure:"change_signal" hcl:"change_signal,optional"`
	Once *bool `mapstructure:"once" hcl:"once,optional"`
	Splay *time.Duration `mapstructure:"splay" hcl:"splay,optional"`
	Perms *string `mapstructure:"perms" hcl:"perms,optional"`
	Uid *int `mapstructure:"uid" hcl:"uid,optional"`
	Gid *int `mapstructure:"gid" hcl:"gid,optional"`
	LeftDelim *string `mapstructure:"left_delimiter" hcl:"left_delimiter,optional"`
	RightDelim *string `mapstructure:"right_delimiter" hcl:"right_delimiter,optional"`
	Envvars *bool `mapstructure:"env" hcl:"env,optional"`
	VaultGrace *time.Duration `mapstructure:"vault_grace" hcl:"vault_grace,optional"`
	Wait *WaitConfig `mapstructure:"wait" hcl:"wait,block"`
	ErrMissingKey *bool `mapstructure:"error_on_missing_key" hcl:"error_on_missing_key,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SourcePath` | `*string `mapstructure:"source" hcl:"source,optional"`` | 字符串 |
| `DestPath` | `*string `mapstructure:"destination" hcl:"destination,optional"`` | 字符串 |
| `EmbeddedTmpl` | `*string `mapstructure:"data" hcl:"data,optional"`` | 字符串 |
| `ChangeMode` | `*string `mapstructure:"change_mode" hcl:"change_mode,optional"`` | 字符串 |
| `ChangeScript` | `*ChangeScript `mapstructure:"change_script" hcl:"change_script,block"`` | — |
| `ChangeSignal` | `*string `mapstructure:"change_signal" hcl:"change_signal,optional"`` | 字符串 |
| `Once` | `*bool `mapstructure:"once" hcl:"once,optional"`` | 布尔值 |
| `Splay` | `*time.Duration `mapstructure:"splay" hcl:"splay,optional"`` | 时间间隔 |
| `Perms` | `*string `mapstructure:"perms" hcl:"perms,optional"`` | 字符串 |
| `Uid` | `*int `mapstructure:"uid" hcl:"uid,optional"`` | — |
| `Gid` | `*int `mapstructure:"gid" hcl:"gid,optional"`` | — |
| `LeftDelim` | `*string `mapstructure:"left_delimiter" hcl:"left_delimiter,optional"`` | 字符串 |
| `RightDelim` | `*string `mapstructure:"right_delimiter" hcl:"right_delimiter,optional"`` | 字符串 |
| `Envvars` | `*bool `mapstructure:"env" hcl:"env,optional"`` | 布尔值 |
| `VaultGrace` | `*time.Duration `mapstructure:"vault_grace" hcl:"vault_grace,optional"`` | 时间间隔 |
| `Wait` | `*WaitConfig `mapstructure:"wait" hcl:"wait,block"`` | — |
| `ErrMissingKey` | `*bool `mapstructure:"error_on_missing_key" hcl:"error_on_missing_key,optional"`` | 布尔值 |

**关联方法**（1 个）：`Canonicalize`

### Vault

**定义位置**：[L1018](file:///d:/claude/nomad/api/tasks.go#L1018)

**中文说明**：Vault 与 Vault 集成相关，用于密钥管理和动态凭据。

**类型**：struct

```go
type Vault struct {
	Policies []string `hcl:"policies,optional"`
	Role string `hcl:"role,optional"`
	Namespace *string `mapstructure:"namespace" hcl:"namespace,optional"`
	Cluster string `hcl:"cluster,optional"`
	Env *bool `hcl:"env,optional"`
	DisableFile *bool `mapstructure:"disable_file" hcl:"disable_file,optional"`
	ChangeMode *string `mapstructure:"change_mode" hcl:"change_mode,optional"`
	ChangeSignal *string `mapstructure:"change_signal" hcl:"change_signal,optional"`
	AllowTokenExpiration *bool `mapstructure:"allow_token_expiration" hcl:"allow_token_expiration,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Policies` | `[]string `hcl:"policies,optional"`` | 列表 |
| `Role` | `string `hcl:"role,optional"`` | 角色 |
| `Namespace` | `*string `mapstructure:"namespace" hcl:"namespace,optional"`` | 命名空间 |
| `Cluster` | `string `hcl:"cluster,optional"`` | 字符串 |
| `Env` | `*bool `hcl:"env,optional"`` | 布尔值 |
| `DisableFile` | `*bool `mapstructure:"disable_file" hcl:"disable_file,optional"`` | 布尔值 |
| `ChangeMode` | `*string `mapstructure:"change_mode" hcl:"change_mode,optional"`` | 字符串 |
| `ChangeSignal` | `*string `mapstructure:"change_signal" hcl:"change_signal,optional"`` | 字符串 |
| `AllowTokenExpiration` | `*bool `mapstructure:"allow_token_expiration" hcl:"allow_token_expiration,optional"`` | 布尔值 |

**关联方法**（1 个）：`Canonicalize`

### Secret

**定义位置**：[L1054](file:///d:/claude/nomad/api/tasks.go#L1054)

**中文说明**：Secret 与密钥（Secret）相关，管理敏感数据。

**类型**：struct

```go
type Secret struct {
	Name string `hcl:"name,label"`
	Provider string `hcl:"provider,optional"`
	Path string `hcl:"path,optional"`
	Config map[string]any `hcl:"config,block"`
	Env map[string]string `hcl:"env,block"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:"name,label"`` | 名称 |
| `Provider` | `string `hcl:"provider,optional"`` | 字符串 |
| `Path` | `string `hcl:"path,optional"`` | 路径 |
| `Config` | `map[string]any `hcl:"config,block"`` | 配置 |
| `Env` | `map[string]string `hcl:"env,block"`` | 映射表 |

**关联方法**（1 个）：`Canonicalize`

### TaskState

**定义位置**：[L1131](file:///d:/claude/nomad/api/tasks.go#L1131)

**中文说明**：TaskState 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskState struct {
	State string
	Failed bool
	Restarts uint64
	LastRestart time.Time
	StartedAt time.Time
	FinishedAt time.Time
	Events []*TaskEvent
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `State` | `string` | 状态 |
| `Failed` | `bool` | 布尔值 |
| `Restarts` | `uint64` | 无符号 64 位整数 |
| `LastRestart` | `time.Time` | 时间点 |
| `StartedAt` | `time.Time` | 时间点 |
| `FinishedAt` | `time.Time` | 时间点 |
| `Events` | `[]*TaskEvent` | 列表 |

### TaskEvent

**定义位置**：[L1166](file:///d:/claude/nomad/api/tasks.go#L1166)

**中文说明**：TaskEvent 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskEvent struct {
	Type string
	Time int64
	DisplayMessage string
	Details map[string]string
	Message string
	FailsTask bool
	RestartReason string
	SetupError string
	DriverError string
	DriverMessage string
	ExitCode int
	Signal int
	KillReason string
	KillTimeout time.Duration
	KillError string
	StartDelay int64
	DownloadError string
	ValidationError string
	DiskLimit int64
	DiskSize int64
	FailedSibling string
	VaultError string
	TaskSignalReason string
	TaskSignal string
	GenericSource string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Type` | `string` | 类型 |
| `Time` | `int64` | 时间戳 |
| `DisplayMessage` | `string` | 字符串 |
| `Details` | `map[string]string` | 映射表 |
| `Message` | `string` | 消息 |
| `FailsTask` | `bool` | 布尔值 |
| `RestartReason` | `string` | 字符串 |
| `SetupError` | `string` | 字符串 |
| `DriverError` | `string` | 字符串 |
| `DriverMessage` | `string` | 字符串 |
| `ExitCode` | `int` | — |
| `Signal` | `int` | — |
| `KillReason` | `string` | 字符串 |
| `KillTimeout` | `time.Duration` | 时间间隔 |
| `KillError` | `string` | 字符串 |
| `StartDelay` | `int64` | — |
| `DownloadError` | `string` | 字符串 |
| `ValidationError` | `string` | 字符串 |
| `DiskLimit` | `int64` | — |
| `DiskSize` | `int64` | — |
| `FailedSibling` | `string` | 字符串 |
| `VaultError` | `string` | 字符串 |
| `TaskSignalReason` | `string` | 字符串 |
| `TaskSignal` | `string` | 字符串 |
| `GenericSource` | `string` | 字符串 |

### CSIPluginType

**定义位置**：[L1198](file:///d:/claude/nomad/api/tasks.go#L1198)

**中文说明**：CSIPluginType 与插件（Plugin）相关，实现可扩展的功能模块。

**类型定义**：`type CSIPluginType string`

### TaskCSIPluginConfig

**定义位置**：[L1217](file:///d:/claude/nomad/api/tasks.go#L1217)

**中文说明**：TaskCSIPluginConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type TaskCSIPluginConfig struct {
	ID string `mapstructure:"id" hcl:"id,optional"`
	Type CSIPluginType `mapstructure:"type" hcl:"type,optional"`
	MountDir string `mapstructure:"mount_dir" hcl:"mount_dir,optional"`
	StagePublishBaseDir string `mapstructure:"stage_publish_base_dir" hcl:"stage_publish_base_dir,optional"`
	HealthTimeout time.Duration `mapstructure:"health_timeout" hcl:"health_timeout,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string `mapstructure:"id" hcl:"id,optional"`` | 唯一标识符 |
| `Type` | `CSIPluginType `mapstructure:"type" hcl:"type,optional"`` | 类型 |
| `MountDir` | `string `mapstructure:"mount_dir" hcl:"mount_dir,optional"`` | 字符串 |
| `StagePublishBaseDir` | `string `mapstructure:"stage_publish_base_dir" hcl:"stage_publish_base_dir,optional"`` | 字符串 |
| `HealthTimeout` | `time.Duration `mapstructure:"health_timeout" hcl:"health_timeout,optional"`` | 时间间隔 |

**关联方法**（1 个）：`Canonicalize`

### WorkloadIdentity

**定义位置**：[L1257](file:///d:/claude/nomad/api/tasks.go#L1257)

**中文说明**：WorkloadIdentity 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type WorkloadIdentity struct {
	Name string `hcl:"name,optional"`
	Audience []string `mapstructure:"aud" hcl:"aud,optional"`
	ChangeMode string `mapstructure:"change_mode" hcl:"change_mode,optional"`
	ChangeSignal string `mapstructure:"change_signal" hcl:"change_signal,optional"`
	Env bool `hcl:"env,optional"`
	File bool `hcl:"file,optional"`
	Filepath string `hcl:"filepath,optional"`
	ServiceName string `hcl:"service_name,optional"`
	TTL time.Duration `mapstructure:"ttl" hcl:"ttl,optional"`
	ExtraClaims []string `mapstructure:"extra_claims" hcl:"extra_claims,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:"name,optional"`` | 名称 |
| `Audience` | `[]string `mapstructure:"aud" hcl:"aud,optional"`` | 列表 |
| `ChangeMode` | `string `mapstructure:"change_mode" hcl:"change_mode,optional"`` | 字符串 |
| `ChangeSignal` | `string `mapstructure:"change_signal" hcl:"change_signal,optional"`` | 字符串 |
| `Env` | `bool `hcl:"env,optional"`` | 布尔值 |
| `File` | `bool `hcl:"file,optional"`` | 布尔值 |
| `Filepath` | `string `hcl:"filepath,optional"`` | 字符串 |
| `ServiceName` | `string `hcl:"service_name,optional"`` | 字符串 |
| `TTL` | `time.Duration `mapstructure:"ttl" hcl:"ttl,optional"`` | 生存时间（TTL） |
| `ExtraClaims` | `[]string `mapstructure:"extra_claims" hcl:"extra_claims,optional"`` | 列表 |

### Action

**定义位置**：[L1270](file:///d:/claude/nomad/api/tasks.go#L1270)

**中文说明**：Action 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Action struct {
	Name string `hcl:"name,label"`
	Command string `mapstructure:"command" hcl:"command"`
	Args []string `mapstructure:"args" hcl:"args,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:"name,label"`` | 名称 |
| `Command` | `string `mapstructure:"command" hcl:"command"`` | 字符串 |
| `Args` | `[]string `mapstructure:"args" hcl:"args,optional"`` | 参数 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `RestartPolicyModeDelay` | `—` | `"delay"` | — |
| `RestartPolicyModeFail` | `—` | `"fail"` | — |
| `ReconcileOptionKeepOriginal` | `—` | `"keep_original"` | — |
| `ReconcileOptionKeepReplacement` | `—` | `"keep_replacement"` | — |
| `ReconcileOptionBestScore` | `—` | `"best_score"` | — |
| `ReconcileOptionLongestRunning` | `—` | `"longest_running"` | — |
| `VolumeMountPropagationPrivate` | `—` | `"private"` | — |
| `VolumeMountPropagationHostToTask` | `—` | `"host-to-task"` | — |
| `VolumeMountPropagationBidirectional` | `—` | `"bidirectional"` | — |
| `TaskLifecycleHookPrestart` | `—` | `"prestart"` | — |
| `TaskLifecycleHookPoststart` | `—` | `"poststart"` | — |
| `TaskLifecycleHookPoststop` | `—` | `"poststop"` | — |
| `TaskSetup` | `—` | `"Task Setup"` | — |
| `TaskSetupFailure` | `—` | `"Setup Failure"` | — |
| `TaskDriverFailure` | `—` | `"Driver Failure"` | — |
| `TaskDriverMessage` | `—` | `"Driver"` | — |
| `TaskReceived` | `—` | `"Received"` | — |
| `TaskFailedValidation` | `—` | `"Failed Validation"` | — |
| `TaskStarted` | `—` | `"Started"` | — |
| `TaskTerminated` | `—` | `"Terminated"` | — |
| `TaskKilling` | `—` | `"Killing"` | — |
| `TaskKilled` | `—` | `"Killed"` | — |
| `TaskRestarting` | `—` | `"Restarting"` | — |
| `TaskNotRestarting` | `—` | `"Not Restarting"` | — |
| `TaskDownloadingArtifacts` | `—` | `"Downloading Artifacts"` | — |
| `TaskArtifactDownloadFailed` | `—` | `"Failed Artifact Download"` | — |
| `TaskSiblingFailed` | `—` | `"Sibling Task Failed"` | — |
| `TaskSignaling` | `—` | `"Signaling"` | — |
| `TaskRestartSignal` | `—` | `"Restart Signaled"` | — |
| `TaskLeaderDead` | `—` | `"Leader Task Dead"` | — |
| `TaskBuildingTaskDir` | `—` | `"Building Task Directory"` | — |
| `TaskClientReconnected` | `—` | `"Reconnected"` | — |
| `CSIPluginTypeNode` | `CSIPluginType` | `"node"` | — |
| `CSIPluginTypeController` | `CSIPluginType` | `"controller"` | — |
| `CSIPluginTypeMonolith` | `CSIPluginType` | `"monolith"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Merge` | `r *RestartPolicy` | `rp *RestartPolicy` | `` | [L108](file:///d:/claude/nomad/api/tasks.go#L108) |
| `Canonicalize` | `ds *DisconnectStrategy` | `` | `` | [L147](file:///d:/claude/nomad/api/tasks.go#L147) |
| `Merge` | `r *ReschedulePolicy` | `rp *ReschedulePolicy` | `` | [L180](file:///d:/claude/nomad/api/tasks.go#L180) |
| `Canonicalize` | `r *ReschedulePolicy` | `jobType string` | `` | [L204](file:///d:/claude/nomad/api/tasks.go#L204) |
| `NewAffinity` | - | `lTarget string, operand string, rTarget string, weight int8` | `*Affinity` | [L237](file:///d:/claude/nomad/api/tasks.go#L237) |
| `Canonicalize` | `a *Affinity` | `` | `` | [L246](file:///d:/claude/nomad/api/tasks.go#L246) |
| `NewDefaultDisconnectStrategy` | - | `` | `*DisconnectStrategy` | [L252](file:///d:/claude/nomad/api/tasks.go#L252) |
| `NewDefaultReschedulePolicy` | - | `jobType string` | `*ReschedulePolicy` | [L260](file:///d:/claude/nomad/api/tasks.go#L260) |
| `Copy` | `r *ReschedulePolicy` | `` | `*ReschedulePolicy` | [L306](file:///d:/claude/nomad/api/tasks.go#L306) |
| `String` | `r *ReschedulePolicy` | `` | `string` | [L315](file:///d:/claude/nomad/api/tasks.go#L315) |
| `NewSpreadTarget` | - | `value string, percent uint8` | `*SpreadTarget` | [L338](file:///d:/claude/nomad/api/tasks.go#L338) |
| `NewSpread` | - | `attribute string, weight int8, spreadTargets []*SpreadTarget` | `*Spread` | [L345](file:///d:/claude/nomad/api/tasks.go#L345) |
| `Canonicalize` | `s *Spread` | `` | `` | [L353](file:///d:/claude/nomad/api/tasks.go#L353) |
| `DefaultEphemeralDisk` | - | `` | `*EphemeralDisk` | [L366](file:///d:/claude/nomad/api/tasks.go#L366) |
| `Canonicalize` | `e *EphemeralDisk` | `` | `` | [L374](file:///d:/claude/nomad/api/tasks.go#L374) |
| `DefaultMigrateStrategy` | - | `` | `*MigrateStrategy` | [L395](file:///d:/claude/nomad/api/tasks.go#L395) |
| `Canonicalize` | `m *MigrateStrategy` | `` | `` | [L404](file:///d:/claude/nomad/api/tasks.go#L404) |
| `Merge` | `m *MigrateStrategy` | `o *MigrateStrategy` | `` | [L423](file:///d:/claude/nomad/api/tasks.go#L423) |
| `Copy` | `m *MigrateStrategy` | `` | `*MigrateStrategy` | [L438](file:///d:/claude/nomad/api/tasks.go#L438) |
| `Canonicalize` | `vm *VolumeMount` | `` | `` | [L477](file:///d:/claude/nomad/api/tasks.go#L477) |
| `NewTaskGroup` | - | `name string, count int` | `*TaskGroup` | [L522](file:///d:/claude/nomad/api/tasks.go#L522) |
| `Canonicalize` | `g *TaskGroup` | `job *Job` | `` | [L530](file:///d:/claude/nomad/api/tasks.go#L530) |
| `defaultServiceJobRestartPolicy` | - | `` | `*RestartPolicy` | [L642](file:///d:/claude/nomad/api/tasks.go#L642) |
| `defaultBatchJobRestartPolicy` | - | `` | `*RestartPolicy` | [L654](file:///d:/claude/nomad/api/tasks.go#L654) |
| `Constrain` | `g *TaskGroup` | `c *Constraint` | `*TaskGroup` | [L665](file:///d:/claude/nomad/api/tasks.go#L665) |
| `SetMeta` | `g *TaskGroup` | `key string, val string` | `*TaskGroup` | [L671](file:///d:/claude/nomad/api/tasks.go#L671) |
| `AddTask` | `g *TaskGroup` | `t *Task` | `*TaskGroup` | [L680](file:///d:/claude/nomad/api/tasks.go#L680) |
| `AddAffinity` | `g *TaskGroup` | `a *Affinity` | `*TaskGroup` | [L686](file:///d:/claude/nomad/api/tasks.go#L686) |
| `RequireDisk` | `g *TaskGroup` | `disk *EphemeralDisk` | `*TaskGroup` | [L692](file:///d:/claude/nomad/api/tasks.go#L692) |
| `AddSpread` | `g *TaskGroup` | `s *Spread` | `*TaskGroup` | [L698](file:///d:/claude/nomad/api/tasks.go#L698) |
| `ScalingPolicy` | `g *TaskGroup` | `sp *ScalingPolicy` | `*TaskGroup` | [L704](file:///d:/claude/nomad/api/tasks.go#L704) |
| `DefaultLogConfig` | - | `` | `*LogConfig` | [L721](file:///d:/claude/nomad/api/tasks.go#L721) |
| `Canonicalize` | `l *LogConfig` | `` | `` | [L729](file:///d:/claude/nomad/api/tasks.go#L729) |
| `Empty` | `l *TaskLifecycle` | `` | `bool` | [L758](file:///d:/claude/nomad/api/tasks.go#L758) |
| `Canonicalize` | `t *Task` | `tg *TaskGroup, job *Job` | `` | [L804](file:///d:/claude/nomad/api/tasks.go#L804) |
| `Canonicalize` | `a *TaskArtifact` | `` | `` | [L869](file:///d:/claude/nomad/api/tasks.go#L869) |
| `Copy` | `wc *WaitConfig` | `` | `*WaitConfig` | [L908](file:///d:/claude/nomad/api/tasks.go#L908) |
| `Canonicalize` | `ch *ChangeScript` | `` | `` | [L927](file:///d:/claude/nomad/api/tasks.go#L927) |
| `Canonicalize` | `tmpl *Template` | `` | `` | [L965](file:///d:/claude/nomad/api/tasks.go#L965) |
| `Canonicalize` | `v *Vault` | `` | `` | [L1030](file:///d:/claude/nomad/api/tasks.go#L1030) |
| `Canonicalize` | `s *Secret` | `` | `` | [L1062](file:///d:/claude/nomad/api/tasks.go#L1062) |
| `NewTask` | - | `name string, driver string` | `*Task` | [L1073](file:///d:/claude/nomad/api/tasks.go#L1073) |
| `SetConfig` | `t *Task` | `key string, val interface{}` | `*Task` | [L1082](file:///d:/claude/nomad/api/tasks.go#L1082) |
| `SetMeta` | `t *Task` | `key string, val string` | `*Task` | [L1091](file:///d:/claude/nomad/api/tasks.go#L1091) |
| `Require` | `t *Task` | `r *Resources` | `*Task` | [L1100](file:///d:/claude/nomad/api/tasks.go#L1100) |
| `Constrain` | `t *Task` | `c *Constraint` | `*Task` | [L1106](file:///d:/claude/nomad/api/tasks.go#L1106) |
| `AddAffinity` | `t *Task` | `a *Affinity` | `*Task` | [L1112](file:///d:/claude/nomad/api/tasks.go#L1112) |
| `SetLogConfig` | `t *Task` | `l *LogConfig` | `*Task` | [L1118](file:///d:/claude/nomad/api/tasks.go#L1118) |
| `SetLifecycle` | `t *Task` | `l *TaskLifecycle` | `*Task` | [L1124](file:///d:/claude/nomad/api/tasks.go#L1124) |
| `Canonicalize` | `t *TaskCSIPluginConfig` | `` | `` | [L1241](file:///d:/claude/nomad/api/tasks.go#L1241) |

## 5. 核心方法详解

### NewAffinity()

**签名**：`func NewAffinity(lTarget string, operand string, rTarget string, weight int8) *Affinity`

**位置**：[L237](file:///d:/claude/nomad/api/tasks.go#L237)

**中文说明**：创建并返回一个新的 Affinity 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `lTarget` | `string` | 字符串 |
| `operand` | `string` | 字符串 |
| `rTarget` | `string` | 字符串 |
| `weight` | `int8` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Affinity` | — |

### NewDefaultDisconnectStrategy()

**签名**：`func NewDefaultDisconnectStrategy() *DisconnectStrategy`

**位置**：[L252](file:///d:/claude/nomad/api/tasks.go#L252)

**中文说明**：创建并返回一个新的 DefaultDisconnectStrategy 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DisconnectStrategy` | — |

### NewDefaultReschedulePolicy()

**签名**：`func NewDefaultReschedulePolicy(jobType string) *ReschedulePolicy`

**位置**：[L260](file:///d:/claude/nomad/api/tasks.go#L260)

**中文说明**：创建并返回一个新的 DefaultReschedulePolicy 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `jobType` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ReschedulePolicy` | — |

### Copy()

**签名**：`func (r *ReschedulePolicy) Copy() *ReschedulePolicy`

**位置**：[L306](file:///d:/claude/nomad/api/tasks.go#L306)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ReschedulePolicy` | — |

### NewSpreadTarget()

**签名**：`func NewSpreadTarget(value string, percent uint8) *SpreadTarget`

**位置**：[L338](file:///d:/claude/nomad/api/tasks.go#L338)

**中文说明**：创建并返回一个新的 SpreadTarget 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `value` | `string` | 值 |
| `percent` | `uint8` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*SpreadTarget` | — |

### NewSpread()

**签名**：`func NewSpread(attribute string, weight int8, spreadTargets []*SpreadTarget) *Spread`

**位置**：[L345](file:///d:/claude/nomad/api/tasks.go#L345)

**中文说明**：创建并返回一个新的 Spread 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `attribute` | `string` | 字符串 |
| `weight` | `int8` | — |
| `spreadTargets` | `[]*SpreadTarget` | 列表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Spread` | — |

### Copy()

**签名**：`func (m *MigrateStrategy) Copy() *MigrateStrategy`

**位置**：[L438](file:///d:/claude/nomad/api/tasks.go#L438)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*MigrateStrategy` | — |

### NewTaskGroup()

**签名**：`func NewTaskGroup(name string, count int) *TaskGroup`

**位置**：[L522](file:///d:/claude/nomad/api/tasks.go#L522)

**中文说明**：创建并返回一个新的 TaskGroup 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 名称 |
| `count` | `int` | 计数 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*TaskGroup` | — |

### Copy()

**签名**：`func (wc *WaitConfig) Copy() *WaitConfig`

**位置**：[L908](file:///d:/claude/nomad/api/tasks.go#L908)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WaitConfig` | — |

### NewTask()

**签名**：`func NewTask(name string, driver string) *Task`

**位置**：[L1073](file:///d:/claude/nomad/api/tasks.go#L1073)

**中文说明**：创建并返回一个新的 Task 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 名称 |
| `driver` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Task` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `path` | 标准库 |
| `path/filepath` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [tasks_test.go](file:///d:/claude/nomad/api/tasks_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

