# networking_bridge_linux.go 代码说明文档

> 文件路径：[client/allocrunner/networking_bridge_linux.go](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go)
> 总行数：147 行
> 所属包：`allocrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

**平台特定实现**：此文件为 **Linux** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

### bridgeNetworkConfigurator

**定义位置**：[L33](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L33)

**中文说明**：bridgeNetworkConfigurator 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type bridgeNetworkConfigurator struct {
	cni *cniNetworkConfigurator
	allocSubnetIPv6 string
	allocSubnetIPv4 string
	bridgeName string
	hairpinMode bool
	newIPTables func(...)
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `cni` | `*cniNetworkConfigurator` | — |
| `allocSubnetIPv6` | `string` | 字符串 |
| `allocSubnetIPv4` | `string` | 字符串 |
| `bridgeName` | `string` | 字符串 |
| `hairpinMode` | `bool` | 布尔值 |
| `newIPTables` | `func(...)` | — |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（3 个）：`ensureForwardingRules`, `Setup`, `Teardown`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `defaultNomadBridgeName` | `—` | `"nomad"` | — |
| `bridgeNetworkAllocIfPrefix` | `—` | `"eth"` | — |
| `defaultNomadAllocSubnet` | `—` | `"172.26.64.0/20"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newBridgeNetworkConfigurator` | - | `log hclog.Logger, alloc *structs.Allocation, bridgeName string, ipv4Range str...` | `*bridgeNetworkConfigurator, error` | [L45](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L45) |
| `ensureForwardingRules` | `b *bridgeNetworkConfigurator` | `` | `error` | [L99](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L99) |
| `Setup` | `b *bridgeNetworkConfigurator` | `ctx context.Context, alloc *structs.Allocation, spec *drivers.NetworkIsolatio...` | `*structs.AllocNetworkStatus, error` | [L123](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L123) |
| `Teardown` | `b *bridgeNetworkConfigurator` | `ctx context.Context, alloc *structs.Allocation, spec *drivers.NetworkIsolatio...` | `error` | [L132](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L132) |
| `buildNomadBridgeNetConfig` | - | `b bridgeNetworkConfigurator, withConsulCNI bool` | `[]byte, error` | [L136](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux.go#L136) |

## 5. 核心方法详解

该文件无导出的核心方法。

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
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **平台特定实现**：通过 build tag 机制实现 Linux 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [networking_bridge_linux_test.go](file:///d:/claude/nomad/client/allocrunner/networking_bridge_linux_test.go) | 对应测试文件 |
| [alloc_runner.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go) | 同目录源文件 |
| [alloc_runner_ce.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_ce.go) | 同目录源文件 |
| [alloc_runner_hooks.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_hooks.go) | 同目录源文件 |
| [allocdir_hook.go](file:///d:/claude/nomad/client/allocrunner/allocdir_hook.go) | 同目录源文件 |
| [checks_hook.go](file:///d:/claude/nomad/client/allocrunner/checks_hook.go) | 同目录源文件 |

