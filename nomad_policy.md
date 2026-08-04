# Nomad ACL Policy 技术机制深度分析

## 概述

Nomad ACL Policy 是 Nomad 访问控制系统的核心权限单元。一个 Policy 包含一组 HCL/JSON 格式的规则，定义了对各类资源（命名空间、节点池、主机卷、Agent、Operator 等）的访问权限。Policy 通过 Token 和 Role 关联到最终用户，由 Raft 共识协议持久化，在运行时编译为基于 Radix Tree 的高效权限评估器。

---

## 一、核心数据结构

### 1.1 ACLPolicy 结构体

定义在 [nomad/structs/acl.go](file:///D:/claude/nomad/nomad/structs/acl.go#L308-L319)：

```go
type ACLPolicy struct {
    Name        string      // 唯一名称，匹配 ^[a-zA-Z0-9-]{1,128}$
    Description string      // 人类可读描述，最大 256 字符
    Rules       string      // HCL 或 JSON 格式的规则文本
    RulesJSON   *acl.Policy // 从 Rules 解析生成，仅在读取时填充
    JobACL      *JobACL     // 可选的 Job 级别作用域
    Hash        []byte      // 256 位 Blake2b 哈希
    CreateIndex uint64      // 创建时的 Raft 索引
    ModifyIndex uint64      // 最后修改的 Raft 索引
}
```

### 1.2 JobACL 结构体

定义在 [nomad/structs/acl.go](file:///D:/claude/nomad/nomad/structs/acl.go#L321-L327)：

```go
type JobACL struct {
    Namespace string // Job 所在命名空间
    JobID     string // Job ID
    Group     string // Task Group ID
    Task      string // Task ID
}
```

**依赖链约束**：`Namespace → JobID → Group → Task`，子级存在时父级必须存在。

### 1.3 ACLPolicyListStub 结构体

定义在 [nomad/structs/acl.go](file:///D:/claude/nomad/nomad/structs/acl.go#L400-L408)：

```go
type ACLPolicyListStub struct {
    Name        string
    Description string
    JobACL      *JobACL
    Hash        []byte
    CreateIndex uint64
    ModifyIndex uint64
}
```

列表查询时返回的轻量表示，省略了 `Rules` 和 `RulesJSON` 字段。

### 1.4 请求/响应类型

定义在 [nomad/structs/acl.go](file:///D:/claude/nomad/nomad/structs/acl.go#L410-L455)：

| 类型 | 用途 |
|-----|------|
| `ACLPolicyListRequest` | 列出所有策略 |
| `ACLPolicySpecificRequest` | 查询单个策略 |
| `ACLPolicySetRequest` | 批量查询策略集 |
| `ACLPolicyDeleteRequest` | 删除策略 |
| `ACLPolicyUpsertRequest` | 创建/更新策略 |
| `ACLPolicyListResponse` | 列表响应 |
| `SingleACLPolicyResponse` | 单个策略响应 |
| `ACLPolicySetResponse` | 策略集响应 |

---

## 二、规则解析与验证

### 2.1 解析后的 Policy 结构

定义在 [acl/policy.go](file:///D:/claude/nomad/acl/policy.go#L157-L180)：

```go
type Policy struct {
    Namespaces  []*NamespacePolicy  `hcl:"namespace,expand"`
    NodePools   []*NodePoolPolicy   `hcl:"node_pool,expand"`
    HostVolumes []*HostVolumePolicy `hcl:"host_volume,expand"`
    Agent       *AgentPolicy        `hcl:"agent"`
    Node        *NodePolicy         `hcl:"node"`
    Operator    *OperatorPolicy     `hcl:"operator"`
    Sentinel    *SentinelPolicy     `hcl:"sentinel"`
    Quota       *QuotaPolicy        `hcl:"quota"`
    Plugin      *PluginPolicy       `hcl:"plugin"`
    Raw         string              `hcl:"-"`
    ExtraKeysHCL []string           `hcl:",unusedKeys"`
}
```

### 2.2 子策略结构

定义在 [acl/policy.go](file:///D:/claude/nomad/acl/policy.go#L204-L259)：

```go
// 命名空间策略
type NamespacePolicy struct {
    Name         string `hcl:",key"`
    Policy       string           // 简写访问级别
    Capabilities []string         // 细粒度能力列表
    Variables    *VariablesPolicy `hcl:"variables"`
}

// 变量路径策略
type VariablesPathPolicy struct {
    PathSpec     string `hcl:",key"`
    Capabilities []string
}

// 节点池策略
type NodePoolPolicy struct {
    Name         string `hcl:",key"`
    Policy       string
    Capabilities []string
}

// 主机卷策略
type HostVolumePolicy struct {
    Name         string `hcl:",key"`
    Policy       string
    Capabilities []string
}

// 仅支持 Policy 简写的策略
type AgentPolicy struct { Policy string }
type NodePolicy struct { Policy string }
type QuotaPolicy struct { Policy string }
type PluginPolicy struct { Policy string }

// 同时支持 Policy 和 Capabilities 的策略
type OperatorPolicy struct { Policy string; Capabilities []string }
type SentinelPolicy struct { Policy string; Capabilities []string }
```

### 2.3 访问级别常量

定义在 [acl/policy.go](file:///D:/claude/nomad/acl/policy.go#L17-L26)：

```go
PolicyDeny  = "deny"   // 最高优先级，拒绝所有
PolicyRead  = "read"   // 只读
PolicyList  = "list"   // 列表（仅 Plugin 支持）
PolicyWrite = "write"  // 读写
PolicyScale = "scale"  // 缩放（仅 Namespace 支持）
```

### 2.4 Parse 函数

定义在 [acl/policy.go](file:///D:/claude/nomad/acl/policy.go#L549-L730)，签名：`func Parse(rules string, strict bool) (*Policy, error)`

**解析模式**（[acl/policy.go](file:///D:/claude/nomad/acl/policy.go#L526-L537)）：

| 模式 | 常量 | 用途 |
|-----|------|------|
| 严格模式 | `PolicyParseStrict = true` | 创建/更新时使用，拒绝未知 HCL 键 |
| 宽松模式 | `PolicyParseLenient = false` | 运行时评估使用，忽略未知键 |

**解析流程**：

```
输入: HCL/JSON 规则文本
          │
          ▼
┌──────────────────────┐
│ 1. 空规则快速返回      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 2. HCL 解码           │
│    (含 panic 恢复)     │
│    修复缺失标签问题    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 3. Namespace 验证循环  │
│    - 名称正则校验      │
│    - Policy 简写校验   │
│    - Capabilities 校验 │
│    - 简写展开为能力集   │
│    - 隐式能力补充      │
│    - Variables 路径验证 │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 4. NodePool 验证循环   │
│    (同上模式)          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 5. HostVolume 验证循环 │
│    (同上模式)          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 6. 严格模式检查        │
│    ExtraKeysHCL       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 7. 顶层块验证          │
│    Agent/Node/Operator │
│    Sentinel/Quota/Plugin│
└──────────────────────┘
```

### 2.5 Validate 方法

定义在 [nomad/structs/acl.go](file:///D:/claude/nomad/nomad/structs/acl.go#L368-L398)：

```go
func (a *ACLPolicy) Validate() error {
    var mErr multierror.Error
    // 1. 名称格式校验
    if !ValidPolicyName.MatchString(a.Name) { ... }
    // 2. 规则解析（严格模式）
    if _, err := acl.Parse(a.Rules, acl.PolicyParseStrict); err != nil { ... }
    // 3. 描述长度校验
    if len(a.Description) > maxPolicyDescriptionLength { ... }
    // 4. JobACL 依赖链校验
    if a.JobACL != nil {
        // JobID 存在时 Namespace 必须存在
        // Group 存在时 JobID 必须存在
        // Task 存在时 Group 必须存在
    }
    return mErr.ErrorOrNil()
}
```

**关键常量**（定义在 [nomad/structs/structs.go](file:///D:/claude/nomad/nomad/structs/structs.go)）：

```go
ValidPolicyName = regexp.MustCompile("^[a-zA-Z0-9-]{1,128}$")  // L56
maxPolicyDescriptionLength = 256                                 // L168
```

---

## 三、能力常量体系

### 3.1 Namespace 能力

定义在 [acl/policy.go](file:///D:/claude/nomad/acl/policy.go#L28-L84)：

| 能力常量 | 值 | 说明 |
|---------|---|------|
| `NamespaceCapabilityDeny` | `deny` | 拒绝 |
| `NamespaceCapabilityListJobs` | `list-jobs` | 列出 Job |
| `NamespaceCapabilityParseJob` | `parse-job` | 解析 Job |
| `NamespaceCapabilityReadJob` | `read-job` | 读取 Job |
| `NamespaceCapabilitySubmitJob` | `submit-job` | 提交 Job |
| `NamespaceCapabilityDispatchJob` | `dispatch-job` | 派发 Job |
| `NamespaceCapabilityReadLogs` | `read-logs` | 读取日志 |
| `NamespaceCapabilityReadFS` | `read-fs` | 读取文件系统 |
| `NamespaceCapabilityAllocExec` | `alloc-exec` | 分配执行 |
| `NamespaceCapabilityAllocNodeExec` | `alloc-node-exec` | 节点执行 |
| `NamespaceCapabilityAllocLifecycle` | `alloc-lifecycle` | 分配生命周期 |
| `NamespaceCapabilitySentinelOverride` | `sentinel-override` | Sentinel 覆盖（企业版） |
| `NamespaceCapabilityCSIRegisterPlugin` | `csi-register-plugin` | CSI 注册插件 |
| `NamespaceCapabilityCSIWriteVolume` | `csi-write-volume` | CSI 写卷 |
| `NamespaceCapabilityCSIReadVolume` | `csi-read-volume` | CSI 读卷 |
| `NamespaceCapabilityCSIListVolume` | `csi-list-volume` | CSI 列表卷 |
| `NamespaceCapabilityCSIMountVolume` | `csi-mount-volume` | CSI 挂载卷 |
| `NamespaceCapabilityHostVolumeCreate` | `host-volume-create` | 创建主机卷 |
| `NamespaceCapabilityHostVolumeRegister` | `host-volume-register` | 注册主机卷 |
| `NamespaceCapabilityHostVolumeRead` | `host-volume-read` | 读取主机卷 |
| `NamespaceCapabilityHostVolumeWrite` | `host-volume-write` | 写入主机卷 |
| `NamespaceCapabilityHostVolumeDelete` | `host-volume-delete` | 删除主机卷 |
| `NamespaceCapabilityListScalingPolicies` | `list-scaling-policies` | 列出缩放策略 |
| `NamespaceCapabilityReadScalingPolicy` | `read-scaling-policy` | 读取缩放策略 |
| `NamespaceCapabilityReadJobScaling` | `read-job-scaling` | 读取 Job 缩放 |
| `NamespaceCapabilityScaleJob` | `scale-job` | 缩放 Job |
| `NamespaceCapabilitySubmitRecommendation` | `submit-recommendation` | 提交建议 |
| `NamespaceCapabilityRegisterJob` | `register-job` | 注册 Job |
| `NamespaceCapabilityRevertJob` | `revert-job` | 回滚 Job |
| `NamespaceCapabilityDeregisterJob` | `deregister-job` | 注销 Job |
| `NamespaceCapabilityPurgeJob` | `purge-job` | 清除 Job |
| `NamespaceCapabilityEvaluateJob` | `evaluate-job` | 评估 Job |
| `NamespaceCapabilityPlanJob` | `plan-job` | 规划 Job |
| `NamespaceCapabilityFailDeployment` | `fail-deployment` | 失败部署 |
| `NamespaceCapabilityPauseDeployment` | `pause-deployment` | 暂停部署 |
| `NamespaceCapabilityPromoteDeployment` | `promote-deployment` | 提升部署 |
| `NamespaceCapabilitySetAllocHealthDeployment` | `set-alloc-health-deployment` | 设置分配健康 |
| `NamespaceCapabilityGCAllocation` | `gc-allocation` | GC 分配 |
| `NamespaceCapabilityForcePeriodicJob` | `force-periodic-job` | 强制周期 Job |
| `NamespaceCapabilityDeleteServiceRegistration` | `delete-service-registration` | 删除服务注册 |

### 3.2 其他资源能力

| 资源 | 能力值 | 文件位置 |
|-----|-------|---------|
| NodePool | `deny`, `read`, `write`, `delete` | [acl/policy.go#L99-L103](file:///D:/claude/nomad/acl/policy.go#L99-L103) |
| HostVolume | `deny`, `mount-readonly`, `mount-readwrite` | [acl/policy.go#L115-L118](file:///D:/claude/nomad/acl/policy.go#L115-L118) |
| Variables | `list`, `read`, `write`, `destroy`, `deny` | [acl/policy.go#L128-L133](file:///D:/claude/nomad/acl/policy.go#L128-L133) |
| Operator | `deny`, `snapshot-save`, `license-read`, `keyring-rotate`, `keyring-read`, `keyring-delete` | [acl/policy.go#L139-L145](file:///D:/claude/nomad/acl/policy.go#L139-L145) |
| Sentinel | `deny`, `sentinel-read`, `sentinel-submit`, `sentinel-delete` | [acl/policy.go#L151-L155](file:///D:/claude/nomad/acl/policy.go#L151-L155) |

---

## 四、简写展开机制

### 4.1 Namespace 简写展开

定义在 [acl/policy.go](file:///D:/claude/nomad/acl/policy.go#L326-L375)：

```
deny  → ["deny"]
read  → [list-jobs, parse-job, read-job, csi-list-volume, csi-read-volume,
         read-job-scaling, list-scaling-policies, read-scaling-policy,
         host-volume-read]
write → read 的所有能力 +
         [scale-job, submit-job, dispatch-job, read-logs, read-fs,
          alloc-exec, alloc-lifecycle, csi-mount-volume, csi-write-volume,
          submit-recommendation, host-volume-create]
scale → [list-scaling-policies, read-scaling-policy, read-job-scaling,
         scale-job, read-job, submit-recommendation]
```

### 4.2 隐式能力展开

定义在 [acl/policy.go](file:///D:/claude/nomad/acl/policy.go#L379-L401)，`expandNamespaceCapabilities` 函数处理主机卷能力的隐式包含：

```
host-volume-write   → 隐含 host-volume-register, host-volume-create,
                      host-volume-delete, host-volume-read
host-volume-register → 隐含 host-volume-create, host-volume-read
host-volume-create   → 隐含 host-volume-read
```

### 4.3 Variables 隐式展开

定义在 [acl/policy.go](file:///D:/claude/nomad/acl/policy.go#L508-L524)：

```
read → 自动添加 list（如果 list 不存在）
deny → 立即返回 ["deny"]，忽略其他能力
```

### 4.4 各资源简写展开对照

| 资源 | `deny` | `read` | `write` |
|-----|-------|-------|--------|
| Namespace | `[deny]` | 9 个读取能力 | 读取能力 + 11 个写入能力 |
| NodePool | `[deny]` | `[read]` | `[delete, read, write]` |
| HostVolume | `[deny]` | `[mount-readonly]` | `[mount-readonly, mount-readwrite]` |
| Operator | `[deny]` | `[license-read, keyring-read]` | `[snapshot-save, license-read, keyring-rotate, keyring-read, keyring-delete]` |
| Sentinel | `[deny]` | `[sentinel-read]` | `[sentinel-read, sentinel-submit, sentinel-delete]` |

---

## 五、运行时权限评估

### 5.1 ACL 评估器结构

定义在 [acl/acl.go](file:///D:/claude/nomad/acl/acl.go#L49-L91)：

```go
type ACL struct {
    management bool  // Management Token 标志

    namespaces         *iradix.Tree[capabilitySet]  // 精确命名空间匹配
    wildcardNamespaces *iradix.Tree[capabilitySet]  // 通配符命名空间
    nodePools         *iradix.Tree[capabilitySet]
    wildcardNodePools *iradix.Tree[capabilitySet]
    hostVolumes         *iradix.Tree[capabilitySet]
    wildcardHostVolumes *iradix.Tree[capabilitySet]
    variables         *iradix.Tree[capabilitySet]
    wildcardVariables *iradix.Tree[capabilitySet]

    agent, node, operator, sentinel, quota, plugin string  // 简写策略值
    operatorCapabilities capabilitySet
    sentinelCapabilities capabilitySet

    client, pool, server string
    isLeader, aclsDisabled bool
}
```

`capabilitySet` 是 `map[string]struct{}`，提供 O(1) 查找。

### 5.2 NewACL 构建过程

定义在 [acl/acl.go](file:///D:/claude/nomad/acl/acl.go#L112-L350)：

```
输入: management bool, policies []*Policy
          │
          ▼
┌──────────────────────────┐
│ Management Token?        │
│ → 返回 &ACL{management:true} │
└──────────┬───────────────┘
           │ 否
           ▼
┌──────────────────────────┐
│ 遍历每个 Policy           │
│  ├─ Namespace 能力合并   │
│  ├─ NodePool 能力合并    │
│  ├─ HostVolume 能力合并  │
│  ├─ Variables 能力合并   │
│  ├─ Agent maxPrivilege   │
│  ├─ Node maxPrivilege    │
│  ├─ Operator 合并        │
│  ├─ Sentinel 合并        │
│  ├─ Quota maxPrivilege   │
│  └─ Plugin maxPrivilege  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ 提交 Radix Tree 事务      │
└──────────────────────────┘
```

### 5.3 Deny 优先机制

**核心原则**：当 `deny` 出现时，清除所有其他能力，仅保留 `deny`。

对于带能力列表的资源（Namespace、NodePool、HostVolume），deny 处理逻辑（[acl/acl.go#L189-L203](file:///D:/claude/nomad/acl/acl.go#L189-L203)）：

```go
// 如果 deny 已存在，跳过后续策略
if capabilities.Check(NamespaceCapabilityDeny) {
    continue NAMESPACES
}
// 添加能力
for _, cap := range ns.Capabilities {
    if cap == NamespaceCapabilityDeny {
        capabilities.Clear()                    // 清除所有已积累能力
        capabilities.Set(NamespaceCapabilityDeny) // 仅设置 deny
        continue NAMESPACES
    }
    capabilities.Set(cap)
}
```

### 5.4 maxPrivilege 函数

定义在 [acl/acl.go](file:///D:/claude/nomad/acl/acl.go#L93-L109)：

```go
func maxPrivilege(a, b string) string {
    switch {
    case a == PolicyDeny || b == PolicyDeny:
        return PolicyDeny      // deny 永远优先
    case a == PolicyWrite || b == PolicyWrite:
        return PolicyWrite     // write 其次
    case a == PolicyRead || b == PolicyRead:
        return PolicyRead      // read 再次
    case a == PolicyList || b == PolicyList:
        return PolicyList       // list 最后
    default:
        return ""              // 空为最低
    }
}
```

**优先级顺序**：`deny > write > read > list > ""`

### 5.5 运行时查询方法

| 方法 | 说明 | 文件位置 |
|-----|------|---------|
| `AllowNamespaceOperation(ns, op)` | 检查命名空间操作权限 | [acl.go#L376-L400](file:///D:/claude/nomad/acl/acl.go#L376-L400) |
| `AllowNamespace(ns)` | 检查命名空间访问权限 | [acl.go#L403-L431](file:///D:/claude/nomad/acl/acl.go#L403-L431) |
| `AllowNodePoolOperation(pool, op)` | 检查节点池操作权限 | [acl.go#L435-L453](file:///D:/claude/nomad/acl/acl.go#L435-L453) |
| `AllowHostVolumeOperation(hv, op)` | 检查主机卷操作权限 | [acl.go#L513-L534](file:///D:/claude/nomad/acl/acl.go#L513-L534) |
| `AllowVariableOperation(ns, path, op, claim)` | 检查变量操作权限 | [acl.go#L558-L576](file:///D:/claude/nomad/acl/acl.go#L558-L576) |
| `AllowAgentRead/Write/Debug` | Agent 权限检查 | [acl.go#L778-L826](file:///D:/claude/nomad/acl/acl.go#L778-L826) |
| `AllowNodeRead/Write` | Node 权限检查 | [acl.go#L828-L862](file:///D:/claude/nomad/acl/acl.go#L828-L862) |
| `AllowOperatorRead/Write/Operation` | Operator 权限检查 | [acl.go#L863-L908](file:///D:/claude/nomad/acl/acl.go#L863-L908) |

**Glob 匹配**：包含 `*` 的名称存储在单独的通配符 Radix Tree 中，查询时通过 `findClosestMatchingGlob` 选择字符差异最小的匹配项。

---

## 六、HTTP API 接口

### 6.1 路由注册

定义在 [command/agent/http.go](file:///D:/claude/nomad/command/agent/http.go#L437-L438)：

```go
s.mux.HandleFunc("/v1/acl/policies", s.wrap(s.ACLPoliciesRequest))
s.mux.HandleFunc("/v1/acl/policy/", s.wrap(s.ACLPolicySpecificRequest))
```

### 6.2 端点总览

| 方法 | URL | Handler | RPC 方法 | 说明 |
|-----|-----|---------|---------|------|
| `GET` | `/v1/acl/policies` | `ACLPoliciesRequest` | `ACL.ListPolicies` | 列出所有策略 |
| `GET` | `/v1/acl/policy/self` | `aclSelfPolicy` | `ACL.GetClaimPolicies` 或 `ACL.ListPolicies` | 查询当前 Token 的策略 |
| `GET` | `/v1/acl/policy/:name` | `aclPolicyQuery` | `ACL.GetPolicy` | 读取单个策略 |
| `PUT/POST` | `/v1/acl/policy/:name` | `aclPolicyUpdate` | `ACL.UpsertPolicies` | 创建/更新策略 |
| `DELETE` | `/v1/acl/policy/:name` | `aclPolicyDelete` | `ACL.DeletePolicies` | 删除策略 |

Handler 实现在 [command/agent/acl_endpoint.go](file:///D:/claude/nomad/command/agent/acl_endpoint.go)。

### 6.3 Self 端点特殊逻辑

定义在 [command/agent/acl_endpoint.go](file:///D:/claude/nomad/command/agent/acl_endpoint.go#L189-L232)：

```
GET /v1/acl/policy/self
          │
          ▼
┌──────────────────────────┐
│ Auth Token 是 UUID?       │
└──────────┬───────────────┘
           │
   ┌───────┴───────┐
   │               │
   ▼ (是 UUID)     ▼ (非 UUID)
┌──────────┐  ┌──────────────────┐
│ Nomad    │  │ Workload Identity │
│ ACL Token│  │ / JWT            │
└────┬─────┘  └────────┬─────────┘
     │                 │
     ▼                 ▼
RPC: ACL.ListPolicies  RPC: ACL.GetClaimPolicies
→ ACLPolicyListResponse → ACLPolicySetResponse
                         → 转换为 ListStub 列表
```

---

## 七、Raft 持久化与状态存储

### 7.1 Raft 消息类型

定义在 [nomad/structs/structs.go](file:///D:/claude/nomad/nomad/structs/structs.go#L86-L87)：

```go
ACLPolicyUpsertRequestType MessageType = 19
ACLPolicyDeleteRequestType MessageType = 20
```

### 7.2 MemDB 表结构

定义在 [nomad/state/schema.go](file:///D:/claude/nomad/nomad/state/schema.go#L841-L863)：

```
Table: acl_policy
├── Index "id" (unique, StringFieldIndex on "Name")
└── Index "job" (non-unique, custom ACLPolicyJobACLFieldIndex)
     └── Key: Namespace + \x00 + JobID + \x00
```

`ACLPolicyJobACLFieldIndex`（[nomad/state/schema.go#L865-L935](file:///D:/claude/nomad/nomad/state/schema.go#L865-L935)）支持：
- `ACLPolicyByJob(ns, jobID)` - 查询特定 Job 的策略
- `ACLPolicyByNamespace(ns)` - 查询命名空间下所有策略

### 7.3 状态存储 CRUD 方法

定义在 [nomad/state/state_store.go](file:///D:/claude/nomad/nomad/state/state_store.go)：

| 方法 | 行号 | 说明 |
|-----|------|------|
| `UpsertACLPolicies` | L6245 | 创建/更新策略，保留 CreateIndex |
| `DeleteACLPolicies` | L6286 | 按名称删除策略 |
| `ACLPolicyByName` | L6303 | 按名称查询（支持 WatchSet） |
| `ACLPolicyByNamePrefix` | L6319 | 按名称前缀查询 |
| `ACLPolicyByJob` | L6333 | 按 Namespace+JobID 查询 |
| `ACLPolicyByNamespace` | L6345 | 按命名空间查询 |
| `ACLPolicies` | L6358 | 全表遍历（快照用） |

### 7.4 FSM Apply 处理

定义在 [nomad/fsm.go](file:///D:/claude/nomad/nomad/fsm.go#L306-L309)：

```go
case structs.ACLPolicyUpsertRequestType:
    return n.applyACLPolicyUpsert(msgType, buf[1:], log.Index)
case structs.ACLPolicyDeleteRequestType:
    return n.applyACLPolicyDelete(msgType, buf[1:], log.Index)
```

`applyACLPolicyUpsert`（[fsm.go#L1260-L1273](file:///D:/claude/nomad/nomad/fsm.go#L1260-L1273)）：
1. msgpack 解码 `ACLPolicyUpsertRequest`
2. 调用 `StateStore.UpsertACLPolicies`
3. 记录 metrics

### 7.5 快照与恢复

**快照类型**：`ACLPolicySnapshot = 11`（[fsm.go#L42](file:///D:/claude/nomad/nomad/fsm.go#L42)）

**持久化**（[fsm.go#L2916-L2942](file:///D:/claude/nomad/nomad/fsm.go#L2916-L2942)）：
```
对每个 ACLPolicy:
  写入 1 字节标签 (0x0B)
  写入 msgpack 编码的 ACLPolicy
```

**恢复**（[fsm.go#L1752-L1761](file:///D:/claude/nomad/nomad/fsm.go#L1752-L1761)）：
```
读取标签 → 解码 ACLPolicy → filter.Include 检查 → ACLPolicyRestore
```

`ACLPolicyRestore`（[nomad/state/state_store_restore.go#L120-L126](file:///D:/claude/nomad/nomad/state/state_store_restore.go#L120-L126)）直接 `txn.Insert("acl_policy", policy)`，保留原始索引。

### 7.6 完整写入流程

```
客户端 HTTP PUT /v1/acl/policy/:name
          │
          ▼
┌─────────────────────────────┐
│ 1. HTTP Handler              │
│    aclPolicyUpdate           │
│    解码 Body → ACLPolicy     │
│    验证 Name 匹配路径        │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 2. RPC: ACL.UpsertPolicies   │
│    检查 Management Token     │
│    调用 policy.Validate()    │
│    调用 policy.SetHash()     │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 3. raftApply                 │
│    MessageType = 19          │
│    Payload: ACLPolicyUpsertRequest │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 4. FSM.Apply                 │
│    applyACLPolicyUpsert      │
│    msgpack 解码              │
│    → StateStore.UpsertACLPolicies │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 5. StateStore                │
│    MemDB 写事务              │
│    保留 CreateIndex          │
│    更新 ModifyIndex          │
│    Insert("acl_policy", ...)  │
│    更新 index 表             │
│    Commit                    │
└─────────────────────────────┘
```

---

## 八、CLI 命令

### 8.1 命令树

命令注册在 [command/commands.go](file:///D:/claude/nomad/command/commands.go#L153-L181)：

```
nomad acl policy
├── apply    # 创建/更新策略
├── delete   # 删除策略
├── info     # 查看策略详情
├── list     # 列出所有策略
└── self     # 查看当前 Token 的策略
```

### 8.2 acl policy apply

定义在 [command/acl_policy_apply.go](file:///D:/claude/nomad/command/acl_policy_apply.go)：

```bash
nomad acl policy apply [options] <name> <path>
```

| 选项 | 说明 |
|-----|------|
| `-description` | 策略描述 |
| `-namespace` | 关联命名空间 |
| `-job` | 关联 Job ID（需要 -namespace） |
| `-group` | 关联 Group（需要 -namespace -job） |
| `-task` | 关联 Task（需要 -namespace -job -group） |

`<path>` 为规则文件路径，`-` 表示从 stdin 读取。

### 8.3 acl policy self

定义在 [command/acl_policy_self.go](file:///D:/claude/nomad/command/acl_policy_self.go)：

先调用 `ACLTokens().Self()` 检查 Token 类型：
- **Management Token**：提示无单独策略关联
- **Client Token**：调用 `ACLPolicies().Self()` 获取关联策略列表

---

## 九、Go API 客户端

定义在 [api/acl.go](file:///D:/claude/nomad/api/acl.go#L13-L75)：

```go
type ACLPolicies struct {
    client *Client
}

// List 列出所有策略
func (a *ACLPolicies) List(q *QueryOptions) ([]*ACLPolicyListStub, *QueryMeta, error)

// Upsert 创建或更新策略
func (a *ACLPolicies) Upsert(policy *ACLPolicy, q *WriteOptions) (*WriteMeta, error)

// Delete 删除策略
func (a *ACLPolicies) Delete(policyName string, q *WriteOptions) (*WriteMeta, error)

// Info 读取单个策略
func (a *ACLPolicies) Info(policyName string, q *QueryOptions) (*ACLPolicy, *QueryMeta, error)

// Self 查询当前 Token 关联的策略
func (a *ACLPolicies) Self(q *QueryOptions) ([]*ACLPolicyListStub, *QueryMeta, error)
```

---

## 十、Policy 关联模型

### 10.1 关联关系图

```
┌─────────────┐      ┌──────────┐      ┌───────────┐
│  ACLToken   │      │ ACLRole  │      │ ACLPolicy │
│             │      │          │      │           │
│ Policies ───┼──────┼─→ []string (名称直接关联)
│             │      │          │      │           │
│ Roles    ───┼──────┼──────────┼──────┼─→ Policies
│  []ACLToken │      │ []ACLRole│      │  []ACLRolePolicyLink
│  RoleLink   │      │ PolicyLink│     │   {Name string}
└─────────────┘      └──────────┘      └───────────┘
```

### 10.2 Token → Policy 直接关联

`ACLToken.Policies []string` - 策略名称列表（[nomad/structs/acl.go#L463](file:///D:/claude/nomad/nomad/structs/acl.go#L463)）：

```go
type ACLToken struct {
    AccessorID string
    SecretID   string
    Type       string   // "client" 或 "management"
    Policies   []string // 直接关联的策略名称
    Roles      []*ACLTokenRoleLink  // 通过 Role 间接关联
    // ...
}
```

### 10.3 Token → Role → Policy 间接关联

`ACLRole.Policies []*ACLRolePolicyLink`（[nomad/structs/acl.go#L960](file:///D:/claude/nomad/nomad/structs/acl.go#L960)）：

```go
type ACLRole struct {
    ID          string
    Name        string
    Description string
    Policies    []*ACLRolePolicyLink
    // ...
}

type ACLRolePolicyLink struct {
    Name string  // 当前仅支持名称，预留 ID 支持
}
```

### 10.4 权限合并

一个 Token 的最终权限 = 所有直接关联 Policy + 所有 Role 中 Policy 的**并集**，通过 `acl.NewACL(false, policies)` 编译为统一的 ACL 评估器。

---

## 十一、HCL 规则格式

### 11.1 完整示例

```hcl
# 命名空间策略
namespace "default" {
    policy = "read"
}

namespace "apps" {
    policy = "write"
    capabilities = ["host-volume-register"]  # 简写与细粒度可组合
}

namespace "secret" {
    capabilities = ["deny", "read-logs"]  # deny 优先
}

# 变量路径策略
namespace "apps" {
    variables {
        path "project/secret" {
            capabilities = ["read", "list"]
        }
        path "project/config" {
            capabilities = ["write", "destroy"]
        }
    }
}

# 通配符命名空间
namespace "*" {
    policy = "read"
}

# 节点池策略
node_pool "prod" {
    policy = "write"
}

node_pool "dev-*" {
    capabilities = ["read"]
}

# 主机卷策略
host_volume "production-tls-*" {
    capabilities = ["mount-readonly"]
}

# Agent 策略
agent {
    policy = "read"
}

# Node 策略
node {
    policy = "write"
}

# Operator 策略
operator {
    policy = "deny"
}

# Sentinel 策略（企业版）
sentinel {
    policy = "read"
    capabilities = ["sentinel-delete"]
}

# Quota 策略
quota {
    policy = "read"
}

# Plugin 策略
plugin {
    policy = "list"
}
```

### 11.2 HCL 块类型对照

| HCL 块 | Go 结构 | 支持 `policy` 简写 | 支持 `capabilities` | 支持 `*` 通配符 | 支持嵌套 `variables` |
|-------|--------|------------------|-------------------|----------------|-------------------|
| `namespace` | `NamespacePolicy` | deny/read/write/scale | 是 | 是 | 是 |
| `node_pool` | `NodePoolPolicy` | deny/read/write | 是 | 是 | 否 |
| `host_volume` | `HostVolumePolicy` | deny/read/write | 是 | 是 | 否 |
| `agent` | `AgentPolicy` | deny/read/write | 否 | N/A | 否 |
| `node` | `NodePolicy` | deny/read/write | 否 | N/A | 否 |
| `operator` | `OperatorPolicy` | deny/read/write | 是 | N/A | 否 |
| `sentinel` | `SentinelPolicy` | deny/read/write | 是 | N/A | 否 |
| `quota` | `QuotaPolicy` | deny/read/write | 否 | N/A | 否 |
| `plugin` | `PluginPolicy` | deny/read/list/write | 否 | N/A | 否 |

### 11.3 名称验证正则

| 资源 | 正则 | 文件位置 |
|-----|------|---------|
| Policy 名称 | `^[a-zA-Z0-9-]{1,128}$` | [nomad/structs/structs.go#L56](file:///D:/claude/nomad/nomad/structs/structs.go#L56) |
| Namespace 名称 | `^[a-zA-Z0-9-*]{1,128}$` | [acl/policy.go#L87](file:///D:/claude/nomad/acl/policy.go#L87) |
| NodePool 名称 | `^[a-zA-Z0-9-_*]{1,128}$` | [acl/policy.go#L106](file:///D:/claude/nomad/acl/policy.go#L106) |
| HostVolume 名称 | `^[a-zA-Z0-9-*]{1,128}$` | [acl/policy.go#L121](file:///D:/claude/nomad/acl/policy.go#L121) |

---

## 十二、跨区域复制

Nomad 支持多区域 ACL 复制，定义在 [nomad/leader.go](file:///D:/claude/nomad/nomad/leader.go)：

```
Authoritative Region (主区域)
    │
    │  ACL Replication (RPC)
    ▼
Follower Region (从区域)
    │
    ├── ACLPolicyUpsert → raftApply(本地)
    └── ACLPolicyDelete → raftApply(本地)
```

**复制流程**（[nomad/leader.go#L1673-L1770](file:///D:/claude/nomad/nomad/leader.go#L1673-L1770)）：

1. 从区域的 Leader 定期调用主区域的 `ACL.GetPolicies` RPC
2. 对比本地状态，计算差量
3. 对新增/修改的策略执行 `ACLPolicyUpsertRequest` 本地 Raft
4. 对已删除的策略执行 `ACLPolicyDeleteRequest` 本地 Raft

---

## 十三、事件通知

Policy 变更会产生状态存储事件，定义在 [nomad/state/events.go](file:///D:/claude/nomad/nomad/state/events.go#L33-L34)：

```go
ACLPolicyUpserted = "ACLPolicy_Upserted"
ACLPolicyDeleted   = "ACLPolicy_Deleted"
```

这些事件通过 Nomad 的 Event Stream 机制推送到订阅者，UI 和 CLI 可以实时响应策略变更。

---

## 十四、源码文件索引

### 核心数据结构

| 文件 | 内容 | 行号 |
|-----|------|------|
| [nomad/structs/acl.go](file:///D:/claude/nomad/nomad/structs/acl.go) | ACLPolicy, JobACL, ACLPolicyListStub | L308-L455 |
| [nomad/structs/structs.go](file:///D:/claude/nomad/nomad/structs/structs.go) | ValidPolicyName, 常量, MessageType | L54-L175 |

### 规则解析

| 文件 | 内容 | 行号 |
|-----|------|------|
| [acl/policy.go](file:///D:/claude/nomad/acl/policy.go) | Policy 结构, 能力常量, Parse, 展开 | L17-L730 |
| [acl/acl.go](file:///D:/claude/nomad/acl/acl.go) | ACL 评估器, NewACL, maxPrivilege | L49-L1054 |

### HTTP API

| 文件 | 内容 | 行号 |
|-----|------|------|
| [command/agent/http.go](file:///D:/claude/nomad/command/agent/http.go) | 路由注册 | L437-L438 |
| [command/agent/acl_endpoint.go](file:///D:/claude/nomad/command/agent/acl_endpoint.go) | HTTP Handler | L15-L232 |

### RPC 与持久化

| 文件 | 内容 | 行号 |
|-----|------|------|
| [nomad/acl_endpoint.go](file:///D:/claude/nomad/nomad/acl_endpoint.go) | RPC 端点, 验证, raftApply | L110-L171 |
| [nomad/fsm.go](file:///D:/claude/nomad/nomad/fsm.go) | FSM Apply, 快照, 恢复 | L306-L2942 |
| [nomad/state/schema.go](file:///D:/claude/nomad/nomad/state/schema.go) | MemDB 表结构 | L841-L935 |
| [nomad/state/state_store.go](file:///D:/claude/nomad/nomad/state/state_store.go) | CRUD 方法 | L6245-L6370 |
| [nomad/state/state_store_restore.go](file:///D:/claude/nomad/nomad/state/state_store_restore.go) | 快照恢复 | L120-L126 |
| [nomad/state/events.go](file:///D:/claude/nomad/nomad/state/events.go) | 事件类型 | L33-L34 |

### 跨区域复制

| 文件 | 内容 | 行号 |
|-----|------|------|
| [nomad/leader.go](file:///D:/claude/nomad/nomad/leader.go) | ACL 复制逻辑 | L1673-L1770 |

### CLI 命令

| 文件 | 命令 |
|-----|------|
| [command/acl_policy.go](file:///D:/claude/nomad/command/acl_policy.go) | `acl policy` |
| [command/acl_policy_apply.go](file:///D:/claude/nomad/command/acl_policy_apply.go) | `acl policy apply` |
| [command/acl_policy_delete.go](file:///D:/claude/nomad/command/acl_policy_delete.go) | `acl policy delete` |
| [command/acl_policy_info.go](file:///D:/claude/nomad/command/acl_policy_info.go) | `acl policy info` |
| [command/acl_policy_list.go](file:///D:/claude/nomad/command/acl_policy_list.go) | `acl policy list` |
| [command/acl_policy_self.go](file:///D:/claude/nomad/command/acl_policy_self.go) | `acl policy self` |

### Go API 客户端

| 文件 | 内容 | 行号 |
|-----|------|------|
| [api/acl.go](file:///D:/claude/nomad/api/acl.go) | ACLPolicies 客户端 | L13-L75 |

### Token 与 Role 关联

| 文件 | 内容 | 行号 |
|-----|------|------|
| [nomad/structs/acl.go](file:///D:/claude/nomad/nomad/structs/acl.go) | ACLToken (Policies []string) | L458-L486 |
| [nomad/structs/acl.go](file:///D:/claude/nomad/nomad/structs/acl.go) | ACLRole (Policies []*ACLRolePolicyLink) | L939-L968 |
| [nomad/structs/acl.go](file:///D:/claude/nomad/nomad/structs/acl.go) | ACLTokenRoleLink | L712-L723 |
| [nomad/structs/acl.go](file:///D:/claude/nomad/nomad/structs/acl.go) | ACLRolePolicyLink | L973-L977 |

---

## 附录：Policy 生命周期完整流程

```
                         ┌─────────────┐
                         │  创建 Policy │
                         │  (HCL 文件)  │
                         └──────┬──────┘
                                │
                    ┌───────────▼───────────┐
                    │ CLI: nomad acl policy │
                    │     apply <name> <path>│
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ HTTP PUT              │
                    │ /v1/acl/policy/:name  │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ RPC: ACL.UpsertPolicies│
                    │ ┌─ 检查 Management     │
                    │ │  Token              │
                    │ ├─ policy.Validate()   │
                    │ │  ├─ 名称正则校验     │
                    │ │  ├─ acl.Parse(rules) │
                    │ │  │  ├─ HCL 解码      │
                    │ │  │  ├─ 能力校验      │
                    │ │  │  └─ 简写展开      │
                    │ │  ├─ 描述长度校验     │
                    │ │  └─ JobACL 依赖链    │
                    │ └─ policy.SetHash()    │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ raftApply              │
                    │ MessageType = 19       │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ FSM.Apply              │
                    │ applyACLPolicyUpsert   │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ StateStore             │
                    │ UpsertACLPolicies      │
                    │ ├─ MemDB 写事务        │
                    │ ├─ 保留 CreateIndex    │
                    │ ├─ 更新 ModifyIndex   │
                    │ └─ Commit              │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ 事件通知               │
                    │ ACLPolicy_Upserted     │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ 运行时使用              │
                    │ ┌─ Token 解析 Policy   │
                    │ │  名称列表            │
                    │ ├─ acl.Parse(lenient)  │
                    │ ├─ acl.NewACL(policies)│
                    │ │  └─ Radix Tree 构建  │
                    │ └─ Allow* 检查         │
                    └───────────────────────┘
```
