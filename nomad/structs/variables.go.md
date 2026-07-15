# variables.go 代码说明文档

> 文件路径：[nomad/structs/variables.go](file:///d:/claude/nomad/nomad/structs/variables.go)
> 总行数：703 行
> 所属包：`structs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 `structs` 包，定义结构体类型、包含 38 个方法/函数。

## 2. 类型定义

### VariableMetadata

**定义位置**：[L82](file:///d:/claude/nomad/nomad/structs/variables.go#L82)

**中文说明**：VariableMetadata 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type VariableMetadata struct {
	Namespace string
	Path string
	Lock *VariableLock `json:",omitempty"`
	CreateIndex uint64
	CreateTime int64
	ModifyIndex uint64
	ModifyTime int64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string` | 命名空间 |
| `Path` | `string` | 路径 |
| `Lock` | `*VariableLock `json:",omitempty"`` | 互斥锁，保护并发访问 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `CreateTime` | `int64` | — |
| `ModifyIndex` | `uint64` | 索引值（uint64） |
| `ModifyTime` | `int64` | — |

**关联方法**（7 个）：`Equal`, `Copy`, `GetNamespace`, `GetID`, `GetCreateIndex`, `LockID`, `IsLock`

### VariableEncrypted

**定义位置**：[L97](file:///d:/claude/nomad/nomad/structs/variables.go#L97)

**中文说明**：VariableEncrypted 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type VariableEncrypted struct {
	VariableMetadata VariableMetadata
	VariableData VariableData
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VariableMetadata` | `VariableMetadata` | — |
| `VariableData` | `VariableData` | — |

**关联方法**（2 个）：`Equal`, `Copy`

### VariableData

**定义位置**：[L103](file:///d:/claude/nomad/nomad/structs/variables.go#L103)

**中文说明**：VariableData 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type VariableData struct {
	Data []byte
	KeyID string
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Data` | `[]byte` | 数据 |
| `KeyID` | `string` | 字符串 |

**关联方法**（2 个）：`Equal`, `Copy`

### VariableDecrypted

**定义位置**：[L111](file:///d:/claude/nomad/nomad/structs/variables.go#L111)

**中文说明**：VariableDecrypted 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type VariableDecrypted struct {
	VariableMetadata VariableMetadata
	Items VariableItems `json:",omitempty"`
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VariableMetadata` | `VariableMetadata` | — |
| `Items` | `VariableItems `json:",omitempty"`` | — |

**关联方法**（5 个）：`Equal`, `Copy`, `Validate`, `ValidateForLock`, `Canonicalize`

### VariableItems

**定义位置**：[L118](file:///d:/claude/nomad/nomad/structs/variables.go#L118)

**类型定义**：`type VariableItems map[string]string`

**关联方法**（3 个）：`Size`, `Equal`, `Copy`

### VariableLock

**定义位置**：[L122](file:///d:/claude/nomad/nomad/structs/variables.go#L122)

**中文说明**：VariableLock 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type VariableLock struct {
	ID string
	TTL time.Duration
	LockDelay time.Duration
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `ID` | `string` | 唯一标识符 |
| `TTL` | `time.Duration` | 生存时间（TTL） |
| `LockDelay` | `time.Duration` | 时间间隔 |

**关联方法**（6 个）：`Equal`, `MarshalJSON`, `UnmarshalJSON`, `Copy`, `Canonicalize`, `Validate`

### VariablesQuota

**定义位置**：[L509](file:///d:/claude/nomad/nomad/structs/variables.go#L509)

**中文说明**：VariablesQuota 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type VariablesQuota struct {
	Namespace string
	Size int64
	CreateIndex uint64
	ModifyIndex uint64
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Namespace` | `string` | 命名空间 |
| `Size` | `int64` | 大小 |
| `CreateIndex` | `uint64` | 索引值（uint64） |
| `ModifyIndex` | `uint64` | 索引值（uint64） |

**关联方法**（1 个）：`Copy`

### VarOp

**定义位置**：[L529](file:///d:/claude/nomad/nomad/structs/variables.go#L529)

**类型定义**：`type VarOp string`

### VarOpResult

**定义位置**：[L547](file:///d:/claude/nomad/nomad/structs/variables.go#L547)

**中文说明**：VarOpResult 是一个结果结构体，封装操作执行的结果。

**类型定义**：`type VarOpResult string`

### VariablesApplyRequest

**定义位置**：[L557](file:///d:/claude/nomad/nomad/structs/variables.go#L557)

**中文说明**：VariablesApplyRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type VariablesApplyRequest struct {
	Op VarOp
	Var *VariableDecrypted
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Op` | `VarOp` | — |
| `Var` | `*VariableDecrypted` | — |
| `WriteRequest` | `WriteRequest` | — |

### VariablesApplyResponse

**定义位置**：[L564](file:///d:/claude/nomad/nomad/structs/variables.go#L564)

**中文说明**：VariablesApplyResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type VariablesApplyResponse struct {
	Op VarOp
	Input *VariableDecrypted
	Result VarOpResult
	Error error
	Conflict *VariableDecrypted
	Output *VariableDecrypted
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Op` | `VarOp` | — |
| `Input` | `*VariableDecrypted` | — |
| `Result` | `VarOpResult` | 结果 |
| `Error` | `error` | 错误 如果 任意 |
| `Conflict` | `*VariableDecrypted` | — |
| `Output` | `*VariableDecrypted` | — |
| `WriteMeta` | `WriteMeta` | — |

**关联方法**（4 个）：`IsOk`, `IsConflict`, `IsError`, `IsRedacted`

### VarApplyStateRequest

**定义位置**：[L591](file:///d:/claude/nomad/nomad/structs/variables.go#L591)

**中文说明**：VarApplyStateRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type VarApplyStateRequest struct {
	Op VarOp
	Var *VariableEncrypted
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Op` | `VarOp` | — |
| `Var` | `*VariableEncrypted` | — |
| `WriteRequest` | `WriteRequest` | — |

**关联方法**（3 个）：`ErrorResponse`, `SuccessResponse`, `ConflictResponse`

### VarApplyStateResponse

**定义位置**：[L598](file:///d:/claude/nomad/nomad/structs/variables.go#L598)

**中文说明**：VarApplyStateResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type VarApplyStateResponse struct {
	Op VarOp
	Result VarOpResult
	Error error
	Conflict *VariableEncrypted
	WrittenSVMeta *VariableMetadata
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Op` | `VarOp` | — |
| `Result` | `VarOpResult` | 结果 |
| `Error` | `error` | 错误 如果 任意 |
| `Conflict` | `*VariableEncrypted` | — |
| `WrittenSVMeta` | `*VariableMetadata` | — |
| `WriteMeta` | `WriteMeta` | — |

**关联方法**（3 个）：`IsOk`, `IsConflict`, `IsError`

### VariablesListRequest

**定义位置**：[L654](file:///d:/claude/nomad/nomad/structs/variables.go#L654)

**中文说明**：VariablesListRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type VariablesListRequest struct {
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `QueryOptions` | `QueryOptions` | — |

### VariablesListResponse

**定义位置**：[L658](file:///d:/claude/nomad/nomad/structs/variables.go#L658)

**中文说明**：VariablesListResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type VariablesListResponse struct {
	Data []*VariableMetadata
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Data` | `[]*VariableMetadata` | 数据 |
| `QueryMeta` | `QueryMeta` | — |

### VariablesReadRequest

**定义位置**：[L663](file:///d:/claude/nomad/nomad/structs/variables.go#L663)

**中文说明**：VariablesReadRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type VariablesReadRequest struct {
	Path string
	QueryOptions QueryOptions
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Path` | `string` | 路径 |
| `QueryOptions` | `QueryOptions` | — |

### VariablesReadResponse

**定义位置**：[L668](file:///d:/claude/nomad/nomad/structs/variables.go#L668)

**中文说明**：VariablesReadResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type VariablesReadResponse struct {
	Data *VariableDecrypted
	QueryMeta QueryMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Data` | `*VariableDecrypted` | 数据 |
| `QueryMeta` | `QueryMeta` | — |

### VariablesRenewLockRequest

**定义位置**：[L676](file:///d:/claude/nomad/nomad/structs/variables.go#L676)

**中文说明**：VariablesRenewLockRequest 是一个请求结构体，封装 API 请求的参数。

**类型**：struct

```go
type VariablesRenewLockRequest struct {
	Path string
	LockID string
	WriteRequest WriteRequest
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `Path` | `string` | 路径 |
| `LockID` | `string` | 字符串 |
| `WriteRequest` | `WriteRequest` | — |

**关联方法**（1 个）：`Validate`

### VariablesRenewLockResponse

**定义位置**：[L699](file:///d:/claude/nomad/nomad/structs/variables.go#L699)

**中文说明**：VariablesRenewLockResponse 是一个响应结构体，封装 API 响应的数据。

**类型**：struct

```go
type VariablesRenewLockResponse struct {
	VarMeta *VariableMetadata
	WriteMeta WriteMeta
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `VarMeta` | `*VariableMetadata` | — |
| `WriteMeta` | `WriteMeta` | — |

## 3. 常量与变量

### 常量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `VariablesApplyRPCMethod` | `—` | `"Variables.Apply"` | — |
| `VariablesListRPCMethod` | `—` | `"Variables.List"` | — |
| `VariablesReadRPCMethod` | `—` | `"Variables.Read"` | — |
| `VariablesRenewLockRPCMethod` | `—` | `"Variables.RenewLock"` | — |
| `maxVariableSize` | `—` | `65536` | — |
| `minVariableLockTTL` | `—` | `10 * time.Second` | — |
| `maxVariableLockTTL` | `—` | `24 * time.Hour` | — |
| `defaultLockTTL` | `—` | `15 * time.Second` | — |
| `defaultLockDelay` | `—` | `15 * time.Second` | — |
| `VarOpSet` | `VarOp` | `"set"` | — |
| `VarOpDelete` | `VarOp` | `"delete"` | — |
| `VarOpDeleteCAS` | `VarOp` | `"delete-cas"` | — |
| `VarOpCAS` | `VarOp` | `"cas"` | — |
| `VarOpLockAcquire` | `VarOp` | `"lock-acquire"` | — |
| `VarOpLockRelease` | `VarOp` | `"lock-release"` | — |
| `VarOpResultOk` | `VarOpResult` | `"ok"` | — |
| `VarOpResultConflict` | `VarOpResult` | `"conflict"` | — |
| `VarOpResultRedacted` | `VarOpResult` | `"conflict-redacted"` | — |
| `VarOpResultError` | `VarOpResult` | `"error"` | — |

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `errNoPath` | `—` | `errors.New("missing path")` | — |
| `errNoNamespace` | `—` | `errors.New("missing namespace")` | — |
| `errNoLock` | `—` | `errors.New("missing lock ID")` | — |
| `errWildCardNamespace` | `—` | `errors.New("can not target wildcard (\"*\")namespace")` | — |
| `errQuotaExhausted` | `—` | `errors.New("variables are limited to 64KiB in total size")` | — |
| `errNegativeDelayOrTTL` | `—` | `errors.New("Lock delay and TTL must be positive")` | — |
| `errInvalidTTL` | `—` | `errors.New("TTL must be between 10 seconds and 24 hours")` | — |
| `validVariablePath` | `—` | `regexp.MustCompile("^[a-zA-Z0-9-_~/]{1,128}$")` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Equal` | `vl *VariableLock` | `vl2 *VariableLock` | `bool` | [L141](file:///d:/claude/nomad/nomad/structs/variables.go#L141) |
| `MarshalJSON` | `vl *VariableLock` | `` | `[]byte, error` | [L159](file:///d:/claude/nomad/nomad/structs/variables.go#L159) |
| `UnmarshalJSON` | `vl *VariableLock` | `data []byte` | `err error` | [L183](file:///d:/claude/nomad/nomad/structs/variables.go#L183) |
| `Copy` | `vl *VariableLock` | `` | `*VariableLock` | [L230](file:///d:/claude/nomad/nomad/structs/variables.go#L230) |
| `Canonicalize` | `vl *VariableLock` | `` | `` | [L241](file:///d:/claude/nomad/nomad/structs/variables.go#L241) |
| `Validate` | `vl *VariableLock` | `` | `error` | [L256](file:///d:/claude/nomad/nomad/structs/variables.go#L256) |
| `Size` | `vi *VariableItems` | `` | `uint64` | [L270](file:///d:/claude/nomad/nomad/structs/variables.go#L270) |
| `Equal` | `vd *VariableDecrypted` | `v2 VariableDecrypted` | `bool` | [L280](file:///d:/claude/nomad/nomad/structs/variables.go#L280) |
| `Equal` | `sv *VariableMetadata` | `vm2 VariableMetadata` | `bool` | [L287](file:///d:/claude/nomad/nomad/structs/variables.go#L287) |
| `Equal` | `vi *VariableItems` | `i2 VariableItems` | `bool` | [L311](file:///d:/claude/nomad/nomad/structs/variables.go#L311) |
| `Equal` | `ve *VariableEncrypted` | `v2 VariableEncrypted` | `bool` | [L317](file:///d:/claude/nomad/nomad/structs/variables.go#L317) |
| `Equal` | `vd *VariableData` | `d2 VariableData` | `bool` | [L324](file:///d:/claude/nomad/nomad/structs/variables.go#L324) |
| `Copy` | `vd *VariableDecrypted` | `` | `VariableDecrypted` | [L329](file:///d:/claude/nomad/nomad/structs/variables.go#L329) |
| `Copy` | `vi *VariableItems` | `` | `VariableItems` | [L336](file:///d:/claude/nomad/nomad/structs/variables.go#L336) |
| `Copy` | `ve *VariableEncrypted` | `` | `VariableEncrypted` | [L344](file:///d:/claude/nomad/nomad/structs/variables.go#L344) |
| `Copy` | `vd *VariableData` | `` | `VariableData` | [L351](file:///d:/claude/nomad/nomad/structs/variables.go#L351) |
| `Validate` | `vd *VariableDecrypted` | `` | `error` | [L369](file:///d:/claude/nomad/nomad/structs/variables.go#L369) |
| `ValidateForLock` | `vd *VariableDecrypted` | `` | `error` | [L396](file:///d:/claude/nomad/nomad/structs/variables.go#L396) |
| `ValidatePath` | - | `path string` | `error` | [L414](file:///d:/claude/nomad/nomad/structs/variables.go#L414) |
| `Canonicalize` | `vd *VariableDecrypted` | `` | `` | [L449](file:///d:/claude/nomad/nomad/structs/variables.go#L449) |
| `Copy` | `sv *VariableMetadata` | `` | `*VariableMetadata` | [L461](file:///d:/claude/nomad/nomad/structs/variables.go#L461) |
| `GetNamespace` | `sv *VariableMetadata` | `` | `string` | [L477](file:///d:/claude/nomad/nomad/structs/variables.go#L477) |
| `GetID` | `sv *VariableMetadata` | `` | `string` | [L482](file:///d:/claude/nomad/nomad/structs/variables.go#L482) |
| `GetCreateIndex` | `sv *VariableMetadata` | `` | `uint64` | [L487](file:///d:/claude/nomad/nomad/structs/variables.go#L487) |
| `LockID` | `sv *VariableMetadata` | `` | `string` | [L493](file:///d:/claude/nomad/nomad/structs/variables.go#L493) |
| `IsLock` | `sv *VariableMetadata` | `` | `bool` | [L502](file:///d:/claude/nomad/nomad/structs/variables.go#L502) |
| `Copy` | `svq *VariablesQuota` | `` | `*VariablesQuota` | [L516](file:///d:/claude/nomad/nomad/structs/variables.go#L516) |
| `IsOk` | `r *VariablesApplyResponse` | `` | `bool` | [L574](file:///d:/claude/nomad/nomad/structs/variables.go#L574) |
| `IsConflict` | `r *VariablesApplyResponse` | `` | `bool` | [L578](file:///d:/claude/nomad/nomad/structs/variables.go#L578) |
| `IsError` | `r *VariablesApplyResponse` | `` | `bool` | [L582](file:///d:/claude/nomad/nomad/structs/variables.go#L582) |
| `IsRedacted` | `r *VariablesApplyResponse` | `` | `bool` | [L586](file:///d:/claude/nomad/nomad/structs/variables.go#L586) |
| `ErrorResponse` | `r *VarApplyStateRequest` | `raftIndex uint64, err error` | `*VarApplyStateResponse` | [L607](file:///d:/claude/nomad/nomad/structs/variables.go#L607) |
| `SuccessResponse` | `r *VarApplyStateRequest` | `raftIndex uint64, meta *VariableMetadata` | `*VarApplyStateResponse` | [L616](file:///d:/claude/nomad/nomad/structs/variables.go#L616) |
| `ConflictResponse` | `r *VarApplyStateRequest` | `raftIndex uint64, cv *VariableEncrypted` | `*VarApplyStateResponse` | [L625](file:///d:/claude/nomad/nomad/structs/variables.go#L625) |
| `IsOk` | `r *VarApplyStateResponse` | `` | `bool` | [L640](file:///d:/claude/nomad/nomad/structs/variables.go#L640) |
| `IsConflict` | `r *VarApplyStateResponse` | `` | `bool` | [L644](file:///d:/claude/nomad/nomad/structs/variables.go#L644) |
| `IsError` | `r *VarApplyStateResponse` | `` | `bool` | [L648](file:///d:/claude/nomad/nomad/structs/variables.go#L648) |
| `Validate` | `v *VariablesRenewLockRequest` | `` | `error` | [L684](file:///d:/claude/nomad/nomad/structs/variables.go#L684) |

## 5. 核心方法详解

### Copy()

**签名**：`func (vl *VariableLock) Copy() *VariableLock`

**位置**：[L230](file:///d:/claude/nomad/nomad/structs/variables.go#L230)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*VariableLock` | — |

### Validate()

**签名**：`func (vl *VariableLock) Validate() error`

**位置**：[L256](file:///d:/claude/nomad/nomad/structs/variables.go#L256)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Copy()

**签名**：`func (vd *VariableDecrypted) Copy() VariableDecrypted`

**位置**：[L329](file:///d:/claude/nomad/nomad/structs/variables.go#L329)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `VariableDecrypted` | — |

### Copy()

**签名**：`func (vi *VariableItems) Copy() VariableItems`

**位置**：[L336](file:///d:/claude/nomad/nomad/structs/variables.go#L336)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `VariableItems` | — |

### Copy()

**签名**：`func (ve *VariableEncrypted) Copy() VariableEncrypted`

**位置**：[L344](file:///d:/claude/nomad/nomad/structs/variables.go#L344)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `VariableEncrypted` | — |

### Copy()

**签名**：`func (vd *VariableData) Copy() VariableData`

**位置**：[L351](file:///d:/claude/nomad/nomad/structs/variables.go#L351)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `VariableData` | — |

### Validate()

**签名**：`func (vd *VariableDecrypted) Validate() error`

**位置**：[L369](file:///d:/claude/nomad/nomad/structs/variables.go#L369)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

### Copy()

**签名**：`func (sv *VariableMetadata) Copy() *VariableMetadata`

**位置**：[L461](file:///d:/claude/nomad/nomad/structs/variables.go#L461)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*VariableMetadata` | — |

### Copy()

**签名**：`func (svq *VariablesQuota) Copy() *VariablesQuota`

**位置**：[L516](file:///d:/claude/nomad/nomad/structs/variables.go#L516)

**中文说明**：创建对象的副本。

**返回值**：

| 类型 | 说明 |
|------|------|
| `*VariablesQuota` | — |

### Validate()

**签名**：`func (v *VariablesRenewLockRequest) Validate() error`

**位置**：[L684](file:///d:/claude/nomad/nomad/structs/variables.go#L684)

**中文说明**：验证对象的有效性。

**返回值**：

| 类型 | 说明 |
|------|------|
| `error` | 错误信息 |

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
- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [variables_test.go](file:///d:/claude/nomad/nomad/structs/variables_test.go) | 对应测试文件 |
| [acl.go](file:///d:/claude/nomad/nomad/structs/acl.go) | 同目录源文件 |
| [actions.go](file:///d:/claude/nomad/nomad/structs/actions.go) | 同目录源文件 |
| [alloc.go](file:///d:/claude/nomad/nomad/structs/alloc.go) | 同目录源文件 |
| [autopilot.go](file:///d:/claude/nomad/nomad/structs/autopilot.go) | 同目录源文件 |
| [batch_future.go](file:///d:/claude/nomad/nomad/structs/batch_future.go) | 同目录源文件 |

