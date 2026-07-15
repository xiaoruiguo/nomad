# workload_id.go 代码说明文档

> 文件路径：[structs/workload_id.go](file:///d:/claude/nomad/nomad/structs/workload_id.go)
> 总行数：597 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### WorkloadIdentityClaims

**定义位置**：[L68](file:///d:/claude/nomad/nomad/structs/workload_id.go#L68)

**类型**：struct

```go
	Namespace string `json:"nomad_namespace"`
	JobID string `json:"nomad_job_id"`
	AllocationID string `json:"nomad_allocation_id"`
	TaskName string `json:"nomad_task,omitempty"`
	ServiceName string `json:"nomad_service,omitempty"`
	ConsulNamespace string `json:"consul_namespace,omitempty"`
	VaultNamespace string `json:"vault_namespace,omitempty"`
	VaultRole string `json:"vault_role,omitempty"`
	ExtraClaims map[string]string `json:"extra_claims,omitempty"`
```

### WorkloadIdentityClaimsBuilder

**定义位置**：[L88](file:///d:/claude/nomad/nomad/structs/workload_id.go#L88)

**类型**：struct

```go
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
```

**关联方法**（8 个）：`WithTask`, `WithVault`, `WithConsul`, `WithService`, `WithNode`, `Build`, `interpolate`, `resolveDynamicToken`

### WorkloadIdentity

**定义位置**：[L304](file:///d:/claude/nomad/nomad/structs/workload_id.go#L304)

**类型**：struct

```go
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
```

**关联方法**（7 个）：`IsConsul`, `IsVault`, `Copy`, `Equal`, `Canonicalize`, `Validate`, `Warnings`

### WorkloadIdentityRequest

**定义位置**：[L532](file:///d:/claude/nomad/nomad/structs/workload_id.go#L532)

**类型**：struct

```go
	AllocID string
	WIHandle
```

### SignedWorkloadIdentity

**定义位置**：[L539](file:///d:/claude/nomad/nomad/structs/workload_id.go#L539)

**类型**：struct

```go
	WorkloadIdentityRequest
	JWT string
	Expiration time.Time
```

### WorkloadIdentityRejection

**定义位置**：[L547](file:///d:/claude/nomad/nomad/structs/workload_id.go#L547)

**类型**：struct

```go
	WorkloadIdentityRequest
	Reason string
```

### AllocIdentitiesRequest

**定义位置**：[L554](file:///d:/claude/nomad/nomad/structs/workload_id.go#L554)

**类型**：struct

```go
	Identities []*WorkloadIdentityRequest
	QueryOptions
```

### AllocIdentitiesResponse

**定义位置**：[L561](file:///d:/claude/nomad/nomad/structs/workload_id.go#L561)

**类型**：struct

```go
	SignedIdentities []*SignedWorkloadIdentity
	Rejections []*WorkloadIdentityRejection
	QueryMeta
```

### WorkloadType

**定义位置**：[L567](file:///d:/claude/nomad/nomad/structs/workload_id.go#L567)

**类型定义**：`int`

### WIHandle

**定义位置**：[L576](file:///d:/claude/nomad/nomad/structs/workload_id.go#L576)

**类型**：struct

```go
	IdentityName string
	WorkloadIdentifier string
	WorkloadType WorkloadType
	InterpolatedWorkloadIdentifier string
```

**关联方法**（1 个）：`Equal`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `WorkloadIdentityDefaultName` | `"default"` |
| `WorkloadIdentityVaultPrefix` | `"vault_"` |
| `WIRejectionReasonMissingAlloc` | `"allocation not found"` |
| `WIRejectionReasonMissingTask` | `"task not found"` |
| `WIRejectionReasonMissingIdentity` | `"identity not found"` |
| `WIChangeModeNoop` | `"noop"` |
| `WIChangeModeSignal` | `"signal"` |
| `WIChangeModeRestart` | `"restart"` |
| `WorkloadTypeTask` | `iota` |
| `WorkloadTypeService` | `` |

### 变量

| 名称 | 值 |
|------|----|
| `validIdentityName` | `regexp.MustCompile("^[a-zA-Z0-9-_]{1,128}$")` |
| `wIClaimPattern` | `regexp.MustCompile(`\$\{([^}]+)\}`)` |
| `MinNomadVersionVaultWID` | `version.Must(version.NewVersion("1.7.0-a"))` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewIdentityClaimsBuilder` | - | `job *Job, alloc *Allocation, wihandle *WIHandle, wid *WorkloadIdentity, ns *...` | `*WorkloadIdentityClaimsBuilder` | [L106](file:///d:/claude/nomad/nomad/structs/workload_id.go#L106) |
| `WithTask` | `b *WorkloadIdentityClaimsBuilder` | `task *Task` | `*WorkloadIdentityClaimsBuilder` | [L137](file:///d:/claude/nomad/nomad/structs/workload_id.go#L137) |
| `WithVault` | `b *WorkloadIdentityClaimsBuilder` | `extraClaims map[string]string` | `*WorkloadIdentityClaimsBuilder` | [L147](file:///d:/claude/nomad/nomad/structs/workload_id.go#L147) |
| `WithConsul` | `b *WorkloadIdentityClaimsBuilder` | - | `*WorkloadIdentityClaimsBuilder` | [L160](file:///d:/claude/nomad/nomad/structs/workload_id.go#L160) |
| `WithService` | `b *WorkloadIdentityClaimsBuilder` | `service *Service` | `*WorkloadIdentityClaimsBuilder` | [L175](file:///d:/claude/nomad/nomad/structs/workload_id.go#L175) |
| `WithNode` | `b *WorkloadIdentityClaimsBuilder` | `node *Node` | `*WorkloadIdentityClaimsBuilder` | [L188](file:///d:/claude/nomad/nomad/structs/workload_id.go#L188) |
| `Build` | `b *WorkloadIdentityClaimsBuilder` | `now time.Time` | `*IdentityClaims` | [L197](file:///d:/claude/nomad/nomad/structs/workload_id.go#L197) |
| `strAttrGet` | - | `x *T, fn func(...)` | `string` | [L235](file:///d:/claude/nomad/nomad/structs/workload_id.go#L235) |
| `interpolate` | `b *WorkloadIdentityClaimsBuilder` | - | - | [L242](file:///d:/claude/nomad/nomad/structs/workload_id.go#L242) |
| `resolveDynamicToken` | `b *WorkloadIdentityClaimsBuilder` | `token string` | `string` | [L280](file:///d:/claude/nomad/nomad/structs/workload_id.go#L280) |
| `DefaultWorkloadIdentity` | - | - | `*WorkloadIdentity` | [L342](file:///d:/claude/nomad/nomad/structs/workload_id.go#L342) |
| `IsConsul` | `wi *WorkloadIdentity` | - | `bool` | [L351](file:///d:/claude/nomad/nomad/structs/workload_id.go#L351) |
| `IsVault` | `wi *WorkloadIdentity` | - | `bool` | [L361](file:///d:/claude/nomad/nomad/structs/workload_id.go#L361) |
| `Copy` | `wi *WorkloadIdentity` | - | `*WorkloadIdentity` | [L368](file:///d:/claude/nomad/nomad/structs/workload_id.go#L368) |
| `Equal` | `wi *WorkloadIdentity` | `other *WorkloadIdentity` | `bool` | [L386](file:///d:/claude/nomad/nomad/structs/workload_id.go#L386) |
| `Canonicalize` | `wi *WorkloadIdentity` | - | - | [L434](file:///d:/claude/nomad/nomad/structs/workload_id.go#L434) |
| `Validate` | `wi *WorkloadIdentity` | - | `error` | [L453](file:///d:/claude/nomad/nomad/structs/workload_id.go#L453) |
| `Warnings` | `wi *WorkloadIdentity` | - | `error` | [L502](file:///d:/claude/nomad/nomad/structs/workload_id.go#L502) |
| `Equal` | `w *WIHandle` | `o WIHandle` | `bool` | [L588](file:///d:/claude/nomad/nomad/structs/workload_id.go#L588) |

## 5. 核心方法详解

### Validate()

**签名**：`func (wi *WorkloadIdentity) Validate() error`

**位置**：[L453](file:///d:/claude/nomad/nomad/structs/workload_id.go#L453)

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

- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [workload_id_test.go](file:///d:/claude/nomad/nomad/structs/workload_id_test.go) | 对应测试文件 |

