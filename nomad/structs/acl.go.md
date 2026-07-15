# acl.go 代码说明文档

> 文件路径：[structs/acl.go](file:///d:/claude/nomad/nomad/structs/acl.go)
> 总行数：2541 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### ACLCacheEntry

**定义位置**：[L270](file:///d:/claude/nomad/nomad/structs/acl.go#L270)

**类型定义**：`lang.Pair[T, time.Time]`

### ACLCache

**定义位置**：[L281](file:///d:/claude/nomad/nomad/structs/acl.go#L281)

**类型**：struct

```go
	*lru.TwoQueueCache[string, ACLCacheEntry[T]]
	clock libtime.Clock
```

### ACLPolicy

**定义位置**：[L309](file:///d:/claude/nomad/nomad/structs/acl.go#L309)

**类型**：struct

```go
	Name string
	Description string
	Rules string
	RulesJSON *acl.Policy
	JobACL *JobACL
	Hash []byte
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（3 个）：`SetHash`, `Stub`, `Validate`

### JobACL

**定义位置**：[L322](file:///d:/claude/nomad/nomad/structs/acl.go#L322)

**类型**：struct

```go
	Namespace string
	JobID string
	Group string
	Task string
```

### ACLPolicyListStub

**定义位置**：[L401](file:///d:/claude/nomad/nomad/structs/acl.go#L401)

**类型**：struct

```go
	Name string
	Description string
	JobACL *JobACL
	Hash []byte
	CreateIndex uint64
	ModifyIndex uint64
```

### ACLPolicyListRequest

**定义位置**：[L411](file:///d:/claude/nomad/nomad/structs/acl.go#L411)

**类型**：struct

```go
	QueryOptions
```

### ACLPolicySpecificRequest

**定义位置**：[L416](file:///d:/claude/nomad/nomad/structs/acl.go#L416)

**类型**：struct

```go
	Name string
	QueryOptions
```

### ACLPolicySetRequest

**定义位置**：[L422](file:///d:/claude/nomad/nomad/structs/acl.go#L422)

**类型**：struct

```go
	Names []string
	QueryOptions
```

### ACLPolicyListResponse

**定义位置**：[L428](file:///d:/claude/nomad/nomad/structs/acl.go#L428)

**类型**：struct

```go
	Policies []*ACLPolicyListStub
	QueryMeta
```

### SingleACLPolicyResponse

**定义位置**：[L434](file:///d:/claude/nomad/nomad/structs/acl.go#L434)

**类型**：struct

```go
	Policy *ACLPolicy
	QueryMeta
```

### ACLPolicySetResponse

**定义位置**：[L440](file:///d:/claude/nomad/nomad/structs/acl.go#L440)

**类型**：struct

```go
	Policies map[string]*ACLPolicy
	QueryMeta
```

### ACLPolicyDeleteRequest

**定义位置**：[L446](file:///d:/claude/nomad/nomad/structs/acl.go#L446)

**类型**：struct

```go
	Names []string
	WriteRequest
```

### ACLPolicyUpsertRequest

**定义位置**：[L452](file:///d:/claude/nomad/nomad/structs/acl.go#L452)

**类型**：struct

```go
	Policies []*ACLPolicy
	WriteRequest
```

### ACLToken

**定义位置**：[L458](file:///d:/claude/nomad/nomad/structs/acl.go#L458)

**类型**：struct

```go
	AccessorID string
	SecretID string
	Name string
	Type string
	Policies []string
	Roles []*ACLTokenRoleLink
	Global bool
	Hash []byte
	CreateTime time.Time
	ExpirationTime *time.Time
	ExpirationTTL time.Duration
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（13 个）：`GetID`, `GetCreateIndex`, `Copy`, `SetHash`, `Stub`, `Canonicalize`, `Validate`, `HasExpirationTime`, `IsExpired`, `HasRoles`, `MarshalJSON`, `UnmarshalJSON`, `Sanitize`

### ACLTokenListStub

**定义位置**：[L521](file:///d:/claude/nomad/nomad/structs/acl.go#L521)

**类型**：struct

```go
	AccessorID string
	Name string
	Type string
	Policies []string
	Roles []*ACLTokenRoleLink
	Global bool
	Hash []byte
	CreateTime time.Time
	ExpirationTime *time.Time
	CreateIndex uint64
	ModifyIndex uint64
```

### ACLTokenListRequest

**定义位置**：[L589](file:///d:/claude/nomad/nomad/structs/acl.go#L589)

**类型**：struct

```go
	GlobalOnly bool
	QueryOptions
```

### ACLTokenSpecificRequest

**定义位置**：[L595](file:///d:/claude/nomad/nomad/structs/acl.go#L595)

**类型**：struct

```go
	AccessorID string
	QueryOptions
```

### ACLTokenSetRequest

**定义位置**：[L601](file:///d:/claude/nomad/nomad/structs/acl.go#L601)

**类型**：struct

```go
	AccessorIDS []string
	QueryOptions
```

### ACLTokenListResponse

**定义位置**：[L607](file:///d:/claude/nomad/nomad/structs/acl.go#L607)

**类型**：struct

```go
	Tokens []*ACLTokenListStub
	QueryMeta
```

### SingleACLTokenResponse

**定义位置**：[L613](file:///d:/claude/nomad/nomad/structs/acl.go#L613)

**类型**：struct

```go
	Token *ACLToken
	QueryMeta
```

### ACLTokenSetResponse

**定义位置**：[L619](file:///d:/claude/nomad/nomad/structs/acl.go#L619)

**类型**：struct

```go
	Tokens map[string]*ACLToken
	QueryMeta
```

### ResolveACLTokenRequest

**定义位置**：[L625](file:///d:/claude/nomad/nomad/structs/acl.go#L625)

**类型**：struct

```go
	SecretID string
	QueryOptions
```

### ResolveACLTokenResponse

**定义位置**：[L631](file:///d:/claude/nomad/nomad/structs/acl.go#L631)

**类型**：struct

```go
	Token *ACLToken
	QueryMeta
```

### ACLTokenDeleteRequest

**定义位置**：[L637](file:///d:/claude/nomad/nomad/structs/acl.go#L637)

**类型**：struct

```go
	AccessorIDs []string
	WriteRequest
```

### ACLTokenBootstrapRequest

**定义位置**：[L643](file:///d:/claude/nomad/nomad/structs/acl.go#L643)

**类型**：struct

```go
	Token *ACLToken
	ResetIndex uint64
	BootstrapSecret string
	WriteRequest
```

### ACLTokenUpsertRequest

**定义位置**：[L651](file:///d:/claude/nomad/nomad/structs/acl.go#L651)

**类型**：struct

```go
	Tokens []*ACLToken
	WriteRequest
```

### ACLTokenUpsertResponse

**定义位置**：[L657](file:///d:/claude/nomad/nomad/structs/acl.go#L657)

**类型**：struct

```go
	Tokens []*ACLToken
	WriteMeta
```

### OneTimeToken

**定义位置**：[L664](file:///d:/claude/nomad/nomad/structs/acl.go#L664)

**类型**：struct

```go
	OneTimeSecretID string
	AccessorID string
	ExpiresAt time.Time
	CreateIndex uint64
	ModifyIndex uint64
```

### OneTimeTokenUpsertRequest

**定义位置**：[L673](file:///d:/claude/nomad/nomad/structs/acl.go#L673)

**类型**：struct

```go
	WriteRequest
```

### OneTimeTokenUpsertResponse

**定义位置**：[L678](file:///d:/claude/nomad/nomad/structs/acl.go#L678)

**类型**：struct

```go
	OneTimeToken *OneTimeToken
	WriteMeta
```

### OneTimeTokenExchangeRequest

**定义位置**：[L685](file:///d:/claude/nomad/nomad/structs/acl.go#L685)

**类型**：struct

```go
	OneTimeSecretID string
	WriteRequest
```

### OneTimeTokenExchangeResponse

**定义位置**：[L692](file:///d:/claude/nomad/nomad/structs/acl.go#L692)

**类型**：struct

```go
	Token *ACLToken
	WriteMeta
```

### OneTimeTokenDeleteRequest

**定义位置**：[L698](file:///d:/claude/nomad/nomad/structs/acl.go#L698)

**类型**：struct

```go
	AccessorIDs []string
	WriteRequest
```

### OneTimeTokenExpireRequest

**定义位置**：[L704](file:///d:/claude/nomad/nomad/structs/acl.go#L704)

**类型**：struct

```go
	Timestamp time.Time
	WriteRequest
```

### ACLTokenRoleLink

**定义位置**：[L712](file:///d:/claude/nomad/nomad/structs/acl.go#L712)

**类型**：struct

```go
	ID string
	Name string
```

### ACLRole

**定义位置**：[L939](file:///d:/claude/nomad/nomad/structs/acl.go#L939)

**类型**：struct

```go
	ID string
	Name string
	Description string
	Policies []*ACLRolePolicyLink
	Hash []byte
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（6 个）：`SetHash`, `Validate`, `Canonicalize`, `Equal`, `Copy`, `Stub`

### ACLRolePolicyLink

**定义位置**：[L973](file:///d:/claude/nomad/nomad/structs/acl.go#L973)

**类型**：struct

```go
	Name string
```

### ACLRoleListStub

**定义位置**：[L1085](file:///d:/claude/nomad/nomad/structs/acl.go#L1085)

**类型**：struct

```go
	ID string
	Name string
	Description string
	Policies []*ACLRolePolicyLink
	Hash []byte
	CreateIndex uint64
	ModifyIndex uint64
```

### ACLRolesUpsertRequest

**定义位置**：[L1118](file:///d:/claude/nomad/nomad/structs/acl.go#L1118)

**类型**：struct

```go
	ACLRoles []*ACLRole
	AllowMissingPolicies bool
	WriteRequest
```

### ACLRolesUpsertResponse

**定义位置**：[L1131](file:///d:/claude/nomad/nomad/structs/acl.go#L1131)

**类型**：struct

```go
	ACLRoles []*ACLRole
	WriteMeta
```

### ACLRolesDeleteByIDRequest

**定义位置**：[L1138](file:///d:/claude/nomad/nomad/structs/acl.go#L1138)

**类型**：struct

```go
	ACLRoleIDs []string
	WriteRequest
```

### ACLRolesDeleteByIDResponse

**定义位置**：[L1145](file:///d:/claude/nomad/nomad/structs/acl.go#L1145)

**类型**：struct

```go
	WriteMeta
```

### ACLRolesListRequest

**定义位置**：[L1150](file:///d:/claude/nomad/nomad/structs/acl.go#L1150)

**类型**：struct

```go
	QueryOptions
```

### ACLRolesListResponse

**定义位置**：[L1156](file:///d:/claude/nomad/nomad/structs/acl.go#L1156)

**类型**：struct

```go
	ACLRoles []*ACLRoleListStub
	QueryMeta
```

### ACLRolesByIDRequest

**定义位置**：[L1163](file:///d:/claude/nomad/nomad/structs/acl.go#L1163)

**类型**：struct

```go
	ACLRoleIDs []string
	QueryOptions
```

### ACLRolesByIDResponse

**定义位置**：[L1170](file:///d:/claude/nomad/nomad/structs/acl.go#L1170)

**类型**：struct

```go
	ACLRoles map[string]*ACLRole
	QueryMeta
```

### ACLRoleByIDRequest

**定义位置**：[L1177](file:///d:/claude/nomad/nomad/structs/acl.go#L1177)

**类型**：struct

```go
	RoleID string
	QueryOptions
```

### ACLRoleByIDResponse

**定义位置**：[L1184](file:///d:/claude/nomad/nomad/structs/acl.go#L1184)

**类型**：struct

```go
	ACLRole *ACLRole
	QueryMeta
```

### ACLRoleByNameRequest

**定义位置**：[L1191](file:///d:/claude/nomad/nomad/structs/acl.go#L1191)

**类型**：struct

```go
	RoleName string
	QueryOptions
```

### ACLRoleByNameResponse

**定义位置**：[L1198](file:///d:/claude/nomad/nomad/structs/acl.go#L1198)

**类型**：struct

```go
	ACLRole *ACLRole
	QueryMeta
```

### ACLAuthMethod

**定义位置**：[L1205](file:///d:/claude/nomad/nomad/structs/acl.go#L1205)

**类型**：struct

```go
	Name string
	Type string
	TokenLocality string
	TokenNameFormat string
	MaxTokenTTL time.Duration
	Default bool
	Config *ACLAuthMethodConfig
	Hash []byte
	CreateTime time.Time
	ModifyTime time.Time
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（11 个）：`SetHash`, `MarshalJSON`, `UnmarshalJSON`, `Stub`, `Equal`, `Copy`, `Canonicalize`, `Merge`, `Validate`, `Sanitize`, `TokenLocalityIsGlobal`

### ACLAuthMethodConfig

**定义位置**：[L1489](file:///d:/claude/nomad/nomad/structs/acl.go#L1489)

**类型**：struct

```go
	JWTValidationPubKeys []string
	JWKSURL string
	OIDCDiscoveryURL string
	OIDCClientID string
	OIDCClientSecret string
	OIDCClientAssertion *OIDCClientAssertion
	OIDCEnablePKCE bool
	OIDCDisableUserInfo bool
	OIDCScopes []string
	BoundAudiences []string
	BoundIssuer []string
	AllowedRedirectURIs []string
	DiscoveryCaPem []string
	JWKSCACert string
	SigningAlgs []string
	ExpirationLeeway time.Duration
	NotBeforeLeeway time.Duration
	ClockSkewLeeway time.Duration
	ClaimMappings map[string]string
	ListClaimMappings map[string]string
	VerboseLogging bool
```

**关联方法**（5 个）：`Canonicalize`, `Validate`, `Copy`, `MarshalJSON`, `UnmarshalJSON`

### OIDCClientAssertionKeySource

**定义位置**：[L1712](file:///d:/claude/nomad/nomad/structs/acl.go#L1712)

**类型定义**：`string`

### OIDCClientAssertion

**定义位置**：[L1723](file:///d:/claude/nomad/nomad/structs/acl.go#L1723)

**类型**：struct

```go
	KeySource OIDCClientAssertionKeySource
	Audience []string
	PrivateKey *OIDCClientAssertionKey
	ExtraHeaders map[string]string
	KeyAlgorithm string
	ClientSecret string
```

**关联方法**（4 个）：`Copy`, `Canonicalize`, `IsSet`, `Validate`

### OIDCClientAssertionKeyIDHeader

**定义位置**：[L1793](file:///d:/claude/nomad/nomad/structs/acl.go#L1793)

**类型定义**：`string`

### OIDCClientAssertionKey

**定义位置**：[L1804](file:///d:/claude/nomad/nomad/structs/acl.go#L1804)

**类型**：struct

```go
	PemKey string
	PemKeyFile string
	KeyIDHeader OIDCClientAssertionKeyIDHeader
	PemCert string
	PemCertFile string
	KeyID string
```

**关联方法**（3 个）：`Copy`, `Canonicalize`, `Validate`

### ACLAuthClaims

**定义位置**：[L1908](file:///d:/claude/nomad/nomad/structs/acl.go#L1908)

**类型**：struct

```go
	Value map[string]string `bexpr:"value"`
	List map[string][]string `bexpr:"list"`
```

### ACLAuthMethodStub

**定义位置**：[L1914](file:///d:/claude/nomad/nomad/structs/acl.go#L1914)

**类型**：struct

```go
	Name string
	Type string
	Default bool
	Hash []byte
	CreateIndex uint64
	ModifyIndex uint64
```

### ACLAuthMethodListRequest

**定义位置**：[L1929](file:///d:/claude/nomad/nomad/structs/acl.go#L1929)

**类型**：struct

```go
	QueryOptions
```

### ACLAuthMethodListResponse

**定义位置**：[L1934](file:///d:/claude/nomad/nomad/structs/acl.go#L1934)

**类型**：struct

```go
	AuthMethods []*ACLAuthMethodStub
	QueryMeta
```

### ACLAuthMethodGetRequest

**定义位置**：[L1940](file:///d:/claude/nomad/nomad/structs/acl.go#L1940)

**类型**：struct

```go
	MethodName string
	QueryOptions
```

### ACLAuthMethodGetResponse

**定义位置**：[L1946](file:///d:/claude/nomad/nomad/structs/acl.go#L1946)

**类型**：struct

```go
	AuthMethod *ACLAuthMethod
	QueryMeta
```

### ACLAuthMethodsGetRequest

**定义位置**：[L1952](file:///d:/claude/nomad/nomad/structs/acl.go#L1952)

**类型**：struct

```go
	Names []string
	QueryOptions
```

### ACLAuthMethodsGetResponse

**定义位置**：[L1958](file:///d:/claude/nomad/nomad/structs/acl.go#L1958)

**类型**：struct

```go
	AuthMethods map[string]*ACLAuthMethod
	QueryMeta
```

### ACLAuthMethodUpsertRequest

**定义位置**：[L1964](file:///d:/claude/nomad/nomad/structs/acl.go#L1964)

**类型**：struct

```go
	AuthMethods []*ACLAuthMethod
	WriteRequest
```

### ACLAuthMethodUpsertResponse

**定义位置**：[L1971](file:///d:/claude/nomad/nomad/structs/acl.go#L1971)

**类型**：struct

```go
	AuthMethods []*ACLAuthMethod
	WriteMeta
```

### ACLAuthMethodDeleteRequest

**定义位置**：[L1978](file:///d:/claude/nomad/nomad/structs/acl.go#L1978)

**类型**：struct

```go
	Names []string
	WriteRequest
```

### ACLAuthMethodDeleteResponse

**定义位置**：[L1985](file:///d:/claude/nomad/nomad/structs/acl.go#L1985)

**类型**：struct

```go
	WriteMeta
```

### ACLWhoAmIResponse

**定义位置**：[L1989](file:///d:/claude/nomad/nomad/structs/acl.go#L1989)

**类型**：struct

```go
	Identity *AuthenticatedIdentity
	QueryMeta
```

### ACLBindingRule

**定义位置**：[L1998](file:///d:/claude/nomad/nomad/structs/acl.go#L1998)

**类型**：struct

```go
	ID string
	Description string
	AuthMethod string
	Selector string
	BindType string
	BindName string
	Hash []byte
	CreateTime time.Time
	ModifyTime time.Time
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（7 个）：`Canonicalize`, `Validate`, `Merge`, `SetHash`, `Equal`, `Copy`, `Stub`

### ACLBindingRuleListStub

**定义位置**：[L2198](file:///d:/claude/nomad/nomad/structs/acl.go#L2198)

**类型**：struct

```go
	ID string
	Description string
	AuthMethod string
	Hash []byte
	CreateIndex uint64
	ModifyIndex uint64
```

### ACLBindingRulesUpsertRequest

**定义位置**：[L2224](file:///d:/claude/nomad/nomad/structs/acl.go#L2224)

**类型**：struct

```go
	ACLBindingRules []*ACLBindingRule
	AllowMissingAuthMethods bool
	WriteRequest
```

### ACLBindingRulesUpsertResponse

**定义位置**：[L2238](file:///d:/claude/nomad/nomad/structs/acl.go#L2238)

**类型**：struct

```go
	ACLBindingRules []*ACLBindingRule
	WriteMeta
```

### ACLBindingRulesDeleteRequest

**定义位置**：[L2245](file:///d:/claude/nomad/nomad/structs/acl.go#L2245)

**类型**：struct

```go
	ACLBindingRuleIDs []string
	WriteRequest
```

### ACLBindingRulesDeleteResponse

**定义位置**：[L2252](file:///d:/claude/nomad/nomad/structs/acl.go#L2252)

**类型**：struct

```go
	WriteMeta
```

### ACLBindingRulesListRequest

**定义位置**：[L2258](file:///d:/claude/nomad/nomad/structs/acl.go#L2258)

**类型**：struct

```go
	QueryOptions
```

### ACLBindingRulesListResponse

**定义位置**：[L2264](file:///d:/claude/nomad/nomad/structs/acl.go#L2264)

**类型**：struct

```go
	ACLBindingRules []*ACLBindingRuleListStub
	QueryMeta
```

### ACLBindingRulesRequest

**定义位置**：[L2271](file:///d:/claude/nomad/nomad/structs/acl.go#L2271)

**类型**：struct

```go
	ACLBindingRuleIDs []string
	QueryOptions
```

### ACLBindingRulesResponse

**定义位置**：[L2278](file:///d:/claude/nomad/nomad/structs/acl.go#L2278)

**类型**：struct

```go
	ACLBindingRules map[string]*ACLBindingRule
	QueryMeta
```

### ACLBindingRuleRequest

**定义位置**：[L2285](file:///d:/claude/nomad/nomad/structs/acl.go#L2285)

**类型**：struct

```go
	ACLBindingRuleID string
	QueryOptions
```

### ACLBindingRuleResponse

**定义位置**：[L2292](file:///d:/claude/nomad/nomad/structs/acl.go#L2292)

**类型**：struct

```go
	ACLBindingRule *ACLBindingRule
	QueryMeta
```

### ACLOIDCAuthURLRequest

**定义位置**：[L2299](file:///d:/claude/nomad/nomad/structs/acl.go#L2299)

**类型**：struct

```go
	AuthMethodName string
	RedirectURI string
	ClientNonce string
	WriteRequest
```

**关联方法**（1 个）：`Validate`

### ACLOIDCAuthURLResponse

**定义位置**：[L2341](file:///d:/claude/nomad/nomad/structs/acl.go#L2341)

**类型**：struct

```go
	AuthURL string
```

### ACLOIDCCompleteAuthRequest

**定义位置**：[L2350](file:///d:/claude/nomad/nomad/structs/acl.go#L2350)

**类型**：struct

```go
	AuthMethodName string
	ClientNonce string
	State string
	Code string
	Iss string
	RedirectURI string
	WriteRequest
```

**关联方法**（1 个）：`Validate`

### ACLLoginResponse

**定义位置**：[L2397](file:///d:/claude/nomad/nomad/structs/acl.go#L2397)

**类型**：struct

```go
	ACLToken *ACLToken
	WriteMeta
```

### ACLLoginRequest

**定义位置**：[L2404](file:///d:/claude/nomad/nomad/structs/acl.go#L2404)

**类型**：struct

```go
	AuthMethodName string
	LoginToken string
	WriteRequest
```

**关联方法**（1 个）：`Validate`

### ACLCreateClientIntroductionTokenRequest

**定义位置**：[L2435](file:///d:/claude/nomad/nomad/structs/acl.go#L2435)

**类型**：struct

```go
	TTL time.Duration
	NodeName string
	NodePool string
	WriteRequest
```

**关联方法**（4 个）：`Canonicalize`, `IdentityTTL`, `MarshalJSON`, `UnmarshalJSON`

### ACLCreateClientIntroductionTokenResponse

**定义位置**：[L2535](file:///d:/claude/nomad/nomad/structs/acl.go#L2535)

**类型**：struct

```go
	JWT string
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `ACLUpsertPoliciesRPCMethod` | `"ACL.UpsertPolicies"` |
| `ACLUpsertTokensRPCMethod` | `"ACL.UpsertTokens"` |
| `ACLDeleteTokensRPCMethod` | `"ACL.DeleteTokens"` |
| `ACLUpsertRolesRPCMethod` | `"ACL.UpsertRoles"` |
| `ACLDeleteRolesByIDRPCMethod` | `"ACL.DeleteRolesByID"` |
| `ACLListRolesRPCMethod` | `"ACL.ListRoles"` |
| `ACLGetRolesByIDRPCMethod` | `"ACL.GetRolesByID"` |
| `ACLGetRoleByIDRPCMethod` | `"ACL.GetRoleByID"` |
| `ACLGetRoleByNameRPCMethod` | `"ACL.GetRoleByName"` |
| `ACLUpsertAuthMethodsRPCMethod` | `"ACL.UpsertAuthMethods"` |
| `ACLDeleteAuthMethodsRPCMethod` | `"ACL.DeleteAuthMethods"` |
| `ACLListAuthMethodsRPCMethod` | `"ACL.ListAuthMethods"` |
| `ACLGetAuthMethodRPCMethod` | `"ACL.GetAuthMethod"` |
| `ACLGetAuthMethodsRPCMethod` | `"ACL.GetAuthMethods"` |
| `ACLUpsertBindingRulesRPCMethod` | `"ACL.UpsertBindingRules"` |
| `ACLDeleteBindingRulesRPCMethod` | `"ACL.DeleteBindingRules"` |
| `ACLListBindingRulesRPCMethod` | `"ACL.ListBindingRules"` |
| `ACLGetBindingRulesRPCMethod` | `"ACL.GetBindingRules"` |
| `ACLGetBindingRuleRPCMethod` | `"ACL.GetBindingRule"` |
| `ACLOIDCAuthURLRPCMethod` | `"ACL.OIDCAuthURL"` |
| `ACLOIDCCompleteAuthRPCMethod` | `"ACL.OIDCCompleteAuth"` |
| `ACLLoginRPCMethod` | `"ACL.Login"` |
| `ACLCreateClientIntroductionTokenRPCMethod` | `"ACL.CreateClientIntroductionToken"` |
| `ACLMaxExpiredBatchSize` | `4096` |
| `maxACLRoleDescriptionLength` | `256` |
| `maxACLBindingRuleDescriptionLength` | `256` |
| `ACLAuthMethodTokenLocalityLocal` | `"local"` |
| `ACLAuthMethodTokenLocalityGlobal` | `"global"` |
| `ACLAuthMethodTypeOIDC` | `"OIDC"` |
| `ACLAuthMethodTypeJWT` | `"JWT"` |
| `DefaultACLAuthMethodTokenNameFormat` | `"${auth_method_type}-${auth_method_name}"` |
| `OIDCKeySourceNomad` | `"nomad"` |
| `OIDCKeySourceClientSecret` | `"client_secret"` |
| `OIDCKeySourcePrivateKey` | `"private_key"` |
| `OIDCClientAssertionHeaderKid` | `"kid"` |
| `OIDCClientAssertionHeaderX5t` | `"x5t"` |
| `OIDCClientAssertionHeaderX5tS256` | `"x5t#S256"` |
| `ACLBindingRuleBindTypeRole` | `"role"` |
| `ACLBindingRuleBindTypePolicy` | `"policy"` |
| `ACLBindingRuleBindTypeManagement` | `"management"` |

### 变量

| 名称 | 值 |
|------|----|
| `ValidACLRoleName` | `regexp.MustCompile("^[a-zA-Z0-9-]{1,128}$")` |
| `ValidACLAuthMethod` | `regexp.MustCompile("^[a-zA-Z0-9-]{1,128}$")` |
| `ValidACLAuthMethodTypes` | `[]string{...}` |
| `AnonymousACLToken` | `&ACLToken{...}` |
| `LeaderACLToken` | `&ACLToken{...}` |
| `ACLsDisabledToken` | `&ACLToken{...}` |
| `ErrMissingClientAssertionKey` | `errors.New("missing PemKey or PemKeyFile")` |
| `ErrAmbiguousClientAssertionKey` | `errors.New("require only one of PemKey or PemKeyFile")` |
| `ErrMissingClientAssertionKeyID` | `errors.New("missing PemCert, PemCertFile, or KeyID")` |
| `ErrAmbiguousClientAssertionKeyID` | `errors.New("require only one of PemCert, PemCertFile, or ...` |
| `ErrInvalidClientAssertionKeyPath` | `errors.New("invalid PemKeyFile")` |
| `ErrInvalidClientAssertionCertPath` | `errors.New("invalid PemCertFile")` |
| `ErrInvalidKeyIDHeader` | `errors.New("invalid KeyIDHeader")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Age` | `e *ACLCacheEntry[T]` | - | `time.Duration` | [L272](file:///d:/claude/nomad/nomad/structs/acl.go#L272) |
| `Get` | `e *ACLCacheEntry[T]` | - | `T` | [L276](file:///d:/claude/nomad/nomad/structs/acl.go#L276) |
| `Add` | `c *ACLCache[T]` | `key string, item T` | - | [L286](file:///d:/claude/nomad/nomad/structs/acl.go#L286) |
| `AddAtTime` | `c *ACLCache[T]` | `key string, item T, now time.Time` | - | [L290](file:///d:/claude/nomad/nomad/structs/acl.go#L290) |
| `NewACLCache` | - | `size int` | `*ACLCache[T]` | [L297](file:///d:/claude/nomad/nomad/structs/acl.go#L297) |
| `SetHash` | `a *ACLPolicy` | - | `[]byte` | [L330](file:///d:/claude/nomad/nomad/structs/acl.go#L330) |
| `Stub` | `a *ACLPolicy` | - | `*ACLPolicyListStub` | [L357](file:///d:/claude/nomad/nomad/structs/acl.go#L357) |
| `Validate` | `a *ACLPolicy` | - | `error` | [L368](file:///d:/claude/nomad/nomad/structs/acl.go#L368) |
| `GetID` | `a *ACLToken` | - | `string` | [L489](file:///d:/claude/nomad/nomad/structs/acl.go#L489) |
| `GetCreateIndex` | `a *ACLToken` | - | `uint64` | [L498](file:///d:/claude/nomad/nomad/structs/acl.go#L498) |
| `Copy` | `a *ACLToken` | - | `*ACLToken` | [L505](file:///d:/claude/nomad/nomad/structs/acl.go#L505) |
| `SetHash` | `a *ACLToken` | - | `[]byte` | [L538](file:///d:/claude/nomad/nomad/structs/acl.go#L538) |
| `Stub` | `a *ACLToken` | - | `*ACLTokenListStub, error` | [L572](file:///d:/claude/nomad/nomad/structs/acl.go#L572) |
| `Canonicalize` | `a *ACLToken` | - | - | [L729](file:///d:/claude/nomad/nomad/structs/acl.go#L729) |
| `Validate` | `a *ACLToken` | `minTTL time.Duration, maxTTL time.Duration, existing *ACLToken` | `error` | [L757](file:///d:/claude/nomad/nomad/structs/acl.go#L757) |
| `HasExpirationTime` | `a *ACLToken` | - | `bool` | [L830](file:///d:/claude/nomad/nomad/structs/acl.go#L830) |
| `IsExpired` | `a *ACLToken` | `t time.Time` | `bool` | [L840](file:///d:/claude/nomad/nomad/structs/acl.go#L840) |
| `HasRoles` | `a *ACLToken` | `roleIDs []string` | `bool` | [L860](file:///d:/claude/nomad/nomad/structs/acl.go#L860) |
| `MarshalJSON` | `a *ACLToken` | - | `[]byte, error` | [L877](file:///d:/claude/nomad/nomad/structs/acl.go#L877) |
| `UnmarshalJSON` | `a *ACLToken` | `data []byte` | `err error` | [L894](file:///d:/claude/nomad/nomad/structs/acl.go#L894) |
| `Sanitize` | `a *ACLToken` | - | `*ACLToken` | [L926](file:///d:/claude/nomad/nomad/structs/acl.go#L926) |
| `SetHash` | `a *ACLRole` | - | `[]byte` | [L982](file:///d:/claude/nomad/nomad/structs/acl.go#L982) |
| `Validate` | `a *ACLRole` | - | `error` | [L1009](file:///d:/claude/nomad/nomad/structs/acl.go#L1009) |
| `Canonicalize` | `a *ACLRole` | - | - | [L1031](file:///d:/claude/nomad/nomad/structs/acl.go#L1031) |
| `Equal` | `a *ACLRole` | `o *ACLRole` | `bool` | [L1039](file:///d:/claude/nomad/nomad/structs/acl.go#L1039) |
| `Copy` | `a *ACLRole` | - | `*ACLRole` | [L1054](file:///d:/claude/nomad/nomad/structs/acl.go#L1054) |
| `Stub` | `a *ACLRole` | - | `*ACLRoleListStub` | [L1069](file:///d:/claude/nomad/nomad/structs/acl.go#L1069) |
| `SetHash` | `a *ACLAuthMethod` | - | `[]byte` | [L1225](file:///d:/claude/nomad/nomad/structs/acl.go#L1225) |
| `MarshalJSON` | `a *ACLAuthMethod` | - | `[]byte, error` | [L1312](file:///d:/claude/nomad/nomad/structs/acl.go#L1312) |
| `UnmarshalJSON` | `a *ACLAuthMethod` | `data []byte` | `err error` | [L1329](file:///d:/claude/nomad/nomad/structs/acl.go#L1329) |
| `Stub` | `a *ACLAuthMethod` | - | `*ACLAuthMethodStub` | [L1353](file:///d:/claude/nomad/nomad/structs/acl.go#L1353) |
| `Equal` | `a *ACLAuthMethod` | `other *ACLAuthMethod` | `bool` | [L1364](file:///d:/claude/nomad/nomad/structs/acl.go#L1364) |
| `Copy` | `a *ACLAuthMethod` | - | `*ACLAuthMethod` | [L1380](file:///d:/claude/nomad/nomad/structs/acl.go#L1380) |
| `Canonicalize` | `a *ACLAuthMethod` | - | - | [L1395](file:///d:/claude/nomad/nomad/structs/acl.go#L1395) |
| `Merge` | `a *ACLAuthMethod` | `b *ACLAuthMethod` | - | [L1413](file:///d:/claude/nomad/nomad/structs/acl.go#L1413) |
| `Validate` | `a *ACLAuthMethod` | `minTTL time.Duration, maxTTL time.Duration` | `error` | [L1426](file:///d:/claude/nomad/nomad/structs/acl.go#L1426) |
| `Sanitize` | `a *ACLAuthMethod` | - | `*ACLAuthMethod` | [L1457](file:///d:/claude/nomad/nomad/structs/acl.go#L1457) |
| `TokenLocalityIsGlobal` | `a *ACLAuthMethod` | - | `bool` | [L1484](file:///d:/claude/nomad/nomad/structs/acl.go#L1484) |
| `Canonicalize` | `a *ACLAuthMethodConfig` | - | - | [L1560](file:///d:/claude/nomad/nomad/structs/acl.go#L1560) |
| `Validate` | `a *ACLAuthMethodConfig` | `methodType string` | `error` | [L1576](file:///d:/claude/nomad/nomad/structs/acl.go#L1576) |
| `Copy` | `a *ACLAuthMethodConfig` | - | `*ACLAuthMethodConfig` | [L1605](file:///d:/claude/nomad/nomad/structs/acl.go#L1605) |
| `MarshalJSON` | `a *ACLAuthMethodConfig` | - | `[]byte, error` | [L1627](file:///d:/claude/nomad/nomad/structs/acl.go#L1627) |
| `UnmarshalJSON` | `a *ACLAuthMethodConfig` | `data []byte` | `err error` | [L1654](file:///d:/claude/nomad/nomad/structs/acl.go#L1654) |
| `Copy` | `c *OIDCClientAssertion` | - | `*OIDCClientAssertion` | [L1735](file:///d:/claude/nomad/nomad/structs/acl.go#L1735) |
| `Canonicalize` | `c *OIDCClientAssertion` | - | - | [L1747](file:///d:/claude/nomad/nomad/structs/acl.go#L1747) |
| `IsSet` | `c *OIDCClientAssertion` | - | `bool` | [L1763](file:///d:/claude/nomad/nomad/structs/acl.go#L1763) |
| `Validate` | `c *OIDCClientAssertion` | - | `error` | [L1767](file:///d:/claude/nomad/nomad/structs/acl.go#L1767) |
| `Copy` | `k *OIDCClientAssertionKey` | - | `*OIDCClientAssertionKey` | [L1814](file:///d:/claude/nomad/nomad/structs/acl.go#L1814) |
| `Canonicalize` | `k *OIDCClientAssertionKey` | - | - | [L1823](file:///d:/claude/nomad/nomad/structs/acl.go#L1823) |
| `Validate` | `k *OIDCClientAssertionKey` | - | `error` | [L1849](file:///d:/claude/nomad/nomad/structs/acl.go#L1849) |
| `Canonicalize` | `a *ACLBindingRule` | - | - | [L2061](file:///d:/claude/nomad/nomad/structs/acl.go#L2061) |
| `Validate` | `a *ACLBindingRule` | - | `error` | [L2079](file:///d:/claude/nomad/nomad/structs/acl.go#L2079) |
| `Merge` | `a *ACLBindingRule` | `b *ACLBindingRule` | - | [L2122](file:///d:/claude/nomad/nomad/structs/acl.go#L2122) |
| `SetHash` | `a *ACLBindingRule` | - | `[]byte` | [L2131](file:///d:/claude/nomad/nomad/structs/acl.go#L2131) |
| `Equal` | `a *ACLBindingRule` | `other *ACLBindingRule` | `bool` | [L2156](file:///d:/claude/nomad/nomad/structs/acl.go#L2156) |
| `Copy` | `a *ACLBindingRule` | - | `*ACLBindingRule` | [L2171](file:///d:/claude/nomad/nomad/structs/acl.go#L2171) |
| `Stub` | `a *ACLBindingRule` | - | `*ACLBindingRuleListStub` | [L2185](file:///d:/claude/nomad/nomad/structs/acl.go#L2185) |
| `Validate` | `a *ACLOIDCAuthURLRequest` | - | `error` | [L2323](file:///d:/claude/nomad/nomad/structs/acl.go#L2323) |
| `Validate` | `a *ACLOIDCCompleteAuthRequest` | - | `error` | [L2373](file:///d:/claude/nomad/nomad/structs/acl.go#L2373) |
| `Validate` | `a *ACLLoginRequest` | - | `error` | [L2419](file:///d:/claude/nomad/nomad/structs/acl.go#L2419) |
| `Canonicalize` | `a *ACLCreateClientIntroductionTokenRequest` | - | - | [L2455](file:///d:/claude/nomad/nomad/structs/acl.go#L2455) |
| `IdentityTTL` | `a *ACLCreateClientIntroductionTokenRequest` | `logger hclog.Logger, serverDefault time.Duration, serverMax time.Duration` | `time.Duration` | [L2463](file:///d:/claude/nomad/nomad/structs/acl.go#L2463) |
| `MarshalJSON` | `a *ACLCreateClientIntroductionTokenRequest` | - | `[]byte, error` | [L2488](file:///d:/claude/nomad/nomad/structs/acl.go#L2488) |
| `UnmarshalJSON` | `a *ACLCreateClientIntroductionTokenRequest` | `data []byte` | `err error` | [L2505](file:///d:/claude/nomad/nomad/structs/acl.go#L2505) |

## 5. 核心方法详解

### Get()

**签名**：`func (e *ACLCacheEntry[T]) Get() T`

**位置**：[L276](file:///d:/claude/nomad/nomad/structs/acl.go#L276)

### Validate()

**签名**：`func (a *ACLPolicy) Validate() error`

**位置**：[L368](file:///d:/claude/nomad/nomad/structs/acl.go#L368)

### GetID()

**签名**：`func (a *ACLToken) GetID() string`

**位置**：[L489](file:///d:/claude/nomad/nomad/structs/acl.go#L489)

### GetCreateIndex()

**签名**：`func (a *ACLToken) GetCreateIndex() uint64`

**位置**：[L498](file:///d:/claude/nomad/nomad/structs/acl.go#L498)

### Validate()

**签名**：`func (a *ACLToken) Validate(minTTL time.Duration, maxTTL time.Duration, existing *ACLToken) error`

**位置**：[L757](file:///d:/claude/nomad/nomad/structs/acl.go#L757)

### Validate()

**签名**：`func (a *ACLRole) Validate() error`

**位置**：[L1009](file:///d:/claude/nomad/nomad/structs/acl.go#L1009)

### Validate()

**签名**：`func (a *ACLAuthMethod) Validate(minTTL time.Duration, maxTTL time.Duration) error`

**位置**：[L1426](file:///d:/claude/nomad/nomad/structs/acl.go#L1426)

### Validate()

**签名**：`func (a *ACLAuthMethodConfig) Validate(methodType string) error`

**位置**：[L1576](file:///d:/claude/nomad/nomad/structs/acl.go#L1576)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `oss.indeed.com/go/libtime` | 标准库 |
| `path` | 标准库 |
| `regexp` | 标准库 |
| `slices` | 标准库 |
| `strconv` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/acl` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/lib/lang` | 内部包 |
| `github.com/hashicorp/go-bexpr` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/hashicorp/golang-lru/v2` | 第三方库 |
| `golang.org/x/crypto/blake2b` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **ACL 集成**：集成访问控制列表，验证请求权限

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl_test.go](file:///d:/claude/nomad/nomad/structs/acl_test.go) | 对应测试文件 |

