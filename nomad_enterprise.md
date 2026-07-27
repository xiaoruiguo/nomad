# Nomad 企业版功能入口分析

> 本文档详细分析 Nomad 企业版（Enterprise，简称 ENT）功能的入口实现机制。Nomad 采用 **CE/ENT 双轨单仓库** 架构：开源版本（Community Edition，CE）通过 `//go:build !ent` build tag 提供占位实现，企业版通过 `//go:build ent` tag 提供真实实现。两者通过相同的函数签名在编译期切换。本文档基于 CE 占位代码反推企业版入口契约。

## 目录

1. [架构总览：CE/ENT 双轨设计](#1-架构总览ceent-双轨设计)
2. [Build Tag 机制](#2-build-tag-机制)
3. [Agent 层企业版入口](#3-agent-层企业版入口)
4. [HTTP 层企业版入口](#4-http-层企业版入口)
5. [Server 层企业版入口](#5-server-层企业版入口)
6. [FSM 与状态持久化入口](#6-fsm-与状态持久化入口)
7. [Leader 选举企业版入口](#7-leader-选举企业版入口)
8. [Job Endpoint 企业版入口](#8-job-endpoint-企业版入口)
9. [Volume 与 CSI 企业版入口](#9-volume-与-csi-企业版入口)
10. [Client 层企业版入口](#10-client-层企业版入口)
11. [Structs 层企业版入口](#11-structs-层企业版入口)
12. [Scheduler 层企业版入口](#12-scheduler-层企业版入口)
13. [Autopilot 企业版入口](#13-autopilot-企业版入口)
14. [CLI 命令企业版入口](#14-cli-命令企业版入口)
15. [配置与 License 入口](#15-配置与-license-入口)
16. [企业版功能清单](#16-企业版功能清单)
17. [源码文件索引](#17-源码文件索引)

---

## 1. 架构总览：CE/ENT 双轨设计

Nomad 采用**单仓库 + build tag 切换**的方式同时维护开源版与企业版：

```
┌──────────────────────────────────────────────────────────────┐
│ 同一份主代码（无 build tag）                                 │
│  - 调用 setupEnterpriseAgent()                               │
│  - 调用 NewEnterpriseEndpoints()                             │
│  - 调用 establishEnterpriseLeadership()                      │
│  - 调用 registerEnterpriseHandlers()                         │
│  - 调用 EntCommands()                                        │
│  - 调用 DefaultEntConfig()                                   │
└──────────────────────────────────────────────────────────────┘
              │                                │
              ▼                                ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│ CE 版本（//go:build !ent）  │  │ ENT 版本（//go:build ent）  │
│  - 占位实现，返回 nil/空    │  │  - 真实实现                 │
│  - 文件后缀 _ce.go          │  │  - 文件后缀 _ent.go         │
│  - 编译为 nomad OSS 二进制  │  │  - 编译为 nomad ENT 二进制  │
└─────────────────────────────┘  └─────────────────────────────┘
```

**核心设计原则：**
1. **函数签名一致**：CE 与 ENT 实现同名同签名函数，仅 build tag 不同
2. **主代码无感知**：主代码（无 build tag 文件）直接调用这些函数，不关心具体实现
3. **CE 占位安全**：CE 版本的占位实现要么返回 `nil`/空，要么返回 "Enterprise only" 错误
4. **编译期决定**：没有运行时动态加载，构建时通过 `-tags ent` 决定

---

## 2. Build Tag 机制

### 2.1 文件命名约定

| 后缀 | Build Tag | 用途 |
|------|-----------|------|
| `_ce.go` | `//go:build !ent` | CE 占位实现 |
| `_ent.go` | `//go:build ent` | 企业版真实实现（不在开源仓库中） |
| 无后缀 | 无 tag | 主代码，CE/ENT 共用 |

### 2.2 构建命令

```bash
# 构建 CE 版本（默认）
make dev
# 或
go build -tags "ui hashicorpmetrics" -o nomad

# 构建企业版（需要企业版源码）
go build -tags "ent ui hashicorpmetrics" -o nomad
```

### 2.3 GNUmakefile 中的 ent 标签

[GNUmakefile](file:///d:/claude/nomad/GNUmakefile) 中多处支持 `ent` 标签：

```makefile
# Proto 向后兼容比较时考虑 ent 后缀
PROTO_COMPARE_TAG ?= v1.0.3$(if $(findstring ent,$(GO_TAGS)),+ent,)
```

---

## 3. Agent 层企业版入口

### 3.1 EnterpriseAgent 类型

#### CE 占位
[command/agent/agent_ce.go](file:///d:/claude/nomad/command/agent/agent_ce.go)

```go
//go:build !ent

// EnterpriseAgent holds information and methods for enterprise functionality
// in OSS it is an empty struct.
type EnterpriseAgent struct{}

func (a *Agent) setupEnterpriseAgent(log hclog.Logger) error {
    // configure eventer
    a.auditor = &noOpAuditor{}
    return nil
}

func (a *Agent) entReloadEventer(cfg *config.AuditConfig) error {
    return nil
}
```

#### 主代码调用点
[command/agent/agent.go#L83-L84](file:///d:/claude/nomad/command/agent/agent.go#L83-L84)

```go
type Agent struct {
    // ...
    // EnterpriseAgent holds information and methods for enterprise functionality
    EnterpriseAgent *EnterpriseAgent
    // ...
}
```

[command/agent/agent.go#L176-L178](file:///d:/claude/nomad/command/agent/agent.go#L176-L178)

```go
func (a *Agent) Start(...) error {
    // ...
    if err := a.setupEnterpriseAgent(logger); err != nil {
        return nil, err
    }
    // ...
}
```

[command/agent/agent.go#L1664-L1668](file:///d:/claude/nomad/command/agent/agent.go#L1664-L1668) 配置重载时调用：

```go
// Update eventer config
if newConfig.Audit != nil {
    if err := a.entReloadEventer(newConfig.Audit); err != nil {
        return err
    }
}
```

### 3.2 企业版入口契约

| 函数 | 调用位置 | CE 行为 | ENT 预期行为 |
|------|---------|---------|-------------|
| `setupEnterpriseAgent(logger)` | [agent.go#L176](file:///d:/claude/nomad/command/agent/agent.go#L176) | 设置 `noOpAuditor` | 初始化审计器、Sentinel、许可证等 |
| `entReloadEventer(cfg)` | [agent.go#L1665](file:///d:/claude/nomad/command/agent/agent.go#L1665) | 返回 `nil` | 重载审计配置 |

### 3.3 审计器（Auditor）

CE 版本使用 [noOpAuditor](file:///d:/claude/nomad/command/agent/agent.go#L1825-L1845)（定义在主代码中）：

```go
type noOpAuditor struct{}
var _ event.Auditor = &noOpAuditor{}

func (e *noOpAuditor) Event(ctx context.Context, eventType string, payload interface{}) error { return nil }
func (e *noOpAuditor) Enabled() bool { return false }
func (e *noOpAuditor) Reopen() error { return nil }
func (e *noOpAuditor) SetEnabled(enabled bool) {}
```

企业版应提供真实审计器实现，写入审计日志文件。

---

## 4. HTTP 层企业版入口

### 4.1 registerEnterpriseHandlers

#### CE 占位
[command/agent/http_ce.go](file:///d:/claude/nomad/command/agent/http_ce.go)

```go
//go:build !ent

// registerEnterpriseHandlers is a no-op for the oss release
func (s *HTTPServer) registerEnterpriseHandlers() {
    s.mux.HandleFunc("/v1/sentinel/policies", s.wrap(s.entOnly))
    s.mux.HandleFunc("/v1/sentinel/policy/", s.wrap(s.entOnly))

    s.mux.HandleFunc("/v1/quotas", s.wrap(s.entOnly))
    s.mux.HandleFunc("/v1/quota-usages", s.wrap(s.entOnly))
    s.mux.HandleFunc("/v1/quota/", s.wrap(s.entOnly))
    s.mux.HandleFunc("/v1/quota", s.wrap(s.entOnly))

    s.mux.HandleFunc("/v1/recommendation", s.wrap(s.entOnly))
    s.mux.HandleFunc("/v1/recommendations", s.wrap(s.entOnly))
    s.mux.HandleFunc("/v1/recommendations/apply", s.wrap(s.entOnly))
    s.mux.HandleFunc("/v1/recommendation/", s.wrap(s.entOnly))
}

func (s *HTTPServer) entOnly(resp http.ResponseWriter, req *http.Request) (interface{}, error) {
    return nil, CodedError(501, ErrEntOnly)
}
```

#### 主代码调用点
[command/agent/http.go#L574](file:///d:/claude/nomad/command/agent/http.go#L574)

```go
func (s *HTTPServer) registerHandlers(enableDebug bool) {
    // ... 大量 /v1/ API 路由 ...
    s.registerEnterpriseHandlers()
}
```

[command/agent/http.go#L50](file:///d:/claude/nomad/command/agent/http.go#L50)

```go
const ErrEntOnly = "Nomad Enterprise only endpoint"
```

### 4.2 审计 HTTP 包装器

CE 占位 ([http_ce.go#L34-L45](file:///d:/claude/nomad/command/agent/http_ce.go#L34-L45))：

```go
// auditHandler wraps the passed handlerFn
func (s *HTTPServer) auditHandler(h handlerFn) handlerFn {
    return h
}

// auditNonJSONHandler wraps the passed handlerByteFn
func (s *HTTPServer) auditNonJSONHandler(h handlerByteFn) handlerByteFn {
    return h
}

// auditHTTPHandler wraps the passed http.Handler
func (s *HTTPServer) auditHTTPHandler(h http.Handler) http.Handler {
    return h
}
```

ENT 版本应在这三个包装器中插入审计日志记录逻辑。

### 4.3 企业版 HTTP 端点清单

根据 CE 占位代码反推，企业版提供以下 HTTP API：

| 路径 | 功能 |
|------|------|
| `/v1/sentinel/policies` | Sentinel 策略列表 |
| `/v1/sentinel/policy/{name}` | 单个 Sentinel 策略 CRUD |
| `/v1/quotas` | 配额规范列表 |
| `/v1/quota-usages` | 配额使用情况 |
| `/v1/quota/{name}` | 单个配额规范 CRUD |
| `/v1/quota` | 配额规范别名 |
| `/v1/recommendation/{id}` | 单个扩缩容建议 |
| `/v1/recommendations` | 建议列表 |
| `/v1/recommendations/apply` | 批量应用建议 |
| `/v1/event/stream`（企业扩展） | 事件流（CE 也有，但企业版有额外过滤） |
| `/v1/audit/` | 审计日志相关（推测） |

---

## 5. Server 层企业版入口

### 5.1 EnterpriseEndpoints

#### CE 占位
[nomad/endpoints_ce.go](file:///d:/claude/nomad/nomad/endpoints_ce.go)

```go
//go:build !ent

// EnterpriseEndpoints holds the set of enterprise only endpoints to register
type EnterpriseEndpoints struct{}

// NewEnterpriseEndpoints returns a stub of the enterprise endpoints since there
// are none in oss
func NewEnterpriseEndpoints(s *Server, ctx *RPCContext) *EnterpriseEndpoints {
    return &EnterpriseEndpoints{}
}

// Register is a no-op in oss.
func (e *EnterpriseEndpoints) Register(s *rpc.Server) {}
```

#### 主代码调用点
[nomad/server.go#L1340-L1341](file:///d:/claude/nomad/nomad/server.go#L1340-L1341)

```go
func (s *Server) RegisterEndpoints() {
    // ... 大量 OSS endpoint 注册 ...
    _ = server.Register(NewHostVolumeEndpoint(s, ctx))
    _ = server.Register(NewTaskGroupVolumeClaimEndpoint(s, ctx))
    _ = server.Register(NewClientHostVolumeEndpoint(s, ctx))

    // Register non-streaming
    ent := NewEnterpriseEndpoints(s, ctx)
    ent.Register(server)
}
```

### 5.2 企业版 RPC 端点契约

ENT 版本的 `EnterpriseEndpoints` 应：
1. 持有 Sentinel、Quota、Recommendation 等 RPC 实现
2. `Register` 方法把它们注册到 `*rpc.Server`

---

## 6. FSM 与状态持久化入口

### 6.1 nomadFSM 企业版钩子

#### CE 占位
[nomad/fsm_registry_ce.go](file:///d:/claude/nomad/nomad/fsm_registry_ce.go)

```go
//go:build !ent

// registerLogAppliers is a no-op for community edition only FSMs.
func (n *nomadFSM) registerLogAppliers() {}

// registerSnapshotRestorers is a no-op for community edition only FSMs.
func (n *nomadFSM) registerSnapshotRestorers() {}

// persistEnterpriseTables is a no-op for community edition only FSMs.
func (s *nomadSnapshot) persistEnterpriseTables(_ raft.SnapshotSink, _ *codec.Encoder) error {
    return nil
}
```

[nomad/fsm_ce.go](file:///d:/claude/nomad/nomad/fsm_ce.go)

```go
//go:build !ent

// allocQuota returns the quota object associated with the allocation. In
// anything but Premium this will always be empty
func (n *nomadFSM) allocQuota(_ string) (string, error) {
    return "", nil
}

// enterpriseSnapshotType is a no-op for community edition.
func enterpriseSnapshotType(s SnapshotType) (string, bool) {
    return "", false
}
```

### 6.2 企业版 FSM 契约

| 函数 | CE 行为 | ENT 预期行为 |
|------|---------|-------------|
| `registerLogAppliers()` | 空操作 | 注册 Sentinel/Quota/Recommendation 等 Raft 日志的 applier |
| `registerSnapshotRestorers()` | 空操作 | 注册企业版表的快照恢复器 |
| `persistEnterpriseTables(sink, enc)` | 返回 nil | 把企业版表写入快照 |
| `allocQuota(allocID)` | 返回 `("", nil)` | 返回分配关联的配额 |
| `enterpriseSnapshotType(s)` | 返回 `("", false)` | 识别企业版快照类型 |

---

## 7. Leader 选举企业版入口

### 7.1 企业版领导权

#### CE 占位
[nomad/leader_ce.go](file:///d:/claude/nomad/nomad/leader_ce.go)

```go
//go:build !ent

// establishEnterpriseLeadership is a no-op on OSS.
func (s *Server) establishEnterpriseLeadership(stopCh chan struct{}, clusterMD structs.ClusterMetadata) error {
    return nil
}

// revokeEnterpriseLeadership is a no-op on OSS>
func (s *Server) revokeEnterpriseLeadership() error {
    return nil
}
```

#### 主代码调用点
[nomad/leader.go#L517-L519](file:///d:/claude/nomad/nomad/leader.go#L517-L519) — `establishLeadership` 中：

```go
// Setup any enterprise systems required.
if err := s.establishEnterpriseLeadership(stopCh, clusterMetadata); err != nil {
    return err
}
```

[nomad/leader.go#L1457-L1459](file:///d:/claude/nomad/nomad/leader.go#L1457-L1459) — `revokeLeadership` 中：

```go
if err := s.revokeEnterpriseLeadership(); err != nil {
    // ...
}
```

### 7.2 企业版领导权契约

ENT 版本在 `establishEnterpriseLeadership` 中应：
- 启动 Sentinel 策略执行器
- 启动配额执行器
- 启动许可证验证 goroutine
- 启动跨区域复制（multiregion）
- 启动建议引擎（recommendation engine）

---

## 8. Job Endpoint 企业版入口

### 8.1 Job 级企业版方法

#### CE 占位
[nomad/job_endpoint_ce.go](file:///d:/claude/nomad/nomad/job_endpoint_ce.go)

```go
//go:build !ent

// enforceSubmitJob is used to check any Sentinel policies for the submit-job scope
func (j *Job) enforceSubmitJob(override bool, job *structs.Job, existingJob *structs.Job, nomadACLToken *structs.ACLToken, ns *structs.Namespace) (error, error) {
    return nil, nil
}

// multiregionCreateDeployment is used to create a deployment to register along
// with the job, if required.
func (j *Job) multiregionCreateDeployment(job *structs.Job, eval *structs.Evaluation) *structs.Deployment {
    return nil
}

// multiregionRegister is used to send a job across multiple regions
func (j *Job) multiregionRegister(args *structs.JobRegisterRequest, reply *structs.JobRegisterResponse, newVersion uint64) (bool, error) {
    return false, nil
}

// multiregionStart is used to kick-off a deployment across multiple regions
func (j *Job) multiregionStart(args *structs.JobRegisterRequest, reply *structs.JobRegisterResponse) error {
    return nil
}

// multiregionDrop is used to deregister regions from a previous version of the
// job that are no longer in use
func (j *Job) multiregionDrop(args *structs.JobRegisterRequest, reply *structs.JobRegisterResponse) error {
    return nil
}

// multiregionStop is used to fan-out Job.Deregister RPCs to all regions if
// the global flag is passed to Job.Deregister
func (j *Job) multiregionStop(job *structs.Job, args *structs.JobDeregisterRequest, reply *structs.JobDeregisterResponse) error {
    return nil
}

// interpolateMultiregionFields interpolates a job for a specific region
func (j *Job) interpolateMultiregionFields(args *structs.JobPlanRequest) error {
    return nil
}

// multiregionSpecChanged checks to see if the job spec has changed.
func (j *Job) multiregionSpecChanged(existingJob *structs.Job, args *structs.JobRegisterRequest) (bool, error) {
    return existingJob.SpecChanged(args.Job), nil
}
```

### 8.2 Job Hooks 企业版入口

#### 8.2.1 Node Pool Hook
[nomad/job_endpoint_hook_node_pool_ce.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_node_pool_ce.go)

```go
//go:build !ent

// enterpriseValidation implements any admission hooks for node pools for Nomad Enterprise.
func (j jobNodePoolValidatingHook) enterpriseValidation(_ *structs.Job, _ *structs.NodePool) ([]error, error) {
    return nil, nil
}

// jobNodePoolMutatingHook mutates the job on Nomad Enterprise only.
type jobNodePoolMutatingHook struct {
    srv *Server
}

func (c jobNodePoolMutatingHook) Mutate(job *structs.Job) (*structs.Job, []error, error) {
    if job.NodePool == "" {
        job.NodePool = structs.NodePoolDefault
    }
    return job, nil, nil
}
```

#### 8.2.2 Consul Hook
[nomad/job_endpoint_hook_consul_ce.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_consul_ce.go)

```go
//go:build !ent

func (h jobConsulHook) validateCluster(name string) error {
    if name != structs.ConsulDefaultCluster {
        return errors.New("non-default Consul cluster requires Nomad Enterprise")
    }
    return nil
}

func (h jobConsulHook) Mutate(job *structs.Job) (*structs.Job, []error, error) {
    return h.mutateImpl(job, structs.ConsulDefaultCluster), nil
}
```

#### 8.2.3 Vault Hook
[nomad/job_endpoint_hook_vault_ce.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_vault_ce.go)

```go
//go:build !ent

func (jobVaultHook) validateNamespaces(blocks map[string]map[string]*structs.Vault) error {
    requestedNamespaces := structs.VaultNamespaceSet(blocks)
    if len(requestedNamespaces) > 0 {
        return fmt.Errorf("%w, Namespaces: %s", ErrMultipleNamespaces, strings.Join(requestedNamespaces, ", "))
    }
    return nil
}

func (h jobVaultHook) validateClustersForNamespace(_ *structs.Job, blocks map[string]map[string]*structs.Vault) error {
    for _, tg := range blocks {
        for _, vault := range tg {
            if vault.Cluster != "default" {
                return errors.New("non-default Vault cluster requires Nomad Enterprise")
            }
        }
    }
    return nil
}
```

### 8.3 Job Endpoint 企业版方法清单

| 方法 | 功能 | CE 行为 |
|------|------|---------|
| `enforceSubmitJob` | Sentinel 策略检查 | 返回 `(nil, nil)` 不强制 |
| `multiregionCreateDeployment` | 跨区域部署创建 | 返回 `nil` |
| `multiregionRegister` | 跨区域注册 | 返回 `(false, nil)` |
| `multiregionStart` | 启动跨区域部署 | 返回 `nil` |
| `multiregionDrop` | 清理无用区域 | 返回 `nil` |
| `multiregionStop` | 跨区域停止 | 返回 `nil` |
| `interpolateMultiregionFields` | 区域字段插值 | 返回 `nil` |
| `multiregionSpecChanged` | 规格变更检查 | 退化为 `SpecChanged` |

---

## 9. Volume 与 CSI 企业版入口

### 9.1 HostVolume 企业版策略

#### CE 占位
[nomad/host_volume_endpoint_ce.go](file:///d:/claude/nomad/nomad/host_volume_endpoint_ce.go)

```go
//go:build !ent

// enforceEnterprisePolicy is the CE stub for Enterprise governance via
// Sentinel policy and quotas
func (v *HostVolume) enforceEnterprisePolicy(
    _ *state.StateSnapshot,
    _ *structs.HostVolume,
    _ *structs.ACLToken,
    _ bool,
) (error, error) {
    return nil, nil
}

// enterpriseNodePoolFilter is the CE stub for filtering nodes during placement
// via Enterprise node pool governance.
func (v *HostVolume) enterpriseNodePoolFilter(_ *state.StateSnapshot, _ *structs.HostVolume) (func(string) bool, error) {
    return func(_ string) bool { return true }, nil
}
```

### 9.2 CSIVolume 企业版策略

#### CE 占位
[nomad/csi_endpoint_ce.go](file:///d:/claude/nomad/nomad/csi_endpoint_ce.go)

```go
//go:build !ent

func (v *CSIVolume) enforceEnterprisePolicy(_ *state.StateSnapshot, _ *structs.CSIVolume, _ *structs.CSIVolume, _ *structs.ACLToken, _ bool) (error, error) {
    return nil, nil
}
```

ENT 版本应在此方法中执行 Sentinel 策略与配额检查。

---

## 10. Client 层企业版入口

### 10.1 EnterpriseClient

#### CE 占位
[client/enterprise_client_ce.go](file:///d:/claude/nomad/client/enterprise_client_ce.go)

```go
//go:build !ent

// EnterpriseClient holds information and methods for enterprise functionality
type EnterpriseClient struct{}

func newEnterpriseClient(logger hclog.Logger) *EnterpriseClient {
    return &EnterpriseClient{}
}

// SetFeatures is used for enterprise builds to configure enterprise features
func (ec *EnterpriseClient) SetFeatures(features uint64) {}
```

#### 主代码调用点
[client/client.go#L315-L316](file:///d:/claude/nomad/client/client.go#L315-L316)

```go
type Client struct {
    // ...
    // EnterpriseClient is used to set and check enterprise features for clients
    EnterpriseClient *EnterpriseClient
    // ...
}
```

[client/client.go#L407](file:///d:/claude/nomad/client/client.go#L407)

```go
func NewClient(cfg *config.Config, ...) (*Client, error) {
    // ...
    c := &Client{
        // ...
        EnterpriseClient:     newEnterpriseClient(logger),
        // ...
    }
}
```

[client/client.go#L2319](file:///d:/claude/nomad/client/client.go#L2319) — `handleClientUpdateResponse` 中：

```go
c.EnterpriseClient.SetFeatures(resp.Features)
```

`resp.Features` 是 `structs.NodeUpdateResponse.Features uint64`，由 server 下发的特性位图。

### 10.2 AllocRunner 企业版入口

#### CE 占位
[client/allocrunner/alloc_runner_ce.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_ce.go)

```go
//go:build !ent

func (ar *allocRunner) SetTaskPauseState(string, structs.TaskScheduleState) error {
    return fmt.Errorf("Enterprise only")
}

func (ar *allocRunner) GetTaskPauseState(taskName string) (structs.TaskScheduleState, error) {
    return "", fmt.Errorf("Enterprise only")
}
```

### 10.3 TaskRunner 企业版入口

#### CE 占位
[client/allocrunner/taskrunner/sched_hook_ce.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/sched_hook_ce.go)

```go
//go:build !ent

type pauseHook struct{}
type pauseGate struct{}

func (pauseHook) Name() string { return taskPauseHookName }
func newPauseHook(...any) pauseHook { return pauseHook{} }
func newPauseGate(...any) *pauseGate { return &pauseGate{} }
func (*pauseGate) Wait() error { return nil }

func (tr *TaskRunner) SetTaskPauseState(structs.TaskScheduleState) error {
    return fmt.Errorf("Enterprise only")
}
```

ENT 版本应实现任务暂停/恢复功能（企业版特性）。

### 10.4 Client Config 企业版入口

#### CE 占位
[client/config/config_ce.go](file:///d:/claude/nomad/client/config/config_ce.go)

```go
//go:build !ent

// GetVaultConfigs returns the set of Vault configurations available for this
// client. In Nomad CE we only use the default Vault.
func (c *Config) GetVaultConfigs(logger hclog.Logger) map[string]*structsc.VaultConfig {
    if c.VaultConfigs["default"] == nil || !c.VaultConfigs["default"].IsEnabled() {
        return nil
    }
    if len(c.VaultConfigs) > 1 {
        logger.Warn("multiple Vault configurations are only supported in Nomad Enterprise")
    }
    return c.VaultConfigs
}

// GetConsulConfigs returns the set of Consul configurations the fingerprint needs
// to check. In Nomad CE we only check the default Consul.
func (c *Config) GetConsulConfigs(logger hclog.Logger) map[string]*structsc.ConsulConfig {
    if c.ConsulConfigs["default"] == nil {
        return nil
    }
    if len(c.ConsulConfigs) > 1 {
        logger.Warn("multiple Consul configurations are only supported in Nomad Enterprise")
    }
    return c.ConsulConfigs
}
```

ENT 版本应支持多集群 Vault/Consul 配置。

---

## 11. Structs 层企业版入口

### 11.1 Namespace 企业版验证

#### CE 占位
[nomad/structs/structs_ce.go](file:///d:/claude/nomad/nomad/structs/structs_ce.go)

```go
//go:build !ent

func (n *Namespace) Canonicalize() {}
func (n *NamespaceNodePoolConfiguration) Canonicalize() {}

func (n *NamespaceNodePoolConfiguration) Validate() error {
    if n != nil {
        return errors.New("Node Pools Governance is unlicensed.")
    }
    return nil
}

func (n *NamespaceVaultConfiguration) Validate() error {
    if n != nil {
        return errors.New("Multi-Cluster Vault is unlicensed.")
    }
    return nil
}

func (n *NamespaceConsulConfiguration) Validate() error {
    if n != nil {
        return errors.New("Multi-Cluster Consul is unlicensed.")
    }
    return nil
}
```

### 11.2 Multiregion 验证

```go
func (m *Multiregion) Validate(jobType string, jobDatacenters []string) error {
    if m != nil {
        return errors.New("Multiregion jobs are unlicensed.")
    }
    return nil
}
```

### 11.3 Scaling Policy 类型验证

```go
func (p *ScalingPolicy) validateType() multierror.Error {
    var mErr multierror.Error
    switch p.Type {
    case ScalingPolicyTypeHorizontal:
        targetErr := p.validateTargetHorizontal()
        mErr.Errors = append(mErr.Errors, targetErr.Errors...)
    default:
        mErr.Errors = append(mErr.Errors, fmt.Errorf(`scaling policy type "%s" is not valid`, p.Type))
    }
    return mErr
}
```

ENT 版本应支持 `ScalingPolicyTypeVertical` 等额外类型。

### 11.4 Node Pool 与 Consul 企业版

[nomad/structs/node_pool_ce.go](file:///d:/claude/nomad/nomad/structs/node_pool_ce.go)

```go
func (n *NodePoolSchedulerConfiguration) Validate() error {
    if n != nil {
        return errors.New("Node Pools Governance is unlicensed.")
    }
    return nil
}
```

[nomad/structs/consul_ce.go](file:///d:/claude/nomad/nomad/structs/consul_ce.go)

```go
func (c *Consul) GetNamespace() string {
    return ""
}

func (t *Task) GetConsulClusterName(_ *TaskGroup) string {
    return ConsulDefaultCluster
}

func (s *Service) GetConsulClusterName(_ *TaskGroup) string {
    return ConsulDefaultCluster
}
```

ENT 版本应支持 Consul Namespace 与多集群。

---

## 12. Scheduler 层企业版入口

### 12.1 StateEnterprise 接口

#### CE 占位
[scheduler/scheduler_ce.go](file:///d:/claude/nomad/scheduler/scheduler_ce.go)

```go
//go:build !ent

// StateEnterprise are the available state store methods for the enterprise
// version.
type StateEnterprise interface {
}
```

ENT 版本的 `StateEnterprise` 接口应包含企业版状态存储方法（如 Quota、Sentinel 等表的查询）。

[scheduler/feasible/numa_ce.go](file:///d:/claude/nomad/scheduler/feasible/numa_ce.go) 提供企业版 NUMA 调度的 CE 占位。

---

## 13. Autopilot 企业版入口

### 13.1 Autopilot 扩展

#### CE 占位
[nomad/autopilot_ce.go](file:///d:/claude/nomad/nomad/autopilot_ce.go)

```go
//go:build !ent

func (s *Server) autopilotPromoter() autopilot.Promoter {
    return autopilot.DefaultPromoter()
}

// autopilotServerExt returns the autopilot-enterprise.Server extensions needed
// for ENT feature support, but this is the empty OSS implementation.
func (s *Server) autopilotServerExt(_ *peers.Parts) interface{} {
    return nil
}

func (s *Server) autopilotStateExt(_ *autopilot.State, _ *structs.OperatorHealthReply) error {
    return nil
}

// autopilotConfigExt returns the autopilot-enterprise.Config extensions needed
// for ENT feature support, but this is the empty OSS implementation.
func autopilotConfigExt(_ *structs.AutopilotConfig) interface{} {
    return nil
}
```

ENT 版本应提供：
- 自定义 Promoter（如基于延迟的晋升策略）
- 服务器扩展信息（如企业版元数据）
- 状态扩展（如额外健康指标）
- 配置扩展（如企业版 Autopilot 配置项）

---

## 14. CLI 命令企业版入口

### 14.1 EntCommands

#### CE 占位
[command/commands_ce.go](file:///d:/claude/nomad/command/commands_ce.go)

```go
//go:build !ent

func EntCommands(metaPtr *Meta, agentUi cli.Ui) map[string]cli.CommandFactory {
    return map[string]cli.CommandFactory{}
}
```

#### 主代码调用点
[command/commands.go#L1424-L1426](file:///d:/claude/nomad/command/commands.go#L1424-L1426)

```go
func Commands(metaPtr *Meta, agentUi cli.Ui) map[string]cli.CommandFactory {
    all := map[string]cli.CommandFactory{}
    // ... 注册 OSS 命令 ...
    for k, v := range deprecated {
        all[k] = v
    }

    for k, v := range EntCommands(metaPtr, agentUi) {
        all[k] = v
    }
}
```

### 14.2 企业版命令清单（推测）

根据测试文件 [command/quota_*_test.go](file:///d:/claude/nomad/command/) 使用 `//go:build ent`，企业版提供以下 CLI：

| 命令 | 功能 |
|------|------|
| `nomad quota apply` | 应用配额规范 |
| `nomad quota list` | 列出配额 |
| `nomad quota inspect` | 查看配额详情 |
| `nomad quota status` | 配额状态 |
| `nomad quota delete` | 删除配额 |
| `nomad sentinel policy apply` | 应用 Sentinel 策略 |
| `nomad sentinel policy list` | 列出 Sentinel 策略 |
| `nomad sentinel policy delete` | 删除 Sentinel 策略 |
| `nomad recommendation apply` | 应用扩缩容建议 |

---

## 15. 配置与 License 入口

### 15.1 DefaultEntConfig

#### CE 占位
[command/agent/config_ce.go](file:///d:/claude/nomad/command/agent/config_ce.go)

```go
//go:build !ent

// DefaultEntConfig is an empty config in open source
func DefaultEntConfig() *Config {
    return &Config{}
}
```

#### 主代码调用点
[command/agent/command.go#L263-L264](file:///d:/claude/nomad/command/agent/command.go#L263-L264)

```go
config = DefaultConfig()
// Merge in the enterprise overlay
config = config.Merge(DefaultEntConfig())
```

ENT 版本的 `DefaultEntConfig` 应返回包含审计、Sentinel 等默认配置的 `Config`。

### 15.2 LicenseConfig

[nomad/license_config.go](file:///d:/claude/nomad/nomad/license_config.go)（无 build tag，CE/ENT 共用）：

```go
type LicenseConfig struct {
    BuildDate        time.Time
    NonProduction    bool
    Edition          string
    AddOn            string
    LicenseEnvBytes  string
    LicensePath      string
    AdditionalPubKeys []string
}
```

**说明：** 此结构在 CE 中也存在，但 CE 不使用许可证（`LicenseConfig` 仅用于测试脚手架）。ENT 版本通过此配置启动许可证验证器。

### 15.3 Encrypter（密钥加密）

#### CE 占位
[nomad/encrypter_ce.go](file:///d:/claude/nomad/nomad/encrypter_ce.go)

```go
//go:build !ent

func getProviderConfigs(srv *Server) (map[string]*structs.KEKProviderConfig, error) {
    providerConfigs := map[string]*structs.KEKProviderConfig{}
    config := srv.GetConfig()
    var active int
    for _, provider := range config.KEKProviderConfigs {
        if provider.Active {
            active++
        }
        if provider.Provider == structs.KEKProviderVaultTransit {
            fallbackVaultConfig(provider, config.GetDefaultVault())
        }
        providerConfigs[provider.ID()] = provider
    }
    if active > 1 {
        return nil, fmt.Errorf(
            "only one server.keyring can be active in Nomad Community Edition")
    }

    if len(srv.config.KEKProviderConfigs) == 0 {
        providerConfigs[string(structs.KEKProviderAEAD)] = &structs.KEKProviderConfig{
            Provider: structs.KEKProviderAEAD,
            Active:   true,
        }
    }
    return providerConfigs, nil
}
```

**CE 限制：** 只允许一个 active KEK provider。ENT 版本应支持多 active provider（密钥轮换）。

---

## 16. 企业版功能清单

根据 CE 占位代码反推，Nomad 企业版提供以下功能：

### 16.1 治理与策略

| 功能 | 入口 | 说明 |
|------|------|------|
| **Sentinel 策略** | `enforceSubmitJob`/`enforceEnterprisePolicy`/HTTP `/v1/sentinel/` | 策略即代码，在 job/volume 注册时强制执行 |
| **配额（Quotas）** | `allocQuota`/HTTP `/v1/quotas` | 命名空间级资源配额限制 |
| **节点池治理** | `NamespaceNodePoolConfiguration.Validate`/`enterpriseNodePoolFilter` | 限制命名空间可用的节点池 |

### 16.2 多区域与多集群

| 功能 | 入口 | 说明 |
|------|------|------|
| **Multiregion Jobs** | `multiregionRegister`/`multiregionStart`/`multiregionStop` | 跨区域 job 部署 |
| **多集群 Consul** | `GetConsulClusterName`/`GetConsulConfigs` | 一个 Nomad 集群对接多个 Consul |
| **多集群 Vault** | `validateClustersForNamespace`/`GetVaultConfigs` | 一个 Nomad 集群对接多个 Vault |
| **Consul Namespace** | `Consul.GetNamespace` | Consul 企业版命名空间支持 |

### 16.3 调度增强

| 功能 | 入口 | 说明 |
|------|------|------|
| **垂直扩缩容** | `ScalingPolicy.validateType` | 支持 `vertical` 扩缩容类型 |
| **NUMA 亲和** | [scheduler/feasible/numa_ce.go](file:///d:/claude/nomad/scheduler/feasible/numa_ce.go) | NUMA 节点亲和调度 |
| **任务暂停/恢复** | `SetTaskPauseState`/`pauseHook`/`pauseGate` | 任务调度暂停 |
| **扩缩容建议** | HTTP `/v1/recommendations` | 自动扩缩容建议引擎 |

### 16.4 安全与审计

| 功能 | 入口 | 说明 |
|------|------|------|
| **审计日志** | `setupEnterpriseAgent`/`auditHandler`/`auditHTTPHandler` | HTTP/RPC 请求审计 |
| **密钥轮换** | `getProviderConfigs` | 多 active KEK provider |

### 16.5 运维增强

| 功能 | 入口 | 说明 |
|------|------|------|
| **Autopilot 增强** | `autopilotPromoter`/`autopilotServerExt`/`autopilotConfigExt` | 自定义晋升策略 |
| **许可证管理** | `LicenseConfig` | 许可证验证与特性开关 |

### 16.6 特性开关机制

[client/client.go#L2319](file:///d:/claude/nomad/client/client.go#L2319) 的 `SetFeatures(features uint64)` 表明企业版使用**位图特性开关**：

```go
c.EnterpriseClient.SetFeatures(resp.Features)
```

server 通过 `NodeUpdateResponse.Features` 下发当前许可证启用的特性位图，client 据此启用对应企业版功能。

---

## 17. 源码文件索引

### CE 占位文件清单（按层分类）

#### Agent 层

| 文件 | 关键函数 |
|------|---------|
| [command/agent/agent_ce.go](file:///d:/claude/nomad/command/agent/agent_ce.go) | `EnterpriseAgent`、`setupEnterpriseAgent`、`entReloadEventer` |
| [command/agent/http_ce.go](file:///d:/claude/nomad/command/agent/http_ce.go) | `registerEnterpriseHandlers`、`entOnly`、`auditHandler`、`auditNonJSONHandler`、`auditHTTPHandler` |
| [command/agent/config_ce.go](file:///d:/claude/nomad/command/agent/config_ce.go) | `DefaultEntConfig` |
| [command/agent/operator_endpoint_ce.go](file:///d:/claude/nomad/command/agent/operator_endpoint_ce.go) | Operator 端点 CE 占位 |
| [command/agent/testagent_ce.go](file:///d:/claude/nomad/command/agent/testagent_ce.go) | 测试用 Agent CE 占位 |

#### Server 层

| 文件 | 关键函数 |
|------|---------|
| [nomad/endpoints_ce.go](file:///d:/claude/nomad/nomad/endpoints_ce.go) | `EnterpriseEndpoints`、`NewEnterpriseEndpoints`、`Register` |
| [nomad/leader_ce.go](file:///d:/claude/nomad/nomad/leader_ce.go) | `establishEnterpriseLeadership`、`revokeEnterpriseLeadership` |
| [nomad/fsm_ce.go](file:///d:/claude/nomad/nomad/fsm_ce.go) | `allocQuota`、`enterpriseSnapshotType` |
| [nomad/fsm_registry_ce.go](file:///d:/claude/nomad/nomad/fsm_registry_ce.go) | `registerLogAppliers`、`registerSnapshotRestorers`、`persistEnterpriseTables` |
| [nomad/autopilot_ce.go](file:///d:/claude/nomad/nomad/autopilot_ce.go) | `autopilotPromoter`、`autopilotServerExt`、`autopilotStateExt`、`autopilotConfigExt` |
| [nomad/encrypter_ce.go](file:///d:/claude/nomad/nomad/encrypter_ce.go) | `getProviderConfigs` |
| [nomad/search_endpoint_ce.go](file:///d:/claude/nomad/nomad/search_endpoint_ce.go) | `allContexts`、`contextToIndex`、`getEnterpriseMatch`、`getEnterpriseResourceIter`、`getEnterpriseFuzzyResourceIter`、`filteredSearchContextsEnt` |
| [nomad/testing_ce.go](file:///d:/claude/nomad/nomad/testing_ce.go) | `defaultEnterpriseTestConfig` |

#### Job Endpoint 层

| 文件 | 关键函数 |
|------|---------|
| [nomad/job_endpoint_ce.go](file:///d:/claude/nomad/nomad/job_endpoint_ce.go) | `enforceSubmitJob`、`multiregionCreateDeployment`、`multiregionRegister`、`multiregionStart`、`multiregionDrop`、`multiregionStop`、`interpolateMultiregionFields`、`multiregionSpecChanged` |
| [nomad/job_endpoint_hook_node_pool_ce.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_node_pool_ce.go) | `enterpriseValidation`、`jobNodePoolMutatingHook` |
| [nomad/job_endpoint_hook_consul_ce.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_consul_ce.go) | `validateCluster`、`Mutate` |
| [nomad/job_endpoint_hook_vault_ce.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_vault_ce.go) | `validateNamespaces`、`validateClustersForNamespace`、`Mutate` |
| [nomad/job_endpoint_hook_sched_ce.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_sched_ce.go) | 调度 hook CE 占位 |
| [nomad/job_endpoint_hook_numa_ce.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_numa_ce.go) | NUMA hook CE 占位 |

#### Volume 层

| 文件 | 关键函数 |
|------|---------|
| [nomad/host_volume_endpoint_ce.go](file:///d:/claude/nomad/nomad/host_volume_endpoint_ce.go) | `enforceEnterprisePolicy`、`enterpriseNodePoolFilter` |
| [nomad/csi_endpoint_ce.go](file:///d:/claude/nomad/nomad/csi_endpoint_ce.go) | `enforceEnterprisePolicy` |

#### Client 层

| 文件 | 关键函数 |
|------|---------|
| [client/enterprise_client_ce.go](file:///d:/claude/nomad/client/enterprise_client_ce.go) | `EnterpriseClient`、`newEnterpriseClient`、`SetFeatures` |
| [client/config/config_ce.go](file:///d:/claude/nomad/client/config/config_ce.go) | `GetVaultConfigs`、`GetConsulConfigs` |
| [client/allocrunner/alloc_runner_ce.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_ce.go) | `SetTaskPauseState`、`GetTaskPauseState` |
| [client/allocrunner/taskrunner/sched_hook_ce.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/sched_hook_ce.go) | `pauseHook`、`pauseGate`、`SetTaskPauseState` |

#### Structs 层

| 文件 | 关键函数 |
|------|---------|
| [nomad/structs/structs_ce.go](file:///d:/claude/nomad/nomad/structs/structs_ce.go) | `Namespace.Canonicalize`、`NamespaceNodePoolConfiguration.Validate`、`NamespaceVaultConfiguration.Validate`、`NamespaceConsulConfiguration.Validate`、`Multiregion.Validate`、`ScalingPolicy.validateType`、`Job.GetEntScalingPolicies` |
| [nomad/structs/node_pool_ce.go](file:///d:/claude/nomad/nomad/structs/node_pool_ce.go) | `NodePoolSchedulerConfiguration.Validate` |
| [nomad/structs/consul_ce.go](file:///d:/claude/nomad/nomad/structs/consul_ce.go) | `Consul.GetNamespace`、`Task.GetConsulClusterName`、`Service.GetConsulClusterName` |

#### Scheduler 层

| 文件 | 关键函数 |
|------|---------|
| [scheduler/scheduler_ce.go](file:///d:/claude/nomad/scheduler/scheduler_ce.go) | `StateEnterprise` 接口（空） |
| [scheduler/feasible/numa_ce.go](file:///d:/claude/nomad/scheduler/feasible/numa_ce.go) | NUMA 调度 CE 占位 |

#### 其他

| 文件 | 关键函数 |
|------|---------|
| [nomad/deploymentwatcher/multiregion_ce.go](file:///d:/claude/nomad/nomad/deploymentwatcher/multiregion_ce.go) | 多区域部署 watcher CE 占位 |
| [helper/raftutil/fsm_ce.go](file:///d:/claude/nomad/helper/raftutil/fsm_ce.go) | Raft FSM CE 占位 |
| [nomad/state/events_ce.go](file:///d:/claude/nomad/nomad/state/events_ce.go) | 事件存储 CE 占位 |
| [command/commands_ce.go](file:///d:/claude/nomad/command/commands_ce.go) | `EntCommands`（返回空 map） |

### 主代码调用点

| 文件 | 行号 | 调用 |
|------|------|------|
| [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go#L176) | L176 | `setupEnterpriseAgent(logger)` |
| [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go#L1665) | L1665 | `entReloadEventer(newConfig.Audit)` |
| [command/agent/http.go](file:///d:/claude/nomad/command/agent/http.go#L574) | L574 | `registerEnterpriseHandlers()` |
| [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go#L264) | L264 | `config.Merge(DefaultEntConfig())` |
| [nomad/server.go](file:///d:/claude/nomad/nomad/server.go#L1340) | L1340 | `NewEnterpriseEndpoints(s, ctx)` + `ent.Register(server)` |
| [nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go#L517) | L517 | `establishEnterpriseLeadership(stopCh, clusterMetadata)` |
| [nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go#L1457) | L1457 | `revokeEnterpriseLeadership()` |
| [client/client.go](file:///d:/claude/nomad/client/client.go#L407) | L407 | `newEnterpriseClient(logger)` |
| [client/client.go](file:///d:/claude/nomad/client/client.go#L2319) | L2319 | `EnterpriseClient.SetFeatures(resp.Features)` |
| [command/commands.go](file:///d:/claude/nomad/command/commands.go#L1424) | L1424 | `EntCommands(metaPtr, agentUi)` |
| [nomad/testing.go](file:///d:/claude/nomad/nomad/testing.go#L73) | L73 | `defaultEnterpriseTestConfig(config)` |

### License 与配置文件

| 文件 | 说明 |
|------|------|
| [nomad/license_config.go](file:///d:/claude/nomad/nomad/license_config.go) | `LicenseConfig` 结构（CE/ENT 共用，CE 仅用于测试） |

---

## 附录：CE/ENT 编译对照

### CE 版本编译

```bash
# 默认不带 ent tag
make dev
# 实际执行：
# go build -tags "ui hashicorpmetrics" -o nomad
# 生效文件：所有 _ce.go（!ent tag）
```

### 企业版编译（需要企业版源码）

```bash
# 需要 nomad-enterprise 仓库
go build -tags "ent ui hashicorpmetrics" -o nomad
# 生效文件：所有 _ent.go（ent tag）
```

### 测试编译

```bash
# CE 测试
go test -tags "ui hashicorpmetrics" ./...

# ENT 测试
go test -tags "ent ui hashicorpmetrics" ./...
```

测试文件也有 build tag 区分：
- `*_ce_test.go`（`//go:build !ent`）：CE 专属测试
- `*_ent_test.go`（`//go:build ent`）：企业版专属测试（如 [api/sentinel_test.go](file:///d:/claude/nomad/api/sentinel_test.go)、[api/quota_test.go](file:///d:/claude/nomad/api/quota_test.go)、[command/quota_*_test.go](file:///d:/claude/nomad/command/)）

---

*本文档基于 Nomad 开源版源码（截至 2026-07-21）中 CE 占位代码反推企业版入口契约。所有源码引用均带可点击链接。企业版真实实现不在开源仓库中。*
