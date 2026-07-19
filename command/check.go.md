# check.go 代码说明文档

> 文件路径：[command/check.go](file:///d:/claude/nomad/command/check.go)
> 总行数：156 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CLI 命令包**（`command/`），实现 `nomad check` 命令，通过 Nomad API 客户端与 Server 交互，提供作业管理、节点查询、集群运维等命令行功能。

## 2. 类型定义

### AgentCheckCommand

**定义位置**：[L22](file:///d:/claude/nomad/command/check.go#L22)

**中文说明**：AgentCheckCommand 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type AgentCheckCommand struct {
	Meta Meta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `Meta` | 元数据 |

**关联方法**（8 个）：`Help`, `Synopsis`, `Name`, `Run`, `checkServerHealth`, `checkClientHealth`, `AutocompleteFlags`, `AutocompleteArgs`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `HealthCritical` | `—` | `2` | — |
| `HealthWarn` | `—` | `1` | — |
| `HealthPass` | `—` | `0` | — |
| `HealthUnknown` | `—` | `3` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *AgentCheckCommand` | `` | `string` | [L26](file:///d:/claude/nomad/command/check.go#L26) |
| `Synopsis` | `c *AgentCheckCommand` | `` | `string` | [L49](file:///d:/claude/nomad/command/check.go#L49) |
| `Name` | `c *AgentCheckCommand` | `` | `string` | [L53](file:///d:/claude/nomad/command/check.go#L53) |
| `Run` | `c *AgentCheckCommand` | `args []string` | `int` | [L55](file:///d:/claude/nomad/command/check.go#L55) |
| `checkServerHealth` | `c *AgentCheckCommand` | `info map[string]map[string]string, minPeers int` | `int` | [L97](file:///d:/claude/nomad/command/check.go#L97) |
| `checkClientHealth` | `c *AgentCheckCommand` | `clientStats map[string]string, minServers int` | `int` | [L113](file:///d:/claude/nomad/command/check.go#L113) |
| `AutocompleteFlags` | `c *AgentCheckCommand` | `` | `complete.Flags` | [L145](file:///d:/claude/nomad/command/check.go#L145) |
| `AutocompleteArgs` | `c *AgentCheckCommand` | `` | `complete.Predictor` | [L153](file:///d:/claude/nomad/command/check.go#L153) |

## 5. 核心方法详解

### Run()

**签名**：`func (c *AgentCheckCommand) Run(args []string) int`

**位置**：[L55](file:///d:/claude/nomad/command/check.go#L55)

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
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/posener/complete` | 第三方库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [check_test.go](file:///d:/claude/nomad/command/check_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/command/acl.go) | 同目录源文件 |
| [acl_auth_method.go](file:///d:/claude/nomad/command/acl_auth_method.go) | 同目录源文件 |
| [acl_auth_method_create.go](file:///d:/claude/nomad/command/acl_auth_method_create.go) | 同目录源文件 |
| [acl_auth_method_delete.go](file:///d:/claude/nomad/command/acl_auth_method_delete.go) | 同目录源文件 |
| [acl_auth_method_info.go](file:///d:/claude/nomad/command/acl_auth_method_info.go) | 同目录源文件 |



---

## Run 函数业务逻辑深度分析

> 分析文件：[check.go](file:///d:/claude/nomad/command/check.go)
> Run 函数数量：1

### 1. *AgentCheckCommand.Run

**定义位置**：[L55-L93](file:///d:/claude/nomad/command/check.go#L55-L93)

**函数签名**：

```go
func (*AgentCheckCommand) Run(args []string) (int) {
    // ...
}
```

**业务逻辑要点**：

1. **命令行参数解析**：通过 `flags.Parse()` 解析 2 个命令行 flag
2. **参数校验**：存在错误退出路径，对输入参数进行校验，校验失败返回 1
3. **API 客户端初始化**：通过 `Meta.Client()` 获取 Nomad API 客户端，调用 1 个不同的 API 端点
4. **业务处理**：执行业务逻辑处理
5. **退出处理**：出错返回 1

**命令行 Flag 解析**：

| 行号 | Flag名 | 说明 |
|------|--------|------|
| L60 | `min-peers` | 命令行参数 |
| L61 | `min-servers` | 命令行参数 |

**关键调用链**：

| 行号 | 调用 | 说明 |
|------|------|------|
| L58 | `c.Meta.FlagSet` | 创建 flag 解析器 |
| L59 | `c.Help` | 业务调用 |
| L74 | `c.Meta.Client` | 获取 Nomad API 客户端 |
| L80 | `client.Agent().Self` | 调用 Agent API |
| L80 | `client.Agent` | 业务调用 |
| L86 | `c.checkServerHealth` | 业务调用 |
| L90 | `c.checkClientHealth` | 业务调用 |

**涉及的 Nomad API 端点**：

- `Agent API.Self`

**退出点分析**：

| 行号 | 退出代码 | 退出原因 |
|------|---------|---------|
| L64 | `return 1` | 错误退出 |
| L71 | `return 1` | 错误退出 |
| L77 | `return HealthCritical` | 返回值 |
| L83 | `return HealthCritical` | 返回值 |
| L86 | `return c.checkServerHealth(info.Stats, minPeers)` | 返回值 |
| L90 | `return c.checkClientHealth(clientStats, minServers)` | 返回值 |
| L92 | `return HealthWarn` | 返回值 |

