# ports.go 代码说明文档

> 文件路径：[drivers/docker/ports.go](file:///d:/claude/nomad/drivers/docker/ports.go)
> 总行数：70 行
> 所属包：`docker`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Docker 驱动子包**（`drivers/docker`），实现 Nomad 的 Docker 任务驱动，通过 Docker API 管理容器的生命周期（创建、启动、停止、销毁）、资源限制、网络配置和日志收集。支持 Docker API 版本协商、认证、健康检查和统计信息收集。

## 2. 类型定义

### publishedPorts

**定义位置**：[L17](file:///d:/claude/nomad/drivers/docker/ports.go#L17)

**中文说明**：publishedPorts 是一个结构体，封装相关数据和状态。

**类型**：struct

```go
type publishedPorts struct {
	logger hclog.Logger
	publishedPorts map[nat.Port][]nat.PortBinding
	exposedPorts map[nat.Port]struct{...}
}
```

#### 字段说明表

| 字段名 | 类型 | 中文说明 |
|--------|------|----------|
| `logger` | `hclog.Logger` | 日志记录器 |
| `publishedPorts` | `map[nat.Port][]nat.PortBinding` | 映射表 |
| `exposedPorts` | `map[nat.Port]struct{...}` | 映射表 |

**关联方法**（2 个）：`addMapped`, `add`

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `newPublishedPorts` | - | `logger hclog.Logger` | `*publishedPorts` | [L23](file:///d:/claude/nomad/drivers/docker/ports.go#L23) |
| `addMapped` | `p *publishedPorts` | `label string, ip string, port int, portMap hclutils.MapStrInt` | `` | [L32](file:///d:/claude/nomad/drivers/docker/ports.go#L32) |
| `add` | `p *publishedPorts` | `label string, ip string, port int, to int` | `` | [L45](file:///d:/claude/nomad/drivers/docker/ports.go#L45) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `strconv` | 标准库 |
| `github.com/hashicorp/nomad/helper/pluginutils/hclutils` | 内部包 |
| `github.com/docker/go-connections/nat` | 第三方库 |
| `github.com/hashicorp/go-hclog` | 第三方库 |

## 7. 设计模式与技术特点

- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析
- **结构化日志**：使用 `hclog` 进行结构化日志记录
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期
- **Docker 集成**：与 Docker Engine API 交互，管理容器生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [ports_test.go](file:///d:/claude/nomad/drivers/docker/ports_test.go) | 对应测试文件 |
| [config.go](file:///d:/claude/nomad/drivers/docker/config.go) | 同目录源文件 |
| [coordinator.go](file:///d:/claude/nomad/drivers/docker/coordinator.go) | 同目录源文件 |
| [cpuset.go](file:///d:/claude/nomad/drivers/docker/cpuset.go) | 同目录源文件 |
| [driver.go](file:///d:/claude/nomad/drivers/docker/driver.go) | 同目录源文件 |
| [driver_default.go](file:///d:/claude/nomad/drivers/docker/driver_default.go) | 同目录源文件 |

