# fsm.go 代码说明文档

> 文件路径：[fsm.go](file:///d:/claude/nomad/nomad/fsm.go)
> 总行数：3407 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **Raft 有限状态机（FSM）**，将 Raft 日志条目应用到状态存储（StateStore）。是 Raft 共识层与状态存储之间的桥梁，负责状态的快照和恢复。

## 2. 类型定义

### SnapshotType

**定义位置**：[L30](file:///d:/claude/nomad/nomad/fsm.go#L30)

**类型定义**：`byte`

**关联方法**（1 个）：`String`

### LogApplier

**定义位置**：[L117](file:///d:/claude/nomad/nomad/fsm.go#L117)

**类型定义**：`func(...)`

### LogAppliers

**定义位置**：[L121](file:///d:/claude/nomad/nomad/fsm.go#L121)

**类型定义**：`map[structs.MessageType]LogApplier`

### SnapshotRestorer

**定义位置**：[L124](file:///d:/claude/nomad/nomad/fsm.go#L124)

**类型定义**：`func(...)`

### SnapshotRestorers

**定义位置**：[L128](file:///d:/claude/nomad/nomad/fsm.go#L128)

**类型定义**：`map[SnapshotType]SnapshotRestorer`

### nomadFSM

**定义位置**：[L133](file:///d:/claude/nomad/nomad/fsm.go#L133)

**类型**：struct

```go
	evalBroker *EvalBroker
	blockedEvals *BlockedEvals
	periodicDispatcher *PeriodicDispatch
	encrypter *Encrypter
	logger hclog.Logger
	state *state.StateStore
	config *FSMConfig
	enterpriseAppliers LogAppliers
	enterpriseRestorers SnapshotRestorers
	stateLock sync.RWMutex
```

**关联方法**（74 个）：`Close`, `State`, `Apply`, `applyClusterMetadata`, `applyUpsertNode`, `applyDeregisterNode`, `applyDeregisterNodeBatch`, `applyStatusUpdate`, `applyDrainUpdate`, `applyBatchDrainUpdate`, `applyNodeEligibilityUpdate`, `applyNodePoolUpsert`, `applyNodePoolDelete`, `applyUpsertJob`, `applyDeregisterJob`, `applyBatchDeregisterJob`, `handleJobDeregister`, `applyUpdateEval`, `upsertEvals`, `handleUpsertedEvals`, `handleUpsertedEval`, `applyDeleteEval`, `applyAllocUpdate`, `applyAllocClientUpdate`, `applyAllocUpdateDesiredTransition`, `applyReconcileSummaries`, `applyUpsertNodeEvent`, `applyPlanResults`, `applyDeploymentStatusUpdate`, `applyDeploymentPromotion`, `applyDeploymentAllocHealth`, `applyDeploymentDelete`, `applyJobVersionTag`, `applyJobStability`, `applyACLPolicyUpsert`, `applyACLPolicyDelete`, `applyACLTokenUpsert`, `applyACLTokenDelete`, `applyACLTokenBootstrap`, `applyOneTimeTokenUpsert`, `applyOneTimeTokenDelete`, `applyOneTimeTokenExpire`, `applyAutopilotUpdate`, `applySchedulerConfigUpdate`, `applyCSIVolumeRegister`, `applyCSIVolumeDeregister`, `applyCSIVolumeBatchClaim`, `applyCSIVolumeClaim`, `applyCSIPluginDelete`, `applyNamespaceUpsert`, `applyNamespaceDelete`, `Snapshot`, `Restore`, `RestoreWithFilter`, `restoreImpl`, `failLeakedDeployments`, `reconcileQueuedAllocations`, `applyUpsertScalingEvent`, `applyUpsertServiceRegistrations`, `applyDeleteServiceRegistrationByID`, `applyDeleteServiceRegistrationByNodeID`, `applyACLRolesUpsert`, `applyACLRolesDeleteByID`, `applyACLAuthMethodsUpsert`, `applyACLAuthMethodsDelete`, `applyACLBindingRulesUpsert`, `applyACLBindingRulesDelete`, `applyVariableOperation`, `applyRootKeyMetaUpsert`, `applyWrappedRootKeysUpsert`, `applyWrappedRootKeysDelete`, `applyHostVolumeRegister`, `applyHostVolumeDelete`, `applyTaskGroupHostVolumeClaimDelete`

### nomadSnapshot

**定义位置**：[L160](file:///d:/claude/nomad/nomad/fsm.go#L160)

**类型**：struct

```go
	snap *state.StateSnapshot
```

**关联方法**（30 个）：`Persist`, `persistIndexes`, `persistNodes`, `persistNodePools`, `persistJobs`, `persistEvals`, `persistAllocs`, `persistPeriodicLaunches`, `persistJobSummaries`, `persistJobVersions`, `persistDeployments`, `persistACLPolicies`, `persistACLTokens`, `persistNamespaces`, `persistSchedulerConfig`, `persistClusterMetadata`, `persistScalingPolicies`, `persistScalingEvents`, `persistCSIPlugins`, `persistCSIVolumes`, `persistServiceRegistrations`, `persistVariables`, `persistVariablesQuotas`, `persistWrappedRootKeys`, `persistACLRoles`, `persistACLAuthMethods`, `persistACLBindingRules`, `persistJobSubmissions`, `persistHostVolumes`, `Release`

### SnapshotHeader

**定义位置**：[L165](file:///d:/claude/nomad/nomad/fsm.go#L165)

**类型**：struct

### FSMConfig

**定义位置**：[L169](file:///d:/claude/nomad/nomad/fsm.go#L169)

**类型**：struct

```go
	EvalBroker *EvalBroker
	Periodic *PeriodicDispatch
	Blocked *BlockedEvals
	Encrypter *Encrypter
	Logger hclog.Logger
	Region string
	EnableEventBroker bool
	EventBufferSize int64
	JobTrackedVersions int
```

### FSMFilter

**定义位置**：[L2351](file:///d:/claude/nomad/nomad/fsm.go#L2351)

**类型**：struct

```go
	evaluator *bexpr.Evaluator
```

**关联方法**（1 个）：`Include`

### TimeTableEntry

**定义位置**：[L3403](file:///d:/claude/nomad/nomad/fsm.go#L3403)

**类型**：struct

```go
	Index uint64
	Time time.Time
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `NodeSnapshot` | `0` |
| `JobSnapshot` | `1` |
| `IndexSnapshot` | `2` |
| `EvalSnapshot` | `3` |
| `AllocSnapshot` | `4` |
| `PeriodicLaunchSnapshot` | `6` |
| `JobSummarySnapshot` | `7` |
| `JobVersionSnapshot` | `9` |
| `DeploymentSnapshot` | `10` |
| `ACLPolicySnapshot` | `11` |
| `ACLTokenSnapshot` | `12` |
| `SchedulerConfigSnapshot` | `13` |
| `ClusterMetadataSnapshot` | `14` |
| `ServiceIdentityTokenAccessorSnapshot` | `15` |
| `ScalingPolicySnapshot` | `16` |
| `CSIPluginSnapshot` | `17` |
| `CSIVolumeSnapshot` | `18` |
| `ScalingEventsSnapshot` | `19` |
| `ServiceRegistrationSnapshot` | `21` |
| `VariablesSnapshot` | `22` |
| `VariablesQuotaSnapshot` | `23` |
| `RootKeyMetaSnapshot` | `24` |
| `ACLRoleSnapshot` | `25` |
| `ACLAuthMethodSnapshot` | `26` |
| `ACLBindingRuleSnapshot` | `27` |
| `NodePoolSnapshot` | `28` |
| `JobSubmissionSnapshot` | `29` |
| `RootKeySnapshot` | `30` |
| `HostVolumeSnapshot` | `31` |
| `TimeTableSnapshot` | `5` |
| `VaultAccessorSnapshot` | `8` |
| `EventSinkSnapshot` | `20` |
| `NamespaceSnapshot` | `64` |

### 变量

| 名称 | 值 |
|------|----|
| `snapshotTypeStrings` | `map[SnapshotType]string{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewFSM` | - | `config *FSMConfig` | `*nomadFSM, error` | [L202](file:///d:/claude/nomad/nomad/fsm.go#L202) |
| `Close` | `n *nomadFSM` | - | `error` | [L238](file:///d:/claude/nomad/nomad/fsm.go#L238) |
| `State` | `n *nomadFSM` | - | `*state.StateStore` | [L244](file:///d:/claude/nomad/nomad/fsm.go#L244) |
| `Apply` | `n *nomadFSM` | `log *raft.Log` | `interface{}` | [L250](file:///d:/claude/nomad/nomad/fsm.go#L250) |
| `applyClusterMetadata` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L416](file:///d:/claude/nomad/nomad/fsm.go#L416) |
| `applyUpsertNode` | `n *nomadFSM` | `reqType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L434](file:///d:/claude/nomad/nomad/fsm.go#L434) |
| `applyDeregisterNode` | `n *nomadFSM` | `reqType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L464](file:///d:/claude/nomad/nomad/fsm.go#L464) |
| `applyDeregisterNodeBatch` | `n *nomadFSM` | `reqType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L479](file:///d:/claude/nomad/nomad/fsm.go#L479) |
| `applyStatusUpdate` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L494](file:///d:/claude/nomad/nomad/fsm.go#L494) |
| `applyDrainUpdate` | `n *nomadFSM` | `reqType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L523](file:///d:/claude/nomad/nomad/fsm.go#L523) |
| `applyBatchDrainUpdate` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L554](file:///d:/claude/nomad/nomad/fsm.go#L554) |
| `applyNodeEligibilityUpdate` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L597](file:///d:/claude/nomad/nomad/fsm.go#L597) |
| `applyNodePoolUpsert` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L627](file:///d:/claude/nomad/nomad/fsm.go#L627) |
| `applyNodePoolDelete` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L651](file:///d:/claude/nomad/nomad/fsm.go#L651) |
| `applyUpsertJob` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L666](file:///d:/claude/nomad/nomad/fsm.go#L666) |
| `applyDeregisterJob` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L813](file:///d:/claude/nomad/nomad/fsm.go#L813) |
| `applyBatchDeregisterJob` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L849](file:///d:/claude/nomad/nomad/fsm.go#L849) |
| `handleJobDeregister` | `n *nomadFSM` | `index uint64, jobID string, namespace string, purge bool, submitTime int64, ...` | `error` | [L871](file:///d:/claude/nomad/nomad/fsm.go#L871) |
| `applyUpdateEval` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L939](file:///d:/claude/nomad/nomad/fsm.go#L939) |
| `upsertEvals` | `n *nomadFSM` | `msgType structs.MessageType, index uint64, evals []*structs.Evaluation` | `error` | [L950](file:///d:/claude/nomad/nomad/fsm.go#L950) |
| `handleUpsertedEvals` | `n *nomadFSM` | `evals []*structs.Evaluation` | - | [L962](file:///d:/claude/nomad/nomad/fsm.go#L962) |
| `handleUpsertedEval` | `n *nomadFSM` | `eval *structs.Evaluation` | - | [L969](file:///d:/claude/nomad/nomad/fsm.go#L969) |
| `applyDeleteEval` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L986](file:///d:/claude/nomad/nomad/fsm.go#L986) |
| `applyAllocUpdate` | `n *nomadFSM` | `_ structs.MessageType, _ []byte, _ uint64` | `interface{}` | [L1011](file:///d:/claude/nomad/nomad/fsm.go#L1011) |
| `applyAllocClientUpdate` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1015](file:///d:/claude/nomad/nomad/fsm.go#L1015) |
| `applyAllocUpdateDesiredTransition` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1101](file:///d:/claude/nomad/nomad/fsm.go#L1101) |
| `applyReconcileSummaries` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L1118](file:///d:/claude/nomad/nomad/fsm.go#L1118) |
| `applyUpsertNodeEvent` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1126](file:///d:/claude/nomad/nomad/fsm.go#L1126) |
| `applyPlanResults` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1142](file:///d:/claude/nomad/nomad/fsm.go#L1142) |
| `applyDeploymentStatusUpdate` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1161](file:///d:/claude/nomad/nomad/fsm.go#L1161) |
| `applyDeploymentPromotion` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1178](file:///d:/claude/nomad/nomad/fsm.go#L1178) |
| `applyDeploymentAllocHealth` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1196](file:///d:/claude/nomad/nomad/fsm.go#L1196) |
| `applyDeploymentDelete` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L1213](file:///d:/claude/nomad/nomad/fsm.go#L1213) |
| `applyJobVersionTag` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L1229](file:///d:/claude/nomad/nomad/fsm.go#L1229) |
| `applyJobStability` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L1245](file:///d:/claude/nomad/nomad/fsm.go#L1245) |
| `applyACLPolicyUpsert` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1261](file:///d:/claude/nomad/nomad/fsm.go#L1261) |
| `applyACLPolicyDelete` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1276](file:///d:/claude/nomad/nomad/fsm.go#L1276) |
| `applyACLTokenUpsert` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1291](file:///d:/claude/nomad/nomad/fsm.go#L1291) |
| `applyACLTokenDelete` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1306](file:///d:/claude/nomad/nomad/fsm.go#L1306) |
| `applyACLTokenBootstrap` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1321](file:///d:/claude/nomad/nomad/fsm.go#L1321) |
| `applyOneTimeTokenUpsert` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1336](file:///d:/claude/nomad/nomad/fsm.go#L1336) |
| `applyOneTimeTokenDelete` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1351](file:///d:/claude/nomad/nomad/fsm.go#L1351) |
| `applyOneTimeTokenExpire` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L1366](file:///d:/claude/nomad/nomad/fsm.go#L1366) |
| `applyAutopilotUpdate` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L1380](file:///d:/claude/nomad/nomad/fsm.go#L1380) |
| `applySchedulerConfigUpdate` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L1397](file:///d:/claude/nomad/nomad/fsm.go#L1397) |
| `applyCSIVolumeRegister` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L1416](file:///d:/claude/nomad/nomad/fsm.go#L1416) |
| `applyCSIVolumeDeregister` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L1431](file:///d:/claude/nomad/nomad/fsm.go#L1431) |
| `applyCSIVolumeBatchClaim` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L1446](file:///d:/claude/nomad/nomad/fsm.go#L1446) |
| `applyCSIVolumeClaim` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L1464](file:///d:/claude/nomad/nomad/fsm.go#L1464) |
| `applyCSIPluginDelete` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L1478](file:///d:/claude/nomad/nomad/fsm.go#L1478) |
| `applyNamespaceUpsert` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L1497](file:///d:/claude/nomad/nomad/fsm.go#L1497) |
| `applyNamespaceDelete` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L1533](file:///d:/claude/nomad/nomad/fsm.go#L1533) |
| `Snapshot` | `n *nomadFSM` | - | `raft.FSMSnapshot, error` | [L1548](file:///d:/claude/nomad/nomad/fsm.go#L1548) |
| `Restore` | `n *nomadFSM` | `old io.ReadCloser` | `error` | [L1563](file:///d:/claude/nomad/nomad/fsm.go#L1563) |
| `RestoreWithFilter` | `n *nomadFSM` | `old io.ReadCloser, filter *FSMFilter` | `error` | [L1570](file:///d:/claude/nomad/nomad/fsm.go#L1570) |
| `restoreImpl` | `n *nomadFSM` | `old io.ReadCloser, filter *FSMFilter` | `error` | [L1574](file:///d:/claude/nomad/nomad/fsm.go#L1574) |
| `failLeakedDeployments` | `n *nomadFSM` | `store *state.StateStore` | `error` | [L2042](file:///d:/claude/nomad/nomad/fsm.go#L2042) |
| `reconcileQueuedAllocations` | `n *nomadFSM` | `index uint64` | `error` | [L2095](file:///d:/claude/nomad/nomad/fsm.go#L2095) |
| `applyUpsertScalingEvent` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L2201](file:///d:/claude/nomad/nomad/fsm.go#L2201) |
| `applyUpsertServiceRegistrations` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L2216](file:///d:/claude/nomad/nomad/fsm.go#L2216) |
| `applyDeleteServiceRegistrationByID` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L2231](file:///d:/claude/nomad/nomad/fsm.go#L2231) |
| `applyDeleteServiceRegistrationByNodeID` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L2246](file:///d:/claude/nomad/nomad/fsm.go#L2246) |
| `applyACLRolesUpsert` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L2261](file:///d:/claude/nomad/nomad/fsm.go#L2261) |
| `applyACLRolesDeleteByID` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L2276](file:///d:/claude/nomad/nomad/fsm.go#L2276) |
| `applyACLAuthMethodsUpsert` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L2291](file:///d:/claude/nomad/nomad/fsm.go#L2291) |
| `applyACLAuthMethodsDelete` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L2306](file:///d:/claude/nomad/nomad/fsm.go#L2306) |
| `applyACLBindingRulesUpsert` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L2321](file:///d:/claude/nomad/nomad/fsm.go#L2321) |
| `applyACLBindingRulesDelete` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L2336](file:///d:/claude/nomad/nomad/fsm.go#L2336) |
| `NewFSMFilter` | - | `expr string` | `*FSMFilter, error` | [L2355](file:///d:/claude/nomad/nomad/fsm.go#L2355) |
| `Include` | `f *FSMFilter` | `item interface{}` | `bool` | [L2366](file:///d:/claude/nomad/nomad/fsm.go#L2366) |
| `applyVariableOperation` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `any` | [L2377](file:///d:/claude/nomad/nomad/fsm.go#L2377) |
| `applyRootKeyMetaUpsert` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L2405](file:///d:/claude/nomad/nomad/fsm.go#L2405) |
| `applyWrappedRootKeysUpsert` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L2429](file:///d:/claude/nomad/nomad/fsm.go#L2429) |
| `applyWrappedRootKeysDelete` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L2451](file:///d:/claude/nomad/nomad/fsm.go#L2451) |
| `applyHostVolumeRegister` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L2470](file:///d:/claude/nomad/nomad/fsm.go#L2470) |
| `applyHostVolumeDelete` | `n *nomadFSM` | `msgType structs.MessageType, buf []byte, index uint64` | `interface{}` | [L2485](file:///d:/claude/nomad/nomad/fsm.go#L2485) |
| `applyTaskGroupHostVolumeClaimDelete` | `n *nomadFSM` | `buf []byte, index uint64` | `interface{}` | [L2500](file:///d:/claude/nomad/nomad/fsm.go#L2500) |
| `Persist` | `s *nomadSnapshot` | `sink raft.SnapshotSink` | `error` | [L2515](file:///d:/claude/nomad/nomad/fsm.go#L2515) |
| `persistIndexes` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L2647](file:///d:/claude/nomad/nomad/fsm.go#L2647) |
| `persistNodes` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L2674](file:///d:/claude/nomad/nomad/fsm.go#L2674) |
| `persistNodePools` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L2702](file:///d:/claude/nomad/nomad/fsm.go#L2702) |
| `persistJobs` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L2723](file:///d:/claude/nomad/nomad/fsm.go#L2723) |
| `persistEvals` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L2751](file:///d:/claude/nomad/nomad/fsm.go#L2751) |
| `persistAllocs` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L2779](file:///d:/claude/nomad/nomad/fsm.go#L2779) |
| `persistPeriodicLaunches` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L2807](file:///d:/claude/nomad/nomad/fsm.go#L2807) |
| `persistJobSummaries` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L2835](file:///d:/claude/nomad/nomad/fsm.go#L2835) |
| `persistJobVersions` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L2860](file:///d:/claude/nomad/nomad/fsm.go#L2860) |
| `persistDeployments` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L2888](file:///d:/claude/nomad/nomad/fsm.go#L2888) |
| `persistACLPolicies` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L2916](file:///d:/claude/nomad/nomad/fsm.go#L2916) |
| `persistACLTokens` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L2944](file:///d:/claude/nomad/nomad/fsm.go#L2944) |
| `persistNamespaces` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L2973](file:///d:/claude/nomad/nomad/fsm.go#L2973) |
| `persistSchedulerConfig` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3000](file:///d:/claude/nomad/nomad/fsm.go#L3000) |
| `persistClusterMetadata` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3018](file:///d:/claude/nomad/nomad/fsm.go#L3018) |
| `persistScalingPolicies` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3040](file:///d:/claude/nomad/nomad/fsm.go#L3040) |
| `persistScalingEvents` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3069](file:///d:/claude/nomad/nomad/fsm.go#L3069) |
| `persistCSIPlugins` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3096](file:///d:/claude/nomad/nomad/fsm.go#L3096) |
| `persistCSIVolumes` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3125](file:///d:/claude/nomad/nomad/fsm.go#L3125) |
| `persistServiceRegistrations` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3154](file:///d:/claude/nomad/nomad/fsm.go#L3154) |
| `persistVariables` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3178](file:///d:/claude/nomad/nomad/fsm.go#L3178) |
| `persistVariablesQuotas` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3201](file:///d:/claude/nomad/nomad/fsm.go#L3201) |
| `persistWrappedRootKeys` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3224](file:///d:/claude/nomad/nomad/fsm.go#L3224) |
| `persistACLRoles` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3247](file:///d:/claude/nomad/nomad/fsm.go#L3247) |
| `persistACLAuthMethods` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3272](file:///d:/claude/nomad/nomad/fsm.go#L3272) |
| `persistACLBindingRules` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3294](file:///d:/claude/nomad/nomad/fsm.go#L3294) |
| `persistJobSubmissions` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3315](file:///d:/claude/nomad/nomad/fsm.go#L3315) |
| `persistHostVolumes` | `s *nomadSnapshot` | `sink raft.SnapshotSink, encoder *codec.Encoder` | `error` | [L3336](file:///d:/claude/nomad/nomad/fsm.go#L3336) |
| `Release` | `s *nomadSnapshot` | - | - | [L3355](file:///d:/claude/nomad/nomad/fsm.go#L3355) |
| `ReadSnapshot` | - | `r io.Reader, handler func(...)` | `error` | [L3359](file:///d:/claude/nomad/nomad/fsm.go#L3359) |
| `String` | `s *SnapshotType` | - | `string` | [L3389](file:///d:/claude/nomad/nomad/fsm.go#L3389) |

## 5. 核心方法详解

### Close()

**签名**：`func (n *nomadFSM) Close() error`

**位置**：[L238](file:///d:/claude/nomad/nomad/fsm.go#L238)

### Apply()

**签名**：`func (n *nomadFSM) Apply(log *raft.Log) interface{}`

**位置**：[L250](file:///d:/claude/nomad/nomad/fsm.go#L250)

### Snapshot()

**签名**：`func (n *nomadFSM) Snapshot() raft.FSMSnapshot, error`

**位置**：[L1548](file:///d:/claude/nomad/nomad/fsm.go#L1548)

### Restore()

**签名**：`func (n *nomadFSM) Restore(old io.ReadCloser) error`

**位置**：[L1563](file:///d:/claude/nomad/nomad/fsm.go#L1563)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `reflect` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/scheduler` | 内部包 |
| `github.com/hashicorp/nomad/scheduler/structs` | 内部包 |
| `github.com/hashicorp/go-bexpr` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/go-msgpack/v2/codec` | 第三方库 |
| `github.com/hashicorp/raft` | 第三方库 |

## 7. 设计模式与技术特点

- **Raft 共识**：使用 HashiCorp Raft 库实现分布式共识，保证状态一致性
- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [fsm_test.go](file:///d:/claude/nomad/nomad/fsm_test.go) | 对应测试文件 |

