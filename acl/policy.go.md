# policy.go 代码说明文档

> 文件路径：[acl/policy.go](file:///d:/claude/nomad/acl/policy.go)
> 总行数：819 行
> 所属包：`acl`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `acl` 包，定义结构体类型、包含 19 个方法/函数。

## 2. 类型定义

### Policy

**定义位置**：[L158](file:///d:/claude/nomad/acl/policy.go#L158)

**中文说明**：Policy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type Policy struct {
	Namespaces []*NamespacePolicy `hcl:"namespace,expand"`
	NodePools []*NodePoolPolicy `hcl:"node_pool,expand"`
	HostVolumes []*HostVolumePolicy `hcl:"host_volume,expand"`
	Agent *AgentPolicy `hcl:"agent"`
	Node *NodePolicy `hcl:"node"`
	Operator *OperatorPolicy `hcl:"operator"`
	Sentinel *SentinelPolicy `hcl:"sentinel"`
	Quota *QuotaPolicy `hcl:"quota"`
	Plugin *PluginPolicy `hcl:"plugin"`
	Raw string `hcl:"-"`
	ExtraKeysHCL []string `hcl:",unusedKeys"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespaces` | `[]*NamespacePolicy `hcl:"namespace,expand"`` | 列表 |
| `NodePools` | `[]*NodePoolPolicy `hcl:"node_pool,expand"`` | 列表 |
| `HostVolumes` | `[]*HostVolumePolicy `hcl:"host_volume,expand"`` | 列表 |
| `Agent` | `*AgentPolicy `hcl:"agent"`` | — |
| `Node` | `*NodePolicy `hcl:"node"`` | — |
| `Operator` | `*OperatorPolicy `hcl:"operator"`` | — |
| `Sentinel` | `*SentinelPolicy `hcl:"sentinel"`` | — |
| `Quota` | `*QuotaPolicy `hcl:"quota"`` | — |
| `Plugin` | `*PluginPolicy `hcl:"plugin"`` | — |
| `Raw` | `string `hcl:"-"`` | 字符串 |
| `ExtraKeysHCL` | `[]string `hcl:",unusedKeys"`` | 列表 |

**关联方法**（2 个）：`IsEmpty`, `removeExtraKey`

### NamespacePolicy

**定义位置**：[L205](file:///d:/claude/nomad/acl/policy.go#L205)

**中文说明**：NamespacePolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type NamespacePolicy struct {
	Name string `hcl:",key"`
	Policy string
	Capabilities []string
	Variables *VariablesPolicy `hcl:"variables"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:",key"`` | 名称 |
| `Policy` | `string` | 策略 |
| `Capabilities` | `[]string` | 列表 |
| `Variables` | `*VariablesPolicy `hcl:"variables"`` | — |

### NodePoolPolicy

**定义位置**：[L213](file:///d:/claude/nomad/acl/policy.go#L213)

**中文说明**：NodePoolPolicy 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodePoolPolicy struct {
	Name string `hcl:",key"`
	Policy string
	Capabilities []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:",key"`` | 名称 |
| `Policy` | `string` | 策略 |
| `Capabilities` | `[]string` | 列表 |

### VariablesPolicy

**定义位置**：[L219](file:///d:/claude/nomad/acl/policy.go#L219)

**中文说明**：VariablesPolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type VariablesPolicy struct {
	Paths []*VariablesPathPolicy `hcl:"path"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Paths` | `[]*VariablesPathPolicy `hcl:"path"`` | 列表 |

### VariablesPathPolicy

**定义位置**：[L223](file:///d:/claude/nomad/acl/policy.go#L223)

**中文说明**：VariablesPathPolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type VariablesPathPolicy struct {
	PathSpec string `hcl:",key"`
	Capabilities []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `PathSpec` | `string `hcl:",key"`` | 字符串 |
| `Capabilities` | `[]string` | 列表 |

### HostVolumePolicy

**定义位置**：[L229](file:///d:/claude/nomad/acl/policy.go#L229)

**中文说明**：HostVolumePolicy 与卷（Volume）相关，管理持久化存储。

**类型**：struct

```go
type HostVolumePolicy struct {
	Name string `hcl:",key"`
	Policy string
	Capabilities []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string `hcl:",key"`` | 名称 |
| `Policy` | `string` | 策略 |
| `Capabilities` | `[]string` | 列表 |

### AgentPolicy

**定义位置**：[L235](file:///d:/claude/nomad/acl/policy.go#L235)

**中文说明**：AgentPolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type AgentPolicy struct {
	Policy string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Policy` | `string` | 策略 |

### NodePolicy

**定义位置**：[L239](file:///d:/claude/nomad/acl/policy.go#L239)

**中文说明**：NodePolicy 与节点（Node）相关，节点是 Nomad 客户端运行任务的载体。

**类型**：struct

```go
type NodePolicy struct {
	Policy string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Policy` | `string` | 策略 |

### OperatorPolicy

**定义位置**：[L243](file:///d:/claude/nomad/acl/policy.go#L243)

**中文说明**：OperatorPolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type OperatorPolicy struct {
	Policy string
	Capabilities []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Policy` | `string` | 策略 |
| `Capabilities` | `[]string` | 列表 |

### SentinelPolicy

**定义位置**：[L248](file:///d:/claude/nomad/acl/policy.go#L248)

**中文说明**：SentinelPolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type SentinelPolicy struct {
	Policy string
	Capabilities []string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Policy` | `string` | 策略 |
| `Capabilities` | `[]string` | 列表 |

### QuotaPolicy

**定义位置**：[L253](file:///d:/claude/nomad/acl/policy.go#L253)

**中文说明**：QuotaPolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type QuotaPolicy struct {
	Policy string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Policy` | `string` | 策略 |

### PluginPolicy

**定义位置**：[L257](file:///d:/claude/nomad/acl/policy.go#L257)

**中文说明**：PluginPolicy 与插件（Plugin）相关，实现可扩展的功能模块。

**类型**：struct

```go
type PluginPolicy struct {
	Policy string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Policy` | `string` | 策略 |

**关联方法**（1 个）：`isValid`

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `PolicyDeny` | `—` | `"deny"` | — |
| `PolicyRead` | `—` | `"read"` | — |
| `PolicyList` | `—` | `"list"` | — |
| `PolicyWrite` | `—` | `"write"` | — |
| `PolicyScale` | `—` | `"scale"` | — |
| `NamespaceCapabilityDeny` | `—` | `"deny"` | — |
| `NamespaceCapabilityListJobs` | `—` | `"list-jobs"` | — |
| `NamespaceCapabilityParseJob` | `—` | `"parse-job"` | — |
| `NamespaceCapabilityReadJob` | `—` | `"read-job"` | — |
| `NamespaceCapabilitySubmitJob` | `—` | `"submit-job"` | — |
| `NamespaceCapabilityDispatchJob` | `—` | `"dispatch-job"` | — |
| `NamespaceCapabilityReadLogs` | `—` | `"read-logs"` | — |
| `NamespaceCapabilityReadFS` | `—` | `"read-fs"` | — |
| `NamespaceCapabilityAllocExec` | `—` | `"alloc-exec"` | — |
| `NamespaceCapabilityAllocNodeExec` | `—` | `"alloc-node-exec"` | — |
| `NamespaceCapabilityAllocLifecycle` | `—` | `"alloc-lifecycle"` | — |
| `NamespaceCapabilitySentinelOverride` | `—` | `"sentinel-override"` | — |
| `NamespaceCapabilityCSIRegisterPlugin` | `—` | `"csi-register-plugin"` | — |
| `NamespaceCapabilityCSIWriteVolume` | `—` | `"csi-write-volume"` | — |
| `NamespaceCapabilityCSIReadVolume` | `—` | `"csi-read-volume"` | — |
| `NamespaceCapabilityCSIListVolume` | `—` | `"csi-list-volume"` | — |
| `NamespaceCapabilityCSIMountVolume` | `—` | `"csi-mount-volume"` | — |
| `NamespaceCapabilityHostVolumeCreate` | `—` | `"host-volume-create"` | — |
| `NamespaceCapabilityHostVolumeRegister` | `—` | `"host-volume-register"` | — |
| `NamespaceCapabilityHostVolumeRead` | `—` | `"host-volume-read"` | — |
| `NamespaceCapabilityHostVolumeWrite` | `—` | `"host-volume-write"` | — |
| `NamespaceCapabilityHostVolumeDelete` | `—` | `"host-volume-delete"` | — |
| `NamespaceCapabilityListScalingPolicies` | `—` | `"list-scaling-policies"` | — |
| `NamespaceCapabilityReadScalingPolicy` | `—` | `"read-scaling-policy"` | — |
| `NamespaceCapabilityReadJobScaling` | `—` | `"read-job-scaling"` | — |
| `NamespaceCapabilityScaleJob` | `—` | `"scale-job"` | — |
| `NamespaceCapabilitySubmitRecommendation` | `—` | `"submit-recommendation"` | — |
| `NamespaceCapabilityRegisterJob` | `—` | `"register-job"` | — |
| `NamespaceCapabilityRevertJob` | `—` | `"revert-job"` | — |
| `NamespaceCapabilityDeregisterJob` | `—` | `"deregister-job"` | — |
| `NamespaceCapabilityPurgeJob` | `—` | `"purge-job"` | — |
| `NamespaceCapabilityEvaluateJob` | `—` | `"evaluate-job"` | — |
| `NamespaceCapabilityPlanJob` | `—` | `"plan-job"` | — |
| `NamespaceCapabilityTagJobVersion` | `—` | `"tag-job-version"` | — |
| `NamespaceCapabilityStableJob` | `—` | `"stable-job"` | — |
| `NamespaceCapabilityFailDeployment` | `—` | `"fail-deployment"` | — |
| `NamespaceCapabilityPauseDeployment` | `—` | `"pause-deployment"` | — |
| `NamespaceCapabilityPromoteDeployment` | `—` | `"promote-deployment"` | — |
| `NamespaceCapabilityUnblockDeployment` | `—` | `"unblock-deployment"` | — |
| `NamespaceCapabilityCancelDeployment` | `—` | `"cancel-deployment"` | — |
| `NamespaceCapabilitySetAllocHealthDeployment` | `—` | `"set-alloc-health-deployment"` | — |
| `NamespaceCapabilityGCAllocation` | `—` | `"gc-allocation"` | — |
| `NamespaceCapabilityPauseAllocation` | `—` | `"pause-allocation"` | — |
| `NamespaceCapabilityForcePeriodicJob` | `—` | `"force-periodic-job"` | — |
| `NamespaceCapabilityDeleteServiceRegistration` | `—` | `"delete-service-registration"` | — |
| `NodePoolCapabilityDelete` | `—` | `"delete"` | — |
| `NodePoolCapabilityDeny` | `—` | `"deny"` | — |
| `NodePoolCapabilityRead` | `—` | `"read"` | — |
| `NodePoolCapabilityWrite` | `—` | `"write"` | — |
| `HostVolumeCapabilityDeny` | `—` | `"deny"` | — |
| `HostVolumeCapabilityMountReadOnly` | `—` | `"mount-readonly"` | — |
| `HostVolumeCapabilityMountReadWrite` | `—` | `"mount-readwrite"` | — |
| `VariablesCapabilityList` | `—` | `"list"` | — |
| `VariablesCapabilityRead` | `—` | `"read"` | — |
| `VariablesCapabilityWrite` | `—` | `"write"` | — |
| `VariablesCapabilityDestroy` | `—` | `"destroy"` | — |
| `VariablesCapabilityDeny` | `—` | `"deny"` | — |
| `OperatorCapabilityDeny` | `—` | `"deny"` | — |
| `OperatorCapabilitySnapshotSave` | `—` | `"snapshot-save"` | — |
| `OperatorCapabilityLicenseRead` | `—` | `"license-read"` | — |
| `OperatorCapabilityKeyringRotate` | `—` | `"keyring-rotate"` | — |
| `OperatorCapabilityKeyringRead` | `—` | `"keyring-read"` | — |
| `OperatorCapabilityKeyringDelete` | `—` | `"keyring-delete"` | — |
| `SentinelCapabilityDeny` | `—` | `"deny"` | — |
| `SentinelCapabilityRead` | `—` | `"sentinel-read"` | — |
| `SentinelCapabilitySubmit` | `—` | `"sentinel-submit"` | — |
| `SentinelCapabilityDelete` | `—` | `"sentinel-delete"` | — |
| `PolicyParseStrict` | `—` | `true` | — |
| `PolicyParseLenient` | `—` | `false` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `validNamespace` | `—` | `regexp.MustCompile("^[a-zA-Z0-9-*]{1,128}$")` | — |
| `validNodePool` | `—` | `regexp.MustCompile("^[a-zA-Z0-9-_*]{1,128}$")` | — |
| `validVolume` | `—` | `regexp.MustCompile("^[a-zA-Z0-9-*]{1,128}$")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `IsEmpty` | `p *Policy` | `` | `bool` | [L184](file:///d:/claude/nomad/acl/policy.go#L184) |
| `removeExtraKey` | `p *Policy` | `key string` | `` | [L198](file:///d:/claude/nomad/acl/policy.go#L198) |
| `isPolicyValid` | - | `policy string` | `bool` | [L262](file:///d:/claude/nomad/acl/policy.go#L262) |
| `isValid` | `p *PluginPolicy` | `` | `bool` | [L271](file:///d:/claude/nomad/acl/policy.go#L271) |
| `isNamespaceCapabilityValid` | - | `cap string` | `bool` | [L281](file:///d:/claude/nomad/acl/policy.go#L281) |
| `isPathCapabilityValid` | - | `cap string` | `bool` | [L314](file:///d:/claude/nomad/acl/policy.go#L314) |
| `expandNamespacePolicy` | - | `policy string` | `[]string` | [L326](file:///d:/claude/nomad/acl/policy.go#L326) |
| `expandNamespaceCapabilities` | - | `ns *NamespacePolicy` | `` | [L379](file:///d:/claude/nomad/acl/policy.go#L379) |
| `isNodePoolCapabilityValid` | - | `cap string` | `bool` | [L403](file:///d:/claude/nomad/acl/policy.go#L403) |
| `isOperatorCapabilityValid` | - | `cap string` | `bool` | [L414](file:///d:/claude/nomad/acl/policy.go#L414) |
| `isSentinelCapabilityValid` | - | `cap string` | `bool` | [L426](file:///d:/claude/nomad/acl/policy.go#L426) |
| `expandNodePoolPolicy` | - | `policy string` | `[]string` | [L436](file:///d:/claude/nomad/acl/policy.go#L436) |
| `expandOperatorPolicy` | - | `policy string` | `[]string` | [L455](file:///d:/claude/nomad/acl/policy.go#L455) |
| `expandSentinelPolicy` | - | `policy string` | `[]string` | [L473](file:///d:/claude/nomad/acl/policy.go#L473) |
| `isHostVolumeCapabilityValid` | - | `cap string` | `bool` | [L486](file:///d:/claude/nomad/acl/policy.go#L486) |
| `expandHostVolumePolicy` | - | `policy string` | `[]string` | [L495](file:///d:/claude/nomad/acl/policy.go#L495) |
| `expandVariablesCapabilities` | - | `caps []string` | `[]string` | [L508](file:///d:/claude/nomad/acl/policy.go#L508) |
| `Parse` | - | `rules string, strict bool` | `*Policy, error` | [L549](file:///d:/claude/nomad/acl/policy.go#L549) |
| `hclDecode` | - | `p *Policy, rules string` | `err error` | [L733](file:///d:/claude/nomad/acl/policy.go#L733) |

## 5. 核心方法详解

### Parse()

**签名**：`func Parse(rules string, strict bool) *Policy, error`

**位置**：[L549](file:///d:/claude/nomad/acl/policy.go#L549)

**中文说明**：解析对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `rules` | `string` | 字符串 |
| `strict` | `bool` | 布尔值 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*Policy` | — |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `regexp` | 标准库 |
| `slices` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/hcl` | 第三方库 |
| `github.com/hashicorp/hcl/hcl/ast` | 第三方库 |

## 7. 设计模式与技术特点

- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析
- **对象池模式**：实现对象池，复用资源减少分配开销

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [policy_test.go](file:///d:/claude/nomad/acl/policy_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/acl/acl.go) | 同目录源文件 |
| [virtual.go](file:///d:/claude/nomad/acl/virtual.go) | 同目录源文件 |

