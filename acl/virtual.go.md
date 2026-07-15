# virtual.go 代码说明文档

> 文件路径：[acl/virtual.go](file:///d:/claude/nomad/acl/virtual.go)
> 总行数：44 行
> 所属包：`acl`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `acl` 包，包含 4 个方法/函数。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ClientACL` | `—` | `initClientACL()` | — |
| `ServerACL` | `—` | `initServerACL()` | — |
| `ACLsDisabledACL` | `—` | `initACLsDisabledACL()` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `initClientACL` | - | `` | `*ACL` | [L10](file:///d:/claude/nomad/acl/virtual.go#L10) |
| `NewClientACL` | - | `pool string` | `*ACL` | [L14](file:///d:/claude/nomad/acl/virtual.go#L14) |
| `initServerACL` | - | `` | `*ACL` | [L26](file:///d:/claude/nomad/acl/virtual.go#L26) |
| `initACLsDisabledACL` | - | `` | `*ACL` | [L36](file:///d:/claude/nomad/acl/virtual.go#L36) |

## 5. 核心方法详解

### NewClientACL()

**签名**：`func NewClientACL(pool string) *ACL`

**位置**：[L14](file:///d:/claude/nomad/acl/virtual.go#L14)

**中文说明**：创建并返回一个新的 ClientACL 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `pool` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACL` | — |

## 6. 依赖关系

该文件无导入包。

## 7. 设计模式与技术特点

- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl.go](file:///d:/claude/nomad/acl/acl.go) | 同目录源文件 |
| [policy.go](file:///d:/claude/nomad/acl/policy.go) | 同目录源文件 |

