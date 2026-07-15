# sdnotify.go 代码说明文档

> 文件路径：[sdnotify.go](file:///d:/claude/nomad/command/agent/sdnotify.go)
> 总行数：13 行
> 所属包：`agent`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件实现 **systemd 通知**（sd_notify 协议），用于向 systemd 报告 Agent 状态（READY/RELOADING/STOPPING）。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `sdReady` | `"READY=1"` |
| `sdStopping` | `"STOPPING=1"` |

## 4. 方法与函数

该文件未定义方法。

## 5. 核心方法详解

## 6. 依赖关系

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Agent 包的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [agent.go](file:///d:/claude/nomad/command/agent/agent.go) | Agent 核心实现 |
| [http.go](file:///d:/claude/nomad/command/agent/http.go) | HTTP 服务器实现 |
| [config.go](file:///d:/claude/nomad/command/agent/config.go) | 配置定义 |

