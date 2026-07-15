# acl_endpoint.go 代码说明文档

> 文件路径：[nomad/acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go)
> 总行数：3250 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad 核心包**（`nomad/`），实现 Server/Client 核心功能，包括 Raft 共识、状态管理、调度系统、RPC 处理等。当前文件 `acl_endpoint.go` 提供相关功能实现。

## 2. 类型定义

### ACL

**定义位置**：[L65](file:///d:/claude/nomad/nomad/acl_endpoint.go#L65)

**中文说明**：ACL 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACL struct {
	srv *Server
	ctx *RPCContext
	logger hclog.Logger
	oidcProviderCache *oidc.ProviderCache
	oidcRequestCache *oidc.RequestCache
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `srv` | `*Server` | 关联的 Server 实例 |
| `ctx` | `*RPCContext` | 上下文，用于控制请求的生命周期 |
| `logger` | `hclog.Logger` | 日志记录器 |
| `oidcProviderCache` | `*oidc.ProviderCache` | OIDC 提供者缓存 |
| `oidcRequestCache` | `*oidc.RequestCache` | OIDC 请求缓存 |

**关联方法**（45 个）：`UpsertPolicies`, `DeletePolicies`, `ListPolicies`, `GetPolicy`, `requestACLToken`, `GetPolicies`, `GetClaimPolicies`, `Bootstrap`, `fileBootstrapResetIndex`, `UpsertTokens`, `upsertTokens`, `DeleteTokens`, `ListTokens`, `GetToken`, `GetTokens`, `ResolveToken`, `UpsertOneTimeToken`, `ExchangeOneTimeToken`, `ExpireOneTimeTokens`, `UpsertRoles`, `DeleteRolesByID`, `ListRoles`, `GetRolesByID`, `GetRoleByID`, `GetRoleByName`, `getPolicyAuthorizationFunc`, `getPoliciesForIdentity`, `policyNamesFromRoleLinks`, `UpsertAuthMethods`, `DeleteAuthMethods`, `ListAuthMethods`, `GetAuthMethod`, `GetAuthMethods`, `WhoAmI`, `UpsertBindingRules`, `DeleteBindingRules`, `ListBindingRules`, `GetBindingRules`, `GetBindingRule`, `OIDCAuthURL`, `OIDCCompleteAuth`, `Login`, `oidcRequest`, `oidcClientAssertion`, `CreateClientIntroductionToken`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `aclBootstrapReset` | `—` | `"acl-bootstrap-reset"` | — |
| `aclOIDCAuthURLRequestExpiryTime` | `—` | `60 * time.Second` | — |
| `aclOIDCCallbackRequestExpiryTime` | `—` | `60 * time.Second` | — |
| `aclLoginRequestExpiryTime` | `—` | `60 * time.Second` | — |
| `verboseLoggingMessage` | `—` | `"attempting login with verbose logging enabled"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `aclDisabled` | `—` | `structs.NewErrRPCCoded(400, "ACL support disabled")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewACLEndpoint` | - | `srv *Server, ctx *RPCContext` | `*ACL` | [L81](file:///d:/claude/nomad/nomad/acl_endpoint.go#L81) |
| `UpsertPolicies` | `a *ACL` | `args *structs.ACLPolicyUpsertRequest, reply *structs.GenericResponse` | `error` | [L92](file:///d:/claude/nomad/nomad/acl_endpoint.go#L92) |
| `DeletePolicies` | `a *ACL` | `args *structs.ACLPolicyDeleteRequest, reply *structs.GenericResponse` | `error` | [L141](file:///d:/claude/nomad/nomad/acl_endpoint.go#L141) |
| `ListPolicies` | `a *ACL` | `args *structs.ACLPolicyListRequest, reply *structs.ACLPolicyListResponse` | `error` | [L182](file:///d:/claude/nomad/nomad/acl_endpoint.go#L182) |
| `GetPolicy` | `a *ACL` | `args *structs.ACLPolicySpecificRequest, reply *structs.SingleACLPolicyResponse` | `error` | [L253](file:///d:/claude/nomad/nomad/acl_endpoint.go#L253) |
| `requestACLToken` | `a *ACL` | `secretID string` | `*structs.ACLToken, error` | [L317](file:///d:/claude/nomad/nomad/acl_endpoint.go#L317) |
| `GetPolicies` | `a *ACL` | `args *structs.ACLPolicySetRequest, reply *structs.ACLPolicySetResponse` | `error` | [L331](file:///d:/claude/nomad/nomad/acl_endpoint.go#L331) |
| `GetClaimPolicies` | `a *ACL` | `args *structs.GenericRequest, reply *structs.ACLPolicySetResponse` | `error` | [L402](file:///d:/claude/nomad/nomad/acl_endpoint.go#L402) |
| `Bootstrap` | `a *ACL` | `args *structs.ACLTokenBootstrapRequest, reply *structs.ACLTokenUpsertResponse` | `error` | [L442](file:///d:/claude/nomad/nomad/acl_endpoint.go#L442) |
| `fileBootstrapResetIndex` | `a *ACL` | `` | `uint64` | [L532](file:///d:/claude/nomad/nomad/acl_endpoint.go#L532) |
| `UpsertTokens` | `a *ACL` | `args *structs.ACLTokenUpsertRequest, reply *structs.ACLTokenUpsertResponse` | `error` | [L558](file:///d:/claude/nomad/nomad/acl_endpoint.go#L558) |
| `upsertTokens` | `a *ACL` | `args *structs.ACLTokenUpsertRequest, reply *structs.ACLTokenUpsertResponse, s...` | `error` | [L622](file:///d:/claude/nomad/nomad/acl_endpoint.go#L622) |
| `DeleteTokens` | `a *ACL` | `args *structs.ACLTokenDeleteRequest, reply *structs.GenericResponse` | `error` | [L740](file:///d:/claude/nomad/nomad/acl_endpoint.go#L740) |
| `ListTokens` | `a *ACL` | `args *structs.ACLTokenListRequest, reply *structs.ACLTokenListResponse` | `error` | [L824](file:///d:/claude/nomad/nomad/acl_endpoint.go#L824) |
| `GetToken` | `a *ACL` | `args *structs.ACLTokenSpecificRequest, reply *structs.SingleACLTokenResponse` | `error` | [L900](file:///d:/claude/nomad/nomad/acl_endpoint.go#L900) |
| `GetTokens` | `a *ACL` | `args *structs.ACLTokenSetRequest, reply *structs.ACLTokenSetResponse` | `error` | [L966](file:///d:/claude/nomad/nomad/acl_endpoint.go#L966) |
| `ResolveToken` | `a *ACL` | `args *structs.ResolveACLTokenRequest, reply *structs.ResolveACLTokenResponse` | `error` | [L1021](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1021) |
| `UpsertOneTimeToken` | `a *ACL` | `args *structs.OneTimeTokenUpsertRequest, reply *structs.OneTimeTokenUpsertRes...` | `error` | [L1061](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1061) |
| `ExchangeOneTimeToken` | `a *ACL` | `args *structs.OneTimeTokenExchangeRequest, reply *structs.OneTimeTokenExchang...` | `error` | [L1120](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1120) |
| `ExpireOneTimeTokens` | `a *ACL` | `args *structs.OneTimeTokenExpireRequest, reply *structs.GenericResponse` | `error` | [L1186](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1186) |
| `UpsertRoles` | `a *ACL` | `args *structs.ACLRolesUpsertRequest, reply *structs.ACLRolesUpsertResponse` | `error` | [L1233](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1233) |
| `DeleteRolesByID` | `a *ACL` | `args *structs.ACLRolesDeleteByIDRequest, reply *structs.ACLRolesDeleteByIDRes...` | `error` | [L1375](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1375) |
| `ListRoles` | `a *ACL` | `args *structs.ACLRolesListRequest, reply *structs.ACLRolesListResponse` | `error` | [L1428](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1428) |
| `GetRolesByID` | `a *ACL` | `args *structs.ACLRolesByIDRequest, reply *structs.ACLRolesByIDResponse` | `error` | [L1527](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1527) |
| `GetRoleByID` | `a *ACL` | `args *structs.ACLRoleByIDRequest, reply *structs.ACLRoleByIDResponse` | `error` | [L1585](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1585) |
| `GetRoleByName` | `a *ACL` | `args *structs.ACLRoleByNameRequest, reply *structs.ACLRoleByNameResponse` | `error` | [L1675](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1675) |
| `getPolicyAuthorizationFunc` | `a *ACL` | `aclObj *acl.ACL, identity structs.AuthenticatedIdentity` | `func(...), error` | [L1769](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1769) |
| `getPoliciesForIdentity` | `a *ACL` | `identity structs.AuthenticatedIdentity` | `*set.Set[string], error` | [L1790](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1790) |
| `policyNamesFromRoleLinks` | `a *ACL` | `roleLinks []*structs.ACLTokenRoleLink` | `*set.Set[string], error` | [L1827](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1827) |
| `UpsertAuthMethods` | `a *ACL` | `args *structs.ACLAuthMethodUpsertRequest, reply *structs.ACLAuthMethodUpsertR...` | `error` | [L1879](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1879) |
| `DeleteAuthMethods` | `a *ACL` | `args *structs.ACLAuthMethodDeleteRequest, reply *structs.ACLAuthMethodDeleteR...` | `error` | [L1993](file:///d:/claude/nomad/nomad/acl_endpoint.go#L1993) |
| `ListAuthMethods` | `a *ACL` | `args *structs.ACLAuthMethodListRequest, reply *structs.ACLAuthMethodListResponse` | `error` | [L2045](file:///d:/claude/nomad/nomad/acl_endpoint.go#L2045) |
| `GetAuthMethod` | `a *ACL` | `args *structs.ACLAuthMethodGetRequest, reply *structs.ACLAuthMethodGetResponse` | `error` | [L2090](file:///d:/claude/nomad/nomad/acl_endpoint.go#L2090) |
| `GetAuthMethods` | `a *ACL` | `args *structs.ACLAuthMethodsGetRequest, reply *structs.ACLAuthMethodsGetResponse` | `error` | [L2151](file:///d:/claude/nomad/nomad/acl_endpoint.go#L2151) |
| `WhoAmI` | `a *ACL` | `args *structs.GenericRequest, reply *structs.ACLWhoAmIResponse` | `error` | [L2211](file:///d:/claude/nomad/nomad/acl_endpoint.go#L2211) |
| `UpsertBindingRules` | `a *ACL` | `args *structs.ACLBindingRulesUpsertRequest, reply *structs.ACLBindingRulesUps...` | `error` | [L2254](file:///d:/claude/nomad/nomad/acl_endpoint.go#L2254) |
| `DeleteBindingRules` | `a *ACL` | `args *structs.ACLBindingRulesDeleteRequest, reply *structs.ACLBindingRulesDel...` | `error` | [L2387](file:///d:/claude/nomad/nomad/acl_endpoint.go#L2387) |
| `ListBindingRules` | `a *ACL` | `args *structs.ACLBindingRulesListRequest, reply *structs.ACLBindingRulesListR...` | `error` | [L2438](file:///d:/claude/nomad/nomad/acl_endpoint.go#L2438) |
| `GetBindingRules` | `a *ACL` | `args *structs.ACLBindingRulesRequest, reply *structs.ACLBindingRulesResponse` | `error` | [L2495](file:///d:/claude/nomad/nomad/acl_endpoint.go#L2495) |
| `GetBindingRule` | `a *ACL` | `args *structs.ACLBindingRuleRequest, reply *structs.ACLBindingRuleResponse` | `error` | [L2552](file:///d:/claude/nomad/nomad/acl_endpoint.go#L2552) |
| `OIDCAuthURL` | `a *ACL` | `args *structs.ACLOIDCAuthURLRequest, reply *structs.ACLOIDCAuthURLResponse` | `error` | [L2613](file:///d:/claude/nomad/nomad/acl_endpoint.go#L2613) |
| `OIDCCompleteAuth` | `a *ACL` | `args *structs.ACLOIDCCompleteAuthRequest, reply *structs.ACLLoginResponse` | `error` | [L2700](file:///d:/claude/nomad/nomad/acl_endpoint.go#L2700) |
| `Login` | `a *ACL` | `args *structs.ACLLoginRequest, reply *structs.ACLLoginResponse` | `error` | [L2917](file:///d:/claude/nomad/nomad/acl_endpoint.go#L2917) |
| `formatTokenName` | - | `format string, authType string, authName string, claims map[string]string` | `string, error` | [L3098](file:///d:/claude/nomad/nomad/acl_endpoint.go#L3098) |
| `oidcRequest` | `a *ACL` | `nonce string, redirect string, config *structs.ACLAuthMethodConfig` | `*capOIDC.Req, error` | [L3121](file:///d:/claude/nomad/nomad/acl_endpoint.go#L3121) |
| `oidcClientAssertion` | `a *ACL` | `config *structs.ACLAuthMethodConfig` | `*cass.JWT, error` | [L3161](file:///d:/claude/nomad/nomad/acl_endpoint.go#L3161) |
| `CreateClientIntroductionToken` | `a *ACL` | `args *structs.ACLCreateClientIntroductionTokenRequest, reply *structs.ACLCrea...` | `error` | [L3188](file:///d:/claude/nomad/nomad/acl_endpoint.go#L3188) |

## 5. 核心方法详解

### NewACLEndpoint()

**签名**：`func NewACLEndpoint(srv *Server, ctx *RPCContext) *ACL`

**位置**：[L81](file:///d:/claude/nomad/nomad/acl_endpoint.go#L81)

**中文说明**：创建并返回一个新的 ACLEndpoint 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `srv` | `*Server` | 关联的 Server 实例 |
| `ctx` | `*RPCContext` | 上下文，用于控制请求的生命周期 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACL` | — |

### Login()

**签名**：`func (a *ACL) Login(args *structs.ACLLoginRequest, reply *structs.ACLLoginResponse) error`

**位置**：[L2917](file:///d:/claude/nomad/nomad/acl_endpoint.go#L2917)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `args` | `*structs.ACLLoginRequest` | 参数 |
| `reply` | `*structs.ACLLoginResponse` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `net/http` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/acl` | 内部包 |
| `github.com/hashicorp/nomad/acl` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/lib/auth` | 内部包 |
| `github.com/hashicorp/nomad/lib/auth/jwt` | 内部包 |
| `github.com/hashicorp/nomad/lib/auth/oidc` | 内部包 |
| `github.com/hashicorp/nomad/nomad/peers` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state/paginator` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/cap/oidc` | 第三方库 |
| `github.com/hashicorp/cap/oidc/clientassertion` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标
- **HTTP 服务**：提供 HTTP API 端点或客户端
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl_endpoint_test.go](file:///d:/claude/nomad/nomad/acl_endpoint_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/acl.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/nomad/alloc_endpoint.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | 同目录源文件 |
| [autopilot_ce.go](file:///d:/claude/nomad/nomad/autopilot_ce.go) | 同目录源文件 |
| [blocked_evals.go](file:///d:/claude/nomad/nomad/blocked_evals.go) | 同目录源文件 |

