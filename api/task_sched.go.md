# task_sched.go 代码说明文档

> 文件路径：[task_sched.go](file:///d:/claude/nomad/api/task_sched.go)
> 总行数：15 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **任务（Task）相关 API 类型定义**，提供任务状态、资源等数据结构。

## 2. 类型定义

### TaskSchedule

**定义位置**：[L6](file:///d:/claude/nomad/api/task_sched.go#L6)

**类型**：struct

```go
	Cron *TaskScheduleCron `hcl:"cron,block"`
```

### TaskScheduleCron

**定义位置**：[L10](file:///d:/claude/nomad/api/task_sched.go#L10)

**类型**：struct

```go
	Start string `hcl:"start,optional"`
	End string `hcl:"end,optional"`
	Timezone string `hcl:"timezone,optional"`
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

该文件未定义方法。

## 5. 核心方法详解

## 6. 依赖关系

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

