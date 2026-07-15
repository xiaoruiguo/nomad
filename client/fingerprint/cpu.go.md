# cpu.go 代码说明文档

> 文件路径：[client/fingerprint/cpu.go](file:///d:/claude/nomad/client/fingerprint/cpu.go)
> 总行数：197 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），采集客户端节点的硬件和软件信息（CPU、内存、OS、网络），用于节点注册和资源上报。

## 2. 类型定义

### CPUFingerprint

**定义位置**：[L21](file:///d:/claude/nomad/client/fingerprint/cpu.go#L21)

**中文说明**：CPUFingerprint 与指纹采集（Fingerprint）相关，收集节点硬件和软件信息。

**类型**：struct

```go
type CPUFingerprint struct {
	StaticFingerprinter StaticFingerprinter
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `StaticFingerprinter` | `StaticFingerprinter` | — |
| `logger` | `hclog.Logger` | 日志记录器 |

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
| `setModelName` | `f *CPUFingerprint` | `response *FingerprintResponse` | `` | [L98](file:///d:/claude/nomad/client/fingerprint/cpu.go#L98) |
| `frequency` | ` *CPUFingerprint` | `mhz hw.MHz` | `string` | [L105](file:///d:/claude/nomad/client/fingerprint/cpu.go#L105) |
| `setFrequency` | `f *CPUFingerprint` | `response *FingerprintResponse, top *numalib.Topology` | `` | [L109](file:///d:/claude/nomad/client/fingerprint/cpu.go#L109) |
| `cores` | ` *CPUFingerprint` | `count int` | `string` | [L123](file:///d:/claude/nomad/client/fingerprint/cpu.go#L123) |
| `nodes` | ` *CPUFingerprint` | `count int` | `string` | [L127](file:///d:/claude/nomad/client/fingerprint/cpu.go#L127) |
| `setCoreCount` | `f *CPUFingerprint` | `response *FingerprintResponse, top *numalib.Topology` | `` | [L131](file:///d:/claude/nomad/client/fingerprint/cpu.go#L131) |
| `setReservableCores` | `f *CPUFingerprint` | `response *FingerprintResponse, top *numalib.Topology` | `` | [L149](file:///d:/claude/nomad/client/fingerprint/cpu.go#L149) |
| `setTotalCompute` | `f *CPUFingerprint` | `response *FingerprintResponse, top *numalib.Topology` | `` | [L160](file:///d:/claude/nomad/client/fingerprint/cpu.go#L160) |
| `setNUMA` | `f *CPUFingerprint` | `response *FingerprintResponse, top *numalib.Topology` | `` | [L172](file:///d:/claude/nomad/client/fingerprint/cpu.go#L172) |
| `setResponseResources` | `f *CPUFingerprint` | `response *FingerprintResponse, top *numalib.Topology` | `` | [L188](file:///d:/claude/nomad/client/fingerprint/cpu.go#L188) |
| `Reload` | `f *CPUFingerprint` | `` | `` | [L196](file:///d:/claude/nomad/client/fingerprint/cpu.go#L196) |

## 5. 核心方法详解

### NewCPUFingerprint()

**签名**：`func NewCPUFingerprint(logger hclog.Logger) Fingerprint`

**位置**：[L27](file:///d:/claude/nomad/client/fingerprint/cpu.go#L27)

**中文说明**：创建并返回一个新的 CPUFingerprint 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `hclog.Logger` | 日志记录器 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `Fingerprint` | — |

### Fingerprint()

**签名**：`func (f *CPUFingerprint) Fingerprint(request *FingerprintRequest, response *FingerprintResponse) error`

**位置**：[L33](file:///d:/claude/nomad/client/fingerprint/cpu.go#L33)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `request` | `*FingerprintRequest` | 请求 |
| `response` | `*FingerprintResponse` | 响应 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Reload()

**签名**：`func (f *CPUFingerprint) Reload() `

**位置**：[L196](file:///d:/claude/nomad/client/fingerprint/cpu.go#L196)

**中文说明**：重新加载对象的配置。

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

- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [arch.go](file:///d:/claude/nomad/client/fingerprint/arch.go) | 同目录源文件 |
| [bridge.go](file:///d:/claude/nomad/client/fingerprint/bridge.go) | 同目录源文件 |
| [bridge_default.go](file:///d:/claude/nomad/client/fingerprint/bridge_default.go) | 同目录源文件 |
| [bridge_linux.go](file:///d:/claude/nomad/client/fingerprint/bridge_linux.go) | 同目录源文件 |
| [cgroup.go](file:///d:/claude/nomad/client/fingerprint/cgroup.go) | 同目录源文件 |

