# driver_compatible.go 代码说明文档

> 文件路径：[client/testutil/driver_compatible.go](file:///d:/claude/nomad/client/testutil/driver_compatible.go)
> 总行数：158 行
> 所属包：`testutil`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **客户端子包**（`client/`），实现 Nomad 客户端的功能组件。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `RequireRoot` | - | `t *testing.T` | `` | [L16](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L16) |
| `RequireNonRoot` | - | `t *testing.T` | `` | [L24](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L24) |
| `RequireAdministrator` | - | `t *testing.T` | `` | [L32](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L32) |
| `RequireConsul` | - | `t *testing.T` | `` | [L41](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L41) |
| `RequireVault` | - | `t *testing.T` | `` | [L50](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L50) |
| `RequireLinux` | - | `t *testing.T` | `` | [L59](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L59) |
| `RequireCILinux` | - | `t *testing.T` | `` | [L68](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L68) |
| `RequireNotWindows` | - | `t *testing.T` | `` | [L77](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L77) |
| `RequireWindows` | - | `t *testing.T` | `` | [L85](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L85) |
| `ExecCompatible` | - | `t *testing.T` | `` | [L94](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L94) |
| `JavaCompatible` | - | `t *testing.T` | `` | [L104](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L104) |
| `QemuCompatible_x86_64` | - | `t *testing.T` | `` | [L117](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L117) |
| `QemuCompatible_aarch64` | - | `t *testing.T` | `` | [L128](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L128) |
| `MountCompatible` | - | `t *testing.T` | `` | [L140](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L140) |
| `MinimumCores` | - | `t *testing.T, cores int` | `` | [L152](file:///d:/claude/nomad/client/testutil/driver_compatible.go#L152) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `os/exec` | 标准库 |
| `os/user` | 标准库 |
| `runtime` | 标准库 |
| `syscall` | 标准库 |
| `testing` | 标准库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [docker.go](file:///d:/claude/nomad/client/testutil/docker.go) | 同目录源文件 |
| [driver_compatible_default.go](file:///d:/claude/nomad/client/testutil/driver_compatible_default.go) | 同目录源文件 |
| [driver_compatible_linux.go](file:///d:/claude/nomad/client/testutil/driver_compatible_linux.go) | 同目录源文件 |
| [rpc.go](file:///d:/claude/nomad/client/testutil/rpc.go) | 同目录源文件 |

