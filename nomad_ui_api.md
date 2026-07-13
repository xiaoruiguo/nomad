# Nomad UI API 调用分析

本文档分析 `ui/app` 目录下各个功能模块文件，并按模块列出它们所调用的 Nomad API。Nomad UI 基于 Ember.js 构建，所有 API 调用通过 Ember Data 的 RESTAdapter 派生类（位于 `ui/app/adapters/`）以及 `token` service 的 `authorizedRequest` / `authorizedRawRequest` 方法发起。

## 基础架构

### [ui/app/adapters/application.js](file:///d:/claude/nomad/ui/app/adapters/application.js)

所有 adapter 的基类，继承自 Ember Data 的 `RESTAdapter`，负责：

- **namespace**: 固定为 `v1`，所有请求路径以 `/v1/` 开头
- **headers**: 通过 `token.secret` 自动附加 `X-Nomad-Token` 请求头
- **region**: 当 `system.shouldIncludeRegion` 为 true 时自动追加 `region=` 查询参数
- **错误处理**: 当响应为 `500` 且 payload 为 `"no leader"` 时返回 `NoLeaderError`
- **urlForFindRecord**: 通用 URL 构造，形如 `/v1/{modelName}/{id}`

### [ui/app/adapters/watchable.js](file:///d:/claude/nomad/ui/app/adapters/watchable.js)

支持长轮询（blocking query）的基类，通过 `index` 查询参数实现变更监听，并基于 `X-Nomad-Index` 响应头推进 index。提供：

- `findAll` / `findRecord` / `query` 重载，支持 `adapterOptions.watch`
- `reloadRelationship` 重新加载关联资源
- `handleResponse` 自动缓存 `X-Nomad-Index`

### [ui/app/adapters/watchable-namespace-ids.js](file:///d:/claude/nomad/ui/app/adapters/watchable-namespace-ids.js)

支持命名空间的基类，ID 为 `JSON.stringify([name, namespace])` 形式，自动追加 `?namespace=` 查询参数。

---

## 按功能模块分类的 API 调用

### 1. Job 模块

#### [ui/app/adapters/job.js](file:///d:/claude/nomad/ui/app/adapters/job.js)

Job 模块的核心 adapter，调用以下 Nomad API：

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` (继承) | GET | `/v1/jobs` | 获取所有 Job 列表 |
| `findRecord` | GET | `/v1/job/{id}?namespace={ns}` | 获取单个 Job 详情 |
| `query` | GET / POST | `/v1/jobs/statuses` | 批量查询 Job 状态（支持 `index`、`namespace=*`） |
| `run` | POST | `/v1/jobs` | 提交新 Job（含 `Job` 与 `Submission`） |
| `update` | POST | `/v1/job/{id}?namespace={ns}` | 更新已存在的 Job |
| `stop` | DELETE | `/v1/job/{id}?namespace={ns}` | 停止 Job |
| `purge` | DELETE | `/v1/job/{id}?namespace={ns}&purge=true` | 停止并清理 Job |
| `parse` | POST | `/v1/jobs/parse?namespace=*` | 解析 HCL/JSON Job 规范 |
| `plan` | POST | `/v1/job/{id}/plan?namespace={ns}` | 规划 Job（Dry-run） |
| `scale` | POST | `/v1/job/{id}/scale?namespace={ns}` | 缩放 Job 任务组 |
| `dispatch` | POST | `/v1/job/{id}/dispatch?namespace={ns}` | 触发参数化 Job 实例 |
| `forcePeriodic` | POST | `/v1/job/{id}/periodic/force?namespace={ns}` | 强制触发周期性 Job |
| `fetchRawDefinition` | GET | `/v1/job/{id}?namespace={ns}` 或 `/v1/job/{id}/versions?namespace={ns}` | 获取 Job 的 JSON 定义 |
| `fetchRawSpecification` | GET | `/v1/job/{id}/submission?version={v}` | 获取 Job 的原始 HCL/JSON 提交内容 |
| `getVersions` | GET | `/v1/job/{id}/versions?namespace={ns}&diffs=true[&diff_version={v}]` | 获取 Job 历史版本及差异 |
| `getActionSocketUrl` | WS | `ws(s)://host/v1/job/{id}/action?namespace={ns}&action={a}&allocID={aid}&task={t}&tty=true` | Actions WebSocket 连接 |

