# Nomad Region 配置位置与运行影响分析

> 本文档基于 Nomad 源码（CE 版）分析 region 在各层的配置入口、传播路径及对运行时行为的影响。所有引用均带可点击源码链接。

---

## 目录

1. [Region 概念总览](#1-region-概念总览)
2. [Agent 层 Region 配置](#2-agent-层-region-配置)
3. [Server 层 AuthoritativeRegion](#3-server-层-authoritativeregion)
4. [Job 的 Region 字段](#4-job-的-region-字段)
5. [Job Multiregion 配置](#5-job-multiregion-配置)
6. [API Client 的 Region 配置](#6-api-client-的-region-配置)
7. [RPC 请求中的 Region](#7-rpc-请求中的-region)
8. [HTTP `?region=` 查询参数](#8-http-region-查询参数)
9. [TLS Region 校验](#9-tls-region-校验)
10. [跨区 RPC 转发](#10-跨区-rpc-转发)
11. [ACL 复制机制](#11-acl-复制机制)
12. [默认值与常量](#12-默认值与常量)
13. [配置场景与影响](#13-配置场景与影响)
14. [源码文件索引](#14-源码文件索引)
15. [附录 A：Region 配置决策流程](#附录-aregion-配置决策流程)
16. [附录 B：Region 相关环境变量](#附录-bregion-相关环境变量)

---

## 1. Region 概念总览

在 Nomad 中，**region** 是一个逻辑地理/故障域抽象，对应一组协同工作的 Nomad server。其核心作用包括：

- **隔离调度域**：每个 region 拥有独立的 Raft 日志、状态存储和调度器
- **跨区转发**：当请求目标 region 与本地不同时，server 会通过 WAN gossip 把 RPC 转发到目标 region
- **ACL 权威源**：通过 `authoritative_region` 指定唯一可信的 ACL/策略来源，其它 region 复制其数据
- **TLS 身份校验**：节点证书 SAN 包含 `<role>.<region>.nomad`，server 校验请求方 region 与证书匹配
- **Multiregion Job**：企业版可让一个 job 在多个 region 并发部署

默认 region 为 `"global"`，单区部署时可保持默认；多区部署时每个 region 应有唯一名称。

---

## 2. Agent 层 Region 配置

### 2.1 配置入口

Agent 是 Nomad 进程的入口（`nomad agent`），其 `Config.Region` 字段是用户最常配置的位置。

**配置结构** [config.go#L48-L50](file:///d:/claude/nomad/command/agent/config.go#L48-L50)：

```go
type Config struct {
    // Region is the region this agent is in. Defaults to global.
    Region string `hcl:"region"`
    ...
}
```

**默认值** [config.go#L1816-L1820](file:///d:/claude/nomad/command/agent/config.go#L1816-L1820)：

```go
func DefaultConfig() *Config {
    cfg := &Config{
        Region:     "global",
        Datacenter: "dc1",
        ...
    }
}
```

### 2.2 CLI 标志

通过 `-region` 命令行参数指定 [command.go#L130](file:///d:/claude/nomad/command/agent/command.go#L130)：

```go
flags.StringVar(&cmdConfig.Region, "region", "", "")
```

### 2.3 配置文件示例

```hcl
region = "us-east-1"
datacenter = "dc1"
```

### 2.4 合法性校验

启动时检查 region 不含空字符 [command.go#L349-L353](file:///d:/claude/nomad/command/agent/command.go#L349-L353)：

```go
if strings.ContainsAny(config.Region, "\000") {
    c.Ui.Error("Region contains invalid characters")
    return false
}
```

### 2.5 配置合并优先级

`readConfig()` 中合并顺序 [command.go#L259-L301](file:///d:/claude/nomad/command/agent/command.go#L259-L301)：

1. `DefaultConfig()` — 提供 `Region="global"` 默认值
2. `DefaultEntConfig()` — 企业版 overlay
3. `LoadConfig(path)` — 用户 HCL/JSON 文件
4. `cmdConfig` — CLI 标志（最高优先级）

最终 `config = config.Merge(cmdConfig)`，CLI 标志覆盖文件配置。

### 2.6 影响范围

Agent 的 `Region` 同时作用于：
- 启动 server 时传入 `nomad.Config.Region`
- 启动 client 时传入 `client.Config.Region`
- HTTP 请求默认 region（`?region=` 未指定时使用）
- TLS 证书 ServerName 生成（`client.<region>.nomad`）

---

## 3. Server 层 AuthoritativeRegion

### 3.1 字段定义

`nomad.Config` 在 server 层增加 `AuthoritativeRegion` [config.go#L126-L131](file:///d:/claude/nomad/nomad/config.go#L126-L131)：

```go
type Config struct {
    ...
    // Region is the region this Nomad server belongs to.
    Region string

    // AuthoritativeRegion is the region which is treated as the authoritative source
    // for ACLs and Policies. This provides a single source of truth to resolve conflicts.
    AuthoritativeRegion string
    ...
}
```

### 3.2 Agent 配置入口

在 agent 配置中位于 `ServerConfig` 块 [config.go#L546-L548](file:///d:/claude/nomad/command/agent/config.go#L546-L548)：

```go
type ServerConfig struct {
    ...
    AuthoritativeRegion string `hcl:"authoritative_region"`
    ...
}
```

配置文件示例：

```hcl
server {
  authoritative_region = "us-east-1"
}
```

### 3.3 默认值推导

Agent 启动时，若未显式配置 `authoritative_region`，则**默认等于本地 region** [agent.go#L210-L220](file:///d:/claude/nomad/command/agent/agent.go#L210-L220)：

```go
if agentConfig.Region != "" {
    conf.Region = agentConfig.Region
}

// Set the Authoritative Region if set, otherwise default to
// the same as the local region.
if agentConfig.Server.AuthoritativeRegion != "" {
    conf.AuthoritativeRegion = agentConfig.Server.AuthoritativeRegion
} else if agentConfig.Region != "" {
    conf.AuthoritativeRegion = agentConfig.Region
}
```

Server 层默认值同样是 `DefaultRegion` [config.go#L629-L630](file:///d:/claude/nomad/nomad/config.go#L629-L630)：

```go
Region:              DefaultRegion,
AuthoritativeRegion: DefaultRegion,
```

### 3.4 影响范围

`AuthoritativeRegion` 决定 leader 启动后的工作模式（详见第 11 节）：
- 当 `AuthoritativeRegion == 本地 Region`：作为权威源，运行 `schedulePeriodicAuthoritative` 周期清理过期 global token
- 当 `AuthoritativeRegion != 本地 Region`：启动 7 个复制 goroutine，从权威区拉取 ACL 策略/Token/Role/AuthMethod/BindingRule/Namespace/NodePool

---

## 4. Job 的 Region 字段

### 4.1 API 层 Job 结构

`api.Job` 中 `Region` 是指针字段，用于多区 job 标识归属 [jobs.go#L1108](file:///d:/claude/nomad/api/jobs.go#L1108)：

```go
type Job struct {
    ...
    Region *string `hcl:"region,optional"`
    ...
}
```

### 4.2 规范化默认值

提交 job 时若未指定 region，`Canonicalize` 会填充默认 `GlobalRegion = "global"` [jobs.go#L43-L48](file:///d:/claude/nomad/api/jobs.go#L43-L48) 与 [jobs.go#L1185-L1187](file:///d:/claude/nomad/api/jobs.go#L1185-L1187)：

```go
const (
    GlobalRegion = "global"
    ...
)

func (j *Job) Canonicalize() {
    ...
    if j.Region == nil {
        j.Region = pointerOf(GlobalRegion)
    }
    ...
}
```

### 4.3 Server 层 Job 结构

`structs.Job` 中 `Region` 是 string，记录 job 归属 region [structs.go#L4395-L4396](file:///d:/claude/nomad/nomad/structs/structs.go#L4395-L4396)：

```go
type Job struct {
    ...
    // Region is the Nomad region that handles scheduling this job
    Region string
    ...
}
```

### 4.4 校验逻辑

Job 校验时若 `Region` 为空且非 multiregion job，则报错 [structs.go#L4735-L4737](file:///d:/claude/nomad/nomad/structs/structs.go#L4735-L4737)：

```go
if j.Region == "" && j.Multiregion == nil {
    mErr.Errors = append(mErr.Errors, errors.New("Missing job region"))
}
```

### 4.5 影响范围

- Job 的 `Region` 决定该 job 由哪个 region 的 server 调度
- 当客户端提交的 job region 与本地 server 不同时，会通过 `forwardRegion` 转发
- 普通 job（非 multiregion）的 `Region` 通常等于 `GlobalRegion` 或本地 region

---

## 5. Job Multiregion 配置

### 5.1 结构定义

`Multiregion` 结构用于企业版跨区部署 [structs.go#L5524-L5527](file:///d:/claude/nomad/nomad/structs/structs.go#L5524-L5527)：

```go
type Multiregion struct {
    Strategy *MultiregionStrategy
    Regions  []*MultiregionRegion
}
```

### 5.2 配置示例

```hcl
job "web-app" {
  multiregion {
    strategy {
      max_parallel = 1
    }
    region "us-east-1" {
      count = 10
      datacenters = ["dc1"]
      meta {
        region_type = "primary"
      }
    }
    region "eu-west-1" {
      count = 5
      datacenters = ["dc1"]
    }
  }
}
```

### 5.3 影响范围

- 提交 multiregion job 时，server 会将其拆分为每个 region 的子 job
- 每个 region 的 server 独立调度本区子 job
- 配置修改会通过跨区 RPC 同步到所有涉及的 region
- **企业版功能**，CE 版的 `job_endpoint_ce.go` 中相关方法为占位实现

---

## 6. API Client 的 Region 配置

### 6.1 Client 配置字段

`api.Client` 持有 `config.Region` [api.go#L60](file:///d:/claude/nomad/api/api.go#L60)：

```go
type Config struct {
    ...
    // Region to use
    Region string
    ...
}
```

### 6.2 环境变量

从 `NOMAD_REGION` 读取默认值 [api.go#L345](file:///d:/claude/nomad/api/api.go#L345)：

```go
if v := os.Getenv("NOMAD_REGION"); v != "" {
    config.Region = v
}
```

### 6.3 运行时修改

`SetRegion` 方法可在 client 创建后修改 region [api.go#L565-L568](file:///d:/claude/nomad/api/api.go#L565-L568)：

```go
func (c *Client) SetRegion(region string) {
    c.config.Region = region
}
```

### 6.4 请求 region 解析优先级

发起请求时 region 选择优先级 [api.go#L608-L619](file:///d:/claude/nomad/api/api.go#L608-L619)：

```go
var region string
switch {
case q != nil && q.Region != "":
    // Prefer the region set in the query parameter
    region = q.Region
case c.config.Region != "":
    // If the client is configured for a particular region use that
    region = c.config.Region
default:
    // No region information is given so use GlobalRegion as the default.
    region = GlobalRegion
}
```

优先级从高到低：
1. `QueryOptions.Region` / `WriteOptions.Region`（每次请求显式指定）
2. `Client.config.Region`（client 级配置）
3. `GlobalRegion = "global"`（兜底）

### 6.5 查询参数注入

当 `c.config.Region` 非空时，会自动加到 URL 查询参数 [api.go#L843-L845](file:///d:/claude/nomad/api/api.go#L843-L845)：

```go
if c.config.Region != "" {
    r.params.Set("region", c.config.Region)
}
```

### 6.6 TLS ServerName

若未显式设置 TLSServerName，会基于 region 生成 [api.go#L248](file:///d:/claude/nomad/api/api.go#L248)：

```go
config.TLSConfig.TLSServerName = fmt.Sprintf("client.%s.nomad", region)
```

### 6.7 影响范围

- 决定所有 API 请求的默认目标 region
- 影响 TLS 证书 ServerName，从而影响证书校验
- 通过 `NOMAD_REGION` 环境变量可在不修改代码的情况下切换 region

---

## 7. RPC 请求中的 Region

### 7.1 QueryOptions 结构

所有读请求嵌入 `QueryOptions`，包含 `Region` 字段 [structs.go#L282-L284](file:///d:/claude/nomad/nomad/structs/structs.go#L282-L284)：

```go
type QueryOptions struct {
    ...
    // The target region for this query
    Region string
    ...
}
```

### 7.2 WriteRequest 结构

所有写请求嵌入 `WriteRequest`，同样含 `Region` [structs.go#L431-L433](file:///d:/claude/nomad/nomad/structs/structs.go#L431-L433)：

```go
type WriteRequest struct {
    ...
    // The target region for this write
    Region string
    ...
}
```

### 7.3 影响范围

- RPC 请求的 `Region` 字段是 server 决定是否转发的依据
- 若请求 region 与本地 server region 不同，server 会调用 `forwardRegion` 转发
- ACL endpoint 会强制把 `args.Region` 改写为 `AuthoritativeRegion`（见第 11 节）

---

## 8. HTTP `?region=` 查询参数

### 8.1 路由注册

`/v1/regions` 端点列出所有已知 region [http.go#L506](file:///d:/claude/nomad/command/agent/http.go#L506)：

```go
s.mux.HandleFunc("/v1/regions", s.wrap(s.RegionListRequest))
```

### 8.2 参数解析

`parseRegion` 解析 `?region=` 参数，未指定时回退到 agent 配置 [http.go#L978-L984](file:///d:/claude/nomad/command/agent/http.go#L978-L984)：

```go
func (s *HTTPServer) parseRegion(req *http.Request, r *string) {
    if other := req.URL.Query().Get("region"); other != "" {
        *r = other
    } else if *r == "" {
        *r = s.agent.GetConfig().Region
    }
}
```

### 8.3 调用点

- 读请求 [http.go#L1074](file:///d:/claude/nomad/command/agent/http.go#L1074)：`s.parseRegion(req, r)`
- 写请求 [http.go#L1161](file:///d:/claude/nomad/command/agent/http.go#L1161)：`s.parseRegion(req, &w.Region)`

### 8.4 Regions 列表 API

`api.Regions.List()` 调用 `/v1/regions` 获取集群所有 region [regions.go](file:///d:/claude/nomad/api/regions.go)：

```go
func (r *Regions) List() ([]string, error) {
    var resp []string
    req, err := r.client.NewRequest("GET", "/v1/regions")
    ...
}
```

### 8.5 影响范围

- 用户可在单次请求中通过 `?region=xxx` 覆盖默认 region
- 不修改 client 配置即可访问不同 region 的数据
- 配合 `/v1/regions` 可发现集群中所有 region

---

## 9. TLS Region 校验

### 9.1 RPC TLS 配置

Server 启动时基于 `config.Region` 配置 TLS [server.go#L347](file:///d:/claude/nomad/nomad/server.go#L347)：

```go
incomingTLS, tlsWrap, err := getTLSConf(config.TLSConfig.EnableRPC, tlsConf, config.Region)
```

### 9.2 证书 SAN 约定

Nomad 证书 SAN 采用 `<role>.<region>.nomad` 格式，例如：
- `server.us-east-1.nomad` — server 节点证书
- `client.us-east-1.nomad` — client 节点证书

### 9.3 RPC 名称/Region 校验器

`rpcNameAndRegionValidator` 校验 RPC 对端名称与 region 是否合法 [server.go#L639-L656](file:///d:/claude/nomad/nomad/server.go#L639-L656)：

```go
func rpcNameAndRegionValidator(region string) func(...string) error {
    return func(parts ...string) error {
        if len(parts) != 3 {
            return fmt.Errorf("expected 3 parts, got %d", len(parts))
        }
        // parts[0] = role, parts[1] = region, parts[2] = "nomad"
        if !validateRPCRegionPeer(parts[0], parts[1]) {
            return fmt.Errorf("region mismatch")
        }
        return nil
    }
}
```

### 9.4 影响范围

- 防止跨 region 的 RPC 伪装攻击
- 节点证书必须与 agent 配置的 region 一致，否则握手失败
- 部署多区集群时，每个 region 的节点需签发对应 region 的证书

---

## 10. 跨区 RPC 转发

### 10.1 PeerCache

Server 启动时基于 `config.Region` 创建 `peersCache` [server.go#L370](file:///d:/claude/nomad/nomad/server.go#L370)：

```go
peersCache: peers.NewPeerCache(config.Region),
```

`PeerCache` 通过 WAN gossip 发现其它 region 的 server 地址。

### 10.2 Region 查询接口

- `Server.Region()` 返回本地 region [server.go#L2254-L2256](file:///d:/claude/nomad/nomad/server.go#L2254-L2256)
- `Server.Regions()` 返回所有已知 region 列表 [server.go#L2149-L2153](file:///d:/claude/nomad/nomad/server.go#L2149-L2153)：

```go
func (s *Server) Regions() []string {
    regions := s.peersCache.RegionNames()
    ...
}
```

### 10.3 forwardRegion 机制

当 RPC 请求的 `Region` 与本地不同时，server 调用 `forwardRegion(targetRegion, ...)` 把请求转发到目标 region 的 server。典型调用见第 11 节 ACL 复制。

### 10.4 影响范围

- 用户从任意 server 都可查询/操作其它 region 的数据（透明转发）
- 转发依赖 WAN gossip 建立的 server 互联
- 网络分区时跨区请求会失败

---

## 11. ACL 复制机制

### 11.1 Leader 启动分流

Leader 选举完成后，根据 `AuthoritativeRegion` 与本地 region 的关系决定角色 [leader.go#L498-L513](file:///d:/claude/nomad/nomad/leader.go#L498-L513)：

```go
// The authoritative region is responsible for garbage collecting
// expired global tokens. Otherwise, non-authoritative regions need to
// replicate policies, tokens, and namespaces.
switch s.config.AuthoritativeRegion {
case s.config.Region:
    go s.schedulePeriodicAuthoritative(stopCh)
default:
    go s.replicateACLPolicies(stopCh)
    go s.replicateACLTokens(stopCh)
    go s.replicateACLRoles(stopCh)
    go s.replicateACLAuthMethods(stopCh)
    go s.replicateACLBindingRules(stopCh)
    go s.replicateNamespaces(stopCh)
    go s.replicateNodePools(stopCh)
}
```

### 11.2 权威区职责

`AuthoritativeRegion == 本地 Region` 时：
- 运行 `schedulePeriodicAuthoritative` 周期任务
- 负责清理过期的 global ACL token
- 是 ACL 数据的唯一可信源

### 11.3 非权威区职责

`AuthoritativeRegion != 本地 Region` 时，启动 7 个复制 goroutine：
1. `replicateACLPolicies` — 复制 ACL 策略
2. `replicateACLTokens` — 复制 ACL token
3. `replicateACLRoles` — 复制 ACL role
4. `replicateACLAuthMethods` — 复制认证方法
5. `replicateACLBindingRules` — 复定绑定规则
6. `replicateNamespaces` — 复制命名空间
7. `replicateNodePools` — 复制节点池

每个复制 goroutine 通过 `forwardRegion(s.config.AuthoritativeRegion, ...)` 拉取权威区数据。

### 11.4 ACL Endpoint 强制重写

ACL endpoint 在处理请求前强制把 `args.Region` 改写为 `AuthoritativeRegion` [acl_endpoint.go#L98](file:///d:/claude/nomad/nomad/acl_endpoint.go#L98)：

```go
args.Region = a.srv.config.AuthoritativeRegion
```

部分方法附带条件判断 [acl_endpoint.go#L805-L806](file:///d:/claude/nomad/nomad/acl_endpoint.go#L805-L806)：

```go
if a.srv.config.Region != a.srv.config.AuthoritativeRegion {
    args.Region = a.srv.config.AuthoritativeRegion
}
```

### 11.5 影响范围

- ACL 数据全局一致：所有 region 的 ACL 策略/token 来自权威区
- 即使客户端向非权威区提交 ACL 写请求，也会被转发到权威区处理
- 权威区故障时，其它 region 仍可用已复制的 ACL 数据，但无法更新
- 复制 token 通过 `acl.replication_token`（agent 配置）或 `acl-replication-token` CLI 标志提供

---

## 12. 默认值与常量

### 12.1 Server 层常量

[nomad/config.go#L29-L33](file:///d:/claude/nomad/nomad/config.go#L29-L33)：

```go
const (
    DefaultRegion   = "global"
    DefaultDC       = "dc1"
    DefaultSerfPort = 4648
)
```

### 12.2 API 层常量

[api/jobs.go#L43-L48](file:///d:/claude/nomad/api/jobs.go#L43-L48)：

```go
const (
    GlobalRegion = "global"
    ...
)
```

### 12.3 默认值汇总

| 字段 | 默认值 | 来源 |
|------|--------|------|
| `agent.Config.Region` | `"global"` | `DefaultConfig()` |
| `agent.Config.Server.AuthoritativeRegion` | `""`（推导为 `Region`） | `agent.go` |
| `nomad.Config.Region` | `DefaultRegion` | `DefaultConfig()` |
| `nomad.Config.AuthoritativeRegion` | `DefaultRegion` | `DefaultConfig()` |
| `api.Job.Region` | `pointerOf(GlobalRegion)` | `Canonicalize()` |
| `api.Client.config.Region` | `""`（可由 `NOMAD_REGION` 注入） | `DefaultConfig()` |

---

## 13. 配置场景与影响

### 13.1 单区部署（默认）

**配置**：
```hcl
# 不显式配置 region，使用默认 "global"
server {
  enabled = true
}
client {
  enabled = true
}
```

**行为**：
- `Region = "global"`，`AuthoritativeRegion = "global"`
- Leader 运行 `schedulePeriodicAuthoritative`，无复制 goroutine
- 所有 RPC 本地处理，无跨区转发
- Job 提交后 `Region = "global"`

### 13.2 单区自定义 region

**配置**：
```hcl
region = "us-east-1"
server {
  enabled = true
}
```

**行为**：
- `Region = "us-east-1"`，`AuthoritativeRegion = "us-east-1"`（自动推导）
- 仍为权威区，无复制
- 节点证书 SAN 需为 `server.us-east-1.nomad` / `client.us-east-1.nomad`
- API client 需 `NOMAD_REGION=us-east-1` 或 `?region=us-east-1`

### 13.3 多区集群（含 ACL 复制）

**配置**（非权威区）：
```hcl
region = "eu-west-1"
server {
  enabled = true
  authoritative_region = "us-east-1"
  # 复制 token 需为权威区的 management token
  acl {
    enabled = true
    replication_token = "<management-token-from-us-east-1>"
  }
}
```

**行为**：
- `Region = "eu-west-1"`，`AuthoritativeRegion = "us-east-1"`
- Leader 启动 7 个复制 goroutine，从 `us-east-1` 拉取 ACL 数据
- ACL 写请求自动转发到 `us-east-1`
- 读请求本地处理（使用已复制数据）
- 跨区 job 调度通过 WAN gossip 转发

### 13.4 多区 Multiregion Job（企业版）

**配置**：
```hcl
job "web" {
  multiregion {
    region "us-east-1" { count = 10 }
    region "eu-west-1" { count = 5 }
  }
  ...
}
```

**行为**：
- 提交到任一 region 后，server 拆分为两个子 job
- 各 region server 独立调度本区子 job
- 配置变更通过跨区 RPC 同步
- CE 版 `job_endpoint_ce.go` 中 multiregion 方法为占位实现

### 13.5 配置错误场景

| 错误 | 现象 |
|------|------|
| `region` 含空字符 | agent 启动失败：`Region contains invalid characters` |
| 非权威区未配 `replication_token` | 复制 goroutine 持续报错，ACL 数据无法同步 |
| 节点证书 region 与 agent region 不一致 | TLS 握手失败 |
| `authoritative_region` 指向不存在的 region | 复制 goroutine 连接失败，ACL 数据停滞 |

---

## 14. 源码文件索引

### 14.1 Agent 层

| 文件 | 作用 |
|------|------|
| [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | `Config.Region`、`ServerConfig.AuthoritativeRegion` 字段定义与默认值 |
| [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | `-region` CLI 标志、合法性校验、配置合并 |
| [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | Region 从 agent config 传播到 server/client config |
| [command/agent/http.go](file:///d:/claude/nomad/command/agent/http.go) | `parseRegion()`、`/v1/regions` 端点、HTTP 请求 region 解析 |

### 14.2 Server 层

| 文件 | 作用 |
|------|------|
| [nomad/config.go](file:///d:/claude/nomad/nomad/config.go) | `DefaultRegion` 常量、`Config.Region`/`AuthoritativeRegion` 字段 |
| [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | TLS 校验、`PeerCache`、`Server.Region()`、`Server.Regions()` |
| [nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go) | ACL 复制 goroutine 启动分流 |
| [nomad/acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | ACL 请求强制重写 `args.Region = AuthoritativeRegion` |

### 14.3 Structs 层

| 文件 | 作用 |
|------|------|
| [nomad/structs/structs.go](file:///d:/claude/nomad/nomad/structs/structs.go) | `QueryOptions.Region`、`WriteRequest.Region`、`Job.Region`、`Multiregion` 结构 |

### 14.4 API 层

| 文件 | 作用 |
|------|------|
| [api/api.go](file:///d:/claude/nomad/api/api.go) | `Config.Region`、`NOMAD_REGION` 环境变量、`SetRegion`、请求 region 优先级 |
| [api/jobs.go](file:///d:/claude/nomad/api/jobs.go) | `GlobalRegion` 常量、`Job.Region` 字段、`Canonicalize()` |
| [api/regions.go](file:///d:/claude/nomad/api/regions.go) | `Regions.List()` API |

### 14.5 Client 层

| 文件 | 作用 |
|------|------|
| [client/client.go](file:///d:/claude/nomad/client/client.go) | `Client.Region()` 方法、节点注册时携带 region |

---

## 附录 A：Region 配置决策流程

```
用户启动 Nomad agent
    │
    ├─ 读取 -region CLI 标志
    │      └─ 覆盖 config.Region
    │
    ├─ 读取 HCL 配置文件 region = "xxx"
    │      └─ 覆盖 DefaultConfig().Region
    │
    ├─ 校验 region 不含空字符
    │      └─ 失败则退出
    │
    ├─ 推导 AuthoritativeRegion
    │      ├─ 显式配置 authoritative_region → 使用该值
    │      └─ 未配置 → 等于 Region
    │
    ├─ 启动 server
    │      ├─ Region → TLS 证书 SAN、PeerCache
    │      └─ AuthoritativeRegion → leader 分流：
    │             ├─ == 本地 Region → 权威模式（无复制）
    │             └─ != 本地 Region → 复制模式（7 个 goroutine）
    │
    ├─ 启动 client
    │      └─ Region → 节点注册信息、API 默认 region
    │
    └─ 启动 HTTP server
           └─ ?region= 参数 → parseRegion() → RPC QueryOptions.Region
                  └─ 若 != 本地 Region → forwardRegion() 跨区转发
```

---

## 附录 B：Region 相关环境变量

| 环境变量 | 作用 | 默认值 |
|----------|------|--------|
| `NOMAD_REGION` | API client 默认 region | `""`（未设置时使用 `GlobalRegion`） |

> 注意：agent 进程本身不读取 `NOMAD_REGION`，该变量仅作用于 `api.Client`。Agent 的 region 必须通过 CLI 标志或配置文件指定。

---

## 总结

Nomad 的 region 配置贯穿 Agent → Server → Client → API 四层，核心要点：

1. **Agent `region`** 是最基础的配置，决定本节点所属 region，影响 TLS 证书、PeerCache、HTTP 默认 region
2. **Server `authoritative_region`** 控制 ACL 数据流向，多区部署时必须显式指定
3. **API `NOMAD_REGION` / `?region=`** 让用户灵活选择目标 region，优先级高于 client 配置
4. **Job `region` / `multiregion`** 决定 job 调度归属，multiregion 是企业版功能
5. **跨区转发** 由 server 透明处理，用户感知不到 region 边界
6. **ACL 强制重写** 确保所有 ACL 写请求流向权威区，保证全局一致性
