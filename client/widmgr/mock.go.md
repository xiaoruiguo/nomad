# mock.go 代码说明文档

> 文件路径：[widmgr/mock.go](file:///d:/claude/nomad/client/widmgr/mock.go)
> 总行数：171 行
> 所属包：`widmgr`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **工作负载身份管理器子包**（`client/widmgr`），管理工作负载身份（Workload Identity）令牌的生成和续约。

## 2. 类型定义

### MockWIDSigner

**定义位置**：[L22](file:///d:/claude/nomad/client/widmgr/mock.go#L22)

**类型**：struct

```go
	wids map[string]*structs.WorkloadIdentity
	key *rsa.PrivateKey
	keyID string
	mockNow time.Time
```

**关联方法**（4 个）：`setWIDs`, `now`, `JSONWebKeySet`, `SignIdentities`

### MockIdentityManager

**定义位置**：[L120](file:///d:/claude/nomad/client/widmgr/mock.go#L120)

**类型**：struct

```go
	lastToken map[structs.WIHandle]*structs.SignedWorkloadIdentity
	lastTokenLock sync.RWMutex
```

**关联方法**（5 个）：`Get`, `Run`, `Watch`, `Shutdown`, `SetIdentity`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewMockWIDSigner` | - | `wids []*structs.WorkloadIdentity` | `*MockWIDSigner` | [L32](file:///d:/claude/nomad/client/widmgr/mock.go#L32) |
| `setWIDs` | `m *MockWIDSigner` | `wids []*structs.WorkloadIdentity` | - | [L49](file:///d:/claude/nomad/client/widmgr/mock.go#L49) |
| `now` | `m *MockWIDSigner` | - | `time.Time` | [L57](file:///d:/claude/nomad/client/widmgr/mock.go#L57) |
| `JSONWebKeySet` | `m *MockWIDSigner` | - | `*jose.JSONWebKeySet` | [L64](file:///d:/claude/nomad/client/widmgr/mock.go#L64) |
| `SignIdentities` | `m *MockWIDSigner` | `_ uint64, req []*structs.WorkloadIdentityRequest` | `[]*structs.SignedWorkloadIdentity, error` | [L76](file:///d:/claude/nomad/client/widmgr/mock.go#L76) |
| `NewMockIdentityManager` | - | - | `IdentityManager` | [L127](file:///d:/claude/nomad/client/widmgr/mock.go#L127) |
| `Get` | `m *MockIdentityManager` | `handle structs.WIHandle` | `*structs.SignedWorkloadIdentity, error` | [L135](file:///d:/claude/nomad/client/widmgr/mock.go#L135) |
| `Run` | `m *MockIdentityManager` | - | `error` | [L150](file:///d:/claude/nomad/client/widmgr/mock.go#L150) |
| `Watch` | `m *MockIdentityManager` | `_ structs.WIHandle` | `chan *structs.SignedWorkloadIdentity, func(...)` | [L154](file:///d:/claude/nomad/client/widmgr/mock.go#L154) |
| `Shutdown` | `m *MockIdentityManager` | - | - | [L160](file:///d:/claude/nomad/client/widmgr/mock.go#L160) |
| `SetIdentity` | `m *MockIdentityManager` | `handle structs.WIHandle, token *structs.SignedWorkloadIdentity` | - | [L166](file:///d:/claude/nomad/client/widmgr/mock.go#L166) |

## 5. 核心方法详解

### Get()

**签名**：`func (m *MockIdentityManager) Get(handle structs.WIHandle) *structs.SignedWorkloadIdentity, error`

**位置**：[L135](file:///d:/claude/nomad/client/widmgr/mock.go#L135)

### Run()

**签名**：`func (m *MockIdentityManager) Run() error`

**位置**：[L150](file:///d:/claude/nomad/client/widmgr/mock.go#L150)

### Shutdown()

**签名**：`func (m *MockIdentityManager) Shutdown() `

**位置**：[L160](file:///d:/claude/nomad/client/widmgr/mock.go#L160)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `crypto/rand` | 标准库 |
| `crypto/rsa` | 标准库 |
| `fmt` | 标准库 |
| `slices` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/go-jose/go-jose/v3` | 第三方库 |
| `github.com/go-jose/go-jose/v3/jwt` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态

## 8. 相关文件

| 文件 | 关系 |
|------|------|

