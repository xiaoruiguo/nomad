# structs.go 代码说明文档

> 文件路径：[client/structs/structs.go](file:///d:/claude/nomad/client/structs/structs.go)
> 总行数：418 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **客户端子包**（`client/`），实现 Nomad 客户端的功能组件。

## 2. 类型定义

### RpcError

**定义位置**：[L18](file:///d:/claude/nomad/client/structs/structs.go#L18)

**中文说明**：RpcError 是一个错误类型，描述特定的错误情况。

**类型**：struct

```go
type RpcError struct {
	Message string
	Code *int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Message` | `string` | 消息 |
| `Code` | `*int64` | — |

**关联方法**（1 个）：`Error`

### ClientStatsResponse

**定义位置**：[L35](file:///d:/claude/nomad/client/structs/structs.go#L35)

**中文说明**：ClientStatsResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type ClientStatsResponse struct {
	HostStats *hoststats.HostStats
	structs.QueryMeta structs.QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `HostStats` | `*hoststats.HostStats` | — |
| `structs.QueryMeta` | `structs.QueryMeta` | — |

### MonitorRequest

**定义位置**：[L41](file:///d:/claude/nomad/client/structs/structs.go#L41)

**中文说明**：MonitorRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type MonitorRequest struct {
	LogLevel string
	LogJSON bool
	LogIncludeLocation bool
	NodeID string
	ServerID string
	PlainText bool
	structs.QueryOptions structs.QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `LogLevel` | `string` | 字符串 |
| `LogJSON` | `bool` | 布尔值 |
| `LogIncludeLocation` | `bool` | 布尔值 |
| `NodeID` | `string` | 字符串 |
| `ServerID` | `string` | 字符串 |
| `PlainText` | `bool` | 布尔值 |
| `structs.QueryOptions` | `structs.QueryOptions` | — |

### MonitorExportRequest

**定义位置**：[L65](file:///d:/claude/nomad/client/structs/structs.go#L65)

**中文说明**：MonitorExportRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type MonitorExportRequest struct {
	NodeID string
	ServerID string
	ServiceName string
	Follow bool
	LogsSince string
	OnDisk bool
	NomadLogPath string
	PlainText bool
	structs.QueryOptions structs.QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `NodeID` | `string` | 字符串 |
| `ServerID` | `string` | 字符串 |
| `ServiceName` | `string` | 字符串 |
| `Follow` | `bool` | 布尔值 |
| `LogsSince` | `string` | 字符串 |
| `OnDisk` | `bool` | 布尔值 |
| `NomadLogPath` | `string` | 字符串 |
| `PlainText` | `bool` | 布尔值 |
| `structs.QueryOptions` | `structs.QueryOptions` | — |

### AllocFileInfo

**定义位置**：[L97](file:///d:/claude/nomad/client/structs/structs.go#L97)

**中文说明**：AllocFileInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type AllocFileInfo struct {
	Name string
	IsDir bool
	Size int64
	FileMode string
	ModTime time.Time
	ContentType string `json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `IsDir` | `bool` | 布尔值 |
| `Size` | `int64` | 大小 |
| `FileMode` | `string` | 字符串 |
| `ModTime` | `time.Time` | 时间点 |
| `ContentType` | `string `json:",omitempty"`` | 字符串 |

### FsListRequest

**定义位置**：[L107](file:///d:/claude/nomad/client/structs/structs.go#L107)

**中文说明**：FsListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type FsListRequest struct {
	AllocID string
	Path string
	structs.QueryOptions structs.QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `Path` | `string` | 路径 |
| `structs.QueryOptions` | `structs.QueryOptions` | — |

### FsListResponse

**定义位置**：[L118](file:///d:/claude/nomad/client/structs/structs.go#L118)

**中文说明**：FsListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type FsListResponse struct {
	Files []*AllocFileInfo
	structs.QueryMeta structs.QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Files` | `[]*AllocFileInfo` | 列表 |
| `structs.QueryMeta` | `structs.QueryMeta` | — |

### FsStatRequest

**定义位置**：[L126](file:///d:/claude/nomad/client/structs/structs.go#L126)

**中文说明**：FsStatRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type FsStatRequest struct {
	AllocID string
	Path string
	structs.QueryOptions structs.QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `Path` | `string` | 路径 |
| `structs.QueryOptions` | `structs.QueryOptions` | — |

### FsStatResponse

**定义位置**：[L137](file:///d:/claude/nomad/client/structs/structs.go#L137)

**中文说明**：FsStatResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type FsStatResponse struct {
	Info *AllocFileInfo
	structs.QueryMeta structs.QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Info` | `*AllocFileInfo` | 信息 |
| `structs.QueryMeta` | `structs.QueryMeta` | — |

### FsStreamRequest

**定义位置**：[L145](file:///d:/claude/nomad/client/structs/structs.go#L145)

**中文说明**：FsStreamRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type FsStreamRequest struct {
	AllocID string
	Path string
	Offset int64
	Origin string
	PlainText bool
	Limit int64
	Follow bool
	structs.QueryOptions structs.QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `Path` | `string` | 路径 |
| `Offset` | `int64` | 偏移量 |
| `Origin` | `string` | 字符串 |
| `PlainText` | `bool` | 布尔值 |
| `Limit` | `int64` | 限制 |
| `Follow` | `bool` | 布尔值 |
| `structs.QueryOptions` | `structs.QueryOptions` | — |

### FsLogsRequest

**定义位置**：[L172](file:///d:/claude/nomad/client/structs/structs.go#L172)

**中文说明**：FsLogsRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type FsLogsRequest struct {
	AllocID string
	Task string
	LogType string
	Offset int64
	Origin string
	PlainText bool
	Follow bool
	structs.QueryOptions structs.QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `Task` | `string` | 字符串 |
| `LogType` | `string` | 字符串 |
| `Offset` | `int64` | 偏移量 |
| `Origin` | `string` | 字符串 |
| `PlainText` | `bool` | 布尔值 |
| `Follow` | `bool` | 布尔值 |
| `structs.QueryOptions` | `structs.QueryOptions` | — |

### StreamErrWrapper

**定义位置**：[L199](file:///d:/claude/nomad/client/structs/structs.go#L199)

**中文说明**：StreamErrWrapper 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type StreamErrWrapper struct {
	Error *RpcError
	Payload []byte
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Error` | `*RpcError` | 错误信息 |
| `Payload` | `[]byte` | 载荷 is 载荷 |

### AllocExecRequest

**定义位置**：[L208](file:///d:/claude/nomad/client/structs/structs.go#L208)

**中文说明**：AllocExecRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocExecRequest struct {
	JobID string
	AllocID string
	Task string
	Tty bool
	Cmd []string
	Action string
	structs.QueryOptions structs.QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `AllocID` | `string` | 字符串 |
| `Task` | `string` | 字符串 |
| `Tty` | `bool` | 布尔值 |
| `Cmd` | `[]string` | 列表 |
| `Action` | `string` | 字符串 |
| `structs.QueryOptions` | `structs.QueryOptions` | — |

### AllocChecksRequest

**定义位置**：[L232](file:///d:/claude/nomad/client/structs/structs.go#L232)

**中文说明**：AllocChecksRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocChecksRequest struct {
	structs.QueryOptions structs.QueryOptions
	AllocID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `structs.QueryOptions` | `structs.QueryOptions` | — |
| `AllocID` | `string` | 字符串 |

### AllocChecksResponse

**定义位置**：[L239](file:///d:/claude/nomad/client/structs/structs.go#L239)

**中文说明**：AllocChecksResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type AllocChecksResponse struct {
	structs.QueryMeta structs.QueryMeta
	Results map[structs.CheckID]*structs.CheckQueryResult
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `structs.QueryMeta` | `structs.QueryMeta` | — |
| `Results` | `map[structs.CheckID]*structs.CheckQueryResult` | 映射表 |

### AllocStatsRequest

**定义位置**：[L246](file:///d:/claude/nomad/client/structs/structs.go#L246)

**中文说明**：AllocStatsRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type AllocStatsRequest struct {
	AllocID string
	Task string
	structs.QueryOptions structs.QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocID` | `string` | 字符串 |
| `Task` | `string` | 字符串 |
| `structs.QueryOptions` | `structs.QueryOptions` | — |

### AllocStatsResponse

**定义位置**：[L258](file:///d:/claude/nomad/client/structs/structs.go#L258)

**中文说明**：AllocStatsResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type AllocStatsResponse struct {
	Stats *AllocResourceUsage
	structs.QueryMeta structs.QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Stats` | `*AllocResourceUsage` | — |
| `structs.QueryMeta` | `structs.QueryMeta` | — |

### MemoryStats

**定义位置**：[L264](file:///d:/claude/nomad/client/structs/structs.go#L264)

**中文说明**：MemoryStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type MemoryStats struct {
	RSS uint64
	Cache uint64
	Swap uint64
	MappedFile uint64
	Usage uint64
	MaxUsage uint64
	KernelUsage uint64
	KernelMaxUsage uint64
	Measured []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `RSS` | `uint64` | 无符号 64 位整数 |
| `Cache` | `uint64` | 无符号 64 位整数 |
| `Swap` | `uint64` | 无符号 64 位整数 |
| `MappedFile` | `uint64` | 无符号 64 位整数 |
| `Usage` | `uint64` | 无符号 64 位整数 |
| `MaxUsage` | `uint64` | 无符号 64 位整数 |
| `KernelUsage` | `uint64` | 无符号 64 位整数 |
| `KernelMaxUsage` | `uint64` | 无符号 64 位整数 |
| `Measured` | `[]string` | 列表 |

**关联方法**（1 个）：`Add`

### CpuStats

**定义位置**：[L295](file:///d:/claude/nomad/client/structs/structs.go#L295)

**中文说明**：CpuStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type CpuStats struct {
	SystemMode float64
	UserMode float64
	TotalTicks float64
	ThrottledPeriods uint64
	ThrottledTime uint64
	Percent float64
	Measured []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `SystemMode` | `float64` | — |
| `UserMode` | `float64` | — |
| `TotalTicks` | `float64` | — |
| `ThrottledPeriods` | `uint64` | 无符号 64 位整数 |
| `ThrottledTime` | `uint64` | 无符号 64 位整数 |
| `Percent` | `float64` | — |
| `Measured` | `[]string` | 列表 |

**关联方法**（1 个）：`Add`

### ResourceUsage

**定义位置**：[L322](file:///d:/claude/nomad/client/structs/structs.go#L322)

**中文说明**：ResourceUsage 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ResourceUsage struct {
	MemoryStats *MemoryStats
	CpuStats *CpuStats
	DeviceStats []*device.DeviceGroupStats
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MemoryStats` | `*MemoryStats` | — |
| `CpuStats` | `*CpuStats` | — |
| `DeviceStats` | `[]*device.DeviceGroupStats` | 列表 |

**关联方法**（1 个）：`Add`

### TaskResourceUsage

**定义位置**：[L336](file:///d:/claude/nomad/client/structs/structs.go#L336)

**中文说明**：TaskResourceUsage 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskResourceUsage struct {
	ResourceUsage *ResourceUsage
	Timestamp int64
	Pids map[string]*ResourceUsage
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ResourceUsage` | `*ResourceUsage` | — |
| `Timestamp` | `int64` | 时间戳 |
| `Pids` | `map[string]*ResourceUsage` | 映射表 |

### AllocResourceUsage

**定义位置**：[L344](file:///d:/claude/nomad/client/structs/structs.go#L344)

**中文说明**：AllocResourceUsage 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocResourceUsage struct {
	ResourceUsage *ResourceUsage
	Tasks map[string]*TaskResourceUsage
	Timestamp int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ResourceUsage` | `*ResourceUsage` | — |
| `Tasks` | `map[string]*TaskResourceUsage` | 映射表 |
| `Timestamp` | `int64` | 时间戳 |

### HealthCheckRequest

**定义位置**：[L375](file:///d:/claude/nomad/client/structs/structs.go#L375)

**中文说明**：HealthCheckRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

### HealthCheckResponse

**定义位置**：[L379](file:///d:/claude/nomad/client/structs/structs.go#L379)

**中文说明**：HealthCheckResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type HealthCheckResponse struct {
	Drivers map[string]*structs.DriverInfo
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Drivers` | `map[string]*structs.DriverInfo` | 映射表 |

**关联方法**（1 个）：`AddDriverInfo`

### HealthCheckIntervalRequest

**定义位置**：[L384](file:///d:/claude/nomad/client/structs/structs.go#L384)

**中文说明**：HealthCheckIntervalRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

### HealthCheckIntervalResponse

**定义位置**：[L385](file:///d:/claude/nomad/client/structs/structs.go#L385)

**中文说明**：HealthCheckIntervalResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type HealthCheckIntervalResponse struct {
	Eligible bool
	Period time.Duration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Eligible` | `bool` | 布尔值 |
| `Period` | `time.Duration` | 时间间隔 |

### NodeRegistration

**定义位置**：[L409](file:///d:/claude/nomad/client/structs/structs.go#L409)

**中文说明**：NodeRegistration 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeRegistration struct {
	HasRegistered bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `HasRegistered` | `bool` | 布尔值 |

### ConsulACLToken

**定义位置**：[L413](file:///d:/claude/nomad/client/structs/structs.go#L413)

**中文说明**：ConsulACLToken 与 Consul 集成相关，用于服务发现和配置管理。

**类型**：struct

```go
type ConsulACLToken struct {
	Cluster string
	TokenID string
	ACLToken string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Cluster` | `string` | 字符串 |
| `TokenID` | `string` | 字符串 |
| `ACLToken` | `string` | 字符串 |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `CheckBufSize` | `—` | `4 * 1024` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `DriverStatsNotImplemented` | `—` | `errors.New("stats not implemented for driver")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewRpcError` | - | `err error, code *int64` | `*RpcError` | [L23](file:///d:/claude/nomad/client/structs/structs.go#L23) |
| `Error` | `r *RpcError` | `` | `string` | [L30](file:///d:/claude/nomad/client/structs/structs.go#L30) |
| `Add` | `ms *MemoryStats` | `other *MemoryStats` | `` | [L278](file:///d:/claude/nomad/client/structs/structs.go#L278) |
| `Add` | `cs *CpuStats` | `other *CpuStats` | `` | [L307](file:///d:/claude/nomad/client/structs/structs.go#L307) |
| `Add` | `ru *ResourceUsage` | `other *ResourceUsage` | `` | [L328](file:///d:/claude/nomad/client/structs/structs.go#L328) |
| `joinStringSet` | - | `s1 []string, s2 []string` | `[]string` | [L356](file:///d:/claude/nomad/client/structs/structs.go#L356) |
| `AddDriverInfo` | `h *HealthCheckResponse` | `name string, driverInfo *structs.DriverInfo` | `` | [L392](file:///d:/claude/nomad/client/structs/structs.go#L392) |

## 5. 核心方法详解

### NewRpcError()

**签名**：`func NewRpcError(err error, code *int64) *RpcError`

**位置**：[L23](file:///d:/claude/nomad/client/structs/structs.go#L23)

**中文说明**：创建并返回一个新的 RpcError 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `err` | `error` | 错误信息 |
| `code` | `*int64` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*RpcError` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/hoststats` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/device` | 内部包 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [allochook.go](file:///d:/claude/nomad/client/structs/allochook.go) | 同目录源文件 |
| [broadcaster.go](file:///d:/claude/nomad/client/structs/broadcaster.go) | 同目录源文件 |
| [csi.go](file:///d:/claude/nomad/client/structs/csi.go) | 同目录源文件 |
| [enum.go](file:///d:/claude/nomad/client/structs/enum.go) | 同目录源文件 |
| [host_volumes.go](file:///d:/claude/nomad/client/structs/host_volumes.go) | 同目录源文件 |

