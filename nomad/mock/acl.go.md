# acl.go 代码说明文档

> 文件路径：[mock/acl.go](file:///d:/claude/nomad/nomad/mock/acl.go)
> 总行数：379 行
> 所属包：`mock`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **模拟子包**（`nomad/mock`），提供测试用的模拟数据生成器，用于生成 Job、Node、Alloc 等对象的测试实例。

## 2. 类型定义

### StateStore

**定义位置**：[L28](file:///d:/claude/nomad/nomad/mock/acl.go#L28)

**类型**：interface

```go
	UpsertACLPolicies
	UpsertACLTokens
```

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NamespacePolicy` | - | `namespace string, policy string, capabilities []string` | `string` | [L35](file:///d:/claude/nomad/nomad/mock/acl.go#L35) |
| `NamespacePolicyWithVariables` | - | `namespace string, policy string, capabilities []string, svars map[string][]s...` | `string` | [L55](file:///d:/claude/nomad/nomad/mock/acl.go#L55) |
| `NodePoolPolicy` | - | `pool string, policy string, capabilities []string` | `string` | [L74](file:///d:/claude/nomad/nomad/mock/acl.go#L74) |
| `VariablePolicy` | - | `svars map[string][]string` | `string` | [L110](file:///d:/claude/nomad/nomad/mock/acl.go#L110) |
| `HostVolumePolicy` | - | `vol string, policy string, capabilities []string` | `string` | [L129](file:///d:/claude/nomad/nomad/mock/acl.go#L129) |
| `AgentPolicy` | - | `policy string` | `string` | [L148](file:///d:/claude/nomad/nomad/mock/acl.go#L148) |
| `NodePolicy` | - | `policy string` | `string` | [L153](file:///d:/claude/nomad/nomad/mock/acl.go#L153) |
| `QuotaPolicy` | - | `policy string` | `string` | [L158](file:///d:/claude/nomad/nomad/mock/acl.go#L158) |
| `PluginPolicy` | - | `policy string` | `string` | [L163](file:///d:/claude/nomad/nomad/mock/acl.go#L163) |
| `CreatePolicy` | - | `t testing.TB, state StateStore, index uint64, name string, rule string` | - | [L168](file:///d:/claude/nomad/nomad/mock/acl.go#L168) |
| `CreateToken` | - | `t testing.TB, state StateStore, index uint64, policies []string` | `*structs.ACLToken` | [L181](file:///d:/claude/nomad/nomad/mock/acl.go#L181) |
| `CreatePolicyAndToken` | - | `t testing.TB, state StateStore, index uint64, name string, rule string` | `*structs.ACLToken` | [L194](file:///d:/claude/nomad/nomad/mock/acl.go#L194) |
| `ACLRole` | - | - | `*structs.ACLRole` | [L199](file:///d:/claude/nomad/nomad/mock/acl.go#L199) |
| `ACLPolicy` | - | - | `*structs.ACLPolicy` | [L215](file:///d:/claude/nomad/nomad/mock/acl.go#L215) |
| `ACLToken` | - | - | `*structs.ACLToken` | [L237](file:///d:/claude/nomad/nomad/mock/acl.go#L237) |
| `ACLManagementToken` | - | - | `*structs.ACLToken` | [L253](file:///d:/claude/nomad/nomad/mock/acl.go#L253) |
| `ACLOIDCAuthMethod` | - | - | `*structs.ACLAuthMethod` | [L266](file:///d:/claude/nomad/nomad/mock/acl.go#L266) |
| `ACLJWTAuthMethod` | - | - | `*structs.ACLAuthMethod` | [L298](file:///d:/claude/nomad/nomad/mock/acl.go#L298) |
| `SampleJWTokenWithKeys` | - | `claims jwt.Claims, rsaKey *rsa.PrivateKey` | `string, string, error` | [L328](file:///d:/claude/nomad/nomad/mock/acl.go#L328) |
| `ACLBindingRule` | - | - | `*structs.ACLBindingRule` | [L365](file:///d:/claude/nomad/nomad/mock/acl.go#L365) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `crypto/rand` | 标准库 |
| `crypto/rsa` | 标准库 |
| `crypto/x509` | 标准库 |
| `encoding/pem` | 标准库 |
| `fmt` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `testing` | 标准库 |
| `text/template` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/golang-jwt/jwt/v5` | 第三方库 |
| `github.com/stretchr/testify/assert` | 第三方库 |

## 7. 设计模式与技术特点

- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟

## 8. 相关文件

| 文件 | 关系 |
|------|------|

