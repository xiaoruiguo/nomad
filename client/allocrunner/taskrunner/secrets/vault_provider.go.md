# vault_provider.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/secrets/vault_provider.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/vault_provider.go)
> 总行数：81 行
> 所属包：`secrets`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **密钥管理子包**（`client/allocrunner/taskrunner/secrets`），实现任务密钥（Vault Token 等）的获取和注入。

## 2. 类型定义

### vaultProviderConfig

**定义位置**：[L23](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/vault_provider.go#L23)

**类型**：struct

```go
	Engine string `mapstructure:"engine"`
```

### VaultProvider

**定义位置**：[L33](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/vault_provider.go#L33)

**类型**：struct

```go
	secret *structs.Secret
	secretDir string
	tmplFile string
	conf *vaultProviderConfig
```

**关联方法**（1 个）：`BuildTemplate`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `SecretProviderVault` | `"vault"` |
| `VAULT_KV` | `"kv"` |
| `VAULT_KV_V2` | `"kv_v2"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `defaultVaultConfig` | - | - | `*vaultProviderConfig` | [L27](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/vault_provider.go#L27) |
| `NewVaultProvider` | - | `secret *structs.Secret, secretDir string, tmplFile string` | `*VaultProvider, error` | [L42](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/vault_provider.go#L42) |
| `BuildTemplate` | `v *VaultProvider` | - | `*structs.Template` | [L60](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/vault_provider.go#L60) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `path/filepath` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/go-viper/mapstructure/v2` | 第三方库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Client 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [vault_provider_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/vault_provider_test.go) | 对应测试文件 |

