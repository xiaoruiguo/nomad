# operator_endpoint.go 代码说明文档

> 文件路径：[operator_endpoint.go](file:///d:/claude/nomad/nomad/operator_endpoint.go)
> 总行数：867 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **运维 RPC 端点**，处理集群运维操作（Raft 配置、快照、自动纠偏、调度器暂停等）。

## 2. 类型定义

### Operator

**定义位置**：[L30](file:///d:/claude/nomad/nomad/operator_endpoint.go#L30)

**类型**：struct

```go
	srv *Server
	ctx *RPCContext
	logger hclog.Logger
```

**关联方法**（15 个）：`register`, `RaftGetConfiguration`, `RaftRemovePeerByAddress`, `RaftRemovePeerByID`, `TransferLeadershipToPeer`, `AutopilotGetConfiguration`, `AutopilotSetConfiguration`, `ServerHealth`, `SchedulerSetConfiguration`, `SchedulerGetConfiguration`, `forwardStreamingRPC`, `forwardStreamingRPCToServer`, `snapshotSave`, `snapshotRestore`, `UpgradeCheckVaultWorkloadIdentity`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewOperatorEndpoint` | - | `srv *Server, ctx *RPCContext` | `*Operator` | [L36](file:///d:/claude/nomad/nomad/operator_endpoint.go#L36) |
| `register` | `op *Operator` | - | - | [L40](file:///d:/claude/nomad/nomad/operator_endpoint.go#L40) |
| `RaftGetConfiguration` | `op *Operator` | `args *structs.GenericRequest, reply *structs.RaftConfigurationResponse` | `error` | [L46](file:///d:/claude/nomad/nomad/operator_endpoint.go#L46) |
| `RaftRemovePeerByAddress` | `op *Operator` | `_ *structs.RaftPeerByAddressRequest, _ *struct{...}` | `error` | [L112](file:///d:/claude/nomad/nomad/operator_endpoint.go#L112) |
| `RaftRemovePeerByID` | `op *Operator` | `args *structs.RaftPeerByIDRequest, reply *struct{...}` | `error` | [L120](file:///d:/claude/nomad/nomad/operator_endpoint.go#L120) |
| `TransferLeadershipToPeer` | `op *Operator` | `req *structs.RaftPeerRequest, reply *structs.LeadershipTransferResponse` | `error` | [L190](file:///d:/claude/nomad/nomad/operator_endpoint.go#L190) |
| `AutopilotGetConfiguration` | `op *Operator` | `args *structs.GenericRequest, reply *structs.AutopilotConfig` | `error` | [L308](file:///d:/claude/nomad/nomad/operator_endpoint.go#L308) |
| `AutopilotSetConfiguration` | `op *Operator` | `args *structs.AutopilotSetConfigRequest, reply *bool` | `error` | [L342](file:///d:/claude/nomad/nomad/operator_endpoint.go#L342) |
| `ServerHealth` | `op *Operator` | `args *structs.GenericRequest, reply *structs.OperatorHealthReply` | `error` | [L381](file:///d:/claude/nomad/nomad/operator_endpoint.go#L381) |
| `SchedulerSetConfiguration` | `op *Operator` | `args *structs.SchedulerSetConfigRequest, reply *structs.SchedulerSetConfigur...` | `error` | [L418](file:///d:/claude/nomad/nomad/operator_endpoint.go#L418) |
| `SchedulerGetConfiguration` | `op *Operator` | `args *structs.GenericRequest, reply *structs.SchedulerConfigurationResponse` | `error` | [L479](file:///d:/claude/nomad/nomad/operator_endpoint.go#L479) |
| `forwardStreamingRPC` | `op *Operator` | `region string, method string, args interface{}, in io.ReadWriteCloser` | `error` | [L514](file:///d:/claude/nomad/nomad/operator_endpoint.go#L514) |
| `forwardStreamingRPCToServer` | `op *Operator` | `server *peers.Parts, method string, args interface{}, in io.ReadWriteCloser` | `error` | [L523](file:///d:/claude/nomad/nomad/operator_endpoint.go#L523) |
| `snapshotSave` | `op *Operator` | `conn io.ReadWriteCloser` | - | [L539](file:///d:/claude/nomad/nomad/operator_endpoint.go#L539) |
| `snapshotRestore` | `op *Operator` | `conn io.ReadWriteCloser` | - | [L628](file:///d:/claude/nomad/nomad/operator_endpoint.go#L628) |
| `UpgradeCheckVaultWorkloadIdentity` | `op *Operator` | `args *structs.UpgradeCheckVaultWorkloadIdentityRequest, reply *structs.Upgra...` | `error` | [L748](file:///d:/claude/nomad/nomad/operator_endpoint.go#L748) |
| `decodeStreamOutput` | - | `decoder *codec.Decoder` | `io.Reader, chan error` | [L828](file:///d:/claude/nomad/nomad/operator_endpoint.go#L828) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net` | 标准库 |
| `net/http` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/acl` | 内部包 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/helper/snapshot` | 内部包 |
| `github.com/hashicorp/nomad/nomad/peers` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-msgpack/v2/codec` | 第三方库 |
| `github.com/hashicorp/go-version` | 第三方库 |
| `github.com/hashicorp/raft` | 第三方库 |
| `github.com/hashicorp/serf/serf` | 第三方库 |

## 7. 设计模式与技术特点

- **组合模式**：结构体嵌入 Server 引用，通过组合获取 Server 上下文
- **Raft 共识**：使用 HashiCorp Raft 库实现分布式共识，保证状态一致性
- **RPC 端点模式**：定义 RPC 端点结构体，将 Server 引用注入端点，处理特定资源的 RPC 请求
- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **ACL 集成**：集成访问控制列表，验证请求权限

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [operator_endpoint_test.go](file:///d:/claude/nomad/nomad/operator_endpoint_test.go) | 对应测试文件 |

