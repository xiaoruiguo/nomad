# Nomad Client 启动流程分析

本文档分析 Nomad Client 的启动流程及涉及的代码实现，涵盖从 Agent 命令入口到 Client 完整运行的全过程。

---

## 1. 总体架构

Nomad Agent 是一个同时可承载 Server 和 Client 角色的进程。Client 负责向 Server 注册节点、接收分配（Allocation）、运行任务驱动（Task Driver）、上报状态。

```
┌─────────────────────────────────────────────────────────────────────┐
│                       nomad agent 命令                              │
│   command/agent/command.go → setupAgent → NewAgent                 │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │                  Agent (command/agent/agent.go)             │   │
│   │                                                             │   │
│   │   setupServer()  ──►  nomad.Server  (可选)                  │   │
│   │   setupClient()  ──►  client.Client (本文档焦点)            │   │
│   │   NewHTTPServers()──►  HTTP API                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              Client (client/client.go)                      │   │
│   │                                                             │   │
│   │   init()              → 初始化状态目录/DB                   │   │
│   │   setupNode()         → 生成节点 ID/属性                    │   │
│   │   FingerprintManager  → 探测主机硬件/驱动                   │   │
│   │   pluginManagers      → DriverManager/DeviceManager/CSI/HV  │   │
│   │   registerAndHeartbeat→ 注册节点 + 心跳                     │   │
│   │   restoreState()      → 恢复已有分配                        │   │
│   │   run()               → 主循环（监听分配更新）              │   │
│   │   allocSync()         → 上报分配状态到 Server               │   │
│   │   emitStats()         → 上报主机指标                        │   │
│   └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. 启动入口链路

### 2.1 命令入口

**文件**：[command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go)

`nomad agent` 命令的执行入口：

```
Command.Run (command.go)
  └─ setupAgent (command.go:668)
       └─ NewAgent (agent.go:150)
            ├─ setupConsuls        (Consul 客户端初始化)
            ├─ setupServer         (若启用 Server 模式)
            ├─ setupClient         (若启用 Client 模式)  ← 关键
            └─ setupEnterpriseAgent
```

### 2.2 Agent.NewAgent

**文件**：[command/agent/agent.go:150](file:///d:/claude/nomad/command/agent/agent.go#L150)

```go
func NewAgent(config *Config, logger log.InterceptLogger, logOutput io.Writer, inmem *metrics.InmemSink) (*Agent, error) {
    a := &Agent{config: config, logOutput: logOutput, shutdownCh: make(chan struct{}), inmemSink: inmem}
    // ...
    if err := a.setupConsuls(config.Consuls); err != nil { return nil, ... }
    if err := a.setupServer(); err != nil { return nil, err }
    if err := a.setupClient(); err != nil { return nil, err }     // ← Client 启动入口
    if err := a.setupEnterpriseAgent(logger); err != nil { return nil, err }
    if a.client == nil && a.server == nil {
        return nil, fmt.Errorf("must have at least client or server mode enabled")
    }
    // TLS 指标监控...
    return a, nil
}
```

### 2.3 Agent.setupClient

**文件**：[command/agent/agent.go:1355](file:///d:/claude/nomad/command/agent/agent.go#L1355)

```go
func (a *Agent) setupClient() error {
    if !a.config.Client.Enabled {
        return nil
    }
    // 1. 插件设置（必须在 clientConfig 之前，复制 loader 指针）
    if err := a.setupPlugins(); err != nil { return err }

    // 2. 构建 Client 配置
    conf, err := a.clientConfig()
    if err != nil { return fmt.Errorf("client setup failed: %v", err) }

    // 3. Windows 端口预留
    if runtime.GOOS == "windows" {
        if err := a.reservePortsForClient(conf); err != nil { return err }
    }

    // 4. 状态 DB 工厂
    if conf.StateDBFactory == nil {
        conf.StateDBFactory = state.GetStateDBFactory(conf.DevMode)
    }

    // 5. 内置 listener/dialer（用于 consul-template 调用 Nomad API）
    a.builtinListener, a.builtinDialer = bufconndialer.New()
    conf.TemplateDialer = a.builtinDialer

    // 6. 内置 Task API server
    a.taskAPIServer = newBuiltinAPI()
    conf.APIListenerRegistrar = a.taskAPIServer

    // 7. 创建 Client（核心调用）
    nomadClient, err := client.NewClient(conf,
        a.consulCatalog,      // 自身服务发现
        a.consulProxiesFunc,  // Envoy 版本探测
        a.consulServices,     // 工作负载服务发现
        nil,                  // 使用标准 RPC 集合
    )
    if err != nil { return fmt.Errorf("client setup failed: %v", err) }
    a.client = nomadClient

    // 8. 注册 Nomad Client 服务到 Consul（若启用 AutoAdvertise）
    defaultConsul := conf.ConsulConfigs[structs.ConsulDefaultCluster]
    if *defaultConsul.AutoAdvertise {
        // 注册 HTTP 服务 + 健康检查...
    }
    return nil
}
```

---

## 3. Client.NewClient 核心启动流程

**文件**：[client/client.go:361](file:///d:/claude/nomad/client/client.go#L361)

`NewClient` 是 Client 启动的核心函数，按顺序完成以下阶段：

### 阶段 1：基础组件初始化（L362-L420）

```go
func NewClient(cfg *config.Config, ...) (*Client, error) {
    // 1.1 TLS 包装器（若启用 RPC TLS）
    var tlsWrap tlsutil.RegionWrapper
    if cfg.TLSConfig.EnableRPC {
        tw, err := tlsutil.NewTLSConfiguration(cfg.TLSConfig, true, true)
        tlsWrap, err = tw.OutgoingTLSWrapper()
    }

    // 1.2 状态 DB 工厂默认值
    if cfg.StateDBFactory == nil {
        cfg.StateDBFactory = state.GetStateDBFactory(cfg.DevMode)
    }

    // 1.3 创建 Client 结构体
    c := &Client{
        config:            cfg,
        consulCatalog:     consulCatalog,
        consulServices:    consulServices,
        start:             time.Now(),
        connPool:          pool.NewPool(logger, clientRPCCache, clientMaxStreams, tlsWrap, ...),
        tlsWrap:           tlsWrap,
        streamingRpcs:     structs.NewStreamingRpcRegistry(),
        logger:            logger,
        allocs:            make(map[string]interfaces.AllocRunner),
        pendingUpdates:    newPendingClientUpdates(),
        shutdownCh:        make(chan struct{}),
        registeredCh:      make(chan struct{}),
        getter:            getter.New(cfg.Artifact, logger),
        allocrunnerFactory: cfg.AllocRunnerFactory,  // 默认 allocrunner.NewAllocRunner
    }

    // 1.4 节点更新批处理器
    c.batchNodeUpdates = newBatchNodeUpdates(c.logger,
        c.updateNodeFromDriver,
        c.updateNodeFromDevices,
        c.updateNodeFromCSI,
        c.updateNodeFromHostVol,
    )

    // 1.5 Server 管理器（管理已知 Server 列表）
    c.servers = servers.New(c.logger, c.shutdownCh, c)
    go c.servers.Start()  // 启动连接再平衡协程
}
```

### 阶段 2：本地初始化（init）

```go
    // 2. 初始化状态目录、状态 DB、分配目录
    if err := c.init(); err != nil {
        return nil, fmt.Errorf("failed to initialize client: %v", err)
    }
