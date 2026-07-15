# consul.go 代码说明文档

> 文件路径：[e2e/e2eutil/consul.go](file:///d:/claude/nomad/e2e/e2eutil/consul.go)
> 总行数：252 行
> 所属包：`e2eutil`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **E2E 测试工具子包**（`e2e/e2eutil`），提供端到端测试的共享工具函数，包括 Nomad 客户端创建、作业提交、分配查询、等待逻辑和断言辅助等，是所有 E2E 测试的基础设施。

## 2. 类型定义

### ConsulPolicy

**定义位置**：[L166](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L166)

**类型**：struct

```go
	Name string
	Rules string
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `RequireConsulStatus` | - | `require *require.Assertions, client *capi.Client, namespace string, service ...` | - | [L20](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L20) |
| `serviceStatus` | - | `require *require.Assertions, client *capi.Client, namespace string, service ...` | `[]*capi.ServiceEntry, string` | [L32](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L32) |
| `RequireConsulDeregistered` | - | `require *require.Assertions, client *capi.Client, namespace string, service ...` | - | [L42](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L42) |
| `RequireConsulRegistered` | - | `require *require.Assertions, client *capi.Client, namespace string, service ...` | - | [L58](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L58) |
| `CreateConsulNamespaces` | - | `t *testing.T, client *capi.Client, namespaces []string` | - | [L77](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L77) |
| `DeleteConsulNamespaces` | - | `t *testing.T, client *capi.Client, namespaces []string` | - | [L92](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L92) |
| `ListConsulNamespaces` | - | `t *testing.T, client *capi.Client` | `[]string` | [L104](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L104) |
| `PutConsulKey` | - | `t *testing.T, client *capi.Client, namespace string, key string, value string` | - | [L120](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L120) |
| `DeleteConsulKey` | - | `t *testing.T, client *capi.Client, namespace string, key string` | - | [L131](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L131) |
| `ReadConsulConfigEntry` | - | `t *testing.T, client *capi.Client, namespace string, kind string, name string` | `capi.ConfigEntry` | [L143](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L143) |
| `DeleteConsulConfigEntry` | - | `t *testing.T, client *capi.Client, namespace string, kind string, name string` | - | [L156](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L156) |
| `CreateConsulPolicy` | - | `t *testing.T, client *capi.Client, namespace string, policy ConsulPolicy` | `string` | [L175](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L175) |
| `DeleteConsulPolicies` | - | `t *testing.T, client *capi.Client, policies map[string][]string` | - | [L191](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L191) |
| `CreateConsulRole` | - | `t *testing.T, client *capi.Client, name string, namespace string, policyID s...` | - | [L207](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L207) |
| `CreateConsulToken` | - | `t *testing.T, client *capi.Client, namespace string, policyID string` | `secret string, accessor string` | [L226](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L226) |
| `DeleteConsulTokens` | - | `t *testing.T, client *capi.Client, tokens map[string][]string` | - | [L241](file:///d:/claude/nomad/e2e/e2eutil/consul.go#L241) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `testing` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/testutil` | 内部包 |
| `github.com/hashicorp/consul/api` | 第三方库 |
| `github.com/kr/pretty` | 第三方库 |
| `github.com/shoenig/test/must` | 第三方库 |
| `github.com/stretchr/testify/assert` | 第三方库 |
| `github.com/stretchr/testify/require` | 第三方库 |

## 7. 设计模式与技术特点

- **端到端测试**：通过真实 Nomad 集群验证功能，使用测试框架组织测试用例

## 8. 相关文件

| 文件 | 关系 |
|------|------|

