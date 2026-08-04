# Testing

> 测试策略与 E2E 指南。所有测试通过 GNUmakefile 入口。

## 测试分层

| 层级 | 命令 | 说明 |
|------|------|------|
| 单元测试（人类） | `make test` | `test-nomad` + `GOTEST_RERUN_FAILS=0`，不重试 |
| 单元测试（CI） | `make test-nomad` | gotestsum --rerun-fails=3，CI 默认 3 次重试 |
| 子模块测试 | `make test-nomad-module GOTEST_MOD=api` | 测试 api/jobspec2/tools 子模块（带 -race） |
| E2E | `make e2e-test` | 先 make dev，再 go test ./e2e（900s 超时） |
| Vault 兼容 | `make integration-test` | NOMAD_E2E_VAULTCOMPAT=1，900s |
| Consul 兼容 | `make integration-test-consul` | NOMAD_E2E_CONSULCOMPAT=1，900s |
| Client Intro | `make integration-test-client-intro` | NOMAD_E2E_CLIENT_INTRO=1，120s |
| UI 单元 | `make test-ui` | `pnpm -F nomad-ui test` |
| UI 截图 | `make ui-screenshots` | Docker 跑截图脚本 |

## 测试分组

单元测试按 5 个分组运行（[ci/test-core.json](../ci/test-core.json)）：

| 分组 | 包含 |
|------|------|
| **nomad** | `nomad`（核心 server） |
| **client** | `client` + `client/allocrunner/...` |
| **command** | `command`（CLI + agent） |
| **drivers** | `drivers/...` |
| **quick** | 辅助包集合：acl/client 子包/helper/internal/jobspec2/lib/nomad 子包/plugins/scheduler/... |

`GOTEST_GROUP` 默认为 `nomad client command drivers quick`，可单独跑某一组：

```bash
make test-nomad GOTEST_GROUP=nomad     # 仅 nomad 核心包
make test-nomad GOTEST_GROUP=quick     # 仅 quick 集合
```

包列表由 `tools/missing/main.go ci/test-core.json <group>` 解析。

## E2E 测试

[e2e/](../e2e/) — Go E2E 测试，先 `make dev` 构建 binary 再 `go test`。

### 目录组织（按域）

| 目录 | 覆盖 |
|------|------|
| [e2e/acl/](../e2e/acl/) | ACL 鉴权 |
| [e2e/csi/](../e2e/csi/) | CSI 卷（ebs/efs） |
| [e2e/docker/](../e2e/docker/) | docker driver |
| [e2e/connect/](../e2e/connect/) | Consul Connect |
| [e2e/cni/](../e2e/cni/) | CNI 网络 |
| [e2e/exec2/](../e2e/exec2/) | exec driver v2 |
| [e2e/rawexec/](../e2e/rawexec/) | rawexec driver |
| [e2e/podman/](../e2e/podman/) | podman driver |
| [e2e/keyring/](../e2e/keyring/) | encryption keyring |
| [e2e/metrics/](../e2e/metrics/) | metrics |
| [e2e/nodedrain/](../e2e/nodedrain/) | node drain |
| [e2e/periodic/](../e2e/periodic/) | periodic job |
| [e2e/scaling/](../e2e/scaling/) | autoscaling |
| [e2e/secret/](../e2e/secret/) | Vault secret |
| [e2e/spread/](../e2e/spread/) | spread scheduling |
| [e2e/isolation/](../e2e/isolation/) | task 隔离 |
| [e2e/allocexec/](../e2e/allocexec/) | alloc exec |
| [e2e/nomadexec/](../e2e/nomadexec/) | nomad exec |
| [e2e/pledge/](../e2e/pledge/) | pledge（OpenBSD） |
| [e2e/auth/](../e2e/auth/) | 认证 |
| [e2e/framework/](../e2e/framework/) | E2E 框架 |
| [e2e/e2eutil/](../e2e/e2eutil/) | 通用工具（acl/cli/job/node/wait） |

### E2E 工具

| 文件 | 作用 |
|------|------|
| [e2e/e2eutil/wait.go](../e2e/e2eutil/wait.go) | 等待 cluster/alloc/job 就绪 |
| [e2e/e2eutil/cli.go](../e2e/e2eutil/cli.go) | CLI 命令封装 |
| [e2e/e2eutil/job.go](../e2e/e2eutil/job.go) | Job 注册辅助 |
| [e2e/e2eutil/node.go](../e2e/e2eutil/node.go) | Node 操作辅助 |
| [e2e/e2eutil/acl.go](../e2e/e2eutil/acl.go) | ACL token 辅助 |
| [e2e/bin/run](../e2e/bin/run) | E2E 运行脚本 |
| [e2e/bin/update](../e2e/bin/update) | E2E 更新 baseline |

## 测试辅助包

| 路径 | 作用 |
|------|------|
| [nomad/testing.go](../nomad/testing.go) | Server/Client 测试工厂 |
| [nomad/mock/](../nomad/mock/) | mock Job/Alloc/Node/CSI |
| [client/testing.go](../client/testing.go) | Client 测试工厂 |
| [command/agent/testagent.go](../command/agent/testagent.go) | TestAgent（HTTP server + agent） |
| [testutil/](../testutil/) | 通用测试工具（file/server/tls/vault/wait） |
| [scheduler/integration/](../scheduler/integration/) | scheduler 集成测试夹具 |

## 前端测试（Ember）

| 类型 | 框架 | 配置 |
|------|------|------|
| 单元/集成 | QUnit + ember-qunit | `ui/testem.js` |
| Acceptance | ember-cli | `ui/tests/` |
| Mock | Mirage.js | [ui/mirage/](../ui/mirage/) |
| 截图 | Playwright（Docker） | [scripts/screenshots/](../scripts/screenshots/) |

## CI Pipeline

CI 配置在 `.github/workflows/`：
- 主测试流水线（多 OS × 多 group）
- E2E 流水线
- Vault/Consul 兼容性
- proto/HCL 格式检查
- changelog 完整性

CI 强制要求：
- `-race` 在集成/E2E 测试
- proto 与生成代码同步（`make check` 会校验）
- go mod tidy
- 隔离约束（command/api/jobspec2 包边界）

## 测试红线

来自 `make check` 与 `contributing/`：
- 新功能必须有单元测试
- E2E 测试必须清理 cluster 状态
- 共享状态必须加锁，测试必须带 `-race`
- proto 改动必须先 `make proto` 再 commit
- 不能用 `_ = fn()` 忽略错误
- hclog 调用必须通过 `hclogvet` 校验
