# unix.go 代码说明文档

> 文件路径：[host/unix.go](file:///d:/claude/nomad/command/agent/host/unix.go)
> 总行数：100 行
> 所属包：`host`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`!windows`

---

## 1. 文件定位与核心职责

该文件属于 **主机信息子包**（`command/agent/host`），封装主机网络、操作系统相关的平台特定功能。

**构建标签**：`!windows`（仅在满足该 build tag 条件时编译）

## 2. 类型定义

### df

**定义位置**：[L56](file:///d:/claude/nomad/command/agent/host/unix.go#L56)

**类型**：struct

```go
	usage *disk.UsageStat
```

**关联方法**（2 个）：`total`, `available`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `uname` | - | - | `string` | [L17](file:///d:/claude/nomad/command/agent/host/unix.go#L17) |
| `etcHosts` | - | - | `string` | [L35](file:///d:/claude/nomad/command/agent/host/unix.go#L35) |
| `resolvConf` | - | - | `string` | [L39](file:///d:/claude/nomad/command/agent/host/unix.go#L39) |
| `nullStr` | - | `bs []byte` | `string` | [L43](file:///d:/claude/nomad/command/agent/host/unix.go#L43) |
| `makeDf` | - | `path string` | `*df, error` | [L60](file:///d:/claude/nomad/command/agent/host/unix.go#L60) |
| `total` | `d *df` | - | `uint64` | [L65](file:///d:/claude/nomad/command/agent/host/unix.go#L65) |
| `available` | `d *df` | - | `uint64` | [L69](file:///d:/claude/nomad/command/agent/host/unix.go#L69) |
| `mountedPaths` | - | - | `[]string` | [L74](file:///d:/claude/nomad/command/agent/host/unix.go#L74) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `strings` | 标准库 |
| `github.com/shirou/gopsutil/v3/disk` | 第三方库 |
| `golang.org/x/sys/unix` | 第三方库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Agent 包的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [agent.go](file:///d:/claude/nomad/command/agent/agent.go) | Agent 核心实现 |
| [http.go](file:///d:/claude/nomad/command/agent/http.go) | HTTP 服务器实现 |
| [config.go](file:///d:/claude/nomad/command/agent/config.go) | 配置定义 |

