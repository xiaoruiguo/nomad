# utils.go 代码说明文档

> 文件路径：[devicemanager/utils.go](file:///d:/claude/nomad/client/devicemanager/utils.go)
> 总行数：97 行
> 所属包：`devicemanager`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **设备管理器子包**（`client/devicemanager`），管理 GPU、FPGA 等硬件设备的发现、分配和统计。

## 2. 类型定义

### UnknownDeviceError

**定义位置**：[L17](file:///d:/claude/nomad/client/devicemanager/utils.go#L17)

**类型**：struct

```go
	Err error
	Name string
	Vendor string
	Type string
	IDs []string
```

**关联方法**（1 个）：`Error`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewUnknownDeviceError` | - | `err error, name string, vendor string, devType string, ids []string` | `*UnknownDeviceError` | [L26](file:///d:/claude/nomad/client/devicemanager/utils.go#L26) |
| `Error` | `u *UnknownDeviceError` | - | `string` | [L37](file:///d:/claude/nomad/client/devicemanager/utils.go#L37) |
| `UnknownDeviceErrFromAllocated` | - | `err string, d *structs.AllocatedDeviceResource` | `*UnknownDeviceError` | [L44](file:///d:/claude/nomad/client/devicemanager/utils.go#L44) |
| `convertDeviceGroup` | - | `d *device.DeviceGroup` | `*structs.NodeDeviceResource` | [L49](file:///d:/claude/nomad/client/devicemanager/utils.go#L49) |
| `convertDevices` | - | `devs []*device.Device` | `[]*structs.NodeDevice` | [L63](file:///d:/claude/nomad/client/devicemanager/utils.go#L63) |
| `convertDevice` | - | `dev *device.Device` | `*structs.NodeDevice` | [L75](file:///d:/claude/nomad/client/devicemanager/utils.go#L75) |
| `convertHwLocality` | - | `l *device.DeviceLocality` | `*structs.NodeDeviceLocality` | [L88](file:///d:/claude/nomad/client/devicemanager/utils.go#L88) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/device` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Client 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|

