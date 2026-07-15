# singleton.go 代码说明文档

> 文件路径：[pluginutils/singleton/singleton.go](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go)
> 总行数：129 行
> 所属包：`singleton`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **单例插件子包**（`helper/pluginutils/singleton`），实现单例模式的插件管理，确保插件实例的唯一性和延迟初始化。

## 2. 类型定义

### SingletonLoader

**定义位置**：[L24](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go#L24)

**类型**：struct

```go
	loader loader.PluginCatalog
	instances map[loader.PluginID]*future
	instanceLock sync.Mutex
	logger log.Logger
```

**关联方法**（7 个）：`Catalog`, `Dispense`, `Reattach`, `getPlugin`, `dispense`, `reattach`, `clearFuture`

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `SingletonPluginExited` | `fmt.Errorf("singleton plugin exited")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewSingletonLoader` | - | `logger log.Logger, catalog loader.PluginCatalog` | `*SingletonLoader` | [L40](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go#L40) |
| `Catalog` | `s *SingletonLoader` | - | `map[string][]*base.PluginInfoResponse` | [L49](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go#L49) |
| `Dispense` | `s *SingletonLoader` | `name string, pluginType string, config *base.AgentConfig, logger log.Logger` | `loader.PluginInstance, error` | [L56](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go#L56) |
| `Reattach` | `s *SingletonLoader` | `name string, pluginType string, config *plugin.ReattachConfig` | `loader.PluginInstance, error` | [L61](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go#L61) |
| `getPlugin` | `s *SingletonLoader` | `reattach bool, name string, pluginType string, logger log.Logger, nomadConfi...` | `loader.PluginInstance, error` | [L67](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go#L67) |
| `dispense` | `s *SingletonLoader` | `f *future, name string, pluginType string, config *base.AgentConfig, logger ...` | - | [L108](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go#L108) |
| `reattach` | `s *SingletonLoader` | `f *future, name string, pluginType string, config *plugin.ReattachConfig` | - | [L115](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go#L115) |
| `clearFuture` | `s *SingletonLoader` | `id loader.PluginID, f *future` | - | [L122](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go#L122) |

## 5. 核心方法详解

### NewSingletonLoader()

**签名**：`func NewSingletonLoader(logger log.Logger, catalog loader.PluginCatalog) *SingletonLoader`

**位置**：[L40](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go#L40)

### Catalog()

**签名**：`func (s *SingletonLoader) Catalog() map[string][]*base.PluginInfoResponse`

**位置**：[L49](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go#L49)

### Dispense()

**签名**：`func (s *SingletonLoader) Dispense(name string, pluginType string, config *base.AgentConfig, logger log.Logger) loader.PluginInstance, error`

**位置**：[L56](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go#L56)

### Reattach()

**签名**：`func (s *SingletonLoader) Reattach(name string, pluginType string, config *plugin.ReattachConfig) loader.PluginInstance, error`

**位置**：[L61](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go#L61)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/helper/pluginutils/loader` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-plugin` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **插件架构**：使用 `go-plugin` 框架实现插件化扩展
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [singleton_test.go](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton_test.go) | 对应测试文件 |

