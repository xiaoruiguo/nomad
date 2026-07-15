# node_pools.go 代码说明文档

> 文件路径：[node_pools.go](file:///d:/claude/nomad/api/node_pools.go)
> 总行数：182 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **节点（Node）API 客户端**，提供节点查询、排水、资格管理、节点池操作等客户端方法。

## 2. 类型定义

### NodePools

**定义位置**：[L23](file:///d:/claude/nomad/api/node_pools.go#L23)

**类型**：struct

```go
	client *Client
```

**关联方法**（7 个）：`List`, `PrefixList`, `Info`, `Register`, `Delete`, `ListJobs`, `ListNodes`

### NodePool

**定义位置**：[L119](file:///d:/claude/nomad/api/node_pools.go#L119)

**类型**：struct

```go
	Name string `hcl:"name,label"`
	Description string `hcl:"description,optional"`
	Meta map[string]string `hcl:"meta,block"`
	NodeIdentityTTL time.Duration `hcl:"node_identity_ttl,optional"`
	SchedulerConfiguration *NodePoolSchedulerConfiguration `hcl:"scheduler_config,block"`
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（2 个）：`MarshalJSON`, `UnmarshalJSON`

### NodePoolSchedulerConfiguration

**定义位置**：[L178](file:///d:/claude/nomad/api/node_pools.go#L178)

**类型**：struct

```go
	SchedulerAlgorithm SchedulerAlgorithm `hcl:"scheduler_algorithm,optional"`
	MemoryOversubscriptionEnabled *bool `hcl:"memory_oversubscription_enabled,optional"`
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `NodePoolAll` | `"all"` |
| `NodePoolDefault` | `"default"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NodePools` | `c *Client` | - | `*NodePools` | [L28](file:///d:/claude/nomad/api/node_pools.go#L28) |
| `List` | `n *NodePools` | `q *QueryOptions` | `[]*NodePool, *QueryMeta, error` | [L33](file:///d:/claude/nomad/api/node_pools.go#L33) |
| `PrefixList` | `n *NodePools` | `prefix string, q *QueryOptions` | `[]*NodePool, *QueryMeta, error` | [L43](file:///d:/claude/nomad/api/node_pools.go#L43) |
| `Info` | `n *NodePools` | `name string, q *QueryOptions` | `*NodePool, *QueryMeta, error` | [L52](file:///d:/claude/nomad/api/node_pools.go#L52) |
| `Register` | `n *NodePools` | `pool *NodePool, w *WriteOptions` | `*WriteMeta, error` | [L66](file:///d:/claude/nomad/api/node_pools.go#L66) |
| `Delete` | `n *NodePools` | `name string, w *WriteOptions` | `*WriteMeta, error` | [L82](file:///d:/claude/nomad/api/node_pools.go#L82) |
| `ListJobs` | `n *NodePools` | `poolName string, q *QueryOptions` | `[]*JobListStub, *QueryMeta, error` | [L95](file:///d:/claude/nomad/api/node_pools.go#L95) |
| `ListNodes` | `n *NodePools` | `poolName string, q *QueryOptions` | `[]*NodeListStub, *QueryMeta, error` | [L107](file:///d:/claude/nomad/api/node_pools.go#L107) |
| `MarshalJSON` | `n *NodePool` | - | `[]byte, error` | [L131](file:///d:/claude/nomad/api/node_pools.go#L131) |
| `UnmarshalJSON` | `n *NodePool` | `data []byte` | `err error` | [L148](file:///d:/claude/nomad/api/node_pools.go#L148) |

## 5. 核心方法详解

### List()

**签名**：`func (n *NodePools) List(q *QueryOptions) []*NodePool, *QueryMeta, error`

**位置**：[L33](file:///d:/claude/nomad/api/node_pools.go#L33)

### Info()

**签名**：`func (n *NodePools) Info(name string, q *QueryOptions) *NodePool, *QueryMeta, error`

**位置**：[L52](file:///d:/claude/nomad/api/node_pools.go#L52)

### Register()

**签名**：`func (n *NodePools) Register(pool *NodePool, w *WriteOptions) *WriteMeta, error`

**位置**：[L66](file:///d:/claude/nomad/api/node_pools.go#L66)

### Delete()

**签名**：`func (n *NodePools) Delete(name string, w *WriteOptions) *WriteMeta, error`

**位置**：[L82](file:///d:/claude/nomad/api/node_pools.go#L82)

### ListJobs()

**签名**：`func (n *NodePools) ListJobs(poolName string, q *QueryOptions) []*JobListStub, *QueryMeta, error`

**位置**：[L95](file:///d:/claude/nomad/api/node_pools.go#L95)

### ListNodes()

**签名**：`func (n *NodePools) ListNodes(poolName string, q *QueryOptions) []*NodeListStub, *QueryMeta, error`

**位置**：[L107](file:///d:/claude/nomad/api/node_pools.go#L107)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `net/url` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [node_pools_test.go](file:///d:/claude/nomad/api/node_pools_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

