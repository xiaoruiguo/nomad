# ndjson.go 代码说明文档

> 文件路径：[stream/ndjson.go](file:///d:/claude/nomad/nomad/stream/ndjson.go)
> 总行数：96 行
> 所属包：`stream`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **事件流子包**（`nomad/stream`），实现 Nomad Server 的事件订阅和推送机制，通过 Event Broker 和 Subscription 将集群状态变更实时推送到客户端。

## 2. 类型定义

### JsonStream

**定义位置**：[L25](file:///d:/claude/nomad/nomad/stream/ndjson.go#L25)

**类型**：struct

```go
	ctx context.Context
	outCh chan *structs.EventJson
	heartbeatTick *time.Ticker
```

**关联方法**（3 个）：`OutCh`, `heartbeat`, `Send`

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `JsonHeartbeat` | `&structs.EventJson{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewJsonStream` | - | `ctx context.Context, heartbeat time.Duration` | `*JsonStream` | [L41](file:///d:/claude/nomad/nomad/stream/ndjson.go#L41) |
| `OutCh` | `n *JsonStream` | - | `chan *structs.EventJson` | [L54](file:///d:/claude/nomad/nomad/stream/ndjson.go#L54) |
| `heartbeat` | `n *JsonStream` | - | - | [L58](file:///d:/claude/nomad/nomad/stream/ndjson.go#L58) |
| `Send` | `n *JsonStream` | `v interface{}` | `error` | [L76](file:///d:/claude/nomad/nomad/stream/ndjson.go#L76) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `context` | 标准库 |
| `fmt` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-msgpack/v2/codec` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [ndjson_test.go](file:///d:/claude/nomad/nomad/stream/ndjson_test.go) | 对应测试文件 |

