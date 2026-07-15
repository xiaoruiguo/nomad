# task_runner_hooks.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/task_runner_hooks.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go)
> 总行数：629 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### hookResources

**定义位置**：[L22](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L22)

**中文说明**：hookResources 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type hookResources struct {
	Devices []*drivers.DeviceConfig
	Mounts []*drivers.MountConfig
	sync.RWMutex sync.RWMutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Devices` | `[]*drivers.DeviceConfig` | 列表 |
| `Mounts` | `[]*drivers.MountConfig` | 列表 |
| `sync.RWMutex` | `sync.RWMutex` | 读写锁，保护并发访问 |

**关联方法**（4 个）：`setDevices`, `getDevices`, `setMounts`, `getMounts`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `setDevices` | `h *hookResources` | `d []*drivers.DeviceConfig` | `` | [L28](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L28) |
| `getDevices` | `h *hookResources` | `` | `[]*drivers.DeviceConfig` | [L34](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L34) |
| `setMounts` | `h *hookResources` | `m []*drivers.MountConfig` | `` | [L40](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L40) |
| `getMounts` | `h *hookResources` | `` | `[]*drivers.MountConfig` | [L46](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L46) |
| `initHooks` | `tr *TaskRunner` | `` | `` | [L53](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L53) |
| `emitHookError` | `tr *TaskRunner` | `err error, hookName string` | `` | [L206](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L206) |
| `prestart` | `tr *TaskRunner` | `` | `error` | [L219](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L219) |
| `poststart` | `tr *TaskRunner` | `` | `error` | [L351](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L351) |
| `exited` | `tr *TaskRunner` | `` | `error` | [L406](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L406) |
| `stop` | `tr *TaskRunner` | `` | `error` | [L450](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L450) |
| `updateHooks` | `tr *TaskRunner` | `` | `` | [L505](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L505) |
| `preKill` | `tr *TaskRunner` | `` | `` | [L561](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L561) |
| `shutdownHooks` | `tr *TaskRunner` | `` | `` | [L605](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L605) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/errors` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/LK4D4/joincontext` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go) | 同目录源文件 |
| [consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |

