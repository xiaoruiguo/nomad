# acl_role_delete.go 代码说明文档

> 文件路径：[acl_role_delete.go](file:///d:/claude/nomad/command/acl_role_delete.go)
> 总行数：89 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`acl role delete`**，功能简述：

> Delete an existing ACL role

## 2. 类型定义

### ACLRoleDeleteCommand

**类型**：struct

```go
	Meta
```

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `_` | `*ast.UnaryExpr` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `a *ACLRoleDeleteCommand` | - | `string` | [L23](file:///d:/claude/nomad/command/acl_role_delete.go#L23) |
| `AutocompleteFlags` | `a *ACLRoleDeleteCommand` | - | `complete.Flags` | [L37](file:///d:/claude/nomad/command/acl_role_delete.go#L37) |
| `AutocompleteArgs` | `a *ACLRoleDeleteCommand` | - | `complete.Predictor` | [L42](file:///d:/claude/nomad/command/acl_role_delete.go#L42) |
| `Synopsis` | `a *ACLRoleDeleteCommand` | - | `string` | [L47](file:///d:/claude/nomad/command/acl_role_delete.go#L47) |
| `Name` | `a *ACLRoleDeleteCommand` | - | `string` | [L50](file:///d:/claude/nomad/command/acl_role_delete.go#L50) |
| `Run` | `a *ACLRoleDeleteCommand` | `args []string` | `int` | [L53](file:///d:/claude/nomad/command/acl_role_delete.go#L53) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### AutocompleteFlags()

**功能**：为 shell 自动补全提供 flag 预测规则，返回 `complete.Flags` 映射。

### AutocompleteArgs()

**功能**：为 shell 自动补全提供参数预测规则。

### Synopsis()

**简述**：`Delete an existing ACL role`

### Name()

**命令名**：`acl role delete`

### Run()

**签名**：`func (a *ACLRoleDeleteCommand) Run(args []string) int`

**行为**：执行命令核心逻辑，包括参数解析、API 调用、结果格式化输出。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/cli` | 第三方库 |
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
| [acl_role_delete_test.go](file:///d:/claude/nomad/command/acl_role_delete_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/command/acl.go) | 父命令文件 |

