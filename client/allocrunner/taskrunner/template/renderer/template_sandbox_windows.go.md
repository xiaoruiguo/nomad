# template_sandbox_windows.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/template/renderer/template_sandbox_windows.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/renderer/template_sandbox_windows.go)
> 总行数：15 行
> 所属包：`renderer`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`windows`

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

**平台特定实现**：此文件为 **Windows** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `sandbox` | - | `_ string, destPath string` | `string, error` | [L12](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/renderer/template_sandbox_windows.go#L12) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

该文件无导入包。

## 7. 设计模式与技术特点

- **平台特定实现**：通过 build tag 机制实现 Windows 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [doc.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/renderer/doc.go) | 同目录源文件 |
| [template_sandbox_default.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/renderer/template_sandbox_default.go) | 同目录源文件 |
| [z_template_render.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/renderer/z_template_render.go) | 同目录源文件 |

