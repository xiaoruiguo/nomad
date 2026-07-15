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

**类型定义**：`int`

### AgentTemplateVars

**定义位置**：[L75](file:///d:/claude/nomad/e2e/execagent/execagent.go#L75)

**类型**：struct

```go
	HTTP int
	RPC int
	Serf int
	EnableClient bool
	EnableServer bool
	AgentName string
	LogLevel string
	NodePool string
	RetryJoinAddrs []string
```

**关联方法**（1 个）：`SetMode`

### NomadAgent

**定义位置**：[L150](file:///d:/claude/nomad/e2e/execagent/execagent.go#L150)

**类型**：struct

```go
	BinPath string
	DataDir string
	ConfFile string
	Cmd *exec.Cmd
	Vars *AgentTemplateVars
```

**关联方法**（4 个）：`Start`, `Stop`, `Destroy`, `Client`

### TemplateVariableCallbackFunc

**定义位置**：[L269](file:///d:/claude/nomad/e2e/execagent/execagent.go#L269)

**类型定义**：`func(...)`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `ModeClient` | `1` |
| `ModeServer` | `2` |
| `ModeBoth` | `ModeClient \| ModeServer` |

### 变量

| 名称 | 值 |
|------|----|
| `BaseDir` | `"/opt/nomadtest"` |
| `agentTemplate` | `template.Must(template.New("agent").Parse(`
enable_debug ...` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `init` | - | - | - | [L28](file:///d:/claude/nomad/e2e/execagent/execagent.go#L28) |
| `newAgentTemplateVars` | - | - | `*AgentTemplateVars, error` | [L99](file:///d:/claude/nomad/e2e/execagent/execagent.go#L99) |
| `SetMode` | `a *AgentTemplateVars` | `mode AgentMode` | - | [L126](file:///d:/claude/nomad/e2e/execagent/execagent.go#L126) |
| `writeConfig` | - | `path string, vars *AgentTemplateVars` | `error` | [L140](file:///d:/claude/nomad/e2e/execagent/execagent.go#L140) |
| `NewMixedAgent` | - | `bin string` | `*NomadAgent, error` | [L169](file:///d:/claude/nomad/e2e/execagent/execagent.go#L169) |
| `NewClientServerPair` | - | `bin string, serverOut io.Writer, clientOut io.Writer` | `server *NomadAgent, client *NomadAgent, err error` | [L201](file:///d:/claude/nomad/e2e/execagent/execagent.go#L201) |
| `NewSingleModeAgent` | - | `bin string, baseDir string, additionalConfig string, mode AgentMode, writer ...` | `*NomadAgent, error` | [L271](file:///d:/claude/nomad/e2e/execagent/execagent.go#L271) |
| `Start` | `n *NomadAgent` | - | `error` | [L351](file:///d:/claude/nomad/e2e/execagent/execagent.go#L351) |
| `Stop` | `n *NomadAgent` | - | `error` | [L356](file:///d:/claude/nomad/e2e/execagent/execagent.go#L356) |
| `Destroy` | `n *NomadAgent` | - | `error` | [L365](file:///d:/claude/nomad/e2e/execagent/execagent.go#L365) |
| `Client` | `n *NomadAgent` | - | `*api.Client, error` | [L373](file:///d:/claude/nomad/e2e/execagent/execagent.go#L373) |
| `getFreePort` | - | - | `int, error` | [L379](file:///d:/claude/nomad/e2e/execagent/execagent.go#L379) |

## 5. 核心方法详解

### NewMixedAgent()

**签名**：`func NewMixedAgent(bin string) *NomadAgent, error`

**位置**：[L169](file:///d:/claude/nomad/e2e/execagent/execagent.go#L169)

### NewClientServerPair()

**签名**：`func NewClientServerPair(bin string, serverOut io.Writer, clientOut io.Writer) server *NomadAgent, client *NomadAgent, err error`

**位置**：[L201](file:///d:/claude/nomad/e2e/execagent/execagent.go#L201)

### NewSingleModeAgent()

**签名**：`func NewSingleModeAgent(bin string, baseDir string, additionalConfig string, mode AgentMode, writer io.Writer, varCallbackFn TemplateVariableCallbackFunc) *NomadAgent, error`

**位置**：[L271](file:///d:/claude/nomad/e2e/execagent/execagent.go#L271)

### Start()

**签名**：`func (n *NomadAgent) Start() error`

**位置**：[L351](file:///d:/claude/nomad/e2e/execagent/execagent.go#L351)

### Stop()

**签名**：`func (n *NomadAgent) Stop() error`

**位置**：[L356](file:///d:/claude/nomad/e2e/execagent/execagent.go#L356)

### Destroy()

**签名**：`func (n *NomadAgent) Destroy() error`

**位置**：[L365](file:///d:/claude/nomad/e2e/execagent/execagent.go#L365)

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

## 8. 相关文件

| 文件 | 关系 |
|------|------|