```

**[client.go:683](file:///d:/claude/nomad/client/client.go#L683) `init()`**：
1. 创建/校验 `StateDir`（无配置则用临时目录）
2. 打开状态数据库（BoltDB）：`conf.StateDBFactory(c.logger, conf.StateDir)`
3. 升级状态 DB schema：`db.Upgrade()`
4. 创建/校验 `AllocDir`、`AllocMountsDir`
5. 创建 `HostVolumesDir`（默认 `StateDir/host_volumes`）
6. 初始化 NSD（Nomad Service Discovery）检查存储：`checkstore.NewStore`
7. 迁移旧版 CNI 状态目录（`/var/lib/cni/networks/nomad` → `/var/run/cni/nomad`）

### 阶段 3：动态插件注册表 + RPC 服务端

```go
    // 3.1 动态插件注册表（CSI controller/node 插件）
    c.dynamicRegistry = dynamicplugins.NewRegistry(c.stateDB, map[string]dynamicplugins.PluginDispenser{
        dynamicplugins.PluginTypeCSIController: func(info) { return csi.NewClient(info.ConnectionInfo.SocketPath, ...) },
        dynamicplugins.PluginTypeCSINode:       func(info) { return csi.NewClient(info.ConnectionInfo.SocketPath, ...) },
    })

    // 3.2 客户端 RPC 服务端（处理 Server 发来的反向 RPC）
    c.setupClientRpc(rpcs)

    // 3.3 ACL 状态初始化
    c.clientACLResolver.init()
```

**[client/rpc.go:289](file:///d:/claude/nomad/client/rpc.go#L289) `setupClientRpc`**：
- 创建 `rpc.Server`
- 注册端点：`ClientStats`、`CSI`、`FileSystem`、`Allocations`、`Agent`、`NodeIdentity`、`NodeMeta`、`HostVolume`
- 启动 `rpcConnListener` 协程，监听连接池中的新连接，分发到 `handleNomadConn`（标准 RPC）或 `handleStreamingConn`（流式 RPC）

### 阶段 4：节点设置（setupNode）

```go
    // 4. 设置节点信息
    if err := c.setupNode(); err != nil {
        return nil, fmt.Errorf("node setup failed: %v", err)
    }

    // 4.1 工作负载身份签名器（需在节点密钥生成后）
    c.widsigner = widmgr.NewSigner(widmgr.SignerConfig{
        NodeSecret: c.secretNodeID(),
        Region:     cfg.Region,
        RPC:        c,
    })
