# driver.go 代码说明文档

> 文件路径：[plugins/drivers/driver.go](file:///d:/claude/nomad/plugins/drivers/driver.go)
> 总行数：653 行
> 所属包：`drivers`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **驱动插件接口子包**（`plugins/drivers`），定义任务驱动插件的接口规范，包括任务生命周期管理（Fingerprint、Launch、Stop、Destroy、Signal）、统计信息收集、能力声明和 gRPC 通信协议。

## 2. 类型定义

### DriverPlugin

**定义位置**：[L51](file:///d:/claude/nomad/plugins/drivers/driver.go#L51)

**中文说明**：DriverPlugin 与任务驱动（Driver）相关，驱动负责任务的实际执行。

**类型**：interface

```go
type DriverPlugin interface {
	base.BasePlugin base.BasePlugin
	TaskConfigSchema func(...)
	Capabilities func(...)
	Fingerprint func(...)
	RecoverTask func(...)
	StartTask func(...)
	WaitTask func(...)
	StopTask func(...)
	DestroyTask func(...)
	InspectTask func(...)
	TaskStats func(...)
	TaskEvents func(...)
	SignalTask func(...)
	ExecTask func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `base.BasePlugin` | `base.BasePlugin` | — |
| `TaskConfigSchema` | `func(...)` | — |
| `Capabilities` | `func(...)` | — |
| `Fingerprint` | `func(...)` | — |
| `RecoverTask` | `func(...)` | — |
| `StartTask` | `func(...)` | 启动Task。 |
| `WaitTask` | `func(...)` | — |
| `StopTask` | `func(...)` | 停止Task。 |
| `DestroyTask` | `func(...)` | — |
| `InspectTask` | `func(...)` | — |
| `TaskStats` | `func(...)` | — |
| `TaskEvents` | `func(...)` | — |
| `SignalTask` | `func(...)` | — |
| `ExecTask` | `func(...)` | — |

### DriverShutdowner

**定义位置**：[L72](file:///d:/claude/nomad/plugins/drivers/driver.go#L72)

**中文说明**：DriverShutdowner 与任务驱动（Driver）相关，驱动负责任务的实际执行。

**类型**：interface

```go
type DriverShutdowner interface {
	Shutdown func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Shutdown` | `func(...)` | 关闭对象，释放相关资源。 |

### DriverIniter

**定义位置**：[L83](file:///d:/claude/nomad/plugins/drivers/driver.go#L83)

**中文说明**：DriverIniter 与任务驱动（Driver）相关，驱动负责任务的实际执行。

**类型**：interface

```go
type DriverIniter interface {
	Init func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Init` | `func(...)` | 初始化对象。 |

### ExecTaskStreamingDriver

**定义位置**：[L90](file:///d:/claude/nomad/plugins/drivers/driver.go#L90)

**中文说明**：ExecTaskStreamingDriver 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：interface

```go
type ExecTaskStreamingDriver interface {
	ExecTaskStreaming func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `ExecTaskStreaming` | `func(...)` | — |

### ExecOptions

**定义位置**：[L94](file:///d:/claude/nomad/plugins/drivers/driver.go#L94)

**中文说明**：ExecOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type ExecOptions struct {
	Command []string
	Tty bool
	Stdin io.ReadCloser
	Stdout io.WriteCloser
	Stderr io.WriteCloser
	ResizeCh <-chan TerminalSize
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Command` | `[]string` | 列表 |
| `Tty` | `bool` | 布尔值 |
| `Stdin` | `io.ReadCloser` | — |
| `Stdout` | `io.WriteCloser` | — |
| `Stderr` | `io.WriteCloser` | — |
| `ResizeCh` | `<-chan TerminalSize` | 通道 |

### DriverNetworkManager

**定义位置**：[L113](file:///d:/claude/nomad/plugins/drivers/driver.go#L113)

**中文说明**：DriverNetworkManager 是一个管理器，负责协调和管理相关资源的生命周期。

**类型**：interface

```go
type DriverNetworkManager interface {
	CreateNetwork func(...)
	DestroyNetwork func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `CreateNetwork` | `func(...)` | 创建新的Network。 |
| `DestroyNetwork` | `func(...)` | — |

### DriverSignalTaskNotSupported

**定义位置**：[L121](file:///d:/claude/nomad/plugins/drivers/driver.go#L121)

**中文说明**：DriverSignalTaskNotSupported 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

**关联方法**（1 个）：`SignalTask`

### DriverExecTaskNotSupported

**定义位置**：[L130](file:///d:/claude/nomad/plugins/drivers/driver.go#L130)

**中文说明**：DriverExecTaskNotSupported 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

**关联方法**（1 个）：`ExecTask`

### HealthState

**定义位置**：[L136](file:///d:/claude/nomad/plugins/drivers/driver.go#L136)

**类型定义**：`type HealthState string`

### Fingerprint

**定义位置**：[L144](file:///d:/claude/nomad/plugins/drivers/driver.go#L144)

**中文说明**：Fingerprint 与指纹采集（Fingerprint）相关，收集节点硬件和软件信息。

**类型**：struct

```go
type Fingerprint struct {
	Attributes map[string]*pstructs.Attribute
	Health HealthState
	HealthDescription string
	Err error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Attributes` | `map[string]*pstructs.Attribute` | 映射表 |
| `Health` | `HealthState` | — |
| `HealthDescription` | `string` | 字符串 |
| `Err` | `error` | 错误信息 |

### FSIsolation

**定义位置**：[L154](file:///d:/claude/nomad/plugins/drivers/driver.go#L154)

**类型定义**：`type FSIsolation fsisolation.Mode`

### Capabilities

**定义位置**：[L167](file:///d:/claude/nomad/plugins/drivers/driver.go#L167)

**中文说明**：Capabilities 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Capabilities struct {
	SendSignals bool
	Exec bool
	FSIsolation fsisolation.Mode
	NetIsolationModes []NetIsolationMode
	MustInitiateNetwork bool
	MountConfigs MountConfigSupport
	DisableLogCollection bool
	DynamicWorkloadUsers bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SendSignals` | `bool` | 布尔值 |
| `Exec` | `bool` | 布尔值 |
| `FSIsolation` | `fsisolation.Mode` | — |
| `NetIsolationModes` | `[]NetIsolationMode` | 列表 |
| `MustInitiateNetwork` | `bool` | 布尔值 |
| `MountConfigs` | `MountConfigSupport` | — |
| `DisableLogCollection` | `bool` | 布尔值 |
| `DynamicWorkloadUsers` | `bool` | 布尔值 |

**关联方法**（1 个）：`HasNetIsolationMode`

### NetIsolationMode

**定义位置**：[L208](file:///d:/claude/nomad/plugins/drivers/driver.go#L208)

**类型定义**：`type NetIsolationMode string`

### NetworkIsolationSpec

**定义位置**：[L225](file:///d:/claude/nomad/plugins/drivers/driver.go#L225)

**中文说明**：NetworkIsolationSpec 是一个规格定义结构体，描述对象的规格参数。

**类型**：struct

```go
type NetworkIsolationSpec struct {
	Mode NetIsolationMode
	Path string
	Labels map[string]string
	HostsConfig *HostsConfig
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Mode` | `NetIsolationMode` | — |
| `Path` | `string` | 路径 |
| `Labels` | `map[string]string` | 标签 |
| `HostsConfig` | `*HostsConfig` | — |

### HostsConfig

**定义位置**：[L232](file:///d:/claude/nomad/plugins/drivers/driver.go#L232)

**中文说明**：HostsConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type HostsConfig struct {
	Hostname string
	Address string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Hostname` | `string` | 字符串 |
| `Address` | `string` | 地址 |

### NetworkCreateRequest

**定义位置**：[L239](file:///d:/claude/nomad/plugins/drivers/driver.go#L239)

**中文说明**：NetworkCreateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NetworkCreateRequest struct {
	Hostname string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Hostname` | `string` | 字符串 |

### MountConfigSupport

**定义位置**：[L248](file:///d:/claude/nomad/plugins/drivers/driver.go#L248)

**类型定义**：`type MountConfigSupport int32`

### TerminalSize

**定义位置**：[L255](file:///d:/claude/nomad/plugins/drivers/driver.go#L255)

**中文说明**：TerminalSize 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type TerminalSize struct {
	Height int
	Width int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Height` | `int` | — |
| `Width` | `int` | — |

### DNSConfig

**定义位置**：[L260](file:///d:/claude/nomad/plugins/drivers/driver.go#L260)

**中文说明**：DNSConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type DNSConfig struct {
	Servers []string
	Searches []string
	Options []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Servers` | `[]string` | 列表 |
| `Searches` | `[]string` | 列表 |
| `Options` | `[]string` | 选项 |

**关联方法**（1 个）：`Copy`

### TaskConfig

**定义位置**：[L288](file:///d:/claude/nomad/plugins/drivers/driver.go#L288)

**中文说明**：TaskConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type TaskConfig struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `JobName` | `string` | 字符串 |
| `JobID` | `string` | 字符串 |
| `TaskGroupName` | `string` | 字符串 |
| `ParentJobID` | `string` | 字符串 |
| `Name` | `string` | 名称 |
| `Namespace` | `string` | 命名空间 |
| `NodeName` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `Env` | `map[string]string` | 映射表 |
| `DeviceEnv` | `map[string]string` | 映射表 |
| `Resources` | `*Resources` | — |
| `Devices` | `[]*DeviceConfig` | 列表 |
| `Mounts` | `[]*MountConfig` | 列表 |
| `User` | `string` | 字符串 |
| `AllocDir` | `string` | 字符串 |
| `rawDriverConfig` | `[]byte` | 字节数组 |
| `StdoutPath` | `string` | 字符串 |
| `StderrPath` | `string` | 字符串 |
| `AllocID` | `string` | 字符串 |
| `NetworkIsolation` | `*NetworkIsolationSpec` | — |
| `DNS` | `*DNSConfig` | — |

**关联方法**（6 个）：`Copy`, `EnvList`, `TaskDir`, `DecodeDriverConfig`, `EncodeDriverConfig`, `EncodeConcreteDriverConfig`

### MemoryResources

**定义位置**：[L390](file:///d:/claude/nomad/plugins/drivers/driver.go#L390)

**类型定义**：`type MemoryResources structs.AllocatedMemoryResources`

### Resources

**定义位置**：[L392](file:///d:/claude/nomad/plugins/drivers/driver.go#L392)

**中文说明**：Resources 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Resources struct {
	NomadResources *structs.AllocatedTaskResources
	LinuxResources *LinuxResources
	Ports *structs.AllocatedPorts
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NomadResources` | `*structs.AllocatedTaskResources` | — |
| `LinuxResources` | `*LinuxResources` | — |
| `Ports` | `*structs.AllocatedPorts` | — |

**关联方法**（1 个）：`Copy`

### LinuxResources

**定义位置**：[L417](file:///d:/claude/nomad/plugins/drivers/driver.go#L417)

**中文说明**：LinuxResources 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type LinuxResources struct {
	CPUPeriod int64
	CPUQuota int64
	CPUShares int64
	MemoryLimitBytes int64
	OOMScoreAdj int64
	CpusetCpus string
	CpusetCgroupPath string
	PercentTicks float64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CPUPeriod` | `int64` | — |
| `CPUQuota` | `int64` | — |
| `CPUShares` | `int64` | — |
| `MemoryLimitBytes` | `int64` | — |
| `OOMScoreAdj` | `int64` | — |
| `CpusetCpus` | `string` | 字符串 |
| `CpusetCgroupPath` | `string` | 字符串 |
| `PercentTicks` | `float64` | — |

**关联方法**（1 个）：`Copy`

### DeviceConfig

**定义位置**：[L447](file:///d:/claude/nomad/plugins/drivers/driver.go#L447)

**中文说明**：DeviceConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type DeviceConfig struct {
	TaskPath string
	HostPath string
	Permissions string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TaskPath` | `string` | 字符串 |
| `HostPath` | `string` | 字符串 |
| `Permissions` | `string` | 字符串 |

**关联方法**（1 个）：`Copy`

### MountConfig

**定义位置**：[L463](file:///d:/claude/nomad/plugins/drivers/driver.go#L463)

**中文说明**：MountConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type MountConfig struct {
	RequestName string
	TaskPath string
	HostPath string
	Readonly bool
	PropagationMode string
	SELinuxLabel string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `RequestName` | `string` | 字符串 |
| `TaskPath` | `string` | 字符串 |
| `HostPath` | `string` | 字符串 |
| `Readonly` | `bool` | 布尔值 |
| `PropagationMode` | `string` | 字符串 |
| `SELinuxLabel` | `string` | 字符串 |

**关联方法**（2 个）：`IsEqual`, `Copy`

### TaskState

**定义位置**：[L497](file:///d:/claude/nomad/plugins/drivers/driver.go#L497)

**中文说明**：TaskState 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型定义**：`type TaskState string`

### ExitResult

**定义位置**：[L499](file:///d:/claude/nomad/plugins/drivers/driver.go#L499)

**中文说明**：ExitResult 是一个结果结构体，封装操作执行的结果。

**类型**：struct

```go
type ExitResult struct {
	ExitCode int
	Signal int
	OOMKilled bool
	Err error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExitCode` | `int` | — |
| `Signal` | `int` | — |
| `OOMKilled` | `bool` | 布尔值 |
| `Err` | `error` | 错误信息 |

**关联方法**（2 个）：`Successful`, `Copy`

### TaskStatus

**定义位置**：[L519](file:///d:/claude/nomad/plugins/drivers/driver.go#L519)

**中文说明**：TaskStatus 是一个状态结构体，描述对象或操作的当前状态。

**类型**：struct

```go
type TaskStatus struct {
	ID string
	Name string
	State TaskState
	StartedAt time.Time
	CompletedAt time.Time
	ExitResult *ExitResult
	DriverAttributes map[string]string
	NetworkOverride *DriverNetwork
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Name` | `string` | 名称 |
| `State` | `TaskState` | 状态 |
| `StartedAt` | `time.Time` | 时间点 |
| `CompletedAt` | `time.Time` | 时间点 |
| `ExitResult` | `*ExitResult` | — |
| `DriverAttributes` | `map[string]string` | 映射表 |
| `NetworkOverride` | `*DriverNetwork` | — |

### TaskEvent

**定义位置**：[L530](file:///d:/claude/nomad/plugins/drivers/driver.go#L530)

**中文说明**：TaskEvent 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskEvent struct {
	TaskID string
	TaskName string
	AllocID string
	Timestamp time.Time
	Message string
	Annotations map[string]string
	Err error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TaskID` | `string` | 字符串 |
| `TaskName` | `string` | 字符串 |
| `AllocID` | `string` | 字符串 |
| `Timestamp` | `time.Time` | 时间戳 |
| `Message` | `string` | 消息 |
| `Annotations` | `map[string]string` | 映射表 |
| `Err` | `error` | 错误信息 |

### ExecTaskResult

**定义位置**：[L542](file:///d:/claude/nomad/plugins/drivers/driver.go#L542)

**中文说明**：ExecTaskResult 是一个结果结构体，封装操作执行的结果。

**类型**：struct

```go
type ExecTaskResult struct {
	Stdout []byte
	Stderr []byte
	ExitResult *ExitResult
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Stdout` | `[]byte` | 字节数组 |
| `Stderr` | `[]byte` | 字节数组 |
| `ExitResult` | `*ExitResult` | — |

### DriverNetwork

**定义位置**：[L550](file:///d:/claude/nomad/plugins/drivers/driver.go#L550)

**中文说明**：DriverNetwork 与任务驱动（Driver）相关，驱动负责任务的实际执行。

**类型**：struct

```go
type DriverNetwork struct {
	PortMap map[string]int
	IP string
	AutoAdvertise bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PortMap` | `map[string]int` | 映射表 |
| `IP` | `string` | 字符串 |
| `AutoAdvertise` | `bool` | 布尔值 |

**关联方法**（3 个）：`Advertise`, `Copy`, `Hash`

### ExecTaskStreamingRawDriver

**定义位置**：[L610](file:///d:/claude/nomad/plugins/drivers/driver.go#L610)

**中文说明**：ExecTaskStreamingRawDriver 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：interface

```go
type ExecTaskStreamingRawDriver interface {
	ExecTaskStreamingRaw func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `ExecTaskStreamingRaw` | `func(...)` | — |

### ExecTaskStream

**定义位置**：[L625](file:///d:/claude/nomad/plugins/drivers/driver.go#L625)

**中文说明**：ExecTaskStream 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：interface

```go
type ExecTaskStream interface {
	Send func(...)
	Recv func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Send` | `func(...)` | — |
| `Recv` | `func(...)` | — |

### ExecTaskStreamingRequestMsg

**定义位置**：[L636](file:///d:/claude/nomad/plugins/drivers/driver.go#L636)

**中文说明**：ExecTaskStreamingRequestMsg 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型定义**：`type ExecTaskStreamingRequestMsg proto.ExecTaskStreamingRequest`

### ExecTaskStreamingResponseMsg

**定义位置**：[L637](file:///d:/claude/nomad/plugins/drivers/driver.go#L637)

**中文说明**：ExecTaskStreamingResponseMsg 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型定义**：`type ExecTaskStreamingResponseMsg proto.ExecTaskStreamingResponse`

### InternalCapabilitiesDriver

**定义位置**：[L643](file:///d:/claude/nomad/plugins/drivers/driver.go#L643)

**中文说明**：InternalCapabilitiesDriver 与任务驱动（Driver）相关，驱动负责任务的实际执行。

**类型**：interface

```go
type InternalCapabilitiesDriver interface {
	InternalCapabilities func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `InternalCapabilities` | `func(...)` | — |

### InternalCapabilities

**定义位置**：[L649](file:///d:/claude/nomad/plugins/drivers/driver.go#L649)

**中文说明**：InternalCapabilities 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type InternalCapabilities struct {
	DisableLogCollection bool
	DisableMetricsCollection bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DisableLogCollection` | `bool` | 布尔值 |
| `DisableMetricsCollection` | `bool` | 布尔值 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `DriverHealthy` | `—` | `"Healthy"` | — |
| `Pre09TaskHandleVersion` | `—` | `0` | — |
| `DetachSignal` | `—` | `"DETACH"` | — |
| `MountConfigSupportAll` | `MountConfigSupport` | `iota` | — |
| `MountConfigSupportNone` | `—` | `` | — |
| `TaskStateUnknown` | `TaskState` | `"unknown"` | — |
| `TaskStateRunning` | `TaskState` | `"running"` | — |
| `TaskStateExited` | `TaskState` | `"exited"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `HealthStateUndetected` | `—` | `HealthState("undetected")` | — |
| `HealthStateUnhealthy` | `—` | `HealthState("unhealthy")` | — |
| `HealthStateHealthy` | `—` | `HealthState("healthy")` | — |
| `FSIsolationNone` | `—` | `fsisolation.None` | — |
| `FSIsolationChroot` | `—` | `fsisolation.Chroot` | — |
| `FSIsolationImage` | `—` | `fsisolation.Image` | — |
| `NetIsolationModeHost` | `—` | `NetIsolationMode("host")` | — |
| `NetIsolationModeGroup` | `—` | `NetIsolationMode("group")` | — |
| `NetIsolationModeTask` | `—` | `NetIsolationMode("task")` | — |
| `NetIsolationModeNone` | `—` | `NetIsolationMode("none")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `SignalTask` | ` *DriverSignalTaskNotSupported` | `taskID string, signal string` | `error` | [L123](file:///d:/claude/nomad/plugins/drivers/driver.go#L123) |
| `ExecTask` | `_ *DriverExecTaskNotSupported` | `taskID string, cmd []string, timeout time.Duration` | `*ExecTaskResult, error` | [L132](file:///d:/claude/nomad/plugins/drivers/driver.go#L132) |
| `HasNetIsolationMode` | `c *Capabilities` | `m NetIsolationMode` | `bool` | [L199](file:///d:/claude/nomad/plugins/drivers/driver.go#L199) |
| `Copy` | `c *DNSConfig` | `` | `*DNSConfig` | [L266](file:///d:/claude/nomad/plugins/drivers/driver.go#L266) |
| `Copy` | `tc *TaskConfig` | `` | `*TaskConfig` | [L313](file:///d:/claude/nomad/plugins/drivers/driver.go#L313) |
| `EnvList` | `tc *TaskConfig` | `` | `[]string` | [L343](file:///d:/claude/nomad/plugins/drivers/driver.go#L343) |
| `TaskDir` | `tc *TaskConfig` | `` | `*allocdir.TaskDir` | [L353](file:///d:/claude/nomad/plugins/drivers/driver.go#L353) |
| `DecodeDriverConfig` | `tc *TaskConfig` | `t interface{}` | `error` | [L365](file:///d:/claude/nomad/plugins/drivers/driver.go#L365) |
| `EncodeDriverConfig` | `tc *TaskConfig` | `val cty.Value` | `error` | [L369](file:///d:/claude/nomad/plugins/drivers/driver.go#L369) |
| `EncodeConcreteDriverConfig` | `tc *TaskConfig` | `t interface{}` | `error` | [L379](file:///d:/claude/nomad/plugins/drivers/driver.go#L379) |
| `Copy` | `r *Resources` | `` | `*Resources` | [L398](file:///d:/claude/nomad/plugins/drivers/driver.go#L398) |
| `Copy` | `r *LinuxResources` | `` | `*LinuxResources` | [L441](file:///d:/claude/nomad/plugins/drivers/driver.go#L441) |
| `Copy` | `d *DeviceConfig` | `` | `*DeviceConfig` | [L453](file:///d:/claude/nomad/plugins/drivers/driver.go#L453) |
| `IsEqual` | `m *MountConfig` | `o *MountConfig` | `bool` | [L472](file:///d:/claude/nomad/plugins/drivers/driver.go#L472) |
| `Copy` | `m *MountConfig` | `` | `*MountConfig` | [L481](file:///d:/claude/nomad/plugins/drivers/driver.go#L481) |
| `Successful` | `r *ExitResult` | `` | `bool` | [L506](file:///d:/claude/nomad/plugins/drivers/driver.go#L506) |
| `Copy` | `r *ExitResult` | `` | `*ExitResult` | [L510](file:///d:/claude/nomad/plugins/drivers/driver.go#L510) |
| `Advertise` | `d *DriverNetwork` | `` | `bool` | [L566](file:///d:/claude/nomad/plugins/drivers/driver.go#L566) |
| `Copy` | `d *DriverNetwork` | `` | `*DriverNetwork` | [L571](file:///d:/claude/nomad/plugins/drivers/driver.go#L571) |
| `Hash` | `d *DriverNetwork` | `` | `[]byte` | [L588](file:///d:/claude/nomad/plugins/drivers/driver.go#L588) |

## 5. 核心方法详解

### Copy()

**签名**：`func (c *DNSConfig) Copy() *DNSConfig`

**位置**：[L266](file:///d:/claude/nomad/plugins/drivers/driver.go#L266)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DNSConfig` | — |

### Copy()

**签名**：`func (tc *TaskConfig) Copy() *TaskConfig`

**位置**：[L313](file:///d:/claude/nomad/plugins/drivers/driver.go#L313)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*TaskConfig` | — |

### Copy()

**签名**：`func (r *Resources) Copy() *Resources`

**位置**：[L398](file:///d:/claude/nomad/plugins/drivers/driver.go#L398)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Resources` | — |

### Copy()

**签名**：`func (r *LinuxResources) Copy() *LinuxResources`

**位置**：[L441](file:///d:/claude/nomad/plugins/drivers/driver.go#L441)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*LinuxResources` | — |

### Copy()

**签名**：`func (d *DeviceConfig) Copy() *DeviceConfig`

**位置**：[L453](file:///d:/claude/nomad/plugins/drivers/driver.go#L453)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DeviceConfig` | — |

### Copy()

**签名**：`func (m *MountConfig) Copy() *MountConfig`

**位置**：[L481](file:///d:/claude/nomad/plugins/drivers/driver.go#L481)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*MountConfig` | — |

### Copy()

**签名**：`func (r *ExitResult) Copy() *ExitResult`

**位置**：[L510](file:///d:/claude/nomad/plugins/drivers/driver.go#L510)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ExitResult` | — |

### Copy()

**签名**：`func (d *DriverNetwork) Copy() *DriverNetwork`

**位置**：[L571](file:///d:/claude/nomad/plugins/drivers/driver.go#L571)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DriverNetwork` | — |

### Hash()

**签名**：`func (d *DriverNetwork) Hash() []byte`

**位置**：[L588](file:///d:/claude/nomad/plugins/drivers/driver.go#L588)

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]byte` | 字节数组 |

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
| [client.go](file:///d:/claude/nomad/plugins/drivers/client.go) | 同目录源文件 |
| [cstructs.go](file:///d:/claude/nomad/plugins/drivers/cstructs.go) | 同目录源文件 |
| [errors.go](file:///d:/claude/nomad/plugins/drivers/errors.go) | 同目录源文件 |
| [execstreaming.go](file:///d:/claude/nomad/plugins/drivers/execstreaming.go) | 同目录源文件 |
| [mock.go](file:///d:/claude/nomad/plugins/drivers/mock.go) | 同目录源文件 |

