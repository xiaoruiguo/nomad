# driver.go 代码说明文档

> 文件路径：[plugins/drivers/driver.go](file:///d:/claude/nomad/plugins/drivers/driver.go)
> 总行数：653 行
> 所属包：`drivers`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **驱动插件接口子包**（`plugins/drivers`），定义任务驱动插件的接口规范，包括任务生命周期管理（Fingerprint、Launch、Stop、Destroy、Signal）、统计信息收集、能力声明和 gRPC 通信协议。是所有任务驱动（Docker、Java、QEMU 等）的接口契约。

## 2. 类型定义

### DriverPlugin

**定义位置**：[L51](file:///d:/claude/nomad/plugins/drivers/driver.go#L51)

**类型**：interface

```go
	base.BasePlugin
	TaskConfigSchema
	Capabilities
	Fingerprint
	RecoverTask
	StartTask
	WaitTask
	StopTask
	DestroyTask
	InspectTask
	TaskStats
	TaskEvents
	SignalTask
	ExecTask
```

### DriverShutdowner

**定义位置**：[L72](file:///d:/claude/nomad/plugins/drivers/driver.go#L72)

**类型**：interface

```go
	Shutdown
```

### DriverIniter

**定义位置**：[L83](file:///d:/claude/nomad/plugins/drivers/driver.go#L83)

**类型**：interface

```go
	Init
```

### ExecTaskStreamingDriver

**定义位置**：[L90](file:///d:/claude/nomad/plugins/drivers/driver.go#L90)

**类型**：interface

```go
	ExecTaskStreaming
```

### ExecOptions

**定义位置**：[L94](file:///d:/claude/nomad/plugins/drivers/driver.go#L94)

**类型**：struct

```go
	Command []string
	Tty bool
	Stdin io.ReadCloser
	Stdout io.WriteCloser
	Stderr io.WriteCloser
	ResizeCh chan TerminalSize
```

### DriverNetworkManager

**定义位置**：[L113](file:///d:/claude/nomad/plugins/drivers/driver.go#L113)

**类型**：interface

```go
	CreateNetwork
	DestroyNetwork
```

### DriverSignalTaskNotSupported

**定义位置**：[L121](file:///d:/claude/nomad/plugins/drivers/driver.go#L121)

**类型**：struct

**关联方法**（1 个）：`SignalTask`

### DriverExecTaskNotSupported

**定义位置**：[L130](file:///d:/claude/nomad/plugins/drivers/driver.go#L130)

**类型**：struct

**关联方法**（1 个）：`ExecTask`

### HealthState

**定义位置**：[L136](file:///d:/claude/nomad/plugins/drivers/driver.go#L136)

**类型定义**：`string`

### Fingerprint

**定义位置**：[L144](file:///d:/claude/nomad/plugins/drivers/driver.go#L144)

**类型**：struct

```go
	Attributes map[string]*pstructs.Attribute
	Health HealthState
	HealthDescription string
	Err error
```

### FSIsolation

**定义位置**：[L154](file:///d:/claude/nomad/plugins/drivers/driver.go#L154)

**类型定义**：`fsisolation.Mode`

### Capabilities

**定义位置**：[L167](file:///d:/claude/nomad/plugins/drivers/driver.go#L167)

**类型**：struct

```go
	SendSignals bool
	Exec bool
	FSIsolation fsisolation.Mode
	NetIsolationModes []NetIsolationMode
	MustInitiateNetwork bool
	MountConfigs MountConfigSupport
	DisableLogCollection bool
	DynamicWorkloadUsers bool
```

**关联方法**（1 个）：`HasNetIsolationMode`

### NetIsolationMode

**定义位置**：[L208](file:///d:/claude/nomad/plugins/drivers/driver.go#L208)

**类型定义**：`string`

### NetworkIsolationSpec

**定义位置**：[L225](file:///d:/claude/nomad/plugins/drivers/driver.go#L225)

**类型**：struct

```go
	Mode NetIsolationMode
	Path string
	Labels map[string]string
	HostsConfig *HostsConfig
```

### HostsConfig

**定义位置**：[L232](file:///d:/claude/nomad/plugins/drivers/driver.go#L232)

**类型**：struct

```go
	Hostname string
	Address string
```

### NetworkCreateRequest

**定义位置**：[L239](file:///d:/claude/nomad/plugins/drivers/driver.go#L239)

**类型**：struct

```go
	Hostname string
```

### MountConfigSupport

**定义位置**：[L248](file:///d:/claude/nomad/plugins/drivers/driver.go#L248)

**类型定义**：`int32`

### TerminalSize

**定义位置**：[L255](file:///d:/claude/nomad/plugins/drivers/driver.go#L255)

**类型**：struct

```go
	Height int
	Width int
```

### DNSConfig

**定义位置**：[L260](file:///d:/claude/nomad/plugins/drivers/driver.go#L260)

**类型**：struct

```go
	Servers []string
	Searches []string
	Options []string
```

**关联方法**（1 个）：`Copy`

### TaskConfig

**定义位置**：[L288](file:///d:/claude/nomad/plugins/drivers/driver.go#L288)

**类型**：struct

```go
	ID string
	JobName string
	JobID string
	TaskGroupName string
	ParentJobID string
	Name string
	Namespace string
	NodeName string
	NodeID string
	Env map[string]string
	DeviceEnv map[string]string
	Resources *Resources
	Devices []*DeviceConfig
	Mounts []*MountConfig
	User string
	AllocDir string
	rawDriverConfig []byte
	StdoutPath string
	StderrPath string
	AllocID string
	NetworkIsolation *NetworkIsolationSpec
	DNS *DNSConfig
```

**关联方法**（6 个）：`Copy`, `EnvList`, `TaskDir`, `DecodeDriverConfig`, `EncodeDriverConfig`, `EncodeConcreteDriverConfig`

### MemoryResources

**定义位置**：[L390](file:///d:/claude/nomad/plugins/drivers/driver.go#L390)

**类型定义**：`structs.AllocatedMemoryResources`

### Resources

**定义位置**：[L392](file:///d:/claude/nomad/plugins/drivers/driver.go#L392)

**类型**：struct

```go
	NomadResources *structs.AllocatedTaskResources
	LinuxResources *LinuxResources
	Ports *structs.AllocatedPorts
```

**关联方法**（1 个）：`Copy`

### LinuxResources

**定义位置**：[L417](file:///d:/claude/nomad/plugins/drivers/driver.go#L417)

**类型**：struct

```go
	CPUPeriod int64
	CPUQuota int64
	CPUShares int64
	MemoryLimitBytes int64
	OOMScoreAdj int64
	CpusetCpus string
	CpusetCgroupPath string
	PercentTicks float64
```

**关联方法**（1 个）：`Copy`

### DeviceConfig

**定义位置**：[L447](file:///d:/claude/nomad/plugins/drivers/driver.go#L447)

**类型**：struct

```go
	TaskPath string
	HostPath string
	Permissions string
```

**关联方法**（1 个）：`Copy`

### MountConfig

**定义位置**：[L463](file:///d:/claude/nomad/plugins/drivers/driver.go#L463)

**类型**：struct

```go
	RequestName string
	TaskPath string
	HostPath string
	Readonly bool
	PropagationMode string
	SELinuxLabel string
```

**关联方法**（2 个）：`IsEqual`, `Copy`

### TaskState

**定义位置**：[L497](file:///d:/claude/nomad/plugins/drivers/driver.go#L497)

**类型定义**：`string`

### ExitResult

**定义位置**：[L499](file:///d:/claude/nomad/plugins/drivers/driver.go#L499)

**类型**：struct

```go
	ExitCode int
	Signal int
	OOMKilled bool
	Err error
```

**关联方法**（2 个）：`Successful`, `Copy`

### TaskStatus

**定义位置**：[L519](file:///d:/claude/nomad/plugins/drivers/driver.go#L519)

**类型**：struct

```go
	ID string
	Name string
	State TaskState
	StartedAt time.Time
	CompletedAt time.Time
	ExitResult *ExitResult
	DriverAttributes map[string]string
	NetworkOverride *DriverNetwork
```

### TaskEvent

**定义位置**：[L530](file:///d:/claude/nomad/plugins/drivers/driver.go#L530)

**类型**：struct

```go
	TaskID string
	TaskName string
	AllocID string
	Timestamp time.Time
	Message string
	Annotations map[string]string
	Err error
```

### ExecTaskResult

**定义位置**：[L542](file:///d:/claude/nomad/plugins/drivers/driver.go#L542)

**类型**：struct

```go
	Stdout []byte
	Stderr []byte
	ExitResult *ExitResult
```

### DriverNetwork

**定义位置**：[L550](file:///d:/claude/nomad/plugins/drivers/driver.go#L550)

**类型**：struct

```go
	PortMap map[string]int
	IP string
	AutoAdvertise bool
```

**关联方法**（3 个）：`Advertise`, `Copy`, `Hash`

### ExecTaskStreamingRawDriver

**定义位置**：[L610](file:///d:/claude/nomad/plugins/drivers/driver.go#L610)

**类型**：interface

```go
	ExecTaskStreamingRaw
```

### ExecTaskStream

**定义位置**：[L625](file:///d:/claude/nomad/plugins/drivers/driver.go#L625)

**类型**：interface

```go
	Send
	Recv
```

### ExecTaskStreamingRequestMsg

**定义位置**：[L636](file:///d:/claude/nomad/plugins/drivers/driver.go#L636)

**类型定义**：`proto.ExecTaskStreamingRequest`

### ExecTaskStreamingResponseMsg

**定义位置**：[L637](file:///d:/claude/nomad/plugins/drivers/driver.go#L637)

**类型定义**：`proto.ExecTaskStreamingResponse`

### InternalCapabilitiesDriver

**定义位置**：[L643](file:///d:/claude/nomad/plugins/drivers/driver.go#L643)

**类型**：interface

```go
	InternalCapabilities
```

### InternalCapabilities

**定义位置**：[L649](file:///d:/claude/nomad/plugins/drivers/driver.go#L649)

**类型**：struct

```go
	DisableLogCollection bool
	DisableMetricsCollection bool
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `DriverHealthy` | `"Healthy"` |
| `Pre09TaskHandleVersion` | `0` |
| `DetachSignal` | `"DETACH"` |
| `MountConfigSupportAll` | `iota` |
| `MountConfigSupportNone` | `` |
| `TaskStateUnknown` | `"unknown"` |
| `TaskStateRunning` | `"running"` |
| `TaskStateExited` | `"exited"` |

### 变量

| 名称 | 值 |
|------|----|
| `HealthStateUndetected` | `HealthState("undetected")` |
| `HealthStateUnhealthy` | `HealthState("unhealthy")` |
| `HealthStateHealthy` | `HealthState("healthy")` |
| `FSIsolationNone` | `fsisolation.None` |
| `FSIsolationChroot` | `fsisolation.Chroot` |
| `FSIsolationImage` | `fsisolation.Image` |
| `NetIsolationModeHost` | `NetIsolationMode("host")` |
| `NetIsolationModeGroup` | `NetIsolationMode("group")` |
| `NetIsolationModeTask` | `NetIsolationMode("task")` |
| `NetIsolationModeNone` | `NetIsolationMode("none")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `SignalTask` | ` *DriverSignalTaskNotSupported` | `taskID string, signal string` | `error` | [L123](file:///d:/claude/nomad/plugins/drivers/driver.go#L123) |
| `ExecTask` | `_ *DriverExecTaskNotSupported` | `taskID string, cmd []string, timeout time.Duration` | `*ExecTaskResult, error` | [L132](file:///d:/claude/nomad/plugins/drivers/driver.go#L132) |
| `HasNetIsolationMode` | `c *Capabilities` | `m NetIsolationMode` | `bool` | [L199](file:///d:/claude/nomad/plugins/drivers/driver.go#L199) |
| `Copy` | `c *DNSConfig` | - | `*DNSConfig` | [L266](file:///d:/claude/nomad/plugins/drivers/driver.go#L266) |
| `Copy` | `tc *TaskConfig` | - | `*TaskConfig` | [L313](file:///d:/claude/nomad/plugins/drivers/driver.go#L313) |
| `EnvList` | `tc *TaskConfig` | - | `[]string` | [L343](file:///d:/claude/nomad/plugins/drivers/driver.go#L343) |
| `TaskDir` | `tc *TaskConfig` | - | `*allocdir.TaskDir` | [L353](file:///d:/claude/nomad/plugins/drivers/driver.go#L353) |
| `DecodeDriverConfig` | `tc *TaskConfig` | `t interface{}` | `error` | [L365](file:///d:/claude/nomad/plugins/drivers/driver.go#L365) |
| `EncodeDriverConfig` | `tc *TaskConfig` | `val cty.Value` | `error` | [L369](file:///d:/claude/nomad/plugins/drivers/driver.go#L369) |
| `EncodeConcreteDriverConfig` | `tc *TaskConfig` | `t interface{}` | `error` | [L379](file:///d:/claude/nomad/plugins/drivers/driver.go#L379) |
| `Copy` | `r *Resources` | - | `*Resources` | [L398](file:///d:/claude/nomad/plugins/drivers/driver.go#L398) |
| `Copy` | `r *LinuxResources` | - | `*LinuxResources` | [L441](file:///d:/claude/nomad/plugins/drivers/driver.go#L441) |
| `Copy` | `d *DeviceConfig` | - | `*DeviceConfig` | [L453](file:///d:/claude/nomad/plugins/drivers/driver.go#L453) |
| `IsEqual` | `m *MountConfig` | `o *MountConfig` | `bool` | [L472](file:///d:/claude/nomad/plugins/drivers/driver.go#L472) |
| `Copy` | `m *MountConfig` | - | `*MountConfig` | [L481](file:///d:/claude/nomad/plugins/drivers/driver.go#L481) |
| `Successful` | `r *ExitResult` | - | `bool` | [L506](file:///d:/claude/nomad/plugins/drivers/driver.go#L506) |
| `Copy` | `r *ExitResult` | - | `*ExitResult` | [L510](file:///d:/claude/nomad/plugins/drivers/driver.go#L510) |
| `Advertise` | `d *DriverNetwork` | - | `bool` | [L566](file:///d:/claude/nomad/plugins/drivers/driver.go#L566) |
| `Copy` | `d *DriverNetwork` | - | `*DriverNetwork` | [L571](file:///d:/claude/nomad/plugins/drivers/driver.go#L571) |
| `Hash` | `d *DriverNetwork` | - | `[]byte` | [L588](file:///d:/claude/nomad/plugins/drivers/driver.go#L588) |

## 5. 核心方法详解

### Copy()

**签名**：`func (c *DNSConfig) Copy() *DNSConfig`

**位置**：[L266](file:///d:/claude/nomad/plugins/drivers/driver.go#L266)

### Copy()

**签名**：`func (tc *TaskConfig) Copy() *TaskConfig`

**位置**：[L313](file:///d:/claude/nomad/plugins/drivers/driver.go#L313)

### Copy()

**签名**：`func (r *Resources) Copy() *Resources`

**位置**：[L398](file:///d:/claude/nomad/plugins/drivers/driver.go#L398)

### Copy()

**签名**：`func (r *LinuxResources) Copy() *LinuxResources`

**位置**：[L441](file:///d:/claude/nomad/plugins/drivers/driver.go#L441)

### Copy()

**签名**：`func (d *DeviceConfig) Copy() *DeviceConfig`

**位置**：[L453](file:///d:/claude/nomad/plugins/drivers/driver.go#L453)

### Copy()

**签名**：`func (m *MountConfig) Copy() *MountConfig`

**位置**：[L481](file:///d:/claude/nomad/plugins/drivers/driver.go#L481)

### Copy()

**签名**：`func (r *ExitResult) Copy() *ExitResult`

**位置**：[L510](file:///d:/claude/nomad/plugins/drivers/driver.go#L510)

### Copy()

**签名**：`func (d *DriverNetwork) Copy() *DriverNetwork`

**位置**：[L571](file:///d:/claude/nomad/plugins/drivers/driver.go#L571)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `crypto/md5` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `maps` | 标准库 |
| `path/filepath` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocdir` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/fsisolation` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/proto` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/hclspec` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/zclconf/go-cty/cty` | 第三方库 |
| `github.com/zclconf/go-cty/cty/msgpack` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **加密安全**：使用 Go crypto 标准库实现加密、签名或 TLS 通信
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|

