# memory.go 代码说明文档

> 文件路径：[lib/cgroupslib/memory.go](file:///d:/claude/nomad/client/lib/cgroupslib/memory.go)
> 总行数：41 行
> 所属包：`cgroupslib`
> 版权：Copyright IBM Corp. 2015, 2025
> 许可证：SPDX-License-Identifier: BUSL-1.1
> Build Tag：`linux`

---

## 1. 文件定位与核心职责

该文件属于 **cgroups 库子包**（`client/lib/cgroupslib`），封装 Linux cgroups 操作，用于资源限制和隔离。

**构建标签**：`linux`

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `disableMemorySwapOnce` | `` |
| `disableMemorySwap` | `` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `MaybeDisableMemorySwappiness` | - | - | `*uint64` | [L22](file:///d:/claude/nomad/client/lib/cgroupslib/memory.go#L22) |
| `detectMemorySwap` | - | - | `*uint64` | [L29](file:///d:/claude/nomad/client/lib/cgroupslib/memory.go#L29) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/helper/pointer` | 内部包 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [memory_test.go](file:///d:/claude/nomad/client/lib/cgroupslib/memory_test.go) | 对应测试文件 |

