# util_linux.go 代码说明文档

> 文件路径：[client/allocrunner/taskrunner/getter/util_linux.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_linux.go)
> 总行数：212 行
> 所属包：`getter`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`linux`

---

## 1. 文件定位与核心职责

该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。

**平台特定实现**：此文件为 **Linux** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `initialDirs` | `—` | `map[string]string{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `findHomeDir` | - | `` | `string` | [L30](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_linux.go#L30) |
| `findConfigDir` | - | `` | `string` | [L51](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_linux.go#L51) |
| `defaultEnvironment` | - | `taskDir string` | `map[string]string` | [L61](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_linux.go#L61) |
| `lockdownAvailable` | - | `` | `bool` | [L73](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_linux.go#L73) |
| `lockdown` | - | `l log.Logger, allocDir string, taskDir string, extra []string` | `error` | [L82](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_linux.go#L82) |
| `additionalFilesForVCS` | - | `` | `[]*landlock.Path` | [L125](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_linux.go#L125) |
| `filesForVCS` | - | `homeSSHDir string, homeKnownHosts string, etcPasswd string, etcKnownHosts str...` | `[]*landlock.Path` | [L152](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_linux.go#L152) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/mitchellh/go-homedir` | 第三方库 |
| `github.com/shoenig/go-landlock` | 第三方库 |
| `golang.org/x/sys/unix` | 第三方库 |

## 7. 设计模式与技术特点

- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **平台特定实现**：通过 build tag 机制实现 Linux 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [util_linux_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util_linux_test.go) | 对应测试文件 |
| [error.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/error.go) | 同目录源文件 |
| [params.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/params.go) | 同目录源文件 |
| [sandbox.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox.go) | 同目录源文件 |
| [testing.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/testing.go) | 同目录源文件 |
| [util.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go) | 同目录源文件 |

