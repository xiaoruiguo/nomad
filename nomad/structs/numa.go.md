# numa.go 代码说明文档

> 文件路径：[nomad/structs/numa.go](file:///d:/claude/nomad/nomad/structs/numa.go)
> 总行数：175 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 14 个方法/函数。

## 2. 类型定义

### NUMA

**定义位置**：[L25](file:///d:/claude/nomad/nomad/structs/numa.go#L25)

**中文说明**：NUMA 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type NUMA struct {
	Affinity string
	Devices []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Affinity` | `string` | 字符串 |
| `Devices` | `[]string` | 列表 |

**关联方法**（6 个）：`GetDevices`, `Canonicalize`, `Equal`, `Copy`, `Validate`, `Requested`

### LegacyNodeCpuResources

**定义位置**：[L104](file:///d:/claude/nomad/nomad/structs/numa.go#L104)

**中文说明**：LegacyNodeCpuResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type LegacyNodeCpuResources struct {
	CpuShares int64
	TotalCpuCores uint16
	ReservableCpuCores []uint16
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CpuShares` | `int64` | — |
| `TotalCpuCores` | `uint16` | — |
| `ReservableCpuCores` | `[]uint16` | 列表 |

**关联方法**（1 个）：`empty`

### NodeProcessorResources

**定义位置**：[L124](file:///d:/claude/nomad/nomad/structs/numa.go#L124)

**中文说明**：NodeProcessorResources 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeProcessorResources struct {
	Topology *numalib.Topology
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Topology` | `*numalib.Topology` | — |

**关联方法**（6 个）：`Empty`, `String`, `Copy`, `Merge`, `Equal`, `TotalCompute`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `NoneNUMA` | `—` | `"none"` | — |
| `PreferNUMA` | `—` | `"prefer"` | — |
| `RequireNUMA` | `—` | `"require"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GetDevices` | `n *NUMA` | `` | `[]string` | [L35](file:///d:/claude/nomad/nomad/structs/numa.go#L35) |
| `Canonicalize` | `n *NUMA` | `` | `` | [L42](file:///d:/claude/nomad/nomad/structs/numa.go#L42) |
| `Equal` | `n *NUMA` | `o *NUMA` | `bool` | [L54](file:///d:/claude/nomad/nomad/structs/numa.go#L54) |
| `Copy` | `n *NUMA` | `` | `*NUMA` | [L69](file:///d:/claude/nomad/nomad/structs/numa.go#L69) |
| `Validate` | `n *NUMA` | `` | `error` | [L79](file:///d:/claude/nomad/nomad/structs/numa.go#L79) |
| `Requested` | `n *NUMA` | `` | `bool` | [L93](file:///d:/claude/nomad/nomad/structs/numa.go#L93) |
| `empty` | `r *LegacyNodeCpuResources` | `` | `bool` | [L117](file:///d:/claude/nomad/nomad/structs/numa.go#L117) |
| `Empty` | `r *NodeProcessorResources` | `` | `bool` | [L132](file:///d:/claude/nomad/nomad/structs/numa.go#L132) |
| `NewNodeProcessorResources` | - | `top *numalib.Topology` | `NodeProcessorResources` | [L136](file:///d:/claude/nomad/nomad/structs/numa.go#L136) |
| `String` | `r *NodeProcessorResources` | `` | `string` | [L142](file:///d:/claude/nomad/nomad/structs/numa.go#L142) |
| `Copy` | `r *NodeProcessorResources` | `` | `NodeProcessorResources` | [L149](file:///d:/claude/nomad/nomad/structs/numa.go#L149) |
| `Merge` | `r *NodeProcessorResources` | `o *NodeProcessorResources` | `` | [L155](file:///d:/claude/nomad/nomad/structs/numa.go#L155) |
| `Equal` | `r *NodeProcessorResources` | `o *NodeProcessorResources` | `bool` | [L162](file:///d:/claude/nomad/nomad/structs/numa.go#L162) |
| `TotalCompute` | `r *NodeProcessorResources` | `` | `int` | [L169](file:///d:/claude/nomad/nomad/structs/numa.go#L169) |

## 5. 核心方法详解

### Copy()

**签名**：`func (n *NUMA) Copy() *NUMA`

**位置**：[L69](file:///d:/claude/nomad/nomad/structs/numa.go#L69)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NUMA` | — |

### Validate()

**签名**：`func (n *NUMA) Validate() error`

**位置**：[L79](file:///d:/claude/nomad/nomad/structs/numa.go#L79)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### NewNodeProcessorResources()

**签名**：`func NewNodeProcessorResources(top *numalib.Topology) NodeProcessorResources`

**位置**：[L136](file:///d:/claude/nomad/nomad/structs/numa.go#L136)

**中文说明**：创建并返回一个新的 NodeProcessorResources 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `top` | `*numalib.Topology` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `NodeProcessorResources` | — |

### Copy()

**签名**：`func (r *NodeProcessorResources) Copy() NodeProcessorResources`

**位置**：[L149](file:///d:/claude/nomad/nomad/structs/numa.go#L149)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `NodeProcessorResources` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `slices` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/numalib` | 内部包 |

## 7. 设计模式与技术特点

- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [numa_test.go](file:///d:/claude/nomad/nomad/structs/numa_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

