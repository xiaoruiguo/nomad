# path_windows.go 代码说明文档

> 文件路径：[winsvc/path_windows.go](file:///d:/claude/nomad/helper/winsvc/path_windows.go)
> 总行数：207 行
> 所属包：`winsvc`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Windows 服务子包**（`helper/winsvc`），实现 Nomad 在 Windows 上的服务管理，包括服务安装、启动、停止、事件日志记录和权限提升，通过 build tag 区分 Windows 和非 Windows 平台。

**平台特定实现**：此文件为 **Windows** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

### windowsPaths

**定义位置**：[L23](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L23)

**类型**：struct

```go
	SystemRoot string
	SystemDrive string
	ProgramData string
	ProgramFiles string
	loadErr error
	o sync.Once
```

**关联方法**（3 个）：`Expand`, `CreateDirectory`, `load`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewWindowsPaths` | - | - | `WindowsPaths` | [L19](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L19) |
| `Expand` | `w *windowsPaths` | `path string` | `string, error` | [L32](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L32) |
| `CreateDirectory` | `w *windowsPaths` | `path string, restrict_on_create bool` | `error` | [L50](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L50) |
| `getUserGroupSIDs` | - | - | `usid *windows.SID, gsid *windows.SID, err error` | [L83](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L83) |
| `setDirectoryPermissions` | - | `path string` | `error` | [L103](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L103) |
| `load` | `w *windowsPaths` | - | `error` | [L163](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L163) |

## 5. 核心方法详解

### NewWindowsPaths()

**签名**：`func NewWindowsPaths() WindowsPaths`

**位置**：[L19](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L19)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `os` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `text/template` | 标准库 |
| `golang.org/x/sys/windows` | 第三方库 |
| `golang.org/x/sys/windows/registry` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **平台特定实现**：通过 build tag 机制实现 Windows 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [path_windows_test.go](file:///d:/claude/nomad/helper/winsvc/path_windows_test.go) | 对应测试文件 |

