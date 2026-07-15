# envoy_bootstrap_hook.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/envoy_bootstrap_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go)
> 总行数：701 行
> 所属包：`taskrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务运行器子包**（`client/allocrunner/taskrunner`），实现单个任务的运行生命周期管理，包括任务启动/停止、 artifact 下载、模板渲染、密钥注入、重启策略等。TaskRunner 是分配内每个任务的控制器。

## 2. 类型定义

### consulTransportConfig

**定义位置**：[L53](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L53)

**类型**：struct

```go
	HTTPAddr string
	Auth string
	SSL string
	VerifySSL string
	GRPCCAFile string
	CAFile string
	CertFile string
	KeyFile string
	Namespace string
```

### allocServicesClient

**定义位置**：[L80](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L80)

**类型**：interface

```go
	AllocRegistrations
```

### envoyBootstrapHookConfig

**定义位置**：[L84](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L84)

**类型**：struct

```go
	alloc *structs.Allocation
	consul consulTransportConfig
	consulNamespace string
	consulServices allocServicesClient
	consulFallbackToken string
	node *structs.Node
	logger hclog.Logger
```

### envoyBootstrapHook

**定义位置**：[L131](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L131)

**类型**：struct

```go
	alloc *structs.Allocation
	consulConfig consulTransportConfig
	consulNamespace string
	consulFallbackToken string
	envoyBootstrapWaitTime time.Duration
	envoyBootstrapInitialGap time.Duration
	envoyBootstrapMaxJitter time.Duration
	envoyBootstrapExpSleep libtime.Sleeper
	consulServices allocServicesClient
	logger hclog.Logger
```

**关联方法**（12 个）：`getConsulNamespace`, `Name`, `extractNameAndKind`, `lookupService`, `Prestart`, `groupEnv`, `writeConfig`, `grpcAddress`, `proxyServiceID`, `newEnvoyBootstrapArgs`, `maybeLoadSIToken`, `servicePreflightCheck`

### envoyBootstrapArgs

**定义位置**：[L561](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L561)

**类型**：struct

```go
	consulConfig consulTransportConfig
	grpcAddr string
	envoyAdminBind string
	envoyReadyBind string
	siToken string
	gateway string
	proxyID string
	namespace string
```

**关联方法**（2 个）：`args`, `env`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `envoyBootstrapHookName` | `"envoy_bootstrap"` |
| `envoyBootstrapWaitTime` | `60 * time.Second` |
| `envoyBootstrapInitialGap` | `1 * time.Second` |
| `envoyBootstrapMaxJitter` | `500 * time.Millisecond` |
| `envoyBaseAdminPort` | `19000` |
| `envoyBaseReadyPort` | `19100` |
| `envoyAdminBindEnvPrefix` | `"NOMAD_ENVOY_ADMIN_ADDR_"` |
| `envoyReadyBindEnvPrefix` | `"NOMAD_ENVOY_READY_ADDR_"` |
| `grpcConsulVariable` | `"CONSUL_GRPC_ADDR"` |
| `grpcDefaultAddress` | `"127.0.0.1:8502"` |

### 变量

| 名称 | 值 |
|------|----|
| `errEnvoyBootstrapError` | `errors.New("error creating bootstrap configuration for Co...` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newConsulTransportConfig` | - | `cc *config.ConsulConfig` | `consulTransportConfig` | [L66](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L66) |
| `decodeTriState` | - | `b *bool` | `string` | [L94](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L94) |
| `newEnvoyBootstrapHookConfig` | - | `alloc *structs.Allocation, consul *config.ConsulConfig, consulNamespace stri...` | `*envoyBootstrapHookConfig` | [L105](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L105) |
| `newEnvoyBootstrapHook` | - | `c *envoyBootstrapHookConfig` | `*envoyBootstrapHook` | [L168](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L168) |
| `getConsulNamespace` | `h *envoyBootstrapHook` | - | `string` | [L192](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L192) |
| `Name` | ` *envoyBootstrapHook` | - | `string` | [L203](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L203) |
| `isConnectKind` | - | `kind string` | `bool` | [L207](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L207) |
| `extractNameAndKind` | `_ *envoyBootstrapHook` | `kind structs.TaskKind` | `string, string, error` | [L222](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L222) |
| `lookupService` | `h *envoyBootstrapHook` | `svcKind string, svcName string, taskEnv *taskenv.TaskEnv` | `*structs.Service, error` | [L237](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L237) |
| `Prestart` | `h *envoyBootstrapHook` | `ctx context.Context, req *ifs.TaskPrestartRequest, resp *ifs.TaskPrestartRes...` | `error` | [L263](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L263) |
| `groupEnv` | `h *envoyBootstrapHook` | - | `[]string` | [L424](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L424) |
| `buildEnvoyAdminBind` | - | `alloc *structs.Allocation, service string, task string, env *taskenv.TaskEnv` | `string` | [L440](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L440) |
| `buildEnvoyReadyBind` | - | `alloc *structs.Allocation, service string, task string, env *taskenv.TaskEnv` | `string` | [L447](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L447) |
| `buildEnvoyBind` | - | `alloc *structs.Allocation, ifce string, service string, task string, taskEnv...` | `string` | [L459](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L459) |
| `writeConfig` | `h *envoyBootstrapHook` | `filename string, config string` | `error` | [L483](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L483) |
| `grpcAddress` | `h *envoyBootstrapHook` | `env map[string]string` | `string` | [L496](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L496) |
| `proxyServiceID` | `h *envoyBootstrapHook` | `group string, service *structs.Service` | `string` | [L510](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L510) |
| `newEnvoyBootstrapArgs` | `h *envoyBootstrapHook` | `service *structs.Service, grpcAddr string, envoyAdminBind string, envoyReady...` | `envoyBootstrapArgs` | [L521](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L521) |
| `args` | `e *envoyBootstrapArgs` | - | `[]string` | [L574](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L574) |
| `env` | `e *envoyBootstrapArgs` | `env []string` | `[]string` | [L609](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L609) |
| `maybeLoadSIToken` | `h *envoyBootstrapHook` | `task string, dir string` | `string, error` | [L629](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L629) |
| `servicePreflightCheck` | `h *envoyBootstrapHook` | `ctx context.Context, backoffOpts decay.BackoffOptions, proxyServiceID string` | `error` | [L644](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L644) |
| `durationFromMeta` | - | `node *structs.Node, key string, defaultDur time.Duration` | `time.Duration` | [L690](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook.go#L690) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `oss.indeed.com/go/libtime` | 标准库 |
| `oss.indeed.com/go/libtime/decay` | 标准库 |
| `path/filepath` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocdir` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs/config` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **钩子模式**：实现 AllocRunner/TaskRunner 的生命周期钩子接口，在分配/任务状态转换时执行自定义逻辑
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [envoy_bootstrap_hook_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/envoy_bootstrap_hook_test.go) | 对应测试文件 |

