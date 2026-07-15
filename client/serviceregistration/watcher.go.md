# watcher.go 代码说明文档

> 文件路径：[client/serviceregistration/watcher.go](file:///d:/claude/nomad/client/serviceregistration/watcher.go)
> 总行数：330 行
> 所属包：`serviceregistration`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **服务注册子包**（`client/serviceregistration`），将任务暴露的服务注册到 Consul 或 Nomad 内置服务发现，支持健康检查和负载均衡。

## 2. 类型定义

### key

**定义位置**：[L18](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L18)

**类型定义**：`type key string`

### restarter

**定义位置**：[L20](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L20)

**中文说明**：restarter 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type restarter struct {
	allocID string
	taskName string
	checkID string
	checkName string
	taskKey key
	logger hclog.Logger
	task WorkloadRestarter
	grace time.Duration
	interval time.Duration
	timeLimit time.Duration
	ignoreWarnings bool
	unhealthyState time.Time
	graceUntil time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `allocID` | `string` | 字符串 |
| `taskName` | `string` | 字符串 |
| `checkID` | `string` | 字符串 |
| `checkName` | `string` | 字符串 |
| `taskKey` | `key` | — |
| `logger` | `hclog.Logger` | 日志记录器 |
| `task` | `WorkloadRestarter` | — |
| `grace` | `time.Duration` | 时间间隔 |
| `interval` | `time.Duration` | 时间间隔 |
| `timeLimit` | `time.Duration` | 时间间隔 |
| `ignoreWarnings` | `bool` | 布尔值 |
| `unhealthyState` | `time.Time` | 时间点 |
| `graceUntil` | `time.Time` | 时间点 |

**关联方法**（1 个）：`apply`

### CheckStatusGetter

**定义位置**：[L122](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L122)

**中文说明**：CheckStatusGetter 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type CheckStatusGetter interface {
	Get func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Get` | `func(...)` | 获取对象的信息。 |

### checkWatchUpdate

**定义位置**：[L128](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L128)

**中文说明**：checkWatchUpdate 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type checkWatchUpdate struct {
	checkID string
	remove bool
	restart *restarter
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `checkID` | `string` | 字符串 |
| `remove` | `bool` | 布尔值 |
| `restart` | `*restarter` | — |

### CheckWatcher

**定义位置**：[L136](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L136)

**中文说明**：CheckWatcher 是一个监视器，持续监控特定资源的状态变化并触发相应处理。

**类型**：interface

```go
type CheckWatcher interface {
	Run func(...)
	Watch func(...)
	Unwatch func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Run` | `func(...)` | 运行对象的主循环。 |
| `Watch` | `func(...)` | — |
| `Unwatch` | `func(...)` | — |

### UniversalCheckWatcher

**定义位置**：[L153](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L153)

**中文说明**：UniversalCheckWatcher 是一个监视器，持续监控特定资源的状态变化并触发相应处理。

**类型**：struct

```go
type UniversalCheckWatcher struct {
	logger hclog.Logger
	getter CheckStatusGetter
	pollFrequency time.Duration
	checkUpdateCh chan checkWatchUpdate
	done chan struct{...}
	failedPreviousInterval bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `getter` | `CheckStatusGetter` | — |
| `pollFrequency` | `time.Duration` | 时间间隔 |
| `checkUpdateCh` | `chan checkWatchUpdate` | 通道 |
| `done` | `chan struct{...}` | 信号通道 |
| `failedPreviousInterval` | `bool` | 布尔值 |

**关联方法**（4 个）：`Watch`, `Unwatch`, `Run`, `interval`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `apply` | `r *restarter` | `ctx context.Context, now time.Time, status string` | `bool` | [L49](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L49) |
| `asyncRestart` | - | `ctx context.Context, logger hclog.Logger, task WorkloadRestarter, event *stru...` | `` | [L105](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L105) |
| `NewCheckWatcher` | - | `logger hclog.Logger, getter CheckStatusGetter` | `*UniversalCheckWatcher` | [L171](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L171) |
| `Watch` | `w *UniversalCheckWatcher` | `allocID string, taskName string, checkID string, check *structs.ServiceCheck,...` | `` | [L182](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L182) |
| `Unwatch` | `w *UniversalCheckWatcher` | `checkID string` | `` | [L212](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L212) |
| `Run` | `w *UniversalCheckWatcher` | `ctx context.Context` | `` | [L222](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L222) |
| `interval` | `w *UniversalCheckWatcher` | `ctx context.Context, now time.Time, watched map[string]*restarter` | `` | [L280](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L280) |

## 5. 核心方法详解

### NewCheckWatcher()

**签名**：`func NewCheckWatcher(logger hclog.Logger, getter CheckStatusGetter) *UniversalCheckWatcher`

**位置**：[L171](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L171)

**中文说明**：创建并返回一个新的 CheckWatcher 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `getter` | `CheckStatusGetter` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*UniversalCheckWatcher` | — |

### Watch()

**签名**：`func (w *UniversalCheckWatcher) Watch(allocID string, taskName string, checkID string, check *structs.ServiceCheck, wr WorkloadRestarter) `

**位置**：[L182](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L182)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `allocID` | `string` | 字符串 |
| `taskName` | `string` | 字符串 |
| `checkID` | `string` | 字符串 |
| `check` | `*structs.ServiceCheck` | — |
| `wr` | `WorkloadRestarter` | — |

### Run()

**签名**：`func (w *UniversalCheckWatcher) Run(ctx context.Context) `

**位置**：[L222](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L222)

**中文说明**：运行对象的主循环。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **后台协程**：启动 goroutine 执行后台任务
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [watcher_test.go](file:///d:/claude/nomad/client/serviceregistration/watcher_test.go) | 对应测试文件 |
| [address.go](file:///d:/claude/nomad/client/serviceregistration/address.go) | 同目录源文件 |
| [id.go](file:///d:/claude/nomad/client/serviceregistration/id.go) | 同目录源文件 |
| [service_registration.go](file:///d:/claude/nomad/client/serviceregistration/service_registration.go) | 同目录源文件 |
| [workload.go](file:///d:/claude/nomad/client/serviceregistration/workload.go) | 同目录源文件 |

