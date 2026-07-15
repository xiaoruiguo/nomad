# networking_cni.go 代码说明文档

> 文件路径：[allocrunner/networking_cni.go](file:///d:/claude/nomad/client/allocrunner/networking_cni.go)
> 总行数：794 行
> 所属包：`allocrunner`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`linux`

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），实现分配（Allocation）的运行生命周期管理，包括预启动钩子、网络配置、Consul 集成、CSI 卷挂载、健康检查等。AllocRunner 是 Client 节点上每个分配的控制器。

**构建标签**：`linux`

## 2. 类型定义

### cniNetworkConfigurator

**定义位置**：[L54](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L54)

**类型**：struct

```go
	cni cni.CNI
	confParser *cniConfParser
	ignorePortMappingHostIP bool
	nodeAttrs map[string]string
	nodeMeta map[string]string
	rand *rand.Rand
	logger log.Logger
	nsOpts *nsOpts
	newIPTables func(...)
```

**关联方法**（7 个）：`Setup`, `setupTransparentProxyArgs`, `dnsFromAttrs`, `cniToAllocNet`, `Teardown`, `forceCleanup`, `ensureCNIInitialized`

### cniConfParser

**定义位置**：[L533](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L533)

**类型**：struct

```go
	listBytes []byte
	confBytes []byte
```

**关联方法**（1 个）：`getOpt`

### nsOpts

**定义位置**：[L713](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L713)

**类型**：struct

```go
	args map[string]string
	ports []cni.PortMapping
```

**关联方法**（2 个）：`withArgs`, `withCapabilityPortMap`

### portMappings

**定义位置**：[L731](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L731)

**类型**：struct

```go
	ports []cni.PortMapping
	labels map[string]int
```

**关联方法**（2 个）：`set`, `get`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `envCNIPath` | `"CNI_PATH"` |
| `defaultCNIPath` | `"/opt/cni/bin"` |
| `defaultCNIInterfacePrefix` | `"eth"` |
| `ConsulIPTablesConfigEnvVar` | `"CONSUL_IPTABLES_CONFIG"` |

### 变量

| 名称 | 值 |
|------|----|
| `supportsCNICheck` | `mustCNICheckConstraint()` |
| `ipRuleRe` | `regexp.MustCompile(`-A POSTROUTING -s (\S+) -m comment --...` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newCNINetworkConfigurator` | - | `logger log.Logger, cniPath string, cniInterfacePrefix string, cniConfDir str...` | `*cniNetworkConfigurator, error` | [L66](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L66) |
| `newCNINetworkConfiguratorWithConf` | - | `logger log.Logger, cniPath string, cniInterfacePrefix string, ignorePortMapp...` | `*cniNetworkConfigurator, error` | [L75](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L75) |
| `addCustomCNIArgs` | - | `networks []*structs.NetworkResource, cniArgs map[string]string` | - | [L111](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L111) |
| `addNomadWorkloadCNIArgs` | - | `logger log.Logger, alloc *structs.Allocation, cniArgs map[string]string` | - | [L122](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L122) |
| `mustCNICheckConstraint` | - | - | `version.Constraints` | [L144](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L144) |
| `Setup` | `c *cniNetworkConfigurator` | `ctx context.Context, alloc *structs.Allocation, spec *drivers.NetworkIsolati...` | `*structs.AllocNetworkStatus, error` | [L153](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L153) |
| `setupTransparentProxyArgs` | `c *cniNetworkConfigurator` | `alloc *structs.Allocation, spec *drivers.NetworkIsolationSpec, portMaps *por...` | `*consulIPTables.Config, error` | [L266](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L266) |
| `dnsFromAttrs` | `c *cniNetworkConfigurator` | `cluster string` | `string, int` | [L413](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L413) |
| `cniToAllocNet` | `c *cniNetworkConfigurator` | `res *cni.Result` | `*structs.AllocNetworkStatus, error` | [L441](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L441) |
| `getOpt` | `c *cniConfParser` | - | `cni.Opt, error` | [L539](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L539) |
| `loadCNIConf` | - | `confDir string, name string` | `*cniConfParser, error` | [L551](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L551) |
| `Teardown` | `c *cniNetworkConfigurator` | `ctx context.Context, alloc *structs.Allocation, spec *drivers.NetworkIsolati...` | `error` | [L591](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L591) |
| `forceCleanup` | `c *cniNetworkConfigurator` | `ipt IPTablesCleanup, allocID string` | `error` | [L633](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L633) |
| `ensureCNIInitialized` | `c *cniNetworkConfigurator` | - | `error` | [L701](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L701) |
| `withArgs` | `o *nsOpts` | `args map[string]string` | `cni.NamespaceOpts` | [L718](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L718) |
| `withCapabilityPortMap` | `o *nsOpts` | `ports []cni.PortMapping` | `cni.NamespaceOpts` | [L723](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L723) |
| `set` | `pm *portMappings` | `label string, port cni.PortMapping` | - | [L736](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L736) |
| `get` | `pm *portMappings` | `label string` | `cni.PortMapping, bool` | [L741](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L741) |
| `getPortMapping` | - | `alloc *structs.Allocation, ignoreHostIP bool` | `*portMappings` | [L751](file:///d:/claude/nomad/client/allocrunner/networking_cni.go#L751) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `math/rand` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `regexp` | 标准库 |
| `slices` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/taskenv` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/envoy` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/containerd/go-cni` | 第三方库 |
| `github.com/containernetworking/cni/libcni` | 第三方库 |
| `github.com/hashicorp/consul/sdk/iptables` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/hashicorp/go-version` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [networking_cni_test.go](file:///d:/claude/nomad/client/allocrunner/networking_cni_test.go) | 对应测试文件 |

