# Nomad Allocation Filesystems 技术实现分析

> 文档版本：基于 Nomad 源码主干（2026-07-14）
> 范围：客户端分配目录（allocdir）子系统、文件系统隔离、Snapshot、FS Endpoint、跨平台实现、与 AllocRunner/TaskRunner/Driver 的集成

---

## 目录

1. [总体架构](#1-总体架构)
2. [目录结构](#2-目录结构)
3. [核心数据结构](#3-核心数据结构)
4. [文件系统隔离模式](#4-文件系统隔离模式)
5. [构建流程](#5-构建流程)
6. [跨平台实现](#6-跨平台实现)
7. [Chroot 构建](#7-chroot-构建)
8. [Secrets 与 Private 目录](#8-secrets-与-private-目录)
9. [Snapshot 机制](#9-snapshot-机制)
10. [文件操作 API](#10-文件操作-api)
11. [安全机制](#11-安全机制)
12. [与 AllocRunner/TaskRunner 集成](#12-与-allocrunnertaskrunner-集成)
13. [与 Driver 集成](#13-与-driver-集成)
14. [环境变量映射](#14-环境变量映射)
15. [配置项](#15-配置项)
16. [典型调用链](#16-典型调用链)
17. [代码文件索引](#17-代码文件索引)
18. [设计要点与最佳实践](#18-设计要点与最佳实践)
19. [附录：关键常量与默认值速查](#19-附录关键常量与默认值速查)
20. [总结](#20-总结)

---

## 1. 总体架构

Nomad 的 Allocation Filesystem 子系统为每个分配（Allocation）在客户端节点上创建一个独立、隔离的文件系统视图，提供：

- **任务间共享目录**：同一 Task Group 内的任务可通过 `alloc/` 共享数据
- **任务本地目录**：每个任务独立的 `local/` 用于持久化任务数据
- **敏感数据隔离**：`secrets/` 目录使用 tmpfs（Linux），不写入磁盘
- **私有目录**：`private/` 目录同样使用 tmpfs，用于 Nomad 内部数据
- **日志目录**：`alloc/logs/` 集中存储任务 stdout/stderr
- **文件系统隔离**：支持 None、Chroot、Image、Unveil 四种模式
- **跨平台支持**：Linux、Windows、Darwin、FreeBSD、NetBSD、Solaris

### 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                    Nomad Client Agent                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  AllocRunner (per alloc)                 │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │   allocdir.AllocDir                                │  │  │
│  │  │   ├── <alloc_dir>/                                 │  │  │
│  │  │   │   ├── <task_name>/  (TaskDir per task)         │  │  │
│  │  │   │   │   ├── local/      (任务本地)               │  │  │
│  │  │   │   │   ├── secrets/    (tmpfs, 敏感数据)        │  │  │
│  │  │   │   │   ├── private/    (tmpfs, Nomad 内部)      │  │  │
│  │  │   │   │   ├── tmp/        (sticky, 1777)           │  │  │
│  │  │   │   │   ├── alloc/      (→ bind/hardlink 到共享) │  │  │
│  │  │   │   │   └── (chroot 内容: /bin, /lib, /usr ...)  │  │  │
│  │  │   │   └── alloc/          (SharedDir)              │  │  │
│  │  │   │       ├── logs/       (任务日志)               │  │  │
│  │  │   │       ├── tmp/        (共享 tmp)               │  │  │
│  │  │   │       └── data/       (共享数据, 参与 snapshot)│  │  │
│  │  │   └── TaskDirs map[string]*TaskDir                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │           ↑ Build()/Destroy()/Move()                      │  │
│  │  allocdir_hook (Prerun/Destroy)                          │  │
│  │           ↓                                              │  │
│  │  task_dir_hook (Prestart) → TaskDir.Build()              │  │
│  │           ↓                                              │  │
│  │  TaskRunner → DriverPlugin.StartTask()                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  FS Endpoint (RPC)  ←──── FileSystem.List/Stat/Stream/Logs     │
│  HTTP /v1/client/allocs/:id/snapshot  ←──── Snapshot           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. 目录结构

定义在 [alloc_dir.go](file:///d:/claude/nomad/client/allocdir/alloc_dir.go) 中：

```go
SharedAllocName = "alloc"     // 任务组共享目录名
LogDirName      = "logs"      // 日志目录名
SharedDataDir   = "data"      // 共享数据目录（参与 snapshot）
TmpDirName      = "tmp"       // tmp 目录
TaskLocal       = "local"     // 任务本地目录
TaskSecrets     = "secrets"   // 任务秘密目录
TaskPrivate     = "private"   // 任务私有目录

SharedAllocDirs = []string{LogDirName, TmpDirName, SharedDataDir}
TaskDirs        = map[string]os.FileMode{TmpDirName: os.ModeSticky | fileMode777}
```

### 物理目录树（以 Linux chroot 隔离为例）

```
<client.alloc_dir>/<alloc_id>/
├── alloc/                              ← SharedDir (Task Group 共享)
│   ├── logs/                           ← 所有任务的 stdout/stderr
│   │   ├── <task>.stdout.0
│   │   ├── <task>.stdout.1
│   │   ├── <task>.stderr.0
│   │   └── <task>.stderr.1
│   ├── tmp/                            ← 共享 tmp (sticky, 1777)
│   └── data/                           ← 共享数据 (参与 snapshot)
│
├── <task_name>/                        ← TaskDir
│   ├── local/                          ← 任务本地数据 (参与 snapshot)
│   ├── secrets/                        ← tmpfs, 敏感数据 (root 才能挂载)
│   ├── private/                        ← tmpfs, Nomad 内部
│   ├── tmp/                            ← sticky, 1777
│   ├── alloc/                          ← bind mount 到 <alloc_dir>/alloc
│   │   └── logs/                       ← bind mount 到 <alloc_dir>/alloc/logs
│   ├── dev/                            ← (Linux) mount /dev
│   ├── proc/                           ← (Linux) mount /proc
│   └── (chroot 嵌入内容)               ← /bin, /etc, /lib, /usr ...
│
└── <task_name>/.nomad-mount            ← secrets tmpfs 标记文件 (Linux)
```

### MountsDir 路径（Unveil 模式）

```
<client.alloc_mounts_dir>/<alloc_id>-<task_name>/
├── (root)                              ← bind mount <task_dir>
├── alloc/                              ← bind mount <alloc_dir>/alloc (nobody: nogroup, 777)
└── secrets/                            ← bind mount <task_dir>/secrets
```

### Consul Socket 路径

```go
AllocGRPCSocket  = "alloc/tmp/consul_grpc.sock"   // Consul gRPC unix socket
AllocHTTPSocket  = "alloc/tmp/consul_http.sock"   // Consul HTTP unix socket
```
通过 [consul_grpc_sock_hook.go](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go) 注入到每个 Task Group 的共享 tmp 目录，供 Connect/Envoy 使用。

---

## 3. 核心数据结构

### 3.1 AllocDir

定义在 [alloc_dir.go](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L101-L126)：

```go
type AllocDir struct {
    AllocDir   string                  // 完整路径：<client.alloc_dir>/<alloc_id>
    SharedDir  string                  // <alloc_dir>/alloc
    TaskDirs   map[string]*TaskDir     // 按 task name 索引

    clientAllocDir       string        // client.alloc_dir 根（排除出 chroot）
    clientAllocMountsDir string        // client.alloc_mounts_dir 根（排除出 chroot）

    built bool                          // Build 是否成功
    mu    sync.RWMutex
    logger hclog.Logger
}

// Interface 由 AllocDir 实现
type Interface interface {
    AllocDirFS
    NewTaskDir(*structs.Task) *TaskDir
    AllocDirPath() string
    ShareDirPath() string
    GetTaskDir(string) *TaskDir
    Build() error
    Destroy() error
    Move(Interface, []*structs.Task) error
}
```

### 3.2 AllocDirFS

定义在 [alloc_dir.go](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L146-L152)，由 FS Endpoint 调用：

```go
type AllocDirFS interface {
    List(path string) ([]*cstructs.AllocFileInfo, error)
    Stat(path string) (*cstructs.AllocFileInfo, error)
    ReadAt(path string, offset int64) (io.ReadCloser, error)
    Snapshot(w io.Writer) error
    BlockUntilExists(ctx context.Context, path string) (chan error, error)
    ChangeEvents(ctx context.Context, path string, curOffset int64) (*watch.FileChanges, error)
}
```

### 3.3 TaskDir

定义在 [task_dir.go](file:///d:/claude/nomad/client/allocdir/task_dir.go#L24-L73)：

```go
type TaskDir struct {
    AllocDir         string  // <alloc_dir>
    Dir              string  // <task_dir> = <alloc_dir>/<task_name>
    MountsAllocDir   string  // <client.mounts_dir>/<allocid-task>/alloc  → <alloc_dir>
    MountsTaskDir    string  // <client.mounts_dir>/<allocid-task>          → <task_dir>
    MountsSecretsDir string  // <client.mounts_dir>/<allocid-task>/secrets  → <secrets_dir>
    SharedAllocDir   string  // <alloc_dir>/alloc/
    SharedTaskDir    string  // <task_dir>/alloc/  (chroot 模式下 bind 到 SharedAllocDir)
    LocalDir         string  // <task_dir>/local/
    LogDir           string  // <alloc_dir>/alloc/logs/
    SecretsDir       string  // <task_dir>/secrets/
    PrivateDir       string  // <task_dir>/private/
    secretsInMB      int     // tmpfs 大小（默认 1MB，可由 task.Resources.SecretsMB 配置）
    skip             *set.Set[string]  // chroot 跳过列表：{clientAllocDir, clientAllocMountsDir}
    logger           hclog.Logger
}
```

### 3.4 文件权限常量

```go
fileMode777 = 0o777  // rwxrwxrwx  (LocalDir, SecretsDir, tmp 等)
fileMode710 = 0o710  // rwx--x---  (MountsTaskDir, MountsSecretsDir, parent)
fileMode755 = 0o755  // rwxr-xr-x  (AllocDir 根, SharedDir)
fileMode666 = 0o666  // rw-rw-rw-  (secretMarker 文件)
```

---

## 4. 文件系统隔离模式

定义在 [plugins/drivers/fsisolation/isolation.go](file:///d:/claude/nomad/plugins/drivers/fsisolation/isolation.go)：

```go
type Mode string

const (
    None   = Mode("none")    // 无隔离，使用宿主文件系统
    Chroot = Mode("chroot")  // 宿主 chroot（exec/java/qemu/raw_exec）
    Image  = Mode("image")   // 容器镜像（docker）
    Unveil = Mode("unveil")  // landlock/unveil 语义 + bind mount
)
```

### 模式对比

| 模式 | 容器内路径 | 典型 Driver | 共享目录挂载 | Secrets 处理 | Chroot 嵌入 |
|------|-----------|-------------|-------------|-------------|-------------|
| `None` | 宿主路径 (`taskDir.SharedAllocDir` 等) | docker `network_mode=host` | 不挂载 | tmpfs on host | 不构建 |
| `Chroot` | `/alloc`, `/local`, `/secrets` | exec, raw_exec, java, qemu | bind mount 到 `taskDir/alloc` | tmpfs on host | **构建 chroot** |
| `Image` | 容器内由镜像决定 | docker | driver 自行 bind | driver 处理 | 不构建 |
| `Unveil` | `<mounts_dir>/...` 路径 | (OpenBSD landlock 实验) | bind mount 到 MountsDir | bind mount | 不构建 |

### 隔离模式选择流程

```
TaskRunner 启动 → 询问 driver.Capabilities() → 获取 FSIsolation
    │
    ├── None   → env 指向宿主路径，不构建 chroot
    ├── Chroot → 构建 chroot，env 指向容器路径（/, /alloc, /local, /secrets）
    ├── Image  → 不构建 chroot，env 由 driver 自行处理
    └── Unveil → bind mount 到 MountsDir，env 指向 MountsDir 路径
```

---

## 5. 构建流程

### 5.1 AllocDir.Build()

定义在 [alloc_dir.go](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L313-L337)：

```go
func (a *AllocDir) Build() error {
    // 1. 创建 AllocDir（0755，Nomad 进程所有）
    os.MkdirAll(a.AllocDir, fileMode755)

    // 2. 创建 SharedDir（0755）
    allocMkdirAll(a.SharedDir, fileMode755)

    // 3. 创建共享子目录（0777）：logs/, tmp/, data/
    for _, dir := range SharedAllocDirs {
        allocMkdirAll(filepath.Join(a.SharedDir, dir), fileMode777)
    }

    a.built = true
    return nil
}
```

### 5.2 TaskDir.Build()

定义在 [task_dir.go](file:///d:/claude/nomad/client/allocdir/task_dir.go#L98-L182)：

```go
func (t *TaskDir) Build(fsi fsisolation.Mode, chroot map[string]string, username string) error {
    // 1. 创建 task 根目录、local 目录（0777）
    allocMkdirAll(t.Dir, fileMode777)
    allocMkdirAll(t.LocalDir, fileMode777)

    // 2. 创建 TaskDirs 中的目录（tmp: sticky 1777）
    for dir, perms := range TaskDirs {
        allocMkdirAll(filepath.Join(t.Dir, dir), perms)
    }

    // 3. 仅 Chroot 模式：bind mount 共享目录到 task/alloc
    if fsi == fsisolation.Chroot {
        linkDir(t.SharedAllocDir, t.SharedTaskDir, false)
        linkDir(t.LogDir, filepath.Join(t.SharedTaskDir, "logs"), true)
    }

    // 4. 创建 secrets 目录（tmpfs on Linux root）
    allocMakeSecretsDir(t.SecretsDir, t.secretsInMB, fileMode777)

    // 5. 创建 private 目录（tmpfs，1MB）
    allocMakeSecretsDir(t.PrivateDir, defaultSecretDirTmpfsSize, fileMode777)

    // 6. 仅 Chroot 模式：构建 chroot（硬链接/复制 /bin, /lib 等）
    if fsi == fsisolation.Chroot {
        t.buildChroot(chroot)
    }

    // 7. 仅 Unveil 模式：bind mount 到 MountsDir
    if fsi == fsisolation.Unveil {
        uid, gid, _ := dynamic.LookupUser(username)         // 任务运行用户
        nobodyUID, nobodyGID, _ := dynamic.LookupUser("nobody")

        os.MkdirAll(parent, fileMode710)
        os.Chown(parent, uid, gid)

        mountDir(t.Dir, t.MountsTaskDir, uid, gid, fileMode710)
        mountDir(filepath.Join(t.AllocDir, "/alloc"), t.MountsAllocDir, nobodyUID, nobodyGID, fileMode777)
        mountDir(t.SecretsDir, t.MountsSecretsDir, uid, gid, fileMode710)
    }
    return nil
}
```

### 5.3 构建时序图

```
AllocRunner.Run()
    │
    ├─ Prerun hooks
    │   └─ allocdir_hook.Prerun()  →  AllocDir.Build()
    │                                   创建 <alloc_dir> + alloc/{logs,tmp,data}
    │
    └─ TaskRunner.Run() (per task)
        └─ Prestart hooks
            └─ task_dir_hook.Prestart()
                ├─ taskDir.Build(fsi, chroot, user)
                │   ├─ 创建 task/, local/, tmp/
                │   ├─ (Chroot) bind mount alloc → task/alloc
                │   ├─ 创建 secrets/ (tmpfs on Linux)
                │   ├─ 创建 private/ (tmpfs on Linux)
                │   ├─ (Chroot) buildChroot: 硬链接/复制 /bin, /lib, /usr ...
                │   └─ (Unveil) bind mount 到 MountsDir
                └─ setEnvvars(envBuilder, fsi, taskDir, conf)
                    设置 NOMAD_ALLOC_DIR, NOMAD_TASK_DIR, NOMAD_SECRETS_DIR 等
```

---

## 6. 跨平台实现

每个平台有独立的 `fs_<os>.go` 文件，实现平台特定的原语：

### 6.1 函数签名一致性

所有平台都提供以下函数（部分为 noop）：

| 函数 | Linux | Windows | Darwin/FreeBSD/NetBSD/Solaris |
|------|-------|---------|-------------------------------|
| `linkDir(src, dst, ro)` | `syscall.Mount(..., MS_BIND[, MS_RDONLY])` | noop | `syscall.Link` (硬链接) |
| `unlinkDir(dir)` | `syscall.Unmount(dir, 0)` | noop | `syscall.Unlink` |
| `mountDir(old, next, uid, gid, mode)` | `unix.Mount(..., MS_BIND\|MS_NOSUID\|MS_NOATIME)` + `Chown` | panic("not implemented") | (无该函数定义) |
| `createSecretDir(dir, size)` | `tmpfs` mount (root) 或 `MkdirAll` (非 root) | `MkdirAll` | `MkdirAll` |
| `removeSecretDir(dir)` | `Unmount` + `RemoveAll` | `RemoveAll` | `RemoveAll` |
| `dropDirPermissions(path, mode)` | `Chmod 0777` + `Chown nobody` | noop | `Chmod 0777` + `Chown nobody` |
| `MountSpecialDirs(taskDir)` | mount /dev, /proc | noop | (在 fs_unix.go 实现) |
| `getOwner(fi)` | `Stat_t.Uid/Gid` | `idUnsupported, idUnsupported` | `Stat_t.Uid/Gid` |
| `linkOrCopy(src, dst, ...)` | `os.Link` 失败时 `fileCopy` | `fileCopy`（不支持硬链接） | `os.Link` 失败时 `fileCopy` |

### 6.2 Linux 实现（fs_linux.go）

定义在 [fs_linux.go](file:///d:/claude/nomad/client/allocdir/fs_linux.go)：

```go
// linkDir 使用 bind mount（Linux 不支持目录硬链接）
func linkDir(src, dst string, ro bool) error {
    os.MkdirAll(dst, fileMode777)
    if ro {
        return syscall.Mount(src, dst, "", syscall.MS_BIND|syscall.MS_RDONLY, "")
    }
    return syscall.Mount(src, dst, "", syscall.MS_BIND, "")
}

// mountDir 用于 Unveil 模式，附加 NOSUID + NOATIME
func mountDir(old, next string, uid, gid int, mode os.FileMode) error {
    os.MkdirAll(next, mode)
    opts := unix.MS_BIND | unix.MS_NOSUID | unix.MS_NOATIME
    unix.Mount(old, next, "", uintptr(opts), "")
    os.Chmod(next, mode)
    return os.Chown(next, uid, gid)
}

// createSecretDir 挂载 tmpfs（仅 root），带 .nomad-mount 标记防重复挂载
func createSecretDir(dir string, size int) error {
    if unix.Geteuid() == 0 {
        os.MkdirAll(dir, fileMode777)
        marker := filepath.Join(dir, secretMarker)  // ".nomad-mount"
        if _, err := os.Stat(marker); err == nil {
            return nil  // 已挂载
        }
        flags := uintptr(syscall.MS_NOEXEC)
        options := fmt.Sprintf("size=%dm,noswap", size)  // 永久禁用 swap
        err := syscall.Mount("tmpfs", dir, "tmpfs", flags, options)
        if err != nil {
            // 旧内核不支持 noswap，回退
            options = fmt.Sprintf("size=%dm", size)
            syscall.Mount("tmpfs", dir, "tmpfs", flags, options)
        }
        // 写入 marker 文件
        f, _ := os.OpenFile(marker, os.O_RDWR|os.O_CREATE, fileMode666)
        f.Close()
    }
    return os.MkdirAll(dir, fileMode777)
}
```

### 6.3 Windows 实现（fs_windows.go）

定义在 [fs_windows.go](file:///d:/claude/nomad/client/allocdir/fs_windows.go)：

```go
// Windows 路径前缀
SharedAllocContainerPath  = filepath.Join("c:\\", SharedAllocName)    // c:\alloc
TaskLocalContainerPath    = filepath.Join("c:\\", TaskLocal)          // c:\local
TaskSecretsContainerPath  = filepath.Join("c:\\", TaskSecrets)        // c:\secrets

// Windows 不支持硬链接/bind mount，所有操作退化为 noop 或复制
func linkOrCopy(src, dst string, uid, gid int, perm os.FileMode) error {
    return fileCopy(src, dst, uid, gid, perm)  // 总是复制
}
func linkDir(src, dst string, _ bool) error { return nil }
func unlinkDir(dir string) error            { return nil }
func createSecretDir(dir string, _ int) error {
    return os.MkdirAll(dir, fileMode777)  // 仅普通目录，无 tmpfs
}
func dropDirPermissions(path string, _ os.FileMode) error { return nil }
func MountSpecialDirs(taskDir string) error                { return nil }
func getOwner(os.FileInfo) (int, int) {
    return idUnsupported, idUnsupported  // Windows 不使用整数 UID
}
```

### 6.4 Darwin / FreeBSD 实现（fs_darwin.go, fs_freebsd.go）

定义在 [fs_darwin.go](file:///d:/claude/nomad/client/allocdir/fs_darwin.go) 和 [fs_freebsd.go](file:///d:/claude/nomad/client/allocdir/fs_freebsd.go)（内容相同）：

```go
// 使用硬链接（同文件系统内）
func linkDir(src, dst string, _ bool) error {
    return syscall.Link(src, dst)
}
func unlinkDir(dir string) error {
    return syscall.Unlink(dir)
}
// 无 tmpfs 支持
func createSecretDir(dir string, _ int) error {
    return os.MkdirAll(dir, fileMode777)
}
```

### 6.5 Unix 通用实现（fs_unix.go）

定义在 [fs_unix.go](file:///d:/claude/nomad/client/allocdir/fs_unix.go)（build tag: `unix`）：

```go
// 路径前缀（容器内）
SharedAllocContainerPath  = filepath.Join("/", SharedAllocName)   // /alloc
TaskLocalContainerPath    = filepath.Join("/", TaskLocal)         // /local
TaskSecretsContainerPath  = filepath.Join("/", TaskSecrets)       // /secrets

// dropDirPermissions 放宽权限并将 owner 改为 nobody
func dropDirPermissions(path string, desired os.FileMode) error {
    os.Chmod(path, desired|fileMode777)
    if unix.Geteuid() != 0 { return nil }
    u, _ := users.Lookup("nobody")
    uid, _ := getUid(u); gid, _ := getGid(u)
    return os.Chown(path, uid, gid)
}

// linkOrCopy 先尝试硬链接，失败则复制
func linkOrCopy(src, dst string, uid, gid int, perm os.FileMode) error {
    if fileInfo, _ := os.Stat(dst); fileInfo != nil { return nil }  // 已存在跳过
    if err := os.Link(src, dst); err == nil { return nil }
    return fileCopy(src, dst, uid, gid, perm)
}

func getOwner(fi os.FileInfo) (int, int) {
    stat, ok := fi.Sys().(*syscall.Stat_t)
    if !ok { return -1, -1 }
    return int(stat.Uid), int(stat.Gid)
}
```

### 6.6 Linux 特殊目录卸载（task_dir_linux.go）

定义在 [task_dir_linux.go](file:///d:/claude/nomad/client/allocdir/task_dir_linux.go)：

```go
func (t *TaskDir) unmountSpecialDirs() error {
    // 卸载并删除 <task>/dev 和 <task>/proc
    dev := filepath.Join(t.Dir, "dev")
    if pathExists(dev) {
        unlinkDir(dev); os.RemoveAll(dev)
    }
    proc := filepath.Join(t.Dir, "proc")
    if pathExists(proc) {
        unlinkDir(proc); os.RemoveAll(proc)
    }
    return nil
}
```

非 Linux 平台（[task_dir_nonlinux.go](file:///d:/claude/nomad/client/allocdir/task_dir_nonlinux.go)）为 noop。

---

## 7. Chroot 构建

### 7.1 buildChroot 入口

定义在 [task_dir.go](file:///d:/claude/nomad/client/allocdir/task_dir.go#L184-L187)：

```go
func (t *TaskDir) buildChroot(entries map[string]string) error {
    return t.embedDirs(entries)
}
```

### 7.2 embedDirs 递归嵌入

定义在 [task_dir.go](file:///d:/claude/nomad/client/allocdir/task_dir.go#L189-L268)：

```go
func (t *TaskDir) embedDirs(entries map[string]string) error {
    subdirs := make(map[string]string)
    for source, dest := range entries {
        // 1. 跳过 client.alloc_dir 和 client.alloc_mounts_dir（防递归）
        if t.skip.Contains(source) { continue }

        // 2. 源不存在则跳过
        s, err := os.Stat(source)
        if os.IsNotExist(err) { continue }

        // 3. 单文件：创建目标目录 + linkOrCopy
        if !s.IsDir() {
            createDir(t.Dir, filepath.Dir(dest))
            linkOrCopy(source, taskEntry, uid, gid, s.Mode().Perm())
            continue
        }

        // 4. 目录：创建目标，遍历子项
        createDir(t.Dir, dest)
        for _, fileEntry := range dirEntries {
            if entry.IsDir() {
                subdirs[hostEntry] = ...  // 递归处理
                continue
            }
            // 已存在跳过（task 重启场景）
            if _, err := os.Lstat(taskEntry); err == nil { continue }

            // 符号链接：重新创建 symlink
            if entry.Mode()&os.ModeSymlink != 0 {
                link, _ := os.Readlink(hostEntry)
                os.Symlink(link, taskEntry)
                continue
            }
            // 普通文件：linkOrCopy
            linkOrCopy(hostEntry, taskEntry, uid, gid, entry.Mode().Perm())
        }
    }
    // 递归处理子目录
    if len(subdirs) != 0 { return t.embedDirs(subdirs) }
    return nil
}
```

### 7.3 默认 Chroot 配置

定义在 [config.go](file:///d:/claude/nomad/client/config/config.go#L63-L78)：

```go
DefaultChrootEnv = map[string]string{
    "/bin":                  "/bin",
    "/etc":                  "/etc",
    "/lib":                  "/lib",
    "/lib32":                "/lib32",
    "/lib64":                "/lib64",
    "/run/resolvconf":       "/run/resolvconf",
    "/sbin":                 "/sbin",
    "/usr":                  "/usr",
    "/run/systemd/resolve":  "/run/systemd/resolve",  // systemd-resolved 兼容
}
```

可通过 `client.chroot_env` 在配置文件中覆盖。

### 7.4 createDir 与 splitPath

`createDir` 递归创建目录并保留宿主侧权限/owner：

```go
func createDir(basePath, relPath string) error {
    filePerms, _ := splitPath(relPath)  // 从内到外 stat 每一层
    for i := len(filePerms) - 1; i >= 0; i-- {
        fi := filePerms[i]
        destDir := filepath.Join(basePath, fi.Name)
        os.MkdirAll(destDir, fi.Perm)
        if fi.Uid != idUnsupported && fi.Gid != idUnsupported {
            os.Chown(destDir, fi.Uid, fi.Gid)
        }
    }
    return nil
}
```

---

## 8. Secrets 与 Private 目录

### 8.1 设计目标

- **Secrets 目录** (`<task>/secrets/`)：存放 Vault token、TLS 证书等敏感数据，由 Nomad/Vault 注入
- **Private 目录** (`<task>/private/`)：存放 Nomad 内部数据（如 Consul bootstrap 配置），不参与 snapshot

### 8.2 Linux tmpfs 挂载（root 权限）

```go
flags   := syscall.MS_NOEXEC                          // 禁止执行
options := fmt.Sprintf("size=%dm,noswap", sizeInMB)   // 永久禁用 swap
syscall.Mount("tmpfs", dir, "tmpfs", flags, options)
```

- **MS_NOEXEC**：禁止从 secrets 目录执行二进制
- **noswap**：防止 secrets 被换出到磁盘（旧内核不支持时回退）
- **size**：默认 1MB，可通过 `task.Resources.SecretsMB` 调整
- **标记文件** `.nomad-mount`：防止 task 重启时重复挂载 tmpfs

### 8.3 非 root / 非 Linux 降级

- 非 root 用户：仅创建普通目录 `os.MkdirAll(dir, 0o777)`
- Windows：普通目录
- Darwin/FreeBSD：普通目录

### 8.4 读取保护

在 [alloc_dir.go](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L409-L425) 的 `ReadAt` 中：

```go
func (a *AllocDir) ReadAt(path string, offset int64) (io.ReadCloser, error) {
    // ... 路径逃逸检查 ...
    a.mu.RLock()
    for _, dir := range a.TaskDirs {
        if caseInsensitiveHasPrefix(p, dir.SecretsDir) {
            return nil, fmt.Errorf("Reading secret file prohibited: %s", path)
        }
        if caseInsensitiveHasPrefix(p, dir.PrivateDir) {
            return nil, fmt.Errorf("Reading private file prohibited: %s", path)
        }
    }
    a.mu.RUnlock()
    // ... 打开文件并 seek ...
}
```

**关键点**：即使通过 FS API 也无法读取 secrets/private 内容（大小写不敏感前缀匹配）。

### 8.5 Unveil 模式下的 bind mount

```go
mountDir(t.SecretsDir, t.MountsSecretsDir, uid, gid, fileMode710)
//  - 源：宿主 <task>/secrets (tmpfs)
//  - 目标：<mounts_dir>/<allocid-task>/secrets
//  - owner：任务运行用户 (uid, gid)
//  - 权限：0710 (rwx--x---)，仅 owner 可访问
```

---

## 9. Snapshot 机制

### 9.1 Snapshot 用途

用于在任务调度迁移、reschedule、drain 时将 alloc 数据打包传输到新节点。HTTP API：

```
GET /v1/client/allocs/:alloc_id/snapshot?token=<migrate_token>
```

### 9.2 HTTP 端点

定义在 [alloc_endpoint.go](file:///d:/claude/nomad/command/agent/alloc_endpoint.go#L505-L521)：

```go
func (s *HTTPServer) allocSnapshot(allocID string, resp http.ResponseWriter, req *http.Request) {
    // 1. 校验 migrate token（防未授权快照）
    if !s.agent.Client().ValidateMigrateToken(allocID, secret) {
        return structs.ErrPermissionDenied
    }
    // 2. 获取 AllocDirFS
    allocFS, err := s.agent.Client().GetAllocFS(allocID)
    // 3. 直接将 tar 流写入 HTTP response
    allocFS.Snapshot(resp)
}
```

### 9.3 AllocDir.Snapshot 实现

定义在 [alloc_dir.go](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L161-L244)：

```go
func (a *AllocDir) Snapshot(w io.Writer) error {
    a.mu.RLock()
    defer a.mu.RUnlock()

    // 只 snapshot 以下两类目录：
    //   1. <alloc_dir>/alloc/data  (SharedDataDir)
    //   2. 每个 task 的 <task>/local (LocalDir)
    // 注意：secrets/, private/, logs/, tmp/ 不参与 snapshot
    allocDataDir := filepath.Join(a.SharedDir, SharedDataDir)
    rootPaths := []string{allocDataDir}
    for _, taskdir := range a.TaskDirs {
        rootPaths = append(rootPaths, taskdir.LocalDir)
    }

    tw := tar.NewWriter(w)
    defer tw.Close()

    walkFn := func(path string, fileInfo os.FileInfo, err error) error {
        // 计算 path 相对于 AllocDir 的路径（保持 tar 内目录结构）
        relPath, _ := filepath.Rel(a.AllocDir, path)

        // 处理符号链接
        link := ""
        if fileInfo.Mode()&os.ModeSymlink != 0 {
            target, _ := os.Readlink(path)
            link = target
        }

        // 写入 tar header
        hdr, _ := tar.FileInfoHeader(fileInfo, link)
        hdr.Name = relPath
        tw.WriteHeader(hdr)

        // 目录/symlink 只写 header
        if fileInfo.IsDir() || (fileInfo.Mode()&os.ModeSymlink != 0) {
            return nil
        }

        // 复制文件内容
        file, _ := os.Open(path)
        defer file.Close()
        io.Copy(tw, file)
        return nil
    }

    // 遍历所有 rootPaths
    for _, path := range rootPaths {
        if err := filepath.Walk(path, walkFn); err != nil {
            // 即使出错也写入错误标记文件
            allocID := filepath.Base(a.AllocDir)
            writeError(tw, allocID, err)  // NOMAD-<allocID>-ERROR.log
            return fmt.Errorf("failed to snapshot %s: %w", path, err)
        }
    }
    return nil
}
```

### 9.4 错误标记文件

```go
SnapshotErrorTime      = time.Date(2000, 0, 0, 0, 0, 0, 0, time.UTC)  // 哨兵时间
SnapshotErrorFilename  = "NOMAD-<allocID>-ERROR.log"
```

如果 snapshot 过程出错，会向 tar 追加一个名为 `NOMAD-<allocID>-ERROR.log` 的文件，内容为错误信息。接收方在解压时检查该文件存在则视为 snapshot 失败。

### 9.5 Move 操作（同节点 reschedule）

定义在 [alloc_dir.go](file:///d:/claude/nomad/client/allocdir/alloc_dir.go#L246-L288)：

```go
func (a *AllocDir) Move(other Interface, tasks []*structs.Task) error {
    // 前置条件：a 已 Build
    if !a.built { return error }

    // 1. 移动 data 目录：<other>/alloc/data → <a>/alloc/data
    os.Rename(otherDataDir, dataDir)

    // 2. 移动每个 task 的 local 目录
    for _, task := range tasks {
        os.Rename(otherTaskLocal, localDir)
    }
    return nil
}
```

**Move vs Snapshot**：
- `Move`：同节点上 reschedule 时直接 `rename`，零拷贝
- `Snapshot`：跨节点迁移时通过 tar 网络传输

---

## 10. 文件操作 API

### 10.1 List

```go
func (a *AllocDir) List(path string) ([]*cstructs.AllocFileInfo, error) {
    // 1. 路径逃逸检查
    escapingfs.PathEscapesAllocDir(a.AllocDir, "", path)
    // 2. 读取目录
    finfos, _ := os.ReadDir(filepath.Join(a.AllocDir, path))
    // 3. 构造返回（Name, IsDir, Size, FileMode, ModTime）
}
```

### 10.2 Stat

```go
func (a *AllocDir) Stat(path string) (*cstructs.AllocFileInfo, error) {
    // 1. 路径逃逸检查
    // 2. os.Stat
    // 3. detectContentType：读前 512 字节用 http.DetectContentType
    //    .json 后缀特殊处理为 application/json
}
```

### 10.3 ReadAt

```go
func (a *AllocDir) ReadAt(path string, offset int64) (io.ReadCloser, error) {
    // 1. 路径逃逸检查
    // 2. secrets/private 目录读取拦截（caseInsensitiveHasPrefix）
    // 3. os.Open + f.Seek(offset, 0)
}
```

### 10.4 BlockUntilExists

```go
func (a *AllocDir) BlockUntilExists(ctx context.Context, path string) (chan error, error) {
    // 1. 路径逃逸检查
    // 2. 获取 polling file watcher
    // 3. 启动 goroutine 调用 watcher.BlockUntilExists(tomb)
    // 4. ctx.Done() 时 kill tomb 退出
}
```

### 10.5 ChangeEvents

```go
func (a *AllocDir) ChangeEvents(ctx context.Context, path string, curOffset int64) (*watch.FileChanges, error) {
    // 返回 watch.FileChanges：
    //   - Modified  chan struct{}
    //   - Deleted   chan struct{}
    //   - Truncated chan struct{}
    // 由 hpcloud/tail 库的 polling watcher 实现
}
```

### 10.6 FS Endpoint（RPC）

定义在 [fs_endpoint.go](file:///d:/claude/nomad/client/fs_endpoint.go)：

| RPC 方法 | 类型 | 用途 |
|---------|------|------|
| `FileSystem.List` | 普通 RPC | 列目录 |
| `FileSystem.Stat` | 普通 RPC | 文件元信息 |
| `FileSystem.Stream` | 流式 RPC | 读取/流式跟随文件 |
| `FileSystem.Logs` | 流式 RPC | 流式跟随任务日志 |

所有 RPC 在入口处校验 ACL（`NamespaceCapabilityReadFS` 或 `NamespaceCapabilityReadLogs`）。

### 10.7 streamFile 实现

定义在 [fs_endpoint.go](file:///d:/claude/nomad/client/fs_endpoint.go#L663-L790)：

```go
func (f *FileSystem) streamFile(ctx, offset, path, limit, fs, framer, eofCancelCh, cancelAfterFirstEof) error {
    file, _ := fs.ReadAt(path, offset)
    defer file.Close()

    var fileReader io.Reader = file
    if limit > 0 {
        fileReader = io.LimitReader(file, limit)
    }

    var changes *watch.FileChanges
    bufSize := int64(streamFrameSize)  // 64KB
    data := make([]byte, bufSize)

    for {
        n, readErr := fileReader.Read(data)
        offset += int64(n)
        if readErr != nil && readErr != io.EOF { return readErr }

        // 发送帧（path, lastEvent, data, offset）
        framer.Send(path, lastEvent, data[:n], offset)

        if readErr == nil { continue }       // 继续读
        if cancelReceived { return nil }      // 不 follow，EOF 即结束

        // 注册文件变更监听
        if changes == nil {
            changes, _ = fs.ChangeEvents(waitCtx, path, offset)
        }

        for {
            select {
            case <-changes.Modified:  continue OUTER      // 文件被修改，继续读
            case <-changes.Deleted:   return framer.Send(path, deleteEvent, ...)
            case <-changes.Truncated:                     // 文件被截断
                file.Close()
                offset = 0
                file, _ = fs.ReadAt(path, 0)              // 从头读
                continue OUTER
            }
        }
    }
}
```

**关键常量**：
```go
streamFramesBuffer  = 32              // 帧缓冲队列
streamFrameSize     = 64 * 1024       // 单帧最大 64KB
streamHeartbeatRate = 1 * time.Second // 心跳（检测连接关闭）
streamBatchWindow   = 200 * time.Millisecond  // 攒批窗口
```

---

## 11. 安全机制

### 11.1 路径逃逸防护

定义在 [escapingfs/escapes.go](file:///d:/claude/nomad/helper/escapingfs/escapes.go)：

```go
// PathEscapesAllocDir 双重检查：相对路径 + 符号链接
func PathEscapesAllocDir(base, prefix, path string) (bool, error) {
    full := filepath.Join(base, prefix, path)

    // 1. 检查相对路径（../../../etc/passwd）
    if escapes, _ := PathEscapesAllocViaRelative(prefix, path); escapes {
        return true, nil
    }

    // 2. 检查符号链接（symlink 指向 alloc dir 之外）
    resolveSym, _ := filepath.EvalSymlinks(full)
    return !hasPrefixCaseInsensitive(resolveSym, base), nil
}
```

所有 FS 操作（List/Stat/ReadAt/Stream/Snapshot 前置）均调用此函数。**注意**：非存在文件返回 false（不报错），但每次 ReadAt 都会重新校验。

### 11.2 Secrets/Private 读取拦截

见 [§8.4](#84-读取保护)。

### 11.3 ACL 校验

FS Endpoint 在每个 RPC 入口校验：

```go
aclObj, _ := f.c.ResolveToken(req.QueryOptions.AuthToken)
if !aclObj.AllowNsOp(alloc.Namespace, acl.NamespaceCapabilityReadFS) {
    return structs.ErrPermissionDenied
}
```

`Logs` RPC 接受 `ReadFS` 或 `ReadLogs` 任一能力。

### 11.4 Migrate Token（Snapshot 专用）

```go
// command/agent/alloc_endpoint.go
if !s.agent.Client().ValidateMigrateToken(allocID, secret) {
    return structs.ErrPermissionDenied
}
```

`migrate_token` 由 `HMAC(alloc_id, node.secret_id)` 计算，防止跨节点伪造 snapshot 请求。

### 11.5 文件权限

| 目录 | 权限 | Owner | 说明 |
|------|------|-------|------|
| `<alloc_dir>` | 0755 | nomad | 顶层目录，仅 nomad 可写 |
| `<alloc_dir>/alloc` | 0755 | nomad | 共享根 |
| `<alloc_dir>/alloc/{logs,tmp,data}` | 0777 | nomad | 所有 task 可读写 |
| `<task_dir>` | 0777 | nomad | 任务根 |
| `<task_dir>/local` | 0777 | nomad | 任务本地 |
| `<task_dir>/tmp` | 1777 (sticky) | nomad | 防 tmp 文件被他人删除 |
| `<task_dir>/secrets` | 0777 (tmpfs) | nomad | 实际由 tmpfs 挂载，MS_NOEXEC |
| `<task_dir>/private` | 0777 (tmpfs) | nomad | 同上，1MB |
| `<mounts_dir>/<allocid-task>` (parent) | 0710 | task user | Unveil 模式 |
| `<mounts_dir>/<allocid-task>/alloc` | 0777 | nobody:nogroup | Unveil 共享 |
| `<mounts_dir>/<allocid-task>/secrets` | 0710 | task user | Unveil 秘密 |

---

## 12. 与 AllocRunner/TaskRunner 集成

### 12.1 AllocDirHook

定义在 [allocdir_hook.go](file:///d:/claude/nomad/client/allocrunner/allocdir_hook.go)：

```go
type allocDirHook struct {
    allocDir allocdir.Interface
}

// 实现 RunnerPrerunHook（在 task 启动前调用）
func (h *allocDirHook) Prerun(_ *taskenv.TaskEnv) error {
    return h.allocDir.Build()  // 创建 alloc dir + shared dirs
}

// 实现 RunnerDestroyHook（在 alloc 销毁时调用）
func (h *allocDirHook) Destroy() error {
    return h.allocDir.Destroy()  // UnmountAll + RemoveAll
}
```

### 12.2 TaskDirHook

定义在 [task_dir_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_dir_hook.go)：

```go
type taskDirHook struct {
    runner *TaskRunner
}

// 实现 TaskPrestartHook
func (h *taskDirHook) Prestart(ctx, req, resp) error {
    fsi := h.runner.driverCapabilities.FSIsolation

    // 幂等：若上一次 Prestart 已完成（task 重启场景），跳过 Build
    if v, ok := req.PreviousState[TaskDirHookIsDoneDataKey]; ok && v == "true" {
        setEnvvars(...)
        resp.State = map[string]string{TaskDirHookIsDoneDataKey: "true"}
        return nil
    }

    // 获取 chroot 配置
    chroot := cconfig.DefaultChrootEnv
    if len(cc.ChrootEnv) > 0 { chroot = cc.ChrootEnv }

    // 发送 TaskBuildingTaskDir 事件
    h.runner.EmitEvent(structs.NewTaskEvent(structs.TaskSetup).
        SetMessage(structs.TaskBuildingTaskDir))

    // 构建任务目录
    err := h.runner.taskDir.Build(fsi, chroot, req.Task.User)

    // 设置环境变量
    setEnvvars(h.runner.envBuilder, fsi, h.runner.taskDir, h.runner.clientConfig)
    resp.State = map[string]string{TaskDirHookIsDoneDataKey: "true"}
    return nil
}
```

### 12.3 AllocRunner 装配

定义在 [alloc_runner.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go#L289-L334)：

```go
ar.allocDir = allocdir.NewAllocDir(
    logger,
    config.ClientConfig.AllocDir,         // client.alloc_dir
    config.ClientConfig.AllocMountsDir,   // client.alloc_mounts_dir
    alloc.ID,
)
// ... 注册 allocdir_hook 到 lifecycle ...

for _, task := range alloc.Job.TaskGroups[0].Tasks {
    taskRunnerConfig := &taskrunner.Config{
        // ...
        TaskDir: ar.allocDir.NewTaskDir(task),  // 每个 task 一个 TaskDir
    }
}
```

### 12.4 销毁流程

```
AllocRunner.Destroy()
    └─ Destroy hooks (逆序)
        └─ allocdir_hook.Destroy()
            └─ AllocDir.Destroy()
                ├─ UnmountAll()           // 卸载每个 TaskDir 的挂载
                │   └─ taskDir.Unmount()
                │       ├─ unlinkDir(sharedTaskDir/logs)
                │       ├─ unlinkDir(sharedTaskDir) + RemoveAll
                │       ├─ unlinkDir(mountsAllocDir)      (Unveil)
                │       ├─ unlinkDir(mountsSecretsDir)    (Unveil)
                │       ├─ unlinkDir(mountsTaskDir)       (Unveil)
                │       ├─ RemoveAll(mountsParent)        (Unveil)
                │       ├─ removeSecretDir(secretsDir)    // unmount tmpfs + RemoveAll
                │       ├─ removeSecretDir(privateDir)
                │       └─ unmountSpecialDirs()           // /dev, /proc (Linux)
                └─ os.RemoveAll(allocDir)
```

---

## 13. 与 Driver 集成

### 13.1 Driver 能力声明

定义在 [plugins/drivers/driver.go](file:///d:/claude/nomad/plugins/drivers/driver.go#L168-L195)：

```go
type Capabilities struct {
    FSIsolation fsisolation.Mode  // 声明 driver 支持的 FS 隔离模式
    // ...
}
```

各 driver 通过 `Fingerprint()` 返回的 `Attributes` 声明能力，TaskRunner 在启动时调用 `driver.Capabilities()` 获取。

### 13.2 Driver FSIsolation 对照

| Driver | FSIsolation | 说明 |
|--------|-------------|------|
| docker | Image | 使用容器镜像，driver 自行处理挂载 |
| exec | Chroot | 宿主 chroot + 共享 bind mount |
| raw_exec | None | 无隔离，直接使用宿主路径 |
| java | Chroot | 同 exec |
| qemu | Chroot | 同 exec |
| mock | None | 测试用 |

### 13.3 TaskConfig 注入

driver 接收的 `TaskConfig` 包含以下路径字段（[driver.proto](file:///d:/claude/nomad/plugins/drivers/proto/driver.proto#L480)）：

```protobuf
message TaskConfig {
    // ...
    string AllocDir      = 11;  // 宿主 <alloc_dir>/alloc
    string MountsDir     = 12;  // 宿主 <mounts_dir>/<allocid-task> (Unveil)
    string TaskLocalDir  = 14;  // 容器内 local 路径
    string SecretsDir    = 15;  // 容器内 secrets 路径
    // ...
}
```

driver 根据自身隔离模式决定如何将这些路径映射进容器（docker 用 `-v`，exec 用 chroot 等）。

### 13.4 UniversalExecutor 与 chroot

exec/raw_exec/java/qemu 共享 [UniversalExecutor](file:///d:/claude/nomad/drivers/shared/executor/)，其通过 `taskDir.Dir` 作为 chroot 根启动任务进程。

---

## 14. 环境变量映射

### 14.1 setEnvvars 实现

定义在 [task_dir_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_dir_hook.go#L80-L116)：

```go
func setEnvvars(envBuilder, fsi, taskDir, conf) {
    // 总是设置客户端侧路径（供 driver 在宿主侧操作）
    envBuilder.SetClientTaskRoot(taskDir.Dir)
    envBuilder.SetClientSharedAllocDir(taskDir.SharedAllocDir)
    envBuilder.SetClientTaskLocalDir(taskDir.LocalDir)
    envBuilder.SetClientTaskSecretsDir(taskDir.SecretsDir)

    switch fsi {
    case fsisolation.Unveil:
        // 使用 MountsDir 路径（任务视角）
        envBuilder.SetAllocDir(taskDir.MountsAllocDir)
        envBuilder.SetTaskLocalDir(filepath.Join(taskDir.MountsTaskDir, "local"))
        envBuilder.SetSecretsDir(taskDir.MountsSecretsDir)
    case fsisolation.None:
        // 使用宿主路径
        envBuilder.SetAllocDir(taskDir.SharedAllocDir)
        envBuilder.SetTaskLocalDir(taskDir.LocalDir)
        envBuilder.SetSecretsDir(taskDir.SecretsDir)
    default:
        // Chroot / Image：使用容器内路径（/, /local, /secrets, /alloc）
        envBuilder.SetAllocDir(allocdir.SharedAllocContainerPath)  // /alloc
        envBuilder.SetTaskLocalDir(allocdir.TaskLocalContainerPath)  // /local
        envBuilder.SetSecretsDir(allocdir.TaskSecretsContainerPath)  // /secrets
    }

    // 非 Image 模式注入宿主环境变量（带 denylist 过滤）
    if fsi != fsisolation.Image {
        filter := strings.Split(conf.ReadAlternativeDefault(
            []string{"env.denylist", "env.blacklist"},
            cconfig.DefaultEnvDenylist,
        ), ",")
        envBuilder.SetHostEnvvars(filter)
    }
}
```

### 14.2 任务可见的环境变量

| 隔离模式 | NOMAD_ALLOC_DIR | NOMAD_TASK_DIR | NOMAD_SECRETS_DIR |
|---------|-----------------|----------------|-------------------|
| None | `<alloc_dir>/alloc` | `<task_dir>/local` | `<task_dir>/secrets` |
| Chroot | `/alloc` | `/local` | `/secrets` |
| Image | (driver 决定) | (driver 决定) | (driver 决定) |
| Unveil | `<mounts>/<id-task>/alloc` | `<mounts>/<id-task>/local` | `<mounts>/<id-task>/secrets` |

### 14.3 容器内路径常量

```go
// Linux/Unix (fs_unix.go)
SharedAllocContainerPath = "/alloc"
TaskLocalContainerPath   = "/local"
TaskSecretsContainerPath = "/secrets"

// Windows (fs_windows.go)
SharedAllocContainerPath = "c:\\alloc"
TaskLocalContainerPath   = "c:\\local"
TaskSecretsContainerPath = "c:\\secrets"
```

---

## 15. 配置项

### 15.1 客户端配置（agent.hcl）

```hcl
client {
  enabled       = true
  state_dir     = "/opt/nomad/data/client"   # 状态DB
  alloc_dir     = "/opt/nomad/data/alloc"    # 默认 <data_dir>/alloc
  alloc_mounts_dir = "/opt/nomad/alloc_mounts"  # 默认 <data_dir_parent>/alloc_mounts

  # chroot 环境（仅 exec/java/qemu/raw_exec）
  chroot_env {
    "/bin"     = "/bin"
    "/etc"     = "/etc"
    "/lib"     = "/lib"
    "/lib64"   = "/lib64"
    "/run/resolvconf" = "/run/resolvconf"
    "/sbin"    = "/sbin"
    "/usr"     = "/usr"
    "/run/systemd/resolve" = "/run/systemd/resolve"
  }
}
```

### 15.2 路径推导逻辑

定义在 [agent.go](file:///d:/claude/nomad/command/agent/agent.go#L905-L922)：

```go
if agentConfig.DataDir != "" {
    conf.StateDir       = filepath.Join(agentConfig.DataDir, "client")
    conf.AllocDir       = filepath.Join(agentConfig.DataDir, "alloc")
    conf.HostVolumesDir = filepath.Join(agentConfig.DataDir, "host_volumes")
    // ...
    dataParent := filepath.Dir(agentConfig.DataDir)
    conf.AllocMountsDir = filepath.Join(dataParent, "alloc_mounts")  // 注意是 data_dir 的父目录！
}
// 显式配置覆盖
if agentConfig.Client.AllocDir != "" { conf.AllocDir = agentConfig.Client.AllocDir }
if agentConfig.Client.AllocMountsDir != "" { conf.AllocMountsDir = agentConfig.Client.AllocMountsDir }
```

**设计原因**：`AllocMountsDir` 与 `AllocDir` 必须在不同文件系统上，否则 Unveil 模式的 bind mount 会形成递归挂载。默认放在 `data_dir` 的父目录规避此问题。

### 15.3 Task 资源配置

```hcl
job "example" {
  group "web" {
    task "server" {
      driver = "exec"
      resources {
        secrets_mb = 4  # secrets tmpfs 大小，默认 1MB
      }
    }
  }
}
```

### 15.4 关键默认值

| 配置 | 默认值 | 来源 |
|------|--------|------|
| `client.alloc_dir` | `<data_dir>/alloc` | agent.go |
| `client.alloc_mounts_dir` | `<data_dir_parent>/alloc_mounts` | agent.go |
| `client.chroot_env` | 见 [§7.3](#73-默认-chroot-配置) | config.go |
| `task.resources.secrets_mb` | 1 | task_dir.go |
| private 目录大小 | 1MB (固定) | task_dir.go |
| `env.denylist` | host.DefaultEnvDenyList | config.go |

---

## 16. 典型调用链

### 16.1 任务启动（Chroot 模式）

```
nomad agent → Client → AllocRunner.Run()
  │
  ├─ allocdir_hook.Prerun()
  │   └─ AllocDir.Build()
  │       └─ os.MkdirAll(alloc_dir, 0755)
  │       └─ allocMkdirAll(alloc_dir/alloc, 0755)
  │       └─ allocMkdirAll(alloc_dir/alloc/{logs,tmp,data}, 0777)
  │
  └─ TaskRunner.Run() (per task)
      └─ task_dir_hook.Prestart()
          ├─ TaskDir.Build(Chroot, chrootEnv, user)
          │   ├─ allocMkdirAll(task_dir, 0777)
          │   ├─ allocMkdirAll(local, 0777)
          │   ├─ allocMkdirAll(tmp, 1777)
          │   ├─ linkDir(shared_alloc, task/alloc, ro=false)  // bind mount
          │   ├─ linkDir(logs, task/alloc/logs, ro=true)      // bind mount ro
          │   ├─ createSecretDir(secrets, secretsMB)          // tmpfs
          │   ├─ createSecretDir(private, 1)                  // tmpfs
          │   └─ buildChroot(chrootEnv)
          │       └─ embedDirs(/bin→/bin, /lib→/lib, ...)
          │           ├─ linkOrCopy(/bin/sh → task/bin/sh)
          │           └─ ... (递归)
          └─ setEnvvars(envBuilder, Chroot, taskDir, conf)
              └─ envBuilder.SetAllocDir("/alloc")
              └─ envBuilder.SetTaskLocalDir("/local")
              └─ envBuilder.SetSecretsDir("/secrets")
              └─ envBuilder.SetHostEnvvars(denylist)
      └─ driver.StartTask()
          └─ exec executor → chroot(task_dir) → exec(binary)
```

### 16.2 文件流式读取（如 nomad alloc logs -f）

```
nomad CLI → Server RPC forward → Client.FileSystem.Logs (streaming RPC)
  │
  ├─ ResolveToken + ACL check (ReadFS or ReadLogs)
  ├─ GetAllocFS(allocID) → AllocDir
  ├─ 计算 logPath: alloc/logs/<task>.<type>.<index>
  └─ logsImpl()
      └─ streamFile(ctx, offset, logPath, ...)
          ├─ fs.ReadAt(logPath, offset)
          │   └─ 路径逃逸检查 → secrets/private 拦截 → os.Open + Seek
          ├─ framer.Send(path, event, data, offset)
          │   └─ 通过 streamFrameSize (64KB) 攒批 + streamBatchWindow (200ms)
          ├─ EOF → fs.ChangeEvents(ctx, path, offset)
          │   └─ watch.NewPollingFileWatcher(path).ChangeEvents(tomb, offset)
          └─ select:
              ├─ Modified  → 继续读
              ├─ Deleted   → 发送 deleteEvent, 结束
              └─ Truncated → 重新从 offset=0 读
```

### 16.3 跨节点迁移（Snapshot）

```
新节点 AllocRunner (reschedule)
  │
  ├─ 检测 PrevAlloc（旧节点）
  ├─ PrevAllocMigrator.Migrate(ctx, dest)
  │   └─ RPC: ClientAllocations.Snapshot(allocID, migrate_token)
  │       └─ 旧节点 allocEndpoint.allocSnapshot()
  │           ├─ ValidateMigrateToken
  │           ├─ GetAllocFS(allocID)
  │           └─ allocFS.Snapshot(resp)  // tar 流写入 HTTP body
  │               └─ filepath.Walk(alloc/data, walkFn)
  │               └─ filepath.Walk(task/local, walkFn) (per task)
  │                   └─ tar.WriteHeader + io.Copy
  ├─ 接收 tar → 解压到新 AllocDir
  └─ TaskRunner 启动（同 16.1）
```

### 16.4 同节点 Reschedule（Move）

```
新 AllocRunner (同节点 reschedule)
  │
  ├─ 检测 PrevAlloc 是本节点
  ├─ AllocDir.Build()  // 新 alloc_dir
  └─ AllocDir.Move(oldAllocDir, tasks)
      ├─ os.Rename(old/alloc/data → new/alloc/data)
      └─ for each task:
          os.Rename(old/<task>/local → new/<task>/local)
```

---

## 17. 代码文件索引

### 17.1 核心包 `client/allocdir/`

| 文件 | 说明 |
|------|------|
| [alloc_dir.go](file:///d:/claude/nomad/client/allocdir/alloc_dir.go) | AllocDir 结构、Build/Destroy/Move/Snapshot/List/Stat/ReadAt/BlockUntilExists/ChangeEvents |
| [task_dir.go](file:///d:/claude/nomad/client/allocdir/task_dir.go) | TaskDir 结构、Build/buildChroot/embedDirs/Unmount |
| [task_dir_linux.go](file:///d:/claude/nomad/client/allocdir/task_dir_linux.go) | Linux: unmountSpecialDirs (/dev, /proc) |
| [task_dir_nonlinux.go](file:///d:/claude/nomad/client/allocdir/task_dir_nonlinux.go) | 非 Linux: noop |
| [fs_linux.go](file:///d:/claude/nomad/client/allocdir/fs_linux.go) | Linux: linkDir/mountDir/unlinkDir/createSecretDir (tmpfs)/removeSecretDir |
| [fs_default.go](file:///d:/claude/nomad/client/allocdir/fs_default.go) | 非 Linux: mountDir panic |
| [fs_unix.go](file:///d:/claude/nomad/client/allocdir/fs_unix.go) | Unix 通用: dropDirPermissions/linkOrCopy/getOwner + 容器路径常量 |
| [fs_windows.go](file:///d:/claude/nomad/client/allocdir/fs_windows.go) | Windows: 全部降级为 noop/copy，无 tmpfs |
| [fs_darwin.go](file:///d:/claude/nomad/client/allocdir/fs_darwin.go) | Darwin: 硬链接，无 tmpfs |
| [fs_freebsd.go](file:///d:/claude/nomad/client/allocdir/fs_freebsd.go) | FreeBSD: 同 Darwin |
| [fs_netbsd.go](file:///d:/claude/nomad/client/allocdir/fs_netbsd.go) | NetBSD: 同 Darwin |
| [fs_solaris.go](file:///d:/claude/nomad/client/allocdir/fs_solaris.go) | Solaris: 同 Darwin |
| [testing.go](file:///d:/claude/nomad/client/allocdir/testing.go) | TestAllocDir 测试辅助 |

### 17.2 隔离模式

| 文件 | 说明 |
|------|------|
| [plugins/drivers/fsisolation/isolation.go](file:///d:/claude/nomad/plugins/drivers/fsisolation/isolation.go) | Mode 类型与四种常量 |
| [plugins/drivers/driver.go](file:///d:/claude/nomad/plugins/drivers/driver.go) | Capabilities.FSIsolation 声明 |
| [plugins/drivers/server.go](file:///d:/claude/nomad/plugins/drivers/server.go) | FSIsolation → proto 转换 |
| [plugins/drivers/client.go](file:///d:/claude/nomad/plugins/drivers/client.go) | proto → FSIsolation 转换 |
| [plugins/drivers/proto/driver.proto](file:///d:/claude/nomad/plugins/drivers/proto/driver.proto) | DriverCapabilities.FSIsolation 枚举 |

### 17.3 AllocRunner 集成

| 文件 | 说明 |
|------|------|
| [client/allocrunner/alloc_runner.go](file:///d:/claude/nomad/client/allocrunner/alloc_runner.go) | AllocDir 创建与 TaskDir 装配 |
| [client/allocrunner/allocdir_hook.go](file:///d:/claude/nomad/client/allocrunner/allocdir_hook.go) | Prerun → Build, Destroy → Destroy |
| [client/allocrunner/taskrunner/task_dir_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_dir_hook.go) | Prestart → TaskDir.Build + setEnvvars |
| [client/allocrunner/consul_grpc_sock_hook.go](file:///d:/claude/nomad/client/allocrunner/consul_grpc_sock_hook.go) | Consul socket 注入到 alloc/tmp/ |

### 17.4 FS Endpoint

| 文件 | 说明 |
|------|------|
| [client/fs_endpoint.go](file:///d:/claude/nomad/client/fs_endpoint.go) | FileSystem RPC: List/Stat/Stream/Logs |
| [client/client.go](file:///d:/claude/nomad/client/client.go) | GetAllocFS() 返回 AllocDirFS |
| [command/agent/alloc_endpoint.go](file:///d:/claude/nomad/command/agent/alloc_endpoint.go) | HTTP allocSnapshot 端点 |

### 17.5 安全

| 文件 | 说明 |
|------|------|
| [helper/escapingfs/escapes.go](file:///d:/claude/nomad/helper/escapingfs/escapes.go) | PathEscapesAllocDir（相对路径+符号链接双重检查） |
| [helper/escapingfs/copydir.go](file:///d:/claude/nomad/helper/escapingfs/copydir.go) | 安全的目录复制 |

### 17.6 配置

| 文件 | 说明 |
|------|------|
| [client/config/config.go](file:///d:/claude/nomad/client/config/config.go) | Config.AllocDir/AllocMountsDir/ChrootEnv, DefaultChrootEnv |
| [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | ClientConfig HCL 字段 |
| [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | 路径推导逻辑 |

### 17.7 Driver 集成

| 文件 | 说明 |
|------|------|
| [plugins/drivers/testutils/testing.go](file:///d:/claude/nomad/plugins/drivers/testutils/testing.go) | SetEnvvars 测试辅助（与 task_dir_hook 同逻辑） |
| [drivers/shared/executor/](file:///d:/claude/nomad/drivers/shared/executor/) | UniversalExecutor (exec/raw_exec/java/qemu 共享) |

---

## 18. 设计要点与最佳实践

### 18.1 设计要点

1. **共享与隔离并存**
   - 同 Task Group 内任务通过 `alloc/{data,logs,tmp}` 共享数据
   - 任务间通过独立 `task/{local,secrets,private}` 隔离
   - Chroot 模式通过 bind mount 让共享目录在容器内可见

2. **Secrets 优先安全**
   - Linux 上 tmpfs + `MS_NOEXEC` + `noswap`，永落磁盘
   - FS API 拒绝读取 secrets/private（大小写不敏感前缀匹配）
   - Unveil 模式下 secrets 以 0710 挂载到 MountsDir，仅任务用户可读

3. **跨平台降级**
   - Linux 充分利用 tmpfs / bind mount / chroot 提供强隔离
   - Windows/Darwin/BSD 不支持 tmpfs，secrets 退化为普通目录
   - Windows 不支持硬链接目录，`linkDir` 退化为 noop，`linkOrCopy` 退化为复制
   - 平台差异通过 `fs_<os>.go` 文件隔离，上层逻辑保持一致

4. **Snapshot 选择性迁移**
   - 仅迁移 `alloc/data/` 与 `task/local/`，避免迁移日志和 secrets
   - tar 流式传输，支持跨节点 reschedule 时保留任务状态
   - 同节点 reschedule 使用 `os.Rename`（Move），零拷贝

5. **Chroot 嵌入策略**
   - 硬链接优先（`os.Link`），失败回退到复制（`fileCopy`）
   - 跳过 `clientAllocDir` 和 `clientAllocMountsDir` 防止递归嵌套
   - `/proc`、`/dev` 通过 `MountSpecialDirs` 挂载（仅 Linux）

6. **环境变量双轨制**
   - Client 路径（`NOMAD_ALLOC_DIR` 等）：driver 在宿主侧操作时使用
   - 容器内路径（`/alloc`、`/local`、`/secrets`）：任务进程内部可见
   - 通过 `envBuilder.SetClient*` 与 `envBuilder.Set*` 双重设置

### 18.2 最佳实践

1. **生产环境配置**
   - 将 `alloc_dir` 放在独立的高速磁盘（SSD/NVMe），与 `state_dir` 分离
   - `alloc_mounts_dir` 必须与 `alloc_dir` 在不同文件系统（Unveil 模式必需）
   - 为 `secrets_mb` 配置合理大小，避免 tmpfs 占满导致任务失败

2. **Chroot 环境定制**
   - 仅包含任务运行所需的最小二进制和库，遵循最小权限原则
   - 使用 `chroot_env` 显式声明需要嵌入的宿主路径
   - 注意 `/lib` 和 `/lib64` 的架构差异（x86_64 vs aarch64）

3. **安全加固**
   - 启用 ACL，确保只有授权用户能访问 `Snapshot` 和 `FS` API
   - 定期审计 `secrets/` 目录的使用，避免敏感数据泄露
   - 在 Linux 上以 root 运行 Nomad 以获得 tmpfs 隔离能力

4. **故障排查**
   - 任务启动失败时，检查 `task_dir_hook` 日志中的 `Build` 错误
   - 文件操作失败时，检查 `PathEscapesAllocDir` 是否拦截了路径
   - Snapshot 失败时，检查 `data/` 和 `local/` 目录权限和磁盘空间

5. **性能优化**
   - 大量小文件场景下，Snapshot 可能较慢，考虑任务设计减少文件数量
   - 使用 `nomad alloc logs -f` 时，注意 `streamBatchWindow`（200ms）和 `streamFrameSize`（64KB）的批处理行为
   - Chroot 模式下硬链接比复制快得多，确保源和目标在同一文件系统

### 18.3 与其他子系统的关系

| 子系统 | 关系 |
|--------|------|
| **AllocRunner** | 通过 `allocdir_hook` 触发 `AllocDir.Build/Destroy` |
| **TaskRunner** | 通过 `task_dir_hook` 触发 `TaskDir.Build` 并设置环境变量 |
| **Driver Plugin** | 通过 `Capabilities.FSIsolation` 声明隔离模式，接收 `TaskConfig` 路径 |
| **FS Endpoint** | 通过 `AllocDirFS` 接口提供 List/Stat/ReadAt/Snapshot/ChangeEvents |
| **Scheduler** | reschedule 时触发 Snapshot（跨节点）或 Move（同节点）|
| **ACL** | FS API 调用前校验 `ReadFS` / `ReadLogs` 能力 |
| **Consul Connect** | 通过 `consul_grpc_sock_hook` 注入 unix socket 到 `alloc/tmp/` |

### 18.4 演进趋势

1. **Unveil 模式**：基于 OpenBSD unveil/landlock 的实验性隔离，未来可能扩展到更多平台
2. **MountsDir 分离**：`alloc_mounts_dir` 独立于 `alloc_dir`，为更细粒度的挂载隔离铺路
3. **IPv6 支持**：`alloc_ipv6` 地址模式影响服务注册，但不直接影响文件系统
4. **CSI 集成**：CSI 插件通过 unix socket 与 Nomad 通信，socket 路径可配置

---

## 19. 附录：关键常量与默认值速查

### 19.1 目录名常量

```go
SharedAllocName  = "alloc"     // 共享目录名
LogDirName       = "logs"      // 日志目录名
SharedDataDir    = "data"      // 共享数据目录（参与 snapshot）
TmpDirName       = "tmp"       // tmp 目录
TaskLocal        = "local"     // 任务本地目录
TaskSecrets      = "secrets"   // 任务秘密目录
TaskPrivate      = "private"   // 任务私有目录
secretMarker     = ".nomad-mount"  // tmpfs 挂载标记
```

### 19.2 容器内路径常量

```go
// Unix (fs_unix.go)
SharedAllocContainerPath  = "/alloc"
TaskLocalContainerPath    = "/local"
TaskSecretsContainerPath  = "/secrets"

// Windows (fs_windows.go)
SharedAllocContainerPath  = "c:\\alloc"
TaskLocalContainerPath    = "c:\\local"
TaskSecretsContainerPath  = "c:\\secrets"
```

### 19.3 文件权限常量

```go
fileMode777 = 0o777  // rwxrwxrwx (LocalDir, SecretsDir, tmp, shared subdirs)
fileMode710 = 0o710  // rwx--x--- (MountsTaskDir, MountsSecretsDir, parent)
fileMode755 = 0o755  // rwxr-xr-x (AllocDir root, SharedDir)
fileMode666 = 0o666  // rw-rw-rw- (secretMarker file)
```

### 19.4 默认 Chroot 环境

```go
DefaultChrootEnv = {
    "/bin":            "/bin",
    "/etc":            "/etc",
    "/lib":            "/lib",
    "/lib32":          "/lib32",
    "/lib64":          "/lib64",
    "/run/resolvconf": "/run/resolvconf",
    "/sbin":           "/sbin",
    "/usr":            "/usr",
}
```

### 19.5 Consul Socket 路径

```go
AllocGRPCSocket = "alloc/tmp/consul_grpc.sock"   // Consul gRPC unix socket
AllocHTTPSocket = "alloc/tmp/consul_http.sock"   // Consul HTTP unix socket
```

### 19.6 tmpfs 挂载选项

```go
// Linux secrets/private 目录
flags   = MS_NOEXEC                              // 禁止执行
options = "size=<N>m,noswap"                     // 大小限制 + 禁用 swap
// 旧内核回退
options = "size=<N>m"                            // 仅大小限制

// Unveil 模式 bind mount
flags = MS_BIND | MS_NOSUID | MS_NOATIME         // 绑定 + 禁 suid + 禁 atime
```

### 19.7 FS API 流式参数

```go
streamFrameSize  = 64 * 1024    // 64KB，单帧最大数据
streamBatchWindow = 200 * time.Millisecond  // 200ms，批处理窗口
```

---

## 20. 总结

Nomad 的 Allocation Filesystem 子系统是一个精心设计的多层隔离文件系统，核心特点包括：

1. **分层隔离**：通过 SharedDir（Task Group 共享）与 TaskDir（任务隔离）实现两级隔离
2. **多模式支持**：None / Chroot / Image / Unveil 四种隔离模式，适配不同 driver 需求
3. **安全优先**：secrets/private 目录使用 tmpfs（Linux），路径逃逸检查，ACL 校验
4. **跨平台兼容**：通过 `fs_<os>.go` 文件隔离平台差异，Linux 提供最强隔离，其他平台降级
5. **生命周期完整**：从 Build → Destroy → Snapshot → Move，覆盖任务全生命周期
6. **集成紧密**：与 AllocRunner、TaskRunner、Driver、FS Endpoint、Scheduler 深度集成

该子系统是 Nomad 客户端运行任务的基础设施，理解其实现对于排查任务启动失败、文件操作异常、跨节点迁移问题至关重要。

---

> 文档结束 | 基于源码分析生成 | 最后更新：2026-07-14