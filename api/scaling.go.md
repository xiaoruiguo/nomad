# scaling.go 代码说明文档

> 文件路径：[scaling.go](file:///d:/claude/nomad/api/scaling.go)
> 总行数：128 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **扩缩容（Scaling）API 客户端**，提供扩缩容策略查询和操作的客户端方法。

## 2. 类型定义

### Scaling

**定义位置**：[L12](file:///d:/claude/nomad/api/scaling.go#L12)

**类型**：struct

```go
	client *Client
```

**关联方法**（2 个）：`ListPolicies`, `GetPolicy`

### ScalingRequest

**定义位置**：[L53](file:///d:/claude/nomad/api/scaling.go#L53)

**类型**：struct

```go
	Count *int64
	Target map[string]string
	Message string
	Error bool
	Meta map[string]interface{}
	WriteRequest
	PolicyOverride bool
	JobModifyIndex uint64
```

### ScalingPolicy

**定义位置**：[L70](file:///d:/claude/nomad/api/scaling.go#L70)

**类型**：struct

```go
	Min *int64 `hcl:"min,optional"`
	Max *int64 `hcl:"max,optional"`
	Policy map[string]interface{} `hcl:"policy,block"`
	Enabled *bool `hcl:"enabled,optional"`
	Type string `hcl:"type,optional"`
	ID string
	Namespace string
	Target map[string]string
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（1 个）：`Canonicalize`

### ScalingPolicyListStub

**定义位置**：[L90](file:///d:/claude/nomad/api/scaling.go#L90)

**类型**：struct

```go
	ID string
	Enabled bool
	Type string
	Target map[string]string
	CreateIndex uint64
	ModifyIndex uint64
```

### JobScaleStatusResponse

**定义位置**：[L100](file:///d:/claude/nomad/api/scaling.go#L100)

**类型**：struct

```go
	JobID string
	Namespace string
	JobCreateIndex uint64
	JobModifyIndex uint64
	JobStopped bool
	TaskGroups map[string]TaskGroupScaleStatus
```

### TaskGroupScaleStatus

**定义位置**：[L109](file:///d:/claude/nomad/api/scaling.go#L109)

**类型**：struct

```go
	Desired int
	Placed int
	Running int
	Healthy int
	Unhealthy int
	Events []ScalingEvent
```

### ScalingEvent

**定义位置**：[L118](file:///d:/claude/nomad/api/scaling.go#L118)

**类型**：struct

```go
	Count *int64
	PreviousCount int64
	Error bool
	Message string
	Meta map[string]interface{}
	EvalID *string
	Time uint64
	CreateIndex uint64
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `ScalingPolicyTypeHorizontal` | `"horizontal"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Scaling` | `c *Client` | - | `*Scaling` | [L17](file:///d:/claude/nomad/api/scaling.go#L17) |
| `ListPolicies` | `s *Scaling` | `q *QueryOptions` | `[]*ScalingPolicyListStub, *QueryMeta, error` | [L21](file:///d:/claude/nomad/api/scaling.go#L21) |
| `GetPolicy` | `s *Scaling` | `id string, q *QueryOptions` | `*ScalingPolicy, *QueryMeta, error` | [L30](file:///d:/claude/nomad/api/scaling.go#L30) |
| `Canonicalize` | `p *ScalingPolicy` | `taskGroupCount int` | - | [L39](file:///d:/claude/nomad/api/scaling.go#L39) |

## 5. 核心方法详解

### ListPolicies()

**签名**：`func (s *Scaling) ListPolicies(q *QueryOptions) []*ScalingPolicyListStub, *QueryMeta, error`

**位置**：[L21](file:///d:/claude/nomad/api/scaling.go#L21)

### GetPolicy()

**签名**：`func (s *Scaling) GetPolicy(id string, q *QueryOptions) *ScalingPolicy, *QueryMeta, error`

**位置**：[L30](file:///d:/claude/nomad/api/scaling.go#L30)

## 6. 依赖关系

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [scaling_test.go](file:///d:/claude/nomad/api/scaling_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

