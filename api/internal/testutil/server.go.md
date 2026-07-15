# server.go 代码说明文档

> 文件路径：[internal/testutil/server.go](file:///d:/claude/nomad/api/internal/testutil/server.go)
> 总行数：428 行
> 所属包：`testutil`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **测试工具子包**（`api/internal/testutil`），提供 API 客户端的测试辅助工具，包括测试服务器启动、端口分配、响应写入器等。这些工具仅用于内部测试，不对外暴露。

## 2. 类型定义

### TestServerConfig

**定义位置**：[L35](file:///d:/claude/nomad/api/internal/testutil/server.go#L35)

**类型**：struct

```go
	NodeName string `json:"name,omitempty"`
	DataDir string `json:"data_dir,omitempty"`
	Region string `json:"region,omitempty"`
	DisableCheckpoint bool `json:"disable_update_check"`
	LogLevel string `json:"log_level,omitempty"`
	Consul *Consul `json:"consul,omitempty"`
	AdvertiseAddrs *Advertise `json:"advertise,omitempty"`
	Ports *PortsConfig `json:"ports,omitempty"`
	Server *ServerConfig `json:"server,omitempty"`
	Client *ClientConfig `json:"client,omitempty"`
	Vault *VaultConfig `json:"vault,omitempty"`
	ACL *ACLConfig `json:"acl,omitempty"`
	Telemetry *Telemetry `json:"telemetry,omitempty"`
	DevMode bool `json:"-"`
	Stdout, Stderr io.Writer `json:"-"`
```

### Consul

**定义位置**：[L54](file:///d:/claude/nomad/api/internal/testutil/server.go#L54)

**类型**：struct

```go
	Address string `json:"address,omitempty"`
	Auth string `json:"auth,omitempty"`
	Token string `json:"token,omitempty"`
```

### Advertise

**定义位置**：[L61](file:///d:/claude/nomad/api/internal/testutil/server.go#L61)

**类型**：struct

```go
	HTTP string `json:"http,omitempty"`
	RPC string `json:"rpc,omitempty"`
	Serf string `json:"serf,omitempty"`
```

### PortsConfig

**定义位置**：[L68](file:///d:/claude/nomad/api/internal/testutil/server.go#L68)

**类型**：struct

```go
	HTTP int `json:"http,omitempty"`
	RPC int `json:"rpc,omitempty"`
	Serf int `json:"serf,omitempty"`
```

### ServerConfig

**定义位置**：[L75](file:///d:/claude/nomad/api/internal/testutil/server.go#L75)

**类型**：struct

```go
	Enabled bool `json:"enabled"`
	BootstrapExpect int `json:"bootstrap_expect"`
	RaftProtocol int `json:"raft_protocol,omitempty"`
```

### ClientConfig

**定义位置**：[L82](file:///d:/claude/nomad/api/internal/testutil/server.go#L82)

**类型**：struct

```go
	Enabled bool `json:"enabled"`
	Options map[string]string `json:"options,omitempty"`
```

### VaultConfig

**定义位置**：[L88](file:///d:/claude/nomad/api/internal/testutil/server.go#L88)

**类型**：struct

```go
	Enabled bool `json:"enabled"`
```

### ACLConfig

**定义位置**：[L93](file:///d:/claude/nomad/api/internal/testutil/server.go#L93)

**类型**：struct

```go
	Enabled bool `json:"enabled"`
```

### Telemetry

**定义位置**：[L98](file:///d:/claude/nomad/api/internal/testutil/server.go#L98)

**类型**：struct

```go
	PrometheusMetrics bool `json:"prometheus_metrics"`
```

### ServerConfigCallback

**定义位置**：[L104](file:///d:/claude/nomad/api/internal/testutil/server.go#L104)

**类型定义**：`func(...)`

### TestServer

**定义位置**：[L142](file:///d:/claude/nomad/api/internal/testutil/server.go#L142)

**类型**：struct

```go
	cmd *exec.Cmd
	Config *TestServerConfig
	t testing.TB
	exited bool
	HTTPAddr string
	SerfAddr string
	HTTPClient *http.Client
```

**关联方法**（9 个）：`Stop`, `waitForAPI`, `waitForServers`, `waitForClient`, `url`, `requireOK`, `put`, `get`, `encodePayload`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `defaultServerConfig` | - | - | `*TestServerConfig` | [L108](file:///d:/claude/nomad/api/internal/testutil/server.go#L108) |
| `NewTestServer` | - | `t testing.TB, cb ServerConfigCallback` | `*TestServer` | [L155](file:///d:/claude/nomad/api/internal/testutil/server.go#L155) |
| `Stop` | `s *TestServer` | - | - | [L243](file:///d:/claude/nomad/api/internal/testutil/server.go#L243) |
| `waitForAPI` | `s *TestServer` | - | - | [L288](file:///d:/claude/nomad/api/internal/testutil/server.go#L288) |
| `waitForServers` | `s *TestServer` | - | - | [L313](file:///d:/claude/nomad/api/internal/testutil/server.go#L313) |
| `waitForClient` | `s *TestServer` | - | - | [L347](file:///d:/claude/nomad/api/internal/testutil/server.go#L347) |
| `url` | `s *TestServer` | `path string` | `string` | [L381](file:///d:/claude/nomad/api/internal/testutil/server.go#L381) |
| `requireOK` | `s *TestServer` | `resp *http.Response` | `error` | [L386](file:///d:/claude/nomad/api/internal/testutil/server.go#L386) |
| `put` | `s *TestServer` | `path string, body io.Reader` | `*http.Response` | [L394](file:///d:/claude/nomad/api/internal/testutil/server.go#L394) |
| `get` | `s *TestServer` | `path string` | `*http.Response` | [L409](file:///d:/claude/nomad/api/internal/testutil/server.go#L409) |
| `encodePayload` | `s *TestServer` | `payload any` | `io.Reader` | [L422](file:///d:/claude/nomad/api/internal/testutil/server.go#L422) |

## 5. 核心方法详解

### Stop()

**签名**：`func (s *TestServer) Stop() `

**位置**：[L243](file:///d:/claude/nomad/api/internal/testutil/server.go#L243)

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
| `github.com/hashicorp/nomad/api/internal/testutil/discover` | 内部包 |
| `github.com/hashicorp/go-cleanhttp` | 第三方库 |
| `github.com/shoenig/test/must` | 第三方库 |
| `github.com/shoenig/test/wait` | 第三方库 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

