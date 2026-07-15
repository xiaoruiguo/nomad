# fs_unix.go 代码说明文档

> 文件路径：[allocdir/fs_unix.go](file:///d:/claude/nomad/client/allocdir/fs_unix.go)
> 总行数：112 行
> 所属包：`allocdir`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`unix`

---

## 1. 文件定位与核心职责

该文件属于 **分配目录管理子包**（`client/allocdir`），管理分配的文件系统目录（共享目录、任务目录、日志目录等），为任务提供隔离的文件系统环境。

**平台特定实现**：此文件为 **Unix-like** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `SharedAllocContainerPath` | `filepath.Join("/", SharedAllocName)` |
| `TaskLocalContainerPath` | `filepath.Join("/", TaskLocal)` |
| `TaskSecretsContainerPath` | `filepath.Join("/", TaskSecrets)` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `dropDirPermissions` | - | `path string, desired os.FileMode` | `error` | [L36](file:///d:/claude/nomad/client/allocdir/fs_unix.go#L36) |
| `getUid` | - | `u *user.User` | `int, error` | [L69](file:///d:/claude/nomad/client/allocdir/fs_unix.go#L69) |
| `getGid` | - | `u *user.User` | `int, error` | [L79](file:///d:/claude/nomad/client/allocdir/fs_unix.go#L79) |
| `linkOrCopy` | - | `src string, dst string, uid int, gid int, perm os.FileMode` | `error` | [L90](file:///d:/claude/nomad/client/allocdir/fs_unix.go#L90) |
| `getOwner` | - | `fi os.FileInfo` | `int, int` | [L105](file:///d:/claude/nomad/client/allocdir/fs_unix.go#L105) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `os` | 标准库 |
| `os/user` | 标准库 |
| `path/filepath` | 标准库 |
| `strconv` | 标准库 |
| `syscall` | 标准库 |
| `github.com/hashicorp/nomad/helper/users` | 内部包 |
| `golang.org/x/sys/unix` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **平台特定实现**：通过 build tag 机制实现 Unix-like 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|

