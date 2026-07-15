# sentinel.go 代码说明文档

> 文件路径：[sentinel.go](file:///d:/claude/nomad/api/sentinel.go)
> 总行数：92 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **Sentinel 策略 API 客户端**，提供 Sentinel 策略管理的客户端方法。

## 2. 类型定义

### SentinelPolicies

**定义位置**：[L11](file:///d:/claude/nomad/api/sentinel.go#L11)

**类型**：struct

```go
	client *Client
```

**关联方法**（4 个）：`List`, `Upsert`, `Delete`, `Info`

### SentinelPolicy

**定义位置**：[L67](file:///d:/claude/nomad/api/sentinel.go#L67)

**类型**：struct

```go
	Name string
	Description string
	Scope string
	EnforcementLevel string
	Policy string
	CreateIndex uint64
	ModifyIndex uint64
```

### SentinelPolicyListStub

**定义位置**：[L77](file:///d:/claude/nomad/api/sentinel.go#L77)

**类型**：struct

```go
	Name string
	Description string
	Scope string
	EnforcementLevel string
	CreateIndex uint64
	ModifyIndex uint64
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `SentinelScopeSubmitJob` | `"submit-job"` |
| `SentinelScopeSubmitHostVolume` | `"submit-host-volume"` |
| `SentinelScopeSubmitCSIVolume` | `"submit-csi-volume"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `SentinelPolicies` | `c *Client` | - | `*SentinelPolicies` | [L16](file:///d:/claude/nomad/api/sentinel.go#L16) |
| `List` | `a *SentinelPolicies` | `q *QueryOptions` | `[]*SentinelPolicyListStub, *QueryMeta, error` | [L21](file:///d:/claude/nomad/api/sentinel.go#L21) |
| `Upsert` | `a *SentinelPolicies` | `policy *SentinelPolicy, q *WriteOptions` | `*WriteMeta, error` | [L31](file:///d:/claude/nomad/api/sentinel.go#L31) |
| `Delete` | `a *SentinelPolicies` | `policyName string, q *WriteOptions` | `*WriteMeta, error` | [L43](file:///d:/claude/nomad/api/sentinel.go#L43) |
| `Info` | `a *SentinelPolicies` | `policyName string, q *QueryOptions` | `*SentinelPolicy, *QueryMeta, error` | [L55](file:///d:/claude/nomad/api/sentinel.go#L55) |

## 5. 核心方法详解

### List()

**签名**：`func (a *SentinelPolicies) List(q *QueryOptions) []*SentinelPolicyListStub, *QueryMeta, error`

**位置**：[L21](file:///d:/claude/nomad/api/sentinel.go#L21)

### Delete()

**签名**：`func (a *SentinelPolicies) Delete(policyName string, q *WriteOptions) *WriteMeta, error`

**位置**：[L43](file:///d:/claude/nomad/api/sentinel.go#L43)

### Info()

**签名**：`func (a *SentinelPolicies) Info(policyName string, q *QueryOptions) *SentinelPolicy, *QueryMeta, error`

**位置**：[L55](file:///d:/claude/nomad/api/sentinel.go#L55)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [sentinel_test.go](file:///d:/claude/nomad/api/sentinel_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

