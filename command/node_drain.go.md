# node_drain.go 代码说明文档

> 文件路径：[command/node_drain.go](file:///d:/claude/nomad/command/node_drain.go)
> 总行数：386 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CLI 命令包**（`command/`），实现 `nomad node_drain` 命令，通过 Nomad API 客户端与 Server 交互，提供作业管理、节点查询、集群运维等命令行功能。

## 2. 类型定义

### NodeDrainCommand

**定义位置**：[L25](file:///d:/claude/nomad/command/node_drain.go#L25)

**中文说明**：NodeDrainCommand 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeDrainCommand struct {
	Meta Meta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `Meta` | 元数据 |

**关联方法**（7 个）：`Help`, `Synopsis`, `AutocompleteFlags`, `AutocompleteArgs`, `Name`, `Run`, `monitorDrain`

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `defaultDrainDuration` | `—` | `1 * time.Hour` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *NodeDrainCommand` | `` | `string` | [L29](file:///d:/claude/nomad/command/node_drain.go#L29) |
| `Synopsis` | `c *NodeDrainCommand` | `` | `string` | [L95](file:///d:/claude/nomad/command/node_drain.go#L95) |
| `AutocompleteFlags` | `c *NodeDrainCommand` | `` | `complete.Flags` | [L99](file:///d:/claude/nomad/command/node_drain.go#L99) |
| `AutocompleteArgs` | `c *NodeDrainCommand` | `` | `complete.Predictor` | [L118](file:///d:/claude/nomad/command/node_drain.go#L118) |
| `Name` | `c *NodeDrainCommand` | `` | `string` | [L133](file:///d:/claude/nomad/command/node_drain.go#L133) |
| `Run` | `c *NodeDrainCommand` | `args []string` | `int` | [L135](file:///d:/claude/nomad/command/node_drain.go#L135) |
| `monitorDrain` | `c *NodeDrainCommand` | `client *api.Client, ctx context.Context, node *api.Node, index uint64, ignore...` | `` | [L371](file:///d:/claude/nomad/command/node_drain.go#L371) |

## 5. 核心方法详解

### Run()

**签名**：`func (c *NodeDrainCommand) Run(args []string) int`

**位置**：[L135](file:///d:/claude/nomad/command/node_drain.go#L135)

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
| `context` | 标准库 |
| `fmt` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/api/contexts` | 内部包 |
| `github.com/hashicorp/nomad/helper/flags` | 内部包 |
| `github.com/posener/complete` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [node_drain_test.go](file:///d:/claude/nomad/command/node_drain_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/command/acl.go) | 同目录源文件 |
| [acl_auth_method.go](file:///d:/claude/nomad/command/acl_auth_method.go) | 同目录源文件 |
| [acl_auth_method_create.go](file:///d:/claude/nomad/command/acl_auth_method_create.go) | 同目录源文件 |
| [acl_auth_method_delete.go](file:///d:/claude/nomad/command/acl_auth_method_delete.go) | 同目录源文件 |
| [acl_auth_method_info.go](file:///d:/claude/nomad/command/acl_auth_method_info.go) | 同目录源文件 |



---

## Run 函数业务逻辑深度分析

> 分析文件：[node_drain.go](file:///d:/claude/nomad/command/node_drain.go)
> Run 函数数量：1

### 1. *NodeDrainCommand.Run

**定义位置**：[L135-L369](file:///d:/claude/nomad/command/node_drain.go#L135-L369)

**函数签名**：

```go
func (*NodeDrainCommand) Run(args []string) (int) {
    // ...
}
```

**业务逻辑要点**：

1. **命令行参数解析**：通过 `flags.Parse()` 解析 13 个命令行 flag
2. **参数校验**：存在错误退出路径，对输入参数进行校验，校验失败返回 1
3. **API 客户端初始化**：通过 `Meta.Client()` 获取 Nomad API 客户端，调用 3 个不同的 API 端点
4. **业务处理**：调用 API 获取数据后，通过 `Ui.Output()` / `Ui.Info()` 输出结果
5. **退出处理**：成功返回 0，失败返回 1

**命令行 Flag 解析**：

| 行号 | Flag名 | 说明 |
|------|--------|------|
| L144 | `enable` | 命令行参数 |
| L145 | `disable` | 命令行参数 |
| L146 | `deadline` | 命令行参数 |
| L147 | `detach` | 命令行参数 |
| L148 | `force` | 命令行参数 |
| L149 | `no-deadline` | 命令行参数 |
| L150 | `ignore-system` | 命令行参数 |
| L151 | `keep-ineligible` | 命令行参数 |
| L152 | `self` | 命令行参数 |
| L153 | `yes` | 命令行参数 |
| L154 | `monitor` | 命令行参数 |
| L155 | `m` | 命令行参数 |
| L156 | `meta` | 命令行参数 |

**关键调用链**：

| 行号 | 调用 | 说明 |
|------|------|------|
| L142 | `c.Meta.FlagSet` | 创建 flag 解析器 |
| L142 | `c.Name` | 业务调用 |
| L143 | `c.Help` | 业务调用 |
| L224 | `c.Meta.Client` | 获取 Nomad API 客户端 |
| L237 | `err.Error` | 输出错误信息 |
| L249 | `client.Nodes().PrefixList` | 调用 Nodes API |
| L249 | `client.Nodes` | 业务调用 |
| L266 | `client.Nodes().Info` | 调用 Nodes API |
| L266 | `client.Nodes` | 业务调用 |
| L279 | `c.monitorDrain` | 业务调用 |
| L279 | `context.Background` | 业务调用 |
| L343 | `client.Nodes().UpdateDrainOpts` | 调用 Nodes API |
| L343 | `client.Nodes` | 业务调用 |
| L366 | `c.monitorDrain` | 业务调用 |
| L366 | `context.Background` | 业务调用 |

**涉及的 Nomad API 端点**：

- `Nodes API.PrefixList`
- `Nodes API.Info`
- `Nodes API.UpdateDrainOpts`

**退出点分析**：

| 行号 | 退出代码 | 退出原因 |
|------|---------|---------|
| L159 | `return 1` | 错误退出 |
| L166 | `return 1` | 错误退出 |
| L173 | `return 1` | 错误退出 |
| L181 | `return 1` | 错误退出 |
| L188 | `return 1` | 错误退出 |
| L193 | `return 1` | 错误退出 |
| L198 | `return 1` | 错误退出 |
| L211 | `return 1` | 错误退出 |
| L215 | `return 1` | 错误退出 |
| L227 | `return 1` | 错误退出 |
| L238 | `return 1` | 错误退出 |
| L245 | `return 1` | 错误退出 |
| L252 | `return 1` | 错误退出 |
| L257 | `return 1` | 错误退出 |
| L262 | `return 1` | 错误退出 |
| L269 | `return 1` | 错误退出 |
| L276 | `return 0` | 成功退出 |
| L280 | `return 0` | 成功退出 |
| L293 | `return 1` | 错误退出 |
| L299 | `return 0` | 成功退出 |
| L303 | `return 0` | 成功退出 |
| L306 | `return 1` | 错误退出 |
| L351 | `return 1` | 错误退出 |
| L368 | `return 0` | 成功退出 |

**关键注释说明**：

| 行号 | 注释内容 |
|------|---------|
| L162 | Check that enable or disable is not set with monitor |
| L169 | Check that we got either enable or disable, but not both. |
| L176 | Check that we got a node ID |
| L184 | Validate a compatible set of flags were set |
| L201 | Parse the duration |
| L223 | Get the HTTP client |
| L230 | If -self flag is set then determine the current node. |
| L242 | Check if node exists |
| L254 | Return error if no nodes are found |
| L265 | Prefix lookup matched a single node |
| L272 | If monitoring the drain start the monitor and return when done |
| L283 | Confirm drain if the node was a prefix match. |
| L297 | No case |
| L301 | Non exact match yes |
| L318 | propagate drain metadata if cancelling |
| L342 | Toggle node draining |

