# job_restart.go 代码说明文档

> 文件路径：[job_restart.go](file:///d:/claude/nomad/command/job_restart.go)
> 总行数：1243 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`job restart`**，功能简述：

> Restart or reschedule allocations for a job

## 2. 类型定义

### ErrJobRestartPlacementFailure

**类型**：struct

```go
	EvalID string
	TaskGroup string
	Failures *api.AllocationMetric
	colorize *colorstring.Colorize
```

### JobRestartCommand

**类型**：struct

```go
	Meta
	client *api.Client
	allTasks bool
	autoYes bool
	batchSize int
	batchSizePercent bool
	batchWait time.Duration
	batchWaitAsk bool
	groups **ast.IndexExpr
	jobID string
	noShutdownDelay bool
	onError string
	reschedule bool
	tasks **ast.IndexExpr
	verbose bool
	length int
	canceled bool
	sigsCh *ast.ChanType
```

### AllocationListStubWithJob

**类型**：struct

```go
	*api.AllocationListStub
	Job *api.Job
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `jobRestartTimestampPrefixLength` | `31` |
| `jobRestartBatchWaitAsk` | `"ask"` |
| `jobRestartOnErrorFail` | `"fail"` |
| `jobRestartOnErrorAsk` | `"ask"` |

### 变量

| 名称 | 值 |
|------|----|
| `jobRestartBatchSizeValueRegex` | `*ast.CallExpr` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Error` | `e *ErrJobRestartPlacementFailure` | - | `string` | [L63](file:///d:/claude/nomad/command/job_restart.go#L63) |
| `Is` | `e *ErrJobRestartPlacementFailure` | `err error` | `bool` | [L71](file:///d:/claude/nomad/command/job_restart.go#L71) |
| `Help` | `c *JobRestartCommand` | - | `string` | [L108](file:///d:/claude/nomad/command/job_restart.go#L108) |
| `Synopsis` | `c *JobRestartCommand` | - | `string` | [L215](file:///d:/claude/nomad/command/job_restart.go#L215) |
| `AutocompleteFlags` | `c *JobRestartCommand` | - | `complete.Flags` | [L219](file:///d:/claude/nomad/command/job_restart.go#L219) |
| `AutocompleteArgs` | `c *JobRestartCommand` | - | `complete.Predictor` | [L234](file:///d:/claude/nomad/command/job_restart.go#L234) |
| `Name` | `c *JobRestartCommand` | - | `string` | [L238](file:///d:/claude/nomad/command/job_restart.go#L238) |
| `Run` | `c *JobRestartCommand` | `args []string` | `int` | [L240](file:///d:/claude/nomad/command/job_restart.go#L240) |
| `parseAndValidate` | `c *JobRestartCommand` | `args []string` | `int, error` | [L501](file:///d:/claude/nomad/command/job_restart.go#L501) |
| `filterAllocs` | `c *JobRestartCommand` | `stubs []AllocationListStubWithJob` | `[]AllocationListStubWithJob` | [L619](file:///d:/claude/nomad/command/job_restart.go#L619) |
| `ensureNoActiveDeployment` | `c *JobRestartCommand` | - | `error` | [L695](file:///d:/claude/nomad/command/job_restart.go#L695) |
| `shouldRestartMultiregion` | `c *JobRestartCommand` | - | `bool` | [L716](file:///d:/claude/nomad/command/job_restart.go#L716) |
| `shouldProceed` | `c *JobRestartCommand` | `err error` | `bool` | [L743](file:///d:/claude/nomad/command/job_restart.go#L743) |
| `shouldExit` | `c *JobRestartCommand` | - | `bool` | [L802](file:///d:/claude/nomad/command/job_restart.go#L802) |
| `askQuestion` | `c *JobRestartCommand` | `question string, onError bool, cb func(...)` | `bool` | [L822](file:///d:/claude/nomad/command/job_restart.go#L822) |
| `handleAlloc` | `c *JobRestartCommand` | `alloc AllocationListStubWithJob` | `error` | [L855](file:///d:/claude/nomad/command/job_restart.go#L855) |
| `restartAlloc` | `c *JobRestartCommand` | `alloc AllocationListStubWithJob` | `error` | [L877](file:///d:/claude/nomad/command/job_restart.go#L877) |
| `stopAlloc` | `c *JobRestartCommand` | `alloc AllocationListStubWithJob` | `error` | [L932](file:///d:/claude/nomad/command/job_restart.go#L932) |
| `monitorPlacementFailures` | `c *JobRestartCommand` | `ctx context.Context, alloc AllocationListStubWithJob, index uint64, errCh *ast.ChanType` | - | [L1007](file:///d:/claude/nomad/command/job_restart.go#L1007) |
| `monitorReplacementAlloc` | `c *JobRestartCommand` | `ctx context.Context, allocStub AllocationListStubWithJob, errCh *ast.ChanType` | - | [L1060](file:///d:/claude/nomad/command/job_restart.go#L1060) |
| `handleSignal` | `c *JobRestartCommand` | `sigsCh *ast.ChanType, activeCh *ast.ChanType` | - | [L1133](file:///d:/claude/nomad/command/job_restart.go#L1133) |
| `isErrorRecoverable` | `c *JobRestartCommand` | `err error` | `bool` | [L1154](file:///d:/claude/nomad/command/job_restart.go#L1154) |
| `errorFormat` | `c *JobRestartCommand` | `indent int` | `func(...)` | [L1173](file:///d:/claude/nomad/command/job_restart.go#L1173) |
| `HasTask` | `a *AllocationListStubWithJob` | `name string` | `bool` | [L1198](file:///d:/claude/nomad/command/job_restart.go#L1198) |
| `IsRunning` | `a *AllocationListStubWithJob` | - | `bool` | [L1233](file:///d:/claude/nomad/command/job_restart.go#L1233) |
| `isSystemJob` | `a *AllocationListStubWithJob` | - | `bool` | [L1240](file:///d:/claude/nomad/command/job_restart.go#L1240) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### Synopsis()

**简述**：`Restart or reschedule allocations for a job`

### AutocompleteFlags()

**功能**：为 shell 自动补全提供 flag 预测规则，返回 `complete.Flags` 映射。

### AutocompleteArgs()

**功能**：为 shell 自动补全提供参数预测规则。

### Name()

**命令名**：`job restart`

### Run()

**签名**：`func (c *JobRestartCommand) Run(args []string) int`

**行为**：执行命令核心逻辑，包括参数解析、API 调用、结果格式化输出。

**支持的命令行参数**：

- `-batch-size`
- `-batch-wait`

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `math` | 标准库 |
| `os` | 标准库 |
| `os/signal` | 标准库 |
| `regexp` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/dustin/go-humanize` | 第三方库 |
| `github.com/dustin/go-humanize/english` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
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
| [job_restart_test.go](file:///d:/claude/nomad/command/job_restart_test.go) | 对应测试文件 |
| [job.go](file:///d:/claude/nomad/command/job.go) | 父命令文件 |

