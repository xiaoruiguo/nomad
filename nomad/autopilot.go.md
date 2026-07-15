# autopilot.go 代码说明文档

> 文件路径：[autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go)
> 总行数：235 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **自动纠偏（Autopilot）**，管理集群的自动健康检查、Leader 转移、服务器淘汰等功能。

## 2. 类型定义

### AutopilotDelegate

**定义位置**：[L32](file:///d:/claude/nomad/nomad/autopilot.go#L32)

**类型**：struct

```go
	server *Server
```

**关联方法**（5 个）：`AutopilotConfig`, `FetchServerStats`, `KnownServers`, `NotifyState`, `RemoveFailedServer`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `AutopilotRZTag` | `"ap_zone"` |
| `AutopilotVersionTag` | `"ap_version"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `AutopilotConfig` | `d *AutopilotDelegate` | - | `*autopilot.Config` | [L39](file:///d:/claude/nomad/nomad/autopilot.go#L39) |
| `FetchServerStats` | `d *AutopilotDelegate` | `ctx context.Context, servers map[raft.ServerID]*autopilot.Server` | `map[raft.ServerID]*autopilot.ServerStats` | [L59](file:///d:/claude/nomad/nomad/autopilot.go#L59) |
| `KnownServers` | `d *AutopilotDelegate` | - | `map[raft.ServerID]*autopilot.Server` | [L66](file:///d:/claude/nomad/nomad/autopilot.go#L66) |
| `NotifyState` | `d *AutopilotDelegate` | `state *autopilot.State` | - | [L73](file:///d:/claude/nomad/nomad/autopilot.go#L73) |
| `RemoveFailedServer` | `d *AutopilotDelegate` | `failedSrv *autopilot.Server` | - | [L88](file:///d:/claude/nomad/nomad/autopilot.go#L88) |
| `MinRaftProtocol` | `s *Server` | - | `int, error` | [L102](file:///d:/claude/nomad/nomad/autopilot.go#L102) |
| `GetClusterHealth` | `s *Server` | - | `*structs.OperatorHealthReply` | [L108](file:///d:/claude/nomad/nomad/autopilot.go#L108) |
| `autopilotToServerHealth` | - | `srv *autopilot.ServerState` | `structs.ServerHealth` | [L141](file:///d:/claude/nomad/nomad/autopilot.go#L141) |
| `stringIDs` | - | `ids []raft.ServerID` | `[]string` | [L170](file:///d:/claude/nomad/nomad/autopilot.go#L170) |
| `minRaftProtocol` | - | `members []*peers.Parts` | `int, error` | [L174](file:///d:/claude/nomad/nomad/autopilot.go#L174) |
| `autopilotServers` | `s *Server` | - | `map[raft.ServerID]*autopilot.Server` | [L193](file:///d:/claude/nomad/nomad/autopilot.go#L193) |
| `autopilotServerFromMetadata` | `s *Server` | `srv *peers.Parts` | `*autopilot.Server` | [L209](file:///d:/claude/nomad/nomad/autopilot.go#L209) |

## 5. 核心方法详解

### GetClusterHealth()

**签名**：`func (s *Server) GetClusterHealth() *structs.OperatorHealthReply`

**位置**：[L108](file:///d:/claude/nomad/nomad/autopilot.go#L108)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/peers` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/raft` | 第三方库 |
| `github.com/hashicorp/raft-autopilot` | 第三方库 |
| `github.com/hashicorp/serf/serf` | 第三方库 |

## 7. 设计模式与技术特点

- **组合模式**：结构体嵌入 Server 引用，通过组合获取 Server 上下文
- **Raft 共识**：使用 HashiCorp Raft 库实现分布式共识，保证状态一致性
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [autopilot_test.go](file:///d:/claude/nomad/nomad/autopilot_test.go) | 对应测试文件 |

