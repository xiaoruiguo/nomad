# delay_heap.go 代码说明文档

> 文件路径：[lib/delayheap/delay_heap.go](file:///d:/claude/nomad/lib/delayheap/delay_heap.go)
> 总行数：170 行
> 所属包：`delayheap`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **延迟堆子包**（`lib/delayheap`），实现基于堆的延迟队列数据结构，用于按时间顺序处理延迟任务（如周期性作业、评估延迟）。

## 2. 类型定义

### DelayHeap

**定义位置**：[L16](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L16)

**类型**：struct

```go
	index map[structs.NamespacedID]*delayHeapNode
	heap delayedHeapImp
```

**关联方法**（7 个）：`Push`, `Pop`, `Peek`, `Contains`, `Update`, `Remove`, `Length`

### HeapNode

**定义位置**：[L22](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L22)

**类型**：interface

```go
	Data
	ID
	Namespace
```

### delayHeapNode

**定义位置**：[L30](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L30)

**类型**：struct

```go
	Node HeapNode
	WaitUntil time.Time
	index int
```

### delayedHeapImp

**定义位置**：[L40](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L40)

**类型定义**：`[]*delayHeapNode`

**关联方法**（5 个）：`Len`, `Less`, `Swap`, `Push`, `Pop`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Len` | `h *delayedHeapImp` | - | `int` | [L42](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L42) |
| `Less` | `h *delayedHeapImp` | `i int, j int` | `bool` | [L48](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L48) |
| `Swap` | `h *delayedHeapImp` | `i int, j int` | - | [L62](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L62) |
| `Push` | `h *delayedHeapImp` | `x interface{}` | - | [L68](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L68) |
| `Pop` | `h *delayedHeapImp` | - | `interface{}` | [L75](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L75) |
| `NewDelayHeap` | - | - | `*DelayHeap` | [L84](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L84) |
| `Push` | `p *DelayHeap` | `dataNode HeapNode, next time.Time` | `error` | [L91](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L91) |
| `Pop` | `p *DelayHeap` | - | `*delayHeapNode` | [L106](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L106) |
| `Peek` | `p *DelayHeap` | - | `*delayHeapNode` | [L120](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L120) |
| `Contains` | `p *DelayHeap` | `heapNode HeapNode` | `bool` | [L128](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L128) |
| `Update` | `p *DelayHeap` | `heapNode HeapNode, waitUntil time.Time` | `error` | [L137](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L137) |
| `Remove` | `p *DelayHeap` | `heapNode HeapNode` | `error` | [L153](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L153) |
| `Length` | `p *DelayHeap` | - | `int` | [L167](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L167) |

## 5. 核心方法详解

### NewDelayHeap()

**签名**：`func NewDelayHeap() *DelayHeap`

**位置**：[L84](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L84)

### Update()

**签名**：`func (p *DelayHeap) Update(heapNode HeapNode, waitUntil time.Time) error`

**位置**：[L137](file:///d:/claude/nomad/lib/delayheap/delay_heap.go#L137)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `container/heap` | 标准库 |
| `fmt` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [delay_heap_test.go](file:///d:/claude/nomad/lib/delayheap/delay_heap_test.go) | 对应测试文件 |

