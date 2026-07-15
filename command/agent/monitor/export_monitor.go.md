# export_monitor.go 代码说明文档

> 文件路径：[monitor/export_monitor.go](file:///d:/claude/nomad/command/agent/monitor/export_monitor.go)
> 总行数：276 行
> 所属包：`monitor`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **监控子包**（`command/agent/monitor`），提供流式日志监控和输出管理功能，支持 `nomad monitor` 和 `nomad alloc logs` 等命令的后端实现。

## 2. 类型定义

### ExportMonitor

**定义位置**：[L26](file:///d:/claude/nomad/command/agent/monitor/export_monitor.go#L26)

**类型**：struct

```go
	sync.Mutex
	logCh chan []byte
	logger hclog.Logger
	doneCh chan struct{...}
	ExportReader *ExportReader
	bufSize int
```

**关联方法**（3 个）：`Stop`, `Start`, `Write`

### MonitorExportOpts

**定义位置**：[L41](file:///d:/claude/nomad/command/agent/monitor/export_monitor.go#L41)

**类型**：struct

```go
	Logger hclog.Logger
	LogsSince string
	OnDisk bool
	ServiceName string
	NomadLogPath string
	Follow bool
	Context context.Context
	BufSize int
```

### ExportReader

**定义位置**：[L69](file:///d:/claude/nomad/command/agent/monitor/export_monitor.go#L69)

**类型**：struct

```go
	io.Reader
	Cmd *exec.Cmd
	UseCli bool
	Follow bool
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `defaultBufSize` | `512` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewExportMonitor` | - | `opts MonitorExportOpts` | `*ExportMonitor, error` | [L78](file:///d:/claude/nomad/command/agent/monitor/export_monitor.go#L78) |
| `ScanServiceName` | - | `input string` | `error` | [L124](file:///d:/claude/nomad/command/agent/monitor/export_monitor.go#L124) |
| `cliReader` | - | `opts MonitorExportOpts` | `*ExportReader, error` | [L168](file:///d:/claude/nomad/command/agent/monitor/export_monitor.go#L168) |
| `fileReader` | - | `opts MonitorExportOpts` | `*ExportReader, error` | [L205](file:///d:/claude/nomad/command/agent/monitor/export_monitor.go#L205) |
| `Stop` | `d *ExportMonitor` | - | - | [L216](file:///d:/claude/nomad/command/agent/monitor/export_monitor.go#L216) |
| `Start` | `d *ExportMonitor` | - | `chan []byte` | [L232](file:///d:/claude/nomad/command/agent/monitor/export_monitor.go#L232) |
| `Write` | `d *ExportMonitor` | `p []byte` | `n int` | [L258](file:///d:/claude/nomad/command/agent/monitor/export_monitor.go#L258) |

## 5. 核心方法详解

### Stop()

**签名**：`func (d *ExportMonitor) Stop() `

**位置**：[L216](file:///d:/claude/nomad/command/agent/monitor/export_monitor.go#L216)

### Start()

**签名**：`func (d *ExportMonitor) Start() chan []byte`

**位置**：[L232](file:///d:/claude/nomad/command/agent/monitor/export_monitor.go#L232)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `regexp` | 标准库 |
| `runtime` | 标准库 |
| `slices` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex` 保护共享状态的并发访问
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [agent.go](file:///d:/claude/nomad/command/agent/agent.go) | Agent 核心实现 |
| [http.go](file:///d:/claude/nomad/command/agent/http.go) | HTTP 服务器实现 |
| [config.go](file:///d:/claude/nomad/command/agent/config.go) | 配置定义 |

