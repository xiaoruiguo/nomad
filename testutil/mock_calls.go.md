# mock_calls.go 代码说明文档

> 文件路径：[testutil/mock_calls.go](file:///d:/claude/nomad/testutil/mock_calls.go)
> 总行数：48 行
> 所属包：`testutil`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **测试工具子包**（`testutil/`），提供 Nomad 测试的基础设施，包括测试服务器启动（`server.go`）、TLS 配置、Vault 集成、HTTP 响应记录器和等待/重试工具，用于单元测试和集成测试。

## 2. 类型定义

### CallCounter

**定义位置**：[L18](file:///d:/claude/nomad/testutil/mock_calls.go#L18)

**类型**：struct

```go
	lock sync.Mutex
	counts map[string]int
```

**关联方法**（4 个）：`Inc`, `Get`, `Reset`, `AssertCalled`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewCallCounter` | - | - | `*CallCounter` | [L12](file:///d:/claude/nomad/testutil/mock_calls.go#L12) |
| `Inc` | `c *CallCounter` | `name string` | - | [L23](file:///d:/claude/nomad/testutil/mock_calls.go#L23) |
| `Get` | `c *CallCounter` | - | `map[string]int` | [L29](file:///d:/claude/nomad/testutil/mock_calls.go#L29) |
| `Reset` | `c *CallCounter` | - | - | [L35](file:///d:/claude/nomad/testutil/mock_calls.go#L35) |
| `AssertCalled` | `c *CallCounter` | `t testing.TB, name string` | - | [L41](file:///d:/claude/nomad/testutil/mock_calls.go#L41) |

## 5. 核心方法详解

### NewCallCounter()

**签名**：`func NewCallCounter() *CallCounter`

**位置**：[L12](file:///d:/claude/nomad/testutil/mock_calls.go#L12)

### Get()

**签名**：`func (c *CallCounter) Get() map[string]int`

**位置**：[L29](file:///d:/claude/nomad/testutil/mock_calls.go#L29)

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

## 8. 相关文件

| 文件 | 关系 |
|------|------|

