# devices.go 代码说明文档

> 文件路径：[nomad/structs/devices.go](file:///d:/claude/nomad/nomad/structs/devices.go)
> 总行数：176 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 7 个方法/函数。

## 2. 类型定义

### DeviceAccounter

**定义位置**：[L11](file:///d:/claude/nomad/nomad/structs/devices.go#L11)

**中文说明**：DeviceAccounter 与设备（Device）相关，管理硬件资源如 GPU/FPGA。

**类型**：struct

```go
type DeviceAccounter struct {
	Devices map[DeviceIdTuple]*DeviceAccounterInstance
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Devices` | `map[DeviceIdTuple]*DeviceAccounterInstance` | 映射表 |

**关联方法**（3 个）：`Copy`, `AddAllocs`, `AddReserved`

### DeviceAccounterInstance

**定义位置**：[L18](file:///d:/claude/nomad/nomad/structs/devices.go#L18)

**中文说明**：DeviceAccounterInstance 与设备（Device）相关，管理硬件资源如 GPU/FPGA。

**类型**：struct

```go
type DeviceAccounterInstance struct {
	Device *NodeDeviceResource
	Instances map[string]int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Device` | `*NodeDeviceResource` | — |
| `Instances` | `map[string]int` | 映射表 |

**关联方法**（3 个）：`GetLocality`, `Copy`, `FreeCount`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GetLocality` | `dai *DeviceAccounterInstance` | `instanceID string` | `*NodeDeviceLocality` | [L31](file:///d:/claude/nomad/nomad/structs/devices.go#L31) |
| `Copy` | `dai *DeviceAccounterInstance` | `` | `*DeviceAccounterInstance` | [L40](file:///d:/claude/nomad/nomad/structs/devices.go#L40) |
| `NewDeviceAccounter` | - | `n *Node` | `*DeviceAccounter` | [L50](file:///d:/claude/nomad/nomad/structs/devices.go#L50) |
| `Copy` | `d *DeviceAccounter` | `` | `*DeviceAccounter` | [L83](file:///d:/claude/nomad/nomad/structs/devices.go#L83) |
| `AddAllocs` | `d *DeviceAccounter` | `allocs []*Allocation` | `collision bool` | [L94](file:///d:/claude/nomad/nomad/structs/devices.go#L94) |
| `AddReserved` | `d *DeviceAccounter` | `res *AllocatedDeviceResource` | `collision bool` | [L141](file:///d:/claude/nomad/nomad/structs/devices.go#L141) |
| `FreeCount` | `dai *DeviceAccounterInstance` | `` | `int` | [L167](file:///d:/claude/nomad/nomad/structs/devices.go#L167) |

## 5. 核心方法详解

### Copy()

**签名**：`func (dai *DeviceAccounterInstance) Copy() *DeviceAccounterInstance`

**位置**：[L40](file:///d:/claude/nomad/nomad/structs/devices.go#L40)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DeviceAccounterInstance` | — |

### NewDeviceAccounter()

**签名**：`func NewDeviceAccounter(n *Node) *DeviceAccounter`

**位置**：[L50](file:///d:/claude/nomad/nomad/structs/devices.go#L50)

**中文说明**：创建并返回一个新的 DeviceAccounter 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `n` | `*Node` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DeviceAccounter` | — |

### Copy()

**签名**：`func (d *DeviceAccounter) Copy() *DeviceAccounter`

**位置**：[L83](file:///d:/claude/nomad/nomad/structs/devices.go#L83)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*DeviceAccounter` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `maps` | 标准库 |

## 7. 设计模式与技术特点

- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [devices_test.go](file:///d:/claude/nomad/nomad/structs/devices_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

