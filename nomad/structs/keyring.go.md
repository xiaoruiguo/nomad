# keyring.go 代码说明文档

> 文件路径：[structs/keyring.go](file:///d:/claude/nomad/nomad/structs/keyring.go)
> 总行数：641 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### UnwrappedRootKey

**定义位置**：[L44](file:///d:/claude/nomad/nomad/structs/keyring.go#L44)

**类型**：struct

```go
	Meta *RootKeyMeta
	Key []byte
	RSAKey []byte
```

**关联方法**（3 个）：`Copy`, `MakeActive`, `MakeInactive`

### RootKey

**定义位置**：[L116](file:///d:/claude/nomad/nomad/structs/keyring.go#L116)

**类型**：struct

```go
	KeyID string
	Algorithm EncryptionAlgorithm
	CreateTime int64
	CreateIndex uint64
	ModifyIndex uint64
	State RootKeyState
	PublishTime int64
	WrappedKeys []*WrappedKey
```

**关联方法**（10 个）：`Meta`, `Copy`, `IsActive`, `MakeActive`, `IsRekeying`, `MakeRekeying`, `MakePrepublished`, `IsPrepublished`, `MakeInactive`, `IsInactive`

### WrappedKey

**定义位置**：[L227](file:///d:/claude/nomad/nomad/structs/keyring.go#L227)

**类型**：struct

```go
	Provider string
	ProviderID string
	WrappedDataEncryptionKey *wrapping.BlobInfo
	WrappedRSAKey *wrapping.BlobInfo
	KeyEncryptionKey []byte
```

**关联方法**（1 个）：`Copy`

### RootKeyMeta

**定义位置**：[L264](file:///d:/claude/nomad/nomad/structs/keyring.go#L264)

**类型**：struct

```go
	KeyID string
	Algorithm EncryptionAlgorithm
	CreateTime int64
	CreateIndex uint64
	ModifyIndex uint64
	State RootKeyState
	PublishTime int64
```

**关联方法**（5 个）：`IsActive`, `IsPrepublished`, `IsInactive`, `Copy`, `Validate`

### KEKProviderName

**定义位置**：[L275](file:///d:/claude/nomad/nomad/structs/keyring.go#L275)

**类型定义**：`string`

**关联方法**（1 个）：`String`

### KEKProviderConfig

**定义位置**：[L292](file:///d:/claude/nomad/nomad/structs/keyring.go#L292)

**类型**：struct

```go
	Provider KEKProviderName `hcl:",key"`
	Name string `hcl:"name"`
	Active bool `hcl:"active"`
	Config map[string]string `hcl:"-" json:"-"`
	ExtraKeysHCL []string `hcl:",unusedKeys" json:"-"`
```

**关联方法**（4 个）：`Validate`, `Copy`, `Merge`, `ID`

### RootKeyState

**定义位置**：[L348](file:///d:/claude/nomad/nomad/structs/keyring.go#L348)

**类型定义**：`string`

### KeyEncryptionKeyWrapper

**定义位置**：[L423](file:///d:/claude/nomad/nomad/structs/keyring.go#L423)

**类型**：struct

```go
	Meta *RootKeyMeta
	Provider string `json:"Provider,omitempty"`
	ProviderID string `json:"ProviderID,omitempty"`
	WrappedDataEncryptionKey *wrapping.BlobInfo `json:"WrappedDEK,omitempty"`
	WrappedRSAKey *wrapping.BlobInfo `json:"WrappedRSAKey,omitempty"`
	KeyEncryptionKey []byte `json:"KEK,omitempty"`
	EncryptedDataEncryptionKey []byte `json:"DEK,omitempty"`
	EncryptedRSAKey []byte `json:"RSAKey,omitempty"`
```

### EncryptionAlgorithm

**定义位置**：[L442](file:///d:/claude/nomad/nomad/structs/keyring.go#L442)

**类型定义**：`string`

### KeyringRotateRootKeyRequest

**定义位置**：[L449](file:///d:/claude/nomad/nomad/structs/keyring.go#L449)

**类型**：struct

```go
	Algorithm EncryptionAlgorithm
	Full bool
	PublishTime int64
	WriteRequest
```

### KeyringRotateRootKeyResponse

**定义位置**：[L457](file:///d:/claude/nomad/nomad/structs/keyring.go#L457)

**类型**：struct

```go
	Key *RootKeyMeta
	WriteMeta
```

### KeyringListRootKeyMetaRequest

**定义位置**：[L463](file:///d:/claude/nomad/nomad/structs/keyring.go#L463)

**类型**：struct

```go
	QueryOptions
```

### KeyringListRootKeyMetaResponse

**定义位置**：[L468](file:///d:/claude/nomad/nomad/structs/keyring.go#L468)

**类型**：struct

```go
	Keys []*RootKeyMeta
	QueryMeta
```

### KeyringUpdateRootKeyRequest

**定义位置**：[L477](file:///d:/claude/nomad/nomad/structs/keyring.go#L477)

**类型**：struct

```go
	RootKey *UnwrappedRootKey
	Rekey bool
	WriteRequest
```

### KeyringUpdateRootKeyResponse

**定义位置**：[L483](file:///d:/claude/nomad/nomad/structs/keyring.go#L483)

**类型**：struct

```go
	WriteMeta
```

### KeyringUpsertWrappedRootKeyRequest

**定义位置**：[L490](file:///d:/claude/nomad/nomad/structs/keyring.go#L490)

**类型**：struct

```go
	WrappedRootKeys *RootKey
	Rekey bool
	WriteRequest
```

### KeyringGetRootKeyRequest

**定义位置**：[L498](file:///d:/claude/nomad/nomad/structs/keyring.go#L498)

**类型**：struct

```go
	KeyID string
	QueryOptions
```

### KeyringGetRootKeyResponse

**定义位置**：[L503](file:///d:/claude/nomad/nomad/structs/keyring.go#L503)

**类型**：struct

```go
	Key *UnwrappedRootKey
	QueryMeta
```

### KeyringUpdateRootKeyMetaRequest

**定义位置**：[L511](file:///d:/claude/nomad/nomad/structs/keyring.go#L511)

**类型**：struct

```go
	RootKeyMeta *RootKeyMeta
	Rekey bool
	WriteRequest
```

### KeyringUpdateRootKeyMetaResponse

**定义位置**：[L517](file:///d:/claude/nomad/nomad/structs/keyring.go#L517)

**类型**：struct

```go
	WriteMeta
```

### KeyringDeleteRootKeyRequest

**定义位置**：[L521](file:///d:/claude/nomad/nomad/structs/keyring.go#L521)

**类型**：struct

```go
	KeyID string
	Force bool
	WriteRequest
```

### KeyringDeleteRootKeyResponse

**定义位置**：[L527](file:///d:/claude/nomad/nomad/structs/keyring.go#L527)

**类型**：struct

```go
	WriteMeta
```

### KeyringListPublicResponse

**定义位置**：[L533](file:///d:/claude/nomad/nomad/structs/keyring.go#L533)

**类型**：struct

```go
	PublicKeys []*KeyringPublicKey
	RotationThreshold time.Duration
	QueryMeta
```

### KeyringPublicKey

**定义位置**：[L546](file:///d:/claude/nomad/nomad/structs/keyring.go#L546)

**类型**：struct

```go
	KeyID string
	PublicKey []byte
	Algorithm string
	Use string
	CreateTime int64
```

**关联方法**（1 个）：`GetPublicKey`

### KeyringGetConfigResponse

**定义位置**：[L594](file:///d:/claude/nomad/nomad/structs/keyring.go#L594)

**类型**：struct

```go
	OIDCDiscovery *OIDCDiscoveryConfig
```

### OIDCDiscoveryConfig

**定义位置**：[L604](file:///d:/claude/nomad/nomad/structs/keyring.go#L604)

**类型**：struct

```go
	Issuer string `json:"issuer"`
	JWKS string `json:"jwks_uri"`
	IDTokenAlgs []string `json:"id_token_signing_alg_values_supported"`
	ResponseTypes []string `json:"response_types_supported"`
	Subjects []string `json:"subject_types_supported"`
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `PubKeyAlgEdDSA` | `string(jose.EdDSA)` |
| `PubKeyAlgRS256` | `string(jose.RS256)` |
| `PubKeyUseSig` | `"sig"` |
| `JWKSPath` | `"/.well-known/jwks.json"` |
| `KEKProviderAEAD` | `"aead"` |
| `KEKProviderAWSKMS` | `"awskms"` |
| `KEKProviderAzureKeyVault` | `"azurekeyvault"` |
| `KEKProviderGCPCloudKMS` | `"gcpckms"` |
| `KEKProviderVaultTransit` | `"transit"` |
| `RootKeyStateInactive` | `"inactive"` |
| `RootKeyStateActive` | `"active"` |
| `RootKeyStateRekeying` | `"rekeying"` |
| `RootKeyStatePrepublished` | `"prepublished"` |
| `RootKeyStateDeprecated` | `"deprecated"` |
| `EncryptionAlgorithmAES256GCM` | `"aes256-gcm"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewUnwrappedRootKey` | - | `algorithm EncryptionAlgorithm` | `*UnwrappedRootKey, error` | [L55](file:///d:/claude/nomad/nomad/structs/keyring.go#L55) |
| `Copy` | `k *UnwrappedRootKey` | - | `*UnwrappedRootKey` | [L83](file:///d:/claude/nomad/nomad/structs/keyring.go#L83) |
| `MakeActive` | `k *UnwrappedRootKey` | - | `*UnwrappedRootKey` | [L92](file:///d:/claude/nomad/nomad/structs/keyring.go#L92) |
| `MakeInactive` | `k *UnwrappedRootKey` | - | `*UnwrappedRootKey` | [L104](file:///d:/claude/nomad/nomad/structs/keyring.go#L104) |
| `NewRootKey` | - | `meta *RootKeyMeta` | `*RootKey` | [L128](file:///d:/claude/nomad/nomad/structs/keyring.go#L128) |
| `Meta` | `k *RootKey` | - | `*RootKeyMeta` | [L141](file:///d:/claude/nomad/nomad/structs/keyring.go#L141) |
| `Copy` | `k *RootKey` | - | `*RootKey` | [L153](file:///d:/claude/nomad/nomad/structs/keyring.go#L153) |
| `IsActive` | `k *RootKey` | - | `bool` | [L164](file:///d:/claude/nomad/nomad/structs/keyring.go#L164) |
| `MakeActive` | `k *RootKey` | - | `*RootKey` | [L169](file:///d:/claude/nomad/nomad/structs/keyring.go#L169) |
| `IsRekeying` | `k *RootKey` | - | `bool` | [L180](file:///d:/claude/nomad/nomad/structs/keyring.go#L180) |
| `MakeRekeying` | `k *RootKey` | - | `*RootKey` | [L185](file:///d:/claude/nomad/nomad/structs/keyring.go#L185) |
| `MakePrepublished` | `k *RootKey` | `t int64` | `*RootKey` | [L195](file:///d:/claude/nomad/nomad/structs/keyring.go#L195) |
| `IsPrepublished` | `k *RootKey` | - | `bool` | [L206](file:///d:/claude/nomad/nomad/structs/keyring.go#L206) |
| `MakeInactive` | `k *RootKey` | - | `*RootKey` | [L211](file:///d:/claude/nomad/nomad/structs/keyring.go#L211) |
| `IsInactive` | `k *RootKey` | - | `bool` | [L221](file:///d:/claude/nomad/nomad/structs/keyring.go#L221) |
| `Copy` | `w *WrappedKey` | - | `*WrappedKey` | [L251](file:///d:/claude/nomad/nomad/structs/keyring.go#L251) |
| `String` | `n *KEKProviderName` | - | `string` | [L279](file:///d:/claude/nomad/nomad/structs/keyring.go#L279) |
| `Validate` | `c *KEKProviderConfig` | - | `error` | [L305](file:///d:/claude/nomad/nomad/structs/keyring.go#L305) |
| `Copy` | `c *KEKProviderConfig` | - | `*KEKProviderConfig` | [L320](file:///d:/claude/nomad/nomad/structs/keyring.go#L320) |
| `Merge` | `c *KEKProviderConfig` | `o *KEKProviderConfig` | `*KEKProviderConfig` | [L331](file:///d:/claude/nomad/nomad/structs/keyring.go#L331) |
| `ID` | `c *KEKProviderConfig` | - | `string` | [L340](file:///d:/claude/nomad/nomad/structs/keyring.go#L340) |
| `NewRootKeyMeta` | - | - | `*RootKeyMeta` | [L363](file:///d:/claude/nomad/nomad/structs/keyring.go#L363) |
| `IsActive` | `rkm *RootKeyMeta` | - | `bool` | [L375](file:///d:/claude/nomad/nomad/structs/keyring.go#L375) |
| `IsPrepublished` | `rkm *RootKeyMeta` | - | `bool` | [L381](file:///d:/claude/nomad/nomad/structs/keyring.go#L381) |
| `IsInactive` | `rkm *RootKeyMeta` | - | `bool` | [L387](file:///d:/claude/nomad/nomad/structs/keyring.go#L387) |
| `Copy` | `rkm *RootKeyMeta` | - | `*RootKeyMeta` | [L391](file:///d:/claude/nomad/nomad/structs/keyring.go#L391) |
| `Validate` | `rkm *RootKeyMeta` | - | `error` | [L399](file:///d:/claude/nomad/nomad/structs/keyring.go#L399) |
| `GetPublicKey` | `pubKey *KeyringPublicKey` | - | `any, error` | [L573](file:///d:/claude/nomad/nomad/structs/keyring.go#L573) |
| `NewOIDCDiscoveryConfig` | - | `issuer string` | `*OIDCDiscoveryConfig, error` | [L613](file:///d:/claude/nomad/nomad/structs/keyring.go#L613) |

## 5. 核心方法详解

### Validate()

**签名**：`func (c *KEKProviderConfig) Validate() error`

**位置**：[L305](file:///d:/claude/nomad/nomad/structs/keyring.go#L305)

### Validate()

**签名**：`func (rkm *RootKeyMeta) Validate() error`

**位置**：[L399](file:///d:/claude/nomad/nomad/structs/keyring.go#L399)

### GetPublicKey()

**签名**：`func (pubKey *KeyringPublicKey) GetPublicKey() any, error`

**位置**：[L573](file:///d:/claude/nomad/nomad/structs/keyring.go#L573)

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
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析
- **gRPC 通信**：使用 gRPC 进行进程间通信

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [keyring_test.go](file:///d:/claude/nomad/nomad/structs/keyring_test.go) | 对应测试文件 |

