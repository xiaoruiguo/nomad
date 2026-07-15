# windows_service_windows.go 代码说明文档

> 文件路径：[winsvc/windows_service_windows.go](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go)
> 总行数：257 行
> 所属包：`winsvc`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Windows 服务子包**（`helper/winsvc`），实现 Nomad 在 Windows 上的服务管理，包括服务安装、启动、停止、事件日志记录和权限提升，通过 build tag 区分 Windows 和非 Windows 平台。

**平台特定实现**：此文件为 **Windows** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

### windowsServiceManager

**定义位置**：[L44](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L44)

**类型**：struct

```go
	manager *mgr.Mgr
```

**关联方法**（4 个）：`IsServiceRegistered`, `GetService`, `CreateService`, `Close`

### windowsService

**定义位置**：[L92](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L92)

**类型**：struct

```go
	service *mgr.Service
```

**关联方法**（11 个）：`Name`, `Configure`, `Start`, `Stop`, `Close`, `Delete`, `IsRunning`, `IsStopped`, `EnableEventlog`, `DisableEventlog`, `isService`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `EVENTLOG_REGISTRY_PATH` | ``SYSTEM\CurrentControlSet\Services\EventLog\Application`` |
| `EVENTLOG_SUPPORTED_EVENTS_KEY` | `"TypesSupported"` |
| `EVENTLOG_SUPPORTED_EVENTS` | `eventlog.Error \| eventlog.Warning \| eventlog.Info` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewWindowsServiceManager` | - | - | `WindowsServiceManager, error` | [L35](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L35) |
| `IsServiceRegistered` | `m *windowsServiceManager` | `name string` | `bool, error` | [L48](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L48) |
| `GetService` | `m *windowsServiceManager` | `name string` | `WindowsService, error` | [L61](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L61) |
| `CreateService` | `m *windowsServiceManager` | `name string, bin string, config WindowsServiceConfiguration` | `WindowsService, error` | [L70](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L70) |
| `Close` | `m *windowsServiceManager` | - | `error` | [L88](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L88) |
| `Name` | `s *windowsService` | - | `string` | [L96](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L96) |
| `Configure` | `s *windowsService` | `config WindowsServiceConfiguration` | `error` | [L100](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L100) |
| `Start` | `s *windowsService` | - | `error` | [L118](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L118) |
| `Stop` | `s *windowsService` | - | `error` | [L134](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L134) |
| `Close` | `s *windowsService` | - | `error` | [L150](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L150) |
| `Delete` | `s *windowsService` | - | `error` | [L154](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L154) |
| `IsRunning` | `s *windowsService` | - | `bool, error` | [L158](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L158) |
| `IsStopped` | `s *windowsService` | - | `bool, error` | [L162](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L162) |
| `EnableEventlog` | `s *windowsService` | - | `error` | [L166](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L166) |
| `DisableEventlog` | `s *windowsService` | - | `error` | [L198](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L198) |
| `isService` | `s *windowsService` | `state svc.State` | `bool, error` | [L212](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L212) |
| `waitFor` | - | `ctx context.Context, condition func(...)` | `error` | [L221](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L221) |

## 5. 核心方法详解

### NewWindowsServiceManager()

**签名**：`func NewWindowsServiceManager() WindowsServiceManager, error`

**位置**：[L35](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L35)

### Close()

**签名**：`func (m *windowsServiceManager) Close() error`

**位置**：[L88](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L88)

### Start()

**签名**：`func (s *windowsService) Start() error`

**位置**：[L118](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L118)

### Close()

**签名**：`func (s *windowsService) Close() error`

**位置**：[L150](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L150)

### Delete()

**签名**：`func (s *windowsService) Delete() error`

**位置**：[L154](file:///d:/claude/nomad/helper/winsvc/windows_service_windows.go#L154)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io/fs` | 标准库 |
| `os` | 标准库 |
| `os/signal` | 标准库 |
| `reflect` | 标准库 |
| `slices` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `golang.org/x/sys/windows/registry` | 第三方库 |
| `golang.org/x/sys/windows/svc` | 第三方库 |
| `golang.org/x/sys/windows/svc/eventlog` | 第三方库 |
| `golang.org/x/sys/windows/svc/mgr` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **平台特定实现**：通过 build tag 机制实现 Windows 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [windows_service_windows_test.go](file:///d:/claude/nomad/helper/winsvc/windows_service_windows_test.go) | 对应测试文件 |

