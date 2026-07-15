# tasks.go 代码说明文档

> 文件路径：[tasks.go](file:///d:/claude/nomad/api/tasks.go)
> 总行数：1275 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **任务（Task）相关 API 类型定义**，提供任务状态、资源等数据结构。

## 2. 类型定义

### ReconcileOption

**定义位置**：[L14](file:///d:/claude/nomad/api/tasks.go#L14)

**类型定义**：`string`

### MemoryStats

**定义位置**：[L35](file:///d:/claude/nomad/api/tasks.go#L35)

**类型**：struct

```go
	RSS uint64
	Cache uint64
	Swap uint64
	Usage uint64
	MaxUsage uint64
	KernelUsage uint64
	KernelMaxUsage uint64
	Measured []string
```

### CpuStats

**定义位置**：[L47](file:///d:/claude/nomad/api/tasks.go#L47)

**类型**：struct

```go
	SystemMode float64
	UserMode float64
	TotalTicks float64
	ThrottledPeriods uint64
	ThrottledTime uint64
	Percent float64
	Measured []string
```

### ResourceUsage

**定义位置**：[L58](file:///d:/claude/nomad/api/tasks.go#L58)

**类型**：struct

```go
	MemoryStats *MemoryStats
	CpuStats *CpuStats
	DeviceStats []*DeviceGroupStats
```

### TaskResourceUsage

**定义位置**：[L66](file:///d:/claude/nomad/api/tasks.go#L66)

**类型**：struct

```go
	ResourceUsage *ResourceUsage
	Timestamp int64
	Pids map[string]*ResourceUsage
```

### AllocResourceUsage

**定义位置**：[L74](file:///d:/claude/nomad/api/tasks.go#L74)

**类型**：struct

```go
	ResourceUsage *ResourceUsage
	Tasks map[string]*TaskResourceUsage
	Timestamp int64
```

### AllocCheckStatus

**定义位置**：[L81](file:///d:/claude/nomad/api/tasks.go#L81)

**类型**：struct

```go
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
```

### AllocCheckStatuses

**定义位置**：[L96](file:///d:/claude/nomad/api/tasks.go#L96)

**类型定义**：`map[string]AllocCheckStatus`

### RestartPolicy

**定义位置**：[L100](file:///d:/claude/nomad/api/tasks.go#L100)

**类型**：struct

```go
	Interval *time.Duration `hcl:"interval,optional"`
	Attempts *int `hcl:"attempts,optional"`
	Delay *time.Duration `hcl:"delay,optional"`
	Mode *string `hcl:"mode,optional"`
	RenderTemplates *bool `mapstructure:"render_templates" hcl:"render_templates,optional"`
```

**关联方法**（1 个）：`Merge`

### DisconnectStrategy

**定义位置**：[L128](file:///d:/claude/nomad/api/tasks.go#L128)

**类型**：struct

```go
	LostAfter *time.Duration `mapstructure:"lost_after" hcl:"lost_after,optional"`
	StopOnClientAfter *time.Duration `mapstructure:"stop_on_client_after" hcl:"stop_on_client_after,optional"`
	Replace *bool `mapstructure:"replace" hcl:"replace,optional"`
	Reconcile *ReconcileOption `mapstructure:"reconcile" hcl:"reconcile,optional"`
```

**关联方法**（1 个）：`Canonicalize`

### ReschedulePolicy

**定义位置**：[L158](file:///d:/claude/nomad/api/tasks.go#L158)

**类型**：struct

```go
	Attempts *int `mapstructure:"attempts" hcl:"attempts,optional"`
	Interval *time.Duration `mapstructure:"interval" hcl:"interval,optional"`
	Delay *time.Duration `mapstructure:"delay" hcl:"delay,optional"`
	DelayFunction *string `mapstructure:"delay_function" hcl:"delay_function,optional"`
	MaxDelay *time.Duration `mapstructure:"max_delay" hcl:"max_delay,optional"`
	Unlimited *bool `mapstructure:"unlimited" hcl:"unlimited,optional"`
```

**关联方法**（4 个）：`Merge`, `Canonicalize`, `Copy`, `String`

### Affinity

**定义位置**：[L230](file:///d:/claude/nomad/api/tasks.go#L230)

**类型**：struct

```go
	LTarget string `hcl:"attribute,optional"`
	RTarget string `hcl:"value,optional"`
	Operand string `hcl:"operator,optional"`
	Weight *int8 `hcl:"weight,optional"`
```

**关联方法**（1 个）：`Canonicalize`

### Spread

**定义位置**：[L326](file:///d:/claude/nomad/api/tasks.go#L326)

**类型**：struct

```go
	Attribute string `hcl:"attribute,optional"`
	Weight *int8 `hcl:"weight,optional"`
	SpreadTarget []*SpreadTarget `hcl:"target,block"`
```

**关联方法**（1 个）：`Canonicalize`

### SpreadTarget

**定义位置**：[L333](file:///d:/claude/nomad/api/tasks.go#L333)

**类型**：struct

```go
	Value string `hcl:",label"`
	Percent uint8 `hcl:"percent,optional"`
```

### EphemeralDisk

**定义位置**：[L360](file:///d:/claude/nomad/api/tasks.go#L360)

**类型**：struct

```go
	Sticky *bool `hcl:"sticky,optional"`
	Migrate *bool `hcl:"migrate,optional"`
	SizeMB *int `mapstructure:"size" hcl:"size,optional"`
```

**关联方法**（1 个）：`Canonicalize`

### MigrateStrategy

**定义位置**：[L388](file:///d:/claude/nomad/api/tasks.go#L388)

**类型**：struct

```go
	MaxParallel *int `mapstructure:"max_parallel" hcl:"max_parallel,optional"`
	HealthCheck *string `mapstructure:"health_check" hcl:"health_check,optional"`
	MinHealthyTime *time.Duration `mapstructure:"min_healthy_time" hcl:"min_healthy_time,optional"`
	HealthyDeadline *time.Duration `mapstructure:"healthy_deadline" hcl:"healthy_deadline,optional"`
```

**关联方法**（3 个）：`Canonicalize`, `Merge`, `Copy`

### VolumeRequest

**定义位置**：[L448](file:///d:/claude/nomad/api/tasks.go#L448)

**类型**：struct

```go
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
```

### VolumeMount

**定义位置**：[L469](file:///d:/claude/nomad/api/tasks.go#L469)

**类型**：struct

```go
	Volume *string `hcl:"volume,optional"`
	Destination *string `hcl:"destination,optional"`
	ReadOnly *bool `mapstructure:"read_only" hcl:"read_only,optional"`
	PropagationMode *string `mapstructure:"propagation_mode" hcl:"propagation_mode,optional"`
	SELinuxLabel *string `mapstructure:"selinux_label" hcl:"selinux_label,optional"`
```

**关联方法**（1 个）：`Canonicalize`

### TaskGroup

**定义位置**：[L492](file:///d:/claude/nomad/api/tasks.go#L492)

**类型**：struct

```go
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
```

**关联方法**（8 个）：`Canonicalize`, `Constrain`, `SetMeta`, `AddTask`, `AddAffinity`, `RequireDisk`, `AddSpread`, `ScalingPolicy`

### LogConfig

**定义位置**：[L710](file:///d:/claude/nomad/api/tasks.go#L710)

**类型**：struct

```go
	MaxFiles *int `mapstructure:"max_files" hcl:"max_files,optional"`
	MaxFileSizeMB *int `mapstructure:"max_file_size" hcl:"max_file_size,optional"`
	Enabled *bool `mapstructure:"enabled" hcl:"enabled,optional"`
	Disabled *bool `mapstructure:"disabled" hcl:"disabled,optional"`
```

**关联方法**（1 个）：`Canonicalize`

### DispatchPayloadConfig

**定义位置**：[L742](file:///d:/claude/nomad/api/tasks.go#L742)

**类型**：struct

```go
	File string `hcl:"file,optional"`
```

### TaskLifecycle

**定义位置**：[L752](file:///d:/claude/nomad/api/tasks.go#L752)

**类型**：struct

```go
	Hook string `mapstructure:"hook" hcl:"hook"`
	Sidecar bool `mapstructure:"sidecar" hcl:"sidecar,optional"`
```

**关联方法**（1 个）：`Empty`

### Task

**定义位置**：[L763](file:///d:/claude/nomad/api/tasks.go#L763)

**类型**：struct

```go
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
```

**关联方法**（8 个）：`Canonicalize`, `SetConfig`, `SetMeta`, `Require`, `Constrain`, `AddAffinity`, `SetLogConfig`, `SetLifecycle`

### TaskArtifact

**定义位置**：[L859](file:///d:/claude/nomad/api/tasks.go#L859)

**类型**：struct

```go
	GetterSource *string `mapstructure:"source" hcl:"source,optional"`
	GetterOptions map[string]string `mapstructure:"options" hcl:"options,block"`
	GetterHeaders map[string]string `mapstructure:"headers" hcl:"headers,block"`
	GetterMode *string `mapstructure:"mode" hcl:"mode,optional"`
	GetterInsecure *bool `mapstructure:"insecure" hcl:"insecure,optional"`
	RelativeDest *string `mapstructure:"destination" hcl:"destination,optional"`
	Chown bool `mapstructure:"chown" hcl:"chown,optional"`
```

**关联方法**（1 个）：`Canonicalize`

### WaitConfig

**定义位置**：[L903](file:///d:/claude/nomad/api/tasks.go#L903)

**类型**：struct

```go
	Min *time.Duration `mapstructure:"min" hcl:"min"`
	Max *time.Duration `mapstructure:"max" hcl:"max"`
```

**关联方法**（1 个）：`Copy`

### ChangeScript

**定义位置**：[L919](file:///d:/claude/nomad/api/tasks.go#L919)

**类型**：struct

```go
	Command *string `mapstructure:"command" hcl:"command"`
	Args []string `mapstructure:"args" hcl:"args,optional"`
	Timeout *time.Duration `mapstructure:"timeout" hcl:"timeout,optional"`
	FailOnError *bool `mapstructure:"fail_on_error" hcl:"fail_on_error"`
	RunOnFirstRender *bool `mapstructure:"run_on_first_render" hcl:"run_on_first_render,optional"`
```

**关联方法**（1 个）：`Canonicalize`

### Template

**定义位置**：[L945](file:///d:/claude/nomad/api/tasks.go#L945)

**类型**：struct

```go
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
```

**关联方法**（1 个）：`Canonicalize`

### Vault

**定义位置**：[L1018](file:///d:/claude/nomad/api/tasks.go#L1018)

**类型**：struct

```go
	Policies []string `hcl:"policies,optional"`
	Role string `hcl:"role,optional"`
	Namespace *string `mapstructure:"namespace" hcl:"namespace,optional"`
	Cluster string `hcl:"cluster,optional"`
	Env *bool `hcl:"env,optional"`
	DisableFile *bool `mapstructure:"disable_file" hcl:"disable_file,optional"`
	ChangeMode *string `mapstructure:"change_mode" hcl:"change_mode,optional"`
	ChangeSignal *string `mapstructure:"change_signal" hcl:"change_signal,optional"`
	AllowTokenExpiration *bool `mapstructure:"allow_token_expiration" hcl:"allow_token_expiration,optional"`
```

**关联方法**（1 个）：`Canonicalize`

### Secret

**定义位置**：[L1054](file:///d:/claude/nomad/api/tasks.go#L1054)

**类型**：struct

```go
	Name string `hcl:"name,label"`
	Provider string `hcl:"provider,optional"`
	Path string `hcl:"path,optional"`
	Config map[string]any `hcl:"config,block"`
	Env map[string]string `hcl:"env,block"`
```

**关联方法**（1 个）：`Canonicalize`

### TaskState

**定义位置**：[L1131](file:///d:/claude/nomad/api/tasks.go#L1131)

**类型**：struct

```go
	State string
	Failed bool
	Restarts uint64
	LastRestart time.Time
	StartedAt time.Time
	FinishedAt time.Time
	Events []*TaskEvent
```

### TaskEvent

**定义位置**：[L1166](file:///d:/claude/nomad/api/tasks.go#L1166)

**类型**：struct

```go
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
```

### CSIPluginType

**定义位置**：[L1198](file:///d:/claude/nomad/api/tasks.go#L1198)

**类型定义**：`string`

### TaskCSIPluginConfig

**定义位置**：[L1217](file:///d:/claude/nomad/api/tasks.go#L1217)

**类型**：struct

```go
	ID string `mapstructure:"id" hcl:"id,optional"`
	Type CSIPluginType `mapstructure:"type" hcl:"type,optional"`
	MountDir string `mapstructure:"mount_dir" hcl:"mount_dir,optional"`
	StagePublishBaseDir string `mapstructure:"stage_publish_base_dir" hcl:"stage_publish_base_dir,optional"`
	HealthTimeout time.Duration `mapstructure:"health_timeout" hcl:"health_timeout,optional"`
```

**关联方法**（1 个）：`Canonicalize`

### WorkloadIdentity

**定义位置**：[L1257](file:///d:/claude/nomad/api/tasks.go#L1257)

**类型**：struct

```go
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
```

### Action

**定义位置**：[L1270](file:///d:/claude/nomad/api/tasks.go#L1270)

**类型**：struct

```go
	Name string `hcl:"name,label"`
	Command string `mapstructure:"command" hcl:"command"`
	Args []string `mapstructure:"args" hcl:"args,optional"`
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `RestartPolicyModeDelay` | `"delay"` |
| `RestartPolicyModeFail` | `"fail"` |
| `ReconcileOptionKeepOriginal` | `"keep_original"` |
| `ReconcileOptionKeepReplacement` | `"keep_replacement"` |
| `ReconcileOptionBestScore` | `"best_score"` |
| `ReconcileOptionLongestRunning` | `"longest_running"` |
| `VolumeMountPropagationPrivate` | `"private"` |
| `VolumeMountPropagationHostToTask` | `"host-to-task"` |
| `VolumeMountPropagationBidirectional` | `"bidirectional"` |
| `TaskLifecycleHookPrestart` | `"prestart"` |
| `TaskLifecycleHookPoststart` | `"poststart"` |
| `TaskLifecycleHookPoststop` | `"poststop"` |
| `TaskSetup` | `"Task Setup"` |
| `TaskSetupFailure` | `"Setup Failure"` |
| `TaskDriverFailure` | `"Driver Failure"` |
| `TaskDriverMessage` | `"Driver"` |
| `TaskReceived` | `"Received"` |
| `TaskFailedValidation` | `"Failed Validation"` |
| `TaskStarted` | `"Started"` |
| `TaskTerminated` | `"Terminated"` |
| `TaskKilling` | `"Killing"` |
| `TaskKilled` | `"Killed"` |
| `TaskRestarting` | `"Restarting"` |
| `TaskNotRestarting` | `"Not Restarting"` |
| `TaskDownloadingArtifacts` | `"Downloading Artifacts"` |
| `TaskArtifactDownloadFailed` | `"Failed Artifact Download"` |
| `TaskSiblingFailed` | `"Sibling Task Failed"` |
| `TaskSignaling` | `"Signaling"` |
| `TaskRestartSignal` | `"Restart Signaled"` |
| `TaskLeaderDead` | `"Leader Task Dead"` |
| `TaskBuildingTaskDir` | `"Building Task Directory"` |
| `TaskClientReconnected` | `"Reconnected"` |
| `CSIPluginTypeNode` | `"node"` |
| `CSIPluginTypeController` | `"controller"` |
| `CSIPluginTypeMonolith` | `"monolith"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Merge` | `r *RestartPolicy` | `rp *RestartPolicy` | - | [L108](file:///d:/claude/nomad/api/tasks.go#L108) |
| `Canonicalize` | `ds *DisconnectStrategy` | - | - | [L147](file:///d:/claude/nomad/api/tasks.go#L147) |
| `Merge` | `r *ReschedulePolicy` | `rp *ReschedulePolicy` | - | [L180](file:///d:/claude/nomad/api/tasks.go#L180) |
| `Canonicalize` | `r *ReschedulePolicy` | `jobType string` | - | [L204](file:///d:/claude/nomad/api/tasks.go#L204) |
| `NewAffinity` | - | `lTarget string, operand string, rTarget string, weight int8` | `*Affinity` | [L237](file:///d:/claude/nomad/api/tasks.go#L237) |
| `Canonicalize` | `a *Affinity` | - | - | [L246](file:///d:/claude/nomad/api/tasks.go#L246) |
| `NewDefaultDisconnectStrategy` | - | - | `*DisconnectStrategy` | [L252](file:///d:/claude/nomad/api/tasks.go#L252) |
| `NewDefaultReschedulePolicy` | - | `jobType string` | `*ReschedulePolicy` | [L260](file:///d:/claude/nomad/api/tasks.go#L260) |
| `Copy` | `r *ReschedulePolicy` | - | `*ReschedulePolicy` | [L306](file:///d:/claude/nomad/api/tasks.go#L306) |
| `String` | `r *ReschedulePolicy` | - | `string` | [L315](file:///d:/claude/nomad/api/tasks.go#L315) |
| `NewSpreadTarget` | - | `value string, percent uint8` | `*SpreadTarget` | [L338](file:///d:/claude/nomad/api/tasks.go#L338) |
| `NewSpread` | - | `attribute string, weight int8, spreadTargets []*SpreadTarget` | `*Spread` | [L345](file:///d:/claude/nomad/api/tasks.go#L345) |
| `Canonicalize` | `s *Spread` | - | - | [L353](file:///d:/claude/nomad/api/tasks.go#L353) |
| `DefaultEphemeralDisk` | - | - | `*EphemeralDisk` | [L366](file:///d:/claude/nomad/api/tasks.go#L366) |
| `Canonicalize` | `e *EphemeralDisk` | - | - | [L374](file:///d:/claude/nomad/api/tasks.go#L374) |
| `DefaultMigrateStrategy` | - | - | `*MigrateStrategy` | [L395](file:///d:/claude/nomad/api/tasks.go#L395) |
| `Canonicalize` | `m *MigrateStrategy` | - | - | [L404](file:///d:/claude/nomad/api/tasks.go#L404) |
| `Merge` | `m *MigrateStrategy` | `o *MigrateStrategy` | - | [L423](file:///d:/claude/nomad/api/tasks.go#L423) |
| `Copy` | `m *MigrateStrategy` | - | `*MigrateStrategy` | [L438](file:///d:/claude/nomad/api/tasks.go#L438) |
| `Canonicalize` | `vm *VolumeMount` | - | - | [L477](file:///d:/claude/nomad/api/tasks.go#L477) |
| `NewTaskGroup` | - | `name string, count int` | `*TaskGroup` | [L522](file:///d:/claude/nomad/api/tasks.go#L522) |
| `Canonicalize` | `g *TaskGroup` | `job *Job` | - | [L530](file:///d:/claude/nomad/api/tasks.go#L530) |
| `defaultServiceJobRestartPolicy` | - | - | `*RestartPolicy` | [L642](file:///d:/claude/nomad/api/tasks.go#L642) |
| `defaultBatchJobRestartPolicy` | - | - | `*RestartPolicy` | [L654](file:///d:/claude/nomad/api/tasks.go#L654) |
| `Constrain` | `g *TaskGroup` | `c *Constraint` | `*TaskGroup` | [L665](file:///d:/claude/nomad/api/tasks.go#L665) |
| `SetMeta` | `g *TaskGroup` | `key string, val string` | `*TaskGroup` | [L671](file:///d:/claude/nomad/api/tasks.go#L671) |
| `AddTask` | `g *TaskGroup` | `t *Task` | `*TaskGroup` | [L680](file:///d:/claude/nomad/api/tasks.go#L680) |
| `AddAffinity` | `g *TaskGroup` | `a *Affinity` | `*TaskGroup` | [L686](file:///d:/claude/nomad/api/tasks.go#L686) |
| `RequireDisk` | `g *TaskGroup` | `disk *EphemeralDisk` | `*TaskGroup` | [L692](file:///d:/claude/nomad/api/tasks.go#L692) |
| `AddSpread` | `g *TaskGroup` | `s *Spread` | `*TaskGroup` | [L698](file:///d:/claude/nomad/api/tasks.go#L698) |
| `ScalingPolicy` | `g *TaskGroup` | `sp *ScalingPolicy` | `*TaskGroup` | [L704](file:///d:/claude/nomad/api/tasks.go#L704) |
| `DefaultLogConfig` | - | - | `*LogConfig` | [L721](file:///d:/claude/nomad/api/tasks.go#L721) |
| `Canonicalize` | `l *LogConfig` | - | - | [L729](file:///d:/claude/nomad/api/tasks.go#L729) |
| `Empty` | `l *TaskLifecycle` | - | `bool` | [L758](file:///d:/claude/nomad/api/tasks.go#L758) |
| `Canonicalize` | `t *Task` | `tg *TaskGroup, job *Job` | - | [L804](file:///d:/claude/nomad/api/tasks.go#L804) |
| `Canonicalize` | `a *TaskArtifact` | - | - | [L869](file:///d:/claude/nomad/api/tasks.go#L869) |
| `Copy` | `wc *WaitConfig` | - | `*WaitConfig` | [L908](file:///d:/claude/nomad/api/tasks.go#L908) |
| `Canonicalize` | `ch *ChangeScript` | - | - | [L927](file:///d:/claude/nomad/api/tasks.go#L927) |
| `Canonicalize` | `tmpl *Template` | - | - | [L965](file:///d:/claude/nomad/api/tasks.go#L965) |
| `Canonicalize` | `v *Vault` | - | - | [L1030](file:///d:/claude/nomad/api/tasks.go#L1030) |
| `Canonicalize` | `s *Secret` | - | - | [L1062](file:///d:/claude/nomad/api/tasks.go#L1062) |
| `NewTask` | - | `name string, driver string` | `*Task` | [L1073](file:///d:/claude/nomad/api/tasks.go#L1073) |
| `SetConfig` | `t *Task` | `key string, val interface{}` | `*Task` | [L1082](file:///d:/claude/nomad/api/tasks.go#L1082) |
| `SetMeta` | `t *Task` | `key string, val string` | `*Task` | [L1091](file:///d:/claude/nomad/api/tasks.go#L1091) |
| `Require` | `t *Task` | `r *Resources` | `*Task` | [L1100](file:///d:/claude/nomad/api/tasks.go#L1100) |
| `Constrain` | `t *Task` | `c *Constraint` | `*Task` | [L1106](file:///d:/claude/nomad/api/tasks.go#L1106) |
| `AddAffinity` | `t *Task` | `a *Affinity` | `*Task` | [L1112](file:///d:/claude/nomad/api/tasks.go#L1112) |
| `SetLogConfig` | `t *Task` | `l *LogConfig` | `*Task` | [L1118](file:///d:/claude/nomad/api/tasks.go#L1118) |
| `SetLifecycle` | `t *Task` | `l *TaskLifecycle` | `*Task` | [L1124](file:///d:/claude/nomad/api/tasks.go#L1124) |
| `Canonicalize` | `t *TaskCSIPluginConfig` | - | - | [L1241](file:///d:/claude/nomad/api/tasks.go#L1241) |

## 5. 核心方法详解

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

- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [tasks_test.go](file:///d:/claude/nomad/api/tasks_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

