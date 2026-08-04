# Workflows

> 重要端到端流程。每条流程标注源码文件。

## 1. Job 提交到调度（Submit → Plan → Eval → Alloc）

```
用户                              Server                            Client
nomad job run job.nomad
  ↓
command/job_run.go (JobRunCmd)
  ↓
api/jobs.go (Jobs.Register) → POST /v1/jobs
  ↓
                                  command/agent/job_endpoint.go (jobRegister)
                                  ↓
                                  nomad/rpc.go (Job.Register) — 鉴权 + 校验
                                  ↓
                                  fsm.go (Apply RegisterJob) — Raft log
                                  ↓
                                  nomad/worker.go (worker) — eval 入队
                                  ↓
                                  scheduler/ (Process eval) — feasible + rank
                                  ↓
                                  plan_apply.go (PlanApply) — Raft 写 alloc
                                  ↓
                                  RPC 下发 alloc                                   ↓
                                                                   client/allocrunner/ (AllocRunner)
                                                                   ↓
                                                                   taskrunner/ (TaskRunner)
                                                                   ↓
                                                                   drivers/<x> (driver.Run)
```

**关键文件**：
- [command/job_run.go](../command/job_run.go) — JobRunCmd
- [api/jobs.go](../api/jobs.go) — `Jobs.Register` HTTP 调用
- [command/agent/job_endpoint.go](../command/agent/job_endpoint.go) — HTTP handler
- [nomad/rpc.go](../nomad/rpc.go) — `Job.Register` RPC endpoint
- [nomad/fsm.go](../nomad/fsm.go) — `Apply RegisterJob`
- [nomad/worker.go](../nomad/worker.go) — eval worker 主循环
- [scheduler/](../scheduler/) — scheduler 实现
- [nomad/plan_apply.go](../nomad/plan_apply.go) — PlanApply

## 2. Raft 写入链路（强一致性写）

任何状态变更（job/alloc/node/acl/variable）都走 Raft：

```
RPC endpoint (e.g. Job.Register)
  ↓
nomad/rpc.go — 鉴权 (nomad/auth/)
  ↓
raft.Apply(LogRequest) — 进入 Raft log
  ↓
Raft 复制到 follower — 多数派确认
  ↓
fsm.go (FSM.Apply) — 应用到状态机
  ↓
索引推进 (stateIndex)
  ↓
返回 RPC 响应
```

**关键文件**：
- [nomad/fsm.go](../nomad/fsm.go) — FSM.Apply 分发
- [nomad/raft_rpc.go](../nomad/raft_rpc.go) — RaftLayer（StreamLayer）
- [nomad/leader.go](../nomad/leader.go) — Leader 选举 + leaderLoop
- 详细分析见 [nomad_raft.md](../nomad_raft.md)

## 3. 节点心跳与失效检测

```
Client 启动 → fingerprint/ 探测 → 注册到 Server (Node.Register)
  ↓
heartbeat.go (Client) → 定期 Node.UpdateNodeStatus (status: ready)
  ↓
Server heartbeat.go — 维护 lastSeen map
  ↓
若超过 heartbeat_grace → 标记 node down → 触发 rescheduling eval
```

**关键文件**：
- [nomad/heartbeat.go](../nomad/heartbeat.go) — Server 端心跳跟踪
- [client/client.go](../client/client.go) — Client 主循环
- [client/fingerprint/](../client/fingerprint/) — 节点探测

## 4. Allocation 生命周期（Client 端）

```
Client RPC 拉取 alloc (poll / streaming)
  ↓
client/allocrunner/ (AllocRunner.Run)
  ↓
prerun hooks (validate/fingerprint/network/vault/token)
  ↓
taskrunner/ (TaskRunner.Run) — per task
  ↓
drivers/<x>.Start (task driver) — 启动容器/进程
  ↓
logmon/ — 日志旁路
  ↓
状态上报 (alloc state) → Server FSM
  ↓
poststop hooks / Restart policy
```

**关键文件**：
- [client/allocrunner/](../client/allocrunner/) — AllocRunner
- [client/allocrunner/taskrunner/](../client/allocrunner/taskrunner/) — TaskRunner
- [client/logmon/](../client/logmon/) — 日志收集子进程
- [drivers/](../drivers/) — 驱动实现

## 5. CLI 命令分派

```
nomad <command> [args]
  ↓
main.go (Run) — 构造 command.Meta
  ↓
command/commands.go (Commands) — 注册命令工厂
  ↓
hashicorp/cli.CLI.Run — 分派
  ↓
具体 Command.Run(args) — 调用 api/ SDK
```

**关键文件**：
- [main.go](../main.go) L86-119 — Run 函数
- [command/commands.go](../command/commands.go) — 命令注册表
- [command/meta.go](../command/meta.go) — Meta（共享 API client 工厂）

## 6. ACL 鉴权

```
请求带 X-Nomad-Token header
  ↓
command/agent/http.go (AuthHandlerWrapper)
  ↓
nomad/auth/auth.go — 解析 token → ACL 对象
  ↓
acl/acl.go — ACL 评估 (policy + namespace + nodePool)
  ↓
endpoint handler — 检查具体 capability
```

**关键文件**：
- [acl/acl.go](../acl/acl.go) — ACL 对象
- [acl/policy.go](../acl/policy.go) — Policy 解析
- [nomad/auth/](../nomad/auth/) — Server 端鉴权中间件
- [command/agent/http.go](../command/agent/http.go) — HTTP wrapper

## 7. UI Event Stream（WebSocket）

```
Ember service (token/system/sockets) → WebSocket /v1/event/stream
  ↓
command/agent/event_endpoint.go (EventStream) — 鉴权 + Subscribe
  ↓
nomad/stream/ — pub/sub broker
  ↓
推 topic 事件 (Job/Alloc/Eval/Node/Deployment) 到前端
```

**关键文件**：
- [command/agent/event_endpoint.go](../command/agent/event_endpoint.go)
- [nomad/stream/](../nomad/stream/) — stream broker
- `ui/app/services/` — Ember WebSocket 服务
