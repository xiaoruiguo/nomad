# eval_status.go 代码说明文档

> 文件路径：[eval_status.go](file:///d:/claude/nomad/command/eval_status.go)
> 总行数：434 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`eval status`**，功能简述：

> Display evaluation status and placement failure reasons

## 2. 类型定义

### EvalStatusCommand

**类型**：struct

```go
	Meta
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *EvalStatusCommand` | - | `string` | [L24](file:///d:/claude/nomad/command/eval_status.go#L24) |
| `Synopsis` | `c *EvalStatusCommand` | - | `string` | [L59](file:///d:/claude/nomad/command/eval_status.go#L59) |
| `AutocompleteFlags` | `c *EvalStatusCommand` | - | `complete.Flags` | [L63](file:///d:/claude/nomad/command/eval_status.go#L63) |
| `AutocompleteArgs` | `c *EvalStatusCommand` | - | `complete.Predictor` | [L74](file:///d:/claude/nomad/command/eval_status.go#L74) |
| `Name` | `c *EvalStatusCommand` | - | `string` | [L89](file:///d:/claude/nomad/command/eval_status.go#L89) |
| `Run` | `c *EvalStatusCommand` | `args []string` | `int` | [L91](file:///d:/claude/nomad/command/eval_status.go#L91) |
| `formatEvalStatus` | `c *EvalStatusCommand` | `eval *api.Evaluation, placedAllocs []*api.AllocationListStub, verbose bool, length int` | - | [L204](file:///d:/claude/nomad/command/eval_status.go#L204) |
| `sortedTaskGroupFromMetrics` | - | `groups map[string]*api.AllocationMetric` | `[]string` | [L307](file:///d:/claude/nomad/command/eval_status.go#L307) |
| `getTriggerDetails` | - | `eval *api.Evaluation` | `noun string, subject string` | [L316](file:///d:/claude/nomad/command/eval_status.go#L316) |
| `formatRelatedEvalStubs` | - | `evals []*api.EvaluationStub, length int` | `string` | [L327](file:///d:/claude/nomad/command/eval_status.go#L327) |
| `formatPreemptedAllocListStubs` | - | `stubs []*api.AllocationListStub, uuidLength int` | `string` | [L347](file:///d:/claude/nomad/command/eval_status.go#L347) |
| `formatPlanAnnotations` | - | `desiredTGUpdates map[string]*api.DesiredUpdates, verbose bool` | `string` | [L371](file:///d:/claude/nomad/command/eval_status.go#L371) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### Synopsis()

**简述**：`Display evaluation status and placement failure reasons`

### AutocompleteFlags()

**功能**：为 shell 自动补全提供 flag 预测规则，返回 `complete.Flags` 映射。

### AutocompleteArgs()

**功能**：为 shell 自动补全提供参数预测规则。

### Name()

**命令名**：`eval status`

### Run()

**签名**：`func (c *EvalStatusCommand) Run(args []string) int`

**行为**：执行命令核心逻辑，包括参数解析、API 调用、结果格式化输出。

**支持的命令行参数**：

- `-monitor`
- `-verbose`
- `-json`
- `-t`
- `-ui`

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `slices` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/api/contexts` | 内部包 |
| `github.com/posener/complete` | 第三方库 |
| `github.com/ryanuber/columnize` | 第三方库 |

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
| [eval_status_test.go](file:///d:/claude/nomad/command/eval_status_test.go) | 对应测试文件 |
| [eval.go](file:///d:/claude/nomad/command/eval.go) | 父命令文件 |

