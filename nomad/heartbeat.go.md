# heartbeat.go 代码说明文档

> 文件路径：[nomad/heartbeat.go](file:///d:/claude/nomad/nomad/heartbeat.go)
> 总行数：277 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad 核心包**（`nomad/`），实现 Server/Client 核心功能，包括 Raft 共识、状态管理、调度系统、RPC 处理等。当前文件 `heartbeat.go` 提供相关功能实现。

## 2. 类型定义

### nodeHeartbeater

**定义位置**：[L37](file:///d:/claude/nomad/nomad/heartbeat.go#L37)

**中文说明**：nodeHeartbeater 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type nodeHeartbeater struct {
	srv *Server
	logger log.Logger
	heartbeatTimers map[string]*time.Timer
	heartbeatTimersLock sync.Mutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `srv` | `*Server` | 关联的 Server 实例 |
| `logger` | `log.Logger` | 日志记录器 |
| `heartbeatTimers` | `map[string]*time.Timer` | 时间点 |
| `heartbeatTimersLock` | `sync.Mutex` | 互斥锁，保护并发访问 |

**关联方法**（9 个）：`initializeHeartbeatTimers`, `resetHeartbeatTimer`, `resetHeartbeatTimerLocked`, `invalidateHeartbeat`, `disconnectState`, `clearHeartbeatTimer`, `clearAllHeartbeatTimers`, `heartbeatStats`, `getHeartbeatTimerNum`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `heartbeatNotLeader` | `—` | `"failed to reset heartbeat since server is not leader"` | — |
| `NodeHeartbeatEventMissed` | `—` | `"Node heartbeat missed"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `heartbeatNotLeaderErr` | `—` | `errors.New(heartbeatNotLeader)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newNodeHeartbeater` | - | `s *Server` | `*nodeHeartbeater` | [L49](file:///d:/claude/nomad/nomad/heartbeat.go#L49) |
| `initializeHeartbeatTimers` | `h *nodeHeartbeater` | `` | `error` | [L59](file:///d:/claude/nomad/nomad/heartbeat.go#L59) |
| `resetHeartbeatTimer` | `h *nodeHeartbeater` | `id string` | `time.Duration, error` | [L93](file:///d:/claude/nomad/nomad/heartbeat.go#L93) |
| `resetHeartbeatTimerLocked` | `h *nodeHeartbeater` | `id string, ttl time.Duration` | `` | [L117](file:///d:/claude/nomad/nomad/heartbeat.go#L117) |
| `invalidateHeartbeat` | `h *nodeHeartbeater` | `id string` | `` | [L138](file:///d:/claude/nomad/nomad/heartbeat.go#L138) |
| `disconnectState` | `h *nodeHeartbeater` | `id string` | `bool, bool` | [L181](file:///d:/claude/nomad/nomad/heartbeat.go#L181) |
| `clearHeartbeatTimer` | `h *nodeHeartbeater` | `id string` | `error` | [L230](file:///d:/claude/nomad/nomad/heartbeat.go#L230) |
| `clearAllHeartbeatTimers` | `h *nodeHeartbeater` | `` | `error` | [L243](file:///d:/claude/nomad/nomad/heartbeat.go#L243) |
| `heartbeatStats` | `h *nodeHeartbeater` | `` | `` | [L256](file:///d:/claude/nomad/nomad/heartbeat.go#L256) |
| `getHeartbeatTimerNum` | `h *nodeHeartbeater` | `` | `int` | [L272](file:///d:/claude/nomad/nomad/heartbeat.go#L272) |

## 5. 核心方法详解

该文件无导出的核心方法。

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

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [heartbeat_test.go](file:///d:/claude/nomad/nomad/heartbeat_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/acl.go) | 同目录源文件 |
| [acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/nomad/alloc_endpoint.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/autopilot.go) | 同目录源文件 |
| [autopilot_ce.go](file:///d:/claude/nomad/nomad/autopilot_ce.go) | 同目录源文件 |

