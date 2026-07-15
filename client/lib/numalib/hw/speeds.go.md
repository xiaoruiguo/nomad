# speeds.go 代码说明文档

> 文件路径：[lib/numalib/hw/speeds.go](file:///d:/claude/nomad/client/lib/numalib/hw/speeds.go)
> 总行数：26 行
> 所属包：`hw`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **NUMA 硬件子包**（`client/lib/numalib/hw`），与硬件层交互获取 NUMA 拓扑信息。

## 2. 类型定义

### MHz

**定义位置**：[L11](file:///d:/claude/nomad/client/lib/numalib/hw/speeds.go#L11)

**类型定义**：`uint64`

**关联方法**（1 个）：`KHz`

### KHz

**定义位置**：[L12](file:///d:/claude/nomad/client/lib/numalib/hw/speeds.go#L12)

**类型定义**：`uint64`

**关联方法**（2 个）：`MHz`, `String`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `MHz` | `khz *KHz` | - | `MHz` | [L15](file:///d:/claude/nomad/client/lib/numalib/hw/speeds.go#L15) |
| `KHz` | `mhz *MHz` | - | `KHz` | [L19](file:///d:/claude/nomad/client/lib/numalib/hw/speeds.go#L19) |
| `String` | `khz *KHz` | - | `string` | [L23](file:///d:/claude/nomad/client/lib/numalib/hw/speeds.go#L23) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `strconv` | 标准库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Client 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|

