# autopilot.go 代码说明文档

> 文件路径：[structs/autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go)
> 总行数：166 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### OperatorHealthReply

**定义位置**：[L14](file:///d:/claude/nomad/nomad/structs/autopilot.go#L14)

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

### ServerHealth

**定义位置**：[L48](file:///d:/claude/nomad/nomad/structs/autopilot.go#L48)

**类型**：struct

```go
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
```

### AutopilotZone

**定义位置**：[L88](file:///d:/claude/nomad/nomad/structs/autopilot.go#L88)

**类型**：struct

```go
	Servers []string
	Voters []string
	FailureTolerance int
```

### AutopilotUpgrade

**定义位置**：[L101](file:///d:/claude/nomad/nomad/structs/autopilot.go#L101)

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

**定义位置**：[L139](file:///d:/claude/nomad/nomad/structs/autopilot.go#L139)

**类型**：struct

```go
	TargetVersionVoters []string
	TargetVersionNonVoters []string
	OtherVersionVoters []string
	OtherVersionNonVoters []string
```

### RaftStats

**定义位置**：[L147](file:///d:/claude/nomad/nomad/structs/autopilot.go#L147)

**类型**：struct

```go
	LastContact string
	LastTerm uint64
	LastIndex uint64
```

**关联方法**（1 个）：`ToAutopilotServerStats`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ToAutopilotServerStats` | `s *RaftStats` | - | `*autopilot.ServerStats` | [L158](file:///d:/claude/nomad/nomad/structs/autopilot.go#L158) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `time` | 标准库 |
| `github.com/hashicorp/raft-autopilot` | 第三方库 |
| `github.com/hashicorp/serf/serf` | 第三方库 |

## 7. 设计模式与技术特点

- **Raft 共识**：使用 HashiCorp Raft 库实现分布式共识，保证状态一致性
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|

