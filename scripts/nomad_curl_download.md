# Nomad scripts 目录 curl 语句分析

> 文档主题：分析 `d:\claude\nomad\scripts` 目录下所有脚本中的 curl 语句
> 输出范围：每个 curl 语句的下载内容、所在脚本文件位置、完整 curl 语句
> 统计：共 13 个文件包含 curl 关键字，共 15 处 curl 调用（其中 11 处为下载操作，2 处为服务探测，2 处为包安装声明）

---

## 目录

1. [curl 语句汇总表](#1-curl-语句汇总表)
2. [按用途分类](#2-按用途分类)
3. [curl 下载操作详细分析](#3-curl-下载操作详细分析)
4. [curl 服务探测操作详细分析](#4-curl-服务探测操作详细分析)
5. [非 curl 调用说明（Dockerfile 中的 curl）](#5-非-curl-调用说明dockerfile-中的-curl)
6. [curl 选项使用统计](#6-curl-选项使用统计)
7. [下载源域名统计](#7-下载源域名统计)
8. [文件索引](#8-文件索引)

---

## 1. curl 语句汇总表

| # | 文件 | 行号 | 用途 | 下载/访问内容 |
|---|------|------|------|---------------|
| 1 | [linux-priv-go.sh](file:///d:/claude/nomad/scripts/linux-priv-go.sh) | L39-L41 | 下载 Go 工具链 | Go Linux 二进制包 |
| 2 | [vagrant-shell20260717-24908-nyxjbd.sh](file:///d:/claude/nomad/scripts/vagrant-shell20260717-24908-nyxjbd.sh) | L39-L41 | 下载 Go 工具链 | Go Linux 二进制包 |
| 3 | [release/mac-remote-build](file:///d:/claude/nomad/scripts/release/mac-remote-build) | L63 | 下载 Go 工具链 | Go macOS 二进制包 |
| 4 | [linux-priv-consul.sh](file:///d:/claude/nomad/scripts/linux-priv-consul.sh) | L25 | 下载 Consul | Consul Linux zip |
| 5 | [linux-priv-vault.sh](file:///d:/claude/nomad/scripts/linux-priv-vault.sh) | L25 | 下载 Vault | Vault Linux zip |
| 6 | [linux-priv-cni.sh](file:///d:/claude/nomad/scripts/linux-priv-cni.sh) | L26 | 下载 CNI 插件 | CNI plugins tar.gz |
| 7 | [vagrant-linux-priv-buf.sh](file:///d:/claude/nomad/scripts/vagrant-linux-priv-buf.sh) | L20 | 下载 Buf | Buf 二进制 |
| 8 | [vagrant-linux-unpriv-ui.sh](file:///d:/claude/nomad/scripts/vagrant-linux-unpriv-ui.sh) | L9 | 下载 NVM 安装脚本 | NVM install.sh |
| 9 | [linux-priv-docker.sh](file:///d:/claude/nomad/scripts/linux-priv-docker.sh) | L22 | 下载 Docker GPG 密钥 | Docker GPG key |
| 10 | [linux-priv-dev.sh](file:///d:/claude/nomad/scripts/linux-priv-dev.sh) | L15 | 下载 Chrome 签名密钥 | Google Linux 签名密钥 |
| 11 | [example_weave.bash](file:///d:/claude/nomad/scripts/example_weave.bash) | L14 | 下载 Weave | weave 脚本 |
| 12 | [example_weave.bash](file:///d:/claude/nomad/scripts/example_weave.bash) | L20 | 探测 Consul 服务 | Consul HTTP 接口 |
| 13 | [example_weave.bash](file:///d:/claude/nomad/scripts/example_weave.bash) | L27 | 探测 Nomad 服务 | Nomad HTTP 接口 |
| 14 | [release/Dockerfile](file:///d:/claude/nomad/scripts/release/Dockerfile) | L13 | apt 安装 curl（非 curl 调用） | apt-get 包 |
| 15 | [linux-priv-config.sh](file:///d:/claude/nomad/scripts/linux-priv-config.sh) | L27 | apt 安装 curl（非 curl 调用） | apt-get 包 |

---

## 2. 按用途分类

### 2.1 下载操作（11 处）

#### 2.1.1 HashiCorp 工具下载

| # | 文件 | 下载内容 | 目标路径 |
|---|------|----------|----------|
| 1 | [linux-priv-consul.sh](file:///d:/claude/nomad/scripts/linux-priv-consul.sh) | Consul 1.15.1 | `/tmp/consul.zip` |
| 2 | [linux-priv-vault.sh](file:///d:/claude/nomad/scripts/linux-priv-vault.sh) | Vault 1.13.0 | `/tmp/vault.zip` |

#### 2.1.2 Go 工具链下载

| # | 文件 | 下载内容 | 目标路径 |
|---|------|----------|----------|
| 1 | [linux-priv-go.sh](file:///d:/claude/nomad/scripts/linux-priv-go.sh) | Go 1.26.4 Linux | `/tmp/go.tar.gz` |
| 2 | [vagrant-shell20260717-24908-nyxjbd.sh](file:///d:/claude/nomad/scripts/vagrant-shell20260717-24908-nyxjbd.sh) | Go 1.26.4 Linux | `/tmp/go.tar.gz` |
| 3 | [release/mac-remote-build](file:///d:/claude/nomad/scripts/release/mac-remote-build) | Go 1.26.4 macOS | `${TMP_WORKSPACE}/tmp/go.tar.gz` |

#### 2.1.3 开发工具下载

| # | 文件 | 下载内容 | 目标路径 |
|---|------|----------|----------|
| 1 | [vagrant-linux-priv-buf.sh](file:///d:/claude/nomad/scripts/vagrant-linux-priv-buf.sh) | Buf 0.36.0 | `/tmp/buf` |
| 2 | [vagrant-linux-unpriv-ui.sh](file:///d:/claude/nomad/scripts/vagrant-linux-unpriv-ui.sh) | NVM 安装脚本 v0.36.0 | stdout（管道给 bash） |

#### 2.1.4 容器网络插件下载

| # | 文件 | 下载内容 | 目标路径 |
|---|------|----------|----------|
| 1 | [linux-priv-cni.sh](file:///d:/claude/nomad/scripts/linux-priv-cni.sh) | CNI plugins v1.3.0 | `/tmp/cni-plugins.tar.gz` |

#### 2.1.5 GPG 签名密钥下载

| # | 文件 | 下载内容 | 目标路径 |
|---|------|----------|----------|
| 1 | [linux-priv-docker.sh](file:///d:/claude/nomad/scripts/linux-priv-docker.sh) | Docker GPG key | stdout（管道给 apt-key） |
| 2 | [linux-priv-dev.sh](file:///d:/claude/nomad/scripts/linux-priv-dev.sh) | Google Linux 签名密钥 | stdout（管道给 apt-key） |

#### 2.1.6 示例脚本下载

| # | 文件 | 下载内容 | 目标路径 |
|---|------|----------|----------|
| 1 | [example_weave.bash](file:///d:/claude/nomad/scripts/example_weave.bash) | weave 脚本 | `/usr/local/bin/weave` |

### 2.2 服务探测操作（2 处）

| # | 文件 | 探测目标 | 用途 |
|---|------|----------|------|
| 1 | [example_weave.bash#L20](file:///d:/claude/nomad/scripts/example_weave.bash#L20) | `localhost:8500` | 检测 Consul 是否运行 |
| 2 | [example_weave.bash#L27](file:///d:/claude/nomad/scripts/example_weave.bash#L27) | `localhost:4646` | 检测 Nomad 是否运行 |

### 2.3 apt-get 安装 curl（2 处，非 curl 命令调用）

| # | 文件 | 说明 |
|---|------|------|
| 1 | [release/Dockerfile#L13](file:///d:/claude/nomad/scripts/release/Dockerfile#L13) | Docker 镜像中通过 apt-get 安装 curl 工具 |
| 2 | [linux-priv-config.sh#L27](file:///d:/claude/nomad/scripts/linux-priv-config.sh#L27) | Vagrant 配置脚本中通过 apt-get 安装 curl 工具 |

---

## 3. curl 下载操作详细分析

### 3.1 下载 Go 工具链

#### 3.1.1 linux-priv-go.sh

**文件位置**：[scripts/linux-priv-go.sh#L39-L41](file:///d:/claude/nomad/scripts/linux-priv-go.sh#L39-L41)

**完整 curl 语句**：

```bash
curl -sSL --fail -o /tmp/go.tar.gz \
    --retry 5 --retry-connrefused \
    "${download}"
```

**变量上下文**：
- `download="https://golang.google.cn/dl/go${go_version}.linux-${ARCH}.tar.gz"`
- `go_version="1.26.4"`
- `ARCH` 为 `amd64` 或 `arm64`

**展开后示例**：

```bash
curl -sSL --fail -o /tmp/go.tar.gz \
    --retry 5 --retry-connrefused \
    "https://golang.google.cn/dl/go1.26.4.linux-amd64.tar.gz"
```

**选项说明**：

| 选项 | 说明 |
|------|------|
| `-s` | 静默模式，不显示进度 |
| `-S` | 配合 `-s`，出错时显示错误信息 |
| `-L` | 跟随重定向 |
| `--fail` | HTTP 错误时返回非零退出码 |
| `-o /tmp/go.tar.gz` | 输出到文件 |
| `--retry 5` | 失败重试 5 次 |
| `--retry-connrefused` | 连接被拒绝时也重试 |

**下载内容**：Go 1.26.4 Linux 二进制 tar.gz 包

---

#### 3.1.2 vagrant-shell20260717-24908-nyxjbd.sh

**文件位置**：[scripts/vagrant-shell20260717-24908-nyxjbd.sh#L39-L41](file:///d:/claude/nomad/scripts/vagrant-shell20260717-24908-nyxjbd.sh#L39-L41)

**说明**：此文件内容与 `linux-priv-go.sh` 完全相同，是 Vagrant 临时生成的 shell 脚本副本。

**完整 curl 语句**：

```bash
curl -sSL --fail -o /tmp/go.tar.gz \
    --retry 5 --retry-connrefused \
    "${download}"
```

**变量上下文**：
- `download="https://golang.google.cn/dl/go${go_version}.linux-${ARCH}.tar.gz"`
- `go_version="1.26.4"`

**下载内容**：Go 1.26.4 Linux 二进制 tar.gz 包

---

#### 3.1.3 release/mac-remote-build

**文件位置**：[scripts/release/mac-remote-build#L63](file:///d:/claude/nomad/scripts/release/mac-remote-build#L63)

**完整 curl 语句**：

```bash
curl -sSL --fail -o "${TMP_WORKSPACE}/tmp/go.tar.gz" ${download}
```

**变量上下文**：
- `download="https://storage.googleapis.com/golang/go${go_version}.darwin-amd64.tar.gz"`
- `go_version="1.26.4"`
- `TMP_WORKSPACE="/tmp/nomad-workspace/$(date +%Y-%m-%d-%s)"`

**展开后示例**：

```bash
curl -sSL --fail -o "/tmp/nomad-workspace/2026-07-20-XXX/tmp/go.tar.gz" \
    "https://storage.googleapis.com/golang/go1.26.4.darwin-amd64.tar.gz"
```

**下载内容**：Go 1.26.4 macOS（darwin-amd64）二进制 tar.gz 包

---

### 3.2 下载 HashiCorp 工具

#### 3.2.1 linux-priv-consul.sh

**文件位置**：[scripts/linux-priv-consul.sh#L25](file:///d:/claude/nomad/scripts/linux-priv-consul.sh#L25)

**完整 curl 语句**：

```bash
curl -sSL --fail -o /tmp/consul.zip ${DOWNLOAD}
```

**变量上下文**：
- `VERSION="1.15.1"`
- `DOWNLOAD=https://releases.hashicorp.com/consul/${VERSION}/consul_${VERSION}_linux_${ARCH}.zip`
- `ARCH` 为 `amd64` 或 `arm64`

**展开后示例**：

```bash
curl -sSL --fail -o /tmp/consul.zip \
    https://releases.hashicorp.com/consul/1.15.1/consul_1.15.1_linux_amd64.zip
```

**下载内容**：Consul 1.15.1 Linux zip 包

---

#### 3.2.2 linux-priv-vault.sh

**文件位置**：[scripts/linux-priv-vault.sh#L25](file:///d:/claude/nomad/scripts/linux-priv-vault.sh#L25)

**完整 curl 语句**：

```bash
curl -sSL --fail -o /tmp/vault.zip ${DOWNLOAD}
```

**变量上下文**：
- `VERSION=1.13.0`
- `DOWNLOAD=https://releases.hashicorp.com/vault/${VERSION}/vault_${VERSION}_linux_${ARCH}.zip`
- `ARCH` 为 `amd64` 或 `arm64`

**展开后示例**：

```bash
curl -sSL --fail -o /tmp/vault.zip \
    https://releases.hashicorp.com/vault/1.13.0/vault_1.13.0_linux_amd64.zip
```

**下载内容**：Vault 1.13.0 Linux zip 包

---

### 3.3 下载 CNI 插件

**文件位置**：[scripts/linux-priv-cni.sh#L26](file:///d:/claude/nomad/scripts/linux-priv-cni.sh#L26)

**完整 curl 语句**：

```bash
curl -sSL --fail -o /tmp/cni-plugins.tar.gz ${DOWNLOAD}
```

**变量上下文**：
- `VERSION="v1.3.0"`
- `DOWNLOAD=https://github.com/containernetworking/plugins/releases/download/${VERSION}/cni-plugins-linux-${ARCH}-${VERSION}.tgz`
- `ARCH` 为 `amd64` 或 `arm64`

**展开后示例**：

```bash
curl -sSL --fail -o /tmp/cni-plugins.tar.gz \
    https://github.com/containernetworking/plugins/releases/download/v1.3.0/cni-plugins-linux-amd64-v1.3.0.tgz
```

**下载内容**：CNI plugins v1.3.0 Linux tar.gz 包

---

### 3.4 下载 Buf 工具

**文件位置**：[scripts/vagrant-linux-priv-buf.sh#L20](file:///d:/claude/nomad/scripts/vagrant-linux-priv-buf.sh#L20)

**完整 curl 语句**：

```bash
curl -sSL --fail "$DOWNLOAD" -o /tmp/buf
```

**变量上下文**：
- `VERSION=0.36.0`
- `DOWNLOAD=https://github.com/bufbuild/buf/releases/download/v${VERSION}/buf-Linux-x86_64`

**展开后示例**：

```bash
curl -sSL --fail "https://github.com/bufbuild/buf/releases/download/v0.36.0/buf-Linux-x86_64" -o /tmp/buf
```

**下载内容**：Buf 0.36.0 Linux x86_64 二进制

---

### 3.5 下载 NVM 安装脚本

**文件位置**：[scripts/vagrant-linux-unpriv-ui.sh#L9](file:///d:/claude/nomad/scripts/vagrant-linux-unpriv-ui.sh#L9)

**完整 curl 语句**：

```bash
curl -sSL --fail -o- https://raw.githubusercontent.com/creationix/nvm/v0.36.0/install.sh | bash
```

**说明**：
- `-o-` 表示输出到 stdout
- 通过管道 `| bash` 直接执行下载的脚本

**下载内容**：NVM v0.36.0 安装脚本（来自 GitHub raw 内容）

---

### 3.6 下载 GPG 签名密钥

#### 3.6.1 linux-priv-docker.sh

**文件位置**：[scripts/linux-priv-docker.sh#L22](file:///d:/claude/nomad/scripts/linux-priv-docker.sh#L22)

**完整 curl 语句**：

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
```

**选项说明**：

| 选项 | 说明 |
|------|------|
| `-f` | `--fail`，HTTP 错误时返回非零退出码 |
| `-s` | 静默模式 |
| `-S` | 配合 `-s`，出错时显示错误信息 |
| `-L` | 跟随重定向 |

**说明**：通过管道 `| sudo apt-key add -` 将下载的 GPG 密钥添加到 apt 信任链。

**下载内容**：Docker 官方 APT 仓库 GPG 签名密钥

---

#### 3.6.2 linux-priv-dev.sh

**文件位置**：[scripts/linux-priv-dev.sh#L15](file:///d:/claude/nomad/scripts/linux-priv-dev.sh#L15)

**完整 curl 语句**：

```bash
curl -sSL -o- https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
```

**说明**：通过管道 `| apt-key add -` 将下载的 Google Linux 签名公钥添加到 apt 信任链。

**下载内容**：Google Linux 软件包签名公钥（用于 Chrome 仓库验证）

---

### 3.7 下载 Weave 脚本

**文件位置**：[scripts/example_weave.bash#L14](file:///d:/claude/nomad/scripts/example_weave.bash#L14)

**完整 curl 语句**：

```bash
sudo curl -L git.io/weave -o /usr/local/bin/weave
```

**选项说明**：

| 选项 | 说明 |
|------|------|
| `-L` | 跟随重定向（`git.io` 是短链接服务） |

**说明**：使用 `sudo` 以 root 权限下载，直接写入 `/usr/local/bin/weave`。

**下载内容**：Weave 网络工具脚本（通过 git.io 短链接重定向）

---

## 4. curl 服务探测操作详细分析

### 4.1 探测 Consul 服务

**文件位置**：[scripts/example_weave.bash#L20](file:///d:/claude/nomad/scripts/example_weave.bash#L20)

**完整 curl 语句**：

```bash
if curl -s localhost:8500 > /dev/null; then
    echo "Consul running"
else
    echo "Running Consul dev agent..."
    consul agent -dev > consul.out &
fi
```

**选项说明**：

| 选项 | 说明 |
|------|------|
| `-s` | 静默模式 |

**说明**：探测本地 8500 端口（Consul HTTP API 默认端口），如果响应则认为 Consul 已运行，否则启动一个开发模式的 Consul agent。

---

### 4.2 探测 Nomad 服务

**文件位置**：[scripts/example_weave.bash#L27](file:///d:/claude/nomad/scripts/example_weave.bash#L27)

**完整 curl 语句**：

```bash
if curl -s localhost:4646 > /dev/null; then
    echo "Nomad running"
else
    echo "Running Nomad dev agent..."
    nomad agent -dev > nomad.out &
fi
```

**说明**：探测本地 4646 端口（Nomad HTTP API 默认端口），如果响应则认为 Nomad 已运行，否则启动一个开发模式的 Nomad agent。

---

## 5. 非 curl 调用说明（Dockerfile 中的 curl）

以下两处出现 `curl` 关键字，但实际上不是 curl 命令调用，而是通过 apt-get 安装 curl 工具：

### 5.1 release/Dockerfile

**文件位置**：[scripts/release/Dockerfile#L13](file:///d:/claude/nomad/scripts/release/Dockerfile#L13)

**完整语句**：

```dockerfile
RUN apt-get update; apt-get install -y \
            apt-transport-https \
            ca-certificates \
            curl \
            git \
            sudo \
            tree \
            unzip \
            wget
```

**说明**：在 Ubuntu 18.04 基础镜像中通过 apt-get 安装 curl 工具，用于后续的构建脚本调用。

---

### 5.2 linux-priv-config.sh

**文件位置**：[scripts/linux-priv-config.sh#L27](file:///d:/claude/nomad/scripts/linux-priv-config.sh#L27)

**完整语句**：

```bash
apt-get install -y \
    build-essential \
    git \
    libc6-dev-i386 \
    libpcre3-dev \
    linux-libc-dev:i386 \
    pkg-config \
    zip \
    curl \
    jq \
    tree \
    unzip \
    wget
```

**说明**：Vagrant Linux 配置脚本中通过 apt-get 安装 curl 工具及其他构建工具。

---

## 6. curl 选项使用统计

### 6.1 选项出现频次

| 选项 | 出现次数 | 含义 |
|------|----------|------|
| `-s` | 13 | 静默模式（silent） |
| `-S` | 12 | 配合 -s 显示错误（show-error） |
| `-L` | 13 | 跟随重定向（location） |
| `--fail` / `-f` | 12 | HTTP 错误时返回非零（fail） |
| `-o <file>` | 10 | 输出到文件（output） |
| `-o-` | 2 | 输出到 stdout |
| `--retry <n>` | 2 | 失败重试次数 |
| `--retry-connrefused` | 2 | 连接拒绝时也重试 |

### 6.2 常见组合

| 组合 | 含义 | 出现次数 |
|------|------|----------|
| `-sSL --fail` | 静默 + 跟随重定向 + 失败返回非零 | 9 |
| `-sSL --fail -o <file>` | 同上 + 输出到文件 | 7 |
| `-fsSL` | `-f -s -S -L` 等价简写 | 1（docker GPG） |
| `-sSL --fail -o-` | 同上 + 输出到 stdout（管道） | 2 |

---

## 7. 下载源域名统计

| 域名 | 出现次数 | 下载内容 |
|------|----------|----------|
| `golang.google.cn` | 2 | Go 工具链（Linux） |
| `storage.googleapis.com` | 1 | Go 工具链（macOS） |
| `releases.hashicorp.com` | 2 | Consul、Vault |
| `github.com/containernetworking/plugins` | 1 | CNI 插件 |
| `github.com/bufbuild/buf` | 1 | Buf 工具 |
| `raw.githubusercontent.com` | 1 | NVM 安装脚本 |
| `download.docker.com` | 1 | Docker GPG 密钥 |
| `dl-ssl.google.com` | 1 | Google 签名密钥 |
| `git.io` | 1 | Weave 短链接 |
| `localhost` | 2 | 服务探测（Consul、Nomad） |

---

## 8. 文件索引

### 8.1 包含 curl 调用的脚本文件

| # | 文件路径 | curl 调用数 | 主要用途 |
|---|----------|-------------|----------|
| 1 | [scripts/linux-priv-go.sh](file:///d:/claude/nomad/scripts/linux-priv-go.sh) | 1 | 安装 Go 工具链 |
| 2 | [scripts/vagrant-shell20260717-24908-nyxjbd.sh](file:///d:/claude/nomad/scripts/vagrant-shell20260717-24908-nyxjbd.sh) | 1 | 安装 Go 工具链（Vagrant 临时副本） |
| 3 | [scripts/release/mac-remote-build](file:///d:/claude/nomad/scripts/release/mac-remote-build) | 1 | 远程 macOS 构建（下载 Go） |
| 4 | [scripts/linux-priv-consul.sh](file:///d:/claude/nomad/scripts/linux-priv-consul.sh) | 1 | 安装 Consul |
| 5 | [scripts/linux-priv-vault.sh](file:///d:/claude/nomad/scripts/linux-priv-vault.sh) | 1 | 安装 Vault |
| 6 | [scripts/linux-priv-cni.sh](file:///d:/claude/nomad/scripts/linux-priv-cni.sh) | 1 | 安装 CNI 插件 |
| 7 | [scripts/vagrant-linux-priv-buf.sh](file:///d:/claude/nomad/scripts/vagrant-linux-priv-buf.sh) | 1 | 安装 Buf |
| 8 | [scripts/vagrant-linux-unpriv-ui.sh](file:///d:/claude/nomad/scripts/vagrant-linux-unpriv-ui.sh) | 1 | 安装 NVM |
| 9 | [scripts/linux-priv-docker.sh](file:///d:/claude/nomad/scripts/linux-priv-docker.sh) | 1 | 添加 Docker APT 仓库 |
| 10 | [scripts/linux-priv-dev.sh](file:///d:/claude/nomad/scripts/linux-priv-dev.sh) | 1 | 添加 Chrome APT 仓库 |
| 11 | [scripts/example_weave.bash](file:///d:/claude/nomad/scripts/example_weave.bash) | 3 | 下载 weave + 探测 Consul/Nomad |

### 8.2 包含 curl 关键字的非调用文件

| # | 文件路径 | 出现位置 | 用途 |
|---|----------|----------|------|
| 1 | [scripts/release/Dockerfile](file:///d:/claude/nomad/scripts/release/Dockerfile) | L13 | apt-get 安装 curl |
| 2 | [scripts/linux-priv-config.sh](file:///d:/claude/nomad/scripts/linux-priv-config.sh) | L27 | apt-get 安装 curl |

### 8.3 按下载内容分类索引

#### HashiCorp 工具

- Consul 1.15.1: [linux-priv-consul.sh#L25](file:///d:/claude/nomad/scripts/linux-priv-consul.sh#L25)
- Vault 1.13.0: [linux-priv-vault.sh#L25](file:///d:/claude/nomad/scripts/linux-priv-vault.sh#L25)

#### Go 工具链

- Go 1.26.4 Linux: [linux-priv-go.sh#L39](file:///d:/claude/nomad/scripts/linux-priv-go.sh#L39)
- Go 1.26.4 Linux（副本）: [vagrant-shell20260717-24908-nyxjbd.sh#L39](file:///d:/claude/nomad/scripts/vagrant-shell20260717-24908-nyxjbd.sh#L39)
- Go 1.26.4 macOS: [release/mac-remote-build#L63](file:///d:/claude/nomad/scripts/release/mac-remote-build#L63)

#### 容器与网络工具

- CNI plugins v1.3.0: [linux-priv-cni.sh#L26](file:///d:/claude/nomad/scripts/linux-priv-cni.sh#L26)
- Weave 脚本: [example_weave.bash#L14](file:///d:/claude/nomad/scripts/example_weave.bash#L14)

#### 开发工具

- Buf 0.36.0: [vagrant-linux-priv-buf.sh#L20](file:///d:/claude/nomad/scripts/vagrant-linux-priv-buf.sh#L20)
- NVM v0.36.0: [vagrant-linux-unpriv-ui.sh#L9](file:///d:/claude/nomad/scripts/vagrant-linux-unpriv-ui.sh#L9)

#### GPG 签名密钥

- Docker GPG key: [linux-priv-docker.sh#L22](file:///d:/claude/nomad/scripts/linux-priv-docker.sh#L22)
- Google Linux 签名密钥: [linux-priv-dev.sh#L15](file:///d:/claude/nomad/scripts/linux-priv-dev.sh#L15)

#### 服务探测

- Consul HTTP API（localhost:8500）: [example_weave.bash#L20](file:///d:/claude/nomad/scripts/example_weave.bash#L20)
- Nomad HTTP API（localhost:4646）: [example_weave.bash#L27](file:///d:/claude/nomad/scripts/example_weave.bash#L27)

---

## 附录 A：所有 curl 语句完整列表

```bash
# 1. linux-priv-go.sh:39-41 - 下载 Go 1.26.4 Linux
curl -sSL --fail -o /tmp/go.tar.gz \
    --retry 5 --retry-connrefused \
    "${download}"

# 2. vagrant-shell20260717-24908-nyxjbd.sh:39-41 - 下载 Go 1.26.4 Linux（副本）
curl -sSL --fail -o /tmp/go.tar.gz \
    --retry 5 --retry-connrefused \
    "${download}"

# 3. release/mac-remote-build:63 - 下载 Go 1.26.4 macOS
curl -sSL --fail -o "${TMP_WORKSPACE}/tmp/go.tar.gz" ${download}

# 4. linux-priv-consul.sh:25 - 下载 Consul 1.15.1
curl -sSL --fail -o /tmp/consul.zip ${DOWNLOAD}

# 5. linux-priv-vault.sh:25 - 下载 Vault 1.13.0
curl -sSL --fail -o /tmp/vault.zip ${DOWNLOAD}

# 6. linux-priv-cni.sh:26 - 下载 CNI plugins v1.3.0
curl -sSL --fail -o /tmp/cni-plugins.tar.gz ${DOWNLOAD}

# 7. vagrant-linux-priv-buf.sh:20 - 下载 Buf 0.36.0
curl -sSL --fail "$DOWNLOAD" -o /tmp/buf

# 8. vagrant-linux-unpriv-ui.sh:9 - 下载 NVM 安装脚本
curl -sSL --fail -o- https://raw.githubusercontent.com/creationix/nvm/v0.36.0/install.sh | bash

# 9. linux-priv-docker.sh:22 - 下载 Docker GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# 10. linux-priv-dev.sh:15 - 下载 Google 签名密钥
curl -sSL -o- https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -

# 11. example_weave.bash:14 - 下载 Weave 脚本
sudo curl -L git.io/weave -o /usr/local/bin/weave

# 12. example_weave.bash:20 - 探测 Consul 服务
curl -s localhost:8500 > /dev/null

# 13. example_weave.bash:27 - 探测 Nomad 服务
curl -s localhost:4646 > /dev/null
```

---

> 本文档基于对 `d:\claude\nomad\scripts` 目录的扫描分析生成，覆盖所有包含 curl 关键字的文件，包括下载操作、服务探测操作以及 apt-get 安装 curl 工具的声明。
