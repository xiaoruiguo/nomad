# Nomad 端口分析

> 本文档梳理 Nomad 在运行过程中使用的所有网络端口：核心 Agent 三端口、Client 插件端口、动态分配端口、外部依赖默认端口、CSI/插件 Socket，以及 Advertise/Bind 地址解析逻辑。每项均给出代码文件位置和用途说明。

---

## 1. 核心端口概览

| 端口 | 协议 | 默认值 | 方向 | 用途 |
|------|------|--------|------|------|
| HTTP | TCP | `4646` | Client → Server / 浏览器 → Server | HTTP/HTTPS REST API、Web UI、WebSocket（日志/exec） |
| RPC  | TCP | `4647` | Client ↔ Server、Server ↔ Server | msgpack-rpc（含 Raft、Yamux 多路复用、Streaming RPC） |
| Serf | UDP/TCP | `4648` | Server ↔ Server | Serf LAN gossip（成员发现、故障检测），跨 Region 复用 WAN gossip |

### 默认值定义位置

[command/agent/config.go:1821-1825](file:///d:/claude/nomad/command/agent/config.go#L1821-L1825) — `DefaultConfig()`：

```go
BindAddr: "0.0.0.0",
Ports: &Ports{
    HTTP: 4646,
    RPC:  4647,
    Serf: 4648,
},
```

[nomad/config.go:31-37](file:///d:/claude/nomad/nomad/config.go#L31-L37) — Server 端常量：

```go
DefaultSerfPort = 4648

func DefaultRPCAddr() *net.TCPAddr {
    return &net.TCPAddr{IP: net.ParseIP("127.0.0.1"), Port: 4647}
}
```

### `Ports` 结构定义

[command/agent/config.go:1583-1601](file:///d:/claude/nomad/command/agent/config.go#L1583-L1601)：

```go
type Ports struct {
    HTTP int `hcl:"http"`
    RPC  int `hcl:"rpc"`
    Serf int `hcl:"serf"`
}
```

对应 HCL 配置块：

```hcl
ports {
  http = 4646
  rpc  = 4647
  serf = 4648
}
```

---

## 2. HTTP 端口（4646）

### 用途
- **REST API**：所有 `/v1/*` 端点（jobs、allocs、nodes、deployments、ACL、search、operator 等）
- **Web UI**：当 `ui{} ` 块启用且构建带 `ui` tag 时，内嵌静态资源
- **WebSocket 长连接**：`/v1/client/fs/logs`、`/v1/client/fs/stream`、`/v1/agent/monitor`、`/v1/event/stream` 等
- **健康检查端点**：`/v1/agent/health?type=server|client`，供 Consul / 负载均衡器探测

### 关键代码

**监听器创建** — [command/agent/http.go:155-204](file:///d:/claude/nomad/command/agent/http.go#L155-L204)：

```go
for _, addr := range config.normalizedAddrs.HTTP {
    lnAddr, err := net.ResolveTCPAddr("tcp", addr)
    // ...
    ln, err := config.Listener("tcp", lnAddr.IP.String(), lnAddr.Port)
    // TLS 包装（可选）
    if config.TLSConfig.EnableHTTP {
        tlsConfig, _ := tlsConf.IncomingTLSConfig()
        ln = tls.NewListener(tcpKeepAliveListener{ln.(*net.TCPListener)}, tlsConfig)
    }
    srv := &HTTPServer{ ... }
    srv.registerHandlers(config.EnableDebug)
    httpServer := http.Server{
        Addr:      srv.Addr,
        Handler:   handlers.CompressHandler(srv.mux),
        ConnState: makeConnState(...),  // HTTPSHandshakeTimeout + HTTPMaxConnsPerClient
    }
    go func() { httpServer.Serve(ln) }()
}
```

**API 客户端默认地址** — [api/api.go:336-338](file:///d:/claude/nomad/api/api.go#L336-L338)：

```go
func DefaultConfig() *Config {
    config := &Config{
        Address:   "http://127.0.0.1:4646",
        ...
    }
    if addr := os.Getenv("NOMAD_ADDR"); addr != "" {
        config.Address = addr
    }
```

**归一化为 `host:port`** — [command/agent/config.go:2382-2389](file:///d:/claude/nomad/command/agent/config.go#L2382-L2389)：

```go
c.normalizedAddrs.HTTP = make([]string, len(httpAddrs))
for i, addr := range httpAddrs {
    c.normalizedAddrs.HTTP[i] = normalizeAddrWithPort(addr, c.Ports.HTTP)
}
addr, err = normalizeAdvertise(c.AdvertiseAddrs.HTTP, httpAddrs[0], c.Ports.HTTP, c.DevMode)
```

**HTTP 服务支持多绑定地址**（空格分隔），RPC/Serf 仅单一地址，详见 [command/agent/config.go:2360-2364](file:///d:/claude/nomad/command/agent/config.go#L2360-L2364)。

### TLS 配置
通过 `tls{ http = true }` 开启 HTTPS，由 [command/agent/http.go:171-176](file:///d:/claude/nomad/command/agent/http.go#L171-L176) 包装 listener。`VerifyHTTPSClient` 开启双向 TLS。

### 连接限制
[nomad/structs/config/limits.go](file:///d:/claude/nomad/nomad/structs/config/limits.go) + [command/agent/http.go:127-141](file:///d:/claude/nomad/command/agent/http.go#L127-L141)：
- `https_handshake_timeout`（默认 `5s`）：TLS 握手超时
- `http_max_conns_per_client`（默认 `0` = 无限）：按对端 IP 限制并发连接，防止单 Client 耗尽 Server 连接

---

## 3. RPC 端口（4647）

### 用途
单个 TCP 端口承载 6 种 RPC 类型（首字节 magic 区分），详见 [helper/pool/conn.go](file:///d:/claude/nomad/helper/pool/conn.go) 与 [nomad/rpc.go](file:///d:/claude/nomad/nomad/rpc.go)：

| Magic Byte | RPCType | 用途 |
|-----------|---------|------|
| `0x01` | `RpcNomad` | 标准 msgpack-rpc（Node.Register、Alloc.GetAllocs 等） |
| `0x02` | `RpcRaft` | Raft 传输层（Leader 复制日志、投票、快照） |
| `0x03` | `RpcMultiplex` | Yamux V1 多路复用（旧版） |
| `0x04` | `RpcTLS` | TLS 升级握手 |
| `0x05` | `RpcStreaming` | 流式 RPC（Exec、Log Stream、Snapshot） |
| `0x06` | `RpcMultiplexV2` | Yamux V2 多路复用（当前默认） |

### 关键代码

**Server 监听器** — [nomad/server.go:596-605](file:///d:/claude/nomad/nomad/server.go#L596-L605)：

```go
func (s *Server) createRPCListener() (*net.TCPListener, error) {
    s.listenerCh = make(chan struct{})
    listener, err := net.ListenTCP("tcp", s.config.RPCAddr)
    if err != nil {
        s.logger.Error("failed to initialize TLS listener", "error", err)
        return listener, err
    }
    s.rpcListener = listener
    return listener, nil
}
```

**首字节分发** — [nomad/rpc.go:316-345](file:///d:/claude/nomad/nomad/rpc.go#L316-L345)：

```go
func (r *rpcHandler) handleConn(ctx context.Context, conn net.Conn, rpcCtx *RPCContext) {
    buf := make([]byte, 1)
    if _, err := conn.Read(buf); err != nil { ... }
    switch pool.RPCType(buf[0]) {
    case pool.RpcNomad:
        server := rpc.NewServer()
        r.srv.setupRpcServer(server, rpcCtx)
        r.handleNomadConn(ctx, conn, server)
    case pool.RpcRaft:
        r.validateRaftTLS(rpcCtx)
        r.srv.raftLayer.Handoff(ctx, conn)  // 交给 Raft 流层
    case pool.RpcMultiplex, pool.RpcMultiplexV2:
        r.handleMultiplex(...)  // 建立 Yamux session
    case pool.RpcStreaming:
        r.handleStreamingConn(conn)
    case pool.RpcTLS:
        // TLS 升级后再次循环
    }
}
```

**Advertise 地址（Server 双重广告）** — [nomad/server.go:1216-1260](file:///d:/claude/nomad/nomad/server.go#L1216-L1260)：
- `ClientRPCAdvertise`：广告给 Client，默认 = `rpcListener.Addr()`
- `ServerRPCAdvertise`：广告给其他 Server，默认 = Serf Advertise IP + RPC Port（让 Server 间通过 Serf 拓扑寻址）

```go
if s.config.ClientRPCAdvertise != nil {
    s.clientRpcAdvertise = s.config.ClientRPCAdvertise
} else {
    s.clientRpcAdvertise = s.rpcListener.Addr()
}
// ...
serfIP := s.config.SerfConfig.MemberlistConfig.AdvertiseAddr
addr := net.JoinHostPort(serfIP, fmt.Sprintf("%d", clientAddr.Port))
resolved, _ := net.ResolveTCPAddr("tcp", addr)
s.serverRpcAdvertise = resolved
```

### Raft 传输层
[nomad/raft_rpc.go:46-67](file:///d:/claude/nomad/nomad/raft_rpc.go#L46-L67) — `RaftLayer` 实现 `raft.StreamLayer`，复用同一 4647 端口：

```go
func (l *RaftLayer) Handoff(ctx context.Context, c net.Conn) error {
    select {
    case l.connCh <- c:   // 转交到 Accept()
    case <-l.closeCh:
        return fmt.Errorf("Raft RPC layer closed")
    }
}

func (l *RaftLayer) Accept() (net.Conn, error) {
    select {
    case conn := <-l.connCh:
        return conn, nil
    // ...
    }
}
```

### TLS 配置
- `tls{ rpc = true }`：开启 RPC TLS
- `tls{ verify_server_hostname = true }`：校验对端证书 SAN 必须为 `client.<region>.nomad` 或 `server.<region>.nomad`，见 [nomad/server.go:645-672](file:///d:/claude/nomad/nomad/server.go#L645-L672) 的 `rpcNameAndRegionValidator`

### RPC 超时（`rpc_config` 块）
[command/agent/config.go:850-881](file:///d:/claude/nomad/command/agent/config.go#L850-L881)：

| 字段 | 默认值 | 用途 |
|------|--------|------|
| `accept_backlog` | 256 | TCP accept 队列 |
| `keep_alive_interval` | 30s | TCP keepalive |
| `connection_write_timeout` | 10s | 写超时保险阀 |
| `stream_open_timeout` | 75s | Yamux stream 等待 ack 超时 |
| `stream_close_timeout` | 5m | stream 半关闭超时 |
| `dial_timeout` | 10s | 出站连接建立超时 |

---

## 4. Serf 端口（4648）

### 用途
- **LAN gossip**：单 Region 内 Server 成员发现、故障检测、元数据传播（如 `HasStatus` 节点状态变更广播）
- **WAN gossip**：跨 Region Server 联邦（用于跨 Region 转发请求时定位目标 Region 的 Server）
- **AutoJoin**：通过 Consul / 云厂商标签自动加入集群

### 关键代码

**默认端口** — [nomad/config.go:32](file:///d:/claude/nomad/nomad/config.go#L32)：

```go
DefaultSerfPort = 4648
```

**Memberlist 配置** — [nomad/config.go:736-740](file:///d:/claude/nomad/nomad/config.go#L736-L740)：

```go
c.SerfConfig.MemberlistConfig = memberlist.DefaultWANConfig()  // 用 WAN 时序（容忍更高延迟）
c.SerfConfig.MemberlistConfig.BindPort = DefaultSerfPort
```

**Agent 设置 Bind/Advertise** — [command/agent/agent.go:406-428](file:///d:/claude/nomad/command/agent/agent.go#L406-L428)：

```go
serfAddr, err := net.ResolveTCPAddr("tcp", agentConfig.normalizedAddrs.Serf)
// ...
conf.SerfConfig.MemberlistConfig.BindPort = serfAddr.Port
conf.SerfConfig.MemberlistConfig.BindAddr = serfAddr.IP.String()
// ...
conf.SerfConfig.MemberlistConfig.AdvertiseAddr = serfAddr.IP.String()
conf.SerfConfig.MemberlistConfig.AdvertisePort = serfAddr.Port
```

**Serf 实例创建** — [nomad/server.go:493](file:///d:/claude/nomad/nomad/server.go#L493) 与 [nomad/server.go:1738-1770](file:///d:/claude/nomad/nomad/server.go#L1738-L1770)：

```go
s.serf, err = s.setupSerf(config.SerfConfig, s.eventCh, serfSnapshot)
```

### 协议特性
- **UDP + TCP 双协议**：memberlist 同时使用 UDP（gossip、探测）和 TCP（成员同步、状态推送）
- **WAN 时序**：跨 Region 通信使用更长的心跳间隔，避免跨地域误判

### Advertise 要求
Serf Advertise 地址**必须可被其他 Server 解析**，不能用 `0.0.0.0`，否则 [nomad/server.go:1242-1252](file:///d:/claude/nomad/nomad/server.go#L1242-L1252) 会拒绝启动：

```go
serverAddr, ok := s.serverRpcAdvertise.(*net.TCPAddr)
if serverAddr.IP.IsUnspecified() {
    listener.Close()
    return fmt.Errorf("Server RPC advertise address is not advertisable: %v", serverAddr)
}
```

---

## 5. Client 插件端口范围（14000–14512）

### 默认值
[command/agent/config.go:1849-1850](file:///d:/claude/nomad/command/agent/config.go#L1849-L1850)：

```go
ClientMinPort: 14000,
ClientMaxPort: 14512,
```

[drivers/shared/executor/utils.go:22-28](file:///d:/claude/nomad/drivers/shared/executor/utils.go#L22-L28) 也定义了同样的默认值：

```go
ExecutorDefaultMaxPort = 14512
ExecutorDefaultMinPort = 14000
```

### 用途
**Client 与其内置 / 外部插件之间通过 loopback gRPC 通信**，端口由 `hashicorp/go-plugin` 库在此范围内随机分配：

| 插件类型 | 实现文件 | 说明 |
|---------|---------|------|
| Executor | [drivers/shared/executor/utils.go:54-72](file:///d:/claude/nomad/drivers/shared/executor/utils.go#L54-L72) | raw_exec / exec / qemu 任务的执行器 |
| Logmon | [client/logmon/plugin.go:32-40](file:///d:/claude/nomad/client/logmon/plugin.go#L32-L40) | 任务日志监控 |
| Docker Logger | [drivers/docker/docklog/plugin.go:28-56](file:///d:/claude/nomad/drivers/docker/docklog/plugin.go#L28-L56) | Docker 容器日志采集 |
| Task Driver Plugin | [helper/pluginutils/loader/loader.go:229-241](file:///d:/claude/nomad/helper/pluginutils/loader/loader.go#L229-L241) | 外部任务驱动（go-plugin 加载） |
| Device Plugin | [plugins/shared/cmd/launcher/command/device.go:138](file:///d:/claude/nomad/plugins/shared/cmd/launcher/command/device.go#L138) | GPU / FPGA 等设备插件 |

### 关键代码

**Executor 启动** — [drivers/shared/executor/utils.go:54-72](file:///d:/claude/nomad/drivers/shared/executor/utils.go#L54-L72)：

```go
config := &plugin.ClientConfig{
    HandshakeConfig:  base.Handshake,
    Plugins:          map[string]plugin.Plugin{"executor": p},
    Cmd:              exec.Command(bin, "executor", string(c)),
    AllowedProtocols: []plugin.Protocol{plugin.ProtocolGRPC},
    Logger:           logger.Named("executor"),
}
if driverConfig != nil {
    config.MaxPort = driverConfig.ClientMaxPort
    config.MinPort = driverConfig.ClientMinPort
} else {
    config.MaxPort = ExecutorDefaultMaxPort
    config.MinPort = ExecutorDefaultMinPort
}
```

**传递给驱动** — [plugins/base/base.go:90-96](file:///d:/claude/nomad/plugins/base/base.go#L90-L96)：

```go
NomadDriverConfig{
    ClientMaxPort: uint32(ac.Driver.ClientMaxPort),
    ClientMinPort: uint32(ac.Driver.ClientMinPort),
    // ...
}
```

### 防止与分配端口冲突
[command/agent/agent.go:1478-1489](file:///d:/claude/nomad/command/agent/agent.go#L1478-L1489) — Client 启动时把该范围加入 `ReservedHostPorts`，避免分配给任务：

```go
func (a *Agent) reservePortsForClient(conf *clientconfig.Config) error {
    res := conf.Node.ReservedResources.Networks.ReservedHostPorts
    if res == "" {
        res = fmt.Sprintf("%d-%d", conf.ClientMinPort, conf.ClientMaxPort)
    } else {
        res += fmt.Sprintf(",%d-%d", conf.ClientMinPort, conf.ClientMaxPort)
    }
    conf.Node.ReservedResources.Networks.ReservedHostPorts = res
    return nil
}
```

### HCL 配置
[command/agent/config.go:323-329](file:///d:/claude/nomad/command/agent/config.go#L323-L329)：

```hcl
client {
  client_min_port = 14000
  client_max_port = 14512
}
```

---

## 6. 动态分配端口范围（20000–32000）

### 默认值
[nomad/structs/network.go:17-22](file:///d:/claude/nomad/nomad/structs/network.go#L17-L22)：

```go
DefaultMinDynamicPort = 20000
DefaultMaxDynamicPort = 32000
```

[command/agent/config.go:1851-1852](file:///d:/claude/nomad/command/agent/config.go#L1851-L1852)：

```go
MinDynamicPort: 20000,
MaxDynamicPort: 32000,
```

### 用途
**任务（Allocation）在 host 网络上动态分配的端口范围**。当 jobspec 中 `network { port "http" {} }` 不指定 `static` 时，Scheduler 在此范围内随机选一个端口写入 `AllocatedResources`，由 Client 在 fingerprint 时把范围暴露给调度器。

### 关键代码
[client/config/config.go:174-178](file:///d:/claude/nomad/client/config/config.go#L174-L178)：

```go
// MaxDynamicPort is the largest dynamic port generated
MaxDynamicPort int
// MinDynamicPort is the smallest dynamic port generated
MinDynamicPort int
```

[client/client.go:778-779](file:///d:/claude/nomad/client/client.go#L778-L779) — 写入节点 `NodeResources`：

```go
node.NodeResources.MinDynamicPort = conf.MinDynamicPort
node.NodeResources.MaxDynamicPort = conf.MaxDynamicPort
```

[command/agent/agent.go:993-994](file:///d:/claude/nomad/command/agent/agent.go#L993-L994) — 从 agent 配置传入：

```go
conf.MaxDynamicPort = agentConfig.Client.MaxDynamicPort
conf.MinDynamicPort = agentConfig.Client.MinDynamicPort
```

### HCL 配置
```hcl
client {
  min_dynamic_port = 20000
  max_dynamic_port = 32000
}
```

### 与任务端口的关系
- **静态端口**（`static = 8080`）：直接占用 host:8080，需用户自行保证不冲突
- **动态端口**：Scheduler 从此范围分配，写入 `ReservedPorts`/`DynamicPorts`，由 Client 在分配时绑定到任务网络命名空间

---

## 7. CSI 插件 Socket

### 协议：Unix Domain Socket（非 TCP 端口）

[nomad/structs/csi.go:18-23](file:///d:/claude/nomad/nomad/structs/csi.go#L18-L23)：

```go
const CSISocketName = "csi.sock"
const CSIIntermediaryDirname = "volumes"
```

### 用途
CSI Plugin 任务在容器/命名空间内启动后，在 `PluginMountDir` 下创建名为 `csi.sock` 的 unix socket，Client 通过它与插件通信（Identity/Controller/Node RPC）。

### 关键代码
[plugins/csi/client.go:159-180](file:///d:/claude/nomad/plugins/csi/client.go#L159-L180)：

```go
func newGrpcConn(addr string, logger hclog.Logger) (*grpc.ClientConn, error) {
    conn, err := grpc.DialContext(
        connectCtx, addr,
        grpc.WithBlock(),
        grpc.WithInsecure(),
        grpc.WithDialer(func(target string, timeout time.Duration) (net.Conn, error) {
            return net.DialTimeout("unix", target, timeout)  // unix socket
        }),
    )
    return conn, nil
}
```

[plugins/csi/client.go:130-150](file:///d:/claude/nomad/plugins/csi/client.go#L130-L150) — 等待 socket 文件出现：

```go
for {
    select {
    case <-ctx.Done():
        return fmt.Errorf("timeout while connecting to gRPC socket: %v", err)
    case <-t.C:
        _, err = os.Stat(c.addr)   // 等 CSI 插件创建 socket
        if err != nil { ... }
        conn, err = newGrpcConn(c.addr, c.logger)
        c.conn = conn
        c.identityClient = csipbv1.NewIdentityClient(conn)
        c.controllerClient = csipbv1.NewControllerClient(conn)
        c.nodeClient = csipbv1.NewNodeClient(conn)
    }
}
```

### 配置
在 jobspec 的 `csi_plugin { }` 块中指定 `mount_dir`（插件写入 socket 的目录），由 Nomad 挂载到插件任务。`stage_publish_base_dir` 不能是 `mount_dir` 的子目录（[nomad/structs/structs.go:8389](file:///d:/claude/nomad/nomad/structs/structs.go#L8389) 校验）。

---

## 8. 外部依赖默认端口

### Vault
[nomad/structs/config/vault.go:106-115](file:///d:/claude/nomad/nomad/structs/config/vault.go#L106-L115)：

```go
func DefaultVaultConfig() *VaultConfig {
    return &VaultConfig{
        Enabled:             pointer.Of(false),
        Addr:                "https://vault.service.consul:8200",  // 默认通过 Consul 服务发现
        ConnectionRetryIntv: DefaultVaultConnectRetryIntv,
    }
}
```

Dev 模式覆盖为 `http://localhost:8200` — [command/agent/config.go:1808-1810](file:///d:/claude/nomad/command/agent/config.go#L1808-L1810)：

```go
conf.Vaults[0].Addr = "http://localhost:8200"
```

### Consul
[nomad/structs/config/consul.go:191-218](file:///d:/claude/nomad/nomad/structs/config/consul.go#L191-L218) — 默认从 Consul API 的 `DefaultConfig()` 读取（即 `127.0.0.1:8500`，可被 `CONSUL_HTTP_ADDR` 覆盖）：

```go
def := consul.DefaultConfig()
return &ConsulConfig{
    Addr:      def.Address,
    EnableSSL: pointer.Of(def.Scheme == "https"),
    ...
}
```

Consul Agent 自身端口（仅作为参考，非 Nomad 控制）：
- `8500` — Consul HTTP API
- `8300` — Consul Server RPC
- `8301` — Consul LAN Serf
- `8302` — Consul WAN Serf
- `8600` — Consul DNS

### Nomad 在 Consul 中注册的服务
[command/agent/agent.go:1215-1273](file:///d:/claude/nomad/command/agent/agent.go#L1215-L1273) — 当 `consul { auto_advertise = true }` 时，Server 注册 3 个服务：

| Tag | Port | Check |
|-----|------|-------|
| `http` | AdvertiseAddrs.HTTP | HTTP `/v1/agent/health?type=server` |
| `rpc`  | AdvertiseAddrs.RPC  | TCP 探测 RPC 端口 |
| `serf` | AdvertiseAddrs.Serf | TCP 探测 Serf 端口 |

Client 仅注册 `http` 服务（[command/agent/agent.go:1408-1418](file:///d:/claude/nomad/command/agent/agent.go#L1408-L1418)）。

---

## 9. Advertise / Bind 地址体系

### 三组地址

[command/agent/config.go:1603-1657](file:///d:/claude/nomad/command/agent/config.go#L1603-L1657)：

| 配置块 | 结构 | 用途 |
|-------|------|------|
| `addresses {}` | `Addresses{HTTP, RPC, Serf}` | 实际**绑定**地址（Bind），默认 `bind_addr` |
| `advertise {}` | `AdvertiseAddrs{HTTP, RPC, Serf}` | **广告**给其他节点的地址，必须可被外部解析 |
| 内部归一化 | `NormalizedAddrs{HTTP[], RPC, Serf}` | 解析后的 `host:port`，HTTP 支持多绑定 |

### 默认 Bind 地址
[command/agent/config.go:1821](file:///d:/claude/nomad/command/agent/config.go#L1821)：

```go
BindAddr: "0.0.0.0",  // 默认监听所有接口
```

Dev 模式 — [command/agent/config.go:1727-1753](file:///d:/claude/nomad/command/agent/config.go#L1727-L1753)：
- `-dev`（default / darwin / windows）：`127.0.0.1`
- `-dev-connect`（Linux）：`0.0.0.0`（需外部网络命名空间）

### 归一化逻辑
[command/agent/config.go:2360-2410](file:///d:/claude/nomad/command/agent/config.go#L2360-L2410)：

```go
// HTTP 支持空格分隔多地址
httpAddrs, _ := normalizeMultipleBind(c.Addresses.HTTP, c.BindAddr)
c.Addresses.HTTP = strings.Join(httpAddrs, " ")

c.normalizedAddrs.HTTP = make([]string, len(httpAddrs))
for i, addr := range httpAddrs {
    c.normalizedAddrs.HTTP[i] = normalizeAddrWithPort(addr, c.Ports.HTTP)
}

// RPC / Serf 单一地址
c.normalizedAddrs.RPC = normalizeAddrWithPort(c.Addresses.RPC, c.Ports.RPC)
c.normalizedAddrs.Serf = normalizeAddrWithPort(c.Addresses.Serf, c.Ports.Serf)

// Advertise 校验
addr, err = normalizeAdvertise(c.AdvertiseAddrs.HTTP, httpAddrs[0], c.Ports.HTTP, c.DevMode)
addr, err = normalizeAdvertise(c.AdvertiseAddrs.RPC,  c.Addresses.RPC,  c.Ports.RPC,  c.DevMode)
addr, err = normalizeAdvertise(c.AdvertiseAddrs.Serf, c.Addresses.Serf, c.Ports.Serf, c.DevMode)
```

### Advertise 地址使用场景
- **Client 注册节点时**：[command/agent/agent.go:1016](file:///d:/claude/nomad/command/agent/agent.go#L1016) — `conf.Node.HTTPAddr = agentConfig.AdvertiseAddrs.HTTP`，Server 通过此地址访问 Client HTTP API（如 `/v1/client/fs/logs` 流式日志）
- **Server 反向 RPC**：Server 用 `ClientRPCAdvertise` 通知 Client 拨号目标
- **Server 间 RPC**：Server 用 `ServerRPCAdvertise`（默认 Serf IP + RPC Port）相互寻址

### `bind_addr` 优先级
1. 顶层 `bind_addr`（默认 `0.0.0.0`）
2. `addresses.{http,rpc,serf}` 覆盖对应协议的 bind
3. `advertise.{http,rpc,serf}` 覆盖广告地址（不影响实际监听）

---

## 10. 其他相关端口配置

### `reserved.reserved_ports`
[command/agent/config.go:1597-1614](file:///d:/claude/nomad/command/agent/config.go#L1597-L1614) — Client 配置：

```hcl
client {
  reserved {
    reserved_ports = "22,80,443,14000-14512"
  }
}
```

Nomad 调度器在分配任务端口时会跳过这些端口，避免与系统服务或插件端口冲突。

### gRPC Plugin Broker 端口
`hashicorp/go-plugin` 库的 GRPCBroker 也使用 `ClientMinPort`–`ClientMaxPort` 范围分配子流端口（用于插件与宿主之间的双向流，如 docker driver 的 log stream）。

### HTTPS / TLS 端口
Nomad 不使用单独端口区分 HTTP/HTTPS —— **同一 4646 端口**根据 `tls.http` 配置选择是否启用 TLS。RPC 同理（4647）。

### Dev 模式端口
`-dev` 模式下 [command/agent/config.go:1748-1756](file:///d:/claude/nomad/command/agent/config.go#L1748-L1756) 仍用默认 4646/4647/4648，但 `bind_addr=127.0.0.1`，仅本机访问。可通过 `-dev-bind-addr` 覆盖。

### ACL OIDC Callback
测试代码中出现 `127.0.0.1:4649/oidc/callback`（[command/agent/acl_endpoint_test.go:1826](file:///d:/claude/nomad/command/agent/acl_endpoint_test.go#L1826)），但 4649 不是 Nomad 默认端口 —— 只是测试中的示例值，实际由 `oidc_issuer` 配置决定。

---

## 11. 端口配置示例

### 最小配置（默认值）
```hcl
# 不显式配置 ports 块时使用默认值 4646/4647/4648
bind_addr = "0.0.0.0"
```

### 生产 Server 配置
```hcl
bind_addr = "10.0.0.10"   # 内网接口

advertise {
  http = "10.0.0.10:4646"
  rpc  = "10.0.0.10:4647"
  serf = "10.0.0.10:4648"
}

ports {
  http = 4646
  rpc  = 4647
  serf = 4648
}

server {
  enabled          = true
  bootstrap_expect = 3
}
```

### 多 Region 联邦
```hcl
# Region A Server
region = "us-east"
datacenter = "dc1"

server {
  enabled = true
  # 跨 Region 通过 WAN gossip 自动联邦
  # Serf 端口仍为 4648（同一端口同时处理 LAN/WAN）
}
```

### Client 自定义端口范围
```hcl
client {
  enabled          = true
  client_min_port  = 14000
  client_max_port  = 14512
  min_dynamic_port = 20000
  max_dynamic_port = 32000

  reserved {
    reserved_ports = "22,80,443,14000-14512"
  }
}

servers = ["10.0.0.10:4647"]   # 指向 Server RPC 端口
```

### TLS 全加密
```hcl
tls {
  http = true
  rpc  = true

  ca_file   = "/etc/nomad.d/tls/ca.crt"
  cert_file = "/etc/nomad.d/tls/server.crt"
  key_file  = "/etc/nomad.d/tls/server.key"

  verify_server_hostname = true   # 强制 RPC 证书 SAN 校验
  verify_https_client    = true   # 强制 HTTPS 双向 TLS
}
```

---

## 12. 关键代码文件索引

| 主题 | 文件 |
|------|------|
| `Ports` 结构定义 | [command/agent/config.go:1583-1601](file:///d:/claude/nomad/command/agent/config.go#L1583-L1601) |
| `DefaultConfig()` 默认端口 | [command/agent/config.go:1821-1825](file:///d:/claude/nomad/command/agent/config.go#L1821-L1825) |
| `Addresses` / `AdvertiseAddrs` 结构 | [command/agent/config.go:1603-1657](file:///d:/claude/nomad/command/agent/config.go#L1603-L1657) |
| 地址归一化逻辑 | [command/agent/config.go:2360-2410](file:///d:/claude/nomad/command/agent/config.go#L2360-L2410) |
| `RPCConfig` 超时配置 | [command/agent/config.go:850-881](file:///d:/claude/nomad/command/agent/config.go#L850-L881) |
| HTTP 监听器创建 | [command/agent/http.go:113-204](file:///d:/claude/nomad/command/agent/http.go#L113-L204) |
| API 客户端默认地址 | [api/api.go:336-338](file:///d:/claude/nomad/api/api.go#L336-L338) |
| Server RPC 监听器 | [nomad/server.go:596-605](file:///d:/claude/nomad/nomad/server.go#L596-L605) |
| RPC 首字节分发 | [nomad/rpc.go:316-345](file:///d:/claude/nomad/nomad/rpc.go#L316-L345) |
| `DefaultRPCAddr()` | [nomad/config.go:35-37](file:///d:/claude/nomad/nomad/config.go#L35-L37) |
| `DefaultSerfPort` 常量 | [nomad/config.go:32](file:///d:/claude/nomad/nomad/config.go#L32) |
| Serf Memberlist 配置 | [nomad/config.go:736-740](file:///d:/claude/nomad/nomad/config.go#L736-L740) |
| Bind/Advertise 设置 | [command/agent/agent.go:399-428](file:///d:/claude/nomad/command/agent/agent.go#L399-L428) |
| RaftLayer（Raft over RPC） | [nomad/raft_rpc.go:46-90](file:///d:/claude/nomad/nomad/raft_rpc.go#L46-L90) |
| Server Advertise 双地址 | [nomad/server.go:1216-1260](file:///d:/claude/nomad/nomad/server.go#L1216-L1260) |
| Client 插件端口范围 | [command/agent/config.go:323-329](file:///d:/claude/nomad/command/agent/config.go#L323-L329) |
| Executor 插件端口 | [drivers/shared/executor/utils.go:54-72](file:///d:/claude/nomad/drivers/shared/executor/utils.go#L54-L72) |
| Client 端口预留 | [command/agent/agent.go:1478-1489](file:///d:/claude/nomad/command/agent/agent.go#L1478-L1489) |
| 动态端口范围 | [nomad/structs/network.go:17-22](file:///d:/claude/nomad/nomad/structs/network.go#L17-L22) |
| Client NodeResources 写入 | [client/client.go:778-779](file:///d:/claude/nomad/client/client.go#L778-L779) |
| CSI Socket 名称 | [nomad/structs/csi.go:18-23](file:///d:/claude/nomad/nomad/structs/csi.go#L18-L23) |
| CSI gRPC 客户端 | [plugins/csi/client.go:159-180](file:///d:/claude/nomad/plugins/csi/client.go#L159-L180) |
| Vault 默认配置 | [nomad/structs/config/vault.go:106-115](file:///d:/claude/nomad/nomad/structs/config/vault.go#L106-L115) |
| Consul 默认配置 | [nomad/structs/config/consul.go:191-218](file:///d:/claude/nomad/nomad/structs/config/consul.go#L191-L218) |
| Consul 服务注册 | [command/agent/agent.go:1215-1273](file:///d:/claude/nomad/command/agent/agent.go#L1215-L1273) |
| HTTP 健康检查 | [command/agent/agent.go:1443-1469](file:///d:/claude/nomad/command/agent/agent.go#L1443-L1469) |
| TLS 证书校验（RPC） | [nomad/server.go:645-672](file:///d:/claude/nomad/nomad/server.go#L645-L672) |

---

## 总结

Nomad 的端口体系围绕**核心三端口**（4646 HTTP / 4647 RPC / 4648 Serf）构建：

1. **HTTP 4646**：单端口承载 REST API、Web UI、WebSocket 长连接、健康检查，TLS 可选
2. **RPC 4647**：单端口通过首字节 magic byte 复用 6 种 RPC 类型（Nomad/Raft/Multiplex V1&V2/Streaming/TLS），同时服务 Client↔Server 和 Server↔Server 通信
3. **Serf 4648**：UDP+TCP 双协议，承载 LAN gossip（同 Region）和 WAN gossip（跨 Region 联邦）

Client 额外维护两个端口范围：
- **14000–14512**：内部插件 gRPC 通信（Executor/Logmon/DockerLogger/DriverPlugin），自动加入 `reserved_ports`
- **20000–32000**：调度器为任务分配的动态端口，写入 `NodeResources` 供调度使用

CSI Plugin 不使用 TCP 端口，而是通过 unix socket (`csi.sock`) 通信。外部依赖（Vault 8200、Consul 8500）由各自默认配置决定，Nomad 不接管这些端口。

Advertise/Bind 体系通过 `addresses{}`、`advertise{}`、`bind_addr` 三层配置分离**监听地址**与**广告地址**，确保 NAT 环境下的正确通信，且 Server 的 Advertise 地址必须可被外部解析（不能用 `0.0.0.0`）。
