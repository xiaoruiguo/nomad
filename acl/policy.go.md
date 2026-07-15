# policy.go 代码说明文档

> 文件路径：[policy.go](file:///d:/claude/nomad/acl/policy.go)
> 总行数：818 行
> 所属包：`acl`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件是 **Nomad ACL 策略的数据模型与解析层**，定义所有策略结构体、能力常量、验证函数和 HCL 解析逻辑。它是 `acl.go`（执行层）的前置组件，负责将用户编写的 HCL/JSON 策略文本解析为结构化的 `Policy` 对象，并进行验证和能力展开。

**核心职责**：

1. **策略数据模型**：定义 `Policy` 及其 9 个子策略类型（Namespace/NodePool/HostVolume/Agent/Node/Operator/Sentinel/Quota/Plugin）。
2. **能力常量定义**：定义所有合法的粗粒度策略级别（deny/read/list/write/scale）和 50+ 个精细能力常量。
3. **策略解析**：`Parse()` 函数解析 HCL/JSON 策略文本，支持严格模式（创建时）和宽容模式（评估时）。
4. **能力展开**：`expand*Policy()` 函数将粗粒度策略（如 `write`）展开为对应的精细能力列表。
5. **验证**：正则验证命名空间/节点池/卷名格式，switch 验证能力和策略值合法性。
6. **HCL 解码修复**：`hclDecode()` 修复 HCL 解码器在无标签块上的 bug，手动重新解析以获取正确的键值。

**与 acl.go 的协作**：

```
HCL 策略文本 → policy.go: Parse() → *Policy → acl.go: NewACL() → *ACL（编译后）
                    ↑ 验证 + 能力展开              ↑ 合并 + 存入基数树
```

---

## 2. 类型定义

### Policy

**定义位置**：[L162](file:///d:/claude/nomad/acl/policy.go#L162)

**类型**：struct

```go
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

	ExtraKeysHCL []string `hcl:",unusedKeys"`
```

**用途**：顶层策略对象，对应一个完整的 ACL 策略文档。每个字段对应 HCL 中的一个块类型。`Raw` 保存原始文本。`ExtraKeysHCL` 捕获未知键用于严格模式报错。

**方法**：`IsEmpty()`、`removeExtraKey(key string)`

---

### NamespacePolicy

**定义位置**：[L200](file:///d:/claude/nomad/acl/policy.go#L200)

```go
	Name         string `hcl:",key"`
	Policy       string
	Capabilities []string
	Variables    *VariablesPolicy `hcl:"variables"`
```

**用途**：命名空间策略。`Name` 作为 HCL 块的键（`namespace "name" {...}`），支持 glob。`Policy` 是粗粒度简写（read/write/deny/scale），`Capabilities` 是精细能力列表，两者可共存。

---

### NodePoolPolicy

**定义位置**：[L212](file:///d:/claude/nomad/acl/policy.go#L212)

```go
	Name         string `hcl:",key"`
	Policy       string
	Capabilities []string
```

**用途**：节点池策略，结构类似 NamespacePolicy 但无 Variables 子策略。

---

### VariablesPolicy / VariablesPathPolicy

**定义位置**：[L219-L225](file:///d:/claude/nomad/acl/policy.go#L219)

```go
// VariablesPolicy
	Paths []*VariablesPathPolicy `hcl:"path"`

// VariablesPathPolicy
	PathSpec     string `hcl:",key"`
	Capabilities []string
```

**用途**：变量路径策略。`PathSpec` 是路径模式（如 `nomad/jobs/*`），`Capabilities` 是 list/read/write/destroy/deny。

---

### HostVolumePolicy

**定义位置**：[L233](file:///d:/claude/nomad/acl/policy.go#L233)

```go
	Name         string `hcl:",key"`
	Policy       string
	Capabilities []string
```

**用途**：主机卷策略，能力包括 mount-readonly/mount-readwrite/deny。

---

### AgentPolicy / NodePolicy / OperatorPolicy / SentinelPolicy / QuotaPolicy / PluginPolicy

**定义位置**：[L240-L270](file:///d:/claude/nomad/acl/policy.go#L240)

这些是粗粒度策略类型，主要只含 `Policy string` 字段（Operator/Sentinel 额外含 `Capabilities []string`）。

---

## 3. 常量与变量

### 策略级别常量

| 名称 | 值 | 说明 |
|------|----|------|
| `PolicyDeny` | `"deny"` | 拒绝（最高优先级） |
| `PolicyRead` | `"read"` | 只读 |
| `PolicyList` | `"list"` | 列表（仅 Plugin 用） |
| `PolicyWrite` | `"write"` | 读写 |
| `PolicyScale` | `"scale"` | 扩缩容（Namespace 专用） |

### 命名空间能力常量（40+ 个）

| 分类 | 常量示例 |
|------|---------|
| 作业 | `list-jobs`, `parse-job`, `read-job`, `submit-job`, `dispatch-job`, `register-job`, `revert-job`, `deregister-job`, `purge-job`, `evaluate-job`, `plan-job`, `tag-job-version`, `stable-job`, `force-periodic-job` |
| 日志/文件 | `read-logs`, `read-fs` |
| 执行 | `alloc-exec`, `alloc-node-exec`, `alloc-lifecycle`, `pause-allocation` |
| 部署 | `fail-deployment`, `pause-deployment`, `promote-deployment`, `unblock-deployment`, `cancel-deployment`, `set-alloc-health-deployment` |
| CSI | `csi-register-plugin`, `csi-write-volume`, `csi-read-volume`, `csi-list-volume`, `csi-mount-volume` |
| 主机卷 | `host-volume-create`, `host-volume-register`, `host-volume-read`, `host-volume-write`, `host-volume-delete` |
| 扩缩容 | `list-scaling-policies`, `read-scaling-policy`, `read-job-scaling`, `scale-job`, `submit-recommendation` |
| 其他 | `gc-allocation`, `delete-service-registration`, `sentinel-override`（企业版）, `deny` |

### 节点池能力常量

`NodePoolCapabilityDelete`, `NodePoolCapabilityDeny`, `NodePoolCapabilityRead`, `NodePoolCapabilityWrite`

### 主机卷能力常量

`HostVolumeCapabilityDeny`, `HostVolumeCapabilityMountReadOnly`, `HostVolumeCapabilityMountReadWrite`

### 变量能力常量

`VariablesCapabilityList`, `VariablesCapabilityRead`, `VariablesCapabilityWrite`, `VariablesCapabilityDestroy`, `VariablesCapabilityDeny`

### Operator 能力常量

`OperatorCapabilityDeny`, `OperatorCapabilitySnapshotSave`, `OperatorCapabilityLicenseRead`, `OperatorCapabilityKeyringRotate`, `OperatorCapabilityKeyringRead`, `OperatorCapabilityKeyringDelete`

### Sentinel 能力常量

`SentinelCapabilityDeny`, `SentinelCapabilityRead`, `SentinelCapabilitySubmit`, `SentinelCapabilityDelete`

### 解析模式常量

| 名称 | 值 | 用途 |
|------|----|------|
| `PolicyParseStrict` | `true` | 严格模式，未知键报错（创建/更新策略时用） |
| `PolicyParseLenient` | `false` | 宽容模式，忽略未知键（评估旧策略时用） |

### 正则验证变量

| 名称 | 模式 | 用途 |
|------|------|------|
| `validNamespace` | `^[a-zA-Z0-9-*]{1,128}$` | 命名空间名验证 |
| `validNodePool` | `^[a-zA-Z0-9-_*]{1,128}$` | 节点名验证（含下划线） |
| `validVolume` | `^[a-zA-Z0-9-*]{1,128}$` | 主机卷名验证 |

---

## 4. 方法与函数

### 解析函数

| 函数 | 参数 | 返回值 | 行号 |
|------|------|--------|------|
| `Parse` | `rules string, strict bool` | `*Policy, error` | [L558](file:///d:/claude/nomad/acl/policy.go#L558) |
| `hclDecode` | `p *Policy, rules string` | `error` | [L735](file:///d:/claude/nomad/acl/policy.go#L735) |

### 验证函数

| 函数 | 参数 | 返回值 | 行号 |
|------|------|--------|------|
| `isPolicyValid` | `policy string` | `bool` | [L278](file:///d:/claude/nomad/acl/policy.go#L278) |
| `isNamespaceCapabilityValid` | `cap string` | `bool` | [L298](file:///d:/claude/nomad/acl/policy.go#L298) |
| `isPathCapabilityValid` | `cap string` | `bool` | [L341](file:///d:/claude/nomad/acl/policy.go#L341) |
| `isNodePoolCapabilityValid` | `cap string` | `bool` | [L443](file:///d:/claude/nomad/acl/policy.go#L443) |
| `isHostVolumeCapabilityValid` | `cap string` | `bool` | [L510](file:///d:/claude/nomad/acl/policy.go#L510) |
| `isOperatorCapabilityValid` | `cap string` | `bool` | [L465](file:///d:/claude/nomad/acl/policy.go#L465) |
| `isSentinelCapabilityValid` | `cap string` | `bool` | [L482](file:///d:/claude/nomad/acl/policy.go#L482) |
| `(*PluginPolicy).isValid` | - | `bool` | [L289](file:///d:/claude/nomad/acl/policy.go#L289) |

### 能力展开函数

| 函数 | 参数 | 返回值 | 行号 |
|------|------|--------|------|
| `expandNamespacePolicy` | `policy string` | `[]string` | [L357](file:///d:/claude/nomad/acl/policy.go#L357) |
| `expandNamespaceCapabilities` | `ns *NamespacePolicy` | - | [L404](file:///d:/claude/nomad/acl/policy.go#L404) |
| `expandNodePoolPolicy` | `policy string` | `[]string` | [L498](file:///d:/claude/nomad/acl/policy.go#L498) |
| `expandHostVolumePolicy` | `policy string` | `[]string` | [L524](file:///d:/claude/nomad/acl/policy.go#L524) |
| `expandOperatorPolicy` | `policy string` | `[]string` | [L475](file:///d:/claude/nomad/acl/policy.go#L475) |
| `expandSentinelPolicy` | `policy string` | `[]string` | [L547](file:///d:/claude/nomad/acl/policy.go#L547) |
| `expandVariablesCapabilities` | `caps []string` | `[]string` | [L538](file:///d:/claude/nomad/acl/policy.go#L538) |

### Policy 方法

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `IsEmpty` | `p *Policy` | - | `bool` | [L182](file:///d:/claude/nomad/acl/policy.go#L182) |
| `removeExtraKey` | `p *Policy` | `key string` | - | [L193](file:///d:/claude/nomad/acl/policy.go#L193) |

---

## 5. 核心方法详解

### Parse()

**签名**：`func Parse(rules string, strict bool) (*Policy, error)`

**位置**：[L558](file:///d:/claude/nomad/acl/policy.go#L558)

**功能**：解析 HCL/JSON 策略文本为 `Policy` 对象。

**解析流程**：

1. **空规则快速路径**：若 `rules == ""`，返回空 Policy。
2. **HCL 解码**：调用 `hclDecode()` 解析到 `Policy` 结构。
3. **非空检查**：`IsEmpty()` 确保至少有一个策略块。
4. **验证与展开**（按资源类型遍历）：
   - **Namespaces**：正则验证名称 → 验证 Policy 值 → 验证每个 Capability → `expandNamespacePolicy()` 展开粗粒度 → `expandNamespaceCapabilities()` 补充隐式能力 → 处理 Variables 子策略（验证路径不以 `/` 开头、验证能力、`expandVariablesCapabilities()` 补充 list）→ `removeExtraKey()`
   - **NodePools**：正则验证 → 验证能力
   - **HostVolumes**：正则验证 → 验证 Policy → 验证能力
   - **Agent/Node**：验证 Policy 值
   - **Operator**：验证 Policy → 验证精细能力
   - **Sentinel**：验证 Policy → 验证精细能力
   - **Quota**：验证 Policy 值
   - **Plugin**：验证 Policy 值
5. **严格模式检查**：若 `strict == true` 且 `ExtraKeysHCL` 非空，返回错误。

**strict 参数语义**：
- `PolicyParseStrict`（true）：创建/更新策略时使用，未知键报错
- `PolicyParseLenient`（false）：评估策略时使用，忽略未知键（兼容旧策略）

---

### expandNamespacePolicy()

**位置**：[L357](file:///d:/claude/nomad/acl/policy.go#L357)

**能力展开映射**：

| 策略 | 展开为能力 |
|------|-----------|
| `deny` | `[deny]` |
| `read` | `list-jobs, parse-job, read-job, csi-list-volume, csi-read-volume, read-job-scaling, list-scaling-policies, read-scaling-policy, host-volume-read` |
| `write` | read 全部 + `scale-job, submit-job, dispatch-job, read-logs, read-fs, alloc-exec, alloc-lifecycle, csi-mount-volume, csi-write-volume, submit-recommendation, host-volume-create` |
| `scale` | `list-scaling-policies, read-scaling-policy, read-job-scaling, scale-job, read-job, submit-recommendation` |

---

### expandNamespaceCapabilities() — 隐式能力补充

**位置**：[L404](file:///d:/claude/nomad/acl/policy.go#L404)

**隐式能力规则**：

| 显式能力 | 隐式补充 |
|---------|---------|
| `host-volume-write` | `host-volume-register, host-volume-create, host-volume-delete, host-volume-read` |
| `host-volume-register` | `host-volume-create, host-volume-read` |
| `host-volume-create` | `host-volume-read` |

这体现了"写隐含读"的权限继承原则。重复能力会在 `NewACL()` 的基数树中自动去重。

---

### hclDecode() — HCL 解码器 Bug 修复

**位置**：[L735](file:///d:/claude/nomad/acl/policy.go#L735)

**问题**：HCL 解码器在处理无标签块（如 `namespace {}` 缺少名称）时，会设置错误的键值，导致无法区分"用户未提供键"和"解码器错误设置"。

**解决方案**：

1. 先用 `hcl.Decode()` 解码到 `Policy` 结构（可能产生错误键值）
2. 再用 `hcl.Parse()` 手动解析为 AST
3. 遍历 AST 的 `namespace`/`node_pool`/`host_volume` 块，检查 `Keys` 长度：
   - 若 `len(Keys) == 0`，将对应的 `Policy.Namespaces[i].Name` 设为空字符串
   - 后续验证会因空名称报错（正则不匹配）
4. 对 `variables.path` 子块做同样处理
5. 用 `recover()` 捕获 HCL 解码器的 panic，转为 error 返回

---

### expandVariablesCapabilities() — 变量能力补充

**位置**：[L538](file:///d:/claude/nomad/acl/policy.go#L538)

**规则**：
- 若含 `deny`，直接返回 `[deny]`
- 若含 `read` 但不含 `list`，自动补充 `list`（读隐含列表）

---

## 6. 依赖关系

### 导入包

| 包路径 | 类型 | 用途 |
|--------|------|------|
| `errors` | 标准库 | 创建错误 |
| `fmt` | 标准库 | 格式化错误 |
| `regexp` | 标准库 | 名称格式验证 |
| `slices` | 标准库 | `slices.Index` 查找 ExtraKeysHCL |
| `strings` | 标准库 | 前缀检查（路径验证） |
| `github.com/hashicorp/hcl` | 第三方库 | HCL 解码与 AST 解析 |
| `github.com/hashicorp/hcl/hcl/ast` | 第三方库 | HCL AST 类型（`ast.ObjectList`） |

---

## 7. 设计模式与技术特点

- **粗粒度与细粒度并行**：策略同时支持简写（`policy = "write"`）和精细能力（`capabilities = ["submit-job"]`），两者可共存。`expand*Policy()` 将简写展开为能力列表，在 `acl.go` 的 `NewACL()` 中统一处理。
- **严格/宽容双模式**：`Parse()` 的 `strict` 参数支持创建时严格校验（拒绝未知键）和评估时宽容处理（忽略未知键），平衡安全性与向后兼容。
- **验证函数表驱动**：`is*Valid()` 系列函数使用 switch 语句枚举所有合法值，新增能力时需同步更新。这是一种显式的白名单验证模式。
- **HCL 解码器 Bug 绕过**：`hclDecode()` 通过双重解析（Decode + Parse AST）修复 HCL 库的无标签块处理缺陷，是针对第三方库 bug 的防御性编程。
- **ExtraKeysHCL 机制**：利用 HCL 的 `,unusedKeys` 标签捕获未知键，实现严格模式的未知键检测。同时需手动 `removeExtraKey()` 移除已知块类型在 ExtraKeysHCL 中的残留（HCL 库的已知缺陷）。
- **隐式能力继承**：`expandNamespaceCapabilities()` 和 `expandVariablesCapabilities()` 自动补充隐含能力（写隐含读），减少策略配置负担。
- **正则名称验证**：使用预编译的 `regexp.MustCompile` 验证资源名格式，限制 1-128 字符、仅允许字母数字和通配符。

---

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl.go](file:///d:/claude/nomad/acl/acl.go) | 执行层，`NewACL()` 消费 `Policy` 对象编译为 `ACL` |
| [virtual.go](file:///d:/claude/nomad/acl/virtual.go) | 使用空策略列表创建虚拟 ACL |
| [policy_test.go](file:///d:/claude/nomad/acl/policy_test.go) | 单元测试 |
| [../nomad/acl_endpoint.go](file:///d:/claude/nomad/nomad/acl_endpoint.go) | Server 层调用 `Parse()` 解析用户提交的策略 |
| [../command/agent/acl_endpoint.go](file:///d:/claude/nomad/command/agent/acl_endpoint.go) | HTTP 端点调用 `Parse()` 处理策略 CRUD |
| [../helper/uuid/uuid.go](file:///d:/claude/nomad/helper/uuid/uuid.go) | Token 生成（ACL Token 关联策略） |
