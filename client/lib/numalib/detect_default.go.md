# detect_default.go 代码说明文档

> 文件路径：[lib/numalib/detect_default.go](file:///d:/claude/nomad/client/lib/numalib/detect_default.go)
> 总行数：23 行
> 所属包：`numalib`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`!linux && !darwin`

---

## 1. 文件定位与核心职责

该文件属于 **NUMA 库子包**（`client/lib/numalib`），处理 NUMA（非统一内存访问）拓扑和 CPU 绑定。

**平台特定实现**：此文件为 **默认/其他平台** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

### Generic

**定义位置**：[L18](file:///d:/claude/nomad/client/lib/numalib/detect_default.go#L18)

**类型**：struct

**关联方法**（1 个）：`ScanSystem`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `PlatformScanners` | - | `_ bool` | `[]SystemScanner` | [L10](file:///d:/claude/nomad/client/lib/numalib/detect_default.go#L10) |
| `ScanSystem` | `g *Generic` | `top *Topology` | - | [L20](file:///d:/claude/nomad/client/lib/numalib/detect_default.go#L20) |

## 5. 核心方法详解

## 6. 依赖关系

## 7. 设计模式与技术特点

- **平台特定实现**：通过 build tag 机制实现 默认/其他平台 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|

