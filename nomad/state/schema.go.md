# schema.go 代码说明文档

> 文件路径：[nomad/state/schema.go](file:///d:/claude/nomad/nomad/state/schema.go)
> 总行数：1699 行
> 所属包：`state`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `state` 包，定义结构体类型、包含 48 个方法/函数。

## 2. 类型定义

### SchemaFactory

**定义位置**：[L59](file:///d:/claude/nomad/nomad/state/schema.go#L59)

**中文说明**：SchemaFactory 是一个工厂，负责创建对象实例。

**类型定义**：`type SchemaFactory func(...)`

### SchemaFactories

**定义位置**：[L60](file:///d:/claude/nomad/nomad/state/schema.go#L60)

**类型定义**：`type SchemaFactories []SchemaFactory`

### ACLPolicyJobACLFieldIndex

**定义位置**：[L867](file:///d:/claude/nomad/nomad/state/schema.go#L867)

**中文说明**：ACLPolicyJobACLFieldIndex 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

**关联方法**（3 个）：`FromObject`, `FromArgs`, `PrefixFromArgs`

### ScalingPolicyTargetFieldIndex

**定义位置**：[L1150](file:///d:/claude/nomad/nomad/state/schema.go#L1150)

**中文说明**：ScalingPolicyTargetFieldIndex 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type ScalingPolicyTargetFieldIndex struct {
	Field string
	AllowMissing bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Field` | `string` | 字符串 |
| `AllowMissing` | `bool` | 布尔值 |

**关联方法**（3 个）：`FromObject`, `FromArgs`, `PrefixFromArgs`

### variableKeyIDFieldIndexer

**定义位置**：[L1446](file:///d:/claude/nomad/nomad/state/schema.go#L1446)

**中文说明**：variableKeyIDFieldIndexer 是一个结构体，封装相关数据和状态。

**类型**：struct

**关联方法**（3 个）：`FromArgs`, `PrefixFromArgs`, `FromObject`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `tableIndex` | `—` | `"index"` | — |
| `TableNamespaces` | `—` | `"namespaces"` | — |
| `TableNodes` | `—` | `"nodes"` | — |
| `TableNodePools` | `—` | `"node_pools"` | — |
| `TableServiceRegistrations` | `—` | `"service_registrations"` | — |
| `TableVariables` | `—` | `"variables"` | — |
| `TableVariablesQuotas` | `—` | `"variables_quota"` | — |
| `TableRootKeys` | `—` | `"root_keys"` | — |
| `TableACLRoles` | `—` | `"acl_roles"` | — |
| `TableACLAuthMethods` | `—` | `"acl_auth_methods"` | — |
| `TableACLBindingRules` | `—` | `"acl_binding_rules"` | — |
| `TableAllocs` | `—` | `"allocs"` | — |
| `TableJobSubmission` | `—` | `"job_submission"` | — |
| `TableHostVolumes` | `—` | `"host_volumes"` | — |
| `TableCSIVolumes` | `—` | `"csi_volumes"` | — |
| `TableCSIPlugins` | `—` | `"csi_plugins"` | — |
| `TableTaskGroupHostVolumeClaim` | `—` | `"task_volume"` | — |
| `indexID` | `—` | `"id"` | — |
| `indexJob` | `—` | `"job"` | — |
| `indexNodeID` | `—` | `"node_id"` | — |
| `indexAllocID` | `—` | `"alloc_id"` | — |
| `indexServiceName` | `—` | `"service_name"` | — |
| `indexExpiresGlobal` | `—` | `"expires-global"` | — |
| `indexExpiresLocal` | `—` | `"expires-local"` | — |
| `indexKeyID` | `—` | `"key_id"` | — |
| `indexPath` | `—` | `"path"` | — |
| `indexName` | `—` | `"name"` | — |
| `indexSigningKey` | `—` | `"signing_key"` | — |
| `indexAuthMethod` | `—` | `"auth_method"` | — |
| `indexNodePool` | `—` | `"node_pool"` | — |
| `indexClaimID` | `—` | `"claim_id"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `schemaFactories` | `SchemaFactories` | `` | — |
| `factoriesLock` | `sync.Mutex` | `` | — |
| `singletonRecord` | `—` | `&memdb.ConditionalIndex{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `RegisterSchemaFactories` | - | `factories ...SchemaFactory` | `` | [L63](file:///d:/claude/nomad/nomad/state/schema.go#L63) |
| `GetFactories` | - | `` | `SchemaFactories` | [L69](file:///d:/claude/nomad/nomad/state/schema.go#L69) |
| `init` | - | `` | `` | [L73](file:///d:/claude/nomad/nomad/state/schema.go#L73) |
| `stateStoreSchema` | - | `` | `*memdb.DBSchema` | [L111](file:///d:/claude/nomad/nomad/state/schema.go#L111) |
| `indexTableSchema` | - | `` | `*memdb.TableSchema` | [L129](file:///d:/claude/nomad/nomad/state/schema.go#L129) |
| `nodeTableSchema` | - | `` | `*memdb.TableSchema` | [L148](file:///d:/claude/nomad/nomad/state/schema.go#L148) |
| `nodePoolTableSchema` | - | `` | `*memdb.TableSchema` | [L193](file:///d:/claude/nomad/nomad/state/schema.go#L193) |
| `jobTableSchema` | - | `` | `*memdb.TableSchema` | [L213](file:///d:/claude/nomad/nomad/state/schema.go#L213) |
| `jobSummarySchema` | - | `` | `*memdb.TableSchema` | [L291](file:///d:/claude/nomad/nomad/state/schema.go#L291) |
| `jobVersionSchema` | - | `` | `*memdb.TableSchema` | [L320](file:///d:/claude/nomad/nomad/state/schema.go#L320) |
| `jobSubmissionSchema` | - | `` | `*memdb.TableSchema` | [L354](file:///d:/claude/nomad/nomad/state/schema.go#L354) |
| `jobIsGCable` | - | `obj interface{}` | `bool, error` | [L389](file:///d:/claude/nomad/nomad/state/schema.go#L389) |
| `jobIsPeriodic` | - | `obj interface{}` | `bool, error` | [L432](file:///d:/claude/nomad/nomad/state/schema.go#L432) |
| `deploymentSchema` | - | `` | `*memdb.TableSchema` | [L446](file:///d:/claude/nomad/nomad/state/schema.go#L446) |
| `periodicLaunchTableSchema` | - | `` | `*memdb.TableSchema` | [L543](file:///d:/claude/nomad/nomad/state/schema.go#L543) |
| `evalTableSchema` | - | `` | `*memdb.TableSchema` | [L576](file:///d:/claude/nomad/nomad/state/schema.go#L576) |
| `allocTableSchema` | - | `` | `*memdb.TableSchema` | [L673](file:///d:/claude/nomad/nomad/state/schema.go#L673) |
| `aclPolicyTableSchema` | - | `` | `*memdb.TableSchema` | [L843](file:///d:/claude/nomad/nomad/state/schema.go#L843) |
| `FromObject` | `a *ACLPolicyJobACLFieldIndex` | `obj interface{}` | `bool, []byte, error` | [L871](file:///d:/claude/nomad/nomad/state/schema.go#L871) |
| `FromArgs` | `a *ACLPolicyJobACLFieldIndex` | `args ...interface{}` | `[]byte, error` | [L896](file:///d:/claude/nomad/nomad/state/schema.go#L896) |
| `PrefixFromArgs` | `a *ACLPolicyJobACLFieldIndex` | `args ...interface{}` | `[]byte, error` | [L923](file:///d:/claude/nomad/nomad/state/schema.go#L923) |
| `aclTokenTableSchema` | - | `` | `*memdb.TableSchema` | [L939](file:///d:/claude/nomad/nomad/state/schema.go#L939) |
| `indexExpiresLocalFromACLToken` | - | `raw interface{}` | `[]byte, error` | [L1004](file:///d:/claude/nomad/nomad/state/schema.go#L1004) |
| `indexExpiresGlobalFromACLToken` | - | `raw interface{}` | `[]byte, error` | [L1008](file:///d:/claude/nomad/nomad/state/schema.go#L1008) |
| `indexExpiresFromACLToken` | - | `raw interface{}, global bool` | `[]byte, error` | [L1016](file:///d:/claude/nomad/nomad/state/schema.go#L1016) |
| `oneTimeTokenTableSchema` | - | `` | `*memdb.TableSchema` | [L1038](file:///d:/claude/nomad/nomad/state/schema.go#L1038) |
| `schedulerConfigTableSchema` | - | `` | `*memdb.TableSchema` | [L1070](file:///d:/claude/nomad/nomad/state/schema.go#L1070) |
| `clusterMetaTableSchema` | - | `` | `*memdb.TableSchema` | [L1085](file:///d:/claude/nomad/nomad/state/schema.go#L1085) |
| `csiVolumeTableSchema` | - | `` | `*memdb.TableSchema` | [L1100](file:///d:/claude/nomad/nomad/state/schema.go#L1100) |
| `csiPluginTableSchema` | - | `` | `*memdb.TableSchema` | [L1132](file:///d:/claude/nomad/nomad/state/schema.go#L1132) |
| `FromObject` | `s *ScalingPolicyTargetFieldIndex` | `obj interface{}` | `bool, []byte, error` | [L1160](file:///d:/claude/nomad/nomad/state/schema.go#L1160) |
| `FromArgs` | `s *ScalingPolicyTargetFieldIndex` | `args ...interface{}` | `[]byte, error` | [L1181](file:///d:/claude/nomad/nomad/state/schema.go#L1181) |
| `PrefixFromArgs` | `s *ScalingPolicyTargetFieldIndex` | `args ...interface{}` | `[]byte, error` | [L1195](file:///d:/claude/nomad/nomad/state/schema.go#L1195) |
| `scalingPolicyTableSchema` | - | `` | `*memdb.TableSchema` | [L1210](file:///d:/claude/nomad/nomad/state/schema.go#L1210) |
| `scalingEventTableSchema` | - | `` | `*memdb.TableSchema` | [L1280](file:///d:/claude/nomad/nomad/state/schema.go#L1280) |
| `namespaceTableSchema` | - | `` | `*memdb.TableSchema` | [L1308](file:///d:/claude/nomad/nomad/state/schema.go#L1308) |
| `serviceRegistrationsTableSchema` | - | `` | `*memdb.TableSchema` | [L1334](file:///d:/claude/nomad/nomad/state/schema.go#L1334) |
| `variablesTableSchema` | - | `` | `*memdb.TableSchema` | [L1410](file:///d:/claude/nomad/nomad/state/schema.go#L1410) |
| `FromArgs` | `s *variableKeyIDFieldIndexer` | `args ...interface{}` | `[]byte, error` | [L1450](file:///d:/claude/nomad/nomad/state/schema.go#L1450) |
| `PrefixFromArgs` | `s *variableKeyIDFieldIndexer` | `args ...interface{}` | `[]byte, error` | [L1465](file:///d:/claude/nomad/nomad/state/schema.go#L1465) |
| `FromObject` | `s *variableKeyIDFieldIndexer` | `obj interface{}` | `bool, []byte, error` | [L1482](file:///d:/claude/nomad/nomad/state/schema.go#L1482) |
| `variablesQuotasTableSchema` | - | `` | `*memdb.TableSchema` | [L1500](file:///d:/claude/nomad/nomad/state/schema.go#L1500) |
| `wrappedRootKeySchema` | - | `` | `*memdb.TableSchema` | [L1518](file:///d:/claude/nomad/nomad/state/schema.go#L1518) |
| `aclRolesTableSchema` | - | `` | `*memdb.TableSchema` | [L1535](file:///d:/claude/nomad/nomad/state/schema.go#L1535) |
| `aclAuthMethodsTableSchema` | - | `` | `*memdb.TableSchema` | [L1559](file:///d:/claude/nomad/nomad/state/schema.go#L1559) |
| `bindingRulesTableSchema` | - | `` | `*memdb.TableSchema` | [L1575](file:///d:/claude/nomad/nomad/state/schema.go#L1575) |
| `hostVolumeTableSchema` | - | `` | `*memdb.TableSchema` | [L1601](file:///d:/claude/nomad/nomad/state/schema.go#L1601) |
| `taskGroupHostVolumeClaimSchema` | - | `` | `*memdb.TableSchema` | [L1657](file:///d:/claude/nomad/nomad/state/schema.go#L1657) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/nomad/state/indexer` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-memdb` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [schema_test.go](file:///d:/claude/nomad/nomad/state/schema_test.go) | 对应测试文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/state/autopilot.go) | 同目录源文件 |
| [events.go](file:///d:/claude/nomad/nomad/state/events.go) | 同目录源文件 |
| [events_ce.go](file:///d:/claude/nomad/nomad/state/events_ce.go) | 同目录源文件 |
| [helpers.go](file:///d:/claude/nomad/nomad/state/helpers.go) | 同目录源文件 |
| [iterator.go](file:///d:/claude/nomad/nomad/state/iterator.go) | 同目录源文件 |

