# types.config.go 代码说明文档

> 文件路径：[jobspec2/types.config.go](file:///d:/claude/nomad/jobspec2/types.config.go)
> 总行数：374 行
> 所属包：`jobspec2`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **Jobspec v2 解析子包**（`jobspec2/`），实现 Nomad 作业规范（jobspec）的 HCL 解析、验证和转换，将用户编写的 HCL 配置转换为内部 API 对象。

## 2. 类型定义

### jobConfig

**定义位置**：[L29](file:///d:/claude/nomad/jobspec2/types.config.go#L29)

**中文说明**：jobConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type jobConfig struct {
	JobID string `hcl:",label"`
	Job *api.Job
	ParseConfig *ParseConfig
	Vault *api.Vault `hcl:"vault,block"`
	Secrets []*api.Secret `hcl:"secret,block"`
	Tasks []*api.Task `hcl:"task,block"`
	InputVariables Variables
	LocalVariables Variables
	LocalBlocks []*LocalBlock
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string `hcl:",label"`` | 字符串 |
| `Job` | `*api.Job` | — |
| `ParseConfig` | `*ParseConfig` | — |
| `Vault` | `*api.Vault `hcl:"vault,block"`` | — |
| `Secrets` | `[]*api.Secret `hcl:"secret,block"`` | 列表 |
| `Tasks` | `[]*api.Task `hcl:"task,block"`` | 列表 |
| `InputVariables` | `Variables` | — |
| `LocalVariables` | `Variables` | — |
| `LocalBlocks` | `[]*LocalBlock` | 列表 |

**关联方法**（8 个）：`decodeBody`, `decodeInputVariables`, `parseLocalVariables`, `decodeTopLevelExtras`, `evaluateLocalVariables`, `evaluateLocalVariable`, `decodeJob`, `EvalContext`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `variablesLabel` | `—` | `"variables"` | — |
| `variableLabel` | `—` | `"variable"` | — |
| `localsLabel` | `—` | `"locals"` | — |
| `vaultLabel` | `—` | `"vault"` | — |
| `taskLabel` | `—` | `"task"` | — |
| `secretLabel` | `—` | `"secret"` | — |
| `inputVariablesAccessor` | `—` | `"var"` | — |
| `localsAccessor` | `—` | `"local"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `jobConfigSchema` | `—` | `&hcl.BodySchema{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newJobConfig` | - | `parseConfig *ParseConfig` | `*jobConfig` | [L45](file:///d:/claude/nomad/jobspec2/types.config.go#L45) |
| `decodeBody` | `c *jobConfig` | `body hcl.Body` | `hcl.Diagnostics` | [L63](file:///d:/claude/nomad/jobspec2/types.config.go#L63) |
| `decodeInputVariables` | `c *jobConfig` | `content *hcl.BodyContent` | `hcl.Diagnostics` | [L95](file:///d:/claude/nomad/jobspec2/types.config.go#L95) |
| `parseLocalVariables` | `c *jobConfig` | `content *hcl.BodyContent` | `hcl.Diagnostics` | [L118](file:///d:/claude/nomad/jobspec2/types.config.go#L118) |
| `decodeTopLevelExtras` | `c *jobConfig` | `content *hcl.BodyContent, ctx *hcl.EvalContext` | `hcl.Diagnostics` | [L148](file:///d:/claude/nomad/jobspec2/types.config.go#L148) |
| `evaluateLocalVariables` | `c *jobConfig` | `locals []*LocalBlock` | `hcl.Diagnostics` | [L192](file:///d:/claude/nomad/jobspec2/types.config.go#L192) |
| `evaluateLocalVariable` | `c *jobConfig` | `local *LocalBlock` | `hcl.Diagnostics` | [L232](file:///d:/claude/nomad/jobspec2/types.config.go#L232) |
| `decodeJob` | `c *jobConfig` | `content *hcl.BodyContent, ctx *hcl.EvalContext` | `hcl.Diagnostics` | [L253](file:///d:/claude/nomad/jobspec2/types.config.go#L253) |
| `EvalContext` | `c *jobConfig` | `` | `*hcl.EvalContext` | [L315](file:///d:/claude/nomad/jobspec2/types.config.go#L315) |
| `toVars` | - | `vars []string` | `map[string]string` | [L363](file:///d:/claude/nomad/jobspec2/types.config.go#L363) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/api` | 内部包 |
| `github.com/hashicorp/nomad/jobspec2/hclutil` | 内部包 |
| `github.com/hashicorp/hcl/v2` | 第三方库 |
| `github.com/hashicorp/hcl/v2/ext/dynblock` | 第三方库 |
| `github.com/zclconf/go-cty/cty` | 第三方库 |

## 7. 设计模式与技术特点

- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [functions.go](file:///d:/claude/nomad/jobspec2/functions.go) | 同目录源文件 |
| [hcl_conversions.go](file:///d:/claude/nomad/jobspec2/hcl_conversions.go) | 同目录源文件 |
| [parse.go](file:///d:/claude/nomad/jobspec2/parse.go) | 同目录源文件 |
| [parse_job.go](file:///d:/claude/nomad/jobspec2/parse_job.go) | 同目录源文件 |
| [parse_map.go](file:///d:/claude/nomad/jobspec2/parse_map.go) | 同目录源文件 |

