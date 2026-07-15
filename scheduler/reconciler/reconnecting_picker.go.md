# reconnecting_picker.go 代码说明文档

> 文件路径：[scheduler/reconciler/reconnecting_picker.go](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go)
> 总行数：154 行
> 所属包：`reconciler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **调度器包**（`scheduler/`），实现 Nomad 的调度逻辑和算法。

## 2. 类型定义

### reconnectingPickerInterface

**定义位置**：[L13](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L13)

**中文说明**：reconnectingPickerInterface 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type reconnectingPickerInterface interface {
	pickReconnectingAlloc func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `pickReconnectingAlloc` | `func(...)` | — |

### reconnectingPicker

**定义位置**：[L17](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L17)

**中文说明**：reconnectingPicker 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type reconnectingPicker struct {
	logger log.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `log.Logger` | 日志记录器 |

**关联方法**（5 个）：`pickReconnectingAlloc`, `pickBestScore`, `pickOriginal`, `pickReplacement`, `pickLongestRunning`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newReconnectingPicker` | - | `logger log.Logger` | `*reconnectingPicker` | [L21](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L21) |
| `pickReconnectingAlloc` | `rp *reconnectingPicker` | `ds *structs.DisconnectStrategy, original *structs.Allocation, replacement *st...` | `*structs.Allocation` | [L29](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L29) |
| `pickBestScore` | `rp *reconnectingPicker` | `original *structs.Allocation, replacement *structs.Allocation` | `*structs.Allocation` | [L69](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L69) |
| `pickOriginal` | `rp *reconnectingPicker` | `original *structs.Allocation, _ *structs.Allocation` | `*structs.Allocation` | [L94](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L94) |
| `pickReplacement` | `rp *reconnectingPicker` | `_ *structs.Allocation, replacement *structs.Allocation` | `*structs.Allocation` | [L98](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L98) |
| `pickLongestRunning` | `rp *reconnectingPicker` | `original *structs.Allocation, replacement *structs.Allocation` | `*structs.Allocation` | [L102](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L102) |
| `startOfLeaderOrOldestTaskInMain` | - | `alloc *structs.Allocation, tg *structs.TaskGroup` | `time.Time` | [L129](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L129) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [reconnecting_picker_test.go](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker_test.go) | 对应测试文件 |
| [allocs.go](file:///d:/claude/nomad/scheduler/reconciler/allocs.go) | 同目录源文件 |
| [doc.go](file:///d:/claude/nomad/scheduler/reconciler/doc.go) | 同目录源文件 |
| [filters.go](file:///d:/claude/nomad/scheduler/reconciler/filters.go) | 同目录源文件 |
| [reconcile_cluster.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_cluster.go) | 同目录源文件 |
| [reconcile_node.go](file:///d:/claude/nomad/scheduler/reconciler/reconcile_node.go) | 同目录源文件 |

