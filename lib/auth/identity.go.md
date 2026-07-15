# identity.go 代码说明文档

> 文件路径：[lib/auth/identity.go](file:///d:/claude/nomad/lib/auth/identity.go)
> 总行数：40 行
> 所属包：`auth`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **认证库子包**（`lib/auth`），实现 Nomad 的认证辅助功能，包括 OIDC（OpenID Connect）和 SSO 集成、令牌管理和认证流程处理。

## 2. 类型定义

### Identity

**定义位置**：[L10](file:///d:/claude/nomad/lib/auth/identity.go#L10)

**中文说明**：Identity 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Identity struct {
	Claims interface{}
	ClaimMappings map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Claims` | `interface{}` | 接口类型，可持有任意值 |
| `ClaimMappings` | `map[string]string` | 映射表 |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewIdentity` | - | `authMethodConfig *structs.ACLAuthMethodConfig, authClaims *structs.ACLAuthClaims` | `*Identity` | [L22](file:///d:/claude/nomad/lib/auth/identity.go#L22) |

## 5. 核心方法详解

### NewIdentity()

**签名**：`func NewIdentity(authMethodConfig *structs.ACLAuthMethodConfig, authClaims *structs.ACLAuthClaims) *Identity`

**位置**：[L22](file:///d:/claude/nomad/lib/auth/identity.go#L22)

**中文说明**：创建并返回一个新的 Identity 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `authMethodConfig` | `*structs.ACLAuthMethodConfig` | — |
| `authClaims` | `*structs.ACLAuthClaims` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Identity` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [identity_test.go](file:///d:/claude/nomad/lib/auth/identity_test.go) | 对应测试文件 |
| [binder.go](file:///d:/claude/nomad/lib/auth/binder.go) | 同目录源文件 |
| [claims.go](file:///d:/claude/nomad/lib/auth/claims.go) | 同目录源文件 |

