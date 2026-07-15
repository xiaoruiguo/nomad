# operator_autopilot.go 代码说明文档

> 文件路径：[operator_autopilot.go](file:///d:/claude/nomad/api/operator_autopilot.go)
> 总行数：306 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **运维（Operator）API 客户端**，提供 Raft 管理、调度器配置、快照、自动舵、密钥环等运维操作的客户端方法。

## 2. 类型定义

### AutopilotConfiguration

**定义位置**：[L15](file:///d:/claude/nomad/api/operator_autopilot.go#L15)

**类型**：struct

```go
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
```

**关联方法**（2 个）：`MarshalJSON`, `UnmarshalJSON`

### ServerHealth

**定义位置**：[L100](file:///d:/claude/nomad/api/operator_autopilot.go#L100)

**类型**：struct

```go
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
```

**关联方法**（2 个）：`MarshalJSON`, `UnmarshalJSON`

### OperatorHealthReply

**定义位置**：[L171](file:///d:/claude/nomad/api/operator_autopilot.go#L171)

**类型**：struct

```go
	Healthy bool
	FailureTolerance int
	Servers []ServerHealth
	Leader string
	Voters []string
	ReadReplicas []string `json:",omitempty"`
	RedundancyZones map[string]AutopilotZone `json:",omitempty"`
	Upgrade *AutopilotUpgrade `json:",omitempty"`
	OptimisticFailureTolerance int `json:",omitempty"`
```

### AutopilotZone

**定义位置**：[L205](file:///d:/claude/nomad/api/operator_autopilot.go#L205)

**类型**：struct

```go
	Servers []string
	Voters []string
	FailureTolerance int
```

### AutopilotUpgrade

**定义位置**：[L218](file:///d:/claude/nomad/api/operator_autopilot.go#L218)

**类型**：struct

```go
	Status string
	TargetVersion string
	TargetVersionVoters []string
	TargetVersionNonVoters []string
	TargetVersionReadReplicas []string
	OtherVersionVoters []string
	OtherVersionNonVoters []string
	OtherVersionReadReplicas []string
	RedundancyZones map[string]AutopilotZoneUpgradeVersions
```

### AutopilotZoneUpgradeVersions

**定义位置**：[L256](file:///d:/claude/nomad/api/operator_autopilot.go#L256)

**类型**：struct

```go
	TargetVersionVoters []string
	TargetVersionNonVoters []string
	OtherVersionVoters []string
	OtherVersionNonVoters []string
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `MarshalJSON` | `u *AutopilotConfiguration` | - | `[]byte, error` | [L60](file:///d:/claude/nomad/api/operator_autopilot.go#L60) |
| `UnmarshalJSON` | `u *AutopilotConfiguration` | `data []byte` | `error` | [L73](file:///d:/claude/nomad/api/operator_autopilot.go#L73) |
| `MarshalJSON` | `u *ServerHealth` | - | `[]byte, error` | [L139](file:///d:/claude/nomad/api/operator_autopilot.go#L139) |
| `UnmarshalJSON` | `u *ServerHealth` | `data []byte` | `error` | [L150](file:///d:/claude/nomad/api/operator_autopilot.go#L150) |
| `AutopilotGetConfiguration` | `op *Operator` | `q *QueryOptions` | `*AutopilotConfiguration, *QueryMeta, error` | [L264](file:///d:/claude/nomad/api/operator_autopilot.go#L264) |
| `AutopilotSetConfiguration` | `op *Operator` | `conf *AutopilotConfiguration, q *WriteOptions` | `*WriteMeta, error` | [L274](file:///d:/claude/nomad/api/operator_autopilot.go#L274) |
| `AutopilotCASConfiguration` | `op *Operator` | `conf *AutopilotConfiguration, q *WriteOptions` | `bool, *WriteMeta, error` | [L286](file:///d:/claude/nomad/api/operator_autopilot.go#L286) |
| `AutopilotServerHealth` | `op *Operator` | `q *QueryOptions` | `*OperatorHealthReply, *QueryMeta, error` | [L298](file:///d:/claude/nomad/api/operator_autopilot.go#L298) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |
| `strconv` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

