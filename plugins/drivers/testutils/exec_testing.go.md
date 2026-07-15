# exec_testing.go 代码说明文档

> 文件路径：[plugins/drivers/testutils/exec_testing.go](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go)
> 总行数：381 行
> 所属包：`testutils`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **驱动插件接口子包**（`plugins/drivers`），定义任务驱动插件的接口规范，包括任务生命周期管理（Fingerprint、Launch、Stop、Destroy、Signal）、统计信息收集、能力声明和 gRPC 通信协议。

## 2. 类型定义

### execResult

**定义位置**：[L280](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go#L280)

**中文说明**：execResult 是一个结果结构体，封装操作执行的结果。

**类型**：struct

```go
type execResult struct {
	exitCode int
	stdout string
	stderr string
	err error
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `exitCode` | `int` | — |
| `stdout` | `string` | 字符串 |
| `stderr` | `string` | 字符串 |
| `err` | `error` | 错误信息 |

### testExecStream

**定义位置**：[L334](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go#L334)

**中文说明**：testExecStream 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type testExecStream struct {
	t *testing.T
	input []*drivers.ExecTaskStreamingRequestMsg
	recvCalled int
	resultLock sync.Mutex
	result *execResult
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `t` | `*testing.T` | — |
| `input` | `[]*drivers.ExecTaskStreamingRequestMsg` | 输入 |
| `recvCalled` | `int` | — |
| `resultLock` | `sync.Mutex` | 结果 so far |
| `result` | `*execResult` | 结果 |

**关联方法**（3 个）：`currentResult`, `Recv`, `Send`

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ExecTaskStreamingBasicCases` | `—` | `[]struct{...}{...}` | — |
| `_` | `drivers.ExecTaskStream` | `(*testExecStream)(nil)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ExecTaskStreamingConformanceTests` | - | `t *testing.T, driver *DriverHarness, taskID string` | `` | [L26](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go#L26) |
| `TestExecTaskStreamingBasicResponses` | - | `t *testing.T, driver *DriverHarness, taskID string` | `` | [L118](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go#L118) |
| `TestExecFSIsolation` | - | `t *testing.T, driver *DriverHarness, taskID string` | `` | [L153](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go#L153) |
| `ExecTask` | - | `t *testing.T, driver *DriverHarness, taskID string, cmd string, tty bool, std...` | `exitCode int, stdout string, stderr string` | [L232](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go#L232) |
| `execTask` | - | `t *testing.T, driver *DriverHarness, taskID string, cmd string, tty bool, std...` | `execResult` | [L237](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go#L237) |
| `newTestExecStream` | - | `t *testing.T, tty bool, stdin string` | `*testExecStream` | [L288](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go#L288) |
| `newInputStream` | - | `tty bool, stdin string` | `[]*drivers.ExecTaskStreamingRequestMsg` | [L297](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go#L297) |
| `currentResult` | `s *testExecStream` | `` | `execResult` | [L346](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go#L346) |
| `Recv` | `s *testExecStream` | `` | `*drivers.ExecTaskStreamingRequestMsg, error` | [L354](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go#L354) |
| `Send` | `s *testExecStream` | `m *drivers.ExecTaskStreamingResponseMsg` | `error` | [L364](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go#L364) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `os` | 标准库 |
| `regexp` | 标准库 |
| `runtime` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `testing` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/cgroupslib` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/fsisolation` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/proto` | 内部包 |
| `github.com/hashicorp/nomad/testutil` | 内部包 |
| `github.com/shoenig/test/must` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **IO 操作**：涉及文件或数据流的读写操作
- **测试工具**：提供测试辅助工具，便于编写单元测试和集成测试

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [dns_testing.go](file:///d:/claude/nomad/plugins/drivers/testutils/dns_testing.go) | 同目录源文件 |
| [testing.go](file:///d:/claude/nomad/plugins/drivers/testutils/testing.go) | 同目录源文件 |
| [testing_default.go](file:///d:/claude/nomad/plugins/drivers/testutils/testing_default.go) | 同目录源文件 |
| [testing_linux.go](file:///d:/claude/nomad/plugins/drivers/testutils/testing_linux.go) | 同目录源文件 |

