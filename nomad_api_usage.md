# Nomad API 使用分析

本文档分析 `api/` 目录下所有 API 的定义、调用位置、参数及说明。

## 目录

- [1. 核心客户端 (api.go)](#1-核心客户端-apigo)
- [2. Jobs API (jobs.go)](#2-jobs-api-jobsgo)
- [3. Allocations API (allocations.go)](#3-allocations-api-allocationsgo)
- [4. Nodes API (nodes.go)](#4-nodes-api-nodesgo)
- [5. Deployments API (deployments.go)](#5-deployments-api-deploymentsgo)
- [6. Evaluations API (evaluations.go)](#6-evaluations-api-evaluationsgo)
- [7. ACL API (acl.go)](#7-acl-api-aclgo)
- [8. Agent API (agent.go)](#8-agent-api-agentgo)
- [9. CSI API (csi.go)](#9-csi-api-csigo)
- [10. FS API (fs.go)](#10-fs-api-fsgo)
- [11. EventStream API (event_stream.go)](#11-eventstream-api-event_streamgo)
- [12. Host Volumes API (host_volumes.go)](#12-host-volumes-api-host_volumesgo)
- [13. Host Volume Claims API (host_volume_claims.go)](#13-host-volume-claims-api-host_volume_claimsgo)
- [14. Search API (search.go)](#14-search-api-searchgo)
- [15. Services API (services.go)](#15-services-api-servicesgo)
- [16. Status API (status.go)](#16-status-api-statusgo)
- [17. System API (system.go)](#17-system-api-systemgo)
- [18. Regions API (regions.go)](#18-regions-api-regionsgo)
- [19. Operator API (operator.go / operator_autopilot.go / operator_metrics.go)](#19-operator-api-operatorgo--operator_autopilotgo--operator_metricsgo)
- [20. Quotas API (quota.go)](#20-quotas-api-quotago)
- [21. Namespaces API (namespace.go)](#21-namespaces-api-namespacego)
- [22. Node Pools API (node_pools.go)](#22-node-pools-api-node_poolsgo)
- [23. Variables API (variables.go)](#23-variables-api-variablesgo)
- [24. Keyring API (keyring.go)](#24-keyring-api-keyringgo)
- [25. Locks API (locks.go)](#25-locks-api-locksgo)
- [26. Sentinel Policies API (sentinel.go)](#26-sentinel-policies-api-sentinelgo)
- [27. Scaling API (scaling.go)](#27-scaling-api-scalinggo)
- [28. Recommendations API (recommendations.go)](#28-recommendations-api-recommendationsgo)
- [29. Raw API (raw.go)](#29-raw-api-rawgo)
- [30. Node Meta API (node_meta.go)](#30-node-meta-api-node_metago)
- [31. Node Identity API (node_identity.go)](#31-node-identity-api-node_identitygo)
- [32. ACL Identity API (acl.go)](#32-acl-identity-api-aclgo)

---

## 通用参数说明

### QueryOptions（查询选项，用于 GET 请求）

| 参数 | 类型 | 说明 |
|------|------|------|
| `Region` | `string` | 目标区域 |
| `Namespace` | `string` | 目标命名空间 |
| `AllowStale` | `bool` | 允许返回过时数据 |
| `WaitIndex` | `uint64` | 阻塞查询的等待索引 |
| `WaitTime` | `time.Duration` | 阻塞查询的最长等待时间 |
| `Prefix` | `string` | 前缀过滤 |
| `Params` | `map[string]string` | 额外查询参数 |
| `Headers` | `map[string]string` | 自定义 HTTP 头 |
| `AuthToken` | `string` | ACL 认证令牌 |
| `Filter` | `string` | 过滤表达式 |
| `PerPage` | `int32` | 分页大小 |
| `NextToken` | `string` | 下一页令牌 |
| `Reverse` | `bool` | 反向排序 |

### WriteOptions（写入选项，用于 POST/PUT/DELETE 请求）

| 参数 | 类型 | 说明 |
|------|------|------|
| `Region` | `string` | 目标区域 |
| `Namespace` | `string` | 目标命名空间 |
| `AuthToken` | `string` | ACL 认证令牌 |
| `Headers` | `map[string]string` | 自定义 HTTP 头 |
| `IdempotencyToken` | `string` | 幂等令牌 |

### QueryMeta（查询返回元数据）

| 字段 | 类型 | 说明 |
|------|------|------|
| `LastIndex` | `uint64` | 最后一个索引（用于阻塞查询） |
| `RequestTime` | `time.Duration` | 请求耗时 |
| `KnownLeader` | `bool` | 是否已知领导者 |
| `NextToken` | `string` | 下一页令牌 |

### WriteMeta（写入返回元数据）

| 字段 | 类型 | 说明 |
|------|------|------|
| `LastIndex` | `uint64` | 最后一个索引 |

---

## 1. 核心客户端 (api.go)

**文件**: [api/api.go](file:///d:/claude/nomad/api/api.go)

`Client` 是所有 API 调用的入口，通过 `NewClient(config *Config)` 创建。每个 API 组通过访问器方法获取（如 `client.Jobs()`）。

### 核心方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `NewClient` | `func NewClient(config *Config) (*Client, error)` | 创建新 API 客户端 |
| `SetConfig` | `func (c *Client) SetConfig(config *Config)` | 更新客户端配置 |
| `request` | `func (c *Client) request(method, path string, body, out any, q *QueryOptions) (*QueryMeta, error)` | 底层 HTTP 请求 |
| `query` | `func (c *Client) query(endpoint string, out any, q *QueryOptions) (*QueryMeta, error)` | GET 请求 |
| `put` | `func (c *Client) put(endpoint string, body, out any, q *WriteOptions) (*WriteMeta, error)` | PUT 请求 |
| `post` | `func (c *Client) post(endpoint string, body, out any, q *WriteOptions) (*WriteMeta, error)` | POST 请求 |
| `delete` | `func (c *Client) delete(endpoint string, out any, q *WriteOptions) (*WriteMeta, error)` | DELETE 请求 |

### 所有 API 组访问器

| 访问器 | 返回类型 | 文件 |
|--------|----------|------|
| `client.Jobs()` | `*Jobs` | jobs.go |
| `client.Allocations()` | `*Allocations` | allocations.go |
| `client.Nodes()` | `*Nodes` | nodes.go |
| `client.Deployments()` | `*Deployments` | deployments.go |
| `client.Evaluations()` | `*Evaluations` | evaluations.go |
| `client.ACLPolicies()` | `*ACLPolicies` | acl.go |
| `client.ACLTokens()` | `*ACLTokens` | acl.go |
| `client.ACLRoles()` | `*ACLRoles` | acl.go |
| `client.ACLAuthMethods()` | `*ACLAuthMethods` | acl.go |
| `client.ACLBindingRules()` | `*ACLBindingRules` | acl.go |
| `client.ACLAuth()` | `*ACLAuth` | acl.go |
| `client.Agent()` | `*Agent` | agent.go |
| `client.AllocFS()` | `*AllocFS` | fs.go |
| `client.CSIVolumes()` | `*CSIVolumes` | csi.go |
| `client.CSIPlugins()` | `*CSIPlugins` | csi.go |
| `client.EventStream()` | `*EventStream` | event_stream.go |
| `client.HostVolumes()` | `*HostVolumes` | host_volumes.go |
| `client.TaskGroupHostVolumeClaims()` | `*TaskGroupHostVolumeClaims` | host_volume_claims.go |
| `client.Search()` | `*Search` | search.go |
| `client.Services()` | `*Services` | services.go |
| `client.Status()` | `*Status` | status.go |
| `client.System()` | `*System` | system.go |
| `client.Regions()` | `*Regions` | regions.go |
| `client.Operator()` | `*Operator` | operator.go |
| `client.Quotas()` | `*Quotas` | quota.go |
| `client.Namespaces()` | `*Namespaces` | namespace.go |
| `client.NodePools()` | `*NodePools` | node_pools.go |
| `client.Variables()` | `*Variables` | variables.go |
| `client.Keyring()` | `*Keyring` | keyring.go |
| `client.Locks()` | `*Locks` | locks.go |
| `client.SentinelPolicies()` | `*SentinelPolicies` | sentinel.go |
| `client.Scaling()` | `*Scaling` | scaling.go |
| `client.Recommendations()` | `*Recommendations` | recommendations.go |
| `client.Raw()` | `*Raw` | raw.go |

---

## 2. Jobs API (jobs.go)

**文件**: [api/jobs.go](file:///d:/claude/nomad/api/jobs.go)

Jobs API 提供作业（Job）的提交、查询、规划、缩放、停止等操作。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `ParseHCL` | `/v1/jobs/parse` | POST | `jobHCL string, canonicalize bool` | `*Job, error` | 解析 HCL 作业定义 |
| `ParseHCLOpts` | `/v1/jobs/parse` | POST | `req *JobsParseRequest` | `*Job, error` | 解析 HCL（带选项） |
| `Validate` | `/v1/validate/job` | POST | `job *Job, q *WriteOptions` | `*JobValidateResponse, *WriteMeta, error` | 验证作业 |
| `Register` | `/v1/jobs` | PUT | `job *Job, q *WriteOptions` | `*JobRegisterResponse, *WriteMeta, error` | 注册/更新作业 |
| `EnforceRegister` | `/v1/jobs` | PUT | `job *Job, modifyIndex uint64, q *WriteOptions` | `*JobRegisterResponse, *WriteMeta, error` | 强制注册（带版本检查） |
| `RegisterOpts` | `/v1/jobs` | PUT | `job *Job, opts *RegisterOptions, q *WriteOptions` | `*JobRegisterResponse, *WriteMeta, error` | 注册（带选项） |
| `List` | `/v1/jobs` | GET | `q *QueryOptions` | `[]*JobListStub, *QueryMeta, error` | 列出所有作业 |
| `ListOptions` | `/v1/jobs` | GET | `opts *JobListOptions, q *QueryOptions` | `[]*JobListStub, *QueryMeta, error` | 列出作业（带过滤选项） |
| `PrefixList` | `/v1/jobs` | GET | `prefix string` | `[]*JobListStub, *QueryMeta, error` | 前缀搜索作业 |
| `Info` | `/v1/job/{jobID}` | GET | `jobID string, q *QueryOptions` | `*Job, *QueryMeta, error` | 获取作业详情 |
| `Scale` | `/v1/job/{jobID}/scale` | POST | `jobID, group string, count *int, message string, error bool, meta map[string]interface{}, q *WriteOptions` | `*JobRegisterResponse, *WriteMeta, error` | 缩放作业任务组 |
| `ScaleWithRequest` | `/v1/job/{jobID}/scale` | POST | `jobID string, req *ScalingRequest, q *WriteOptions` | `*JobRegisterResponse, *WriteMeta, error` | 缩放（带完整请求） |
| `ScaleStatus` | `/v1/job/{jobID}/scale` | GET | `jobID string, q *QueryOptions` | `*JobScaleStatusResponse, *QueryMeta, error` | 获取缩放状态 |
| `Versions` | `/v1/job/{jobID}/versions` | GET | `jobID string, diffs bool, q *QueryOptions` | `[]*Job, []*JobDiff, *QueryMeta, error` | 获取作业版本历史 |
| `VersionByTag` | `/v1/job/{jobID}/version` | GET | `jobID, tag string, q *QueryOptions` | `*Job, *QueryMeta, error` | 按标签获取版本 |
| `VersionsOpts` | `/v1/job/{jobID}/versions` | GET | `jobID string, opts *VersionsOptions, q *QueryOptions` | `[]*Job, []*JobDiff, *QueryMeta, error` | 获取版本（带选项） |
| `Submission` | `/v1/job/{jobID}/submission` | GET | `jobID string, version int, q *QueryOptions` | `*JobSubmission, *QueryMeta, error` | 获取作业提交源码 |
| `Allocations` | `/v1/job/{jobID}/allocations` | GET | `jobID string, allAllocs bool, q *QueryOptions` | `[]*AllocationListStub, *QueryMeta, error` | 获取作业的分配 |
| `Deployments` | `/v1/job/{jobID}/deployments` | GET | `jobID string, all bool, q *QueryOptions` | `[]*Deployment, *QueryMeta, error` | 获取作业的部署 |
| `LatestDeployment` | `/v1/job/{jobID}/deployment` | GET | `jobID string, q *QueryOptions` | `*Deployment, *QueryMeta, error` | 获取最新部署 |
| `Evaluations` | `/v1/job/{jobID}/evaluations` | GET | `jobID string, q *QueryOptions` | `[]*Evaluation, *QueryMeta, error` | 获取作业的评估 |
| `Deregister` | `/v1/job/{jobID}` | DELETE | `jobID string, purge bool, q *WriteOptions` | `string, *WriteMeta, error` | 注销作业 |
| `DeregisterOpts` | `/v1/job/{jobID}` | DELETE | `jobID string, opts *DeregisterOptions, q *WriteOptions` | `string, *WriteMeta, error` | 注销作业（带选项） |
| `ForceEvaluate` | `/v1/job/{jobID}/evaluate` | POST | `jobID string, q *WriteOptions` | `string, *WriteMeta, error` | 强制重新评估 |
| `EvaluateWithOpts` | `/v1/job/{jobID}/evaluate` | POST | `jobID string, opts EvalOptions, q *WriteOptions` | `string, *WriteMeta, error` | 评估（带选项） |
| `PeriodicForce` | `/v1/job/{jobID}/periodic/force` | POST | `jobID string, q *WriteOptions` | `string, *WriteMeta, error` | 强制运行周期性作业 |
| `Plan` | `/v1/job/plan` | POST | `job *Job, diff bool, q *WriteOptions` | `*JobPlanResponse, *WriteMeta, error` | 规划作业 |
| `PlanOpts` | `/v1/job/plan` | POST | `job *Job, opts *PlanOptions, q *WriteOptions` | `*JobPlanResponse, *WriteMeta, error` | 规划作业（带选项） |
| `Summary` | `/v1/job/{jobID}/summary` | GET | `jobID string, q *QueryOptions` | `*JobSummary, *QueryMeta, error` | 获取作业摘要 |
| `Dispatch` | `/v1/job/{jobID}/dispatch` | POST | `jobID string, meta map[string]string, payload []byte, idPrefixTemplate string, q *WriteOptions` | `*JobDispatchResponse, *WriteMeta, error` | 派发参数化作业 |
| `DispatchOpts` | `/v1/job/{jobID}/dispatch` | POST | `opts *DispatchOptions, q *WriteOptions` | `*JobDispatchResponse, *WriteMeta, error` | 派发（带完整选项） |
| `Revert` | `/v1/job/{jobID}/revert` | POST | `jobID string, version uint64, enforcePriorVersion *uint64, consulToken, vaultToken string, q *WriteOptions` | `*JobRegisterResponse, *WriteMeta, error` | 回滚到旧版本 |
| `Stable` | `/v1/job/{jobID}/stable` | POST | `jobID string, version uint64, stable bool, q *WriteOptions` | `*JobRegisterResponse, *WriteMeta, error` | 设置作业版本稳定性 |
| `Services` | `/v1/job/{jobID}/services` | GET | `jobID string, q *QueryOptions` | `[]*ServiceRegistration, *QueryMeta, error` | 获取作业服务注册 |
| `ActionExec` | `/v1/job/{jobID}/action` | GET(WS) | `ctx context.Context, alloc *Allocation, job *Job, task, action string, q *QueryOptions` | `ExecStream, error` | 执行作业动作 |
| `TagVersionOpts` | `/v1/job/{jobID}/versions/tag` | POST | `jobID, name string, req *TagVersionRequest, q *WriteOptions` | `*WriteMeta, error` | 给版本打标签（带选项） |
| `TagVersion` | `/v1/job/{jobID}/versions/tag` | POST | `jobID string, version uint64, name string, description string, q *WriteOptions` | `*WriteMeta, error` | 给版本打标签 |
| `UntagVersion` | `/v1/job/{jobID}/versions/untag` | POST | `jobID string, name string, q *WriteOptions` | `*WriteMeta, error` | 移除版本标签 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/job_run.go](file:///d:/claude/nomad/command/job_run.go) | `Register`, `Plan` |
| [command/job_plan.go](file:///d:/claude/nomad/command/job_plan.go) | `Plan`, `PlanOpts` |
| [command/job_stop.go](file:///d:/claude/nomad/command/job_stop.go) | `Deregister`, `DeregisterOpts` |
| [command/job_status.go](file:///d:/claude/nomad/command/job_status.go) | `Info`, `Allocations`, `Summary` |
| [command/job_inspect.go](file:///d:/claude/nomad/command/job_inspect.go) | `Info` |
| [command/job_scale.go](file:///d:/claude/nomad/command/job_scale.go) | `Scale`, `ScaleStatus` |
| [command/job_dispatch.go](file:///d:/claude/nomad/command/job_dispatch.go) | `DispatchOpts`, `Info`, `Summary`, `Allocations`, `PrefixList` |
| [command/job_eval.go](file:///d:/claude/nomad/command/job_eval.go) | `EvaluateWithOpts` |
| [command/job_history.go](file:///d:/claude/nomad/command/job_history.go) | `VersionsOpts` |
| [command/job_allocs.go](file:///d:/claude/nomad/command/job_allocs.go) | `Info`, `Allocations` |
| [command/job_deployments.go](file:///d:/claude/nomad/command/job_deployments.go) | `LatestDeployment`, `Deployments` |
| [command/job_validate.go](file:///d:/claude/nomad/command/job_validate.go) | `Validate` |
| [command/job_revert.go](file:///d:/claude/nomad/command/job_revert.go) | `Revert`, `Versions` |
| [command/job_start.go](file:///d:/claude/nomad/command/job_start.go) | `Register` |
| [command/job_periodic_force.go](file:///d:/claude/nomad/command/job_periodic_force.go) | `PeriodicForce` |
| [command/job_scaling_events.go](file:///d:/claude/nomad/command/job_scaling_events.go) | `ScaleStatus` |
| [command/job_promote.go](file:///d:/claude/nomad/command/job_promote.go) | `Deployments` |
| [command/job_action.go](file:///d:/claude/nomad/command/job_action.go) | `ActionExec` |
| [command/job_tag_apply.go](file:///d:/claude/nomad/command/job_tag_apply.go) | `TagVersionOpts` |
| [command/job_tag_unset.go](file:///d:/claude/nomad/command/job_tag_unset.go) | `UntagVersion` |
| [command/job_init.go](file:///d:/claude/nomad/command/job_init.go) | `PrefixList` (间接) |
| [command/operator_debug.go](file:///d:/claude/nomad/command/operator_debug.go) | `List`, `Info` |
| [command/deployment_status.go](file:///d:/claude/nomad/command/deployment_status.go) | `LatestDeployment`, `Info` |
| e2e/e2eutil/e2ejob.go | `Register`, `Deregister`, `List`, `Info`, `Allocations` |
| e2e/lifecycle/lifecycle.go | `Register`, `Deregister`, `Info` |
| e2e/v3/jobs3/jobs3.go | `Register`, `List`, `Info` |

---

## 3. Allocations API (allocations.go)

**文件**: [api/allocations.go](file:///d:/claude/nomad/api/allocations.go)

Allocations API 提供分配（Allocation）的查询、执行、重启、停止等操作。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/allocations` | GET | `q *QueryOptions` | `[]*AllocationListStub, *QueryMeta, error` | 列出所有分配 |
| `PrefixList` | `/v1/allocations` | GET | `prefix string` | `[]*AllocationListStub, *QueryMeta, error` | 前缀搜索分配 |
| `Info` | `/v1/allocation/{allocID}` | GET | `allocID string, q *QueryOptions` | `*Allocation, *QueryMeta, error` | 获取分配详情 |
| `Exec` | `/v1/client/allocation/{allocID}/exec` | WS | `ctx context.Context, allocID string, req *ExecRequest, q *QueryOptions` | `ExecStream, error` | 在分配中执行命令 |
| `Stats` | `/v1/client/allocation/{allocID}/stats` | GET | `alloc *Allocation, q *QueryOptions` | `*AllocResourceUsage, error` | 获取分配资源使用统计 |
| `Checks` | `/v1/client/allocation/{allocID}/checks` | GET | `allocID string, q *QueryOptions` | `AllocCheckStatuses, error` | 获取分配健康检查状态 |
| `GC` | `/v1/client/allocation/{allocID}/gc` | POST | `alloc *Allocation, q *QueryOptions` | `error` | 垃圾回收分配 |
| `Restart` | `/v1/client/allocation/{allocID}/restart` | POST | `alloc *Allocation, taskName string, q *QueryOptions` | `error` | 重启分配中的任务 |
| `RestartAllTasks` | `/v1/client/allocation/{allocID}/restart` | POST | `alloc *Allocation, q *QueryOptions` | `error` | 重启分配中的所有任务 |
| `Stop` | `/v1/client/allocation/{allocID}/stop` | POST | `alloc *Allocation, q *QueryOptions` | `*AllocStopResponse, error` | 停止分配 |
| `Signal` | `/v1/client/allocation/{allocID}/signal` | POST | `alloc *Allocation, q *QueryOptions, task, signal string` | `error` | 向分配中的任务发送信号 |
| `SetPauseState` | `/v1/client/allocation/{allocID}/pause` | POST | `alloc *Allocation, q *QueryOptions, task, state string` | `error` | 设置任务暂停状态 |
| `GetPauseState` | `/v1/client/allocation/{allocID}/pause` | GET | `alloc *Allocation, q *QueryOptions, task string` | `string, *QueryMeta, error` | 获取任务暂停状态 |
| `Services` | `/v1/client/allocation/{allocID}/services` | GET | `allocID string, q *QueryOptions` | `[]*ServiceRegistration, *QueryMeta, error` | 获取分配的服务注册 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/alloc_status.go](file:///d:/claude/nomad/command/alloc_status.go) | `List`, `PrefixList`, `Info`, `Stats`, `Checks` |
| [command/alloc_stop.go](file:///d:/claude/nomad/command/alloc_stop.go) | `PrefixList`, `Info`, `Stop` |
| [command/alloc_restart.go](file:///d:/claude/nomad/command/alloc_restart.go) | `PrefixList`, `Info`, `Restart`, `RestartAllTasks` |
| [command/alloc_signal.go](file:///d:/claude/nomad/command/alloc_signal.go) | `PrefixList`, `Info`, `Signal` |
| [command/alloc_exec.go](file:///d:/claude/nomad/command/alloc_exec.go) | `PrefixList`, `Info`, `Exec` |
| [command/alloc_fs.go](file:///d:/claude/nomad/command/alloc_fs.go) | `PrefixList`, `Info` |
| [command/alloc_logs.go](file:///d:/claude/nomad/command/alloc_logs.go) | `PrefixList`, `Info` |
| [command/alloc_pause.go](file:///d:/claude/nomad/command/alloc_pause.go) | `PrefixList`, `Info`, `GetPauseState`, `SetPauseState` |
| [command/alloc_checks.go](file:///d:/claude/nomad/command/alloc_checks.go) | `PrefixList`, `Checks` |
| [command/job_action.go](file:///d:/claude/nomad/command/job_action.go) | `PrefixList`, `Info` |

---

## 4. Nodes API (nodes.go)

**文件**: [api/nodes.go](file:///d:/claude/nomad/api/nodes.go)

Nodes API 提供节点（Node）的查询、排水（drain）、资格管理等操作。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/nodes` | GET | `q *QueryOptions` | `[]*NodeListStub, *QueryMeta, error` | 列出所有节点 |
| `PrefixList` | `/v1/nodes` | GET | `prefix string` | `[]*NodeListStub, *QueryMeta, error` | 前缀搜索节点 |
| `PrefixListOpts` | `/v1/nodes` | GET | `prefix string, opts *QueryOptions` | `[]*NodeListStub, *QueryMeta, error` | 前缀搜索（带选项） |
| `Info` | `/v1/node/{nodeID}` | GET | `nodeID string, q *QueryOptions` | `*Node, *QueryMeta, error` | 获取节点详情 |
| `UpdateDrain` | `/v1/node/{nodeID}/drain` | POST | `nodeID string, spec *DrainSpec, markEligible bool, q *WriteOptions` | `*NodeDrainUpdateResponse, error` | 更新节点排水状态 |
| `UpdateDrainOpts` | `/v1/node/{nodeID}/drain` | POST | `nodeID string, opts *DrainOptions, q *WriteOptions` | `*NodeDrainUpdateResponse, error` | 更新排水（带选项） |
| `MonitorDrain` | `/v1/node/{nodeID}/drain-monitor` | GET(Watch) | `ctx context.Context, nodeID string, index uint64, ignoreSys bool` | `<-chan *MonitorMessage` | 监控节点排水进度 |
| `ToggleEligibility` | `/v1/node/{nodeID}/eligibility` | POST | `nodeID string, eligible bool, q *WriteOptions` | `*NodeEligibilityUpdateResponse, error` | 切换节点调度资格 |
| `Allocations` | `/v1/node/{nodeID}/allocations` | GET | `nodeID string, q *QueryOptions` | `[]*Allocation, *QueryMeta, error` | 获取节点的分配 |
| `CSIVolumes` | `/v1/node/{nodeID}/volumes` | GET | `nodeID string, q *QueryOptions` | `[]*CSIVolumeListStub, error` | 获取节点的 CSI 卷 |
| `ForceEvaluate` | `/v1/node/{nodeID}/evaluate` | POST | `nodeID string, q *WriteOptions` | `string, *WriteMeta, error` | 强制评估节点 |
| `Stats` | `/v1/node/{nodeID}/stats` | GET | `nodeID string, q *QueryOptions` | `*HostStats, error` | 获取节点统计信息 |
| `GC` | `/v1/node/{nodeID}/gc` | POST | `nodeID string, q *QueryOptions` | `error` | 垃圾回收节点 |
| `GcAlloc` | `/v1/client/allocation/{allocID}/gc` | POST | `allocID string, q *QueryOptions` | `error` | 垃圾回收特定分配 |
| `Purge` | `/v1/node/{nodeID}/purge` | POST | `nodeID string, q *QueryOptions` | `*NodePurgeResponse, *QueryMeta, error` | 清除节点 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/node_status.go](file:///d:/claude/nomad/command/node_status.go) | `List`, `Info`, `PrefixList` |
| [command/node.go](file:///d:/claude/nomad/command/node.go) | `Info`, `List` |
| [command/node_drain.go](file:///d:/claude/nomad/command/node_drain.go) | `UpdateDrain`, `UpdateDrainOpts`, `MonitorDrain` |
| [command/node_eligibility.go](file:///d:/claude/nomad/command/node_eligibility.go) | `ToggleEligibility` |
| [command/agent_monitor.go](file:///d:/claude/nomad/command/agent_monitor.go) | `List`, `PrefixList` |
| [command/agent_monitor_export.go](file:///d:/claude/nomad/command/agent_monitor_export.go) | `List`, `PrefixList` |
| [command/operator_debug.go](file:///d:/claude/nomad/command/operator_debug.go) | `List`, `Info`, `Stats` |
| [command/monitor.go](file:///d:/claude/nomad/command/monitor.go) | `List`, `Info` |
| [command/job_eval_test.go](file:///d:/claude/nomad/command/job_eval_test.go) | `List` |
| e2e/e2eutil/node.go | `List`, `Info`, `PrefixList` |
| e2e/nodedrain/node_drain_test.go | `UpdateDrain`, `MonitorDrain`, `List` |

---

## 5. Deployments API (deployments.go)

**文件**: [api/deployments.go](file:///d:/claude/nomad/api/deployments.go)

Deployments API 提供部署（Deployment）的查询、暂停、提升、失败等操作。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/deployments` | GET | `q *QueryOptions` | `[]*Deployment, *QueryMeta, error` | 列出所有部署 |
| `PrefixList` | `/v1/deployments` | GET | `prefix string` | `[]*Deployment, *QueryMeta, error` | 前缀搜索部署 |
| `Info` | `/v1/deployment/{deploymentID}` | GET | `deploymentID string, q *QueryOptions` | `*Deployment, *QueryMeta, error` | 获取部署详情 |
| `Allocations` | `/v1/deployment/{deploymentID}/allocations` | GET | `deploymentID string, q *QueryOptions` | `[]*AllocationListStub, *QueryMeta, error` | 获取部署的分配 |
| `Fail` | `/v1/deployment/{deploymentID}/fail` | POST | `deploymentID string, q *WriteOptions` | `*DeploymentUpdateResponse, *WriteMeta, error` | 标记部署为失败 |
| `Pause` | `/v1/deployment/{deploymentID}/pause` | POST | `deploymentID string, pause bool, q *WriteOptions` | `*DeploymentUpdateResponse, *WriteMeta, error` | 暂停/恢复部署 |
| `PromoteAll` | `/v1/deployment/{deploymentID}/promote` | POST | `deploymentID string, q *WriteOptions` | `*DeploymentUpdateResponse, *WriteMeta, error` | 提升所有任务组 |
| `PromoteGroups` | `/v1/deployment/{deploymentID}/promote` | POST | `deploymentID string, groups []string, q *WriteOptions` | `*DeploymentUpdateResponse, *WriteMeta, error` | 提升指定任务组 |
| `Unblock` | `/v1/deployment/{deploymentID}/unblock` | POST | `deploymentID string, q *WriteOptions` | `*DeploymentUpdateResponse, *WriteMeta, error` | 解除阻塞部署 |
| `SetAllocHealth` | `/v1/deployment/{deploymentID}/allocations/health` | POST | `deploymentID string, healthy, unhealthy []string, q *WriteOptions` | `*DeploymentUpdateResponse, *WriteMeta, error` | 设置分配健康状况 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/deployment_list.go](file:///d:/claude/nomad/command/deployment_list.go) | `List` |
| [command/deployment_status.go](file:///d:/claude/nomad/command/deployment_status.go) | `List`, `Info`, `Allocations` |
| [command/deployment_fail.go](file:///d:/claude/nomad/command/deployment_fail.go) | `Fail` |
| [command/deployment_pause.go](file:///d:/claude/nomad/command/deployment_pause.go) | `Pause` |
| [command/deployment_resume.go](file:///d:/claude/nomad/command/deployment_resume.go) | `Pause` (恢复) |
| [command/deployment_promote.go](file:///d:/claude/nomad/command/deployment_promote.go) | `PromoteAll`, `PromoteGroups` |
| [command/deployment_unblock.go](file:///d:/claude/nomad/command/deployment_unblock.go) | `Unblock` |

---

## 6. Evaluations API (evaluations.go)

**文件**: [api/evaluations.go](file:///d:/claude/nomad/api/evaluations.go)

Evaluations API 提供评估（Evaluation）的查询和删除操作。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/evaluations` | GET | `q *QueryOptions` | `[]*Evaluation, *QueryMeta, error` | 列出所有评估 |
| `PrefixList` | `/v1/evaluations` | GET | `prefix string` | `[]*Evaluation, *QueryMeta, error` | 前缀搜索评估 |
| `Count` | `/v1/evaluations/count` | GET | `q *QueryOptions` | `*EvalCountResponse, *QueryMeta, error` | 统计评估数量 |
| `Info` | `/v1/evaluation/{evalID}` | GET | `evalID string, q *QueryOptions` | `*Evaluation, *QueryMeta, error` | 获取评估详情 |
| `Delete` | `/v1/evaluations` | DELETE | `evalIDs []string, w *WriteOptions` | `*WriteMeta, error` | 删除评估 |
| `DeleteOpts` | `/v1/evaluations` | DELETE | `req *EvalDeleteRequest, w *WriteOptions` | `*EvalDeleteResponse, *WriteMeta, error` | 删除评估（带选项） |
| `Allocations` | `/v1/evaluation/{evalID}/allocations` | GET | `evalID string, q *QueryOptions` | `[]*AllocationListStub, *QueryMeta, error` | 获取评估的分配 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/eval_list.go](file:///d:/claude/nomad/command/eval_list.go) | `List` |
| [command/eval_status.go](file:///d:/claude/nomad/command/eval_status.go) | `PrefixList`, `Info`, `Allocations` |
| [command/eval_delete.go](file:///d:/claude/nomad/command/eval_delete.go) | `Info`, `Count`, `Delete`, `DeleteOpts` |
| [command/alloc_status.go](file:///d:/claude/nomad/command/alloc_status.go) | `Info` |

---

## 7. ACL API (acl.go)

**文件**: [api/acl.go](file:///d:/claude/nomad/api/acl.go)

ACL API 提供策略、令牌、角色、认证方法、绑定规则的 CRUD 操作。包含多个子组。

### 7.1 ACLPolicies

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/acl/policies` | GET | `q *QueryOptions` | `[]*ACLPolicyListStub, *QueryMeta, error` | 列出 ACL 策略 |
| `Upsert` | `/v1/acl/policy` | POST | `policy *ACLPolicy, q *WriteOptions` | `*WriteMeta, error` | 创建/更新 ACL 策略 |
| `Delete` | `/v1/acl/policy/{name}` | DELETE | `policyName string, q *WriteOptions` | `*WriteMeta, error` | 删除 ACL 策略 |
| `Info` | `/v1/acl/policy/{name}` | GET | `policyName string, q *QueryOptions` | `*ACLPolicy, *QueryMeta, error` | 获取策略详情 |
| `Self` | `/v1/acl/policies` | GET | `q *QueryOptions` | `[]*ACLPolicyListStub, *QueryMeta, error` | 获取当前令牌的策略 |

### 7.2 ACLTokens

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `Bootstrap` | `/v1/acl/bootstrap` | POST | `q *WriteOptions` | `*ACLToken, *WriteMeta, error` | 引导 ACL |
| `BootstrapOpts` | `/v1/acl/bootstrap` | POST | `btoken string, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | 引导 ACL（带令牌） |
| `List` | `/v1/acl/tokens` | GET | `q *QueryOptions` | `[]*ACLTokenListStub, *QueryMeta, error` | 列出令牌 |
| `Create` | `/v1/acl/token` | POST | `token *ACLToken, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | 创建令牌 |
| `Upload` | `/v1/acl/token` | POST | `token *ACLToken, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | 上传令牌 |
| `Update` | `/v1/acl/token/{id}` | POST | `token *ACLToken, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | 更新令牌 |
| `Delete` | `/v1/acl/token/{id}` | DELETE | `accessorID string, q *WriteOptions` | `*WriteMeta, error` | 删除令牌 |
| `Info` | `/v1/acl/token/{id}` | GET | `accessorID string, q *QueryOptions` | `*ACLToken, *QueryMeta, error` | 获取令牌详情 |
| `Self` | `/v1/acl/token/self` | GET | `q *QueryOptions` | `*ACLToken, *QueryMeta, error` | 获取当前令牌信息 |
| `UpsertOneTimeToken` | `/v1/acl/token/onsession` | POST | `q *WriteOptions` | `*OneTimeToken, *WriteMeta, error` | 创建一次性令牌 |
| `ExchangeOneTimeToken` | `/v1/acl/token/exchange` | POST | `secret string, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | 交换一次性令牌 |

### 7.3 ACLRoles

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/acl/roles` | GET | `q *QueryOptions` | `[]*ACLRoleListStub, *QueryMeta, error` | 列出角色 |
| `Create` | `/v1/acl/role` | POST | `role *ACLRole, w *WriteOptions` | `*ACLRole, *WriteMeta, error` | 创建角色 |
| `Update` | `/v1/acl/role/{id}` | POST | `role *ACLRole, w *WriteOptions` | `*ACLRole, *WriteMeta, error` | 更新角色 |
| `Delete` | `/v1/acl/role/{id}` | DELETE | `roleID string, w *WriteOptions` | `*WriteMeta, error` | 删除角色 |
| `Get` | `/v1/acl/role/{id}` | GET | `roleID string, q *QueryOptions` | `*ACLRole, *QueryMeta, error` | 获取角色详情 |
| `GetByName` | `/v1/acl/role/name/{name}` | GET | `roleName string, q *QueryOptions` | `*ACLRole, *QueryMeta, error` | 按名称获取角色 |

### 7.4 ACLAuthMethods

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/acl/auth-methods` | GET | `q *QueryOptions` | `[]*ACLAuthMethodListStub, *QueryMeta, error` | 列出认证方法 |
| `Create` | `/v1/acl/auth-method` | POST | `authMethod *ACLAuthMethod, w *WriteOptions` | `*ACLAuthMethod, *WriteMeta, error` | 创建认证方法 |
| `Update` | `/v1/acl/auth-method/{name}` | POST | `authMethod *ACLAuthMethod, w *WriteOptions` | `*ACLAuthMethod, *WriteMeta, error` | 更新认证方法 |
| `Delete` | `/v1/acl/auth-method/{name}` | DELETE | `authMethodName string, w *WriteOptions` | `*WriteMeta, error` | 删除认证方法 |
| `Get` | `/v1/acl/auth-method/{name}` | GET | `authMethodName string, q *QueryOptions` | `*ACLAuthMethod, *WriteMeta, error` | 获取认证方法详情 |

### 7.5 ACLBindingRules

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/acl/binding-rules` | GET | `q *QueryOptions` | `[]*ACLBindingRuleListStub, *QueryMeta, error` | 列出绑定规则 |
| `Create` | `/v1/acl/binding-rule` | POST | `bindingRule *ACLBindingRule, w *WriteOptions` | `*ACLBindingRule, *WriteMeta, error` | 创建绑定规则 |
| `Update` | `/v1/acl/binding-rule/{id}` | POST | `bindingRule *ACLBindingRule, w *WriteOptions` | `*ACLBindingRule, *WriteMeta, error` | 更新绑定规则 |
| `Delete` | `/v1/acl/binding-rule/{id}` | DELETE | `bindingRuleID string, w *WriteOptions` | `*WriteMeta, error` | 删除绑定规则 |
| `Get` | `/v1/acl/binding-rule/{id}` | GET | `bindingRuleID string, q *QueryOptions` | `*ACLBindingRule, *QueryMeta, error` | 获取绑定规则详情 |

### 7.6 ACLAuth

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `GetAuthURL` | `/v1/acl/oidc/auth-url` | POST | `req *ACLOIDCAuthURLRequest, q *WriteOptions` | `*ACLOIDCAuthURLResponse, *WriteMeta, error` | 获取 OIDC 认证 URL |
| `CompleteAuth` | `/v1/acl/oidc/complete-auth` | POST | `req *ACLOIDCCompleteAuthRequest, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | 完成 OIDC 认证 |
| `Login` | `/v1/acl/login` | POST | `req *ACLLoginRequest, q *WriteOptions` | `*ACLToken, *WriteMeta, error` | 登录 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/acl_bootstrap.go](file:///d:/claude/nomad/command/acl_bootstrap.go) | `Bootstrap`, `BootstrapOpts` |
| [command/acl_policy.go](file:///d:/claude/nomad/command/acl_policy.go) | `List`, `Info` |
| [command/acl_policy_apply.go](file:///d:/claude/nomad/command/acl_policy_apply.go) | `Upsert` |
| [command/acl_policy_list.go](file:///d:/claude/nomad/command/acl_policy_list.go) | `List` |
| [command/acl_token.go](file:///d:/claude/nomad/command/acl_token.go) | `Self`, `Info` |
| [command/acl_token_create.go](file:///d:/claude/nomad/command/acl_token_create.go) | `Create` |
| [command/acl_token_list.go](file:///d:/claude/nomad/command/acl_token_list.go) | `List` |
| [command/acl_role.go](file:///d:/claude/nomad/command/acl_role.go) | `List`, `Get` |
| [command/acl_role_create.go](file:///d:/claude/nomad/command/acl_role_create.go) | `Create` |
| [command/acl_role_update.go](file:///d:/claude/nomad/command/acl_role_update.go) | `Update` |
| [command/acl_role_info.go](file:///d:/claude/nomad/command/acl_role_info.go) | `Get`, `GetByName` |
| [command/acl_role_list.go](file:///d:/claude/nomad/command/acl_role_list.go) | `List` |
| [command/acl_auth_method.go](file:///d:/claude/nomad/command/acl_auth_method.go) | `List`, `Get` |
| [command/acl_auth_method_create.go](file:///d:/claude/nomad/command/acl_auth_method_create.go) | `Create` |
| [command/acl_auth_method_update.go](file:///d:/claude/nomad/command/acl_auth_method_update.go) | `Update` |
| [command/acl_auth_method_list.go](file:///d:/claude/nomad/command/acl_auth_method_list.go) | `List` |
| [command/acl_binding_rule.go](file:///d:/claude/nomad/command/acl_binding_rule.go) | `List`, `Get` |
| [command/acl_binding_rule_create.go](file:///d:/claude/nomad/command/acl_binding_rule_create.go) | `Create` |
| [command/acl_binding_rule_update.go](file:///d:/claude/nomad/command/acl_binding_rule_update.go) | `Update` |
| [command/acl_binding_rule_list.go](file:///d:/claude/nomad/command/acl_binding_rule_list.go) | `List` |
| [command/login.go](file:///d:/claude/nomad/command/login.go) | `GetAuthURL`, `CompleteAuth`, `Login` |

---

## 8. Agent API (agent.go)

**文件**: [api/agent.go](file:///d:/claude/nomad/api/agent.go)

Agent API 提供与 Nomad Agent 交互的方法，包括自我信息、成员管理、监控、性能分析等。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `Self` | `/v1/agent/self` | GET | - | `*AgentSelf, error` | 获取 Agent 自身信息 |
| `NodeName` | - | - | - | `string, error` | 获取节点名称（缓存） |
| `Datacenter` | - | - | - | `string, error` | 获取数据中心（缓存） |
| `Region` | - | - | - | `string, error` | 获取区域（缓存） |
| `Join` | `/v1/agent/join` | POST | `addrs ...string` | `int, error` | 加入集群 |
| `Members` | `/v1/agent/members` | GET | - | `*ServerMembers, error` | 获取成员列表 |
| `MembersOpts` | `/v1/agent/members` | GET | `opts *QueryOptions` | `*ServerMembers, error` | 获取成员（带选项） |
| `ForceLeave` | `/v1/agent/force-leave` | POST | `node string` | `error` | 强制离开 |
| `ForceLeaveWithOptions` | `/v1/agent/force-leave` | POST | `node string, opts ForceLeaveOpts` | `error` | 强制离开（带选项） |
| `Servers` | - | - | - | `[]string, error` | 获取已知服务器列表 |
| `SetServers` | - | - | `addrs []string` | `error` | 设置服务器列表 |
| `ListKeys` | `/v1/agent/key` | GET | - | `*KeyringResponse, error` | 列出加密密钥 |
| `Reload` | `/v1/agent/reload` | POST | `_ *AgentReloadOpts, q *WriteOptions` | `error` | 重新加载配置 |
| `InstallKey` | `/v1/agent/key` | POST | `key string` | `*KeyringResponse, error` | 安装密钥 |
| `UseKey` | `/v1/agent/key` | POST | `key string` | `*KeyringResponse, error` | 使用密钥 |
| `RemoveKey` | `/v1/agent/key` | DELETE | `key string` | `*KeyringResponse, error` | 移除密钥 |
| `Health` | `/v1/agent/health` | GET | - | `*AgentHealthResponse, error` | 获取 Agent 健康状态 |
| `Host` | `/v1/agent/host` | GET | `serverID, nodeID string, q *QueryOptions` | `*HostDataResponse, error` | 获取主机信息 |
| `Monitor` | `/v1/agent/monitor` | GET(Stream) | `stopCh <-chan struct{}, q *QueryOptions` | `<-chan *StreamFrame, <-chan error` | 监控 Agent 日志 |
| `MonitorExport` | `/v1/agent/monitor/export` | GET(Stream) | `stopCh <-chan struct{}, q *QueryOptions` | `<-chan *StreamFrame, <-chan error` | 导出监控日志 |
| `CPUProfile` | `/v1/agent/pprof/cpu` | GET | `opts PprofOptions, q *QueryOptions` | `[]byte, error` | CPU 性能分析 |
| `Trace` | `/v1/agent/pprof/trace` | GET | `opts PprofOptions, q *QueryOptions` | `[]byte, error` | 跟踪分析 |
| `Lookup` | `/v1/agent/pprof/{profile}` | GET | `profile string, opts PprofOptions, q *QueryOptions` | `[]byte, error` | 查找性能分析 |
| `GetSchedulerWorkerConfig` | `/v1/agent/scheduler-worker/config` | GET | `q *QueryOptions` | `*SchedulerWorkerPoolArgs, error` | 获取调度器工作配置 |
| `SetSchedulerWorkerConfig` | `/v1/agent/scheduler-worker/config` | POST | `args SchedulerWorkerPoolArgs, q *WriteOptions` | `*SchedulerWorkerPoolArgs, error` | 设置调度器工作配置 |
| `GetSchedulerWorkersInfo` | `/v1/agent/scheduler-worker/info` | GET | `q *QueryOptions` | `*AgentSchedulerWorkersInfo, error` | 获取调度器工作信息 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/agent_info.go](file:///d:/claude/nomad/command/agent_info.go) | `Self` |
| [command/check.go](file:///d:/claude/nomad/command/check.go) | `Self` |
| [command/helpers.go](file:///d:/claude/nomad/command/helpers.go) | `Self` |
| [command/server_members.go](file:///d:/claude/nomad/command/server_members.go) | `Members`, `MembersOpts` |
| [command/server_force_leave.go](file:///d:/claude/nomad/command/server_force_leave.go) | `ForceLeave`, `ForceLeaveWithOptions` |
| [command/agent_monitor.go](file:///d:/claude/nomad/command/agent_monitor.go) | `Monitor` |
| [command/agent_monitor_export.go](file:///d:/claude/nomad/command/agent_monitor_export.go) | `MonitorExport` |
| [command/operator_debug.go](file:///d:/claude/nomad/command/operator_debug.go) | `Self`, `Members`, `Host` |
| [command/operator_gossip_keyring_list.go](file:///d:/claude/nomad/command/operator_gossip_keyring_list.go) | `ListKeys` |

---

## 9. CSI API (csi.go)

**文件**: [api/csi.go](file:///d:/claude/nomad/api/csi.go)

CSI API 提供 CSI 卷和插件的 CRUD 操作，包括快照管理。

### 9.1 CSIVolumes

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/volumes` | GET | `q *QueryOptions` | `[]*CSIVolumeListStub, *QueryMeta, error` | 列出所有 CSI 卷 |
| `ListExternal` | `/v1/volumes/external` | GET | `pluginID string, q *QueryOptions` | `*CSIVolumeListExternalResponse, *QueryMeta, error` | 列出外部卷 |
| `PluginList` | `/v1/volumes` | GET | `pluginID string, q *QueryOptions` | `[]*CSIVolumeListStub, *QueryMeta, error` | 按插件列出卷 |
| `Info` | `/v1/volume/csi/{id}` | GET | `id string, q *QueryOptions` | `*CSIVolume, *QueryMeta, error` | 获取卷详情 |
| `Register` | `/v1/volumes/csi` | PUT | `vol *CSIVolume, w *WriteOptions` | `*WriteMeta, error` | 注册卷 |
| `RegisterOpts` | `/v1/volumes/csi` | PUT | `req *CSIVolumeRegisterRequest, w *WriteOptions` | `*CSIVolumeRegisterResponse, *WriteMeta, error` | 注册卷（带选项） |
| `Deregister` | `/v1/volume/csi/{id}` | DELETE | `id string, force bool, w *WriteOptions` | `error` | 注销卷 |
| `Create` | `/v1/volumes/csi/create` | PUT | `vol *CSIVolume, w *WriteOptions` | `[]*CSIVolume, *WriteMeta, error` | 创建卷 |
| `CreateOpts` | `/v1/volumes/csi/create` | PUT | `req *CSIVolumeCreateRequest, w *WriteOptions` | `*CSIVolumeCreateResponse, *WriteMeta, error` | 创建卷（带选项） |
| `Delete` | `/v1/volumes/csi/delete` | DELETE | `externalVolID string, w *WriteOptions` | `error` | 删除卷 |
| `DeleteOpts` | `/v1/volumes/csi/delete` | DELETE | `req *CSIVolumeDeleteRequest, w *WriteOptions` | `error` | 删除卷（带选项） |
| `Detach` | `/v1/volumes/csi/detach` | DELETE | `volID, nodeID string, w *WriteOptions` | `error` | 分离卷 |
| `CreateSnapshot` | `/v1/volumes/csi/snapshot/create` | PUT | `snap *CSISnapshot, w *WriteOptions` | `*CSISnapshotCreateResponse, *WriteMeta, error` | 创建快照 |
| `DeleteSnapshot` | `/v1/volumes/csi/snapshot/delete` | DELETE | `snap *CSISnapshot, w *WriteOptions` | `error` | 删除快照 |
| `ListSnapshotsOpts` | `/v1/volumes/csi/snapshot/list` | GET | `req *CSISnapshotListRequest` | `*CSISnapshotListResponse, *QueryMeta, error` | 列出快照（带选项） |
| `ListSnapshots` | `/v1/volumes/csi/snapshot/list` | GET | `pluginID string, secrets string, q *QueryOptions` | `*CSISnapshotListResponse, *QueryMeta, error` | 列出快照 |

### 9.2 CSIPlugins

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/plugins` | GET | `q *QueryOptions` | `[]*CSIPluginListStub, *QueryMeta, error` | 列出 CSI 插件 |
| `Info` | `/v1/plugin/csi/{id}` | GET | `id string, q *QueryOptions` | `*CSIPlugin, *QueryMeta, error` | 获取插件详情 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/volume_status_csi.go](file:///d:/claude/nomad/command/volume_status_csi.go) | `List`, `Info` |
| [command/volume_register_csi.go](file:///d:/claude/nomad/command/volume_register_csi.go) | `Register`, `RegisterOpts` |
| [command/volume_create_csi.go](file:///d:/claude/nomad/command/volume_create_csi.go) | `Create`, `CreateOpts` |
| [command/volume_deregister.go](file:///d:/claude/nomad/command/volume_deregister.go) | `Deregister` |
| [command/volume_delete.go](file:///d:/claude/nomad/command/volume_delete.go) | `Delete`, `DeleteOpts` |
| [command/volume_detach.go](file:///d:/claude/nomad/command/volume_detach.go) | `Detach` |
| [command/volume_snapshot_create.go](file:///d:/claude/nomad/command/volume_snapshot_create.go) | `CreateSnapshot` |
| [command/volume_snapshot_delete.go](file:///d:/claude/nomad/command/volume_snapshot_delete.go) | `DeleteSnapshot` |
| [command/volume_snapshot_list.go](file:///d:/claude/nomad/command/volume_snapshot_list.go) | `ListSnapshots`, `ListSnapshotsOpts` |
| [command/plugin_status_csi.go](file:///d:/claude/nomad/command/plugin_status_csi.go) | `List`, `Info` (CSIPlugins) |
| [command/alloc_status.go](file:///d:/claude/nomad/command/alloc_status.go) | `Info` |

---

## 10. FS API (fs.go)

**文件**: [api/fs.go](file:///d:/claude/nomad/api/fs.go)

FS API 提供分配文件系统的操作，包括列表、读取、流式读取、日志查看等。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/client/fs/ls` | GET | `alloc *Allocation, path string, q *QueryOptions` | `[]*AllocFileInfo, *QueryMeta, error` | 列出分配文件 |
| `Stat` | `/v1/client/fs/stat` | GET | `alloc *Allocation, path string, q *QueryOptions` | `*AllocFileInfo, *QueryMeta, error` | 获取文件状态 |
| `ReadAt` | `/v1/client/fs/readat` | GET | `alloc *Allocation, path string, offset int64, limit int64, q *QueryOptions` | `io.ReadCloser, error` | 在偏移处读取文件 |
| `Cat` | `/v1/client/fs/cat` | GET | `alloc *Allocation, path string, q *QueryOptions` | `io.ReadCloser, error` | 读取整个文件 |
| `Stream` | `/v1/client/fs/stream` | GET(Stream) | `alloc *Allocation, path, origin string, offset int64, q *QueryOptions` | `io.ReadCloser, error` | 流式读取文件 |
| `Logs` | `/v1/client/fs/logs` | GET(Stream) | `alloc *Allocation, follow bool, task, logType, origin string, offset int64, q *QueryOptions` | `io.ReadCloser, error` | 流式读取任务日志 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/alloc_fs.go](file:///d:/claude/nomad/command/alloc_fs.go) | `List`, `Stat`, `Cat`, `Stream`, `ReadAt` |
| [command/alloc_logs.go](file:///d:/claude/nomad/command/alloc_logs.go) | `Logs` |

---

## 11. EventStream API (event_stream.go)

**文件**: [api/event_stream.go](file:///d:/claude/nomad/api/event_stream.go)

EventStream API 提供事件流订阅功能，以及从事件中解码各种资源类型的方法。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `Stream` | `/v1/event/stream` | GET(Stream) | `ctx context.Context, topics map[Topic][]string, index uint64, q *QueryOptions` | `<-chan *Events, error` | 订阅事件流 |

### 事件解码方法（Event 类型方法）

| 方法 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `Deployment()` | - | `*Deployment, error` | 从事件解码部署 |
| `Evaluation()` | - | `*Evaluation, error` | 从事件解码评估 |
| `Allocation()` | - | `*Allocation, error` | 从事件解码分配 |
| `Job()` | - | `*Job, error` | 从事件解码作业 |
| `DeregisteredJob()` | - | `*Job, bool, error` | 从事件解码注销的作业 |
| `Node()` | - | `*Node, error` | 从事件解码节点 |
| `NodePool()` | - | `*NodePool, error` | 从事件解码节点池 |
| `Service()` | - | `*ServiceRegistration, error` | 从事件解码服务注册 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/agent/event_endpoint_test.go](file:///d:/claude/nomad/command/agent/event_endpoint_test.go) | `Stream` |
| e2e/events/events.go | `Stream` |
| e2e/taskevents/taskevents.go | `Stream` |

---

## 12. Host Volumes API (host_volumes.go)

**文件**: [api/host_volumes.go](file:///d:/claude/nomad/api/host_volumes.go)

Host Volumes API 提供主机卷的创建、注册、查询、删除操作。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `Create` | `/v1/volumes/host/create` | POST | `req *HostVolumeCreateRequest, opts *WriteOptions` | `*HostVolumeCreateResponse, *WriteMeta, error` | 创建主机卷 |
| `Register` | `/v1/volumes/host/register` | POST | `req *HostVolumeRegisterRequest, opts *WriteOptions` | `*HostVolumeRegisterResponse, *WriteMeta, error` | 注册主机卷 |
| `Get` | `/v1/volume/host/{id}` | GET | `id string, opts *QueryOptions` | `*HostVolume, *QueryMeta, error` | 获取主机卷详情 |
| `List` | `/v1/volumes/host` | GET | `req *HostVolumeListRequest, opts *QueryOptions` | `[]*HostVolumeStub, *QueryMeta, error` | 列出主机卷 |
| `Delete` | `/v1/volumes/host/delete` | POST | `req *HostVolumeDeleteRequest, opts *WriteOptions` | `*HostVolumeDeleteResponse, *WriteMeta, error` | 删除主机卷 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/volume_create_host.go](file:///d:/claude/nomad/command/volume_create_host.go) | `Create` |
| [command/volume_register_host.go](file:///d:/claude/nomad/command/volume_register_host.go) | `Register` |
| [command/volume_status_host.go](file:///d:/claude/nomad/command/volume_status_host.go) | `List`, `Get` |

---

## 13. Host Volume Claims API (host_volume_claims.go)

**文件**: [api/host_volume_claims.go](file:///d:/claude/nomad/api/host_volume_claims.go)

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/volumes/host/claims` | GET | `req *TaskGroupHostVolumeClaimsListRequest, opts *QueryOptions` | `[]*TaskGroupHostVolumeClaim, *QueryMeta, error` | 列出主机卷声明 |
| `Delete` | `/v1/volumes/host/claims/{claimID}` | DELETE | `claimID string, opts *WriteOptions` | `*WriteMeta, error` | 删除主机卷声明 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/volume_claim_list.go](file:///d:/claude/nomad/command/volume_claim_list.go) | `List` |
| [command/volume_claim_delete.go](file:///d:/claude/nomad/command/volume_claim_delete.go) | `Delete` |

---

## 14. Search API (search.go)

**文件**: [api/search.go](file:///d:/claude/nomad/api/search.go)

Search API 提供前缀搜索和模糊搜索功能。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `PrefixSearch` | `/v1/search` | POST | `prefix string, context contexts.Context, q *QueryOptions` | `*SearchResponse, *QueryMeta, error` | 前缀搜索 |
| `FuzzySearch` | `/v1/search/fuzzy` | POST | `text string, context contexts.Context, q *QueryOptions` | `*FuzzySearchResponse, *QueryMeta, error` | 模糊搜索 |

### 调用位置

该 API 被广泛用于 CLI 命令的 ID 前缀补全，主要调用文件包括：

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/alloc_exec.go](file:///d:/claude/nomad/command/alloc_exec.go) | `PrefixSearch` |
| [command/alloc_fs.go](file:///d:/claude/nomad/command/alloc_fs.go) | `PrefixSearch` |
| [command/alloc_logs.go](file:///d:/claude/nomad/command/alloc_logs.go) | `PrefixSearch` |
| [command/alloc_pause.go](file:///d:/claude/nomad/command/alloc_pause.go) | `PrefixSearch` |
| [command/alloc_checks.go](file:///d:/claude/nomad/command/alloc_checks.go) | `PrefixSearch` |
| [command/alloc_restart.go](file:///d:/claude/nomad/command/alloc_restart.go) | `PrefixSearch` |
| [command/alloc_signal.go](file:///d:/claude/nomad/command/alloc_signal.go) | `PrefixSearch` |
| [command/alloc_status.go](file:///d:/claude/nomad/command/alloc_status.go) | `PrefixSearch` |
| [command/alloc_stop.go](file:///d:/claude/nomad/command/alloc_stop.go) | `PrefixSearch` |
| [command/agent_monitor.go](file:///d:/claude/nomad/command/agent_monitor.go) | `PrefixSearch` |
| [command/deployment_fail.go](file:///d:/claude/nomad/command/deployment_fail.go) | `PrefixSearch` |
| [command/deployment_pause.go](file:///d:/claude/nomad/command/deployment_pause.go) | `PrefixSearch` |
| [command/deployment_promote.go](file:///d:/claude/nomad/command/deployment_promote.go) | `PrefixSearch` |
| [command/deployment_resume.go](file:///d:/claude/nomad/command/deployment_resume.go) | `PrefixSearch` |
| [command/deployment_status.go](file:///d:/claude/nomad/command/deployment_status.go) | `PrefixSearch` |
| [command/deployment_unblock.go](file:///d:/claude/nomad/command/deployment_unblock.go) | `PrefixSearch` |
| [command/eval_delete.go](file:///d:/claude/nomad/command/eval_delete.go) | `PrefixSearch` |
| [command/eval_list.go](file:///d:/claude/nomad/command/eval_list.go) | `PrefixSearch` |
| [command/eval_status.go](file:///d:/claude/nomad/command/eval_status.go) | `PrefixSearch` |
| [command/job.go](file:///d:/claude/nomad/command/job.go) | `PrefixSearch` |

---

## 15. Services API (services.go)

**文件**: [api/services.go](file:///d:/claude/nomad/api/services.go)

Services API 提供服务注册的查询和删除操作。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/services` | GET | `q *QueryOptions` | `[]*ServiceRegistrationListStub, *QueryMeta, error` | 列出所有服务 |
| `Get` | `/v1/service/{serviceName}` | GET | `serviceName string, q *QueryOptions` | `[]*ServiceRegistration, *QueryMeta, error` | 获取服务详情 |
| `Delete` | `/v1/service/{serviceName}/{serviceID}` | DELETE | `serviceName, serviceID string, q *WriteOptions` | `*WriteMeta, error` | 删除服务注册 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/service_list.go](file:///d:/claude/nomad/command/service_list.go) | `List` |
| [command/service_info.go](file:///d:/claude/nomad/command/service_info.go) | `Get` |

---

## 16. Status API (status.go)

**文件**: [api/status.go](file:///d:/claude/nomad/api/status.go)

Status API 提供集群状态查询，包括领导者信息。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `Leader` | `/v1/status/leader` | GET | - | `string, error` | 获取集群领导者地址 |
| `RegionLeader` | `/v1/status/leader` | GET | `region string` | `string, error` | 获取指定区域的领导者 |
| `Peers` | `/v1/status/peers` | GET | - | `[]string, error` | 获取集群对等节点 |

### 调用位置

主要在 `command/` 中用于集群状态检查。

---

## 17. System API (system.go)

**文件**: [api/system.go](file:///d:/claude/nomad/api/system.go)

System API 提供系统级操作，如垃圾回收和摘要重建。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `GarbageCollect` | `/v1/system/gc` | PUT | - | `error` | 触发系统垃圾回收 |
| `ReconcileSummaries` | `/v1/system/reconcile/summaries` | PUT | - | `error` | 重建作业摘要 |

### 调用位置

主要在 `command/` 和 `e2e/` 中使用，如 `command/system.go`。

---

## 18. Regions API (regions.go)

**文件**: [api/regions.go](file:///d:/claude/nomad/api/regions.go)

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/regions` | GET | - | `[]string, error` | 列出所有区域 |

### 调用位置

在 `command/meta.go` 中用于获取可用区域列表以支持 CLI 全局选项。

---

## 19. Operator API (operator.go / operator_autopilot.go / operator_metrics.go)

**文件**: [api/operator.go](file:///d:/claude/nomad/api/operator.go), [api/operator_autopilot.go](file:///d:/claude/nomad/api/operator_autopilot.go), [api/operator_metrics.go](file:///d:/claude/nomad/api/operator_metrics.go)

Operator API 提供运维级操作，包括 Raft 配置、调度器配置、快照、许可证、Autopilot 和指标。

### 19.1 Raft 操作

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `RaftGetConfiguration` | `/v1/operator/raft/configuration` | GET | `q *QueryOptions` | `*RaftConfiguration, error` | 获取 Raft 配置 |
| `RaftRemovePeerByAddress` | `/v1/operator/raft/peer` | DELETE | `address string, q *WriteOptions` | `error` | 按地址移除 Raft 对等节点 |
| `RaftRemovePeerByID` | `/v1/operator/raft/peer` | DELETE | `id string, q *WriteOptions` | `error` | 按 ID 移除 Raft 对等节点 |
| `RaftTransferLeadershipByAddress` | `/v1/operator/raft/transfer-leadership` | POST | `address string, q *WriteOptions` | `error` | 按地址转移领导权 |
| `RaftTransferLeadershipByID` | `/v1/operator/raft/transfer-leadership` | POST | `id string, q *WriteOptions` | `error` | 按 ID 转移领导权 |

### 19.2 调度器配置

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `SchedulerGetConfiguration` | `/v1/operator/scheduler/configuration` | GET | `q *QueryOptions` | `*SchedulerConfigurationResponse, *QueryMeta, error` | 获取调度器配置 |
| `SchedulerSetConfiguration` | `/v1/operator/scheduler/configuration` | PUT | `conf *SchedulerConfiguration, q *WriteOptions` | `*SchedulerSetConfigurationResponse, *WriteMeta, error` | 设置调度器配置 |
| `SchedulerCASConfiguration` | `/v1/operator/scheduler/configuration` | PUT | `conf *SchedulerConfiguration, q *WriteOptions` | `*SchedulerSetConfigurationResponse, *WriteMeta, error` | CAS 设置调度器配置 |

### 19.3 快照操作

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `Snapshot` | `/v1/operator/snapshot` | GET | `q *QueryOptions` | `io.ReadCloser, error` | 保存快照 |
| `SnapshotRestore` | `/v1/operator/snapshot` | POST | `in io.Reader, q *WriteOptions` | `*WriteMeta, error` | 恢复快照 |

### 19.4 许可证操作

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `LicensePut` | `/v1/operator/license` | PUT | `license string, q *WriteOptions` | `*WriteMeta, error` | 放置许可证 |
| `ApplyLicense` | `/v1/operator/license` | PUT | `license string, opts *ApplyLicenseOptions, q *WriteOptions` | `*WriteMeta, error` | 应用许可证（带选项） |
| `LicenseGet` | `/v1/operator/license` | GET | `q *QueryOptions` | `*LicenseReply, *QueryMeta, error` | 获取许可证 |

### 19.5 Autopilot 操作

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `AutopilotGetConfiguration` | `/v1/operator/autopilot/configuration` | GET | `q *QueryOptions` | `*AutopilotConfiguration, *QueryMeta, error` | 获取 Autopilot 配置 |
| `AutopilotSetConfiguration` | `/v1/operator/autopilot/configuration` | PUT | `conf *AutopilotConfiguration, q *WriteOptions` | `*WriteMeta, error` | 设置 Autopilot 配置 |
| `AutopilotCASConfiguration` | `/v1/operator/autopilot/configuration` | PUT | `conf *AutopilotConfiguration, q *WriteOptions` | `bool, *WriteMeta, error` | CAS 设置 Autopilot 配置 |
| `AutopilotServerHealth` | `/v1/operator/autopilot/health` | GET | `q *QueryOptions` | `*OperatorHealthReply, *QueryMeta, error` | 获取 Autopilot 服务器健康状态 |

### 19.6 指标操作

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `Metrics` | `/v1/metrics` | GET | `q *QueryOptions` | `[]byte, error` | 获取原始指标 |
| `MetricsSummary` | `/v1/metrics/summary` | GET | `q *QueryOptions` | `*MetricsSummary, *QueryMeta, error` | 获取指标摘要 |

### 19.7 其他操作

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `UpgradeCheckVaultWorkloadIdentity` | `/v1/operator/upgrade-check-vault-wi` | GET | `q *QueryOptions` | `*VaultWorkloadIdentityUpgradeCheck, *QueryMeta, error` | 检查 Vault 工作负载身份升级 |
| `Utilization` | `/v1/operator/utilization` | PUT | `opts *OperatorUtilizationOptions, w *WriteOptions` | `*OperatorUtilizationSnapshotResponse, *WriteMeta, error` | 获取集群利用率快照 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/operator_raft_list.go](file:///d:/claude/nomad/command/operator_raft_list.go) | `RaftGetConfiguration` |
| [command/operator_raft_leadership_transfer.go](file:///d:/claude/nomad/command/operator_raft_leadership_transfer.go) | `RaftTransferLeadershipByID`, `RaftTransferLeadershipByAddress` |
| [command/operator_scheduler_set_config.go](file:///d:/claude/nomad/command/operator_scheduler_set_config.go) | `SchedulerGetConfiguration`, `SchedulerSetConfiguration`, `SchedulerCASConfiguration` |
| [command/operator_snapshot_save.go](file:///d:/claude/nomad/command/operator_snapshot_save.go) | `Snapshot` |
| [command/operator_snapshot_restore.go](file:///d:/claude/nomad/command/operator_snapshot_restore.go) | `SnapshotRestore` |
| [command/operator_autopilot_health.go](file:///d:/claude/nomad/command/operator_autopilot_health.go) | `AutopilotGetConfiguration`, `AutopilotServerHealth` |
| [command/operator_utilization.go](file:///d:/claude/nomad/command/operator_utilization.go) | `Utilization` |
| [command/license.go](file:///d:/claude/nomad/command/license.go) | `LicenseGet`, `LicensePut`, `ApplyLicense` |
| [command/metrics.go](file:///d:/claude/nomad/command/metrics.go) | `Metrics`, `MetricsSummary` |
| [command/eval_delete.go](file:///d:/claude/nomad/command/eval_delete.go) | `SchedulerGetConfiguration` |
| [command/operator_debug.go](file:///d:/claude/nomad/command/operator_debug.go) | `RaftGetConfiguration`, `AutopilotGetConfiguration`, `AutopilotServerHealth` |

---

## 20. Quotas API (quota.go)

**文件**: [api/quota.go](file:///d:/claude/nomad/api/quota.go)

Quotas API 提供配额规格和使用情况的 CRUD 操作。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/quotas` | GET | `qo *QueryOptions` | `[]*QuotaSpec, *QueryMeta, error` | 列出所有配额 |
| `PrefixList` | `/v1/quotas` | GET | `prefix string, qo *QueryOptions` | `[]*QuotaSpec, *QueryMeta, error` | 前缀搜索配额 |
| `ListUsage` | `/v1/quota-usages` | GET | `qo *QueryOptions` | `[]*QuotaUsage, *QueryMeta, error` | 列出配额使用 |
| `PrefixListUsage` | `/v1/quota-usages` | GET | `prefix string, qo *QueryOptions` | `[]*QuotaUsage, *QueryMeta, error` | 前缀搜索配额使用 |
| `Info` | `/v1/quota/{name}` | GET | `name string, qo *QueryOptions` | `*QuotaSpec, *QueryMeta, error` | 获取配额详情 |
| `Usage` | `/v1/quota/usage/{name}` | GET | `name string, qo *QueryOptions` | `*QuotaUsage, *QueryMeta, error` | 获取配额使用详情 |
| `Register` | `/v1/quota` | PUT | `spec *QuotaSpec, qo *WriteOptions` | `*WriteMeta, error` | 注册配额 |
| `Delete` | `/v1/quota/{name}` | DELETE | `quota string, qo *WriteOptions` | `*WriteMeta, error` | 删除配额 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/quota_apply.go](file:///d:/claude/nomad/command/quota_apply.go) | `Register` |
| [command/quota_list.go](file:///d:/claude/nomad/command/quota_list.go) | `List`, `ListUsage` |
| [command/quota_inspect.go](file:///d:/claude/nomad/command/quota_inspect.go) | `Info` |
| [command/quota_status.go](file:///d:/claude/nomad/command/quota_status.go) | `Usage`, `Info` |

---

## 21. Namespaces API (namespace.go)

**文件**: [api/namespace.go](file:///d:/claude/nomad/api/namespace.go)

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/namespaces` | GET | `q *QueryOptions` | `[]*Namespace, *QueryMeta, error` | 列出所有命名空间 |
| `PrefixList` | `/v1/namespaces` | GET | `prefix string, q *QueryOptions` | `[]*Namespace, *QueryMeta, error` | 前缀搜索命名空间 |
| `Info` | `/v1/namespace/{name}` | GET | `name string, q *QueryOptions` | `*Namespace, *QueryMeta, error` | 获取命名空间详情 |
| `Register` | `/v1/namespace` | PUT | `namespace *Namespace, q *WriteOptions` | `*WriteMeta, error` | 注册命名空间 |
| `Delete` | `/v1/namespace/{name}` | DELETE | `namespace string, q *WriteOptions` | `*WriteMeta, error` | 删除命名空间 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/namespace_apply.go](file:///d:/claude/nomad/command/namespace_apply.go) | `Register` |
| [command/namespace_list.go](file:///d:/claude/nomad/command/namespace_list.go) | `List` |
| [command/namespace_status.go](file:///d:/claude/nomad/command/namespace_status.go) | `List`, `Info` |

---

## 22. Node Pools API (node_pools.go)

**文件**: [api/node_pools.go](file:///d:/claude/nomad/api/node_pools.go)

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/node/pools` | GET | `q *QueryOptions` | `[]*NodePool, *QueryMeta, error` | 列出所有节点池 |
| `PrefixList` | `/v1/node/pools` | GET | `prefix string, q *QueryOptions` | `[]*NodePool, *QueryMeta, error` | 前缀搜索节点池 |
| `Info` | `/v1/node/pool/{name}` | GET | `name string, q *QueryOptions` | `*NodePool, *QueryMeta, error` | 获取节点池详情 |
| `Register` | `/v1/node/pool` | PUT | `pool *NodePool, w *WriteOptions` | `*WriteMeta, error` | 注册节点池 |
| `Delete` | `/v1/node/pool/{name}` | DELETE | `name string, w *WriteOptions` | `*WriteMeta, error` | 删除节点池 |
| `ListJobs` | `/v1/node/pool/{poolName}/jobs` | GET | `poolName string, q *QueryOptions` | `[]*JobListStub, *QueryMeta, error` | 列出节点池中的作业 |
| `ListNodes` | `/v1/node/pool/{poolName}/nodes` | GET | `poolName string, q *QueryOptions` | `[]*NodeListStub, *QueryMeta, error` | 列出节点池中的节点 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/node_pool.go](file:///d:/claude/nomad/command/node_pool.go) | `List`, `Info` |
| [command/node_pool_apply.go](file:///d:/claude/nomad/command/node_pool_apply.go) | `Register` |
| [command/node_pool_delete.go](file:///d:/claude/nomad/command/node_pool_delete.go) | `Delete` |
| [command/node_pool_list.go](file:///d:/claude/nomad/command/node_pool_list.go) | `List` |

---

## 23. Variables API (variables.go)

**文件**: [api/variables.go](file:///d:/claude/nomad/api/variables.go)

Variables API 提供变量（键值对）的 CRUD 操作。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `Create` | `/v1/var` | PUT | `v *Variable, qo *WriteOptions` | `*Variable, *WriteMeta, error` | 创建变量（仅在不存在时） |
| `Read` | `/v1/var/{path}` | GET | `path string, qo *QueryOptions` | `*Variable, *QueryMeta, error` | 读取变量 |
| `Update` | `/v1/var/{path}` | PUT | `v *Variable, qo *WriteOptions` | `*Variable, *WriteMeta, error` | 更新变量（仅在存在时） |
| `Delete` | `/v1/var/{path}` | DELETE | `path string, qo *WriteOptions` | `*WriteMeta, error` | 删除变量 |
| `List` | `/v1/vars` | GET | `qo *QueryOptions` | `[]*VariableMetadata, *QueryMeta, error` | 列出所有变量 |
| `PrefixList` | `/v1/vars` | GET | `prefix string, qo *QueryOptions` | `[]*VariableMetadata, *QueryMeta, error` | 前缀搜索变量 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/var_put.go](file:///d:/claude/nomad/command/var_put.go) | `Create`, `Update` |
| [command/var_get.go](file:///d:/claude/nomad/command/var_get.go) | `Read` |
| [command/var_list.go](file:///d:/claude/nomad/command/var_list.go) | `List`, `PrefixList` |
| [command/var.go](file:///d:/claude/nomad/command/var.go) | `Read` |
| [command/var_lock.go](file:///d:/claude/nomad/command/var_lock.go) | `Read`, `Create`, `Update` |
| [command/job_init.go](file:///d:/claude/nomad/command/job_init.go) | `PrefixList`, `Read` |

---

## 24. Keyring API (keyring.go)

**文件**: [api/keyring.go](file:///d:/claude/nomad/api/keyring.go)

Keyring API 提供加密密钥（Root Key）的管理操作。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/operator/keyring/keys` | GET | `q *QueryOptions` | `[]*RootKeyMeta, *QueryMeta, error` | 列出所有根密钥 |
| `Delete` | `/v1/operator/keyring/key` | DELETE | `opts *KeyringDeleteOptions, w *WriteOptions` | `*WriteMeta, error` | 删除根密钥 |
| `Rotate` | `/v1/operator/keyring/rotate` | POST | `opts *KeyringRotateOptions, w *WriteOptions` | `*RootKeyMeta, *WriteMeta, error` | 轮换根密钥 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/operator_root_keyring.go](file:///d:/claude/nomad/command/operator_root_keyring.go) | `List` |
| [command/operator_root_keyring_remove.go](file:///d:/claude/nomad/command/operator_root_keyring_remove.go) | `Delete` |
| [command/operator_root_keyring_rotate.go](file:///d:/claude/nomad/command/operator_root_keyring_rotate.go) | `Rotate` |

---

## 25. Locks API (locks.go)

**文件**: [api/locks.go](file:///d:/claude/nomad/api/locks.go)

Locks API 提供分布式锁的操作，基于变量实现。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `Acquire` | `/v1/var/{path}` | PUT | `ctx context.Context` | `string, error` | 获取锁 |
| `Release` | `/v1/var/{path}` | DELETE | `ctx context.Context` | `error` | 释放锁 |
| `Renew` | `/v1/var/{path}` | PUT | `ctx context.Context` | `error` | 续约锁 |
| `LockTTL` | - | - | - | `time.Duration` | 获取锁的 TTL |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/var_lock.go](file:///d:/claude/nomad/command/var_lock.go) | `Acquire`, `Release`, `Renew` |

---

## 26. Sentinel Policies API (sentinel.go)

**文件**: [api/sentinel.go](file:///d:/claude/nomad/api/sentinel.go)

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/sentinel/policies` | GET | `q *QueryOptions` | `[]*SentinelPolicyListStub, *QueryMeta, error` | 列出 Sentinel 策略 |
| `Upsert` | `/v1/sentinel/policy` | POST | `policy *SentinelPolicy, q *WriteOptions` | `*WriteMeta, error` | 创建/更新 Sentinel 策略 |
| `Delete` | `/v1/sentinel/policy/{name}` | DELETE | `policyName string, q *WriteOptions` | `*WriteMeta, error` | 删除 Sentinel 策略 |
| `Info` | `/v1/sentinel/policy/{name}` | GET | `policyName string, q *QueryOptions` | `*SentinelPolicy, *QueryMeta, error` | 获取 Sentinel 策略详情 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/sentinel_apply.go](file:///d:/claude/nomad/command/sentinel_apply.go) | `Upsert` |

---

## 27. Scaling API (scaling.go)

**文件**: [api/scaling.go](file:///d:/claude/nomad/api/scaling.go)

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `ListPolicies` | `/v1/scaling/policies` | GET | `q *QueryOptions` | `[]*ScalingPolicyListStub, *QueryMeta, error` | 列出缩放策略 |
| `GetPolicy` | `/v1/scaling/policy/{id}` | GET | `id string, q *QueryOptions` | `*ScalingPolicy, *QueryMeta, error` | 获取缩放策略详情 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/scaling_policy_list.go](file:///d:/claude/nomad/command/scaling_policy_list.go) | `ListPolicies` |
| [command/scaling_policy_info.go](file:///d:/claude/nomad/command/scaling_policy_info.go) | `GetPolicy` |

---

## 28. Recommendations API (recommendations.go)

**文件**: [api/recommendations.go](file:///d:/claude/nomad/api/recommendations.go)

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `List` | `/v1/recommendations` | GET | `q *QueryOptions` | `[]*Recommendation, *QueryMeta, error` | 列出建议 |
| `Info` | `/v1/recommendation/{id}` | GET | `id string, q *QueryOptions` | `*Recommendation, *QueryMeta, error` | 获取建议详情 |
| `Upsert` | `/v1/recommendation` | POST | `rec *Recommendation, q *WriteOptions` | `*Recommendation, *WriteMeta, error` | 创建/更新建议 |
| `Delete` | `/v1/recommendation` | DELETE | `ids []string, q *WriteOptions` | `*WriteMeta, error` | 删除建议 |
| `Apply` | `/v1/recommendation/apply` | POST | `ids []string, policyOverride bool` | - | 应用建议 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/recommendation_list.go](file:///d:/claude/nomad/command/recommendation_list.go) | `List` |
| [command/recommendation_apply.go](file:///d:/claude/nomad/command/recommendation_apply.go) | `Apply` |

---

## 29. Raw API (raw.go)

**文件**: [api/raw.go](file:///d:/claude/nomad/api/raw.go)

Raw API 提供原始 HTTP 请求方法，允许直接访问任意端点。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `Query` | `{endpoint}` | GET | `endpoint string, out interface{}, q *QueryOptions` | `*QueryMeta, error` | 原始 GET 请求 |
| `Response` | `{endpoint}` | GET | `endpoint string, q *QueryOptions` | `io.ReadCloser, error` | 获取原始响应流 |
| `Write` | `{endpoint}` | PUT | `endpoint string, in, out interface{}, q *WriteOptions` | `*WriteMeta, error` | 原始 PUT 请求 |
| `Delete` | `{endpoint}` | DELETE | `endpoint string, out interface{}, q *WriteOptions` | `*WriteMeta, error` | 原始 DELETE 请求 |
| `Do` | - | - | `req *http.Request` | `*http.Response, error` | 执行自定义 HTTP 请求 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/integration_test.go](file:///d:/claude/nomad/command/integration_test.go) | `Write` |

---

## 30. Node Meta API (node_meta.go)

**文件**: [api/node_meta.go](file:///d:/claude/nomad/api/node_meta.go)

NodeMeta API 提供节点元数据的读取和更新操作。通过 `client.Nodes().Meta()` 访问。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `Apply` | `/v1/client/metadata` | POST | `meta *NodeMetaApplyRequest, qo *QueryOptions` | `*NodeMetaResponse, error` | 应用节点元数据 |
| `Read` | `/v1/client/metadata` | GET | `nodeID string, qo *QueryOptions` | `*NodeMetaResponse, error` | 读取节点元数据 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/node_meta_apply.go](file:///d:/claude/nomad/command/node_meta_apply.go) | `Apply`, `Read` |

---

## 31. Node Identity API (node_identity.go)

**文件**: [api/node_identity.go](file:///d:/claude/nomad/api/node_identity.go)

NodeIdentity API 提供节点身份的获取和续约操作。通过 `client.Nodes().Identity()` 访问。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `Get` | `/v1/node/identity` | GET | `req *NodeIdentityGetRequest, qo *QueryOptions` | `*NodeIdentityGetResponse, error` | 获取节点身份 |
| `Renew` | `/v1/node/identity/renew` | POST | `req *NodeIdentityRenewRequest, qo *QueryOptions` | `*NodeIdentityRenewResponse, error` | 续约节点身份 |

### 调用位置

| 调用文件 | 调用的方法 |
|----------|-----------|
| [command/node_intro_create.go](file:///d:/claude/nomad/command/node_intro_create.go) | `Get` |
| [command/node_identity_get.go](file:///d:/claude/nomad/command/node_identity_get.go) | `Get` |
| [command/node_identity_renew.go](file:///d:/claude/nomad/command/node_identity_renew.go) | `Renew` |

---

## 32. ACL Identity API (acl.go)

**文件**: [api/acl.go](file:///d:/claude/nomad/api/acl.go)

ACLIdentity API 提供客户端介绍令牌的创建操作。

### 方法列表

| 方法 | 端点 | HTTP | 参数 | 返回 | 说明 |
|------|------|------|------|------|------|
| `CreateClientIntroductionToken` | `/v1/acl/identity/cit` | POST | - | - | 创建客户端介绍令牌 |

### 调用位置

主要在内部使用。

---

## 附录: API 调用分布统计

### 按目录统计主要调用者

| 目录 | 用途 | 说明 |
|------|------|------|
| `command/` | CLI 命令实现 | API 的主要消费者，每个 CLI 命令对应一个 API 调用 |
| `command/agent/` | Agent 子命令和 HTTP 端点 | 包含 HTTP 端点实现和 Agent 管理 |
| `e2e/` | 端到端测试 | 大量使用 API 进行测试设置和验证 |
| `e2e/e2eutil/` | E2E 测试工具 | 提供通用的 API 调用工具函数 |
| `jobspec2/` | 作业定义解析 | 使用 `Job` 类型进行 HCL 解析和规范化 |
| `lib/auth/oidc/` | OIDC 认证 | 使用 ACL 认证相关 API |
| `demo/` | 示例代码 | 基准测试等示例 |

### API 方法统计

| API 组 | 文件 | 方法数 |
|--------|------|--------|
| Jobs | jobs.go | 38 |
| ACL (全部) | acl.go | 35+ |
| Agent | agent.go | 29 |
| Allocations | allocations.go | 14 |
| Nodes | nodes.go | 18 |
| CSI Volumes | csi.go | 16 |
| Operator | operator*.go | 17 |
| Deployments | deployments.go | 10 |
| Evaluations | evaluations.go | 7 |
| Node Pools | node_pools.go | 7 |
| Variables | variables.go | 6 |
| Host Volumes | host_volumes.go | 5 |
| Raw | raw.go | 5 |
| Recommendations | recommendations.go | 5 |
| Namespaces | namespace.go | 5 |
| CSI Plugins | csi.go | 2 |
| Quotas | quota.go | 8 |
| FS | fs.go | 6 |
| ACL Policies | acl.go | 5 |
| ACL Tokens | acl.go | 11 |
| ACL Roles | acl.go | 6 |
| ACL AuthMethods | acl.go | 5 |
| ACL BindingRules | acl.go | 5 |
| ACL Auth | acl.go | 3 |
| Keyring | keyring.go | 3 |
| Locks | locks.go | 4 |
| Node Meta | node_meta.go | 2 |
| Node Identity | node_identity.go | 2 |
| EventStream | event_stream.go | 1 |
| Services | services.go | 3 |
| Status | status.go | 3 |
| System | system.go | 2 |
| Regions | regions.go | 1 |
| Sentinel | sentinel.go | 4 |
| Scaling | scaling.go | 2 |
| Search | search.go | 2 |
| Host Volume Claims | host_volume_claims.go | 2 |

### HTTP 方法分布

| HTTP 方法 | 用途 |
|-----------|------|
| GET | 查询操作（使用 `QueryOptions`） |
| POST | 创建/更新操作（使用 `WriteOptions`） |
| PUT | 注册/替换操作（使用 `WriteOptions`） |
| DELETE | 删除操作（使用 `WriteOptions`） |
| WebSocket | 流式操作（如 Exec、EventStream） |