# secrets_hook.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/secrets_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets_hook.go)
> 总行数：237 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### TemplateProvider

**定义位置**：[L26](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets_hook.go#L26)

**类型**：interface

```go
	BuildTemplate
```

### PluginProvider

**定义位置**：[L30](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets_hook.go#L30)

**类型**：interface

```go
	Fetch
```

### secretsHookConfig

**定义位置**：[L34](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets_hook.go#L34)

**类型**：struct

```go
	logger log.Logger
	lifecycle ti.TaskLifecycle
	events ti.EventEmitter
	clientConfig *config.Config
	envBuilder *taskenv.Builder
	nomadNamespace string
	jobId string
```

### secretsHook

**定义位置**：[L57](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets_hook.go#L57)

**类型**：struct

```go
	logger log.Logger
	lifecycle ti.TaskLifecycle
	events ti.EventEmitter
	clientConfig *config.Config
	envBuilder *taskenv.Builder
	nomadNamespace string
	jobId string
	secrets []*structs.Secret
```

**关联方法**（4 个）：`Name`, `Prestart`, `buildSecretProviders`, `setupPluginEnv`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newSecretsHook` | - | `conf *secretsHookConfig, secrets []*structs.Secret` | `*secretsHook` | [L83](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets_hook.go#L83) |
| `Name` | `h *secretsHook` | - | `string` | [L96](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets_hook.go#L96) |
| `Prestart` | `h *secretsHook` | `ctx context.Context, req *interfaces.TaskPrestartRequest, resp *interfaces.T...` | `error` | [L100](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets_hook.go#L100) |
| `buildSecretProviders` | `h *secretsHook` | `secretDir string` | `[]TemplateProvider, []PluginProvider, error` | [L187](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets_hook.go#L187) |
| `setupPluginEnv` | `h *secretsHook` | `env map[string]string` | `map[string]string` | [L226](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets_hook.go#L226) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/secrets` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/template` | 内部包 |
| `github.com/hashicorp/nomad/client/commonplugins` | 内部包 |
| `github.com/hashicorp/nomad/client/config` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/consul-template/renderer` | 第三方库 |
| `github.com/hashicorp/go-envparse` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [secrets_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets_hook_test.go) | 对应测试文件 |

