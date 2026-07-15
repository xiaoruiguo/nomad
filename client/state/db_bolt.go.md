# db_bolt.go 代码说明文档

> 文件路径：[client/state/db_bolt.go](file:///d:/claude/nomad/client/state/db_bolt.go)
> 总行数：1271 行
> 所属包：`state`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **客户端子包**（`client/`），实现 Nomad 客户端的功能组件。

## 2. 类型定义

### NewStateDBFunc

**定义位置**：[L162](file:///d:/claude/nomad/client/state/db_bolt.go#L162)

**类型定义**：`type NewStateDBFunc func(...)`

### BoltStateDB

**定义位置**：[L178](file:///d:/claude/nomad/client/state/db_bolt.go#L178)

**中文说明**：BoltStateDB 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type BoltStateDB struct {
	stateDir string
	db *boltdd.DB
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `stateDir` | `string` | 字符串 |
| `db` | `*boltdd.DB` | — |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（45 个）：`Name`, `GetAllAllocations`, `getAllAllocations`, `PutAllocation`, `PutDeploymentStatus`, `GetDeploymentStatus`, `PutNetworkStatus`, `GetNetworkStatus`, `PutAcknowledgedState`, `GetAcknowledgedState`, `PutAllocVolumes`, `GetAllocVolumes`, `PutAllocIdentities`, `GetAllocIdentities`, `PutAllocConsulACLTokens`, `GetAllocConsulACLTokens`, `GetTaskRunnerState`, `PutTaskRunnerLocalState`, `PutTaskState`, `DeleteTaskBucket`, `DeleteAllocationBucket`, `Close`, `PutDevicePluginState`, `GetDevicePluginState`, `PutDriverPluginState`, `GetDriverPluginState`, `PutDynamicPluginRegistryState`, `GetDynamicPluginRegistryState`, `PutCheckResult`, `GetCheckResults`, `DeleteCheckResults`, `PurgeCheckResults`, `PutNodeMeta`, `GetNodeMeta`, `PutNodeRegistration`, `GetNodeRegistration`, `PutDynamicHostVolume`, `GetDynamicHostVolumes`, `DeleteDynamicHostVolume`, `PutNodeIdentity`, `GetNodeIdentity`, `init`, `updateWithOptions`, `Upgrade`, `DB`

### allocEntry

**定义位置**：[L250](file:///d:/claude/nomad/client/state/db_bolt.go#L250)

**中文说明**：allocEntry 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type allocEntry struct {
	Alloc *structs.Allocation
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Alloc` | `*structs.Allocation` | — |

### deployStatusEntry

**定义位置**：[L316](file:///d:/claude/nomad/client/state/db_bolt.go#L316)

**中文说明**：deployStatusEntry 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type deployStatusEntry struct {
	DeploymentStatus *structs.AllocDeploymentStatus
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DeploymentStatus` | `*structs.AllocDeploymentStatus` | — |

### networkStatusEntry

**定义位置**：[L374](file:///d:/claude/nomad/client/state/db_bolt.go#L374)

**中文说明**：networkStatusEntry 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type networkStatusEntry struct {
	NetworkStatus *structs.AllocNetworkStatus
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NetworkStatus` | `*structs.AllocNetworkStatus` | — |

### allocVolumeStatesEntry

**定义位置**：[L479](file:///d:/claude/nomad/client/state/db_bolt.go#L479)

**中文说明**：allocVolumeStatesEntry 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type allocVolumeStatesEntry struct {
	State *arstate.AllocVolumes
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `State` | `*arstate.AllocVolumes` | 状态 |

### allocIdentitiesEntry

**定义位置**：[L534](file:///d:/claude/nomad/client/state/db_bolt.go#L534)

**中文说明**：allocIdentitiesEntry 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type allocIdentitiesEntry struct {
	Identities []*structs.SignedWorkloadIdentity
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Identities` | `[]*structs.SignedWorkloadIdentity` | 列表 |

### allocConsulACLTokenEntry

**定义位置**：[L586](file:///d:/claude/nomad/client/state/db_bolt.go#L586)

**中文说明**：allocConsulACLTokenEntry 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type allocConsulACLTokenEntry struct {
	Tokens []*cstructs.ConsulACLToken
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Tokens` | `[]*cstructs.ConsulACLToken` | 列表 |

### clientIdentity

**定义位置**：[L1154](file:///d:/claude/nomad/client/state/db_bolt.go#L1154)

**中文说明**：clientIdentity 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type clientIdentity struct {
	SignedIdentity string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SignedIdentity` | `string` | 字符串 |

### acknowledgedStateEntry

**定义位置**：[L1197](file:///d:/claude/nomad/client/state/db_bolt.go#L1197)

**中文说明**：acknowledgedStateEntry 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type acknowledgedStateEntry struct {
	State *arstate.State
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `State` | `*arstate.State` | 状态 |

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `metaBucketName` | `—` | `[]byte("meta")` | — |
| `metaVersionKey` | `—` | `[]byte("version")` | — |
| `metaVersion` | `—` | `[]byte{...}` | — |
| `metaUpgradedKey` | `—` | `[]byte("upgraded")` | — |
| `allocationsBucketName` | `—` | `[]byte("allocations")` | — |
| `allocKey` | `—` | `[]byte("alloc")` | — |
| `allocDeployStatusKey` | `—` | `[]byte("deploy_status")` | — |
| `allocNetworkStatusKey` | `—` | `[]byte("network_status")` | — |
| `acknowledgedStateKey` | `—` | `[]byte("acknowledged_state")` | — |
| `allocVolumeKey` | `—` | `[]byte("alloc_volume")` | — |
| `allocIdentityKey` | `—` | `[]byte("alloc_identities")` | — |
| `allocConsulACLTokenKey` | `—` | `[]byte("alloc_consul_acl_token_identities")` | — |
| `checkResultsBucket` | `—` | `[]byte("check_results")` | — |
| `taskLocalStateKey` | `—` | `[]byte("local_state")` | — |
| `taskStateKey` | `—` | `[]byte("task_state")` | — |
| `devManagerBucket` | `—` | `[]byte("devicemanager")` | — |
| `driverManagerBucket` | `—` | `[]byte("drivermanager")` | — |
| `managerPluginStateKey` | `—` | `[]byte("plugin_state")` | — |
| `dynamicPluginBucketName` | `—` | `[]byte("dynamicplugins")` | — |
| `registryStateKey` | `—` | `[]byte("registry_state")` | — |
| `nodeMetaBucket` | `—` | `[]byte("nodemeta")` | — |
| `nodeMetaKey` | `—` | `[]byte("meta")` | — |
| `nodeBucket` | `—` | `[]byte("node")` | — |
| `nodeRegistrationKey` | `—` | `[]byte("node_registration")` | — |
| `hostVolBucket` | `—` | `[]byte("host_volumes_to_create")` | — |
| `nodeIdentityBucket` | `—` | `[]byte("node_identity")` | — |
| `nodeIdentityBucketStateKey` | `—` | `[]byte("node_identity_state")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `taskBucketName` | - | `taskName string` | `[]byte` | [L157](file:///d:/claude/nomad/client/state/db_bolt.go#L157) |
| `GetStateDBFactory` | - | `devMode bool` | `NewStateDBFunc` | [L165](file:///d:/claude/nomad/client/state/db_bolt.go#L165) |
| `NewBoltStateDB` | - | `logger hclog.Logger, stateDir string` | `StateDB, error` | [L186](file:///d:/claude/nomad/client/state/db_bolt.go#L186) |
| `Name` | `s *BoltStateDB` | `` | `string` | [L223](file:///d:/claude/nomad/client/state/db_bolt.go#L223) |
| `GetAllAllocations` | `s *BoltStateDB` | `` | `[]*structs.Allocation, map[string]error, error` | [L232](file:///d:/claude/nomad/client/state/db_bolt.go#L232) |
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
| `PutAllocIdentities` | `s *BoltStateDB` | `allocID string, identities []*structs.SignedWorkloadIdentity, opts ...WriteOp...` | `error` | [L540](file:///d:/claude/nomad/client/state/db_bolt.go#L540) |
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
| `Close` | `s *BoltStateDB` | `` | `error` | [L769](file:///d:/claude/nomad/client/state/db_bolt.go#L769) |
| `getAllocationBucket` | - | `tx *boltdd.Tx, allocID string` | `*boltdd.Bucket, error` | [L777](file:///d:/claude/nomad/client/state/db_bolt.go#L777) |
| `getTaskBucket` | - | `tx *boltdd.Tx, allocID string, taskName string` | `*boltdd.Bucket, error` | [L815](file:///d:/claude/nomad/client/state/db_bolt.go#L815) |
| `PutDevicePluginState` | `s *BoltStateDB` | `ps *dmstate.PluginState` | `error` | [L841](file:///d:/claude/nomad/client/state/db_bolt.go#L841) |
| `GetDevicePluginState` | `s *BoltStateDB` | `` | `*dmstate.PluginState, error` | [L855](file:///d:/claude/nomad/client/state/db_bolt.go#L855) |
| `PutDriverPluginState` | `s *BoltStateDB` | `ps *driverstate.PluginState` | `error` | [L888](file:///d:/claude/nomad/client/state/db_bolt.go#L888) |
| `GetDriverPluginState` | `s *BoltStateDB` | `` | `*driverstate.PluginState, error` | [L902](file:///d:/claude/nomad/client/state/db_bolt.go#L902) |
| `PutDynamicPluginRegistryState` | `s *BoltStateDB` | `ps *dynamicplugins.RegistryState` | `error` | [L935](file:///d:/claude/nomad/client/state/db_bolt.go#L935) |
| `GetDynamicPluginRegistryState` | `s *BoltStateDB` | `` | `*dynamicplugins.RegistryState, error` | [L948](file:///d:/claude/nomad/client/state/db_bolt.go#L948) |
| `keyForCheck` | - | `allocID string, checkID structs.CheckID` | `[]byte` | [L979](file:///d:/claude/nomad/client/state/db_bolt.go#L979) |
| `PutCheckResult` | `s *BoltStateDB` | `allocID string, qr *structs.CheckQueryResult` | `error` | [L984](file:///d:/claude/nomad/client/state/db_bolt.go#L984) |
| `GetCheckResults` | `s *BoltStateDB` | `` | `checks.ClientResults, error` | [L996](file:///d:/claude/nomad/client/state/db_bolt.go#L996) |
| `DeleteCheckResults` | `s *BoltStateDB` | `allocID string, checkIDs []structs.CheckID` | `error` | [L1017](file:///d:/claude/nomad/client/state/db_bolt.go#L1017) |
| `PurgeCheckResults` | `s *BoltStateDB` | `allocID string` | `error` | [L1034](file:///d:/claude/nomad/client/state/db_bolt.go#L1034) |
| `PutNodeMeta` | `s *BoltStateDB` | `meta map[string]*string` | `error` | [L1048](file:///d:/claude/nomad/client/state/db_bolt.go#L1048) |
| `GetNodeMeta` | `s *BoltStateDB` | `` | `m map[string]*string, err error` | [L1061](file:///d:/claude/nomad/client/state/db_bolt.go#L1061) |
| `getNodeMeta` | - | `b *boltdd.Bucket` | `map[string]*string, error` | [L1075](file:///d:/claude/nomad/client/state/db_bolt.go#L1075) |
| `PutNodeRegistration` | `s *BoltStateDB` | `reg *cstructs.NodeRegistration` | `error` | [L1085](file:///d:/claude/nomad/client/state/db_bolt.go#L1085) |
| `GetNodeRegistration` | `s *BoltStateDB` | `` | `*cstructs.NodeRegistration, error` | [L1096](file:///d:/claude/nomad/client/state/db_bolt.go#L1096) |
| `PutDynamicHostVolume` | `s *BoltStateDB` | `vol *cstructs.HostVolumeState` | `error` | [L1113](file:///d:/claude/nomad/client/state/db_bolt.go#L1113) |
| `GetDynamicHostVolumes` | `s *BoltStateDB` | `` | `[]*cstructs.HostVolumeState, error` | [L1123](file:///d:/claude/nomad/client/state/db_bolt.go#L1123) |
| `DeleteDynamicHostVolume` | `s *BoltStateDB` | `id string` | `error` | [L1146](file:///d:/claude/nomad/client/state/db_bolt.go#L1146) |
| `PutNodeIdentity` | `s *BoltStateDB` | `identity string` | `error` | [L1158](file:///d:/claude/nomad/client/state/db_bolt.go#L1158) |
| `GetNodeIdentity` | `s *BoltStateDB` | `` | `string, error` | [L1171](file:///d:/claude/nomad/client/state/db_bolt.go#L1171) |
| `init` | `s *BoltStateDB` | `` | `error` | [L1189](file:///d:/claude/nomad/client/state/db_bolt.go#L1189) |
| `updateWithOptions` | `s *BoltStateDB` | `opts []WriteOption, updateFn func(...)` | `error` | [L1202](file:///d:/claude/nomad/client/state/db_bolt.go#L1202) |
| `Upgrade` | `s *BoltStateDB` | `` | `error` | [L1216](file:///d:/claude/nomad/client/state/db_bolt.go#L1216) |
| `DB` | `s *BoltStateDB` | `` | `*boltdd.DB` | [L1268](file:///d:/claude/nomad/client/state/db_bolt.go#L1268) |

## 5. 核心方法详解

### NewBoltStateDB()

**签名**：`func NewBoltStateDB(logger hclog.Logger, stateDir string) StateDB, error`

**位置**：[L186](file:///d:/claude/nomad/client/state/db_bolt.go#L186)

**中文说明**：创建并返回一个新的 BoltStateDB 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `stateDir` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `StateDB` | — |
| `error` | 错误信息 |

### Close()

**签名**：`func (s *BoltStateDB) Close() error`

**位置**：[L769](file:///d:/claude/nomad/client/state/db_bolt.go#L769)

**中文说明**：关闭对象。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

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
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [08types.go](file:///d:/claude/nomad/client/state/08types.go) | 同目录源文件 |
| [12types.go](file:///d:/claude/nomad/client/state/12types.go) | 同目录源文件 |
| [db_error.go](file:///d:/claude/nomad/client/state/db_error.go) | 同目录源文件 |
| [db_mem.go](file:///d:/claude/nomad/client/state/db_mem.go) | 同目录源文件 |
| [db_noop.go](file:///d:/claude/nomad/client/state/db_noop.go) | 同目录源文件 |

