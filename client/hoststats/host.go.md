# host.go 代码说明文档

> 文件路径：[client/hoststats/host.go](file:///d:/claude/nomad/client/hoststats/host.go)
> 总行数：337 行
> 所属包：`hoststats`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **主机信息子包**（`client/host`），收集客户端主机的资源信息（CPU、内存、磁盘），用于指纹采集和资源上报。

## 2. 类型定义

### HostStats

**定义位置**：[L21](file:///d:/claude/nomad/client/hoststats/host.go#L21)

**中文说明**：HostStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type HostStats struct {
	Memory *MemoryStats
	CPU []*CPUStats
	DiskStats []*DiskStats
	AllocDirStats *DiskStats
	DeviceStats []*DeviceGroupStats
	Uptime uint64
	Timestamp int64
	CPUTicksConsumed float64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Memory` | `*MemoryStats` | — |
| `CPU` | `[]*CPUStats` | 列表 |
| `DiskStats` | `[]*DiskStats` | 列表 |
| `AllocDirStats` | `*DiskStats` | — |
| `DeviceStats` | `[]*DeviceGroupStats` | 列表 |
| `Uptime` | `uint64` | 无符号 64 位整数 |
| `Timestamp` | `int64` | 时间戳 |
| `CPUTicksConsumed` | `float64` | — |

### MemoryStats

**定义位置**：[L33](file:///d:/claude/nomad/client/hoststats/host.go#L33)

**中文说明**：MemoryStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type MemoryStats struct {
	Total uint64
	Available uint64
	Used uint64
	Free uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Total` | `uint64` | 无符号 64 位整数 |
| `Available` | `uint64` | 无符号 64 位整数 |
| `Used` | `uint64` | 无符号 64 位整数 |
| `Free` | `uint64` | 无符号 64 位整数 |

### CPUStats

**定义位置**：[L41](file:///d:/claude/nomad/client/hoststats/host.go#L41)

**中文说明**：CPUStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type CPUStats struct {
	CPU string
	User float64
	System float64
	Idle float64
	TotalPercent float64
	TotalTicks float64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CPU` | `string` | 字符串 |
| `User` | `float64` | — |
| `System` | `float64` | — |
| `Idle` | `float64` | — |
| `TotalPercent` | `float64` | — |
| `TotalTicks` | `float64` | — |

### DiskStats

**定义位置**：[L51](file:///d:/claude/nomad/client/hoststats/host.go#L51)

**中文说明**：DiskStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type DiskStats struct {
	Device string
	Mountpoint string
	Size uint64
	Used uint64
	Available uint64
	UsedPercent float64
	InodesUsedPercent float64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Device` | `string` | 字符串 |
| `Mountpoint` | `string` | 字符串 |
| `Size` | `uint64` | 大小 |
| `Used` | `uint64` | 无符号 64 位整数 |
| `Available` | `uint64` | 无符号 64 位整数 |
| `UsedPercent` | `float64` | — |
| `InodesUsedPercent` | `float64` | — |

### DeviceGroupStats

**定义位置**：[L62](file:///d:/claude/nomad/client/hoststats/host.go#L62)

**中文说明**：DeviceGroupStats 是一个统计结构体，记录相关指标的运行时数据。

**类型定义**：`type DeviceGroupStats device.DeviceGroupStats`

### DeviceStatsCollector

**定义位置**：[L65](file:///d:/claude/nomad/client/hoststats/host.go#L65)

**中文说明**：DeviceStatsCollector 与设备（Device）相关，管理硬件资源如 GPU/FPGA。

**类型定义**：`type DeviceStatsCollector func(...)`

### NodeStatsCollector

**定义位置**：[L69](file:///d:/claude/nomad/client/hoststats/host.go#L69)

**中文说明**：NodeStatsCollector 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：interface

```go
type NodeStatsCollector interface {
	Collect func(...)
	Stats func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Collect` | `func(...)` | — |
| `Stats` | `func(...)` | 返回对象的统计信息。 |

### HostStatsCollector

**定义位置**：[L75](file:///d:/claude/nomad/client/hoststats/host.go#L75)

**中文说明**：HostStatsCollector 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type HostStatsCollector struct {
	top *numalib.Topology
	statsCalculator map[string]*HostCpuStatsCalculator
	hostStats *HostStats
	hostStatsLock sync.RWMutex
	allocDir string
	deviceStatsCollector DeviceStatsCollector
	badParts map[string]struct{...}
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `top` | `*numalib.Topology` | — |
| `statsCalculator` | `map[string]*HostCpuStatsCalculator` | 映射表 |
| `hostStats` | `*HostStats` | — |
| `hostStatsLock` | `sync.RWMutex` | 互斥锁，保护并发访问 |
| `allocDir` | `string` | 字符串 |
| `deviceStatsCollector` | `DeviceStatsCollector` | — |
| `badParts` | `map[string]struct{...}` | 映射表 |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（8 个）：`Collect`, `collectLocked`, `collectMemoryStats`, `collectDiskStats`, `collectDeviceGroupStats`, `Stats`, `toDiskStats`, `collectCPUStats`

### HostCpuStatsCalculator

**定义位置**：[L258](file:///d:/claude/nomad/client/hoststats/host.go#L258)

**中文说明**：HostCpuStatsCalculator 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type HostCpuStatsCalculator struct {
	prevIdle float64
	prevUser float64
	prevSystem float64
	prevBusy float64
	prevTotal float64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `prevIdle` | `float64` | — |
| `prevUser` | `float64` | — |
| `prevSystem` | `float64` | — |
| `prevBusy` | `float64` | — |
| `prevTotal` | `float64` | — |

**关联方法**（1 个）：`Calculate`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewHostStatsCollector` | - | `logger hclog.Logger, top *numalib.Topology, allocDir string, deviceStatsColle...` | `*HostStatsCollector` | [L93](file:///d:/claude/nomad/client/hoststats/host.go#L93) |
| `Collect` | `h *HostStatsCollector` | `` | `error` | [L105](file:///d:/claude/nomad/client/hoststats/host.go#L105) |
| `collectLocked` | `h *HostStatsCollector` | `` | `error` | [L113](file:///d:/claude/nomad/client/hoststats/host.go#L113) |
| `collectMemoryStats` | `h *HostStatsCollector` | `` | `*MemoryStats, error` | [L168](file:///d:/claude/nomad/client/hoststats/host.go#L168) |
| `collectDiskStats` | `h *HostStatsCollector` | `` | `[]*DiskStats, error` | [L183](file:///d:/claude/nomad/client/hoststats/host.go#L183) |
| `collectDeviceGroupStats` | `h *HostStatsCollector` | `` | `[]*DeviceGroupStats` | [L211](file:///d:/claude/nomad/client/hoststats/host.go#L211) |
| `Stats` | `h *HostStatsCollector` | `` | `*HostStats` | [L220](file:///d:/claude/nomad/client/hoststats/host.go#L220) |
| `toDiskStats` | `h *HostStatsCollector` | `usage *disk.UsageStat, partitionStat *disk.PartitionStat` | `*DiskStats` | [L234](file:///d:/claude/nomad/client/hoststats/host.go#L234) |
| `NewHostCpuStatsCalculator` | - | `` | `*HostCpuStatsCalculator` | [L267](file:///d:/claude/nomad/client/hoststats/host.go#L267) |
| `Calculate` | `h *HostCpuStatsCalculator` | `times cpu.TimesStat` | `idle float64, user float64, system float64, total float64` | [L272](file:///d:/claude/nomad/client/hoststats/host.go#L272) |
| `collectCPUStats` | `h *HostStatsCollector` | `` | `cpus []*CPUStats, totalTicks float64, err error` | [L308](file:///d:/claude/nomad/client/hoststats/host.go#L308) |

## 5. 核心方法详解

### NewHostStatsCollector()

**签名**：`func NewHostStatsCollector(logger hclog.Logger, top *numalib.Topology, allocDir string, deviceStatsCollector DeviceStatsCollector) *HostStatsCollector`

**位置**：[L93](file:///d:/claude/nomad/client/hoststats/host.go#L93)

**中文说明**：创建并返回一个新的 HostStatsCollector 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `top` | `*numalib.Topology` | — |
| `allocDir` | `string` | 字符串 |
| `deviceStatsCollector` | `DeviceStatsCollector` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*HostStatsCollector` | — |

### Stats()

**签名**：`func (h *HostStatsCollector) Stats() *HostStats`

**位置**：[L220](file:///d:/claude/nomad/client/hoststats/host.go#L220)

**中文说明**：返回对象的统计信息。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*HostStats` | — |

### NewHostCpuStatsCalculator()

**签名**：`func NewHostCpuStatsCalculator() *HostCpuStatsCalculator`

**位置**：[L267](file:///d:/claude/nomad/client/hoststats/host.go#L267)

**中文说明**：创建并返回一个新的 HostCpuStatsCalculator 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*HostCpuStatsCalculator` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `math` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/numalib` | 内部包 |
| `github.com/hashicorp/nomad/plugins/device` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/shirou/gopsutil/v3/cpu` | 第三方库 |
| `github.com/shirou/gopsutil/v3/disk` | 第三方库 |
| `github.com/shirou/gopsutil/v3/host` | 第三方库 |
| `github.com/shirou/gopsutil/v3/mem` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [host_test.go](file:///d:/claude/nomad/client/hoststats/host_test.go) | 对应测试文件 |

