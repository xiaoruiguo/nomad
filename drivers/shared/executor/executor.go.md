# executor.go 代码说明文档

> 文件路径：[drivers/shared/executor/executor.go](file:///d:/claude/nomad/drivers/shared/executor/executor.go)
> 总行数：809 行
> 所属包：`executor`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **驱动共享工具子包**（`drivers/shared`），提供各任务驱动的共享功能，包括驱动事件处理、重启策略、执行器接口、网络配置、资源隔离和选择器逻辑等。

## 2. 类型定义

### Executor

**定义位置**：[L60](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L60)

**中文说明**：Executor 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type Executor interface {
	Launch func(...)
	Wait func(...)
	Shutdown func(...)
	UpdateResources func(...)
	Version func(...)
	Stats func(...)
	Signal func(...)
	Exec func(...)
	ExecStreaming func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Launch` | `func(...)` | — |
| `Wait` | `func(...)` | — |
| `Shutdown` | `func(...)` | 关闭对象，释放相关资源。 |
| `UpdateResources` | `func(...)` | 更新指定的Resources。 |
| `Version` | `func(...)` | — |
| `Stats` | `func(...)` | 返回对象的统计信息。 |
| `Signal` | `func(...)` | — |
| `Exec` | `func(...)` | — |
| `ExecStreaming` | `func(...)` | — |

### ExecCommand

**定义位置**：[L105](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L105)

**中文说明**：ExecCommand 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ExecCommand struct {
	Cmd string
	Args []string
	Resources *drivers.Resources
	StdoutPath string
	stdout io.WriteCloser
	StderrPath string
	stderr io.WriteCloser
	Env []string
	User string
	TaskDir string
	WorkDir string
	ResourceLimits bool
	NoPivotRoot bool
	Mounts []*drivers.MountConfig
	Devices []*drivers.DeviceConfig
	NetworkIsolation *drivers.NetworkIsolationSpec
	ModePID string
	ModeIPC string
	Capabilities []string
	OverrideCgroupV2 string
	OverrideCgroupV1 map[string]string
	OOMScoreAdj int32
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Cmd` | `string` | 字符串 |
| `Args` | `[]string` | 参数 |
| `Resources` | `*drivers.Resources` | — |
| `StdoutPath` | `string` | 字符串 |
| `stdout` | `io.WriteCloser` | — |
| `StderrPath` | `string` | 字符串 |
| `stderr` | `io.WriteCloser` | — |
| `Env` | `[]string` | 列表 |
| `User` | `string` | 字符串 |
| `TaskDir` | `string` | 字符串 |
| `WorkDir` | `string` | 字符串 |
| `ResourceLimits` | `bool` | 布尔值 |
| `NoPivotRoot` | `bool` | 布尔值 |
| `Mounts` | `[]*drivers.MountConfig` | 列表 |
| `Devices` | `[]*drivers.DeviceConfig` | 列表 |
| `NetworkIsolation` | `*drivers.NetworkIsolationSpec` | — |
| `ModePID` | `string` | 字符串 |
| `ModeIPC` | `string` | 字符串 |
| `Capabilities` | `[]string` | 列表 |
| `OverrideCgroupV2` | `string` | 字符串 |
| `OverrideCgroupV1` | `map[string]string` | 映射表 |
| `OOMScoreAdj` | `int32` | — |

**关联方法**（8 个）：`getCgroupOr`, `CpusetCgroup`, `StatsCgroup`, `SetWriters`, `GetWriters`, `Stdout`, `Stderr`, `Close`

### nopCloser

**定义位置**：[L257](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L257)

**中文说明**：nopCloser 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type nopCloser struct {
	io.Writer io.Writer
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `io.Writer` | `io.Writer` | — |

**关联方法**（1 个）：`Close`

### ProcessState

**定义位置**：[L305](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L305)

**中文说明**：ProcessState 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ProcessState struct {
	Pid int
	ExitCode int
	Signal int
	OOMKilled bool
	Time time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Pid` | `int` | — |
| `ExitCode` | `int` | — |
| `Signal` | `int` | — |
| `OOMKilled` | `bool` | 布尔值 |
| `Time` | `time.Time` | 时间戳 |

### ExecutorVersion

**定义位置**：[L314](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L314)

**中文说明**：ExecutorVersion 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ExecutorVersion struct {
	Version string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Version` | `string` | 版本号 |

**关联方法**（1 个）：`GoString`

### UniversalExecutor

**定义位置**：[L325](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L325)

**中文说明**：UniversalExecutor 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type UniversalExecutor struct {
	childCmd exec.Cmd
	command *ExecCommand
	exitState *ProcessState
	processExited chan interface{}
	totalCpuStats *cpustats.Tracker
	userCpuStats *cpustats.Tracker
	systemCpuStats *cpustats.Tracker
	processStats procstats.ProcessStats
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `childCmd` | `exec.Cmd` | — |
| `command` | `*ExecCommand` | — |
| `exitState` | `*ProcessState` | — |
| `processExited` | `chan interface{}` | 通道 |
| `totalCpuStats` | `*cpustats.Tracker` | — |
| `userCpuStats` | `*cpustats.Tracker` | — |
| `systemCpuStats` | `*cpustats.Tracker` | — |
| `processStats` | `procstats.ProcessStats` | — |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（12 个）：`Version`, `Launch`, `Exec`, `ExecStreaming`, `Wait`, `UpdateResources`, `wait`, `Shutdown`, `Signal`, `Stats`, `handleStats`, `usesCustomCgroup`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ExecutorVersionLatest` | `—` | `"2.0.0"` | — |
| `ExecutorVersionPre0_9` | `—` | `"1.1.0"` | — |
| `IsolationModePrivate` | `—` | `"private"` | — |
| `IsolationModeHost` | `—` | `"host"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ExecutorBasicMeasuredMemStats` | `—` | `[]string{...}` | — |
| `ExecutorBasicMeasuredCpuStats` | `—` | `[]string{...}` | — |
| `ErrCgroupMustBeSet` | `—` | `errors.New("cgroup must be set")` | — |
| `finishedErr` | `—` | `"os: process already finished"` | — |
| `noSuchProcessErr` | `—` | `"no such process"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `getCgroupOr` | `c *ExecCommand` | `controller string, fallback string` | `string` | [L180](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L180) |
| `CpusetCgroup` | `c *ExecCommand` | `` | `string` | [L206](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L206) |
| `StatsCgroup` | `c *ExecCommand` | `` | `string` | [L224](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L224) |
| `SetWriters` | `c *ExecCommand` | `out io.WriteCloser, err io.WriteCloser` | `` | [L246](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L246) |
| `GetWriters` | `c *ExecCommand` | `` | `stdout io.WriteCloser, stderr io.WriteCloser` | [L253](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L253) |
| `Close` | ` *nopCloser` | `` | `error` | [L261](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L261) |
| `Stdout` | `c *ExecCommand` | `` | `io.WriteCloser, error` | [L264](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L264) |
| `Stderr` | `c *ExecCommand` | `` | `io.WriteCloser, error` | [L280](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L280) |
| `Close` | `c *ExecCommand` | `` | `` | [L295](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L295) |
| `GoString` | `v *ExecutorVersion` | `` | `string` | [L318](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L318) |
| `NewExecutor` | - | `logger hclog.Logger, compute cpustats.Compute` | `Executor` | [L341](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L341) |
| `Version` | `e *UniversalExecutor` | `` | `*ExecutorVersion, error` | [L354](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L354) |
| `Launch` | `e *UniversalExecutor` | `command *ExecCommand` | `*ProcessState, error` | [L360](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L360) |
| `Exec` | `e *UniversalExecutor` | `deadline time.Time, name string, args []string` | `[]byte, int, error` | [L443](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L443) |
| `ExecScript` | - | `ctx context.Context, dir string, env []string, attrs *syscall.SysProcAttr, ne...` | `[]byte, int, error` | [L458](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L458) |
| `ExecStreaming` | `e *UniversalExecutor` | `ctx context.Context, command []string, tty bool, stream drivers.ExecTaskStream` | `error` | [L495](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L495) |
| `Wait` | `e *UniversalExecutor` | `ctx context.Context` | `*ProcessState, error` | [L556](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L556) |
| `UpdateResources` | `e *UniversalExecutor` | `resources *drivers.Resources` | `error` | [L565](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L565) |
| `wait` | `e *UniversalExecutor` | `` | `` | [L569](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L569) |
| `Shutdown` | `e *UniversalExecutor` | `signal string, grace time.Duration` | `error` | [L616](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L616) |
| `Signal` | `e *UniversalExecutor` | `s os.Signal` | `error` | [L691](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L691) |
| `Stats` | `e *UniversalExecutor` | `ctx context.Context, interval time.Duration` | `<-chan *cstructs.TaskResourceUsage, error` | [L706](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L706) |
| `handleStats` | `e *UniversalExecutor` | `ch chan *cstructs.TaskResourceUsage, ctx context.Context, interval time.Duration` | `` | [L712](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L712) |
| `usesCustomCgroup` | `e *UniversalExecutor` | `` | `bool` | [L735](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L735) |
| `lookupBin` | - | `taskDir string, bin string` | `string, error` | [L743](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L743) |
| `makeExecutable` | - | `binPath string` | `error` | [L773](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L773) |
| `SupportedCaps` | - | `allowNetRaw bool` | `[]string` | [L798](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L798) |

## 5. 核心方法详解

### Close()

**签名**：`func ( *nopCloser) Close() error`

**位置**：[L261](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L261)

**中文说明**：关闭对象。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Close()

**签名**：`func (c *ExecCommand) Close() `

**位置**：[L295](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L295)

**中文说明**：关闭对象。

### NewExecutor()

**签名**：`func NewExecutor(logger hclog.Logger, compute cpustats.Compute) Executor`

**位置**：[L341](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L341)

**中文说明**：创建并返回一个新的 Executor 实例。

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

**签名**：`func (e *UniversalExecutor) Launch(command *ExecCommand) *ProcessState, error`

**位置**：[L360](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L360)

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

**签名**：`func (e *UniversalExecutor) Wait(ctx context.Context) *ProcessState, error`

**位置**：[L556](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L556)

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

**签名**：`func (e *UniversalExecutor) Shutdown(signal string, grace time.Duration) error`

**位置**：[L616](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L616)

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

### Signal()

**签名**：`func (e *UniversalExecutor) Signal(s os.Signal) error`

**位置**：[L691](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L691)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `s` | `os.Signal` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Stats()

**签名**：`func (e *UniversalExecutor) Stats(ctx context.Context, interval time.Duration) <-chan *cstructs.TaskResourceUsage, error`

**位置**：[L706](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L706)

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

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `path/filepath` | 标准库 |
| `runtime` | 标准库 |
| `strings` | 标准库 |
| `syscall` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocdir` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/cgroupslib` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/cpustats` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/fifo` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/executor/procstats` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/armon/circbuf` | 第三方库 |
| `github.com/creack/pty` | 第三方库 |
| `github.com/hashicorp/consul-template/signals` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/moby/sys/capability` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [executor_test.go](file:///d:/claude/nomad/drivers/shared/executor/executor_test.go) | 对应测试文件 |
| [exec_utils.go](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go) | 同目录源文件 |
| [executor_basic.go](file:///d:/claude/nomad/drivers/shared/executor/executor_basic.go) | 同目录源文件 |
| [executor_linux.go](file:///d:/claude/nomad/drivers/shared/executor/executor_linux.go) | 同目录源文件 |
| [executor_linux_cgo.go](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go) | 同目录源文件 |
| [executor_plugin.go](file:///d:/claude/nomad/drivers/shared/executor/executor_plugin.go) | 同目录源文件 |

