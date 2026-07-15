# env_azure.go 代码说明文档

> 文件路径：[fingerprint/env_azure.go](file:///d:/claude/nomad/client/fingerprint/env_azure.go)
> 总行数：238 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。

## 2. 类型定义

### AzureMetadataTag

**定义位置**：[L41](file:///d:/claude/nomad/client/fingerprint/env_azure.go#L41)

**类型**：struct

```go
	Name string
	Value string
```

### AzureMetadataPair

**定义位置**：[L46](file:///d:/claude/nomad/client/fingerprint/env_azure.go#L46)

**类型**：struct

```go
	path string
	unique bool
```

### EnvAzureFingerprint

**定义位置**：[L52](file:///d:/claude/nomad/client/fingerprint/env_azure.go#L52)

**类型**：struct

```go
	StaticFingerprinter
	client *http.Client
	logger log.Logger
	metadataURL string
```

**关联方法**（4 个）：`Get`, `Fingerprint`, `azureProbe`, `Reload`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `AzureMetadataURL` | `"http://169.254.169.254/metadata/instance/"` |
| `AzureMetadataAPIVersion` | `"2019-06-04"` |
| `AzureMetadataTimeout` | `2 * time.Second` |
| `azureFingerprinterName` | `"env_azure"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewEnvAzureFingerprint` | - | `logger log.Logger` | `Fingerprint` | [L60](file:///d:/claude/nomad/client/fingerprint/env_azure.go#L60) |
| `Get` | `f *EnvAzureFingerprint` | `attribute string, format string` | `string, error` | [L87](file:///d:/claude/nomad/client/fingerprint/env_azure.go#L87) |
| `checkAzureError` | - | `err error, logger log.Logger, desc string` | `error` | [L126](file:///d:/claude/nomad/client/fingerprint/env_azure.go#L126) |
| `Fingerprint` | `f *EnvAzureFingerprint` | `request *FingerprintRequest, response *FingerprintResponse` | `error` | [L137](file:///d:/claude/nomad/client/fingerprint/env_azure.go#L137) |
| `azureProbe` | `f *EnvAzureFingerprint` | - | `error` | [L223](file:///d:/claude/nomad/client/fingerprint/env_azure.go#L223) |
| `Reload` | `f *EnvAzureFingerprint` | - | - | [L237](file:///d:/claude/nomad/client/fingerprint/env_azure.go#L237) |

## 5. 核心方法详解

### Get()

**签名**：`func (f *EnvAzureFingerprint) Get(attribute string, format string) string, error`

**位置**：[L87](file:///d:/claude/nomad/client/fingerprint/env_azure.go#L87)

### Fingerprint()

**签名**：`func (f *EnvAzureFingerprint) Fingerprint(request *FingerprintRequest, response *FingerprintResponse) error`

**位置**：[L137](file:///d:/claude/nomad/client/fingerprint/env_azure.go#L137)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net/http` | 标准库 |
| `net/url` | 标准库 |
| `os` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/useragent` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-cleanhttp` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [env_azure_test.go](file:///d:/claude/nomad/client/fingerprint/env_azure_test.go) | 对应测试文件 |

