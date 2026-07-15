# acl.go 代码说明文档

> 文件路径：[acl.go](file:///d:/claude/nomad/acl/acl.go)
> 总行数：1054 行
> 所属包：`acl`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件是 **Nomad ACL（访问控制列表）引擎的核心实现**，定义 `ACL` 结构体及其全部权限检查方法。它是 Nomad 安全模型的运行时执行层，将一组解析后的 `Policy` 编译为高效的内存数据结构，用于快速判断"某 Token 是否有权执行某操作"。

**核心职责**：

1. **策略编译**：`NewACL()` 将多个 `Policy` 对象合并编译为 `ACL` 对象，使用不可变基数树（immutable radix tree）存储命名空间/节点池/主机卷/变量的能力集（capability set）。
2. **权限检查**：提供 30+ 个 `Allow*` 方法，覆盖 Agent、Node、Operator、Namespace、NodePool、HostVolume、Variables、Plugin、Quota、Sentinel、Server、Client 等所有资源类型的读/写/执行权限检查。
3. **Glob 匹配**：支持策略名使用通配符（如 `ns-*`），通过 `findClosestMatchingGlob()` 在多个匹配中选择"最具体"的策略。
4. **特殊模式**：支持管理 token（management）、ACL 禁用（aclsDisabled）、服务器/客户端虚拟策略等特殊权限模式。

**在 Nomad 架构中的位置**：

```
用户请求 → HTTP 端点 → ACL 鉴权（调用 acl.Allow*）→ RPC 处理
                          ↑
              Token → 关联 Policies → NewACL() 编译 → ACL 对象
```

每个 HTTP 请求在处理前，Agent 会根据请求携带的 ACL Token 解析出关联的策略列表，编译为 `ACL` 对象，然后在端点处理函数中调用 `Allow*` 方法进行细粒度权限检查。

---

## 2. 类型定义

### capabilitySet

**定义位置**：[L24](file:///d:/claude/nomad/acl/acl.go#L24)

**类型**：`map[string]struct{}`

**用途**：字符串集合，存储某资源被授予的能力（capability）列表。使用空结构体 `struct{}` 作为值，实现 O(1) 查找的集合语义。

**方法**：
- `Check(k string) bool` — 检查能力 k 是否在集合中
- `Set(k string)` — 添加能力 k
- `Clear()` — 清空所有能力（用于 deny 覆盖）

---

### ACL

**定义位置**：[L53](file:///d:/claude/nomad/acl/acl.go#L53)

**类型**：struct

```go
	// management tokens are allowed to do anything
	management bool

	// 精细能力映射，支持 glob 通配符
	namespaces         *iradix.Tree[capabilitySet]
	wildcardNamespaces *iradix.Tree[capabilitySet]

	nodePools         *iradix.Tree[capabilitySet]
	wildcardNodePools *iradix.Tree[capabilitySet]

	hostVolumes         *iradix.Tree[capabilitySet]
	wildcardHostVolumes *iradix.Tree[capabilitySet]

	variables         *iradix.Tree[capabilitySet]
	wildcardVariables *iradix.Tree[capabilitySet]

	// 粗粒度策略值（deny/read/list/write/scale）
	agent    string
	node     string
	operator string
	sentinel string
	quota    string
	plugin   string

	// Operator 和 Sentinel 的精细能力
	operatorCapabilities capabilitySet
	sentinelCapabilities capabilitySet

	// 虚拟策略（不直接暴露给用户）
	client       string
	pool         string
	server       string
	isLeader     bool
	aclsDisabled bool
```

**字段分组说明**：

| 字段组 | 字段 | 用途 |
|--------|------|------|
| 管理标志 | `management` | 管理 token，拥有全部权限 |
| 命名空间 | `namespaces` / `wildcardNamespaces` | 命名空间级能力（含 glob 分离存储） |
| 节点池 | `nodePools` / `wildcardNodePools` | 节点池级能力 |
| 主机卷 | `hostVolumes` / `wildcardHostVolumes` | 主机卷级能力 |
| 变量 | `variables` / `wildcardVariables` | 变量路径级能力（键格式 `namespace\x00path`） |
| 粗粒度策略 | `agent`/`node`/`operator`/`sentinel`/`quota`/`plugin` | 非命名空间资源的 read/write/deny 策略 |
| 精细能力 | `operatorCapabilities`/`sentinelCapabilities` | Operator/Sentinel 的细粒度能力集 |
| 虚拟策略 | `client`/`pool`/`server`/`isLeader`/`aclsDisabled` | 内部使用，模拟客户端/服务器/Leader 权限 |

**关联方法**（30+ 个）：`AllowNamespaceOperation`, `AllowNamespace`, `AllowNodePoolOperation`, `AllowNodePool`, `AllowNodePoolSearch`, `AllowHostVolumeOperation`, `AllowHostVolume`, `AllowVariableOperation`, `AllowVariableSearch`, `AllowAgentRead`, `AllowAgentWrite`, `AllowAgentDebug`, `AllowNodeRead`, `AllowNodeWrite`, `AllowOperatorRead`, `AllowOperatorWrite`, `AllowOperatorOperation`, `AllowSentinelOperation`, `AllowQuotaRead`, `AllowQuotaWrite`, `AllowPluginRead`, `AllowPluginList`, `AllowServiceRegistrationReadList`, `AllowServerOp`, `AllowClientOp`, `IsManagement`, `AllowNsOp`, `AllowNsOpFunc`, `AllowNsOpAnyOf` 等。

---

### ACLClaim

**定义位置**：[L623](file:///d:/claude/nomad/acl/acl.go#L623)

**类型**：struct

```go
	Namespace string
	Job       string
	Group     string
	Task      string
```

**用途**：变量访问的工作负载声明，用于自动授予作业对其自身变量路径（`nomad/jobs/<job>` 等）的读取权限。当分配的任务访问变量时，携带此声明可获得隐式读权限。

---

### matchingGlob

**定义位置**：[L723](file:///d:/claude/nomad/acl/acl.go#L723)

**类型**：struct（内部使用）

```go
	name          string
	difference    int
	capabilitySet capabilitySet
```

**用途**：记录一个匹配的 glob 模式及其与请求名称的"差异度"（用于选择最具体的匹配）。

---

## 3. 常量与变量

### 常量

| 名称 | 值 | 用途 |
|------|----|------|
| `AllNamespacesSentinel` | `"*"` | 表示"所有命名空间"的哨兵值（从 structs 包重定义以避免循环依赖） |

### 变量

| 名称 | 值 | 用途 |
|------|----|------|
| `ManagementACL` | `*ACL`（单例） | 管理 token 的 ACL 对象，通过 `init()` 创建 |
| `workloadVariablesCapabilitySet` | `{read, list}` | 工作负载自动获得的变量能力集 |

---

## 4. 方法与函数

### 构造与编译

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewACL` | - | `management bool, policies []*Policy` | `*ACL, error` | [L100](file:///d:/claude/nomad/acl/acl.go#L100) |
| `maxPrivilege` | - | `a, b string` | `string` | [L87](file:///d:/claude/nomad/acl/acl.go#L87) |

### 命名空间权限

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `AllowNamespaceOperation` | `a *ACL` | `ns, op string` | `bool` | [L307](file:///d:/claude/nomad/acl/acl.go#L307) |
| `AllowNamespace` | `a *ACL` | `ns string` | `bool` | [L338](file:///d:/claude/nomad/acl/acl.go#L338) |
| `AllowNsOp` | `a *ACL` | `ns, op string` | `bool` | [L295](file:///d:/claude/nomad/acl/acl.go#L295) |
| `AllowNsOpFunc` | `a *ACL` | `ops ...string` | `func(string) bool` | [L300](file:///d:/claude/nomad/acl/acl.go#L300) |
| `AllowNsOpAnyOf` | `a *ACL` | `ns string, ops ...string` | `bool` | [L310](file:///d:/claude/nomad/acl/acl.go#L310) |
| `matchingNamespaceCapabilitySet` | `a *ACL` | `ns string` | `capabilitySet, bool` | [L668](file:///d:/claude/nomad/acl/acl.go#L668) |
| `anyNamespaceAllowsOp` | `a *ACL` | `op string` | `bool` | [L678](file:///d:/claude/nomad/acl/acl.go#L678) |
| `anyNamespaceAllowsAnyOp` | `a *ACL` | - | `bool` | [L685](file:///d:/claude/nomad/acl/acl.go#L685) |
| `anyNamespaceAllows` | `a *ACL` | `cb func(capabilitySet) bool` | `bool` | [L693](file:///d:/claude/nomad/acl/acl.go#L693) |

### 节点池权限

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `AllowNodePoolOperation` | `a *ACL` | `pool, op string` | `bool` | [L365](file:///d:/claude/nomad/acl/acl.go#L365) |
| `AllowNodePool` | `a *ACL` | `pool string` | `bool` | [L387](file:///d:/claude/nomad/acl/acl.go#L387) |
| `AllowNodePoolSearch` | `a *ACL` | - | `bool` | [L409](file:///d:/claude/nomad/acl/acl.go#L409) |
| `matchingNodePoolCapabilitySet` | `a *ACL` | `pool string` | `capabilitySet, bool` | [L710](file:///d:/claude/nomad/acl/acl.go#L710) |

### 主机卷权限

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `AllowHostVolumeOperation` | `a *ACL` | `hv, op string` | `bool` | [L436](file:///d:/claude/nomad/acl/acl.go#L436) |
| `AllowHostVolume` | `a *ACL` | `ns string` | `bool` | [L457](file:///d:/claude/nomad/acl/acl.go#L457) |
| `matchingHostVolumeCapabilitySet` | `a *ACL` | `name string` | `capabilitySet, bool` | [L717](file:///d:/claude/nomad/acl/acl.go#L717) |

### 变量权限

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `AllowVariableOperation` | `a *ACL` | `ns, path, op string, claim *ACLClaim` | `bool` | [L478](file:///d:/claude/nomad/acl/acl.go#L478) |
| `AllowVariableSearch` | `a *ACL` | `ns string` | `bool` | [L635](file:///d:/claude/nomad/acl/acl.go#L635) |
| `matchingVariablesCapabilitySet` | `a *ACL` | `ns, path string, claim *ACLClaim` | `capabilitySet, bool` | [L700](file:///d:/claude/nomad/acl/acl.go#L700) |

### Agent/Node/Operator 权限

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `AllowAgentRead` | `a *ACL` | - | `bool` | [L755](file:///d:/claude/nomad/acl/acl.go#L755) |
| `AllowAgentWrite` | `a *ACL` | - | `bool` | [L770](file:///d:/claude/nomad/acl/acl.go#L770) |
| `AllowAgentDebug` | `a *ACL` | `isDebugEnabled bool` | `bool` | [L782](file:///d:/claude/nomad/acl/acl.go#L782) |
| `AllowNodeRead` | `a *ACL` | - | `bool` | [L798](file:///d:/claude/nomad/acl/acl.go#L798) |
| `AllowNodeWrite` | `a *ACL` | - | `bool` | [L819](file:///d:/claude/nomad/acl/acl.go#L819) |
| `AllowOperatorRead` | `a *ACL` | - | `bool` | [L833](file:///d:/claude/nomad/acl/acl.go#L833) |
| `AllowOperatorWrite` | `a *ACL` | - | `bool` | [L848](file:///d:/claude/nomad/acl/acl.go#L848) |
| `AllowOperatorOperation` | `a *ACL` | `op string` | `bool` | [L861](file:///d:/claude/nomad/acl/acl.go#L861) |

### 其他权限

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `AllowSentinelOperation` | `a *ACL` | `op string` | `bool` | [L875](file:///d:/claude/nomad/acl/acl.go#L875) |
| `AllowQuotaRead` | `a *ACL` | - | `bool` | [L893](file:///d:/claude/nomad/acl/acl.go#L893) |
| `AllowQuotaWrite` | `a *ACL` | - | `bool` | [L908](file:///d:/claude/nomad/acl/acl.go#L908) |
| `AllowPluginRead` | `a *ACL` | - | `bool` | [L921](file:///d:/claude/nomad/acl/acl.go#L921) |
| `AllowPluginList` | `a *ACL` | - | `bool` | [L935](file:///d:/claude/nomad/acl/acl.go#L935) |
| `AllowServiceRegistrationReadList` | `a *ACL` | `ns string, isWorkload bool` | `bool` | [L949](file:///d:/claude/nomad/acl/acl.go#L949) |
| `AllowServerOp` | `a *ACL` | - | `bool` | [L958](file:///d:/claude/nomad/acl/acl.go#L958) |
| `AllowClientOp` | `a *ACL` | `pool string` | `bool` | [L968](file:///d:/claude/nomad/acl/acl.go#L968) |
| `IsManagement` | `a *ACL` | - | `bool` | [L983](file:///d:/claude/nomad/acl/acl.go#L983) |

### 辅助函数

| 函数 | 参数 | 返回值 | 行号 |
|------|------|--------|------|
| `NamespaceValidator` | `ops ...string` | `func(*ACL, string) bool` | [L991](file:///d:/claude/nomad/acl/acl.go#L991) |
| `findClosestMatchingGlob` | `radix *iradix.Tree[capabilitySet], ns string` | `capabilitySet, bool` | [L730](file:///d:/claude/nomad/acl/acl.go#L730) |
| `findAllMatchingWildcards` | `radix *iradix.Tree[capabilitySet], name string` | `[]matchingGlob` | [L753](file:///d:/claude/nomad/acl/acl.go#L753) |

---

## 5. 核心方法详解

### NewACL()

**签名**：`func NewACL(management bool, policies []*Policy) (*ACL, error)`

**位置**：[L100](file:///d:/claude/nomad/acl/acl.go#L100)

**功能**：策略编译器，将多个 `Policy` 合并为一个 `ACL` 对象。

**编译流程**：

1. **管理 token 快速路径**：若 `management == true`，直接返回 `{management: true}`，跳过所有策略处理。
2. **初始化基数树事务**：为 namespaces/nodePools/hostVolumes/variables 各创建两个 iradix 事务（普通 + 通配符）。
3. **遍历所有策略**，对每个策略的各部分进行处理：
   - **Namespaces**：检查名称是否含 `*`，分别插入普通树或通配符树。若策略声明 `deny`，清空已有能力集。同时处理 `Variables.Paths` 子策略。
   - **NodePools**：类似命名空间处理，支持 glob。
   - **HostVolumes**：类似处理。
   - **Agent/Node/Operator/Sentinel/Quota/Plugin**：使用 `maxPrivilege()` 取最高权限合并。Operator/Sentinel 还合并精细能力集。
4. **提交事务**：将所有 iradix 事务 commit 为不可变树。
5. **设置虚拟策略默认值**：`client=deny`、`server=deny`、`isLeader=false`、`aclsDisabled=false`。

**Deny 优先原则**：在合并能力时，若遇到 `deny` 能力，立即清空集合并设为仅含 `deny`，跳过后续能力添加。

---

### AllowNamespaceOperation()

**签名**：`func (a *ACL) AllowNamespaceOperation(ns string, op string) bool`

**位置**：[L307](file:///d:/claude/nomad/acl/acl.go#L307)

**行为**：检查命名空间 `ns` 是否允许操作 `op`。

**判定逻辑**：

1. `a == nil` → 拒绝
2. `a.aclsDisabled || a.management` → 允许（ACL 禁用或管理 token）
3. `ns == "*"`（AllNamespacesSentinel）→ 若任一命名空间允许此操作则允许
4. 查找匹配的能力集（先精确匹配，再 glob 匹配）
5. 检查 `op` 是否在能力集中

---

### matchingNamespaceCapabilitySet() / findClosestMatchingGlob()

**位置**：[L668](file:///d:/claude/nomad/acl/acl.go#L668)、[L730](file:///d:/claude/nomad/acl/acl.go#L730)

**Glob 匹配算法**：

1. 先在精确树中查找命名空间名 → 命中则返回
2. 未命中则在通配符树中遍历所有模式，用 `glob.Glob()` 匹配
3. 若多个通配符匹配，计算每个的"差异度" `difference = len(name) - len(pattern) + count(*)`，选择差异度最小的（最具体的模式）
4. 稳定排序保证一致性

---

### AllowAgentDebug()

**签名**：`func (a *ACL) AllowAgentDebug(isDebugEnabled bool) bool`

**位置**：[L782](file:///d:/claude/nomad/acl/acl.go#L782)

**特殊逻辑**：这是 `AllowAgentRead` 的特殊变体。当 ACL 禁用时，不自动允许 debug，而是检查 `isDebugEnabled` 标志（来自 Agent 配置的 `enable_debug`）。这是唯一在 ACL 禁用时仍需额外检查的方法。

---

### matchingVariablesCapabilitySet() — 工作负载隐式授权

**位置**：[L700](file:///d:/claude/nomad/acl/acl.go#L700)

**隐式授权逻辑**：当 `claim != nil` 且命名空间匹配时，以下路径自动授予 `read`+`list` 能力：

- `nomad/jobs`
- `nomad/jobs/<job>`
- `nomad/jobs/<job>/<group>`
- `nomad/jobs/<job>/<group>/<task>`

这允许任务在运行时读取与自己相关的变量，无需显式策略授权。

---

## 6. 依赖关系

### 导入包

| 包路径 | 类型 | 用途 |
|--------|------|------|
| `fmt` | 标准库 | 格式化 |
| `sort` | 标准库 | 稳定排序 glob 匹配结果 |
| `strings` | 标准库 | 字符串包含检查（glob 检测） |
| `github.com/hashicorp/go-immutable-radix/v2` | 第三方库 | 不可变基数树，存储能力集 |
| `github.com/ryanuber/go-glob` | 第三方库 | Glob 模式匹配 |

### 内部依赖

| 依赖 | 关系 |
|------|------|
| `acl/policy.go` | 提供 `Policy`/`NamespacePolicy` 等类型定义和策略常量 |
| `acl/virtual.go` | 使用 `NewACL()` 创建虚拟 ACL 对象 |
| `nomad/structs` | 通过重定义 `AllNamespacesSentinel` 避免循环依赖 |

---

## 7. 设计模式与技术特点

- **不可变数据结构**：使用 `go-immutable-radix` 不可变基数树存储能力集，编译后的 `ACL` 对象是线程安全的，可被多个 goroutine 并发读取，无需锁。
- **Deny 优先原则**：在策略合并时，`deny` 能力立即清空集合并独占，确保安全默认。`maxPrivilege()` 函数中 `deny` 也优先于 `write`/`read`/`list`。
- **Glob 与精确分离**：含通配符的策略名存入单独的 `wildcard*` 树，精确名存入主树。查找时先查精确树（O(k) 快速查找），未命中再遍历通配符树。这种分离优化了常见情况（精确匹配）的性能。
- **最具体匹配**：当多个 glob 模式匹配同一名称时，选择"差异度"最小的模式（最具体的），确保更精确的策略优先于更宽泛的策略。
- **nil 安全**：所有 `Allow*` 方法的首行检查 `if a == nil { return false }`，确保未初始化的 ACL 默认拒绝。
- **快速路径优化**：`management` 和 `aclsDisabled` 检查在所有方法的开头，管理 token 和 ACL 禁用场景无需遍历树。
- **虚拟策略**：`client`/`server`/`isLeader` 字段模拟节点角色权限，不来自用户策略，由 `virtual.go` 设置。
- **哨兵值避免循环依赖**：`AllNamespacesSentinel = "*"` 在 acl 包内重定义，而非从 `structs` 包导入，避免 `acl → structs` 循环依赖。

---

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [policy.go](file:///d:/claude/nomad/acl/policy.go) | 策略定义与 HCL 解析，提供 `Policy` 类型和 `Parse()` 函数 |
| [virtual.go](file:///d:/claude/nomad/acl/virtual.go) | 虚拟 ACL 单例（Client/Server/ACLsDisabled） |
| [acl_test.go](file:///d:/claude/nomad/acl/acl_test.go) | 单元测试 |
| [../nomad/acl.go](file:///d:/claude/nomad/nomad/acl.go) | Server 层 ACL 集成，调用 `NewACL()` 编译 token 策略 |
| [../command/agent/http.go](file:///d:/claude/nomad/command/agent/http.go) | HTTP 端点调用 `Allow*` 方法进行权限检查 |
| [../nomad/structs/acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | structs 层的 ACL 辅助（`AllNamespacesSentinel` 的原始定义） |
