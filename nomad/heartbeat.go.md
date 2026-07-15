# heartbeat.go 代码说明文档

> 文件路径：[heartbeat.go](file:///d:/claude/nomad/nomad/heartbeat.go)
> 总行数：277 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **心跳管理器**，管理 Client 节点的心跳，检测节点存活状态，超时触发节点标记为 down。

## 2. 类型定义

### nodeHeartbeater

**定义位置**：[L37](file:///d:/claude/nomad/nomad/heartbeat.go#L37)

**类型**：struct

```go
	srv *Server
	logger log.Logger
	heartbeatTimers map[string]*time.Timer
	heartbeatTimersLock sync.Mutex
```

**关联方法**（9 个）：`initializeHeartbeatTimers`, `resetHeartbeatTimer`, `resetHeartbeatTimerLocked`, `invalidateHeartbeat`, `disconnectState`, `clearHeartbeatTimer`, `clearAllHeartbeatTimers`, `heartbeatStats`, `getHeartbeatTimerNum`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `heartbeatNotLeader` | `"failed to reset heartbeat since server is not leader"` |
| `NodeHeartbeatEventMissed` | `"Node heartbeat missed"` |

### 变量

| 名称 | 值 |
|------|----|
| `heartbeatNotLeaderErr` | `errors.New(heartbeatNotLeader)` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newNodeHeartbeater` | - | `s *Server` | `*nodeHeartbeater` | [L49](file:///d:/claude/nomad/nomad/heartbeat.go#L49) |
| `initializeHeartbeatTimers` | `h *nodeHeartbeater` | - | `error` | [L59](file:///d:/claude/nomad/nomad/heartbeat.go#L59) |
| `resetHeartbeatTimer` | `h *nodeHeartbeater` | `id string` | `time.Duration, error` | [L93](file:///d:/claude/nomad/nomad/heartbeat.go#L93) |
| `resetHeartbeatTimerLocked` | `h *nodeHeartbeater` | `id string, ttl time.Duration` | - | [L117](file:///d:/claude/nomad/nomad/heartbeat.go#L117) |
| `invalidateHeartbeat` | `h *nodeHeartbeater` | `id string` | - | [L138](file:///d:/claude/nomad/nomad/heartbeat.go#L138) |
| `disconnectState` | `h *nodeHeartbeater` | `id string` | `bool, bool` | [L181](file:///d:/claude/nomad/nomad/heartbeat.go#L181) |
| `clearHeartbeatTimer` | `h *nodeHeartbeater` | `id string` | `error` | [L230](file:///d:/claude/nomad/nomad/heartbeat.go#L230) |
| `clearAllHeartbeatTimers` | `h *nodeHeartbeater` | - | `error` | [L243](file:///d:/claude/nomad/nomad/heartbeat.go#L243) |
| `heartbeatStats` | `h *nodeHeartbeater` | - | - | [L256](file:///d:/claude/nomad/nomad/heartbeat.go#L256) |
| `getHeartbeatTimerNum` | `h *nodeHeartbeater` | - | `int` | [L272](file:///d:/claude/nomad/nomad/heartbeat.go#L272) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |

## 7. 设计模式与技术特点

- **组合模式**：结构体嵌入 Server 引用，通过组合获取 Server 上下文
- **RPC 端点模式**：定义 RPC 端点结构体，将 Server 引用注入端点，处理特定资源的 RPC 请求
- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [heartbeat_test.go](file:///d:/claude/nomad/nomad/heartbeat_test.go) | 对应测试文件 |

