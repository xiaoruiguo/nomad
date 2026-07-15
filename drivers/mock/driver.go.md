# driver.go 代码说明文档

> 文件路径：[drivers/mock/driver.go](file:///d:/claude/nomad/drivers/mock/driver.go)
> 总行数：713 行
> 所属包：`mock`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Mock 驱动子包**（`drivers/mock`），实现 Nomad 的模拟驱动，用于测试和开发，模拟任务执行的各种状态和行为（成功、失败、日志等）。

## 2. 类型定义

### Driver

**定义位置**：[L117](file:///d:/claude/nomad/drivers/mock/driver.go#L117)

**类型**：struct

```go
	eventer *eventer.Eventer
	capabilities *drivers.Capabilities
	config *Config
	tasks *taskStore
	ctx context.Context
	shutdownFingerprintTime time.Time
	lastDriverTaskConfig *drivers.TaskConfig
	lastTaskConfig *TaskConfig
	lastMu sync.Mutex
	logger hclog.Logger
```

**关联方法**（25 个）：`PluginInfo`, `ConfigSchema`, `SetConfig`, `TaskConfigSchema`, `Capabilities`, `Fingerprint`, `handleFingerprint`, `buildFingerprint`, `RecoverTask`, `StartTask`, `WaitTask`, `handleWait`, `StopTask`, `DestroyTask`, `InspectTask`, `TaskStats`, `handleStats`, `TaskEvents`, `SignalTask`, `ExecTask`, `ExecTaskStreaming`, `GetTaskConfig`, `GetHandle`, `CreateNetwork`, `DestroyNetwork`

### Config

**定义位置**：[L173](file:///d:/claude/nomad/drivers/mock/driver.go#L173)

**类型**：struct

```go
	FSIsolation string `codec:"fs_isolation"`
	ShutdownPeriodicAfter bool `codec:"shutdown_periodic_after"`
	ShutdownPeriodicDuration time.Duration `codec:"shutdown_periodic_duration"`
```

### Command

**定义位置**：[L187](file:///d:/claude/nomad/drivers/mock/driver.go#L187)

**类型**：struct

```go
	RunFor string `codec:"run_for"`
	runForDuration time.Duration
	ExitCode int `codec:"exit_code"`
	ExitSignal int `codec:"exit_signal"`
	ExitErrMsg string `codec:"exit_err_msg"`
	SignalErr string `codec:"signal_error"`
	StdoutString string `codec:"stdout_string"`
	StdoutRepeat int `codec:"stdout_repeat"`
	StdoutRepeatDur string `codec:"stdout_repeat_duration"`
	stdoutRepeatDuration time.Duration
	StderrString string `codec:"stderr_string"`
	StderrRepeat int `codec:"stderr_repeat"`
	StderrRepeatDur string `codec:"stderr_repeat_duration"`
	stderrRepeatDuration time.Duration
```

**关联方法**（1 个）：`parseDurations`

### TaskConfig

**定义位置**：[L230](file:///d:/claude/nomad/drivers/mock/driver.go#L230)

**类型**：struct

```go
	Command
	ExecCommand *Command `codec:"exec_command"`
	PluginExitAfter string `codec:"plugin_exit_after"`
	pluginExitAfterDuration time.Duration
	StartErr string `codec:"start_error"`
	StartErrRecoverable bool `codec:"start_error_recoverable"`
	StartBlockFor string `codec:"start_block_for"`
	startBlockForDuration time.Duration
	KillAfter string `codec:"kill_after"`
	killAfterDuration time.Duration
	DriverIP string `codec:"driver_ip"`
	DriverAdvertise bool `codec:"driver_advertise"`
	DriverPortMap string `codec:"driver_port_map"`
```

### MockTaskState

**定义位置**：[L268](file:///d:/claude/nomad/drivers/mock/driver.go#L268)

**类型**：struct

```go
	StartedAt time.Time
	Command Command
	ExecCommand *Command
	PluginExitAfter time.Duration
	KillAfter time.Duration
	ProcState drivers.TaskState
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `pluginName` | `"mock_driver"` |
| `fingerprintPeriod` | `500 * time.Millisecond` |
| `taskHandleVersion` | `1` |

### 变量

| 名称 | 值 |
|------|----|
| `PluginID` | `loader.PluginID{...}` |
| `PluginConfig` | `&loader.InternalPluginConfig{...}` |
| `pluginInfo` | `&base.PluginInfoResponse{...}` |
| `configSpec` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` |
| `taskConfigSpec` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` |
| `_` | `(*Driver)(nil)` |
| `_` | `(*Driver)(nil)` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewMockDriver` | - | `ctx context.Context, logger hclog.Logger` | `drivers.DriverPlugin` | [L152](file:///d:/claude/nomad/drivers/mock/driver.go#L152) |
| `PluginInfo` | `d *Driver` | - | `*base.PluginInfoResponse, error` | [L281](file:///d:/claude/nomad/drivers/mock/driver.go#L281) |
| `ConfigSchema` | `d *Driver` | - | `*hclspec.Spec, error` | [L285](file:///d:/claude/nomad/drivers/mock/driver.go#L285) |
| `SetConfig` | `d *Driver` | `cfg *base.Config` | `error` | [L289](file:///d:/claude/nomad/drivers/mock/driver.go#L289) |
| `TaskConfigSchema` | `d *Driver` | - | `*hclspec.Spec, error` | [L310](file:///d:/claude/nomad/drivers/mock/driver.go#L310) |
| `Capabilities` | `d *Driver` | - | `*drivers.Capabilities, error` | [L314](file:///d:/claude/nomad/drivers/mock/driver.go#L314) |
| `Fingerprint` | `d *Driver` | `ctx context.Context` | `chan *drivers.Fingerprint, error` | [L318](file:///d:/claude/nomad/drivers/mock/driver.go#L318) |
| `handleFingerprint` | `d *Driver` | `ctx context.Context, ch chan *drivers.Fingerprint` | - | [L324](file:///d:/claude/nomad/drivers/mock/driver.go#L324) |
| `buildFingerprint` | `d *Driver` | - | `*drivers.Fingerprint` | [L339](file:///d:/claude/nomad/drivers/mock/driver.go#L339) |
| `RecoverTask` | `d *Driver` | `handle *drivers.TaskHandle` | `error` | [L359](file:///d:/claude/nomad/drivers/mock/driver.go#L359) |
| `parseDurations` | `c *Command` | - | `error` | [L409](file:///d:/claude/nomad/drivers/mock/driver.go#L409) |
| `parseDriverConfig` | - | `cfg *drivers.TaskConfig` | `*TaskConfig, error` | [L426](file:///d:/claude/nomad/drivers/mock/driver.go#L426) |
| `StartTask` | `d *Driver` | `cfg *drivers.TaskConfig` | `*drivers.TaskHandle, *drivers.DriverNetwork, error` | [L454](file:///d:/claude/nomad/drivers/mock/driver.go#L454) |
| `WaitTask` | `d *Driver` | `ctx context.Context, taskID string` | `chan *drivers.ExitResult, error` | [L527](file:///d:/claude/nomad/drivers/mock/driver.go#L527) |
| `handleWait` | `d *Driver` | `ctx context.Context, handle *taskHandle, ch chan *drivers.ExitResult` | - | [L539](file:///d:/claude/nomad/drivers/mock/driver.go#L539) |
| `StopTask` | `d *Driver` | `taskID string, timeout time.Duration, signal string` | `error` | [L551](file:///d:/claude/nomad/drivers/mock/driver.go#L551) |
| `DestroyTask` | `d *Driver` | `taskID string, force bool` | `error` | [L569](file:///d:/claude/nomad/drivers/mock/driver.go#L569) |
| `InspectTask` | `d *Driver` | `taskID string` | `*drivers.TaskStatus, error` | [L583](file:///d:/claude/nomad/drivers/mock/driver.go#L583) |
| `TaskStats` | `d *Driver` | `ctx context.Context, taskID string, interval time.Duration` | `chan *drivers.TaskResourceUsage, error` | [L593](file:///d:/claude/nomad/drivers/mock/driver.go#L593) |
| `handleStats` | `d *Driver` | `ctx context.Context, ch chan *drivers.TaskResourceUsage` | - | [L599](file:///d:/claude/nomad/drivers/mock/driver.go#L599) |
| `TaskEvents` | `d *Driver` | `ctx context.Context` | `chan *drivers.TaskEvent, error` | [L626](file:///d:/claude/nomad/drivers/mock/driver.go#L626) |
| `SignalTask` | `d *Driver` | `taskID string, signal string` | `error` | [L630](file:///d:/claude/nomad/drivers/mock/driver.go#L630) |
| `ExecTask` | `d *Driver` | `taskID string, cmd []string, timeout time.Duration` | `*drivers.ExecTaskResult, error` | [L643](file:///d:/claude/nomad/drivers/mock/driver.go#L643) |
| `ExecTaskStreaming` | `d *Driver` | `ctx context.Context, taskID string, execOpts *drivers.ExecOptions` | `*drivers.ExitResult, error` | [L658](file:///d:/claude/nomad/drivers/mock/driver.go#L658) |
| `GetTaskConfig` | `d *Driver` | - | `*drivers.TaskConfig, *TaskConfig` | [L691](file:///d:/claude/nomad/drivers/mock/driver.go#L691) |
| `GetHandle` | `d *Driver` | `taskID string` | `*taskHandle` | [L699](file:///d:/claude/nomad/drivers/mock/driver.go#L699) |
| `CreateNetwork` | `d *Driver` | `allocID string, request *drivers.NetworkCreateRequest` | `*drivers.NetworkIsolationSpec, bool, error` | [L706](file:///d:/claude/nomad/drivers/mock/driver.go#L706) |
| `DestroyNetwork` | `d *Driver` | `allocID string, spec *drivers.NetworkIsolationSpec` | `error` | [L710](file:///d:/claude/nomad/drivers/mock/driver.go#L710) |

## 5. 核心方法详解

### NewMockDriver()

**签名**：`func NewMockDriver(ctx context.Context, logger hclog.Logger) drivers.DriverPlugin`

**位置**：[L152](file:///d:/claude/nomad/drivers/mock/driver.go#L152)

### Fingerprint()

**签名**：`func (d *Driver) Fingerprint(ctx context.Context) chan *drivers.Fingerprint, error`

**位置**：[L318](file:///d:/claude/nomad/drivers/mock/driver.go#L318)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `math/rand` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/drivers/shared/eventer` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/loader` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/fsisolation` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/hclspec` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [driver_test.go](file:///d:/claude/nomad/drivers/mock/driver_test.go) | 对应测试文件 |

