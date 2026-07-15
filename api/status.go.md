# status.go 代码说明文档

> 文件路径：[status.go](file:///d:/claude/nomad/api/status.go)
> 总行数：47 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **状态（Status）API 客户端**，返回集群和 Leader 状态的客户端方法。

## 2. 类型定义

### Status

**定义位置**：[L7](file:///d:/claude/nomad/api/status.go#L7)

**类型**：struct

```go
	client *Client
```

**关联方法**（3 个）：`Leader`, `RegionLeader`, `Peers`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Status` | `c *Client` | - | `*Status` | [L12](file:///d:/claude/nomad/api/status.go#L12) |
| `Leader` | `s *Status` | - | `string, error` | [L17](file:///d:/claude/nomad/api/status.go#L17) |
| `RegionLeader` | `s *Status` | `region string` | `string, error` | [L27](file:///d:/claude/nomad/api/status.go#L27) |
| `Peers` | `s *Status` | - | `[]string, error` | [L39](file:///d:/claude/nomad/api/status.go#L39) |

## 5. 核心方法详解

## 6. 依赖关系

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [status_test.go](file:///d:/claude/nomad/api/status_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

