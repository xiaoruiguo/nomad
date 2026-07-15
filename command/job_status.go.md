# job_status.go 代码说明文档

> 文件路径：[command/job_status.go](file:///d:/claude/nomad/command/job_status.go)
> 总行数：962 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CLI 命令包**（`command/`），实现 `nomad job_status` 命令，通过 Nomad API 客户端与 Server 交互，提供作业管理、节点查询、集群运维等命令行功能。

## 2. 类型定义

### JobStatusCommand

**定义位置**：[L22](file:///d:/claude/nomad/command/job_status.go#L22)

**中文说明**：JobStatusCommand 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobStatusCommand struct {
	Meta Meta
	length int
	evals bool
	allAllocs bool
	verbose bool
	json bool
	tmpl string
	openURL bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `Meta` | 元数据 |
| `length` | `int` | — |
| `evals` | `bool` | 布尔值 |
| `allAllocs` | `bool` | 布尔值 |
| `verbose` | `bool` | 布尔值 |
| `json` | `bool` | 布尔值 |
| `tmpl` | `string` | 字符串 |
| `openURL` | `bool` | 布尔值 |

**关联方法**（13 个）：`Help`, `Synopsis`, `AutocompleteFlags`, `AutocompleteArgs`, `Name`, `Run`, `outputPeriodicInfo`, `outputParameterizedInfo`, `outputJobInfo`, `formatDeployment`, `outputJobSummary`, `outputReschedulingEvals`, `outputFailedPlacements`

### NamespacedID

**定义位置**：[L34](file:///d:/claude/nomad/command/job_status.go#L34)

**中文说明**：NamespacedID 与命名空间（Namespace）相关，提供资源隔离。

**类型**：struct

```go
type NamespacedID struct {
	ID string
	Namespace string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Namespace` | `string` | 命名空间 |

### JobJson

**定义位置**：[L39](file:///d:/claude/nomad/command/job_status.go#L39)

**中文说明**：JobJson 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobJson struct {
	Summary *api.JobSummary
	Allocations []*api.AllocationListStub
	LatestDeployment *api.Deployment
	Evaluations []*api.Evaluation
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Summary` | `*api.JobSummary` | — |
| `Allocations` | `[]*api.AllocationListStub` | 列表 |
| `LatestDeployment` | `*api.Deployment` | — |
| `Evaluations` | `[]*api.Evaluation` | 列表 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `maxFailedTGs` | `—` | `5` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *JobStatusCommand` | `` | `string` | [L46](file:///d:/claude/nomad/command/job_status.go#L46) |
| `Synopsis` | `c *JobStatusCommand` | `` | `string` | [L90](file:///d:/claude/nomad/command/job_status.go#L90) |
| `AutocompleteFlags` | `c *JobStatusCommand` | `` | `complete.Flags` | [L94](file:///d:/claude/nomad/command/job_status.go#L94) |
| `AutocompleteArgs` | `c *JobStatusCommand` | `` | `complete.Predictor` | [L107](file:///d:/claude/nomad/command/job_status.go#L107) |
| `Name` | `c *JobStatusCommand` | `` | `string` | [L111](file:///d:/claude/nomad/command/job_status.go#L111) |
| `Run` | `c *JobStatusCommand` | `args []string` | `int` | [L113](file:///d:/claude/nomad/command/job_status.go#L113) |
| `outputPeriodicInfo` | `c *JobStatusCommand` | `client *api.Client, job *api.Job` | `error` | [L340](file:///d:/claude/nomad/command/job_status.go#L340) |
| `outputParameterizedInfo` | `c *JobStatusCommand` | `client *api.Client, job *api.Job` | `error` | [L379](file:///d:/claude/nomad/command/job_status.go#L379) |
| `outputJobInfo` | `c *JobStatusCommand` | `client *api.Client, job *api.Job` | `error` | [L426](file:///d:/claude/nomad/command/job_status.go#L426) |
| `formatDeployment` | `c *JobStatusCommand` | `client *api.Client, d *api.Deployment` | `string` | [L526](file:///d:/claude/nomad/command/job_status.go#L526) |
| `formatJobActions` | - | `actions []map[string]string` | `string` | [L554](file:///d:/claude/nomad/command/job_status.go#L554) |
| `formatJobAllocListStubs` | - | `stubs []*api.AllocationListStub, job *api.Job, verbose bool, uuidLength int` | `string` | [L577](file:///d:/claude/nomad/command/job_status.go#L577) |
| `formatAllocListStubs` | - | `stubs []*api.AllocationListStub, verbose bool, uuidLength int` | `string` | [L591](file:///d:/claude/nomad/command/job_status.go#L591) |
| `formatAllocListStubsWithDeadlines` | - | `stubs []*api.AllocationListStub, verbose bool, uuidLength int, deadlines []st...` | `string` | [L595](file:///d:/claude/nomad/command/job_status.go#L595) |
| `allocationDeadlineColumnVisible` | - | `deadlines []string` | `bool` | [L652](file:///d:/claude/nomad/command/job_status.go#L652) |
| `formatAllocList` | - | `allocations []*api.Allocation, verbose bool, uuidLength int` | `string` | [L662](file:///d:/claude/nomad/command/job_status.go#L662) |
| `outputJobSummary` | `c *JobStatusCommand` | `client *api.Client, job *api.Job` | `error` | [L730](file:///d:/claude/nomad/command/job_status.go#L730) |
| `outputReschedulingEvals` | `c *JobStatusCommand` | `client *api.Client, job *api.Job, allocListStubs []*api.AllocationListStub, u...` | `error` | [L786](file:///d:/claude/nomad/command/job_status.go#L786) |
| `outputFailedPlacements` | `c *JobStatusCommand` | `failedEval *api.Evaluation` | `` | [L850](file:///d:/claude/nomad/command/job_status.go#L850) |
| `createJsonJobsOutput` | - | `client *api.Client, allAllocs bool, jobs ...NamespacedID` | `[]JobJson, error` | [L877](file:///d:/claude/nomad/command/job_status.go#L877) |
| `createStatusListOutput` | - | `jobs []*api.JobListStub, displayNS bool` | `string` | [L915](file:///d:/claude/nomad/command/job_status.go#L915) |
| `getTypeString` | - | `job *api.JobListStub` | `string` | [L942](file:///d:/claude/nomad/command/job_status.go#L942) |
| `getStatusString` | - | `status string, stop *bool` | `string` | [L956](file:///d:/claude/nomad/command/job_status.go#L956) |

## 5. 核心方法详解

### Run()

**签名**：`func (c *JobStatusCommand) Run(args []string) int`

**位置**：[L113](file:///d:/claude/nomad/command/job_status.go#L113)

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
| `fmt` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/posener/complete` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [job_status_test.go](file:///d:/claude/nomad/command/job_status_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/command/acl.go) | 同目录源文件 |
| [acl_auth_method.go](file:///d:/claude/nomad/command/acl_auth_method.go) | 同目录源文件 |
| [acl_auth_method_create.go](file:///d:/claude/nomad/command/acl_auth_method_create.go) | 同目录源文件 |
| [acl_auth_method_delete.go](file:///d:/claude/nomad/command/acl_auth_method_delete.go) | 同目录源文件 |
| [acl_auth_method_info.go](file:///d:/claude/nomad/command/acl_auth_method_info.go) | 同目录源文件 |

