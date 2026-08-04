# Nomad Quickstart

> Agent 入口页。需要仓库上下文时先读本页，再按链接深入。

Nomad 是 HashiCorp 的 workload orchestrator，以单二进制运行 Server 和/或 Client，使用 Raft 共识保证强一致性，通过可插拔 driver（docker/exec/java/qemu/rawexec）调度容器与非容器化任务，跨 region 联邦，与 Consul/Vault/Terraform 协同。

## 构建与运行

所有操作通过 GNUmakefile 入口（CLAUDE.md 红线：禁止裸 `go build` / `docker build`）。

```bash
make help              # 列出全部 target
make dev               # 构建 dev binary 到 bin/ 与 pkg/<os>_<arch>/nomad（带 ui + hashicorpmetrics tag）
make dev NOMAD_UI_TAG="ui"   # 嵌入 Ember UI 静态资源
make dev-debug         # 带 -gcflags "all=-N -l" 的调试 binary
make dev-static        # CGO_ENABLED=0 静态 binary
make test              # 单元测试（不重试，人类用）
make test-nomad        # 单元测试（gotestsum --rerun-fails=3，CI 用）
make e2e-test          # E2E 测试（先 make dev 再 go test ./e2e）
make check             # golangci-lint + hclogvet + misspell + buf breaking + hclfmt + go mod tidy
make proto             # buf generate
make generate-structs  # go generate ./...
```

UI 开发：

```bash
cd ui && pnpm install       # 安装 Ember 依赖
make ember-dist             # 编译 UI 到 ui/dist/
make dev-ui                 # 编译并嵌入 UI 的 dev binary
make test-ui                # 运行 Ember 测试
```

## "Start here when…" 路由表

| 任务 | 去哪里 |
|------|--------|
| 理解整体架构与模块边界 | [architecture.md](architecture.md) |
| 追踪一个 Job 从提交到运行的链路 | [workflows.md](workflows.md) |
| 理解领域概念（Job/Alloc/Eval/Node） | [domain.md](domain.md) |
| 构建/测试/lint/调试 | [operations.md](operations.md) |
| Consul/Vault/CSI/Driver 集成 | [integrations.md](integrations.md) |
| 测试策略与 E2E | [testing.md](testing.md) |
| 找某个功能的源码位置 | [source-map.md](source-map.md) |
| HTTP/gRPC API 概览 | [api.md](api.md) |

## 技术栈速览

- **后端**: Go 1.25（见 `.go-version`），hashicorp/raft v1，hashicorp/serf（gossip），hashicorp/go-plugin（driver 插件），Yamux + TLS
- **前端**: Ember.js 6.12（`ui/`），pnpm 管理；build tag `ui` 时通过 `bindata_assetfs` 内嵌
- **存储**: BoltDB（Raft log store）+ FileSnapshotStore（FSM 快照）；状态由 FSM 持有
- **CLI**: `github.com/hashicorp/cli`，main.go → `command/` 分派
- **API**: HTTP `/v1/*` REST（`command/agent/http.go`）+ gRPC（TaskRunner/DeviceManager 等）
- **集成**: Consul（服务注册）、Vault（secrets）、Terraform（infra provisioning）、CSI（存储插件）
