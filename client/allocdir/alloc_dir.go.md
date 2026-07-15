# alloc_dir.go 代码说明文档

> 文件路径：[client/allocdir/alloc_dir.go](file:///d:/claude/nomad/client/allocdir/alloc_dir.go)
> 总行数：740 行
> 所属包：`allocdir`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **分配目录子包**（`client/allocdir`），管理分配的文件系统目录结构，包括任务数据、日志和 secrets 目录的创建和清理。

## 2. 类型定义

### Interface

**定义位置**：[L92](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L92)

**中文说明**：Interface 是一个接口，定义相关功能的契约规范。

**类型**：interface

```go
type Interface interface {
	AllocDirFS AllocDirFS
	NewTaskDir func(...)
	AllocDirPath func(...)
	ShareDirPath func(...)
	GetTaskDir func(...)
	Build func(...)
	Destroy func(...)
	Move func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `AllocDirFS` | `AllocDirFS` | — |
| `NewTaskDir` | `func(...)` | 创建并返回一个新的 TaskDir 实例。 |
| `AllocDirPath` | `func(...)` | — |
| `ShareDirPath` | `func(...)` | — |
| `GetTaskDir` | `func(...)` | 获取TaskDir的信息。 |
| `Build` | `func(...)` | — |
| `Destroy` | `func(...)` | — |
| `Move` | `func(...)` | — |

### AllocDir

**定义位置**：[L106](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L106)

**中文说明**：AllocDir 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：struct

```go
type AllocDir struct {
	AllocDir string
	SharedDir string
	TaskDirs map[string]*TaskDir
	clientAllocDir string
	clientAllocMountsDir string
	built bool
	mu sync.RWMutex
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `AllocDir` | `string` | 字符串 |
| `SharedDir` | `string` | 字符串 |
| `TaskDirs` | `map[string]*TaskDir` | 映射表 |
| `clientAllocDir` | `string` | 字符串 |
| `clientAllocMountsDir` | `string` | 字符串 |
| `built` | `bool` | 布尔值 |
| `mu` | `sync.RWMutex` | 读写锁，保护并发访问 |
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（14 个）：`AllocDirPath`, `ShareDirPath`, `GetTaskDir`, `NewTaskDir`, `Snapshot`, `Move`, `Destroy`, `UnmountAll`, `Build`, `List`, `Stat`, `ReadAt`, `BlockUntilExists`, `ChangeEvents`

### AllocDirFS

**定义位置**：[L149](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L149)

**中文说明**：AllocDirFS 与分配（Allocation）相关，分配是作业在节点上的运行实例。

**类型**：interface

```go
type AllocDirFS interface {
	List func(...)
	Stat func(...)
	ReadAt func(...)
	Snapshot func(...)
	BlockUntilExists func(...)
	ChangeEvents func(...)
}
```

#### 接口方法说明表

| 方法名 | 签名 | 中文说明 |
|--------|------|----------|
| `List` | `func(...)` | 列出所有对象。 |
| `Stat` | `func(...)` | — |
| `ReadAt` | `func(...)` | — |
| `Snapshot` | `func(...)` | 创建对象的快照。 |
| `BlockUntilExists` | `func(...)` | 阻塞UntilExists。 |
| `ChangeEvents` | `func(...)` | — |

### fileInfo

**定义位置**：[L634](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L634)

**中文说明**：fileInfo 是一个信息结构体，包含对象的元数据或描述信息。

**类型**：struct

```go
type fileInfo struct {
	Name string
	Perm os.FileMode
	Uid int
	Gid int
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Perm` | `os.FileMode` | — |
| `Uid` | `int` | — |
| `Gid` | `int` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `idUnsupported` | `—` | `-1` | — |
| `fileMode777` | `—` | `os.FileMode(0o777)` | — |
| `fileMode710` | `—` | `os.FileMode(0o710)` | — |
| `fileMode755` | `—` | `os.FileMode(0o755)` | — |
| `fileMode666` | `—` | `os.FileMode(0o666)` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `SnapshotErrorTime` | `—` | `time.Date(2000, 0, 0, 0, 0, 0, 0, time.UTC)` | — |
| `SharedAllocName` | `—` | `"alloc"` | — |
| `LogDirName` | `—` | `"logs"` | — |
| `SharedDataDir` | `—` | `"data"` | — |
| `TmpDirName` | `—` | `"tmp"` | — |
| `SharedAllocDirs` | `—` | `[]string{...}` | — |
| `TaskLocal` | `—` | `"local"` | — |
| `TaskSecrets` | `—` | `"secrets"` | — |
| `TaskPrivate` | `—` | `"private"` | — |
| `TaskDirs` | `—` | `map[string]os.FileMode{...}` | — |
| `AllocGRPCSocket` | `—` | `filepath.Join(SharedAllocName, TmpDirName, "consul_grpc.s...` | — |
| `AllocHTTPSocket` | `—` | `filepath.Join(SharedAllocName, TmpDirName, "consul_http.s...` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `AllocDirPath` | `a *AllocDir` | `` | `string` | [L134](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L134) |
| `ShareDirPath` | `a *AllocDir` | `` | `string` | [L138](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L138) |
| `GetTaskDir` | `a *AllocDir` | `task string` | `*TaskDir` | [L142](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L142) |
| `NewAllocDir` | - | `logger hclog.Logger, clientAllocDir string, clientMountsDir string, allocID s...` | `*AllocDir` | [L160](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L160) |
| `NewTaskDir` | `a *AllocDir` | `task *structs.Task` | `*TaskDir` | [L176](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L176) |
| `Snapshot` | `a *AllocDir` | `w io.Writer` | `error` | [L196](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L196) |
| `Move` | `a *AllocDir` | `other Interface, tasks []*structs.Task` | `error` | [L276](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L276) |
| `Destroy` | `a *AllocDir` | `` | `error` | [L321](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L321) |
| `UnmountAll` | `a *AllocDir` | `` | `error` | [L340](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L340) |
| `Build` | `a *AllocDir` | `` | `error` | [L355](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L355) |
| `List` | `a *AllocDir` | `path string` | `[]*cstructs.AllocFileInfo, error` | [L382](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L382) |
| `Stat` | `a *AllocDir` | `path string` | `*cstructs.AllocFileInfo, error` | [L412](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L412) |
| `detectContentType` | - | `fileInfo os.FileInfo, path string` | `string` | [L439](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L439) |
| `ReadAt` | `a *AllocDir` | `path string, offset int64` | `io.ReadCloser, error` | [L462](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L462) |
| `caseInsensitiveHasPrefix` | - | `s string, prefix string` | `bool` | [L496](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L496) |
| `BlockUntilExists` | `a *AllocDir` | `ctx context.Context, path string` | `chan error, error` | [L502](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L502) |
| `ChangeEvents` | `a *AllocDir` | `ctx context.Context, path string, curOffset int64` | `*watch.FileChanges, error` | [L528](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L528) |
| `getFileWatcher` | - | `path string` | `watch.FileWatcher` | [L548](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L548) |
| `fileCopy` | - | `src string, dst string, uid int, gid int, perm os.FileMode` | `error` | [L554](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L554) |
| `pathExists` | - | `path string` | `bool` | [L582](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L582) |
| `pathEmpty` | - | `path string` | `bool, error` | [L593](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L593) |
| `createDir` | - | `basePath string, relPath string` | `error` | [L609](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L609) |
| `splitPath` | - | `path string` | `[]fileInfo, error` | [L646](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L646) |
| `SnapshotErrorFilename` | - | `allocID string` | `string` | [L686](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L686) |
| `writeError` | - | `tw *tar.Writer, allocID string, err error` | `error` | [L692](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L692) |
| `allocMkdirAll` | - | `path string, perms os.FileMode` | `error` | [L715](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L715) |
| `allocMakeSecretsDir` | - | `path string, size int, perms os.FileMode` | `error` | [L730](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L730) |

## 5. 核心方法详解

### NewAllocDir()

**签名**：`func NewAllocDir(logger hclog.Logger, clientAllocDir string, clientMountsDir string, allocID string) *AllocDir`

**位置**：[L160](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L160)

**中文说明**：创建并返回一个新的 AllocDir 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `clientAllocDir` | `string` | 字符串 |
| `clientMountsDir` | `string` | 字符串 |
| `allocID` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*AllocDir` | — |

### NewTaskDir()

**签名**：`func (a *AllocDir) NewTaskDir(task *structs.Task) *TaskDir`

**位置**：[L176](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L176)

**中文说明**：创建并返回一个新的 TaskDir 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `task` | `*structs.Task` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*TaskDir` | — |

### Snapshot()

**签名**：`func (a *AllocDir) Snapshot(w io.Writer) error`

**位置**：[L196](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L196)

**中文说明**：创建对象的快照。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `w` | `io.Writer` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Destroy()

**签名**：`func (a *AllocDir) Destroy() error`

**位置**：[L321](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L321)

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Build()

**签名**：`func (a *AllocDir) Build() error`

**位置**：[L355](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L355)

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### List()

**签名**：`func (a *AllocDir) List(path string) []*cstructs.AllocFileInfo, error`

**位置**：[L382](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L382)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `path` | `string` | 路径 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*cstructs.AllocFileInfo` | 列表 |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `archive/tar` | 标准库 |
| `context` | 标准库 |
| `fmt` | 标准库 |
| `gopkg.in/tomb.v1` | 标准库 |
| `io` | 标准库 |
| `net/http` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/client/structs` | 内部包 |
| `github.com/hashicorp/nomad/helper/escapingfs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/hpcloud/tail/watch` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟
- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **IO 操作**：涉及文件或数据流的读写操作
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **HTTP 服务**：提供 HTTP API 端点或客户端
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [alloc_dir_test.go](file:///d:/claude/nomad/client/allocdir/alloc_dir_test.go) | 对应测试文件 |
| [fs_darwin.go](file:///d:/claude/nomad/client/allocdir/fs_darwin.go) | 同目录源文件 |
| [fs_default.go](file:///d:/claude/nomad/client/allocdir/fs_default.go) | 同目录源文件 |
| [fs_freebsd.go](file:///d:/claude/nomad/client/allocdir/fs_freebsd.go) | 同目录源文件 |
| [fs_linux.go](file:///d:/claude/nomad/client/allocdir/fs_linux.go) | 同目录源文件 |
| [fs_netbsd.go](file:///d:/claude/nomad/client/allocdir/fs_netbsd.go) | 同目录源文件 |

