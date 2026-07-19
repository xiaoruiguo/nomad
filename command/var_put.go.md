# var_put.go 代码说明文档

> 文件路径：[command/var_put.go](file:///d:/claude/nomad/command/var_put.go)
> 总行数：647 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CLI 命令包**（`command/`），实现 `nomad var_put` 命令，通过 Nomad API 客户端与 Server 交互，提供作业管理、节点查询、集群运维等命令行功能。

## 2. 类型定义

### VarPutCommand

**定义位置**：[L34](file:///d:/claude/nomad/command/var_put.go#L34)

**中文说明**：VarPutCommand 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type VarPutCommand struct {
	Meta Meta
	contents []byte
	inFmt string
	outFmt string
	tmpl string
	testStdin io.Reader
	verbose func(...)
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `Meta` | 元数据 |
| `contents` | `[]byte` | 字节数组 |
| `inFmt` | `string` | 字符串 |
| `outFmt` | `string` | 字符串 |
| `tmpl` | `string` | 字符串 |
| `testStdin` | `io.Reader` | — |
| `verbose` | `func(...)` | — |

**关联方法**（11 个）：`Help`, `AutocompleteFlags`, `AutocompleteArgs`, `Synopsis`, `Name`, `Run`, `makeVariable`, `GetConcurrentUI`, `setParserForFileArg`, `validateInputFlag`, `validateOutputFlag`

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `invalidIdentifier` | `—` | `regexp.MustCompile(`[^_\pN\pL]`)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *VarPutCommand` | `` | `string` | [L45](file:///d:/claude/nomad/command/var_put.go#L45) |
| `AutocompleteFlags` | `c *VarPutCommand` | `` | `complete.Flags` | [L114](file:///d:/claude/nomad/command/var_put.go#L114) |
| `AutocompleteArgs` | `c *VarPutCommand` | `` | `complete.Predictor` | [L124](file:///d:/claude/nomad/command/var_put.go#L124) |
| `Synopsis` | `c *VarPutCommand` | `` | `string` | [L128](file:///d:/claude/nomad/command/var_put.go#L128) |
| `Name` | `c *VarPutCommand` | `` | `string` | [L132](file:///d:/claude/nomad/command/var_put.go#L132) |
| `Run` | `c *VarPutCommand` | `args []string` | `int` | [L134](file:///d:/claude/nomad/command/var_put.go#L134) |
| `makeVariable` | `c *VarPutCommand` | `path string` | `*api.Variable, error` | [L409](file:///d:/claude/nomad/command/var_put.go#L409) |
| `parseVariableSpec` | - | `input []byte, verbose func(...)` | `*api.Variable, error` | [L471](file:///d:/claude/nomad/command/var_put.go#L471) |
| `parseVariableSpecImpl` | - | `result *api.Variable, list *ast.ObjectList` | `error` | [L491](file:///d:/claude/nomad/command/var_put.go#L491) |
| `isArgFileRef` | - | `a string` | `bool` | [L551](file:///d:/claude/nomad/command/var_put.go#L551) |
| `isArgStdinRef` | - | `a string` | `bool` | [L555](file:///d:/claude/nomad/command/var_put.go#L555) |
| `sanitizePath` | - | `s string` | `string` | [L560](file:///d:/claude/nomad/command/var_put.go#L560) |
| `parseArgsData` | - | `stdin io.Reader, args []string` | `map[string]interface{}, error` | [L566](file:///d:/claude/nomad/command/var_put.go#L566) |
| `GetConcurrentUI` | `c *VarPutCommand` | `` | `cli.ConcurrentUi` | [L574](file:///d:/claude/nomad/command/var_put.go#L574) |
| `setParserForFileArg` | `c *VarPutCommand` | `arg string` | `error` | [L578](file:///d:/claude/nomad/command/var_put.go#L578) |
| `validateInputFlag` | `c *VarPutCommand` | `` | `error` | [L590](file:///d:/claude/nomad/command/var_put.go#L590) |
| `validateOutputFlag` | `c *VarPutCommand` | `` | `error` | [L599](file:///d:/claude/nomad/command/var_put.go#L599) |
| `warnInvalidIdentifier` | - | `in string` | `error` | [L616](file:///d:/claude/nomad/command/var_put.go#L616) |
| `formatInvalidVarKeyChars` | - | `invalid []string` | `string` | [L630](file:///d:/claude/nomad/command/var_put.go#L630) |

## 5. 核心方法详解

### Run()

**签名**：`func (c *VarPutCommand) Run(args []string) int`

**位置**：[L134](file:///d:/claude/nomad/command/var_put.go#L134)

**中文说明**：运行对象的主循环。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `args` | `[]string` | 参数 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `int` | — |

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
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/go-viper/mapstructure/v2` | 第三方库 |
| `github.com/hashicorp/cli` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/hashicorp/hcl` | 第三方库 |
| `github.com/hashicorp/hcl/hcl/ast` | 第三方库 |
| `github.com/posener/complete` | 第三方库 |
| `golang.org/x/text/cases` | 第三方库 |
| `golang.org/x/text/language` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [var_put_test.go](file:///d:/claude/nomad/command/var_put_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/command/acl.go) | 同目录源文件 |
| [acl_auth_method.go](file:///d:/claude/nomad/command/acl_auth_method.go) | 同目录源文件 |
| [acl_auth_method_create.go](file:///d:/claude/nomad/command/acl_auth_method_create.go) | 同目录源文件 |
| [acl_auth_method_delete.go](file:///d:/claude/nomad/command/acl_auth_method_delete.go) | 同目录源文件 |
| [acl_auth_method_info.go](file:///d:/claude/nomad/command/acl_auth_method_info.go) | 同目录源文件 |



---

## Run 函数业务逻辑深度分析

> 分析文件：[var_put.go](file:///d:/claude/nomad/command/var_put.go)
> Run 函数数量：1

### 1. *VarPutCommand.Run

**定义位置**：[L134-L405](file:///d:/claude/nomad/command/var_put.go#L134-L405)

**函数签名**：

```go
func (*VarPutCommand) Run(args []string) (int) {
    // ...
}
```

**业务逻辑要点**：

1. **命令行参数解析**：通过 `flags.Parse()` 解析 8 个命令行 flag
2. **参数校验**：存在错误退出路径，对输入参数进行校验，校验失败返回 1
3. **API 客户端初始化**：通过 `Meta.Client()` 获取 Nomad API 客户端，调用 2 个不同的 API 端点
4. **业务处理**：主要通过 `Ui.Error()` 输出错误信息
5. **退出处理**：成功返回 0，失败返回 1

**命令行 Flag 解析**：

| 行号 | Flag名 | 说明 |
|------|--------|------|
| L143 | `force` | 命令行参数 |
| L144 | `verbose` | 命令行参数 |
| L145 | `check-index` | 命令行参数 |
| L146 | `in` | 命令行参数 |
| L147 | `template` | 命令行参数 |
| L148 | `ui` | 命令行参数 |
| L150 | `out` | 命令行参数 |
| L152 | `out` | 命令行参数 |

**关键调用链**：

| 行号 | 调用 | 说明 |
|------|------|------|
| L140 | `c.Meta.FlagSet` | 创建 flag 解析器 |
| L140 | `c.Name` | 业务调用 |
| L141 | `c.Help` | 业务调用 |
| L149 | `fileInfo.Mode` | 业务调用 |
| L200 | `c.validateInputFlag` | 业务调用 |
| L201 | `err.Error` | 输出错误信息 |
| L206 | `c.validateOutputFlag` | 业务调用 |
| L207 | `err.Error` | 输出错误信息 |
| L219 | `stat.Mode` | 业务调用 |
| L220 | `io.ReadAll` | 业务调用 |
| L232 | `c.setParserForFileArg` | 业务调用 |
| L234 | `err.Error` | 输出错误信息 |
| L256 | `stat.Mode` | 业务调用 |
| L257 | `io.ReadAll` | 业务调用 |
| L267 | `c.setParserForFileArg` | 业务调用 |
| L269 | `err.Error` | 输出错误信息 |
| L284 | `c.makeVariable` | 业务调用 |
| L310 | `multierror.Append` | 业务调用 |
| L316 | `c.Meta.Client` | 获取 Nomad API 客户端 |
| L327 | `client.Variables().Update` | 调用 Variables API |
| L327 | `client.Variables` | 业务调用 |
| L329 | `client.Variables().CheckedUpdate` | 调用 Variables API |
| L329 | `client.Variables` | 业务调用 |
| L343 | `c.FormatWarnings` | 业务调用 |
| L345 | `helper.MergeMultierrorWarnings` | 业务调用 |
| L352 | `sv.AsPrettyJSON` | 业务调用 |
| L357 | `err.Error` | 输出错误信息 |
| L364 | `c.Meta.showUIPath` | 业务调用 |
| L378 | `c.Meta.showUIPath` | 业务调用 |
| L393 | `c.Meta.showUIPath` | 业务调用 |

**涉及的 Nomad API 端点**：

- `Variables API.Update`
- `Variables API.CheckedUpdate`

**退出点分析**：

| 行号 | 退出代码 | 退出原因 |
|------|---------|---------|
| L157 | `return 1` | 错误退出 |
| L175 | `return 1` | 错误退出 |
| L180 | `return 1` | 错误退出 |
| L193 | `return 1` | 错误退出 |
| L197 | `return 1` | 错误退出 |
| L203 | `return 1` | 错误退出 |
| L209 | `return 1` | 错误退出 |
| L223 | `return 1` | 错误退出 |
| L235 | `return 1` | 错误退出 |
| L241 | `return 1` | 错误退出 |
| L260 | `return 1` | 错误退出 |
| L270 | `return 1` | 错误退出 |
| L277 | `return 1` | 错误退出 |
| L287 | `return 1` | 错误退出 |
| L295 | `return 1` | 错误退出 |
| L319 | `return 1` | 错误退出 |
| L333 | `return 1` | 错误退出 |
| L336 | `return 1` | 错误退出 |
| L358 | `return 1` | 错误退出 |
| L375 | `return 0` | 成功退出 |
| L389 | `return 0` | 成功退出 |
| L404 | `return 0` | 成功退出 |

**关键注释说明**：

| 行号 | 注释内容 |
|------|---------|
| L162 | Manage verbose output |
| L171 | Parse the check-index |
| L183 | Pull our fake stdin if needed |
| L214 | Handle first argument: can be -, @file, «var path» |
| L217 | read the specification into memory from stdin |
| L229 | ArgFileRefs start with "@" so we need to peel that off |
| L230 | detect format based on file extension |
| L250 | Handle second argument: can be -, @file, or kv |
| L252 | no-op |
| L281 | no-op - should be KV arg |
| L315 | Get the HTTP client |
| L361 | the renderSVAsUiTable func writes directly to the ui and doesn't error. |

