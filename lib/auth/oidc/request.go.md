# request.go 代码说明文档

> 文件路径：[lib/auth/oidc/request.go](file:///d:/claude/nomad/lib/auth/oidc/request.go)
> 总行数：114 行
> 所属包：`oidc`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **认证库子包**（`lib/auth`），实现 Nomad 的认证辅助功能，包括 OIDC（OpenID Connect）和 SSO 集成、令牌管理和认证流程处理。

## 2. 类型定义

### RequestCache

**定义位置**：[L38](file:///d:/claude/nomad/lib/auth/oidc/request.go#L38)

**类型**：struct

```go
	c *expirable.LRU[string, *oidc.Req]
	lock sync.Mutex
```

**关联方法**（6 个）：`store`, `storeLocked`, `Load`, `loadLocked`, `LoadOrAdd`, `LoadAndDelete`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `MaxRequests` | `1000` |

### 变量

| 名称 | 值 |
|------|----|
| `ErrNonceReuse` | `errors.New("nonce reuse detected")` |
| `ErrTooManyRequests` | `errors.New("too many auth requests")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewRequestCache` | - | `timeout time.Duration` | `*RequestCache` | [L32](file:///d:/claude/nomad/lib/auth/oidc/request.go#L32) |
| `store` | `rc *RequestCache` | `req *oidc.Req` | `error` | [L45](file:///d:/claude/nomad/lib/auth/oidc/request.go#L45) |
| `storeLocked` | `rc *RequestCache` | `req *oidc.Req` | `error` | [L51](file:///d:/claude/nomad/lib/auth/oidc/request.go#L51) |
| `Load` | `rc *RequestCache` | `nonce string` | `*oidc.Req` | [L69](file:///d:/claude/nomad/lib/auth/oidc/request.go#L69) |
| `loadLocked` | `rc *RequestCache` | `nonce string` | `*oidc.Req` | [L75](file:///d:/claude/nomad/lib/auth/oidc/request.go#L75) |
| `LoadOrAdd` | `rc *RequestCache` | `clientNonce string, create func(...)` | `*oidc.Req, error` | [L86](file:///d:/claude/nomad/lib/auth/oidc/request.go#L86) |
| `LoadAndDelete` | `rc *RequestCache` | `nonce string` | `*oidc.Req` | [L105](file:///d:/claude/nomad/lib/auth/oidc/request.go#L105) |

## 5. 核心方法详解

### NewRequestCache()

**签名**：`func NewRequestCache(timeout time.Duration) *RequestCache`

**位置**：[L32](file:///d:/claude/nomad/lib/auth/oidc/request.go#L32)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/cap/oidc` | 第三方库 |
| `github.com/hashicorp/golang-lru/v2/expirable` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **缓存模式**：实现缓存机制，减少重复计算或 I/O 操作

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [request_test.go](file:///d:/claude/nomad/lib/auth/oidc/request_test.go) | 对应测试文件 |

