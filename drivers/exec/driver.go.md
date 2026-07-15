# driver.go 代码说明文档

> 文件路径：[drivers/exec/driver.go](file:///d:/claude/nomad/drivers/exec/driver.go)
> 总行数：742 行
> 所属包：`exec`
> 版权：Copyright IBM Corp. 2015, 2025
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Exec 驱动子包**（`drivers/exec`），实现 Nomad 的隔离执行驱动，使用 chroot/isolation 隔离运行任意二进制文件，支持资源限制和 cgroups 集成。

## 2. 类型定义

### Driver

**定义位置**：[L119](file:///d:/claude/nomad/drivers/exec/driver.go#L119)

**中文说明**：Driver 与任务驱动（Driver）相关，驱动负责任务的实际执行。

**类型**：struct

```go
type Driver struct {
	eventer *eventer.Eventer
	config Config
	nomadConfig *base.ClientDriverConfig
	tasks *taskStore
	ctx context.Context
	logger hclog.Logger
	fingerprintSuccess *bool
	fingerprintLock sync.Mutex
	compute cpustats.Compute
	userIDValidator UserIDValidator
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `eventer` | `*eventer.Eventer` | — |
| `config` | `Config` | 配置 |
| `nomadConfig` | `*base.ClientDriverConfig` | — |
| `tasks` | `*taskStore` | — |
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `logger` | `hclog.Logger` | 日志记录器 |
| `fingerprintSuccess` | `*bool` | 布尔值 |
| `fingerprintLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `compute` | `cpustats.Compute` | — |
| `userIDValidator` | `UserIDValidator` | — |

**关联方法**（23 个）：`setFingerprintSuccess`, `setFingerprintFailure`, `fingerprintSuccessful`, `PluginInfo`, `ConfigSchema`, `SetConfig`, `TaskConfigSchema`, `Capabilities`, `Fingerprint`, `handleFingerprint`, `buildFingerprint`, `RecoverTask`, `StartTask`, `WaitTask`, `handleWait`, `StopTask`, `DestroyTask`, `InspectTask`, `TaskStats`, `TaskEvents`, `SignalTask`, `ExecTask`, `ExecTaskStreamingRaw`

### Config

**定义位置**：[L152](file:///d:/claude/nomad/drivers/exec/driver.go#L152)

**中文说明**：Config 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type Config struct {
	NoPivotRoot bool `codec:"no_pivot_root"`
	DefaultModePID string `codec:"default_pid_mode"`
	DefaultModeIPC string `codec:"default_ipc_mode"`
	AllowCaps []string `codec:"allow_caps"`
	DeniedHostUids string `codec:"denied_host_uids"`
	DeniedHostGids string `codec:"denied_host_gids"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NoPivotRoot` | `bool `codec:"no_pivot_root"`` | 布尔值 |
| `DefaultModePID` | `string `codec:"default_pid_mode"`` | 字符串 |
| `DefaultModeIPC` | `string `codec:"default_ipc_mode"`` | 字符串 |
| `AllowCaps` | `[]string `codec:"allow_caps"`` | 列表 |
| `DeniedHostUids` | `string `codec:"denied_host_uids"`` | 字符串 |
| `DeniedHostGids` | `string `codec:"denied_host_gids"`` | 字符串 |

**关联方法**（1 个）：`validate`

### TaskConfig

**定义位置**：[L195](file:///d:/claude/nomad/drivers/exec/driver.go#L195)

**中文说明**：TaskConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type TaskConfig struct {
	Command string `codec:"command"`
	Args []string `codec:"args"`
	ModePID string `codec:"pid_mode"`
	ModeIPC string `codec:"ipc_mode"`
	CapAdd []string `codec:"cap_add"`
	CapDrop []string `codec:"cap_drop"`
	WorkDir string `codec:"work_dir"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Command` | `string `codec:"command"`` | 字符串 |
| `Args` | `[]string `codec:"args"`` | 参数 |
| `ModePID` | `string `codec:"pid_mode"`` | 字符串 |
| `ModeIPC` | `string `codec:"ipc_mode"`` | 字符串 |
| `CapAdd` | `[]string `codec:"cap_add"`` | 列表 |
| `CapDrop` | `[]string `codec:"cap_drop"`` | 列表 |
| `WorkDir` | `string `codec:"work_dir"`` | 字符串 |

**关联方法**（1 个）：`validate`

### TaskState

**定义位置**：[L254](file:///d:/claude/nomad/drivers/exec/driver.go#L254)

**中文说明**：TaskState 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskState struct {
	ReattachConfig *pstructs.ReattachConfig
	TaskConfig *drivers.TaskConfig
	Pid int
	StartedAt time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ReattachConfig` | `*pstructs.ReattachConfig` | — |
| `TaskConfig` | `*drivers.TaskConfig` | — |
| `Pid` | `int` | — |
| `StartedAt` | `time.Time` | 时间点 |

### UserIDValidator

**定义位置**：[L261](file:///d:/claude/nomad/drivers/exec/driver.go#L261)

**中文说明**：UserIDValidator 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type UserIDValidator interface {
	HasValidIDs func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `HasValidIDs` | `func(...)` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `pluginName` | `—` | `"exec"` | — |
| `fingerprintPeriod` | `—` | `30 * time.Second` | — |
| `taskHandleVersion` | `—` | `1` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `PluginID` | `—` | `loader.PluginID{...}` | — |
| `PluginConfig` | `—` | `&loader.InternalPluginConfig{...}` | — |
| `pluginInfo` | `—` | `&base.PluginInfoResponse{...}` | — |
| `configSpec` | `—` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` | — |
| `taskConfigSpec` | `—` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` | — |
| `driverCapabilities` | `—` | `&drivers.Capabilities{...}` | — |
| `_` | `drivers.ExecTaskStreamingRawDriver` | `(*Driver)(nil)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `validate` | `c *Config` | `` | `error` | [L173](file:///d:/claude/nomad/drivers/exec/driver.go#L173) |
| `validate` | `tc *TaskConfig` | `` | `error` | [L220](file:///d:/claude/nomad/drivers/exec/driver.go#L220) |
| `NewExecDriver` | - | `ctx context.Context, logger hclog.Logger` | `drivers.DriverPlugin` | [L266](file:///d:/claude/nomad/drivers/exec/driver.go#L266) |
| `setFingerprintSuccess` | `d *Driver` | `` | `` | [L277](file:///d:/claude/nomad/drivers/exec/driver.go#L277) |
| `setFingerprintFailure` | `d *Driver` | `` | `` | [L284](file:///d:/claude/nomad/drivers/exec/driver.go#L284) |
| `fingerprintSuccessful` | `d *Driver` | `` | `bool` | [L292](file:///d:/claude/nomad/drivers/exec/driver.go#L292) |
| `PluginInfo` | `d *Driver` | `` | `*base.PluginInfoResponse, error` | [L298](file:///d:/claude/nomad/drivers/exec/driver.go#L298) |
| `ConfigSchema` | `d *Driver` | `` | `*hclspec.Spec, error` | [L302](file:///d:/claude/nomad/drivers/exec/driver.go#L302) |
| `SetConfig` | `d *Driver` | `cfg *base.Config` | `error` | [L306](file:///d:/claude/nomad/drivers/exec/driver.go#L306) |
| `TaskConfigSchema` | `d *Driver` | `` | `*hclspec.Spec, error` | [L338](file:///d:/claude/nomad/drivers/exec/driver.go#L338) |
| `Capabilities` | `d *Driver` | `` | `*drivers.Capabilities, error` | [L344](file:///d:/claude/nomad/drivers/exec/driver.go#L344) |
| `Fingerprint` | `d *Driver` | `ctx context.Context` | `<-chan *drivers.Fingerprint, error` | [L348](file:///d:/claude/nomad/drivers/exec/driver.go#L348) |
| `handleFingerprint` | `d *Driver` | `ctx context.Context, ch chan<- *drivers.Fingerprint` | `` | [L354](file:///d:/claude/nomad/drivers/exec/driver.go#L354) |
| `buildFingerprint` | `d *Driver` | `` | `*drivers.Fingerprint` | [L370](file:///d:/claude/nomad/drivers/exec/driver.go#L370) |
| `RecoverTask` | `d *Driver` | `handle *drivers.TaskHandle` | `error` | [L404](file:///d:/claude/nomad/drivers/exec/driver.go#L404) |
| `StartTask` | `d *Driver` | `cfg *drivers.TaskConfig` | `handle *drivers.TaskHandle, network *drivers.DriverNetwor...` | [L459](file:///d:/claude/nomad/drivers/exec/driver.go#L459) |
| `WaitTask` | `d *Driver` | `ctx context.Context, taskID string` | `<-chan *drivers.ExitResult, error` | [L578](file:///d:/claude/nomad/drivers/exec/driver.go#L578) |
| `handleWait` | `d *Driver` | `ctx context.Context, handle *taskHandle, ch chan *drivers.ExitResult` | `` | [L590](file:///d:/claude/nomad/drivers/exec/driver.go#L590) |
| `StopTask` | `d *Driver` | `taskID string, timeout time.Duration, signal string` | `error` | [L621](file:///d:/claude/nomad/drivers/exec/driver.go#L621) |
| `DestroyTask` | `d *Driver` | `taskID string, force bool` | `error` | [L637](file:///d:/claude/nomad/drivers/exec/driver.go#L637) |
| `InspectTask` | `d *Driver` | `taskID string` | `*drivers.TaskStatus, error` | [L659](file:///d:/claude/nomad/drivers/exec/driver.go#L659) |
| `TaskStats` | `d *Driver` | `ctx context.Context, taskID string, interval time.Duration` | `<-chan *drivers.TaskResourceUsage, error` | [L668](file:///d:/claude/nomad/drivers/exec/driver.go#L668) |
| `TaskEvents` | `d *Driver` | `ctx context.Context` | `<-chan *drivers.TaskEvent, error` | [L677](file:///d:/claude/nomad/drivers/exec/driver.go#L677) |
| `SignalTask` | `d *Driver` | `taskID string, signal string` | `error` | [L681](file:///d:/claude/nomad/drivers/exec/driver.go#L681) |
| `ExecTask` | `d *Driver` | `taskID string, cmd []string, timeout time.Duration` | `*drivers.ExecTaskResult, error` | [L697](file:///d:/claude/nomad/drivers/exec/driver.go#L697) |
| `ExecTaskStreamingRaw` | `d *Driver` | `ctx context.Context, taskID string, command []string, tty bool, stream driver...` | `error` | [L726](file:///d:/claude/nomad/drivers/exec/driver.go#L726) |

## 5. 核心方法详解

### NewExecDriver()

**签名**：`func NewExecDriver(ctx context.Context, logger hclog.Logger) drivers.DriverPlugin`

**位置**：[L266](file:///d:/claude/nomad/drivers/exec/driver.go#L266)

**中文说明**：创建并返回一个新的 ExecDriver 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `logger` | `hclog.Logger` | 日志记录器 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `drivers.DriverPlugin` | — |

### Fingerprint()

**签名**：`func (d *Driver) Fingerprint(ctx context.Context) <-chan *drivers.Fingerprint, error`

**位置**：[L348](file:///d:/claude/nomad/drivers/exec/driver.go#L348)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `<-chan *drivers.Fingerprint` | 通道 |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `runtime` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cgroupslib` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/cpustats` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/capabilities` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/eventer` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/executor` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/resolvconf` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/validators` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/loader` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/fsisolation` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/utils` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/hclspec` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/hashicorp/consul-template/signals` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
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
| [driver_test.go](file:///d:/claude/nomad/drivers/exec/driver_test.go) | 对应测试文件 |
| [handle.go](file:///d:/claude/nomad/drivers/exec/handle.go) | 同目录源文件 |
| [state.go](file:///d:/claude/nomad/drivers/exec/state.go) | 同目录源文件 |

