# acl.go 代码说明文档

> 文件路径：[acl.go](file:///d:/claude/nomad/api/acl.go)
> 总行数：1323 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **ACL（访问控制列表）API 客户端**，提供 ACL Token、Policy、Role、Auth Method、Binding Rule 的 CRUD 操作，以及 OIDC/SAML 登录流程的客户端方法。

## 2. 类型定义

### ACLPolicies

**定义位置**：[L14](file:///d:/claude/nomad/api/acl.go#L14)

**类型**：struct

```go
	client *Client
```

**关联方法**（5 个）：`List`, `Upsert`, `Delete`, `Info`, `Self`

### ACLTokens

**定义位置**：[L81](file:///d:/claude/nomad/api/acl.go#L81)

**类型**：struct

```go
	client *Client
```

**关联方法**（11 个）：`Bootstrap`, `BootstrapOpts`, `List`, `Create`, `Upload`, `Update`, `Delete`, `Info`, `Self`, `UpsertOneTimeToken`, `ExchangeOneTimeToken`

### ACLRoles

**定义位置**：[L257](file:///d:/claude/nomad/api/acl.go#L257)

**类型**：struct

```go
	client *Client
```

**关联方法**（6 个）：`List`, `Create`, `Update`, `Delete`, `Get`, `GetByName`

### ACLAuthMethods

**定义位置**：[L341](file:///d:/claude/nomad/api/acl.go#L341)

**类型**：struct

```go
	client *Client
```

**关联方法**（5 个）：`List`, `Create`, `Update`, `Delete`, `Get`

### ACLBindingRules

**定义位置**：[L413](file:///d:/claude/nomad/api/acl.go#L413)

**类型**：struct

```go
	client *Client
```

**关联方法**（5 个）：`List`, `Create`, `Update`, `Delete`, `Get`

### ACLOIDC

**定义位置**：[L484](file:///d:/claude/nomad/api/acl.go#L484)

**类型**：struct

```go
	client *Client
	ACLAuth
```

### ACLAuth

**定义位置**：[L497](file:///d:/claude/nomad/api/acl.go#L497)

**类型**：struct

```go
	client *Client
```

**关联方法**（3 个）：`GetAuthURL`, `CompleteAuth`, `Login`

### ACLPolicyListStub

**定义位置**：[L540](file:///d:/claude/nomad/api/acl.go#L540)

**类型**：struct

```go
	Name string
	Description string
	JobACL *JobACL
	CreateIndex uint64
	ModifyIndex uint64
```

### ACLPolicy

**定义位置**：[L549](file:///d:/claude/nomad/api/acl.go#L549)

**类型**：struct

```go
	Name string
	Description string
	Rules string
	JobACL *JobACL
	CreateIndex uint64
	ModifyIndex uint64
```

### JobACL

**定义位置**：[L560](file:///d:/claude/nomad/api/acl.go#L560)

**类型**：struct

```go
	Namespace string
	JobID string
	Group string
	Task string
```

### ACLToken

**定义位置**：[L568](file:///d:/claude/nomad/api/acl.go#L568)

**类型**：struct

```go
	AccessorID string
	SecretID string
	Name string
	Type string
	Policies []string
	Roles []*ACLTokenRoleLink
	Global bool
	CreateTime time.Time
	ExpirationTime *time.Time `json:",omitempty"`
	ExpirationTTL time.Duration `json:",omitempty"`
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（2 个）：`MarshalJSON`, `UnmarshalJSON`

### ACLTokenRoleLink

**定义位置**：[L600](file:///d:/claude/nomad/api/acl.go#L600)

**类型**：struct

```go
	ID string
	Name string
```

### ACLTokenListStub

**定义位置**：[L658](file:///d:/claude/nomad/api/acl.go#L658)

**类型**：struct

```go
	AccessorID string
	Name string
	Type string
	Policies []string
	Roles []*ACLTokenRoleLink
	Global bool
	CreateTime time.Time
	ExpirationTime *time.Time `json:",omitempty"`
	CreateIndex uint64
	ModifyIndex uint64
```

### OneTimeToken

**定义位置**：[L676](file:///d:/claude/nomad/api/acl.go#L676)

**类型**：struct

```go
	OneTimeSecretID string
	AccessorID string
	ExpiresAt time.Time
	CreateIndex uint64
	ModifyIndex uint64
```

### OneTimeTokenUpsertResponse

**定义位置**：[L684](file:///d:/claude/nomad/api/acl.go#L684)

**类型**：struct

```go
	OneTimeToken *OneTimeToken
```

### OneTimeTokenExchangeRequest

**定义位置**：[L688](file:///d:/claude/nomad/api/acl.go#L688)

**类型**：struct

```go
	OneTimeSecretID string
```

### OneTimeTokenExchangeResponse

**定义位置**：[L692](file:///d:/claude/nomad/api/acl.go#L692)

**类型**：struct

```go
	Token *ACLToken
```

### BootstrapRequest

**定义位置**：[L697](file:///d:/claude/nomad/api/acl.go#L697)

**类型**：struct

```go
	BootstrapSecret string
```

### ACLRole

**定义位置**：[L704](file:///d:/claude/nomad/api/acl.go#L704)

**类型**：struct

```go
	ID string
	Name string
	Description string
	Policies []*ACLRolePolicyLink
	CreateIndex uint64
	ModifyIndex uint64
```

### ACLRolePolicyLink

**定义位置**：[L734](file:///d:/claude/nomad/api/acl.go#L734)

**类型**：struct

```go
	Name string
```

### ACLRoleListStub

**定义位置**：[L744](file:///d:/claude/nomad/api/acl.go#L744)

**类型**：struct

```go
	ID string
	Name string
	Description string
	Policies []*ACLRolePolicyLink
	CreateIndex uint64
	ModifyIndex uint64
```

### ACLAuthMethod

**定义位置**：[L773](file:///d:/claude/nomad/api/acl.go#L773)

**类型**：struct

```go
	Name string
	Type string
	TokenLocality string
	TokenNameFormat string
	MaxTokenTTL time.Duration
	Default bool
	Config *ACLAuthMethodConfig
	CreateTime time.Time
	ModifyTime time.Time
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（2 个）：`MarshalJSON`, `UnmarshalJSON`

### ACLAuthMethodConfig

**定义位置**：[L849](file:///d:/claude/nomad/api/acl.go#L849)

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

**关联方法**（2 个）：`MarshalJSON`, `UnmarshalJSON`

### OIDCClientAssertionKeySource

**定义位置**：[L992](file:///d:/claude/nomad/api/acl.go#L992)

**类型定义**：`string`

### OIDCClientAssertion

**定义位置**：[L1010](file:///d:/claude/nomad/api/acl.go#L1010)

**类型**：struct

```go
	Audience []string
	KeySource OIDCClientAssertionKeySource
	KeyAlgorithm string
	PrivateKey *OIDCClientAssertionKey
	ExtraHeaders map[string]string
```

### OIDCClientAssertionKeyIDHeader

**定义位置**：[L1043](file:///d:/claude/nomad/api/acl.go#L1043)

**类型定义**：`string`

### OIDCClientAssertionKey

**定义位置**：[L1061](file:///d:/claude/nomad/api/acl.go#L1061)

**类型**：struct

```go
	PemKey string
	PemKeyFile string
	KeyIDHeader OIDCClientAssertionKeyIDHeader
	KeyID string
	PemCert string
	PemCertFile string
```

### ACLAuthMethodListStub

**定义位置**：[L1105](file:///d:/claude/nomad/api/acl.go#L1105)

**类型**：struct

```go
	Name string
	Type string
	Default bool
	CreateIndex uint64
	ModifyIndex uint64
```

### ACLBindingRule

**定义位置**：[L1137](file:///d:/claude/nomad/api/acl.go#L1137)

**类型**：struct

```go
	ID string
	Description string
	AuthMethod string
	Selector string
	BindType string
	BindName string
	CreateTime time.Time
	ModifyTime time.Time
	CreateIndex uint64
	ModifyIndex uint64
```

### ACLBindingRuleListStub

**定义位置**：[L1194](file:///d:/claude/nomad/api/acl.go#L1194)

**类型**：struct

```go
	ID string
	Description string
	AuthMethod string
	CreateIndex uint64
	ModifyIndex uint64
```

### ACLOIDCAuthURLRequest

**定义位置**：[L1216](file:///d:/claude/nomad/api/acl.go#L1216)

**类型**：struct

```go
	AuthMethodName string
	RedirectURI string
	ClientNonce string
```

### ACLOIDCAuthURLResponse

**定义位置**：[L1234](file:///d:/claude/nomad/api/acl.go#L1234)

**类型**：struct

```go
	AuthURL string
```

### ACLOIDCCompleteAuthRequest

**定义位置**：[L1243](file:///d:/claude/nomad/api/acl.go#L1243)

**类型**：struct

```go
	AuthMethodName string
	ClientNonce string
	State string
	Code string
	Iss string
	RedirectURI string
```

### ACLLoginRequest

**定义位置**：[L1265](file:///d:/claude/nomad/api/acl.go#L1265)

**类型**：struct

```go
	AuthMethodName string
	LoginToken string
```

### ACLIdentity

**定义位置**：[L1274](file:///d:/claude/nomad/api/acl.go#L1274)

**类型**：struct

```go
	client *Client
```

**关联方法**（1 个）：`CreateClientIntroductionToken`

### ACLIdentityClientIntroductionTokenRequest

**定义位置**：[L1300](file:///d:/claude/nomad/api/acl.go#L1300)

**类型**：struct

```go
	TTL time.Duration
	NodeName string
	NodePool string
```

### ACLIdentityClientIntroductionTokenResponse

**定义位置**：[L1317](file:///d:/claude/nomad/api/acl.go#L1317)

**类型**：struct

```go
	JWT string
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `OIDCKeySourceNomad` | `"nomad"` |
| `OIDCKeySourcePrivateKey` | `"private_key"` |
| `OIDCKeySourceClientSecret` | `"client_secret"` |
| `OIDCClientAssertionHeaderKid` | `"kid"` |
| `OIDCClientAssertionHeaderX5t` | `"x5t"` |
| `OIDCClientAssertionHeaderX5tS256` | `"x5t#S256"` |
| `ACLAuthMethodTokenLocalityLocal` | `"local"` |
| `ACLAuthMethodTokenLocalityGlobal` | `"global"` |
| `ACLAuthMethodTypeOIDC` | `"OIDC"` |
| `ACLAuthMethodTypeJWT` | `"JWT"` |
| `ACLBindingRuleBindTypeRole` | `"role"` |
| `ACLBindingRuleBindTypePolicy` | `"policy"` |
| `ACLBindingRuleBindTypeManagement` | `"management"` |

### 变量

| 名称 | 值 |
|------|----|
| `errMissingACLRoleID` | `*ast.CallExpr` |
| `errMissingACLAuthMethodName` | `*ast.CallExpr` |
| `errMissingACLBindingRuleID` | `*ast.CallExpr` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ACLPolicies` | `c *Client` | - | `*ACLPolicies` | [L19](file:///d:/claude/nomad/api/acl.go#L19) |
| `List` | `a *ACLPolicies` | `q *QueryOptions` | `[]*ACLPolicyListStub, *QueryMeta, error` | [L24](file:///d:/claude/nomad/api/acl.go#L24) |
| `Upsert` | `a *ACLPolicies` | `policy *ACLPolicy, q *WriteOptions` | `*WriteMeta, error` | [L34](file:///d:/claude/nomad/api/acl.go#L34) |
| `Delete` | `a *ACLPolicies` | `policyName string, q *WriteOptions` | `*WriteMeta, error` | [L46](file:///d:/claude/nomad/api/acl.go#L46) |
| `Info` | `a *ACLPolicies` | `policyName string, q *QueryOptions` | `*ACLPolicy, *QueryMeta, error` | [L58](file:///d:/claude/nomad/api/acl.go#L58) |
| `Self` | `a *ACLPolicies` | `q *QueryOptions` | `[]*ACLPolicyListStub, *QueryMeta, error` | [L71](file:///d:/claude/nomad/api/acl.go#L71) |
| `ACLTokens` | `c *Client` | - | `*ACLTokens` | [L86](file:///d:/claude/nomad/api/acl.go#L86) |
| `Bootstrap` | `a *ACLTokens` | `q *WriteOptions` | `*ACLToken, *WriteMeta, error` | [L93](file:///d:/claude/nomad/api/acl.go#L93) |
| `BootstrapOpts` | `a *ACLTokens` | `btoken string, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | [L103](file:///d:/claude/nomad/api/acl.go#L103) |
| `List` | `a *ACLTokens` | `q *QueryOptions` | `[]*ACLTokenListStub, *QueryMeta, error` | [L120](file:///d:/claude/nomad/api/acl.go#L120) |
| `Create` | `a *ACLTokens` | `token *ACLToken, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | [L131](file:///d:/claude/nomad/api/acl.go#L131) |
| `Upload` | `a *ACLTokens` | `token *ACLToken, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | [L145](file:///d:/claude/nomad/api/acl.go#L145) |
| `Update` | `a *ACLTokens` | `token *ACLToken, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | [L164](file:///d:/claude/nomad/api/acl.go#L164) |
| `Delete` | `a *ACLTokens` | `accessorID string, q *WriteOptions` | `*WriteMeta, error` | [L178](file:///d:/claude/nomad/api/acl.go#L178) |
| `Info` | `a *ACLTokens` | `accessorID string, q *QueryOptions` | `*ACLToken, *QueryMeta, error` | [L190](file:///d:/claude/nomad/api/acl.go#L190) |
| `Self` | `a *ACLTokens` | `q *QueryOptions` | `*ACLToken, *QueryMeta, error` | [L203](file:///d:/claude/nomad/api/acl.go#L203) |
| `UpsertOneTimeToken` | `a *ACLTokens` | `q *WriteOptions` | `*OneTimeToken, *WriteMeta, error` | [L213](file:///d:/claude/nomad/api/acl.go#L213) |
| `ExchangeOneTimeToken` | `a *ACLTokens` | `secret string, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | [L226](file:///d:/claude/nomad/api/acl.go#L226) |
| `ACLRoles` | `c *Client` | - | `*ACLRoles` | [L262](file:///d:/claude/nomad/api/acl.go#L262) |
| `List` | `a *ACLRoles` | `q *QueryOptions` | `[]*ACLRoleListStub, *QueryMeta, error` | [L267](file:///d:/claude/nomad/api/acl.go#L267) |
| `Create` | `a *ACLRoles` | `role *ACLRole, w *WriteOptions` | `*ACLRole, *WriteMeta, error` | [L277](file:///d:/claude/nomad/api/acl.go#L277) |
| `Update` | `a *ACLRoles` | `role *ACLRole, w *WriteOptions` | `*ACLRole, *WriteMeta, error` | [L290](file:///d:/claude/nomad/api/acl.go#L290) |
| `Delete` | `a *ACLRoles` | `roleID string, w *WriteOptions` | `*WriteMeta, error` | [L303](file:///d:/claude/nomad/api/acl.go#L303) |
| `Get` | `a *ACLRoles` | `roleID string, q *QueryOptions` | `*ACLRole, *QueryMeta, error` | [L315](file:///d:/claude/nomad/api/acl.go#L315) |
| `GetByName` | `a *ACLRoles` | `roleName string, q *QueryOptions` | `*ACLRole, *QueryMeta, error` | [L328](file:///d:/claude/nomad/api/acl.go#L328) |
| `ACLAuthMethods` | `c *Client` | - | `*ACLAuthMethods` | [L346](file:///d:/claude/nomad/api/acl.go#L346) |
| `List` | `a *ACLAuthMethods` | `q *QueryOptions` | `[]*ACLAuthMethodListStub, *QueryMeta, error` | [L352](file:///d:/claude/nomad/api/acl.go#L352) |
| `Create` | `a *ACLAuthMethods` | `authMethod *ACLAuthMethod, w *WriteOptions` | `*ACLAuthMethod, *WriteMeta, error` | [L362](file:///d:/claude/nomad/api/acl.go#L362) |
| `Update` | `a *ACLAuthMethods` | `authMethod *ACLAuthMethod, w *WriteOptions` | `*ACLAuthMethod, *WriteMeta, error` | [L375](file:///d:/claude/nomad/api/acl.go#L375) |
| `Delete` | `a *ACLAuthMethods` | `authMethodName string, w *WriteOptions` | `*WriteMeta, error` | [L388](file:///d:/claude/nomad/api/acl.go#L388) |
| `Get` | `a *ACLAuthMethods` | `authMethodName string, q *QueryOptions` | `*ACLAuthMethod, *QueryMeta, error` | [L400](file:///d:/claude/nomad/api/acl.go#L400) |
| `ACLBindingRules` | `c *Client` | - | `*ACLBindingRules` | [L418](file:///d:/claude/nomad/api/acl.go#L418) |
| `List` | `a *ACLBindingRules` | `q *QueryOptions` | `[]*ACLBindingRuleListStub, *QueryMeta, error` | [L424](file:///d:/claude/nomad/api/acl.go#L424) |
| `Create` | `a *ACLBindingRules` | `bindingRule *ACLBindingRule, w *WriteOptions` | `*ACLBindingRule, *WriteMeta, error` | [L434](file:///d:/claude/nomad/api/acl.go#L434) |
| `Update` | `a *ACLBindingRules` | `bindingRule *ACLBindingRule, w *WriteOptions` | `*ACLBindingRule, *WriteMeta, error` | [L444](file:///d:/claude/nomad/api/acl.go#L444) |
| `Delete` | `a *ACLBindingRules` | `bindingRuleID string, w *WriteOptions` | `*WriteMeta, error` | [L457](file:///d:/claude/nomad/api/acl.go#L457) |
| `Get` | `a *ACLBindingRules` | `bindingRuleID string, q *QueryOptions` | `*ACLBindingRule, *QueryMeta, error` | [L469](file:///d:/claude/nomad/api/acl.go#L469) |
| `ACLOIDC` | `c *Client` | - | `*ACLOIDC` | [L492](file:///d:/claude/nomad/api/acl.go#L492) |
| `ACLAuth` | `c *Client` | - | `*ACLAuth` | [L502](file:///d:/claude/nomad/api/acl.go#L502) |
| `GetAuthURL` | `a *ACLAuth` | `req *ACLOIDCAuthURLRequest, q *WriteOptions` | `*ACLOIDCAuthURLResponse, *WriteMeta, error` | [L508](file:///d:/claude/nomad/api/acl.go#L508) |
| `CompleteAuth` | `a *ACLAuth` | `req *ACLOIDCCompleteAuthRequest, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | [L519](file:///d:/claude/nomad/api/acl.go#L519) |
| `Login` | `a *ACLAuth` | `req *ACLLoginRequest, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | [L530](file:///d:/claude/nomad/api/acl.go#L530) |
| `MarshalJSON` | `a *ACLToken` | - | `[]byte, error` | [L613](file:///d:/claude/nomad/api/acl.go#L613) |
| `UnmarshalJSON` | `a *ACLToken` | `data []byte` | `err error` | [L630](file:///d:/claude/nomad/api/acl.go#L630) |
| `MarshalJSON` | `m *ACLAuthMethod` | - | `[]byte, error` | [L811](file:///d:/claude/nomad/api/acl.go#L811) |
| `UnmarshalJSON` | `m *ACLAuthMethod` | `data []byte` | `error` | [L828](file:///d:/claude/nomad/api/acl.go#L828) |
| `MarshalJSON` | `c *ACLAuthMethodConfig` | - | `[]byte, error` | [L904](file:///d:/claude/nomad/api/acl.go#L904) |
| `UnmarshalJSON` | `c *ACLAuthMethodConfig` | `data []byte` | `error` | [L931](file:///d:/claude/nomad/api/acl.go#L931) |
| `ACLIdentity` | `c *Client` | - | `*ACLIdentity` | [L1279](file:///d:/claude/nomad/api/acl.go#L1279) |
| `CreateClientIntroductionToken` | `a *ACLIdentity` | `req *ACLIdentityClientIntroductionTokenRequest, writeOpts *WriteOptions` | `*ACLIdentityClientIntroductionTokenResponse, *WriteMeta,...` | [L1285](file:///d:/claude/nomad/api/acl.go#L1285) |

## 5. 核心方法详解

该文件定义 6 个 ACL 子客户端：`ACLPolicies`、`ACLTokens`、`ACLRoles`、`ACLAuthMethods`、`ACLBindingRules`、`ACLOIDC`/`ACLAuth`。每个子客户端通过 `Client` 的方法获取（如 `c.ACLTokens()`），提供对应资源的 CRUD 操作。

### ACLPolicies 子客户端

**位置**：[L19-L83](file:///d:/claude/nomad/api/acl.go#L19)

| 方法 | HTTP | 路径 | 功能 |
|------|------|------|------|
| `List` | GET | `/v1/acl/policies` | 列出所有策略（精简 stub） |
| `Upsert` | PUT | `/v1/acl/policy/{name}` | 创建或更新策略 |
| `Delete` | DELETE | `/v1/acl/policy/{name}` | 删除策略 |
| `Info` | GET | `/v1/acl/policy/{name}` | 查询策略详情 |
| `Self` | GET | `/v1/acl/policies/own` | 列出当前 Token 关联的策略 |

---

### ACLTokens 子客户端

**位置**：[L86-L260](file:///d:/claude/nomad/api/acl.go#L86)

| 方法 | HTTP | 路径 | 功能 |
|------|------|------|------|
| `Bootstrap` | POST | `/v1/acl/bootstrap` | 初始化 bootstrap token（集群首次启用 ACL） |
| `BootstrapOpts` | POST | `/v1/acl/bootstrap` | 用指定 bootstrap secret 初始化 |
| `List` | GET | `/v1/acl/tokens` | 列出所有 token |
| `Create` | POST | `/v1/acl/token` | 创建 token（服务器生成 SecretID） |
| `Upload` | PUT | `/v1/acl/token` | 上传 token（客户端提供 SecretID） |
| `Update` | PUT | `/v1/acl/token/{accessorID}` | 更新 token |
| `Delete` | DELETE | `/v1/acl/token/{accessorID}` | 删除 token |
| `Info` | GET | `/v1/acl/token/{accessorID}` | 按 AccessorID 查询 |
| `Self` | GET | `/v1/acl/token/self` | 查询当前 Token 自身信息 |
| `UpsertOneTimeToken` | POST | `/v1/acl/token/onetime` | 创建一次性 token（短有效期） |
| `ExchangeOneTimeToken` | POST | `/v1/acl/token/onetime/exchange` | 用一次性 secret 换取持久 token |

**Bootstrap 与 Create 区别**：
- `Bootstrap`：集群从未启用 ACL 时调用，返回带管理权限的 bootstrap token。每个集群只能成功调用一次。
- `Create`：已有管理 token 后，创建普通 token。`Create` 不返回 `SecretID`（需从响应体获取），`Upload` 允许客户端指定 `SecretID`。

**OneTimeToken 机制**：用于 CLI 登录流程——用户在浏览器登录后获得一次性 secret，CLI 用它交换持久 token，避免 secret 在 URL/日志中泄露。

---

### ACLRoles 子客户端

**位置**：[L262-L343](file:///d:/claude/nomad/api/acl.go#L262)

| 方法 | HTTP | 路径 | 功能 |
|------|------|------|------|
| `List` | GET | `/v1/acl/roles` | 列出角色 |
| `Create` | POST | `/v1/acl/role` | 创建角色 |
| `Update` | PUT | `/v1/acl/role/{id}` | 更新角色 |
| `Delete` | DELETE | `/v1/acl/role/{id}` | 删除角色 |
| `Get` | GET | `/v1/acl/role/{id}` | 按 ID 查询 |
| `GetByName` | GET | `/v1/acl/role/name/{name}` | 按名称查询 |

**角色模型**：角色是策略的集合，可关联多个 `ACLRolePolicy`（含 `PolicyID`/`PolicyName`）。Token 可通过角色继承策略，简化权限管理。

---

### ACLAuthMethods 子客户端

**位置**：[L346-L416](file:///d:/claude/nomad/api/acl.go#L346)

| 方法 | HTTP | 路径 | 功能 |
|------|------|------|------|
| `List` | GET | `/v1/acl/auth-methods` | 列出认证方法 |
| `Create` | POST | `/v1/acl/auth-method` | 创建（OIDC/AzureAD） |
| `Update` | PUT | `/v1/acl/auth-method/{name}` | 更新 |
| `Delete` | DELETE | `/v1/acl/auth-method/{name}` | 删除 |
| `Get` | GET | `/v1/acl/auth-method/{name}` | 查询 |

---

### ACLBindingRules 子客户端

**位置**：[L418-L489](file:///d:/claude/nomad/api/acl.go#L418)

| 方法 | HTTP | 路径 | 功能 |
|------|------|------|------|
| `List` | GET | `/v1/acl/binding-rules` | 列出绑定规则 |
| `Create` | POST | `/v1/acl/binding-rule` | 创建 |
| `Update` | PUT | `/v1/acl/binding-rule/{id}` | 更新 |
| `Delete` | DELETE | `/v1/acl/binding-rule/{id}` | 删除 |
| `Get` | GET | `/v1/acl/binding-rule/{id}` | 查询 |

**绑定规则**：将认证方法的用户属性（如组、声明）映射到角色或策略，实现 SSO 自动授权。

---

### ACLOIDC / ACLAuth 子客户端（SSO 登录流程）

**位置**：[L492-L560](file:///d:/claude/nomad/api/acl.go#L492)

| 方法 | HTTP | 路径 | 功能 |
|------|------|------|------|
| `GetAuthURL` | POST | `/v1/acl/oidc/auth-url` | 获取 OIDC 授权 URL |
| `Exchange` | POST | `/v1/acl/oidc/complete-auth` | 用授权码交换 token |
| `Login` | POST | `/v1/acl/login` | 用户名密码登录（非 OIDC） |

**OIDC 登录流程**：
1. `GetAuthURL(req)` → 返回 `AuthURL`，用户浏览器跳转
2. IdP 认证后回调 Nomad，携带授权码
3. `Exchange(req)` 用授权码换取 Nomad ACL token

---

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl_test.go](file:///d:/claude/nomad/api/acl_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

