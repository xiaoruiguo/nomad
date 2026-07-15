# keyring.go 代码说明文档

> 文件路径：[nomad/structs/keyring.go](file:///d:/claude/nomad/nomad/structs/keyring.go)
> 总行数：641 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 29 个方法/函数。

## 2. 类型定义

### UnwrappedRootKey

**定义位置**：[L44](file:///d:/claude/nomad/nomad/structs/keyring.go#L44)

**中文说明**：UnwrappedRootKey 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type UnwrappedRootKey struct {
	Meta *RootKeyMeta
	Key []byte
	RSAKey []byte
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `*RootKeyMeta` | 元数据 |
| `Key` | `[]byte` | 键 |
| `RSAKey` | `[]byte` | 字节数组 |

**关联方法**（3 个）：`Copy`, `MakeActive`, `MakeInactive`

### RootKey

**定义位置**：[L116](file:///d:/claude/nomad/nomad/structs/keyring.go#L116)

**中文说明**：RootKey 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type RootKey struct {
	KeyID string
	Algorithm EncryptionAlgorithm
	CreateTime int64
	CreateIndex uint64
	ModifyIndex uint64
	State RootKeyState
	PublishTime int64
	WrappedKeys []*WrappedKey
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `KeyID` | `string` | 字符串 |
| `Algorithm` | `EncryptionAlgorithm` | — |
| `CreateTime` | `int64` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `State` | `RootKeyState` | 状态 |
| `PublishTime` | `int64` | — |
| `WrappedKeys` | `[]*WrappedKey` | 列表 |

**关联方法**（10 个）：`Meta`, `Copy`, `IsActive`, `MakeActive`, `IsRekeying`, `MakeRekeying`, `MakePrepublished`, `IsPrepublished`, `MakeInactive`, `IsInactive`

### WrappedKey

**定义位置**：[L227](file:///d:/claude/nomad/nomad/structs/keyring.go#L227)

**中文说明**：WrappedKey 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type WrappedKey struct {
	Provider string
	ProviderID string
	WrappedDataEncryptionKey *wrapping.BlobInfo
	WrappedRSAKey *wrapping.BlobInfo
	KeyEncryptionKey []byte
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Provider` | `string` | 字符串 |
| `ProviderID` | `string` | 字符串 |
| `WrappedDataEncryptionKey` | `*wrapping.BlobInfo` | — |
| `WrappedRSAKey` | `*wrapping.BlobInfo` | — |
| `KeyEncryptionKey` | `[]byte` | 字节数组 |

**关联方法**（1 个）：`Copy`

### RootKeyMeta

**定义位置**：[L264](file:///d:/claude/nomad/nomad/structs/keyring.go#L264)

**中文说明**：RootKeyMeta 是一个元数据结构体，包含对象的附加元信息。

**类型**：struct

```go
type RootKeyMeta struct {
	KeyID string
	Algorithm EncryptionAlgorithm
	CreateTime int64
	CreateIndex uint64
	ModifyIndex uint64
	State RootKeyState
	PublishTime int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `KeyID` | `string` | 字符串 |
| `Algorithm` | `EncryptionAlgorithm` | — |
| `CreateTime` | `int64` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `State` | `RootKeyState` | 状态 |
| `PublishTime` | `int64` | — |

**关联方法**（5 个）：`IsActive`, `IsPrepublished`, `IsInactive`, `Copy`, `Validate`

### KEKProviderName

**定义位置**：[L275](file:///d:/claude/nomad/nomad/structs/keyring.go#L275)

**类型定义**：`type KEKProviderName string`

**关联方法**（1 个）：`String`

### KEKProviderConfig

**定义位置**：[L292](file:///d:/claude/nomad/nomad/structs/keyring.go#L292)

**中文说明**：KEKProviderConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type KEKProviderConfig struct {
	Provider KEKProviderName `hcl:",key"`
	Name string `hcl:"name"`
	Active bool `hcl:"active"`
	Config map[string]string `hcl:"-" json:"-"`
	ExtraKeysHCL []string `hcl:",unusedKeys" json:"-"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Provider` | `KEKProviderName `hcl:",key"`` | — |
| `Name` | `string `hcl:"name"`` | 名称 |
| `Active` | `bool `hcl:"active"`` | 是否活跃 |
| `Config` | `map[string]string `hcl:"-" json:"-"`` | 配置 |
| `ExtraKeysHCL` | `[]string `hcl:",unusedKeys" json:"-"`` | 列表 |

**关联方法**（4 个）：`Validate`, `Copy`, `Merge`, `ID`

### RootKeyState

**定义位置**：[L348](file:///d:/claude/nomad/nomad/structs/keyring.go#L348)

**类型定义**：`type RootKeyState string`

### KeyEncryptionKeyWrapper

**定义位置**：[L423](file:///d:/claude/nomad/nomad/structs/keyring.go#L423)

**中文说明**：KeyEncryptionKeyWrapper 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type KeyEncryptionKeyWrapper struct {
	Meta *RootKeyMeta
	Provider string `json:"Provider,omitempty"`
	ProviderID string `json:"ProviderID,omitempty"`
	WrappedDataEncryptionKey *wrapping.BlobInfo `json:"WrappedDEK,omitempty"`
	WrappedRSAKey *wrapping.BlobInfo `json:"WrappedRSAKey,omitempty"`
	KeyEncryptionKey []byte `json:"KEK,omitempty"`
	EncryptedDataEncryptionKey []byte `json:"DEK,omitempty"`
	EncryptedRSAKey []byte `json:"RSAKey,omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `*RootKeyMeta` | 元数据 |
| `Provider` | `string `json:"Provider,omitempty"`` | 字符串 |
| `ProviderID` | `string `json:"ProviderID,omitempty"`` | 字符串 |
| `WrappedDataEncryptionKey` | `*wrapping.BlobInfo `json:"WrappedDEK,omitempty"`` | — |
| `WrappedRSAKey` | `*wrapping.BlobInfo `json:"WrappedRSAKey,omitempty"`` | — |
| `KeyEncryptionKey` | `[]byte `json:"KEK,omitempty"`` | 字节数组 |
| `EncryptedDataEncryptionKey` | `[]byte `json:"DEK,omitempty"`` | 字节数组 |
| `EncryptedRSAKey` | `[]byte `json:"RSAKey,omitempty"`` | 字节数组 |

### EncryptionAlgorithm

**定义位置**：[L442](file:///d:/claude/nomad/nomad/structs/keyring.go#L442)

**类型定义**：`type EncryptionAlgorithm string`

### KeyringRotateRootKeyRequest

**定义位置**：[L449](file:///d:/claude/nomad/nomad/structs/keyring.go#L449)

**中文说明**：KeyringRotateRootKeyRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type KeyringRotateRootKeyRequest struct {
	Algorithm EncryptionAlgorithm
	Full bool
	PublishTime int64
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Algorithm` | `EncryptionAlgorithm` | — |
| `Full` | `bool` | 布尔值 |
| `PublishTime` | `int64` | — |
| `WriteRequest` | `WriteRequest` | — |

### KeyringRotateRootKeyResponse

**定义位置**：[L457](file:///d:/claude/nomad/nomad/structs/keyring.go#L457)

**中文说明**：KeyringRotateRootKeyResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type KeyringRotateRootKeyResponse struct {
	Key *RootKeyMeta
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Key` | `*RootKeyMeta` | 键 |
| `WriteMeta` | `WriteMeta` | — |

### KeyringListRootKeyMetaRequest

**定义位置**：[L463](file:///d:/claude/nomad/nomad/structs/keyring.go#L463)

**中文说明**：KeyringListRootKeyMetaRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type KeyringListRootKeyMetaRequest struct {
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |

### KeyringListRootKeyMetaResponse

**定义位置**：[L468](file:///d:/claude/nomad/nomad/structs/keyring.go#L468)

**中文说明**：KeyringListRootKeyMetaResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type KeyringListRootKeyMetaResponse struct {
	Keys []*RootKeyMeta
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Keys` | `[]*RootKeyMeta` | 列表 |
| `QueryMeta` | `QueryMeta` | — |

### KeyringUpdateRootKeyRequest

**定义位置**：[L477](file:///d:/claude/nomad/nomad/structs/keyring.go#L477)

**中文说明**：KeyringUpdateRootKeyRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type KeyringUpdateRootKeyRequest struct {
	RootKey *UnwrappedRootKey
	Rekey bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `RootKey` | `*UnwrappedRootKey` | — |
| `Rekey` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### KeyringUpdateRootKeyResponse

**定义位置**：[L483](file:///d:/claude/nomad/nomad/structs/keyring.go#L483)

**中文说明**：KeyringUpdateRootKeyResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type KeyringUpdateRootKeyResponse struct {
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WriteMeta` | `WriteMeta` | — |

### KeyringUpsertWrappedRootKeyRequest

**定义位置**：[L490](file:///d:/claude/nomad/nomad/structs/keyring.go#L490)

**中文说明**：KeyringUpsertWrappedRootKeyRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type KeyringUpsertWrappedRootKeyRequest struct {
	WrappedRootKeys *RootKey
	Rekey bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WrappedRootKeys` | `*RootKey` | — |
| `Rekey` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### KeyringGetRootKeyRequest

**定义位置**：[L498](file:///d:/claude/nomad/nomad/structs/keyring.go#L498)

**中文说明**：KeyringGetRootKeyRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type KeyringGetRootKeyRequest struct {
	KeyID string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `KeyID` | `string` | 字符串 |
| `QueryOptions` | `QueryOptions` | — |

### KeyringGetRootKeyResponse

**定义位置**：[L503](file:///d:/claude/nomad/nomad/structs/keyring.go#L503)

**中文说明**：KeyringGetRootKeyResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type KeyringGetRootKeyResponse struct {
	Key *UnwrappedRootKey
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Key` | `*UnwrappedRootKey` | 键 |
| `QueryMeta` | `QueryMeta` | — |

### KeyringUpdateRootKeyMetaRequest

**定义位置**：[L511](file:///d:/claude/nomad/nomad/structs/keyring.go#L511)

**中文说明**：KeyringUpdateRootKeyMetaRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type KeyringUpdateRootKeyMetaRequest struct {
	RootKeyMeta *RootKeyMeta
	Rekey bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `RootKeyMeta` | `*RootKeyMeta` | — |
| `Rekey` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### KeyringUpdateRootKeyMetaResponse

**定义位置**：[L517](file:///d:/claude/nomad/nomad/structs/keyring.go#L517)

**中文说明**：KeyringUpdateRootKeyMetaResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type KeyringUpdateRootKeyMetaResponse struct {
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WriteMeta` | `WriteMeta` | — |

### KeyringDeleteRootKeyRequest

**定义位置**：[L521](file:///d:/claude/nomad/nomad/structs/keyring.go#L521)

**中文说明**：KeyringDeleteRootKeyRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type KeyringDeleteRootKeyRequest struct {
	KeyID string
	Force bool
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `KeyID` | `string` | 字符串 |
| `Force` | `bool` | 布尔值 |
| `WriteRequest` | `WriteRequest` | — |

### KeyringDeleteRootKeyResponse

**定义位置**：[L527](file:///d:/claude/nomad/nomad/structs/keyring.go#L527)

**中文说明**：KeyringDeleteRootKeyResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type KeyringDeleteRootKeyResponse struct {
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `WriteMeta` | `WriteMeta` | — |

### KeyringListPublicResponse

**定义位置**：[L533](file:///d:/claude/nomad/nomad/structs/keyring.go#L533)

**中文说明**：KeyringListPublicResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type KeyringListPublicResponse struct {
	PublicKeys []*KeyringPublicKey
	RotationThreshold time.Duration
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PublicKeys` | `[]*KeyringPublicKey` | 列表 |
| `RotationThreshold` | `time.Duration` | 时间间隔 |
| `QueryMeta` | `QueryMeta` | — |

### KeyringPublicKey

**定义位置**：[L546](file:///d:/claude/nomad/nomad/structs/keyring.go#L546)

**中文说明**：KeyringPublicKey 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type KeyringPublicKey struct {
	KeyID string
	PublicKey []byte
	Algorithm string
	Use string
	CreateTime int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `KeyID` | `string` | 字符串 |
| `PublicKey` | `[]byte` | 字节数组 |
| `Algorithm` | `string` | 字符串 |
| `Use` | `string` | 字符串 |
| `CreateTime` | `int64` | — |

**关联方法**（1 个）：`GetPublicKey`

### KeyringGetConfigResponse

**定义位置**：[L594](file:///d:/claude/nomad/nomad/structs/keyring.go#L594)

**中文说明**：KeyringGetConfigResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type KeyringGetConfigResponse struct {
	OIDCDiscovery *OIDCDiscoveryConfig
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `OIDCDiscovery` | `*OIDCDiscoveryConfig` | — |

### OIDCDiscoveryConfig

**定义位置**：[L604](file:///d:/claude/nomad/nomad/structs/keyring.go#L604)

**中文说明**：OIDCDiscoveryConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type OIDCDiscoveryConfig struct {
	Issuer string `json:"issuer"`
	JWKS string `json:"jwks_uri"`
	IDTokenAlgs []string `json:"id_token_signing_alg_values_supported"`
	ResponseTypes []string `json:"response_types_supported"`
	Subjects []string `json:"subject_types_supported"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Issuer` | `string `json:"issuer"`` | 字符串 |
| `JWKS` | `string `json:"jwks_uri"`` | 字符串 |
| `IDTokenAlgs` | `[]string `json:"id_token_signing_alg_values_supported"`` | 列表 |
| `ResponseTypes` | `[]string `json:"response_types_supported"`` | 列表 |
| `Subjects` | `[]string `json:"subject_types_supported"`` | 列表 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `PubKeyAlgEdDSA` | `—` | `string(jose.EdDSA)` | — |
| `PubKeyAlgRS256` | `—` | `string(jose.RS256)` | — |
| `PubKeyUseSig` | `—` | `"sig"` | — |
| `JWKSPath` | `—` | `"/.well-known/jwks.json"` | — |
| `KEKProviderAEAD` | `KEKProviderName` | `"aead"` | — |
| `KEKProviderAWSKMS` | `KEKProviderName` | `"awskms"` | — |
| `KEKProviderAzureKeyVault` | `KEKProviderName` | `"azurekeyvault"` | — |
| `KEKProviderGCPCloudKMS` | `KEKProviderName` | `"gcpckms"` | — |
| `KEKProviderVaultTransit` | `KEKProviderName` | `"transit"` | — |
| `RootKeyStateInactive` | `RootKeyState` | `"inactive"` | — |
| `RootKeyStateActive` | `RootKeyState` | `"active"` | — |
| `RootKeyStateRekeying` | `RootKeyState` | `"rekeying"` | — |
| `RootKeyStatePrepublished` | `RootKeyState` | `"prepublished"` | — |
| `RootKeyStateDeprecated` | `RootKeyState` | `"deprecated"` | — |
| `EncryptionAlgorithmAES256GCM` | `EncryptionAlgorithm` | `"aes256-gcm"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewUnwrappedRootKey` | - | `algorithm EncryptionAlgorithm` | `*UnwrappedRootKey, error` | [L55](file:///d:/claude/nomad/nomad/structs/keyring.go#L55) |
| `Copy` | `k *UnwrappedRootKey` | `` | `*UnwrappedRootKey` | [L83](file:///d:/claude/nomad/nomad/structs/keyring.go#L83) |
| `MakeActive` | `k *UnwrappedRootKey` | `` | `*UnwrappedRootKey` | [L92](file:///d:/claude/nomad/nomad/structs/keyring.go#L92) |
| `MakeInactive` | `k *UnwrappedRootKey` | `` | `*UnwrappedRootKey` | [L104](file:///d:/claude/nomad/nomad/structs/keyring.go#L104) |
| `NewRootKey` | - | `meta *RootKeyMeta` | `*RootKey` | [L128](file:///d:/claude/nomad/nomad/structs/keyring.go#L128) |
| `Meta` | `k *RootKey` | `` | `*RootKeyMeta` | [L141](file:///d:/claude/nomad/nomad/structs/keyring.go#L141) |
| `Copy` | `k *RootKey` | `` | `*RootKey` | [L153](file:///d:/claude/nomad/nomad/structs/keyring.go#L153) |
| `IsActive` | `k *RootKey` | `` | `bool` | [L164](file:///d:/claude/nomad/nomad/structs/keyring.go#L164) |
| `MakeActive` | `k *RootKey` | `` | `*RootKey` | [L169](file:///d:/claude/nomad/nomad/structs/keyring.go#L169) |
| `IsRekeying` | `k *RootKey` | `` | `bool` | [L180](file:///d:/claude/nomad/nomad/structs/keyring.go#L180) |
| `MakeRekeying` | `k *RootKey` | `` | `*RootKey` | [L185](file:///d:/claude/nomad/nomad/structs/keyring.go#L185) |
| `MakePrepublished` | `k *RootKey` | `t int64` | `*RootKey` | [L195](file:///d:/claude/nomad/nomad/structs/keyring.go#L195) |
| `IsPrepublished` | `k *RootKey` | `` | `bool` | [L206](file:///d:/claude/nomad/nomad/structs/keyring.go#L206) |
| `MakeInactive` | `k *RootKey` | `` | `*RootKey` | [L211](file:///d:/claude/nomad/nomad/structs/keyring.go#L211) |
| `IsInactive` | `k *RootKey` | `` | `bool` | [L221](file:///d:/claude/nomad/nomad/structs/keyring.go#L221) |
| `Copy` | `w *WrappedKey` | `` | `*WrappedKey` | [L251](file:///d:/claude/nomad/nomad/structs/keyring.go#L251) |
| `String` | `n *KEKProviderName` | `` | `string` | [L279](file:///d:/claude/nomad/nomad/structs/keyring.go#L279) |
| `Validate` | `c *KEKProviderConfig` | `` | `error` | [L305](file:///d:/claude/nomad/nomad/structs/keyring.go#L305) |
| `Copy` | `c *KEKProviderConfig` | `` | `*KEKProviderConfig` | [L320](file:///d:/claude/nomad/nomad/structs/keyring.go#L320) |
| `Merge` | `c *KEKProviderConfig` | `o *KEKProviderConfig` | `*KEKProviderConfig` | [L331](file:///d:/claude/nomad/nomad/structs/keyring.go#L331) |
| `ID` | `c *KEKProviderConfig` | `` | `string` | [L340](file:///d:/claude/nomad/nomad/structs/keyring.go#L340) |
| `NewRootKeyMeta` | - | `` | `*RootKeyMeta` | [L363](file:///d:/claude/nomad/nomad/structs/keyring.go#L363) |
| `IsActive` | `rkm *RootKeyMeta` | `` | `bool` | [L375](file:///d:/claude/nomad/nomad/structs/keyring.go#L375) |
| `IsPrepublished` | `rkm *RootKeyMeta` | `` | `bool` | [L381](file:///d:/claude/nomad/nomad/structs/keyring.go#L381) |
| `IsInactive` | `rkm *RootKeyMeta` | `` | `bool` | [L387](file:///d:/claude/nomad/nomad/structs/keyring.go#L387) |
| `Copy` | `rkm *RootKeyMeta` | `` | `*RootKeyMeta` | [L391](file:///d:/claude/nomad/nomad/structs/keyring.go#L391) |
| `Validate` | `rkm *RootKeyMeta` | `` | `error` | [L399](file:///d:/claude/nomad/nomad/structs/keyring.go#L399) |
| `GetPublicKey` | `pubKey *KeyringPublicKey` | `` | `any, error` | [L573](file:///d:/claude/nomad/nomad/structs/keyring.go#L573) |
| `NewOIDCDiscoveryConfig` | - | `issuer string` | `*OIDCDiscoveryConfig, error` | [L613](file:///d:/claude/nomad/nomad/structs/keyring.go#L613) |

## 5. 核心方法详解

### NewUnwrappedRootKey()

**签名**：`func NewUnwrappedRootKey(algorithm EncryptionAlgorithm) *UnwrappedRootKey, error`

**位置**：[L55](file:///d:/claude/nomad/nomad/structs/keyring.go#L55)

**中文说明**：创建并返回一个新的 UnwrappedRootKey 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `algorithm` | `EncryptionAlgorithm` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*UnwrappedRootKey` | — |
| `error` | 错误信息 |

### Copy()

**签名**：`func (k *UnwrappedRootKey) Copy() *UnwrappedRootKey`

**位置**：[L83](file:///d:/claude/nomad/nomad/structs/keyring.go#L83)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*UnwrappedRootKey` | — |

### NewRootKey()

**签名**：`func NewRootKey(meta *RootKeyMeta) *RootKey`

**位置**：[L128](file:///d:/claude/nomad/nomad/structs/keyring.go#L128)

**中文说明**：创建并返回一个新的 RootKey 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `meta` | `*RootKeyMeta` | 元数据 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*RootKey` | — |

### Copy()

**签名**：`func (k *RootKey) Copy() *RootKey`

**位置**：[L153](file:///d:/claude/nomad/nomad/structs/keyring.go#L153)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*RootKey` | — |

### Copy()

**签名**：`func (w *WrappedKey) Copy() *WrappedKey`

**位置**：[L251](file:///d:/claude/nomad/nomad/structs/keyring.go#L251)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WrappedKey` | — |

### Validate()

**签名**：`func (c *KEKProviderConfig) Validate() error`

**位置**：[L305](file:///d:/claude/nomad/nomad/structs/keyring.go#L305)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Copy()

**签名**：`func (c *KEKProviderConfig) Copy() *KEKProviderConfig`

**位置**：[L320](file:///d:/claude/nomad/nomad/structs/keyring.go#L320)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*KEKProviderConfig` | — |

### NewRootKeyMeta()

**签名**：`func NewRootKeyMeta() *RootKeyMeta`

**位置**：[L363](file:///d:/claude/nomad/nomad/structs/keyring.go#L363)

**中文说明**：创建并返回一个新的 RootKeyMeta 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*RootKeyMeta` | — |

### Copy()

**签名**：`func (rkm *RootKeyMeta) Copy() *RootKeyMeta`

**位置**：[L391](file:///d:/claude/nomad/nomad/structs/keyring.go#L391)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*RootKeyMeta` | — |

### Validate()

**签名**：`func (rkm *RootKeyMeta) Validate() error`

**位置**：[L399](file:///d:/claude/nomad/nomad/structs/keyring.go#L399)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### NewOIDCDiscoveryConfig()

**签名**：`func NewOIDCDiscoveryConfig(issuer string) *OIDCDiscoveryConfig, error`

**位置**：[L613](file:///d:/claude/nomad/nomad/structs/keyring.go#L613)

**中文说明**：创建并返回一个新的 OIDCDiscoveryConfig 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `issuer` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*OIDCDiscoveryConfig` | — |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `crypto/ed25519` | 标准库 |
| `crypto/rand` | 标准库 |
| `crypto/rsa` | 标准库 |
| `crypto/x509` | 标准库 |
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `net/url` | 标准库 |
| `slices` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/crypto` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/go-jose/go-jose/v3` | 第三方库 |
| `github.com/golang/protobuf/proto` | 第三方库 |
| `github.com/hashicorp/go-kms-wrapping/v2` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **加密安全**：使用 Go crypto 标准库实现加密、签名或 TLS 通信
- **gRPC 通信**：使用 gRPC 进行进程间通信
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [keyring_test.go](file:///d:/claude/nomad/nomad/structs/keyring_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

