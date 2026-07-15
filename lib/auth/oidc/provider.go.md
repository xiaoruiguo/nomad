# provider.go 代码说明文档

> 文件路径：[lib/auth/oidc/provider.go](file:///d:/claude/nomad/lib/auth/oidc/provider.go)
> 总行数：197 行
> 所属包：`oidc`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **认证库子包**（`lib/auth`），实现 Nomad 的认证辅助功能，包括 OIDC（OpenID Connect）和 SSO 集成、令牌管理和认证流程处理。

## 2. 类型定义

### ProviderCache

**定义位置**：[L55](file:///d:/claude/nomad/lib/auth/oidc/provider.go#L55)

**中文说明**：ProviderCache 是一个缓存，存储常用数据以减少重复计算或 I/O。

**类型**：struct

```go
type ProviderCache struct {
	providers map[string]*oidc.Provider
	mu sync.RWMutex
	cancel context.CancelFunc
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `providers` | `map[string]*oidc.Provider` | 映射表 |
| `mu` | `sync.RWMutex` | 读写锁，保护并发访问 |
| `cancel` | `context.CancelFunc` | 取消 |

**关联方法**（5 个）：`Get`, `Delete`, `Shutdown`, `runCleanupLoop`, `clear`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `cacheExpiry` | `—` | `6 * time.Hour` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `providerConfig` | - | `authMethod *structs.ACLAuthMethod` | `*oidc.Config, error` | [L18](file:///d:/claude/nomad/lib/auth/oidc/provider.go#L18) |
| `NewProviderCache` | - | `` | `*ProviderCache` | [L66](file:///d:/claude/nomad/lib/auth/oidc/provider.go#L66) |
| `Get` | `c *ProviderCache` | `authMethod *structs.ACLAuthMethod` | `*oidc.Provider, error` | [L86](file:///d:/claude/nomad/lib/auth/oidc/provider.go#L86) |
| `Delete` | `c *ProviderCache` | `name string` | `` | [L144](file:///d:/claude/nomad/lib/auth/oidc/provider.go#L144) |
| `Shutdown` | `c *ProviderCache` | `` | `` | [L158](file:///d:/claude/nomad/lib/auth/oidc/provider.go#L158) |
| `runCleanupLoop` | `c *ProviderCache` | `ctx context.Context` | `` | [L166](file:///d:/claude/nomad/lib/auth/oidc/provider.go#L166) |
| `clear` | `c *ProviderCache` | `` | `` | [L186](file:///d:/claude/nomad/lib/auth/oidc/provider.go#L186) |

## 5. 核心方法详解

### NewProviderCache()

**签名**：`func NewProviderCache() *ProviderCache`

**位置**：[L66](file:///d:/claude/nomad/lib/auth/oidc/provider.go#L66)

**中文说明**：创建并返回一个新的 ProviderCache 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ProviderCache` | — |

### Get()

**签名**：`func (c *ProviderCache) Get(authMethod *structs.ACLAuthMethod) *oidc.Provider, error`

**位置**：[L86](file:///d:/claude/nomad/lib/auth/oidc/provider.go#L86)

**中文说明**：获取对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `authMethod` | `*structs.ACLAuthMethod` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*oidc.Provider` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (c *ProviderCache) Delete(name string) `

**位置**：[L144](file:///d:/claude/nomad/lib/auth/oidc/provider.go#L144)

**中文说明**：删除指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 名称 |

### Shutdown()

**签名**：`func (c *ProviderCache) Shutdown() `

**位置**：[L158](file:///d:/claude/nomad/lib/auth/oidc/provider.go#L158)

**中文说明**：关闭对象，释放相关资源。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/cap/oidc` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **缓存模式**：实现缓存机制，减少重复计算或 I/O 操作
- **后台协程**：启动 goroutine 执行后台任务
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [provider_test.go](file:///d:/claude/nomad/lib/auth/oidc/provider_test.go) | 对应测试文件 |
| [client_assertion.go](file:///d:/claude/nomad/lib/auth/oidc/client_assertion.go) | 同目录源文件 |
| [request.go](file:///d:/claude/nomad/lib/auth/oidc/request.go) | 同目录源文件 |
| [server.go](file:///d:/claude/nomad/lib/auth/oidc/server.go) | 同目录源文件 |

