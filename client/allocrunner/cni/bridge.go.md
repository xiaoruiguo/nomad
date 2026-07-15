# bridge.go 代码说明文档

> 文件路径：[client/allocrunner/cni/bridge.go](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go)
> 总行数：93 行
> 所属包：`cni`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### Conflist

**定义位置**：[L9](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go#L9)

**中文说明**：Conflist 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Conflist struct {
	CniVersion string `json:"cniVersion"`
	Name string `json:"name"`
	Plugins []any `json:"plugins"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `CniVersion` | `string `json:"cniVersion"`` | 字符串 |
| `Name` | `string `json:"name"`` | 名称 |
| `Plugins` | `[]any `json:"plugins"`` | 列表 |

**关联方法**（1 个）：`Json`

### NomadBridgeConfig

**定义位置**：[L21](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go#L21)

**中文说明**：NomadBridgeConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type NomadBridgeConfig struct {
	BridgeName string
	AdminChainName string
	IPv4Subnet string
	IPv6Subnet string
	HairpinMode bool
	ConsulCNI bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `BridgeName` | `string` | 字符串 |
| `AdminChainName` | `string` | 字符串 |
| `IPv4Subnet` | `string` | 字符串 |
| `IPv6Subnet` | `string` | 字符串 |
| `HairpinMode` | `bool` | 布尔值 |
| `ConsulCNI` | `bool` | 布尔值 |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Json` | `b *Conflist` | `` | `[]byte, error` | [L16](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go#L16) |
| `NewNomadBridgeConflist` | - | `conf NomadBridgeConfig` | `Conflist` | [L31](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go#L31) |

## 5. 核心方法详解

### NewNomadBridgeConflist()

**签名**：`func NewNomadBridgeConflist(conf NomadBridgeConfig) Conflist`

**位置**：[L31](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go#L31)

**中文说明**：创建并返回一个新的 NomadBridgeConflist 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `conf` | `NomadBridgeConfig` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `Conflist` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [bridge_test.go](file:///d:/claude/nomad/client/allocrunner/cni/bridge_test.go) | 对应测试文件 |
| [plugins.go](file:///d:/claude/nomad/client/allocrunner/cni/plugins.go) | 同目录源文件 |