```

**[client.go:1610](file:///d:/claude/nomad/client/client.go#L1610) `setupNode()`**：
1. 生成/加载节点 ID 和 SecretID（`ensureNodeID`，持久化到 `node-id` 文件）
2. 初始化 Node 结构体字段：
   - `Attributes`、`Links`、`Drivers`、`CSIControllerPlugins`、`CSINodePlugins`、`Meta`
   - `NodeResources`（含 `Processors` NUMA 拓扑、端口范围）
   - `ReservedResources`
   - `Datacenter`（默认 `dc1`）、`Name`（默认 hostname）
   - `CgroupParent`
   - `HostVolumes`、`HostNetworks`
3. 校验主机卷路径存在性

### 阶段 5：指纹管理器 + 插件管理器

```go
    // 5.1 指纹管理器
    c.fingerprintManager = NewFingerprintManager(
        cfg.PluginSingletonLoader,
        c.GetConfig, cfg.Node, c.shutdownCh,
        c.updateNodeFromFingerprint, c.logger,
    )
    c.pluginManagers = pluginmanager.New(c.logger)

    // 5.2 运行指纹探测（阻塞，返回 InitialResult）
    if ir, err := c.fingerprintManager.Run(); err != nil {
        return nil, fmt.Errorf("fingerprinting failed: %v", err)
    } else {
        c.topology = numalib.NoImpl(ir.Topology)  // NUMA 拓扑
    }
```

**[client/fingerprint_manager.go:84](file:///d:/claude/nomad/client/fingerprint_manager.go#L84) `FingerprintManager.Run`**：
1. 读取 allowlist/denylist 配置
2. 遍历 [client/fingerprint/fingerprint.go:66](file:///d:/claude/nomad/client/fingerprint/fingerprint.go#L66) `BuiltinFingerprints()` 返回的所有内置指纹器
3. 对每个指纹器调用 `fingerprint(name, f)`：
   - 执行 `f.Fingerprint(request, &response)`
   - 通过 `updateNodeAttributes` 回调更新 Node 属性
4. 若指纹器声明 `Periodic()`，启动周期性协程 `runFingerprint`

**内置指纹器**（[client/fingerprint/](file:///d:/claude/nomad/client/fingerprint)）：
| 指纹器 | 探测内容 |
|--------|----------|
| `arch` | CPU 架构 |
| `bridge` | 网桥（Linux） |
| `cgroup` | cgroup 版本 |
| `cni` | CNI 插件 |
| `consul` | Consul 可达性 |
| `cpu` | CPU 核心数/频率/NUMA |
| `env_aws`/`env_azure`/`env_digitalocean`/`env_gce` | 云环境元数据 |
| `host` | 主机名/内核/操作系统 |
| `landlock` | landlock 支持 |
| `memory` | 内存总量 |
| `nomad` | Nomad 版本 |
| `plugins_cni` | CNI 插件路径 |
| `signal` | 支持的信号 |
| `storage` | 磁盘空间 |
| `vault` | Vault 可达性 |
| `dynamic_host_volumes` | 动态主机卷 |

#### 插件管理器注册与运行

```go
    // 5.3 动态工作负载用户池
    c.users = dynamic.New(&dynamic.PoolConfig{
        MinUGID: cfg.Users.MinDynamicUser,
        MaxUGID: cfg.Users.MaxDynamicUser,
    })

    // 5.4 CPU 核心分区管理器（cgroups）
    c.partitions = cgroupslib.GetPartition(c.logger.Named("partitions"),
        c.topology.UsableCores())

    // 5.5 进程管理器
    wranglers, err := proclib.New(&proclib.Configs{
        UsableCores: c.topology.UsableCores(),
        Logger:      c.logger.Named("proclib"),
    })

    // 5.6 驱动允许/禁止列表
    allowlistDrivers := cfg.ReadStringListToMap("driver.allowlist", "driver.whitelist")
    blocklistDrivers := cfg.ReadStringListToMap("driver.denylist", "driver.blacklist")

    // 5.7 CSI 管理器
    csiManager := csimanager.New(csiConfig)
    c.csimanager = csiManager
    c.pluginManagers.RegisterAndRun(csiManager.PluginManager())

    // 5.8 驱动管理器
    drvManager := drivermanager.New(driverConfig)
    c.drivermanager = drvManager
    c.pluginManagers.RegisterAndRun(drvManager)

    // 5.9 设备管理器
    devManager := devicemanager.New(devConfig)
    c.devicemanager = devManager
    c.pluginManagers.RegisterAndRun(devManager)

    // 5.10 主机卷管理器
    c.hostVolumeManager = hvm.NewHostVolumeManager(logger, hvm.Config{...})
    c.pluginManagers.RegisterAndRun(c.hostVolumeManager)
```

**驱动管理器**（[client/pluginmanager/drivermanager/manager.go:142](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go#L142)）：
- `Run()` 从插件目录加载所有驱动插件
- 为每个驱动创建 `instanceManager`（管理单个驱动生命周期）
- 应用 allowlist/blocklist 过滤
- 加载/存储 reattach 配置（用于 Client 重启后重连驱动进程）

### 阶段 6：服务注册包装器 + 首次指纹批处理

```go
    // 6.1 服务注册包装器（Consul + Nomad NSD）
    c.setupNomadServiceRegistrationHandler()
    c.serviceRegWrapper = wrapper.NewHandlerWrapper(c.logger, c.consulServices, c.nomadService)

    // 6.2 批处理首次指纹（减少启动时节点更新次数）
    go c.batchFirstFingerprints()

    // 6.3 心跳停止器（Server 断连时停止特定分配）
    c.heartbeatStop = newHeartbeatStop(c.getAllocRunner, batchFirstFingerprintsTimeout, logger, c.shutdownCh)
    go c.heartbeatStop.watch()
