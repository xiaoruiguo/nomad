# z_getter_cmd.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/getter/z_getter_cmd.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/z_getter_cmd.go)
> 总行数：74 行
> 所属包：`getter`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Artifact 下载子包**（`client/allocrunner/taskrunner/getter`），实现任务 artifact 的下载和校验功能。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `SubCommand` | `"artifact-isolation"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `init` | - | - | - | [L19](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/z_getter_cmd.go#L19) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `os` | 标准库 |
| `github.com/hashicorp/nomad/helper/subproc` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|

