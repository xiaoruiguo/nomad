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

**类型**：struct

```go
	Nested map[string]*StatObject
	Attributes map[string]*StatValue
```

### StatValue

**定义位置**：[L19](file:///d:/claude/nomad/plugins/shared/structs/stats.go#L19)

**类型**：struct

```go
	FloatNumeratorVal *float64 `json:",omitempty"`
	FloatDenominatorVal *float64 `json:",omitempty"`
	IntNumeratorVal *int64 `json:",omitempty"`
	IntDenominatorVal *int64 `json:",omitempty"`
	StringVal *string `json:",omitempty"`
	BoolVal *bool `json:",omitempty"`
	Unit string `json:",omitempty"`
	Desc string `json:",omitempty"`
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

该文件未定义方法。

## 5. 核心方法详解

## 6. 依赖关系

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|

