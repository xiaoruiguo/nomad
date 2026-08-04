# API

> HTTP/gRPC API 概览。Nomad 暴露 HTTP `/v1/*` REST 与 gRPC 端点。

## HTTP API

| 路径 | 方法 | 文件 |
|------|------|------|
| `/v1/jobs` | GET/POST | [job_endpoint.go](../command/agent/job_endpoint.go) |
| `/v1/job/{id}` | GET/DELETE | [job_endpoint.go](../command/agent/job_endpoint.go) |
| `/v1/job/{id}/plan` | POST | [job_endpoint.go](../command/agent/job_endpoint.go) |
| `/v1/job/{id}/summary` | GET | [job_endpoint.go](../command/agent/job_endpoint.go) |
| `/v1/job/{id}/allocations` | GET | [alloc_endpoint.go](../command/agent/alloc_endpoint.go) |
| `/v1/job/{id}/evaluations` | GET | [eval_endpoint.go](../command/agent/eval_endpoint.go) |
| `/v1/job/{id}/deployments` | GET | [deployment_endpoint.go](../command/agent/deployment_endpoint.go) |
| `/v1/allocations` | GET | [alloc_endpoint.go](../command/agent/alloc_endpoint.go) |
| `/v1/allocation/{id}` | GET | [alloc_endpoint.go](../command/agent/alloc_endpoint.go) |
| `/v1/allocation/{id}/exec` | WebSocket | [websockets.go](../command/agent/websockets.go) |
| `/v1/evaluations` | GET | [eval_endpoint.go](../command/agent/eval_endpoint.go) |
| `/v1/evaluation/{id}` | GET/POST | [eval_endpoint.go](../command/agent/eval_endpoint.go) |
| `/v1/nodes` | GET | [node_endpoint.go](../command/agent/node_endpoint.go) |
| `/v1/node/{id}` | GET | [node_endpoint.go](../command/agent/node_endpoint.go) |
| `/v1/node/{id}/drain` | POST | [node_endpoint.go](../command/agent/node_endpoint.go) |
| `/v1/node/{id}/eligibility` | POST | [node_endpoint.go](../command/agent/node_endpoint.go) |
| `/v1/node/pools` | GET/POST | [node_pool_endpoint.go](../command/agent/node_pool_endpoint.go) |
| `/v1/node/pool/{name}` | GET/DELETE | [node_pool_endpoint.go](../command/agent/node_pool_endpoint.go) |
| `/v1/deployments` | GET | [deployment_endpoint.go](../command/agent/deployment_endpoint.go) |
| `/v1/deployment/{id}` | POST | [deployment_endpoint.go](../command/agent/deployment_endpoint.go) |
| `/v1/acl/tokens` | GET/POST | [acl_endpoint.go](../command/agent/acl_endpoint.go) |
| `/v1/acl/token/{id}` | GET/DELETE | [acl_endpoint.go](../command/agent/acl_endpoint.go) |
| `/v1/acl/policies` | GET/POST | [acl_endpoint.go](../command/agent/acl_endpoint.go) |
| `/v1/acl/policy/{name}` | GET/DELETE | [acl_endpoint.go](../command/agent/acl_endpoint.go) |
| `/v1/acl/roles` | GET/POST | [acl_endpoint.go](../command/agent/acl_endpoint.go) |
| `/v1/volumes/csi` | GET/POST | [csi_endpoint.go](../command/agent/csi_endpoint.go) |
| `/v1/volume/csi/{id}` | GET/DELETE | [csi_endpoint.go](../command/agent/csi_endpoint.go) |
| `/v1/volumes/host` | GET/POST | [host_volume_endpoint.go](../command/agent/host_volume_endpoint.go) |
| `/v1/volume/host/{id}` | GET/DELETE | [host_volume_endpoint.go](../command/agent/host_volume_endpoint.go) |
| `/v1/variables` | GET/POST | [variable_endpoint.go](../command/agent/variable_endpoint.go) |
| `/v1/var/{path}` | GET/PUT/DELETE | [variable_endpoint.go](../command/agent/variable_endpoint.go) |
| `/v1/namespaces` | GET/POST | [namespace_endpoint.go](../command/agent/namespace_endpoint.go) |
| `/v1/namespace/{name}` | GET/DELETE | [namespace_endpoint.go](../command/agent/namespace_endpoint.go) |
| `/v1/quota` | GET/POST | [quota_endpoint.go](../command/agent/quota_endpoint.go)（如有） |
| `/v1/search` | POST | [search_endpoint.go](../command/agent/search_endpoint.go) |
| `/v1/operator/raft/configuration` | GET | [operator_endpoint.go](../command/agent/operator_endpoint.go) |
| `/v1/operator/raft/peer` | POST/DELETE | [operator_endpoint.go](../command/agent/operator_endpoint.go) |
| `/v1/operator/snapshot` | GET | [operator_endpoint.go](../command/agent/operator_endpoint.go) |
| `/v1/operator/autoppilot` | GET/POST | [operator_endpoint.go](../command/agent/operator_endpoint.go) |
| `/v1/keyring/keys` | GET/POST | [keyring_endpoint.go](../command/agent/keyring_endpoint.go) |
| `/v1/regions` | GET | [region_endpoint.go](../command/agent/region_endpoint.go) |
| `/v1/status/leader` | GET | [status_endpoint.go](../command/agent/status_endpoint.go) |
| `/v1/status/members` | GET | [status_endpoint.go](../command/agent/status_endpoint.go) |
| `/v1/system/gc` | PUT | [system_endpoint.go](../command/agent/system_endpoint.go) |
| `/v1/system/reconcile/summaries` | POST | [system_endpoint.go](../command/agent/system_endpoint.go) |
| `/v1/event/stream` | WebSocket | [event_endpoint.go](../command/agent/event_endpoint.go) |
| `/v1/client/allocation/{id}/fs` | GET | [fs_endpoint.go](../command/agent/fs_endpoint.go) |
| `/v1/client/allocation/{id}/logs` | GET | [fs_endpoint.go](../command/agent/fs_endpoint.go) |
| `/v1/client/allocation/{id}/stats` | GET | [stats_endpoint.go](../command/agent/stats_endpoint.go) |
| `/v1/client/snapshot` | GET | [agent_endpoint.go](../command/agent/agent_endpoint.go) |
| `/v1/metrics` | GET | [metrics_endpoint.go](../command/agent/metrics_endpoint.go) |
| `/v1/services` | GET | [service_registration_endpoint.go](../command/agent/service_registration_endpoint.go) |
| `/v1/service/{name}` | GET | [service_registration_endpoint.go](../command/agent/service_registration_endpoint.go) |
| `/v1/scaling/policy` | GET | [scaling_endpoint.go](../command/agent/scaling_endpoint.go) |
| `/v1/scaling/policy/{id}` | GET | [scaling_endpoint.go](../command/agent/scaling_endpoint.go) |
| `/v1/meta` | GET | [meta_endpoint.go](../command/agent/meta_endpoint.go) |
| `/v1/internal/ui` | GET | `command/agent/` |

