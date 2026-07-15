# db_bolt.go 代码说明文档

> 文件路径：[state/db_bolt.go](file:///d:/claude/nomad/client/state/db_bolt.go)
> 总行数：1271 行
> 所属包：`state`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Client 状态子包**（`client/state`），使用 BoltDB 持久化 Client 的本地状态（分配、任务状态等）。

## 2. 类型定义

### NewStateDBFunc

**定义位置**：[L162](file:///d:/claude/nomad/client/state/db_bolt.go#L162)

**类型定义**：`func(...)`

### BoltStateDB

**定义位置**：[L178](file:///d:/claude/nomad/client/state/db_bolt.go#L178)

**类型**：struct

```go
	stateDir string
	db *boltdd.DB
	logger hclog.Logger
```

**关联方法**（45 个）：`Name`, `GetAllAllocations`, `getAllAllocations`, `PutAllocation`, `PutDeploymentStatus`, `GetDeploymentStatus`, `PutNetworkStatus`, `GetNetworkStatus`, `PutAcknowledgedState`, `GetAcknowledgedState`, `PutAllocVolumes`, `GetAllocVolumes`, `PutAllocIdentities`, `GetAllocIdentities`, `PutAllocConsulACLTokens`, `GetAllocConsulACLTokens`, `GetTaskRunnerState`, `PutTaskRunnerLocalState`, `PutTaskState`, `DeleteTaskBucket`, `DeleteAllocationBucket`, `Close`, `PutDevicePluginState`, `GetDevicePluginState`, `PutDriverPluginState`, `GetDriverPluginState`, `PutDynamicPluginRegistryState`, `GetDynamicPluginRegistryState`, `PutCheckResult`, `GetCheckResults`, `DeleteCheckResults`, `PurgeCheckResults`, `PutNodeMeta`, `GetNodeMeta`, `PutNodeRegistration`, `GetNodeRegistration`, `PutDynamicHostVolume`, `GetDynamicHostVolumes`, `DeleteDynamicHostVolume`, `PutNodeIdentity`, `GetNodeIdentity`, `init`, `updateWithOptions`, `Upgrade`, `DB`

### allocEntry

**定义位置**：[L250](file:///d:/claude/nomad/client/state/db_bolt.go#L250)

**类型**：struct

```go
	Alloc *structs.Allocation
```

### deployStatusEntry

**定义位置**：[L316](file:///d:/claude/nomad/client/state/db_bolt.go#L316)

**类型**：struct

```go
	DeploymentStatus *structs.AllocDeploymentStatus
```

### networkStatusEntry

**定义位置**：[L374](file:///d:/claude/nomad/client/state/db_bolt.go#L374)

**类型**：struct

```go
	NetworkStatus *structs.AllocNetworkStatus
```

### allocVolumeStatesEntry

**定义位置**：[L479](file:///d:/claude/nomad/client/state/db_bolt.go#L479)

**类型**：struct

```go
	State *arstate.AllocVolumes
```

### allocIdentitiesEntry

**定义位置**：[L534](file:///d:/claude/nomad/client/state/db_bolt.go#L534)

**类型**：struct

```go
	Identities []*structs.SignedWorkloadIdentity
```

### allocConsulACLTokenEntry

**定义位置**：[L586](file:///d:/claude/nomad/client/state/db_bolt.go#L586)

**类型**：struct

```go
	Tokens []*cstructs.ConsulACLToken
```

### clientIdentity

**定义位置**：[L1154](file:///d:/claude/nomad/client/state/db_bolt.go#L1154)

**类型**：struct

```go
	SignedIdentity string
```

### acknowledgedStateEntry

**定义位置**：[L1197](file:///d:/claude/nomad/client/state/db_bolt.go#L1197)

**类型**：struct

```go
	State *arstate.State
```

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `metaBucketName` | `[]byte("meta")` |
| `metaVersionKey` | `[]byte("version")` |
| `metaVersion` | `[]byte{...}` |
| `metaUpgradedKey` | `[]byte("upgraded")` |
| `allocationsBucketName` | `[]byte("allocations")` |
| `allocKey` | `[]byte("alloc")` |
| `allocDeployStatusKey` | `[]byte("deploy_status")` |
| `allocNetworkStatusKey` | `[]byte("network_status")` |
| `acknowledgedStateKey` | `[]byte("acknowledged_state")` |
| `allocVolumeKey` | `[]byte("alloc_volume")` |
| `allocIdentityKey` | `[]byte("alloc_identities")` |
| `allocConsulACLTokenKey` | `[]byte("alloc_consul_acl_token_identities")` |
| `checkResultsBucket` | `[]byte("check_results")` |
| `taskLocalStateKey` | `[]byte("local_state")` |
| `taskStateKey` | `[]byte("task_state")` |
| `devManagerBucket` | `[]byte("devicemanager")` |
| `driverManagerBucket` | `[]byte("drivermanager")` |
| `managerPluginStateKey` | `[]byte("plugin_state")` |
| `dynamicPluginBucketName` | `[]byte("dynamicplugins")` |
| `registryStateKey` | `[]byte("registry_state")` |
| `nodeMetaBucket` | `[]byte("nodemeta")` |
| `nodeMetaKey` | `[]byte("meta")` |
| `nodeBucket` | `[]byte("node")` |
| `nodeRegistrationKey` | `[]byte("node_registration")` |
| `hostVolBucket` | `[]byte("host_volumes_to_create")` |
| `nodeIdentityBucket` | `[]byte("node_identity")` |
| `nodeIdentityBucketStateKey` | `[]byte("node_identity_state")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `taskBucketName` | - | `taskName string` | `[]byte` | [L157](file:///d:/claude/nomad/client/state/db_bolt.go#L157) |
| `GetStateDBFactory` | - | `devMode bool` | `NewStateDBFunc` | [L165](file:///d:/claude/nomad/client/state/db_bolt.go#L165) |
| `NewBoltStateDB` | - | `logger hclog.Logger, stateDir string` | `StateDB, error` | [L186](file:///d:/claude/nomad/client/state/db_bolt.go#L186) |
| `Name` | `s *BoltStateDB` | - | `string` | [L223](file:///d:/claude/nomad/client/state/db_bolt.go#L223) |
| `GetAllAllocations` | `s *BoltStateDB` | - | `[]*structs.Allocation, map[string]error, error` | [L232](file:///d:/claude/nomad/client/state/db_bolt.go#L232) |
| `getAllAllocations` | `s *BoltStateDB` | `tx *boltdd.Tx` | `[]*structs.Allocation, map[string]error` | [L254](file:///d:/claude/nomad/client/state/db_bolt.go#L254) |
| `PutAllocation` | `s *BoltStateDB` | `alloc *structs.Allocation, opts ...WriteOption` | `error` | [L293](file:///d:/claude/nomad/client/state/db_bolt.go#L293) |
| `PutDeploymentStatus` | `s *BoltStateDB` | `allocID string, ds *structs.AllocDeploymentStatus` | `error` | [L322](file:///d:/claude/nomad/client/state/db_bolt.go#L322) |
| `putDeploymentStatusImpl` | - | `tx *boltdd.Tx, allocID string, ds *structs.AllocDeploymentStatus` | `error` | [L328](file:///d:/claude/nomad/client/state/db_bolt.go#L328) |
| `GetDeploymentStatus` | `s *BoltStateDB` | `allocID string` | `*structs.AllocDeploymentStatus, error` | [L342](file:///d:/claude/nomad/client/state/db_bolt.go#L342) |
| `PutNetworkStatus` | `s *BoltStateDB` | `allocID string, ds *structs.AllocNetworkStatus, opts ...WriteOption` | `error` | [L380](file:///d:/claude/nomad/client/state/db_bolt.go#L380) |
| `putNetworkStatusImpl` | - | `tx *boltdd.Tx, allocID string, ds *structs.AllocNetworkStatus` | `error` | [L386](file:///d:/claude/nomad/client/state/db_bolt.go#L386) |
| `GetNetworkStatus` | `s *BoltStateDB` | `allocID string` | `*structs.AllocNetworkStatus, error` | [L400](file:///d:/claude/nomad/client/state/db_bolt.go#L400) |
| `PutAcknowledgedState` | `s *BoltStateDB` | `allocID string, state *arstate.State, opts ...WriteOption` | `error` | [L433](file:///d:/claude/nomad/client/state/db_bolt.go#L433) |
| `GetAcknowledgedState` | `s *BoltStateDB` | `allocID string` | `*arstate.State, error` | [L448](file:///d:/claude/nomad/client/state/db_bolt.go#L448) |
| `PutAllocVolumes` | `s *BoltStateDB` | `allocID string, state *arstate.AllocVolumes, opts ...WriteOption` | `error` | [L485](file:///d:/claude/nomad/client/state/db_bolt.go#L485) |
| `GetAllocVolumes` | `s *BoltStateDB` | `allocID string` | `*arstate.AllocVolumes, error` | [L501](file:///d:/claude/nomad/client/state/db_bolt.go#L501) |
| `PutAllocIdentities` | `s *BoltStateDB` | `allocID string, identities []*structs.SignedWorkloadIdentity, opts ...WriteO...` | `error` | [L540](file:///d:/claude/nomad/client/state/db_bolt.go#L540) |
| `GetAllocIdentities` | `s *BoltStateDB` | `allocID string` | `[]*structs.SignedWorkloadIdentity, error` | [L557](file:///d:/claude/nomad/client/state/db_bolt.go#L557) |
| `PutAllocConsulACLTokens` | `s *BoltStateDB` | `allocID string, tokens []*cstructs.ConsulACLToken, opts ...WriteOption` | `error` | [L591](file:///d:/claude/nomad/client/state/db_bolt.go#L591) |
| `GetAllocConsulACLTokens` | `s *BoltStateDB` | `allocID string` | `[]*cstructs.ConsulACLToken, error` | [L606](file:///d:/claude/nomad/client/state/db_bolt.go#L606) |
| `GetTaskRunnerState` | `s *BoltStateDB` | `allocID string, taskName string` | `*trstate.LocalState, *structs.TaskState, error` | [L637](file:///d:/claude/nomad/client/state/db_bolt.go#L637) |
| `PutTaskRunnerLocalState` | `s *BoltStateDB` | `allocID string, taskName string, val *trstate.LocalState` | `error` | [L693](file:///d:/claude/nomad/client/state/db_bolt.go#L693) |
| `putTaskRunnerLocalStateImpl` | - | `tx *boltdd.Tx, allocID string, taskName string, val *trstate.LocalState` | `error` | [L701](file:///d:/claude/nomad/client/state/db_bolt.go#L701) |
| `PutTaskState` | `s *BoltStateDB` | `allocID string, taskName string, state *structs.TaskState` | `error` | [L715](file:///d:/claude/nomad/client/state/db_bolt.go#L715) |
| `putTaskStateImpl` | - | `tx *boltdd.Tx, allocID string, taskName string, state *structs.TaskState` | `error` | [L723](file:///d:/claude/nomad/client/state/db_bolt.go#L723) |
| `DeleteTaskBucket` | `s *BoltStateDB` | `allocID string, taskName string` | `error` | [L733](file:///d:/claude/nomad/client/state/db_bolt.go#L733) |
| `DeleteAllocationBucket` | `s *BoltStateDB` | `allocID string, opts ...WriteOption` | `error` | [L754](file:///d:/claude/nomad/client/state/db_bolt.go#L754) |
| `Close` | `s *BoltStateDB` | - | `error` | [L769](file:///d:/claude/nomad/client/state/db_bolt.go#L769) |
| `getAllocationBucket` | - | `tx *boltdd.Tx, allocID string` | `*boltdd.Bucket, error` | [L777](file:///d:/claude/nomad/client/state/db_bolt.go#L777) |
| `getTaskBucket` | - | `tx *boltdd.Tx, allocID string, taskName string` | `*boltdd.Bucket, error` | [L815](file:///d:/claude/nomad/client/state/db_bolt.go#L815) |
| `PutDevicePluginState` | `s *BoltStateDB` | `ps *dmstate.PluginState` | `error` | [L841](file:///d:/claude/nomad/client/state/db_bolt.go#L841) |
| `GetDevicePluginState` | `s *BoltStateDB` | - | `*dmstate.PluginState, error` | [L855](file:///d:/claude/nomad/client/state/db_bolt.go#L855) |
| `PutDriverPluginState` | `s *BoltStateDB` | `ps *driverstate.PluginState` | `error` | [L888](file:///d:/claude/nomad/client/state/db_bolt.go#L888) |
| `GetDriverPluginState` | `s *BoltStateDB` | - | `*driverstate.PluginState, error` | [L902](file:///d:/claude/nomad/client/state/db_bolt.go#L902) |
| `PutDynamicPluginRegistryState` | `s *BoltStateDB` | `ps *dynamicplugins.RegistryState` | `error` | [L935](file:///d:/claude/nomad/client/state/db_bolt.go#L935) |
| `GetDynamicPluginRegistryState` | `s *BoltStateDB` | - | `*dynamicplugins.RegistryState, error` | [L948](file:///d:/claude/nomad/client/state/db_bolt.go#L948) |
| `keyForCheck` | - | `allocID string, checkID structs.CheckID` | `[]byte` | [L979](file:///d:/claude/nomad/client/state/db_bolt.go#L979) |
| `PutCheckResult` | `s *BoltStateDB` | `allocID string, qr *structs.CheckQueryResult` | `error` | [L984](file:///d:/claude/nomad/client/state/db_bolt.go#L984) |
| `GetCheckResults` | `s *BoltStateDB` | - | `checks.ClientResults, error` | [L996](file:///d:/claude/nomad/client/state/db_bolt.go#L996) |
| `DeleteCheckResults` | `s *BoltStateDB` | `allocID string, checkIDs []structs.CheckID` | `error` | [L1017](file:///d:/claude/nomad/client/state/db_bolt.go#L1017) |
| `PurgeCheckResults` | `s *BoltStateDB` | `allocID string` | `error` | [L1034](file:///d:/claude/nomad/client/state/db_bolt.go#L1034) |
| `PutNodeMeta` | `s *BoltStateDB` | `meta map[string]*string` | `error` | [L1048](file:///d:/claude/nomad/client/state/db_bolt.go#L1048) |
| `GetNodeMeta` | `s *BoltStateDB` | - | `m map[string]*string, err error` | [L1061](file:///d:/claude/nomad/client/state/db_bolt.go#L1061) |
| `getNodeMeta` | - | `b *boltdd.Bucket` | `map[string]*string, error` | [L1075](file:///d:/claude/nomad/client/state/db_bolt.go#L1075) |
| `PutNodeRegistration` | `s *BoltStateDB` | `reg *cstructs.NodeRegistration` | `error` | [L1085](file:///d:/claude/nomad/client/state/db_bolt.go#L1085) |
| `GetNodeRegistration` | `s *BoltStateDB` | - | `*cstructs.NodeRegistration, error` | [L1096](file:///d:/claude/nomad/client/state/db_bolt.go#L1096) |
| `PutDynamicHostVolume` | `s *BoltStateDB` | `vol *cstructs.HostVolumeState` | `error` | [L1113](file:///d:/claude/nomad/client/state/db_bolt.go#L1113) |
| `GetDynamicHostVolumes` | `s *BoltStateDB` | - | `[]*cstructs.HostVolumeState, error` | [L1123](file:///d:/claude/nomad/client/state/db_bolt.go#L1123) |
| `DeleteDynamicHostVolume` | `s *BoltStateDB` | `id string` | `error` | [L1146](file:///d:/claude/nomad/client/state/db_bolt.go#L1146) |
| `PutNodeIdentity` | `s *BoltStateDB` | `identity string` | `error` | [L1158](file:///d:/claude/nomad/client/state/db_bolt.go#L1158) |
| `GetNodeIdentity` | `s *BoltStateDB` | - | `string, error` | [L1171](file:///d:/claude/nomad/client/state/db_bolt.go#L1171) |
| `init` | `s *BoltStateDB` | - | `error` | [L1189](file:///d:/claude/nomad/client/state/db_bolt.go#L1189) |
| `updateWithOptions` | `s *BoltStateDB` | `opts []WriteOption, updateFn func(...)` | `error` | [L1202](file:///d:/claude/nomad/client/state/db_bolt.go#L1202) |
| `Upgrade` | `s *BoltStateDB` | - | `error` | [L1216](file:///d:/claude/nomad/client/state/db_bolt.go#L1216) |
| `DB` | `s *BoltStateDB` | - | `*boltdd.DB` | [L1268](file:///d:/claude/nomad/client/state/db_bolt.go#L1268) |

## 5. 核心方法详解

### 架构概述

BoltStateDB 使用 [BoltDB](https://github.com/hashicorp/bolt)（纯 Go 实现的 KV 数据库）持久化 Client 节点状态。数据按 Bucket 组织：

| Bucket | 存储内容 |
|--------|---------|
| `allocs` | 分配对象（JSON 编码的 `structs.Allocation`） |
| `deployments` | 部署状态 |
| `network` | 网络状态 |
| `acknowledged_state` | 已确认的分配状态 |
| `volumes` | CSI 卷状态 |
| `identities` | 工作负载身份 |
| `node_identity` | 节点身份令牌 |
| `plugin` | 插件状态 |

---

### GetStateDBFactory()

**签名**：`func GetStateDBFactory(devMode bool) NewStateDBFunc`

**位置**：[L165](file:///d:/claude/nomad/client/state/db_bolt.go#L165)

**功能**：返回状态数据库工厂函数。DevMode 使用内存数据库（`dbMem`），生产模式使用 BoltDB。

---

### GetAllAllocations()

**签名**：`func (s *BoltStateDB) GetAllAllocations() ([]*structs.Allocation, map[string]error, error)`

**位置**：[L232](file:///d:/claude/nomad/client/state/db_bolt.go#L232)

**功能**：从 `allocs` Bucket 加载所有分配。使用 BoltDB 只读事务批量读取，反序列化为 `structs.Allocation`。返回部分错误（单个分配反序列化失败不影响其他）。

---

### PersistAllocation() / UpsertAllocation()

**功能**：持久化分配状态到 BoltDB。使用读写事务，JSON 编码后写入 `allocs` Bucket。

---

### GetAcknowledgedState / GetDeploymentStatus / GetNetworkStatus / GetAllocVolumes / GetAllocIdentities / GetAllocConsulACLTokens

**功能**：从对应 Bucket 读取状态。使用只读事务，反序列化 JSON 数据。每个方法对应一种状态类型，按 allocID 索引。

---

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `fmt` | 标准库 |
| `go.etcd.io/bbolt` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/state` | 内部包 |
| `github.com/hashicorp/nomad/client/allocrunner/taskrunner/state` | 内部包 |
| `github.com/hashicorp/nomad/client/devicemanager/state` | 内部包 |
| `github.com/hashicorp/nomad/client/dynamicplugins` | 内部包 |
| `github.com/hashicorp/nomad/client/pluginmanager/drivermanager/state` | 内部包 |
| `github.com/hashicorp/nomad/client/serviceregistration/checks` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/helper/boltdd` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|

