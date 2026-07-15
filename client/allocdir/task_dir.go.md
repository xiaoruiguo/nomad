# task_dir.go 代码说明文档

> 文件路径：[client/allocdir/task_dir.go](file:///d:/claude/nomad/client/allocdir/task_dir.go)
> 总行数：403 行
> 所属包：`allocdir`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配目录子包**（`client/allocdir`），管理分配的文件系统目录结构，包括任务数据、日志和 secrets 目录的创建和清理。

## 2. 类型定义

### TaskDir

**定义位置**：[L25](file:///d:/claude/nomad/client/allocdir/task_dir.go#L25)

**中文说明**：TaskDir 与任务（Task）相关，任务是 Nomad 执行的最小单元。

**类型**：struct

```go
type TaskDir struct {
	AllocDir string
	Dir string
	MountsAllocDir string
	MountsTaskDir string
	MountsSecretsDir string
	SharedAllocDir string
	SharedTaskDir string
	LocalDir string
	LogDir string
	SecretsDir string
	secretsInMB int
	PrivateDir string
	skip *set.Set[string]
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocDir` | `string` | 字符串 |
| `Dir` | `string` | 字符串 |
| `MountsAllocDir` | `string` | 字符串 |
| `MountsTaskDir` | `string` | 字符串 |
| `MountsSecretsDir` | `string` | 字符串 |
| `SharedAllocDir` | `string` | 字符串 |
| `SharedTaskDir` | `string` | 字符串 |
| `LocalDir` | `string` | 字符串 |
| `LogDir` | `string` | 字符串 |
| `SecretsDir` | `string` | 字符串 |
| `secretsInMB` | `int` | — |
| `PrivateDir` | `string` | 字符串 |
| `skip` | `*set.Set[string]` | 字符串 |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（4 个）：`Build`, `buildChroot`, `embedDirs`, `Unmount`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `defaultSecretDirTmpfsSize` | `—` | `1` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newTaskDir` | `a *AllocDir` | `taskName string, secretsInMB int` | `*TaskDir` | [L101](file:///d:/claude/nomad/client/allocdir/task_dir.go#L101) |
| `Build` | `t *TaskDir` | `fsi fsisolation.Mode, chroot map[string]string, username string` | `error` | [L130](file:///d:/claude/nomad/client/allocdir/task_dir.go#L130) |
| `buildChroot` | `t *TaskDir` | `entries map[string]string` | `error` | [L227](file:///d:/claude/nomad/client/allocdir/task_dir.go#L227) |
| `embedDirs` | `t *TaskDir` | `entries map[string]string` | `error` | [L231](file:///d:/claude/nomad/client/allocdir/task_dir.go#L231) |
| `Unmount` | `t *TaskDir` | `` | `error` | [L328](file:///d:/claude/nomad/client/allocdir/task_dir.go#L328) |

## 5. 核心方法详解

### Build()

**签名**：`func (t *TaskDir) Build(fsi fsisolation.Mode, chroot map[string]string, username string) error`

**位置**：[L130](file:///d:/claude/nomad/client/allocdir/task_dir.go#L130)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `fsi` | `fsisolation.Mode` | — |
| `chroot` | `map[string]string` | 映射表 |
| `username` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `github.com/hashicorp/nomad/helper/users/dynamic` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/fsisolation` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hashicorp/go-set/v3` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [task_dir_test.go](file:///d:/claude/nomad/client/allocdir/task_dir_test.go) | 对应测试文件 |
| [alloc_dir.go](file:///d:/claude/nomad/client/allocdir/alloc_dir.go) | 同目录源文件 |
| [fs_darwin.go](file:///d:/claude/nomad/client/allocdir/fs_darwin.go) | 同目录源文件 |
| [fs_default.go](file:///d:/claude/nomad/client/allocdir/fs_default.go) | 同目录源文件 |
| [fs_freebsd.go](file:///d:/claude/nomad/client/allocdir/fs_freebsd.go) | 同目录源文件 |
| [fs_linux.go](file:///d:/claude/nomad/client/allocdir/fs_linux.go) | 同目录源文件 |

