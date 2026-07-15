# identity.go 代码说明文档

> 文件路径：[structs/identity.go](file:///d:/claude/nomad/nomad/structs/identity.go)
> 总行数：185 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### IdentityClaims

**定义位置**：[L22](file:///d:/claude/nomad/nomad/structs/identity.go#L22)

**类型**：struct

```go
	*NodeIdentityClaims
	*NodeIntroductionIdentityClaims
	*WorkloadIdentityClaims
	jwt.Claims
```

**关联方法**（12 个）：`MarshalJSON`, `UnmarshalJSON`, `IsNode`, `IsNodeIntroduction`, `IsWorkload`, `IsExpiring`, `IsExpiringInThreshold`, `setExpiry`, `setAudience`, `setNodeSubject`, `setNodeIntroductionSubject`, `setWorkloadSubject`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `IdentityDefaultAud` | `"nomadproject.io"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `MarshalJSON` | `i *IdentityClaims` | - | `[]byte, error` | [L43](file:///d:/claude/nomad/nomad/structs/identity.go#L43) |
| `UnmarshalJSON` | `i *IdentityClaims` | `data []byte` | `err error` | [L62](file:///d:/claude/nomad/nomad/structs/identity.go#L62) |
| `IsNode` | `i *IdentityClaims` | - | `bool` | [L86](file:///d:/claude/nomad/nomad/structs/identity.go#L86) |
| `IsNodeIntroduction` | `i *IdentityClaims` | - | `bool` | [L90](file:///d:/claude/nomad/nomad/structs/identity.go#L90) |
| `IsWorkload` | `i *IdentityClaims` | - | `bool` | [L95](file:///d:/claude/nomad/nomad/structs/identity.go#L95) |
| `IsExpiring` | `i *IdentityClaims` | `now time.Time, ttl time.Duration` | `bool` | [L99](file:///d:/claude/nomad/nomad/structs/identity.go#L99) |
| `IsExpiringInThreshold` | `i *IdentityClaims` | `threshold time.Time` | `bool` | [L117](file:///d:/claude/nomad/nomad/structs/identity.go#L117) |
| `setExpiry` | `i *IdentityClaims` | `now time.Time, ttl time.Duration` | - | [L129](file:///d:/claude/nomad/nomad/structs/identity.go#L129) |
| `setAudience` | `i *IdentityClaims` | `aud []string` | - | [L136](file:///d:/claude/nomad/nomad/structs/identity.go#L136) |
| `setNodeSubject` | `i *IdentityClaims` | `node *Node, region string` | - | [L143](file:///d:/claude/nomad/nomad/structs/identity.go#L143) |
| `setNodeIntroductionSubject` | `i *IdentityClaims` | `name string, pool string, region string` | - | [L160](file:///d:/claude/nomad/nomad/structs/identity.go#L160) |
| `setWorkloadSubject` | `i *IdentityClaims` | `job *Job, group string, wID string, id string` | - | [L175](file:///d:/claude/nomad/nomad/structs/identity.go#L175) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `encoding/json` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/go-jose/go-jose/v3/jwt` | 第三方库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Server 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [identity_test.go](file:///d:/claude/nomad/nomad/structs/identity_test.go) | 对应测试文件 |

