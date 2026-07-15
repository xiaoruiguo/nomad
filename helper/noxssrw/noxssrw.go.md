# noxssrw.go 代码说明文档

> 文件路径：[noxssrw/noxssrw.go](file:///d:/claude/nomad/helper/noxssrw/noxssrw.go)
> 总行数：231 行
> 所属包：`noxssrw`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **XSS 防护子包**（`helper/noxssrw`），实现 XSS（跨站脚本）防护的读写器，对输出内容进行转义处理。

## 2. 类型定义

### NoXSSResponseWriter

**定义位置**：[L42](file:///d:/claude/nomad/helper/noxssrw/noxssrw.go#L42)

**类型**：struct

```go
	TypeMap map[string]string
	DefaultHeaders map[string]string
	buf []byte
	subsequentWrite bool
	flushed bool
	orig http.ResponseWriter
```

**关联方法**（4 个）：`Header`, `Write`, `Close`, `WriteHeader`

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `DefaultUnsafeTypes` | `map[string]string{...}` |
| `DefaultHeaders` | `map[string]string{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Header` | `w *NoXSSResponseWriter` | - | `http.Header` | [L86](file:///d:/claude/nomad/helper/noxssrw/noxssrw.go#L86) |
| `Write` | `w *NoXSSResponseWriter` | `p []byte` | `int, error` | [L111](file:///d:/claude/nomad/helper/noxssrw/noxssrw.go#L111) |
| `Close` | `w *NoXSSResponseWriter` | - | `int, error` | [L173](file:///d:/claude/nomad/helper/noxssrw/noxssrw.go#L173) |
| `WriteHeader` | `w *NoXSSResponseWriter` | `statusCode int` | - | [L211](file:///d:/claude/nomad/helper/noxssrw/noxssrw.go#L211) |
| `NewResponseWriter` | - | `orig http.ResponseWriter` | `http.ResponseWriter, func(...)` | [L221](file:///d:/claude/nomad/helper/noxssrw/noxssrw.go#L221) |

## 5. 核心方法详解

### Write()

**签名**：`func (w *NoXSSResponseWriter) Write(p []byte) int, error`

**位置**：[L111](file:///d:/claude/nomad/helper/noxssrw/noxssrw.go#L111)

### Close()

**签名**：`func (w *NoXSSResponseWriter) Close() int, error`

**位置**：[L173](file:///d:/claude/nomad/helper/noxssrw/noxssrw.go#L173)

### NewResponseWriter()

**签名**：`func NewResponseWriter(orig http.ResponseWriter) http.ResponseWriter, func(...)`

**位置**：[L221](file:///d:/claude/nomad/helper/noxssrw/noxssrw.go#L221)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `net/http` | 标准库 |
| `strings` | 标准库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 辅助工具的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|

