# coordinator.go 代码说明文档

> 文件路径：[client/allocrunner/tasklifecycle/coordinator.go](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go)
> 总行数：431 行
> 所属包：`tasklifecycle`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### coordinatorState

**定义位置**：[L15](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L15)

**类型定义**：`type coordinatorState uint8`

**关联方法**（1 个）：`String`

### lifecycleStage

**定义位置**：[L51](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L51)

**类型定义**：`type lifecycleStage uint8`

### Coordinator

**定义位置**：[L83](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L83)

**中文说明**：Coordinator 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Coordinator struct {
	logger hclog.Logger
	tasksByLifecycle map[lifecycleStage][]string
	currentState coordinatorState
	currentStateLock sync.RWMutex
	gates map[lifecycleStage]*Gate
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `tasksByLifecycle` | `map[lifecycleStage][]string` | 映射表 |
| `currentState` | `coordinatorState` | — |
| `currentStateLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |
| `gates` | `map[lifecycleStage]*Gate` | 映射表 |

**关联方法**（17 个）：`Restart`, `Restore`, `StartConditionForTask`, `TaskStateUpdated`, `nextStateLocked`, `enterStateLocked`, `isInitDone`, `isPrestartDone`, `isMainDone`, `isPoststartDone`, `isAllocDone`, `hasPrestart`, `hasMain`, `hasPoststart`, `hasPoststop`, `block`, `allow`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `coordinatorStateInit` | `coordinatorState` | `iota` | — |
| `coordinatorStatePrestart` | `—` | `` | — |
| `coordinatorStateMain` | `—` | `` | — |
| `coordinatorStatePoststart` | `—` | `` | — |
| `coordinatorStateWaitAlloc` | `—` | `` | — |
| `coordinatorStatePoststop` | `—` | `` | — |
| `lifecycleStagePrestartEphemeral` | `lifecycleStage` | `iota` | — |
| `lifecycleStagePrestartSidecar` | `—` | `` | — |
| `lifecycleStageMain` | `—` | `` | — |
| `lifecycleStagePoststartEphemeral` | `—` | `` | — |
| `lifecycleStagePoststartSidecar` | `—` | `` | — |
| `lifecycleStagePoststop` | `—` | `` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `String` | `s *coordinatorState` | `` | `string` | [L26](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L26) |
| `NewCoordinator` | - | `logger hclog.Logger, tasks []*structs.Task, shutdownCh <-chan struct{...}` | `*Coordinator` | [L100](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L100) |
| `Restart` | `c *Coordinator` | `` | `` | [L118](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L118) |
| `Restore` | `c *Coordinator` | `states map[string]*structs.TaskState` | `` | [L126](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L126) |
| `StartConditionForTask` | `c *Coordinator` | `task *structs.Task` | `<-chan struct{...}` | [L136](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L136) |
| `TaskStateUpdated` | `c *Coordinator` | `states map[string]*structs.TaskState` | `` | [L143](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L143) |
| `nextStateLocked` | `c *Coordinator` | `states map[string]*structs.TaskState` | `coordinatorState` | [L165](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L165) |
| `enterStateLocked` | `c *Coordinator` | `state coordinatorState` | `` | [L216](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L216) |
| `isInitDone` | `c *Coordinator` | `states map[string]*structs.TaskState` | `bool` | [L279](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L279) |
| `isPrestartDone` | `c *Coordinator` | `states map[string]*structs.TaskState` | `bool` | [L293](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L293) |
| `isMainDone` | `c *Coordinator` | `states map[string]*structs.TaskState` | `bool` | [L314](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L314) |
| `isPoststartDone` | `c *Coordinator` | `states map[string]*structs.TaskState` | `bool` | [L330](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L330) |
| `isAllocDone` | `c *Coordinator` | `states map[string]*structs.TaskState` | `bool` | [L345](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L345) |
| `hasPrestart` | `c *Coordinator` | `` | `bool` | [L360](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L360) |
| `hasMain` | `c *Coordinator` | `` | `bool` | [L365](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L365) |
| `hasPoststart` | `c *Coordinator` | `` | `bool` | [L369](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L369) |
| `hasPoststop` | `c *Coordinator` | `` | `bool` | [L374](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L374) |
| `block` | `c *Coordinator` | `lifecycle lifecycleStage` | `` | [L379](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L379) |
| `allow` | `c *Coordinator` | `lifecycle lifecycleStage` | `` | [L387](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L387) |
| `indexTasksByLifecycle` | - | `tasks []*structs.Task` | `map[lifecycleStage][]string` | [L397](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L397) |
| `taskLifecycleStage` | - | `task *structs.Task` | `lifecycleStage` | [L413](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L413) |

## 5. 核心方法详解

### NewCoordinator()

**签名**：`func NewCoordinator(logger hclog.Logger, tasks []*structs.Task, shutdownCh <-chan struct{...}) *Coordinator`

**位置**：[L100](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L100)

**中文说明**：创建并返回一个新的 Coordinator 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `tasks` | `[]*structs.Task` | 列表 |
| `shutdownCh` | `<-chan struct{...}` | 关闭信号通道，当收到关闭信号时触发清理流程 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Coordinator` | — |

### Restore()

**签名**：`func (c *Coordinator) Restore(states map[string]*structs.TaskState) `

**位置**：[L126](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L126)

**中文说明**：从快照恢复对象的状态。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `states` | `map[string]*structs.TaskState` | 映射表 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [coordinator_test.go](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator_test.go) | 对应测试文件 |
| [doc.go](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/doc.go) | 同目录源文件 |
| [gate.go](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/gate.go) | 同目录源文件 |
| [testing.go](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/testing.go) | 同目录源文件 |

