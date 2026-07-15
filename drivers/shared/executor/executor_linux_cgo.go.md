# executor_linux_cgo.go 代码说明文档

> 文件路径：[drivers/shared/executor/executor_linux_cgo.go](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go)
> 总行数：1112 行
> 所属包：`executor`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0
> Build Tag：`linux && cgo`

---

## 1. 文件定位与核心职责

该文件属于 **驱动共享工具子包**（`drivers/shared`），提供各任务驱动的共享功能，包括驱动事件处理、重启策略、执行器接口、网络配置、资源隔离和选择器逻辑等。

**构建标签**：`linux && cgo`

## 2. 类型定义

### LibcontainerExecutor

**定义位置**：[L69](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L69)

**中文说明**：LibcontainerExecutor 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type LibcontainerExecutor struct {
	id string
	command *ExecCommand
	logger hclog.Logger
	compute cpustats.Compute
	totalCpuStats *cpustats.Tracker
	userCpuStats *cpustats.Tracker
	systemCpuStats *cpustats.Tracker
	processStats procstats.ProcessStats
	container *libcontainer.Container
	userProc *libcontainer.Process
	userProcExited chan interface{}
	exitState *ProcessState
	sigChan chan os.Signal
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `id` | `string` | 唯一标识符 |
| `command` | `*ExecCommand` | — |
| `logger` | `hclog.Logger` | 日志记录器 |
| `compute` | `cpustats.Compute` | — |
| `totalCpuStats` | `*cpustats.Tracker` | — |
| `userCpuStats` | `*cpustats.Tracker` | — |
| `systemCpuStats` | `*cpustats.Tracker` | — |
| `processStats` | `procstats.ProcessStats` | — |
| `container` | `*libcontainer.Container` | — |
| `userProc` | `*libcontainer.Process` | — |
| `userProcExited` | `chan interface{}` | 通道 |
| `exitState` | `*ProcessState` | — |
| `sigChan` | `chan os.Signal` | 通道 |

**关联方法**（24 个）：`catchSignals`, `ListProcesses`, `cleanOldProcessesInCGroup`, `Launch`, `Wait`, `wait`, `Shutdown`, `UpdateResources`, `Version`, `Stats`, `handleStats`, `Signal`, `Exec`, `newTerminalSocket`, `ExecStreaming`, `handleExecWait`, `configureCgroups`, `configureCgroupHook`, `configureCgroupMemory`, `configureCG1`, `cpusetCG1`, `configureCG2`, `newLibcontainerConfig`, `clampCpuShares`

### waitResult

**定义位置**：[L622](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L622)

**中文说明**：waitResult 是一个结果结构体，封装操作执行的结果。

**类型**：struct

```go
type waitResult struct {
	ps *os.ProcessState
	err error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ps` | `*os.ProcessState` | — |
| `err` | `error` | 错误信息 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `MinCPUShares` | `—` | `2` | — |
| `MaxCPUShares` | `—` | `262_144` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ExecutorCgroupV1MeasuredMemStats` | `—` | `[]string{...}` | — |
| `ExecutorCgroupV2MeasuredMemStats` | `—` | `[]string{...}` | — |
| `ExecutorCgroupMeasuredCpuStats` | `—` | `[]string{...}` | — |
| `userMountToUnixMount` | `—` | `map[string]int{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `catchSignals` | `l *LibcontainerExecutor` | `` | `` | [L88](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L88) |
| `NewExecutorWithIsolation` | - | `logger hclog.Logger, compute cpustats.Compute` | `Executor` | [L116](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L116) |
| `ListProcesses` | `l *LibcontainerExecutor` | `` | `set.Collection[int]` | [L135](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L135) |
| `cleanOldProcessesInCGroup` | `l *LibcontainerExecutor` | `nomadRelativePath string` | `error` | [L141](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L141) |
| `Launch` | `l *LibcontainerExecutor` | `command *ExecCommand` | `*ProcessState, error` | [L183](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L183) |
| `Wait` | `l *LibcontainerExecutor` | `ctx context.Context` | `*ProcessState, error` | [L287](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L287) |
| `wait` | `l *LibcontainerExecutor` | `` | `` | [L296](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L296) |
| `Shutdown` | `l *LibcontainerExecutor` | `signal string, grace time.Duration` | `error` | [L351](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L351) |
| `UpdateResources` | `l *LibcontainerExecutor` | `resources *drivers.Resources` | `error` | [L410](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L410) |
| `Version` | `l *LibcontainerExecutor` | `` | `*ExecutorVersion, error` | [L415](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L415) |
| `Stats` | `l *LibcontainerExecutor` | `ctx context.Context, interval time.Duration` | `<-chan *cstructs.TaskResourceUsage, error` | [L420](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L420) |
| `handleStats` | `l *LibcontainerExecutor` | `ch chan *cstructs.TaskResourceUsage, ctx context.Context, interval time.Duration` | `` | [L427](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L427) |
| `Signal` | `l *LibcontainerExecutor` | `s os.Signal` | `error` | [L525](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L525) |
| `Exec` | `l *LibcontainerExecutor` | `deadline time.Time, cmd string, args []string` | `[]byte, int, error` | [L530](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L530) |
| `newTerminalSocket` | `l *LibcontainerExecutor` | `` | `pty func(...), tty *os.File, err error` | [L575](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L575) |
| `ExecStreaming` | `l *LibcontainerExecutor` | `ctx context.Context, cmd []string, tty bool, stream drivers.ExecTaskStream` | `error` | [L585](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L585) |
| `handleExecWait` | `l *LibcontainerExecutor` | `ch chan *waitResult, process *libcontainer.Process` | `` | [L627](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L627) |
| `configureCapabilities` | - | `cfg *runc.Config, command *ExecCommand` | `` | [L632](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L632) |
| `configureNamespaces` | - | `pidMode string, ipcMode string` | `runc.Namespaces` | [L662](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L662) |
| `configureIsolation` | - | `cfg *runc.Config, command *ExecCommand` | `error` | [L680](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L680) |
| `configureCgroups` | `l *LibcontainerExecutor` | `cfg *runc.Config, command *ExecCommand` | `error` | [L772](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L772) |
| `configureCgroupHook` | ` *LibcontainerExecutor` | `cfg *runc.Config, command *ExecCommand` | `` | [L800](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L800) |
| `configureCgroupMemory` | `l *LibcontainerExecutor` | `cfg *runc.Config, command *ExecCommand` | `` | [L808](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L808) |
| `configureCG1` | `l *LibcontainerExecutor` | `cfg *runc.Config, command *ExecCommand, cgroup string` | `error` | [L817](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L817) |
| `cpusetCG1` | `l *LibcontainerExecutor` | `cpusetCgroupPath string, cores string` | `error` | [L842](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L842) |
| `configureCG2` | `l *LibcontainerExecutor` | `cfg *runc.Config, command *ExecCommand, cg string` | `error` | [L850](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L850) |
| `newLibcontainerConfig` | `l *LibcontainerExecutor` | `command *ExecCommand` | `*runc.Config, error` | [L872](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L872) |
| `clampCpuShares` | `l *LibcontainerExecutor` | `shares int64` | `int64` | [L900](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L900) |
| `cmdDevices` | - | `driverDevices []*drivers.DeviceConfig` | `[]*devices.Device, error` | [L921](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L921) |
| `cmdMounts` | - | `mounts []*drivers.MountConfig` | `[]*runc.Mount` | [L951](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L951) |
| `lookupTaskBin` | - | `command *ExecCommand` | `string, string, error` | [L987](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L987) |
| `getPathInTaskDir` | - | `taskDir string, searchDir string, bin string` | `string, string, error` | [L1042](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L1042) |
| `getPathInMount` | - | `mountHostPath string, mountTaskPath string, bin string` | `string, string, error` | [L1070](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L1070) |
| `filepathIsRegular` | - | `path string` | `error` | [L1096](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L1096) |
| `newSetCPUSetCgroupHook` | - | `cgroupPath string` | `runc.Hook` | [L1107](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L1107) |

## 5. 核心方法详解

### NewExecutorWithIsolation()

**签名**：`func NewExecutorWithIsolation(logger hclog.Logger, compute cpustats.Compute) Executor`

**位置**：[L116](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L116)

**中文说明**：创建并返回一个新的 ExecutorWithIsolation 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `compute` | `cpustats.Compute` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `Executor` | — |

### Launch()

**签名**：`func (l *LibcontainerExecutor) Launch(command *ExecCommand) *ProcessState, error`

**位置**：[L183](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L183)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `command` | `*ExecCommand` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ProcessState` | — |
| `error` | 错误信息 |

### Wait()

**签名**：`func (l *LibcontainerExecutor) Wait(ctx context.Context) *ProcessState, error`

**位置**：[L287](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L287)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ProcessState` | — |
| `error` | 错误信息 |

### Shutdown()

**签名**：`func (l *LibcontainerExecutor) Shutdown(signal string, grace time.Duration) error`

**位置**：[L351](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L351)

**中文说明**：关闭对象，释放相关资源。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `signal` | `string` | 字符串 |
| `grace` | `time.Duration` | 时间间隔 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Stats()

**签名**：`func (l *LibcontainerExecutor) Stats(ctx context.Context, interval time.Duration) <-chan *cstructs.TaskResourceUsage, error`

**位置**：[L420](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L420)

**中文说明**：返回对象的统计信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `interval` | `time.Duration` | 时间间隔 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `<-chan *cstructs.TaskResourceUsage` | 通道 |
| `error` | 错误信息 |

### Signal()

**签名**：`func (l *LibcontainerExecutor) Signal(s os.Signal) error`

**位置**：[L525](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go#L525)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `s` | `os.Signal` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `os/signal` | 标准库 |
| `path` | 标准库 |
| `path/filepath` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `sync/atomic` | 标准库 |
| `syscall` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocdir` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/cgroupslib` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/cpustats` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/capabilities` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/executor/procstats` | 内部包 |
| `github.com/hashicorp/nomad/helper/users` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/armon/circbuf` | 第三方库 |
| `github.com/hashicorp/consul-template/signals` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/opencontainers/cgroups` | 第三方库 |
| `github.com/opencontainers/cgroups/devices` | 第三方库 |
| `github.com/opencontainers/runc/libcontainer` | 第三方库 |
| `github.com/opencontainers/runc/libcontainer/configs` | 第三方库 |
| `github.com/opencontainers/runc/libcontainer/devices` | 第三方库 |
| `github.com/opencontainers/runc/libcontainer/specconv` | 第三方库 |
| `github.com/opencontainers/runc/libcontainer/utils` | 第三方库 |
| `github.com/opencontainers/runtime-spec/specs-go` | 第三方库 |
| `golang.org/x/sys/unix` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [exec_utils.go](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go) | 同目录源文件 |
| [executor.go](file:///d:/claude/nomad/drivers/shared/executor/executor.go) | 同目录源文件 |
| [executor_basic.go](file:///d:/claude/nomad/drivers/shared/executor/executor_basic.go) | 同目录源文件 |
| [executor_linux.go](file:///d:/claude/nomad/drivers/shared/executor/executor_linux.go) | 同目录源文件 |
| [executor_plugin.go](file:///d:/claude/nomad/drivers/shared/executor/executor_plugin.go) | 同目录源文件 |

