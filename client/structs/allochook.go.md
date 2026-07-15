# allochook.go 代码说明文档

> 文件路径：[structs/allochook.go](file:///d:/claude/nomad/client/structs/allochook.go)
> 总行数：123 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Client 结构体子包**（`client/structs`），定义 Client 层的数据结构（事件、统计、响应等）。

## 2. 类型定义

### AllocHookResources

**定义位置**：[L19](file:///d:/claude/nomad/client/structs/allochook.go#L19)

**类型**：struct

```go
	csiMounts map[string]*csimanager.MountInfo
	consulTokens map[string]map[string]*consulapi.ACLToken
	consulCheckIDs [][]string
	networkStatus *structs.AllocNetworkStatus
	mu sync.RWMutex
```

**关联方法**（8 个）：`GetCSIMounts`, `SetCSIMounts`, `GetConsulTokens`, `SetConsulTokens`, `GetConsulCheckIDs`, `SetConsulCheckIDs`, `GetAllocNetworkStatus`, `SetAllocNetworkStatus`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewAllocHookResources` | - | - | `*AllocHookResources` | [L28](file:///d:/claude/nomad/client/structs/allochook.go#L28) |
| `GetCSIMounts` | `a *AllocHookResources` | - | `map[string]*csimanager.MountInfo` | [L38](file:///d:/claude/nomad/client/structs/allochook.go#L38) |
| `SetCSIMounts` | `a *AllocHookResources` | `m map[string]*csimanager.MountInfo` | - | [L47](file:///d:/claude/nomad/client/structs/allochook.go#L47) |
| `GetConsulTokens` | `a *AllocHookResources` | - | `map[string]map[string]*consulapi.ACLToken` | [L56](file:///d:/claude/nomad/client/structs/allochook.go#L56) |
| `SetConsulTokens` | `a *AllocHookResources` | `m map[string]map[string]*consulapi.ACLToken` | - | [L66](file:///d:/claude/nomad/client/structs/allochook.go#L66) |
| `GetConsulCheckIDs` | `a *AllocHookResources` | - | `[][]string` | [L78](file:///d:/claude/nomad/client/structs/allochook.go#L78) |
| `SetConsulCheckIDs` | `a *AllocHookResources` | `ids [][]string` | - | [L100](file:///d:/claude/nomad/client/structs/allochook.go#L100) |
| `GetAllocNetworkStatus` | `a *AllocHookResources` | - | `*structs.AllocNetworkStatus` | [L108](file:///d:/claude/nomad/client/structs/allochook.go#L108) |
| `SetAllocNetworkStatus` | `a *AllocHookResources` | `ans *structs.AllocNetworkStatus` | - | [L117](file:///d:/claude/nomad/client/structs/allochook.go#L117) |

## 5. 核心方法详解

### GetCSIMounts()

**签名**：`func (a *AllocHookResources) GetCSIMounts() map[string]*csimanager.MountInfo`

**位置**：[L38](file:///d:/claude/nomad/client/structs/allochook.go#L38)

### GetConsulTokens()

**签名**：`func (a *AllocHookResources) GetConsulTokens() map[string]map[string]*consulapi.ACLToken`

**位置**：[L56](file:///d:/claude/nomad/client/structs/allochook.go#L56)

### GetConsulCheckIDs()

**签名**：`func (a *AllocHookResources) GetConsulCheckIDs() [][]string`

**位置**：[L78](file:///d:/claude/nomad/client/structs/allochook.go#L78)

### GetAllocNetworkStatus()

**签名**：`func (a *AllocHookResources) GetAllocNetworkStatus() *structs.AllocNetworkStatus`

**位置**：[L108](file:///d:/claude/nomad/client/structs/allochook.go#L108)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/client/pluginmanager/csimanager` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/consul/api` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态

## 8. 相关文件

| 文件 | 关系 |
|------|------|

