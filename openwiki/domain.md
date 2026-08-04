# Domain Concepts

> 领域概念与术语表。

## 核心调度对象

| 术语 | 含义 | 源码位置 |
|------|------|----------|
| **Job** | 用户声明的 workload，含 1+ Task Group | `nomad/structs/job.go` |
| **Task Group** | Job 内一组 co-located task，共享网络/卷 | `nomad/structs/job.go` |
| **Task** | 最小调度单元，指定 driver + config + resources | `nomad/structs/task.go` |
| **Allocation (Alloc)** | Task Group 到具体 Node 的绑定（运行实例） | `nomad/structs/alloc.go` |
| **Evaluation (Eval)** | 调度请求，触发 scheduler 重新计算 alloc | `nomad/structs/eval.go` |
| **Plan** | scheduler 产出的 alloc 变更提案（add/update/preempt） | `nomad/plan_apply.go` |
| **Node** | worker 节点（运行 Client agent） | `nomad/structs/node.go` |
| **Deployment** | Job 滚动升级的状态对象 | `nomad/structs/deployment.go` |

## 集群拓扑

| 术语 | 含义 |
|------|------|
| **Region** | 独立 Nomad 集群；多 region 通过 WAN gossip 联邦 |
| **Datacenter (DC)** | Region 内的故障域（通常对应物理 DC） |
| **Server** | 控制平面节点，参与 Raft 共识 |
| **Client** | 数据平面节点，执行 alloc（不参与共识） |
| **Node Pool** | Client 节点逻辑分组（用于调度过滤） |
| **Namespace** | Job/Variable 隔离单元（多租户） |

## 调度

| 术语 | 含义 |
|------|------|
| **Scheduler Type** | service（长期）/ batch（一次性）/ system（每节点）/ sysbatch |
| **Feasible** | 节点筛选阶段（constraint/driver/resources） |
| **Rank** | 可行节点打分排序阶段 |
| **Reconciler** | 增量 alloc 计算（vs 全量重算） |
| **Preemption** | 抢占低优先级 alloc 给高优先级让位 |
| **Spread** | 跨 DC/rack 的分布策略 |
| **Sticky** | alloc 倾向保留在原 node（重启不迁移） |

## Driver 与执行

| 术语 | 含义 |
|------|------|
| **Driver** | task 运行时抽象（docker/exec/java/qemu/rawexec） |
| **Fingerprint** | 节点/驱动特性探测（健康/属性） |
| **Task Runner** | 单 task 生命周期管理（client/allocrunner/taskrunner） |
| **Alloc Runner** | 单 alloc 生命周期管理（client/allocrunner） |
| **Restart Policy** | task 失败重启策略（attempts/interval/mode） |
| **Reschedule** | alloc 失败后跨节点重调度策略 |
| **logmon** | 任务日志旁路子进程 |

## Raft 与一致性

| 术语 | 含义 | 源码 |
|------|------|------|
| **FSM** | 有限状态机，Apply Raft log 到内存状态 | [nomad/fsm.go](../nomad/fsm.go) |
| **RaftLayer** | 自定义 StreamLayer（Yamux+TLS） | [nomad/raft_rpc.go](../nomad/raft_rpc.go) |
| **BoltDB Store** | Raft log 持久化后端 | `helper/raftutil/` |
| **Snapshot** | FSM 状态快照（FileSnapshotStore） | `helper/raftutil/` |
| **Autopilot** | 自动集群管理（dead server 清理、EL 改进） | [nomad/autopilot.go](../nomad/autopilot.go) |
| **peers.json** | 灾难恢复的 peer 列表 | `nomad/peers/peers.go` |
| **Bootstrap** | 集群首次启动引导 | `nomad/server.go` |

## ACL

| 术语 | 含义 |
|------|------|
| **Token** | ACL 身份凭证（management / client） |
| **Policy** | namespace/node/policy/operator/plugin/agent 等 capability 声明 |
| **ACL Object** | 评估后的策略对象（acl/acl.go） |
| **Management Token** | 超级 token，绕过所有检查 |
| **Anonymous Token** | 未带 token 时的默认身份 |

## 存储

| 术语 | 含义 |
|------|------|
| **CSI Plugin** | Container Storage Interface 插件（外部进程） |
| **CSI Volume** | CSI 持久化卷 |
| **Host Volume** | 节点本地目录卷 |
| **Variable** | 加密的 KV 变量（per namespace） |

## 服务发现

| 术语 | 含义 |
|------|------|
| **Service Registration** | task 启动后注册到 Consul/Nomad native |
| **Consul Connect** | Consul service mesh 集成 |
| **Checks** | service 健康检查 |

## Secret

| 术语 | 含义 |
|------|------|
| **Vault Token** | per-alloc 的 Vault token（renewable） |
| **Nomad Workload Identity (WIM)** | per-alloc 的 JWT，用于外部认证 |
| **Template** | consul-template 渲染 secret 到文件 |
