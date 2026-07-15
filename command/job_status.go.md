# job_status.go 代码说明文档

> 文件路径：[job_status.go](file:///d:/claude/nomad/command/job_status.go)
> 总行数：962 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`status`**，功能简述：

> Display status information about a job

## 2. 类型定义

### JobStatusCommand

**类型**：struct

```go
	Meta
	length int
	evals bool
	allAllocs bool
	verbose bool
	json bool
	tmpl string
	openURL bool
```

### NamespacedID

**类型**：struct

```go
	ID string
	Namespace string
```

### JobJson

**类型**：struct

```go
	Summary *api.JobSummary
	Allocations []*api.AllocationListStub
	LatestDeployment *api.Deployment
	Evaluations []*api.Evaluation
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `maxFailedTGs` | `5` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *JobStatusCommand` | - | `string` | [L46](file:///d:/claude/nomad/command/job_status.go#L46) |
| `Synopsis` | `c *JobStatusCommand` | - | `string` | [L90](file:///d:/claude/nomad/command/job_status.go#L90) |
| `AutocompleteFlags` | `c *JobStatusCommand` | - | `complete.Flags` | [L94](file:///d:/claude/nomad/command/job_status.go#L94) |
| `AutocompleteArgs` | `c *JobStatusCommand` | - | `complete.Predictor` | [L107](file:///d:/claude/nomad/command/job_status.go#L107) |
| `Name` | `c *JobStatusCommand` | - | `string` | [L111](file:///d:/claude/nomad/command/job_status.go#L111) |
| `Run` | `c *JobStatusCommand` | `args []string` | `int` | [L113](file:///d:/claude/nomad/command/job_status.go#L113) |
| `outputPeriodicInfo` | `c *JobStatusCommand` | `client *api.Client, job *api.Job` | `error` | [L340](file:///d:/claude/nomad/command/job_status.go#L340) |
| `outputParameterizedInfo` | `c *JobStatusCommand` | `client *api.Client, job *api.Job` | `error` | [L379](file:///d:/claude/nomad/command/job_status.go#L379) |
| `outputJobInfo` | `c *JobStatusCommand` | `client *api.Client, job *api.Job` | `error` | [L426](file:///d:/claude/nomad/command/job_status.go#L426) |
| `formatDeployment` | `c *JobStatusCommand` | `client *api.Client, d *api.Deployment` | `string` | [L526](file:///d:/claude/nomad/command/job_status.go#L526) |
| `formatJobActions` | - | `actions []map[string]string` | `string` | [L554](file:///d:/claude/nomad/command/job_status.go#L554) |
| `formatJobAllocListStubs` | - | `stubs []*api.AllocationListStub, job *api.Job, verbose bool, uuidLength int` | `string` | [L577](file:///d:/claude/nomad/command/job_status.go#L577) |
| `formatAllocListStubs` | - | `stubs []*api.AllocationListStub, verbose bool, uuidLength int` | `string` | [L591](file:///d:/claude/nomad/command/job_status.go#L591) |
| `formatAllocListStubsWithDeadlines` | - | `stubs []*api.AllocationListStub, verbose bool, uuidLength int, deadlines []string` | `string` | [L595](file:///d:/claude/nomad/command/job_status.go#L595) |
| `allocationDeadlineColumnVisible` | - | `deadlines []string` | `bool` | [L652](file:///d:/claude/nomad/command/job_status.go#L652) |
| `formatAllocList` | - | `allocations []*api.Allocation, verbose bool, uuidLength int` | `string` | [L662](file:///d:/claude/nomad/command/job_status.go#L662) |
| `outputJobSummary` | `c *JobStatusCommand` | `client *api.Client, job *api.Job` | `error` | [L730](file:///d:/claude/nomad/command/job_status.go#L730) |
| `outputReschedulingEvals` | `c *JobStatusCommand` | `client *api.Client, job *api.Job, allocListStubs []*api.AllocationListStub, uuidLength int` | `error` | [L786](file:///d:/claude/nomad/command/job_status.go#L786) |
| `outputFailedPlacements` | `c *JobStatusCommand` | `failedEval *api.Evaluation` | - | [L850](file:///d:/claude/nomad/command/job_status.go#L850) |
| `createJsonJobsOutput` | - | `client *api.Client, allAllocs bool, jobs ...NamespacedID` | `[]JobJson, error` | [L877](file:///d:/claude/nomad/command/job_status.go#L877) |
| `createStatusListOutput` | - | `jobs []*api.JobListStub, displayNS bool` | `string` | [L915](file:///d:/claude/nomad/command/job_status.go#L915) |
| `getTypeString` | - | `job *api.JobListStub` | `string` | [L942](file:///d:/claude/nomad/command/job_status.go#L942) |
| `getStatusString` | - | `status string, stop *bool` | `string` | [L956](file:///d:/claude/nomad/command/job_status.go#L956) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### Synopsis()

**简述**：`Display status information about a job`

### AutocompleteFlags()

**功能**：为 shell 自动补全提供 flag 预测规则，返回 `complete.Flags` 映射。

### AutocompleteArgs()

**功能**：为 shell 自动补全提供参数预测规则。

### Name()

**命令名**：`status`

### Run()

**签名**：`func (c *JobStatusCommand) Run(args []string) int`

**行为**：执行命令核心逻辑，包括参数解析、API 调用、结果格式化输出。

**支持的命令行参数**：

- `-short`

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
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
| [job_status_test.go](file:///d:/claude/nomad/command/job_status_test.go) | 对应测试文件 |
| [job.go](file:///d:/claude/nomad/command/job.go) | 父命令文件 |

