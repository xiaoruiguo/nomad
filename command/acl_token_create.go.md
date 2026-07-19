# acl_token_create.go 代码说明文档

> 文件路径：[command/acl_token_create.go](file:///d:/claude/nomad/command/acl_token_create.go)
> 总行数：274 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CLI 命令包**（`command/`），实现 `nomad acl_token_create` 命令，通过 Nomad API 客户端与 Server 交互，提供作业管理、节点查询、集群运维等命令行功能。

## 2. 类型定义

### ACLTokenCreateCommand

**定义位置**：[L19](file:///d:/claude/nomad/command/acl_token_create.go#L19)

**中文说明**：ACLTokenCreateCommand 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLTokenCreateCommand struct {
	Meta Meta
	roleNames []string
	roleIDs []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Meta` | `Meta` | 元数据 |
| `roleNames` | `[]string` | 列表 |
| `roleIDs` | `[]string` | 列表 |

**关联方法**（6 个）：`Help`, `AutocompleteFlags`, `AutocompleteArgs`, `Synopsis`, `Name`, `Run`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Help` | `c *ACLTokenCreateCommand` | `` | `string` | [L26](file:///d:/claude/nomad/command/acl_token_create.go#L26) |
| `AutocompleteFlags` | `c *ACLTokenCreateCommand` | `` | `complete.Flags` | [L86](file:///d:/claude/nomad/command/acl_token_create.go#L86) |
| `AutocompleteArgs` | `c *ACLTokenCreateCommand` | `` | `complete.Predictor` | [L102](file:///d:/claude/nomad/command/acl_token_create.go#L102) |
| `Synopsis` | `c *ACLTokenCreateCommand` | `` | `string` | [L106](file:///d:/claude/nomad/command/acl_token_create.go#L106) |
| `Name` | `c *ACLTokenCreateCommand` | `` | `string` | [L110](file:///d:/claude/nomad/command/acl_token_create.go#L110) |
| `Run` | `c *ACLTokenCreateCommand` | `args []string` | `int` | [L112](file:///d:/claude/nomad/command/acl_token_create.go#L112) |
| `generateACLTokenRoleLinks` | - | `roleNames []string, roleIDs []string` | `[]*api.ACLTokenRoleLink` | [L260](file:///d:/claude/nomad/command/acl_token_create.go#L260) |

## 5. 核心方法详解

### Run()

**签名**：`func (c *ACLTokenCreateCommand) Run(args []string) int`

**位置**：[L112](file:///d:/claude/nomad/command/acl_token_create.go#L112)

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
| `io` | 标准库 |
| `os` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/posener/complete` | 第三方库 |

## 7. 设计模式与技术特点

- **IO 操作**：涉及文件或数据流的读写操作

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl_token_create_test.go](file:///d:/claude/nomad/command/acl_token_create_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/command/acl.go) | 同目录源文件 |
| [acl_auth_method.go](file:///d:/claude/nomad/command/acl_auth_method.go) | 同目录源文件 |
| [acl_auth_method_create.go](file:///d:/claude/nomad/command/acl_auth_method_create.go) | 同目录源文件 |
| [acl_auth_method_delete.go](file:///d:/claude/nomad/command/acl_auth_method_delete.go) | 同目录源文件 |
| [acl_auth_method_info.go](file:///d:/claude/nomad/command/acl_auth_method_info.go) | 同目录源文件 |



---

## Run 函数业务逻辑深度分析

> 分析文件：[acl_token_create.go](file:///d:/claude/nomad/command/acl_token_create.go)
> Run 函数数量：1

### 1. *ACLTokenCreateCommand.Run

**定义位置**：[L112-L255](file:///d:/claude/nomad/command/acl_token_create.go#L112-L255)

**函数签名**：

```go
func (*ACLTokenCreateCommand) Run(args []string) (int) {
    // ...
}
```

**业务逻辑要点**：

1. **命令行参数解析**：通过 `flags.Parse()` 解析 10 个命令行 flag
2. **参数校验**：存在错误退出路径，对输入参数进行校验，校验失败返回 1
3. **API 客户端初始化**：通过 `Meta.Client()` 获取 Nomad API 客户端，调用 3 个不同的 API 端点
4. **业务处理**：调用 API 获取数据后，通过 `Ui.Output()` / `Ui.Info()` 输出结果
5. **退出处理**：成功返回 0，失败返回 1

**命令行 Flag 解析**：

| 行号 | Flag名 | 说明 |
|------|--------|------|
| L118 | `name` | 命令行参数 |
| L119 | `type` | 命令行参数 |
| L120 | `global` | 命令行参数 |
| L121 | `ttl` | 命令行参数 |
| L122 | `json` | 命令行参数 |
| L123 | `t` | 命令行参数 |
| L124 | `accessor` | 命令行参数 |
| L125 | `policy` | 命令行参数 |
| L129 | `role-name` | 命令行参数 |
| L133 | `role-id` | 命令行参数 |

**关键调用链**：

| 行号 | 调用 | 说明 |
|------|------|------|
| L116 | `c.Meta.FlagSet` | 创建 flag 解析器 |
| L116 | `c.Name` | 业务调用 |
| L117 | `c.Help` | 业务调用 |
| L161 | `helper.IsUUID` | 业务调用 |
| L173 | `io.ReadAll` | 业务调用 |
| L182 | `helper.IsUUID` | 业务调用 |
| L194 | `generateACLTokenRoleLinks` | 业务调用 |
| L210 | `c.Meta.Client` | 获取 Nomad API 客户端 |
| L218 | `client.ACLPolicies().Info` | 输出信息到用户 |
| L218 | `client.ACLPolicies` | 业务调用 |
| L229 | `client.ACLTokens().Upload` | 业务调用 |
| L229 | `client.ACLTokens` | 业务调用 |
| L235 | `client.ACLTokens().Create` | 业务调用 |
| L235 | `client.ACLTokens` | 业务调用 |
| L245 | `err.Error` | 输出错误信息 |
| L253 | `outputACLToken` | 业务调用 |

**涉及的 Nomad API 端点**：

- `ACL Policies API.Info`
- `ACL Tokens API.Upload`
- `ACL Tokens API.Create`

**退出点分析**：

| 行号 | 退出代码 | 退出原因 |
|------|---------|---------|
| L127 | `return nil` | 返回值 |
| L131 | `return nil` | 返回值 |
| L135 | `return nil` | 返回值 |
| L138 | `return 1` | 错误退出 |
| L145 | `return 1` | 错误退出 |
| L153 | `return 1` | 错误退出 |
| L158 | `return 1` | 错误退出 |
| L164 | `return 1` | 错误退出 |
| L179 | `return 1` | 错误退出 |
| L185 | `return 1` | 错误退出 |
| L204 | `return 1` | 错误退出 |
| L213 | `return 1` | 错误退出 |
| L232 | `return 1` | 错误退出 |
| L238 | `return 1` | 错误退出 |
| L246 | `return 1` | 错误退出 |
| L250 | `return 0` | 成功退出 |
| L254 | `return 0` | 成功退出 |

**关键注释说明**：

| 行号 | 注释内容 |
|------|---------|
| L148 | If -accessor is set, the caller must also supply the SecretID via a file |
| L149 | or stdin (positional argument). |
| L189 | Set up the token. |
| L198 | If the user set a TTL flag value, convert this to a time duration and |
| L199 | add it to our token request object. |
| L209 | Get the HTTP client |
| L216 | Show warning if policy doesn't exist |
| L252 | Format the output |

