# cpucompat_linux.go 代码说明文档

> 文件路径：[nomad/structs/cpucompat_linux.go](file:///d:/claude/nomad/nomad/structs/cpucompat_linux.go)
> 总行数：92 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`linux`

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，包含 3 个方法/函数。

**平台特定实现**：此文件为 **Linux** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Compatibility` | `n *NodeResources` | `` | `` | [L20](file:///d:/claude/nomad/nomad/structs/cpucompat_linux.go#L20) |
| `topologyFromLegacy` | - | `old LegacyNodeCpuResources` | `*numalib.Topology` | [L47](file:///d:/claude/nomad/nomad/structs/cpucompat_linux.go#L47) |
| `topologyFromLegacyLinux` | - | `old LegacyNodeCpuResources` | `*numalib.Topology` | [L54](file:///d:/claude/nomad/nomad/structs/cpucompat_linux.go#L54) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/client/lib/idset` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib/hw` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |

## 7. 设计模式与技术特点

- **平台特定实现**：通过 build tag 机制实现 Linux 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [cpucompat_linux_test.go](file:///d:/claude/nomad/nomad/structs/cpucompat_linux_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

