# raw.go 代码说明文档

> 文件路径：[api/raw.go](file:///d:/claude/nomad/api/raw.go)
> 总行数：50 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `raw.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Raw

**定义位置**：[L12](file:///d:/claude/nomad/api/raw.go#L12)

**中文说明**：Raw 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Raw struct {
	c *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `c` | `*Client` | 关联的 Client 实例 |

**关联方法**（5 个）：`Query`, `Response`, `Write`, `Delete`, `Do`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Raw` | `c *Client` | `` | `*Raw` | [L17](file:///d:/claude/nomad/api/raw.go#L17) |
| `Query` | `raw *Raw` | `endpoint string, out interface{}, q *QueryOptions` | `*QueryMeta, error` | [L24](file:///d:/claude/nomad/api/raw.go#L24) |
| `Response` | `raw *Raw` | `endpoint string, q *QueryOptions` | `io.ReadCloser, error` | [L30](file:///d:/claude/nomad/api/raw.go#L30) |
| `Write` | `raw *Raw` | `endpoint string, in interface{}, out interface{}, q *WriteOptions` | `*WriteMeta, error` | [L36](file:///d:/claude/nomad/api/raw.go#L36) |
| `Delete` | `raw *Raw` | `endpoint string, out interface{}, q *WriteOptions` | `*WriteMeta, error` | [L42](file:///d:/claude/nomad/api/raw.go#L42) |
| `Do` | `raw *Raw` | `req *http.Request` | `*http.Response, error` | [L47](file:///d:/claude/nomad/api/raw.go#L47) |

## 5. 核心方法详解

### Write()

**签名**：`func (raw *Raw) Write(endpoint string, in interface{}, out interface{}, q *WriteOptions) *WriteMeta, error`

**位置**：[L36](file:///d:/claude/nomad/api/raw.go#L36)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `endpoint` | `string` | 字符串 |
| `in` | `interface{}` | 接口类型，可持有任意值 |
| `out` | `interface{}` | 接口类型，可持有任意值 |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (raw *Raw) Delete(endpoint string, out interface{}, q *WriteOptions) *WriteMeta, error`

**位置**：[L42](file:///d:/claude/nomad/api/raw.go#L42)

**中文说明**：删除指定的对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `endpoint` | `string` | 字符串 |
| `out` | `interface{}` | 接口类型，可持有任意值 |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `io` | 标准库 |
| `net/http` | 标准库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HTTP 服务**：提供 HTTP API 端点或客户端

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

