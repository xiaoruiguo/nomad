# cpu.go 代码说明文档

> 文件路径：[fingerprint/cpu.go](file:///d:/claude/nomad/client/fingerprint/cpu.go)
> 总行数：197 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。

## 2. 类型定义

### CPUFingerprint

**定义位置**：[L21](file:///d:/claude/nomad/client/fingerprint/cpu.go#L21)

**类型**：struct

```go
	StaticFingerprinter
	logger hclog.Logger
```

**关联方法**（14 个）：`Fingerprint`, `reservedCompute`, `initialize`, `setModelName`, `frequency`, `setFrequency`, `cores`, `nodes`, `setCoreCount`, `setReservableCores`, `setTotalCompute`, `setNUMA`, `setResponseResources`, `Reload`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewCPUFingerprint` | - | `logger hclog.Logger` | `Fingerprint` | [L27](file:///d:/claude/nomad/client/fingerprint/cpu.go#L27) |
| `Fingerprint` | `f *CPUFingerprint` | `request *FingerprintRequest, response *FingerprintResponse` | `error` | [L33](file:///d:/claude/nomad/client/fingerprint/cpu.go#L33) |
| `reservedCompute` | ` *CPUFingerprint` | `request *FingerprintRequest` | `structs.NodeReservedCpuResources` | [L64](file:///d:/claude/nomad/client/fingerprint/cpu.go#L64) |
| `initialize` | `f *CPUFingerprint` | `request *FingerprintRequest` | `*numalib.Topology` | [L75](file:///d:/claude/nomad/client/fingerprint/cpu.go#L75) |
| `setModelName` | `f *CPUFingerprint` | `response *FingerprintResponse` | - | [L98](file:///d:/claude/nomad/client/fingerprint/cpu.go#L98) |
| `frequency` | ` *CPUFingerprint` | `mhz hw.MHz` | `string` | [L105](file:///d:/claude/nomad/client/fingerprint/cpu.go#L105) |
| `setFrequency` | `f *CPUFingerprint` | `response *FingerprintResponse, top *numalib.Topology` | - | [L109](file:///d:/claude/nomad/client/fingerprint/cpu.go#L109) |
| `cores` | ` *CPUFingerprint` | `count int` | `string` | [L123](file:///d:/claude/nomad/client/fingerprint/cpu.go#L123) |
| `nodes` | ` *CPUFingerprint` | `count int` | `string` | [L127](file:///d:/claude/nomad/client/fingerprint/cpu.go#L127) |
| `setCoreCount` | `f *CPUFingerprint` | `response *FingerprintResponse, top *numalib.Topology` | - | [L131](file:///d:/claude/nomad/client/fingerprint/cpu.go#L131) |
| `setReservableCores` | `f *CPUFingerprint` | `response *FingerprintResponse, top *numalib.Topology` | - | [L149](file:///d:/claude/nomad/client/fingerprint/cpu.go#L149) |
| `setTotalCompute` | `f *CPUFingerprint` | `response *FingerprintResponse, top *numalib.Topology` | - | [L160](file:///d:/claude/nomad/client/fingerprint/cpu.go#L160) |
| `setNUMA` | `f *CPUFingerprint` | `response *FingerprintResponse, top *numalib.Topology` | - | [L172](file:///d:/claude/nomad/client/fingerprint/cpu.go#L172) |
| `setResponseResources` | `f *CPUFingerprint` | `response *FingerprintResponse, top *numalib.Topology` | - | [L188](file:///d:/claude/nomad/client/fingerprint/cpu.go#L188) |
| `Reload` | `f *CPUFingerprint` | - | - | [L196](file:///d:/claude/nomad/client/fingerprint/cpu.go#L196) |

## 5. 核心方法详解

### Fingerprint()

**签名**：`func (f *CPUFingerprint) Fingerprint(request *FingerprintRequest, response *FingerprintResponse) error`

**位置**：[L33](file:///d:/claude/nomad/client/fingerprint/cpu.go#L33)

**功能**：采集 CPU 指纹信息，填充节点属性和资源。

**采集内容**：
- **CPU 型号**：通过 `cpuid` 库检测 CPU 型号名称
- **频率**：从 NUMA 拓扑获取 CPU 频率（MHz）
- **核心数**：物理 CPU 核心数、总核心数、NUMA 节点数
- **可预留核心**：计算可分配给任务的核心数（总核心 - 系统预留）
- **总计算能力**：CPU 频率 × 核心数（MHz）
- **NUMA 拓扑**：NUMA 节点拓扑结构，用于调度优化
- **预留资源**：计算系统预留的 CPU 资源

**依赖**：使用 `numalib.Topology` 获取 CPU 拓扑信息，支持 NUMA 架构感知调度。

---

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `runtime` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/idset` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib/hw` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/klauspost/cpuid/v2` | 第三方库 |

## 7. 设计模式与技术特点

- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|

