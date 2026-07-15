# device.go 代码说明文档

> 文件路径：[feasible/device.go](file:///d:/claude/nomad/scheduler/feasible/device.go)
> 总行数：237 行
> 所属包：`feasible`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **可行性检查子包**（`scheduler/feasible`），实现调度器的可行性检查和评分迭代器栈。包含节点过滤（约束、驱动、设备、网络）、评分（装箱、分散、资源利用率）、抢占、排名等核心调度算法。是调度决策的核心引擎，采用迭代器链模式（Iterator Chain）实现可组合的调度管道。

## 2. 类型定义

### deviceAllocator

**定义位置**：[L20](file:///d:/claude/nomad/scheduler/feasible/device.go#L20)

**类型**：struct

```go
	*structs.DeviceAccounter
	ctx Context
```

**关联方法**（3 个）：`Copy`, `createOffer`, `deviceIDMatchesConstraint`

### memoryNodeMatcher

**定义位置**：[L42](file:///d:/claude/nomad/scheduler/feasible/device.go#L42)

**类型**：struct

```go
	memoryNode int
	topology *numalib.Topology
	devices *set.Set[string]
```

**关联方法**（1 个）：`Matches`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newDeviceAllocator` | - | `ctx Context, n *structs.Node` | `*deviceAllocator` | [L29](file:///d:/claude/nomad/scheduler/feasible/device.go#L29) |
| `Copy` | `d *deviceAllocator` | - | `*deviceAllocator` | [L36](file:///d:/claude/nomad/scheduler/feasible/device.go#L36) |
| `equalBusID` | - | `a string, b string` | `bool` | [L52](file:///d:/claude/nomad/scheduler/feasible/device.go#L52) |
| `Matches` | `m *memoryNodeMatcher` | `instanceID string, device *structs.NodeDeviceResource` | `bool` | [L68](file:///d:/claude/nomad/scheduler/feasible/device.go#L68) |
| `createOffer` | `d *deviceAllocator` | `mem *memoryNodeMatcher, ask *structs.RequestedDevice` | `out *structs.AllocatedDeviceResource, score float64, err...` | [L106](file:///d:/claude/nomad/scheduler/feasible/device.go#L106) |
| `deviceIDMatchesConstraint` | `d *deviceAllocator` | `id string, constraints structs.Constraints, device *structs.NodeDeviceResource` | `bool` | [L211](file:///d:/claude/nomad/scheduler/feasible/device.go#L211) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `math` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/numalib` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 调度器的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [device_test.go](file:///d:/claude/nomad/scheduler/feasible/device_test.go) | 对应测试文件 |

