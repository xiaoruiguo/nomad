# util.go 代码说明文档

> 文件路径：[plugins/shared/structs/util.go](file:///d:/claude/nomad/plugins/shared/structs/util.go)
> 总行数：258 行
> 所属包：`structs`
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
| `ConvertProtoAttribute` | - | `in *proto.Attribute` | `*Attribute` | [L12](file:///d:/claude/nomad/plugins/shared/structs/util.go#L12) |
| `ConvertProtoAttributeMap` | - | `in map[string]*proto.Attribute` | `map[string]*Attribute` | [L32](file:///d:/claude/nomad/plugins/shared/structs/util.go#L32) |
| `ConvertStructsAttribute` | - | `in *Attribute` | `*proto.Attribute` | [L45](file:///d:/claude/nomad/plugins/shared/structs/util.go#L45) |
| `ConvertStructAttributeMap` | - | `in map[string]*Attribute` | `map[string]*proto.Attribute` | [L71](file:///d:/claude/nomad/plugins/shared/structs/util.go#L71) |
| `Pow` | - | `a int64, b int64` | `int64` | [L84](file:///d:/claude/nomad/plugins/shared/structs/util.go#L84) |
| `CopyMapStringAttribute` | - | `in map[string]*Attribute` | `map[string]*Attribute` | [L97](file:///d:/claude/nomad/plugins/shared/structs/util.go#L97) |
| `ConvertProtoStatObject` | - | `in *proto.StatObject` | `*StatObject` | [L110](file:///d:/claude/nomad/plugins/shared/structs/util.go#L110) |
| `ConvertProtoStatValue` | - | `in *proto.StatValue` | `*StatValue` | [L132](file:///d:/claude/nomad/plugins/shared/structs/util.go#L132) |
| `ConvertStructStatObject` | - | `in *StatObject` | `*proto.StatObject` | [L150](file:///d:/claude/nomad/plugins/shared/structs/util.go#L150) |
| `ConvertStructStatValue` | - | `in *StatValue` | `*proto.StatValue` | [L172](file:///d:/claude/nomad/plugins/shared/structs/util.go#L172) |
| `unwrapDouble` | - | `w *wrappers.DoubleValue` | `*float64` | [L191](file:///d:/claude/nomad/plugins/shared/structs/util.go#L191) |
| `wrapDouble` | - | `v *float64` | `*wrappers.DoubleValue` | [L200](file:///d:/claude/nomad/plugins/shared/structs/util.go#L200) |
| `unwrapInt64` | - | `w *wrappers.Int64Value` | `*int64` | [L208](file:///d:/claude/nomad/plugins/shared/structs/util.go#L208) |
| `wrapInt64` | - | `v *int64` | `*wrappers.Int64Value` | [L217](file:///d:/claude/nomad/plugins/shared/structs/util.go#L217) |
| `unwrapString` | - | `w *wrappers.StringValue` | `*string` | [L225](file:///d:/claude/nomad/plugins/shared/structs/util.go#L225) |
| `wrapString` | - | `v *string` | `*wrappers.StringValue` | [L234](file:///d:/claude/nomad/plugins/shared/structs/util.go#L234) |
| `unwrapBool` | - | `w *wrappers.BoolValue` | `*bool` | [L242](file:///d:/claude/nomad/plugins/shared/structs/util.go#L242) |
| `wrapBool` | - | `v *bool` | `*wrappers.BoolValue` | [L251](file:///d:/claude/nomad/plugins/shared/structs/util.go#L251) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/plugins/shared/structs/proto` | 内部包 |
| `github.com/golang/protobuf/ptypes/wrappers` | 第三方库 |

## 7. 设计模式与技术特点

- **gRPC 通信**：使用 gRPC 进行进程间通信

## 8. 相关文件

| 文件 | 关系 |
|------|------|

