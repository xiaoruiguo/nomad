# autopilot.go 代码说明文档

> 文件路径：[nomad/structs/autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go)
> 总行数：166 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 1 个方法/函数。

## 2. 类型定义

### OperatorHealthReply

**定义位置**：[L14](file:///d:/claude/nomad/nomad/structs/autopilot.go#L14)

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

### ServerHealth

**定义位置**：[L48](file:///d:/claude/nomad/nomad/structs/autopilot.go#L48)

**中文说明**：ServerHealth 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ServerHealth struct {
	ID string
	Name string
	Address string
	SerfStatus serf.MemberStatus
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
| `SerfStatus` | `serf.MemberStatus` | — |
| `Version` | `string` | 版本号 |
| `Leader` | `bool` | 布尔值 |
| `LastContact` | `time.Duration` | 时间间隔 |
| `LastTerm` | `uint64` | 无符号 64 位整数 |
| `LastIndex` | `uint64` | 索引值（uint64） |
| `Healthy` | `bool` | 是否健康 |
| `Voter` | `bool` | 布尔值 |
| `StableSince` | `time.Time` | 时间点 |

### AutopilotZone

**定义位置**：[L88](file:///d:/claude/nomad/nomad/structs/autopilot.go#L88)

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

**定义位置**：[L101](file:///d:/claude/nomad/nomad/structs/autopilot.go#L101)

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

**定义位置**：[L139](file:///d:/claude/nomad/nomad/structs/autopilot.go#L139)

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

### RaftStats

**定义位置**：[L147](file:///d:/claude/nomad/nomad/structs/autopilot.go#L147)

**中文说明**：RaftStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type RaftStats struct {
	LastContact string
	LastTerm uint64
	LastIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `LastContact` | `string` | 字符串 |
| `LastTerm` | `uint64` | 无符号 64 位整数 |
| `LastIndex` | `uint64` | 索引值（uint64） |

**关联方法**（1 个）：`ToAutopilotServerStats`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ToAutopilotServerStats` | `s *RaftStats` | `` | `*autopilot.ServerStats` | [L158](file:///d:/claude/nomad/nomad/structs/autopilot.go#L158) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `time` | 标准库 |
| `github.com/hashicorp/raft-autopilot` | 第三方库 |
| `github.com/hashicorp/serf/serf` | 第三方库 |

## 7. 设计模式与技术特点

- **Raft 集成**：与 HashiCorp Raft 库交互，处理共识协议相关操作
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |
| [bitmap.go](file:///d:/claude/nomad/nomad/structs/bitmap.go) | 同目录源文件 |

