# node_meta.go 代码说明文档

> 文件路径：[node_meta.go](file:///d:/claude/nomad/api/node_meta.go)
> 总行数：72 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **节点（Node）API 客户端**，提供节点查询、排水、资格管理、节点池操作等客户端方法。

## 2. 类型定义

### NodeMetaApplyRequest

**定义位置**：[L7](file:///d:/claude/nomad/api/node_meta.go#L7)

**类型**：struct

```go
	NodeID string
	Meta map[string]*string
```

### NodeMetaResponse

**定义位置**：[L13](file:///d:/claude/nomad/api/node_meta.go#L13)

**类型**：struct

```go
	Meta map[string]string
	Dynamic map[string]*string
	Static map[string]string
```

### NodeMeta

**定义位置**：[L25](file:///d:/claude/nomad/api/node_meta.go#L25)

**类型**：struct

```go
	client *Client
```

**关联方法**（2 个）：`Apply`, `Read`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Meta` | `n *Nodes` | - | `*NodeMeta` | [L30](file:///d:/claude/nomad/api/node_meta.go#L30) |
| `Apply` | `n *NodeMeta` | `meta *NodeMetaApplyRequest, qo *QueryOptions` | `*NodeMetaResponse, error` | [L36](file:///d:/claude/nomad/api/node_meta.go#L36) |
| `Read` | `n *NodeMeta` | `nodeID string, qo *QueryOptions` | `*NodeMetaResponse, error` | [L51](file:///d:/claude/nomad/api/node_meta.go#L51) |

## 5. 核心方法详解

## 6. 依赖关系

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [node_meta_test.go](file:///d:/claude/nomad/api/node_meta_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

