# task_lifecycle.go 代码说明文档

> 文件路径：[client/allocrunner/interfaces/task_lifecycle.go](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go)
> 总行数：220 行
> 所属包：`interfaces`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### TaskHook

**定义位置**：[L42](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L42)

**中文说明**：TaskHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type TaskHook interface {
	Name func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Name` | `func(...)` | — |

### TaskPrestartRequest

**定义位置**：[L46](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L46)

**中文说明**：TaskPrestartRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type TaskPrestartRequest struct {
	PreviousState map[string]string
	Task *structs.Task
	TaskResources *structs.AllocatedTaskResources
	VaultToken string
	NomadToken string
	TaskDir *allocdir.TaskDir
	TaskEnv *taskenv.TaskEnv
	Alloc *structs.Allocation
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PreviousState` | `map[string]string` | 映射表 |
| `Task` | `*structs.Task` | — |
| `TaskResources` | `*structs.AllocatedTaskResources` | — |
| `VaultToken` | `string` | 字符串 |
| `NomadToken` | `string` | 字符串 |
| `TaskDir` | `*allocdir.TaskDir` | — |
| `TaskEnv` | `*taskenv.TaskEnv` | — |
| `Alloc` | `*structs.Allocation` | — |

### TaskPrestartResponse

**定义位置**：[L73](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L73)

**中文说明**：TaskPrestartResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type TaskPrestartResponse struct {
	Env map[string]string
	Mounts []*drivers.MountConfig
	Devices []*drivers.DeviceConfig
	State map[string]string
	Done bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Env` | `map[string]string` | 映射表 |
| `Mounts` | `[]*drivers.MountConfig` | 列表 |
| `Devices` | `[]*drivers.DeviceConfig` | 列表 |
| `State` | `map[string]string` | 状态 |
| `Done` | `bool` | 布尔值 |

### TaskPrestartHook

**定义位置**：[L102](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L102)

**中文说明**：TaskPrestartHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type TaskPrestartHook interface {
	TaskHook TaskHook
	Prestart func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `TaskHook` | `TaskHook` | — |
| `Prestart` | `func(...)` | — |

### DriverStats

**定义位置**：[L115](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L115)

**中文说明**：DriverStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：interface

```go
type DriverStats interface {
	Stats func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Stats` | `func(...)` | 返回对象的统计信息。 |

### TaskPoststartRequest

**定义位置**：[L119](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L119)

**中文说明**：TaskPoststartRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type TaskPoststartRequest struct {
	DriverExec interfaces.ScriptExecutor
	DriverNetwork *drivers.DriverNetwork
	TaskEnv *taskenv.TaskEnv
	DriverStats DriverStats
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DriverExec` | `interfaces.ScriptExecutor` | — |
| `DriverNetwork` | `*drivers.DriverNetwork` | 网络 信息 (可能是 nil) |
| `TaskEnv` | `*taskenv.TaskEnv` | — |
| `DriverStats` | `DriverStats` | — |

### TaskPoststartResponse

**定义位置**：[L133](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L133)

**中文说明**：TaskPoststartResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

### TaskPoststartHook

**定义位置**：[L135](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L135)

**中文说明**：TaskPoststartHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type TaskPoststartHook interface {
	TaskHook TaskHook
	Poststart func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `TaskHook` | `TaskHook` | — |
| `Poststart` | `func(...)` | — |

### TaskPreKillRequest

**定义位置**：[L145](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L145)

**中文说明**：TaskPreKillRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

### TaskPreKillResponse

**定义位置**：[L146](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L146)

**中文说明**：TaskPreKillResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

### TaskPreKillHook

**定义位置**：[L148](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L148)

**中文说明**：TaskPreKillHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type TaskPreKillHook interface {
	TaskHook TaskHook
	PreKilling func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `TaskHook` | `TaskHook` | — |
| `PreKilling` | `func(...)` | — |

### TaskExitedRequest

**定义位置**：[L157](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L157)

**中文说明**：TaskExitedRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

### TaskExitedResponse

**定义位置**：[L158](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L158)

**中文说明**：TaskExitedResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

### TaskExitedHook

**定义位置**：[L160](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L160)

**中文说明**：TaskExitedHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type TaskExitedHook interface {
	TaskHook TaskHook
	Exited func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `TaskHook` | `TaskHook` | — |
| `Exited` | `func(...)` | — |

### TaskUpdateRequest

**定义位置**：[L170](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L170)

**中文说明**：TaskUpdateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type TaskUpdateRequest struct {
	VaultToken string
	NomadToken string
	Alloc *structs.Allocation
	TaskEnv *taskenv.TaskEnv
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VaultToken` | `string` | 字符串 |
| `NomadToken` | `string` | 字符串 |
| `Alloc` | `*structs.Allocation` | — |
| `TaskEnv` | `*taskenv.TaskEnv` | — |

### TaskUpdateResponse

**定义位置**：[L182](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L182)

**中文说明**：TaskUpdateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

### TaskUpdateHook

**定义位置**：[L184](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L184)

**中文说明**：TaskUpdateHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type TaskUpdateHook interface {
	TaskHook TaskHook
	Update func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `TaskHook` | `TaskHook` | — |
| `Update` | `func(...)` | 更新指定的对象。 |

### TaskStopRequest

**定义位置**：[L196](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L196)

**中文说明**：TaskStopRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type TaskStopRequest struct {
	ExistingState map[string]string
	TaskDir *allocdir.TaskDir
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ExistingState` | `map[string]string` | 映射表 |
| `TaskDir` | `*allocdir.TaskDir` | — |

### TaskStopResponse

**定义位置**：[L205](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L205)

**中文说明**：TaskStopResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

### TaskStopHook

**定义位置**：[L207](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L207)

**中文说明**：TaskStopHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：interface

```go
type TaskStopHook interface {
	TaskHook TaskHook
	Stop func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `TaskHook` | `TaskHook` | — |
| `Stop` | `func(...)` | 停止对象。 |

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
| `context` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocdir` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [runner.go](file:///d:/claude/nomad/client/allocrunner/interfaces/runner.go) | 同目录源文件 |
| [runner_lifecycle.go](file:///d:/claude/nomad/client/allocrunner/interfaces/runner_lifecycle.go) | 同目录源文件 |

