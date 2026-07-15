# acl.go 代码说明文档

> 文件路径：[client/acl.go](file:///d:/claude/nomad/client/acl.go)
> 总行数：355 行
> 所属包：`client`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Nomad Client 核心包**（`client/`），实现客户端节点的主要功能，包括分配管理、任务执行、心跳上报和驱动调度。

## 2. 类型定义

### clientACLResolver

**定义位置**：[L37](file:///d:/claude/nomad/client/acl.go#L37)

**中文说明**：clientACLResolver 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type clientACLResolver struct {
	aclCache *structs.ACLCache[*acl.ACL]
	policyCache *structs.ACLCache[*structs.ACLPolicy]
	tokenCache *structs.ACLCache[*structs.AuthenticatedIdentity]
	roleCache *structs.ACLCache[*structs.ACLRole]
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `aclCache` | `*structs.ACLCache[*acl.ACL]` | — |
| `policyCache` | `*structs.ACLCache[*structs.ACLPolicy]` | — |
| `tokenCache` | `*structs.ACLCache[*structs.AuthenticatedIdentity]` | — |
| `roleCache` | `*structs.ACLCache[*structs.ACLRole]` | — |

**关联方法**（1 个）：`init`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `policyCacheSize` | `—` | `64` | — |
| `aclCacheSize` | `—` | `64` | — |
| `tokenCacheSize` | `—` | `128` | — |
| `roleCacheSize` | `—` | `64` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `init` | `c *clientACLResolver` | `` | `` | [L53](file:///d:/claude/nomad/client/acl.go#L53) |
| `ResolveToken` | `c *Client` | `bearerToken string` | `*acl.ACL, error` | [L62](file:///d:/claude/nomad/client/acl.go#L62) |
| `resolveTokenAndACL` | `c *Client` | `bearerToken string` | `*acl.ACL, *structs.AuthenticatedIdentity, error` | [L67](file:///d:/claude/nomad/client/acl.go#L67) |
| `resolveTokenValue` | `c *Client` | `bearerToken string` | `*structs.AuthenticatedIdentity, error` | [L144](file:///d:/claude/nomad/client/acl.go#L144) |
| `resolvePolicies` | `c *Client` | `secretID string, policies []string` | `[]*structs.ACLPolicy, error` | [L185](file:///d:/claude/nomad/client/acl.go#L185) |
| `resolveTokenACLRoles` | `c *Client` | `secretID string, roleLinks []*structs.ACLTokenRoleLink` | `[]string, error` | [L253](file:///d:/claude/nomad/client/acl.go#L253) |

## 5. 核心方法详解

该文件无导出的核心方法。

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
| [agent_endpoint.go](file:///d:/claude/nomad/client/agent_endpoint.go) | 同目录源文件 |
| [alloc_endpoint.go](file:///d:/claude/nomad/client/alloc_endpoint.go) | 同目录源文件 |
| [client.go](file:///d:/claude/nomad/client/client.go) | 同目录源文件 |
| [client_stats_endpoint.go](file:///d:/claude/nomad/client/client_stats_endpoint.go) | 同目录源文件 |
| [csi_endpoint.go](file:///d:/claude/nomad/client/csi_endpoint.go) | 同目录源文件 |

