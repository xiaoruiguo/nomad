# fingerprint.go 代码说明文档

> 文件路径：[fingerprint/fingerprint.go](file:///d:/claude/nomad/client/fingerprint/fingerprint.go)
> 总行数：145 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。

## 2. 类型定义

### Factory

**定义位置**：[L96](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L96)

**类型定义**：`func(...)`

### HealthCheck

**定义位置**：[L101](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L101)

**类型**：interface

```go
	HealthCheck
	GetHealthCheckInterval
```

### Fingerprint

**定义位置**：[L117](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L117)

**类型**：interface

```go
	Fingerprint
	Periodic
```

### ReloadableFingerprint

**定义位置**：[L133](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L133)

**类型**：interface

```go
	Fingerprint
	Reload
```

### StaticFingerprinter

**定义位置**：[L140](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L140)

**类型**：struct

**关联方法**（1 个）：`Periodic`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `EmptyDuration` | `time.Duration(0)` |
| `TightenNetworkTimeoutsConfig` | `"test.tighten_network_timeouts"` |

### 变量

| 名称 | 值 |
|------|----|
| `hostFingerprinters` | `map[string]Factory{...}` |
| `envFingerprinters` | `map[string]Factory{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `init` | - | - | - | [L24](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L24) |
| `BuiltinFingerprints` | - | - | `[]string` | [L66](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L66) |
| `NewFingerprint` | - | `name string, logger log.Logger` | `Fingerprint, error` | [L80](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L80) |
| `Periodic` | `s *StaticFingerprinter` | - | `bool, time.Duration` | [L142](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L142) |

## 5. 核心方法详解

### Fingerprint 接口

**位置**：[L117](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L117)

**职责**：定义节点指纹采集接口。每个实现检测节点的一项能力（CPU、内存、网络等）。

**方法**：
- `Fingerprint(request, response)` — 执行指纹采集，填充 `FingerprintResponse` 中的节点属性和资源
- `Periodic()` — 返回是否需要周期性运行及间隔

### HealthCheck 接口

**位置**：[L101](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L101)

**职责**：定义周期性健康检查接口（如 Consul/Vault 连通性检查）。

### ReloadableFingerprint 接口

**位置**：[L133](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L133)

**职责**：支持配置热重载的指纹采集器。Client reload 时调用 `Reload()` 后立即调用 `Fingerprint()`。

### StaticFingerprinter

**位置**：[L140](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L140)

**职责**：嵌入基类，使指纹采集器变为非周期性（只运行一次）。

---

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `sort` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [fingerprint_test.go](file:///d:/claude/nomad/client/fingerprint/fingerprint_test.go) | 对应测试文件 |

