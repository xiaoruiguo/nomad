# driver.go 代码说明文档

> 文件路径：[drivers/qemu/driver.go](file:///d:/claude/nomad/drivers/qemu/driver.go)
> 总行数：889 行
> 所属包：`qemu`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **QEMU 驱动子包**（`drivers/qemu`），实现 Nomad 的 QEMU 任务驱动，通过 QEMU 虚拟机运行镜像文件，支持端口映射和资源限制。

## 2. 类型定义

### TaskConfig

**定义位置**：[L123](file:///d:/claude/nomad/drivers/qemu/driver.go#L123)

**类型**：struct

```go
	ImagePath string `codec:"image_path"`
	Emulator string `codec:"emulator"`
	MachineType string `codec:"machine_type"`
	Accelerator string `codec:"accelerator"`
	Args []string `codec:"args"`
	PortMap hclutils.MapStrInt `codec:"port_map"`
	GracefulShutdown bool `codec:"graceful_shutdown"`
	DriveInterface string `codec:"drive_interface"`
	GuestAgent bool `codec:"guest_agent"`
```

### TaskState

**定义位置**：[L138](file:///d:/claude/nomad/drivers/qemu/driver.go#L138)

**类型**：struct

```go
	ReattachConfig *pstructs.ReattachConfig
	TaskConfig *drivers.TaskConfig
	Pid int
	StartedAt time.Time
```

### Config

**定义位置**：[L146](file:///d:/claude/nomad/drivers/qemu/driver.go#L146)

**类型**：struct

```go
	ImagePaths []string `codec:"image_paths"`
	ArgsAllowList []string `codec:"args_allowlist"`
	EmulatorsAllowList []string `codec:"emulators_allowlist"`
```

### Driver

**定义位置**：[L162](file:///d:/claude/nomad/drivers/qemu/driver.go#L162)

**类型**：struct

```go
	eventer *eventer.Eventer
	config Config
	tasks *taskStore
	ctx context.Context
	nomadConfig *base.ClientDriverConfig
	logger hclog.Logger
```

**关联方法**（19 个）：`PluginInfo`, `ConfigSchema`, `SetConfig`, `TaskConfigSchema`, `Capabilities`, `Fingerprint`, `handleFingerprint`, `buildFingerprint`, `RecoverTask`, `StartTask`, `WaitTask`, `StopTask`, `DestroyTask`, `InspectTask`, `TaskStats`, `TaskEvents`, `SignalTask`, `ExecTask`, `handleWait`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `pluginName` | `"qemu"` |
| `fingerprintPeriod` | `30 * time.Second` |
| `driverAttr` | `"driver.qemu"` |
| `driverVersionAttr` | `"driver.qemu.version"` |
| `driverEmulatorsAttr` | `"driver.qemu.emulators"` |
| `qemuGracefulShutdownMsg` | `"system_powerdown\n"` |
| `qemuMonitorSocketName` | `"qm.sock"` |
| `qemuGuestAgentSocketName` | `"qa.sock"` |
| `taskHandleVersion` | `1` |

### 变量

| 名称 | 值 |
|------|----|
| `PluginID` | `loader.PluginID{...}` |
| `PluginConfig` | `&loader.InternalPluginConfig{...}` |
| `versionRegex` | `regexp.MustCompile(`version (\d[\.\d+]+)`)` |
| `pluginInfo` | `&base.PluginInfoResponse{...}` |
| `configSpec` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` |
| `taskConfigSpec` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` |
| `capabilities` | `&drivers.Capabilities{...}` |
| `_` | `(*Driver)(nil)` |
| `allowedDriveInterfaces` | `[]string{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewQemuDriver` | - | `ctx context.Context, logger hclog.Logger` | `drivers.DriverPlugin` | [L184](file:///d:/claude/nomad/drivers/qemu/driver.go#L184) |
| `PluginInfo` | `d *Driver` | - | `*base.PluginInfoResponse, error` | [L194](file:///d:/claude/nomad/drivers/qemu/driver.go#L194) |
| `ConfigSchema` | `d *Driver` | - | `*hclspec.Spec, error` | [L198](file:///d:/claude/nomad/drivers/qemu/driver.go#L198) |
| `SetConfig` | `d *Driver` | `cfg *base.Config` | `error` | [L202](file:///d:/claude/nomad/drivers/qemu/driver.go#L202) |
| `TaskConfigSchema` | `d *Driver` | - | `*hclspec.Spec, error` | [L217](file:///d:/claude/nomad/drivers/qemu/driver.go#L217) |
| `Capabilities` | `d *Driver` | - | `*drivers.Capabilities, error` | [L221](file:///d:/claude/nomad/drivers/qemu/driver.go#L221) |
| `Fingerprint` | `d *Driver` | `ctx context.Context` | `chan *drivers.Fingerprint, error` | [L225](file:///d:/claude/nomad/drivers/qemu/driver.go#L225) |
| `handleFingerprint` | `d *Driver` | `ctx context.Context, ch chan *drivers.Fingerprint` | - | [L231](file:///d:/claude/nomad/drivers/qemu/driver.go#L231) |
| `buildFingerprint` | `d *Driver` | - | `*drivers.Fingerprint` | [L246](file:///d:/claude/nomad/drivers/qemu/driver.go#L246) |
| `RecoverTask` | `d *Driver` | `handle *drivers.TaskHandle` | `error` | [L286](file:///d:/claude/nomad/drivers/qemu/driver.go#L286) |
| `findEmulators` | - | `allowList []string` | `[]string` | [L359](file:///d:/claude/nomad/drivers/qemu/driver.go#L359) |
| `isAllowedImagePath` | - | `allowedPaths []string, allocDir string, imagePath string` | `bool` | [L394](file:///d:/claude/nomad/drivers/qemu/driver.go#L394) |
| `isAllowedDriveInterface` | - | `driveInterface string` | `bool` | [L422](file:///d:/claude/nomad/drivers/qemu/driver.go#L422) |
| `validateEmulator` | - | `emulator string, allowedEmulators []string` | `error` | [L427](file:///d:/claude/nomad/drivers/qemu/driver.go#L427) |
| `validateArgs` | - | `pluginConfigAllowList []string, args []string` | `error` | [L439](file:///d:/claude/nomad/drivers/qemu/driver.go#L439) |
| `StartTask` | `d *Driver` | `cfg *drivers.TaskConfig` | `*drivers.TaskHandle, *drivers.DriverNetwork, error` | [L456](file:///d:/claude/nomad/drivers/qemu/driver.go#L456) |
| `WaitTask` | `d *Driver` | `ctx context.Context, taskID string` | `chan *drivers.ExitResult, error` | [L707](file:///d:/claude/nomad/drivers/qemu/driver.go#L707) |
| `StopTask` | `d *Driver` | `taskID string, timeout time.Duration, signal string` | `error` | [L719](file:///d:/claude/nomad/drivers/qemu/driver.go#L719) |
| `DestroyTask` | `d *Driver` | `taskID string, force bool` | `error` | [L765](file:///d:/claude/nomad/drivers/qemu/driver.go#L765) |
| `InspectTask` | `d *Driver` | `taskID string` | `*drivers.TaskStatus, error` | [L787](file:///d:/claude/nomad/drivers/qemu/driver.go#L787) |
| `TaskStats` | `d *Driver` | `ctx context.Context, taskID string, interval time.Duration` | `chan *drivers.TaskResourceUsage, error` | [L796](file:///d:/claude/nomad/drivers/qemu/driver.go#L796) |
| `TaskEvents` | `d *Driver` | `ctx context.Context` | `chan *drivers.TaskEvent, error` | [L805](file:///d:/claude/nomad/drivers/qemu/driver.go#L805) |
| `SignalTask` | `d *Driver` | `_ string, _ string` | `error` | [L809](file:///d:/claude/nomad/drivers/qemu/driver.go#L809) |
| `ExecTask` | `d *Driver` | `_ string, _ []string, _ time.Duration` | `*drivers.ExecTaskResult, error` | [L813](file:///d:/claude/nomad/drivers/qemu/driver.go#L813) |
| `GetAbsolutePath` | - | `bin string` | `string, error` | [L820](file:///d:/claude/nomad/drivers/qemu/driver.go#L820) |
| `handleWait` | `d *Driver` | `ctx context.Context, handle *taskHandle, ch chan *drivers.ExitResult` | - | [L829](file:///d:/claude/nomad/drivers/qemu/driver.go#L829) |
| `validateSocketPath` | - | `path string` | `error` | [L860](file:///d:/claude/nomad/drivers/qemu/driver.go#L860) |
| `sendQemuShutdown` | - | `logger hclog.Logger, monitorPath string, userPid int` | `error` | [L872](file:///d:/claude/nomad/drivers/qemu/driver.go#L872) |

## 5. 核心方法详解

### NewQemuDriver()

**签名**：`func NewQemuDriver(ctx context.Context, logger hclog.Logger) drivers.DriverPlugin`

**位置**：[L184](file:///d:/claude/nomad/drivers/qemu/driver.go#L184)

### Fingerprint()

**签名**：`func (d *Driver) Fingerprint(ctx context.Context) chan *drivers.Fingerprint, error`

**位置**：[L225](file:///d:/claude/nomad/drivers/qemu/driver.go#L225)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `net` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `path/filepath` | 标准库 |
| `regexp` | 标准库 |
| `runtime` | 标准库 |
| `slices` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/eventer` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/executor` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/hclutils` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/loader` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/fsisolation` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/hclspec` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [driver_test.go](file:///d:/claude/nomad/drivers/qemu/driver_test.go) | 对应测试文件 |

