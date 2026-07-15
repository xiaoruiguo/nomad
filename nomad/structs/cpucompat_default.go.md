# cpucompat_default.go 代码说明文档

> 文件路径：[structs/cpucompat_default.go](file:///d:/claude/nomad/nomad/structs/cpucompat_default.go)
> 总行数：43 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`!linux`

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

**平台特定实现**：此文件为 **默认/其他平台** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Compatibility` | `n *NodeResources` | - | - | [L17](file:///d:/claude/nomad/nomad/structs/cpucompat_default.go#L17) |
| `topologyFromLegacy` | - | `old LegacyNodeCpuResources` | `*numalib.Topology` | [L40](file:///d:/claude/nomad/nomad/structs/cpucompat_default.go#L40) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/client/lib/numalib` | 内部包 |

## 7. 设计模式与技术特点

- **平台特定实现**：通过 build tag 机制实现 默认/其他平台 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [cpucompat_default_test.go](file:///d:/claude/nomad/nomad/structs/cpucompat_default_test.go) | 对应测试文件 |

