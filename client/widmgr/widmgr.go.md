# widmgr.go 代码说明文档

> 文件路径：[widmgr/widmgr.go](file:///d:/claude/nomad/client/widmgr/widmgr.go)
> 总行数：453 行
> 所属包：`widmgr`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **工作负载身份管理器子包**（`client/widmgr`），管理工作负载身份（Workload Identity）令牌的生成和续约。

## 2. 类型定义

### IdentityManager

**定义位置**：[L22](file:///d:/claude/nomad/client/widmgr/widmgr.go#L22)

**类型**：interface

```go
	Run
	Get
	Watch
	Shutdown
```

### WIDMgr

**定义位置**：[L29](file:///d:/claude/nomad/client/widmgr/widmgr.go#L29)

**类型**：struct

```go
	allocID string
	defaultSignedIdentities map[string]string
	minIndex uint64
	widSpecs map[structs.WIHandle]*structs.WorkloadIdentity
	signer IdentitySigner
	db cstate.StateDB
	lastToken map[structs.WIHandle]*structs.SignedWorkloadIdentity
	lastTokenLock sync.RWMutex
	watchers map[structs.WIHandle][]chan *structs.SignedWorkloadIdentity
	watchersLock sync.Mutex
	minWait time.Duration
	stopCtx context.Context
	stop context.CancelFunc
	logger hclog.Logger
```

**关联方法**（11 个）：`SetMinWait`, `Run`, `Get`, `get`, `Watch`, `Shutdown`, `restoreStoredIdentities`, `SignForTesting`, `getInitialIdentities`, `renew`, `send`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewWIDMgr` | - | `signer IdentitySigner, a *structs.Allocation, db cstate.StateDB, logger hclo...` | `*WIDMgr` | [L57](file:///d:/claude/nomad/client/widmgr/widmgr.go#L57) |
| `SetMinWait` | `m *WIDMgr` | `t time.Duration` | - | [L105](file:///d:/claude/nomad/client/widmgr/widmgr.go#L105) |
| `Run` | `m *WIDMgr` | - | `error` | [L114](file:///d:/claude/nomad/client/widmgr/widmgr.go#L114) |
| `Get` | `m *WIDMgr` | `id structs.WIHandle` | `*structs.SignedWorkloadIdentity, error` | [L144](file:///d:/claude/nomad/client/widmgr/widmgr.go#L144) |
| `get` | `m *WIDMgr` | `id structs.WIHandle` | `*structs.SignedWorkloadIdentity` | [L155](file:///d:/claude/nomad/client/widmgr/widmgr.go#L155) |
| `Watch` | `m *WIDMgr` | `id structs.WIHandle` | `chan *structs.SignedWorkloadIdentity, func(...)` | [L167](file:///d:/claude/nomad/client/widmgr/widmgr.go#L167) |
| `Shutdown` | `m *WIDMgr` | - | - | [L204](file:///d:/claude/nomad/client/widmgr/widmgr.go#L204) |
| `restoreStoredIdentities` | `m *WIDMgr` | - | `bool, error` | [L224](file:///d:/claude/nomad/client/widmgr/widmgr.go#L224) |
| `SignForTesting` | `m *WIDMgr` | - | - | [L250](file:///d:/claude/nomad/client/widmgr/widmgr.go#L250) |
| `getInitialIdentities` | `m *WIDMgr` | - | `error` | [L256](file:///d:/claude/nomad/client/widmgr/widmgr.go#L256) |
| `renew` | `m *WIDMgr` | - | - | [L318](file:///d:/claude/nomad/client/widmgr/widmgr.go#L318) |
| `send` | `m *WIDMgr` | `id structs.WIHandle, token *structs.SignedWorkloadIdentity` | - | [L434](file:///d:/claude/nomad/client/widmgr/widmgr.go#L434) |

## 5. 核心方法详解

### Run()

**签名**：`func (m *WIDMgr) Run() error`

**位置**：[L114](file:///d:/claude/nomad/client/widmgr/widmgr.go#L114)

### Get()

**签名**：`func (m *WIDMgr) Get(id structs.WIHandle) *structs.SignedWorkloadIdentity, error`

**位置**：[L144](file:///d:/claude/nomad/client/widmgr/widmgr.go#L144)

### Shutdown()

**签名**：`func (m *WIDMgr) Shutdown() `

**位置**：[L204](file:///d:/claude/nomad/client/widmgr/widmgr.go#L204)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `slices` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/state` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [widmgr_test.go](file:///d:/claude/nomad/client/widmgr/widmgr_test.go) | 对应测试文件 |

