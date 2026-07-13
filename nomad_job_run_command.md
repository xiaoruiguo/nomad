# Nomad `job run` 命令调用链详细分析

本文档详细分析 `nomad job run` 命令的完整调用链和运行逻辑，包括参数解析、job 文件加载与解析、API 调用、监控流程及错误处理。

## 命令概述

**命令**：`nomad job run [options] <path>`（别名：`nomad run`）

**作用**：根据指定的 jobspec 文件启动新 job 或更新现有 job，是 Nomad CLI 中最核心的命令。

**源文件**：[command/job_run.go](file:///d:/claude/nomad/command/job_run.go)

**命令结构**：
```go
type JobRunCommand struct {
    Meta                          // 通用 CLI 基类（client、UI、flags）
    JobGetter                     // job 文件解析器（HCL2/JSON）
}
```

## 命令注册

命令在 [commands.go](file:///d:/claude/nomad/command/commands.go) 中注册：

```go
"job run": func() (cli.Command, error) {
    return &JobRunCommand{
        Meta: Meta{...},
    }, nil
},
```

## 完整调用链总览

```
用户执行: nomad job run [flags] <path>
│
├── 1. flagSet.Parse(args)                       # 参数解析
├── 2. JobGetter.Validate()                      # 校验参数互斥
├── 3. JobGetter.Get(args[0])                    # 加载并解析 job 文件
│   ├── 3a. 读取文件/stdin/URL
│   ├── 3b. JSON 解析 (if -json)
│   └── 3c. HCL2 解析 (jobspec2.ParseWithConfigEx)
├── 4. Meta.Client()                             # 创建 Nomad API client
├── 5. client.SetRegion/SetNamespace             # 应用 job 中的 region/namespace
├── 6. 检测 job 类型（periodic/parameterized/multiregion）
├── 7. if -output:                               # 仅输出 JSON 不提交
│   └── json.MarshalIndent → Ui.Output → return 0
├── 8. parseCheckIndex(checkIndexStr)            # 解析 -check-index
├── 9. 构造 RegisterOptions
├── 10. client.Jobs().RegisterOpts(job, opts, nil)  # 提交 job
├── 11. 错误处理（含 EnforceIndex 特殊处理）
├── 12. 输出 warnings（若有）
├── 13. if detach || periodic || paramjob || multiregion:
│   ├── 输出 EvalID / next launch time
│   ├── showUIPath（UI 提示）
│   └── return 0
└── 14. newMonitor.monitor(evalID)               # 默认监控 eval
    ├── 查询 Evaluations().Info
    ├── 查询 Evaluations().Allocations
    ├── m.update(state)                          # 增量输出
    ├── if eval 终态 + FailedTGAllocs:
    │   └── 输出失败详情 → 返回 2
    ├── if eval.NextEval != "":
    │   └── 递归 monitor(NextEval)
    └── if state.deployment != "":
        └── DeploymentStatusCommand.monitor      # 监控 deployment
```

## 详细运行逻辑

### 阶段 1：参数解析

**位置**：[job_run.go:191-216](file:///d:/claude/nomad/command/job_run.go#L191-L216)

```go
flagSet := c.Meta.FlagSet(c.Name(), FlagSetClient)
flagSet.BoolVar(&detach, "detach", false, "")
flagSet.BoolVar(&verbose, "verbose", false, "")
flagSet.BoolVar(&output, "output", false, "")
flagSet.BoolVar(&override, "policy-override", false, "")
flagSet.BoolVar(&preserveCounts, "preserve-counts", false, "")
flagSet.BoolVar(&preserveResources, "preserve-resources", false, "")
flagSet.BoolVar(&c.JobGetter.JSON, "json", false, "")
flagSet.BoolVar(&c.JobGetter.Strict, "hcl2-strict", true, "")
flagSet.StringVar(&checkIndexStr, "check-index", "", "")
flagSet.StringVar(&consulNamespace, "consul-namespace", "", "")
flagSet.StringVar(&vaultNamespace, "vault-namespace", "", "")
flagSet.Var(&c.JobGetter.Vars, "var", "")
flagSet.Var(&c.JobGetter.VarFiles, "var-file", "")
flagSet.IntVar(&evalPriority, "eval-priority", 0, "")
flagSet.BoolVar(&openURL, "ui", false, "")
```

**支持的 flag**：

| Flag | 类型 | 默认 | 说明 |
|------|------|------|------|
| `-check-index` | string | "" | 乐观并发控制，配合 `job plan` 使用 |
| `-detach` | bool | false | 立即返回，不进入 monitor 模式 |
| `-eval-priority` | int | 0 | 覆盖 eval 优先级 |
| `-json` | bool | false | 以 JSON 格式解析 job 文件 |
| `-hcl2-strict` | bool | true | HCL2 严格模式（未定义变量报错） |
| `-output` | bool | false | 输出将提交的 JSON 但不实际提交 |
| `-ui` | bool | false | 在浏览器中打开 job 页面 |
| `-policy-override` | bool | false | 强制绕过 Sentinel 软策略 |
| `-preserve-counts` | bool | false | 更新时保留现有 task group counts |
| `-preserve-resources` | bool | false | 更新时保留现有 task resources |
| `-consul-namespace` | string | "" | Consul 命名空间（企业版） |
| `-vault-namespace` | string | "" | Vault 命名空间 |
| `-var 'key=value'` | string[] | [] | HCL2 模板变量（可多次指定） |
| `-var-file=path` | string[] | [] | HCL2 变量文件路径 |
| `-verbose` | bool | false | 显示完整信息（含完整 UUID） |

**校验**：
- 参数数量必须为 1（job 文件路径，`-` 表示 stdin）
- `verbose` 决定 `length`（`shortId=8` 或 `fullId=36`）

### 阶段 2：JobGetter 参数校验

**位置**：[helpers.go:456-466](file:///d:/claude/nomad/command/helpers.go#L456-L466)

```go
func (j *JobGetter) Validate() error {
    if j.HCL1 {
        return fmt.Errorf("HCLv1 is no longer supported")
    }
    if len(j.Vars) > 0 && j.JSON {
        return fmt.Errorf("cannot use variables with JSON files.")
    }
    if len(j.VarFiles) > 0 && j.JSON {
        return fmt.Errorf("cannot use variables with JSON files.")
    }
    return nil
}
```

校验规则：
- HCL1 已废弃（`-hcl1` 不可用）
- JSON 模式不能与 `-var` / `-var-file` 同时使用

### 阶段 3：Job 文件加载与解析

**位置**：[helpers.go:471-569](file:///d:/claude/nomad/command/helpers.go#L471-L569)

`JobGetter.Get(jpath)` 完成两件事：
1. 返回 `*api.JobSubmission`（原始源码 + 格式，用于服务端存储）
2. 返回 `*api.Job`（解析后的 job 结构体）

#### 3.1 文件读取

```go
switch jpath {
case "-":
    jobfile = os.Stdin                          // stdin
default:
    client := &gg.Client{                       // go-getter
        Src: jpath,                             // 支持文件/URL/各种协议
        Pwd: pwd,
        Dst: jobFile.Name(),                    // 临时文件
        DisableSymlinks: true,                  // 安全考虑
    }
    client.Get()
    jobfile = os.Open(jobFile.Name())
}
```

**支持的数据源**（通过 [go-getter](https://github.com/hashicorp/go-getter)）：
- 本地文件：`./myjob.nomad`、`/path/to/job.hcl`
- stdin：`-`
- HTTP/HTTPS：`https://example.com/job.nomad`
- Git：`git::https://github.com/org/repo//job.nomad`
- S3、GCS 等

**安全特性**：`DisableSymlinks: true` 防止通过符号链接读取敏感文件。

#### 3.2 JSON 解析（`-json` flag）

```go
eitherJob := struct {
    NestedJob *api.Job `json:"Job"`
    api.Job
}{}
json.NewDecoder(jobfile).Decode(&eitherJob)

if eitherJob.NestedJob != nil {
    jobStruct = eitherJob.NestedJob            // 兼容 "nomad job inspect" 输出
} else {
    jobStruct = &eitherJob.Job                 // 顶层就是 Job
}

jobSubmission = &api.JobSubmission{
    Source: source.String(),                   // 原始 JSON 源码
    Format: formatJSON,
}
```

**兼容性设计**：支持两种 JSON 格式
- `{"Job": {...}}` — 来自 `nomad job inspect` 或 `nomad run -output`
- `{...}` — 顶层直接是 Job 对象

#### 3.3 HCL2 解析（默认）

```go
parseResult, err := jobspec2.ParseWithConfigEx(&jobspec2.ParseConfig{
    Path:     pathName,                        // 文件名（用于错误信息）
    Body:     source.Bytes(),                  // 文件内容
    ArgVars:  j.Vars,                          // -var 参数
    AllowFS:  true,                            // 允许 HCL 函数访问文件系统
    VarFiles: j.VarFiles,                      // -var-file 路径
    Envs:     os.Environ(),                    // 环境变量
    Strict:   j.Strict,                        // 严格模式
})

jobStruct = parseResult.Job
jobSubmission = parseResult.Submission         // 含源码 + 变量类型信息
```

**`ParseWithConfigEx` 内部流程**（[jobspec2/parse.go:66](file:///d:/claude/nomad/jobspec2/parse.go#L66)）：
1. `args.normalize()` — 标准化配置
2. `newJobConfig(args)` — 创建解析上下文
3. `decode(c)` — HCL 解码到 Job 结构
4. `normalizeJob(c)` — 填充默认值
5. `submissionFromJob(args, c)` — 构建 `JobSubmission`（源码 + 变量）

**`JobSubmission` 包含**：
- `Source` — 原始 HCL 源码
- `Format` — `formatHCL2`
- `Variables` — 变量类型信息（区分简单/复杂类型）

### 阶段 4：创建 API Client

**位置**：[job_run.go:248-253](file:///d:/claude/nomad/command/job_run.go#L248-L253)

```go
client, err := c.Meta.Client()
```

`Meta.Client()` 根据 `NOMAD_ADDR`、`NOMAD_TOKEN`、`NOMAD_CACERT` 等环境变量或 flag 创建 `*api.Client`。

### 阶段 5：应用 Job 的 Region/Namespace

**位置**：[job_run.go:255-262](file:///d:/claude/nomad/command/job_run.go#L255-L262)

```go
if r := job.Region; r != nil {
    client.SetRegion(*r)                        // job spec 中的 region 优先
}
if n := job.Namespace; n != nil {
    client.SetNamespace(*n)
}
```

**优先级**：job spec 中的 `region`/`namespace` > CLI flag > 环境变量 > 默认值

### 阶段 6：检测 Job 类型

**位置**：[job_run.go:265-268](file:///d:/claude/nomad/command/job_run.go#L265-L268)

```go
periodic := job.IsPeriodic()
paramjob := job.IsParameterized()
multiregion := job.IsMultiregion()
```

这三种类型决定了后续是否进入 monitor 模式（它们都不会产生单一 eval 跟踪）。

### 阶段 7：应用 Enterprise 命名空间覆盖

**位置**：[job_run.go:270-276](file:///d:/claude/nomad/command/job_run.go#L270-L276)

```go
if consulNamespace != "" {
    job.ConsulNamespace = pointer.Of(consulNamespace)
}
if vaultNamespace != "" {
    job.VaultNamespace = pointer.Of(vaultNamespace)
}
```

CLI flag 覆盖 job spec 中的 Consul/Vault 命名空间。

### 阶段 8：`-output` 模式（仅输出 JSON）

**位置**：[job_run.go:278-293](file:///d:/claude/nomad/command/job_run.go#L278-L293)

```go
if output {
    req := struct {
        Job *api.Job
    }{Job: job}
    buf, err := json.MarshalIndent(req, "", "    ")
    c.Ui.Output(string(buf))
    return 0
}
```

输出格式与 `nomad job inspect` 一致，可被 `nomad job run -json -` 重新读取。**不提交到 Nomad**，便于调试或管道处理。

### 阶段 9：解析 `-check-index`

**位置**：[job_run.go:295-300](file:///d:/claude/nomad/command/job_run.go#L295-L300) + [job_run.go:376-385](file:///d:/claude/nomad/command/job_run.go#L376-L385)

```go
func parseCheckIndex(input string) (uint64, bool, error) {
    if input == "" {
        return 0, false, nil                    // 未设置
    }
    u, err := strconv.ParseUint(input, 10, 64)
    return u, true, err                         // 设置且解析
}
```

**语义**：
- 空：不强制 index
- `0`：仅在 job 不存在时注册
- 非 0：仅当 job 的 `ModifyIndex` 匹配时更新（乐观锁）

通常配合 `nomad job plan` 使用：plan 返回 `JobModifyIndex`，run 时传入该值确保无中间修改。

### 阶段 10：构造 RegisterOptions

**位置**：[job_run.go:302-315](file:///d:/claude/nomad/command/job_run.go#L302-L315)

```go
opts := &api.RegisterOptions{
    PolicyOverride:    override,                // Sentinel 策略覆盖
    PreserveCounts:    preserveCounts,          // 保留现有 counts
    PreserveResources: preserveResources,       // 保留现有 resources
    EvalPriority:      evalPriority,            // eval 优先级
    Submission:        sub,                     // 原始源码（用于 UI 显示）
}
if enforce {
    opts.EnforceIndex = true
    opts.ModifyIndex = checkIndex
}
```

**`RegisterOptions` 结构**（[api/jobs.go:122-131](file:///d:/claude/nomad/api/jobs.go#L122-L131)）：

| 字段 | 类型 | 作用 |
|------|------|------|
| `EnforceIndex` | bool | 启用乐观锁 |
| `ModifyIndex` | uint64 | 期望的当前 ModifyIndex |
| `PolicyOverride` | bool | 绕过 Sentinel 软策略 |
| `PreserveCounts` | bool | 更新时保留现有 task group counts |
| `PreserveResources` | bool | 更新时保留现有 task resources |
| `EvalPriority` | int | 覆盖 eval 优先级 |
| `Submission` | *JobSubmission | 原始源码（供 UI 回显） |

### 阶段 11：提交 Job

**位置**：[job_run.go:317-332](file:///d:/claude/nomad/command/job_run.go#L317-L332)

```go
resp, _, err := client.Jobs().RegisterOpts(job, opts, nil)
```

#### API 调用细节

**`Jobs().RegisterOpts`**（[api/jobs.go:146-166](file:///d:/claude/nomad/api/jobs.go#L146-L166)）：

```go
func (j *Jobs) RegisterOpts(job *Job, opts *RegisterOptions, q *WriteOptions) (*JobRegisterResponse, *WriteMeta, error) {
    req := &JobRegisterRequest{Job: job}
    if opts != nil {
        if opts.EnforceIndex {
            req.EnforceIndex = true
            req.JobModifyIndex = opts.ModifyIndex
        }
        req.PolicyOverride = opts.PolicyOverride
        req.PreserveCounts = opts.PreserveCounts
        req.PreserveResources = opts.PreserveResources
        req.EvalPriority = opts.EvalPriority
        req.Submission = opts.Submission
    }

    var resp JobRegisterResponse
    wm, err := j.client.put("/v1/jobs", req, &resp, q)   // HTTP PUT
    return &resp, wm, err
}
```

- **HTTP 方法**：`PUT`
- **路径**：`/v1/jobs`
- **请求体**：`JobRegisterRequest`（Job + 选项）
- **响应**：`JobRegisterResponse`

#### 错误处理

```go
if err != nil {
    if strings.Contains(err.Error(), api.RegisterEnforceIndexErrPrefix) {
        // EnforceIndex 失败的特殊处理
        matches := enforceIndexRegex.FindStringSubmatch(err.Error())
        if len(matches) == 2 {
            c.Ui.Error(matches[1])              // 提取友好错误信息
            c.Ui.Error("Job not updated")
            return 1
        }
    }
    c.Ui.Error(fmt.Sprintf("Error submitting job: %s", err))
    return 1
}
```

**EnforceIndex 错误**：服务端返回 `Enforcing job modify index X: job modify index is Y`，正则 `\((Enforcing job modify index.*)\)` 提取括号内信息，避免暴露堆栈细节。

### 阶段 12：输出 Warnings

**位置**：[job_run.go:334-339](file:///d:/claude/nomad/command/job_run.go#L334-L339)

```go
if resp.Warnings != "" {
    c.Ui.Output(c.Colorize().Color(
        fmt.Sprintf("[bold][yellow]Job Warnings:\n%s[reset]\n", resp.Warnings)))
}
```

Warnings 是非致命问题（如废弃字段、建议优化），用黄色加粗显示。

### 阶段 13：非监控模式分支

**位置**：[job_run.go:341-371](file:///d:/claude/nomad/command/job_run.go#L341-L371)

```go
if detach || periodic || paramjob || multiregion {
    c.Ui.Output("Job registration successful")

    if periodic && !paramjob {
        // 计算并显示下次触发时间
        loc, _ := job.Periodic.GetLocation()
        now := time.Now().In(loc)
        next, _ := job.Periodic.Next(now)
        c.Ui.Output(fmt.Sprintf("Approximate next launch time: %s (%s from now)",
            formatTime(next), formatTimeDifference(now, next, time.Second)))
    } else if !paramjob {
        c.Ui.Output("Evaluation ID: " + evalID)
    }

    // UI 提示
    hint, _ := c.Meta.showUIPath(UIHintContext{
        Command: "job run",
        PathParams: map[string]string{
            "jobID":     *job.ID,
            "namespace": jobNamespace,
        },
        OpenURL: openURL,
    })
    if hint != "" {
        c.Ui.Warn(hint)
    }
    return 0
}
```

**进入非监控模式的条件**：
1. `-detach` — 用户明确要求
2. `periodic` — periodic job 由调度器触发，无单一 eval 跟踪
3. `paramjob` — parameterized job 需 `dispatch` 才产生实例
4. `multiregion` — 多区域 job 各 region 独立 eval

**Periodic job 特殊处理**：计算下次触发时间，使用 job spec 中的时区（`timeZone` 字段）。

### 阶段 14：监控模式

**位置**：[job_run.go:373-385](file:///d:/claude/nomad/command/job_run.go#L373-L385)

```go
// UI 提示（监控前）
hint, _ := c.Meta.showUIPath(UIHintContext{...})
if hint != "" {
    c.Ui.Warn(hint)
    c.Ui.Warn("")                               // 空行分隔
}

mon := newMonitor(c.Meta, client, length)
return mon.monitor(evalID)
```

#### `newMonitor` 初始化

**位置**：[monitor.go:82-100](file:///d:/claude/nomad/command/monitor.go#L82-L100)

```go
func newMonitor(meta Meta, client *api.Client, length int) *monitor {
    // 禁用 Info 输出的颜色（保持 monitor 输出清晰）
    if colorUi, ok := meta.Ui.(*cli.ColoredUi); ok {
        meta.Ui = &cli.ColoredUi{
            ErrorColor: colorUi.ErrorColor,
            WarnColor:  colorUi.WarnColor,
            InfoColor:  cli.UiColorNone,
            Ui:         colorUi.Ui,
        }
    }
    mon := &monitor{
        ui: &cli.PrefixedUi{                    // 添加前缀
            InfoPrefix:   "==> ",
            OutputPrefix: "    ",
            ErrorPrefix:  "==> ",
            Ui:           meta.Ui,
        },
        client:   client,
        colorize: meta.Colorize(),
        state:    newEvalState(),
        length:   length,
    }
    return mon
}
```

#### `monitor.monitor` 主循环

**位置**：[monitor.go:159-325](file:///d:/claude/nomad/command/monitor.go#L159-L325)

```go
func (m *monitor) monitor(evalID string) int {
    var schedFailure bool                       // 调度失败标志

    m.update(newEvalState())                    // 初始 pending 状态

    m.ui.Info(fmt.Sprintf("%s: Monitoring evaluation %q",
        formatTime(time.Now()), limit(evalID, m.length)))

    for {
        // 1. 查询 eval
        eval, _, err := m.client.Evaluations().Info(evalID, nil)
        if err != nil {
            m.ui.Error(fmt.Sprintf("No evaluation with id %q found", evalID))
            return 1
        }

        // 2. 构建 eval state
        state := newEvalState()
        state.status = eval.Status
        state.desc = eval.StatusDescription
        state.node = eval.NodeID
        state.job = eval.JobID
        state.deployment = eval.DeploymentID
        state.wait = eval.Wait
        state.index = eval.CreateIndex

        // 3. 查询 eval 关联的 allocations
        allocs, _, err := m.client.Evaluations().Allocations(eval.ID, nil)
        for _, alloc := range allocs {
            state.allocs[alloc.ID] = &allocState{...}
        }

        // 4. 增量输出状态变化
        m.update(state)

        // 5. 检查 eval 终态
        switch eval.Status {
        case api.EvalStatusComplete, api.EvalStatusFailed, api.EvalStatusCancelled:
            if len(eval.FailedTGAllocs) == 0 {
                // 成功完成
                m.ui.Info(fmt.Sprintf("%s: Evaluation %q finished with status %q",
                    formatTime(time.Now()), limit(eval.ID, m.length), eval.Status))
            } else {
                // 调度失败（部分 alloc 无法放置）
                schedFailure = true
                m.ui.Info(fmt.Sprintf("%s: Evaluation %q finished with status %q but failed to place all allocations:",
                    formatTime(time.Now()), limit(eval.ID, m.length), eval.Status))

                // 输出每个失败 task group 的详情
                for tg, metrics := range eval.FailedTGAllocs {
                    m.ui.Output(fmt.Sprintf("%s: Task Group %q (failed to place %d %s):",
                        formatTime(time.Now()), tg, metrics.CoalescedFailures+1, noun))
                    metrics := formatAllocMetrics(metrics, m.colorize, false, "  ")
                    for _, line := range strings.Split(metrics, "\n") {
                        m.ui.Output(line)
                    }
                }

                if eval.BlockedEval != "" {
                    m.ui.Output(fmt.Sprintf("%s: Evaluation %q waiting for additional capacity to place remainder",
                        formatTime(time.Now()), limit(eval.BlockedEval, m.length)))
                }
            }
        default:
            // 未完成，等待 1 秒后重试
            time.Sleep(updateWait)              // updateWait = 1 * time.Second
            continue
        }

        // 6. 跟踪 NextEval（eval 链）
        if eval.NextEval != "" {
            if eval.Wait.Nanoseconds() != 0 {
                m.ui.Info(fmt.Sprintf("%s: Monitoring next evaluation %q in %s",
                    formatTime(time.Now()), limit(eval.NextEval, m.length), eval.Wait))
                time.Sleep(eval.Wait)           // 等待 Wait 时间
            }
            m.state = newEvalState()
            return m.monitor(eval.NextEval)     // 递归监控下一个 eval
        }
        break
    }

    // 7. 监控 deployment（如果存在）
    dID := m.state.deployment
    if dID != "" {
        m.ui.Info(fmt.Sprintf("%s: Monitoring deployment %q",
            formatTime(time.Now()), limit(dID, m.length)))

        var verbose bool
        if m.length == fullId {
            verbose = true
        }

        meta := new(Meta)
        meta.Ui = m.ui
        cmd := &DeploymentStatusCommand{Meta: *meta}
        status, err := cmd.monitor(m.client, dID, 0, m.state.wait, verbose)
        if err != nil || status != api.DeploymentStatusSuccessful {
            return 1
        }
        if status == api.DeploymentStatusSuccessful {
            schedFailure = false                // 部署成功覆盖调度失败
        }
    }

    // 8. 返回退出码
    if schedFailure {
        return 2                                // 调度失败专用退出码
    }
    return 0
}
```

#### `monitor.update` 增量输出

**位置**：[monitor.go:107-157](file:///d:/claude/nomad/command/monitor.go#L107-L157)

`update` 对比新旧 state，**仅输出变化部分**：

| 变化类型 | 输出示例 |
|---------|---------|
| eval 由 node 触发 | `2026-07-13T10:00:00Z: Evaluation triggered by node "abc123"` |
| eval 由 job 触发 | `2026-07-13T10:00:00Z: Evaluation triggered by job "my-job"` |
| eval 在 deployment 中 | `2026-07-13T10:00:00Z: Evaluation within deployment: "dep-123"` |
| 新 alloc 创建 | `2026-07-13T10:00:00Z: Allocation "abc123" created: node "node-1", group "web"` |
| alloc 修改 | `2026-07-13T10:00:00Z: Allocation "abc123" modified: node "node-1", group "web"` |
| alloc 状态变化 | `2026-07-13T10:00:00Z: Allocation "abc123" status changed: "pending" -> "running"` |
| eval 状态变化 | `2026-07-13T10:00:00Z: Evaluation status changed: "pending" -> "complete"` |

#### Deployment 监控

当 eval 完成且产生了 deployment（`state.deployment != ""`），monitor 会委托给 `DeploymentStatusCommand.monitor`：

**位置**：[deployment_status.go:219-244](file:///d:/claude/nomad/command/deployment_status.go#L219-L244)

```
DeploymentStatusCommand.monitor
├── if isStdoutTerminal() (非 Windows + tty):
│   └── ttyMonitor (glint 渲染，含 spinner)
└── else (Windows 或非 tty):
    └── defaultMonitor (uilive 渲染)
```

两种实现都：
1. 轮询 `Deployments().Info`（使用 `WaitIndex` 实现长轮询）
2. verbose 模式额外查询 `Deployments().Allocations`
3. 检测到 `Failed` + `hasAutoRevert` 时递归监控回滚 deployment
4. 终态（Successful/Failed/Cancelled/Blocked）时退出

### 阶段 15：退出码语义

| 退出码 | 含义 | 触发条件 |
|--------|------|---------|
| `0` | 成功 | job 提交且 eval 完成无失败 + deployment 成功（如有） |
| `1` | 通用错误 | 参数错误、client 初始化失败、API 调用失败、eval 查询失败、deployment 失败 |
| `2` | 调度失败 | eval 完成但 `FailedTGAllocs` 非空（资源不足、约束不满足等） |

**特殊行为**：deployment 成功会**覆盖**调度失败标志（`schedFailure = false`），因为 deployment 成功意味着最终所有 alloc 都已就位。

## 关键 API 调用汇总

| API 调用 | 阶段 | HTTP | 路径 |
|---------|------|------|------|
| `Jobs().RegisterOpts` | 11 | PUT | `/v1/jobs` |
| `Evaluations().Info` | 14 | GET | `/v1/evaluation/{id}` |
| `Evaluations().Allocations` | 14 | GET | `/v1/evaluation/{id}/allocations` |
| `Deployments().Info` | 14（deployment 监控） | GET | `/v1/deployment/{id}` |
| `Deployments().Allocations` | 14（verbose） | GET | `/v1/deployment/{id}/allocations` |
| `Jobs().LatestDeployment` | 14（auto-revert 回滚） | GET | `/v1/job/{id}/deployment` |
| `Agent().Self` | 13（UI hint 检查） | GET | `/v1/agent/self` |

## 数据流图

```
[jobfile.nomad]
      │
      ▼
┌─────────────────┐
│  JobGetter.Get  │
│  (go-getter +   │
│   jobspec2)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐         ┌──────────────────┐
│  *api.Job       │◄────────│ RegisterOptions  │
│  *JobSubmission │         │ - EnforceIndex   │
└────────┬────────┘         │ - PolicyOverride │
         │                  │ - Submission     │
         ▼                  └────────┬─────────┘
┌─────────────────┐                   │
│ client.SetRegion│                   │
│ SetNamespace    │                   │
└────────┬────────┘                   │
         │                            │
         ▼                            ▼
┌─────────────────────────────────────────┐
│  Jobs().RegisterOpts(job, opts, nil)    │
│  HTTP PUT /v1/jobs                      │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ JobRegisterResp │
│ - EvalID        │
│ - Warnings      │
└────────┬────────┘
         │
    ┌────┴────┐
    │ detach? │
    ├─yes─────┴─no────────┐
    ▼                     ▼
┌─────────┐    ┌──────────────────┐
│ output  │    │ monitor.monitor  │
│ EvalID  │    │  (轮询 eval)      │
│ + UI    │    │  → allocs 状态    │
│ hint    │    │  → NextEval 链    │
└─────────┘    │  → deployment    │
               └────────┬─────────┘
                        │
                        ▼
                   ┌─────────┐
                   │ exit 0  │ 成功
                   │ exit 1  │ 错误
                   │ exit 2  │ 调度失败
                   └─────────┘
```

## 与相关命令的协作

### 与 `job plan` 的协作（乐观锁）

```
1. nomad job plan myjob.nomad
   → 返回 JobModifyIndex=42

2. nomad job run -check-index 42 myjob.nomad
   → 仅当 job 未被修改时才提交
   → 若被修改，返回 "Enforcing job modify index 42: ..." 错误
```

### 与 `job inspect` 的协作（JSON 往返）

```
1. nomad job run -output myjob.nomad > job.json
   → 生成 JSON 格式的 job 定义

2. nomad job run -json job.json
   → 重新提交（JobGetter 支持嵌套 {"Job": {...}} 格式）
```

### 与 `deployment status` 的协作

`job run` 监控阶段会复用 `DeploymentStatusCommand.monitor` 方法，实现 eval 完成后自动跟踪 deployment 进度，无需用户手动调用 `deployment status -monitor`。

## 错误处理矩阵

| 错误场景 | 处理方式 | 退出码 |
|---------|---------|--------|
| 参数数量错误 | `c.Ui.Error("This command takes one argument")` | 1 |
| JobGetter 校验失败 | `c.Ui.Error("Invalid job options")` | 1 |
| 文件读取失败 | `c.Ui.Error("Error getting job struct")` | 1 |
| Client 初始化失败 | `c.Ui.Error("Error initializing client")` | 1 |
| `-check-index` 解析失败 | `c.Ui.Error("Error parsing check-index value")` | 1 |
| EnforceIndex 不匹配 | 提取友好信息 + `c.Ui.Error("Job not updated")` | 1 |
| 其他 API 错误 | `c.Ui.Error("Error submitting job")` | 1 |
| eval 查询失败 | `m.ui.Error("No evaluation with id found")` | 1 |
| alloc 查询失败 | `m.ui.Error("Error reading allocations")` | 1 |
| eval 完成 + FailedTGAllocs | 输出失败详情 | 2 |
| deployment 失败 | `monitor` 返回非成功状态 | 1 |
| deployment 成功 | 覆盖 schedFailure | 0 |

## 安全考虑

1. **go-getter `DisableSymlinks: true`**：防止通过符号链接读取敏感文件
2. **ACL 能力要求**：`submit-job` 或 `register-job` + `read-job`；CSI volumes 需 `csi-mount-volume`；host volumes 需 `host_volume`
3. **Sentinel 策略**：`-policy-override` 需要管理员权限绕过软策略
4. **Submission 存储**：原始 HCL 源码会存储在服务端，供 UI 回显（可通过 agent 配置禁用）
5. **`-check-index` 乐观锁**：防止并发修改导致的覆盖问题

## 性能特性

1. **monitor 轮询间隔**：`updateWait = 1 * time.Second`，避免 API 过载
2. **eval 链跟踪**：`NextEval` 递归监控，支持多轮调度
3. **WaitIndex 长轮询**（deployment 监控）：减少无效请求
4. **增量输出**：`monitor.update` 仅输出状态变化，避免日志噪声
5. **临时文件清理**：`defer os.Remove(jobFile.Name())` 确保不残留

## 跨平台兼容性

- **文件路径**：使用 `filepath.Base()` 兼容 Windows/Unix 路径分隔符
- **stdin 读取**：`os.Stdin` 跨平台支持
- **deployment 监控渲染**：
  - Windows 或非 tty：`defaultMonitor`（uilive）
  - 非 Windows + tty：`ttyMonitor`（glint，含 spinner）
  - 原因：glint 对 Windows 终端支持不完整（[deployment_status.go:225-232](file:///d:/claude/nomad/command/deployment_status.go#L225-L232)）

## 总结

`nomad job run` 是 Nomad CLI 中功能最丰富的命令之一，其调用链涵盖：

1. **多源文件加载**（本地/stdin/URL/git）
2. **双格式解析**（HCL2 + JSON，含变量注入）
3. **乐观锁控制**（`-check-index`）
4. **企业特性**（Consul/Vault namespace、Sentinel 策略覆盖）
5. **智能监控**（eval 链 + deployment + auto-revert 回滚）
6. **增量输出**（仅显示状态变化）
7. **UI 集成**（hint 提示 + 浏览器跳转）
8. **精确退出码**（0/1/2 三级语义）

其设计体现了 Nomad 对运维体验的重视：从 job 提交到调度完成的全流程可视化，同时保持 API 简洁（单一 `PUT /v1/jobs` 提交 + 轮询查询状态）。
