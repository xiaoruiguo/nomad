# consul_grpc_sock_hook.go 代码说明文档

> 文件路径：[client/allocrunner/consul_grpc_sock_hook.go](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go)
> 总行数：447 行
> 所属包：`allocrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### consulGRPCSocketHook

**定义位置**：[L50](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L50)

**中文说明**：consulGRPCSocketHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：struct

```go
type consulGRPCSocketHook struct {
	logger hclog.Logger
	mu sync.Mutex
	alloc *structs.Allocation
	proxies map[string]*grpcSocketProxy
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `mu` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `alloc` | `*structs.Allocation` | — |
| `proxies` | `map[string]*grpcSocketProxy` | 映射表 |

**关联方法**（5 个）：`Name`, `shouldRun`, `Prerun`, `Update`, `Postrun`

### grpcSocketProxy

**定义位置**：[L190](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L190)

**中文说明**：grpcSocketProxy 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type grpcSocketProxy struct {
	logger hclog.Logger
	allocDir allocdir.Interface
	config *config.ConsulConfig
	consulGRPCFallbackPort string
	ctx context.Context
	cancel func(...)
	doneCh chan struct{...}
	runOnce bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `allocDir` | `allocdir.Interface` | — |
| `config` | `*config.ConsulConfig` | 配置 |
| `consulGRPCFallbackPort` | `string` | 字符串 |
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `cancel` | `func(...)` | 取消 |
| `doneCh` | `chan struct{...}` | 信号通道 |
| `runOnce` | `bool` | 布尔值 |

**关联方法**（2 个）：`run`, `stop`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `consulGRPCSockHookName` | `—` | `"consul_grpc_socket"` | — |
| `socketProxyStopWaitTime` | `—` | `3 * time.Second` | — |
| `consulGRPCFallbackPort` | `—` | `"8502"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `errSocketProxyTimeout` | `—` | `errors.New("timed out waiting for socket proxy to exit")` | — |
| `_` | `interfaces.RunnerPrerunHook` | `(*consulGRPCSocketHook)(nil)` | — |
| `_` | `interfaces.RunnerUpdateHook` | `(*consulGRPCSocketHook)(nil)` | — |
| `_` | `interfaces.RunnerPostrunHook` | `(*consulGRPCSocketHook)(nil)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newConsulGRPCSocketHook` | - | `logger hclog.Logger, alloc *structs.Allocation, allocDir allocdir.Interface, ...` | `*consulGRPCSocketHook` | [L60](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L60) |
| `Name` | ` *consulGRPCSocketHook` | `` | `string` | [L111](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L111) |
| `shouldRun` | `h *consulGRPCSocketHook` | `` | `bool` | [L117](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L117) |
| `Prerun` | `h *consulGRPCSocketHook` | `_ *taskenv.TaskEnv` | `error` | [L134](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L134) |
| `Update` | `h *consulGRPCSocketHook` | `req *interfaces.RunnerUpdateRequest` | `error` | [L153](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L153) |
| `Postrun` | `h *consulGRPCSocketHook` | `` | `error` | [L175](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L175) |
| `newGRPCSocketProxy` | - | `logger hclog.Logger, allocDir allocdir.Interface, config *config.ConsulConfig...` | `*grpcSocketProxy` | [L205](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L205) |
| `run` | `p *grpcSocketProxy` | `` | `error` | [L228](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L228) |
| `stop` | `p *grpcSocketProxy` | `` | `error` | [L314](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L314) |
| `proxy` | - | `ctx context.Context, logger hclog.Logger, destAddr string, l net.Listener` | `` | [L331](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L331) |
| `proxyConn` | - | `ctx context.Context, logger hclog.Logger, destAddr string, conn net.Conn` | `` | [L374](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L374) |

## 5. 核心方法详解

### Update()

**签名**：`func (h *consulGRPCSocketHook) Update(req *interfaces.RunnerUpdateRequest) error`

**位置**：[L153](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go#L153)

**中文说明**：更新指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `req` | `*interfaces.RunnerUpdateRequest` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocdir` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs/config` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-secure-stdlib/listenerutil` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **后台协程**：启动 goroutine 执行后台任务

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [consul_grpc_sock_hook_test.go](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook_test.go) | 对应测试文件 |
| [alloc_runner.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go) | 同目录源文件 |
| [alloc_runner_ce.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_ce.go) | 同目录源文件 |
| [alloc_runner_hooks.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_hooks.go) | 同目录源文件 |
| [allocdir_hook.go](file:///d:/claude/nomad/client/allocrunner/allocdir_hook.go) | 同目录源文件 |
| [checks_hook.go](file:///d:/claude/nomad/client/allocrunner/checks_hook.go) | 同目录源文件 |

