# job_history.go 代码说明文档

> 文件路径：[job_history.go](file:///d:/claude/nomad/command/job_history.go)
> 总行数：310 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`job history`**，功能简述：

> Display all tracked versions of a job

## 2. 类型定义

### JobHistoryCommand

**类型**：struct

```go
	Meta
	formatter DataFormatter
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *JobHistoryCommand` | - | `string` | [L22](file:///d:/claude/nomad/command/job_history.go#L22) |
| `Synopsis` | `c *JobHistoryCommand` | - | `string` | [L70](file:///d:/claude/nomad/command/job_history.go#L70) |
| `AutocompleteFlags` | `c *JobHistoryCommand` | - | `complete.Flags` | [L74](file:///d:/claude/nomad/command/job_history.go#L74) |
| `AutocompleteArgs` | `c *JobHistoryCommand` | - | `complete.Predictor` | [L87](file:///d:/claude/nomad/command/job_history.go#L87) |
| `Name` | `c *JobHistoryCommand` | - | `string` | [L91](file:///d:/claude/nomad/command/job_history.go#L91) |
| `Run` | `c *JobHistoryCommand` | `args []string` | `int` | [L93](file:///d:/claude/nomad/command/job_history.go#L93) |
| `parseVersion` | - | `input string` | `uint64, bool, error` | [L239](file:///d:/claude/nomad/command/job_history.go#L239) |
| `formatJobVersions` | `c *JobHistoryCommand` | `versions []*api.Job, diffs []*api.JobDiff, full bool` | `error` | [L248](file:///d:/claude/nomad/command/job_history.go#L248) |
| `formatJobVersion` | `c *JobHistoryCommand` | `job *api.Job, diff *api.JobDiff, full bool` | `error` | [L271](file:///d:/claude/nomad/command/job_history.go#L271) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### Synopsis()

**简述**：`Display all tracked versions of a job`

### AutocompleteFlags()

**功能**：为 shell 自动补全提供 flag 预测规则，返回 `complete.Flags` 映射。

### AutocompleteArgs()

**功能**：为 shell 自动补全提供参数预测规则。

### Name()

**命令名**：`job history`

### Run()

**签名**：`func (c *JobHistoryCommand) Run(args []string) int`

**行为**：执行命令核心逻辑，包括参数解析、API 调用、结果格式化输出。

**支持的命令行参数**：

- `-p`
- `-full`
- `-json`
- `-version`
- `-t`
- `-diff-tag`
- `-diff-version`

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
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
| [job_history_test.go](file:///d:/claude/nomad/command/job_history_test.go) | 对应测试文件 |
| [job.go](file:///d:/claude/nomad/command/job.go) | 父命令文件 |

