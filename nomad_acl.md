# Nomad ACL 技术实现分析

> 文档定位：深入剖析 Nomad ACL（访问控制列表）子系统的架构、核心数据结构、策略语法、认证流程、能力校验与工程实现，作为理解 Nomad 安全模型的工程参考。

---

## 目录

1. [总体架构](#1-总体架构)
2. [核心数据结构](#2-核心数据结构)
3. [策略 Policy 与能力 Capability](#3-策略-policy-与能力-capability)
4. [ACL 对象编译](#4-acl-对象编译)
5. [Authenticator 认证器](#5-authenticator-认证器)
6. [身份认证流程](#6-身份认证流程)
7. [能力校验 API](#7-能力校验-api)
8. [Bootstrap 与初始 Token](#8-bootstrap-与初始-token)
9. [One-Time Token 一次性令牌](#9-one-time-token-一次性令牌)
10. [Auth Method SSO（OIDC/JWT）](#10-auth-method-ssooidcjwt)
11. [Workload Identity 工作负载身份](#11-workload-identity-工作负载身份)
12. [Node Identity 节点身份](#12-node-identity-节点身份)
13. [虚拟 ACL 与内部身份](#13-虚拟-acl-与内部身份)
14. [mTLS 证书校验](#14-mtls-证书校验)
15. [ACL Endpoint RPC 接口](#15-acl-endpoint-rpc-接口)
16. [缓存与性能优化](#16-缓存与性能优化)
17. [关键代码文件索引](#17-关键代码文件索引)

---

## 1. 总体架构

Nomad ACL 采用 **基于策略的能力模型（Policy-Capability Model）**，整体架构分四层：

```
┌──────────────────────────────────────────────────────────────────┐
│                      请求层（HTTP / RPC）                        │
│  携带 SecretID / JWT / mTLS 证书 / Node Identity 等凭据           │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│             Authenticator（认证器，nomad/auth/auth.go）           │
│  1. resolveSecretToken / VerifyClaim                             │
│  2. 校验 mTLS 证书                                               │
│  3. 输出 AuthenticatedIdentity（ACLToken / Claims / ClientID）   │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│             ACL 解析（ResolveACL / resolveACLFromToken）          │
│  1. 取 Token 关联的 Policies + Roles → Policies                  │
│  2. CompileACLObject 编译策略 → acl.ACL 对象（带缓存）           │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│             能力校验（acl.ACL.AllowXxx）                          │
│  AllowNamespaceOperation / AllowNodePoolOperation / ...          │
│  基于 iradix 树高效匹配 namespace / node_pool / host_volume      │
└──────────────────────────────────────────────────────────────────┘
```

### 设计要点

- **Token 三种类型**：Management（全局管理）、Client（关联策略/角色）、Anonymous（匿名）
- **策略合并规则**：多策略取并集，`deny` 永远优先
- **缓存层**：LRU（2Q）缓存编译后的 `acl.ACL` 对象，key 为策略集合的哈希
- **多协议身份**：ACL Token（UUID SecretID）、JWT（Workload/Node Identity）、mTLS（Server/Client 证书）

---

## 2. 核心数据结构

### 2.1 ACLToken

[nomad/structs/acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) L458：

```go
type ACLToken struct {
    AccessorID string   // 公开 ID（UUID），用于查询
    SecretID   string   // 私密 ID（UUID），用于认证
    Name       string   // 人类可读名称
    Type       string   // "client" 或 "management"
    Policies   []string // 关联的策略名列表
    Roles      []*ACLTokenRoleLink  // 关联的角色链接
    Global     bool     // 是否跨 region 全局
    Hash       []byte
    CreateTime time.Time
    ExpirationTime *time.Time  // 过期时间（UTC）
    ExpirationTTL  time.Duration  // 便捷字段，仅创建时使用
    CreateIndex uint64
    ModifyIndex uint64
}
```

### 2.2 三种预定义 Token

```go
// nomad/structs/acl.go L245-269

// 匿名 Token：未提供 SecretID 时使用
AnonymousACLToken = &ACLToken{
    AccessorID: "anonymous",
    Name:       "Anonymous Token",
    Type:       ACLClientToken,
    Policies:   []string{"anonymous"},
    Global:     false,
}

// Leader Token：仅 Leader 持有，等同于 management
LeaderACLToken = &ACLToken{
    AccessorID: "leader",
    Name:       "Leader Token",
    Type:       ACLManagementToken,
}

// ACL 禁用 Token：ACL 关闭时使用
ACLsDisabledToken = &ACLToken{
    AccessorID: "acls-disabled",
    Name:       "ACLs disabled token",
    Type:       ACLClientToken,
    Global:     false,
}
```

### 2.3 ACLPolicy

```go
type ACLPolicy struct {
    Name        string      // 唯一名
    Description string      // 人类可读描述
    Rules       string      // HCL 或 JSON 格式的规则文本
    RulesJSON   *acl.Policy // 从 Rules 解析出的结构化对象
    JobACL      *JobACL     // 工作负载身份绑定（可选）
    Hash        []byte
    CreateIndex uint64
    ModifyIndex uint64
}

// JobACL 用于 Workload Identity 场景，将策略绑定到具体 job/group/task
type JobACL struct {
    Namespace string
    JobID     string
    Group     string
    Task      string
}
```

### 2.4 ACLRole

```go
type ACLRole struct {
    ID          string                // UUID
    Name        string                // 跨联邦唯一
    Description string
    Policies    []*ACLRolePolicyLink  // 策略链接
    Hash        []byte
    CreateIndex uint64
    ModifyIndex uint64
}

type ACLRolePolicyLink struct {
    Name string  // ACLPolicy.Name
}

// Token 与 Role 的链接
type ACLTokenRoleLink struct {
    ID   string  // ACLRole.ID（不可变，权威）
    Name string  // ACLRole.Name（仅展示用，存储前会被丢弃）
}
```

### 2.5 AuthenticatedIdentity

[nomad/structs/identity.go](file:///d:/claude/nomad/nomad/structs/identity.go)：

```go
type IdentityClaims struct {
    *NodeIdentityClaims             // 节点身份
    *NodeIntroductionIdentityClaims // 节点引入身份
    *WorkloadIdentityClaims         // 工作负载身份
    jwt.Claims                      // 公共 JWT 声明
}

// AuthenticatedIdentity 是认证器输出的统一身份对象
type AuthenticatedIdentity struct {
    ACLToken *ACLToken         // 来自 SecretID
    Claims   *IdentityClaims   // 来自 JWT
    ClientID string            // 来自 Node SecretID 或 Node Identity
    TLSName  string            // 来自 mTLS 证书 CN
    RemoteIP net.IP
}
```

`AuthenticatedIdentity` 故意不合并成单一 ACLToken，让 RPC handler 区分内部 vs 外部来源，避免 **confused deputy 攻击**。

---

## 3. 策略 Policy 与能力 Capability

### 3.1 Policy 结构

[acl/policy.go](file:///d:/claude/nomad/acl/policy.go)：

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
}
```

### 3.2 粗粒度策略级别

```go
PolicyDeny  = "deny"   // 拒绝（最高优先级）
PolicyRead  = "read"
PolicyList  = "list"
PolicyWrite = "write"
PolicyScale = "scale"
```

合并规则：`deny > write > read > list`，参见 `maxPrivilege(a, b string) string`。

### 3.3 Namespace 细粒度能力

```go
NamespaceCapabilityListJobs             = "list-jobs"
NamespaceCapabilityParseJob             = "parse-job"
NamespaceCapabilityReadJob              = "read-job"
NamespaceCapabilitySubmitJob            = "submit-job"
NamespaceCapabilityDispatchJob          = "dispatch-job"
NamespaceCapabilityReadLogs             = "read-logs"
NamespaceCapabilityReadFS               = "read-fs"
NamespaceCapabilityAllocExec            = "alloc-exec"
NamespaceCapabilityAllocNodeExec        = "alloc-node-exec"
NamespaceCapabilityAllocLifecycle       = "alloc-lifecycle"
NamespaceCapabilityCSIRegisterPlugin    = "csi-register-plugin"
NamespaceCapabilityCSIWriteVolume       = "csi-write-volume"
NamespaceCapabilityCSIReadVolume        = "csi-read-volume"
NamespaceCapabilityCSIListVolume        = "csi-list-volume"
NamespaceCapabilityCSIMountVolume       = "csi-mount-volume"
NamespaceCapabilityHostVolumeCreate     = "host-volume-create"
NamespaceCapabilityHostVolumeRegister   = "host-volume-register"
NamespaceCapabilityHostVolumeRead       = "host-volume-read"
NamespaceCapabilityHostVolumeWrite      = "host-volume-write"
NamespaceCapabilityHostVolumeDelete     = "host-volume-delete"
NamespaceCapabilityListScalingPolicies  = "list-scaling-policies"
NamespaceCapabilityReadScalingPolicy    = "read-scaling-policy"
NamespaceCapabilityReadJobScaling       = "read-job-scaling"
NamespaceCapabilityScaleJob             = "scale-job"
NamespaceCapabilitySubmitRecommendation = "submit-recommendation"
NamespaceCapabilityRegisterJob          = "register-job"
NamespaceCapabilityRevertJob            = "revert-job"
NamespaceCapabilityDeregisterJob        = "deregister-job"
NamespaceCapabilityPurgeJob             = "purge-job"
NamespaceCapabilityEvaluateJob          = "evaluate-job"
NamespaceCapabilityPlanJob              = "plan-job"
NamespaceCapabilityTagJobVersion        = "tag-job-version"
NamespaceCapabilityStableJob            = "stable-job"
NamespaceCapabilityFailDeployment       = "fail-deployment"
NamespaceCapabilityPauseDeployment      = "pause-deployment"
NamespaceCapabilityPromoteDeployment    = "promote-deployment"
NamespaceCapabilityUnblockDeployment    = "unblock-deployment"
NamespaceCapabilityCancelDeployment     = "cancel-deployment"
NamespaceCapabilitySetAllocHealthDeployment = "set-alloc-health-deployment"
NamespaceCapabilityGCAllocation         = "gc-allocation"
NamespaceCapabilityPauseAllocation      = "pause-allocation"
NamespaceCapabilityForcePeriodicJob     = "force-periodic-job"
NamespaceCapabilityDeleteServiceRegistration = "delete-service-registration"
// 企业版
NamespaceCapabilitySentinelOverride     = "sentinel-override"
```

### 3.4 策略级别展开

`expandNamespacePolicy(policy)` 把粗粒度 `policy` 字段展开为细粒度能力：

- `read`：list/parse/read job、CSI list/read、scaling list/read、host volume read
- `write`：read 全部 + scale/submit/dispatch/logs/fs/exec/lifecycle/CSI write/host volume write/register/create/delete...
- `deny`：只含 `deny`
- `scale`：仅 `scale-job`

### 3.5 其它资源类型能力

```go
// NodePool
NodePoolCapabilityDelete = "delete"
NodePoolCapabilityDeny   = "deny"
NodePoolCapabilityRead   = "read"
NodePoolCapabilityWrite  = "write"

// HostVolume
HostVolumeCapabilityDeny           = "deny"
HostVolumeCapabilityMountReadOnly  = "mount-readonly"
HostVolumeCapabilityMountReadWrite = "mount-readwrite"

// Variables（路径级）
VariablesCapabilityList    = "list"
VariablesCapabilityRead    = "read"
VariablesCapabilityWrite   = "write"
VariablesCapabilityDestroy = "destroy"
VariablesCapabilityDeny    = "deny"

// Operator
OperatorCapabilitySnapshotSave  = "snapshot-save"
OperatorCapabilityLicenseRead   = "license-read"
OperatorCapabilityKeyringRotate = "keyring-rotate"
OperatorCapabilityKeyringRead   = "keyring-read"
OperatorCapabilityKeyringDelete = "keyring-delete"

// Sentinel
SentinelCapabilityRead   = "sentinel-read"
SentinelCapabilitySubmit = "sentinel-submit"
SentinelCapabilityDelete = "sentinel-delete"
```

### 3.6 HCL 策略示例

```hcl
namespace "default" {
  policy       = "write"
  capabilities = ["scale-job"]
  variables {
    path "secret/*" {
      capabilities = ["read", "list"]
    }
    path "secret/privileged/*" {
      capabilities = ["deny"]
    }
  }
}

namespace "ci-*" {       # glob 通配
  policy = "read"
}

node_pool "production-*" {
  policy = "read"
}

host_volume "data-*" {
  policy       = "write"
  capabilities = ["mount-readwrite"]
}

agent     { policy = "read" }
node      { policy = "read" }
operator  { policy = "write" }
quota     { policy = "read" }
plugin    { policy = "read" }
sentinel  { policy = "read" }
```

### 3.7 名称校验正则

```go
validNamespace = regexp.MustCompile("^[a-zA-Z0-9-*]{1,128}$")
validNodePool  = regexp.MustCompile("^[a-zA-Z0-9-_*]{1,128}$")
validVolume    = regexp.MustCompile("^[a-zA-Z0-9-*]{1,128}$")
```

---

## 4. ACL 对象编译

[acl/acl.go](file:///d:/claude/nomad/acl/acl.go) 的 `NewACL(management, policies)` 把策略列表编译成高效查询对象。

### 4.1 ACL 结构

```go
type ACL struct {
    management bool  // management token 短路

    // 命名空间：精确名 + glob 通配名（用 iradix 树存储）
    namespaces         *iradix.Tree[capabilitySet]
    wildcardNamespaces *iradix.Tree[capabilitySet]

    // 节点池
    nodePools         *iradix.Tree[capabilitySet]
    wildcardNodePools *iradix.Tree[capabilitySet]

    // Host Volume
    hostVolumes         *iradix.Tree[capabilitySet]
    wildcardHostVolumes *iradix.Tree[capabilitySet]

    // Variables 路径
    variables         *iradix.Tree[capabilitySet]
    wildcardVariables *iradix.Tree[capabilitySet]

    // 粗粒度策略
    agent, node, operator, sentinel, quota, plugin string

    // 细粒度 operator / sentinel
    operatorCapabilities capabilitySet
    sentinelCapabilities capabilitySet

    // 虚拟策略（内部用）
    client, pool, server string
    isLeader, aclsDisabled bool
}
```

### 4.2 编译流程

```go
func NewACL(management bool, policies []*Policy) (*ACL, error) {
    if management {
        return &ACL{management: true}, nil  // 热路径
    }

    acl := &ACL{}
    // 为每类资源创建 iradix.Tree 事务
    nsTxn := iradix.New[capabilitySet]().Txn()
    wnsTxn := iradix.New[capabilitySet]().Txn()  // wildcard
    // ...

    for _, policy := range policies {
        for _, ns := range policy.Namespaces {
            globDefinition := strings.Contains(ns.Name, "*")
            // 选 wnsTxn 或 nsTxn
            // 取出或创建 capabilitySet
            // 把 ns.Capabilities 与 expandNamespacePolicy(ns.Policy) 合并
            // 处理 Variables 子路径
        }
        // 处理 NodePools / HostVolumes / Agent / Node / Operator / ...
    }

    // 提交事务，构建不可变 iradix.Tree
    acl.namespaces = nsTxn.Commit()
    acl.wildcardNamespaces = wnsTxn.Commit()
    // ...
    return acl, nil
}
```

### 4.3 capabilitySet 合并

```go
type capabilitySet map[string]struct{}

// 合并取并集；若存在 "deny" 则覆盖所有其它能力
func mergeCapabilities(existing, newCaps capabilitySet) {
    if newCaps.Check(NamespaceCapabilityDeny) {
        existing.Clear()
        existing.Set(NamespaceCapabilityDeny)
        return
    }
    for cap := range newCaps {
        existing.Set(cap)
    }
}
```

### 4.4 CompileACLObject 带缓存

[nomad/structs/funcs.go](file:///d:/claude/nomad/nomad/structs/funcs.go) L419：

```go
func CompileACLObject(cache *ACLCache[*acl.ACL], policies []*ACLPolicy) (*acl.ACL, error) {
    // 1. 按名字排序，保证 cacheKey 稳定
    sort.Slice(policies, func(i, j int) bool {
        return policies[i].Name < policies[j].Name
    })

    // 2. 计算策略集合哈希作为 cacheKey
    cacheKey := ACLPolicyListHash(policies)
    if entry, ok := cache.Get(cacheKey); ok {
        return entry.Get(), nil  // 缓存命中
    }

    // 3. 解析 HCL/JSON 规则
    parsed := make([]*acl.Policy, 0, len(policies))
    for _, policy := range policies {
        p, err := acl.Parse(policy.Rules, acl.PolicyParseLenient)
        if err != nil { return nil, err }
        parsed = append(parsed, p)
    }

    // 4. 编译为 ACL 对象
    aclObj, err := acl.NewACL(false, parsed)
    if err != nil { return nil, err }

    // 5. 加入缓存
    cache.Add(cacheKey, aclObj)
    return aclObj, nil
}
```

---

## 5. Authenticator 认证器

[nomad/auth/auth.go](file:///d:/claude/nomad/nomad/auth/auth.go) 是 ACL 系统的入口。

### 5.1 结构

```go
type Authenticator struct {
    aclsEnabled bool               // 是否启用 ACL
    verifyTLS   *atomic.Bool       // 是否强制 mTLS（运行时可改）
    logger      hclog.Logger
    getState    StateGetter         // func() *state.StateStore
    getLeaderACL LeaderACLGetter    // func() string
    region      string

    validServerCertNames []string  // ["server.<region>.nomad"]
    validClientCertNames []string  // ["client.<region>.nomad", "server.<region>.nomad"]

    aclCache   *structs.ACLCache[*acl.ACL]  // LRU 缓存
    encrypter  Encrypter                    // JWT 验签器
}
```

### 5.2 ACLCache

```go
const aclCacheSize = 512  // 缓存 512 个 ACL 对象

type ACLCache[T any] struct {
    *lru.TwoQueueCache[string, ACLCacheEntry[T]]
    clock libtime.Clock
}

type ACLCacheEntry[T any] lang.Pair[T, time.Time]

func (e ACLCacheEntry[T]) Age() time.Duration { return time.Since(e.Second) }
```

使用 **2Q LRU**（Two Queue）算法，比普通 LRU 更好地处理扫描型访问模式。Key 为策略集合哈希，Value 为编译后的 `*acl.ACL` + 入缓存时间。

---

## 6. 身份认证流程

### 6.1 Authenticate 主入口

```go
func (s *Authenticator) Authenticate(ctx RPCContext, args structs.RequestWithIdentity) error {
    secretID := args.GetAuthToken()
    aclToken, err := s.resolveSecretToken(secretID)

    switch {
    case err == nil && (aclToken == structs.AnonymousACLToken || aclToken == structs.ACLsDisabledToken):
        // 匿名或 ACL 禁用：继续走 mTLS 检查
        args.SetIdentity(&AuthenticatedIdentity{ACLToken: aclToken})

    case err == nil:
        // 有效 ACL Token：直接返回
        args.SetIdentity(&AuthenticatedIdentity{ACLToken: aclToken})
        return nil

    case errors.Is(err, structs.ErrTokenExpired):
        return err

    case errors.Is(err, structs.ErrTokenInvalid):
        // 不是 UUID，可能是 JWT
        claims, err := s.VerifyClaim(secretID)
        if err != nil { return err }
        args.SetIdentity(&AuthenticatedIdentity{Claims: claims})
        return nil

    case errors.Is(err, structs.ErrTokenNotFound):
        // 可能是 leader token 或 node secret
        if leaderAcl := s.getLeaderACL(); leaderAcl != "" && secretID == leaderAcl {
            aclToken = structs.LeaderACLToken
            break
        }
        node, _ := s.getState().NodeBySecretID(nil, secretID)
        if node != nil {
            args.SetIdentity(&AuthenticatedIdentity{ClientID: node.ID})
            return nil
        }
        // 无效 token
        remoteIP, _ := ctx.GetRemoteIP()
        args.SetIdentity(&AuthenticatedIdentity{RemoteIP: remoteIP})
        return structs.ErrPermissionDenied
    }

    // 匿名/禁用：补充 mTLS 信息
    if ctx.IsStatic() {
        args.SetIdentity(&AuthenticatedIdentity{ACLToken: aclToken})
        return nil
    }
    identity := &AuthenticatedIdentity{ACLToken: aclToken}
    if ctx.IsTLS() {
        identity.TLSName = ctx.Certificate().Subject.CommonName
    }
    remoteIP, _ := ctx.GetRemoteIP()
    identity.RemoteIP = remoteIP
    args.SetIdentity(identity)
    return nil
}
```

### 6.2 resolveSecretToken

```go
func (s *Authenticator) resolveSecretToken(secretID string) (*structs.ACLToken, error) {
    if !s.aclsEnabled {
        return structs.ACLsDisabledToken, nil
    }
    if secretID == "" {
        return structs.AnonymousACLToken, nil
    }
    if !helper.IsUUID(secretID) {
        return nil, structs.ErrTokenInvalid  // 可能是 JWT
    }

    snap, _ := s.getState().Snapshot()
    token, err := snap.ACLTokenBySecretID(nil, secretID)
    if err != nil { return nil, err }
    if token == nil { return nil, structs.ErrTokenNotFound }
    if token.IsExpired(time.Now().UTC()) {
        return nil, structs.ErrTokenExpired
    }
    return token, nil
}
```

### 6.3 ResolveACL（身份 → ACL 对象）

```go
func (s *Authenticator) ResolveACL(args structs.RequestWithIdentity) (*acl.ACL, error) {
    identity := args.GetIdentity()
    if identity == nil {
        return nil, structs.ErrPermissionDenied
    }

    if !s.aclsEnabled {
        return acl.ACLsDisabledACL, nil
    }

    // 1. 优先解析 Client 身份（Node Identity / Node Secret）
    if aclObj, err := s.ResolveClientIdentityACL(identity); aclObj != nil || err != nil {
        return aclObj, err
    }

    // 2. 解析 JWT Claims（Workload Identity）
    if claims := identity.GetClaims(); claims != nil {
        return s.resolveClaims(claims)
    }

    // 3. 解析 ACL Token（含匿名）
    if aclToken := identity.GetACLToken(); aclToken != nil {
        return s.resolveACLForToken(aclToken)
    }

    return nil, structs.ErrPermissionDenied
}
```

### 6.4 resolveACLFromToken

```go
func resolveACLFromToken(snap, cache, token) (*acl.ACL, error) {
    // Management token 短路
    if token.Type == structs.ACLManagementToken {
        return acl.ManagementACL, nil
    }

    policies := make([]*structs.ACLPolicy, 0, len(token.Policies)+len(token.Roles))

    // 1. 加载 token.Policies 命名的策略
    for _, policyName := range token.Policies {
        policy, _ := snap.ACLPolicyByName(nil, policyName)
        if policy != nil {
            policies = append(policies, policy)
        }
        // 不存在的策略被忽略（不授予权限）
    }

    // 2. 展开 token.Roles → 加载 role.Policies
    for _, roleLink := range token.Roles {
        role, _ := snap.GetACLRoleByID(nil, roleLink.ID)
        if role == nil { continue }
        for _, policyLink := range role.Policies {
            policy, _ := snap.ACLPolicyByName(nil, policyLink.Name)
            if policy != nil {
                policies = append(policies, policy)
            }
        }
    }

    // 3. 编译并缓存
    return structs.CompileACLObject(cache, policies)
}
```

### 6.5 三种错误码

```go
// nomad/structs/errors.go
ErrTokenNotFound    = errors.New("token not found")
ErrTokenExpired     = errors.New("token expired")
ErrTokenInvalid     = errors.New("invalid token")
ErrPermissionDenied = errors.New("permission denied")
```

---

## 7. 能力校验 API

[acl/acl.go](file:///d:/claude/nomad/acl/acl.go) 提供的能力校验方法，所有方法都先短路 `management` / `aclsDisabled`。

### 7.1 Namespace 校验

```go
// 校验具体操作（如 list-jobs、submit-job）
func (a *ACL) AllowNamespaceOperation(ns string, op string) bool

// 校验是否对 ns 有任何权限
func (a *ACL) AllowNamespace(ns string) bool

// 便捷封装
func (a *ACL) AllowNsOp(ns string, op string) bool
func (a *ACL) AllowNsOpFunc(ops ...string) func(string) bool  // 返回闭包
func (a *ACL) AllowNsOpAnyOf(ns string, ops ...string) bool   // 任一通过即可
```

通配处理：

```go
// 当 ns == "*"（AllNamespacesSentinel），只要任一 namespace 允许该 op 即通过
if ns == AllNamespacesSentinel && a.anyNamespaceAllowsOp(op) {
    return true
}
```

匹配流程：

```go
func (a *ACL) matchingNamespaceCapabilitySet(ns string) (capabilitySet, bool) {
    // 1. 精确匹配
    if caps, ok := a.namespaces.Get([]byte(ns)); ok {
        return caps, true
    }
    // 2. 通配匹配（按字典序遍历，首个匹配返回）
    iter := a.wildcardNamespaces.Root().Iterator()
    for {
        key, caps, ok := iter.Next()
        if !ok { break }
        if glob.Match(string(key), ns) {
            return caps, true
        }
    }
    return nil, false
}
```

### 7.2 NodePool 校验

```go
func (a *ACL) AllowNodePoolOperation(pool string, op string) bool
func (a *ACL) AllowNodePool(pool string) bool

// 至少有一个 node pool 允许任何操作（用于搜索场景的宽松检查）
func (a *ACL) AllowNodePoolSearch() bool
```

### 7.3 HostVolume 校验

```go
func (a *ACL) AllowHostVolumeOperation(hv string, op string) bool
func (a *ACL) AllowHostVolume(ns string) bool
```

### 7.4 Variables 校验

按路径前缀匹配，支持 glob：

```go
func (a *ACL) AllowVariablesPathRead(path string) bool
func (a *ACL) AllowVariablesPathList(path string) bool
func (a *ACL) AllowVariablesPathWrite(path string) bool
func (a *ACL) AllowVariablesPathDestroy(path string) bool
```

### 7.5 其它资源校验

```go
func (a *ACL) AllowAgentRead() bool       // agent policy
func (a *ACL) AllowAgentWrite() bool
func (a *ACL) AllowNodeRead() bool        // node policy
func (a *ACL) AllowNodeWrite() bool
func (a *ACL) AllowOperatorCapability(cap string) bool  // operator 细粒度
func (a *ACL) AllowSentinelPolicyRead() bool
func (a *ACL) AllowSentinelPolicyWrite() bool
func (a *ACL) AllowQuotaRead() bool
func (a *ACL) AllowPluginRead() bool
func (a *ACL) AllowPluginWrite() bool
```

### 7.6 虚拟策略校验（内部）

```go
func (a *ACL) AllowClientOp(pool string) bool  // 客户端 RPC
func (a *ACL) AllowServerOp() bool             // 服务器 RPC
func (a *ACL) IsLeader() bool                  // leader 专用
```

---

## 8. Bootstrap 与初始 Token

[nomad/acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) L442：

### 8.1 Bootstrap 流程

```go
func (a *ACL) Bootstrap(args *structs.ACLTokenBootstrapRequest, reply *structs.ACLTokenUpsertResponse) error {
    if !a.srv.config.ACLEnabled {
        return aclDisabled
    }
    // forward to leader
    if done, err := a.srv.forward("ACL.Bootstrap", args, args, reply); done {
        return err
    }

    // 1. 从文件读取 bootstrap 信息（首次启动）
    // 2. 校验是否已 bootstrap（避免重复）
    // 3. 创建 management token
    // 4. raftApply 持久化
    // 5. 返回 token（含 SecretID，仅此一次可见）
}
```

### 8.2 初始 Token 特性

- Type = `management`
- Global = true（跨 region 共享）
- 不关联任何 policy（management 隐含全部权限）
- SecretID 仅在 Bootstrap 响应中返回一次，后续不可见
- 通过文件 `bootstrap_token` 记录是否已初始化，避免重复 bootstrap

---

## 9. One-Time Token 一次性令牌

[nomad/structs/acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) L664：

### 9.1 数据结构

```go
type OneTimeToken struct {
    OneTimeSecretID string    // 一次性 UUID
    AccessorID      string    // 关联的 ACL Token AccessorID
    ExpiresAt       time.Time // 默认 10 分钟过期
    CreateIndex     uint64
    ModifyIndex     uint64
}
```

### 9.2 用途

用于**短时间认证传递**场景，例如 CLI 工具需要把 token 传递给另一个进程（如 `nomad alloc exec`），但又不想把长期 SecretID 暴露在命令行参数或环境变量中。

### 9.3 流程

```
1. 用户已有 ACL Token（SecretID）
2. 调用 ACL.UpsertOneTimeToken(authToken=SecretID)
   └─► 生成 OneTimeSecretID，10 分钟后过期
   └─► Raft 持久化
3. 用户把 OneTimeSecretID 传给目标进程
4. 目标进程调用 ACL.ExchangeOneTimeToken(oneTimeSecretID)
   └─► 查找 OneTimeToken，校验未过期
   └─► 返回关联的 ACL Token（含 SecretID）
   └─► 删除该 OneTimeToken（一次性）
5. 目标进程用换回的 SecretID 调用 Nomad API
```

### 9.4 关键约束

- 必须集群内所有 server 版本 ≥ `minOneTimeAuthenticationTokenVersion`
- 仅能为自己创建 OTT（无法为他人创建）
- 过期后由 `ACL.OneTimeTokenExpire` 批量清理

---

## 10. Auth Method SSO（OIDC/JWT）

### 10.1 ACLAuthMethod

[nomad/structs/acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) L1205：

```go
type ACLAuthMethod struct {
    Name            string
    Type            string             // "OIDC" 或 "JWT"
    TokenLocality   string             // "local" 或 "global"
    TokenNameFormat string
    MaxTokenTTL     time.Duration
    Default         bool               // 是否默认方法
    Config          *ACLAuthMethodConfig
    Hash            []byte
    CreateTime, ModifyTime time.Time
    CreateIndex, ModifyIndex uint64
}
```

### 10.2 ACLAuthMethodConfig

```go
type ACLAuthMethodConfig struct {
    // OIDC 配置
    OIDCDiscoveryURL    string
    OIDCClientID        string
    OIDCClientSecret    string
    OIDCEnablePKCE      bool
    OIDCDisableUserInfo bool
    OIDCClientAssertion *ACLAuthMethodOIDCClientAssertion
    OIDCScopes          []string
    AllowedRedirectURIs []string
    DiscoveryCaPem      []string

    // JWT 配置
    JWKSURL             string
    JWKSCACert          string
    JWTValidationPubKeys []string
    SigningAlgs         []string

    // 通用
    BoundAudiences      []string
    BoundIssuer         []string
    ExpirationLeeway    time.Duration
    NotBeforeLeeway     time.Duration
    ClockSkewLeeway     time.Duration
    ClaimMappings       map[string]string  // JWT claim → Nomad 字段
    ListClaimMappings   map[string]string
    VerboseLogging      bool
}
```

### 10.3 OIDC 登录流程

```
1. 用户访问 /v1/acl/oauth2/authorization?auth_method=xxx&redirect_uri=yyy
2. Server 302 重定向到 IdP（Keycloak、Okta 等）
3. 用户在 IdP 登录
4. IdP 302 回调到 /v1/acl/oauth2/callback?code=zzz
5. Server 用 code 换取 IdP 的 id_token + access_token
6. 校验 id_token（签名、aud、iss、exp、nbf）
7. 应用 ClaimMappings 把 IdP claims 映射到 Nomad 字段
8. 根据 ListClaimMappings 决定关联哪些 ACL Role
9. 创建 ACL Token（TTL=MaxTokenTTL，Global 取决于 TokenLocality）
10. 返回 token 给用户
```

### 10.4 JWT 登录流程

```
1. 外部系统签发 JWT（用受信私钥）
2. 用户调用 POST /v1/acl/login {auth_method: "jwt", login_token: "<JWT>"}
3. Server 从 AuthMethodConfig 取：
   - JWTValidationPubKeys（公钥列表）或 JWKSURL（远程公钥集）
   - SigningAlgs（允许的签名算法）
   - BoundAudiences / BoundIssuer（受众/签发者校验）
4. 用 go-jose 验签并解析 JWT
5. 应用 ClaimMappings / ListClaimMappings
6. 创建 ACL Token 并返回
```

### 10.5 ClaimMappings 机制

```hcl
acl_auth_method "github" {
  type = "JWT"
  config {
    jwt_validation_pub_keys = ["..."]
    bound_audiences = ["nomad.example.com"]
    claim_mappings = {
      "team" = "team"
      "email" = "email"
    }
    list_claim_mappings = {
      "groups" = "groups"
    }
  }
}

# 然后在 ACL Role 的绑定规则中引用
acl_role_binding_rule "developer" {
  auth_method = "github"
  bind_type   = "role"
  bind_name   = "developer"
  selector    = "\"dev\" in list.groups"
}
```

---

## 11. Workload Identity 工作负载身份

[nomad/structs/workload_id.go](file:///d:/claude/nomad/nomad/structs/workload_id.go)：

### 11.1 WorkloadIdentityClaims

```go
type WorkloadIdentityClaims struct {
    Namespace  string
    JobID      string
    AllocationID string
    TaskName   string
    // ... 其它字段
}
```

### 11.2 用途

- **任务间认证**：alloc 内的 task 用 WI 访问 Nomad API，无需嵌入 ACL Token
- **Vault 集成**：WI 可换发 Vault token
- **Consul 集成**：WI 可换发 Consul token

### 11.3 流程

```
1. Client 启动 alloc 时，向 Server 请求 WI（带 alloc 自身标识）
2. Server 用私钥签发 JWT，aud="nomadproject.io"
3. Task 通过 NOMAD_TOKEN 环境变量拿到 WI
4. Task 调用 Nomad API 时带上 WI
5. Server.VerifyClaim 验签 + 校验 alloc 未 terminal
6. 根据 alloc.Job 查找绑定的 ACLPolicy（通过 JobACL 字段）
7. 编译 ACL 对象返回给 endpoint
```

### 11.4 resolveClaims

[nomad/auth/auth.go](file:///d:/claude/nomad/nomad/auth/auth.go) L735：

```go
func (s *Authenticator) resolveClaims(claims *structs.IdentityClaims) (*acl.ACL, error) {
    // Node Identity 短路
    if claims.IsNode() {
        return acl.NewClientACL(claims.NodeIdentityClaims.NodePool), nil
    }

    // Workload Identity：查找 job 绑定的策略
    policies, err := s.ResolvePoliciesForClaims(claims)
    if err != nil { return nil, err }

    return structs.CompileACLObject(s.aclCache, policies)
}
```

### 11.5 ResolvePoliciesForClaims

```go
func (s *Authenticator) ResolvePoliciesForClaims(claims) ([]*structs.ACLPolicy, error) {
    snap, _ := s.getState().Snapshot()
    alloc, _ := snap.AllocByID(nil, claims.AllocationID)
    if alloc == nil || alloc.Job == nil {
        return nil, fmt.Errorf("allocation does not exist")
    }

    jobId := alloc.Job.GetIDforWorkloadIdentity()
    iter, _ := snap.ACLPolicyByJob(nil, alloc.Namespace, jobId)

    var policies []*structs.ACLPolicy
    for {
        raw := iter.Next()
        if raw == nil { break }
        policy := raw.(*structs.ACLPolicy)
        if policy.JobACL == nil { continue }

        // 按 job/group/task 层级匹配
        switch {
        case policy.JobACL.Group == "":
            policies = append(policies, policy)  // job 级
        case policy.JobACL.Group != alloc.TaskGroup:
            // group 不匹配，跳过
        case policy.JobACL.Task == "":
            policies = append(policies, policy)  // group 级
        case policy.JobACL.Task == claims.TaskName:
            policies = append(policies, policy)  // task 级
        }
    }
    return policies, nil
}
```

---

## 12. Node Identity 节点身份

[nomad/structs/node.go](file:///d:/claude/nomad/nomad/structs/node.go) L534：

### 12.1 NodeIdentityClaims

```go
type NodeIdentityClaims struct {
    NodeID   string
    NodePool string
}
```

### 12.2 流程

```
1. 首次注册：Client 用 mTLS 证书（CN=client.<region>.nomad）+ 空 token 调用 Node.Register
   └─► Server 用 AuthenticateNodeIdentityGenerator 认证
   └─► mTLS 通过 + 无 token → 视为新节点
   └─► 创建 Node 记录，签发 Node Identity JWT（含 NodeID、NodePool）
2. 后续心跳：Client 用 Node Identity JWT 调用 Node.UpdateStatus
   └─► Server.VerifyClaim 验签
   └─► claims.IsNode() → true
   └─► 返回 NewClientACL(claims.NodeIdentityClaims.NodePool)
3. 节点重启：JWT 过期 → 用 mTLS + Node SecretID 重新换发
```

### 12.3 Client ACL

```go
// acl/virtual.go
func NewClientACL(pool string) *ACL {
    aclObj, _ := NewACL(false, []*Policy{})
    aclObj.client = PolicyWrite
    aclObj.pool = pool          // 限定到自己的 node pool
    aclObj.agent = PolicyRead
    aclObj.server = PolicyRead
    return aclObj
}
```

节点只能操作自身资源（如自己的 alloc、自己的 node status），通过 `pool` 字段限制。

### 12.4 AuthorizeSameNode

```go
func AuthorizeSameNode(identity *AuthenticatedIdentity, targetNodeID string) error {
    if AuthenticatedNodeID(identity) != targetNodeID {
        return structs.ErrPermissionDenied
    }
    return nil
}
```

确保节点只能访问自己的资源（如自己的 service registration）。

---

## 13. 虚拟 ACL 与内部身份

[acl/virtual.go](file:///d:/claude/nomad/acl/virtual.go) 定义三类内部 ACL：

### 13.1 ManagementACL

```go
var ManagementACL *ACL

func init() {
    ManagementACL, _ = NewACL(true, nil)  // management=true
}
```

所有 `AllowXxx` 方法在 `a.management == true` 时直接返回 true。

### 13.2 ServerACL

```go
func initServerACL() *ACL {
    aclObj, _ := NewACL(false, []*Policy{})
    aclObj.agent = PolicyRead
    aclObj.server = PolicyWrite
    return aclObj
}
```

用于 server-to-server RPC，仅授予 `AllowServerOp()` 与 `agent read`。

### 13.3 ClientACL

```go
func initClientACL() *ACL {
    return NewClientACL("*")  // pool="*"，所有 pool
}
```

用于 client-to-server RPC（无具体 pool 信息时）。

### 13.4 ACLsDisabledACL

```go
func initACLsDisabledACL() *ACL {
    aclObj, _ := NewACL(false, []*Policy{})
    aclObj.aclsDisabled = true
    return aclObj
}
```

ACL 关闭时使用，所有 `AllowXxx` 直接返回 true。

### 13.5 使用场景

| 场景                           | 用到的 ACL            |
|--------------------------------|----------------------|
| ACL 关闭                       | `ACLsDisabledACL`    |
| Management Token / Leader Token| `ManagementACL`      |
| Server-to-Server RPC           | `ServerACL`          |
| Client-to-Server RPC（Node ID）| `NewClientACL(pool)` |
| 普通用户 Token                 | 编译生成             |
| Workload Identity              | 编译生成             |

---

## 14. mTLS 证书校验

### 14.1 verifyTLS

[nomad/auth/auth.go](file:///d:/claude/nomad/nomad/auth/auth.go)：

```go
func verifyTLS(verify bool, ctx RPCContext, validNames []string, identity *AuthenticatedIdentity) error {
    if verify && !ctx.IsStatic() {
        tlsCert := ctx.Certificate()
        if tlsCert == nil {
            return errors.New("missing certificate information")
        }
        identity.TLSName = tlsCert.Subject.CommonName
        _, err := validateCertificateForNames(tlsCert, validNames)
        return err
    }
    return nil
}
```

### 14.2 证书名校验

```go
func validateCertificateForNames(cert *x509.Certificate, expectedNames []string) (bool, error) {
    validNames := []string{cert.Subject.CommonName}
    validNames = append(validNames, cert.DNSNames...)

    for _, expectedName := range expectedNames {
        if slices.Contains(validNames, expectedName) {
            return true, nil
        }
    }
    return false, fmt.Errorf("invalid certificate: %s not in expected %s", ...)
}
```

### 14.3 期望名称

```go
// Server RPC 期望
validServerCertNames = []string{"server." + region + ".nomad"}

// Client RPC 期望（含 server，因 server 也可能转发）
validClientCertNames = []string{
    "client." + region + ".nomad",
    "server." + region + ".nomad",
}
```

### 14.4 三种认证模式

```go
// 1. 通用认证（含 ACL Token）
func (s *Authenticator) Authenticate(ctx, args) error

// 2. 仅 Server RPC（防 confused deputy）
func (s *Authenticator) AuthenticateServerOnly(ctx, args) (*acl.ACL, error)
// 返回 acl.ServerACL，不接受外部 ACL Token

// 3. 仅 Client RPC（防 confused deputy）
func (s *Authenticator) AuthenticateClientOnly(ctx, args) (*acl.ACL, error)
// 接受 Node SecretID 或 Node Identity JWT

// 4. 节点身份生成（Node.Register 专用）
func (s *Authenticator) AuthenticateNodeIdentityGenerator(ctx, args) error
// 允许空 token（首次注册）
```

### 14.5 Confused Deputy 防护

`AuthenticateServerOnly` 与 `AuthenticateClientOnly` **绝不接受 ACL Token**，避免攻击者通过 follower 转发到 client/server 内部 RPC 来提权。

---

## 15. ACL Endpoint RPC 接口

[nomad/acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) 提供 ACL 资源 CRUD：

### 15.1 Policy 接口

| 方法                | RPC                              | 用途                |
|---------------------|----------------------------------|---------------------|
| UpsertPolicies      | `ACL.UpsertPolicies`             | 创建/更新策略       |
| DeletePolicies      | `ACL.DeletePolicies`             | 删除策略            |
| ListPolicies        | `ACL.ListPolicies`               | 列出策略（stub）    |
| GetPolicy           | `ACL.GetPolicy`                  | 查询单个策略        |
| GetPolicies         | `ACL.GetPolicies`                | 批量查询            |
| GetClaimPolicies    | `ACL.GetClaimPolicies`           | 查询 WI 绑定策略    |

### 15.2 Token 接口

| 方法                | RPC                              | 用途                       |
|---------------------|----------------------------------|----------------------------|
| Bootstrap           | `ACL.Bootstrap`                  | 首次初始化 management token|
| UpsertTokens        | `ACL.UpsertTokens`               | 创建/更新 token            |
| DeleteTokens        | `ACL.DeleteTokens`               | 删除 token                 |
| ListTokens          | `ACL.ListTokens`                 | 列出 token（stub）         |
| GetToken            | `ACL.GetToken`                   | 按 AccessorID 查询         |
| ResolveToken        | `ACL.ResolveToken`               | 按 SecretID 查询（内部）   |
| Self                | `ACL.Self`                       | 查询当前 token             |
| UpsertOneTimeToken  | `ACL.UpsertOneTimeToken`         | 创建一次性 token           |
| ExchangeOneTimeToken| `ACL.ExchangeOneTimeToken`       | 兑换一次性 token           |

### 15.3 Role 接口

| 方法                | RPC                              | 用途                |
|---------------------|----------------------------------|---------------------|
| UpsertACLRoles      | `ACL.UpsertACLRoles`             | 创建/更新角色       |
| DeleteACLRoles      | `ACL.DeleteACLRoles`             | 删除角色            |
| GetACLRole          | `ACL.GetACLRole`                 | 查询单个角色        |
| ListACLRoles        | `ACL.ListACLRoles`               | 列出角色            |

### 15.4 Auth Method 接口

| 方法                       | RPC                                  | 用途                  |
|----------------------------|--------------------------------------|-----------------------|
| UpsertACLAuthMethods       | `ACL.UpsertACLAuthMethods`           | 创建/更新 SSO 方法    |
| DeleteACLAuthMethods       | `ACL.DeleteACLAuthMethods`           | 删除 SSO 方法         |
| GetACLAuthMethod           | `ACL.GetACLAuthMethod`               | 查询单个方法          |
| ListACLAuthMethods         | `ACL.ListACLAuthMethods`             | 列出方法              |
| Login                      | `ACL.Login`                          | JWT 登录              |
| OIDCAuthURL                | `ACL.OIDCAuthURL`                    | 生成 OIDC 授权 URL    |
| OIDCCallback               | `ACL.OIDCCallback`                   | OIDC 回调处理         |

### 15.5 通用约束

所有 ACL endpoint 在 `!a.srv.config.ACLEnabled` 时返回 `aclDisabled`：

```go
aclDisabled = structs.NewErrRPCCoded(400, "ACL support disabled")
```

写入操作先 `forward` 到 leader，再通过 `raftApply` 持久化。

---

## 16. 缓存与性能优化

### 16.1 ACLCache（2Q LRU）

```go
const aclCacheSize = 512

type ACLCache[T any] struct {
    *lru.TwoQueueCache[string, ACLCacheEntry[T]]
}
```

- **Key**：策略集合的 blake2b 哈希
- **Value**：`*acl.ACL` + 入缓存时间
- **算法**：2Q LRU，区分"最近"与"频繁"两个队列，抗扫描污染
- **失效**：策略/角色变更时通过 `index` 失效（实际上 Nomad 当前实现依赖 LRU 自然淘汰）

### 16.2 编译开销

`acl.NewACL` 涉及：
- HCL/JSON 解析
- 多个 iradix.Tree 事务构建
- capabilitySet 合并

成本较高，故缓存至关重要。缓存命中率高的场景下，ResolveACL 接近 O(1)。

### 16.3 短路优化

所有 `AllowXxx` 方法首先检查：

```go
if a == nil { return false }
if a.aclsDisabled || a.management { return true }
```

避免不必要的 iradix 查询。

### 16.4 iradix 优势

- 不可变（持久化数据结构，可安全共享）
- 有序遍历（glob 匹配按字典序）
- 前缀查询高效
- 写时复制，读无锁

---

## 17. 关键代码文件索引

### 17.1 ACL 核心包

| 文件                                      | 作用                                          |
|-------------------------------------------|-----------------------------------------------|
| [acl/acl.go](file:///d:/claude/nomad/acl/acl.go) | ACL 对象、NewACL 编译、AllowXxx 校验方法    |
| [acl/policy.go](file:///d:/claude/nomad/acl/policy.go) | Policy 结构、能力常量、Parse、Validate、expand |
| [acl/virtual.go](file:///d:/claude/nomad/acl/virtual.go) | ManagementACL/ServerACL/ClientACL/ACLsDisabledACL 单例 |

### 17.2 认证器

| 文件                                      | 作用                                          |
|-------------------------------------------|-----------------------------------------------|
| [nomad/auth/auth.go](file:///d:/claude/nomad/nomad/auth/auth.go) | Authenticator、Authenticate、ResolveACL、ResolveClientIdentityACL 等 |

### 17.3 数据结构

| 文件                                      | 作用                                          |
|-------------------------------------------|-----------------------------------------------|
| [nomad/structs/acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | ACLToken、ACLPolicy、ACLRole、ACLAuthMethod、OneTimeToken、ACLCache 等 |
| [nomad/structs/identity.go](file:///d:/claude/nomad/nomad/structs/identity.go) | IdentityClaims、IsNode/IsWorkload/IsNodeIntroduction |
| [nomad/structs/node.go](file:///d:/claude/nomad/nomad/structs/node.go) | NodeIdentityClaims（L534）                    |
| [nomad/structs/workload_id.go](file:///d:/claude/nomad/nomad/structs/workload_id.go) | WorkloadIdentityClaims、WorkloadIdentityClaimsBuilder |
| [nomad/structs/funcs.go](file:///d:/claude/nomad/nomad/structs/funcs.go) | CompileACLObject（L419）、ACLPolicyListHash  |
| [nomad/structs/errors.go](file:///d:/claude/nomad/nomad/structs/errors.go) | ErrTokenNotFound/Expired/Invalid、ErrPermissionDenied |

### 17.4 RPC Endpoint

| 文件                                      | 作用                                          |
|-------------------------------------------|-----------------------------------------------|
| [nomad/acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | ACL 资源 CRUD：Policy/Token/Role/AuthMethod/OneTimeToken |

### 17.5 CLI 命令

| 文件                                              | 作用                |
|---------------------------------------------------|---------------------|
| [command/acl_policy.go](file:///d:/claude/nomad/command/acl_policy.go) | 策略命令入口        |
| [command/acl_policy_self.go](file:///d:/claude/nomad/command/acl_policy_self.go) | `nomad acl policy self` |
| [command/acl_token.go](file:///d:/claude/nomad/command/acl_token.go) | Token 命令入口      |
| [command/acl_token_create.go](file:///d:/claude/nomad/command/acl_token_create.go) | `nomad acl token create` |
| [command/acl_token_update.go](file:///d:/claude/nomad/command/acl_token_update.go) | `nomad acl token update` |
| [command/acl_token_self.go](file:///d:/claude/nomad/command/acl_token_self.go) | `nomad acl token self` |
| [command/acl_token_list.go](file:///d:/claude/nomad/command/acl_token_list.go) | `nomad acl token list` |
| [command/acl_role_update.go](file:///d:/claude/nomad/command/acl_role_update.go) | `nomad acl role update` |

### 17.6 API 客户端

| 文件                                  | 作用                              |
|---------------------------------------|-----------------------------------|
| [api/acl.go](file:///d:/claude/nomad/api/acl.go) | Go API 客户端，含 OneTimeToken 等 |

### 17.7 E2E 测试

| 文件                                      | 作用                |
|-------------------------------------------|---------------------|
| [e2e/acl/acl_test.go](file:///d:/claude/nomad/e2e/acl/acl_test.go) | ACL 端到端测试     |
| [e2e/acl/acl_token_test.go](file:///d:/claude/nomad/e2e/acl/acl_token_test.go) | Token 测试         |
| [e2e/acl/acl_role_test.go](file:///d:/claude/nomad/e2e/acl/acl_role_test.go) | Role 测试          |
| [e2e/acl/helpers.go](file:///d:/claude/nomad/e2e/acl/helpers.go) | 测试辅助           |

---

## 附录 A：典型调用链

### A.1 HTTP API 请求带 ACL Token

```
1. GET /v1/jobs  Header: X-Nomad-Token=<SecretID>

2. Server HTTP Handler:
   └─► args.SetAuthToken(SecretID)
   └─► endpoint.ListJobs(args, reply)

3. endpoint.ListJobs:
   └─► s.srv.Authenticator.Authenticate(ctx, args)
       ├─► resolveSecretToken(SecretID)
       │   └─► snap.ACLTokenBySecretID
       │   └─► 校验 IsExpired
       │   └─► 返回 *ACLToken
       └─► args.SetIdentity(&AuthenticatedIdentity{ACLToken: token})

4. endpoint.ListJobs:
   └─► s.srv.Authenticator.ResolveACL(args)
       └─► resolveACLForToken(token)
           ├─► 若 Type=management → acl.ManagementACL
           ├─► 加载 token.Policies + token.Roles→Policies
           └─► structs.CompileACLObject(cache, policies)
               ├─► cache hit → 直接返回
               └─► cache miss → acl.Parse + acl.NewACL + cache.Add

5. endpoint.ListJobs:
   └─► 遍历 jobs，用 aclObj.AllowNsOp(ns, list-jobs) 过滤
   └─► 返回允许的 jobs
```

### A.2 Node 心跳认证

```
1. Client → Node.UpdateStatus (Bearer: <NodeIdentityJWT>)

2. Server endpoint:
   └─► Authenticator.Authenticate(ctx, args)
       └─► resolveSecretToken(JWT)
           └─► !IsUUID → ErrTokenInvalid
       └─► VerifyClaim(JWT)
           └─► encrypter.VerifyClaim (验签)
           └─► claims.IsNode() → true
           └─► 返回 claims

3. Authenticator.ResolveACL(args):
   └─► ResolveClientIdentityACL(identity)
       └─► claims.IsNode() → true
       └─► claims.NodeIdentityClaims.NodePool 非空
       └─► return acl.NewClientACL(pool)

4. endpoint 用 ClientACL 校验 AllowClientOp(本节点 pool)
```

### A.3 Workload Identity 调用 API

```
1. Task → GET /v1/jobs  Bearer: <WorkloadJWT>

2. Server:
   └─► Authenticate → VerifyClaim → claims.IsWorkload()
   └─► ResolveACL → resolveClaims(claims)
       └─► ResolvePoliciesForClaims(claims)
           ├─► snap.AllocByID(claims.AllocationID)
           ├─► snap.ACLPolicyByJob(namespace, jobId)
           └─► 按 JobACL.Group/Task 过滤策略
       └─► CompileACLObject(cache, policies)

3. endpoint 用编译后的 ACL 校验 AllowNsOp
```

---

## 附录 B：安全模型要点

### B.1 最小权限原则

- 默认匿名 token 仅 `anonymous` 策略（通常 deny）
- Client ACL 限定到自身 node pool
- Server ACL 仅授予 server 必需的权限

### B.2 防御 Confused Deputy

- `AuthenticateServerOnly` / `AuthenticateClientOnly` 不接受 ACL Token
- `AuthenticatedIdentity` 区分 `ACLToken` / `Claims` / `ClientID` 来源
- 转发 RPC 时 Leader 用自己的 `LeaderACLToken`，不沿用用户 token

### B.3 Token 生命周期

- 创建：返回 SecretID 一次
- 使用：SecretID 校验 + 过期校验
- 销毁：DeleteTokens 或自然过期
- 全局 vs 本地：`Global=true` 跨 region 复制

### B.4 mTLS 强制

- `verify_tls=true` 时所有 RPC 必须带有效证书
- 证书 CN 必须匹配 `server.<region>.nomad` 或 `client.<region>.nomad`
- 无 mTLS 时 Node Identity 是唯一防伪造手段

### B.5 策略合并语义

- 多策略 capability 取**并集**
- `deny` capability 永远**覆盖**其它
- 粗粒度 `policy` 字段展开为细粒度 capability 后合并
- 缓存 key 基于策略集合哈希，合并结果稳定

---

## 附录 C：常见问题排查

| 现象                          | 可能原因                                                   | 排查方法                                              |
|-------------------------------|------------------------------------------------------------|-------------------------------------------------------|
| 403 Permission Denied         | Token 无对应 capability；策略未关联；Policy Rules 语法错误 | `nomad acl token self`；检查 Policy Rules            |
| 401 Token Invalid             | SecretID 非 UUID；JWT 验签失败                             | 检查 token 格式；JWT 调试 `nomad acl auth-method`     |
| Token 已过期                  | `ExpirationTime` 已过                                      | 重新签发；设置 TTL                                    |
| Bootstrap 失败                | 已 bootstrap 过；`bootstrap_token` 文件存在                | 删除文件或用现有 management token                     |
| OIDC 登录回调失败             | `AllowedRedirectURIs` 未配置；`OIDCClientSecret` 错误      | 检查 AuthMethod 配置；看 server 日志                  |
| Workload Identity 失败        | alloc 已 terminal；JobACL 配置错误                         | 检查 alloc 状态；`nomad job inspect` 看 identity 块   |
| Node 注册失败                 | mTLS 未启用；证书 CN 不匹配                                | 检查 `verify_tls`；证书 CN                            |
| OTT 兑换失败                  | OTT 已用过或过期                                           | 重新创建 OTT                                          |
| 跨 region token 不生效        | `Global=false`；region 不一致                              | 创建时设 `Global=true`                                |
| 缓存未及时失效                | LRU 未淘汰；策略变更后旧 ACL 仍在缓存                      | 重启 server 或等待 LRU 淘汰                           |

---

文档完。
