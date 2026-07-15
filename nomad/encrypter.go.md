# encrypter.go 代码说明文档

> 文件路径：[nomad/encrypter.go](file:///d:/claude/nomad/nomad/encrypter.go)
> 总行数：1258 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad 核心包**（`nomad/`），实现 Server/Client 核心功能，包括 Raft 共识、状态管理、调度系统、RPC 处理等。当前文件 `encrypter.go` 提供相关功能实现。

## 2. 类型定义

### claimSigner

**定义位置**：[L44](file:///d:/claude/nomad/nomad/encrypter.go#L44)

**中文说明**：claimSigner 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type claimSigner interface {
	SignClaims func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `SignClaims` | `func(...)` | — |

### Encrypter

**定义位置**：[L50](file:///d:/claude/nomad/nomad/encrypter.go#L50)

**中文说明**：Encrypter 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Encrypter struct {
	srv *Server
	log hclog.Logger
	providerConfigs map[string]*structs.KEKProviderConfig
	keystorePath string
	issuer string
	keyring map[string]*cipherSet
	keyringLock sync.RWMutex
	decryptTasks map[string]struct{...}
	decryptTasksLock sync.RWMutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `srv` | `*Server` | 关联的 Server 实例 |
| `log` | `hclog.Logger` | 日志记录器 |
| `providerConfigs` | `map[string]*structs.KEKProviderConfig` | 映射表 |
| `keystorePath` | `string` | 字符串 |
| `issuer` | `string` | 字符串 |
| `keyring` | `map[string]*cipherSet` | 映射表 |
| `keyringLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |
| `decryptTasks` | `map[string]struct{...}` | 映射表 |
| `decryptTasksLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |

**关联方法**（24 个）：`loadKeystore`, `IsReady`, `Encrypt`, `Decrypt`, `SignClaims`, `VerifyClaim`, `AddUnwrappedKey`, `AddWrappedKey`, `decryptWrappedKeyTask`, `addCipher`, `generateCipher`, `waitForKey`, `GetActiveKey`, `GetKey`, `activeCipherSet`, `cipherSetByIDLocked`, `RemoveKey`, `wrapRootKey`, `encryptDEK`, `writeKeyToDisk`, `loadKeyFromStore`, `waitForPublicKey`, `GetPublicKey`, `newKMSWrapper`

### cipherSet

**定义位置**：[L81](file:///d:/claude/nomad/nomad/encrypter.go#L81)

**中文说明**：cipherSet 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type cipherSet struct {
	rootKey *structs.UnwrappedRootKey
	cipher cipher.AEAD
	eddsaPrivateKey ed25519.PrivateKey
	rsaPrivateKey *rsa.PrivateKey
	rsaPKCS1PublicKey []byte
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `rootKey` | `*structs.UnwrappedRootKey` | — |
| `cipher` | `cipher.AEAD` | — |
| `eddsaPrivateKey` | `ed25519.PrivateKey` | — |
| `rsaPrivateKey` | `*rsa.PrivateKey` | — |
| `rsaPKCS1PublicKey` | `[]byte` | 字节数组 |

### KeyringReplicator

**定义位置**：[L1112](file:///d:/claude/nomad/nomad/encrypter.go#L1112)

**中文说明**：KeyringReplicator 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type KeyringReplicator struct {
	srv *Server
	encrypter *Encrypter
	logger hclog.Logger
	stopFn context.CancelFunc
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `srv` | `*Server` | 关联的 Server 实例 |
| `encrypter` | `*Encrypter` | 加密器，管理根密钥 |
| `logger` | `hclog.Logger` | 日志记录器 |
| `stopFn` | `context.CancelFunc` | 取消函数，用于取消上下文 |

**关联方法**（3 个）：`stop`, `run`, `replicateKey`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `nomadKeystoreExtension` | `—` | `".nks.json"` | — |
| `keyIDHeader` | `—` | `"kid"` | — |
| `keyringReplicationRate` | `—` | `5` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ErrDecryptFailed` | `—` | `errors.New("unable to decrypt wrapped key")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewEncrypter` | - | `srv *Server, keystorePath string` | `*Encrypter, error` | [L91](file:///d:/claude/nomad/nomad/encrypter.go#L91) |
| `fallbackVaultConfig` | - | `provider *structs.KEKProviderConfig, vaultcfg *config.VaultConfig` | `` | [L119](file:///d:/claude/nomad/nomad/encrypter.go#L119) |
| `loadKeystore` | `e *Encrypter` | `` | `error` | [L151](file:///d:/claude/nomad/nomad/encrypter.go#L151) |
| `IsReady` | `e *Encrypter` | `ctx context.Context` | `error` | [L219](file:///d:/claude/nomad/nomad/encrypter.go#L219) |
| `Encrypt` | `e *Encrypter` | `cleartext []byte` | `[]byte, string, error` | [L273](file:///d:/claude/nomad/nomad/encrypter.go#L273) |
| `Decrypt` | `e *Encrypter` | `ciphertext []byte, keyID string` | `[]byte, error` | [L298](file:///d:/claude/nomad/nomad/encrypter.go#L298) |
| `SignClaims` | `e *Encrypter` | `claims *structs.IdentityClaims` | `string, string, error` | [L325](file:///d:/claude/nomad/nomad/encrypter.go#L325) |
| `VerifyClaim` | `e *Encrypter` | `tokenString string` | `*structs.IdentityClaims, error` | [L368](file:///d:/claude/nomad/nomad/encrypter.go#L368) |
| `AddUnwrappedKey` | `e *Encrypter` | `rootKey *structs.UnwrappedRootKey, isUpgraded bool` | `*structs.RootKey, error` | [L412](file:///d:/claude/nomad/nomad/encrypter.go#L412) |
| `AddWrappedKey` | `e *Encrypter` | `ctx context.Context, wrappedKeys *structs.RootKey` | `error` | [L426](file:///d:/claude/nomad/nomad/encrypter.go#L426) |
| `decryptWrappedKeyTask` | `e *Encrypter` | `ctx context.Context, wrapper kms.Wrapper, meta *structs.RootKeyMeta, wrappedK...` | `error` | [L572](file:///d:/claude/nomad/nomad/encrypter.go#L572) |
| `addCipher` | `e *Encrypter` | `rootKey *structs.UnwrappedRootKey` | `error` | [L652](file:///d:/claude/nomad/nomad/encrypter.go#L652) |
| `generateCipher` | `e *Encrypter` | `rootKey *structs.UnwrappedRootKey` | `*cipherSet, error` | [L665](file:///d:/claude/nomad/nomad/encrypter.go#L665) |
| `waitForKey` | `e *Encrypter` | `ctx context.Context, keyID string` | `*cipherSet, error` | [L711](file:///d:/claude/nomad/nomad/encrypter.go#L711) |
| `GetActiveKey` | `e *Encrypter` | `` | `*rsa.PrivateKey, string, error` | [L735](file:///d:/claude/nomad/nomad/encrypter.go#L735) |
| `GetKey` | `e *Encrypter` | `keyID string` | `*structs.UnwrappedRootKey, error` | [L744](file:///d:/claude/nomad/nomad/encrypter.go#L744) |
| `activeCipherSet` | `e *Encrypter` | `` | `*cipherSet, error` | [L765](file:///d:/claude/nomad/nomad/encrypter.go#L765) |
| `cipherSetByIDLocked` | `e *Encrypter` | `keyID string` | `*cipherSet, error` | [L782](file:///d:/claude/nomad/nomad/encrypter.go#L782) |
| `RemoveKey` | `e *Encrypter` | `keyID string` | `error` | [L791](file:///d:/claude/nomad/nomad/encrypter.go#L791) |
| `wrapRootKey` | `e *Encrypter` | `rootKey *structs.UnwrappedRootKey, isUpgraded bool` | `*structs.RootKey, error` | [L801](file:///d:/claude/nomad/nomad/encrypter.go#L801) |
| `encryptDEK` | `e *Encrypter` | `rootKey *structs.UnwrappedRootKey, provider *structs.KEKProviderConfig` | `*structs.WrappedKey, error` | [L864](file:///d:/claude/nomad/nomad/encrypter.go#L864) |
| `writeKeyToDisk` | `e *Encrypter` | `meta *structs.RootKeyMeta, provider *structs.KEKProviderConfig, wrappedKey *s...` | `string, error` | [L906](file:///d:/claude/nomad/nomad/encrypter.go#L906) |
| `loadKeyFromStore` | `e *Encrypter` | `path string` | `*structs.UnwrappedRootKey, error` | [L937](file:///d:/claude/nomad/nomad/encrypter.go#L937) |
| `waitForPublicKey` | `e *Encrypter` | `keyID string` | `*structs.KeyringPublicKey, error` | [L1012](file:///d:/claude/nomad/nomad/encrypter.go#L1012) |
| `GetPublicKey` | `e *Encrypter` | `keyID string` | `*structs.KeyringPublicKey, error` | [L1039](file:///d:/claude/nomad/nomad/encrypter.go#L1039) |
| `newKMSWrapper` | `e *Encrypter` | `provider *structs.KEKProviderConfig, keyID string, kek []byte` | `kms.Wrapper, error` | [L1067](file:///d:/claude/nomad/nomad/encrypter.go#L1067) |
| `NewKeyringReplicator` | - | `srv *Server, e *Encrypter` | `*KeyringReplicator` | [L1119](file:///d:/claude/nomad/nomad/encrypter.go#L1119) |
| `stop` | `krr *KeyringReplicator` | `` | `` | [L1132](file:///d:/claude/nomad/nomad/encrypter.go#L1132) |
| `run` | `krr *KeyringReplicator` | `ctx context.Context` | `` | [L1138](file:///d:/claude/nomad/nomad/encrypter.go#L1138) |
| `replicateKey` | `krr *KeyringReplicator` | `ctx context.Context, wrappedKeys *structs.RootKey` | `error` | [L1193](file:///d:/claude/nomad/nomad/encrypter.go#L1193) |

## 5. 核心方法详解

### NewEncrypter()

**签名**：`func NewEncrypter(srv *Server, keystorePath string) *Encrypter, error`

**位置**：[L91](file:///d:/claude/nomad/nomad/encrypter.go#L91)

**中文说明**：创建并返回一个新的 Encrypter 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `srv` | `*Server` | 关联的 Server 实例 |
| `keystorePath` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Encrypter` | — |
| `error` | 错误信息 |

### Encrypt()

**签名**：`func (e *Encrypter) Encrypt(cleartext []byte) []byte, string, error`

**位置**：[L273](file:///d:/claude/nomad/nomad/encrypter.go#L273)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `cleartext` | `[]byte` | 字节数组 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]byte` | 字节数组 |
| `string` | 字符串 |
| `error` | 错误信息 |

### Decrypt()

**签名**：`func (e *Encrypter) Decrypt(ciphertext []byte, keyID string) []byte, error`

**位置**：[L298](file:///d:/claude/nomad/nomad/encrypter.go#L298)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ciphertext` | `[]byte` | 字节数组 |
| `keyID` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]byte` | 字节数组 |
| `error` | 错误信息 |

### NewKeyringReplicator()

**签名**：`func NewKeyringReplicator(srv *Server, e *Encrypter) *KeyringReplicator`

**位置**：[L1119](file:///d:/claude/nomad/nomad/encrypter.go#L1119)

**中文说明**：创建并返回一个新的 KeyringReplicator 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `srv` | `*Server` | 关联的 Server 实例 |
| `e` | `*Encrypter` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*KeyringReplicator` | — |

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

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **加密安全**：使用 Go crypto 标准库实现加密、签名或 TLS 通信
- **Raft 集成**：与 HashiCorp Raft 库交互，处理共识协议相关操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **后台协程**：启动 goroutine 执行后台任务
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [encrypter_test.go](file:///d:/claude/nomad/nomad/encrypter_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/acl.go) | 同目录源文件 |
| [acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/nomad/alloc_endpoint.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | 同目录源文件 |
| [autopilot_ce.go](file:///d:/claude/nomad/nomad/autopilot_ce.go) | 同目录源文件 |

