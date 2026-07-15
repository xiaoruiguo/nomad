# score_heap.go 代码说明文档

> 文件路径：[lib/kheap/score_heap.go](file:///d:/claude/nomad/lib/kheap/score_heap.go)
> 总行数：80 行
> 所属包：`kheap`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **K 堆子包**（`lib/kheap`），实现泛型堆数据结构，支持 Top-K 查询，用于调度器和资源排序。

## 2. 类型定义

### HeapItem

**定义位置**：[L11](file:///d:/claude/nomad/lib/kheap/score_heap.go#L11)

**中文说明**：HeapItem 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type HeapItem interface {
	Data func(...)
	Score func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Data` | `func(...)` | — |
| `Score` | `func(...)` | — |

### ScoreHeap

**定义位置**：[L19](file:///d:/claude/nomad/lib/kheap/score_heap.go#L19)

**中文说明**：ScoreHeap 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ScoreHeap struct {
	items []HeapItem
	capacity int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `items` | `[]HeapItem` | 列表 |
| `capacity` | `int` | — |

**关联方法**（6 个）：`Len`, `Less`, `Swap`, `Push`, `Pop`, `GetItemsReverse`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewScoreHeap` | - | `capacity uint32` | `*ScoreHeap` | [L24](file:///d:/claude/nomad/lib/kheap/score_heap.go#L24) |
| `Len` | `pq *ScoreHeap` | `` | `int` | [L28](file:///d:/claude/nomad/lib/kheap/score_heap.go#L28) |
| `Less` | `pq *ScoreHeap` | `i int, j int` | `bool` | [L30](file:///d:/claude/nomad/lib/kheap/score_heap.go#L30) |
| `Swap` | `pq *ScoreHeap` | `i int, j int` | `` | [L34](file:///d:/claude/nomad/lib/kheap/score_heap.go#L34) |
| `Push` | `pq *ScoreHeap` | `x interface{}` | `` | [L40](file:///d:/claude/nomad/lib/kheap/score_heap.go#L40) |
| `Pop` | `pq *ScoreHeap` | `` | `interface{}` | [L60](file:///d:/claude/nomad/lib/kheap/score_heap.go#L60) |
| `GetItemsReverse` | `pq *ScoreHeap` | `` | `[]interface{}` | [L70](file:///d:/claude/nomad/lib/kheap/score_heap.go#L70) |

## 5. 核心方法详解

### NewScoreHeap()

**签名**：`func NewScoreHeap(capacity uint32) *ScoreHeap`

**位置**：[L24](file:///d:/claude/nomad/lib/kheap/score_heap.go#L24)

**中文说明**：创建并返回一个新的 ScoreHeap 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `capacity` | `uint32` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ScoreHeap` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `container/heap` | 标准库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [score_heap_test.go](file:///d:/claude/nomad/lib/kheap/score_heap_test.go) | 对应测试文件 |

