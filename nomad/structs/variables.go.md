# variables.go 代码说明文档

> 文件路径：[structs/variables.go](file:///d:/claude/nomad/nomad/structs/variables.go)
> 总行数：703 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **核心数据结构子包**（`nomad/structs`），定义 Nomad 的所有核心数据结构（Job、Node、Alloc、Eval、Deployment 等），是整个系统的领域模型基础。

## 2. 类型定义

### VariableMetadata

**定义位置**：[L82](file:///d:/claude/nomad/nomad/structs/variables.go#L82)

**类型**：struct

```go
	Namespace string
	Path string
	Lock *VariableLock `json:",omitempty"`
	CreateIndex uint64
	CreateTime int64
	ModifyIndex uint64
	ModifyTime int64
```

**关联方法**（7 个）：`Equal`, `Copy`, `GetNamespace`, `GetID`, `GetCreateIndex`, `LockID`, `IsLock`

### VariableEncrypted

**定义位置**：[L97](file:///d:/claude/nomad/nomad/structs/variables.go#L97)

**类型**：struct

```go
	VariableMetadata
	VariableData
```

**关联方法**（2 个）：`Equal`, `Copy`

### VariableData

**定义位置**：[L103](file:///d:/claude/nomad/nomad/structs/variables.go#L103)

**类型**：struct

```go
	Data []byte
	KeyID string
```

**关联方法**（2 个）：`Equal`, `Copy`

### VariableDecrypted

**定义位置**：[L111](file:///d:/claude/nomad/nomad/structs/variables.go#L111)

**类型**：struct

```go
	VariableMetadata
	Items VariableItems `json:",omitempty"`
```

**关联方法**（5 个）：`Equal`, `Copy`, `Validate`, `ValidateForLock`, `Canonicalize`

### VariableItems

**定义位置**：[L118](file:///d:/claude/nomad/nomad/structs/variables.go#L118)

**类型定义**：`map[string]string`

**关联方法**（3 个）：`Size`, `Equal`, `Copy`

### VariableLock

**定义位置**：[L122](file:///d:/claude/nomad/nomad/structs/variables.go#L122)

**类型**：struct

```go
	ID string
	TTL time.Duration
	LockDelay time.Duration
```

**关联方法**（6 个）：`Equal`, `MarshalJSON`, `UnmarshalJSON`, `Copy`, `Canonicalize`, `Validate`

### VariablesQuota

**定义位置**：[L509](file:///d:/claude/nomad/nomad/structs/variables.go#L509)

**类型**：struct

```go
	Namespace string
	Size int64
	CreateIndex uint64
	ModifyIndex uint64
```

**关联方法**（1 个）：`Copy`

### VarOp

**定义位置**：[L529](file:///d:/claude/nomad/nomad/structs/variables.go#L529)

**类型定义**：`string`

### VarOpResult

**定义位置**：[L547](file:///d:/claude/nomad/nomad/structs/variables.go#L547)

**类型定义**：`string`

### VariablesApplyRequest

**定义位置**：[L557](file:///d:/claude/nomad/nomad/structs/variables.go#L557)

**类型**：struct

```go
	Op VarOp
	Var *VariableDecrypted
	WriteRequest
```

### VariablesApplyResponse

**定义位置**：[L564](file:///d:/claude/nomad/nomad/structs/variables.go#L564)

**类型**：struct

```go
	Op VarOp
	Input *VariableDecrypted
	Result VarOpResult
	Error error
	Conflict *VariableDecrypted
	Output *VariableDecrypted
	WriteMeta
```

**关联方法**（4 个）：`IsOk`, `IsConflict`, `IsError`, `IsRedacted`

### VarApplyStateRequest

**定义位置**：[L591](file:///d:/claude/nomad/nomad/structs/variables.go#L591)

**类型**：struct

```go
	Op VarOp
	Var *VariableEncrypted
	WriteRequest
```

**关联方法**（3 个）：`ErrorResponse`, `SuccessResponse`, `ConflictResponse`

### VarApplyStateResponse

**定义位置**：[L598](file:///d:/claude/nomad/nomad/structs/variables.go#L598)

**类型**：struct

```go
	Op VarOp
	Result VarOpResult
	Error error
	Conflict *VariableEncrypted
	WrittenSVMeta *VariableMetadata
	WriteMeta
```

**关联方法**（3 个）：`IsOk`, `IsConflict`, `IsError`

### VariablesListRequest

**定义位置**：[L654](file:///d:/claude/nomad/nomad/structs/variables.go#L654)

**类型**：struct

```go
	QueryOptions
```

### VariablesListResponse

**定义位置**：[L658](file:///d:/claude/nomad/nomad/structs/variables.go#L658)

**类型**：struct

```go
	Data []*VariableMetadata
	QueryMeta
```

### VariablesReadRequest

**定义位置**：[L663](file:///d:/claude/nomad/nomad/structs/variables.go#L663)

**类型**：struct

```go
	Path string
	QueryOptions
```

### VariablesReadResponse

**定义位置**：[L668](file:///d:/claude/nomad/nomad/structs/variables.go#L668)

**类型**：struct

```go
	Data *VariableDecrypted
	QueryMeta
```

### VariablesRenewLockRequest

**定义位置**：[L676](file:///d:/claude/nomad/nomad/structs/variables.go#L676)

**类型**：struct

```go
	Path string
	LockID string
	WriteRequest
```

**关联方法**（1 个）：`Validate`

### VariablesRenewLockResponse

**定义位置**：[L699](file:///d:/claude/nomad/nomad/structs/variables.go#L699)

**类型**：struct

```go
	VarMeta *VariableMetadata
	WriteMeta
```

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `VariablesApplyRPCMethod` | `"Variables.Apply"` |
| `VariablesListRPCMethod` | `"Variables.List"` |
| `VariablesReadRPCMethod` | `"Variables.Read"` |
| `VariablesRenewLockRPCMethod` | `"Variables.RenewLock"` |
| `maxVariableSize` | `65536` |
| `minVariableLockTTL` | `10 * time.Second` |
| `maxVariableLockTTL` | `24 * time.Hour` |
| `defaultLockTTL` | `15 * time.Second` |
| `defaultLockDelay` | `15 * time.Second` |
| `VarOpSet` | `"set"` |
| `VarOpDelete` | `"delete"` |
| `VarOpDeleteCAS` | `"delete-cas"` |
| `VarOpCAS` | `"cas"` |
| `VarOpLockAcquire` | `"lock-acquire"` |
| `VarOpLockRelease` | `"lock-release"` |
| `VarOpResultOk` | `"ok"` |
| `VarOpResultConflict` | `"conflict"` |
| `VarOpResultRedacted` | `"conflict-redacted"` |
| `VarOpResultError` | `"error"` |

### 变量

| 名称 | 值 |
|------|----|
| `errNoPath` | `errors.New("missing path")` |
| `errNoNamespace` | `errors.New("missing namespace")` |
| `errNoLock` | `errors.New("missing lock ID")` |
| `errWildCardNamespace` | `errors.New("can not target wildcard (\"*\")namespace")` |
| `errQuotaExhausted` | `errors.New("variables are limited to 64KiB in total size")` |
| `errNegativeDelayOrTTL` | `errors.New("Lock delay and TTL must be positive")` |
| `errInvalidTTL` | `errors.New("TTL must be between 10 seconds and 24 hours")` |
| `validVariablePath` | `regexp.MustCompile("^[a-zA-Z0-9-_~/]{1,128}$")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Equal` | `vl *VariableLock` | `vl2 *VariableLock` | `bool` | [L141](file:///d:/claude/nomad/nomad/structs/variables.go#L141) |
| `MarshalJSON` | `vl *VariableLock` | - | `[]byte, error` | [L159](file:///d:/claude/nomad/nomad/structs/variables.go#L159) |
| `UnmarshalJSON` | `vl *VariableLock` | `data []byte` | `err error` | [L183](file:///d:/claude/nomad/nomad/structs/variables.go#L183) |
| `Copy` | `vl *VariableLock` | - | `*VariableLock` | [L230](file:///d:/claude/nomad/nomad/structs/variables.go#L230) |
| `Canonicalize` | `vl *VariableLock` | - | - | [L241](file:///d:/claude/nomad/nomad/structs/variables.go#L241) |
| `Validate` | `vl *VariableLock` | - | `error` | [L256](file:///d:/claude/nomad/nomad/structs/variables.go#L256) |
| `Size` | `vi *VariableItems` | - | `uint64` | [L270](file:///d:/claude/nomad/nomad/structs/variables.go#L270) |
| `Equal` | `vd *VariableDecrypted` | `v2 VariableDecrypted` | `bool` | [L280](file:///d:/claude/nomad/nomad/structs/variables.go#L280) |
| `Equal` | `sv *VariableMetadata` | `vm2 VariableMetadata` | `bool` | [L287](file:///d:/claude/nomad/nomad/structs/variables.go#L287) |
| `Equal` | `vi *VariableItems` | `i2 VariableItems` | `bool` | [L311](file:///d:/claude/nomad/nomad/structs/variables.go#L311) |
| `Equal` | `ve *VariableEncrypted` | `v2 VariableEncrypted` | `bool` | [L317](file:///d:/claude/nomad/nomad/structs/variables.go#L317) |
| `Equal` | `vd *VariableData` | `d2 VariableData` | `bool` | [L324](file:///d:/claude/nomad/nomad/structs/variables.go#L324) |
| `Copy` | `vd *VariableDecrypted` | - | `VariableDecrypted` | [L329](file:///d:/claude/nomad/nomad/structs/variables.go#L329) |
| `Copy` | `vi *VariableItems` | - | `VariableItems` | [L336](file:///d:/claude/nomad/nomad/structs/variables.go#L336) |
| `Copy` | `ve *VariableEncrypted` | - | `VariableEncrypted` | [L344](file:///d:/claude/nomad/nomad/structs/variables.go#L344) |
| `Copy` | `vd *VariableData` | - | `VariableData` | [L351](file:///d:/claude/nomad/nomad/structs/variables.go#L351) |
| `Validate` | `vd *VariableDecrypted` | - | `error` | [L369](file:///d:/claude/nomad/nomad/structs/variables.go#L369) |
| `ValidateForLock` | `vd *VariableDecrypted` | - | `error` | [L396](file:///d:/claude/nomad/nomad/structs/variables.go#L396) |
| `ValidatePath` | - | `path string` | `error` | [L414](file:///d:/claude/nomad/nomad/structs/variables.go#L414) |
| `Canonicalize` | `vd *VariableDecrypted` | - | - | [L449](file:///d:/claude/nomad/nomad/structs/variables.go#L449) |
| `Copy` | `sv *VariableMetadata` | - | `*VariableMetadata` | [L461](file:///d:/claude/nomad/nomad/structs/variables.go#L461) |
| `GetNamespace` | `sv *VariableMetadata` | - | `string` | [L477](file:///d:/claude/nomad/nomad/structs/variables.go#L477) |
| `GetID` | `sv *VariableMetadata` | - | `string` | [L482](file:///d:/claude/nomad/nomad/structs/variables.go#L482) |
| `GetCreateIndex` | `sv *VariableMetadata` | - | `uint64` | [L487](file:///d:/claude/nomad/nomad/structs/variables.go#L487) |
| `LockID` | `sv *VariableMetadata` | - | `string` | [L493](file:///d:/claude/nomad/nomad/structs/variables.go#L493) |
| `IsLock` | `sv *VariableMetadata` | - | `bool` | [L502](file:///d:/claude/nomad/nomad/structs/variables.go#L502) |
| `Copy` | `svq *VariablesQuota` | - | `*VariablesQuota` | [L516](file:///d:/claude/nomad/nomad/structs/variables.go#L516) |
| `IsOk` | `r *VariablesApplyResponse` | - | `bool` | [L574](file:///d:/claude/nomad/nomad/structs/variables.go#L574) |
| `IsConflict` | `r *VariablesApplyResponse` | - | `bool` | [L578](file:///d:/claude/nomad/nomad/structs/variables.go#L578) |
| `IsError` | `r *VariablesApplyResponse` | - | `bool` | [L582](file:///d:/claude/nomad/nomad/structs/variables.go#L582) |
| `IsRedacted` | `r *VariablesApplyResponse` | - | `bool` | [L586](file:///d:/claude/nomad/nomad/structs/variables.go#L586) |
| `ErrorResponse` | `r *VarApplyStateRequest` | `raftIndex uint64, err error` | `*VarApplyStateResponse` | [L607](file:///d:/claude/nomad/nomad/structs/variables.go#L607) |
| `SuccessResponse` | `r *VarApplyStateRequest` | `raftIndex uint64, meta *VariableMetadata` | `*VarApplyStateResponse` | [L616](file:///d:/claude/nomad/nomad/structs/variables.go#L616) |
| `ConflictResponse` | `r *VarApplyStateRequest` | `raftIndex uint64, cv *VariableEncrypted` | `*VarApplyStateResponse` | [L625](file:///d:/claude/nomad/nomad/structs/variables.go#L625) |
| `IsOk` | `r *VarApplyStateResponse` | - | `bool` | [L640](file:///d:/claude/nomad/nomad/structs/variables.go#L640) |
| `IsConflict` | `r *VarApplyStateResponse` | - | `bool` | [L644](file:///d:/claude/nomad/nomad/structs/variables.go#L644) |
| `IsError` | `r *VarApplyStateResponse` | - | `bool` | [L648](file:///d:/claude/nomad/nomad/structs/variables.go#L648) |
| `Validate` | `v *VariablesRenewLockRequest` | - | `error` | [L684](file:///d:/claude/nomad/nomad/structs/variables.go#L684) |

## 5. 核心方法详解

### Validate()

**签名**：`func (vl *VariableLock) Validate() error`

**位置**：[L256](file:///d:/claude/nomad/nomad/structs/variables.go#L256)

### Validate()

**签名**：`func (vd *VariableDecrypted) Validate() error`

**位置**：[L369](file:///d:/claude/nomad/nomad/structs/variables.go#L369)

### GetNamespace()

**签名**：`func (sv *VariableMetadata) GetNamespace() string`

**位置**：[L477](file:///d:/claude/nomad/nomad/structs/variables.go#L477)

### GetID()

**签名**：`func (sv *VariableMetadata) GetID() string`

**位置**：[L482](file:///d:/claude/nomad/nomad/structs/variables.go#L482)

### GetCreateIndex()

**签名**：`func (sv *VariableMetadata) GetCreateIndex() uint64`

**位置**：[L487](file:///d:/claude/nomad/nomad/structs/variables.go#L487)

### Validate()

**签名**：`func (v *VariablesRenewLockRequest) Validate() error`

**位置**：[L684](file:///d:/claude/nomad/nomad/structs/variables.go#L684)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `encoding/json` | 标准库 |
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `reflect` | 标准库 |
| `regexp` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper/uuid` | 内部包 |
| `github.com/hashicorp/go-multierror` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [variables_test.go](file:///d:/claude/nomad/nomad/structs/variables_test.go) | 对应测试文件 |