```

**[client/node_updater.go:29](file:///d:/claude/nomad/client/node_updater.go#L29) `batchFirstFingerprints`**：
- 等待所有插件管理器完成首次指纹（超时 50s）
- 批量应用 driver/device/CSI/hostVolume 更新到 Node
- 关闭 `fpInitialized` 通道，通知主流程可继续

### 阶段 7：主机统计 + 垃圾回收

```go
    // 7.1 主机统计收集器
    statsCollector := hoststats.NewHostStatsCollector(c.logger, c.topology, c.GetConfig().AllocDir, c.devicemanager.AllStats)
    c.hostStatsCollector = statsCollector

    // 7.2 分配垃圾回收器
    c.garbageCollector = NewAllocGarbageCollector(c.logger, statsCollector, c, gcConfig)
    go c.garbageCollector.Run()
```

### 阶段 8：Server 发现与连接

```go
    // 8.1 设置静态配置的 Server 列表
    if len(cfg.Servers) > 0 {
        if _, err := c.setServersImpl(cfg.Servers, true); err != nil {
            logger.Warn("none of the configured servers are valid", "error", err)
        }
    }

    // 8.2 Consul 自动加入（若启用）
    if cfg.GetDefaultConsul().ClientAutoJoin != nil && *cfg.GetDefaultConsul().ClientAutoJoin {
        c.shutdownGroup.Go(c.consulDiscovery)
        if c.servers.NumServers() == 0 {
            c.triggerDiscoveryCh <- struct{}{}  // 手动触发发现
        }
    }
```

### 阶段 9：Vault 客户端

```go
    // 9. Vault 客户端（令牌/密钥续期）
    if err := c.setupVaultClients(); err != nil {
        return nil, fmt.Errorf("failed to setup vault client: %v", err)
    }
```

### 阶段 10：等待指纹完成 + 加载节点身份

```go
    // 10.1 等待驱动健康（超时 55s）
    select {
    case <-c.fpInitialized:
    case <-time.After(batchFirstFingerprintsProcessingGrace):
        logger.Warn("batch fingerprint operation timed out; proceeding to register with fingerprinted plugins so far")
    }

    // 10.2 从状态 DB 加载节点身份令牌
    clientIdentity, err := c.stateDB.GetNodeIdentity()
    if clientIdentity != "" {
        c.setNodeIdentityToken(clientIdentity)
    }
```

### 阶段 11：注册 + 心跳 + 状态恢复

```go
    // 11.1 注册并心跳（异步协程）
    c.shutdownGroup.Go(c.registerAndHeartbeat)

    // 11.2 恢复分配状态
    if err := c.restoreState(); err != nil {
        logger.Error("failed to restore state", "error", err)
        return nil, fmt.Errorf("failed to restore state")
    }

    // 11.3 周期性状态快照
    c.shutdownGroup.Go(c.periodicSnapshot)

    // 11.4 分配状态同步
    c.shutdownGroup.Go(c.allocSync)
