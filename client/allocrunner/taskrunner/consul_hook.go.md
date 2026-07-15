# consul_hook.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go)
> 总行数：92 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### consulHook

**定义位置**：[L31](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go#L31)

**中文说明**：consulHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：struct

```go
type consulHook struct {
	task *structs.Task
	tokenDir string
	hookResources *cstructs.AllocHookResources
	logger log.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `task` | `*structs.Task` | — |
| `tokenDir` | `string` | 字符串 |
| `hookResources` | `*cstructs.AllocHookResources` | — |
| `logger` | `log.Logger` | 日志记录器 |

**关联方法**（2 个）：`Name`, `Prestart`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `consulTokenFilename` | `—` | `"consul_token"` | — |
| `consulTokenFilePerms` | `—` | `0640` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newConsulHook` | - | `logger log.Logger, tr *TaskRunner` | `*consulHook` | [L39](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go#L39) |
| `Name` | ` *consulHook` | `` | `string` | [L49](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go#L49) |
| `Prestart` | `h *consulHook` | `ctx context.Context, req *interfaces.TaskPrestartRequest, resp *interfaces.Ta...` | `error` | [L53](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go#L53) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `slices` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [consul_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook_test.go) | 对应测试文件 |
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |
| [dispatch_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/dispatch_hook.go) | 同目录源文件 |

