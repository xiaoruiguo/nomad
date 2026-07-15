# acl.go 代码说明文档

> 文件路径：[acl.go](file:///d:/claude/nomad/client/acl.go)
> 总行数：355 行
> 所属包：`client`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 Nomad Client 核心包（`client`），提供 Client 节点运行所需的功能。

## 2. 类型定义

### clientACLResolver

**定义位置**：[L37](file:///d:/claude/nomad/client/acl.go#L37)

**类型**：struct

```go
	aclCache *structs.ACLCache[*acl.ACL]
	policyCache *structs.ACLCache[*structs.ACLPolicy]
	tokenCache *structs.ACLCache[*structs.AuthenticatedIdentity]
	roleCache *structs.ACLCache[*structs.ACLRole]
```

**关联方法**（1 个）：`init`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `policyCacheSize` | `64` |
| `aclCacheSize` | `64` |
| `tokenCacheSize` | `128` |
| `roleCacheSize` | `64` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `init` | `c *clientACLResolver` | - | - | [L53](file:///d:/claude/nomad/client/acl.go#L53) |
| `ResolveToken` | `c *Client` | `bearerToken string` | `*acl.ACL, error` | [L62](file:///d:/claude/nomad/client/acl.go#L62) |
| `resolveTokenAndACL` | `c *Client` | `bearerToken string` | `*acl.ACL, *structs.AuthenticatedIdentity, error` | [L67](file:///d:/claude/nomad/client/acl.go#L67) |
| `resolveTokenValue` | `c *Client` | `bearerToken string` | `*structs.AuthenticatedIdentity, error` | [L144](file:///d:/claude/nomad/client/acl.go#L144) |
| `resolvePolicies` | `c *Client` | `secretID string, policies []string` | `[]*structs.ACLPolicy, error` | [L185](file:///d:/claude/nomad/client/acl.go#L185) |
| `resolveTokenACLRoles` | `c *Client` | `secretID string, roleLinks []*structs.ACLTokenRoleLink` | `[]string, error` | [L253](file:///d:/claude/nomad/client/acl.go#L253) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `time` | 标准库 |
| `github.com/hashicorp/nomad/acl` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl_test.go](file:///d:/claude/nomad/client/acl_test.go) | 对应测试文件 |

