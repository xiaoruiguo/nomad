# idset.go 代码说明文档

> 文件路径：[lib/idset/idset.go](file:///d:/claude/nomad/client/lib/idset/idset.go)
> 总行数：220 行
> 所属包：`idset`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **ID 集合子包**（`client/lib/idset`），提供 ID 集合的通用工具。

## 2. 类型定义

### ID

**定义位置**：[L22](file:///d:/claude/nomad/client/lib/idset/idset.go#L22)

**类型**：interface

```go
	~uint8 | ~uint16 | ~uint32 | ~uint64 | ~uint
```

### Set

**定义位置**：[L31](file:///d:/claude/nomad/client/lib/idset/idset.go#L31)

**类型**：struct

```go
	items *set.Set[T]
```

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `numberRe` | `regexp.MustCompile(`^\d+$`)` |
| `spanRe` | `regexp.MustCompile(`^(\d+)-(\d+)$`)` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Empty` | - | - | `*Set[T]` | [L36](file:///d:/claude/nomad/client/lib/idset/idset.go#L36) |
| `FromFunc` | - | `values []A, convert func(...)` | `*Set[T]` | [L44](file:///d:/claude/nomad/client/lib/idset/idset.go#L44) |
| `Copy` | `s *Set[T]` | - | `*Set[T]` | [L51](file:///d:/claude/nomad/client/lib/idset/idset.go#L51) |
| `atoi` | - | `s string` | `T` | [L60](file:///d:/claude/nomad/client/lib/idset/idset.go#L60) |
| `order` | - | `a T, b T` | `T, T` | [L65](file:///d:/claude/nomad/client/lib/idset/idset.go#L65) |
| `Parse` | - | `list string` | `*Set[T]` | [L75](file:///d:/claude/nomad/client/lib/idset/idset.go#L75) |
| `From` | - | `slice []U` | `*Set[T]` | [L101](file:///d:/claude/nomad/client/lib/idset/idset.go#L101) |
| `Difference` | `s *Set[T]` | `other *Set[T]` | `*Set[T]` | [L110](file:///d:/claude/nomad/client/lib/idset/idset.go#L110) |
| `Intersect` | `s *Set[T]` | `other *Set[T]` | `*Set[T]` | [L116](file:///d:/claude/nomad/client/lib/idset/idset.go#L116) |
| `Contains` | `s *Set[T]` | `item T` | `bool` | [L122](file:///d:/claude/nomad/client/lib/idset/idset.go#L122) |
| `Insert` | `s *Set[T]` | `item T` | - | [L127](file:///d:/claude/nomad/client/lib/idset/idset.go#L127) |
| `Slice` | `s *Set[T]` | - | `[]T` | [L132](file:///d:/claude/nomad/client/lib/idset/idset.go#L132) |
| `InsertSet` | `s *Set[T]` | `other *Set[T]` | - | [L139](file:///d:/claude/nomad/client/lib/idset/idset.go#L139) |
| `RemoveSet` | `s *Set[T]` | `other *Set[T]` | - | [L144](file:///d:/claude/nomad/client/lib/idset/idset.go#L144) |
| `String` | `s *Set[T]` | - | `string` | [L149](file:///d:/claude/nomad/client/lib/idset/idset.go#L149) |
| `ForEach` | `s *Set[T]` | `f func(...)` | `error` | [L186](file:///d:/claude/nomad/client/lib/idset/idset.go#L186) |
| `Size` | `s *Set[T]` | - | `int` | [L196](file:///d:/claude/nomad/client/lib/idset/idset.go#L196) |
| `Empty` | `s *Set[T]` | - | `bool` | [L201](file:///d:/claude/nomad/client/lib/idset/idset.go#L201) |
| `InsertSlice` | - | `s *Set[T], items ...X` | - | [L209](file:///d:/claude/nomad/client/lib/idset/idset.go#L209) |
| `Superset` | `s *Set[T]` | `other *Set[T]` | `bool` | [L216](file:///d:/claude/nomad/client/lib/idset/idset.go#L216) |

## 5. 核心方法详解

### Parse()

**签名**：`func Parse(list string) *Set[T]`

**位置**：[L75](file:///d:/claude/nomad/client/lib/idset/idset.go#L75)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `regexp` | 标准库 |
| `slices` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [idset_test.go](file:///d:/claude/nomad/client/lib/idset/idset_test.go) | 对应测试文件 |

