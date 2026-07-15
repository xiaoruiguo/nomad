# device.go 代码说明文档

> 文件路径：[plugins/device/device.go](file:///d:/claude/nomad/plugins/device/device.go)
> 总行数：230 行
> 所属包：`device`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **设备插件接口子包**（`plugins/device`），定义设备插件的接口规范，用于发现和管理硬件设备（GPU、FPGA 等），包括设备指纹采集、资源预留和挂载管理，通过 gRPC 与 Nomad 通信。

## 2. 类型定义

### DevicePlugin

**定义位置**：[L28](file:///d:/claude/nomad/plugins/device/device.go#L28)

**类型**：interface

```go
	base.BasePlugin
	Fingerprint
	Reserve
	Stats
```

### FingerprintResponse

**定义位置**：[L45](file:///d:/claude/nomad/plugins/device/device.go#L45)

**类型**：struct

```go
	Devices []*DeviceGroup
	Error error
```

### DeviceGroup

**定义位置**：[L70](file:///d:/claude/nomad/plugins/device/device.go#L70)

**类型**：struct

```go
	Vendor string
	Type string
	Name string
	Devices []*Device
	Attributes map[string]*structs.Attribute
```

**关联方法**（1 个）：`Validate`

### Device

**定义位置**：[L123](file:///d:/claude/nomad/plugins/device/device.go#L123)

**类型**：struct

```go
	ID string
	Healthy bool
	HealthDesc string
	HwLocality *DeviceLocality
```

**关联方法**（1 个）：`Validate`

### DeviceLocality

**定义位置**：[L148](file:///d:/claude/nomad/plugins/device/device.go#L148)

**类型**：struct

```go
	PciBusID string
```

### ContainerReservation

**定义位置**：[L155](file:///d:/claude/nomad/plugins/device/device.go#L155)

**类型**：struct

```go
	Envs map[string]string
	Mounts []*Mount
	Devices []*DeviceSpec
```

### Mount

**定义位置**：[L168](file:///d:/claude/nomad/plugins/device/device.go#L168)

**类型**：struct

```go
	TaskPath string
	HostPath string
	ReadOnly bool
```

### DeviceSpec

**定义位置**：[L180](file:///d:/claude/nomad/plugins/device/device.go#L180)

**类型**：struct

```go
	TaskPath string
	HostPath string
	CgroupPerms string
```

### StatsResponse

**定义位置**：[L192](file:///d:/claude/nomad/plugins/device/device.go#L192)

**类型**：struct

```go
	Groups []*DeviceGroupStats
	Error error
```

### DeviceGroupStats

**定义位置**：[L209](file:///d:/claude/nomad/plugins/device/device.go#L209)

**类型**：struct

```go
	Vendor string
	Type string
	Name string
	InstanceStats map[string]*DeviceStats
```

### DeviceStats

**定义位置**：[L219](file:///d:/claude/nomad/plugins/device/device.go#L219)

**类型**：struct

```go
	Summary *structs.StatValue
	Stats *structs.StatObject
	Timestamp time.Time
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `DeviceTypeGPU` | `"gpu"` |

### 变量

| 名称 | 值 |
|------|----|
| `ErrPluginDisabled` | `fmt.Errorf("device is not enabled")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewFingerprint` | - | `devices ...*DeviceGroup` | `*FingerprintResponse` | [L55](file:///d:/claude/nomad/plugins/device/device.go#L55) |
| `NewFingerprintError` | - | `err error` | `*FingerprintResponse` | [L62](file:///d:/claude/nomad/plugins/device/device.go#L62) |
| `Validate` | `d *DeviceGroup` | - | `error` | [L88](file:///d:/claude/nomad/plugins/device/device.go#L88) |
| `Validate` | `d *Device` | - | `error` | [L139](file:///d:/claude/nomad/plugins/device/device.go#L139) |
| `NewStatsError` | - | `err error` | `*StatsResponse` | [L201](file:///d:/claude/nomad/plugins/device/device.go#L201) |

## 5. 核心方法详解

### NewFingerprint()

**签名**：`func NewFingerprint(devices ...*DeviceGroup) *FingerprintResponse`

**位置**：[L55](file:///d:/claude/nomad/plugins/device/device.go#L55)

### NewFingerprintError()

**签名**：`func NewFingerprintError(err error) *FingerprintResponse`

**位置**：[L62](file:///d:/claude/nomad/plugins/device/device.go#L62)

### Validate()

**签名**：`func (d *DeviceGroup) Validate() error`

**位置**：[L88](file:///d:/claude/nomad/plugins/device/device.go#L88)

### Validate()

**签名**：`func (d *Device) Validate() error`

**位置**：[L139](file:///d:/claude/nomad/plugins/device/device.go#L139)

### NewStatsError()

**签名**：`func NewStatsError(err error) *StatsResponse`

**位置**：[L201](file:///d:/claude/nomad/plugins/device/device.go#L201)

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

## 8. 相关文件

| 文件 | 关系 |
|------|------|

