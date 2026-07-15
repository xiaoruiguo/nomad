# types.variables.go 代码说明文档

> 文件路径：[jobspec2/types.variables.go](file:///d:/claude/nomad/jobspec2/types.variables.go)
> 总行数：705 行
> 所属包：`jobspec2`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **Jobspec v2 解析子包**（`jobspec2/`），实现 Nomad 作业规范（jobspec）的 HCL 解析、验证和转换，将用户编写的 HCL 配置转换为内部 API 对象。

## 2. 类型定义

### LocalBlock

**定义位置**：[L29](file:///d:/claude/nomad/jobspec2/types.variables.go#L29)

**中文说明**：LocalBlock 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type LocalBlock struct {
	Name string
	Expr hcl.Expression
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Expr` | `hcl.Expression` | — |

### VariableAssignment

**定义位置**：[L37](file:///d:/claude/nomad/jobspec2/types.variables.go#L37)

**中文说明**：VariableAssignment 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type VariableAssignment struct {
	From string
	Value cty.Value
	Expr hcl.Expression
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `From` | `string` | 字符串 |
| `Value` | `cty.Value` | 值 |
| `Expr` | `hcl.Expression` | — |

### Variable

**定义位置**：[L44](file:///d:/claude/nomad/jobspec2/types.variables.go#L44)

**中文说明**：Variable 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Variable struct {
	Values []VariableAssignment
	Validations []*VariableValidation
	Type cty.Type
	Name string
	Description string
	Range hcl.Range
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Values` | `[]VariableAssignment` | 列表 |
| `Validations` | `[]*VariableValidation` | 列表 |
| `Type` | `cty.Type` | 类型 |
| `Name` | `string` | 名称 |
| `Description` | `string` | 描述信息 |
| `Range` | `hcl.Range` | — |

**关联方法**（3 个）：`GoString`, `validateValue`, `Value`

### Variables

**定义位置**：[L175](file:///d:/claude/nomad/jobspec2/types.variables.go#L175)

**类型定义**：`type Variables map[string]*Variable`

**关联方法**（4 个）：`Keys`, `Values`, `decodeVariable`, `decodeVariableBlock`

### VariableValidation

**定义位置**：[L365](file:///d:/claude/nomad/jobspec2/types.variables.go#L365)

**中文说明**：VariableValidation 与评估（Evaluation）相关，评估是 Nomad 调度系统的工作单元。

**类型**：struct

```go
type VariableValidation struct {
	Condition hcl.Expression
	ErrorMessage string
	DeclRange hcl.Range
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Condition` | `hcl.Expression` | — |
| `ErrorMessage` | `string` | 字符串 |
| `DeclRange` | `hcl.Range` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `badIdentifierDetail` | `—` | `"A name must start with a letter or underscore and may co...` | — |
| `VarEnvPrefix` | `—` | `"NOMAD_VAR_"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `variableBlockSchema` | `—` | `&hcl.BodySchema{...}` | — |
| `variableValidationBlockSchema` | `—` | `&hcl.BodySchema{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `GoString` | `v *Variable` | `` | `string` | [L72](file:///d:/claude/nomad/jobspec2/types.variables.go#L72) |
| `validateValue` | `v *Variable` | `val VariableAssignment` | `diags hcl.Diagnostics` | [L84](file:///d:/claude/nomad/jobspec2/types.variables.go#L84) |
| `Value` | `v *Variable` | `` | `cty.Value, hcl.Diagnostics` | [L160](file:///d:/claude/nomad/jobspec2/types.variables.go#L160) |
| `Keys` | `variables *Variables` | `` | `[]string` | [L177](file:///d:/claude/nomad/jobspec2/types.variables.go#L177) |
| `Values` | `variables *Variables` | `` | `map[string]cty.Value, hcl.Diagnostics` | [L185](file:///d:/claude/nomad/jobspec2/types.variables.go#L185) |
| `decodeVariable` | `variables *Variables` | `key string, attr *hcl.Attribute, ectx *hcl.EvalContext` | `hcl.Diagnostics` | [L197](file:///d:/claude/nomad/jobspec2/types.variables.go#L197) |
| `decodeVariableBlock` | `variables *Variables` | `block *hcl.Block, ectx *hcl.EvalContext` | `hcl.Diagnostics` | [L254](file:///d:/claude/nomad/jobspec2/types.variables.go#L254) |
| `decodeVariableValidationBlock` | - | `varName string, block *hcl.Block` | `*VariableValidation, hcl.Diagnostics` | [L383](file:///d:/claude/nomad/jobspec2/types.variables.go#L383) |
| `looksLikeSentences` | - | `s string` | `bool` | [L474](file:///d:/claude/nomad/jobspec2/types.variables.go#L474) |
| `collectInputVariableValues` | `c *jobConfig` | `env []string, files []*hcl.File, argv map[string]string` | `hcl.Diagnostics` | [L498](file:///d:/claude/nomad/jobspec2/types.variables.go#L498) |
| `expressionFromVariableDefinition` | - | `filename string, value string, variableType cty.Type` | `hclsyntax.Expression, hcl.Diagnostics` | [L695](file:///d:/claude/nomad/jobspec2/types.variables.go#L695) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `strings` | 标准库 |
| `unicode` | 标准库 |
| `github.com/hashicorp/nomad/jobspec2/addrs` | 内部包 |
| `github.com/hashicorp/hcl/v2` | 第三方库 |
| `github.com/hashicorp/hcl/v2/ext/typeexpr` | 第三方库 |
| `github.com/hashicorp/hcl/v2/gohcl` | 第三方库 |
| `github.com/hashicorp/hcl/v2/hclsyntax` | 第三方库 |
| `github.com/zclconf/go-cty/cty` | 第三方库 |
| `github.com/zclconf/go-cty/cty/convert` | 第三方库 |

## 7. 设计模式与技术特点

- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [functions.go](file:///d:/claude/nomad/jobspec2/functions.go) | 同目录源文件 |
| [hcl_conversions.go](file:///d:/claude/nomad/jobspec2/hcl_conversions.go) | 同目录源文件 |
| [parse.go](file:///d:/claude/nomad/jobspec2/parse.go) | 同目录源文件 |
| [parse_job.go](file:///d:/claude/nomad/jobspec2/parse_job.go) | 同目录源文件 |
| [parse_map.go](file:///d:/claude/nomad/jobspec2/parse_map.go) | 同目录源文件 |

