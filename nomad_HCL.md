# Nomad HCL 领域驱动语言使用手册

> 本手册系统介绍 Nomad 的 HCL（HashiCorp Configuration Language）领域驱动语言实现、语法、内置函数、变量系统、解析流程与最佳实践。适用于 Nomad 作业规范（Job Specification）、节点池（Node Pool）、卷声明（Volume）等配置文件的编写。

---

## 目录

1. [HCL 实现架构](#1-hcl-实现架构)
2. [语法基础](#2-语法基础)
3. [Job 规范完整结构](#3-job-规范完整结构)
4. [变量系统](#4-变量系统)
5. [局部值 Locals](#5-局部值-locals)
6. [内置函数](#6-内置函数)
7. [动态块 Dynamic Blocks](#7-动态块-dynamic-blocks)
8. [插值与引用](#8-插值与引用)
9. [JSON 替代语法](#9-json-替代语法)
10. [解析流程详解](#10-解析流程详解)
11. [CLI 使用](#11-cli-使用)
12. [最佳实践](#12-最佳实践)
13. [完整示例](#13-完整示例)

---

## 1. HCL 实现架构

### 1.1 源码位置

Nomad 的 HCL 实现集中在 [`jobspec2/`](file:///d:/claude/nomad/jobspec2/) 包，基于 HashiCorp 的 [HCL v2](https://github.com/hashicorp/hcl) 规范构建。

| 文件 | 职责 |
|---|---|
| [`parse.go`](file:///d:/claude/nomad/jobspec2/parse.go) | 解析入口，提供 `Parse()`、`ParseWithConfig()`、`ParseWithConfigEx()` |
| [`parse_job.go`](file:///d:/claude/nomad/jobspec2/parse_job.go) | Job 规范的归一化处理（默认值填充、结构修正） |
| [`types.config.go`](file:///d:/claude/nomad/jobspec2/types.config.go) | `jobConfig` 结构、Schema 定义、变量/locals 解码、EvalContext 构建 |
| [`types.variables.go`](file:///d:/claude/nomad/jobspec2/types.variables.go) | 变量系统：声明、类型约束、校验、值收集（env/varfile/argv） |
| [`functions.go`](file:///d:/claude/nomad/jobspec2/functions.go) | 内置函数注册表（80+ 函数） |
| [`hcl_conversions.go`](file:///d:/claude/nomad/jobspec2/hcl_conversions.go) | HCL → Go 类型转换（duration、affinity、constraint 等自定义解码器） |
| [`parse_map.go`](file:///d:/claude/nomad/jobspec2/parse_map.go) | `map[string]interface{}` 字段的递归求值（用于 `meta`、driver `config` 等） |
| [`hclutil/blockattrs.go`](file:///d:/claude/nomad/jobspec2/hclutil/blockattrs.go) | 将 block 转为 attribute，支持 driver config 的任意嵌套结构 |
| [`addrs/`](file:///d:/claude/nomad/jobspec2/addrs/) | 引用地址解析（`var.X` 引用的语法树解析） |

### 1.2 核心依赖

```
github.com/hashicorp/hcl/v2          # HCL 核心解析库
github.com/zclconf/go-cty/cty        # HCL 的类型系统（cty = Config Type System）
github.com/hashicorp/go-cty-funcs    # 额外的 cty 函数（cidr、crypto、encoding 等）
github.com/hashicorp/hcl/v2/ext/dynblock  # 动态块扩展
github.com/hashicorp/hcl/v2/ext/tryfunc   # try/can 函数扩展
```

### 1.3 解析流水线

```
HCL/JSON 源文件
    │
    ▼
┌──────────────────────┐
│ parseHCLOrJSON()     │  判断 JSON 或 HCL，调用对应解析器
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ decode()             │  主解码流程
│  ├─ 解析 var 文件    │
│  ├─ decodeBody()     │
│  │   ├─ decodeInputVariables()   # 解析 variable 块
│  │   ├─ parseLocalVariables()    # 解析 locals 块
│  │   ├─ collectInputVariableValues()  # 收集 env/varfile/argv 值
│  │   ├─ evaluateLocalVariables()      # 求值 locals（含依赖解析）
│  │   └─ decodeJob()               # 解析 job 块 → api.Job
│  └─ decodeMapInterfaceType()      # 递归求值 map[string]interface{}
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ normalizeJob()       │  填充默认值、修正结构
└──────────┬───────────┘
           │
           ▼
       *api.Job
```

---

## 2. 语法基础

### 2.1 块（Block）

HCL 的核心组织单元，由类型、可选标签、花括号体组成：

```hcl
block_type "label1" "label2" {
  attribute = "value"
  nested_block {
    # ...
  }
}
```

- **块类型**：小写标识符（`job`、`group`、`task`）
- **标签**：字符串字面量，用于区分同类型块（如 `task "redis" {}`）
- **体**：花括号内的属性和嵌套块

### 2.2 属性（Attribute）

键值对，使用 `=` 赋值：

```hcl
driver = "docker"
count  = 3
ports  = ["http", "https"]
```

### 2.3 表达式（Expression）

HCL v2 支持丰富的表达式语法：

```hcl
# 字面量
count = 1
name  = "redis"
pi    = 3.14
flag  = true

# 集合
list  = ["a", "b", "c"]
map   = { key = "value", port = 8080 }

# 算术
total = 2 + 3 * 4
ratio = 100 / 7

# 字符串插值
msg = "Hello, ${var.name}!"
url = "http://${var.host}:${var.port}"

# 条件
mode = var.production ? "release" : "debug"

# 函数调用
upper_name = upper(var.name)
```

### 2.4 注释

```hcl
# 单行注释（推荐）
// 单行注释（C 风格）
/* 多行
   注释 */
```

### 2.5 类型系统

HCL 使用 `cty` 类型系统，变量可声明类型约束：

| HCL 类型 | 说明 | 示例 |
|---|---|---|
| `string` | 字符串 | `"hello"` |
| `number` | 数字（整数或浮点） | `42`, `3.14` |
| `bool` | 布尔 | `true` |
| `list(string)` | 字符串列表 | `["a", "b"]` |
| `set(number)` | 数字集合 | `[1, 2, 3]` |
| `map(string)` | 字符串映射 | `{ a = "x", b = "y" }` |
| `object({name = string, port = number})` | 对象 | `{ name = "redis", port = 6379 }` |
| `any` | 动态类型 | 任意值 |

---

## 3. Job 规范完整结构

### 3.1 顶层结构

```hcl
job "my-job" {           # 必须且仅有一个 job 块
  # 全局属性
  region     = "global"
  datacenters = ["dc1", "dc2"]
  namespace  = "default"
  type       = "service"  # service | system | batch | sysbatch

  # 全局块
  variable "name" { ... }   # 变量声明
  variables { ... }         # 简写变量声明
  locals { ... }            # 局部值
  vault { ... }             # 全局 Vault 配置
  secret "name" { ... }     # 全局 Secret 配置

  # 调度控制
  update { ... }
  migrate { ... }
  multiregion { ... }

  # 放置约束
  constraint { ... }
  affinity { ... }
  spread { ... }

  # 元数据
  meta = { key = "value" }
  ui { ... }

  # 任务组（必须至少一个）
  group "webs" { ... }
}
```

### 3.2 Group 块

```hcl
group "webs" {
  count = 3                # 实例数

  network {                # 网络配置
    mode = "bridge"        # bridge | host | none
    port "http" {
      static = 8080        # 静态端口
      to     = 80          # 容器内端口
    }
  }

  service { ... }          # 服务注册
  restart { ... }          # 重启策略
  ephemeral_disk { ... }   # 临时磁盘
  update { ... }           # 覆盖 job 级 update
  migrate { ... }
  constraint { ... }
  affinity { ... }
  spread { ... }
  meta = { ... }
  vault { ... }

  task "web" { ... }       # 任务（可多个）
}
```

### 3.3 Task 块

```hcl
task "web" {
  driver = "docker"        # 驱动：docker | exec | java | qemu | raw_exec

  config {                 # 驱动特定配置（任意嵌套）
    image = "nginx:latest"
    ports = ["http"]
    auth {
      username = "user"
      password = "pass"
    }
  }

  resources {              # 资源需求
    cpu    = 500           # MHz
    memory = 256           # MB
    cores  = 2             # 专用 CPU 核心（替代 cpu）
    device "nvidia/gpu/1080ti" { ... }
  }

  artifact {               # 下载制品
    source = "https://example.com/app.tar.gz"
  }

  template {               # 配置模板
    data        = "key: {{ key \"service/config\" }}"
    destination = "local/config.yml"
    change_mode = "signal"
    change_signal = "SIGHUP"
  }

  identity {               # 工作负载身份
    env  = true
    file = true
  }

  vault { ... }            # Vault 集成
  dispatch_payload { ... } # 派遣负载
  lifecycle { ... }        # 生命周期钩子
  logs { ... }             # 日志配置
  restart { ... }          # 任务级重启

  env { ... }              # 环境变量（部分驱动支持）
  meta = { ... }
}
```

### 3.4 常见子块速查

| 块 | 适用层级 | 用途 |
|---|---|---|
| `constraint` | job/group/task | 硬性放置约束 |
| `affinity` | job/group/task | 软性放置偏好（带 weight） |
| `spread` | job/group | 跨节点属性分散放置 |
| `update` | job/group | 滚动更新策略 |
| `migrate` | job/group | 节点迁移策略 |
| `restart` | group/task | 重启策略 |
| `network` | group | 网络模式与端口 |
| `service` | group/task | 服务注册与健康检查 |
| `check` | service | 健康检查定义 |
| `ephemeral_disk` | group | 临时磁盘配置 |
| `resources` | task | CPU/内存/设备需求 |
| `config` | task | 驱动特定配置 |
| `artifact` | task | 制品下载 |
| `template` | task | 配置模板渲染 |
| `identity` | task | 工作负载身份令牌 |
| `vault` | job/task | Vault 策略与令牌 |
| `logs` | task | 日志轮转配置 |
| `lifecycle` | task | 启动/预停止钩子 |
| `multiregion` | job | 多区域策略 |

---

## 4. 变量系统

Nomad HCL 支持参数化作业，通过变量实现配置复用。

### 4.1 声明变量

#### 完整形式（`variable` 块）

```hcl
variable "image_tag" {
  type        = string
  default     = "latest"
  description = "Docker image tag to deploy"
}

variable "ports" {
  type    = list(number)
  default = [8080, 8443]
}

variable "limits" {
  type = object({
    cpu    = number
    memory = number
  })
  default = {
    cpu    = 500
    memory = 256
  }
}
```

**支持的属性：**

| 属性 | 必需 | 说明 |
|---|---|---|
| `type` | 否 | 类型约束（省略则从 default 推断） |
| `default` | 否 | 默认值（未设置时使用） |
| `description` | 否 | 人类可读描述 |
| `validation` | 否 | 自定义校验规则（块） |

#### 简写形式（`variables` 块）

```hcl
variables {
  image_tag = "latest"
  replicas  = 3
}
```

> 注意：`variables` 块仅设置默认值，无法声明类型或校验。

### 4.2 变量校验

```hcl
variable "port" {
  type    = number
  default = 8080

  validation {
    condition     = var.port > 0 && var.port <= 65535
    error_message = "Port must be between 1 and 65535."
  }
}
```

校验规则：
- `condition` 必须引用 `var.<name>`（只能引用自身）
- `error_message` 必须是完整句子（大写开头，句号结尾）
- 求值为 `false` 时报错

### 4.3 赋值优先级

从低到高：

```
1. default（声明中的 default 属性）
2. 环境变量 NOMAD_VAR_<name>
3. -var-file 指定的文件
4. -var 参数
```

后设置的值覆盖前者。详见 [`types.variables.go: collectInputVariableValues()`](file:///d:/claude/nomad/jobspec2/types.variables.go)。

### 4.4 赋值方式

#### 环境变量

```bash
export NOMAD_VAR_image_tag="v1.2.3"
nomad job run app.nomad.hcl
```

#### 变量文件（`.nomad.vars` 或 `.hcl`）

```hcl
# vars.prod.hcl
image_tag = "v1.2.3"
replicas  = 5
```

```bash
nomad job run -var-file=vars.prod.hcl app.nomad.hcl
```

#### 命令行参数

```bash
nomad job run -var="image_tag=v1.2.3" -var="replicas=5" app.nomad.hcl
```

#### 多变量文件合并

```bash
nomad job run \
  -var-file=vars.base.hcl \
  -var-file=vars.prod.hcl \
  app.nomad.hcl
```

后指定的文件覆盖前者。

### 4.5 引用变量

```hcl
job "app" {
  group "webs" {
    count = var.replicas

    task "app" {
      driver = "docker"
      config {
        image = "myapp:${var.image_tag}"
      }
      resources {
        cpu    = var.limits.cpu
        memory = var.limits.memory
      }
    }
  }
}
```

---

## 5. 局部值 Locals

`locals` 块用于定义局部命名值，简化重复表达式。

### 5.1 声明

```hcl
locals {
  base_image = "myregistry.com/app"
  full_image = "${local.base_image}:${var.image_tag}"
  common_env = {
    LOG_LEVEL = var.production ? "info" : "debug"
    DATABASE  = "postgres://db:5432/myapp"
  }
}
```

### 5.2 引用

```hcl
task "app" {
  driver = "docker"
  config {
    image = local.full_image
  }
  env {
    for k, v in local.common_env : k => v
  }
}
```

### 5.3 依赖解析

locals 支持互相引用，解析器会自动处理依赖顺序。若存在循环依赖，重试 100 次后报错（见 [`types.config.go: evaluateLocalVariables()`](file:///d:/claude/nomad/jobspec2/types.config.go)）。

```hcl
locals {
  a = "prefix"
  b = "${local.a}-suffix"   # 依赖 local.a，自动求值顺序
  c = "${local.b}!"         # 链式依赖
}
```

---

## 6. 内置函数

Nomad HCL 内置 80+ 函数，定义于 [`functions.go`](file:///d:/claude/nomad/jobspec2/functions.go)。按类别分组：

### 6.1 字符串函数

| 函数 | 说明 | 示例 |
|---|---|---|
| `upper(s)` | 转大写 | `upper("abc")` → `"ABC"` |
| `lower(s)` | 转小写 | `lower("ABC")` → `"abc"` |
| `title(s)` | 首字母大写 | `title("hello world")` → `"Hello World"` |
| `trim(s, cutset)` | 去除首尾字符 | `trim("  hi  ", " ")` → `"hi"` |
| `trimspace(s)` | 去除首尾空白 | `trimspace("  hi  ")` → `"hi"` |
| `trimprefix(s, p)` | 去除前缀 | `trimprefix("v1.0", "v")` → `"1.0"` |
| `trimsuffix(s, s)` | 去除后缀 | `trimsuffix("file.txt", ".txt")` → `"file"` |
| `split(sep, s)` | 分割为列表 | `split(",", "a,b,c")` → `["a","b","c"]` |
| `join(sep, list)` | 列表连接 | `join("-", ["a","b"])` → `"a-b"` |
| `replace(s, old, new)` | 替换 | `replace("a.b.c", ".", "-")` → `"a-b-c"` |
| `regex_replace(s, pattern, replacement)` | 正则替换 | `regex_replace("hello123", "[0-9]+", "")` → `"hello"` |
| `substr(s, offset, length)` | 子串 | `substr("hello", 1, 3)` → `"ell"` |
| `strlen(s)` | 字符串长度 | `strlen("hello")` → `5` |
| `strrev(s)` | 反转字符串 | `strrev("abc")` → `"cba"` |
| `format(fmt, args...)` | 格式化 | `format("Hello, %s!", "World")` |
| `formatlist(fmt, list...)` | 列表格式化 | `formatlist("%v", [1,2,3])` |
| `indent(spaces, s)` | 缩进 | `indent(2, "line")` |
| `chomp(s)` | 去除行尾换行 | `chomp("line\n")` → `"line"` |
| `urlencode(s)` | URL 编码 | `urlencode("a b")` → `"a%20b"` |

### 6.2 集合函数

| 函数 | 说明 | 示例 |
|---|---|---|
| `length(x)` | 长度 | `length([1,2,3])` → `3` |
| `contains(list, value)` | 是否包含 | `contains(["a","b"], "a")` → `true` |
| `element(list, index)` | 按索引取值（循环） | `element(["a","b"], 2)` → `"a"` |
| `distinct(list)` | 去重 | `distinct([1,1,2])` → `[1,2]` |
| `flatten(list)` | 拍平嵌套列表 | `flatten([[1],[2]])` → `[1,2]` |
| `keys(map)` | 键列表 | `keys({a=1,b=2})` → `["a","b"]` |
| `values(map)` | 值列表 | `values({a=1,b=2})` → `[1,2]` |
| `merge(maps...)` | 合并 map | `merge({a=1},{b=2})` → `{a=1,b=2}` |
| `lookup(map, key, default)` | 查找带默认 | `lookup({a=1}, "b", 0)` → `0` |
| `zipmap(keys, values)` | 构建 map | `zipmap(["a"],[1])` → `{a=1}` |
| `concat(lists...)` | 连接列表 | `concat([1],[2])` → `[1,2]` |
| `compact(list)` | 去除空字符串 | `compact(["a","","b"])` → `["a","b"]` |
| `chunklist(list, size)` | 分块 | `chunklist([1,2,3,4], 2)` → `[[1,2],[3,4]]` |
| `slice(list, start, end)` | 切片 | `slice([1,2,3,4], 1, 3)` → `[2,3]` |
| `reverse(list)` | 反转 | `reverse([1,2,3])` → `[3,2,1]` |
| `sort(list)` | 排序 | `sort(["c","a","b"])` → `["a","b","c"]` |
| `coalesce(vals...)` | 返回第一个非空 | `coalesce("", "default")` → `"default"` |
| `coalescelist(lists...)` | 返回第一个非空列表 | |
| `setintersection(sets...)` | 集合交集 | |
| `setproduct(sets...)` | 集合笛卡尔积 | |
| `setunion(sets...)` | 集合并集 | |

### 6.3 数值函数

| 函数 | 说明 |
|---|---|
| `abs(x)` | 绝对值 |
| `ceil(x)` | 向上取整 |
| `floor(x)` | 向下取整 |
| `log(x, base)` | 对数 |
| `max(nums...)` | 最大值 |
| `min(nums...)` | 最小值 |
| `parseint(s, base)` | 字符串转整数 |
| `pow(x, y)` | 幂运算 |
| `signum(x)` | 符号函数（-1/0/1） |

### 6.4 编码函数

| 函数 | 说明 |
|---|---|
| `base64encode(s)` | Base64 编码 |
| `base64decode(s)` | Base64 解码 |
| `jsonencode(v)` | 编码为 JSON 字符串 |
| `jsondecode(s)` | 解码 JSON |
| `yamlencode(v)` | 编码为 YAML |
| `yamldecode(s)` | 解码 YAML |
| `csvdecode(s)` | 解码 CSV 为对象列表 |
| `urlencode(s)` | URL 编码 |

### 6.5 加密函数

| 函数 | 说明 |
|---|---|
| `md5(s)` | MD5 哈希 |
| `sha1(s)` | SHA1 哈希 |
| `sha256(s)` | SHA256 哈希 |
| `sha512(s)` | SHA512 哈希 |
| `bcrypt(s)` | bcrypt 哈希 |
| `rsadecrypt(ciphertext, key)` | RSA 解密 |

### 6.6 网络函数

| 函数 | 说明 | 示例 |
|---|---|---|
| `cidrhost(prefix, hostnum)` | CIDR 内主机 IP | `cidrhost("10.0.0.0/8", 5)` → `"10.0.0.5"` |
| `cidrnetmask(prefix)` | CIDR 子网掩码 | `cidrnetmask("10.0.0.0/8")` → `"255.0.0.0"` |
| `cidrsubnet(prefix, newbits, netnum)` | 子网 CIDR | `cidrsubnet("10.0.0.0/8", 8, 1)` → `"10.1.0.0/16"` |
| `cidrsubnets(prefix, newbits...)` | 多个子网 | `cidrsubnets("10.0.0.0/8", 8, 8)` → `["10.0.0.0/16","10.1.0.0/16"]` |

### 6.7 时间函数

| 函数 | 说明 |
|---|---|
| `formatdate(fmt, ts)` | 格式化时间戳 |
| `timeadd(ts, duration)` | 时间加法 |

### 6.8 UUID 函数

| 函数 | 说明 |
|---|---|
| `uuidv4()` | 随机 UUID v4 |
| `uuidv5(namespace, name)` | 命名 UUID v5 |

### 6.9 类型转换

| 函数 | 说明 |
|---|---|
| `convert(v, type)` | 类型转换（typeexpr） |

### 6.10 控制流

| 函数 | 说明 |
|---|---|
| `can(expr)` | 求值表达式，成功返回 `true`，错误返回 `false` |
| `try(expr1, expr2, ...)` | 依次尝试，返回第一个成功的 |

```hcl
# can: 测试是否可解析
enabled = can(var.config.feature)

# try: 提供回退
port = try(var.config.port, var.default_port, 8080)
```

### 6.11 文件系统函数（需 `AllowFS: true`）

以下函数默认在 API 提交时禁用，仅在本地 `nomad job run`/`plan`/`validate` 时启用：

| 函数 | 说明 |
|---|---|
| `abspath(path)` | 绝对路径 |
| `basename(path)` | 文件名部分 |
| `dirname(path)` | 目录部分 |
| `file(path)` | 读取文件内容 |
| `filebase64(path)` | 读取文件为 Base64 |
| `fileexists(path)` | 文件是否存在 |
| `fileset(path, pattern)` | 匹配文件集合 |
| `pathexpand(path)` | 展开 `~` |

由 [`guardFS()`](file:///d:/claude/nomad/jobspec2/functions.go) 包装，未启用时返回错误 `"filesystem function disabled"`。

---

## 7. 动态块 Dynamic Blocks

使用 `dynamic` 块根据变量动态生成重复的配置块。

### 7.1 基本语法

```hcl
variable "services" {
  type = list(object({
    name = string
    port = number
  }))
  default = [
    { name = "web",   port = 8080 },
    { name = "admin", port = 9090 },
  ]
}

job "app" {
  group "webs" {
    dynamic "service" {
      for_each = var.services
      content {
        name = service.value.name
        port = service.value.port
      }
    }
  }
}
```

### 7.2 迭代器命名

默认迭代器名为块类型，可用 `iterator` 自定义：

```hcl
dynamic "service" {
  for_each = var.services
  iterator = svc        # 用 svc.value 代替 service.value
  content {
    name = svc.value.name
  }
}
```

### 7.3 使用键

```hcl
dynamic "port" {
  for_each = var.ports   # map 类型
  content {
    name  = port.key
    value = port.value
  }
}
```

### 7.4 嵌套动态块

```hcl
dynamic "group" {
  for_each = var.groups
  content {
    dynamic "task" {
      for_each = group.value.tasks
      content {
        name   = task.value.name
        driver = task.value.driver
      }
    }
  }
}
```

实现：使用 [`dynblock.Expand()`](file:///d:/claude/nomad/jobspec2/types.config.go)，在 `decodeJob()` 中对 job body 展开。

---

## 8. 插值与引用

### 8.1 变量引用

```hcl
var.<name>            # 输入变量
local.<name>          # 局部值
```

### 8.2 Nomad 运行时变量

在 `template` 块和 `env` 中，Nomad 注入运行时变量（这些在 HCL 解析时未知，运行时求值）：

| 变量 | 说明 |
|---|---|
| `${NOMAD_JOB_ID}` | 作业 ID |
| `${NOMAD_JOB_NAME}` | 作业名称 |
| `${NOMAD_GROUP_NAME}` | 任务组名称 |
| `${NOMAD_TASK_NAME}` | 任务名称 |
| `${NOMAD_ALLOC_ID}` | 分配 ID |
| `${NOMAD_ALLOC_INDEX}` | 分配索引（0-based） |
| `${NOMAD_ALLOC_DIR}` | 分配目录 |
| `${NOMAD_TASK_DIR}` | 任务目录 |
| `${NOMAD_SECRETS_DIR}` | 密钥目录 |
| `${NOMAD_LOCAL_DIR}` | 本地目录 |
| `${NOMAD_ADDR_<task>_<port>}` | 网络地址 |
| `${NOMAD_HOST_PORT_<task>_<port>}` | 主机端口 |
| `${NOMAD_IP_<task>}` | 任务 IP |
| `${NOMAD_UPSTREAM_ADDR_<service>}` | Connect 上游地址 |

### 8.3 未定义变量处理

Nomad 的 HCL 解析器对未定义变量有特殊处理：将其原样保留为 `${...}` 字符串，供运行时模板引擎（consul-template）处理（见 [`types.config.go: EvalContext().UndefinedVariable`](file:///d:/claude/nomad/jobspec2/types.config.go)）。

```hcl
env {
  # ${NOMAD_ALLOC_ID} 在 HCL 解析时未知，保留为字符串
  ALLOC_ID = "${NOMAD_ALLOC_ID}"
}
```

---

## 9. JSON 替代语法

Nomad 支持 JSON 格式的作业规范，通过 [`hcljson.Parse()`](file:///d:/claude/nomad/jobspec2/parse.go) 解析。

### 9.1 自动检测

```go
func isJSON(src []byte) bool {
    for _, c := range src {
        if c == ' ' { continue }
        return c == '{'   # 首个非空白字符为 { 则判定为 JSON
    }
    return false
}
```

### 9.2 JSON 结构示例

```json
{
  "Job": {
    "ID": "my-job",
    "Name": "my-job",
    "Datacenters": ["dc1"],
    "Type": "service",
    "TaskGroups": [
      {
        "Name": "webs",
        "Count": 3,
        "Tasks": [
          {
            "Name": "web",
            "Driver": "docker",
            "Config": {
              "image": "nginx:latest"
            }
          }
        ]
      }
    ]
  }
}
```

### 9.3 限制

- JSON 格式**不支持变量**（`-var`、`-var-file` 与 JSON 互斥，见 [`JobGetter.Validate()`](file:///d:/claude/nomad/command/helpers.go)）
- JSON 直接映射到 `api.Job` 结构，不支持 HCL 的 `variable`/`locals`/`dynamic` 等高级特性
- 可省略顶层 `Job` 键，直接从 `ID`/`Name` 开始

---

## 10. 解析流程详解

### 10.1 入口函数

```go
// 简单解析
jobspec2.Parse(path, reader) (*api.Job, error)

// 完整配置解析
jobspec2.ParseWithConfig(&ParseConfig{
    Path:     "app.nomad.hcl",
    Body:     sourceBytes,
    AllowFS:  true,
    ArgVars:  []string{"tag=v1.0"},
    VarFiles: []string{"vars.prod.hcl"},
    Envs:     os.Environ(),
    Strict:   true,
}) (*api.Job, error)

// 扩展解析（含 Submission 和变量类型信息）
jobspec2.ParseWithConfigEx(config) (*ParseResult, error)
// ParseResult 包含 Job, Submission, Variables
```

### 10.2 解码顺序

```go
func (c *jobConfig) decodeBody(body hcl.Body) hcl.Diagnostics {
    content, diags := body.Content(jobConfigSchema)

    // 1. 解码输入变量声明
    diags += c.decodeInputVariables(content)

    // 2. 解析 locals 块（仅收集表达式，不求值）
    diags += c.parseLocalVariables(content)

    // 3. 收集变量值（env > varfile > argv > default）
    diags += c.collectInputVariableValues(env, varFiles, argv)

    // 4. 求值输入变量（触发 validation）
    _, diags += c.InputVariables.Values()

    // 5. 求值 locals（含依赖排序，最多重试 100 次）
    _, diags += c.LocalVariables.Values()
    diags += c.evaluateLocalVariables(c.LocalBlocks)

    // 6. 构建 EvalContext（var + local + functions）
    ctx := c.EvalContext()

    // 7. 解码 job 块 → api.Job
    diags += c.decodeJob(content, ctx)

    return diags
}
```

### 10.3 EvalContext 构建

```go
func (c *jobConfig) EvalContext() *hcl.EvalContext {
    vars, _   := c.InputVariables.Values()
    locals, _ := c.LocalVariables.Values()

    return &hcl.EvalContext{
        Functions: Functions(c.ParseConfig.BaseDir, c.ParseConfig.AllowFS),
        Variables: map[string]cty.Value{
            "var":   cty.ObjectVal(vars),
            "local": cty.ObjectVal(locals),
        },
        UndefinedVariable: func(t hcl.Traversal) (cty.Value, hcl.Diagnostics) {
            // 未知变量原样保留为 ${...} 字符串
            // 供运行时 consul-template 处理
        },
    }
}
```

### 10.4 自定义类型解码

[`hcl_conversions.go`](file:///d:/claude/nomad/jobspec2/hcl_conversions.go) 注册了自定义解码器：

| Go 类型 | HCL 输入 | 转换 |
|---|---|---|
| `time.Duration` | `"30s"`, `"5m"` | `time.ParseDuration()` |
| `api.Affinity` | block | 自定义块解码 |
| `api.Constraint` | block | 自定义块解码 |
| `api.TaskGroup` | block | 含 network/services/tasks 递归 |
| `api.Task` | block | 含 config/templates 递归 |

### 10.5 Block-as-Attribute 转换

[`hclutil.BlocksAsAttrs()`](file:///d:/claude/nomad/jobspec2/hclutil/blockattrs.go) 将嵌套块转为对象表达式，支持 driver `config` 的任意嵌套：

```hcl
# HCL 写法（block 风格）
config {
  auth {
    username = "user"
  }
}

# 等价于（attribute 风格）
config {
  auth = {
    username = "user"
  }
}
```

### 10.6 Map 求值

`meta`、driver `config` 等字段类型为 `map[string]interface{}`，在主解码后由 [`decodeMapInterfaceType()`](file:///d:/claude/nomad/jobspec2/parse_map.go) 递归求值所有 HCL 表达式。

---

## 11. CLI 使用

### 11.1 初始化模板

```bash
# 生成完整带注释的示例
nomad job init
# → 创建 example.nomad.hcl

# 生成精简版
nomad job init -short

# 生成含 Consul Connect 的示例
nomad job init -connect
```

模板源码：[`command/asset/example.nomad.hcl`](file:///d:/claude/nomad/command/asset/example.nomad.hcl)

### 11.2 校验作业

```bash
nomad job validate app.nomad.hcl
nomad job validate -var="tag=v1.0" -var-file=vars.hcl app.nomad.hcl
```

### 11.3 预览变更

```bash
nomad job plan app.nomad.hcl
# 退出码：0=无变更，1=有变更，2=放置失败
```

### 11.4 运行作业

```bash
nomad job run app.nomad.hcl

# 带变量
nomad job run \
  -var="image_tag=v1.2.3" \
  -var-file=vars.prod.hcl \
  app.nomad.hcl

# 从 stdin
cat app.nomad.hcl | nomad job run -

# 从远程 URL（通过 go-getter）
nomad job run "github.com/myorg/myrepo//jobs/app.nomad.hcl"
```

### 11.5 格式化

```bash
nomad fmt app.nomad.hcl
```

---

## 12. 最佳实践

### 12.1 文件组织

```
project/
├── jobs/
│   ├── app.nomad.hcl       # 主作业文件
│   └── worker.nomad.hcl
├── vars/
│   ├── base.hcl            # 基础变量
│   ├── dev.hcl             # 开发环境
│   └── prod.hcl            # 生产环境
└── templates/
    └── config.tpl           # consul-template 模板
```

### 12.2 变量设计

```hcl
# 优秀：有类型、描述、默认值、校验
variable "replicas" {
  type        = number
  default     = 3
  description = "Number of application instances"

  validation {
    condition     = var.replicas > 0 && var.replicas <= 100
    error_message = "Replicas must be between 1 and 100."
  }
}

# 避免：无类型、无文档
# replicas = 3
```

### 12.3 使用 Locals 减少重复

```hcl
locals {
  common_labels = {
    app     = "myapp"
    version = var.image_tag
    env     = var.environment
  }

  resources = {
    small  = { cpu = 256,  memory = 128 }
    medium = { cpu = 512,  memory = 256 }
    large  = { cpu = 1024, memory = 512 }
  }
}

task "app" {
  resources {
    cpu    = local.resources[var.size].cpu
    memory = local.resources[var.size].memory
  }
  meta = local.common_labels
}
```

### 12.4 动态块替代重复

```hcl
# 避免：手动重复
# service { name = "a" ... }
# service { name = "b" ... }

# 推荐：数据驱动
variable "services" {
  type = list(string)
  default = ["a", "b"]
}

dynamic "service" {
  for_each = toset(var.services)
  content {
    name = service.value
    # ...
  }
}
```

### 12.5 Strict 模式

```bash
# 严格模式（默认）：未定义变量报错
nomad job run -strict app.nomad.hcl

# 非严格模式：未定义变量仅警告
nomad job run app.nomad.hcl  # API 路径默认非严格
```

### 12.6 环境隔离

```hcl
# app.nomad.hcl（通用）
variable "env" {
  type = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.env)
    error_message = "Env must be dev, staging, or prod."
  }
}

locals {
  config = {
    dev     = { replicas = 1, image = "dev" }
    staging = { replicas = 2, image = "staging" }
    prod    = { replicas = 5, image = "latest" }
  }
  cfg = local.config[var.env]
}

job "app" {
  group "webs" {
    count = local.cfg.replicas
    task "app" {
      config { image = "myapp:${local.cfg.image}" }
    }
  }
}
```

```bash
nomad job run -var="env=prod" app.nomad.hcl
```

### 12.7 文件函数使用

```hcl
# 读取外部配置文件
variable "config_content" {
  type    = string
  default = ""
}

locals {
  # file() 仅在本地 CLI 解析时可用
  config = var.config_content != "" ? var.config_content : file("${path.module}/config.yml")
}

task "app" {
  template {
    data        = local.config
    destination = "local/config.yml"
  }
}
```

> 注意：通过 API 提交时 `file()` 不可用。本地运行时 `AllowFS: true`，API 端点 `AllowFS: false`。

---

## 13. 完整示例

### 13.1 参数化 Web 应用

```hcl
variable "image" {
  type    = string
  default = "nginx:latest"
}

variable "replicas" {
  type    = number
  default = 3
}

variable "port" {
  type    = number
  default = 8080

  validation {
    condition     = var.port > 0
    error_message = "Port must be positive."
  }
}

variable "datacenters" {
  type    = list(string)
  default = ["dc1"]
}

locals {
  full_image = "registry.example.com/${var.image}"
}

job "webapp" {
  datacenters = var.datacenters
  type        = "service"

  update {
    max_parallel      = 1
    min_healthy_time  = "30s"
    healthy_deadline  = "5m"
    progress_deadline = "10m"
    auto_revert       = true
    canary            = 1
  }

  group "webs" {
    count = var.replicas

    network {
      mode = "bridge"
      port "http" {
        to = var.port
      }
    }

    service {
      name = "webapp"
      port = "http"

      check {
        type     = "http"
        path     = "/health"
        interval = "10s"
        timeout  = "2s"
      }
    }

    restart {
      attempts = 3
      interval = "10m"
      delay    = "30s"
      mode     = "delay"
    }

    task "web" {
      driver = "docker"
      config {
        image = local.full_image
        ports = ["http"]
      }

      identity {
        env  = true
        file = true
      }

      resources {
        cpu    = 500
        memory = 256
      }

      template {
        data        = <<EOF
PORT={{ env "NOMAD_PORT_http" }}
ALLOC={{ env "NOMAD_ALLOC_ID" }}
EOF
        destination = "local/env.conf"
        env         = true
      }
    }
  }
}
```

### 13.2 多服务动态生成

```hcl
variable "services" {
  type = map(object({
    image   = string
    port    = number
    cpu     = number
    memory  = number
    replicas = number
  }))
  default = {
    web   = { image = "nginx:1.25",   port = 80,  cpu = 256, memory = 128, replicas = 3 }
    api   = { image = "myapi:v2",     port = 3000, cpu = 512, memory = 256, replicas = 2 }
    worker = { image = "worker:v1",   port = 0,   cpu = 256, memory = 256, replicas = 1 }
  }
}

job "multi-service" {
  datacenters = ["dc1"]

  dynamic "group" {
    for_each = var.services
    iterator = svc

    content {
      name  = svc.key
      count = svc.value.replicas

      network {
        mode = "bridge"
        dynamic "port" {
          for_each = svc.value.port > 0 ? [svc.value.port] : []
          content {
            name = "main"
            to   = port.value
          }
        }
      }

      task "main" {
        driver = "docker"
        config {
          image = svc.value.image
          ports = svc.value.port > 0 ? ["main"] : []
        }
        resources {
          cpu    = svc.value.cpu
          memory = svc.value.memory
        }
      }
    }
  }
}
```

### 13.3 变量文件示例

```hcl
# vars.prod.hcl
image    = "myapp:v2.3.0"
replicas = 10
datacenters = ["prod-dc1", "prod-dc2"]
```

```bash
nomad job run -var-file=vars.prod.hcl webapp.nomad.hcl
```

---

## 附录：关键源码索引

| 功能 | 源码位置 |
|---|---|
| 解析入口 | [`jobspec2/parse.go: Parse()`](file:///d:/claude/nomad/jobspec2/parse.go) |
| 解码主流程 | [`jobspec2/types.config.go: decodeBody()`](file:///d:/claude/nomad/jobspec2/types.config.go) |
| 变量声明解码 | [`jobspec2/types.variables.go: decodeVariableBlock()`](file:///d:/claude/nomad/jobspec2/types.variables.go) |
| 变量值收集 | [`jobspec2/types.variables.go: collectInputVariableValues()`](file:///d:/claude/nomad/jobspec2/types.variables.go) |
| 变量校验 | [`jobspec2/types.variables.go: validateValue()`](file:///d:/claude/nomad/jobspec2/types.variables.go) |
| Locals 求值 | [`jobspec2/types.config.go: evaluateLocalVariables()`](file:///d:/claude/nomad/jobspec2/types.config.go) |
| 内置函数 | [`jobspec2/functions.go: Functions()`](file:///d:/claude/nomad/jobspec2/functions.go) |
| EvalContext | [`jobspec2/types.config.go: EvalContext()`](file:///d:/claude/nomad/jobspec2/types.config.go) |
| Job 归一化 | [`jobspec2/parse_job.go: normalizeJob()`](file:///d:/claude/nomad/jobspec2/parse_job.go) |
| 自定义类型解码 | [`jobspec2/hcl_conversions.go`](file:///d:/claude/nomad/jobspec2/hcl_conversions.go) |
| Block-as-Attr | [`jobspec2/hclutil/blockattrs.go`](file:///d:/claude/nomad/jobspec2/hclutil/blockattrs.go) |
| Map 求值 | [`jobspec2/parse_map.go: decodeMapInterfaceType()`](file:///d:/claude/nomad/jobspec2/parse_map.go) |
| 引用解析 | [`jobspec2/addrs/parse_ref.go`](file:///d:/claude/nomad/jobspec2/addrs/parse_ref.go) |
| CLI 集成 | [`command/helpers.go: JobGetter.Get()`](file:///d:/claude/nomad/command/helpers.go) |
| 作业模板 | [`command/asset/example.nomad.hcl`](file:///d:/claude/nomad/command/asset/example.nomad.hcl) |

---

## 总结

Nomad HCL 领域驱动语言基于 HCL v2 构建，提供：

1. **声明式配置**：Job/Group/Task 层级结构，直观描述工作负载
2. **参数化能力**：`variable` 块支持类型约束、默认值、校验规则
3. **复用机制**：`locals` 局部值、`dynamic` 动态块减少重复
4. **丰富函数**：80+ 内置函数覆盖字符串、集合、加密、网络、文件等
5. **灵活输入**：环境变量、变量文件、命令行参数多源赋值
6. **双格式支持**：HCL（人类友好）与 JSON（机器生成）自动检测
7. **运行时集成**：未知变量保留为 `${...}`，供 consul-template 运行时求值
8. **安全边界**：文件系统函数受 `AllowFS` 控制，API 提交时禁用

核心实现位于 [`jobspec2/`](file:///d:/claude/nomad/jobspec2/) 包，通过 `cty` 类型系统和 `gohcl` 解码器将 HCL 映射到 `api.Job` 结构，再经 `normalizeJob()` 填充默认值，最终提交给 Nomad 调度器。
