# Integrations

> 外部服务与第三方集成。

## Consul

Nomad 与 Consul 深度集成（可选，但生产推荐）：

| 能力 | 说明 | 源码 |
|------|------|------|
| **服务注册** | task 启动后注册到 Consul Catalog | [client/serviceregistration/](../client/serviceregistration/) |
| **Consul Connect** | Consul service mesh（sidecar proxy 注入） | `client/serviceregistration/consul/` + `command/agent/consul/` |
| **服务发现** | Nomad 自身通过 Consul 找 server/client | `nomad/serf.go`（Serf + Consul fallback） |
| **Config Entries** | Consul 配置条目（service-defaults/proxy-defaults） | [command/agent/consul/config_entries_testing.go](../command/agent/consul/config_entries_testing.go) |

配置：`command/agent/config.go` 的 `consul` 字段；测试夹具在 `command/agent/consul/*_testing.go`。

## Vault

Vault 集成用于 secret 注入：

| 能力 | 说明 | 源码 |
|------|------|------|
| **Token 生成** | per-alloc 派生 Vault token（renewable） | `client/vaultclient/` |
| **Template 渲染** | consul-template 风格渲染 secret 到文件 | [client/allocrunner/taskrunner/template/renderer/](../client/allocrunner/taskrunner/template/renderer/) |
| **WIM (Workload Identity)** | per-alloc JWT，外部认证 | `client/widmgr/` |

兼容性测试：`make integration-test`（NOMAD_E2E_VAULTCOMPAT=1）。

## Terraform

[terraform/](../terraform/) 提供 Nomad dev cluster 的 Terraform manifests（用于在公共云起 dev 集群）。生产参考 [Production Reference Architecture](https://developer.hashicorp.com/nomad/docs/deploy/production/reference-architecture)。

## CSI（Container Storage Interface）

Nomad 通过外部 CSI plugin 进程支持持久化存储：

| 概念 | 说明 | 源码 |
|------|------|------|
| **CSI Plugin** | 外部 driver 进程（controller + node） | [plugins/](../plugins/) + [api/csi.go](../api/csi.go) |
| **CSI Volume** | 持久化卷声明 | `nomad/volumewatcher/` |
| **Volume Watcher** | 监听 CSI 事件并同步状态 | [nomad/volumewatcher/](../nomad/volumewatcher/) |
| **Host Volume** | 节点本地目录卷（不走 CSI） | `client/hostvolumemanager/` |

API 端点：`/v1/volumes/csi/*`、`/v1/volumes/host/*`。

## Task Drivers

通过 `github.com/hashicorp/go-plugin` 加载，统一接口：

| Driver | 路径 | 适用 |
|--------|------|------|
| docker | [drivers/docker/](../drivers/docker/) | 容器（含 docklog 子进程日志旁路） |
| exec | [drivers/exec/](../drivers/exec/) | 隔离 POSIX 进程（cgroups/namespaces） |
| rawexec | [drivers/rawexec/](../drivers/rawexec/) | 不隔离的裸进程 |
| java | [drivers/java/](../drivers/java/) | JVM |
| qemu | [drivers/qemu/](../drivers/qemu/) | 虚拟机 |
| mock | [drivers/mock/](../drivers/mock/) | 测试用 |

外部 driver 通过 `plugin` 配置注册（`command/agent/config.go` 的 `plugin` 字段）。

## 设备插件（Device）

GPU/FPGA/TPU 等：

| 概念 | 说明 | 源码 |
|------|------|------|
| **Device Manager** | 客户端设备管理 | [client/devicemanager/](../client/devicemanager/) |
| **Fingerprint** | 设备探测与上报 | `client/fingerprint/` |
| **Allocation** | scheduler 按设备资源分配 | `scheduler/feasible/` |

## Serf（Gossip）

| 用途 | 范围 | 源码 |
|------|------|------|
| LAN gossip | Region 内成员管理 | [nomad/serf.go](../nomad/serf.go) |
| WAN gossip | 跨 Region 联邦 | [nomad/serf.go](../nomad/serf.go) |

## Raft 库

| 库 | 用途 |
|----|------|
| `github.com/hashicorp/raft` | 共识算法核心 |
| `github.com/hashicorp/raft-boltdb` | BoltDB log store |
| `github.com/hashicorp/raft-snapshotstore` | FileSnapshotStore |

详见 [nomad_raft.md](../nomad_raft.md) 和 `helper/raftutil/`。

## 其他关键依赖

| 库 | 用途 |
|----|------|
| `github.com/hashicorp/cli` | CLI 框架 |
| `github.com/hashicorp/go-hclog` | 结构化日志 |
| `github.com/hashicorp/go-plugin` | driver/device plugin 加载 |
| `github.com/hashicorp/go-msgpack/v2` | RPC codec（codecgen 加速） |
| `github.com/hashicorp/serf` | gossip 成员管理 |
| `github.com/hashicorp/memberlist` | gossip 底层库 |
| `github.com/armon/go-metrics` | metrics |
| `github.com/elazarl/go-bindata-assetfs` | UI 静态资源内嵌 |
| `github.com/prometheus/client_golang` | Prometheus metrics（`hashicorpmetrics` tag） |

## Web UI

| 路径 | 框架 | 说明 |
|------|------|------|
| `ui/` | Ember.js 6.12 | 原生 UI，build tag `ui` 时内嵌进 binary |
| `ui/mirage/` | Mirage.js | 测试 mock |

UI 通过 `/v1/*` REST API + WebSocket（event stream、exec、stats）与 Server 交互。
