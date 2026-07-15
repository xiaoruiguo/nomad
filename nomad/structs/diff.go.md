# diff.go 代码说明文档

> 文件路径：[structs/diff.go](file:///d:/claude/nomad/nomad/structs/diff.go)
> 总行数：3463 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### DiffableWithID

**定义位置**：[L21](file:///d:/claude/nomad/nomad/structs/diff.go#L21)

**类型**：interface

```go
	DiffID
```

### DiffType

**定义位置**：[L28](file:///d:/claude/nomad/nomad/structs/diff.go#L28)

**类型定义**：`string`

**关联方法**（1 个）：`Less`

### JobDiff

**定义位置**：[L62](file:///d:/claude/nomad/nomad/structs/diff.go#L62)

**类型**：struct

```go
	Type DiffType
	ID string
	Fields []*FieldDiff
	Objects []*ObjectDiff
	TaskGroups []*TaskGroupDiff
```

**关联方法**（1 个）：`GoString`

### TaskGroupDiff

**定义位置**：[L210](file:///d:/claude/nomad/nomad/structs/diff.go#L210)

**类型**：struct

```go
	Type DiffType
	Name string
	Fields []*FieldDiff
	Objects []*ObjectDiff
	Tasks []*TaskDiff
	Updates map[string]uint64
```

**关联方法**（1 个）：`GoString`

### TaskGroupDiffs

**定义位置**：[L425](file:///d:/claude/nomad/nomad/structs/diff.go#L425)

**类型定义**：`[]*TaskGroupDiff`

**关联方法**（3 个）：`Len`, `Swap`, `Less`

### TaskDiff

**定义位置**：[L432](file:///d:/claude/nomad/nomad/structs/diff.go#L432)

**类型**：struct

```go
	Type DiffType
	Name string
	Fields []*FieldDiff
	Objects []*ObjectDiff
	Annotations []string
```

**关联方法**（1 个）：`GoString`

### TaskDiffs

**定义位置**：[L773](file:///d:/claude/nomad/nomad/structs/diff.go#L773)

**类型定义**：`[]*TaskDiff`

**关联方法**（3 个）：`Len`, `Swap`, `Less`

### ObjectDiff

**定义位置**：[L3105](file:///d:/claude/nomad/nomad/structs/diff.go#L3105)

**类型**：struct

```go
	Type DiffType
	Name string
	Fields []*FieldDiff
	Objects []*ObjectDiff
```

**关联方法**（2 个）：`GoString`, `Less`

### ObjectDiffs

**定义位置**：[L3172](file:///d:/claude/nomad/nomad/structs/diff.go#L3172)

**类型定义**：`[]*ObjectDiff`

**关联方法**（3 个）：`Len`, `Swap`, `Less`

### FieldDiff

**定义位置**：[L3178](file:///d:/claude/nomad/nomad/structs/diff.go#L3178)

**类型**：struct

```go
	Type DiffType
	Name string
	Old, New string
	Annotations []string
```

**关联方法**（2 个）：`GoString`, `Less`

### FieldDiffs

**定义位置**：[L3240](file:///d:/claude/nomad/nomad/structs/diff.go#L3240)

**类型定义**：`[]*FieldDiff`

**关联方法**（3 个）：`Len`, `Swap`, `Less`

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `DiffTypeNone` | `"None"` |
| `DiffTypeAdded` | `"Added"` |
| `DiffTypeDeleted` | `"Deleted"` |
| `DiffTypeEdited` | `"Edited"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Less` | `d *DiffType` | `other DiffType` | `bool` | [L37](file:///d:/claude/nomad/nomad/structs/diff.go#L37) |
| `Diff` | `j *Job` | `other *Job, contextual bool` | `*JobDiff, error` | [L73](file:///d:/claude/nomad/nomad/structs/diff.go#L73) |
| `GoString` | `j *JobDiff` | - | `string` | [L191](file:///d:/claude/nomad/nomad/structs/diff.go#L191) |
| `Diff` | `tg *TaskGroup` | `other *TaskGroup, contextual bool` | `*TaskGroupDiff, error` | [L222](file:///d:/claude/nomad/nomad/structs/diff.go#L222) |
| `GoString` | `tg *TaskGroupDiff` | - | `string` | [L360](file:///d:/claude/nomad/nomad/structs/diff.go#L360) |
| `taskGroupDiffs` | - | `old []*TaskGroup, new []*TaskGroup, contextual bool` | `[]*TaskGroupDiff, error` | [L389](file:///d:/claude/nomad/nomad/structs/diff.go#L389) |
| `Len` | `tg *TaskGroupDiffs` | - | `int` | [L427](file:///d:/claude/nomad/nomad/structs/diff.go#L427) |
| `Swap` | `tg *TaskGroupDiffs` | `i int, j int` | - | [L428](file:///d:/claude/nomad/nomad/structs/diff.go#L428) |
| `Less` | `tg *TaskGroupDiffs` | `i int, j int` | `bool` | [L429](file:///d:/claude/nomad/nomad/structs/diff.go#L429) |
| `Diff` | `t *Task` | `other *Task, contextual bool` | `*TaskDiff, error` | [L442](file:///d:/claude/nomad/nomad/structs/diff.go#L442) |
| `secretsDiff` | - | `old *Secret, new *Secret, contextual bool` | `*ObjectDiff` | [L586](file:///d:/claude/nomad/nomad/structs/diff.go#L586) |
| `secretsDiffs` | - | `old []*Secret, new []*Secret, contextual bool` | `[]*ObjectDiff` | [L609](file:///d:/claude/nomad/nomad/structs/diff.go#L609) |
| `actionDiff` | - | `old *Action, new *Action, contextual bool` | `*ObjectDiff` | [L641](file:///d:/claude/nomad/nomad/structs/diff.go#L641) |
| `actionDiffs` | - | `old []*Action, new []*Action, contextual bool` | `[]*ObjectDiff` | [L674](file:///d:/claude/nomad/nomad/structs/diff.go#L674) |
| `scheduleDiff` | - | `old *TaskSchedule, new *TaskSchedule, contextual bool` | `*ObjectDiff` | [L703](file:///d:/claude/nomad/nomad/structs/diff.go#L703) |
| `GoString` | `t *TaskDiff` | - | `string` | [L716](file:///d:/claude/nomad/nomad/structs/diff.go#L716) |
| `taskDiffs` | - | `old []*Task, new []*Task, contextual bool` | `[]*TaskDiff, error` | [L737](file:///d:/claude/nomad/nomad/structs/diff.go#L737) |
| `Len` | `t *TaskDiffs` | - | `int` | [L775](file:///d:/claude/nomad/nomad/structs/diff.go#L775) |
| `Swap` | `t *TaskDiffs` | `i int, j int` | - | [L776](file:///d:/claude/nomad/nomad/structs/diff.go#L776) |
| `Less` | `t *TaskDiffs` | `i int, j int` | `bool` | [L777](file:///d:/claude/nomad/nomad/structs/diff.go#L777) |
| `scalingDiff` | - | `old *ScalingPolicy, new *ScalingPolicy, contextual bool` | `*ObjectDiff` | [L781](file:///d:/claude/nomad/nomad/structs/diff.go#L781) |
| `policyDiff` | - | `old map[string]interface{}, new map[string]interface{}, contextual bool` | `*ObjectDiff` | [L819](file:///d:/claude/nomad/nomad/structs/diff.go#L819) |
| `serviceDiff` | - | `old *Service, new *Service, contextual bool` | `*ObjectDiff` | [L841](file:///d:/claude/nomad/nomad/structs/diff.go#L841) |
| `serviceDiffs` | - | `old []*Service, new []*Service, contextual bool` | `[]*ObjectDiff` | [L898](file:///d:/claude/nomad/nomad/structs/diff.go#L898) |
| `findServiceMatch` | - | `service *Service, serviceIndex int, services []*Service, matches []int` | `int` | [L959](file:///d:/claude/nomad/nomad/structs/diff.go#L959) |
| `serviceCheckDiff` | - | `old *ServiceCheck, new *ServiceCheck, contextual bool` | `*ObjectDiff` | [L1027](file:///d:/claude/nomad/nomad/structs/diff.go#L1027) |
| `checkHeaderDiff` | - | `old map[string][]string, new map[string][]string, contextual bool` | `*ObjectDiff` | [L1066](file:///d:/claude/nomad/nomad/structs/diff.go#L1066) |
| `checkRestartDiff` | - | `old *CheckRestart, new *CheckRestart, contextual bool` | `*ObjectDiff` | [L1091](file:///d:/claude/nomad/nomad/structs/diff.go#L1091) |
| `connectDiffs` | - | `old *ConsulConnect, new *ConsulConnect, contextual bool` | `*ObjectDiff` | [L1116](file:///d:/claude/nomad/nomad/structs/diff.go#L1116) |
| `connectGatewayDiff` | - | `prev *ConsulGateway, next *ConsulGateway, contextual bool` | `*ObjectDiff` | [L1160](file:///d:/claude/nomad/nomad/structs/diff.go#L1160) |
| `connectGatewayMeshDiff` | - | `prev *ConsulMeshConfigEntry, next *ConsulMeshConfigEntry, contextual bool` | `*ObjectDiff` | [L1210](file:///d:/claude/nomad/nomad/structs/diff.go#L1210) |
| `connectGatewayIngressDiff` | - | `prev *ConsulIngressConfigEntry, next *ConsulIngressConfigEntry, contextual b...` | `*ObjectDiff` | [L1230](file:///d:/claude/nomad/nomad/structs/diff.go#L1230) |
| `connectGatewayTerminatingDiff` | - | `prev *ConsulTerminatingConfigEntry, next *ConsulTerminatingConfigEntry, cont...` | `*ObjectDiff` | [L1268](file:///d:/claude/nomad/nomad/structs/diff.go#L1268) |
| `connectGatewayTerminatingLinkedServicesDiff` | - | `prev []*ConsulLinkedService, next []*ConsulLinkedService, contextual bool` | `[]*ObjectDiff` | [L1302](file:///d:/claude/nomad/nomad/structs/diff.go#L1302) |
| `connectGatewayTerminatingLinkedServiceDiff` | - | `prev *ConsulLinkedService, next *ConsulLinkedService, contextual bool` | `*ObjectDiff` | [L1335](file:///d:/claude/nomad/nomad/structs/diff.go#L1335) |
| `connectGatewayTLSConfigDiff` | - | `prev *ConsulGatewayTLSConfig, next *ConsulGatewayTLSConfig, contextual bool` | `*ObjectDiff` | [L1361](file:///d:/claude/nomad/nomad/structs/diff.go#L1361) |
| `connectGatewayIngressListenersDiff` | - | `prev []*ConsulIngressListener, next []*ConsulIngressListener, contextual bool` | `[]*ObjectDiff` | [L1400](file:///d:/claude/nomad/nomad/structs/diff.go#L1400) |
| `connectGatewayIngressListenerDiff` | - | `prev *ConsulIngressListener, next *ConsulIngressListener, contextual bool` | `*ObjectDiff` | [L1437](file:///d:/claude/nomad/nomad/structs/diff.go#L1437) |
| `connectGatewayIngressServicesDiff` | - | `prev []*ConsulIngressService, next []*ConsulIngressService, contextual bool` | `[]*ObjectDiff` | [L1471](file:///d:/claude/nomad/nomad/structs/diff.go#L1471) |
| `connectGatewayIngressServiceDiff` | - | `prev *ConsulIngressService, next *ConsulIngressService, contextual bool` | `*ObjectDiff` | [L1503](file:///d:/claude/nomad/nomad/structs/diff.go#L1503) |
| `connectGatewayHTTPHeaderModifiersDiff` | - | `prev *ConsulHTTPHeaderModifiers, next *ConsulHTTPHeaderModifiers, name strin...` | `*ObjectDiff` | [L1584](file:///d:/claude/nomad/nomad/structs/diff.go#L1584) |
| `connectGatewayProxyDiff` | - | `prev *ConsulGatewayProxy, next *ConsulGatewayProxy, contextual bool` | `*ObjectDiff` | [L1615](file:///d:/claude/nomad/nomad/structs/diff.go#L1615) |
| `connectGatewayProxyEnvoyBindAddrsDiff` | - | `prev map[string]*ConsulGatewayBindAddress, next map[string]*ConsulGatewayBin...` | `*ObjectDiff` | [L1668](file:///d:/claude/nomad/nomad/structs/diff.go#L1668) |
| `connectSidecarServiceDiff` | - | `old *ConsulSidecarService, new *ConsulSidecarService, contextual bool` | `*ObjectDiff` | [L1700](file:///d:/claude/nomad/nomad/structs/diff.go#L1700) |
| `sidecarTaskDiff` | - | `old *SidecarTask, new *SidecarTask, contextual bool` | `*ObjectDiff` | [L1733](file:///d:/claude/nomad/nomad/structs/diff.go#L1733) |
| `consulProxyDiff` | - | `old *ConsulProxy, new *ConsulProxy, contextual bool` | `*ObjectDiff` | [L1787](file:///d:/claude/nomad/nomad/structs/diff.go#L1787) |
| `consulProxyUpstreamsDiff` | - | `old []ConsulUpstream, new []ConsulUpstream, contextual bool` | `[]*ObjectDiff` | [L1833](file:///d:/claude/nomad/nomad/structs/diff.go#L1833) |
| `consulProxyUpstreamDiff` | - | `prev ConsulUpstream, next ConsulUpstream, contextual bool` | `*ObjectDiff` | [L1868](file:///d:/claude/nomad/nomad/structs/diff.go#L1868) |
| `consulProxyExposeDiff` | - | `prev *ConsulExposeConfig, next *ConsulExposeConfig, contextual bool` | `*ObjectDiff` | [L1899](file:///d:/claude/nomad/nomad/structs/diff.go#L1899) |
| `consulTProxyDiff` | - | `prev *ConsulTransparentProxy, next *ConsulTransparentProxy, contextual bool` | `*ObjectDiff` | [L1933](file:///d:/claude/nomad/nomad/structs/diff.go#L1933) |
| `serviceCheckDiffs` | - | `old []*ServiceCheck, new []*ServiceCheck, contextual bool` | `[]*ObjectDiff` | [L1987](file:///d:/claude/nomad/nomad/structs/diff.go#L1987) |
| `vaultDiff` | - | `old *Vault, new *Vault, contextual bool` | `*ObjectDiff` | [L2020](file:///d:/claude/nomad/nomad/structs/diff.go#L2020) |
| `waitConfigDiff` | - | `old *WaitConfig, new *WaitConfig, contextual bool` | `*ObjectDiff` | [L2046](file:///d:/claude/nomad/nomad/structs/diff.go#L2046) |
| `changeScriptDiff` | - | `old *ChangeScript, new *ChangeScript, contextual bool` | `*ObjectDiff` | [L2072](file:///d:/claude/nomad/nomad/structs/diff.go#L2072) |
| `templateDiff` | - | `old *Template, new *Template, contextual bool` | `*ObjectDiff` | [L2105](file:///d:/claude/nomad/nomad/structs/diff.go#L2105) |
| `templateDiffs` | - | `old []*Template, new []*Template, contextual bool` | `[]*ObjectDiff` | [L2165](file:///d:/claude/nomad/nomad/structs/diff.go#L2165) |
| `findTemplateMatch` | - | `template *Template, newTemplates []*Template, newTemplateMatches []int` | `int` | [L2223](file:///d:/claude/nomad/nomad/structs/diff.go#L2223) |
| `parameterizedJobDiff` | - | `old *ParameterizedJobConfig, new *ParameterizedJobConfig, contextual bool` | `*ObjectDiff` | [L2244](file:///d:/claude/nomad/nomad/structs/diff.go#L2244) |
| `multiregionDiff` | - | `old *Multiregion, new *Multiregion, contextual bool` | `*ObjectDiff` | [L2279](file:///d:/claude/nomad/nomad/structs/diff.go#L2279) |
| `multiregionRegionDiff` | - | `r *MultiregionRegion, other *MultiregionRegion, contextual bool` | `*ObjectDiff` | [L2339](file:///d:/claude/nomad/nomad/structs/diff.go#L2339) |
| `uiDiff` | - | `old *JobUIConfig, new *JobUIConfig, contextual bool` | `*ObjectDiff` | [L2398](file:///d:/claude/nomad/nomad/structs/diff.go#L2398) |
| `linkDiffs` | - | `old []*JobUILink, new []*JobUILink, contextual bool` | `[]*ObjectDiff` | [L2432](file:///d:/claude/nomad/nomad/structs/diff.go#L2432) |
| `linkDiff` | - | `old JobUILink, new JobUILink, contextual bool` | `*ObjectDiff` | [L2463](file:///d:/claude/nomad/nomad/structs/diff.go#L2463) |
| `volumeDiffs` | - | `oldVR map[string]*VolumeRequest, newVR map[string]*VolumeRequest, contextual...` | `[]*ObjectDiff` | [L2482](file:///d:/claude/nomad/nomad/structs/diff.go#L2482) |
| `volumeDiff` | - | `oldVR *VolumeRequest, newVR *VolumeRequest, contextual bool` | `*ObjectDiff` | [L2511](file:///d:/claude/nomad/nomad/structs/diff.go#L2511) |
| `volumeCSIMountOptionsDiff` | - | `oldMO *CSIMountOptions, newMO *CSIMountOptions, contextual bool` | `*ObjectDiff` | [L2546](file:///d:/claude/nomad/nomad/structs/diff.go#L2546) |
| `volumeMountsDiffs` | - | `oldMounts []*VolumeMount, newMounts []*VolumeMount, contextual bool` | `[]*ObjectDiff` | [L2577](file:///d:/claude/nomad/nomad/structs/diff.go#L2577) |
| `volumeMountDiff` | - | `oldMount *VolumeMount, newMount *VolumeMount, contextual bool` | `*ObjectDiff` | [L2606](file:///d:/claude/nomad/nomad/structs/diff.go#L2606) |
| `Diff` | `r *Resources` | `other *Resources, contextual bool` | `*ObjectDiff` | [L2631](file:///d:/claude/nomad/nomad/structs/diff.go#L2631) |
| `Diff` | `n *NetworkResource` | `other *NetworkResource, contextual bool` | `*ObjectDiff` | [L2674](file:///d:/claude/nomad/nomad/structs/diff.go#L2674) |
| `Diff` | `d *DNSConfig` | `other *DNSConfig, contextual bool` | `*ObjectDiff` | [L2720](file:///d:/claude/nomad/nomad/structs/diff.go#L2720) |
| `Diff` | `d *CNIConfig` | `other *CNIConfig, contextual bool` | `*ObjectDiff` | [L2760](file:///d:/claude/nomad/nomad/structs/diff.go#L2760) |
| `disconectStrategyDiffs` | - | `old *DisconnectStrategy, new *DisconnectStrategy, contextual bool` | `*ObjectDiff` | [L2774](file:///d:/claude/nomad/nomad/structs/diff.go#L2774) |
| `networkResourceDiffs` | - | `old []*NetworkResource, new []*NetworkResource, contextual bool` | `[]*ObjectDiff` | [L2800](file:///d:/claude/nomad/nomad/structs/diff.go#L2800) |
| `portDiffs` | - | `old []Port, new []Port, dynamic bool, contextual bool` | `[]*ObjectDiff` | [L2845](file:///d:/claude/nomad/nomad/structs/diff.go#L2845) |
| `Diff` | `n *NUMA` | `other *NUMA, contextual bool` | `*ObjectDiff` | [L2895](file:///d:/claude/nomad/nomad/structs/diff.go#L2895) |
| `Diff` | `r *RequestedDevice` | `other *RequestedDevice, contextual bool` | `*ObjectDiff` | [L2921](file:///d:/claude/nomad/nomad/structs/diff.go#L2921) |
| `requestedDevicesDiffs` | - | `old []*RequestedDevice, new []*RequestedDevice, contextual bool` | `[]*ObjectDiff` | [L2947](file:///d:/claude/nomad/nomad/structs/diff.go#L2947) |
| `configDiff` | - | `old map[string]interface{}, new map[string]interface{}, contextual bool` | `*ObjectDiff` | [L2982](file:///d:/claude/nomad/nomad/structs/diff.go#L2982) |
| `idSliceDiffs` | - | `old []*WorkloadIdentity, new []*WorkloadIdentity, contextual bool` | `[]*ObjectDiff` | [L3004](file:///d:/claude/nomad/nomad/structs/diff.go#L3004) |
| `weightsDiff` | - | `oldWeights *ServiceWeights, newWeights *ServiceWeights, contextual bool` | `*ObjectDiff` | [L3035](file:///d:/claude/nomad/nomad/structs/diff.go#L3035) |
| `idDiff` | - | `oldWI *WorkloadIdentity, newWI *WorkloadIdentity, contextual bool` | `*ObjectDiff` | [L3073](file:///d:/claude/nomad/nomad/structs/diff.go#L3073) |
| `GoString` | `o *ObjectDiff` | - | `string` | [L3112](file:///d:/claude/nomad/nomad/structs/diff.go#L3112) |
| `Less` | `o *ObjectDiff` | `other *ObjectDiff` | `bool` | [L3124](file:///d:/claude/nomad/nomad/structs/diff.go#L3124) |
| `Len` | `o *ObjectDiffs` | - | `int` | [L3174](file:///d:/claude/nomad/nomad/structs/diff.go#L3174) |
| `Swap` | `o *ObjectDiffs` | `i int, j int` | - | [L3175](file:///d:/claude/nomad/nomad/structs/diff.go#L3175) |
| `Less` | `o *ObjectDiffs` | `i int, j int` | `bool` | [L3176](file:///d:/claude/nomad/nomad/structs/diff.go#L3176) |
| `fieldDiff` | - | `old string, new string, name string, contextual bool` | `*FieldDiff` | [L3188](file:///d:/claude/nomad/nomad/structs/diff.go#L3188) |
| `GoString` | `f *FieldDiff` | - | `string` | [L3212](file:///d:/claude/nomad/nomad/structs/diff.go#L3212) |
| `Less` | `f *FieldDiff` | `other *FieldDiff` | `bool` | [L3221](file:///d:/claude/nomad/nomad/structs/diff.go#L3221) |
| `Len` | `f *FieldDiffs` | - | `int` | [L3242](file:///d:/claude/nomad/nomad/structs/diff.go#L3242) |
| `Swap` | `f *FieldDiffs` | `i int, j int` | - | [L3243](file:///d:/claude/nomad/nomad/structs/diff.go#L3243) |
| `Less` | `f *FieldDiffs` | `i int, j int` | `bool` | [L3244](file:///d:/claude/nomad/nomad/structs/diff.go#L3244) |
| `fieldDiffs` | - | `old map[string]string, new map[string]string, contextual bool` | `[]*FieldDiff` | [L3249](file:///d:/claude/nomad/nomad/structs/diff.go#L3249) |
| `stringSetDiff` | - | `old []string, new []string, name string, contextual bool` | `*ObjectDiff` | [L3273](file:///d:/claude/nomad/nomad/structs/diff.go#L3273) |
| `periodicDiff` | - | `old *PeriodicConfig, new *PeriodicConfig, contextual bool` | `*ObjectDiff` | [L3325](file:///d:/claude/nomad/nomad/structs/diff.go#L3325) |
| `primitiveObjectDiff` | - | `old interface{}, new interface{}, filter []string, name string, contextual b...` | `*ObjectDiff` | [L3360](file:///d:/claude/nomad/nomad/structs/diff.go#L3360) |
| `primitiveObjectSetDiff` | - | `old []interface{}, new []interface{}, filter []string, name string, contextu...` | `[]*ObjectDiff` | [L3401](file:///d:/claude/nomad/nomad/structs/diff.go#L3401) |
| `interfaceSlice` | - | `slice interface{}` | `[]interface{}` | [L3449](file:///d:/claude/nomad/nomad/structs/diff.go#L3449) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `net` | 标准库 |
| `reflect` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/flatmap` | 内部包 |
| `github.com/mitchellh/hashstructure` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [diff_test.go](file:///d:/claude/nomad/nomad/structs/diff_test.go) | 对应测试文件 |

