# mock.go 代码说明文档

> 文件路径：[client/widmgr/mock.go](file:///d:/claude/nomad/client/widmgr/mock.go)
> 总行数：171 行
> 所属包：`widmgr`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **客户端子包**（`client/`），实现 Nomad 客户端的功能组件。

## 2. 类型定义

### MockWIDSigner

**定义位置**：[L22](file:///d:/claude/nomad/client/widmgr/mock.go#L22)

**中文说明**：MockWIDSigner 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type MockWIDSigner struct {
	wids map[string]*structs.WorkloadIdentity
	key *rsa.PrivateKey
	keyID string
	mockNow time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `wids` | `map[string]*structs.WorkloadIdentity` | 映射表 |
| `key` | `*rsa.PrivateKey` | 键 |
| `keyID` | `string` | 字符串 |
| `mockNow` | `time.Time` | 时间点 |

**关联方法**（4 个）：`setWIDs`, `now`, `JSONWebKeySet`, `SignIdentities`

### MockIdentityManager

**定义位置**：[L120](file:///d:/claude/nomad/client/widmgr/mock.go#L120)

**中文说明**：MockIdentityManager 是一个管理器，负责协调和管理相关资源的生命周期。

**类型**：struct

```go
type MockIdentityManager struct {
	lastToken map[structs.WIHandle]*structs.SignedWorkloadIdentity
	lastTokenLock sync.RWMutex
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `lastToken` | `map[structs.WIHandle]*structs.SignedWorkloadIdentity` | 映射表 |
| `lastTokenLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |

**关联方法**（5 个）：`Get`, `Run`, `Watch`, `Shutdown`, `SetIdentity`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewMockWIDSigner` | - | `wids []*structs.WorkloadIdentity` | `*MockWIDSigner` | [L32](file:///d:/claude/nomad/client/widmgr/mock.go#L32) |
| `setWIDs` | `m *MockWIDSigner` | `wids []*structs.WorkloadIdentity` | `` | [L49](file:///d:/claude/nomad/client/widmgr/mock.go#L49) |
| `now` | `m *MockWIDSigner` | `` | `time.Time` | [L57](file:///d:/claude/nomad/client/widmgr/mock.go#L57) |
| `JSONWebKeySet` | `m *MockWIDSigner` | `` | `*jose.JSONWebKeySet` | [L64](file:///d:/claude/nomad/client/widmgr/mock.go#L64) |
| `SignIdentities` | `m *MockWIDSigner` | `_ uint64, req []*structs.WorkloadIdentityRequest` | `[]*structs.SignedWorkloadIdentity, error` | [L76](file:///d:/claude/nomad/client/widmgr/mock.go#L76) |
| `NewMockIdentityManager` | - | `` | `IdentityManager` | [L127](file:///d:/claude/nomad/client/widmgr/mock.go#L127) |
| `Get` | `m *MockIdentityManager` | `handle structs.WIHandle` | `*structs.SignedWorkloadIdentity, error` | [L135](file:///d:/claude/nomad/client/widmgr/mock.go#L135) |
| `Run` | `m *MockIdentityManager` | `` | `error` | [L150](file:///d:/claude/nomad/client/widmgr/mock.go#L150) |
| `Watch` | `m *MockIdentityManager` | `_ structs.WIHandle` | `<-chan *structs.SignedWorkloadIdentity, func(...)` | [L154](file:///d:/claude/nomad/client/widmgr/mock.go#L154) |
| `Shutdown` | `m *MockIdentityManager` | `` | `` | [L160](file:///d:/claude/nomad/client/widmgr/mock.go#L160) |
| `SetIdentity` | `m *MockIdentityManager` | `handle structs.WIHandle, token *structs.SignedWorkloadIdentity` | `` | [L166](file:///d:/claude/nomad/client/widmgr/mock.go#L166) |

## 5. 核心方法详解

### NewMockWIDSigner()

**签名**：`func NewMockWIDSigner(wids []*structs.WorkloadIdentity) *MockWIDSigner`

**位置**：[L32](file:///d:/claude/nomad/client/widmgr/mock.go#L32)

**中文说明**：创建并返回一个新的 MockWIDSigner 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `wids` | `[]*structs.WorkloadIdentity` | 列表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*MockWIDSigner` | — |

### NewMockIdentityManager()

**签名**：`func NewMockIdentityManager() IdentityManager`

**位置**：[L127](file:///d:/claude/nomad/client/widmgr/mock.go#L127)

**中文说明**：创建并返回一个新的 MockIdentityManager 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `IdentityManager` | — |

### Get()

**签名**：`func (m *MockIdentityManager) Get(handle structs.WIHandle) *structs.SignedWorkloadIdentity, error`

**位置**：[L135](file:///d:/claude/nomad/client/widmgr/mock.go#L135)

**中文说明**：获取对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `handle` | `structs.WIHandle` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*structs.SignedWorkloadIdentity` | — |
| `error` | 错误信息 |

### Run()

**签名**：`func (m *MockIdentityManager) Run() error`

**位置**：[L150](file:///d:/claude/nomad/client/widmgr/mock.go#L150)

**中文说明**：运行对象的主循环。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Watch()

**签名**：`func (m *MockIdentityManager) Watch(_ structs.WIHandle) <-chan *structs.SignedWorkloadIdentity, func(...)`

**位置**：[L154](file:///d:/claude/nomad/client/widmgr/mock.go#L154)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `_` | `structs.WIHandle` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `<-chan *structs.SignedWorkloadIdentity` | 通道 |
| `func(...)` | — |

### Shutdown()

**签名**：`func (m *MockIdentityManager) Shutdown() `

**位置**：[L160](file:///d:/claude/nomad/client/widmgr/mock.go#L160)

**中文说明**：关闭对象，释放相关资源。

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
- **加密安全**：使用 Go crypto 标准库实现加密、签名或 TLS 通信
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [signer.go](file:///d:/claude/nomad/client/widmgr/signer.go) | 同目录源文件 |
| [widmgr.go](file:///d:/claude/nomad/client/widmgr/widmgr.go) | 同目录源文件 |

