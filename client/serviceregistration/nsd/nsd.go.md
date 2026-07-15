# nsd.go 代码说明文档

> 文件路径：[client/serviceregistration/nsd/nsd.go](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go)
> 总行数：415 行
> 所属包：`nsd`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **服务注册子包**（`client/serviceregistration`），将任务暴露的服务注册到 Consul 或 Nomad 内置服务发现，支持健康检查和负载均衡。

## 2. 类型定义

### ServiceRegistrationHandler

**定义位置**：[L22](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L22)

**中文说明**：ServiceRegistrationHandler 是一个处理器，处理特定类型的事件或请求。

**类型**：struct

```go
type ServiceRegistrationHandler struct {
	log hclog.Logger
	cfg *ServiceRegistrationHandlerCfg
	checkWatcher serviceregistration.CheckWatcher
	registrationEnabled bool
	nodeAuthToken atomic.Value
	shutDownCh chan struct{...}
	backoffMax time.Duration
	backoffInitial time.Duration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `log` | `hclog.Logger` | 日志记录器 |
| `cfg` | `*ServiceRegistrationHandlerCfg` | 配置 |
| `checkWatcher` | `serviceregistration.CheckWatcher` | — |
| `registrationEnabled` | `bool` | 布尔值 |
| `nodeAuthToken` | `atomic.Value` | 原子类型，支持并发安全读写 |
| `shutDownCh` | `chan struct{...}` | 关闭信号通道，当收到关闭信号时触发清理流程 |
| `backoffMax` | `time.Duration` | 时间间隔 |
| `backoffInitial` | `time.Duration` | 时间间隔 |

**关联方法**（11 个）：`SetNodeIdentityToken`, `RegisterWorkload`, `RemoveWorkload`, `removeWorkload`, `UpdateWorkload`, `dedupUpdatedWorkload`, `AllocRegistrations`, `UpdateTTL`, `Shutdown`, `generateNomadServiceRegistration`, `authToken`

### ServiceRegistrationHandlerCfg

**定义位置**：[L53](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L53)

**中文说明**：ServiceRegistrationHandlerCfg 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ServiceRegistrationHandlerCfg struct {
	Enabled bool
	Datacenter string
	NodeID string
	Region string
	NodeSecret string
	RPCFn func(...)
	CheckWatcher serviceregistration.CheckWatcher
	BackoffMax time.Duration
	BackoffInitial time.Duration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Enabled` | `bool` | 是否启用 |
| `Datacenter` | `string` | 数据中心 |
| `NodeID` | `string` | 字符串 |
| `Region` | `string` | 区域 |
| `NodeSecret` | `string` | 字符串 |
| `RPCFn` | `func(...)` | — |
| `CheckWatcher` | `serviceregistration.CheckWatcher` | — |
| `BackoffMax` | `time.Duration` | 时间间隔 |
| `BackoffInitial` | `time.Duration` | 时间间隔 |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewServiceRegistrationHandler` | - | `log hclog.Logger, cfg *ServiceRegistrationHandlerCfg` | `serviceregistration.Handler` | [L90](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L90) |
| `SetNodeIdentityToken` | `s *ServiceRegistrationHandler` | `token string` | `` | [L114](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L114) |
| `RegisterWorkload` | `s *ServiceRegistrationHandler` | `workload *serviceregistration.WorkloadServices` | `error` | [L116](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L116) |
| `RemoveWorkload` | `s *ServiceRegistrationHandler` | `workload *serviceregistration.WorkloadServices` | `` | [L177](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L177) |
| `removeWorkload` | `s *ServiceRegistrationHandler` | `wg *sync.WaitGroup, workload *serviceregistration.WorkloadServices, serviceSp...` | `` | [L189](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L189) |
| `UpdateWorkload` | `s *ServiceRegistrationHandler` | `old *serviceregistration.WorkloadServices, new *serviceregistration.WorkloadS...` | `error` | [L261](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L261) |
| `dedupUpdatedWorkload` | `s *ServiceRegistrationHandler` | `oldWork *serviceregistration.WorkloadServices, newWork *serviceregistration.W...` | `*serviceregistration.WorkloadServices, *serviceregistrati...` | [L287](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L287) |
| `AllocRegistrations` | `s *ServiceRegistrationHandler` | `_ string` | `*serviceregistration.AllocRegistration, error` | [L345](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L345) |
| `UpdateTTL` | `s *ServiceRegistrationHandler` | `_ string, _ string, _ string, _ string` | `error` | [L351](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L351) |
| `Shutdown` | `s *ServiceRegistrationHandler` | `` | `` | [L358](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L358) |
| `generateNomadServiceRegistration` | `s *ServiceRegistrationHandler` | `serviceSpec *structs.Service, workload *serviceregistration.WorkloadServices` | `*structs.ServiceRegistration, error` | [L362](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L362) |
| `authToken` | `s *ServiceRegistrationHandler` | `` | `string` | [L409](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L409) |

## 5. 核心方法详解

### NewServiceRegistrationHandler()

**签名**：`func NewServiceRegistrationHandler(log hclog.Logger, cfg *ServiceRegistrationHandlerCfg) serviceregistration.Handler`

**位置**：[L90](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L90)

**中文说明**：创建并返回一个新的 ServiceRegistrationHandler 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `log` | `hclog.Logger` | 日志记录器 |
| `cfg` | `*ServiceRegistrationHandlerCfg` | 配置 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `serviceregistration.Handler` | — |

### Shutdown()

**签名**：`func (s *ServiceRegistrationHandler) Shutdown() `

**位置**：[L358](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L358)

**中文说明**：关闭对象，释放相关资源。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `oss.indeed.com/go/libtime/decay` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `sync/atomic` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/serviceregistration` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [nsd_test.go](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd_test.go) | 对应测试文件 |
| [doc.go](file:///d:/claude/nomad/client/serviceregistration/nsd/doc.go) | 同目录源文件 |
| [statuses.go](file:///d:/claude/nomad/client/serviceregistration/nsd/statuses.go) | 同目录源文件 |

