# Nomad 命令技术实现与执行流程分析

本文档对 Nomad CLI 的全部命令进行枚举与分类，分析每条命令的技术实现、执行流程、代码位置以及调用的底层 API。所有关键代码位置均提供可点击跳转的 `file:///` 链接。

---

## 目录

1. [总体架构](#1-总体架构)
2. [命令注册与分发机制](#2-命令注册与分发机制)
3. [Meta 公共基类与基础设施](#3-meta-公共基类与基础设施)
4. [命令执行流程模板](#4-命令执行流程模板)
5. [命令分类与执行模式](#5-命令分类与执行模式)
6. [Job 命令组执行流程](#6-job-命令组执行流程)
7. [Alloc 命令组执行流程](#7-alloc-命令组执行流程)
8. [Node 命令组执行流程](#8-node-命令组执行流程)
9. [Eval 命令组执行流程](#9-eval-命令组执行流程)
10. [Deployment 命令组执行流程](#10-deployment-命令组执行流程)
11. [ACL 命令组执行流程](#11-acl-命令组执行流程)
12. [Namespace 命令组执行流程](#12-namespace-命令组执行流程)
13. [Volume 命令组执行流程](#13-volume-命令组执行流程)
14. [Plugin 命令组执行流程](#14-plugin-命令组执行流程)
15. [Operator 命令组执行流程](#15-operator-命令组执行流程)
16. [Variable 命令组执行流程](#16-variable-命令组执行流程)
17. [Server 命令组执行流程](#17-server-命令组执行流程)
18. [Service 命令组执行流程](#18-service-命令组执行流程)
19. [System 命令组执行流程](#19-system-命令组执行流程)
20. [TLS 命令组执行流程](#20-tls-命令组执行流程)
21. [其他顶层命令执行流程](#21-其他顶层命令执行流程)
22. [本地命令（无 API 调用）](#22-本地命令无-api-调用)
23. [流式命令实现机制](#23-流式命令实现机制)
24. [OIDC 登录流程](#24-oidc-登录流程)
25. [Agent 进程启动流程](#25-agent-进程启动流程)
26. [Operator API 原生 HTTP 命令](#26-operator-api-原生-http-命令)
27. [输出格式化机制](#27-输出格式化机制)
28. [自动补全机制](#28-自动补全机制)
29. [完整命令枚举表](#29-完整命令枚举表)
30. [典型调用链](#30-典型调用链)
31. [代码文件索引](#31-代码文件索引)
32. [设计要点与最佳实践](#32-设计要点与最佳实践)

---

## 1. 总体架构

Nomad CLI 采用分层架构，从用户输入到最终执行分为五层：

```
┌─────────────────────────────────────────────────────────────┐
│  用户输入: nomad job run myjob.nomad                        │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  第 1 层: 入口层 (main.go)                                  │
│  - main() → Run(args)                                       │
│  - 构造 cli.CLI，注册所有命令                                │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  第 2 层: 命令分发层 (cli.CLI)                              │
│  - 按空格分割命令名（如 "job run"）                          │
│  - 查表 commands.go["job run"] → JobRunCommand              │
│  - 处理 autocomplete、hidden、alias                          │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  第 3 层: 命令实现层 (command/*.go)                         │
│  - XxxCommand.Run(args) 方法                                │
│  - FlagSet 解析参数                                          │
│  - 通过 Meta.Client() 获取 *api.Client                      │
│  - 调用 api.Client.Jobs().Register() 等                     │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  第 4 层: API 客户端层 (api/*.go)                           │
│  - 封装 HTTP 请求构造                                        │
│  - 处理 TLS/Token/Region/Namespace header                   │
│  - JSON 序列化/反序列化                                      │
│  - HTTP POST /v1/jobs                                       │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  第 5 层: 服务端处理层 (command/agent/*_endpoint.go)        │
│  - HTTP 路由匹配                                            │
│  - ACL 校验                                                 │
│  - Raft Apply → FSM 更新状态                                │
│  - 触发 Evaluation → Scheduler → Alloc                      │
└─────────────────────────────────────────────────────────────┘
```

**入口文件**：[`main.go`](file:///d:/claude/nomad/main.go)

```go
func main() {
    os.Exit(Run(os.Args[1:]))
}

func Run(args []string) int {
    metaPtr := new(command.Meta)
    metaPtr.SetupUi(args)
    agentUi := &cli.BasicUi{...}
    commands := command.Commands(metaPtr, agentUi)
    cli := &cli.CLI{
        Name:           "nomad",
        Args:           args,
        Commands:       commands,
        HiddenCommands: hidden,
        Autocomplete:   true,
        ...
    }
    exitCode, err := cli.Run()
    return exitCode
}
```

**关键设计点**：
- `main.go` 仅负责构造 `cli.CLI` 并启动，不包含任何业务逻辑
- 所有命令通过 `command.Commands()` 工厂函数注册
- 支持 autocomplete（通过 `-autocomplete-install` 安装 shell 补全）
- 通过 `hidden` 列表隐藏内部命令（如 `executor`、`logmon`、`template-render`）
- 通过 `aliases` 列表标记顶层别名（如 `fs`、`init`、`inspect`）

---

## 2. 命令注册与分发机制

### 2.1 命令注册总表

**文件**：[`command/commands.go`](file:///d:/claude/nomad/command/commands.go)

`Commands()` 函数返回 `map[string]cli.CommandFactory`，键为命令名（空格分隔多级），值为命令工厂函数。

```go
func Commands(metaPtr *Meta, agentUi cli.Ui) map[string]cli.CommandFactory {
    all := map[string]cli.CommandFactory{
        "job run": func() (cli.Command, error) {
            return &JobRunCommand{Meta: meta}, nil
        },
        "job stop": func() (cli.Command, error) {
            return &JobStopCommand{Meta: meta}, nil
        },
        // ... 约 200+ 条命令
    }

    // 添加已弃用命令（带警告）
    for k, v := range deprecated { all[k] = v }

    // 添加企业版命令
    for k, v := range EntCommands(metaPtr, agentUi) { all[k] = v }

    return all
}
```

### 2.2 命令分发流程

`cli.CLI.Run()` 的分发逻辑：

1. **参数分割**：将 `args` 按空格分割，从最长前缀开始匹配命令名
   - 例如 `nomad job run myjob.nomad` → 尝试匹配 `"job run myjob.nomad"` → `"job run"` → `"job"` → 无匹配
2. **工厂调用**：调用匹配到的 `CommandFactory`，实例化命令对象
3. **执行 Run**：调用 `command.Run(remainingArgs)`，传入未匹配的参数

### 2.3 弃用命令处理

**文件**：[`command/commands.go`](file:///d:/claude/nomad/command/commands.go#L1374)

```go
deprecated := map[string]cli.CommandFactory{
    "client-config": func() (cli.Command, error) {
        return &DeprecatedCommand{
            Old:  "client-config",
            New:  "node config",
            Command: &NodeConfigCommand{Meta: meta},
        }, nil
    },
    "server-force-leave": ...,
    "server-join": ...,
    "server-members": ...,
}
```

`DeprecatedCommand` 包装原命令，在 `Run()` 和 `Help()` 前打印警告：

```go
func (c *DeprecatedCommand) Run(args []string) int {
    c.warn()  // 打印弃用警告
    return c.Command.Run(args)
}
```

### 2.4 顶层别名

通过直接注册相同命令结构体实现：

| 别名 | 实际命令 | 说明 |
|---|---|---|
| `run` | `job run` | 常用命令简写 |
| `stop` | `job stop` | 常用命令简写 |
| `status` | `job status` | 常用命令简写 |
| `init` | `job init` | 生成示例 jobspec |
| `inspect` | `job inspect` | 查看 Job 详情 |
| `plan` | `job plan` | 干跑调度 |
| `validate` | `job validate` | 校验 jobspec |
| `fs` | `alloc fs` | 文件系统浏览 |
| `logs` | `alloc logs` | 日志流 |
| `exec` | `alloc exec` | 执行命令 |
| `debug` | `operator debug` | 诊断 bundle |

---

## 3. Meta 公共基类与基础设施

**文件**：[`command/meta.go`](file:///d:/claude/nomad/command/meta.go)

所有命令结构体嵌入 `Meta`，获得统一的基础设施。

### 3.1 Meta 结构体

```go
type Meta struct {
    Ui cli.Ui  // UI 输出接口

    flagAddress string
    noColor     bool
    forceColor  bool
    region      string
    namespace   string
    token       string
    caCert, caPath, clientCert, clientKey, tlsServerName string
    insecure    bool
    showCLIHints *bool
}
```

### 3.2 核心方法

#### `FlagSet(name, flags)` — 标准化 flag 集

```go
func (m *Meta) FlagSet(n string, fs FlagSetFlags) *flag.FlagSet {
    f := flag.NewFlagSet(n, flag.ContinueOnError)
    if fs&FlagSetClient != 0 {
        f.StringVar(&m.flagAddress, "address", "", "")
        f.StringVar(&m.region, "region", "", "")
        f.StringVar(&m.namespace, "namespace", "", "")
        f.StringVar(&m.token, "token", "", "")
        f.StringVar(&m.caCert, "ca-cert", "", "")
        // ... TLS 相关 flag
    }
    return f
}
```

每个命令通过 `c.Meta.FlagSet(c.Name(), FlagSetClient)` 获得标准 flag 集，再追加命令特有 flag。

#### `Client()` — 构造 API 客户端

```go
func (m *Meta) Client() (*api.Client, error) {
    return api.NewClient(m.clientConfig())
}

func (m *Meta) clientConfig() *api.Config {
    config := api.DefaultConfig()
    if m.flagAddress != "" { config.Address = m.flagAddress }
    if m.region != ""      { config.Region = m.region }
    if m.namespace != ""   { config.Namespace = m.namespace }
    if m.token != ""       { config.SecretID = m.token }
    // TLS 配置覆盖...
    return config
}
```

**配置优先级**：CLI flag > 环境变量（`NOMAD_ADDR`、`NOMAD_REGION`、`NOMAD_NAMESPACE`、`NOMAD_TOKEN`、`NOMAD_CACERT` 等）> 默认值。

#### `JobByPrefix()` — 前缀模糊匹配 Job

```go
func (m *Meta) JobByPrefix(client *api.Client, prefix string) (*api.Job, error) {
    jobID, namespace, err := m.JobIDByPrefix(client, prefix)
    // ...
    job, _, err := client.Jobs().Info(jobID, q)
    return job, nil
}
```

#### `showUIPath()` — UI 路径提示

```go
func (m *Meta) showUIPath(ctx UIHintContext) (string, error) {
    route, exists := CommandUIRoutes[ctx.Command]
    if !exists { return "", nil }
    url, err := m.buildUIPath(route, ctx.PathParams)
    if ctx.OpenURL { util.OpenURL(url) }
    if m.uiHintsDisabled() { return "", nil }
    return m.formatUIHint(url, route.Description), nil
}
```

---

## 4. 命令执行流程模板

绝大多数 Nomad 命令遵循以下模板：

```go
func (c *XxxCommand) Run(args []string) int {
    // 1. 解析 flag
    flagSet := c.Meta.FlagSet(c.Name(), FlagSetClient)
    flagSet.Usage = func() { c.Ui.Output(c.Help()) }
    // 注册命令特有 flag
    flagSet.BoolVar(&c.detach, "detach", false, "")
    if err := flagSet.Parse(args); err != nil {
        return 1
    }

    // 2. 校验参数
    args = flagSet.Args()
    if len(args) != 1 {
        c.Ui.Error("This command takes one argument")
        c.Ui.Error(commandErrorText(c))
        return 1
    }

    // 3. 构造 API 客户端
    client, err := c.Meta.Client()
    if err != nil {
        c.Ui.Error(fmt.Sprintf("Error initializing client: %s", err))
        return 1
    }

    // 4. 调用 API
    result, _, err := client.Jobs().Info(args[0], nil)
    if err != nil {
        c.Ui.Error(fmt.Sprintf("Error querying job: %s", err))
        return 1
    }

    // 5. 格式化输出
    if c.json {
        out, _ := Format(c.json, c.tmpl, result)
        c.Ui.Output(out)
    } else {
        c.Ui.Output(formatJob(result))
    }

    // 6. UI 提示（可选）
    hint, _ := c.Meta.showUIPath(UIHintContext{
        Command: "job status",
        PathParams: map[string]string{"jobID": *result.ID},
    })
    if hint != "" { c.Ui.Warn(hint) }

    return 0
}
```

**退出码约定**：
- `0` — 成功
- `1` — 一般错误（连接失败、参数错误、内部错误）
- `2` — 调度放置问题（仅 `job run`、`job plan`）

---

## 5. 命令分类与执行模式

按执行模式，Nomad 命令可分为 8 类：

| 类别 | 执行模式 | 典型命令 | 特点 |
|---|---|---|---|
| **本地命令** | 无 API 调用 | `fmt`、`job init`、`volume init`、`config validate` | 纯本地处理，不连接 Server |
| **查询命令** | 单次 API 读 | `job status`、`node status`、`alloc status`、`eval list` | 调用 `client.X().Info()/List()` |
| **变更命令** | 单次 API 写 + 可选 monitor | `job run`、`job stop`、`node drain`、`acl policy apply` | 调用 `client.X().Register()/Delete()` 等 |
| **流式命令** | 长连接流 | `alloc logs`、`alloc fs`、`alloc exec`、`monitor`、`agent monitor` | 使用 HTTP streaming/websocket |
| **交互式 monitor** | 提交 + 轮询监控 | `job run`（默认）、`job stop`（默认） | 提交后进入 eval monitor 循环 |
| **OIDC 登录** | 启动本地回调服务器 | `login` | 启动 HTTP 回调服务器，浏览器跳转 |
| **原生 HTTP** | 不走 api.Client | `operator api` | 直接构造 `http.Request` |
| **Agent 进程** | 启动 Server/Client | `agent` | 实现 `/v1/*` 端点，不消费 API |

---

## 6. Job 命令组执行流程

### 6.1 `job run` — 提交 Job 并监控

**文件**：[`command/job_run.go`](file:///d:/claude/nomad/command/job_run.go)

**结构体**：
```go
type JobRunCommand struct {
    Meta
    JobGetter  // 嵌入 JobGetter 获得 jobspec 解析能力
}
```

**执行流程**：

```
nomad job run myjob.nomad
    │
    ▼
1. FlagSet 解析（-detach/-output/-check-index/-policy-override 等）
    │
    ▼
2. JobGetter.Validate()
   - 检查 HCL1/JSON/Vars 兼容性
    │
    ▼
3. JobGetter.Get(args[0])
   - 路径为 "-"：从 stdin 读取
   - 否则：用 go-getter 下载文件（支持 URL/git/s3 等）
   - JSON：json.Decode
   - HCL2：jobspec2.Parse()
   - 返回 (*api.JobSubmission, *api.Job, error)
    │
    ▼
4. Meta.Client() 构造 *api.Client
   - 如果 job.Region 不为空，client.SetRegion()
   - 如果 job.Namespace 不为空，client.SetNamespace()
    │
    ▼
5. 如果 -output：输出 JSON 并退出
    │
    ▼
6. parseCheckIndex(checkIndexStr)
   - 解析 -check-index 值，设置 EnforceIndex/ModifyIndex
    │
    ▼
7. client.Jobs().RegisterOpts(job, opts, nil)
   - 构造 RegisterOptions{PolicyOverride, PreserveCounts, ...}
   - HTTP POST /v1/jobs
   - 返回 {EvalID, Warnings}
    │
    ▼
8. 如果 -detach 或 periodic/parameterized/multiregion：
   - 输出 EvalID，退出
   - 否则：
    │
    ▼
9. newMonitor(c.Meta, client, length).monitor(evalID)
   - 轮询 eval 状态（每 1s）
   - 输出调度决策日志
   - eval 完成后退出
```

**关键代码**：[`job_run.go:162-260`](file:///d:/claude/nomad/command/job_run.go#L162)

```go
// Get Job struct from Jobfile
sub, job, err := c.JobGetter.Get(args[0])
// ...
// Submit the job
opts := &api.RegisterOptions{
    PolicyOverride:    override,
    PreserveCounts:    preserveCounts,
    PreserveResources: preserveResources,
    EvalPriority:      evalPriority,
    Submission:        sub,
}
resp, _, err := client.Jobs().RegisterOpts(job, opts, nil)
// ...
// Detach was not specified, so start monitoring
mon := newMonitor(c.Meta, client, length)
return mon.monitor(evalID)
```

### 6.2 `job stop` — 停止 Job 并监控

**文件**：[`command/job_stop.go`](file:///d:/claude/nomad/command/job_stop.go)

**流程**：
1. FlagSet 解析（`-detach`/`-purge`/`-global`/`-yes`/`-no-shutdown-delay`）
2. 确认提示（除非 `-yes`）
3. `client.Jobs().Deregister(jobID, purge, q)` → HTTP DELETE `/v1/jobs/{id}`
4. 如果非 detach，进入 monitor 模式

### 6.3 `job plan` — 干跑调度

**文件**：[`command/job_plan.go`](file:///d:/claude/nomad/command/job_plan.go)

**流程**：
1. 解析 jobspec（同 `job run`）
2. `client.Jobs().Plan(job, diff, q)` → HTTP POST `/v1/job/{id}/plan`
3. 输出 diff（新增/修改/删除的 allocation）
4. 不实际提交，不产生 eval

### 6.4 `job status` — 查询 Job 状态

**文件**：[`command/job_status.go`](file:///d:/claude/nomad/command/job_status.go)

**流程**：
1. 如果无参数：`client.Jobs().List()` → 列出所有 Job
2. 如果有参数：`client.Jobs().Info(jobID)` → Job 详情
3. 附加查询：
   - `client.Jobs().Allocations()` — alloc 列表
   - `client.Jobs().Evaluations()` — eval 列表
   - `client.Jobs().LatestDeployment()` — 最新 deployment
   - `client.Jobs().Summary()` — task group 摘要
4. 支持 `-json`/`-t` 模板输出

### 6.5 其他 Job 命令

| 命令 | 文件 | API 调用 | 流程要点 |
|---|---|---|---|
| `job inspect` | [`job_inspect.go`](file:///d:/claude/nomad/command/job_inspect.go) | `Jobs().Info()` | 仅输出 JSON |
| `job validate` | [`job_validate.go`](file:///d:/claude/nomad/command/job_validate.go) | `Jobs().Validate()` | 解析 jobspec → POST `/v1/jobs/validate` |
| `job allocs` | [`job_allocs.go`](file:///d:/claude/nomad/command/job_allocs.go) | `Jobs().Allocations()` | 列表输出 |
| `job deployments` | [`job_deployments.go`](file:///d:/claude/nomad/command/job_deployments.go) | `Jobs().Deployments()` | 列表输出 |
| `job history` | [`job_history.go`](file:///d:/claude/nomad/command/job_history.go) | `Jobs().Versions()` | 版本历史 |
| `job eval` | [`job_eval.go`](file:///d:/claude/nomad/command/job_eval.go) | `Jobs().ForceEvaluate()` | 强制新 eval |
| `job promote` | [`job_promote.go`](file:///d:/claude/nomad/command/job_promote.go) | `Jobs().Promote()` | 提升 canary |
| `job revert` | [`job_revert.go`](file:///d:/claude/nomad/command/job_revert.go) | `Jobs().Revert()` | 回滚版本 |
| `job dispatch` | [`job_dispatch.go`](file:///d:/claude/nomad/command/job_dispatch.go) | `Jobs().Dispatch()` | 派发 parameterized job |
| `job scale` | [`job_scale.go`](file:///d:/claude/nomad/command/job_scale.go) | `Jobs().Scale()` | 调整 task group count |
| `job scaling-events` | [`job_scaling_events.go`](file:///d:/claude/nomad/command/job_scaling_events.go) | `Jobs().ScaleStatus()` | 查询 scaling 事件 |
| `job restart` | [`job_restart.go`](file:///d:/claude/nomad/command/job_restart.go) | `Jobs().Restart()` / `Allocations().Restart()` | 批量重启 alloc/task |
| `job start` | [`job_start.go`](file:///d:/claude/nomad/command/job_start.go) | `Jobs().Start()` | 恢复已停止 Job |
| `job periodic force` | [`job_periodic_force.go`](file:///d:/claude/nomad/command/job_periodic_force.go) | `Jobs().PeriodicForce()` | 手动触发 periodic |
| `job action` | [`job_action.go`](file:///d:/claude/nomad/command/job_action.go) | `Jobs().Action()` | 执行自定义 action |
| `job tag apply` | [`job_tag_apply.go`](file:///d:/claude/nomad/command/job_tag_apply.go) | `Jobs().UpdateTags()` | 管理 Job tag |
| `job tag unset` | [`job_tag_unset.go`](file:///d:/claude/nomad/command/job_tag_unset.go) | `Jobs().UpdateTags()` | 移除 Job tag |
| `job init` | [`job_init.go`](file:///d:/claude/nomad/command/job_init.go) | 无（本地） | 写入示例 jobspec |

---

## 7. Alloc 命令组执行流程

### 7.1 `alloc status` — 查看 alloc 详情

**文件**：[`command/alloc_status.go`](file:///d:/claude/nomad/command/alloc_status.go)

**流程**：
1. `client.Search().PrefixSearch(allocID, contexts.Allocs)` — 前缀匹配
2. `client.Allocations().Info(allocID)` — alloc 详情
3. 附加查询：
   - `client.Allocations().Stats()` — 运行时统计
   - `client.Allocations().Checks()` — service check 状态
   - `client.Evaluations().Info()` — 关联 eval
   - `client.CSIVolumes().Info()` — 关联 volume

### 7.2 `alloc exec` — 在 task 内执行命令（流式）

**文件**：[`command/alloc_exec.go`](file:///d:/claude/nomad/command/alloc_exec.go)

**流程**：
```
nomad alloc exec -task web <alloc> /bin/bash
    │
    ▼
1. FlagSet 解析（-task/-job/-group/-i/-t/-e）
    │
    ▼
2. client.Search().PrefixSearch() 匹配 alloc
    │
    ▼
3. client.Allocations().Info(allocID) 获取 alloc 详情
    │
    ▼
4. 验证 task 存在
    │
    ▼
5. 构造 ExecRequest（stdin/stdout/stderr + TTY）
    │
    ▼
6. client.Allocations().Exec(ctx, alloc, task, command, stdin, stdout, stderr, tty, terminal)
   - 建立 websocket 连接到 /v1/client/allocation/{allocID}/exec
   - 协议：JSON header + 二进制流
   - 信号处理（SIGWINCH 调整终端大小）
    │
    ▼
7. 用户退出时关闭连接，返回退出码
```

**平台特定代码**：
- [`alloc_exec_unix.go`](file:///d:/claude/nomad/command/alloc_exec_unix.go) — Unix TTY 处理
- [`alloc_exec_windows.go`](file:///d:/claude/nomad/command/alloc_exec_windows.go) — Windows Console 处理

### 7.3 `alloc logs` — 流式读取 task 日志

**文件**：[`command/alloc_logs.go`](file:///d:/claude/nomad/command/alloc_logs.go)

**流程**：
1. 前缀匹配 alloc
2. 如果 `-job`：`getRandomJobAllocID()` 随机选一个 alloc
3. `client.Allocations().Logs(alloc, task, logType, offset, origin, follow, q)`
   - HTTP GET `/v1/client/fs/logs/{allocID}`（streaming）
   - 参数：`task`、`type`（stdout/stderr）、`offset`、`origin`（start/end）、`follow`
4. 持续读取直到 EOF 或 Ctrl+C

### 7.4 `alloc fs` — 浏览文件系统

**文件**：[`command/alloc_fs.go`](file:///d:/claude/nomad/command/alloc_fs.go)

**流程**：
1. 前缀匹配 alloc
2. 根据操作类型：
   - `-stat`：`client.Allocations().FS().Stat(alloc, path)` → 文件信息
   - 默认：`client.Allocations().FS().List(alloc, path)` → 目录列表
   - `-f`/`-tail`：`client.Allocations().FS().ReadAt(alloc, path, offset)` → 流式读取
3. 输出格式化（`-H` 机器友好）

### 7.5 其他 Alloc 命令

| 命令 | 文件 | API 调用 |
|---|---|---|
| `alloc restart` | [`alloc_restart.go`](file:///d:/claude/nomad/command/alloc_restart.go) | `Allocations().Restart()` |
| `alloc stop` | [`alloc_stop.go`](file:///d:/claude/nomad/command/alloc_stop.go) | `Allocations().Stop()` |
| `alloc signal` | [`alloc_signal.go`](file:///d:/claude/nomad/command/alloc_signal.go) | `Allocations().Signal()` |
| `alloc pause` | [`alloc_pause.go`](file:///d:/claude/nomad/command/alloc_pause.go) | `Allocations().Pause()` |
| `alloc checks` | [`alloc_checks.go`](file:///d:/claude/nomad/command/alloc_checks.go) | `Allocations().Checks()` |

---

## 8. Node 命令组执行流程

### 8.1 `node status` — 节点状态

**文件**：[`command/node_status.go`](file:///d:/claude/nomad/command/node_status.go)

**流程**：
1. 无参数：`client.Nodes().List()` → 列出所有节点
2. 有参数：
   - `client.Nodes().Info(nodeID)` — 节点详情
   - `client.Nodes().Allocations(nodeID)` — 节点上的 alloc
   - `client.Nodes().Stats(nodeID)` — 资源使用
   - `client.Nodes().CSIVolumes(nodeID)` — CSI volume

### 8.2 `node drain` — 启用/关闭 drain

**文件**：[`command/node_drain.go`](file:///d:/claude/nomad/command/node_drain.go)

**流程**：
1. FlagSet 解析（`-enable`/`-disable`/`-deadline`/`-force`/`-no-deadline`/`-ignore-system`/`-keep-ineligible`/`-self`/`-yes`）
2. 确认提示（除非 `-yes`）
3. 构造 `NodeDrainUpdate`{
     `Message`: ...,
     `Deadline`: ...,
     `IgnoreSystem`: ...,
   }
4. `client.Nodes().ToggleDrain(nodeID, drainUpdate, q)`
5. 如果非 `-detach`，进入 monitor 模式观察 alloc 迁移

### 8.3 其他 Node 命令

| 命令 | 文件 | API 调用 |
|---|---|---|
| `node eligibility` | [`node_eligibility.go`](file:///d:/claude/nomad/command/node_eligibility.go) | `Nodes().ToggleEligibility()` |
| `node config` | [`node_config.go`](file:///d:/claude/nomad/command/node_config.go) | `Nodes().Config()` |
| `node meta apply` | [`node_meta_apply.go`](file:///d:/claude/nomad/command/node_meta_apply.go) | `NodeMeta().Apply()` |
| `node meta read` | [`node_meta_read.go`](file:///d:/claude/nomad/command/node_meta_read.go) | `NodeMeta().Read()` |
| `node identity get` | [`node_identity_get.go`](file:///d:/claude/nomad/command/node_identity_get.go) | `NodeIdentity().Get()` |
| `node identity renew` | [`node_identity_renew.go`](file:///d:/claude/nomad/command/node_identity_renew.go) | `NodeIdentity().Renew()` |
| `node intro create` | [`node_intro_create.go`](file:///d:/claude/nomad/command/node_intro_create.go) | `Nodes().IntroCreate()` |
| `node pool apply` | [`node_pool_apply.go`](file:///d:/claude/nomad/command/node_pool_apply.go) | `NodePools().Apply()` |
| `node pool delete` | [`node_pool_delete.go`](file:///d:/claude/nomad/command/node_pool_delete.go) | `NodePools().Delete()` |
| `node pool info` | [`node_pool_info.go`](file:///d:/claude/nomad/command/node_pool_info.go) | `NodePools().Info()` |
| `node pool list` | [`node_pool_list.go`](file:///d:/claude/nomad/command/node_pool_list.go) | `NodePools().List()` |
| `node pool nodes` | [`node_pool_nodes.go`](file:///d:/claude/nomad/command/node_pool_nodes.go) | `NodePools().Nodes()` |
| `node pool jobs` | [`node_pool_jobs.go`](file:///d:/claude/nomad/command/node_pool_jobs.go) | `NodePools().Jobs()` |
| `node pool init` | [`node_pool_init.go`](file:///d:/claude/nomad/command/node_pool_init.go) | 无（本地） |

---

## 9. Eval 命令组执行流程

| 命令 | 文件 | API 调用 | 流程 |
|---|---|---|---|
| `eval list` | [`eval_list.go`](file:///d:/claude/nomad/command/eval_list.go) | `Evaluations().List()` | 列表输出，支持 `-monitor` |
| `eval status` | [`eval_status.go`](file:///d:/claude/nomad/command/eval_status.go) | `Search().PrefixSearch()` / `Evaluations().Info()` / `Evaluations().Allocations()` | 查看详情 + 放置结果 |
| `eval delete` | [`eval_delete.go`](file:///d:/claude/nomad/command/eval_delete.go) | `Evaluations().Delete()` | 按 ID/前缀/状态删除 |

**`eval status` 流程**：
1. 前缀匹配 eval ID
2. `client.Evaluations().Info(evalID)` — eval 详情
3. `client.Evaluations().Allocations(evalID)` — 关联 alloc
4. 输出 eval 状态、触发原因、放置结果

---

## 10. Deployment 命令组执行流程

| 命令 | 文件 | API 调用 |
|---|---|---|
| `deployment list` | [`deployment_list.go`](file:///d:/claude/nomad/command/deployment_list.go) | `Deployments().List()` |
| `deployment status` | [`deployment_status.go`](file:///d:/claude/nomad/command/deployment_status.go) | `Deployments().Info()` / `Deployments().Allocations()` |
| `deployment pause` | [`deployment_pause.go`](file:///d:/claude/nomad/command/deployment_pause.go) | `Deployments().Pause(true)` |
| `deployment resume` | [`deployment_resume.go`](file:///d:/claude/nomad/command/deployment_resume.go) | `Deployments().Pause(false)` |
| `deployment promote` | [`deployment_promote.go`](file:///d:/claude/nomad/command/deployment_promote.go) | `Deployments().Promote()` |
| `deployment fail` | [`deployment_fail.go`](file:///d:/claude/nomad/command/deployment_fail.go) | `Deployments().Fail()` |
| `deployment unblock` | [`deployment_unblock.go`](file:///d:/claude/nomad/command/deployment_unblock.go) | `Deployments().Unblock()` |

---

## 11. ACL 命令组执行流程

### 11.1 `acl bootstrap` — 初始化 ACL 系统

**文件**：[`command/acl_bootstrap.go`](file:///d:/claude/nomad/command/acl_bootstrap.go)

**流程**：
1. 如果提供 `<path>` 参数：从文件/stdin 读取 token
2. `client.ACLTokens().BootstrapOpts(boottoken, nil)`
   - HTTP POST `/v1/acl/bootstrap`
3. 输出管理 token（Accessor ID + Secret ID）
4. 支持 `-json`/`-t` 格式化

**关键代码**：[`acl_bootstrap.go:97-104`](file:///d:/claude/nomad/command/acl_bootstrap.go#L97)

```go
// Get the bootstrap token
token, _, err := client.ACLTokens().BootstrapOpts(boottoken, nil)
if err != nil {
    c.Ui.Error(fmt.Sprintf("Error bootstrapping: %s", err))
    return 1
}
```

### 11.2 ACL Token 命令

| 命令 | 文件 | API 调用 |
|---|---|---|
| `acl token create` | [`acl_token_create.go`](file:///d:/claude/nomad/command/acl_token_create.go) | `ACLTokens().Create()` |
| `acl token update` | [`acl_token_update.go`](file:///d:/claude/nomad/command/acl_token_update.go) | `ACLTokens().Update()` |
| `acl token delete` | [`acl_token_delete.go`](file:///d:/claude/nomad/command/acl_token_delete.go) | `ACLTokens().Delete()` |
| `acl token info` | [`acl_token_info.go`](file:///d:/claude/nomad/command/acl_token_info.go) | `ACLTokens().Info()` |
| `acl token list` | [`acl_token_list.go`](file:///d:/claude/nomad/command/acl_token_list.go) | `ACLTokens().List()` |
| `acl token self` | [`acl_token_self.go`](file:///d:/claude/nomad/command/acl_token_self.go) | `ACLTokens().Self()` |

### 11.3 ACL Policy 命令

| 命令 | 文件 | API 调用 |
|---|---|---|
| `acl policy apply` | [`acl_policy_apply.go`](file:///d:/claude/nomad/command/acl_policy_apply.go) | `ACLPolicies().Upsert()` |
| `acl policy delete` | [`acl_policy_delete.go`](file:///d:/claude/nomad/command/acl_policy_delete.go) | `ACLPolicies().Delete()` |
| `acl policy info` | [`acl_policy_info.go`](file:///d:/claude/nomad/command/acl_policy_info.go) | `ACLPolicies().Info()` |
| `acl policy list` | [`acl_policy_list.go`](file:///d:/claude/nomad/command/acl_policy_list.go) | `ACLPolicies().List()` |
| `acl policy self` | [`acl_policy_self.go`](file:///d:/claude/nomad/command/acl_policy_self.go) | `ACLPolicies().Self()` |

### 11.4 ACL Role / AuthMethod / BindingRule

| 命令组 | 文件前缀 | API 资源 |
|---|---|---|
| `acl role *` | `acl_role_*.go` | `ACLRoles().Create()/Delete()/Info()/List()/Update()` |
| `acl auth-method *` | `acl_auth_method_*.go` | `ACLAuthMethods().Create()/Delete()/Info()/List()/Update()` |
| `acl binding-rule *` | `acl_binding_rule_*.go` | `ACLRoles().CreateBindingRule()` 等 |

---

## 12. Namespace 命令组执行流程

| 命令 | 文件 | API 调用 |
|---|---|---|
| `namespace list` | [`namespace_list.go`](file:///d:/claude/nomad/command/namespace_list.go) | `Namespaces().List()` |
| `namespace inspect` / `namespace status` | [`namespace_inspect.go`](file:///d:/claude/nomad/command/namespace_inspect.go) | `Namespaces().Info()` |
| `namespace apply` | [`namespace_apply.go`](file:///d:/claude/nomad/command/namespace_apply.go) | `Namespaces().Upsert()` |
| `namespace delete` | [`namespace_delete.go`](file:///d:/claude/nomad/command/namespace_delete.go) | `Namespaces().Delete()` |

---

## 13. Volume 命令组执行流程

### 13.1 CSI Volume 命令

| 命令 | 文件 | API 调用 |
|---|---|---|
| `volume status` | [`volume_status_csi.go`](file:///d:/claude/nomad/command/volume_status_csi.go) | `CSIVolumes().List()` / `CSIVolumes().Info()` |
| `volume register` | [`volume_register_csi.go`](file:///d:/claude/nomad/command/volume_register_csi.go) | `CSIVolumes().RegisterOpts()` |
| `volume create` | [`volume_create_csi.go`](file:///d:/claude/nomad/command/volume_create_csi.go) | `CSIVolumes().Create()` |
| `volume deregister` | [`volume_deregister.go`](file:///d:/claude/nomad/command/volume_deregister.go) | `CSIVolumes().Deregister()` |
| `volume delete` | `volume_delete.go` | `CSIVolumes().Delete()` |
| `volume detach` | [`volume_detach.go`](file:///d:/claude/nomad/command/volume_detach.go) | `CSIVolumes().Detach()` |
| `volume snapshot create` | `volume_snapshot_create.go` | `CSIVolumes().CreateSnapshot()` |
| `volume snapshot delete` | `volume_snapshot_delete.go` | `CSIVolumes().DeleteSnapshot()` |
| `volume snapshot list` | `volume_snapshot_list.go` | `CSIVolumes().ListSnapshots()` |

### 13.2 Host Volume 命令

| 命令 | 文件 | API 调用 |
|---|---|---|
| `volume status` (host) | [`volume_status_host.go`](file:///d:/claude/nomad/command/volume_status_host.go) | `HostVolumes().List()` |
| `volume register` (host) | [`volume_register_host.go`](file:///d:/claude/nomad/command/volume_register_host.go) | `HostVolumes().Register()` |
| `volume create` (host) | [`volume_create_host.go`](file:///d:/claude/nomad/command/volume_create_host.go) | `HostVolumes().Create()` |
| `volume claim list` | `volume_claim_list.go` | `HostVolumeClaims().List()` |
| `volume claim delete` | `volume_claim_delete.go` | `HostVolumeClaims().Delete()` |
| `volume init` | [`volume_init.go`](file:///d:/claude/nomad/command/volume_init.go) | 无（本地） |

---

## 14. Plugin 命令组执行流程

| 命令 | 文件 | API 调用 |
|---|---|---|
| `plugin status` | [`plugin_status_csi.go`](file:///d:/claude/nomad/command/plugin_status_csi.go) | `CSIPlugins().List()` / `CSIPlugins().Info()` |

---

## 15. Operator 命令组执行流程

### 15.1 `operator raft list-peers` — Raft 节点列表

**文件**：[`command/operator_raft_list.go`](file:///d:/claude/nomad/command/operator_raft_list.go)

**流程**：
```go
func (c *OperatorRaftListCommand) Run(args []string) int {
    flags := c.Meta.FlagSet("raft", FlagSetClient)
    flags.BoolVar(&stale, "stale", false, "")
    flags.Parse(args)

    client, _ := c.Meta.Client()
    operator := client.Operator()

    q := &api.QueryOptions{AllowStale: stale}
    reply, err := operator.RaftGetConfiguration(q)  // GET /v1/operator/raft/configuration

    // 格式化表格输出
    result := []string{"Node|ID|Address|State|Voter|RaftProtocol"}
    for _, s := range reply.Servers {
        state := "follower"
        if s.Leader { state = "leader" }
        result = append(result, fmt.Sprintf("%s|%s|%s|%s|%v|%s", ...))
    }
    c.Ui.Output(columnize.SimpleFormat(result))
    return 0
}
```

### 15.2 其他 Operator 命令

| 命令 | 文件 | API 调用 | 说明 |
|---|---|---|---|
| `operator api` | [`operator_api.go`](file:///d:/claude/nomad/command/operator_api.go) | 原生 HTTP | curl 风格，详见 [第 26 节](#26-operator-api-原生-http-命令) |
| `operator autopilot get-config` | [`operator_autopilot_get.go`](file:///d:/claude/nomad/command/operator_autopilot_get.go) | `Operator().AutopilotGetConfiguration()` | |
| `operator autopilot set-config` | `operator_autopilot_set.go` | `Operator().AutopilotSetConfiguration()` | |
| `operator autopilot health` | `operator_autopilot_health.go` | `Operator().AutopilotState()` | |
| `operator raft remove-peer` | `operator_raft_remove.go` | `Operator().RaftRemovePeerByAddress()` / `RaftRemovePeerByID()` | |
| `operator raft transfer-leadership` | `operator_raft_transfer_leadership.go` | `Operator().LeadershipTransfer()` | |
| `operator raft info` | `operator_raft_info.go` | `Operator().RaftInfo()` | |
| `operator raft logs` | `operator_raft_logs.go` | `Operator().RaftLogs()` | |
| `operator raft state` | `operator_raft_state.go` | `Operator().RaftState()` | |
| `operator raft migrate-backend` | `operator_raft_migrate.go` | `Operator().RaftMigrateBackend()` | |
| `operator scheduler get-config` | `operator_scheduler_get.go` | `Operator().SchedulerGetConfiguration()` | |
| `operator scheduler set-config` | `operator_scheduler_set.go` | `Operator().SchedulerSetConfiguration()` | |
| `operator metrics` | `operator_metrics.go` | `Operator().Metrics()` | |
| `operator debug` | `operator_debug.go` | 多 API 综合 | 采集诊断 bundle |
| `operator snapshot save` | [`operator_snapshot_save.go`](file:///d:/claude/nomad/command/operator_snapshot_save.go) | `Operator().Snapshot()` | 流式下载 snapshot |
| `operator snapshot inspect` | `operator_snapshot_inspect.go` | `Operator().Snapshot()` | 本地分析 |
| `operator snapshot restore` | `operator_snapshot_restore.go` | 原生 HTTP | 上传 snapshot |
| `operator snapshot state` | `operator_snapshot_state.go` | `Operator().Snapshot()` | 本地状态查看 |
| `operator snapshot redact` | `operator_snapshot_redact.go` | `Operator().Snapshot()` + `raftutil.RedactSnapshot()` | 去除密钥 |
| `operator root keyring list` | `operator_root_keyring.go` | `Operator().KeyringRPCList()` | |
| `operator root keyring remove` | `operator_root_keyring.go` | `Operator().KeyringRPCRemove()` | |
| `operator root keyring rotate` | `operator_root_keyring.go` | `Operator().KeyringRPCRotate()` | |
| `operator gossip keyring *` | `operator_gossip_keyring_*.go` | `Operator().GossipKeyringRPC*` | Serf 密钥管理 |
| `operator client-state` | `operator_client_state.go` | `Operator().ClientState*` | |
| `operator utilization` | `operator_utilization.go` | `Operator().Utilization()` | |

---

## 16. Variable 命令组执行流程

| 命令 | 文件 | API 调用 | 说明 |
|---|---|---|---|
| `var get` | [`var_get.go`](file:///d:/claude/nomad/command/var_get.go) | `Variables().Read()` | 读取变量 |
| `var list` | `var_list.go` | `Variables().List()` | 列出变量 |
| `var put` | `var_put.go` | `Variables().Put()` | 写入变量（支持 CAS） |
| `var purge` / `var delete` | `var_delete.go` | `Variables().Delete()` | 删除变量 |
| `var lock` | `var_lock.go` | `Variables().Lock()` | 加锁读 |
| `var init` | `var_init.go` | 无（本地） | 生成示例 |

---

## 17. Server 命令组执行流程

| 命令 | 文件 | API 调用 |
|---|---|---|
| `server members` | [`server_members.go`](file:///d:/claude/nomad/command/server_members.go) | `Agent().Members()` |
| `server join` | [`server_join.go`](file:///d:/claude/nomad/command/server_join.go) | `Agent().Join()` |
| `server force-leave` | [`server_force_leave.go`](file:///d:/claude/nomad/command/server_force_leave.go) | `Agent().ForceLeave()` |

---

## 18. Service 命令组执行流程

| 命令 | 文件 | API 调用 |
|---|---|---|
| `service list` | [`service_list.go`](file:///d:/claude/nomad/command/service_list.go) | `Services().List()` |
| `service info` | [`service_info.go`](file:///d:/claude/nomad/command/service_info.go) | `Services().Info()` |
| `service delete` | [`service_delete.go`](file:///d:/claude/nomad/command/service_delete.go) | `Services().Delete()` |

---

## 19. System 命令组执行流程

| 命令 | 文件 | API 调用 | 说明 |
|---|---|---|---|
| `system gc` | `system_gc.go` | `System().GarbageCollect()` | 触发 GC |
| `system reconcile summaries` | `system_reconcile_summaries.go` | `System().ReconcileSummaries()` | 重建 Job 摘要 |

---

## 20. TLS 命令组执行流程

| 命令 | 文件 | API 调用 | 说明 |
|---|---|---|---|
| `tls ca create` | `tls_ca_create.go` | 无（本地） | 创建 CA 证书 |
| `tls ca info` | `tls_ca_info.go` | 无（本地） | 查看 CA 信息 |
| `tls cert create` | `tls_cert_create.go` | 无（本地） | 签发证书 |
| `tls cert info` | `tls_cert_info.go` | 无（本地） | 查看证书信息 |

---

## 21. 其他顶层命令执行流程

| 命令 | 文件 | API 调用 | 说明 |
|---|---|---|---|
| `agent` | [`agent/command.go`](file:///d:/claude/nomad/command/agent/command.go) | 自身实现端点 | 详见 [第 25 节](#25-agent-进程启动流程) |
| `agent-info` | [`agent_info.go`](file:///d:/claude/nomad/command/agent_info.go) | `Agent().Self()` | 查看 agent 信息 |
| `agent monitor` | [`agent_monitor.go`](file:///d:/claude/nomad/command/agent_monitor.go) | `Agent().Monitor()` | 流式日志 |
| `agent monitor export` | [`agent_monitor_export.go`](file:///d:/claude/nomad/command/agent_monitor_export.go) | `Agent().MonitorExport()` | 导出日志 |
| `monitor` | [`monitor.go`](file:///d:/claude/nomad/command/monitor.go) | `Agent().Monitor()` | 流式 eval 日志 |
| `metrics` | [`metrics.go`](file:///d:/claude/nomad/command/metrics.go) | `Agent().Metrics()` | 输出 metrics |
| `login` | [`login.go`](file:///d:/claude/nomad/command/login.go) | OIDC 流程 | 详见 [第 24 节](#24-oidc-登录流程) |
| `check` | [`check.go`](file:///d:/claude/nomad/command/check.go) | `Agent().Checks()` | service check |
| `license get` | [`license_get.go`](file:///d:/claude/nomad/command/license_get.go) | `Operator().LicenseGet()` | 企业 license |
| `action` | [`action.go`](file:///d:/claude/nomad/command/action.go) | `Jobs().Action()` | 远程 action |
| `ui` | `ui.go` | 无 | 打开浏览器 |
| `version` | `version.go` | 无 | 版本信息 |
| `setup consul` | `setup_consul.go` | 配置 Consul | 引导设置 |
| `setup vault` | `setup_vault.go` | 配置 Vault | 引导设置 |

---

## 22. 本地命令（无 API 调用）

以下命令纯本地执行，不连接 Nomad Server：

| 命令 | 文件 | 功能 |
|---|---|---|
| `fmt` | [`fmt.go`](file:///d:/claude/nomad/command/fmt.go) | 格式化 HCL jobspec |
| `job init` | [`job_init.go`](file:///d:/claude/nomad/command/job_init.go) | 生成示例 jobspec |
| `node pool init` | [`node_pool_init.go`](file:///d:/claude/nomad/command/node_pool_init.go) | 生成 NodePool 示例 |
| `volume init` | [`volume_init.go`](file:///d:/claude/nomad/command/volume_init.go) | 生成 volume 示例 |
| `var init` | `var_init.go` | 生成 var 示例 |
| `quota init` | `quota_init.go` | 生成 quota 示例 |
| `config validate` | [`config_validate.go`](file:///d:/claude/nomad/command/config_validate.go) | 校验 agent 配置 |
| `tls ca create` | `tls_ca_create.go` | 创建 CA |
| `tls ca info` | `tls_ca_info.go` | 查看 CA |
| `tls cert create` | `tls_cert_create.go` | 签发证书 |
| `tls cert info` | `tls_cert_info.go` | 查看证书 |
| `version` | `version.go` | 版本信息 |
| `ui` | `ui.go` | 打开浏览器 |

---

## 23. 流式命令实现机制

### 23.1 `alloc logs` — HTTP Streaming

**文件**：[`command/alloc_logs.go`](file:///d:/claude/nomad/command/alloc_logs.go)

```
client.Allocations().Logs(alloc, task, logType, offset, origin, follow, q)
    │
    ▼
HTTP GET /v1/client/fs/logs/{allocID}?task=web&type=stdout&follow=true
    │
    ▼
Server (command/agent/fs_endpoint.go) 持续写入日志数据
    │
    ▼
Client io.Copy(os.Stdout, rc) 持续读取
    │
    ▼
Ctrl+C → signal.Notify → 关闭 ReadCloser
```

### 23.2 `alloc exec` — WebSocket

**文件**：[`command/alloc_exec.go`](file:///d:/claude/nomad/command/alloc_exec.go)

```
client.Allocations().Exec(ctx, alloc, task, command, stdin, stdout, stderr, tty, terminal)
    │
    ▼
建立 WebSocket 连接: /v1/client/allocation/{allocID}/exec
    │
    ▼
协议：
  - 首帧：JSON header（command、tty、task）
  - 后续帧：二进制 stdin/stdout/stderr/stderr 交替
  - resize 帧：终端窗口大小变化
    │
    ▼
双向数据流：
  - 用户输入 → stdin 帧 → Server → task
  - task stdout → stdout 帧 → Client → 终端
    │
    ▼
退出时：发送 exit 信号，关闭连接
```

### 23.3 `monitor` — Eval 监控

**文件**：[`command/monitor.go`](file:///d:/claude/nomad/command/monitor.go)

**流程**：
```go
type monitor struct {
    ui     cli.Ui
    client *api.Client
    state  *evalState  // 当前 eval 状态
}

func (m *monitor) monitor(evalID string) int {
    for {
        // 1. 轮询 eval 状态
        eval, _, err := m.client.Evaluations().Info(evalID, q)
        
        // 2. 如果状态变化，输出
        if eval.Status != m.state.status {
            m.ui.Output(formatEvalUpdate(eval))
        }
        
        // 3. 轮询 alloc 状态
        allocs, _, err := m.client.Evaluations().Allocations(evalID, q)
        for _, alloc := range allocs {
            if allocStatusChanged(alloc) {
                m.ui.Output(formatAllocUpdate(alloc))
            }
        }
        
        // 4. eval 完成则退出
        if eval.Status == "complete" || eval.Status == "failed" {
            return getExitCode(eval)
        }
        
        time.Sleep(updateWait)  // 1s
    }
}
```

### 23.4 `agent monitor` — Agent 日志流

**文件**：[`command/agent_monitor.go`](file:///d:/claude/nomad/command/agent_monitor.go)

```
client.Agent().Monitor(logLevel, nodeID, serverID, logJSON, logIncludeLocation, q)
    │
    ▼
HTTP GET /v1/agent/monitor?log_level=DEBUG&node_id=xxx
    │
    ▼
Server 持续推送日志行
    │
    ▼
Client 逐行读取并输出
    │
    ▼
Ctrl+C → 关闭流
```

---

## 24. OIDC 登录流程

**文件**：[`command/login.go`](file:///d:/claude/nomad/command/login.go)

```
nomad login -method oidc
    │
    ▼
1. client.ACLAuthMethods().List()
   - 获取可用的 auth method 列表
    │
    ▼
2. client.ACLAuth().GetAuthURL(authMethodName, redirectURI)
   - 获取 OIDC provider 的授权 URL
   - redirectURI = http://localhost:4649/oidc/callback
    │
    ▼
3. 启动本地 HTTP 服务器监听 :4649
   - 等待 OIDC provider 回调
    │
    ▼
4. util.OpenURL(authURL)
   - 打开浏览器跳转到 OIDC provider
    │
    ▼
5. 用户在浏览器中登录并授权
    │
    ▼
6. OIDC provider 回调 http://localhost:4649/oidc/callback?code=xxx&state=xxx
    │
    ▼
7. client.ACLAuth().CompleteAuth(authURL)
   - 用 code 换取 OIDC token
    │
    ▼
8. client.ACLAuth().Login(authMethodName, oidcToken)
   - 用 OIDC token 换取 Nomad ACL token
    │
    ▼
9. 输出 Nomad ACL token（Accessor ID + Secret ID）
```

**关键依赖**：[`lib/auth/oidc`](file:///d:/claude/nomad/lib/auth/oidc)

---

## 25. Agent 进程启动流程

**文件**：[`command/agent/command.go`](file:///d:/claude/nomad/command/agent/command.go)

`nomad agent` 是唯一不消费 API 的命令，它本身就是 API 服务端。

```
nomad agent -config server.hcl
    │
    ▼
1. agent.Command.Run(args)
   - 解析 -config/-dev/-server/-client/-bind 等参数
   - 加载配置文件（HCL/JSON）
   - 合并 CLI flag > 配置文件 > 默认值
    │
    ▼
2. 初始化日志系统
   - hclog.Logger
   - gated writer（启动期间缓冲日志）
   - syslog（可选）
    │
    ▼
3. 创建 Agent 对象
   - NewAgent(config, logger)
   - setupConsuls() — Consul 配置
   - setupServer() / setupClient() — 根据配置启动
    │
    ▼
4. 启动 HTTP+gRPC 服务
   - http.go 注册路由
   - 监听 :4646 (HTTP) / :4647 (RPC) / :4648 (Serf)
    │
    ▼
5. 信号处理
   - signal.Notify(SIGINT, SIGTERM)
   - 优雅关闭流程
    │
    ▼
6. checkpoint 版本检查
```

**详细启动流程**参见 [`nomad_bootstrap.md`](file:///d:/claude/nomad/nomad_bootstrap.md) 和 [`nomad_server.md`](file:///d:/claude/nomad/nomad_server.md)。

---

## 26. Operator API 原生 HTTP 命令

**文件**：[`command/operator_api.go`](file:///d:/claude/nomad/command/operator_api.go)

`operator api` 是唯一不走 `api.Client` 封装的命令，直接构造 `http.Request`。

```
nomad operator api -X POST /v1/jobs -d @job.json
    │
    ▼
1. FlagSet 解析（-X/-H/-filter/-dryrun/-verbose）
    │
    ▼
2. 检测 stdin：如果有输入，默认 POST
    │
    ▼
3. Meta.clientConfig() 获取配置
   - 但不调用 Client()，直接用 config
    │
    ▼
4. pathToURL(config, args[0])
   - /v1/xxx → http://NOMAD_ADDR/v1/xxx
   - localhost:4646/v1/xxx → http://localhost:4646/v1/xxx
   - https://... → 原样使用
    │
    ▼
5. 构造 http.Request
   - Method: -X 指定或自动推断
   - Header: X-Nomad-Token（来自 NOMAD_TOKEN）
   - Body: stdin 内容
    │
    ▼
6. 如果 -dryrun：输出等效 curl 命令并退出
    │
    ▼
7. http.DefaultClient.Do(req)
   - 使用 api.Client 的 transport（含 TLS 配置）
    │
    ▼
8. 输出响应体到 stdout
```

**特点**：
- 支持 unix socket（`NOMAD_ADDR=unix://...`）
- 支持 `-filter` 查询参数（服务端过滤）
- `-verbose` 输出请求详情到 stderr

---

## 27. 输出格式化机制

**文件**：[`command/data_format.go`](file:///d:/claude/nomad/command/data_format.go)、[`command/helpers.go`](file:///d:/claude/nomad/command/helpers.go)

### 27.1 Format() 统一格式化入口

```go
func Format(json bool, tmpl string, data interface{}) (string, error) {
    if json {
        return (&JSONFormat{}).TransformData(data)
    }
    if len(tmpl) > 0 {
        return (&TemplateFormat{tmpl}).TransformData(data)
    }
    return "", fmt.Errorf("no format specified")
}
```

### 27.2 格式化辅助函数

| 函数 | 用途 |
|---|---|
| `formatKV(in []string)` | Key=Value 表格输出 |
| `formatList(in []string)` | 列表表格输出 |
| `formatTime(t time.Time)` | 时间格式化 |
| `formatTimeDifference(start, end, interval)` | 时间差 |
| `limit(s string, length int)` | 截断字符串 |
| `wrapAtLength(s string)` | 自动换行 |

### 27.3 UI 着色

通过 `Meta.Colorize()` 获取 `*colorstring.Colorize`，支持 `[bold]`、`[red]`、`[reset]` 等标签。

```go
c.Ui.Output(c.Colorize().Color("[bold][yellow]Warning:[reset] ..."))
```

---

## 28. 自动补全机制

每个命令实现 `AutocompleteFlags()` 和 `AutocompleteArgs()` 方法：

```go
func (c *JobRunCommand) AutocompleteFlags() complete.Flags {
    return mergeAutocompleteFlags(c.Meta.AutocompleteFlags(FlagSetClient),
        complete.Flags{
            "-detach":   complete.PredictNothing,
            "-json":     complete.PredictNothing,
            "-var":      complete.PredictAnything,
            "-var-file": complete.PredictFiles("*.var"),
        })
}

func (c *JobRunCommand) AutocompleteArgs() complete.Predictor {
    return complete.PredictOr(
        complete.PredictFiles("*.nomad"),
        complete.PredictFiles("*.hcl"),
        complete.PredictFiles("*.json"),
    )
}
```

**安装补全**：
```bash
nomad -autocomplete-install
```

---

## 29. 完整命令枚举表

以下列出 `commands.go` 中注册的全部命令（约 200 条）。

### 29.1 ACL 命令（27 条）

| 命令 | 结构体 | 文件 |
|---|---|---|
| `acl` | `ACLCommand` | [`acl.go`](file:///d:/claude/nomad/command/acl.go) |
| `acl auth-method` | `ACLAuthMethodCommand` | [`acl_auth_method.go`](file:///d:/claude/nomad/command/acl_auth_method.go) |
| `acl auth-method create` | `ACLAuthMethodCreateCommand` | [`acl_auth_method_create.go`](file:///d:/claude/nomad/command/acl_auth_method_create.go) |
| `acl auth-method delete` | `ACLAuthMethodDeleteCommand` | [`acl_auth_method_delete.go`](file:///d:/claude/nomad/command/acl_auth_method_delete.go) |
| `acl auth-method info` | `ACLAuthMethodInfoCommand` | [`acl_auth_method_info.go`](file:///d:/claude/nomad/command/acl_auth_method_info.go) |
| `acl auth-method list` | `ACLAuthMethodListCommand` | [`acl_auth_method_list.go`](file:///d:/claude/nomad/command/acl_auth_method_list.go) |
| `acl auth-method update` | `ACLAuthMethodUpdateCommand` | [`acl_auth_method_update.go`](file:///d:/claude/nomad/command/acl_auth_method_update.go) |
| `acl binding-rule` | `ACLBindingRuleCommand` | [`acl_binding_rule.go`](file:///d:/claude/nomad/command/acl_binding_rule.go) |
| `acl binding-rule create` | `ACLBindingRuleCreateCommand` | [`acl_binding_rule_create.go`](file:///d:/claude/nomad/command/acl_binding_rule_create.go) |
| `acl binding-rule delete` | `ACLBindingRuleDeleteCommand` | [`acl_binding_rule_delete.go`](file:///d:/claude/nomad/command/acl_binding_rule_delete.go) |
| `acl binding-rule info` | `ACLBindingRuleInfoCommand` | [`acl_binding_rule_info.go`](file:///d:/claude/nomad/command/acl_binding_rule_info.go) |
| `acl binding-rule list` | `ACLBindingRuleListCommand` | [`acl_binding_rule_list.go`](file:///d:/claude/nomad/command/acl_binding_rule_list.go) |
| `acl binding-rule update` | `ACLBindingRuleUpdateCommand` | [`acl_binding_rule_update.go`](file:///d:/claude/nomad/command/acl_binding_rule_update.go) |
| `acl bootstrap` | `ACLBootstrapCommand` | [`acl_bootstrap.go`](file:///d:/claude/nomad/command/acl_bootstrap.go) |
| `acl policy` | `ACLPolicyCommand` | [`acl_policy.go`](file:///d:/claude/nomad/command/acl_policy.go) |
| `acl policy apply` | `ACLPolicyApplyCommand` | [`acl_policy_apply.go`](file:///d:/claude/nomad/command/acl_policy_apply.go) |
| `acl policy delete` | `ACLPolicyDeleteCommand` | [`acl_policy_delete.go`](file:///d:/claude/nomad/command/acl_policy_delete.go) |
| `acl policy info` | `ACLPolicyInfoCommand` | [`acl_policy_info.go`](file:///d:/claude/nomad/command/acl_policy_info.go) |
| `acl policy list` | `ACLPolicyListCommand` | [`acl_policy_list.go`](file:///d:/claude/nomad/command/acl_policy_list.go) |
| `acl policy self` | `ACLPolicySelfCommand` | [`acl_policy_self.go`](file:///d:/claude/nomad/command/acl_policy_self.go) |
| `acl role` | `ACLRoleCommand` | [`acl_role.go`](file:///d:/claude/nomad/command/acl_role.go) |
| `acl role create` | `ACLRoleCreateCommand` | [`acl_role_create.go`](file:///d:/claude/nomad/command/acl_role_create.go) |
| `acl role delete` | `ACLRoleDeleteCommand` | [`acl_role_delete.go`](file:///d:/claude/nomad/command/acl_role_delete.go) |
| `acl role info` | `ACLRoleInfoCommand` | [`acl_role_info.go`](file:///d:/claude/nomad/command/acl_role_info.go) |
| `acl role list` | `ACLRoleListCommand` | [`acl_role_list.go`](file:///d:/claude/nomad/command/acl_role_list.go) |
| `acl role update` | `ACLRoleUpdateCommand` | [`acl_role_update.go`](file:///d:/claude/nomad/command/acl_role_update.go) |
| `acl token` | `ACLTokenCommand` | [`acl_token.go`](file:///d:/claude/nomad/command/acl_token.go) |
| `acl token create` | `ACLTokenCreateCommand` | [`acl_token_create.go`](file:///d:/claude/nomad/command/acl_token_create.go) |
| `acl token update` | `ACLTokenUpdateCommand` | [`acl_token_update.go`](file:///d:/claude/nomad/command/acl_token_update.go) |
| `acl token delete` | `ACLTokenDeleteCommand` | [`acl_token_delete.go`](file:///d:/claude/nomad/command/acl_token_delete.go) |
| `acl token info` | `ACLTokenInfoCommand` | [`acl_token_info.go`](file:///d:/claude/nomad/command/acl_token_info.go) |
| `acl token list` | `ACLTokenListCommand` | [`acl_token_list.go`](file:///d:/claude/nomad/command/acl_token_list.go) |
| `acl token self` | `ACLTokenSelfCommand` | [`acl_token_self.go`](file:///d:/claude/nomad/command/acl_token_self.go) |

### 29.2 Alloc 命令（10 条）

| 命令 | 结构体 | 文件 |
|---|---|---|
| `alloc` | `AllocCommand` | [`alloc.go`](file:///d:/claude/nomad/command/alloc.go) |
| `alloc exec` | `AllocExecCommand` | [`alloc_exec.go`](file:///d:/claude/nomad/command/alloc_exec.go) |
| `alloc signal` | `AllocSignalCommand` | [`alloc_signal.go`](file:///d:/claude/nomad/command/alloc_signal.go) |
| `alloc pause` | `AllocPauseCommand` | [`alloc_pause.go`](file:///d:/claude/nomad/command/alloc_pause.go) |
| `alloc stop` | `AllocStopCommand` | [`alloc_stop.go`](file:///d:/claude/nomad/command/alloc_stop.go) |
| `alloc fs` | `AllocFSCommand` | [`alloc_fs.go`](file:///d:/claude/nomad/command/alloc_fs.go) |
| `alloc logs` | `AllocLogsCommand` | [`alloc_logs.go`](file:///d:/claude/nomad/command/alloc_logs.go) |
| `alloc restart` | `AllocRestartCommand` | [`alloc_restart.go`](file:///d:/claude/nomad/command/alloc_restart.go) |
| `alloc checks` | `AllocChecksCommand` | [`alloc_checks.go`](file:///d:/claude/nomad/command/alloc_checks.go) |
| `alloc status` | `AllocStatusCommand` | [`alloc_status.go`](file:///d:/claude/nomad/command/alloc_status.go) |

### 29.3 Agent 命令（4 条）

| 命令 | 结构体 | 文件 |
|---|---|---|
| `agent` | `agent.Command` | [`agent/command.go`](file:///d:/claude/nomad/command/agent/command.go) |
| `agent-info` | `AgentInfoCommand` | [`agent_info.go`](file:///d:/claude/nomad/command/agent_info.go) |
| `agent monitor` | `AgentMonitorCommand` | [`agent_monitor.go`](file:///d:/claude/nomad/command/agent_monitor.go) |
| `agent monitor export` | `MonitorExportCommand` | [`agent_monitor_export.go`](file:///d:/claude/nomad/command/agent_monitor_export.go) |

### 29.4 Deployment 命令（8 条）

| 命令 | 结构体 | 文件 |
|---|---|---|
| `deployment` | `DeploymentCommand` | [`deployment.go`](file:///d:/claude/nomad/command/deployment.go) |
| `deployment fail` | `DeploymentFailCommand` | [`deployment_fail.go`](file:///d:/claude/nomad/command/deployment_fail.go) |
| `deployment list` | `DeploymentListCommand` | [`deployment_list.go`](file:///d:/claude/nomad/command/deployment_list.go) |
| `deployment pause` | `DeploymentPauseCommand` | [`deployment_pause.go`](file:///d:/claude/nomad/command/deployment_pause.go) |
| `deployment promote` | `DeploymentPromoteCommand` | [`deployment_promote.go`](file:///d:/claude/nomad/command/deployment_promote.go) |
| `deployment resume` | `DeploymentResumeCommand` | [`deployment_resume.go`](file:///d:/claude/nomad/command/deployment_resume.go) |
| `deployment status` | `DeploymentStatusCommand` | [`deployment_status.go`](file:///d:/claude/nomad/command/deployment_status.go) |
| `deployment unblock` | `DeploymentUnblockCommand` | [`deployment_unblock.go`](file:///d:/claude/nomad/command/deployment_unblock.go) |

### 29.5 Eval 命令（4 条）

| 命令 | 结构体 | 文件 |
|---|---|---|
| `eval` | `EvalCommand` | [`eval.go`](file:///d:/claude/nomad/command/eval.go) |
| `eval delete` | `EvalDeleteCommand` | [`eval_delete.go`](file:///d:/claude/nomad/command/eval_delete.go) |
| `eval list` | `EvalListCommand` | [`eval_list.go`](file:///d:/claude/nomad/command/eval_list.go) |
| `eval status` | `EvalStatusCommand` | [`eval_status.go`](file:///d:/claude/nomad/command/eval_status.go) |

### 29.6 Job 命令（23 条）

| 命令 | 结构体 | 文件 |
|---|---|---|
| `job` | `JobCommand` | [`job.go`](file:///d:/claude/nomad/command/job.go) |
| `job action` | `JobActionCommand` | [`job_action.go`](file:///d:/claude/nomad/command/job_action.go) |
| `job allocs` | `JobAllocsCommand` | [`job_allocs.go`](file:///d:/claude/nomad/command/job_allocs.go) |
| `job restart` | `JobRestartCommand` | [`job_restart.go`](file:///d:/claude/nomad/command/job_restart.go) |
| `job deployments` | `JobDeploymentsCommand` | [`job_deployments.go`](file:///d:/claude/nomad/command/job_deployments.go) |
| `job dispatch` | `JobDispatchCommand` | [`job_dispatch.go`](file:///d:/claude/nomad/command/job_dispatch.go) |
| `job eval` | `JobEvalCommand` | [`job_eval.go`](file:///d:/claude/nomad/command/job_eval.go) |
| `job history` | `JobHistoryCommand` | [`job_history.go`](file:///d:/claude/nomad/command/job_history.go) |
| `job init` | `JobInitCommand` | [`job_init.go`](file:///d:/claude/nomad/command/job_init.go) |
| `job inspect` | `JobInspectCommand` | [`job_inspect.go`](file:///d:/claude/nomad/command/job_inspect.go) |
| `job periodic` | `JobPeriodicCommand` | [`job_periodic.go`](file:///d:/claude/nomad/command/job_periodic.go) |
| `job periodic force` | `JobPeriodicForceCommand` | [`job_periodic_force.go`](file:///d:/claude/nomad/command/job_periodic_force.go) |
| `job plan` | `JobPlanCommand` | [`job_plan.go`](file:///d:/claude/nomad/command/job_plan.go) |
| `job promote` | `JobPromoteCommand` | [`job_promote.go`](file:///d:/claude/nomad/command/job_promote.go) |
| `job revert` | `JobRevertCommand` | [`job_revert.go`](file:///d:/claude/nomad/command/job_revert.go) |
| `job run` | `JobRunCommand` | [`job_run.go`](file:///d:/claude/nomad/command/job_run.go) |
| `job scale` | `JobScaleCommand` | [`job_scale.go`](file:///d:/claude/nomad/command/job_scale.go) |
| `job scaling-events` | `JobScalingEventsCommand` | [`job_scaling_events.go`](file:///d:/claude/nomad/command/job_scaling_events.go) |
| `job status` | `JobStatusCommand` | [`job_status.go`](file:///d:/claude/nomad/command/job_status.go) |
| `job stop` | `JobStopCommand` | [`job_stop.go`](file:///d:/claude/nomad/command/job_stop.go) |
| `job start` | `JobStartCommand` | [`job_start.go`](file:///d:/claude/nomad/command/job_start.go) |
| `job tag` | `JobTagCommand` | [`job_tag.go`](file:///d:/claude/nomad/command/job_tag.go) |
| `job tag apply` | `JobTagApplyCommand` | [`job_tag_apply.go`](file:///d:/claude/nomad/command/job_tag_apply.go) |
| `job tag unset` | `JobTagUnsetCommand` | [`job_tag_unset.go`](file:///d:/claude/nomad/command/job_tag_unset.go) |
| `job validate` | `JobValidateCommand` | [`job_validate.go`](file:///d:/claude/nomad/command/job_validate.go) |

### 29.7 Namespace 命令（6 条）

| 命令 | 结构体 | 文件 |
|---|---|---|
| `namespace` | `NamespaceCommand` | [`namespace.go`](file:///d:/claude/nomad/command/namespace.go) |
| `namespace apply` | `NamespaceApplyCommand` | [`namespace_apply.go`](file:///d:/claude/nomad/command/namespace_apply.go) |
| `namespace delete` | `NamespaceDeleteCommand` | [`namespace_delete.go`](file:///d:/claude/nomad/command/namespace_delete.go) |
| `namespace inspect` | `NamespaceInspectCommand` | [`namespace_inspect.go`](file:///d:/claude/nomad/command/namespace_inspect.go) |
| `namespace list` | `NamespaceListCommand` | [`namespace_list.go`](file:///d:/claude/nomad/command/namespace_list.go) |
| `namespace status` | `NamespaceStatusCommand` | [`namespace_status.go`](file:///d:/claude/nomad/command/namespace_status.go) |

### 29.8 Node 命令（22 条）

| 命令 | 结构体 | 文件 |
|---|---|---|
| `node` | `NodeCommand` | [`node.go`](file:///d:/claude/nomad/command/node.go) |
| `node config` | `NodeConfigCommand` | [`node_config.go`](file:///d:/claude/nomad/command/node_config.go) |
| `node drain` | `NodeDrainCommand` | [`node_drain.go`](file:///d:/claude/nomad/command/node_drain.go) |
| `node eligibility` | `NodeEligibilityCommand` | [`node_eligibility.go`](file:///d:/claude/nomad/command/node_eligibility.go) |
| `node identity` | `NodeIdentityCommand` | [`node_identity.go`](file:///d:/claude/nomad/command/node_identity.go) |
| `node identity get` | `NodeIdentityGetCommand` | [`node_identity_get.go`](file:///d:/claude/nomad/command/node_identity_get.go) |
| `node identity renew` | `NodeIdentityRenewCommand` | [`node_identity_renew.go`](file:///d:/claude/nomad/command/node_identity_renew.go) |
| `node intro` | `NodeIntroCommand` | [`node_intro.go`](file:///d:/claude/nomad/command/node_intro.go) |
| `node intro create` | `NodeIntroCreateCommand` | [`node_intro_create.go`](file:///d:/claude/nomad/command/node_intro_create.go) |
| `node meta` | `NodeMetaCommand` | [`node_meta.go`](file:///d:/claude/nomad/command/node_meta.go) |
| `node meta apply` | `NodeMetaApplyCommand` | [`node_meta_apply.go`](file:///d:/claude/nomad/command/node_meta_apply.go) |
| `node meta read` | `NodeMetaReadCommand` | [`node_meta_read.go`](file:///d:/claude/nomad/command/node_meta_read.go) |
| `node status` | `NodeStatusCommand` | [`node_status.go`](file:///d:/claude/nomad/command/node_status.go) |
| `node pool` | `NodePoolCommand` | [`node_pool.go`](file:///d:/claude/nomad/command/node_pool.go) |
| `node pool apply` | `NodePoolApplyCommand` | [`node_pool_apply.go`](file:///d:/claude/nomad/command/node_pool_apply.go) |
| `node pool delete` | `NodePoolDeleteCommand` | [`node_pool_delete.go`](file:///d:/claude/nomad/command/node_pool_delete.go) |
| `node pool info` | `NodePoolInfoCommand` | [`node_pool_info.go`](file:///d:/claude/nomad/command/node_pool_info.go) |
| `node pool init` | `NodePoolInitCommand` | [`node_pool_init.go`](file:///d:/claude/nomad/command/node_pool_init.go) |
| `node pool jobs` | `NodePoolJobsCommand` | [`node_pool_jobs.go`](file:///d:/claude/nomad/command/node_pool_jobs.go) |
| `node pool list` | `NodePoolListCommand` | [`node_pool_list.go`](file:///d:/claude/nomad/command/node_pool_list.go) |
| `node pool nodes` | `NodePoolNodesCommand` | [`node_pool_nodes.go`](file:///d:/claude/nomad/command/node_pool_nodes.go) |

### 29.9 Operator 命令（35 条）

| 命令 | 结构体 | 文件 |
|---|---|---|
| `operator` | `OperatorCommand` | [`operator.go`](file:///d:/claude/nomad/command/operator.go) |
| `operator api` | `OperatorAPICommand` | [`operator_api.go`](file:///d:/claude/nomad/command/operator_api.go) |
| `operator autopilot` | `OperatorAutopilotCommand` | [`operator_autopilot.go`](file:///d:/claude/nomad/command/operator_autopilot.go) |
| `operator autopilot get-config` | `OperatorAutopilotGetCommand` | [`operator_autopilot_get.go`](file:///d:/claude/nomad/command/operator_autopilot_get.go) |
| `operator autopilot set-config` | `OperatorAutopilotSetCommand` | `operator_autopilot_set.go` |
| `operator autopilot health` | `OperatorAutopilotHealthCommand` | `operator_autopilot_health.go` |
| `operator client-state` | `OperatorClientStateCommand` | `operator_client_state.go` |
| `operator debug` | `OperatorDebugCommand` | `operator_debug.go` |
| `operator gossip` | `OperatorGossipCommand` | `operator_gossip.go` |
| `operator gossip keyring` | `OperatorGossipKeyringCommand` | `operator_gossip_keyring.go` |
| `operator gossip keyring install` | `OperatorGossipKeyringInstallCommand` | `operator_gossip_keyring_install.go` |
| `operator gossip keyring use` | `OperatorGossipKeyringUseCommand` | `operator_gossip_keyring_use.go` |
| `operator gossip keyring list` | `OperatorGossipKeyringListCommand` | `operator_gossip_keyring_list.go` |
| `operator gossip keyring remove` | `OperatorGossipKeyringRemoveCommand` | `operator_gossip_keyring_remove.go` |
| `operator gossip keyring generate` | `OperatorGossipKeyringGenerateCommand` | `operator_gossip_keyring_generate.go` |
| `operator metrics` | `OperatorMetricsCommand` | `operator_metrics.go` |
| `operator raft` | `OperatorRaftCommand` | `operator_raft.go` |
| `operator raft list-peers` | `OperatorRaftListCommand` | `operator_raft_list.go` |
| `operator raft remove-peer` | `OperatorRaftRemoveCommand` | `operator_raft_remove.go` |
| `operator raft transfer-leadership` | `OperatorRaftTransferLeadershipCommand` | `operator_raft_transfer_leadership.go` |
| `operator raft info` | `OperatorRaftInfoCommand` | `operator_raft_info.go` |
| `operator raft logs` | `OperatorRaftLogsCommand` | `operator_raft_logs.go` |
| `operator raft state` | `OperatorRaftStateCommand` | `operator_raft_state.go` |
| `operator raft migrate-backend` | `OperatorRaftMigrateCommand` | `operator_raft_migrate.go` |
| `operator scheduler` | `OperatorSchedulerCommand` | `operator_scheduler.go` |
| `operator scheduler get-config` | `OperatorSchedulerGetConfig` | `operator_scheduler_get.go` |
| `operator scheduler set-config` | `OperatorSchedulerSetConfig` | `operator_scheduler_set.go` |
| `operator root` | `OperatorRootCommand` | `operator_root.go` |
| `operator root keyring` | `OperatorRootKeyringCommand` | `operator_root_keyring.go` |
| `operator root keyring list` | `OperatorRootKeyringListCommand` | `operator_root_keyring.go` |
| `operator root keyring remove` | `OperatorRootKeyringRemoveCommand` | `operator_root_keyring.go` |
| `operator root keyring rotate` | `OperatorRootKeyringRotateCommand` | `operator_root_keyring.go` |
| `operator snapshot` | `OperatorSnapshotCommand` | `operator_snapshot.go` |
| `operator snapshot save` | `OperatorSnapshotSaveCommand` | [`operator_snapshot_save.go`](file:///d:/claude/nomad/command/operator_snapshot_save.go) |
| `operator snapshot inspect` | `OperatorSnapshotInspectCommand` | `operator_snapshot_inspect.go` |
| `operator snapshot state` | `OperatorSnapshotStateCommand` | `operator_snapshot_state.go` |
| `operator snapshot restore` | `OperatorSnapshotRestoreCommand` | `operator_snapshot_restore.go` |
| `operator snapshot redact` | `OperatorSnapshotRedactCommand` | `operator_snapshot_redact.go` |
| `operator utilization` | `OperatorUtilizationCommand` | `operator_utilization.go` |

### 29.10 其他命令

| 命令 | 结构体 | 文件 |
|---|---|---|
| `action` | `ActionCommand` | [`action.go`](file:///d:/claude/nomad/command/action.go) |
| `check` | `AgentCheckCommand` | [`check.go`](file:///d:/claude/nomad/command/check.go) |
| `config` | `ConfigCommand` | [`config.go`](file:///d:/claude/nomad/command/config.go) |
| `config validate` | `ConfigValidateCommand` | [`config_validate.go`](file:///d:/claude/nomad/command/config_validate.go) |
| `debug` | `OperatorDebugCommand` | `operator_debug.go`（别名） |
| `exec` | `AllocExecCommand` | `alloc_exec.go`（别名） |
| `fmt` | `FormatCommand` | [`fmt.go`](file:///d:/claude/nomad/command/fmt.go) |
| `fs` | `AllocFSCommand` | `alloc_fs.go`（别名） |
| `init` | `JobInitCommand` | `job_init.go`（别名） |
| `inspect` | `JobInspectCommand` | `job_inspect.go`（别名） |
| `license` | `LicenseCommand` | [`license.go`](file:///d:/claude/nomad/command/license.go) |
| `license get` | `LicenseGetCommand` | [`license_get.go`](file:///d:/claude/nomad/command/license_get.go) |
| `login` | `LoginCommand` | [`login.go`](file:///d:/claude/nomad/command/login.go) |
| `logs` | `AllocLogsCommand` | `alloc_logs.go`（别名） |
| `monitor` | `MonitorCommand` | [`monitor.go`](file:///d:/claude/nomad/command/monitor.go) |
| `monitor export` | `MonitorExportCommand` | `monitor_export.go` |
| `plan` | `JobPlanCommand` | `job_plan.go`（别名） |
| `plugin` | `PluginCommand` | `plugin.go` |
| `plugin status` | `PluginStatusCommand` | `plugin_status_csi.go` |
| `quota` | `QuotaCommand` | `quota.go` |
| `quota apply` | `QuotaApplyCommand` | `quota_apply.go` |
| `quota delete` | `QuotaDeleteCommand` | `quota_delete.go` |
| `quota init` | `QuotaInitCommand` | `quota_init.go` |
| `quota inspect` | `QuotaInspectCommand` | `quota_inspect.go` |
| `quota list` | `QuotaListCommand` | `quota_list.go` |
| `quota status` | `QuotaStatusCommand` | `quota_status.go` |
| `recommendation` | `RecommendationCommand` | `recommendation.go` |
| `recommendation apply` | `RecommendationApplyCommand` | `recommendation_apply.go` |
| `recommendation dismiss` | `RecommendationDismissCommand` | `recommendation_dismiss.go` |
| `recommendation info` | `RecommendationInfoCommand` | `recommendation_info.go` |
| `recommendation list` | `RecommendationListCommand` | `recommendation_list.go` |
| `run` | `JobRunCommand` | `job_run.go`（别名） |
| `scaling` | `ScalingCommand` | `scaling.go` |
| `scaling policy` | `ScalingPolicyCommand` | `scaling_policy.go` |
| `scaling policy info` | `ScalingPolicyInfoCommand` | `scaling_policy_info.go` |
| `scaling policy list` | `ScalingPolicyListCommand` | `scaling_policy_list.go` |
| `sentinel` | `SentinelCommand` | `sentinel.go` |
| `sentinel list` | `SentinelListCommand` | `sentinel_list.go` |
| `sentinel apply` | `SentinelApplyCommand` | `sentinel_apply.go` |
| `sentinel delete` | `SentinelDeleteCommand` | `sentinel_delete.go` |
| `sentinel read` | `SentinelReadCommand` | `sentinel_read.go` |
| `server` | `ServerCommand` | `server.go` |
| `server force-leave` | `ServerForceLeaveCommand` | [`server_force_leave.go`](file:///d:/claude/nomad/command/server_force_leave.go) |
| `server join` | `ServerJoinCommand` | [`server_join.go`](file:///d:/claude/nomad/command/server_join.go) |
| `server members` | `ServerMembersCommand` | [`server_members.go`](file:///d:/claude/nomad/command/server_members.go) |
| `service` | `ServiceCommand` | `service.go` |
| `service list` | `ServiceListCommand` | `service_list.go` |
| `service info` | `ServiceInfoCommand` | `service_info.go` |
| `service delete` | `ServiceDeleteCommand` | `service_delete.go` |
| `setup` | `SetupCommand` | `setup.go` |
| `setup consul` | `SetupConsulCommand` | `setup_consul.go` |
| `setup vault` | `SetupVaultCommand` | `setup_vault.go` |
| `start` | `JobStartCommand` | `job_start.go`（别名） |
| `status` | `JobStatusCommand` | `job_status.go`（别名） |
| `stop` | `JobStopCommand` | `job_stop.go`（别名） |
| `system` | `SystemCommand` | `system.go` |
| `system gc` | `SystemGCCommand` | `system_gc.go` |
| `system reconcile` | `SystemReconcileCommand` | `system_reconcile.go` |
| `system reconcile summaries` | `SystemReconcileSummariesCommand` | `system_reconcile_summaries.go` |
| `tls` | `TLSCommand` | `tls.go` |
| `tls ca` | `TLSCACommand` | `tls_ca.go` |
| `tls ca create` | `TLSCACreateCommand` | `tls_ca_create.go` |
| `tls ca info` | `TLSCAInfoCommand` | `tls_ca_info.go` |
| `tls cert` | `TLSCertCommand` | `tls_cert.go` |
| `tls cert create` | `TLSCertCreateCommand` | `tls_cert_create.go` |
| `tls cert info` | `TLSCertInfoCommand` | `tls_cert_info.go` |
| `ui` | `UICommand` | `ui.go` |
| `validate` | `JobValidateCommand` | `job_validate.go`（别名） |
| `var` | `VarCommand` | `var.go` |
| `var purge` | `VarPurgeCommand` | `var_purge.go` |
| `var init` | `VarInitCommand` | `var_init.go` |
| `var list` | `VarListCommand` | `var_list.go` |
| `var put` | `VarPutCommand` | `var_put.go` |
| `var lock` | `VarLockCommand` | `var_lock.go` |
| `var get` | `VarGetCommand` | `var_get.go` |
| `version` | `VersionCommand` | `version.go` |
| `volume` | `VolumeCommand` | `volume.go` |
| `volume init` | `VolumeInitCommand` | [`volume_init.go`](file:///d:/claude/nomad/command/volume_init.go) |
| `volume status` | `VolumeStatusCommand` | `volume_status.go` |
| `volume register` | `VolumeRegisterCommand` | `volume_register.go` |
| `volume deregister` | `VolumeDeregisterCommand` | `volume_deregister.go` |
| `volume detach` | `VolumeDetachCommand` | `volume_detach.go` |
| `volume create` | `VolumeCreateCommand` | `volume_create.go` |
| `volume delete` | `VolumeDeleteCommand` | `volume_delete.go` |
| `volume snapshot` | `VolumeSnapshotCommand` | `volume_snapshot.go` |
| `volume snapshot create` | `VolumeSnapshotCreateCommand` | `volume_snapshot_create.go` |
| `volume snapshot delete` | `VolumeSnapshotDeleteCommand` | `volume_snapshot_delete.go` |
| `volume snapshot list` | `VolumeSnapshotListCommand` | `volume_snapshot_list.go` |
| `volume claim` | `VolumeClaimCommand` | `volume_claim.go` |
| `volume claim list` | `VolumeClaimListCommand` | `volume_claim_list.go` |
| `volume claim delete` | `VolumeClaimDeleteCommand` | `volume_claim_delete.go` |

### 29.11 弃用命令别名（4 条）

| 命令 | 替代命令 | 说明 |
|---|---|---|
| `client-config` | `node config` | 节点配置 |
| `server-force-leave` | `server force-leave` | 强制下线 |
| `server-join` | `server join` | 加入集群 |
| `server-members` | `server members` | 成员列表 |

---

## 30. 典型调用链

### 30.1 `nomad job run` 完整调用链

```
main.go: main()
  └─ Run(args)
     └─ command.Commands() → map["job run"] = JobRunCommand
     └─ cli.CLI.Run()
        └─ JobRunCommand.Run(args)
           ├─ c.Meta.FlagSet("job run", FlagSetClient)
           ├─ c.JobGetter.Validate()
           ├─ c.JobGetter.Get("myjob.nomad")
           │   ├─ go-getter.Client.Get()  // 下载文件
           │   ├─ jobspec2.Parse()         // HCL2 解析
           │   └─ return (*api.JobSubmission, *api.Job)
           ├─ c.Meta.Client()
           │   └─ api.NewClient(config)
           │      └─ http.Client{Transport: tlsConfig}
           ├─ client.Jobs().RegisterOpts(job, opts, nil)
           │   └─ api/jobs.go: RegisterOpts()
           │      └─ HTTP POST /v1/jobs
           │         ├─ PUT /v1/jobs
           │         ├─ Header: X-Nomad-Token
           │         └─ Body: JSON{Job: ...}
           │      └─ command/agent/job_endpoint.go: JobsRegister()
           │         ├─ ACL 校验
           │         ├─ parseJob()
           │         ├─ s.jobRegisterJob()
           │         │   └─ Raft.Apply(JobRegisterRequest)
           │         │      └─ FSM.Apply()
           │         │         └─ state.UpsertJob()
           │         ├─ createEvaluation()
           │         │   └─ Raft.Apply(EvalUpdateRequest)
           │         └─ return {EvalID, Warnings}
           └─ newMonitor().monitor(evalID)
              └─ 轮询 client.Evaluations().Info(evalID)
              └─ 轮询 client.Evaluations().Allocations(evalID)
              └─ 输出调度日志直到 complete
```

### 30.2 `nomad alloc exec` 完整调用链

```
main.go: main()
  └─ cli.CLI.Run()
     └─ AllocExecCommand.Run(args)
        ├─ c.Meta.FlagSet("alloc exec", FlagSetClient)
        ├─ client.Search().PrefixSearch(allocID, contexts.Allocs)
        ├─ client.Allocations().Info(allocID)
        ├─ validateTaskExistsInAllocation(task, alloc)
        ├─ client.Allocations().Exec(ctx, alloc, task, cmd, stdin, stdout, stderr, tty, terminal)
        │   └─ api/allocations.go: Exec()
        │      └─ 建立 WebSocket: /v1/client/allocation/{allocID}/exec
        │         ├─ 发送 JSON header
        │         ├─ 发送 stdin 数据帧
        │         ├─ 接收 stdout/stderr 数据帧
        │         └─ 接收 exit 信号
        │      └─ command/agent/alloc_endpoint.go: AllocExec()
        │         └─ forwarding to client node via RPC
        │            └─ client/allocrunner/taskrunner/task_runner.go: HandleExec()
        │               └─ driver.Exec()
        │                  └─ task process 内执行命令
        └─ 返回退出码
```

### 30.3 `nomad node drain` 完整调用链

```
main.go: main()
  └─ cli.CLI.Run()
     └─ NodeDrainCommand.Run(args)
        ├─ c.Meta.FlagSet("node drain", FlagSetClient)
        ├─ 确认提示（除非 -yes）
        ├─ client.Nodes().ToggleDrain(nodeID, drainUpdate, q)
        │   └─ api/nodes.go: ToggleDrain()
        │      └─ HTTP POST /v1/node/{nodeID}/drain
        │         └─ command/agent/node_endpoint.go: NodeToggleDrain()
        │            ├─ ACL 校验
        │            ├─ Raft.Apply(NodeUpdateDrainRequest)
        │            │   └─ FSM.Apply() → state.UpsertNode()
        │            └─ 触发 drain watcher
        │               └─ nomad/drain.go: drainNode()
        │                  ├─ 迁移 alloc 到其他节点
        │                  ├─ 阻止新 alloc 调度到此节点
        │                  └─ 超时后强制停止剩余 alloc
        └─ 如果非 -detach，monitor alloc 迁移
```

---

## 31. 代码文件索引

### 31.1 核心入口文件

| 文件 | 作用 |
|---|---|
| [`main.go`](file:///d:/claude/nomad/main.go) | 程序入口，构造 cli.CLI |
| [`command/commands.go`](file:///d:/claude/nomad/command/commands.go) | 命令注册总表 |
| [`command/meta.go`](file:///d:/claude/nomad/command/meta.go) | Meta 公共基类 |
| [`command/helpers.go`](file:///d:/claude/nomad/command/helpers.go) | 跨命令工具函数 |
| [`command/data_format.go`](file:///d:/claude/nomad/command/data_format.go) | 输出格式化 |
| [`command/monitor.go`](file:///d:/claude/nomad/command/monitor.go) | Eval monitor 实现 |

### 31.2 Agent 服务端文件

| 文件 | 端点 | 职责 |
|---|---|---|
| [`command/agent/command.go`](file:///d:/claude/nomad/command/agent/command.go) | - | Agent 进程入口 |
| [`command/agent/http.go`](file:///d:/claude/nomad/command/agent/http.go) | - | HTTP 路由注册 |
| [`command/agent/job_endpoint.go`](file:///d:/claude/nomad/command/agent/job_endpoint.go) | `/v1/jobs` | Job API |
| [`command/agent/alloc_endpoint.go`](file:///d:/claude/nomad/command/agent/alloc_endpoint.go) | `/v1/allocations` | Alloc API |
| [`command/agent/eval_endpoint.go`](file:///d:/claude/nomad/command/agent/eval_endpoint.go) | `/v1/evaluations` | Eval API |
| [`command/agent/node_endpoint.go`](file:///d:/claude/nomad/command/agent/node_endpoint.go) | `/v1/nodes` | Node API |
| [`command/agent/fs_endpoint.go`](file:///d:/claude/nomad/command/agent/fs_endpoint.go) | `/v1/client/fs` | 文件系统/日志/exec |
| [`command/agent/operator_endpoint.go`](file:///d:/claude/nomad/command/agent/operator_endpoint.go) | `/v1/operator/*` | 运维操作 |
| [`command/agent/acl_endpoint.go`](file:///d:/claude/nomad/command/agent/acl_endpoint.go) | `/v1/acl/*` | ACL 管理 |
| [`command/agent/deployment_endpoint.go`](file:///d:/claude/nomad/command/agent/deployment_endpoint.go) | `/v1/deployments` | Deployment |
| [`command/agent/namespace_endpoint.go`](file:///d:/claude/nomad/command/agent/namespace_endpoint.go) | `/v1/namespaces` | Namespace |
| [`command/agent/csi_endpoint.go`](file:///d:/claude/nomad/command/agent/csi_endpoint.go) | `/v1/volumes` `/v1/plugins` | CSI |
| [`command/agent/variable_endpoint.go`](file:///d:/claude/nomad/command/agent/variable_endpoint.go) | `/v1/vars` | Variables |
| [`command/agent/search_endpoint.go`](file:///d:/claude/nomad/command/agent/search_endpoint.go) | `/v1/search` | 前缀搜索 |
| [`command/agent/status_endpoint.go`](file:///d:/claude/nomad/command/agent/status_endpoint.go) | `/v1/status` | 集群状态 |

### 31.3 API 客户端文件

| 文件 | 资源 |
|---|---|
| [`api/jobs.go`](file:///d:/claude/nomad/api/jobs.go) | `Jobs()` |
| [`api/allocations.go`](file:///d:/claude/nomad/api/allocations.go) | `Allocations()` |
| [`api/nodes.go`](file:///d:/claude/nomad/api/nodes.go) | `Nodes()` |
| [`api/evaluations.go`](file:///d:/claude/nomad/api/evaluations.go) | `Evaluations()` |
| [`api/deployments.go`](file:///d:/claude/nomad/api/deployments.go) | `Deployments()` |
| [`api/acl.go`](file:///d:/claude/nomad/api/acl.go) | `ACLTokens()` / `ACLPolicies()` |
| [`api/operator.go`](file:///d:/claude/nomad/api/operator.go) | `Operator()` |
| [`api/search.go`](file:///d:/claude/nomad/api/search.go) | `Search()` |
| [`api/agent.go`](file:///d:/claude/nomad/api/agent.go) | `Agent()` |

---

## 32. 设计要点与最佳实践

### 32.1 命令设计模式

1. **Meta 嵌入**：所有命令嵌入 `Meta`，复用 `Client()`、`FlagSet()`、`Colorize()` 等，确保一致性
2. **JobGetter 嵌入**：需要解析 jobspec 的命令（`job run`、`job plan`、`job validate`）嵌入 `JobGetter`
3. **工厂模式**：`Commands()` 返回 `map[string]cli.CommandFactory`，延迟实例化
4. **分层清晰**：CLI 解析 → 命令逻辑 → API 客户端 → HTTP → 服务端处理

### 32.2 错误处理约定

| 退出码 | 含义 |
|---|---|
| `0` | 成功 |
| `1` | 一般错误（连接失败、参数错误） |
| `2` | 调度放置问题（仅 `job run`/`job plan`） |

### 32.3 流式命令设计

- **HTTP Streaming**：`alloc logs`、`alloc fs` 使用 `io.Reader` 持续读取
- **WebSocket**：`alloc exec` 使用双向通信
- **轮询**：`monitor`、`job run`（monitor 模式）使用定时轮询（1s 间隔）

### 32.4 UI 提示机制

命令执行后通过 `showUIPath()` 输出 Web UI 链接提示：
```go
hint, _ := c.Meta.showUIPath(UIHintContext{
    Command: "job status",
    PathParams: map[string]string{"jobID": *job.ID, "namespace": ns},
})
if hint != "" { c.Ui.Warn(hint) }
```

可通过 `NOMAD_CLI_SHOW_HINTS=false` 禁用。

### 32.5 配置优先级

```
CLI flag > 环境变量 > 配置文件 > 默认值
```

关键环境变量：
- `NOMAD_ADDR` — API 地址（默认 `http://127.0.0.1:4646`）
- `NOMAD_REGION` — 区域
- `NOMAD_NAMESPACE` — 命名空间
- `NOMAD_TOKEN` — ACL token
- `NOMAD_CACERT` / `NOMAD_CLIENT_CERT` / `NOMAD_CLIENT_KEY` — TLS

### 32.6 自动补全

- 通过 `nomad -autocomplete-install` 安装 shell 补全
- 每个命令实现 `AutocompleteFlags()` 和 `AutocompleteArgs()`
- 支持 `PredictFiles`、`PredictDirs`、`PredictSet`、`PredictFunc` 等预测器

### 32.7 弃用策略

- 旧命令名通过 `DeprecatedCommand` 包装，执行前打印警告
- 顶层别名（如 `run`、`stop`、`status`）保留但不在 help 中突出显示
- `hidden` 列表完全隐藏内部命令

### 32.8 企业版扩展

- 通过 `EntCommands()` 注入企业版命令（在 `commands_ce.go` 中为空实现）
- 编译时通过 `//go:build ent` 标签切换

---

## 总结

Nomad CLI 采用经典的分层架构，通过 `cli.CLI` 框架统一管理约 200+ 条命令。核心设计包括：

1. **统一入口**：`main.go` → `cli.CLI.Run()` → 命令工厂分发
2. **Meta 基类**：所有命令共享 API 客户端构造、flag 解析、UI 输出
3. **API 封装**：`api.Client` 将 HTTP 调用封装为资源方法
4. **多模式支持**：本地命令、查询命令、变更命令、流式命令、OIDC 登录、Agent 进程
5. **一致性约定**：退出码、输出格式、UI 提示、自动补全
6. **可扩展性**：企业版命令注入、弃用命令包装、命令别名

理解命令执行流程的关键是掌握 `Meta.Client()` → `api.Client.X().Y()` → HTTP `/v1/*` → `agent/*_endpoint.go` → `Raft.Apply` → `FSM` → `Scheduler` 这条核心链路。