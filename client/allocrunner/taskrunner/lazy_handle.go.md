# lazy_handle.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/lazy_handle.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/lazy_handle.go)
> 总行数：156 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### retrieveHandleFn

**定义位置**：[L32](file:///d:/claude/nomad/client/allocrunner/taskrunner/lazy_handle.go#L32)

**类型定义**：`func(...)`

### LazyHandle

**定义位置**：[L39](file:///d:/claude/nomad/client/allocrunner/taskrunner/lazy_handle.go#L39)

**类型**：struct

```go
	retrieveHandle retrieveHandleFn
	h *DriverHandle
	shutdownCtx context.Context
	logger log.Logger
	sync.Mutex
```

**关联方法**（5 个）：`getHandle`, `refreshHandle`, `refreshHandleLocked`, `Exec`, `Stats`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `retrieveBackoffBaseline` | `250 * time.Millisecond` |
| `retrieveBackoffLimit` | `5 * time.Second` |
| `retrieveFailureLimit` | `5` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewLazyHandle` | - | `shutdownCtx context.Context, fn retrieveHandleFn, logger log.Logger` | `*LazyHandle` | [L55](file:///d:/claude/nomad/client/allocrunner/taskrunner/lazy_handle.go#L55) |
| `getHandle` | `l *LazyHandle` | - | `*DriverHandle, error` | [L65](file:///d:/claude/nomad/client/allocrunner/taskrunner/lazy_handle.go#L65) |
| `refreshHandle` | `l *LazyHandle` | - | `*DriverHandle, error` | [L77](file:///d:/claude/nomad/client/allocrunner/taskrunner/lazy_handle.go#L77) |
| `refreshHandleLocked` | `l *LazyHandle` | - | `*DriverHandle, error` | [L86](file:///d:/claude/nomad/client/allocrunner/taskrunner/lazy_handle.go#L86) |
| `Exec` | `l *LazyHandle` | `timeout time.Duration, cmd string, args []string` | `[]byte, int, error` | [L111](file:///d:/claude/nomad/client/allocrunner/taskrunner/lazy_handle.go#L111) |
| `Stats` | `l *LazyHandle` | `ctx context.Context, interval time.Duration` | `chan *cstructs.TaskResourceUsage, error` | [L134](file:///d:/claude/nomad/client/allocrunner/taskrunner/lazy_handle.go#L134) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|

