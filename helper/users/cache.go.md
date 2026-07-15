# cache.go 代码说明文档

> 文件路径：[users/cache.go](file:///d:/claude/nomad/helper/users/cache.go)
> 总行数：89 行
> 所属包：`users`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **用户查找子包**（`helper/users`），实现系统用户查找（UID/GID 解析），支持缓存和跨平台兼容，用于任务执行的用户身份切换。

## 2. 类型定义

### entry

**定义位置**：[L20](file:///d:/claude/nomad/helper/users/cache.go#L20)

**类型定义**：`lang.Pair[T, time.Time]`

### userCache

**定义位置**：[L27](file:///d:/claude/nomad/helper/users/cache.go#L27)

**类型定义**：`map[string]*entry[*user.User]`

### userFailureCache

**定义位置**：[L28](file:///d:/claude/nomad/helper/users/cache.go#L28)

**类型定义**：`map[string]*entry[error]`

### lookupUserFunc

**定义位置**：[L31](file:///d:/claude/nomad/helper/users/cache.go#L31)

**类型定义**：`func(...)`

### cache

**定义位置**：[L33](file:///d:/claude/nomad/helper/users/cache.go#L33)

**类型**：struct

```go
	clock libtime.Clock
	lookupUser lookupUserFunc
	lock sync.Mutex
	users userCache
	userFailures userFailureCache
```

**关联方法**（1 个）：`GetUser`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `cacheTTL` | `1 * time.Hour` |
| `failureTTL` | `1 * time.Minute` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `expired` | `e *entry[T]` | `now time.Time, ttl time.Duration` | `bool` | [L22](file:///d:/claude/nomad/helper/users/cache.go#L22) |
| `newCache` | - | - | `*cache` | [L42](file:///d:/claude/nomad/helper/users/cache.go#L42) |
| `GetUser` | `c *cache` | `username string` | `*user.User, error` | [L51](file:///d:/claude/nomad/helper/users/cache.go#L51) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `os/user` | 标准库 |
| `oss.indeed.com/go/libtime` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/lib/lang` | 内部包 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **泛型编程**：使用 Go 泛型实现类型安全的通用工具
- **缓存模式**：实现缓存机制，减少重复计算或 I/O 操作

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [cache_test.go](file:///d:/claude/nomad/helper/users/cache_test.go) | 对应测试文件 |

