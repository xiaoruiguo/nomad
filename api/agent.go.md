# agent.go 代码说明文档

> 文件路径：[api/agent.go](file:///d:/claude/nomad/api/agent.go)
> 总行数：620 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `agent.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Agent

**定义位置**：[L17](file:///d:/claude/nomad/api/agent.go#L17)

**中文说明**：Agent 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Agent struct {
	client *Client
	nodeName string
	datacenter string
	region string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |
| `nodeName` | `string` | 字符串 |
| `datacenter` | `string` | 数据中心 |
| `region` | `string` | 区域 |

**关联方法**（29 个）：`Self`, `populateCache`, `NodeName`, `Datacenter`, `Region`, `Join`, `Members`, `MembersOpts`, `ForceLeave`, `ForceLeaveWithOptions`, `Servers`, `SetServers`, `ListKeys`, `Reload`, `InstallKey`, `UseKey`, `RemoveKey`, `Health`, `Host`, `Monitor`, `MonitorExport`, `monitorHelper`, `CPUProfile`, `Trace`, `Lookup`, `pprofRequest`, `GetSchedulerWorkerConfig`, `SetSchedulerWorkerConfig`, `GetSchedulerWorkersInfo`

### KeyringResponse

**定义位置**：[L28](file:///d:/claude/nomad/api/agent.go#L28)

**中文说明**：KeyringResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type KeyringResponse struct {
	Messages map[string]string
	Keys map[string]int
	NumNodes int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Messages` | `map[string]string` | 映射表 |
| `Keys` | `map[string]int` | 映射表 |
| `NumNodes` | `int` | — |

### KeyringRequest

**定义位置**：[L35](file:///d:/claude/nomad/api/agent.go#L35)

**中文说明**：KeyringRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type KeyringRequest struct {
	Key string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Key` | `string` | 键 |

### ForceLeaveOpts

**定义位置**：[L40](file:///d:/claude/nomad/api/agent.go#L40)

**中文说明**：ForceLeaveOpts 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ForceLeaveOpts struct {
	Prune bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Prune` | `bool` | 布尔值 |

### AgentReloadOpts

**定义位置**：[L226](file:///d:/claude/nomad/api/agent.go#L226)

**中文说明**：AgentReloadOpts 是一个结构体，封装相关数据和状态。

**类型**：struct

### PprofOptions

**定义位置**：[L378](file:///d:/claude/nomad/api/agent.go#L378)

**中文说明**：PprofOptions 是一个选项结构体，提供功能配置选项。

**类型**：struct

```go
type PprofOptions struct {
	ServerID string
	NodeID string
	Seconds int
	GC int
	Debug int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ServerID` | `string` | 字符串 |
| `NodeID` | `string` | 字符串 |
| `Seconds` | `int` | — |
| `GC` | `int` | — |
| `Debug` | `int` | — |

### joinResponse

**定义位置**：[L458](file:///d:/claude/nomad/api/agent.go#L458)

**中文说明**：joinResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type joinResponse struct {
	NumJoined int `json:"num_joined"`
	Error string `json:"error"`
	Warning string `json:"warning"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NumJoined` | `int `json:"num_joined"`` | — |
| `Error` | `string `json:"error"`` | 错误信息 |
| `Warning` | `string `json:"warning"`` | 警告 |

### ServerMembers

**定义位置**：[L464](file:///d:/claude/nomad/api/agent.go#L464)

**中文说明**：ServerMembers 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ServerMembers struct {
	ServerName string
	ServerRegion string
	ServerDC string
	Members []*AgentMember
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ServerName` | `string` | 字符串 |
| `ServerRegion` | `string` | 字符串 |
| `ServerDC` | `string` | 字符串 |
| `Members` | `[]*AgentMember` | 列表 |

### AgentSelf

**定义位置**：[L471](file:///d:/claude/nomad/api/agent.go#L471)

**中文说明**：AgentSelf 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type AgentSelf struct {
	Config map[string]interface{} `json:"config"`
	Member AgentMember `json:"member"`
	Stats map[string]map[string]string `json:"stats"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Config` | `map[string]interface{} `json:"config"`` | 配置 |
| `Member` | `AgentMember `json:"member"`` | — |
| `Stats` | `map[string]map[string]string `json:"stats"`` | 映射表 |

### AgentMember

**定义位置**：[L478](file:///d:/claude/nomad/api/agent.go#L478)

**中文说明**：AgentMember 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type AgentMember struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Addr` | `string` | 地址 |
| `Port` | `uint16` | 端口 |
| `Tags` | `map[string]string` | 标签 |
| `Status` | `string` | 状态 |
| `ProtocolMin` | `uint8` | — |
| `ProtocolMax` | `uint8` | — |
| `ProtocolCur` | `uint8` | — |
| `DelegateMin` | `uint8` | — |
| `DelegateMax` | `uint8` | — |
| `DelegateCur` | `uint8` | — |

### AgentMembersNameSort

**定义位置**：[L494](file:///d:/claude/nomad/api/agent.go#L494)

**类型定义**：`type AgentMembersNameSort []*AgentMember`

**关联方法**（3 个）：`Len`, `Swap`, `Less`

### AgentHealthResponse

**定义位置**：[L513](file:///d:/claude/nomad/api/agent.go#L513)

**中文说明**：AgentHealthResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type AgentHealthResponse struct {
	Client *AgentHealth `json:"client,omitempty"`
	Server *AgentHealth `json:"server,omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Client` | `*AgentHealth `json:"client,omitempty"`` | — |
| `Server` | `*AgentHealth `json:"server,omitempty"`` | — |

### AgentHealth

**定义位置**：[L519](file:///d:/claude/nomad/api/agent.go#L519)

**中文说明**：AgentHealth 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type AgentHealth struct {
	Ok bool `json:"ok"`
	Message string `json:"message"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Ok` | `bool `json:"ok"`` | 布尔值 |
| `Message` | `string `json:"message"`` | 消息 |

### HostData

**定义位置**：[L527](file:///d:/claude/nomad/api/agent.go#L527)

**中文说明**：HostData 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type HostData struct {
	OS string
	Network []map[string]string
	ResolvConf string
	Hosts string
	Environment map[string]string
	Disk map[string]DiskUsage
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `OS` | `string` | 字符串 |
| `Network` | `[]map[string]string` | 映射表 |
| `ResolvConf` | `string` | 字符串 |
| `Hosts` | `string` | 字符串 |
| `Environment` | `map[string]string` | 映射表 |
| `Disk` | `map[string]DiskUsage` | 映射表 |

### DiskUsage

**定义位置**：[L536](file:///d:/claude/nomad/api/agent.go#L536)

**中文说明**：DiskUsage 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type DiskUsage struct {
	DiskMB int64
	UsedMB int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `DiskMB` | `int64` | — |
| `UsedMB` | `int64` | — |

### HostDataResponse

**定义位置**：[L541](file:///d:/claude/nomad/api/agent.go#L541)

**中文说明**：HostDataResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type HostDataResponse struct {
	AgentID string
	HostData *HostData `json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AgentID` | `string` | 字符串 |
| `HostData` | `*HostData `json:",omitempty"`` | — |

### SchedulerWorkerPoolArgs

**定义位置**：[L570](file:///d:/claude/nomad/api/agent.go#L570)

**中文说明**：SchedulerWorkerPoolArgs 是一个参数结构体，封装函数或方法的输入参数。

**类型**：struct

```go
type SchedulerWorkerPoolArgs struct {
	NumSchedulers int
	EnabledSchedulers []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NumSchedulers` | `int` | — |
| `EnabledSchedulers` | `[]string` | 已启用的调度器列表 |

### AgentSchedulerWorkerConfigRequest

**定义位置**：[L578](file:///d:/claude/nomad/api/agent.go#L578)

**中文说明**：AgentSchedulerWorkerConfigRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AgentSchedulerWorkerConfigRequest struct {
	NumSchedulers int `json:"num_schedulers"`
	EnabledSchedulers []string `json:"enabled_schedulers"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NumSchedulers` | `int `json:"num_schedulers"`` | — |
| `EnabledSchedulers` | `[]string `json:"enabled_schedulers"`` | 已启用的调度器列表 |

### AgentSchedulerWorkerConfigResponse

**定义位置**：[L586](file:///d:/claude/nomad/api/agent.go#L586)

**中文说明**：AgentSchedulerWorkerConfigResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type AgentSchedulerWorkerConfigResponse struct {
	ServerID string `json:"server_id"`
	NumSchedulers int `json:"num_schedulers"`
	EnabledSchedulers []string `json:"enabled_schedulers"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ServerID` | `string `json:"server_id"`` | 字符串 |
| `NumSchedulers` | `int `json:"num_schedulers"`` | — |
| `EnabledSchedulers` | `[]string `json:"enabled_schedulers"`` | 已启用的调度器列表 |

### AgentSchedulerWorkersInfo

**定义位置**：[L607](file:///d:/claude/nomad/api/agent.go#L607)

**中文说明**：AgentSchedulerWorkersInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type AgentSchedulerWorkersInfo struct {
	ServerID string `json:"server_id"`
	Schedulers []AgentSchedulerWorkerInfo `json:"schedulers"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ServerID` | `string `json:"server_id"`` | 字符串 |
| `Schedulers` | `[]AgentSchedulerWorkerInfo `json:"schedulers"`` | 列表 |

### AgentSchedulerWorkerInfo

**定义位置**：[L613](file:///d:/claude/nomad/api/agent.go#L613)

**中文说明**：AgentSchedulerWorkerInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type AgentSchedulerWorkerInfo struct {
	ID string `json:"id"`
	EnabledSchedulers []string `json:"enabled_schedulers"`
	Started string `json:"started"`
	Status string `json:"status"`
	WorkloadStatus string `json:"workload_status"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string `json:"id"`` | 唯一标识符 |
| `EnabledSchedulers` | `[]string `json:"enabled_schedulers"`` | 已启用的调度器列表 |
| `Started` | `string `json:"started"`` | 是否已启动 |
| `Status` | `string `json:"status"`` | 状态 |
| `WorkloadStatus` | `string `json:"workload_status"`` | 工作负载状态 |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Agent` | `c *Client` | `` | `*Agent` | [L47](file:///d:/claude/nomad/api/agent.go#L47) |
| `Self` | `a *Agent` | `` | `*AgentSelf, error` | [L53](file:///d:/claude/nomad/api/agent.go#L53) |
| `populateCache` | `a *Agent` | `self *AgentSelf` | `` | [L71](file:///d:/claude/nomad/api/agent.go#L71) |
| `NodeName` | `a *Agent` | `` | `string, error` | [L88](file:///d:/claude/nomad/api/agent.go#L88) |
| `Datacenter` | `a *Agent` | `` | `string, error` | [L101](file:///d:/claude/nomad/api/agent.go#L101) |
| `Region` | `a *Agent` | `` | `string, error` | [L113](file:///d:/claude/nomad/api/agent.go#L113) |
| `Join` | `a *Agent` | `addrs ...string` | `int, error` | [L129](file:///d:/claude/nomad/api/agent.go#L129) |
| `Members` | `a *Agent` | `` | `*ServerMembers, error` | [L152](file:///d:/claude/nomad/api/agent.go#L152) |
| `MembersOpts` | `a *Agent` | `opts *QueryOptions` | `*ServerMembers, error` | [L165](file:///d:/claude/nomad/api/agent.go#L165) |
| `ForceLeave` | `a *Agent` | `node string` | `error` | [L175](file:///d:/claude/nomad/api/agent.go#L175) |
| `ForceLeaveWithOptions` | `a *Agent` | `node string, opts ForceLeaveOpts` | `error` | [L184](file:///d:/claude/nomad/api/agent.go#L184) |
| `Servers` | `a *Agent` | `` | `[]string, error` | [L195](file:///d:/claude/nomad/api/agent.go#L195) |
| `SetServers` | `a *Agent` | `addrs []string` | `error` | [L205](file:///d:/claude/nomad/api/agent.go#L205) |
| `ListKeys` | `a *Agent` | `` | `*KeyringResponse, error` | [L217](file:///d:/claude/nomad/api/agent.go#L217) |
| `Reload` | `a *Agent` | `_ *AgentReloadOpts, q *WriteOptions` | `error` | [L229](file:///d:/claude/nomad/api/agent.go#L229) |
| `InstallKey` | `a *Agent` | `key string` | `*KeyringResponse, error` | [L235](file:///d:/claude/nomad/api/agent.go#L235) |
| `UseKey` | `a *Agent` | `key string` | `*KeyringResponse, error` | [L245](file:///d:/claude/nomad/api/agent.go#L245) |
| `RemoveKey` | `a *Agent` | `key string` | `*KeyringResponse, error` | [L255](file:///d:/claude/nomad/api/agent.go#L255) |
| `Health` | `a *Agent` | `` | `*AgentHealthResponse, error` | [L265](file:///d:/claude/nomad/api/agent.go#L265) |
| `Host` | `a *Agent` | `serverID string, nodeID string, q *QueryOptions` | `*HostDataResponse, error` | [L289](file:///d:/claude/nomad/api/agent.go#L289) |
| `Monitor` | `a *Agent` | `stopCh <-chan struct{...}, q *QueryOptions` | `<-chan *StreamFrame, <-chan error` | [L316](file:///d:/claude/nomad/api/agent.go#L316) |
| `MonitorExport` | `a *Agent` | `stopCh <-chan struct{...}, q *QueryOptions` | `<-chan *StreamFrame, <-chan error` | [L323](file:///d:/claude/nomad/api/agent.go#L323) |
| `monitorHelper` | `a *Agent` | `stopCh <-chan struct{...}, q *QueryOptions, path string` | `chan *StreamFrame, chan error` | [L328](file:///d:/claude/nomad/api/agent.go#L328) |
| `CPUProfile` | `a *Agent` | `opts PprofOptions, q *QueryOptions` | `[]byte, error` | [L406](file:///d:/claude/nomad/api/agent.go#L406) |
| `Trace` | `a *Agent` | `opts PprofOptions, q *QueryOptions` | `[]byte, error` | [L417](file:///d:/claude/nomad/api/agent.go#L417) |
| `Lookup` | `a *Agent` | `profile string, opts PprofOptions, q *QueryOptions` | `[]byte, error` | [L426](file:///d:/claude/nomad/api/agent.go#L426) |
| `pprofRequest` | `a *Agent` | `req string, opts PprofOptions, q *QueryOptions` | `[]byte, error` | [L430](file:///d:/claude/nomad/api/agent.go#L430) |
| `Len` | `a *AgentMembersNameSort` | `` | `int` | [L496](file:///d:/claude/nomad/api/agent.go#L496) |
| `Swap` | `a *AgentMembersNameSort` | `i int, j int` | `` | [L497](file:///d:/claude/nomad/api/agent.go#L497) |
| `Less` | `a *AgentMembersNameSort` | `i int, j int` | `bool` | [L498](file:///d:/claude/nomad/api/agent.go#L498) |
| `GetSchedulerWorkerConfig` | `a *Agent` | `q *QueryOptions` | `*SchedulerWorkerPoolArgs, error` | [L547](file:///d:/claude/nomad/api/agent.go#L547) |
| `SetSchedulerWorkerConfig` | `a *Agent` | `args SchedulerWorkerPoolArgs, q *WriteOptions` | `*SchedulerWorkerPoolArgs, error` | [L558](file:///d:/claude/nomad/api/agent.go#L558) |
| `GetSchedulerWorkersInfo` | `a *Agent` | `q *QueryOptions` | `*AgentSchedulerWorkersInfo, error` | [L594](file:///d:/claude/nomad/api/agent.go#L594) |

## 5. 核心方法详解

### Reload()

**签名**：`func (a *Agent) Reload(_ *AgentReloadOpts, q *WriteOptions) error`

**位置**：[L229](file:///d:/claude/nomad/api/agent.go#L229)

**中文说明**：重新加载对象的配置。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `_` | `*AgentReloadOpts` | — |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Lookup()

**签名**：`func (a *Agent) Lookup(profile string, opts PprofOptions, q *QueryOptions) []byte, error`

**位置**：[L426](file:///d:/claude/nomad/api/agent.go#L426)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `profile` | `string` | 字符串 |
| `opts` | `PprofOptions` | 选项 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]byte` | 字节数组 |
| `error` | 错误信息 |

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

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **对象池模式**：实现对象池，复用资源减少分配开销

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [agent_test.go](file:///d:/claude/nomad/api/agent_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |
| [constraint.go](file:///d:/claude/nomad/api/constraint.go) | 同目录源文件 |

