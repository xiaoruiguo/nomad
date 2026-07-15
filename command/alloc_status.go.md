# alloc_status.go 代码说明文档

> 文件路径：[alloc_status.go](file:///d:/claude/nomad/command/alloc_status.go)
> 总行数：921 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`alloc status`**，功能简述：

> Display allocation status information and metadata

## 2. 类型定义

### AllocStatusCommand

**类型**：struct

```go
	Meta
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *AllocStatusCommand` | - | `string` | [L25](file:///d:/claude/nomad/command/alloc_status.go#L25) |
| `Synopsis` | `c *AllocStatusCommand` | - | `string` | [L65](file:///d:/claude/nomad/command/alloc_status.go#L65) |
| `AutocompleteFlags` | `c *AllocStatusCommand` | - | `complete.Flags` | [L69](file:///d:/claude/nomad/command/alloc_status.go#L69) |
| `AutocompleteArgs` | `c *AllocStatusCommand` | - | `complete.Predictor` | [L81](file:///d:/claude/nomad/command/alloc_status.go#L81) |
| `Name` | `c *AllocStatusCommand` | - | `string` | [L96](file:///d:/claude/nomad/command/alloc_status.go#L96) |
| `Run` | `c *AllocStatusCommand` | `args []string` | `int` | [L98](file:///d:/claude/nomad/command/alloc_status.go#L98) |
| `formatAllocShortInfo` | - | `alloc *api.Allocation` | `string` | [L259](file:///d:/claude/nomad/command/alloc_status.go#L259) |
| `formatAllocBasicInfo` | - | `alloc *api.Allocation, client *api.Client, uuidLength int, verbose bool` | `string, error` | [L277](file:///d:/claude/nomad/command/alloc_status.go#L277) |
| `formatAllocNetworkInfo` | - | `alloc *api.Allocation` | `string` | [L363](file:///d:/claude/nomad/command/alloc_status.go#L363) |
| `formatAllocNomadServiceChecks` | - | `allocID string, client *api.Client` | `string` | [L394](file:///d:/claude/nomad/command/alloc_status.go#L394) |
| `futureEvalTimePretty` | - | `evalID string, client *api.Client` | `string` | [L417](file:///d:/claude/nomad/command/alloc_status.go#L417) |
| `outputTaskDetails` | `c *AllocStatusCommand` | `alloc *api.Allocation, stats *api.AllocResourceUsage, displayStats bool, verbose bool` | - | [L429](file:///d:/claude/nomad/command/alloc_status.go#L429) |
| `formatTaskTimes` | - | `t time.Time` | `string` | [L451](file:///d:/claude/nomad/command/alloc_status.go#L451) |
| `outputTaskStatus` | `c *AllocStatusCommand` | `state *api.TaskState` | - | [L461](file:///d:/claude/nomad/command/alloc_status.go#L461) |
| `buildDisplayMessage` | - | `event *api.TaskEvent` | `string` | [L489](file:///d:/claude/nomad/command/alloc_status.go#L489) |
| `outputTaskResources` | `c *AllocStatusCommand` | `alloc *api.Allocation, task string, stats *api.AllocResourceUsage, displayStats bool` | - | [L604](file:///d:/claude/nomad/command/alloc_status.go#L604) |
| `outputVerboseResourceUsage` | `c *AllocStatusCommand` | `task string, resourceUsage *api.ResourceUsage` | - | [L689](file:///d:/claude/nomad/command/alloc_status.go#L689) |
| `shortTaskStatus` | `c *AllocStatusCommand` | `alloc *api.Allocation` | - | [L767](file:///d:/claude/nomad/command/alloc_status.go#L767) |
| `sortedTaskStateIterator` | `c *AllocStatusCommand` | `m map[string]*api.TaskState, lifecycles map[string]*api.TaskLifecycle` | `[]string` | [L798](file:///d:/claude/nomad/command/alloc_status.go#L798) |
| `lifecycleDisplayName` | - | `l *api.TaskLifecycle` | `string` | [L827](file:///d:/claude/nomad/command/alloc_status.go#L827) |
| `outputTaskVolumes` | `c *AllocStatusCommand` | `alloc *api.Allocation, taskName string, verbose bool` | - | [L839](file:///d:/claude/nomad/command/alloc_status.go#L839) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### Synopsis()

**简述**：`Display allocation status information and metadata`

### AutocompleteFlags()

**功能**：为 shell 自动补全提供 flag 预测规则，返回 `complete.Flags` 映射。

### AutocompleteArgs()

**功能**：为 shell 自动补全提供参数预测规则。

### Name()

**命令名**：`alloc status`

### Run()

**签名**：`func (c *AllocStatusCommand) Run(args []string) int`

**行为**：执行命令核心逻辑，包括参数解析、API 调用、结果格式化输出。

**支持的命令行参数**：

- `-short`
- `-verbose`
- `-stats`
- `-json`
- `-t`
- `-ui`

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `math` | 标准库 |
| `slices` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/dustin/go-humanize` | 第三方库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/api/contexts` | 内部包 |
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
| [alloc_status_test.go](file:///d:/claude/nomad/command/alloc_status_test.go) | 对应测试文件 |
| [alloc.go](file:///d:/claude/nomad/command/alloc.go) | 父命令文件 |

