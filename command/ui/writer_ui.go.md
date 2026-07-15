# writer_ui.go 代码说明文档

> 文件路径：[writer_ui.go](file:///d:/claude/nomad/command/ui/writer_ui.go)
> 总行数：83 行
> 所属包：`ui`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CLI UI 工具子包**（`command/ui`），实现 `WriterUI` 结构体——一个 `cli.Ui` 接口实现，**暴露底层的 `io.Reader`/`io.Writer` 流**供命令直接使用。

**核心动机**：Nomad 的某些命令需要直接操作终端的原始 IO 流，而非通过 `cli.Ui` 的高层方法。典型场景包括：

- **大文件流式传输**：如 `nomad alloc fs cat` 将远端文件内容直接 `io.Copy` 到本地 stdout，避免在内存中缓冲整个文件。
- **二进制数据输出**：如 `nomad ui` 或导出操作，需要写入非文本字节流，`cli.Ui.Output()` 会强制转为 `string` 并可能追加换行，不适合。
- **进度条/原地刷新**：某些命令需要直接控制终端光标位置。
- **管道传递**：将命令输出直接连接到下游命令的 stdin。

`WriterUI` 在保留 `cli.Ui` 接口完整功能的同时，通过 `InputReader()`/`OutputWriter()`/`ErrorWriter()` 三个访问器暴露底层流，实现"两全其美"。

---

## 2. 类型定义

### WriterUI

**定义位置**：[L14](file:///d:/claude/nomad/command/ui/writer_ui.go#L14)

**类型**：struct

```go
	// Ui is the wrapped cli.Ui that supplies the functions for the thin shims
	Ui cli.Ui

	reader      io.Reader
	writer      io.Writer
	errorWriter io.Writer

	// baseUi stores the basic UI that was used to create this WriterUI. It
	// allows us to call its functions and not implement them again.
	baseUi cli.Ui
```

**字段说明**：

| 字段 | 类型 | 职责 |
|------|------|------|
| `Ui` | `cli.Ui` | 被包装的原始 UI（公开字段），所有 `Output`/`Info`/`Warn`/`Error`/`Ask`/`AskSecret` 委托给它 |
| `reader` | `io.Reader` | 底层输入流（私有），通过 `InputReader()` 访问 |
| `writer` | `io.Writer` | 底层输出流（私有），通过 `OutputWriter()` 访问 |
| `errorWriter` | `io.Writer` | 底层错误流（私有），通过 `ErrorWriter()` 访问 |
| `baseUi` | `cli.Ui` | 解包到的基础 UI（`BasicUi` 或 `MockUi`），保留引用以备扩展 |

**关联方法**（9 个）：`InputReader`, `OutputWriter`, `ErrorWriter`, `Output`, `Info`, `Warn`, `Error`, `Ask`, `AskSecret`

---

## 3. 常量与变量

该文件未定义顶级常量或变量。

---

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewWriterUI` | - | `ui cli.Ui` | `*WriterUI, error` | [L32](file:///d:/claude/nomad/command/ui/writer_ui.go#L32) |
| `InputReader` | `w *WriterUI` | - | `io.Reader` | [L63](file:///d:/claude/nomad/command/ui/writer_ui.go#L63) |
| `OutputWriter` | `w *WriterUI` | - | `io.Writer` | [L64](file:///d:/claude/nomad/command/ui/writer_ui.go#L64) |
| `ErrorWriter` | `w *WriterUI` | - | `io.Writer` | [L65](file:///d:/claude/nomad/command/ui/writer_ui.go#L65) |
| `Output` | `w *WriterUI` | `message string` | - | [L67](file:///d:/claude/nomad/command/ui/writer_ui.go#L67) |
| `Info` | `w *WriterUI` | `message string` | - | [L68](file:///d:/claude/nomad/command/ui/writer_ui.go#L68) |
| `Warn` | `w *WriterUI` | `message string` | - | [L69](file:///d:/claude/nomad/command/ui/writer_ui.go#L69) |
| `Error` | `w *WriterUI` | `message string` | - | [L70](file:///d:/claude/nomad/command/ui/writer_ui.go#L70) |
| `Ask` | `w *WriterUI` | `query string` | `string, error` | [L72](file:///d:/claude/nomad/command/ui/writer_ui.go#L72) |
| `AskSecret` | `w *WriterUI` | `query string` | `string, error` | [L73](file:///d:/claude/nomad/command/ui/writer_ui.go#L73) |

---

## 5. 核心方法详解

### NewWriterUI()

**签名**：`func NewWriterUI(ui cli.Ui) (*WriterUI, error)`

**位置**：[L32](file:///d:/claude/nomad/command/ui/writer_ui.go#L32)

**功能**：工厂函数，从现有的 `cli.Ui` 创建 `WriterUI` 实例。通过**循环解包 UI 链**，直到找到包含实际 IO 流的基础 UI 类型。

**解包循环逻辑**：

```
输入: *cli.ColoredUi
  └─ 解包 → ui = u.Ui → 继续循环

输入: *cli.MockUi
  └─ 提取 InputReader / OutputWriter / ErrorWriter ✓ done

输入: *cli.BasicUi
  └─ 提取 Reader / Writer / ErrorWriter ✓ done

其他类型 → 返回 error "writer ui: unsupported Ui type: %T"

nil → 跳出循环 → 返回 error "failed to generate command UI"
```

**支持的 UI 类型**：

| 类型 | 来源 | 提取的字段 |
|------|------|-----------|
| `*cli.MockUi` | 测试用 Mock UI | `InputReader`, `OutputWriter`, `ErrorWriter` |
| `*cli.BasicUi` | 生产用基础 UI | `Reader`, `Writer`, `ErrorWriter` |
| `*cli.ColoredUi` | 彩色装饰器 | 透明解包，继续处理内层 `.Ui` |

**关键设计**：循环解包支持任意深度的 UI 装饰链。例如 `ColoredUi(ColoredUi(BasicUi))` 也能正确处理。每遇到 `*cli.ColoredUi` 就剥一层，直到遇到 `BasicUi` 或 `MockUi` 为止。

---

### InputReader() / OutputWriter() / ErrorWriter()

**签名**：
- `func (w *WriterUI) InputReader() io.Reader`
- `func (w *WriterUI) OutputWriter() io.Writer`
- `func (w *WriterUI) ErrorWriter() io.Writer`

**位置**：[L63-L65](file:///d:/claude/nomad/command/ui/writer_ui.go#L63)

**功能**：访问器方法，暴露底层的 IO 流。命令可直接使用这些流进行：

- `io.Copy(w.OutputWriter(), remoteReader)` —— 流式拷贝大文件
- `w.OutputWriter().Write([]byte{...})` —— 写入二进制数据
- `bufio.NewReader(w.InputReader())` —— 读取用户原始输入

**注意**：这些方法返回的是**裸流**，绕过了 `cli.Ui` 的格式化逻辑（不会着色、不会追加换行）。

---

### Output() / Info() / Warn() / Error()

**签名**：
- `func (w *WriterUI) Output(message string)`
- `func (w *WriterUI) Info(message string)`
- `func (w *WriterUI) Warn(message string)`
- `func (w *WriterUI) Error(message string)`

**位置**：[L67-L70](file:///d:/claude/nomad/command/ui/writer_ui.go#L67)

**功能**：薄封装（thin shim），直接委托给 `w.Ui` 的对应方法。保留标准 UI 行为（含换行、着色等），与直接访问 `OutputWriter()` 的裸流形成互补。

---

### Ask() / AskSecret()

**签名**：
- `func (w *WriterUI) Ask(query string) (string, error)`
- `func (w *WriterUI) AskSecret(query string) (string, error)`

**位置**：[L72-L73](file:///d:/claude/nomad/command/ui/writer_ui.go#L72)

**功能**：委托给 `w.Ui.Ask()`/`AskSecret()`，保留交互式询问能力。

---

## 6. 依赖关系

### 导入包

| 包路径 | 类型 | 用途 |
|--------|------|------|
| `errors` | 标准库 | 创建错误 |
| `fmt` | 标准库 | `fmt.Errorf` 格式化错误 |
| `io` | 标准库 | `io.Reader`/`io.Writer` 接口 |
| `github.com/hashicorp/cli` | 第三方库 | `cli.Ui` 接口、`cli.BasicUi`、`cli.ColoredUi`、`cli.MockUi` |

---

## 7. 设计模式与技术特点

- **装饰器模式（Decorator Pattern）**：`WriterUI` 包装一个 `cli.Ui`，**不修改**原有行为，而是**增加**对底层 IO 流的访问能力。所有 `cli.Ui` 方法通过薄封装委托给原始 UI。
- **循环解包**：`NewWriterUI` 使用 `for !done` 循环逐层剥离 `ColoredUi` 装饰器，比 `LogUI` 的单层类型断言更健壮，支持任意深度的装饰链。
- **访问器模式**：通过 `InputReader()`/`OutputWriter()`/`ErrorWriter()` 方法（而非公开字段）暴露底层流，保持封装性，便于未来扩展（如添加缓冲、同步等）。
- **双重输出路径**：
  - 高层路径：`Output()`/`Info()` 等 → 委托给 `Ui` → 走标准格式化（含换行、着色）
  - 低层路径：`OutputWriter()` → 直接操作裸流（无格式化）
  
  命令可根据需求选择合适路径。
- **测试友好**：显式支持 `*cli.MockUi`，使得使用 `WriterUI` 的命令可以在测试中用 Mock UI 验证输出。
- **接口实现**：`WriterUI` 实现了 `cli.Ui` 接口的全部 6 个方法，可作为 `cli.Ui` 的透明替换。

---

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [log_ui.go](file:///d:/claude/nomad/command/ui/log_ui.go) | 同包姊妹文件，提供 `LogUI`（无换行日志输出） |
| [writer_ui_test.go](file:///d:/claude/nomad/command/ui/writer_ui_test.go) | 对应测试文件 |
| [../meta.go](file:///d:/claude/nomad/command/meta.go) | `Meta` 结构体使用 `cli.Ui`，可能构造 `WriterUI` |
| [../fs_endpoint.go](file:///d:/claude/nomad/command/agent/fs_endpoint.go) | 文件系统端点，`nomad alloc fs cat` 等命令是 `WriterUI` 的典型使用场景 |
