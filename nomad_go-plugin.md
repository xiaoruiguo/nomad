# Nomad 中 go-plugin 框架的深度使用分析

> 本文档详细分析 HashiCorp 的 `github.com/hashicorp/go-plugin` 框架在 Nomad 项目中的使用方式，涵盖插件握手协议、三种插件类型（base/driver/device）的 gRPC 实现、插件加载器（PluginLoader/SingletonLoader）、插件管理器（devicemanager/drivermanager）、内置插件（logmon/executor/docklog）以及 reattach 机制等核心内容。所有引用均带源码文件路径与函数签名，便于读者快速定位。

## 目录

1. [概述与架构总览](#1-概述与架构总览)
2. [go-plugin 框架核心概念](#2-go-plugin-框架核心概念)
3. [插件握手配置](#3-插件握手配置)
4. [三种插件类型与常量](#4-三种插件类型与常量)
5. [base 插件实现](#5-base-插件实现)
6. [driver 插件实现](#6-driver-插件实现)
7. [device 插件实现](#7-device-插件实现)
8. [插件加载器 PluginLoader](#8-插件加载器-pluginloader)
9. [SingletonLoader 单例加载器](#9-singletonloader-单例加载器)
10. [插件管理器（device/driver）](#10-插件管理器devicedriver)
11. [Reattach 重新挂接机制](#11-reattach-重新挂接机制)
12. [内置子插件：logmon、executor、docker_logger](#12-内置子插件logmonexecutor_docker_logger)
13. [插件启动入口 Serve 与 ServeCtx](#13-插件启动入口-serve-与-servectx)
14. [典型调用链](#14-典型调用链)
15. [源码文件索引](#15-源码文件索引)

---

## 1. 概述与架构总览

Nomad 通过 `go-plugin` 框架将驱动（docker/exec/rawexec/java/qemu 等）和设备（GPU 等）以独立进程方式加载，所有插件通过 gRPC 与 Nomad 主进程通信。架构分为四层：

```
┌─────────────────────────────────────────────────────────────┐
│ Nomad Agent 主进程                                          │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ devicemanager    │  │ drivermanager    │  插件管理器     │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                     │                          │
│  ┌────────▼─────────────────────▼─────────┐                │
│  │ SingletonLoader / PluginLoader         │  插件加载器     │
│  │  - Catalog()  Dispense()  Reattach()   │                │
│  └────────┬─────────────────────┬─────────┘                │
│           │                     │                          │
│  ┌────────▼─────────────────────▼─────────┐                │
│  │ base/driver/device GRPCClient          │  gRPC 客户端    │
│  └────────┬─────────────────────┬─────────┘                │
└───────────┼─────────────────────┼──────────────────────────┘
            │ gRPC over Unix/TCP  │
┌───────────▼─────────────────────▼──────────────────────────┐
│ 插件子进程                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ base/driver/device GRPCServer  →  plugin.Serve()    │   │
│  │  - PluginInfo / ConfigSchema / SetConfig            │   │
│  │  - Fingerprint / Stats / Reserve / Start / Stop ... │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

**核心特性：**
- **统一握手协议**：所有插件共用 `base.Handshake`（Magic Cookie 校验）
- **多插件复用**：每个子进程同时注册 `base` 与 `driver`/`device` 两种插件
- **内部/外部插件**：内置插件（factory 方式）与外部二进制插件（`plugin.NewClient`）通过 `PluginLoader` 统一抽象
- **Reattach 持久化**：跨 Agent 重启通过 BoltDB 存储 reattach 配置，重新连接到原插件进程

---

## 2. go-plugin 框架核心概念

| 概念 | 说明 | Nomad 中的位置 |
|------|------|---------------|
| `plugin.HandshakeConfig` | 协议版本与 Magic Cookie 校验 | [plugins/base/plugin.go](file:///d:/claude/nomad/plugins/base/plugin.go) `Handshake` |
| `plugin.Plugin` 接口 | 包含 `GRPCServer` / `GRPCClient` 两个方法 | 由 `PluginBase`/`PluginDriver`/`PluginDevice` 实现 |
| `plugin.NetRPCUnsupportedPlugin` | 占位结构，声明不使用旧版 net/rpc | 嵌入所有 Nomad 插件类型 |
| `plugin.GRPCBroker` | 双向 gRPC 子通道代理（用于 stream 等） | `GRPCServer`/`GRPCClient` 参数 |
| `plugin.ServeConfig` | 启动插件进程的配置 | `drivers.Serve`/`device.Serve`/`logmon`/`executor`/`docklog` |
| `plugin.Client` | 用于启动或重新挂接外部插件进程 | `loader.dispensePlugin`、`logmon.LaunchLogMon` 等 |
| `plugin.ReattachConfig` | 重新挂接已运行插件进程 | `loader.Reattach`、drivermanager/devicemanager 持久化 |
| `plugin.ProtocolGRPC` | 声明使用 gRPC 协议（v2） | `dispensePlugin` 的 `AllowedProtocols` |

**协议版本演进：**
- Version 1：Nomad 0.9 之前基于 `net/rpc` 的 executor
- Version 2：0.9+ 基于 gRPC，所有新插件使用此版本

---

## 3. 插件握手配置

### 源码位置
[plugins/base/plugin.go#L28-L38](file:///d:/claude/nomad/plugins/base/plugin.go#L28-L38)

```go
var (
    // Handshake is a common handshake that is shared by all plugins and Nomad.
    Handshake = plugin.HandshakeConfig{
        // ProtocolVersion for the executor protocol.
        // Version 1: pre 0.9 netrpc based executor
        // Version 2: 0.9+ grpc based executor
        ProtocolVersion:  2,
        MagicCookieKey:   "NOMAD_PLUGIN_MAGIC_COOKIE",
        MagicCookieValue: "e4327c2e01eabfd75a8a67adb114fb34a757d57eee7728d857a8cec6e91a7255",
    }
)
```

**作用：**
- Nomad 主进程在启动插件子进程前，通过环境变量设置 `NOMAD_PLUGIN_MAGIC_COOKIE` 为指定的 64 字节十六进制值
- 子进程启动后 `plugin.Serve()` 会校验该 Cookie 是否匹配，不匹配则立即退出，防止误启动非插件二进制
- `ProtocolVersion: 2` 强制使用 gRPC 协议

---

## 4. 三种插件类型与常量

### 源码位置
[plugins/base/plugin.go#L17-L26](file:///d:/claude/nomad/plugins/base/plugin.go#L17-L26)

```go
const (
    PluginTypeBase   = "base"
    PluginTypeDriver = "driver"
    PluginTypeDevice = "device"
)
```

**类型说明：**

| 类型 | 用途 | 接口 | Serve 入口 |
|------|------|------|-----------|
| `base` | 所有插件必须实现的基础接口（PluginInfo/ConfigSchema/SetConfig） | `base.BasePlugin` | 由 driver/device 的 Serve 自动注册 |
| `driver` | 任务驱动（docker/exec/rawexec 等），负责任务生命周期 | `drivers.DriverPlugin` | `drivers.Serve(d, logger)` |
| `device` | 设备插件（GPU/FPGA 等），负责设备发现与预留 | `device.DevicePlugin` | `device.Serve(dev, logger)` |

---

## 5. base 插件实现

### 5.1 PluginBase 类型与 gRPC 桥接

#### 源码位置
[plugins/base/plugin.go#L42-L60](file:///d:/claude/nomad/plugins/base/plugin.go#L42-L60)

```go
// PluginBase is wraps a BasePlugin and implements go-plugins GRPCPlugin
// interface to expose the interface over gRPC.
type PluginBase struct {
    plugin.NetRPCUnsupportedPlugin
    Impl BasePlugin
}

func (p *PluginBase) GRPCServer(broker *plugin.GRPCBroker, s *grpc.Server) error {
    proto.RegisterBasePluginServer(s, &basePluginServer{
        impl:   p.Impl,
        broker: broker,
    })
    return nil
}

func (p *PluginBase) GRPCClient(ctx context.Context, broker *plugin.GRPCBroker, c *grpc.ClientConn) (interface{}, error) {
    return &BasePluginClient{
        Client:  proto.NewBasePluginClient(c),
        DoneCtx: ctx,
    }, nil
}
```

**说明：**
- `PluginBase` 嵌入 `plugin.NetRPCUnsupportedPlugin` 声明不支持旧 net/rpc 协议
- `GRPCServer` 在子进程中注册 `basePluginServer` 到 gRPC 服务
- `GRPCClient` 在主进程中创建 `BasePluginClient` 包装 gRPC 连接

### 5.2 basePluginServer 实现

#### 源码位置
[plugins/base/server.go](file:///d:/claude/nomad/plugins/base/server.go)

```go
type basePluginServer struct {
    broker *plugin.GRPCBroker
    impl   BasePlugin
}
```

| 方法 | 行号 | 功能 |
|------|------|------|
| `PluginInfo(ctx, *proto.PluginInfoRequest) (*proto.PluginInfoResponse, error)` | [L20](file:///d:/claude/nomad/plugins/base/server.go#L20) | 返回插件类型、API 版本、插件版本、名称 |
| `ConfigSchema(ctx, *proto.ConfigSchemaRequest) (*proto.ConfigSchemaResponse, error)` | [L46](file:///d:/claude/nomad/plugins/base/server.go#L46) | 返回插件配置的 HCL Schema |
| `SetConfig(ctx, *proto.SetConfigRequest) (*proto.SetConfigResponse, error)` | [L59](file:///d:/claude/nomad/plugins/base/server.go#L59) | 设置插件配置（含 AgentConfig 过滤） |

**SetConfig 关键逻辑：**
- 调用 `b.impl.PluginInfo()` 获取插件类型
- 根据类型过滤 `AgentConfig`（仅 driver 类型传递 `cfg.Driver`）
- 调用 `b.impl.SetConfig(c)` 实际应用配置

### 5.3 MsgPack 编解码工具

[plugins/base/plugin.go#L63-L86](file:///d:/claude/nomad/plugins/base/plugin.go#L63-L86) 提供 `MsgPackEncode`/`MsgPackDecode`，用于将插件配置 `map[string]interface{}` 序列化为 `[]byte` 在 gRPC 消息中传输。

---

## 6. driver 插件实现

### 6.1 PluginDriver 类型

#### 源码位置
[plugins/drivers/plugin.go](file:///d:/claude/nomad/plugins/drivers/plugin.go)

```go
var _ plugin.GRPCPlugin = &PluginDriver{}

type PluginDriver struct {
    plugin.NetRPCUnsupportedPlugin
    impl   DriverPlugin
    logger hclog.Logger
}

func NewDriverPlugin(d DriverPlugin, logger hclog.Logger) *PluginDriver {
    return &PluginDriver{impl: d, logger: logger}
}

func (p *PluginDriver) GRPCServer(broker *plugin.GRPCBroker, s *grpc.Server) error {
    proto.RegisterDriverServer(s, &driverPluginServer{
        impl:   p.impl,
        broker: broker,
    })
    return nil
}

func (p *PluginDriver) GRPCClient(ctx context.Context, broker *plugin.GRPCBroker, c *grpc.ClientConn) (interface{}, error) {
    return &driverPluginClient{
        BasePluginClient: &base.BasePluginClient{
            DoneCtx: ctx,
            Client:  baseproto.NewBasePluginClient(c),
        },
        client:  proto.NewDriverClient(c),
        doneCtx: ctx,
        logger:  p.logger,
    }, nil
}
```

**关键点：**
- `driverPluginClient` 同时嵌入 `BasePluginClient`，使得客户端既能调用 driver 接口，也能调用 base 接口
- `GRPCServer` 注册 `driverPluginServer` 实现 `Init`/`TaskConfigSchema`/`Capabilities`/`Fingerprint`/`Start`/`Stop`/`Wait`/`Stats`/`Exec` 等方法

### 6.2 driverPluginServer 部分 gRPC 方法

#### 源码位置
[plugins/drivers/server.go](file:///d:/claude/nomad/plugins/drivers/server.go)

```go
type driverPluginServer struct {
    broker *plugin.GRPCBroker
    impl   DriverPlugin
}
```

| 方法 | 行号 | 功能 |
|------|------|------|
| `Init(ctx, *proto.InitRequest) (*proto.InitResponse, error)` | [L29](file:///d:/claude/nomad/plugins/drivers/server.go#L29) | 调用 `DriverIniter.Init` 初始化驱动 |
| `TaskConfigSchema(ctx, *proto.TaskConfigSchemaRequest)` | [L42](file:///d:/claude/nomad/plugins/drivers/server.go#L42) | 返回任务配置 Schema |
| `Capabilities(ctx, *proto.CapabilitiesRequest)` | [L54](file:///d:/claude/nomad/plugins/drivers/server.go#L54) | 返回驱动能力（信号、exec、网络隔离、FS 隔离等） |
| `Fingerprint(req, srv proto.Driver_FingerprintServer)` | [L88](file:///d:/claude/nomad/plugins/drivers/server.go#L88) | 流式响应，循环读取 `impl.Fingerprint(ctx)` 的 channel 并发送 |

### 6.3 Serve 函数

#### 源码位置
[plugins/drivers/plugin.go#L54-L65](file:///d:/claude/nomad/plugins/drivers/plugin.go#L54-L65)

```go
// Serve is used to serve a driverplugin
func Serve(d DriverPlugin, logger hclog.Logger) {
    plugin.Serve(&plugin.ServeConfig{
        HandshakeConfig: base.Handshake,
        Plugins: map[string]plugin.Plugin{
            base.PluginTypeBase:   &base.PluginBase{Impl: d},
            base.PluginTypeDriver: &PluginDriver{impl: d, logger: logger},
        },
        GRPCServer: plugin.DefaultGRPCServer,
        Logger:     logger,
    })
}
```

**说明：**
- 同一个驱动实现 `DriverPlugin` 接口（同时也实现 `BasePlugin` 接口）
- 同时注册 `base` 和 `driver` 两个插件名，让主进程既能调用 base 方法也能调用 driver 方法
- 使用 `plugin.DefaultGRPCServer` 启动标准 gRPC server

---

## 7. device 插件实现

### 7.1 PluginDevice 类型

#### 源码位置
[plugins/device/plugin.go](file:///d:/claude/nomad/plugins/device/plugin.go)

```go
type PluginDevice struct {
    plugin.NetRPCUnsupportedPlugin
    Impl DevicePlugin
}

func (p *PluginDevice) GRPCServer(broker *plugin.GRPCBroker, s *grpc.Server) error {
    proto.RegisterDevicePluginServer(s, &devicePluginServer{
        impl:   p.Impl,
        broker: broker,
    })
    return nil
}

func (p *PluginDevice) GRPCClient(ctx context.Context, broker *plugin.GRPCBroker, c *grpc.ClientConn) (interface{}, error) {
    return &devicePluginClient{
        doneCtx: ctx,
        client:  proto.NewDevicePluginClient(c),
        BasePluginClient: &base.BasePluginClient{
            Client:  bproto.NewBasePluginClient(c),
            DoneCtx: ctx,
        },
    }, nil
}
```

### 7.2 devicePluginServer gRPC 方法

#### 源码位置
[plugins/device/server.go](file:///d:/claude/nomad/plugins/device/server.go)

| 方法 | 行号 | 功能 |
|------|------|------|
| `Fingerprint(req, stream proto.DevicePlugin_FingerprintServer)` | [L23](file:///d:/claude/nomad/plugins/device/server.go#L23) | 流式响应设备列表 |
| `Reserve(ctx, *proto.ReserveRequest) (*proto.ReserveResponse, error)` | [L61](file:///d:/claude/nomad/plugins/device/server.go#L61) | 预留设备并返回容器挂载信息 |
| `Stats(req, stream proto.DevicePlugin_StatsServer)` | [L75](file:///d:/claude/nomad/plugins/device/server.go#L75) | 流式响应设备统计 |

### 7.3 Serve 函数

#### 源码位置
[plugins/device/plugin.go#L43-L54](file:///d:/claude/nomad/plugins/device/plugin.go#L43-L54)

```go
func Serve(dev DevicePlugin, logger log.Logger) {
    plugin.Serve(&plugin.ServeConfig{
        HandshakeConfig: base.Handshake,
        Plugins: map[string]plugin.Plugin{
            base.PluginTypeBase:   &base.PluginBase{Impl: dev},
            base.PluginTypeDevice: &PluginDevice{Impl: dev},
        },
        GRPCServer: plugin.DefaultGRPCServer,
        Logger:     logger,
    })
}
```

---

## 8. 插件加载器 PluginLoader

### 8.1 核心接口与类型

#### 源码位置
[helper/pluginutils/loader/loader.go](file:///d:/claude/nomad/helper/pluginutils/loader/loader.go)

```go
// PluginCatalog is used to retrieve plugins, either external or internal
type PluginCatalog interface {
    Dispense(name, pluginType string, config *base.AgentConfig, logger log.Logger) (PluginInstance, error)
    Reattach(name, pluginType string, config *plugin.ReattachConfig) (PluginInstance, error)
    Catalog() map[string][]*base.PluginInfoResponse
}

type PluginID struct {
    Name       string
    PluginType string
}

type InternalPluginConfig struct {
    Config  map[string]interface{}
    Factory plugins.PluginCtxFactory
}

type PluginLoaderConfig struct {
    Logger            log.Logger
    PluginDir         string
    Configs           []*config.PluginConfig
    InternalPlugins   map[PluginID]*InternalPluginConfig
    SupportedVersions map[string][]string
}

type PluginLoader struct {
    logger            log.Logger
    supportedVersions map[string][]*version.Version
    pluginDir         string
    plugins           map[PluginID]*pluginInfo
}

type pluginInfo struct {
    factory       plugins.PluginCtxFactory
    exePath       string
    args          []string
    baseInfo      *base.PluginInfoResponse
    version       *version.Version
    apiVersion    string
    configSchema  *hclspec.Spec
    config        map[string]interface{}
    msgpackConfig []byte
}
```

### 8.2 PluginInstance 接口与实现

#### 源码位置
[helper/pluginutils/loader/instance.go](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go)

```go
type PluginInstance interface {
    Internal() bool
    Kill()
    ReattachConfig() (config *plugin.ReattachConfig, canReattach bool)
    Plugin() interface{}
    Exited() bool
    ApiVersion() string
}

// internalPluginInstance 内置插件：factory 直接返回的实例
type internalPluginInstance struct {
    instance   interface{}
    apiVersion string
    killFn     func()    // cancel context
}

// externalPluginInstance 外部插件：包装 *plugin.Client
type externalPluginInstance struct {
    client     *plugin.Client
    instance   interface{}
    apiVersion string
}
```

| 方法 | internal 实现 | external 实现 |
|------|--------------|---------------|
| `Internal()` | 返回 `true` | 返回 `false` |
| `Kill()` | 调用 `cancel()` 取消 context | 调用 `client.Kill()` 终止子进程 |
| `ReattachConfig()` | 返回 `(nil, false)` | 返回 `(client.ReattachConfig(), true)` |
| `Exited()` | 始终返回 `false` | 返回 `client.Exited()` |
| `Plugin()` | 返回 factory 创建的实例 | 返回 `rpcClient.Dispense` 结果 |

### 8.3 NewPluginLoader 初始化流程

#### 源码位置
[helper/pluginutils/loader/loader.go#L120-L159](file:///d:/claude/nomad/helper/pluginutils/loader/loader.go#L120-L159)

```go
func NewPluginLoader(config *PluginLoaderConfig) (*PluginLoader, error) {
    if err := validateConfig(config); err != nil {
        return nil, fmt.Errorf("invalid plugin loader configuration passed: %v", err)
    }
    supportedVersions := make(map[string][]*version.Version, len(config.SupportedVersions))
    for pType, versions := range config.SupportedVersions {
        converted, err := convertVersions(versions)
        if err != nil { return nil, err }
        supportedVersions[pType] = converted
    }
    logger := config.Logger.Named("plugin_loader").With("plugin_dir", config.PluginDir)
    l := &PluginLoader{
        logger:            logger,
        supportedVersions: supportedVersions,
        pluginDir:         config.PluginDir,
        plugins:           make(map[PluginID]*pluginInfo),
    }
    updatedConfig, err := l.init(config)
    if err != nil {
        return nil, fmt.Errorf("failed to initialize plugin loader: %v", err)
    }
    // 把 init 阶段从 schema 提取的默认值回写到 agent 配置
    for i, c := range config.Configs {
        if updated, ok := updatedConfig[c.Name]; ok {
            config.Configs[i] = updated
        }
    }
    return l, nil
}
```

### 8.4 init 阶段（指纹收集）

#### 源码位置
[helper/pluginutils/loader/init.go#L57-L95](file:///d:/claude/nomad/helper/pluginutils/loader/init.go#L57-L95)

```go
func (l *PluginLoader) init(cfg *PluginLoaderConfig) (map[string]*config.PluginConfig, error) {
    configMap := configMap(cfg.Configs)
    // 1. 初始化内置插件
    internal, err := l.initInternal(cfg.InternalPlugins, configMap)
    // 2. 扫描外部插件目录
    plugins, err := l.scan()
    // 3. 指纹外部插件（启动-查询-kill）
    external, err := l.fingerprintPlugins(plugins, configMap)
    // 4. 合并内置与外部（同名时按版本选最高）
    l.plugins = l.mergePlugins(internal, external)
    // 5. 校验配置与 schema
    canonicalizedConfigs, err := l.validatePluginConfigs()
    return configMap, nil
}
```

**关键子函数：**

| 函数 | 行号 | 功能 |
|------|------|------|
| `validateConfig` | [L25-L53](file:///d:/claude/nomad/helper/pluginutils/loader/init.go#L25-L53) | 校验 logger、InternalPlugins factory 等 |
| `initInternal` | [L98-L168](file:///d:/claude/nomad/helper/pluginutils/loader/init.go#L98-L168) | 调用 factory 创建内置插件实例，调用 `PluginInfo`/`ConfigSchema` 获取元信息 |
| `selectApiVersion` | [L173-L201](file:///d:/claude/nomad/helper/pluginutils/loader/init.go#L173-L201) | 在 Nomad 支持版本与插件支持版本中找最高匹配 |
| `scan` | [L224-L266](file:///d:/claude/nomad/helper/pluginutils/loader/init.go#L224-L266) | 扫描 `pluginDir` 下的可执行文件 |
| `fingerprintPlugins` | [L269+](file:///d:/claude/nomad/helper/pluginutils/loader/init.go#L269) | 遍历外部二进制，启动后查询 `PluginInfo`/`ConfigSchema`，再 kill |
| `mergePlugins` | - | 同名同类型插件按版本号选最高 |
| `validatePluginConfigs` | - | 用 `ConfigSchema` 校验用户配置并填充默认值 |

### 8.5 Dispense：实际获取插件实例

#### 源码位置
[helper/pluginutils/loader/loader.go#L163-L209](file:///d:/claude/nomad/helper/pluginutils/loader/loader.go#L163-L209)

```go
func (l *PluginLoader) Dispense(name, pluginType string, config *base.AgentConfig, logger log.Logger) (PluginInstance, error) {
    id := PluginID{Name: name, PluginType: pluginType}
    pinfo, ok := l.plugins[id]
    if !ok { return nil, fmt.Errorf("unknown plugin with name %q and type %q", name, pluginType) }

    var instance PluginInstance
    if pinfo.factory != nil {
        // 内置插件：直接调用 factory
        ctx, cancel := context.WithCancel(context.Background())
        instance = &internalPluginInstance{
            instance:   pinfo.factory(ctx, logger),
            apiVersion: pinfo.apiVersion,
            killFn:     cancel,
        }
    } else {
        // 外部插件：调用 dispensePlugin 启动子进程
        instance, err = l.dispensePlugin(pinfo.baseInfo.Type, pinfo.apiVersion, pinfo.exePath, pinfo.args, nil, logger)
        if err != nil { return nil, fmt.Errorf("failed to launch plugin: %v", err) }
    }

    // 转换为 BasePlugin 并 SetConfig
    b, ok := instance.Plugin().(base.BasePlugin)
    if !ok {
        instance.Kill()
        return nil, fmt.Errorf("plugin %s doesn't implement base plugin interface", id)
    }
    c := &base.Config{
        PluginConfig: pinfo.msgpackConfig,
        AgentConfig:  config,
        ApiVersion:   pinfo.apiVersion,
    }
    if err := b.SetConfig(c); err != nil {
        instance.Kill()
        return nil, fmt.Errorf("setting config for plugin %s failed: %v", id, err)
    }
    return instance, nil
}
```

### 8.6 dispensePlugin：启动外部插件子进程

#### 源码位置
[helper/pluginutils/loader/loader.go#L217-L283](file:///d:/claude/nomad/helper/pluginutils/loader/loader.go#L217-L283)

```go
func (l *PluginLoader) dispensePlugin(
    pluginType, apiVersion, cmd string, args []string, reattach *plugin.ReattachConfig,
    logger log.Logger) (PluginInstance, error) {

    var pluginCmd *exec.Cmd
    if cmd != "" && reattach != nil {
        return nil, fmt.Errorf("both launch command and reattach config specified")
    } else if cmd == "" && reattach == nil {
        return nil, fmt.Errorf("one of launch command or reattach config must be specified")
    } else if cmd != "" {
        pluginCmd = exec.Command(cmd, args...)
    }

    client := plugin.NewClient(&plugin.ClientConfig{
        HandshakeConfig:  base.Handshake,
        Plugins:          getPluginMap(pluginType, logger),
        Cmd:              pluginCmd,
        AllowedProtocols: []plugin.Protocol{plugin.ProtocolGRPC},
        Logger:           logger,
        Reattach:         reattach,
    })

    rpcClient, err := client.Client()
    if err != nil { client.Kill(); return nil, err }

    raw, err := rpcClient.Dispense(pluginType)
    if err != nil { client.Kill(); return nil, err }

    instance := &externalPluginInstance{client: client, instance: raw}

    // reattach 场景：没有 apiVersion，需要通过 PluginInfo 重新发现
    if apiVersion == "" {
        bplugin := raw.(base.BasePlugin)
        i, err := bplugin.PluginInfo()
        ...
        apiVersion, err := l.selectApiVersion(i)
        instance.apiVersion = apiVersion
    } else {
        instance.apiVersion = apiVersion
    }
    return instance, nil
}
```

### 8.7 getPluginMap：构建插件映射表

#### 源码位置
[helper/pluginutils/loader/loader.go#L286-L299](file:///d:/claude/nomad/helper/pluginutils/loader/loader.go#L286-L299)

```go
func getPluginMap(pluginType string, logger log.Logger) map[string]plugin.Plugin {
    pmap := map[string]plugin.Plugin{
        base.PluginTypeBase: &base.PluginBase{},
    }
    switch pluginType {
    case base.PluginTypeDevice:
        pmap[base.PluginTypeDevice] = &device.PluginDevice{}
    case base.PluginTypeDriver:
        pmap[base.PluginTypeDriver] = drivers.NewDriverPlugin(nil, logger)
    }
    return pmap
}
```

**说明：**
- 主进程侧的 `plugin.Plugin` 实例的 `Impl` 字段为 `nil`（因为主进程只需要 `GRPCClient`，不需要 `GRPCServer`）
- 这种设计让主进程通过 gRPC client 调用远端插件，无需在本地实现插件逻辑

---

## 9. SingletonLoader 单例加载器

### 9.1 设计动机

`PluginLoader.Dispense` 每次调用都会创建新的插件实例（外部插件甚至会启动新子进程），但很多场景下需要复用同一个实例（如 driver 插件供多个 allocrunner 共享）。`SingletonLoader` 通过 future 模式缓存运行中的实例，并发请求只启动一次。

### 9.2 源码实现

#### 源码位置
[helper/pluginutils/singleton/singleton.go](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go)

```go
type SingletonLoader struct {
    loader       loader.PluginCatalog
    instances    map[loader.PluginID]*future
    instanceLock sync.Mutex
    logger       log.Logger
}

func NewSingletonLoader(logger log.Logger, catalog loader.PluginCatalog) *SingletonLoader {
    return &SingletonLoader{
        loader:    catalog,
        logger:    logger.Named("singleton_plugin_loader"),
        instances: make(map[loader.PluginID]*future, 4),
    }
}

func (s *SingletonLoader) Dispense(name, pluginType string, config *base.AgentConfig, logger log.Logger) (loader.PluginInstance, error) {
    return s.getPlugin(false, name, pluginType, logger, config, nil)
}

func (s *SingletonLoader) Reattach(name, pluginType string, config *plugin.ReattachConfig) (loader.PluginInstance, error) {
    return s.getPlugin(true, name, pluginType, nil, nil, config)
}

func (s *SingletonLoader) getPlugin(reattach bool, name, pluginType string, logger log.Logger,
    nomadConfig *base.AgentConfig, config *plugin.ReattachConfig) (loader.PluginInstance, error) {

    s.instanceLock.Lock()
    id := loader.PluginID{Name: name, PluginType: pluginType}
    f, ok := s.instances[id]

    if !ok {
        f = newFuture()
        s.instances[id] = f
        if reattach {
            go s.reattach(f, name, pluginType, config)
        } else {
            go s.dispense(f, name, pluginType, nomadConfig, logger)
        }
    }
    s.instanceLock.Unlock()

    i, err := f.wait().result()
    if err != nil {
        s.clearFuture(id, f)
        return nil, err
    }
    if i.Exited() {
        s.clearFuture(id, f)
        return nil, SingletonPluginExited
    }
    return i, nil
}
```

**关键点：**
- 使用 `future` 模式：第一个请求创建 future 并启动 goroutine 加载插件，后续请求直接 `f.wait()`
- 若插件已退出（`Exited()`），返回 `SingletonPluginExited` 错误并清除 future，下次请求会重新启动
- `clearFuture` 通过指针比较避免清除被替换的新 future

### 9.3 错误定义

```go
var SingletonPluginExited = fmt.Errorf("singleton plugin exited")
```

调用方应捕获此错误并重试，触发重新加载。

---

## 10. 插件管理器（device/driver）

### 10.1 devicemanager

#### 源码位置
[client/devicemanager/manager.go](file:///d:/claude/nomad/client/devicemanager/manager.go)

```go
type Manager interface {
    pluginmanager.PluginManager
    Reserve(d *structs.AllocatedDeviceResource) (*device.ContainerReservation, error)
    AllStats() []*device.DeviceGroupStats
    DeviceStats(d *structs.AllocatedDeviceResource) (*device.DeviceGroupStats, error)
}

type Config struct {
    Logger        log.Logger
    Loader        loader.PluginCatalog
    PluginConfig  *base.AgentConfig
    Updater       UpdateNodeDevicesFn
    StatsInterval time.Duration
    State         StateStorage
}

type manager struct {
    logger            log.Logger
    state             StateStorage
    ctx               context.Context
    cancel            context.CancelFunc
    loader            loader.PluginCatalog
    pluginConfig      *base.AgentConfig
    updater           UpdateNodeDevicesFn
    statsInterval     time.Duration
    fingerprintResCh  chan struct{}
    instances         map[loader.PluginID]*instanceManager
    reattachConfigs   map[loader.PluginID]*pstructs.ReattachConfig
    reattachConfigLock sync.Mutex
}
```

**关键方法：**

| 方法 | 行号 | 功能 |
|------|------|------|
| `New(c *Config) *manager` | [L114](file:///d:/claude/nomad/client/devicemanager/manager.go#L114) | 创建 manager，初始化 context/instances/reattachConfigs |
| `PluginType() string` | [L132](file:///d:/claude/nomad/client/devicemanager/manager.go#L132) | 返回 `base.PluginTypeDevice` |
| `Run()` | [L137-L170](file:///d:/claude/nomad/client/devicemanager/manager.go#L137-L170) | 清理残留插件 → 遍历 Catalog 创建 instanceManager → 启动 fingerprint 协程 |
| `fingerprint()` | [L173-L196](file:///d:/claude/nomad/client/devicemanager/manager.go#L173-L196) | 监听 fingerprintResCh，收集所有设备并回调 `updater` |
| `Shutdown()` | [L199-L207](file:///d:/claude/nomad/client/devicemanager/manager.go#L199-L207) | 取消 context + 调用所有 instanceManager.cleanup() |
| `Reserve(d)` | [L228-L240](file:///d:/claude/nomad/client/devicemanager/manager.go#L228-L240) | 遍历 instances 找到持有该设备的插件，调用 `Reserve` |
| `AllStats()` | [L243-L251](file:///d:/claude/nomad/client/devicemanager/manager.go#L243-L251) | 聚合所有插件的 stats |
| `cleanupStalePlugins()` | [L271-L304](file:///d:/claude/nomad/client/devicemanager/manager.go#L271-L304) | 从 state 读取旧 reattach 配置，重新挂接并 kill |
| `storePluginReattachConfig(id, c)` | [L308-L325](file:///d:/claude/nomad/client/devicemanager/manager.go#L308-L325) | 持久化 reattach 配置到 state |

### 10.2 drivermanager

#### 源码位置
[client/pluginmanager/drivermanager/manager.go](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go)

```go
type Manager interface {
    pluginmanager.PluginManager
    Dispense(driver string) (drivers.DriverPlugin, error)
}

type Config struct {
    Logger             log.Logger
    Loader             loader.PluginCatalog
    PluginConfig       *base.AgentConfig
    Updater            UpdateNodeDriverInfoFn
    EventHandlerFactory TaskEventHandlerFactory
    State              StateStorage
    AllowedDrivers     map[string]struct{}
    BlockedDrivers     map[string]struct{}
}

type manager struct {
    logger             log.Logger
    state              StateStorage
    ctx                context.Context
    cancel             context.CancelFunc
    loader             loader.PluginCatalog
    pluginConfig       *base.AgentConfig
    updater            UpdateNodeDriverInfoFn
    eventHandlerFactory TaskEventHandlerFactory
    instances          map[string]*instanceManager
    instancesMu        sync.RWMutex
    reattachConfigs    map[loader.PluginID]*pstructs.ReattachConfig
    reattachConfigLock sync.Mutex
    allowedDrivers     map[string]struct{}
    blockedDrivers     map[string]struct{}
    readyCh            chan struct{}
}
```

**关键方法：**

| 方法 | 行号 | 功能 |
|------|------|------|
| `New(c *Config) *manager` | [L142-L159](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L142-L159) | 创建 manager，初始化 allowed/blocked 列表 |
| `PluginType() string` | [L162](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L162) | 返回 `base.PluginTypeDriver` |
| `Run()` | [L166-L219](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L166-L219) | 加载 reattach 配置 → 遍历 Catalog 跳过被屏蔽驱动 → 创建 instanceManager → 关闭 readyCh |
| `Shutdown()` | [L222-L233](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L222-L233) | 取消 context + 清理所有 instances |
| `WaitForFirstFingerprint(ctx)` | [L235-L282](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L235-L282) | 等待所有驱动完成首次指纹 |
| `loadReattachConfigs()` | [L284-L311](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L284-L311) | 从 state 读取 reattach，被屏蔽的驱动会被强制 kill |
| `shutdownBlockedDriver(name, reattach)` | [L315-L333](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L315-L333) | 重新挂接到被屏蔽驱动并 kill |
| `storePluginReattachConfig(id, c)` | [L337-L357](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L337-L357) | 持久化或清除 reattach 配置 |
| `fetchPluginReattachConfig(id)` | [L362-L376](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L362-L376) | 读取 reattach 配置给 instanceManager 使用 |
| `Dispense(d string)` | [L378-L386](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L378-L386) | 通过名字获取 DriverPlugin 实例 |
| `isDriverBlocked(name)` | [L388-L399](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L388-L399) | 检查 allow/block 列表 |

### 10.3 配置回调节点类型

```go
type StorePluginReattachFn func(*plugin.ReattachConfig) error
type FetchPluginReattachFn func() (*plugin.ReattachConfig, bool)
```

instanceManager 通过这些回调把 reattach 配置交给 manager 持久化，实现跨重启复用。

---

## 11. Reattach 重新挂接机制

### 11.1 ReattachConfig 包装结构

#### 源码位置
[plugins/shared/structs/plugin_reattach_config.go](file:///d:/claude/nomad/plugins/shared/structs/plugin_reattach_config.go)

```go
// ReattachConfig 是 plugin.ReattachConfig 的可序列化包装
type ReattachConfig struct {
    Protocol string
    Network  string
    Addr     string
    Pid      int
}

// ReattachConfigToGoPlugin 反向转换：包装 → go-plugin
func ReattachConfigToGoPlugin(rc *ReattachConfig) (*plugin.ReattachConfig, error) {
    plug := &plugin.ReattachConfig{
        Protocol: plugin.Protocol(rc.Protocol),
        Pid:      rc.Pid,
    }
    switch rc.Network {
    case "tcp", "tcp4", "tcp6":
        addr, err := net.ResolveTCPAddr(rc.Network, rc.Addr)
        ...
    case "udp", "udp4", "udp6":
        addr, err := net.ResolveUDPAddr(rc.Network, rc.Addr)
        ...
    case "unix", "unixgram", "unixpacket":
        addr, err := net.ResolveUnixAddr(rc.Network, rc.Addr)
        ...
    }
    return plug, nil
}

// ReattachConfigFromGoPlugin 正向转换：go-plugin → 包装
func ReattachConfigFromGoPlugin(plug *plugin.ReattachConfig) *ReattachConfig {
    return &ReattachConfig{
        Protocol: string(plug.Protocol),
        Network:  plug.Addr.Network(),
        Addr:     plug.Addr.String(),
        Pid:      plug.Pid,
    }
}
```

### 11.2 Reattach 流程

```
Agent 启动 → manager.Run() 
   ↓
   loadReattachConfigs()  从 BoltDB 读取上次保存的 reattach
   ↓
   对每个 reattach 调用 loader.Reattach(name, type, config)
   ↓
   PluginLoader.Reattach → dispensePlugin(pluginType, "", "", nil, reattach, logger)
   ↓
   plugin.NewClient(&ClientConfig{
       HandshakeConfig:  base.Handshake,
       Plugins:          getPluginMap(pluginType, logger),
       Reattach:         reattach,           // 关键：使用 reattach 而非 Cmd
       AllowedProtocols: []plugin.Protocol{plugin.ProtocolGRPC},
   })
   ↓
   client.Client()  → 通过 Pid+Addr 连接已运行进程，不启动新进程
   ↓
   rpcClient.Dispense(pluginType)  → 返回 GRPCClient 包装
   ↓
   由于 apiVersion 为空，调用 PluginInfo 重新发现并选择 apiVersion
```

### 11.3 stale plugin 清理

- devicemanager.cleanupStalePlugins：从 state 读取所有 reattach，逐个 Reattach 后调用 `instance.Kill()`，确保上次未正常退出的插件进程被清理
- drivermanager.loadReattachConfigs：对被 block 列表屏蔽的驱动，调用 `shutdownBlockedDriver` 强制 kill

### 11.4 Reattach 持久化时机

- instanceManager 在插件运行过程中，如果获取到新的 reattach 配置（如插件进程重启），会通过 `StoreReattach` 回调写入 state
- 当插件被 kill 或正常退出，instanceManager 会以 `nil` 调用 `StoreReattach`，清除该条 reattach 记录

---

## 12. 内置子插件：logmon、executor、docker_logger

这些子插件由 Nomad 主二进制通过 `exec.Command(self, args...)` 方式启动自身子进程，根据 `os.Args[1]` 分发到不同插件入口。它们使用独立的 `plugin.ServeConfig`，不属于 driver/device 三类，而是辅助进程。

### 12.1 logmon（日志监控）

#### 源码位置
[client/logmon/plugin.go](file:///d:/claude/nomad/client/logmon/plugin.go)

```go
// LaunchLogMon launches a new logmon or reattaches to an existing one.
func LaunchLogMon(logger hclog.Logger, reattachConfig *plugin.ReattachConfig) (LogMon, *plugin.Client, error) {
    conf := &plugin.ClientConfig{
        HandshakeConfig: base.Handshake,
        Plugins: map[string]plugin.Plugin{
            "logmon": &Plugin{},
        },
        AllowedProtocols: []plugin.Protocol{plugin.ProtocolGRPC},
        Logger:           logger,
    }
    if reattachConfig == nil {
        conf.Cmd = exec.Command(bin, "logmon")
    } else {
        conf.Reattach = reattachConfig
    }
    client := plugin.NewClient(conf)
    rpcClient, err := client.Client()
    ...
    raw, err := rpcClient.Dispense("logmon")
    ...
    l := raw.(LogMon)
    return l, client, nil
}

type Plugin struct {
    plugin.NetRPCUnsupportedPlugin
    impl LogMon
}

func (p *Plugin) GRPCServer(broker *plugin.GRPCBroker, s *grpc.Server) error {
    proto.RegisterLogMonServer(s, &logmonServer{impl: p.impl, broker: broker})
    return nil
}

func (p *Plugin) GRPCClient(ctx context.Context, broker *plugin.GRPCBroker, c *grpc.ClientConn) (interface{}, error) {
    return &logmonClient{doneCtx: ctx, client: proto.NewLogMonClient(c)}, nil
}
```

**特点：**
- 使用单个插件名 `"logmon"`，不注册 base
- 主进程通过 `bin, _ := os.Executable()` 获取自身路径，`exec.Command(bin, "logmon")` 启动子进程
- 服务器端实现 [client/logmon/server.go](file:///d:/claude/nomad/client/logmon/server.go) 提供 `Start`/`Stop` 方法
- reattach 场景下会通过 `rpcClient.Ping()` 验证连接有效性

### 12.2 executor（任务执行器）

#### 源码位置
[drivers/shared/executor/executor_plugin.go](file:///d:/claude/nomad/drivers/shared/executor/executor_plugin.go)

```go
type ExecutorPlugin struct {
    plugin.NetRPCUnsupportedPlugin
    logger      hclog.Logger
    fsIsolation bool
    compute     cpustats.Compute
}

func (p *ExecutorPlugin) GRPCServer(broker *plugin.GRPCBroker, s *grpc.Server) error {
    if p.fsIsolation {
        proto.RegisterExecutorServer(s, &grpcExecutorServer{impl: NewExecutorWithIsolation(p.logger, p.compute)})
    } else {
        proto.RegisterExecutorServer(s, &grpcExecutorServer{impl: NewExecutor(p.logger, p.compute)})
    }
    return nil
}

func (p *ExecutorPlugin) GRPCClient(ctx context.Context, broker *plugin.GRPCBroker, c *grpc.ClientConn) (interface{}, error) {
    return &grpcExecutorClient{
        client:  proto.NewExecutorClient(c),
        doneCtx: ctx,
        logger:  p.logger,
    }, nil
}
```

#### 子进程入口（init 自动注册）
[drivers/shared/executor/z_executor_cmd.go](file:///d:/claude/nomad/drivers/shared/executor/z_executor_cmd.go)

```go
func init() {
    if len(os.Args) > 1 && os.Args[1] == "executor" {
        if len(os.Args) != 3 { hclog.L().Error("json configuration not provided"); os.Exit(1) }
        config := os.Args[2]
        var executorConfig ExecutorConfig
        if err := json.Unmarshal([]byte(config), &executorConfig); err != nil { os.Exit(1) }
        // ... 创建 logger，打开日志文件 ...
        plugin.Serve(&plugin.ServeConfig{
            HandshakeConfig: base.Handshake,
            Plugins: GetPluginMap(logger, executorConfig.FSIsolation, executorConfig.Compute),
            GRPCServer: plugin.DefaultGRPCServer,
            Logger:     logger,
        })
        os.Exit(0)
    }
}
```

**特点：**
- 使用 `init()` 函数自动注册子进程入口，被引用即生效
- 文件名以 `z_` 前缀确保 `init()` 最后执行（依赖其他 `init()` 完成必要初始化）
- 通过 `os.Args[2]` 接收 JSON 配置（日志路径、FS 隔离、CPU 计算方式）

### 12.3 docker_logger（Docker 日志收集器）

#### 源码位置
[drivers/docker/docklog/plugin.go](file:///d:/claude/nomad/drivers/docker/docklog/plugin.go)

```go
const PluginName = "docker_logger"

func LaunchDockerLogger(logger hclog.Logger) (DockerLogger, *plugin.Client, error) {
    bin, err := os.Executable()
    client := plugin.NewClient(&plugin.ClientConfig{
        HandshakeConfig: base.Handshake,
        Plugins: map[string]plugin.Plugin{
            PluginName: &Plugin{impl: NewDockerLogger(logger)},
        },
        Cmd:              exec.Command(bin, PluginName),
        AllowedProtocols: []plugin.Protocol{plugin.ProtocolGRPC},
        Logger:           logger,
    })
    rpcClient, err := client.Client()
    raw, err := rpcClient.Dispense(PluginName)
    return raw.(DockerLogger), client, nil
}

func ReattachDockerLogger(reattachCfg *plugin.ReattachConfig) (DockerLogger, *plugin.Client, error) {
    client := plugin.NewClient(&plugin.ClientConfig{
        HandshakeConfig: base.Handshake,
        Plugins: map[string]plugin.Plugin{
            PluginName: &Plugin{impl: NewDockerLogger(hclog.L().Named(PluginName))},
        },
        Reattach:         reattachCfg,
        AllowedProtocols: []plugin.Protocol{plugin.ProtocolGRPC},
    })
    ...
}
```

#### 子进程入口
[drivers/docker/cmd/main.go](file:///d:/claude/nomad/drivers/docker/cmd/main.go)

```go
func main() {
    if len(os.Args) > 1 {
        switch os.Args[1] {
        case docklog.PluginName:    // "docker_logger"
            logger := log.New(...)
            plugin.Serve(&plugin.ServeConfig{
                HandshakeConfig: base.Handshake,
                Plugins: map[string]plugin.Plugin{
                    docklog.PluginName: docklog.NewPlugin(docklog.NewDockerLogger(logger)),
                },
                GRPCServer: plugin.DefaultGRPCServer,
                Logger:     logger,
            })
            return
        }
    }
    plugins.ServeCtx(factory)   // 默认作为 docker 驱动插件启动
}

func factory(ctx context.Context, log log.Logger) interface{} {
    return docker.NewDockerDriver(ctx, log)
}
```

**特点：**
- 同一个二进制（`drivers/docker/cmd/main.go` 编译产物）通过 `os.Args[1]` 切换两种身份：
  - `docker_logger` → 启动 docker 日志收集子插件
  - 其他参数 → 作为外部 docker 驱动插件启动
- 这种设计让外部 docker 插件二进制可以独立分发，同时复用 docklog 子进程

---

## 13. 插件启动入口 Serve 与 ServeCtx

### 源码位置
[plugins/serve.go](file:///d:/claude/nomad/plugins/serve.go)

```go
type PluginFactory func(log log.Logger) interface{}
type PluginCtxFactory func(ctx context.Context, log log.Logger) interface{}

func Serve(f PluginFactory) {
    logger := log.New(&log.LoggerOptions{Level: log.Trace, JSONFormat: true})
    plugin := f(logger)
    serve(plugin, logger)
}

func ServeCtx(f PluginCtxFactory) {
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()
    logger := log.New(&log.LoggerOptions{Level: log.Trace, JSONFormat: true})
    plugin := f(ctx, logger)
    serve(plugin, logger)
}

func serve(plugin interface{}, logger log.Logger) {
    switch p := plugin.(type) {
    case device.DevicePlugin:
        device.Serve(p, logger)
    case drivers.DriverPlugin:
        drivers.Serve(p, logger)
    default:
        fmt.Println("Unsupported plugin type")
    }
}
```

**作用：**
- `Serve`/`ServeCtx` 是面向外部插件二进制的统一入口
- 通过类型断言分发到 `device.Serve` 或 `drivers.Serve`
- 外部插件二进制（如 `drivers/docker/cmd/main.go`）调用 `plugins.ServeCtx(factory)` 即可成为符合规范的 Nomad 插件

---

## 14. 典型调用链

### 14.1 Agent 启动时加载插件

```
command/agent/command.go: AgentCommand.Run
  → readConfig
  → setupAgent
    → agent.go: NewAgent
      → setupClient
        → client.NewClient
          → client.go: NewClient
            → devicemanager.New / drivermanager.New
            → pluginloader = loader.NewPluginLoader(...)
            → singletonLoader = singleton.NewSingletonLoader(logger, pluginloader)
      → setupServer (server 端不直接使用插件)
```

### 14.2 创建外部 docker 驱动实例

```
drivermanager.Run
  → 遍历 loader.Catalog()[base.PluginTypeDriver]
  → newInstanceManager(...)  为每个驱动创建 instanceManager
  → readyCh close

allocrunner 需要 docker 驱动
  → drivermanager.Dispense("docker")
    → manager.dispense()
      → instanceManager.dispense()
        → loader.Dispense("docker", "driver", ...)
          → SingletonLoader.Dispense
            → getPlugin(false, "docker", "driver", ...)
              → future wait
              → s.loader.Dispense(...)
                → PluginLoader.Dispense
                  → pinfo.factory == nil  (外部插件)
                  → dispensePlugin("driver", apiVersion, exePath, args, nil, logger)
                    → plugin.NewClient(ClientConfig{Cmd: exec.Command(exePath, args...)})
                    → client.Client() → rpcClient
                    → rpcClient.Dispense("driver") → raw (driverPluginClient)
                    → instance = externalPluginInstance{client, raw, apiVersion}
                  → instance.Plugin().(base.BasePlugin).SetConfig(c)
                  → return instance
```

### 14.3 跨重启 reattach 流程

```
Agent 上次退出前：
  drivermanager.storePluginReattachConfig(id, c)
    → m.reattachConfigs[id] = pstructs.ReattachConfigFromGoPlugin(c)
    → m.state.PutDriverPluginState(s)  (持久化到 BoltDB)

Agent 重启后：
  drivermanager.Run
    → loadReattachConfigs
      → m.state.GetDriverPluginState()
      → 对每个 reattach 调用 m.reattachConfigs[id] = c
    → newInstanceManager(... FetchReattach: fetchFn ...)
      → instanceManager 启动时调用 fetchFn 获取 reattach
      → loader.Reattach(name, type, reattach)
        → PluginLoader.Reattach → dispensePlugin(type, "", "", nil, reattach, logger)
          → plugin.NewClient(ClientConfig{Reattach: reattach})
          → client.Client() 连接已运行进程
          → rpcClient.Dispense(pluginType)
          → 调用 bplugin.PluginInfo() 重新发现 apiVersion
```

---

## 15. 源码文件索引

### 核心框架文件

| 文件路径 | 关键内容 |
|---------|---------|
| [plugins/base/plugin.go](file:///d:/claude/nomad/plugins/base/plugin.go) | `Handshake`、`PluginBase`、`GRPCServer/GRPCClient`、MsgPack 工具 |
| [plugins/base/server.go](file:///d:/claude/nomad/plugins/base/server.go) | `basePluginServer` 实现 `PluginInfo`/`ConfigSchema`/`SetConfig` |
| [plugins/drivers/plugin.go](file:///d:/claude/nomad/plugins/drivers/plugin.go) | `PluginDriver`、`NewDriverPlugin`、`Serve(d, logger)` |
| [plugins/drivers/server.go](file:///d:/claude/nomad/plugins/drivers/server.go) | `driverPluginServer` 实现 `Init`/`Capabilities`/`Fingerprint`/`Start` 等 |
| [plugins/device/plugin.go](file:///d:/claude/nomad/plugins/device/plugin.go) | `PluginDevice`、`Serve(dev, logger)` |
| [plugins/device/server.go](file:///d:/claude/nomad/plugins/device/server.go) | `devicePluginServer` 实现 `Fingerprint`/`Reserve`/`Stats` |
| [plugins/serve.go](file:///d:/claude/nomad/plugins/serve.go) | 顶层 `Serve`/`ServeCtx`/`serve` 分发 |

### 加载器与管理器

| 文件路径 | 关键内容 |
|---------|---------|
| [helper/pluginutils/loader/loader.go](file:///d:/claude/nomad/helper/pluginutils/loader/loader.go) | `PluginCatalog`/`PluginLoader`/`Dispense`/`Reattach`/`dispensePlugin`/`getPluginMap`/`Catalog` |
| [helper/pluginutils/loader/init.go](file:///d:/claude/nomad/helper/pluginutils/loader/init.go) | `validateConfig`/`init`/`initInternal`/`selectApiVersion`/`scan`/`fingerprintPlugins`/`mergePlugins`/`validatePluginConfigs` |
| [helper/pluginutils/loader/instance.go](file:///d:/claude/nomad/helper/pluginutils/loader/instance.go) | `PluginInstance` 接口、`internalPluginInstance`、`externalPluginInstance` |
| [helper/pluginutils/singleton/singleton.go](file:///d:/claude/nomad/helper/pluginutils/singleton/singleton.go) | `SingletonLoader`、`getPlugin`、future 模式 |
| [client/devicemanager/manager.go](file:///d:/claude/nomad/client/devicemanager/manager.go) | 设备插件管理器 |
| [client/pluginmanager/drivermanager/manager.go](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go) | 驱动插件管理器 |

### Reattach 与共享结构

| 文件路径 | 关键内容 |
|---------|---------|
| [plugins/shared/structs/plugin_reattach_config.go](file:///d:/claude/nomad/plugins/shared/structs/plugin_reattach_config.go) | `ReattachConfig` 包装与 `ReattachConfigToGoPlugin`/`ReattachConfigFromGoPlugin` 转换 |

### 内置子插件

| 文件路径 | 关键内容 |
|---------|---------|
| [client/logmon/plugin.go](file:///d:/claude/nomad/client/logmon/plugin.go) | `LaunchLogMon`、`Plugin`、`GRPCServer/GRPCClient` |
| [client/logmon/server.go](file:///d:/claude/nomad/client/logmon/server.go) | `logmonServer` 实现 `Start`/`Stop` |
| [drivers/shared/executor/executor_plugin.go](file:///d:/claude/nomad/drivers/shared/executor/executor_plugin.go) | `ExecutorPlugin`、`GRPCServer/GRPCClient` |
| [drivers/shared/executor/z_executor_cmd.go](file:///d:/claude/nomad/drivers/shared/executor/z_executor_cmd.go) | `init()` 子进程入口，解析 JSON 配置 |
| [drivers/docker/docklog/plugin.go](file:///d:/claude/nomad/drivers/docker/docklog/plugin.go) | `LaunchDockerLogger`/`ReattachDockerLogger`/`Plugin` |
| [drivers/docker/cmd/main.go](file:///d:/claude/nomad/drivers/docker/cmd/main.go) | 外部 docker 插件二进制入口（同时支持 `docker_logger` 与默认驱动模式） |

### 其他相关文件（grep 发现，未在本文详细展开）

```
drivers/docker/driver.go, handle.go           # docker 驱动调用 docklog
drivers/rawexec/handle.go                     # rawexec 使用 executor
drivers/qemu/handle.go                        # qemu 使用 executor
drivers/java/handle.go                        # java 使用 executor
drivers/exec/handle.go                        # exec 使用 executor
drivers/shared/executor/plugins.go            # executor 辅助
client/allocrunner/taskrunner/logmon_hook.go  # taskrunner 启动 logmon
helper/pluginutils/loader/testing.go          # 测试辅助
plugins/shared/cmd/launcher/command/device.go # 命令行工具
client/logmon/z_logmon_cmd.go                 # logmon 子进程入口
drivers/docker/docklog/z_docker_logger_cmd.go # docker_logger 子进程入口
```

---

## 附录：go-plugin 关键 API 速查

| API | 用途 |
|-----|------|
| `plugin.Serve(cfg *ServeConfig)` | 子进程入口，阻塞直到插件退出 |
| `plugin.NewClient(cfg *ClientConfig) *Client` | 主进程创建插件客户端 |
| `client.Client() (PluginClient, error)` | 建立 gRPC 连接 |
| `rpcClient.Dispense(name) (interface{}, error)` | 按名字获取插件接口 |
| `client.ReattachConfig() *ReattachConfig` | 获取 reattach 信息 |
| `client.Exited() bool` | 检查插件进程是否已退出 |
| `client.Kill()` | 终止插件进程 |
| `plugin.DefaultGRPCServer` | 默认 gRPC server 工厂 |
| `plugin.ProtocolGRPC` | 声明使用 gRPC 协议 |
| `plugin.GRPCBroker` | 双向子通道 broker（用于 stream 接口） |
| `plugin.NetRPCUnsupportedPlugin` | 占位结构，声明不使用 net/rpc |

---

*本文档基于 Nomad 源码（截至 2026-07-21）整理。所有源码引用均带可点击链接，便于读者直接跳转查看。*
