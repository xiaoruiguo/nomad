# copydir.go 代码说明文档

> 文件路径：[escapingfs/copydir.go](file:///d:/claude/nomad/helper/escapingfs/copydir.go)
> 总行数：59 行
> 所属包：`escapingfs`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **文件系统逃逸防护子包**（`helper/escapingfs`），实现文件系统路径逃逸检测和防护，防止路径遍历攻击，确保文件操作限制在指定目录内。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

该文件未定义顶级常量或变量。

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `CopyDir` | - | `src string, dst string` | `error` | [L17](file:///d:/claude/nomad/helper/escapingfs/copydir.go#L17) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `io` | 标准库 |
| `io/fs` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |

## 7. 设计模式与技术特点

- **IO 操作**：涉及文件或数据流的读写操作

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [copydir_test.go](file:///d:/claude/nomad/helper/escapingfs/copydir_test.go) | 对应测试文件 |

