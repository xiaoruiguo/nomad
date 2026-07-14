# Nomad 命令注册清单与技术实现

> 本文档枚举 Nomad CLI 全部命令的注册位置、源码实现文件与实现技术，基于 `command/commands.go` 的命令注册总表与 `main.go` 的入口分析整理。

---

## 1. 注册架构总览

### 1.1 核心入口

| 文件 | 作用 |
|---|---|
| [`main.go`](file:///d:/claude/nomad/main.go) | 程序入口，构造 `cli.CLI` 并运行 |
| [`command/commands.go`](file:///d:/claude/nomad/command/commands.go) | 命令注册总表，返回 `map[string]cli.CommandFactory` |
| [`command/commands_ce.go`](file:///d:/claude/nomad/command/commands_ce.go) | 社区版企业命令占位实现（返回空 map） |
| [`command/meta.go`](file:///d:/claude/nomad/command/meta.go) | 所有命令共享的 `Meta` 基类 |

### 1.2 注册流程

```
main.go: Run(args)
  ├─ metaPtr := new(command.Meta)
  ├─ metaPtr.SetupUi(args)
  ├─ commands := command.Commands(metaPtr, agentUi)
  │   ├─ all := map[string]cli.CommandFactory{ ... }  // 主命令表（250 条）
  │   ├─ if runtime.GOOS == "windows" { ... }          // Windows 专属命令（4 条）
  │   ├─ deprecated := map[...]                         // 弃用别名（4 条）
  │   ├─ for k,v := range deprecated { all[k] = v }    // 合并弃用命令
  │   └─ for k,v := range EntCommands(...) { all[k] = v } // 合并企业命令
  ├─ cli := &cli.CLI{
  │     Commands:       commands,
  │     HiddenCommands: hidden,           // main.go 中定义
  │     Autocomplete:   true,
  │     HelpFunc:       groupedHelpFunc(...),
  │  }
  └─ exitCode, err := cli.Run()
```

### 1.3 命令工厂模式

每个命令通过闭包工厂延迟实例化：

```go
"job run": func() (cli.Command, error) {
    return &JobRunCommand{
        Meta: meta,
    }, nil
},
```

工厂闭包捕获 `meta`（共享 `Meta` 实例），实现：
- **延迟实例化**：仅在调用时创建命令对象
- **Meta 注入**：所有命令共享同一 `Meta`，复用 API 客户端、UI、颜色化等
- **接口统一**：返回 `cli.Command` 接口，框架统一调度

### 1.4 命令分类机制

[`main.go`](file:///d:/claude/nomad/main.go) 中通过三个列表对命令分类：

| 列表 | 作用 | 命令 |
|---|---|---|
| `commonCommands` | 在 help 中突出显示 | `run`, `stop`, `status`, `alloc`, `job`, `node`, `agent` |
| `aliases` | 隐藏但可自动补全 | `fs`, `init`, `inspect`, `logs`, `plan`, `validate` |
| `hidden` | 完全隐藏（内部/弃用） | `alloc-status`, `check`, `client-config`, `debug`, `eval-status`, `executor`, `logmon`, `node-drain`, `node-status`, `server-force-leave`, `server-join`, `server-members`, `syslog`, `docker_logger`, `operator raft _info`, `operator raft _logs`, `operator raft _state`, `operator snapshot _state`, `template-render` |

---

## 2. 主命令注册表（250 条）

### 2.1 ACL 命令组（25 条）

注册位置：[`commands.go:83-247`](file:///d:/claude/nomad/command/commands.go#L83-L247)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `acl` | `ACLCommand` | [`acl.go`](file:///d:/claude/nomad/command/acl.go) | 父命令（无 Run，仅 Help） |
| `acl auth-method` | `ACLAuthMethodCommand` | [`acl_auth_method.go`](file:///d:/claude/nomad/command/acl_auth_method.go) | 父命令 |
| `acl auth-method create` | `ACLAuthMethodCreateCommand` | [`acl_auth_method_create.go`](file:///d:/claude/nomad/command/acl_auth_method_create.go) | FlagSet + JSON/HCL 解析 + `ACL().CreateAuthMethod()` |
| `acl auth-method delete` | `ACLAuthMethodDeleteCommand` | [`acl_auth_method_delete.go`](file:///d:/claude/nomad/command/acl_auth_method_delete.go) | 前缀搜索 + `ACL().DeleteAuthMethod()` |
| `acl auth-method info` | `ACLAuthMethodInfoCommand` | [`acl_auth_method_info.go`](file:///d:/claude/nomad/command/acl_auth_method_info.go) | 前缀搜索 + `ACL().AuthMethod()` + Format 输出 |
| `acl auth-method list` | `ACLAuthMethodListCommand` | [`acl_auth_method_list.go`](file:///d:/claude/nomad/command/acl_auth_method_list.go) | `ACL().ListAuthMethods()` + 表格输出 |
| `acl auth-method update` | `ACLAuthMethodUpdateCommand` | [`acl_auth_method_update.go`](file:///d:/claude/nomad/command/acl_auth_method_update.go) | 读取现有 + 合并 flag + `ACL().UpdateAuthMethod()` |
| `acl binding-rule` | `ACLBindingRuleCommand` | [`acl_binding_rule.go`](file:///d:/claude/nomad/command/acl_binding_rule.go) | 父命令 |
| `acl binding-rule create` | `ACLBindingRuleCreateCommand` | [`acl_binding_rule_create.go`](file:///d:/claude/nomad/command/acl_binding_rule_create.go) | JSON/HCL 解析 + `ACL().CreateBindingRule()` |
| `acl binding-rule delete` | `ACLBindingRuleDeleteCommand` | [`acl_binding_rule_delete.go`](file:///d:/claude/nomad/command/acl_binding_rule_delete.go) | 前缀搜索 + `ACL().DeleteBindingRule()` |
| `acl binding-rule info` | `ACLBindingRuleInfoCommand` | [`acl_binding_rule_info.go`](file:///d:/claude/nomad/command/acl_binding_rule_info.go) | 前缀搜索 + `ACL().BindingRule()` + Format |
| `acl binding-rule list` | `ACLBindingRuleListCommand` | [`acl_binding_rule_list.go`](file:///d:/claude/nomad/command/acl_binding_rule_list.go) | `ACL().ListBindingRules()` + 表格 |
| `acl binding-rule update` | `ACLBindingRuleUpdateCommand` | [`acl_binding_rule_update.go`](file:///d:/claude/nomad/command/acl_binding_rule_update.go) | 读取 + 合并 + `ACL().UpdateBindingRule()` |
| `acl bootstrap` | `ACLBootstrapCommand` | [`acl_bootstrap.go`](file:///d:/claude/nomad/command/acl_bootstrap.go) | `ACL().Bootstrap()` + 输出初始 token |
| `acl policy` | `ACLPolicyCommand` | [`acl_policy.go`](file:///d:/claude/nomad/command/acl_policy.go) | 父命令 |
| `acl policy apply` | `ACLPolicyApplyCommand` | [`acl_policy_apply.go`](file:///d:/claude/nomad/command/acl_policy_apply.go) | 文件读取 + `ACL().UpsertPolicy()` |
| `acl policy delete` | `ACLPolicyDeleteCommand` | [`acl_policy_delete.go`](file:///d:/claude/nomad/command/acl_policy_delete.go) | 前缀搜索 + `ACL().DeletePolicy()` |
| `acl policy info` | `ACLPolicyInfoCommand` | [`acl_policy_info.go`](file:///d:/claude/nomad/command/acl_policy_info.go) | 前缀搜索 + `ACL().Policy()` + Format |
| `acl policy list` | `ACLPolicyListCommand` | [`acl_policy_list.go`](file:///d:/claude/nomad/command/acl_policy_list.go) | `ACL().ListPolicies()` + 表格 |
| `acl policy self` | `ACLPolicySelfCommand` | [`acl_policy_self.go`](file:///d:/claude/nomad/command/acl_policy_self.go) | `ACL().SelfPolicies()` + Format |
| `acl role` | `ACLRoleCommand` | [`acl_role.go`](file:///d:/claude/nomad/command/acl_role.go) | 父命令 |
| `acl role create` | `ACLRoleCreateCommand` | [`acl_role_create.go`](file:///d:/claude/nomad/command/acl_role_create.go) | JSON/HCL 解析 + `ACL().CreateRole()` |
| `acl role delete` | `ACLRoleDeleteCommand` | [`acl_role_delete.go`](file:///d:/claude/nomad/command/acl_role_delete.go) | 前缀搜索 + `ACL().DeleteRole()` |
| `acl role info` | `ACLRoleInfoCommand` | [`acl_role_info.go`](file:///d:/claude/nomad/command/acl_role_info.go) | 前缀搜索 + `ACL().Role()` + Format |
| `acl role list` | `ACLRoleListCommand` | [`acl_role_list.go`](file:///d:/claude/nomad/command/acl_role_list.go) | `ACL().ListRoles()` + 表格 |
| `acl role update` | `ACLRoleUpdateCommand` | [`acl_role_update.go`](file:///d:/claude/nomad/command/acl_role_update.go) | 读取 + 合并 + `ACL().UpdateRole()` |
| `acl token` | `ACLTokenCommand` | [`acl_token.go`](file:///d:/claude/nomad/command/acl_token.go) | 父命令 |
| `acl token create` | `ACLTokenCreateCommand` | [`acl_token_create.go`](file:///d:/claude/nomad/command/acl_token_create.go) | FlagSet + `ACL().CreateToken()` |
| `acl token update` | `ACLTokenUpdateCommand` | [`acl_token_update.go`](file:///d:/claude/nomad/command/acl_token_update.go) | 前缀搜索 + `ACL().UpdateToken()` |
| `acl token delete` | `ACLTokenDeleteCommand` | [`acl_token_delete.go`](file:///d:/claude/nomad/command/acl_token_delete.go) | 前缀搜索 + `ACL().DeleteToken()` |
| `acl token info` | `ACLTokenInfoCommand` | [`acl_token_info.go`](file:///d:/claude/nomad/command/acl_token_info.go) | 前缀搜索 + `ACL().Token()` + Format |
| `acl token list` | `ACLTokenListCommand` | [`acl_token_list.go`](file:///d:/claude/nomad/command/acl_token_list.go) | `ACL().ListTokens()` + 表格 |
| `acl token self` | `ACLTokenSelfCommand` | [`acl_token_self.go`](file:///d:/claude/nomad/command/acl_token_self.go) | `ACL().Self()` + Format |

### 2.2 Action 命令（1 条）

注册位置：[`commands.go:248`](file:///d:/claude/nomad/command/commands.go#L248)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `action` | `ActionCommand` | [`action.go`](file:///d:/claude/nomad/command/action.go) | JobGetter 解析 jobspec + `Jobs().RegisterOpts()` 带 action 标记 |

### 2.3 Alloc 命令组（10 条）

注册位置：[`commands.go:253-303`](file:///d:/claude/nomad/command/commands.go#L253-L303)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `alloc` | `AllocCommand` | [`alloc.go`](file:///d:/claude/nomad/command/alloc.go) | 父命令 |
| `alloc exec` | `AllocExecCommand` | [`alloc_exec.go`](file:///d:/claude/nomad/command/alloc_exec.go) | WebSocket 双向通信 + TTY 处理 + `Allocations().Exec()` |
| `alloc signal` | `AllocSignalCommand` | [`alloc_signal.go`](file:///d:/claude/nomad/command/alloc_signal.go) | 前缀搜索 + `Allocations().Signal()` |
| `alloc pause` | `AllocPauseCommand` | [`alloc_pause.go`](file:///d:/claude/nomad/command/alloc_pause.go) | 前缀搜索 + `Allocations().Pause()` |
| `alloc stop` | `AllocStopCommand` | [`alloc_stop.go`](file:///d:/claude/nomad/command/alloc_stop.go) | 前缀搜索 + `Allocations().Stop()` |
| `alloc fs` | `AllocFSCommand` | [`alloc_fs.go`](file:///d:/claude/nomad/command/alloc_fs.go) | HTTP 流式读取 + `Allocations().FS()`/`Stat()`/`List()`/`Stream()` |
| `alloc logs` | `AllocLogsCommand` | [`alloc_logs.go`](file:///d:/claude/nomad/command/alloc_logs.go) | HTTP 流式 + `Allocations().Logs()` + 多任务过滤 |
| `alloc restart` | `AllocRestartCommand` | [`alloc_restart.go`](file:///d:/claude/nomad/command/alloc_restart.go) | 前缀搜索 + `Allocations().Restart()` |
| `alloc checks` | `AllocChecksCommand` | [`alloc_checks.go`](file:///d:/claude/nomad/command/alloc_checks.go) | 前缀搜索 + `Allocations().Checks()` + 表格 |
| `alloc status` | `AllocStatusCommand` | [`alloc_status.go`](file:///d:/claude/nomad/command/alloc_status.go) | 前缀搜索 + `Allocations().Info()` + Format |
| `alloc-status` | `AllocStatusCommand` | [`alloc_status.go`](file:///d:/claude/nomad/command/alloc_status.go) | 隐藏别名（同 `alloc status`） |

### 2.4 Agent 命令组（2 条）

注册位置：[`commands.go:308-319`](file:///d:/claude/nomad/command/commands.go#L308-L319)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `agent` | `agent.Command` | [`agent/command.go`](file:///d:/claude/nomad/command/agent/command.go) | 进程启动 + config 加载 + Server/Client 初始化 + 信号处理 |
| `agent-info` | `AgentInfoCommand` | [`agent_info.go`](file:///d:/claude/nomad/command/agent_info.go) | `Agent().Self()` + Format |

### 2.5 Check 命令（1 条，隐藏）

注册位置：[`commands.go:320`](file:///d:/claude/nomad/command/commands.go#L320)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `check` | `AgentCheckCommand` | [`check.go`](file:///d:/claude/nomad/command/check.go) | 内部脚本调用（hidden），服务健康自检 |

### 2.6 Config 命令组（2 条）

注册位置：[`commands.go:325-330`](file:///d:/claude/nomad/command/commands.go#L325-L330)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `config` | `ConfigCommand` | [`config.go`](file:///d:/claude/nomad/command/config.go) | 父命令 |
| `config validate` | `ConfigValidateCommand` | [`config_validate.go`](file:///d:/claude/nomad/command/config_validate.go) | HCL 解析 + agent 配置校验 + 输出错误 |

### 2.7 Debug 命令（1 条，隐藏）

注册位置：[`commands.go:336`](file:///d:/claude/nomad/command/commands.go#L336)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `debug` | `OperatorDebugCommand` | [`operator_debug.go`](file:///d:/claude/nomad/command/operator_debug.go) | 隐藏别名（同 `operator debug`），采集集群诊断信息 |

### 2.8 Deployment 命令组（8 条）

注册位置：[`commands.go:341-378`](file:///d:/claude/nomad/command/commands.go#L341-L378)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `deployment` | `DeploymentCommand` | [`deployment.go`](file:///d:/claude/nomad/command/deployment.go) | 父命令 |
| `deployment fail` | `DeploymentFailCommand` | [`deployment_fail.go`](file:///d:/claude/nomad/command/deployment_fail.go) | 前缀搜索 + `Deployments().Fail()` |
| `deployment list` | `DeploymentListCommand` | [`deployment_list.go`](file:///d:/claude/nomad/command/deployment_list.go) | `Deployments().List()` + 表格 + 过滤 |
| `deployment pause` | `DeploymentPauseCommand` | [`deployment_pause.go`](file:///d:/claude/nomad/command/deployment_pause.go) | 前缀搜索 + `Deployments().Pause()` |
| `deployment promote` | `DeploymentPromoteCommand` | [`deployment_promote.go`](file:///d:/claude/nomad/command/deployment_promote.go) | 前缀搜索 + `Deployments().PromoteGroups()` |
| `deployment resume` | `DeploymentResumeCommand` | [`deployment_resume.go`](file:///d:/claude/nomad/command/deployment_resume.go) | 前缀搜索 + `Deployments().Resume()` |
| `deployment status` | `DeploymentStatusCommand` | [`deployment_status.go`](file:///d:/claude/nomad/command/deployment_status.go) | 前缀搜索 + `Deployments().Info()` + Format |
| `deployment unblock` | `DeploymentUnblockCommand` | [`deployment_unblock.go`](file:///d:/claude/nomad/command/deployment_unblock.go) | 前缀搜索 + `Deployments().Unblock()` |

### 2.9 Eval 命令组（4 条）

注册位置：[`commands.go:381-401`](file:///d:/claude/nomad/command/commands.go#L381-L401)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `eval` | `EvalCommand` | [`eval.go`](file:///d:/claude/nomad/command/eval.go) | 父命令 |
| `eval delete` | `EvalDeleteCommand` | [`eval_delete.go`](file:///d:/claude/nomad/command/eval_delete.go) | 批量删除 + `Evaluations().Delete()` |
| `eval list` | `EvalListCommand` | [`eval_list.go`](file:///d:/claude/nomad/command/eval_list.go) | `Evaluations().List()` + 表格 + 过滤 |
| `eval status` | `EvalStatusCommand` | [`eval_status.go`](file:///d:/claude/nomad/command/eval_status.go) | 前缀搜索 + `Evaluations().Info()` + 关联 allocs |
| `eval-status` | `EvalStatusCommand` | [`eval_status.go`](file:///d:/claude/nomad/command/eval_status.go) | 隐藏别名（同 `eval status`） |

### 2.10 顶层别名命令（6 条）

注册位置：[`commands.go:406-426`](file:///d:/claude/nomad/command/commands.go#L406-L426)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `exec` | `AllocExecCommand` | [`alloc_exec.go`](file:///d:/claude/nomad/command/alloc_exec.go) | 别名（同 `alloc exec`），WebSocket |
| `fs` | `AllocFSCommand` | [`alloc_fs.go`](file:///d:/claude/nomad/command/alloc_fs.go) | 别名（同 `alloc fs`），HTTP 流式 |
| `init` | `JobInitCommand` | [`job_init.go`](file:///d:/claude/nomad/command/job_init.go) | 别名（同 `job init`），模板写入文件 |
| `inspect` | `JobInspectCommand` | [`job_inspect.go`](file:///d:/claude/nomad/command/job_inspect.go) | 别名（同 `job inspect`），Format JSON |
| `plan` | `JobPlanCommand` | [`job_plan.go`](file:///d:/claude/nomad/command/job_plan.go) | 别名（同 `job plan`），diff + 退出码 |
| `validate` | `JobValidateCommand` | [`job_validate.go`](file:///d:/claude/nomad/command/job_validate.go) | 别名（同 `job validate`），jobspec 校验 |

### 2.11 Fmt 命令（1 条）

注册位置：[`commands.go:411`](file:///d:/claude/nomad/command/commands.go#L411)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `fmt` | `FormatCommand` | [`fmt.go`](file:///d:/claude/nomad/command/fmt.go) | HCL 格式化 + 文件读写 |

### 2.12 Job 命令组（23 条）

注册位置：[`commands.go:431-556`](file:///d:/claude/nomad/command/commands.go#L431-L556)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `job` | `JobCommand` | [`job.go`](file:///d:/claude/nomad/command/job.go) | 父命令 |
| `job action` | `JobActionCommand` | [`job_action.go`](file:///d:/claude/nomad/command/job_action.go) | JobGetter + `Jobs().RegisterOpts()` 带 action |
| `job allocs` | `JobAllocsCommand` | [`job_allocs.go`](file:///d:/claude/nomad/command/job_allocs.go) | 前缀搜索 + `Jobs().Allocations()` + 表格 |
| `job restart` | `JobRestartCommand` | [`job_restart.go`](file:///d:/claude/nomad/command/job_restart.go) | 前缀搜索 + 批量 alloc 重启 |
| `job deployments` | `JobDeploymentsCommand` | [`job_deployments.go`](file:///d:/claude/nomad/command/job_deployments.go) | 前缀搜索 + `Jobs().Deployments()` + 表格 |
| `job dispatch` | `JobDispatchCommand` | [`job_dispatch.go`](file:///d:/claude/nomad/command/job_dispatch.go) | 参数化作业 + `Jobs().Dispatch()` |
| `job eval` | `JobEvalCommand` | [`job_eval.go`](file:///d:/claude/nomad/command/job_eval.go) | 前缀搜索 + `Jobs().ForceEvaluate()` + monitor |
| `job history` | `JobHistoryCommand` | [`job_history.go`](file:///d:/claude/nomad/command/job_history.go) | 前缀搜索 + `Jobs().Versions()` + diff |
| `job init` | `JobInitCommand` | [`job_init.go`](file:///d:/claude/nomad/command/job_init.go) | 模板写入文件（short/long 可选） |
| `job inspect` | `JobInspectCommand` | [`job_inspect.go`](file:///d:/claude/nomad/command/job_inspect.go) | 前缀搜索 + `Jobs().Info()` + Format |
| `job periodic` | `JobPeriodicCommand` | [`job_periodic.go`](file:///d:/claude/nomad/command/job_periodic.go) | 父命令 |
| `job periodic force` | `JobPeriodicForceCommand` | [`job_periodic_force.go`](file:///d:/claude/nomad/command/job_periodic_force.go) | 前缀搜索 + `Jobs().PeriodicForce()` |
| `job plan` | `JobPlanCommand` | [`job_plan.go`](file:///d:/claude/nomad/command/job_plan.go) | JobGetter + `Jobs().Plan()` + diff + 退出码 0/1/2 |
| `job promote` | `JobPromoteCommand` | [`job_promote.go`](file:///d:/claude/nomad/command/job_promote.go) | 前缀搜索 + `Jobs().PromoteGroups()` |
| `job revert` | `JobRevertCommand` | [`job_revert.go`](file:///d:/claude/nomad/command/job_revert.go) | 前缀搜索 + `Jobs().Revert()` |
| `job run` | `JobRunCommand` | [`job_run.go`](file:///d:/claude/nomad/command/job_run.go) | JobGetter + `Jobs().RegisterOpts()` + eval monitor |
| `job scale` | `JobScaleCommand` | [`job_scale.go`](file:///d:/claude/nomad/command/job_scale.go) | 前缀搜索 + `Jobs().Scale()` |
| `job scaling-events` | `JobScalingEventsCommand` | [`job_scaling_events.go`](file:///d:/claude/nomad/command/job_scaling_events.go) | 前缀搜索 + `Jobs().ScaleStatus()` |
| `job status` | `JobStatusCommand` | [`job_status.go`](file:///d:/claude/nomad/command/job_status.go) | 前缀搜索 + `Jobs().Info()` + allocs 表格 |
| `job stop` | `JobStopCommand` | [`job_stop.go`](file:///d:/claude/nomad/command/job_stop.go) | 前缀搜索 + `Jobs().Deregister()` + eval monitor |
| `job start` | `JobStartCommand` | [`job_start.go`](file:///d:/claude/nomad/command/job_start.go) | 前缀搜索 + `Jobs().Start()` |
| `job tag` | `JobTagCommand` | [`job_tag.go`](file:///d:/claude/nomad/command/job_tag.go) | 父命令 |
| `job tag apply` | `JobTagApplyCommand` | [`job_tag_apply.go`](file:///d:/claude/nomad/command/job_tag_apply.go) | 前缀搜索 + `Jobs().UpdateTags()` |
| `job tag unset` | `JobTagUnsetCommand` | [`job_tag_unset.go`](file:///d:/claude/nomad/command/job_tag_unset.go) | 前缀搜索 + `Jobs().UpdateTags()` 删除 |
| `job validate` | `JobValidateCommand` | [`job_validate.go`](file:///d:/claude/nomad/command/job_validate.go) | JobGetter + `Jobs().Validate()` |

### 2.13 License 命令组（2 条）

注册位置：[`commands.go:559-564`](file:///d:/claude/nomad/command/commands.go#L559-L564)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `license` | `LicenseCommand` | [`license.go`](file:///d:/claude/nomad/command/license.go) | 父命令 |
| `license get` | `LicenseGetCommand` | [`license_get.go`](file:///d:/claude/nomad/command/license_get.go) | `Operator().LicenseGet()` + Format |

### 2.14 Login 命令（1 条）

注册位置：[`commands.go:569`](file:///d:/claude/nomad/command/commands.go#L569)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `login` | `LoginCommand` | [`login.go`](file:///d:/claude/nomad/command/login.go) | OIDC 流程 + 本地 HTTP 回调服务器 + `ACL().Login()` |

### 2.15 Monitor 命令组（2 条）

注册位置：[`commands.go:579-584`](file:///d:/claude/nomad/command/commands.go#L579-L584)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `monitor` | `MonitorCommand` | [`monitor.go`](file:///d:/claude/nomad/command/monitor.go) | 长连接流式 + `Agent().Monitor()` |
| `monitor export` | `MonitorExportCommand` | [`agent_monitor_export.go`](file:///d:/claude/nomad/command/agent_monitor_export.go) | 导出监控日志快照 |

### 2.16 Namespace 命令组（6 条）

注册位置：[`commands.go:589-614`](file:///d:/claude/nomad/command/commands.go#L589-L614)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `namespace` | `NamespaceCommand` | [`namespace.go`](file:///d:/claude/nomad/command/namespace.go) | 父命令 |
| `namespace apply` | `NamespaceApplyCommand` | [`namespace_apply.go`](file:///d:/claude/nomad/command/namespace_apply.go) | JSON/HCL 解析 + `Namespaces().Upsert()` |
| `namespace delete` | `NamespaceDeleteCommand` | [`namespace_delete.go`](file:///d:/claude/nomad/command/namespace_delete.go) | 前缀搜索 + `Namespaces().Delete()` |
| `namespace inspect` | `NamespaceInspectCommand` | [`namespace_inspect.go`](file:///d:/claude/nomad/command/namespace_inspect.go) | 前缀搜索 + `Namespaces().Info()` + Format |
| `namespace list` | `NamespaceListCommand` | [`namespace_list.go`](file:///d:/claude/nomad/command/namespace_list.go) | `Namespaces().List()` + 表格 |
| `namespace status` | `NamespaceStatusCommand` | [`namespace_status.go`](file:///d:/claude/nomad/command/namespace_status.go) | 别名（同 `namespace inspect`） |

### 2.17 Node 命令组（22 条）

注册位置：[`commands.go:619-729`](file:///d:/claude/nomad/command/commands.go#L619-L729)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `node` | `NodeCommand` | [`node.go`](file:///d:/claude/nomad/command/node.go) | 父命令 |
| `node config` | `NodeConfigCommand` | [`node_config.go`](file:///d:/claude/nomad/command/node_config.go) | 前缀搜索 + `Nodes().Config()` 读写 |
| `node-drain` | `NodeDrainCommand` | [`node_drain.go`](file:///d:/claude/nomad/command/node_drain.go) | 隐藏别名（同 `node drain`） |
| `node drain` | `NodeDrainCommand` | [`node_drain.go`](file:///d:/claude/nomad/command/node_drain.go) | 前缀搜索 + `Nodes().ToggleDrain()` + monitor |
| `node eligibility` | `NodeEligibilityCommand` | [`node_eligibility.go`](file:///d:/claude/nomad/command/node_eligibility.go) | 前缀搜索 + `Nodes().ToggleEligibility()` |
| `node identity` | `NodeIdentityCommand` | [`node_identity.go`](file:///d:/claude/nomad/command/node_identity.go) | 父命令 |
| `node identity get` | `NodeIdentityGetCommand` | [`node_identity_get.go`](file:///d:/claude/nomad/command/node_identity_get.go) | 前缀搜索 + `Nodes().IdentityGet()` |
| `node identity renew` | `NodeIdentityRenewCommand` | [`node_identity_renew.go`](file:///d:/claude/nomad/command/node_identity_renew.go) | 前缀搜索 + `Nodes().IdentityRenew()` |
| `node intro` | `NodeIntroCommand` | [`node_intro.go`](file:///d:/claude/nomad/command/node_intro.go) | 父命令 |
| `node intro create` | `NodeIntroCreateCommand` | [`node_intro_create.go`](file:///d:/claude/nomad/command/node_intro_create.go) | 前缀搜索 + `Nodes().IntroCreate()` |
| `node meta` | `NodeMetaCommand` | [`node_meta.go`](file:///d:/claude/nomad/command/node_meta.go) | 父命令 |
| `node meta apply` | `NodeMetaApplyCommand` | [`node_meta_apply.go`](file:///d:/claude/nomad/command/node_meta_apply.go) | 前缀搜索 + `Nodes().MetaApply()` |
| `node meta read` | `NodeMetaReadCommand` | [`node_meta_read.go`](file:///d:/claude/nomad/command/node_meta_read.go) | 前缀搜索 + `Nodes().MetaRead()` |
| `node-status` | `NodeStatusCommand` | [`node_status.go`](file:///d:/claude/nomad/command/node_status.go) | 隐藏别名（同 `node status`） |
| `node status` | `NodeStatusCommand` | [`node_status.go`](file:///d:/claude/nomad/command/node_status.go) | `Nodes().List()` + 过滤 + 表格 |
| `node pool` | `NodePoolCommand` | [`node_pool.go`](file:///d:/claude/nomad/command/node_pool.go) | 父命令 |
| `node pool apply` | `NodePoolApplyCommand` | [`node_pool_apply.go`](file:///d:/claude/nomad/command/node_pool_apply.go) | JSON/HCL 解析 + `NodePools().Upsert()` |
| `node pool delete` | `NodePoolDeleteCommand` | [`node_pool_delete.go`](file:///d:/claude/nomad/command/node_pool_delete.go) | 前缀搜索 + `NodePools().Delete()` |
| `node pool info` | `NodePoolInfoCommand` | [`node_pool_info.go`](file:///d:/claude/nomad/command/node_pool_info.go) | 前缀搜索 + `NodePools().Info()` + Format |
| `node pool init` | `NodePoolInitCommand` | [`node_pool_init.go`](file:///d:/claude/nomad/command/node_pool_init.go) | 模板写入 |
| `node pool jobs` | `NodePoolJobsCommand` | [`node_pool_jobs.go`](file:///d:/claude/nomad/command/node_pool_jobs.go) | 前缀搜索 + `NodePools().Jobs()` |
| `node pool list` | `NodePoolListCommand` | [`node_pool_list.go`](file:///d:/claude/nomad/command/node_pool_list.go) | `NodePools().List()` + 表格 |
| `node pool nodes` | `NodePoolNodesCommand` | [`node_pool_nodes.go`](file:///d:/claude/nomad/command/node_pool_nodes.go) | 前缀搜索 + `Nodes().List()` 按 pool 过滤 |

### 2.18 Operator 命令组（35 条）

注册位置：[`commands.go:734-934`](file:///d:/claude/nomad/command/commands.go#L734-L934)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `operator` | `OperatorCommand` | [`operator.go`](file:///d:/claude/nomad/command/operator.go) | 父命令 |
| `operator api` | `OperatorAPICommand` | [`operator_api.go`](file:///d:/claude/nomad/command/operator_api.go) | HTTP 请求构造 + curl 等价命令输出 |
| `operator autopilot` | `OperatorAutopilotCommand` | [`operator_autopilot.go`](file:///d:/claude/nomad/command/operator_autopilot.go) | 父命令 |
| `operator autopilot get-config` | `OperatorAutopilotGetCommand` | [`operator_autopilot_get.go`](file:///d:/claude/nomad/command/operator_autopilot_get.go) | `Operator().AutopilotGetConfiguration()` |
| `operator autopilot set-config` | `OperatorAutopilotSetCommand` | [`operator_autopilot_set.go`](file:///d:/claude/nomad/command/operator_autopilot_set.go) | FlagSet + `Operator().AutopilotSetConfiguration()` |
| `operator autopilot health` | `OperatorAutopilotHealthCommand` | [`operator_autopilot_health.go`](file:///d:/claude/nomad/command/operator_autopilot_health.go) | `Operator().AutopilotState()` + 表格 |
| `operator client-state` | `OperatorClientStateCommand` | [`operator_client_state.go`](file:///d:/claude/nomad/command/operator_client_state.go) | 读取客户端状态文件 |
| `operator debug` | `OperatorDebugCommand` | [`operator_debug.go`](file:///d:/claude/nomad/command/operator_debug.go) | 采集 agent 信息、日志、快照打包 tar |
| `operator gossip` | `OperatorGossipCommand` | [`operator_gossip.go`](file:///d:/claude/nomad/command/operator_gossip.go) | 父命令 |
| `operator gossip keyring` | `OperatorGossipKeyringCommand` | [`operator_gossip_keyring.go`](file:///d:/claude/nomad/command/operator_gossip_keyring.go) | 父命令 |
| `operator gossip keyring install` | `OperatorGossipKeyringInstallCommand` | [`operator_gossip_keyring_install.go`](file:///d:/claude/nomad/command/operator_gossip_keyring_install.go) | `Operator().KeyringInstall()` |
| `operator gossip keyring use` | `OperatorGossipKeyringUseCommand` | [`operator_gossip_keyring_use.go`](file:///d:/claude/nomad/command/operator_gossip_keyring_use.go) | `Operator().KeyringUse()` |
| `operator gossip keyring list` | `OperatorGossipKeyringListCommand` | [`operator_gossip_keyring_list.go`](file:///d:/claude/nomad/command/operator_gossip_keyring_list.go) | `Operator().KeyringList()` |
| `operator gossip keyring remove` | `OperatorGossipKeyringRemoveCommand` | [`operator_gossip_keyring_remove.go`](file:///d:/claude/nomad/command/operator_gossip_keyring_remove.go) | `Operator().KeyringRemove()` |
| `operator gossip keyring generate` | `OperatorGossipKeyringGenerateCommand` | [`operator_gossip_keyring_generate.go`](file:///d:/claude/nomad/command/operator_gossip_keyring_generate.go) | 本地生成密钥（无 API 调用） |
| `operator metrics` | `OperatorMetricsCommand` | [`operator_metrics.go`](file:///d:/claude/nomad/command/operator_metrics.go) | `Operator().Metrics()` + 格式化输出 |
| `operator raft` | `OperatorRaftCommand` | [`operator_raft.go`](file:///d:/claude/nomad/command/operator_raft.go) | 父命令 |
| `operator raft list-peers` | `OperatorRaftListCommand` | [`operator_raft_list.go`](file:///d:/claude/nomad/command/operator_raft_list.go) | `Operator().RaftConfiguration()` + 表格 |
| `operator raft remove-peer` | `OperatorRaftRemoveCommand` | [`operator_raft_remove.go`](file:///d:/claude/nomad/command/operator_raft_remove.go) | `Operator().RaftRemovePeerByID()` |
| `operator raft transfer-leadership` | `OperatorRaftTransferLeadershipCommand` | [`operator_raft_transfer_leadership.go`](file:///d:/claude/nomad/command/operator_raft_transfer_leadership.go) | `Operator().RaftTransferLeaderByID()` |
| `operator raft info` | `OperatorRaftInfoCommand` | [`operator_raft_info.go`](file:///d:/claude/nomad/command/operator_raft_info.go) | 隐藏，读取 BoltDB 元数据 |
| `operator raft logs` | `OperatorRaftLogsCommand` | [`operator_raft_logs.go`](file:///d:/claude/nomad/command/operator_raft_logs.go) | 隐藏，读取 Raft 日志条目 |
| `operator raft state` | `OperatorRaftStateCommand` | [`operator_raft_state.go`](file:///d:/claude/nomad/command/operator_raft_state.go) | 隐藏，读取 FSM 状态快照 |
| `operator raft migrate-backend` | `OperatorRaftMigrateCommand` | [`operator_raft_migrate.go`](file:///d:/claude/nomad/command/operator_raft_migrate.go) | BoltDB → BoltDBv2 迁移 |
| `operator scheduler` | `OperatorSchedulerCommand` | [`operator_scheduler.go`](file:///d:/claude/nomad/command/operator_scheduler.go) | 父命令 |
| `operator scheduler get-config` | `OperatorSchedulerGetConfig` | [`operator_scheduler_get.go`](file:///d:/claude/nomad/command/operator_scheduler_get.go) | `Operator().SchedulerGetConfiguration()` |
| `operator scheduler set-config` | `OperatorSchedulerSetConfig` | [`operator_scheduler_set.go`](file:///d:/claude/nomad/command/operator_scheduler_set.go) | FlagSet + `Operator().SchedulerSetConfiguration()` |
| `operator root` | `OperatorRootCommand` | [`operator_root.go`](file:///d:/claude/nomad/command/operator_root.go) | 父命令 |
| `operator root keyring` | `OperatorRootKeyringCommand` | [`operator_root_keyring.go`](file:///d:/claude/nomad/command/operator_root_keyring.go) | 父命令 + 子命令分发 |
| `operator root keyring list` | `OperatorRootKeyringListCommand` | [`operator_root_keyring.go`](file:///d:/claude/nomad/command/operator_root_keyring.go) | `Operator().KeyringList()` |
| `operator root keyring remove` | `OperatorRootKeyringRemoveCommand` | [`operator_root_keyring.go`](file:///d:/claude/nomad/command/operator_root_keyring.go) | `Operator().KeyringRemove()` |
| `operator root keyring rotate` | `OperatorRootKeyringRotateCommand` | [`operator_root_keyring.go`](file:///d:/claude/nomad/command/operator_root_keyring.go) | `Operator().KeyringRotate()` |
| `operator snapshot` | `OperatorSnapshotCommand` | [`operator_snapshot.go`](file:///d:/claude/nomad/command/operator_snapshot.go) | 父命令 |
| `operator snapshot save` | `OperatorSnapshotSaveCommand` | [`operator_snapshot_save.go`](file:///d:/claude/nomad/command/operator_snapshot_save.go) | HTTP 流式下载 + 写入文件 |
| `operator snapshot inspect` | `OperatorSnapshotInspectCommand` | [`operator_snapshot_inspect.go`](file:///d:/claude/nomad/command/operator_snapshot_inspect.go) | 读取本地快照 + 元数据展示 |
| `operator snapshot state` | `OperatorSnapshotStateCommand` | [`operator_snapshot_state.go`](file:///d:/claude/nomad/command/operator_snapshot_state.go) | 隐藏，读取快照状态 |
| `operator snapshot restore` | `OperatorSnapshotRestoreCommand` | [`operator_snapshot_restore.go`](file:///d:/claude/nomad/command/operator_snapshot_restore.go) | `Operator().SnapshotRestore()` |
| `operator snapshot redact` | `OperatorSnapshotRedactCommand` | [`operator_snapshot_redact.go`](file:///d:/claude/nomad/command/operator_snapshot_redact.go) | 快照敏感字段脱敏 |
| `operator utilization` | `OperatorUtilizationCommand` | [`operator_utilization.go`](file:///d:/claude/nomad/command/operator_utilization.go) | `Operator().Utilization()` + 表格 |

### 2.19 Plugin 命令组（2 条）

注册位置：[`commands.go:944-949`](file:///d:/claude/nomad/command/commands.go#L944-L949)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `plugin` | `PluginCommand` | [`plugin.go`](file:///d:/claude/nomad/command/plugin.go) | 父命令 |
| `plugin status` | `PluginStatusCommand` | [`plugin_status_csi.go`](file:///d:/claude/nomad/command/plugin_status_csi.go) | `CSINodes().List()` + 表格 |

### 2.20 Quota 命令组（7 条）

注册位置：[`commands.go:955-991`](file:///d:/claude/nomad/command/commands.go#L955-L991)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `quota` | `QuotaCommand` | [`quota.go`](file:///d:/claude/nomad/command/quota.go) | 父命令 |
| `quota apply` | `QuotaApplyCommand` | [`quota_apply.go`](file:///d:/claude/nomad/command/quota_apply.go) | JSON/HCL 解析 + `Quotas().Upsert()` |
| `quota delete` | `QuotaDeleteCommand` | [`quota_delete.go`](file:///d:/claude/nomad/command/quota_delete.go) | 前缀搜索 + `Quotas().Delete()` |
| `quota init` | `QuotaInitCommand` | [`quota_init.go`](file:///d:/claude/nomad/command/quota_init.go) | 模板写入 |
| `quota inspect` | `QuotaInspectCommand` | [`quota_inspect.go`](file:///d:/claude/nomad/command/quota_inspect.go) | 前缀搜索 + `Quotas().Info()` + Format |
| `quota list` | `QuotaListCommand` | [`quota_list.go`](file:///d:/claude/nomad/command/quota_list.go) | `Quotas().List()` + 表格 |
| `quota status` | `QuotaStatusCommand` | [`quota_status.go`](file:///d:/claude/nomad/command/quota_status.go) | 前缀搜索 + `Quotas().Info()` + 使用量 |

### 2.21 Recommendation 命令组（5 条）

注册位置：[`commands.go:997-1023`](file:///d:/claude/nomad/command/commands.go#L997-L1023)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `recommendation` | `RecommendationCommand` | [`recommendation.go`](file:///d:/claude/nomad/command/recommendation.go) | 父命令 |
| `recommendation apply` | `RecommendationApplyCommand` | [`recommendation_apply.go`](file:///d:/claude/nomad/command/recommendation_apply.go) | `Recommendations().Apply()` |
| `recommendation dismiss` | `RecommendationDismissCommand` | [`recommendation_dismiss.go`](file:///d:/claude/nomad/command/recommendation_dismiss.go) | `Recommendations().Dismiss()` |
| `recommendation info` | `RecommendationInfoCommand` | [`recommendation_info.go`](file:///d:/claude/nomad/command/recommendation_info.go) | 前缀搜索 + `Recommendations().Info()` |
| `recommendation list` | `RecommendationListCommand` | [`recommendation_list.go`](file:///d:/claude/nomad/command/recommendation_list.go) | `Recommendations().List()` + 表格 |

### 2.22 Run 命令（1 条，别名）

注册位置：[`commands.go:1029`](file:///d:/claude/nomad/command/commands.go#L1029)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `run` | `JobRunCommand` | [`job_run.go`](file:///d:/claude/nomad/command/job_run.go) | 别名（同 `job run`），common command |

### 2.23 Scaling 命令组（4 条）

注册位置：[`commands.go:1034-1049`](file:///d:/claude/nomad/command/commands.go#L1034-L1049)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `scaling` | `ScalingCommand` | [`scaling.go`](file:///d:/claude/nomad/command/scaling.go) | 父命令 |
| `scaling policy` | `ScalingPolicyCommand` | [`scaling_policy.go`](file:///d:/claude/nomad/command/scaling_policy.go) | 父命令 |
| `scaling policy info` | `ScalingPolicyInfoCommand` | [`scaling_policy_info.go`](file:///d:/claude/nomad/command/scaling_policy_info.go) | 前缀搜索 + `Scaling().Policy()` |
| `scaling policy list` | `ScalingPolicyListCommand` | [`scaling_policy_list.go`](file:///d:/claude/nomad/command/scaling_policy_list.go) | `Scaling().Policies()` + 表格 |

### 2.24 Sentinel 命令组（5 条，企业版功能）

注册位置：[`commands.go:1054-1074`](file:///d:/claude/nomad/command/commands.go#L1054-L1074)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `sentinel` | `SentinelCommand` | [`sentinel.go`](file:///d:/claude/nomad/command/sentinel.go) | 父命令 |
| `sentinel list` | `SentinelListCommand` | [`sentinel_list.go`](file:///d:/claude/nomad/command/sentinel_list.go) | `Sentinel().List()` + 表格 |
| `sentinel apply` | `SentinelApplyCommand` | [`sentinel_apply.go`](file:///d:/claude/nomad/command/sentinel_apply.go) | 文件读取 + `Sentinel().Upsert()` |
| `sentinel delete` | `SentinelDeleteCommand` | [`sentinel_delete.go`](file:///d:/claude/nomad/command/sentinel_delete.go) | 前缀搜索 + `Sentinel().Delete()` |
| `sentinel read` | `SentinelReadCommand` | [`sentinel_read.go`](file:///d:/claude/nomad/command/sentinel_read.go) | 前缀搜索 + `Sentinel().Get()` + Format |

### 2.25 Server 命令组（4 条）

注册位置：[`commands.go:1079-1094`](file:///d:/claude/nomad/command/commands.go#L1079-L1094)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `server` | `ServerCommand` | [`server.go`](file:///d:/claude/nomad/command/server.go) | 父命令 |
| `server force-leave` | `ServerForceLeaveCommand` | [`server_force_leave.go`](file:///d:/claude/nomad/command/server_force_leave.go) | `Agent().ForceLeave()` |
| `server join` | `ServerJoinCommand` | [`server_join.go`](file:///d:/claude/nomad/command/server_join.go) | `Agent().Join()` + 多地址 |
| `server members` | `ServerMembersCommand` | [`server_members.go`](file:///d:/claude/nomad/command/server_members.go) | `Agent().Members()` + 表格 |

### 2.26 Service 命令组（4 条）

注册位置：[`commands.go:1114-1129`](file:///d:/claude/nomad/command/commands.go#L1114-L1129)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `service` | `ServiceCommand` | [`service.go`](file:///d:/claude/nomad/command/service.go) | 父命令 |
| `service list` | `ServiceListCommand` | [`service_list.go`](file:///d:/claude/nomad/command/service_list.go) | `Services().List()` + 表格 |
| `service info` | `ServiceInfoCommand` | [`service_info.go`](file:///d:/claude/nomad/command/service_info.go) | 前缀搜索 + `Services().Info()` |
| `service delete` | `ServiceDeleteCommand` | [`service_delete.go`](file:///d:/claude/nomad/command/service_delete.go) | 前缀搜索 + `Services().Delete()` |

### 2.27 Setup 命令组（3 条）

注册位置：[`commands.go:1134-1144`](file:///d:/claude/nomad/command/commands.go#L1134-L1144)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `setup` | `SetupCommand` | [`setup.go`](file:///d:/claude/nomad/command/setup.go) | 父命令 |
| `setup consul` | `SetupConsulCommand` | [`setup_consul.go`](file:///d:/claude/nomad/command/setup_consul.go) | 交互式配置 Consul 集成 |
| `setup vault` | `SetupVaultCommand` | [`setup_vault.go`](file:///d:/claude/nomad/command/setup_vault.go) | 交互式配置 Vault 集成 |

### 2.28 顶层别名命令（3 条，common）

注册位置：[`commands.go:1149-1159`](file:///d:/claude/nomad/command/commands.go#L1149-L1159)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `status` | `JobStatusCommand` | [`job_status.go`](file:///d:/claude/nomad/command/job_status.go) | 别名（同 `job status`），common command |
| `stop` | `JobStopCommand` | [`job_stop.go`](file:///d:/claude/nomad/command/job_stop.go) | 别名（同 `job stop`），common command |
| `start` | `JobStartCommand` | [`job_start.go`](file:///d:/claude/nomad/command/job_start.go) | 别名（同 `job start`） |

### 2.29 System 命令组（4 条）

注册位置：[`commands.go:1164-1179`](file:///d:/claude/nomad/command/commands.go#L1164-L1179)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `system` | `SystemCommand` | [`system.go`](file:///d:/claude/nomad/command/system.go) | 父命令 |
| `system gc` | `SystemGCCommand` | [`system_gc.go`](file:///d:/claude/nomad/command/system_gc.go) | `System().GarbageCollect()` |
| `system reconcile` | `SystemReconcileCommand` | [`system_reconcile.go`](file:///d:/claude/nomad/command/system_reconcile.go) | 父命令 |
| `system reconcile summaries` | `SystemReconcileSummariesCommand` | [`system_reconcile_summaries.go`](file:///d:/claude/nomad/command/system_reconcile_summaries.go) | `System().ReconcileSummaries()` |

### 2.30 TLS 命令组（7 条）

注册位置：[`commands.go:1184-1214`](file:///d:/claude/nomad/command/commands.go#L1184-L1214)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `tls` | `TLSCommand` | [`tls.go`](file:///d:/claude/nomad/command/tls.go) | 父命令 |
| `tls ca` | `TLSCACommand` | [`tls_ca.go`](file:///d:/claude/nomad/command/tls_ca.go) | 父命令 |
| `tls ca create` | `TLSCACreateCommand` | [`tls_ca_create.go`](file:///d:/claude/nomad/command/tls_ca_create.go) | 本地生成 CA 密钥对（无 API） |
| `tls ca info` | `TLSCAInfoCommand` | [`tls_ca_info.go`](file:///d:/claude/nomad/command/tls_ca_info.go) | 读取本地 CA 证书信息 |
| `tls cert` | `TLSCertCommand` | [`tls_cert.go`](file:///d:/claude/nomad/command/tls_cert.go) | 父命令 |
| `tls cert create` | `TLSCertCreateCommand` | [`tls_cert_create.go`](file:///d:/claude/nomad/command/tls_cert_create.go) | 使用 CA 签发证书（无 API） |
| `tls cert info` | `TLSCertInfoCommand` | [`tls_cert_info.go`](file:///d:/claude/nomad/command/tls_cert_info.go) | 读取本地证书信息 |

### 2.31 UI 命令（1 条）

注册位置：[`commands.go:1219`](file:///d:/claude/nomad/command/commands.go#L1219)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `ui` | `UICommand` | [`ui.go`](file:///d:/claude/nomad/command/ui.go) | 打开浏览器到 UI URL |

### 2.32 Var 命令组（7 条）

注册位置：[`commands.go:1229-1261`](file:///d:/claude/nomad/command/commands.go#L1229-L1261)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `var` | `VarCommand` | [`var.go`](file:///d:/claude/nomad/command/var.go) | 父命令 |
| `var purge` | `VarPurgeCommand` | [`var_purge.go`](file:///d:/claude/nomad/command/var_purge.go) | 前缀搜索 + `Variables().Delete()` |
| `var init` | `VarInitCommand` | [`var_init.go`](file:///d:/claude/nomad/command/var_init.go) | 模板写入 |
| `var list` | `VarListCommand` | [`var_list.go`](file:///d:/claude/nomad/command/var_list.go) | `Variables().List()` + 表格 |
| `var put` | `VarPutCommand` | [`var_put.go`](file:///d:/claude/nomad/command/var_put.go) | JSON/HCL/CSV 解析 + `Variables().Put()` |
| `var lock` | `VarLockCommand` | [`var_lock.go`](file:///d:/claude/nomad/command/var_lock.go) | CAS 锁机制 + `Variables().Put()` + 锁监控 |
| `var get` | `VarGetCommand` | [`var_get.go`](file:///d:/claude/nomad/command/var_get.go) | 前缀搜索 + `Variables().Get()` + Format |

### 2.33 Version 命令（1 条）

注册位置：[`commands.go:1266`](file:///d:/claude/nomad/command/commands.go#L1266)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `version` | `VersionCommand` | [`version.go`](file:///d:/claude/nomad/command/version.go) | 本地输出 `version.GetVersion()` |

### 2.34 Volume 命令组（14 条）

注册位置：[`commands.go:1272-1342`](file:///d:/claude/nomad/command/commands.go#L1272-L1342)

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `volume` | `VolumeCommand` | [`volume.go`](file:///d:/claude/nomad/command/volume.go) | 父命令 |
| `volume init` | `VolumeInitCommand` | [`volume_init.go`](file:///d:/claude/nomad/command/volume_init.go) | 模板写入 |
| `volume status` | `VolumeStatusCommand` | [`volume_status.go`](file:///d:/claude/nomad/command/volume_status.go) | `Volumes().List()` + 表格 + 过滤 |
| `volume register` | `VolumeRegisterCommand` | [`volume_register.go`](file:///d:/claude/nomad/command/volume_register.go) | JSON/HCL 解析 + `Volumes().Register()` |
| `volume deregister` | `VolumeDeregisterCommand` | [`volume_deregister.go`](file:///d:/claude/nomad/command/volume_deregister.go) | 前缀搜索 + `Volumes().Deregister()` |
| `volume detach` | `VolumeDetachCommand` | [`volume_detach.go`](file:///d:/claude/nomad/command/volume_detach.go) | 前缀搜索 + `Volumes().Deregister()` 强制 |
| `volume create` | `VolumeCreateCommand` | [`volume_create.go`](file:///d:/claude/nomad/command/volume_create.go) | JSON/HCL 解析 + `Volumes().Create()` |
| `volume delete` | `VolumeDeleteCommand` | [`volume_delete.go`](file:///d:/claude/nomad/command/volume_delete.go) | 前缀搜索 + `Volumes().Delete()` |
| `volume snapshot` | `VolumeSnapshotCommand` | [`volume_snapshot.go`](file:///d:/claude/nomad/command/volume_snapshot.go) | 父命令 |
| `volume snapshot create` | `VolumeSnapshotCreateCommand` | [`volume_snapshot_create.go`](file:///d:/claude/nomad/command/volume_snapshot_create.go) | `Volumes().CreateSnapshot()` |
| `volume snapshot delete` | `VolumeSnapshotDeleteCommand` | [`volume_snapshot_delete.go`](file:///d:/claude/nomad/command/volume_snapshot_delete.go) | `Volumes().DeleteSnapshot()` |
| `volume snapshot list` | `VolumeSnapshotListCommand` | [`volume_snapshot_list.go`](file:///d:/claude/nomad/command/volume_snapshot_list.go) | `Volumes().ListSnapshots()` + 表格 |
| `volume claim` | `VolumeClaimCommand` | [`volume_claim.go`](file:///d:/claude/nomad/command/volume_claim.go) | 父命令 |
| `volume claim list` | `VolumeClaimListCommand` | [`volume_claim_list.go`](file:///d:/claude/nomad/command/volume_claim_list.go) | `Volumes().ListClaims()` + 表格 |
| `volume claim delete` | `VolumeClaimDeleteCommand` | [`volume_claim_delete.go`](file:///d:/claude/nomad/command/volume_claim_delete.go) | `Volumes().DeleteClaim()` |

---

## 3. Windows 平台专属命令（4 条）

注册位置：[`commands.go:1351-1370`](file:///d:/claude/nomad/command/commands.go#L1351-L1370)（`runtime.GOOS == "windows"` 条件注入）

| 命令 | 结构体 | 实现文件 | 实现技术 |
|---|---|---|---|
| `windows` | `WindowsCommand` | [`windows.go`](file:///d:/claude/nomad/command/windows.go) | 父命令 |
| `windows service` | `WindowsServiceCommand` | [`windows_service.go`](file:///d:/claude/nomad/command/windows_service.go) | 父命令 |
| `windows service install` | `WindowsServiceInstallCommand` | [`windows_service_install.go`](file:///d:/claude/nomad/command/windows_service_install.go) | 注册 Windows 服务（golang.org/x/sys/windows/svc/mgr） |
| `windows service uninstall` | `WindowsServiceUninstallCommand` | [`windows_service_uninstall.go`](file:///d:/claude/nomad/command/windows_service_uninstall.go) | 卸载 Windows 服务 |

---

## 4. 弃用命令别名（4 条）

注册位置：[`commands.go:1373-1411`](file:///d:/claude/nomad/command/commands.go#L1373-L1411)（`deprecated` map，通过 `DeprecatedCommand` 包装）

实现技术：使用 `DeprecatedCommand` 包装器，执行前打印警告，转发调用到新命令的实现。

| 弃用命令 | 新命令 | 包装的实现 | 文件 |
|---|---|---|---|
| `client-config` | `node config` | `NodeConfigCommand` | [`commands.go:1375-1384`](file:///d:/claude/nomad/command/commands.go#L1375-L1384) |
| `server-force-leave` | `server force-leave` | `ServerForceLeaveCommand` | [`commands.go:1386-1395`](file:///d:/claude/nomad/command/commands.go#L1386-L1395) |
| `server-join` | `server join` | `ServerJoinCommand` | [`commands.go:1397-1406`](file:///d:/claude/nomad/command/commands.go#L1397-L1406) |
| `server-members` | `server members` | `ServerMembersCommand` | [`commands.go:1408-1417`](file:///d:/claude/nomad/command/commands.go#L1408-L1417) |

`DeprecatedCommand` 包装器实现（[`commands.go:33-67`](file:///d:/claude/nomad/command/commands.go#L33-L67)）：

```go
type DeprecatedCommand struct {
    cli.Command
    Meta
    Old, New string
}

func (c *DeprecatedCommand) Run(args []string) int {
    c.warn()  // 打印弃用警告
    return c.Command.Run(args)  // 转发到实际实现
}
```

---

## 5. 企业版命令注入

### 5.1 CE 版本占位实现

注册位置：[`command/commands_ce.go`](file:///d:/claude/nomad/command/commands_ce.go)

```go
//go:build !ent

func EntCommands(metaPtr *Meta, agentUi cli.Ui) map[string]cli.CommandFactory {
    return map[string]cli.CommandFactory{}  // 空实现
}
```

### 5.2 企业版注入点

注册位置：[`commands.go:1421-1423`](file:///d:/claude/nomad/command/commands.go#L1421-L1423)

```go
for k, v := range EntCommands(metaPtr, agentUi) {
    all[k] = v
}
```

企业版通过 `//go:build ent` 标签提供 `EntCommands` 实现，注入企业专属命令（如 multi-region、namespaces 扩展等），CE 版本为空 map。

---

## 6. 命令隐藏与别名机制

### 6.1 隐藏命令（hidden）

定义位置：[`main.go:24-44`](file:///d:/claude/nomad/main.go#L24-L44)

```go
hidden = []string{
    "alloc-status", "check", "client-config", "debug", "eval-status",
    "executor", "logmon", "node-drain", "node-status",
    "server-force-leave", "server-join", "server-members",
    "syslog", "docker_logger",
    "operator raft _info", "operator raft _logs", "operator raft _state",
    "operator snapshot _state", "template-render",
}
```

通过 `cli.CLI.HiddenCommands` 字段传入，框架自动从 help 和 autocomplete 中过滤。

### 6.2 别名（aliases）

定义位置：[`main.go:46-53`](file:///d:/claude/nomad/main.go#L46-L53)

```go
aliases = []string{
    "fs", "init", "inspect", "logs", "plan", "validate",
}
```

这些命令在 help 中隐藏，但保留 autocomplete 支持。`groupedHelpFunc` 在输出 "Other commands" 时排除 common 和 aliases。

### 6.3 常用命令（commonCommands）

定义位置：[`main.go:55-63`](file:///d:/claude/nomad/main.go#L55-L63)

```go
commonCommands = []string{
    "run", "stop", "status", "alloc", "job", "node", "agent",
}
```

在 `groupedHelpFunc` 中单独分组输出，突出常用操作。

---

## 7. 实现技术分类

### 7.1 父命令（无 Run 实现）

仅实现 `Help()` 和 `Synopsis()`，作为命令分组入口：

```go
type JobCommand struct{ Meta }
func (c *JobCommand) Run(args []string) int { return 0 }  // 不执行
```

涉及的父命令：`acl`, `acl auth-method`, `acl binding-rule`, `acl policy`, `acl role`, `acl token`, `alloc`, `config`, `deployment`, `eval`, `job`, `job periodic`, `job tag`, `license`, `namespace`, `node`, `node identity`, `node intro`, `node meta`, `node pool`, `operator`, `operator autopilot`, `operator gossip`, `operator gossip keyring`, `operator raft`, `operator scheduler`, `operator root`, `operator root keyring`, `operator snapshot`, `plugin`, `quota`, `recommendation`, `scaling`, `scaling policy`, `sentinel`, `server`, `service`, `setup`, `system`, `system reconcile`, `tls`, `tls ca`, `tls cert`, `var`, `volume`, `volume snapshot`, `volume claim`, `windows`, `windows service`。

### 7.2 标准 API 调用模式

绝大多数命令遵循统一模式：

```go
func (c *XXXCommand) Run(args []string) int {
    // 1. FlagSet 解析
    flags := c.Meta.FlagSet(c.Name(), FlagSetClient)
    flags.StringVar(&detach, "detach", false, "")
    flags.Parse(args)

    // 2. 参数校验
    args = flags.Args()
    if len(args) < 1 { c.Ui.Error("..."); return 1 }

    // 3. 前缀搜索（可选，针对 ID 类参数）
    if len(args) == 1 && !strings.Contains(args[0], "-") {
        list, _, _ := client.Search().PrefixSearch(args[0], contexts.XXX, nil)
        if len(list) == 1 { args[0] = list[0] }
    }

    // 4. API 调用
    client, err := c.Meta.Client()
    result, _, err := client.XXX().YYY(...)

    // 5. 输出（Format 或表格）
    if format == "json" { outputJSON(result) } else { outputTable(result) }
    return 0
}
```

### 7.3 JobGetter 嵌入模式

涉及 jobspec 解析的命令嵌入 `JobGetter`：

| 命令 | JobGetter 用途 |
|---|---|
| `job run` / `run` | 读取 + 解析 + 提交 |
| `job plan` / `plan` | 读取 + 解析 + dry-run |
| `job validate` / `validate` | 读取 + 解析 + 校验 |
| `job action` / `action` | 读取 + 解析 + 带 action 提交 |
| `job dispatch` | 读取参数化作业 |
| `acl policy apply` | 读取策略文件 |
| `acl auth-method create/update` | 读取 JSON/HCL 配置 |
| `acl binding-rule create/update` | 读取 JSON/HCL 配置 |
| `acl role create/update` | 读取 JSON/HCL 配置 |
| `namespace apply` | 读取 JSON/HCL 配置 |
| `node pool apply` | 读取 JSON/HCL 配置 |
| `quota apply` | 读取 JSON/HCL 配置 |
| `var put` | 读取变量数据 |
| `volume register` / `volume create` | 读取卷声明 |

### 7.4 流式命令

| 命令 | 流式机制 | API |
|---|---|---|
| `alloc logs` / `logs` | HTTP Streaming | `Allocations().Logs()` 返回 `io.ReadCloser` |
| `alloc fs` / `fs` | HTTP Streaming | `Allocations().Stream()` 持续读取 |
| `alloc exec` / `exec` | WebSocket | `Allocations().Exec()` 双向帧 |
| `monitor` | HTTP Streaming | `Agent().Monitor()` 持续日志流 |
| `operator snapshot save` | HTTP Streaming | `Operator().Snapshot()` 流式下载 |
| `operator debug` | 多 API 采集 | 聚合调用多个端点 |

### 7.5 本地命令（无 API 调用）

| 命令 | 实现技术 |
|---|---|
| `job init` / `init` | 内嵌模板写入文件 |
| `node pool init` | 内嵌模板写入文件 |
| `quota init` | 内嵌模板写入文件 |
| `var init` | 内嵌模板写入文件 |
| `volume init` | 内嵌模板写入文件 |
| `fmt` | HCL 格式化库 |
| `tls ca create` | 本地 CA 证书生成 |
| `tls cert create` | 本地证书签发 |
| `tls ca info` | 本地证书解析 |
| `tls cert info` | 本地证书解析 |
| `version` | 输出编译时版本信息 |
| `operator gossip keyring generate` | 本地随机密钥生成 |
| `operator snapshot inspect` | 本地快照文件读取 |
| `config validate` | HCL 解析校验 |

### 7.6 交互式命令

| 命令 | 交互机制 |
|---|---|
| `login` | 启动本地 HTTP 服务器 + 浏览器打开 OIDC provider + 回调交换 token |
| `setup consul` / `setup vault` | 终端问答式配置生成 |
| `node drain` / `node eligibility` | 确认提示（除非 `-yes`） |
| `job stop` | 确认提示（除非 `-yes`） |
| `alloc stop` | 确认提示（除非 `-yes`） |

### 7.7 Eval Monitor 模式

变更类命令在非 `-detach` 模式下监控 evaluation：

| 命令 | 调用 |
|---|---|
| `job run` / `run` | `newMonitor().monitor(evalID)` 轮询直到 complete |
| `job stop` / `stop` | 同上 |
| `job eval` | 同上 |

Monitor 实现（[`command/monitor.go`](file:///d:/claude/nomad/command/monitor.go)）：每秒轮询 `Evaluations().Info()` 和 `Allocations()`，输出调度日志直到 eval 状态为 `complete` 或 `failed`。

---

## 8. 命令注册统计

### 8.1 按注册来源

| 来源 | 数量 | 说明 |
|---|---|---|
| 主命令表 | 250 | `commands.go` 中 `all` map 初始值 |
| Windows 专属 | 4 | `runtime.GOOS == "windows"` 条件注入 |
| 弃用别名 | 4 | `deprecated` map 经 `DeprecatedCommand` 包装 |
| 企业版（CE） | 0 | `EntCommands()` 返回空 map |
| **总计（CE）** | **258** | |

### 8.2 按功能分类

| 分类 | 数量 | 涉及命令组 |
|---|---|---|
| 父命令（仅 Help） | ~45 | 各命令组的顶层 |
| 查询类（List/Info/Status） | ~50 | `* list`, `* info`, `* status` |
| 变更类（Create/Apply/Delete） | ~70 | `* create`, `* apply`, `* delete`, `* run`, `* stop` |
| 流式类 | ~6 | logs, fs, exec, monitor, snapshot save |
| 本地类（无 API） | ~14 | init, fmt, tls, version |
| 别名类 | ~10 | run, stop, status, fs, init, inspect, logs, plan, validate, exec |

---

## 9. 关键代码位置索引

### 9.1 注册相关

| 位置 | 内容 |
|---|---|
| [`commands.go:80`](file:///d:/claude/nomad/command/commands.go#L80) | `Commands()` 函数定义 |
| [`commands.go:82-1345`](file:///d:/claude/nomad/command/commands.go#L82-L1345) | 主命令表 `all` map 字面量 |
| [`commands.go:1349-1371`](file:///d:/claude/nomad/command/commands.go#L1349-L1371) | Windows 命令条件注入 |
| [`commands.go:1373-1411`](file:///d:/claude/nomad/command/commands.go#L1373-L1411) | `deprecated` map 定义 |
| [`commands.go:1413-1415`](file:///d:/claude/nomad/command/commands.go#L1413-L1415) | 合并弃用命令 |
| [`commands.go:1417-1419`](file:///d:/claude/nomad/command/commands.go#L1417-L1419) | 合并企业命令 |
| [`commands.go:1421`](file:///d:/claude/nomad/command/commands.go#L1421) | 返回 `all` |
| [`commands_ce.go:11`](file:///d:/claude/nomad/command/commands_ce.go#L11) | CE 版 `EntCommands` 空实现 |

### 9.2 入口相关

| 位置 | 内容 |
|---|---|
| [`main.go:66`](file:///d:/claude/nomad/main.go#L66) | `main()` 函数 |
| [`main.go:71`](file:///d:/claude/nomad/main.go#L71) | `Run()` 函数 |
| [`main.go:80-96`](file:///d:/claude/nomad/main.go#L80-L96) | `cli.CLI` 构造 |
| [`main.go:120`](file:///d:/claude/nomad/main.go#L120) | `groupedHelpFunc` 定义 |
| [`main.go:24-44`](file:///d:/claude/nomad/main.go#L24-L44) | `hidden` 列表 |
| [`main.go:46-53`](file:///d:/claude/nomad/main.go#L46-L53) | `aliases` 列表 |
| [`main.go:55-63`](file:///d:/claude/nomad/main.go#L55-L63) | `commonCommands` 列表 |

### 9.3 共享基础设施

| 文件 | 作用 |
|---|---|
| [`command/meta.go`](file:///d:/claude/nomad/command/meta.go) | `Meta` 基类：`Client()`、`FlagSet()`、`Colorize()`、UI |
| [`command/helpers.go`](file:///d:/claude/nomad/command/helpers.go) | `JobGetter`、前缀搜索、ID 解析等通用工具 |
| [`command/data_format.go`](file:///d:/claude/nomad/command/data_format.go) | JSON/Go template 输出格式化 |
| [`command/monitor.go`](file:///d:/claude/nomad/command/monitor.go) | Eval monitor 轮询实现 |

---

## 10. 设计要点

### 10.1 统一的 Meta 注入

所有命令通过嵌入 `Meta` 共享：
- `Client()` — 构造 `api.Client`，处理 address/region/namespace/token/TLS 配置
- `FlagSet(name, FlagSetClient)` — 标准化 flag 解析，自动添加 `-address`、`-region`、`-namespace`、`-token` 等
- `Ui` — 统一 UI 输出（带颜色支持）
- `Colorize()` — 颜色化助手

### 10.2 工厂延迟实例化

使用 `cli.CommandFactory` 闭包而非直接实例：
- 避免启动时构造所有命令对象（性能）
- 支持 `cli.CLI` 的按需查找
- 闭包捕获共享 `meta`，保证一致性

### 10.3 多源合并策略

```
all := 主命令表
↓ +deprecated（包装 DeprecatedCommand）
↓ +windows（条件编译）
↓ +ent（构建标签切换）
```

通过 `maps.Copy` 和 for-range 合并，保证 CE/Ent/Windows 三种构建场景的命令集正确性。

### 10.4 命名约定

- 命令名：小写 + 空格分隔（`job run`、`acl token create`）
- 结构体：`PascalCase + Command`（`JobRunCommand`、`ACLTokenCreateCommand`）
- 文件名：`snake_case.go`（`job_run.go`、`acl_token_create.go`）
- 一一对应：结构体名 → 文件名（`JobRunCommand` → `job_run.go`）

### 10.5 构建标签隔离

- `//go:build !ent`（CE 版本）：`commands_ce.go` 返回空 `EntCommands`
- `//go:build ent`（企业版）：单独的 `commands_ent.go` 提供 `EntCommands` 实现
- `runtime.GOOS == "windows"`：运行时条件注入 Windows 专属命令

---

## 总结

Nomad CLI 通过 `command/commands.go` 的单一注册总表管理全部 258 条命令（CE 版）。注册机制采用：

1. **工厂模式**：`map[string]cli.CommandFactory` 延迟实例化
2. **Meta 注入**：所有命令共享 `Meta` 基类，统一 API 客户端与 UI
3. **多源合并**：主表 + Windows 条件 + 弃用包装 + 企业注入
4. **分类隐藏**：`hidden`/`aliases`/`commonCommands` 三级 help 可见性
5. **构建隔离**：CE/Ent 通过 `//go:build` 标签切换 `EntCommands` 实现

每条命令的实现文件遵循 `struct_name.go` 命名约定，与结构体一一对应，便于定位。命令实现技术涵盖标准 API 调用、JobGetter 解析、HTTP 流式、WebSocket、本地操作、OIDC 登录等多种模式。