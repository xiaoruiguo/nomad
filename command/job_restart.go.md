# job_restart.go 代码说明文档

> 文件路径：[command/job_restart.go](file:///d:/claude/nomad/command/job_restart.go)
> 总行数：1243 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CLI 命令包**（`command/`），实现 `nomad job_restart` 命令，通过 Nomad API 客户端与 Server 交互，提供作业管理、节点查询、集群运维等命令行功能。

## 2. 类型定义

### ErrJobRestartPlacementFailure

**定义位置**：[L56](file:///d:/claude/nomad/command/job_restart.go#L56)

**中文说明**：ErrJobRestartPlacementFailure 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type ErrJobRestartPlacementFailure struct {
	EvalID string
	TaskGroup string
	Failures *api.AllocationMetric
	colorize *colorstring.Colorize
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EvalID` | `string` | 字符串 |
| `TaskGroup` | `string` | 字符串 |
| `Failures` | `*api.AllocationMetric` | 失败计数，用于计算退避 |
| `colorize` | `*colorstring.Colorize` | 字符串 |

**关联方法**（2 个）：`Error`, `Is`

### JobRestartCommand

**定义位置**：[L77](file:///d:/claude/nomad/command/job_restart.go#L77)

**中文说明**：JobRestartCommand 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobRestartCommand struct {
	Meta Meta
	client *api.Client
	allTasks bool
	autoYes bool
	batchSize int
	batchSizePercent bool
	batchWait time.Duration
	batchWaitAsk bool
	groups *set.Set[string]
	jobID string
	noShutdownDelay bool
	onError string
	reschedule bool
	tasks *set.Set[string]
	verbose bool
	length int
	canceled bool
	sigsCh chan os.Signal
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `Meta` | 元数据 |
| `client` | `*api.Client` | — |
| `allTasks` | `bool` | 布尔值 |
| `autoYes` | `bool` | 布尔值 |
| `batchSize` | `int` | — |
| `batchSizePercent` | `bool` | 布尔值 |
| `batchWait` | `time.Duration` | 时间间隔 |
| `batchWaitAsk` | `bool` | 布尔值 |
| `groups` | `*set.Set[string]` | 字符串 |
| `jobID` | `string` | 字符串 |
| `noShutdownDelay` | `bool` | 布尔值 |
| `onError` | `string` | 字符串 |
| `reschedule` | `bool` | 布尔值 |
| `tasks` | `*set.Set[string]` | 字符串 |
| `verbose` | `bool` | 布尔值 |
| `length` | `int` | — |
| `canceled` | `bool` | 布尔值 |
| `sigsCh` | `chan os.Signal` | 通道 |

**关联方法**（21 个）：`Help`, `Synopsis`, `AutocompleteFlags`, `AutocompleteArgs`, `Name`, `Run`, `parseAndValidate`, `filterAllocs`, `ensureNoActiveDeployment`, `shouldRestartMultiregion`, `shouldProceed`, `shouldExit`, `askQuestion`, `handleAlloc`, `restartAlloc`, `stopAlloc`, `monitorPlacementFailures`, `monitorReplacementAlloc`, `handleSignal`, `isErrorRecoverable`, `errorFormat`

### AllocationListStubWithJob

**定义位置**：[L1191](file:///d:/claude/nomad/command/job_restart.go#L1191)

**中文说明**：AllocationListStubWithJob 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocationListStubWithJob struct {
	*api.AllocationListStub *api.AllocationListStub
	Job *api.Job
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `*api.AllocationListStub` | `*api.AllocationListStub` | — |
| `Job` | `*api.Job` | — |

**关联方法**（3 个）：`HasTask`, `IsRunning`, `isSystemJob`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `jobRestartTimestampPrefixLength` | `—` | `31` | — |
| `jobRestartBatchWaitAsk` | `—` | `"ask"` | — |
| `jobRestartOnErrorFail` | `—` | `"fail"` | — |
| `jobRestartOnErrorAsk` | `—` | `"ask"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `jobRestartBatchSizeValueRegex` | `—` | `regexp.MustCompile(`^(\d+)%?$`)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Error` | `e *ErrJobRestartPlacementFailure` | `` | `string` | [L63](file:///d:/claude/nomad/command/job_restart.go#L63) |
| `Is` | `e *ErrJobRestartPlacementFailure` | `err error` | `bool` | [L71](file:///d:/claude/nomad/command/job_restart.go#L71) |
| `Help` | `c *JobRestartCommand` | `` | `string` | [L108](file:///d:/claude/nomad/command/job_restart.go#L108) |
| `Synopsis` | `c *JobRestartCommand` | `` | `string` | [L215](file:///d:/claude/nomad/command/job_restart.go#L215) |
| `AutocompleteFlags` | `c *JobRestartCommand` | `` | `complete.Flags` | [L219](file:///d:/claude/nomad/command/job_restart.go#L219) |
| `AutocompleteArgs` | `c *JobRestartCommand` | `` | `complete.Predictor` | [L234](file:///d:/claude/nomad/command/job_restart.go#L234) |
| `Name` | `c *JobRestartCommand` | `` | `string` | [L238](file:///d:/claude/nomad/command/job_restart.go#L238) |
| `Run` | `c *JobRestartCommand` | `args []string` | `int` | [L240](file:///d:/claude/nomad/command/job_restart.go#L240) |
| `parseAndValidate` | `c *JobRestartCommand` | `args []string` | `int, error` | [L501](file:///d:/claude/nomad/command/job_restart.go#L501) |
| `filterAllocs` | `c *JobRestartCommand` | `stubs []AllocationListStubWithJob` | `[]AllocationListStubWithJob` | [L619](file:///d:/claude/nomad/command/job_restart.go#L619) |
| `ensureNoActiveDeployment` | `c *JobRestartCommand` | `` | `error` | [L695](file:///d:/claude/nomad/command/job_restart.go#L695) |
| `shouldRestartMultiregion` | `c *JobRestartCommand` | `` | `bool` | [L716](file:///d:/claude/nomad/command/job_restart.go#L716) |
| `shouldProceed` | `c *JobRestartCommand` | `err error` | `bool` | [L743](file:///d:/claude/nomad/command/job_restart.go#L743) |
| `shouldExit` | `c *JobRestartCommand` | `` | `bool` | [L802](file:///d:/claude/nomad/command/job_restart.go#L802) |
| `askQuestion` | `c *JobRestartCommand` | `question string, onError bool, cb func(...)` | `bool` | [L822](file:///d:/claude/nomad/command/job_restart.go#L822) |
| `handleAlloc` | `c *JobRestartCommand` | `alloc AllocationListStubWithJob` | `error` | [L855](file:///d:/claude/nomad/command/job_restart.go#L855) |
| `restartAlloc` | `c *JobRestartCommand` | `alloc AllocationListStubWithJob` | `error` | [L877](file:///d:/claude/nomad/command/job_restart.go#L877) |
| `stopAlloc` | `c *JobRestartCommand` | `alloc AllocationListStubWithJob` | `error` | [L932](file:///d:/claude/nomad/command/job_restart.go#L932) |
| `monitorPlacementFailures` | `c *JobRestartCommand` | `ctx context.Context, alloc AllocationListStubWithJob, index uint64, errCh cha...` | `` | [L1007](file:///d:/claude/nomad/command/job_restart.go#L1007) |
| `monitorReplacementAlloc` | `c *JobRestartCommand` | `ctx context.Context, allocStub AllocationListStubWithJob, errCh chan<- error` | `` | [L1060](file:///d:/claude/nomad/command/job_restart.go#L1060) |
| `handleSignal` | `c *JobRestartCommand` | `sigsCh chan os.Signal, activeCh chan any` | `` | [L1133](file:///d:/claude/nomad/command/job_restart.go#L1133) |
| `isErrorRecoverable` | `c *JobRestartCommand` | `err error` | `bool` | [L1154](file:///d:/claude/nomad/command/job_restart.go#L1154) |
| `errorFormat` | `c *JobRestartCommand` | `indent int` | `func(...)` | [L1173](file:///d:/claude/nomad/command/job_restart.go#L1173) |
| `HasTask` | `a *AllocationListStubWithJob` | `name string` | `bool` | [L1198](file:///d:/claude/nomad/command/job_restart.go#L1198) |
| `IsRunning` | `a *AllocationListStubWithJob` | `` | `bool` | [L1233](file:///d:/claude/nomad/command/job_restart.go#L1233) |
| `isSystemJob` | `a *AllocationListStubWithJob` | `` | `bool` | [L1240](file:///d:/claude/nomad/command/job_restart.go#L1240) |

## 5. 核心方法详解

### Run()

**签名**：`func (c *JobRestartCommand) Run(args []string) int`

**位置**：[L240](file:///d:/claude/nomad/command/job_restart.go#L240)

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
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/dustin/go-humanize` | 第三方库 |
| `github.com/dustin/go-humanize/english` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/mitchellh/colorstring` | 第三方库 |
| `github.com/posener/complete` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [job_restart_test.go](file:///d:/claude/nomad/command/job_restart_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/command/acl.go) | 同目录源文件 |
| [acl_auth_method.go](file:///d:/claude/nomad/command/acl_auth_method.go) | 同目录源文件 |
| [acl_auth_method_create.go](file:///d:/claude/nomad/command/acl_auth_method_create.go) | 同目录源文件 |
| [acl_auth_method_delete.go](file:///d:/claude/nomad/command/acl_auth_method_delete.go) | 同目录源文件 |
| [acl_auth_method_info.go](file:///d:/claude/nomad/command/acl_auth_method_info.go) | 同目录源文件 |