```

### 阶段 12：启动主循环 + 统计

```go
    // 12.1 统计标签
    c.setupStatsLabels()

    // 12.2 主循环（监听分配更新）
    go c.run()

    // 12.3 统计上报
    c.shutdownGroup.Go(c.emitStats)

    c.logger.Info("started client", "node_id", c.NodeID())
    return c, nil
}
```

---

## 4. 关键后台协程

`NewClient` 启动后，以下协程并行运行：

| 协程 | 文件 | 职责 |
|------|------|------|
| `servers.Start` | [client/servers/manager.go](file:///d:/claude/nomad/client/servers/manager.go) | Server 连接再平衡 |
| `batchFirstFingerprints` | [client/node_updater.go:29](file:///d:/claude/nomad/client/node_updater.go#L29) | 批处理首次指纹（一次性） |
| `heartbeatStop.watch` | client/heartbeat_stop.go | Server 断连时停止分配 |
| `garbageCollector.Run` | client/alloc_gc.go | 分配垃圾回收 |
| `consulDiscovery` | [client/client.go:3126](file:///d:/claude/nomad/client/client.go#L3126) | Consul 自动发现 Server |
| `registerAndHeartbeat` | [client/client.go:1878](file:///d:/claude/nomad/client/client.go#L1878) | 节点注册 + 心跳 |
| `periodicSnapshot` | [client/client.go:1985](file:///d:/claude/nomad/client/client.go#L1985) | 周期性状态快照（60s） |
| `allocSync` | [client/client.go:2403](file:///d:/claude/nomad/client/client.go#L2403) | 上报分配状态到 Server（200ms 批处理） |
| `run` | [client/client.go:2004](file:///d:/claude/nomad/client/client.go#L2004) | 主循环：监听分配更新并应用 |
| `emitStats` | [client/client.go:3246](file:///d:/claude/nomad/client/client.go#L3246) | 主机指标上报 |
| `rpcConnListener` | [client/rpc.go:329](file:///d:/claude/nomad/client/rpc.go#L329) | 监听 Server 反向 RPC 连接 |
| `watchNodeUpdates` | client/client.go | 监听节点属性变更 |
| `watchNodeEvents` | client/client.go | 批量提交节点事件 |
| 各驱动 `instanceManager` | drivermanager/ | 每个驱动一个，管理生命周期 |
| 各周期性指纹器 | fingerprint_manager.go | 按各自周期运行 |

---

## 5. 核心流程详解

### 5.1 节点注册与心跳

**[client/client.go:1878](file:///d:/claude/nomad/client/client.go#L1878) `registerAndHeartbeat`**：

```go
func (c *Client) registerAndHeartbeat() {
    // 1. 注册节点（带重试）
    c.retryRegisterNode()

    // 2. 启动节点更新/事件监听
    go c.watchNodeUpdates()
    go c.watchNodeEvents()

    // 3. 心跳循环
    heartbeat := time.After(helper.RandomStagger(initialHeartbeatStagger))  // 初始 10s 内随机
    for {
        select {
        case <-c.rpcRetryWatcher():
        case <-heartbeat:
        case <-c.shutdownCh:
            return
        }
        if err := c.updateNodeStatus(); err != nil {
            if strings.Contains(err.Error(), "node not found") {
                c.retryRegisterNode()  // 重新注册
            } else {
                heartbeat = time.After(c.getHeartbeatRetryIntv(err))
                c.triggerDiscovery()  // 触发 Consul 发现
            }
        } else {
            heartbeat = time.After(c.heartbeatTTL)  // 按 Server 返回的 TTL
        }
    }
}
```

**注册流程**（[client/client.go:2188](file:///d:/claude/nomad/client/client.go#L2188) `registerNode`）：
1. 构造 `NodeRegisterRequest{Node: c.Node()}`
2. 调用 `UnauthenticatedRPC("Node.Register", &req, &resp)`（首次注册用 intro token）
3. 处理响应：设置 SwitchToServerAddrs、 heartbeatTTL、NumNodes 等
4. 持久化注册状态到 `stateDB.PutNodeRegistration`

**身份令牌获取**（[client/client.go:2116](file:///d:/claude/nomad/client/client.go#L2116) `getRegistrationToken`）：
- 首次启动：使用配置的 `IntroToken`（可为空）
- 已注册：从 stateDB 读取节点身份令牌
- 注册成功后：Server 颁发 workload identity，后续 RPC 使用该令牌

### 5.2 状态恢复

**[client/client.go:1352](file:///d:/claude/nomad/client/client.go#L1352) `restoreState`**：

```go
func (c *Client) restoreState() error {
    if conf.DevMode { return nil }

    // 1. 从状态 DB 读取所有分配
    allocs, allocErrs, err := c.stateDB.GetAllAllocations()

    // 2. 逐个恢复
    for _, alloc := range allocs {
        // 2.1 无本地状态的分配：删除（让 Server 重新调度）
        if !c.hasLocalState(alloc) {
            c.stateDB.DeleteAllocationBucket(alloc.ID, state.WithBatchMode())
            continue
        }

        // 2.2 创建 AllocRunner（使用 NoopPrevAlloc，放弃迁移监听）
        arConf := c.newAllocRunnerConfig(alloc, allocwatcher.NoopPrevAlloc{}, allocwatcher.NoopPrevAlloc{})
        arConf.ServersContactedCh = c.serversContactedCh
        ar, err := c.allocrunnerFactory(arConf)  // allocrunner.NewAllocRunner

        // 2.3 恢复状态
        if err := ar.Restore(); err != nil {
            ar.SetClientStatus(structs.AllocClientStatusFailed)
            ar.Destroy()
            continue
        }

        // 2.4 恢复已确认状态
        allocState, _ := c.stateDB.GetAcknowledgedState(alloc.ID)
        ar.AcknowledgeState(allocState)

        // 2.5 检查是否需要因断连停止
        if c.heartbeatStop.shouldStop(alloc) {
            c.heartbeatStop.stopAlloc(alloc.ID)
            continue
        }

        c.allocs[alloc.ID] = ar
    }

    // 3. 运行所有恢复的分配
    for _, ar := range c.allocs {
        go ar.Run()
    }
    return nil
}
```

### 5.3 主循环（run）

**[client/client.go:2004](file:///d:/claude/nomad/client/client.go#L2004) `run`**：

```go
func (c *Client) run() {
    // 监听分配更新（阻塞式 RPC，等待 Server 推送）
    allocUpdates := make(chan *allocUpdates, 8)
    go c.watchAllocations(allocUpdates)

    for {
        select {
        case update := <-allocUpdates:
            c.shutdownLock.Lock()
            if c.shutdown { c.shutdownLock.Unlock(); return }
            c.runAllocs(update)  // 应用分配变更
            c.shutdownLock.Unlock()
        case <-c.shutdownCh:
            return
        }
    }
}
```

**[client/client.go:2582](file:///d:/claude/nomad/client/client.go#L2582) `watchAllocations`**：
1. 等待 `registeredCh` 关闭（确保已注册）
2. 调用 `Node.GetClientAllocs` RPC（阻塞式，等待 AllocModifyIndex 变更）
3. 对比本地已知 index，拉取新增/更新的分配详情（`Allocs.GetRequest`）
4. 发送 `allocUpdates` 到 channel

**[client/client.go:2769](file:///d:/claude/nomad/client/client.go#L2769) `runAllocs`**：
1. `diffAllocs` 计算新增/移除/更新/忽略
2. 移除：`removeAlloc` → `ar.Destroy()`
3. 更新：`updateAlloc` → `ar.Update(alloc)`
4. 新增：`addAlloc` → 创建 AllocRunner + `ar.Run()`
5. 标记 `serversContactedCh` 关闭（解除恢复任务阻塞）
6. 触发 GC

### 5.4 分配状态同步

**[client/client.go:2403](file:///d:/claude/nomad/client/client.go#L2403) `allocSync`**：

```go
func (c *Client) allocSync() {
    syncTicker := time.NewTicker(allocSyncIntv)  // 200ms
    for {
        select {
        case <-c.shutdownCh: return
        case <-syncTicker.C:
            toSync := c.pendingUpdates.nextBatch(c, updateTicks)
            if len(toSync) == 0 { continue }

            // 批量上报到 Server
            args := structs.AllocUpdateRequest{Alloc: toSync, ...}
            err := c.RPC("Node.UpdateAlloc", &args, &resp)
            if err != nil {
                c.pendingUpdates.restore(toSync)  // 失败回退
                syncTicker.Reset(c.retryIntv(allocSyncRetryIntv))  // 5s 重试
                continue
            }

            // 确认状态已同步
            for _, update := range toSync {
                if ar, ok := c.allocs[update.ID]; ok {
                    ar.AcknowledgeState(...)
                }
            }
        }
    }
}
```

### 5.5 周期性快照

**[client/client.go:1985](file:///d:/claude/nomad/client/client.go#L1985) `periodicSnapshot`**：
- 每 60s 调用 `saveState()` 将状态 DB 刷盘

### 5.6 统计上报

**[client/client.go:3246](file:///d:/claude/nomad/client/client.go#L3246) `emitStats`**：
- 按 `StatsCollectionInterval` 周期收集主机统计
- 若 `PublishNodeMetrics` 启用，上报主机指标
- 上报 Client 指标（内存/CPU/分配数等）

---

## 6. 关闭流程

**[client/client.go:992](file:///d:/claude/nomad/client/client.go#L992) `Shutdown`**：

```go
func (c *Client) Shutdown() error {
    c.shutdownLock.Lock()
    defer c.shutdownLock.Unlock()
    if c.shutdown { return nil }

    // 1. 停止 Vault 续期
    for _, vaultClient := range c.vaultClients { vaultClient.Stop() }

    // 2. 停止垃圾回收
    c.garbageCollector.Stop()

    // 3. 停止所有分配
    if c.GetConfig().DevMode {
        for _, ar := range c.getAllocRunners() {
            ar.Destroy()  // DevMode 直接销毁
        }
    } else {
        for _, ar := range c.getAllocRunners() {
            ar.Shutdown()  // 正常模式优雅关闭
        }
    }
    arGroup.Wait()  // 等待所有分配关闭

    // 4. 停止 Nomad 服务注册
    if h, ok := c.nomadService.(*nsd.ServiceRegistrationHandler); ok { h.Shutdown() }

    // 5. 停止插件管理器（驱动/设备/CSI/主机卷）
    c.pluginManagers.Shutdown()

    // 6. 关闭 shutdownCh
    c.shutdown = true
    close(c.shutdownCh)

    // 7. 关闭连接池
    c.connPool.Shutdown()

    // 8. 等待所有协程退出
    c.shutdownGroup.Wait()

    // 9. 最终状态保存 + 关闭 DB
    c.saveState()
    return c.stateDB.Close()
}
```

---

## 7. 关键数据结构

### 7.1 Client 结构体

**文件**：[client/client.go:145](file:///d:/claude/nomad/client/client.go#L145)

| 字段 | 类型 | 用途 |
|------|------|------|
| `config` | `*config.Config` | 客户端配置（含 Node、TLS、插件等） |
| `stateDB` | `state.StateDB` | 本地状态数据库（BoltDB） |
| `servers` | `*servers.Manager` | 已知 Server 列表管理 |
| `connPool` | `*pool.ConnPool` | RPC 连接池 |
| `allocs` | `map[string]interfaces.AllocRunner` | 运行中的分配 |
| `pendingUpdates` | `*pendingClientUpdates` | 待上报的分配状态变更 |
| `fingerprintManager` | `*FingerprintManager` | 指纹管理器 |
| `pluginManagers` | `*pluginmanager.Manager` | 插件管理器集合 |
| `drivermanager` | `*drivermanager.manager` | 驱动管理器 |
| `devicemanager` | `*devicemanager.Manager` | 设备管理器 |
| `csimanager` | `*csimanager.Manager` | CSI 管理器 |
| `hostVolumeManager` | `*hvm.HostVolumeManager` | 主机卷管理器 |
| `hostStatsCollector` | `*hoststats.HostStatsCollector` | 主机统计 |
| `garbageCollector` | `*AllocGarbageCollector` | 分配 GC |
| `heartbeatStop` | `*heartbeatStop` | 断连停止器 |
| `widsigner` | `*widmgr.Signer` | 工作负载身份签名器 |
| `dynamicRegistry` | `*dynamicplugins.Registry` | 动态插件注册表 |
| `serviceRegWrapper` | `*wrapper.HandlerWrapper` | 服务注册包装器 |
| `topology` | `*numalib.Topology` | NUMA 拓扑 |
| `partitions` | `cgroupslib.Partition` | CPU 核心分区 |
| `wranglers` | `*proclib.Wranglers` | 进程管理器 |
| `users` | `*dynamic.Pool` | 动态用户池 |
| `heartbeatTTL` | `time.Duration` | 心跳 TTL（Server 指定） |
| `registeredCh` | `chan struct{}` | 注册完成通道（Once） |
| `serversContactedCh` | `chan struct{}` | 首次联系 Server 完成通道 |
| `fpInitialized` | `chan struct{}` | 指纹初始化完成通道 |

### 7.2 AllocRunner

**文件**：[client/allocrunner/alloc_runner.go:236](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L236)

每个分配对应一个 `AllocRunner`，负责：
- 创建分配目录
- 运行任务组中的每个 Task（通过 `TaskRunner`）
- 管理钩子（预启动、网络、服务注册等）
- 上报状态到 Client

---

## 8. 文件索引

### 8.1 核心文件

| 文件 | 用途 |
|------|------|
| [client/client.go](file:///d:/claude/nomad/client/client.go) | Client 主结构体、`NewClient`、`init`、`setupNode`、`registerAndHeartbeat`、`restoreState`、`run`、`allocSync`、`Shutdown` |
| [client/rpc.go](file:///d:/claude/nomad/client/rpc.go) | RPC 客户端/服务端、`setupClientRpc`、连接处理 |
| [client/node_updater.go](file:///d:/claude/nomad/client/node_updater.go) | `batchFirstFingerprints`、节点更新批处理 |
| [client/fingerprint_manager.go](file:///d:/claude/nomad/client/fingerprint_manager.go) | 指纹管理器 |
| [client/allocrunner/alloc_runner.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go) | AllocRunner 实现 |
| [client/config/config.go](file:///d:/claude/nomad/client/config/config.go) | Client 配置 |

### 8.2 Agent 层

| 文件 | 用途 |
|------|------|
| [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | `nomad agent` 命令入口、`setupAgent` |
| [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | `NewAgent`、`setupClient` |

### 8.3 插件管理

| 文件 | 用途 |
|------|------|
| [client/pluginmanager/pluginmanager.go](file:///d:/claude/nomad/client/pluginmanager/pluginmanager.go) | 插件管理器集合 |
| [client/pluginmanager/drivermanager/manager.go](file:///d:/claude/nomad/client/pluginmanager/drivermanager/manager.go) | 驱动管理器 |
| [client/pluginmanager/csimanager/](file:///d:/claude/nomad/client/pluginmanager/csimanager) | CSI 管理器 |
| [client/devicemanager/](file:///d:/claude/nomad/client/devicemanager) | 设备管理器 |

### 8.4 指纹

| 文件 | 用途 |
|------|------|
| [client/fingerprint/fingerprint.go](file:///d:/claude/nomad/client/fingerprint/fingerprint.go) | 指纹接口、`BuiltinFingerprints` |
| [client/fingerprint/cpu.go](file:///d:/claude/nomad/client/fingerprint/cpu.go) | CPU 指纹 |
| [client/fingerprint/memory.go](file:///d:/claude/nomad/client/fingerprint/memory.go) | 内存指纹 |
| [client/fingerprint/storage.go](file:///d:/claude/nomad/client/fingerprint/storage.go) | 磁盘指纹 |
| [client/fingerprint/network.go](file:///d:/claude/nomad/client/fingerprint/network.go) | 网络指纹 |
| [client/fingerprint/host.go](file:///d:/claude/nomad/client/fingerprint/host.go) | 主机指纹 |
| [client/fingerprint/consul.go](file:///d:/claude/nomad/client/fingerprint/consul.go) | Consul 探测 |
| [client/fingerprint/vault.go](file:///d:/claude/nomad/client/fingerprint/vault.go) | Vault 探测 |

### 8.5 状态与统计

| 文件 | 用途 |
|------|------|
| [client/state/](file:///d:/claude/nomad/client/state) | 状态 DB（BoltDB） |
| [client/hoststats/](file:///d:/claude/nomad/client/hoststats) | 主机统计 |
| [client/servers/manager.go](file:///d:/claude/nomad/client/servers/manager.go) | Server 列表管理 |
| [client/widmgr/](file:///d:/claude/nomad/client/widmgr) | 工作负载身份管理 |
| [client/vaultclient/](file:///d:/claude/nomad/client/vaultclient) | Vault 客户端 |

### 8.6 服务注册

| 文件 | 用途 |
|------|------|
| [client/serviceregistration/wrapper/](file:///d:/claude/nomad/client/serviceregistration/wrapper) | 服务注册包装器 |
| [client/serviceregistration/nsd/](file:///d:/claude/nomad/client/serviceregistration/nsd) | Nomad 服务发现 |
| [client/serviceregistration/checks/checkstore/](file:///d:/claude/nomad/client/serviceregistration/checks/checkstore) | 检查存储 |

---

## 9. 启动时序图

```
nomad agent 命令
    │
    ▼
