# Nomad Task Driver 开发指南

> 本文档基于 Nomad 当前源码（截至 2026-07-21）整理，给出从零开发一个新 Task Driver 的完整流程建议，包含接口契约、骨架代码、注册流程、测试方法等。所有引用均带可点击源码链接。

## 目录

1. [开发模式选择：内置 vs 外部](#1-开发模式选择内置-vs-外部)
2. [核心接口契约](#2-核心接口契约)
3. [开发流程总览](#3-开发流程总览)
4. [第 1 步：定义插件元信息与 Schema](#第-1-步定义插件元信息与-schema)
5. [第 2 步：实现 DriverPlugin 接口](#第-2-步实现-driverplugin-接口)
6. [第 3 步：实现任务句柄与状态持久化](#第-3-步实现任务句柄与状态持久化)
7. [第 4 步：事件广播与统计](#第-4-步事件广播与统计)
8. [第 5 步：声明 Capabilities](#第-5-步声明-capabilities)
9. [第 6 步：注册为内置驱动](#第-6-步注册为内置驱动)
10. [第 7 步：作为外部驱动打包](#第-7-步作为外部驱动打包)
11. [第 8 步：测试](#第-8-步测试)
12. [第 9 步：jobspec 与配置示例](#第-9-步jobspec-与配置示例)
13. [可选能力扩展](#可选能力扩展)
14. [常见陷阱与最佳实践](#常见陷阱与最佳实践)
15. [参考实现清单](#参考实现清单)

---

## 1. 开发模式选择：内置 vs 外部

| 维度 | 内置驱动 | 外部驱动 |
|------|---------|---------|
| 编译方式 | 与 Nomad 主二进制一起编译 | 独立 `main.go`，单独编译为可执行文件 |
| 进程模型 | In-process 直接调用 | 子进程，通过 gRPC 通信 |
| 注册方式 | `catalog.Register(id, config)` | 部署到 `plugin_dir`，由 Nomad 扫描 |
| 入口函数 | `Factory: func(ctx, logger) interface{}` | `drivers.Serve(d, logger)` |
| 启动开销 | 零 | 每实例一个子进程 |
| 适用场景 | 通用驱动（docker/exec/rawexec/java/qemu） | 私有/特殊运行时、第三方扩展 |
| 版本耦合 | 与 Nomad 主版本强耦合 | 可独立发布，跨 Nomad 版本兼容 |

**建议**：除非有特殊隔离/分发需求，优先选择内置驱动模式，开发与调试更简单。本文档后续以内置驱动为主线，外部驱动差异在第 7 步说明。

---

## 2. 核心接口契约

开发 Task Driver 即实现以下接口：

### 2.1 BasePlugin（必须）

[plugins/base/base.go#L17-L27](file:///d:/claude/nomad/plugins/base/base.go#L17-L27)

```go
type BasePlugin interface {
    PluginInfo() (*PluginInfoResponse, error)
    ConfigSchema() (*hclspec.Spec, error)
    SetConfig(c *Config) error
}
```

### 2.2 DriverPlugin（必须）

[plugins/drivers/driver.go#L47-L69](file:///d:/claude/nomad/plugins/drivers/driver.go#L47-L69)

```go
type DriverPlugin interface {
    base.BasePlugin

    TaskConfigSchema() (*hclspec.Spec, error)
    Capabilities() (*Capabilities, error)
    Fingerprint(context.Context) (<-chan *Fingerprint, error)

    RecoverTask(*TaskHandle) error
    StartTask(*TaskConfig) (*TaskHandle, *DriverNetwork, error)
    WaitTask(ctx context.Context, taskID string) (<-chan *ExitResult, error)
    StopTask(taskID string, timeout time.Duration, signal string) error
    DestroyTask(taskID string, force bool) error
    InspectTask(taskID string) (*TaskStatus, error)
    TaskStats(ctx context.Context, taskID string, interval time.Duration) (<-chan *cstructs.TaskResourceUsage, error)
    TaskEvents(context.Context) (<-chan *TaskEvent, error)

    SignalTask(taskID string, signal string) error
    ExecTask(taskID string, cmd []string, timeout time.Duration) (*ExecTaskResult, error)
}
```

### 2.3 可选接口

| 接口 | 文件位置 | 用途 |
|------|---------|------|
| `DriverIniter` | [driver.go#L83-L86](file:///d:/claude/nomad/plugins/drivers/driver.go#L83-L86) | `Init(ctx) error`：在 SetConfig 后、首次使用前调用 |
| `DriverShutdowner` | [driver.go#L72-L79](file:///d:/claude/nomad/plugins/drivers/driver.go#L72-L79) | `Shutdown(ctx) error`：驱动退出前清理 |
| `ExecTaskStreamingDriver` | [driver.go#L90-L108](file:///d:/claude/nomad/plugins/drivers/driver.go#L90-L108) | 高层流式 exec（`nomad alloc exec`） |
| `ExecTaskStreamingRawDriver` | [driver.go#L610-L617](file:///d:/claude/nomad/plugins/drivers/driver.go#L610-L617) | 低层流式 exec（客户端优先调用） |
| `DriverNetworkManager` | [driver.go#L113-L116](file:///d:/claude/nomad/plugins/drivers/driver.go#L113-L116) | `CreateNetwork`/`DestroyNetwork`：自建网络命名空间 |

### 2.4 辅助嵌入类型（不支持某能力时使用）

[plugins/drivers/driver.go#L121-L134](file:///d:/claude/nomad/plugins/drivers/driver.go#L121-L134)

```go
type DriverSignalTaskNotSupported struct{}
func (DriverSignalTaskNotSupported) SignalTask(string, string) error {
    return errors.New("SignalTask is not supported by this driver")
}

type DriverExecTaskNotSupported struct{}
func (DriverExecTaskNotSupported) ExecTask(string, []string, time.Duration) (*ExecTaskResult, error) {
    return nil, errors.New("ExecTask is not supported by this driver")
}
```

---

## 3. 开发流程总览

```
┌─────────────────────────────────────────────────────────┐
│ 1. 定义插件元信息（PluginID/PluginConfig/pluginInfo）   │
│ 2. 定义配置 Schema（plugin config + task config）       │
│ 3. 定义 Capabilities                                    │
│ 4. 实现 Driver 结构体 + BasePlugin 三方法               │
│ 5. 实现 Fingerprint（健康检查 + 属性上报）              │
│ 6. 实现 StartTask/WaitTask/StopTask/DestroyTask         │
│ 7. 实现 RecoverTask（基于 TaskHandle.DriverState 恢复） │
│ 8. 实现 InspectTask/TaskStats/TaskEvents                │
│ 9. 实现 SignalTask/ExecTask（如声明支持）               │
│ 10. 注册（catalog.Register 或 drivers.Serve）          │
│ 11. 编写测试（DriverHarness + 一致性套件）              │
└─────────────────────────────────────────────────────────┘
```

---

## 第 1 步：定义插件元信息与 Schema

参考 [drivers/exec/driver.go#L34-L115](file:///d:/claude/nomad/drivers/exec/driver.go#L34-L115)，在包级 var 中声明：

```go
package mydriver

import (
    "context"
    "github.com/hashicorp/go-hclog"
    "github.com/hashicorp/hcl/v2/hclspec"
    "github.com/hashicorp/nomad/helper/pluginutils/loader"
    "github.com/hashicorp/nomad/plugins/base"
    "github.com/hashicorp/nomad/plugins/drivers"
    "github.com/hashicorp/nomad/plugins/drivers/fsisolation"
)

const (
    pluginName        = "mydriver"
    fingerprintPeriod = 30 * time.Second
    taskHandleVersion = 1  // 自定义版本号，0 被 Nomad 保留给 pre-0.9 兼容
)

var (
    // 1.1 插件 ID（注册键）
    PluginID = loader.PluginID{
        Name:       pluginName,
        PluginType: base.PluginTypeDriver,
    }

    // 1.2 内置插件工厂（外部驱动不需要此变量）
    PluginConfig = &loader.InternalPluginConfig{
        Config: map[string]interface{}{},
        Factory: func(ctx context.Context, l hclog.Logger) interface{} {
            return NewMyDriver(ctx, l)
        },
    }

    // 1.3 PluginInfo 返回值
    pluginInfo = &base.PluginInfoResponse{
        Type:              base.PluginTypeDriver,
        PluginApiVersions: []string{drivers.ApiVersion010},  // "v0.1.0"
        PluginVersion:     "0.1.0",
        Name:              pluginName,
    }

    // 1.4 插件级配置 schema（plugin "mydriver" { config { ... } }）
    configSpec = hclspec.NewObject(map[string]*hclspec.Spec{
        "enabled": hclspec.NewDefault(
            hclspec.NewAttr("enabled", "bool", false),
            hclspec.NewLiteral("true"),
        ),
        "runtime_path": hclspec.NewAttr("runtime_path", "string", false),
    })

    // 1.5 任务级配置 schema（task "x" { driver="mydriver" config { ... } }）
    taskConfigSpec = hclspec.NewObject(map[string]*hclspec.Spec{
        "command": hclspec.NewAttr("command", "string", true),
        "args":    hclspec.NewAttr("args", "list(string)", false),
    })

    // 1.6 能力声明
    driverCapabilities = &drivers.Capabilities{
        SendSignals:       true,
        Exec:              true,
        FSIsolation:       fsisolation.None,  // 或 Chroot/Image/Unveil
        NetIsolationModes: []drivers.NetIsolationMode{
            drivers.NetIsolationModeHost,
            drivers.NetIsolationModeGroup,
        },
        MountConfigs:        drivers.MountConfigSupportAll,
        DisableLogCollection: false,
    }
)
```

**关键点：**
- `PluginID.Name` 必须与 `pluginInfo.Name` 一致，且是 jobspec 中 `driver = "..."` 的值
- `PluginApiVersions` 必须包含 `drivers.ApiVersion010`（当前唯一支持的版本）
- `taskHandleVersion` 由你自定义，`RecoverTask` 中需根据它做版本迁移

---

## 第 2 步：实现 DriverPlugin 接口

### 2.1 Driver 结构体

```go
type Driver struct {
    eventer     *eventer.Eventer
    config      Config
    nomadConfig *base.ClientDriverConfig
    tasks       *taskStore
    ctx         context.Context
    logger      hclog.Logger
    compute     cpustats.Compute
}

func NewMyDriver(ctx context.Context, logger hclog.Logger) drivers.DriverPlugin {
    return &Driver{
        eventer: eventer.NewEventer(ctx, logger),
        tasks:   newTaskStore(),
        ctx:     ctx,
        logger:  logger.Named(pluginName),
    }
}
```

### 2.2 BasePlugin 三方法

```go
func (d *Driver) PluginInfo() (*base.PluginInfoResponse, error) {
    return pluginInfo, nil
}

func (d *Driver) ConfigSchema() (*hclspec.Spec, error) {
    return configSpec, nil
}

func (d *Driver) SetConfig(cfg *base.Config) error {
    var config Config
    if len(cfg.PluginConfig) != 0 {
        if err := base.MsgPackDecode(cfg.PluginConfig, &config); err != nil {
            return err
        }
    }
    if err := config.validate(); err != nil {
        return err
    }
    d.config = config
    if cfg.AgentConfig != nil {
        d.nomadConfig = cfg.AgentConfig.Driver
        d.compute = cfg.AgentConfig.Compute()
    }
    return nil
}
```

### 2.3 TaskConfigSchema 与 Capabilities

```go
func (d *Driver) TaskConfigSchema() (*hclspec.Spec, error) {
    return taskConfigSpec, nil
}

func (d *Driver) Capabilities() (*drivers.Capabilities, error) {
    return driverCapabilities, nil
}
```

### 2.4 Fingerprint（健康检查 + 属性上报）

```go
func (d *Driver) Fingerprint(ctx context.Context) (<-chan *drivers.Fingerprint, error) {
    ch := make(chan *drivers.Fingerprint)
    go d.handleFingerprint(ctx, ch)
    return ch, nil
}

func (d *Driver) handleFingerprint(ctx context.Context, ch chan<- *drivers.Fingerprint) {
    defer close(ch)
    ticker := time.NewTimer(0)
    for {
        select {
        case <-ctx.Done():
            return
        case <-d.ctx.Done():
            return
        case <-ticker.C:
            ticker.Reset(fingerprintPeriod)
            ch <- d.buildFingerprint()
        }
    }
}

func (d *Driver) buildFingerprint() *drivers.Fingerprint {
    // 检查运行时是否可用（如二进制是否存在、权限是否足够）
    if runtimeUnavailable {
        return &drivers.Fingerprint{
            Attributes:        map[string]*pstructs.Attribute{},
            Health:            drivers.HealthStateUnhealthy,
            HealthDescription: "runtime not found",
        }
    }
    return &drivers.Fingerprint{
        Attributes: map[string]*pstructs.Attribute{
            "driver.mydriver": pstructs.NewBoolAttribute(true),
            "driver.mydriver.version": pstructs.NewStringAttribute("1.0.0"),
        },
        Health:            drivers.HealthStateHealthy,
        HealthDescription: "ready",
    }
}
```

**关键约束：**
- 必须在 channel 返回后立即推送第一条响应（不能等 ticker 触发，所以 `time.NewTimer(0)`）
- `HealthState` 影响 Nomad 调度：`Healthy` 才会被分配任务
- `Attributes` 会出现在 `node` 的属性表中，可用于 constraint

### 2.5 StartTask（启动任务）

```go
func (d *Driver) StartTask(cfg *drivers.TaskConfig) (*drivers.TaskHandle, *drivers.DriverNetwork, error) {
    if _, ok := d.tasks.Get(cfg.ID); ok {
        return nil, nil, fmt.Errorf("task with ID %q already started", cfg.ID)
    }

    // 解码任务级配置
    var driverConfig TaskConfig
    if err := cfg.DecodeDriverConfig(&driverConfig); err != nil {
        return nil, nil, fmt.Errorf("failed to decode driver config: %v", err)
    }

    // 创建 TaskHandle
    handle := drivers.NewTaskHandle(taskHandleVersion)
    handle.Config = cfg

    // 实际启动进程（这里以 fork/exec 为例，复杂场景可用 drivers/shared/executor）
    cmd := exec.CommandContext(d.ctx, driverConfig.Command, driverConfig.Args...)
    cmd.Env = cfg.EnvList()
    cmd.Stdout = os.Create(cfg.StdoutPath)
    cmd.Stderr = os.Create(cfg.StderrPath)
    if err := cmd.Start(); err != nil {
        return nil, nil, fmt.Errorf("failed to start: %v", err)
    }

    // 构造内部 handle 并保存
    h := &taskHandle{
        cmd:        cmd,
        taskConfig: cfg,
        procState:  drivers.TaskStateRunning,
        startedAt:  time.Now(),
        logger:     d.logger,
    }
    d.tasks.Set(cfg.ID, h)

    // 序列化驱动状态用于 RecoverTask
    state := &taskState{
        Pid:        cmd.Process.Pid,
        TaskConfig: cfg,
        StartedAt:  h.startedAt,
    }
    if err := handle.SetDriverState(state); err != nil {
        return nil, nil, fmt.Errorf("failed to set driver state: %v", err)
    }

    // 异步等待退出
    go h.run(d.eventer)

    return handle, nil, nil
}
```

### 2.6 WaitTask / StopTask / DestroyTask

```go
func (d *Driver) WaitTask(ctx context.Context, taskID string) (<-chan *drivers.ExitResult, error) {
    handle, ok := d.tasks.Get(taskID)
    if !ok {
        return nil, drivers.ErrTaskNotFound
    }
    return handle.waitCh, nil  // 在 taskHandle.run() 中关闭并写入 ExitResult
}

func (d *Driver) StopTask(taskID string, timeout time.Duration, signal string) error {
    handle, ok := d.tasks.Get(taskID)
    if !ok {
        return drivers.ErrTaskNotFound
    }
    // 1. 发送 signal
    _ = handle.cmd.Process.Signal(toOSSignal(signal))
    // 2. 等待 timeout 后强杀
    select {
    case <-time.After(timeout):
        return handle.cmd.Process.Kill()
    case <-handle.waitCh:
        return nil
    }
}

func (d *Driver) DestroyTask(taskID string, force bool) error {
    handle, ok := d.tasks.Get(taskID)
    if !ok {
        return drivers.ErrTaskNotFound
    }
    if handle.IsRunning() && !force {
        return fmt.Errorf("cannot destroy running task")
    }
    if handle.IsRunning() {
        _ = handle.cmd.Process.Kill()
    }
    d.tasks.Delete(taskID)
    return nil
}

func (d *Driver) InspectTask(taskID string) (*drivers.TaskStatus, error) {
    handle, ok := d.tasks.Get(taskID)
    if !ok {
        return nil, drivers.ErrTaskNotFound
    }
    return handle.TaskStatus(), nil
}
```

### 2.7 RecoverTask（Agent 重启后恢复）

```go
func (d *Driver) RecoverTask(handle *drivers.TaskHandle) error {
    if handle == nil {
        return errors.New("handle cannot be nil")
    }
    if _, ok := d.tasks.Get(handle.Config.ID); ok {
        return nil  // 已存在，跳过
    }

    // 解码持久化的驱动状态
    var state taskState
    if err := handle.GetDriverState(&state); err != nil {
        return fmt.Errorf("failed to decode driver state: %v", err)
    }

    // 检查进程是否仍在运行
    proc, err := os.FindProcess(state.Pid)
    if err != nil || !processAlive(proc) {
        // 进程已死，标记为 exited
        h := &taskHandle{
            taskConfig: state.TaskConfig,
            procState:  drivers.TaskStateExited,
            startedAt:  state.StartedAt,
            completedAt: time.Now(),
        }
        d.tasks.Set(handle.Config.ID, h)
        return nil
    }

    // 进程仍存活，重新 attach
    h := &taskHandle{
        cmd:        &exec.Cmd{Process: proc},
        taskConfig: state.TaskConfig,
        procState:  drivers.TaskStateRunning,
        startedAt:  state.StartedAt,
        logger:     d.logger,
    }
    d.tasks.Set(handle.Config.ID, h)
    go h.run(d.eventer)
    return nil
}
```

### 2.8 SignalTask / ExecTask（如声明支持）

```go
func (d *Driver) SignalTask(taskID string, signal string) error {
    handle, ok := d.tasks.Get(taskID)
    if !ok {
        return drivers.ErrTaskNotFound
    }
    return handle.cmd.Process.Signal(toOSSignal(signal))
}

func (d *Driver) ExecTask(taskID string, cmd []string, timeout time.Duration) (*drivers.ExecTaskResult, error) {
    // 简单实现：在任务命名空间内 fork/exec
    // 复杂场景建议实现 ExecTaskStreamingRawDriver，参考 exec 驱动
    return nil, fmt.Errorf("not implemented")
}
```

---

## 第 3 步：实现任务句柄与状态持久化

### 3.1 taskHandle 结构

参考 [drivers/exec/handle.go](file:///d:/claude/nomad/drivers/exec/handle.go)：

```go
type taskHandle struct {
    cmd        *exec.Cmd
    taskConfig *drivers.TaskConfig
    procState  drivers.TaskState
    startedAt  time.Time
    completedAt time.Time
    exitResult *drivers.ExitResult
    waitCh     chan *drivers.ExitResult
    logger     hclog.Logger
    stateLock  sync.RWMutex
}

func (h *taskHandle) TaskStatus() *drivers.TaskStatus {
    h.stateLock.RLock()
    defer h.stateLock.RUnlock()
    return &drivers.TaskStatus{
        ID:        h.taskConfig.ID,
        Name:      h.taskConfig.Name,
        State:     h.procState,
        StartedAt: h.startedAt,
        CompletedAt: h.completedAt,
        ExitResult: h.exitResult,
        DriverAttributes: map[string]string{
            "pid": strconv.Itoa(h.cmd.Process.Pid),
        },
    }
}

func (h *taskHandle) IsRunning() bool {
    h.stateLock.RLock()
    defer h.stateLock.RUnlock()
    return h.procState == drivers.TaskStateRunning
}

// run 在 goroutine 中等待进程退出，写入 exitResult 并关闭 waitCh
func (h *taskHandle) run(eventer *eventer.Eventer) {
    h.waitCh = make(chan *drivers.ExitResult, 1)
    err := h.cmd.Wait()

    h.stateLock.Lock()
    h.procState = drivers.TaskStateExited
    h.completedAt = time.Now()
    h.exitResult = &drivers.ExitResult{
        ExitCode: h.cmd.ProcessState.ExitCode(),
        Signal:   getSignal(h.cmd.ProcessState),
        Err:      err,
    }
    h.stateLock.Unlock()

    eventer.EmitEvent(&drivers.TaskEvent{
        TaskID:    h.taskConfig.ID,
        TaskName:  h.taskConfig.Name,
        AllocID:   h.taskConfig.AllocID,
        Timestamp: time.Now(),
        Message:   fmt.Sprintf("exited with code %d", h.exitResult.ExitCode),
    })

    h.waitCh <- h.exitResult
    close(h.waitCh)
}
```

### 3.2 持久化状态结构

```go
// taskState 是 TaskHandle.DriverState 的实际内容（msgpack 编码）
type taskState struct {
    Pid        int
    TaskConfig *drivers.TaskConfig
    StartedAt  time.Time
}
```

**`TaskHandle.SetDriverState`/`GetDriverState`** 通过 [plugins/base/plugin.go](file:///d:/claude/nomad/plugins/base/plugin.go) 的 MsgPack helper 编解码。

### 3.3 taskStore（并发安全 map）

参考 [drivers/exec/state.go](file:///d:/claude/nomad/drivers/exec/state.go)：

```go
type taskStore struct {
    m map[string]*taskHandle
    l sync.RWMutex
}

func newTaskStore() *taskStore { return &taskStore{m: map[string]*taskHandle{}} }

func (s *taskStore) Set(id string, h *taskHandle) {
    s.l.Lock(); defer s.l.Unlock()
    s.m[id] = h
}

func (s *taskStore) Get(id string) (*taskHandle, bool) {
    s.l.RLock(); defer s.l.RUnlock()
    h, ok := s.m[id]
    return h, ok
}

func (s *taskStore) Delete(id string) {
    s.l.Lock(); defer s.l.Unlock()
    delete(s.m, id)
}
```

---

## 第 4 步：事件广播与统计

### 4.1 使用 eventer.Eventer

[drivers/shared/eventer/eventer.go](file:///d:/claude/nomad/drivers/shared/eventer/eventer.go) 是 `TaskEvents` 的标准实现：

```go
import "github.com/hashicorp/nomad/drivers/shared/eventer"

func NewMyDriver(ctx context.Context, logger hclog.Logger) drivers.DriverPlugin {
    return &Driver{
        eventer: eventer.NewEventer(ctx, logger),
        ...
    }
}

// 直接作为 DriverPlugin.TaskEvents 的实现
func (d *Driver) TaskEvents(ctx context.Context) (<-chan *drivers.TaskEvent, error) {
    return d.eventer.TaskEvents(ctx)
}

// 任意位置广播事件
func (d *Driver) someAction() {
    d.eventer.EmitEvent(&drivers.TaskEvent{
        TaskID:    "...",
        TaskName:  "...",
        AllocID:   "...",
        Timestamp: time.Now(),
        Message:   "started successfully",
        Annotations: map[string]string{"detail": "..."},
    })
}
```

**特点：** 多 consumer 安全广播，单 consumer 超时（2s）不阻塞其他，1 分钟 GC 失效 consumer。

### 4.2 TaskStats 实现

```go
func (d *Driver) TaskStats(ctx context.Context, taskID string, interval time.Duration) (<-chan *cstructs.TaskResourceUsage, error) {
    handle, ok := d.tasks.Get(taskID)
    if !ok {
        return nil, drivers.ErrTaskNotFound
    }
    ch := make(chan *cstructs.TaskResourceUsage)
    go func() {
        defer close(ch)
        ticker := time.NewTicker(interval)
        defer ticker.Stop()
        for {
            select {
            case <-ctx.Done():
                return
            case <-ticker.C:
                // 读取 /proc/<pid>/stat、/proc/<pid>/status 计算 CPU/RSS
                usage := readProcStats(handle.cmd.Process.Pid)
                select {
                case ch <- usage:
                case <-ctx.Done():
                    return
                }
            }
        }
    }()
    return ch, nil
}
```

不实现统计时，可让客户端报错 `cstructs.DriverStatsNotImplemented`。

---

## 第 5 步：声明 Capabilities

[plugins/drivers/driver.go#L167-L197](file:///d:/claude/nomad/plugins/drivers/driver.go#L167-L197)

```go
type Capabilities struct {
    SendSignals          bool               // 是否支持 SignalTask
    Exec                 bool               // 是否支持 ExecTask
    FSIsolation          fsisolation.Mode   // none/chroot/image/unveil
    NetIsolationModes    []NetIsolationMode // host/group/task/none
    MustInitiateNetwork  bool               // 是否需要驱动自建网络
    MountConfigs         MountConfigSupport // MountConfigSupportAll/None
    DisableLogCollection bool               // 是否禁用 logmon
    DynamicWorkloadUsers bool               // 是否支持动态 UID/GID
}
```

| 字段 | 何时设为 true | 影响 |
|------|-------------|------|
| `SendSignals` | 实现 SignalTask 且能转发信号 | client 才会调用 SignalTask RPC |
| `Exec` | 实现 ExecTask | 服务发现健康检查、`nomad alloc exec` 可用 |
| `FSIsolation` | chroot 隔离 / 容器镜像 | client 据此构建 task dir 结构 |
| `MustInitiateNetwork` | 驱动自己创建 netns | 需实现 `DriverNetworkManager` 接口 |
| `DisableLogCollection` | 远程驱动不需要日志 | client 不启动 logmon 子进程 |
| `DynamicWorkloadUsers` | 容器运行时支持任意 UID | client 分配唯一 UID |

**FSIsolation 枚举** ([plugins/drivers/fsisolation/isolation.go](file:///d:/claude/nomad/plugins/drivers/fsisolation/isolation.go))：
- `None`：无隔离（默认）
- `Chroot`：chroot 隔离（exec/java/rawexec）
- `Image`：容器镜像（docker）
- `Unveil`：OpenBSD unveil/Landlock

---

## 第 6 步：注册为内置驱动

### 6.1 声明 PluginID/PluginConfig（已在第 1 步完成）

### 6.2 添加到 catalog 注册表

编辑 [helper/pluginutils/catalog/register_cgo.go](file:///d:/claude/nomad/helper/pluginutils/catalog/register_cgo.go)：

```go
//go:build cgo

package catalog

import (
    "github.com/hashicorp/nomad/drivers/docker"
    "github.com/hashicorp/nomad/drivers/exec"
    "github.com/hashicorp/nomad/drivers/java"
    "github.com/hashicorp/nomad/drivers/mydriver"  // 新增
    "github.com/hashicorp/nomad/drivers/qemu"
    "github.com/hashicorp/nomad/drivers/rawexec"
)

func init() {
    RegisterDeferredConfig(rawexec.PluginID, rawexec.PluginConfig, rawexec.PluginLoader)
    Register(exec.PluginID, exec.PluginConfig)
    Register(qemu.PluginID, qemu.PluginConfig)
    Register(java.PluginID, java.PluginConfig)
    RegisterDeferredConfig(docker.PluginID, docker.PluginConfig, docker.PluginLoader)
    Register(mydriver.PluginID, mydriver.PluginConfig)  // 新增
}
```

同时更新 [register.go](file:///d:/claude/nomad/helper/pluginutils/catalog/register.go)（非 cgo 版本，如适用）。

### 6.3 编译

```bash
make dev  # 内置驱动会被自动编入
```

### 6.4 启用条件

内置驱动自动注册，但需要在 client 配置中通过 `plugin "mydriver" { config { enabled = true } }` 启用并配置。Fingerprint 返回 `Healthy` 后调度器才会分配任务。

---

## 第 7 步：作为外部驱动打包

### 7.1 创建独立 main.go

参考 [drivers/docker/cmd/main.go](file:///d:/claude/nomad/drivers/docker/cmd/main.go)：

```go
package main

import (
    "context"
    "os"

    log "github.com/hashicorp/go-hclog"
    "github.com/hashicorp/nomad/drivers/mydriver"
    "github.com/hashicorp/nomad/plugins"
)

func main() {
    plugins.ServeCtx(factory)
}

func factory(ctx context.Context, log log.Logger) interface{} {
    return mydriver.NewMyDriver(ctx, log)
}
```

### 7.2 编译并部署

```bash
# 编译为可执行文件
go build -o mydriver ./drivers/mydriver/cmd

# 部署到 Nomad client 的 plugin_dir
cp mydriver /opt/nomad/plugins/

# 在 client 配置中声明
# client {
#   plugin_dir = "/opt/nomad/plugins"
# }
# plugin "mydriver" {
#   config { enabled = true }
# }
```

### 7.3 内部机制

`plugins.ServeCtx` ([plugins/serve.go](file:///d:/claude/nomad/plugins/serve.go)) 会：
1. 创建 logger
2. 调用 factory 创建驱动实例
3. 通过类型断言分发到 `drivers.Serve(d, logger)`
4. `drivers.Serve` ([plugins/drivers/plugin.go#L54-L65](file:///d:/claude/nomad/plugins/drivers/plugin.go#L54-L65)) 调用 `plugin.Serve(&plugin.ServeConfig{...})` 进入 go-plugin 协议

外部驱动通过 [helper/pluginutils/loader/init.go](file:///d:/claude/nomad/helper/pluginutils/loader/init.go) 的 `fingerprintPlugin` 在启动时被扫描指纹（启动→查询 PluginInfo/ConfigSchema→kill），之后才正式加载。

---

## 第 8 步：测试

### 8.1 使用 DriverHarness

[plugins/drivers/testutils/testing.go](file:///d:/claude/nomad/plugins/drivers/testutils/testing.go) 提供 `DriverHarness`，把驱动包装成 gRPC client/server，可像真实 Nomad 一样调用：

```go
package mydriver_test

import (
    "context"
    "testing"
    "time"

    "github.com/hashicorp/nomad/drivers/mydriver"
    "github.com/hashicorp/nomad/plugins/drivers/testutils"
)

func TestStartStop(t *testing.T) {
    ctx := context.Background()
    d := mydriver.NewMyDriver(ctx, testlog.HCLogger(t))
    harness := testutils.NewDriverHarness(t, d)
    defer harness.Kill()

    // 构造 TaskConfig
    cfg := &drivers.TaskConfig{
        ID:   "test-1",
        Name: "test",
        AllocDir: t.TempDir(),
        Env:  map[string]string{"PATH": os.Getenv("PATH")},
    }
    // 编码任务级配置
    rawCfg, _ := drivers.EncodeConcreteDriverConfig(map[string]interface{}{
        "command": "/bin/sleep",
        "args":    []string{"60"},
    })
    cfg.DriverConfig = rawCfg

    // 启动
    handle, _, err := harness.StartTask(cfg)
    if err != nil { t.Fatal(err) }
    defer harness.DestroyTask(cfg.ID, true)

    // 等待运行
    testutils.WaitUntilStarted(t, harness, cfg.ID)

    // 停止
    if err := harness.StopTask(cfg.ID, 5*time.Second, "SIGTERM"); err != nil {
        t.Fatal(err)
    }
}
```

### 8.2 一致性测试套件

[plugins/drivers/testutils/exec_testing.go](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go) 提供 `ExecTaskStreamingConformanceTests`，声明支持 Exec 的驱动应运行此套件确保行为一致：

```go
func TestExecConformance(t *testing.T) {
    harness := testutils.NewDriverHarness(t, d)
    defer harness.Kill()
    testutils.ExecTaskStreamingConformanceTests(t, harness)
}
```

[plugins/drivers/testutils/dns_testing.go](file:///d:/claude/nomad/plugins/drivers/testutils/dns_testing.go) 提供 DNS 一致性测试。

### 8.3 MockDriver

[plugins/drivers/testutils/testing.go#L212-L279](file:///d:/claude/nomad/plugins/drivers/testutils/testing.go#L212-L279) 提供 `MockDriver`，每个方法都是可注入闭包，用于上层（allocrunner 等）测试。

---

## 第 9 步：jobspec 与配置示例

### 9.1 client 配置（agent.hcl）

```hcl
client {
  plugin_dir = "/opt/nomad/plugins"
}

plugin "mydriver" {
  config {
    enabled       = true
    runtime_path  = "/usr/local/bin/myruntime"
  }
}
```

### 9.2 jobspec

```hcl
job "example" {
  group "web" {
    task "server" {
      driver = "mydriver"

      config {
        command = "/bin/myserver"
        args    = ["--port", "8080"]
      }

      resources {
        cpu    = 500
        memory = 256
      }
    }
  }
}
```

任务级 `config` 块必须匹配 `taskConfigSpec` 声明的 schema。

---

## 可选能力扩展

### 1. DriverIniter：初始化钩子

```go
func (d *Driver) Init(ctx context.Context) error {
    // 在 SetConfig 之后、首次 Fingerprint/StartTask 之前调用
    // 适合做一次性的运行时检测、缓存构建
    return d.initRuntime()
}
```

### 2. DriverShutdowner：清理钩子

```go
func (d *Driver) Shutdown(ctx context.Context) error {
    // Agent 关闭时调用，可优雅停止所有任务
    d.tasks.ForEach(func(h *taskHandle) {
        _ = h.cmd.Process.Signal(syscall.SIGTERM)
    })
    return nil
}
```

### 3. ExecTaskStreamingRawDriver：流式 exec

`nomad alloc exec` 优先调用此接口，支持 TTY、stdin 交互。参考 [drivers/exec/driver.go#L724-L741](file:///d:/claude/nomad/drivers/exec/driver.go#L724-L741)：

```go
func (d *Driver) ExecTaskStreamingRaw(ctx context.Context, taskID string, opts *drivers.ExecOptions) (<-chan *drivers.ExecTaskResponse, error) {
    handle, ok := d.tasks.Get(taskID)
    if !ok {
        return nil, drivers.ErrTaskNotFound
    }
    // 实现流式 stdin/stdout/stderr 转发
    ...
}
```

### 4. DriverNetworkManager：自建网络

```go
func (d *Driver) CreateNetwork(allocID string, req *drivers.NetworkCreateRequest) (*drivers.NetworkIsolationSpec, error) {
    // 调用 CNI/ip netns 创建 netns，返回路径
    return &drivers.NetworkIsolationSpec{
        Mode: drivers.NetIsolationModeGroup,
        Path: "/var/run/netns/alloc-" + allocID,
    }, nil
}

func (d *Driver) DestroyNetwork(allocID string, req *drivers.NetworkDestroyRequest) error {
    // 清理 netns
    return nil
}
```

声明 `MustInitiateNetwork: true` 时必须实现。

### 5. 共享 executor 复用

[drivers/shared/executor](file:///d:/claude/nomad/drivers/shared/executor) 是 exec/rawexec/java/qemu 共用的进程管理库，封装了：
- chroot / cgroup / 资源限制
- signal / exec / stats
- reattach 子进程

如果你的驱动是"在主机上跑一个进程 + chroot/cgroup"，建议复用 executor：

```go
import "github.com/hashicorp/nomad/drivers/shared/executor"

func (d *Driver) StartTask(cfg *drivers.TaskConfig) (*drivers.TaskHandle, *drivers.DriverNetwork, error) {
    // 创建 executor 子进程插件
    exec, pluginClient, err := executor.CreateExecutor(d.logger, d.compute, cfg)
    ...
    // 启动
    execCommand := &executor.ExecCommand{
        Cmd:  driverConfig.Command,
        Args: driverConfig.Args,
        Env:  cfg.EnvList(),
        ...
    }
    res, err := exec.Launch(execCommand, &executor.BasicResources{
        CPUShares:  ..., MemoryLimitBytes: ..., OOMScoreAdj: ...,
    })
    ...
}
```

参考 [drivers/exec/driver.go#L459-L576](file:///d:/claude/nomad/drivers/exec/driver.go#L459-L576) 的完整实现。

---

## 常见陷阱与最佳实践

### 1. Fingerprint 必须立即响应

❌ 错误：用 `time.NewTicker(30 * time.Second)` 等待首次触发  
✅ 正确：用 `time.NewTimer(0)` 立即触发，之后 `ticker.Reset(period)`

### 2. TaskHandle.Version 自管理

- Version 0 被 Nomad 保留给 pre-0.9 兼容
- 自定义 Version ≥ 1
- `RecoverTask` 中根据 Version 做迁移逻辑

### 3. RecoverTask 幂等

Agent 重启可能多次调用 `RecoverTask`，需检查 taskStore 是否已存在，存在则直接返回。

### 4. waitCh 缓冲

```go
h.waitCh = make(chan *drivers.ExitResult, 1)  // 必须 buffer 1
```

否则 `run()` goroutine 在写入时会阻塞，因为可能没有 WaitTask 调用者。

### 5. context 传播

- `Driver.ctx` 是 driver 级别生命周期（Agent 关闭时取消）
- `Fingerprint(ctx)` 的 ctx 是调用方级别
- 长时间运行的 goroutine 应同时监听两个 ctx

### 6. 日志路径

`TaskConfig.StdoutPath`/`StderrPath` 由 client 预先创建，驱动直接写入即可。不要自己创建日志文件。

### 7. 资源统计频率

`TaskStats(ctx, taskID, interval)` 的 `interval` 由调用方指定，通常 1s。驱动应严格按 interval 推送，不要更快或更慢。

### 8. StopTask 的 timeout 语义

`StopTask(taskID, timeout, signal)` 应：
1. 立即发送 signal
2. 等待 timeout 后强杀（SIGKILL）
3. 不要在 StopTask 内调用 DestroyTask（client 会单独调用）

### 9. 外部驱动的 PluginApiVersions

外部驱动二进制的 `PluginInfoResponse.PluginApiVersions` 必须与 Nomad agent 的 `loader.AgentSupportedApiVersions` 有交集，否则被跳过。当前唯一版本是 `drivers.ApiVersion010 = "v0.1.0"`。

### 10. gRPC 错误处理

返回错误时：
- 普通错误：直接返回 `error`
- 可恢复错误（重试可能成功）：包装为 `structs.NewRecoverableError(err, true)`
- client 端 `driverPluginClient` 会自动处理 `codes.Unimplemented`（可选接口未实现时）

---

## 参考实现清单

### 内置驱动（按复杂度排序）

| 驱动 | 路径 | 特点 |
|------|------|------|
| exec | [drivers/exec/](file:///d:/claude/nomad/drivers/exec/) | chroot + cgroup，最佳模板 |
| rawexec | [drivers/rawexec/](file:///d:/claude/nomad/drivers/rawexec/) | 无 chroot，但用 executor |
| java | [drivers/java/](file:///d:/claude/nomad/drivers/java/) | 运行时切换 FSIsolation |
| qemu | [drivers/qemu/](file:///d:/claude/nomad/drivers/qemu/) | 不支持 Signal/Exec，`MountConfigSupportNone` |
| docker | [drivers/docker/](file:///d:/claude/nomad/drivers/docker/) | 最复杂，容器运行时集成 |

### 核心接口文件

| 文件 | 用途 |
|------|------|
| [plugins/drivers/driver.go](file:///d:/claude/nomad/plugins/drivers/driver.go) | `DriverPlugin` 接口、所有类型定义 |
| [plugins/drivers/task_handle.go](file:///d:/claude/nomad/plugins/drivers/task_handle.go) | `TaskHandle` 与序列化 |
| [plugins/drivers/utils.go](file:///d:/claude/nomad/plugins/drivers/utils.go) | Proto 与 Go 类型互转 |
| [plugins/drivers/plugin.go](file:///d:/claude/nomad/plugins/drivers/plugin.go) | `Serve` 入口（外部驱动） |
| [plugins/base/base.go](file:///d:/claude/nomad/plugins/base/base.go) | `BasePlugin` 接口 |
| [plugins/base/plugin.go](file:///d:/claude/nomad/plugins/base/plugin.go) | `Handshake`、MsgPack helper |

### 注册与加载

| 文件 | 用途 |
|------|------|
| [helper/pluginutils/catalog/catalog.go](file:///d:/claude/nomad/helper/pluginutils/catalog/catalog.go) | `Register`/`Catalog` 注册表 |
| [helper/pluginutils/catalog/register_cgo.go](file:///d:/claude/nomad/helper/pluginutils/catalog/register_cgo.go) | cgo build 下注册内置驱动 |
| [helper/pluginutils/loader/loader.go](file:///d:/claude/nomad/helper/pluginutils/loader/loader.go) | `PluginLoader`、`InternalPluginConfig` |
| [helper/pluginutils/loader/init.go](file:///d:/claude/nomad/helper/pluginutils/loader/init.go) | 内置/外部插件初始化、指纹收集 |
| [helper/pluginutils/loader/api_versions.go](file:///d:/claude/nomad/helper/pluginutils/loader/api_versions.go) | Agent 支持的 API 版本表 |
| [command/agent/plugins.go](file:///d:/claude/nomad/command/agent/plugins.go) | Agent 启动时加载插件 |

### 测试与共享工具

| 文件 | 用途 |
|------|------|
| [plugins/drivers/testutils/testing.go](file:///d:/claude/nomad/plugins/drivers/testutils/testing.go) | `DriverHarness`、`MockDriver`、`WaitUntilStarted` |
| [plugins/drivers/testutils/exec_testing.go](file:///d:/claude/nomad/plugins/drivers/testutils/exec_testing.go) | exec 一致性测试套件 |
| [drivers/shared/eventer/eventer.go](file:///d:/claude/nomad/drivers/shared/eventer/eventer.go) | 事件广播工具 |
| [drivers/shared/executor/](file:///d:/claude/nomad/drivers/shared/executor/) | 共享执行器（chroot/cgroup/exec/stats） |
| [plugins/drivers/fsisolation/isolation.go](file:///d:/claude/nomad/plugins/drivers/fsisolation/isolation.go) | FS 隔离模式枚举 |
| [plugins/drivers/proto/driver.proto](file:///d:/claude/nomad/plugins/drivers/proto/driver.proto) | gRPC 契约（808 行） |

### Reattach 与状态持久化

| 文件 | 用途 |
|------|------|
| [plugins/shared/structs/plugin_reattach_config.go](file:///d:/claude/nomad/plugins/shared/structs/plugin_reattach_config.go) | `ReattachConfig` 序列化包装 |
| [plugins/drivers/utils.go](file:///d:/claude/nomad/plugins/drivers/utils.go) | `taskHandleToProto`/`taskHandleFromProto` |

---

## 附录：最小可用骨架代码

```
drivers/mydriver/
├── driver.go        # Driver 结构体 + 所有 DriverPlugin 方法
├── handle.go        # taskHandle 结构体 + run() + TaskStatus()
├── state.go         # taskStore（map + mutex）
├── config.go        # Config 结构体 + validate()
├── task_config.go   # TaskConfig（任务级配置）+ validate()
└── driver_test.go   # 测试
```

**driver.go 骨架：**

```go
package mydriver

import (
    "context"
    "time"

    "github.com/hashicorp/go-hclog"
    "github.com/hashicorp/hcl/v2/hclspec"
    "github.com/hashicorp/nomad/helper/pluginutils/loader"
    "github.com/hashicorp/nomad/plugins/base"
    "github.com/hashicorp/nomad/plugins/drivers"
    "github.com/hashicorp/nomad/plugins/drivers/fsisolation"
    "github.com/hashicorp/nomad/drivers/shared/eventer"
)

const (
    pluginName        = "mydriver"
    fingerprintPeriod = 30 * time.Second
    taskHandleVersion = 1
)

var (
    PluginID = loader.PluginID{Name: pluginName, PluginType: base.PluginTypeDriver}
    PluginConfig = &loader.InternalPluginConfig{
        Config: map[string]interface{}{},
        Factory: func(ctx context.Context, l hclog.Logger) interface{} {
            return NewMyDriver(ctx, l)
        },
    }
    pluginInfo = &base.PluginInfoResponse{
        Type:              base.PluginTypeDriver,
        PluginApiVersions: []string{drivers.ApiVersion010},
        PluginVersion:     "0.1.0",
        Name:              pluginName,
    }
    configSpec = hclspec.NewObject(map[string]*hclspec.Spec{})
    taskConfigSpec = hclspec.NewObject(map[string]*hclspec.Spec{})
    driverCapabilities = &drivers.Capabilities{
        SendSignals:  false,
        Exec:         false,
        FSIsolation:  fsisolation.None,
        MountConfigs: drivers.MountConfigSupportNone,
    }
)

type Driver struct {
    eventer *eventer.Eventer
    config  Config
    tasks   *taskStore
    ctx     context.Context
    logger  hclog.Logger
}

func NewMyDriver(ctx context.Context, logger hclog.Logger) drivers.DriverPlugin {
    return &Driver{
        eventer: eventer.NewEventer(ctx, logger),
        tasks:   newTaskStore(),
        ctx:     ctx,
        logger:  logger.Named(pluginName),
    }
}

// 实现 BasePlugin
func (d *Driver) PluginInfo() (*base.PluginInfoResponse, error)    { return pluginInfo, nil }
func (d *Driver) ConfigSchema() (*hclspec.Spec, error)             { return configSpec, nil }
func (d *Driver) SetConfig(cfg *base.Config) error                  { return nil }

// 实现 DriverPlugin
func (d *Driver) TaskConfigSchema() (*hclspec.Spec, error) { return taskConfigSpec, nil }
func (d *Driver) Capabilities() (*drivers.Capabilities, error) { return driverCapabilities, nil }
func (d *Driver) Fingerprint(ctx context.Context) (<-chan *drivers.Fingerprint, error) { ... }
func (d *Driver) RecoverTask(*drivers.TaskHandle) error { ... }
func (d *Driver) StartTask(*drivers.TaskConfig) (*drivers.TaskHandle, *drivers.DriverNetwork, error) { ... }
func (d *Driver) WaitTask(ctx context.Context, taskID string) (<-chan *drivers.ExitResult, error) { ... }
func (d *Driver) StopTask(taskID string, timeout time.Duration, signal string) error { ... }
func (d *Driver) DestroyTask(taskID string, force bool) error { ... }
func (d *Driver) InspectTask(taskID string) (*drivers.TaskStatus, error) { ... }
func (d *Driver) TaskStats(ctx context.Context, taskID string, interval time.Duration) (<-chan *cstructs.TaskResourceUsage, error) { ... }
func (d *Driver) TaskEvents(context.Context) (<-chan *drivers.TaskEvent, error) { return d.eventer.TaskEvents(ctx) }

// 不支持的能力
func (d *Driver) SignalTask(string, string) error { return errors.New("not supported") }
func (d *Driver) ExecTask(string, []string, time.Duration) (*drivers.ExecTaskResult, error) {
    return nil, errors.New("not supported")
}
```

---

*本文档基于 Nomad 源码（截至 2026-07-21）整理。开发新驱动时建议以 [drivers/exec/](file:///d:/claude/nomad/drivers/exec/) 为模板复制修改。*