#### [ui/app/adapters/job-summary.js](file:///d:/claude/nomad/ui/app/adapters/job-summary.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findRecord` | GET | `/v1/job/{id}/summary?namespace={ns}` | 获取 Job 的 Summary 信息 |

#### [ui/app/adapters/job-scale.js](file:///d:/claude/nomad/ui/app/adapters/job-scale.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findRecord` | GET | `/v1/job/{id}/scale?namespace={ns}` | 获取 Job 的 Scale 状态 |

#### [ui/app/adapters/job-version.js](file:///d:/claude/nomad/ui/app/adapters/job-version.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `revertTo` | POST | `/v1/job/{id}/revert?namespace={ns}` | 将 Job 回滚到指定版本 |

#### [ui/app/adapters/version-tag.js](file:///d:/claude/nomad/ui/app/adapters/version-tag.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `createRecord` | POST | `/v1/job/{jobName}/versions/{tagName}/tag?namespace={ns}` | 为 Job 版本打标签 |
| `deleteTag` | DELETE | `/v1/job/{jobName}/versions/{tagName}/tag?namespace={ns}` | 删除 Job 版本标签 |

---

### 2. Allocation 模块

#### [ui/app/adapters/allocation.js](file:///d:/claude/nomad/ui/app/adapters/allocation.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` (继承) | GET | `/v1/allocations` | 获取所有 Allocation 列表 |
| `findRecord` | GET | `/v1/allocation/{id}` | 获取单个 Allocation 详情 |
| `stop` | POST | `/v1/allocation/{id}/stop` | 停止 Allocation |
| `restart` | PUT | `/v1/client/allocation/{id}/restart` | 重启 Allocation 中的任务 |
| `restartAll` | PUT | `/v1/client/allocation/{id}/restart` | 重启 Allocation 中的所有任务（`AllTasks: true`） |
| `forcePause` | PUT | `/v1/client/allocation/{id}/pause` | 强制暂停任务（`ScheduleState: pause`） |
| `forceRun` | PUT | `/v1/client/allocation/{id}/pause` | 强制运行任务（`ScheduleState: run`） |
| `reEnableSchedule` | PUT | `/v1/client/allocation/{id}/pause` | 恢复任务调度（`ScheduleState: scheduled`） |
| `ls` | GET | `/v1/client/fs/ls/{id}?path={path}` | 列出 Allocation 文件系统目录 |
| `stat` | GET | `/v1/client/fs/stat/{id}?path={path}` | 获取 Allocation 文件系统信息 |
| `check` | GET | `/v1/client/allocation/{id}/checks` | 获取 Allocation 的健康检查 |

#### [ui/app/utils/classes/allocation-stats-tracker.js](file:///d:/claude/nomad/ui/app/utils/classes/allocation-stats-tracker.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| 轮询 | GET | `/v1/client/allocation/{id}/stats` | 获取 Allocation 资源使用统计（CPU/内存） |

#### [ui/app/components/fs/file.js](file:///d:/claude/nomad/ui/app/components/fs/file.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| 下载 | GET | `/v1/client/fs/cat/{allocId}?path={path}` | 读取文件完整内容 |
| 读取 | GET | `/v1/client/fs/readat/{allocId}?path={path}` | 按偏移读取大文件 |
| 流式 | GET (stream) | `/v1/client/fs/stream/{allocId}?path={path}` | 流式读取文件 |

#### [ui/app/components/task-log.js](file:///d:/claude/nomad/ui/app/components/task-log.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| 日志 | GET (stream) | `/v1/client/fs/logs/{allocId}?task={t}&type={mode}` | 流式获取任务日志（stdout/stderr） |

---

### 3. Node 模块

