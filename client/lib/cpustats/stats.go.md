# stats.go 代码说明文档

> 文件路径：[lib/cpustats/stats.go](file:///d:/claude/nomad/client/lib/cpustats/stats.go)
> 总行数：78 行
> 所属包：`cpustats`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **CPU 统计子包**（`client/lib/cpustats`），收集和计算 CPU 使用率统计。

## 2. 类型定义

### Compute

**定义位置**：[L19](file:///d:/claude/nomad/client/lib/cpustats/stats.go#L19)

**类型**：struct

```go
	TotalCompute hw.MHz `json:"tc"`
	NumCores int `json:"nc"`
```

### Tracker

**定义位置**：[L26](file:///d:/claude/nomad/client/lib/cpustats/stats.go#L26)

**类型**：struct

```go
	prevCPUTime float64
	prevTime time.Time
	totalCompute hw.MHz
	numCPUs int
	clock libtime.Clock
```

**关联方法**（3 个）：`Percent`, `calculatePercent`, `TicksConsumed`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `New` | - | `c Compute` | `*Tracker` | [L37](file:///d:/claude/nomad/client/lib/cpustats/stats.go#L37) |
| `Percent` | `t *Tracker` | `cpuTime float64` | `float64` | [L48](file:///d:/claude/nomad/client/lib/cpustats/stats.go#L48) |
| `calculatePercent` | `t *Tracker` | `t1 float64, t2 float64, timeDelta int64` | `float64` | [L64](file:///d:/claude/nomad/client/lib/cpustats/stats.go#L64) |
| `TicksConsumed` | `t *Tracker` | `percent float64` | `float64` | [L75](file:///d:/claude/nomad/client/lib/cpustats/stats.go#L75) |

## 5. 核心方法详解

### New()

**签名**：`func New(c Compute) *Tracker`

**位置**：[L37](file:///d:/claude/nomad/client/lib/cpustats/stats.go#L37)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `oss.indeed.com/go/libtime` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/numalib/hw` | 内部包 |

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|

