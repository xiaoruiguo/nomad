# bitmap.go 代码说明文档

> 文件路径：[nomad/structs/bitmap.go](file:///d:/claude/nomad/nomad/structs/bitmap.go)
> 总行数：107 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，包含 10 个方法/函数。

## 2. 类型定义

### Bitmap

**定义位置**：[L12](file:///d:/claude/nomad/nomad/structs/bitmap.go#L12)

**类型定义**：`type Bitmap []byte`

**关联方法**（9 个）：`Copy`, `Size`, `Set`, `Unset`, `Check`, `Clear`, `IndexesInRange`, `IndexesInRangeFiltered`, `String`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewBitmap` | - | `size uint` | `Bitmap, error` | [L15](file:///d:/claude/nomad/nomad/structs/bitmap.go#L15) |
| `Copy` | `b *Bitmap` | `` | `Bitmap, error` | [L27](file:///d:/claude/nomad/nomad/structs/bitmap.go#L27) |
| `Size` | `b *Bitmap` | `` | `uint` | [L38](file:///d:/claude/nomad/nomad/structs/bitmap.go#L38) |
| `Set` | `b *Bitmap` | `idx uint` | `` | [L43](file:///d:/claude/nomad/nomad/structs/bitmap.go#L43) |
| `Unset` | `b *Bitmap` | `idx uint` | `` | [L50](file:///d:/claude/nomad/nomad/structs/bitmap.go#L50) |
| `Check` | `b *Bitmap` | `idx uint` | `bool` | [L59](file:///d:/claude/nomad/nomad/structs/bitmap.go#L59) |
| `Clear` | `b *Bitmap` | `` | `` | [L66](file:///d:/claude/nomad/nomad/structs/bitmap.go#L66) |
| `IndexesInRange` | `b *Bitmap` | `set bool, from uint, to uint` | `[]int` | [L74](file:///d:/claude/nomad/nomad/structs/bitmap.go#L74) |
| `IndexesInRangeFiltered` | `b *Bitmap` | `set bool, from uint, to uint, filter []int` | `[]int` | [L89](file:///d:/claude/nomad/nomad/structs/bitmap.go#L89) |
| `String` | `b *Bitmap` | `` | `string` | [L104](file:///d:/claude/nomad/nomad/structs/bitmap.go#L104) |

## 5. 核心方法详解

### NewBitmap()

**签名**：`func NewBitmap(size uint) Bitmap, error`

**位置**：[L15](file:///d:/claude/nomad/nomad/structs/bitmap.go#L15)

**中文说明**：创建并返回一个新的 Bitmap 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `size` | `uint` | 大小 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `Bitmap` | — |
| `error` | 错误信息 |

### Copy()

**签名**：`func (b *Bitmap) Copy() Bitmap, error`

**位置**：[L27](file:///d:/claude/nomad/nomad/structs/bitmap.go#L27)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `Bitmap` | — |
| `error` | 错误信息 |

### Set()

**签名**：`func (b *Bitmap) Set(idx uint) `

**位置**：[L43](file:///d:/claude/nomad/nomad/structs/bitmap.go#L43)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `idx` | `uint` | — |

### Check()

**签名**：`func (b *Bitmap) Check(idx uint) bool`

**位置**：[L59](file:///d:/claude/nomad/nomad/structs/bitmap.go#L59)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `idx` | `uint` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `bool` | 布尔值 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `slices` | 标准库 |

## 7. 设计模式与技术特点

- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [bitmap_test.go](file:///d:/claude/nomad/nomad/structs/bitmap_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

