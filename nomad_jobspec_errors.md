# Nomad JobSpec 常见问题与解决方案

本文档记录 Nomad jobspec 编写过程中遇到的实际问题、根本原因分析和解决方案，所有结论均基于源码分析并标注源码位置。

---

## 问题 1：template.data 中 `${attr.unique.hostname}` 不生效

### 现象

在 `template` 块的 `data` 字段中使用 `${attr.unique.hostname}` 想获取节点主机名，但配置文件中输出的是原始字符串 `${attr.unique.hostname}`，而不是实际主机名。

```hcl
template {
  destination = "local/telegraf.conf"
  data = <<EOF
[agent]
  hostname = "${attr.unique.hostname}"   # 不生效，原样输出
EOF
}
```

### 根本原因

Nomad 有两套独立的模板引擎，语法不兼容：

| 引擎 | 语法 | 适用位置 | 处理者 |
|------|------|---------|--------|
| **TaskEnv 运行时插值** | `${...}` | `env`、`config`、`constraint`、`resources` 等 HCL 字段 | [helper/args/args.go:15](file:///d:/claude/nomad/helper/args/args.go#L15) `ReplaceEnv` |
| **consul-template** | `{{ }}` | **`template.data`** 内容 | consul-template 引擎 |

关键源码证据：

1. **`template.data` 内容直接传给 consul-template**：
   - [template.go:775](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L775) `ct.Contents = &tmpl.EmbeddedTmpl`
   - consul-template 只识别 `{{ }}` 语法，不认识 `${...}`
   - `${attr.unique.hostname}` 被原样输出到目标文件

2. **`${...}` 语法由 `ReplaceEnv` 处理**：
   - [helper/args/args.go:15-24](file:///d:/claude/nomad/helper/args/args.go#L15) `ReplaceEnv` 通过正则 `\${[a-zA-Z0-9_\-\.]+}` 匹配并替换
   - 仅作用于 `env`、`config`、`constraint` 等 HCL 字段，**不作用于 `template.data`**

3. **节点属性的存储方式**：
   - [env.go:916](file:///d:/claude/nomad/client/taskenv/env.go#L916) `b.nodeAttrs[fmt.Sprintf("%s%s", nodeAttributePrefix, k)] = v` 将节点属性以 `attr.*` 前缀存入 `nodeAttrs`
   - [env.go:145-150](file:///d:/claude/nomad/client/taskenv/env.go#L145) 定义了内置节点属性键：
     - `node.unique.id`
     - `node.datacenter`
     - `node.region`
     - `node.unique.name`
     - `node.class`
     - `node.pool`

4. **consul-template 的环境变量来源**：
   - [template.go:729](file:///d:/claude/nomad/client/allocrunner/taskrunner/template/template.go#L729) `runner.Env = maskProcessEnv(config.EnvBuilder.Build().All())`
   - consul-template runner 的环境变量来自 EnvBuilder，包含了 `env` 块设置的变量
   - 所以 `{{ env "NOMAD_HOSTNAME" }}` 可以访问到 `env` 块设置的变量

### 解决方案

#### 方案 1（推荐）：用 `env` 块桥接两套引擎

在 `env` 块中用 TaskEnv 插值（`${...}`），在 template 中用 consul-template 语法（`{{ }}`）读取：

```hcl
task "telegraf" {
  driver = "exec"

  env {
    NOMAD_HOSTNAME = "${attr.unique.hostname}"   # TaskEnv 插值，这里生效
  }

  template {
    destination = "local/telegraf.conf"
    change_mode = "restart"
    data = <<EOF
[agent]
  interval = "10s"
  round_interval = true
  hostname = "{{ env "NOMAD_HOSTNAME" }}"    # consul-template 读取上面 env 变量
  omit_hostname = false
EOF
  }
  # ... 其余配置不变
}
```

**原理**：`env` 块的值经过 `ReplaceEnv` 插值后存入 TaskEnv，consul-template runner 通过 `runner.Env` 获取这些变量，`{{ env "NOMAD_HOSTNAME" }}` 即可访问。

#### 方案 2（最简单）：删除 hostname 配置

让 Telegraf 自动用 `os.Hostname()` 获取系统主机名（通常与节点名一致）：

```toml
[agent]
  interval = "10s"
  round_interval = true
  omit_hostname = false
  # 不设置 hostname，Telegraf 自动获取
```

#### 方案 3：直接用系统环境变量

如果宿主机有 `HOSTNAME` 环境变量（Linux 通常有）：

```toml
hostname = "{{ env "HOSTNAME" }}"
```

### 关键结论

- **`template.data` 内部只能使用 `{{ }}` 语法**（consul-template）
- **`env`、`config`、`constraint` 等 HCL 字段只能使用 `${ }` 语法**（TaskEnv 插值）
- 需要在 template 中使用节点属性时，必须通过 `env` 块桥接：先用 `${...}` 设置环境变量，再用 `{{ env "..." }}` 读取

### 可用的节点属性参考

以下属性可通过 `${attr.*}` 或 `${node.*}` 在 `env` 块中使用：

| 属性键 | 说明 |
|--------|------|
| `${node.unique.id}` | 节点 ID |
| `${node.unique.name}` | 节点名称 |
| `${node.datacenter}` | 节点数据中心 |
| `${node.region}` | 节点所在区域 |
| `${node.class}` | 节点类 |
| `${node.pool}` | 节点池 |
| `${attr.unique.hostname}` | 节点主机名 |
| `${attr.kernel.name}` | 内核名称（如 linux） |
| `${attr.arch}` | CPU 架构 |
| `${attr.os.name}` | 操作系统名称 |

完整属性列表见 Nomad 官方文档：https://developer.hashicorp.com/nomad/docs/runtime/environment

---

## 问题 2：（待补充）

> 后续遇到的 jobspec 问题将追加到此处。
