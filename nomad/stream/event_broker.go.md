# event_broker.go 代码说明文档

> 文件路径：[nomad/stream/event_broker.go](file:///d:/claude/nomad/nomad/stream/event_broker.go)
> 总行数：332 行
> 所属包：`stream`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `stream` 包，定义结构体类型、包含 14 个方法/函数。

## 2. 类型定义

### EventBrokerCfg

**定义位置**：[L24](file:///d:/claude/nomad/nomad/stream/event_broker.go#L24)

**中文说明**：EventBrokerCfg 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type EventBrokerCfg struct {
	EventBufferSize int64
	Logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `EventBufferSize` | `int64` | — |
| `Logger` | `hclog.Logger` | 日志记录器 |

### EventBroker

**定义位置**：[L29](file:///d:/claude/nomad/nomad/stream/event_broker.go#L29)

**中文说明**：EventBroker 是一个代理器，分发和管理待处理的消息或任务。

**类型**：struct

```go
type EventBroker struct {
	mu sync.Mutex
	subscriptions *subscriptions
	eventBuf *eventBuffer
	publishCh chan *structs.Events
	aclCh chan structs.Event
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `mu` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `subscriptions` | `*subscriptions` | — |
| `eventBuf` | `*eventBuffer` | — |
| `publishCh` | `chan *structs.Events` | 通道 |
| `aclCh` | `chan structs.Event` | 信号通道 |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（7 个）：`Len`, `Publish`, `Subscribe`, `CloseAll`, `handleUpdates`, `handleACLUpdates`, `checkSubscriptionsAgainstACLChange`

### subscriptions

**定义位置**：[L223](file:///d:/claude/nomad/nomad/stream/event_broker.go#L223)

**中文说明**：subscriptions 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type subscriptions struct {
	mu sync.RWMutex
	byToken map[string]map[*SubscribeRequest]*Subscription
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `mu` | `sync.RWMutex` | 读写锁，保护并发访问 |
| `byToken` | `map[string]map[*SubscribeRequest]*Subscription` | 映射表 |

**关联方法**（5 个）：`add`, `closeSubscriptionsForTokens`, `closeSubscriptionFunc`, `unsubscribeFn`, `closeAll`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ACLCheckNodeRead` | `—` | `"node-read"` | — |
| `ACLCheckManagement` | `—` | `"management"` | — |
| `aclCacheSize` | `—` | `32` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewEventBroker` | - | `ctx context.Context, cfg EventBrokerCfg` | `*EventBroker, error` | [L51](file:///d:/claude/nomad/nomad/stream/event_broker.go#L51) |
| `Len` | `e *EventBroker` | `` | `int` | [L79](file:///d:/claude/nomad/nomad/stream/event_broker.go#L79) |
| `Publish` | `e *EventBroker` | `events *structs.Events` | `` | [L84](file:///d:/claude/nomad/nomad/stream/event_broker.go#L84) |
| `Subscribe` | `e *EventBroker` | `req *SubscribeRequest` | `*Subscription, error` | [L112](file:///d:/claude/nomad/nomad/stream/event_broker.go#L112) |
| `CloseAll` | `e *EventBroker` | `` | `` | [L150](file:///d:/claude/nomad/nomad/stream/event_broker.go#L150) |
| `handleUpdates` | `e *EventBroker` | `ctx context.Context` | `` | [L154](file:///d:/claude/nomad/nomad/stream/event_broker.go#L154) |
| `handleACLUpdates` | `e *EventBroker` | `ctx context.Context` | `` | [L166](file:///d:/claude/nomad/nomad/stream/event_broker.go#L166) |
| `checkSubscriptionsAgainstACLChange` | `e *EventBroker` | `` | `` | [L201](file:///d:/claude/nomad/nomad/stream/event_broker.go#L201) |
| `forceClose` | `s *Subscription` | `` | `` | [L217](file:///d:/claude/nomad/nomad/stream/event_broker.go#L217) |
| `add` | `s *subscriptions` | `req *SubscribeRequest, sub *Subscription` | `` | [L236](file:///d:/claude/nomad/nomad/stream/event_broker.go#L236) |
| `closeSubscriptionsForTokens` | `s *subscriptions` | `tokenSecretIDs []string` | `` | [L248](file:///d:/claude/nomad/nomad/stream/event_broker.go#L248) |
| `closeSubscriptionFunc` | `s *subscriptions` | `tokenSecretID string, fn func(...)` | `` | [L266](file:///d:/claude/nomad/nomad/stream/event_broker.go#L266) |
| `unsubscribeFn` | `s *subscriptions` | `req *SubscribeRequest` | `func(...)` | [L294](file:///d:/claude/nomad/nomad/stream/event_broker.go#L294) |
| `closeAll` | `s *subscriptions` | `` | `` | [L319](file:///d:/claude/nomad/nomad/stream/event_broker.go#L319) |

## 5. 核心方法详解

### NewEventBroker()

**签名**：`func NewEventBroker(ctx context.Context, cfg EventBrokerCfg) *EventBroker, error`

**位置**：[L51](file:///d:/claude/nomad/nomad/stream/event_broker.go#L51)

**中文说明**：创建并返回一个新的 EventBroker 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `cfg` | `EventBrokerCfg` | 配置 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*EventBroker` | — |
| `error` | 错误信息 |

### Subscribe()

**签名**：`func (e *EventBroker) Subscribe(req *SubscribeRequest) *Subscription, error`

**位置**：[L112](file:///d:/claude/nomad/nomad/stream/event_broker.go#L112)

**中文说明**：订阅对象的事件。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `req` | `*SubscribeRequest` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Subscription` | — |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `sync/atomic` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标
- **后台协程**：启动 goroutine 执行后台任务
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [event_broker_test.go](file:///d:/claude/nomad/nomad/stream/event_broker_test.go) | 对应测试文件 |
| [event_buffer.go](file:///d:/claude/nomad/nomad/stream/event_buffer.go) | 同目录源文件 |
| [ndjson.go](file:///d:/claude/nomad/nomad/stream/ndjson.go) | 同目录源文件 |
| [subscription.go](file:///d:/claude/nomad/nomad/stream/subscription.go) | 同目录源文件 |

