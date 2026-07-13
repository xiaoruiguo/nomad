# Nomad 制品下载与 Docker 镜像下载逻辑分析

本文档分析 Nomad 中 job.nomad 文件涉及的两种"下载"机制：**制品下载（Artifact Download）** 和 **Docker 镜像下载**，包括它们的触发位置、执行组件、调用链及关键设计。

## 概述

Nomad 中 job.nomad 文件涉及的"下载"有**两种完全不同的逻辑**，它们发生在不同的阶段和不同的组件中：

1. **制品下载** — 由 `artifact` 块触发，在 TaskRunner 的 Prestart Hook 阶段执行
2. **Docker 镜像下载** — 由 `driver = "docker"` + `config.image` 触发，在 Driver 的 StartTask 阶段执行

**关键结论**：两者都不是由 CLI 命令完成的。`nomad job run` 只负责提交 job spec 到 Server，实际下载发生在 Client 节点的 TaskRunner 生命周期中。

---

## 一、制品下载（Artifact Download）

### 触发位置：job.nomad 中的 `artifact` 块

```hcl
task "web" {
  artifact {
    source      = "https://github.com/myorg/repo/archive/main.zip"
    destination = "local/repo"
    mode        = "any"
  }
}
```

### 完成的"命令"（组件）

**不是 CLI 命令，而是 TaskRunner 的 Prestart Hook 阶段**。

具体在 [client/allocrunner/taskrunner/artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) 中的 `artifactHook.Prestart` 方法完成。

### 调用链

```
nomad job run（CLI 命令，提交 job）
    │
    ▼
Nomad Server 调度 → 产生 allocation
    │
    ▼
Client 接收 alloc → allocrunner → taskrunner
    │
    ▼
TaskRunner.Run() [task_runner.go:641]
    │
    ▼
TaskRunner.prestart() [task_runner_hooks.go:219]
    │  （遍历所有 PrestartHook）
    ▼
artifactHook.Prestart() [artifact_hook.go:82]
    │  （3 个 worker 并发下载）
    ▼
artifactHook.doWork() [artifact_hook.go:35]
    │
    ▼
getter.Sandbox.Get() [getter/sandbox.go:31]
    │  （构建 parameters：source/destination/mode/headers...）
    ▼
Sandbox.runCmd() [getter/util.go:164]
    │  （调用 nomad agent 子进程 "artifact-isolation"）
    ▼
subproc.Self() → 启动隔离子进程
    │
    ▼
go-getter 库实际下载（支持 HTTP/Git/S3/GCS/Hg 等）
```

### 关键设计

