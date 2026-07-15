# plugins.go 代码说明文档

> 文件路径：[drivers/shared/executor/plugins.go](file:///d:/claude/nomad/drivers/shared/executor/plugins.go)
> 总行数：64 行
> 所属包：`executor`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **驱动共享工具子包**（`drivers/shared`），提供各任务驱动的共享功能，包括驱动事件处理、重启策略、执行器接口、网络配置、资源隔离和选择器逻辑等。

## 2. 类型定义

### ExecutorConfig

**定义位置**：[L15](file:///d:/claude/nomad/drivers/shared/executor/plugins.go#L15)

**类型**：struct

```go
	LogFile string
	LogLevel string
	FSIsolation bool
	Compute cpustats.Compute
```

### PluginReattachConfig

**定义位置**：[L43](file:///d:/claude/nomad/drivers/shared/executor/plugins.go#L43)

**类型**：struct

```go
	Pid int
	AddrNet string
	AddrName string
```

**关联方法**（1 个）：`PluginConfig`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GetPluginMap` | - | `logger hclog.Logger, fsIsolation bool, compute cpustats.Compute` | `map[string]plugin.Plugin` | [L31](file:///d:/claude/nomad/drivers/shared/executor/plugins.go#L31) |
| `PluginConfig` | `c *PluginReattachConfig` | - | `*plugin.ReattachConfig` | [L50](file:///d:/claude/nomad/drivers/shared/executor/plugins.go#L50) |
| `NewPluginReattachConfig` | - | `c *plugin.ReattachConfig` | `*PluginReattachConfig` | [L61](file:///d:/claude/nomad/drivers/shared/executor/plugins.go#L61) |

## 5. 核心方法详解

### NewPluginReattachConfig()

**签名**：`func NewPluginReattachConfig(c *plugin.ReattachConfig) *PluginReattachConfig`

**位置**：[L61](file:///d:/claude/nomad/drivers/shared/executor/plugins.go#L61)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `net` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cpustats` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-plugin` | 第三方库 |

## 7. 设计模式与技术特点

- **插件架构**：使用 `go-plugin` 框架实现插件化扩展
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|

