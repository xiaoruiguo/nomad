# connect_native_hook.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go)
> 总行数：287 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### connectNativeHookConfig

**定义位置**：[L24](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L24)

**类型**：struct

```go
	consulShareTLS bool
	consul consulTransportConfig
	alloc *structs.Allocation
	logger hclog.Logger
```

### connectNativeHook

**定义位置**：[L53](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L53)

**类型**：struct

```go
	alloc *structs.Allocation
	consulShareTLS bool
	consulConfig consulTransportConfig
	logger hclog.Logger
```

**关联方法**（8 个）：`Name`, `Prestart`, `copyCertificates`, `copyCertificate`, `tlsEnv`, `bridgeEnv`, `hostEnv`, `maybeSetSITokenEnv`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `connectNativeHookName` | `"connect_native"` |
| `secretCAFilename` | `"consul_ca_file.pem"` |
| `secretCertfileFilename` | `"consul_cert_file.pem"` |
| `secretKeyfileFilename` | `"consul_key_file.pem"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newConnectNativeHookConfig` | - | `alloc *structs.Allocation, consul *config.ConsulConfig, logger hclog.Logger` | `*connectNativeHookConfig` | [L31](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L31) |
| `newConnectNativeHook` | - | `c *connectNativeHookConfig` | `*connectNativeHook` | [L70](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L70) |
| `Name` | ` *connectNativeHook` | - | `string` | [L79](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L79) |
| `merge` | - | `a map[string]string, b map[string]string` | - | [L84](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L84) |
| `Prestart` | `h *connectNativeHook` | `ctx context.Context, request *ifs.TaskPrestartRequest, response *ifs.TaskPre...` | `error` | [L90](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L90) |
| `copyCertificates` | `h *connectNativeHook` | `consulConfig consulTransportConfig, dir string` | `error` | [L134](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L134) |
| `copyCertificate` | ` *connectNativeHook` | `source string, dir string, name string` | `error` | [L147](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L147) |
| `tlsEnv` | `h *connectNativeHook` | `env map[string]string` | `map[string]string` | [L182](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L182) |
| `bridgeEnv` | `h *connectNativeHook` | `env map[string]string` | `map[string]string` | [L218](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L218) |
| `hostEnv` | `h *connectNativeHook` | `env map[string]string` | `map[string]string` | [L244](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L244) |
| `maybeSetSITokenEnv` | `h *connectNativeHook` | `dir string, task string, env map[string]string` | `error` | [L267](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L267) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `github.com/hashicorp/nomad/client/allocdir` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs/config` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [connect_native_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook_test.go) | 对应测试文件 |

