# Nomad Job 命令组调用链分析

本文档分析 `command/` 目录中 Job 命令组的每个子命令，列出其作用、CLI 调用格式、调用的 Nomad API 及内部辅助函数。

## 命令组结构

Job 命令组通过 [commands.go:431-555](file:///d:/claude/nomad/command/commands.go#L431-L555) 注册，包含以下子命令：

```
nomad job
├── action            # 在 alloc 内运行预定义 action
├── allocs            # 列出 job 的 allocations
├── deployments       # 列出 job 的 deployments
├── dispatch          # 派发 parameterized job 实例
├── eval              # 强制评估 job
├── history           # 显示 job 历史版本
├── init              # 创建示例 job 文件
├── inspect           # 查看 job 详细定义
├── periodic          # periodic 子命令组（仅帮助）
│   └── force         # 强制触发 periodic job
├── plan              # 干跑 job 更新以查看影响
├── promote           # 提升 canary 部署
├── restart           # 重启或重调度 allocations
├── revert            # 回滚到 job 历史版本
├── run               # 运行新 job 或更新现有 job
├── scale             # 修改 job group 的 count
├── scaling-events    # 显示 job 的 scaling 事件
├── start             # 启动已停止的 job
├── status            # 查看 job 状态
├── stop              # 停止 job
├── tag               # tag 子命令组（仅帮助）
│   ├── apply         # 给 job 版本打 tag
│   └── unset         # 移除 job 版本的 tag
└── validate          # 验证 job 规范
```

## 公共辅助组件

| 组件 | 文件 | 说明 |
|------|------|------|
| `Meta` | [meta.go](file:///d:/claude/nomad/command/meta.go) | 提供 `Client()`、`JobIDByPrefix()`、`FlagSet()`、`JobByPrefix()` 等通用方法 |
| `JobGetter` | [job_getter.go](file:///d:/claude/nomad/command/job_getter.go) | 从文件/stdin/URL 读取并解析 job 规范（HCL2/JSON） |
| `monitor` | [monitor.go](file:///d:/claude/nomad/command/monitor.go) | 监控 evaluation 进度 |
| `JobPredictor` | [job.go:62](file:///d:/claude/nomad/command/job.go#L62) | 通过 `client.Search().PrefixSearch()` 实现 job ID 自动补全 |

## 命令调用链总表

| 命令 | 文件 | 调用的 Nomad API | 关键辅助调用 |
|------|------|------------------|-------------|
| `job` | [job.go](file:///d:/claude/nomad/command/job.go) | 无（仅显示帮助） | `cli.RunResultHelp` |
| `job action` | [job_action.go](file:///d:/claude/nomad/command/job_action.go) | `Allocations().PrefixList`、`Allocations().Info`、`Jobs().ActionExec` | `JobIDByPrefix`、`getRandomJobAlloc`、`validateTaskExistsInAllocation`、`lookupAllocTask`、`setRawTerminal`、`watchTerminalSize` |
| `job allocs` | [job_allocs.go](file:///d:/claude/nomad/command/job_allocs.go) | `Jobs().Info`、`Jobs().Allocations` | `JobIDByPrefix`、`formatJobAllocListStubs` |
| `job deployments` | [job_deployments.go](file:///d:/claude/nomad/command/job_deployments.go) | `Jobs().LatestDeployment` 或 `Jobs().Deployments` | `JobIDByPrefix`、`formatDeployment`、`formatDeployments` |
| `job dispatch` | [job_dispatch.go](file:///d:/claude/nomad/command/job_dispatch.go) | `Jobs().PrefixList`（过滤 parameterized）、`Jobs().DispatchOpts`、`Jobs().Info`、`Jobs().Summary`、`Jobs().Allocations` | `jobIDByPrefix`（带过滤）、`newMonitor`、`monitorDispatchedJob`（用 glint） |
| `job eval` | [job_eval.go](file:///d:/claude/nomad/command/job_eval.go) | `Jobs().EvaluateWithOpts` | `JobIDByPrefix`、`newMonitor` |
| `job history` | [job_history.go](file:///d:/claude/nomad/command/job_history.go) | `Jobs().VersionsOpts` | `JobIDByPrefix`、`parseVersion`、`formatJobVersion`、`formatJobDiff` |
| `job init` | [job_init.go](file:///d:/claude/nomad/command/job_init.go) | `Variables().PrefixList`（-list-templates）、`Variables().Read`（-template） | `asset.JobExample`、`asset.JobExampleShort`、`asset.JobConnect`、`asset.JobConnectShort` |
| `job inspect` | [job_inspect.go](file:///d:/claude/nomad/command/job_inspect.go) | `Jobs().Info`、`Jobs().Versions`、`Jobs().Submission`、`Jobs().List` | `JobIDByPrefix`、`parseVersion`、`getJob`、`getJobHCL` |
| `job periodic` | [job_periodic.go](file:///d:/claude/nomad/command/job_periodic.go) | 无（仅显示帮助） | `cli.RunResultHelp` |
| `job periodic force` | [job_periodic_force.go](file:///d:/claude/nomad/command/job_periodic_force.go) | `Jobs().PrefixList`（过滤 periodic）、`Jobs().PeriodicForce` | `jobIDByPrefix`（带过滤）、`newMonitor` |
| `job plan` | [job_plan.go](file:///d:/claude/nomad/command/job_plan.go) | `Jobs().PlanOpts`（每 region 一次） | `JobGetter.Get`、`multiregionPlan`、`outputPlannedJob`、`formatJobDiff`、`formatDryRun`、`addPreemptions` |
| `job promote` | [job_promote.go](file:///d:/claude/nomad/command/job_promote.go) | `Jobs().LatestDeployment`、`Deployments().PromoteAll` 或 `Deployments().PromoteGroups` | `JobIDByPrefix`、`newMonitor` |
| `job restart` | [job_restart.go](file:///d:/claude/nomad/command/job_restart.go) | `Jobs().Versions`、`Jobs().Allocations`、`Jobs().Deployments`、`Jobs().Evaluations`、`Jobs().EvaluateWithOpts`、`Allocations().Info`、`Allocations().Restart`、`Allocations().RestartAllTasks`、`Allocations().Stop` | `JobByPrefix`、`parseAndValidate`、`filterAllocs`、`handleAlloc`、`ensureNoActiveDeployment`、`handleSignal`、`batch.Wait`（multierror.Group） |
| `job revert` | [job_revert.go](file:///d:/claude/nomad/command/job_revert.go) | `Jobs().VersionByTag`（如果传 tag）、`Jobs().Revert` | `JobIDByPrefix`、`parseVersion`、`newMonitor` |
| `job run` | [job_run.go](file:///d:/claude/nomad/command/job_run.go) | `Jobs().RegisterOpts` 或 `Jobs().Register`（start 复用） | `JobGetter.Get`、`parseCheckIndex`、`newMonitor`、`showUIPath` |
| `job scale` | [job_scale.go](file:///d:/claude/nomad/command/job_scale.go) | `Jobs().ScaleStatus`、`Jobs().ScaleWithRequest`、`Jobs().Info` | `JobIDByPrefix`、`performGroupCheck`、`newMonitor` |
| `job scaling-events` | [job_scaling_events.go](file:///d:/claude/nomad/command/job_scaling_events.go) | `Jobs().ScaleStatus` | `JobIDByPrefix`、`sortedScalingEventList`、`formatScalingEventListOutput` |
| `job start` | [job_start.go](file:///d:/claude/nomad/command/job_start.go) | `Jobs().Info`（via `JobByPrefix`）、`Jobs().Submission`、`Jobs().Register` | `JobByPrefix`、`parseFromSubmission`（用 `jobspec2.Parse`）、`newMonitor` |
| `job status` | [job_status.go](file:///d:/claude/nomad/command/job_status.go) | `Jobs().ListOptions`、`Jobs().Info`、`Jobs().Allocations`、`Jobs().Evaluations`、`Jobs().LatestDeployment`、`Jobs().Summary`、`Jobs().PrefixList`（periodic/parameterized 子任务）、`Evaluations().Info` | `JobIDByPrefix`、`createJsonJobsOutput`、`outputPeriodicInfo`、`outputParameterizedInfo`、`outputJobInfo`、`outputJobSummary`、`outputReschedulingEvals`、`formatDeployment`、`fetchMultiRegionDeployments` |
| `job stop` | [job_stop.go](file:///d:/claude/nomad/command/job_stop.go) | `Jobs().Info`（via `JobByPrefix`）、`Jobs().DeregisterOpts` | `JobByPrefix`、`getConfirmation`、`newMonitor`（每 job 一个 goroutine） |
| `job tag` | [job_tag.go](file:///d:/claude/nomad/command/job_tag.go) | 无（仅显示帮助） | `cli.RunResultHelp` |
| `job tag apply` | [job_tag_apply.go](file:///d:/claude/nomad/command/job_tag_apply.go) | `Jobs().Info`（如未指定 -version）、`Jobs().TagVersion` | `JobIDByPrefix` |
| `job tag unset` | [job_tag_unset.go](file:///d:/claude/nomad/command/job_tag_unset.go) | `Jobs().UntagVersion` | `JobIDByPrefix` |
| `job validate` | [job_validate.go](file:///d:/claude/nomad/command/job_validate.go) | `Jobs().Validate`（失败回退到 `validateLocal`） | `JobGetter.Get`、`agent.ApiJobToStructJob`、`job.Validate`、`job.Canonicalize` |

## 详细调用链

### 1. `job action`

在指定 allocation/task 内执行预定义的 action（类似 exec，但命令预定义在 job spec 中）。

```
JobActionCommand.Run
├── Meta.Client                                    # 获取 API client
├── Meta.JobIDByPrefix                             # 按 prefix 解析 job ID
├── Allocations().PrefixList                       # 若未指定 -alloc，按 alloc prefix 列出
├── getRandomJobAlloc                              # 从 job + group 中选随机 alloc
│   └── Jobs().Allocations                         # 列出 job 的 allocations
├── Allocations().Info                             # 获取 alloc 详情
├── validateTaskExistsInAllocation / lookupAllocTask
├── setRawTerminal / setRawTerminalOutput / watchTerminalSize
└── Jobs().ActionExec                              # 执行 action（流式 stdin/stdout/stderr）
```

### 2. `job allocs`

列出 job 关联的所有 allocations。

```
JobAllocsCommand.Run
├── Meta.Client
├── Meta.JobIDByPrefix
├── Jobs().Info                                    # 获取 job（用于 MaxRunDeadline 列）
└── Jobs().Allocations                             # 列出 allocations
```

### 3. `job deployments`

列出 job 的 deployments 或最新 deployment。

```
JobDeploymentsCommand.Run
├── Meta.Client
├── Meta.JobIDByPrefix
├── if -latest:
│   └── Jobs().LatestDeployment
└── else:
    └── Jobs().Deployments
```

### 4. `job dispatch`

派发 parameterized job 的新实例。

```
JobDispatchCommand.Run
├── Meta.Client
├── jobIDByPrefix (with ParameterizedJob filter)  # 仅匹配 parameterized job
│   └── Jobs().PrefixList
├── Jobs().DispatchOpts                            # 派发
├── newMonitor.monitor(EvalID)                     # 默认监控 eval
└── if -wait:
    └── monitorDispatchedJob                       # 轮询直至 job dead
        ├── Jobs().Info
        ├── Jobs().Summary
        └── Jobs().Allocations                     # verbose 模式
```

### 5. `job eval`

强制触发 job 的 evaluation。

```
JobEvalCommand.Run
├── Meta.Client
├── Meta.JobIDByPrefix
├── Jobs().EvaluateWithOpts                        # 创建 eval
└── newMonitor.monitor(EvalID)
```

### 6. `job history`

显示 job 的版本历史。

```
JobHistoryCommand.Run
├── Meta.Client
├── Meta.JobIDByPrefix
└── Jobs().VersionsOpts                            # 支持差分、tag、version 过滤
```

### 7. `job init`

生成本地示例 job 文件。

```
JobInitCommand.Run
├── if -list-templates:
│   ├── Meta.Client
│   └── Variables().PrefixList("nomad/job-templates/")
├── elif -template:
│   ├── Meta.Client
│   └── Variables().Read("nomad/job-templates/<template>")
└── else:
    └── asset.JobExample / JobExampleShort / JobConnect / JobConnectShort
└── os.WriteFile                                   # 写入本地文件
```

### 8. `job inspect`

查看 job 的完整定义。

```
JobInspectCommand.Run
├── Meta.Client
├── if 无参数且 -json/-t:
│   └── Jobs().List
├── Meta.JobIDByPrefix
├── if -hcl:
│   ├── Jobs().Info (若未指定 version)             # 获取当前 version
│   └── Jobs().Submission                          # 获取原始 HCL 源码
└── else:
    └── getJob
        ├── Jobs().Info                            # 当前版本
        └── Jobs().Versions                        # 历史版本（指定 -version 时）
```

### 9. `job periodic force`

强制触发 periodic job。

```
JobPeriodicForceCommand.Run
├── Meta.Client
├── jobIDByPrefix (with Periodic filter)           # 仅匹配 periodic job
│   └── Jobs().PrefixList
├── Jobs().PeriodicForce                           # 创建 eval
└── newMonitor.monitor(EvalID)
```

### 10. `job plan`

干跑 job 以查看调度影响。

```
JobPlanCommand.Run
├── JobGetter.Get                                  # 解析 job 文件
├── Meta.Client
├── client.SetRegion / SetNamespace                # 应用 job 中的 region/namespace
├── if multiregion:
│   └── multiregionPlan
│       └── for each region:
│           └── Jobs().PlanOpts
└── else:
    └── Jobs().PlanOpts
└── outputPlannedJob
    ├── formatJobDiff
    ├── formatDryRun
    └── addPreemptions
```

### 11. `job promote`

提升最新部署中的 canary。

```
JobPromoteCommand.Run
├── Meta.Client
├── Meta.JobIDByPrefix
├── Jobs().LatestDeployment                        # 获取最新 deployment
└── if no -group:
    └── Deployments().PromoteAll
    else:
    └── Deployments().PromoteGroups
└── newMonitor.monitor(EvalID)
```

### 12. `job restart`

重启或重调度 allocations（支持批处理）。

```
JobRestartCommand.Run
├── parseAndValidate                               # 解析参数
├── Meta.Client
├── JobByPrefix                                    # 解析 job
├── Jobs().Versions                                # 获取 job 历史
├── Jobs().Allocations                             # 获取 allocations
├── filterAllocs                                   # 按 group/task 过滤
├── for each batch:
│   ├── ensureNoActiveDeployment
│   │   └── Jobs().Deployments
│   └── batch.Go (并发处理 allocs):
│       └── handleAlloc
│           ├── if -reschedule:
│           │   ├── Allocations().Stop             # 停止 alloc 触发重调度
│           │   ├── Jobs().EvaluateWithOpts        # 手动触发 eval（如需要）
│           │   └── 等待新 alloc 到 ready
│           │       ├── Jobs().Evaluations
│           │       └── Allocations().Info
│           └── else (in-place restart):
│               ├── Allocations().RestartAllTasks  # -all-tasks
│               └── Allocations().Restart          # -task 或所有 running tasks
```

### 13. `job revert`

回滚到历史版本。

```
JobRevertCommand.Run
├── Meta.Client
├── if 参数是 tag:
│   └── Jobs().VersionByTag                        # 通过 tag 查找版本
├── Meta.JobIDByPrefix
└── Jobs().Revert                                  # 执行回滚
└── newMonitor.monitor(EvalID)
```

### 14. `job run`

运行新 job 或更新现有 job。

```
JobRunCommand.Run
├── JobGetter.Get                                  # 解析 job 文件（含 submission）
├── Meta.Client
├── client.SetRegion / SetNamespace
├── if -output:
│   └── json.MarshalIndent(job)                    # 仅输出 JSON 不提交
├── parseCheckIndex
└── Jobs().RegisterOpts                            # 提交 job
└── if detach/periodic/parameterized/multiregion:
    └── 输出 eval ID 并返回
    else:
    └── newMonitor.monitor(EvalID)
```

### 15. `job scale`

修改 job group 的 count。

```
JobScaleCommand.Run
├── Meta.Client
├── Meta.JobIDByPrefix
├── Jobs().ScaleStatus                             # 检查 group 存在
├── performGroupCheck
└── Jobs().ScaleWithRequest                        # 提交 scaling 请求
├── Jobs().Info                                    # 获取 job 类型判断是否需要监控
└── newMonitor.monitor(EvalID)
```

### 16. `job scaling-events`

列出 job 的 scaling 事件。

```
JobScalingEventsCommand.Run
├── Meta.Client
├── Meta.JobIDByPrefix
└── Jobs().ScaleStatus                             # 获取 scaling events
└── sortedScalingEventList + formatScalingEventListOutput
```

### 17. `job start`

启动已停止的 job。

```
JobStartCommand.Run
├── Meta.Client
├── JobByPrefix                                    # 获取 job 详情
├── if job 有 scaling policies:
│   ├── Jobs().Submission                          # 获取原始提交
│   └── parseFromSubmission                        # 重新解析以恢复 policy 状态
└── Jobs().Register                                # 重新注册（Stop=false）
└── newMonitor.monitor(EvalID)
```

### 18. `job status`

查看 job 状态（最复杂的查询命令）。

```
JobStatusCommand.Run
├── Meta.Client
├── if 无参数:
│   ├── Jobs().ListOptions                         # 列出所有 jobs
│   └── createJsonJobsOutput (if -json/-t)
│       ├── Jobs().Summary
│       ├── Jobs().Allocations
│       ├── Jobs().LatestDeployment
│       └── Jobs().Evaluations
├── Meta.JobIDByPrefix
├── Jobs().Info                                    # 获取 job 详情
├── if -json/-t:
│   └── createJsonJobsOutput
└── else (按 job 类型分支):
    ├── outputPeriodicInfo (periodic):
    │   ├── outputJobSummary → Jobs().Summary
    │   └── Jobs().PrefixList                     # 查找 periodic 子任务
    ├── outputParameterizedInfo (parameterized):
    │   ├── outputJobSummary → Jobs().Summary
    │   └── Jobs().PrefixList                     # 查找 dispatched 子任务
    └── outputJobInfo (普通 job):
        ├── Jobs().Allocations
        ├── Jobs().Evaluations
        ├── Jobs().LatestDeployment
        ├── outputJobSummary → Jobs().Summary
        ├── outputReschedulingEvals
        │   └── Evaluations().Info
        └── formatDeployment
            └── fetchMultiRegionDeployments (if multiregion)
                └── Jobs().Info + 区域并行查询
```

### 19. `job stop`

停止 job（支持多个 job 并发停止）。

```
JobStopCommand.Run
├── Meta.Client
└── for each jobID (并发 goroutine):
    ├── JobByPrefix                                # 解析 job
    ├── getConfirmation (if 前缀匹配且单个 job)
    ├── getConfirmation (if multiregion 且未 -global)
    └── Jobs().DeregisterOpts                      # 停止 job
    └── newMonitor.monitor(EvalID)                 # 非 detach 模式
```

### 20. `job tag apply` / `job tag unset`

管理 job 版本的 tag。

```
JobTagApplyCommand.Run
├── Meta.Client
├── Meta.JobIDByPrefix
├── if 无 -version:
│   └── Jobs().Info                                # 获取当前版本号
└── Jobs().TagVersion

JobTagUnsetCommand.Run
├── Meta.Client
├── Meta.JobIDByPrefix
└── Jobs().UntagVersion
```

### 21. `job validate`

验证 job 规范。

```
JobValidateCommand.Run
├── JobGetter.Get                                  # 解析 job 文件
├── Meta.Client
├── client.SetRegion
├── Jobs().Validate                                # 服务端验证
└── if 失败:
    └── validateLocal                              # 本地回退验证
        ├── agent.ApiJobToStructJob
        ├── job.Canonicalize
        └── job.Validate
```

## API 调用频次统计

| API 方法 | 调用命令数 | 调用命令 |
|---------|-----------|---------|
| `Jobs().Info` | 9 | allocs, inspect, dispatch, run, scale, start, status, tag apply, stop(via JobByPrefix) |
| `Jobs().Allocations` | 6 | action(via getRandomJobAlloc), allocs, dispatch, restart, status, status(json) |
| `Jobs().PrefixList` | 4 | action(predictor), dispatch, periodic force, status(periodic/param children) |
| `Jobs().LatestDeployment` | 4 | deployments, promote, status, status(json) |
| `Jobs().ScaleStatus` | 2 | scale, scaling-events |
| `Jobs().Evaluations` | 3 | restart, status, status(json) |
| `Jobs().Versions` / `VersionsOpts` | 3 | history, inspect, restart |
| `Jobs().Register` / `RegisterOpts` | 2 | run, start |
| `Jobs().EvaluateWithOpts` | 2 | eval, restart |
| `Jobs().Deployments` | 2 | deployments, restart |
| `Jobs().Summary` | 2 | dispatch, status |
| `Jobs().Submission` | 2 | inspect, start |
| `Jobs().DeregisterOpts` | 1 | stop |
| `Jobs().DispatchOpts` | 1 | dispatch |
| `Jobs().PeriodicForce` | 1 | periodic force |
| `Jobs().PlanOpts` | 1 | plan |
| `Jobs().Revert` | 1 | revert |
| `Jobs().ScaleWithRequest` | 1 | scale |
| `Jobs().TagVersion` | 1 | tag apply |
| `Jobs().UntagVersion` | 1 | tag unset |
| `Jobs().VersionByTag` | 1 | revert |
| `Jobs().Validate` | 1 | validate |
| `Jobs().ActionExec` | 1 | action |
| `Jobs().List` / `ListOptions` | 2 | inspect, status |
| `Deployments().PromoteAll` / `PromoteGroups` | 1 | promote |
| `Allocations().PrefixList` | 1 | action |
| `Allocations().Info` | 2 | action, restart |
| `Allocations().Restart` | 1 | restart |
| `Allocations().RestartAllTasks` | 1 | restart |
| `Allocations().Stop` | 1 | restart |
| `Evaluations().Info` | 1 | status |
| `Variables().PrefixList` / `Read` | 1 | init |

## 命令分类

### 写入操作（修改 job 状态）
| 命令 | 主要 API | ACL 能力 |
|------|---------|---------|
| `job run` | `Jobs().RegisterOpts` | submit-job / register-job |
| `job stop` | `Jobs().DeregisterOpts` | submit-job / deregister-job |
| `job start` | `Jobs().Register` | submit-job / register-job |
| `job eval` | `Jobs().EvaluateWithOpts` | submit-job / evaluate-job |
| `job dispatch` | `Jobs().DispatchOpts` | dispatch-job |
| `job revert` | `Jobs().Revert` | submit-job / revert-job |
| `job promote` | `Deployments().PromoteAll/Groups` | submit-job / promote-job |
| `job scale` | `Jobs().ScaleWithRequest` | scale-job / submit-job |
| `job plan` | `Jobs().PlanOpts` | submit-job / plan-job |
| `job periodic force` | `Jobs().PeriodicForce` | submit-job / force-periodic-job |
| `job restart` | `Allocations().Restart/Stop` | alloc-lifecycle |
| `job tag apply` | `Jobs().TagVersion` | submit-job |
| `job tag unset` | `Jobs().UntagVersion` | submit-job |
| `job action` | `Jobs().ActionExec` | alloc-exec / alloc-node-exec |
| `job validate` | `Jobs().Validate` | read-job |

### 只读操作
| 命令 | 主要 API |
|------|---------|
| `job` | 无（帮助） |
| `job allocs` | `Jobs().Allocations` |
| `job deployments` | `Jobs().Deployments` / `LatestDeployment` |
| `job history` | `Jobs().VersionsOpts` |
| `job inspect` | `Jobs().Info` / `Submission` |
| `job periodic` | 无（帮助） |
| `job scaling-events` | `Jobs().ScaleStatus` |
| `job status` | `Jobs().Info` / `Allocations` / `Evaluations` / `LatestDeployment` / `Summary` |
| `job tag` | 无（帮助） |

### 本地操作（不调用 API 或仅可选）
| 命令 | 操作 |
|------|------|
| `job init` | 写本地文件，可选读取 Variables |
| `job validate` | 服务端验证失败时回退到 `validateLocal` |

## 关键设计模式

1. **统一的 `Meta` 基类**：所有命令嵌入 `Meta`，复用 `Client()`、`JobIDByPrefix()`、`FlagSet()`、`Colorize()` 等方法。

2. **JobGetter 复用**：`job run`、`job plan`、`job validate` 嵌入 `JobGetter` 以共享 HCL2/JSON 解析逻辑。

3. **监控模式**：写操作命令（run/stop/eval/dispatch/revert/promote/scale/periodic force/start）默认调用 `newMonitor.monitor(EvalID)` 跟踪 evaluation，可用 `-detach` 禁用。

4. **前缀解析**：通过 `JobIDByPrefix` 支持 job ID 前缀匹配，需要 `list-jobs` ACL 能力。

5. **过滤式前缀解析**：`jobIDByPrefix`（小写）扩展版本，支持 Lua 风格过滤表达式（如 `Periodic is not nil`），用于 dispatch 和 periodic force。

6. **多区域支持**：`job plan` 和 `job status` 显式处理 multiregion job，每 region 独立查询。

7. **并发处理**：`job stop` 和 `job restart` 使用 goroutine 并发处理多个 job/alloc，用 `sync.WaitGroup` 或 `multierror.Group` 协调。

8. **本地回退**：`job validate` 在无法连接 Nomad agent 时回退到本地验证（`agent.ApiJobToStructJob` + `job.Validate`）。
