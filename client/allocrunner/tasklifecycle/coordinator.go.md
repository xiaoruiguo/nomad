# coordinator.go 代码说明文档

> 文件路径：[allocrunner/tasklifecycle/coordinator.go](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go)
> 总行数：431 行
> 所属包：`tasklifecycle`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务生命周期子包**（`client/allocrunner/tasklifecycle`），管理任务的状态转换（pending→running→dead 等）和生命周期事件。

## 2. 类型定义

### coordinatorState

**定义位置**：[L15](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L15)

**类型定义**：`uint8`

**关联方法**（1 个）：`String`

### lifecycleStage

**定义位置**：[L51](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L51)

**类型定义**：`uint8`

### Coordinator

**定义位置**：[L83](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L83)

**类型**：struct

```go
	logger hclog.Logger
	tasksByLifecycle map[lifecycleStage][]string
	currentState coordinatorState
	currentStateLock sync.RWMutex
	gates map[lifecycleStage]*Gate
```

**关联方法**（17 个）：`Restart`, `Restore`, `StartConditionForTask`, `TaskStateUpdated`, `nextStateLocked`, `enterStateLocked`, `isInitDone`, `isPrestartDone`, `isMainDone`, `isPoststartDone`, `isAllocDone`, `hasPrestart`, `hasMain`, `hasPoststart`, `hasPoststop`, `block`, `allow`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `coordinatorStateInit` | `iota` |
| `coordinatorStatePrestart` | `` |
| `coordinatorStateMain` | `` |
| `coordinatorStatePoststart` | `` |
| `coordinatorStateWaitAlloc` | `` |
| `coordinatorStatePoststop` | `` |
| `lifecycleStagePrestartEphemeral` | `iota` |
| `lifecycleStagePrestartSidecar` | `` |
| `lifecycleStageMain` | `` |
| `lifecycleStagePoststartEphemeral` | `` |
| `lifecycleStagePoststartSidecar` | `` |
| `lifecycleStagePoststop` | `` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `String` | `s *coordinatorState` | - | `string` | [L26](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L26) |
| `NewCoordinator` | - | `logger hclog.Logger, tasks []*structs.Task, shutdownCh chan struct{...}` | `*Coordinator` | [L100](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L100) |
| `Restart` | `c *Coordinator` | - | - | [L118](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L118) |
| `Restore` | `c *Coordinator` | `states map[string]*structs.TaskState` | - | [L126](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L126) |
| `StartConditionForTask` | `c *Coordinator` | `task *structs.Task` | `chan struct{...}` | [L136](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L136) |
| `TaskStateUpdated` | `c *Coordinator` | `states map[string]*structs.TaskState` | - | [L143](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L143) |
| `nextStateLocked` | `c *Coordinator` | `states map[string]*structs.TaskState` | `coordinatorState` | [L165](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L165) |
| `enterStateLocked` | `c *Coordinator` | `state coordinatorState` | - | [L216](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L216) |
| `isInitDone` | `c *Coordinator` | `states map[string]*structs.TaskState` | `bool` | [L279](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L279) |
| `isPrestartDone` | `c *Coordinator` | `states map[string]*structs.TaskState` | `bool` | [L293](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L293) |
| `isMainDone` | `c *Coordinator` | `states map[string]*structs.TaskState` | `bool` | [L314](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L314) |
| `isPoststartDone` | `c *Coordinator` | `states map[string]*structs.TaskState` | `bool` | [L330](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L330) |
| `isAllocDone` | `c *Coordinator` | `states map[string]*structs.TaskState` | `bool` | [L345](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L345) |
| `hasPrestart` | `c *Coordinator` | - | `bool` | [L360](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L360) |
| `hasMain` | `c *Coordinator` | - | `bool` | [L365](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L365) |
| `hasPoststart` | `c *Coordinator` | - | `bool` | [L369](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L369) |
| `hasPoststop` | `c *Coordinator` | - | `bool` | [L374](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L374) |
| `block` | `c *Coordinator` | `lifecycle lifecycleStage` | - | [L379](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L379) |
| `allow` | `c *Coordinator` | `lifecycle lifecycleStage` | - | [L387](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L387) |
| `indexTasksByLifecycle` | - | `tasks []*structs.Task` | `map[lifecycleStage][]string` | [L397](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L397) |
| `taskLifecycleStage` | - | `task *structs.Task` | `lifecycleStage` | [L413](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L413) |

## 5. 核心方法详解

### Restart()

**签名**：`func (c *Coordinator) Restart() `

**位置**：[L118](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator.go#L118)

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
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [coordinator_test.go](file:///d:/claude/nomad/client/allocrunner/tasklifecycle/coordinator_test.go) | 对应测试文件 |

