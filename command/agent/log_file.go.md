# log_file.go 代码说明文档

> 文件路径：[log_file.go](file:///d:/claude/nomad/command/agent/log_file.go)
> 总行数：157 行
> 所属包：`agent`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **日志文件轮转**，支持按时间和大小轮转日志文件。

## 2. 类型定义

### logFile

**定义位置**：[L22](file:///d:/claude/nomad/command/agent/log_file.go#L22)

**类型**：struct

```go
	fileName string
	logPath string
	duration time.Duration
	LastCreated time.Time
	FileInfo *os.File
	MaxBytes int
	BytesWritten int64
	MaxFiles int
	acquire sync.Mutex
```

**关联方法**（5 个）：`fileNamePattern`, `openNew`, `rotate`, `pruneFiles`, `Write`

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `now` | `time.Now` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `fileNamePattern` | `l *logFile` | - | `string` | [L52](file:///d:/claude/nomad/command/agent/log_file.go#L52) |
| `openNew` | `l *logFile` | - | `error` | [L63](file:///d:/claude/nomad/command/agent/log_file.go#L63) |
| `rotate` | `l *logFile` | - | `error` | [L84](file:///d:/claude/nomad/command/agent/log_file.go#L84) |
| `pruneFiles` | `l *logFile` | - | `error` | [L108](file:///d:/claude/nomad/command/agent/log_file.go#L108) |
| `Write` | `l *logFile` | `b []byte` | `int, error` | [L138](file:///d:/claude/nomad/command/agent/log_file.go#L138) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex` 保护共享状态的并发访问
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [log_file_test.go](file:///d:/claude/nomad/command/agent/log_file_test.go) | 对应测试文件 |
| [agent.go](file:///d:/claude/nomad/command/agent/agent.go) | Agent 核心实现 |
| [http.go](file:///d:/claude/nomad/command/agent/http.go) | HTTP 服务器实现 |
| [config.go](file:///d:/claude/nomad/command/agent/config.go) | 配置定义 |

