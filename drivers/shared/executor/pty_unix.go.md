# pty_unix.go 代码说明文档

> 文件路径：[drivers/shared/executor/pty_unix.go](file:///d:/claude/nomad/drivers/shared/executor/pty_unix.go)
> 总行数：47 行
> 所属包：`executor`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0
> Build Tag：`darwin || dragonfly || freebsd || linux || netbsd || openbsd || solaris`

---

## 1. 文件定位与核心职责

该文件属于 **驱动共享工具子包**（`drivers/shared`），提供各任务驱动的共享功能，包括驱动事件处理、重启策略、执行器接口、网络配置、资源隔离和选择器逻辑等。

**平台特定实现**：此文件为 **Unix-like** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `sessionCmdAttr` | - | `tty *os.File` | `*syscall.SysProcAttr` | [L20](file:///d:/claude/nomad/drivers/shared/executor/pty_unix.go#L20) |
| `setTTYSize` | - | `w io.Writer, height int32, width int32` | `error` | [L27](file:///d:/claude/nomad/drivers/shared/executor/pty_unix.go#L27) |
| `isUnixEIOErr` | - | `err error` | `bool` | [L40](file:///d:/claude/nomad/drivers/shared/executor/pty_unix.go#L40) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `io` | 标准库 |
| `os` | 标准库 |
| `strings` | 标准库 |
| `syscall` | 标准库 |
| `github.com/creack/pty` | 第三方库 |
| `golang.org/x/sys/unix` | 第三方库 |

## 7. 设计模式与技术特点

- **IO 操作**：涉及文件或数据流的读写操作
- **平台特定实现**：通过 build tag 机制实现 Unix-like 平台支持
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|

