# raw.go 代码说明文档

> 文件路径：[raw.go](file:///d:/claude/nomad/api/raw.go)
> 总行数：50 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **原始（Raw）HTTP API 客户端**，提供直接发送原始 HTTP 请求的客户端方法。

## 2. 类型定义

### Raw

**定义位置**：[L12](file:///d:/claude/nomad/api/raw.go#L12)

**类型**：struct

```go
	c *Client
```

**关联方法**（5 个）：`Query`, `Response`, `Write`, `Delete`, `Do`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Raw` | `c *Client` | - | `*Raw` | [L17](file:///d:/claude/nomad/api/raw.go#L17) |
| `Query` | `raw *Raw` | `endpoint string, out interface{}, q *QueryOptions` | `*QueryMeta, error` | [L24](file:///d:/claude/nomad/api/raw.go#L24) |
| `Response` | `raw *Raw` | `endpoint string, q *QueryOptions` | `io.ReadCloser, error` | [L30](file:///d:/claude/nomad/api/raw.go#L30) |
| `Write` | `raw *Raw` | `endpoint string, in interface{}, out interface{}, q *WriteOptions` | `*WriteMeta, error` | [L36](file:///d:/claude/nomad/api/raw.go#L36) |
| `Delete` | `raw *Raw` | `endpoint string, out interface{}, q *WriteOptions` | `*WriteMeta, error` | [L42](file:///d:/claude/nomad/api/raw.go#L42) |
| `Do` | `raw *Raw` | `req *http.Request` | `*http.Response, error` | [L47](file:///d:/claude/nomad/api/raw.go#L47) |

## 5. 核心方法详解

### Delete()

**签名**：`func (raw *Raw) Delete(endpoint string, out interface{}, q *WriteOptions) *WriteMeta, error`

**位置**：[L42](file:///d:/claude/nomad/api/raw.go#L42)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `io` | 标准库 |
| `net/http` | 标准库 |

## 7. 设计模式与技术特点

- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **流式响应**：返回 `io.ReadCloser` 或 channel，支持流式数据读取（如日志流、事件流）
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

