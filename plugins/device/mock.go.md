# mock.go 代码说明文档

> 文件路径：[plugins/device/mock.go](file:///d:/claude/nomad/plugins/device/mock.go)
> 总行数：112 行
> 所属包：`device`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **设备插件接口子包**（`plugins/device`），定义设备插件的接口规范，用于发现和管理硬件设备（GPU、FPGA 等），包括设备指纹采集、资源预留和挂载管理，通过 gRPC 与 Nomad 通信。

## 2. 类型定义

### FingerprintFn

**定义位置**：[L13](file:///d:/claude/nomad/plugins/device/mock.go#L13)

**类型定义**：`func(...)`

### ReserveFn

**定义位置**：[L14](file:///d:/claude/nomad/plugins/device/mock.go#L14)

**类型定义**：`func(...)`

### StatsFn

**定义位置**：[L15](file:///d:/claude/nomad/plugins/device/mock.go#L15)

**类型定义**：`func(...)`

### MockDevicePlugin

**定义位置**：[L20](file:///d:/claude/nomad/plugins/device/mock.go#L20)

**类型**：struct

```go
	*base.MockPlugin
	FingerprintF FingerprintFn
	ReserveF ReserveFn
	StatsF StatsFn
```

**关联方法**（3 个）：`Fingerprint`, `Reserve`, `Stats`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Fingerprint` | `p *MockDevicePlugin` | `ctx context.Context` | `chan *FingerprintResponse, error` | [L27](file:///d:/claude/nomad/plugins/device/mock.go#L27) |
| `Reserve` | `p *MockDevicePlugin` | `devices []string` | `*ContainerReservation, error` | [L31](file:///d:/claude/nomad/plugins/device/mock.go#L31) |
| `Stats` | `p *MockDevicePlugin` | `ctx context.Context, interval time.Duration` | `chan *StatsResponse, error` | [L35](file:///d:/claude/nomad/plugins/device/mock.go#L35) |
| `StaticFingerprinter` | - | `devices []*DeviceGroup` | `FingerprintFn` | [L42](file:///d:/claude/nomad/plugins/device/mock.go#L42) |
| `ErrorChFingerprinter` | - | `err error` | `FingerprintFn` | [L53](file:///d:/claude/nomad/plugins/device/mock.go#L53) |
| `StaticReserve` | - | `out *ContainerReservation` | `ReserveFn` | [L64](file:///d:/claude/nomad/plugins/device/mock.go#L64) |
| `ErrorReserve` | - | `err error` | `ReserveFn` | [L71](file:///d:/claude/nomad/plugins/device/mock.go#L71) |
| `StaticStats` | - | `out []*DeviceGroupStats` | `StatsFn` | [L78](file:///d:/claude/nomad/plugins/device/mock.go#L78) |
| `ErrorChStats` | - | `err error` | `StatsFn` | [L103](file:///d:/claude/nomad/plugins/device/mock.go#L103) |

## 5. 核心方法详解

### Fingerprint()

**签名**：`func (p *MockDevicePlugin) Fingerprint(ctx context.Context) chan *FingerprintResponse, error`

**位置**：[L27](file:///d:/claude/nomad/plugins/device/mock.go#L27)

### Stats()

**签名**：`func (p *MockDevicePlugin) Stats(ctx context.Context, interval time.Duration) chan *StatsResponse, error`

**位置**：[L35](file:///d:/claude/nomad/plugins/device/mock.go#L35)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制

## 8. 相关文件

| 文件 | 关系 |
|------|------|

