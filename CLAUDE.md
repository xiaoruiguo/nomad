# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

HashiCorp Nomad — 简单灵活的负载编排器，用于跨本地和云环境部署容器、非容器化应用和虚拟机。

- **版本**: v1.11.4-dev
- **Go 版本**: 1.25.8+ (go.mod), 构建所需版本见 `.go-version`
- **许可证**: BUSL-1.1 (api/, plugins/, drivers/shared/, jobspec2/, demo/ 使用 MPL-2.0)

## 构建与测试

```sh
# 开发构建
make dev                    # 构建当前平台开发版 ./bin/nomad
make dev-ui                 # 构建包含 Web UI 的开发版
make dev-static             # 构建 CGO_ENABLED=0 的开发版

# 测试（使用 gotestsum，失败重试 3 次）
make test                   # 运行单元测试（不重试失败）
make test-nomad             # 运行单元测试，GOTEST_GROUP 变量控制测试组
GOTEST_GROUP=quick make test-nomad   # 运行 quick 组测试
GOTEST_GROUP=nomad make test-nomad   # 运行核心 server 测试
GOTEST_GROUP=client make test-nomad  # 运行 client 测试

# 测试单个包（跳过 make 基础设施）
go test -tags "hashicorpmetrics" ./scheduler/...

# 子模块测试（api/ 等独立 go.mod）
make test-nomad-module GOTEST_MOD=api

# 端到端测试
make e2e-test               # 需要已存在的集群 + NOMAD_E2E=1

# 集成测试
make integration-test        # Vault 兼容性测试
make integration-test-consul # Consul 兼容性测试

# 代码质量
make check                  # 运行所有 linter（golangci-lint, hclogvet, 拼写检查, protobuf, HCL 格式, 包隔离检查, go.mod 整洁检查）
make checkscripts           # shellcheck shell 脚本

# 代码生成
make proto                  # 使用 buf 编译 .proto 文件
make generate-structs       # go generate
make generate-all           # 生成所有结构体和 protobuf

# 其他
make hclfmt                 # 格式化 HCL 文件
make tidy                   # 整理所有 go.mod
make cl                     # 创建 changelog 条目
make changelog              # 合并 changelog 条目
```

**测试组**（定义在 `ci/test-core.json`）:
- `quick` — 非核心包的快速测试（acl, helper, jobspec2, lib, scheduler 等）
- `nomad` — 核心 server 包
- `client` — 客户端包
- `command` — CLI 命令
- `drivers` — 驱动包

## 代码架构

### 核心控制流
```
# 读操作
Client -> HTTP API -> RPC -> StateStore

# 写操作（变更状态）
Client -> HTTP API -> RPC -> Raft -> FSM -> StateStore
```

### 三大组件
1. **Server** (`nomad/`): Raft 集群, 领导者选举, 评估代理, 调度器, RPC 处理
2. **Client** (`client/`): 分配执行, 任务驱动, 指纹识别, 心跳
3. **Agent** (`command/agent/`): 封装 Server+Client, HTTP API 服务器, 配置解析, Consul/Vault 集成

### 关键包
| 包 | 职责 |
|---|---|
| `nomad/` | 核心 server: RPC handlers, Raft 节点, eval broker, keyring |
| `nomad/state/` | 基于 memdb 的 MVCC 内存状态存储 |
| `nomad/structs/` | RPC 和状态存储的类型定义 |
| `scheduler/` | 调度逻辑（generic, system, batch）+ 可行性检查 |
| `client/` | 客户端逻辑 |
| `client/allocrunner/` | 分配管理器, 包含 Workload Identity, CSI, 网络等 hook |
| `client/allocrunner/taskrunner/` | 任务管理器, 调用 driver |
| `drivers/` | 内置驱动（docker, exec, raw_exec, java, qemu）|
| `command/` | CLI 命令实现（使用 hashicorp/cli）|
| `command/agent/` | HTTP API 服务器, 配置解析, Consul 集成 |
| `plugins/` | 任务驱动/设备驱动/CSI 驱动接口定义 |
| `api/` | 公开 Go SDK（独立 go.mod，不依赖内部包）|
| `acl/` | ACL 策略定义与鉴权 |
| `helper/` | 工具包（UUID, TLS, logger, pool, raft 等）|
| `lib/` | 数据结构（delay heap, auth, etc.）|
| `jobspec2/` | HCL2 jobspec 解析器（独立包，不依赖 Nomad 核心）|
| `e2e/` | 端到端集成测试 |
| `ui/` | Web UI (Ember.js) |

### 核心依赖
- **Raft**: hashicorp/raft, raft-boltdb/v2, raft-wal, raft-autopilot
- **状态存储**: hashicorp/go-memdb（内存 MVCC 数据库）
- **成员/发现**: hashicorp/serf, hashicorp/memberlist
- **消息编码**: hashicorp/go-msgpack/v2, net-rpc-msgpackrpc/v2
- **CLI**: hashicorp/cli
- **HCL**: hashicorp/hcl/v2

## 包隔离规则

- `api/` **不能**导入任何 `github.com/hashicorp/nomad/` 内部包
- `jobspec2/` 不能导入 `github.com/hashicorp/nomad/`（但可导入 `/api`）
- `command/` 不能导入 `nomad/structs`
- 以上规则由 `make check` 自动验证

## 构建标签

- `hashicorpmetrics` — 默认启用
- `codegen_generated` — CI 中启用
- `ui` — 嵌入 Web UI，`NOMAD_NO_UI` 禁用
- `release` — 发布构建
- `ent` — 企业版构建（社区版使用 `//go:build !ent` 占位文件）
- 平台相关: `linux`, `windows`, `unix`, `darwin`, `arm64`, `cgo`

## 测试规范（详见 `contributing/testing.md`）

- **断言库**: 优先使用 `github.com/shoenig/test/must`
- **并行测试**: 每个 `Test*` 函数以 `ci.Parallel(t)` 开头
- **环境管理**: 使用 `t.Setenv` 设置环境变量, `t.TempDir` 创建临时目录
- **日志**: 使用 `helper/testlog.HCLogger` 获取 `*testing.T` 绑定的 logger
- **端口分配**: 通过 `ci.PortAllocator.Grab()` 获取端口
- **API 包测试**: 需要预先执行 `make dev` 构建 Nomad 二进制文件

## 重要设计约束

- **状态存储不可变性**: 从 `StateStore` 读取的所有对象在修改前必须复制。非确定性值（时间戳、ID）必须作为参数传入，不能在工作流中生成。
- **Changelog**: 每个 PR 需在 `.changelog/` 中添加条目（`make cl` 创建，`make changelog` 合并）。
- **API 兼容性**: 只有 `api/` 和 `plugins/` 供外部导入。根模块不遵循 semver。

## 架构文档

`contributing/` 目录包含关键架构设计文档：
- `architecture-state-store.md` — 基于快照隔离的不可变状态存储
- `architecture-eval-lifecycle.md` — 作业注册到客户端分配的完整 eval 生命周期
- `architecture-eval-states.md` — 评估状态图
- `architecture-eval-triggers.md` — 评估触发器
- `architecture-drainer.md` — 节点排空机制
- `checklist-jobspec.md` / `checklist-command.md` / `checklist-rpc-endpoint.md` — 新增功能时的检查清单
