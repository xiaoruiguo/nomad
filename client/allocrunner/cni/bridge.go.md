# bridge.go 代码说明文档

> 文件路径：[allocrunner/cni/bridge.go](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go)
> 总行数：93 行
> 所属包：`cni`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CNI 网络子包**（`client/allocrunner/cni`），实现 CNI（容器网络接口）插件调用，为分配配置网络命名空间。

## 2. 类型定义

### Conflist

**定义位置**：[L9](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go#L9)

**类型**：struct

```go
	CniVersion string `json:"cniVersion"`
	Name string `json:"name"`
	Plugins []any `json:"plugins"`
```

**关联方法**（1 个）：`Json`

### NomadBridgeConfig

**定义位置**：[L21](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go#L21)

**类型**：struct

```go
	BridgeName string
	AdminChainName string
	IPv4Subnet string
	IPv6Subnet string
	HairpinMode bool
	ConsulCNI bool
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Json` | `b *Conflist` | - | `[]byte, error` | [L16](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go#L16) |
| `NewNomadBridgeConflist` | - | `conf NomadBridgeConfig` | `Conflist` | [L31](file:///d:/claude/nomad/client/allocrunner/cni/bridge.go#L31) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [bridge_test.go](file:///d:/claude/nomad/client/allocrunner/cni/bridge_test.go) | 对应测试文件 |

