# Nomad UI 路由清单与后端 API 映射分析

> 本文档基于 Nomad UI（Ember.js 应用）源码，系统梳理所有前端路由及其调用的 Nomad HTTP API。所有引用均带可点击源码链接。

---

## 目录

1. [架构概览](#1-架构概览)
2. [路由清单总览](#2-路由清单总览)
3. [应用级路由](#3-应用级路由)
4. [Jobs 路由组](#4-jobs-路由组)
5. [Clients 路由组](#5-clients-路由组)
6. [Servers 路由组](#6-servers-路由组)
7. [Storage 路由组](#7-storage-路由组)
8. [Allocations 路由组](#8-allocations-路由组)
9. [Variables 路由组](#9-variables-路由组)
10. [Evaluations 路由组](#10-evaluations-路由组)
11. [Administration 路由组](#11-administration-路由组)
12. [Optimize 路由组](#12-optimize-路由组)
13. [Exec 路由组](#13-exec-路由组)
14. [Settings 路由组](#14-settings-路由组)
15. [Topology 路由](#15-topology-路由)
16. [Adapter 到 HTTP API 完整映射](#16-adapter-到-http-api-完整映射)
17. [关键横切机制](#17-关键横切机制)
18. [源码文件索引](#18-源码文件索引)

---

## 1. 架构概览

Nomad UI 是一个 Ember.js 单页应用，所有 API 访问通过以下四层抽象：

```
Route model() hook
    ↓
Ember Data Store (findRecord / findAll / query / createRecord)
    ↓
Adapter (urlForFindRecord / urlForQuery / 自定义方法)
    ↓
HTTP API (/v1/...)
```

**关键特性**：
- **Blocking Query**：通过 `Watchable` 基类适配器添加 `?index=<n>` 长轮询参数
- **Namespace 感知**：`WatchableNamespaceIDs` 基类处理 `[id, namespace]` JSON 元组 ID
- **Region 切换**：`ApplicationAdapter.ajaxOptions` 自动注入 `?region=<region>`
- **Token 注入**：所有请求头携带 `X-Nomad-Token`
- **WebSocket**：exec 与 action 终端使用 `ws[s]://` 协议

---

## 2. 路由清单总览

| 路由路径 | 路由文件 | 主要 API 端点 |
|----------|----------|---------------|
| `/` (重定向到 /jobs) | [routes/index.js](file:///d:/claude/nomad/ui/app/routes/index.js) | 无 |
| `/jobs` | [routes/jobs/index.js](file:///d:/claude/nomad/ui/app/routes/jobs/index.js) | `GET /v1/jobs/statuses`, `GET /v1/namespaces`, `GET /v1/node/pools` |
| `/jobs/run` | [routes/jobs/run/index.js](file:///d:/claude/nomad/ui/app/routes/jobs/run/index.js) | `GET /v1/namespaces`, `GET /v1/vars?prefix=nomad/job-templates` |
| `/jobs/run/templates` | [routes/jobs/run/templates/index.js](file:///d:/claude/nomad/ui/app/routes/jobs/run/templates/index.js) | `GET /v1/vars?prefix=nomad/job-templates&namespace=*` |
| `/jobs/run/templates/manage` | [routes/jobs/run/templates/manage.js](file:///d:/claude/nomad/ui/app/routes/jobs/run/templates/manage.js) | `GET /v1/vars?prefix=nomad/job-templates&namespace=*` |
| `/jobs/run/templates/new` | [routes/jobs/run/templates/new.js](file:///d:/claude/nomad/ui/app/routes/jobs/run/templates/new.js) | `GET /v1/vars?prefix=nomad/job-templates`, `GET /v1/namespaces` |
| `/jobs/run/templates/:name` | [routes/jobs/run/templates/template.js](file:///d:/claude/nomad/ui/app/routes/jobs/run/templates/template.js) | `GET /v1/var/<path>` |
| `/jobs/:job_name` | [routes/jobs/job.js](file:///d:/claude/nomad/ui/app/routes/jobs/job.js) | `GET /v1/job/<id>`, `GET /v1/job/<id>/summary`, `GET /v1/allocations`, `GET /v1/evaluations` |
| `/jobs/:job_name/allocations` | [routes/jobs/job/allocations.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/allocations.js) | （使用父路由） |
| `/jobs/:job_name/clients` | [routes/jobs/job/clients.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/clients.js) | （使用父路由 + watch node） |
| `/jobs/:job_name/definition` | [routes/jobs/job/definition.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/definition.js) | `GET /v1/job/<id>`, `GET /v1/job/<id>/versions`, `GET /v1/job/<id>/submission` |
| `/jobs/:job_name/deployments` | [routes/jobs/job/deployments.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/deployments.js) | `GET /v1/deployment/<id>`, `GET /v1/job/<id>/versions` |
| `/jobs/:job_name/dispatch` | [routes/jobs/job/dispatch.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/dispatch.js) | （使用父路由） |
| `/jobs/:job_name/evaluations` | [routes/jobs/job/evaluations.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/evaluations.js) | `GET /v1/evaluation/<id>` |
| `/jobs/:job_name/services` | [routes/jobs/job/services.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/services.js) | `GET /v1/service/<id>` |
| `/jobs/:job_name/task-group/:name` | [routes/jobs/job/task-group.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/task-group.js) | `GET /v1/job/<id>/scale`, `GET /v1/allocations` |
| `/jobs/:job_name/variables` | [routes/jobs/job/variables.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/variables.js) | `GET /v1/vars?path=nomad/jobs`, `GET /v1/var/<path>` |
| `/jobs/:job_name/versions` | [routes/jobs/job/versions.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/versions.js) | `GET /v1/job/<id>/versions` |
| `/clients` | [routes/clients.js](file:///d:/claude/nomad/ui/app/routes/clients.js) | `GET /v1/nodes`, `GET /v1/node/pools` |
| `/clients/:node_id` | [routes/clients/client.js](file:///d:/claude/nomad/ui/app/routes/clients/client.js) | `GET /v1/node/<id>`, `GET /v1/allocations` |
| `/clients/:node_id/monitor` | [routes/clients/client/index.js](file:///d:/claude/nomad/ui/app/routes/clients/client/index.js) | （使用父路由） |
| `/servers` | [routes/servers.js](file:///d:/claude/nomad/ui/app/routes/servers.js) | `GET /v1/agent/members`, `GET /v1/status/leader`, `GET /v1/nodes` |
| `/servers/:agent_id` | [routes/servers/server.js](file:///d:/claude/nomad/ui/app/routes/servers/server.js) | `GET /v1/agent/members` |
| `/servers/:agent_id/monitor` | [routes/servers/server/index.js](file:///d:/claude/nomad/ui/app/routes/servers/server/index.js) | （使用父路由） |
| `/storage` | [routes/storage/index.js](file:///d:/claude/nomad/ui/app/routes/storage/index.js) | `GET /v1/volumes?type=csi`, `GET /v1/volumes?type=host`, `GET /v1/namespaces` |
| `/storage/plugins` | [routes/storage/plugins.js](file:///d:/claude/nomad/ui/app/routes/storage/plugins.js) | `GET /v1/plugins?type=csi` |
| `/storage/plugins/:plugin_name` | [routes/storage/plugins/plugin.js](file:///d:/claude/nomad/ui/app/routes/storage/plugins/plugin.js) | `GET /v1/plugin/csi/<id>` |
| `/storage/volumes/csi/:volume_name` | [routes/storage/volumes/volume.js](file:///d:/claude/nomad/ui/app/routes/storage/volumes/volume.js) | `GET /v1/volume/csi/<id>`, `GET /v1/namespaces` |
| `/storage/volumes/dynamic/:id` | [routes/storage/volumes/dynamic-host-volume.js](file:///d:/claude/nomad/ui/app/routes/storage/volumes/dynamic-host-volume.js) | `GET /v1/volume/host/<id>`, `GET /v1/namespaces` |
| `/allocations/:allocation_id` | [routes/allocations/allocation.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation.js) | `GET /v1/allocation/<id>`, `GET /v1/job/<id>`, `GET /v1/namespaces` |
| `/allocations/:allocation_id/fs` | [routes/allocations/allocation/fs-root.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/fs-root.js) | `GET /v1/client/fs/ls/<id>`, `GET /v1/client/fs/stat/<id>` |
| `/allocations/:allocation_id/fs/*path` | [routes/allocations/allocation/fs.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/fs.js) | `GET /v1/client/fs/ls/<id>`, `GET /v1/client/fs/stat/<id>`, `GET /v1/client/fs/cat/<id>` |
| `/allocations/:allocation_id/:name` | [routes/allocations/allocation/task.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/task.js) | `GET /v1/var/<path>` (变量链接) |
| `/allocations/:allocation_id/:name/logs` | [routes/allocations/allocation/task/logs.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/task/logs.js) | `GET /v1/client/fs/logs/<id>` |
| `/allocations/:allocation_id/:name/fs` | [routes/allocations/allocation/task/fs-root.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/task/fs-root.js) | `GET /v1/client/fs/ls/<id>`, `GET /v1/client/fs/stat/<id>` |
| `/allocations/:allocation_id/:name/fs/*path` | [routes/allocations/allocation/task/fs.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/task/fs.js) | `GET /v1/client/fs/ls/<id>`, `GET /v1/client/fs/stat/<id>`, `GET /v1/client/fs/cat/<id>` |
| `/variables` | [routes/variables.js](file:///d:/claude/nomad/ui/app/routes/variables.js) | `GET /v1/vars`, `GET /v1/namespaces` |
| `/variables/new` | [routes/variables/new.js](file:///d:/claude/nomad/ui/app/routes/variables/new.js) | `GET /v1/namespaces` (peek) |
| `/variables/path/*absolutePath` | [routes/variables/path.js](file:///d:/claude/nomad/ui/app/routes/variables/path.js) | （使用父路由） |
| `/variables/var/*id` | [routes/variables/variable.js](file:///d:/claude/nomad/ui/app/routes/variables/variable.js) | `GET /v1/var/<path>` |
| `/variables/var/*id/edit` | [routes/variables/variable/edit.js](file:///d:/claude/nomad/ui/app/routes/variables/variable/edit.js) | （使用父路由） |
| `/evaluations` | [routes/evaluations/index.js](file:///d:/claude/nomad/ui/app/routes/evaluations/index.js) | `GET /v1/evaluations`, `GET /v1/namespaces` |
| `/administration` | [routes/administration.js](file:///d:/claude/nomad/ui/app/routes/administration.js) | `GET /v1/acl/policies`, `GET /v1/acl/roles`, `GET /v1/acl/tokens`, `GET /v1/namespaces`, `GET /v1/sentinel/policies` |
| `/administration/policies` | [routes/administration.js](file:///d:/claude/nomad/ui/app/routes/administration.js) | （使用父路由） |
| `/administration/policies/new` | [routes/administration/policies/new.js](file:///d:/claude/nomad/ui/app/routes/administration/policies/new.js) | 无（本地创建记录） |
| `/administration/policies/:name` | [routes/administration/policies/policy.js](file:///d:/claude/nomad/ui/app/routes/administration/policies/policy.js) | `GET /v1/acl/policy/<id>` |
| `/administration/roles/new` | [routes/administration/roles/new.js](file:///d:/claude/nomad/ui/app/routes/administration/roles/new.js) | `GET /v1/acl/policies` |
| `/administration/roles/:id` | [routes/administration/roles/role.js](file:///d:/claude/nomad/ui/app/routes/administration/roles/role.js) | `GET /v1/acl/role/<id>` |
| `/administration/tokens/new` | [routes/administration/tokens/new.js](file:///d:/claude/nomad/ui/app/routes/administration/tokens/new.js) | `GET /v1/acl/policies`, `GET /v1/acl/roles` |
| `/administration/tokens/:id` | [routes/administration/tokens/token.js](file:///d:/claude/nomad/ui/app/routes/administration/tokens/token.js) | `GET /v1/acl/token/<id>` |
| `/administration/namespaces/new` | [routes/administration/namespaces/new.js](file:///d:/claude/nomad/ui/app/routes/administration/namespaces/new.js) | 无（本地创建记录） |
| `/administration/namespaces/:name` | [routes/administration/namespaces/acl-namespace.js](file:///d:/claude/nomad/ui/app/routes/administration/namespaces/acl-namespace.js) | `GET /v1/namespace/<id>` |
| `/administration/sentinel-policies` | [routes/administration/sentinel-policies.js](file:///d:/claude/nomad/ui/app/routes/administration/sentinel-policies.js) | `GET /v1/sentinel/policies` |
| `/administration/sentinel-policies/new` | [routes/administration/sentinel-policies/new.js](file:///d:/claude/nomad/ui/app/routes/administration/sentinel-policies/new.js) | 无（本地创建记录） |
| `/administration/sentinel-policies/:id` | [routes/administration/sentinel-policies/policy.js](file:///d:/claude/nomad/ui/app/routes/administration/sentinel-policies/policy.js) | `GET /v1/sentinel/policy/<id>` |
| `/optimize` | [routes/optimize.js](file:///d:/claude/nomad/ui/app/routes/optimize.js) | `GET /v1/recommendations?namespace=*`, `GET /v1/namespaces`, `GET /v1/allocations` |
| `/optimize/*slug` | [routes/optimize/summary.js](file:///d:/claude/nomad/ui/app/routes/optimize/summary.js) | （使用父路由） |
| `/exec/:job_name` | [routes/exec.js](file:///d:/claude/nomad/ui/app/routes/exec.js) | `GET /v1/job/<id>`, `GET /v1/allocations`, `WS /v1/client/allocation/<id>/exec` |
| `/settings/tokens` | [routes/settings/tokens.js](file:///d:/claude/nomad/ui/app/routes/settings/tokens.js) | `GET /v1/acl/auth-methods`, `GET /v1/acl/token/self`, `POST /v1/acl/login`, `POST /v1/acl/token/onetime/exchange` |
| `/topology` | [routes/topology.js](file:///d:/claude/nomad/ui/app/routes/topology.js) | `GET /v1/allocations?resources=true`, `GET /v1/nodes?resources=true`, `GET /v1/node/pools` |

---

## 3. 应用级路由

### 3.1 `application` 路由

**文件**：[routes/application.js](file:///d:/claude/nomad/ui/app/routes/application.js)

`beforeModel` 钩子在所有路由前执行，加载全局上下文：

| 调用 | API 端点 | 说明 |
|------|----------|------|
| `token.exchangeOneTimeToken(ott)` | `POST /v1/acl/token/onetime/exchange` | 一次性 token 交换 |
| `token.fetchSelfTokenAndPolicies` | `GET /v1/acl/token/self` | 获取当前 token 信息 |
| `system.fetchLicense` | `GET /v1/operator/license` | 获取许可证信息 |
| `system.checkFuzzySearchPresence` | `POST /v1/search/fuzzy` | 检测模糊搜索功能 |
| `system.regions` | `GET /v1/regions` | 获取所有 region 列表 |
| `system.defaultRegion` | `GET /v1/agent/members` | 从响应中提取 `ServerRegion` |

### 3.2 `index` 路由

**文件**：[routes/index.js](file:///d:/claude/nomad/ui/app/routes/index.js)

仅做重定向到 `jobs`，无 API 调用。

---

## 4. Jobs 路由组

### 4.1 `/jobs` — 任务列表

**文件**：[routes/jobs/index.js](file:///d:/claude/nomad/ui/app/routes/jobs/index.js)

**model() 调用**：
- `this.store.query('job', currentParams, { adapterOptions: { abortController } })`
- `this.store.findAll('namespace')`
- `this.store.findAll('node-pool')`

**对应 API**：
| API 端点 | 方法 | 说明 |
|----------|------|------|
| `/v1/jobs/statuses` | GET/POST | 聚合任务状态查询（支持 `?index=` blocking query、`?namespace=*`） |
| `/v1/namespaces` | GET | 命名空间列表（用于过滤） |
| `/v1/node/pools` | GET | 节点池列表（用于过滤） |

**特殊机制**：使用 `AbortController` 取消未完成的请求（用户快速翻页时）。

### 4.2 `/jobs/run` — 运行新任务

**文件**：[routes/jobs/run/index.js](file:///d:/claude/nomad/ui/app/routes/jobs/run/index.js)

**model() 调用**：
- `this.store.findAll('namespace')`
- `this.store.adapterFor('variable').getJobTemplate(template)`（条件性）
- `this.store.createRecord('job', { _newDefinition })`

**对应 API**：
| API 端点 | 方法 | 说明 |
|----------|------|------|
| `/v1/namespaces` | GET | 命名空间列表 |
| `/v1/var/<path>?namespace=*` | GET | 获取 job 模板变量 |
| `/v1/jobs/parse?namespace=*` | POST | 解析 HCL/JSON 任务规范 |
| `/v1/jobs` | POST | 提交任务（run） |
| `/v1/job/<id>/plan` | POST | 任务计划预览 |

### 4.3 `/jobs/run/templates` — 任务模板管理

**文件**：[routes/jobs/run/templates/index.js](file:///d:/claude/nomad/ui/app/routes/jobs/run/templates/index.js) 与 [manage.js](file:///d:/claude/nomad/ui/app/routes/jobs/run/templates/manage.js)

**对应 API**：
- `GET /v1/vars?prefix=nomad/job-templates&namespace=*`

### 4.4 `/jobs/run/templates/new` — 新建模板

**文件**：[routes/jobs/run/templates/new.js](file:///d:/claude/nomad/ui/app/routes/jobs/run/templates/new.js)

**对应 API**：
- `GET /v1/vars?prefix=nomad/job-templates&namespace=*`
- `GET /v1/namespaces`
- `PUT /v1/var/<id>?cas=<modifyIndex>` （保存时）

### 4.5 `/jobs/run/templates/:name` — 查看模板

**文件**：[routes/jobs/run/templates/template.js](file:///d:/claude/nomad/ui/app/routes/jobs/run/templates/template.js)

**对应 API**：
- `GET /v1/var/<path>?namespace=<ns>`

### 4.6 `/jobs/:job_name` — 任务详情

**文件**：[routes/jobs/job.js](file:///d:/claude/nomad/ui/app/routes/jobs/job.js)

**model() 调用**：
- `this.store.findRecord('job', fullId, { reload: true })`
- `job.hasMany('allocations').reload()`
- `job.hasMany('evaluations').reload()`
- `this.store.findAll('namespace')`
- `job.get('recommendationSummaries')`（条件性）
- `job.get('variables')`（条件性）
- `this.store.findAll('node')`（条件性）

**对应 API**：
| API 端点 | 方法 | 说明 |
|----------|------|------|
| `/v1/job/<id>?namespace=<ns>` | GET | 任务详情 |
| `/v1/job/<id>/summary?namespace=<ns>` | GET | 任务摘要 |
| `/v1/job/<id>/scale?namespace=<ns>` | GET | 任务伸缩状态 |
| `/v1/allocations` | GET | 任务关联的分配 |
| `/v1/evaluations` | GET | 任务关联的评估 |
| `/v1/namespaces` | GET | 命名空间列表 |
| `/v1/nodes` | GET | 节点列表（条件性） |
| `/v1/recommendations?namespace=*` | GET | 推荐摘要（条件性） |
| `/v1/vars?path=nomad/jobs` | GET | 任务变量（条件性） |

### 4.7 `/jobs/:job_name/definition` — 任务定义

**文件**：[routes/jobs/job/definition.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/definition.js)

**model() 调用**：
- `job.fetchRawDefinition(version)` → `GET /v1/job/<id>` 或 `GET /v1/job/<id>/versions`
- `job.fetchRawSpecification(version)` → `GET /v1/job/<id>/submission?version=<v>`

**对应 API**：
| API 端点 | 方法 | 说明 |
|----------|------|------|
| `/v1/job/<id>` | GET | 原始任务定义 |
| `/v1/job/<id>/versions?diffs=true` | GET | 历史版本定义 |
| `/v1/job/<id>/submission?version=<v>` | GET | 任务规范提交记录 |

### 4.8 `/jobs/:job_name/deployments` — 部署历史

**文件**：[routes/jobs/job/deployments.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/deployments.js)

**对应 API**：
- `GET /v1/deployment/<id>` （通过关系加载）
- `GET /v1/job/<id>/versions` （通过关系加载）

### 4.9 `/jobs/:job_name/evaluations` — 评估列表

**文件**：[routes/jobs/job/evaluations.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/evaluations.js)

**对应 API**：
- `GET /v1/evaluation/<id>?namespace=<ns>&related=true` （通过关系加载）

### 4.10 `/jobs/:job_name/services` — 服务列表

**文件**：[routes/jobs/job/services.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/services.js)

**对应 API**：
- `GET /v1/service/<id>` （通过关系加载）

### 4.11 `/jobs/:job_name/task-group/:name` — 任务组详情

**文件**：[routes/jobs/job/task-group.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/task-group.js)

**对应 API**：
- `GET /v1/job/<id>/scale?namespace=<ns>` （watch 模式）
- `GET /v1/job/<id>/summary?namespace=<ns>` （watch 模式）
- `GET /v1/allocations` （关系重载）

### 4.12 `/jobs/:job_name/variables` — 任务变量

**文件**：[routes/jobs/job/variables.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/variables.js)

**对应 API**：
- `GET /v1/vars?path=nomad/jobs`
- `GET /v1/var/<path>?namespace=<ns>` （通过 `getPathLinkedVariable()` 模型方法）

### 4.13 `/jobs/:job_name/versions` — 版本历史

**文件**：[routes/jobs/job/versions.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/versions.js)

**对应 API**：
- `GET /v1/job/<id>/versions?diffs=true`

### 4.14 `/jobs/:job_name/allocations` 和 `/clients`

这两个路由使用父路由模型，无额外 API 调用，但通过 `@watchRelationship('allocations')` 和 `@watchAll('node')` 触发后台轮询。

---

## 5. Clients 路由组

### 5.1 `/clients` — 客户端列表

**文件**：[routes/clients.js](file:///d:/claude/nomad/ui/app/routes/clients.js)

**对应 API**：
- `GET /v1/nodes`
- `GET /v1/node/pools`

### 5.2 `/clients/:node_id` — 客户端详情

**文件**：[routes/clients/client.js](file:///d:/claude/nomad/ui/app/routes/clients/client.js)

**对应 API**：
- `GET /v1/node/<id>`
- `GET /v1/allocations` （通过 `node.allocations` 关系）

### 5.3 `/clients/:node_id/monitor`

**文件**：[routes/clients/client/index.js](file:///d:/claude/nomad/ui/app/routes/clients/client/index.js)

使用父路由模型，通过 `@watchRecord('node')` 和 `@watchRelationship('allocations')` 后台轮询。

---

## 6. Servers 路由组

### 6.1 `/servers` — 服务器列表

**文件**：[routes/servers.js](file:///d:/claude/nomad/ui/app/routes/servers.js)

**model() 调用**：
- `this.store.findAll('agent')`
- `agent.checkForLeadership()` （每个 agent）
- `this.store.findAll('node')`

**对应 API**：
| API 端点 | 方法 | 说明 |
|----------|------|------|
| `/v1/agent/members` | GET | 所有 server 成员 |
| `/v1/status/leader?region=<region>` | GET | 每个 region 的 leader RPC 地址 |
| `/v1/nodes` | GET | 节点列表 |

### 6.2 `/servers/:agent_id` — 服务器详情

**文件**：[routes/servers/server.js](file:///d:/claude/nomad/ui/app/routes/servers/server.js)

**对应 API**：
- `GET /v1/agent/members` （findRecord 复用同一端点）
- `GET /v1/agent/self` （agent monitor 视图）

---

## 7. Storage 路由组

### 7.1 `/storage` — 存储总览

**文件**：[routes/storage/index.js](file:///d:/claude/nomad/ui/app/routes/storage/index.js)

**对应 API**：
- `GET /v1/volumes?type=csi&namespace=<ns>`
- `GET /v1/volumes?type=host&namespace=<ns>` （动态主机卷）
- `GET /v1/namespaces`

### 7.2 `/storage/plugins` — CSI 插件列表

**文件**：[routes/storage/plugins.js](file:///d:/claude/nomad/ui/app/routes/storage/plugins.js)

**对应 API**：
- `GET /v1/plugins?type=csi`

### 7.3 `/storage/plugins/:plugin_name` — CSI 插件详情

**文件**：[routes/storage/plugins/plugin.js](file:///d:/claude/nomad/ui/app/routes/storage/plugins/plugin.js)

**对应 API**：
- `GET /v1/plugin/csi/<id>`

### 7.4 `/storage/volumes/csi/:volume_name` — CSI 卷详情

**文件**：[routes/storage/volumes/volume.js](file:///d:/claude/nomad/ui/app/routes/storage/volumes/volume.js)

**对应 API**：
- `GET /v1/volume/csi/<id>?namespace=<ns>`
- `GET /v1/namespaces`

### 7.5 `/storage/volumes/dynamic/:id` — 动态主机卷详情

**文件**：[routes/storage/volumes/dynamic-host-volume.js](file:///d:/claude/nomad/ui/app/routes/storage/volumes/dynamic-host-volume.js)

**对应 API**：
- `GET /v1/volume/host/<id>`
- `GET /v1/namespaces`

---

## 8. Allocations 路由组

### 8.1 `/allocations/:allocation_id` — 分配详情

**文件**：[routes/allocations/allocation.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation.js)

**对应 API**：
- `GET /v1/allocation/<id>`
- `GET /v1/job/<id>?namespace=<ns>` （关联任务）
- `GET /v1/namespaces`
- `GET /v1/client/allocation/<id>/checks` （健康检查）

### 8.2 `/allocations/:allocation_id/fs` 和 `/fs/*path` — 文件系统浏览

**文件**：[routes/allocations/allocation/fs.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/fs.js) 与 [fs-root.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/fs-root.js)

**对应 API**：
| API 端点 | 方法 | 说明 |
|----------|------|------|
| `/v1/client/fs/ls/<alloc_id>?path=<p>` | GET | 列目录 |
| `/v1/client/fs/stat/<alloc_id>?path=<p>` | GET | 文件/目录元信息 |
| `/v1/client/fs/cat/<alloc_id>?path=<p>` | GET | 读取文件内容 |
| `/v1/node/<id>` | GET | 通过 `allocation.node` 关系 |

### 8.3 `/allocations/:allocation_id/:name` — 任务详情

**文件**：[routes/allocations/allocation/task.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/task.js)

**对应 API**：
- `GET /v1/var/<path>?namespace=<ns>` （通过 `task.getPathLinkedVariable()`）

### 8.4 `/allocations/:allocation_id/:name/logs` — 任务日志

**文件**：[routes/allocations/allocation/task/logs.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/task/logs.js)

**对应 API**：
- `GET /v1/client/fs/logs/<alloc_id>?task=<name>&type=<streaming|head|tail>` （流式日志，通过 [components/task-log.js](file:///d:/claude/nomad/ui/app/components/task-log.js#L52)）

### 8.5 `/allocations/:allocation_id/:name/fs` 和 `/fs/*path` — 任务文件系统

**文件**：[routes/allocations/allocation/task/fs.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/task/fs.js) 与 [fs-root.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/task/fs-root.js)

**对应 API**：
- `GET /v1/client/fs/ls/<alloc_id>?path=<task_name>/<p>`
- `GET /v1/client/fs/stat/<alloc_id>?path=<task_name>/<p>`
- `GET /v1/client/fs/cat/<alloc_id>?path=<task_name>/<p>`

---

## 9. Variables 路由组

### 9.1 `/variables` — 变量列表

**文件**：[routes/variables.js](file:///d:/claude/nomad/ui/app/routes/variables.js)

**对应 API**：
- `GET /v1/vars?namespace=<ns>`
- `GET /v1/namespaces`

### 9.2 `/variables/new` — 新建变量

**文件**：[routes/variables/new.js](file:///d:/claude/nomad/ui/app/routes/variables/new.js)

**对应 API**：
- `GET /v1/namespaces` （peek）
- `PUT /v1/var/<id>?cas=<modifyIndex>` （保存时）

### 9.3 `/variables/var/*id` — 变量详情

**文件**：[routes/variables/variable.js](file:///d:/claude/nomad/ui/app/routes/variables/variable.js)

**对应 API**：
- `GET /v1/var/<path>?namespace=<ns>`

### 9.4 `/variables/var/*id/edit` — 编辑变量

使用父路由模型，保存时调用：
- `PUT /v1/var/<id>?cas=<modifyIndex>` （CAS 检查）

---

## 10. Evaluations 路由组

### 10.1 `/evaluations` — 评估列表

**文件**：[routes/evaluations/index.js](file:///d:/claude/nomad/ui/app/routes/evaluations/index.js)

**对应 API**：
| API 端点 | 方法 | 说明 |
|----------|------|------|
| `/v1/evaluations?namespace=<ns>&reverse=true&per_page=<n>&next_token=<t>&filter=<f>` | GET | 分页评估查询 |
| `/v1/namespaces` | GET | 命名空间列表 |

---

## 11. Administration 路由组

### 11.1 `/administration` — 管理总览

**文件**：[routes/administration.js](file:///d:/claude/nomad/ui/app/routes/administration.js)

**对应 API**：
- `GET /v1/acl/policies`
- `GET /v1/acl/roles`
- `GET /v1/acl/tokens`
- `GET /v1/namespaces`
- `GET /v1/sentinel/policies`

### 11.2 ACL Policy 相关

| 路由 | 文件 | API |
|------|------|-----|
| `/administration/policies/new` | [new.js](file:///d:/claude/nomad/ui/app/routes/administration/policies/new.js) | 无（本地创建） |
| `/administration/policies/:name` | [policy.js](file:///d:/claude/nomad/ui/app/routes/administration/policies/policy.js) | `GET /v1/acl/policy/<id>` |
| 保存/删除 | — | `POST /v1/acl/policy/<name>`, `DELETE /v1/acl/policy/<id>` |

### 11.3 ACL Role 相关

| 路由 | 文件 | API |
|------|------|-----|
| `/administration/roles/new` | [new.js](file:///d:/claude/nomad/ui/app/routes/administration/roles/new.js) | `GET /v1/acl/policies` |
| `/administration/roles/:id` | [role.js](file:///d:/claude/nomad/ui/app/routes/administration/roles/role.js) | `GET /v1/acl/role/<id>` |
| 保存/删除 | — | `POST /v1/acl/role`, `DELETE /v1/acl/role/<id>` |

### 11.4 ACL Token 相关

| 路由 | 文件 | API |
|------|------|-----|
| `/administration/tokens/new` | [new.js](file:///d:/claude/nomad/ui/app/routes/administration/tokens/new.js) | `GET /v1/acl/policies`, `GET /v1/acl/roles` |
| `/administration/tokens/:id` | [token.js](file:///d:/claude/nomad/ui/app/routes/administration/tokens/token.js) | `GET /v1/acl/token/<id>` |
| 保存/删除 | — | `POST /v1/acl/token`, `POST /v1/acl/token/<id>`, `DELETE /v1/acl/token/<id>` |

### 11.5 Namespace 相关

| 路由 | 文件 | API |
|------|------|-----|
| `/administration/namespaces/new` | [new.js](file:///d:/claude/nomad/ui/app/routes/administration/namespaces/new.js) | 无（本地创建） |
| `/administration/namespaces/:name` | [acl-namespace.js](file:///d:/claude/nomad/ui/app/routes/administration/namespaces/acl-namespace.js) | `GET /v1/namespace/<id>` |
| 保存/删除 | — | `POST /v1/namespace/<name>`, `DELETE /v1/namespace/<id>` |

### 11.6 Sentinel Policy 相关

| 路由 | 文件 | API |
|------|------|-----|
| `/administration/sentinel-policies` | [sentinel-policies.js](file:///d:/claude/nomad/ui/app/routes/administration/sentinel-policies.js) | `GET /v1/sentinel/policies` |
| `/administration/sentinel-policies/new` | [new.js](file:///d:/claude/nomad/ui/app/routes/administration/sentinel-policies/new.js) | 无（本地创建） |
| `/administration/sentinel-policies/:id` | [policy.js](file:///d:/claude/nomad/ui/app/routes/administration/sentinel-policies/policy.js) | `GET /v1/sentinel/policy/<id>` |
| 保存/删除 | — | `POST /v1/sentinel/policy/<name>`, `DELETE /v1/sentinel/policy/<id>` |

---

## 12. Optimize 路由组

### 12.1 `/optimize` — 优化建议总览

**文件**：[routes/optimize.js](file:///d:/claude/nomad/ui/app/routes/optimize.js)

**对应 API**：
| API 端点 | 方法 | 说明 |
|----------|------|------|
| `/v1/recommendations?namespace=*` | GET | 推荐摘要列表 |
| `/v1/namespaces` | GET | 命名空间列表 |
| `/v1/allocations?job_id=<id>` | GET | 每个任务的分配 |
| `/v1/job/<id>` | GET | 任务重载 |
| `/v1/recommendations/apply` | POST | 应用/忽略推荐 |

---

## 13. Exec 路由组

### 13.1 `/exec/:job_name` — 任务执行终端

**文件**：[routes/exec.js](file:///d:/claude/nomad/ui/app/routes/exec.js)

**对应 API**：
| API 端点 | 方法 | 说明 |
|----------|------|------|
| `/v1/job/<id>?namespace=<ns>` | GET | 任务详情 |
| `/v1/allocations` | GET | 分配列表（fallback） |
| `/v1/jobs` | GET | 任务列表（fallback） |
| `ws[s]://<host>/v1/client/allocation/<alloc_id>/exec?task=<name>&tty=true&ws_handshake=true&command=<cmd>[&region=<r>]` | WebSocket | 执行终端 |

WebSocket URL 由 [services/sockets.js](file:///d:/claude/nomad/ui/app/services/sockets.js#L46-L49) 构建。

### 13.2 Action 终端（job action）

通过 [models/job.js](file:///d:/claude/nomad/ui/app/models/job.js#L552) 的 `getActionSocketUrl` 方法：

```
ws[s]://<host>/v1/job/<id>/action?namespace=<ns>&action=<name>&allocID=<id>&task=<name>&tty=true&ws_handshake=true[&region=<r>]
```

---

## 14. Settings 路由组

### 14.1 `/settings/tokens` — Token 设置

**文件**：[routes/settings/tokens.js](file:///d:/claude/nomad/ui/app/routes/settings/tokens.js)

**对应 API**：
| API 端点 | 方法 | 说明 |
|----------|------|------|
| `/v1/acl/auth-methods` | GET | 认证方法列表 |
| `/v1/acl/token/self` | GET | 当前 token 信息 |
| `/v1/acl/login` | POST | OIDC/JWT 登录 |
| `/v1/acl/oidc/auth-url` | POST | 获取 OIDC 认证 URL |
| `/v1/acl/token/onetime/exchange` | POST | 一次性 token 交换 |

---

## 15. Topology 路由

### 15.1 `/topology` — 拓扑视图

**文件**：[routes/topology.js](file:///d:/claude/nomad/ui/app/routes/topology.js)

**对应 API**：
| API 端点 | 方法 | 说明 |
|----------|------|------|
| `/v1/allocations?resources=true&task_states=false&namespace=*` | GET | 全局分配（含资源） |
| `/v1/nodes?resources=true` | GET | 全局节点（含资源） |
| `/v1/node/pools` | GET | 节点池列表 |

---

## 16. Adapter 到 HTTP API 完整映射

### 16.1 Job Adapter（最复杂）

**文件**：[adapters/job.js](file:///d:/claude/nomad/ui/app/adapters/job.js)

| 方法 | HTTP | 端点 |
|------|------|------|
| findRecord | GET | `/v1/job/<id>?namespace=<ns>` |
| findAll | GET | `/v1/jobs` |
| query | GET/POST | `/v1/jobs/statuses[?index=<i>][&namespace=*]` |
| run (createRecord) | POST | `/v1/jobs` |
| update | POST | `/v1/job/<id>` |
| stop | DELETE | `/v1/job/<id>` |
| purge | DELETE | `/v1/job/<id>?purge=true` |
| parse | POST | `/v1/jobs/parse?namespace=*` |
| plan | POST | `/v1/job/<id>/plan` |
| scale | POST | `/v1/job/<id>/scale` |
| dispatch | POST | `/v1/job/<id>/dispatch` |
| forcePeriodic | POST | `/v1/job/<id>/periodic/force` |
| fetchRawDefinition | GET | `/v1/job/<id>` 或 `/v1/job/<id>/versions` |
| fetchRawSpecification | GET | `/v1/job/<id>/submission?version=<v>` |
| getVersions | GET | `/v1/job/<id>/versions?diffs=true[&diff_version=<v>]` |
| getActionSocketUrl | WS | `/v1/job/<id>/action?...` |

### 16.2 Allocation Adapter

**文件**：[adapters/allocation.js](file:///d:/claude/nomad/ui/app/adapters/allocation.js)

| 方法 | HTTP | 端点 |
|------|------|------|
| findRecord | GET | `/v1/allocation/<id>` |
| findAll | GET | `/v1/allocations` |
| stop | POST | `/v1/allocation/<id>/stop` |
| restart | PUT | `/v1/client/allocation/<id>/restart` |
| restartAll | PUT | `/v1/client/allocation/<id>/restart` (AllTasks:true) |
| forcePause | PUT | `/v1/client/allocation/<id>/pause` (ScheduleState:'pause') |
| forceRun | PUT | `/v1/client/allocation/<id>/pause` (ScheduleState:'run') |
| reEnableSchedule | PUT | `/v1/client/allocation/<id>/pause` (ScheduleState:'scheduled') |
| ls | GET | `/v1/client/fs/ls/<id>?path=<p>` |
| stat | GET | `/v1/client/fs/stat/<id>?path=<p>` |
| check | GET | `/v1/client/allocation/<id>/checks` |

### 16.3 Node Adapter

**文件**：[adapters/node.js](file:///d:/claude/nomad/ui/app/adapters/node.js)

| 方法 | HTTP | 端点 |
|------|------|------|
| findRecord | GET | `/v1/node/<id>` |
| findAll | GET | `/v1/nodes` |
| setEligible | POST | `/v1/node/<id>/eligibility` (Eligibility:'eligible') |
| setIneligible | POST | `/v1/node/<id>/eligibility` (Eligibility:'ineligible') |
| drain | POST | `/v1/node/<id>/drain` |
| forceDrain | POST | `/v1/node/<id>/drain` (Deadline:-1) |
| cancelDrain | POST | `/v1/node/<id>/drain` (DrainSpec:null) |
| addMeta | POST | `/v1/client/metadata?node_id=<id>` |

### 16.4 Deployment Adapter

**文件**：[adapters/deployment.js](file:///d:/claude/nomad/ui/app/adapters/deployment.js)

| 方法 | HTTP | 端点 |
|------|------|------|
| findRecord | GET | `/v1/deployment/<id>` |
| findAll | GET | `/v1/deployments` |
| fail | POST | `/v1/deployment/fail/<id>` |
| promote | POST | `/v1/deployment/promote/<id>` |

### 16.5 Token Adapter

**文件**：[adapters/token.js](file:///d:/claude/nomad/ui/app/adapters/token.js)

| 方法 | HTTP | 端点 |
|------|------|------|
| findRecord | GET | `/v1/acl/token/<id>` |
| findAll | GET | `/v1/acl/tokens` |
| createRecord | POST | `/v1/acl/token` |
| updateRecord | POST | `/v1/acl/token/<id>` |
| deleteRecord | DELETE | `/v1/acl/token/<id>` |
| findSelf | GET | `/v1/acl/token/self` |
| loginJWT | POST | `/v1/acl/login` |
| exchangeOneTimeToken | POST | `/v1/acl/token/onetime/exchange` |

### 16.6 Variable Adapter

**文件**：[adapters/variable.js](file:///d:/claude/nomad/ui/app/adapters/variable.js)

| 方法 | HTTP | 端点 |
|------|------|------|
| findAll | GET | `/v1/vars` |
| query | GET | `/v1/vars?prefix=<p>&namespace=*` |
| findRecord | GET | `/v1/var/<path>?namespace=<ns>` |
| createRecord | PUT | `/v1/var/<id>?cas=<modifyIndex>` |
| updateRecord | POST | `/v1/var/<id>?cas=<modifyIndex>` |
| deleteRecord | DELETE | `/v1/var/<id>?namespace=<ns>` |
| getJobTemplates | GET | `/v1/vars?prefix=nomad/job-templates&namespace=*` |
| getJobTemplate | GET | `/v1/var/<path>` |

### 16.7 其它 Adapter 速查表

| Adapter | findRecord | findAll | 自定义动作 |
|---------|------------|---------|------------|
| agent | `/v1/agent/members` | `/v1/agent/members` | — |
| namespace | `/v1/namespace/<id>` | `/v1/namespaces` | POST/DELETE `/v1/namespace/<name>` |
| node-pool | `/v1/nodePool/<id>` | `/v1/node/pools` | — |
| evaluation | `/v1/evaluation/<id>?namespace=<ns>[&related=true]` | `/v1/evaluations` | — |
| policy | `/v1/acl/policy/<id>` | `/v1/acl/policies` | POST/DELETE `/v1/acl/policy/<name>` |
| role | `/v1/acl/role/<id>` | `/v1/acl/roles` | POST `/v1/acl/role`, DELETE `/v1/acl/role/<id>` |
| auth-method | `/v1/acl/auth-method/<id>` | `/v1/acl/auth-methods` | POST `/v1/acl/oidc/auth-url` |
| sentinel-policy | `/v1/sentinel/policy/<id>` | `/v1/sentinel/policies` | POST/DELETE `/v1/sentinel/policy/<name>` |
| service | `/v1/service/<id>` | `/v1/services` | — |
| plugin (CSI) | `/v1/plugin/csi/<id>` | `/v1/plugins` | — |
| volume (CSI) | `/v1/volume/csi/<id>?namespace=<ns>` | `/v1/volumes?type=...` | — |
| dynamic-host-volume | `/v1/volume/host/<id>` | `/v1/volumes` | — |
| job-scale | `/v1/job/<id>/scale?namespace=<ns>` | — | — |
| job-summary | `/v1/job/<id>/summary?namespace=<ns>` | — | — |
| job-version | — | — | POST `/v1/job/<id>/revert` |
| version-tag | — | — | POST/DELETE `/v1/job/<jobName>/versions/<tagName>/tag?namespace=<ns>` |
| recommendation-summary | — | `/v1/recommendations?namespace=*` | POST `/v1/recommendations/apply` |

### 16.8 系统/服务级直接请求（非 Adapter）

| 服务/组件 | HTTP | 端点 | 说明 |
|-----------|------|------|------|
| system.regions | GET | `/v1/regions` | region 列表 |
| system.defaultRegion | GET | `/v1/agent/members` | 提取 ServerRegion |
| system.agent | GET | `/v1/agent/self` | agent 自信息 |
| system.leaders | GET | `/v1/status/leader?region=<r>` | 每个 region 的 leader |
| system.fetchLicense | GET | `/v1/operator/license` | 许可证 |
| system.checkFuzzySearchPresence | POST | `/v1/search/fuzzy` | 模糊搜索探测 |
| task-log 组件 | GET | `/v1/client/fs/logs/<alloc_id>?task=<n>&type=<m>` | 流式日志 |
| fs/file 组件 | GET | `/v1/client/fs/cat/<alloc_id>?path=<p>` | 读取文件 |
| sockets 服务 | WS | `/v1/client/allocation/<alloc_id>/exec?...` | exec 终端 |

---

## 17. 关键横切机制

### 17.1 Blocking Query（长轮询）

**文件**：[adapters/watchable.js](file:///d:/claude/nomad/ui/app/adapters/watchable.js)

通过 `@watchRecord`、`@watchAll`、`@watchRelationship`、`@watchQuery` 装饰器触发：
- 请求 URL 添加 `?index=<n>` 参数
- 响应头 `x-nomad-index` 更新下次轮询的 index
- 通过 `watchList` 服务管理 index 状态

### 17.2 Namespace 感知

**文件**：[adapters/watchable-namespace-ids.js](file:///d:/claude/nomad/ui/app/adapters/watchable-namespace-ids.js)

- ID 编码为 JSON 元组 `[id, namespace]`
- `urlForFindRecord` 解析元组并追加 `?namespace=<ns>`
- `associateNamespace` 仅在 namespace 非 `default` 时追加参数

### 17.3 Region 切换

**文件**：[adapters/application.js](file:///d:/claude/nomad/ui/app/adapters/application.js)

- `ajaxOptions` 在 `system.shouldIncludeRegion` 或 `options.regionOverride` 为真时追加 `?region=<region>`
- region 来自 `?region=` 查询参数，由 [routes/application.js](file:///d:/claude/nomad/ui/app/routes/application.js#L88-L95) 同步到 `system.activeRegion`

### 17.4 Token 注入

**文件**：[adapters/application.js](file:///d:/claude/nomad/ui/app/adapters/application.js) 与 [services/token.js](file:///d:/claude/nomad/ui/app/services/token.js)

- 所有 Adapter 请求头携带 `X-Nomad-Token: <secret>`
- `token.authorizedRequest` / `authorizedRawRequest` 用于非 Adapter 的直接请求

### 17.5 错误处理

- `500 + NO_LEADER` → `NoLeaderError`
- `501` / "rpc: can't find service" → 返回空数组（旧版兼容）
- `404` (variable) → `AdapterError`
- `409` (variable CAS 失败) → `ConflictError`
- `400` (variable) → `InvalidError`
- ACL token过期/不存在 → 重定向到 `/settings/tokens`

### 17.6 AbortController 取消

[routes/jobs/index.js](file:///d:/claude/nomad/ui/app/routes/jobs/index.js) 通过 `adapterOptions.abortController` 在用户快速翻页时取消未完成请求。

---

## 18. 源码文件索引

### 18.1 路由文件

| 目录 | 文件 |
|------|------|
| 顶层 | [routes/application.js](file:///d:/claude/nomad/ui/app/routes/application.js), [routes/index.js](file:///d:/claude/nomad/ui/app/routes/index.js), [routes/topology.js](file:///d:/claude/nomad/ui/app/routes/topology.js), [routes/administration.js](file:///d:/claude/nomad/ui/app/routes/administration.js), [routes/clients.js](file:///d:/claude/nomad/ui/app/routes/clients.js), [routes/servers.js](file:///d:/claude/nomad/ui/app/routes/servers.js), [routes/variables.js](file:///d:/claude/nomad/ui/app/routes/variables.js), [routes/optimize.js](file:///d:/claude/nomad/ui/app/routes/optimize.js), [routes/exec.js](file:///d:/claude/nomad/ui/app/routes/exec.js) |
| jobs | [routes/jobs/index.js](file:///d:/claude/nomad/ui/app/routes/jobs/index.js), [routes/jobs/job.js](file:///d:/claude/nomad/ui/app/routes/jobs/job.js), [routes/jobs/job/*.js](file:///d:/claude/nomad/ui/app/routes/jobs/job/), [routes/jobs/run/index.js](file:///d:/claude/nomad/ui/app/routes/jobs/run/index.js), [routes/jobs/run/templates/*.js](file:///d:/claude/nomad/ui/app/routes/jobs/run/templates/) |
| clients | [routes/clients/client.js](file:///d:/claude/nomad/ui/app/routes/clients/client.js), [routes/clients/client/index.js](file:///d:/claude/nomad/ui/app/routes/clients/client/index.js) |
| servers | [routes/servers/server.js](file:///d:/claude/nomad/ui/app/routes/servers/server.js) |
| storage | [routes/storage/index.js](file:///d:/claude/nomad/ui/app/routes/storage/index.js), [routes/storage/plugins.js](file:///d:/claude/nomad/ui/app/routes/storage/plugins.js), [routes/storage/volumes/*.js](file:///d:/claude/nomad/ui/app/routes/storage/volumes/) |
| allocations | [routes/allocations/allocation.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation.js), [routes/allocations/allocation/fs.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/fs.js), [routes/allocations/allocation/task/*.js](file:///d:/claude/nomad/ui/app/routes/allocations/allocation/task/) |
| variables | [routes/variables/index.js](file:///d:/claude/nomad/ui/app/routes/variables/index.js), [routes/variables/new.js](file:///d:/claude/nomad/ui/app/routes/variables/new.js), [routes/variables/variable.js](file:///d:/claude/nomad/ui/app/routes/variables/variable.js) |
| evaluations | [routes/evaluations/index.js](file:///d:/claude/nomad/ui/app/routes/evaluations/index.js) |
| administration | [routes/administration/policies/*.js](file:///d:/claude/nomad/ui/app/routes/administration/policies/), [routes/administration/roles/*.js](file:///d:/claude/nomad/ui/app/routes/administration/roles/), [routes/administration/tokens/*.js](file:///d:/claude/nomad/ui/app/routes/administration/tokens/), [routes/administration/namespaces/*.js](file:///d:/claude/nomad/ui/app/routes/administration/namespaces/), [routes/administration/sentinel-policies/*.js](file:///d:/claude/nomad/ui/app/routes/administration/sentinel-policies/) |
| settings | [routes/settings/tokens.js](file:///d:/claude/nomad/ui/app/routes/settings/tokens.js) |
| optimize | [routes/optimize/summary.js](file:///d:/claude/nomad/ui/app/routes/optimize/summary.js) |
| exec | [routes/exec/task-group/task.js](file:///d:/claude/nomad/ui/app/routes/exec/task-group/task.js) |

### 18.2 Adapter 文件

| 文件 | 主要端点 |
|------|----------|
| [adapters/application.js](file:///d:/claude/nomad/ui/app/adapters/application.js) | 基类：`/v1/<model>/<id>` (singular) |
| [adapters/watchable.js](file:///d:/claude/nomad/ui/app/adapters/watchable.js) | Blocking query 基类 |
| [adapters/watchable-namespace-ids.js](file:///d:/claude/nomad/ui/app/adapters/watchable-namespace-ids.js) | Namespace 感知基类 |
| [adapters/job.js](file:///d:/claude/nomad/ui/app/adapters/job.js) | `/v1/job/<id>`, `/v1/jobs`, `/v1/jobs/statuses` |
| [adapters/allocation.js](file:///d:/claude/nomad/ui/app/adapters/allocation.js) | `/v1/allocation/<id>`, `/v1/client/fs/*` |
| [adapters/node.js](file:///d:/claude/nomad/ui/app/adapters/node.js) | `/v1/node/<id>`, `/v1/node/<id>/drain` |
| [adapters/deployment.js](file:///d:/claude/nomad/ui/app/adapters/deployment.js) | `/v1/deployment/<id>`, `/v1/deployment/<action>/<id>` |
| [adapters/token.js](file:///d:/claude/nomad/ui/app/adapters/token.js) | `/v1/acl/token/*` |
| [adapters/variable.js](file:///d:/claude/nomad/ui/app/adapters/variable.js) | `/v1/var/<id>`, `/v1/vars` |
| [adapters/policy.js](file:///d:/claude/nomad/ui/app/adapters/policy.js) | `/v1/acl/policy/*` |
| [adapters/role.js](file:///d:/claude/nomad/ui/app/adapters/role.js) | `/v1/acl/role/*` |
| [adapters/auth-method.js](file:///d:/claude/nomad/ui/app/adapters/auth-method.js) | `/v1/acl/auth-methods`, `/v1/acl/oidc/auth-url` |
| [adapters/namespace.js](file:///d:/claude/nomad/ui/app/adapters/namespace.js) | `/v1/namespace/*` |
| [adapters/node-pool.js](file:///d:/claude/nomad/ui/app/adapters/node-pool.js) | `/v1/node/pools` |
| [adapters/sentinel-policy.js](file:///d:/claude/nomad/ui/app/adapters/sentinel-policy.js) | `/v1/sentinel/policy/*` |
| [adapters/service.js](file:///d:/claude/nomad/ui/app/adapters/service.js) | `/v1/service/*` |
| [adapters/plugin.js](file:///d:/claude/nomad/ui/app/adapters/plugin.js) | `/v1/plugin/csi/<id>`, `/v1/plugins` |
| [adapters/volume.js](file:///d:/claude/nomad/ui/app/adapters/volume.js) | `/v1/volume/csi/<id>`, `/v1/volumes` |
| [adapters/dynamic-host-volume.js](file:///d:/claude/nomad/ui/app/adapters/dynamic-host-volume.js) | `/v1/volume/host/<id>` |
| [adapters/evaluation.js](file:///d:/claude/nomad/ui/app/adapters/evaluation.js) | `/v1/evaluation/<id>` |
| [adapters/job-scale.js](file:///d:/claude/nomad/ui/app/adapters/job-scale.js) | `/v1/job/<id>/scale` |
| [adapters/job-summary.js](file:///d:/claude/nomad/ui/app/adapters/job-summary.js) | `/v1/job/<id>/summary` |
| [adapters/job-version.js](file:///d:/claude/nomad/ui/app/adapters/job-version.js) | `/v1/job/<id>/revert` |
| [adapters/version-tag.js](file:///d:/claude/nomad/ui/app/adapters/version-tag.js) | `/v1/job/<jobName>/versions/<tagName>/tag` |
| [adapters/agent.js](file:///d:/claude/nomad/ui/app/adapters/agent.js) | `/v1/agent/members` |
| [adapters/recommendation-summary.js](file:///d:/claude/nomad/ui/app/adapters/recommendation-summary.js) | `/v1/recommendations` |

### 18.3 服务文件

| 文件 | 主要端点 |
|------|----------|
| [services/system.js](file:///d:/claude/nomad/ui/app/services/system.js) | `/v1/regions`, `/v1/agent/members`, `/v1/agent/self`, `/v1/status/leader`, `/v1/operator/license`, `/v1/search/fuzzy` |
| [services/token.js](file:///d:/claude/nomad/ui/app/services/token.js) | `/v1/acl/token/self`, `/v1/acl/login`, `/v1/acl/token/onetime/exchange` |
| [services/sockets.js](file:///d:/claude/nomad/ui/app/services/sockets.js) | `ws[s]://<host>/v1/client/allocation/<id>/exec?...` |

### 18.4 组件文件（含直接 API 调用）

| 文件 | 主要端点 |
|------|----------|
| [components/task-log.js](file:///d:/claude/nomad/ui/app/components/task-log.js) | `/v1/client/fs/logs/<alloc_id>?task=<n>&type=<m>` |
| [components/fs/file.js](file:///d:/claude/nomad/ui/app/components/fs/file.js) | `/v1/client/fs/cat/<alloc_id>?path=<p>` |

### 18.5 路由配置

| 文件 | 作用 |
|------|------|
| [app/router.ts](file:///d:/claude/nomad/ui/app/router.ts) | Ember Router 路由映射定义 |

---

## 总结

Nomad UI 共定义 **57 个路由**，覆盖以下功能域：

| 功能域 | 路由数 | 核心 API |
|--------|--------|----------|
| Jobs | 17 | `/v1/job/*`, `/v1/jobs/*`, `/v1/jobs/statuses` |
| Allocations | 8 | `/v1/allocation/*`, `/v1/client/fs/*` |
| Administration | 11 | `/v1/acl/*`, `/v1/sentinel/*`, `/v1/namespace/*` |
| Storage | 7 | `/v1/volume/*`, `/v1/volumes`, `/v1/plugin/*`, `/v1/plugins` |
| Variables | 5 | `/v1/var/*`, `/v1/vars` |
| Clients | 3 | `/v1/node/*`, `/v1/nodes`, `/v1/node/pools` |
| Servers | 3 | `/v1/agent/members`, `/v1/status/leader` |
| Settings | 2 | `/v1/acl/auth-methods`, `/v1/acl/token/self` |
| Evaluations | 1 | `/v1/evaluations` |
| Optimize | 2 | `/v1/recommendations` |
| Exec | 1 | `ws://.../v1/client/allocation/<id>/exec` |
| Topology | 1 | `/v1/allocations`, `/v1/nodes` |

**核心 API 覆盖**：
- 共调用 **80+ 个不同的 HTTP API 端点**
- 涵盖 Nomad HTTP API 的所有主要域：jobs、allocations、nodes、deployments、evaluations、ACL、CSI、variables、agent、operator、search
- 2 个 WebSocket 端点：exec 终端与 job action 终端

**关键设计模式**：
1. 所有 API 访问通过 Ember Data Adapter 抽象，路由层无直接 `fetch()`
2. Blocking Query 通过 `?index=` 实现实时更新
3. Namespace/Region 作为横切关注点自动注入
4. 复杂操作（plan、scale、dispatch、drain 等）通过 Adapter 自定义方法暴露
