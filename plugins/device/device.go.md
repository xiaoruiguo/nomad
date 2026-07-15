# device.go 代码说明文档

> 文件路径：[plugins/device/device.go](file:///d:/claude/nomad/plugins/device/device.go)
> 总行数：230 行
> 所属包：`device`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **设备插件接口子包**（`plugins/device`），定义设备插件的接口规范，用于发现和管理硬件设备（GPU、FPGA 等），包括设备指纹采集、资源预留和挂载管理。

## 2. 类型定义

### DevicePlugin

**定义位置**：[L28](file:///d:/claude/nomad/plugins/device/device.go#L28)

**中文说明**：DevicePlugin 与插件（Plugin）相关，实现可扩展的功能模块。

**类型**：interface

```go
type DevicePlugin interface {
	base.BasePlugin base.BasePlugin
	Fingerprint func(...)
	Reserve func(...)
	Stats func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `base.BasePlugin` | `base.BasePlugin` | — |
| `Fingerprint` | `func(...)` | — |
| `Reserve` | `func(...)` | — |
| `Stats` | `func(...)` | 返回对象的统计信息。 |

### FingerprintResponse

**定义位置**：[L45](file:///d:/claude/nomad/plugins/device/device.go#L45)

**中文说明**：FingerprintResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type FingerprintResponse struct {
	Devices []*DeviceGroup
	Error error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Devices` | `[]*DeviceGroup` | 列表 |
| `Error` | `error` | 错误信息 |

### DeviceGroup

**定义位置**：[L70](file:///d:/claude/nomad/plugins/device/device.go#L70)

**中文说明**：DeviceGroup 与设备（Device）相关，管理硬件资源如 GPU/FPGA。

**类型**：struct

```go
type DeviceGroup struct {
	Vendor string
	Type string
	Name string
	Devices []*Device
	Attributes map[string]*structs.Attribute
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Vendor` | `string` | 字符串 |
| `Type` | `string` | 类型 |
| `Name` | `string` | 名称 |
| `Devices` | `[]*Device` | 列表 |
| `Attributes` | `map[string]*structs.Attribute` | 映射表 |

**关联方法**（1 个）：`Validate`

### Device

**定义位置**：[L123](file:///d:/claude/nomad/plugins/device/device.go#L123)

**中文说明**：Device 与设备（Device）相关，管理硬件资源如 GPU/FPGA。

**类型**：struct

```go
type Device struct {
	ID string
	Healthy bool
	HealthDesc string
	HwLocality *DeviceLocality
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Healthy` | `bool` | 健康的 标记 whether 设备 is 健康的 和 可以 用于 调度. |
| `HealthDesc` | `string` | 字符串 |
| `HwLocality` | `*DeviceLocality` | — |

**关联方法**（1 个）：`Validate`

### DeviceLocality

**定义位置**：[L148](file:///d:/claude/nomad/plugins/device/device.go#L148)

**中文说明**：DeviceLocality 与设备（Device）相关，管理硬件资源如 GPU/FPGA。

**类型**：struct

```go
type DeviceLocality struct {
	PciBusID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PciBusID` | `string` | 字符串 |

### ContainerReservation

**定义位置**：[L155](file:///d:/claude/nomad/plugins/device/device.go#L155)

**中文说明**：ContainerReservation 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ContainerReservation struct {
	Envs map[string]string
	Mounts []*Mount
	Devices []*DeviceSpec
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Envs` | `map[string]string` | 映射表 |
| `Mounts` | `[]*Mount` | 列表 |
| `Devices` | `[]*DeviceSpec` | 列表 |

### Mount

**定义位置**：[L168](file:///d:/claude/nomad/plugins/device/device.go#L168)

**中文说明**：Mount 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Mount struct {
	TaskPath string
	HostPath string
	ReadOnly bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TaskPath` | `string` | 字符串 |
| `HostPath` | `string` | 字符串 |
| `ReadOnly` | `bool` | 布尔值 |

### DeviceSpec

**定义位置**：[L180](file:///d:/claude/nomad/plugins/device/device.go#L180)

**中文说明**：DeviceSpec 是一个规格定义结构体，描述对象的规格参数。

**类型**：struct

```go
type DeviceSpec struct {
	TaskPath string
	HostPath string
	CgroupPerms string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TaskPath` | `string` | 字符串 |
| `HostPath` | `string` | 字符串 |
| `CgroupPerms` | `string` | 字符串 |

### StatsResponse

**定义位置**：[L192](file:///d:/claude/nomad/plugins/device/device.go#L192)

**中文说明**：StatsResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type StatsResponse struct {
	Groups []*DeviceGroupStats
	Error error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Groups` | `[]*DeviceGroupStats` | 列表 |
| `Error` | `error` | 错误信息 |

### DeviceGroupStats

**定义位置**：[L209](file:///d:/claude/nomad/plugins/device/device.go#L209)

**中文说明**：DeviceGroupStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type DeviceGroupStats struct {
	Vendor string
	Type string
	Name string
	InstanceStats map[string]*DeviceStats
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Vendor` | `string` | 字符串 |
| `Type` | `string` | 类型 |
| `Name` | `string` | 名称 |
| `InstanceStats` | `map[string]*DeviceStats` | 映射表 |

### DeviceStats

**定义位置**：[L219](file:///d:/claude/nomad/plugins/device/device.go#L219)

**中文说明**：DeviceStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type DeviceStats struct {
	Summary *structs.StatValue
	Stats *structs.StatObject
	Timestamp time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Summary` | `*structs.StatValue` | — |
| `Stats` | `*structs.StatObject` | — |
| `Timestamp` | `time.Time` | 时间戳 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `DeviceTypeGPU` | `—` | `"gpu"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ErrPluginDisabled` | `—` | `fmt.Errorf("device is not enabled")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewFingerprint` | - | `devices ...*DeviceGroup` | `*FingerprintResponse` | [L55](file:///d:/claude/nomad/plugins/device/device.go#L55) |
| `NewFingerprintError` | - | `err error` | `*FingerprintResponse` | [L62](file:///d:/claude/nomad/plugins/device/device.go#L62) |
| `Validate` | `d *DeviceGroup` | `` | `error` | [L88](file:///d:/claude/nomad/plugins/device/device.go#L88) |
| `Validate` | `d *Device` | `` | `error` | [L139](file:///d:/claude/nomad/plugins/device/device.go#L139) |
| `NewStatsError` | - | `err error` | `*StatsResponse` | [L201](file:///d:/claude/nomad/plugins/device/device.go#L201) |

## 5. 核心方法详解

### NewFingerprint()

**签名**：`func NewFingerprint(devices ...*DeviceGroup) *FingerprintResponse`

**位置**：[L55](file:///d:/claude/nomad/plugins/device/device.go#L55)

**中文说明**：创建并返回一个新的 Fingerprint 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `devices` | `...*DeviceGroup` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*FingerprintResponse` | — |

### NewFingerprintError()

**签名**：`func NewFingerprintError(err error) *FingerprintResponse`

**位置**：[L62](file:///d:/claude/nomad/plugins/device/device.go#L62)

**中文说明**：创建并返回一个新的 FingerprintError 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `err` | `error` | 错误信息 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*FingerprintResponse` | — |

### Validate()

**签名**：`func (d *DeviceGroup) Validate() error`

**位置**：[L88](file:///d:/claude/nomad/plugins/device/device.go#L88)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Validate()

**签名**：`func (d *Device) Validate() error`

**位置**：[L139](file:///d:/claude/nomad/plugins/device/device.go#L139)

**中文说明**：验证 验证 该 设备 is 有效的

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### NewStatsError()

**签名**：`func NewStatsError(err error) *StatsResponse`

**位置**：[L201](file:///d:/claude/nomad/plugins/device/device.go#L201)

**中文说明**：创建并返回一个新的 StatsError 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `err` | `error` | 错误信息 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*StatsResponse` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [client.go](file:///d:/claude/nomad/plugins/device/client.go) | 同目录源文件 |
| [mock.go](file:///d:/claude/nomad/plugins/device/mock.go) | 同目录源文件 |
| [plugin.go](file:///d:/claude/nomad/plugins/device/plugin.go) | 同目录源文件 |
| [server.go](file:///d:/claude/nomad/plugins/device/server.go) | 同目录源文件 |
| [util.go](file:///d:/claude/nomad/plugins/device/util.go) | 同目录源文件 |

