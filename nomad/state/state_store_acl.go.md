# state_store_acl.go 代码说明文档

> 文件路径：[state/state_store_acl.go](file:///d:/claude/nomad/nomad/state/state_store_acl.go)
> 总行数：354 行
> 所属包：`state`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **状态存储子包**（`nomad/state`），实现 Nomad Server 的状态存储（基于 MemDB），管理所有集群状态的内存索引和快照恢复。是 Raft FSM 的数据后端。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ACLTokensByExpired` | `s *StateStore` | `global bool` | `memdb.ResultIterator, error` | [L22](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L22) |
| `expiresIndexName` | - | `global bool` | `string` | [L34](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L34) |
| `UpsertACLRoles` | `s *StateStore` | `msgType structs.MessageType, index uint64, roles []*structs.ACLRole, allowMi...` | `error` | [L44](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L44) |
| `upsertACLRoleTxn` | `s *StateStore` | `index uint64, txn *txn, role *structs.ACLRole, allowMissingPolicies bool` | `bool, error` | [L84](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L84) |
| `validateACLRolePolicyLinksTxn` | `s *StateStore` | `txn *txn, role *structs.ACLRole` | `error` | [L165](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L165) |
| `DeleteACLRolesByID` | `s *StateStore` | `msgType structs.MessageType, index uint64, roleIDs []string` | `error` | [L182](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L182) |
| `deleteACLRoleByIDTxn` | `s *StateStore` | `txn *txn, roleID string` | `error` | [L205](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L205) |
| `GetACLRoles` | `s *StateStore` | `ws memdb.WatchSet` | `memdb.ResultIterator, error` | [L224](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L224) |
| `GetACLRoleByID` | `s *StateStore` | `ws memdb.WatchSet, roleID string` | `*structs.ACLRole, error` | [L240](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L240) |
| `getACLRoleByIDTxn` | `s *StateStore` | `txn ReadTxn, ws memdb.WatchSet, roleID string` | `*structs.ACLRole, error` | [L249](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L249) |
| `GetACLRoleByName` | `s *StateStore` | `ws memdb.WatchSet, roleName string` | `*structs.ACLRole, error` | [L267](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L267) |
| `GetACLRoleByIDPrefix` | `s *StateStore` | `ws memdb.WatchSet, idPrefix string` | `memdb.ResultIterator, error` | [L285](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L285) |
| `fixTokenRoleLinks` | `s *StateStore` | `txn ReadTxn, original *structs.ACLToken` | `*structs.ACLToken, error` | [L302](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L302) |

## 5. 核心方法详解

### GetACLRoles()

**签名**：`func (s *StateStore) GetACLRoles(ws memdb.WatchSet) memdb.ResultIterator, error`

**位置**：[L224](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L224)

### GetACLRoleByID()

**签名**：`func (s *StateStore) GetACLRoleByID(ws memdb.WatchSet, roleID string) *structs.ACLRole, error`

**位置**：[L240](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L240)

### GetACLRoleByName()

**签名**：`func (s *StateStore) GetACLRoleByName(ws memdb.WatchSet, roleName string) *structs.ACLRole, error`

**位置**：[L267](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L267)

### GetACLRoleByIDPrefix()

**签名**：`func (s *StateStore) GetACLRoleByIDPrefix(ws memdb.WatchSet, idPrefix string) memdb.ResultIterator, error`

**位置**：[L285](file:///d:/claude/nomad/nomad/state/state_store_acl.go#L285)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `slices` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-memdb` | 第三方库 |

## 7. 设计模式与技术特点

- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [state_store_acl_test.go](file:///d:/claude/nomad/nomad/state/state_store_acl_test.go) | 对应测试文件 |

