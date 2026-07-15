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

**类型**：interface

```go
	Launch
	Wait
	Shutdown
	UpdateResources
	Version
	Stats
	Signal
	Exec
	ExecStreaming
```

### ExecCommand

**定义位置**：[L105](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L105)

**类型**：struct

```go
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
```

**关联方法**（8 个）：`getCgroupOr`, `CpusetCgroup`, `StatsCgroup`, `SetWriters`, `GetWriters`, `Stdout`, `Stderr`, `Close`

### nopCloser

**定义位置**：[L257](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L257)

**类型**：struct

```go
	io.Writer
```

**关联方法**（1 个）：`Close`

### ProcessState

**定义位置**：[L305](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L305)

**类型**：struct

```go
	Pid int
	ExitCode int
	Signal int
	OOMKilled bool
	Time time.Time
```

### ExecutorVersion

**定义位置**：[L314](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L314)

**类型**：struct

```go
	Version string
```

**关联方法**（1 个）：`GoString`

### UniversalExecutor

**定义位置**：[L325](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L325)

**类型**：struct

```go
	childCmd exec.Cmd
	command *ExecCommand
	exitState *ProcessState
	processExited chan interface{}
	totalCpuStats *cpustats.Tracker
	userCpuStats *cpustats.Tracker
	systemCpuStats *cpustats.Tracker
	processStats procstats.ProcessStats
	logger hclog.Logger
```

**关联方法**（12 个）：`Version`, `Launch`, `Exec`, `ExecStreaming`, `Wait`, `UpdateResources`, `wait`, `Shutdown`, `Signal`, `Stats`, `handleStats`, `usesCustomCgroup`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `ExecutorVersionLatest` | `"2.0.0"` |
| `ExecutorVersionPre0_9` | `"1.1.0"` |
| `IsolationModePrivate` | `"private"` |
| `IsolationModeHost` | `"host"` |

### 变量

| 名称 | 值 |
|------|----|
| `ExecutorBasicMeasuredMemStats` | `[]string{...}` |
| `ExecutorBasicMeasuredCpuStats` | `[]string{...}` |
| `ErrCgroupMustBeSet` | `errors.New("cgroup must be set")` |
| `finishedErr` | `"os: process already finished"` |
| `noSuchProcessErr` | `"no such process"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `getCgroupOr` | `c *ExecCommand` | `controller string, fallback string` | `string` | [L180](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L180) |
| `CpusetCgroup` | `c *ExecCommand` | - | `string` | [L206](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L206) |
| `StatsCgroup` | `c *ExecCommand` | - | `string` | [L224](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L224) |
| `SetWriters` | `c *ExecCommand` | `out io.WriteCloser, err io.WriteCloser` | - | [L246](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L246) |
| `GetWriters` | `c *ExecCommand` | - | `stdout io.WriteCloser, stderr io.WriteCloser` | [L253](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L253) |
| `Close` | ` *nopCloser` | - | `error` | [L261](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L261) |
| `Stdout` | `c *ExecCommand` | - | `io.WriteCloser, error` | [L264](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L264) |
| `Stderr` | `c *ExecCommand` | - | `io.WriteCloser, error` | [L280](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L280) |
| `Close` | `c *ExecCommand` | - | - | [L295](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L295) |
| `GoString` | `v *ExecutorVersion` | - | `string` | [L318](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L318) |
| `NewExecutor` | - | `logger hclog.Logger, compute cpustats.Compute` | `Executor` | [L341](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L341) |
| `Version` | `e *UniversalExecutor` | - | `*ExecutorVersion, error` | [L354](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L354) |
| `Launch` | `e *UniversalExecutor` | `command *ExecCommand` | `*ProcessState, error` | [L360](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L360) |
| `Exec` | `e *UniversalExecutor` | `deadline time.Time, name string, args []string` | `[]byte, int, error` | [L443](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L443) |
| `ExecScript` | - | `ctx context.Context, dir string, env []string, attrs *syscall.SysProcAttr, n...` | `[]byte, int, error` | [L458](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L458) |
| `ExecStreaming` | `e *UniversalExecutor` | `ctx context.Context, command []string, tty bool, stream drivers.ExecTaskStream` | `error` | [L495](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L495) |
| `Wait` | `e *UniversalExecutor` | `ctx context.Context` | `*ProcessState, error` | [L556](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L556) |
| `UpdateResources` | `e *UniversalExecutor` | `resources *drivers.Resources` | `error` | [L565](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L565) |
| `wait` | `e *UniversalExecutor` | - | - | [L569](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L569) |
| `Shutdown` | `e *UniversalExecutor` | `signal string, grace time.Duration` | `error` | [L616](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L616) |
| `Signal` | `e *UniversalExecutor` | `s os.Signal` | `error` | [L691](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L691) |
| `Stats` | `e *UniversalExecutor` | `ctx context.Context, interval time.Duration` | `chan *cstructs.TaskResourceUsage, error` | [L706](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L706) |
| `handleStats` | `e *UniversalExecutor` | `ch chan *cstructs.TaskResourceUsage, ctx context.Context, interval time.Dura...` | - | [L712](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L712) |
| `usesCustomCgroup` | `e *UniversalExecutor` | - | `bool` | [L735](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L735) |
| `lookupBin` | - | `taskDir string, bin string` | `string, error` | [L743](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L743) |
| `makeExecutable` | - | `binPath string` | `error` | [L773](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L773) |
| `SupportedCaps` | - | `allowNetRaw bool` | `[]string` | [L798](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L798) |

## 5. 核心方法详解

### Close()

**签名**：`func ( *nopCloser) Close() error`

**位置**：[L261](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L261)

### Close()

**签名**：`func (c *ExecCommand) Close() `

**位置**：[L295](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L295)

### NewExecutor()

**签名**：`func NewExecutor(logger hclog.Logger, compute cpustats.Compute) Executor`

**位置**：[L341](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L341)

### Launch()

**签名**：`func (e *UniversalExecutor) Launch(command *ExecCommand) *ProcessState, error`

**位置**：[L360](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L360)

### Wait()

**签名**：`func (e *UniversalExecutor) Wait(ctx context.Context) *ProcessState, error`

**位置**：[L556](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L556)

### Shutdown()

**签名**：`func (e *UniversalExecutor) Shutdown(signal string, grace time.Duration) error`

**位置**：[L616](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L616)

### Signal()

**签名**：`func (e *UniversalExecutor) Signal(s os.Signal) error`

**位置**：[L691](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L691)

### Stats()

**签名**：`func (e *UniversalExecutor) Stats(ctx context.Context, interval time.Duration) chan *cstructs.TaskResourceUsage, error`

**位置**：[L706](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L706)

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

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [executor_test.go](file:///d:/claude/nomad/drivers/shared/executor/executor_test.go) | 对应测试文件 |

