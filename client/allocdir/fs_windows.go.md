# fs_windows.go 代码说明文档

> 文件路径：[allocdir/fs_windows.go](file:///d:/claude/nomad/client/allocdir/fs_windows.go)
> 总行数：65 行
> 所属包：`allocdir`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配目录管理子包**（`client/allocdir`），管理分配的文件系统目录（共享目录、任务目录、日志目录等），为任务提供隔离的文件系统环境。

**平台特定实现**：此文件为 **Windows** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `SharedAllocContainerPath` | `filepath.Join("c:\\", SharedAllocName)` |
| `TaskLocalContainerPath` | `filepath.Join("c:\\", TaskLocal)` |
| `TaskSecretsContainerPath` | `filepath.Join("c:\\", TaskSecrets)` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `linkOrCopy` | - | `src string, dst string, uid int, gid int, perm os.FileMode` | `error` | [L26](file:///d:/claude/nomad/client/allocdir/fs_windows.go#L26) |
| `linkDir` | - | `src string, dst string, _ bool` | `error` | [L31](file:///d:/claude/nomad/client/allocdir/fs_windows.go#L31) |
| `unlinkDir` | - | `dir string` | `error` | [L36](file:///d:/claude/nomad/client/allocdir/fs_windows.go#L36) |
| `createSecretDir` | - | `dir string, _ int` | `error` | [L41](file:///d:/claude/nomad/client/allocdir/fs_windows.go#L41) |
| `removeSecretDir` | - | `dir string` | `error` | [L46](file:///d:/claude/nomad/client/allocdir/fs_windows.go#L46) |
| `dropDirPermissions` | - | `path string, desired os.FileMode` | `error` | [L51](file:///d:/claude/nomad/client/allocdir/fs_windows.go#L51) |
| `MountSpecialDirs` | - | `taskDir string` | `error` | [L57](file:///d:/claude/nomad/client/allocdir/fs_windows.go#L57) |
| `getOwner` | - | `os.FileInfo` | `int, int` | [L62](file:///d:/claude/nomad/client/allocdir/fs_windows.go#L62) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `os` | 标准库 |
| `path/filepath` | 标准库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **平台特定实现**：通过 build tag 机制实现 Windows 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|

