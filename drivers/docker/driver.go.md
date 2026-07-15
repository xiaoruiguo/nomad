# driver.go 代码说明文档

> 文件路径：[drivers/docker/driver.go](file:///d:/claude/nomad/drivers/docker/driver.go)
> 总行数：2127 行
> 所属包：`docker`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Docker 驱动子包**（`drivers/docker`），实现 Nomad 的 Docker 任务驱动，通过 Docker API 管理容器的生命周期（创建、启动、停止、销毁）、资源限制、网络配置和日志收集。支持 Docker API 版本协商、认证、健康检查和统计信息收集。

## 2. 类型定义

### pauseContainerStore

**定义位置**：[L98](file:///d:/claude/nomad/drivers/docker/driver.go#L98)

**类型**：struct

```go
	lock sync.Mutex
	containerIDs *set.Set[string]
```

**关联方法**（3 个）：`add`, `remove`, `union`

### createContainerOptions

**定义位置**：[L127](file:///d:/claude/nomad/drivers/docker/driver.go#L127)

**类型**：struct

```go
	Name string
	Config *containerapi.Config
	Host *containerapi.HostConfig
	Networking *networkapi.NetworkingConfig
```

### Driver

**定义位置**：[L134](file:///d:/claude/nomad/drivers/docker/driver.go#L134)

**类型**：struct

```go
	eventer *eventer.Eventer
	config *DriverConfig
	clientConfig *base.ClientDriverConfig
	ctx context.Context
	tasks *taskStore
	pauseContainers *pauseContainerStore
	coordinator *dockerCoordinator
	logger hclog.Logger
	gpuRuntime bool
	compute cpustats.Compute
	fingerprintSuccess *bool
	fingerprintLock sync.RWMutex
	detected bool
	detectedLock sync.RWMutex
	dockerClientLock sync.Mutex
	dockerClient *client.Client
	infinityClient *client.Client
	danglingReconciler *containerReconciler
```

**关联方法**（35 个）：`reattachToDockerLogger`, `setupNewDockerLogger`, `RecoverTask`, `StartTask`, `createContainer`, `startContainer`, `createImage`, `pullImage`, `emitEventFunc`, `resolveRegistryAuthentication`, `loadImage`, `convertAllocPathsForWindowsLCOW`, `containerBinds`, `findPauseContainer`, `recoverPauseContainers`, `cpuResources`, `createContainerConfig`, `toDockerMount`, `detectIP`, `containerByName`, `WaitTask`, `handleWait`, `StopTask`, `DestroyTask`, `cleanupImage`, `InspectTask`, `TaskStats`, `TaskEvents`, `SignalTask`, `ExecTask`, `ExecTaskStreaming`, `getOrCreateClient`, `getInfinityClient`, `getDockerClient`, `newDockerClient`

### createContainerClient

**定义位置**：[L497](file:///d:/claude/nomad/drivers/docker/driver.go#L497)

**类型**：interface

```go
	ContainerCreate
	ContainerInspect
	ContainerList
	ContainerRemove
```

### authBackend

**定义位置**：[L700](file:///d:/claude/nomad/drivers/docker/driver.go#L700)

**类型定义**：`func(...)`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `dockerLabelAllocID` | `"com.hashicorp.nomad.alloc_id"` |
| `dockerLabelJobName` | `"com.hashicorp.nomad.job_name"` |
| `dockerLabelJobID` | `"com.hashicorp.nomad.job_id"` |
| `dockerLabelTaskGroupName` | `"com.hashicorp.nomad.task_group_name"` |
| `dockerLabelTaskName` | `"com.hashicorp.nomad.task_name"` |
| `dockerLabelNamespace` | `"com.hashicorp.nomad.namespace"` |
| `dockerLabelNodeName` | `"com.hashicorp.nomad.node_name"` |
| `dockerLabelNodeID` | `"com.hashicorp.nomad.node_id"` |
| `dockerLabelParentJobID` | `"com.hashicorp.nomad.parent_job_id"` |
| `windowsIsolationModeProcess` | `"process"` |
| `windowsIsolationModeHyperV` | `"hyperv"` |
| `memoryNoLimit` | `-1` |
| `maxCPUShares` | `262_144` |
| `minCPUShares` | `2` |

### 变量

| 名称 | 值 |
|------|----|
| `dockerTransientErrs` | `[]string{...}` |
| `recoverableErrTimeouts` | `*ast.FuncLit` |
| `taskHandleVersion` | `1` |
| `nvidiaVisibleDevices` | `"NVIDIA_VISIBLE_DEVICES"` |
| `windowsIsolationModes` | `[]string{...}` |
| `userMountToUnixMount` | `map[string]string{...}` |
| `_` | `(*Driver)(nil)` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newPauseContainerStore` | - | - | `*pauseContainerStore` | [L103](file:///d:/claude/nomad/drivers/docker/driver.go#L103) |
| `add` | `s *pauseContainerStore` | `id string` | - | [L109](file:///d:/claude/nomad/drivers/docker/driver.go#L109) |
| `remove` | `s *pauseContainerStore` | `id string` | - | [L115](file:///d:/claude/nomad/drivers/docker/driver.go#L115) |
| `union` | `s *pauseContainerStore` | `other *set.Set[string]` | `set.Collection[string]` | [L121](file:///d:/claude/nomad/drivers/docker/driver.go#L121) |
| `NewDockerDriver` | - | `ctx context.Context, logger hclog.Logger` | `drivers.DriverPlugin` | [L187](file:///d:/claude/nomad/drivers/docker/driver.go#L187) |
| `reattachToDockerLogger` | `d *Driver` | `reattachConfig *pstructs.ReattachConfig` | `docklog.DockerLogger, *plugin.Client, error` | [L200](file:///d:/claude/nomad/drivers/docker/driver.go#L200) |
| `setupNewDockerLogger` | `d *Driver` | `container mclient.ContainerInspectResult, cfg *drivers.TaskConfig, startTime...` | `docklog.DockerLogger, *plugin.Client, error` | [L214](file:///d:/claude/nomad/drivers/docker/driver.go#L214) |
| `RecoverTask` | `d *Driver` | `handle *drivers.TaskHandle` | `error` | [L241](file:///d:/claude/nomad/drivers/docker/driver.go#L241) |
| `loggingIsEnabled` | - | `driverCfg *DriverConfig, taskCfg *drivers.TaskConfig` | `bool` | [L318](file:///d:/claude/nomad/drivers/docker/driver.go#L318) |
| `StartTask` | `d *Driver` | `cfg *drivers.TaskConfig` | `*drivers.TaskHandle, *drivers.DriverNetwork, error` | [L328](file:///d:/claude/nomad/drivers/docker/driver.go#L328) |
| `createContainer` | `d *Driver` | `client createContainerClient, config createContainerOptions, image string` | `*mclient.ContainerInspectResult, error` | [L506](file:///d:/claude/nomad/drivers/docker/driver.go#L506) |
| `startContainer` | `d *Driver` | `c mclient.ContainerInspectResult` | `error` | [L587](file:///d:/claude/nomad/drivers/docker/driver.go#L587) |
| `createImage` | `d *Driver` | `task *drivers.TaskConfig, driverConfig *TaskConfig, client *client.Client` | `string, string, error` | [L619](file:///d:/claude/nomad/drivers/docker/driver.go#L619) |
| `pullImage` | `d *Driver` | `task *drivers.TaskConfig, driverConfig *TaskConfig, repo string, tag string` | `id string, user string, err error` | [L653](file:///d:/claude/nomad/drivers/docker/driver.go#L653) |
| `emitEventFunc` | `d *Driver` | `task *drivers.TaskConfig` | `LogEventFn` | [L686](file:///d:/claude/nomad/drivers/docker/driver.go#L686) |
| `resolveRegistryAuthentication` | `d *Driver` | `driverConfig *TaskConfig, repo string` | `*registry.AuthConfig, error` | [L704](file:///d:/claude/nomad/drivers/docker/driver.go#L704) |
| `loadImage` | `d *Driver` | `task *drivers.TaskConfig, driverConfig *TaskConfig, dockerClient *client.Cli...` | `id string, user string, err error` | [L713](file:///d:/claude/nomad/drivers/docker/driver.go#L713) |
| `convertAllocPathsForWindowsLCOW` | `d *Driver` | `task *drivers.TaskConfig, image string` | `error` | [L741](file:///d:/claude/nomad/drivers/docker/driver.go#L741) |
| `containerBinds` | `d *Driver` | `task *drivers.TaskConfig, driverConfig *TaskConfig` | `[]string, error` | [L763](file:///d:/claude/nomad/drivers/docker/driver.go#L763) |
| `findPauseContainer` | `d *Driver` | `allocID string` | `string, error` | [L830](file:///d:/claude/nomad/drivers/docker/driver.go#L830) |
| `recoverPauseContainers` | `d *Driver` | `ctx context.Context` | - | [L864](file:///d:/claude/nomad/drivers/docker/driver.go#L864) |
| `parseSecurityOpts` | - | `securityOpts []string` | `[]string, error` | [L903](file:///d:/claude/nomad/drivers/docker/driver.go#L903) |
| `memoryLimits` | - | `driverHardLimitMB int64, taskMemory drivers.MemoryResources` | `memory int64, reserve int64` | [L957](file:///d:/claude/nomad/drivers/docker/driver.go#L957) |
| `mbToBytes` | - | `n int64` | `int64` | [L970](file:///d:/claude/nomad/drivers/docker/driver.go#L970) |
| `cpuResources` | `d *Driver` | `requested int64` | `int64` | [L983](file:///d:/claude/nomad/drivers/docker/driver.go#L983) |
| `createContainerConfig` | `d *Driver` | `task *drivers.TaskConfig, driverConfig *TaskConfig, imageID string` | `createContainerOptions, error` | [L998](file:///d:/claude/nomad/drivers/docker/driver.go#L998) |
| `toDockerMount` | `d *Driver` | `m *DockerMount, task *drivers.TaskConfig` | `*mount.Mount, error` | [L1562](file:///d:/claude/nomad/drivers/docker/driver.go#L1562) |
| `detectIP` | `d *Driver` | `c mclient.ContainerInspectResult, driverConfig *TaskConfig` | `string, bool` | [L1594](file:///d:/claude/nomad/drivers/docker/driver.go#L1594) |
| `containerByName` | `d *Driver` | `name string` | `*mclient.ContainerInspectResult, error` | [L1639](file:///d:/claude/nomad/drivers/docker/driver.go#L1639) |
| `validateCommand` | - | `command string, argField string` | `error` | [L1691](file:///d:/claude/nomad/drivers/docker/driver.go#L1691) |
| `WaitTask` | `d *Driver` | `ctx context.Context, taskID string` | `chan *drivers.ExitResult, error` | [L1704](file:///d:/claude/nomad/drivers/docker/driver.go#L1704) |
| `handleWait` | `d *Driver` | `ctx context.Context, ch chan *drivers.ExitResult, h *taskHandle` | - | [L1714](file:///d:/claude/nomad/drivers/docker/driver.go#L1714) |
| `StopTask` | `d *Driver` | `taskID string, timeout time.Duration, signal string` | `error` | [L1726](file:///d:/claude/nomad/drivers/docker/driver.go#L1726) |
| `DestroyTask` | `d *Driver` | `taskID string, force bool` | `error` | [L1735](file:///d:/claude/nomad/drivers/docker/driver.go#L1735) |
| `cleanupImage` | `d *Driver` | `handle *taskHandle` | `error` | [L1785](file:///d:/claude/nomad/drivers/docker/driver.go#L1785) |
| `InspectTask` | `d *Driver` | `taskID string` | `*drivers.TaskStatus, error` | [L1795](file:///d:/claude/nomad/drivers/docker/driver.go#L1795) |
| `TaskStats` | `d *Driver` | `ctx context.Context, taskID string, interval time.Duration` | `chan *drivers.TaskResourceUsage, error` | [L1837](file:///d:/claude/nomad/drivers/docker/driver.go#L1837) |
| `TaskEvents` | `d *Driver` | `ctx context.Context` | `chan *drivers.TaskEvent, error` | [L1846](file:///d:/claude/nomad/drivers/docker/driver.go#L1846) |
| `SignalTask` | `d *Driver` | `taskID string, signal string` | `error` | [L1850](file:///d:/claude/nomad/drivers/docker/driver.go#L1850) |
| `ExecTask` | `d *Driver` | `taskID string, cmd []string, timeout time.Duration` | `*drivers.ExecTaskResult, error` | [L1868](file:///d:/claude/nomad/drivers/docker/driver.go#L1868) |
| `ExecTaskStreaming` | `d *Driver` | `ctx context.Context, taskID string, opts *drivers.ExecOptions` | `*drivers.ExitResult, error` | [L1886](file:///d:/claude/nomad/drivers/docker/driver.go#L1886) |
| `getOrCreateClient` | `d *Driver` | `timeout time.Duration` | `*mclient.Client, error` | [L1984](file:///d:/claude/nomad/drivers/docker/driver.go#L1984) |
| `getInfinityClient` | `d *Driver` | - | `*mclient.Client, error` | [L2008](file:///d:/claude/nomad/drivers/docker/driver.go#L2008) |
| `getDockerClient` | `d *Driver` | - | `*mclient.Client, error` | [L2013](file:///d:/claude/nomad/drivers/docker/driver.go#L2013) |
| `newDockerClient` | `d *Driver` | `timeout time.Duration` | `*mclient.Client, error` | [L2018](file:///d:/claude/nomad/drivers/docker/driver.go#L2018) |
| `sliceMergeUlimit` | - | `ulimitsRaw map[string]string` | `[]*containerapi.Ulimit, error` | [L2074](file:///d:/claude/nomad/drivers/docker/driver.go#L2074) |
| `isDockerTransientError` | - | `err error` | `bool` | [L2109](file:///d:/claude/nomad/drivers/docker/driver.go#L2109) |
| `stopWithZeroTimeout` | - | - | `mclient.ContainerStopOptions` | [L2124](file:///d:/claude/nomad/drivers/docker/driver.go#L2124) |

## 5. 核心方法详解

### NewDockerDriver()

**签名**：`func NewDockerDriver(ctx context.Context, logger hclog.Logger) drivers.DriverPlugin`

**位置**：[L187](file:///d:/claude/nomad/drivers/docker/driver.go#L187)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `context` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net` | 标准库 |
| `net/netip` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `runtime` | 标准库 |
| `slices` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cgroupslib` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/cpustats` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/drivers/docker/docklog` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/capabilities` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/eventer` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/hostnames` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/resolvconf` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/containerd/errdefs` | 第三方库 |
| `github.com/hashicorp/consul-template/signals` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-plugin` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/moby/moby/api/pkg/stdcopy` | 第三方库 |
| `github.com/moby/moby/api/types/container` | 第三方库 |
| `github.com/moby/moby/api/types/mount` | 第三方库 |
| `github.com/moby/moby/api/types/network` | 第三方库 |
| `github.com/moby/moby/api/types/registry` | 第三方库 |
| `github.com/moby/moby/api/types/system` | 第三方库 |
| `github.com/moby/moby/client` | 第三方库 |
| `github.com/moby/moby/client` | 第三方库 |
| `github.com/ryanuber/go-glob` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **插件架构**：使用 `go-plugin` 框架实现插件化扩展
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期
- **Docker 集成**：与 Docker Engine API 交互，管理容器生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [driver_test.go](file:///d:/claude/nomad/drivers/docker/driver_test.go) | 对应测试文件 |

