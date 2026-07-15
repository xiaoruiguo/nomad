# workload_id.go 代码说明文档

> 文件路径：[nomad/structs/workload_id.go](file:///d:/claude/nomad/nomad/structs/workload_id.go)
> 总行数：597 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 19 个方法/函数。

## 2. 类型定义

### WorkloadIdentityClaims

**定义位置**：[L68](file:///d:/claude/nomad/nomad/structs/workload_id.go#L68)

**中文说明**：WorkloadIdentityClaims 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type WorkloadIdentityClaims struct {
	Namespace string `json:"nomad_namespace"`
	JobID string `json:"nomad_job_id"`
	AllocationID string `json:"nomad_allocation_id"`
	TaskName string `json:"nomad_task,omitempty"`
	ServiceName string `json:"nomad_service,omitempty"`
	ConsulNamespace string `json:"consul_namespace,omitempty"`
	VaultNamespace string `json:"vault_namespace,omitempty"`
	VaultRole string `json:"vault_role,omitempty"`
	ExtraClaims map[string]string `json:"extra_claims,omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string `json:"nomad_namespace"`` | 命名空间 |
| `JobID` | `string `json:"nomad_job_id"`` | 字符串 |
| `AllocationID` | `string `json:"nomad_allocation_id"`` | 字符串 |
| `TaskName` | `string `json:"nomad_task,omitempty"`` | 字符串 |
| `ServiceName` | `string `json:"nomad_service,omitempty"`` | 字符串 |
| `ConsulNamespace` | `string `json:"consul_namespace,omitempty"`` | 字符串 |
| `VaultNamespace` | `string `json:"vault_namespace,omitempty"`` | 字符串 |
| `VaultRole` | `string `json:"vault_role,omitempty"`` | 字符串 |
| `ExtraClaims` | `map[string]string `json:"extra_claims,omitempty"`` | 映射表 |

### WorkloadIdentityClaimsBuilder

**定义位置**：[L88](file:///d:/claude/nomad/nomad/structs/workload_id.go#L88)

**中文说明**：WorkloadIdentityClaimsBuilder 是一个构建器，用于分步构建复杂对象。

**类型**：struct

```go
type WorkloadIdentityClaimsBuilder struct {
	wid *WorkloadIdentity
	wihandle *WIHandle
	alloc *Allocation
	job *Job
	tg *TaskGroup
	task *Task
	serviceName string
	consul *Consul
	vault *Vault
	node *Node
	extras map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `wid` | `*WorkloadIdentity` | — |
| `wihandle` | `*WIHandle` | — |
| `alloc` | `*Allocation` | — |
| `job` | `*Job` | — |
| `tg` | `*TaskGroup` | — |
| `task` | `*Task` | — |
| `serviceName` | `string` | 字符串 |
| `consul` | `*Consul` | — |
| `vault` | `*Vault` | — |
| `node` | `*Node` | — |
| `extras` | `map[string]string` | 映射表 |

**关联方法**（8 个）：`WithTask`, `WithVault`, `WithConsul`, `WithService`, `WithNode`, `Build`, `interpolate`, `resolveDynamicToken`

### WorkloadIdentity

**定义位置**：[L304](file:///d:/claude/nomad/nomad/structs/workload_id.go#L304)

**中文说明**：WorkloadIdentity 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type WorkloadIdentity struct {
	Name string
	Audience []string
	ChangeMode string
	ChangeSignal string
	Env bool
	File bool
	Filepath string
	ServiceName string
	TTL time.Duration
	ExtraClaims []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Audience` | `[]string` | 列表 |
| `ChangeMode` | `string` | 字符串 |
| `ChangeSignal` | `string` | 字符串 |
| `Env` | `bool` | 布尔值 |
| `File` | `bool` | 布尔值 |
| `Filepath` | `string` | 字符串 |
| `ServiceName` | `string` | 字符串 |
| `TTL` | `time.Duration` | 生存时间（TTL） |
| `ExtraClaims` | `[]string` | 列表 |

**关联方法**（7 个）：`IsConsul`, `IsVault`, `Copy`, `Equal`, `Canonicalize`, `Validate`, `Warnings`

### WorkloadIdentityRequest

**定义位置**：[L532](file:///d:/claude/nomad/nomad/structs/workload_id.go#L532)

**中文说明**：WorkloadIdentityRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type WorkloadIdentityRequest struct {
	AllocID string
	WIHandle WIHandle
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `WIHandle` | `WIHandle` | — |

### SignedWorkloadIdentity

**定义位置**：[L539](file:///d:/claude/nomad/nomad/structs/workload_id.go#L539)

**中文说明**：SignedWorkloadIdentity 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type SignedWorkloadIdentity struct {
	WorkloadIdentityRequest WorkloadIdentityRequest
	JWT string
	Expiration time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WorkloadIdentityRequest` | `WorkloadIdentityRequest` | — |
| `JWT` | `string` | 字符串 |
| `Expiration` | `time.Time` | 时间点 |

### WorkloadIdentityRejection

**定义位置**：[L547](file:///d:/claude/nomad/nomad/structs/workload_id.go#L547)

**中文说明**：WorkloadIdentityRejection 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type WorkloadIdentityRejection struct {
	WorkloadIdentityRequest WorkloadIdentityRequest
	Reason string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WorkloadIdentityRequest` | `WorkloadIdentityRequest` | — |
| `Reason` | `string` | 字符串 |

### AllocIdentitiesRequest

**定义位置**：[L554](file:///d:/claude/nomad/nomad/structs/workload_id.go#L554)

**中文说明**：AllocIdentitiesRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocIdentitiesRequest struct {
	Identities []*WorkloadIdentityRequest
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Identities` | `[]*WorkloadIdentityRequest` | 列表 |
| `QueryOptions` | `QueryOptions` | — |

### AllocIdentitiesResponse

**定义位置**：[L561](file:///d:/claude/nomad/nomad/structs/workload_id.go#L561)

**中文说明**：AllocIdentitiesResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type AllocIdentitiesResponse struct {
	SignedIdentities []*SignedWorkloadIdentity
	Rejections []*WorkloadIdentityRejection
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SignedIdentities` | `[]*SignedWorkloadIdentity` | 列表 |
| `Rejections` | `[]*WorkloadIdentityRejection` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### WorkloadType

**定义位置**：[L567](file:///d:/claude/nomad/nomad/structs/workload_id.go#L567)

**类型定义**：`type WorkloadType int`

### WIHandle

**定义位置**：[L576](file:///d:/claude/nomad/nomad/structs/workload_id.go#L576)

**中文说明**：WIHandle 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type WIHandle struct {
	IdentityName string
	WorkloadIdentifier string
	WorkloadType WorkloadType
	InterpolatedWorkloadIdentifier string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `IdentityName` | `string` | 字符串 |
| `WorkloadIdentifier` | `string` | 字符串 |
| `WorkloadType` | `WorkloadType` | — |
| `InterpolatedWorkloadIdentifier` | `string` | 字符串 |

**关联方法**（1 个）：`Equal`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `WorkloadIdentityDefaultName` | `—` | `"default"` | — |
| `WorkloadIdentityVaultPrefix` | `—` | `"vault_"` | — |
| `WIRejectionReasonMissingAlloc` | `—` | `"allocation not found"` | — |
| `WIRejectionReasonMissingTask` | `—` | `"task not found"` | — |
| `WIRejectionReasonMissingIdentity` | `—` | `"identity not found"` | — |
| `WIChangeModeNoop` | `—` | `"noop"` | — |
| `WIChangeModeSignal` | `—` | `"signal"` | — |
| `WIChangeModeRestart` | `—` | `"restart"` | — |
| `WorkloadTypeTask` | `WorkloadType` | `iota` | — |
| `WorkloadTypeService` | `—` | `` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `validIdentityName` | `—` | `regexp.MustCompile("^[a-zA-Z0-9-_]{1,128}$")` | — |
| `wIClaimPattern` | `—` | `regexp.MustCompile(`\$\{([^}]+)\}`)` | — |
| `MinNomadVersionVaultWID` | `—` | `version.Must(version.NewVersion("1.7.0-a"))` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewIdentityClaimsBuilder` | - | `job *Job, alloc *Allocation, wihandle *WIHandle, wid *WorkloadIdentity, ns *N...` | `*WorkloadIdentityClaimsBuilder` | [L106](file:///d:/claude/nomad/nomad/structs/workload_id.go#L106) |
| `WithTask` | `b *WorkloadIdentityClaimsBuilder` | `task *Task` | `*WorkloadIdentityClaimsBuilder` | [L137](file:///d:/claude/nomad/nomad/structs/workload_id.go#L137) |
| `WithVault` | `b *WorkloadIdentityClaimsBuilder` | `extraClaims map[string]string` | `*WorkloadIdentityClaimsBuilder` | [L147](file:///d:/claude/nomad/nomad/structs/workload_id.go#L147) |
| `WithConsul` | `b *WorkloadIdentityClaimsBuilder` | `` | `*WorkloadIdentityClaimsBuilder` | [L160](file:///d:/claude/nomad/nomad/structs/workload_id.go#L160) |
| `WithService` | `b *WorkloadIdentityClaimsBuilder` | `service *Service` | `*WorkloadIdentityClaimsBuilder` | [L175](file:///d:/claude/nomad/nomad/structs/workload_id.go#L175) |
| `WithNode` | `b *WorkloadIdentityClaimsBuilder` | `node *Node` | `*WorkloadIdentityClaimsBuilder` | [L188](file:///d:/claude/nomad/nomad/structs/workload_id.go#L188) |
| `Build` | `b *WorkloadIdentityClaimsBuilder` | `now time.Time` | `*IdentityClaims` | [L197](file:///d:/claude/nomad/nomad/structs/workload_id.go#L197) |
| `strAttrGet` | - | `x *T, fn func(...)` | `string` | [L235](file:///d:/claude/nomad/nomad/structs/workload_id.go#L235) |
| `interpolate` | `b *WorkloadIdentityClaimsBuilder` | `` | `` | [L242](file:///d:/claude/nomad/nomad/structs/workload_id.go#L242) |
| `resolveDynamicToken` | `b *WorkloadIdentityClaimsBuilder` | `token string` | `string` | [L280](file:///d:/claude/nomad/nomad/structs/workload_id.go#L280) |
| `DefaultWorkloadIdentity` | - | `` | `*WorkloadIdentity` | [L342](file:///d:/claude/nomad/nomad/structs/workload_id.go#L342) |
| `IsConsul` | `wi *WorkloadIdentity` | `` | `bool` | [L351](file:///d:/claude/nomad/nomad/structs/workload_id.go#L351) |
| `IsVault` | `wi *WorkloadIdentity` | `` | `bool` | [L361](file:///d:/claude/nomad/nomad/structs/workload_id.go#L361) |
| `Copy` | `wi *WorkloadIdentity` | `` | `*WorkloadIdentity` | [L368](file:///d:/claude/nomad/nomad/structs/workload_id.go#L368) |
| `Equal` | `wi *WorkloadIdentity` | `other *WorkloadIdentity` | `bool` | [L386](file:///d:/claude/nomad/nomad/structs/workload_id.go#L386) |
| `Canonicalize` | `wi *WorkloadIdentity` | `` | `` | [L434](file:///d:/claude/nomad/nomad/structs/workload_id.go#L434) |
| `Validate` | `wi *WorkloadIdentity` | `` | `error` | [L453](file:///d:/claude/nomad/nomad/structs/workload_id.go#L453) |
| `Warnings` | `wi *WorkloadIdentity` | `` | `error` | [L502](file:///d:/claude/nomad/nomad/structs/workload_id.go#L502) |
| `Equal` | `w *WIHandle` | `o WIHandle` | `bool` | [L588](file:///d:/claude/nomad/nomad/structs/workload_id.go#L588) |

## 5. 核心方法详解

### NewIdentityClaimsBuilder()

**签名**：`func NewIdentityClaimsBuilder(job *Job, alloc *Allocation, wihandle *WIHandle, wid *WorkloadIdentity, ns *Namespace) *WorkloadIdentityClaimsBuilder`

**位置**：[L106](file:///d:/claude/nomad/nomad/structs/workload_id.go#L106)

**中文说明**：创建并返回一个新的 IdentityClaimsBuilder 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `job` | `*Job` | — |
| `alloc` | `*Allocation` | — |
| `wihandle` | `*WIHandle` | — |
| `wid` | `*WorkloadIdentity` | — |
| `ns` | `*Namespace` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WorkloadIdentityClaimsBuilder` | — |

### Build()

**签名**：`func (b *WorkloadIdentityClaimsBuilder) Build(now time.Time) *IdentityClaims`

**位置**：[L197](file:///d:/claude/nomad/nomad/structs/workload_id.go#L197)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `now` | `time.Time` | 时间点 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*IdentityClaims` | — |

### Copy()

**签名**：`func (wi *WorkloadIdentity) Copy() *WorkloadIdentity`

**位置**：[L368](file:///d:/claude/nomad/nomad/structs/workload_id.go#L368)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WorkloadIdentity` | — |

### Validate()

**签名**：`func (wi *WorkloadIdentity) Validate() error`

**位置**：[L453](file:///d:/claude/nomad/nomad/structs/workload_id.go#L453)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `regexp` | 标准库 |
| `slices` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/go-jose/go-jose/v3/jwt` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-version` | 第三方库 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [workload_id_test.go](file:///d:/claude/nomad/nomad/structs/workload_id_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

