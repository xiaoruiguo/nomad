# job_plan.go 代码说明文档

> 文件路径：[job_plan.go](file:///d:/claude/nomad/command/job_plan.go)
> 总行数：725 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`job plan`**，功能简述：

> Dry-run a job update to determine its effects

## 2. 类型定义

### JobPlanCommand

**类型**：struct

```go
	Meta
	JobGetter
```

### namespaceIdPair

**类型**：struct

```go
	id string
	namespace string
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `jobModifyIndexHelp` | ``To submit the job with version verification run:

nomad job run -check-index %d %s%s

When running the job with the check-index flag, the job will only be run if the
job modify index given matches the server-side version. If the index has
changed, another user has modified the job and the plan's results are
potentially invalid.`` |
| `preemptionDisplayThreshold` | `10` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *JobPlanCommand` | - | `string` | [L39](file:///d:/claude/nomad/command/job_plan.go#L39) |
| `Synopsis` | `c *JobPlanCommand` | - | `string` | [L112](file:///d:/claude/nomad/command/job_plan.go#L112) |
| `AutocompleteFlags` | `c *JobPlanCommand` | - | `complete.Flags` | [L116](file:///d:/claude/nomad/command/job_plan.go#L116) |
| `AutocompleteArgs` | `c *JobPlanCommand` | - | `complete.Predictor` | [L130](file:///d:/claude/nomad/command/job_plan.go#L130) |
| `Name` | `c *JobPlanCommand` | - | `string` | [L138](file:///d:/claude/nomad/command/job_plan.go#L138) |
| `Run` | `c *JobPlanCommand` | `args []string` | `int` | [L139](file:///d:/claude/nomad/command/job_plan.go#L139) |
| `multiregionPlan` | `c *JobPlanCommand` | `client *api.Client, job *api.Job, opts *api.PlanOptions, diff bool, verbose bool` | `int` | [L246](file:///d:/claude/nomad/command/job_plan.go#L246) |
| `outputPlannedJob` | `c *JobPlanCommand` | `job *api.Job, resp *api.JobPlanResponse, diff bool, verbose bool` | `int` | [L279](file:///d:/claude/nomad/command/job_plan.go#L279) |
| `addPreemptions` | `c *JobPlanCommand` | `resp *api.JobPlanResponse` | - | [L307](file:///d:/claude/nomad/command/job_plan.go#L307) |
| `getExitCode` | - | `resp *api.JobPlanResponse` | `int` | [L369](file:///d:/claude/nomad/command/job_plan.go#L369) |
| `formatJobModifyIndex` | - | `jobModifyIndex uint64, args string, jobName string` | `string` | [L386](file:///d:/claude/nomad/command/job_plan.go#L386) |
| `formatDryRun` | - | `resp *api.JobPlanResponse, job *api.Job, colorize *colorstring.Colorize` | `string` | [L393](file:///d:/claude/nomad/command/job_plan.go#L393) |
| `formatJobDiff` | - | `job *api.JobDiff, verbose bool` | `string` | [L448](file:///d:/claude/nomad/command/job_plan.go#L448) |
| `formatTaskGroupDiff` | - | `tg *api.TaskGroupDiff, tgPrefix int, verbose bool` | `string` | [L485](file:///d:/claude/nomad/command/job_plan.go#L485) |
| `formatTaskDiff` | - | `task *api.TaskDiff, startPrefix int, taskPrefix int, verbose bool` | `string` | [L558](file:///d:/claude/nomad/command/job_plan.go#L558) |
| `formatObjectDiff` | - | `diff *api.ObjectDiff, startPrefix int, keyPrefix int` | `string` | [L584](file:///d:/claude/nomad/command/job_plan.go#L584) |
| `formatFieldDiff` | - | `diff *api.FieldDiff, startPrefix int, keyPrefix int, valuePrefix int` | `string` | [L603](file:///d:/claude/nomad/command/job_plan.go#L603) |
| `alignedFieldAndObjects` | - | `fields []*api.FieldDiff, objects []*api.ObjectDiff, startPrefix int, longestField int, longestMarker int` | `string` | [L632](file:///d:/claude/nomad/command/job_plan.go#L632) |
| `getLongestPrefixes` | - | `fields []*api.FieldDiff, objects []*api.ObjectDiff` | `longestField int, longestMarker int` | [L667](file:///d:/claude/nomad/command/job_plan.go#L667) |
| `getDiffString` | - | `diffType string` | `string, int` | [L686](file:///d:/claude/nomad/command/job_plan.go#L686) |
| `colorAnnotations` | - | `annotations []string` | `string` | [L701](file:///d:/claude/nomad/command/job_plan.go#L701) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### Synopsis()

**简述**：`Dry-run a job update to determine its effects`

### AutocompleteFlags()

**功能**：为 shell 自动补全提供 flag 预测规则，返回 `complete.Flags` 映射。

### AutocompleteArgs()

**功能**：为 shell 自动补全提供参数预测规则。

### Name()

**命令名**：`job plan`

### Run()

**签名**：`func (c *JobPlanCommand) Run(args []string) int`

**行为**：执行命令核心逻辑，包括参数解析、API 调用、结果格式化输出。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/scheduler` | 内部包 |
| `github.com/mitchellh/colorstring` | 第三方库 |
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
| [job_plan_test.go](file:///d:/claude/nomad/command/job_plan_test.go) | 对应测试文件 |
| [job.go](file:///d:/claude/nomad/command/job.go) | 父命令文件 |

