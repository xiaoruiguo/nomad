# nomad_provider.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/secrets/nomad_provider.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/nomad_provider.go)
> 总行数：85 行
> 所属包：`secrets`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### nomadProviderConfig

**定义位置**：[L18](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/nomad_provider.go#L18)

**中文说明**：nomadProviderConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type nomadProviderConfig struct {
	Namespace string `mapstructure:"namespace"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string `mapstructure:"namespace"`` | 命名空间 |

### NomadProvider

**定义位置**：[L28](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/nomad_provider.go#L28)

**中文说明**：NomadProvider 是一个提供者，提供特定功能的实现。

**类型**：struct

```go
type NomadProvider struct {
	secret *structs.Secret
	secretDir string
	tmplFile string
	config *nomadProviderConfig
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `secret` | `*structs.Secret` | 密钥 |
| `secretDir` | `string` | 字符串 |
| `tmplFile` | `string` | 字符串 |
| `config` | `*nomadProviderConfig` | 配置 |

**关联方法**（1 个）：`BuildTemplate`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `SecretProviderNomad` | `—` | `"nomad"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `defaultNomadConfig` | - | `namespace string` | `*nomadProviderConfig` | [L22](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/nomad_provider.go#L22) |
| `NewNomadProvider` | - | `secret *structs.Secret, secretDir string, tmplFile string, namespace string` | `*NomadProvider, error` | [L37](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/nomad_provider.go#L37) |
| `BuildTemplate` | `n *NomadProvider` | `` | `*structs.Template` | [L55](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/nomad_provider.go#L55) |
| `validateNomadInputs` | - | `conf *nomadProviderConfig, path string` | `error` | [L74](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/nomad_provider.go#L74) |

## 5. 核心方法详解

### NewNomadProvider()

**签名**：`func NewNomadProvider(secret *structs.Secret, secretDir string, tmplFile string, namespace string) *NomadProvider, error`

**位置**：[L37](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/nomad_provider.go#L37)

**中文说明**：创建并返回一个新的 NomadProvider 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `secret` | `*structs.Secret` | 密钥 |
| `secretDir` | `string` | 字符串 |
| `tmplFile` | `string` | 字符串 |
| `namespace` | `string` | 命名空间 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NomadProvider` | — |
| `error` | 错误信息 |

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

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [nomad_provider_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/nomad_provider_test.go) | 对应测试文件 |
| [plugin_provider.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go) | 同目录源文件 |
| [vault_provider.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/vault_provider.go) | 同目录源文件 |

