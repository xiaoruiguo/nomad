# handle.go 代码说明文档

> 文件路径：[drivers/docker/handle.go](file:///d:/claude/nomad/drivers/docker/handle.go)
> 总行数：355 行
> 所属包：`docker`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Docker 驱动子包**（`drivers/docker`），实现 Nomad 的 Docker 任务驱动，通过 Docker API 管理容器的生命周期（创建、启动、停止、销毁）、资源限制、网络配置和日志收集。支持 Docker API 版本协商、认证、健康检查和统计信息收集。

## 2. 类型定义

### taskHandle

**定义位置**：[L29](file:///d:/claude/nomad/drivers/docker/handle.go#L29)

**类型**：struct

```go
	dockerClient *mclient.Client
	dockerCGroupDriver string
	infinityClient *mclient.Client
	logger hclog.Logger
	dlogger docklog.DockerLogger
	dloggerPluginClient *plugin.Client
	task *drivers.TaskConfig
	containerID string
	containerCgroup string
	containerImage string
	doneCh chan bool
	waitCh chan struct{...}
	removeContainerOnExit bool
	net *drivers.DriverNetwork
	disableCpusetManagement bool
	exitResult *drivers.ExitResult
	exitResultLock sync.Mutex
```

**关联方法**（9 个）：`ExitResult`, `buildState`, `Exec`, `Signal`, `Kill`, `shutdownLogger`, `startCpusetFixer`, `dockerCgroup`, `run`

### taskHandleState

**定义位置**：[L66](file:///d:/claude/nomad/drivers/docker/handle.go#L66)

**类型**：struct

```go
	ReattachConfig *pstructs.ReattachConfig
	ContainerID string
	DriverNetwork *drivers.DriverNetwork
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ExitResult` | `h *taskHandle` | - | `*drivers.ExitResult` | [L60](file:///d:/claude/nomad/drivers/docker/handle.go#L60) |
| `buildState` | `h *taskHandle` | - | `*taskHandleState` | [L74](file:///d:/claude/nomad/drivers/docker/handle.go#L74) |
| `Exec` | `h *taskHandle` | `ctx context.Context, cmd string, args []string` | `*drivers.ExecTaskResult, error` | [L85](file:///d:/claude/nomad/drivers/docker/handle.go#L85) |
| `Signal` | `h *taskHandle` | `ctx context.Context, s string` | `error` | [L129](file:///d:/claude/nomad/drivers/docker/handle.go#L129) |
| `parseSignal` | - | `os string, signal string` | `os.Signal, error` | [L142](file:///d:/claude/nomad/drivers/docker/handle.go#L142) |
| `Kill` | `h *taskHandle` | `killTimeout time.Duration, signal string` | `error` | [L162](file:///d:/claude/nomad/drivers/docker/handle.go#L162) |
| `shutdownLogger` | `h *taskHandle` | - | - | [L231](file:///d:/claude/nomad/drivers/docker/handle.go#L231) |
| `startCpusetFixer` | `h *taskHandle` | - | - | [L243](file:///d:/claude/nomad/drivers/docker/handle.go#L243) |
| `dockerCgroup` | `h *taskHandle` | - | `string` | [L265](file:///d:/claude/nomad/drivers/docker/handle.go#L265) |
| `run` | `h *taskHandle` | - | - | [L282](file:///d:/claude/nomad/drivers/docker/handle.go#L282) |

## 5. 核心方法详解

### Signal()

**签名**：`func (h *taskHandle) Signal(ctx context.Context, s string) error`

**位置**：[L129](file:///d:/claude/nomad/drivers/docker/handle.go#L129)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `os` | 标准库 |
| `runtime` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cgroupslib` | 内部包 |
| `github.com/hashicorp/nomad/drivers/docker/docklog` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/armon/circbuf` | 第三方库 |
| `github.com/containerd/errdefs` | 第三方库 |
| `github.com/hashicorp/consul-template/signals` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-plugin` | 第三方库 |
| `github.com/moby/moby/api/pkg/stdcopy` | 第三方库 |
| `github.com/moby/moby/api/types/container` | 第三方库 |
| `github.com/moby/moby/client` | 第三方库 |

## 7. 设计模式与技术特点

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
| [handle_test.go](file:///d:/claude/nomad/drivers/docker/handle_test.go) | 对应测试文件 |

