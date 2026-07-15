# structs.go 代码说明文档

> 文件路径：[structs/structs.go](file:///d:/claude/nomad/client/structs/structs.go)
> 总行数：418 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Client 结构体子包**（`client/structs`），定义 Client 层的数据结构（事件、统计、响应等）。

## 2. 类型定义

### RpcError

**定义位置**：[L18](file:///d:/claude/nomad/client/structs/structs.go#L18)

**类型**：struct

```go
	Message string
	Code *int64
```

**关联方法**（1 个）：`Error`

### ClientStatsResponse

**定义位置**：[L35](file:///d:/claude/nomad/client/structs/structs.go#L35)

**类型**：struct

```go
	HostStats *hoststats.HostStats
	structs.QueryMeta
```

### MonitorRequest

**定义位置**：[L41](file:///d:/claude/nomad/client/structs/structs.go#L41)

**类型**：struct

```go
	LogLevel string
	LogJSON bool
	LogIncludeLocation bool
	NodeID string
	ServerID string
	PlainText bool
	structs.QueryOptions
```

### MonitorExportRequest

**定义位置**：[L65](file:///d:/claude/nomad/client/structs/structs.go#L65)

**类型**：struct

```go
	NodeID string
	ServerID string
	ServiceName string
	Follow bool
	LogsSince string
	OnDisk bool
	NomadLogPath string
	PlainText bool
	structs.QueryOptions
```

### AllocFileInfo

**定义位置**：[L97](file:///d:/claude/nomad/client/structs/structs.go#L97)

**类型**：struct

```go
	Name string
	IsDir bool
	Size int64
	FileMode string
	ModTime time.Time
	ContentType string `json:",omitempty"`
```

### FsListRequest

**定义位置**：[L107](file:///d:/claude/nomad/client/structs/structs.go#L107)

**类型**：struct

```go
	AllocID string
	Path string
	structs.QueryOptions
```

### FsListResponse

**定义位置**：[L118](file:///d:/claude/nomad/client/structs/structs.go#L118)

**类型**：struct

```go
	Files []*AllocFileInfo
	structs.QueryMeta
```

### FsStatRequest

**定义位置**：[L126](file:///d:/claude/nomad/client/structs/structs.go#L126)

**类型**：struct

```go
	AllocID string
	Path string
	structs.QueryOptions
```

### FsStatResponse

**定义位置**：[L137](file:///d:/claude/nomad/client/structs/structs.go#L137)

**类型**：struct

```go
	Info *AllocFileInfo
	structs.QueryMeta
```

### FsStreamRequest

**定义位置**：[L145](file:///d:/claude/nomad/client/structs/structs.go#L145)

**类型**：struct

```go
	AllocID string
	Path string
	Offset int64
	Origin string
	PlainText bool
	Limit int64
	Follow bool
	structs.QueryOptions
```

### FsLogsRequest

**定义位置**：[L172](file:///d:/claude/nomad/client/structs/structs.go#L172)

**类型**：struct

```go
	AllocID string
	Task string
	LogType string
	Offset int64
	Origin string
	PlainText bool
	Follow bool
	structs.QueryOptions
```

### StreamErrWrapper

**定义位置**：[L199](file:///d:/claude/nomad/client/structs/structs.go#L199)

**类型**：struct

```go
	Error *RpcError
	Payload []byte
```

### AllocExecRequest

**定义位置**：[L208](file:///d:/claude/nomad/client/structs/structs.go#L208)

**类型**：struct

```go
	JobID string
	AllocID string
	Task string
	Tty bool
	Cmd []string
	Action string
	structs.QueryOptions
```

### AllocChecksRequest

**定义位置**：[L232](file:///d:/claude/nomad/client/structs/structs.go#L232)

**类型**：struct

```go
	structs.QueryOptions
	AllocID string
```

### AllocChecksResponse

**定义位置**：[L239](file:///d:/claude/nomad/client/structs/structs.go#L239)

**类型**：struct

```go
	structs.QueryMeta
	Results map[structs.CheckID]*structs.CheckQueryResult
```

### AllocStatsRequest

**定义位置**：[L246](file:///d:/claude/nomad/client/structs/structs.go#L246)

**类型**：struct

```go
	AllocID string
	Task string
	structs.QueryOptions
```

### AllocStatsResponse

**定义位置**：[L258](file:///d:/claude/nomad/client/structs/structs.go#L258)

**类型**：struct

```go
	Stats *AllocResourceUsage
	structs.QueryMeta
```

### MemoryStats

**定义位置**：[L264](file:///d:/claude/nomad/client/structs/structs.go#L264)

**类型**：struct

```go
	RSS uint64
	Cache uint64
	Swap uint64
	MappedFile uint64
	Usage uint64
	MaxUsage uint64
	KernelUsage uint64
	KernelMaxUsage uint64
	Measured []string
```

**关联方法**（1 个）：`Add`

### CpuStats

**定义位置**：[L295](file:///d:/claude/nomad/client/structs/structs.go#L295)

**类型**：struct

```go
	SystemMode float64
	UserMode float64
	TotalTicks float64
	ThrottledPeriods uint64
	ThrottledTime uint64
	Percent float64
	Measured []string
```

**关联方法**（1 个）：`Add`

### ResourceUsage

**定义位置**：[L322](file:///d:/claude/nomad/client/structs/structs.go#L322)

**类型**：struct

```go
	MemoryStats *MemoryStats
	CpuStats *CpuStats
	DeviceStats []*device.DeviceGroupStats
```

**关联方法**（1 个）：`Add`

### TaskResourceUsage

**定义位置**：[L336](file:///d:/claude/nomad/client/structs/structs.go#L336)

**类型**：struct

```go
	ResourceUsage *ResourceUsage
	Timestamp int64
	Pids map[string]*ResourceUsage
```

### AllocResourceUsage

**定义位置**：[L344](file:///d:/claude/nomad/client/structs/structs.go#L344)

**类型**：struct

```go
	ResourceUsage *ResourceUsage
	Tasks map[string]*TaskResourceUsage
	Timestamp int64
```

### HealthCheckRequest

**定义位置**：[L375](file:///d:/claude/nomad/client/structs/structs.go#L375)

**类型**：struct

### HealthCheckResponse

**定义位置**：[L379](file:///d:/claude/nomad/client/structs/structs.go#L379)

**类型**：struct

```go
	Drivers map[string]*structs.DriverInfo
```

**关联方法**（1 个）：`AddDriverInfo`

### HealthCheckIntervalRequest

**定义位置**：[L384](file:///d:/claude/nomad/client/structs/structs.go#L384)

**类型**：struct

### HealthCheckIntervalResponse

**定义位置**：[L385](file:///d:/claude/nomad/client/structs/structs.go#L385)

**类型**：struct

```go
	Eligible bool
	Period time.Duration
```

### NodeRegistration

**定义位置**：[L409](file:///d:/claude/nomad/client/structs/structs.go#L409)

**类型**：struct

```go
	HasRegistered bool
```

### ConsulACLToken

**定义位置**：[L413](file:///d:/claude/nomad/client/structs/structs.go#L413)

**类型**：struct

```go
	Cluster string
	TokenID string
	ACLToken string
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `CheckBufSize` | `4 * 1024` |

### 变量

| 名称 | 值 |
|------|----|
| `DriverStatsNotImplemented` | `errors.New("stats not implemented for driver")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewRpcError` | - | `err error, code *int64` | `*RpcError` | [L23](file:///d:/claude/nomad/client/structs/structs.go#L23) |
| `Error` | `r *RpcError` | - | `string` | [L30](file:///d:/claude/nomad/client/structs/structs.go#L30) |
| `Add` | `ms *MemoryStats` | `other *MemoryStats` | - | [L278](file:///d:/claude/nomad/client/structs/structs.go#L278) |
| `Add` | `cs *CpuStats` | `other *CpuStats` | - | [L307](file:///d:/claude/nomad/client/structs/structs.go#L307) |
| `Add` | `ru *ResourceUsage` | `other *ResourceUsage` | - | [L328](file:///d:/claude/nomad/client/structs/structs.go#L328) |
| `joinStringSet` | - | `s1 []string, s2 []string` | `[]string` | [L356](file:///d:/claude/nomad/client/structs/structs.go#L356) |
| `AddDriverInfo` | `h *HealthCheckResponse` | `name string, driverInfo *structs.DriverInfo` | - | [L392](file:///d:/claude/nomad/client/structs/structs.go#L392) |

## 5. 核心方法详解

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

- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|

