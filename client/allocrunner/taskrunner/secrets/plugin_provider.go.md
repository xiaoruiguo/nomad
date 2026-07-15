# plugin_provider.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/secrets/plugin_provider.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go)
> 总行数：68 行
> 所属包：`secrets`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **密钥管理子包**（`client/allocrunner/taskrunner/secrets`），实现任务密钥（Vault Token 等）的获取和注入。

## 2. 类型定义

### ExternalPluginProvider

**定义位置**：[L13](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go#L13)

**类型**：struct

```go
	plugin commonplugins.SecretsPlugin
	pluginName string
	secretName string
	path string
	env map[string]string
```

**关联方法**（2 个）：`InterpolateEnv`, `Fetch`

### Response

**定义位置**：[L31](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go#L31)

**类型**：struct

```go
	Result map[string]string `json:"result"`
	Error *string `json:"error,omitempty"`
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewExternalPluginProvider` | - | `plugin commonplugins.SecretsPlugin, pluginName string, secretName string, pa...` | `*ExternalPluginProvider` | [L36](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go#L36) |
| `InterpolateEnv` | `p *ExternalPluginProvider` | `interpolate func(...)` | - | [L46](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go#L46) |
| `Fetch` | `p *ExternalPluginProvider` | `ctx context.Context` | `map[string]string, error` | [L52](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider.go#L52) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `github.com/hashicorp/nomad/client/commonplugins` | 内部包 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [plugin_provider_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/secrets/plugin_provider_test.go) | 对应测试文件 |

