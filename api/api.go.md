# api.go 代码说明文档

> 文件路径：[api.go](file:///d:/claude/nomad/api/api.go)
> 总行数：1305 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件是 **Nomad API 客户端核心实现**，定义 `Client` 结构体（HTTP 客户端入口）、`Config`（客户端配置）、`QueryOptions`/`WriteOptions`（请求参数）、`QueryMeta`/`WriteMeta`（响应元数据）等基础类型。所有资源特定的客户端（如 `Jobs`、`Allocations`）都通过 `Client` 的方法获取。包含 HTTP 请求构建、响应解析、查询参数处理、阻塞查询支持等核心逻辑。

## 2. 类型定义

### QueryOptions

**定义位置**：[L57](file:///d:/claude/nomad/api/api.go#L57)

**类型**：struct

```go
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
```

**关联方法**（2 个）：`Context`, `WithContext`

### WriteOptions

**定义位置**：[L114](file:///d:/claude/nomad/api/api.go#L114)

**类型**：struct

```go
	Region string
	Namespace string
	AuthToken string
	Headers map[string]string
	ctx context.Context
	IdempotencyToken string
```

**关联方法**（2 个）：`Context`, `WithContext`

### QueryMeta

**定义位置**：[L137](file:///d:/claude/nomad/api/api.go#L137)

**类型**：struct

```go
	LastIndex uint64
	LastContact time.Duration
	KnownLeader bool
	RequestTime time.Duration
	NextToken string
```

### WriteMeta

**定义位置**：[L159](file:///d:/claude/nomad/api/api.go#L159)

**类型**：struct

```go
	LastIndex uint64
	RequestTime time.Duration
```

### HttpBasicAuth

**定义位置**：[L169](file:///d:/claude/nomad/api/api.go#L169)

**类型**：struct

```go
	Username string
	Password string
```

### Config

**定义位置**：[L178](file:///d:/claude/nomad/api/api.go#L178)

**类型**：struct

```go
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
```

**关联方法**（2 个）：`URL`, `ClientConfig`

### TLSConfig

**定义位置**：[L256](file:///d:/claude/nomad/api/api.go#L256)

**类型**：struct

```go
	CACert string
	CAPath string
	CACertPEM []byte
	ClientCert string
	ClientCertPEM []byte
	ClientKey string
	ClientKeyPEM []byte
	TLSServerName string
	Insecure bool
```

**关联方法**（1 个）：`Copy`

### Client

**定义位置**：[L502](file:///d:/claude/nomad/api/api.go#L502)

**类型**：struct

```go
	httpClient *http.Client
	config Config
```

**关联方法**（21 个）：`Close`, `Address`, `SetRegion`, `SetNamespace`, `GetNodeClient`, `GetNodeClientWithTimeout`, `getNodeClientImpl`, `SetSecretID`, `configureRetries`, `newRequest`, `doRequest`, `autoUnzip`, `rawQuery`, `websocket`, `query`, `putQuery`, `put`, `postQuery`, `post`, `write`, `delete`

### nodeLookup

**定义位置**：[L591](file:///d:/claude/nomad/api/api.go#L591)

**类型定义**：`func(...)`

### request

**定义位置**：[L675](file:///d:/claude/nomad/api/api.go#L675)

**类型**：struct

```go
	config *Config
	method string
	url *url.URL
	params url.Values
	token string
	body io.Reader
	obj interface{}
	ctx context.Context
	header http.Header
```

**关联方法**（3 个）：`setQueryOptions`, `setWriteOptions`, `toHTTP`

### multiCloser

**定义位置**：[L872](file:///d:/claude/nomad/api/api.go#L872)

**类型**：struct

```go
	reader io.Reader
	inorderClose []io.Closer
```

**关联方法**（2 个）：`Close`, `Read`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `AllNamespacesNamespace` | `"*"` |
| `PermissionDeniedErrorContent` | `"Permission denied"` |
| `ResultPaginatorErrorContent` | `"failed to create result paginator"` |

### 变量

| 名称 | 值 |
|------|----|
| `ClientConnTimeout` | `1 * time.Second` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `URL` | `c *Config` | - | `*url.URL` | [L223](file:///d:/claude/nomad/api/api.go#L223) |
| `ClientConfig` | `c *Config` | `region string, address string, tlsEnabled bool` | `*Config` | [L229](file:///d:/claude/nomad/api/api.go#L229) |
| `Copy` | `t *TLSConfig` | - | `*TLSConfig` | [L289](file:///d:/claude/nomad/api/api.go#L289) |
| `defaultUDSClient` | - | `config *Config` | `*http.Client` | [L302](file:///d:/claude/nomad/api/api.go#L302) |
| `defaultHttpClient` | - | - | `*http.Client` | [L316](file:///d:/claude/nomad/api/api.go#L316) |
| `defaultClient` | - | `c *http.Client` | `*http.Client` | [L321](file:///d:/claude/nomad/api/api.go#L321) |
| `DefaultConfig` | - | - | `*Config` | [L336](file:///d:/claude/nomad/api/api.go#L336) |
| `cloneWithTimeout` | - | `httpClient *http.Client, t time.Duration` | `*http.Client, error` | [L395](file:///d:/claude/nomad/api/api.go#L395) |
| `ConfigureTLS` | - | `httpClient *http.Client, tlsConfig *TLSConfig` | `error` | [L445](file:///d:/claude/nomad/api/api.go#L445) |
| `NewClient` | - | `config *Config` | `*Client, error` | [L508](file:///d:/claude/nomad/api/api.go#L508) |
| `Close` | `c *Client` | - | - | [L556](file:///d:/claude/nomad/api/api.go#L556) |
| `Address` | `c *Client` | - | `string` | [L561](file:///d:/claude/nomad/api/api.go#L561) |
| `SetRegion` | `c *Client` | `region string` | - | [L566](file:///d:/claude/nomad/api/api.go#L566) |
| `SetNamespace` | `c *Client` | `namespace string` | - | [L571](file:///d:/claude/nomad/api/api.go#L571) |
| `GetNodeClient` | `c *Client` | `nodeID string, q *QueryOptions` | `*Client, error` | [L577](file:///d:/claude/nomad/api/api.go#L577) |
| `GetNodeClientWithTimeout` | `c *Client` | `nodeID string, timeout time.Duration, q *QueryOptions` | `*Client, error` | [L584](file:///d:/claude/nomad/api/api.go#L584) |
| `getNodeClientImpl` | `c *Client` | `nodeID string, timeout time.Duration, q *QueryOptions, lookup nodeLookup` | `*Client, error` | [L596](file:///d:/claude/nomad/api/api.go#L596) |
| `SetSecretID` | `c *Client` | `secretID string` | - | [L636](file:///d:/claude/nomad/api/api.go#L636) |
| `configureRetries` | `c *Client` | `ro *retryOptions` | - | [L640](file:///d:/claude/nomad/api/api.go#L640) |
| `setQueryOptions` | `r *request` | `q *QueryOptions` | - | [L689](file:///d:/claude/nomad/api/api.go#L689) |
| `durToMsec` | - | `dur time.Duration` | `string` | [L737](file:///d:/claude/nomad/api/api.go#L737) |
| `setWriteOptions` | `r *request` | `q *WriteOptions` | - | [L743](file:///d:/claude/nomad/api/api.go#L743) |
| `toHTTP` | `r *request` | - | `*http.Request, error` | [L767](file:///d:/claude/nomad/api/api.go#L767) |
| `newRequest` | `c *Client` | `method string, path string` | `*request, error` | [L816](file:///d:/claude/nomad/api/api.go#L816) |
| `Close` | `m *multiCloser` | - | `error` | [L877](file:///d:/claude/nomad/api/api.go#L877) |
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
| `Context` | `o *QueryOptions` | - | `context.Context` | [L1258](file:///d:/claude/nomad/api/api.go#L1258) |
| `WithContext` | `o *QueryOptions` | `ctx context.Context` | `*QueryOptions` | [L1266](file:///d:/claude/nomad/api/api.go#L1266) |
| `Context` | `o *WriteOptions` | - | `context.Context` | [L1276](file:///d:/claude/nomad/api/api.go#L1276) |
| `WithContext` | `o *WriteOptions` | `ctx context.Context` | `*WriteOptions` | [L1284](file:///d:/claude/nomad/api/api.go#L1284) |
| `copyURL` | - | `u1 *url.URL` | `*url.URL` | [L1294](file:///d:/claude/nomad/api/api.go#L1294) |

## 5. 核心方法详解

### NewClient()

**签名**：`func NewClient(config *Config) (*Client, error)`

**位置**：[L537](file:///d:/claude/nomad/api/api.go#L537)

**功能**：创建新的 Nomad API 客户端实例。

**初始化流程**：
1. 若 `config.HttpClient == nil`，使用 `cleanhttp.DefaultPooledClient()` 创建默认 HTTP 客户端
2. 若 `config.TLSConfig` 非空，调用 `ConfigureTLS()` 应用 TLS 配置
3. 创建 `Client` 对象，初始化所有子客户端（`jobs`/`nodes`/`allocations` 等）
4. 调用 `configureRetries()` 设置默认重试策略（maxRetries=defaultNumberOfRetries）

---

### GetNodeClient() / GetNodeClientWithTimeout()

**位置**：[L577](file:///d:/claude/nomad/api/api.go#L577)、[L584](file:///d:/claude/nomad/api/api.go#L584)

**功能**：返回直连指定节点的新 `Client`，用于访问 Client-only API（如 AllocFS）。

**实现细节**（`getNodeClientImpl`）：
1. 通过 `lookup` 函数（默认为 `Nodes().Info`）查询节点信息
2. 校验节点状态：`node.Status == "down"` → 返回 `NodeDownErr`；`HTTPAddr == ""` → 报错
3. 确定区域：优先 `QueryOptions.Region`，其次 `config.Region`，最后 `GlobalRegion`
4. 调用 `config.ClientConfig()` 构建新配置（自动设置 scheme 和 TLS server name）
5. `cloneWithTimeout()` 克隆 HTTP 客户端并设置 dial 超时（失败则回退原客户端）
6. 返回 `NewClient(conf)` 创建的直连客户端

**设计目的**：部分 API（如 `/v1/client/fs/ls`）只能由 Client 节点本身服务，Server 会返回 302 重定向。此方法允许调用方直接连接 Client，避免重定向开销。`ClientConnTimeout` 全局变量（默认 1s）控制超时，对于无 Client 网络访问的部署可设为极小值。

---

### QueryOptionsWithContext() / WriteOptionsWithContext()

**功能**：为请求附加 `context.Context`，支持取消和超时。

**实现**：返回新的 Options 副本，设置内部 `ctx` 字段。后续 `queryContext()`/`writeContext()` 会将 ctx 传递给 `http.NewRequestWithContext()`。

---

### 阻塞查询（Blocking Query）支持

**位置**：`query()` 方法（内部）

**机制**：
1. 从 `QueryOptions` 提取 `WaitIndex` 和 `WaitTime`
2. 转换为 HTTP 查询参数 `index` 和 `wait`
3. Nomad Server 在 `WaitTime` 内保持连接，直到状态索引超过 `WaitIndex` 才返回
4. 响应中的 `X-Nomad-Index` 头更新 `QueryMeta.LastIndex`
5. 调用方可循环调用，用上次的 `LastIndex` 作为新的 `WaitIndex`，实现长轮询

---

### HTTP 请求构建流程

**核心方法**：`request()` / `query()` / `write()` / `putQuery()`

**统一处理**：
1. **URL 构建**：`c.endpoint(path)` 拼接基础地址 + 资源路径
2. **查询参数**：`setQueryQueryOptions()` 合并 Region/Namespace/Prefix/WaitIndex/WaitTime/Filter/PerPage/NextToken/Reverse
3. **请求头**：`setQueryHeaders()` 设置 AuthToken/自定义 Headers
4. **Context**：从 Options 获取 ctx，使用 `http.NewRequestWithContext()`
5. **响应处理**：检查状态码，解析 `X-Nomad-Index`/`X-Nomad-LastContact`/`X-Nomad-KnownLeader`/`X-Nomad-NextToken` 头到 `QueryMeta`
6. **重试**：对 PUT 请求应用 `retryOptions` 的指数退避重试

---

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

- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **流式响应**：返回 `io.ReadCloser` 或 channel，支持流式数据读取（如日志流、事件流）
- **WebSocket 支持**：使用 gorilla/websocket 进行实时双向通信（如 exec、日志流）
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api_test.go](file:///d:/claude/nomad/api/api_test.go) | 对应测试文件 |

