# errors.go 代码说明文档

> 文件路径：[structs/errors.go](file:///d:/claude/nomad/nomad/structs/errors.go)
> 总行数：242 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `errNoLeader` | `"No cluster leader"` |
| `errNotReadyForConsistentReads` | `"Not ready to serve consistent reads"` |
| `errNoRegionPath` | `"No path to region"` |
| `errTokenNotFound` | `"ACL token not found"` |
| `errTokenExpired` | `"ACL token expired"` |
| `errTokenInvalid` | `"ACL token is invalid"` |
| `errPermissionDenied` | `"Permission denied"` |
| `errJobRegistrationDisabled` | `"Job registration, dispatch, and scale are disabled by th...` |
| `errNoNodeConn` | `"No path to node"` |
| `errUnknownMethod` | `"Unknown rpc method"` |
| `errUnknownNomadVersion` | `"Unable to determine Nomad version"` |
| `errNodeLacksRpc` | `"Node does not support RPC; requires 0.8 or later"` |
| `errMissingAllocID` | `"Missing allocation ID"` |
| `errIncompatibleFiltering` | `"Filter expression cannot be used with other filter param...` |
| `errMalformedChooseParameter` | `"Parameter for choose must be in form '<number>\|<key>'"` |
| `errResultPaginatorCreation` | `"failed to create result paginator"` |
| `ErrUnknownAllocationPrefix` | `"Unknown allocation"` |
| `ErrUnknownNodePrefix` | `"Unknown node"` |
| `ErrUnknownJobPrefix` | `"Unknown job"` |
| `ErrUnknownEvaluationPrefix` | `"Unknown evaluation"` |
| `ErrUnknownDeploymentPrefix` | `"Unknown deployment"` |
| `errRPCCodedErrorPrefix` | `"RPC Error:: "` |
| `errDeploymentTerminalNoCancel` | `"can't cancel terminal deployment"` |
| `errDeploymentTerminalNoFail` | `"can't fail terminal deployment"` |
| `errDeploymentTerminalNoPause` | `"can't pause terminal deployment"` |
| `errDeploymentTerminalNoPromote` | `"can't promote terminal deployment"` |
| `errDeploymentTerminalNoResume` | `"can't resume terminal deployment"` |
| `errDeploymentTerminalNoUnblock` | `"can't unblock terminal deployment"` |
| `errDeploymentTerminalNoRun` | `"can't run terminal deployment"` |
| `errDeploymentTerminalNoSetHealth` | `"can't set health of allocations for a terminal deployment"` |
| `errDeploymentRunningNoUnblock` | `"can't unblock running deployment"` |

### 变量

| 名称 | 值 |
|------|----|
| `ErrNoLeader` | `errors.New(errNoLeader)` |
| `ErrNotReadyForConsistentReads` | `errors.New(errNotReadyForConsistentReads)` |
| `ErrNoRegionPath` | `errors.New(errNoRegionPath)` |
| `ErrTokenNotFound` | `errors.New(errTokenNotFound)` |
| `ErrTokenExpired` | `errors.New(errTokenExpired)` |
| `ErrTokenInvalid` | `errors.New(errTokenInvalid)` |
| `ErrPermissionDenied` | `errors.New(errPermissionDenied)` |
| `ErrJobRegistrationDisabled` | `errors.New(errJobRegistrationDisabled)` |
| `ErrNoNodeConn` | `errors.New(errNoNodeConn)` |
| `ErrUnknownMethod` | `errors.New(errUnknownMethod)` |
| `ErrUnknownNomadVersion` | `errors.New(errUnknownNomadVersion)` |
| `ErrNodeLacksRpc` | `errors.New(errNodeLacksRpc)` |
| `ErrMissingAllocID` | `errors.New(errMissingAllocID)` |
| `ErrIncompatibleFiltering` | `errors.New(errIncompatibleFiltering)` |
| `ErrMalformedChooseParameter` | `errors.New(errMalformedChooseParameter)` |
| `ErrResultPaginatorCreation` | `errors.New(errResultPaginatorCreation)` |
| `ErrUnknownNode` | `errors.New(ErrUnknownNodePrefix)` |
| `ErrDeploymentTerminalNoCancel` | `errors.New(errDeploymentTerminalNoCancel)` |
| `ErrDeploymentTerminalNoFail` | `errors.New(errDeploymentTerminalNoFail)` |
| `ErrDeploymentTerminalNoPause` | `errors.New(errDeploymentTerminalNoPause)` |
| `ErrDeploymentTerminalNoPromote` | `errors.New(errDeploymentTerminalNoPromote)` |
| `ErrDeploymentTerminalNoResume` | `errors.New(errDeploymentTerminalNoResume)` |
| `ErrDeploymentTerminalNoUnblock` | `errors.New(errDeploymentTerminalNoUnblock)` |
| `ErrDeploymentTerminalNoRun` | `errors.New(errDeploymentTerminalNoRun)` |
| `ErrDeploymentTerminalNoSetHealth` | `errors.New(errDeploymentTerminalNoSetHealth)` |
| `ErrDeploymentRunningNoUnblock` | `errors.New(errDeploymentRunningNoUnblock)` |
| `ErrCSIClientRPCIgnorable` | `errors.New("CSI client error (ignorable)")` |
| `ErrCSIClientRPCRetryable` | `errors.New("CSI client error (retryable)")` |
| `ErrCSIVolumeMaxClaims` | `errors.New("volume max claims reached")` |
| `ErrCSIVolumeUnschedulable` | `errors.New("volume is currently unschedulable")` |
| `ErrCSIPluginInUse` | `errors.New("plugin in use")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `IsErrNoLeader` | - | `err error` | `bool` | [L96](file:///d:/claude/nomad/nomad/structs/errors.go#L96) |
| `IsErrNoRegionPath` | - | `err error` | `bool` | [L102](file:///d:/claude/nomad/nomad/structs/errors.go#L102) |
| `IsErrTokenNotFound` | - | `err error` | `bool` | [L108](file:///d:/claude/nomad/nomad/structs/errors.go#L108) |
| `IsErrPermissionDenied` | - | `err error` | `bool` | [L114](file:///d:/claude/nomad/nomad/structs/errors.go#L114) |
| `IsErrNoNodeConn` | - | `err error` | `bool` | [L120](file:///d:/claude/nomad/nomad/structs/errors.go#L120) |
| `IsErrUnknownMethod` | - | `err error` | `bool` | [L126](file:///d:/claude/nomad/nomad/structs/errors.go#L126) |
| `IsErrRPCCoded` | - | `err error` | `bool` | [L130](file:///d:/claude/nomad/nomad/structs/errors.go#L130) |
| `NewErrUnknownAllocation` | - | `allocID string` | `error` | [L136](file:///d:/claude/nomad/nomad/structs/errors.go#L136) |
| `NewErrUnknownNode` | - | `nodeID string` | `error` | [L141](file:///d:/claude/nomad/nomad/structs/errors.go#L141) |
| `NewErrUnknownJob` | - | `jobID string` | `error` | [L146](file:///d:/claude/nomad/nomad/structs/errors.go#L146) |
| `NewErrUnknownEvaluation` | - | `evaluationID string` | `error` | [L152](file:///d:/claude/nomad/nomad/structs/errors.go#L152) |
| `NewErrUnknownDeployment` | - | `deploymentID string` | `error` | [L158](file:///d:/claude/nomad/nomad/structs/errors.go#L158) |
| `IsErrUnknownAllocation` | - | `err error` | `bool` | [L164](file:///d:/claude/nomad/nomad/structs/errors.go#L164) |
| `IsErrUnknownNode` | - | `err error` | `bool` | [L170](file:///d:/claude/nomad/nomad/structs/errors.go#L170) |
| `IsErrUnknownJob` | - | `err error` | `bool` | [L176](file:///d:/claude/nomad/nomad/structs/errors.go#L176) |
| `IsErrUnknownEvaluation` | - | `err error` | `bool` | [L182](file:///d:/claude/nomad/nomad/structs/errors.go#L182) |
| `IsErrUnknownDeployment` | - | `err error` | `bool` | [L188](file:///d:/claude/nomad/nomad/structs/errors.go#L188) |
| `IsErrUnknownNomadVersion` | - | `err error` | `bool` | [L194](file:///d:/claude/nomad/nomad/structs/errors.go#L194) |
| `IsErrNodeLacksRpc` | - | `err error` | `bool` | [L200](file:///d:/claude/nomad/nomad/structs/errors.go#L200) |
| `IsErrNoSuchFileOrDirectory` | - | `err error` | `bool` | [L204](file:///d:/claude/nomad/nomad/structs/errors.go#L204) |
| `NewErrRPCCoded` | - | `code int, msg string` | `error` | [L210](file:///d:/claude/nomad/nomad/structs/errors.go#L210) |
| `NewErrRPCCodedf` | - | `code int, format string, args ...interface{}` | `error` | [L216](file:///d:/claude/nomad/nomad/structs/errors.go#L216) |
| `CodeFromRPCCodedErr` | - | `err error` | `code int, msg string, ok bool` | [L224](file:///d:/claude/nomad/nomad/structs/errors.go#L224) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [errors_test.go](file:///d:/claude/nomad/nomad/structs/errors_test.go) | 对应测试文件 |

