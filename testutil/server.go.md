# server.go 代码说明文档

> 文件路径：[testutil/server.go](file:///d:/claude/nomad/testutil/server.go)
> 总行数：481 行
> 所属包：`testutil`
> 版权：Copyright IBM Corp. 2015, 2025
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **测试工具子包**（`testutil/`），提供 Nomad 测试的基础设施，包括测试服务器启动（`server.go`）、TLS 配置、Vault 集成、HTTP 响应记录器和等待/重试工具，用于单元测试和集成测试。

## 2. 类型定义

### TestServerConfig

**定义位置**：[L36](file:///d:/claude/nomad/testutil/server.go#L36)

**类型**：struct

```go
	NodeName string `json:"name,omitempty"`
	DataDir string `json:"data_dir,omitempty"`
	Region string `json:"region,omitempty"`
	DisableCheckpoint bool `json:"disable_update_check"`
	LogLevel string `json:"log_level,omitempty"`
	Consuls []*Consul `json:"consul,omitempty"`
	AdvertiseAddrs *Advertise `json:"advertise,omitempty"`
	Ports *PortsConfig `json:"ports,omitempty"`
	Server *ServerConfig `json:"server,omitempty"`
	Client *ClientConfig `json:"client,omitempty"`
	Vaults []*VaultConfig `json:"vault,omitempty"`
	ACL *ACLConfig `json:"acl,omitempty"`
	DevMode bool `json:"-"`
	DevConnectMode bool `json:"-"`
	Stdout, Stderr io.Writer `json:"-"`
```

### Consul

**定义位置**：[L55](file:///d:/claude/nomad/testutil/server.go#L55)

**类型**：struct

```go
	Name string `json:"name,omitempty"`
	Address string `json:"address,omitempty"`
	Auth string `json:"auth,omitempty"`
	Token string `json:"token,omitempty"`
	ServiceIdentity *WorkloadIdentityConfig `json:"service_identity,omitempty"`
	ServiceIdentityAuthMethod string `json:"service_auth_method,omitempty"`
	TaskIdentity *WorkloadIdentityConfig `json:"task_identity,omitempty"`
	TaskIdentityAuthMethod string `json:"task_auth_method,omitempty"`
```

### WorkloadIdentityConfig

**定义位置**：[L67](file:///d:/claude/nomad/testutil/server.go#L67)

**类型**：struct

```go
	Audience []string `json:"aud"`
	Env bool `json:"env"`
	File bool `json:"file"`
	TTL string `json:"ttl"`
	ExtraClaims map[string]string `json:"extra_claims,omitempty"`
```

### Advertise

**定义位置**：[L76](file:///d:/claude/nomad/testutil/server.go#L76)

**类型**：struct

```go
	HTTP string `json:"http,omitempty"`
	RPC string `json:"rpc,omitempty"`
	Serf string `json:"serf,omitempty"`
```

### PortsConfig

**定义位置**：[L83](file:///d:/claude/nomad/testutil/server.go#L83)

**类型**：struct

```go
	HTTP int `json:"http,omitempty"`
	RPC int `json:"rpc,omitempty"`
	Serf int `json:"serf,omitempty"`
```

### ServerConfig

**定义位置**：[L90](file:///d:/claude/nomad/testutil/server.go#L90)

**类型**：struct

```go
	Enabled bool `json:"enabled"`
	BootstrapExpect int `json:"bootstrap_expect"`
	RaftProtocol int `json:"raft_protocol,omitempty"`
```

### ClientConfig

**定义位置**：[L97](file:///d:/claude/nomad/testutil/server.go#L97)

**类型**：struct

```go
	Enabled bool `json:"enabled"`
	TotalCompute int `json:"cpu_total_compute"`
```

### VaultConfig

**定义位置**：[L103](file:///d:/claude/nomad/testutil/server.go#L103)

**类型**：struct

```go
	Name string `json:"name,omitempty"`
	Enabled bool `json:"enabled"`
	Address string `json:"address"`
	AllowUnauthenticated *bool `json:"allow_unauthenticated,omitempty"`
	Token string `json:"token,omitempty"`
	Role string `json:"role,omitempty"`
	JWTAuthBackendPath string `json:"jwt_auth_backend_path,omitempty"`
	DefaultIdentity *WorkloadIdentityConfig `json:"default_identity,omitempty"`
```

### ACLConfig

**定义位置**：[L115](file:///d:/claude/nomad/testutil/server.go#L115)

**类型**：struct

```go
	Enabled bool `json:"enabled"`
	BootstrapToken string `json:"-"`
```

### ServerConfigCallback

**定义位置**：[L122](file:///d:/claude/nomad/testutil/server.go#L122)

**类型定义**：`func(...)`

### TestServer

**定义位置**：[L155](file:///d:/claude/nomad/testutil/server.go#L155)

**类型**：struct

```go
	cmd *exec.Cmd
	Config *TestServerConfig
	t testing.TB
	HTTPAddr string
	SerfAddr string
	HTTPClient *http.Client
```

**关联方法**（10 个）：`Stop`, `bootstrapSelf`, `waitForAPI`, `waitForServers`, `waitForClient`, `url`, `requireOK`, `put`, `get`, `encodePayload`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `defaultServerConfig` | - | - | `*TestServerConfig` | [L126](file:///d:/claude/nomad/testutil/server.go#L126) |
| `NewTestServer` | - | `t testing.TB, cb ServerConfigCallback` | `*TestServer` | [L167](file:///d:/claude/nomad/testutil/server.go#L167) |
| `Stop` | `s *TestServer` | - | - | [L271](file:///d:/claude/nomad/testutil/server.go#L271) |
| `bootstrapSelf` | `s *TestServer` | - | - | [L307](file:///d:/claude/nomad/testutil/server.go#L307) |
| `waitForAPI` | `s *TestServer` | - | - | [L331](file:///d:/claude/nomad/testutil/server.go#L331) |
| `waitForServers` | `s *TestServer` | - | - | [L352](file:///d:/claude/nomad/testutil/server.go#L352) |
| `waitForClient` | `s *TestServer` | - | - | [L384](file:///d:/claude/nomad/testutil/server.go#L384) |
| `url` | `s *TestServer` | `path string` | `string` | [L429](file:///d:/claude/nomad/testutil/server.go#L429) |
| `requireOK` | `s *TestServer` | `resp *http.Response` | `error` | [L434](file:///d:/claude/nomad/testutil/server.go#L434) |
| `put` | `s *TestServer` | `path string, body io.Reader` | `*http.Response` | [L442](file:///d:/claude/nomad/testutil/server.go#L442) |
| `get` | `s *TestServer` | `path string` | `*http.Response` | [L459](file:///d:/claude/nomad/testutil/server.go#L459) |
| `encodePayload` | `s *TestServer` | `payload interface{}` | `io.Reader` | [L473](file:///d:/claude/nomad/testutil/server.go#L473) |

## 5. 核心方法详解

### NewTestServer()

**签名**：`func NewTestServer(t testing.TB, cb ServerConfigCallback) *TestServer`

**位置**：[L167](file:///d:/claude/nomad/testutil/server.go#L167)

### Stop()

**签名**：`func (s *TestServer) Stop() `

**位置**：[L271](file:///d:/claude/nomad/testutil/server.go#L271)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `encoding/json` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net/http` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `testing` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/ci` | 内部包 |
| `github.com/hashicorp/nomad/helper/discover` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/go-cleanhttp` | 第三方库 |
| `github.com/shoenig/test/must` | 第三方库 |

## 7. 设计模式与技术特点

- **IO 操作**：涉及文件或数据流的读写操作
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **测试工具**：提供测试辅助工具，便于编写单元测试和集成测试

## 8. 相关文件

| 文件 | 关系 |
|------|------|

