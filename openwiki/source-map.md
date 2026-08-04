# Source Map

> 关键文件索引：按功能定位源码。

## 入口

| 功能 | 文件 |
|------|------|
| CLI 入口 | [main.go](../main.go) |
| 命令注册 | [command/commands.go](../command/commands.go) |
| Meta（共享 client） | [command/meta.go](../command/meta.go) |
| Agent 命令 | [command/agent/command.go](../command/agent/command.go) |
| Agent 主对象 | [command/agent/agent.go](../command/agent/agent.go) |
| HTTP server | [command/agent/http.go](../command/agent/http.go) |
| Config 解析 | [command/agent/config.go](../command/agent/config.go) + [config_parse.go](../command/agent/config_parse.go) |
| GNUmakefile | [GNUmakefile](../GNUmakefile) |
| 测试分组 | [ci/test-core.json](../ci/test-core.json) |

## Core Server (nomad/)

| 功能 | 文件 |
|------|------|
| Server 主对象 | [nomad/server.go](../nomad/server.go) |
| Leader 选举 + leaderLoop | [nomad/leader.go](../nomad/leader.go) |
| FSM 状态机 | [nomad/fsm.go](../nomad/fsm.go) |
| Raft 传输层 | [nomad/raft_rpc.go](../nomad/raft_rpc.go) |
| RPC 端点 | [nomad/rpc.go](../nomad/rpc.go) |
| Plan apply | [nomad/plan_apply.go](../nomad/plan_apply.go) |
| Plan queue | [nomad/plan_queue.go](../nomad/plan_queue.go) |
| Eval worker | [nomad/worker.go](../nomad/worker.go) |
| Heartbeat | [nomad/heartbeat.go](../nomad/heartbeat.go) |
| Serf gossip | [nomad/serf.go](../nomad/serf.go) |
| Autopilot | [nomad/autopilot.go](../nomad/autopilot.go) |
| 加密 | [nomad/encrypter.go](../nomad/encrypter.go) |
| Lock（TTL/delay） | [nomad/lock/](../nomad/lock/) |
| Peers 灾难恢复 | [nomad/peers/peers.go](../nomad/peers/peers.go) |
| Auth 鉴权 | [nomad/auth/](../nomad/auth/) |
| Stream broker | [nomad/stream/](../nomad/stream/) |
| Deployment watcher | [nomad/deploymentwatcher/](../nomad/deploymentwatcher/) |
| Drainer | [nomad/drainer/](../nomad/drainer/) |
| Volume watcher | [nomad/volumewatcher/](../nomad/volumewatcher/) |
| State store | [nomad/state/](../nomad/state/) |
| Structs（领域类型） | [nomad/structs/](../nomad/structs/) |

## HTTP 端点 (command/agent/)

| 端点 | 文件 |
|------|------|
| ACL | [acl_endpoint.go](../command/agent/acl_endpoint.go) |
| Agent | [agent_endpoint.go](../command/agent/agent_endpoint.go) |
| Alloc | [alloc_endpoint.go](../command/agent/alloc_endpoint.go) |
| CSI | [csi_endpoint.go](../command/agent/csi_endpoint.go) |
| Deployment | [deployment_endpoint.go](../command/agent/deployment_endpoint.go) |
| Eval | [eval_endpoint.go](../command/agent/eval_endpoint.go) |
| Event stream | [event_endpoint.go](../command/agent/event_endpoint.go) |
| Filesystem (fs) | [fs_endpoint.go](../command/agent/fs_endpoint.go) |
| Host volume | [host_volume_endpoint.go](../command/agent/host_volume_endpoint.go) |
| Job | [job_endpoint.go](../command/agent/job_endpoint.go) |
| Keyring | [keyring_endpoint.go](../command/agent/keyring_endpoint.go) |
| Metrics | [metrics_endpoint.go](../command/agent/metrics_endpoint.go) |
| Namespace | [namespace_endpoint.go](../command/agent/namespace_endpoint.go) |
| Node | [node_endpoint.go](../command/agent/node_endpoint.go) |
| Node identity | [node_identity_endpoint.go](../command/agent/node_identity_endpoint.go) |
| Node pool | [node_pool_endpoint.go](../command/agent/node_pool_endpoint.go) |
| Operator | [operator_endpoint.go](../command/agent/operator_endpoint.go) |
| Region | [region_endpoint.go](../command/agent/region_endpoint.go) |
| Scaling | [scaling_endpoint.go](../command/agent/scaling_endpoint.go) |
| Search | [search_endpoint.go](../command/agent/search_endpoint.go) |
| Service registration | [service_registration_endpoint.go](../command/agent/service_registration_endpoint.go) |
| Stats | [stats_endpoint.go](../command/agent/stats_endpoint.go) |
| Status | [status_endpoint.go](../command/agent/status_endpoint.go) |
| System | [system_endpoint.go](../command/agent/system_endpoint.go) |
| Variable | [variable_endpoint.go](../command/agent/variable_endpoint.go) |
| Volumes | [volumes_endpoint.go](../command/agent/volumes_endpoint.go) |
| WebSockets | [websockets.go](../command/agent/websockets.go) |

