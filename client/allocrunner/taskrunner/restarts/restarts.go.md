# restarts.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/restarts/restarts.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go)
> 总行数：260 行
> 所属包：`restarts`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### RestartTracker

**定义位置**：[L57](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L57)

**中文说明**：RestartTracker 是一个跟踪器，记录和跟踪特定对象的状态信息。

**类型**：struct

```go
type RestartTracker struct {
	exitRes *drivers.ExitResult
	startErr error
	killed bool
	restartTriggered bool
	failure bool
	count int
	onSuccess bool
	startTime time.Time
	reason string
	policy *structs.RestartPolicy
	rand *rand.Rand
	lock sync.Mutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `exitRes` | `*drivers.ExitResult` | — |
| `startErr` | `error` | 错误信息 |
| `killed` | `bool` | 布尔值 |
| `restartTriggered` | `bool` | 布尔值 |
| `failure` | `bool` | 布尔值 |
| `count` | `int` | 计数 |
| `onSuccess` | `bool` | 布尔值 |
| `startTime` | `time.Time` | 时间点 |
| `reason` | `string` | 字符串 |
| `policy` | `*structs.RestartPolicy` | 策略 |
| `rand` | `*rand.Rand` | — |
| `lock` | `sync.Mutex` | 互斥锁，保护并发访问 |

**关联方法**（11 个）：`SetPolicy`, `GetPolicy`, `SetStartError`, `SetExitResult`, `SetRestartTriggered`, `SetKilled`, `GetReason`, `GetCount`, `GetState`, `getDelay`, `jitter`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `jitter` | `—` | `0.25` | — |
| `ReasonNoRestartsAllowed` | `—` | `"Policy allows no restarts"` | — |
| `ReasonUnrecoverableError` | `—` | `"Error was unrecoverable"` | — |
| `ReasonWithinPolicy` | `—` | `"Restart within policy"` | — |
| `ReasonDelay` | `—` | `"Exceeded allowed attempts, applying a delay"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewRestartTracker` | - | `policy *structs.RestartPolicy, jobType string, tlc *structs.TaskLifecycleConfig` | `*RestartTracker` | [L26](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L26) |
| `SetPolicy` | `r *RestartTracker` | `policy *structs.RestartPolicy` | `` | [L73](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L73) |
| `GetPolicy` | `r *RestartTracker` | `` | `*structs.RestartPolicy` | [L80](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L80) |
| `SetStartError` | `r *RestartTracker` | `err error` | `*RestartTracker` | [L88](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L88) |
| `SetExitResult` | `r *RestartTracker` | `res *drivers.ExitResult` | `*RestartTracker` | [L97](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L97) |
| `SetRestartTriggered` | `r *RestartTracker` | `failure bool` | `*RestartTracker` | [L109](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L109) |
| `SetKilled` | `r *RestartTracker` | `` | `*RestartTracker` | [L121](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L121) |
| `GetReason` | `r *RestartTracker` | `` | `string` | [L130](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L130) |
| `GetCount` | `r *RestartTracker` | `` | `int` | [L137](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L137) |
| `GetState` | `r *RestartTracker` | `` | `string, time.Duration` | [L153](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L153) |
| `getDelay` | `r *RestartTracker` | `` | `time.Duration` | [L243](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L243) |
| `jitter` | `r *RestartTracker` | `` | `time.Duration` | [L250](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L250) |

## 5. 核心方法详解

### NewRestartTracker()

**签名**：`func NewRestartTracker(policy *structs.RestartPolicy, jobType string, tlc *structs.TaskLifecycleConfig) *RestartTracker`

**位置**：[L26](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L26)

**中文说明**：创建并返回一个新的 RestartTracker 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `policy` | `*structs.RestartPolicy` | 策略 |
| `jobType` | `string` | 字符串 |
| `tlc` | `*structs.TaskLifecycleConfig` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*RestartTracker` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `math/rand` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [restarts_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts_test.go) | 对应测试文件 |