setupAgent (command.go)
    │
    ▼
NewAgent (agent.go:150)
    │
    ├─ setupConsuls
    ├─ setupServer (可选)
    ├─ setupClient ──────────────────────────────────┐
    │                                                 │
    │   ┌─────────────────────────────────────────────┘
    │   ▼
    │   setupPlugins (加载插件 loader)
    │   clientConfig (构建配置)
    │   StateDBFactory 设置
    │   builtinListener/Dialer (consul-template 用)
    │   taskAPIServer (内置 Task API)
    │       │
    │       ▼
    │   client.NewClient (client.go:361)
    │       │
    │       ├─ TLS 包装器
    │       ├─ 创建 Client 结构体
    │       ├─ servers.New + go servers.Start
    │       │
    │       ├─ init()                              [阶段2]
    │       │   ├─ 创建 StateDir/AllocDir
    │       │   ├─ 打开+升级 StateDB
    │       │   └─ checkStore 初始化
    │       │
    │       ├─ dynamicRegistry (CSI 动态插件)      [阶段3]
    │       ├─ setupClientRpc (RPC 服务端)
    │       ├─ clientACLResolver.init
    │       │
    │       ├─ setupNode()                         [阶段4]
    │       │   ├─ ensureNodeID (生成/加载节点 ID)
    │       │   └─ 初始化 Node 结构体
    │       ├─ widsigner (身份签名器)
    │       │
    │       ├─ FingerprintManager.Run()            [阶段5]
    │       │   ├─ 遍历内置指纹器
    │       │   ├─ 执行首次指纹
    │       │   └─ 启动周期性指纹协程
    │       │
    │       ├─ users (动态用户池)
    │       ├─ partitions (cgroups 分区)
    │       ├─ wranglers (进程管理器)
    │       │
    │       ├─ pluginManagers 注册并运行:          [阶段5.7-5.10]
    │       │   ├─ csimanager
    │       │   ├─ drivermanager (加载所有驱动插件)
    │       │   ├─ devicemanager
    │       │   └─ hostVolumeManager
    │       │
    │       ├─ serviceRegWrapper (服务注册)        [阶段6]
    │       ├─ go batchFirstFingerprints (批处理)
    │       ├─ heartbeatStop + go watch
    │       │
    │       ├─ hostStatsCollector                   [阶段7]
    │       ├─ garbageCollector + go Run
    │       │
    │       ├─ setServersImpl (静态 Server 列表)   [阶段8]
    │       ├─ go consulDiscovery (若启用 AutoJoin)
    │       │
    │       ├─ setupVaultClients                    [阶段9]
    │       │
    │       ├─ 等待 fpInitialized (超时 55s)       [阶段10]
    │       ├─ 加载节点身份令牌
    │       │
    │       ├─ go registerAndHeartbeat             [阶段11]
    │       │   ├─ retryRegisterNode (Node.Register RPC)
    │       │   ├─ go watchNodeUpdates
    │       ├─ go watchNodeEvents
    │       │   └─ 心跳循环 (按 TTL)
    │       │
    │       ├─ restoreState() (恢复分配)
    │       │   ├─ GetAllAllocations
    │       │   ├─ 为每个 alloc 创建 AllocRunner
    │       │   ├─ ar.Restore()
    │       │   └─ go ar.Run()
    │       │
    │       ├─ go periodicSnapshot (60s)
    │       ├─ go allocSync (200ms 批处理上报)
    │       │
    │       ├─ setupStatsLabels                    [阶段12]
    │       ├─ go run() (主循环)
    │       │   ├─ go watchAllocations (阻塞式 RPC)
    │       │   └─ select allocUpdates → runAllocs
    │       │
    │       └─ go emitStats
    │
    ▼
