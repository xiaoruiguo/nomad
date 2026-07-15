# spec.go 代码说明文档

> 文件路径：[plugins/shared/hclspec/spec.go](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go)
> 总行数：192 行
> 所属包：`hclspec`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **插件共享工具子包**（`plugins/shared`），提供插件系统各组件共享的工具，包括 HCL 规格序列化、gRPC 流式日志转发和 proto 工具函数。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ObjectSpec` | - | `obj *Object` | `*Spec` | [L7](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L7) |
| `ArraySpec` | - | `array *Array` | `*Spec` | [L16](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L16) |
| `AttrSpec` | - | `attr *Attr` | `*Spec` | [L25](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L25) |
| `BlockSpec` | - | `block *Block` | `*Spec` | [L34](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L34) |
| `BlockAttrsSpec` | - | `blockAttrs *BlockAttrs` | `*Spec` | [L43](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L43) |
| `BlockListSpec` | - | `blockList *BlockList` | `*Spec` | [L52](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L52) |
| `BlockSetSpec` | - | `blockSet *BlockSet` | `*Spec` | [L61](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L61) |
| `BlockMapSpec` | - | `blockMap *BlockMap` | `*Spec` | [L70](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L70) |
| `DefaultSpec` | - | `d *Default` | `*Spec` | [L79](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L79) |
| `LiteralSpec` | - | `l *Literal` | `*Spec` | [L88](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L88) |
| `NewObject` | - | `attrs map[string]*Spec` | `*Spec` | [L97](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L97) |
| `NewAttr` | - | `name string, attrType string, required bool` | `*Spec` | [L104](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L104) |
| `NewBlock` | - | `name string, required bool, nested *Spec` | `*Spec` | [L113](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L113) |
| `NewBlockAttrs` | - | `name string, elementType string, required bool` | `*Spec` | [L122](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L122) |
| `NewBlockList` | - | `name string, nested *Spec` | `*Spec` | [L131](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L131) |
| `NewBlockListLimited` | - | `name string, min uint64, max uint64, nested *Spec` | `*Spec` | [L137](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L137) |
| `NewBlockSet` | - | `name string, nested *Spec` | `*Spec` | [L147](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L147) |
| `NewBlockSetLimited` | - | `name string, min uint64, max uint64, nested *Spec` | `*Spec` | [L153](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L153) |
| `NewBlockMap` | - | `name string, labels []string, nested *Spec` | `*Spec` | [L163](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L163) |
| `NewLiteral` | - | `value string` | `*Spec` | [L172](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L172) |
| `NewDefault` | - | `primary *Spec, defaultValue *Spec` | `*Spec` | [L179](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L179) |
| `NewArray` | - | `values []*Spec` | `*Spec` | [L187](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L187) |

## 5. 核心方法详解

### NewObject()

**签名**：`func NewObject(attrs map[string]*Spec) *Spec`

**位置**：[L97](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L97)

**中文说明**：创建并返回一个新的 Object 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `attrs` | `map[string]*Spec` | 映射表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Spec` | — |

### NewAttr()

**签名**：`func NewAttr(name string, attrType string, required bool) *Spec`

**位置**：[L104](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L104)

**中文说明**：创建并返回一个新的 Attr 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 名称 |
| `attrType` | `string` | 字符串 |
| `required` | `bool` | 布尔值 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Spec` | — |

### NewBlock()

**签名**：`func NewBlock(name string, required bool, nested *Spec) *Spec`

**位置**：[L113](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L113)

**中文说明**：创建并返回一个新的 Block 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 名称 |
| `required` | `bool` | 布尔值 |
| `nested` | `*Spec` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Spec` | — |

### NewBlockAttrs()

**签名**：`func NewBlockAttrs(name string, elementType string, required bool) *Spec`

**位置**：[L122](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L122)

**中文说明**：创建并返回一个新的 BlockAttrs 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 名称 |
| `elementType` | `string` | 字符串 |
| `required` | `bool` | 布尔值 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Spec` | — |

### NewBlockList()

**签名**：`func NewBlockList(name string, nested *Spec) *Spec`

**位置**：[L131](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L131)

**中文说明**：创建并返回一个新的 BlockList 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 名称 |
| `nested` | `*Spec` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Spec` | — |

### NewBlockListLimited()

**签名**：`func NewBlockListLimited(name string, min uint64, max uint64, nested *Spec) *Spec`

**位置**：[L137](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L137)

**中文说明**：创建并返回一个新的 BlockListLimited 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 名称 |
| `min` | `uint64` | 最小值 |
| `max` | `uint64` | 最大值 |
| `nested` | `*Spec` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Spec` | — |

### NewBlockSet()

**签名**：`func NewBlockSet(name string, nested *Spec) *Spec`

**位置**：[L147](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L147)

**中文说明**：创建并返回一个新的 BlockSet 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 名称 |
| `nested` | `*Spec` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Spec` | — |

### NewBlockSetLimited()

**签名**：`func NewBlockSetLimited(name string, min uint64, max uint64, nested *Spec) *Spec`

**位置**：[L153](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L153)

**中文说明**：创建并返回一个新的 BlockSetLimited 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 名称 |
| `min` | `uint64` | 最小值 |
| `max` | `uint64` | 最大值 |
| `nested` | `*Spec` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Spec` | — |

### NewBlockMap()

**签名**：`func NewBlockMap(name string, labels []string, nested *Spec) *Spec`

**位置**：[L163](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L163)

**中文说明**：创建并返回一个新的 BlockMap 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 名称 |
| `labels` | `[]string` | 标签 |
| `nested` | `*Spec` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Spec` | — |

### NewLiteral()

**签名**：`func NewLiteral(value string) *Spec`

**位置**：[L172](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L172)

**中文说明**：创建并返回一个新的 Literal 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `value` | `string` | 值 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Spec` | — |

### NewDefault()

**签名**：`func NewDefault(primary *Spec, defaultValue *Spec) *Spec`

**位置**：[L179](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L179)

**中文说明**：创建并返回一个新的 Default 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `primary` | `*Spec` | — |
| `defaultValue` | `*Spec` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Spec` | — |

### NewArray()

**签名**：`func NewArray(values []*Spec) *Spec`

**位置**：[L187](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L187)

**中文说明**：创建并返回一个新的 Array 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `values` | `[]*Spec` | 列表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Spec` | — |

## 6. 依赖关系

该文件无导入包。

## 7. 设计模式与技术特点

- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [hcl_spec.pb.go](file:///d:/claude/nomad/plugins/shared/hclspec/hcl_spec.pb.go) | 同目录源文件 |

