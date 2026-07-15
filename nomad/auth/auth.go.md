# auth.go 代码说明文档

> 文件路径：[auth/auth.go](file:///d:/claude/nomad/nomad/auth/auth.go)
> 总行数：958 行
> 所属包：`auth`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **认证子包**（`nomad/auth`），实现 Nomad Server 的 ACL 认证中间件，验证请求的访问令牌和权限。

## 2. 类型定义

### StateGetter

**定义位置**：[L29](file:///d:/claude/nomad/nomad/auth/auth.go#L29)

**类型定义**：`func(...)`

### LeaderACLGetter

**定义位置**：[L30](file:///d:/claude/nomad/nomad/auth/auth.go#L30)

**类型定义**：`func(...)`

### RPCContext

**定义位置**：[L32](file:///d:/claude/nomad/nomad/auth/auth.go#L32)

**类型**：interface

```go
	IsTLS
	IsStatic
	Certificate
	GetRemoteIP
```

### Encrypter

**定义位置**：[L39](file:///d:/claude/nomad/nomad/auth/auth.go#L39)

**类型**：interface

```go
	VerifyClaim
```

### Authenticator

**定义位置**：[L43](file:///d:/claude/nomad/nomad/auth/auth.go#L43)

**类型**：struct

```go
	aclsEnabled bool
	verifyTLS *atomic.Bool
	logger hclog.Logger
	getState StateGetter
	getLeaderACL LeaderACLGetter
	region string
	validServerCertNames []string
	validClientCertNames []string
	aclCache *structs.ACLCache[*acl.ACL]
	encrypter Encrypter
```

**关联方法**（17 个）：`SetVerifyTLS`, `Authenticate`, `ResolveACL`, `AuthenticateServerOnly`, `AuthenticateNodeIdentityGenerator`, `AuthenticateClientOnly`, `resolveACLForToken`, `ResolveToken`, `VerifyClaim`, `ResolveClientIdentityACL`, `ResolveAuthorizedClientNodePoolByNodeID`, `AuthorizeClientAllocation`, `ResolveAuthorizedClientNodePoolByServiceRegistrationID`, `verifyWorkloadIdentityClaim`, `resolveClaims`, `resolveSecretToken`, `ResolvePoliciesForClaims`

### AuthenticatorConfig

**定义位置**：[L67](file:///d:/claude/nomad/nomad/auth/auth.go#L67)

**类型**：struct

```go
	StateFn StateGetter
	Logger hclog.Logger
	GetLeaderACLFn LeaderACLGetter
	AclsEnabled bool
	VerifyTLS bool
	Region string
	Encrypter Encrypter
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `aclCacheSize` | `512` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewAuthenticator` | - | `cfg *AuthenticatorConfig` | `*Authenticator` | [L77](file:///d:/claude/nomad/nomad/auth/auth.go#L77) |
| `SetVerifyTLS` | `s *Authenticator` | `verifyTLS bool` | - | [L100](file:///d:/claude/nomad/nomad/auth/auth.go#L100) |
| `Authenticate` | `s *Authenticator` | `ctx RPCContext, args structs.RequestWithIdentity` | `error` | [L120](file:///d:/claude/nomad/nomad/auth/auth.go#L120) |
| `ResolveACL` | `s *Authenticator` | `args structs.RequestWithIdentity` | `*acl.ACL, error` | [L225](file:///d:/claude/nomad/nomad/auth/auth.go#L225) |
| `AuthenticateServerOnly` | `s *Authenticator` | `ctx RPCContext, args structs.RequestWithIdentity` | `*acl.ACL, error` | [L263](file:///d:/claude/nomad/nomad/auth/auth.go#L263) |
| `AuthenticateNodeIdentityGenerator` | `s *Authenticator` | `ctx RPCContext, args structs.RequestWithIdentity` | `error` | [L291](file:///d:/claude/nomad/nomad/auth/auth.go#L291) |
| `AuthenticateClientOnly` | `s *Authenticator` | `ctx RPCContext, args structs.RequestWithIdentity` | `*acl.ACL, error` | [L353](file:///d:/claude/nomad/nomad/auth/auth.go#L353) |
| `verifyTLS` | - | `verify bool, ctx RPCContext, validNames []string, identity *structs.Authenti...` | `error` | [L404](file:///d:/claude/nomad/nomad/auth/auth.go#L404) |
| `validateCertificateForNames` | - | `cert *x509.Certificate, expectedNames []string` | `bool, error` | [L429](file:///d:/claude/nomad/nomad/auth/auth.go#L429) |
| `IdentityToACLClaim` | - | `ai *structs.AuthenticatedIdentity, store *state.StateStore` | `*acl.ACLClaim` | [L450](file:///d:/claude/nomad/nomad/auth/auth.go#L450) |
| `resolveACLForToken` | `s *Authenticator` | `aclToken *structs.ACLToken` | `*acl.ACL, error` | [L477](file:///d:/claude/nomad/nomad/auth/auth.go#L477) |
| `ResolveToken` | `s *Authenticator` | `secretID string` | `*acl.ACL, error` | [L491](file:///d:/claude/nomad/nomad/auth/auth.go#L491) |
| `VerifyClaim` | `s *Authenticator` | `token string` | `*structs.IdentityClaims, error` | [L520](file:///d:/claude/nomad/nomad/auth/auth.go#L520) |
| `ResolveClientIdentityACL` | `s *Authenticator` | `identity *structs.AuthenticatedIdentity` | `*acl.ACL, error` | [L556](file:///d:/claude/nomad/nomad/auth/auth.go#L556) |
| `AuthenticatedNodeID` | - | `identity *structs.AuthenticatedIdentity` | `string` | [L583](file:///d:/claude/nomad/nomad/auth/auth.go#L583) |
| `AuthorizeSameNode` | - | `identity *structs.AuthenticatedIdentity, targetNodeID string` | `error` | [L602](file:///d:/claude/nomad/nomad/auth/auth.go#L602) |
| `AuthorizeSameNodeServiceRegistrations` | - | `identity *structs.AuthenticatedIdentity, services []*structs.ServiceRegistra...` | `error` | [L613](file:///d:/claude/nomad/nomad/auth/auth.go#L613) |
| `resolveAuthorizedClientNodePoolByNodeID` | - | `snap *state.StateSnapshot, aclObj *acl.ACL, nodeID string` | `string, error` | [L630](file:///d:/claude/nomad/nomad/auth/auth.go#L630) |
| `ResolveAuthorizedClientNodePoolByNodeID` | `s *Authenticator` | `aclObj *acl.ACL, nodeID string` | `string, error` | [L654](file:///d:/claude/nomad/nomad/auth/auth.go#L654) |
| `AuthorizeClientAllocation` | `s *Authenticator` | `aclObj *acl.ACL, alloc *structs.Allocation, allowNsOp func(...)` | `error` | [L667](file:///d:/claude/nomad/nomad/auth/auth.go#L667) |
| `ResolveAuthorizedClientNodePoolByServiceRegistrationID` | `s *Authenticator` | `aclObj *acl.ACL, namespace string, id string` | `string, error` | [L690](file:///d:/claude/nomad/nomad/auth/auth.go#L690) |
| `verifyWorkloadIdentityClaim` | `s *Authenticator` | `claims *structs.IdentityClaims` | `error` | [L714](file:///d:/claude/nomad/nomad/auth/auth.go#L714) |
| `resolveClaims` | `s *Authenticator` | `claims *structs.IdentityClaims` | `*acl.ACL, error` | [L735](file:///d:/claude/nomad/nomad/auth/auth.go#L735) |
| `resolveTokenFromSnapshotCache` | - | `snap *state.StateSnapshot, cache *structs.ACLCache[*acl.ACL], secretID string` | `*acl.ACL, error` | [L764](file:///d:/claude/nomad/nomad/auth/auth.go#L764) |
| `resolveACLFromToken` | - | `snap *state.StateSnapshot, cache *structs.ACLCache[*acl.ACL], token *structs...` | `*acl.ACL, error` | [L789](file:///d:/claude/nomad/nomad/auth/auth.go#L789) |
| `resolveSecretToken` | `s *Authenticator` | `secretID string` | `*structs.ACLToken, error` | [L861](file:///d:/claude/nomad/nomad/auth/auth.go#L861) |
| `ResolvePoliciesForClaims` | `s *Authenticator` | `claims *structs.IdentityClaims` | `[]*structs.ACLPolicy, error` | [L895](file:///d:/claude/nomad/nomad/auth/auth.go#L895) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `crypto/x509` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `net` | 标准库 |
| `slices` | 标准库 |
| `strings` | 标准库 |
| `sync/atomic` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/acl` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标
- **ACL 集成**：集成访问控制列表，验证请求权限

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [auth_test.go](file:///d:/claude/nomad/nomad/auth/auth_test.go) | 对应测试文件 |

