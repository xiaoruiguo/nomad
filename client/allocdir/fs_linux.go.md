# fs_linux.go 代码说明文档

> 文件路径：[client/allocdir/fs_linux.go](file:///d:/claude/nomad/client/allocdir/fs_linux.go)
> 总行数：116 行
> 所属包：`allocdir`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`linux`

---

## 1. 文件定位与核心职责

该文件属于 **分配目录子包**（`client/allocdir`），管理分配的文件系统目录结构，包括任务数据、日志和 secrets 目录的创建和清理。

**平台特定实现**：此文件为 **Linux** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `secretMarker` | `—` | `".nomad-mount"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `linkDir` | - | `src string, dst string, ro bool` | `error` | [L25](file:///d:/claude/nomad/client/allocdir/fs_linux.go#L25) |
| `mountDir` | - | `old string, next string, uid int, gid int, mode os.FileMode` | `error` | [L37](file:///d:/claude/nomad/client/allocdir/fs_linux.go#L37) |
| `unlinkDir` | - | `dir string` | `error` | [L54](file:///d:/claude/nomad/client/allocdir/fs_linux.go#L54) |
| `createSecretDir` | - | `dir string, size int` | `error` | [L65](file:///d:/claude/nomad/client/allocdir/fs_linux.go#L65) |
| `removeSecretDir` | - | `dir string` | `error` | [L104](file:///d:/claude/nomad/client/allocdir/fs_linux.go#L104) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `syscall` | 标准库 |
| `golang.org/x/sys/unix` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **平台特定实现**：通过 build tag 机制实现 Linux 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [fs_linux_test.go](file:///d:/claude/nomad/client/allocdir/fs_linux_test.go) | 对应测试文件 |
| [alloc_dir.go](file:///d:/claude/nomad/client/allocdir/alloc_dir.go) | 同目录源文件 |
| [fs_darwin.go](file:///d:/claude/nomad/client/allocdir/fs_darwin.go) | 同目录源文件 |
| [fs_default.go](file:///d:/claude/nomad/client/allocdir/fs_default.go) | 同目录源文件 |
| [fs_freebsd.go](file:///d:/claude/nomad/client/allocdir/fs_freebsd.go) | 同目录源文件 |
| [fs_netbsd.go](file:///d:/claude/nomad/client/allocdir/fs_netbsd.go) | 同目录源文件 |

