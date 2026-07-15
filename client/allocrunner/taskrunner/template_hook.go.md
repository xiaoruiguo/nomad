# template_hook.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/template_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go)
> 总行数：334 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### templateHookConfig

**定义位置**：[L25](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L25)

**类型**：struct

```go
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
```

### templateHook

**定义位置**：[L60](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L60)

**类型**：struct

```go
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
```

**关联方法**（7 个）：`Name`, `Prestart`, `newManager`, `Poststart`, `Stop`, `Update`, `renderTemplates`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `templateHookName` | `"template"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newTemplateHook` | - | `config *templateHookConfig` | `*templateHook` | [L97](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L97) |
| `Name` | ` *templateHook` | - | `string` | [L105](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L105) |
| `Prestart` | `h *templateHook` | `ctx context.Context, req *interfaces.TaskPrestartRequest, resp *interfaces.T...` | `error` | [L109](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L109) |
| `newManager` | `h *templateHook` | `tmpls []*structs.Template` | `manager *template.TaskTemplateManager, unblock chan stru...` | [L200](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L200) |
| `Poststart` | `h *templateHook` | `_ context.Context, _ *interfaces.TaskPoststartRequest, _ *interfaces.TaskPos...` | `error` | [L242](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L242) |
| `Stop` | `h *templateHook` | `_ context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskSto...` | `error` | [L252](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L252) |
| `Update` | `h *templateHook` | `ctx context.Context, req *interfaces.TaskUpdateRequest, resp *interfaces.Tas...` | `error` | [L265](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L265) |
| `renderTemplates` | `h *templateHook` | `ctx context.Context, once []*structs.Template, watch []*structs.Template` | `error` | [L303](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L303) |

## 5. 核心方法详解

### Stop()

**签名**：`func (h *templateHook) Stop(_ context.Context, req *interfaces.TaskStopRequest, resp *interfaces.TaskStopResponse) error`

**位置**：[L252](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L252)

### Update()

**签名**：`func (h *templateHook) Update(ctx context.Context, req *interfaces.TaskUpdateRequest, resp *interfaces.TaskUpdateResponse) error`

**位置**：[L265](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook.go#L265)

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

- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [template_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/template_hook_test.go) | 对应测试文件 |

