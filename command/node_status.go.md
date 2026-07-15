# node_status.go 代码说明文档

> 文件路径：[command/node_status.go](file:///d:/claude/nomad/command/node_status.go)
> 总行数：1097 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2025
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CLI 命令包**（`command/`），实现 `nomad node_status` 命令，通过 Nomad API 客户端与 Server 交互，提供作业管理、节点查询、集群运维等命令行功能。

## 2. 类型定义

### NodeStatusCommand

**定义位置**：[L31](file:///d:/claude/nomad/command/node_status.go#L31)

**中文说明**：NodeStatusCommand 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeStatusCommand struct {
	Meta Meta
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `Meta` | 元数据 |
| `length` | `int` | — |
| `short` | `bool` | 布尔值 |
| `os` | `bool` | 布尔值 |
| `quiet` | `bool` | 布尔值 |
| `verbose` | `bool` | 布尔值 |
| `list_allocs` | `bool` | 布尔值 |
| `self` | `bool` | 布尔值 |
| `stats` | `bool` | 布尔值 |
| `json` | `bool` | 布尔值 |
| `perPage` | `int` | — |
| `pageToken` | `string` | 字符串 |
| `filter` | `string` | 字符串 |
| `tmpl` | `string` | 字符串 |
| `openURL` | `bool` | 布尔值 |

**关联方法**（21 个）：`Help`, `Synopsis`, `AutocompleteFlags`, `AutocompleteArgs`, `Name`, `Run`, `formatNode`, `outputAllocInfo`, `outputTruncatedNodeDriverInfo`, `outputNodeVolumeInfo`, `outputNodeNetworkInfo`, `outputNodeCSIVolumeInfo`, `outputNodeDriverInfo`, `outputNodeStatusEvents`, `outputNodeEvent`, `formatAttributes`, `formatDeviceAttributes`, `formatMeta`, `printCpuStats`, `printMemoryStats`, `printDiskStats`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `floatFormat` | `—` | `"#,###.##"` | — |
| `bytesPerMegabyte` | `—` | `1024 * 1024` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *NodeStatusCommand` | `` | `string` | [L49](file:///d:/claude/nomad/command/node_status.go#L49) |
| `Synopsis` | `c *NodeStatusCommand` | `` | `string` | [L114](file:///d:/claude/nomad/command/node_status.go#L114) |
| `AutocompleteFlags` | `c *NodeStatusCommand` | `` | `complete.Flags` | [L118](file:///d:/claude/nomad/command/node_status.go#L118) |
| `AutocompleteArgs` | `c *NodeStatusCommand` | `` | `complete.Predictor` | [L137](file:///d:/claude/nomad/command/node_status.go#L137) |
| `nodePredictor` | - | `factory ApiClientFactory, filter *set.Set[string]` | `complete.Predictor` | [L141](file:///d:/claude/nomad/command/node_status.go#L141) |
| `Name` | `c *NodeStatusCommand` | `` | `string` | [L156](file:///d:/claude/nomad/command/node_status.go#L156) |
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
| `outputNodeVolumeInfo` | `c *NodeStatusCommand` | `node *api.Node` | `` | [L665](file:///d:/claude/nomad/command/node_status.go#L665) |
| `outputNodeNetworkInfo` | `c *NodeStatusCommand` | `node *api.Node` | `` | [L686](file:///d:/claude/nomad/command/node_status.go#L686) |
| `outputNodeCSIVolumeInfo` | `c *NodeStatusCommand` | `client *api.Client, node *api.Node, runningAllocs []*api.Allocation` | `` | [L707](file:///d:/claude/nomad/command/node_status.go#L707) |
| `outputNodeDriverInfo` | `c *NodeStatusCommand` | `node *api.Node` | `` | [L769](file:///d:/claude/nomad/command/node_status.go#L769) |
| `outputNodeStatusEvents` | `c *NodeStatusCommand` | `node *api.Node` | `` | [L791](file:///d:/claude/nomad/command/node_status.go#L791) |
| `outputNodeEvent` | `c *NodeStatusCommand` | `events []*api.NodeEvent` | `` | [L796](file:///d:/claude/nomad/command/node_status.go#L796) |
| `formatEventSubsystem` | - | `subsystem string, driverName string` | `string` | [L819](file:///d:/claude/nomad/command/node_status.go#L819) |
| `formatEventDetails` | - | `details map[string]string` | `string` | [L829](file:///d:/claude/nomad/command/node_status.go#L829) |
| `formatAttributes` | `c *NodeStatusCommand` | `node *api.Node` | `` | [L837](file:///d:/claude/nomad/command/node_status.go#L837) |
| `formatDeviceAttributes` | `c *NodeStatusCommand` | `node *api.Node` | `` | [L853](file:///d:/claude/nomad/command/node_status.go#L853) |
| `formatMeta` | `c *NodeStatusCommand` | `node *api.Node` | `` | [L882](file:///d:/claude/nomad/command/node_status.go#L882) |
| `printCpuStats` | `c *NodeStatusCommand` | `hostStats *api.HostStats` | `` | [L887](file:///d:/claude/nomad/command/node_status.go#L887) |
| `printMemoryStats` | `c *NodeStatusCommand` | `hostStats *api.HostStats` | `` | [L902](file:///d:/claude/nomad/command/node_status.go#L902) |
| `printDiskStats` | `c *NodeStatusCommand` | `hostStats *api.HostStats` | `` | [L912](file:///d:/claude/nomad/command/node_status.go#L912) |
| `getRunningAllocs` | - | `client *api.Client, nodeID string` | `[]*api.Allocation, error` | [L931](file:///d:/claude/nomad/command/node_status.go#L931) |
| `getAllocatedResources` | - | `client *api.Client, runningAllocs []*api.Allocation, node *api.Node` | `[]string` | [L946](file:///d:/claude/nomad/command/node_status.go#L946) |
| `computeNodeTotalResources` | - | `node *api.Node` | `api.Resources` | [L978](file:///d:/claude/nomad/command/node_status.go#L978) |
| `getActualResources` | - | `client *api.Client, runningAllocs []*api.Allocation, node *api.Node` | `[]string, error` | [L991](file:///d:/claude/nomad/command/node_status.go#L991) |
| `getHostResources` | - | `hostStats *api.HostStats, node *api.Node` | `[]string, error` | [L1025](file:///d:/claude/nomad/command/node_status.go#L1025) |
| `formatNodeStubList` | - | `nodes []*api.NodeListStub, verbose bool` | `string` | [L1069](file:///d:/claude/nomad/command/node_status.go#L1069) |

## 5. 核心方法详解

### Run()

**签名**：`func (c *NodeStatusCommand) Run(args []string) int`

**位置**：[L158](file:///d:/claude/nomad/command/node_status.go#L158)

**中文说明**：运行对象的主循环。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `args` | `[]string` | 参数 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `int` | — |

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
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/api/contexts` | 内部包 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/dustin/go-humanize` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/posener/complete` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [node_status_test.go](file:///d:/claude/nomad/command/node_status_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/command/acl.go) | 同目录源文件 |
| [acl_auth_method.go](file:///d:/claude/nomad/command/acl_auth_method.go) | 同目录源文件 |
| [acl_auth_method_create.go](file:///d:/claude/nomad/command/acl_auth_method_create.go) | 同目录源文件 |
| [acl_auth_method_delete.go](file:///d:/claude/nomad/command/acl_auth_method_delete.go) | 同目录源文件 |
| [acl_auth_method_info.go](file:///d:/claude/nomad/command/acl_auth_method_info.go) | 同目录源文件 |

