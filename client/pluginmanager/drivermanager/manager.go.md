# manager.go 代码说明文档

> 文件路径：[pluginmanager/drivermanager/manager.go](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go)
> 总行数：400 行
> 所属包：`drivermanager`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **驱动插件管理器子包**（`client/pluginmanager/drivermanager`），管理任务驱动插件（docker、exec 等）的注册和健康监控。

## 2. 类型定义

### Manager

**定义位置**：[L27](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L27)

**类型**：interface

```go
	pluginmanager.PluginManager
	Dispense
```

### TaskExecHandler

**定义位置**：[L36](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L36)

**类型定义**：`func(...)`

### EventHandler

**定义位置**：[L44](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L44)

**类型定义**：`func(...)`

### TaskEventHandlerFactory

**定义位置**：[L47](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L47)

**类型定义**：`func(...)`

### StateStorage

**定义位置**：[L51](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L51)

**类型**：interface

```go
	GetDriverPluginState
	PutDriverPluginState
```

### UpdateNodeDriverInfoFn

**定义位置**：[L63](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L63)

**类型定义**：`func(...)`

### StorePluginReattachFn

**定义位置**：[L66](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L66)

**类型定义**：`func(...)`

### FetchPluginReattachFn

**定义位置**：[L70](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L70)

**类型定义**：`func(...)`

### Config

**定义位置**：[L73](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L73)

**类型**：struct

```go
	Logger log.Logger
	Loader loader.PluginCatalog
	PluginConfig *base.AgentConfig
	Updater UpdateNodeDriverInfoFn
	EventHandlerFactory TaskEventHandlerFactory
	State StateStorage
	AllowedDrivers map[string]struct{...}
	BlockedDrivers map[string]struct{...}
```

### manager

**定义位置**：[L101](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L101)

**类型**：struct

```go
	logger log.Logger
	state StateStorage
	ctx context.Context
	cancel context.CancelFunc
	loader loader.PluginCatalog
	pluginConfig *base.AgentConfig
	updater UpdateNodeDriverInfoFn
	eventHandlerFactory TaskEventHandlerFactory
	instances map[string]*instanceManager
	instancesMu sync.RWMutex
	reattachConfigs map[loader.PluginID]*pstructs.ReattachConfig
	reattachConfigLock sync.Mutex
	allowedDrivers map[string]struct{...}
	blockedDrivers map[string]struct{...}
	readyCh chan struct{...}
```

**关联方法**（11 个）：`PluginType`, `Run`, `Shutdown`, `WaitForFirstFingerprint`, `waitForFirstFingerprint`, `loadReattachConfigs`, `shutdownBlockedDriver`, `storePluginReattachConfig`, `fetchPluginReattachConfig`, `Dispense`, `isDriverBlocked`

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `ErrDriverNotFound` | `fmt.Errorf("driver not found")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `New` | - | `c *Config` | `*manager` | [L142](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L142) |
| `PluginType` | ` *manager` | - | `string` | [L162](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L162) |
| `Run` | `m *manager` | - | - | [L166](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L166) |
| `Shutdown` | `m *manager` | - | - | [L222](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L222) |
| `WaitForFirstFingerprint` | `m *manager` | `ctx context.Context` | `chan struct{...}` | [L235](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L235) |
| `waitForFirstFingerprint` | `m *manager` | `ctx context.Context, cancel context.CancelFunc` | - | [L241](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L241) |
| `loadReattachConfigs` | `m *manager` | - | `error` | [L284](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L284) |
| `shutdownBlockedDriver` | `m *manager` | `name string, reattach *pstructs.ReattachConfig` | - | [L315](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L315) |
| `storePluginReattachConfig` | `m *manager` | `id loader.PluginID, c *plugin.ReattachConfig` | `error` | [L337](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L337) |
| `fetchPluginReattachConfig` | `m *manager` | `id loader.PluginID` | `*plugin.ReattachConfig, bool` | [L362](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L362) |
| `Dispense` | `m *manager` | `d string` | `drivers.DriverPlugin, error` | [L378](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L378) |
| `isDriverBlocked` | `m *manager` | `name string` | `bool` | [L388](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L388) |

## 5. 核心方法详解

### 架构概述

DriverManager 管理 Nomad 任务驱动插件（docker、exec、java、qemu、rawexec 等）的生命周期。负责：
1. 从插件目录加载内置驱动
2. 初始化驱动插件实例
3. 监控驱动健康状态
4. 提供 `Dispense()` 接口供 AllocRunner/TaskRunner 获取驱动实例
5. 支持驱动阻塞/允许列表
6. 持久化驱动重连配置（reattach config）

---

### New()

**签名**：`func New(c *Config) *manager`

**位置**：[L142](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L142)

**功能**：创建驱动管理器，初始化实例表、重连配置表、允许/阻塞列表。

---

### Run()

**签名**：`func (m *manager) Run()`

**位置**：[L166](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L166)

**功能**：启动驱动管理器主循环。

**流程**：
1. 从状态数据库加载重连配置（`loadReattachConfigs`）
2. 等待首次指纹完成（`waitForFirstFingerprint`）
3. 遍历插件目录，为每个驱动创建 `instanceManager`
4. 启动每个 `instanceManager`，加载插件并初始化
5. 监控插件健康状态，必要时重启插件
6. 关闭时优雅停止所有插件实例

---

### Dispense()

**功能**：根据驱动名称返回驱动实例。供 TaskRunner 启动任务时调用。

---

### Shutdown()

**签名**：`func (m *manager) Shutdown()`

**位置**：[L222](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L222)

**功能**：关闭所有驱动插件实例，保存重连配置。

---

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/client/pluginmanager` | 内部包 |
| `github.com/hashicorp/nomad/client/pluginmanager/drivermanager/state` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/loader` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-plugin` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **插件架构**：使用 `go-plugin` 框架实现插件化扩展

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [manager_test.go](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager_test.go) | 对应测试文件 |

