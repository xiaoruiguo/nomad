# coordinator.go 代码说明文档

> 文件路径：[drivers/docker/coordinator.go](file:///d:/claude/nomad/drivers/docker/coordinator.go)
> 总行数：431 行
> 所属包：`docker`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Docker 驱动子包**（`drivers/docker`），实现 Nomad 的 Docker 任务驱动，通过 Docker API 管理容器的生命周期（创建、启动、停止、销毁）、资源限制、网络配置和日志收集。支持 Docker API 版本协商、认证、健康检查和统计信息收集。

## 2. 类型定义

### pullFuture

**定义位置**：[L30](file:///d:/claude/nomad/drivers/docker/coordinator.go#L30)

**类型**：struct

```go
	waitCh chan struct{...}
	err error
	imageID string
	imageUser string
```

**关联方法**（3 个）：`wait`, `result`, `set`

### DockerImageClient

**定义位置**：[L73](file:///d:/claude/nomad/drivers/docker/coordinator.go#L73)

**类型**：interface

```go
	ImagePull
	ImageInspect
	ImageRemove
```

### LogEventFn

**定义位置**：[L80](file:///d:/claude/nomad/drivers/docker/coordinator.go#L80)

**类型定义**：`func(...)`

### dockerCoordinatorConfig

**定义位置**：[L86](file:///d:/claude/nomad/drivers/docker/coordinator.go#L86)

**类型**：struct

```go
	ctx context.Context
	logger hclog.Logger
	cleanup bool
	client DockerImageClient
	removeDelay time.Duration
```

### dockerCoordinator

**定义位置**：[L107](file:///d:/claude/nomad/drivers/docker/coordinator.go#L107)

**类型**：struct

```go
	*dockerCoordinatorConfig
	imageLock sync.Mutex
	pullFutures map[string]*pullFuture
	pullLoggers map[string][]LogEventFn
	pullLoggerLock sync.RWMutex
	imageRefCount map[string]map[string]struct{...}
	deleteFuture map[string]context.CancelFunc
```

**关联方法**（12 个）：`PullImage`, `pullImageImpl`, `IncrementImageReference`, `incrementImageReferenceImpl`, `RemoveImage`, `removeImageImpl`, `registerPullLogger`, `clearPullLogger`, `emitEvent`, `handlePullInactivity`, `handlePullProgressReport`, `handleSlowPullProgressReport`

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `imageNotFoundMatcher` | `regexp.MustCompile(`Error: image .+ not found`)` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newPullFuture` | - | - | `*pullFuture` | [L39](file:///d:/claude/nomad/drivers/docker/coordinator.go#L39) |
| `wait` | `p *pullFuture` | `ctx context.Context` | `*pullFuture` | [L46](file:///d:/claude/nomad/drivers/docker/coordinator.go#L46) |
| `result` | `p *pullFuture` | - | `imageID string, imageUser string, err error` | [L58](file:///d:/claude/nomad/drivers/docker/coordinator.go#L58) |
| `set` | `p *pullFuture` | `imageID string, imageUser string, err error` | - | [L64](file:///d:/claude/nomad/drivers/docker/coordinator.go#L64) |
| `noopLogEventFn` | - | `string, map[string]string` | - | [L83](file:///d:/claude/nomad/drivers/docker/coordinator.go#L83) |
| `newDockerCoordinator` | - | `config *dockerCoordinatorConfig` | `*dockerCoordinator` | [L133](file:///d:/claude/nomad/drivers/docker/coordinator.go#L133) |
| `PullImage` | `d *dockerCoordinator` | `image string, authOptions *registry.AuthConfig, callerID string, emitFn LogE...` | `imageID string, imageUser string, err error` | [L149](file:///d:/claude/nomad/drivers/docker/coordinator.go#L149) |
| `pullImageImpl` | `d *dockerCoordinator` | `imageID string, authOptions *registry.AuthConfig, pullTimeout time.Duration,...` | `string, string, error` | [L187](file:///d:/claude/nomad/drivers/docker/coordinator.go#L187) |
| `IncrementImageReference` | `d *dockerCoordinator` | `imageID string, imageName string, callerID string` | - | [L247](file:///d:/claude/nomad/drivers/docker/coordinator.go#L247) |
| `incrementImageReferenceImpl` | `d *dockerCoordinator` | `imageID string, imageName string, callerID string` | - | [L256](file:///d:/claude/nomad/drivers/docker/coordinator.go#L256) |
| `RemoveImage` | `d *dockerCoordinator` | `imageID string, callerID string` | - | [L279](file:///d:/claude/nomad/drivers/docker/coordinator.go#L279) |
| `removeImageImpl` | `d *dockerCoordinator` | `id string, ctx context.Context` | - | [L322](file:///d:/claude/nomad/drivers/docker/coordinator.go#L322) |
| `registerPullLogger` | `d *dockerCoordinator` | `image string, logger LogEventFn` | - | [L384](file:///d:/claude/nomad/drivers/docker/coordinator.go#L384) |
| `clearPullLogger` | `d *dockerCoordinator` | `image string` | - | [L393](file:///d:/claude/nomad/drivers/docker/coordinator.go#L393) |
| `emitEvent` | `d *dockerCoordinator` | `image string, message string, annotations map[string]string` | - | [L399](file:///d:/claude/nomad/drivers/docker/coordinator.go#L399) |
| `handlePullInactivity` | `d *dockerCoordinator` | `image string, msg string, timestamp time.Time` | - | [L407](file:///d:/claude/nomad/drivers/docker/coordinator.go#L407) |
| `handlePullProgressReport` | `d *dockerCoordinator` | `image string, msg string, _ time.Time` | - | [L412](file:///d:/claude/nomad/drivers/docker/coordinator.go#L412) |
| `handleSlowPullProgressReport` | `d *dockerCoordinator` | `image string, msg string, _ time.Time` | - | [L416](file:///d:/claude/nomad/drivers/docker/coordinator.go#L416) |
| `recoverablePullError` | - | `err error, image string` | `error` | [L424](file:///d:/claude/nomad/drivers/docker/coordinator.go#L424) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `regexp` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/containerd/errdefs` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/moby/moby/api/types/registry` | 第三方库 |
| `github.com/moby/moby/client` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [coordinator_test.go](file:///d:/claude/nomad/drivers/docker/coordinator_test.go) | 对应测试文件 |

