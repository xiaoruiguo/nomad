# env_aws.go 代码说明文档

> 文件路径：[fingerprint/env_aws.go](file:///d:/claude/nomad/client/fingerprint/env_aws.go)
> 总行数：314 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。

## 2. 类型定义

### EnvAWSFingerprint

**定义位置**：[L57](file:///d:/claude/nomad/client/fingerprint/env_aws.go#L57)

**类型**：struct

```go
	StaticFingerprinter
	endpoint string
	logger log.Logger
```

**关联方法**（7 个）：`Fingerprint`, `handleImdsError`, `instanceType`, `throughput`, `linkSpeed`, `imdsClient`, `Reload`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `AwsMetadataTimeout` | `2 * time.Second` |
| `awsFingerprinterName` | `"env_aws"` |

### 变量

| 名称 | 值 |
|------|----|
| `ec2NetSpeedTable` | `map[*regexp.Regexp]int{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewEnvAWSFingerprint` | - | `logger log.Logger` | `Fingerprint` | [L68](file:///d:/claude/nomad/client/fingerprint/env_aws.go#L68) |
| `Fingerprint` | `f *EnvAWSFingerprint` | `request *FingerprintRequest, response *FingerprintResponse` | `error` | [L79](file:///d:/claude/nomad/client/fingerprint/env_aws.go#L79) |
| `handleImdsError` | `f *EnvAWSFingerprint` | `err error, attr string` | `error` | [L203](file:///d:/claude/nomad/client/fingerprint/env_aws.go#L203) |
| `instanceType` | `f *EnvAWSFingerprint` | `client *imds.Client` | `string, error` | [L214](file:///d:/claude/nomad/client/fingerprint/env_aws.go#L214) |
| `throughput` | `f *EnvAWSFingerprint` | `request *FingerprintRequest, client *imds.Client, ip string` | `int` | [L228](file:///d:/claude/nomad/client/fingerprint/env_aws.go#L228) |
| `linkSpeed` | `f *EnvAWSFingerprint` | `client *imds.Client` | `int` | [L243](file:///d:/claude/nomad/client/fingerprint/env_aws.go#L243) |
| `imdsClient` | `f *EnvAWSFingerprint` | `ctx context.Context` | `*imds.Client, error` | [L261](file:///d:/claude/nomad/client/fingerprint/env_aws.go#L261) |
| `awsProbe` | - | `ctx context.Context, client *imds.Client` | `error` | [L282](file:///d:/claude/nomad/client/fingerprint/env_aws.go#L282) |
| `readMetadataResponse` | - | `resp *imds.GetMetadataOutput` | `string, error` | [L302](file:///d:/claude/nomad/client/fingerprint/env_aws.go#L302) |
| `Reload` | `f *EnvAWSFingerprint` | - | - | [L313](file:///d:/claude/nomad/client/fingerprint/env_aws.go#L313) |

## 5. 核心方法详解

### Fingerprint()

**签名**：`func (f *EnvAWSFingerprint) Fingerprint(request *FingerprintRequest, response *FingerprintResponse) error`

**位置**：[L79](file:///d:/claude/nomad/client/fingerprint/env_aws.go#L79)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net/http` | 标准库 |
| `regexp` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/aws/aws-sdk-go-v2/config` | 第三方库 |
| `github.com/aws/aws-sdk-go-v2/feature/ec2/imds` | 第三方库 |
| `github.com/aws/smithy-go/transport/http` | 第三方库 |
| `github.com/hashicorp/go-cleanhttp` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [env_aws_test.go](file:///d:/claude/nomad/client/fingerprint/env_aws_test.go) | 对应测试文件 |

