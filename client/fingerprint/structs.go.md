# structs.go 代码说明文档

> 文件路径：[fingerprint/structs.go](file:///d:/claude/nomad/client/fingerprint/structs.go)
> 总行数：83 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。

## 2. 类型定义

### FingerprintRequest

**定义位置**：[L14](file:///d:/claude/nomad/client/fingerprint/structs.go#L14)

**类型**：struct

```go
	Config *config.Config
	Node *structs.Node
```

### FingerprintResponse

**定义位置**：[L21](file:///d:/claude/nomad/client/fingerprint/structs.go#L21)

**类型**：struct

```go
	Attributes map[string]string
	Links map[string]string
	NodeResources *structs.NodeResources
	Detected bool
	UpdateInitialResult func(...)
```

**关联方法**（4 个）：`AddAttribute`, `RemoveAttribute`, `AddLink`, `RemoveLink`

### InitialResult

**定义位置**：[L37](file:///d:/claude/nomad/client/fingerprint/structs.go#L37)

**类型**：struct

```go
	Topology *numalib.Topology
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `AddAttribute` | `f *FingerprintResponse` | `name string, value string` | - | [L43](file:///d:/claude/nomad/client/fingerprint/structs.go#L43) |
| `RemoveAttribute` | `f *FingerprintResponse` | `name string` | - | [L54](file:///d:/claude/nomad/client/fingerprint/structs.go#L54) |
| `AddLink` | `f *FingerprintResponse` | `name string, value string` | - | [L64](file:///d:/claude/nomad/client/fingerprint/structs.go#L64) |
| `RemoveLink` | `f *FingerprintResponse` | `name string` | - | [L75](file:///d:/claude/nomad/client/fingerprint/structs.go#L75) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/client/config` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Client 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|

