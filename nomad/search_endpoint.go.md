# search_endpoint.go 代码说明文档

> 文件路径：[search_endpoint.go](file:///d:/claude/nomad/nomad/search_endpoint.go)
> 总行数：969 行
> 所属包：`nomad`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **搜索 RPC 端点**，处理模糊搜索作业、节点、分配等资源的 RPC 请求。

## 2. 类型定义

### Search

**定义位置**：[L49](file:///d:/claude/nomad/nomad/search_endpoint.go#L49)

**类型**：struct

```go
	srv *Server
	ctx *RPCContext
	logger hclog.Logger
```

**关联方法**（7 个）：`getPrefixMatches`, `getFuzzyMatches`, `fuzzyMatchSingle`, `fuzzyMatchesJob`, `silenceError`, `PrefixSearch`, `FuzzySearch`

### fuzzyMatch

**定义位置**：[L339](file:///d:/claude/nomad/nomad/search_endpoint.go#L339)

**类型**：struct

```go
	id string
	scope []string
	score int
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `truncateLimit` | `20` |

### 变量

| 名称 | 值 |
|------|----|
| `ossContexts` | `[]structs.Context{...}` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewSearchEndpoint` | - | `srv *Server, ctx *RPCContext` | `*Search` | [L55](file:///d:/claude/nomad/nomad/search_endpoint.go#L55) |
| `getPrefixMatches` | `s *Search` | `iter memdb.ResultIterator, prefix string` | `[]string, bool` | [L61](file:///d:/claude/nomad/nomad/search_endpoint.go#L61) |
| `getFuzzyMatches` | `s *Search` | `iter memdb.ResultIterator, text string` | `map[structs.Context][]structs.FuzzyMatch, map[structs.Co...` | [L116](file:///d:/claude/nomad/nomad/search_endpoint.go#L116) |
| `fuzzyIndex` | - | `name string, text string` | `int` | [L206](file:///d:/claude/nomad/nomad/search_endpoint.go#L206) |
| `fuzzyMatchSingle` | `s *Search` | `raw interface{}, text string` | `structs.Context, *fuzzyMatch` | [L213](file:///d:/claude/nomad/nomad/search_endpoint.go#L213) |
| `fuzzyMatchesJob` | ` *Search` | `j *structs.Job, text string` | `map[structs.Context][]fuzzyMatch` | [L266](file:///d:/claude/nomad/nomad/search_endpoint.go#L266) |
| `getConfigParam` | - | `config map[string]interface{}, param string` | `string` | [L326](file:///d:/claude/nomad/nomad/search_endpoint.go#L326) |
| `score` | - | `id string, namespace string, score int, scope ...string` | `fuzzyMatch` | [L345](file:///d:/claude/nomad/nomad/search_endpoint.go#L345) |
| `sortSet` | - | `matches []fuzzyMatch` | - | [L353](file:///d:/claude/nomad/nomad/search_endpoint.go#L353) |
| `getResourceIter` | - | `context structs.Context, aclObj *acl.ACL, namespace string, prefix string, w...` | `memdb.ResultIterator, error` | [L384](file:///d:/claude/nomad/nomad/search_endpoint.go#L384) |
| `wildcard` | - | `namespace string` | `bool` | [L433](file:///d:/claude/nomad/nomad/search_endpoint.go#L433) |
| `getFuzzyResourceIterator` | - | `context structs.Context, aclObj *acl.ACL, namespace string, ws memdb.WatchSe...` | `memdb.ResultIterator, error` | [L437](file:///d:/claude/nomad/nomad/search_endpoint.go#L437) |
| `nsCapIterFilter` | - | `iter memdb.ResultIterator, err error, aclObj *acl.ACL` | `memdb.ResultIterator, error` | [L497](file:///d:/claude/nomad/nomad/search_endpoint.go#L497) |
| `nsCapFilter` | - | `aclObj *acl.ACL` | `memdb.FilterFunc` | [L506](file:///d:/claude/nomad/nomad/search_endpoint.go#L506) |
| `nodePoolCapFilter` | - | `aclObj *acl.ACL` | `memdb.FilterFunc` | [L535](file:///d:/claude/nomad/nomad/search_endpoint.go#L535) |
| `roundUUIDDownIfOdd` | - | `prefix string, context structs.Context` | `string` | [L544](file:///d:/claude/nomad/nomad/search_endpoint.go#L544) |
| `silenceError` | ` *Search` | `err error` | `bool` | [L562](file:///d:/claude/nomad/nomad/search_endpoint.go#L562) |
| `PrefixSearch` | `s *Search` | `args *structs.SearchRequest, reply *structs.SearchResponse` | `error` | [L585](file:///d:/claude/nomad/nomad/search_endpoint.go#L585) |
| `sufficientSearchPerms` | - | `aclObj *acl.ACL, namespace string, context structs.Context` | `bool` | [L665](file:///d:/claude/nomad/nomad/search_endpoint.go#L665) |
| `FuzzySearch` | `s *Search` | `args *structs.FuzzySearchRequest, reply *structs.FuzzySearchResponse` | `error` | [L726](file:///d:/claude/nomad/nomad/search_endpoint.go#L726) |
| `expandContext` | - | `context structs.Context` | `[]structs.Context` | [L866](file:///d:/claude/nomad/nomad/search_endpoint.go#L866) |
| `sufficientFuzzySearchPerms` | - | `aclObj *acl.ACL, namespace string, context structs.Context` | `bool` | [L883](file:///d:/claude/nomad/nomad/search_endpoint.go#L883) |
| `filteredSearchContexts` | - | `aclObj *acl.ACL, namespace string, context structs.Context` | `[]structs.Context` | [L894](file:///d:/claude/nomad/nomad/search_endpoint.go#L894) |
| `filteredFuzzySearchContexts` | - | `aclObj *acl.ACL, namespace string, context structs.Context` | `[]structs.Context` | [L963](file:///d:/claude/nomad/nomad/search_endpoint.go#L963) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `sort` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/acl` | 内部包 |
| `github.com/hashicorp/nomad/nomad/state` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-hclog` | 第三方库 |
| `github.com/hashicorp/go-memdb` | 第三方库 |
| `github.com/hashicorp/go-metrics/compat` | 第三方库 |

## 7. 设计模式与技术特点

- **组合模式**：结构体嵌入 Server 引用，通过组合获取 Server 上下文
- **RPC 端点模式**：定义 RPC 端点结构体，将 Server 引用注入端点，处理特定资源的 RPC 请求
- **内存数据库**：使用 MemDB 实现内存索引，支持事务和多版本并发控制（MVCC）
- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **指标收集**：使用 `go-metrics` 收集运行时指标
- **ACL 集成**：集成访问控制列表，验证请求权限

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [search_endpoint_test.go](file:///d:/claude/nomad/nomad/search_endpoint_test.go) | 对应测试文件 |

