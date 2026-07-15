# catalog_testing.go 代码说明文档

> 文件路径：[command/agent/consul/catalog_testing.go](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go)
> 总行数：424 行
> 所属包：`consul`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Agent 命令子包**（`command/agent`），实现 `nomad agent` 命令，启动 Nomad Server 或 Client 进程。包含配置加载、HTTP/RPC 服务启动、信号处理和日志初始化等逻辑，是 Nomad 节点的启动入口。

## 2. 类型定义

### MockClient

**定义位置**：[L17](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L17)

**中文说明**：MockClient 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type MockClient struct {
	MockCatalog MockCatalog
	MockNamespaces MockNamespaces
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `MockCatalog` | `MockCatalog` | — |
| `MockNamespaces` | `MockNamespaces` | — |

### MockNamespaces

**定义位置**：[L26](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L26)

**中文说明**：MockNamespaces 与命名空间（Namespace）相关，提供资源隔离。

**类型**：struct

```go
type MockNamespaces struct {
	namespaces []*api.Namespace
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `namespaces` | `[]*api.Namespace` | 列表 |

**关联方法**（1 个）：`List`

### MockCatalog

**定义位置**：[L61](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L61)

**中文说明**：MockCatalog 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type MockCatalog struct {
	logger hclog.Logger
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `hclog.Logger` | 日志记录器 |

**关联方法**（2 个）：`Datacenters`, `Service`

### MockAgent

**定义位置**：[L83](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L83)

**中文说明**：MockAgent 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type MockAgent struct {
	services map[string]map[string]*api.AgentServiceRegistration
	checks map[string]map[string]*api.AgentCheckRegistration
	hits int
	ent bool
	namespaces bool
	mu sync.Mutex
	checkTTLs map[string]map[string]int
	checkStatus string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `services` | `map[string]map[string]*api.AgentServiceRegistration` | 映射表 |
| `checks` | `map[string]map[string]*api.AgentCheckRegistration` | 映射表 |
| `hits` | `int` | — |
| `ent` | `bool` | 布尔值 |
| `namespaces` | `bool` | 布尔值 |
| `mu` | `sync.Mutex` | 互斥锁，保护并发访问 |
| `checkTTLs` | `map[string]map[string]int` | 映射表 |
| `checkStatus` | `string` | 什么 检查 状态 到 返回 从 检查() |

**关联方法**（13 个）：`getHits`, `SetStatus`, `Self`, `ServicesWithFilterOpts`, `ChecksWithFilterOpts`, `CheckRegs`, `CheckRegisterOpts`, `checkRegister`, `CheckDeregisterOpts`, `ServiceRegisterOpts`, `ServiceDeregisterOpts`, `UpdateTTLOpts`, `lookupService`

### Features

**定义位置**：[L112](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L112)

**中文说明**：Features 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type Features struct {
	Enterprise bool
	Namespaces bool
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Enterprise` | `bool` | 布尔值 |
| `Namespaces` | `bool` | 布尔值 |

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `_` | `NamespaceAPI` | `(*MockClient)(nil)` | — |
| `_` | `CatalogAPI` | `(*MockClient)(nil)` | — |
| `_` | `NamespaceAPI` | `(*MockNamespaces)(nil)` | — |
| `_` | `CatalogAPI` | `(*MockCatalog)(nil)` | — |
| `_` | `AgentAPI` | `(*MockAgent)(nil)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewMockNamespaces` | - | `namespaces []string` | `*MockNamespaces` | [L34](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L34) |
| `List` | `m *MockNamespaces` | `*api.QueryOptions` | `[]*api.Namespace, *api.QueryMeta, error` | [L54](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L54) |
| `NewMockCatalog` | - | `l hclog.Logger` | `*MockCatalog` | [L67](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L67) |
| `Datacenters` | `m *MockCatalog` | `` | `[]string, error` | [L71](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L71) |
| `Service` | `m *MockCatalog` | `service string, tag string, q *api.QueryOptions` | `[]*api.CatalogService, *api.QueryMeta, error` | [L77](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L77) |
| `NewMockAgent` | - | `f Features` | `*MockAgent` | [L118](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L118) |
| `getHits` | `c *MockAgent` | `` | `int` | [L131](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L131) |
| `SetStatus` | `c *MockAgent` | `s string` | `string` | [L138](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L138) |
| `Self` | `c *MockAgent` | `` | `map[string]map[string]interface{}, error` | [L146](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L146) |
| `getNamespace` | - | `q *api.QueryOptions` | `string` | [L207](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L207) |
| `ServicesWithFilterOpts` | `c *MockAgent` | `_ string, q *api.QueryOptions` | `map[string]*api.AgentService, error` | [L215](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L215) |
| `ChecksWithFilterOpts` | `c *MockAgent` | `_ string, q *api.QueryOptions` | `map[string]*api.AgentCheck, error` | [L239](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L239) |
| `CheckRegs` | `c *MockAgent` | `` | `[]*api.AgentCheckRegistration` | [L262](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L262) |
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

**中文说明**：创建并返回一个新的 MockNamespaces 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `namespaces` | `[]string` | 列表 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*MockNamespaces` | — |

### List()

**签名**：`func (m *MockNamespaces) List(*api.QueryOptions) []*api.Namespace, *api.QueryMeta, error`

**位置**：[L54](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L54)

**中文说明**：列出所有对象。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `—` | `*api.QueryOptions` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `[]*api.Namespace` | 列表 |
| `*api.QueryMeta` | — |
| `error` | 错误信息 |

### NewMockCatalog()

**签名**：`func NewMockCatalog(l hclog.Logger) *MockCatalog`

**位置**：[L67](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L67)

**中文说明**：创建并返回一个新的 MockCatalog 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `l` | `hclog.Logger` | 日志记录器 |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*MockCatalog` | — |

### NewMockAgent()

**签名**：`func NewMockAgent(f Features) *MockAgent`

**位置**：[L118](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go#L118)

**中文说明**：创建并返回一个新的 MockAgent 实例。

**参数说明**：

| 参数名 | 类型 | 说明 |
|--------|------|------|
| `f` | `Features` | — |

**返回值**：

| 类型 | 说明 |
|------|------|
| `*MockAgent` | — |

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
- **工厂模式**：提供 `New*` 构造函数创建对象实例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [config_entries_testing.go](file:///d:/claude/nomad/command/agent/consul/config_entries_testing.go) | 同目录源文件 |
| [connect.go](file:///d:/claude/nomad/command/agent/consul/connect.go) | 同目录源文件 |
| [connect_proxies.go](file:///d:/claude/nomad/command/agent/consul/connect_proxies.go) | 同目录源文件 |
| [connect_proxies_testing.go](file:///d:/claude/nomad/command/agent/consul/connect_proxies_testing.go) | 同目录源文件 |
| [namespaces_client.go](file:///d:/claude/nomad/command/agent/consul/namespaces_client.go) | 同目录源文件 |

