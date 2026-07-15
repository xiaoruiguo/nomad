# runner_lifecycle.go 代码说明文档

> 文件路径：[client/allocrunner/interfaces/runner_lifecycle.go](file:///d:/claude/nomad/client/allocrunner/interfaces/runner_lifecycle.go)
> 总行数：78 行
> 所属包：`interfaces`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### RunnerHook

**定义位置**：[L12](file:///d:/claude/nomad/client/allocrunner/interfaces/runner_lifecycle.go#L12)

**中文说明**：RunnerHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type RunnerHook interface {
	Name func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Name` | `func(...)` | — |

### RunnerPrerunHook

**定义位置**：[L18](file:///d:/claude/nomad/client/allocrunner/interfaces/runner_lifecycle.go#L18)

**中文说明**：RunnerPrerunHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type RunnerPrerunHook interface {
	RunnerHook RunnerHook
	Prerun func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `RunnerHook` | `RunnerHook` | 运行nerHook的主循环。 |
| `Prerun` | `func(...)` | — |

### RunnerPreKillHook

**定义位置**：[L26](file:///d:/claude/nomad/client/allocrunner/interfaces/runner_lifecycle.go#L26)

**中文说明**：RunnerPreKillHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type RunnerPreKillHook interface {
	RunnerHook RunnerHook
	PreKill func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `RunnerHook` | `RunnerHook` | 运行nerHook的主循环。 |
| `PreKill` | `func(...)` | — |

### RunnerPostrunHook

**定义位置**：[L35](file:///d:/claude/nomad/client/allocrunner/interfaces/runner_lifecycle.go#L35)

**中文说明**：RunnerPostrunHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type RunnerPostrunHook interface {
	RunnerHook RunnerHook
	Postrun func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `RunnerHook` | `RunnerHook` | 运行nerHook的主循环。 |
| `Postrun` | `func(...)` | — |

### RunnerDestroyHook

**定义位置**：[L43](file:///d:/claude/nomad/client/allocrunner/interfaces/runner_lifecycle.go#L43)

**中文说明**：RunnerDestroyHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type RunnerDestroyHook interface {
	RunnerHook RunnerHook
	Destroy func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `RunnerHook` | `RunnerHook` | 运行nerHook的主循环。 |
| `Destroy` | `func(...)` | — |

### RunnerUpdateHook

**定义位置**：[L53](file:///d:/claude/nomad/client/allocrunner/interfaces/runner_lifecycle.go#L53)

**中文说明**：RunnerUpdateHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type RunnerUpdateHook interface {
	RunnerHook RunnerHook
	Update func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `RunnerHook` | `RunnerHook` | 运行nerHook的主循环。 |
| `Update` | `func(...)` | 更新指定的对象。 |

### RunnerUpdateRequest

**定义位置**：[L58](file:///d:/claude/nomad/client/allocrunner/interfaces/runner_lifecycle.go#L58)

**中文说明**：RunnerUpdateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type RunnerUpdateRequest struct {
	Alloc *structs.Allocation
	AllocEnv *taskenv.TaskEnv
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Alloc` | `*structs.Allocation` | — |
| `AllocEnv` | `*taskenv.TaskEnv` | — |

### RunnerTaskRestartHook

**定义位置**：[L65](file:///d:/claude/nomad/client/allocrunner/interfaces/runner_lifecycle.go#L65)

**中文说明**：RunnerTaskRestartHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type RunnerTaskRestartHook interface {
	RunnerHook RunnerHook
	PreTaskRestart func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `RunnerHook` | `RunnerHook` | 运行nerHook的主循环。 |
| `PreTaskRestart` | `func(...)` | — |

### ShutdownHook

**定义位置**：[L73](file:///d:/claude/nomad/client/allocrunner/interfaces/runner_lifecycle.go#L73)

**中文说明**：ShutdownHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type ShutdownHook interface {
	RunnerHook RunnerHook
	Shutdown func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `RunnerHook` | `RunnerHook` | 运行nerHook的主循环。 |
| `Shutdown` | `func(...)` | 关闭对象，释放相关资源。 |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

该文件未定义方法。

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [runner.go](file:///d:/claude/nomad/client/allocrunner/interfaces/runner.go) | 同目录源文件 |
| [task_lifecycle.go](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go) | 同目录源文件 |