返回 Client，Agent 继续启动 HTTP Server
```

---

## 10. 设计要点

1. **同步初始化 + 异步运行**：`NewClient` 同步完成所有初始化（配置、DB、插件、指纹），然后启动多个后台协程处理运行时任务。
2. **状态持久化**：使用 BoltDB 本地状态库，支持 Client 重启后恢复分配（`restoreState` + `RecoverTask`）。
3. **指纹批处理**：启动时等待所有插件管理器完成首次指纹（50s 超时），合并为单次节点更新，减少 Server 压力。
4. **Server 发现多层机制**：静态配置 → Consul AutoJoin → 重试。`servers.Manager` 管理连接再平衡。
5. **身份与认证**：首次注册用 `IntroToken`，注册成功后 Server 颁发 workload identity，`widsigner` 负责签名和续期。
6. **优雅关闭**：`Shutdown` 先停止分配（正常 Shutdown 或 DevMode Destroy），再停插件，最后保存状态。
7. **反向 RPC**：Client 也运行 RPC 服务端（`setupClientRpc`），Server 可主动发起连接执行 `Node.Register`、`Allocations`、`FileSystem` 等操作。
8. **心跳自适应**：初始心跳 10s 内随机，注册成功后按 Server 返回的 TTL；失败时按剩余 TTL 指数退避。
9. **分配状态批处理**：`allocSync` 每 200ms 批量上报分配状态，减少 RPC 次数。
10. **插件隔离**：每个驱动是独立 gRPC 进程（go-plugin），崩溃不影响 Client；`instanceManager` 管理生命周期和 reattach。
