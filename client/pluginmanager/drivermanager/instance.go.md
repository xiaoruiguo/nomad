# instance.go 代码说明文档

> 文件路径：[pluginmanager/drivermanager/instance.go](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go)
> 总行数：521 行
> 所属包：`drivermanager`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **驱动插件管理器子包**（`client/pluginmanager/drivermanager`），管理任务驱动插件（docker、exec 等）的注册和健康监控。

## 2. 类型定义

### instanceManagerConfig

**定义位置**：[L37](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L37)

**类型**：struct

```go
	Logger log.Logger
	Ctx context.Context
	Loader loader.PluginCatalog
	StoreReattach StorePluginReattachFn
	FetchReattach FetchPluginReattachFn
	PluginConfig *base.AgentConfig
	ID *loader.PluginID
	UpdateNodeFromDriver UpdateNodeDriverInfoFn
	EventHandlerFactory TaskEventHandlerFactory
```

### instanceManager

**定义位置**：[L67](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L67)

**类型**：struct

```go
	logger log.Logger
	ctx context.Context
	cancel context.CancelFunc
	loader loader.PluginCatalog
	storeReattach StorePluginReattachFn
	fetchReattach FetchPluginReattachFn
	pluginConfig *base.AgentConfig
	id *loader.PluginID
	plugin loader.PluginInstance
	driver drivers.DriverPlugin
	pluginLock sync.Mutex
	shutdownLock sync.Mutex
	updateNodeFromDriver UpdateNodeDriverInfoFn
	eventHandlerFactory TaskEventHandlerFactory
	firstFingerprintCh chan struct{...}
	hasFingerprinted bool
	lastHealthState drivers.HealthState
	lastHealthStateMu sync.Mutex
```

**关联方法**（12 个）：`WaitForFirstFingerprint`, `run`, `dispense`, `cleanup`, `dispenseFingerprintCh`, `fingerprint`, `handleFingerprintError`, `handleFingerprint`, `getLastHealth`, `dispenseTaskEventsCh`, `handleEvents`, `handleEvent`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `driverFPBackoffBaseline` | `5 * time.Second` |
| `driverFPBackoffLimit` | `2 * time.Minute` |
| `driverShutdownTimeout` | `2 * time.Second` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newInstanceManager` | - | `c *instanceManagerConfig` | `*instanceManager` | [L123](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L123) |
| `WaitForFirstFingerprint` | `i *instanceManager` | `ctx context.Context` | - | [L146](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L146) |
| `run` | `i *instanceManager` | - | - | [L156](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L156) |
| `dispense` | `i *instanceManager` | - | `plugin drivers.DriverPlugin, err error` | [L187](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L187) |
| `cleanup` | `i *instanceManager` | - | - | [L257](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L257) |
| `dispenseFingerprintCh` | `i *instanceManager` | - | `chan *drivers.Fingerprint, context.CancelFunc, error` | [L306](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L306) |
| `fingerprint` | `i *instanceManager` | - | - | [L323](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L323) |
| `handleFingerprintError` | `i *instanceManager` | - | - | [L387](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L387) |
| `handleFingerprint` | `i *instanceManager` | `fp *drivers.Fingerprint` | - | [L397](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L397) |
| `getLastHealth` | `i *instanceManager` | - | `drivers.HealthState` | [L430](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L430) |
| `dispenseTaskEventsCh` | `i *instanceManager` | - | `chan *drivers.TaskEvent, context.CancelFunc, error` | [L439](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L439) |
| `handleEvents` | `i *instanceManager` | - | - | [L456](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L456) |
| `handleEvent` | `i *instanceManager` | `ev *drivers.TaskEvent` | - | [L506](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance.go#L506) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/loader` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/singleton` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [instance_test.go](file:///d:/claude/nomad/client/pluginmanager/drivermanager/instance_test.go) | 对应测试文件 |

