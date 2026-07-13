# Nomad Deployment 命令组调用链分析

本文档分析 `command/` 目录中 Deployment 命令组的每个子命令，列出其作用、CLI 调用格式、调用的 Nomad API 及内部辅助函数。

## 命令组结构

Deployment 命令组通过 [commands.go:341-380](file:///d:/claude/nomad/command/commands.go#L341-L380) 注册，包含以下 8 个子命令：

```
nomad deployment
├── fail        # 标记 deployment 为失败
├── list        # 列出所有 deployments
├── pause       # 暂停 deployment
├── promote     # 提升 canary allocations
├── resume      # 恢复已暂停的 deployment
├── status      # 查看 deployment 状态
└── unblock     # 解除 multiregion 阻塞的 deployment
```

## 公共辅助组件

| 组件 | 文件 | 说明 |
|------|------|------|
| `Meta` | [meta.go](file:///d:/claude/nomad/command/meta.go) | 提供 `Client()`、`FlagSet()`、`Colorize()`、`showUIPath()` 等通用方法 |
| `getDeployment` | [deployment_status.go:555](file:///d:/claude/nomad/command/deployment_status.go#L555) | 通过完整 UUID 或前缀解析 deployment，支持多匹配错误返回 |
| `formatDeployments` | [deployment_list.go:127](file:///d:/claude/nomad/command/deployment_list.go#L127) | 以表格格式输出 deployment 列表 |
| `formatDeployment` | [deployment_status.go:628](file:///d:/claude/nomad/command/deployment_status.go#L628) | 输出单个 deployment 详情，含 multiregion/task groups |
| `formatDeploymentGroups` | [deployment_status.go:690](file:///d:/claude/nomad/command/deployment_status.go#L690) | 格式化 task group 部署状态（canary/healthy/placed 等） |
| `fetchMultiRegionDeployments` | [deployment_status.go:599](file:///d:/claude/nomad/command/deployment_status.go#L599) | 并行查询所有 region 的 deployment 状态 |
| `fetchRegionDeployment` | [deployment_status.go:655](file:///d:/claude/nomad/command/deployment_status.go#L655) | 查询指定 region 的 deployment |
| `formatMultiregionDeployment` | [deployment_status.go:672](file:///d:/claude/nomad/command/deployment_status.go#L672) | 格式化 multiregion deployment 表格 |
| `hasAutoRevert` | [deployment_status.go:732](file:///d:/claude/nomad/command/deployment_status.go#L732) | 判断 deployment 是否配置了 auto-revert |
| `newMonitor` | [monitor.go](file:///d:/claude/nomad/command/monitor.go) | 创建 evaluation 监控器，跟踪 eval 状态变化 |
| `Format` | [format.go](file:///d:/claude/nomad/command/format.go) | 通用 JSON/Go template 格式化输出 |

## 命令调用链总表

| 命令 | 文件 | 调用的 Nomad API | 关键辅助调用 |
|------|------|------------------|-------------|
| `deployment` | [deployment.go](file:///d:/claude/nomad/command/deployment.go) | 无（仅显示帮助） | `cli.RunResultHelp` |
| `deployment fail` | [deployment_fail.go](file:///d:/claude/nomad/command/deployment_fail.go) | `Deployments().Fail` | `getDeployment`、`formatDeployments`（多匹配时）、`newMonitor.monitor` |
| `deployment list` | [deployment_list.go](file:///d:/claude/nomad/command/deployment_list.go) | `Deployments().List` | `formatDeployments`、`Format`（-json/-t） |
| `deployment pause` | [deployment_pause.go](file:///d:/claude/nomad/command/deployment_pause.go) | `Deployments().Pause(id, true, ...)` | `getDeployment`、`formatDeployments`（多匹配时） |
| `deployment promote` | [deployment_promote.go](file:///d:/claude/nomad/command/deployment_promote.go) | `Deployments().PromoteAll` 或 `Deployments().PromoteGroups` | `getDeployment`、`formatDeployments`（多匹配时）、`newMonitor.monitor` |
| `deployment resume` | [deployment_resume.go](file:///d:/claude/nomad/command/deployment_resume.go) | `Deployments().Pause(id, false, ...)` | `getDeployment`、`formatDeployments`（多匹配时）、`newMonitor.monitor` |
| `deployment status` | [deployment_status.go](file:///d:/claude/nomad/command/deployment_status.go) | `Deployments().List`（无参数时）、`Deployments().Info`、`Deployments().Allocations`（verbose）、`Jobs().LatestDeployment`（auto-revert 回滚监控）、`Jobs().Info`、`Jobs().Deployments`（multiregion 各 region） | `getDeployment`、`formatDeployments`、`formatDeployment`、`fetchMultiRegionDeployments`、`fetchRegionDeployment`、`hasAutoRevert`、`monitor`（tty/default）、`Format`、`showUIPath` |
| `deployment unblock` | [deployment_unblock.go](file:///d:/claude/nomad/command/deployment_unblock.go) | `Deployments().Unblock` | `getDeployment`、`formatDeployments`（多匹配时）、`newMonitor.monitor` |

## 详细调用链

### 1. `deployment`

仅显示帮助信息，不执行任何操作。

```
DeploymentCommand.Run
└── cli.RunResultHelp                              # 返回帮助退出码
```

### 2. `deployment fail`

标记 deployment 为失败。若 job 配置了 `auto_revert`，Nomad 会自动回滚到上一个稳定版本。

```
DeploymentFailCommand.Run
├── Meta.Client                                    # 获取 API client
├── getDeployment(client.Deployments(), dID)       # 前缀解析 deployment ID
│   ├── (if len==36) Deployments().Info            # 完整 UUID 直接查询
│   └── (else) Deployments().PrefixList            # 前缀匹配
├── formatDeployments(possible, length)            # 多匹配时显示列表
├── Deployments().Fail(deploy.ID, nil)             # 标记失败
└── if u.EvalID != "" && !detach:
    └── newMonitor.monitor(u.EvalID)               # 监控 eval
└── if u.RevertedJobVersion != nil:
    └── 输出 "Auto-reverted to job version X"
```

### 3. `deployment list`

列出 Nomad 跟踪的所有 deployments。

```
DeploymentListCommand.Run
├── Meta.Client
├── Deployments().List(&QueryOptions{Filter: filter})  # 支持过滤
├── if -json 或 -t:
│   └── Format(json, tmpl, deploys)                # JSON/template 输出
└── else:
    └── formatDeployments(deploys, length)         # 表格输出
```

### 4. `deployment pause`

暂停 deployment，停止新 allocation 的放置（rolling deployment 期间）。

```
DeploymentPauseCommand.Run
├── Meta.Client
├── getDeployment(client.Deployments(), dID)       # 前缀解析
│   ├── Deployments().Info                         # 完整 UUID
│   └── Deployments().PrefixList                   # 前缀
├── formatDeployments(possible, length)            # 多匹配
└── Deployments().Pause(deploy.ID, true, nil)      # 第二参数 true=暂停
```

### 5. `deployment promote`

提升 deployment 中的 canary allocations，触发剩余 allocation 的滚动升级。

```
DeploymentPromoteCommand.Run
├── Meta.Client
├── getDeployment(client.Deployments(), dID)       # 前缀解析
│   ├── Deployments().Info
│   └── Deployments().PrefixList
├── formatDeployments(possible, length)            # 多匹配
├── if len(groups) == 0:
│   └── Deployments().PromoteAll(deploy.ID, nil)   # 提升所有 groups
└── else:
    └── Deployments().PromoteGroups(deploy.ID, groups, nil)  # 提升指定 groups
└── if u.EvalID != "" && !detach:
    └── newMonitor.monitor(u.EvalID)               # 监控 eval
```

### 6. `deployment resume`

恢复已暂停的 deployment，继续 placement。内部调用 `Pause(id, false, ...)`。

```
DeploymentResumeCommand.Run
├── Meta.Client
├── getDeployment(client.Deployments(), dID)       # 前缀解析
│   ├── Deployments().Info
│   └── Deployments().PrefixList
├── formatDeployments(possible, length)            # 多匹配
├── Deployments().Pause(deploy.ID, false, nil)     # 第二参数 false=恢复
└── if u.EvalID != "" && !detach:
    └── newMonitor.monitor(u.EvalID)               # 监控 eval
```

### 7. `deployment status`

显示 deployment 的详细状态。支持 monitor 模式实时跟踪、JSON/template 输出、UI 跳转、auto-revert 回滚监控。

```
DeploymentStatusCommand.Run
├── Meta.Client
├── if len(args) == 0:
│   └── Deployments().List(nil)                    # 无参数时列出所有
│       └── formatDeployments
├── getDeployment(client.Deployments(), dID)       # 前缀解析
│   ├── Deployments().Info
│   └── Deployments().PrefixList
├── if -json 或 -t:
│   └── Format(json, tmpl, deploy)                 # JSON/template 输出
├── if -monitor:
│   ├── Deployments().Info(deploy.ID, nil)         # 获取初始 meta.LastIndex
│   ├── c.monitor(client, deploy.ID, index, wait, verbose)
│   │   ├── if isStdoutTerminal() (非 Windows + tty):
│   │   │   └── c.ttyMonitor                        # 使用 glint 渲染
│   │   │       ├── Deployments().Info (循环 + retry)
│   │   │       ├── (verbose) Deployments().Allocations
│   │   │       └── if Failed && hasAutoRevert:
│   │   │           ├── Jobs().LatestDeployment    # 获取回滚 deployment
│   │   │           └── c.ttyMonitor(rollback.ID)  # 递归监控回滚
│   │   └── else (Windows 或非 tty):
│   │       └── c.defaultMonitor                    # 使用 uilive 渲染
│   │           ├── Deployments().Info (循环)
│   │           ├── (verbose) Deployments().Allocations
│   │           └── if Failed && hasAutoRevert:
│   │               ├── Jobs().LatestDeployment
│   │               └── c.defaultMonitor(rollback.ID)
│   └── showUIPath (UIHintContext{Command: "deployment status", ...})
└── else (默认输出):
    ├── formatDeployment(client, deploy, length)
    │   ├── formatKV (基本信息)
    │   ├── if d.IsMultiregion:
    │   │   └── fetchMultiRegionDeployments(client, d)
    │   │       ├── Jobs().Info(d.JobID)            # 获取 multiregion 配置
    │   │       └── 并发 goroutines (每 region 一个):
    │   │           └── fetchRegionDeployment
    │   │               └── Jobs().Deployments(d.JobID, false, {Region: region.Name})
    │   │       └── formatMultiregionDeployment
    │   └── formatDeploymentGroups (task groups 表格)
    └── showUIPath (UIHintContext{Command: "deployment status", ...})
```

### 8. `deployment unblock`

解除 multiregion deployment 的阻塞状态（在等待其他 region 完成时）。

```
DeploymentUnblockCommand.Run
├── Meta.Client
├── getDeployment(client.Deployments(), dID)       # 前缀解析
│   ├── Deployments().Info
│   └── Deployments().PrefixList
├── formatDeployments(possible, length)            # 多匹配
├── Deployments().Unblock(deploy.ID, nil)          # 解除阻塞
└── if u.EvalID != "" && !detach:
    └── newMonitor.monitor(u.EvalID)               # 监控 eval
```

## API 调用频次统计

| API 方法 | 调用命令数 | 调用命令 |
|---------|-----------|---------|
| `Deployments().Info` | 7 | fail, pause, promote, resume, status（直接 + monitor 循环 + ttyMonitor + defaultMonitor）, unblock, （list 不调用） |
| `Deployments().PrefixList` | 6 | fail, pause, promote, resume, status（via getDeployment）, unblock |
| `Deployments().Fail` | 1 | fail |
| `Deployments().List` | 2 | list, status（无参数时） |
| `Deployments().Pause` | 2 | pause（true）, resume（false） |
| `Deployments().PromoteAll` / `PromoteGroups` | 1 | promote |
| `Deployments().Unblock` | 1 | unblock |
| `Deployments().Allocations` | 1 | status（verbose monitor 模式） |
| `Jobs().Info` | 1 | status（multiregion 查询） |
| `Jobs().Deployments` | 1 | status（每 region 查询） |
| `Jobs().LatestDeployment` | 1 | status（auto-revert 回滚监控） |
| `Search().PrefixSearch` | 6 | 所有带 AutocompleteArgs 的命令（fail, pause, promote, resume, status, unblock） |

## 命令分类

### 写入操作（修改 deployment 状态）
| 命令 | 主要 API | ACL 能力 | 默认行为 |
|------|---------|---------|---------|
| `deployment fail` | `Deployments().Fail` | submit-job / fail-deployment + read-job | 监控 eval（除非 -detach） |
| `deployment pause` | `Deployments().Pause(id, true)` | submit-job / pause-deployment + read-job | 仅输出确认 |
| `deployment promote` | `Deployments().PromoteAll/Groups` | submit-job / promote-deployment + read-job | 监控 eval（除非 -detach） |
| `deployment resume` | `Deployments().Pause(id, false)` | submit-job / pause-deployment + read-job | 监控 eval（除非 -detach） |
| `deployment unblock` | `Deployments().Unblock` | submit-job / unblock-deployment + read-job | 监控 eval（除非 -detach） |

### 只读操作
| 命令 | 主要 API | ACL 能力 | 特殊功能 |
|------|---------|---------|---------|
| `deployment list` | `Deployments().List` | read-job | 支持 -json / -filter / -t |
| `deployment status` | `Deployments().Info` | read-job | 支持 -monitor（实时刷新）、-json/-t、-ui（浏览器跳转）、auto-revert 回滚监控、multiregion 并行查询 |

### 帮助命令
| 命令 | 说明 |
|------|------|
| `deployment` | 仅显示帮助，列出所有子命令用法 |

## 关键设计模式

### 1. 统一的前缀解析
所有需要 deployment ID 的命令都调用 `getDeployment(client.Deployments(), dID)`：
- 完整 UUID（36 字符）：直接 `Info()` 查询
- 短前缀：`PrefixList()` 查询，单匹配返回，多匹配报错并展示候选列表

### 2. 监控模式
写操作命令（fail、promote、resume、unblock）默认调用 `newMonitor.monitor(EvalID)` 跟踪 evaluation，可用 `-detach` 跳过。`deployment pause` 是例外，仅输出确认信息。

### 3. 双渲染引擎（status 命令）
`deployment status -monitor` 根据运行环境选择不同渲染器：
- **ttyMonitor**（非 Windows + tty）：使用 `glint` 库，支持 spinner 和原地刷新
- **defaultMonitor**（Windows 或非 tty）：使用 `uilive` 库，兼容性更好

### 4. Auto-revert 回滚监控
`deployment status -monitor` 检测到 deployment 失败且 job 配置了 `auto_revert` 时：
1. 等待 1 秒让回滚 deployment 启动
2. 调用 `Jobs().LatestDeployment` 获取回滚 deployment
3. 递归监控回滚 deployment 的状态

### 5. Multiregion 并行查询
`formatDeployment` 检测到 `d.IsMultiregion` 时：
1. 调用 `Jobs().Info` 获取 job 的 multiregion 配置
2. 为每个 region 启动 goroutine 并行查询
3. 每个 region 通过 `Jobs().Deployments(jobID, false, {Region: name})` 查询
4. 通过 channel 收集结果，匹配相同 `JobVersion` 的 deployment

### 6. Pause/Resume 复用 API
`deployment pause` 和 `deployment resume` 都调用 `Deployments().Pause(id, bool, nil)`，通过第二参数区分暂停/恢复，避免重复 API。

### 7. UI 跳转提示
`deployment status` 在输出末尾调用 `Meta.showUIPath()`，若配置了 Nomad UI 地址则提示用户可在浏览器查看，使用 `-ui` 标志可直接打开。

### 8. 重试机制
`ttyMonitor` 在查询 `Deployments().Info` 失败时使用指数退避重试（最多 10 次，base=1s，max=12s），增强网络抖动下的鲁棒性。
