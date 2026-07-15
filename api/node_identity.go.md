# node_identity.go 代码说明文档

> 文件路径：[api/node_identity.go](file:///d:/claude/nomad/api/node_identity.go)
> 总行数：74 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `node_identity.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### NodeIdentityGetRequest

**定义位置**：[L8](file:///d:/claude/nomad/api/node_identity.go#L8)

**中文说明**：NodeIdentityGetRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeIdentityGetRequest struct {
	NodeID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 字符串 |

### NodeIdentityGetResponse

**定义位置**：[L14](file:///d:/claude/nomad/api/node_identity.go#L14)

**中文说明**：NodeIdentityGetResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NodeIdentityGetResponse struct {
	Claims map[string]any
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Claims` | `map[string]any` | 映射表 |

### NodeIdentityRenewRequest

**定义位置**：[L18](file:///d:/claude/nomad/api/node_identity.go#L18)

**中文说明**：NodeIdentityRenewRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeIdentityRenewRequest struct {
	NodeID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 字符串 |

### NodeIdentityRenewResponse

**定义位置**：[L22](file:///d:/claude/nomad/api/node_identity.go#L22)

**中文说明**：NodeIdentityRenewResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

### NodeIdentity

**定义位置**：[L24](file:///d:/claude/nomad/api/node_identity.go#L24)

**中文说明**：NodeIdentity 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeIdentity struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（2 个）：`Get`, `Renew`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Identity` | `n *Nodes` | `` | `*NodeIdentity` | [L28](file:///d:/claude/nomad/api/node_identity.go#L28) |
| `Get` | `n *NodeIdentity` | `req *NodeIdentityGetRequest, qo *QueryOptions` | `*NodeIdentityGetResponse, error` | [L38](file:///d:/claude/nomad/api/node_identity.go#L38) |
| `Renew` | `n *NodeIdentity` | `req *NodeIdentityRenewRequest, qo *QueryOptions` | `*NodeIdentityRenewResponse, error` | [L66](file:///d:/claude/nomad/api/node_identity.go#L66) |

## 5. 核心方法详解

### Get()

**签名**：`func (n *NodeIdentity) Get(req *NodeIdentityGetRequest, qo *QueryOptions) *NodeIdentityGetResponse, error`

**位置**：[L38](file:///d:/claude/nomad/api/node_identity.go#L38)

**中文说明**：获取对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `req` | `*NodeIdentityGetRequest` | — |
| `qo` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NodeIdentityGetResponse` | — |
| `error` | 错误信息 |

## 6. 依赖关系

该文件无导入包。

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [node_identity_test.go](file:///d:/claude/nomad/api/node_identity_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

