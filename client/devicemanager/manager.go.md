# manager.go 代码说明文档

> 文件路径：[devicemanager/manager.go](file:///d:/claude/nomad/client/devicemanager/manager.go)
> 总行数：326 行
> 所属包：`devicemanager`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **设备管理器子包**（`client/devicemanager`），管理 GPU、FPGA 等硬件设备的发现、分配和统计。

## 2. 类型定义

### Manager

**定义位置**：[L26](file:///d:/claude/nomad/client/devicemanager/manager.go#L26)

**类型**：interface

```go
	pluginmanager.PluginManager
	Reserve
	AllStats
	DeviceStats
```

### StateStorage

**定义位置**：[L41](file:///d:/claude/nomad/client/devicemanager/manager.go#L41)

**类型**：interface

```go
	GetDevicePluginState
	PutDevicePluginState
```

### UpdateNodeDevicesFn

**定义位置**：[L52](file:///d:/claude/nomad/client/devicemanager/manager.go#L52)

**类型定义**：`func(...)`

### StorePluginReattachFn

**定义位置**：[L55](file:///d:/claude/nomad/client/devicemanager/manager.go#L55)

**类型定义**：`func(...)`

### Config

**定义位置**：[L58](file:///d:/claude/nomad/client/devicemanager/manager.go#L58)

**类型**：struct

```go
	Logger log.Logger
	Loader loader.PluginCatalog
	PluginConfig *base.AgentConfig
	Updater UpdateNodeDevicesFn
	StatsInterval time.Duration
	State StateStorage
```

### manager

**定义位置**：[L79](file:///d:/claude/nomad/client/devicemanager/manager.go#L79)

**类型**：struct

```go
	logger log.Logger
	state StateStorage
	ctx context.Context
	cancel context.CancelFunc
	loader loader.PluginCatalog
	pluginConfig *base.AgentConfig
	updater UpdateNodeDevicesFn
	statsInterval time.Duration
	fingerprintResCh chan struct{...}
	instances map[loader.PluginID]*instanceManager
	reattachConfigs map[loader.PluginID]*pstructs.ReattachConfig
	reattachConfigLock sync.Mutex
```

**关联方法**（10 个）：`PluginType`, `Run`, `fingerprint`, `Shutdown`, `WaitForFirstFingerprint`, `Reserve`, `AllStats`, `DeviceStats`, `cleanupStalePlugins`, `storePluginReattachConfig`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `New` | - | `c *Config` | `*manager` | [L114](file:///d:/claude/nomad/client/devicemanager/manager.go#L114) |
| `PluginType` | ` *manager` | - | `string` | [L132](file:///d:/claude/nomad/client/devicemanager/manager.go#L132) |
| `Run` | `m *manager` | - | - | [L137](file:///d:/claude/nomad/client/devicemanager/manager.go#L137) |
| `fingerprint` | `m *manager` | - | - | [L173](file:///d:/claude/nomad/client/devicemanager/manager.go#L173) |
| `Shutdown` | `m *manager` | - | - | [L199](file:///d:/claude/nomad/client/devicemanager/manager.go#L199) |
| `WaitForFirstFingerprint` | `m *manager` | `ctx context.Context` | `chan struct{...}` | [L209](file:///d:/claude/nomad/client/devicemanager/manager.go#L209) |
| `Reserve` | `m *manager` | `d *structs.AllocatedDeviceResource` | `*device.ContainerReservation, error` | [L228](file:///d:/claude/nomad/client/devicemanager/manager.go#L228) |
| `AllStats` | `m *manager` | - | `[]*device.DeviceGroupStats` | [L243](file:///d:/claude/nomad/client/devicemanager/manager.go#L243) |
| `DeviceStats` | `m *manager` | `d *structs.AllocatedDeviceResource` | `*device.DeviceGroupStats, error` | [L255](file:///d:/claude/nomad/client/devicemanager/manager.go#L255) |
| `cleanupStalePlugins` | `m *manager` | - | `error` | [L271](file:///d:/claude/nomad/client/devicemanager/manager.go#L271) |
| `storePluginReattachConfig` | `m *manager` | `id loader.PluginID, c *plugin.ReattachConfig` | `error` | [L308](file:///d:/claude/nomad/client/devicemanager/manager.go#L308) |

## 5. 核心方法详解

### New()

**签名**：`func New(c *Config) *manager`

**位置**：[L114](file:///d:/claude/nomad/client/devicemanager/manager.go#L114)

### Run()

**签名**：`func (m *manager) Run() `

**位置**：[L137](file:///d:/claude/nomad/client/devicemanager/manager.go#L137)

### Shutdown()

**签名**：`func (m *manager) Shutdown() `

**位置**：[L199](file:///d:/claude/nomad/client/devicemanager/manager.go#L199)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/devicemanager/state` | 内部包 |
| `github.com/hashicorp/nomad/client/pluginmanager` | 内部包 |
| `github.com/hashicorp/nomad/helper/pluginutils/loader` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/hashicorp/nomad/plugins/device` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-plugin` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **插件架构**：使用 `go-plugin` 框架实现插件化扩展

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [manager_test.go](file:///d:/claude/nomad/client/devicemanager/manager_test.go) | 对应测试文件 |

