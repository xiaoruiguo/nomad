# broadcaster.go 代码说明文档

> 文件路径：[client/structs/broadcaster.go](file:///d:/claude/nomad/client/structs/broadcaster.go)
> 总行数：175 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **客户端子包**（`client/`），实现 Nomad 客户端的功能组件。

## 2. 类型定义

### AllocBroadcaster

**定义位置**：[L28](file:///d:/claude/nomad/client/structs/broadcaster.go#L28)

**中文说明**：AllocBroadcaster 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocBroadcaster struct {
	mu sync.Mutex
	listeners map[int]chan *structs.Allocation
	nextId int
	closed bool
	last *structs.Allocation
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `mu` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `listeners` | `map[int]chan *structs.Allocation` | 通道 |
| `nextId` | `int` | — |
| `closed` | `bool` | 是否已关闭 |
| `last` | `*structs.Allocation` | — |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（4 个）：`Send`, `Close`, `stop`, `Listen`

### AllocListener

**定义位置**：[L159](file:///d:/claude/nomad/client/structs/broadcaster.go#L159)

**中文说明**：AllocListener 是一个监听器，监听网络连接或事件。

**类型**：struct

```go
type AllocListener struct {
	ch <-chan *structs.Allocation
	b *AllocBroadcaster
	id int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ch` | `<-chan *structs.Allocation` | 通道 |
| `b` | `*AllocBroadcaster` | — |
| `id` | `int` | 唯一标识符 |

**关联方法**（2 个）：`Ch`, `Close`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `listenerCap` | `—` | `1` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ErrAllocBroadcasterClosed` | `—` | `errors.New("alloc broadcaster closed")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewAllocBroadcaster` | - | `l hclog.Logger` | `*AllocBroadcaster` | [L48](file:///d:/claude/nomad/client/structs/broadcaster.go#L48) |
| `Send` | `b *AllocBroadcaster` | `v *structs.Allocation` | `error` | [L57](file:///d:/claude/nomad/client/structs/broadcaster.go#L57) |
| `Close` | `b *AllocBroadcaster` | `` | `` | [L88](file:///d:/claude/nomad/client/structs/broadcaster.go#L88) |
| `stop` | `b *AllocBroadcaster` | `id int` | `` | [L106](file:///d:/claude/nomad/client/structs/broadcaster.go#L106) |
| `Listen` | `b *AllocBroadcaster` | `` | `*AllocListener` | [L128](file:///d:/claude/nomad/client/structs/broadcaster.go#L128) |
| `Ch` | `l *AllocListener` | `` | `<-chan *structs.Allocation` | [L166](file:///d:/claude/nomad/client/structs/broadcaster.go#L166) |
| `Close` | `l *AllocListener` | `` | `` | [L172](file:///d:/claude/nomad/client/structs/broadcaster.go#L172) |

## 5. 核心方法详解

### NewAllocBroadcaster()

**签名**：`func NewAllocBroadcaster(l hclog.Logger) *AllocBroadcaster`

**位置**：[L48](file:///d:/claude/nomad/client/structs/broadcaster.go#L48)

**中文说明**：创建并返回一个新的 AllocBroadcaster 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `l` | `hclog.Logger` | 日志记录器 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*AllocBroadcaster` | — |

### Close()

**签名**：`func (b *AllocBroadcaster) Close() `

**位置**：[L88](file:///d:/claude/nomad/client/structs/broadcaster.go#L88)

**中文说明**：关闭对象。

### Close()

**签名**：`func (l *AllocListener) Close() `

**位置**：[L172](file:///d:/claude/nomad/client/structs/broadcaster.go#L172)

**中文说明**：关闭对象。

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
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [broadcaster_test.go](file:///d:/claude/nomad/client/structs/broadcaster_test.go) | 对应测试文件 |
| [allochook.go](file:///d:/claude/nomad/client/structs/allochook.go) | 同目录源文件 |
| [csi.go](file:///d:/claude/nomad/client/structs/csi.go) | 同目录源文件 |
| [enum.go](file:///d:/claude/nomad/client/structs/enum.go) | 同目录源文件 |
| [host_volumes.go](file:///d:/claude/nomad/client/structs/host_volumes.go) | 同目录源文件 |
| [structs.go](file:///d:/claude/nomad/client/structs/structs.go) | 同目录源文件 |

