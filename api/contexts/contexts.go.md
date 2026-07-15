# contexts.go 代码说明文档

> 文件路径：[contexts/contexts.go](file:///d:/claude/nomad/api/contexts/contexts.go)
> 总行数：40 行
> 所属包：`contexts`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **上下文子包**（`api/contexts`），提供用于 shell 自动补全的上下文类型标识。

## 2. 类型定义

### Context

**定义位置**：[L8](file:///d:/claude/nomad/api/contexts/contexts.go#L8)

**类型定义**：`string`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `Allocs` | `"allocs"` |
| `Deployments` | `"deployment"` |
| `Evals` | `"evals"` |
| `Jobs` | `"jobs"` |
| `Nodes` | `"nodes"` |
| `NodePools` | `"node_pools"` |
| `Namespaces` | `"namespaces"` |
| `Quotas` | `"quotas"` |
| `Recommendations` | `"recommendations"` |
| `ScalingPolicies` | `"scaling_policy"` |
| `Plugins` | `"plugins"` |
| `Variables` | `"vars"` |
| `Volumes` | `"volumes"` |
| `HostVolumes` | `"host_volumes"` |
| `Groups` | `"groups"` |
| `Services` | `"services"` |
| `Tasks` | `"tasks"` |
| `Images` | `"images"` |
| `Commands` | `"commands"` |
| `Classes` | `"classes"` |
| `All` | `"all"` |

## 4. 方法与函数

该文件未定义方法。

## 5. 核心方法详解

## 6. 依赖关系

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad API 客户端的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

