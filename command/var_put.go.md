# var_put.go 代码说明文档

> 文件路径：[var_put.go](file:///d:/claude/nomad/command/var_put.go)
> 总行数：647 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`var put`**，功能简述：

> Create or update a variable

## 2. 类型定义

### VarPutCommand

**类型**：struct

```go
	Meta
	contents []byte
	inFmt string
	outFmt string
	tmpl string
	testStdin io.Reader
	verbose func(...)
```

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `invalidIdentifier` | `*ast.CallExpr` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *VarPutCommand` | - | `string` | [L45](file:///d:/claude/nomad/command/var_put.go#L45) |
| `AutocompleteFlags` | `c *VarPutCommand` | - | `complete.Flags` | [L114](file:///d:/claude/nomad/command/var_put.go#L114) |
| `AutocompleteArgs` | `c *VarPutCommand` | - | `complete.Predictor` | [L124](file:///d:/claude/nomad/command/var_put.go#L124) |
| `Synopsis` | `c *VarPutCommand` | - | `string` | [L128](file:///d:/claude/nomad/command/var_put.go#L128) |
| `Name` | `c *VarPutCommand` | - | `string` | [L132](file:///d:/claude/nomad/command/var_put.go#L132) |
| `Run` | `c *VarPutCommand` | `args []string` | `int` | [L134](file:///d:/claude/nomad/command/var_put.go#L134) |
| `makeVariable` | `c *VarPutCommand` | `path string` | `*api.Variable, error` | [L409](file:///d:/claude/nomad/command/var_put.go#L409) |
| `parseVariableSpec` | - | `input []byte, verbose func(...)` | `*api.Variable, error` | [L471](file:///d:/claude/nomad/command/var_put.go#L471) |
| `parseVariableSpecImpl` | - | `result *api.Variable, list *ast.ObjectList` | `error` | [L491](file:///d:/claude/nomad/command/var_put.go#L491) |
| `isArgFileRef` | - | `a string` | `bool` | [L551](file:///d:/claude/nomad/command/var_put.go#L551) |
| `isArgStdinRef` | - | `a string` | `bool` | [L555](file:///d:/claude/nomad/command/var_put.go#L555) |
| `sanitizePath` | - | `s string` | `string` | [L560](file:///d:/claude/nomad/command/var_put.go#L560) |
| `parseArgsData` | - | `stdin io.Reader, args []string` | `map[string]interface{}, error` | [L566](file:///d:/claude/nomad/command/var_put.go#L566) |
| `GetConcurrentUI` | `c *VarPutCommand` | - | `cli.ConcurrentUi` | [L574](file:///d:/claude/nomad/command/var_put.go#L574) |
| `setParserForFileArg` | `c *VarPutCommand` | `arg string` | `error` | [L578](file:///d:/claude/nomad/command/var_put.go#L578) |
| `validateInputFlag` | `c *VarPutCommand` | - | `error` | [L590](file:///d:/claude/nomad/command/var_put.go#L590) |
| `validateOutputFlag` | `c *VarPutCommand` | - | `error` | [L599](file:///d:/claude/nomad/command/var_put.go#L599) |
| `warnInvalidIdentifier` | - | `in string` | `error` | [L616](file:///d:/claude/nomad/command/var_put.go#L616) |
| `formatInvalidVarKeyChars` | - | `invalid []string` | `string` | [L630](file:///d:/claude/nomad/command/var_put.go#L630) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### AutocompleteFlags()

**功能**：为 shell 自动补全提供 flag 预测规则，返回 `complete.Flags` 映射。

### AutocompleteArgs()

**功能**：为 shell 自动补全提供参数预测规则。

### Synopsis()

**简述**：`Create or update a variable`

### Name()

**命令名**：`var put`

### Run()

**签名**：`func (c *VarPutCommand) Run(args []string) int`

**行为**：执行命令核心逻辑，包括参数解析、API 调用、结果格式化输出。

**支持的命令行参数**：

- `-force`
- `-verbose`
- `-check-index`
- `-ui`

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `regexp` | 标准库 |
| `slices` | 标准库 |
| `strings` | 标准库 |
| `github.com/go-viper/mapstructure/v2` | 第三方库 |
| `github.com/hashicorp/cli` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/hashicorp/hcl` | 第三方库 |
| `github.com/hashicorp/hcl/hcl/ast` | 第三方库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/posener/complete` | 第三方库 |
| `golang.org/x/text/cases` | 标准库 |
| `golang.org/x/text/language` | 标准库 |

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
| [var_put_test.go](file:///d:/claude/nomad/command/var_put_test.go) | 对应测试文件 |
| [var.go](file:///d:/claude/nomad/command/var.go) | 父命令文件 |

