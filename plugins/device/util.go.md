# util.go 代码说明文档

> 文件路径：[plugins/device/util.go](file:///d:/claude/nomad/plugins/device/util.go)
> 总行数：391 行
> 所属包：`device`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **设备插件接口子包**（`plugins/device`），定义设备插件的接口规范，用于发现和管理硬件设备（GPU、FPGA 等），包括设备指纹采集、资源预留和挂载管理。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `convertProtoDeviceGroups` | - | `in []*proto.DeviceGroup` | `[]*DeviceGroup` | [L13](file:///d:/claude/nomad/plugins/device/util.go#L13) |
| `convertProtoDeviceGroup` | - | `in *proto.DeviceGroup` | `*DeviceGroup` | [L27](file:///d:/claude/nomad/plugins/device/util.go#L27) |
| `convertProtoDevices` | - | `in []*proto.DetectedDevice` | `[]*Device` | [L42](file:///d:/claude/nomad/plugins/device/util.go#L42) |
| `convertProtoDevice` | - | `in *proto.DetectedDevice` | `*Device` | [L56](file:///d:/claude/nomad/plugins/device/util.go#L56) |
| `convertProtoDeviceLocality` | - | `in *proto.DeviceLocality` | `*DeviceLocality` | [L70](file:///d:/claude/nomad/plugins/device/util.go#L70) |
| `convertProtoContainerReservation` | - | `in *proto.ContainerReservation` | `*ContainerReservation` | [L82](file:///d:/claude/nomad/plugins/device/util.go#L82) |
| `convertProtoMounts` | - | `in []*proto.Mount` | `[]*Mount` | [L95](file:///d:/claude/nomad/plugins/device/util.go#L95) |
| `convertProtoMount` | - | `in *proto.Mount` | `*Mount` | [L109](file:///d:/claude/nomad/plugins/device/util.go#L109) |
| `convertProtoDeviceSpecs` | - | `in []*proto.DeviceSpec` | `[]*DeviceSpec` | [L122](file:///d:/claude/nomad/plugins/device/util.go#L122) |
| `convertProtoDeviceSpec` | - | `in *proto.DeviceSpec` | `*DeviceSpec` | [L136](file:///d:/claude/nomad/plugins/device/util.go#L136) |
| `convertStructDeviceGroups` | - | `in []*DeviceGroup` | `[]*proto.DeviceGroup` | [L149](file:///d:/claude/nomad/plugins/device/util.go#L149) |
| `convertStructDeviceGroup` | - | `in *DeviceGroup` | `*proto.DeviceGroup` | [L163](file:///d:/claude/nomad/plugins/device/util.go#L163) |
| `convertStructDevices` | - | `in []*Device` | `[]*proto.DetectedDevice` | [L178](file:///d:/claude/nomad/plugins/device/util.go#L178) |
| `convertStructDevice` | - | `in *Device` | `*proto.DetectedDevice` | [L192](file:///d:/claude/nomad/plugins/device/util.go#L192) |
| `convertStructDeviceLocality` | - | `in *DeviceLocality` | `*proto.DeviceLocality` | [L206](file:///d:/claude/nomad/plugins/device/util.go#L206) |
| `convertStructContainerReservation` | - | `in *ContainerReservation` | `*proto.ContainerReservation` | [L218](file:///d:/claude/nomad/plugins/device/util.go#L218) |
| `convertStructMounts` | - | `in []*Mount` | `[]*proto.Mount` | [L231](file:///d:/claude/nomad/plugins/device/util.go#L231) |
| `convertStructMount` | - | `in *Mount` | `*proto.Mount` | [L245](file:///d:/claude/nomad/plugins/device/util.go#L245) |
| `convertStructDeviceSpecs` | - | `in []*DeviceSpec` | `[]*proto.DeviceSpec` | [L258](file:///d:/claude/nomad/plugins/device/util.go#L258) |
| `convertStructDeviceSpec` | - | `in *DeviceSpec` | `*proto.DeviceSpec` | [L272](file:///d:/claude/nomad/plugins/device/util.go#L272) |
| `convertProtoDeviceGroupsStats` | - | `in []*proto.DeviceGroupStats` | `[]*DeviceGroupStats` | [L286](file:///d:/claude/nomad/plugins/device/util.go#L286) |
| `convertProtoDeviceGroupStats` | - | `in *proto.DeviceGroupStats` | `*DeviceGroupStats` | [L301](file:///d:/claude/nomad/plugins/device/util.go#L301) |
| `convertProtoDeviceStats` | - | `in *proto.DeviceStats` | `*DeviceStats` | [L321](file:///d:/claude/nomad/plugins/device/util.go#L321) |
| `convertStructDeviceGroupsStats` | - | `in []*DeviceGroupStats` | `[]*proto.DeviceGroupStats` | [L340](file:///d:/claude/nomad/plugins/device/util.go#L340) |
| `convertStructDeviceGroupStats` | - | `in *DeviceGroupStats` | `*proto.DeviceGroupStats` | [L355](file:///d:/claude/nomad/plugins/device/util.go#L355) |
| `convertStructDeviceStats` | - | `in *DeviceStats` | `*proto.DeviceStats` | [L375](file:///d:/claude/nomad/plugins/device/util.go#L375) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/plugins/device/proto` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/golang/protobuf/ptypes` | 第三方库 |

## 7. 设计模式与技术特点

- **gRPC 通信**：使用 gRPC 进行进程间通信

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [client.go](file:///d:/claude/nomad/plugins/device/client.go) | 同目录源文件 |
| [device.go](file:///d:/claude/nomad/plugins/device/device.go) | 同目录源文件 |
| [mock.go](file:///d:/claude/nomad/plugins/device/mock.go) | 同目录源文件 |
| [plugin.go](file:///d:/claude/nomad/plugins/device/plugin.go) | 同目录源文件 |
| [server.go](file:///d:/claude/nomad/plugins/device/server.go) | 同目录源文件 |

