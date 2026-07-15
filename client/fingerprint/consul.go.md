# consul.go 代码说明文档

> 文件路径：[fingerprint/consul.go](file:///d:/claude/nomad/client/fingerprint/consul.go)
> 总行数：435 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。

## 2. 类型定义

### ConsulFingerprint

**定义位置**：[L33](file:///d:/claude/nomad/client/fingerprint/consul.go#L33)

**类型**：struct

```go
	logger hclog.Logger
	clusters map[string]*consulState
	initialResponse *FingerprintResponse
	initialResponseLock sync.RWMutex
```

**关联方法**（7 个）：`Fingerprint`, `readInitialResponse`, `setInitialResponse`, `fingerprintImpl`, `Periodic`, `Reload`, `link`

### consulState

**定义位置**：[L48](file:///d:/claude/nomad/client/fingerprint/consul.go#L48)

**类型**：struct

```go
	client *consulapi.Client
	readers map[string]valueReader
	fingerprintedOnce bool
	reportedOnce bool
```

**关联方法**（17 个）：`initialize`, `query`, `server`, `version`, `sku`, `revision`, `name`, `dc`, `segment`, `connect`, `grpc`, `grpcPort`, `grpcTLSPort`, `dnsPort`, `dnsAddr`, `namespaces`, `partition`

### valueReader

**定义位置**：[L66](file:///d:/claude/nomad/client/fingerprint/consul.go#L66)

**类型定义**：`func(...)`

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `consulGRPCPortChangeVersion` | `version.Must(version.NewVersion("1.14.0"))` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewConsulFingerprint` | - | `logger hclog.Logger` | `Fingerprint` | [L69](file:///d:/claude/nomad/client/fingerprint/consul.go#L69) |
| `Fingerprint` | `f *ConsulFingerprint` | `req *FingerprintRequest, resp *FingerprintResponse` | `error` | [L76](file:///d:/claude/nomad/client/fingerprint/consul.go#L76) |
| `readInitialResponse` | `f *ConsulFingerprint` | `resp *FingerprintResponse` | `bool` | [L111](file:///d:/claude/nomad/client/fingerprint/consul.go#L111) |
| `setInitialResponse` | `f *ConsulFingerprint` | `resp *FingerprintResponse` | - | [L121](file:///d:/claude/nomad/client/fingerprint/consul.go#L121) |
| `fingerprintImpl` | `f *ConsulFingerprint` | `cfg *config.ConsulConfig, resp *FingerprintResponse` | `error` | [L127](file:///d:/claude/nomad/client/fingerprint/consul.go#L127) |
| `Periodic` | `f *ConsulFingerprint` | - | `bool, time.Duration` | [L165](file:///d:/claude/nomad/client/fingerprint/consul.go#L165) |
| `Reload` | `f *ConsulFingerprint` | - | - | [L171](file:///d:/claude/nomad/client/fingerprint/consul.go#L171) |
| `initialize` | `cfs *consulState` | `cfg *config.ConsulConfig, logger hclog.Logger` | `error` | [L175](file:///d:/claude/nomad/client/fingerprint/consul.go#L175) |
| `query` | `cfs *consulState` | `logger hclog.Logger` | `agentconsul.Self` | [L227](file:///d:/claude/nomad/client/fingerprint/consul.go#L227) |
| `link` | `f *ConsulFingerprint` | `resp *FingerprintResponse` | - | [L244](file:///d:/claude/nomad/client/fingerprint/consul.go#L244) |
| `server` | `cfs *consulState` | `info agentconsul.Self` | `string, bool` | [L254](file:///d:/claude/nomad/client/fingerprint/consul.go#L254) |
| `version` | `cfs *consulState` | `info agentconsul.Self` | `string, bool` | [L259](file:///d:/claude/nomad/client/fingerprint/consul.go#L259) |
| `sku` | `cfs *consulState` | `info agentconsul.Self` | `string, bool` | [L264](file:///d:/claude/nomad/client/fingerprint/consul.go#L264) |
| `revision` | `cfs *consulState` | `info agentconsul.Self` | `string, bool` | [L268](file:///d:/claude/nomad/client/fingerprint/consul.go#L268) |
| `name` | `cfs *consulState` | `info agentconsul.Self` | `string, bool` | [L273](file:///d:/claude/nomad/client/fingerprint/consul.go#L273) |
| `dc` | `cfs *consulState` | `info agentconsul.Self` | `string, bool` | [L278](file:///d:/claude/nomad/client/fingerprint/consul.go#L278) |
| `segment` | `cfs *consulState` | `info agentconsul.Self` | `string, bool` | [L283](file:///d:/claude/nomad/client/fingerprint/consul.go#L283) |
| `connect` | `cfs *consulState` | `info agentconsul.Self` | `string, bool` | [L292](file:///d:/claude/nomad/client/fingerprint/consul.go#L292) |
| `grpc` | `cfs *consulState` | `scheme string, logger hclog.Logger` | `func(...)` | [L297](file:///d:/claude/nomad/client/fingerprint/consul.go#L297) |
| `grpcPort` | `cfs *consulState` | `info agentconsul.Self` | `string, bool` | [L332](file:///d:/claude/nomad/client/fingerprint/consul.go#L332) |
| `grpcTLSPort` | `cfs *consulState` | `info agentconsul.Self` | `string, bool` | [L337](file:///d:/claude/nomad/client/fingerprint/consul.go#L337) |
| `dnsPort` | `cfs *consulState` | `info agentconsul.Self` | `string, bool` | [L342](file:///d:/claude/nomad/client/fingerprint/consul.go#L342) |
| `dnsAddr` | `cfs *consulState` | `logger hclog.Logger` | `func(...)` | [L349](file:///d:/claude/nomad/client/fingerprint/consul.go#L349) |
| `namespaces` | `cfs *consulState` | `info agentconsul.Self` | `string, bool` | [L420](file:///d:/claude/nomad/client/fingerprint/consul.go#L420) |
| `partition` | `cfs *consulState` | `info agentconsul.Self` | `string, bool` | [L424](file:///d:/claude/nomad/client/fingerprint/consul.go#L424) |

## 5. 核心方法详解

### Fingerprint()

**签名**：`func (f *ConsulFingerprint) Fingerprint(req *FingerprintRequest, resp *FingerprintResponse) error`

**位置**：[L76](file:///d:/claude/nomad/client/fingerprint/consul.go#L76)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `net/netip` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/command/agent/consul` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs/config` | 内部包 |
| `github.com/hashicorp/consul/api` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-sockaddr` | 第三方库 |
| `github.com/hashicorp/go-version` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [consul_test.go](file:///d:/claude/nomad/client/fingerprint/consul_test.go) | 对应测试文件 |

