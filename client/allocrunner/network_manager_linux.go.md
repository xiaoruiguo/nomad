# network_manager_linux.go 代码说明文档

> 文件路径：[allocrunner/network_manager_linux.go](file:///d:/claude/nomad/client/allocrunner/network_manager_linux.go)
> 总行数：212 行
> 所属包：`allocrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），实现分配（Allocation）的运行生命周期管理，包括预启动钩子、网络配置、Consul 集成、CSI 卷挂载、健康检查等。AllocRunner 是 Client 节点上每个分配的控制器。

**平台特定实现**：此文件为 **Linux** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

### defaultNetworkManager

**定义位置**：[L114](file:///d:/claude/nomad/client/allocrunner/network_manager_linux.go#L114)

**类型**：struct

**关联方法**（2 个）：`CreateNetwork`, `DestroyNetwork`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newNetworkManager` | - | `alloc *structs.Allocation, driverManager drivermanager.Manager` | `nm drivers.DriverNetworkManager, err error` | [L21](file:///d:/claude/nomad/client/allocrunner/network_manager_linux.go#L21) |
| `CreateNetwork` | ` *defaultNetworkManager` | `allocID string, _ *drivers.NetworkCreateRequest` | `*drivers.NetworkIsolationSpec, bool, error` | [L119](file:///d:/claude/nomad/client/allocrunner/network_manager_linux.go#L119) |
| `DestroyNetwork` | ` *defaultNetworkManager` | `allocID string, spec *drivers.NetworkIsolationSpec` | `error` | [L155](file:///d:/claude/nomad/client/allocrunner/network_manager_linux.go#L155) |
| `netModeToIsolationMode` | - | `netMode string` | `drivers.NetIsolationMode` | [L162](file:///d:/claude/nomad/client/allocrunner/network_manager_linux.go#L162) |
| `newNetworkConfigurator` | - | `log hclog.Logger, alloc *structs.Allocation, config *clientconfig.Config` | `NetworkConfigurator, error` | [L178](file:///d:/claude/nomad/client/allocrunner/network_manager_linux.go#L178) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `os` | 标准库 |
| `path` | 标准库 |
| `strings` | 标准库 |
| `syscall` | 标准库 |
| `github.com/hashicorp/nomad/client/config` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/nsutil` | 内部包 |
| `github.com/hashicorp/nomad/client/pluginmanager/drivermanager` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **平台特定实现**：通过 build tag 机制实现 Linux 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [network_manager_linux_test.go](file:///d:/claude/nomad/client/allocrunner/network_manager_linux_test.go) | 对应测试文件 |

