# flatmap.go 代码说明文档

> 文件路径：[helper/flatmap/flatmap.go](file:///d:/claude/nomad/helper/flatmap/flatmap.go)
> 总行数：131 行
> 所属包：`flatmap`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **工具包子包**（`helper/flatmap`），提供 Nomad 使用的通用工具函数和数据结构。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Flatten` | - | `obj interface{}, filter []string, primitiveOnly bool` | `map[string]string` | [L14](file:///d:/claude/nomad/helper/flatmap/flatmap.go#L14) |
| `flatten` | - | `prefix string, v reflect.Value, primitiveOnly bool, enteredStruct bool, outpu...` | `` | [L32](file:///d:/claude/nomad/helper/flatmap/flatmap.go#L32) |
| `getSubPrefix` | - | `curPrefix string, subField string` | `string` | [L116](file:///d:/claude/nomad/helper/flatmap/flatmap.go#L116) |
| `getSubKeyPrefix` | - | `curPrefix string, subField string` | `string` | [L125](file:///d:/claude/nomad/helper/flatmap/flatmap.go#L125) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `reflect` | 标准库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [flatmap_test.go](file:///d:/claude/nomad/helper/flatmap/flatmap_test.go) | 对应测试文件 |

