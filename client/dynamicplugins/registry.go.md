# registry.go 代码说明文档

> 文件路径：[dynamicplugins/registry.go](file:///d:/claude/nomad/client/dynamicplugins/registry.go)
> 总行数：540 行
> 所属包：`dynamicplugins`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **动态插件子包**（`client/dynamicplugins`），管理运行时动态注册的插件。

## 2. 类型定义

### Registry

**定义位置**：[L27](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L27)

**类型**：interface

```go
	RegisterPlugin
	DeregisterPlugin
	WaitForPlugin
	ListPlugins
	DispensePlugin
	PluginForAlloc
	PluginsUpdatedCh
	Shutdown
	StubDispenserForType
```

### RegistryState

**定义位置**：[L46](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L46)

**类型**：struct

```go
	Plugins map[string]map[string]*list.List
```

### PluginDispenser

**定义位置**：[L50](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L50)

**类型定义**：`func(...)`

### StateStorage

**定义位置**：[L80](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L80)

**类型**：interface

```go
	GetDynamicPluginRegistryState
	PutDynamicPluginRegistryState
```

### PluginInfo

**定义位置**：[L89](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L89)

**类型**：struct

```go
	Name string
	Type string
	Version string
	ConnectionInfo *PluginConnectionInfo
	AllocID string
	Options map[string]string
```

### PluginConnectionInfo

**定义位置**：[L110](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L110)

**类型**：struct

```go
	SocketPath string
```

### EventType

**定义位置**：[L117](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L117)

**类型定义**：`string`

### PluginUpdateEvent

**定义位置**：[L130](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L130)

**类型**：struct

```go
	EventType EventType
	Info *PluginInfo
```

### dynamicRegistry

**定义位置**：[L135](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L135)

**类型**：struct

```go
	plugins map[string]map[string]*list.List
	pluginsLock sync.RWMutex
	broadcasters map[string]*pluginEventBroadcaster
	broadcastersLock sync.Mutex
	dispensers map[string]PluginDispenser
	stubDispensers map[string]PluginDispenser
	state StateStorage
```

**关联方法**（11 个）：`StubDispenserForType`, `RegisterPlugin`, `broadcasterForPluginType`, `DeregisterPlugin`, `ListPlugins`, `WaitForPlugin`, `DispensePlugin`, `PluginForAlloc`, `PluginsUpdatedCh`, `sync`, `Shutdown`

### pluginEventBroadcaster

**定义位置**：[L467](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L467)

**类型**：struct

```go
	stopCh chan struct{...}
	shutdownCh chan struct{...}
	publishCh chan *PluginUpdateEvent
	subscriptions map[chan *PluginUpdateEvent]struct{...}
	subscriptionsLock sync.RWMutex
```

**关联方法**（5 个）：`run`, `shutdown`, `broadcast`, `subscribe`, `unsubscribe`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `PluginTypeCSIController` | `"csi-controller"` |
| `PluginTypeCSINode` | `"csi-node"` |
| `EventTypeRegistered` | `"registered"` |
| `EventTypeDeregistered` | `"deregistered"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewRegistry` | - | `state StateStorage, dispensers map[string]PluginDispenser` | `Registry` | [L54](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L54) |
| `StubDispenserForType` | `d *dynamicRegistry` | `ptype string, dispenser PluginDispenser` | - | [L151](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L151) |
| `RegisterPlugin` | `d *dynamicRegistry` | `info *PluginInfo` | `error` | [L170](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L170) |
| `broadcasterForPluginType` | `d *dynamicRegistry` | `ptype string` | `*pluginEventBroadcaster` | [L227](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L227) |
| `DeregisterPlugin` | `d *dynamicRegistry` | `ptype string, name string, allocID string` | `error` | [L240](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L240) |
| `ListPlugins` | `d *dynamicRegistry` | `ptype string` | `[]*PluginInfo` | [L291](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L291) |
| `WaitForPlugin` | `d *dynamicRegistry` | `ctx context.Context, ptype string, name string` | `*PluginInfo, error` | [L315](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L315) |
| `DispensePlugin` | `d *dynamicRegistry` | `ptype string, name string` | `interface{}, error` | [L367](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L367) |
| `PluginForAlloc` | `d *dynamicRegistry` | `ptype string, name string, allocID string` | `*PluginInfo, error` | [L411](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L411) |
| `PluginsUpdatedCh` | `d *dynamicRegistry` | `ctx context.Context, ptype string` | `chan *PluginUpdateEvent` | [L438](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L438) |
| `sync` | `d *dynamicRegistry` | - | `error` | [L453](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L453) |
| `Shutdown` | `d *dynamicRegistry` | - | - | [L461](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L461) |
| `newPluginEventBroadcaster` | - | - | `*pluginEventBroadcaster` | [L476](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L476) |
| `run` | `p *pluginEventBroadcaster` | - | - | [L487](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L487) |
| `shutdown` | `p *pluginEventBroadcaster` | - | - | [L503](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L503) |
| `broadcast` | `p *pluginEventBroadcaster` | `e *PluginUpdateEvent` | - | [L517](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L517) |
| `subscribe` | `p *pluginEventBroadcaster` | - | `chan *PluginUpdateEvent` | [L521](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L521) |
| `unsubscribe` | `p *pluginEventBroadcaster` | `ch chan *PluginUpdateEvent` | - | [L530](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L530) |

## 5. 核心方法详解

### ListPlugins()

**签名**：`func (d *dynamicRegistry) ListPlugins(ptype string) []*PluginInfo`

**位置**：[L291](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L291)

### Shutdown()

**签名**：`func (d *dynamicRegistry) Shutdown() `

**位置**：[L461](file:///d:/claude/nomad/client/dynamicplugins/registry.go#L461)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `container/list` | 标准库 |
| `context` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [registry_test.go](file:///d:/claude/nomad/client/dynamicplugins/registry_test.go) | 对应测试文件 |

