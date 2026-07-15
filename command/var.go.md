# var.go 代码说明文档

> 文件路径：[var.go](file:///d:/claude/nomad/command/var.go)
> 总行数：343 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`var`**，功能简述：

> Interact with variables

**命令类型**：父命令（分组命令），`Run()` 返回 `cli.RunResultHelp`，仅展示子命令帮助，不执行实际逻辑。

## 2. 类型定义

### VarCommand

**类型**：struct

```go
	Meta
```

### VarUI

**类型**：interface

### KVBuilder

**类型**：struct

```go
	Stdin io.Reader
	result map[string]interface{}
	stdin bool
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `errMissingTemplate` | ``A template must be supplied using '-template' when using go-template formatting`` |
| `errUnexpectedTemplate` | ``The '-template' flag is only valid when using 'go-template' formatting`` |
| `errVariableNotFound` | ``Variable not found`` |
| `errNoMatchingVariables` | ``No matching variables found`` |
| `errInvalidInFormat` | ``Invalid value for "-in"; valid values are [hcl, json]`` |
| `errInvalidOutFormat` | ``Invalid value for "-out"; valid values are [go-template, hcl, json, none, table]`` |
| `errInvalidListOutFormat` | ``Invalid value for "-out"; valid values are [go-template, json, table, terse]`` |
| `errWildcardNamespaceNotAllowed` | ``The wildcard namespace ("*") is not valid for this command.`` |
| `msgfmtCASMismatch` | ``
	Your provided check-index [green](%v)[yellow] does not match the
	server-side index [green](%v)[yellow].
	%s
	If you are sure you want to perform this operation, add the [green]-force[yellow] or
	[green]-check-index=%[2]v[yellow] flag before the positional arguments.`` |
| `msgfmtCASConflictLastAccess` | ``
	The server-side item was last updated on [green]%s[yellow].
	`` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `f *VarCommand` | - | `string` | [L29](file:///d:/claude/nomad/command/var.go#L29) |
| `Synopsis` | `f *VarCommand` | - | `string` | [L68](file:///d:/claude/nomad/command/var.go#L68) |
| `Name` | `f *VarCommand` | - | `string` | [L72](file:///d:/claude/nomad/command/var.go#L72) |
| `Run` | `f *VarCommand` | `args []string` | `int` | [L74](file:///d:/claude/nomad/command/var.go#L74) |
| `VariablePathPredictor` | - | `factory ApiClientFactory` | `complete.Predictor` | [L79](file:///d:/claude/nomad/command/var.go#L79) |
| `renderSVAsUiTable` | - | `sv *api.Variable, c VarUI` | - | [L102](file:///d:/claude/nomad/command/var.go#L102) |
| `renderAsHCL` | - | `sv *api.Variable` | `string` | [L129](file:///d:/claude/nomad/command/var.go#L129) |
| `renderWithGoTemplate` | - | `sv *api.Variable, tpl string` | `string, error` | [L154](file:///d:/claude/nomad/command/var.go#L154) |
| `Map` | `b *KVBuilder` | - | `map[string]interface{}` | [L176](file:///d:/claude/nomad/command/var.go#L176) |
| `Add` | `b *KVBuilder` | `args ...string` | `error` | [L181](file:///d:/claude/nomad/command/var.go#L181) |
| `add` | `b *KVBuilder` | `raw string` | `error` | [L191](file:///d:/claude/nomad/command/var.go#L191) |
| `addReader` | `b *KVBuilder` | `r io.Reader` | `error` | [L280](file:///d:/claude/nomad/command/var.go#L280) |
| `handleCASError` | - | `err error, c VarUI` | `handled bool` | [L295](file:///d:/claude/nomad/command/var.go#L295) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### Synopsis()

**简述**：`Interact with variables`

### Name()

**命令名**：`var`

### Run()

**签名**：`func (f *VarCommand) Run(args []string) int`

**行为**：返回 `cli.RunResultHelp`，触发帮助文本显示。这是父命令的标准模式，实际逻辑由子命令实现。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `os` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `text/template` | 标准库 |
| `github.com/go-viper/mapstructure/v2` | 第三方库 |
| `github.com/hashicorp/cli` | 第三方库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/api/contexts` | 内部包 |
| `github.com/mitchellh/colorstring` | 第三方库 |
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
| [var_test.go](file:///d:/claude/nomad/command/var_test.go) | 对应测试文件 |

