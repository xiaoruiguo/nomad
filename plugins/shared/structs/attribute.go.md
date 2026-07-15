# attribute.go 代码说明文档

> 文件路径：[plugins/shared/structs/attribute.go](file:///d:/claude/nomad/plugins/shared/structs/attribute.go)
> 总行数：467 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **插件共享工具子包**（`plugins/shared`），提供插件系统各组件共享的工具，包括 HCL 规格序列化、gRPC 流式日志转发和 proto 工具函数。

## 2. 类型定义

### BaseUnit

**定义位置**：[L24](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L24)

**类型定义**：`type BaseUnit uint16`

### Unit

**定义位置**：[L35](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L35)

**中文说明**：Unit 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Unit struct {
	Name string
	Base BaseUnit
	Multiplier int64
	InverseMultiplier bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Base` | `BaseUnit` | — |
| `Multiplier` | `int64` | — |
| `InverseMultiplier` | `bool` | 布尔值 |

**关联方法**（1 个）：`Comparable`

### Attribute

**定义位置**：[L108](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L108)

**中文说明**：Attribute 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Attribute struct {
	Float *float64
	Int *int64
	String *string
	Bool *bool
	Unit string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Float` | `*float64` | — |
| `Int` | `*int64` | — |
| `String` | `*string` | 字符串 |
| `Bool` | `*bool` | 布尔值 |
| `Unit` | `string` | 字符串 |

**关联方法**（18 个）：`GetString`, `GetBool`, `GetInt`, `GetFloat`, `Copy`, `GoString`, `Validate`, `Comparable`, `Compare`, `Equal`, `comparator`, `boolComparator`, `stringComparator`, `numberComparator`, `intComparator`, `getBigFloat`, `getInt`, `getTypedUnit`

### compareFn

**定义位置**：[L400](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L400)

**类型定义**：`type compareFn func(...)`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `floatPrecision` | `—` | `uint(256)` | — |
| `UnitScalar` | `BaseUnit` | `iota` | — |
| `UnitByte` | `—` | `` | — |
| `UnitByteRate` | `—` | `` | — |
| `UnitHertz` | `—` | `` | — |
| `UnitWatt` | `—` | `` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Comparable` | `u *Unit` | `o *Unit` | `bool` | [L51](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L51) |
| `ParseAttribute` | - | `input string` | `*Attribute` | [L61](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L61) |
| `NewStringAttribute` | - | `s string` | `*Attribute` | [L126](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L126) |
| `NewBoolAttribute` | - | `b bool` | `*Attribute` | [L133](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L133) |
| `NewIntAttribute` | - | `i int64, unit string` | `*Attribute` | [L141](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L141) |
| `NewFloatAttribute` | - | `f float64, unit string` | `*Attribute` | [L150](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L150) |
| `GetString` | `a *Attribute` | `` | `value string, ok bool` | [L159](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L159) |
| `GetBool` | `a *Attribute` | `` | `value bool, ok bool` | [L169](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L169) |
| `GetInt` | `a *Attribute` | `` | `value int64, ok bool` | [L179](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L179) |
| `GetFloat` | `a *Attribute` | `` | `value float64, ok bool` | [L189](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L189) |
| `Copy` | `a *Attribute` | `` | `*Attribute` | [L198](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L198) |
| `GoString` | `a *Attribute` | `` | `string` | [L224](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L224) |
| `Validate` | `a *Attribute` | `` | `error` | [L248](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L248) |
| `Comparable` | `a *Attribute` | `b *Attribute` | `bool` | [L285](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L285) |
| `Compare` | `a *Attribute` | `b *Attribute` | `int, bool` | [L317](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L317) |
| `Equal` | `a *Attribute` | `b *Attribute` | `bool` | [L326](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L326) |
| `comparator` | `a *Attribute` | `` | `compareFn` | [L332](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L332) |
| `boolComparator` | `a *Attribute` | `b *Attribute` | `int, bool` | [L347](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L347) |
| `stringComparator` | `a *Attribute` | `b *Attribute` | `int, bool` | [L356](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L356) |
| `numberComparator` | `a *Attribute` | `b *Attribute` | `int, bool` | [L362](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L362) |
| `intComparator` | `a *Attribute` | `b *Attribute` | `int, bool` | [L379](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L379) |
| `nullComparator` | - | `*Attribute` | `int, bool` | [L394](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L394) |
| `getBigFloat` | `a *Attribute` | `` | `*big.Float` | [L404](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L404) |
| `getInt` | `a *Attribute` | `` | `int64` | [L439](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L439) |
| `getTypedUnit` | `a *Attribute` | `` | `*Unit` | [L464](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L464) |

## 5. 核心方法详解

### NewStringAttribute()

**签名**：`func NewStringAttribute(s string) *Attribute`

**位置**：[L126](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L126)

**中文说明**：创建并返回一个新的 StringAttribute 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `s` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Attribute` | — |

### NewBoolAttribute()

**签名**：`func NewBoolAttribute(b bool) *Attribute`

**位置**：[L133](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L133)

**中文说明**：创建并返回一个新的 BoolAttribute 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `b` | `bool` | 布尔值 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Attribute` | — |

### NewIntAttribute()

**签名**：`func NewIntAttribute(i int64, unit string) *Attribute`

**位置**：[L141](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L141)

**中文说明**：创建并返回一个新的 IntAttribute 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `i` | `int64` | — |
| `unit` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Attribute` | — |

### NewFloatAttribute()

**签名**：`func NewFloatAttribute(f float64, unit string) *Attribute`

**位置**：[L150](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L150)

**中文说明**：创建并返回一个新的 FloatAttribute 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `f` | `float64` | — |
| `unit` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Attribute` | — |

### Copy()

**签名**：`func (a *Attribute) Copy() *Attribute`

**位置**：[L198](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L198)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Attribute` | — |

### Validate()

**签名**：`func (a *Attribute) Validate() error`

**位置**：[L248](file:///d:/claude/nomad/plugins/shared/structs/attribute.go#L248)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `math/big` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `unicode` | 标准库 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |

## 7. 设计模式与技术特点

- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [attribute_test.go](file:///d:/claude/nomad/plugins/shared/structs/attribute_test.go) | 对应测试文件 |
| [plugin_reattach_config.go](file:///d:/claude/nomad/plugins/shared/structs/plugin_reattach_config.go) | 同目录源文件 |
| [stats.go](file:///d:/claude/nomad/plugins/shared/structs/stats.go) | 同目录源文件 |
| [units.go](file:///d:/claude/nomad/plugins/shared/structs/units.go) | 同目录源文件 |
| [util.go](file:///d:/claude/nomad/plugins/shared/structs/util.go) | 同目录源文件 |