#### [ui/app/adapters/node.js](file:///d:/claude/nomad/ui/app/adapters/node.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` (继承) | GET | `/v1/nodes` | 获取所有 Node 列表 |
| `findRecord` | GET | `/v1/node/{id}` | 获取单个 Node 详情 |
| `setEligible` | POST | `/v1/node/{id}/eligibility` | 设置 Node 为 eligible |
| `setIneligible` | POST | `/v1/node/{id}/eligibility` | 设置 Node 为 ineligible |
| `drain` | POST | `/v1/node/{id}/drain` | 排空 Node（含 DrainSpec） |
| `forceDrain` | POST | `/v1/node/{id}/drain` | 强制排空 Node（Deadline=-1） |
| `cancelDrain` | POST | `/v1/node/{id}/drain` | 取消排空（DrainSpec=null） |
| `addMeta` | POST | `/v1/client/metadata?node_id={id}` | 添加/更新 Node 元数据 |

#### [ui/app/utils/classes/node-stats-tracker.js](file:///d:/claude/nomad/ui/app/utils/classes/node-stats-tracker.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| 轮询 | GET | `/v1/client/stats?node_id={id}` | 获取 Node 资源使用统计 |

---

### 4. Node Pool 模块

#### [ui/app/adapters/node-pool.js](file:///d:/claude/nomad/ui/app/adapters/node-pool.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` | GET | `/v1/node/pools` | 获取所有 Node Pool 列表 |

---

### 5. Deployment 模块

#### [ui/app/adapters/deployment.js](file:///d:/claude/nomad/ui/app/adapters/deployment.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` (继承) | GET | `/v1/deployments` | 获取所有 Deployment 列表 |
| `findRecord` | GET | `/v1/deployment/{id}` | 获取单个 Deployment 详情 |
| `fail` | POST | `/v1/deployment/fail/{id}` | 标记 Deployment 失败 |
| `promote` | POST | `/v1/deployment/promote/{id}` | 提升 Deployment 中的 Canary 实例 |

> 注：Deployment 的 action 端点为 `/v1/deployment/{action}/{id}` 形式，而非典型的 `/{id}/{action}`。

---

### 6. Evaluation 模块

#### [ui/app/adapters/evaluation.js](file:///d:/claude/nomad/ui/app/adapters/evaluation.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` (继承) | GET | `/v1/evaluations` | 获取所有 Evaluation 列表 |
| `findRecord` | GET | `/v1/evaluation/{id}?namespace={ns}[&related=true]` | 获取单个 Evaluation 详情（支持 `related=true`） |

---

### 7. Volume 模块

#### [ui/app/adapters/volume.js](file:///d:/claude/nomad/ui/app/adapters/volume.js)

CSI Volume adapter，ID 以 `csi/` 前缀存储。

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` | GET | `/v1/volumes?type={type}[&plugin_id={pid}]` | 获取 CSI Volume 列表 |
| `findRecord` | GET | `/v1/volume/csi/{id}` | 获取单个 CSI Volume 详情 |

#### [ui/app/adapters/dynamic-host-volume.js](file:///d:/claude/nomad/ui/app/adapters/dynamic-host-volume.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` | GET | `/v1/volumes` | 获取所有 Host Volume 列表 |
| `findRecord` | GET | `/v1/volume/host/{id}[?namespace={ns}]` | 获取单个 Host Volume 详情 |

---

### 8. Plugin 模块（CSI Plugin）

#### [ui/app/adapters/plugin.js](file:///d:/claude/nomad/ui/app/adapters/plugin.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` | GET | `/v1/plugins?type={type}` | 获取 CSI Plugin 列表 |
| `findRecord` | GET | `/v1/plugin/csi/{id}` | 获取单个 CSI Plugin 详情 |

---

### 9. Service 模块

#### [ui/app/adapters/service.js](file:///d:/claude/nomad/ui/app/adapters/service.js)

