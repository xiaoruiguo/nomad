# Nomad Task Driver 技术实现分析

本文档分析 Nomad 任务驱动（Task Driver）的技术实现，参考 [HashiCorp 官方文档](https://developer.hashicorp.com/nomad/docs/job-declare/task-driver)，涵盖驱动类型、代码文件、插件接口、各驱动的能力差异与实现细节。

---

## 1. 总体架构

Nomad Client 通过任务驱动（Task Driver）插件来执行和隔离任务。所有驱动实现统一的 `DriverPlugin` 接口，由 Client 在启动时从内置插件目录（catalog）加载。

```
┌─────────────────────────────────────────────────────────────────┐
│                        Nomad Client                             │
│                                                                 │
│   DriverManager (client/driver_manager.go)                      │
│        │                                                        │
│        ▼                                                        │
│   plugin loader (helper/pluginutils/loader)                     │
│        │                                                        │
│        ▼                                                        │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │       内置插件目录 catalog (register.go / register_cgo.go)│  │
│   │                                                          │  │
│   │   docker  rawexec  qemu  java  [exec]  mock              │  │
│   └──────────────────────────────────────────────────────────┘  │
│        │                                                        │
│        ▼  go-plugin (gRPC)                                      │
│   ┌────────────────────────────────────────────────────────┐    │
│   │  drivers.DriverPlugin 接口 (plugins/drivers/driver.go) │    │
│   │                                                        │    │
│   │  Fingerprint / StartTask / WaitTask / StopTask         │    │
│   │  DestroyTask / InspectTask / TaskStats / TaskEvents    │    │
│   │  SignalTask / ExecTask / Capabilities / TaskConfigSchema│   │
│   └────────────────────────────────────────────────────────┘    │
│        │                                                        │
│        ├──► Docker Driver    → Docker Daemon (moby/client)      │
│        ├──► Exec Driver      → shared/executor (chroot+cgroup)  │
│        ├──► Raw Exec Driver  → shared/executor (no isolation)   │
│        ├──► Java Driver      → shared/executor + java binary    │
│        ├──► QEMU Driver      → shared/executor + qemu-system-*  │
│        └──► Mock Driver      → 模拟任务（测试用）                │
└─────────────────────────────────────────────────────────────────┘
```

### 关键设计

- **go-plugin + gRPC**：每个驱动是一个独立插件进程，通过 gRPC 与 Client 通信（[plugins/drivers/plugin.go](file:///d:/claude/nomad/plugins/drivers/plugin.go)）
- **统一接口**：所有驱动实现 `DriverPlugin` 接口，能力差异通过 `Capabilities()` RPC 暴露
- **共享执行器**：`exec`/`raw_exec`/`java`/`qemu` 复用 [drivers/shared/executor](file:///d:/claude/nomad/drivers/shared/executor) 的进程管理逻辑
- **cgo 构建标签**：`exec` 驱动需要 cgo（依赖 chroot/cgroups），无 cgo 构建不注册

---

## 2. Driver Plugin 接口

### 2.1 核心接口定义

[plugins/drivers/driver.go:51-67](file:///d:/claude/nomad/plugins/drivers/driver.go#L51-L67):

```go
type DriverPlugin interface {
    base.BasePlugin

    TaskConfigSchema() (*hclspec.Spec, error)
    Capabilities() (*Capabilities, error)
    Fingerprint(context.Context) (<-chan *Fingerprint, error)

    RecoverTask(*TaskHandle) error
    StartTask(*TaskConfig) (*TaskHandle, *DriverNetwork, error)
    WaitTask(ctx context.Context, taskID string) (<-chan *ExitResult, error)
    StopTask(taskID string, timeout time.Duration, signal string) error
    DestroyTask(taskID string, force bool) error
    InspectTask(taskID string) (*TaskStatus, error)
    TaskStats(ctx context.Context, taskID string, interval time.Duration) (<-chan *cstructs.TaskResourceUsage, error)
    TaskEvents(context.Context) (<-chan *TaskEvent, error)

    SignalTask(taskID string, signal string) error
    ExecTask(taskID string, cmd []string, timeout time.Duration) (*ExecTaskResult, error)
}
```

### 2.2 可选扩展接口

| 接口 | 文件 | 用途 |
|------|------|------|
| `DriverShutdowner` | [driver.go:69](file:///d:/claude/nomad/plugins/drivers/driver.go#L69) | 插件关闭前清理（如 docker reconciler） |
| `DriverIniter` | [driver.go:77](file:///d:/claude/nomad/plugins/drivers/driver.go#L77) | SetConfig 后初始化 |
| `ExecTaskStreamingDriver` | [driver.go:84](file:///d:/claude/nomad/plugins/drivers/driver.go#L84) | 流式 Exec（tty + stdin/stdout 实时） |
| `DriverNetworkManager` | [driver.go:119](file:///d:/claude/nomad/plugins/drivers/driver.go#L119) | 自建网络命名空间（仅 docker 实现） |
| `DriverSignalTaskNotSupported` | [driver.go:128](file:///d:/claude/nomad/plugins/drivers/driver.go#L128) | 不支持信号时嵌入 |
| `DriverExecTaskNotSupported` | [driver.go:136](file:///d:/claude/nomad/plugins/drivers/driver.go#L136) | 不支持 Exec 时嵌入 |

### 2.3 Capabilities 结构

[plugins/drivers/driver.go:159-188](file:///d:/claude/nomad/plugins/drivers/driver.go#L159-L188):

```go
type Capabilities struct {
    SendSignals          bool              // 能否发送信号
    Exec                 bool              // 能否执行任意命令（健康检查等）
    FSIsolation          fsisolation.Mode  // 文件系统隔离方式
    NetIsolationModes    []NetIsolationMode // 支持的网络隔离模式
    MustInitiateNetwork  bool              // 是否必须由驱动创建网络命名空间
    MountConfigs         MountConfigSupport // 挂载配置支持度
    DisableLogCollection bool              // 是否禁用 logmon
    DynamicWorkloadUsers bool              // 是否支持动态 UID/GID
}
```

#### FSIsolation 枚举（[plugins/drivers/fsisolation/isolation.go](file:///d:/claude/nomad/plugins/drivers/fsisolation/isolation.go)）

| 值 | 含义 |
|----|------|
| `None` | 无隔离，直接用主机文件系统 |
| `Chroot` | chroot 到主机子目录 |
| `Image` | 使用容器镜像文件系统 |
| `Unveil` | landlock/unveil 语义隔离（预留） |

#### NetIsolationMode 枚举

| 值 | 含义 |
|----|------|
| `host` | 共享主机网络 |
| `group` | 任务组共享网络命名空间 |
| `task` | 任务级独立网络命名空间 |
| `none` | 无网络（远程任务） |

---

## 3. 驱动类型与文件清单

### 3.1 内置驱动注册

内置驱动通过 `init()` 在插件目录中注册，见 [helper/pluginutils/catalog/register.go](file:///d:/claude/nomad/helper/pluginutils/catalog/register.go) 与 [register_cgo.go](file:///d:/claude/nomad/helper/pluginutils/catalog/register_cgo.go):

```go
// register.go（无 cgo 构建）
func init() {
    RegisterDeferredConfig(rawexec.PluginID, rawexec.PluginConfig, rawexec.PluginLoader)
    Register(qemu.PluginID, qemu.PluginConfig)
    Register(java.PluginID, java.PluginConfig)
    RegisterDeferredConfig(docker.PluginID, docker.PluginConfig, docker.PluginLoader)
}

// register_cgo.go（cgo 构建，额外注册 exec 驱动）
func init() {
    RegisterDeferredConfig(rawexec.PluginID, rawexec.PluginConfig, rawexec.PluginLoader)
    Register(exec.PluginID, exec.PluginConfig)   // ← 仅 cgo 构建
    Register(qemu.PluginID, qemu.PluginConfig)
    Register(java.PluginID, java.PluginConfig)
    RegisterDeferredConfig(docker.PluginID, docker.PluginConfig, docker.PluginLoader)
}
```

**关键差异**：`exec` 驱动需要 cgo（chroot/cgroups 系统调用），其余驱动可在纯 Go 构建中使用。`docker` 和 `rawexec` 使用 `RegisterDeferredConfig` 以支持从旧版配置迁移。

### 3.2 驱动一览

| 驱动名 | pluginName | 主文件 | 构建标签 | 隔离方式 |
|--------|-----------|--------|----------|----------|
| Docker | `docker` | [drivers/docker/driver.go](file:///d:/claude/nomad/drivers/docker/driver.go) | 全平台 | 容器镜像 |
| Isolated Fork/Exec | `exec` | [drivers/exec/driver.go](file:///d:/claude/nomad/drivers/exec/driver.go) | `+cgo`，仅 Linux | chroot + cgroups |
| Raw Fork/Exec | `raw_exec` | [drivers/rawexec/driver.go](file:///d:/claude/nomad/drivers/rawexec/driver.go) | 全平台 | 无文件系统隔离 |
| Java | `java` | [drivers/java/driver.go](file:///d:/claude/nomad/drivers/java/driver.go) | 全平台 | 无/chroot（Linux） |
| QEMU | `qemu` | [drivers/qemu/driver.go](file:///d:/claude/nomad/drivers/qemu/driver.go) | 全平台 | 无（虚拟机自身隔离） |
| Mock | `mock_driver` | [drivers/mock/driver.go](file:///d:/claude/nomad/drivers/mock/driver.go) | 仅测试 | 无 |

### 3.3 各驱动文件清单

#### Docker Driver（`drivers/docker/`）

| 文件 | 用途 |
|------|------|
| [driver.go](file:///d:/claude/nomad/drivers/docker/driver.go) | 主驱动：StartTask/StopTask/ExecTask/SignalTask/Fingerprint |
| [config.go](file:///d:/claude/nomad/drivers/docker/config.go) | 配置 schema、PluginID/PluginConfig/PluginLoader、TaskConfig 结构 |
| [fingerprint.go](file:///d:/claude/nomad/drivers/docker/fingerprint.go) | 探测 Docker daemon、版本、运行时属性 |
| [handle.go](file:///d:/claude/nomad/drivers/docker/handle.go) | taskHandle：容器状态、Wait/Kill/Stats |
| [state.go](file:///d:/claude/nomad/drivers/docker/state.go) | 任务状态序列化 |
| [stats.go](file:///d:/claude/nomad/drivers/docker/stats.go) | 容器资源使用统计 |
| [network.go](file:///d:/claude/nomad/drivers/docker/network.go) | 网络命名空间创建（DriverNetworkManager 实现） |
| [ports.go](file:///d:/claude/nomad/drivers/docker/ports.go) | 端口映射管理 |
| [coordinator.go](file:///d:/claude/nomad/drivers/docker/coordinator.go) | 镜像拉取协调（避免并发拉取同一镜像） |
| [cpuset.go](file:///d:/claude/nomad/drivers/docker/cpuset.go) | CPU 集绑定管理 |
| [progress.go](file:///d:/claude/nomad/drivers/docker/progress.go) | 镜像拉取进度上报 |
| [reconcile_dangling.go](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go) | 孤立容器清理 |
| [utils.go](file:///d:/claude/nomad/drivers/docker/utils.go) | 工具函数 |
| [driver_windows.go](file:///d:/claude/nomad/drivers/docker/driver_windows.go) | Windows 特定逻辑 |
| [driver_default.go](file:///d:/claude/nomad/drivers/docker/driver_default.go) | 非 Windows 默认逻辑 |
| [win32_volume_parse.go](file:///d:/claude/nomad/drivers/docker/win32_volume_parse.go) | Windows 卷路径解析 |
| [docklog/](file:///d:/claude/nomad/drivers/docker/docklog) | Docker 日志收集子插件（独立 gRPC 进程） |
| [util/](file:///d:/claude/nomad/drivers/docker/util) | 平台相关统计工具 |
| [cmd/main.go](file:///d:/claude/nomad/drivers/docker/cmd/main.go) | 独立 docker 驱动二进制入口 |

#### Exec Driver（`drivers/exec/`）

| 文件 | 用途 |
|------|------|
| [driver.go](file:///d:/claude/nomad/drivers/exec/driver.go) | 主驱动：Fingerprint（仅 Linux）、StartTask（chroot+executor）、Capabilities |
| [handle.go](file:///d:/claude/nomad/drivers/exec/handle.go) | taskHandle：executor 引用、Wait/Stats/Signal |
| [state.go](file:///d:/claude/nomad/drivers/exec/state.go) | 任务状态序列化 |

#### Raw Exec Driver（`drivers/rawexec/`）

| 文件 | 用途 |
|------|------|
| [driver.go](file:///d:/claude/nomad/drivers/rawexec/driver.go) | 主驱动：无隔离 fork/exec、PluginLoader |
| [handle.go](file:///d:/claude/nomad/drivers/rawexec/handle.go) | taskHandle |
| [state.go](file:///d:/claude/nomad/drivers/rawexec/state.go) | 任务状态 |
| [driver_unix.go](file:///d:/claude/nomad/drivers/rawexec/driver_unix.go) | Unix 特定逻辑 |
| [driver_windows.go](file:///d:/claude/nomad/drivers/rawexec/driver_windows.go) | Windows 特定逻辑 |

#### Java Driver（`drivers/java/`）

| 文件 | 用途 |
|------|------|
| [driver.go](file:///d:/claude/nomad/drivers/java/driver.go) | 主驱动：查找 java 二进制、构造 JVM 参数、委托 executor |
| [handle.go](file:///d:/claude/nomad/drivers/java/handle.go) | taskHandle |
| [state.go](file:///d:/claude/nomad/drivers/java/state.go) | 任务状态 |
| [utils.go](file:///d:/claude/nomad/drivers/java/utils.go) | java 路径查找、JVM 参数构造 |

#### QEMU Driver（`drivers/qemu/`）

| 文件 | 用途 |
|------|------|
| [driver.go](file:///d:/claude/nomad/drivers/qemu/driver.go) | 主驱动：构造 qemu-system-* 命令、镜像路径校验 |
| [handle.go](file:///d:/claude/nomad/drivers/qemu/handle.go) | taskHandle（含 monitor socket 优雅关机） |
| [state.go](file:///d:/claude/nomad/drivers/qemu/state.go) | 任务状态 |
| [driver_linux.go](file:///d:/claude/nomad/drivers/qemu/driver_linux.go) | Linux 特定 |
| [driver_bsd.go](file:///d:/claude/nomad/drivers/qemu/driver_bsd.go) | BSD 特定 |
| [driver_fallback.go](file:///d:/claude/nomad/drivers/qemu/driver_fallback.go) | 其他平台回退 |

#### Mock Driver（`drivers/mock/`）

| 文件 | 用途 |
|------|------|
| [driver.go](file:///d:/claude/nomad/drivers/mock/driver.go) | 测试用模拟驱动 |
| [handle.go](file:///d:/claude/nomad/drivers/mock/handle.go) | taskHandle |
| [state.go](file:///d:/claude/nomad/drivers/mock/state.go) | 任务状态 |
| [command.go](file:///d:/claude/nomad/drivers/mock/command.go) | 模拟命令配置 |
| [utils.go](file:///d:/claude/nomad/drivers/mock/utils.go) | 工具函数 |

---

## 4. 共享基础设施

### 4.1 Executor（`drivers/shared/executor/`）

`exec`、`raw_exec`、`java`、`qemu` 四个驱动都委托 `Executor` 接口来实际启动进程，避免重复实现进程管理、cgroups、统计等逻辑。

#### Executor 接口（[executor.go:74-113](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L74-L113)）

```go
type Executor interface {
    Launch(launchCmd *ExecCommand) (*ProcessState, error)
    Wait(ctx context.Context) (*ProcessState, error)
    Shutdown(signal string, gracePeriod time.Duration) error
    UpdateResources(*drivers.Resources) error
    Version() (*ExecutorVersion, error)
    Stats(context.Context, time.Duration) (<-chan *cstructs.TaskResourceUsage, error)
    Signal(os.Signal) error
    Exec(deadline time.Time, cmd string, args []string) ([]byte, int, error)
    ExecStreaming(ctx context.Context, cmd []string, tty bool, stream drivers.ExecTaskStream) error
}
```

#### 关键文件

| 文件 | 用途 |
|------|------|
| [executor.go](file:///d:/claude/nomad/drivers/shared/executor/executor.go) | `UniversalExecutor`：Launch/Wait/Shutdown/Stats 核心实现 |
| [executor_basic.go](file:///d:/claude/nomad/drivers/shared/executor/executor_basic.go) | 基础执行器（无 cgroup 隔离） |
| [executor_linux.go](file:///d:/claude/nomad/drivers/shared/executor/executor_linux.go) | Linux cgroups/chroot/pivot_root 隔离 |
| [executor_linux_cgo.go](file:///d:/claude/nomad/drivers/shared/executor/executor_linux_cgo.go) | cgo 相关的 Linux 隔离 |
| [executor_universal_linux.go](file:///d:/claude/nomad/drivers/shared/executor/executor_universal_linux.go) | 通用 Linux 逻辑 |
| [executor_unix.go](file:///d:/claude/nomad/drivers/shared/executor/executor_unix.go) | Unix 通用 |
| [executor_windows.go](file:///d:/claude/nomad/drivers/shared/executor/executor_windows.go) | Windows 特定 |
| [executor_plugin.go](file:///d:/claude/nomad/drivers/shared/executor/executor_plugin.go) | go-plugin 包装 |
| [grpc_client.go](file:///d:/claude/nomad/drivers/shared/executor/grpc_client.go) | gRPC 客户端 |
| [grpc_server.go](file:///d:/claude/nomad/drivers/shared/executor/grpc_server.go) | gRPC 服务端 |
| [exec_utils.go](file:///d:/claude/nomad/drivers/shared/executor/exec_utils.go) | Exec 实现 |
| [utils.go](file:///d:/claude/nomad/drivers/shared/executor/utils.go) | `CreateExecutor` 工厂 |
| [procstats/](file:///d:/claude/nomad/drivers/shared/executor/procstats) | 进程统计（平台相关） |
| [proto/](file:///d:/claude/nomad/drivers/shared/executor/proto) | gRPC protobuf 定义 |

#### Executor 启动流程

`CreateExecutor`（[utils.go:33](file:///d:/claude/nomad/drivers/shared/executor/utils.go#L33)）启动一个独立子进程（`nomad executor`），通过 gRPC 与驱动通信：

```go
func CreateExecutor(logger, driverConfig, executorConfig) (Executor, *plugin.Client, error) {
    bin, _ := os.Executable()
    config := &plugin.ClientConfig{
        Cmd: exec.Command(bin, "executor", string(c)),
        Plugins: map[string]plugin.Plugin{"executor": p},
        AllowedProtocols: []plugin.Protocol{plugin.ProtocolGRPC},
    }
    // ...
}
```

`UniversalExecutor.Launch`（[executor.go:360](file:///d:/claude/nomad/drivers/shared/executor/executor.go#L360)）：
1. 设置进程用户/工作目录
2. `setNewProcessGroup` 独立进程组
3. `configureResourceContainer` 配置 cgroups（Linux）
4. 启动 `os/exec.Cmd`
5. 返回 `ProcessState{Pid}`

### 4.2 其他共享组件

| 组件 | 文件 | 用途 |
|------|------|------|
| **Eventer** | [drivers/shared/eventer/eventer.go](file:///d:/claude/nomad/drivers/shared/eventer/eventer.go) | 任务事件广播（多消费者订阅） |
| **Capabilities** | [drivers/shared/capabilities/](file:///d:/claude/nomad/drivers/shared/capabilities) | Linux capability 集合计算（Nomad 默认 + 驱动允许 + 任务 cap_add/drop） |
| **Validators** | [drivers/shared/validators/](file:///d:/claude/nomad/drivers/shared/validators) | 任务配置校验 |
| **Hostnames** | [drivers/shared/hostnames/mount.go](file:///d:/claude/nomad/drivers/shared/hostnames/mount.go) | `/etc/hosts` 挂载生成 |
| **Resolvconf** | [drivers/shared/resolvconf/mount.go](file:///d:/claude/nomad/drivers/shared/resolvconf/mount.go) | `/etc/resolv.conf` 挂载生成 |

---

## 5. 各驱动能力对比

### 5.1 Capabilities 对比表

| 能力 | docker | exec | raw_exec | java | qemu | mock |
|------|--------|------|----------|------|------|------|
| **SendSignals** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **Exec** | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| **FSIsolation** | Image | Chroot | None | None/Chroot¹ | None | None |
| **NetIsolationModes** | host,group,task | host,group | host,group | host,group | host,group | — |
| **MustInitiateNetwork** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **MountConfigs** | All | — | None | None/All¹ | None | None |
| **DisableLogCollection** | — | — | — | — | — | — |
| **DynamicWorkloadUsers** | — | — | — | — | — | — |

¹ Java 驱动在 Linux 上启用 chroot + MountConfigs=All（见 [java/driver.go:120-124](file:///d:/claude/nomad/drivers/java/driver.go#L120-L124) 的 `init()`）

### 5.2 Task Config Schema 对比

| 字段类别 | docker | exec | raw_exec | java | qemu |
|----------|--------|------|----------|------|------|
| **命令/参数** | image, command, args, entrypoint | command, args | command, args | class/jar_path, args, jvm_options | image_path, args |
| **资源限制** | memory_hard_limit, cpu_hard_limit, cpuset_cpus, pids_limit | — | cgroup_v2_override, cgroup_v1_override, oom_score_adj | — | — |
| **网络** | network_mode, port_map, ports, ipv4_address, ipv6_address, mac_address | pid_mode, ipc_mode | — | pid_mode, ipc_mode | port_map |
| **隔离** | isolation, privileged, readonly_rootfs, security_opt, sysctl | pid_mode, ipc_mode, cap_add, cap_drop | — | pid_mode, ipc_mode, cap_add, cap_drop | graceful_shutdown, guest_agent |
| **存储** | volumes, volume_driver, mount, mounts, shm_size, storage_opt | work_dir | work_dir | work_dir | drive_interface, machine_type, accelerator |
| **运行时** | runtime, init, tty, interactive, userns_mode, uts_mode, cgroupns | — | — | — | emulator |
| **日志/监控** | logging, healthchecks, labels | — | — | — | — |
| **认证** | auth, auth_soft_fail | — | — | — | — |
| **其他** | hostname, dns_servers, dns_options, dns_search_domains, extra_hosts, group_add, ulimit, oom_score_adj, image_pull_timeout, container_exists_attempts, force_pull, load, advertise_ipv6_address | denied_host_uids², denied_host_gids², allow_caps² | denied_envvars | — | — |

² 这些是驱动级配置（`configSpec`），非任务级

### 5.3 Fingerprint 策略对比

| 驱动 | 探测目标 | 健康判定 | 周期 |
|------|----------|----------|------|
| **docker** | Docker daemon 连通性 + `docker info` | daemon 可达且版本兼容 → Healthy | 30s |
| **exec** | `runtime.GOOS == "linux"` | Linux → Healthy，其他 → Undetected | 30s |
| **raw_exec** | `config.Enabled` 标志 | 默认禁用，需显式 `enabled = true` | 30s |
| **java** | `java` 二进制存在性 + 版本 | 找到 java → Healthy | 30s |
| **qemu** | `qemu-system-*` 模拟器列表 | 至少一个模拟器 → Healthy | 30s |
| **mock** | 始终健康 | — | — |

---

## 6. 各驱动实现细节

### 6.1 Docker Driver

**入口**：[drivers/docker/driver.go:187](file:///d:/claude/nomad/drivers/docker/driver.go#L187) `NewDockerDriver`

**特点**：
- 唯一实现 `DriverNetworkManager` 接口的驱动（`MustInitiateNetwork=true`）
- 通过 [moby/moby/client](https://github.com/moby/moby) 直接调用 Docker daemon API
- 镜像拉取由 [coordinator.go](file:///d:/claude/nomad/drivers/docker/coordinator.go) 协调，避免并发拉取同一镜像
- 日志收集通过独立的 `docklog` 子插件（[drivers/docker/docklog/](file:///d:/claude/nomad/drivers/docker/docklog)），避免阻塞主驱动
- 支持 Windows（process/hyperv 隔离模式，[driver_windows.go](file:///d:/claude/nomad/drivers/docker/driver_windows.go)）
- [reconcile_dangling.go](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go) 定期清理 Nomad 创建的孤立容器

**StartTask 流程**（[driver.go:328](file:///d:/claude/nomad/drivers/docker/driver.go#L328)）：
1. 解码 `TaskConfig`，校验 `image` 必填
2. 获取 Docker 客户端（`getDockerClient` + `getInfinityClient` 用于长操作）
3. `createImage`：拉取/检查镜像，通过 coordinator 协调
4. `createContainerConfig`：构建容器配置（端口、挂载、网络、资源）
5. `dockerClient.ContainerCreate` + `ContainerStart`
6. 启动 docklog 插件收集日志
7. 返回 `TaskHandle` + `DriverNetwork`

**StopTask**（[driver.go:1726](file:///d:/claude/nomad/drivers/docker/driver.go#L1726)）：委托 `handle.Kill(timeout, signal)`，调用 `ContainerStop` + 可选 `ContainerRemove`

**网络管理**（[network.go](file:///d:/claude/nomad/drivers/docker/network.go)）：
- `CreateNetwork`：为任务组创建 Docker 自定义网络或 host 网络
- `DestroyNetwork`：清理网络资源
- 支持 host/group/task 三种网络隔离模式

### 6.2 Exec Driver（Isolated Fork/Exec）

**入口**：[drivers/exec/driver.go:266](file:///d:/claude/nomad/drivers/exec/driver.go#L266) `NewExecDriver`

**特点**：
- **仅 Linux + cgo 构建**（`runtime.GOOS != "linux"` 时 Fingerprint 返回 Undetected）
- 使用 chroot 实现文件系统隔离（`FSIsolation=Chroot`）
- 通过 `shared/executor` 的 `UniversalExecutor` 启动进程，自动配置 cgroups
- 支持 PID/IPC 命名空间模式（private/host）
- 支持 Linux capabilities（cap_add/cap_drop）
- 支持 `no_pivot_root` 配置（用于 ramdisk 等不支持 pivot_root 的环境）

**StartTask 流程**（[driver.go:459](file:///d:/claude/nomad/drivers/exec/driver.go#L459)）：
1. 校验配置 + 用户 ID（`userIDValidator.HasValidIDs`）
2. 默认用户 `nobody`
3. 生成 DNS 挂载（`resolvconf.GenerateDNSMount`）
4. 计算 capabilities（`capabilities.Calculate`）
5. `executor.CreateExecutor` 启动 executor 子进程
6. 构造 `ExecCommand`（含 `FSIsolation: true`）
7. `exec.Launch(execCmd)` → executor 执行 chroot + cgroups + exec

**隔离实现**（[executor_linux.go](file:///d:/claude/nomad/drivers/shared/executor/executor_linux.go)）：
- `configureResourceContainer`：创建 cgroup，设置 CPU/内存/IO 限制
- `pivot_root` 或 `chroot` 到任务目录
- 可选 PID/IPC 命名空间 unshare

### 6.3 Raw Exec Driver

**入口**：[drivers/rawexec/driver.go:217](file:///d:/claude/nomad/drivers/rawexec/driver.go#L217) `NewRawExecDriver`

**特点**：
- **默认禁用**，需在 client 配置中 `enabled = true`（[driver.go:272-283](file:///d:/claude/nomad/drivers/rawexec/driver.go#L272-L283)）
- **无文件系统隔离**（`FSIsolation=None`），直接在主机文件系统运行
- 仍通过 `shared/executor` 启动，但不启用 chroot（`FSIsolation: false`）
- 支持 cgroup v1/v2 路径覆盖（`cgroup_v2_override`/`cgroup_v1_override`）
- 支持 `oom_score_adj` 调整 OOM 优先级
- 支持 `denied_envvars` 黑名单环境变量

**StartTask 流程**（[driver.go:391](file:///d:/claude/nomad/drivers/rawexec/driver.go#L391)）：
1. 检查 `d.config.Enabled`
2. 校验配置（含 `denied_envvars`）
3. `executor.CreateExecutor`（`FSIsolation` 字段不设置，默认 false）
4. 构造 `ExecCommand`，`ResourceLimits` 未设置（不强制资源限制）
5. `exec.Launch(execCmd)`

**与 exec 驱动的关键差异**：
- 无 chroot，任务可访问整个主机文件系统
- 无 pivot_root，进程直接在主机根文件系统
- 仍可配置 cgroup 覆盖路径（可选资源限制）
- 跨平台（Windows 支持，[driver_windows.go](file:///d:/claude/nomad/drivers/rawexec/driver_windows.go)）

### 6.4 Java Driver

**入口**：[drivers/java/driver.go](file:///d:/claude/nomad/drivers/java/driver.go)（无显式 `NewJavaDriver`，通过 `PluginConfig.Factory` 内联创建）

**特点**：
- 自动查找 `java` 二进制（`GetAbsolutePath("java")`）
- 支持 `jar_path`（运行 JAR）或 `class`（运行主类）两种模式
- 自动构造 JVM 参数（`javaCmdArgs`，[utils.go](file:///d:/claude/nomad/drivers/java/utils.go)）
- Linux 上启用 chroot 隔离（`init()` 中动态设置，[driver.go:120-124](file:///d:/claude/nomad/drivers/java/driver.go#L120-L124)）
- **不支持 SendSignals 和 Exec**（JVM 进程信号处理复杂）

**StartTask 流程**（[driver.go:432](file:///d:/claude/nomad/drivers/java/driver.go#L432)）：
1. 校验 `class` 或 `jar_path` 至少一个
2. `GetAbsolutePath("java")` 查找 java 二进制
3. `javaCmdArgs(driverConfig)` 构造 JVM 参数（`-cp`、`-jar`、`jvm_options`）
4. 默认用户 `nobody`（非 Windows）
5. DNS 挂载 + capabilities 计算（Linux）
6. `executor.CreateExecutor`（Linux 启用 `FSIsolation`）
7. `exec.Launch(execCmd)` 启动 JVM

### 6.5 QEMU Driver

**入口**：[drivers/qemu/driver.go:184](file:///d:/claude/nomad/drivers/qemu/driver.go#L184) `NewQemuDriver`

**特点**：
- 运行 QEMU 虚拟机，隔离由虚拟机硬件层提供
- 需要指定 `image_path`（磁盘镜像路径）
- 支持模拟器选择（`emulator`，如 `x86_64`/`aarch64`）
- 支持加速器（`accelerator`，如 `tcg`/`kvm`）
- 支持机器类型（`machine_type`，如 `pc`/`q35`）
- 支持优雅关机（`graceful_shutdown` + QEMU monitor socket）
- 支持访客代理（`guest_agent`）
- **不支持 SendSignals 和 Exec**（虚拟机内进程不可直接操作）
- 镜像路径必须在 `ImagePaths` 允许列表内（安全限制）

**StartTask 流程**（[driver.go:456](file:///d:/claude/nomad/drivers/qemu/driver.go#L456)）：
1. 校验 emulator 和 args 白名单
2. 校验 `image_path` 在允许路径内
3. 构造 QEMU 命令行参数：
   ```
   qemu-system-<emulator> -machine type=<machineType>,accel=<accelerator>
     -name <vmID> -m <memory>M
     -drive file=<vmPath>,if=<driveInterface>,id=image0
     [其他网络/端口参数]
   ```
4. `executor.CreateExecutor` + `exec.Launch`

**StopTask 优雅关机**（[driver.go:719](file:///d:/claude/nomad/drivers/qemu/driver.go#L719)）：
1. 若配置了 `graceful_shutdown`，通过 QEMU monitor socket 发送 `system_powerdown`
2. 等待 `timeout` 内进程退出
3. 超时后调用 `exec.Shutdown(signal, timeout)` 强制终止

### 6.6 Mock Driver

**入口**：[drivers/mock/driver.go:152](file:///d:/claude/nomad/drivers/mock/driver.go#L152) `NewMockDriver`

**特点**：
- 仅用于测试，不实际运行进程
- 模拟任务生命周期（`RunFor` 指定运行时长后退出）
- 可配置退出码、信号、stdout/stderr 内容
- 支持动态 FSIsolation 配置（测试不同隔离场景）
- 在 [register_testing.go](file:///d:/claude/nomad/helper/pluginutils/catalog/register_testing.go) 注册

---

## 7. 插件加载与生命周期

### 7.1 插件加载流程

```
Client 启动
    │
    ▼
pluginutils/loader.NewPluginLoader
    │
    ▼
catalog.Register (register.go / register_cgo.go)
    │  注册 PluginID → InternalPluginConfig
    │
    ▼
DriverManager 初始化
    │  遍历 catalog，对每个驱动：
    │  1. 创建 plugin.Client (gRPC)
    │  2. Dispense → DriverPlugin 实例
    │  3. SetConfig (传递 client 配置)
    │  4. Init (若实现 DriverIniter)
    │  5. Fingerprint (探测可用性)
    │
    ▼
按需使用
    │  - StartTask / WaitTask / StopTask
    │  - TaskStats / TaskEvents
    │  - SignalTask / ExecTask
```

### 7.2 PluginLoader 机制

`docker` 和 `rawexec` 实现了 `PluginLoader` 函数，用于从旧版（pre-0.9）配置迁移：

[drivers/rawexec/driver.go:65](file:///d:/claude/nomad/drivers/rawexec/driver.go#L65):
```go
func PluginLoader(opts map[string]string) (map[string]interface{}, error) {
    // 将旧版 client 配置选项转换为新版插件配置
}
```

[drivers/docker/config.go:51](file:///d:/claude/nomad/drivers/docker/config.go#L51) 类似，处理旧版 docker 配置项。

### 7.3 任务生命周期

```
StartTask
    │
    ▼
[驱动特定启动逻辑]
    │  docker: ContainerCreate + ContainerStart
    │  exec/rawexec/java/qemu: executor.CreateExecutor + exec.Launch
    │
    ▼
返回 TaskHandle (含状态序列化信息)
    │
    ▼
WaitTask (异步等待退出)
    │  docker: dockerClient.ContainerWait
    │  executor: exec.Wait
    │
    ▼
退出 → ExitResult{ExitCode, Signal, OOMKilled}
    │
    ▼
StopTask (用户或调度器触发)
    │  docker: ContainerStop(timeout)
    │  qemu: monitor socket graceful shutdown + exec.Shutdown
    │  executor: exec.Shutdown(signal, grace)
    │
    ▼
DestroyTask (清理资源)
    │  docker: ContainerRemove(force)
    │  executor: pluginClient.Kill()
```

### 7.4 任务恢复（RecoverTask）

Client 重启后，对每个运行中的任务调用 `RecoverTask`：
- **docker**：重新连接到已存在的容器（通过 `containerID`）
- **executor 类**：重新 attach 到 executor 子进程（通过 `ReattachConfig`）
- **mock**：模拟恢复

---

## 8. 驱动能力差异总结

### 8.1 隔离强度对比

| 维度 | docker | exec | raw_exec | java | qemu |
|------|--------|------|----------|------|------|
| **文件系统** | 容器镜像（最强） | chroot（中） | 无 | chroot（Linux）/无 | 无（VM 自隔离） |
| **网络** | 命名空间+bridge | 命名空间（可选） | 命名空间（可选） | 命名空间（可选） | 主机网络 |
| **PID** | 命名空间 | 命名空间（可选） | 无 | 命名空间（可选） | VM 内独立 |
| **资源限制** | cgroups | cgroups | cgroups（可选） | cgroups | QEMU 内存参数 |
| **用户** | 容器内用户 | `nobody` 或指定 | 指定或继承 | `nobody` 或指定 | VM 内用户 |

### 8.2 适用场景

| 驱动 | 适用场景 | 注意事项 |
|------|----------|----------|
| **docker** | 容器化应用（最常用） | 需 Docker daemon；支持最完整的隔离与功能 |
| **exec** | 需 chroot 隔离的非容器应用 | 仅 Linux + cgo 构建；需准备 chroot 环境 |
| **raw_exec** | 简单脚本/已有隔离的应用 | 默认禁用；无隔离，慎用；跨平台 |
| **java** | Java 应用 | 自动构造 JVM 参数；不支持信号/Exec |
| **qemu** | 虚拟机工作负载 | 需 QEMU 二进制 + 镜像；性能开销大 |

### 8.3 构建与平台支持

| 驱动 | Linux | Windows | macOS | BSD | cgo 要求 |
|------|-------|---------|-------|-----|----------|
| docker | ✅ | ✅ | ✅² | ❌ | 否 |
| exec | ✅ | ❌ | ❌ | ❌ | **是** |
| raw_exec | ✅ | ✅ | ✅ | ✅ | 否 |
| java | ✅ | ✅ | ✅ | ✅ | 否 |
| qemu | ✅ | ❌ | ✅ | ✅ | 否 |
| mock | ✅ | ✅ | ✅ | ✅ | 否 |

² macOS 上 docker 驱动可运行但功能受限（Docker Desktop）

---

## 9. 关键接口文件索引

### 9.1 插件框架

| 文件 | 用途 |
|------|------|
| [plugins/drivers/driver.go](file:///d:/claude/nomad/plugins/drivers/driver.go) | `DriverPlugin` 接口、`Capabilities`、`TaskConfig`、`TaskHandle` 等核心类型 |
| [plugins/drivers/plugin.go](file:///d:/claude/nomad/plugins/drivers/plugin.go) | go-plugin gRPC 包装（`PluginDriver`、`Serve`） |
| [plugins/drivers/client.go](file:///d:/claude/nomad/plugins/drivers/client.go) | gRPC 客户端实现 |
| [plugins/drivers/server.go](file:///d:/claude/nomad/plugins/drivers/server.go) | gRPC 服务端实现 |
| [plugins/drivers/task_handle.go](file:///d:/claude/nomad/plugins/drivers/task_handle.go) | `TaskHandle` 辅助函数 |
| [plugins/drivers/errors.go](file:///d:/claude/nomad/plugins/drivers/errors.go) | 错误定义 |
| [plugins/drivers/cstructs.go](file:///d:/claude/nomad/plugins/drivers/cstructs.go) | 通用结构体 |
| [plugins/drivers/utils.go](file:///d:/claude/nomad/plugins/drivers/utils.go) | 工具函数 |
| [plugins/drivers/execstreaming.go](file:///d:/claude/nomad/plugins/drivers/execstreaming.go) | 流式 Exec 接口 |
| [plugins/drivers/versions.go](file:///d:/claude/nomad/plugins/drivers/versions.go) | API 版本常量 |
| [plugins/drivers/fsisolation/isolation.go](file:///d:/claude/nomad/plugins/drivers/fsisolation/isolation.go) | FSIsolation 枚举 |

### 9.2 插件注册

| 文件 | 用途 |
|------|------|
| [helper/pluginutils/catalog/register.go](file:///d:/claude/nomad/helper/pluginutils/catalog/register.go) | 无 cgo 构建的驱动注册 |
| [helper/pluginutils/catalog/register_cgo.go](file:///d:/claude/nomad/helper/pluginutils/catalog/register_cgo.go) | cgo 构建的驱动注册（含 exec） |
| [helper/pluginutils/catalog/register_testing.go](file:///d:/claude/nomad/helper/pluginutils/catalog/register_testing.go) | 测试用驱动注册（mock） |
| [helper/pluginutils/loader/](file:///d:/claude/nomad/helper/pluginutils/loader) | 插件加载器 |

### 9.3 共享执行器

| 文件 | 用途 |
|------|------|
| [drivers/shared/executor/executor.go](file:///d:/claude/nomad/drivers/shared/executor/executor.go) | `Executor` 接口 + `UniversalExecutor` 实现 |
| [drivers/shared/executor/utils.go](file:///d:/claude/nomad/drivers/shared/executor/utils.go) | `CreateExecutor` 工厂 |
| [drivers/shared/executor/executor_linux.go](file:///d:/claude/nomad/drivers/shared/executor/executor_linux.go) | Linux cgroups/chroot 隔离 |
| [drivers/shared/executor/executor_plugin.go](file:///d:/claude/nomad/drivers/shared/executor/executor_plugin.go) | go-plugin 包装 |
| [drivers/shared/executor/grpc_client.go](file:///d:/claude/nomad/drivers/shared/executor/grpc_client.go) | gRPC 客户端 |
| [drivers/shared/executor/grpc_server.go](file:///d:/claude/nomad/drivers/shared/executor/grpc_server.go) | gRPC 服务端 |

---

## 10. 设计要点小结

1. **统一插件接口**：所有驱动实现 `DriverPlugin`，通过 gRPC 与 Client 解耦，支持内置与外部插件统一管理。
2. **能力声明机制**：`Capabilities()` RPC 让 Client 在不依赖具体驱动实现的情况下，根据能力决定是否启用功能（如健康检查需 `Exec=true`）。
3. **共享执行器复用**：`exec`/`raw_exec`/`java`/`qemu` 复用 `shared/executor`，避免重复实现进程管理、cgroups、统计逻辑；executor 本身也是独立 gRPC 子进程，崩溃不影响主驱动。
4. **Docker 独立实现**：Docker 驱动直接调用 Docker daemon API，不经过 executor，因为它需要容器级别的生命周期管理（镜像拉取、网络创建、日志收集等）。
5. **cgo 构建隔离**：`exec` 驱动依赖 cgo（chroot/cgroups 系统调用），通过构建标签 `register_cgo.go` 隔离，纯 Go 构建不包含该驱动。
6. **Fingerprint 动态探测**：所有驱动周期性（30s）上报健康状态，Client 据此动态调整调度属性（如 `driver.docker = true`）。
7. **任务状态可恢复**：`TaskHandle` 序列化驱动特定状态（docker 的 containerID、executor 的 ReattachConfig），Client 重启后通过 `RecoverTask` 恢复。
8. **安全分层**：`raw_exec` 默认禁用；qemu 限制镜像路径白名单；exec 校验用户 ID 黑名单；docker 支持 capability 计算。
9. **平台适配**：通过 `driver_linux.go`/`driver_windows.go`/`driver_unix.go`/`driver_bsd.go`/`driver_fallback.go` 等文件分平台实现，构建时自动选择。
10. **网络隔离分层**：`NetIsolationMode` 支持 host/group/task/none 四种模式，docker 是唯一实现 `DriverNetworkManager` 的驱动（自建网络命名空间），其他驱动依赖 Client 的 CNI 配置。
