# detect.go 代码说明文档

> 文件路径：[lib/numalib/detect.go](file:///d:/claude/nomad/client/lib/numalib/detect.go)
> 总行数：85 行
> 所属包：`numalib`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **NUMA 库子包**（`client/lib/numalib`），处理 NUMA（非统一内存访问）拓扑和 CPU 绑定。

## 2. 类型定义

### SystemScanner

**定义位置**：[L13](file:///d:/claude/nomad/client/lib/numalib/detect.go#L13)

**类型**：interface

```go
	ScanSystem
```

### ConfigScanner

**定义位置**：[L31](file:///d:/claude/nomad/client/lib/numalib/detect.go#L31)

**类型**：struct

```go
	ReservableCores *idset.Set[hw.CoreID]
	TotalCompute hw.MHz
	ReservedCores *idset.Set[hw.CoreID]
	ReservedCompute hw.MHz
```

**关联方法**（1 个）：`ScanSystem`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Scan` | - | `scanners []SystemScanner` | `*Topology` | [L20](file:///d:/claude/nomad/client/lib/numalib/detect.go#L20) |
| `ScanSystem` | `cs *ConfigScanner` | `top *Topology` | - | [L62](file:///d:/claude/nomad/client/lib/numalib/detect.go#L62) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/client/lib/idset` | 内部包 |
| `github.com/hashicorp/nomad/client/lib/numalib/hw` | 内部包 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [detect_test.go](file:///d:/claude/nomad/client/lib/numalib/detect_test.go) | 对应测试文件 |