## Scheduler

| 功能 | 文件 |
|------|------|
| Scheduler 接口与实现 | [scheduler/doc.go](../scheduler/doc.go) |
| Feasibility 过滤 | [scheduler/feasible/](../scheduler/feasible/) |
| Reconciler | [scheduler/reconciler/](../scheduler/reconciler/) |
| Integration 测试 | [scheduler/integration/](../scheduler/integration/) |
| Scheduler 内部结构 | [scheduler/structs/](../scheduler/structs/) |

## Client (worker agent)

| 功能 | 文件 |
|------|------|
| Client 主对象 | [client/client.go](../client/client.go) |
| RPC | [client/rpc.go](../client/rpc.go) |
| Drain | [client/drain.go](../client/drain.go) |
| GC | [client/gc.go](../client/gc.go) |
| ACL | [client/acl.go](../client/acl.go) |
| Identity | [client/identity.go](../client/identity.go) |
| AllocRunner | [client/allocrunner/](../client/allocrunner/) |
| TaskRunner | [client/allocrunner/taskrunner/](../client/allocrunner/taskrunner/) |
| Logmon（子进程） | [client/logmon/](../client/logmon/) |
| Fingerprint | [client/fingerprint/](../client/fingerprint/) |
| Device Manager | [client/devicemanager/](../client/devicemanager/) |
| Service Registration | [client/serviceregistration/](../client/serviceregistration/) |
| Host Volume Manager | [client/hostvolumemanager/](../client/hostvolumemanager/) |
| Vault Client | [client/vaultclient/](../client/vaultclient/) |
| WIM (Workload Identity) | [client/widmgr/](../client/widmgr/) |
| Task Env | [client/taskenv/](../client/taskenv/) |
| Host Stats | [client/hoststats/](../client/hoststats/) |
| Alloc Health | [client/allochealth/](../client/allochealth/) |
| Alloc Watcher | [client/allocwatcher/](../client/allocwatcher/) |
| Alloc Dir | [client/allocdir/](../client/allocdir/) |
| State | [client/state/](../client/state/) |
| Config | [client/config/](../client/config/) |

## Drivers

| Driver | 路径 |
|--------|------|
| docker | [drivers/docker/](../drivers/docker/) |
| exec | [drivers/exec/](../drivers/exec/) |
| rawexec | [drivers/rawexec/](../drivers/rawexec/) |
| java | [drivers/java/](../drivers/java/) |
| qemu | [drivers/qemu/](../drivers/qemu/) |
| mock | [drivers/mock/](../drivers/mock/) |
| shared executor | [drivers/shared/executor/](../drivers/shared/executor/) |

## API Client (api/)

