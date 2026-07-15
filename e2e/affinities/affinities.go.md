# affinities.go 代码说明文档

> 文件路径：[e2e/affinities/affinities.go](file:///d:/claude/nomad/e2e/affinities/affinities.go)
> 总行数：170 行
> 所属包：`affinities`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **端到端测试子包**（`e2e/affinities`），针对 Nomad 的特定功能领域编写端到端测试，通过真实的 Nomad 集群验证功能正确性。

## 2. 类型定义

### BasicAffinityTest

**定义位置**：[L17](file:///d:/claude/nomad/e2e/affinities/affinities.go#L17)

**中文说明**：BasicAffinityTest 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type BasicAffinityTest struct {
	framework.TC framework.TC
	jobIds []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `framework.TC` | `framework.TC` | — |
| `jobIds` | `[]string` | 列表 |

**关联方法**（5 个）：`BeforeAll`, `TestSingleAffinities`, `TestMultipleAffinities`, `TestAntiAffinities`, `AfterEach`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `init` | - | `` | `` | [L22](file:///d:/claude/nomad/e2e/affinities/affinities.go#L22) |
| `BeforeAll` | `tc *BasicAffinityTest` | `f *framework.F` | `` | [L32](file:///d:/claude/nomad/e2e/affinities/affinities.go#L32) |
| `TestSingleAffinities` | `tc *BasicAffinityTest` | `f *framework.F` | `` | [L39](file:///d:/claude/nomad/e2e/affinities/affinities.go#L39) |
| `TestMultipleAffinities` | `tc *BasicAffinityTest` | `f *framework.F` | `` | [L75](file:///d:/claude/nomad/e2e/affinities/affinities.go#L75) |
| `TestAntiAffinities` | `tc *BasicAffinityTest` | `f *framework.F` | `` | [L117](file:///d:/claude/nomad/e2e/affinities/affinities.go#L117) |
| `AfterEach` | `tc *BasicAffinityTest` | `f *framework.F` | `` | [L160](file:///d:/claude/nomad/e2e/affinities/affinities.go#L160) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `slices` | 标准库 |
| `github.com/hashicorp/nomad/e2e/e2eutil` | 内部包 |
| `github.com/hashicorp/nomad/e2e/framework` | 内部包 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/shoenig/test/must` | 第三方库 |
| `github.com/stretchr/testify/require` | 第三方库 |

## 7. 设计模式与技术特点

- **端到端测试**：通过真实 Nomad 集群验证功能，使用测试框架组织测试用例

## 8. 相关文件

| 文件 | 关系 |
|------|------|

