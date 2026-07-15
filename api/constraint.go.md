# constraint.go 代码说明文档

> 文件路径：[constraint.go](file:///d:/claude/nomad/api/constraint.go)
> 总行数：34 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **约束（Constraint）API 类型定义**，提供作业约束条件的数据结构。

## 2. 类型定义

### Constraint

**定义位置**：[L20](file:///d:/claude/nomad/api/constraint.go#L20)

**类型**：struct

```go
	LTarget string `hcl:"attribute,optional"`
	RTarget string `hcl:"value,optional"`
	Operand string `hcl:"operator,optional"`
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `ConstraintDistinctProperty` | `"distinct_property"` |
| `ConstraintDistinctHosts` | `"distinct_hosts"` |
| `ConstraintRegex` | `"regexp"` |
| `ConstraintVersion` | `"version"` |
| `ConstraintSemver` | `"semver"` |
| `ConstraintSetContains` | `"set_contains"` |
| `ConstraintSetContainsAll` | `"set_contains_all"` |
| `ConstraintSetContainsAny` | `"set_contains_any"` |
| `ConstraintAttributeIsSet` | `"is_set"` |
| `ConstraintAttributeIsNotSet` | `"is_not_set"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewConstraint` | - | `left string, operand string, right string` | `*Constraint` | [L27](file:///d:/claude/nomad/api/constraint.go#L27) |

## 5. 核心方法详解

## 6. 依赖关系

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [constraint_test.go](file:///d:/claude/nomad/api/constraint_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

