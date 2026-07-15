# reconnecting_picker.go 代码说明文档

> 文件路径：[reconciler/reconnecting_picker.go](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go)
> 总行数：154 行
> 所属包：`reconciler`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **协调器子包**（`scheduler/reconciler`），实现服务/批处理作业的状态协调逻辑。比较现有分配状态与期望状态的差异，计算需要创建、更新、停止、迁移的分配集合。是 GenericScheduler 的第一阶段，将期望状态转换为具体的放置计划。

## 2. 类型定义

### reconnectingPickerInterface

**定义位置**：[L13](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L13)

**类型**：interface

```go
	pickReconnectingAlloc
```

### reconnectingPicker

**定义位置**：[L17](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L17)

**类型**：struct

```go
	logger log.Logger
```

**关联方法**（5 个）：`pickReconnectingAlloc`, `pickBestScore`, `pickOriginal`, `pickReplacement`, `pickLongestRunning`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newReconnectingPicker` | - | `logger log.Logger` | `*reconnectingPicker` | [L21](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L21) |
| `pickReconnectingAlloc` | `rp *reconnectingPicker` | `ds *structs.DisconnectStrategy, original *structs.Allocation, replacement *s...` | `*structs.Allocation` | [L29](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L29) |
| `pickBestScore` | `rp *reconnectingPicker` | `original *structs.Allocation, replacement *structs.Allocation` | `*structs.Allocation` | [L69](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L69) |
| `pickOriginal` | `rp *reconnectingPicker` | `original *structs.Allocation, _ *structs.Allocation` | `*structs.Allocation` | [L94](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L94) |
| `pickReplacement` | `rp *reconnectingPicker` | `_ *structs.Allocation, replacement *structs.Allocation` | `*structs.Allocation` | [L98](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L98) |
| `pickLongestRunning` | `rp *reconnectingPicker` | `original *structs.Allocation, replacement *structs.Allocation` | `*structs.Allocation` | [L102](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L102) |
| `startOfLeaderOrOldestTaskInMain` | - | `alloc *structs.Allocation, tg *structs.TaskGroup` | `time.Time` | [L129](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker.go#L129) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [reconnecting_picker_test.go](file:///d:/claude/nomad/scheduler/reconciler/reconnecting_picker_test.go) | 对应测试文件 |

