# manager.go 代码说明文档

> 文件路径：[servers/manager.go](file:///d:/claude/nomad/client/servers/manager.go)
> 总行数：365 行
> 所属包：`servers`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **服务器管理子包**（`client/servers`），管理 Client 连接的 Server 列表和故障转移。

## 2. 类型定义

### Pinger

**定义位置**：[L43](file:///d:/claude/nomad/client/servers/manager.go#L43)

**类型**：interface

```go
	Ping
```

### Server

**定义位置**：[L49](file:///d:/claude/nomad/client/servers/manager.go#L49)

**类型**：struct

```go
	Addr net.Addr
	addr string
	sync.Mutex
```

**关联方法**（3 个）：`Copy`, `String`, `Equal`

### Servers

**定义位置**：[L87](file:///d:/claude/nomad/client/servers/manager.go#L87)

**类型定义**：`[]*Server`

**关联方法**（5 个）：`String`, `cycle`, `shuffle`, `Sort`, `Equal`

### Manager

**定义位置**：[L140](file:///d:/claude/nomad/client/servers/manager.go#L140)

**类型**：struct

```go
	servers Servers
	rebalanceTimer *time.Timer
	shutdownCh chan struct{...}
	numNodes int32
	connPoolPinger Pinger
	logger hclog.Logger
	sync.Mutex
```

**关联方法**（12 个）：`Start`, `SetServers`, `serversAreEqual`, `FindServer`, `NumNodes`, `SetNumNodes`, `NotifyFailedServer`, `NumServers`, `GetServers`, `RebalanceServers`, `refreshServerRebalanceTimer`, `ResetRebalanceTimer`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `clientRPCMinReuseDuration` | `5 * time.Minute` |
| `newRebalanceConnsPerSecPerServer` | `64` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Copy` | `s *Server` | - | `*Server` | [L56](file:///d:/claude/nomad/client/servers/manager.go#L56) |
| `String` | `s *Server` | - | `string` | [L66](file:///d:/claude/nomad/client/servers/manager.go#L66) |
| `Equal` | `s *Server` | `o *Server` | `bool` | [L77](file:///d:/claude/nomad/client/servers/manager.go#L77) |
| `String` | `s *Servers` | - | `string` | [L89](file:///d:/claude/nomad/client/servers/manager.go#L89) |
| `cycle` | `s *Servers` | - | - | [L98](file:///d:/claude/nomad/client/servers/manager.go#L98) |
| `shuffle` | `s *Servers` | - | - | [L112](file:///d:/claude/nomad/client/servers/manager.go#L112) |
| `Sort` | `s *Servers` | - | - | [L119](file:///d:/claude/nomad/client/servers/manager.go#L119) |
| `Equal` | `s *Servers` | `o Servers` | `bool` | [L126](file:///d:/claude/nomad/client/servers/manager.go#L126) |
| `New` | - | `logger hclog.Logger, shutdownCh chan struct{...}, connPoolPinger Pinger` | `m *Manager` | [L165](file:///d:/claude/nomad/client/servers/manager.go#L165) |
| `Start` | `m *Manager` | - | - | [L178](file:///d:/claude/nomad/client/servers/manager.go#L178) |
| `SetServers` | `m *Manager` | `servers Servers` | `bool` | [L194](file:///d:/claude/nomad/client/servers/manager.go#L194) |
| `serversAreEqual` | `m *Manager` | `servers Servers` | `bool` | [L218](file:///d:/claude/nomad/client/servers/manager.go#L218) |
| `FindServer` | `m *Manager` | - | `*Server` | [L236](file:///d:/claude/nomad/client/servers/manager.go#L236) |
| `NumNodes` | `m *Manager` | - | `int32` | [L253](file:///d:/claude/nomad/client/servers/manager.go#L253) |
| `SetNumNodes` | `m *Manager` | `n int32` | - | [L260](file:///d:/claude/nomad/client/servers/manager.go#L260) |
| `NotifyFailedServer` | `m *Manager` | `s *Server` | - | [L268](file:///d:/claude/nomad/client/servers/manager.go#L268) |
| `NumServers` | `m *Manager` | - | `int` | [L281](file:///d:/claude/nomad/client/servers/manager.go#L281) |
| `GetServers` | `m *Manager` | - | `Servers` | [L288](file:///d:/claude/nomad/client/servers/manager.go#L288) |
| `RebalanceServers` | `m *Manager` | - | - | [L304](file:///d:/claude/nomad/client/servers/manager.go#L304) |
| `refreshServerRebalanceTimer` | `m *Manager` | - | `time.Duration` | [L340](file:///d:/claude/nomad/client/servers/manager.go#L340) |
| `ResetRebalanceTimer` | `m *Manager` | - | - | [L360](file:///d:/claude/nomad/client/servers/manager.go#L360) |

## 5. 核心方法详解

### New()

**签名**：`func New(logger hclog.Logger, shutdownCh chan struct{...}, connPoolPinger Pinger) m *Manager`

**位置**：[L165](file:///d:/claude/nomad/client/servers/manager.go#L165)

### Start()

**签名**：`func (m *Manager) Start() `

**位置**：[L178](file:///d:/claude/nomad/client/servers/manager.go#L178)

### GetServers()

**签名**：`func (m *Manager) GetServers() Servers`

**位置**：[L288](file:///d:/claude/nomad/client/servers/manager.go#L288)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `math/rand` | 标准库 |
| `net` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [manager_test.go](file:///d:/claude/nomad/client/servers/manager_test.go) | 对应测试文件 |

