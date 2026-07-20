# Nomad `agent -dev` 命令执行过程深度分析

> 文档主题：深入分析 `nomad agent -dev` 命令的完整执行流程
> 命令：`/usr/local/bin/nomad agent -dev`
> 源码仓库：[d:/claude/nomad](file:///d:/claude/nomad)
> 关键源文件：[main.go](file:///d:/claude/nomad/main.go)、[command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go)、[command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go)、[command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go)、[nomad/server.go](file:///d:/claude/nomad/nomad/server.go)

---

## 目录

1. [执行流程总览](#1-执行流程总览)
2. [Phase 1：main 入口](#phase-1main-入口)
3. [Phase 2：CLI 分发到 agent 命令](#phase-2cli-分发到-agent-命令)
4. [Phase 3：readConfig - 读取并构建配置](#phase-3readconfig---读取并构建配置)
5. [Phase 4：DevConfig 生成开发模式配置](#phase-4devconfig-生成开发模式配置)
6. [Phase 5：SetupLoggers - 日志系统初始化](#phase-5setuploggers---日志系统初始化)
7. [Phase 6：setupTelemetry - 监控指标初始化](#phase-6setuptelemetry---监控指标初始化)
8. [Phase 7：setupAgent - 创建 Agent](#phase-7setupagent---创建-agent)
9. [Phase 8：NewAgent 内部组件初始化](#phase-8newagent-内部组件初始化)
10. [Phase 9：setupServer - Server 模式初始化](#phase-9setupserver---server-模式初始化)
11. [Phase 10：nomad.NewServer - 创建 Server 实例](#phase-10nomadnewserver---创建-server-实例)
12. [Phase 11：setupRaft - Raft 共识层初始化（dev 简化版）](#phase-11setupraft---raft-共识层初始化dev-简化版)
13. [Phase 12：setupSerf - Serf 成员发现（dev 简化版）](#phase-12setupserf---serf-成员发现dev-简化版)
14. [Phase 13：setupWorkers - 调度 worker 启动](#phase-13setupworkers---调度-worker-启动)
15. [Phase 14：monitorLeadership - 领导权维护](#phase-14monitorleadership---领导权维护)
16. [Phase 15：setupClient - Client 模式初始化](#phase-15setupclient---client-模式初始化)
17. [Phase 16：NewHTTPServers - HTTP 服务器启动](#phase-16newhttpservers---http-服务器启动)
18. [Phase 17：startupJoin - 节点加入](#phase-17startupjoin---节点加入)
19. [Phase 18：handleRetryJoin - 重试加入逻辑](#phase-18handleretryjoin---重试加入逻辑)
20. [Phase 19：handleSignals - 信号处理与阻塞等待](#phase-19handlesignals---信号处理与阻塞等待)
21. [Phase 20：优雅关闭流程](#phase-20优雅关闭流程)
22. [Dev 模式与生产模式对比](#dev-模式与生产模式对比)
23. [关键调用链汇总](#关键调用链汇总)
24. [源码索引](#源码索引)

---

## 1. 执行流程总览

```
nomad agent -dev
    │
    ▼
[main.main]                                          main.go:81
    │
    ├─▶ command.Commands() 注册 "agent" 命令
    │
    └─▶ cli.Run() 分发
            │
            ▼
[AgentCommand.Run]                                   command/agent/command.go:817
    │
    ├─ Phase 3:  readConfig()                        ─┐
    │              ├─ 解析 -dev flag                 │
    │              ├─ DevConfig(devModeConfig)       │
    │              ├─ config.normalizeAddrs()        │
    │              └─ IsValidConfig()                │
    │                                              ─┘
    ├─ Phase 5:  SetupLoggers()                     ─┐
    │              └─ hclog.NewInterceptLogger      │
    │                                              ─┘
    ├─ Phase 6:  setupTelemetry()                   ─┐
    │              └─ metrics.NewInmemSink          │
    │                                              ─┘
    ├─ Phase 7:  setupAgent()                       ─┐
    │              └─ NewAgent()                    │
    │                  ├─ setupConsuls()            │
    │                  ├─ setupServer()  ◀── Phase 9-14
    │                  │   └─ nomad.NewServer()     │
    │                  │       ├─ setupRPC()        │
    │                  │       ├─ setupRaft()       │
    │                  │       │   └─ InmemStore    │
    │                  │       ├─ setupSerf()       │
    │                  │       ├─ setupWorkers()    │
    │                  │       └─ monitorLeadership()
    │                  ├─ setupClient()  ◀── Phase 15
    │                  │   └─ client.NewClient()    │
    │                  └─ setupEnterpriseAgent()    │
    │              └─ NewHTTPServers()              │
    │                                              ─┘
    ├─ Phase 17: startupJoin()                       ─┐
    │              └─ dev 模式跳过                   │
    │                                              ─┘
    ├─ Phase 18: handleRetryJoin()                   ─┐
    │              └─ dev 模式无 retry_join 配置     │
    │                                              ─┘
    └─ Phase 19: handleSignals()                     ─┐
                   └─ 阻塞等待 SIGINT/SIGTERM        │
                                                 ─┘
```

---

## Phase 1：main 入口

**位置**：[main.go:81-83](file:///d:/claude/nomad/main.go#L81-L83)

```go
func main() {
    os.Exit(Run(os.Args[1:]))
}
```

**说明**：入口点非常简单，调用 `Run(args)` 并将返回值作为进程退出码。

---

## Phase 2：CLI 分发到 agent 命令

**位置**：[main.go:86-119](file:///d:/claude/nomad/main.go#L86-L119)

```go
func Run(args []string) int {
    metaPtr := new(command.Meta)
    metaPtr.SetupUi(args)
    agentUi := &cli.BasicUi{...}
    commands := command.Commands(metaPtr, agentUi)
    cli := &cli.CLI{
        Name:         "nomad",
        Args:         args,
        Commands:     commands,
        ...
    }
    exitCode, err := cli.Run()
    ...
    return exitCode
}
```

**说明**：
1. 创建 `command.Meta` 元数据
2. 通过 `command.Commands()` 获取所有命令映射，其中 `agent` 命令注册为 `AgentCommand`
3. `cli.CLI.Run()` 根据参数 `agent -dev` 分发到 `AgentCommand.Run(args)`

---

## Phase 3：readConfig - 读取并构建配置

**位置**：[command/agent/command.go:64-340](file:///d:/claude/nomad/command/agent/command.go#L64-L340)

### 步骤 3.1：定义 dev 模式 flag

**位置**：[command.go:88-95](file:///d:/claude/nomad/command/agent/command.go#L88-L95)

```go
var devMode bool
var devConnectMode bool
var devConsulMode bool
var devVaultMode bool
flags.BoolVar(&devMode, "dev", false, "")
flags.BoolVar(&devConnectMode, "dev-connect", false, "")
flags.BoolVar(&devConsulMode, "dev-consul", false, "")
flags.BoolVar(&devVaultMode, "dev-vault", false, "")
```

`flags.Parse(args)` 解析后，`devMode` 为 `true`。

### 步骤 3.2：构建 devModeConfig

**位置**：[command.go:241-261](file:///d:/claude/nomad/command/agent/command.go#L241-L261)

```go
devConfig := &devModeConfig{
    defaultMode: devMode,       // true
    connectMode: devConnectMode,// false
    consulMode:  devConsulMode, // false
    vaultMode:   devVaultMode,  // false
}
if devConfig.enabled() {                  // true
    err := devConfig.validate()           // 校验 dev-connect 模式约束
    err = devConfig.networkConfig()       // 决定 bind 地址和网卡
    config = DevConfig(devConfig)         // 生成 dev 模式配置
}
```

### 步骤 3.3：合并企业配置和 CLI 选项

**位置**：[command.go:264-301](file:///d:/claude/nomad/command/agent/command.go#L264-L301)

```go
config = config.Merge(DefaultEntConfig())
// dev 模式无 configPath，跳过 LoadConfig
config = config.Merge(cmdConfig)
config.Version = c.Version
```

### 步骤 3.4：normalizeAddrs - 地址规范化

**位置**：[command.go:307-310](file:///d:/claude/nomad/command/agent/command.go#L307-L310) 调用 [config.go:2387-2406](file:///d:/claude/nomad/command/agent/config.go#L2387-L2406)

```go
if err := config.normalizeAddrs(); err != nil { ... }
```

对 HTTP/RPC/Serf 三种地址进行规范化。`DevMode=true` 时，`normalizeAdvertise` 允许回环地址作为 advertise 地址。

### 步骤 3.5：IsValidConfig - 配置校验

**位置**：[command.go:335-337](file:///d:/claude/nomad/command/agent/command.go#L335-L337) 调用 [command.go:342-574](file:///d:/claude/nomad/command/agent/command.go#L342-L574)

**dev 模式的特殊处理**：

| 检查项 | 生产模式 | dev 模式 |
|--------|----------|----------|
| mTLS 配置警告 | 显示 WARNING | **跳过** ([L374](file:///d:/claude/nomad/command/agent/command.go#L374)) |
| `data_dir` 必填 | 是 | **跳过** ([L513-L531](file:///d:/claude/nomad/command/agent/command.go#L513-L531)) |
| `alloc-dir`、`state-dir` 必填 | 是 | **跳过** |
| `bootstrap-expect=1` 警告 | 显示 | **跳过** |

```go
if !config.DevMode {                       // dev 模式跳过此块
    if config.Server.Enabled && config.DataDir == "" { ... }
    ...
}
```

---

## Phase 4：DevConfig 生成开发模式配置

**位置**：[command/agent/config.go:1759-1820](file:///d:/claude/nomad/command/agent/config.go#L1759-L1820)

```go
func DevConfig(mode *devModeConfig) *Config {
    if mode == nil {
        mode = &devModeConfig{defaultMode: true}
        mode.networkConfig()
    }
    conf := DefaultConfig()
    conf.BindAddr = mode.bindAddr                   // "127.0.0.1"
    conf.LogLevel = "DEBUG"                         // 默认 INFO
    conf.Client.Enabled = true                      // 启用 Client
    conf.Server.Enabled = true                      // 启用 Server
    conf.DevMode = true                             // 标记 dev 模式
    conf.Server.BootstrapExpect = 1                 // 单节点引导
    conf.EnableDebug = true                         // 调试接口
    conf.DisableAnonymousSignature = true           // 关闭匿名签名
    conf.defaultConsul().AutoAdvertise = pointer.Of(true)
    conf.Client.NetworkInterface = mode.iface       // "lo"
    conf.Client.Options = map[string]string{
        "driver.raw_exec.enable": "true",
        "driver.docker.volumes":  "true",
    }
    conf.Client.GCInterval = 10 * time.Minute
    conf.Client.GCDiskUsageThreshold = 99
    conf.Client.GCInodeUsageThreshold = 99
    conf.Client.GCMaxAllocs = 50
    conf.Client.Options[fingerprint.TightenNetworkTimeoutsConfig] = "true"
    conf.Client.BindWildcardDefaultHostNetwork = true
    conf.Client.NomadServiceDiscovery = pointer.Of(true)
    conf.Client.ReservableCores = ""
    conf.Telemetry.PrometheusMetrics = true
    conf.Telemetry.PublishAllocationMetrics = true
    conf.Telemetry.PublishNodeMetrics = true
    conf.Telemetry.IncludeAllocMetadataInMetrics = true
    conf.Telemetry.AllowedMetadataKeysInMetrics = []string{}
    // ... 可选的 consul/vault 模式扩展
}
```

### DevConfig 关键差异表

| 配置项 | 默认值 | DevConfig 值 | 说明 |
|--------|--------|--------------|------|
| `LogLevel` | `"INFO"` | `"DEBUG"` | 更详细日志 |
| `BindAddr` | `"0.0.0.0"` | `"127.0.0.1"` | 仅本地访问 |
| `Client.Enabled` | `false` | `true` | 启用客户端 |
| `Server.Enabled` | `false` | `true` | 启用服务器 |
| `DevMode` | `false` | `true` | dev 标志 |
| `BootstrapExpect` | `0` | `1` | 单节点自引导 |
| `EnableDebug` | `false` | `true` | pprof 端点 |
| `DisableAnonymousSignature` | `false` | `true` | 不发送匿名签名 |
| `Client.NetworkInterface` | 默认网卡 | `"lo"` | 回环网卡 |
| `Client.Options["driver.raw_exec.enable"]` | `"false"` | `"true"` | 允许 raw_exec |
| `Client.Options["driver.docker.volumes"]` | `"false"` | `"true"` | 允许 docker 卷 |
| `Client.GCInterval` | `1m` | `10m` | GC 间隔放宽 |
| `Client.GCDiskUsageThreshold` | `80` | `99` | GC 阈值放宽 |
| `Telemetry.PrometheusMetrics` | `false` | `true` | 启用 Prometheus |

### networkConfig - 网络配置

**位置**：[config.go:1725-1756](file:///d:/claude/nomad/command/agent/config.go#L1725-L1756)

```go
func (mode *devModeConfig) networkConfig() error {
    if runtime.GOOS == "windows" {
        mode.bindAddr = "127.0.0.1"
        mode.iface = "Loopback Pseudo-Interface 1"
        return nil
    }
    if runtime.GOOS == "darwin" {
        mode.bindAddr = "127.0.0.1"
        mode.iface = "lo0"
        return nil
    }
    // Linux 默认 dev 模式（非 connect）
    mode.bindAddr = "127.0.0.1"
    mode.iface = "lo"
    return nil
}
```

---

## Phase 5：SetupLoggers - 日志系统初始化

**位置**：[command/agent/command.go:580-666](file:///d:/claude/nomad/command/agent/command.go#L580-L666) 和 [command.go:841-870](file:///d:/claude/nomad/command/agent/command.go#L841-L870)

```go
logGate, logOutput := SetupLoggers(c.Ui, config)
// logGate 是 gatedwriter，缓冲日志直到 Flush

logger := hclog.NewInterceptLogger(&hclog.LoggerOptions{
    Name:            "agent",
    Level:           hclog.LevelFromString(config.LogLevel),  // DEBUG
    Output:          logOutput,
    JSONFormat:      config.LogJson,
    IncludeLocation: config.LogIncludeLocation,
})

log.SetOutput(logger.StandardWriter(...))  // 包装标准 log 库
```

**dev 模式下日志级别为 DEBUG**，会输出更详细的运行信息。

---

## Phase 6：setupTelemetry - 监控指标初始化

**位置**：[command.go:880-884](file:///d:/claude/nomad/command/agent/command.go#L880-L884)

```go
inmem, err := c.setupTelemetry(config)
```

初始化指标采集系统。dev 模式下启用了 Prometheus 指标，同时内置 `InmemSink` 用于 `/metrics` 端点。

---

## Phase 7：setupAgent - 创建 Agent

**位置**：[command.go:668-719](file:///d:/claude/nomad/command/agent/command.go#L668-L719)

```go
func (c *Command) setupAgent(config *Config, logger hclog.InterceptLogger, ...) error {
    c.Ui.Output("Starting Nomad agent...")
    agent, err := NewAgent(config, logger, logOutput, inmem)  // 创建 Agent
    c.agent = agent
    c.agent.configReloader = c.handleReload

    httpServers, err := NewHTTPServers(agent, config)         // 创建 HTTP 服务器
    c.httpServers = httpServers

    // 启动版本检查（dev 模式也启动，除非 DisableUpdateCheck）
    if config.DisableUpdateCheck != nil && !*config.DisableUpdateCheck {
        checkpoint.CheckInterval(updateParams, 24*time.Hour, c.checkpointResults)
        go func() {
            time.Sleep(helper.RandomStagger(30 * time.Second))
            c.checkpointResults(checkpoint.Check(updateParams))
        }()
    }
    return nil
}
```

---

## Phase 8：NewAgent 内部组件初始化

**位置**：[command/agent/agent.go:150-195](file:///d:/claude/nomad/command/agent/agent.go#L150-L195)

```go
func NewAgent(config *Config, logger log.InterceptLogger, ...) (*Agent, error) {
    a := &Agent{
        config:     config,
        logOutput:  logOutput,
        shutdownCh: make(chan struct{}),
        inmemSink:  inmem,
    }
    a.logger = logger
    a.httpLogger = a.logger.ResetNamed("http")

    // 1. 初始化 Consul 客户端
    if err := a.setupConsuls(config.Consuls); err != nil { ... }

    // 2. 初始化 Server（dev 模式启用）
    if err := a.setupServer(); err != nil { ... }

    // 3. 初始化 Client（dev 模式启用）
    if err := a.setupClient(); err != nil { ... }

    // 4. 企业版 Agent 初始化
    if err := a.setupEnterpriseAgent(logger); err != nil { ... }

    // 5. 校验至少有一个模式启用
    if a.client == nil && a.server == nil {
        return nil, fmt.Errorf("must have at least client or server mode enabled")
    }

    // 6. TLS 指标（dev 模式通常无 TLS，跳过）
    if !a.config.TLSConfig.IsEmpty() { ... }

    return a, nil
}
```

---

## Phase 9：setupServer - Server 模式初始化

**位置**：[command/agent/agent.go:1174-1270](file:///d:/claude/nomad/command/agent/agent.go#L1174-L1270)

```go
func (a *Agent) setupServer() error {
    if !a.config.Server.Enabled { return nil }  // dev 模式：启用

    // 1. 构造 nomad.Config
    conf, err := a.serverConfig()

    // 2. 设置 NodeID（dev 模式特殊）
    if err := a.setupNodeID(conf); err != nil { ... }

    // 3. 设置 Serf 加密 keyring（dev 模式无 EncryptKey，跳过）
    if err := a.setupKeyrings(conf); err != nil { ... }

    // 4. 创建 Nomad Server 实例
    server, err := nomad.NewServer(conf,
        a.consulCatalog,
        a.consulConfigEntriesFunc,
    )
    a.server = server

    // 5. 注册 Consul 服务（dev 模式 AutoAdvertise=true）
    if *defaultConsul.AutoAdvertise {
        // 注册 HTTP/RPC/Serf 服务到 Consul
        ...
    }
    return nil
}
```

### setupNodeID 在 dev 模式下的行为

**位置**：[agent.go:1274-1279](file:///d:/claude/nomad/command/agent/agent.go#L1274-L1279)

```go
func (a *Agent) setupNodeID(config *nomad.Config) error {
    if a.config.DevMode {           // dev 模式
        config.NodeID = uuid.Generate()  // 随机生成，不持久化
        return nil
    }
    // 生产模式：从文件读取或生成并持久化
}
```

---

## Phase 10：nomad.NewServer - 创建 Server 实例

**位置**：[nomad/server.go:336-560](file:///d:/claude/nomad/nomad/server.go#L336-L560)

```go
func NewServer(config *Config, ...) (*Server, error) {
    // 1. 校验废弃配置字段
    if config.RaftBoltNoFreelistSync { ... }

    // 2. 配置 TLS
    tlsConf, err := tlsutil.NewTLSConfiguration(config.TLSConfig, true, true)
    incomingTLS, tlsWrap, err := getTLSConf(...)

    // 3. 创建 logger
    logger := config.Logger.ResetNamedIntercept("nomad")

    // 4. 校验企业许可证
    if err = config.LicenseConfig.Validate(); err != nil { ... }

    // 5. 创建 Server 结构体
    s := &Server{
        config:           config,
        connPool:         pool.NewPool(...),
        rpcServer:        rpc.NewServer(),
        streamingRpcs:    structs.NewStreamingRpcRegistry(),
        ...
    }
    s.shutdownCtx, s.shutdownCancel = context.WithCancel(context.Background())

    // 6. 创建 EvalBroker（评估队列）
    evalBroker, err := NewEvalBroker(...)
    s.evalBroker = evalBroker

    // 7. 创建 BlockedEvals
    s.blockedEvals = NewBlockedEvals(s.evalBroker, s.logger)

    // 8. 创建 RPC handler、planner、node heartbeater
    s.rpcHandler = newRpcHandler(s)
    planner, err := newPlanner(s)
    s.nodeHeartbeater = newNodeHeartbeater(s)

    // 9. 创建周期任务派发器
    s.periodicDispatcher = NewPeriodicDispatch(s.logger, s)

    // 10. 初始化 StatsFetcher（Autopilot 使用）
    s.statsFetcher = NewStatsFetcher(...)

    // 11. dev 模式特殊：keystore 临时目录
    keystorePath := filepath.Join(s.config.DataDir, "keystore")
    if s.config.DevMode && s.config.DataDir == "" {
        keystorePath, err = os.MkdirTemp("", "nomad-keystore")  // 临时目录
    }
    encrypter, err := NewEncrypter(s, keystorePath)
    s.encrypter = encrypter

    // 12. 初始化 RPC 层
    if err := s.setupRPC(tlsWrap); err != nil { ... }

    // 13. 创建 Authenticator
    s.auth = auth.NewAuthenticator(...)

    // 14. 初始化 Raft（详见 Phase 11）
    if err := s.setupRaft(); err != nil { ... }

    // 15. 初始化 Serf（详见 Phase 12）
    s.serf, err = s.setupSerf(config.SerfConfig, s.eventCh, serfSnapshot)

    // 16. 启动调度 workers（详见 Phase 13）
    if err := s.setupWorkers(s.shutdownCtx); err != nil { ... }

    // 17. 启动 Consul syncer、deployment watcher、volume watcher
    if err := s.setupConsulSyncer(); err != nil { ... }
    if err := s.setupDeploymentWatcher(); err != nil { ... }
    if err := s.setupVolumeWatcher(); err != nil { ... }

    // 18. 启动 eval broker 通知器
    go s.evalBroker.enabledNotifier.Run()

    // 19. 设置 node drainer
    s.setupNodeDrainer()

    // 20. 企业状态初始化
    if err := s.setupEnterprise(config); err != nil { ... }

    // 21. 启动领导权监控（详见 Phase 14）
    go s.monitorLeadership()

    // 22. 启动 Serf 事件处理器
    go s.serfEventHandler()

    // 23. 启动 RPC 监听器
    s.startRPCListener()

    // 24. 启动各种指标发布 goroutine
    go evalBroker.EmitStats(time.Second, s.shutdownCh)
    go s.planQueue.EmitStats(time.Second, s.shutdownCh)
    go s.planner.badNodeTracker.EmitStats(time.Second, s.shutdownCh)

    // 25. 启动 Raft 日志校验（如果配置）
    s.startRaftLogVerifier()

    return s, nil
}
```

### dev 模式特殊点：keystore 临时目录

**位置**：[server.go:431-436](file:///d:/claude/nomad/nomad/server.go#L431-L436)

```go
if s.config.DevMode && s.config.DataDir == "" {
    keystorePath, err = os.MkdirTemp("", "nomad-keystore")
    // dev 模式下 keystore 在临时目录，重启后丢失
}
```

---

## Phase 11：setupRaft - Raft 共识层初始化（dev 简化版）

**位置**：[nomad/server.go:1345-1601](file:///d:/claude/nomad/nomad/server.go#L1345-L1601)

### dev 模式 Raft 存储特殊化

**位置**：[server.go:1407-1413](file:///d:/claude/nomad/nomad/server.go#L1407-L1413)

```go
if s.config.DevMode {
    store := raft.NewInmemStore()            // 内存存储
    s.raftInmem = store
    stable = store                           // StableStore = 内存
    log = store                              // LogStore = 内存
    snap = raft.NewDiscardSnapshotStore()    // 快照丢弃
} else {
    // 生产模式：BoltDB 或 WAL + FileSnapshotStore
}
```

**dev 模式 Raft 存储对比**：

| 组件 | 生产模式 | Dev 模式 |
|------|----------|----------|
| LogStore | BoltDB (`raft.db`) 或 WAL | `InmemStore`（内存） |
| StableStore | 同 LogStore | `InmemStore`（内存） |
| SnapshotStore | `FileSnapshotStore`（文件） | `DiscardSnapshotStore`（丢弃） |
| 数据持久化 | 是 | **否**（重启丢失） |

### dev 模式的单节点引导

**位置**：[server.go:1572-1593](file:///d:/claude/nomad/nomad/server.go#L1572-L1593)

```go
if s.isSingleServerCluster() {  // BootstrapExpect == 1
    hasState, err := raft.HasExistingState(log, stable, snap)
    if !hasState {
        configuration := raft.Configuration{
            Servers: []raft.Server{
                {
                    ID:      s.config.RaftConfig.LocalID,
                    Address: trans.LocalAddr(),
                },
            },
        }
        raft.BootstrapCluster(s.config.RaftConfig,
            log, stable, snap, trans, configuration)
    }
}

// 创建 Raft 实例
s.raft, err = raft.NewRaft(s.config.RaftConfig, s.fsm, log, stable, snap, trans)
```

由于 dev 模式使用 InmemStore，`hasState` 永远为 `false`，每次启动都会重新引导。

---

## Phase 12：setupSerf - Serf 成员发现（dev 简化版）

**位置**：[nomad/server.go:1737-1810](file:///d:/claude/nomad/nomad/server.go#L1737-L1810)

### dev 模式 Serf 快照特殊化

**位置**：[server.go:1773-1777](file:///d:/claude/nomad/nomad/server.go#L1773-L1777)

```go
if !s.config.DevMode {
    conf.SnapshotPath = filepath.Join(s.config.DataDir, path)
    // 生产模式：持久化 Serf 快照
} else {
    conf.SnapshotPath = ""  // dev 模式：不持久化
}
```

dev 模式下 Serf 不持久化成员信息，重启后从空状态开始。

---

## Phase 13：setupWorkers - 调度 worker 启动

**位置**：[nomad/server.go:1929-1999](file:///d:/claude/nomad/nomad/server.go#L1929-L1999)

```go
func (s *Server) setupWorkers(ctx context.Context) error {
    poolArgs := s.GetSchedulerWorkerConfig()
    go s.listenWorkerEvents()
    return s.setupWorkersLocked(ctx, poolArgs)
}

func (s *Server) setupWorkersLocked(ctx context.Context, poolArgs SchedulerWorkerPoolArgs) error {
    if len(poolArgs.EnabledSchedulers) == 0 || poolArgs.NumSchedulers == 0 {
        s.logger.Warn("no enabled schedulers")
        return nil
    }
    s.workers = make([]*Worker, 0, poolArgs.NumSchedulers)
    for i := 0; i < poolArgs.NumSchedulers; i++ {
        worker := NewWorker(s, workerConfig, s.workersEventCh)
        s.workers = append(s.workers, worker)
        go worker.Run()
    }
    return nil
}
```

dev 模式下 `NumSchedulers` 默认为运行时 `GOMAXPROCS`，启动对应数量的调度 worker goroutine。

---

## Phase 14：monitorLeadership - 领导权维护

**位置**：[nomad/leader.go:111-176](file:///d:/claude/nomad/nomad/leader.go#L111-L176)

```go
go s.monitorLeadership()
```

dev 模式下，由于是单节点集群，本节点很快成为 Leader：

```
monitorLeadership
    └─ leaderCh := s.raft.LeaderCh()
    └─ 等待 isLeader = true
        └─ leaderStep(true)
            └─ go leaderLoop(stopCh)                  [leader.go:248]
                ├─ raft.Barrier()                     [leader.go:259]
                │   └─ 等待所有已提交日志应用到 FSM
                ├─ establishLeadership(stopCh)        [leader.go:378]
                │   ├─ setLeaderAcl(uuid.Generate())
                │   ├─ getOrCreateAutopilotConfig()
                │   ├─ autopilot.Start()
                │   ├─ getOrCreateSchedulerConfig()
                │   ├─ ClusterMetadata()
                │   ├─ planQueue.SetEnabled(true)
                │   ├─ go s.planApply()
                │   ├─ handleEvalBrokerStateChange()
                │   ├─ deploymentWatcher.SetEnabled(true)
                │   ├─ nodeDrainer.SetEnabled(true)
                │   ├─ volumeWatcher.SetEnabled(true)
                │   ├─ restoreEvals()
                │   ├─ periodicDispatcher.SetEnabled(true)
                │   ├─ setConsistentReadReady()       ◀── 一致读就绪
                │   └─ 启动多个后台 goroutine
                └─ reconcile()
            └─ 进入 WAIT 循环
```

**dev 模式特点**：由于是单节点，`establishLeadership` 几乎必然成功，无需考虑 leadership 转移。

---

## Phase 15：setupClient - Client 模式初始化

**位置**：[command/agent/agent.go:1355-1450](file:///d:/claude/nomad/command/agent/agent.go#L1355-L1450)

```go
func (a *Agent) setupClient() error {
    if !a.config.Client.Enabled { return nil }  // dev 模式：启用

    // 1. 插件设置（docker、raw_exec 等）
    if err := a.setupPlugins(); err != nil { ... }

    // 2. 构造 client.Config
    conf, err := a.clientConfig()

    // 3. Windows 端口预留
    if runtime.GOOS == "windows" { ... }

    // 4. StateDBFactory（dev 模式特殊）
    if conf.StateDBFactory == nil {
        conf.StateDBFactory = state.GetStateDBFactory(conf.DevMode)
        // dev 模式返回 NoopStateDBFactory（内存状态）
    }

    // 5. 内置 listener 和 dialer
    a.builtinListener, a.builtinDialer = bufconndialer.New()
    conf.TemplateDialer = a.builtinDialer

    // 6. 内置 Task API server
    a.taskAPIServer = newBuiltinAPI()
    conf.APIListenerRegistrar = a.taskAPIServer

    // 7. 创建 Client
    nomadClient, err := client.NewClient(conf,
        a.consulCatalog,
        a.consulProxiesFunc,
        a.consulServices,
        nil,
    )
    a.client = nomadClient

    // 8. 注册 Consul 服务
    if *defaultConsul.AutoAdvertise { ... }
    return nil
}
```

### dev 模式 StateDB 特殊化

`state.GetStateDBFactory(true)` 在 dev 模式下返回 `NoopStateDBFactory`，客户端状态不持久化（重启后丢失所有分配状态）。

### client.NewClient 主要工作

**位置**：[client/client.go:361+](file:///d:/claude/nomad/client/client.go#L361)

1. 创建 TLS wrapper
2. 创建 RPC client
3. 初始化 fingerprinting（硬件识别）
4. 启动 `registerAndHeartbeat` goroutine（节点注册到 server）
5. 启动分配处理器（alloc runner）
6. 启动服务注册

dev 模式下，client 通过内置 bufconn 拨号器直接连接同进程的 server，无需走真实 TCP。

---

## Phase 16：NewHTTPServers - HTTP 服务器启动

**位置**：[command/agent/http.go](file:///d:/claude/nomad/command/agent/http.go) 和 [command.go:685-691](file:///d:/claude/nomad/command/agent/command.go#L685-L691)

```go
httpServers, err := NewHTTPServers(agent, config)
c.httpServers = httpServers
```

启动 HTTP 服务器，监听 `127.0.0.1:4646`（dev 模式）。注册所有 API 端点：

| 端点 | 用途 |
|------|------|
| `/v1/jobs` | 作业管理 |
| `/v1/nodes` | 节点管理 |
| `/v1/allocations` | 分配管理 |
| `/v1/evaluations` | 评估管理 |
| `/v1/operator/raft/configuration` | Raft 配置 |
| `/v1/metrics` | 指标查询 |
| `/debug/pprof/` | pprof 调试（dev 启用） |

---

## Phase 17：startupJoin - 节点加入

**位置**：[command/agent/command.go:905-908](file:///d:/claude/nomad/command/agent/command.go#L905-L908)

```go
if err := c.startupJoin(config); err != nil { ... }
```

`startupJoin` 处理 `-join` 启动参数。dev 模式默认未配置 `StartJoin`，此步骤基本跳过。

---

## Phase 18：handleRetryJoin - 重试加入逻辑

**位置**：[command/agent/command.go:952-955](file:///d:/claude/nomad/command/agent/command.go#L952-L955) 和 [command.go:966-1032](file:///d:/claude/nomad/command/agent/command.go#L966-L1032)

```go
if err := c.handleRetryJoin(config); err != nil { ... }
```

dev 模式下 `RetryJoin` 为空数组，`handleRetryJoin` 直接返回 `nil`，不启动重试 join goroutine。

---

## Phase 19：handleSignals - 信号处理与阻塞等待

**位置**：[command/agent/command.go:962](file:///d:/claude/nomad/command/agent/command.go#L962) 和 [command.go:1090-1160](file:///d:/claude/nomad/command/agent/command.go#L1090-L1160)

```go
return c.handleSignals()
```

### 输出启动信息

**位置**：[command.go:910-949](file:///d:/claude/nomad/command/agent/command.go#L910-L949)

在阻塞前，输出 agent 配置信息：

```
==> Nomad agent configuration:

    Advertise Addrs: HTTP: 127.0.0.1:4646, RPC: 127.0.0.1:4647, Serf: 127.0.0.1:4648
        Bind Addrs: HTTP: 127.0.0.1:4646, RPC: 127.0.0.1:4647, Serf: 127.0.0.1:4648
            Client: true
             Log Level: DEBUG
        Region: global (DC: dc1)
            Server: true
             Version: 1.10.0+ent

==> Nomad agent started! Log data will stream in below:
```

### handleSignals 实现

**位置**：[command.go:1090-1160](file:///d:/claude/nomad/command/agent/command.go#L1090-L1160)

```go
func (c *Command) handleSignals() int {
    signalCh := make(chan os.Signal, 4)
    signal.Notify(signalCh, syscall.SIGINT, syscall.SIGTERM, syscall.SIGHUP, syscall.SIGPIPE)

    // systemd 通知
    sdSock, err := openNotify()
    sdNotify(sdSock, sdReady)

    for {
        select {
        case sig := <-signalCh:
            if sig == syscall.SIGPIPE { continue }
            c.Ui.Output(fmt.Sprintf("Caught signal: %v", sig))

            switch sig {
            case syscall.SIGHUP:
                sdNotifyReloading(sdSock)
                err := c.handleReload()  // 热重载配置
                sdNotify(sdSock, sdReady)
            case syscall.SIGTERM:
                if !c.agent.GetConfig().LeaveOnTerm { return 1 }
                return c.terminateGracefully(signalCh, sdSock)
            case syscall.SIGINT:
                if !c.agent.GetConfig().LeaveOnInt { return 1 }
                return c.terminateGracefully(signalCh, sdSock)
            }
        case <-winsvc.ShutdownChannel():  // Windows 服务关闭
            return c.terminateGracefully(signalCh, sdSock)
        case <-c.ShutdownCh:
            return 0
        }
    }
}
```

dev 模式下默认 `LeaveOnInt=true`、`LeaveOnTerm=true`，因此 Ctrl+C 会触发优雅关闭。

---

## Phase 20：优雅关闭流程

**位置**：[command/agent/command.go:1034-1087](file:///d:/claude/nomad/command/agent/command.go#L1034-L1087)

```go
func (c *Command) terminateGracefully(signalCh chan os.Signal, sdSock io.Writer) int {
    sdNotify(sdSock, sdStopping)

    gracefulCh := make(chan struct{})
    gracefulClose := sync.OnceFunc(func() { close(gracefulCh) })

    timeout := gracefulTimeout  // 5 秒
    if c.agent.client != nil {
        config := c.agent.client.GetConfig()
        if config.Drain != nil && config.Drain.Deadline != 0 {
            timeout += config.Drain.Deadline
        }
    }

    c.Ui.Output("Gracefully shutting down agent...")
    go func() {
        if err := c.agent.Leave(); err != nil { ... }  // 主动离开
        gracefulClose()
    }()

    delay := time.NewTimer(timeout)
    for {
        select {
        case sig := <-signalCh:        // 二次信号 → 强制退出
            if sig == syscall.SIGPIPE { continue }
            return 1
        case <-delay.C:                // 超时 → 强制退出
            return 1
        case <-gracefulCh:             // 优雅关闭完成
        }
        break
    }
    return 0
}
```

### Agent.Leave

**位置**：[command/agent/agent.go:1495-1508](file:///d:/claude/nomad/command/agent/agent.go#L1495-L1508)

```go
func (a *Agent) Leave() error {
    if a.client != nil {
        if err := a.client.Leave(); err != nil { ... }
    }
    if a.server != nil {
        if err := a.server.Leave(); err != nil { ... }
    }
    return nil
}
```

### defer 中的 Shutdown

**位置**：[command.go:892-902](file:///d:/claude/nomad/command/agent/command.go#L892-L902)

```go
defer func() {
    c.agent.Shutdown()
    if len(c.httpServers) > 0 {
        for _, srv := range c.httpServers {
            srv.Shutdown()
        }
    }
}()
```

关闭顺序：
1. `Agent.Leave()` - 主动离开集群
2. `Agent.Shutdown()` - 关闭 server、client、enterprise
3. `HTTPServer.Shutdown()` - 关闭 HTTP 服务器

---

## Dev 模式与生产模式对比

### 数据持久化对比

| 组件 | 生产模式 | Dev 模式 |
|------|----------|----------|
| Raft LogStore | BoltDB 文件 (`raft.db`) | InmemStore（内存） |
| Raft StableStore | 同 LogStore | InmemStore（内存） |
| Raft SnapshotStore | FileSnapshotStore | DiscardSnapshotStore |
| Serf 快照 | 文件 (`serf-snapshot`) | 无 |
| Node ID | 持久化到 `node-id` 文件 | 每次启动随机生成 |
| Server keystore | `<DataDir>/keystore` | 临时目录 (`os.MkdirTemp`) |
| Client StateDB | BoltDB 文件 (`state.db`) | NoopStateDB（内存） |
| Client 节点注册状态 | 持久化 | 不持久化 |

### 配置差异对比

| 配置项 | 生产模式 | Dev 模式 |
|--------|----------|----------|
| `BindAddr` | `0.0.0.0` | `127.0.0.1` |
| `LogLevel` | `INFO` | `DEBUG` |
| `Client.Enabled` | 用户指定 | `true` |
| `Server.Enabled` | 用户指定 | `true` |
| `BootstrapExpect` | 用户指定 | `1` |
| `EnableDebug` | `false` | `true` |
| `DisableAnonymousSignature` | `false` | `true` |
| `Client.NetworkInterface` | 默认网卡 | `lo`（回环） |
| `driver.raw_exec.enable` | `false` | `true` |
| `driver.docker.volumes` | `false` | `true` |
| `GCInterval` | `1m` | `10m` |
| `GCDiskUsageThreshold` | `80` | `99` |
| `PrometheusMetrics` | `false` | `true` |
| `PublishAllocationMetrics` | `false` | `true` |
| `PublishNodeMetrics` | `false` | `true` |
| mTLS 警告 | 显示 | 跳过 |
| `data_dir` 必填 | 是 | 否 |

### 校验差异对比

| 校验项 | 生产模式 | Dev 模式 |
|--------|----------|----------|
| `data_dir` 必填 | 是 | 跳过 |
| mTLS 配置警告 | 显示 | 跳过 |
| `bootstrap-expect=1` 警告 | 显示 | 跳过 |
| `alloc-dir`、`state-dir` 必填 | 是 | 跳过 |

---

## 关键调用链汇总

### 完整启动调用链

```
main.main()
    └─ Run(args)                                            main.go:86
        └─ cli.Run()                                        cli.CLI
            └─ AgentCommand.Run(args)                       command.go:817
                ├─ readConfig()                             command.go:827
                │   ├─ flags.Parse(args)                    command.go:200+
                │   ├─ DevConfig(devConfig)                 config.go:1759
                │   ├─ config.Merge(DefaultEntConfig())     command.go:264
                │   ├─ config.normalizeAddrs()              command.go:307
                │   └─ IsValidConfig()                      command.go:335
                ├─ SetupLoggers()                           command.go:842
                │   └─ hclog.NewInterceptLogger()
                ├─ setupTelemetry()                         command.go:880
                ├─ setupAgent()                             command.go:887
                │   ├─ NewAgent()                           agent.go:150
                │   │   ├─ setupConsuls()                   agent.go:165
                │   │   ├─ setupServer()                    agent.go:169
                │   │   │   ├─ serverConfig()               agent.go:1181
                │   │   │   ├─ setupNodeID()                agent.go:1188
                │   │   │   │   └─ DevMode: uuid.Generate() agent.go:1277
                │   │   │   ├─ setupKeyrings()              agent.go:1193
                │   │   │   └─ nomad.NewServer()            agent.go:1198
                │   │   │       ├─ setupRPC()               server.go:469
                │   │   │       ├─ setupRaft()              server.go:486
                │   │   │       │   ├─ DevMode: InmemStore  server.go:1407
                │   │   │       │   ├─ DevMode: DiscardSnap server.go:1412
                │   │   │       │   ├─ BootstrapCluster()   server.go:1588
                │   │   │       │   └─ raft.NewRaft()       server.go:1596
                │   │   │       ├─ setupSerf()              server.go:493
                │   │   │       │   └─ DevMode: 无快照      server.go:1773
                │   │   │       ├─ setupWorkers()           server.go:501
                │   │   │       │   └─ go worker.Run()
                │   │   │       ├─ setupConsulSyncer()      server.go:508
                │   │   │       ├─ setupDeploymentWatcher() server.go:514
                │   │   │       ├─ setupVolumeWatcher()     server.go:520
                │   │   │       ├─ setupNodeDrainer()       server.go:531
                │   │   │       ├─ go monitorLeadership()   server.go:539
                │   │   │       │   └─ leaderLoop()         leader.go:248
                │   │   │       │       ├─ raft.Barrier()   leader.go:259
                │   │   │       │       └─ establishLeadership() leader.go:378
                │   │   │       │           └─ setConsistentReadReady()
                │   │   │       ├─ go serfEventHandler()    server.go:542
                │   │   │       └─ startRPCListener()       server.go:545
                │   │   ├─ setupClient()                    agent.go:172
                │   │   │   ├─ setupPlugins()               agent.go:1364
                │   │   │   ├─ clientConfig()               agent.go:1369
                │   │   │   │   └─ StateDBFactory=Noop      agent.go:1381
                │   │   │   ├─ bufconndialer.New()          agent.go:1388
                │   │   │   └─ client.NewClient()           agent.go:1396
                │   │   │       └─ registerAndHeartbeat()   client.go:1878
                │   │   └─ setupEnterpriseAgent()           agent.go:176
                │   └─ NewHTTPServers()                     command.go:685
                ├─ startupJoin()                            command.go:905
                │   └─ DevMode: 跳过
                ├─ handleRetryJoin()                        command.go:952
                │   └─ DevMode: 跳过
                └─ handleSignals()                          command.go:962
                    └─ 阻塞等待 SIGINT/SIGTERM
```

### 优雅关闭调用链

```
SIGINT / SIGTERM
    └─ handleSignals()                                     command.go:1090
        └─ terminateGracefully()                           command.go:1034
            ├─ sdNotify(sdStopping)
            ├─ go Agent.Leave()                            agent.go:1495
            │   ├─ client.Leave()
            │   └─ server.Leave()
            │       └─ raft.LeadershipTransfer()  (可选)
            └─ defer Agent.Shutdown()                      command.go:893
                ├─ server.Shutdown()
                │   ├─ raft.Shutdown()
                │   ├─ serf.Shutdown()
                │   └─ worker.Shutdown()
                ├─ client.Shutdown()
                │   └─ 停止所有 alloc runner
                └─ httpServer.Shutdown()
```

---

## 源码索引

### 主要源文件

| # | 文件 | 主要函数 | 行号 |
|---|------|----------|------|
| 1 | [main.go](file:///d:/claude/nomad/main.go) | `main`, `Run` | L81, L86 |
| 2 | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | `Command.Run`, `readConfig`, `IsValidConfig`, `SetupLoggers`, `setupAgent`, `handleRetryJoin`, `handleSignals`, `terminateGracefully` | L817, L64, L342, L580, L668, L966, L1090, L1034 |
| 3 | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | `DefaultConfig`, `DevConfig`, `devModeConfig.networkConfig`, `normalizeAddrs` | L1816, L1759, L1725, L2387 |
| 4 | [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | `NewAgent`, `setupServer`, `setupNodeID`, `setupClient`, `Leave`, `Shutdown` | L150, L1174, L1274, L1355, L1495, L1510 |
| 5 | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | `NewServer`, `setupRaft`, `setupSerf`, `setupWorkers`, `isSingleServerCluster` | L336, L1345, L1737, L1929, L2314 |
| 6 | [nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go) | `monitorLeadership`, `leaderLoop`, `establishLeadership` | L111, L248, L378 |
| 7 | [client/client.go](file:///d:/claude/nomad/client/client.go) | `NewClient`, `registerAndHeartbeat` | L361, L1878 |

### 关键代码位置索引

#### command.go

| 功能 | 行号 |
|------|------|
| `Command.Run` 入口 | [L817](file:///d:/claude/nomad/command/agent/command.go#L817) |
| `readConfig` 函数 | [L64-L340](file:///d:/claude/nomad/command/agent/command.go#L64-L340) |
| dev flag 定义 | [L88-L95](file:///d:/claude/nomad/command/agent/command.go#L88-L95) |
| devModeConfig 构造 | [L241-L261](file:///d:/claude/nomad/command/agent/command.go#L241-L261) |
| `IsValidConfig` | [L342-L574](file:///d:/claude/nomad/command/agent/command.go#L342-L574) |
| dev 模式跳过 mTLS 警告 | [L374](file:///d:/claude/nomad/command/agent/command.go#L374) |
| dev 模式跳过目录校验 | [L513-L531](file:///d:/claude/nomad/command/agent/command.go#L513-L531) |
| `SetupLoggers` | [L580-L666](file:///d:/claude/nomad/command/agent/command.go#L580-L666) |
| `setupAgent` | [L668-L719](file:///d:/claude/nomad/command/agent/command.go#L668-L719) |
| `handleRetryJoin` | [L966-L1032](file:///d:/claude/nomad/command/agent/command.go#L966-L1032) |
| `handleSignals` | [L1090-L1160](file:///d:/claude/nomad/command/agent/command.go#L1090-L1160) |
| `terminateGracefully` | [L1034-L1087](file:///d:/claude/nomad/command/agent/command.go#L1034-L1087) |

#### config.go

| 功能 | 行号 |
|------|------|
| `devModeConfig` 结构 | [L1681-L1691](file:///d:/claude/nomad/command/agent/config.go#L1681-L1691) |
| `devModeConfig.enabled` | [L1693-L1696](file:///d:/claude/nomad/command/agent/config.go#L1693-L1696) |
| `devModeConfig.validate` | [L1698-L1723](file:///d:/claude/nomad/command/agent/config.go#L1698-L1723) |
| `devModeConfig.networkConfig` | [L1725-L1756](file:///d:/claude/nomad/command/agent/config.go#L1725-L1756) |
| `DevConfig` | [L1759-L1820](file:///d:/claude/nomad/command/agent/config.go#L1759-L1820) |
| `DefaultConfig` | [L1816-L1970+](file:///d:/claude/nomad/command/agent/config.go#L1816) |
| `Config.DevMode` 字段 | [L163-L164](file:///d:/claude/nomad/command/agent/config.go#L163-L164) |

#### agent.go

| 功能 | 行号 |
|------|------|
| `NewAgent` | [L150-L195](file:///d:/claude/nomad/command/agent/agent.go#L150-L195) |
| `setupServer` | [L1174-L1270](file:///d:/claude/nomad/command/agent/agent.go#L1174-L1270) |
| `setupNodeID` (dev 特殊) | [L1274-L1329](file:///d:/claude/nomad/command/agent/agent.go#L1274-L1329) |
| `setupKeyrings` | [L1331-L1353](file:///d:/claude/nomad/command/agent/agent.go#L1331-L1353) |
| `setupClient` | [L1355-L1450+](file:///d:/claude/nomad/command/agent/agent.go#L1355) |
| `Leave` | [L1495-L1508](file:///d:/claude/nomad/command/agent/agent.go#L1495-L1508) |
| `Shutdown` | [L1510+](file:///d:/claude/nomad/command/agent/agent.go#L1510) |

#### server.go

| 功能 | 行号 |
|------|------|
| `NewServer` | [L336-L560+](file:///d:/claude/nomad/nomad/server.go#L336) |
| dev 模式 keystore 临时目录 | [L431-L436](file:///d:/claude/nomad/nomad/server.go#L431-L436) |
| `setupRaft` | [L1345-L1601](file:///d:/claude/nomad/nomad/server.go#L1345-L1601) |
| dev 模式 InmemStore | [L1407-L1413](file:///d:/claude/nomad/nomad/server.go#L1407-L1413) |
| 单节点 BootstrapCluster | [L1572-L1593](file:///d:/claude/nomad/nomad/server.go#L1572-L1593) |
| `setupSerf` (dev 无快照) | [L1737-L1810](file:///d:/claude/nomad/nomad/server.go#L1737-L1810), [L1773-L1777](file:///d:/claude/nomad/nomad/server.go#L1773-L1777) |
| `setupWorkers` | [L1929-L1999](file:///d:/claude/nomad/nomad/server.go#L1929-L1999) |
| `monitorLeadership` 启动 | [L539](file:///d:/claude/nomad/nomad/server.go#L539) |
| `isSingleServerCluster` | [L2314-L2316](file:///d:/claude/nomad/nomad/server.go#L2314-L2316) |

#### leader.go

| 功能 | 行号 |
|------|------|
| `monitorLeadership` | [L111-L176](file:///d:/claude/nomad/nomad/leader.go#L111-L176) |
| `leaderLoop` | [L248-L370](file:///d:/claude/nomad/nomad/leader.go#L248-L370) |
| `establishLeadership` | [L378-L470+](file:///d:/claude/nomad/nomad/leader.go#L378-L470) |

---

## 附录 A：`nomad agent -dev` 完整启动时序

```
T0.000s  main.main() 调用 Run(args)
T0.001s  cli.CLI 分发到 AgentCommand.Run(["-dev"])
T0.002s  readConfig:
           - flags.Parse: devMode=true
           - DevConfig: Client/Server 启用, DevMode=true, BootstrapExpect=1
           - normalizeAddrs: bind 127.0.0.1
           - IsValidConfig: 跳过 mTLS/data_dir 校验
T0.005s  SetupLoggers: 创建 DEBUG 级别 hclog
T0.006s  setupTelemetry: 初始化 inmem + Prometheus 指标
T0.007s  setupAgent → NewAgent:
           - setupConsuls: 初始化 Consul 客户端
           - setupServer:
             * setupNodeID: uuid.Generate() (dev)
             * setupKeyrings: 跳过 (dev 无 EncryptKey)
             * nomad.NewServer:
               - keystore 临时目录 (dev)
               - setupRPC: TCP 监听 127.0.0.1:4647
               - setupRaft:
                 * InmemStore + DiscardSnapshotStore (dev)
                 * BootstrapCluster 单节点
                 * raft.NewRaft
               - setupSerf: 无快照 (dev), 监听 127.0.0.1:4648
               - setupWorkers: 启动 N 个 worker goroutine
               - setupConsulSyncer / DeploymentWatcher / VolumeWatcher
               - setupNodeDrainer
               - go monitorLeadership()  ◀── 异步
               - startRPCListener
             * Consul 服务注册 (AutoAdvertise=true)
           - setupClient:
             * setupPlugins: docker, raw_exec 等
             * StateDBFactory = Noop (dev)
             * bufconndialer.New (内置连接)
             * client.NewClient:
               - fingerprint
               - go registerAndHeartbeat()  ◀── 异步注册到 server
           - setupEnterpriseAgent
T0.500s  NewHTTPServers: HTTP 监听 127.0.0.1:4646
T0.501s  startupJoin: 跳过 (dev 无 StartJoin)
T0.502s  handleRetryJoin: 跳过 (dev 无 RetryJoin)
T0.503s  输出 agent 配置信息
T0.504s  logGate.Flush(): 开始输出日志流
T0.505s  handleSignals: 阻塞等待信号

# 异步进行：
T0.510s  raft 当选 Leader (单节点)
T0.511s  leaderLoop: raft.Barrier() 完成
T0.512s  establishLeadership: 启用 plan 队列、调度器、drainer 等
T0.513s  setConsistentReadReady(): 一致读就绪
T0.520s  client.registerNode: 通过内置 bufconn 注册到 server
T0.530s  client 收到 heartbeat 响应，注册成功

# 用户 Ctrl+C：
T100.0s  收到 SIGINT
T100.0s  terminateGracefully:
           - Agent.Leave: client.Leave + server.Leave
           - Agent.Shutdown: raft.Shutdown, serf.Shutdown, client.Shutdown
           - HTTPServer.Shutdown
T100.5s  进程退出
```

---

> 本文档基于 Nomad 源码深度分析生成，覆盖 `nomad agent -dev` 命令从 `main.main` 到信号阻塞的完整执行流程，包括 20 个阶段的详细解析、dev 模式与生产模式的对比、关键调用链汇总和源码索引。
