# data_format.go 代码说明文档

> 文件路径：[data_format.go](file:///d:/claude/nomad/command/data_format.go)
> 总行数：115 行
> 所属包：`command`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件是 Nomad CLI `command` 包的源码文件，提供命令实现或辅助功能。

## 2. 类型定义

### DataFormatter

**类型**：interface

### JSONFormat

**类型**：struct

### TemplateFormat

**类型**：struct

```go
	tmpl string
```

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `jsonHandlePretty` | `*ast.UnaryExpr` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `DataFormat` | - | `format string, tmpl string` | `DataFormatter, error` | [L29](file:///d:/claude/nomad/command/data_format.go#L29) |
| `TransformData` | `p *JSONFormat` | `data interface{}` | `string, error` | [L45](file:///d:/claude/nomad/command/data_format.go#L45) |
| `TransformData` | `p *TemplateFormat` | `data interface{}` | `string, error` | [L60](file:///d:/claude/nomad/command/data_format.go#L60) |
| `Format` | - | `json bool, template string, data interface{}` | `string, error` | [L78](file:///d:/claude/nomad/command/data_format.go#L78) |
| `makeFuncMap` | - | - | `template.FuncMap` | [L103](file:///d:/claude/nomad/command/data_format.go#L103) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `fmt` | 标准库 |
| `text/template` | 标准库 |
| `github.com/Masterminds/sprig/v3` | 第三方库 |
| `github.com/hashicorp/go-msgpack/v2/codec` | 第三方库 |

## 7. 设计模式与约定

该文件遵循 Nomad CLI 命令的标准实现模式：

1. **嵌入 Meta**：命令结构体嵌入 `Meta`，获取 API 客户端、UI 输出、flag 解析等通用能力
2. **实现 cli.Command 接口**：`Name()`、`Run()`、`Help()`、`Synopsis()` 四个必需方法
3. **可选自动补全**：实现 `AutocompleteFlags()` / `AutocompleteArgs()` 提供 shell 补全
4. **Flag 解析**：通过 `m.FlagSet()` 创建 flag 集，支持 `-address`、`-region`、`-namespace` 等通用 flag

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [meta.go](file:///d:/claude/nomad/command/meta.go) | `Meta` 结构体定义，提供通用 CLI 基础设施 |
| [helpers.go](file:///d:/claude/nomad/command/helpers.go) | CLI 辅助函数（格式化、Job 解析等） |
| [../api/api.go](file:///d:/claude/nomad/api/api.go) | Go API 客户端库 |
| [data_format_test.go](file:///d:/claude/nomad/command/data_format_test.go) | 对应测试文件 |

