# stats.go 代码说明文档

> 文件路径：[plugins/shared/structs/stats.go](file:///d:/claude/nomad/plugins/shared/structs/stats.go)
> 总行数：42 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **插件共享工具子包**（`plugins/shared`），提供插件系统各组件共享的工具，包括 HCL 规格序列化、gRPC 流式日志转发和 proto 工具函数。

## 2. 类型定义

### StatObject

**定义位置**：[L8](file:///d:/claude/nomad/plugins/shared/structs/stats.go#L8)

**中文说明**：StatObject 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type StatObject struct {
	Nested map[string]*StatObject
	Attributes map[string]*StatValue
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Nested` | `map[string]*StatObject` | 映射表 |
| `Attributes` | `map[string]*StatValue` | 映射表 |

### StatValue

**定义位置**：[L19](file:///d:/claude/nomad/plugins/shared/structs/stats.go#L19)

**中文说明**：StatValue 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type StatValue struct {
	FloatNumeratorVal *float64 `json:",omitempty"`
	FloatDenominatorVal *float64 `json:",omitempty"`
	IntNumeratorVal *int64 `json:",omitempty"`
	IntDenominatorVal *int64 `json:",omitempty"`
	StringVal *string `json:",omitempty"`
	BoolVal *bool `json:",omitempty"`
	Unit string `json:",omitempty"`
	Desc string `json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `FloatNumeratorVal` | `*float64 `json:",omitempty"`` | — |
| `FloatDenominatorVal` | `*float64 `json:",omitempty"`` | — |
| `IntNumeratorVal` | `*int64 `json:",omitempty"`` | — |
| `IntDenominatorVal` | `*int64 `json:",omitempty"`` | — |
| `StringVal` | `*string `json:",omitempty"`` | 字符串 |
| `BoolVal` | `*bool `json:",omitempty"`` | 布尔值 |
| `Unit` | `string `json:",omitempty"`` | 字符串 |
| `Desc` | `string `json:",omitempty"`` | 描述信息 |

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

该文件未定义方法。

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

该文件无导入包。

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [attribute.go](file:///d:/claude/nomad/plugins/shared/structs/attribute.go) | 同目录源文件 |
| [plugin_reattach_config.go](file:///d:/claude/nomad/plugins/shared/structs/plugin_reattach_config.go) | 同目录源文件 |
| [units.go](file:///d:/claude/nomad/plugins/shared/structs/units.go) | 同目录源文件 |
| [util.go](file:///d:/claude/nomad/plugins/shared/structs/util.go) | 同目录源文件 |