无自定义方法，使用默认 REST 行为：

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` | GET | `/v1/services` | 获取所有 Service 列表 |
| `findRecord` | GET | `/v1/service/{id}` | 获取单个 Service 详情 |

---

### 10. Namespace 模块

#### [ui/app/adapters/namespace.js](file:///d:/claude/nomad/ui/app/adapters/namespace.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` (继承) | GET | `/v1/namespaces` | 获取所有 Namespace 列表 |
| `findRecord` | GET | `/v1/namespace/{id}` | 获取单个 Namespace 详情 |
| `createRecord` | POST | `/v1/namespace/{name}` | 创建 Namespace |
| `deleteRecord` | DELETE | `/v1/namespace/{id}` | 删除 Namespace |

---

### 11. Agent 模块

#### [ui/app/adapters/agent.js](file:///d:/claude/nomad/ui/app/adapters/agent.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` / `findRecord` | GET | `/v1/agent/members` | 获取 Agent 成员列表 |

#### [ui/app/components/agent-monitor.js](file:///d:/claude/nomad/ui/app/components/agent-monitor.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| 流式 | GET (stream) | `/v1/agent/monitor?log_level={l}&server_id={sid}\|client_id={cid}[&region={r}]` | 流式获取 Agent 监控日志 |

---

### 12. ACL Token 模块

#### [ui/app/adapters/token.js](file:///d:/claude/nomad/ui/app/adapters/token.js)

namespace 前缀为 `/v1/acl`。

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` | GET | `/v1/acl/tokens` | 获取所有 ACL Token 列表 |
| `findRecord` | GET | `/v1/acl/token/{id}` | 获取单个 ACL Token 详情 |
| `createRecord` | POST | `/v1/acl/token` | 创建 ACL Token |
| `updateRecord` | POST | `/v1/acl/token/{id}` | 更新 ACL Token（注意 POST 而非 PUT） |
| `deleteRecord` | DELETE | `/v1/acl/token/{id}` | 删除 ACL Token |
| `findSelf` | GET | `/v1/acl/token/self` | 获取当前 Token 信息 |
| `loginJWT` | POST | `/v1/acl/login` | JWT 登录获取 Token |
| `exchangeOneTimeToken` | POST | `/v1/acl/token/onetime/exchange` | 用一次性 Token 换取正式 Token |

#### [ui/app/controllers/settings/tokens.js](file:///d:/claude/nomad/ui/app/controllers/settings/tokens.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| OIDC 回调 | POST | `/v1/acl/oidc/complete-auth` | 完成 OIDC 认证获取 Token |

---

### 13. ACL Policy 模块

#### [ui/app/adapters/policy.js](file:///d:/claude/nomad/ui/app/adapters/policy.js)

namespace 前缀为 `/v1/acl`。

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` | GET | `/v1/acl/policies` | 获取所有 Policy 列表 |
| `findRecord` | GET | `/v1/acl/policy/{name}` | 获取单个 Policy 详情 |
| `createRecord` | POST | `/v1/acl/policy/{name}` | 创建 Policy |
| `updateRecord` | PUT | `/v1/acl/policy/{name}` | 更新 Policy |
| `deleteRecord` | DELETE | `/v1/acl/policy/{name}` | 删除 Policy |

---

### 14. ACL Role 模块

#### [ui/app/adapters/role.js](file:///d:/claude/nomad/ui/app/adapters/role.js)

namespace 前缀为 `/v1/acl`。

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` | GET | `/v1/acl/roles` | 获取所有 Role 列表 |
| `findRecord` | GET | `/v1/acl/role/{id}` | 获取单个 Role 详情 |
| `createRecord` | POST | `/v1/acl/role` | 创建 Role |
| `updateRecord` | PUT | `/v1/acl/role/{id}` | 更新 Role |
| `deleteRecord` | DELETE | `/v1/acl/role/{id}` | 删除 Role |

---

### 15. Auth Method 模块（OIDC）

#### [ui/app/adapters/auth-method.js](file:///d:/claude/nomad/ui/app/adapters/auth-method.js)

namespace 前缀为 `/v1/acl`。

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` | GET | `/v1/acl/auth-method` | 获取所有 Auth Method 列表 |
| `findRecord` | GET | `/v1/acl/auth-method/{name}` | 获取单个 Auth Method 详情 |
| `getAuthURL` | POST | `/v1/acl/oidc/auth-url` | 获取 OIDC 认证 URL |

