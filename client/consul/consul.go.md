# consul.go 代码说明文档

> 文件路径：[consul/consul.go](file:///d:/claude/nomad/client/consul/consul.go)
> 总行数：203 行
> 所属包：`consul`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Consul 集成子包**（`client/consul`），提供 Consul API 的适配层。

## 2. 类型定义

### SupportedProxiesAPI

**定义位置**：[L24](file:///d:/claude/nomad/client/consul/consul.go#L24)

**类型**：interface

```go
	Proxies
```

### SupportedProxiesAPIFunc

**定义位置**：[L30](file:///d:/claude/nomad/client/consul/consul.go#L30)

**类型定义**：`func(...)`

### JWTLoginRequest

**定义位置**：[L33](file:///d:/claude/nomad/client/consul/consul.go#L33)

**类型**：struct

```go
	JWT string
	AuthMethodName string
	Meta map[string]string
```

### Client

**定义位置**：[L41](file:///d:/claude/nomad/client/consul/consul.go#L41)

**类型**：interface

```go
	DeriveTokenWithJWT
	RevokeTokens
	TokenPreflightCheck
```

### consulClient

**定义位置**：[L53](file:///d:/claude/nomad/client/consul/consul.go#L53)

**类型**：struct

```go
	client *consulapi.Client
	partition string
	config *config.ConsulConfig
	logger hclog.Logger
	preflightCheckTimeout time.Duration
	preflightCheckBaseInterval time.Duration
```

**关联方法**（3 个）：`DeriveTokenWithJWT`, `RevokeTokens`, `TokenPreflightCheck`

### ConsulClientFunc

**定义位置**：[L73](file:///d:/claude/nomad/client/consul/consul.go#L73)

**类型定义**：`func(...)`

### NodeGetter

**定义位置**：[L77](file:///d:/claude/nomad/client/consul/consul.go#L77)

**类型**：interface

```go
	GetNode
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewConsulClientFactory` | - | `nodeGetter NodeGetter` | `ConsulClientFunc` | [L83](file:///d:/claude/nomad/client/consul/consul.go#L83) |
| `durationFromMeta` | - | `node *structs.Node, key string, defaultDur time.Duration` | `time.Duration` | [L129](file:///d:/claude/nomad/client/consul/consul.go#L129) |
| `DeriveTokenWithJWT` | `c *consulClient` | `req JWTLoginRequest` | `*consulapi.ACLToken, error` | [L142](file:///d:/claude/nomad/client/consul/consul.go#L142) |
| `RevokeTokens` | `c *consulClient` | `tokens []*consulapi.ACLToken` | `error` | [L154](file:///d:/claude/nomad/client/consul/consul.go#L154) |
| `TokenPreflightCheck` | `c *consulClient` | `pctx context.Context, t *consulapi.ACLToken` | `error` | [L170](file:///d:/claude/nomad/client/consul/consul.go#L170) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/useragent` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs/config` | 内部包 |
| `github.com/hashicorp/consul/api` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [consul_test.go](file:///d:/claude/nomad/client/consul/consul_test.go) | 对应测试文件 |

