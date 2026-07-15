# const.go 代码说明文档

> 文件路径：[scheduler/structs/const.go](file:///d:/claude/nomad/scheduler/structs/const.go)
> 总行数：55 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **调度器包**（`scheduler/`），实现 Nomad 的调度逻辑和算法。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `StatusAllocNotNeeded` | `—` | `"alloc not needed due to job update"` | — |
| `StatusAllocReconnected` | `—` | `"alloc not needed due to disconnected client reconnect"` | — |
| `StatusAllocMigrating` | `—` | `"alloc is being migrated"` | — |
| `StatusAllocUpdating` | `—` | `"alloc is being updated due to job update"` | — |
| `StatusAllocLost` | `—` | `"alloc is lost since its node is down"` | — |
| `StatusAllocUnknown` | `—` | `"alloc is unknown since its node is disconnected"` | — |
| `StatusAllocInPlace` | `—` | `"alloc updating in-place"` | — |
| `StatusAllocNodeTainted` | `—` | `"alloc not needed as node is tainted"` | — |
| `StatusAllocRescheduled` | `—` | `"alloc was rescheduled because it failed"` | — |
| `DescBlockedEvalMaxPlan` | `—` | `"created due to placement conflicts"` | — |
| `DescBlockedEvalFailedPlacements` | `—` | `"created to place remaining allocations"` | — |
| `DescReschedulingFollowupEval` | `—` | `"created for delayed rescheduling"` | — |
| `DescDisconnectTimeoutFollowupEval` | `—` | `"created for delayed disconnect timeout"` | — |

## 4. 方法与函数

该文件未定义方法。

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

该文件无导入包。

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [doc.go](file:///d:/claude/nomad/scheduler/structs/doc.go) | 同目录源文件 |
| [interfaces.go](file:///d:/claude/nomad/scheduler/structs/interfaces.go) | 同目录源文件 |
| [structs.go](file:///d:/claude/nomad/scheduler/structs/structs.go) | 同目录源文件 |

