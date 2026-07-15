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

### NewAttr()

**签名**：`func NewAttr(name string, attrType string, required bool) *Spec`

**位置**：[L104](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L104)

### NewBlock()

**签名**：`func NewBlock(name string, required bool, nested *Spec) *Spec`

**位置**：[L113](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L113)

### NewBlockAttrs()

**签名**：`func NewBlockAttrs(name string, elementType string, required bool) *Spec`

**位置**：[L122](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L122)

### NewBlockList()

**签名**：`func NewBlockList(name string, nested *Spec) *Spec`

**位置**：[L131](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L131)

### NewBlockListLimited()

**签名**：`func NewBlockListLimited(name string, min uint64, max uint64, nested *Spec) *Spec`

**位置**：[L137](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L137)

### NewBlockSet()

**签名**：`func NewBlockSet(name string, nested *Spec) *Spec`

**位置**：[L147](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L147)

### NewBlockSetLimited()

**签名**：`func NewBlockSetLimited(name string, min uint64, max uint64, nested *Spec) *Spec`

**位置**：[L153](file:///d:/claude/nomad/plugins/shared/hclspec/spec.go#L153)

## 6. 依赖关系

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|

