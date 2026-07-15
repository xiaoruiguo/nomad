# sentinel.go 代码说明文档

> 文件路径：[api/sentinel.go](file:///d:/claude/nomad/api/sentinel.go)
> 总行数：92 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `sentinel.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### SentinelPolicies

**定义位置**：[L11](file:///d:/claude/nomad/api/sentinel.go#L11)

**中文说明**：SentinelPolicies 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type SentinelPolicies struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（4 个）：`List`, `Upsert`, `Delete`, `Info`

### SentinelPolicy

**定义位置**：[L67](file:///d:/claude/nomad/api/sentinel.go#L67)

**中文说明**：SentinelPolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type SentinelPolicy struct {
	Name string
	Description string
	Scope string
	EnforcementLevel string
	Policy string
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Description` | `string` | 描述信息 |
| `Scope` | `string` | 字符串 |
| `EnforcementLevel` | `string` | 字符串 |
| `Policy` | `string` | 策略 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### SentinelPolicyListStub

**定义位置**：[L77](file:///d:/claude/nomad/api/sentinel.go#L77)

**中文说明**：SentinelPolicyListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type SentinelPolicyListStub struct {
	Name string
	Description string
	Scope string
	EnforcementLevel string
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Name` | `string` | 名称 |
| `Description` | `string` | 描述信息 |
| `Scope` | `string` | 字符串 |
| `EnforcementLevel` | `string` | 字符串 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `SentinelScopeSubmitJob` | `—` | `"submit-job"` | — |
| `SentinelScopeSubmitHostVolume` | `—` | `"submit-host-volume"` | — |
| `SentinelScopeSubmitCSIVolume` | `—` | `"submit-csi-volume"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `SentinelPolicies` | `c *Client` | `` | `*SentinelPolicies` | [L16](file:///d:/claude/nomad/api/sentinel.go#L16) |
| `List` | `a *SentinelPolicies` | `q *QueryOptions` | `[]*SentinelPolicyListStub, *QueryMeta, error` | [L21](file:///d:/claude/nomad/api/sentinel.go#L21) |
| `Upsert` | `a *SentinelPolicies` | `policy *SentinelPolicy, q *WriteOptions` | `*WriteMeta, error` | [L31](file:///d:/claude/nomad/api/sentinel.go#L31) |
| `Delete` | `a *SentinelPolicies` | `policyName string, q *WriteOptions` | `*WriteMeta, error` | [L43](file:///d:/claude/nomad/api/sentinel.go#L43) |
| `Info` | `a *SentinelPolicies` | `policyName string, q *QueryOptions` | `*SentinelPolicy, *QueryMeta, error` | [L55](file:///d:/claude/nomad/api/sentinel.go#L55) |

## 5. 核心方法详解

### List()

**签名**：`func (a *SentinelPolicies) List(q *QueryOptions) []*SentinelPolicyListStub, *QueryMeta, error`

**位置**：[L21](file:///d:/claude/nomad/api/sentinel.go#L21)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*SentinelPolicyListStub` | 列表 |
| `*QueryMeta` | — |
| `error` | 错误信息 |

### Delete()

**签名**：`func (a *SentinelPolicies) Delete(policyName string, q *WriteOptions) *WriteMeta, error`

**位置**：[L43](file:///d:/claude/nomad/api/sentinel.go#L43)

**中文说明**：删除 用于 删除 策略

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `policyName` | `string` | 字符串 |
| `q` | `*WriteOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*WriteMeta` | — |
| `error` | 错误信息 |

### Info()

**签名**：`func (a *SentinelPolicies) Info(policyName string, q *QueryOptions) *SentinelPolicy, *QueryMeta, error`

**位置**：[L55](file:///d:/claude/nomad/api/sentinel.go#L55)

**中文说明**：返回对象的信息。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `policyName` | `string` | 字符串 |
| `q` | `*QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*SentinelPolicy` | — |
| `*QueryMeta` | — |
| `error` | 错误信息 |

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [sentinel_test.go](file:///d:/claude/nomad/api/sentinel_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

