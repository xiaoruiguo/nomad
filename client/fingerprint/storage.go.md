# storage.go 代码说明文档

> 文件路径：[fingerprint/storage.go](file:///d:/claude/nomad/client/fingerprint/storage.go)
> 总行数：64 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。

## 2. 类型定义

### StorageFingerprint

**定义位置**：[L19](file:///d:/claude/nomad/client/fingerprint/storage.go#L19)

**类型**：struct

```go
	StaticFingerprinter
	logger log.Logger
```

**关联方法**（1 个）：`Fingerprint`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `bytesPerMegabyte` | `1024 * 1024` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewStorageFingerprint` | - | `logger log.Logger` | `Fingerprint` | [L24](file:///d:/claude/nomad/client/fingerprint/storage.go#L24) |
| `Fingerprint` | `f *StorageFingerprint` | `req *FingerprintRequest, resp *FingerprintResponse` | `error` | [L29](file:///d:/claude/nomad/client/fingerprint/storage.go#L29) |

## 5. 核心方法详解

### Fingerprint()

**签名**：`func (f *StorageFingerprint) Fingerprint(req *FingerprintRequest, resp *FingerprintResponse) error`

**位置**：[L29](file:///d:/claude/nomad/client/fingerprint/storage.go#L29)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `os` | 标准库 |
| `strconv` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [storage_test.go](file:///d:/claude/nomad/client/fingerprint/storage_test.go) | 对应测试文件 |

