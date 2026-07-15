# execagent.go 代码说明文档

> 文件路径：[e2e/execagent/execagent.go](file:///d:/claude/nomad/e2e/execagent/execagent.go)
> 总行数：392 行
> 所属包：`execagent`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **端到端测试子包**（`e2e/execagent`），针对 Nomad 的特定功能领域编写端到端测试，通过真实的 Nomad 集群验证功能正确性。

## 2. 类型定义

### AgentMode

**定义位置**：[L19](file:///d:/claude/nomad/e2e/execagent/execagent.go#L19)

**类型定义**：`type AgentMode int`

### AgentTemplateVars

**定义位置**：[L75](file:///d:/claude/nomad/e2e/execagent/execagent.go#L75)

**中文说明**：AgentTemplateVars 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type AgentTemplateVars struct {
	HTTP int
	RPC int
	Serf int
	EnableClient bool
	EnableServer bool
	AgentName string
	LogLevel string
	NodePool string
	RetryJoinAddrs []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `HTTP` | `int` | — |
| `RPC` | `int` | RPC 相关 |
| `Serf` | `int` | Serf 集群实例 |
| `EnableClient` | `bool` | 布尔值 |
| `EnableServer` | `bool` | 布尔值 |
| `AgentName` | `string` | 字符串 |
| `LogLevel` | `string` | 字符串 |
| `NodePool` | `string` | 字符串 |
| `RetryJoinAddrs` | `[]string` | 列表 |

**关联方法**（1 个）：`SetMode`

### NomadAgent

**定义位置**：[L150](file:///d:/claude/nomad/e2e/execagent/execagent.go#L150)

**中文说明**：NomadAgent 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type NomadAgent struct {
	BinPath string
	DataDir string
	ConfFile string
	Cmd *exec.Cmd
	Vars *AgentTemplateVars
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `BinPath` | `string` | 字符串 |
| `DataDir` | `string` | 字符串 |
| `ConfFile` | `string` | 字符串 |
| `Cmd` | `*exec.Cmd` | — |
| `Vars` | `*AgentTemplateVars` | — |

**关联方法**（4 个）：`Start`, `Stop`, `Destroy`, `Client`

### TemplateVariableCallbackFunc

**定义位置**：[L269](file:///d:/claude/nomad/e2e/execagent/execagent.go#L269)

**类型定义**：`type TemplateVariableCallbackFunc func(...)`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ModeClient` | `AgentMode` | `1` | — |
| `ModeServer` | `AgentMode` | `2` | — |
| `ModeBoth` | `—` | `ModeClient \| ModeServer` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `BaseDir` | `—` | `"/opt/nomadtest"` | — |
| `agentTemplate` | `—` | `template.Must(template.New("agent").Parse(`
enable_debug ...` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `init` | - | `` | `` | [L28](file:///d:/claude/nomad/e2e/execagent/execagent.go#L28) |
| `newAgentTemplateVars` | - | `` | `*AgentTemplateVars, error` | [L99](file:///d:/claude/nomad/e2e/execagent/execagent.go#L99) |
| `SetMode` | `a *AgentTemplateVars` | `mode AgentMode` | `` | [L126](file:///d:/claude/nomad/e2e/execagent/execagent.go#L126) |
| `writeConfig` | - | `path string, vars *AgentTemplateVars` | `error` | [L140](file:///d:/claude/nomad/e2e/execagent/execagent.go#L140) |
| `NewMixedAgent` | - | `bin string` | `*NomadAgent, error` | [L169](file:///d:/claude/nomad/e2e/execagent/execagent.go#L169) |
| `NewClientServerPair` | - | `bin string, serverOut io.Writer, clientOut io.Writer` | `server *NomadAgent, client *NomadAgent, err error` | [L201](file:///d:/claude/nomad/e2e/execagent/execagent.go#L201) |
| `NewSingleModeAgent` | - | `bin string, baseDir string, additionalConfig string, mode AgentMode, writer i...` | `*NomadAgent, error` | [L271](file:///d:/claude/nomad/e2e/execagent/execagent.go#L271) |
| `Start` | `n *NomadAgent` | `` | `error` | [L351](file:///d:/claude/nomad/e2e/execagent/execagent.go#L351) |
| `Stop` | `n *NomadAgent` | `` | `error` | [L356](file:///d:/claude/nomad/e2e/execagent/execagent.go#L356) |
| `Destroy` | `n *NomadAgent` | `` | `error` | [L365](file:///d:/claude/nomad/e2e/execagent/execagent.go#L365) |
| `Client` | `n *NomadAgent` | `` | `*api.Client, error` | [L373](file:///d:/claude/nomad/e2e/execagent/execagent.go#L373) |
| `getFreePort` | - | `` | `int, error` | [L379](file:///d:/claude/nomad/e2e/execagent/execagent.go#L379) |

## 5. 核心方法详解

### NewMixedAgent()

**签名**：`func NewMixedAgent(bin string) *NomadAgent, error`

**位置**：[L169](file:///d:/claude/nomad/e2e/execagent/execagent.go#L169)

**中文说明**：创建并返回一个新的 MixedAgent 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `bin` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NomadAgent` | — |
| `error` | 错误信息 |

### NewClientServerPair()

**签名**：`func NewClientServerPair(bin string, serverOut io.Writer, clientOut io.Writer) server *NomadAgent, client *NomadAgent, err error`

**位置**：[L201](file:///d:/claude/nomad/e2e/execagent/execagent.go#L201)

**中文说明**：创建并返回一个新的 ClientServerPair 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `bin` | `string` | 字符串 |
| `serverOut` | `io.Writer` | — |
| `clientOut` | `io.Writer` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `server *NomadAgent` | — |
| `client *NomadAgent` | — |
| `err error` | 错误信息 |

### NewSingleModeAgent()

**签名**：`func NewSingleModeAgent(bin string, baseDir string, additionalConfig string, mode AgentMode, writer io.Writer, varCallbackFn TemplateVariableCallbackFunc) *NomadAgent, error`

**位置**：[L271](file:///d:/claude/nomad/e2e/execagent/execagent.go#L271)

**中文说明**：创建并返回一个新的 SingleModeAgent 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `bin` | `string` | 字符串 |
| `baseDir` | `string` | 字符串 |
| `additionalConfig` | `string` | 字符串 |
| `mode` | `AgentMode` | — |
| `writer` | `io.Writer` | — |
| `varCallbackFn` | `TemplateVariableCallbackFunc` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*NomadAgent` | — |
| `error` | 错误信息 |

### Start()

**签名**：`func (n *NomadAgent) Start() error`

**位置**：[L351](file:///d:/claude/nomad/e2e/execagent/execagent.go#L351)

**中文说明**：启动对象。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Stop()

**签名**：`func (n *NomadAgent) Stop() error`

**位置**：[L356](file:///d:/claude/nomad/e2e/execagent/execagent.go#L356)

**中文说明**：停止 发送 中断 信号 和 返回 command's 等待 错误.

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Destroy()

**签名**：`func (n *NomadAgent) Destroy() error`

**位置**：[L365](file:///d:/claude/nomad/e2e/execagent/execagent.go#L365)

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `io` | 标准库 |
| `net` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `path/filepath` | 标准库 |
| `text/template` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **端到端测试**：通过真实 Nomad 集群验证功能，使用测试框架组织测试用例
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|

