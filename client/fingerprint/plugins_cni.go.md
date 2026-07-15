# plugins_cni.go 代码说明文档

> 文件路径：[fingerprint/plugins_cni.go](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go)
> 总行数：133 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。

## 2. 类型定义

### PluginsCNIFingerprint

**定义位置**：[L25](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L25)

**类型**：struct

```go
	StaticFingerprinter
	logger hclog.Logger
	lister func(...)
```

**关联方法**（4 个）：`Fingerprint`, `attribute`, `detectOnePlugin`, `Reload`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `cniPluginAttribute` | `"plugins.cni.version"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewPluginsCNIFingerprint` | - | `logger hclog.Logger` | `Fingerprint` | [L31](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L31) |
| `Fingerprint` | `f *PluginsCNIFingerprint` | `req *FingerprintRequest, resp *FingerprintResponse` | `error` | [L38](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L38) |
| `attribute` | `f *PluginsCNIFingerprint` | `filename string` | `string` | [L84](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L84) |
| `detectOnePlugin` | `f *PluginsCNIFingerprint` | `pluginPath string, entry os.DirEntry` | `string, bool` | [L88](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L88) |
| `Reload` | `f *PluginsCNIFingerprint` | - | - | [L132](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L132) |

## 5. 核心方法详解

### Fingerprint()

**签名**：`func (f *PluginsCNIFingerprint) Fingerprint(req *FingerprintRequest, resp *FingerprintResponse) error`

**位置**：[L38](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L38)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `path/filepath` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-version` | 第三方库 |

## 7. 设计模式与技术特点

- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [plugins_cni_test.go](file:///d:/claude/nomad/client/fingerprint/plugins_cni_test.go) | 对应测试文件 |

