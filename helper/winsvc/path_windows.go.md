# path_windows.go 代码说明文档

> 文件路径：[helper/winsvc/path_windows.go](file:///d:/claude/nomad/helper/winsvc/path_windows.go)
> 总行数：207 行
> 所属包：`winsvc`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **工具包子包**（`helper/winsvc`），提供 Nomad 使用的通用工具函数和数据结构。

**平台特定实现**：此文件为 **Windows** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

### windowsPaths

**定义位置**：[L23](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L23)

**中文说明**：windowsPaths 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type windowsPaths struct {
	SystemRoot string
	SystemDrive string
	ProgramData string
	ProgramFiles string
	loadErr error
	o sync.Once
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SystemRoot` | `string` | 字符串 |
| `SystemDrive` | `string` | 字符串 |
| `ProgramData` | `string` | 字符串 |
| `ProgramFiles` | `string` | 字符串 |
| `loadErr` | `error` | 错误信息 |
| `o` | `sync.Once` | — |

**关联方法**（3 个）：`Expand`, `CreateDirectory`, `load`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewWindowsPaths` | - | `` | `WindowsPaths` | [L19](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L19) |
| `Expand` | `w *windowsPaths` | `path string` | `string, error` | [L32](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L32) |
| `CreateDirectory` | `w *windowsPaths` | `path string, restrict_on_create bool` | `error` | [L50](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L50) |
| `getUserGroupSIDs` | - | `` | `usid *windows.SID, gsid *windows.SID, err error` | [L83](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L83) |
| `setDirectoryPermissions` | - | `path string` | `error` | [L103](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L103) |
| `load` | `w *windowsPaths` | `` | `error` | [L163](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L163) |

## 5. 核心方法详解

### NewWindowsPaths()

**签名**：`func NewWindowsPaths() WindowsPaths`

**位置**：[L19](file:///d:/claude/nomad/helper/winsvc/path_windows.go#L19)

**中文说明**：创建并返回一个新的 WindowsPaths 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `WindowsPaths` | — |

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
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [path_windows_test.go](file:///d:/claude/nomad/helper/winsvc/path_windows_test.go) | 对应测试文件 |
| [event.go](file:///d:/claude/nomad/helper/winsvc/event.go) | 同目录源文件 |
| [event_logger.go](file:///d:/claude/nomad/helper/winsvc/event_logger.go) | 同目录源文件 |
| [event_logger_nonwindows.go](file:///d:/claude/nomad/helper/winsvc/event_logger_nonwindows.go) | 同目录源文件 |
| [event_logger_windows.go](file:///d:/claude/nomad/helper/winsvc/event_logger_windows.go) | 同目录源文件 |
| [events_nonwindows.go](file:///d:/claude/nomad/helper/winsvc/events_nonwindows.go) | 同目录源文件 |

