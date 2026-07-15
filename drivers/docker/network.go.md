# network.go 代码说明文档

> 文件路径：[drivers/docker/network.go](file:///d:/claude/nomad/drivers/docker/network.go)
> 总行数：235 行
> 所属包：`docker`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Docker 驱动子包**（`drivers/docker`），实现 Nomad 的 Docker 任务驱动，通过 Docker API 管理容器的生命周期（创建、启动、停止、销毁）、资源限制、网络配置和日志收集。支持 Docker API 版本协商、认证、健康检查和统计信息收集。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `dockerNetSpecLabelKey` | `"docker_sandbox_container_id"` |
| `dockerNetSpecHostnameKey` | `"docker_sandbox_hostname"` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `CreateNetwork` | `d *Driver` | `allocID string, createSpec *drivers.NetworkCreateRequest` | `*drivers.NetworkIsolationSpec, bool, error` | [L30](file:///d:/claude/nomad/drivers/docker/network.go#L30) |
| `DestroyNetwork` | `d *Driver` | `allocID string, spec *drivers.NetworkIsolationSpec` | `error` | [L96](file:///d:/claude/nomad/drivers/docker/network.go#L96) |
| `createSandboxContainerConfig` | `d *Driver` | `allocID string, createSpec *drivers.NetworkCreateRequest` | `*createContainerOptions, error` | [L161](file:///d:/claude/nomad/drivers/docker/network.go#L161) |
| `pullInfraImage` | `d *Driver` | `allocID string` | `error` | [L187](file:///d:/claude/nomad/drivers/docker/network.go#L187) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/moby/moby/api/types/container` | 第三方库 |
| `github.com/moby/moby/api/types/container` | 第三方库 |
| `github.com/moby/moby/client` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [network_test.go](file:///d:/claude/nomad/drivers/docker/network_test.go) | 对应测试文件 |

