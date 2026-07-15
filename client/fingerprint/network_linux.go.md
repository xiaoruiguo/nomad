# network_linux.go 代码说明文档

> 文件路径：[fingerprint/network_linux.go](file:///d:/claude/nomad/client/fingerprint/network_linux.go)
> 总行数：82 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。

**平台特定实现**：此文件为 **Linux** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `linkSpeedSys` | `f *NetworkFingerprint` | `device string` | `int` | [L16](file:///d:/claude/nomad/client/fingerprint/network_linux.go#L16) |
| `linkSpeed` | `f *NetworkFingerprint` | `device string` | `int` | [L37](file:///d:/claude/nomad/client/fingerprint/network_linux.go#L37) |
| `linkSpeedEthtool` | `f *NetworkFingerprint` | `path string, device string` | `int` | [L53](file:///d:/claude/nomad/client/fingerprint/network_linux.go#L53) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `regexp` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |

## 7. 设计模式与技术特点

- **平台特定实现**：通过 build tag 机制实现 Linux 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|