| 特性 | 实现位置 | 说明 |
|------|---------|------|
| **并发控制** | [artifact_hook.go:99](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go#L99) | `maxConcurrency = 3`，最多 3 个 worker 并行下载 |
| **断点续传** | [artifact_hook.go:46-52](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go#L46-L52) | 通过 `PreviousState[aid]` 记录已下载 artifact，重试时跳过 |
| **沙箱隔离** | [getter/sandbox.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox.go) | 在子进程中执行，限制文件系统访问范围 |
| **安全检查** | [getter/util.go:170](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go#L170) | `DisableArtifactInspection` 控制是否检查压缩包中的符号链接逃逸 |
| **失败处理** | [artifact_hook.go:55-60](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go#L55-L60) | 产生 `RecoverableError`（可重试）+ `TaskArtifactDownloadFailed` 事件 |

### Artifact 块字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `source` | string | 下载源 URL（支持 HTTP/HTTPS/Git/S3/GCS/Hg/文件） |
| `destination` | string | 目标路径（相对 task 的 `local/` 目录） |
| `mode` | string | `any`（默认，解压或直接复制）、`file`（强制单文件） |
| `options` | map | go-getter 选项（如 `checksum`、`depth` 等） |
| `headers` | map | HTTP 请求头 |
| `insecure` | bool | 跳过 TLS 校验 |
| `chown` | bool | 设置文件属主为 task user |

---

## 二、Docker 镜像下载

### 触发位置：job.nomad 中的 `driver = "docker"` + `config.image`

```hcl
task "web" {
  driver = "docker"
  config {
    image              = "nginx:1.21"
    image_pull_timeout = "5m"
    force_pull         = false
    load_image         = "/path/to/image.tar"  # 可选：本地加载替代拉取
  }
}
```

### 完成的"命令"（组件）

**在 Docker Driver 的 `StartTask` 方法中完成**，不是 CLI 命令。

具体在 [drivers/docker/driver.go](file:///d:/claude/nomad/drivers/docker/driver.go) 中：
- `Driver.StartTask()` → `Driver.createImage()` → `Driver.pullImage()` → `dockerCoordinator.PullImage()`

### 调用链

```
TaskRunner.Run() [task_runner.go]
    │
    ▼
prestart() 完成（artifact 已下载）
    │
    ▼
tr.driver.StartTask(taskConfig) [task_runner.go:970]
    │
    ▼
docker.Driver.StartTask() [driver.go:328]
    │
    ▼
d.createImage(cfg, &driverConfig, dockerClient) [driver.go:367]
    │
    ├── 如果 force_pull=false 且 tag≠"latest"：
    │   └── client.ImageInspect() 检查本地是否已有
    │       └── 已存在 → IncrementImageReference → 返回（不下载）
    │
    ├── 如果 load_image ≠ ""：
    │   └── d.loadImage() 从本地 tar 加载
    │
    └── 否则 → d.pullImage() [driver.go:652]
            │
            ▼
        resolveRegistryAuthentication() 解析认证
            │
            ▼
        d.coordinator.PullImage() [coordinator.go:146]
            │  （去重：相同 image 只拉一次，多 alloc 共享 future）
            ▼
        dockerCoordinator.pullImageImpl() [coordinator.go:193]
            │
            ▼
        client.ImagePull() → Docker Registry API
            │  （流式读取 progress）
            ▼
        io.Copy(pm, reader) 解析进度
            │
            ▼
        client.ImageInspect() 获取 image ID + User
```

### 关键设计

| 特性 | 实现位置 | 说明 |
|------|---------|------|
| **去重拉取** | [coordinator.go:152-162](file:///d:/claude/nomad/drivers/docker/coordinator.go#L152-L162) | `pullFutures` map 确保相同镜像只拉一次，其他 alloc 等待 future |
| **引用计数** | [coordinator.go:178-180](file:///d:/claude/nomad/drivers/docker/coordinator.go#L178-L180) | `imageRefCount` 跟踪镜像使用，GC 时按引用计数删除 |
| **超时控制** | [coordinator.go:201](file:///d:/claude/nomad/drivers/docker/coordinator.go#L201) | `pullTimeout`（默认 5m）+ `pullActivityTimeout`（默认 2m，无活动超时） |
| **认证解析** | [driver.go:660](file:///d:/claude/nomad/drivers/docker/driver.go#L660) | 支持 `auth.config`（json）、`auth.helper`（credential helper）、`auth.soft_fail` |
| **本地缓存** | [driver.go:628-636](file:///d:/claude/nomad/drivers/docker/driver.go#L628-L636) | 非 latest tag 且 `force_pull=false` 时优先用本地镜像 |
| **进度报告** | [coordinator.go:205](file:///d:/claude/nomad/drivers/docker/coordinator.go#L205) | `imageProgressManager` 处理流式进度，触发 `Downloading image` 事件 |
| **可恢复错误** | [coordinator.go:213](file:///d:/claude/nomad/drivers/docker/coordinator.go#L213) | 拉取失败返回 `recoverablePullError`，Nomad 会重试 |

### Docker 镜像配置字段

| 字段 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `image` | string | — | 镜像名（必填），如 `nginx:1.21` |
| `image_pull_timeout` | string | `5m` | 拉取超时 |
| `force_pull` | bool | false | 强制拉取，忽略本地缓存 |
| `load_image` | string | — | 从本地 tar 文件加载镜像（替代拉取） |
| `auth.config` | string | — | Docker auth JSON 文件路径 |
| `auth.helper` | string | — | credential helper（如 `docker-credential-aws`） |
| `auth.soft_fail` | bool | false | 认证失败时降级为匿名拉取 |

---

## 三、两者的对比与关系

| 维度 | 制品下载（Artifact） | Docker 镜像下载 |
|------|---------------------|----------------|
| **job.nomad 配置** | `artifact { source = "..." }` | `config { image = "..." }` |
| **执行阶段** | TaskRunner **Prestart Hook**（task 启动前） | Driver **StartTask**（task 启动时） |
| **执行组件** | `artifactHook` + `getter.Sandbox` | `docker.Driver` + `dockerCoordinator` |
| **底层库** | [go-getter](https://github.com/hashicorp/go-getter) | Docker Registry API（moby/client） |
| **支持的源** | HTTP/HTTPS/Git/S3/GCS/Hg/文件 | Docker Registry（Docker Hub/私有仓库） |
| **目标位置** | task 的 `local/` 或 `alloc/` 目录 | Docker daemon 本地镜像存储 |
| **并发模型** | 3 个 worker 并发下载多个 artifact | 相同镜像去重，多 alloc 共享一次拉取 |
| **隔离性** | 子进程沙箱（`artifact-isolation`） | 直接调用 Docker API |
| **失败重试** | `RecoverableError` → task 重试 | `recoverablePullError` → task 重试 |
| **GC 机制** | 无（随 alloc 目录清理） | 引用计数 + 延迟删除（`gc.image_delay`） |

---

## 四、完整执行时序

```
nomad job run web.nomad
    │
    │ ① 提交到 Server
    ▼
Server 调度 → 分配到 Client 节点
    │
    │ ② Client 接收 allocation
    ▼
allocrunner 启动 → 为每个 task 创建 TaskRunner
    │
    │ ③ TaskRunner.prestart() 运行所有 Prestart Hooks
    │   ├── taskDirHook（创建目录）
    │   ├── identityHook（生成 token）
    │   ├── consulHook / vaultHook（获取凭据）
    │   ├── dispatchHook
    │   ├── volumeHook（挂载卷）
    │   ├── ★ artifactHook（下载 artifact 块定义的制品）◀── 制品下载在这里
    │   ├── deviceHook
    │   ├── templateHook（渲染模板）
    │   └── serviceHook（注册服务）
    │
    │ ④ prestart 完成 → 调用 driver.StartTask()
    ▼
docker.Driver.StartTask()
    │   ├── createImage()
    │   │   ├── 检查本地镜像 / load_image
    │   │   └── ★ pullImage() → coordinator.PullImage() ◀── Docker 镜像下载在这里
    │   ├── createContainerConfig()
    │   └── client.ContainerCreate() + ContainerStart()
    │
    │ ⑤ Task 运行
    ▼
poststart hooks（服务注册等）
```

### 时序说明

1. **制品下载** 和 **Docker 镜像下载** 是**两个完全独立的机制**，分别由不同组件处理：
   - 制品下载：`artifactHook`（Prestart 阶段）+ go-getter
   - Docker 镜像：`docker.Driver.StartTask`（StartTask 阶段）+ Docker API

2. **都不是 CLI 命令完成的**。CLI 的 `nomad job run` 只负责提交 job spec 到 Server，实际的下载发生在 **Client 节点的 TaskRunner 生命周期**中：
   - `nomad job run` → HTTP API `PUT /v1/jobs` → Server 调度 → Client 执行

3. **执行顺序**：制品下载（Prestart）**先于** Docker 镜像拉取（StartTask）。这意味着 artifact 下载完成后，才进入 driver 启动阶段拉取镜像。

4. **一个 task 可以同时有两者**：先下载 artifact 文件到 `local/`，再拉取 docker 镜像启动容器，容器内可以访问已下载的 artifact。

---

## 五、Prestart Hook 链完整列表

制品下载是 TaskRunner Prestart 阶段的一个 hook，完整的 prestart hook 链如下（来自 [task_runner_hooks.go:53](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go#L53)）：

| 顺序 | Hook 名称 | 作用 |
|------|----------|------|
| 1 | `validateHook` | 校验 task 配置 |
| 2 | `dynamicUsersHook` | 动态用户管理 |
| 3 | `taskDirHook` | 创建 task 目录（必须最先运行） |
| 4 | `identityHook` | 生成 workload identity token |
| 5 | `consulHook` | Consul token 获取 |
| 6 | `vaultHook`（可选） | Vault token 获取 |
| 7 | `secretsHook`（可选） | Secrets 渲染 |
| 8 | `logMonHook` | 日志监控启动 |
| 9 | `dispatchHook` | 派发任务参数处理 |
| 10 | `volumeHook` | 卷挂载 |
| 11 | **`artifactHook`** | **制品下载** |
| 12 | `statsHook` | 统计收集 |
| 13 | `deviceHook` | 设备分配 |
| 14 | `apiHook` | API endpoint 注册 |
| 15 | `wranglerHook` | Wrangler 初始化 |
| 16 | `csiPluginSupervisorHook`（可选） | CSI 插件管理 |
| 17 | `templateHook`（可选） | 模板渲染 |
| 18 | `serviceHook` | 服务注册 |
| 19 | `sidsHook`（可选） | Service Identity token |
| 20 | `connectNativeHook`（可选） | Connect Native 配置 |
| 21 | `connectSidecarHook`（可选） | Connect Sidecar 配置 |

**注意**：`artifactHook` 位于第 11 位，在目录创建、认证获取之后，但在模板渲染和服务注册之前。这确保了 artifact 下载完成后的文件可以被模板渲染使用。

---

## 六、源码位置索引

### 制品下载相关文件

| 文件 | 作用 |
|------|------|
| [client/allocrunner/taskrunner/artifact_hook.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/artifact_hook.go) | artifactHook 实现，Prestart 阶段触发 |
| [client/allocrunner/taskrunner/getter/sandbox.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/sandbox.go) | Sandbox.Get() 构建下载参数 |
| [client/allocrunner/taskrunner/getter/util.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/util.go) | Sandbox.runCmd() 启动隔离子进程 |
| [client/allocrunner/taskrunner/getter/z_getter_cmd.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/z_getter_cmd.go) | 子进程入口定义（`artifact-isolation`） |
| [client/allocrunner/taskrunner/getter/params.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/params.go) | 下载参数结构 |
| [nomad/structs/config/artifact.go](file:///d:/claude/nomad/nomad/structs/config/artifact.go) | ArtifactConfig（agent 级配置） |
| [api/tasks.go](file:///d:/claude/nomad/api/tasks.go) | TaskArtifact 结构定义 |

### Docker 镜像下载相关文件

| 文件 | 作用 |
|------|------|
| [drivers/docker/driver.go](file:///d:/claude/nomad/drivers/docker/driver.go) | Driver.StartTask() + createImage() + pullImage() |
| [drivers/docker/coordinator.go](file:///d:/claude/nomad/drivers/docker/coordinator.go) | dockerCoordinator.PullImage() + pullImageImpl() |
| [drivers/docker/config.go](file:///d:/claude/nomad/drivers/docker/config.go) | DriverConfig + TaskConfig（含 image_pull_timeout 等） |
| [drivers/docker/network.go](file:///d:/claude/nomad/drivers/docker/network.go) | pullInfraImage()（infra 镜像拉取） |

### TaskRunner 调度相关文件

| 文件 | 作用 |
|------|------|
| [client/allocrunner/taskrunner/task_runner.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner.go) | TaskRunner.Run() 主循环，调用 prestart() 和 driver.StartTask() |
| [client/allocrunner/taskrunner/task_runner_hooks.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/task_runner_hooks.go) | initHooks() 注册所有 hook + prestart() 执行 prestart hooks |

---

## 七、配置示例

### 同时使用 artifact 和 docker 镜像的 job

```hcl
job "web-app" {
  datacenters = ["dc1"]

  group "web" {
    task "server" {
      # ① 制品下载：在 Prestart 阶段执行
      artifact {
        source      = "https://github.com/myorg/config/archive/main.zip"
        destination = "local/config"
      }

      artifact {
        source      = "s3::https://s3.amazonaws.com/mybucket/static-assets.tar.gz"
        destination = "local/assets"
      }

      # ② Docker 镜像：在 StartTask 阶段执行
      driver = "docker"
      config {
        image              = "nginx:1.21"
        image_pull_timeout = "10m"
        force_pull         = false

        # 容器内可访问已下载的 artifact
        volumes = [
          "local/config:/etc/nginx/conf.d",
          "local/assets:/usr/share/nginx/html"
        ]
      }

      resources {
        cpu    = 500
        memory = 256
      }
    }
  }
}
```

### 执行顺序

1. `nomad job run` 提交到 Server
2. Server 调度，Client 接收 allocation
3. TaskRunner 启动，创建 task 目录
4. **Prestart 阶段**：
   - `artifactHook` 下载 config zip 和 static-assets tar.gz 到 `local/`
5. **StartTask 阶段**：
   - `docker.Driver.createImage()` 检查/拉取 `nginx:1.21` 镜像
6. 创建容器并挂载 `local/config` 和 `local/assets`
7. 启动容器，nginx 使用下载的配置和静态资源

---

## 八、总结

| 问题 | 答案 |
|------|------|
| **制品下载在哪个命令完成？** | 不是 CLI 命令，是 TaskRunner 的 `artifactHook.Prestart()` |
| **Docker 镜像下载在哪个命令完成？** | 不是 CLI 命令，是 `docker.Driver.StartTask()` → `createImage()` → `pullImage()` |
| **两者执行顺序？** | 制品下载（Prestart）先于 Docker 镜像拉取（StartTask） |
| **CLI 命令的作用？** | `nomad job run` 仅提交 job spec 到 Server，实际下载在 Client 执行 |
| **底层库？** | 制品用 go-getter，Docker 镜像用 moby/client Docker API |
