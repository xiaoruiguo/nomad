# structs.go 代码说明文档

> 文件路径：[client/fingerprint/structs.go](file:///d:/claude/nomad/client/fingerprint/structs.go)
> 总行数：83 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），采集客户端节点的硬件和软件信息（CPU、内存、OS、网络），用于节点注册和资源上报。

## 2. 类型定义

### FingerprintRequest

**定义位置**：[L14](file:///d:/claude/nomad/client/fingerprint/structs.go#L14)

**中文说明**：FingerprintRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type FingerprintRequest struct {
	Config *config.Config
	Node *structs.Node
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Config` | `*config.Config` | 配置 |
| `Node` | `*structs.Node` | — |

### FingerprintResponse

**定义位置**：[L21](file:///d:/claude/nomad/client/fingerprint/structs.go#L21)

**中文说明**：FingerprintResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type FingerprintResponse struct {
	Attributes map[string]string
	Links map[string]string
	NodeResources *structs.NodeResources
	Detected bool
	UpdateInitialResult func(...)
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Attributes` | `map[string]string` | 映射表 |
| `Links` | `map[string]string` | 映射表 |
| `NodeResources` | `*structs.NodeResources` | — |
| `Detected` | `bool` | 布尔值 |
| `UpdateInitialResult` | `func(...)` | — |

**关联方法**（4 个）：`AddAttribute`, `RemoveAttribute`, `AddLink`, `RemoveLink`

### InitialResult

**定义位置**：[L37](file:///d:/claude/nomad/client/fingerprint/structs.go#L37)

**中文说明**：InitialResult 是一个结果结构体，封装操作执行的结果。

**类型**：struct

```go
type InitialResult struct {
	Topology *numalib.Topology
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Topology` | `*numalib.Topology` | — |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `AddAttribute` | `f *FingerprintResponse` | `name string, value string` | `` | [L43](file:///d:/claude/nomad/client/fingerprint/structs.go#L43) |
| `RemoveAttribute` | `f *FingerprintResponse` | `name string` | `` | [L54](file:///d:/claude/nomad/client/fingerprint/structs.go#L54) |
| `AddLink` | `f *FingerprintResponse` | `name string, value string` | `` | [L64](file:///d:/claude/nomad/client/fingerprint/structs.go#L64) |
| `RemoveLink` | `f *FingerprintResponse` | `name string` | `` | [L75](file:///d:/claude/nomad/client/fingerprint/structs.go#L75) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/client/config` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [arch.go](file:///d:/claude/nomad/client/fingerprint/arch.go) | 同目录源文件 |
| [bridge.go](file:///d:/claude/nomad/client/fingerprint/bridge.go) | 同目录源文件 |
| [bridge_default.go](file:///d:/claude/nomad/client/fingerprint/bridge_default.go) | 同目录源文件 |
| [bridge_linux.go](file:///d:/claude/nomad/client/fingerprint/bridge_linux.go) | 同目录源文件 |
| [cgroup.go](file:///d:/claude/nomad/client/fingerprint/cgroup.go) | 同目录源文件 |

