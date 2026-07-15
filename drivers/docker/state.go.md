# state.go 代码说明文档

> 文件路径：[drivers/docker/state.go](file:///d:/claude/nomad/drivers/docker/state.go)
> 总行数：50 行
> 所属包：`docker`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Docker 驱动子包**（`drivers/docker`），实现 Nomad 的 Docker 任务驱动，通过 Docker API 管理容器的生命周期（创建、启动、停止、销毁）、资源限制、网络配置和日志收集。支持 Docker API 版本协商、认证、健康检查和统计信息收集。

## 2. 类型定义

### taskStore

**定义位置**：[L12](file:///d:/claude/nomad/drivers/docker/state.go#L12)

**类型**：struct

```go
	store map[string]*taskHandle
	lock sync.RWMutex
```

**关联方法**（4 个）：`Set`, `Get`, `IDs`, `Delete`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newTaskStore` | - | - | `*taskStore` | [L17](file:///d:/claude/nomad/drivers/docker/state.go#L17) |
| `Set` | `ts *taskStore` | `id string, handle *taskHandle` | - | [L21](file:///d:/claude/nomad/drivers/docker/state.go#L21) |
| `Get` | `ts *taskStore` | `id string` | `*taskHandle, bool` | [L27](file:///d:/claude/nomad/drivers/docker/state.go#L27) |
| `IDs` | `ts *taskStore` | - | `*set.Set[string]` | [L34](file:///d:/claude/nomad/drivers/docker/state.go#L34) |
| `Delete` | `ts *taskStore` | `id string` | - | [L45](file:///d:/claude/nomad/drivers/docker/state.go#L45) |

## 5. 核心方法详解

### Get()

**签名**：`func (ts *taskStore) Get(id string) *taskHandle, bool`

**位置**：[L27](file:///d:/claude/nomad/drivers/docker/state.go#L27)

### Delete()

**签名**：`func (ts *taskStore) Delete(id string) `

**位置**：[L45](file:///d:/claude/nomad/drivers/docker/state.go#L45)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `sync` | 标准库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|

