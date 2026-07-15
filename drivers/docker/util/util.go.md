# util.go 代码说明文档

> 文件路径：[drivers/docker/util/util.go](file:///d:/claude/nomad/drivers/docker/util/util.go)
> 总行数：15 行
> 所属包：`util`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Docker 驱动子包**（`drivers/docker`），实现 Nomad 的 Docker 任务驱动，通过 Docker API 管理容器的生命周期（创建、启动、停止、销毁）、资源限制、网络配置和日志收集。支持 Docker API 版本协商、认证、健康检查和统计信息收集。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `CalculateCPUPercent` | - | `newSample uint64, oldSample uint64, newTotal uint64, oldTotal uint64, cores ...` | `float64` | [L6](file:///d:/claude/nomad/drivers/docker/util/util.go#L6) |

## 5. 核心方法详解

## 6. 依赖关系

## 7. 设计模式与技术特点

- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [util_test.go](file:///d:/claude/nomad/drivers/docker/util/util_test.go) | 对应测试文件 |

