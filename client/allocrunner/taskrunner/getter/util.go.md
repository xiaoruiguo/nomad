# util.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/getter/util.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go)
> 总行数：509 行
> 所属包：`getter`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `githubPrefixSSH` | `—` | `"git@github.com:"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ErrSandboxEscape` | `—` | `errors.New("artifact includes symlink that resolves outsi...` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `getURL` | - | `taskEnv interfaces.EnvReplacer, artifact *structs.TaskArtifact` | `string, error` | [L35](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go#L35) |
| `getDestination` | - | `env interfaces.EnvReplacer, artifact *structs.TaskArtifact` | `string, error` | [L70](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go#L70) |
| `getMode` | - | `artifact *structs.TaskArtifact` | `getter.ClientMode` | [L82](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go#L82) |
| `chownDestination` | - | `destination string, username string` | `error` | [L93](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go#L93) |
| `isInsecure` | - | `artifact *structs.TaskArtifact` | `bool` | [L119](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go#L119) |
| `getHeaders` | - | `env interfaces.EnvReplacer, artifact *structs.TaskArtifact` | `map[string][]string` | [L123](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go#L123) |
| `getWritableDirs` | - | `env interfaces.EnvReplacer` | `string, string` | [L137](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go#L137) |
| `environment` | - | `taskDir string, inherit string` | `[]string` | [L146](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go#L146) |
| `runCmd` | `s *Sandbox` | `env *parameters` | `error` | [L164](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go#L164) |
| `mergeDirectories` | - | `at *os.Root, srcDir string, dstDir string` | `error` | [L349](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go#L349) |
| `genWalkInspector` | - | `rootDir string` | `fs.WalkDirFunc, error` | [L431](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go#L431) |
| `isPathWithin` | - | `rootPath string, toCheckPath string` | `bool, error` | [L485](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go#L485) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `io/fs` | 标准库 |
| `net/http` | 标准库 |
| `net/url` | 标准库 |
| `os` | 标准库 |
| `os/exec` | 标准库 |
| `path/filepath` | 标准库 |
| `runtime` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `unicode` | 标准库 |
| `github.com/hashicorp/nomad/client/interfaces` | 内部包 |
| `github.com/hashicorp/nomad/helper/subproc` | 内部包 |
| `github.com/hashicorp/nomad/helper/users` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-getter` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HTTP 服务**：提供 HTTP API 端点或客户端

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [util_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_test.go) | 对应测试文件 |
| [error.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/error.go) | 同目录源文件 |
| [params.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/params.go) | 同目录源文件 |
| [sandbox.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox.go) | 同目录源文件 |
| [testing.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/testing.go) | 同目录源文件 |
| [util_default.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_default.go) | 同目录源文件 |

