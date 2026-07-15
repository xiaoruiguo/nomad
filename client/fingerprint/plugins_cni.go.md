# plugins_cni.go 代码说明文档

> 文件路径：[client/fingerprint/plugins_cni.go](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go)
> 总行数：133 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），采集客户端节点的硬件和软件信息（CPU、内存、OS、网络），用于节点注册和资源上报。

## 2. 类型定义

### PluginsCNIFingerprint

**定义位置**：[L25](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L25)

**中文说明**：PluginsCNIFingerprint 与插件（Plugin）相关，实现可扩展的功能模块。

**类型**：struct

```go
type PluginsCNIFingerprint struct {
	StaticFingerprinter StaticFingerprinter
	logger hclog.Logger
	lister func(...)
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `StaticFingerprinter` | `StaticFingerprinter` | — |
| `logger` | `hclog.Logger` | 日志记录器 |
| `lister` | `func(...)` | — |

**关联方法**（4 个）：`Fingerprint`, `attribute`, `detectOnePlugin`, `Reload`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `cniPluginAttribute` | `—` | `"plugins.cni.version"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewPluginsCNIFingerprint` | - | `logger hclog.Logger` | `Fingerprint` | [L31](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L31) |
| `Fingerprint` | `f *PluginsCNIFingerprint` | `req *FingerprintRequest, resp *FingerprintResponse` | `error` | [L38](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L38) |
| `attribute` | `f *PluginsCNIFingerprint` | `filename string` | `string` | [L84](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L84) |
| `detectOnePlugin` | `f *PluginsCNIFingerprint` | `pluginPath string, entry os.DirEntry` | `string, bool` | [L88](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L88) |
| `Reload` | `f *PluginsCNIFingerprint` | `` | `` | [L132](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L132) |

## 5. 核心方法详解

### NewPluginsCNIFingerprint()

**签名**：`func NewPluginsCNIFingerprint(logger hclog.Logger) Fingerprint`

**位置**：[L31](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L31)

**中文说明**：创建并返回一个新的 PluginsCNIFingerprint 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `hclog.Logger` | 日志记录器 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `Fingerprint` | — |

### Fingerprint()

**签名**：`func (f *PluginsCNIFingerprint) Fingerprint(req *FingerprintRequest, resp *FingerprintResponse) error`

**位置**：[L38](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L38)

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

**签名**：`func (f *PluginsCNIFingerprint) Reload() `

**位置**：[L132](file:///d:/claude/nomad/client/fingerprint/plugins_cni.go#L132)

**中文说明**：重新加载对象的配置。

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

- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [plugins_cni_test.go](file:///d:/claude/nomad/client/fingerprint/plugins_cni_test.go) | 对应测试文件 |
| [arch.go](file:///d:/claude/nomad/client/fingerprint/arch.go) | 同目录源文件 |
| [bridge.go](file:///d:/claude/nomad/client/fingerprint/bridge.go) | 同目录源文件 |
| [bridge_default.go](file:///d:/claude/nomad/client/fingerprint/bridge_default.go) | 同目录源文件 |
| [bridge_linux.go](file:///d:/claude/nomad/client/fingerprint/bridge_linux.go) | 同目录源文件 |
| [cgroup.go](file:///d:/claude/nomad/client/fingerprint/cgroup.go) | 同目录源文件 |

