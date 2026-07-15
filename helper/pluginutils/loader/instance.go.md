# instance.go 代码说明文档

> 文件路径：[helper/pluginutils/loader/instance.go](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go)
> 总行数：67 行
> 所属包：`loader`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **工具包子包**（`helper/pluginutils/loader`），提供 Nomad 使用的通用工具函数和数据结构。

## 2. 类型定义

### PluginInstance

**定义位置**：[L10](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L10)

**中文说明**：PluginInstance 与插件（Plugin）相关，实现可扩展的功能模块。

**类型**：interface

```go
type PluginInstance interface {
	Internal func(...)
	Kill func(...)
	ReattachConfig func(...)
	Plugin func(...)
	Exited func(...)
	ApiVersion func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Internal` | `func(...)` | — |
| `Kill` | `func(...)` | — |
| `ReattachConfig` | `func(...)` | — |
| `Plugin` | `func(...)` | — |
| `Exited` | `func(...)` | — |
| `ApiVersion` | `func(...)` | — |

### internalPluginInstance

**定义位置**：[L34](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L34)

**中文说明**：internalPluginInstance 与插件（Plugin）相关，实现可扩展的功能模块。

**类型**：struct

```go
type internalPluginInstance struct {
	instance interface{}
	apiVersion string
	killFn func(...)
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `instance` | `interface{}` | 接口类型，可持有任意值 |
| `apiVersion` | `string` | 字符串 |
| `killFn` | `func(...)` | — |

**关联方法**（6 个）：`Internal`, `Kill`, `ReattachConfig`, `Plugin`, `Exited`, `ApiVersion`

### externalPluginInstance

**定义位置**：[L49](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L49)

**中文说明**：externalPluginInstance 与插件（Plugin）相关，实现可扩展的功能模块。

**类型**：struct

```go
type externalPluginInstance struct {
	client *plugin.Client
	instance interface{}
	apiVersion string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*plugin.Client` | — |
| `instance` | `interface{}` | 接口类型，可持有任意值 |
| `apiVersion` | `string` | 字符串 |

**关联方法**（6 个）：`Internal`, `Plugin`, `Exited`, `ApiVersion`, `ReattachConfig`, `Kill`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Internal` | `p *internalPluginInstance` | `` | `bool` | [L40](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L40) |
| `Kill` | `p *internalPluginInstance` | `` | `` | [L41](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L41) |
| `ReattachConfig` | `p *internalPluginInstance` | `` | `*plugin.ReattachConfig, bool` | [L43](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L43) |
| `Plugin` | `p *internalPluginInstance` | `` | `interface{}` | [L44](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L44) |
| `Exited` | `p *internalPluginInstance` | `` | `bool` | [L45](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L45) |
| `ApiVersion` | `p *internalPluginInstance` | `` | `string` | [L46](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L46) |
| `Internal` | `p *externalPluginInstance` | `` | `bool` | [L55](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L55) |
| `Plugin` | `p *externalPluginInstance` | `` | `interface{}` | [L56](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L56) |
| `Exited` | `p *externalPluginInstance` | `` | `bool` | [L57](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L57) |
| `ApiVersion` | `p *externalPluginInstance` | `` | `string` | [L58](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L58) |
| `ReattachConfig` | `p *externalPluginInstance` | `` | `*plugin.ReattachConfig, bool` | [L60](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L60) |
| `Kill` | `p *externalPluginInstance` | `` | `` | [L64](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L64) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/go-plugin` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **插件架构**：使用 `go-plugin` 框架实现插件化扩展

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api_versions.go](file:///d:/claude/nomad/helper/pluginutils/loader/api_versions.go) | 同目录源文件 |
| [filter_unix.go](file:///d:/claude/nomad/helper/pluginutils/loader/filter_unix.go) | 同目录源文件 |
| [filter_windows.go](file:///d:/claude/nomad/helper/pluginutils/loader/filter_windows.go) | 同目录源文件 |
| [init.go](file:///d:/claude/nomad/helper/pluginutils/loader/init.go) | 同目录源文件 |
| [loader.go](file:///d:/claude/nomad/helper/pluginutils/loader/loader.go) | 同目录源文件 |

