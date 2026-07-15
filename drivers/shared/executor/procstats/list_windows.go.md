# list_windows.go 代码说明文档

> 文件路径：[drivers/shared/executor/procstats/list_windows.go](file:///d:/claude/nomad/drivers/shared/executor/procstats/list_windows.go)
> 总行数：19 行
> 所属包：`procstats`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0
> Build Tag：`windows`

---

## 1. 文件定位与核心职责

该文件属于 **驱动共享工具子包**（`drivers/shared`），提供各任务驱动的共享功能，包括驱动事件处理、重启策略、执行器接口、网络配置、资源隔离和选择器逻辑等。

**平台特定实现**：此文件为 **Windows** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ListByPid` | - | `executorPID int` | `set.Collection[ProcessID]` | [L15](file:///d:/claude/nomad/drivers/shared/executor/procstats/list_windows.go#L15) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/go-set/v3` | 第三方库 |
| `github.com/mitchellh/go-ps` | 第三方库 |

## 7. 设计模式与技术特点

- **平台特定实现**：通过 build tag 机制实现 Windows 平台支持
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [getstats.go](file:///d:/claude/nomad/drivers/shared/executor/procstats/getstats.go) | 同目录源文件 |
| [list_default.go](file:///d:/claude/nomad/drivers/shared/executor/procstats/list_default.go) | 同目录源文件 |
| [list_linux.go](file:///d:/claude/nomad/drivers/shared/executor/procstats/list_linux.go) | 同目录源文件 |
| [procstats.go](file:///d:/claude/nomad/drivers/shared/executor/procstats/procstats.go) | 同目录源文件 |

