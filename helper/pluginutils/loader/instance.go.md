# instance.go 代码说明文档

> 文件路径：[pluginutils/loader/instance.go](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go)
> 总行数：67 行
> 所属包：`loader`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **插件加载器子包**（`helper/pluginutils/loader`），实现 Nomad 插件的加载器，管理插件实例的生命周期，支持内部插件（编译内置）和外部插件（独立进程）的加载、配置和重新连接。

## 2. 类型定义

### PluginInstance

**定义位置**：[L10](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L10)

**类型**：interface

```go
	Internal
	Kill
	ReattachConfig
	Plugin
	Exited
	ApiVersion
```

### internalPluginInstance

**定义位置**：[L34](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L34)

**类型**：struct

```go
	instance interface{}
	apiVersion string
	killFn func(...)
```

**关联方法**（6 个）：`Internal`, `Kill`, `ReattachConfig`, `Plugin`, `Exited`, `ApiVersion`

### externalPluginInstance

**定义位置**：[L49](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L49)

**类型**：struct

```go
	client *plugin.Client
	instance interface{}
	apiVersion string
```

**关联方法**（6 个）：`Internal`, `Plugin`, `Exited`, `ApiVersion`, `ReattachConfig`, `Kill`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Internal` | `p *internalPluginInstance` | - | `bool` | [L40](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L40) |
| `Kill` | `p *internalPluginInstance` | - | - | [L41](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L41) |
| `ReattachConfig` | `p *internalPluginInstance` | - | `*plugin.ReattachConfig, bool` | [L43](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L43) |
| `Plugin` | `p *internalPluginInstance` | - | `interface{}` | [L44](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L44) |
| `Exited` | `p *internalPluginInstance` | - | `bool` | [L45](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L45) |
| `ApiVersion` | `p *internalPluginInstance` | - | `string` | [L46](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L46) |
| `Internal` | `p *externalPluginInstance` | - | `bool` | [L55](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L55) |
| `Plugin` | `p *externalPluginInstance` | - | `interface{}` | [L56](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L56) |
| `Exited` | `p *externalPluginInstance` | - | `bool` | [L57](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L57) |
| `ApiVersion` | `p *externalPluginInstance` | - | `string` | [L58](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L58) |
| `ReattachConfig` | `p *externalPluginInstance` | - | `*plugin.ReattachConfig, bool` | [L60](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L60) |
| `Kill` | `p *externalPluginInstance` | - | - | [L64](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go#L64) |

## 5. 核心方法详解

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

