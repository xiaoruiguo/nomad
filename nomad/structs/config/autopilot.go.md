# autopilot.go 代码说明文档

> 文件路径：[structs/config/autopilot.go](file:///d:/claude/nomad/nomad/structs/config/autopilot.go)
> 总行数：124 行
> 所属包：`config`
> 版权：Copyright IBM Corp. 2015, 2025
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **配置结构子包**（`nomad/structs/config`），定义 Nomad 的配置数据结构（Consul、Vault、TLS、Audit、Sentinel 等），支持 HCL 解析和默认值。

## 2. 类型定义

### AutopilotConfig

**定义位置**：[L12](file:///d:/claude/nomad/nomad/structs/config/autopilot.go#L12)

**类型**：struct

```go
	CleanupDeadServers *bool `hcl:"cleanup_dead_servers"`
	ServerStabilizationTime time.Duration
	ServerStabilizationTimeHCL string `hcl:"server_stabilization_time" json:"-"`
	LastContactThreshold time.Duration
	LastContactThresholdHCL string `hcl:"last_contact_threshold" json:"-"`
	MaxTrailingLogs int `hcl:"max_trailing_logs"`
	MinQuorum int `hcl:"min_quorum"`
	EnableRedundancyZones *bool `hcl:"enable_redundancy_zones"`
	DisableUpgradeMigration *bool `hcl:"disable_upgrade_migration"`
	EnableCustomUpgrades *bool `hcl:"enable_custom_upgrades"`
	ExtraKeysHCL []string `hcl:",unusedKeys" json:"-"`
```

**关联方法**（2 个）：`Merge`, `Copy`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `DefaultAutopilotConfig` | - | - | `*AutopilotConfig` | [L54](file:///d:/claude/nomad/nomad/structs/config/autopilot.go#L54) |
| `Merge` | `a *AutopilotConfig` | `b *AutopilotConfig` | `*AutopilotConfig` | [L62](file:///d:/claude/nomad/nomad/structs/config/autopilot.go#L62) |
| `Copy` | `a *AutopilotConfig` | - | `*AutopilotConfig` | [L100](file:///d:/claude/nomad/nomad/structs/config/autopilot.go#L100) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [autopilot_test.go](file:///d:/claude/nomad/nomad/structs/config/autopilot_test.go) | 对应测试文件 |

