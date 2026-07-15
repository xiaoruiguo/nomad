# reconcile_dangling.go 代码说明文档

> 文件路径：[drivers/docker/reconcile_dangling.go](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go)
> 总行数：235 行
> 所属包：`docker`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Docker 驱动子包**（`drivers/docker`），实现 Nomad 的 Docker 任务驱动，通过 Docker API 管理容器的生命周期（创建、启动、停止、销毁）、资源限制、网络配置和日志收集。支持 Docker API 版本协商、认证、健康检查和统计信息收集。

## 2. 类型定义

### containerReconciler

**定义位置**：[L25](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go#L25)

**中文说明**：containerReconciler 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type containerReconciler struct {
	ctx context.Context
	config *ContainerGCConfig
	logger hclog.Logger
	getClient func(...)
	isDriverHealthy func(...)
	trackedContainers func(...)
	isNomadContainer func(...)
	once sync.Once
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `config` | `*ContainerGCConfig` | 配置 |
| `logger` | `hclog.Logger` | 日志记录器 |
| `getClient` | `func(...)` | — |
| `isDriverHealthy` | `func(...)` | — |
| `trackedContainers` | `func(...)` | — |
| `isNomadContainer` | `func(...)` | — |
| `once` | `sync.Once` | — |

**关联方法**（5 个）：`Start`, `removeDanglingContainersGoroutine`, `removeDanglingContainersIteration`, `untrackedContainers`, `dockerAPIQueryContext`

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `nomadContainerNamePattern` | `—` | `regexp.MustCompile(`\/.*-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]...` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newReconciler` | - | `d *Driver` | `*containerReconciler` | [L38](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go#L38) |
| `Start` | `r *containerReconciler` | `` | `` | [L51](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go#L51) |
| `removeDanglingContainersGoroutine` | `r *containerReconciler` | `` | `` | [L62](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go#L62) |
| `removeDanglingContainersIteration` | `r *containerReconciler` | `` | `error` | [L96](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go#L96) |
| `untrackedContainers` | `r *containerReconciler` | `tracked set.Collection[string], cutoffTime time.Time` | `*set.Set[string], error` | [L134](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go#L134) |
| `dockerAPIQueryContext` | `r *containerReconciler` | `` | `context.Context, context.CancelFunc` | [L176](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go#L176) |
| `isNomadContainer` | - | `c container.Summary` | `bool` | [L187](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go#L187) |
| `hasMount` | - | `c container.Summary, p string` | `bool` | [L205](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go#L205) |
| `hasNomadName` | - | `c container.Summary` | `bool` | [L217](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go#L217) |
| `trackedContainers` | `d *Driver` | `` | `set.Collection[string]` | [L229](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go#L229) |

## 5. 核心方法详解

### Start()

**签名**：`func (r *containerReconciler) Start() `

**位置**：[L51](file:///d:/claude/nomad/drivers/docker/reconcile_dangling.go#L51)

**中文说明**：启动对象。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `regexp` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/moby/moby/api/types/container` | 第三方库 |
| `github.com/moby/moby/client` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [reconcile_dangling_test.go](file:///d:/claude/nomad/drivers/docker/reconcile_dangling_test.go) | 对应测试文件 |
| [config.go](file:///d:/claude/nomad/drivers/docker/config.go) | 同目录源文件 |
| [coordinator.go](file:///d:/claude/nomad/drivers/docker/coordinator.go) | 同目录源文件 |
| [cpuset.go](file:///d:/claude/nomad/drivers/docker/cpuset.go) | 同目录源文件 |
| [driver.go](file:///d:/claude/nomad/drivers/docker/driver.go) | 同目录源文件 |
| [driver_default.go](file:///d:/claude/nomad/drivers/docker/driver_default.go) | 同目录源文件 |

