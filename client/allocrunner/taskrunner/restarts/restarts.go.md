# restarts.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/restarts/restarts.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go)
> 总行数：260 行
> 所属包：`restarts`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务重启子包**（`client/allocrunner/taskrunner/restarts`），实现任务重启策略的计算和跟踪。

## 2. 类型定义

### RestartTracker

**定义位置**：[L57](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L57)

**类型**：struct

```go
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
```

**关联方法**（11 个）：`SetPolicy`, `GetPolicy`, `SetStartError`, `SetExitResult`, `SetRestartTriggered`, `SetKilled`, `GetReason`, `GetCount`, `GetState`, `getDelay`, `jitter`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `jitter` | `0.25` |
| `ReasonNoRestartsAllowed` | `"Policy allows no restarts"` |
| `ReasonUnrecoverableError` | `"Error was unrecoverable"` |
| `ReasonWithinPolicy` | `"Restart within policy"` |
| `ReasonDelay` | `"Exceeded allowed attempts, applying a delay"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewRestartTracker` | - | `policy *structs.RestartPolicy, jobType string, tlc *structs.TaskLifecycleCon...` | `*RestartTracker` | [L26](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L26) |
| `SetPolicy` | `r *RestartTracker` | `policy *structs.RestartPolicy` | - | [L73](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L73) |
| `GetPolicy` | `r *RestartTracker` | - | `*structs.RestartPolicy` | [L80](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L80) |
| `SetStartError` | `r *RestartTracker` | `err error` | `*RestartTracker` | [L88](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L88) |
| `SetExitResult` | `r *RestartTracker` | `res *drivers.ExitResult` | `*RestartTracker` | [L97](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L97) |
| `SetRestartTriggered` | `r *RestartTracker` | `failure bool` | `*RestartTracker` | [L109](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L109) |
| `SetKilled` | `r *RestartTracker` | - | `*RestartTracker` | [L121](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L121) |
| `GetReason` | `r *RestartTracker` | - | `string` | [L130](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L130) |
| `GetCount` | `r *RestartTracker` | - | `int` | [L137](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L137) |
| `GetState` | `r *RestartTracker` | - | `string, time.Duration` | [L153](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L153) |
| `getDelay` | `r *RestartTracker` | - | `time.Duration` | [L243](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L243) |
| `jitter` | `r *RestartTracker` | - | `time.Duration` | [L250](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L250) |

## 5. 核心方法详解

### GetPolicy()

**签名**：`func (r *RestartTracker) GetPolicy() *structs.RestartPolicy`

**位置**：[L80](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L80)

### GetReason()

**签名**：`func (r *RestartTracker) GetReason() string`

**位置**：[L130](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L130)

### GetCount()

**签名**：`func (r *RestartTracker) GetCount() int`

**位置**：[L137](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L137)

### GetState()

**签名**：`func (r *RestartTracker) GetState() string, time.Duration`

**位置**：[L153](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts.go#L153)

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

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [restarts_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/restarts/restarts_test.go) | 对应测试文件 |