---

### 16. Sentinel Policy 模块

#### [ui/app/adapters/sentinel-policy.js](file:///d:/claude/nomad/ui/app/adapters/sentinel-policy.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` | GET | `/v1/sentinel/policies` | 获取所有 Sentinel Policy 列表 |
| `findRecord` | GET | `/v1/sentinel/policy/{name}` | 获取单个 Sentinel Policy 详情 |
| `createRecord` | POST | `/v1/sentinel/policy/{name}` | 创建 Sentinel Policy |
| `updateRecord` | PUT | `/v1/sentinel/policy/{name}` | 更新 Sentinel Policy |
| `deleteRecord` | DELETE | `/v1/sentinel/policy/{name}` | 删除 Sentinel Policy |

---

### 17. Variable 模块

#### [ui/app/adapters/variable.js](file:///d:/claude/nomad/ui/app/adapters/variable.js)

`pathForType` 返回 `var`，支持 CAS（Compare-And-Swap）。

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` | GET | `/v1/vars` | 获取所有 Variable 列表 |
| `query` | GET | `/v1/vars?prefix={p}&namespace={ns}` | 按前缀查询 Variable |
| `findRecord` | GET | `/v1/var/{path}?namespace={ns}` | 获取单个 Variable 详情 |
| `createRecord` | PUT | `/v1/var/{path}?cas={cas}&namespace={ns}` | 创建 Variable（CAS） |
| `updateRecord` | PUT | `/v1/var/{path}?cas={cas}` 或 `/v1/var/{path}` | 更新 Variable |
| `deleteRecord` | DELETE | `/v1/var/{path}?namespace={ns}` | 删除 Variable |

---

### 18. Recommendation 模块

#### [ui/app/adapters/recommendation-summary.js](file:///d:/claude/nomad/ui/app/adapters/recommendation-summary.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `findAll` | GET | `/v1/recommendations?namespace=*` | 获取所有 Recommendation 列表 |
| `updateRecord` | POST | `/v1/recommendations/apply` | 应用/驳回 Recommendation（`Apply` / `Dismiss`） |

---

### 19. System Service（系统级 API）

#### [ui/app/services/system.js](file:///d:/claude/nomad/ui/app/services/system.js)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| `leaders` | GET | `/v1/status/leader?region={r}` | 获取所有 Region 的 Leader RPC 地址 |
| `agent` | GET | `/v1/agent/self` | 获取当前 Agent 自身信息（含版本） |
| `defaultRegion` | GET | `/v1/agent/members` | 获取默认 Region（从响应的 `ServerRegion`） |
| `regions` | GET | `/v1/regions` | 获取所有 Region 列表 |
| `fetchLicense` | GET | `/v1/operator/license` | 获取 License 信息 |
| `checkFuzzySearchPresence` | POST | `/v1/search/fuzzy` | 检测是否支持模糊搜索（feature detection） |
| `namespaces` | GET | `/v1/namespaces` | 获取所有 Namespace（通过 store） |

---

### 20. 全局搜索模块

#### [ui/app/components/global-search/control.gjs](file:///d:/claude/nomad/ui/app/components/global-search/control.gjs)

| 方法 | HTTP 方法 | API 路径 | 说明 |
|------|-----------|----------|------|
| 搜索 | POST | `/v1/search/fuzzy` | 模糊搜索 Jobs/Nodes/Allocations/Groups/Plugins |

---

### 21. Token Service（统一请求封装）

#### [ui/app/services/token.js](file:///d:/claude/nomad/ui/app/services/token.js)

Token Service 不直接调用特定 API，而是提供统一的 `authorizedRequest` / `authorizedRawRequest` 方法封装 `fetch`，自动：

- 附加 `X-Nomad-Token` 请求头
- 附加 `region=` 查询参数（当 `system.shouldIncludeRegion` 为 true）
- 设置 `credentials: 'include'` 以支持 cookie

所有非 Ember Data 的直接 API 调用均通过此 service 发起。

---

### 22. Exec 模块（WebSocket）

#### [ui/app/services/sockets.js](file:///d:/claude/nomad/ui/app/services/sockets.js)

| 方法 | 协议 | API 路径 | 说明 |
|------|------|----------|------|
| Exec | WS | `ws(s)://host/v1/client/allocation/{allocId}/exec?task={t}&tty=true&ws_handshake=true[&region={r}]&command=[...]` | 进入 Allocation 执行命令 |

