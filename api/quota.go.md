# quota.go 代码说明文档

> 文件路径：[quota.go](file:///d:/claude/nomad/api/quota.go)
> 总行数：235 行
> 所属包：`api`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件实现 **配额（Quota）API 客户端**，提供资源配额管理的客户端方法。

## 2. 类型定义

### Quotas

**定义位置**：[L12](file:///d:/claude/nomad/api/quota.go#L12)

**类型**：struct

```go
	client *Client
```

**关联方法**（8 个）：`List`, `PrefixList`, `ListUsage`, `PrefixListUsage`, `Info`, `Usage`, `Register`, `Delete`

### QuotaSpec

**定义位置**：[L104](file:///d:/claude/nomad/api/quota.go#L104)

**类型**：struct

```go
	Name string
	Description string
	Limits []*QuotaLimit
	CreateIndex uint64
	ModifyIndex uint64
```

### QuotaLimit

**定义位置**：[L122](file:///d:/claude/nomad/api/quota.go#L122)

**类型**：struct

```go
	Region string
	RegionLimit *QuotaResources
	VariablesLimit *int `mapstructure:"variables_limit" hcl:"variables_limit,optional"`
	Hash []byte
```

### QuotaResources

**定义位置**：[L144](file:///d:/claude/nomad/api/quota.go#L144)

**类型**：struct

```go
	CPU *int `hcl:"cpu,optional"`
	Cores *int `hcl:"cores,optional"`
	MemoryMB *int `mapstructure:"memory" hcl:"memory,optional"`
	MemoryMaxMB *int `mapstructure:"memory_max" hcl:"memory_max,optional"`
	Devices []*RequestedDevice `hcl:"device,block"`
	NUMA *NUMAResource `hcl:"numa,block"`
	SecretsMB *int `mapstructure:"secrets" hcl:"secrets,optional"`
	Storage *QuotaStorageResources `mapstructure:"storage" hcl:"storage,block"`
	NodePools []*NodePoolLimit `hcl:"node_pool,block"`
```

### NodePoolLimit

**定义位置**：[L157](file:///d:/claude/nomad/api/quota.go#L157)

**类型**：struct

```go
	NodePool string `hcl:",label"`
	CPU *int `hcl:"cpu,optional"`
	Cores *int `hcl:"cores,optional"`
	MemoryMB *int `mapstructure:"memory" hcl:"memory,optional"`
	MemoryMaxMB *int `mapstructure:"memory_max" hcl:"memory_max,optional"`
	Devices []*RequestedDevice `hcl:"device,block"`
	NUMA *NUMAResource `hcl:"numa,block"`
	SecretsMB *int `mapstructure:"secrets" hcl:"secrets,optional"`
	Storage *QuotaStorageResources `mapstructure:"storage" hcl:"storage,block"`
```

### QuotaStorageResources

**定义位置**：[L169](file:///d:/claude/nomad/api/quota.go#L169)

**类型**：struct

```go
	VariablesMB int `hcl:"variables"`
	HostVolumesMB int `hcl:"host_volumes"`
```

### QuotaUsage

**定义位置**：[L182](file:///d:/claude/nomad/api/quota.go#L182)

**类型**：struct

```go
	Name string
	Used map[string]*QuotaLimit
	CreateIndex uint64
	ModifyIndex uint64
```

### QuotaSpecIndexSort

**定义位置**：[L191](file:///d:/claude/nomad/api/quota.go#L191)

**类型定义**：`[]*QuotaSpec`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### QuotaUsageIndexSort

**定义位置**：[L207](file:///d:/claude/nomad/api/quota.go#L207)

**类型定义**：`[]*QuotaUsage`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

### QuotaLimitSort

**定义位置**：[L222](file:///d:/claude/nomad/api/quota.go#L222)

**类型定义**：`[]*QuotaLimit`

**关联方法**（3 个）：`Len`, `Less`, `Swap`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Quotas` | `c *Client` | - | `*Quotas` | [L17](file:///d:/claude/nomad/api/quota.go#L17) |
| `List` | `q *Quotas` | `qo *QueryOptions` | `[]*QuotaSpec, *QueryMeta, error` | [L22](file:///d:/claude/nomad/api/quota.go#L22) |
| `PrefixList` | `q *Quotas` | `prefix string, qo *QueryOptions` | `[]*QuotaSpec, *QueryMeta, error` | [L33](file:///d:/claude/nomad/api/quota.go#L33) |
| `ListUsage` | `q *Quotas` | `qo *QueryOptions` | `[]*QuotaUsage, *QueryMeta, error` | [L44](file:///d:/claude/nomad/api/quota.go#L44) |
| `PrefixListUsage` | `q *Quotas` | `prefix string, qo *QueryOptions` | `[]*QuotaUsage, *QueryMeta, error` | [L55](file:///d:/claude/nomad/api/quota.go#L55) |
| `Info` | `q *Quotas` | `name string, qo *QueryOptions` | `*QuotaSpec, *QueryMeta, error` | [L66](file:///d:/claude/nomad/api/quota.go#L66) |
| `Usage` | `q *Quotas` | `name string, qo *QueryOptions` | `*QuotaUsage, *QueryMeta, error` | [L76](file:///d:/claude/nomad/api/quota.go#L76) |
| `Register` | `q *Quotas` | `spec *QuotaSpec, qo *WriteOptions` | `*WriteMeta, error` | [L86](file:///d:/claude/nomad/api/quota.go#L86) |
| `Delete` | `q *Quotas` | `quota string, qo *WriteOptions` | `*WriteMeta, error` | [L95](file:///d:/claude/nomad/api/quota.go#L95) |
| `Len` | `q *QuotaSpecIndexSort` | - | `int` | [L193](file:///d:/claude/nomad/api/quota.go#L193) |
| `Less` | `q *QuotaSpecIndexSort` | `i int, j int` | `bool` | [L197](file:///d:/claude/nomad/api/quota.go#L197) |
| `Swap` | `q *QuotaSpecIndexSort` | `i int, j int` | - | [L201](file:///d:/claude/nomad/api/quota.go#L201) |
| `Len` | `q *QuotaUsageIndexSort` | - | `int` | [L209](file:///d:/claude/nomad/api/quota.go#L209) |
| `Less` | `q *QuotaUsageIndexSort` | `i int, j int` | `bool` | [L213](file:///d:/claude/nomad/api/quota.go#L213) |
| `Swap` | `q *QuotaUsageIndexSort` | `i int, j int` | - | [L217](file:///d:/claude/nomad/api/quota.go#L217) |
| `Len` | `q *QuotaLimitSort` | - | `int` | [L224](file:///d:/claude/nomad/api/quota.go#L224) |
| `Less` | `q *QuotaLimitSort` | `i int, j int` | `bool` | [L228](file:///d:/claude/nomad/api/quota.go#L228) |
| `Swap` | `q *QuotaLimitSort` | `i int, j int` | - | [L232](file:///d:/claude/nomad/api/quota.go#L232) |

## 5. 核心方法详解

### List()

**签名**：`func (q *Quotas) List(qo *QueryOptions) []*QuotaSpec, *QueryMeta, error`

**位置**：[L22](file:///d:/claude/nomad/api/quota.go#L22)

### ListUsage()

**签名**：`func (q *Quotas) ListUsage(qo *QueryOptions) []*QuotaUsage, *QueryMeta, error`

**位置**：[L44](file:///d:/claude/nomad/api/quota.go#L44)

### Info()

**签名**：`func (q *Quotas) Info(name string, qo *QueryOptions) *QuotaSpec, *QueryMeta, error`

**位置**：[L66](file:///d:/claude/nomad/api/quota.go#L66)

### Register()

**签名**：`func (q *Quotas) Register(spec *QuotaSpec, qo *WriteOptions) *WriteMeta, error`

**位置**：[L86](file:///d:/claude/nomad/api/quota.go#L86)

### Delete()

**签名**：`func (q *Quotas) Delete(quota string, qo *WriteOptions) *WriteMeta, error`

**位置**：[L95](file:///d:/claude/nomad/api/quota.go#L95)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `sort` | 标准库 |

## 7. 设计模式与技术特点

- **子客户端模式**：结构体嵌入 `client *Client` 字段，通过主 `Client` 获取子客户端实例，所有方法委托给底层 HTTP 客户端
- **查询选项模式**：方法接受 `*QueryOptions` 参数，支持区域指定、命名空间、阻塞查询（WaitIndex/WaitTime）、分页（PerPage/NextToken）、过滤（Filter）等高级查询功能
- **写入选项模式**：方法接受 `*WriteOptions` 参数，支持区域指定和命名空间限定
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持 JSON 序列化和 HCL 解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [quota_test.go](file:///d:/claude/nomad/api/quota_test.go) | 对应测试文件 |
| [api.go](file:///d:/claude/nomad/api/api.go) | API 客户端核心，定义 `Client` 和请求/响应类型 |

