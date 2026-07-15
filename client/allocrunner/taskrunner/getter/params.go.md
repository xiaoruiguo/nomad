# params.go 代码说明文档

> 文件路径：[allocrunner/taskrunner/getter/params.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/params.go)
> 总行数：197 行
> 所属包：`getter`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Artifact 下载子包**（`client/allocrunner/taskrunner/getter`），实现任务 artifact 的下载和校验功能。

## 2. 类型定义

### parameters

**定义位置**：[L24](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/params.go#L24)

**类型**：struct

```go
	HTTPReadTimeout time.Duration `json:"http_read_timeout"`
	HTTPMaxBytes int64 `json:"http_max_bytes"`
	GCSTimeout time.Duration `json:"gcs_timeout"`
	GitTimeout time.Duration `json:"git_timeout"`
	HgTimeout time.Duration `json:"hg_timeout"`
	S3Timeout time.Duration `json:"s3_timeout"`
	DecompressionLimitFileCount int `json:"decompression_limit_file_count"`
	DecompressionLimitSize int64 `json:"decompression_limit_size"`
	DisableArtifactInspection bool `json:"disable_artifact_inspection"`
	DisableFilesystemIsolation bool `json:"disable_filesystem_isolation"`
	FilesystemIsolationExtraPaths []string `json:"filesystem_isolation_extra_paths"`
	SetEnvironmentVariables string `json:"set_environment_variables"`
	Mode getter.ClientMode `json:"artifact_mode"`
	Insecure bool `json:"artifact_insecure"`
	Source string `json:"artifact_source"`
	Destination string `json:"artifact_destination"`
	Headers map[string][]string `json:"artifact_headers"`
	AllocDir string `json:"alloc_dir"`
	TaskDir string `json:"task_dir"`
	User string `json:"user"`
	Chown bool `json:"chown"`
```

**关联方法**（5 个）：`reader`, `read`, `deadline`, `Equal`, `client`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `umask` | `fs.ModeSetuid \| fs.ModeSetgid` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `reader` | `p *parameters` | - | `io.Reader` | [L53](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/params.go#L53) |
| `read` | `p *parameters` | `r io.Reader` | `error` | [L61](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/params.go#L61) |
| `deadline` | `p *parameters` | - | `time.Duration` | [L70](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/params.go#L70) |
| `Equal` | `p *parameters` | `o *parameters` | `bool` | [L82](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/params.go#L82) |
| `headersCompareFn` | - | `a []string, b []string` | `bool` | [L129](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/params.go#L129) |
| `client` | `p *parameters` | `ctx context.Context` | `*getter.Client` | [L141](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/params.go#L141) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `context` | 标准库 |
| `encoding/json` | 标准库 |
| `io` | 标准库 |
| `io/fs` | 标准库 |
| `maps` | 标准库 |
| `slices` | 标准库 |
| `strings` | 标准库 |
| `time` | 标准库 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/go-getter` | 第三方库 |

## 7. 设计模式与技术特点

- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制
- **结构标签**：使用 `json`/`hcl` 结构标签支持序列化和配置解析

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [params_test.go](file:///d:/claude/nomad/client/allocrunner/taskrunner/getter/params_test.go) | 对应测试文件 |

