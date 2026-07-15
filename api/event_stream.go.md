# event_stream.go 代码说明文档

> 文件路径：[api/event_stream.go](file:///d:/claude/nomad/api/event_stream.go)
> 总行数：247 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `event_stream.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Events

**定义位置**：[L29](file:///d:/claude/nomad/api/event_stream.go#L29)

**中文说明**：Events 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Events struct {
	Index uint64
	Events []Event
	Err error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Index` | `uint64` | 索引 |
| `Events` | `[]Event` | 列表 |
| `Err` | `error` | 错误信息 |

**关联方法**（1 个）：`IsHeartbeat`

### Topic

**定义位置**：[L36](file:///d:/claude/nomad/api/event_stream.go#L36)

**类型定义**：`type Topic string`

**关联方法**（1 个）：`String`

### Event

**定义位置**：[L44](file:///d:/claude/nomad/api/event_stream.go#L44)

**中文说明**：Event 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Event struct {
	Topic Topic
	Type string
	Key string
	FilterKeys []string
	Index uint64
	Payload map[string]interface{}
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Topic` | `Topic` | — |
| `Type` | `string` | 类型 |
| `Key` | `string` | 键 |
| `FilterKeys` | `[]string` | 列表 |
| `Index` | `uint64` | 索引 |
| `Payload` | `map[string]interface{}` | 映射表 |

**关联方法**（9 个）：`Deployment`, `Evaluation`, `Allocation`, `Job`, `DeregisteredJob`, `Node`, `NodePool`, `Service`, `decodePayload`

### eventPayload

**定义位置**：[L134](file:///d:/claude/nomad/api/event_stream.go#L134)

**中文说明**：eventPayload 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type eventPayload struct {
	Allocation *Allocation `mapstructure:"Allocation"`
	Deployment *Deployment `mapstructure:"Deployment"`
	Evaluation *Evaluation `mapstructure:"Evaluation"`
	Job *Job `mapstructure:"Job"`
	Deleted bool `mapstructure:"Deleted"`
	Node *Node `mapstructure:"Node"`
	NodePool *NodePool `mapstructure:"NodePool"`
	Service *ServiceRegistration `mapstructure:"Service"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Allocation` | `*Allocation `mapstructure:"Allocation"`` | — |
| `Deployment` | `*Deployment `mapstructure:"Deployment"`` | — |
| `Evaluation` | `*Evaluation `mapstructure:"Evaluation"`` | — |
| `Job` | `*Job `mapstructure:"Job"`` | — |
| `Deleted` | `bool `mapstructure:"Deleted"`` | 布尔值 |
| `Node` | `*Node `mapstructure:"Node"`` | — |
| `NodePool` | `*NodePool `mapstructure:"NodePool"`` | — |
| `Service` | `*ServiceRegistration `mapstructure:"Service"`` | — |

### EventStream

**定义位置**：[L171](file:///d:/claude/nomad/api/event_stream.go#L171)

**中文说明**：EventStream 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type EventStream struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（1 个）：`Stream`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `TopicDeployment` | `Topic` | `"Deployment"` | — |
| `TopicEvaluation` | `Topic` | `"Evaluation"` | — |
| `TopicAllocation` | `Topic` | `"Allocation"` | — |
| `TopicJob` | `Topic` | `"Job"` | — |
| `TopicNode` | `Topic` | `"Node"` | — |
| `TopicNodePool` | `Topic` | `"NodePool"` | — |
| `TopicService` | `Topic` | `"Service"` | — |
| `TopicAll` | `Topic` | `"*"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `String` | `t *Topic` | `` | `string` | [L40](file:///d:/claude/nomad/api/event_stream.go#L40) |
| `Deployment` | `e *Event` | `` | `*Deployment, error` | [L55](file:///d:/claude/nomad/api/event_stream.go#L55) |
| `Evaluation` | `e *Event` | `` | `*Evaluation, error` | [L65](file:///d:/claude/nomad/api/event_stream.go#L65) |
| `Allocation` | `e *Event` | `` | `*Allocation, error` | [L75](file:///d:/claude/nomad/api/event_stream.go#L75) |
| `Job` | `e *Event` | `` | `*Job, error` | [L85](file:///d:/claude/nomad/api/event_stream.go#L85) |
| `DeregisteredJob` | `e *Event` | `` | `*Job, bool, error` | [L96](file:///d:/claude/nomad/api/event_stream.go#L96) |
| `Node` | `e *Event` | `` | `*Node, error` | [L106](file:///d:/claude/nomad/api/event_stream.go#L106) |
| `NodePool` | `e *Event` | `` | `*NodePool, error` | [L116](file:///d:/claude/nomad/api/event_stream.go#L116) |
| `Service` | `e *Event` | `` | `*ServiceRegistration, error` | [L126](file:///d:/claude/nomad/api/event_stream.go#L126) |
| `decodePayload` | `e *Event` | `` | `*eventPayload, error` | [L145](file:///d:/claude/nomad/api/event_stream.go#L145) |
| `IsHeartbeat` | `e *Events` | `` | `bool` | [L166](file:///d:/claude/nomad/api/event_stream.go#L166) |
| `EventStream` | `c *Client` | `` | `*EventStream` | [L176](file:///d:/claude/nomad/api/event_stream.go#L176) |
| `Stream` | `e *EventStream` | `ctx context.Context, topics map[Topic][]string, index uint64, q *QueryOptions` | `<-chan *Events, error` | [L184](file:///d:/claude/nomad/api/event_stream.go#L184) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `encoding/json` | 标准库 |
| `fmt` | 标准库 |
| `strconv` | 标准库 |
| `time` | 标准库 |
| `github.com/go-viper/mapstructure/v2` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [event_stream_test.go](file:///d:/claude/nomad/api/event_stream_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

