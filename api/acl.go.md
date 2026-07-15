# acl.go 代码说明文档

> 文件路径：[api/acl.go](file:///d:/claude/nomad/api/acl.go)
> 总行数：1323 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `acl.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### ACLPolicies

**定义位置**：[L14](file:///d:/claude/nomad/api/acl.go#L14)

**中文说明**：ACLPolicies 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLPolicies struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（5 个）：`List`, `Upsert`, `Delete`, `Info`, `Self`

### ACLTokens

**定义位置**：[L81](file:///d:/claude/nomad/api/acl.go#L81)

**中文说明**：ACLTokens 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLTokens struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（11 个）：`Bootstrap`, `BootstrapOpts`, `List`, `Create`, `Upload`, `Update`, `Delete`, `Info`, `Self`, `UpsertOneTimeToken`, `ExchangeOneTimeToken`

### ACLRoles

**定义位置**：[L257](file:///d:/claude/nomad/api/acl.go#L257)

**中文说明**：ACLRoles 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLRoles struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（6 个）：`List`, `Create`, `Update`, `Delete`, `Get`, `GetByName`

### ACLAuthMethods

**定义位置**：[L341](file:///d:/claude/nomad/api/acl.go#L341)

**中文说明**：ACLAuthMethods 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLAuthMethods struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（5 个）：`List`, `Create`, `Update`, `Delete`, `Get`

### ACLBindingRules

**定义位置**：[L413](file:///d:/claude/nomad/api/acl.go#L413)

**中文说明**：ACLBindingRules 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLBindingRules struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（5 个）：`List`, `Create`, `Update`, `Delete`, `Get`

### ACLOIDC

**定义位置**：[L484](file:///d:/claude/nomad/api/acl.go#L484)

**中文说明**：ACLOIDC 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLOIDC struct {
	client *Client
	ACLAuth ACLAuth
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |
| `ACLAuth` | `ACLAuth` | — |

### ACLAuth

**定义位置**：[L497](file:///d:/claude/nomad/api/acl.go#L497)

**中文说明**：ACLAuth 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLAuth struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（3 个）：`GetAuthURL`, `CompleteAuth`, `Login`

### ACLPolicyListStub

**定义位置**：[L540](file:///d:/claude/nomad/api/acl.go#L540)

**中文说明**：ACLPolicyListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type ACLPolicyListStub struct {
	Name string
	Description string
	JobACL *JobACL
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Description` | `string` | 描述信息 |
| `JobACL` | `*JobACL` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### ACLPolicy

**定义位置**：[L549](file:///d:/claude/nomad/api/acl.go#L549)

**中文说明**：ACLPolicy 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLPolicy struct {
	Name string
	Description string
	Rules string
	JobACL *JobACL
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Description` | `string` | 描述信息 |
| `Rules` | `string` | 字符串 |
| `JobACL` | `*JobACL` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### JobACL

**定义位置**：[L560](file:///d:/claude/nomad/api/acl.go#L560)

**中文说明**：JobACL 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobACL struct {
	Namespace string
	JobID string
	Group string
	Task string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string` | 命名空间 |
| `JobID` | `string` | 字符串 |
| `Group` | `string` | 字符串 |
| `Task` | `string` | 字符串 |

### ACLToken

**定义位置**：[L568](file:///d:/claude/nomad/api/acl.go#L568)

**中文说明**：ACLToken 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLToken struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AccessorID` | `string` | 字符串 |
| `SecretID` | `string` | 字符串 |
| `Name` | `string` | 名称 |
| `Type` | `string` | 类型 |
| `Policies` | `[]string` | 列表 |
| `Roles` | `[]*ACLTokenRoleLink` | 列表 |
| `Global` | `bool` | 布尔值 |
| `CreateTime` | `time.Time` | 时间点 |
| `ExpirationTime` | `*time.Time `json:",omitempty"`` | 时间点 |
| `ExpirationTTL` | `time.Duration `json:",omitempty"`` | 时间间隔 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（2 个）：`MarshalJSON`, `UnmarshalJSON`

### ACLTokenRoleLink

**定义位置**：[L600](file:///d:/claude/nomad/api/acl.go#L600)

**中文说明**：ACLTokenRoleLink 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLTokenRoleLink struct {
	ID string
	Name string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Name` | `string` | 名称 |

### ACLTokenListStub

**定义位置**：[L658](file:///d:/claude/nomad/api/acl.go#L658)

**中文说明**：ACLTokenListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type ACLTokenListStub struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AccessorID` | `string` | 字符串 |
| `Name` | `string` | 名称 |
| `Type` | `string` | 类型 |
| `Policies` | `[]string` | 列表 |
| `Roles` | `[]*ACLTokenRoleLink` | 列表 |
| `Global` | `bool` | 布尔值 |
| `CreateTime` | `time.Time` | 时间点 |
| `ExpirationTime` | `*time.Time `json:",omitempty"`` | 时间点 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### OneTimeToken

**定义位置**：[L676](file:///d:/claude/nomad/api/acl.go#L676)

**中文说明**：OneTimeToken 与令牌（Token）相关，用于身份认证。

**类型**：struct

```go
type OneTimeToken struct {
	OneTimeSecretID string
	AccessorID string
	ExpiresAt time.Time
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `OneTimeSecretID` | `string` | 字符串 |
| `AccessorID` | `string` | 字符串 |
| `ExpiresAt` | `time.Time` | 时间点 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### OneTimeTokenUpsertResponse

**定义位置**：[L684](file:///d:/claude/nomad/api/acl.go#L684)

**中文说明**：OneTimeTokenUpsertResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type OneTimeTokenUpsertResponse struct {
	OneTimeToken *OneTimeToken
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `OneTimeToken` | `*OneTimeToken` | — |

### OneTimeTokenExchangeRequest

**定义位置**：[L688](file:///d:/claude/nomad/api/acl.go#L688)

**中文说明**：OneTimeTokenExchangeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type OneTimeTokenExchangeRequest struct {
	OneTimeSecretID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `OneTimeSecretID` | `string` | 字符串 |

### OneTimeTokenExchangeResponse

**定义位置**：[L692](file:///d:/claude/nomad/api/acl.go#L692)

**中文说明**：OneTimeTokenExchangeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type OneTimeTokenExchangeResponse struct {
	Token *ACLToken
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Token` | `*ACLToken` | 令牌，用于认证或标识 |

### BootstrapRequest

**定义位置**：[L697](file:///d:/claude/nomad/api/acl.go#L697)

**中文说明**：BootstrapRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type BootstrapRequest struct {
	BootstrapSecret string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `BootstrapSecret` | `string` | 字符串 |

### ACLRole

**定义位置**：[L704](file:///d:/claude/nomad/api/acl.go#L704)

**中文说明**：ACLRole 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLRole struct {
	ID string
	Name string
	Description string
	Policies []*ACLRolePolicyLink
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Name` | `string` | 名称 |
| `Description` | `string` | 描述信息 |
| `Policies` | `[]*ACLRolePolicyLink` | 列表 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### ACLRolePolicyLink

**定义位置**：[L734](file:///d:/claude/nomad/api/acl.go#L734)

**中文说明**：ACLRolePolicyLink 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLRolePolicyLink struct {
	Name string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |

### ACLRoleListStub

**定义位置**：[L744](file:///d:/claude/nomad/api/acl.go#L744)

**中文说明**：ACLRoleListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type ACLRoleListStub struct {
	ID string
	Name string
	Description string
	Policies []*ACLRolePolicyLink
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Name` | `string` | 名称 |
| `Description` | `string` | 描述信息 |
| `Policies` | `[]*ACLRolePolicyLink` | 列表 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### ACLAuthMethod

**定义位置**：[L773](file:///d:/claude/nomad/api/acl.go#L773)

**中文说明**：ACLAuthMethod 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLAuthMethod struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Type` | `string` | 类型 |
| `TokenLocality` | `string` | 字符串 |
| `TokenNameFormat` | `string` | 字符串 |
| `MaxTokenTTL` | `time.Duration` | 时间间隔 |
| `Default` | `bool` | 布尔值 |
| `Config` | `*ACLAuthMethodConfig` | 配置 |
| `CreateTime` | `time.Time` | 时间点 |
| `ModifyTime` | `time.Time` | 时间点 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（2 个）：`MarshalJSON`, `UnmarshalJSON`

### ACLAuthMethodConfig

**定义位置**：[L849](file:///d:/claude/nomad/api/acl.go#L849)

**中文说明**：ACLAuthMethodConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type ACLAuthMethodConfig struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JWTValidationPubKeys` | `[]string` | 列表 |
| `JWKSURL` | `string` | 字符串 |
| `OIDCDiscoveryURL` | `string` | 字符串 |
| `OIDCClientID` | `string` | 字符串 |
| `OIDCClientSecret` | `string` | 字符串 |
| `OIDCClientAssertion` | `*OIDCClientAssertion` | — |
| `OIDCEnablePKCE` | `bool` | 布尔值 |
| `OIDCDisableUserInfo` | `bool` | 布尔值 |
| `OIDCScopes` | `[]string` | 列表 |
| `BoundAudiences` | `[]string` | 列表 |
| `BoundIssuer` | `[]string` | 列表 |
| `AllowedRedirectURIs` | `[]string` | 列表 |
| `DiscoveryCaPem` | `[]string` | 列表 |
| `JWKSCACert` | `string` | 字符串 |
| `SigningAlgs` | `[]string` | 列表 |
| `ExpirationLeeway` | `time.Duration` | 时间间隔 |
| `NotBeforeLeeway` | `time.Duration` | 时间间隔 |
| `ClockSkewLeeway` | `time.Duration` | 时间间隔 |
| `ClaimMappings` | `map[string]string` | 映射表 |
| `ListClaimMappings` | `map[string]string` | 映射表 |
| `VerboseLogging` | `bool` | 布尔值 |

**关联方法**（2 个）：`MarshalJSON`, `UnmarshalJSON`

### OIDCClientAssertionKeySource

**定义位置**：[L992](file:///d:/claude/nomad/api/acl.go#L992)

**类型定义**：`type OIDCClientAssertionKeySource string`

### OIDCClientAssertion

**定义位置**：[L1010](file:///d:/claude/nomad/api/acl.go#L1010)

**中文说明**：OIDCClientAssertion 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type OIDCClientAssertion struct {
	Audience []string
	KeySource OIDCClientAssertionKeySource
	KeyAlgorithm string
	PrivateKey *OIDCClientAssertionKey
	ExtraHeaders map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Audience` | `[]string` | 列表 |
| `KeySource` | `OIDCClientAssertionKeySource` | — |
| `KeyAlgorithm` | `string` | 字符串 |
| `PrivateKey` | `*OIDCClientAssertionKey` | — |
| `ExtraHeaders` | `map[string]string` | 映射表 |

### OIDCClientAssertionKeyIDHeader

**定义位置**：[L1043](file:///d:/claude/nomad/api/acl.go#L1043)

**类型定义**：`type OIDCClientAssertionKeyIDHeader string`

### OIDCClientAssertionKey

**定义位置**：[L1061](file:///d:/claude/nomad/api/acl.go#L1061)

**中文说明**：OIDCClientAssertionKey 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type OIDCClientAssertionKey struct {
	PemKey string
	PemKeyFile string
	KeyIDHeader OIDCClientAssertionKeyIDHeader
	KeyID string
	PemCert string
	PemCertFile string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PemKey` | `string` | 字符串 |
| `PemKeyFile` | `string` | 字符串 |
| `KeyIDHeader` | `OIDCClientAssertionKeyIDHeader` | — |
| `KeyID` | `string` | 字符串 |
| `PemCert` | `string` | 字符串 |
| `PemCertFile` | `string` | 字符串 |

### ACLAuthMethodListStub

**定义位置**：[L1105](file:///d:/claude/nomad/api/acl.go#L1105)

**中文说明**：ACLAuthMethodListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type ACLAuthMethodListStub struct {
	Name string
	Type string
	Default bool
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Type` | `string` | 类型 |
| `Default` | `bool` | 布尔值 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### ACLBindingRule

**定义位置**：[L1137](file:///d:/claude/nomad/api/acl.go#L1137)

**中文说明**：ACLBindingRule 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLBindingRule struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Description` | `string` | 描述信息 |
| `AuthMethod` | `string` | 字符串 |
| `Selector` | `string` | 字符串 |
| `BindType` | `string` | 字符串 |
| `BindName` | `string` | 字符串 |
| `CreateTime` | `time.Time` | 时间点 |
| `ModifyTime` | `time.Time` | 时间点 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### ACLBindingRuleListStub

**定义位置**：[L1194](file:///d:/claude/nomad/api/acl.go#L1194)

**中文说明**：ACLBindingRuleListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type ACLBindingRuleListStub struct {
	ID string
	Description string
	AuthMethod string
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Description` | `string` | 描述信息 |
| `AuthMethod` | `string` | 字符串 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### ACLOIDCAuthURLRequest

**定义位置**：[L1216](file:///d:/claude/nomad/api/acl.go#L1216)

**中文说明**：ACLOIDCAuthURLRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLOIDCAuthURLRequest struct {
	AuthMethodName string
	RedirectURI string
	ClientNonce string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AuthMethodName` | `string` | 字符串 |
| `RedirectURI` | `string` | 字符串 |
| `ClientNonce` | `string` | 字符串 |

### ACLOIDCAuthURLResponse

**定义位置**：[L1234](file:///d:/claude/nomad/api/acl.go#L1234)

**中文说明**：ACLOIDCAuthURLResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLOIDCAuthURLResponse struct {
	AuthURL string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AuthURL` | `string` | 字符串 |

### ACLOIDCCompleteAuthRequest

**定义位置**：[L1243](file:///d:/claude/nomad/api/acl.go#L1243)

**中文说明**：ACLOIDCCompleteAuthRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLOIDCCompleteAuthRequest struct {
	AuthMethodName string
	ClientNonce string
	State string
	Code string
	Iss string
	RedirectURI string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AuthMethodName` | `string` | 字符串 |
| `ClientNonce` | `string` | 字符串 |
| `State` | `string` | 状态 |
| `Code` | `string` | 字符串 |
| `Iss` | `string` | 字符串 |
| `RedirectURI` | `string` | 字符串 |

### ACLLoginRequest

**定义位置**：[L1265](file:///d:/claude/nomad/api/acl.go#L1265)

**中文说明**：ACLLoginRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLLoginRequest struct {
	AuthMethodName string
	LoginToken string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AuthMethodName` | `string` | 字符串 |
| `LoginToken` | `string` | 字符串 |

### ACLIdentity

**定义位置**：[L1274](file:///d:/claude/nomad/api/acl.go#L1274)

**中文说明**：ACLIdentity 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLIdentity struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（1 个）：`CreateClientIntroductionToken`

### ACLIdentityClientIntroductionTokenRequest

**定义位置**：[L1300](file:///d:/claude/nomad/api/acl.go#L1300)

**中文说明**：ACLIdentityClientIntroductionTokenRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLIdentityClientIntroductionTokenRequest struct {
	TTL time.Duration
	NodeName string
	NodePool string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TTL` | `time.Duration` | 生存时间（TTL） |
| `NodeName` | `string` | 字符串 |
| `NodePool` | `string` | 字符串 |

### ACLIdentityClientIntroductionTokenResponse

**定义位置**：[L1317](file:///d:/claude/nomad/api/acl.go#L1317)

**中文说明**：ACLIdentityClientIntroductionTokenResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLIdentityClientIntroductionTokenResponse struct {
	JWT string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JWT` | `string` | 字符串 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `OIDCKeySourceNomad` | `OIDCClientAssertionKeySource` | `"nomad"` | — |
| `OIDCKeySourcePrivateKey` | `OIDCClientAssertionKeySource` | `"private_key"` | — |
| `OIDCKeySourceClientSecret` | `OIDCClientAssertionKeySource` | `"client_secret"` | — |
| `OIDCClientAssertionHeaderKid` | `OIDCClientAssertionKeyIDHeader` | `"kid"` | — |
| `OIDCClientAssertionHeaderX5t` | `OIDCClientAssertionKeyIDHeader` | `"x5t"` | — |
| `OIDCClientAssertionHeaderX5tS256` | `OIDCClientAssertionKeyIDHeader` | `"x5t#S256"` | — |
| `ACLAuthMethodTokenLocalityLocal` | `—` | `"local"` | — |
| `ACLAuthMethodTokenLocalityGlobal` | `—` | `"global"` | — |
| `ACLAuthMethodTypeOIDC` | `—` | `"OIDC"` | — |
| `ACLAuthMethodTypeJWT` | `—` | `"JWT"` | — |
| `ACLBindingRuleBindTypeRole` | `—` | `"role"` | — |
| `ACLBindingRuleBindTypePolicy` | `—` | `"policy"` | — |
| `ACLBindingRuleBindTypeManagement` | `—` | `"management"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `errMissingACLRoleID` | `—` | `errors.New("missing ACL role ID")` | — |
| `errMissingACLAuthMethodName` | `—` | `errors.New("missing ACL auth-method name")` | — |
| `errMissingACLBindingRuleID` | `—` | `errors.New("missing ACL binding rule ID")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ACLPolicies` | `c *Client` | `` | `*ACLPolicies` | [L19](file:///d:/claude/nomad/api/acl.go#L19) |
| `List` | `a *ACLPolicies` | `q *QueryOptions` | `[]*ACLPolicyListStub, *QueryMeta, error` | [L24](file:///d:/claude/nomad/api/acl.go#L24) |
| `Upsert` | `a *ACLPolicies` | `policy *ACLPolicy, q *WriteOptions` | `*WriteMeta, error` | [L34](file:///d:/claude/nomad/api/acl.go#L34) |
| `Delete` | `a *ACLPolicies` | `policyName string, q *WriteOptions` | `*WriteMeta, error` | [L46](file:///d:/claude/nomad/api/acl.go#L46) |
| `Info` | `a *ACLPolicies` | `policyName string, q *QueryOptions` | `*ACLPolicy, *QueryMeta, error` | [L58](file:///d:/claude/nomad/api/acl.go#L58) |
| `Self` | `a *ACLPolicies` | `q *QueryOptions` | `[]*ACLPolicyListStub, *QueryMeta, error` | [L71](file:///d:/claude/nomad/api/acl.go#L71) |
| `ACLTokens` | `c *Client` | `` | `*ACLTokens` | [L86](file:///d:/claude/nomad/api/acl.go#L86) |
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
| `ACLRoles` | `c *Client` | `` | `*ACLRoles` | [L262](file:///d:/claude/nomad/api/acl.go#L262) |
| `List` | `a *ACLRoles` | `q *QueryOptions` | `[]*ACLRoleListStub, *QueryMeta, error` | [L267](file:///d:/claude/nomad/api/acl.go#L267) |
| `Create` | `a *ACLRoles` | `role *ACLRole, w *WriteOptions` | `*ACLRole, *WriteMeta, error` | [L277](file:///d:/claude/nomad/api/acl.go#L277) |
| `Update` | `a *ACLRoles` | `role *ACLRole, w *WriteOptions` | `*ACLRole, *WriteMeta, error` | [L290](file:///d:/claude/nomad/api/acl.go#L290) |
| `Delete` | `a *ACLRoles` | `roleID string, w *WriteOptions` | `*WriteMeta, error` | [L303](file:///d:/claude/nomad/api/acl.go#L303) |
| `Get` | `a *ACLRoles` | `roleID string, q *QueryOptions` | `*ACLRole, *QueryMeta, error` | [L315](file:///d:/claude/nomad/api/acl.go#L315) |
| `GetByName` | `a *ACLRoles` | `roleName string, q *QueryOptions` | `*ACLRole, *QueryMeta, error` | [L328](file:///d:/claude/nomad/api/acl.go#L328) |
| `ACLAuthMethods` | `c *Client` | `` | `*ACLAuthMethods` | [L346](file:///d:/claude/nomad/api/acl.go#L346) |
| `List` | `a *ACLAuthMethods` | `q *QueryOptions` | `[]*ACLAuthMethodListStub, *QueryMeta, error` | [L352](file:///d:/claude/nomad/api/acl.go#L352) |
| `Create` | `a *ACLAuthMethods` | `authMethod *ACLAuthMethod, w *WriteOptions` | `*ACLAuthMethod, *WriteMeta, error` | [L362](file:///d:/claude/nomad/api/acl.go#L362) |
| `Update` | `a *ACLAuthMethods` | `authMethod *ACLAuthMethod, w *WriteOptions` | `*ACLAuthMethod, *WriteMeta, error` | [L375](file:///d:/claude/nomad/api/acl.go#L375) |
| `Delete` | `a *ACLAuthMethods` | `authMethodName string, w *WriteOptions` | `*WriteMeta, error` | [L388](file:///d:/claude/nomad/api/acl.go#L388) |
| `Get` | `a *ACLAuthMethods` | `authMethodName string, q *QueryOptions` | `*ACLAuthMethod, *QueryMeta, error` | [L400](file:///d:/claude/nomad/api/acl.go#L400) |
| `ACLBindingRules` | `c *Client` | `` | `*ACLBindingRules` | [L418](file:///d:/claude/nomad/api/acl.go#L418) |
| `List` | `a *ACLBindingRules` | `q *QueryOptions` | `[]*ACLBindingRuleListStub, *QueryMeta, error` | [L424](file:///d:/claude/nomad/api/acl.go#L424) |
| `Create` | `a *ACLBindingRules` | `bindingRule *ACLBindingRule, w *WriteOptions` | `*ACLBindingRule, *WriteMeta, error` | [L434](file:///d:/claude/nomad/api/acl.go#L434) |
| `Update` | `a *ACLBindingRules` | `bindingRule *ACLBindingRule, w *WriteOptions` | `*ACLBindingRule, *WriteMeta, error` | [L444](file:///d:/claude/nomad/api/acl.go#L444) |
| `Delete` | `a *ACLBindingRules` | `bindingRuleID string, w *WriteOptions` | `*WriteMeta, error` | [L457](file:///d:/claude/nomad/api/acl.go#L457) |
| `Get` | `a *ACLBindingRules` | `bindingRuleID string, q *QueryOptions` | `*ACLBindingRule, *QueryMeta, error` | [L469](file:///d:/claude/nomad/api/acl.go#L469) |
| `ACLOIDC` | `c *Client` | `` | `*ACLOIDC` | [L492](file:///d:/claude/nomad/api/acl.go#L492) |
| `ACLAuth` | `c *Client` | `` | `*ACLAuth` | [L502](file:///d:/claude/nomad/api/acl.go#L502) |
| `GetAuthURL` | `a *ACLAuth` | `req *ACLOIDCAuthURLRequest, q *WriteOptions` | `*ACLOIDCAuthURLResponse, *WriteMeta, error` | [L508](file:///d:/claude/nomad/api/acl.go#L508) |
| `CompleteAuth` | `a *ACLAuth` | `req *ACLOIDCCompleteAuthRequest, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | [L519](file:///d:/claude/nomad/api/acl.go#L519) |
| `Login` | `a *ACLAuth` | `req *ACLLoginRequest, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | [L530](file:///d:/claude/nomad/api/acl.go#L530) |
| `MarshalJSON` | `a *ACLToken` | `` | `[]byte, error` | [L613](file:///d:/claude/nomad/api/acl.go#L613) |
| `UnmarshalJSON` | `a *ACLToken` | `data []byte` | `err error` | [L630](file:///d:/claude/nomad/api/acl.go#L630) |
| `MarshalJSON` | `m *ACLAuthMethod` | `` | `[]byte, error` | [L811](file:///d:/claude/nomad/api/acl.go#L811) |
| `UnmarshalJSON` | `m *ACLAuthMethod` | `data []byte` | `error` | [L828](file:///d:/claude/nomad/api/acl.go#L828) |
| `MarshalJSON` | `c *ACLAuthMethodConfig` | `` | `[]byte, error` | [L904](file:///d:/claude/nomad/api/acl.go#L904) |
| `UnmarshalJSON` | `c *ACLAuthMethodConfig` | `data []byte` | `error` | [L931](file:///d:/claude/nomad/api/acl.go#L931) |
| `ACLIdentity` | `c *Client` | `` | `*ACLIdentity` | [L1279](file:///d:/claude/nomad/api/acl.go#L1279) |
| `CreateClientIntroductionToken` | `a *ACLIdentity` | `req *ACLIdentityClientIntroductionTokenRequest, writeOpts *WriteOptions` | `*ACLIdentityClientIntroductionTokenResponse, *WriteMeta, ...` | [L1285](file:///d:/claude/nomad/api/acl.go#L1285) |

## 5. 核心方法详解

### List()

**签名**：`func (a *ACLPolicies) List(q *QueryOptions) []*ACLPolicyListStub, *QueryMeta, error`

**位置**：[L24](file:///d:/claude/nomad/api/acl.go#L24)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*ACLPolicyListStub` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (a *ACLPolicies) Delete(policyName string, q *WriteOptions) *WriteMeta, error`

**位置**：[L46](file:///d:/claude/nomad/api/acl.go#L46)

**中文说明**：删除 用于 删除 策略

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `policyName` | `string` | 字符串 |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Info()

**签名**：`func (a *ACLPolicies) Info(policyName string, q *QueryOptions) *ACLPolicy, *QueryMeta, error`

**位置**：[L58](file:///d:/claude/nomad/api/acl.go#L58)

**中文说明**：返回对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `policyName` | `string` | 字符串 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACLPolicy` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### List()

**签名**：`func (a *ACLTokens) List(q *QueryOptions) []*ACLTokenListStub, *QueryMeta, error`

**位置**：[L120](file:///d:/claude/nomad/api/acl.go#L120)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*ACLTokenListStub` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Create()

**签名**：`func (a *ACLTokens) Create(token *ACLToken, q *WriteOptions) *ACLToken, *WriteMeta, error`

**位置**：[L131](file:///d:/claude/nomad/api/acl.go#L131)

**中文说明**：创建新的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `token` | `*ACLToken` | 令牌，用于认证或标识 |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACLToken` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Update()

**签名**：`func (a *ACLTokens) Update(token *ACLToken, q *WriteOptions) *ACLToken, *WriteMeta, error`

**位置**：[L164](file:///d:/claude/nomad/api/acl.go#L164)

**中文说明**：更新指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `token` | `*ACLToken` | 令牌，用于认证或标识 |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACLToken` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (a *ACLTokens) Delete(accessorID string, q *WriteOptions) *WriteMeta, error`

**位置**：[L178](file:///d:/claude/nomad/api/acl.go#L178)

**中文说明**：删除 用于 删除 令牌

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `accessorID` | `string` | 字符串 |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Info()

**签名**：`func (a *ACLTokens) Info(accessorID string, q *QueryOptions) *ACLToken, *QueryMeta, error`

**位置**：[L190](file:///d:/claude/nomad/api/acl.go#L190)

**中文说明**：返回对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `accessorID` | `string` | 字符串 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACLToken` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### List()

**签名**：`func (a *ACLRoles) List(q *QueryOptions) []*ACLRoleListStub, *QueryMeta, error`

**位置**：[L267](file:///d:/claude/nomad/api/acl.go#L267)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*ACLRoleListStub` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Create()

**签名**：`func (a *ACLRoles) Create(role *ACLRole, w *WriteOptions) *ACLRole, *WriteMeta, error`

**位置**：[L277](file:///d:/claude/nomad/api/acl.go#L277)

**中文说明**：创建新的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `role` | `*ACLRole` | 角色 |
| `w` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACLRole` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Update()

**签名**：`func (a *ACLRoles) Update(role *ACLRole, w *WriteOptions) *ACLRole, *WriteMeta, error`

**位置**：[L290](file:///d:/claude/nomad/api/acl.go#L290)

**中文说明**：更新指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `role` | `*ACLRole` | 角色 |
| `w` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACLRole` | — |
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (a *ACLRoles) Delete(roleID string, w *WriteOptions) *WriteMeta, error`

**位置**：[L303](file:///d:/claude/nomad/api/acl.go#L303)

**中文说明**：删除指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `roleID` | `string` | 字符串 |
| `w` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl_test.go](file:///d:/claude/nomad/api/acl_test.go) | 对应测试文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |
| [constraint.go](file:///d:/claude/nomad/api/constraint.go) | 同目录源文件 |

