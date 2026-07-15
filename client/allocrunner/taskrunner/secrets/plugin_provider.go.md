# plugin_provider.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/secrets/plugin_provider.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go)
> 总行数：68 行
> 所属包：`secrets`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### ExternalPluginProvider

**定义位置**：[L13](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go#L13)

**中文说明**：ExternalPluginProvider 是一个提供者，提供特定功能的实现。

**类型**：struct

```go
type ExternalPluginProvider struct {
	plugin commonplugins.SecretsPlugin
	pluginName string
	secretName string
	path string
	env map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `plugin` | `commonplugins.SecretsPlugin` | — |
| `pluginName` | `string` | 字符串 |
| `secretName` | `string` | 字符串 |
| `path` | `string` | 路径 |
| `env` | `map[string]string` | 映射表 |

**关联方法**（2 个）：`InterpolateEnv`, `Fetch`

### Response

**定义位置**：[L31](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go#L31)

**中文说明**：Response 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type Response struct {
	Result map[string]string `json:"result"`
	Error *string `json:"error,omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Result` | `map[string]string `json:"result"`` | 结果 |
| `Error` | `*string `json:"error,omitempty"`` | 错误信息 |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewExternalPluginProvider` | - | `plugin commonplugins.SecretsPlugin, pluginName string, secretName string, pat...` | `*ExternalPluginProvider` | [L36](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go#L36) |
| `InterpolateEnv` | `p *ExternalPluginProvider` | `interpolate func(...)` | `` | [L46](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go#L46) |
| `Fetch` | `p *ExternalPluginProvider` | `ctx context.Context` | `map[string]string, error` | [L52](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go#L52) |

## 5. 核心方法详解

### NewExternalPluginProvider()

**签名**：`func NewExternalPluginProvider(plugin commonplugins.SecretsPlugin, pluginName string, secretName string, path string, env map[string]string) *ExternalPluginProvider`

**位置**：[L36](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go#L36)

**中文说明**：创建并返回一个新的 ExternalPluginProvider 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `plugin` | `commonplugins.SecretsPlugin` | — |
| `pluginName` | `string` | 字符串 |
| `secretName` | `string` | 字符串 |
| `path` | `string` | 路径 |
| `env` | `map[string]string` | 映射表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ExternalPluginProvider` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `github.com/hashicorp/nomad/client/commonplugins` | 内部包 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [plugin_provider_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider_test.go) | 对应测试文件 |
| [nomad_provider.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/nomad_provider.go) | 同目录源文件 |
| [vault_provider.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/vault_provider.go) | 同目录源文件 |

