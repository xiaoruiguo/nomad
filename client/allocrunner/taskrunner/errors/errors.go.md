# errors.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/errors/errors.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/errors/errors.go)
> 总行数：37 行
> 所属包：`errors`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器错误子包**（`client/allocrunner/taskrunner/errors`），定义任务运行相关的错误类型。

## 2. 类型定义

### HookError

**定义位置**：[L24](file:///d:/claude/nomad/client/allocrunner/taskrunner/errors/errors.go#L24)

**类型**：struct

```go
	TaskEvent *structs.TaskEvent
	Err error
```

**关联方法**（2 个）：`Error`, `IsRecoverable`

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `ErrTaskNotRunning` | `errors.New("Task not running")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewHookError` | - | `err error, taskEvent *structs.TaskEvent` | `error` | [L17](file:///d:/claude/nomad/client/allocrunner/taskrunner/errors/errors.go#L17) |
| `Error` | `h *HookError` | - | `string` | [L29](file:///d:/claude/nomad/client/allocrunner/taskrunner/errors/errors.go#L29) |
| `IsRecoverable` | `h *HookError` | - | `bool` | [L34](file:///d:/claude/nomad/client/allocrunner/taskrunner/errors/errors.go#L34) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [errors_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/errors/errors_test.go) | 对应测试文件 |

