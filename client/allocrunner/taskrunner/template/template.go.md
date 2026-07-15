# template.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/template/template.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go)
> 总行数：1092 行
> 所属包：`template`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **模板渲染子包**（`client/allocrunner/taskrunner/template`），实现 Consul-Template 风格的配置模板渲染。

## 2. 类型定义

### TaskTemplateManager

**定义位置**：[L55](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L55)

**类型**：struct

```go
	config *TaskTemplateManagerConfig
	lookup map[string][]*structs.Template
	runner *manager.Runner
	signals map[string]os.Signal
	shutdownCh chan struct{...}
	firstRenderScripts []*structs.ChangeScript
	shutdown bool
	shutdownLock sync.Mutex
```

**关联方法**（13 个）：`Stop`, `Run`, `Templates`, `handleFirstRender`, `handleTemplateRerenders`, `onTemplateRendered`, `handleChangeModeSignal`, `handleChangeModeScript`, `handleScriptError`, `processScript`, `allTemplatesNoop`, `collectFirstRenderScripts`, `RunFirstRenderScripts`

### TaskTemplateManagerConfig

**定义位置**：[L83](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L83)

**类型**：struct

```go
	UnblockCh chan struct{...}
	Lifecycle interfaces.TaskLifecycle
	Events interfaces.EventEmitter
	Templates []*structs.Template
	ClientConfig *config.Config
	ConsulNamespace string
	ConsulToken string
	ConsulConfig *structsc.ConsulConfig
	VaultToken string
	VaultConfig *structsc.VaultConfig
	VaultNamespace string
	TaskDir string
	EnvBuilder *taskenv.Builder
	MaxTemplateEventRate time.Duration
	NomadNamespace string
	NomadToken string
	TaskID string
	Logger hclog.Logger
	RenderFunc renderer.Renderer
```

**关联方法**（2 个）：`Validate`, `OnceModeEnabled`

### sandboxConfig

**定义位置**：[L1053](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L1053)

**类型**：struct

```go
	thisBin string
	sandboxPath string
	destPath string
	sourcePath string
	perms string
	user string
	group string
	taskID string
	contents []byte
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `consulTemplateSourceName` | `"Template"` |
| `missingDepEventLimit` | `3` |
| `DefaultMaxTemplateEventRate` | `3 * time.Second` |

### 变量

| 名称 | 值 |
|------|----|
| `sourceEscapesErr` | `errors.New("template source path escapes alloc directory")` |
| `destEscapesErr` | `errors.New("template destination path escapes alloc direc...` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Validate` | `c *TaskTemplateManagerConfig` | - | `error` | [L149](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L149) |
| `OnceModeEnabled` | `c *TaskTemplateManagerConfig` | - | `bool` | [L182](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L182) |
| `NewTaskTemplateManager` | - | `config *TaskTemplateManagerConfig` | `*TaskTemplateManager, error` | [L186](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L186) |
| `Stop` | `tm *TaskTemplateManager` | - | - | [L227](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L227) |
| `Run` | `tm *TaskTemplateManager` | - | - | [L245](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L245) |
| `Templates` | `tm *TaskTemplateManager` | - | `[]*structs.Template` | [L293](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L293) |
| `handleFirstRender` | `tm *TaskTemplateManager` | - | - | [L298](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L298) |
| `handleTemplateRerenders` | `tm *TaskTemplateManager` | `allRenderedTime time.Time` | - | [L435](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L435) |
| `onTemplateRendered` | `tm *TaskTemplateManager` | `handledRenders map[string]time.Time, allRenderedTime time.Time, events map[s...` | - | [L464](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L464) |
| `handleChangeModeSignal` | `tm *TaskTemplateManager` | `signals map[string]struct{...}` | - | [L561](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L561) |
| `handleChangeModeScript` | `tm *TaskTemplateManager` | `scripts []*structs.ChangeScript` | - | [L595](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L595) |
| `handleScriptError` | `tm *TaskTemplateManager` | `script *structs.ChangeScript, msg string` | - | [L607](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L607) |
| `processScript` | `tm *TaskTemplateManager` | `script *structs.ChangeScript, wg *sync.WaitGroup` | - | [L620](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L620) |
| `allTemplatesNoop` | `tm *TaskTemplateManager` | - | `bool` | [L655](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L655) |
| `collectFirstRenderScripts` | `tm *TaskTemplateManager` | - | `[]*structs.ChangeScript` | [L667](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L667) |
| `RunFirstRenderScripts` | `tm *TaskTemplateManager` | - | - | [L682](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L682) |
| `templateRunner` | - | `config *TaskTemplateManagerConfig` | `*manager.Runner, map[string][]*structs.Template, error` | [L700](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L700) |
| `maskProcessEnv` | - | `env map[string]string` | `map[string]string` | [L747](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L747) |
| `parseTemplateConfigs` | - | `config *TaskTemplateManagerConfig` | `map[*ctconf.TemplateConfig]*structs.Template, error` | [L761](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L761) |
| `newRunnerConfig` | - | `config *TaskTemplateManagerConfig, templateMapping map[*ctconf.TemplateConfi...` | `*ctconf.Config, error` | [L835](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L835) |
| `isSandboxEnabled` | - | `cfg *TaskTemplateManagerConfig` | `bool` | [L1046](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L1046) |
| `loadTemplateEnv` | - | `tmpls []*structs.Template, taskEnv *taskenv.TaskEnv` | `map[string]string, error` | [L1066](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L1066) |

## 5. 核心方法详解

### Validate()

**签名**：`func (c *TaskTemplateManagerConfig) Validate() error`

**位置**：[L149](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L149)

### Stop()

**签名**：`func (tm *TaskTemplateManager) Stop() `

**位置**：[L227](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L227)

### Run()

**签名**：`func (tm *TaskTemplateManager) Run() `

**位置**：[L245](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L245)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `math/rand` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/errors` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/config` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs/config` | 内部包 |
| `github.com/hashicorp/consul-template/config` | 第三方库 |
| `github.com/hashicorp/consul-template/manager` | 第三方库 |
| `github.com/hashicorp/consul-template/renderer` | 第三方库 |
| `github.com/hashicorp/consul-template/signals` | 第三方库 |
| `github.com/hashicorp/go-envparse` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [template_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template_test.go) | 对应测试文件 |