| 功能 | 文件 |
|------|------|
| 主 client | [api/api.go](../api/api.go) |
| Jobs | [api/jobs.go](../api/jobs.go) |
| Allocations | [api/allocations.go](../api/allocations.go) |
| Nodes | [api/nodes.go](../api/nodes.go) |
| Node Pools | [api/node_pools.go](../api/node_pools.go) |
| Evaluations | [api/evaluations.go](../api/evaluations.go) |
| Deployments | [api/deployments.go](../api/deployments.go) |
| ACL | [api/acl.go](../api/acl.go) |
| CSI | [api/csi.go](../api/csi.go) |
| Variables | [api/variables.go](../api/variables.go) |
| Quota | [api/quota.go](../api/quota.go) |
| Search | [api/search.go](../api/search.go) |
| Status | [api/status.go](../api/status.go) |
| Operator | [api/operator.go](../api/operator.go) |
| FS | [api/fs.go](../api/fs.go) |
| Agent | [api/agent.go](../api/agent.go) |
| Locks | [api/locks.go](../api/locks.go) |
| Keyring | [api/keyring.go](../api/keyring.go) |
| Consul | [api/consul.go](../api/consul.go) |
| Host Volumes | [api/host_volumes.go](../api/host_volumes.go) |
| Scaling | [api/scaling.go](../api/scaling.go) |
| Services | [api/services.go](../api/services.go) |
| Namespace | [api/namespace.go](../api/namespace.go) |
| Regions | [api/regions.go](../api/regions.go) |
| Resources | [api/resources.go](../api/resources.go) |
| Sentinel | [api/sentinel.go](../api/sentinel.go) |
| System | [api/system.go](../api/system.go) |
| Tasks | [api/tasks.go](../api/tasks.go) |
| Task Sched | [api/task_sched.go](../api/task_sched.go) |
| Event Stream | [api/event_stream.go](../api/event_stream.go) |

## CLI 命令 (command/)

| 命令 | 文件 |
|------|------|
| agent | [command/agent/command.go](../command/agent/command.go) |
| job run | [command/job_run.go](../command/job_run.go) |
| job stop | [command/job_stop.go](../command/job_stop.go) |
| job plan | [command/job_plan.go](../command/job_plan.go) |
| job init | [command/job_init.go](../command/job_init.go) |
| job eval | [command/job_eval.go](../command/job_eval.go) |
| job tag | [command/job_tag.go](../command/job_tag.go) |
| alloc | [command/alloc.go](../command/alloc.go) |
| alloc fs | [command/alloc_fs.go](../command/alloc_fs.go) |
| eval | [command/eval.go](../command/eval.go) |
| node | [command/node.go](../command/node.go) |
| operator | [command/operator.go](../command/operator.go) |
| server | [command/server.go](../command/server.go) |
| acl | [command/acl.go](../command/acl.go) |
| acl role | [command/acl_role.go](../command/acl_role.go) |
| quota | [command/quota.go](../command/quota.go) |
| volume | [command/volume.go](../command/volume.go) |
| var | [command/var.go](../command/var.go) |
| var get | [command/var_get.go](../command/var_get.go) |
| var put | [command/var_put.go](../command/var_put.go) |
| var list | [command/var_list.go](../command/var_list.go) |
| var init | [command/var_init.go](../command/var_init.go) |
| var lock | [command/var_lock.go](../command/var_lock.go) |
| ui | [command/ui.go](../command/ui.go) |
| tls | [command/tls.go](../command/tls.go) |
| login | [command/login.go](../command/login.go) |
| sentinel | [command/sentinel.go](../command/sentinel.go) |
| service | [command/service.go](../command/service.go) |
| plugin | [command/plugin.go](../command/plugin.go) |
| metrics | [command/metrics.go](../command/metrics.go) |
| monitor | [command/monitor.go](../command/monitor.go) |
| check | [command/check.go](../command/check.go) |
| fmt | [command/fmt.go](../command/fmt.go) |
| setup | [command/setup.go](../command/setup.go) |
| action | [command/action.go](../command/action.go) |

## 共享辅助

