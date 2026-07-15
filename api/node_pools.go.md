# node_pools.go 代码说明文档

> 文件路径：[api/node_pools.go](file:///d:/claude/nomad/api/node_pools.go)
> 总行数：182 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `node_pools.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### NodePools

**定义位置**：[L23](file:///d:/claude/nomad/api/node_pools.go#L23)

**中文说明**：NodePools 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodePools struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（7 个）：`List`, `PrefixList`, `Info`, `Register`, `Delete`, `ListJobs`, `ListNodes`

### NodePool

**定义位置**：[L119](file:///d:/claude/nomad/api/node_pools.go#L119)

**中文说明**：NodePool 是一个对象池，复用资源以减少分配开销。

**类型**：struct

```go
type NodePool struct {
	Name string `hcl:"name,label"`
	Description string `hcl:"description,optional"`
	Meta map[string]string `hcl:"meta,block"`
	NodeIdentityTTL time.Duration `hcl:"node_identity_ttl,optional"`
	SchedulerConfiguration *NodePoolSchedulerConfiguration `hcl:"scheduler_config,block"`
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:"name,label"`` | 名称 |
| `Description` | `string `hcl:"description,optional"`` | 描述信息 |
| `Meta` | `map[string]string `hcl:"meta,block"`` | 元数据 |
| `NodeIdentityTTL` | `time.Duration `hcl:"node_identity_ttl,optional"`` | 时间间隔 |
| `SchedulerConfiguration` | `*NodePoolSchedulerConfiguration `hcl:"scheduler_config,block"`` | — |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（2 个）：`MarshalJSON`, `UnmarshalJSON`

### NodePoolSchedulerConfiguration

**定义位置**：[L178](file:///d:/claude/nomad/api/node_pools.go#L178)

**中文说明**：NodePoolSchedulerConfiguration 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodePoolSchedulerConfiguration struct {
	SchedulerAlgorithm SchedulerAlgorithm `hcl:"scheduler_algorithm,optional"`
	MemoryOversubscriptionEnabled *bool `hcl:"memory_oversubscription_enabled,optional"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SchedulerAlgorithm` | `SchedulerAlgorithm `hcl:"scheduler_algorithm,optional"`` | — |
| `MemoryOversubscriptionEnabled` | `*bool `hcl:"memory_oversubscription_enabled,optional"`` | 布尔值 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `NodePoolAll` | `—` | `"all"` | — |
| `NodePoolDefault` | `—` | `"default"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NodePools` | `c *Client` | `` | `*NodePools` | [L28](file:///d:/claude/nomad/api/node_pools.go#L28) |
| `List` | `n *NodePools` | `q *QueryOptions` | `[]*NodePool, *QueryMeta, error` | [L33](file:///d:/claude/nomad/api/node_pools.go#L33) |
| `PrefixList` | `n *NodePools` | `prefix string, q *QueryOptions` | `[]*NodePool, *QueryMeta, error` | [L43](file:///d:/claude/nomad/api/node_pools.go#L43) |
| `Info` | `n *NodePools` | `name string, q *QueryOptions` | `*NodePool, *QueryMeta, error` | [L52](file:///d:/claude/nomad/api/node_pools.go#L52) |
| `Register` | `n *NodePools` | `pool *NodePool, w *WriteOptions` | `*WriteMeta, error` | [L66](file:///d:/claude/nomad/api/node_pools.go#L66) |
| `Delete` | `n *NodePools` | `name string, w *WriteOptions` | `*WriteMeta, error` | [L82](file:///d:/claude/nomad/api/node_pools.go#L82) |
| `ListJobs` | `n *NodePools` | `poolName string, q *QueryOptions` | `[]*JobListStub, *QueryMeta, error` | [L95](file:///d:/claude/nomad/api/node_pools.go#L95) |
| `ListNodes` | `n *NodePools` | `poolName string, q *QueryOptions` | `[]*NodeListStub, *QueryMeta, error` | [L107](file:///d:/claude/nomad/api/node_pools.go#L107) |
| `MarshalJSON` | `n *NodePool` | `` | `[]byte, error` | [L131](file:///d:/claude/nomad/api/node_pools.go#L131) |
| `UnmarshalJSON` | `n *NodePool` | `data []byte` | `err error` | [L148](file:///d:/claude/nomad/api/node_pools.go#L148) |

## 5. 核心方法详解

### List()

**签名**：`func (n *NodePools) List(q *QueryOptions) []*NodePool, *QueryMeta, error`

**位置**：[L33](file:///d:/claude/nomad/api/node_pools.go#L33)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*NodePool` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Info()

**签名**：`func (n *NodePools) Info(name string, q *QueryOptions) *NodePool, *QueryMeta, error`

**位置**：[L52](file:///d:/claude/nomad/api/node_pools.go#L52)

**中文说明**：返回对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 名称 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NodePool` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Register()

**签名**：`func (n *NodePools) Register(pool *NodePool, w *WriteOptions) *WriteMeta, error`

**位置**：[L66](file:///d:/claude/nomad/api/node_pools.go#L66)

**中文说明**：注册 用于 创建 或 更新 节点池.

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `pool` | `*NodePool` | — |
| `w` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (n *NodePools) Delete(name string, w *WriteOptions) *WriteMeta, error`

**位置**：[L82](file:///d:/claude/nomad/api/node_pools.go#L82)

**中文说明**：删除 用于 删除 节点池.

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 名称 |
| `w` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

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

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **对象池模式**：实现对象池，复用资源减少分配开销

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [node_pools_test.go](file:///d:/claude/nomad/api/node_pools_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

