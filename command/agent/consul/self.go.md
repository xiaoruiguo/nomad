# self.go 代码说明文档

> 文件路径：[consul/self.go](file:///d:/claude/nomad/command/agent/consul/self.go)
> 总行数：60 行
> 所属包：`consul`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Consul 集成子包**（`command/agent/consul`），负责 Nomad Agent 与 Consul 的服务注册、目录查询、Connect/服务网格、配置条目管理等集成功能。

## 2. 类型定义

### Self

**定义位置**：[L15](file:///d:/claude/nomad/command/agent/consul/self.go#L15)

**类型定义**：`map[string]map[string]interface{}`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `SKU` | - | `info Self` | `string, bool` | [L17](file:///d:/claude/nomad/command/agent/consul/self.go#L17) |
| `Namespaces` | - | `info Self` | `bool` | [L36](file:///d:/claude/nomad/command/agent/consul/self.go#L36) |
| `feature` | - | `name string, info Self` | `bool` | [L47](file:///d:/claude/nomad/command/agent/consul/self.go#L47) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `strings` | 标准库 |
| `github.com/hashicorp/go-version` | 第三方库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Agent 包的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [self_test.go](file:///d:/claude/nomad/command/agent/consul/self_test.go) | 对应测试文件 |
| [agent.go](file:///d:/claude/nomad/command/agent/agent.go) | Agent 核心实现 |
| [http.go](file:///d:/claude/nomad/command/agent/http.go) | HTTP 服务器实现 |
| [config.go](file:///d:/claude/nomad/command/agent/config.go) | 配置定义 |

