# units.go 代码说明文档

> 文件路径：[plugins/shared/structs/units.go](file:///d:/claude/nomad/plugins/shared/structs/units.go)
> 总行数：264 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **插件共享工具子包**（`plugins/shared`），提供插件系统各组件共享的工具，包括 HCL 规格序列化、gRPC 流式日志转发和 proto 工具函数。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `UnitKiB` | `—` | `"KiB"` | — |
| `UnitMiB` | `—` | `"MiB"` | — |
| `UnitGiB` | `—` | `"GiB"` | — |
| `UnitTiB` | `—` | `"TiB"` | — |
| `UnitPiB` | `—` | `"PiB"` | — |
| `UnitEiB` | `—` | `"EiB"` | — |
| `UnitkB` | `—` | `"kB"` | — |
| `UnitKB` | `—` | `"KB"` | — |
| `UnitMB` | `—` | `"MB"` | — |
| `UnitGB` | `—` | `"GB"` | — |
| `UnitTB` | `—` | `"TB"` | — |
| `UnitPB` | `—` | `"PB"` | — |
| `UnitEB` | `—` | `"EB"` | — |
| `UnitKiBPerS` | `—` | `"KiB/s"` | — |
| `UnitMiBPerS` | `—` | `"MiB/s"` | — |
| `UnitGiBPerS` | `—` | `"GiB/s"` | — |
| `UnitTiBPerS` | `—` | `"TiB/s"` | — |
| `UnitPiBPerS` | `—` | `"PiB/s"` | — |
| `UnitEiBPerS` | `—` | `"EiB/s"` | — |
| `UnitkBPerS` | `—` | `"kB/s"` | — |
| `UnitKBPerS` | `—` | `"KB/s"` | — |
| `UnitMBPerS` | `—` | `"MB/s"` | — |
| `UnitGBPerS` | `—` | `"GB/s"` | — |
| `UnitTBPerS` | `—` | `"TB/s"` | — |
| `UnitPBPerS` | `—` | `"PB/s"` | — |
| `UnitEBPerS` | `—` | `"EB/s"` | — |
| `UnitMHz` | `—` | `"MHz"` | — |
| `UnitGHz` | `—` | `"GHz"` | — |
| `UnitmW` | `—` | `"mW"` | — |
| `UnitW` | `—` | `"W"` | — |
| `UnitkW` | `—` | `"kW"` | — |
| `UnitMW` | `—` | `"MW"` | — |
| `UnitGW` | `—` | `"GW"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `numUnits` | `—` | `len(binarySIBytes) + len(decimalSIBytes) + len(binarySIBy...` | — |
| `UnitIndex` | `—` | `make(map[string]*Unit, numUnits)` | — |
| `lengthSortedUnits` | `—` | `make([]string, 0, numUnits)` | — |
| `binarySIBytes` | `—` | `[]*Unit{...}` | — |
| `decimalSIBytes` | `—` | `[]*Unit{...}` | — |
| `binarySIByteRates` | `—` | `[]*Unit{...}` | — |
| `decimalSIByteRates` | `—` | `[]*Unit{...}` | — |
| `hertz` | `—` | `[]*Unit{...}` | — |
| `watts` | `—` | `[]*Unit{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `init` | - | `` | `` | [L251](file:///d:/claude/nomad/plugins/shared/structs/units.go#L251) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `sort` | 标准库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [attribute.go](file:///d:/claude/nomad/plugins/shared/structs/attribute.go) | 同目录源文件 |
| [plugin_reattach_config.go](file:///d:/claude/nomad/plugins/shared/structs/plugin_reattach_config.go) | 同目录源文件 |
| [stats.go](file:///d:/claude/nomad/plugins/shared/structs/stats.go) | 同目录源文件 |
| [util.go](file:///d:/claude/nomad/plugins/shared/structs/util.go) | 同目录源文件 |

