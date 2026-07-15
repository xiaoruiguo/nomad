# broadcaster.go 代码说明文档

> 文件路径：[structs/broadcaster.go](file:///d:/claude/nomad/client/structs/broadcaster.go)
> 总行数：175 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Client 结构体子包**（`client/structs`），定义 Client 层的数据结构（事件、统计、响应等）。

## 2. 类型定义

### AllocBroadcaster

**定义位置**：[L28](file:///d:/claude/nomad/client/structs/broadcaster.go#L28)

**类型**：struct

```go
	mu sync.Mutex
	listeners map[int]chan *structs.Allocation
	nextId int
	closed bool
	last *structs.Allocation
	logger hclog.Logger
```

**关联方法**（4 个）：`Send`, `Close`, `stop`, `Listen`

### AllocListener

**定义位置**：[L159](file:///d:/claude/nomad/client/structs/broadcaster.go#L159)

**类型**：struct

```go
	ch chan *structs.Allocation
	b *AllocBroadcaster
	id int
```

**关联方法**（2 个）：`Ch`, `Close`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `listenerCap` | `1` |

### 变量

| 名称 | 值 |
|------|----|
| `ErrAllocBroadcasterClosed` | `errors.New("alloc broadcaster closed")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewAllocBroadcaster` | - | `l hclog.Logger` | `*AllocBroadcaster` | [L48](file:///d:/claude/nomad/client/structs/broadcaster.go#L48) |
| `Send` | `b *AllocBroadcaster` | `v *structs.Allocation` | `error` | [L57](file:///d:/claude/nomad/client/structs/broadcaster.go#L57) |
| `Close` | `b *AllocBroadcaster` | - | - | [L88](file:///d:/claude/nomad/client/structs/broadcaster.go#L88) |
| `stop` | `b *AllocBroadcaster` | `id int` | - | [L106](file:///d:/claude/nomad/client/structs/broadcaster.go#L106) |
| `Listen` | `b *AllocBroadcaster` | - | `*AllocListener` | [L128](file:///d:/claude/nomad/client/structs/broadcaster.go#L128) |
| `Ch` | `l *AllocListener` | - | `chan *structs.Allocation` | [L166](file:///d:/claude/nomad/client/structs/broadcaster.go#L166) |
| `Close` | `l *AllocListener` | - | - | [L172](file:///d:/claude/nomad/client/structs/broadcaster.go#L172) |

## 5. 核心方法详解

### Close()

**签名**：`func (b *AllocBroadcaster) Close() `

**位置**：[L88](file:///d:/claude/nomad/client/structs/broadcaster.go#L88)

### Listen()

**签名**：`func (b *AllocBroadcaster) Listen() *AllocListener`

**位置**：[L128](file:///d:/claude/nomad/client/structs/broadcaster.go#L128)

### Close()

**签名**：`func (l *AllocListener) Close() `

**位置**：[L172](file:///d:/claude/nomad/client/structs/broadcaster.go#L172)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [broadcaster_test.go](file:///d:/claude/nomad/client/structs/broadcaster_test.go) | 对应测试文件 |

