# event.go 代码说明文档

> 文件路径：[nomad/structs/event.go](file:///d:/claude/nomad/nomad/structs/event.go)
> 总行数：239 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 3 个方法/函数。

## 2. 类型定义

### EventStreamRequest

**定义位置**：[L7](file:///d:/claude/nomad/nomad/structs/event.go#L7)

**中文说明**：EventStreamRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type EventStreamRequest struct {
	Topics map[Topic][]string
	Index int
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Topics` | `map[Topic][]string` | 映射表 |
| `Index` | `int` | 索引 |
| `QueryOptions` | `QueryOptions` | — |

### EventStreamWrapper

**定义位置**：[L14](file:///d:/claude/nomad/nomad/structs/event.go#L14)

**中文说明**：EventStreamWrapper 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type EventStreamWrapper struct {
	Error *RpcError
	Event *EventJson
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Error` | `*RpcError` | 错误信息 |
| `Event` | `*EventJson` | 事件 |

### Topic

**定义位置**：[L19](file:///d:/claude/nomad/nomad/structs/event.go#L19)

**类型定义**：`type Topic string`

### Event

**定义位置**：[L82](file:///d:/claude/nomad/nomad/structs/event.go#L82)

**中文说明**：Event 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Event struct {
	Topic Topic
	Type string
	Key string
	Namespace string
	FilterKeys []string
	Index uint64
	Payload interface{}
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Topic` | `Topic` | — |
| `Type` | `string` | 类型 |
| `Key` | `string` | 键 |
| `Namespace` | `string` | 命名空间 |
| `FilterKeys` | `[]string` | 列表 |
| `Index` | `uint64` | 索引 |
| `Payload` | `interface{}` | 接口类型，可持有任意值 |

### Events

**定义位置**：[L108](file:///d:/claude/nomad/nomad/structs/event.go#L108)

**中文说明**：Events 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Events struct {
	Index uint64
	Events []Event
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Index` | `uint64` | 索引 |
| `Events` | `[]Event` | 列表 |

### EventJson

**定义位置**：[L114](file:///d:/claude/nomad/nomad/structs/event.go#L114)

**中文说明**：EventJson 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type EventJson struct {
	Data []byte
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Data` | `[]byte` | 数据 |

**关联方法**（1 个）：`Copy`

### JobEvent

**定义位置**：[L127](file:///d:/claude/nomad/nomad/structs/event.go#L127)

**中文说明**：JobEvent 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobEvent struct {
	Job *Job
	Deleted bool `json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Job` | `*Job` | — |
| `Deleted` | `bool `json:",omitempty"`` | 布尔值 |

### EvaluationEvent

**定义位置**：[L136](file:///d:/claude/nomad/nomad/structs/event.go#L136)

**中文说明**：EvaluationEvent 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型**：struct

```go
type EvaluationEvent struct {
	Evaluation *Evaluation
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Evaluation` | `*Evaluation` | — |

### AllocationEvent

**定义位置**：[L142](file:///d:/claude/nomad/nomad/structs/event.go#L142)

**中文说明**：AllocationEvent 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocationEvent struct {
	Allocation *Allocation
	Timeout bool `json:",omitempty"`
	TimeoutReason string `json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Allocation` | `*Allocation` | — |
| `Timeout` | `bool `json:",omitempty"`` | 超时时间 |
| `TimeoutReason` | `string `json:",omitempty"`` | 字符串 |

### DeploymentEvent

**定义位置**：[L155](file:///d:/claude/nomad/nomad/structs/event.go#L155)

**中文说明**：DeploymentEvent 与部署（Deployment）相关，部署管理作业的滚动更新过程。

**类型**：struct

```go
type DeploymentEvent struct {
	Deployment *Deployment
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Deployment` | `*Deployment` | — |

### NodeStreamEvent

**定义位置**：[L160](file:///d:/claude/nomad/nomad/structs/event.go#L160)

**中文说明**：NodeStreamEvent 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeStreamEvent struct {
	Node *Node
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Node` | `*Node` | — |

### NodePoolEvent

**定义位置**：[L165](file:///d:/claude/nomad/nomad/structs/event.go#L165)

**中文说明**：NodePoolEvent 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodePoolEvent struct {
	NodePool *NodePool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodePool` | `*NodePool` | — |

### ACLTokenEvent

**定义位置**：[L169](file:///d:/claude/nomad/nomad/structs/event.go#L169)

**中文说明**：ACLTokenEvent 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLTokenEvent struct {
	ACLToken *ACLToken
	secretID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLToken` | `*ACLToken` | — |
| `secretID` | `string` | 字符串 |

**关联方法**（1 个）：`SecretID`

### ServiceRegistrationStreamEvent

**定义位置**：[L176](file:///d:/claude/nomad/nomad/structs/event.go#L176)

**中文说明**：ServiceRegistrationStreamEvent 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ServiceRegistrationStreamEvent struct {
	Service *ServiceRegistration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Service` | `*ServiceRegistration` | — |

### ACLPolicyEvent

**定义位置**：[L195](file:///d:/claude/nomad/nomad/structs/event.go#L195)

**中文说明**：ACLPolicyEvent 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLPolicyEvent struct {
	ACLPolicy *ACLPolicy
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLPolicy` | `*ACLPolicy` | — |

### ACLRoleStreamEvent

**定义位置**：[L201](file:///d:/claude/nomad/nomad/structs/event.go#L201)

**中文说明**：ACLRoleStreamEvent 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLRoleStreamEvent struct {
	ACLRole *ACLRole
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLRole` | `*ACLRole` | — |

### ACLAuthMethodEvent

**定义位置**：[L207](file:///d:/claude/nomad/nomad/structs/event.go#L207)

**中文说明**：ACLAuthMethodEvent 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLAuthMethodEvent struct {
	AuthMethod *ACLAuthMethod
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AuthMethod` | `*ACLAuthMethod` | — |

### ACLBindingRuleEvent

**定义位置**：[L213](file:///d:/claude/nomad/nomad/structs/event.go#L213)

**中文说明**：ACLBindingRuleEvent 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLBindingRuleEvent struct {
	ACLBindingRule *ACLBindingRule
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ACLBindingRule` | `*ACLBindingRule` | — |

### HostVolumeEvent

**定义位置**：[L219](file:///d:/claude/nomad/nomad/structs/event.go#L219)

**中文说明**：HostVolumeEvent 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type HostVolumeEvent struct {
	Volume *HostVolume
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*HostVolume` | — |

### CSIVolumeEvent

**定义位置**：[L225](file:///d:/claude/nomad/nomad/structs/event.go#L225)

**中文说明**：CSIVolumeEvent 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type CSIVolumeEvent struct {
	Volume *CSIVolume
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Volume` | `*CSIVolume` | — |

### CSIPluginEvent

**定义位置**：[L231](file:///d:/claude/nomad/nomad/structs/event.go#L231)

**中文说明**：CSIPluginEvent 与插件（Plugin）相关，实现可扩展的功能模块。

**类型**：struct

```go
type CSIPluginEvent struct {
	Plugin *CSIPlugin
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Plugin` | `*CSIPlugin` | — |

### VariableEvent

**定义位置**：[L235](file:///d:/claude/nomad/nomad/structs/event.go#L235)

**中文说明**：VariableEvent 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type VariableEvent struct {
	Metadata *VariableMetadata
	Deleted bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Metadata` | `*VariableMetadata` | 元数据 |
| `Deleted` | `bool` | 布尔值 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `TopicDeployment` | `Topic` | `"Deployment"` | — |
| `TopicEvaluation` | `Topic` | `"Evaluation"` | — |
| `TopicAllocation` | `Topic` | `"Allocation"` | — |
| `TopicJob` | `Topic` | `"Job"` | — |
| `TopicNode` | `Topic` | `"Node"` | — |
| `TopicNodePool` | `Topic` | `"NodePool"` | — |
| `TopicACLPolicy` | `Topic` | `"ACLPolicy"` | — |
| `TopicACLToken` | `Topic` | `"ACLToken"` | — |
| `TopicACLRole` | `Topic` | `"ACLRole"` | — |
| `TopicACLAuthMethod` | `Topic` | `"ACLAuthMethod"` | — |
| `TopicACLBindingRule` | `Topic` | `"ACLBindingRule"` | — |
| `TopicService` | `Topic` | `"Service"` | — |
| `TopicHostVolume` | `Topic` | `"HostVolume"` | — |
| `TopicCSIVolume` | `Topic` | `"CSIVolume"` | — |
| `TopicCSIPlugin` | `Topic` | `"CSIPlugin"` | — |
| `TopicOperator` | `Topic` | `"Operator"` | — |
| `TopicAll` | `Topic` | `"*"` | — |
| `TopicVariable` | `Topic` | `"Variable"` | — |
| `TypeNodeRegistration` | `—` | `"NodeRegistration"` | — |
| `TypeNodeDeregistration` | `—` | `"NodeDeregistration"` | — |
| `TypeNodeEligibilityUpdate` | `—` | `"NodeEligibility"` | — |
| `TypeNodeDrain` | `—` | `"NodeDrain"` | — |
| `TypeNodeEvent` | `—` | `"NodeStreamEvent"` | — |
| `TypeNodePoolUpserted` | `—` | `"NodePoolUpserted"` | — |
| `TypeNodePoolDeleted` | `—` | `"NodePoolDeleted"` | — |
| `TypeDeploymentUpdate` | `—` | `"DeploymentStatusUpdate"` | — |
| `TypeDeploymentPromotion` | `—` | `"DeploymentPromotion"` | — |
| `TypeDeploymentAllocHealth` | `—` | `"DeploymentAllocHealth"` | — |
| `TypeAllocationCreated` | `—` | `"AllocationCreated"` | — |
| `TypeAllocationUpdated` | `—` | `"AllocationUpdated"` | — |
| `TypeAllocationUpdateDesiredStatus` | `—` | `"AllocationUpdateDesiredStatus"` | — |
| `TypeEvalUpdated` | `—` | `"EvaluationUpdated"` | — |
| `TypeJobRegistered` | `—` | `"JobRegistered"` | — |
| `TypeJobDeregistered` | `—` | `"JobDeregistered"` | — |
| `TypeJobBatchDeregistered` | `—` | `"JobBatchDeregistered"` | — |
| `TypePlanResult` | `—` | `"PlanResult"` | — |
| `TypeACLTokenDeleted` | `—` | `"ACLTokenDeleted"` | — |
| `TypeACLTokenUpserted` | `—` | `"ACLTokenUpserted"` | — |
| `TypeACLPolicyDeleted` | `—` | `"ACLPolicyDeleted"` | — |
| `TypeACLPolicyUpserted` | `—` | `"ACLPolicyUpserted"` | — |
| `TypeACLRoleDeleted` | `—` | `"ACLRoleDeleted"` | — |
| `TypeACLRoleUpserted` | `—` | `"ACLRoleUpserted"` | — |
| `TypeACLAuthMethodUpserted` | `—` | `"ACLAuthMethodUpserted"` | — |
| `TypeACLAuthMethodDeleted` | `—` | `"ACLAuthMethodDeleted"` | — |
| `TypeACLBindingRuleUpserted` | `—` | `"ACLBindingRuleUpserted"` | — |
| `TypeACLBindingRuleDeleted` | `—` | `"ACLBindingRuleDeleted"` | — |
| `TypeServiceRegistration` | `—` | `"ServiceRegistration"` | — |
| `TypeServiceDeregistration` | `—` | `"ServiceDeregistration"` | — |
| `TypeHostVolumeRegistered` | `—` | `"HostVolumeRegistered"` | — |
| `TypeHostVolumeDeleted` | `—` | `"HostVolumeDeleted"` | — |
| `TypeCSIVolumeRegistered` | `—` | `"CSIVolumeRegistered"` | — |
| `TypeCSIVolumeDeregistered` | `—` | `"CSIVolumeDeregistered"` | — |
| `TypeCSIVolumeClaim` | `—` | `"CSIVolumeClaim"` | — |
| `TypeUtilizationSnapshotUpserted` | `—` | `"UtilizationSnapshotUpserted"` | — |
| `TypeVariableUpdated` | `—` | `"VariableUpdated"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Copy` | `j *EventJson` | `` | `*EventJson` | [L118](file:///d:/claude/nomad/nomad/structs/event.go#L118) |
| `NewACLTokenEvent` | - | `token *ACLToken` | `*ACLTokenEvent` | [L182](file:///d:/claude/nomad/nomad/structs/event.go#L182) |
| `SecretID` | `a *ACLTokenEvent` | `` | `string` | [L191](file:///d:/claude/nomad/nomad/structs/event.go#L191) |

## 5. 核心方法详解

### Copy()

**签名**：`func (j *EventJson) Copy() *EventJson`

**位置**：[L118](file:///d:/claude/nomad/nomad/structs/event.go#L118)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*EventJson` | — |

### NewACLTokenEvent()

**签名**：`func NewACLTokenEvent(token *ACLToken) *ACLTokenEvent`

**位置**：[L182](file:///d:/claude/nomad/nomad/structs/event.go#L182)

**中文说明**：创建并返回一个新的 ACLTokenEvent 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `token` | `*ACLToken` | 令牌，用于认证或标识 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACLTokenEvent` | — |

## 6. 依赖关系

该文件无导入包。

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **对象池模式**：实现对象池，复用资源减少分配开销
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

