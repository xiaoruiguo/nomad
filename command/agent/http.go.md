# http.go 代码说明文档

> 文件路径：[http.go](file:///d:/claude/nomad/command/agent/http.go)
> 总行数：1263 行
> 所属包：`agent`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件是 **HTTP API 服务器实现**，定义 `HTTPServer` 结构体和路由注册表，处理所有 REST API 请求。包含请求中间件（CORS、限流、ACL、TLS）、WebSocket 升级、pprof 端点、UI 静态资源服务等。

## 2. 类型定义

### handlerFn

**定义位置**：[L87](file:///d:/claude/nomad/command/agent/http.go#L87)

**类型定义**：`func(...)`

### handlerByteFn

**定义位置**：[L88](file:///d:/claude/nomad/command/agent/http.go#L88)

**类型定义**：`func(...)`

### RPCer

**定义位置**：[L90](file:///d:/claude/nomad/command/agent/http.go#L90)

**类型**：interface

```go
	RPC
	Server
	Client
	Stats
	GetConfig
	GetMetricsSink
	ConfigReload
```

### HTTPServer

**定义位置**：[L101](file:///d:/claude/nomad/command/agent/http.go#L101)

**类型**：struct

```go
	agent RPCer
	eventAuditor event.Auditor
	mux *http.ServeMux
	listener net.Listener
	listenerCh chan struct{...}
	logger log.Logger
	Addr string
	wsUpgrader *websocket.Upgrader
```

**关联方法**（12 个）：`Shutdown`, `ResolveToken`, `registerHandlers`, `handleUI`, `handleRootFallthrough`, `wrap`, `wrapNonJSON`, `parseRegion`, `parseToken`, `parse`, `parseWriteRequest`, `wrapUntrustedContent`

### tcpKeepAliveListener

**定义位置**：[L349](file:///d:/claude/nomad/command/agent/http.go#L349)

**类型**：struct

```go
	*net.TCPListener
```

**关联方法**（1 个）：`Accept`

### builtinAPI

**定义位置**：[L585](file:///d:/claude/nomad/command/agent/http.go#L585)

**类型**：struct

```go
	srvReadyCh chan struct{...}
	srv *http.Server
	srvLock sync.Mutex
```

**关联方法**（3 个）：`SetServer`, `Serve`, `Shutdown`

### HTTPCodedError

**定义位置**：[L650](file:///d:/claude/nomad/command/agent/http.go#L650)

**类型**：interface

```go
	error
	Code
```

### UIAssetWrapper

**定义位置**：[L655](file:///d:/claude/nomad/command/agent/http.go#L655)

**类型**：struct

```go
	FileSystem *assetfs.AssetFS
```

**关联方法**（1 个）：`Open`

### codedError

**定义位置**：[L675](file:///d:/claude/nomad/command/agent/http.go#L675)

**类型**：struct

```go
	s string
	code int
```

**关联方法**（2 个）：`Error`, `Code`

### authMiddleware

**定义位置**：[L1202](file:///d:/claude/nomad/command/agent/http.go#L1202)

**类型**：struct

```go
	srv *HTTPServer
	wrapped http.Handler
```

**关联方法**（1 个）：`ServeHTTP`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `ErrInvalidMethod` | `"Invalid method"` |
| `ErrEntOnly` | `"Nomad Enterprise only endpoint"` |
| `ErrServerOnly` | `"Server only endpoint"` |
| `ContextKeyReqID` | `"requestID"` |
| `MissingRequestID` | `"<missing request id>"` |
| `contentTypeHeader` | `"Content-Type"` |
| `plainContentType` | `"text/plain; charset=utf-8"` |

### 变量

| 名称 | 值 |
|------|----|
| `uiEnabled` | `true` |
| `stubHTML` | `"<html><p>Nomad UI is disabled</p></html>"` |
| `allowCORSWithMethods` | `*ast.FuncLit` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewHTTPServers` | - | `agent *Agent, config *Config` | `[]*HTTPServer, error` | [L119](file:///d:/claude/nomad/command/agent/http.go#L119) |
| `makeConnState` | - | `isTLS bool, handshakeTimeout time.Duration, connLimit int, connCount *atomic...` | `func(...)` | [L271](file:///d:/claude/nomad/command/agent/http.go#L271) |
| `connLimiter` | - | `connLimit int, logger log.Logger` | `func(...)` | [L320](file:///d:/claude/nomad/command/agent/http.go#L320) |
| `Accept` | `ln *tcpKeepAliveListener` | - | `c net.Conn, err error` | [L353](file:///d:/claude/nomad/command/agent/http.go#L353) |
| `Shutdown` | `s *HTTPServer` | - | - | [L364](file:///d:/claude/nomad/command/agent/http.go#L364) |
| `ResolveToken` | `s *HTTPServer` | `req *http.Request` | `*acl.ACL, error` | [L374](file:///d:/claude/nomad/command/agent/http.go#L374) |
| `registerHandlers` | `s *HTTPServer` | `enableDebug bool` | - | [L404](file:///d:/claude/nomad/command/agent/http.go#L404) |
| `newBuiltinAPI` | - | - | `*builtinAPI` | [L595](file:///d:/claude/nomad/command/agent/http.go#L595) |
| `SetServer` | `b *builtinAPI` | `srv *http.Server` | - | [L604](file:///d:/claude/nomad/command/agent/http.go#L604) |
| `Serve` | `b *builtinAPI` | `ctx context.Context, l net.Listener` | `error` | [L622](file:///d:/claude/nomad/command/agent/http.go#L622) |
| `Shutdown` | `b *builtinAPI` | - | - | [L634](file:///d:/claude/nomad/command/agent/http.go#L634) |
| `Open` | `fs *UIAssetWrapper` | `name string` | `http.File, error` | [L659](file:///d:/claude/nomad/command/agent/http.go#L659) |
| `CodedError` | - | `c int, s string` | `HTTPCodedError` | [L671](file:///d:/claude/nomad/command/agent/http.go#L671) |
| `Error` | `e *codedError` | - | `string` | [L680](file:///d:/claude/nomad/command/agent/http.go#L680) |
| `Code` | `e *codedError` | - | `int` | [L684](file:///d:/claude/nomad/command/agent/http.go#L684) |
| `handleUI` | `s *HTTPServer` | `policy *config.ContentSecurityPolicy, h http.Handler` | `http.Handler` | [L688](file:///d:/claude/nomad/command/agent/http.go#L688) |
| `handleRootFallthrough` | `s *HTTPServer` | - | `http.Handler` | [L696](file:///d:/claude/nomad/command/agent/http.go#L696) |
| `errCodeFromHandler` | - | `err error` | `int, string` | [L710](file:///d:/claude/nomad/command/agent/http.go#L710) |
| `wrap` | `s *HTTPServer` | `handler handlerFn` | `func(...)` | [L740](file:///d:/claude/nomad/command/agent/http.go#L740) |
| `wrapNonJSON` | `s *HTTPServer` | `handler func(...)` | `func(...)` | [L832](file:///d:/claude/nomad/command/agent/http.go#L832) |
| `isAPIClientError` | - | `code int` | `bool` | [L865](file:///d:/claude/nomad/command/agent/http.go#L865) |
| `decodeBody` | - | `req *http.Request, out interface{}` | `error` | [L870](file:///d:/claude/nomad/command/agent/http.go#L870) |
| `setIndex` | - | `resp http.ResponseWriter, index uint64` | - | [L881](file:///d:/claude/nomad/command/agent/http.go#L881) |
| `setKnownLeader` | - | `resp http.ResponseWriter, known bool` | - | [L886](file:///d:/claude/nomad/command/agent/http.go#L886) |
| `setLastContact` | - | `resp http.ResponseWriter, last time.Duration` | - | [L895](file:///d:/claude/nomad/command/agent/http.go#L895) |
| `setNextToken` | - | `resp http.ResponseWriter, nextToken string` | - | [L901](file:///d:/claude/nomad/command/agent/http.go#L901) |
| `setMeta` | - | `resp http.ResponseWriter, m *structs.QueryMeta` | - | [L908](file:///d:/claude/nomad/command/agent/http.go#L908) |
| `setHeaders` | - | `resp http.ResponseWriter, headers map[string]string` | - | [L916](file:///d:/claude/nomad/command/agent/http.go#L916) |
| `parseWait` | - | `resp http.ResponseWriter, req *http.Request, b *structs.QueryOptions` | `bool` | [L924](file:///d:/claude/nomad/command/agent/http.go#L924) |
| `parseConsistency` | - | `resp http.ResponseWriter, req *http.Request, b *structs.QueryOptions` | `error` | [L950](file:///d:/claude/nomad/command/agent/http.go#L950) |
| `parsePrefix` | - | `req *http.Request, b *structs.QueryOptions` | - | [L971](file:///d:/claude/nomad/command/agent/http.go#L971) |
| `parseRegion` | `s *HTTPServer` | `req *http.Request, r *string` | - | [L979](file:///d:/claude/nomad/command/agent/http.go#L979) |
| `parseNamespace` | - | `req *http.Request, n *string` | - | [L988](file:///d:/claude/nomad/command/agent/http.go#L988) |
| `parseIdempotencyToken` | - | `req *http.Request, n *string` | - | [L997](file:///d:/claude/nomad/command/agent/http.go#L997) |
| `parseBool` | - | `req *http.Request, field string` | `*bool, error` | [L1005](file:///d:/claude/nomad/command/agent/http.go#L1005) |
| `parseInt` | - | `req *http.Request, field string` | `*int, error` | [L1019](file:///d:/claude/nomad/command/agent/http.go#L1019) |
| `parseToken` | `s *HTTPServer` | `req *http.Request, token *string` | - | [L1031](file:///d:/claude/nomad/command/agent/http.go#L1031) |
| `parse` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, r *string, b *structs.QueryOpti...` | `bool` | [L1073](file:///d:/claude/nomad/command/agent/http.go#L1073) |
| `parsePagination` | - | `resp http.ResponseWriter, req *http.Request, b *structs.QueryOptions` | `error` | [L1090](file:///d:/claude/nomad/command/agent/http.go#L1090) |
| `parseFilter` | - | `req *http.Request, b *structs.QueryOptions` | - | [L1110](file:///d:/claude/nomad/command/agent/http.go#L1110) |
| `parseReverse` | - | `req *http.Request, b *structs.QueryOptions` | - | [L1118](file:///d:/claude/nomad/command/agent/http.go#L1118) |
| `parseNode` | - | `req *http.Request, nodeID *string` | - | [L1124](file:///d:/claude/nomad/command/agent/http.go#L1124) |
| `parseNodeListStubFields` | - | `req *http.Request` | `*structs.NodeStubFields, error` | [L1132](file:///d:/claude/nomad/command/agent/http.go#L1132) |
| `parseWriteRequest` | `s *HTTPServer` | `req *http.Request, w *structs.WriteRequest` | - | [L1158](file:///d:/claude/nomad/command/agent/http.go#L1158) |
| `wrapUntrustedContent` | `s *HTTPServer` | `handler handlerFn` | `handlerFn` | [L1168](file:///d:/claude/nomad/command/agent/http.go#L1168) |
| `wrapCORS` | - | `f func(...)` | `http.Handler` | [L1188](file:///d:/claude/nomad/command/agent/http.go#L1188) |
| `wrapCORSWithAllowedMethods` | - | `f func(...), methods ...string` | `http.Handler` | [L1194](file:///d:/claude/nomad/command/agent/http.go#L1194) |
| `newAuthMiddleware` | - | `srv *HTTPServer, h http.Handler` | `http.Handler` | [L1207](file:///d:/claude/nomad/command/agent/http.go#L1207) |
| `ServeHTTP` | `a *authMiddleware` | `resp http.ResponseWriter, req *http.Request` | - | [L1214](file:///d:/claude/nomad/command/agent/http.go#L1214) |

## 5. HTTP API 端点

该文件注册了以下 94 个 HTTP 路由（通过 `s.mux.HandleFunc` 在 `http.go` 的 `registerHandlers` 中注册）：

| 路径 | 处理函数 | 行号 |
|------|---------|------|
| `/v1/jobs` | `JobsRequest` | [L405](file:///d:/claude/nomad/command/agent/http.go#L405) |
| `/v1/jobs/parse` | `JobsParseRequest` | [L406](file:///d:/claude/nomad/command/agent/http.go#L406) |
| `/v1/jobs/statuses` | `JobStatusesRequest` | [L407](file:///d:/claude/nomad/command/agent/http.go#L407) |
| `/v1/job/` | `JobSpecificRequest` | [L408](file:///d:/claude/nomad/command/agent/http.go#L408) |
| `/v1/nodes` | `NodesRequest` | [L410](file:///d:/claude/nomad/command/agent/http.go#L410) |
| `/v1/node/` | `NodeSpecificRequest` | [L411](file:///d:/claude/nomad/command/agent/http.go#L411) |
| `/v1/node/pools` | `NodePoolsRequest` | [L413](file:///d:/claude/nomad/command/agent/http.go#L413) |
| `/v1/node/pool/` | `NodePoolSpecificRequest` | [L414](file:///d:/claude/nomad/command/agent/http.go#L414) |
| `/v1/allocations` | `AllocsRequest` | [L416](file:///d:/claude/nomad/command/agent/http.go#L416) |
| `/v1/allocation/` | `AllocSpecificRequest` | [L417](file:///d:/claude/nomad/command/agent/http.go#L417) |
| `/v1/evaluations` | `EvalsRequest` | [L419](file:///d:/claude/nomad/command/agent/http.go#L419) |
| `/v1/evaluations/count` | `EvalsCountRequest` | [L420](file:///d:/claude/nomad/command/agent/http.go#L420) |
| `/v1/evaluation/` | `EvalSpecificRequest` | [L421](file:///d:/claude/nomad/command/agent/http.go#L421) |
| `/v1/deployments` | `DeploymentsRequest` | [L423](file:///d:/claude/nomad/command/agent/http.go#L423) |
| `/v1/deployment/` | `DeploymentSpecificRequest` | [L424](file:///d:/claude/nomad/command/agent/http.go#L424) |
| `GET /v1/volumes` | `ListVolumesRequest` | [L426](file:///d:/claude/nomad/command/agent/http.go#L426) |
| `/v1/volumes` | `CSIVolumesRequest` | [L427](file:///d:/claude/nomad/command/agent/http.go#L427) |
| `/v1/volumes/external` | `CSIExternalVolumesRequest` | [L428](file:///d:/claude/nomad/command/agent/http.go#L428) |
| `/v1/volumes/snapshot` | `CSISnapshotsRequest` | [L429](file:///d:/claude/nomad/command/agent/http.go#L429) |
| `/v1/volume/csi/` | `CSIVolumeSpecificRequest` | [L430](file:///d:/claude/nomad/command/agent/http.go#L430) |
| `/v1/plugins` | `CSIPluginsRequest` | [L431](file:///d:/claude/nomad/command/agent/http.go#L431) |
| `/v1/plugin/csi/` | `CSIPluginSpecificRequest` | [L432](file:///d:/claude/nomad/command/agent/http.go#L432) |
| `/v1/volume/host/` | `HostVolumeSpecificRequest` | [L433](file:///d:/claude/nomad/command/agent/http.go#L433) |
| `/v1/volumes/claims` | `TaskGroupHostVolumeClaimListRequest` | [L434](file:///d:/claude/nomad/command/agent/http.go#L434) |
| `/v1/volumes/claim/` | `TaskGroupHostVolumeClaimRequest` | [L435](file:///d:/claude/nomad/command/agent/http.go#L435) |
| `/v1/acl/policies` | `ACLPoliciesRequest` | [L437](file:///d:/claude/nomad/command/agent/http.go#L437) |
| `/v1/acl/policy/` | `ACLPolicySpecificRequest` | [L438](file:///d:/claude/nomad/command/agent/http.go#L438) |
| `/v1/acl/token/onetime` | `UpsertOneTimeToken` | [L440](file:///d:/claude/nomad/command/agent/http.go#L440) |
| `/v1/acl/token/onetime/exchange` | `ExchangeOneTimeToken` | [L441](file:///d:/claude/nomad/command/agent/http.go#L441) |
| `/v1/acl/bootstrap` | `ACLTokenBootstrap` | [L442](file:///d:/claude/nomad/command/agent/http.go#L442) |
| `/v1/acl/tokens` | `ACLTokensRequest` | [L443](file:///d:/claude/nomad/command/agent/http.go#L443) |
| `/v1/acl/token` | `ACLTokenSpecificRequest` | [L444](file:///d:/claude/nomad/command/agent/http.go#L444) |
| `/v1/acl/token/` | `ACLTokenSpecificRequest` | [L445](file:///d:/claude/nomad/command/agent/http.go#L445) |
| `/v1/acl/roles` | `ACLRoleListRequest` | [L448](file:///d:/claude/nomad/command/agent/http.go#L448) |
| `/v1/acl/role` | `ACLRoleRequest` | [L449](file:///d:/claude/nomad/command/agent/http.go#L449) |
| `/v1/acl/role/` | `ACLRoleSpecificRequest` | [L450](file:///d:/claude/nomad/command/agent/http.go#L450) |
| `/v1/acl/auth-methods` | `ACLAuthMethodListRequest` | [L453](file:///d:/claude/nomad/command/agent/http.go#L453) |
| `/v1/acl/auth-method` | `ACLAuthMethodRequest` | [L454](file:///d:/claude/nomad/command/agent/http.go#L454) |
| `/v1/acl/auth-method/` | `ACLAuthMethodSpecificRequest` | [L455](file:///d:/claude/nomad/command/agent/http.go#L455) |
| `/v1/acl/binding-rules` | `ACLBindingRuleListRequest` | [L458](file:///d:/claude/nomad/command/agent/http.go#L458) |
| `/v1/acl/binding-rule` | `ACLBindingRuleRequest` | [L459](file:///d:/claude/nomad/command/agent/http.go#L459) |
| `/v1/acl/binding-rule/` | `ACLBindingRuleSpecificRequest` | [L460](file:///d:/claude/nomad/command/agent/http.go#L460) |
| `/v1/acl/oidc/auth-url` | `ACLOIDCAuthURLRequest` | [L463](file:///d:/claude/nomad/command/agent/http.go#L463) |
| `/v1/acl/oidc/complete-auth` | `ACLOIDCCompleteAuthRequest` | [L464](file:///d:/claude/nomad/command/agent/http.go#L464) |
| `/v1/acl/login` | `ACLLoginRequest` | [L465](file:///d:/claude/nomad/command/agent/http.go#L465) |
| `/v1/acl/identity/client-introduction-token` | `ACLCreateClientIntroductionTokenRequest` | [L466](file:///d:/claude/nomad/command/agent/http.go#L466) |
| `/v1/client/fs/` | `FsRequest` | [L468](file:///d:/claude/nomad/command/agent/http.go#L468) |
| `/v1/client/gc` | `ClientGCRequest` | [L469](file:///d:/claude/nomad/command/agent/http.go#L469) |
| `/v1/client/stats` | `ClientStatsRequest` | [L470](file:///d:/claude/nomad/command/agent/http.go#L470) |
| `/v1/client/allocation/` | `ClientAllocRequest` | [L471](file:///d:/claude/nomad/command/agent/http.go#L471) |
| `/v1/client/metadata` | `NodeMetaRequest` | [L472](file:///d:/claude/nomad/command/agent/http.go#L472) |
| `/v1/client/identity` | `NodeIdentityGetRequest` | [L473](file:///d:/claude/nomad/command/agent/http.go#L473) |
| `/v1/client/identity/renew` | `NodeIdentityRenewRequest` | [L474](file:///d:/claude/nomad/command/agent/http.go#L474) |
| `/v1/agent/self` | `AgentSelfRequest` | [L476](file:///d:/claude/nomad/command/agent/http.go#L476) |
| `/v1/agent/join` | `AgentJoinRequest` | [L477](file:///d:/claude/nomad/command/agent/http.go#L477) |
| `/v1/agent/members` | `AgentMembersRequest` | [L478](file:///d:/claude/nomad/command/agent/http.go#L478) |
| `/v1/agent/force-leave` | `AgentForceLeaveRequest` | [L479](file:///d:/claude/nomad/command/agent/http.go#L479) |
| `/v1/agent/servers` | `AgentServersRequest` | [L480](file:///d:/claude/nomad/command/agent/http.go#L480) |
| `/v1/agent/schedulers` | `AgentSchedulerWorkerInfoRequest` | [L481](file:///d:/claude/nomad/command/agent/http.go#L481) |
| `/v1/agent/schedulers/config` | `AgentSchedulerWorkerConfigRequest` | [L482](file:///d:/claude/nomad/command/agent/http.go#L482) |
| `/v1/agent/keyring/` | `KeyringOperationRequest` | [L483](file:///d:/claude/nomad/command/agent/http.go#L483) |
| `/v1/agent/health` | `HealthRequest` | [L484](file:///d:/claude/nomad/command/agent/http.go#L484) |
| `/v1/agent/host` | `AgentHostRequest` | [L485](file:///d:/claude/nomad/command/agent/http.go#L485) |
| `/v1/agent/reload` | `AgentReloadRequest` | [L486](file:///d:/claude/nomad/command/agent/http.go#L486) |
| `/v1/services` | `ServiceRegistrationListRequest` | [L489](file:///d:/claude/nomad/command/agent/http.go#L489) |
| `/v1/service/` | `ServiceRegistrationRequest` | [L490](file:///d:/claude/nomad/command/agent/http.go#L490) |
| `/v1/agent/monitor` | `AgentMonitor` | [L497](file:///d:/claude/nomad/command/agent/http.go#L497) |
| `/v1/agent/monitor/export` | `AgentMonitorExport` | [L498](file:///d:/claude/nomad/command/agent/http.go#L498) |
| `/v1/metrics` | `MetricsRequest` | [L502](file:///d:/claude/nomad/command/agent/http.go#L502) |
| `/v1/validate/job` | `ValidateJobRequest` | [L504](file:///d:/claude/nomad/command/agent/http.go#L504) |
| `/v1/regions` | `RegionListRequest` | [L506](file:///d:/claude/nomad/command/agent/http.go#L506) |
| `/v1/scaling/policies` | `ScalingPoliciesRequest` | [L508](file:///d:/claude/nomad/command/agent/http.go#L508) |
| `/v1/scaling/policy/` | `ScalingPolicySpecificRequest` | [L509](file:///d:/claude/nomad/command/agent/http.go#L509) |
| `/v1/status/leader` | `StatusLeaderRequest` | [L511](file:///d:/claude/nomad/command/agent/http.go#L511) |
| `/v1/status/peers` | `StatusPeersRequest` | [L512](file:///d:/claude/nomad/command/agent/http.go#L512) |
| `/v1/search/fuzzy` | `FuzzySearchRequest` | [L514](file:///d:/claude/nomad/command/agent/http.go#L514) |
| `/v1/search` | `SearchRequest` | [L515](file:///d:/claude/nomad/command/agent/http.go#L515) |
| `/v1/operator/license` | `LicenseRequest` | [L516](file:///d:/claude/nomad/command/agent/http.go#L516) |
| `/v1/operator/raft/` | `OperatorRequest` | [L517](file:///d:/claude/nomad/command/agent/http.go#L517) |
| `/v1/operator/keyring/` | `KeyringRequest` | [L518](file:///d:/claude/nomad/command/agent/http.go#L518) |
| `/v1/operator/autopilot/configuration` | `OperatorAutopilotConfiguration` | [L519](file:///d:/claude/nomad/command/agent/http.go#L519) |
| `/v1/operator/autopilot/health` | `OperatorServerHealth` | [L520](file:///d:/claude/nomad/command/agent/http.go#L520) |
| `/v1/operator/snapshot` | `SnapshotRequest` | [L521](file:///d:/claude/nomad/command/agent/http.go#L521) |
| `/v1/operator/upgrade-check/` | `UpgradeCheckRequest` | [L522](file:///d:/claude/nomad/command/agent/http.go#L522) |
| `/v1/operator/utilization` | `OperatorUtilizationRequest` | [L523](file:///d:/claude/nomad/command/agent/http.go#L523) |
| `/v1/system/gc` | `GarbageCollectRequest` | [L525](file:///d:/claude/nomad/command/agent/http.go#L525) |
| `/v1/system/reconcile/summaries` | `ReconcileJobSummaries` | [L526](file:///d:/claude/nomad/command/agent/http.go#L526) |
| `/v1/operator/scheduler/configuration` | `OperatorSchedulerConfiguration` | [L528](file:///d:/claude/nomad/command/agent/http.go#L528) |
| `/v1/event/stream` | `EventStream` | [L530](file:///d:/claude/nomad/command/agent/http.go#L530) |
| `/v1/namespaces` | `NamespacesRequest` | [L532](file:///d:/claude/nomad/command/agent/http.go#L532) |
| `/v1/namespace` | `NamespaceCreateRequest` | [L533](file:///d:/claude/nomad/command/agent/http.go#L533) |
| `/v1/namespace/` | `NamespaceSpecificRequest` | [L534](file:///d:/claude/nomad/command/agent/http.go#L534) |
| `/v1/vars` | `VariablesListRequest` | [L536](file:///d:/claude/nomad/command/agent/http.go#L536) |
| `/.well-known/openid-configuration` | `OIDCDiscoveryRequest` | [L541](file:///d:/claude/nomad/command/agent/http.go#L541) |

## 6. 核心方法详解

### Shutdown()

**签名**：`func (s *HTTPServer) Shutdown() `

**位置**：[L364](file:///d:/claude/nomad/command/agent/http.go#L364)

### Shutdown()

**签名**：`func (b *builtinAPI) Shutdown() `

**位置**：[L634](file:///d:/claude/nomad/command/agent/http.go#L634)

## 7. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `context` | 标准库 |
| `crypto/tls` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `net` | 标准库 |
| `net/http` | 标准库 |
| `net/http/pprof` | 标准库 |
| `os` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `sync/atomic` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/acl` | 内部包 |
| `github.com/hashicorp/nomad/client` | 内部包 |
| `github.com/hashicorp/nomad/command/agent/event` | 内部包 |
| `github.com/hashicorp/nomad/helper/noxssrw` | 内部包 |
| `github.com/hashicorp/nomad/helper/tlsutil` | 内部包 |
| `github.com/hashicorp/nomad/nomad` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs/config` | 内部包 |
| `github.com/elazarl/go-bindata-assetfs` | 第三方库 |
| `github.com/gorilla/handlers` | 第三方库 |
| `github.com/gorilla/websocket` | 第三方库 |
| `github.com/hashicorp/go-connlimit` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |
| `github.com/hashicorp/go-msgpack/v2/codec` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/rs/cors` | 第三方库 |
| `golang.org/x/time/rate` | 第三方库 |

## 8. 设计模式与技术特点

- **接口抽象**：定义接口类型以解耦组件依赖，便于测试和替换实现
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex` 保护共享状态的并发访问
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **REST API 端点**：注册了 94 个 HTTP 路由，遵循 RESTful 设计

## 9. 相关文件

| 文件 | 关系 |
|------|------|
| [http_test.go](file:///d:/claude/nomad/command/agent/http_test.go) | 对应测试文件 |
| [http_ce.go](file:///d:/claude/nomad/command/agent/http_ce.go) | 企业版/社区版变体 |
| [agent.go](file:///d:/claude/nomad/command/agent/agent.go) | Agent 核心实现 |
| [config.go](file:///d:/claude/nomad/command/agent/config.go) | 配置定义 |

