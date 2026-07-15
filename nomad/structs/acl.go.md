# acl.go 代码说明文档

> 文件路径：[nomad/structs/acl.go](file:///d:/claude/nomad/nomad/structs/acl.go)
> 总行数：2541 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 64 个方法/函数。

## 2. 类型定义

### ACLCacheEntry

**定义位置**：[L270](file:///d:/claude/nomad/nomad/structs/acl.go#L270)

**中文说明**：ACLCacheEntry 与访问控制列表（ACL）相关，管理权限和认证。

**类型定义**：`type ACLCacheEntry lang.Pair[T, time.Time]`

### ACLCache

**定义位置**：[L281](file:///d:/claude/nomad/nomad/structs/acl.go#L281)

**中文说明**：ACLCache 是一个缓存，存储常用数据以减少重复计算或 I/O。

**类型**：struct

```go
type ACLCache struct {
	*lru.TwoQueueCache[string, ACLCacheEntry[T]] *lru.TwoQueueCache[string, ACLCacheEntry[T]]
	clock libtime.Clock
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `*lru.TwoQueueCache[string, ACLCacheEntry[T]]` | `*lru.TwoQueueCache[string, ACLCacheEntry[T]]` | 字符串 |
| `clock` | `libtime.Clock` | 互斥锁，保护并发访问 |

### ACLPolicy

**定义位置**：[L309](file:///d:/claude/nomad/nomad/structs/acl.go#L309)

**中文说明**：ACLPolicy 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLPolicy struct {
	Name string
	Description string
	Rules string
	RulesJSON *acl.Policy
	JobACL *JobACL
	Hash []byte
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Description` | `string` | 描述信息 |
| `Rules` | `string` | HCL 或 JSON 格式化 |
| `RulesJSON` | `*acl.Policy` | — |
| `JobACL` | `*JobACL` | — |
| `Hash` | `[]byte` | 字节数组 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（3 个）：`SetHash`, `Stub`, `Validate`

### JobACL

**定义位置**：[L322](file:///d:/claude/nomad/nomad/structs/acl.go#L322)

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
| `Namespace` | `string` | 命名空间 的 job |
| `JobID` | `string` | ID 的 job |
| `Group` | `string` | 字符串 |
| `Task` | `string` | 字符串 |

### ACLPolicyListStub

**定义位置**：[L401](file:///d:/claude/nomad/nomad/structs/acl.go#L401)

**中文说明**：ACLPolicyListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type ACLPolicyListStub struct {
	Name string
	Description string
	JobACL *JobACL
	Hash []byte
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
| `Hash` | `[]byte` | 字节数组 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### ACLPolicyListRequest

**定义位置**：[L411](file:///d:/claude/nomad/nomad/structs/acl.go#L411)

**中文说明**：ACLPolicyListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLPolicyListRequest struct {
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |

### ACLPolicySpecificRequest

**定义位置**：[L416](file:///d:/claude/nomad/nomad/structs/acl.go#L416)

**中文说明**：ACLPolicySpecificRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLPolicySpecificRequest struct {
	Name string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `QueryOptions` | `QueryOptions` | — |

### ACLPolicySetRequest

**定义位置**：[L422](file:///d:/claude/nomad/nomad/structs/acl.go#L422)

**中文说明**：ACLPolicySetRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLPolicySetRequest struct {
	Names []string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Names` | `[]string` | 列表 |
| `QueryOptions` | `QueryOptions` | — |

### ACLPolicyListResponse

**定义位置**：[L428](file:///d:/claude/nomad/nomad/structs/acl.go#L428)

**中文说明**：ACLPolicyListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLPolicyListResponse struct {
	Policies []*ACLPolicyListStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Policies` | `[]*ACLPolicyListStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### SingleACLPolicyResponse

**定义位置**：[L434](file:///d:/claude/nomad/nomad/structs/acl.go#L434)

**中文说明**：SingleACLPolicyResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SingleACLPolicyResponse struct {
	Policy *ACLPolicy
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Policy` | `*ACLPolicy` | 策略 |
| `QueryMeta` | `QueryMeta` | — |

### ACLPolicySetResponse

**定义位置**：[L440](file:///d:/claude/nomad/nomad/structs/acl.go#L440)

**中文说明**：ACLPolicySetResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLPolicySetResponse struct {
	Policies map[string]*ACLPolicy
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Policies` | `map[string]*ACLPolicy` | 映射表 |
| `QueryMeta` | `QueryMeta` | — |

### ACLPolicyDeleteRequest

**定义位置**：[L446](file:///d:/claude/nomad/nomad/structs/acl.go#L446)

**中文说明**：ACLPolicyDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLPolicyDeleteRequest struct {
	Names []string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Names` | `[]string` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### ACLPolicyUpsertRequest

**定义位置**：[L452](file:///d:/claude/nomad/nomad/structs/acl.go#L452)

**中文说明**：ACLPolicyUpsertRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLPolicyUpsertRequest struct {
	Policies []*ACLPolicy
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Policies` | `[]*ACLPolicy` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### ACLToken

**定义位置**：[L458](file:///d:/claude/nomad/nomad/structs/acl.go#L458)

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
	Hash []byte
	CreateTime time.Time
	ExpirationTime *time.Time
	ExpirationTTL time.Duration
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
| `Hash` | `[]byte` | 字节数组 |
| `CreateTime` | `time.Time` | 时间点 |
| `ExpirationTime` | `*time.Time` | 时间点 |
| `ExpirationTTL` | `time.Duration` | 时间间隔 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（13 个）：`GetID`, `GetCreateIndex`, `Copy`, `SetHash`, `Stub`, `Canonicalize`, `Validate`, `HasExpirationTime`, `IsExpired`, `HasRoles`, `MarshalJSON`, `UnmarshalJSON`, `Sanitize`

### ACLTokenListStub

**定义位置**：[L521](file:///d:/claude/nomad/nomad/structs/acl.go#L521)

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
	Hash []byte
	CreateTime time.Time
	ExpirationTime *time.Time
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
| `Hash` | `[]byte` | 字节数组 |
| `CreateTime` | `time.Time` | 时间点 |
| `ExpirationTime` | `*time.Time` | 时间点 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### ACLTokenListRequest

**定义位置**：[L589](file:///d:/claude/nomad/nomad/structs/acl.go#L589)

**中文说明**：ACLTokenListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLTokenListRequest struct {
	GlobalOnly bool
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `GlobalOnly` | `bool` | 布尔值 |
| `QueryOptions` | `QueryOptions` | — |

### ACLTokenSpecificRequest

**定义位置**：[L595](file:///d:/claude/nomad/nomad/structs/acl.go#L595)

**中文说明**：ACLTokenSpecificRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLTokenSpecificRequest struct {
	AccessorID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AccessorID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### ACLTokenSetRequest

**定义位置**：[L601](file:///d:/claude/nomad/nomad/structs/acl.go#L601)

**中文说明**：ACLTokenSetRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLTokenSetRequest struct {
	AccessorIDS []string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AccessorIDS` | `[]string` | 列表 |
| `QueryOptions` | `QueryOptions` | — |

### ACLTokenListResponse

**定义位置**：[L607](file:///d:/claude/nomad/nomad/structs/acl.go#L607)

**中文说明**：ACLTokenListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLTokenListResponse struct {
	Tokens []*ACLTokenListStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Tokens` | `[]*ACLTokenListStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### SingleACLTokenResponse

**定义位置**：[L613](file:///d:/claude/nomad/nomad/structs/acl.go#L613)

**中文说明**：SingleACLTokenResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type SingleACLTokenResponse struct {
	Token *ACLToken
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Token` | `*ACLToken` | 令牌，用于认证或标识 |
| `QueryMeta` | `QueryMeta` | — |

### ACLTokenSetResponse

**定义位置**：[L619](file:///d:/claude/nomad/nomad/structs/acl.go#L619)

**中文说明**：ACLTokenSetResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLTokenSetResponse struct {
	Tokens map[string]*ACLToken
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Tokens` | `map[string]*ACLToken` | 映射表 |
| `QueryMeta` | `QueryMeta` | — |

### ResolveACLTokenRequest

**定义位置**：[L625](file:///d:/claude/nomad/nomad/structs/acl.go#L625)

**中文说明**：ResolveACLTokenRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ResolveACLTokenRequest struct {
	SecretID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SecretID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### ResolveACLTokenResponse

**定义位置**：[L631](file:///d:/claude/nomad/nomad/structs/acl.go#L631)

**中文说明**：ResolveACLTokenResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ResolveACLTokenResponse struct {
	Token *ACLToken
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Token` | `*ACLToken` | 令牌，用于认证或标识 |
| `QueryMeta` | `QueryMeta` | — |

### ACLTokenDeleteRequest

**定义位置**：[L637](file:///d:/claude/nomad/nomad/structs/acl.go#L637)

**中文说明**：ACLTokenDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLTokenDeleteRequest struct {
	AccessorIDs []string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AccessorIDs` | `[]string` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### ACLTokenBootstrapRequest

**定义位置**：[L643](file:///d:/claude/nomad/nomad/structs/acl.go#L643)

**中文说明**：ACLTokenBootstrapRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLTokenBootstrapRequest struct {
	Token *ACLToken
	ResetIndex uint64
	BootstrapSecret string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Token` | `*ACLToken` | 令牌，用于认证或标识 |
| `ResetIndex` | `uint64` | 索引值（uint64） |
| `BootstrapSecret` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### ACLTokenUpsertRequest

**定义位置**：[L651](file:///d:/claude/nomad/nomad/structs/acl.go#L651)

**中文说明**：ACLTokenUpsertRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLTokenUpsertRequest struct {
	Tokens []*ACLToken
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Tokens` | `[]*ACLToken` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### ACLTokenUpsertResponse

**定义位置**：[L657](file:///d:/claude/nomad/nomad/structs/acl.go#L657)

**中文说明**：ACLTokenUpsertResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLTokenUpsertResponse struct {
	Tokens []*ACLToken
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Tokens` | `[]*ACLToken` | 列表 |
| `WriteMeta` | `WriteMeta` | — |

### OneTimeToken

**定义位置**：[L664](file:///d:/claude/nomad/nomad/structs/acl.go#L664)

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

### OneTimeTokenUpsertRequest

**定义位置**：[L673](file:///d:/claude/nomad/nomad/structs/acl.go#L673)

**中文说明**：OneTimeTokenUpsertRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type OneTimeTokenUpsertRequest struct {
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WriteRequest` | `WriteRequest` | — |

### OneTimeTokenUpsertResponse

**定义位置**：[L678](file:///d:/claude/nomad/nomad/structs/acl.go#L678)

**中文说明**：OneTimeTokenUpsertResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type OneTimeTokenUpsertResponse struct {
	OneTimeToken *OneTimeToken
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `OneTimeToken` | `*OneTimeToken` | — |
| `WriteMeta` | `WriteMeta` | — |

### OneTimeTokenExchangeRequest

**定义位置**：[L685](file:///d:/claude/nomad/nomad/structs/acl.go#L685)

**中文说明**：OneTimeTokenExchangeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type OneTimeTokenExchangeRequest struct {
	OneTimeSecretID string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `OneTimeSecretID` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

### OneTimeTokenExchangeResponse

**定义位置**：[L692](file:///d:/claude/nomad/nomad/structs/acl.go#L692)

**中文说明**：OneTimeTokenExchangeResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type OneTimeTokenExchangeResponse struct {
	Token *ACLToken
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Token` | `*ACLToken` | 令牌，用于认证或标识 |
| `WriteMeta` | `WriteMeta` | — |

### OneTimeTokenDeleteRequest

**定义位置**：[L698](file:///d:/claude/nomad/nomad/structs/acl.go#L698)

**中文说明**：OneTimeTokenDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type OneTimeTokenDeleteRequest struct {
	AccessorIDs []string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AccessorIDs` | `[]string` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### OneTimeTokenExpireRequest

**定义位置**：[L704](file:///d:/claude/nomad/nomad/structs/acl.go#L704)

**中文说明**：OneTimeTokenExpireRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type OneTimeTokenExpireRequest struct {
	Timestamp time.Time
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Timestamp` | `time.Time` | 时间戳 |
| `WriteRequest` | `WriteRequest` | — |

### ACLTokenRoleLink

**定义位置**：[L712](file:///d:/claude/nomad/nomad/structs/acl.go#L712)

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

### ACLRole

**定义位置**：[L939](file:///d:/claude/nomad/nomad/structs/acl.go#L939)

**中文说明**：ACLRole 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLRole struct {
	ID string
	Name string
	Description string
	Policies []*ACLRolePolicyLink
	Hash []byte
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
| `Hash` | `[]byte` | 字节数组 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（6 个）：`SetHash`, `Validate`, `Canonicalize`, `Equal`, `Copy`, `Stub`

### ACLRolePolicyLink

**定义位置**：[L973](file:///d:/claude/nomad/nomad/structs/acl.go#L973)

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

**定义位置**：[L1085](file:///d:/claude/nomad/nomad/structs/acl.go#L1085)

**中文说明**：ACLRoleListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type ACLRoleListStub struct {
	ID string
	Name string
	Description string
	Policies []*ACLRolePolicyLink
	Hash []byte
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
| `Hash` | `[]byte` | 字节数组 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### ACLRolesUpsertRequest

**定义位置**：[L1118](file:///d:/claude/nomad/nomad/structs/acl.go#L1118)

**中文说明**：ACLRolesUpsertRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLRolesUpsertRequest struct {
	ACLRoles []*ACLRole
	AllowMissingPolicies bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLRoles` | `[]*ACLRole` | 列表 |
| `AllowMissingPolicies` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### ACLRolesUpsertResponse

**定义位置**：[L1131](file:///d:/claude/nomad/nomad/structs/acl.go#L1131)

**中文说明**：ACLRolesUpsertResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLRolesUpsertResponse struct {
	ACLRoles []*ACLRole
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLRoles` | `[]*ACLRole` | 列表 |
| `WriteMeta` | `WriteMeta` | — |

### ACLRolesDeleteByIDRequest

**定义位置**：[L1138](file:///d:/claude/nomad/nomad/structs/acl.go#L1138)

**中文说明**：ACLRolesDeleteByIDRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLRolesDeleteByIDRequest struct {
	ACLRoleIDs []string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLRoleIDs` | `[]string` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### ACLRolesDeleteByIDResponse

**定义位置**：[L1145](file:///d:/claude/nomad/nomad/structs/acl.go#L1145)

**中文说明**：ACLRolesDeleteByIDResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLRolesDeleteByIDResponse struct {
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WriteMeta` | `WriteMeta` | — |

### ACLRolesListRequest

**定义位置**：[L1150](file:///d:/claude/nomad/nomad/structs/acl.go#L1150)

**中文说明**：ACLRolesListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLRolesListRequest struct {
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |

### ACLRolesListResponse

**定义位置**：[L1156](file:///d:/claude/nomad/nomad/structs/acl.go#L1156)

**中文说明**：ACLRolesListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLRolesListResponse struct {
	ACLRoles []*ACLRoleListStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLRoles` | `[]*ACLRoleListStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### ACLRolesByIDRequest

**定义位置**：[L1163](file:///d:/claude/nomad/nomad/structs/acl.go#L1163)

**中文说明**：ACLRolesByIDRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLRolesByIDRequest struct {
	ACLRoleIDs []string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLRoleIDs` | `[]string` | 列表 |
| `QueryOptions` | `QueryOptions` | — |

### ACLRolesByIDResponse

**定义位置**：[L1170](file:///d:/claude/nomad/nomad/structs/acl.go#L1170)

**中文说明**：ACLRolesByIDResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLRolesByIDResponse struct {
	ACLRoles map[string]*ACLRole
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLRoles` | `map[string]*ACLRole` | 映射表 |
| `QueryMeta` | `QueryMeta` | — |

### ACLRoleByIDRequest

**定义位置**：[L1177](file:///d:/claude/nomad/nomad/structs/acl.go#L1177)

**中文说明**：ACLRoleByIDRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLRoleByIDRequest struct {
	RoleID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `RoleID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### ACLRoleByIDResponse

**定义位置**：[L1184](file:///d:/claude/nomad/nomad/structs/acl.go#L1184)

**中文说明**：ACLRoleByIDResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLRoleByIDResponse struct {
	ACLRole *ACLRole
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLRole` | `*ACLRole` | — |
| `QueryMeta` | `QueryMeta` | — |

### ACLRoleByNameRequest

**定义位置**：[L1191](file:///d:/claude/nomad/nomad/structs/acl.go#L1191)

**中文说明**：ACLRoleByNameRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLRoleByNameRequest struct {
	RoleName string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `RoleName` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### ACLRoleByNameResponse

**定义位置**：[L1198](file:///d:/claude/nomad/nomad/structs/acl.go#L1198)

**中文说明**：ACLRoleByNameResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLRoleByNameResponse struct {
	ACLRole *ACLRole
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLRole` | `*ACLRole` | — |
| `QueryMeta` | `QueryMeta` | — |

### ACLAuthMethod

**定义位置**：[L1205](file:///d:/claude/nomad/nomad/structs/acl.go#L1205)

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
	Hash []byte
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
| `Hash` | `[]byte` | 字节数组 |
| `CreateTime` | `time.Time` | 时间点 |
| `ModifyTime` | `time.Time` | 时间点 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（11 个）：`SetHash`, `MarshalJSON`, `UnmarshalJSON`, `Stub`, `Equal`, `Copy`, `Canonicalize`, `Merge`, `Validate`, `Sanitize`, `TokenLocalityIsGlobal`

### ACLAuthMethodConfig

**定义位置**：[L1489](file:///d:/claude/nomad/nomad/structs/acl.go#L1489)

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

**关联方法**（5 个）：`Canonicalize`, `Validate`, `Copy`, `MarshalJSON`, `UnmarshalJSON`

### OIDCClientAssertionKeySource

**定义位置**：[L1712](file:///d:/claude/nomad/nomad/structs/acl.go#L1712)

**类型定义**：`type OIDCClientAssertionKeySource string`

### OIDCClientAssertion

**定义位置**：[L1723](file:///d:/claude/nomad/nomad/structs/acl.go#L1723)

**中文说明**：OIDCClientAssertion 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type OIDCClientAssertion struct {
	KeySource OIDCClientAssertionKeySource
	Audience []string
	PrivateKey *OIDCClientAssertionKey
	ExtraHeaders map[string]string
	KeyAlgorithm string
	ClientSecret string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `KeySource` | `OIDCClientAssertionKeySource` | — |
| `Audience` | `[]string` | 列表 |
| `PrivateKey` | `*OIDCClientAssertionKey` | — |
| `ExtraHeaders` | `map[string]string` | 映射表 |
| `KeyAlgorithm` | `string` | 字符串 |
| `ClientSecret` | `string` | 字符串 |

**关联方法**（4 个）：`Copy`, `Canonicalize`, `IsSet`, `Validate`

### OIDCClientAssertionKeyIDHeader

**定义位置**：[L1793](file:///d:/claude/nomad/nomad/structs/acl.go#L1793)

**类型定义**：`type OIDCClientAssertionKeyIDHeader string`

### OIDCClientAssertionKey

**定义位置**：[L1804](file:///d:/claude/nomad/nomad/structs/acl.go#L1804)

**中文说明**：OIDCClientAssertionKey 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type OIDCClientAssertionKey struct {
	PemKey string
	PemKeyFile string
	KeyIDHeader OIDCClientAssertionKeyIDHeader
	PemCert string
	PemCertFile string
	KeyID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PemKey` | `string` | 字符串 |
| `PemKeyFile` | `string` | 字符串 |
| `KeyIDHeader` | `OIDCClientAssertionKeyIDHeader` | — |
| `PemCert` | `string` | 字符串 |
| `PemCertFile` | `string` | 字符串 |
| `KeyID` | `string` | 字符串 |

**关联方法**（3 个）：`Copy`, `Canonicalize`, `Validate`

### ACLAuthClaims

**定义位置**：[L1908](file:///d:/claude/nomad/nomad/structs/acl.go#L1908)

**中文说明**：ACLAuthClaims 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLAuthClaims struct {
	Value map[string]string `bexpr:"value"`
	List map[string][]string `bexpr:"list"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Value` | `map[string]string `bexpr:"value"`` | 值 |
| `List` | `map[string][]string `bexpr:"list"`` | 映射表 |

### ACLAuthMethodStub

**定义位置**：[L1914](file:///d:/claude/nomad/nomad/structs/acl.go#L1914)

**中文说明**：ACLAuthMethodStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type ACLAuthMethodStub struct {
	Name string
	Type string
	Default bool
	Hash []byte
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
| `Hash` | `[]byte` | 字节数组 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### ACLAuthMethodListRequest

**定义位置**：[L1929](file:///d:/claude/nomad/nomad/structs/acl.go#L1929)

**中文说明**：ACLAuthMethodListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLAuthMethodListRequest struct {
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |

### ACLAuthMethodListResponse

**定义位置**：[L1934](file:///d:/claude/nomad/nomad/structs/acl.go#L1934)

**中文说明**：ACLAuthMethodListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLAuthMethodListResponse struct {
	AuthMethods []*ACLAuthMethodStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AuthMethods` | `[]*ACLAuthMethodStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### ACLAuthMethodGetRequest

**定义位置**：[L1940](file:///d:/claude/nomad/nomad/structs/acl.go#L1940)

**中文说明**：ACLAuthMethodGetRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLAuthMethodGetRequest struct {
	MethodName string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MethodName` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### ACLAuthMethodGetResponse

**定义位置**：[L1946](file:///d:/claude/nomad/nomad/structs/acl.go#L1946)

**中文说明**：ACLAuthMethodGetResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLAuthMethodGetResponse struct {
	AuthMethod *ACLAuthMethod
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AuthMethod` | `*ACLAuthMethod` | — |
| `QueryMeta` | `QueryMeta` | — |

### ACLAuthMethodsGetRequest

**定义位置**：[L1952](file:///d:/claude/nomad/nomad/structs/acl.go#L1952)

**中文说明**：ACLAuthMethodsGetRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLAuthMethodsGetRequest struct {
	Names []string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Names` | `[]string` | 列表 |
| `QueryOptions` | `QueryOptions` | — |

### ACLAuthMethodsGetResponse

**定义位置**：[L1958](file:///d:/claude/nomad/nomad/structs/acl.go#L1958)

**中文说明**：ACLAuthMethodsGetResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLAuthMethodsGetResponse struct {
	AuthMethods map[string]*ACLAuthMethod
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AuthMethods` | `map[string]*ACLAuthMethod` | 映射表 |
| `QueryMeta` | `QueryMeta` | — |

### ACLAuthMethodUpsertRequest

**定义位置**：[L1964](file:///d:/claude/nomad/nomad/structs/acl.go#L1964)

**中文说明**：ACLAuthMethodUpsertRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLAuthMethodUpsertRequest struct {
	AuthMethods []*ACLAuthMethod
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AuthMethods` | `[]*ACLAuthMethod` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### ACLAuthMethodUpsertResponse

**定义位置**：[L1971](file:///d:/claude/nomad/nomad/structs/acl.go#L1971)

**中文说明**：ACLAuthMethodUpsertResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLAuthMethodUpsertResponse struct {
	AuthMethods []*ACLAuthMethod
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AuthMethods` | `[]*ACLAuthMethod` | 列表 |
| `WriteMeta` | `WriteMeta` | — |

### ACLAuthMethodDeleteRequest

**定义位置**：[L1978](file:///d:/claude/nomad/nomad/structs/acl.go#L1978)

**中文说明**：ACLAuthMethodDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLAuthMethodDeleteRequest struct {
	Names []string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Names` | `[]string` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### ACLAuthMethodDeleteResponse

**定义位置**：[L1985](file:///d:/claude/nomad/nomad/structs/acl.go#L1985)

**中文说明**：ACLAuthMethodDeleteResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLAuthMethodDeleteResponse struct {
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WriteMeta` | `WriteMeta` | — |

### ACLWhoAmIResponse

**定义位置**：[L1989](file:///d:/claude/nomad/nomad/structs/acl.go#L1989)

**中文说明**：ACLWhoAmIResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLWhoAmIResponse struct {
	Identity *AuthenticatedIdentity
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Identity` | `*AuthenticatedIdentity` | — |
| `QueryMeta` | `QueryMeta` | — |

### ACLBindingRule

**定义位置**：[L1998](file:///d:/claude/nomad/nomad/structs/acl.go#L1998)

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
	Hash []byte
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
| `Hash` | `[]byte` | 字节数组 |
| `CreateTime` | `time.Time` | 时间点 |
| `ModifyTime` | `time.Time` | 时间点 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（7 个）：`Canonicalize`, `Validate`, `Merge`, `SetHash`, `Equal`, `Copy`, `Stub`

### ACLBindingRuleListStub

**定义位置**：[L2198](file:///d:/claude/nomad/nomad/structs/acl.go#L2198)

**中文说明**：ACLBindingRuleListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type ACLBindingRuleListStub struct {
	ID string
	Description string
	AuthMethod string
	Hash []byte
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
| `Hash` | `[]byte` | 字节数组 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### ACLBindingRulesUpsertRequest

**定义位置**：[L2224](file:///d:/claude/nomad/nomad/structs/acl.go#L2224)

**中文说明**：ACLBindingRulesUpsertRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLBindingRulesUpsertRequest struct {
	ACLBindingRules []*ACLBindingRule
	AllowMissingAuthMethods bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLBindingRules` | `[]*ACLBindingRule` | 列表 |
| `AllowMissingAuthMethods` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### ACLBindingRulesUpsertResponse

**定义位置**：[L2238](file:///d:/claude/nomad/nomad/structs/acl.go#L2238)

**中文说明**：ACLBindingRulesUpsertResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLBindingRulesUpsertResponse struct {
	ACLBindingRules []*ACLBindingRule
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLBindingRules` | `[]*ACLBindingRule` | 列表 |
| `WriteMeta` | `WriteMeta` | — |

### ACLBindingRulesDeleteRequest

**定义位置**：[L2245](file:///d:/claude/nomad/nomad/structs/acl.go#L2245)

**中文说明**：ACLBindingRulesDeleteRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLBindingRulesDeleteRequest struct {
	ACLBindingRuleIDs []string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLBindingRuleIDs` | `[]string` | 列表 |
| `WriteRequest` | `WriteRequest` | — |

### ACLBindingRulesDeleteResponse

**定义位置**：[L2252](file:///d:/claude/nomad/nomad/structs/acl.go#L2252)

**中文说明**：ACLBindingRulesDeleteResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLBindingRulesDeleteResponse struct {
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WriteMeta` | `WriteMeta` | — |

### ACLBindingRulesListRequest

**定义位置**：[L2258](file:///d:/claude/nomad/nomad/structs/acl.go#L2258)

**中文说明**：ACLBindingRulesListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLBindingRulesListRequest struct {
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |

### ACLBindingRulesListResponse

**定义位置**：[L2264](file:///d:/claude/nomad/nomad/structs/acl.go#L2264)

**中文说明**：ACLBindingRulesListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLBindingRulesListResponse struct {
	ACLBindingRules []*ACLBindingRuleListStub
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLBindingRules` | `[]*ACLBindingRuleListStub` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### ACLBindingRulesRequest

**定义位置**：[L2271](file:///d:/claude/nomad/nomad/structs/acl.go#L2271)

**中文说明**：ACLBindingRulesRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLBindingRulesRequest struct {
	ACLBindingRuleIDs []string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLBindingRuleIDs` | `[]string` | 列表 |
| `QueryOptions` | `QueryOptions` | — |

### ACLBindingRulesResponse

**定义位置**：[L2278](file:///d:/claude/nomad/nomad/structs/acl.go#L2278)

**中文说明**：ACLBindingRulesResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLBindingRulesResponse struct {
	ACLBindingRules map[string]*ACLBindingRule
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLBindingRules` | `map[string]*ACLBindingRule` | 映射表 |
| `QueryMeta` | `QueryMeta` | — |

### ACLBindingRuleRequest

**定义位置**：[L2285](file:///d:/claude/nomad/nomad/structs/acl.go#L2285)

**中文说明**：ACLBindingRuleRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLBindingRuleRequest struct {
	ACLBindingRuleID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLBindingRuleID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### ACLBindingRuleResponse

**定义位置**：[L2292](file:///d:/claude/nomad/nomad/structs/acl.go#L2292)

**中文说明**：ACLBindingRuleResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLBindingRuleResponse struct {
	ACLBindingRule *ACLBindingRule
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLBindingRule` | `*ACLBindingRule` | — |
| `QueryMeta` | `QueryMeta` | — |

### ACLOIDCAuthURLRequest

**定义位置**：[L2299](file:///d:/claude/nomad/nomad/structs/acl.go#L2299)

**中文说明**：ACLOIDCAuthURLRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLOIDCAuthURLRequest struct {
	AuthMethodName string
	RedirectURI string
	ClientNonce string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AuthMethodName` | `string` | 字符串 |
| `RedirectURI` | `string` | 字符串 |
| `ClientNonce` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

**关联方法**（1 个）：`Validate`

### ACLOIDCAuthURLResponse

**定义位置**：[L2341](file:///d:/claude/nomad/nomad/structs/acl.go#L2341)

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

**定义位置**：[L2350](file:///d:/claude/nomad/nomad/structs/acl.go#L2350)

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
	WriteRequest WriteRequest
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
| `WriteRequest` | `WriteRequest` | — |

**关联方法**（1 个）：`Validate`

### ACLLoginResponse

**定义位置**：[L2397](file:///d:/claude/nomad/nomad/structs/acl.go#L2397)

**中文说明**：ACLLoginResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLLoginResponse struct {
	ACLToken *ACLToken
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLToken` | `*ACLToken` | — |
| `WriteMeta` | `WriteMeta` | — |

### ACLLoginRequest

**定义位置**：[L2404](file:///d:/claude/nomad/nomad/structs/acl.go#L2404)

**中文说明**：ACLLoginRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLLoginRequest struct {
	AuthMethodName string
	LoginToken string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AuthMethodName` | `string` | 字符串 |
| `LoginToken` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

**关联方法**（1 个）：`Validate`

### ACLCreateClientIntroductionTokenRequest

**定义位置**：[L2435](file:///d:/claude/nomad/nomad/structs/acl.go#L2435)

**中文说明**：ACLCreateClientIntroductionTokenRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ACLCreateClientIntroductionTokenRequest struct {
	TTL time.Duration
	NodeName string
	NodePool string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TTL` | `time.Duration` | 生存时间（TTL） |
| `NodeName` | `string` | 字符串 |
| `NodePool` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

**关联方法**（4 个）：`Canonicalize`, `IdentityTTL`, `MarshalJSON`, `UnmarshalJSON`

### ACLCreateClientIntroductionTokenResponse

**定义位置**：[L2535](file:///d:/claude/nomad/nomad/structs/acl.go#L2535)

**中文说明**：ACLCreateClientIntroductionTokenResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ACLCreateClientIntroductionTokenResponse struct {
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
| `ACLUpsertPoliciesRPCMethod` | `—` | `"ACL.UpsertPolicies"` | — |
| `ACLUpsertTokensRPCMethod` | `—` | `"ACL.UpsertTokens"` | — |
| `ACLDeleteTokensRPCMethod` | `—` | `"ACL.DeleteTokens"` | — |
| `ACLUpsertRolesRPCMethod` | `—` | `"ACL.UpsertRoles"` | — |
| `ACLDeleteRolesByIDRPCMethod` | `—` | `"ACL.DeleteRolesByID"` | — |
| `ACLListRolesRPCMethod` | `—` | `"ACL.ListRoles"` | — |
| `ACLGetRolesByIDRPCMethod` | `—` | `"ACL.GetRolesByID"` | — |
| `ACLGetRoleByIDRPCMethod` | `—` | `"ACL.GetRoleByID"` | — |
| `ACLGetRoleByNameRPCMethod` | `—` | `"ACL.GetRoleByName"` | — |
| `ACLUpsertAuthMethodsRPCMethod` | `—` | `"ACL.UpsertAuthMethods"` | — |
| `ACLDeleteAuthMethodsRPCMethod` | `—` | `"ACL.DeleteAuthMethods"` | — |
| `ACLListAuthMethodsRPCMethod` | `—` | `"ACL.ListAuthMethods"` | — |
| `ACLGetAuthMethodRPCMethod` | `—` | `"ACL.GetAuthMethod"` | — |
| `ACLGetAuthMethodsRPCMethod` | `—` | `"ACL.GetAuthMethods"` | — |
| `ACLUpsertBindingRulesRPCMethod` | `—` | `"ACL.UpsertBindingRules"` | — |
| `ACLDeleteBindingRulesRPCMethod` | `—` | `"ACL.DeleteBindingRules"` | — |
| `ACLListBindingRulesRPCMethod` | `—` | `"ACL.ListBindingRules"` | — |
| `ACLGetBindingRulesRPCMethod` | `—` | `"ACL.GetBindingRules"` | — |
| `ACLGetBindingRuleRPCMethod` | `—` | `"ACL.GetBindingRule"` | — |
| `ACLOIDCAuthURLRPCMethod` | `—` | `"ACL.OIDCAuthURL"` | — |
| `ACLOIDCCompleteAuthRPCMethod` | `—` | `"ACL.OIDCCompleteAuth"` | — |
| `ACLLoginRPCMethod` | `—` | `"ACL.Login"` | — |
| `ACLCreateClientIntroductionTokenRPCMethod` | `—` | `"ACL.CreateClientIntroductionToken"` | — |
| `ACLMaxExpiredBatchSize` | `—` | `4096` | — |
| `maxACLRoleDescriptionLength` | `—` | `256` | — |
| `maxACLBindingRuleDescriptionLength` | `—` | `256` | — |
| `ACLAuthMethodTokenLocalityLocal` | `—` | `"local"` | — |
| `ACLAuthMethodTokenLocalityGlobal` | `—` | `"global"` | — |
| `ACLAuthMethodTypeOIDC` | `—` | `"OIDC"` | — |
| `ACLAuthMethodTypeJWT` | `—` | `"JWT"` | — |
| `DefaultACLAuthMethodTokenNameFormat` | `—` | `"${auth_method_type}-${auth_method_name}"` | — |
| `OIDCKeySourceNomad` | `OIDCClientAssertionKeySource` | `"nomad"` | — |
| `OIDCKeySourceClientSecret` | `OIDCClientAssertionKeySource` | `"client_secret"` | — |
| `OIDCKeySourcePrivateKey` | `OIDCClientAssertionKeySource` | `"private_key"` | — |
| `OIDCClientAssertionHeaderKid` | `OIDCClientAssertionKeyIDHeader` | `"kid"` | — |
| `OIDCClientAssertionHeaderX5t` | `OIDCClientAssertionKeyIDHeader` | `"x5t"` | — |
| `OIDCClientAssertionHeaderX5tS256` | `OIDCClientAssertionKeyIDHeader` | `"x5t#S256"` | — |
| `ACLBindingRuleBindTypeRole` | `—` | `"role"` | — |
| `ACLBindingRuleBindTypePolicy` | `—` | `"policy"` | — |
| `ACLBindingRuleBindTypeManagement` | `—` | `"management"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ValidACLRoleName` | `—` | `regexp.MustCompile("^[a-zA-Z0-9-]{1,128}$")` | — |
| `ValidACLAuthMethod` | `—` | `regexp.MustCompile("^[a-zA-Z0-9-]{1,128}$")` | — |
| `ValidACLAuthMethodTypes` | `—` | `[]string{...}` | — |
| `AnonymousACLToken` | `—` | `&ACLToken{...}` | — |
| `LeaderACLToken` | `—` | `&ACLToken{...}` | — |
| `ACLsDisabledToken` | `—` | `&ACLToken{...}` | — |
| `ErrMissingClientAssertionKey` | `—` | `errors.New("missing PemKey or PemKeyFile")` | — |
| `ErrAmbiguousClientAssertionKey` | `—` | `errors.New("require only one of PemKey or PemKeyFile")` | — |
| `ErrMissingClientAssertionKeyID` | `—` | `errors.New("missing PemCert, PemCertFile, or KeyID")` | — |
| `ErrAmbiguousClientAssertionKeyID` | `—` | `errors.New("require only one of PemCert, PemCertFile, or ...` | — |
| `ErrInvalidClientAssertionKeyPath` | `—` | `errors.New("invalid PemKeyFile")` | — |
| `ErrInvalidClientAssertionCertPath` | `—` | `errors.New("invalid PemCertFile")` | — |
| `ErrInvalidKeyIDHeader` | `—` | `errors.New("invalid KeyIDHeader")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Age` | `e *ACLCacheEntry[T]` | `` | `time.Duration` | [L272](file:///d:/claude/nomad/nomad/structs/acl.go#L272) |
| `Get` | `e *ACLCacheEntry[T]` | `` | `T` | [L276](file:///d:/claude/nomad/nomad/structs/acl.go#L276) |
| `Add` | `c *ACLCache[T]` | `key string, item T` | `` | [L286](file:///d:/claude/nomad/nomad/structs/acl.go#L286) |
| `AddAtTime` | `c *ACLCache[T]` | `key string, item T, now time.Time` | `` | [L290](file:///d:/claude/nomad/nomad/structs/acl.go#L290) |
| `NewACLCache` | - | `size int` | `*ACLCache[T]` | [L297](file:///d:/claude/nomad/nomad/structs/acl.go#L297) |
| `SetHash` | `a *ACLPolicy` | `` | `[]byte` | [L330](file:///d:/claude/nomad/nomad/structs/acl.go#L330) |
| `Stub` | `a *ACLPolicy` | `` | `*ACLPolicyListStub` | [L357](file:///d:/claude/nomad/nomad/structs/acl.go#L357) |
| `Validate` | `a *ACLPolicy` | `` | `error` | [L368](file:///d:/claude/nomad/nomad/structs/acl.go#L368) |
| `GetID` | `a *ACLToken` | `` | `string` | [L489](file:///d:/claude/nomad/nomad/structs/acl.go#L489) |
| `GetCreateIndex` | `a *ACLToken` | `` | `uint64` | [L498](file:///d:/claude/nomad/nomad/structs/acl.go#L498) |
| `Copy` | `a *ACLToken` | `` | `*ACLToken` | [L505](file:///d:/claude/nomad/nomad/structs/acl.go#L505) |
| `SetHash` | `a *ACLToken` | `` | `[]byte` | [L538](file:///d:/claude/nomad/nomad/structs/acl.go#L538) |
| `Stub` | `a *ACLToken` | `` | `*ACLTokenListStub, error` | [L572](file:///d:/claude/nomad/nomad/structs/acl.go#L572) |
| `Canonicalize` | `a *ACLToken` | `` | `` | [L729](file:///d:/claude/nomad/nomad/structs/acl.go#L729) |
| `Validate` | `a *ACLToken` | `minTTL time.Duration, maxTTL time.Duration, existing *ACLToken` | `error` | [L757](file:///d:/claude/nomad/nomad/structs/acl.go#L757) |
| `HasExpirationTime` | `a *ACLToken` | `` | `bool` | [L830](file:///d:/claude/nomad/nomad/structs/acl.go#L830) |
| `IsExpired` | `a *ACLToken` | `t time.Time` | `bool` | [L840](file:///d:/claude/nomad/nomad/structs/acl.go#L840) |
| `HasRoles` | `a *ACLToken` | `roleIDs []string` | `bool` | [L860](file:///d:/claude/nomad/nomad/structs/acl.go#L860) |
| `MarshalJSON` | `a *ACLToken` | `` | `[]byte, error` | [L877](file:///d:/claude/nomad/nomad/structs/acl.go#L877) |
| `UnmarshalJSON` | `a *ACLToken` | `data []byte` | `err error` | [L894](file:///d:/claude/nomad/nomad/structs/acl.go#L894) |
| `Sanitize` | `a *ACLToken` | `` | `*ACLToken` | [L926](file:///d:/claude/nomad/nomad/structs/acl.go#L926) |
| `SetHash` | `a *ACLRole` | `` | `[]byte` | [L982](file:///d:/claude/nomad/nomad/structs/acl.go#L982) |
| `Validate` | `a *ACLRole` | `` | `error` | [L1009](file:///d:/claude/nomad/nomad/structs/acl.go#L1009) |
| `Canonicalize` | `a *ACLRole` | `` | `` | [L1031](file:///d:/claude/nomad/nomad/structs/acl.go#L1031) |
| `Equal` | `a *ACLRole` | `o *ACLRole` | `bool` | [L1039](file:///d:/claude/nomad/nomad/structs/acl.go#L1039) |
| `Copy` | `a *ACLRole` | `` | `*ACLRole` | [L1054](file:///d:/claude/nomad/nomad/structs/acl.go#L1054) |
| `Stub` | `a *ACLRole` | `` | `*ACLRoleListStub` | [L1069](file:///d:/claude/nomad/nomad/structs/acl.go#L1069) |
| `SetHash` | `a *ACLAuthMethod` | `` | `[]byte` | [L1225](file:///d:/claude/nomad/nomad/structs/acl.go#L1225) |
| `MarshalJSON` | `a *ACLAuthMethod` | `` | `[]byte, error` | [L1312](file:///d:/claude/nomad/nomad/structs/acl.go#L1312) |
| `UnmarshalJSON` | `a *ACLAuthMethod` | `data []byte` | `err error` | [L1329](file:///d:/claude/nomad/nomad/structs/acl.go#L1329) |
| `Stub` | `a *ACLAuthMethod` | `` | `*ACLAuthMethodStub` | [L1353](file:///d:/claude/nomad/nomad/structs/acl.go#L1353) |
| `Equal` | `a *ACLAuthMethod` | `other *ACLAuthMethod` | `bool` | [L1364](file:///d:/claude/nomad/nomad/structs/acl.go#L1364) |
| `Copy` | `a *ACLAuthMethod` | `` | `*ACLAuthMethod` | [L1380](file:///d:/claude/nomad/nomad/structs/acl.go#L1380) |
| `Canonicalize` | `a *ACLAuthMethod` | `` | `` | [L1395](file:///d:/claude/nomad/nomad/structs/acl.go#L1395) |
| `Merge` | `a *ACLAuthMethod` | `b *ACLAuthMethod` | `` | [L1413](file:///d:/claude/nomad/nomad/structs/acl.go#L1413) |
| `Validate` | `a *ACLAuthMethod` | `minTTL time.Duration, maxTTL time.Duration` | `error` | [L1426](file:///d:/claude/nomad/nomad/structs/acl.go#L1426) |
| `Sanitize` | `a *ACLAuthMethod` | `` | `*ACLAuthMethod` | [L1457](file:///d:/claude/nomad/nomad/structs/acl.go#L1457) |
| `TokenLocalityIsGlobal` | `a *ACLAuthMethod` | `` | `bool` | [L1484](file:///d:/claude/nomad/nomad/structs/acl.go#L1484) |
| `Canonicalize` | `a *ACLAuthMethodConfig` | `` | `` | [L1560](file:///d:/claude/nomad/nomad/structs/acl.go#L1560) |
| `Validate` | `a *ACLAuthMethodConfig` | `methodType string` | `error` | [L1576](file:///d:/claude/nomad/nomad/structs/acl.go#L1576) |
| `Copy` | `a *ACLAuthMethodConfig` | `` | `*ACLAuthMethodConfig` | [L1605](file:///d:/claude/nomad/nomad/structs/acl.go#L1605) |
| `MarshalJSON` | `a *ACLAuthMethodConfig` | `` | `[]byte, error` | [L1627](file:///d:/claude/nomad/nomad/structs/acl.go#L1627) |
| `UnmarshalJSON` | `a *ACLAuthMethodConfig` | `data []byte` | `err error` | [L1654](file:///d:/claude/nomad/nomad/structs/acl.go#L1654) |
| `Copy` | `c *OIDCClientAssertion` | `` | `*OIDCClientAssertion` | [L1735](file:///d:/claude/nomad/nomad/structs/acl.go#L1735) |
| `Canonicalize` | `c *OIDCClientAssertion` | `` | `` | [L1747](file:///d:/claude/nomad/nomad/structs/acl.go#L1747) |
| `IsSet` | `c *OIDCClientAssertion` | `` | `bool` | [L1763](file:///d:/claude/nomad/nomad/structs/acl.go#L1763) |
| `Validate` | `c *OIDCClientAssertion` | `` | `error` | [L1767](file:///d:/claude/nomad/nomad/structs/acl.go#L1767) |
| `Copy` | `k *OIDCClientAssertionKey` | `` | `*OIDCClientAssertionKey` | [L1814](file:///d:/claude/nomad/nomad/structs/acl.go#L1814) |
| `Canonicalize` | `k *OIDCClientAssertionKey` | `` | `` | [L1823](file:///d:/claude/nomad/nomad/structs/acl.go#L1823) |
| `Validate` | `k *OIDCClientAssertionKey` | `` | `error` | [L1849](file:///d:/claude/nomad/nomad/structs/acl.go#L1849) |
| `Canonicalize` | `a *ACLBindingRule` | `` | `` | [L2061](file:///d:/claude/nomad/nomad/structs/acl.go#L2061) |
| `Validate` | `a *ACLBindingRule` | `` | `error` | [L2079](file:///d:/claude/nomad/nomad/structs/acl.go#L2079) |
| `Merge` | `a *ACLBindingRule` | `b *ACLBindingRule` | `` | [L2122](file:///d:/claude/nomad/nomad/structs/acl.go#L2122) |
| `SetHash` | `a *ACLBindingRule` | `` | `[]byte` | [L2131](file:///d:/claude/nomad/nomad/structs/acl.go#L2131) |
| `Equal` | `a *ACLBindingRule` | `other *ACLBindingRule` | `bool` | [L2156](file:///d:/claude/nomad/nomad/structs/acl.go#L2156) |
| `Copy` | `a *ACLBindingRule` | `` | `*ACLBindingRule` | [L2171](file:///d:/claude/nomad/nomad/structs/acl.go#L2171) |
| `Stub` | `a *ACLBindingRule` | `` | `*ACLBindingRuleListStub` | [L2185](file:///d:/claude/nomad/nomad/structs/acl.go#L2185) |
| `Validate` | `a *ACLOIDCAuthURLRequest` | `` | `error` | [L2323](file:///d:/claude/nomad/nomad/structs/acl.go#L2323) |
| `Validate` | `a *ACLOIDCCompleteAuthRequest` | `` | `error` | [L2373](file:///d:/claude/nomad/nomad/structs/acl.go#L2373) |
| `Validate` | `a *ACLLoginRequest` | `` | `error` | [L2419](file:///d:/claude/nomad/nomad/structs/acl.go#L2419) |
| `Canonicalize` | `a *ACLCreateClientIntroductionTokenRequest` | `` | `` | [L2455](file:///d:/claude/nomad/nomad/structs/acl.go#L2455) |
| `IdentityTTL` | `a *ACLCreateClientIntroductionTokenRequest` | `logger hclog.Logger, serverDefault time.Duration, serverMax time.Duration` | `time.Duration` | [L2463](file:///d:/claude/nomad/nomad/structs/acl.go#L2463) |
| `MarshalJSON` | `a *ACLCreateClientIntroductionTokenRequest` | `` | `[]byte, error` | [L2488](file:///d:/claude/nomad/nomad/structs/acl.go#L2488) |
| `UnmarshalJSON` | `a *ACLCreateClientIntroductionTokenRequest` | `data []byte` | `err error` | [L2505](file:///d:/claude/nomad/nomad/structs/acl.go#L2505) |

## 5. 核心方法详解

### Get()

**签名**：`func (e *ACLCacheEntry[T]) Get() T`

**位置**：[L276](file:///d:/claude/nomad/nomad/structs/acl.go#L276)

**中文说明**：获取对象的信息。

**返回值**：

| 类型 | 说明 |
|------|------|
| `T` | — |

### NewACLCache()

**签名**：`func NewACLCache(size int) *ACLCache[T]`

**位置**：[L297](file:///d:/claude/nomad/nomad/structs/acl.go#L297)

**中文说明**：创建并返回一个新的 ACLCache 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `size` | `int` | 大小 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACLCache[T]` | — |

### Validate()

**签名**：`func (a *ACLPolicy) Validate() error`

**位置**：[L368](file:///d:/claude/nomad/nomad/structs/acl.go#L368)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Copy()

**签名**：`func (a *ACLToken) Copy() *ACLToken`

**位置**：[L505](file:///d:/claude/nomad/nomad/structs/acl.go#L505)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACLToken` | — |

### Validate()

**签名**：`func (a *ACLToken) Validate(minTTL time.Duration, maxTTL time.Duration, existing *ACLToken) error`

**位置**：[L757](file:///d:/claude/nomad/nomad/structs/acl.go#L757)

**中文说明**：验证对象的有效性。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `minTTL` | `time.Duration` | 时间间隔 |
| `maxTTL` | `time.Duration` | 时间间隔 |
| `existing` | `*ACLToken` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Validate()

**签名**：`func (a *ACLRole) Validate() error`

**位置**：[L1009](file:///d:/claude/nomad/nomad/structs/acl.go#L1009)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Copy()

**签名**：`func (a *ACLRole) Copy() *ACLRole`

**位置**：[L1054](file:///d:/claude/nomad/nomad/structs/acl.go#L1054)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACLRole` | — |

### Copy()

**签名**：`func (a *ACLAuthMethod) Copy() *ACLAuthMethod`

**位置**：[L1380](file:///d:/claude/nomad/nomad/structs/acl.go#L1380)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACLAuthMethod` | — |

### Validate()

**签名**：`func (a *ACLAuthMethod) Validate(minTTL time.Duration, maxTTL time.Duration) error`

**位置**：[L1426](file:///d:/claude/nomad/nomad/structs/acl.go#L1426)

**中文说明**：验证对象的有效性。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `minTTL` | `time.Duration` | 时间间隔 |
| `maxTTL` | `time.Duration` | 时间间隔 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Validate()

**签名**：`func (a *ACLAuthMethodConfig) Validate(methodType string) error`

**位置**：[L1576](file:///d:/claude/nomad/nomad/structs/acl.go#L1576)

**中文说明**：验证对象的有效性。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `methodType` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Copy()

**签名**：`func (a *ACLAuthMethodConfig) Copy() *ACLAuthMethodConfig`

**位置**：[L1605](file:///d:/claude/nomad/nomad/structs/acl.go#L1605)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACLAuthMethodConfig` | — |

### Copy()

**签名**：`func (c *OIDCClientAssertion) Copy() *OIDCClientAssertion`

**位置**：[L1735](file:///d:/claude/nomad/nomad/structs/acl.go#L1735)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*OIDCClientAssertion` | — |

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
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **泛型编程**：使用 Go 泛型实现类型安全的通用工具
- **缓存模式**：实现缓存机制，减少重复计算或 I/O 操作
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl_test.go](file:///d:/claude/nomad/nomad/structs/acl_test.go) | 对应测试文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |
| [bitmap.go](file:///d:/claude/nomad/nomad/structs/bitmap.go) | 同目录源文件 |

