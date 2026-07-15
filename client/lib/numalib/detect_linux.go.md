# detect_linux.go 代码说明文档

> 文件路径：[lib/numalib/detect_linux.go](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go)
> 总行数：308 行
> 所属包：`numalib`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`linux`

---

## 1. 文件定位与核心职责

该文件属于 **NUMA 库子包**（`client/lib/numalib`），处理 NUMA（非统一内存访问）拓扑和 CPU 绑定。

**平台特定实现**：此文件为 **Linux** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

### pathReaderFn

**定义位置**：[L51](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L51)

**类型定义**：`func(...)`

### Sysfs

**定义位置**：[L57](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L57)

**类型**：struct

**关联方法**（6 个）：`ScanSystem`, `available`, `discoverPCI`, `discoverOnline`, `discoverCosts`, `discoverCores`

### Cgroups1

**定义位置**：[L226](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L226)

**类型**：struct

**关联方法**（1 个）：`ScanSystem`

### Cgroups2

**定义位置**：[L244](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L244)

**类型**：struct

**关联方法**（1 个）：`ScanSystem`

### Fallback

**定义位置**：[L274](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L274)

**类型**：struct

**关联方法**（1 个）：`ScanSystem`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `sysRoot` | `"/sys/devices/system"` |
| `nodeOnline` | `sysRoot + "/node/online"` |
| `cpuOnline` | `sysRoot + "/cpu/online"` |
| `distanceFile` | `sysRoot + "/node/node%d/distance"` |
| `cpulistFile` | `sysRoot + "/node/node%d/cpulist"` |
| `cpuDriverFile` | `sysRoot + "/cpu/cpu%d/cpufreq/scaling_driver"` |
| `cpuMaxFile` | `sysRoot + "/cpu/cpu%d/cpufreq/cpuinfo_max_freq"` |
| `cpuCpccNominalFile` | `sysRoot + "/cpu/cpu%d/acpi_cppc/nominal_freq"` |
| `cpuIntelBaseFile` | `sysRoot + "/cpu/cpu%d/cpufreq/base_frequency"` |
| `cpuSocketFile` | `sysRoot + "/cpu/cpu%d/topology/physical_package_id"` |
| `cpuSiblingFile` | `sysRoot + "/cpu/cpu%d/topology/thread_siblings_list"` |
| `deviceFiles` | `"/sys/bus/pci/devices"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `PlatformScanners` | - | `cpuDisableDmidecode bool` | `[]SystemScanner` | [L22](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L22) |
| `ScanSystem` | `s *Sysfs` | `top *Topology` | - | [L59](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L59) |
| `available` | ` *Sysfs` | - | `bool` | [L73](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L73) |
| `discoverPCI` | ` *Sysfs` | `st *Topology, readerFunc pathReaderFn` | - | [L77](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L77) |
| `discoverOnline` | ` *Sysfs` | `st *Topology, readerFunc pathReaderFn` | - | [L91](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L91) |
| `discoverCosts` | ` *Sysfs` | `st *Topology, readerFunc pathReaderFn` | - | [L99](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L99) |
| `discoverCores` | ` *Sysfs` | `st *Topology, readerFunc pathReaderFn` | - | [L123](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L123) |
| `discoverCoreSpeeds` | - | `core hw.CoreID, readerFunc pathReaderFn` | `hw.KHz, hw.KHz` | [L172](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L172) |
| `getIDSet` | - | `path string, readerFunc pathReaderFn, args ...any` | `*idset.Set[T], error` | [L194](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L194) |
| `getNumeric` | - | `path string, bitSize int, readerFunc pathReaderFn, args ...any` | `T, error` | [L203](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L203) |
| `getString` | - | `path string, readerFunc pathReaderFn, args ...any` | `string, error` | [L216](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L216) |
| `ScanSystem` | `s *Cgroups1` | `top *Topology` | - | [L228](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L228) |
| `ScanSystem` | `s *Cgroups2` | `top *Topology` | - | [L246](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L246) |
| `scanIDs` | - | `top *Topology, content string` | - | [L262](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L262) |
| `ScanSystem` | `s *Fallback` | `top *Topology` | - | [L276](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go#L276) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `io/fs` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cgroupslib` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/idset` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib/hw` | 内部包 |

## 7. 设计模式与技术特点

- **平台特定实现**：通过 build tag 机制实现 Linux 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [detect_linux_test.go](file:///d:/claude/nomad/client/lib/numalib/detect_linux_test.go) | 对应测试文件 |

