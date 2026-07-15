# event_stream.go 代码说明文档

> 文件路径：[event_stream.go](file:///d:/claude/nomad/api/event_stream.go)
> 总行数：247 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **事件流（Event Stream）API 客户端**，提供事件订阅的流式客户端方法。

## 2. 类型定义

### Events

**定义位置**：[L29](file:///d:/claude/nomad/api/event_stream.go#L29)

**类型**：struct

```go
	Index uint64
	Events []Event
	Err error
```

**关联方法**（1 个）：`IsHeartbeat`

### Topic

**定义位置**：[L36](file:///d:/claude/nomad/api/event_stream.go#L36)

**类型定义**：`string`

**关联方法**（1 个）：`String`

### Event

**定义位置**：[L44](file:///d:/claude/nomad/api/event_stream.go#L44)

**类型**：struct

```go
	Topic Topic
	Type string
	Key string
	FilterKeys []string
	Index uint64
	Payload map[string]interface{}
```

**关联方法**（9 个）：`Deployment`, `Evaluation`, `Allocation`, `Job`, `DeregisteredJob`, `Node`, `NodePool`, `Service`, `decodePayload`

### eventPayload

**定义位置**：[L134](file:///d:/claude/nomad/api/event_stream.go#L134)

**类型**：struct

```go
	Allocation *Allocation `mapstructure:"Allocation"`
	Deployment *Deployment `mapstructure:"Deployment"`
	Evaluation *Evaluation `mapstructure:"Evaluation"`
	Job *Job `mapstructure:"Job"`
	Deleted bool `mapstructure:"Deleted"`
	Node *Node `mapstructure:"Node"`
	NodePool *NodePool `mapstructure:"NodePool"`
	Service *ServiceRegistration `mapstructure:"Service"`
```

### EventStream

**定义位置**：[L171](file:///d:/claude/nomad/api/event_stream.go#L171)

**类型**：struct

```go
	client *Client
```

**关联方法**（1 个）：`Stream`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `TopicDeployment` | `"Deployment"` |
| `TopicEvaluation` | `"Evaluation"` |
| `TopicAllocation` | `"Allocation"` |
| `TopicJob` | `"Job"` |
| `TopicNode` | `"Node"` |
| `TopicNodePool` | `"NodePool"` |
| `TopicService` | `"Service"` |
| `TopicAll` | `"*"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `String` | `t *Topic` | - | `string` | [L40](file:///d:/claude/nomad/api/event_stream.go#L40) |
| `Deployment` | `e *Event` | - | `*Deployment, error` | [L55](file:///d:/claude/nomad/api/event_stream.go#L55) |
| `Evaluation` | `e *Event` | - | `*Evaluation, error` | [L65](file:///d:/claude/nomad/api/event_stream.go#L65) |
| `Allocation` | `e *Event` | - | `*Allocation, error` | [L75](file:///d:/claude/nomad/api/event_stream.go#L75) |
| `Job` | `e *Event` | - | `*Job, error` | [L85](file:///d:/claude/nomad/api/event_stream.go#L85) |
| `DeregisteredJob` | `e *Event` | - | `*Job, bool, error` | [L96](file:///d:/claude/nomad/api/event_stream.go#L96) |
| `Node` | `e *Event` | - | `*Node, error` | [L106](file:///d:/claude/nomad/api/event_stream.go#L106) |
| `NodePool` | `e *Event` | - | `*NodePool, error` | [L116](file:///d:/claude/nomad/api/event_stream.go#L116) |
| `Service` | `e *Event` | - | `*ServiceRegistration, error` | [L126](file:///d:/claude/nomad/api/event_stream.go#L126) |
| `decodePayload` | `e *Event` | - | `*eventPayload, error` | [L145](file:///d:/claude/nomad/api/event_stream.go#L145) |
| `IsHeartbeat` | `e *Events` | - | `bool` | [L166](file:///d:/claude/nomad/api/event_stream.go#L166) |
| `EventStream` | `c *Client` | - | `*EventStream` | [L176](file:///d:/claude/nomad/api/event_stream.go#L176) |
| `Stream` | `e *EventStream` | `ctx context.Context, topics map[Topic][]string, index uint64, q *QueryOptions` | `chan *Events, error` | [L184](file:///d:/claude/nomad/api/event_stream.go#L184) |

## 5. 核心方法详解

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

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [event_stream_test.go](file:///d:/claude/nomad/api/event_stream_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

