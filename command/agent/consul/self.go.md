# self.go 代码说明文档

> 文件路径：[command/agent/consul/self.go](file:///d:/claude/nomad/command/agent/consul/self.go)
> 总行数：60 行
> 所属包：`consul`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Agent 命令子包**（`command/agent`），实现 `nomad agent` 命令，启动 Nomad Server 或 Client 进程。包含配置加载、HTTP/RPC 服务启动、信号处理和日志初始化等逻辑，是 Nomad 节点的启动入口。

## 2. 类型定义

### Self

**定义位置**：[L15](file:///d:/claude/nomad/command/agent/consul/self.go#L15)

**类型定义**：`type Self map[string]map[string]interface{}`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `SKU` | - | `info Self` | `string, bool` | [L17](file:///d:/claude/nomad/command/agent/consul/self.go#L17) |
| `Namespaces` | - | `info Self` | `bool` | [L36](file:///d:/claude/nomad/command/agent/consul/self.go#L36) |
| `feature` | - | `name string, info Self` | `bool` | [L47](file:///d:/claude/nomad/command/agent/consul/self.go#L47) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `strings` | 标准库 |
| `github.com/hashicorp/go-version` | 第三方库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [self_test.go](file:///d:/claude/nomad/command/agent/consul/self_test.go) | 对应测试文件 |
| [catalog_testing.go](file:///d:/claude/nomad/command/agent/consul/catalog_testing.go) | 同目录源文件 |
| [config_entries_testing.go](file:///d:/claude/nomad/command/agent/consul/config_entries_testing.go) | 同目录源文件 |
| [connect.go](file:///d:/claude/nomad/command/agent/consul/connect.go) | 同目录源文件 |
| [connect_proxies.go](file:///d:/claude/nomad/command/agent/consul/connect_proxies.go) | 同目录源文件 |
| [connect_proxies_testing.go](file:///d:/claude/nomad/command/agent/consul/connect_proxies_testing.go) | 同目录源文件 |

