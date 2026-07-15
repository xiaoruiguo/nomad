# virtual.go 代码说明文档

> 文件路径：[virtual.go](file:///d:/claude/nomad/acl/virtual.go)
> 总行数：43 行
> 所属包：`acl`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件是 **Nomad ACL 虚拟策略单例工厂**，创建三个特殊的 `ACL` 对象，用于模拟非用户来源的权限场景。这些虚拟 ACL 不来自任何用户策略（`Policy`），而是通过直接设置 `ACL` 结构体的内部字段来模拟特定角色或状态的权限。

**核心职责**：

1. **`ClientACL`**：模拟 Nomad Client 节点的自身权限，允许该节点操作自己池中的资源。
2. **`ServerACL`**：模拟 Nomad Server 节点的自身权限，允许 Server 读写 Agent、操作 Server RPC。
3. **`ACLsDisabledACL`**：模拟 ACL 功能全局禁用时的权限，所有操作自动允许。

**使用场景**：当请求不携带 ACL Token（如节点间内部 RPC、ACL 禁用的集群），或需要以节点身份执行操作时，使用这些虚拟 ACL 对象进行权限检查，避免 nil 检查的繁琐。

---

## 2. 类型定义

该文件未定义新类型，复用 `acl.go` 中定义的 `ACL` 结构体。

---

## 3. 常量与变量

### 变量（单例）

| 名称 | 类型 | 初始化函数 | 行号 |
|------|------|-----------|------|
| `ClientACL` | `*ACL` | `initClientACL()` | [L7](file:///d:/claude/nomad/acl/virtual.go#L7) |
| `ServerACL` | `*ACL` | `initServerACL()` | [L8](file:///d:/claude/nomad/acl/virtual.go#L8) |
| `ACLsDisabledACL` | `*ACL` | `initACLsDisabledACL()` | [L9](file:///d:/claude/nomad/acl/virtual.go#L9) |

这三个变量在包初始化时（`var` 声明 + init 函数）创建，是全局单例。

---

## 4. 方法与函数

| 函数 | 参数 | 返回值 | 行号 |
|------|------|--------|------|
| `initClientACL` | - | `*ACL` | [L11](file:///d:/claude/nomad/acl/virtual.go#L11) |
| `NewClientACL` | `pool string` | `*ACL` | [L17](file:///d:/claude/nomad/acl/virtual.go#L17) |
| `initServerACL` | - | `*ACL` | [L27](file:///d:/claude/nomad/acl/virtual.go#L27) |
| `initACLsDisabledACL` | - | `*ACL` | [L36](file:///d:/claude/nomad/acl/virtual.go#L36) |

---

## 5. 核心方法详解

### NewClientACL()

**签名**：`func NewClientACL(pool string) *ACL`

**位置**：[L17](file:///d:/claude/nomad/acl/virtual.go#L17)

**功能**：创建指定节点池的 Client 虚拟 ACL。

**创建流程**：

1. 调用 `NewACL(false, []*Policy{})` 创建空策略 ACL（所有命名空间/节点池权限默认拒绝）
2. 直接设置内部字段：
   - `client = PolicyWrite` — 允许客户端操作
   - `pool = pool` — 限定操作的节点池名称
   - `agent = PolicyRead` — 允许读取 Agent 信息
   - `server = PolicyRead` — 允许读取 Server 信息（用于 RPC 转发）

**权限效果**：此 ACL 允许 Client 节点：
- 执行客户端操作（`AllowClientOp` 在池名匹配时返回 true）
- 读取 Agent 和 Server 信息
- 但不能写入 Agent/Server，不能操作命名空间资源

**`ClientACL` 单例**：`initClientACL()` 调用 `NewClientACL("*")`，`pool = "*"` 表示匹配所有节点池。

---

### initServerACL()

**位置**：[L27](file:///d:/claude/nomad/acl/virtual.go#L27)

**功能**：创建 Server 虚拟 ACL。

**创建流程**：

1. 调用 `NewACL(false, []*Policy{})` 创建空策略 ACL
2. 直接设置：
   - `agent = PolicyRead` — 允许读取 Agent 信息
   - `server = PolicyWrite` — 允许 Server 操作（`AllowServerOp` 返回 true）

**权限效果**：Server 节点使用此 ACL 执行内部 RPC 时，可以：
- 读取 Agent 信息
- 执行 Server 操作（如 Raft 相关）
- 但不能操作命名空间资源（需通过用户 Token 的 ACL）

---

### initACLsDisabledACL()

**位置**：[L36](file:///d:/claude/nomad/acl/virtual.go#L36)

**功能**：创建 ACL 禁用模式的虚拟 ACL。

**创建流程**：

1. 调用 `NewACL(false, []*Policy{})` 创建空策略 ACL
2. 直接设置 `aclsDisabled = true`

**权限效果**：此 ACL 的所有 `Allow*` 方法在检查 `a.aclsDisabled` 时直接返回 `true`（除 `AllowAgentDebug` 和 `AllowSentinelOperation` 有特殊逻辑）。模拟"ACL 未启用，全部允许"的场景。

**特殊例外**：
- `AllowAgentDebug(isDebugEnabled)`：ACL 禁用时仍需检查 `isDebugEnabled` 标志
- `AllowSentinelOperation`：ACL 禁用时返回 `false`（Sentinel 在 ACL 禁用时完全禁用）

---

## 6. 依赖关系

### 导入包

该文件无显式导入（`package acl` 内部文件，隐式访问同包的 `NewACL` 和 `ACL` 类型）。

### 内部依赖

| 依赖 | 关系 |
|------|------|
| `acl.go` | 提供 `ACL` 结构体和 `NewACL()` 构造函数 |
| `policy.go` | 提供 `Policy` 类型和策略常量（`PolicyWrite`/`PolicyRead`） |

---

## 7. 设计模式与技术特点

- **单例模式**：三个全局变量在包初始化时创建，全程序共享同一实例。由于 `ACL` 使用不可变基数树，单例是线程安全的。
- **工厂函数**：`NewClientACL(pool)` 是公开的工厂函数（首字母大写），允许外部按需创建特定池的 Client ACL；`initServerACL`/`initACLsDisabledACL` 是私有初始化函数（首字母小写），仅用于创建单例。
- **直接字段操作**：绕过 `NewACL()` 的正常编译流程，直接修改 `ACL` 的非导出字段（`client`/`pool`/`agent`/`server`/`aclsDisabled`）。这在同包内是合法的，但意味着这些虚拟 ACL 不经过策略验证和能力展开，是"特权"构造。
- **空策略基础**：所有虚拟 ACL 都以 `NewACL(false, []*Policy{})` 为基础（空策略，默认全拒绝），然后选择性开放特定权限，遵循最小权限原则。
- **Panic on Error**：`NewACL()` 理论上可能返回 error，但空策略不会出错，因此使用 `panic(err)` 处理——这是启动时不变式，若失败说明代码有严重 bug。

---

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl.go](file:///d:/claude/nomad/acl/acl.go) | 提供 `ACL` 结构体、`NewACL()` 构造函数和所有 `Allow*` 方法 |
| [policy.go](file:///d:/claude/nomad/acl/policy.go) | 提供策略常量（`PolicyWrite`/`PolicyRead`/`PolicyDeny`） |
| [../nomad/acl.go](file:///d:/claude/nomad/nomad/acl.go) | Server 层在 ACL 禁用时使用 `ACLsDisabledACL` |
| [../client/client.go](file:///d:/claude/nomad/client/client.go) | Client 层可能使用 `ClientACL` 进行内部操作鉴权 |
| [../command/agent/http.go](file:///d:/claude/nomad/command/agent/http.go) | HTTP 服务器在 ACL 禁用时使用 `ACLsDisabledACL` |
