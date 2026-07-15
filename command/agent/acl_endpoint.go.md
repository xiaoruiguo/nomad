# acl_endpoint.go 代码说明文档

> 文件路径：[acl_endpoint.go](file:///d:/claude/nomad/command/agent/acl_endpoint.go)
> 总行数：976 行
> 所属包：`agent`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件是 **HTTP API 端点实现**，负责 `acl` 相关的 HTTP 请求处理，包括请求解析、ACL 鉴权、调用 Server/Client RPC、响应格式化等。端点通过 `http.go` 中的路由注册表挂载到 HTTP 服务器。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `ACLPoliciesRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L15](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L15) |
| `ACLPolicySpecificRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L37](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L37) |
| `aclPolicyQuery` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, policyName string` | `interface{}, error` | [L59](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L59) |
| `aclPolicyUpdate` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, policyName string` | `interface{}, error` | [L80](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L80) |
| `aclPolicyDelete` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, policyName string` | `interface{}, error` | [L107](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L107) |
| `ACLTokensRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L123](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L123) |
| `ACLTokenBootstrap` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L145](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L145) |
| `ACLTokenSpecificRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L172](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L172) |
| `aclSelfPolicy` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L189](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L189) |
| `aclTokenCrud` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, tokenAccessor string` | `interface{}, error` | [L234](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L234) |
| `aclTokenQuery` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, tokenAccessor string` | `interface{}, error` | [L252](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L252) |
| `aclTokenSelf` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `any, error` | [L273](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L273) |
| `aclTokenUpdate` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, tokenAccessor string` | `interface{}, error` | [L294](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L294) |
| `aclTokenDelete` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, tokenAccessor string` | `interface{}, error` | [L324](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L324) |
| `UpsertOneTimeToken` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L340](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L340) |
| `ExchangeOneTimeToken` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L358](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L358) |
| `ACLRoleListRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L381](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L381) |
| `ACLRoleRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L412](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L412) |
| `ACLRoleSpecificRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L426](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L426) |
| `aclRoleRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, roleID string` | `interface{}, error` | [L468](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L468) |
| `aclRoleGetByIDRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, roleID string` | `interface{}, error` | [L485](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L485) |
| `aclRoleDeleteRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, roleID string` | `interface{}, error` | [L507](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L507) |
| `aclRoleUpsertRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, roleID string` | `interface{}, error` | [L525](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L525) |
| `aclRoleGetByNameRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, roleName string` | `interface{}, error` | [L558](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L558) |
| `ACLAuthMethodListRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L582](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L582) |
| `ACLAuthMethodRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L613](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L613) |
| `ACLAuthMethodSpecificRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L627](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L627) |
| `aclAuthMethodGetRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, methodName string` | `interface{}, error` | [L655](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L655) |
| `aclAuthMethodDeleteRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, methodName string` | `interface{}, error` | [L679](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L679) |
| `aclAuthMethodUpsertRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, methodName string` | `interface{}, error` | [L698](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L698) |
| `ACLBindingRuleListRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L734](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L734) |
| `ACLBindingRuleRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L765](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L765) |
| `ACLBindingRuleSpecificRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L779](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L779) |
| `aclBindingRuleGetRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, ruleID string` | `interface{}, error` | [L804](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L804) |
| `aclBindingRuleDeleteRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, ruleID string` | `interface{}, error` | [L826](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L826) |
| `aclBindingRuleUpsertRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request, ruleID string` | `interface{}, error` | [L845](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L845) |
| `ACLOIDCAuthURLRequest` | `s *HTTPServer` | `_ http.ResponseWriter, req *http.Request` | `interface{}, error` | [L886](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L886) |
| `ACLOIDCCompleteAuthRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `interface{}, error` | [L908](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L908) |
| `ACLLoginRequest` | `s *HTTPServer` | `resp http.ResponseWriter, req *http.Request` | `any, error` | [L931](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L931) |
| `ACLCreateClientIntroductionTokenRequest` | `s *HTTPServer` | `_ http.ResponseWriter, req *http.Request` | `any, error` | [L949](file:///d:/claude/nomad/command/agent/acl_endpoint.go#L949) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `net/http` | 标准库 |
| `strings` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [acl_endpoint_test.go](file:///d:/claude/nomad/command/agent/acl_endpoint_test.go) | 对应测试文件 |
| [agent.go](file:///d:/claude/nomad/command/agent/agent.go) | Agent 核心实现 |
| [http.go](file:///d:/claude/nomad/command/agent/http.go) | HTTP 服务器实现 |
| [config.go](file:///d:/claude/nomad/command/agent/config.go) | 配置定义 |