| 功能 | 文件 |
|------|------|
| Raft 工具 | [helper/raftutil/](../helper/raftutil/) |
| UUID | [helper/uuid/uuid.go](../helper/uuid/uuid.go) |
| TLS | [helper/tls/](../helper/) |
| Pool（连接池） | [helper/pool/pool.go](../helper/pool/pool.go) |
| Args/Flags | [helper/args/](../helper/args/) + [helper/flags/](../helper/flags/) |
| HCL 解析 | [helper/hcl/parse.go](../helper/hcl/parse.go) |
| Backoff/Retry | [helper/backoff.go](../helper/backoff.go) + [helper/retry.go](../helper/retry.go) |
| 文件工具 | [helper/file.go](../helper/file.go) |
| Lang 工具 | [lib/lang/](../lib/lang/) |
| Auth（claims） | [lib/auth/](../lib/auth/) |
| File（atomic） | [lib/file/atomic.go](../lib/file/atomic.go) |

## UI

| 功能 | 文件 |
|------|------|
| 路由 | `ui/app/app.ts` + `ui/app/router.ts` |
| 模型 | `ui/app/models/` |
| 序列化器 | `ui/app/serializers/` |
| 控制器 | `ui/app/controllers/` |
| 模板 | `ui/app/templates/` |
| 服务 | `ui/app/services/` |
| 工具 | `ui/app/utils/classes/` |
| Mirage mock | [ui/mirage/](../ui/mirage/) |
| 测试 | `ui/tests/` |
| 构建配置 | [ui/package.json](../ui/package.json) + [ui/ember-cli](../ui/.ember-cli) |

## 已有分析文档

仓库根目录下的分析文档（非 openwiki，但可参考）：

| 文档 | 主题 |
|------|------|
| [nomad_raft.md](../nomad_raft.md) | Raft 共识实现深度分析 |
| [nomad_arch.md](../nomad_arch.md) | 项目架构总览 |
| [nomad_api_usage.md](../nomad_api_usage.md) | Go API 客户端使用 |
| [nomad_acl.md](../nomad_acl.md) | ACL 鉴权 |
| [nomad_client.md](../nomad_client.md) | Client agent |
| [nomad_server.md](../nomad_server.md) | Server |
| [nomad_scheduler.md](../nomad_scheduler.md) | Scheduler |
| [nomad_command.md](../nomad_command.md) | CLI 命令 |
| [nomad_configs.md](../nomad_configs.md) | 配置 |
| [nomad_HCL.md](../nomad_HCL.md) | HCL |
| [nomad_BoltDB.md](../nomad_BoltDB.md) | BoltDB |
| [nomad_gossip.md](../nomad_gossip.md) | Gossip |
| [nomad_rpc.md](../nomad_rpc.md) | RPC |
| [nomad_region.md](../nomad_region.md) | Region 联邦 |
| [nomad_advertise.md](../nomad_advertise.md) | Advertise |
| [nomad_bootstrap.md](../nomad_bootstrap.md) | Bootstrap |
| [nomad_ports.md](../nomad_ports.md) | 端口 |
| [nomad_policy.md](../nomad_policy.md) | Policy |
| [nomad_ipv4_ipv6.md](../nomad_ipv4_ipv6.md) | IPv4/IPv6 |
| [nomad_artifact.md](../nomad_artifact.md) | Artifact |
| [nomad_go-plugin.md](../nomad_go-plugin.md) | Go-plugin |
| [nomad_ui_api.md](../nomad_ui_api.md) | UI API |
| [nomad_ui_binary.md](../nomad_ui_binary.md) | UI binary |
| [nomad_agent_dev.md](../nomad_agent_dev.md) | Dev agent |
| [nomad_solution.md](../nomad_solution.md) | 解决方案 |
| [nomad_architect.md](../nomad_architect.md) | 架构师视角 |
| [nomad_job_call.md](../nomad_job_call.md) | Job 调用 |
| [nomad_job.nomad.md](../nomad_job.nomad.md) | Job jobspec |
