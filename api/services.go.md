# services.go 代码说明文档

> 文件路径：[api/services.go](file:///d:/claude/nomad/api/services.go)
> 总行数：360 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `services.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### ServiceRegistration

**定义位置**：[L17](file:///d:/claude/nomad/api/services.go#L17)

**中文说明**：ServiceRegistration 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ServiceRegistration struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `ServiceName` | `string` | 字符串 |
| `Namespace` | `string` | 命名空间 表示 命名空间 within 哪个 此 服务 is 已注册的. |
| `NodeID` | `string` | 字符串 |
| `Datacenter` | `string` | 数据中心 |
| `JobID` | `string` | 字符串 |
| `AllocID` | `string` | 字符串 |
| `Tags` | `[]string` | 标签 |
| `Address` | `string` | 地址 |
| `Port` | `int` | 端口 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### ServiceRegistrationListStub

**定义位置**：[L68](file:///d:/claude/nomad/api/services.go#L68)

**中文说明**：ServiceRegistrationListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type ServiceRegistrationListStub struct {
	Namespace string
	Services []*ServiceRegistrationStub
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string` | 命名空间 |
| `Services` | `[]*ServiceRegistrationStub` | 列表 |

### ServiceRegistrationStub

**定义位置**：[L81](file:///d:/claude/nomad/api/services.go#L81)

**中文说明**：ServiceRegistrationStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type ServiceRegistrationStub struct {
	ServiceName string
	Tags []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ServiceName` | `string` | 字符串 |
| `Tags` | `[]string` | 标签 |

### Services

**定义位置**：[L93](file:///d:/claude/nomad/api/services.go#L93)

**中文说明**：Services 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Services struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（3 个）：`List`, `Get`, `Delete`

### CheckRestart

**定义位置**：[L137](file:///d:/claude/nomad/api/services.go#L137)

**中文说明**：CheckRestart 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type CheckRestart struct {
	Limit int `mapstructure:"limit" hcl:"limit,optional"`
	Grace *time.Duration `mapstructure:"grace" hcl:"grace,optional"`
	IgnoreWarnings bool `mapstructure:"ignore_warnings" hcl:"ignore_warnings,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Limit` | `int `mapstructure:"limit" hcl:"limit,optional"`` | 限制 |
| `Grace` | `*time.Duration `mapstructure:"grace" hcl:"grace,optional"`` | 时间间隔 |
| `IgnoreWarnings` | `bool `mapstructure:"ignore_warnings" hcl:"ignore_warnings,optional"`` | 布尔值 |

**关联方法**（3 个）：`Canonicalize`, `Copy`, `Merge`

### ServiceCheck

**定义位置**：[L201](file:///d:/claude/nomad/api/services.go#L201)

**中文说明**：ServiceCheck 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ServiceCheck struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:"name,optional"`` | 名称 |
| `Type` | `string `hcl:"type,optional"`` | 类型 |
| `Command` | `string `hcl:"command,optional"`` | 字符串 |
| `Args` | `[]string `hcl:"args,optional"`` | 参数 |
| `Path` | `string `hcl:"path,optional"`` | 路径 |
| `Protocol` | `string `hcl:"protocol,optional"`` | 字符串 |
| `PortLabel` | `string `mapstructure:"port" hcl:"port,optional"`` | 字符串 |
| `Expose` | `bool `hcl:"expose,optional"`` | 布尔值 |
| `AddressMode` | `string `mapstructure:"address_mode" hcl:"address_mode,optional"`` | 字符串 |
| `Advertise` | `string `hcl:"advertise,optional"`` | 字符串 |
| `Interval` | `time.Duration `hcl:"interval,optional"`` | 时间间隔 |
| `Timeout` | `time.Duration `hcl:"timeout,optional"`` | 超时时间 |
| `InitialStatus` | `string `mapstructure:"initial_status" hcl:"initial_status,optional"`` | 字符串 |
| `Notes` | `string `hcl:"notes,optional"`` | 字符串 |
| `TLSServerName` | `string `mapstructure:"tls_server_name" hcl:"tls_server_name,optional"`` | 字符串 |
| `TLSSkipVerify` | `bool `mapstructure:"tls_skip_verify" hcl:"tls_skip_verify,optional"`` | 布尔值 |
| `Header` | `map[string][]string `hcl:"header,block"`` | 映射表 |
| `Method` | `string `hcl:"method,optional"`` | 字符串 |
| `CheckRestart` | `*CheckRestart `mapstructure:"check_restart" hcl:"check_restart,block"`` | — |
| `GRPCService` | `string `mapstructure:"grpc_service" hcl:"grpc_service,optional"`` | 字符串 |
| `GRPCUseTLS` | `bool `mapstructure:"grpc_use_tls" hcl:"grpc_use_tls,optional"`` | 布尔值 |
| `TaskName` | `string `mapstructure:"task" hcl:"task,optional"`` | 字符串 |
| `SuccessBeforePassing` | `int `mapstructure:"success_before_passing" hcl:"success_before_passing,optional"`` | — |
| `FailuresBeforeCritical` | `int `mapstructure:"failures_before_critical" hcl:"failures_before_critical,optional"`` | — |
| `FailuresBeforeWarning` | `int `mapstructure:"failures_before_warning" hcl:"failures_before_warning,optional"`` | — |
| `Body` | `string `hcl:"body,optional"`` | 字符串 |
| `OnUpdate` | `string `mapstructure:"on_update" hcl:"on_update,optional"`` | 字符串 |

### Service

**定义位置**：[L232](file:///d:/claude/nomad/api/services.go#L232)

**中文说明**：Service 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Service struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:"name,optional"`` | 名称 |
| `Tags` | `[]string `hcl:"tags,optional"`` | 标签 |
| `CanaryTags` | `[]string `mapstructure:"canary_tags" hcl:"canary_tags,optional"`` | 列表 |
| `EnableTagOverride` | `bool `mapstructure:"enable_tag_override" hcl:"enable_tag_override,optional"`` | 布尔值 |
| `PortLabel` | `string `mapstructure:"port" hcl:"port,optional"`` | 字符串 |
| `AddressMode` | `string `mapstructure:"address_mode" hcl:"address_mode,optional"`` | 字符串 |
| `Address` | `string `hcl:"address,optional"`` | 地址 |
| `Checks` | `[]ServiceCheck `hcl:"check,block"`` | 列表 |
| `CheckRestart` | `*CheckRestart `mapstructure:"check_restart" hcl:"check_restart,block"`` | — |
| `Connect` | `*ConsulConnect `hcl:"connect,block"`` | — |
| `Meta` | `map[string]string `hcl:"meta,block"`` | 元数据 |
| `CanaryMeta` | `map[string]string `hcl:"canary_meta,block"`` | 映射表 |
| `TaggedAddresses` | `map[string]string `hcl:"tagged_addresses,block"`` | 映射表 |
| `TaskName` | `string `mapstructure:"task" hcl:"task,optional"`` | 字符串 |
| `OnUpdate` | `string `mapstructure:"on_update" hcl:"on_update,optional"`` | 字符串 |
| `Identity` | `*WorkloadIdentity `hcl:"identity,block"`` | — |
| `Weights` | `*ServiceWeights `mapstructure:"weights" hcl:"weights,block"`` | — |
| `Provider` | `string `hcl:"provider,optional"`` | 字符串 |
| `Cluster` | `string `hcl:"cluster,optional"`` | 字符串 |
| `Kind` | `string `hcl:"kind,optional"`` | 种类 |

**关联方法**（1 个）：`Canonicalize`

### ServiceWeights

**定义位置**：[L343](file:///d:/claude/nomad/api/services.go#L343)

**中文说明**：ServiceWeights 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ServiceWeights struct {
	Passing int `hcl:"passing,optional"`
	Warning int `hcl:"warning,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Passing` | `int `hcl:"passing,optional"`` | — |
| `Warning` | `int `hcl:"warning,optional"`` | 警告 |

**关联方法**（1 个）：`Canonicalize`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `OnUpdateRequireHealthy` | `—` | `"require_healthy"` | — |
| `OnUpdateIgnoreWarn` | `—` | `"ignore_warnings"` | — |
| `OnUpdateIgnore` | `—` | `"ignore"` | — |
| `ServiceProviderConsul` | `—` | `"consul"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Services` | `c *Client` | `` | `*Services` | [L98](file:///d:/claude/nomad/api/services.go#L98) |
| `List` | `s *Services` | `q *QueryOptions` | `[]*ServiceRegistrationListStub, *QueryMeta, error` | [L104](file:///d:/claude/nomad/api/services.go#L104) |
| `Get` | `s *Services` | `serviceName string, q *QueryOptions` | `[]*ServiceRegistration, *QueryMeta, error` | [L115](file:///d:/claude/nomad/api/services.go#L115) |
| `Delete` | `s *Services` | `serviceName string, serviceID string, q *WriteOptions` | `*WriteMeta, error` | [L126](file:///d:/claude/nomad/api/services.go#L126) |
| `Canonicalize` | `c *CheckRestart` | `` | `` | [L144](file:///d:/claude/nomad/api/services.go#L144) |
| `Copy` | `c *CheckRestart` | `` | `*CheckRestart` | [L155](file:///d:/claude/nomad/api/services.go#L155) |
| `Merge` | `c *CheckRestart` | `o *CheckRestart` | `*CheckRestart` | [L172](file:///d:/claude/nomad/api/services.go#L172) |
| `Canonicalize` | `s *Service` | `t *Task, tg *TaskGroup, job *Job` | `` | [L274](file:///d:/claude/nomad/api/services.go#L274) |
| `Canonicalize` | `weights *ServiceWeights` | `` | `` | [L348](file:///d:/claude/nomad/api/services.go#L348) |

## 5. 核心方法详解

### List()

**签名**：`func (s *Services) List(q *QueryOptions) []*ServiceRegistrationListStub, *QueryMeta, error`

**位置**：[L104](file:///d:/claude/nomad/api/services.go#L104)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*ServiceRegistrationListStub` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Get()

**签名**：`func (s *Services) Get(serviceName string, q *QueryOptions) []*ServiceRegistration, *QueryMeta, error`

**位置**：[L115](file:///d:/claude/nomad/api/services.go#L115)

**中文说明**：获取对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `serviceName` | `string` | 字符串 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*ServiceRegistration` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (s *Services) Delete(serviceName string, serviceID string, q *WriteOptions) *WriteMeta, error`

**位置**：[L126](file:///d:/claude/nomad/api/services.go#L126)

**中文说明**：删除指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `serviceName` | `string` | 字符串 |
| `serviceID` | `string` | 字符串 |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Copy()

**签名**：`func (c *CheckRestart) Copy() *CheckRestart`

**位置**：[L155](file:///d:/claude/nomad/api/services.go#L155)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*CheckRestart` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `net/url` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [services_test.go](file:///d:/claude/nomad/api/services_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

