# pool.go 代码说明文档

> 文件路径：[helper/users/dynamic/pool.go](file:///d:/claude/nomad/helper/users/dynamic/pool.go)
> 总行数：177 行
> 所属包：`dynamic`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **工具包子包**（`helper/users/dynamic`），提供 Nomad 使用的通用工具函数和数据结构。

**包注释**：

Package dynamic provides a way of allocating UID/GID to be used by Nomad
tasks with no associated service users managed by the operating system.

## 2. 类型定义

### UGID

**定义位置**：[L33](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L33)

**类型定义**：`type UGID int`

**关联方法**（1 个）：`String`

### Pool

**定义位置**：[L46](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L46)

**中文说明**：Pool 是一个对象池，复用资源以减少分配开销。

**类型**：interface

```go
type Pool interface {
	Restore func(...)
	Acquire func(...)
	Release func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `Restore` | `func(...)` | 从快照恢复对象的状态。 |
| `Acquire` | `func(...)` | — |
| `Release` | `func(...)` | — |

### PoolConfig

**定义位置**：[L58](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L58)

**中文说明**：PoolConfig 是一个配置结构体，包含相关功能的配置参数。

**类型**：struct

```go
type PoolConfig struct {
	MinUGID int
	MaxUGID int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MinUGID` | `int` | — |
| `MaxUGID` | `int` | — |

**关联方法**（1 个）：`disable`

### noopPool

**定义位置**：[L98](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L98)

**中文说明**：noopPool 是一个对象池，复用资源以减少分配开销。

**类型**：struct

**关联方法**（3 个）：`Restore`, `Acquire`, `Release`

### pool

**定义位置**：[L111](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L111)

**中文说明**：pool 是一个对象池，复用资源以减少分配开销。

**类型**：struct

```go
type pool struct {
	min UGID
	max UGID
	lock *sync.Mutex
	used *set.Set[UGID]
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `min` | `UGID` | 最小值 |
| `max` | `UGID` | 最大值 |
| `lock` | `*sync.Mutex` | 互斥锁，保护并发访问 |
| `used` | `*set.Set[UGID]` | — |

**关联方法**（4 个）：`Restore`, `Acquire`, `random`, `Release`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `none` | `—` | `0` | — |
| `doNotEnable` | `—` | `-1` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ErrPoolExhausted` | `—` | `errors.New("users: uid/gid pool exhausted")` | — |
| `ErrReleaseUnused` | `—` | `errors.New("users: release of unused uid/gid")` | — |
| `ErrCannotParse` | `—` | `errors.New("users: unable to parse uid/gid from username")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `String` | `id *UGID` | `` | `string` | [L38](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L38) |
| `disable` | `p *PoolConfig` | `` | `bool` | [L69](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L69) |
| `New` | - | `opts *PoolConfig` | `Pool` | [L74](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L74) |
| `Restore` | ` *noopPool` | `UGID` | `` | [L100](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L100) |
| `Acquire` | ` *noopPool` | `` | `UGID, error` | [L101](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L101) |
| `Release` | ` *noopPool` | `UGID` | `error` | [L104](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L104) |
| `Restore` | `p *pool` | `id UGID` | `` | [L119](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L119) |
| `Acquire` | `p *pool` | `` | `UGID, error` | [L125](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L125) |
| `random` | `p *pool` | `` | `UGID` | [L152](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L152) |
| `Release` | `p *pool` | `id UGID` | `error` | [L167](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L167) |

## 5. 核心方法详解

### New()

**签名**：`func New(opts *PoolConfig) Pool`

**位置**：[L74](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L74)

**中文说明**：创建并返回一个新实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `opts` | `*PoolConfig` | 选项 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `Pool` | — |

### Restore()

**签名**：`func ( *noopPool) Restore(UGID) `

**位置**：[L100](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L100)

**中文说明**：从快照恢复对象的状态。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `—` | `UGID` | — |

### Restore()

**签名**：`func (p *pool) Restore(id UGID) `

**位置**：[L119](file:///d:/claude/nomad/helper/users/dynamic/pool.go#L119)

**中文说明**：从快照恢复对象的状态。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `id` | `UGID` | 唯一标识符 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `math/rand` | 标准库 |
| `strconv` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **对象池模式**：实现对象池，复用资源减少分配开销
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [pool_test.go](file:///d:/claude/nomad/helper/users/dynamic/pool_test.go) | 对应测试文件 |
| [users.go](file:///d:/claude/nomad/helper/users/dynamic/users.go) | 同目录源文件 |

