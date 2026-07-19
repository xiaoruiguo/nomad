# node_eligibility.go 代码说明文档

> 文件路径：[command/node_eligibility.go](file:///d:/claude/nomad/command/node_eligibility.go)
> 总行数：170 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CLI 命令包**（`command/`），实现 `nomad node_eligibility` 命令，通过 Nomad API 客户端与 Server 交互，提供作业管理、节点查询、集群运维等命令行功能。

## 2. 类型定义

### NodeEligibilityCommand

**定义位置**：[L14](file:///d:/claude/nomad/command/node_eligibility.go#L14)

**中文说明**：NodeEligibilityCommand 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodeEligibilityCommand struct {
	Meta Meta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `Meta` | 元数据 |

**关联方法**（6 个）：`Help`, `Synopsis`, `AutocompleteFlags`, `AutocompleteArgs`, `Name`, `Run`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *NodeEligibilityCommand` | `` | `string` | [L18](file:///d:/claude/nomad/command/node_eligibility.go#L18) |
| `Synopsis` | `c *NodeEligibilityCommand` | `` | `string` | [L50](file:///d:/claude/nomad/command/node_eligibility.go#L50) |
| `AutocompleteFlags` | `c *NodeEligibilityCommand` | `` | `complete.Flags` | [L54](file:///d:/claude/nomad/command/node_eligibility.go#L54) |
| `AutocompleteArgs` | `c *NodeEligibilityCommand` | `` | `complete.Predictor` | [L63](file:///d:/claude/nomad/command/node_eligibility.go#L63) |
| `Name` | `c *NodeEligibilityCommand` | `` | `string` | [L78](file:///d:/claude/nomad/command/node_eligibility.go#L78) |
| `Run` | `c *NodeEligibilityCommand` | `args []string` | `int` | [L80](file:///d:/claude/nomad/command/node_eligibility.go#L80) |

## 5. 核心方法详解

### Run()

**签名**：`func (c *NodeEligibilityCommand) Run(args []string) int`

**位置**：[L80](file:///d:/claude/nomad/command/node_eligibility.go#L80)

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
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/api/contexts` | 内部包 |
| `github.com/posener/complete` | 第三方库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [node_eligibility_test.go](file:///d:/claude/nomad/command/node_eligibility_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/command/acl.go) | 同目录源文件 |
| [acl_auth_method.go](file:///d:/claude/nomad/command/acl_auth_method.go) | 同目录源文件 |
| [acl_auth_method_create.go](file:///d:/claude/nomad/command/acl_auth_method_create.go) | 同目录源文件 |
| [acl_auth_method_delete.go](file:///d:/claude/nomad/command/acl_auth_method_delete.go) | 同目录源文件 |
| [acl_auth_method_info.go](file:///d:/claude/nomad/command/acl_auth_method_info.go) | 同目录源文件 |



---

## Run 函数业务逻辑深度分析

> 分析文件：[node_eligibility.go](file:///d:/claude/nomad/command/node_eligibility.go)
> Run 函数数量：1

### 1. *NodeEligibilityCommand.Run

**定义位置**：[L80-L169](file:///d:/claude/nomad/command/node_eligibility.go#L80-L169)

**函数签名**：

```go
func (*NodeEligibilityCommand) Run(args []string) (int) {
    // ...
}
```

**业务逻辑要点**：

1. **命令行参数解析**：通过 `flags.Parse()` 解析 3 个命令行 flag
2. **参数校验**：存在错误退出路径，对输入参数进行校验，校验失败返回 1
3. **API 客户端初始化**：通过 `Meta.Client()` 获取 Nomad API 客户端，调用 3 个不同的 API 端点
4. **业务处理**：调用 API 获取数据后，通过 `Ui.Output()` / `Ui.Info()` 输出结果
5. **退出处理**：成功返回 0，失败返回 1

**命令行 Flag 解析**：

| 行号 | Flag名 | 说明 |
|------|--------|------|
| L85 | `enable` | 命令行参数 |
| L86 | `disable` | 命令行参数 |
| L87 | `self` | 命令行参数 |

**关键调用链**：

| 行号 | 调用 | 说明 |
|------|------|------|
| L83 | `c.Meta.FlagSet` | 创建 flag 解析器 |
| L83 | `c.Name` | 业务调用 |
| L84 | `c.Help` | 业务调用 |
| L109 | `c.Meta.Client` | 获取 Nomad API 客户端 |
| L122 | `err.Error` | 输出错误信息 |
| L134 | `client.Nodes().PrefixList` | 调用 Nodes API |
| L134 | `client.Nodes` | 业务调用 |
| L151 | `client.Nodes().Info` | 调用 Nodes API |
| L151 | `client.Nodes` | 业务调用 |
| L158 | `client.Nodes().ToggleEligibility` | 调用 Nodes API |
| L158 | `client.Nodes` | 业务调用 |

**涉及的 Nomad API 端点**：

- `Nodes API.PrefixList`
- `Nodes API.Info`
- `Nodes API.ToggleEligibility`

**退出点分析**：

| 行号 | 退出代码 | 退出原因 |
|------|---------|---------|
| L90 | `return 1` | 错误退出 |
| L97 | `return 1` | 错误退出 |
| L105 | `return 1` | 错误退出 |
| L112 | `return 1` | 错误退出 |
| L123 | `return 1` | 错误退出 |
| L130 | `return 1` | 错误退出 |
| L137 | `return 1` | 错误退出 |
| L142 | `return 1` | 错误退出 |
| L147 | `return 1` | 错误退出 |
| L154 | `return 1` | 错误退出 |
| L160 | `return 1` | 错误退出 |
| L168 | `return 0` | 成功退出 |

**关键注释说明**：

| 行号 | 注释内容 |
|------|---------|
| L93 | Check that we got either enable or disable, but not both. |
| L100 | Check that we got a node ID |
| L108 | Get the HTTP client |
| L115 | If -self flag is set then determine the current node. |
| L127 | Check if node exists |
| L139 | Return error if no nodes are found |
| L150 | Prefix lookup matched a single node |
| L157 | Toggle node eligibility |

