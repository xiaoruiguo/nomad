# network_hook.go 代码说明文档

> 文件路径：[client/allocrunner/network_hook.go](file:///d:/claude/nomad/client/allocrunner/network_hook.go)
> 总行数：224 行
> 所属包：`allocrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### networkIsolationSetter

**定义位置**：[L35](file:///d:/claude/nomad/client/allocrunner/network_hook.go#L35)

**中文说明**：networkIsolationSetter 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type networkIsolationSetter interface {
	SetNetworkIsolation func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `SetNetworkIsolation` | `func(...)` | — |

### allocNetworkIsolationSetter

**定义位置**：[L42](file:///d:/claude/nomad/client/allocrunner/network_hook.go#L42)

**中文说明**：allocNetworkIsolationSetter 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type allocNetworkIsolationSetter struct {
	ar *allocRunner
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ar` | `*allocRunner` | — |

**关联方法**（1 个）：`SetNetworkIsolation`

### networkStatus

**定义位置**：[L52](file:///d:/claude/nomad/client/allocrunner/network_hook.go#L52)

**中文说明**：networkStatus 是一个状态结构体，描述对象或操作的当前状态。

**类型**：interface

```go
type networkStatus interface {
	SetNetworkStatus func(...)
	NetworkStatus func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `SetNetworkStatus` | `func(...)` | — |
| `NetworkStatus` | `func(...)` | — |

### networkHook

**定义位置**：[L59](file:///d:/claude/nomad/client/allocrunner/network_hook.go#L59)

**中文说明**：networkHook 是一个钩子，在特定生命周期节点执行自定义逻辑。

**类型**：struct

```go
type networkHook struct {
	isolationSetter networkIsolationSetter
	networkStatus networkStatus
	manager drivers.DriverNetworkManager
	alloc *structs.Allocation
	spec *drivers.NetworkIsolationSpec
	networkConfigurator NetworkConfigurator
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `isolationSetter` | `networkIsolationSetter` | — |
| `networkStatus` | `networkStatus` | — |
| `manager` | `drivers.DriverNetworkManager` | — |
| `alloc` | `*structs.Allocation` | — |
| `spec` | `*drivers.NetworkIsolationSpec` | — |
| `networkConfigurator` | `NetworkConfigurator` | — |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（3 个）：`Name`, `Prerun`, `Postrun`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `dockerNetSpecLabelKey` | `—` | `"docker_sandbox_container_id"` | — |
| `dockerNetSpecHostnameKey` | `—` | `"docker_sandbox_hostname"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ErrCNICheckFailed` | `—` | `errors.New("network namespace already exists but was misc...` | — |
| `_` | `interfaces.RunnerPrerunHook` | `(*networkHook)(nil)` | — |
| `_` | `interfaces.RunnerPostrunHook` | `(*networkHook)(nil)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `SetNetworkIsolation` | `a *allocNetworkIsolationSetter` | `n *drivers.NetworkIsolationSpec` | `` | [L46](file:///d:/claude/nomad/client/allocrunner/network_hook.go#L46) |
| `newNetworkHook` | - | `logger hclog.Logger, ns networkIsolationSetter, alloc *structs.Allocation, ne...` | `*networkHook` | [L86](file:///d:/claude/nomad/client/allocrunner/network_hook.go#L86) |
| `Name` | `h *networkHook` | `` | `string` | [L109](file:///d:/claude/nomad/client/allocrunner/network_hook.go#L109) |
| `Prerun` | `h *networkHook` | `allocEnv *taskenv.TaskEnv` | `error` | [L113](file:///d:/claude/nomad/client/allocrunner/network_hook.go#L113) |
| `Postrun` | `h *networkHook` | `` | `error` | [L212](file:///d:/claude/nomad/client/allocrunner/network_hook.go#L212) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/miekg/dns` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [network_hook_test.go](file:///d:/claude/nomad/client/allocrunner/network_hook_test.go) | 对应测试文件 |
| [alloc_runner.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go) | 同目录源文件 |
| [alloc_runner_ce.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_ce.go) | 同目录源文件 |
| [alloc_runner_hooks.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner_hooks.go) | 同目录源文件 |
| [allocdir_hook.go](file:///d:/claude/nomad/client/allocrunner/allocdir_hook.go) | 同目录源文件 |
| [checks_hook.go](file:///d:/claude/nomad/client/allocrunner/checks_hook.go) | 同目录源文件 |

