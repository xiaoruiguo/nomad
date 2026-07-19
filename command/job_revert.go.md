# job_revert.go 代码说明文档

> 文件路径：[command/job_revert.go](file:///d:/claude/nomad/command/job_revert.go)
> 总行数：149 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CLI 命令包**（`command/`），实现 `nomad job_revert` 命令，通过 Nomad API 客户端与 Server 交互，提供作业管理、节点查询、集群运维等命令行功能。

## 2. 类型定义

### JobRevertCommand

**定义位置**：[L14](file:///d:/claude/nomad/command/job_revert.go#L14)

**中文说明**：JobRevertCommand 与作业（Job）相关，作业是 Nomad 调度的目标对象。

**类型**：struct

```go
type JobRevertCommand struct {
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
| `Help` | `c *JobRevertCommand` | `` | `string` | [L18](file:///d:/claude/nomad/command/job_revert.go#L18) |
| `Synopsis` | `c *JobRevertCommand` | `` | `string` | [L52](file:///d:/claude/nomad/command/job_revert.go#L52) |
| `AutocompleteFlags` | `c *JobRevertCommand` | `` | `complete.Flags` | [L56](file:///d:/claude/nomad/command/job_revert.go#L56) |
| `AutocompleteArgs` | `c *JobRevertCommand` | `` | `complete.Predictor` | [L64](file:///d:/claude/nomad/command/job_revert.go#L64) |
| `Name` | `c *JobRevertCommand` | `` | `string` | [L68](file:///d:/claude/nomad/command/job_revert.go#L68) |
| `Run` | `c *JobRevertCommand` | `args []string` | `int` | [L70](file:///d:/claude/nomad/command/job_revert.go#L70) |

## 5. 核心方法详解

### Run()

**签名**：`func (c *JobRevertCommand) Run(args []string) int`

**位置**：[L70](file:///d:/claude/nomad/command/job_revert.go#L70)

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
| `github.com/posener/complete` | 第三方库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [job_revert_test.go](file:///d:/claude/nomad/command/job_revert_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/command/acl.go) | 同目录源文件 |
| [acl_auth_method.go](file:///d:/claude/nomad/command/acl_auth_method.go) | 同目录源文件 |
| [acl_auth_method_create.go](file:///d:/claude/nomad/command/acl_auth_method_create.go) | 同目录源文件 |
| [acl_auth_method_delete.go](file:///d:/claude/nomad/command/acl_auth_method_delete.go) | 同目录源文件 |
| [acl_auth_method_info.go](file:///d:/claude/nomad/command/acl_auth_method_info.go) | 同目录源文件 |



---

## Run 函数业务逻辑深度分析

> 分析文件：[job_revert.go](file:///d:/claude/nomad/command/job_revert.go)
> Run 函数数量：1

### 1. *JobRevertCommand.Run

**定义位置**：[L70-L148](file:///d:/claude/nomad/command/job_revert.go#L70-L148)

**函数签名**：

```go
func (*JobRevertCommand) Run(args []string) (int) {
    // ...
}
```

**业务逻辑要点**：

1. **命令行参数解析**：通过 `flags.Parse()` 解析 2 个命令行 flag
2. **参数校验**：存在错误退出路径，对输入参数进行校验，校验失败返回 1
3. **API 客户端初始化**：通过 `Meta.Client()` 获取 Nomad API 客户端，调用 2 个不同的 API 端点
4. **业务处理**：主要通过 `Ui.Error()` 输出错误信息
5. **退出处理**：成功返回 0，失败返回 1

**命令行 Flag 解析**：

| 行号 | Flag名 | 说明 |
|------|--------|------|
| L75 | `detach` | 命令行参数 |
| L76 | `verbose` | 命令行参数 |

**关键调用链**：

| 行号 | 调用 | 说明 |
|------|------|------|
| L73 | `c.Meta.FlagSet` | 创建 flag 解析器 |
| L73 | `c.Name` | 业务调用 |
| L74 | `c.Help` | 业务调用 |
| L97 | `c.Meta.Client` | 获取 Nomad API 客户端 |
| L110 | `client.Jobs().VersionByTag` | 调用 Jobs API |
| L110 | `client.Jobs` | 业务调用 |
| L120 | `c.JobIDByPrefix` | 业务调用 |
| L122 | `err.Error` | 输出错误信息 |
| L128 | `client.Jobs().Revert` | 调用 Jobs API |
| L128 | `client.Jobs` | 业务调用 |
| L147 | `mon.monitor` | 业务调用 |

**涉及的 Nomad API 端点**：

- `Jobs API.VersionByTag`
- `Jobs API.Revert`

**退出点分析**：

| 行号 | 退出代码 | 退出原因 |
|------|---------|---------|
| L79 | `return 1` | 错误退出 |
| L93 | `return 1` | 错误退出 |
| L100 | `return 1` | 错误退出 |
| L113 | `return 1` | 错误退出 |
| L123 | `return 1` | 错误退出 |
| L131 | `return 1` | 错误退出 |
| L138 | `return 0` | 成功退出 |
| L143 | `return 0` | 成功退出 |
| L147 | `return mon.monitor(resp.EvalID)` | 返回值 |

**关键注释说明**：

| 行号 | 注释内容 |
|------|---------|
| L82 | Truncate the id unless full length is requested |
| L88 | Check that we got two args |
| L96 | Get the HTTP client |
| L103 | Parse the job version or version tag |
| L118 | Check if the job exists |
| L126 | Prefix lookup matched a single job |
| L134 | Nothing to do |

