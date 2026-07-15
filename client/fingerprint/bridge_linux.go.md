# bridge_linux.go 代码说明文档

> 文件路径：[fingerprint/bridge_linux.go](file:///d:/claude/nomad/client/fingerprint/bridge_linux.go)
> 总行数：129 行
> 所属包：`fingerprint`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`linux`

---

## 1. 文件定位与核心职责

该文件属于 **指纹采集子包**（`client/fingerprint`），实现节点能力检测（CPU、内存、网络、存储、Arch、Consul、Vault 等），向 Server 报告节点资源。是调度器决策的基础。

**平台特定实现**：此文件为 **Linux** 平台专用，通过 build tag 机制在编译时选择。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `bridgeKernelModuleName` | `"bridge"` |
| `dynamicModuleRe` | ``%s\s+.*$`` |
| `builtinModuleRe` | ``.+/%s.ko$`` |
| `dependsModuleRe` | ``.+/%s.ko(\.xz)?:.*$`` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `Fingerprint` | `f *BridgeFingerprint` | `req *FingerprintRequest, resp *FingerprintResponse` | `error` | [L28](file:///d:/claude/nomad/client/fingerprint/bridge_linux.go#L28) |
| `regexp` | `f *BridgeFingerprint` | `pattern string, module string` | `*regexp.Regexp` | [L51](file:///d:/claude/nomad/client/fingerprint/bridge_linux.go#L51) |
| `detect` | `f *BridgeFingerprint` | `module string` | `error` | [L55](file:///d:/claude/nomad/client/fingerprint/bridge_linux.go#L55) |
| `findDir` | `f *BridgeFingerprint` | `dirname string` | `error` | [L100](file:///d:/claude/nomad/client/fingerprint/bridge_linux.go#L100) |
| `searchFile` | `f *BridgeFingerprint` | `module string, filename string, re *regexp.Regexp` | `error` | [L108](file:///d:/claude/nomad/client/fingerprint/bridge_linux.go#L108) |

## 5. 核心方法详解

### Fingerprint()

**签名**：`func (f *BridgeFingerprint) Fingerprint(req *FingerprintRequest, resp *FingerprintResponse) error`

**位置**：[L28](file:///d:/claude/nomad/client/fingerprint/bridge_linux.go#L28)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bufio` | 标准库 |
| `fmt` | 标准库 |
| `os` | 标准库 |
| `regexp` | 标准库 |
| `strconv` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/go-multierror` | 第三方库 |
| `github.com/shirou/gopsutil/v3/host` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **平台特定实现**：通过 build tag 机制实现 Linux 平台支持

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [bridge_linux_test.go](file:///d:/claude/nomad/client/fingerprint/bridge_linux_test.go) | 对应测试文件 |

