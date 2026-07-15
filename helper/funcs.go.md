# funcs.go 代码说明文档

> 文件路径：[funcs.go](file:///d:/claude/nomad/helper/funcs.go)
> 总行数：580 行
> 所属包：`helper`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件提供 **通用工具函数集合**，包含 UUID 验证、字符串处理、文件名清理、Map 复制、切片操作、时间格式化等常用辅助函数。是 Nomad 中最常用的工具函数集合。

## 2. 类型定义

### Copyable

**定义位置**：[L44](file:///d:/claude/nomad/helper/funcs.go#L44)

**类型**：interface

```go
	Copy
```

### StopFunc

**定义位置**：[L362](file:///d:/claude/nomad/helper/funcs.go#L362)

**类型定义**：`func(...)`

### EqualFunc

**定义位置**：[L461](file:///d:/claude/nomad/helper/funcs.go#L461)

**类型**：interface

```go
	Equal
```

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `validUUID` | `regexp.MustCompile(`(?i)^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}...` |
| `validInterpVarKey` | `regexp.MustCompile(`^[^.]+(\.[^.]+)*$`)` |
| `invalidFilename` | `regexp.MustCompile(`[/\\<>:"\|?*]`)` |
| `invalidFilenameNonASCII` | `regexp.MustCompile(`[[:^ascii:]/\\<>:"\|?*]`)` |
| `invalidFilenameStrict` | `regexp.MustCompile(`[/\\<>:"\|?*$()+=[\];#@~,&']`)` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `IsUUID` | - | `str string` | `bool` | [L49](file:///d:/claude/nomad/helper/funcs.go#L49) |
| `IsValidInterpVariable` | - | `str string` | `bool` | [L62](file:///d:/claude/nomad/helper/funcs.go#L62) |
| `HashUUID` | - | `input string` | `output string, hashed bool` | [L68](file:///d:/claude/nomad/helper/funcs.go#L68) |
| `UniqueMapSliceValues` | - | `m map[K][]V` | `[]V` | [L86](file:///d:/claude/nomad/helper/funcs.go#L86) |
| `IsSubset` | - | `larger []T, smaller []T` | `bool, []T` | [L97](file:///d:/claude/nomad/helper/funcs.go#L97) |
| `StringHasPrefixInSlice` | - | `s string, prefixes []string` | `bool` | [L107](file:///d:/claude/nomad/helper/funcs.go#L107) |
| `IsDisjoint` | - | `first []T, second []T` | `bool, []T` | [L118](file:///d:/claude/nomad/helper/funcs.go#L118) |
| `DeepCopyMap` | - | `m M` | `M` | [L130](file:///d:/claude/nomad/helper/funcs.go#L130) |
| `CopySlice` | - | `s S` | `S` | [L144](file:///d:/claude/nomad/helper/funcs.go#L144) |
| `MergeMapStringString` | - | `m map[string]string, n map[string]string` | `map[string]string` | [L159](file:///d:/claude/nomad/helper/funcs.go#L159) |
| `CopyMapOfSlice` | - | `m map[K][]V` | `map[K][]V` | [L180](file:///d:/claude/nomad/helper/funcs.go#L180) |
| `SliceToMap` | - | `slice []V, keyFn func(...)` | `M` | [L196](file:///d:/claude/nomad/helper/funcs.go#L196) |
| `CleanEnvVar` | - | `s string, r byte` | `string` | [L206](file:///d:/claude/nomad/helper/funcs.go#L206) |
| `CleanFilename` | - | `filename string, replace string` | `string` | [L224](file:///d:/claude/nomad/helper/funcs.go#L224) |
| `CleanFilenameASCIIOnly` | - | `filename string, replace string` | `string` | [L230](file:///d:/claude/nomad/helper/funcs.go#L230) |
| `CleanFilenameStrict` | - | `filename string, replace string` | `string` | [L236](file:///d:/claude/nomad/helper/funcs.go#L236) |
| `CheckHCLKeys` | - | `node ast.Node, valid []string` | `error` | [L241](file:///d:/claude/nomad/helper/funcs.go#L241) |
| `UnusedKeys` | - | `obj interface{}` | `error` | [L270](file:///d:/claude/nomad/helper/funcs.go#L270) |
| `unusedKeysImpl` | - | `path []string, val reflect.Value` | `error` | [L278](file:///d:/claude/nomad/helper/funcs.go#L278) |
| `RemoveEqualFold` | - | `xs *[]string, search string` | - | [L326](file:///d:/claude/nomad/helper/funcs.go#L326) |
| `CheckNamespaceScope` | - | `provided string, requested []string` | `[]string` | [L344](file:///d:/claude/nomad/helper/funcs.go#L344) |
| `NewSafeTimer` | - | `duration time.Duration` | `*time.Timer, StopFunc` | [L374](file:///d:/claude/nomad/helper/funcs.go#L374) |
| `NewSafeTicker` | - | `duration time.Duration` | `*time.Ticker, StopFunc` | [L395](file:///d:/claude/nomad/helper/funcs.go#L395) |
| `NewStoppedTimer` | - | - | `*time.Timer, StopFunc` | [L414](file:///d:/claude/nomad/helper/funcs.go#L414) |
| `ConvertSlice` | - | `original []A, conversion func(...)` | `[]B` | [L423](file:///d:/claude/nomad/helper/funcs.go#L423) |
| `ConvertMap` | - | `original map[K]A, conversion func(...)` | `map[K]B` | [L434](file:///d:/claude/nomad/helper/funcs.go#L434) |
| `IsMethodHTTP` | - | `s string` | `bool` | [L443](file:///d:/claude/nomad/helper/funcs.go#L443) |
| `ElementsEqual` | - | `a []T, b []T` | `bool` | [L468](file:///d:/claude/nomad/helper/funcs.go#L468) |
| `SliceSetEq` | - | `a []T, b []T` | `bool` | [L489](file:///d:/claude/nomad/helper/funcs.go#L489) |
| `WithLock` | - | `lock sync.Locker, f func(...)` | - | [L513](file:///d:/claude/nomad/helper/funcs.go#L513) |
| `Merge` | - | `a T, b T` | `T` | [L521](file:///d:/claude/nomad/helper/funcs.go#L521) |
| `FlattenMultierror` | - | `err error` | `error` | [L531](file:///d:/claude/nomad/helper/funcs.go#L531) |
| `FindExecutableFiles` | - | `path string` | `map[string]string, error` | [L548](file:///d:/claude/nomad/helper/funcs.go#L548) |
| `IsSubdirectory` | - | `potentialParent string, path string` | `bool` | [L573](file:///d:/claude/nomad/helper/funcs.go#L573) |

## 5. 核心方法详解

### NewSafeTimer()

**签名**：`func NewSafeTimer(duration time.Duration) *time.Timer, StopFunc`

**位置**：[L374](file:///d:/claude/nomad/helper/funcs.go#L374)

### NewSafeTicker()

**签名**：`func NewSafeTicker(duration time.Duration) *time.Ticker, StopFunc`

**位置**：[L395](file:///d:/claude/nomad/helper/funcs.go#L395)

### NewStoppedTimer()

**签名**：`func NewStoppedTimer() *time.Timer, StopFunc`

**位置**：[L414](file:///d:/claude/nomad/helper/funcs.go#L414)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `crypto/sha512` | 标准库 |
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `math` | 标准库 |
| `net/http` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `reflect` | 标准库 |
| `regexp` | 标准库 |
| `slices` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/hashicorp/hcl/hcl/ast` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **加密安全**：使用 Go crypto 标准库实现加密、签名或 TLS 通信
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [funcs_test.go](file:///d:/claude/nomad/helper/funcs_test.go) | 对应测试文件 |

