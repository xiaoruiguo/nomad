# pprof.go 代码说明文档

> 文件路径：[pprof/pprof.go](file:///d:/claude/nomad/command/agent/pprof/pprof.go)
> 总行数：141 行
> 所属包：`pprof`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **pprof 子包**（`command/agent/pprof`），集成 Go 的 pprof 性能分析工具到 HTTP API。

## 2. 类型定义

### ReqType

**定义位置**：[L23](file:///d:/claude/nomad/command/agent/pprof/pprof.go#L23)

**类型定义**：`string`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `CmdReq` | `"cmdline"` |
| `CPUReq` | `"cpu"` |
| `TraceReq` | `"trace"` |
| `LookupReq` | `"lookup"` |
| `ErrProfileNotFoundPrefix` | `"Pprof profile not found profile:"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewErrProfileNotFound` | - | `profile string` | `error` | [L36](file:///d:/claude/nomad/command/agent/pprof/pprof.go#L36) |
| `IsErrProfileNotFound` | - | `err error` | `bool` | [L42](file:///d:/claude/nomad/command/agent/pprof/pprof.go#L42) |
| `Cmdline` | - | - | `[]byte, map[string]string, error` | [L48](file:///d:/claude/nomad/command/agent/pprof/pprof.go#L48) |
| `Profile` | - | `profile string, debug int, gc int` | `[]byte, map[string]string, error` | [L61](file:///d:/claude/nomad/command/agent/pprof/pprof.go#L61) |
| `CPUProfile` | - | `ctx context.Context, sec int` | `[]byte, map[string]string, error` | [L89](file:///d:/claude/nomad/command/agent/pprof/pprof.go#L89) |
| `Trace` | - | `ctx context.Context, sec int` | `[]byte, map[string]string, error` | [L112](file:///d:/claude/nomad/command/agent/pprof/pprof.go#L112) |
| `sleep` | - | `ctx context.Context, d time.Duration` | - | [L134](file:///d:/claude/nomad/command/agent/pprof/pprof.go#L134) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `context` | 标准库 |
| `fmt` | 标准库 |
| `os` | 标准库 |
| `runtime` | 标准库 |
| `runtime/pprof` | 标准库 |
| `runtime/trace` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [pprof_test.go](file:///d:/claude/nomad/command/agent/pprof/pprof_test.go) | 对应测试文件 |
| [agent.go](file:///d:/claude/nomad/command/agent/agent.go) | Agent 核心实现 |
| [http.go](file:///d:/claude/nomad/command/agent/http.go) | HTTP 服务器实现 |
| [config.go](file:///d:/claude/nomad/command/agent/config.go) | 配置定义 |

