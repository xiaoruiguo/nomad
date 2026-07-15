# node_status.go 代码说明文档

> 文件路径：[node_status.go](file:///d:/claude/nomad/command/node_status.go)
> 总行数：1097 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2025
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 Nomad CLI 命令 **`node status`**，功能简述：

> Display status information about nodes

## 2. 类型定义

### NodeStatusCommand

**类型**：struct

```go
	Meta
	length int
	short bool
	os bool
	quiet bool
	verbose bool
	list_allocs bool
	self bool
	stats bool
	json bool
	perPage int
	pageToken string
	filter string
	tmpl string
	openURL bool
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `floatFormat` | `"#,###.##"` |
| `bytesPerMegabyte` | `*ast.BinaryExpr` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *NodeStatusCommand` | - | `string` | [L49](file:///d:/claude/nomad/command/node_status.go#L49) |
| `Synopsis` | `c *NodeStatusCommand` | - | `string` | [L114](file:///d:/claude/nomad/command/node_status.go#L114) |
| `AutocompleteFlags` | `c *NodeStatusCommand` | - | `complete.Flags` | [L118](file:///d:/claude/nomad/command/node_status.go#L118) |
| `AutocompleteArgs` | `c *NodeStatusCommand` | - | `complete.Predictor` | [L137](file:///d:/claude/nomad/command/node_status.go#L137) |
| `nodePredictor` | - | `factory ApiClientFactory, filter **ast.IndexExpr` | `complete.Predictor` | [L141](file:///d:/claude/nomad/command/node_status.go#L141) |
| `Name` | `c *NodeStatusCommand` | - | `string` | [L156](file:///d:/claude/nomad/command/node_status.go#L156) |
| `Run` | `c *NodeStatusCommand` | `args []string` | `int` | [L158](file:///d:/claude/nomad/command/node_status.go#L158) |
| `nodeDrivers` | - | `n *api.Node` | `[]string` | [L389](file:///d:/claude/nomad/command/node_status.go#L389) |
| `nodeCSIControllerNames` | - | `n *api.Node` | `[]string` | [L409](file:///d:/claude/nomad/command/node_status.go#L409) |
| `nodeCSINodeNames` | - | `n *api.Node` | `[]string` | [L418](file:///d:/claude/nomad/command/node_status.go#L418) |
| `nodeCSIVolumeNames` | - | `allocs []*api.Allocation` | `[]string` | [L427](file:///d:/claude/nomad/command/node_status.go#L427) |
| `nodeVolumeNames` | - | `n *api.Node` | `[]string` | [L445](file:///d:/claude/nomad/command/node_status.go#L445) |
| `nodeNetworkNames` | - | `n *api.Node` | `[]string` | [L455](file:///d:/claude/nomad/command/node_status.go#L455) |
| `formatDrain` | - | `n *api.Node` | `string` | [L465](file:///d:/claude/nomad/command/node_status.go#L465) |
| `formatNode` | `c *NodeStatusCommand` | `client *api.Client, node *api.Node` | `int` | [L486](file:///d:/claude/nomad/command/node_status.go#L486) |
| `outputAllocInfo` | `c *NodeStatusCommand` | `node *api.Node, nodeAllocs []*api.Allocation` | `error` | [L634](file:///d:/claude/nomad/command/node_status.go#L634) |
| `outputTruncatedNodeDriverInfo` | `c *NodeStatusCommand` | `node *api.Node` | `string` | [L647](file:///d:/claude/nomad/command/node_status.go#L647) |
| `outputNodeVolumeInfo` | `c *NodeStatusCommand` | `node *api.Node` | - | [L665](file:///d:/claude/nomad/command/node_status.go#L665) |
| `outputNodeNetworkInfo` | `c *NodeStatusCommand` | `node *api.Node` | - | [L686](file:///d:/claude/nomad/command/node_status.go#L686) |
| `outputNodeCSIVolumeInfo` | `c *NodeStatusCommand` | `client *api.Client, node *api.Node, runningAllocs []*api.Allocation` | - | [L707](file:///d:/claude/nomad/command/node_status.go#L707) |
| `outputNodeDriverInfo` | `c *NodeStatusCommand` | `node *api.Node` | - | [L769](file:///d:/claude/nomad/command/node_status.go#L769) |
| `outputNodeStatusEvents` | `c *NodeStatusCommand` | `node *api.Node` | - | [L791](file:///d:/claude/nomad/command/node_status.go#L791) |
| `outputNodeEvent` | `c *NodeStatusCommand` | `events []*api.NodeEvent` | - | [L796](file:///d:/claude/nomad/command/node_status.go#L796) |
| `formatEventSubsystem` | - | `subsystem string, driverName string` | `string` | [L819](file:///d:/claude/nomad/command/node_status.go#L819) |
| `formatEventDetails` | - | `details map[string]string` | `string` | [L829](file:///d:/claude/nomad/command/node_status.go#L829) |
| `formatAttributes` | `c *NodeStatusCommand` | `node *api.Node` | - | [L837](file:///d:/claude/nomad/command/node_status.go#L837) |
| `formatDeviceAttributes` | `c *NodeStatusCommand` | `node *api.Node` | - | [L853](file:///d:/claude/nomad/command/node_status.go#L853) |
| `formatMeta` | `c *NodeStatusCommand` | `node *api.Node` | - | [L882](file:///d:/claude/nomad/command/node_status.go#L882) |
| `printCpuStats` | `c *NodeStatusCommand` | `hostStats *api.HostStats` | - | [L887](file:///d:/claude/nomad/command/node_status.go#L887) |
| `printMemoryStats` | `c *NodeStatusCommand` | `hostStats *api.HostStats` | - | [L902](file:///d:/claude/nomad/command/node_status.go#L902) |
| `printDiskStats` | `c *NodeStatusCommand` | `hostStats *api.HostStats` | - | [L912](file:///d:/claude/nomad/command/node_status.go#L912) |
| `getRunningAllocs` | - | `client *api.Client, nodeID string` | `[]*api.Allocation, error` | [L931](file:///d:/claude/nomad/command/node_status.go#L931) |
| `getAllocatedResources` | - | `client *api.Client, runningAllocs []*api.Allocation, node *api.Node` | `[]string` | [L946](file:///d:/claude/nomad/command/node_status.go#L946) |
| `computeNodeTotalResources` | - | `node *api.Node` | `api.Resources` | [L978](file:///d:/claude/nomad/command/node_status.go#L978) |
| `getActualResources` | - | `client *api.Client, runningAllocs []*api.Allocation, node *api.Node` | `[]string, error` | [L991](file:///d:/claude/nomad/command/node_status.go#L991) |
| `getHostResources` | - | `hostStats *api.HostStats, node *api.Node` | `[]string, error` | [L1025](file:///d:/claude/nomad/command/node_status.go#L1025) |
| `formatNodeStubList` | - | `nodes []*api.NodeListStub, verbose bool` | `string` | [L1069](file:///d:/claude/nomad/command/node_status.go#L1069) |

## 5. 核心方法详解

### Help()

**功能**：返回命令的帮助文本，包含用法说明和参数列表。

### Synopsis()

**简述**：`Display status information about nodes`

### AutocompleteFlags()

**功能**：为 shell 自动补全提供 flag 预测规则，返回 `complete.Flags` 映射。

### AutocompleteArgs()

**功能**：为 shell 自动补全提供参数预测规则。

### Name()

**命令名**：`node status`

### Run()

**签名**：`func (c *NodeStatusCommand) Run(args []string) int`

**行为**：执行命令核心逻辑，包括参数解析、API 调用、结果格式化输出。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `math` | 标准库 |
| `os` | 标准库 |
| `sort` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/dustin/go-humanize` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/api/contexts` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/posener/complete` | 第三方库 |

## 7. 设计模式与约定

该文件遵循 Nomad CLI 命令的标准实现模式：

1. **嵌入 Meta**：命令结构体嵌入 `Meta`，获取 API 客户端、UI 输出、flag 解析等通用能力
2. **实现 cli.Command 接口**：`Name()`、`Run()`、`Help()`、`Synopsis()` 四个必需方法
3. **可选自动补全**：实现 `AutocompleteFlags()` / `AutocompleteArgs()` 提供 shell 补全
4. **Flag 解析**：通过 `m.FlagSet()` 创建 flag 集，支持 `-address`、`-region`、`-namespace` 等通用 flag

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [meta.go](file:///d:/claude/nomad/command/meta.go) | `Meta` 结构体定义，提供通用 CLI 基础设施 |
| [helpers.go](file:///d:/claude/nomad/command/helpers.go) | CLI 辅助函数（格式化、Job 解析等） |
| [../api/api.go](file:///d:/claude/nomad/api/api.go) | Go API 客户端库 |
| [node_status_test.go](file:///d:/claude/nomad/command/node_status_test.go) | 对应测试文件 |
| [node.go](file:///d:/claude/nomad/command/node.go) | 父命令文件 |

