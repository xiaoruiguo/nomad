# device.go 代码说明文档

> 文件路径：[plugins/device/cmd/example/device.go](file:///d:/claude/nomad/plugins/device/cmd/example/device.go)
> 总行数：383 行
> 所属包：`example`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **设备插件接口子包**（`plugins/device`），定义设备插件的接口规范，用于发现和管理硬件设备（GPU、FPGA 等），包括设备指纹采集、资源预留和挂载管理，通过 gRPC 与 Nomad 通信。

## 2. 类型定义

### Config

**定义位置**：[L67](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L67)

**类型**：struct

```go
	Dir string `codec:"dir"`
	ListPeriod string `codec:"list_period"`
	UnhealthyPerm string `codec:"unhealthy_perm"`
```

### FsDevice

**定义位置**：[L77](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L77)

**类型**：struct

```go
	logger log.Logger
	deviceDir string
	unhealthyPerm string
	listPeriod time.Duration
	devices map[string]bool
	deviceLock sync.RWMutex
```

**关联方法**（10 个）：`PluginInfo`, `ConfigSchema`, `SetConfig`, `Fingerprint`, `fingerprint`, `diffFiles`, `Reserve`, `Stats`, `stats`, `collectStats`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `pluginName` | `"example-fs-device"` |
| `vendor` | `"nomad"` |
| `deviceType` | `"file"` |
| `deviceName` | `"mock"` |

### 变量

| 名称 | 值 |
|------|----|
| `pluginInfo` | `&base.PluginInfoResponse{...}` |
| `configSpec` | `hclspec.NewObject(map[string]*hclspec.Spec{...})` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewExampleDevice` | - | `log log.Logger` | `*FsDevice` | [L96](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L96) |
| `PluginInfo` | `d *FsDevice` | - | `*base.PluginInfoResponse, error` | [L104](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L104) |
| `ConfigSchema` | `d *FsDevice` | - | `*hclspec.Spec, error` | [L109](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L109) |
| `SetConfig` | `d *FsDevice` | `c *base.Config` | `error` | [L114](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L114) |
| `Fingerprint` | `d *FsDevice` | `ctx context.Context` | `chan *device.FingerprintResponse, error` | [L138](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L138) |
| `fingerprint` | `d *FsDevice` | `ctx context.Context, devices chan *device.FingerprintResponse` | - | [L149](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L149) |
| `diffFiles` | `d *FsDevice` | `files []os.FileInfo` | `[]*device.Device` | [L182](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L182) |
| `getDeviceGroup` | - | `devices []*device.Device` | `*device.DeviceGroup` | [L246](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L246) |
| `Reserve` | `d *FsDevice` | `deviceIDs []string` | `*device.ContainerReservation, error` | [L261](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L261) |
| `Stats` | `d *FsDevice` | `ctx context.Context, interval time.Duration` | `chan *device.StatsResponse, error` | [L291](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L291) |
| `stats` | `d *FsDevice` | `ctx context.Context, stats chan *device.StatsResponse, interval time.Duration` | - | [L298](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L298) |
| `collectStats` | `d *FsDevice` | - | `*device.DeviceGroupStats, error` | [L329](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L329) |

## 5. 核心方法详解

### NewExampleDevice()

**签名**：`func NewExampleDevice(log log.Logger) *FsDevice`

**位置**：[L96](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L96)

### Fingerprint()

**签名**：`func (d *FsDevice) Fingerprint(ctx context.Context) chan *device.FingerprintResponse, error`

**位置**：[L138](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L138)

### Stats()

**签名**：`func (d *FsDevice) Stats(ctx context.Context, interval time.Duration) chan *device.StatsResponse, error`

**位置**：[L291](file:///d:/claude/nomad/plugins/device/cmd/example/device.go#L291)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `google.golang.org/grpc/codes` | 标准库 |
| `google.golang.org/grpc/status` | 标准库 |
| `io/ioutil` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/nomad/plugins/device` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/hclspec` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/kr/pretty` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **gRPC 通信**：使用 gRPC 进行进程间通信
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|

