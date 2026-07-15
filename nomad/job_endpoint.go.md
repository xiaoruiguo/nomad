# job_endpoint.go 代码说明文档

> 文件路径：[job_endpoint.go](file:///d:/claude/nomad/nomad/job_endpoint.go)
> 总行数：2434 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **作业 RPC 端点**，处理作业的 CRUD 操作（注册、查询、停止、调度等），是 Nomad API 的核心端点之一。包含作业验证、钩子链、状态查询等功能。

## 2. 类型定义

### Job

**定义位置**：[L51](file:///d:/claude/nomad/nomad/job_endpoint.go#L51)

**类型**：struct

```go
	srv *Server
	ctx *RPCContext
	logger hclog.Logger
	mutators []jobMutator
	validators []jobValidator
```

**关联方法**（24 个）：`Register`, `doRegister`, `Summary`, `Validate`, `Revert`, `Stable`, `Evaluate`, `Deregister`, `BatchDeregister`, `Scale`, `GetJobSubmission`, `GetJob`, `GetJobVersions`, `List`, `Allocations`, `Evaluations`, `Deployments`, `LatestDeployment`, `GetActions`, `Plan`, `Dispatch`, `ScaleStatus`, `GetServiceRegistrations`, `TagVersion`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `DispatchPayloadSizeLimit` | `16 * 1024` |

### 变量

| 名称 | 值 |
|------|----|
| `ErrMultipleNamespaces` | `errors.New("multiple Vault namespaces requires Nomad Ente...` |
| `allowForceRescheduleTransition` | `&structs.DesiredTransition{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewJobEndpoints` | - | `s *Server, ctx *RPCContext` | `*Job` | [L62](file:///d:/claude/nomad/nomad/job_endpoint.go#L62) |
| `Register` | `j *Job` | `args *structs.JobRegisterRequest, reply *structs.JobRegisterResponse` | `error` | [L94](file:///d:/claude/nomad/nomad/job_endpoint.go#L94) |
| `doRegister` | `j *Job` | `aclObj *acl.ACL, additionalAllowedPermissions []string, args *structs.JobReg...` | `error` | [L116](file:///d:/claude/nomad/nomad/job_endpoint.go#L116) |
| `propagateScalingPolicyIDs` | - | `old *structs.Job, new *structs.Job` | `error` | [L399](file:///d:/claude/nomad/nomad/job_endpoint.go#L399) |
| `getSignalConstraint` | - | `signals []string` | `*structs.Constraint` | [L424](file:///d:/claude/nomad/nomad/job_endpoint.go#L424) |
| `Summary` | `j *Job` | `args *structs.JobSummaryRequest, reply *structs.JobSummaryResponse` | `error` | [L434](file:///d:/claude/nomad/nomad/job_endpoint.go#L434) |
| `Validate` | `j *Job` | `args *structs.JobValidateRequest, reply *structs.JobValidateResponse` | `error` | [L487](file:///d:/claude/nomad/nomad/job_endpoint.go#L487) |
| `Revert` | `j *Job` | `args *structs.JobRevertRequest, reply *structs.JobRegisterResponse` | `error` | [L539](file:///d:/claude/nomad/nomad/job_endpoint.go#L539) |
| `Stable` | `j *Job` | `args *structs.JobStabilityRequest, reply *structs.JobStabilityResponse` | `error` | [L624](file:///d:/claude/nomad/nomad/job_endpoint.go#L624) |
| `Evaluate` | `j *Job` | `args *structs.JobEvaluateRequest, reply *structs.JobRegisterResponse` | `error` | [L678](file:///d:/claude/nomad/nomad/job_endpoint.go#L678) |
| `Deregister` | `j *Job` | `args *structs.JobDeregisterRequest, reply *structs.JobDeregisterResponse` | `error` | [L782](file:///d:/claude/nomad/nomad/job_endpoint.go#L782) |
| `BatchDeregister` | `j *Job` | `args *structs.JobBatchDeregisterRequest, reply *structs.JobBatchDeregisterRe...` | `error` | [L891](file:///d:/claude/nomad/nomad/job_endpoint.go#L891) |
| `Scale` | `j *Job` | `args *structs.JobScaleRequest, reply *structs.JobRegisterResponse` | `error` | [L932](file:///d:/claude/nomad/nomad/job_endpoint.go#L932) |
| `GetJobSubmission` | `j *Job` | `args *structs.JobSubmissionRequest, reply *structs.JobSubmissionResponse` | `error` | [L1141](file:///d:/claude/nomad/nomad/job_endpoint.go#L1141) |
| `GetJob` | `j *Job` | `args *structs.JobSpecificRequest, reply *structs.SingleJobResponse` | `error` | [L1188](file:///d:/claude/nomad/nomad/job_endpoint.go#L1188) |
| `GetJobVersions` | `j *Job` | `args *structs.JobVersionsRequest, reply *structs.JobVersionsResponse` | `error` | [L1239](file:///d:/claude/nomad/nomad/job_endpoint.go#L1239) |
| `allowedNSes` | - | `aclObj *acl.ACL, state *state.StateStore, allow func(...)` | `map[string]bool, error` | [L1357](file:///d:/claude/nomad/nomad/job_endpoint.go#L1357) |
| `registrationsAreAllowed` | - | `aclObj *acl.ACL, state *state.StateStore` | `bool, error` | [L1385](file:///d:/claude/nomad/nomad/job_endpoint.go#L1385) |
| `List` | `j *Job` | `args *structs.JobListRequest, reply *structs.JobListResponse` | `error` | [L1400](file:///d:/claude/nomad/nomad/job_endpoint.go#L1400) |
| `Allocations` | `j *Job` | `args *structs.JobSpecificRequest, reply *structs.JobAllocationsResponse` | `error` | [L1500](file:///d:/claude/nomad/nomad/job_endpoint.go#L1500) |
| `Evaluations` | `j *Job` | `args *structs.JobSpecificRequest, reply *structs.JobEvaluationsResponse` | `error` | [L1560](file:///d:/claude/nomad/nomad/job_endpoint.go#L1560) |
| `Deployments` | `j *Job` | `args *structs.JobSpecificRequest, reply *structs.DeploymentListResponse` | `error` | [L1607](file:///d:/claude/nomad/nomad/job_endpoint.go#L1607) |
| `LatestDeployment` | `j *Job` | `args *structs.JobSpecificRequest, reply *structs.SingleDeploymentResponse` | `error` | [L1654](file:///d:/claude/nomad/nomad/job_endpoint.go#L1654) |
| `GetActions` | `j *Job` | `args *structs.JobActionListRequest, reply *structs.JobActionListResponse` | `error` | [L1707](file:///d:/claude/nomad/nomad/job_endpoint.go#L1707) |
| `Plan` | `j *Job` | `args *structs.JobPlanRequest, reply *structs.JobPlanResponse` | `error` | [L1765](file:///d:/claude/nomad/nomad/job_endpoint.go#L1765) |
| `validateJobUpdate` | - | `old *structs.Job, new *structs.Job` | `error` | [L1947](file:///d:/claude/nomad/nomad/job_endpoint.go#L1947) |
| `Dispatch` | `j *Job` | `args *structs.JobDispatchRequest, reply *structs.JobDispatchResponse` | `error` | [L1985](file:///d:/claude/nomad/nomad/job_endpoint.go#L1985) |
| `validateDispatchRequest` | - | `req *structs.JobDispatchRequest, job *structs.Job, config *Config` | `error` | [L2133](file:///d:/claude/nomad/nomad/job_endpoint.go#L2133) |
| `ScaleStatus` | `j *Job` | `args *structs.JobScaleStatusRequest, reply *structs.JobScaleStatusResponse` | `error` | [L2203](file:///d:/claude/nomad/nomad/job_endpoint.go#L2203) |
| `GetServiceRegistrations` | `j *Job` | `args *structs.JobServiceRegistrationsRequest, reply *structs.JobServiceRegis...` | `error` | [L2327](file:///d:/claude/nomad/nomad/job_endpoint.go#L2327) |
| `TagVersion` | `j *Job` | `args *structs.JobApplyTagRequest, reply *structs.JobTagResponse` | `error` | [L2390](file:///d:/claude/nomad/nomad/job_endpoint.go#L2390) |

## 5. 核心方法详解

### Register()

**签名**：`func (j *Job) Register(args *structs.JobRegisterRequest, reply *structs.JobRegisterResponse) error`

**位置**：[L94](file:///d:/claude/nomad/nomad/job_endpoint.go#L94)

### Summary()

**签名**：`func (j *Job) Summary(args *structs.JobSummaryRequest, reply *structs.JobSummaryResponse) error`

**位置**：[L434](file:///d:/claude/nomad/nomad/job_endpoint.go#L434)

### Validate()

**签名**：`func (j *Job) Validate(args *structs.JobValidateRequest, reply *structs.JobValidateResponse) error`

**位置**：[L487](file:///d:/claude/nomad/nomad/job_endpoint.go#L487)

### Revert()

**签名**：`func (j *Job) Revert(args *structs.JobRevertRequest, reply *structs.JobRegisterResponse) error`

**位置**：[L539](file:///d:/claude/nomad/nomad/job_endpoint.go#L539)

### Stable()

**签名**：`func (j *Job) Stable(args *structs.JobStabilityRequest, reply *structs.JobStabilityResponse) error`

**位置**：[L624](file:///d:/claude/nomad/nomad/job_endpoint.go#L624)

### Evaluate()

**签名**：`func (j *Job) Evaluate(args *structs.JobEvaluateRequest, reply *structs.JobRegisterResponse) error`

**位置**：[L678](file:///d:/claude/nomad/nomad/job_endpoint.go#L678)

### Deregister()

**签名**：`func (j *Job) Deregister(args *structs.JobDeregisterRequest, reply *structs.JobDeregisterResponse) error`

**位置**：[L782](file:///d:/claude/nomad/nomad/job_endpoint.go#L782)

### Scale()

**签名**：`func (j *Job) Scale(args *structs.JobScaleRequest, reply *structs.JobRegisterResponse) error`

**位置**：[L932](file:///d:/claude/nomad/nomad/job_endpoint.go#L932)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `net/http` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/acl` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state/paginator` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/scheduler` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |
| `github.com/golang/snappy` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **组合模式**：结构体嵌入 Server 引用，通过组合获取 Server 上下文
- **RPC 端点模式**：定义 RPC 端点结构体，将 Server 引用注入端点，处理特定资源的 RPC 请求
- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标
- **ACL 集成**：集成访问控制列表，验证请求权限

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [job_endpoint_test.go](file:///d:/claude/nomad/nomad/job_endpoint_test.go) | 对应测试文件 |

