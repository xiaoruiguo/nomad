# event.go 代码说明文档

> 文件路径：[structs/event.go](file:///d:/claude/nomad/nomad/structs/event.go)
> 总行数：239 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### EventStreamRequest

**定义位置**：[L7](file:///d:/claude/nomad/nomad/structs/event.go#L7)

**类型**：struct

```go
	Topics map[Topic][]string
	Index int
	QueryOptions
```

### EventStreamWrapper

**定义位置**：[L14](file:///d:/claude/nomad/nomad/structs/event.go#L14)

**类型**：struct

```go
	Error *RpcError
	Event *EventJson
```

### Topic

**定义位置**：[L19](file:///d:/claude/nomad/nomad/structs/event.go#L19)

**类型定义**：`string`

### Event

**定义位置**：[L82](file:///d:/claude/nomad/nomad/structs/event.go#L82)

**类型**：struct

```go
	Topic Topic
	Type string
	Key string
	Namespace string
	FilterKeys []string
	Index uint64
	Payload interface{}
```

### Events

**定义位置**：[L108](file:///d:/claude/nomad/nomad/structs/event.go#L108)

**类型**：struct

```go
	Index uint64
	Events []Event
```

### EventJson

**定义位置**：[L114](file:///d:/claude/nomad/nomad/structs/event.go#L114)

**类型**：struct

```go
	Data []byte
```

**关联方法**（1 个）：`Copy`

### JobEvent

**定义位置**：[L127](file:///d:/claude/nomad/nomad/structs/event.go#L127)

**类型**：struct

```go
	Job *Job
	Deleted bool `json:",omitempty"`
```

### EvaluationEvent

**定义位置**：[L136](file:///d:/claude/nomad/nomad/structs/event.go#L136)

**类型**：struct

```go
	Evaluation *Evaluation
```

### AllocationEvent

**定义位置**：[L142](file:///d:/claude/nomad/nomad/structs/event.go#L142)

**类型**：struct

```go
	Allocation *Allocation
	Timeout bool `json:",omitempty"`
	TimeoutReason string `json:",omitempty"`
```

### DeploymentEvent

**定义位置**：[L155](file:///d:/claude/nomad/nomad/structs/event.go#L155)

**类型**：struct

```go
	Deployment *Deployment
```

### NodeStreamEvent

**定义位置**：[L160](file:///d:/claude/nomad/nomad/structs/event.go#L160)

**类型**：struct

```go
	Node *Node
```

### NodePoolEvent

**定义位置**：[L165](file:///d:/claude/nomad/nomad/structs/event.go#L165)

**类型**：struct

```go
	NodePool *NodePool
```

### ACLTokenEvent

**定义位置**：[L169](file:///d:/claude/nomad/nomad/structs/event.go#L169)

**类型**：struct

```go
	ACLToken *ACLToken
	secretID string
```

**关联方法**（1 个）：`SecretID`

### ServiceRegistrationStreamEvent

**定义位置**：[L176](file:///d:/claude/nomad/nomad/structs/event.go#L176)

**类型**：struct

```go
	Service *ServiceRegistration
```

### ACLPolicyEvent

**定义位置**：[L195](file:///d:/claude/nomad/nomad/structs/event.go#L195)

**类型**：struct

```go
	ACLPolicy *ACLPolicy
```

### ACLRoleStreamEvent

**定义位置**：[L201](file:///d:/claude/nomad/nomad/structs/event.go#L201)

**类型**：struct

```go
	ACLRole *ACLRole
```

### ACLAuthMethodEvent

**定义位置**：[L207](file:///d:/claude/nomad/nomad/structs/event.go#L207)

**类型**：struct

```go
	AuthMethod *ACLAuthMethod
```

### ACLBindingRuleEvent

**定义位置**：[L213](file:///d:/claude/nomad/nomad/structs/event.go#L213)

**类型**：struct

```go
	ACLBindingRule *ACLBindingRule
```

### HostVolumeEvent

**定义位置**：[L219](file:///d:/claude/nomad/nomad/structs/event.go#L219)

**类型**：struct

```go
	Volume *HostVolume
```

### CSIVolumeEvent

**定义位置**：[L225](file:///d:/claude/nomad/nomad/structs/event.go#L225)

**类型**：struct

```go
	Volume *CSIVolume
```

### CSIPluginEvent

**定义位置**：[L231](file:///d:/claude/nomad/nomad/structs/event.go#L231)

**类型**：struct

```go
	Plugin *CSIPlugin
```

### VariableEvent

**定义位置**：[L235](file:///d:/claude/nomad/nomad/structs/event.go#L235)

**类型**：struct

```go
	Metadata *VariableMetadata
	Deleted bool
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `TopicDeployment` | `"Deployment"` |
| `TopicEvaluation` | `"Evaluation"` |
| `TopicAllocation` | `"Allocation"` |
| `TopicJob` | `"Job"` |
| `TopicNode` | `"Node"` |
| `TopicNodePool` | `"NodePool"` |
| `TopicACLPolicy` | `"ACLPolicy"` |
| `TopicACLToken` | `"ACLToken"` |
| `TopicACLRole` | `"ACLRole"` |
| `TopicACLAuthMethod` | `"ACLAuthMethod"` |
| `TopicACLBindingRule` | `"ACLBindingRule"` |
| `TopicService` | `"Service"` |
| `TopicHostVolume` | `"HostVolume"` |
| `TopicCSIVolume` | `"CSIVolume"` |
| `TopicCSIPlugin` | `"CSIPlugin"` |
| `TopicOperator` | `"Operator"` |
| `TopicAll` | `"*"` |
| `TopicVariable` | `"Variable"` |
| `TypeNodeRegistration` | `"NodeRegistration"` |
| `TypeNodeDeregistration` | `"NodeDeregistration"` |
| `TypeNodeEligibilityUpdate` | `"NodeEligibility"` |
| `TypeNodeDrain` | `"NodeDrain"` |
| `TypeNodeEvent` | `"NodeStreamEvent"` |
| `TypeNodePoolUpserted` | `"NodePoolUpserted"` |
| `TypeNodePoolDeleted` | `"NodePoolDeleted"` |
| `TypeDeploymentUpdate` | `"DeploymentStatusUpdate"` |
| `TypeDeploymentPromotion` | `"DeploymentPromotion"` |
| `TypeDeploymentAllocHealth` | `"DeploymentAllocHealth"` |
| `TypeAllocationCreated` | `"AllocationCreated"` |
| `TypeAllocationUpdated` | `"AllocationUpdated"` |
| `TypeAllocationUpdateDesiredStatus` | `"AllocationUpdateDesiredStatus"` |
| `TypeEvalUpdated` | `"EvaluationUpdated"` |
| `TypeJobRegistered` | `"JobRegistered"` |
| `TypeJobDeregistered` | `"JobDeregistered"` |
| `TypeJobBatchDeregistered` | `"JobBatchDeregistered"` |
| `TypePlanResult` | `"PlanResult"` |
| `TypeACLTokenDeleted` | `"ACLTokenDeleted"` |
| `TypeACLTokenUpserted` | `"ACLTokenUpserted"` |
| `TypeACLPolicyDeleted` | `"ACLPolicyDeleted"` |
| `TypeACLPolicyUpserted` | `"ACLPolicyUpserted"` |
| `TypeACLRoleDeleted` | `"ACLRoleDeleted"` |
| `TypeACLRoleUpserted` | `"ACLRoleUpserted"` |
| `TypeACLAuthMethodUpserted` | `"ACLAuthMethodUpserted"` |
| `TypeACLAuthMethodDeleted` | `"ACLAuthMethodDeleted"` |
| `TypeACLBindingRuleUpserted` | `"ACLBindingRuleUpserted"` |
| `TypeACLBindingRuleDeleted` | `"ACLBindingRuleDeleted"` |
| `TypeServiceRegistration` | `"ServiceRegistration"` |
| `TypeServiceDeregistration` | `"ServiceDeregistration"` |
| `TypeHostVolumeRegistered` | `"HostVolumeRegistered"` |
| `TypeHostVolumeDeleted` | `"HostVolumeDeleted"` |
| `TypeCSIVolumeRegistered` | `"CSIVolumeRegistered"` |
| `TypeCSIVolumeDeregistered` | `"CSIVolumeDeregistered"` |
| `TypeCSIVolumeClaim` | `"CSIVolumeClaim"` |
| `TypeUtilizationSnapshotUpserted` | `"UtilizationSnapshotUpserted"` |
| `TypeVariableUpdated` | `"VariableUpdated"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Copy` | `j *EventJson` | - | `*EventJson` | [L118](file:///d:/claude/nomad/nomad/structs/event.go#L118) |
| `NewACLTokenEvent` | - | `token *ACLToken` | `*ACLTokenEvent` | [L182](file:///d:/claude/nomad/nomad/structs/event.go#L182) |
| `SecretID` | `a *ACLTokenEvent` | - | `string` | [L191](file:///d:/claude/nomad/nomad/structs/event.go#L191) |

## 5. 核心方法详解

## 6. 依赖关系

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|

