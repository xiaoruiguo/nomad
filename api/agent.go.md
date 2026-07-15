# agent.go 代码说明文档

> 文件路径：[agent.go](file:///d:/claude/nomad/api/agent.go)
> 总行数：620 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **Agent API 客户端**，提供 Agent 自身管理操作（成员列表、强制离开、健康检查等）的客户端方法。

## 2. 类型定义

### Agent

**定义位置**：[L17](file:///d:/claude/nomad/api/agent.go#L17)

**类型**：struct

```go
	client *Client
	nodeName string
	datacenter string
	region string
```

**关联方法**（29 个）：`Self`, `populateCache`, `NodeName`, `Datacenter`, `Region`, `Join`, `Members`, `MembersOpts`, `ForceLeave`, `ForceLeaveWithOptions`, `Servers`, `SetServers`, `ListKeys`, `Reload`, `InstallKey`, `UseKey`, `RemoveKey`, `Health`, `Host`, `Monitor`, `MonitorExport`, `monitorHelper`, `CPUProfile`, `Trace`, `Lookup`, `pprofRequest`, `GetSchedulerWorkerConfig`, `SetSchedulerWorkerConfig`, `GetSchedulerWorkersInfo`

### KeyringResponse

**定义位置**：[L28](file:///d:/claude/nomad/api/agent.go#L28)

**类型**：struct

```go
	Messages map[string]string
	Keys map[string]int
	NumNodes int
```

### KeyringRequest

**定义位置**：[L35](file:///d:/claude/nomad/api/agent.go#L35)

**类型**：struct

```go
	Key string
```

### ForceLeaveOpts

**定义位置**：[L40](file:///d:/claude/nomad/api/agent.go#L40)

**类型**：struct

```go
	Prune bool
```

### AgentReloadOpts

**定义位置**：[L226](file:///d:/claude/nomad/api/agent.go#L226)

**类型**：struct

### PprofOptions

**定义位置**：[L378](file:///d:/claude/nomad/api/agent.go#L378)

**类型**：struct

```go
	ServerID string
	NodeID string
	Seconds int
	GC int
	Debug int
```

### joinResponse

**定义位置**：[L458](file:///d:/claude/nomad/api/agent.go#L458)

**类型**：struct

```go
	NumJoined int `json:"num_joined"`
	Error string `json:"error"`
	Warning string `json:"warning"`
```

### ServerMembers

**定义位置**：[L464](file:///d:/claude/nomad/api/agent.go#L464)

**类型**：struct

```go
	ServerName string
	ServerRegion string
	ServerDC string
	Members []*AgentMember
```

### AgentSelf

**定义位置**：[L471](file:///d:/claude/nomad/api/agent.go#L471)

**类型**：struct

```go
	Config map[string]interface{} `json:"config"`
	Member AgentMember `json:"member"`
	Stats map[string]map[string]string `json:"stats"`
```

### AgentMember

**定义位置**：[L478](file:///d:/claude/nomad/api/agent.go#L478)

**类型**：struct

```go
	Name string
	Addr string
	Port uint16
	Tags map[string]string
	Status string
	ProtocolMin uint8
	ProtocolMax uint8
	ProtocolCur uint8
	DelegateMin uint8
	DelegateMax uint8
	DelegateCur uint8
```

### AgentMembersNameSort

**定义位置**：[L494](file:///d:/claude/nomad/api/agent.go#L494)

**类型定义**：`[]*AgentMember`

**关联方法**（3 个）：`Len`, `Swap`, `Less`

### AgentHealthResponse

**定义位置**：[L513](file:///d:/claude/nomad/api/agent.go#L513)

**类型**：struct

```go
	Client *AgentHealth `json:"client,omitempty"`
	Server *AgentHealth `json:"server,omitempty"`
```

### AgentHealth

**定义位置**：[L519](file:///d:/claude/nomad/api/agent.go#L519)

**类型**：struct

```go
	Ok bool `json:"ok"`
	Message string `json:"message"`
```

### HostData

**定义位置**：[L527](file:///d:/claude/nomad/api/agent.go#L527)

**类型**：struct

```go
	OS string
	Network []map[string]string
	ResolvConf string
	Hosts string
	Environment map[string]string
	Disk map[string]DiskUsage
```

### DiskUsage

**定义位置**：[L536](file:///d:/claude/nomad/api/agent.go#L536)

**类型**：struct

```go
	DiskMB int64
	UsedMB int64
```

### HostDataResponse

**定义位置**：[L541](file:///d:/claude/nomad/api/agent.go#L541)

**类型**：struct

```go
	AgentID string
	HostData *HostData `json:",omitempty"`
```

### SchedulerWorkerPoolArgs

**定义位置**：[L570](file:///d:/claude/nomad/api/agent.go#L570)

**类型**：struct

```go
	NumSchedulers int
	EnabledSchedulers []string
```

### AgentSchedulerWorkerConfigRequest

**定义位置**：[L578](file:///d:/claude/nomad/api/agent.go#L578)

**类型**：struct

```go
	NumSchedulers int `json:"num_schedulers"`
	EnabledSchedulers []string `json:"enabled_schedulers"`
```

### AgentSchedulerWorkerConfigResponse

**定义位置**：[L586](file:///d:/claude/nomad/api/agent.go#L586)

**类型**：struct

```go
	ServerID string `json:"server_id"`
	NumSchedulers int `json:"num_schedulers"`
	EnabledSchedulers []string `json:"enabled_schedulers"`
```

### AgentSchedulerWorkersInfo

**定义位置**：[L607](file:///d:/claude/nomad/api/agent.go#L607)

**类型**：struct

```go
	ServerID string `json:"server_id"`
	Schedulers []AgentSchedulerWorkerInfo `json:"schedulers"`
```

### AgentSchedulerWorkerInfo

**定义位置**：[L613](file:///d:/claude/nomad/api/agent.go#L613)

**类型**：struct

```go
	ID string `json:"id"`
	EnabledSchedulers []string `json:"enabled_schedulers"`
	Started string `json:"started"`
	Status string `json:"status"`
	WorkloadStatus string `json:"workload_status"`
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Agent` | `c *Client` | - | `*Agent` | [L47](file:///d:/claude/nomad/api/agent.go#L47) |
| `Self` | `a *Agent` | - | `*AgentSelf, error` | [L53](file:///d:/claude/nomad/api/agent.go#L53) |
| `populateCache` | `a *Agent` | `self *AgentSelf` | - | [L71](file:///d:/claude/nomad/api/agent.go#L71) |
| `NodeName` | `a *Agent` | - | `string, error` | [L88](file:///d:/claude/nomad/api/agent.go#L88) |
| `Datacenter` | `a *Agent` | - | `string, error` | [L101](file:///d:/claude/nomad/api/agent.go#L101) |
| `Region` | `a *Agent` | - | `string, error` | [L113](file:///d:/claude/nomad/api/agent.go#L113) |
| `Join` | `a *Agent` | `addrs ...string` | `int, error` | [L129](file:///d:/claude/nomad/api/agent.go#L129) |
| `Members` | `a *Agent` | - | `*ServerMembers, error` | [L152](file:///d:/claude/nomad/api/agent.go#L152) |
| `MembersOpts` | `a *Agent` | `opts *QueryOptions` | `*ServerMembers, error` | [L165](file:///d:/claude/nomad/api/agent.go#L165) |
| `ForceLeave` | `a *Agent` | `node string` | `error` | [L175](file:///d:/claude/nomad/api/agent.go#L175) |
| `ForceLeaveWithOptions` | `a *Agent` | `node string, opts ForceLeaveOpts` | `error` | [L184](file:///d:/claude/nomad/api/agent.go#L184) |
| `Servers` | `a *Agent` | - | `[]string, error` | [L195](file:///d:/claude/nomad/api/agent.go#L195) |
| `SetServers` | `a *Agent` | `addrs []string` | `error` | [L205](file:///d:/claude/nomad/api/agent.go#L205) |
| `ListKeys` | `a *Agent` | - | `*KeyringResponse, error` | [L217](file:///d:/claude/nomad/api/agent.go#L217) |
| `Reload` | `a *Agent` | `_ *AgentReloadOpts, q *WriteOptions` | `error` | [L229](file:///d:/claude/nomad/api/agent.go#L229) |
| `InstallKey` | `a *Agent` | `key string` | `*KeyringResponse, error` | [L235](file:///d:/claude/nomad/api/agent.go#L235) |
| `UseKey` | `a *Agent` | `key string` | `*KeyringResponse, error` | [L245](file:///d:/claude/nomad/api/agent.go#L245) |
| `RemoveKey` | `a *Agent` | `key string` | `*KeyringResponse, error` | [L255](file:///d:/claude/nomad/api/agent.go#L255) |
| `Health` | `a *Agent` | - | `*AgentHealthResponse, error` | [L265](file:///d:/claude/nomad/api/agent.go#L265) |
| `Host` | `a *Agent` | `serverID string, nodeID string, q *QueryOptions` | `*HostDataResponse, error` | [L289](file:///d:/claude/nomad/api/agent.go#L289) |
| `Monitor` | `a *Agent` | `stopCh chan struct{...}, q *QueryOptions` | `chan *StreamFrame, chan error` | [L316](file:///d:/claude/nomad/api/agent.go#L316) |
| `MonitorExport` | `a *Agent` | `stopCh chan struct{...}, q *QueryOptions` | `chan *StreamFrame, chan error` | [L323](file:///d:/claude/nomad/api/agent.go#L323) |
| `monitorHelper` | `a *Agent` | `stopCh chan struct{...}, q *QueryOptions, path string` | `chan *StreamFrame, chan error` | [L328](file:///d:/claude/nomad/api/agent.go#L328) |
| `CPUProfile` | `a *Agent` | `opts PprofOptions, q *QueryOptions` | `[]byte, error` | [L406](file:///d:/claude/nomad/api/agent.go#L406) |
| `Trace` | `a *Agent` | `opts PprofOptions, q *QueryOptions` | `[]byte, error` | [L417](file:///d:/claude/nomad/api/agent.go#L417) |
| `Lookup` | `a *Agent` | `profile string, opts PprofOptions, q *QueryOptions` | `[]byte, error` | [L426](file:///d:/claude/nomad/api/agent.go#L426) |
| `pprofRequest` | `a *Agent` | `req string, opts PprofOptions, q *QueryOptions` | `[]byte, error` | [L430](file:///d:/claude/nomad/api/agent.go#L430) |
| `Len` | `a *AgentMembersNameSort` | - | `int` | [L496](file:///d:/claude/nomad/api/agent.go#L496) |
| `Swap` | `a *AgentMembersNameSort` | `i int, j int` | - | [L497](file:///d:/claude/nomad/api/agent.go#L497) |
| `Less` | `a *AgentMembersNameSort` | `i int, j int` | `bool` | [L498](file:///d:/claude/nomad/api/agent.go#L498) |
| `GetSchedulerWorkerConfig` | `a *Agent` | `q *QueryOptions` | `*SchedulerWorkerPoolArgs, error` | [L547](file:///d:/claude/nomad/api/agent.go#L547) |
| `SetSchedulerWorkerConfig` | `a *Agent` | `args SchedulerWorkerPoolArgs, q *WriteOptions` | `*SchedulerWorkerPoolArgs, error` | [L558](file:///d:/claude/nomad/api/agent.go#L558) |
| `GetSchedulerWorkersInfo` | `a *Agent` | `q *QueryOptions` | `*AgentSchedulerWorkersInfo, error` | [L594](file:///d:/claude/nomad/api/agent.go#L594) |

## 5. 核心方法详解

### ListKeys()

**签名**：`func (a *Agent) ListKeys() *KeyringResponse, error`

**位置**：[L217](file:///d:/claude/nomad/api/agent.go#L217)

### GetSchedulerWorkerConfig()

**签名**：`func (a *Agent) GetSchedulerWorkerConfig(q *QueryOptions) *SchedulerWorkerPoolArgs, error`

**位置**：[L547](file:///d:/claude/nomad/api/agent.go#L547)

### GetSchedulerWorkersInfo()

**签名**：`func (a *Agent) GetSchedulerWorkersInfo(q *QueryOptions) *AgentSchedulerWorkersInfo, error`

**位置**：[L594](file:///d:/claude/nomad/api/agent.go#L594)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net/url` | 标准库 |
| `strconv` | 标准库 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [agent_test.go](file:///d:/claude/nomad/api/agent_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

