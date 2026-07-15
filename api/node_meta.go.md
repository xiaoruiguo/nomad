# node_meta.go 代码说明文档

> 文件路径：[api/node_meta.go](file:///d:/claude/nomad/api/node_meta.go)
> 总行数：72 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `node_meta.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### NodeMetaApplyRequest

**定义位置**：[L7](file:///d:/claude/nomad/api/node_meta.go#L7)

**中文说明**：NodeMetaApplyRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type NodeMetaApplyRequest struct {
	NodeID string
	Meta map[string]*string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 字符串 |
| `Meta` | `map[string]*string` | 元数据 |

### NodeMetaResponse

**定义位置**：[L13](file:///d:/claude/nomad/api/node_meta.go#L13)

**中文说明**：NodeMetaResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type NodeMetaResponse struct {
	Meta map[string]string
	Dynamic map[string]*string
	Static map[string]string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `map[string]string` | 元数据 |
| `Dynamic` | `map[string]*string` | 映射表 |
| `Static` | `map[string]string` | 映射表 |

### NodeMeta

**定义位置**：[L25](file:///d:/claude/nomad/api/node_meta.go#L25)

**中文说明**：NodeMeta 是一个元数据结构体，包含对象的附加元信息。

**类型**：struct

```go
type NodeMeta struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（2 个）：`Apply`, `Read`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Meta` | `n *Nodes` | `` | `*NodeMeta` | [L30](file:///d:/claude/nomad/api/node_meta.go#L30) |
| `Apply` | `n *NodeMeta` | `meta *NodeMetaApplyRequest, qo *QueryOptions` | `*NodeMetaResponse, error` | [L36](file:///d:/claude/nomad/api/node_meta.go#L36) |
| `Read` | `n *NodeMeta` | `nodeID string, qo *QueryOptions` | `*NodeMetaResponse, error` | [L51](file:///d:/claude/nomad/api/node_meta.go#L51) |

## 5. 核心方法详解

### Apply()

**签名**：`func (n *NodeMeta) Apply(meta *NodeMetaApplyRequest, qo *QueryOptions) *NodeMetaResponse, error`

**位置**：[L36](file:///d:/claude/nomad/api/node_meta.go#L36)

**中文说明**：应用对象的变更。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `meta` | `*NodeMetaApplyRequest` | 元数据 |
| `qo` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NodeMetaResponse` | — |
| `error` | 错误信息 |

### Read()

**签名**：`func (n *NodeMeta) Read(nodeID string, qo *QueryOptions) *NodeMetaResponse, error`

**位置**：[L51](file:///d:/claude/nomad/api/node_meta.go#L51)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `nodeID` | `string` | 字符串 |
| `qo` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NodeMetaResponse` | — |
| `error` | 错误信息 |

## 6. 依赖关系

该文件无导入包。

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [node_meta_test.go](file:///d:/claude/nomad/api/node_meta_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

