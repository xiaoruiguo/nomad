# Nomad Agent 配置项全集详解

> 基于源码 [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go)、[nomad/structs/config/](file:///d:/claude/nomad/nomad/structs/config)、[client/config/](file:///d:/claude/nomad/client/config)、[nomad/structs/](file:///d:/claude/nomad/nomad/structs) 中的所有配置结构体字段
> 覆盖所有可通过 HCL/JSON 配置文件设置的项（带 `hcl:` 或 `mapstructure:` tag 的字段）
> 排除内部字段（无 tag 或 tag 为 `-`、`,unusedKeys`）

---

## 目录

1. [顶层配置（Config）](#1-顶层配置config)
2. [端口配置（ports）](#2-端口配置ports)
3. [监听地址配置（addresses）](#3-监听地址配置addresses)
4. [通告地址配置（advertise）](#4-通告地址配置advertise)
5. [Server 配置（server）](#5-server-配置server)
6. [Client 配置（client）](#6-client-配置client)
7. [ACL 配置（acl）](#7-acl-配置acl)
8. [TLS 配置（tls）](#8-tls-配置tls)
9. [Telemetry 遥测配置（telemetry）](#9-telemetry-遥测配置telemetry)
10. [Consul 配置（consul）](#10-consul-配置consul)
11. [Vault 配置（vault）](#11-vault-配置vault)
12. [UI 配置（ui）](#12-ui-配置ui)
13. [Audit 审计配置（audit）](#13-audit-审计配置audit)
14. [Limits 限制配置（limits）](#14-limits-限制配置limits)
15. [Autopilot 自动驾驶配置（autopilot）](#15-autopilot-自动驾驶配置autopilot)
16. [Plugin 插件配置（plugin）](#16-plugin-插件配置plugin)
17. [Sentinel 策略配置（sentinel）](#17-sentinel-策略配置sentinel)
18. [Reporting 报告配置（reporting）](#18-reporting-报告配置reporting)
19. [Keyring 密钥环配置（keyring）](#19-keyring-密钥环配置keyring)
20. [RPC 配置（rpc）](#20-rpc-配置rpc)
21. [Eventlog 事件日志配置（eventlog）](#21-eventlog-事件日志配置eventlog)
22. [Raft 日志存储配置（raft_logstore / raft_boltdb）](#22-raft-日志存储配置raft_logstore--raft_boltdb)
23. [Search 搜索配置（search）](#23-search-搜索配置search)
24. [ServerJoin 集群加入配置（server_join）](#24-serverjoin-集群加入配置server_join)
25. [Client 子配置](#25-client-子配置)
26. [Server 子配置](#26-server-子配置)

---

## 1. 顶层配置（Config）

来源：[command/agent/config.go L48-L209](file:///d:/claude/nomad/command/agent/config.go#L48)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `region` | string | `"global"` | Region is the region the Agent is a member of. | 区域名，Agent 所属区域，用于多区域联邦 |
| `datacenter` | string | `"dc1"` | Datacenter is the datacenter the Agent is a member of. | 数据中心名，Agent 所属数据中心 |
| `name` | string | hostname | NodeName is the name we register as. Defaults to hostname. | 节点名，注册到集群的名字，默认为主机名 |
| `data_dir` | string | required | DataDir is the directory to store our state in. | 数据目录，存放状态数据（Raft 日志、节点 ID、分配目录等） |
| `plugin_dir` | string | `{data_dir}/plugins` | PluginDir is the directory to store our plugins in. | 插件目录，存放任务驱动插件，默认 `{data_dir}/plugins` |
| `log_level` | string | `"INFO"` | LogLevel is the level of the logs to output. | 日志级别（TRACE/DEBUG/INFO/WARN/ERROR） |
| `log_json` | bool | `false` | LogJson is whether to output logs in JSON format. | 是否以 JSON 格式输出日志 |
| `log_file` | string | empty | LogFile is the path to write the logs to. | 日志文件路径，为空则输出到 stdout |
| `log_include_location` | bool | `false` | LogIncludeLocation includes file:line in logs. | 日志是否包含源码位置（文件名:行号） |
| `log_rotate_duration` | string | `"24h"` | LogRotateDuration is the duration between log rotations. | 日志轮转周期（如 "24h"、"1h"） |
| `log_rotate_bytes` | int | `0` | LogRotateBytes is the max bytes per log file. | 单个日志文件最大字节数，0 表示不限制 |
| `log_rotate_max_files` | int | `0` | LogRotateMaxFiles is the max number of log files. | 保留的最大日志文件数，0 表示不限制 |
| `bind_addr` | string | `"0.0.0.0"` | BindAddr is used to override the bind address. | 绑定地址，Agent 监听的网络接口 IP |
| `enable_debug` | bool | `false` | EnableDebug controls whether debug endpoints are exposed. | 是否启用调试 HTTP 端点（pprof 等） |
| `ports` | block | see §2 | Ports is used to override the default ports. | 端口配置块 |
| `addresses` | block | see §3 | Addresses is used to override addresses. | 监听地址配置块 |
| `advertise` | block | see §4 | AdvertiseAddrs is used to control the advertise addresses. | 通告地址配置块 |
| `client` | block | see §5 | Client is the ClientConfig. | Client 配置块 |
| `server` | block | see §6 | Server is the ServerConfig. | Server 配置块 |
| `rpc` | block | see §20 | RPC is the RPCConfig. | RPC 配置块 |
| `acl` | block | see §7 | ACL is the ACLConfig. | ACL 访问控制配置块 |
| `telemetry` | block | see §9 | Telemetry is the Telemetry config. | 遥测 metrics 配置块 |
| `leave_on_interrupt` | bool | `false` | LeaveOnInt controls whether Ctrl+C triggers graceful leave. | 收到 SIGINT（Ctrl+C）时是否优雅离开集群 |
| `leave_on_terminate` | bool | `false` | LeaveOnTerm controls whether SIGTERM triggers graceful leave. | 收到 SIGTERM 时是否优雅离开集群 |
| `enable_syslog` | bool | `false` | EnableSyslog controls whether logs are written to syslog. | 是否将日志写入 syslog |
| `syslog_facility` | string | `"LOCAL0"` | SyslogFacility is the syslog facility to use. | syslog 设施名（LOCAL0-LOCAL7、USER 等） |
| `disable_update_check` | bool | `false` | DisableUpdateCheck controls whether the periodic update check is disabled. | 是否禁用周期性版本更新检查（向 checkpoint.hashicorp.com 报告） |
| `disable_anonymous_signature` | bool | `false` | DisableAnonymousSignature controls whether the anonymous signature is sent. | 是否禁用发送匿名签名（用于更新检查） |
| `ui` | block | see §12 | UI is the UIConfig. | Web UI 配置块 |
| `tls` | block | see §8 | TLSConfig is used to configure TLS. | TLS 加密配置块 |
| `http_api_response_headers` | map[string]string | empty | HTTPAPIResponseHeaders are custom headers added to HTTP responses. | HTTP API 响应中附加的自定义头 |
| `sentinel` | block | see §17 | Sentinel is the SentinelConfig. | Sentinel 策略配置块（企业版） |
| `autopilot` | block | see §15 | Autopilot is the AutopilotConfig. | Autopilot 自动集群管理配置块 |
| `plugin` | block (list) | see §16 | Plugins is the list of plugin configurations. | 插件配置块列表（可多个） |
| `limits` | block | see §14 | Limits is the Limits config. | 连接/请求限制配置块 |
| `audit` | block | see §13 | Audit is the AuditConfig. | 审计日志配置块（企业版） |
| `reporting` | block | see §18 | Reporting is the ReportingConfig. | 产品使用报告配置块（企业版） |
| `keyring` | block (list) | see §19 | KEKProviders is the list of key encryption key providers. | 密钥加密密钥提供者配置块列表（企业版） |
| `eventlog` | block | see §21 | Eventlog is the Eventlog config. | 事件日志配置块 |

---

## 2. 端口配置（ports）

来源：[command/agent/config.go L1583-L1589](file:///d:/claude/nomad/command/agent/config.go#L1583)

```hcl
ports {
  http = 4646
  rpc  = 4647
  serf = 4648
}
```

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `http` | int | `4646` | HTTP port for the HTTP API and UI. | HTTP API 和 Web UI 监听端口 |
| `rpc` | int | `4647` | RPC port for Nomad server RPC. | Nomad Server RPC 端口（Client-Server 和 Server-Server 通信） |
| `serf` | int | `4648` | Serf port for cluster gossip. | Serf WAN gossip 端口（集群成员发现和故障检测） |

---

## 3. 监听地址配置（addresses）

来源：[command/agent/config.go L1603-L1609](file:///d:/claude/nomad/command/agent/config.go#L1603)

```hcl
addresses {
  http = "0.0.0.0"
  rpc  = "0.0.0.0"
  serf = "0.0.0.0"
}
```

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `http` | string | `bind_addr` | HTTP is the address to bind the HTTP listener. | HTTP API 监听地址（默认为 `bind_addr`） |
| `rpc` | string | `bind_addr` | RPC is the address to bind the RPC listener. | RPC 监听地址（默认为 `bind_addr`） |
| `serf` | string | `bind_addr` | Serf is the address to bind the Serf listener. | Serf gossip 监听地址（默认为 `bind_addr`） |

---

## 4. 通告地址配置（advertise）

来源：[command/agent/config.go L1643-L1649](file:///d:/claude/nomad/command/agent/config.go#L1643)

```hcl
advertise {
  http = "10.0.0.1"
  rpc  = "10.0.0.1"
  serf = "10.0.0.1"
}
```

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `http` | string | first non-loopback IPv4 | HTTP is the address to advertise for HTTP API. | 对外通告的 HTTP API 地址（其他节点/客户端连接此地址） |
| `rpc` | string | first non-loopback IPv4 | RPC is the address to advertise for RPC. | 对外通告的 RPC 地址（Client 和其他 Server 连接此地址） |
| `serf` | string | first non-loopback IPv4 | Serf is the address to advertise for Serf. | 对外通告的 Serf gossip 地址（其他 Server 通过此地址加入集群） |

> 通告地址不能为 `0.0.0.0`，必须是可达的具体 IP。

---

## 5. Server 配置（server）

来源：[command/agent/config.go L542-L814](file:///d:/claude/nomad/command/agent/config.go#L542)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `enabled` | bool | `false` | Enabled controls whether the server is enabled. | 是否启用 Server 模式 |
| `authoritative_region` | string | `"global"` | AuthoritativeRegion is the region that is authoritative for ACLs. | ACL 权威区域，跨区域联邦时其他区域的 ACL 复制源 |
| `bootstrap_expect` | int | `0` | BootstrapExpect is the expected number of servers for bootstrap. | 引导集群期望的 Server 数量（1=单节点自举，3=三节点集群） |
| `client_introduction` | block | see §26.2 | ClientIntroduction is the client introduction config. | Client 引入配置（企业版，工作负载身份引导） |
| `data_dir` | string | top-level `data_dir` | DataDir is the directory to store server state. | Server 状态数据目录（Raft 日志、快照），默认继承顶层 `data_dir` |
| `protocol_version` | int | current | (Deprecated) ProtocolVersion is the protocol version to speak. | **已废弃**：Raft 协议版本，改用 `raft_protocol` |
| `raft_protocol` | int | `2` | RaftProtocol is the Raft protocol version. | Raft 协议版本（2 或 3，v3 支持永久节点 ID） |
| `raft_multiplier` | int | `1` | RaftMultiplier is the multiplier for Raft timeouts. | Raft 超时倍数（网络延迟高时增大，如 5） |
| `num_schedulers` | int | `runtime.NumCPU()/2` | NumSchedulers is the number of scheduler workers. | 调度 Worker 数量（默认 CPU 核数一半） |
| `enabled_schedulers` | []string | `["service","batch","system","core"]` | EnabledSchedulers is the list of enabled schedulers. | 启用的调度器类型列表 |
| `node_gc_threshold` | string | `"24h"` | NodeGCThreshold is the threshold beyond which Nodes are garbage collected. | 节点 GC 阈值，超过此时间未活动的节点被回收 |
| `job_gc_interval` | string | `"4h"` | JobGCInterval is the interval at which we attempt to garbage collect jobs. | 作业 GC 运行间隔 |
| `job_gc_threshold` | string | `"4h"` | JobGCThreshold is the threshold beyond which stopped jobs are GC'd. | 作业 GC 阈值，停止超过此时间的作业被回收 |
| `eval_gc_threshold` | string | `"1h"` | EvalGCThreshold is the threshold beyond which Evals are GC'd. | 评估 GC 阈值 |
| `batch_eval_gc_threshold` | string | `"24h"` | BatchEvalGCThreshold is the threshold for batch evals. | 批量作业评估 GC 阈值 |
| `deployment_gc_threshold` | string | `"1h"` | DeploymentGCThreshold is the threshold beyond which Deployments are GC'd. | 部署 GC 阈值 |
| `csi_volume_claim_gc_interval` | string | `"30m"` | Interval for CSI volume claim GC. | CSI 卷声明 GC 运行间隔 |
| `csi_volume_claim_gc_threshold` | string | `"1h"` | Threshold for CSI volume claim GC. | CSI 卷声明 GC 阈值 |
| `csi_plugin_gc_threshold` | string | `"1h"` | Threshold for CSI plugin GC. | CSI 插件 GC 阈值 |
| `acl_token_gc_threshold` | string | `"1m"` | Threshold for ACL token GC. | ACL 令牌 GC 阈值 |
| `root_key_gc_interval` | string | `"1h"` | Interval for root key GC. | 根密钥 GC 运行间隔 |
| `root_key_gc_threshold` | string | `"1h"` | Threshold for root key GC. | 根密钥 GC 阈值 |
| `root_key_rotation_threshold` | string | `"720h"` | Threshold for root key rotation. | 根密钥轮换阈值（30 天） |
| `heartbeat_grace` | string | `"10s"` | HeartbeatGrace is the grace period for heartbeats. | 心跳宽限期，超过此时间未收到 Client 心跳则标记节点为 down |
| `min_heartbeat_ttl` | string | `"10s"` | MinHeartbeatTTL is the minimum TTL for heartbeats. | 心跳最小 TTL（Client 端心跳有效期下限） |
| `max_heartbeats_per_second` | float64 | `50.0` | MaxHeartbeatsPerSecond is the maximum rate of heartbeats. | Server 每秒处理的最大心跳数 |
| `failover_heartbeat_ttl` | string | `"10m"` | FailoverHeartbeatTTL is the TTL during failover. | 故障转移期间的心跳 TTL |
| `start_join` | []string | empty | (Deprecated) StartJoin is a list of addresses to join at startup. | **已废弃**：启动时立即加入的地址列表，改用 `server_join.start_join` |
| `retry_join` | []string | empty | (Deprecated) RetryJoin is a list of addresses to retry joining. | **已废弃**：启动时重试加入的地址列表，改用 `server_join.retry_join` |
| `retry_max` | int | `0` | (Deprecated) RetryMaxAttempts is the max retry attempts. | **已废弃**：最大重试次数，改用 `server_join.retry_max` |
| `retry_interval` | string | `"30s"` | (Deprecated) RetryInterval is the interval between retries. | **已废弃**：重试间隔，改用 `server_join.retry_interval` |
| `rejoin_after_leave` | bool | `false` | RejoinAfterLeave controls whether a re-join is allowed after leave. | 离开后是否允许重新加入集群 |
| `non_voting_server` | bool | `false` | (Enterprise) NonVotingServer controls whether this is a non-voter. | **企业版**：是否为非投票 Server（不参与 Raft 选举） |
| `redundancy_zone` | string | empty | (Enterprise) RedundancyZone is the autopilot redundancy zone. | **企业版**：Autopilot 冗余区域名 |
| `upgrade_version` | string | empty | (Enterprise) UpgradeVersion is the target upgrade version. | **企业版**：目标升级版本（用于 Autopilot 滚动升级） |
| `encrypt` | string | empty | EncryptKey is the key for encrypting gossip traffic. | Serf gossip 加密密钥（16 字节 base64 编码） |
| `server_join` | block | see §24 | ServerJoin is the ServerJoin config. | 集群加入配置块 |
| `default_scheduler_config` | block | - | DefaultSchedulerConfig is the scheduler config. | 默认调度器配置（调度器超时、失败策略等） |
| `plan_rejection_tracker` | block | see §26.3 | PlanRejectionTracker is the plan rejection tracker config. | 计划拒绝跟踪器配置 |
| `enable_event_broker` | bool | `true` | EnableEventBroker controls whether the event broker is enabled. | 是否启用事件代理器 |
| `event_buffer_size` | int | `100` | EventBufferSize is the buffer size for events. | 事件缓冲区大小 |
| `license_path` | string | empty | LicensePath is the path to the license file. | **企业版**：许可证文件路径 |
| `search` | block | see §23 | Search is the Search config. | 模糊搜索配置 |
| `deploy_query_rate_limit` | float64 | `1.0` | DeploymentQueryRateLimit is the rate limit for deployment queries. | 部署查询速率限制（每秒查询次数） |
| `raft_logstore` | block | see §22.1 | RaftLogStoreConfig is the raft log store config. | Raft 日志存储配置 |
| `raft_boltdb` | block | see §22.2 | (Deprecated) RaftBoltConfig is the BoltDB config. | **已废弃**：BoltDB 配置，改用 `raft_logstore.boltdb` |
| `raft_snapshot_threshold` | int | `8192` | RaftSnapshotThreshold is the log entries before snapshot. | 触发快照的日志条目数阈值 |
| `raft_snapshot_interval` | string | `"30s"` | RaftSnapshotInterval is the interval for snapshots. | 快照检查间隔 |
| `raft_trailing_logs` | int | `10240` | RaftTrailingLogs is the log entries retained after snapshot. | 快照后保留的日志条目数 |
| `job_default_priority` | int | `50` | JobDefaultPriority is the default priority for jobs. | 作业默认优先级 |
| `job_max_priority` | int | `100` | JobMaxPriority is the max priority for jobs. | 作业最大优先级 |
| `job_max_count` | int | `100000` | JobMaxCount is the max task group count for jobs. | 作业任务组最大数量 |
| `job_max_source_size` | string | `"4MiB"` | JobMaxSourceSize is the max source change script size. | 作业变更脚本最大大小 |
| `job_tracked_versions` | int | `6` | JobTrackedVersions is the number of versions tracked per job. | 每个作业跟踪的版本数 |
| `oidc_issuer` | string | empty | OIDCIssuer is the OIDC issuer URL for workload identities. | OIDC 签发者 URL（用于工作负载身份 JWT 的外部验证） |
| `start_timeout` | string | `"30s"` | StartTimeout is the timeout for server startup. | Server 启动超时时间 |
| `log_file` | string | top-level `log_file` | LogFile is the log file path for the server. | Server 专用日志文件路径 |
| `non_production` | bool | `false` | NonProduction marks the server as non-production. | 标记为非生产环境（影响 metrics 收集） |

---

## 6. Client 配置（client）

来源：[command/agent/config.go L230-L458](file:///d:/claude/nomad/command/agent/config.go#L230)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `enabled` | bool | `false` | Enabled controls whether the client is enabled. | 是否启用 Client 模式 |
| `state_dir` | string | `{data_dir}/client` | StateDir is the directory to store client state. | Client 状态目录（BoltDB 状态数据库） |
| `alloc_dir` | string | `{data_dir}/alloc` | AllocDir is the directory to store allocation data. | 分配目录，存放任务运行时数据 |
| `alloc_mounts_dir` | string | `{alloc_dir}/.mounts` | AllocMountsDir is the directory for mount points. | 分配挂载目录（Linux mount namespace 隔离） |
| `host_volumes_dir` | string | `{alloc_dir}/host_volumes` | HostVolumesDir is the directory for host volumes. | 主机卷目录 |
| `host_volume_plugin_dir` | string | `{plugin_dir}/host_volumes` | HostVolumePluginDir is the directory for host volume plugins. | 主机卷插件目录 |
| `common_plugin_dir` | string | empty | CommonPluginDir is the directory for plugins shared by all clients. | 共享插件目录（多个 Client 实例共用） |
| `servers` | []string | `["127.0.0.1:4647"]` | Servers is the list of Nomad servers to connect. | Nomad Server 地址列表 |
| `node_class` | string | empty | NodeClass is used to restrict placements. | 节点类别，用于约束作业放置 |
| `node_pool` | string | `"default"` | NodePool is the node pool name. | 节点池名（企业版功能） |
| `options` | map[string]string | empty | Options is used for configuration of drivers. | 驱动配置键值对（如 docker.config） |
| `meta` | map[string]string | empty | Meta is used to associate metadata with the node. | 节点元数据键值对，用于作业约束 |
| `chroot_env` | map[string]string | empty | ChrootEnv is the chroot environment for tasks. | 任务 chroot 环境映射（如 `/bin=/usr/bin`） |
| `network_interface` | string | first non-loopback | NetworkInterface is the interface to use for fingerprinting. | 网络接口名，用于指纹采集网络速度 |
| `preferred_address_family` | string | `"ipv4"` | PreferredAddressFamily is the preferred address family. | 首选地址族（ipv4/ipv6/any） |
| `network_speed` | int | `0` | NetworkSpeed is the network speed in MBits/sec. | 网络速度（Mbps），0 表示自动检测 |
| `cpu_disable_dmidecode` | bool | `false` | CpuDisableDmidecode disables using dmidecode for CPU info. | 是否禁用 dmidecode 获取 CPU 信息 |
| `cpu_total_compute` | int | `0` | CpuCompute is the CPU total compute in MHz. | CPU 总算力（MHz），0 表示自动检测 |
| `memory_total_mb` | int | `0` | MemoryMB is the total memory in MB. | 总内存（MB），0 表示自动检测 |
| `disk_total_mb` | int | `0` | DiskTotalMB is the total disk in MB. | 总磁盘空间（MB），0 表示自动检测 |
| `disk_free_mb` | int | `0` | (Deprecated) DiskFreeMB is the free disk in MB. | **已废弃**：可用磁盘空间，现在自动计算 |
| `reservable_cores` | string | empty | ReservableCores is the cores to reserve. | 可保留的核心数（如 "1,2,3" 或 "1-4"） |
| `max_kill_timeout` | string | `"30s"` | MaxKillTimeout is the max kill timeout. | 最大杀死超时（任务停止时等待超时） |
| `client_max_port` | int | `14512` | ClientMaxPort is the upper bound of ports for client. | Client 端口上限（用于插件通信） |
| `client_min_port` | int | `14000` | ClientMinPort is the lower bound of ports for client. | Client 端口下限 |
| `max_dynamic_port` | int | `14512` | MaxDynamicPort is the upper bound of dynamic ports. | 动态端口上限（任务动态端口分配） |
| `min_dynamic_port` | int | `11000` | MinDynamicPort is the lower bound of dynamic ports. | 动态端口下限 |
| `reserved` | block | see §25.3 | Reserved is the reserved resources. | 预留资源配置块 |
| `gc_interval` | string | `"1m"` | GCInterval is the interval for garbage collection. | GC 运行间隔 |
| `gc_parallel_destroys` | int | `2` | GCParallelDestroys is the parallelism for GC destroys. | GC 并行销毁数量 |
| `gc_disk_usage_threshold` | float64 | `0.85` | GCDiskUsageThreshold is the disk usage threshold for GC. | 磁盘使用率 GC 阈值（0-1） |
| `gc_inode_usage_threshold` | float64 | `0.70` | GCInodeUsageThreshold is the inode usage threshold. | inode 使用率 GC 阈值（0-1） |
| `gc_max_allocs` | int | `50` | GCMaxAllocs is the max allocs before forced GC. | 强制 GC 的分配数量阈值 |
| `gc_volumes_on_node_gc` | bool | `false` | GCVolumesOnNodeGC controls volume GC on node GC. | 节点 GC 时是否同时 GC 卷 |
| `no_host_uuid` | bool | `false` | NoHostUUID controls whether to use host UUID. | 是否禁用主机 UUID（隐私保护） |
| `disable_remote_exec` | bool | `false` | DisableRemoteExec disables remote exec. | 是否禁用远程执行功能 |
| `template` | block | see §25.1 | TemplateConfig is the consul-template config. | consul-template 配置块 |
| `server_join` | block | see §24 | ServerJoin is the server join config. | 集群加入配置块（Client 通过此配置连接 Server） |
| `host_volume` | block (list) | see §25.2 | HostVolumes is the list of host volumes. | 主机卷配置块列表 |
| `cni_path` | string | `/opt/cni/bin` | CNIPath is the path to CNI plugins. | CNI 插件路径 |
| `cni_config_dir` | string | `/opt/cni/config` | CNIConfigDir is the directory for CNI configs. | CNI 配置目录 |
| `bridge_network_name` | string | `nomad` | BridgeNetworkName is the name of the bridge network. | 桥接网络名称 |
| `bridge_network_subnet` | string | `"172.26.64.0/20"` | BridgeNetworkSubnet is the subnet for the bridge. | 桥接网络 IPv4 子网 |
| `bridge_network_subnet_ipv6` | string | `"fd7a:115c:a1e0:b234:1::/80"` | BridgeNetworkSubnetIPv6 is the subnet for IPv6. | 桥接网络 IPv6 子网 |
| `bridge_network_hairpin_mode` | bool | `false` | BridgeNetworkHairpinMode enables hairpin mode. | 是否启用桥接网络发夹模式 |
| `host_network` | block (list) | see §25.4 | HostNetworks is the list of host networks. | 主机网络配置块列表 |
| `bind_wildcard_default_host_network` | bool | `false` | BindWildcardDefaultHostNetwork binds wildcard. | 是否将默认主机网络绑定到通配符地址 |
| `cgroup_parent` | string | empty | CgroupParent is the cgroup parent. | cgroup 父目录（用于资源隔离） |
| `nomad_service_discovery` | bool | `false` | NomadServiceDiscovery enables Nomad service discovery. | 是否启用 Nomad 原生服务发现 |
| `artifact` | block | see §25.5 | Artifact is the artifact config. | 制品下载配置块 |
| `drain_on_shutdown` | block | see §25.6 | Drain is the drain config on shutdown. | 关闭时排空配置块 |
| `users` | block | see §25.7 | Users is the users config. | 用户配置块（动态用户管理） |
| `node_max_allocs` | int | `0` | NodeMaxAllocs is the max allocs per node. | 每节点最大分配数（0 表示不限制） |
| `log_file` | string | top-level `log_file` | LogFile is the log file for the client. | Client 专用日志文件路径 |
| `fingerprint` | block (list) | see §25.8 | Fingerprinters is the list of fingerprint configs. | 指纹器配置块列表 |
| `default_ineligible` | bool | `false` | DefaultIneligible sets the node as ineligible by default. | 默认是否将节点设为不可调度 |

---

## 7. ACL 配置（acl）

来源：[command/agent/config.go L486-L529](file:///d:/claude/nomad/command/agent/config.go#L486)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `enabled` | bool | `false` | Enabled controls whether ACLs are enabled. | 是否启用 ACL 访问控制 |
| `token_ttl` | string | `"30s"` | TokenTTL is the TTL for ACL token caching. | ACL 令牌缓存 TTL |
| `policy_ttl` | string | `"30s"` | PolicyTTL is the TTL for ACL policy caching. | ACL 策略缓存 TTL |
| `role_ttl` | string | `"30s"` | RoleTTL is the TTL for ACL role caching. | ACL 角色缓存 TTL |
| `replication_token` | string | empty | ReplicationToken is the token used for ACL replication. | ACL 复制令牌（非权威区域用于从权威区域复制 ACL） |
| `token_min_expiration_ttl` | string | `"0s"` | TokenMinExpirationTTL is the min TTL for tokens. | ACL 令牌最小过期 TTL（0 表示无限制） |
| `token_max_expiration_ttl` | string | `"0s"` | TokenMaxExpirationTTL is the max TTL for tokens. | ACL 令牌最大过期 TTL（0 表示无限制） |

---

## 8. TLS 配置（tls）

来源：[nomad/structs/config/tls.go L17-L72](file:///d:/claude/nomad/nomad/structs/config/tls.go#L17)

```hcl
tls {
  http = true
  rpc  = true

  ca_file   = "/path/to/ca.pem"
  cert_file = "/path/to/cert.pem"
  key_file  = "/path/to/key.pem"

  verify_server_hostname    = true
  verify_https_client       = true
  rpc_upgrade_mode          = true
  tls_min_version           = "tls12"
  tls_cipher_suites         = "TLS_AES_128_GCM_SHA256,..."
}
```

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `http` | bool | `false` | EnableHTTP enables TLS for HTTP API. | 是否为 HTTP API 启用 TLS |
| `rpc` | bool | `false` | EnableRPC enables TLS for RPC. | 是否为 RPC 启用 TLS |
| `verify_server_hostname` | bool | `false` | VerifyServerHostname enables hostname verification for RPC. | 是否验证 RPC 服务器主机名（需启用 `rpc`） |
| `ca_file` | string | empty | CAFile is the path to the CA certificate. | CA 证书文件路径 |
| `cert_file` | string | empty | CertFile is the path to the server certificate. | 服务器证书文件路径 |
| `key_file` | string | empty | KeyFile is the path to the private key. | 私钥文件路径 |
| `rpc_upgrade_mode` | bool | `true` | RPCUpgradeMode allows mixed TLS/plain RPC. | RPC 升级模式，允许 TLS/明文混合（升级期间使用） |
| `verify_https_client` | bool | `false` | VerifyHTTPSClient enables client certificate verification for HTTP. | 是否验证 HTTP 客户端证书 |
| `tls_cipher_suites` | string | empty | TLSCipherSuites is the comma-separated list of cipher suites. | TLS 加密套件列表（逗号分隔） |
| `tls_min_version` | string | `"tls12"` | TLSMinVersion is the minimum TLS version. | 最低 TLS 版本（tls10/tls11/tls12/tls13） |

---

## 9. Telemetry 遥测配置（telemetry）

来源：[command/agent/config.go L1341-L1470](file:///d:/claude/nomad/command/agent/config.go#L1341)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `in_memory_collection_interval` | string | `"10s"` | InMemoryCollectionInterval for in-memory metrics. | 内存 metrics 收集间隔 |
| `in_memory_retention_period` | string | `"1m"` | InMemoryRetentionPeriod for in-memory metrics. | 内存 metrics 保留时长 |
| `statsite_address` | string | empty | StatsiteAddr is the statsite address. | statsite 服务器地址 |
| `statsd_address` | string | empty | StatsdAddr is the statsd address. | statsd 服务器地址 |
| `datadog_address` | string | empty | DataDogAddr is the Datadog address. | Datadog 服务器地址 |
| `datadog_tags` | []string | empty | DataDogTags is the list of Datadog tags. | Datadog 标签列表 |
| `prometheus_metrics` | bool | `false` | PrometheusMetrics enables Prometheus exposition. | 是否启用 Prometheus metrics 端点 |
| `disable_hostname` | bool | `false` | DisableHostname disables hostname prefix. | 是否禁用 metrics 主机名前缀 |
| `use_node_name` | bool | `false` | UseNodeName uses node name instead of hostname. | 是否使用节点名替代主机名 |
| `collection_interval` | string | `"10s"` | CollectionInterval is the metrics collection interval. | metrics 收集间隔 |
| `publish_allocation_metrics` | bool | `false` | PublishAllocationMetrics publishes per-alloc metrics. | 是否发布每个分配的 metrics |
| `publish_node_metrics` | bool | `false` | PublishNodeMetrics publishes per-node metrics. | 是否发布每个节点的 metrics |
| `include_alloc_metadata_in_metrics` | bool | `false` | IncludeAllocMetadataInMetrics includes alloc metadata. | 是否在 metrics 中包含分配元数据 |
| `allowed_metadata_keys_in_metrics` | []string | empty | AllowedMetadataKeysInMetrics is the whitelist of metadata keys. | metrics 中允许的元数据键白名单 |
| `prefix_filter` | []string | empty | PrefixFilter is the list of prefix filters. | metrics 前缀过滤（如 `["+nomad.rpc", "-nomad.client"]`） |
| `filter_default` | bool | `true` | FilterDefault is the default filter behavior. | 默认过滤行为（true=默认包含） |
| `disable_dispatched_job_summary_metrics` | bool | `false` | DisableDispatchedJobSummaryMetrics disables dispatched job metrics. | 是否禁用派发作业摘要 metrics |
| `disable_quota_utilization_metrics` | bool | `false` | DisableQuotaUtilizationMetrics disables quota metrics. | 是否禁用配额使用率 metrics |
| `disable_rpc_rate_metrics_labels` | bool | `false` | DisableRPCRateMetricsLabels disables RPC rate labels. | 是否禁用 RPC 速率 metrics 标签 |
| `disable_allocation_hook_metrics` | bool | `false` | DisableAllocationHookMetrics disables alloc hook metrics. | 是否禁用分配钩子 metrics |
| `circonus_api_token` | string | empty | CirconusAPIToken is the Circonus API token. | Circonus API 令牌 |
| `circonus_api_app` | string | `"nomad"` | CirconusAPIApp is the Circonus app name. | Circonus 应用名 |
| `circonus_api_url` | string | `"https://api.circonus.com/v2"` | CirconusAPIURL is the Circonus API URL. | Circonus API URL |
| `circonus_submission_interval` | string | `"10s"` | CirconusSubmissionInterval is the submission interval. | Circonus 提交间隔 |
| `circonus_submission_url` | string | empty | CirconusCheckSubmissionURL is the check submission URL. | Circonus 检查提交 URL |
| `circonus_check_id` | string | empty | CirconusCheckID is the check ID. | Circonus 检查 ID |
| `circonus_check_force_metric_activation` | string | empty | CirconusCheckForceMetricActivation forces metric activation. | Circonus 强制启用 metric |
| `circonus_check_instance_id` | string | empty | CirconusCheckInstanceID is the check instance ID. | Circonus 检查实例 ID |
| `circonus_check_search_tag` | string | `"service:nomad"` | CirconusCheckSearchTag is the search tag. | Circonus 检查搜索标签 |
| `circonus_check_tags` | string | empty | CirconusCheckTags is the check tags. | Circonus 检查标签 |
| `circonus_check_display_name` | string | empty | CirconusCheckDisplayName is the display name. | Circonus 检查显示名 |
| `circonus_broker_id` | string | empty | CirconusBrokerID is the broker ID. | Circonus broker ID |
| `circonus_broker_select_tag` | string | empty | CirconusBrokerSelectTag is the broker select tag. | Circonus broker 选择标签 |

---

## 10. Consul 配置（consul）

来源：[nomad/structs/config/consul.go L32-L187](file:///d:/claude/nomad/nomad/structs/config/consul.go#L32)

支持多个命名块：`consul "default" { ... }`

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `name` | string | `"default"` | Name is the Consul cluster name. | Consul 集群名（多集群时区分） |
| `server_service_name` | string | `"nomad"` | ServerServiceName is the Nomad server service name. | Server 在 Consul 注册的服务名 |
| `server_http_check_name` | string | `"Nomad Server HTTP Check"` | ServerHTTPCheckName is the HTTP check name. | Server HTTP 健康检查名 |
| `server_serf_check_name` | string | `"Nomad Server Serf Check"` | ServerSerfCheckName is the Serf check name. | Server Serf 健康检查名 |
| `server_rpc_check_name` | string | `"Nomad Server RPC Check"` | ServerRPCCheckName is the RPC check name. | Server RPC 健康检查名 |
| `server_failures_before_critical` | int | `0` | ServerFailuresBeforeCritical is the failures before critical. | Server 检查失败几次后标记为 critical |
| `server_failures_before_warning` | int | `0` | ServerFailuresBeforeWarning is the failures before warning. | Server 检查失败几次后标记为 warning |
| `client_service_name` | string | `"nomad-client"` | ClientServiceName is the Nomad client service name. | Client 在 Consul 注册的服务名 |
| `client_http_check_name` | string | `"Nomad Client HTTP Check"` | ClientHTTPCheckName is the HTTP check name. | Client HTTP 健康检查名 |
| `client_failures_before_critical` | int | `0` | ClientFailuresBeforeCritical is the failures before critical. | Client 检查失败几次后标记为 critical |
| `client_failures_before_warning` | int | `0` | ClientFailuresBeforeWarning is the failures before warning. | Client 检查失败几次后标记为 warning |
| `tags` | []string | `["nomad"]` | Tags is the list of tags for Consul service. | Consul 服务标签列表 |
| `auto_advertise` | bool | `false` | AutoAdvertise enables auto-advertising to Consul. | 是否自动向 Consul 通告服务 |
| `checks_use_advertise` | bool | `false` | ChecksUseAdvertise uses advertise address for checks. | 健康检查是否使用通告地址（默认用 bind 地址） |
| `address` | string | `"127.0.0.1:8500"` | Addr is the Consul API address. | Consul API 地址 |
| `grpc_address` | string | `"127.0.0.1:8502"` | GRPCAddr is the Consul gRPC address. | Consul gRPC 地址（用于 Connect） |
| `timeout` | string | `"10s"` | Timeout is the Consul API timeout. | Consul API 超时时间 |
| `token` | string | empty | Token is the Consul ACL token. | Consul ACL 令牌 |
| `auth` | string | empty | Auth is the HTTP basic auth. | Consul HTTP 基本认证（`user:pass`） |
| `ssl` | bool | `false` | EnableSSL enables SSL for Consul API. | 是否为 Consul API 启用 SSL |
| `share_ssl` | bool | `false` | ShareSSL shares SSL config with tasks. | 是否与任务共享 SSL 配置 |
| `verify_ssl` | bool | `false` | VerifySSL enables SSL verification. | 是否验证 Consul SSL 证书 |
| `grpc_ca_file` | string | empty | GRPCCAFile is the gRPC CA file. | Consul gRPC CA 证书文件 |
| `ca_file` | string | empty | CAFile is the CA file. | Consul API CA 证书文件 |
| `cert_file` | string | empty | CertFile is the cert file. | Consul API 客户端证书文件 |
| `key_file` | string | empty | KeyFile is the key file. | Consul API 客户端私钥文件 |
| `server_auto_join` | bool | `false` | ServerAutoJoin enables auto-join for servers. | Server 是否通过 Consul 自动加入集群 |
| `client_auto_join` | bool | `false` | ClientAutoJoin enables auto-join for clients. | Client 是否通过 Consul 自动加入集群 |
| `namespace` | string | empty | Namespace is the Consul namespace (Consul Enterprise). | **企业版**：Consul 命名空间 |
| `service_identity` | block | - | ServiceIdentity is the workload identity for services. | 服务工作负载身份配置 |
| `service_auth_method` | string | empty | ServiceIdentityAuthMethod is the Consul auth method. | 服务身份的 Consul 认证方法名 |
| `task_identity` | block | - | TaskIdentity is the workload identity for tasks. | 任务工作负载身份配置 |
| `task_auth_method` | string | empty | TaskIdentityAuthMethod is the Consul auth method. | 任务身份的 Consul 认证方法名 |

---

## 11. Vault 配置（vault）

来源：[nomad/structs/config/vault.go L25-L102](file:///d:/claude/nomad/nomad/structs/config/vault.go#L25)

支持多个命名块：`vault "default" { ... }`

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `name` | string | `"default"` | Name is the Vault cluster name. | Vault 集群名（多集群时区分） |
| `enabled` | bool | `false` | Enabled controls whether Vault integration is enabled. | 是否启用 Vault 集成 |
| `create_from_role` | string | empty | Role is the Vault role to create tokens from. | 用于创建令牌的 Vault 角色 |
| `namespace` | string | empty | Namespace is the Vault namespace (Vault Enterprise). | **企业版**：Vault 命名空间 |
| `address` | string | `"https://vault.service.consul:8200"` | Addr is the Vault API address. | Vault API 地址 |
| `jwt_auth_backend_path` | string | `"jwt-nomad"` | JWTAuthBackendPath is the JWT auth backend path. | JWT 认证后端路径（工作负载身份） |
| `ca_file` | string | empty | TLSCaFile is the CA file. | Vault CA 证书文件 |
| `ca_path` | string | empty | TLSCaPath is the CA path. | Vault CA 证书目录 |
| `cert_file` | string | empty | TLSCertFile is the cert file. | Vault 客户端证书文件 |
| `key_file` | string | empty | TLSKeyFile is the key file. | Vault 客户端私钥文件 |
| `tls_skip_verify` | bool | `false` | TLSSkipVerify skips TLS verification. | 是否跳过 Vault TLS 验证 |
| `tls_server_name` | string | empty | TLSServerName is the TLS server name. | Vault TLS 服务器名（SNI） |
| `default_identity` | block | - | DefaultIdentity is the default workload identity. | 默认工作负载身份配置 |
| `token` | string | empty | Token is the Vault token for Nomad. | Nomad 使用的 Vault 令牌 |

---

## 12. UI 配置（ui）

来源：[nomad/structs/config/ui.go L17-L36](file:///d:/claude/nomad/nomad/structs/config/ui.go#L17)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `enabled` | bool | `false` | Enabled controls whether the UI is enabled. | 是否启用 Web UI |
| `content_security_policy` | block | see §12.1 | ContentSecurityPolicy is the CSP config. | 内容安全策略配置块 |
| `consul` | block | see §12.2 | Consul is the Consul UI config. | Consul UI 配置块 |
| `vault` | block | see §12.3 | Vault is the Vault UI config. | Vault UI 配置块 |
| `label` | block | see §12.4 | Label is the custom label config. | 自定义标签配置块 |
| `show_cli_hints` | bool | `true` | ShowCLIHints shows CLI hints in UI. | 是否在 UI 中显示 CLI 提示 |

### 12.1 内容安全策略（content_security_policy）

来源：[nomad/structs/config/ui.go L40-L48](file:///d:/claude/nomad/nomad/structs/config/ui.go#L40)

| HCL 键 | 类型 | 英文说明 | 中文说明 |
|--------|------|---------|---------|
| `connect_src` | []string | ConnectSrc for CSP connect-src directive. | CSP connect-src 指令 |
| `default_src` | []string | DefaultSrc for CSP default-src directive. | CSP default-src 指令 |
| `form_action` | []string | FormAction for CSP form-action directive. | CSP form-action 指令 |
| `frame_ancestors` | []string | FrameAncestors for CSP frame-ancestors directive. | CSP frame-ancestors 指令 |
| `img_src` | []string | ImgSrc for CSP img-src directive. | CSP img-src 指令 |
| `script_src` | []string | ScriptSrc for CSP script-src directive. | CSP script-src 指令 |
| `style_src` | []string | StyleSrc for CSP style-src directive. | CSP style-src 指令 |

### 12.2 Consul UI 配置（consul）

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `ui_url` | string | empty | BaseUIURL is the Consul UI URL. | Consul UI 基础 URL（用于从 Nomad UI 跳转） |

### 12.3 Vault UI 配置（vault）

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `ui_url` | string | empty | BaseUIURL is the Vault UI URL. | Vault UI 基础 URL |

### 12.4 标签配置（label）

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `text` | string | empty | Text is the label text. | 标签文本 |
| `background_color` | string | empty | BackgroundColor is the label background. | 标签背景色 |
| `text_color` | string | empty | TextColor is the label text color. | 标签文本颜色 |

---

## 13. Audit 审计配置（audit）

来源：[nomad/structs/config/audit.go L14-L77](file:///d:/claude/nomad/nomad/structs/config/audit.go#L14)

**企业版功能**

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `enabled` | bool | `false` | Enabled controls whether audit is enabled. | 是否启用审计日志 |
| `sink` | block (list) | see §13.1 | Sinks is the list of audit sinks. | 审计 sink 列表 |
| `filter` | block (list) | see §13.2 | Filters is the list of audit filters. | 审计过滤器列表 |

### 13.1 审计 Sink（sink）

来源：[nomad/structs/config/audit.go L29-L59](file:///d:/claude/nomad/nomad/structs/config/audit.go#L29)

```hcl
audit {
  sink "file" {
    delivery_guarantee = "best-effort"
    type               = "file"
    format             = "json"
    path               = "/var/log/nomad/audit/"
    rotate_duration    = "24h"
    rotate_bytes       = 104857600
    rotate_max_files   = 10
    mode               = "0600"
  }
}
```

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `<label>` | string | required | Name is the sink name (block label). | Sink 名称（block 标签） |
| `delivery_guarantee` | string | `"best-effort"` | DeliveryGuarantee is the delivery guarantee. | 投递保证（best-effort/enforced） |
| `type` | string | `"file"` | Type is the sink type. | Sink 类型（file/stdout） |
| `format` | string | `"json"` | Format is the output format. | 输出格式（json） |
| `path` | string | required | Path is the file path for file sink. | 文件路径（file 类型必填） |
| `rotate_duration` | string | `"24h"` | RotateDuration is the rotation interval. | 日志轮转间隔 |
| `rotate_bytes` | int | `0` | RotateBytes is the max bytes per file. | 单文件最大字节数 |
| `rotate_max_files` | int | `0` | RotateMaxFiles is the max file count. | 最大文件数 |
| `mode` | string | `"0600"` | Mode is the file mode. | 文件权限模式 |

### 13.2 审计过滤器（filter）

来源：[nomad/structs/config/audit.go L62-L77](file:///d:/claude/nomad/nomad/structs/config/audit.go#L62)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `<label>` | string | required | Name is the filter name (block label). | 过滤器名称（block 标签） |
| `type` | string | `"HTTPEvent"` | Type is the filter type. | 过滤器类型（HTTPEvent/AuthorizationRequest） |
| `endpoints` | []string | empty | Endpoints is the list of endpoints. | 端点列表（如 `/v1/jobs`） |
| `stages` | []string | empty | Stages is the list of stages. | 阶段列表（OperationReceived/OperationComplete） |
| `operations` | []string | empty | Operations is the list of operations. | 操作列表（GET/POST/PUT/DELETE） |

---

## 14. Limits 限制配置（limits）

来源：[nomad/structs/config/limits.go L21-L46](file:///d:/claude/nomad/nomad/structs/config/limits.go#L21)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `https_handshake_timeout` | string | `"5s"` | HTTPSHandshakeTimeout is the HTTPS handshake timeout. | HTTPS 握手超时 |
| `http_max_conns_per_client` | int | `0` (unlimited) | HTTPMaxConnsPerClient is the max HTTP conns per client. | 每客户端最大 HTTP 连接数（0=无限） |
| `rpc_handshake_timeout` | string | `"5s"` | RPCHandshakeTimeout is the RPC handshake timeout. | RPC 握手超时 |
| `rpc_max_conns_per_client` | int | `0` (unlimited) | RPCMaxConnsPerClient is the max RPC conns per client. | 每客户端最大 RPC 连接数（0=无限） |

---

## 15. Autopilot 自动驾驶配置（autopilot）

来源：[nomad/structs/config/autopilot.go L12-L50](file:///d:/claude/nomad/nomad/structs/config/autopilot.go#L12)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `cleanup_dead_servers` | bool | `true` | CleanupDeadServers removes dead servers automatically. | 是否自动清理死亡 Server |
| `server_stabilization_time` | string | `"10s"` | ServerStabilizationTime is the stabilization time. | Server 稳定时间（加入后多久可参与选举） |
| `last_contact_threshold` | string | `"200ms"` | LastContactThreshold is the Raft contact threshold. | Raft 最后联系阈值（超过则标记不健康） |
| `max_trailing_logs` | int | `250` | MaxTrailingLogs is the max trailing logs. | 最大滞后日志数（超过则标记不健康） |
| `min_quorum` | int | `0` | MinQuorum is the minimum quorum size. | 最小法定人数（低于此值阻止自动升级） |
| `enable_redundancy_zones` | bool | `false` | (Enterprise) EnableRedundancyZones enables redundancy zones. | **企业版**：启用冗余区域 |
| `disable_upgrade_migration` | bool | `false` | (Enterprise) DisableUpgradeMigration disables upgrade migration. | **企业版**：禁用升级迁移 |
| `enable_custom_upgrades` | bool | `false` | (Enterprise) EnableCustomUpgrades enables custom upgrades. | **企业版**：启用自定义升级 |

---

## 16. Plugin 插件配置（plugin）

来源：[nomad/structs/config/plugins.go L9-L15](file:///d:/claude/nomad/nomad/structs/config/plugins.go#L9)

```hcl
plugin "raw_exec" {
  config {
    enabled = true
  }
}

plugin "docker" {
  config {
    allow_privileged = false
    volumes {
      enabled = true
    }
  }
  args = ["-log-level=debug"]
}
```

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `<label>` | string | required | Name is the plugin name (block label). | 插件名（block 标签，如 docker、raw_exec） |
| `args` | []string | empty | Args is the list of plugin arguments. | 插件启动参数列表 |
| `config` | map | empty | Config is the plugin-specific config. | 插件特定配置（键值对，由插件定义） |

---

## 17. Sentinel 策略配置（sentinel）

来源：[nomad/structs/config/sentinel.go L13-L40](file:///d:/claude/nomad/nomad/structs/config/sentinel.go#L13)

**企业版功能**

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `import` | block (list) | empty | Imports is the list of Sentinel imports. | Sentinel 导入列表 |
| `additional_enabled_modules` | []string | empty | AdditionalEnabledModules is the enabled modules. | 额外启用的 Sentinel 模块 |

### Sentinel Import

| HCL 键 | 类型 | 英文说明 | 中文说明 |
|--------|------|---------|---------|
| `<label>` | string | Name is the import name (block label). | 导入名（block 标签） |
| `path` | string | Path is the import path. | 导入路径 |
| `args` | []string | Args is the import arguments. | 导入参数 |

---

## 18. Reporting 报告配置（reporting）

来源：[nomad/structs/config/reporting.go L45-L68](file:///d:/claude/nomad/nomad/structs/config/reporting.go#L45)

**企业版功能**

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `license` | block | see §18.1 | License is the license reporting config. | 许可证报告配置块 |
| `address` | string | empty | ExportAddress is the license export address. | 许可证导出地址 |
| `export_interval` | string | `"1h"` | ExportInterval is the export interval. | 导出间隔 |
| `snapshot_retention_time` | string | `"168h"` | SnapshotRetentionTime is the snapshot retention. | 快照保留时长（7 天） |
| `disable_product_usage_reporting` | bool | `false` | DisableUsageReporting disables usage reporting. | 是否禁用产品使用报告 |

### 18.1 许可证报告配置（license）

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `enabled` | bool | `false` | Enabled controls whether license reporting is enabled. | 是否启用许可证报告 |

---

## 19. Keyring 密钥环配置（keyring）

来源：[nomad/structs/keyring.go L292-L302](file:///d:/claude/nomad/nomad/structs/keyring.go#L292)

**企业版功能**

```hcl
keyring "aws_kms" {
  name   = "aws-primary"
  active = true
  config {
    region = "us-east-1"
    key_id = "alias/nomad"
  }
}
```

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `<label>` | string | required | Provider is the KEK provider name (block label). | KEK 提供者名（block 标签，如 aws_kms、transit、gcp_kms） |
| `name` | string | required | Name is the KEK instance name. | KEK 实例名 |
| `active` | bool | `false` | Active controls whether this is the active KEK. | 是否为活跃 KEK（用于加密新根密钥） |
| `config` | map | empty | Config is the provider-specific config. | 提供者特定配置（由具体 KEK 提供者定义） |

---

## 20. RPC 配置（rpc）

来源：[command/agent/config.go L850-L886](file:///d:/claude/nomad/command/agent/config.go#L850)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `accept_backlog` | int | `128` | AcceptBacklog is the backlog for accepting connections. | 连接接受队列大小 |
| `keep_alive_interval` | string | `"30s"` | KeepAliveInterval is the keep-alive interval. | TCP keep-alive 探测间隔 |
| `connection_write_timeout` | string | `"10s"` | ConnectionWriteTimeout is the write timeout. | 连接写超时 |
| `stream_open_timeout` | string | `"10s"` | StreamOpenTimeout is the stream open timeout. | 流式 RPC 打开超时 |
| `stream_close_timeout` | string | `"5s"` | StreamCloseTimeout is the stream close timeout. | 流式 RPC 关闭超时 |
| `dial_timeout` | string | `"5s"` | DialTimeout is the dial timeout. | RPC 拨号超时 |

---

## 21. Eventlog 事件日志配置（eventlog）

来源：[command/agent/config.go L1528-L1535](file:///d:/claude/nomad/command/agent/config.go#L1528)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `enabled` | bool | `false` | Enabled controls whether event logging is enabled. | 是否启用事件日志 |
| `level` | string | `"INFO"` | Level is the event log level. | 事件日志级别（INFO/DEBUG/TRACE/WARN/ERROR） |

---

## 22. Raft 日志存储配置

### 22.1 RaftLogStoreConfig（raft_logstore）

来源：[command/agent/config.go L992-L1009](file:///d:/claude/nomad/command/agent/config.go#L992)

```hcl
server {
  raft_logstore {
    backend = "boltdb"  # 或 "wal"

    boltdb {
      no_freelist_sync = false
    }

    # 或者
    wal {
      segment_size_mb = 64
    }

    disable_log_cache = false

    verification {
      enabled  = true
      interval = "5m"
    }
  }
}
```

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `backend` | string | `"boltdb"` | Backend is the log store backend. | 日志存储后端（boltdb/wal） |
| `boltdb` | block | see §22.2 | BoltDB is the BoltDB config. | BoltDB 配置块 |
| `wal` | block | see §22.3 | WAL is the WAL config. | WAL 配置块 |
| `disable_log_cache` | bool | `false` | DisableLogCache disables the log cache. | 是否禁用日志缓存 |
| `verification` | block | see §22.4 | Verification is the verification config. | 日志验证配置块 |

### 22.2 RaftBoltConfig（raft_boltdb / raft_logstore.boltdb）

来源：[command/agent/config.go L971-L978](file:///d:/claude/nomad/command/agent/config.go#L971)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `no_freelist_sync` | bool | `false` | NoFreelistSync disables freelist sync. | 是否禁用 BoltDB 空闲列表同步（提升性能，但崩溃恢复慢） |

### 22.3 WALConfig（raft_logstore.wal）

来源：[command/agent/config.go L1024-L1028](file:///d:/claude/nomad/command/agent/config.go#L1024)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `segment_size_mb` | int | `64` | SegmentSizeMB is the WAL segment size. | WAL 段大小（MB） |

### 22.4 LogStoreVerificationConfig（raft_logstore.verification）

来源：[command/agent/config.go L1042-L1051](file:///d:/claude/nomad/command/agent/config.go#L1042)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `enabled` | bool | `false` | Enabled controls whether verification is enabled. | 是否启用日志存储验证 |
| `interval` | string | `"5m"` | Interval is the verification interval. | 验证间隔 |

---

## 23. Search 搜索配置（search）

来源：[command/agent/config.go L1121-L1154](file:///d:/claude/nomad/command/agent/config.go#L1121)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `fuzzy_enabled` | bool | `true` | FuzzyEnabled enables fuzzy search. | 是否启用模糊搜索 |
| `limit_query` | int | `20` | LimitQuery is the query limit. | 搜索查询限制（每次查询返回的最大结果数） |
| `limit_results` | int | `100` | LimitResults is the results limit. | 搜索结果限制（总返回结果数） |
| `min_term_length` | int | `2` | MinTermLength is the minimum search term length. | 最小搜索词长度 |

---

## 24. ServerJoin 集群加入配置（server_join）

来源：[command/agent/config.go L1271-L1294](file:///d:/claude/nomad/command/agent/config.go#L1271)

可用于 `client.server_join` 和 `server.server_join`。

```hcl
client {
  server_join {
    retry_join = ["10.0.0.1", "10.0.0.2"]
    retry_max  = 10
    retry_interval = "30s"
  }
}
```

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `start_join` | []string | empty | StartJoin is the list of addresses to join at startup. | 启动时立即加入的地址列表（仅 Server 模式，Client 不支持） |
| `retry_join` | []string | empty | RetryJoin is the list of addresses to retry joining. | 启动时重试加入的地址列表（失败后持续重试） |
| `retry_max` | int | `0` (unlimited) | RetryMaxAttempts is the max retry attempts. | 最大重试次数（0=无限重试） |
| `retry_interval` | string | `"30s"` | RetryInterval is the interval between retries. | 重试间隔 |

> **支持前缀**：地址可使用 `exec=`（执行命令获取 IP）或 `provider=`（go-discover 云厂商自动发现）前缀，纯 IP 地址直接使用。

---

## 25. Client 子配置

### 25.1 TemplateConfig 模板配置（client.template）

来源：[client/config/config.go L423-L495](file:///d:/claude/nomad/client/config/config.go#L423)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `function_denylist` | []string | see source | FunctionDenylist is the denylist of template functions. | 模板函数黑名单（禁止使用的函数） |
| `function_blacklist` | []string | empty | (Deprecated) FunctionBlacklist is the denylist. | **已废弃**：改用 `function_denylist` |
| `disable_file_sandbox` | bool | `false` | DisableSandbox disables the file sandbox. | 是否禁用模板文件沙箱 |
| `max_stale` | string | `"87600h"` | MaxStale is the max stale for blocking queries. | 阻塞查询最大过期时间 |
| `block_query_wait` | string | `"60s"` | BlockQueryWaitTime is the block query wait time. | 阻塞查询等待时间 |
| `wait` | block | see §25.1.1 | Wait is the wait config. | 等待配置块 |
| `wait_bounds` | block | see §25.1.1 | WaitBounds is the wait bounds config. | 等待边界配置块 |
| `consul_retry` | block | see §25.1.2 | ConsulRetry is the Consul retry config. | Consul 重试配置块 |
| `vault_retry` | block | see §25.1.2 | VaultRetry is the Vault retry config. | Vault 重试配置块 |
| `nomad_retry` | block | see §25.1.2 | NomadRetry is the Nomad retry config. | Nomad 重试配置块 |
| `use_client_consul_token` | bool | `false` | UseClientConsulToken uses the client's Consul token. | 是否使用 Client 的 Consul 令牌 |

#### 25.1.1 WaitConfig（wait / wait_bounds）

来源：[client/config/config.go](file:///d:/claude/nomad/client/config/config.go)

| HCL 键 | 类型 | 英文说明 | 中文说明 |
|--------|------|---------|---------|
| `min` | string | Min is the minimum wait time. | 最小等待时间 |
| `max` | string | Max is the maximum wait time. | 最大等待时间 |

#### 25.1.2 RetryConfig（consul_retry / vault_retry / nomad_retry）

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `backoff` | string | see source | Backoff is the initial backoff. | 初始退避时间 |
| `max_backoff` | string | see source | MaxBackoff is the max backoff. | 最大退避时间 |

### 25.2 ClientHostVolumeConfig 主机卷（client.host_volume）

来源：[nomad/structs/volumes.go L30-L36](file:///d:/claude/nomad/nomad/structs/volumes.go#L30)

```hcl
client {
  host_volume "data" {
    path      = "/opt/data"
    read_only = false
  }
}
```

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `<label>` | string | required | Name is the volume name (block label). | 卷名（block 标签） |
| `path` | string | required | Path is the host path. | 主机路径 |
| `read_only` | bool | `false` | ReadOnly makes the volume read-only. | 是否只读 |

### 25.3 Resources 预留资源（client.reserved）

来源：[command/agent/config.go L1661-L1669](file:///d:/claude/nomad/command/agent/config.go#L1661)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `cpu` | int | `0` | CPU is the reserved CPU in MHz. | 预留 CPU（MHz） |
| `memory` | int | `0` | MemoryMB is the reserved memory in MB. | 预留内存（MB） |
| `disk` | int | `0` | DiskMB is the reserved disk in MB. | 预留磁盘（MB） |
| `reserved_ports` | string | empty | ReservedPorts is the reserved ports. | 预留端口（如 "22000-22020"） |
| `cores` | string | empty | Cores is the reserved cores. | 预留核心（如 "0,1" 或 "0-3"） |

### 25.4 ClientHostNetworkConfig 主机网络（client.host_network）

来源：[nomad/structs/network.go L783-L788](file:///d:/claude/nomad/nomad/structs/network.go#L783)

```hcl
client {
  host_network "internal" {
    cidr           = "10.0.0.0/24"
    interface      = "eth0"
    reserved_ports = "8080-8081"
  }
}
```

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `<label>` | string | required | Name is the network name (block label). | 网络名（block 标签） |
| `cidr` | string | empty | CIDR is the network CIDR. | 网络 CIDR（与 interface 二选一） |
| `interface` | string | empty | Interface is the network interface. | 网络接口名（与 CIDR 二选一） |
| `reserved_ports` | string | empty | ReservedPorts is the reserved ports. | 预留端口范围 |

### 25.5 ArtifactConfig 制品配置（client.artifact）

来源：[nomad/structs/config/artifact.go L19-L75](file:///d:/claude/nomad/nomad/structs/config/artifact.go#L19)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `http_read_timeout` | string | `"15m"` | HTTPReadTimeout is the HTTP read timeout. | HTTP 制品读取超时 |
| `http_max_size` | string | `"1GiB"` | HTTPMaxSize is the max HTTP artifact size. | HTTP 制品最大大小 |
| `gcs_timeout` | string | `"30m"` | GCSTimeout is the GCS timeout. | GCS 制品超时 |
| `git_timeout` | string | `"30m"` | GitTimeout is the Git timeout. | Git 制品超时 |
| `hg_timeout` | string | `"30m"` | HgTimeout is the Hg timeout. | Mercurial 制品超时 |
| `s3_timeout` | string | `"30m"` | S3Timeout is the S3 timeout. | S3 制品超时 |
| `decompression_file_count_limit` | int | `1000000` | DecompressionFileCountLimit limits file count. | 解压文件数限制 |
| `decompression_size_limit` | string | `"1GiB"` | DecompressionSizeLimit limits size. | 解压大小限制 |
| `disable_artifact_inspection` | bool | `false` | DisableArtifactInspection disables inspection. | 是否禁用制品检查 |
| `disable_filesystem_isolation` | bool | `false` | DisableFilesystemIsolation disables isolation. | 是否禁用文件系统隔离 |
| `filesystem_isolation_extra_paths` | []string | empty | FilesystemIsolationExtraPaths is the extra paths. | 额外隔离路径 |
| `set_environment_variables` | string | empty | SetEnvironmentVariables sets env vars. | 设置的环境变量 |

### 25.6 DrainConfig 关闭排空配置（client.drain_on_shutdown）

来源：[nomad/structs/config/drain.go L9-L21](file:///d:/claude/nomad/nomad/structs/config/drain.go#L9)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `deadline` | string | empty | Deadline is the drain deadline. | 排空截止时间（超时后强制停止） |
| `ignore_system_jobs` | bool | `false` | IgnoreSystemJobs ignores system jobs during drain. | 排空时是否忽略系统作业 |
| `force` | bool | `false` | Force forces the drain. | 是否强制排空（立即停止所有任务） |

### 25.7 UsersConfig 用户配置（client.users）

来源：[nomad/structs/config/users.go L13-L19](file:///d:/claude/nomad/nomad/structs/config/users.go#L13)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `dynamic_user_min` | int | `99` | MinDynamicUser is the min UID for dynamic users. | 动态用户最小 UID |
| `dynamic_user_max` | int | `99` | MaxDynamicUser is the max UID for dynamic users. | 动态用户最大 UID |

### 25.8 Fingerprint 指纹器配置（client.fingerprint）

来源：[client/config/fingerprint.go L25-L48](file:///d:/claude/nomad/client/config/fingerprint.go#L25)

```hcl
client {
  fingerprint "cpu" {
    retry_interval  = "5s"
    retry_attempts  = 3
    exit_on_failure = true
  }
}
```

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `<label>` | string | required | Name is the fingerprint name (block label). | 指纹器名（block 标签，如 cpu、memory） |
| `retry_interval` | string | `"5s"` | RetryInterval is the retry interval. | 重试间隔 |
| `retry_attempts` | int | `3` | RetryAttempts is the retry attempts. | 重试次数 |
| `exit_on_failure` | bool | `false` | ExitOnFailure exits on fingerprint failure. | 失败时是否退出 Client |

---

## 26. Server 子配置

### 26.1 SchedulerConfiguration 默认调度器配置（server.default_scheduler_config）

来源：[nomad/structs/scheduler.go](file:///d:/claude/nomad/nomad/structs/scheduler.go)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `scheduler_algorithm` | string | `"binpack"` | SchedulerAlgorithm is the scheduling algorithm. | 调度算法（binpack/spread） |
| `preemption_config` | block | - | PreemptionConfig is the preemption config. | 抢占配置块 |

#### PreemptionConfig

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `system_scheduler_enabled` | bool | `false` | SystemSchedulerEnabled enables system preemption. | 系统调度器是否启用抢占 |
| `sysbatch_scheduler_enabled` | bool | `false` | SysbatchSchedulerEnabled enables sysbatch preemption. | 系统批处理调度器是否启用抢占 |
| `batch_scheduler_enabled` | bool | `false` | BatchSchedulerEnabled enables batch preemption. | 批处理调度器是否启用抢占 |
| `service_scheduler_enabled` | bool | `false` | ServiceSchedulerEnabled enables service preemption. | 服务调度器是否启用抢占 |

### 26.2 ClientIntroduction 客户端引入配置（server.client_introduction）

来源：[command/agent/config.go L1168-L1190](file:///d:/claude/nomad/command/agent/config.go#L1168)

**企业版功能**

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `enforcement` | string | `"enforced"` | Enforcement is the enforcement mode. | 强制模式（enforced/soft） |
| `default_identity_ttl` | string | `"43200s"` | DefaultIdentityTTL is the default identity TTL. | 默认身份 TTL（12 小时） |
| `max_identity_ttl` | string | `"43200s"` | MaxIdentityTTL is the max identity TTL. | 最大身份 TTL |

### 26.3 PlanRejectionTracker 计划拒绝跟踪器（server.plan_rejection_tracker）

来源：[command/agent/config.go L1064-L1079](file:///d:/claude/nomad/command/agent/config.go#L1064)

| HCL 键 | 类型 | 默认值 | 英文说明 | 中文说明 |
|--------|------|--------|---------|---------|
| `enabled` | bool | `true` | Enabled controls whether the tracker is enabled. | 是否启用计划拒绝跟踪器 |
| `node_threshold` | int | `10` | NodeThreshold is the rejection threshold per node. | 每节点拒绝阈值 |
| `node_window` | string | `"1m"` | NodeWindow is the rejection window. | 拒绝窗口时长 |

---

## 附录 A：配置来源文件索引

| 配置块 | 源文件 | 行号 |
|--------|--------|------|
| Config（顶层） | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L48-L209 |
| ClientConfig | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L230-L458 |
| ServerConfig | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L542-L814 |
| ACLConfig | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L486-L529 |
| RPCConfig | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L850-L886 |
| Telemetry | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L1341-L1470 |
| Ports / Addresses / AdvertiseAddrs | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L1583-L1649 |
| Resources | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L1661-L1669 |
| ServerJoin | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L1271-L1294 |
| Search | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L1121-L1154 |
| Eventlog | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L1528-L1535 |
| RaftLogStoreConfig / RaftBoltConfig / WALConfig | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L971-L1051 |
| PlanRejectionTracker | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L1064-L1079 |
| ClientIntroduction | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L1168-L1190 |
| TLSConfig | [nomad/structs/config/tls.go](file:///d:/claude/nomad/nomad/structs/config/tls.go) | L17-L72 |
| ConsulConfig | [nomad/structs/config/consul.go](file:///d:/claude/nomad/nomad/structs/config/consul.go) | L32-L187 |
| VaultConfig | [nomad/structs/config/vault.go](file:///d:/claude/nomad/nomad/structs/config/vault.go) | L25-L102 |
| UIConfig | [nomad/structs/config/ui.go](file:///d:/claude/nomad/nomad/structs/config/ui.go) | L17-L139 |
| AuditConfig / AuditSink / AuditFilter | [nomad/structs/config/audit.go](file:///d:/claude/nomad/nomad/structs/config/audit.go) | L14-L77 |
| Limits | [nomad/structs/config/limits.go](file:///d:/claude/nomad/nomad/structs/config/limits.go) | L21-L46 |
| AutopilotConfig | [nomad/structs/config/autopilot.go](file:///d:/claude/nomad/nomad/structs/config/autopilot.go) | L12-L50 |
| PluginConfig | [nomad/structs/config/plugins.go](file:///d:/claude/nomad/nomad/structs/config/plugins.go) | L9-L15 |
| SentinelConfig | [nomad/structs/config/sentinel.go](file:///d:/claude/nomad/nomad/structs/config/sentinel.go) | L13-L40 |
| ReportingConfig | [nomad/structs/config/reporting.go](file:///d:/claude/nomad/nomad/structs/config/reporting.go) | L45-L68 |
| ArtifactConfig | [nomad/structs/config/artifact.go](file:///d:/claude/nomad/nomad/structs/config/artifact.go) | L19-L75 |
| DrainConfig | [nomad/structs/config/drain.go](file:///d:/claude/nomad/nomad/structs/config/drain.go) | L9-L21 |
| UsersConfig | [nomad/structs/config/users.go](file:///d:/claude/nomad/nomad/structs/config/users.go) | L13-L19 |
| ClientHostNetworkConfig | [nomad/structs/network.go](file:///d:/claude/nomad/nomad/structs/network.go) | L783-L788 |
| ClientHostVolumeConfig | [nomad/structs/volumes.go](file:///d:/claude/nomad/nomad/structs/volumes.go) | L30-L36 |
| KEKProviderConfig | [nomad/structs/keyring.go](file:///d:/claude/nomad/nomad/structs/keyring.go) | L292-L302 |
| ClientTemplateConfig | [client/config/config.go](file:///d:/claude/nomad/client/config/config.go) | L423-L495 |
| Fingerprint | [client/config/fingerprint.go](file:///d:/claude/nomad/client/config/fingerprint.go) | L25-L48 |

---

## 附录 B：配置设计模式说明

### B.1 时长字段双字段模式

所有 `time.Duration` 类型的配置项都拆成两个字段：

```go
// 实际存储字段（无 hcl tag，JSON 标记为 "-"）
GCInterval time.Duration

// HCL 解析字段（带 hcl tag，JSON 标记为 "-"）
GCIntervalHCL string `hcl:"gc_interval" json:"-"`
```

- HCL 文件中填写字符串（如 `"1m"`、`"24h"`）
- [config_parse.go](file:///d:/claude/nomad/command/agent/config_parse.go) 的 `convertDurations` 函数将字符串解析为 `time.Duration`

### B.2 HCL tag 特殊标记

| 标记 | 含义 | 示例 |
|------|------|------|
| `,key` | block 标签（不作为属性） | `Name string \`hcl:",key"\`` |
| `,unusedKeys` | 捕获未识别的键 | `ExtraKeysHCL []string \`hcl:",unusedKeys"\`` |
| `,block` | 显式声明为 block | `Reporting \`hcl:"reporting,block"\`` |
| `,optional` | 标记为可选 | `KeepAliveIntervalHCL string \`hcl:"keep_alive_interval,optional"\`` |
| `,expand` | 展开同名 block | `Imports []*SentinelImport \`hcl:"import,expand"\`` |
| `-` | 不暴露到 HCL | `Consuls []*config.ConsulConfig \`hcl:"-"\`` |

### B.3 多块配置（mapstructure tag）

`consul` 和 `vault` 支持多个命名块：

```hcl
consul "default" {
  address = "127.0.0.1:8500"
}

consul "secondary" {
  address = "10.0.0.2:8500"
}
```

这些配置使用 `mapstructure` tag 而非 `hcl` tag，通过 mapstructure 解码。

### B.4 企业版配置

标记为 **企业版** 的配置项在社区版（CE）中会被忽略或报错。企业版配置包括：
- `audit` 审计日志
- `sentinel` 策略引擎
- `reporting` 产品使用报告
- `keyring` KEK 提供者
- `server.non_voting_server` 非投票 Server
- `server.redundancy_zone` 冗余区域
- `server.upgrade_version` 升级版本
- `autopilot.enable_redundancy_zones` 冗余区域
- `autopilot.disable_upgrade_migration` 升级迁移
- `autopilot.enable_custom_upgrades` 自定义升级
- `server.client_introduction` 客户端引入
- `consul.namespace` Consul 命名空间
- `vault.namespace` Vault 命名空间
