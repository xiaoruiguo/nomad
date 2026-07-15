# scaling.go 代码说明文档

> 文件路径：[api/scaling.go](file:///d:/claude/nomad/api/scaling.go)
> 总行数：128 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `scaling.go` 实现相关 API 端点的客户端方法。

## 2. 类型定义

### Scaling

**定义位置**：[L12](file:///d:/claude/nomad/api/scaling.go#L12)

**中文说明**：Scaling 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Scaling struct {
	client *Client
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `client` | `*Client` | 关联的 Client 实例 |

**关联方法**（2 个）：`ListPolicies`, `GetPolicy`

### ScalingRequest

**定义位置**：[L53](file:///d:/claude/nomad/api/scaling.go#L53)

**中文说明**：ScalingRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type ScalingRequest struct {
	Count *int64
	Target map[string]string
	Message string
	Error bool
	Meta map[string]interface{}
	WriteRequest WriteRequest
	PolicyOverride bool
	JobModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Count` | `*int64` | 计数 |
| `Target` | `map[string]string` | 映射表 |
| `Message` | `string` | 消息 |
| `Error` | `bool` | 错误信息 |
| `Meta` | `map[string]interface{}` | 元数据 |
| `WriteRequest` | `WriteRequest` | — |
| `PolicyOverride` | `bool` | 布尔值 |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |

### ScalingPolicy

**定义位置**：[L70](file:///d:/claude/nomad/api/scaling.go#L70)

**中文说明**：ScalingPolicy 与策略（Policy）相关，定义权限规则。

**类型**：struct

```go
type ScalingPolicy struct {
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
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Min` | `*int64 `hcl:"min,optional"`` | 最小值 |
| `Max` | `*int64 `hcl:"max,optional"`` | 最大值 |
| `Policy` | `map[string]interface{} `hcl:"policy,block"`` | 策略 |
| `Enabled` | `*bool `hcl:"enabled,optional"`` | 是否启用 |
| `Type` | `string `hcl:"type,optional"`` | 类型 |
| `ID` | `string` | 唯一标识符 |
| `Namespace` | `string` | 命名空间 |
| `Target` | `map[string]string` | 映射表 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（1 个）：`Canonicalize`

### ScalingPolicyListStub

**定义位置**：[L90](file:///d:/claude/nomad/api/scaling.go#L90)

**中文说明**：ScalingPolicyListStub 是一个桩结构体，用于列表查询时返回精简数据。

**类型**：struct

```go
type ScalingPolicyListStub struct {
	ID string
	Enabled bool
	Type string
	Target map[string]string
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `Enabled` | `bool` | 是否启用 |
| `Type` | `string` | 类型 |
| `Target` | `map[string]string` | 映射表 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

### JobScaleStatusResponse

**定义位置**：[L100](file:///d:/claude/nomad/api/scaling.go#L100)

**中文说明**：JobScaleStatusResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type JobScaleStatusResponse struct {
	JobID string
	Namespace string
	JobCreateIndex uint64
	JobModifyIndex uint64
	JobStopped bool
	TaskGroups map[string]TaskGroupScaleStatus
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `JobID` | `string` | 字符串 |
| `Namespace` | `string` | 命名空间 |
| `JobCreateIndex` | `uint64` | 索引值（uint64） |
| `JobModifyIndex` | `uint64` | 索引值（uint64） |
| `JobStopped` | `bool` | 布尔值 |
| `TaskGroups` | `map[string]TaskGroupScaleStatus` | 映射表 |

### TaskGroupScaleStatus

**定义位置**：[L109](file:///d:/claude/nomad/api/scaling.go#L109)

**中文说明**：TaskGroupScaleStatus 是一个状态结构体，描述对象或操作的当前状态。

**类型**：struct

```go
type TaskGroupScaleStatus struct {
	Desired int
	Placed int
	Running int
	Healthy int
	Unhealthy int
	Events []ScalingEvent
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Desired` | `int` | — |
| `Placed` | `int` | — |
| `Running` | `int` | 是否运行中 |
| `Healthy` | `int` | 是否健康 |
| `Unhealthy` | `int` | — |
| `Events` | `[]ScalingEvent` | 列表 |

### ScalingEvent

**定义位置**：[L118](file:///d:/claude/nomad/api/scaling.go#L118)

**中文说明**：ScalingEvent 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type ScalingEvent struct {
	Count *int64
	PreviousCount int64
	Error bool
	Message string
	Meta map[string]interface{}
	EvalID *string
	Time uint64
	CreateIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Count` | `*int64` | 计数 |
| `PreviousCount` | `int64` | — |
| `Error` | `bool` | 错误信息 |
| `Message` | `string` | 消息 |
| `Meta` | `map[string]interface{}` | 元数据 |
| `EvalID` | `*string` | 字符串 |
| `Time` | `uint64` | 时间戳 |
| `CreateIndex` | `uint64` | 索引值（uint64） |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `ScalingPolicyTypeHorizontal` | `—` | `"horizontal"` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Scaling` | `c *Client` | `` | `*Scaling` | [L17](file:///d:/claude/nomad/api/scaling.go#L17) |
| `ListPolicies` | `s *Scaling` | `q *QueryOptions` | `[]*ScalingPolicyListStub, *QueryMeta, error` | [L21](file:///d:/claude/nomad/api/scaling.go#L21) |
| `GetPolicy` | `s *Scaling` | `id string, q *QueryOptions` | `*ScalingPolicy, *QueryMeta, error` | [L30](file:///d:/claude/nomad/api/scaling.go#L30) |
| `Canonicalize` | `p *ScalingPolicy` | `taskGroupCount int` | `` | [L39](file:///d:/claude/nomad/api/scaling.go#L39) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

该文件无导入包。

## 7. 设计模式与技术特点

- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [scaling_test.go](file:///d:/claude/nomad/api/scaling_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/api/acl.go) | 同目录源文件 |
| [agent.go](file:///d:/claude/nomad/api/agent.go) | 同目录源文件 |
| [allocations.go](file:///d:/claude/nomad/api/allocations.go) | 同目录源文件 |
| [allocations_exec.go](file:///d:/claude/nomad/api/allocations_exec.go) | 同目录源文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | 同目录源文件 |

