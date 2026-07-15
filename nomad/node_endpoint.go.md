# node_endpoint.go 代码说明文档

> 文件路径：[node_endpoint.go](file:///d:/claude/nomad/nomad/node_endpoint.go)
> 总行数：2008 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **节点 RPC 端点**，处理节点的注册、查询、排水、评估等操作。

## 2. 类型定义

### Node

**定义位置**：[L59](file:///d:/claude/nomad/nomad/node_endpoint.go#L59)

**类型**：struct

```go
	srv *Server
	logger hclog.Logger
	ctx *RPCContext
	updates []*structs.Allocation
	evals []*structs.Evaluation
	updateFuture *structs.BatchFuture
	updateTimer *time.Timer
	updatesLock sync.Mutex
```

**关联方法**（19 个）：`Register`, `newRegistrationAllowed`, `constructNodeServerInfoResponse`, `Deregister`, `BatchDeregister`, `deregister`, `UpdateStatus`, `UpdateDrain`, `checkNodeDrainAuth`, `UpdateEligibility`, `Evaluate`, `GetNode`, `GetAllocs`, `GetClientAllocs`, `UpdateAlloc`, `batchUpdate`, `List`, `createNodeEvals`, `EmitEvents`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `batchUpdateInterval` | `50 * time.Millisecond` |
| `maxParallelRequestsPerDerive` | `16` |
| `NodeDrainEventDrainSet` | `"Node drain strategy set"` |
| `NodeDrainEventDrainDisabled` | `"Node drain disabled"` |
| `NodeDrainEventDrainUpdated` | `"Node drain strategy updated"` |
| `NodeEligibilityEventEligible` | `"Node marked as eligible for scheduling"` |
| `NodeEligibilityEventIneligible` | `"Node marked as ineligible for scheduling"` |
| `NodeHeartbeatEventReregistered` | `"Node reregistered by heartbeat"` |
| `NodeWaitingForNodePool` | `"Node registered but waiting for node pool to be created"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewNodeEndpoint` | - | `srv *Server, ctx *RPCContext` | `*Node` | [L85](file:///d:/claude/nomad/nomad/node_endpoint.go#L85) |
| `Register` | `n *Node` | `args *structs.NodeRegisterRequest, reply *structs.NodeUpdateResponse` | `error` | [L96](file:///d:/claude/nomad/nomad/node_endpoint.go#L96) |
| `newRegistrationAllowed` | `n *Node` | `args *structs.NodeRegisterRequest, authErr error` | `bool` | [L312](file:///d:/claude/nomad/nomad/node_endpoint.go#L312) |
| `shouldCreateNodeEval` | - | `original *structs.Node, updated *structs.Node` | `bool` | [L419](file:///d:/claude/nomad/nomad/node_endpoint.go#L419) |
| `equalDevices` | - | `n1 *structs.Node, n2 *structs.Node` | `bool` | [L449](file:///d:/claude/nomad/nomad/node_endpoint.go#L449) |
| `constructNodeServerInfoResponse` | `n *Node` | `nodeID string, snap *state.StateSnapshot, reply *structs.NodeUpdateResponse` | `error` | [L464](file:///d:/claude/nomad/nomad/node_endpoint.go#L464) |
| `Deregister` | `n *Node` | `args *structs.NodeDeregisterRequest, reply *structs.NodeUpdateResponse` | `error` | [L513](file:///d:/claude/nomad/nomad/node_endpoint.go#L513) |
| `BatchDeregister` | `n *Node` | `args *structs.NodeBatchDeregisterRequest, reply *structs.NodeUpdateResponse` | `error` | [L546](file:///d:/claude/nomad/nomad/node_endpoint.go#L546) |
| `deregister` | `n *Node` | `args *structs.NodeBatchDeregisterRequest, reply *structs.NodeUpdateResponse,...` | `error` | [L574](file:///d:/claude/nomad/nomad/node_endpoint.go#L574) |
| `UpdateStatus` | `n *Node` | `args *structs.NodeUpdateStatusRequest, reply *structs.NodeUpdateResponse` | `error` | [L655](file:///d:/claude/nomad/nomad/node_endpoint.go#L655) |
| `nodeStatusTransitionRequiresEval` | - | `newStatus string, oldStatus string` | `bool` | [L895](file:///d:/claude/nomad/nomad/node_endpoint.go#L895) |
| `UpdateDrain` | `n *Node` | `args *structs.NodeUpdateDrainRequest, reply *structs.NodeDrainUpdateResponse` | `error` | [L904](file:///d:/claude/nomad/nomad/node_endpoint.go#L904) |
| `checkNodeDrainAuth` | `n *Node` | `aclObj *acl.ACL, args *structs.NodeUpdateDrainRequest` | `error` | [L1008](file:///d:/claude/nomad/nomad/node_endpoint.go#L1008) |
| `UpdateEligibility` | `n *Node` | `args *structs.NodeUpdateEligibilityRequest, reply *structs.NodeEligibilityUp...` | `error` | [L1022](file:///d:/claude/nomad/nomad/node_endpoint.go#L1022) |
| `Evaluate` | `n *Node` | `args *structs.NodeEvaluateRequest, reply *structs.NodeUpdateResponse` | `error` | [L1126](file:///d:/claude/nomad/nomad/node_endpoint.go#L1126) |
| `GetNode` | `n *Node` | `args *structs.NodeSpecificRequest, reply *structs.SingleNodeResponse` | `error` | [L1184](file:///d:/claude/nomad/nomad/node_endpoint.go#L1184) |
| `GetAllocs` | `n *Node` | `args *structs.NodeSpecificRequest, reply *structs.NodeAllocsResponse` | `error` | [L1253](file:///d:/claude/nomad/nomad/node_endpoint.go#L1253) |
| `GetClientAllocs` | `n *Node` | `args *structs.NodeSpecificRequest, reply *structs.NodeClientAllocsResponse` | `error` | [L1344](file:///d:/claude/nomad/nomad/node_endpoint.go#L1344) |
| `UpdateAlloc` | `n *Node` | `args *structs.AllocUpdateRequest, reply *structs.GenericResponse` | `error` | [L1505](file:///d:/claude/nomad/nomad/node_endpoint.go#L1505) |
| `batchUpdate` | `n *Node` | `future *structs.BatchFuture, updates []*structs.Allocation, evals []*structs...` | - | [L1685](file:///d:/claude/nomad/nomad/node_endpoint.go#L1685) |
| `List` | `n *Node` | `args *structs.NodeListRequest, reply *structs.NodeListResponse` | `error` | [L1727](file:///d:/claude/nomad/nomad/node_endpoint.go#L1727) |
| `createNodeEvals` | `n *Node` | `node *structs.Node, nodeIndex uint64` | `[]string, uint64, error` | [L1800](file:///d:/claude/nomad/nomad/node_endpoint.go#L1800) |
| `EmitEvents` | `n *Node` | `args *structs.EmitNodeEventsRequest, reply *structs.EmitNodeEventsResponse` | `error` | [L1962](file:///d:/claude/nomad/nomad/node_endpoint.go#L1962) |

## 5. 核心方法详解

### Register()

**签名**：`func (n *Node) Register(args *structs.NodeRegisterRequest, reply *structs.NodeUpdateResponse) error`

**位置**：[L96](file:///d:/claude/nomad/nomad/node_endpoint.go#L96)

### Deregister()

**签名**：`func (n *Node) Deregister(args *structs.NodeDeregisterRequest, reply *structs.NodeUpdateResponse) error`

**位置**：[L513](file:///d:/claude/nomad/nomad/node_endpoint.go#L513)

### Evaluate()

**签名**：`func (n *Node) Evaluate(args *structs.NodeEvaluateRequest, reply *structs.NodeUpdateResponse) error`

**位置**：[L1126](file:///d:/claude/nomad/nomad/node_endpoint.go#L1126)

### GetNode()

**签名**：`func (n *Node) GetNode(args *structs.NodeSpecificRequest, reply *structs.SingleNodeResponse) error`

**位置**：[L1184](file:///d:/claude/nomad/nomad/node_endpoint.go#L1184)

### GetAllocs()

**签名**：`func (n *Node) GetAllocs(args *structs.NodeSpecificRequest, reply *structs.NodeAllocsResponse) error`

**位置**：[L1253](file:///d:/claude/nomad/nomad/node_endpoint.go#L1253)

### GetClientAllocs()

**签名**：`func (n *Node) GetClientAllocs(args *structs.NodeSpecificRequest, reply *structs.NodeClientAllocsResponse) error`

**位置**：[L1344](file:///d:/claude/nomad/nomad/node_endpoint.go#L1344)

### List()

**签名**：`func (n *Node) List(args *structs.NodeListRequest, reply *structs.NodeListResponse) error`

**位置**：[L1727](file:///d:/claude/nomad/nomad/node_endpoint.go#L1727)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `net/http` | 标准库 |
| `reflect` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/acl` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/auth` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state/paginator` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/go-jose/go-jose/v3/jwt` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **组合模式**：结构体嵌入 Server 引用，通过组合获取 Server 上下文
- **RPC 端点模式**：定义 RPC 端点结构体，将 Server 引用注入端点，处理特定资源的 RPC 请求
- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标
- **ACL 集成**：集成访问控制列表，验证请求权限

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [node_endpoint_test.go](file:///d:/claude/nomad/nomad/node_endpoint_test.go) | 对应测试文件 |

