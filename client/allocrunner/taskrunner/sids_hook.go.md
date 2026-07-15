# sids_hook.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/sids_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/sids_hook.go)
> 总行数：130 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### sidsHookConfig

**定义位置**：[L31](file:///d:/claude/nomad/client/allocrunner/taskrunner/sids_hook.go#L31)

**类型**：struct

```go
	alloc *structs.Allocation
	task *structs.Task
	lifecycle ti.TaskLifecycle
	logger hclog.Logger
	allocHookResources *cstructs.AllocHookResources
```

### sidsHook

**定义位置**：[L40](file:///d:/claude/nomad/client/allocrunner/taskrunner/sids_hook.go#L40)

**类型**：struct

```go
	alloc *structs.Allocation
	task *structs.Task
	lifecycle ti.TaskLifecycle
	logger hclog.Logger
	lock sync.Mutex
	firstRun bool
	allocHookResources *cstructs.AllocHookResources
```

**关联方法**（3 个）：`Name`, `Prestart`, `writeToken`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `sidsHookName` | `"consul_si_token"` |
| `sidsTokenFile` | `"si_token"` |
| `sidsTokenFilePerms` | `0440` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newSIDSHook` | - | `c sidsHookConfig` | `*sidsHook` | [L64](file:///d:/claude/nomad/client/allocrunner/taskrunner/sids_hook.go#L64) |
| `Name` | `h *sidsHook` | - | `string` | [L75](file:///d:/claude/nomad/client/allocrunner/taskrunner/sids_hook.go#L75) |
| `Prestart` | `h *sidsHook` | `ctx context.Context, req *interfaces.TaskPrestartRequest, resp *interfaces.T...` | `error` | [L79](file:///d:/claude/nomad/client/allocrunner/taskrunner/sids_hook.go#L79) |
| `writeToken` | `h *sidsHook` | `dir string, token string` | `error` | [L116](file:///d:/claude/nomad/client/allocrunner/taskrunner/sids_hook.go#L116) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `os` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [sids_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/sids_hook_test.go) | 对应测试文件 |

