# artifact.go 代码说明文档

> 文件路径：[config/artifact.go](file:///d:/claude/nomad/client/config/artifact.go)
> 总行数：98 行
> 所属包：`config`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Client 配置子包**（`client/config`），定义 Client 节点的配置结构和默认值。

## 2. 类型定义

### ArtifactConfig

**定义位置**：[L17](file:///d:/claude/nomad/client/config/artifact.go#L17)

**类型**：struct

```go
	HTTPReadTimeout time.Duration
	HTTPMaxBytes int64
	GCSTimeout time.Duration
	GitTimeout time.Duration
	HgTimeout time.Duration
	S3Timeout time.Duration
	DecompressionLimitFileCount int
	DecompressionLimitSize int64
	DisableArtifactInspection bool
	DisableFilesystemIsolation bool
	FilesystemIsolationExtraPaths []string
	SetEnvironmentVariables string
```

**关联方法**（1 个）：`Copy`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ArtifactConfigFromAgent` | - | `c *config.ArtifactConfig` | `*ArtifactConfig, error` | [L37](file:///d:/claude/nomad/client/config/artifact.go#L37) |
| `Copy` | `a *ArtifactConfig` | - | `*ArtifactConfig` | [L90](file:///d:/claude/nomad/client/config/artifact.go#L90) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `slices` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs/config` | 内部包 |
| `github.com/dustin/go-humanize` | 第三方库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Client 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [artifact_test.go](file:///d:/claude/nomad/client/config/artifact_test.go) | 对应测试文件 |

