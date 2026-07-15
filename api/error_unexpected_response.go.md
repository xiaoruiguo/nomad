# error_unexpected_response.go 代码说明文档

> 文件路径：[error_unexpected_response.go](file:///d:/claude/nomad/api/error_unexpected_response.go)
> 总行数：181 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **HTTP 错误响应处理**，解析非 2xx HTTP 响应并构造结构化错误对象，支持从 JSON 响应体中提取错误详情。

## 2. 类型定义

### UnexpectedResponseError

**定义位置**：[L18](file:///d:/claude/nomad/api/error_unexpected_response.go#L18)

**类型**：struct

```go
	expected []int
	statusCode int
	statusText string
	body string
	err error
	additional error
```

**关联方法**（14 个）：`HasExpectedStatuses`, `ExpectedStatuses`, `HasStatusCode`, `StatusCode`, `HasStatusText`, `StatusText`, `HasBody`, `Body`, `HasError`, `Unwrap`, `HasAdditional`, `Additional`, `statusFromCode`, `Error`

### unexpectedResponseErrorOption

**定义位置**：[L86](file:///d:/claude/nomad/api/error_unexpected_response.go#L86)

**类型定义**：`func(...)`

### unexpectedResponseErrorSource

**定义位置**：[L113](file:///d:/claude/nomad/api/error_unexpected_response.go#L113)

**类型定义**：`func(...)`

### doRequestWrapper

**定义位置**：[L150](file:///d:/claude/nomad/api/error_unexpected_response.go#L150)

**类型定义**：`func(...)`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `HasExpectedStatuses` | `e *UnexpectedResponseError` | - | `bool` | [L27](file:///d:/claude/nomad/api/error_unexpected_response.go#L27) |
| `ExpectedStatuses` | `e *UnexpectedResponseError` | - | `[]int` | [L28](file:///d:/claude/nomad/api/error_unexpected_response.go#L28) |
| `HasStatusCode` | `e *UnexpectedResponseError` | - | `bool` | [L29](file:///d:/claude/nomad/api/error_unexpected_response.go#L29) |
| `StatusCode` | `e *UnexpectedResponseError` | - | `int` | [L30](file:///d:/claude/nomad/api/error_unexpected_response.go#L30) |
| `HasStatusText` | `e *UnexpectedResponseError` | - | `bool` | [L31](file:///d:/claude/nomad/api/error_unexpected_response.go#L31) |
| `StatusText` | `e *UnexpectedResponseError` | - | `string` | [L32](file:///d:/claude/nomad/api/error_unexpected_response.go#L32) |
| `HasBody` | `e *UnexpectedResponseError` | - | `bool` | [L33](file:///d:/claude/nomad/api/error_unexpected_response.go#L33) |
| `Body` | `e *UnexpectedResponseError` | - | `string` | [L34](file:///d:/claude/nomad/api/error_unexpected_response.go#L34) |
| `HasError` | `e *UnexpectedResponseError` | - | `bool` | [L35](file:///d:/claude/nomad/api/error_unexpected_response.go#L35) |
| `Unwrap` | `e *UnexpectedResponseError` | - | `error` | [L36](file:///d:/claude/nomad/api/error_unexpected_response.go#L36) |
| `HasAdditional` | `e *UnexpectedResponseError` | - | `bool` | [L37](file:///d:/claude/nomad/api/error_unexpected_response.go#L37) |
| `Additional` | `e *UnexpectedResponseError` | - | `error` | [L38](file:///d:/claude/nomad/api/error_unexpected_response.go#L38) |
| `newUnexpectedResponseError` | - | `src unexpectedResponseErrorSource, opts ...unexpectedResponseErrorOption` | `UnexpectedResponseError` | [L39](file:///d:/claude/nomad/api/error_unexpected_response.go#L39) |
| `statusFromCode` | `e *UnexpectedResponseError` | `f func(...)` | - | [L54](file:///d:/claude/nomad/api/error_unexpected_response.go#L54) |
| `Error` | `e *UnexpectedResponseError` | - | `string` | [L61](file:///d:/claude/nomad/api/error_unexpected_response.go#L61) |
| `withError` | - | `e error` | `unexpectedResponseErrorOption` | [L91](file:///d:/claude/nomad/api/error_unexpected_response.go#L91) |
| `withBody` | - | `b string` | `unexpectedResponseErrorOption` | [L96](file:///d:/claude/nomad/api/error_unexpected_response.go#L96) |
| `withStatusText` | - | `st string` | `unexpectedResponseErrorOption` | [L101](file:///d:/claude/nomad/api/error_unexpected_response.go#L101) |
| `withExpectedStatuses` | - | `s []int` | `unexpectedResponseErrorOption` | [L108](file:///d:/claude/nomad/api/error_unexpected_response.go#L108) |
| `fromHTTPResponse` | - | `resp *http.Response` | `unexpectedResponseErrorSource` | [L117](file:///d:/claude/nomad/api/error_unexpected_response.go#L117) |
| `fromStatusCode` | - | `sc int` | `unexpectedResponseErrorSource` | [L144](file:///d:/claude/nomad/api/error_unexpected_response.go#L144) |
| `requireOK` | - | `d time.Duration, resp *http.Response, e error` | `time.Duration, *http.Response, error` | [L153](file:///d:/claude/nomad/api/error_unexpected_response.go#L153) |
| `requireStatusIn` | - | `statuses ...int` | `doRequestWrapper` | [L160](file:///d:/claude/nomad/api/error_unexpected_response.go#L160) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net/http` | 标准库 |
| `slices` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad API 客户端的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [error_unexpected_response_test.go](file:///d:/claude/nomad/api/error_unexpected_response_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

