# memory.go 代码说明文档

> 文件路径：[client/fingerprint/memory.go](file:///d:/claude/nomad/client/fingerprint/memory.go)
> 总行数：62 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），采集客户端节点的硬件和软件信息（CPU、内存、OS、网络），用于节点注册和资源上报。

## 2. 类型定义

### MemoryFingerprint

**定义位置**：[L17](file:///d:/claude/nomad/client/fingerprint/memory.go#L17)

**中文说明**：MemoryFingerprint 与指纹采集（Fingerprint）相关，收集节点硬件和软件信息。

**类型**：struct

```go
type MemoryFingerprint struct {
	StaticFingerprinter StaticFingerprinter
	logger log.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `StaticFingerprinter` | `StaticFingerprinter` | — |
| `logger` | `log.Logger` | 日志记录器 |

**关联方法**（2 个）：`Fingerprint`, `Reload`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `bytesInMB` | `int64` | `1024 * 1024` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewMemoryFingerprint` | - | `logger log.Logger` | `Fingerprint` | [L23](file:///d:/claude/nomad/client/fingerprint/memory.go#L23) |
| `Fingerprint` | `f *MemoryFingerprint` | `req *FingerprintRequest, resp *FingerprintResponse` | `error` | [L30](file:///d:/claude/nomad/client/fingerprint/memory.go#L30) |
| `Reload` | `f *MemoryFingerprint` | `` | `` | [L61](file:///d:/claude/nomad/client/fingerprint/memory.go#L61) |

## 5. 核心方法详解

### NewMemoryFingerprint()

**签名**：`func NewMemoryFingerprint(logger log.Logger) Fingerprint`

**位置**：[L23](file:///d:/claude/nomad/client/fingerprint/memory.go#L23)

**中文说明**：创建并返回一个新的 MemoryFingerprint 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `log.Logger` | 日志记录器 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `Fingerprint` | — |

### Fingerprint()

**签名**：`func (f *MemoryFingerprint) Fingerprint(req *FingerprintRequest, resp *FingerprintResponse) error`

**位置**：[L30](file:///d:/claude/nomad/client/fingerprint/memory.go#L30)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `req` | `*FingerprintRequest` | — |
| `resp` | `*FingerprintResponse` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Reload()

**签名**：`func (f *MemoryFingerprint) Reload() `

**位置**：[L61](file:///d:/claude/nomad/client/fingerprint/memory.go#L61)

**中文说明**：重新加载对象的配置。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/shirou/gopsutil/v3/mem` | 第三方库 |

## 7. 设计模式与技术特点

- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [memory_test.go](file:///d:/claude/nomad/client/fingerprint/memory_test.go) | 对应测试文件 |
| [arch.go](file:///d:/claude/nomad/client/fingerprint/arch.go) | 同目录源文件 |
| [bridge.go](file:///d:/claude/nomad/client/fingerprint/bridge.go) | 同目录源文件 |
| [bridge_default.go](file:///d:/claude/nomad/client/fingerprint/bridge_default.go) | 同目录源文件 |
| [bridge_linux.go](file:///d:/claude/nomad/client/fingerprint/bridge_linux.go) | 同目录源文件 |
| [cgroup.go](file:///d:/claude/nomad/client/fingerprint/cgroup.go) | 同目录源文件 |

