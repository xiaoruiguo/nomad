# state_store.go 代码说明文档

> 文件路径：[state/state_store.go](file:///d:/claude/nomad/nomad/state/state_store.go)
> 总行数：7495 行
> 所属包：`state`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **状态存储子包**（`nomad/state`），实现 Nomad Server 的状态存储（基于 MemDB），管理所有集群状态的内存索引和快照恢复。是 Raft FSM 的数据后端。

## 2. 类型定义

### Txn

**定义位置**：[L30](file:///d:/claude/nomad/nomad/state/state_store.go#L30)

**类型定义**：`*txn`

### NodeUpsertOption

**定义位置**：[L33](file:///d:/claude/nomad/nomad/state/state_store.go#L33)

**类型定义**：`uint8`

### IndexEntry

**定义位置**：[L72](file:///d:/claude/nomad/nomad/state/state_store.go#L72)

**类型**：struct

```go
	Key string
	Value uint64
```

### StateStoreConfig

**定义位置**：[L78](file:///d:/claude/nomad/nomad/state/state_store.go#L78)

**类型**：struct

```go
	Logger hclog.Logger
	Region string
	EnablePublisher bool
	EventBufferSize int64
	JobTrackedVersions int
```

**关联方法**（1 个）：`Validate`

### StateStore

**定义位置**：[L109](file:///d:/claude/nomad/nomad/state/state_store.go#L109)

**类型**：struct

```go
	logger hclog.Logger
	db *changeTrackerDB
	config *StateStoreConfig
	abandonCh chan struct{...}
	stopEventBroker func(...)
```

**关联方法**（227 个）：`NewWatchSet`, `EventBroker`, `namespaceInit`, `Config`, `Snapshot`, `SnapshotMinIndex`, `Restore`, `AbandonCh`, `Abandon`, `StopEventBroker`, `BlockingQuery`, `UpsertPlanResults`, `upsertDeploymentUpdates`, `UpsertJobSummary`, `DeleteJobSummary`, `UpsertDeployment`, `upsertDeploymentImpl`, `Deployments`, `DeploymentsByNamespace`, `DeploymentsByNamespaceOrdered`, `DeploymentsByIDPrefix`, `DeploymentByID`, `deploymentByIDImpl`, `DeploymentsByJobID`, `LatestDeploymentByJobID`, `DeleteDeployment`, `DeleteDeploymentTxn`, `deleteAllocsForJobTxn`, `UpsertScalingEvent`, `ScalingEvents`, `ScalingEventsByJob`, `UpsertNode`, `DeleteNode`, `deleteNodeTxn`, `UpdateNodeStatus`, `updateNodeStatusTxn`, `BatchUpdateNodeDrain`, `UpdateNodeDrain`, `updateNodeDrainImpl`, `UpdateNodeEligibility`, `updateNodeEligibilityImpl`, `UpsertNodeEvents`, `upsertNodeEvents`, `deleteJobFromPlugins`, `NodeByID`, `NodePoolByNodeID`, `NodesByIDPrefix`, `NodeBySecretID`, `NodesByNodePool`, `Nodes`, `UpsertJob`, `UpsertJobTxn`, `UpsertJobWithRequest`, `upsertJobImpl`, `CheckIdempotencyToken`, `DeleteJob`, `DeleteJobTxn`, `deleteJobScalingPolicies`, `deleteJobSubmission`, `deleteJobVersions`, `upsertJobVersion`, `GetJobSubmissions`, `JobSubmission`, `jobSubmission`, `JobByID`, `JobByIDTxn`, `JobsByIDPrefix`, `jobsByIDPrefixAllNamespaces`, `JobVersionsByID`, `JobVersionByTagName`, `jobVersionByID`, `JobByIDAndVersion`, `jobByIDAndVersionImpl`, `JobVersions`, `Jobs`, `JobsByNamespace`, `jobsByNamespaceImpl`, `JobsByPeriodic`, `JobsByScheduler`, `JobsByGC`, `JobsByPool`, `JobsByModifyIndex`, `JobSummaryByID`, `JobSummaries`, `JobSummaryByPrefix`, `UpsertCSIVolume`, `CSIVolumes`, `CSIVolumeByID`, `CSIVolumesByPluginID`, `CSIVolumesByIDPrefix`, `csiVolumeByIDPrefixAllNamespaces`, `CSIVolumesByNodeID`, `CSIVolumesByNamespace`, `csiVolumesByNamespaceImpl`, `CSIVolumeClaim`, `CSIVolumeDeregister`, `volSafeToForce`, `CSIVolumeDenormalizePlugins`, `csiVolumeDenormalizePluginsTxn`, `CSIVolumeDenormalize`, `csiVolumeDenormalizeTxn`, `CSIPlugins`, `CSIPluginsByIDPrefix`, `CSIPluginByID`, `CSIPluginByIDTxn`, `CSIPluginDenormalize`, `CSIPluginDenormalizeTxn`, `UpsertCSIPlugin`, `DeleteCSIPlugin`, `UpsertPeriodicLaunch`, `DeletePeriodicLaunch`, `DeletePeriodicLaunchTxn`, `PeriodicLaunchByID`, `PeriodicLaunches`, `UpsertEvals`, `UpsertEvalsTxn`, `nestedUpsertEval`, `updateEvalModifyIndex`, `DeleteEvalsByFilter`, `EvalIsUserDeleteSafe`, `DeleteEval`, `EvalByID`, `EvalsRelatedToID`, `EvalsByIDPrefix`, `EvalsByJob`, `Evals`, `EvalsByNamespace`, `EvalsByNamespaceOrdered`, `UpdateAllocsFromClient`, `nestedUpdateAllocFromClient`, `cancelFollowupEvalsForReconnect`, `updateClientAllocUpdateIndex`, `UpsertAllocs`, `upsertAllocsImpl`, `UpdateAllocsDesiredTransitions`, `UpdateAllocDesiredTransitionTxn`, `AllocByID`, `allocByIDImpl`, `AllocsByIDPrefix`, `AllocsByIDPrefixAllNSs`, `AllocsByNode`, `AllocsByNodeTerminal`, `AllocsByJob`, `AllocsByEval`, `AllocsByDeployment`, `Allocs`, `AllocsByNamespaceOrdered`, `AllocsByNamespace`, `allocsByNamespaceImpl`, `UpdateDeploymentStatus`, `updateDeploymentStatusImpl`, `UpdateJobStability`, `updateJobStabilityImpl`, `UpdateJobVersionTag`, `updateJobVersionTagImpl`, `unsetJobVersionTagImpl`, `UpdateDeploymentPromotion`, `UpdateDeploymentAllocHealth`, `LatestIndex`, `Index`, `Indexes`, `ReconcileJobSummaries`, `setJobStatuses`, `setJobStatus`, `setJobSummary`, `getJobStatus`, `updateSummaryWithJob`, `updatePreservedValues`, `updateJobScalingPolicies`, `updateJobSubmission`, `pruneJobSubmissions`, `updateJobCSIPlugins`, `updateDeploymentWithAlloc`, `updateSummaryWithAlloc`, `updatePluginForTerminalAlloc`, `updatePluginWithJobSummary`, `UpsertACLPolicies`, `DeleteACLPolicies`, `ACLPolicyByName`, `ACLPolicyByNamePrefix`, `ACLPolicyByJob`, `ACLPolicyByNamespace`, `ACLPolicies`, `UpsertACLTokens`, `DeleteACLTokens`, `ACLTokenByAccessorID`, `ACLTokenBySecretID`, `ACLTokenByAccessorIDPrefix`, `ACLTokens`, `ACLTokensByGlobal`, `CanBootstrapACLToken`, `BootstrapACLTokens`, `UpsertOneTimeToken`, `DeleteOneTimeTokens`, `ExpireOneTimeTokens`, `oneTimeTokensExpiredTxn`, `OneTimeTokenBySecret`, `SchedulerConfig`, `schedulerConfigTxn`, `SchedulerSetConfig`, `ClusterMetadata`, `ClusterSetMetadata`, `WithWriteTransaction`, `SchedulerCASConfig`, `schedulerSetConfigTxn`, `setClusterMetadata`, `UpsertScalingPolicies`, `UpsertScalingPoliciesTxn`, `NamespaceByName`, `namespaceByNameImpl`, `namespaceExists`, `NamespacesByNamePrefix`, `Namespaces`, `NamespaceNames`, `UpsertNamespaces`, `upsertNamespaceImpl`, `DeleteNamespaces`, `DeleteScalingPolicies`, `DeleteScalingPoliciesTxn`, `ScalingPolicies`, `ScalingPoliciesByTypePrefix`, `ScalingPoliciesByNamespace`, `ScalingPoliciesByJob`, `ScalingPoliciesByJobTxn`, `ScalingPolicyByID`, `ScalingPolicyByTargetAndType`, `ScalingPoliciesByIDPrefix`

### QueryFn

**定义位置**：[L317](file:///d:/claude/nomad/nomad/state/state_store.go#L317)

**类型定义**：`func(...)`

### StateSnapshot

**定义位置**：[L7408](file:///d:/claude/nomad/nomad/state/state_store.go#L7408)

**类型**：struct

```go
	StateStore
```

**关联方法**（3 个）：`DenormalizeAllocationsMap`, `DenormalizeAllocationSlice`, `DenormalizeAllocationDiffSlice`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `NodeUpsertWithNodePool` | `iota` |
| `NodeEligibilityEventPlanRejectThreshold` | `"Node marked as ineligible for scheduling due to multiple...` |
| `NodeRegisterEventRegistered` | `"Node registered"` |
| `NodeRegisterEventReregistered` | `"Node re-registered"` |
| `siTokenAccessorTable` | `"si_token_accessors"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `terminate` | - | `s string` | `string` | [L66](file:///d:/claude/nomad/nomad/state/state_store.go#L66) |
| `Validate` | `c *StateStoreConfig` | - | `error` | [L95](file:///d:/claude/nomad/nomad/state/state_store.go#L95) |
| `NewStateStore` | - | `config *StateStoreConfig` | `*StateStore, error` | [L126](file:///d:/claude/nomad/nomad/state/state_store.go#L126) |
| `NewWatchSet` | `s *StateStore` | - | `memdb.WatchSet` | [L175](file:///d:/claude/nomad/nomad/state/state_store.go#L175) |
| `EventBroker` | `s *StateStore` | - | `*stream.EventBroker, error` | [L181](file:///d:/claude/nomad/nomad/state/state_store.go#L181) |
| `namespaceInit` | `s *StateStore` | - | `error` | [L189](file:///d:/claude/nomad/nomad/state/state_store.go#L189) |
| `Config` | `s *StateStore` | - | `*StateStoreConfig` | [L208](file:///d:/claude/nomad/nomad/state/state_store.go#L208) |
| `Snapshot` | `s *StateStore` | - | `*StateSnapshot, error` | [L215](file:///d:/claude/nomad/nomad/state/state_store.go#L215) |
| `SnapshotMinIndex` | `s *StateStore` | `ctx context.Context, index uint64` | `*StateSnapshot, error` | [L242](file:///d:/claude/nomad/nomad/state/state_store.go#L242) |
| `Restore` | `s *StateStore` | - | `*StateRestore, error` | [L288](file:///d:/claude/nomad/nomad/state/state_store.go#L288) |
| `AbandonCh` | `s *StateStore` | - | `chan struct{...}` | [L298](file:///d:/claude/nomad/nomad/state/state_store.go#L298) |
| `Abandon` | `s *StateStore` | - | - | [L304](file:///d:/claude/nomad/nomad/state/state_store.go#L304) |
| `StopEventBroker` | `s *StateStore` | - | - | [L311](file:///d:/claude/nomad/nomad/state/state_store.go#L311) |
| `BlockingQuery` | `s *StateStore` | `query QueryFn, minIndex uint64, ctx context.Context` | `resp interface{}, index uint64, err error` | [L321](file:///d:/claude/nomad/nomad/state/state_store.go#L321) |
| `UpsertPlanResults` | `s *StateStore` | `msgType structs.MessageType, index uint64, results *structs.ApplyPlanResults...` | `error` | [L360](file:///d:/claude/nomad/nomad/state/state_store.go#L360) |
| `addComputedAllocAttrs` | - | `allocs []*structs.Allocation, job *structs.Job` | - | [L466](file:///d:/claude/nomad/nomad/state/state_store.go#L466) |
| `upsertDeploymentUpdates` | `s *StateStore` | `index uint64, now int64, updates []*structs.DeploymentStatusUpdate, txn *txn` | `error` | [L508](file:///d:/claude/nomad/nomad/state/state_store.go#L508) |
| `UpsertJobSummary` | `s *StateStore` | `index uint64, jobSummary *structs.JobSummary` | `error` | [L519](file:///d:/claude/nomad/nomad/state/state_store.go#L519) |
| `DeleteJobSummary` | `s *StateStore` | `index uint64, namespace string, id string` | `error` | [L553](file:///d:/claude/nomad/nomad/state/state_store.go#L553) |
| `UpsertDeployment` | `s *StateStore` | `index uint64, deployment *structs.Deployment` | `error` | [L568](file:///d:/claude/nomad/nomad/state/state_store.go#L568) |
| `upsertDeploymentImpl` | `s *StateStore` | `index uint64, deployment *structs.Deployment, txn *txn` | `error` | [L577](file:///d:/claude/nomad/nomad/state/state_store.go#L577) |
| `Deployments` | `s *StateStore` | `ws memdb.WatchSet, sort SortOption` | `memdb.ResultIterator, error` | [L619](file:///d:/claude/nomad/nomad/state/state_store.go#L619) |
| `DeploymentsByNamespace` | `s *StateStore` | `ws memdb.WatchSet, namespace string` | `memdb.ResultIterator, error` | [L641](file:///d:/claude/nomad/nomad/state/state_store.go#L641) |
| `DeploymentsByNamespaceOrdered` | `s *StateStore` | `ws memdb.WatchSet, namespace string, sort SortOption` | `memdb.ResultIterator, error` | [L654](file:///d:/claude/nomad/nomad/state/state_store.go#L654) |
| `DeploymentsByIDPrefix` | `s *StateStore` | `ws memdb.WatchSet, namespace string, deploymentID string, sort SortOption` | `memdb.ResultIterator, error` | [L679](file:///d:/claude/nomad/nomad/state/state_store.go#L679) |
| `deploymentNamespaceFilter` | - | `namespace string` | `func(...)` | [L705](file:///d:/claude/nomad/nomad/state/state_store.go#L705) |
| `DeploymentByID` | `s *StateStore` | `ws memdb.WatchSet, deploymentID string` | `*structs.Deployment, error` | [L717](file:///d:/claude/nomad/nomad/state/state_store.go#L717) |
| `deploymentByIDImpl` | `s *StateStore` | `ws memdb.WatchSet, deploymentID string, txn *txn` | `*structs.Deployment, error` | [L722](file:///d:/claude/nomad/nomad/state/state_store.go#L722) |
| `DeploymentsByJobID` | `s *StateStore` | `ws memdb.WatchSet, namespace string, jobID string, all bool` | `[]*structs.Deployment, error` | [L736](file:///d:/claude/nomad/nomad/state/state_store.go#L736) |
| `LatestDeploymentByJobID` | `s *StateStore` | `ws memdb.WatchSet, namespace string, jobID string` | `*structs.Deployment, error` | [L779](file:///d:/claude/nomad/nomad/state/state_store.go#L779) |
| `DeleteDeployment` | `s *StateStore` | `index uint64, deploymentIDs []string` | `error` | [L807](file:///d:/claude/nomad/nomad/state/state_store.go#L807) |
| `DeleteDeploymentTxn` | `s *StateStore` | `index uint64, deploymentIDs []string, txn Txn` | `error` | [L822](file:///d:/claude/nomad/nomad/state/state_store.go#L822) |
| `deleteAllocsForJobTxn` | `s *StateStore` | `txn Txn, index uint64, namespace string, jobID string` | `error` | [L854](file:///d:/claude/nomad/nomad/state/state_store.go#L854) |
| `UpsertScalingEvent` | `s *StateStore` | `index uint64, req *structs.ScalingEventRequest` | `error` | [L880](file:///d:/claude/nomad/nomad/state/state_store.go#L880) |
| `ScalingEvents` | `s *StateStore` | `ws memdb.WatchSet` | `memdb.ResultIterator, error` | [L930](file:///d:/claude/nomad/nomad/state/state_store.go#L930) |
| `ScalingEventsByJob` | `s *StateStore` | `ws memdb.WatchSet, namespace string, jobID string` | `map[string][]*structs.ScalingEvent, uint64, error` | [L944](file:///d:/claude/nomad/nomad/state/state_store.go#L944) |
| `UpsertNode` | `s *StateStore` | `msgType structs.MessageType, index uint64, node *structs.Node, opts ...NodeU...` | `error` | [L963](file:///d:/claude/nomad/nomad/state/state_store.go#L963) |
| `upsertNodeTxn` | - | `txn *txn, index uint64, node *structs.Node` | `error` | [L984](file:///d:/claude/nomad/nomad/state/state_store.go#L984) |
| `DeleteNode` | `s *StateStore` | `msgType structs.MessageType, index uint64, nodes []string` | `error` | [L1055](file:///d:/claude/nomad/nomad/state/state_store.go#L1055) |
| `deleteNodeTxn` | `s *StateStore` | `txn *txn, index uint64, nodes []string` | `error` | [L1066](file:///d:/claude/nomad/nomad/state/state_store.go#L1066) |
| `UpdateNodeStatus` | `s *StateStore` | `msgType structs.MessageType, index uint64, req *structs.NodeUpdateStatusRequ...` | `error` | [L1104](file:///d:/claude/nomad/nomad/state/state_store.go#L1104) |
| `updateNodeStatusTxn` | `s *StateStore` | `txn *txn, req *structs.NodeUpdateStatusRequest` | `error` | [L1120](file:///d:/claude/nomad/nomad/state/state_store.go#L1120) |
| `BatchUpdateNodeDrain` | `s *StateStore` | `msgType structs.MessageType, index uint64, updatedAt int64, updates map[stri...` | `error` | [L1175](file:///d:/claude/nomad/nomad/state/state_store.go#L1175) |
| `UpdateNodeDrain` | `s *StateStore` | `msgType structs.MessageType, index uint64, nodeID string, drain *structs.Dra...` | `error` | [L1189](file:///d:/claude/nomad/nomad/state/state_store.go#L1189) |
| `updateNodeDrainImpl` | `s *StateStore` | `txn *txn, index uint64, nodeID string, drain *structs.DrainStrategy, markEli...` | `error` | [L1203](file:///d:/claude/nomad/nomad/state/state_store.go#L1203) |
| `UpdateNodeEligibility` | `s *StateStore` | `msgType structs.MessageType, index uint64, nodeID string, eligibility string...` | `error` | [L1296](file:///d:/claude/nomad/nomad/state/state_store.go#L1296) |
| `updateNodeEligibilityImpl` | `s *StateStore` | `index uint64, nodeID string, eligibility string, updatedAt int64, event *str...` | `error` | [L1305](file:///d:/claude/nomad/nomad/state/state_store.go#L1305) |
| `UpsertNodeEvents` | `s *StateStore` | `msgType structs.MessageType, index uint64, nodeEvents map[string][]*structs....` | `error` | [L1347](file:///d:/claude/nomad/nomad/state/state_store.go#L1347) |
| `upsertNodeEvents` | `s *StateStore` | `index uint64, nodeID string, events []*structs.NodeEvent, txn *txn` | `error` | [L1363](file:///d:/claude/nomad/nomad/state/state_store.go#L1363) |
| `appendNodeEvents` | - | `index uint64, node *structs.Node, events []*structs.NodeEvent` | - | [L1391](file:///d:/claude/nomad/nomad/state/state_store.go#L1391) |
| `upsertCSIPluginsForNode` | - | `txn *txn, node *structs.Node, index uint64` | `error` | [L1407](file:///d:/claude/nomad/nomad/state/state_store.go#L1407) |
| `deleteNodeCSIPlugins` | - | `txn *txn, node *structs.Node, index uint64` | `error` | [L1523](file:///d:/claude/nomad/nomad/state/state_store.go#L1523) |
| `updateOrGCPlugin` | - | `index uint64, txn Txn, plug *structs.CSIPlugin` | `error` | [L1566](file:///d:/claude/nomad/nomad/state/state_store.go#L1566) |
| `deleteJobFromPlugins` | `s *StateStore` | `index uint64, txn Txn, job *structs.Job` | `error` | [L1584](file:///d:/claude/nomad/nomad/state/state_store.go#L1584) |
| `NodeByID` | `s *StateStore` | `ws memdb.WatchSet, nodeID string` | `*structs.Node, error` | [L1682](file:///d:/claude/nomad/nomad/state/state_store.go#L1682) |
| `NodePoolByNodeID` | `s *StateStore` | `ws memdb.WatchSet, nodeID string` | `string, bool, error` | [L1698](file:///d:/claude/nomad/nomad/state/state_store.go#L1698) |
| `NodesByIDPrefix` | `s *StateStore` | `ws memdb.WatchSet, nodeID string` | `memdb.ResultIterator, error` | [L1715](file:///d:/claude/nomad/nomad/state/state_store.go#L1715) |
| `NodeBySecretID` | `s *StateStore` | `ws memdb.WatchSet, secretID string` | `*structs.Node, error` | [L1728](file:///d:/claude/nomad/nomad/state/state_store.go#L1728) |
| `NodesByNodePool` | `s *StateStore` | `ws memdb.WatchSet, pool string` | `memdb.ResultIterator, error` | [L1745](file:///d:/claude/nomad/nomad/state/state_store.go#L1745) |
| `Nodes` | `s *StateStore` | `ws memdb.WatchSet` | `memdb.ResultIterator, error` | [L1758](file:///d:/claude/nomad/nomad/state/state_store.go#L1758) |
| `UpsertJob` | `s *StateStore` | `msgType structs.MessageType, index uint64, sub *structs.JobSubmission, job *...` | `error` | [L1771](file:///d:/claude/nomad/nomad/state/state_store.go#L1771) |
| `UpsertJobTxn` | `s *StateStore` | `index uint64, sub *structs.JobSubmission, job *structs.Job, txn Txn` | `error` | [L1782](file:///d:/claude/nomad/nomad/state/state_store.go#L1782) |
| `UpsertJobWithRequest` | `s *StateStore` | `msgType structs.MessageType, index uint64, req *structs.JobRegisterRequest` | `error` | [L1789](file:///d:/claude/nomad/nomad/state/state_store.go#L1789) |
| `upsertJobImpl` | `s *StateStore` | `index uint64, sub *structs.JobSubmission, job *structs.Job, keepVersion bool...` | `error` | [L1799](file:///d:/claude/nomad/nomad/state/state_store.go#L1799) |
| `CheckIdempotencyToken` | `s *StateStore` | `ns string, parentID string, idempotencyToken string` | `*structs.Job, error` | [L1922](file:///d:/claude/nomad/nomad/state/state_store.go#L1922) |
| `DeleteJob` | `s *StateStore` | `index uint64, namespace string, jobID string` | `error` | [L1946](file:///d:/claude/nomad/nomad/state/state_store.go#L1946) |
| `DeleteJobTxn` | `s *StateStore` | `index uint64, namespace string, jobID string, txn Txn` | `error` | [L1959](file:///d:/claude/nomad/nomad/state/state_store.go#L1959) |
| `deleteJobScalingPolicies` | `s *StateStore` | `index uint64, job *structs.Job, txn *txn` | `error` | [L2127](file:///d:/claude/nomad/nomad/state/state_store.go#L2127) |
| `deleteJobSubmission` | `s *StateStore` | `job *structs.Job, txn *txn` | `error` | [L2159](file:///d:/claude/nomad/nomad/state/state_store.go#L2159) |
| `deleteJobVersions` | `s *StateStore` | `index uint64, job *structs.Job, txn *txn` | `error` | [L2193](file:///d:/claude/nomad/nomad/state/state_store.go#L2193) |
| `upsertJobVersion` | `s *StateStore` | `index uint64, job *structs.Job, txn *txn` | `error` | [L2233](file:///d:/claude/nomad/nomad/state/state_store.go#L2233) |
| `GetJobSubmissions` | `s *StateStore` | `ws memdb.WatchSet` | `memdb.ResultIterator, error` | [L2289](file:///d:/claude/nomad/nomad/state/state_store.go#L2289) |
| `JobSubmission` | `s *StateStore` | `ws memdb.WatchSet, namespace string, jobName string, version uint64` | `*structs.JobSubmission, error` | [L2306](file:///d:/claude/nomad/nomad/state/state_store.go#L2306) |
| `jobSubmission` | `s *StateStore` | `ws memdb.WatchSet, namespace string, jobName string, version uint64, txn Txn` | `*structs.JobSubmission, error` | [L2311](file:///d:/claude/nomad/nomad/state/state_store.go#L2311) |
| `JobByID` | `s *StateStore` | `ws memdb.WatchSet, namespace string, id string` | `*structs.Job, error` | [L2325](file:///d:/claude/nomad/nomad/state/state_store.go#L2325) |
| `JobByIDTxn` | `s *StateStore` | `ws memdb.WatchSet, namespace string, id string, txn Txn` | `*structs.Job, error` | [L2332](file:///d:/claude/nomad/nomad/state/state_store.go#L2332) |
| `JobsByIDPrefix` | `s *StateStore` | `ws memdb.WatchSet, namespace string, id string, sort SortOption` | `memdb.ResultIterator, error` | [L2347](file:///d:/claude/nomad/nomad/state/state_store.go#L2347) |
| `jobsByIDPrefixAllNamespaces` | `s *StateStore` | `ws memdb.WatchSet, prefix string` | `memdb.ResultIterator, error` | [L2364](file:///d:/claude/nomad/nomad/state/state_store.go#L2364) |
| `JobVersionsByID` | `s *StateStore` | `ws memdb.WatchSet, namespace string, id string` | `[]*structs.Job, error` | [L2389](file:///d:/claude/nomad/nomad/state/state_store.go#L2389) |
| `JobVersionByTagName` | `s *StateStore` | `ws memdb.WatchSet, namespace string, id string, tagName string` | `*structs.Job, error` | [L2396](file:///d:/claude/nomad/nomad/state/state_store.go#L2396) |
| `jobVersionByID` | `s *StateStore` | `txn *txn, ws memdb.WatchSet, namespace string, id string, includeTagged bool` | `[]*structs.Job, error` | [L2413](file:///d:/claude/nomad/nomad/state/state_store.go#L2413) |
| `JobByIDAndVersion` | `s *StateStore` | `ws memdb.WatchSet, namespace string, id string, version uint64` | `*structs.Job, error` | [L2452](file:///d:/claude/nomad/nomad/state/state_store.go#L2452) |
| `jobByIDAndVersionImpl` | `s *StateStore` | `ws memdb.WatchSet, namespace string, id string, version uint64, txn *txn` | `*structs.Job, error` | [L2459](file:///d:/claude/nomad/nomad/state/state_store.go#L2459) |
| `JobVersions` | `s *StateStore` | `ws memdb.WatchSet` | `memdb.ResultIterator, error` | [L2477](file:///d:/claude/nomad/nomad/state/state_store.go#L2477) |
| `Jobs` | `s *StateStore` | `ws memdb.WatchSet, sort SortOption` | `memdb.ResultIterator, error` | [L2491](file:///d:/claude/nomad/nomad/state/state_store.go#L2491) |
| `JobsByNamespace` | `s *StateStore` | `ws memdb.WatchSet, namespace string, sort SortOption` | `memdb.ResultIterator, error` | [L2506](file:///d:/claude/nomad/nomad/state/state_store.go#L2506) |
| `jobsByNamespaceImpl` | `s *StateStore` | `ws memdb.WatchSet, namespace string, txn *txn, sort SortOption` | `memdb.ResultIterator, error` | [L2512](file:///d:/claude/nomad/nomad/state/state_store.go#L2512) |
| `JobsByPeriodic` | `s *StateStore` | `ws memdb.WatchSet, periodic bool` | `memdb.ResultIterator, error` | [L2524](file:///d:/claude/nomad/nomad/state/state_store.go#L2524) |
| `JobsByScheduler` | `s *StateStore` | `ws memdb.WatchSet, schedulerType string` | `memdb.ResultIterator, error` | [L2539](file:///d:/claude/nomad/nomad/state/state_store.go#L2539) |
| `JobsByGC` | `s *StateStore` | `ws memdb.WatchSet, gc bool` | `memdb.ResultIterator, error` | [L2555](file:///d:/claude/nomad/nomad/state/state_store.go#L2555) |
| `JobsByPool` | `s *StateStore` | `ws memdb.WatchSet, pool string` | `memdb.ResultIterator, error` | [L2569](file:///d:/claude/nomad/nomad/state/state_store.go#L2569) |
| `JobsByModifyIndex` | `s *StateStore` | `ws memdb.WatchSet, sort SortOption` | `memdb.ResultIterator, error` | [L2583](file:///d:/claude/nomad/nomad/state/state_store.go#L2583) |
| `JobSummaryByID` | `s *StateStore` | `ws memdb.WatchSet, namespace string, jobID string` | `*structs.JobSummary, error` | [L2597](file:///d:/claude/nomad/nomad/state/state_store.go#L2597) |
| `JobSummaries` | `s *StateStore` | `ws memdb.WatchSet` | `memdb.ResultIterator, error` | [L2617](file:///d:/claude/nomad/nomad/state/state_store.go#L2617) |
| `JobSummaryByPrefix` | `s *StateStore` | `ws memdb.WatchSet, namespace string, id string` | `memdb.ResultIterator, error` | [L2631](file:///d:/claude/nomad/nomad/state/state_store.go#L2631) |
| `UpsertCSIVolume` | `s *StateStore` | `index uint64, volumes []*structs.CSIVolume` | `error` | [L2645](file:///d:/claude/nomad/nomad/state/state_store.go#L2645) |
| `CSIVolumes` | `s *StateStore` | `ws memdb.WatchSet` | `memdb.ResultIterator, error` | [L2700](file:///d:/claude/nomad/nomad/state/state_store.go#L2700) |
| `CSIVolumeByID` | `s *StateStore` | `ws memdb.WatchSet, namespace string, id string` | `*structs.CSIVolume, error` | [L2717](file:///d:/claude/nomad/nomad/state/state_store.go#L2717) |
| `CSIVolumesByPluginID` | `s *StateStore` | `ws memdb.WatchSet, namespace string, prefix string, pluginID string` | `memdb.ResultIterator, error` | [L2738](file:///d:/claude/nomad/nomad/state/state_store.go#L2738) |
| `CSIVolumesByIDPrefix` | `s *StateStore` | `ws memdb.WatchSet, namespace string, volumeID string` | `memdb.ResultIterator, error` | [L2762](file:///d:/claude/nomad/nomad/state/state_store.go#L2762) |
| `csiVolumeByIDPrefixAllNamespaces` | `s *StateStore` | `ws memdb.WatchSet, prefix string` | `memdb.ResultIterator, error` | [L2779](file:///d:/claude/nomad/nomad/state/state_store.go#L2779) |
| `CSIVolumesByNodeID` | `s *StateStore` | `ws memdb.WatchSet, prefix string, nodeID string` | `memdb.ResultIterator, error` | [L2805](file:///d:/claude/nomad/nomad/state/state_store.go#L2805) |
| `CSIVolumesByNamespace` | `s *StateStore` | `ws memdb.WatchSet, namespace string, prefix string` | `memdb.ResultIterator, error` | [L2848](file:///d:/claude/nomad/nomad/state/state_store.go#L2848) |
| `csiVolumesByNamespaceImpl` | `s *StateStore` | `txn *txn, ws memdb.WatchSet, namespace string, prefix string` | `memdb.ResultIterator, error` | [L2854](file:///d:/claude/nomad/nomad/state/state_store.go#L2854) |
| `CSIVolumeClaim` | `s *StateStore` | `index uint64, now int64, namespace string, id string, claim *structs.CSIVolu...` | `error` | [L2867](file:///d:/claude/nomad/nomad/state/state_store.go#L2867) |
| `CSIVolumeDeregister` | `s *StateStore` | `index uint64, namespace string, ids []string, force bool` | `error` | [L2941](file:///d:/claude/nomad/nomad/state/state_store.go#L2941) |
| `volSafeToForce` | `s *StateStore` | `txn Txn, v *structs.CSIVolume` | `bool` | [L2984](file:///d:/claude/nomad/nomad/state/state_store.go#L2984) |
| `CSIVolumeDenormalizePlugins` | `s *StateStore` | `ws memdb.WatchSet, vol *structs.CSIVolume` | `*structs.CSIVolume, error` | [L3010](file:///d:/claude/nomad/nomad/state/state_store.go#L3010) |
| `csiVolumeDenormalizePluginsTxn` | `s *StateStore` | `txn Txn, vol *structs.CSIVolume` | `*structs.CSIVolume, error` | [L3021](file:///d:/claude/nomad/nomad/state/state_store.go#L3021) |
| `CSIVolumeDenormalize` | `s *StateStore` | `ws memdb.WatchSet, vol *structs.CSIVolume` | `*structs.CSIVolume, error` | [L3060](file:///d:/claude/nomad/nomad/state/state_store.go#L3060) |
| `csiVolumeDenormalizeTxn` | `s *StateStore` | `txn Txn, ws memdb.WatchSet, vol *structs.CSIVolume` | `*structs.CSIVolume, error` | [L3066](file:///d:/claude/nomad/nomad/state/state_store.go#L3066) |
| `CSIPlugins` | `s *StateStore` | `ws memdb.WatchSet` | `memdb.ResultIterator, error` | [L3155](file:///d:/claude/nomad/nomad/state/state_store.go#L3155) |
| `CSIPluginsByIDPrefix` | `s *StateStore` | `ws memdb.WatchSet, pluginID string` | `memdb.ResultIterator, error` | [L3170](file:///d:/claude/nomad/nomad/state/state_store.go#L3170) |
| `CSIPluginByID` | `s *StateStore` | `ws memdb.WatchSet, id string` | `*structs.CSIPlugin, error` | [L3185](file:///d:/claude/nomad/nomad/state/state_store.go#L3185) |
| `CSIPluginByIDTxn` | `s *StateStore` | `txn Txn, ws memdb.WatchSet, id string` | `*structs.CSIPlugin, error` | [L3195](file:///d:/claude/nomad/nomad/state/state_store.go#L3195) |
| `CSIPluginDenormalize` | `s *StateStore` | `ws memdb.WatchSet, plug *structs.CSIPlugin` | `*structs.CSIPlugin, error` | [L3211](file:///d:/claude/nomad/nomad/state/state_store.go#L3211) |
| `CSIPluginDenormalizeTxn` | `s *StateStore` | `txn Txn, ws memdb.WatchSet, plug *structs.CSIPlugin` | `*structs.CSIPlugin, error` | [L3216](file:///d:/claude/nomad/nomad/state/state_store.go#L3216) |
| `UpsertCSIPlugin` | `s *StateStore` | `index uint64, plug *structs.CSIPlugin` | `error` | [L3250](file:///d:/claude/nomad/nomad/state/state_store.go#L3250) |
| `DeleteCSIPlugin` | `s *StateStore` | `index uint64, id string` | `error` | [L3276](file:///d:/claude/nomad/nomad/state/state_store.go#L3276) |
| `UpsertPeriodicLaunch` | `s *StateStore` | `index uint64, launch *structs.PeriodicLaunch` | `error` | [L3337](file:///d:/claude/nomad/nomad/state/state_store.go#L3337) |
| `DeletePeriodicLaunch` | `s *StateStore` | `index uint64, namespace string, jobID string` | `error` | [L3368](file:///d:/claude/nomad/nomad/state/state_store.go#L3368) |
| `DeletePeriodicLaunchTxn` | `s *StateStore` | `index uint64, namespace string, jobID string, txn Txn` | `error` | [L3381](file:///d:/claude/nomad/nomad/state/state_store.go#L3381) |
| `PeriodicLaunchByID` | `s *StateStore` | `ws memdb.WatchSet, namespace string, id string` | `*structs.PeriodicLaunch, error` | [L3404](file:///d:/claude/nomad/nomad/state/state_store.go#L3404) |
| `PeriodicLaunches` | `s *StateStore` | `ws memdb.WatchSet` | `memdb.ResultIterator, error` | [L3421](file:///d:/claude/nomad/nomad/state/state_store.go#L3421) |
| `UpsertEvals` | `s *StateStore` | `msgType structs.MessageType, index uint64, evals []*structs.Evaluation` | `error` | [L3436](file:///d:/claude/nomad/nomad/state/state_store.go#L3436) |
| `UpsertEvalsTxn` | `s *StateStore` | `index uint64, evals []*structs.Evaluation, txn Txn` | `error` | [L3449](file:///d:/claude/nomad/nomad/state/state_store.go#L3449) |
| `nestedUpsertEval` | `s *StateStore` | `txn *txn, index uint64, eval *structs.Evaluation` | `error` | [L3473](file:///d:/claude/nomad/nomad/state/state_store.go#L3473) |
| `updateEvalModifyIndex` | `s *StateStore` | `txn *txn, index uint64, evalID string` | `error` | [L3565](file:///d:/claude/nomad/nomad/state/state_store.go#L3565) |
| `DeleteEvalsByFilter` | `s *StateStore` | `index uint64, filterExpr string, pageToken string, perPage int32` | `error` | [L3591](file:///d:/claude/nomad/nomad/state/state_store.go#L3591) |
| `EvalIsUserDeleteSafe` | `s *StateStore` | `ws memdb.WatchSet, eval *structs.Evaluation` | `bool, error` | [L3657](file:///d:/claude/nomad/nomad/state/state_store.go#L3657) |
| `isEvalDeleteSafe` | - | `allocs []*structs.Allocation, job *structs.Job` | `bool` | [L3672](file:///d:/claude/nomad/nomad/state/state_store.go#L3672) |
| `DeleteEval` | `s *StateStore` | `index uint64, evals []string, allocs []string, userInitiated bool` | `error` | [L3731](file:///d:/claude/nomad/nomad/state/state_store.go#L3731) |
| `EvalByID` | `s *StateStore` | `ws memdb.WatchSet, id string` | `*structs.Evaluation, error` | [L3824](file:///d:/claude/nomad/nomad/state/state_store.go#L3824) |
| `EvalsRelatedToID` | `s *StateStore` | `ws memdb.WatchSet, id string` | `[]*structs.EvaluationStub, error` | [L3842](file:///d:/claude/nomad/nomad/state/state_store.go#L3842) |
| `EvalsByIDPrefix` | `s *StateStore` | `ws memdb.WatchSet, namespace string, id string, sort SortOption` | `memdb.ResultIterator, error` | [L3891](file:///d:/claude/nomad/nomad/state/state_store.go#L3891) |
| `evalNamespaceFilter` | - | `namespace string` | `func(...)` | [L3917](file:///d:/claude/nomad/nomad/state/state_store.go#L3917) |
| `EvalsByJob` | `s *StateStore` | `ws memdb.WatchSet, namespace string, jobID string` | `[]*structs.Evaluation, error` | [L3930](file:///d:/claude/nomad/nomad/state/state_store.go#L3930) |
| `Evals` | `s *StateStore` | `ws memdb.WatchSet, sort SortOption` | `memdb.ResultIterator, error` | [L3962](file:///d:/claude/nomad/nomad/state/state_store.go#L3962) |
| `EvalsByNamespace` | `s *StateStore` | `ws memdb.WatchSet, namespace string` | `memdb.ResultIterator, error` | [L3988](file:///d:/claude/nomad/nomad/state/state_store.go#L3988) |
| `EvalsByNamespaceOrdered` | `s *StateStore` | `ws memdb.WatchSet, namespace string, sort SortOption` | `memdb.ResultIterator, error` | [L4001](file:///d:/claude/nomad/nomad/state/state_store.go#L4001) |
| `UpdateAllocsFromClient` | `s *StateStore` | `msgType structs.MessageType, index uint64, req structs.AllocUpdateRequest` | `error` | [L4031](file:///d:/claude/nomad/nomad/state/state_store.go#L4031) |
| `nestedUpdateAllocFromClient` | `s *StateStore` | `txn *txn, index uint64, alloc *structs.Allocation` | `*structs.Allocation, error` | [L4097](file:///d:/claude/nomad/nomad/state/state_store.go#L4097) |
| `cancelFollowupEvalsForReconnect` | `s *StateStore` | `txn *txn, index uint64, copyAlloc *structs.Allocation, alloc *structs.Alloca...` | `error` | [L4181](file:///d:/claude/nomad/nomad/state/state_store.go#L4181) |
| `updateClientAllocUpdateIndex` | `s *StateStore` | `txn *txn, index uint64, nodeID string` | `error` | [L4225](file:///d:/claude/nomad/nomad/state/state_store.go#L4225) |
| `UpsertAllocs` | `s *StateStore` | `msgType structs.MessageType, index uint64, allocs []*structs.Allocation` | `error` | [L4249](file:///d:/claude/nomad/nomad/state/state_store.go#L4249) |
| `upsertAllocsImpl` | `s *StateStore` | `index uint64, allocs []*structs.Allocation, txn *txn` | `error` | [L4260](file:///d:/claude/nomad/nomad/state/state_store.go#L4260) |
| `UpdateAllocsDesiredTransitions` | `s *StateStore` | `msgType structs.MessageType, index uint64, allocs map[string]*structs.Desire...` | `error` | [L4420](file:///d:/claude/nomad/nomad/state/state_store.go#L4420) |
| `UpdateAllocDesiredTransitionTxn` | `s *StateStore` | `txn *txn, index uint64, allocID string, transition *structs.DesiredTransition` | `error` | [L4449](file:///d:/claude/nomad/nomad/state/state_store.go#L4449) |
| `AllocByID` | `s *StateStore` | `ws memdb.WatchSet, id string` | `*structs.Allocation, error` | [L4484](file:///d:/claude/nomad/nomad/state/state_store.go#L4484) |
| `allocByIDImpl` | `s *StateStore` | `txn Txn, ws memdb.WatchSet, id string` | `*structs.Allocation, error` | [L4492](file:///d:/claude/nomad/nomad/state/state_store.go#L4492) |
| `AllocsByIDPrefix` | `s *StateStore` | `ws memdb.WatchSet, namespace string, id string, sort SortOption` | `memdb.ResultIterator, error` | [L4508](file:///d:/claude/nomad/nomad/state/state_store.go#L4508) |
| `allocNamespaceFilter` | - | `namespace string` | `func(...)` | [L4533](file:///d:/claude/nomad/nomad/state/state_store.go#L4533) |
| `AllocsByIDPrefixAllNSs` | `s *StateStore` | `ws memdb.WatchSet, prefix string` | `memdb.ResultIterator, error` | [L4549](file:///d:/claude/nomad/nomad/state/state_store.go#L4549) |
| `AllocsByNode` | `s *StateStore` | `ws memdb.WatchSet, node string` | `[]*structs.Allocation, error` | [L4563](file:///d:/claude/nomad/nomad/state/state_store.go#L4563) |
| `allocsByNodeTxn` | - | `txn ReadTxn, ws memdb.WatchSet, node string` | `[]*structs.Allocation, error` | [L4569](file:///d:/claude/nomad/nomad/state/state_store.go#L4569) |
| `AllocsByNodeTerminal` | `s *StateStore` | `ws memdb.WatchSet, node string, terminal bool` | `[]*structs.Allocation, error` | [L4592](file:///d:/claude/nomad/nomad/state/state_store.go#L4592) |
| `AllocsByJob` | `s *StateStore` | `ws memdb.WatchSet, namespace string, jobID string, anyCreateIndex bool` | `[]*structs.Allocation, error` | [L4615](file:///d:/claude/nomad/nomad/state/state_store.go#L4615) |
| `AllocsByEval` | `s *StateStore` | `ws memdb.WatchSet, evalID string` | `[]*structs.Allocation, error` | [L4656](file:///d:/claude/nomad/nomad/state/state_store.go#L4656) |
| `AllocsByDeployment` | `s *StateStore` | `ws memdb.WatchSet, deploymentID string` | `[]*structs.Allocation, error` | [L4679](file:///d:/claude/nomad/nomad/state/state_store.go#L4679) |
| `Allocs` | `s *StateStore` | `ws memdb.WatchSet, sort SortOption` | `memdb.ResultIterator, error` | [L4702](file:///d:/claude/nomad/nomad/state/state_store.go#L4702) |
| `AllocsByNamespaceOrdered` | `s *StateStore` | `ws memdb.WatchSet, namespace string, sort SortOption` | `memdb.ResultIterator, error` | [L4724](file:///d:/claude/nomad/nomad/state/state_store.go#L4724) |
| `AllocsByNamespace` | `s *StateStore` | `ws memdb.WatchSet, namespace string` | `memdb.ResultIterator, error` | [L4751](file:///d:/claude/nomad/nomad/state/state_store.go#L4751) |
| `allocsByNamespaceImpl` | `s *StateStore` | `ws memdb.WatchSet, txn *txn, namespace string` | `memdb.ResultIterator, error` | [L4758](file:///d:/claude/nomad/nomad/state/state_store.go#L4758) |
| `UpdateDeploymentStatus` | `s *StateStore` | `msgType structs.MessageType, index uint64, req *structs.DeploymentStatusUpda...` | `error` | [L4774](file:///d:/claude/nomad/nomad/state/state_store.go#L4774) |
| `updateDeploymentStatusImpl` | `s *StateStore` | `index uint64, u *structs.DeploymentStatusUpdate, txn *txn` | `error` | [L4799](file:///d:/claude/nomad/nomad/state/state_store.go#L4799) |
| `UpdateJobStability` | `s *StateStore` | `index uint64, namespace string, jobID string, jobVersion uint64, stable bool` | `error` | [L4851](file:///d:/claude/nomad/nomad/state/state_store.go#L4851) |
| `updateJobStabilityImpl` | `s *StateStore` | `index uint64, namespace string, jobID string, jobVersion uint64, stable bool...` | `error` | [L4863](file:///d:/claude/nomad/nomad/state/state_store.go#L4863) |
| `UpdateJobVersionTag` | `s *StateStore` | `index uint64, namespace string, req *structs.JobApplyTagRequest` | `error` | [L4885](file:///d:/claude/nomad/nomad/state/state_store.go#L4885) |
| `updateJobVersionTagImpl` | `s *StateStore` | `index uint64, namespace string, jobID string, jobVersion uint64, tag *struct...` | `error` | [L4916](file:///d:/claude/nomad/nomad/state/state_store.go#L4916) |
| `unsetJobVersionTagImpl` | `s *StateStore` | `index uint64, namespace string, jobID string, name string, txn *txn` | `error` | [L4957](file:///d:/claude/nomad/nomad/state/state_store.go#L4957) |
| `UpdateDeploymentPromotion` | `s *StateStore` | `msgType structs.MessageType, index uint64, req *structs.ApplyDeploymentPromo...` | `error` | [L4984](file:///d:/claude/nomad/nomad/state/state_store.go#L4984) |
| `UpdateDeploymentAllocHealth` | `s *StateStore` | `msgType structs.MessageType, index uint64, req *structs.ApplyDeploymentAlloc...` | `error` | [L5133](file:///d:/claude/nomad/nomad/state/state_store.go#L5133) |
| `LatestIndex` | `s *StateStore` | - | `uint64, error` | [L5228](file:///d:/claude/nomad/nomad/state/state_store.go#L5228) |
| `Index` | `s *StateStore` | `name string` | `uint64, error` | [L5254](file:///d:/claude/nomad/nomad/state/state_store.go#L5254) |
| `Indexes` | `s *StateStore` | - | `memdb.ResultIterator, error` | [L5269](file:///d:/claude/nomad/nomad/state/state_store.go#L5269) |
| `ReconcileJobSummaries` | `s *StateStore` | `index uint64` | `error` | [L5282](file:///d:/claude/nomad/nomad/state/state_store.go#L5282) |
| `setJobStatuses` | `s *StateStore` | `index uint64, txn *txn, jobs map[structs.NamespacedID]string, evalDelete bool` | `error` | [L5443](file:///d:/claude/nomad/nomad/state/state_store.go#L5443) |
| `setJobStatus` | `s *StateStore` | `index uint64, txn *txn, job *structs.Job, evalDelete bool, forceStatus string` | `error` | [L5469](file:///d:/claude/nomad/nomad/state/state_store.go#L5469) |
| `setJobSummary` | `s *StateStore` | `txn *txn, updated *structs.Job, index uint64, oldStatus string, newStatus st...` | `error` | [L5518](file:///d:/claude/nomad/nomad/state/state_store.go#L5518) |
| `getJobStatus` | `s *StateStore` | `txn *txn, job *structs.Job, evalDelete bool` | `string, error` | [L5581](file:///d:/claude/nomad/nomad/state/state_store.go#L5581) |
| `updateSummaryWithJob` | `s *StateStore` | `index uint64, job *structs.Job, txn *txn` | `error` | [L5649](file:///d:/claude/nomad/nomad/state/state_store.go#L5649) |
| `updatePreservedValues` | `s *StateStore` | `job *structs.Job, prev *structs.Job, req *structs.JobRegisterRequest` | `error` | [L5705](file:///d:/claude/nomad/nomad/state/state_store.go#L5705) |
| `updateJobScalingPolicies` | `s *StateStore` | `index uint64, job *structs.Job, txn *txn` | `error` | [L5745](file:///d:/claude/nomad/nomad/state/state_store.go#L5745) |
| `updateJobSubmission` | `s *StateStore` | `index uint64, sub *structs.JobSubmission, namespace string, jobID string, ve...` | `error` | [L5782](file:///d:/claude/nomad/nomad/state/state_store.go#L5782) |
| `pruneJobSubmissions` | `s *StateStore` | `namespace string, jobID string, txn *txn` | `error` | [L5821](file:///d:/claude/nomad/nomad/state/state_store.go#L5821) |
| `updateJobCSIPlugins` | `s *StateStore` | `index uint64, job *structs.Job, prev *structs.Job, txn *txn` | `error` | [L5876](file:///d:/claude/nomad/nomad/state/state_store.go#L5876) |
| `updateDeploymentWithAlloc` | `s *StateStore` | `index uint64, alloc *structs.Allocation, existing *structs.Allocation, txn *...` | `error` | [L5941](file:///d:/claude/nomad/nomad/state/state_store.go#L5941) |
| `updateSummaryWithAlloc` | `s *StateStore` | `index uint64, alloc *structs.Allocation, existingAlloc *structs.Allocation, ...` | `error` | [L6048](file:///d:/claude/nomad/nomad/state/state_store.go#L6048) |
| `updatePluginForTerminalAlloc` | `s *StateStore` | `index uint64, alloc *structs.Allocation, txn *txn` | `error` | [L6173](file:///d:/claude/nomad/nomad/state/state_store.go#L6173) |
| `updatePluginWithJobSummary` | `s *StateStore` | `index uint64, summary *structs.JobSummary, alloc *structs.Allocation, txn *txn` | `error` | [L6210](file:///d:/claude/nomad/nomad/state/state_store.go#L6210) |
| `UpsertACLPolicies` | `s *StateStore` | `msgType structs.MessageType, index uint64, policies []*structs.ACLPolicy` | `error` | [L6245](file:///d:/claude/nomad/nomad/state/state_store.go#L6245) |
| `DeleteACLPolicies` | `s *StateStore` | `msgType structs.MessageType, index uint64, names []string` | `error` | [L6286](file:///d:/claude/nomad/nomad/state/state_store.go#L6286) |
| `ACLPolicyByName` | `s *StateStore` | `ws memdb.WatchSet, name string` | `*structs.ACLPolicy, error` | [L6303](file:///d:/claude/nomad/nomad/state/state_store.go#L6303) |
| `ACLPolicyByNamePrefix` | `s *StateStore` | `ws memdb.WatchSet, prefix string` | `memdb.ResultIterator, error` | [L6319](file:///d:/claude/nomad/nomad/state/state_store.go#L6319) |
| `ACLPolicyByJob` | `s *StateStore` | `ws memdb.WatchSet, ns string, jobID string` | `memdb.ResultIterator, error` | [L6333](file:///d:/claude/nomad/nomad/state/state_store.go#L6333) |
| `ACLPolicyByNamespace` | `s *StateStore` | `ws memdb.WatchSet, ns string` | `memdb.ResultIterator, error` | [L6345](file:///d:/claude/nomad/nomad/state/state_store.go#L6345) |
| `ACLPolicies` | `s *StateStore` | `ws memdb.WatchSet` | `memdb.ResultIterator, error` | [L6358](file:///d:/claude/nomad/nomad/state/state_store.go#L6358) |
| `UpsertACLTokens` | `s *StateStore` | `msgType structs.MessageType, index uint64, tokens []*structs.ACLToken` | `error` | [L6371](file:///d:/claude/nomad/nomad/state/state_store.go#L6371) |
| `DeleteACLTokens` | `s *StateStore` | `msgType structs.MessageType, index uint64, ids []string` | `error` | [L6417](file:///d:/claude/nomad/nomad/state/state_store.go#L6417) |
| `ACLTokenByAccessorID` | `s *StateStore` | `ws memdb.WatchSet, id string` | `*structs.ACLToken, error` | [L6434](file:///d:/claude/nomad/nomad/state/state_store.go#L6434) |
| `ACLTokenBySecretID` | `s *StateStore` | `ws memdb.WatchSet, secretID string` | `*structs.ACLToken, error` | [L6464](file:///d:/claude/nomad/nomad/state/state_store.go#L6464) |
| `ACLTokenByAccessorIDPrefix` | `s *StateStore` | `ws memdb.WatchSet, prefix string, sort SortOption` | `memdb.ResultIterator, error` | [L6494](file:///d:/claude/nomad/nomad/state/state_store.go#L6494) |
| `ACLTokens` | `s *StateStore` | `ws memdb.WatchSet, sort SortOption` | `memdb.ResultIterator, error` | [L6515](file:///d:/claude/nomad/nomad/state/state_store.go#L6515) |
| `ACLTokensByGlobal` | `s *StateStore` | `ws memdb.WatchSet, globalVal bool, sort SortOption` | `memdb.ResultIterator, error` | [L6536](file:///d:/claude/nomad/nomad/state/state_store.go#L6536) |
| `CanBootstrapACLToken` | `s *StateStore` | - | `bool, uint64, error` | [L6558](file:///d:/claude/nomad/nomad/state/state_store.go#L6558) |
| `BootstrapACLTokens` | `s *StateStore` | `msgType structs.MessageType, index uint64, resetIndex uint64, token *structs...` | `error` | [L6577](file:///d:/claude/nomad/nomad/state/state_store.go#L6577) |
| `UpsertOneTimeToken` | `s *StateStore` | `msgType structs.MessageType, index uint64, token *structs.OneTimeToken` | `error` | [L6616](file:///d:/claude/nomad/nomad/state/state_store.go#L6616) |
| `DeleteOneTimeTokens` | `s *StateStore` | `msgType structs.MessageType, index uint64, ids []string` | `error` | [L6642](file:///d:/claude/nomad/nomad/state/state_store.go#L6642) |
| `ExpireOneTimeTokens` | `s *StateStore` | `msgType structs.MessageType, index uint64, timestamp time.Time` | `error` | [L6664](file:///d:/claude/nomad/nomad/state/state_store.go#L6664) |
| `oneTimeTokensExpiredTxn` | `s *StateStore` | `txn *txn, ws memdb.WatchSet, timestamp time.Time` | `memdb.ResultIterator, error` | [L6699](file:///d:/claude/nomad/nomad/state/state_store.go#L6699) |
| `OneTimeTokenBySecret` | `s *StateStore` | `ws memdb.WatchSet, secret string` | `*structs.OneTimeToken, error` | [L6711](file:///d:/claude/nomad/nomad/state/state_store.go#L6711) |
| `expiredOneTimeTokenFilter` | - | `now time.Time` | `func(...)` | [L6732](file:///d:/claude/nomad/nomad/state/state_store.go#L6732) |
| `SchedulerConfig` | `s *StateStore` | - | `uint64, *structs.SchedulerConfiguration, error` | [L6744](file:///d:/claude/nomad/nomad/state/state_store.go#L6744) |
| `schedulerConfigTxn` | `s *StateStore` | `txn *txn` | `uint64, *structs.SchedulerConfiguration, error` | [L6750](file:///d:/claude/nomad/nomad/state/state_store.go#L6750) |
| `SchedulerSetConfig` | `s *StateStore` | `index uint64, config *structs.SchedulerConfiguration` | `error` | [L6767](file:///d:/claude/nomad/nomad/state/state_store.go#L6767) |
| `ClusterMetadata` | `s *StateStore` | `ws memdb.WatchSet` | `*structs.ClusterMetadata, error` | [L6776](file:///d:/claude/nomad/nomad/state/state_store.go#L6776) |
| `ClusterSetMetadata` | `s *StateStore` | `index uint64, meta *structs.ClusterMetadata` | `error` | [L6794](file:///d:/claude/nomad/nomad/state/state_store.go#L6794) |
| `WithWriteTransaction` | `s *StateStore` | `msgType structs.MessageType, index uint64, fn func(...)` | `error` | [L6808](file:///d:/claude/nomad/nomad/state/state_store.go#L6808) |
| `SchedulerCASConfig` | `s *StateStore` | `index uint64, cidx uint64, config *structs.SchedulerConfiguration` | `bool, error` | [L6822](file:///d:/claude/nomad/nomad/state/state_store.go#L6822) |
| `schedulerSetConfigTxn` | `s *StateStore` | `idx uint64, tx *txn, config *structs.SchedulerConfiguration` | `error` | [L6848](file:///d:/claude/nomad/nomad/state/state_store.go#L6848) |
| `setClusterMetadata` | `s *StateStore` | `txn *txn, meta *structs.ClusterMetadata` | `error` | [L6869](file:///d:/claude/nomad/nomad/state/state_store.go#L6869) |
| `UpsertScalingPolicies` | `s *StateStore` | `index uint64, scalingPolicies []*structs.ScalingPolicy` | `error` | [L6893](file:///d:/claude/nomad/nomad/state/state_store.go#L6893) |
| `UpsertScalingPoliciesTxn` | `s *StateStore` | `index uint64, scalingPolicies []*structs.ScalingPolicy, txn *txn` | `error` | [L6905](file:///d:/claude/nomad/nomad/state/state_store.go#L6905) |
| `NamespaceByName` | `s *StateStore` | `ws memdb.WatchSet, name string` | `*structs.Namespace, error` | [L6964](file:///d:/claude/nomad/nomad/state/state_store.go#L6964) |
| `namespaceByNameImpl` | `s *StateStore` | `ws memdb.WatchSet, txn *txn, name string` | `*structs.Namespace, error` | [L6970](file:///d:/claude/nomad/nomad/state/state_store.go#L6970) |
| `namespaceExists` | `s *StateStore` | `txn *txn, namespace string` | `bool, error` | [L6984](file:///d:/claude/nomad/nomad/state/state_store.go#L6984) |
| `NamespacesByNamePrefix` | `s *StateStore` | `ws memdb.WatchSet, namePrefix string` | `memdb.ResultIterator, error` | [L6998](file:///d:/claude/nomad/nomad/state/state_store.go#L6998) |
| `Namespaces` | `s *StateStore` | `ws memdb.WatchSet` | `memdb.ResultIterator, error` | [L7011](file:///d:/claude/nomad/nomad/state/state_store.go#L7011) |
| `NamespaceNames` | `s *StateStore` | - | `[]string, error` | [L7023](file:///d:/claude/nomad/nomad/state/state_store.go#L7023) |
| `UpsertNamespaces` | `s *StateStore` | `index uint64, namespaces []*structs.Namespace` | `error` | [L7043](file:///d:/claude/nomad/nomad/state/state_store.go#L7043) |
| `upsertNamespaceImpl` | `s *StateStore` | `index uint64, txn *txn, namespace *structs.Namespace` | `error` | [L7063](file:///d:/claude/nomad/nomad/state/state_store.go#L7063) |
| `DeleteNamespaces` | `s *StateStore` | `index uint64, names []string` | `error` | [L7112](file:///d:/claude/nomad/nomad/state/state_store.go#L7112) |
| `DeleteScalingPolicies` | `s *StateStore` | `index uint64, ids []string` | `error` | [L7185](file:///d:/claude/nomad/nomad/state/state_store.go#L7185) |
| `DeleteScalingPoliciesTxn` | `s *StateStore` | `index uint64, ids []string, txn *txn` | `error` | [L7198](file:///d:/claude/nomad/nomad/state/state_store.go#L7198) |
| `ScalingPolicies` | `s *StateStore` | `ws memdb.WatchSet` | `memdb.ResultIterator, error` | [L7227](file:///d:/claude/nomad/nomad/state/state_store.go#L7227) |
| `ScalingPoliciesByTypePrefix` | `s *StateStore` | `ws memdb.WatchSet, t string` | `memdb.ResultIterator, error` | [L7242](file:///d:/claude/nomad/nomad/state/state_store.go#L7242) |
| `ScalingPoliciesByNamespace` | `s *StateStore` | `ws memdb.WatchSet, namespace string, typ string` | `memdb.ResultIterator, error` | [L7254](file:///d:/claude/nomad/nomad/state/state_store.go#L7254) |
| `ScalingPoliciesByJob` | `s *StateStore` | `ws memdb.WatchSet, namespace string, jobID string, policyType string` | `memdb.ResultIterator, error` | [L7281](file:///d:/claude/nomad/nomad/state/state_store.go#L7281) |
| `ScalingPoliciesByJobTxn` | `s *StateStore` | `ws memdb.WatchSet, namespace string, jobID string, txn *txn` | `memdb.ResultIterator, error` | [L7304](file:///d:/claude/nomad/nomad/state/state_store.go#L7304) |
| `ScalingPolicyByID` | `s *StateStore` | `ws memdb.WatchSet, id string` | `*structs.ScalingPolicy, error` | [L7328](file:///d:/claude/nomad/nomad/state/state_store.go#L7328) |
| `ScalingPolicyByTargetAndType` | `s *StateStore` | `ws memdb.WatchSet, target map[string]string, typ string` | `*structs.ScalingPolicy, error` | [L7346](file:///d:/claude/nomad/nomad/state/state_store.go#L7346) |
| `ScalingPoliciesByIDPrefix` | `s *StateStore` | `ws memdb.WatchSet, namespace string, prefix string` | `memdb.ResultIterator, error` | [L7379](file:///d:/claude/nomad/nomad/state/state_store.go#L7379) |
| `scalingPolicyNamespaceFilter` | - | `namespace string` | `func(...)` | [L7396](file:///d:/claude/nomad/nomad/state/state_store.go#L7396) |
| `DenormalizeAllocationsMap` | `s *StateSnapshot` | `nodeAllocations map[string][]*structs.Allocation` | `error` | [L7415](file:///d:/claude/nomad/nomad/state/state_store.go#L7415) |
| `DenormalizeAllocationSlice` | `s *StateSnapshot` | `allocs []*structs.Allocation` | `[]*structs.Allocation, error` | [L7432](file:///d:/claude/nomad/nomad/state/state_store.go#L7432) |
| `DenormalizeAllocationDiffSlice` | `s *StateSnapshot` | `allocDiffs []*structs.AllocationDiff` | `[]*structs.Allocation, error` | [L7445](file:///d:/claude/nomad/nomad/state/state_store.go#L7445) |
| `getPreemptedAllocDesiredDescription` | - | `preemptedByAllocID string` | `string` | [L7492](file:///d:/claude/nomad/nomad/state/state_store.go#L7492) |

## 5. 核心方法详解

### Validate()

**签名**：`func (c *StateStoreConfig) Validate() error`

**位置**：[L95](file:///d:/claude/nomad/nomad/state/state_store.go#L95)

### Snapshot()

**签名**：`func (s *StateStore) Snapshot() *StateSnapshot, error`

**位置**：[L215](file:///d:/claude/nomad/nomad/state/state_store.go#L215)

### Restore()

**签名**：`func (s *StateStore) Restore() *StateRestore, error`

**位置**：[L288](file:///d:/claude/nomad/nomad/state/state_store.go#L288)

### Deployments()

**签名**：`func (s *StateStore) Deployments(ws memdb.WatchSet, sort SortOption) memdb.ResultIterator, error`

**位置**：[L619](file:///d:/claude/nomad/nomad/state/state_store.go#L619)

### GetJobSubmissions()

**签名**：`func (s *StateStore) GetJobSubmissions(ws memdb.WatchSet) memdb.ResultIterator, error`

**位置**：[L2289](file:///d:/claude/nomad/nomad/state/state_store.go#L2289)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `reflect` | 标准库 |
| `slices` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/lib/lang` | 内部包 |
| `github.com/hashicorp/nomad/nomad/stream` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-bexpr` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **流式响应**：支持流式数据传输，用于事件订阅和长连接场景
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [state_store_test.go](file:///d:/claude/nomad/nomad/state/state_store_test.go) | 对应测试文件 |

