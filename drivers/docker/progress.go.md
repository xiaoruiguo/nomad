# progress.go 代码说明文档

> 文件路径：[drivers/docker/progress.go](file:///d:/claude/nomad/drivers/docker/progress.go)
> 总行数：289 行
> 所属包：`docker`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Docker 驱动子包**（`drivers/docker`），实现 Nomad 的 Docker 任务驱动，通过 Docker API 管理容器的生命周期（创建、启动、停止、销毁）、资源限制、网络配置和日志收集。支持 Docker API 版本协商、认证、健康检查和统计信息收集。

## 2. 类型定义

### layerProgress

**定义位置**：[L32](file:///d:/claude/nomad/drivers/docker/progress.go#L32)

**中文说明**：layerProgress 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type layerProgress struct {
	id string
	status layerProgressStatus
	currentBytes int64
	totalBytes int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `id` | `string` | 唯一标识符 |
| `status` | `layerProgressStatus` | 状态 |
| `currentBytes` | `int64` | — |
| `totalBytes` | `int64` | — |

### layerProgressStatus

**定义位置**：[L39](file:///d:/claude/nomad/drivers/docker/progress.go#L39)

**中文说明**：layerProgressStatus 是一个状态结构体，描述对象或操作的当前状态。

**类型定义**：`type layerProgressStatus int`

### imageProgress

**定义位置**：[L78](file:///d:/claude/nomad/drivers/docker/progress.go#L78)

**中文说明**：imageProgress 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type imageProgress struct {
	sync.RWMutex sync.RWMutex
	lastMessage *jsonstream.Message
	timestamp time.Time
	layers map[string]*layerProgress
	pullStart time.Time
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `sync.RWMutex` | `sync.RWMutex` | 读写锁，保护并发访问 |
| `lastMessage` | `*jsonstream.Message` | — |
| `timestamp` | `time.Time` | 时间戳 |
| `layers` | `map[string]*layerProgress` | 映射表 |
| `pullStart` | `time.Time` | 时间点 |

**关联方法**（4 个）：`get`, `set`, `currentBytes`, `totalBytes`

### progressReporterFunc

**定义位置**：[L181](file:///d:/claude/nomad/drivers/docker/progress.go#L181)

**类型定义**：`type progressReporterFunc func(...)`

### imageProgressManager

**定义位置**：[L188](file:///d:/claude/nomad/drivers/docker/progress.go#L188)

**中文说明**：imageProgressManager 是一个管理器，负责协调和管理相关资源的生命周期。

**类型**：struct

```go
type imageProgressManager struct {
	imageProgress *imageProgress
	image string
	activityDeadline time.Duration
	inactivityFunc progressReporterFunc
	reportInterval time.Duration
	reporter progressReporterFunc
	slowReportInterval time.Duration
	slowReporter progressReporterFunc
	lastSlowReport time.Time
	cancel context.CancelFunc
	stopCh chan struct{...}
	buf bytes.Buffer
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `imageProgress` | `*imageProgress` | — |
| `image` | `string` | 字符串 |
| `activityDeadline` | `time.Duration` | 时间间隔 |
| `inactivityFunc` | `progressReporterFunc` | — |
| `reportInterval` | `time.Duration` | 时间间隔 |
| `reporter` | `progressReporterFunc` | — |
| `slowReportInterval` | `time.Duration` | 时间间隔 |
| `slowReporter` | `progressReporterFunc` | — |
| `lastSlowReport` | `time.Time` | 时间点 |
| `cancel` | `context.CancelFunc` | 取消 |
| `stopCh` | `chan struct{...}` | 信号通道 |
| `buf` | `bytes.Buffer` | — |

**关联方法**（3 个）：`start`, `stop`, `Write`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `dockerImageProgressReportInterval` | `—` | `10 * time.Second` | — |
| `dockerImageSlowProgressReportInterval` | `—` | `2 * time.Minute` | — |
| `layerProgressStatusUnknown` | `layerProgressStatus` | `iota` | — |
| `layerProgressStatusStarting` | `—` | `` | — |
| `layerProgressStatusWaiting` | `—` | `` | — |
| `layerProgressStatusDownloading` | `—` | `` | — |
| `layerProgressStatusVerifying` | `—` | `` | — |
| `layerProgressStatusDownloaded` | `—` | `` | — |
| `layerProgressStatusExtracting` | `—` | `` | — |
| `layerProgressStatusComplete` | `—` | `` | — |
| `layerProgressStatusExists` | `—` | `` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `lpsFromString` | - | `status string` | `layerProgressStatus` | [L53](file:///d:/claude/nomad/drivers/docker/progress.go#L53) |
| `get` | `p *imageProgress` | `` | `string, time.Time` | [L87](file:///d:/claude/nomad/drivers/docker/progress.go#L87) |
| `set` | `p *imageProgress` | `msg *jsonstream.Message` | `` | [L130](file:///d:/claude/nomad/drivers/docker/progress.go#L130) |
| `currentBytes` | `p *imageProgress` | `` | `int64` | [L159](file:///d:/claude/nomad/drivers/docker/progress.go#L159) |
| `totalBytes` | `p *imageProgress` | `` | `int64` | [L170](file:///d:/claude/nomad/drivers/docker/progress.go#L170) |
| `newImageProgressManager` | - | `image string, cancel context.CancelFunc, pullActivityTimeout time.Duration, i...` | `*imageProgressManager` | [L203](file:///d:/claude/nomad/drivers/docker/progress.go#L203) |
| `start` | `pm *imageProgressManager` | `` | `` | [L228](file:///d:/claude/nomad/drivers/docker/progress.go#L228) |
| `stop` | `pm *imageProgressManager` | `` | `` | [L256](file:///d:/claude/nomad/drivers/docker/progress.go#L256) |
| `Write` | `pm *imageProgressManager` | `p []byte` | `n int, err error` | [L260](file:///d:/claude/nomad/drivers/docker/progress.go#L260) |

## 5. 核心方法详解

### Write()

**签名**：`func (pm *imageProgressManager) Write(p []byte) n int, err error`

**位置**：[L260](file:///d:/claude/nomad/drivers/docker/progress.go#L260)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `p` | `[]byte` | 字节数组 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `n int` | — |
| `err error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `context` | 标准库 |
| `encoding/json` | 标准库 |
| `fmt` | 标准库 |
| `io` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `time` | 标准库 |
| `github.com/docker/go-units` | 第三方库 |
| `github.com/moby/moby/api/types/jsonstream` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **IO 操作**：涉及文件或数据流的读写操作
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期
- **Docker 集成**：与 Docker Engine API 交互，管理容器生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [progress_test.go](file:///d:/claude/nomad/drivers/docker/progress_test.go) | 对应测试文件 |
| [config.go](file:///d:/claude/nomad/drivers/docker/config.go) | 同目录源文件 |
| [coordinator.go](file:///d:/claude/nomad/drivers/docker/coordinator.go) | 同目录源文件 |
| [cpuset.go](file:///d:/claude/nomad/drivers/docker/cpuset.go) | 同目录源文件 |
| [driver.go](file:///d:/claude/nomad/drivers/docker/driver.go) | 同目录源文件 |
| [driver_default.go](file:///d:/claude/nomad/drivers/docker/driver_default.go) | 同目录源文件 |

