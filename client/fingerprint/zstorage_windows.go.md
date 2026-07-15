# zstorage_windows.go 代码说明文档

> 文件路径：[fingerprint/zstorage_windows.go](file:///d:/claude/nomad/client/fingerprint/zstorage_windows.go)
> 总行数：56 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。

**平台特定实现**：此文件为 **Windows** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `errnoERROR_IO_PENDING` | `997` |

### 变量

| 名称 | 值 |
|------|----|
| `_` | `` |
| `errERROR_IO_PENDING` | `syscall.Errno(errnoERROR_IO_PENDING)` |
| `errERROR_EINVAL` | `syscall.EINVAL` |
| `modkernel32` | `windows.NewLazySystemDLL("kernel32.dll")` |
| `procGetDiskFreeSpaceExW` | `modkernel32.NewProc("GetDiskFreeSpaceExW")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `errnoErr` | - | `e syscall.Errno` | `error` | [L30](file:///d:/claude/nomad/client/fingerprint/zstorage_windows.go#L30) |
| `getDiskSpaceEx` | - | `dirName *uint16, availableFreeBytes *uint64, totalBytes *uint64, totalFreeBy...` | `err error` | [L49](file:///d:/claude/nomad/client/fingerprint/zstorage_windows.go#L49) |

## 5. 核心方法详解

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

