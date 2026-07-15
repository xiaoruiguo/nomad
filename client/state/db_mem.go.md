# db_mem.go 代码说明文档

> 文件路径：[state/db_mem.go](file:///d:/claude/nomad/client/state/db_mem.go)
> 总行数：429 行
> 所属包：`state`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Client 状态子包**（`client/state`），使用 BoltDB 持久化 Client 的本地状态（分配、任务状态等）。

## 2. 类型定义

### MemDB

**定义位置**：[L24](file:///d:/claude/nomad/client/state/db_mem.go#L24)

**类型**：struct

```go
	allocs map[string]*structs.Allocation
	deployStatus map[string]*structs.AllocDeploymentStatus
	networkStatus map[string]*structs.AllocNetworkStatus
	acknowledgedState map[string]*arstate.State
	allocVolumeStates map[string]*arstate.AllocVolumes
	localTaskState map[string]map[string]*state.LocalState
	taskState map[string]map[string]*structs.TaskState
	checks checks.ClientResults
	identities map[string][]*structs.SignedWorkloadIdentity
	consulACLTokens map[string][]*cstructs.ConsulACLToken
	devManagerPs *dmstate.PluginState
	driverManagerPs *driverstate.PluginState
	dynamicManagerPs *dynamicplugins.RegistryState
	nodeMeta map[string]*string
	nodeRegistration *cstructs.NodeRegistration
	dynamicHostVolumes map[string]*cstructs.HostVolumeState
	clientIdentity atomic.Value
	logger hclog.Logger
	mu sync.RWMutex
```

**关联方法**（41 个）：`Name`, `Upgrade`, `GetAllAllocations`, `PutAllocation`, `GetDeploymentStatus`, `PutDeploymentStatus`, `GetNetworkStatus`, `PutNetworkStatus`, `PutAcknowledgedState`, `GetAcknowledgedState`, `PutAllocVolumes`, `GetAllocVolumes`, `PutAllocIdentities`, `GetAllocIdentities`, `PutAllocConsulACLTokens`, `GetAllocConsulACLTokens`, `GetTaskRunnerState`, `PutTaskRunnerLocalState`, `PutTaskState`, `DeleteTaskBucket`, `DeleteAllocationBucket`, `PutDevicePluginState`, `GetDevicePluginState`, `GetDriverPluginState`, `PutDriverPluginState`, `GetDynamicPluginRegistryState`, `PutDynamicPluginRegistryState`, `PutCheckResult`, `GetCheckResults`, `DeleteCheckResults`, `PurgeCheckResults`, `PutNodeMeta`, `GetNodeMeta`, `PutNodeRegistration`, `GetNodeRegistration`, `PutDynamicHostVolume`, `GetDynamicHostVolumes`, `DeleteDynamicHostVolume`, `PutNodeIdentity`, `GetNodeIdentity`, `Close`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewMemDB` | - | `logger hclog.Logger` | `*MemDB` | [L77](file:///d:/claude/nomad/client/state/db_mem.go#L77) |
| `Name` | `m *MemDB` | - | `string` | [L95](file:///d:/claude/nomad/client/state/db_mem.go#L95) |
| `Upgrade` | `m *MemDB` | - | `error` | [L99](file:///d:/claude/nomad/client/state/db_mem.go#L99) |
| `GetAllAllocations` | `m *MemDB` | - | `[]*structs.Allocation, map[string]error, error` | [L103](file:///d:/claude/nomad/client/state/db_mem.go#L103) |
| `PutAllocation` | `m *MemDB` | `alloc *structs.Allocation, _ ...WriteOption` | `error` | [L115](file:///d:/claude/nomad/client/state/db_mem.go#L115) |
| `GetDeploymentStatus` | `m *MemDB` | `allocID string` | `*structs.AllocDeploymentStatus, error` | [L122](file:///d:/claude/nomad/client/state/db_mem.go#L122) |
| `PutDeploymentStatus` | `m *MemDB` | `allocID string, ds *structs.AllocDeploymentStatus` | `error` | [L128](file:///d:/claude/nomad/client/state/db_mem.go#L128) |
| `GetNetworkStatus` | `m *MemDB` | `allocID string` | `*structs.AllocNetworkStatus, error` | [L135](file:///d:/claude/nomad/client/state/db_mem.go#L135) |
| `PutNetworkStatus` | `m *MemDB` | `allocID string, ns *structs.AllocNetworkStatus, _ ...WriteOption` | `error` | [L141](file:///d:/claude/nomad/client/state/db_mem.go#L141) |
| `PutAcknowledgedState` | `m *MemDB` | `allocID string, state *arstate.State, opts ...WriteOption` | `error` | [L148](file:///d:/claude/nomad/client/state/db_mem.go#L148) |
| `GetAcknowledgedState` | `m *MemDB` | `allocID string` | `*arstate.State, error` | [L155](file:///d:/claude/nomad/client/state/db_mem.go#L155) |
| `PutAllocVolumes` | `m *MemDB` | `allocID string, state *arstate.AllocVolumes, opts ...WriteOption` | `error` | [L161](file:///d:/claude/nomad/client/state/db_mem.go#L161) |
| `GetAllocVolumes` | `m *MemDB` | `allocID string` | `*arstate.AllocVolumes, error` | [L168](file:///d:/claude/nomad/client/state/db_mem.go#L168) |
| `PutAllocIdentities` | `m *MemDB` | `allocID string, identities []*structs.SignedWorkloadIdentity, _ ...WriteOption` | `error` | [L174](file:///d:/claude/nomad/client/state/db_mem.go#L174) |
| `GetAllocIdentities` | `m *MemDB` | `allocID string` | `[]*structs.SignedWorkloadIdentity, error` | [L181](file:///d:/claude/nomad/client/state/db_mem.go#L181) |
| `PutAllocConsulACLTokens` | `m *MemDB` | `allocID string, tokens []*cstructs.ConsulACLToken, opts ...WriteOption` | `error` | [L187](file:///d:/claude/nomad/client/state/db_mem.go#L187) |
| `GetAllocConsulACLTokens` | `m *MemDB` | `allocID string` | `[]*cstructs.ConsulACLToken, error` | [L195](file:///d:/claude/nomad/client/state/db_mem.go#L195) |
| `GetTaskRunnerState` | `m *MemDB` | `allocID string, taskName string` | `*state.LocalState, *structs.TaskState, error` | [L201](file:///d:/claude/nomad/client/state/db_mem.go#L201) |
| `PutTaskRunnerLocalState` | `m *MemDB` | `allocID string, taskName string, val *state.LocalState` | `error` | [L223](file:///d:/claude/nomad/client/state/db_mem.go#L223) |
| `PutTaskState` | `m *MemDB` | `allocID string, taskName string, state *structs.TaskState` | `error` | [L239](file:///d:/claude/nomad/client/state/db_mem.go#L239) |
| `DeleteTaskBucket` | `m *MemDB` | `allocID string, taskName string` | `error` | [L255](file:///d:/claude/nomad/client/state/db_mem.go#L255) |
| `DeleteAllocationBucket` | `m *MemDB` | `allocID string, _ ...WriteOption` | `error` | [L270](file:///d:/claude/nomad/client/state/db_mem.go#L270) |
| `PutDevicePluginState` | `m *MemDB` | `ps *dmstate.PluginState` | `error` | [L282](file:///d:/claude/nomad/client/state/db_mem.go#L282) |
| `GetDevicePluginState` | `m *MemDB` | - | `*dmstate.PluginState, error` | [L291](file:///d:/claude/nomad/client/state/db_mem.go#L291) |
| `GetDriverPluginState` | `m *MemDB` | - | `*driverstate.PluginState, error` | [L297](file:///d:/claude/nomad/client/state/db_mem.go#L297) |
| `PutDriverPluginState` | `m *MemDB` | `ps *driverstate.PluginState` | `error` | [L303](file:///d:/claude/nomad/client/state/db_mem.go#L303) |
| `GetDynamicPluginRegistryState` | `m *MemDB` | - | `*dynamicplugins.RegistryState, error` | [L310](file:///d:/claude/nomad/client/state/db_mem.go#L310) |
| `PutDynamicPluginRegistryState` | `m *MemDB` | `ps *dynamicplugins.RegistryState` | `error` | [L316](file:///d:/claude/nomad/client/state/db_mem.go#L316) |
| `PutCheckResult` | `m *MemDB` | `allocID string, qr *structs.CheckQueryResult` | `error` | [L323](file:///d:/claude/nomad/client/state/db_mem.go#L323) |
| `GetCheckResults` | `m *MemDB` | - | `checks.ClientResults, error` | [L335](file:///d:/claude/nomad/client/state/db_mem.go#L335) |
| `DeleteCheckResults` | `m *MemDB` | `allocID string, checkIDs []structs.CheckID` | `error` | [L341](file:///d:/claude/nomad/client/state/db_mem.go#L341) |
| `PurgeCheckResults` | `m *MemDB` | `allocID string` | `error` | [L350](file:///d:/claude/nomad/client/state/db_mem.go#L350) |
| `PutNodeMeta` | `m *MemDB` | `nm map[string]*string` | `error` | [L357](file:///d:/claude/nomad/client/state/db_mem.go#L357) |
| `GetNodeMeta` | `m *MemDB` | - | `map[string]*string, error` | [L364](file:///d:/claude/nomad/client/state/db_mem.go#L364) |
| `PutNodeRegistration` | `m *MemDB` | `reg *cstructs.NodeRegistration` | `error` | [L370](file:///d:/claude/nomad/client/state/db_mem.go#L370) |
| `GetNodeRegistration` | `m *MemDB` | - | `*cstructs.NodeRegistration, error` | [L377](file:///d:/claude/nomad/client/state/db_mem.go#L377) |
| `PutDynamicHostVolume` | `m *MemDB` | `vol *cstructs.HostVolumeState` | `error` | [L383](file:///d:/claude/nomad/client/state/db_mem.go#L383) |
| `GetDynamicHostVolumes` | `m *MemDB` | - | `[]*cstructs.HostVolumeState, error` | [L389](file:///d:/claude/nomad/client/state/db_mem.go#L389) |
| `DeleteDynamicHostVolume` | `m *MemDB` | `s string` | `error` | [L398](file:///d:/claude/nomad/client/state/db_mem.go#L398) |
| `PutNodeIdentity` | `m *MemDB` | `identity string` | `error` | [L405](file:///d:/claude/nomad/client/state/db_mem.go#L405) |
| `GetNodeIdentity` | `m *MemDB` | - | `string, error` | [L410](file:///d:/claude/nomad/client/state/db_mem.go#L410) |
| `Close` | `m *MemDB` | - | `error` | [L418](file:///d:/claude/nomad/client/state/db_mem.go#L418) |

## 5. 核心方法详解

### GetAllAllocations()

**签名**：`func (m *MemDB) GetAllAllocations() []*structs.Allocation, map[string]error, error`

**位置**：[L103](file:///d:/claude/nomad/client/state/db_mem.go#L103)

### GetDeploymentStatus()

**签名**：`func (m *MemDB) GetDeploymentStatus(allocID string) *structs.AllocDeploymentStatus, error`

**位置**：[L122](file:///d:/claude/nomad/client/state/db_mem.go#L122)

### GetNetworkStatus()

**签名**：`func (m *MemDB) GetNetworkStatus(allocID string) *structs.AllocNetworkStatus, error`

**位置**：[L135](file:///d:/claude/nomad/client/state/db_mem.go#L135)

### GetAcknowledgedState()

**签名**：`func (m *MemDB) GetAcknowledgedState(allocID string) *arstate.State, error`

**位置**：[L155](file:///d:/claude/nomad/client/state/db_mem.go#L155)

### GetAllocVolumes()

**签名**：`func (m *MemDB) GetAllocVolumes(allocID string) *arstate.AllocVolumes, error`

**位置**：[L168](file:///d:/claude/nomad/client/state/db_mem.go#L168)

### GetAllocIdentities()

**签名**：`func (m *MemDB) GetAllocIdentities(allocID string) []*structs.SignedWorkloadIdentity, error`

**位置**：[L181](file:///d:/claude/nomad/client/state/db_mem.go#L181)

### GetAllocConsulACLTokens()

**签名**：`func (m *MemDB) GetAllocConsulACLTokens(allocID string) []*cstructs.ConsulACLToken, error`

**位置**：[L195](file:///d:/claude/nomad/client/state/db_mem.go#L195)

### GetTaskRunnerState()

**签名**：`func (m *MemDB) GetTaskRunnerState(allocID string, taskName string) *state.LocalState, *structs.TaskState, error`

**位置**：[L201](file:///d:/claude/nomad/client/state/db_mem.go#L201)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `maps` | 标准库 |
| `sync` | 标准库 |
| `sync/atomic` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/state` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/state` | 内部包 |
| `github.com/hashicorp/nomad/client/devicemanager/state` | 内部包 |
| `github.com/hashicorp/nomad/client/dynamicplugins` | 内部包 |
| `github.com/hashicorp/nomad/client/pluginmanager/drivermanager/state` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration/checks` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|

