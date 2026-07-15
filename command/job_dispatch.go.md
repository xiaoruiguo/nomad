# job_dispatch.go 代码说明文档

> 文件路径：[job_dispatch.go](file:///d:/claude/nomad/command/job_dispatch.go)
> 总行数：482 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`job dispatch`**，功能简述：

> Dispatch an instance of a parameterized job

## 2. 类型定义

### JobDispatchCommand

**类型**：struct

```go
	Meta
```

### DispatchedJobState

**类型**：struct

```go
	ProgressDeadline time.Duration
	RequireProgressBy time.Time
	DesiredTotal int
	PlacedAllocs int
	RunningAllocs int
	FailedAllocs int
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *JobDispatchCommand` | - | `string` | [L28](file:///d:/claude/nomad/command/job_dispatch.go#L28) |
| `Synopsis` | `c *JobDispatchCommand` | - | `string` | [L89](file:///d:/claude/nomad/command/job_dispatch.go#L89) |
| `AutocompleteFlags` | `c *JobDispatchCommand` | - | `complete.Flags` | [L93](file:///d:/claude/nomad/command/job_dispatch.go#L93) |
| `AutocompleteArgs` | `c *JobDispatchCommand` | - | `complete.Predictor` | [L107](file:///d:/claude/nomad/command/job_dispatch.go#L107) |
| `Name` | `c *JobDispatchCommand` | - | `string` | [L131](file:///d:/claude/nomad/command/job_dispatch.go#L131) |
| `Run` | `c *JobDispatchCommand` | `args []string` | `int` | [L133](file:///d:/claude/nomad/command/job_dispatch.go#L133) |
| `computeDispatchedJobStates` | - | `job *api.Job, allocs []*api.AllocationListStub` | `map[string]*DispatchedJobState` | [L295](file:///d:/claude/nomad/command/job_dispatch.go#L295) |
| `monitorDispatchedJob` | `c *JobDispatchCommand` | `client *api.Client, jobID string, namespace string, verbose bool, length int` | `int` | [L340](file:///d:/claude/nomad/command/job_dispatch.go#L340) |
| `formatTaskGroups` | - | `tgs map[string]api.TaskGroupSummary` | `string` | [L453](file:///d:/claude/nomad/command/job_dispatch.go#L453) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### Synopsis()

**简述**：`Dispatch an instance of a parameterized job`

### AutocompleteFlags()

**功能**：为 shell 自动补全提供 flag 预测规则，返回 `complete.Flags` 映射。

### AutocompleteArgs()

**功能**：为 shell 自动补全提供参数预测规则。

### Name()

**命令名**：`job dispatch`

### Run()

**签名**：`func (c *JobDispatchCommand) Run(args []string) int`

**行为**：执行命令核心逻辑，包括参数解析、API 调用、结果格式化输出。

**支持的命令行参数**：

- `-detach`
- `-verbose`
- `-wait`
- `-idempotency-token`
- `-id-prefix-template`
- `-ui`
- `-priority`
- `-meta`

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net/url` | 标准库 |
| `os` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/helper/flags` | 内部包 |
| `github.com/mitchellh/go-glint` | 第三方库 |
| `github.com/mitchellh/go-glint/components` | 第三方库 |
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
| [job_dispatch_test.go](file:///d:/claude/nomad/command/job_dispatch_test.go) | 对应测试文件 |
| [job.go](file:///d:/claude/nomad/command/job.go) | 父命令文件 |

