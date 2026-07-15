# sandbox.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/getter/sandbox.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox.go)
> 总行数：80 行
> 所属包：`getter`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

### Sandbox

**定义位置**：[L22](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox.go#L22)

**中文说明**：Sandbox 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Sandbox struct {
	logger hclog.Logger
	ac *config.ArtifactConfig
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `ac` | `*config.ArtifactConfig` | 配置对象 |

**关联方法**（1 个）：`Get`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `New` | - | `ac *config.ArtifactConfig, logger hclog.Logger` | `*Sandbox` | [L14](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox.go#L14) |
| `Get` | `s *Sandbox` | `env interfaces.EnvReplacer, artifact *structs.TaskArtifact, user string` | `error` | [L27](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox.go#L27) |

## 5. 核心方法详解

### New()

**签名**：`func New(ac *config.ArtifactConfig, logger hclog.Logger) *Sandbox`

**位置**：[L14](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox.go#L14)

**中文说明**：创建并返回一个新实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `ac` | `*config.ArtifactConfig` | 配置对象 |
| `logger` | `hclog.Logger` | 日志记录器 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Sandbox` | — |

### Get()

**签名**：`func (s *Sandbox) Get(env interfaces.EnvReplacer, artifact *structs.TaskArtifact, user string) error`

**位置**：[L27](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox.go#L27)

**中文说明**：获取对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `env` | `interfaces.EnvReplacer` | — |
| `artifact` | `*structs.TaskArtifact` | — |
| `user` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/client/config` | 内部包 |
| `github.com/hashicorp/nomad/client/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [sandbox_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox_test.go) | 对应测试文件 |
| [error.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/error.go) | 同目录源文件 |
| [params.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/params.go) | 同目录源文件 |
| [testing.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/testing.go) | 同目录源文件 |
| [util.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go) | 同目录源文件 |
| [util_default.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_default.go) | 同目录源文件 |

