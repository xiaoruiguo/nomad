# job_stop.go 代码说明文档

> 文件路径：[command/job_stop.go](file:///d:/claude/nomad/command/job_stop.go)
> 总行数：255 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CLI 命令包**（`command/`），实现 `nomad job_stop` 命令，通过 Nomad API 客户端与 Server 交互，提供作业管理、节点查询、集群运维等命令行功能。

## 2. 类型定义

### JobStopCommand

**定义位置**：[L15](file:///d:/claude/nomad/command/job_stop.go#L15)

**中文说明**：JobStopCommand 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobStopCommand struct {
	Meta Meta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `Meta` | 元数据 |

**关联方法**（6 个）：`Help`, `Synopsis`, `AutocompleteFlags`, `AutocompleteArgs`, `Name`, `Run`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *JobStopCommand` | `` | `string` | [L19](file:///d:/claude/nomad/command/job_stop.go#L19) |
| `Synopsis` | `c *JobStopCommand` | `` | `string` | [L74](file:///d:/claude/nomad/command/job_stop.go#L74) |
| `AutocompleteFlags` | `c *JobStopCommand` | `` | `complete.Flags` | [L78](file:///d:/claude/nomad/command/job_stop.go#L78) |
| `AutocompleteArgs` | `c *JobStopCommand` | `` | `complete.Predictor` | [L91](file:///d:/claude/nomad/command/job_stop.go#L91) |
| `Name` | `c *JobStopCommand` | `` | `string` | [L95](file:///d:/claude/nomad/command/job_stop.go#L95) |
| `Run` | `c *JobStopCommand` | `args []string` | `int` | [L97](file:///d:/claude/nomad/command/job_stop.go#L97) |

## 5. 核心方法详解

### Run()

**签名**：`func (c *JobStopCommand) Run(args []string) int`

**位置**：[L97](file:///d:/claude/nomad/command/job_stop.go#L97)

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
| `strings` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/posener/complete` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [job_stop_test.go](file:///d:/claude/nomad/command/job_stop_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/command/acl.go) | 同目录源文件 |
| [acl_auth_method.go](file:///d:/claude/nomad/command/acl_auth_method.go) | 同目录源文件 |
| [acl_auth_method_create.go](file:///d:/claude/nomad/command/acl_auth_method_create.go) | 同目录源文件 |
| [acl_auth_method_delete.go](file:///d:/claude/nomad/command/acl_auth_method_delete.go) | 同目录源文件 |
| [acl_auth_method_info.go](file:///d:/claude/nomad/command/acl_auth_method_info.go) | 同目录源文件 |



---

## Run 函数业务逻辑深度分析

> 分析文件：[job_stop.go](file:///d:/claude/nomad/command/job_stop.go)
> Run 函数数量：1

### 1. *JobStopCommand.Run

**定义位置**：[L97-L254](file:///d:/claude/nomad/command/job_stop.go#L97-L254)

**函数签名**：

```go
func (*JobStopCommand) Run(args []string) (int) {
    // ...
}
```

**业务逻辑要点**：

1. **命令行参数解析**：通过 `flags.Parse()` 解析 7 个命令行 flag
2. **参数校验**：存在错误退出路径，对输入参数进行校验，校验失败返回 1
3. **API 客户端初始化**：通过 `Meta.Client()` 获取 Nomad API 客户端，调用 1 个不同的 API 端点
4. **业务处理**：调用 API 获取数据后，通过 `Ui.Output()` / `Ui.Info()` 输出结果
5. **退出处理**：成功返回 0，失败返回 1

**命令行 Flag 解析**：

| 行号 | Flag名 | 说明 |
|------|--------|------|
| L103 | `detach` | 命令行参数 |
| L104 | `verbose` | 命令行参数 |
| L105 | `global` | 命令行参数 |
| L106 | `no-shutdown-delay` | 命令行参数 |
| L107 | `yes` | 命令行参数 |
| L108 | `purge` | 命令行参数 |
| L109 | `eval-priority` | 命令行参数 |

**关键调用链**：

| 行号 | 调用 | 说明 |
|------|------|------|
| L101 | `c.Meta.FlagSet` | 创建 flag 解析器 |
| L101 | `c.Name` | 业务调用 |
| L102 | `c.Help` | 业务调用 |
| L129 | `c.Meta.Client` | 获取 Nomad API 客户端 |
| L140 | `wg.Add` | 业务调用 |
| L141 | `func() {
	defer wg.Done()
	length := shortId
	if verbose {
		length = fullId
	}
	job, err := c.JobByPrefix(client, jobID)
	if err != nil {
		c.Ui.Error(err.Error())
		statusCh <- 1
		return
	}
	getConfirmation := func(question string) (int, bool) {
		answer, err := c.Ui.Ask(question)
		if err != nil {
			c.Ui.Error(fmt.Sprintf("Failed to parse answer: %v", err))
			return 1, false
		}
		if answer == "" || strings.ToLower(answer)[0] == 'n' {
			c.Ui.Output("Cancelling job stop")
			return 0, false
		} else if strings.ToLower(answer)[0] == 'y' && len(answer) > 1 {
			c.Ui.Output("For confirmation, an exact ‘y’ is required.")
			return 0, false
		} else if answer != "y" {
			c.Ui.Output("No confirmation detected. For confirmation, an exact 'y' is required.")
			return 1, false
		}
		return 0, true
	}
	if len(jobIDs) == 1 && jobID != *job.ID && !autoYes {
		question := fmt.Sprintf("Are you sure you want to stop job %q? [y/N]", *job.ID)
		code, confirmed := getConfirmation(question)
		if !confirmed {
			statusCh <- code
			return
		}
	}
	if len(jobIDs) == 1 && job.IsMultiregion() && !global && !autoYes {
		question := fmt.Sprintf("Are you sure you want to stop multi-region job %q in a single region? [y/N]", *job.ID)
		code, confirmed := getConfirmation(question)
		if !confirmed {
			statusCh <- code
			return
		}
	}
	opts := &api.DeregisterOptions{Purge: purge, Global: global, EvalPriority: evalPriority, NoShutdownDelay: noShutdownDelay}
	wq := &api.WriteOptions{Namespace: *job.Namespace}
	evalID, _, err := client.Jobs().DeregisterOpts(*job.ID, opts, wq)
	if err != nil {
		c.Ui.Error(fmt.Sprintf("Error deregistering job with id %s err: %s", jobID, err))
		statusCh <- 1
		return
	}
	if evalID == "" {
		statusCh <- 0
		return
	}
	if detach {
		c.Ui.Output(evalID)
		statusCh <- 0
		return
	}
	mon := newMonitor(c.Meta, client, length)
	statusCh <- mon.monitor(evalID)
}` | 调用 Jobs API |
| L142 | `wg.Done` | 业务调用 |
| L151 | `c.JobByPrefix` | 业务调用 |
| L153 | `err.Error` | 输出错误信息 |
| L195 | `job.IsMultiregion` | 业务调用 |
| L208 | `client.Jobs().DeregisterOpts` | 调用 Jobs API |
| L208 | `client.Jobs` | 业务调用 |
| L231 | `mon.monitor` | 业务调用 |
| L238 | `wg.Wait` | 业务调用 |

**涉及的 Nomad API 端点**：

- `Jobs API.DeregisterOpts`

**退出点分析**：

| 行号 | 退出代码 | 退出原因 |
|------|---------|---------|
| L112 | `return 1` | 错误退出 |
| L120 | `return 1` | 错误退出 |
| L132 | `return 1` | 错误退出 |
| L155 | `return` | 无返回值 |
| L162 | `return 1, false` | 错误退出 |
| L168 | `return 0, false` | 成功退出 |
| L172 | `return 0, false` | 成功退出 |
| L175 | `return 1, false` | 错误退出 |
| L177 | `return 0, true` | 成功退出 |
| L190 | `return` | 无返回值 |
| L201 | `return` | 无返回值 |
| L212 | `return` | 无返回值 |
| L218 | `return` | 无返回值 |
| L225 | `return` | 无返回值 |
| L249 | `return status` | 返回值 |
| L253 | `return 0` | 成功退出 |

**关键注释说明**：

| 行号 | 注释内容 |
|------|---------|
| L115 | Check that we got exactly one job |
| L128 | Get the HTTP client |
| L144 | Truncate the id unless full length is requested |
| L150 | Check if the job exists |
| L166 | No case |
| L170 | Non exact match yes |
| L180 | Confirm the stop if the job was a prefix match |
| L181 | Ask for confirmation only when there's just one |
| L182 | job that needs to be stopped. Since we're stopping |
| L183 | jobs concurrently, we're going to skip confirmation |
| L184 | for when multiple jobs need to be stopped. |
| L194 | Confirm we want to stop only a single region of a multiregion job |
| L205 | Invoke the stop |
| L215 | If we are stopping a periodic job there won't be an evalID. |
| L221 | Goroutine won't wait on monitor |
| L228 | Start monitoring the stop eval |
| L229 | and return result on status channel |
| L234 | users will still see |
| L235 | errors if any while we |
| L236 | wait for the goroutines |
| L237 | to finish processing |
| L240 | close the channel to ensure |
| L241 | the range statement below |
| L242 | doesn't go on indefinitely |
| L245 | return a non-zero exit code |
| L246 | if even a single job stop fails |

