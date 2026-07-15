# acl_policy.go 代码说明文档

> 文件路径：[acl_policy.go](file:///d:/claude/nomad/command/acl_policy.go)
> 总行数：75 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`acl policy`**，功能简述：

> Interact with ACL policies

**命令类型**：父命令（分组命令），`Run()` 返回 `cli.RunResultHelp`，仅展示子命令帮助，不执行实际逻辑。

## 2. 类型定义

### ACLPolicyCommand

**类型**：struct

```go
	Meta
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `f *ACLPolicyCommand` | - | `string` | [L19](file:///d:/claude/nomad/command/acl_policy.go#L19) |
| `Synopsis` | `f *ACLPolicyCommand` | - | `string` | [L45](file:///d:/claude/nomad/command/acl_policy.go#L45) |
| `Name` | `f *ACLPolicyCommand` | - | `string` | [L49](file:///d:/claude/nomad/command/acl_policy.go#L49) |
| `Run` | `f *ACLPolicyCommand` | `args []string` | `int` | [L51](file:///d:/claude/nomad/command/acl_policy.go#L51) |
| `ACLPolicyPredictor` | - | `factory ApiClientFactory` | `complete.Predictor` | [L57](file:///d:/claude/nomad/command/acl_policy.go#L57) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### Synopsis()

**简述**：`Interact with ACL policies`

### Name()

**命令名**：`acl policy`

### Run()

**签名**：`func (f *ACLPolicyCommand) Run(args []string) int`

**行为**：返回 `cli.RunResultHelp`，触发帮助文本显示。这是父命令的标准模式，实际逻辑由子命令实现。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `strings` | 标准库 |
| `github.com/hashicorp/cli` | 第三方库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/posener/complete` | 第三方库 |

## 7. 设计模式与约定

该文件遵循 Nomad CLI 命令的标准实现模式：

1. **嵌入 Meta**：命令结构体嵌入 `Meta`，获取 API 客户端、UI 输出、flag 解析等通用能力
2. **实现 cli.Command 接口**：`Name()`、`Run()`、`Help()`、`Synopsis()` 四个必需方法
3. **可选自动补全**：实现 `AutocompleteFlags()` / `AutocompleteArgs()` 提供 shell 补全
4. **Flag 解析**：通过 `m.FlagSet()` 创建 flag 集，支持 `-address`、`-region`、`-namespace` 等通用 flag
5. **父命令模式**：`Run()` 返回 `cli.RunResultHelp`，仅显示子命令列表

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [meta.go](file:///d:/claude/nomad/command/meta.go) | `Meta` 结构体定义，提供通用 CLI 基础设施 |
| [helpers.go](file:///d:/claude/nomad/command/helpers.go) | CLI 辅助函数（格式化、Job 解析等） |
| [../api/api.go](file:///d:/claude/nomad/api/api.go) | Go API 客户端库 |
| [acl.go](file:///d:/claude/nomad/command/acl.go) | 父命令文件 |

