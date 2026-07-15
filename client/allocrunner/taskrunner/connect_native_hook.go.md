# connect_native_hook.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/connect_native_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go)
> 总行数：287 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### connectNativeHookConfig

**定义位置**：[L24](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L24)

**中文说明**：connectNativeHookConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type connectNativeHookConfig struct {
	consulShareTLS bool
	consul consulTransportConfig
	alloc *structs.Allocation
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `consulShareTLS` | `bool` | 布尔值 |
| `consul` | `consulTransportConfig` | — |
| `alloc` | `*structs.Allocation` | — |
| `logger` | `hclog.Logger` | 日志记录器 |

### connectNativeHook

**定义位置**：[L53](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L53)

**中文说明**：connectNativeHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：struct

```go
type connectNativeHook struct {
	alloc *structs.Allocation
	consulShareTLS bool
	consulConfig consulTransportConfig
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `alloc` | `*structs.Allocation` | — |
| `consulShareTLS` | `bool` | 布尔值 |
| `consulConfig` | `consulTransportConfig` | — |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（8 个）：`Name`, `Prestart`, `copyCertificates`, `copyCertificate`, `tlsEnv`, `bridgeEnv`, `hostEnv`, `maybeSetSITokenEnv`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `connectNativeHookName` | `—` | `"connect_native"` | — |
| `secretCAFilename` | `—` | `"consul_ca_file.pem"` | — |
| `secretCertfileFilename` | `—` | `"consul_cert_file.pem"` | — |
| `secretKeyfileFilename` | `—` | `"consul_key_file.pem"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newConnectNativeHookConfig` | - | `alloc *structs.Allocation, consul *config.ConsulConfig, logger hclog.Logger` | `*connectNativeHookConfig` | [L31](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L31) |
| `newConnectNativeHook` | - | `c *connectNativeHookConfig` | `*connectNativeHook` | [L70](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L70) |
| `Name` | ` *connectNativeHook` | `` | `string` | [L79](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L79) |
| `merge` | - | `a map[string]string, b map[string]string` | `` | [L84](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L84) |
| `Prestart` | `h *connectNativeHook` | `ctx context.Context, request *ifs.TaskPrestartRequest, response *ifs.TaskPres...` | `error` | [L90](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L90) |
| `copyCertificates` | `h *connectNativeHook` | `consulConfig consulTransportConfig, dir string` | `error` | [L134](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L134) |
| `copyCertificate` | ` *connectNativeHook` | `source string, dir string, name string` | `error` | [L147](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L147) |
| `tlsEnv` | `h *connectNativeHook` | `env map[string]string` | `map[string]string` | [L182](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L182) |
| `bridgeEnv` | `h *connectNativeHook` | `env map[string]string` | `map[string]string` | [L218](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L218) |
| `hostEnv` | `h *connectNativeHook` | `env map[string]string` | `map[string]string` | [L244](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L244) |
| `maybeSetSITokenEnv` | `h *connectNativeHook` | `dir string, task string, env map[string]string` | `error` | [L267](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook.go#L267) |

## 5. 核心方法详解

该文件无导出的核心方法。

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

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [connect_native_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/connect_native_hook_test.go) | 对应测试文件 |
| [api_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/api_hook.go) | 同目录源文件 |
| [artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | 同目录源文件 |
| [consul_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/consul_hook.go) | 同目录源文件 |
| [device_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/device_hook.go) | 同目录源文件 |
| [dispatch_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/dispatch_hook.go) | 同目录源文件 |

