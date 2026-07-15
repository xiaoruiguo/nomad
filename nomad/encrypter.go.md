# encrypter.go 代码说明文档

> 文件路径：[encrypter.go](file:///d:/claude/nomad/nomad/encrypter.go)
> 总行数：1258 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **加密器**，管理 Nomad 集群的加密密钥，用于 Raft 传输加密和状态加密。

## 2. 类型定义

### claimSigner

**定义位置**：[L44](file:///d:/claude/nomad/nomad/encrypter.go#L44)

**类型**：interface

```go
	SignClaims
```

### Encrypter

**定义位置**：[L50](file:///d:/claude/nomad/nomad/encrypter.go#L50)

**类型**：struct

```go
	srv *Server
	log hclog.Logger
	providerConfigs map[string]*structs.KEKProviderConfig
	keystorePath string
	issuer string
	keyring map[string]*cipherSet
	keyringLock sync.RWMutex
	decryptTasks map[string]struct{...}
	decryptTasksLock sync.RWMutex
```

**关联方法**（24 个）：`loadKeystore`, `IsReady`, `Encrypt`, `Decrypt`, `SignClaims`, `VerifyClaim`, `AddUnwrappedKey`, `AddWrappedKey`, `decryptWrappedKeyTask`, `addCipher`, `generateCipher`, `waitForKey`, `GetActiveKey`, `GetKey`, `activeCipherSet`, `cipherSetByIDLocked`, `RemoveKey`, `wrapRootKey`, `encryptDEK`, `writeKeyToDisk`, `loadKeyFromStore`, `waitForPublicKey`, `GetPublicKey`, `newKMSWrapper`

### cipherSet

**定义位置**：[L81](file:///d:/claude/nomad/nomad/encrypter.go#L81)

**类型**：struct

```go
	rootKey *structs.UnwrappedRootKey
	cipher cipher.AEAD
	eddsaPrivateKey ed25519.PrivateKey
	rsaPrivateKey *rsa.PrivateKey
	rsaPKCS1PublicKey []byte
```

### KeyringReplicator

**定义位置**：[L1112](file:///d:/claude/nomad/nomad/encrypter.go#L1112)

**类型**：struct

```go
	srv *Server
	encrypter *Encrypter
	logger hclog.Logger
	stopFn context.CancelFunc
```

**关联方法**（3 个）：`stop`, `run`, `replicateKey`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `nomadKeystoreExtension` | `".nks.json"` |
| `keyIDHeader` | `"kid"` |
| `keyringReplicationRate` | `5` |

### 变量

| 名称 | 值 |
|------|----|
| `ErrDecryptFailed` | `errors.New("unable to decrypt wrapped key")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewEncrypter` | - | `srv *Server, keystorePath string` | `*Encrypter, error` | [L91](file:///d:/claude/nomad/nomad/encrypter.go#L91) |
| `fallbackVaultConfig` | - | `provider *structs.KEKProviderConfig, vaultcfg *config.VaultConfig` | - | [L119](file:///d:/claude/nomad/nomad/encrypter.go#L119) |
| `loadKeystore` | `e *Encrypter` | - | `error` | [L151](file:///d:/claude/nomad/nomad/encrypter.go#L151) |
| `IsReady` | `e *Encrypter` | `ctx context.Context` | `error` | [L219](file:///d:/claude/nomad/nomad/encrypter.go#L219) |
| `Encrypt` | `e *Encrypter` | `cleartext []byte` | `[]byte, string, error` | [L273](file:///d:/claude/nomad/nomad/encrypter.go#L273) |
| `Decrypt` | `e *Encrypter` | `ciphertext []byte, keyID string` | `[]byte, error` | [L298](file:///d:/claude/nomad/nomad/encrypter.go#L298) |
| `SignClaims` | `e *Encrypter` | `claims *structs.IdentityClaims` | `string, string, error` | [L325](file:///d:/claude/nomad/nomad/encrypter.go#L325) |
| `VerifyClaim` | `e *Encrypter` | `tokenString string` | `*structs.IdentityClaims, error` | [L368](file:///d:/claude/nomad/nomad/encrypter.go#L368) |
| `AddUnwrappedKey` | `e *Encrypter` | `rootKey *structs.UnwrappedRootKey, isUpgraded bool` | `*structs.RootKey, error` | [L412](file:///d:/claude/nomad/nomad/encrypter.go#L412) |
| `AddWrappedKey` | `e *Encrypter` | `ctx context.Context, wrappedKeys *structs.RootKey` | `error` | [L426](file:///d:/claude/nomad/nomad/encrypter.go#L426) |
| `decryptWrappedKeyTask` | `e *Encrypter` | `ctx context.Context, wrapper kms.Wrapper, meta *structs.RootKeyMeta, wrapped...` | `error` | [L572](file:///d:/claude/nomad/nomad/encrypter.go#L572) |
| `addCipher` | `e *Encrypter` | `rootKey *structs.UnwrappedRootKey` | `error` | [L652](file:///d:/claude/nomad/nomad/encrypter.go#L652) |
| `generateCipher` | `e *Encrypter` | `rootKey *structs.UnwrappedRootKey` | `*cipherSet, error` | [L665](file:///d:/claude/nomad/nomad/encrypter.go#L665) |
| `waitForKey` | `e *Encrypter` | `ctx context.Context, keyID string` | `*cipherSet, error` | [L711](file:///d:/claude/nomad/nomad/encrypter.go#L711) |
| `GetActiveKey` | `e *Encrypter` | - | `*rsa.PrivateKey, string, error` | [L735](file:///d:/claude/nomad/nomad/encrypter.go#L735) |
| `GetKey` | `e *Encrypter` | `keyID string` | `*structs.UnwrappedRootKey, error` | [L744](file:///d:/claude/nomad/nomad/encrypter.go#L744) |
| `activeCipherSet` | `e *Encrypter` | - | `*cipherSet, error` | [L765](file:///d:/claude/nomad/nomad/encrypter.go#L765) |
| `cipherSetByIDLocked` | `e *Encrypter` | `keyID string` | `*cipherSet, error` | [L782](file:///d:/claude/nomad/nomad/encrypter.go#L782) |
| `RemoveKey` | `e *Encrypter` | `keyID string` | `error` | [L791](file:///d:/claude/nomad/nomad/encrypter.go#L791) |
| `wrapRootKey` | `e *Encrypter` | `rootKey *structs.UnwrappedRootKey, isUpgraded bool` | `*structs.RootKey, error` | [L801](file:///d:/claude/nomad/nomad/encrypter.go#L801) |
| `encryptDEK` | `e *Encrypter` | `rootKey *structs.UnwrappedRootKey, provider *structs.KEKProviderConfig` | `*structs.WrappedKey, error` | [L864](file:///d:/claude/nomad/nomad/encrypter.go#L864) |
| `writeKeyToDisk` | `e *Encrypter` | `meta *structs.RootKeyMeta, provider *structs.KEKProviderConfig, wrappedKey *...` | `string, error` | [L906](file:///d:/claude/nomad/nomad/encrypter.go#L906) |
| `loadKeyFromStore` | `e *Encrypter` | `path string` | `*structs.UnwrappedRootKey, error` | [L937](file:///d:/claude/nomad/nomad/encrypter.go#L937) |
| `waitForPublicKey` | `e *Encrypter` | `keyID string` | `*structs.KeyringPublicKey, error` | [L1012](file:///d:/claude/nomad/nomad/encrypter.go#L1012) |
| `GetPublicKey` | `e *Encrypter` | `keyID string` | `*structs.KeyringPublicKey, error` | [L1039](file:///d:/claude/nomad/nomad/encrypter.go#L1039) |
| `newKMSWrapper` | `e *Encrypter` | `provider *structs.KEKProviderConfig, keyID string, kek []byte` | `kms.Wrapper, error` | [L1067](file:///d:/claude/nomad/nomad/encrypter.go#L1067) |
| `NewKeyringReplicator` | - | `srv *Server, e *Encrypter` | `*KeyringReplicator` | [L1119](file:///d:/claude/nomad/nomad/encrypter.go#L1119) |
| `stop` | `krr *KeyringReplicator` | - | - | [L1132](file:///d:/claude/nomad/nomad/encrypter.go#L1132) |
| `run` | `krr *KeyringReplicator` | `ctx context.Context` | - | [L1138](file:///d:/claude/nomad/nomad/encrypter.go#L1138) |
| `replicateKey` | `krr *KeyringReplicator` | `ctx context.Context, wrappedKeys *structs.RootKey` | `error` | [L1193](file:///d:/claude/nomad/nomad/encrypter.go#L1193) |

## 5. 核心方法详解

### GetActiveKey()

**签名**：`func (e *Encrypter) GetActiveKey() *rsa.PrivateKey, string, error`

**位置**：[L735](file:///d:/claude/nomad/nomad/encrypter.go#L735)

### GetKey()

**签名**：`func (e *Encrypter) GetKey(keyID string) *structs.UnwrappedRootKey, error`

**位置**：[L744](file:///d:/claude/nomad/nomad/encrypter.go#L744)

### GetPublicKey()

**签名**：`func (e *Encrypter) GetPublicKey(keyID string) *structs.KeyringPublicKey, error`

**位置**：[L1039](file:///d:/claude/nomad/nomad/encrypter.go#L1039)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `crypto/aes` | 标准库 |
| `crypto/cipher` | 标准库 |
| `crypto/ed25519` | 标准库 |
| `crypto/rsa` | 标准库 |
| `crypto/x509` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io/fs` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/crypto` | 内部包 |
| `github.com/hashicorp/nomad/helper/joseutil` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs/config` | 内部包 |
| `github.com/go-jose/go-jose/v3` | 第三方库 |
| `github.com/go-jose/go-jose/v3/jwt` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-kms-wrapping/v2` | 第三方库 |
| `github.com/hashicorp/go-kms-wrapping/v2/aead` | 第三方库 |
| `github.com/hashicorp/go-kms-wrapping/wrappers/awskms/v2` | 第三方库 |
| `github.com/hashicorp/go-kms-wrapping/wrappers/azurekeyvault/v2` | 第三方库 |
| `github.com/hashicorp/go-kms-wrapping/wrappers/gcpckms/v2` | 第三方库 |
| `github.com/hashicorp/go-kms-wrapping/wrappers/transit/v2` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/raft` | 第三方库 |
| `golang.org/x/time/rate` | 第三方库 |

## 7. 设计模式与技术特点

- **组合模式**：结构体嵌入 Server 引用，通过组合获取 Server 上下文
- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Raft 共识**：使用 HashiCorp Raft 库实现分布式共识，保证状态一致性
- **RPC 端点模式**：定义 RPC 端点结构体，将 Server 引用注入端点，处理特定资源的 RPC 请求
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [encrypter_test.go](file:///d:/claude/nomad/nomad/encrypter_test.go) | 对应测试文件 |

