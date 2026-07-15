# utils.go 代码说明文档

> 文件路径：[drivers/shared/executor/utils.go](file:///d:/claude/nomad/drivers/shared/executor/utils.go)
> 总行数：197 行
> 所属包：`executor`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **驱动共享工具子包**（`drivers/shared`），提供各任务驱动的共享功能，包括驱动事件处理、重启策略、执行器接口、网络配置、资源隔离和选择器逻辑等。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `ExecutorDefaultMaxPort` | `14512` |
| `ExecutorDefaultMinPort` | `14000` |
| `MemoryNoLimit` | `-1` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `CreateExecutor` | - | `logger hclog.Logger, driverConfig *base.ClientDriverConfig, executorConfig *...` | `Executor, *plugin.Client, error` | [L33](file:///d:/claude/nomad/drivers/shared/executor/utils.go#L33) |
| `ReattachToExecutor` | - | `reattachConfig *plugin.ReattachConfig, logger hclog.Logger, compute cpustats...` | `Executor, *plugin.Client, error` | [L84](file:///d:/claude/nomad/drivers/shared/executor/utils.go#L84) |
| `newExecutorClient` | - | `config *plugin.ClientConfig, logger hclog.Logger` | `Executor, *plugin.Client, error` | [L102](file:///d:/claude/nomad/drivers/shared/executor/utils.go#L102) |
| `processStateToProto` | - | `ps *ProcessState` | `*proto.ProcessState, error` | [L120](file:///d:/claude/nomad/drivers/shared/executor/utils.go#L120) |
| `processStateFromProto` | - | `pb *proto.ProcessState` | `*ProcessState, error` | [L136](file:///d:/claude/nomad/drivers/shared/executor/utils.go#L136) |
| `IsolationMode` | - | `plugin string, task string` | `string` | [L154](file:///d:/claude/nomad/drivers/shared/executor/utils.go#L154) |
| `mbToBytes` | - | `n int64` | `int64` | [L170](file:///d:/claude/nomad/drivers/shared/executor/utils.go#L170) |
| `memoryLimits` | - | `memory structs.AllocatedMemoryResources` | `int64, int64` | [L182](file:///d:/claude/nomad/drivers/shared/executor/utils.go#L182) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |
| `fmt` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cpustats` | 内部包 |
| `github.com/hashicorp/nomad/drivers/shared/executor/proto` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/base` | 内部包 |
| `github.com/golang/protobuf/ptypes` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-plugin` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **插件架构**：使用 `go-plugin` 框架实现插件化扩展
- **gRPC 通信**：使用 gRPC 进行进程间通信
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [utils_test.go](file:///d:/claude/nomad/drivers/shared/executor/utils_test.go) | 对应测试文件 |

