# utils.go 代码说明文档

> 文件路径：[drivers/java/utils.go](file:///d:/claude/nomad/drivers/java/utils.go)
> 总行数：81 行
> 所属包：`java`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **Java 驱动子包**（`drivers/java`），实现 Nomad 的 Java 任务驱动，通过 JVM 运行 Java 应用程序（jar 文件），支持 JVM 参数配置和进程管理。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `javaVersionCommand` | `—` | `[]string{...}` | — |
| `macOSJavaTestCommand` | `—` | `"/usr/libexec/java_home"` | — |
| `javaVersionRe` | `—` | `regexp.MustCompile(`([.\d_]+)`)` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `checkForMacJVM` | - | `` | `ok bool, err error` | [L18](file:///d:/claude/nomad/drivers/java/utils.go#L18) |
| `javaVersionInfo` | - | `` | `version string, runtime string, vm string, err error` | [L32](file:///d:/claude/nomad/drivers/java/utils.go#L32) |
| `parseJavaVersionOutput` | - | `infoString string` | `version string, runtime string, vm string` | [L60](file:///d:/claude/nomad/drivers/java/utils.go#L60) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `bytes` | 标准库 |
| `fmt` | 标准库 |
| `os/exec` | 标准库 |
| `regexp` | 标准库 |
| `runtime` | 标准库 |
| `strings` | 标准库 |

## 7. 设计模式与技术特点

- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [utils_test.go](file:///d:/claude/nomad/drivers/java/utils_test.go) | 对应测试文件 |
| [driver.go](file:///d:/claude/nomad/drivers/java/driver.go) | 同目录源文件 |
| [handle.go](file:///d:/claude/nomad/drivers/java/handle.go) | 同目录源文件 |
| [state.go](file:///d:/claude/nomad/drivers/java/state.go) | 同目录源文件 |

