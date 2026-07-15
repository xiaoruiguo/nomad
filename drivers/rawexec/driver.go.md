# driver.go 代码说明文档

> 文件路径：[drivers/rawexec/driver.go](file:///d:/claude/nomad/drivers/rawexec/driver.go)
> 总行数：649 行
> 所属包：`rawexec`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Raw Exec 驱动子包**（`drivers/rawexec`），实现 Nomad 的原始执行驱动，直接在主机上运行命令（无隔离），用于无法使用容器化或隔离的场景，不推荐在生产环境使用。

## 2. 类型定义

### UserIDValidator

**定义位置**：[L119](file:///d:/claude/nomad/drivers/rawexec/driver.go#L119)

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

### Driver

**定义位置**：[L126](file:///d:/claude/nomad/drivers/rawexec/driver.go#L126)

**中文说明**：Driver 与任务驱动（Driver）相关，驱动负责任务的实际执行。

**类型**：struct

```go
type Driver struct {
	eventer *eventer.Eventer
	config *Config
	nomadConfig *base.ClientDriverConfig
	tasks *taskStore
	ctx context.Context
	logger hclog.Logger
	compute cpustats.Compute
	userIDValidator UserIDValidator
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `eventer` | `*eventer.Eventer` | — |
| `config` | `*Config` | 配置 |
| `nomadConfig` | `*base.ClientDriverConfig` | — |
| `tasks` | `*taskStore` | — |
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `logger` | `hclog.Logger` | 日志记录器 |
| `compute` | `cpustats.Compute` | — |
| `userIDValidator` | `UserIDValidator` | — |

**关联方法**（21 个）：`PluginInfo`, `ConfigSchema`, `SetConfig`, `TaskConfigSchema`, `Capabilities`, `Fingerprint`, `handleFingerprint`, `buildFingerprint`, `RecoverTask`, `buildEnvList`, `StartTask`, `WaitTask`, `handleWait`, `StopTask`, `DestroyTask`, `InspectTask`, `TaskStats`, `TaskEvents`, `SignalTask`, `ExecTask`, `ExecTaskStreamingRaw`

### Config

**定义位置**：[L154](file:///d:/claude/nomad/drivers/rawexec/driver.go#L154)

**中文说明**：Config 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type Config struct {
	Enabled bool `codec:"enabled"`
	DeniedHostUids string `codec:"denied_host_uids"`
	DeniedHostGids string `codec:"denied_host_gids"`
	DeniedEnvvars []string `codec:"denied_envvars"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Enabled` | `bool `codec:"enabled"`` | 是否启用 |
| `DeniedHostUids` | `string `codec:"denied_host_uids"`` | 字符串 |
| `DeniedHostGids` | `string `codec:"denied_host_gids"`` | 字符串 |
| `DeniedEnvvars` | `[]string `codec:"denied_envvars"`` | 列表 |

### TaskConfig

**定义位置**：[L164](file:///d:/claude/nomad/drivers/rawexec/driver.go#L164)

**中文说明**：TaskConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type TaskConfig struct {
	Command string `codec:"command"`
	Args []string `codec:"args"`
	OverrideCgroupV2 string `codec:"cgroup_v2_override"`
	OverrideCgroupV1 hclutils.MapStrStr `codec:"cgroup_v1_override"`
	OOMScoreAdj int `codec:"oom_score_adj"`
	WorkDir string `codec:"work_dir"`
	DeniedEnvvars []string `codec:"denied_envvars"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Command` | `string `codec:"command"`` | 字符串 |
| `Args` | `[]string `codec:"args"`` | 参数 |
| `OverrideCgroupV2` | `string `codec:"cgroup_v2_override"`` | 字符串 |
| `OverrideCgroupV1` | `hclutils.MapStrStr `codec:"cgroup_v1_override"`` | — |
| `OOMScoreAdj` | `int `codec:"oom_score_adj"`` | — |
| `WorkDir` | `string `codec:"work_dir"`` | 字符串 |
| `DeniedEnvvars` | `[]string `codec:"denied_envvars"`` | 列表 |

**关联方法**（1 个）：`validate`

### TaskState

**定义位置**：[L209](file:///d:/claude/nomad/drivers/rawexec/driver.go#L209)

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

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `pluginName` | `—` | `"raw_exec"` | — |
| `fingerprintPeriod` | `—` | `30 * time.Second` | — |
| `taskHandleVersion` | `—` | `1` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `PluginID` | `—` | `loader.PluginID{...}` | — |
| `PluginConfig` | `—` | `&loader.InternalPluginConfig{...}` | — |
| `errDisabledDriver` | `—` | `fmt.Errorf("raw_exec is disabled")` | — |
| `pluginInfo` | `—` | `&base.PluginInfoResponse{...}` | — |
| `configSpec` | `—` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` | — |
| `taskConfigSpec` | `—` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` | — |
| `capabilities` | `—` | `&drivers.Capabilities{...}` | — |
| `_` | `drivers.ExecTaskStreamingRawDriver` | `(*Driver)(nil)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `PluginLoader` | - | `opts map[string]string` | `map[string]interface{}, error` | [L65](file:///d:/claude/nomad/drivers/rawexec/driver.go#L65) |
| `validate` | `t *TaskConfig` | `` | `error` | [L190](file:///d:/claude/nomad/drivers/rawexec/driver.go#L190) |
| `NewRawExecDriver` | - | `ctx context.Context, logger hclog.Logger` | `drivers.DriverPlugin` | [L217](file:///d:/claude/nomad/drivers/rawexec/driver.go#L217) |
| `PluginInfo` | `d *Driver` | `` | `*base.PluginInfoResponse, error` | [L228](file:///d:/claude/nomad/drivers/rawexec/driver.go#L228) |
| `ConfigSchema` | `d *Driver` | `` | `*hclspec.Spec, error` | [L232](file:///d:/claude/nomad/drivers/rawexec/driver.go#L232) |
| `SetConfig` | `d *Driver` | `cfg *base.Config` | `error` | [L236](file:///d:/claude/nomad/drivers/rawexec/driver.go#L236) |
| `TaskConfigSchema` | `d *Driver` | `` | `*hclspec.Spec, error` | [L264](file:///d:/claude/nomad/drivers/rawexec/driver.go#L264) |
| `Capabilities` | `d *Driver` | `` | `*drivers.Capabilities, error` | [L268](file:///d:/claude/nomad/drivers/rawexec/driver.go#L268) |
| `Fingerprint` | `d *Driver` | `ctx context.Context` | `<-chan *drivers.Fingerprint, error` | [L272](file:///d:/claude/nomad/drivers/rawexec/driver.go#L272) |
| `handleFingerprint` | `d *Driver` | `ctx context.Context, ch chan<- *drivers.Fingerprint` | `` | [L278](file:///d:/claude/nomad/drivers/rawexec/driver.go#L278) |
| `buildFingerprint` | `d *Driver` | `` | `*drivers.Fingerprint` | [L294](file:///d:/claude/nomad/drivers/rawexec/driver.go#L294) |
| `RecoverTask` | `d *Driver` | `handle *drivers.TaskHandle` | `error` | [L314](file:///d:/claude/nomad/drivers/rawexec/driver.go#L314) |
| `buildEnvList` | `d *Driver` | `tc *TaskConfig, cfg *drivers.TaskConfig` | `[]string` | [L370](file:///d:/claude/nomad/drivers/rawexec/driver.go#L370) |
| `StartTask` | `d *Driver` | `cfg *drivers.TaskConfig` | `*drivers.TaskHandle, *drivers.DriverNetwork, error` | [L391](file:///d:/claude/nomad/drivers/rawexec/driver.go#L391) |
| `WaitTask` | `d *Driver` | `ctx context.Context, taskID string` | `<-chan *drivers.ExitResult, error` | [L484](file:///d:/claude/nomad/drivers/rawexec/driver.go#L484) |
| `handleWait` | `d *Driver` | `ctx context.Context, handle *taskHandle, ch chan *drivers.ExitResult` | `` | [L496](file:///d:/claude/nomad/drivers/rawexec/driver.go#L496) |
| `StopTask` | `d *Driver` | `taskID string, timeout time.Duration, signal string` | `error` | [L527](file:///d:/claude/nomad/drivers/rawexec/driver.go#L527) |
| `DestroyTask` | `d *Driver` | `taskID string, force bool` | `error` | [L549](file:///d:/claude/nomad/drivers/rawexec/driver.go#L549) |
| `InspectTask` | `d *Driver` | `taskID string` | `*drivers.TaskStatus, error` | [L571](file:///d:/claude/nomad/drivers/rawexec/driver.go#L571) |
| `TaskStats` | `d *Driver` | `ctx context.Context, taskID string, interval time.Duration` | `<-chan *drivers.TaskResourceUsage, error` | [L580](file:///d:/claude/nomad/drivers/rawexec/driver.go#L580) |
| `TaskEvents` | `d *Driver` | `ctx context.Context` | `<-chan *drivers.TaskEvent, error` | [L589](file:///d:/claude/nomad/drivers/rawexec/driver.go#L589) |
| `SignalTask` | `d *Driver` | `taskID string, signal string` | `error` | [L593](file:///d:/claude/nomad/drivers/rawexec/driver.go#L593) |
| `ExecTask` | `d *Driver` | `taskID string, cmd []string, timeout time.Duration` | `*drivers.ExecTaskResult, error` | [L609](file:///d:/claude/nomad/drivers/rawexec/driver.go#L609) |
| `ExecTaskStreamingRaw` | `d *Driver` | `ctx context.Context, taskID string, command []string, tty bool, stream driver...` | `error` | [L633](file:///d:/claude/nomad/drivers/rawexec/driver.go#L633) |

## 5. 核心方法详解

### NewRawExecDriver()

**签名**：`func NewRawExecDriver(ctx context.Context, logger hclog.Logger) drivers.DriverPlugin`

**位置**：[L217](file:///d:/claude/nomad/drivers/rawexec/driver.go#L217)

**中文说明**：创建并返回一个新的 RawExecDriver 实例。

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

**位置**：[L272](file:///d:/claude/nomad/drivers/rawexec/driver.go#L272)

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
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `slices` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cgroupslib` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/cpustats` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/eventer` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/executor` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/validators` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/hclutils` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/loader` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/fsisolation` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/hclspec` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/hashicorp/consul-template/signals` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/ryanuber/go-glob` | 第三方库 |

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
| [driver_test.go](file:///d:/claude/nomad/drivers/rawexec/driver_test.go) | 对应测试文件 |
| [driver_unix.go](file:///d:/claude/nomad/drivers/rawexec/driver_unix.go) | 同目录源文件 |
| [driver_windows.go](file:///d:/claude/nomad/drivers/rawexec/driver_windows.go) | 同目录源文件 |
| [handle.go](file:///d:/claude/nomad/drivers/rawexec/handle.go) | 同目录源文件 |
| [state.go](file:///d:/claude/nomad/drivers/rawexec/state.go) | 同目录源文件 |

