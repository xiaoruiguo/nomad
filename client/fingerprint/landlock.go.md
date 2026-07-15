# landlock.go 代码说明文档

> 文件路径：[fingerprint/landlock.go](file:///d:/claude/nomad/client/fingerprint/landlock.go)
> 总行数：46 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。

## 2. 类型定义

### LandlockFingerprint

**定义位置**：[L18](file:///d:/claude/nomad/client/fingerprint/landlock.go#L18)

**类型**：struct

```go
	StaticFingerprinter
	logger hclog.Logger
	detector func(...)
```

**关联方法**（1 个）：`Fingerprint`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `landlockKey` | `"kernel.landlock"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewLandlockFingerprint` | - | `logger hclog.Logger` | `Fingerprint` | [L24](file:///d:/claude/nomad/client/fingerprint/landlock.go#L24) |
| `Fingerprint` | `f *LandlockFingerprint` | `_ *FingerprintRequest, resp *FingerprintResponse` | `error` | [L31](file:///d:/claude/nomad/client/fingerprint/landlock.go#L31) |

## 5. 核心方法详解

### Fingerprint()

**签名**：`func (f *LandlockFingerprint) Fingerprint(_ *FingerprintRequest, resp *FingerprintResponse) error`

**位置**：[L31](file:///d:/claude/nomad/client/fingerprint/landlock.go#L31)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/shoenig/go-landlock` | 第三方库 |

## 7. 设计模式与技术特点

- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [landlock_test.go](file:///d:/claude/nomad/client/fingerprint/landlock_test.go) | 对应测试文件 |

