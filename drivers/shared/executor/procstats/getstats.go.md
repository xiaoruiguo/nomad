# getstats.go 代码说明文档

> 文件路径：[drivers/shared/executor/procstats/getstats.go](file:///d:/claude/nomad/drivers/shared/executor/procstats/getstats.go)
> 总行数：129 行
> 所属包：`procstats`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **驱动共享工具子包**（`drivers/shared`），提供各任务驱动的共享功能，包括驱动事件处理、重启策略、执行器接口、网络配置、资源隔离和选择器逻辑等。

## 2. 类型定义

### stats

**定义位置**：[L28](file:///d:/claude/nomad/drivers/shared/executor/procstats/getstats.go#L28)

**中文说明**：stats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type stats struct {
	TotalCPU *cpustats.Tracker
	UserCPU *cpustats.Tracker
	SystemCPU *cpustats.Tracker
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `TotalCPU` | `*cpustats.Tracker` | — |
| `UserCPU` | `*cpustats.Tracker` | — |
| `SystemCPU` | `*cpustats.Tracker` | — |

### taskProcStats

**定义位置**：[L34](file:///d:/claude/nomad/drivers/shared/executor/procstats/getstats.go#L34)

**中文说明**：taskProcStats 是一个统计结构体，记录相关指标的运行时数据。

**类型**：struct

```go
type taskProcStats struct {
	cacheTTL time.Duration
	procList ProcessList
	compute cpustats.Compute
	lock sync.Mutex
	latest map[ProcessID]*stats
	cache ProcUsages
	at time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `cacheTTL` | `time.Duration` | 时间间隔 |
| `procList` | `ProcessList` | — |
| `compute` | `cpustats.Compute` | — |
| `lock` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `latest` | `map[ProcessID]*stats` | 映射表 |
| `cache` | `ProcUsages` | — |
| `at` | `time.Time` | 时间点 |

**关联方法**（3 个）：`expired`, `scanPIDs`, `StatProcesses`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `New` | - | `compute cpustats.Compute, pl ProcessList` | `ProcessStats` | [L17](file:///d:/claude/nomad/drivers/shared/executor/procstats/getstats.go#L17) |
| `expired` | `lps *taskProcStats` | `t time.Time` | `bool` | [L45](file:///d:/claude/nomad/drivers/shared/executor/procstats/getstats.go#L45) |
| `scanPIDs` | `lps *taskProcStats` | `` | `` | [L51](file:///d:/claude/nomad/drivers/shared/executor/procstats/getstats.go#L51) |
| `StatProcesses` | `lps *taskProcStats` | `now time.Time` | `ProcUsages` | [L73](file:///d:/claude/nomad/drivers/shared/executor/procstats/getstats.go#L73) |

## 5. 核心方法详解

### New()

**签名**：`func New(compute cpustats.Compute, pl ProcessList) ProcessStats`

**位置**：[L17](file:///d:/claude/nomad/drivers/shared/executor/procstats/getstats.go#L17)

**中文说明**：创建并返回一个新实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `compute` | `cpustats.Compute` | — |
| `pl` | `ProcessList` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `ProcessStats` | — |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `strconv` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cpustats` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/shirou/gopsutil/v3/process` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [getstats_test.go](file:///d:/claude/nomad/drivers/shared/executor/procstats/getstats_test.go) | 对应测试文件 |
| [list_default.go](file:///d:/claude/nomad/drivers/shared/executor/procstats/list_default.go) | 同目录源文件 |
| [list_linux.go](file:///d:/claude/nomad/drivers/shared/executor/procstats/list_linux.go) | 同目录源文件 |
| [list_windows.go](file:///d:/claude/nomad/drivers/shared/executor/procstats/list_windows.go) | 同目录源文件 |
| [procstats.go](file:///d:/claude/nomad/drivers/shared/executor/procstats/procstats.go) | 同目录源文件 |

