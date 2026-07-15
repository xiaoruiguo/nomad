# operator_api.go 代码说明文档

> 文件路径：[operator_api.go](file:///d:/claude/nomad/command/operator_api.go)
> 总行数：493 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`operator api`**，功能简述：

> Query Nomad's HTTP API

## 2. 类型定义

### OperatorAPICommand

**类型**：struct

```go
	Meta
	verboseFlag bool
	method string
	body io.Reader
```

### headerFlags

**类型**：struct

```go
	headers http.Header
```

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `Stdin` | `os.Stdin` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | ` *OperatorAPICommand` | - | `string` | [L33](file:///d:/claude/nomad/command/operator_api.go#L33) |
| `Synopsis` | ` *OperatorAPICommand` | - | `string` | [L87](file:///d:/claude/nomad/command/operator_api.go#L87) |
| `AutocompleteFlags` | `c *OperatorAPICommand` | - | `complete.Flags` | [L91](file:///d:/claude/nomad/command/operator_api.go#L91) |
| `AutocompleteArgs` | `c *OperatorAPICommand` | - | `complete.Predictor` | [L101](file:///d:/claude/nomad/command/operator_api.go#L101) |
| `Name` | ` *OperatorAPICommand` | - | `string` | [L107](file:///d:/claude/nomad/command/operator_api.go#L107) |
| `Run` | `c *OperatorAPICommand` | `args []string` | `int` | [L109](file:///d:/claude/nomad/command/operator_api.go#L109) |
| `setQueryParams` | - | `config *api.Config, path *url.URL` | - | [L286](file:///d:/claude/nomad/command/operator_api.go#L286) |
| `apiToCurl` | `c *OperatorAPICommand` | `config *api.Config, headers http.Header, path *url.URL` | `string, error` | [L307](file:///d:/claude/nomad/command/operator_api.go#L307) |
| `tlsToCurl` | - | `parts []string, tlsConfig *api.TLSConfig` | `[]string` | [L385](file:///d:/claude/nomad/command/operator_api.go#L385) |
| `pathToURL` | - | `config *api.Config, path string` | `*url.URL, error` | [L417](file:///d:/claude/nomad/command/operator_api.go#L417) |
| `newHeaderFlags` | - | - | `*headerFlags` | [L476](file:///d:/claude/nomad/command/operator_api.go#L476) |
| `String` | ` *headerFlags` | - | `string` | [L482](file:///d:/claude/nomad/command/operator_api.go#L482) |
| `Set` | `h *headerFlags` | `v string` | `error` | [L484](file:///d:/claude/nomad/command/operator_api.go#L484) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### Synopsis()

**简述**：`Query Nomad's HTTP API`

### AutocompleteFlags()

**功能**：为 shell 自动补全提供 flag 预测规则，返回 `complete.Flags` 映射。

### AutocompleteArgs()

**功能**：为 shell 自动补全提供参数预测规则。

### Name()

**命令名**：`operator api`

### Run()

**签名**：`func (c *OperatorAPICommand) Run(args []string) int`

**行为**：执行命令核心逻辑，包括参数解析、API 调用、结果格式化输出。

**支持的命令行参数**：

- `-dryrun`
- `-filter`
- `-H`

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net` | 标准库 |
| `net/http` | 标准库 |
| `net/url` | 标准库 |
| `os` | 标准库 |
| `strings` | 标准库 |
| `github.com/posener/complete` | 第三方库 |
| `github.com/hashicorp/nomad/api` | 内部包 |

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
| [operator_api_test.go](file:///d:/claude/nomad/command/operator_api_test.go) | 对应测试文件 |
| [operator.go](file:///d:/claude/nomad/command/operator.go) | 父命令文件 |

