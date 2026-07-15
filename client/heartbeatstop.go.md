# heartbeatstop.go 代码说明文档

> 文件路径：[heartbeatstop.go](file:///d:/claude/nomad/client/heartbeatstop.go)
> 总行数：175 行
> 所属包：`client`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 Nomad Client 核心包（`client`），提供 Client 节点运行所需的功能。

## 2. 类型定义

### heartbeatStop

**定义位置**：[L17](file:///d:/claude/nomad/client/heartbeatstop.go#L17)

**类型**：struct

```go
	lastOk time.Time
	startupGrace time.Time
	allocHookCh chan *structs.Allocation
	heartbeatCh chan struct{...}
	getRunner func(...)
	logger hclog.InterceptLogger
	shutdownCh chan struct{...}
	lock *sync.RWMutex
```

**关联方法**（7 个）：`allocHook`, `shouldStop`, `shouldStopAfter`, `watch`, `setLastOk`, `getLastOk`, `stopAlloc`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newHeartbeatStop` | - | `getRunner func(...), timeout time.Duration, logger hclog.InterceptLogger, sh...` | `*heartbeatStop` | [L28](file:///d:/claude/nomad/client/heartbeatstop.go#L28) |
| `allocHook` | `h *heartbeatStop` | `alloc *structs.Allocation` | - | [L49](file:///d:/claude/nomad/client/heartbeatstop.go#L49) |
| `shouldStop` | `h *heartbeatStop` | `alloc *structs.Allocation` | `bool` | [L57](file:///d:/claude/nomad/client/heartbeatstop.go#L57) |
| `shouldStopAfter` | `h *heartbeatStop` | `now time.Time, interval time.Duration` | `bool` | [L64](file:///d:/claude/nomad/client/heartbeatstop.go#L64) |
| `watch` | `h *heartbeatStop` | - | - | [L74](file:///d:/claude/nomad/client/heartbeatstop.go#L74) |
| `setLastOk` | `h *heartbeatStop` | `t time.Time` | - | [L130](file:///d:/claude/nomad/client/heartbeatstop.go#L130) |
| `getLastOk` | `h *heartbeatStop` | - | `time.Time` | [L142](file:///d:/claude/nomad/client/heartbeatstop.go#L142) |
| `stopAlloc` | `h *heartbeatStop` | `allocID string` | `error` | [L149](file:///d:/claude/nomad/client/heartbeatstop.go#L149) |
| `getDisconnectStopTimeout` | - | `alloc *structs.Allocation` | `time.Duration, bool` | [L163](file:///d:/claude/nomad/client/heartbeatstop.go#L163) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/allocrunner/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [heartbeatstop_test.go](file:///d:/claude/nomad/client/heartbeatstop_test.go) | 对应测试文件 |

