# operator_utilization.go 代码说明文档

> 文件路径：[operator_utilization.go](file:///d:/claude/nomad/command/operator_utilization.go)
> 总行数：113 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`operator utilization`**，功能简述：

> Generate a utilization reporting bundle

## 2. 类型定义

### OperatorUtilizationCommand

**类型**：struct

```go
	Meta
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *OperatorUtilizationCommand` | - | `string` | [L20](file:///d:/claude/nomad/command/operator_utilization.go#L20) |
| `Synopsis` | `c *OperatorUtilizationCommand` | - | `string` | [L49](file:///d:/claude/nomad/command/operator_utilization.go#L49) |
| `Name` | `c *OperatorUtilizationCommand` | - | `string` | [L53](file:///d:/claude/nomad/command/operator_utilization.go#L53) |
| `AutocompleteFlags` | `c *OperatorUtilizationCommand` | - | `complete.Flags` | [L55](file:///d:/claude/nomad/command/operator_utilization.go#L55) |
| `Run` | `c *OperatorUtilizationCommand` | `args []string` | `int` | [L64](file:///d:/claude/nomad/command/operator_utilization.go#L64) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### Synopsis()

**简述**：`Generate a utilization reporting bundle`

### Name()

**命令名**：`operator utilization`

### AutocompleteFlags()

**功能**：为 shell 自动补全提供 flag 预测规则，返回 `complete.Flags` 映射。

### Run()

**签名**：`func (c *OperatorUtilizationCommand) Run(args []string) int`

**行为**：执行命令核心逻辑，包括参数解析、API 调用、结果格式化输出。

**支持的命令行参数**：

- `-today-only`
- `-output`
- `-message`

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `os` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/posener/complete` | 第三方库 |

## 7. 设计模式与约定

该文件遵循 Nomad CLI 命令的标准实现模式：

1. **嵌入 Meta**：命令结构体嵌入 `Meta`，获取 API 客户端、UI 输出、flag 解析等通用能力
2. **实现 cli.Command 接口**：`Name()`、`Run()`、`Help()`、`Synopsis()` 四个必需方法
3. **可选自动补全**：实现 `AutocompleteFlags()` / `AutocompleteArgs()` 提供 shell 补全
4. **Flag 解析**：通过 `m.FlagSet()` 创建 flag 集，支持 `-address`、`-region`、`-namespace` 等通用 flag

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [meta.go](file:///d:/claude/nomad/command/meta.go) | `Meta` 结构体定义，提供通用 CLI 基础设施 |
| [helpers.go](file:///d:/claude/nomad/command/helpers.go) | CLI 辅助函数（格式化、Job 解析等） |
| [../api/api.go](file:///d:/claude/nomad/api/api.go) | Go API 客户端库 |
| [operator.go](file:///d:/claude/nomad/command/operator.go) | 父命令文件 |

