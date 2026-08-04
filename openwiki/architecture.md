# Architecture

> 系统架构与模块边界。Nomad 遵循五层分离：CLI → Agent Server → Core Server → Scheduler → Client/Driver。

## 集群拓扑

```
┌─────────────────────────────────────────────────────────────┐
│                  External Callers                            │
│  CLI users / Ember UI / Go API clients                      │
└──────────┬───────────────────────────┬──────────────────────┘
           │ HTTP /v1/* + WebSocket    │ HTTP/gRPC
           ▼                           ▼
┌──────────────────────┐     ┌─────────────────────────────┐
│ main.go + command/   │     │   command/agent/            │
│ (CLI dispatch via    │     │   (HTTP+gRPC server, embeds │
│  hashicorp/cli)      │     │    UI via bindata_assetfs)  │
└────────┬─────────────┘     └────────┬────────────────────┘
         │ 调用 api/ SDK              │ 内部 RPC
         ▼                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    nomad/ (Core Server)                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────────────┐             │
│  │  Raft   │  │   FSM   │  │  RPC Endpoints  │             │
│  └────┬────┘  └────┬────┘  └────────┬────────┘             │
│       ▼            ▼                ▼                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────────────┐             │
│  │ Leader  │  │  State  │  │  Plan Queue     │             │
│  └─────────┘  └─────────┘  └────────┬────────┘             │
└──────────────────────────────────────┼──────────────────────┘
                                       │ eval
                                       ▼
                              ┌─────────────────┐
                              │   scheduler/    │
                              │ (feasible/rank) │
                              └────────┬────────┘
                                       │ alloc
                                       ▼
                              ┌─────────────────┐
                              │  nomad/ (RPC)   │──► 下发 alloc
                              └────────┬────────┘
                                       ▼
        ┌──────────────────────────────────────────────────────┐
        │           client/ (per worker node)                  │
        │  ┌────────────┐  ┌─────────────────────────────────┐ │
        │  │ allocrunner│─►│ taskrunner → drivers/           │ │
        │  └────────────┘  └─────────────────────────────────┘ │
        └──────────────────────────────────────────────────────┘
```

## 代码分层

### `main.go` + `command/` — CLI 入口

| 路径 | 作用 |
|------|------|
| [main.go](../main.go) | 解析 `os.Args`，构造 `command.Meta`，分派到子命令；定义 hidden/aliases/common 三级分组 |
| `command/` | 子命令实现（agent/job/alloc/eval/node/operator/acl/var/...） |
| `command/agent/` | `nomad agent` 子进程：加载 config、启动 HTTP+gRPC、嵌入 UI 资源 |

**关键约束**（`make check` 强制）：`command/` 不得 import `nomad/structs`。

### `nomad/` — Core Server（集群大脑）

| 文件 | 职责 |
|------|------|
| `server.go` | Server 主对象，编排所有子组件 |
| `leader.go` | Leader 选举 + Leader-only 任务 |
| `raft_rpc.go` + `fsm.go` | Raft 共识 + FSM 状态机（详见 [nomad_raft.md](../nomad_raft.md)） |
| `rpc.go` | 内部 RPC 端点（job/alloc/node/eval） |
| `plan_apply.go` + `plan_queue.go` | 调度 plan 队列与 apply |
| `heartbeat.go` | 节点心跳与 inactive 检测 |
| `serf.go` | Serf gossip 成员管理（LAN/WAN） |
| `autopilot.go` | 自动集群管理（dead server cleanup、improved_EL） |
| `worker.go` | Eval worker：拉 eval → 调 scheduler → 提交 plan |
| `config.go` | Server Config 结构 |

### `scheduler/` — 调度器

| 路径 | 职责 |
|------|------|
| `doc.go` | scheduler 接口与类型定义 |
| `feasible/` | 可行性过滤（节点筛选） |
| `reconciler/` | 增量 reconciliation |
| `integration/` | 集成测试夹具 |
| `structs/` | scheduler 内部结构 |

支持的 scheduler 类型：service / batch / system / sysbatch。

### `client/` — Client Agent（worker 节点）

| 路径 | 职责 |
|------|------|
| `client.go` | Client 主对象 |
| `allocrunner/` | Allocation 生命周期 |
| `taskrunner/` | 单 task 执行（含 getter / template renderer 子进程） |
| `devicemanager/` | GPU/设备管理 |
| `serviceregistration/` | Consul/Nomad 服务注册 |
| `fingerprint/` | 节点特性探测（cpu/mem/disk/net/storage） |
| `logmon/` | 任务日志收集 |
| `lib/` | client 内部共享库 |
| `state/` | 本地状态存储 |

### `drivers/` — 任务驱动

| Driver | 路径 | 说明 |
|--------|------|------|
| docker | `drivers/docker/` | 含独立 `docklog` 日志旁路子进程 |
| exec | `drivers/exec/` | 隔离的 POSIX 进程 |
| rawexec | `drivers/rawexec/` | 不隔离的裸进程 |
| java | `drivers/java/` | JVM 进程 |
| qemu | `drivers/qemu/` | 虚拟机 |
| mock | `drivers/mock/` | 测试用 |

统一通过 `github.com/hashicorp/go-plugin` 接口加载；驱动可外部进程化。

### `api/` — Go API 客户端

独立 `go.mod`，可被外部项目单独引用。封装所有 `/v1/*` 端点（jobs/nodes/allocs/csi/acl/variables/...）。

**隔离约束**（`make check`）：`api/` 不得依赖 `nomad/` 任何内部包。

### `acl/` — 鉴权

| 文件 | 职责 |
|------|------|
| `acl.go` | ACL 对象与策略评估 |
| `policy.go` | policy 解析 |
| `virtual.go` | 虚拟 ACL 对象 |

配合 `nomad/auth/` 做请求级鉴权。

### `jobspec2/` — HCL Jobspec 解析

独立包（`make check` 禁止依赖 nomad core），将 HCL `.nomad` 文件解析为 `api.Job` 结构。

### `helper/` + `lib/` — 共享工具

`helper/raftutil/`（Raft helper）、`helper/uuid/`、`helper/tls/`、`helper/codec/`（msgpack）、`helper/pool/`（连接池）、`lib/auth/`、`lib/file/`、`lib/lang/`。

### `ui/` — Ember.js 前端

| 路径 | 职责 |
|------|------|
| `app/routes/` | 路由（jobs/clients/storage/administration/variables/exec） |
| `app/models/` + `app/serializers/` | ember-data 模型与 API 反序列化 |
| `app/controllers/` | 路由控制器 |
| `app/templates/` | Handlebars 模板 |
| `app/services/` | token/system/notifications/sockets 单例 |

通过 `/v1/*` REST + WebSocket（event stream、exec、stats）展示集群状态。build tag `ui` 时被 `bindata_assetfs` 内嵌进 binary。

## 关键架构模式

| 模式 | 体现 |
|------|------|
| **Leader-Follower 共识** | `nomad/leader.go` + hashicorp/raft，单 Leader 处理写 |
| **CQRS / Event Sourcing** | FSM 重放 log 构造状态；eval/alloc 异步流 |
| **Plugin 架构** | `drivers/`、`plugins/` 统一接口，go-plugin 可热加载 |
| **分层 API 客户端** | `api/`（Go SDK）↔ `command/agent`（HTTP 包装）↔ `ui/`（消费方） |
| **Plan/Eval 双队列** | eval 入队 → worker 拉 → scheduler 产出 plan → plan apply 写 FSM |
| **Region/DC 联邦** | 多 region 通过 WAN gossip 互通，job 可跨 region 调度 |
