# mock_calls.go 代码说明文档

> 文件路径：[testutil/mock_calls.go](file:///d:/claude/nomad/testutil/mock_calls.go)
> 总行数：48 行
> 所属包：`testutil`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **测试工具子包**（`testutil/`），提供 Nomad 测试的基础设施，包括测试服务器启动、TLS 配置、Vault 集成、HTTP 响应记录器和等待/重试工具，用于单元测试和集成测试。

## 2. 类型定义

### CallCounter

**定义位置**：[L18](file:///d:/claude/nomad/testutil/mock_calls.go#L18)

**中文说明**：CallCounter 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type CallCounter struct {
	lock sync.Mutex
	counts map[string]int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `lock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `counts` | `map[string]int` | 映射表 |

**关联方法**（4 个）：`Inc`, `Get`, `Reset`, `AssertCalled`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewCallCounter` | - | `` | `*CallCounter` | [L12](file:///d:/claude/nomad/testutil/mock_calls.go#L12) |
| `Inc` | `c *CallCounter` | `name string` | `` | [L23](file:///d:/claude/nomad/testutil/mock_calls.go#L23) |
| `Get` | `c *CallCounter` | `` | `map[string]int` | [L29](file:///d:/claude/nomad/testutil/mock_calls.go#L29) |
| `Reset` | `c *CallCounter` | `` | `` | [L35](file:///d:/claude/nomad/testutil/mock_calls.go#L35) |
| `AssertCalled` | `c *CallCounter` | `t testing.TB, name string` | `` | [L41](file:///d:/claude/nomad/testutil/mock_calls.go#L41) |

## 5. 核心方法详解

### NewCallCounter()

**签名**：`func NewCallCounter() *CallCounter`

**位置**：[L12](file:///d:/claude/nomad/testutil/mock_calls.go#L12)

**中文说明**：创建并返回一个新的 CallCounter 实例。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*CallCounter` | — |

### Get()

**签名**：`func (c *CallCounter) Get() map[string]int`

**位置**：[L29](file:///d:/claude/nomad/testutil/mock_calls.go#L29)

**中文说明**：获取对象的信息。

**返回值**：

| 类型 | 说明 |
|------|------|
| `map[string]int` | 映射表 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `maps` | 标准库 |
| `sync` | 标准库 |
| `testing` | 标准库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **测试工具**：提供测试辅助工具，便于编写单元测试和集成测试
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [file.go](file:///d:/claude/nomad/testutil/file.go) | 同目录源文件 |
| [responsewriter.go](file:///d:/claude/nomad/testutil/responsewriter.go) | 同目录源文件 |
| [server.go](file:///d:/claude/nomad/testutil/server.go) | 同目录源文件 |
| [server_default.go](file:///d:/claude/nomad/testutil/server_default.go) | 同目录源文件 |
| [server_windows.go](file:///d:/claude/nomad/testutil/server_windows.go) | 同目录源文件 |

