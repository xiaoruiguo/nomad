# catalog_testing.go 代码说明文档

> 文件路径：[command/agent/consul/catalog_testing.go](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go)
> 总行数：424 行
> 所属包：`consul`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Agent 命令子包**（`command/agent`），实现 `nomad agent` 命令，启动 Nomad Agent 进程（Server 和/或 Client 模式），加载配置、初始化日志和信号处理。

## 2. 类型定义

### MockClient

**定义位置**：[L17](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L17)

**类型**：struct

```go
	MockCatalog
	MockNamespaces
```

### MockNamespaces

**定义位置**：[L26](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L26)

**类型**：struct

```go
	namespaces []*api.Namespace
```

**关联方法**（1 个）：`List`

### MockCatalog

**定义位置**：[L61](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L61)

**类型**：struct

```go
	logger hclog.Logger
```

**关联方法**（2 个）：`Datacenters`, `Service`

### MockAgent

**定义位置**：[L83](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L83)

**类型**：struct

```go
	services map[string]map[string]*api.AgentServiceRegistration
	checks map[string]map[string]*api.AgentCheckRegistration
	hits int
	ent bool
	namespaces bool
	mu sync.Mutex
	checkTTLs map[string]map[string]int
	checkStatus string
```

**关联方法**（13 个）：`getHits`, `SetStatus`, `Self`, `ServicesWithFilterOpts`, `ChecksWithFilterOpts`, `CheckRegs`, `CheckRegisterOpts`, `checkRegister`, `CheckDeregisterOpts`, `ServiceRegisterOpts`, `ServiceDeregisterOpts`, `UpdateTTLOpts`, `lookupService`

### Features

**定义位置**：[L112](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L112)

**类型**：struct

```go
	Enterprise bool
	Namespaces bool
```

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `_` | `(*MockClient)(nil)` |
| `_` | `(*MockClient)(nil)` |
| `_` | `(*MockNamespaces)(nil)` |
| `_` | `(*MockCatalog)(nil)` |
| `_` | `(*MockAgent)(nil)` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewMockNamespaces` | - | `namespaces []string` | `*MockNamespaces` | [L34](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L34) |
| `List` | `m *MockNamespaces` | `*api.QueryOptions` | `[]*api.Namespace, *api.QueryMeta, error` | [L54](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L54) |
| `NewMockCatalog` | - | `l hclog.Logger` | `*MockCatalog` | [L67](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L67) |
| `Datacenters` | `m *MockCatalog` | - | `[]string, error` | [L71](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L71) |
| `Service` | `m *MockCatalog` | `service string, tag string, q *api.QueryOptions` | `[]*api.CatalogService, *api.QueryMeta, error` | [L77](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L77) |
| `NewMockAgent` | - | `f Features` | `*MockAgent` | [L118](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L118) |
| `getHits` | `c *MockAgent` | - | `int` | [L131](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L131) |
| `SetStatus` | `c *MockAgent` | `s string` | `string` | [L138](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L138) |
| `Self` | `c *MockAgent` | - | `map[string]map[string]interface{}, error` | [L146](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L146) |
| `getNamespace` | - | `q *api.QueryOptions` | `string` | [L207](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L207) |
| `ServicesWithFilterOpts` | `c *MockAgent` | `_ string, q *api.QueryOptions` | `map[string]*api.AgentService, error` | [L215](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L215) |
| `ChecksWithFilterOpts` | `c *MockAgent` | `_ string, q *api.QueryOptions` | `map[string]*api.AgentCheck, error` | [L239](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L239) |
| `CheckRegs` | `c *MockAgent` | - | `[]*api.AgentCheckRegistration` | [L262](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L262) |
| `CheckRegisterOpts` | `c *MockAgent` | `check *api.AgentCheckRegistration, _ *api.QueryOptions` | `error` | [L276](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L276) |
| `checkRegister` | `c *MockAgent` | `check *api.AgentCheckRegistration` | `error` | [L283](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L283) |
| `CheckDeregisterOpts` | `c *MockAgent` | `checkID string, q *api.QueryOptions` | `error` | [L321](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L321) |
| `ServiceRegisterOpts` | `c *MockAgent` | `service *api.AgentServiceRegistration, _ api.ServiceRegisterOpts` | `error` | [L334](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L334) |
| `ServiceDeregisterOpts` | `c *MockAgent` | `serviceID string, q *api.QueryOptions` | `error` | [L367](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L367) |
| `UpdateTTLOpts` | `c *MockAgent` | `id string, output string, status string, q *api.QueryOptions` | `error` | [L386](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L386) |
| `lookupService` | `c *MockAgent` | `namespace string, name string` | `[]*api.AgentServiceRegistration` | [L412](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L412) |

## 5. 核心方法详解

### NewMockNamespaces()

**签名**：`func NewMockNamespaces(namespaces []string) *MockNamespaces`

**位置**：[L34](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L34)

### List()

**签名**：`func (m *MockNamespaces) List(*api.QueryOptions) []*api.Namespace, *api.QueryMeta, error`

**位置**：[L54](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L54)

### NewMockCatalog()

**签名**：`func NewMockCatalog(l hclog.Logger) *MockCatalog`

**位置**：[L67](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L67)

### NewMockAgent()

**签名**：`func NewMockAgent(f Features) *MockAgent`

**位置**：[L118](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L118)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `slices` | 标准库 |
| `sort` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/consul/api` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **测试工具**：提供测试辅助工具，便于编写单元测试和集成测试

## 8. 相关文件

| 文件 | 关系 |
|------|------|

