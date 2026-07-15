# nsd.go 代码说明文档

> 文件路径：[serviceregistration/nsd/nsd.go](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go)
> 总行数：415 行
> 所属包：`nsd`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad 服务发现子包**（`client/serviceregistration/nsd`），实现 Nomad 内置的服务发现机制。

## 2. 类型定义

### ServiceRegistrationHandler

**定义位置**：[L22](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L22)

**类型**：struct

```go
	log hclog.Logger
	cfg *ServiceRegistrationHandlerCfg
	checkWatcher serviceregistration.CheckWatcher
	registrationEnabled bool
	nodeAuthToken atomic.Value
	shutDownCh chan struct{...}
	backoffMax time.Duration
	backoffInitial time.Duration
```

**关联方法**（11 个）：`SetNodeIdentityToken`, `RegisterWorkload`, `RemoveWorkload`, `removeWorkload`, `UpdateWorkload`, `dedupUpdatedWorkload`, `AllocRegistrations`, `UpdateTTL`, `Shutdown`, `generateNomadServiceRegistration`, `authToken`

### ServiceRegistrationHandlerCfg

**定义位置**：[L53](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L53)

**类型**：struct

```go
	Enabled bool
	Datacenter string
	NodeID string
	Region string
	NodeSecret string
	RPCFn func(...)
	CheckWatcher serviceregistration.CheckWatcher
	BackoffMax time.Duration
	BackoffInitial time.Duration
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewServiceRegistrationHandler` | - | `log hclog.Logger, cfg *ServiceRegistrationHandlerCfg` | `serviceregistration.Handler` | [L90](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L90) |
| `SetNodeIdentityToken` | `s *ServiceRegistrationHandler` | `token string` | - | [L114](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L114) |
| `RegisterWorkload` | `s *ServiceRegistrationHandler` | `workload *serviceregistration.WorkloadServices` | `error` | [L116](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L116) |
| `RemoveWorkload` | `s *ServiceRegistrationHandler` | `workload *serviceregistration.WorkloadServices` | - | [L177](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L177) |
| `removeWorkload` | `s *ServiceRegistrationHandler` | `wg *sync.WaitGroup, workload *serviceregistration.WorkloadServices, serviceS...` | - | [L189](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L189) |
| `UpdateWorkload` | `s *ServiceRegistrationHandler` | `old *serviceregistration.WorkloadServices, new *serviceregistration.Workload...` | `error` | [L261](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L261) |
| `dedupUpdatedWorkload` | `s *ServiceRegistrationHandler` | `oldWork *serviceregistration.WorkloadServices, newWork *serviceregistration....` | `*serviceregistration.WorkloadServices, *serviceregistrat...` | [L287](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L287) |
| `AllocRegistrations` | `s *ServiceRegistrationHandler` | `_ string` | `*serviceregistration.AllocRegistration, error` | [L345](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L345) |
| `UpdateTTL` | `s *ServiceRegistrationHandler` | `_ string, _ string, _ string, _ string` | `error` | [L351](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L351) |
| `Shutdown` | `s *ServiceRegistrationHandler` | - | - | [L358](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L358) |
| `generateNomadServiceRegistration` | `s *ServiceRegistrationHandler` | `serviceSpec *structs.Service, workload *serviceregistration.WorkloadServices` | `*structs.ServiceRegistration, error` | [L362](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L362) |
| `authToken` | `s *ServiceRegistrationHandler` | - | `string` | [L409](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L409) |

## 5. 核心方法详解

### Shutdown()

**签名**：`func (s *ServiceRegistrationHandler) Shutdown() `

**位置**：[L358](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd.go#L358)

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
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [nsd_test.go](file:///d:/claude/nomad/client/serviceregistration/nsd/nsd_test.go) | 对应测试文件 |

