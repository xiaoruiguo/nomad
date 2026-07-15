# task_lifecycle.go 代码说明文档

> 文件路径：[allocrunner/interfaces/task_lifecycle.go](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go)
> 总行数：220 行
> 所属包：`interfaces`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器接口子包**（`client/allocrunner/interfaces`），定义分配运行器各组件的接口契约。

## 2. 类型定义

### TaskHook

**定义位置**：[L42](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L42)

**类型**：interface

```go
	Name
```

### TaskPrestartRequest

**定义位置**：[L46](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L46)

**类型**：struct

```go
	PreviousState map[string]string
	Task *structs.Task
	TaskResources *structs.AllocatedTaskResources
	VaultToken string
	NomadToken string
	TaskDir *allocdir.TaskDir
	TaskEnv *taskenv.TaskEnv
	Alloc *structs.Allocation
```

### TaskPrestartResponse

**定义位置**：[L73](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L73)

**类型**：struct

```go
	Env map[string]string
	Mounts []*drivers.MountConfig
	Devices []*drivers.DeviceConfig
	State map[string]string
	Done bool
```

### TaskPrestartHook

**定义位置**：[L102](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L102)

**类型**：interface

```go
	TaskHook
	Prestart
```

### DriverStats

**定义位置**：[L115](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L115)

**类型**：interface

```go
	Stats
```

### TaskPoststartRequest

**定义位置**：[L119](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L119)

**类型**：struct

```go
	DriverExec interfaces.ScriptExecutor
	DriverNetwork *drivers.DriverNetwork
	TaskEnv *taskenv.TaskEnv
	DriverStats DriverStats
```

### TaskPoststartResponse

**定义位置**：[L133](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L133)

**类型**：struct

### TaskPoststartHook

**定义位置**：[L135](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L135)

**类型**：interface

```go
	TaskHook
	Poststart
```

### TaskPreKillRequest

**定义位置**：[L145](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L145)

**类型**：struct

### TaskPreKillResponse

**定义位置**：[L146](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L146)

**类型**：struct

### TaskPreKillHook

**定义位置**：[L148](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L148)

**类型**：interface

```go
	TaskHook
	PreKilling
```

### TaskExitedRequest

**定义位置**：[L157](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L157)

**类型**：struct

### TaskExitedResponse

**定义位置**：[L158](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L158)

**类型**：struct

### TaskExitedHook

**定义位置**：[L160](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L160)

**类型**：interface

```go
	TaskHook
	Exited
```

### TaskUpdateRequest

**定义位置**：[L170](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L170)

**类型**：struct

```go
	VaultToken string
	NomadToken string
	Alloc *structs.Allocation
	TaskEnv *taskenv.TaskEnv
```

### TaskUpdateResponse

**定义位置**：[L182](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L182)

**类型**：struct

### TaskUpdateHook

**定义位置**：[L184](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L184)

**类型**：interface

```go
	TaskHook
	Update
```

### TaskStopRequest

**定义位置**：[L196](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L196)

**类型**：struct

```go
	ExistingState map[string]string
	TaskDir *allocdir.TaskDir
```

### TaskStopResponse

**定义位置**：[L205](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L205)

**类型**：struct

### TaskStopHook

**定义位置**：[L207](file:///d:/claude/nomad/client/allocrunner/interfaces/task_lifecycle.go#L207)

**类型**：interface

```go
	TaskHook
	Stop
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

该文件未定义方法。

## 5. 核心方法详解

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

