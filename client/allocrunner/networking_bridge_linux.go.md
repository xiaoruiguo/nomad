# networking_bridge_linux.go 代码说明文档

> 文件路径：[allocrunner/networking_bridge_linux.go](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go)
> 总行数：147 行
> 所属包：`allocrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），实现分配（Allocation）的运行生命周期管理，包括预启动钩子、网络配置、Consul 集成、CSI 卷挂载、健康检查等。AllocRunner 是 Client 节点上每个分配的控制器。

**平台特定实现**：此文件为 **Linux** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

### bridgeNetworkConfigurator

**定义位置**：[L33](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L33)

**类型**：struct

```go
	cni *cniNetworkConfigurator
	allocSubnetIPv6 string
	allocSubnetIPv4 string
	bridgeName string
	hairpinMode bool
	newIPTables func(...)
	logger hclog.Logger
```

**关联方法**（3 个）：`ensureForwardingRules`, `Setup`, `Teardown`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `defaultNomadBridgeName` | `"nomad"` |
| `bridgeNetworkAllocIfPrefix` | `"eth"` |
| `defaultNomadAllocSubnet` | `"172.26.64.0/20"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newBridgeNetworkConfigurator` | - | `log hclog.Logger, alloc *structs.Allocation, bridgeName string, ipv4Range st...` | `*bridgeNetworkConfigurator, error` | [L45](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L45) |
| `ensureForwardingRules` | `b *bridgeNetworkConfigurator` | - | `error` | [L99](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L99) |
| `Setup` | `b *bridgeNetworkConfigurator` | `ctx context.Context, alloc *structs.Allocation, spec *drivers.NetworkIsolati...` | `*structs.AllocNetworkStatus, error` | [L123](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L123) |
| `Teardown` | `b *bridgeNetworkConfigurator` | `ctx context.Context, alloc *structs.Allocation, spec *drivers.NetworkIsolati...` | `error` | [L132](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L132) |
| `buildNomadBridgeNetConfig` | - | `b bridgeNetworkConfigurator, withConsulCNI bool` | `[]byte, error` | [L136](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L136) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/cni` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **平台特定实现**：通过 build tag 机制实现 Linux 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [networking_bridge_linux_test.go](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux_test.go) | 对应测试文件 |

