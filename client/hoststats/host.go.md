# host.go 代码说明文档

> 文件路径：[hoststats/host.go](file:///d:/claude/nomad/client/hoststats/host.go)
> 总行数：337 行
> 所属包：`hoststats`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **主机统计子包**（`client/hoststats`），收集和报告主机级别的资源使用统计（CPU、内存、磁盘、网络）。

## 2. 类型定义

### HostStats

**定义位置**：[L21](file:///d:/claude/nomad/client/hoststats/host.go#L21)

**类型**：struct

```go
	Memory *MemoryStats
	CPU []*CPUStats
	DiskStats []*DiskStats
	AllocDirStats *DiskStats
	DeviceStats []*DeviceGroupStats
	Uptime uint64
	Timestamp int64
	CPUTicksConsumed float64
```

### MemoryStats

**定义位置**：[L33](file:///d:/claude/nomad/client/hoststats/host.go#L33)

**类型**：struct

```go
	Total uint64
	Available uint64
	Used uint64
	Free uint64
```

### CPUStats

**定义位置**：[L41](file:///d:/claude/nomad/client/hoststats/host.go#L41)

**类型**：struct

```go
	CPU string
	User float64
	System float64
	Idle float64
	TotalPercent float64
	TotalTicks float64
```

### DiskStats

**定义位置**：[L51](file:///d:/claude/nomad/client/hoststats/host.go#L51)

**类型**：struct

```go
	Device string
	Mountpoint string
	Size uint64
	Used uint64
	Available uint64
	UsedPercent float64
	InodesUsedPercent float64
```

### DeviceGroupStats

**定义位置**：[L62](file:///d:/claude/nomad/client/hoststats/host.go#L62)

**类型定义**：`device.DeviceGroupStats`

### DeviceStatsCollector

**定义位置**：[L65](file:///d:/claude/nomad/client/hoststats/host.go#L65)

**类型定义**：`func(...)`

### NodeStatsCollector

**定义位置**：[L69](file:///d:/claude/nomad/client/hoststats/host.go#L69)

**类型**：interface

```go
	Collect
	Stats
```

### HostStatsCollector

**定义位置**：[L75](file:///d:/claude/nomad/client/hoststats/host.go#L75)

**类型**：struct

```go
	top *numalib.Topology
	statsCalculator map[string]*HostCpuStatsCalculator
	hostStats *HostStats
	hostStatsLock sync.RWMutex
	allocDir string
	deviceStatsCollector DeviceStatsCollector
	badParts map[string]struct{...}
	logger hclog.Logger
```

**关联方法**（8 个）：`Collect`, `collectLocked`, `collectMemoryStats`, `collectDiskStats`, `collectDeviceGroupStats`, `Stats`, `toDiskStats`, `collectCPUStats`

### HostCpuStatsCalculator

**定义位置**：[L258](file:///d:/claude/nomad/client/hoststats/host.go#L258)

**类型**：struct

```go
	prevIdle float64
	prevUser float64
	prevSystem float64
	prevBusy float64
	prevTotal float64
```

**关联方法**（1 个）：`Calculate`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewHostStatsCollector` | - | `logger hclog.Logger, top *numalib.Topology, allocDir string, deviceStatsColl...` | `*HostStatsCollector` | [L93](file:///d:/claude/nomad/client/hoststats/host.go#L93) |
| `Collect` | `h *HostStatsCollector` | - | `error` | [L105](file:///d:/claude/nomad/client/hoststats/host.go#L105) |
| `collectLocked` | `h *HostStatsCollector` | - | `error` | [L113](file:///d:/claude/nomad/client/hoststats/host.go#L113) |
| `collectMemoryStats` | `h *HostStatsCollector` | - | `*MemoryStats, error` | [L168](file:///d:/claude/nomad/client/hoststats/host.go#L168) |
| `collectDiskStats` | `h *HostStatsCollector` | - | `[]*DiskStats, error` | [L183](file:///d:/claude/nomad/client/hoststats/host.go#L183) |
| `collectDeviceGroupStats` | `h *HostStatsCollector` | - | `[]*DeviceGroupStats` | [L211](file:///d:/claude/nomad/client/hoststats/host.go#L211) |
| `Stats` | `h *HostStatsCollector` | - | `*HostStats` | [L220](file:///d:/claude/nomad/client/hoststats/host.go#L220) |
| `toDiskStats` | `h *HostStatsCollector` | `usage *disk.UsageStat, partitionStat *disk.PartitionStat` | `*DiskStats` | [L234](file:///d:/claude/nomad/client/hoststats/host.go#L234) |
| `NewHostCpuStatsCalculator` | - | - | `*HostCpuStatsCalculator` | [L267](file:///d:/claude/nomad/client/hoststats/host.go#L267) |
| `Calculate` | `h *HostCpuStatsCalculator` | `times cpu.TimesStat` | `idle float64, user float64, system float64, total float64` | [L272](file:///d:/claude/nomad/client/hoststats/host.go#L272) |
| `collectCPUStats` | `h *HostStatsCollector` | - | `cpus []*CPUStats, totalTicks float64, err error` | [L308](file:///d:/claude/nomad/client/hoststats/host.go#L308) |

## 5. 核心方法详解

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
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [host_test.go](file:///d:/claude/nomad/client/hoststats/host_test.go) | 对应测试文件 |

