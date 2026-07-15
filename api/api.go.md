# api.go 代码说明文档

> 文件路径：[api/api.go](file:///d:/claude/nomad/api/api.go)
> 总行数：1305 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `api.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### QueryOptions

**定义位置**：[L57](file:///d:/claude/nomad/api/api.go#L57)

**中文说明**：QueryOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type QueryOptions struct {
	Region string
	Namespace string
	AllowStale bool
	WaitIndex uint64
	WaitTime time.Duration
	Prefix string
	Params map[string]string
	Headers map[string]string
	AuthToken string
	Filter string
	PerPage int32
	NextToken string
	Reverse bool
	ctx context.Context
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Region` | `string` | 区域 |
| `Namespace` | `string` | 命名空间 |
| `AllowStale` | `bool` | 布尔值 |
| `WaitIndex` | `uint64` | 索引值（uint64） |
| `WaitTime` | `time.Duration` | 时间间隔 |
| `Prefix` | `string` | 字符串 |
| `Params` | `map[string]string` | 参数 |
| `Headers` | `map[string]string` | 映射表 |
| `AuthToken` | `string` | 字符串 |
| `Filter` | `string` | 字符串 |
| `PerPage` | `int32` | — |
| `NextToken` | `string` | 字符串 |
| `Reverse` | `bool` | 布尔值 |
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |

**关联方法**（2 个）：`Context`, `WithContext`

### WriteOptions

**定义位置**：[L114](file:///d:/claude/nomad/api/api.go#L114)

**中文说明**：WriteOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type WriteOptions struct {
	Region string
	Namespace string
	AuthToken string
	Headers map[string]string
	ctx context.Context
	IdempotencyToken string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Region` | `string` | 区域 |
| `Namespace` | `string` | 命名空间 |
| `AuthToken` | `string` | 字符串 |
| `Headers` | `map[string]string` | 映射表 |
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `IdempotencyToken` | `string` | 字符串 |

**关联方法**（2 个）：`Context`, `WithContext`

### QueryMeta

**定义位置**：[L137](file:///d:/claude/nomad/api/api.go#L137)

**中文说明**：QueryMeta 是一个元数据结构体，包含对象的附加元信息。

**类型**：struct

```go
type QueryMeta struct {
	LastIndex uint64
	LastContact time.Duration
	KnownLeader bool
	RequestTime time.Duration
	NextToken string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `LastIndex` | `uint64` | 索引值（uint64） |
| `LastContact` | `time.Duration` | 时间间隔 |
| `KnownLeader` | `bool` | 布尔值 |
| `RequestTime` | `time.Duration` | 时间间隔 |
| `NextToken` | `string` | 字符串 |

### WriteMeta

**定义位置**：[L159](file:///d:/claude/nomad/api/api.go#L159)

**中文说明**：WriteMeta 是一个元数据结构体，包含对象的附加元信息。

**类型**：struct

```go
type WriteMeta struct {
	LastIndex uint64
	RequestTime time.Duration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `LastIndex` | `uint64` | 索引值（uint64） |
| `RequestTime` | `time.Duration` | 时间间隔 |

### HttpBasicAuth

**定义位置**：[L169](file:///d:/claude/nomad/api/api.go#L169)

**中文说明**：HttpBasicAuth 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type HttpBasicAuth struct {
	Username string
	Password string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Username` | `string` | 字符串 |
| `Password` | `string` | 字符串 |

### Config

**定义位置**：[L178](file:///d:/claude/nomad/api/api.go#L178)

**中文说明**：Config 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type Config struct {
	Address string
	Region string
	SecretID string
	Namespace string
	HttpClient *http.Client
	HttpAuth *HttpBasicAuth
	WaitTime time.Duration
	TLSConfig *TLSConfig
	Headers http.Header
	retryOptions *retryOptions
	url *url.URL
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Address` | `string` | 地址 |
| `Region` | `string` | 区域 |
| `SecretID` | `string` | 字符串 |
| `Namespace` | `string` | 命名空间 到 使用. 如果 不 provided 默认 命名空间 被使用. |
| `HttpClient` | `*http.Client` | — |
| `HttpAuth` | `*HttpBasicAuth` | — |
| `WaitTime` | `time.Duration` | 时间间隔 |
| `TLSConfig` | `*TLSConfig` | — |
| `Headers` | `http.Header` | — |
| `retryOptions` | `*retryOptions` | — |
| `url` | `*url.URL` | URL 地址 |

**关联方法**（2 个）：`URL`, `ClientConfig`

### TLSConfig

**定义位置**：[L256](file:///d:/claude/nomad/api/api.go#L256)

**中文说明**：TLSConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type TLSConfig struct {
	CACert string
	CAPath string
	CACertPEM []byte
	ClientCert string
	ClientCertPEM []byte
	ClientKey string
	ClientKeyPEM []byte
	TLSServerName string
	Insecure bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CACert` | `string` | 字符串 |
| `CAPath` | `string` | 字符串 |
| `CACertPEM` | `[]byte` | 字节数组 |
| `ClientCert` | `string` | 字符串 |
| `ClientCertPEM` | `[]byte` | 字节数组 |
| `ClientKey` | `string` | 字符串 |
| `ClientKeyPEM` | `[]byte` | 字节数组 |
| `TLSServerName` | `string` | 字符串 |
| `Insecure` | `bool` | 布尔值 |

**关联方法**（1 个）：`Copy`

### Client

**定义位置**：[L502](file:///d:/claude/nomad/api/api.go#L502)

**中文说明**：Client 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Client struct {
	httpClient *http.Client
	config Config
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `httpClient` | `*http.Client` | — |
| `config` | `Config` | 配置 |

**关联方法**（21 个）：`Close`, `Address`, `SetRegion`, `SetNamespace`, `GetNodeClient`, `GetNodeClientWithTimeout`, `getNodeClientImpl`, `SetSecretID`, `configureRetries`, `newRequest`, `doRequest`, `autoUnzip`, `rawQuery`, `websocket`, `query`, `putQuery`, `put`, `postQuery`, `post`, `write`, `delete`

### nodeLookup

**定义位置**：[L591](file:///d:/claude/nomad/api/api.go#L591)

**中文说明**：nodeLookup 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型定义**：`type nodeLookup func(...)`

### request

**定义位置**：[L675](file:///d:/claude/nomad/api/api.go#L675)

**中文说明**：request 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type request struct {
	config *Config
	method string
	url *url.URL
	params url.Values
	token string
	body io.Reader
	obj interface{}
	ctx context.Context
	header http.Header
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `config` | `*Config` | 配置 |
| `method` | `string` | 字符串 |
| `url` | `*url.URL` | URL 地址 |
| `params` | `url.Values` | 参数 |
| `token` | `string` | 令牌，用于认证或标识 |
| `body` | `io.Reader` | — |
| `obj` | `interface{}` | 接口类型，可持有任意值 |
| `ctx` | `context.Context` | 上下文，用于控制请求的生命周期 |
| `header` | `http.Header` | — |

**关联方法**（3 个）：`setQueryOptions`, `setWriteOptions`, `toHTTP`

### multiCloser

**定义位置**：[L872](file:///d:/claude/nomad/api/api.go#L872)

**中文说明**：multiCloser 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type multiCloser struct {
	reader io.Reader
	inorderClose []io.Closer
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `reader` | `io.Reader` | — |
| `inorderClose` | `[]io.Closer` | 列表 |

**关联方法**（2 个）：`Close`, `Read`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `AllNamespacesNamespace` | `—` | `"*"` | — |
| `PermissionDeniedErrorContent` | `—` | `"Permission denied"` | — |
| `ResultPaginatorErrorContent` | `—` | `"failed to create result paginator"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ClientConnTimeout` | `—` | `1 * time.Second` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `URL` | `c *Config` | `` | `*url.URL` | [L223](file:///d:/claude/nomad/api/api.go#L223) |
| `ClientConfig` | `c *Config` | `region string, address string, tlsEnabled bool` | `*Config` | [L229](file:///d:/claude/nomad/api/api.go#L229) |
| `Copy` | `t *TLSConfig` | `` | `*TLSConfig` | [L289](file:///d:/claude/nomad/api/api.go#L289) |
| `defaultUDSClient` | - | `config *Config` | `*http.Client` | [L302](file:///d:/claude/nomad/api/api.go#L302) |
| `defaultHttpClient` | - | `` | `*http.Client` | [L316](file:///d:/claude/nomad/api/api.go#L316) |
| `defaultClient` | - | `c *http.Client` | `*http.Client` | [L321](file:///d:/claude/nomad/api/api.go#L321) |
| `DefaultConfig` | - | `` | `*Config` | [L336](file:///d:/claude/nomad/api/api.go#L336) |
| `cloneWithTimeout` | - | `httpClient *http.Client, t time.Duration` | `*http.Client, error` | [L395](file:///d:/claude/nomad/api/api.go#L395) |
| `ConfigureTLS` | - | `httpClient *http.Client, tlsConfig *TLSConfig` | `error` | [L445](file:///d:/claude/nomad/api/api.go#L445) |
| `NewClient` | - | `config *Config` | `*Client, error` | [L508](file:///d:/claude/nomad/api/api.go#L508) |
| `Close` | `c *Client` | `` | `` | [L556](file:///d:/claude/nomad/api/api.go#L556) |
| `Address` | `c *Client` | `` | `string` | [L561](file:///d:/claude/nomad/api/api.go#L561) |
| `SetRegion` | `c *Client` | `region string` | `` | [L566](file:///d:/claude/nomad/api/api.go#L566) |
| `SetNamespace` | `c *Client` | `namespace string` | `` | [L571](file:///d:/claude/nomad/api/api.go#L571) |
| `GetNodeClient` | `c *Client` | `nodeID string, q *QueryOptions` | `*Client, error` | [L577](file:///d:/claude/nomad/api/api.go#L577) |
| `GetNodeClientWithTimeout` | `c *Client` | `nodeID string, timeout time.Duration, q *QueryOptions` | `*Client, error` | [L584](file:///d:/claude/nomad/api/api.go#L584) |
| `getNodeClientImpl` | `c *Client` | `nodeID string, timeout time.Duration, q *QueryOptions, lookup nodeLookup` | `*Client, error` | [L596](file:///d:/claude/nomad/api/api.go#L596) |
| `SetSecretID` | `c *Client` | `secretID string` | `` | [L636](file:///d:/claude/nomad/api/api.go#L636) |
| `configureRetries` | `c *Client` | `ro *retryOptions` | `` | [L640](file:///d:/claude/nomad/api/api.go#L640) |
| `setQueryOptions` | `r *request` | `q *QueryOptions` | `` | [L689](file:///d:/claude/nomad/api/api.go#L689) |
| `durToMsec` | - | `dur time.Duration` | `string` | [L737](file:///d:/claude/nomad/api/api.go#L737) |
| `setWriteOptions` | `r *request` | `q *WriteOptions` | `` | [L743](file:///d:/claude/nomad/api/api.go#L743) |
| `toHTTP` | `r *request` | `` | `*http.Request, error` | [L767](file:///d:/claude/nomad/api/api.go#L767) |
| `newRequest` | `c *Client` | `method string, path string` | `*request, error` | [L816](file:///d:/claude/nomad/api/api.go#L816) |
| `Close` | `m *multiCloser` | `` | `error` | [L877](file:///d:/claude/nomad/api/api.go#L877) |
| `Read` | `m *multiCloser` | `p []byte` | `int, error` | [L886](file:///d:/claude/nomad/api/api.go#L886) |
| `doRequest` | `c *Client` | `r *request` | `time.Duration, *http.Response, error` | [L891](file:///d:/claude/nomad/api/api.go#L891) |
| `autoUnzip` | ` *Client` | `resp *http.Response` | `error` | [L911](file:///d:/claude/nomad/api/api.go#L911) |
| `rawQuery` | `c *Client` | `endpoint string, q *QueryOptions` | `io.ReadCloser, error` | [L939](file:///d:/claude/nomad/api/api.go#L939) |
| `websocket` | `c *Client` | `endpoint string, q *QueryOptions` | `*websocket.Conn, *http.Response, error` | [L954](file:///d:/claude/nomad/api/api.go#L954) |
| `query` | `c *Client` | `endpoint string, out any, q *QueryOptions` | `*QueryMeta, error` | [L1043](file:///d:/claude/nomad/api/api.go#L1043) |
| `putQuery` | `c *Client` | `endpoint string, in any, out any, q *QueryOptions` | `*QueryMeta, error` | [L1067](file:///d:/claude/nomad/api/api.go#L1067) |
| `put` | `c *Client` | `endpoint string, in any, out any, q *WriteOptions` | `*WriteMeta, error` | [L1092](file:///d:/claude/nomad/api/api.go#L1092) |
| `postQuery` | `c *Client` | `endpoint string, in any, out any, q *QueryOptions` | `*QueryMeta, error` | [L1098](file:///d:/claude/nomad/api/api.go#L1098) |
| `post` | `c *Client` | `endpoint string, in any, out any, q *WriteOptions` | `*WriteMeta, error` | [L1123](file:///d:/claude/nomad/api/api.go#L1123) |
| `write` | `c *Client` | `verb string, endpoint string, in any, out any, q *WriteOptions` | `*WriteMeta, error` | [L1131](file:///d:/claude/nomad/api/api.go#L1131) |
| `delete` | `c *Client` | `endpoint string, in any, out any, q *WriteOptions` | `*WriteMeta, error` | [L1157](file:///d:/claude/nomad/api/api.go#L1157) |
| `parseQueryMeta` | - | `resp *http.Response, q *QueryMeta` | `error` | [L1182](file:///d:/claude/nomad/api/api.go#L1182) |
| `parseWriteMeta` | - | `resp *http.Response, q *WriteMeta` | `error` | [L1214](file:///d:/claude/nomad/api/api.go#L1214) |
| `decodeBody` | - | `resp *http.Response, out interface{}` | `error` | [L1227](file:///d:/claude/nomad/api/api.go#L1227) |
| `encodeBody` | - | `obj interface{}` | `io.Reader, error` | [L1244](file:///d:/claude/nomad/api/api.go#L1244) |
| `Context` | `o *QueryOptions` | `` | `context.Context` | [L1258](file:///d:/claude/nomad/api/api.go#L1258) |
| `WithContext` | `o *QueryOptions` | `ctx context.Context` | `*QueryOptions` | [L1266](file:///d:/claude/nomad/api/api.go#L1266) |
| `Context` | `o *WriteOptions` | `` | `context.Context` | [L1276](file:///d:/claude/nomad/api/api.go#L1276) |
| `WithContext` | `o *WriteOptions` | `ctx context.Context` | `*WriteOptions` | [L1284](file:///d:/claude/nomad/api/api.go#L1284) |
| `copyURL` | - | `u1 *url.URL` | `*url.URL` | [L1294](file:///d:/claude/nomad/api/api.go#L1294) |

## 5. 核心方法详解

### Copy()

**签名**：`func (t *TLSConfig) Copy() *TLSConfig`

**位置**：[L289](file:///d:/claude/nomad/api/api.go#L289)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*TLSConfig` | — |

### NewClient()

**签名**：`func NewClient(config *Config) *Client, error`

**位置**：[L508](file:///d:/claude/nomad/api/api.go#L508)

**中文说明**：创建并返回一个新的 Client 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `config` | `*Config` | 配置 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Client` | 关联的 Client 实例 |
| `error` | 错误信息 |

### Close()

**签名**：`func (c *Client) Close() `

**位置**：[L556](file:///d:/claude/nomad/api/api.go#L556)

**中文说明**：关闭对象。

### Close()

**签名**：`func (m *multiCloser) Close() error`

**位置**：[L877](file:///d:/claude/nomad/api/api.go#L877)

**中文说明**：关闭对象。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Read()

**签名**：`func (m *multiCloser) Read(p []byte) int, error`

**位置**：[L886](file:///d:/claude/nomad/api/api.go#L886)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `p` | `[]byte` | 字节数组 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `int` | — |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `compress/gzip` | 标准库 |
| `context` | 标准库 |
| `crypto/tls` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `math` | 标准库 |
| `net` | 标准库 |
| `net/http` | 标准库 |
| `net/url` | 标准库 |
| `os` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/gorilla/websocket` | 第三方库 |
| `github.com/hashicorp/go-cleanhttp` | 第三方库 |
| `github.com/hashicorp/go-rootcerts` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **加密安全**：使用 Go crypto 标准库实现加密、签名或 TLS 通信
- **HTTP 服务**：提供 HTTP API 端点或客户端
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api_test.go](file:///d:/claude/nomad/api/api_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [constraint.go](file:///d:/claude/nomad/api/constraint.go) | 同目录源文件 |

