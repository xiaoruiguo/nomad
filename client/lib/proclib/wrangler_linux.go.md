# wrangler_linux.go 代码说明文档

> 文件路径：[lib/proclib/wrangler_linux.go](file:///d:/claude/nomad/client/lib/proclib/wrangler_linux.go)
> 总行数：30 行
> 所属包：`proclib`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`linux`

---

## 1. 文件定位与核心职责

该文件属于 **进程库子包**（`client/lib/proclib`），提供进程操作工具。

**平台特定实现**：此文件为 **Linux** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `New` | - | `configs *Configs` | `*Wranglers, error` | [L14](file:///d:/claude/nomad/client/lib/proclib/wrangler_linux.go#L14) |

## 5. 核心方法详解

### New()

**签名**：`func New(configs *Configs) *Wranglers, error`

**位置**：[L14](file:///d:/claude/nomad/client/lib/proclib/wrangler_linux.go#L14)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/client/lib/cgroupslib` | 内部包 |

## 7. 设计模式与技术特点

- **平台特定实现**：通过 build tag 机制实现 Linux 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|

