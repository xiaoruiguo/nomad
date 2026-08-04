# Operations

> 构建、测试、lint、调试操作指南。所有操作通过 GNUmakefile 入口。

## 构建

```bash
make dev                  # 构建 dev binary 到 bin/ 与 pkg/<os>_<arch>/nomad
make dev NOMAD_UI_TAG="ui"  # 嵌入 Ember UI（需先 make ember-dist）
make dev-debug            # 带 -gcflags "all=-N -l" 调试符号，无优化
make dev-static           # CGO_ENABLED=0 静态 binary
make release              # 构建 ALL_TARGETS 全部 release zip（pkg/<os>_<arch>.zip）
make release-static       # release + CGO_ENABLED=0
make prerelease           # 生成 release 所需静态资源（generate-all + ember-dist + static-assets）
```

**Build Tags**（GNUmakefile 默认）：
- `hashicorpmetrics` — 始终启用
- `ui` — 默认启用（除非设 `NOMAD_NO_UI=1`）
- `codegen_generated` + `release` — CI 构建 (`CI=true`) 或 prerelease/release 时启用
- `timetzdata` — Windows 构建时附加

**交叉编译**：`make pkg/linux_amd64/nomad`、`make pkg/darwin_arm64/nomad` 等。

## UI 构建

```bash
make ember-dist           # 编译 Ember UI 到 ui/dist/
make static-assets        # 用 go-bindata-assetfs 把 ui/dist/ 内嵌到 command/agent/bindata_assetfs.go
make dev-ui               # ember-dist + static-assets + make dev NOMAD_UI_TAG="ui"
make test-ui              # 运行 Ember 测试（pnpm -F nomad-ui test）
```

## 单元测试

```bash
make test                 # 人类用：gotestsum --rerun-fails=0（不重试）
make test-nomad           # CI 用：gotestsum --rerun-fails=3（默认 3 次重试）
make test-nomad GOTEST_GROUP="nomad"      # 仅 nomad 包
make test-nomad GOTEST_GROUP="client"     # client + client/allocrunner/...
make test-nomad GOTEST_GROUP="command"    # command 包
make test-nomad GOTEST_GROUP="drivers"    # drivers/...
make test-nomad GOTEST_GROUP="quick"      # 辅助/小包集合（见 ci/test-core.json）
make test-nomad-module GOTEST_MOD=api     # 测试子模块（api/、jobspec2/、tools/）
```

测试分组定义在 [ci/test-core.json](../ci/test-core.json)，通过 `tools/missing/main.go` 解析。

## E2E 与集成测试

```bash
make e2e-test                          # 先 make dev，再 go test ./e2e（900s 超时）
make e2e-test ENABLE_RACE=1            # 加 -race
make e2e-test VERBOSE=1                # 加 -v
make integration-test                  # Vault 兼容性（NOMAD_E2E_VAULTCOMPAT=1）
make integration-test-consul           # Consul 兼容性
make integration-test-client-intro     # Client Intro（120s 超时）
```

E2E 测试目录 [e2e/](../e2e/)，按域分子目录（acl/docker/csi/connect/...）。

## Lint 与格式化

```bash
make check                # 全套检查（lint + hclogvet + misspell + buf + hclfmt + mod tidy + 隔离校验）
make checkscripts         # shellcheck scripts/*.sh
make checkproto           # buf check lint + buf check breaking（对比 PROTO_COMPARE_TAG=v1.0.3）
make hclfmt               # 格式化所有 .hcl/.nomad/.tf
make tidy                 # go mod tidy（nomad + api + tools 子模块）
```

**`make check` 强制的隔离约束**（关键）：
- `command/` 不得 import `nomad/structs`
- `api/` 不得依赖 `nomad/` 任何内部包
- `jobspec2/` 不得依赖 nomad core（除 `nomad/api`）
- proto 文件必须与生成代码同步（`make proto` 后无 diff）
- HCL 文件必须格式化
- go mod 必须 tidy
- `helper/raftutil/` 的 msg type mapping 必须同步（`go generate`）

## 代码生成

```bash
make generate-all         # generate-structs + proto
make generate-structs     # go generate ./...
make proto                # buf generate（用 tools/buf/buf.yaml + buf.gen.yaml）
```

## 依赖安装

```bash
make bootstrap            # 安装全部构建/开发依赖（go install ...）
make deps                 # 构建/开发依赖
make lint-deps            # linter 依赖（golangci-lint v2.5.0、misspell、hclogvet）
make git-hooks            # 安装 dev/hooks/pre-push
```

## Vagrant 测试集群

```bash
make testcluster          # 用 Vagrant 起 3 server + 3 client 集群
make testcluster PROVIDER=virtualbox
```

Vagrantfile 在仓库根。

## 调试技巧

- **dev binary 路径**：`bin/nomad`（同时拷贝到 `$GOPATH/bin/nomad`）
- **UI 内嵌**：build tag `ui` 决定是否内嵌；`NOMAD_NO_UI=1` 排除 UI 减小 binary
- **CGO**：`CGO_ENABLED=1`（默认，因为依赖 sqlite 等）；`make dev-static` 用 `CGO_ENABLED=0`
- **proto 破坏性变更**：走新版本，原版本只允许加非破坏性内容
- **Raft 调试**：`nomad operator raft *` 系列命令（hidden）
- **测试包遗漏**：`make missing` 检查 `ci/test-core.json` 未覆盖的包
- **hclogvet**：校验 hclog 调用参数（防止格式串注入）

## 版本与发布

```bash
make version              # 查看当前版本
make cl                   # 创建 changelog entry（.changelog/<PR>.txt）
make changelog            # 从 .changelog/ 生成 CHANGELOG.md
make copywriteheaders     # 检查 license header
```

Release 流程：
1. `make prerelease` 生成静态资源
2. `make release` 交叉编译各平台 zip 到 `pkg/`
3. `.changelog/` PR 条目汇入 CHANGELOG.md

## 配置文件

| 文件 | 作用 |
|------|------|
| [GNUmakefile](../GNUmakefile) | 全部 make target 定义 |
| [ci/test-core.json](../ci/test-core.json) | 测试分组映射 |
| [.golangci.yml](../.golangci.yml) | golangci-lint 配置 |
| [tools/buf/buf.yaml](../tools/buf/buf.yaml) | buf proto lint/breaking 配置 |
| [.go-version](../.go-version) | Go 版本（1.25） |
| [Vagrantfile](../Vagrantfile) | 测试集群定义 |
| [contributing/](../contributing/) | 开发者文档（ai.md、cgo.md） |