---

### 23. Actions 模块（WebSocket）

#### [ui/app/services/nomad-actions.js](file:///d:/claude/nomad/ui/app/services/nomad-actions.js)

Actions 模块通过 [ui/app/adapters/job.js](file:///d:/claude/nomad/ui/app/adapters/job.js) 的 `getActionSocketUrl` 方法建立 WebSocket 连接（见 Job 模块）。

---

## API 路径汇总表

以下是所有涉及到的 Nomad API 端点汇总：

| 类别 | HTTP 方法 | API 路径 |
|------|-----------|----------|
| **Job** | GET | `/v1/jobs` |
| Job | GET | `/v1/jobs/statuses` |
| Job | POST | `/v1/jobs` |
| Job | POST | `/v1/jobs/parse?namespace=*` |
| Job | GET | `/v1/job/{id}` |
| Job | POST | `/v1/job/{id}` |
| Job | DELETE | `/v1/job/{id}` |
| Job | POST | `/v1/job/{id}/plan` |
| Job | POST | `/v1/job/{id}/scale` |
| Job | POST | `/v1/job/{id}/dispatch` |
| Job | POST | `/v1/job/{id}/periodic/force` |
| Job | POST | `/v1/job/{id}/revert` |
| Job | GET | `/v1/job/{id}/summary` |
| Job | GET | `/v1/job/{id}/scale` |
| Job | GET | `/v1/job/{id}/versions` |
| Job | GET | `/v1/job/{id}/submission` |
| Job | WS | `/v1/job/{id}/action` |
| Job Version Tag | POST/DELETE | `/v1/job/{name}/versions/{tag}/tag` |
| **Allocation** | GET | `/v1/allocations` |
| Allocation | GET | `/v1/allocation/{id}` |
| Allocation | POST | `/v1/allocation/{id}/stop` |
| Allocation | PUT | `/v1/client/allocation/{id}/restart` |
| Allocation | PUT | `/v1/client/allocation/{id}/pause` |
| Allocation | GET | `/v1/client/allocation/{id}/stats` |
| Allocation | GET | `/v1/client/allocation/{id}/checks` |
| Allocation | WS | `/v1/client/allocation/{id}/exec` |
| **FileSystem** | GET | `/v1/client/fs/ls/{allocId}` |
| FileSystem | GET | `/v1/client/fs/stat/{allocId}` |
| FileSystem | GET | `/v1/client/fs/cat/{allocId}` |
| FileSystem | GET | `/v1/client/fs/readat/{allocId}` |
| FileSystem | GET | `/v1/client/fs/stream/{allocId}` |
| FileSystem | GET | `/v1/client/fs/logs/{allocId}` |
| **Node** | GET | `/v1/nodes` |
| Node | GET | `/v1/node/{id}` |
| Node | POST | `/v1/node/{id}/eligibility` |
| Node | POST | `/v1/node/{id}/drain` |
| Node | GET | `/v1/client/stats?node_id={id}` |
| Node | POST | `/v1/client/metadata?node_id={id}` |
| **Node Pool** | GET | `/v1/node/pools` |
| **Deployment** | GET | `/v1/deployments` |
| Deployment | GET | `/v1/deployment/{id}` |
| Deployment | POST | `/v1/deployment/fail/{id}` |
| Deployment | POST | `/v1/deployment/promote/{id}` |
| **Evaluation** | GET | `/v1/evaluations` |
| Evaluation | GET | `/v1/evaluation/{id}` |
| **Volume** | GET | `/v1/volumes` |
| Volume | GET | `/v1/volume/csi/{id}` |
| Volume | GET | `/v1/volume/host/{id}` |
| **Plugin** | GET | `/v1/plugins` |
| Plugin | GET | `/v1/plugin/csi/{id}` |
| **Service** | GET | `/v1/services` |
| Service | GET | `/v1/service/{id}` |
| **Namespace** | GET | `/v1/namespaces` |
| Namespace | GET | `/v1/namespace/{id}` |
| Namespace | POST | `/v1/namespace/{name}` |
| Namespace | DELETE | `/v1/namespace/{id}` |
| **Agent** | GET | `/v1/agent/members` |
| Agent | GET | `/v1/agent/self` |
| Agent | GET | `/v1/agent/monitor` |
| **System** | GET | `/v1/regions` |
| System | GET | `/v1/status/leader` |
| System | GET | `/v1/operator/license` |
| System | POST | `/v1/search/fuzzy` |
| **ACL Token** | GET | `/v1/acl/tokens` |
| ACL Token | GET | `/v1/acl/token/{id}` |
| ACL Token | GET | `/v1/acl/token/self` |
| ACL Token | POST | `/v1/acl/token` |
| ACL Token | POST | `/v1/acl/token/{id}` |
| ACL Token | DELETE | `/v1/acl/token/{id}` |
| ACL Token | POST | `/v1/acl/login` |
| ACL Token | POST | `/v1/acl/token/onetime/exchange` |
| ACL OIDC | POST | `/v1/acl/oidc/auth-url` |
| ACL OIDC | POST | `/v1/acl/oidc/complete-auth` |
| **ACL Policy** | GET | `/v1/acl/policies` |
| ACL Policy | GET | `/v1/acl/policy/{name}` |
| ACL Policy | POST/PUT | `/v1/acl/policy/{name}` |
| ACL Policy | DELETE | `/v1/acl/policy/{name}` |
| **ACL Role** | GET | `/v1/acl/roles` |
| ACL Role | GET | `/v1/acl/role/{id}` |
| ACL Role | POST | `/v1/acl/role` |
| ACL Role | PUT | `/v1/acl/role/{id}` |
| ACL Role | DELETE | `/v1/acl/role/{id}` |
| **Auth Method** | GET | `/v1/acl/auth-method` |
| Auth Method | GET | `/v1/acl/auth-method/{name}` |
| **Sentinel Policy** | GET | `/v1/sentinel/policies` |
| Sentinel Policy | GET | `/v1/sentinel/policy/{name}` |
| Sentinel Policy | POST/PUT | `/v1/sentinel/policy/{name}` |
| Sentinel Policy | DELETE | `/v1/sentinel/policy/{name}` |
| **Variable** | GET | `/v1/vars` |
| Variable | GET | `/v1/var/{path}` |
| Variable | PUT | `/v1/var/{path}?cas={cas}` |
| Variable | DELETE | `/v1/var/{path}` |
| **Recommendation** | GET | `/v1/recommendations` |
| Recommendation | POST | `/v1/recommendations/apply` |

---

## 关键设计要点

1. **统一 Token 注入**：所有请求通过 `token` service 自动附加 `X-Nomad-Token` 请求头
2. **Region 透明注入**：当 UI 检测到多 Region 环境时，自动为请求追加 `region=` 参数
3. **长轮询支持**：通过 `index` 查询参数和 `X-Nomad-Index` 响应头实现 watch 机制
4. **Namespace 隔离**：Job、Allocation、Variable 等支持命名空间的资源，通过 `?namespace=` 参数隔离
5. **WebSocket 连接**：Actions 和 Exec 通过 WebSocket 进行实时通信，URL 同样位于 `/v1/` 路径下
6. **CAS 语义**：Variable 通过 `?cas={modifyIndex}` 实现乐观并发控制
7. **文件系统代理**：FS 操作（ls/stat/cat/stream/logs）可通过 Client 直连或 Server 代理，UI 实现自动 failover
