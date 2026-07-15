# blocked_evals_system.go 代码说明文档

> 文件路径：[blocked_evals_system.go](file:///d:/claude/nomad/nomad/blocked_evals_system.go)
> 总行数：98 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **系统作业阻塞评估**，处理系统作业的阻塞评估特殊逻辑。

## 2. 类型定义

### systemEvals

**定义位置**：[L9](file:///d:/claude/nomad/nomad/blocked_evals_system.go#L9)

**类型**：struct

```go
	byJob map[structs.NamespacedID]map[string]string
	byNode map[string]map[string]bool
	evals map[string]*wrappedEval
```

**关联方法**（5 个）：`Add`, `Get`, `Remove`, `NodeEvals`, `JobEvals`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newSystemEvals` | - | - | `*systemEvals` | [L20](file:///d:/claude/nomad/nomad/blocked_evals_system.go#L20) |
| `Add` | `s *systemEvals` | `eval *structs.Evaluation, token string` | - | [L28](file:///d:/claude/nomad/nomad/blocked_evals_system.go#L28) |
| `Get` | `s *systemEvals` | `evalID string` | `*wrappedEval, bool` | [L53](file:///d:/claude/nomad/nomad/blocked_evals_system.go#L53) |
| `Remove` | `s *systemEvals` | `eval *structs.Evaluation` | - | [L58](file:///d:/claude/nomad/nomad/blocked_evals_system.go#L58) |
| `NodeEvals` | `s *systemEvals` | `nodeID string` | `map[*structs.Evaluation]string, bool` | [L76](file:///d:/claude/nomad/nomad/blocked_evals_system.go#L76) |
| `JobEvals` | `s *systemEvals` | `jobID structs.NamespacedID` | `[]*structs.Evaluation, bool` | [L88](file:///d:/claude/nomad/nomad/blocked_evals_system.go#L88) |

## 5. 核心方法详解

### Get()

**签名**：`func (s *systemEvals) Get(evalID string) *wrappedEval, bool`

**位置**：[L53](file:///d:/claude/nomad/nomad/blocked_evals_system.go#L53)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Server 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|

