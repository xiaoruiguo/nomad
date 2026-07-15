# driver.go 代码说明文档

> 文件路径：[drivers/java/driver.go](file:///d:/claude/nomad/drivers/java/driver.go)
> 总行数：757 行
> 所属包：`java`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Java 驱动子包**（`drivers/java`），实现 Nomad 的 Java 任务驱动，通过 JVM 运行 Java 应用程序（jar 文件），支持 JVM 参数配置和进程管理。

## 2. 类型定义

### Config

**定义位置**：[L128](file:///d:/claude/nomad/drivers/java/driver.go#L128)

**中文说明**：Config 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type Config struct {
	DefaultModePID string `codec:"default_pid_mode"`
	DefaultModeIPC string `codec:"default_ipc_mode"`
	AllowCaps []string `codec:"allow_caps"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DefaultModePID` | `string `codec:"default_pid_mode"`` | 字符串 |
| `DefaultModeIPC` | `string `codec:"default_ipc_mode"`` | 字符串 |
| `AllowCaps` | `[]string `codec:"allow_caps"`` | 列表 |

**关联方法**（1 个）：`validate`

### TaskConfig

**定义位置**：[L164](file:///d:/claude/nomad/drivers/java/driver.go#L164)

**中文说明**：TaskConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type TaskConfig struct {
	Class string `codec:"class"`
	ClassPath string `codec:"class_path"`
	JarPath string `codec:"jar_path"`
	JvmOpts []string `codec:"jvm_options"`
	Args []string `codec:"args"`
	ModePID string `codec:"pid_mode"`
	ModeIPC string `codec:"ipc_mode"`
	CapAdd []string `codec:"cap_add"`
	CapDrop []string `codec:"cap_drop"`
	WorkDir string `coded:"work_dir"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Class` | `string `codec:"class"`` | 字符串 |
| `ClassPath` | `string `codec:"class_path"`` | 字符串 |
| `JarPath` | `string `codec:"jar_path"`` | 字符串 |
| `JvmOpts` | `[]string `codec:"jvm_options"`` | 列表 |
| `Args` | `[]string `codec:"args"`` | 参数 |
| `ModePID` | `string `codec:"pid_mode"`` | 字符串 |
| `ModeIPC` | `string `codec:"ipc_mode"`` | 字符串 |
| `CapAdd` | `[]string `codec:"cap_add"`` | 列表 |
| `CapDrop` | `[]string `codec:"cap_drop"`` | 列表 |
| `WorkDir` | `string `coded:"work_dir"`` | 字符串 |

**关联方法**（1 个）：`validate`

### TaskState

**定义位置**：[L231](file:///d:/claude/nomad/drivers/java/driver.go#L231)

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

### Driver

**定义位置**：[L239](file:///d:/claude/nomad/drivers/java/driver.go#L239)

**中文说明**：Driver 与任务驱动（Driver）相关，驱动负责任务的实际执行。

**类型**：struct

```go
type Driver struct {
	eventer *eventer.Eventer
	config Config
	tasks *taskStore
	ctx context.Context
	nomadConfig *base.ClientDriverConfig
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `eventer` | `*eventer.Eventer` | — |
| `config` | `Config` | 配置 |
| `tasks` | `*taskStore` | — |
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `nomadConfig` | `*base.ClientDriverConfig` | — |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（20 个）：`PluginInfo`, `ConfigSchema`, `SetConfig`, `TaskConfigSchema`, `Capabilities`, `Fingerprint`, `handleFingerprint`, `buildFingerprint`, `RecoverTask`, `StartTask`, `WaitTask`, `handleWait`, `StopTask`, `DestroyTask`, `InspectTask`, `TaskStats`, `TaskEvents`, `SignalTask`, `ExecTask`, `ExecTaskStreamingRaw`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `pluginName` | `—` | `"java"` | — |
| `fingerprintPeriod` | `—` | `30 * time.Second` | — |
| `driverAttr` | `—` | `"driver.java"` | — |
| `driverVersionAttr` | `—` | `"driver.java.version"` | — |
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
| `_` | `drivers.DriverPlugin` | `(*Driver)(nil)` | — |
| `_` | `drivers.ExecTaskStreamingRawDriver` | `(*Driver)(nil)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `init` | - | `` | `` | [L120](file:///d:/claude/nomad/drivers/java/driver.go#L120) |
| `validate` | `c *Config` | `` | `error` | [L142](file:///d:/claude/nomad/drivers/java/driver.go#L142) |
| `validate` | `tc *TaskConfig` | `` | `error` | [L198](file:///d:/claude/nomad/drivers/java/driver.go#L198) |
| `NewDriver` | - | `ctx context.Context, logger hclog.Logger` | `drivers.DriverPlugin` | [L261](file:///d:/claude/nomad/drivers/java/driver.go#L261) |
| `PluginInfo` | `d *Driver` | `` | `*base.PluginInfoResponse, error` | [L271](file:///d:/claude/nomad/drivers/java/driver.go#L271) |
| `ConfigSchema` | `d *Driver` | `` | `*hclspec.Spec, error` | [L275](file:///d:/claude/nomad/drivers/java/driver.go#L275) |
| `SetConfig` | `d *Driver` | `cfg *base.Config` | `error` | [L279](file:///d:/claude/nomad/drivers/java/driver.go#L279) |
| `TaskConfigSchema` | `d *Driver` | `` | `*hclspec.Spec, error` | [L298](file:///d:/claude/nomad/drivers/java/driver.go#L298) |
| `Capabilities` | `d *Driver` | `` | `*drivers.Capabilities, error` | [L302](file:///d:/claude/nomad/drivers/java/driver.go#L302) |
| `Fingerprint` | `d *Driver` | `ctx context.Context` | `<-chan *drivers.Fingerprint, error` | [L306](file:///d:/claude/nomad/drivers/java/driver.go#L306) |
| `handleFingerprint` | `d *Driver` | `ctx context.Context, ch chan *drivers.Fingerprint` | `` | [L312](file:///d:/claude/nomad/drivers/java/driver.go#L312) |
| `buildFingerprint` | `d *Driver` | `` | `*drivers.Fingerprint` | [L327](file:///d:/claude/nomad/drivers/java/driver.go#L327) |
| `RecoverTask` | `d *Driver` | `handle *drivers.TaskHandle` | `error` | [L378](file:///d:/claude/nomad/drivers/java/driver.go#L378) |
| `StartTask` | `d *Driver` | `cfg *drivers.TaskConfig` | `handle *drivers.TaskHandle, network *drivers.DriverNetwor...` | [L432](file:///d:/claude/nomad/drivers/java/driver.go#L432) |
| `javaCmdArgs` | - | `driverConfig TaskConfig` | `[]string` | [L556](file:///d:/claude/nomad/drivers/java/driver.go#L556) |
| `WaitTask` | `d *Driver` | `ctx context.Context, taskID string` | `<-chan *drivers.ExitResult, error` | [L587](file:///d:/claude/nomad/drivers/java/driver.go#L587) |
| `handleWait` | `d *Driver` | `ctx context.Context, handle *taskHandle, ch chan *drivers.ExitResult` | `` | [L599](file:///d:/claude/nomad/drivers/java/driver.go#L599) |
| `StopTask` | `d *Driver` | `taskID string, timeout time.Duration, signal string` | `error` | [L630](file:///d:/claude/nomad/drivers/java/driver.go#L630) |
| `DestroyTask` | `d *Driver` | `taskID string, force bool` | `error` | [L646](file:///d:/claude/nomad/drivers/java/driver.go#L646) |
| `InspectTask` | `d *Driver` | `taskID string` | `*drivers.TaskStatus, error` | [L668](file:///d:/claude/nomad/drivers/java/driver.go#L668) |
| `TaskStats` | `d *Driver` | `ctx context.Context, taskID string, interval time.Duration` | `<-chan *drivers.TaskResourceUsage, error` | [L677](file:///d:/claude/nomad/drivers/java/driver.go#L677) |
| `TaskEvents` | `d *Driver` | `ctx context.Context` | `<-chan *drivers.TaskEvent, error` | [L686](file:///d:/claude/nomad/drivers/java/driver.go#L686) |
| `SignalTask` | `d *Driver` | `taskID string, signal string` | `error` | [L690](file:///d:/claude/nomad/drivers/java/driver.go#L690) |
| `ExecTask` | `d *Driver` | `taskID string, cmd []string, timeout time.Duration` | `*drivers.ExecTaskResult, error` | [L706](file:///d:/claude/nomad/drivers/java/driver.go#L706) |
| `ExecTaskStreamingRaw` | `d *Driver` | `ctx context.Context, taskID string, command []string, tty bool, stream driver...` | `error` | [L730](file:///d:/claude/nomad/drivers/java/driver.go#L730) |
| `GetAbsolutePath` | - | `bin string` | `string, error` | [L749](file:///d:/claude/nomad/drivers/java/driver.go#L749) |

## 5. 核心方法详解

### NewDriver()

**签名**：`func NewDriver(ctx context.Context, logger hclog.Logger) drivers.DriverPlugin`

**位置**：[L261](file:///d:/claude/nomad/drivers/java/driver.go#L261)

**中文说明**：创建并返回一个新的 Driver 实例。

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

**位置**：[L306](file:///d:/claude/nomad/drivers/java/driver.go#L306)

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
| `os/exec` | 标准库 |
| `path/filepath` | 标准库 |
| `runtime` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cgroupslib` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/capabilities` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/eventer` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/executor` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/resolvconf` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/loader` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/fsisolation` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/utils` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/hclspec` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/hashicorp/consul-template/signals` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

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
| [driver_test.go](file:///d:/claude/nomad/drivers/java/driver_test.go) | 对应测试文件 |
| [handle.go](file:///d:/claude/nomad/drivers/java/handle.go) | 同目录源文件 |
| [state.go](file:///d:/claude/nomad/drivers/java/state.go) | 同目录源文件 |
| [utils.go](file:///d:/claude/nomad/drivers/java/utils.go) | 同目录源文件 |

