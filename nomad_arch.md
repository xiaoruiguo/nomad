# Nomad 项目架构分析

## 项目概览

| 项 | 值 |
|---|---|
| **项目名** | Nomad（HashiCorp Workload Orchestrator） |
| **主语言** | Go（后端）+ TypeScript/JavaScript（前端） |
| **后端框架** | 自研 Raft 共识 + gRPC + HTTP REST |
| **原生 UI 框架** | Ember.js 6.12.0（`ui/`） |
| **重构 UI 框架** | React 18 + Vite + React Query + Tailwind + Radix UI（`newui/`） |
| **构建工具** | GNU Make + go build（后端）；ember-cli / Vite（前端） |
| **入口** | [main.go](file:///d:/claude/nomad/main.go) |

---

## 1. 顶层结构

```
nomad/
├── main.go              # CLI 入口，dispatch 到 command/
├── command/             # CLI 子命令（agent/job/alloc/eval/node/operator…）
│   └── agent/           # agent 子进程：HTTP+gRPC 服务端
├── nomad/               # 核心服务器逻辑（Raft/Leader/FSM/RPC/调度器接入）
├── client/              # 客户端 agent（worker 节点上的任务执行器）
├── scheduler/           # 调度器实现（service/batch/system/feasibility）
├── drivers/             # 任务驱动（docker/exec/java/qemu/rawexec）
├── plugins/             # CSI 存储/设备驱动插件
├── api/                 # Go API 客户端库（外部调用方使用）
├── acl/                 # ACL 鉴权与策略
├── jobspec2/            # HCL jobspec 解析与校验
├── helper/              # 跨包通用工具（uuid/raftutil/tls/codec…）
├── lib/                 # 底层库（auth/file/lang）
├── e2e/                 # 端到端测试
├── enos/                # 外部 CI 集成测试框架
├── ui/                  # 原生 Ember.js UI
└── newui/               # 重构 React/TypeScript UI
```

---

## 2. 核心模块与职责

### 2.1 后端 Go 模块（按数据流自上而下）

#### ① CLI 入口层 — `main.go` + `command/`
- **职责**：解析 `os.Args`，构造 `command.Meta`，分派到具体子命令（如 `nomad agent`、`nomad job run`、`nomad node status`）。
- **关键设计**：使用 `github.com/hashicorp/cli` 框架；hidden/aliases/common commands 三级分组帮助输出。
- **下游交互**：所有 CLI 子命令最终通过 `api/` 客户端调用远端 Server；`nomad agent` 命令启动 `command/agent` 进程。

#### ② Agent Server 层 — `command/agent`（在 command/agent/ 子目录）
- **职责**：进程级封装，加载配置、初始化日志、启动 HTTP+gRPC 监听、注册路由、嵌入静态 UI 资源（`bindata_assetfs.go`）。
- **关键设计**：HTTP 包装 gRPC，TLS 双向认证；UI 通过 build tag `ui` 决定是否内嵌。
- **下游交互**：将请求转发到 `nomad/` 核心层 RPC。

#### ③ 核心服务器层 — `nomad/`
- **职责**：集群"大脑"。
  - `server.go` — Server 主对象
  - `leader.go` — Leader 选举与 Leader-only 任务
  - `raft_rpc.go` + `fsm.go` — Raft 共识与有限状态机
  - `rpc.go` — 内部 RPC 端点
  - `plan_apply.go` + `plan_queue.go` — 调度计划应用队列
  - `heartbeat.go` — 节点心跳
  - `serf.go` — Serf gossip 成员管理
- **下游交互**：持久化层（BoltDB）+ 调用 `scheduler/` 进行 plan evaluation；通过 RPC 与 `client/` 通信。

#### ④ 调度器层 — `scheduler/`
- **职责**：将 evaluation（评估请求）转换为 allocation（分配结果）。
- **关键设计**：
  - `feasible/` — 可行性过滤（节点筛选）
  - `rank/` — 排序打分
  - `reconciler/` — 增量 reconciliation
  - 多种 scheduler 实现：service / batch / system / sysbatch
- **交互**：被 `nomad/` 调用；产出 alloc 写回 FSM → 推送给 `client/`。

#### ⑤ Client 层 — `client/`
- **职责**：worker 节点上的本地 agent。
  - `client.go` — 主对象
  - `allocrunner/` — Allocation 生命周期管理
  - `taskrunner/` — 单 task 执行
  - `devicemanager/` — GPU/设备管理
  - `serviceregistration/` — Consul/Nomad 服务注册
  - `fingerprint/` — 节点特性探测
  - `logmon/` — 日志收集
- **交互**：从 Server RPC 拉 alloc → 启动 driver → 上报状态/统计 → 注册服务。

#### ⑥ 驱动层 — `drivers/`
- **职责**：实际执行 task 的运行时抽象。
- **实现**：docker / exec / java / qemu / rawexec / mock
- **关键设计**：统一 driver plugin 接口；docker 还有独立的 `docklog` 子进程做日志旁路。
- **交互**：被 `client/allocrunner/taskrunner` 调用。

#### ⑦ API 客户端层 — `api/`
- **职责**：暴露给外部 Go 调用方的 HTTP 客户端库，封装所有 `/v1/*` 端点（jobs/nodes/allocs/csi/acl/...）。
- **关键设计**：独立 `go.mod`，可被下游项目单独引用。
- **交互**：被 `command/` 内部子命令和外部用户代码共同使用。

#### ⑧ 横切关注点
- `acl/` + `nomad/auth` — 鉴权
- `jobspec2/` — HCL → Job 结构体
- `helper/` — 共享工具（无业务依赖）
- `plugins/` — CSI/Device 插件契约

---

### 2.2 前端 UI 模块

#### ① 原生 UI — `ui/`（Ember.js）
- **架构**：经典 Ember MVC
  - `app/routes/` — 路由（jobs/clients/storage/administration/variables/exec…）
  - `app/models/` + `app/serializers/` — ember-data 模型与 API 反序列化
  - `app/controllers/` — 路由控制器
  - `app/templates/` — Handlebars 模板
  - `app/services/` — token/system/notifications/sockets 等单例
  - `app/utils/classes/` — stats tracker、xterm adapter 等工具类
- **职责**：通过 `/v1/*` REST API + WebSocket（event stream、exec、stats）展示集群状态。
- **构建**：ember-cli → 静态资源 → 在 build tag `ui` 下被 `command/agent` 用 `bindata_assetfs` 内嵌进 nomad 二进制。

#### ② 重构 UI — `newui/`（React + Vite）
- **架构**（基于历史实施记录）：
  - `src/api/client.ts` + `src/api/resources/*` + `src/api/hooks/*` — 三层 API（client → resource → React Query hook）
  - `src/api/types/*` — TypeScript 类型定义（如 `csi.ts` 中的 `CSIPlugin`）
  - `src/router.tsx` — React Router v6 配置，basename `/newui`，懒加载路由
  - `src/features/*/pages/` — 页面组件（按业务域组织：jobs/storage/clients/topology…）
  - `src/features/*/components/` — 可复用组件（如 `job-filter-bar.tsx` 的 `FilterableDropdown`）
  - `src/features/*/hooks/` — 业务 hook（如 `use-job-filters.ts` 生成服务端 filter 表达式）
  - `src/components/` — 跨 feature 通用组件（`PageLayout`、`Card`）
- **关键设计**：
  - **服务端过滤**：将 UI 多选条件编译为 Nomad filter 表达式（`NodePool == "x" or NodePool == "y"`）
  - **状态管理**：TanStack Query 替代 Ember 的 ember-data
  - **样式**：Tailwind CSS + Radix UI 原语
  - **路由**：tab-based 导航（如 Storage 用 `?tab=plugins` query 参数）
- **构建**：Vite → 静态资源 → 部署到 nginx（`base: "/newui/"`）

---

### 2.3 部署/运行时拓扑（双 UI 共享后端）

```
                  浏览器
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
   /ui/         /newui/       /v1/*
        │           │            │
        └─────┬─────┘            │
              ▼                  │
       nomad3 (Nginx)            │
       ├─ /ui/        proxy ─────┼──► nomad2:4646 (Nomad Server 内置 Ember UI)
       ├─ /newui/    static      │
       └─ /v1/       proxy ──────┼──► nomad4 (Traefik API Gateway) ──► nomad2:4646
                                  │
                                  └─ 共享 ACL Management Token
```

| 节点 | 角色 |
|---|---|
| **nomad2** | Nomad Server（运行 agent server，含内置 Ember UI） |
| **nomad3** | 前端服务器（Nginx：原生 UI 反代 + 重构 UI 静态 + API 反代） |
| **nomad4** | Traefik API 网关（统一 ACL/路由入口） |

---

## 3. 模块交互关系图

```
┌──────────────────────────────────────────────────────────────┐
│                       外部调用方                              │
│   (CLI 用户 / UI 浏览器 / Go API 客户端)                      │
└──────────┬───────────────────────┬───────────────────────────┘
           │ HTTP/gRPC             │ HTTP /v1/*
           ▼                       ▼
┌──────────────────┐      ┌────────────────┐
│ command/ + main  │      │  command/agent │◄── 嵌入式 UI 资源
│ (CLI dispatch)   │      │  (HTTP+gRPC)   │    (bindata_assetfs)
└────────┬─────────┘      └────────┬───────┘
         │                         │
         │  调用 api/              │  内部 RPC
         ▼                         ▼
┌──────────────────────────────────────────────────┐
│                   nomad/ (Server)                │
│  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │
│  │  Raft   │  │  FSM    │  │  RPC Endpoints  │  │
│  └────┬────┘  └────┬────┘  └────────┬────────┘  │
│       │            │                │            │
│       ▼            ▼                ▼            │
│  ┌─────────┐  ┌─────────┐  ┌─────────────────┐  │
│  │ Leader  │  │ State   │  │  Plan Queue     │  │
│  └─────────┘  └─────────┘  └────────┬────────┘  │
└──────────────────────────────────────┼──────────┘
                                       │ eval
                                       ▼
                              ┌─────────────────┐
                              │  scheduler/     │
                              │  (feasible/rank)│
                              └────────┬────────┘
                                       │ alloc
                                       ▼
                              ┌─────────────────┐
                              │  nomad/ (RPC)   │──► 下发 alloc
                              └────────┬────────┘
                                       │
                                       ▼
        ┌──────────────────────────────────────────────┐
        │              client/ (per worker node)       │
        │  ┌────────────┐  ┌─────────────────────────┐ │
        │  │ allocrunner│─►│ taskrunner              │ │
        │  └────────────┘  └──────────┬──────────────┘ │
        │                            │                 │
        │                            ▼                 │
        │                  ┌─────────────────┐         │
        │                  │   drivers/      │         │
        │                  │ docker/exec/... │         │
        │                  └─────────────────┘         │
        └──────────────────────────────────────────────┘
```

---

## 4. 关键架构模式

| 模式 | 体现 |
|---|---|
| **Leader-Follower 共识** | `nomad/leader.go` + Raft，单 Leader 处理写 |
| **CQRS / Event Sourcing** | FSM 重放日志构造状态；eval/alloc 异步流 |
| **Plugin 架构** | `drivers/`、`plugins/` 统一接口，可热加载 |
| **分层 API 客户端** | `api/`（Go SDK） ↔ `command/agent`（HTTP 包装） ↔ `ui/`/`newui/`（消费方） |
| **双前端共存** | 同一后端 API 服务两个独立前端栈（Ember 与 React），由 nginx 路由分流 |
| **Feature-based 目录** | newui 按 `features/{jobs,storage,clients,...}` 组织，避免技术分层带来的循环依赖 |
| **Server-side Filter** | newui 将多选条件编译为 Nomad filter expression（如 `NodePool == "a" or NodePool == "b"`），由后端执行 |

---

## 5. 评估与建议

### 优势
- **职责边界清晰**：Server / Client / Scheduler / Driver / API 五层各司其职，可独立测试
- **CLI 与 API 共享 SDK**：`api/` 既是外部库又被 `command/` 复用，避免重复实现
- **驱动可插拔**：新增运行时（如 wasm）只需实现 driver 接口
- **UI 重构风险可控**：双 UI 并行部署，渐进迁移

### 关注点
- **`nomad/` 包过重**：leader/fsm/rpc/serf/plan 全部塞在一个包内，建议按子域（如 `consensus/`、`plan/`）拆分子包
- **newui 源码当前不在磁盘**（仅 `node_modules`/`playwright-report`/`test-results`），建议尽快恢复 `src/` 或纳入版本控制（当前 `?? newui/` 为 untracked）
- **Ember 与 React 双栈维护成本**：长期需明确淘汰 Ember 的时间表，否则会出现功能对齐漂移
- **API 网关 ACL Token 共享**：nomad4 Traefik 与 nomad3 Nginx 都用同一 Management Token，生产环境建议改用 per-request token 注入
