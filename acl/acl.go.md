# acl.go 代码说明文档

> 文件路径：[acl/acl.go](file:///d:/claude/nomad/acl/acl.go)
> 总行数：1055 行
> 所属包：`acl`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `acl` 包，定义结构体类型、包含 45 个方法/函数。

## 2. 类型定义

### capabilitySet

**定义位置**：[L30](file:///d:/claude/nomad/acl/acl.go#L30)

**类型定义**：`type capabilitySet map[string]struct{...}`

**关联方法**（3 个）：`Check`, `Set`, `Clear`

### ACL

**定义位置**：[L49](file:///d:/claude/nomad/acl/acl.go#L49)

**中文说明**：ACL 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACL struct {
	management bool
	namespaces *iradix.Tree[capabilitySet]
	wildcardNamespaces *iradix.Tree[capabilitySet]
	nodePools *iradix.Tree[capabilitySet]
	wildcardNodePools *iradix.Tree[capabilitySet]
	hostVolumes *iradix.Tree[capabilitySet]
	wildcardHostVolumes *iradix.Tree[capabilitySet]
	variables *iradix.Tree[capabilitySet]
	wildcardVariables *iradix.Tree[capabilitySet]
	agent string
	node string
	operator string
	sentinel string
	quota string
	plugin string
	operatorCapabilities capabilitySet
	sentinelCapabilities capabilitySet
	client string
	pool string
	server string
	isLeader bool
	aclsDisabled bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `management` | `bool` | 布尔值 |
| `namespaces` | `*iradix.Tree[capabilitySet]` | — |
| `wildcardNamespaces` | `*iradix.Tree[capabilitySet]` | — |
| `nodePools` | `*iradix.Tree[capabilitySet]` | — |
| `wildcardNodePools` | `*iradix.Tree[capabilitySet]` | — |
| `hostVolumes` | `*iradix.Tree[capabilitySet]` | — |
| `wildcardHostVolumes` | `*iradix.Tree[capabilitySet]` | — |
| `variables` | `*iradix.Tree[capabilitySet]` | — |
| `wildcardVariables` | `*iradix.Tree[capabilitySet]` | — |
| `agent` | `string` | 字符串 |
| `node` | `string` | 字符串 |
| `operator` | `string` | 字符串 |
| `sentinel` | `string` | 字符串 |
| `quota` | `string` | 字符串 |
| `plugin` | `string` | 字符串 |
| `operatorCapabilities` | `capabilitySet` | — |
| `sentinelCapabilities` | `capabilitySet` | — |
| `client` | `string` | 字符串 |
| `pool` | `string` | 字符串 |
| `server` | `string` | 字符串 |
| `isLeader` | `bool` | 布尔值 |
| `aclsDisabled` | `bool` | 布尔值 |

**关联方法**（37 个）：`AllowNsOp`, `AllowNsOpFunc`, `AllowNsOpAnyOf`, `AllowNamespaceOperation`, `AllowNamespace`, `AllowNodePoolOperation`, `AllowNodePool`, `AllowNodePoolSearch`, `AllowHostVolumeOperation`, `AllowHostVolume`, `AllowVariableOperation`, `AllowVariableSearch`, `matchingNamespaceCapabilitySet`, `anyNamespaceAllowsOp`, `anyNamespaceAllowsAnyOp`, `anyNamespaceAllows`, `matchingNodePoolCapabilitySet`, `matchingHostVolumeCapabilitySet`, `matchingVariablesCapabilitySet`, `findClosestMatchingGlob`, `AllowAgentRead`, `AllowAgentWrite`, `AllowAgentDebug`, `AllowNodeRead`, `AllowNodeWrite`, `AllowOperatorRead`, `AllowOperatorWrite`, `AllowOperatorOperation`, `AllowSentinelOperation`, `AllowQuotaRead`, `AllowQuotaWrite`, `AllowPluginRead`, `AllowPluginList`, `AllowServiceRegistrationReadList`, `AllowServerOp`, `AllowClientOp`, `IsManagement`

### ACLClaim

**定义位置**：[L577](file:///d:/claude/nomad/acl/acl.go#L577)

**中文说明**：ACLClaim 与访问控制列表（ACL）相关，管理权限和认证。

**类型**：struct

```go
type ACLClaim struct {
	Namespace string
	Job string
	Group string
	Task string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string` | 命名空间 |
| `Job` | `string` | 字符串 |
| `Group` | `string` | 字符串 |
| `Task` | `string` | 字符串 |

### matchingGlob

**定义位置**：[L722](file:///d:/claude/nomad/acl/acl.go#L722)

**中文说明**：matchingGlob 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type matchingGlob struct {
	name string
	difference int
	capabilitySet capabilitySet
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `name` | `string` | 名称 |
| `difference` | `int` | — |
| `capabilitySet` | `capabilitySet` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `AllNamespacesSentinel` | `—` | `"*"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ManagementACL` | `*ACL` | `` | — |
| `workloadVariablesCapabilitySet` | `—` | `capabilitySet{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `init` | - | `` | `` | [L21](file:///d:/claude/nomad/acl/acl.go#L21) |
| `Check` | `c *capabilitySet` | `k string` | `bool` | [L32](file:///d:/claude/nomad/acl/acl.go#L32) |
| `Set` | `c *capabilitySet` | `k string` | `` | [L37](file:///d:/claude/nomad/acl/acl.go#L37) |
| `Clear` | `c *capabilitySet` | `` | `` | [L41](file:///d:/claude/nomad/acl/acl.go#L41) |
| `maxPrivilege` | - | `a string, b string` | `string` | [L95](file:///d:/claude/nomad/acl/acl.go#L95) |
| `NewACL` | - | `management bool, policies []*Policy` | `*ACL, error` | [L112](file:///d:/claude/nomad/acl/acl.go#L112) |
| `AllowNsOp` | `a *ACL` | `ns string, op string` | `bool` | [L353](file:///d:/claude/nomad/acl/acl.go#L353) |
| `AllowNsOpFunc` | `a *ACL` | `ops ...string` | `func(...)` | [L359](file:///d:/claude/nomad/acl/acl.go#L359) |
| `AllowNsOpAnyOf` | `a *ACL` | `ns string, ops ...string` | `bool` | [L366](file:///d:/claude/nomad/acl/acl.go#L366) |
| `AllowNamespaceOperation` | `a *ACL` | `ns string, op string` | `bool` | [L376](file:///d:/claude/nomad/acl/acl.go#L376) |
| `AllowNamespace` | `a *ACL` | `ns string` | `bool` | [L403](file:///d:/claude/nomad/acl/acl.go#L403) |
| `AllowNodePoolOperation` | `a *ACL` | `pool string, op string` | `bool` | [L435](file:///d:/claude/nomad/acl/acl.go#L435) |
| `AllowNodePool` | `a *ACL` | `pool string` | `bool` | [L456](file:///d:/claude/nomad/acl/acl.go#L456) |
| `AllowNodePoolSearch` | `a *ACL` | `` | `bool` | [L484](file:///d:/claude/nomad/acl/acl.go#L484) |
| `AllowHostVolumeOperation` | `a *ACL` | `hv string, op string` | `bool` | [L513](file:///d:/claude/nomad/acl/acl.go#L513) |
| `AllowHostVolume` | `a *ACL` | `ns string` | `bool` | [L534](file:///d:/claude/nomad/acl/acl.go#L534) |
| `AllowVariableOperation` | `a *ACL` | `ns string, path string, op string, claim *ACLClaim` | `bool` | [L558](file:///d:/claude/nomad/acl/acl.go#L558) |
| `AllowVariableSearch` | `a *ACL` | `ns string` | `bool` | [L587](file:///d:/claude/nomad/acl/acl.go#L587) |
| `matchingNamespaceCapabilitySet` | `a *ACL` | `ns string` | `capabilitySet, bool` | [L619](file:///d:/claude/nomad/acl/acl.go#L619) |
| `anyNamespaceAllowsOp` | `a *ACL` | `op string` | `bool` | [L632](file:///d:/claude/nomad/acl/acl.go#L632) |
| `anyNamespaceAllowsAnyOp` | `a *ACL` | `` | `bool` | [L640](file:///d:/claude/nomad/acl/acl.go#L640) |
| `anyNamespaceAllows` | `a *ACL` | `cb func(...)` | `bool` | [L648](file:///d:/claude/nomad/acl/acl.go#L648) |
| `matchingNodePoolCapabilitySet` | `a *ACL` | `pool string` | `capabilitySet, bool` | [L667](file:///d:/claude/nomad/acl/acl.go#L667) |
| `matchingHostVolumeCapabilitySet` | `a *ACL` | `name string` | `capabilitySet, bool` | [L681](file:///d:/claude/nomad/acl/acl.go#L681) |
| `matchingVariablesCapabilitySet` | `a *ACL` | `ns string, path string, claim *ACLClaim` | `capabilitySet, bool` | [L701](file:///d:/claude/nomad/acl/acl.go#L701) |
| `findClosestMatchingGlob` | `a *ACL` | `radix *iradix.Tree[capabilitySet], ns string` | `capabilitySet, bool` | [L728](file:///d:/claude/nomad/acl/acl.go#L728) |
| `findAllMatchingWildcards` | - | `radix *iradix.Tree[capabilitySet], name string` | `[]matchingGlob` | [L752](file:///d:/claude/nomad/acl/acl.go#L752) |
| `AllowAgentRead` | `a *ACL` | `` | `bool` | [L778](file:///d:/claude/nomad/acl/acl.go#L778) |
| `AllowAgentWrite` | `a *ACL` | `` | `bool` | [L794](file:///d:/claude/nomad/acl/acl.go#L794) |
| `AllowAgentDebug` | `a *ACL` | `isDebugEnabled bool` | `bool` | [L810](file:///d:/claude/nomad/acl/acl.go#L810) |
| `AllowNodeRead` | `a *ACL` | `` | `bool` | [L828](file:///d:/claude/nomad/acl/acl.go#L828) |
| `AllowNodeWrite` | `a *ACL` | `` | `bool` | [L849](file:///d:/claude/nomad/acl/acl.go#L849) |
| `AllowOperatorRead` | `a *ACL` | `` | `bool` | [L863](file:///d:/claude/nomad/acl/acl.go#L863) |
| `AllowOperatorWrite` | `a *ACL` | `` | `bool` | [L879](file:///d:/claude/nomad/acl/acl.go#L879) |
| `AllowOperatorOperation` | `a *ACL` | `op string` | `bool` | [L893](file:///d:/claude/nomad/acl/acl.go#L893) |
| `AllowSentinelOperation` | `a *ACL` | `op string` | `bool` | [L909](file:///d:/claude/nomad/acl/acl.go#L909) |
| `AllowQuotaRead` | `a *ACL` | `` | `bool` | [L929](file:///d:/claude/nomad/acl/acl.go#L929) |
| `AllowQuotaWrite` | `a *ACL` | `` | `bool` | [L945](file:///d:/claude/nomad/acl/acl.go#L945) |
| `AllowPluginRead` | `a *ACL` | `` | `bool` | [L959](file:///d:/claude/nomad/acl/acl.go#L959) |
| `AllowPluginList` | `a *ACL` | `` | `bool` | [L973](file:///d:/claude/nomad/acl/acl.go#L973) |
| `AllowServiceRegistrationReadList` | `a *ACL` | `ns string, isWorkload bool` | `bool` | [L988](file:///d:/claude/nomad/acl/acl.go#L988) |
| `AllowServerOp` | `a *ACL` | `` | `bool` | [L999](file:///d:/claude/nomad/acl/acl.go#L999) |
| `AllowClientOp` | `a *ACL` | `pool string` | `bool` | [L1008](file:///d:/claude/nomad/acl/acl.go#L1008) |
| `IsManagement` | `a *ACL` | `` | `bool` | [L1024](file:///d:/claude/nomad/acl/acl.go#L1024) |
| `NamespaceValidator` | - | `ops ...string` | `func(...)` | [L1034](file:///d:/claude/nomad/acl/acl.go#L1034) |

## 5. 核心方法详解

### Check()

**签名**：`func (c *capabilitySet) Check(k string) bool`

**位置**：[L32](file:///d:/claude/nomad/acl/acl.go#L32)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `k` | `string` | 字符串 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `bool` | 布尔值 |

### Set()

**签名**：`func (c *capabilitySet) Set(k string) `

**位置**：[L37](file:///d:/claude/nomad/acl/acl.go#L37)

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `k` | `string` | 字符串 |

### NewACL()

**签名**：`func NewACL(management bool, policies []*Policy) *ACL, error`

**位置**：[L112](file:///d:/claude/nomad/acl/acl.go#L112)

**中文说明**：创建并返回一个新的 ACL 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `management` | `bool` | 布尔值 |
| `policies` | `[]*Policy` | 列表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*ACL` | — |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/go-immutable-radix/v2` | 第三方库 |
| `github.com/ryanuber/go-glob` | 第三方库 |

## 7. 设计模式与技术特点

- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl_test.go](file:///d:/claude/nomad/acl/acl_test.go) | 对应测试文件 |
| [policy.go](file:///d:/claude/nomad/acl/policy.go) | 同目录源文件 |
| [virtual.go](file:///d:/claude/nomad/acl/virtual.go) | 同目录源文件 |

