# detect_darwin.go 代码说明文档

> 文件路径：[client/lib/numalib/detect_darwin.go](file:///d:/claude/nomad/client/lib/numalib/detect_darwin.go)
> 总行数：77 行
> 所属包：`numalib`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`darwin`

---

## 1. 文件定位与核心职责

该文件属于 **客户端库子包**（`client/lib`），提供客户端使用的通用库函数和数据结构。

**平台特定实现**：此文件为 **macOS** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

### MacOS

**定义位置**：[L29](file:///d:/claude/nomad/client/lib/numalib/detect_darwin.go#L29)

**中文说明**：MacOS 是一个结构体，封装相关数据和状态。

**类型**：struct

**关联方法**（3 个）：`ScanSystem`, `scanAppleSilicon`, `scanLegacyX86`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `nodeID` | `—` | `hw.NodeID(0)` | — |
| `socketID` | `—` | `hw.SocketID(0)` | — |
| `maxSpeed` | `—` | `hw.KHz(0)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `PlatformScanners` | - | `_ bool` | `[]SystemScanner` | [L16](file:///d:/claude/nomad/client/lib/numalib/detect_darwin.go#L16) |
| `ScanSystem` | `m *MacOS` | `top *Topology` | `` | [L31](file:///d:/claude/nomad/client/lib/numalib/detect_darwin.go#L31) |
| `scanAppleSilicon` | `m *MacOS` | `top *Topology` | `` | [L45](file:///d:/claude/nomad/client/lib/numalib/detect_darwin.go#L45) |
| `scanLegacyX86` | `m *MacOS` | `top *Topology` | `` | [L66](file:///d:/claude/nomad/client/lib/numalib/detect_darwin.go#L66) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/client/lib/idset` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib/hw` | 内部包 |
| `github.com/shoenig/go-m1cpu` | 第三方库 |
| `golang.org/x/sys/unix` | 第三方库 |

## 7. 设计模式与技术特点

- **平台特定实现**：通过 build tag 机制实现 macOS 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [detect.go](file:///d:/claude/nomad/client/lib/numalib/detect.go) | 同目录源文件 |
| [detect_default.go](file:///d:/claude/nomad/client/lib/numalib/detect_default.go) | 同目录源文件 |
| [detect_generic.go](file:///d:/claude/nomad/client/lib/numalib/detect_generic.go) | 同目录源文件 |
| [detect_linux.go](file:///d:/claude/nomad/client/lib/numalib/detect_linux.go) | 同目录源文件 |
| [detect_noimpl.go](file:///d:/claude/nomad/client/lib/numalib/detect_noimpl.go) | 同目录源文件 |

