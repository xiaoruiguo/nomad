# sandbox.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/getter/sandbox.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox.go)
> 总行数：80 行
> 所属包：`getter`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Artifact 下载子包**（`client/allocrunner/taskrunner/getter`），实现任务 artifact 的下载和校验功能。

## 2. 类型定义

### Sandbox

**定义位置**：[L22](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox.go#L22)

**类型**：struct

```go
	logger hclog.Logger
	ac *config.ArtifactConfig
```

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

### Get()

**签名**：`func (s *Sandbox) Get(env interfaces.EnvReplacer, artifact *structs.TaskArtifact, user string) error`

**位置**：[L27](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox.go#L27)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `github.com/hashicorp/nomad/client/config` | 内部包 |
| `github.com/hashicorp/nomad/client/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [sandbox_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox_test.go) | 对应测试文件 |

