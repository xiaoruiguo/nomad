# services.go 代码说明文档

> 文件路径：[services.go](file:///d:/claude/nomad/api/services.go)
> 总行数：360 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **服务注册（Service Registration）API 客户端**，提供服务注册查询和管理的客户端方法。

## 2. 类型定义

### ServiceRegistration

**定义位置**：[L17](file:///d:/claude/nomad/api/services.go#L17)

**类型**：struct

```go
	ID string
	ServiceName string
	Namespace string
	NodeID string
	Datacenter string
	JobID string
	AllocID string
	Tags []string
	Address string
	Port int
	CreateIndex uint64
	ModifyIndex uint64
```

### ServiceRegistrationListStub

**定义位置**：[L68](file:///d:/claude/nomad/api/services.go#L68)

**类型**：struct

```go
	Namespace string
	Services []*ServiceRegistrationStub
```

### ServiceRegistrationStub

**定义位置**：[L81](file:///d:/claude/nomad/api/services.go#L81)

**类型**：struct

```go
	ServiceName string
	Tags []string
```

### Services

**定义位置**：[L93](file:///d:/claude/nomad/api/services.go#L93)

**类型**：struct

```go
	client *Client
```

**关联方法**（3 个）：`List`, `Get`, `Delete`

### CheckRestart

**定义位置**：[L137](file:///d:/claude/nomad/api/services.go#L137)

**类型**：struct

```go
	Limit int `mapstructure:"limit" hcl:"limit,optional"`
	Grace *time.Duration `mapstructure:"grace" hcl:"grace,optional"`
	IgnoreWarnings bool `mapstructure:"ignore_warnings" hcl:"ignore_warnings,optional"`
```

**关联方法**（3 个）：`Canonicalize`, `Copy`, `Merge`

### ServiceCheck

**定义位置**：[L201](file:///d:/claude/nomad/api/services.go#L201)

**类型**：struct

```go
	Name string `hcl:"name,optional"`
	Type string `hcl:"type,optional"`
	Command string `hcl:"command,optional"`
	Args []string `hcl:"args,optional"`
	Path string `hcl:"path,optional"`
	Protocol string `hcl:"protocol,optional"`
	PortLabel string `mapstructure:"port" hcl:"port,optional"`
	Expose bool `hcl:"expose,optional"`
	AddressMode string `mapstructure:"address_mode" hcl:"address_mode,optional"`
	Advertise string `hcl:"advertise,optional"`
	Interval time.Duration `hcl:"interval,optional"`
	Timeout time.Duration `hcl:"timeout,optional"`
	InitialStatus string `mapstructure:"initial_status" hcl:"initial_status,optional"`
	Notes string `hcl:"notes,optional"`
	TLSServerName string `mapstructure:"tls_server_name" hcl:"tls_server_name,optional"`
	TLSSkipVerify bool `mapstructure:"tls_skip_verify" hcl:"tls_skip_verify,optional"`
	Header map[string][]string `hcl:"header,block"`
	Method string `hcl:"method,optional"`
	CheckRestart *CheckRestart `mapstructure:"check_restart" hcl:"check_restart,block"`
	GRPCService string `mapstructure:"grpc_service" hcl:"grpc_service,optional"`
	GRPCUseTLS bool `mapstructure:"grpc_use_tls" hcl:"grpc_use_tls,optional"`
	TaskName string `mapstructure:"task" hcl:"task,optional"`
	SuccessBeforePassing int `mapstructure:"success_before_passing" hcl:"success_before_passing,optional"`
	FailuresBeforeCritical int `mapstructure:"failures_before_critical" hcl:"failures_before_critical,optional"`
	FailuresBeforeWarning int `mapstructure:"failures_before_warning" hcl:"failures_before_warning,optional"`
	Body string `hcl:"body,optional"`
	OnUpdate string `mapstructure:"on_update" hcl:"on_update,optional"`
```

### Service

**定义位置**：[L232](file:///d:/claude/nomad/api/services.go#L232)

**类型**：struct

```go
	Name string `hcl:"name,optional"`
	Tags []string `hcl:"tags,optional"`
	CanaryTags []string `mapstructure:"canary_tags" hcl:"canary_tags,optional"`
	EnableTagOverride bool `mapstructure:"enable_tag_override" hcl:"enable_tag_override,optional"`
	PortLabel string `mapstructure:"port" hcl:"port,optional"`
	AddressMode string `mapstructure:"address_mode" hcl:"address_mode,optional"`
	Address string `hcl:"address,optional"`
	Checks []ServiceCheck `hcl:"check,block"`
	CheckRestart *CheckRestart `mapstructure:"check_restart" hcl:"check_restart,block"`
	Connect *ConsulConnect `hcl:"connect,block"`
	Meta map[string]string `hcl:"meta,block"`
	CanaryMeta map[string]string `hcl:"canary_meta,block"`
	TaggedAddresses map[string]string `hcl:"tagged_addresses,block"`
	TaskName string `mapstructure:"task" hcl:"task,optional"`
	OnUpdate string `mapstructure:"on_update" hcl:"on_update,optional"`
	Identity *WorkloadIdentity `hcl:"identity,block"`
	Weights *ServiceWeights `mapstructure:"weights" hcl:"weights,block"`
	Provider string `hcl:"provider,optional"`
	Cluster string `hcl:"cluster,optional"`
	Kind string `hcl:"kind,optional"`
```

**关联方法**（1 个）：`Canonicalize`

### ServiceWeights

**定义位置**：[L343](file:///d:/claude/nomad/api/services.go#L343)

**类型**：struct

```go
	Passing int `hcl:"passing,optional"`
	Warning int `hcl:"warning,optional"`
```

**关联方法**（1 个）：`Canonicalize`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `OnUpdateRequireHealthy` | `"require_healthy"` |
| `OnUpdateIgnoreWarn` | `"ignore_warnings"` |
| `OnUpdateIgnore` | `"ignore"` |
| `ServiceProviderConsul` | `"consul"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Services` | `c *Client` | - | `*Services` | [L98](file:///d:/claude/nomad/api/services.go#L98) |
| `List` | `s *Services` | `q *QueryOptions` | `[]*ServiceRegistrationListStub, *QueryMeta, error` | [L104](file:///d:/claude/nomad/api/services.go#L104) |
| `Get` | `s *Services` | `serviceName string, q *QueryOptions` | `[]*ServiceRegistration, *QueryMeta, error` | [L115](file:///d:/claude/nomad/api/services.go#L115) |
| `Delete` | `s *Services` | `serviceName string, serviceID string, q *WriteOptions` | `*WriteMeta, error` | [L126](file:///d:/claude/nomad/api/services.go#L126) |
| `Canonicalize` | `c *CheckRestart` | - | - | [L144](file:///d:/claude/nomad/api/services.go#L144) |
| `Copy` | `c *CheckRestart` | - | `*CheckRestart` | [L155](file:///d:/claude/nomad/api/services.go#L155) |
| `Merge` | `c *CheckRestart` | `o *CheckRestart` | `*CheckRestart` | [L172](file:///d:/claude/nomad/api/services.go#L172) |
| `Canonicalize` | `s *Service` | `t *Task, tg *TaskGroup, job *Job` | - | [L274](file:///d:/claude/nomad/api/services.go#L274) |
| `Canonicalize` | `weights *ServiceWeights` | - | - | [L348](file:///d:/claude/nomad/api/services.go#L348) |

## 5. 核心方法详解

### List()

**签名**：`func (s *Services) List(q *QueryOptions) []*ServiceRegistrationListStub, *QueryMeta, error`

**位置**：[L104](file:///d:/claude/nomad/api/services.go#L104)

### Get()

**签名**：`func (s *Services) Get(serviceName string, q *QueryOptions) []*ServiceRegistration, *QueryMeta, error`

**位置**：[L115](file:///d:/claude/nomad/api/services.go#L115)

### Delete()

**签名**：`func (s *Services) Delete(serviceName string, serviceID string, q *WriteOptions) *WriteMeta, error`

**位置**：[L126](file:///d:/claude/nomad/api/services.go#L126)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `net/url` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [services_test.go](file:///d:/claude/nomad/api/services_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

