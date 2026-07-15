# event_broker.go 代码说明文档

> 文件路径：[stream/event_broker.go](file:///d:/claude/nomad/nomad/stream/event_broker.go)
> 总行数：332 行
> 所属包：`stream`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **事件流子包**（`nomad/stream`），实现 Nomad Server 的事件订阅和推送机制，通过 Event Broker 和 Subscription 将集群状态变更实时推送到客户端。

## 2. 类型定义

### EventBrokerCfg

**定义位置**：[L24](file:///d:/claude/nomad/nomad/stream/event_broker.go#L24)

**类型**：struct

```go
	EventBufferSize int64
	Logger hclog.Logger
```

### EventBroker

**定义位置**：[L29](file:///d:/claude/nomad/nomad/stream/event_broker.go#L29)

**类型**：struct

```go
	mu sync.Mutex
	subscriptions *subscriptions
	eventBuf *eventBuffer
	publishCh chan *structs.Events
	aclCh chan structs.Event
	logger hclog.Logger
```

**关联方法**（7 个）：`Len`, `Publish`, `Subscribe`, `CloseAll`, `handleUpdates`, `handleACLUpdates`, `checkSubscriptionsAgainstACLChange`

### subscriptions

**定义位置**：[L223](file:///d:/claude/nomad/nomad/stream/event_broker.go#L223)

**类型**：struct

```go
	mu sync.RWMutex
	byToken map[string]map[*SubscribeRequest]*Subscription
```

**关联方法**（5 个）：`add`, `closeSubscriptionsForTokens`, `closeSubscriptionFunc`, `unsubscribeFn`, `closeAll`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `ACLCheckNodeRead` | `"node-read"` |
| `ACLCheckManagement` | `"management"` |
| `aclCacheSize` | `32` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewEventBroker` | - | `ctx context.Context, cfg EventBrokerCfg` | `*EventBroker, error` | [L51](file:///d:/claude/nomad/nomad/stream/event_broker.go#L51) |
| `Len` | `e *EventBroker` | - | `int` | [L79](file:///d:/claude/nomad/nomad/stream/event_broker.go#L79) |
| `Publish` | `e *EventBroker` | `events *structs.Events` | - | [L84](file:///d:/claude/nomad/nomad/stream/event_broker.go#L84) |
| `Subscribe` | `e *EventBroker` | `req *SubscribeRequest` | `*Subscription, error` | [L112](file:///d:/claude/nomad/nomad/stream/event_broker.go#L112) |
| `CloseAll` | `e *EventBroker` | - | - | [L150](file:///d:/claude/nomad/nomad/stream/event_broker.go#L150) |
| `handleUpdates` | `e *EventBroker` | `ctx context.Context` | - | [L154](file:///d:/claude/nomad/nomad/stream/event_broker.go#L154) |
| `handleACLUpdates` | `e *EventBroker` | `ctx context.Context` | - | [L166](file:///d:/claude/nomad/nomad/stream/event_broker.go#L166) |
| `checkSubscriptionsAgainstACLChange` | `e *EventBroker` | - | - | [L201](file:///d:/claude/nomad/nomad/stream/event_broker.go#L201) |
| `forceClose` | `s *Subscription` | - | - | [L217](file:///d:/claude/nomad/nomad/stream/event_broker.go#L217) |
| `add` | `s *subscriptions` | `req *SubscribeRequest, sub *Subscription` | - | [L236](file:///d:/claude/nomad/nomad/stream/event_broker.go#L236) |
| `closeSubscriptionsForTokens` | `s *subscriptions` | `tokenSecretIDs []string` | - | [L248](file:///d:/claude/nomad/nomad/stream/event_broker.go#L248) |
| `closeSubscriptionFunc` | `s *subscriptions` | `tokenSecretID string, fn func(...)` | - | [L266](file:///d:/claude/nomad/nomad/stream/event_broker.go#L266) |
| `unsubscribeFn` | `s *subscriptions` | `req *SubscribeRequest` | `func(...)` | [L294](file:///d:/claude/nomad/nomad/stream/event_broker.go#L294) |
| `closeAll` | `s *subscriptions` | - | - | [L319](file:///d:/claude/nomad/nomad/stream/event_broker.go#L319) |

## 5. 核心方法详解

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
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [event_broker_test.go](file:///d:/claude/nomad/nomad/stream/event_broker_test.go) | 对应测试文件 |

