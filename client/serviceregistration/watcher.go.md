# watcher.go 代码说明文档

> 文件路径：[serviceregistration/watcher.go](file:///d:/claude/nomad/client/serviceregistration/watcher.go)
> 总行数：330 行
> 所属包：`serviceregistration`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **服务注册子包**（`client/serviceregistration`），管理任务服务的注册和注销（Consul/Nomad 内置）。

## 2. 类型定义

### key

**定义位置**：[L18](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L18)

**类型定义**：`string`

### restarter

**定义位置**：[L20](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L20)

**类型**：struct

```go
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
```

**关联方法**（1 个）：`apply`

### CheckStatusGetter

**定义位置**：[L122](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L122)

**类型**：interface

```go
	Get
```

### checkWatchUpdate

**定义位置**：[L128](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L128)

**类型**：struct

```go
	checkID string
	remove bool
	restart *restarter
```

### CheckWatcher

**定义位置**：[L136](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L136)

**类型**：interface

```go
	Run
	Watch
	Unwatch
```

### UniversalCheckWatcher

**定义位置**：[L153](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L153)

**类型**：struct

```go
	logger hclog.Logger
	getter CheckStatusGetter
	pollFrequency time.Duration
	checkUpdateCh chan checkWatchUpdate
	done chan struct{...}
	failedPreviousInterval bool
```

**关联方法**（4 个）：`Watch`, `Unwatch`, `Run`, `interval`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `apply` | `r *restarter` | `ctx context.Context, now time.Time, status string` | `bool` | [L49](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L49) |
| `asyncRestart` | - | `ctx context.Context, logger hclog.Logger, task WorkloadRestarter, event *str...` | - | [L105](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L105) |
| `NewCheckWatcher` | - | `logger hclog.Logger, getter CheckStatusGetter` | `*UniversalCheckWatcher` | [L171](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L171) |
| `Watch` | `w *UniversalCheckWatcher` | `allocID string, taskName string, checkID string, check *structs.ServiceCheck...` | - | [L182](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L182) |
| `Unwatch` | `w *UniversalCheckWatcher` | `checkID string` | - | [L212](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L212) |
| `Run` | `w *UniversalCheckWatcher` | `ctx context.Context` | - | [L222](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L222) |
| `interval` | `w *UniversalCheckWatcher` | `ctx context.Context, now time.Time, watched map[string]*restarter` | - | [L280](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L280) |

## 5. 核心方法详解

### Run()

**签名**：`func (w *UniversalCheckWatcher) Run(ctx context.Context) `

**位置**：[L222](file:///d:/claude/nomad/client/serviceregistration/watcher.go#L222)

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
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [watcher_test.go](file:///d:/claude/nomad/client/serviceregistration/watcher_test.go) | 对应测试文件 |

