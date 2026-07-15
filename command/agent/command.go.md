# command/agent/command.go 代码说明文档

> 文件路径：[command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go)
> 总行数：1834 行
> 所属包：`agent`（`github.com/hashicorp/nomad/command/agent`）
> 许可证：BUSL-1.1 (Copyright IBM Corp. 2015, 2026)

---

## 1. 文件定位与核心职责

`command.go` 是 `nomad agent` 子命令的入口实现，实现了 [cli.Command](file:///d:/claude/nomad/command/agent/command.go#L33) 接口。它负责：

1. **解析命令行参数与配置文件**，合并生成最终 `Config`
2. **校验配置合法性**（地址、端口、TLS、目录、调度器、节点池等）
3. **初始化日志系统**（stdout/syslog/eventlog/文件，含 gated writer 缓冲）
4. **初始化遥测系统**（inmem/statsite/statsd/prometheus/datadog/circonus 多 sink 扇出）
5. **启动 Agent**（`Agent` + `HTTPServer`）
6. **处理集群 Join / Retry-Join**（含 go-discover 自动发现）
7. **处理信号**（SIGINT/SIGTERM/SIGHUP/SIGPIPE），实现优雅退出与配置热重载
8. **后台更新检查**（go-checkpoint 周期性查询新版本公告）

---

## 2. 类型与字段总览

### `Command` 结构体

定义于 [command.go:36-45](file:///d:/claude/nomad/command/agent/command.go#L36)：

```go
type Command struct {
    Version    *version.VersionInfo  // 版本信息，注入到配置
    Ui         cli.Ui                 // CLI 输出接口
    ShutdownCh <-chan struct{}        // 外部关闭信号通道

    args           []string            // 原始 CLI 参数
    agent          *Agent              // 核心 Agent 实例（含 server/client）
    httpServers    []*HTTPServer       // HTTP API 服务实例
    retryJoinErrCh chan struct{}       // retry-join 失败信号
}
```

### 常量

| 名称 | 值 | 说明 |
|------|----|----|
| `gracefulTimeout` | `5 * time.Second` | 优雅关闭基础超时，可叠加 `client.drain.deadline` |

### 方法清单

| 方法 | 行号 | 职责 |
|------|------|------|
| `readConfig()` | [~95](file:///d:/claude/nomad/command/agent/command.go#L95) | 解析 flags + 加载/合并配置文件 + 归一化地址 |
| `IsValidConfig()` | [~377](file:///d:/claude/nomad/command/agent/command.go#L377) | 全面配置校验 |
| `SetupLoggers()` | [~577](file:///d:/claude/nomad/command/agent/command.go#L577) | 构造日志 writers 链（包级函数，企业版复用） |
| `setupAgent()` | [~673](file:///d:/claude/nomad/command/agent/command.go#L673) | 创建 Agent + HTTPServer + 更新检查 |
| `checkpointResults()` | [~700](file:///d:/claude/nomad/command/agent/command.go#L700) | 处理版本检查回调 |
| `AutocompleteFlags()` | [~716](file:///d:/claude/nomad/command/agent/command.go#L716) | shell 自动补全规则 |
| `AutocompleteArgs()` | [~809](file:///d:/claude/nomad/command/agent/command.go#L809) | 参数补全（返回 nil） |
| `Run()` | [~813](file:///d:/claude/nomad/command/agent/command.go#L813) | **主入口**，编排整个启动流程 |
| `handleRetryJoin()` | [~941](file:///d:/claude/nomad/command/agent/command.go#L941) | 启动 server/client 的 retry-join goroutine |
| `terminateGracefully()` | [~1000](file:///d:/claude/nomad/command/agent/command.go#L1000) | 优雅离开集群（Leave） |
| `handleSignals()` | [~1056](file:///d:/claude/nomad/command/agent/command.go#L1056) | 信号循环：重载/退出/Windows 服务事件 |
| `reloadHTTPServer()` | [~1124](file:///d:/claude/nomad/command/agent/command.go#L1124) | 用新 TLS 重启 HTTP 服务 |
| `handleReload()` | [~1142](file:///d:/claude/nomad/command/agent/command.go#L1142) | SIGHUP 触发：重新读配置 + 重载 agent/server/client/HTTP |
| `checkNewConfigFiles()` | [~1208](file:///d:/claude/nomad/command/agent/command.go#L1208) | 对比新旧配置文件列表 |
| `setupTelemetry()` | [~1227](file:///d:/claude/nomad/command/agent/command.go#L1227) | 初始化多 sink 遥测 |
| `startupJoin()` | [~1409](file:///d:/claude/nomad/command/agent/command.go#L1409) | 启动时一次性 join |
| `getBindAddrSynopsis()` | [~1440](file:///d:/claude/nomad/command/agent/command.go#L1440) | 输出绑定地址摘要 |
| `getAdvertiseAddrSynopsis()` | [~1464](file:///d:/claude/nomad/command/agent/command.go#L1464) | 输出广播地址摘要 |
| `Synopsis()` | [~1486](file:///d:/claude/nomad/command/agent/command.go#L1486) | 返回 "Runs a Nomad agent" |
| `Help()` | [~1490](file:///d:/claude/nomad/command/agent/command.go#L1490) | 返回完整帮助文本 |

---

## 3. 核心流程详解

### 3.1 Run() 启动主流程

`Run(args []string) int` 是 [command.go:813](file:///d:/claude/nomad/command/agent/command.go#L813) 的核心方法，编排整个生命周期：

```
Run(args)
  │
  ├─ 1. 包装 Ui（加 "==> " 前缀）
  ├─ 2. c.args = args
  ├─ 3. config := c.readConfig()                    // 解析+合并+校验配置
  │     └─ 返回 nil → return 1
  ├─ 4. JSON 日志模式：重置 Ui 为 BasicUi（避免前缀污染 JSON）
  ├─ 5. SetupLoggers(c.Ui, config)                  // 构造 logGate + logOutput
  ├─ 6. 创建 hclog.InterceptLogger                  // 主 logger
  ├─ 7. log.SetOutput(logger.StandardWriter(...))   // 接管标准库 log
  ├─ 8. JSON 模式：Ui 替换为 HcLogUI
  ├─ 9. 打印配置文件来源
  ├─10. c.setupTelemetry(config)                    // 初始化 inmem + fanout sinks
  ├─11. c.setupAgent(config, logger, logOutput, inmem)
  │     ├─ NewAgent(...)                            // 创建 Agent（启动 server/client）
  │     ├─ agent.configReloader = c.handleReload    // 注册 SIGHUP 回调
  │     └─ NewHTTPServers(agent, config)            // 启动 HTTP API
  ├─12. defer: agent.Shutdown() + httpServers.Shutdown()
  ├─13. c.startupJoin(config)                       // 一次性 join
  ├─14. 收集并排序 agent 信息（version/region/bind/advertise）
  ├─15. 打印 "Nomad agent configuration:" 表格
  ├─16. 打印 "Nomad agent started!"
  ├─17. logGate.Flush()                             // 释放缓冲日志
  ├─18. c.handleRetryJoin(config)                   // 启动 retry-join goroutine
  ├─19. winsvc.SendEvent(EventServiceReady)         // 通知 Windows SCM
  └─20. return c.handleSignals()                    // 阻塞等信号
```

### 3.2 readConfig() 配置加载与合并

[command.go:95](file:///d:/claude/nomad/command/agent/command.go#L95) 实现三层配置源合并：

```
配置优先级（低 → 高）：
  DevConfig() 或 DefaultConfig()    ← 默认值
    ↓ Merge(DefaultEntConfig())     ← 企业版叠加
      ↓ Merge(每个 -config 文件)    ← 文件配置（按顺序合并）
        ↓ Merge(cmdConfig)          ← CLI flags 最高优先级
```

**关键步骤**：

1. **构造 cmdConfig**：定义所有 flag（dev/server/client/consul/vault/acl 等），见 [L111-L274](file:///d:/claude/nomad/command/agent/command.go#L111)
2. **flags.Parse(c.args)**：解析 CLI
3. **servers 拆分**：`strings.Split(servers, ",")`
4. **meta 解析**：`key=value` 格式
5. **环境变量覆盖**：`NOMAD_CLIENT_INTRO_TOKEN` 优先于 `-client-intro-token`
6. **DevMode 判断**：`devConfig.enabled()` 走 `DevConfig()`，否则 `DefaultConfig()`
7. **企业版叠加**：`config.Merge(DefaultEntConfig())`
8. **配置文件合并**：遍历 `configPath`，逐个 `LoadConfig(path)` 后 `Merge`
9. **CLI 合并**：`config.Merge(cmdConfig)`
10. **normalizeAddrs()**：归一化绑定/广播地址
11. **Vault namespace 回退**：从 `VAULT_NAMESPACE` 环境变量
12. **PluginDir 默认值**：`<data-dir>/plugins`
13. **License 注入**：`NOMAD_LICENSE` / `NOMAD_LICENSE_PATH`
14. **IsValidConfig()**：校验

### 3.3 IsValidConfig() 校验规则

[command.go:377](file:///d:/claude/nomad/command/agent/command.go#L377) 执行 20+ 项校验，失败时 `c.Ui.Error` 并返回 `false`：

| 校验项 | 错误信息 | 严重性 |
|--------|---------|--------|
| 至少启用 server 或 client | "Must specify either server, client or dev mode" | error |
| Region 不含 `\0` | "Region contains invalid characters" | error |
| Datacenter 不含 `\0*` | "Datacenter contains invalid characters (null or '*')" | error |
| Telemetry 块 | `config.Telemetry.Validate()` | error |
| TLS 配置 | mTLS 未配置 → WARNING | warn |
| EncryptKey 合法性 | `config.Server.EncryptBytes()` | error |
| 目录绝对路径 | 7 个目录项 | error |
| Client.Meta 键名 | `helper.IsValidInterpVariable(k)` | error |
| SchedulerConfig | `config.Server.DefaultSchedulerConfig.Validate()` | error |
| NodePool 名称 | `structs.ValidateNodePoolName` + 不能是 `all` | error |
| Consul 集群名 | `structs.ValidateConsulClusterName` | error |
| Vault 集群名 | `structs.ValidateVaultClusterName` | error |
| HostVolume 必须有 path | "Missing path in host_volume config" | error |
| 动态端口范围 | min/max 在 [0, 65535]，min ≤ max | error |
| Reserved 端口 | `structs.ParsePortRanges` | error |
| HostNetworks 端口 | `structs.ParsePortRanges` | error |
| Artifact 块 | `config.Client.Artifact.Validate()` | error |
| PreferredAddressFamily | `Validate()` 必须是 ipv4/ipv6 | error |
| RPC 块 | `config.RPC.Validate()` | error |
| Eventlog 块 | `config.Eventlog.Validate()` | error |
| DataDir 必填（非 dev） | server 启用时必须 | error |
| Client 子目录 | data-dir 缺失时需 state/alloc/alloc-mounts/plugin | error |
| BootstrapExpect 奇偶 | 偶数 → WARNING | warn |
| BootstrapExpect=1 | "Bootstrap mode enabled!" WARNING | warn |
| OIDC Issuer URL | 必须可解析 | error |
| OIDC https | 非 https → WARNING | warn |
| ProtocolVersion 废弃 | "remove deprecated protocol_version" | warn |
| KEKProviders | `keyring.Validate()` | error |

### 3.4 日志系统 SetupLoggers()

[command.go:577](file:///d:/claude/nomad/command/agent/command.go#L577) 构造多目标日志输出：

```
                    ┌→ cli.UiWriter (经 logGate 缓冲)
logOutput (MultiWriter) ┼→ syslogWriter   (if enable_syslog)
                    ├→ winsvc.EventLogger (if eventlog.enabled, Windows)
                    └→ logFile        (if log_file 配置)
```

**gated writer 机制**：日志先缓冲在 `logGate` 中，直到 `Run()` 调用 `logGate.Flush()` 才真正输出，确保启动横幅在日志之前显示。

**日志文件轮转**：
- `logRotateDuration` 默认 24 小时
- `LogRotateBytes` / `LogRotateMaxFiles` 控制大小与保留

### 3.5 遥测 setupTelemetry()

[command.go:1227](file:///d:/claude/nomad/command/agent/command.go#L1227) 构建 fanout sink 链：

| Sink | 启用条件 | 配置字段 |
|------|---------|---------|
| Inmem | 始终启用 | `inMemoryCollectionInterval` / `inMemoryRetentionPeriod` |
| Statsite | `statsite_address != ""` | `StatsiteAddr` |
| Statsd | `statsd_address != ""` | `StatsdAddr` |
| Prometheus | `prometheus_metrics = true` | 后台清理 goroutine |
| Datadog | `data_dog_addr != ""` | `DataDogAddr` / `DataDogTags` |
| Circonus | API token 或 submission URL | 10+ 配置项 |

**全局配置**：`metricsConf.EnableHostname`、`EnableHostnameLabel`、`UseNodeName`、`AllowedPrefixes`/`BlockedPrefixes`、`FilterDefault`。

无 fanout sink 时仅用 inmem，且强制 `EnableHostname = false`。

### 3.6 setupAgent()

[command.go:673](file:///d:/claude/nomad/command/agent/command.go#L673)：

1. `NewAgent(config, logger, logOutput, inmem)` 创建 Agent（内部启动 server 和/或 client）
2. `agent.configReloader = c.handleReload` 注入 SIGHUP 重载入口
3. `NewHTTPServers(agent, config)` 启动 HTTP API 服务
4. 若未禁用更新检查：`checkpoint.CheckInterval(24h)` + 立即检查（30s 内随机延迟）

### 3.7 信号处理 handleSignals()

[command.go:1056](file:///d:/claude/nomad/command/agent/command.go#L1056)：

```
信号循环：
  ├─ SIGINT  → LeaveOnInt?  → terminateGracefully()  : return 1
  ├─ SIGTERM → LeaveOnTerm? → terminateGracefully()  : return 1
  ├─ SIGHUP  → handleReload()                         : 继续循环
  ├─ SIGPIPE → 忽略                                   : 继续循环
  ├─ winsvc.ShutdownChannel → LeaveOnInt? 优雅退出    : return 1
  ├─ c.ShutdownCh → LeaveOnInt? 优雅退出              : return 1
  └─ c.retryJoinErrCh → return 1
```

**systemd 集成**：
- `openNotify()` 打开 `NOTIFY_SOCKET`
- `sdNotify(sdReady)` 通知 systemd READY=1
- SIGHUP 时 `sdNotifyReloading()` 通知 RELOADING=1
- 退出时 `sdNotify(sdStopping)` 通知 STOPPING=1

### 3.8 优雅退出 terminateGracefully()

[command.go:1000](file:///d:/claude/nomad/command/agent/command.go#L1000)：

```
timeout = 5s (gracefulTimeout)
         + client.drain.Deadline (若配置)

goroutine: c.agent.Leave() → close(gracefulCh)

select:
  ├─ 二次信号 (非 SIGPIPE) → return 1   (强制退出)
  ├─ timeout 到期          → return 1
  └─ gracefulCh 关闭       → return 0   (优雅完成)
```

### 3.9 配置热重载 handleReload()

[command.go:1142](file:///d:/claude/nomad/command/agent/command.go#L1142) 由 SIGHUP 触发：

```
handleReload()
  ├─ newConf := c.readConfig()                  // 重新读取配置
  ├─ 校验 LogLevel，非法则保留旧值
  ├─ shouldReloadAgent, shouldReloadHTTP := c.agent.ShouldReload(newConf)
  ├─ if shouldReloadAgent:
  │     c.agent.Reload(newConf)
  ├─ if c.agent.Server() != nil:
  │     convertServerConfig → finalizeServerConfig → s.Reload(sconf)
  ├─ if c.agent.Client() != nil:
  │     convertClientConfig → finalizeClientConfig → client.Reload(clientConfig)
  └─ if shouldReloadHTTP:
        reloadHTTPServer()  // 关闭旧 HTTP，用新 TLS 启动
```

**重载顺序**：agent → server → client → HTTP（最后，避免 TLS 部分成功导致不一致）。

**容错策略**：单步失败时记录 error 日志但 `return nil`（不终止 agent），仅 server/client 重载失败时返回 error 终止。

### 3.10 Retry-Join 机制

[command.go:941](file:///d:/claude/nomad/command/agent/command.go#L941)：

**兼容旧字段**：若检测到 `config.Server.RetryJoin`（顶层已废弃），迁移到 `config.Server.ServerJoin.RetryJoin` 并打 warning。

**新建 joiner**（server 和 client 各一份）：
- `autoDiscover`：使用 `go-discover` 库支持云提供商自动发现（AWS/GCP/Azure 等）
- `joinFunc`：server 用 `c.agent.server.Join`，client 用 `c.agent.client.SetServers`
- 失败时关闭 `c.retryJoinErrCh`，主循环收到后 `return 1` 退出

### 3.11 startupJoin()

[command.go:1409](file:///d:/claude/nomad/command/agent/command.go#L1409) 仅对 server 生效：

- 校验 `StartJoin` 与 `ServerJoin.StartJoin` 不能同时设置
- 合并列表后调用 `c.agent.server.Join(joining)`
- 输出 "Joining cluster..." 与 "Join completed. Synced with N initial agents"

---

## 4. 命令行参数分类

### 4.1 角色与开发模式

| Flag | 说明 |
|------|------|
| `-dev` | 开发模式（client+server 双角色，本地配置） |
| `-dev-connect` | 开发模式 + 公网绑定（Consul Connect） |
| `-dev-consul` | 开发模式 + 默认 Consul workload identity |
| `-dev-vault` | 开发模式 + 默认 Vault workload identity |
| `-server` | 启用 server 模式 |
| `-client` | 启用 client 模式 |

### 4.2 Server 选项

| Flag | 默认 | 说明 |
|------|------|------|
| `-bootstrap-expect` | 0 | 期望 server 数量 |
| `-encrypt` | "" | gossip 加密密钥 |
| `-raft-protocol` | 0 | Raft 协议版本 |
| `-rejoin` | false | 离开后重新加入 |
| `-join` | [] | 启动时 join 地址（可多次） |
| `-retry-join` | [] | 重试 join 地址 |
| `-retry-max` | 0 | 最大重试次数（0=无限） |
| `-retry-interval` | 0 | 重试间隔 |

### 4.3 Client 选项

| Flag | 说明 |
|------|------|
| `-state-dir` | 状态目录 |
| `-alloc-dir` | 分配目录 |
| `-alloc-mounts-dir` | 挂载分配目录 |
| `-host-volumes-dir` | 主机卷目录 |
| `-host-volume-plugin-dir` | 主机卷插件目录 |
| `-node-class` | 节点类 |
| `-node-pool` | 节点池 |
| `-servers` | 服务器列表（逗号分隔） |
| `-meta` | 节点元数据 `key=value` |
| `-network-interface` | 强制网络接口 |
| `-preferred-address-family` | ipv4/ipv6 |
| `-network-speed` | 默认网络速度 |
| `-client-intro-token` | 初始注册 JWT |

### 4.4 通用选项

`-bind` `-config` `-data-dir` `-plugin-dir` `-dc` `-log-level` `-log-json` `-log-include-location` `-eventlog` `-eventlog-level` `-node` `-region`

### 4.5 集成选项

- **ACL**：`-acl-enabled` `-acl-replication-token`
- **Consul**：20+ flag（地址/认证/TLS/服务名/健康检查/auto-join 等）
- **Vault**：10+ flag（启用/地址/namespace/role/TLS 等）

---

## 5. 关键设计模式

### 5.1 配置合并策略

采用递归 `Merge` 模式，每个 `Config` 字段实现"非零覆盖"语义。CLI flags 通过构造空 `cmdConfig` 并设置字段实现最高优先级。配置文件按列表顺序合并，后者覆盖前者。

### 5.2 Gated Logger

`gatedwriter.Writer` 缓冲所有日志直到显式 `Flush()`。设计目的：
- 启动期间的日志（如配置加载）不会在启动横幅之前泄露
- JSON 日志模式下跳过缓冲（`logGate.Flush()` 提前调用），因为 JSON 无法重排序

### 5.3 信号与生命周期解耦

`handleSignals()` 是单一信号循环入口，但实际关闭逻辑委托给 `terminateGracefully()`。`Agent.Leave()` 与 `Agent.Shutdown()` 分离：
- `Leave()`：通知集群本节点离开（serf leave）
- `Shutdown()`：停止本地组件（HTTP/server/client）

### 5.4 systemd/Windows 服务集成

- Linux：通过 `sdNotify` 协议通知 systemd 状态（READY/RELOADING/STOPPING）
- Windows：`winsvc.SendEvent` 通知 SCM，`winsvc.ShutdownChannel` 接收服务停止请求，`winsvc.NewEventLogger` 输出到 EventLog

### 5.5 自动补全

`AutocompleteFlags()` 返回 `complete.Predictor` 映射，支持：
- `PredictNothing`：布尔 flag
- `PredictAnything`：自由文本
- `PredictDirs("*")`：目录补全
- `PredictFiles("*.json")` / `PredictFiles("*.hcl")`：配置文件补全
- `PredictSet("INFO", "WARN", "ERROR")`：枚举值

---

## 6. 依赖关系

### 6.1 外部依赖

| 库 | 用途 |
|----|------|
| `github.com/hashicorp/cli` | CLI 框架（Command 接口、Ui） |
| `github.com/hashicorp/go-checkpoint` | 版本更新检查 |
| `github.com/hashicorp/go-discover` | 云提供商节点发现 |
| `github.com/hashicorp/go-hclog` | 结构化日志 |
| `github.com/hashicorp/go-metrics/compat` | 遥测 sink（circonus/datadog/prometheus） |
| `github.com/hashicorp/go-syslog` | syslog 输出 |
| `github.com/posener/complete` | shell 自动补全 |
| `golang.org/x/text` | 标题大小写处理 |

### 6.2 内部包依赖

| 包 | 用途 |
|----|------|
| `helper` | `RandomStagger`、`IsValidInterpVariable` |
| `helper/flags` | `StringFlag`、`FuncBoolVar`、`FuncDurationVar` |
| `helper/gated-writer` | 日志缓冲 |
| `helper/logging` | `HcLogUI`、`isLogLevelValid`、`validLogLevels` |
| `helper/winsvc` | Windows 服务集成 |
| `nomad/structs` | `ValidateNodePoolName`、`ParsePortRanges`、`ConsulDefaultCluster` 等 |
| `nomad/structs/config` | `ConsulConfig`、`VaultConfig`、`AuditConfig`、`ReportingConfig` |
| `version` | `VersionInfo` |

### 6.3 同包依赖

- `Agent`（[agent.go](file:///d:/claude/nomad/command/agent/agent.go)）：核心 agent 实现
- `Config` / `ClientConfig` / `ServerConfig` / `ServerJoin` / `Ports` / `ACLConfig` / `Eventlog`：配置类型
- `HTTPServer` / `NewHTTPServers`：HTTP API 服务
- `LoadConfig` / `DefaultConfig` / `DevConfig` / `DefaultEntConfig`：配置加载
- `retryJoiner` / `autoDiscover` / `netAddrs`：join 逻辑
- `convertServerConfig` / `convertClientConfig`：配置转换
- `logFile` / `newSyslogWriter` / `getSysLogPriority`：日志辅助
- `sdNotify` / `sdNotifyReloading` / `openNotify`：systemd 通知
- `serfKeyring`：serf 密钥文件名常量

---

## 7. 启动时序图

```
用户执行: nomad agent -config=/etc/nomad.d -dev
  │
  ▼
main.go → cli.Command.Run()
  │
  ▼
Command.Run(args)
  ├─ readConfig()
  │   ├─ flags.Parse(args)
  │   ├─ DevConfig() / DefaultConfig()
  │   ├─ Merge(DefaultEntConfig())
  │   ├─ LoadConfig(path) + Merge  ← 多次
  │   ├─ Merge(cmdConfig)
  │   ├─ normalizeAddrs()
  │   └─ IsValidConfig()
  ├─ SetupLoggers()                → logGate, logOutput
  ├─ hclog.NewInterceptLogger()
  ├─ setupTelemetry()              → inmem sink
  ├─ setupAgent()
  │   ├─ NewAgent()                → 启动 server (Raft/Serf) + client (fingerprint)
  │   ├─ agent.configReloader = handleReload
  │   └─ NewHTTPServers()          → 监听 HTTP 端口
  ├─ startupJoin()                 → server.Join() (一次性)
  ├─ 打印配置摘要
  ├─ logGate.Flush()               → 释放缓冲日志
  ├─ handleRetryJoin()             → go joiner.RetryJoin() (server + client)
  ├─ winsvc.SendEvent(Ready)
  └─ handleSignals()               → 阻塞
      │
      ├─ SIGHUP → handleReload()
      │   ├─ readConfig()
      │   ├─ agent.Reload()
      │   ├─ server.Reload()
      │   ├─ client.Reload()
      │   └─ reloadHTTPServer()
      │
      ├─ SIGINT/SIGTERM → terminateGracefully()
      │   ├─ agent.Leave()          → serf leave
      │   └─ (defer) agent.Shutdown() + httpServers.Shutdown()
      │
      └─ retryJoinErrCh → return 1
```

---

## 8. 注意事项与陷阱

### 8.1 已废弃字段

- `config.Server.RetryJoin` / `RetryMaxAttempts` / `RetryInterval`（顶层）：应迁移到 `server_join` 块，会打 warning
- `config.Server.StartJoin`（顶层）：应迁移到 `server_join.start_join`
- `config.Server.ProtocolVersion`：从未使用，会打 warning 提示移除

### 8.2 环境变量覆盖

| 环境变量 | 覆盖的 flag |
|---------|------------|
| `NOMAD_CLIENT_INTRO_TOKEN` | `-client-intro-token` |
| `NOMAD_LICENSE` | `server.license` |
| `NOMAD_LICENSE_PATH` | `server.license_path` |
| `VAULT_NAMESPACE` | `vault.namespace`（仅当配置为空时） |
| `VAULT_TOKEN` | （由 Vault SDK 处理，非本文件） |

### 8.3 DevMode 特殊性

- `DevConfig(devConfig)` 跳过 `DefaultConfig()`，提供预配置的双角色 agent
- `dev-connect` 需要 Linux root，绑定公网接口
- DevMode 下 `IsValidConfig` 跳过 DataDir 必填校验
- DevMode 下 TLS 警告被抑制

### 8.4 重载失败行为

`handleReload()` 中：
- `readConfig()` 失败 → 仅打印错误，`return nil`（不退出）
- `agent.Reload()` 失败 → 打印错误，`return nil`（不退出）
- `server.Reload()` / `client.Reload()` 失败 → `return error`（**导致 agent 终止**）
- `reloadHTTPServer()` 失败 → 仅打印错误（不退出）

### 8.5 Windows 事件日志

`-eventlog` 仅在 Windows 有效，`winsvc.NewEventLogger` 在非 Windows 平台会返回错误。Level 必须不高于 `-log-level`。

---

## 9. 扩展点

企业版（Nomad Enterprise）通过以下方式扩展本文件：

1. `DefaultEntConfig()`：注入企业版默认配置（license、多区域等）
2. `SetupLoggers()` 设为 public：企业版可包装或替换日志链
3. `Agent` 结构体的 `EnterpriseAgent` 字段：企业版功能挂载点
4. `config.Merge` 链：企业版配置块通过 Merge 机制叠加

---

## 10. 相关文件

| 文件 | 关系 |
|------|------|
| [agent.go](file:///d:/claude/nomad/command/agent/agent.go) | `Agent` 核心实现 |
| [config.go](file:///d:/claude/nomad/command/agent/config.go) | `Config` 及所有配置类型 |
| [http.go](file:///d:/claude/nomad/command/agent/http.go) | `HTTPServer` 实现 |
| [join.go](file:///d:/claude/nomad/command/agent/join.go) | `retryJoiner` 实现 |
| [log_file.go](file:///d:/claude/nomad/command/agent/log_file.go) | `logFile` 日志轮转 |
| [sdnotify.go](file:///d:/claude/nomad/command/agent/sdnotify.go) | systemd 通知 |
| [syslog.go](file:///d:/claude/nomad/command/agent/syslog.go) | syslog writer |
| [../main.go](file:///d:/claude/nomad/command/main.go) | CLI 入口，注册 `agent` 命令 |
