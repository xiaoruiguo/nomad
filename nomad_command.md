# Nomad command/ 目录分析

本文档分析 [`command/`](file:///d:/claude/nomad/command) 目录的核心入口文件作用、每个命令的职责以及调用的 API 资源。

---

## 1. 核心入口文件

### 1.1 [`commands.go`](file:///d:/claude/nomad/command/commands.go) — 命令注册总表
- **作用**：定义 `Commands(meta *Meta, agentUi cli.Ui) map[string]cli.CommandFactory`，将所有子命令名（如 `"job run"`、`"node status"`）映射到对应的 `cli.CommandFactory`。
- **关键设计**：
  - 命令以扁平 map 注册，支持空格分隔的多级命令名（如 `acl policy apply`）
  - 提供 deprecated alias（如 `alloc-status` → `alloc status`）和顶层 alias（如 `fs` → `alloc fs`、`init` → `job init`）
  - 每个命令都嵌入 `Meta` 结构体以复用 API client、UI、flag 解析逻辑

### 1.2 [`meta.go`](file:///d:/claude/nomad/command/meta.go) — 命令公共基类
- **作用**：定义 `Meta` 结构体，所有命令通过嵌入获得：
  - `Client() (*api.Client, error)` — 构造 [`api.Client`](file:///d:/claude/nomad/api/api.go)
  - `FlagSet(name, flags)` — 标准化 flag 集（`-address`/`-region`/`-namespace`/`-token`/TLS 选项等）
  - `Colorize()`、`askQuestion()`、`JobByPrefix()` 等工具方法
  - UI hint 路由表 `CommandUIRoutes`（命令 → Web UI 路径映射，如 `job status` → `/jobs/:jobID@:namespace`）
- **配置来源**：CLI flag > 环境变量（`NOMAD_ADDR`/`NOMAD_REGION`/`NOMAD_NAMESPACE`/`NOMAD_TOKEN`/`NOMAD_CACERT`…）> 默认值

### 1.3 [`agent/command.go`](file:///d:/claude/nomad/command/agent/command.go) — Agent 进程入口
- **作用**：实现 `nomad agent` 命令，启动 Nomad Server/Client 进程
- **职责**：
  - 解析配置（HCL/JSON 文件 + CLI flag）
  - 初始化日志（hclog + syslog + gated writer）
  - 创建 `Agent` 对象，启动 HTTP+gRPC 服务
  - 信号处理（SIGINT/SIGTERM 优雅关闭）
  - 启动 checkpoint 版本检查
- **不调用 `api.Client`**：Agent 是被调方，自身实现 [`agent/http.go`](file:///d:/claude/nomad/command/agent/http.go) 中的 `/v1/*` HTTP 端点

### 1.4 [`helpers.go`](file:///d:/claude/nomad/command/helpers.go) — 跨命令工具
- **作用**：提供命令共享的工具函数，如：
  - `JobGetter` — 解析 jobspec 文件（HCL/JSON）为 `*api.Job`
  - `JobPredictor` / `NamespacePredictor` — shell 自动补全
  - 输出格式化（table/json/template）

---

## 2. 命令分类与 API 调用

所有命令通过 `Meta.Client()` 获取 `*api.Client`，再调用其资源方法（对应 HTTP `/v1/*` 端点）。下表按业务域分组。

### 2.1 Job 命令组（`job *`）

| 命令 | 文件 | 作用 | 调用的 API（`client.X().Y()`） |
|---|---|---|---|
| `job run` | [`job_run.go`](file:///d:/claude/nomad/command/job_run.go) | 注册/更新 Job，进入 eval 监控 | `Jobs().RegisterOpts()` |
| `job status` | [`job_status.go`](file:///d:/claude/nomad/command/job_status.go) | 查询 Job 状态（含 allocs/evals/deployments） | `Jobs().List()` / `Jobs().Info()` / `Jobs().Allocations()` / `Jobs().Evaluations()` / `Jobs().LatestDeployment()` / `Jobs().Summary()` / `Evaluations().Info()` |
| `job inspect` | [`job_inspect.go`](file:///d:/claude/nomad/command/job_inspect.go) | 输出 Job 完整 JSON | `Jobs().Info()` |
| `job plan` | [`job_plan.go`](file:///d:/claude/nomad/command/job_plan.go) | 干跑调度计划（不实际提交） | `Jobs().Plan()` |
| `job validate` | [`job_validate.go`](file:///d:/claude/nomad/command/job_validate.go) | 校验 jobspec | `Jobs().Validate()` |
| `job stop` | [`job_stop.go`](file:///d:/claude/nomad/command/job_stop.go) | 停止 Job | `Jobs().Deregister()` |
| `job start` | [`job_start.go`](file:///d:/claude/nomad/command/job_start.go) | 恢复已停止的 Job | `Jobs().Restart()` 或 `Jobs().Start()` |
| `job allocs` | [`job_allocs.go`](file:///d:/claude/nomad/command/job_allocs.go) | 列出 Job 的 allocations | `Jobs().Allocations()` |
| `job deployments` | [`job_deployments.go`](file:///d:/claude/nomad/command/job_deployments.go) | 列出 Job 的 deployments | `Jobs().Deployments()` |
| `job history` | [`job_history.go`](file:///d:/claude/nomad/command/job_history.go) | Job 版本历史 | `Jobs().Versions()` |
| `job eval` | [`job_eval.go`](file:///d:/claude/nomad/command/job_eval.go) | 为 Job 创建新 evaluation | `Jobs().ForceEvaluate()` |
| `job promote` | [`job_promote.go`](file:///d:/claude/nomad/command/job_promote.go) | 提升 canary | `Jobs().Promote()` |
| `job revert` | [`job_revert.go`](file:///d:/claude/nomad/command/job_revert.go) | 回滚到旧版本 | `Jobs().Revert()` |
| `job dispatch` | [`job_dispatch.go`](file:///d:/claude/nomad/command/job_dispatch.go) | 派发 parameterized job | `Jobs().Dispatch()` |
| `job scale` | [`job_scale.go`](file:///d:/claude/nomad/command/job_scale.go) | 调整 task group count | `Jobs().Scale()` |
| `job scaling-events` | [`job_scaling_events.go`](file:///d:/claude/nomad/command/job_scaling_events.go) | 查询 scaling 事件 | `Jobs().ScaleStatus()` |
| `job restart` | [`job_restart.go`](file:///d:/claude/nomad/command/job_restart.go) | 批量重启 alloc/task | `Jobs().Restart()` / `Allocations().Restart()` |
| `job periodic force` | [`job_periodic_force.go`](file:///d:/claude/nomad/command/job_periodic_force.go) | 手动触发 periodic job | `Jobs().PeriodicForce()` |
| `job action` | [`job_action.go`](file:///d:/claude/nomad/command/job_action.go) | 执行自定义 action | `Jobs().Action()` |
| `job tag apply/unset` | [`job_tag_apply.go`](file:///d:/claude/nomad/command/job_tag_apply.go) | 管理 Job tag | `Jobs().UpdateTags()` |
| `job init` | [`job_init.go`](file:///d:/claude/nomad/command/job_init.go) | 生成示例 jobspec（本地，无 API） | 无（写入 `asset.JobExample`） |

### 2.2 Alloc 命令组（`alloc *`）

| 命令 | 文件 | 作用 | 调用的 API |
|---|---|---|---|
| `alloc status` | [`alloc_status.go`](file:///d:/claude/nomad/command/alloc_status.go) | 查询 alloc 详情（含 stats/checks） | `Search().PrefixSearch()` / `Allocations().List()` / `Allocations().PrefixList()` / `Allocations().Info()` / `Allocations().Stats()` / `Allocations().Checks()` / `Evaluations().Info()` / `CSIVolumes().Info()` |
| `alloc fs` | [`alloc_fs.go`](file:///d:/claude/nomad/command/alloc_fs.go) | 浏览 alloc 文件系统 | `Allocations().FS()` / `Allocations().List()` |
| `alloc logs` | [`alloc_logs.go`](file:///d:/claude/nomad/command/alloc_logs.go) | 流式读取 task 日志 | `Allocations().Logs()` |
| `alloc exec` | [`alloc_exec.go`](file:///d:/claude/nomad/command/alloc_exec.go) | 在 task 内执行命令 | `Allocations().Exec()` |
| `alloc restart` | [`alloc_restart.go`](file:///d:/claude/nomad/command/alloc_restart.go) | 重启 alloc/task | `Allocations().Restart()` |
| `alloc stop` | [`alloc_stop.go`](file:///d:/claude/nomad/command/alloc_stop.go) | 停止 alloc | `Allocations().Stop()` |
| `alloc signal` | [`alloc_signal.go`](file:///d:/claude/nomad/command/alloc_signal.go) | 发送信号 | `Allocations().Signal()` |
| `alloc pause` | [`alloc_pause.go`](file:///d:/claude/nomad/command/alloc_pause.go) | 暂停/恢复 task | `Allocations().Pause()` |
| `alloc checks` | [`alloc_checks.go`](file:///d:/claude/nomad/command/alloc_checks.go) | 查看 service check 状态 | `Allocations().Checks()` |

### 2.3 Node 命令组（`node *`）

| 命令 | 文件 | 作用 | 调用的 API |
|---|---|---|---|
| `node status` | [`node_status.go`](file:///d:/claude/nomad/command/node_status.go) | 列出/查看节点状态 | `Search().PrefixSearch()` / `Nodes().List()` / `Nodes().PrefixList()` / `Nodes().Info()` / `Nodes().Allocations()` / `Nodes().Stats()` / `Nodes().CSIVolumes()` / `Allocations().Stats()` |
| `node drain` | [`node_drain.go`](file:///d:/claude/nomad/command/node_drain.go) | 启用/关闭 drain | `Nodes().ToggleDrain()` |
| `node eligibility` | [`node_eligibility.go`](file:///d:/claude/nomad/command/node_eligibility.go) | 切换调度资格 | `Nodes().ToggleEligibility()` |
| `node config` | [`node_config.go`](file:///d:/claude/nomad/command/node_config.go) | 读写节点元数据 | `Nodes().Config()` |
| `node meta apply/read` | [`node_meta_apply.go`](file:///d:/claude/nomad/command/node_meta_apply.go) | 节点 meta 管理 | `NodeMeta().Apply()` / `NodeMeta().Read()` |
| `node identity get/renew` | [`node_identity_get.go`](file:///d:/claude/nomad/command/node_identity_get.go) | 节点身份令牌 | `NodeIdentity().Get()` / `NodeIdentity().Renew()` |
| `node intro create` | [`node_intro_create.go`](file:///d:/claude/nomad/command/node_intro_create.go) | 创建节点 intro token | `Nodes().IntroCreate()` |
| `node pool *` | [`node_pool_apply.go`](file:///d:/claude/nomad/command/node_pool_apply.go) 等 | NodePool CRUD | `NodePools().Apply()` / `Delete()` / `Info()` / `List()` / `Nodes()` / `Jobs()` |
| `node pool init` | [`node_pool_init.go`](file:///d:/claude/nomad/command/node_pool_init.go) | 生成 NodePool 示例配置（本地） | 无 |

### 2.4 Eval 命令组（`eval *`）

| 命令 | 文件 | 作用 | 调用的 API |
|---|---|---|---|
| `eval list` | [`eval_list.go`](file:///d:/claude/nomad/command/eval_list.go) | 列出 evaluations | `Evaluations().List()` |
| `eval status` | [`eval_status.go`](file:///d:/claude/nomad/command/eval_status.go) | 查看 eval 详情及放置结果 | `Search().PrefixSearch()` / `Evaluations().PrefixList()` / `Evaluations().Info()` / `Evaluations().Allocations()` |
| `eval delete` | [`eval_delete.go`](file:///d:/claude/nomad/command/eval_delete.go) | 删除 eval | `Evaluations().Delete()` |

### 2.5 Deployment 命令组（`deployment *`）

| 命令 | 文件 | 作用 | 调用的 API |
|---|---|---|---|
| `deployment list` | [`deployment_list.go`](file:///d:/claude/nomad/command/deployment_list.go) | 列出 deployments | `Deployments().List()` |
| `deployment status` | [`deployment_status.go`](file:///d:/claude/nomad/command/deployment_status.go) | 查看 deployment 详情 | `Search().PrefixSearch()` / `Deployments().List()` / `Deployments().Info()` / `Deployments().Allocations()` / `Jobs().LatestDeployment()` |
| `deployment pause/resume` | [`deployment_pause.go`](file:///d:/claude/nomad/command/deployment_pause.go) | 暂停/恢复 | `Deployments().Pause()` |
| `deployment promote` | [`deployment_promote.go`](file:///d:/claude/nomad/command/deployment_promote.go) | 提升 canary | `Deployments().Promote()` |
| `deployment fail` | [`deployment_fail.go`](file:///d:/claude/nomad/command/deployment_fail.go) | 标记失败 | `Deployments().Fail()` |
| `deployment unblock` | [`deployment_unblock.go`](file:///d:/claude/nomad/command/deployment_unblock.go) | 解除阻塞 | `Deployments().Unblock()` |

### 2.6 ACL 命令组（`acl *`）

| 命令 | 文件 | 作用 | 调用的 API |
|---|---|---|---|
| `acl bootstrap` | [`acl_bootstrap.go`](file:///d:/claude/nomad/command/acl_bootstrap.go) | 初始化 ACL 系统，获得首个管理 token | `ACLTokens().BootstrapOpts()` |
| `acl token create/delete/info/list/self/update` | `acl_token_*.go` | Token CRUD | `ACLTokens().Create()` / `Delete()` / `Info()` / `List()` / `Self()` / `Update()` |
| `acl policy apply/delete/info/list/self` | `acl_policy_*.go` | Policy CRUD | `ACLPolicies().Upsert()` / `Delete()` / `Info()` / `List()` |
| `acl role create/delete/info/list/update` | `acl_role_*.go` | Role CRUD | `ACLRoles().Create()` / `Delete()` / `Info()` / `List()` / `Update()` |
| `acl auth-method *` | `acl_auth_method_*.go` | OIDC/SAML 认证方法管理 | `ACLAuthMethods().Create()` / `Delete()` / `Info()` / `List()` / `Update()` |
| `acl binding-rule *` | `acl_binding_rule_*.go` | 绑定规则管理 | `ACLRoles().CreateBindingRule()` 等 |

### 2.7 Namespace 命令组（`namespace *`）

| 命令 | 文件 | 作用 | 调用的 API |
|---|---|---|---|
| `namespace list` | [`namespace_list.go`](file:///d:/claude/nomad/command/namespace_list.go) | 列出 namespaces | `Namespaces().List()` |
| `namespace inspect/status` | [`namespace_inspect.go`](file:///d:/claude/nomad/command/namespace_inspect.go) | 查看 namespace | `Namespaces().Info()` |
| `namespace apply` | [`namespace_apply.go`](file:///d:/claude/nomad/command/namespace_apply.go) | 创建/更新 namespace | `Namespaces().Upsert()` |
| `namespace delete` | [`namespace_delete.go`](file:///d:/claude/nomad/command/namespace_delete.go) | 删除 namespace | `Namespaces().Delete()` |

### 2.8 Volume 命令组（`volume *`）

| 命令 | 文件 | 作用 | 调用的 API |
|---|---|---|---|
| `volume status` | [`volume_status_csi.go`](file:///d:/claude/nomad/command/volume_status_csi.go) / [`volume_status_host.go`](file:///d:/claude/nomad/command/volume_status_host.go) | 查询 CSI/Host volume | `CSIVolumes().List()` / `CSIVolumes().Info()` / `CSIVolumes().ListExternal()` / `CSIPlugins().List()` / `HostVolumes().List()` |
| `volume register` | [`volume_register_csi.go`](file:///d:/claude/nomad/command/volume_register_csi.go) / [`volume_register_host.go`](file:///d:/claude/nomad/command/volume_register_host.go) | 注册 volume | `CSIVolumes().RegisterOpts()` / `HostVolumes().Register()` |
| `volume create` | [`volume_create_csi.go`](file:///d:/claude/nomad/command/volume_create_csi.go) / [`volume_create_host.go`](file:///d:/claude/nomad/command/volume_create_host.go) | 动态创建 volume | `CSIVolumes().Create()` / `HostVolumes().Create()` |
| `volume deregister/delete/detach` | `volume_deregister.go` 等 | 注销/删除/解绑 | `CSIVolumes().Deregister()` / `Delete()` / `Detach()` |
| `volume snapshot create/delete/list` | `volume_snapshot_*.go` | CSI 快照管理 | `CSIVolumes().CreateSnapshot()` 等 |
| `volume claim list/delete` | `volume_claim_list.go` 等 | Host volume claim 管理 | `HostVolumeClaims().List()` / `Delete()` |
| `volume init` | [`volume_init.go`](file:///d:/claude/nomad/command/volume_init.go) | 生成 volume 示例配置（本地） | 无 |

### 2.9 Plugin 命令组（`plugin *`）

| 命令 | 文件 | 作用 | 调用的 API |
|---|---|---|---|
| `plugin status` | [`plugin_status_csi.go`](file:///d:/claude/nomad/command/plugin_status_csi.go) | 查询 CSI plugin 状态 | `CSIPlugins().List()` / `CSIPlugins().Info()` |

### 2.10 Operator 命令组（`operator *`）

| 命令 | 文件 | 作用 | 调用的 API |
|---|---|---|---|
| `operator api` | [`operator_api.go`](file:///d:/claude/nomad/command/operator_api.go) | 直接调用任意 HTTP API（curl 风格） | `http.NewRequest()` 原生 HTTP（不走 `api.Client` 封装） |
| `operator autopilot get-config` | [`operator_autopilot_get.go`](file:///d:/claude/nomad/command/operator_autopilot_get.go) | 查看 Autopilot 配置 | `Operator().AutopilotGetConfiguration()` |
| `operator autopilot set-config` | `operator_autopilot_set.go` | 更新 Autopilot 配置 | `Operator().AutopilotSetConfiguration()` |
| `operator autopilot health` | `operator_autopilot_health.go` | 集群健康状态 | `Operator().AutopilotState()` |
| `operator raft list-peers` | `operator_raft_list.go` | Raft 节点列表 | `Operator().RaftGetConfiguration()` |
| `operator raft remove-peer` | `operator_raft_remove.go` | 移除 Raft peer | `Operator().RaftRemovePeerByAddress()` / `RaftRemovePeerByID()` |
| `operator raft transfer-leadership` | `operator_raft_transfer_leadership.go` | 转移 Leader | `Operator().LeadershipTransfer()` |
| `operator raft info/logs/state` | `operator_raft_*.go` | Raft 内部诊断 | `Operator().RaftInfo()` 等 |
| `operator scheduler get/set-config` | `operator_scheduler_*.go` | 调度器配置 | `Operator().SchedulerGetConfiguration()` / `SchedulerSetConfiguration()` |
| `operator metrics` | `operator_metrics.go` | 拉取 metrics | `Operator().Metrics()` |
| `operator debug` | `operator_debug.go` | 采集诊断 bundle | 多 API 综合 |
| `operator root keyring *` | `operator_root_keyring.go` | 加密根密钥管理 | `Operator().KeyringRPCList()` 等 |
| `operator gossip keyring *` | `operator_gossip_keyring_*.go` | Serf gossip 密钥管理 | `Operator().GossipKeyringRPC*` |
| `operator client-state` | `operator_client_state.go` | 客户端状态导出 | `Operator().ClientState*` |

### 2.11 变量命令组（`var *`）

| 命令 | 文件 | 作用 | 调用的 API |
|---|---|---|---|
| `var get` | [`var_get.go`](file:///d:/claude/nomad/command/var_get.go) | 读取变量 | `Variables().Read()` |
| `var list` | `var_list.go` | 列出变量 | `Variables().List()` |
| `var put` | `var_put.go` | 写入变量（支持 CAS） | `Variables().Put()` |
| `var delete` | `var_delete.go` | 删除变量 | `Variables().Delete()` |
| `var lock` | `var_lock.go` | 加锁读 | `Variables().Lock()` |
| `var init` | `var_init.go` | 生成示例（本地） | 无 |

### 2.12 其他顶层命令

| 命令 | 文件 | 作用 | 调用的 API |
|---|---|---|---|
| `agent` | [`agent/command.go`](file:///d:/claude/nomad/command/agent/command.go) | 启动 Nomad agent 进程（Server/Client） | 自身实现 `/v1/*` 端点，不消费 API |
| `agent-info` | [`agent_info.go`](file:///d:/claude/nomad/command/agent_info.go) | 查看 agent 自身信息 | `Agent().Self()` |
| `agent monitor` | `agent_monitor.go` | 流式查看 agent 日志 | `Agent().Monitor()` |
| `agent monitor export` | `agent_monitor_export.go` | 导出 monitor 日志 | `Agent().MonitorExport()` |
| `login` | [`login.go`](file:///d:/claude/nomad/command/login.go) | OIDC 登录获取 token | `ACLAuthMethods().List()` / `ACLAuth().GetAuthURL()` / `ACLAuth().CompleteAuth()` / `ACLAuth().Login()` |
| `check` | `check.go` | Consul/Nomad service check | `Agent().Checks()` |
| `config validate` | [`config_validate.go`](file:///d:/claude/nomad/command/config_validate.go) | 校验 agent 配置文件（本地） | 无 |
| `fmt` | [`fmt.go`](file:///d:/claude/nomad/command/fmt.go) | 格式化 jobspec HCL（本地） | 无（用 HCL parser） |
| `monitor` | `monitor.go` | 流式查看 eval 日志 | `Agent().Monitor()` |
| `metrics` | `metrics.go` | 输出 agent metrics | `Agent().Metrics()` |
| `license get` | `license_get.go` | 获取企业 license | `Operator().LicenseGet()` |
| `action` | `action.go` | 远程 action 执行 | `Jobs().Action()` |
| `ui` | `ui.go` | 打开 Web UI（浏览器） | 无（仅构造 URL） |

---

## 3. Agent 子目录（HTTP API 服务端）

[`command/agent/`](file:///d:/claude/nomad/command/agent) 目录实现 Nomad agent 进程及其 HTTP API 服务端。以下是关键的 `*_endpoint.go` 文件，它们注册在 [`http.go`](file:///d:/claude/nomad/command/agent/http.go) 的路由表中，对应 `/v1/*` 端点：

| 文件 | 端点前缀 | 职责 |
|---|---|---|
| [`job_endpoint.go`](file:///d:/claude/nomad/command/agent/job_endpoint.go) | `/v1/jobs` | Job 注册/查询/列表 |
| [`alloc_endpoint.go`](file:///d:/claude/nomad/command/agent/alloc_endpoint.go) | `/v1/allocations` | Alloc 查询/Stats/Restart/Stop |
| [`eval_endpoint.go`](file:///d:/claude/nomad/command/agent/eval_endpoint.go) | `/v1/evaluations` | Eval 列表/详情/删除 |
| [`deployment_endpoint.go`](file:///d:/claude/nomad/command/agent/deployment_endpoint.go) | `/v1/deployments` | Deployment 状态/促进/失败 |
| [`node_endpoint.go`](file:///d:/claude/nomad/command/agent/node_endpoint.go) | `/v1/nodes` | 节点列表/详情/drain/eligibility |
| [`node_pool_endpoint.go`](file:///d:/claude/nomad/command/agent/node_pool_endpoint.go) | `/v1/node/pools` | NodePool CRUD |
| [`namespace_endpoint.go`](file:///d:/claude/nomad/command/agent/namespace_endpoint.go) | `/v1/namespaces` | Namespace CRUD |
| [`csi_endpoint.go`](file:///d:/claude/nomad/command/agent/csi_endpoint.go) | `/v1/volumes` `/v1/plugins` | CSI Volume/Plugin 管理 |
| [`host_volume_endpoint.go`](file:///d:/claude/nomad/command/agent/host_volume_endpoint.go) | `/v1/volumes/host` | Host Volume 管理 |
| [`acl_endpoint.go`](file:///d:/claude/nomad/command/agent/acl_endpoint.go) | `/v1/acl/*` | ACL Token/Policy/Role/AuthMethod |
| [`variable_endpoint.go`](file:///d:/claude/nomad/command/agent/variable_endpoint.go) | `/v1/vars` | Variables KV |
| [`operator_endpoint.go`](file:///d:/claude/nomad/command/agent/operator_endpoint.go) | `/v1/operator/*` | Raft/Autopilot/Scheduler/Debug |
| [`fs_endpoint.go`](file:///d:/claude/nomad/command/agent/fs_endpoint.go) | `/v1/client/fs` | Alloc 文件系统/日志/exec |
| [`metrics_endpoint.go`](file:///d:/claude/nomad/command/agent/metrics_endpoint.go) | `/v1/metrics` | Prometheus/json metrics |
| [`status_endpoint.go`](file:///d:/claude/nomad/command/agent/status_endpoint.go) | `/v1/status` | Leader/集群状态 |
| [`system_endpoint.go`](file:///d:/claude/nomad/command/agent/system_endpoint.go) | `/v1/system` | Raft 配置/升级 |
| [`search_endpoint.go`](file:///d:/claude/nomad/command/agent/search_endpoint.go) | `/v1/search` | 前缀搜索 |
| [`event_endpoint.go`](file:///d:/claude/nomad/command/agent/event_endpoint.go) | `/v1/event/stream` | 事件流 |
| [`region_endpoint.go`](file:///d:/claude/nomad/command/agent/region_endpoint.go) | `/v1/regions` | 区域列表 |
| [`scaling_endpoint.go`](file:///d:/claude/nomad/command/agent/scaling_endpoint.go) | `/v1/jobs/{id}/scale` | Job scaling |
| [`service_registration_endpoint.go`](file:///d:/claude/nomad/command/agent/service_registration_endpoint.go) | `/v1/services` | 服务注册查询 |
| [`keyring_endpoint.go`](file:///d:/claude/nomad/command/agent/keyring_endpoint.go) | `/v1/operator/keyring` | 加密根密钥 |
| [`node_identity_endpoint.go`](file:///d:/claude/nomad/command/agent/node_identity_endpoint.go) | `/v1/node/identity` | 节点身份令牌 |
| [`task_group_host_volume_claim_endpoint.go`](file:///d:/claude/nomad/command/agent/task_group_host_volume_claim_endpoint.go) | `/v1/volume/host/claim` | Host volume claim |
| [`agent_endpoint.go`](file:///d:/claude/nomad/command/agent/agent_endpoint.go) | `/v1/agent/*` | Agent 自身信息/monitor |
| [`meta_endpoint.go`](file:///d:/claude/nomad/command/agent/meta_endpoint.go) | `/v1/agent/host` | 主机元数据 |

---

## 4. 命令执行流程图

```
用户输入: nomad job run myjob.nomad
         │
         ▼
    main.go (Run)
         │
         ▼
    cli.CLI.Run()
         │
         │ 查表 commands.go["job run"]
         ▼
    JobRunCommand.Run(args)
         │
         │ 1. FlagSet 解析 -detach/-json/-output 等标志
         │ 2. JobGetter.ApiClient() 解析 jobspec 文件
         │ 3. Meta.Client() 构造 *api.Client（读取 NOMAD_ADDR/TOKEN）
         ▼
    api.Client.Jobs().RegisterOpts(job, opts, nil)
         │
         │ HTTP POST /v1/jobs
         ▼
    command/agent/http.go (HTTPServer)
         │
         │ 路由到 JobEndpoint.Register
         ▼
    nomad/ (Server) RPC: Job.Register
         │
         │ Raft Apply → FSM → 触发 Evaluation
         ▼
    scheduler/ 处理 eval → 产出 alloc
         │
         │ 推送给 client/
         ▼
    client/allocrunner 启动 task
```

---

## 5. 关键设计模式

### 5.1 Meta 嵌入模式
所有命令结构体嵌入 `Meta`，复用：
- `Client()` — 统一 API client 构造（含 TLS/region/namespace/token）
- `FlagSet()` — 标准化 flag 解析
- `Colorize()` — 终端着色
- `JobByPrefix()` — 前缀模糊匹配 Job

### 5.2 API 资源映射
`api.Client` 暴露的资源方法与 `/v1/*` 端点一一对应：

| `api.Client` 方法 | HTTP 端点 |
|---|---|
| `Jobs()` | `/v1/jobs` |
| `Allocations()` | `/v1/allocations` |
| `Nodes()` | `/v1/nodes` |
| `NodePools()` | `/v1/node/pools` |
| `Evaluations()` | `/v1/evaluations` |
| `Deployments()` | `/v1/deployments` |
| `Namespaces()` | `/v1/namespaces` |
| `CSIVolumes()` | `/v1/volumes` |
| `CSIPlugins()` | `/v1/plugins` |
| `HostVolumes()` | `/v1/volumes/host` |
| `ACLTokens()` / `ACLPolicies()` / `ACLRoles()` / `ACLAuthMethods()` | `/v1/acl/*` |
| `Variables()` | `/v1/vars` |
| `Operator()` | `/v1/operator/*` |
| `Agent()` | `/v1/agent/*` |
| `Search()` | `/v1/search` |
| `Regions()` | `/v1/regions` |
| `Status()` | `/v1/status` |
| `System()` | `/v1/system` |
| `Services()` | `/v1/services` |

### 5.3 Prefix Search 模式
多数"按 ID 查询"命令（`job status`/`alloc status`/`node status`/`eval status`/`deployment status`）采用统一的模糊匹配流程：
1. `client.Search().PrefixSearch(prefix, context, nil)` — 服务端前缀搜索
2. 若返回多匹配，报错并列出候选项
3. 若返回单匹配，用完整 ID 调用 `Info()`/`List()`

### 5.4 命令分组与 alias
- **多级命令**：`acl policy apply` 用空格分隔注册
- **历史 alias**：`alloc-status`（旧连字符形式）→ `alloc status`（新空格形式），通过 `DeprecatedCommand` 包装打印警告
- **顶层快捷 alias**：`run` → `job run`、`fs` → `alloc fs`、`init` → `job init`、`inspect` → `job inspect`、`logs` → `alloc logs`、`plan` → `job plan`

### 5.5 本地命令（不调用 API）
部分命令纯本地执行，不依赖运行中的 Nomad server：
- `job init` / `node pool init` / `volume init` / `var init` — 生成示例配置文件
- `fmt` — HCL 格式化（使用 `hclwrite`）
- `config validate` — 校验 agent 配置文件
- `ui` — 打开浏览器

---

## 6. 评估与建议

### 优势
- **统一入口**：所有命令通过 `commands.go` 集中注册，便于发现与维护
- **Meta 复用**：避免每个命令重复实现 flag 解析与 client 构造
- **API/CLI 对称**：`api.Client` 资源方法与 `/v1/*` 端点一一对应，CLI 命令基本是 API 的薄封装
- **Prefix Search 一致性**：跨命令的模糊匹配体验统一

### 关注点
- **`commands.go` 单文件 1400+ 行**：命令注册集中在单文件，建议按业务域拆分为 `commands_jobs.go`/`commands_acl.go` 等子文件
- **命令文件命名不统一**：部分用 `job_run.go`（业务_动作），部分用 `acl_token_create.go`（三层），建议统一为 `{域}_{子域}_{动作}.go`
- **Agent 目录与 CLI 目录混用**：`command/agent/` 既是 `nomad agent` 命令实现又是 HTTP 服务端，职责较重，可考虑独立为顶层 `agent/` 包
- **`operator api` 绕过 `api.Client`**：直接用 `http.NewRequest`，与其他命令的统一 client 模式不一致，主要为了支持任意 method/path
