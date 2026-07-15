# operator_autopilot.go 代码说明文档

> 文件路径：[api/operator_autopilot.go](file:///d:/claude/nomad/api/operator_autopilot.go)
> 总行数：306 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `operator_autopilot.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### AutopilotConfiguration

**定义位置**：[L15](file:///d:/claude/nomad/api/operator_autopilot.go#L15)

**中文说明**：AutopilotConfiguration 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type AutopilotConfiguration struct {
	CleanupDeadServers bool
	LastContactThreshold time.Duration
	MaxTrailingLogs uint64
	MinQuorum uint
	ServerStabilizationTime time.Duration
	EnableRedundancyZones bool
	DisableUpgradeMigration bool
	EnableCustomUpgrades bool
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CleanupDeadServers` | `bool` | 布尔值 |
| `LastContactThreshold` | `time.Duration` | 时间间隔 |
| `MaxTrailingLogs` | `uint64` | 无符号 64 位整数 |
| `MinQuorum` | `uint` | — |
| `ServerStabilizationTime` | `time.Duration` | 时间间隔 |
| `EnableRedundancyZones` | `bool` | 布尔值 |
| `DisableUpgradeMigration` | `bool` | 布尔值 |
| `EnableCustomUpgrades` | `bool` | 布尔值 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（2 个）：`MarshalJSON`, `UnmarshalJSON`

### ServerHealth

**定义位置**：[L100](file:///d:/claude/nomad/api/operator_autopilot.go#L100)

**中文说明**：ServerHealth 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ServerHealth struct {
	ID string
	Name string
	Address string
	SerfStatus string
	Version string
	Leader bool
	LastContact time.Duration
	LastTerm uint64
	LastIndex uint64
	Healthy bool
	Voter bool
	StableSince time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Name` | `string` | 名称 |
| `Address` | `string` | 地址 |
| `SerfStatus` | `string` | 字符串 |
| `Version` | `string` | 版本号 |
| `Leader` | `bool` | 布尔值 |
| `LastContact` | `time.Duration` | 时间间隔 |
| `LastTerm` | `uint64` | 无符号 64 位整数 |
| `LastIndex` | `uint64` | 索引值（uint64） |
| `Healthy` | `bool` | 是否健康 |
| `Voter` | `bool` | 布尔值 |
| `StableSince` | `time.Time` | 时间点 |

**关联方法**（2 个）：`MarshalJSON`, `UnmarshalJSON`

### OperatorHealthReply

**定义位置**：[L171](file:///d:/claude/nomad/api/operator_autopilot.go#L171)

**中文说明**：OperatorHealthReply 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type OperatorHealthReply struct {
	Healthy bool
	FailureTolerance int
	Servers []ServerHealth
	Leader string
	Voters []string
	ReadReplicas []string `json:",omitempty"`
	RedundancyZones map[string]AutopilotZone `json:",omitempty"`
	Upgrade *AutopilotUpgrade `json:",omitempty"`
	OptimisticFailureTolerance int `json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Healthy` | `bool` | 是否健康 |
| `FailureTolerance` | `int` | — |
| `Servers` | `[]ServerHealth` | 列表 |
| `Leader` | `string` | 字符串 |
| `Voters` | `[]string` | 列表 |
| `ReadReplicas` | `[]string `json:",omitempty"`` | 列表 |
| `RedundancyZones` | `map[string]AutopilotZone `json:",omitempty"`` | 映射表 |
| `Upgrade` | `*AutopilotUpgrade `json:",omitempty"`` | — |
| `OptimisticFailureTolerance` | `int `json:",omitempty"`` | — |

### AutopilotZone

**定义位置**：[L205](file:///d:/claude/nomad/api/operator_autopilot.go#L205)

**中文说明**：AutopilotZone 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type AutopilotZone struct {
	Servers []string
	Voters []string
	FailureTolerance int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Servers` | `[]string` | 列表 |
| `Voters` | `[]string` | 列表 |
| `FailureTolerance` | `int` | — |

### AutopilotUpgrade

**定义位置**：[L218](file:///d:/claude/nomad/api/operator_autopilot.go#L218)

**中文说明**：AutopilotUpgrade 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type AutopilotUpgrade struct {
	Status string
	TargetVersion string
	TargetVersionVoters []string
	TargetVersionNonVoters []string
	TargetVersionReadReplicas []string
	OtherVersionVoters []string
	OtherVersionNonVoters []string
	OtherVersionReadReplicas []string
	RedundancyZones map[string]AutopilotZoneUpgradeVersions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Status` | `string` | 状态 |
| `TargetVersion` | `string` | 字符串 |
| `TargetVersionVoters` | `[]string` | 列表 |
| `TargetVersionNonVoters` | `[]string` | 列表 |
| `TargetVersionReadReplicas` | `[]string` | 列表 |
| `OtherVersionVoters` | `[]string` | 列表 |
| `OtherVersionNonVoters` | `[]string` | 列表 |
| `OtherVersionReadReplicas` | `[]string` | 列表 |
| `RedundancyZones` | `map[string]AutopilotZoneUpgradeVersions` | 映射表 |

### AutopilotZoneUpgradeVersions

**定义位置**：[L256](file:///d:/claude/nomad/api/operator_autopilot.go#L256)

**中文说明**：AutopilotZoneUpgradeVersions 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type AutopilotZoneUpgradeVersions struct {
	TargetVersionVoters []string
	TargetVersionNonVoters []string
	OtherVersionVoters []string
	OtherVersionNonVoters []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TargetVersionVoters` | `[]string` | 列表 |
| `TargetVersionNonVoters` | `[]string` | 列表 |
| `OtherVersionVoters` | `[]string` | 列表 |
| `OtherVersionNonVoters` | `[]string` | 列表 |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `MarshalJSON` | `u *AutopilotConfiguration` | `` | `[]byte, error` | [L60](file:///d:/claude/nomad/api/operator_autopilot.go#L60) |
| `UnmarshalJSON` | `u *AutopilotConfiguration` | `data []byte` | `error` | [L73](file:///d:/claude/nomad/api/operator_autopilot.go#L73) |
| `MarshalJSON` | `u *ServerHealth` | `` | `[]byte, error` | [L139](file:///d:/claude/nomad/api/operator_autopilot.go#L139) |
| `UnmarshalJSON` | `u *ServerHealth` | `data []byte` | `error` | [L150](file:///d:/claude/nomad/api/operator_autopilot.go#L150) |
| `AutopilotGetConfiguration` | `op *Operator` | `q *QueryOptions` | `*AutopilotConfiguration, *QueryMeta, error` | [L264](file:///d:/claude/nomad/api/operator_autopilot.go#L264) |
| `AutopilotSetConfiguration` | `op *Operator` | `conf *AutopilotConfiguration, q *WriteOptions` | `*WriteMeta, error` | [L274](file:///d:/claude/nomad/api/operator_autopilot.go#L274) |
| `AutopilotCASConfiguration` | `op *Operator` | `conf *AutopilotConfiguration, q *WriteOptions` | `bool, *WriteMeta, error` | [L286](file:///d:/claude/nomad/api/operator_autopilot.go#L286) |
| `AutopilotServerHealth` | `op *Operator` | `q *QueryOptions` | `*OperatorHealthReply, *QueryMeta, error` | [L298](file:///d:/claude/nomad/api/operator_autopilot.go#L298) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |
| `strconv` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

