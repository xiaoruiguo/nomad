# util.go 代码说明文档

> 文件路径：[taskenv/util.go](file:///d:/claude/nomad/client/taskenv/util.go)
> 总行数：129 行
> 所属包：`taskenv`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务环境子包**（`client/taskenv`），构建任务的环境变量（节点属性、元数据、服务发现等）。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 变量

| 名称 | 值 |
|------|----|
| `ErrInvalidObjectPath` | `errors.New("invalid object path")` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `addNestedKey` | - | `dst map[string]interface{}, k string, v string` | `error` | [L29](file:///d:/claude/nomad/client/taskenv/util.go#L29) |
| `ctyify` | - | `src map[string]interface{}` | `map[string]cty.Value, error` | [L104](file:///d:/claude/nomad/client/taskenv/util.go#L104) |

## 5. 核心方法详解

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `errors` | 标准库 |
| `fmt` | 标准库 |
| `strings` | 标准库 |
| `github.com/zclconf/go-cty/cty` | 第三方库 |

## 7. 设计模式与技术特点

- 遵循 Go 标准代码组织规范，作为 Nomad Client 的一部分

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [util_test.go](file:///d:/claude/nomad/client/taskenv/util_test.go) | 对应测试文件 |

