# subscription.go 代码说明文档

> 文件路径：[nomad/stream/subscription.go](file:///d:/claude/nomad/nomad/stream/subscription.go)
> 总行数：193 行
> 所属包：`stream`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `stream` 包，定义结构体类型、包含 6 个方法/函数。

## 2. 类型定义

### Subscription

**定义位置**：[L30](file:///d:/claude/nomad/nomad/stream/subscription.go#L30)

**中文说明**：Subscription 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Subscription struct {
	state uint32
	req *SubscribeRequest
	currentItem *bufferItem
	forceClosed chan struct{...}
	unsub func(...)
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `state` | `uint32` | 状态 |
| `req` | `*SubscribeRequest` | — |
| `currentItem` | `*bufferItem` | — |
| `forceClosed` | `chan struct{...}` | 信号通道 |
| `unsub` | `func(...)` | — |

**关联方法**（3 个）：`Next`, `NextNoBlock`, `Unsubscribe`

### SubscribeRequest

**定义位置**：[L51](file:///d:/claude/nomad/nomad/stream/subscription.go#L51)

**中文说明**：SubscribeRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type SubscribeRequest struct {
	Token string
	Index uint64
	Namespaces []string
	Topics map[structs.Topic][]string
	StartExactlyAtIndex bool
	Authenticate func(...)
	FilterFn func(...)
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Token` | `string` | 令牌，用于认证或标识 |
| `Index` | `uint64` | 索引 |
| `Namespaces` | `[]string` | 列表 |
| `Topics` | `map[structs.Topic][]string` | 映射表 |
| `StartExactlyAtIndex` | `bool` | 布尔值 |
| `Authenticate` | `func(...)` | — |
| `FilterFn` | `func(...)` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `subscriptionStateOpen` | `uint32` | `0` | — |
| `subscriptionStateClosed` | `uint32` | `1` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ErrSubscriptionClosed` | `—` | `errors.New("subscription closed by server, client should ...` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newSubscription` | - | `req *SubscribeRequest, item *bufferItem, unsub func(...)` | `*Subscription` | [L75](file:///d:/claude/nomad/nomad/stream/subscription.go#L75) |
| `Next` | `s *Subscription` | `ctx context.Context` | `structs.Events, error` | [L84](file:///d:/claude/nomad/nomad/stream/subscription.go#L84) |
| `NextNoBlock` | `s *Subscription` | `` | `[]structs.Event, error` | [L107](file:///d:/claude/nomad/nomad/stream/subscription.go#L107) |
| `Unsubscribe` | `s *Subscription` | `` | `` | [L127](file:///d:/claude/nomad/nomad/stream/subscription.go#L127) |
| `filter` | - | `req *SubscribeRequest, events []structs.Event` | `[]structs.Event` | [L132](file:///d:/claude/nomad/nomad/stream/subscription.go#L132) |
| `eventMatchesKey` | - | `event structs.Event, key string` | `bool` | [L180](file:///d:/claude/nomad/nomad/stream/subscription.go#L180) |

## 5. 核心方法详解

### Unsubscribe()

**签名**：`func (s *Subscription) Unsubscribe() `

**位置**：[L127](file:///d:/claude/nomad/nomad/stream/subscription.go#L127)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `slices` | 标准库 |
| `sync/atomic` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [subscription_test.go](file:///d:/claude/nomad/nomad/stream/subscription_test.go) | 对应测试文件 |
| [event_broker.go](file:///d:/claude/nomad/nomad/stream/event_broker.go) | 同目录源文件 |
| [event_buffer.go](file:///d:/claude/nomad/nomad/stream/event_buffer.go) | 同目录源文件 |
| [ndjson.go](file:///d:/claude/nomad/nomad/stream/ndjson.go) | 同目录源文件 |

