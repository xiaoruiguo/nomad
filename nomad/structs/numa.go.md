# numa.go 代码说明文档

> 文件路径：[structs/numa.go](file:///d:/claude/nomad/nomad/structs/numa.go)
> 总行数：175 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### NUMA

**定义位置**：[L25](file:///d:/claude/nomad/nomad/structs/numa.go#L25)

**类型**：struct

```go
	Affinity string
	Devices []string
```

**关联方法**（6 个）：`GetDevices`, `Canonicalize`, `Equal`, `Copy`, `Validate`, `Requested`

### LegacyNodeCpuResources

**定义位置**：[L104](file:///d:/claude/nomad/nomad/structs/numa.go#L104)

**类型**：struct

```go
	CpuShares int64
	TotalCpuCores uint16
	ReservableCpuCores []uint16
```

**关联方法**（1 个）：`empty`

### NodeProcessorResources

**定义位置**：[L124](file:///d:/claude/nomad/nomad/structs/numa.go#L124)

**类型**：struct

```go
	Topology *numalib.Topology
```

**关联方法**（6 个）：`Empty`, `String`, `Copy`, `Merge`, `Equal`, `TotalCompute`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `NoneNUMA` | `"none"` |
| `PreferNUMA` | `"prefer"` |
| `RequireNUMA` | `"require"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GetDevices` | `n *NUMA` | - | `[]string` | [L35](file:///d:/claude/nomad/nomad/structs/numa.go#L35) |
| `Canonicalize` | `n *NUMA` | - | - | [L42](file:///d:/claude/nomad/nomad/structs/numa.go#L42) |
| `Equal` | `n *NUMA` | `o *NUMA` | `bool` | [L54](file:///d:/claude/nomad/nomad/structs/numa.go#L54) |
| `Copy` | `n *NUMA` | - | `*NUMA` | [L69](file:///d:/claude/nomad/nomad/structs/numa.go#L69) |
| `Validate` | `n *NUMA` | - | `error` | [L79](file:///d:/claude/nomad/nomad/structs/numa.go#L79) |
| `Requested` | `n *NUMA` | - | `bool` | [L93](file:///d:/claude/nomad/nomad/structs/numa.go#L93) |
| `empty` | `r *LegacyNodeCpuResources` | - | `bool` | [L117](file:///d:/claude/nomad/nomad/structs/numa.go#L117) |
| `Empty` | `r *NodeProcessorResources` | - | `bool` | [L132](file:///d:/claude/nomad/nomad/structs/numa.go#L132) |
| `NewNodeProcessorResources` | - | `top *numalib.Topology` | `NodeProcessorResources` | [L136](file:///d:/claude/nomad/nomad/structs/numa.go#L136) |
| `String` | `r *NodeProcessorResources` | - | `string` | [L142](file:///d:/claude/nomad/nomad/structs/numa.go#L142) |
| `Copy` | `r *NodeProcessorResources` | - | `NodeProcessorResources` | [L149](file:///d:/claude/nomad/nomad/structs/numa.go#L149) |
| `Merge` | `r *NodeProcessorResources` | `o *NodeProcessorResources` | - | [L155](file:///d:/claude/nomad/nomad/structs/numa.go#L155) |
| `Equal` | `r *NodeProcessorResources` | `o *NodeProcessorResources` | `bool` | [L162](file:///d:/claude/nomad/nomad/structs/numa.go#L162) |
| `TotalCompute` | `r *NodeProcessorResources` | - | `int` | [L169](file:///d:/claude/nomad/nomad/structs/numa.go#L169) |

## 5. 核心方法详解

### GetDevices()

**签名**：`func (n *NUMA) GetDevices() []string`

**位置**：[L35](file:///d:/claude/nomad/nomad/structs/numa.go#L35)

### Validate()

**签名**：`func (n *NUMA) Validate() error`

**位置**：[L79](file:///d:/claude/nomad/nomad/structs/numa.go#L79)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `slices` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/numalib` | 内部包 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Server 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [numa_test.go](file:///d:/claude/nomad/nomad/structs/numa_test.go) | 对应测试文件 |

