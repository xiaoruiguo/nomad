# alloc_stop.go 代码说明文档

> 文件路径：[command/alloc_stop.go](file:///d:/claude/nomad/command/alloc_stop.go)
> 总行数：182 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CLI 命令包**（`command/`），实现 `nomad alloc_stop` 命令，通过 Nomad API 客户端与 Server 交互，提供作业管理、节点查询、集群运维等命令行功能。

## 2. 类型定义

### AllocStopCommand

**定义位置**：[L15](file:///d:/claude/nomad/command/alloc_stop.go#L15)

**中文说明**：AllocStopCommand 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocStopCommand struct {
	Meta Meta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `Meta` | 元数据 |

**关联方法**（6 个）：`Help`, `Name`, `Run`, `Synopsis`, `AutocompleteFlags`, `AutocompleteArgs`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *AllocStopCommand` | `` | `string` | [L19](file:///d:/claude/nomad/command/alloc_stop.go#L19) |
| `Name` | `c *AllocStopCommand` | `` | `string` | [L58](file:///d:/claude/nomad/command/alloc_stop.go#L58) |
| `Run` | `c *AllocStopCommand` | `args []string` | `int` | [L60](file:///d:/claude/nomad/command/alloc_stop.go#L60) |
| `Synopsis` | `c *AllocStopCommand` | `` | `string` | [L155](file:///d:/claude/nomad/command/alloc_stop.go#L155) |
| `AutocompleteFlags` | `c *AllocStopCommand` | `` | `complete.Flags` | [L159](file:///d:/claude/nomad/command/alloc_stop.go#L159) |
| `AutocompleteArgs` | `c *AllocStopCommand` | `` | `complete.Predictor` | [L168](file:///d:/claude/nomad/command/alloc_stop.go#L168) |

## 5. 核心方法详解

### Run()

**签名**：`func (c *AllocStopCommand) Run(args []string) int`

**位置**：[L60](file:///d:/claude/nomad/command/alloc_stop.go#L60)

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
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/api/contexts` | 内部包 |
| `github.com/posener/complete` | 第三方库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [alloc_stop_test.go](file:///d:/claude/nomad/command/alloc_stop_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/command/acl.go) | 同目录源文件 |
| [acl_auth_method.go](file:///d:/claude/nomad/command/acl_auth_method.go) | 同目录源文件 |
| [acl_auth_method_create.go](file:///d:/claude/nomad/command/acl_auth_method_create.go) | 同目录源文件 |
| [acl_auth_method_delete.go](file:///d:/claude/nomad/command/acl_auth_method_delete.go) | 同目录源文件 |
| [acl_auth_method_info.go](file:///d:/claude/nomad/command/acl_auth_method_info.go) | 同目录源文件 |



---

## Run 函数业务逻辑深度分析

> 分析文件：[alloc_stop.go](file:///d:/claude/nomad/command/alloc_stop.go)
> Run 函数数量：1

### 1. *AllocStopCommand.Run

**定义位置**：[L60-L153](file:///d:/claude/nomad/command/alloc_stop.go#L60-L153)

**函数签名**：

```go
func (*AllocStopCommand) Run(args []string) (int) {
    // ...
}
```

**业务逻辑要点**：

1. **命令行参数解析**：通过 `flags.Parse()` 解析 3 个命令行 flag
2. **参数校验**：存在错误退出路径，对输入参数进行校验，校验失败返回 1
3. **API 客户端初始化**：无 API 调用（可能为本地操作或帮助命令）
4. **业务处理**：执行业务逻辑处理
5. **退出处理**：成功返回 0，失败返回 1

**命令行 Flag 解析**：

| 行号 | Flag名 | 说明 |
|------|--------|------|
| L65 | `detach` | 命令行参数 |
| L66 | `verbose` | 命令行参数 |
| L67 | `no-shutdown-delay` | 命令行参数 |

**关键调用链**：

| 行号 | 调用 | 说明 |
|------|------|------|
| L63 | `c.Meta.FlagSet` | 创建 flag 解析器 |
| L63 | `c.Name` | 业务调用 |
| L64 | `c.Help` | 业务调用 |
| L98 | `c.Meta.Client` | 获取 Nomad API 客户端 |
| L104 | `client.Allocations` | 业务调用 |
| L124 | `client.Allocations` | 业务调用 |
| L132 | `alloc.Stub` | 业务调用 |
| L140 | `client.Allocations` | 业务调用 |
| L152 | `mon.monitor` | 业务调用 |

**退出点分析**：

| 行号 | 退出代码 | 退出原因 |
|------|---------|---------|
| L70 | `return 1` | 错误退出 |
| L78 | `return 1` | 错误退出 |
| L92 | `return 1` | 错误退出 |
| L101 | `return 1` | 错误退出 |
| L107 | `return 1` | 错误退出 |
| L112 | `return 1` | 错误退出 |
| L119 | `return 1` | 错误退出 |
| L127 | `return 1` | 错误退出 |
| L143 | `return 1` | 错误退出 |
| L148 | `return 0` | 成功退出 |
| L152 | `return mon.monitor(resp.EvalID)` | 返回值 |

**关键注释说明**：

| 行号 | 注释内容 |
|------|---------|
| L73 | Check that we got exactly one alloc |
| L83 | Truncate the id unless full length is requested |
| L89 | Query the allocation info |
| L97 | Get the HTTP client |
| L116 | Format the allocs |
| L122 | Prefix lookup matched a single allocation |

