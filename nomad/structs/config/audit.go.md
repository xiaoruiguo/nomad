# audit.go 代码说明文档

> 文件路径：[structs/config/audit.go](file:///d:/claude/nomad/nomad/structs/config/audit.go)
> 总行数：221 行
> 所属包：`config`
> 版权：Copyright IBM Corp. 2015, 2025
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **配置结构子包**（`nomad/structs/config`），定义 Nomad 的配置数据结构（Consul、Vault、TLS、Audit、Sentinel 等），支持 HCL 解析和默认值。

## 2. 类型定义

### AuditConfig

**定义位置**：[L14](file:///d:/claude/nomad/nomad/structs/config/audit.go#L14)

**类型**：struct

```go
	Enabled *bool `hcl:"enabled"`
	Sinks []*AuditSink `hcl:"sink"`
	Filters []*AuditFilter `hcl:"filter"`
	ExtraKeysHCL []string `hcl:",unusedKeys" json:"-"`
```

**关联方法**（2 个）：`Copy`, `Merge`

### AuditSink

**定义位置**：[L29](file:///d:/claude/nomad/nomad/structs/config/audit.go#L29)

**类型**：struct

```go
	Name string `hcl:",key"`
	DeliveryGuarantee string `hcl:"delivery_guarantee"`
	Type string `hcl:"type"`
	Format string `hcl:"format"`
	Path string `hcl:"path"`
	RotateDuration time.Duration
	RotateDurationHCL string `hcl:"rotate_duration" json:"-"`
	RotateBytes int `hcl:"rotate_bytes"`
	RotateMaxFiles int `hcl:"rotate_max_files"`
	Mode string `hcl:"mode"`
```

**关联方法**（1 个）：`Copy`

### AuditFilter

**定义位置**：[L62](file:///d:/claude/nomad/nomad/structs/config/audit.go#L62)

**类型**：struct

```go
	Name string `hcl:",key"`
	Type string `hcl:"type"`
	Endpoints []string `hcl:"endpoints"`
	Stages []string `hcl:"stages"`
	Operations []string `hcl:"operations"`
```

**关联方法**（1 个）：`Copy`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Copy` | `a *AuditConfig` | - | `*AuditConfig` | [L80](file:///d:/claude/nomad/nomad/structs/config/audit.go#L80) |
| `Merge` | `a *AuditConfig` | `b *AuditConfig` | `*AuditConfig` | [L101](file:///d:/claude/nomad/nomad/structs/config/audit.go#L101) |
| `Copy` | `a *AuditSink` | - | `*AuditSink` | [L125](file:///d:/claude/nomad/nomad/structs/config/audit.go#L125) |
| `Copy` | `a *AuditFilter` | - | `*AuditFilter` | [L136](file:///d:/claude/nomad/nomad/structs/config/audit.go#L136) |
| `copySliceAuditFilter` | - | `a []*AuditFilter` | `[]*AuditFilter` | [L152](file:///d:/claude/nomad/nomad/structs/config/audit.go#L152) |
| `auditFilterSliceMerge` | - | `a []*AuditFilter, b []*AuditFilter` | `[]*AuditFilter` | [L166](file:///d:/claude/nomad/nomad/structs/config/audit.go#L166) |
| `copySliceAuditSink` | - | `a []*AuditSink` | `[]*AuditSink` | [L187](file:///d:/claude/nomad/nomad/structs/config/audit.go#L187) |
| `auditSinkSliceMerge` | - | `a []*AuditSink, b []*AuditSink` | `[]*AuditSink` | [L201](file:///d:/claude/nomad/nomad/structs/config/audit.go#L201) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `slices` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [audit_test.go](file:///d:/claude/nomad/nomad/structs/config/audit_test.go) | 对应测试文件 |