## 鉴权

- **Header**：`X-Nomad-Token: <acl-token>`
- **Query**：WebSocket 用 `?token=<acl-token>`
- **Anonymous**：未带 token 走 anonymous token（默认无权限，可配置 policy）
- **Management Token**：超级 token，绕过所有检查
- ACL 评估路径：HTTP wrapper → `nomad/auth/` → `acl/acl.go`

## gRPC

gRPC 主要用于 server-client 内部 RPC（[nomad/rpc.go](../nomad/rpc.go) + `noderp/server.go` 等），HTTP 包装在 `command/agent/http.go`。外部用户主要使用 HTTP API。

## Go API 客户端

`api/` 包（独立 `go.mod`）封装所有 HTTP 端点：

```go
import "github.com/hashicorp/nomad/api"

client, err := api.NewClient(api.DefaultConfig())
jobs := client.Jobs()
job := &api.Job{...}
resp, _, err := jobs.Register(job, nil)
```

详见 [api.go](../api/api.go) 与 [nomad_api_usage.md](../nomad_api_usage.md)。

## 响应格式

- **成功**：直接返回 JSON（无包装）
- **错误**：`{ "error": "<message>" }` 或 HTTP 状态码（4xx/5xx）
- **Listing**：数组 + `X-Nomad-Index` header（Raft index，用于 blocking query）
- **Blocking Query**：`?index=<raft-index>&wait=<duration>` 长轮询

## Blocking Query 模式

几乎所有 GET 列表/单资源端点支持 blocking query：

```
GET /v1/jobs?index=100&wait=5m
# 阻塞最多 5 分钟，等到 index > 100 的变更或超时
# 响应带新的 X-Nomad-Index
```

## 路由结构

```
command/agent/http.go (RegisterHandlers)
├── /v1/*                          (REST API)
│   ├── 公开路由（status/regions/agent health）
│   └── 鉴权路由（jobs/allocs/nodes/...）
├── /v1/event/stream               (WebSocket)
├── /v1/client/allocation/{id}/exec (WebSocket exec)
├── /ui/                           (静态 UI 资源，build tag ui)
├── /metrics                       (Prometheus, hashicorpmetrics tag)
├── /debug/pprof                   (pprof)
└── /health                        (健康检查)
```

详见 [api.md (HashiCorp 官方)](https://developer.hashicorp.com/nomad/api-docs)。
