# util_default.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/getter/util_default.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_default.go)
> 总行数：33 行
> 所属包：`getter`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`!linux && !windows`

---

## 1. 文件定位与核心职责

该文件属于 **Artifact 下载子包**（`client/allocrunner/taskrunner/getter`），实现任务 artifact 的下载和校验功能。

**平台特定实现**：此文件为 **默认/其他平台** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `lockdownAvailable` | - | - | `bool` | [L15](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_default.go#L15) |
| `lockdown` | - | `log.Logger, string, string, []string` | `error` | [L20](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_default.go#L20) |
| `defaultEnvironment` | - | `taskDir string` | `map[string]string` | [L26](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_default.go#L26) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `path/filepath` | 标准库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **平台特定实现**：通过 build tag 机制实现 默认/其他平台 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|

