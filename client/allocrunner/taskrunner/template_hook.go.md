# template_hook.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/template_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go)
> 总行数：334 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### templateHookConfig

**定义位置**：[L25](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L25)

**中文说明**：templateHookConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type templateHookConfig struct {
	alloc *structs.Allocation
	logger log.Logger
	lifecycle ti.TaskLifecycle
	events ti.EventEmitter
	templates []*structs.Template
	clientConfig *config.Config
	envBuilder *taskenv.Builder
	consulNamespace string
	nomadNamespace string
	renderOnTaskRestart bool
	hookResources *cstructs.AllocHookResources
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `alloc` | `*structs.Allocation` | 分配 |
| `logger` | `log.Logger` | 日志记录器 |
| `lifecycle` | `ti.TaskLifecycle` | — |
| `events` | `ti.EventEmitter` | — |
| `templates` | `[]*structs.Template` | 列表 |
| `clientConfig` | `*config.Config` | 配置对象 |
| `envBuilder` | `*taskenv.Builder` | — |
| `consulNamespace` | `string` | 字符串 |
| `nomadNamespace` | `string` | 字符串 |
| `renderOnTaskRestart` | `bool` | 布尔值 |
| `hookResources` | `*cstructs.AllocHookResources` | — |

### templateHook

**定义位置**：[L60](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L60)

**中文说明**：templateHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：struct

```go
type templateHook struct {
	config *templateHookConfig
	logger log.Logger
	templateManager *template.TaskTemplateManager
	managerLock sync.Mutex
	consulNamespace string
	vaultToken string
	vaultNamespace string
	nomadToken string
	consulToken string
	task *structs.Task
	taskDir string
	taskID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `config` | `*templateHookConfig` | 配置 |
| `logger` | `log.Logger` | 日志记录器 |
| `templateManager` | `*template.TaskTemplateManager` | — |
| `managerLock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `consulNamespace` | `string` | 字符串 |
| `vaultToken` | `string` | 字符串 |
| `vaultNamespace` | `string` | 字符串 |
| `nomadToken` | `string` | 字符串 |
| `consulToken` | `string` | 字符串 |
| `task` | `*structs.Task` | — |
| `taskDir` | `string` | 字符串 |
| `taskID` | `string` | 字符串 |

**关联方法**（7 个）：`Name`, `Prestart`, `newManager`, `Poststart`, `Stop`, `Update`, `renderTemplates`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `templateHookName` | `—` | `"template"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newTemplateHook` | - | `config *templateHookConfig` | `*templateHook` | [L97](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L97) |
| `Name` | ` *templateHook` | `` | `string` | [L105](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L105) |
| `Prestart` | `h *templateHook` | `ctx context.Context, req *interfaces.TaskPrestartRequest, resp *interfaces.Ta...` | `error` | [L109](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L109) |
| `newManager` | `h *templateHook` | `tmpls []*structs.Template` | `manager *template.TaskTemplateManager, unblock chan struc...` | [L200](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L200) |
| `Poststart` | `h *templateHook` | `_ context.Context, _ *interfaces.TaskPoststartRequest, _ *interfaces.TaskPost...` | `error` | [L242](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L242) |
| `Stop` | `h *templateHook` | `_ context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskStop...` | `error` | [L252](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L252) |
| `Update` | `h *templateHook` | `ctx context.Context, req *interfaces.TaskUpdateRequest, resp *interfaces.Task...` | `error` | [L265](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L265) |
| `renderTemplates` | `h *templateHook` | `ctx context.Context, once []*structs.Template, watch []*structs.Template` | `error` | [L303](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L303) |

## 5. 核心方法详解

### Stop()

**签名**：`func (h *templateHook) Stop(_ context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskStopResponse) error`

**位置**：[L252](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L252)

**中文说明**：停止对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `_` | `context.Context` | 上下文，用于控制生命周期和取消 |
| `req` | `*interfaces.TaskStopRequest` | — |
| `resp` | `*interfaces.TaskStopResponse` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Update()

**签名**：`func (h *templateHook) Update(ctx context.Context, req *interfaces.TaskUpdateRequest, resp *interfaces.TaskUpdateResponse) error`

**位置**：[L265](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L265)

**中文说明**：更新指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `req` | `*interfaces.TaskUpdateRequest` | — |
| `resp` | `*interfaces.TaskUpdateResponse` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/template` | 内部包 |
| `github.com/hashicorp/nomad/client/config` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [template_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook_test.go) | 对应测试文件 |
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go) | 同目录源文件 |
| [consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |

