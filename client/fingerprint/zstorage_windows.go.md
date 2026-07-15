# zstorage_windows.go 代码说明文档

> 文件路径：[client/fingerprint/zstorage_windows.go](file:///d:/claude/nomad/client/fingerprint/zstorage_windows.go)
> 总行数：56 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），采集客户端节点的硬件和软件信息（CPU、内存、OS、网络），用于节点注册和资源上报。

**平台特定实现**：此文件为 **Windows** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `errnoERROR_IO_PENDING` | `—` | `997` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `_` | `unsafe.Pointer` | `` | — |
| `errERROR_IO_PENDING` | `error` | `syscall.Errno(errnoERROR_IO_PENDING)` | — |
| `errERROR_EINVAL` | `error` | `syscall.EINVAL` | — |
| `modkernel32` | `—` | `windows.NewLazySystemDLL("kernel32.dll")` | — |
| `procGetDiskFreeSpaceExW` | `—` | `modkernel32.NewProc("GetDiskFreeSpaceExW")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `errnoErr` | - | `e syscall.Errno` | `error` | [L30](file:///d:/claude/nomad/client/fingerprint/zstorage_windows.go#L30) |
| `getDiskSpaceEx` | - | `dirName *uint16, availableFreeBytes *uint64, totalBytes *uint64, totalFreeByt...` | `err error` | [L49](file:///d:/claude/nomad/client/fingerprint/zstorage_windows.go#L49) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `syscall` | 标准库 |
| `unsafe` | 标准库 |
| `golang.org/x/sys/windows` | 第三方库 |

## 7. 设计模式与技术特点

- **平台特定实现**：通过 build tag 机制实现 Windows 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [arch.go](file:///d:/claude/nomad/client/fingerprint/arch.go) | 同目录源文件 |
| [bridge.go](file:///d:/claude/nomad/client/fingerprint/bridge.go) | 同目录源文件 |
| [bridge_default.go](file:///d:/claude/nomad/client/fingerprint/bridge_default.go) | 同目录源文件 |
| [bridge_linux.go](file:///d:/claude/nomad/client/fingerprint/bridge_linux.go) | 同目录源文件 |
| [cgroup.go](file:///d:/claude/nomad/client/fingerprint/cgroup.go) | 同目录源文件 |

