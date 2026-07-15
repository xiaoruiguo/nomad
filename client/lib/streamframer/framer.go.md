# framer.go 代码说明文档

> 文件路径：[lib/streamframer/framer.go](file:///d:/claude/nomad/client/lib/streamframer/framer.go)
> 总行数：332 行
> 所属包：`framer`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **流帧子包**（`client/lib/streamframer`），实现日志流的帧编码/解码。

## 2. 类型定义

### StreamFrame

**定义位置**：[L20](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L20)

**类型**：struct

```go
	Offset int64 `json:",omitempty"`
	Data []byte `json:",omitempty"`
	File string `json:",omitempty"`
	FileEvent string `json:",omitempty"`
```

**关联方法**（4 个）：`IsHeartbeat`, `Clear`, `IsCleared`, `Copy`

### StreamFramer

**定义位置**：[L70](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L70)

**类型**：struct

```go
	out chan *StreamFrame
	frameSize int
	heartbeat *time.Ticker
	flusher *time.Ticker
	shutdown bool
	shutdownCh chan struct{...}
	exitCh chan struct{...}
	l sync.Mutex
	f *StreamFrame
	data *bytes.Buffer
	running bool
	flushed bool
```

**关联方法**（9 个）：`Destroy`, `Run`, `ExitCh`, `run`, `send`, `readData`, `Send`, `IsFlushed`, `Flush`

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `HeartbeatStreamFrame` | `&StreamFrame{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `IsHeartbeat` | `s *StreamFrame` | - | `bool` | [L36](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L36) |
| `Clear` | `s *StreamFrame` | - | - | [L40](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L40) |
| `IsCleared` | `s *StreamFrame` | - | `bool` | [L47](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L47) |
| `Copy` | `s *StreamFrame` | - | `*StreamFrame` | [L61](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L61) |
| `NewStreamFramer` | - | `out chan *StreamFrame, heartbeatRate time.Duration, batchWindow time.Duratio...` | `*StreamFramer` | [L107](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L107) |
| `Destroy` | `s *StreamFramer` | - | - | [L126](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L126) |
| `Run` | `s *StreamFramer` | - | - | [L153](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L153) |
| `ExitCh` | `s *StreamFramer` | - | `chan struct{...}` | [L165](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L165) |
| `run` | `s *StreamFramer` | - | - | [L171](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L171) |
| `send` | `s *StreamFramer` | - | - | [L219](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L219) |
| `readData` | `s *StreamFramer` | - | `[]byte` | [L238](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L238) |
| `Send` | `s *StreamFramer` | `file string, fileEvent string, data []byte, offset int64` | `error` | [L254](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L254) |
| `IsFlushed` | `s *StreamFramer` | - | `bool` | [L314](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L314) |
| `Flush` | `s *StreamFramer` | - | `bool` | [L318](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L318) |

## 5. 核心方法详解

### Run()

**签名**：`func (s *StreamFramer) Run() `

**位置**：[L153](file:///d:/claude/nomad/client/lib/streamframer/framer.go#L153)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [framer_test.go](file:///d:/claude/nomad/client/lib/streamframer/framer_test.go) | 对应测试文件 |

