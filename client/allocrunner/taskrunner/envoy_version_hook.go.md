# envoy_version_hook.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/envoy_version_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook.go)
> 总行数：200 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### envoyVersionHookConfig

**定义位置**：[L26](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook.go#L26)

**类型**：struct

```go
	alloc *structs.Allocation
	proxiesClientFunc consul.SupportedProxiesAPIFunc
	logger hclog.Logger
```

### envoyVersionHook

**定义位置**：[L44](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook.go#L44)

**类型**：struct

```go
	alloc *structs.Allocation
	proxiesClientFunc consul.SupportedProxiesAPIFunc
	logger hclog.Logger
```

**关联方法**（7 个）：`Name`, `Prestart`, `interpolateImage`, `skip`, `taskImage`, `needsVersion`, `tweakImage`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `envoyVersionHookName` | `"envoy_version"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newEnvoyVersionHookConfig` | - | `alloc *structs.Allocation, proxiesClientFunc consul.SupportedProxiesAPIFunc,...` | `*envoyVersionHookConfig` | [L32](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook.go#L32) |
| `newEnvoyVersionHook` | - | `c *envoyVersionHookConfig` | `*envoyVersionHook` | [L56](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook.go#L56) |
| `Name` | `_ *envoyVersionHook` | - | `string` | [L64](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook.go#L64) |
| `Prestart` | `h *envoyVersionHook` | `_ context.Context, request *ifs.TaskPrestartRequest, _ *ifs.TaskPrestartResp...` | `error` | [L68](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook.go#L68) |
| `interpolateImage` | `_ *envoyVersionHook` | `task *structs.Task, env *taskenv.TaskEnv` | - | [L110](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook.go#L110) |
| `skip` | `h *envoyVersionHook` | `request *ifs.TaskPrestartRequest` | `bool` | [L126](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook.go#L126) |
| `taskImage` | `h *envoyVersionHook` | `config map[string]interface{}` | `string` | [L140](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook.go#L140) |
| `needsVersion` | `h *envoyVersionHook` | `config map[string]interface{}` | `bool` | [L157](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook.go#L157) |
| `tweakImage` | `h *envoyVersionHook` | `configured string, supported map[string][]string` | `string, error` | [L173](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook.go#L173) |
| `semver` | - | `chosen string` | `string, error` | [L193](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook.go#L193) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/consul` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/helper/envoy` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-version` | 第三方库 |

## 7. 设计模式与技术特点

- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [envoy_version_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_version_hook_test.go) | 对应测试文件 |

