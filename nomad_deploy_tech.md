# Nomad 大型集团部署技术实施手册

> 本手册为技术人员提供详细的 Shell 命令和配置文件，用于实施 100+ 企业集团 Nomad 部署。
> 所有命令均在 Linux (Ubuntu 22.04 LTS) 环境验证，配置基于 Nomad 1.8.x。

---

## 目录

1. 环境准备
2. 系统基础配置
3. Nomad 安装
4. TLS 证书体系
5. 集团总部 Server 部署
6. 区域中心 Server 部署
7. 企业 Server 部署
8. 企业 Client 部署
9. ACL 体系配置
10. Gossip 加密配置
11. WAN 联邦配置
12. Node Pool 与多租户
13. Vault 集成
14. 监控部署
15. 日志聚合
16. 备份与恢复
17. CI/CD 集成
18. 故障处理
19. 版本升级
20. 附录：完整脚本

---

## 1. 环境准备

### 1.1 节点规划清单

| 角色 | 主机名 | IP | Region | DC | 配置 |
|------|--------|-----|--------|-----|------|
| HQ Server 1 | hq-srv-01 | 10.0.1.11 | group-hq | hq-dc1 | 32C/128G/2T |
| HQ Server 2 | hq-srv-02 | 10.0.1.12 | group-hq | hq-dc1 | 32C/128G/2T |
| HQ Server 3 | hq-srv-03 | 10.0.1.13 | group-hq | hq-dc1 | 32C/128G/2T |
| HQ Server 4 | hq-srv-04 | 10.0.1.14 | group-hq | hq-dc1 | 32C/128G/2T |
| HQ Server 5 | hq-srv-05 | 10.0.1.15 | group-hq | hq-dc1 | 32C/128G/2T |
| 区域 Server | cn-n-srv-01~05 | 10.10.0.11~15 | cn-north | cn-n-dc1 | 16C/64G/1T |
| 企业 Server | ent-001-srv-01~03 | 10.10.1.11~13 | ent-001 | ent-001-dc1 | 8C/32G/500G |
| 企业 Client | ent-001-cli-01~N | 10.10.1.100+ | ent-001 | ent-001-dc1 | 按需 |

### 1.2 主机名设置

```bash
# HQ Server (在每个节点执行)
sudo hostnamectl set-hostname hq-srv-01
sudo tee -a /etc/hosts <<'EOF'
10.0.1.11    hq-srv-01
10.0.1.12    hq-srv-02
10.0.1.13    hq-srv-03
10.0.1.14    hq-srv-04
10.0.1.15    hq-srv-05
EOF

# 区域中心 Server
sudo hostnamectl set-hostname cn-n-srv-01
sudo tee -a /etc/hosts <<'EOF'
10.10.0.11    cn-n-srv-01
10.10.0.12    cn-n-srv-02
10.10.0.13    cn-n-srv-03
10.10.0.14    cn-n-srv-04
10.10.0.15    cn-n-srv-05
EOF

# 企业 Server
sudo hostnamectl set-hostname ent-001-srv-01
sudo tee -a /etc/hosts <<'EOF'
10.10.1.11    ent-001-srv-01
10.10.1.12    ent-001-srv-02
10.10.1.13    ent-001-srv-03
EOF
```

### 1.3 时间同步

```bash
# 安装 chrony
sudo apt-get update && sudo apt-get install -y chrony

# 配置 NTP 源（集团 NTP 服务器）
sudo tee /etc/chrony/chrony.conf <<'EOF'
server ntp.group.com iburst
driftfile /var/lib/chrony/chrony.drift
makestep 1.0 3
rtcsync
allow 10.0.0.0/8
logdir /var/log/chrony
EOF

sudo systemctl enable --now chrony
chronyc tracking
```

### 1.4 内核参数优化

```bash
# 创建 sysctl 配置
sudo tee /etc/sysctl.d/99-nomad.conf <<'EOF'
# 文件描述符
fs.file-max = 2097152
fs.nr_open = 2097152

# 网络缓冲区
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.core.rmem_default = 262144
net.core.wmem_default = 262144
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.core.netdev_max_backlog = 10000
net.core.somaxconn = 65535

# TCP 优化
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15

# 端口范围
net.ipv4.ip_local_port_range = 10000 65535

# 内存
vm.swappiness = 1
vm.overcommit_memory = 1
EOF

sudo sysctl --system
```

### 1.5 用户与目录

```bash
# 创建 nomad 用户
sudo useradd --system --home /opt/nomad --shell /usr/sbin/nologin nomad

# 创建目录
sudo mkdir -p /opt/nomad/{bin,data,tls,logs,config,volumes}
sudo mkdir -p /var/log/nomad

# 设置权限
sudo chown -R nomad:nomad /opt/nomad /var/log/nomad
sudo chmod 700 /opt/nomad/tls
```

---

## 2. 系统基础配置

### 2.1 防火墙配置

#### 2.1.1 HQ Server 防火墙

```bash
sudo apt-get install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH (建议限制源 IP)
sudo ufw allow from 10.0.1.0/24 to any port 22 proto tcp

# Nomad HTTP API (4646)
sudo ufw allow from 10.0.0.0/8 to any port 4646 proto tcp

# Nomad RPC (4647)
sudo ufw allow from 10.0.0.0/8 to any port 4647 proto tcp

# Serf Gossip (4648 TCP+UDP) - 关键：所有 Server 互通
sudo ufw allow from 10.0.0.0/8 to any port 4648 proto tcp
sudo ufw allow from 10.0.0.0/8 to any port 4648 proto udp

sudo ufw --force enable
sudo ufw status verbose
```

#### 2.1.2 企业 Server 防火墙

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH
sudo ufw allow from 10.10.1.0/24 to any port 22 proto tcp

# Nomad HTTP (本企业 Client + 运维)
sudo ufw allow from 10.10.1.0/24 to any port 4646 proto tcp
sudo ufw allow from 10.10.0.0/16 to any port 4646 proto tcp  # 区域中心管理

# Nomad RPC (本企业 Client + 其他 Server)
sudo ufw allow from 10.10.1.0/24 to any port 4647 proto tcp
sudo ufw allow from 10.0.0.0/8 to any port 4647 proto tcp  # WAN 联邦

# Serf Gossip - 所有 Server
sudo ufw allow from 10.0.0.0/8 to any port 4648 proto tcp
sudo ufw allow from 10.0.0.0/8 to any port 4648 proto udp

sudo ufw --force enable
```

#### 2.1.3 企业 Client 防火墙

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH
sudo ufw allow from 10.10.1.0/24 to any port 22 proto tcp

# Nomad HTTP (本企业 Server)
sudo ufw allow from 10.10.1.11 to any port 4646 proto tcp
sudo ufw allow from 10.10.1.12 to any port 4646 proto tcp
sudo ufw allow from 10.10.1.13 to any port 4646 proto tcp

# Nomad RPC (本企业 Server)
sudo ufw allow from 10.10.1.11 to any port 4647 proto tcp
sudo ufw allow from 10.10.1.12 to any port 4647 proto tcp
sudo ufw allow from 10.10.1.13 to any port 4647 proto tcp

# 动态端口范围 (任务端口)
sudo ufw allow from 10.10.1.0/24 to any port 20000:32000 proto tcp

sudo ufw --force enable
```

### 2.2 磁盘配置

```bash
# 查看磁盘
lsblk

# 假设 /dev/sdb 是数据盘
sudo fdisk /dev/sdb <<'EOF'
n
p
1


w
EOF

# 格式化为 ext4
sudo mkfs.ext4 /dev/sdb1

# 挂载
sudo mkdir -p /opt/nomad/data
sudo mount /dev/sdb1 /opt/nomad/data

# 持久化挂载
echo "/dev/sdb1 /opt/nomad/data ext4 defaults,noatime 0 2" | sudo tee -a /etc/fstab

# 针对 SSD 的优化挂载
sudo umount /opt/nomad/data
sudo mount -o defaults,noatime,discard /dev/sdb1 /opt/nomad/data

# 设置权限
sudo chown -R nomad:nomad /opt/nomad/data
```

---

## 3. Nomad 安装

### 3.1 下载与安装

```bash
# 定义版本
NOMAD_VERSION="1.8.0"

# 下载
cd /tmp
wget https://releases.hashicorp.com/nomad/${NOMAD_VERSION}/nomad_${NOMAD_VERSION}_linux_amd64.zip

# 验证 SHA256
wget https://releases.hashicorp.com/nomad/${NOMAD_VERSION}/nomad_${NOMAD_VERSION}_SHA256SUMS
sha256sum -c nomad_${NOMAD_VERSION}_SHA256SUMS 2>/dev/null | grep linux_amd64

# 解压安装
unzip nomad_${NOMAD_VERSION}_linux_amd64.zip
sudo mv nomad /opt/nomad/bin/
sudo chmod +x /opt/nomad/bin/nomad

# 创建软链接
sudo ln -sf /opt/nomad/bin/nomad /usr/local/bin/nomad

# 验证
nomad version
```

### 3.2 环境变量配置

```bash
sudo tee /etc/profile.d/nomad.sh <<'EOF'
# Nomad
export NOMAD_ADDR="https://127.0.0.1:4646"
export NOMAD_CACERT="/opt/nomad/tls/ca.crt"
export NOMAD_CLIENT_CERT="/opt/nomad/tls/cli.crt"
export NOMAD_CLIENT_KEY="/opt/nomad/tls/cli.key"
export PATH=$PATH:/opt/nomad/bin
EOF

source /etc/profile.d/nomad.sh
```

### 3.3 systemd 服务文件

#### 3.3.1 Server 服务文件

```bash
sudo tee /etc/systemd/system/nomad-server.service <<'EOF'
[Unit]
Description=Nomad Server
Documentation=https://nomadproject.io/docs/
After=network-online.target
Wants=network-online.target

[Service]
User=nomad
Group=nomad
ExecStart=/opt/nomad/bin/nomad agent -config=/opt/nomad/config/server.hcl
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5
LimitNOFILE=65536
LimitNPROC=infinity
LimitCORE=infinity
TasksMax=infinity

# 安全加固
NoNewPrivileges=yes
ProtectSystem=full
ProtectHome=read-only
PrivateTmp=yes

# 资源限制
MemoryMax=64G
CPUQuota=3200%

[Install]
WantedBy=multi-user.target
EOF
```

#### 3.3.2 Client 服务文件

```bash
sudo tee /etc/systemd/system/nomad-client.service <<'EOF'
[Unit]
Description=Nomad Client
Documentation=https://nomadproject.io/docs/
After=network-online.target docker.service
Wants=network-online.target docker.service

[Service]
User=nomad
Group=nomad
ExecStart=/opt/nomad/bin/nomad agent -config=/opt/nomad/config/client.hcl
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5
LimitNOFILE=65536

# Docker socket 访问
SupplementaryGroups=docker

[Install]
WantedBy=multi-user.target
EOF
```

```bash
# 启用服务（不立即启动）
sudo systemctl daemon-reload
sudo systemctl enable nomad-server
```

### 3.4 Docker 安装（Client 节点）

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 将 nomad 用户加入 docker 组
sudo usermod -aG docker nomad

# 配置 Docker
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  },
  "live-restore": true,
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 10,
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 65536,
      "Soft": 65536
    }
  }
}
EOF

sudo systemctl restart docker
sudo systemctl enable docker
```

---

## 4. TLS 证书体系

### 4.1 建立 CA（在集团管理机执行）

```bash
# 创建证书工作目录
mkdir -p ~/nomad-pki/{ca,server,client,cli}
cd ~/nomad-pki

# 1. 生成 CA 私钥
openssl genrsa -out ca/group-ca.key 4096

# 2. 生成 CA 证书
openssl req -new -x509 -days 3650 -key ca/group-ca.key \
  -out ca/group-ca.crt \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=GroupCorp/CN=Group Nomad CA"

# 3. 验证 CA 证书
openssl x509 -in ca/group-ca.crt -text -noout | head -20
```

### 4.2 生成 Server 证书

#### 4.2.1 创建证书生成脚本

```bash
cat > ~/nomad-pki/gen-server-cert.sh <<'SCRIPT'
#!/bin/bash
# 用法: ./gen-server-cert.sh <region> <dc> <hostname> <ip1> <ip2> ...

REGION=$1
DC=$2
HOSTNAME=$3
shift 3
IPS=("$@")

CN="${HOSTNAME}.${DC}.${REGION}.nomad.internal"

# 生成私钥
openssl genrsa -out server/${HOSTNAME}.key 2048

# 创建配置文件
cat > server/${HOSTNAME}.cnf <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = CN
ST = Beijing
L = Beijing
O = GroupCorp
CN = ${CN}

[v3_req]
keyUsage = keyEncipherment, dataEncipherment, digitalSignature
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${CN}
DNS.2 = ${HOSTNAME}
DNS.3 = localhost
IP.1 = 127.0.0.1
EOF

# 添加所有 IP
idx=2
for ip in "${IPS[@]}"; do
    echo "IP.${idx} = ${ip}" >> server/${HOSTNAME}.cnf
    ((idx++))
done

# 生成 CSR
openssl req -new -key server/${HOSTNAME}.key \
  -out server/${HOSTNAME}.csr \
  -config server/${HOSTNAME}.cnf

# 用 CA 签名
openssl x509 -req -in server/${HOSTNAME}.csr \
  -CA ca/group-ca.crt -CAkey ca/group-ca.key -CAcreateserial \
  -out server/${HOSTNAME}.crt -days 825 \
  -extensions v3_req -extfile server/${HOSTNAME}.cnf

# 验证
echo "=== Certificate for ${HOSTNAME} ==="
openssl x509 -in server/${HOSTNAME}.crt -text -noout | grep -A1 "Subject Alternative Name"
openssl verify -CAfile ca/group-ca.crt server/${HOSTNAME}.crt
SCRIPT

chmod +x ~/nomad-pki/gen-server-cert.sh
```

#### 4.2.2 生成 HQ Server 证书

```bash
cd ~/nomad-pki

# HQ Server 1-5
./gen-server-cert.sh group-hq hq-dc1 hq-srv-01 10.0.1.11
./gen-server-cert.sh group-hq hq-dc1 hq-srv-02 10.0.1.12
./gen-server-cert.sh group-hq hq-dc1 hq-srv-03 10.0.1.13
./gen-server-cert.sh group-hq hq-dc1 hq-srv-04 10.0.1.14
./gen-server-cert.sh group-hq hq-dc1 hq-srv-05 10.0.1.15
```

#### 4.2.3 生成企业 Server 证书

```bash
cd ~/nomad-pki

# 企业 001 的 3 个 Server
./gen-server-cert.sh ent-001 ent-001-dc1 ent-001-srv-01 10.10.1.11
./gen-server-cert.sh ent-001 ent-001-dc1 ent-001-srv-02 10.10.1.12
./gen-server-cert.sh ent-001 ent-001-dc1 ent-001-srv-03 10.10.1.13
```

### 4.3 生成 Client 证书

```bash
cat > ~/nomad-pki/gen-client-cert.sh <<'SCRIPT'
#!/bin/bash
# 用法: ./gen-client-cert.sh <hostname> <ip>

HOSTNAME=$1
IP=$2
CN="${HOSTNAME}.client.nomad.internal"

openssl genrsa -out client/${HOSTNAME}.key 2048

cat > client/${HOSTNAME}.cnf <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = CN
O = GroupCorp
CN = ${CN}

[v3_req]
keyUsage = keyEncipherment, dataEncipherment, digitalSignature
extendedKeyUsage = clientAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = ${CN}
IP.1 = ${IP}
EOF

openssl req -new -key client/${HOSTNAME}.key \
  -out client/${HOSTNAME}.csr \
  -config client/${HOSTNAME}.cnf

openssl x509 -req -in client/${HOSTNAME}.csr \
  -CA ca/group-ca.crt -CAkey ca/group-ca.key -CAcreateserial \
  -out client/${HOSTNAME}.crt -days 825 \
  -extensions v3_req -extfile client/${HOSTNAME}.cnf

echo "Client cert for ${HOSTNAME} generated."
SCRIPT

chmod +x ~/nomad-pki/gen-client-cert.sh
cd ~/nomad-pki
./gen-client-cert.sh ent-001-cli-01 10.10.1.100
./gen-client-cert.sh ent-001-cli-02 10.10.1.101
```

### 4.4 生成 CLI 证书

```bash
cd ~/nomad-pki

# CLI 证书（运维人员使用）
openssl genrsa -out cli/admin.key 2048

cat > cli/admin.cnf <<'EOF'
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = CN
O = GroupCorp
CN = nomad-admin

[v3_req]
keyUsage = keyEncipherment, dataEncipherment, digitalSignature
extendedKeyUsage = clientAuth
EOF

openssl req -new -key cli/admin.key -out cli/admin.csr -config cli/admin.cnf

openssl x509 -req -in cli/admin.csr \
  -CA ca/group-ca.crt -CAkey ca/group-ca.key -CAcreateserial \
  -out cli/admin.crt -days 365 \
  -extensions v3_req -extfile cli/admin.cnf
```

### 4.5 分发证书到节点

```bash
cd ~/nomad-pki

# 分发到 HQ Server 1
scp ca/group-ca.crt server/hq-srv-01.crt server/hq-srv-01.key \
  nomad@10.0.1.11:/tmp/

# 在 HQ Server 1 上执行
ssh nomad@10.0.1.11 <<'EOF'
sudo mv /tmp/group-ca.crt /opt/nomad/tls/ca.crt
sudo mv /tmp/hq-srv-01.crt /opt/nomad/tls/server.crt
sudo mv /tmp/hq-srv-01.key /opt/nomad/tls/server.key
sudo chown nomad:nomad /opt/nomad/tls/*
sudo chmod 600 /opt/nomad/tls/*.key
sudo chmod 644 /opt/nomad/tls/*.crt
EOF
```

### 4.6 自动化分发脚本

```bash
cat > ~/nomad-pki/distribute-certs.sh <<'SCRIPT'
#!/bin/bash
# 用法: ./distribute-certs.sh <hostname> <ip> <cert-type> <cert-name>

HOSTNAME=$1
IP=$2
CERT_TYPE=$3  # server or client
CERT_NAME=$4

cd ~/nomad-pki

echo "Distributing certificates to ${HOSTNAME} (${IP})..."

scp ca/group-ca.crt ${CERT_TYPE}/${CERT_NAME}.crt ${CERT_TYPE}/${CERT_NAME}.key \
  nomad@${IP}:/tmp/

ssh nomad@${IP} <<EOF
sudo mv /tmp/group-ca.crt /opt/nomad/tls/ca.crt
sudo mv /tmp/${CERT_NAME}.crt /opt/nomad/tls/${CERT_TYPE}.crt
sudo mv /tmp/${CERT_NAME}.key /opt/nomad/tls/${CERT_TYPE}.key
sudo chown nomad:nomad /opt/nomad/tls/*
sudo chmod 600 /opt/nomad/tls/*.key
sudo chmod 644 /opt/nomad/tls/*.crt
echo "Certificates installed on ${HOSTNAME}"
EOF
SCRIPT

chmod +x ~/nomad-pki/distribute-certs.sh
```

---

## 5. 集团总部 Server 部署

### 5.1 生成 Gossip 加密密钥

```bash
# 在管理机执行
nomad operator gossip keyring generate
# 输出示例: cg8StVXbQJ0xsuFBand7zVAonb3A6H3kM4mBaRkNGC0=

# 保存密钥（机密信息！）
echo "cg8StVXbQJ0xsuFBand7zVAonb3A6H3kM4mBaRkNGC0=" > ~/nomad-pki/gossip.key
chmod 600 ~/nomad-pki/gossip.key
```

### 5.2 HQ Server 配置文件

在 HQ Server 1 (10.0.1.11) 上执行：

```bash
sudo tee /opt/nomad/config/server.hcl <<'EOF'
# 基础配置
datacenter = "hq-dc1"
region     = "group-hq"
data_dir   = "/opt/nomad/data"
bind_addr  = "10.0.1.11"
log_level  = "INFO"
log_file   = "/var/log/nomad/"
log_rotate_duration  = "24h"
log_rotate_max_files = 7

# Server 配置
server {
  enabled          = true
  bootstrap_expect = 5
  raft_protocol    = 3
  encrypt          = "cg8StVXbQJ0xsuFBand7zVAonb3A6H3kM4mBaRkNGC0="
  num_schedulers   = 8
  enabled_schedulers = ["service", "batch", "sysbatch", "system"]

  advertise {
    rpc  = "10.0.1.11:4647"
    serf = "10.0.1.11:4648"
  }
}

# 加入其他 HQ Server
server_join {
  retry_join = [
    "10.0.1.12:4648",
    "10.0.1.13:4648",
    "10.0.1.14:4648",
    "10.0.1.15:4648",
  ]
  retry_interval     = "15s"
  retry_max_attempts = 0
}

# ACL 配置
acl {
  enabled            = true
  token_ttl          = "1h"
  policy_ttl         = "5m"
  role_ttl           = "5m"
  enable_key_indices = true
}

# TLS 配置
tls {
  http                      = true
  rpc                       = true
  ca_file                   = "/opt/nomad/tls/ca.crt"
  cert_file                 = "/opt/nomad/tls/server.crt"
  key_file                  = "/opt/nomad/tls/server.key"
  verify_server_client_cert = true
  verify_https_client       = true
}

# Autopilot
autopilot {
  cleanup_dead_servers      = true
  last_contact_threshold    = "500ms"
  max_trailing_logs         = 500
  server_stabilization_time = "10s"
  enable_redundancy_zones   = true
  disable_upgrade_migration = false
  enable_custom_upgrades    = true
}

# 遥测
telemetry {
  prometheus_metrics         = true
  publish_allocation_metrics = true
  publish_node_metrics       = true
  statsd_address             = "127.0.0.1:8125"
}

# 限制
limits {
  rpc_handshake_timeout = "10s"
  rpc_request_timeout   = "30s"
  rpc_max_connections   = 10000
  rpc_rate              = 2000
  rpc_burst             = 4000
}
EOF

sudo chown nomad:nomad /opt/nomad/config/server.hcl
sudo chmod 640 /opt/nomad/config/server.hcl
```

### 5.3 修改其他 HQ Server 的 IP

对 HQ Server 2-5，修改 `bind_addr` 和 `advertise`：

```bash
# HQ Server 2 (10.0.1.12)
sudo sed -i 's/10.0.1.11/10.0.1.12/g' /opt/nomad/config/server.hcl
# 修改 retry_join，排除自己，加入其他节点
sudo sed -i '/10.0.1.12:4648/d' /opt/nomad/config/server.hcl
sudo sed -i 's/10.0.1.12:4648/10.0.1.11:4648/' /opt/nomad/config/server.hcl
```

### 5.4 启动 HQ Server 集群

```bash
# 在所有 5 个 HQ Server 上依次执行
sudo systemctl start nomad-server
sudo systemctl status nomad-server

# 查看日志
sudo journalctl -u nomad-server -f
```

### 5.5 验证集群

```bash
# 配置 CLI 环境
export NOMAD_ADDR="https://10.0.1.11:4646"
export NOMAD_CACERT="/opt/nomad/tls/ca.crt"
export NOMAD_CLIENT_CERT="/opt/nomad/tls/cli.crt"
export NOMAD_CLIENT_KEY="/opt/nomad/tls/cli.key"

# 查看成员
nomad operator members

# 查看 Raft 配置
nomad operator raft list-peers

# 查看集群状态
nomad node status
```

预期输出：
```
Name           Address           Port  Status
hq-srv-01      10.0.1.11         4648  alive
hq-srv-02      10.0.1.12         4648  alive
hq-srv-03      10.0.1.13         4648  alive
hq-srv-04      10.0.1.14         4648  alive
hq-srv-05      10.0.1.15         4648  alive
```

---

## 6. 区域中心 Server 部署

### 6.1 区域中心配置文件

在 cn-n-srv-01 (10.10.0.11) 上执行：

```bash
sudo tee /opt/nomad/config/server.hcl <<'EOF'
# 基础配置
datacenter = "cn-n-dc1"
region     = "cn-north"
data_dir   = "/opt/nomad/data"
bind_addr  = "10.10.0.11"
log_level  = "INFO"
log_file   = "/var/log/nomad/"
log_rotate_duration  = "24h"
log_rotate_max_files = 7

# Server 配置
server {
  enabled          = true
  bootstrap_expect = 5
  raft_protocol    = 3
  encrypt          = "cg8StVXbQJ0xsuFBand7zVAonb3A6H3kM4mBaRkNGC0="
  num_schedulers   = 4
  enabled_schedulers = ["service", "batch", "sysbatch", "system"]

  advertise {
    rpc  = "10.10.0.11:4647"
    serf = "10.10.0.11:4648"
  }
}

# WAN 联邦：加入 HQ Server 和同区域 Server
server_join {
  retry_join = [
    # 集团 HQ Server（用于 WAN 联邦）
    "10.0.1.11:4648",
    "10.0.1.12:4648",
    # 同区域其他 Server
    "10.10.0.12:4648",
    "10.10.0.13:4648",
    "10.10.0.14:4648",
    "10.10.0.15:4648",
  ]
  retry_interval     = "15s"
  retry_max_attempts = 0
}

# ACL：从集团 HQ 复制
acl {
  enabled            = true
  token_ttl          = "1h"
  policy_ttl         = "5m"
  role_ttl           = "5m"
  enable_key_indices = true
  # replication_token 在 ACL 初始化后设置
}

# TLS
tls {
  http                      = true
  rpc                       = true
  ca_file                   = "/opt/nomad/tls/ca.crt"
  cert_file                 = "/opt/nomad/tls/server.crt"
  key_file                  = "/opt/nomad/tls/server.key"
  verify_server_client_cert = true
  verify_https_client       = true
}

# Autopilot
autopilot {
  cleanup_dead_servers      = true
  last_contact_threshold    = "500ms"
  max_trailing_logs         = 500
  server_stabilization_time = "10s"
  enable_redundancy_zones   = true
}

# 遥测
telemetry {
  prometheus_metrics         = true
  publish_allocation_metrics = true
  publish_node_metrics       = true
}
EOF
```

### 6.2 启动区域中心

```bash
# 启动
sudo systemctl start nomad-server

# 验证
nomad operator members -region=cn-north
```

### 6.3 配置 ACL 复制

```bash
# 从 HQ 获取复制 Token
# 在 HQ 上执行
REPLICATION_TOKEN=$(nomad acl token create \
  -name "cn-north-replication" \
  -type "management" \
  -region group-hq \
  -json | jq -r '.SecretID')

echo "Replication Token: $REPLICATION_TOKEN"

# 在区域中心配置
ssh nomad@10.10.0.11 <<EOF
sudo tee -a /opt/nomad/config/server.hcl > /dev/null <<EOL

# ACL 复制 Token
acl {
  replication_token = "${REPLICATION_TOKEN}"
}
EOL
sudo systemctl restart nomad-server
EOF
```

---

## 7. 企业 Server 部署

### 7.1 企业 Server 配置

在 ent-001-srv-01 (10.10.1.11) 上执行：

```bash
sudo tee /opt/nomad/config/server.hcl <<'EOF'
# 基础配置
datacenter = "ent-001-dc1"
region     = "ent-001"
data_dir   = "/opt/nomad/data"
bind_addr  = "10.10.1.11"
log_level  = "INFO"
log_file   = "/var/log/nomad/"
log_rotate_duration  = "24h"
log_rotate_max_files = 7

# Server 配置
server {
  enabled          = true
  bootstrap_expect = 3
  raft_protocol    = 3
  encrypt          = "cg8StVXbQJ0xsuFBand7zVAonb3A6H3kM4mBaRkNGC0="
  num_schedulers   = 2
  enabled_schedulers = ["service", "batch", "sysbatch", "system"]

  advertise {
    rpc  = "10.10.1.11:4647"
    serf = "10.10.1.11:4648"
  }
}

# 通过区域中心加入 gossip 池
server_join {
  retry_join = [
    # 区域中心 Server（WAN 联邦入口）
    "10.10.0.11:4648",
    "10.10.0.12:4648",
    # 同企业其他 Server
    "10.10.1.12:4648",
    "10.10.1.13:4648",
  ]
  retry_interval     = "15s"
  retry_max_attempts = 0
}

# ACL：从区域中心复制
acl {
  enabled            = true
  token_ttl          = "1h"
  policy_ttl         = "5m"
  role_ttl           = "5m"
  enable_key_indices = true
}

# TLS
tls {
  http                      = true
  rpc                       = true
  ca_file                   = "/opt/nomad/tls/ca.crt"
  cert_file                 = "/opt/nomad/tls/server.crt"
  key_file                  = "/opt/nomad/tls/server.key"
  verify_server_client_cert = true
  verify_https_client       = true
}

# Autopilot
autopilot {
  cleanup_dead_servers      = true
  last_contact_threshold    = "500ms"
  max_trailing_logs         = 250
  server_stabilization_time = "10s"
  enable_redundancy_zones   = true
}

# 遥测
telemetry {
  prometheus_metrics         = true
  publish_allocation_metrics = true
  publish_node_metrics       = true
}
EOF
```

### 7.2 批量部署脚本

```bash
cat > ~/deploy-enterprise-servers.sh <<'SCRIPT'
#!/bin/bash
# 批量部署企业 Server
# 用法: ./deploy-enterprise-servers.sh <enterprise_id> <network_prefix> <server_count>

ENT_ID=$1
NET=$2  # 例: 10.10.1
COUNT=$3  # 例: 3

GOSSIP_KEY="cg8StVXbQJ0xsuFBand7zVAonb3A6H3kM4mBaRkNGC0="
REGION_CENTER_IP="10.10.0.11"

echo "========================================="
echo "Deploying Enterprise: $ENT_ID"
echo "Network: $NET.0/24"
echo "Server Count: $COUNT"
echo "========================================="

for i in $(seq 1 $COUNT); do
    IP_SUFFIX=$((10 + i - 1))
    SERVER_IP="${NET}.${IP_SUFFIX}"
    HOSTNAME="${ENT_ID}-srv-$(printf '%02d' $i)"

    echo ">>> Deploying $HOSTNAME ($SERVER_IP)..."

    # 生成 retry_join 列表
    RETRY_JOIN=""
    RETRY_JOIN="${RETRY_JOIN}    \"${REGION_CENTER_IP}:4648\",\n"
    for j in $(seq 1 $COUNT); do
        if [ $j -ne $i ]; then
            PEER_IP_SUFFIX=$((10 + j - 1))
            PEER_IP="${NET}.${PEER_IP_SUFFIX}"
            RETRY_JOIN="${RETRY_JOIN}    \"${PEER_IP}:4648\",\n"
        fi
    done

    # 生成并推送配置
    ssh nomad@${SERVER_IP} "sudo tee /opt/nomad/config/server.hcl > /dev/null <<EOL
datacenter = \"${ENT_ID}-dc1\"
region     = \"${ENT_ID}\"
data_dir   = \"/opt/nomad/data\"
bind_addr  = \"${SERVER_IP}\"
log_level  = \"INFO\"
log_file   = \"/var/log/nomad/\"

server {
  enabled          = true
  bootstrap_expect = ${COUNT}
  raft_protocol    = 3
  encrypt          = \"${GOSSIP_KEY}\"
  num_schedulers   = 2

  advertise {
    rpc  = \"${SERVER_IP}:4647\"
    serf = \"${SERVER_IP}:4648\"
  }
}

server_join {
  retry_join = [
$(echo -e "$RETRY_JOIN" | sed 's/\\n/\n/g')
  ]
  retry_interval = \"15s\"
}

acl {
  enabled            = true
  token_ttl          = \"1h\"
  policy_ttl         = \"5m\"
  role_ttl           = \"5m\"
  enable_key_indices = true
}

tls {
  http                      = true
  rpc                       = true
  ca_file                   = \"/opt/nomad/tls/ca.crt\"
  cert_file                 = \"/opt/nomad/tls/server.crt\"
  key_file                  = \"/opt/nomad/tls/server.key\"
  verify_server_client_cert = true
  verify_https_client       = true
}

autopilot {
  cleanup_dead_servers      = true
  last_contact_threshold    = \"500ms\"
  max_trailing_logs         = 250
  server_stabilization_time = \"10s\"
}

telemetry {
  prometheus_metrics = true
}
EOL
sudo chown nomad:nomad /opt/nomad/config/server.hcl
sudo chmod 640 /opt/nomad/config/server.hcl"

    echo ">>> Starting Nomad on $HOSTNAME..."
    ssh nomad@${SERVER_IP} "sudo systemctl start nomad-server"

    sleep 5
done

echo ">>> Waiting for cluster formation..."
sleep 30

echo ">>> Cluster status:"
nomad operator members -region=${ENT_ID}
SCRIPT

chmod +x ~/deploy-enterprise-servers.sh
```

### 7.3 执行部署

```bash
# 部署企业 001
./deploy-enterprise-servers.sh ent-001 10.10.1 3

# 部署企业 002
./deploy-enterprise-servers.sh ent-002 10.10.2 3

# 批量部署 100 家企业（示例）
for ent_id in $(seq -w 1 100); do
    net_prefix="10.10.$((10#$ent_id))"
    ./deploy-enterprise-servers.sh "ent-${ent_id}" "${net_prefix}" 3
done
```

---

## 8. 企业 Client 部署

### 8.1 Client 配置文件

在 ent-001-cli-01 (10.10.1.100) 上执行：

```bash
sudo tee /opt/nomad/config/client.hcl <<'EOF'
# 基础配置
datacenter = "ent-001-dc1"
region     = "ent-001"
data_dir   = "/opt/nomad/data"
bind_addr  = "10.10.1.100"
log_level  = "INFO"
log_file   = "/var/log/nomad/"
log_rotate_duration  = "24h"
log_rotate_max_files = 7

# Client 配置
client {
  enabled    = true
  node_class = "general"

  meta {
    enterprise  = "ent-001"
    environment = "production"
    rack        = "rack-1"
    zone        = "zone-a"
    role        = "worker"
  }

  node_pool = "ent-001"

  # 资源预留
  reserve {
    cpu            = 500    # MHz
    memory         = 512    # MB
    disk           = 1024   # MB
    reserved_ports = "22,80,443,4646,4647,4648"
  }

  # 主机卷
  host_volume "ent-001-data" {
    path      = "/opt/nomad/volumes/data"
    read_only = false
  }

  host_volume "ent-001-logs" {
    path      = "/var/log/nomad-jobs"
    read_only = false
  }
}

# 指向企业 Server
server_join {
  retry_join = [
    "10.10.1.11:4647",
    "10.10.1.12:4647",
    "10.10.1.13:4647",
  ]
  retry_interval = "15s"
}

# TLS
tls {
  http = true
  rpc  = true
  ca_file   = "/opt/nomad/tls/ca.crt"
  cert_file = "/opt/nomad/tls/client.crt"
  key_file  = "/opt/nomad/tls/client.key"
}

# 遥测
telemetry {
  prometheus_metrics = true
}
EOF

sudo chown nomad:nomad /opt/nomad/config/client.hcl
sudo chmod 640 /opt/nomad/config/client.hcl
```

### 8.2 启动 Client

```bash
# 创建卷目录
sudo mkdir -p /opt/nomad/volumes/data /var/log/nomad-jobs
sudo chown -R nomad:nomad /opt/nomad/volumes /var/log/nomad-jobs

# 启动
sudo systemctl start nomad-client
sudo systemctl status nomad-client

# 验证
nomad node status -region=ent-001
```

### 8.3 批量部署 Client 脚本

```bash
cat > ~/deploy-clients.sh <<'SCRIPT'
#!/bin/bash
# 批量部署 Client
# 用法: ./deploy-clients.sh <enterprise_id> <network_prefix> <start_ip> <count>

ENT_ID=$1
NET=$2
START_IP=$3
COUNT=$4

SERVER_IPS="${NET}.11 ${NET}.12 ${NET}.13"

for i in $(seq 0 $((COUNT - 1))); do
    CLIENT_IP="${NET}.$((START_IP + i))"
    HOSTNAME="${ENT_ID}-cli-$(printf '%03d' $((i + 1)))"

    echo ">>> Deploying $HOSTNAME ($CLIENT_IP)..."

    # 构建 server_join
    JOIN_STR=""
    for srv_ip in $SERVER_IPS; do
        JOIN_STR="${JOIN_STR}    \"${srv_ip}:4647\",\n"
    done

    ssh nomad@${CLIENT_IP} "sudo tee /opt/nomad/config/client.hcl > /dev/null <<EOL
datacenter = \"${ENT_ID}-dc1\"
region     = \"${ENT_ID}\"
data_dir   = \"/opt/nomad/data\"
bind_addr  = \"${CLIENT_IP}\"
log_level  = \"INFO\"
log_file   = \"/var/log/nomad/\"

client {
  enabled    = true
  node_class = \"general\"

  meta {
    enterprise  = \"${ENT_ID}\"
    environment = \"production\"
    zone        = \"zone-$(((i % 2) + 1))\"
  }

  node_pool = \"${ENT_ID}\"

  reserve {
    cpu            = 500
    memory         = 512
    disk           = 1024
    reserved_ports = \"22,80,443,4646,4647,4648\"
  }

  host_volume \"${ENT_ID}-data\" {
    path      = \"/opt/nomad/volumes/data\"
    read_only = false
  }
}

server_join {
  retry_join = [
$(echo -e "$JOIN_STR" | sed 's/\\n/\n/g')
  ]
  retry_interval = \"15s\"
}

tls {
  http = true
  rpc  = true
  ca_file   = \"/opt/nomad/tls/ca.crt\"
  cert_file = \"/opt/nomad/tls/client.crt\"
  key_file  = \"/opt/nomad/tls/client.key\"
}

telemetry {
  prometheus_metrics = true
}
EOL

sudo mkdir -p /opt/nomad/volumes/data
sudo chown -R nomad:nomad /opt/nomad/volumes /opt/nomad/config
sudo chmod 640 /opt/nomad/config/client.hcl
sudo systemctl start nomad-client"

    sleep 3
done

echo ">>> Client deployment complete for $ENT_ID"
echo ">>> Nodes:"
nomad node status -region=${ENT_ID}
SCRIPT

chmod +x ~/deploy-clients.sh

# 执行：部署 20 个 Client 到企业 001
./deploy-clients.sh ent-001 10.10.1 100 20
```

---

## 9. ACL 体系配置

### 9.1 初始化 ACL

```bash
# 在 HQ Server 上执行
export NOMAD_ADDR="https://10.0.1.11:4646"
export NOMAD_CACERT="/opt/nomad/tls/ca.crt"
export NOMAD_CLIENT_CERT="/opt/nomad/tls/cli.crt"
export NOMAD_CLIENT_KEY="/opt/nomad/tls/cli.key"

# 启用 ACL
nomad acl enable

# 获取 Bootstrap Token（保存好！）
nomad acl bootstrap
# 输出示例：
# Secret ID  = 9b4dee12-3eae-4de0-b7a1-8b30d6f4d4d6
# Accessor ID = 5c5f3a32-...
```

```bash
# 保存 Bootstrap Token
export NOMAD_TOKEN="9b4dee12-3eae-4de0-b7a1-8b30d6f4d4d6"

# 添加到环境变量
sudo tee -a /etc/profile.d/nomad.sh <<EOF
export NOMAD_TOKEN="${NOMAD_TOKEN}"
EOF

source /etc/profile.d/nomad.sh
```

### 9.2 创建管理策略

```bash
# 全局管理策略
cat > ~/policies/global-admin.hcl <<'EOF'
namespace "*" {
  policy       = "write"
  capabilities = ["alloc-exec", "alloc-lifecycle", "read-logs", "read-fs"]
}

node {
  policy = "write"
}

plugin {
  policy = "write"
}

operator {
  policy = "write"
}

host_volume "*" {
  policy = "write"
}

node_pool "*" {
  policy = "write"
}
EOF

# 应用策略
nomad acl policy apply \
  -name "global-admin" \
  -description "Global Administrator Policy" \
  -rules @~/policies/global-admin.hcl
```

### 9.3 创建企业级策略

```bash
# 企业 001 策略
cat > ~/policies/ent-001-admin.hcl <<'EOF'
namespace "ent-001-*" {
  policy       = "write"
  capabilities = ["alloc-exec", "alloc-lifecycle", "read-logs", "read-fs"]
}

namespace "ent-001-shared" {
  policy       = "read"
  capabilities = ["read-logs"]
}

node {
  policy = "read"
}

node_pool "ent-001" {
  policy = "write"
}

host_volume "ent-001-*" {
  policy = "write"
}
EOF

nomad acl policy apply \
  -name "ent-001-admin" \
  -description "Enterprise 001 Administrator" \
  -rules @~/policies/ent-001-admin.hcl

# 企业 001 只读策略
cat > ~/policies/ent-001-readonly.hcl <<'EOF'
namespace "ent-001-*" {
  policy       = "read"
  capabilities = ["read-logs", "read-fs"]
}

node {
  policy = "read"
}

node_pool "ent-001" {
  policy = "read"
}
EOF

nomad acl policy apply \
  -name "ent-001-readonly" \
  -description "Enterprise 001 Read Only" \
  -rules @~/policies/ent-001-readonly.hcl
```

### 9.4 创建企业 Token

```bash
# 为企业 001 创建管理员 Token
ENT001_ADMIN_TOKEN=$(nomad acl token create \
  -name "ent-001-admin-token" \
  -policy "ent-001-admin" \
  -json | jq -r '.SecretID')

echo "Enterprise 001 Admin Token: $ENT001_ADMIN_TOKEN"

# 为企业 001 创建只读 Token
ENT001_RO_TOKEN=$(nomad acl token create \
  -name "ent-001-readonly-token" \
  -policy "ent-001-readonly" \
  -json | jq -r '.SecretID')

echo "Enterprise 001 Read-Only Token: $ENT001_RO_TOKEN"

# 保存 Token 到安全存储
echo $ENT001_ADMIN_TOKEN | vault kv put secret/nomad/tokens/ent-001-admin value=-
echo $ENT001_RO_TOKEN | vault kv put secret/nomad/tokens/ent-001-readonly value=-
```

### 9.5 创建 CI/CD 专用 Token

```bash
cat > ~/policies/cicd-ent-001.hcl <<'EOF'
namespace "ent-001-apps" {
  policy       = "write"
  capabilities = ["alloc-lifecycle"]
}

namespace "ent-001-jobs" {
  policy       = "write"
  capabilities = ["alloc-lifecycle"]
}
EOF

nomad acl policy apply \
  -name "cicd-ent-001" \
  -description "CI/CD for Enterprise 001" \
  -rules @~/policies/cicd-ent-001.hcl

CICD_TOKEN=$(nomad acl token create \
  -name "cicd-ent-001-token" \
  -policy "cicd-ent-001" \
  -json | jq -r '.SecretID')

echo "CI/CD Token: $CICD_TOKEN"
```

### 9.6 批量创建企业策略脚本

```bash
cat > ~/setup-enterprise-acl.sh <<'SCRIPT'
#!/bin/bash
# 用法: ./setup-enterprise-acl.sh <enterprise_id>

ENT_ID=$1

# 企业管理员策略
cat > /tmp/${ENT_ID}-admin.hcl <<EOF
namespace "${ENT_ID}-*" {
  policy       = "write"
  capabilities = ["alloc-exec", "alloc-lifecycle", "read-logs", "read-fs"]
}

node {
  policy = "read"
}

node_pool "${ENT_ID}" {
  policy = "write"
}

host_volume "${ENT_ID}-*" {
  policy = "write"
}
EOF

nomad acl policy apply \
  -name "${ENT_ID}-admin" \
  -description "${ENT_ID} Administrator" \
  -rules @/tmp/${ENT_ID}-admin.hcl

# 企业只读策略
cat > /tmp/${ENT_ID}-readonly.hcl <<EOF
namespace "${ENT_ID}-*" {
  policy       = "read"
  capabilities = ["read-logs", "read-fs"]
}

node {
  policy = "read"
}

node_pool "${ENT_ID}" {
  policy = "read"
}
EOF

nomad acl policy apply \
  -name "${ENT_ID}-readonly" \
  -description "${ENT_ID} Read Only" \
  -rules @/tmp/${ENT_ID}-readonly.hcl

# 创建 Token
ADMIN_TOKEN=$(nomad acl token create \
  -name "${ENT_ID}-admin-token" \
  -policy "${ENT_ID}-admin" \
  -json | jq -r '.SecretID')

RO_TOKEN=$(nomad acl token create \
  -name "${ENT_ID}-readonly-token" \
  -policy "${ENT_ID}-readonly" \
  -json | jq -r '.SecretID')

echo ">>> ${ENT_ID} Admin Token: ${ADMIN_TOKEN}"
echo ">>> ${ENT_ID} RO Token: ${RO_TOKEN}"

# 保存到 Vault
vault kv put secret/nomad/tokens/${ENT_ID} admin=${ADMIN_TOKEN} readonly=${RO_TOKEN}
SCRIPT

chmod +x ~/setup-enterprise-acl.sh

# 批量执行
for ent_id in $(seq -w 1 100); do
    ./setup-enterprise-acl.sh "ent-${ent_id}"
done
```

---

## 10. Gossip 加密配置

### 10.1 生成加密密钥（已在 5.1 完成）

```bash
# 查看 gossip 密钥
cat ~/nomad-pki/gossip.key
# 输出: cg8StVXbQJ0xsuFBand7zVAonb3A6H3kM4mBaRkNGC0=
```

### 10.2 在所有 Server 配置加密

```bash
# 验证所有 Server 配置文件中已包含 encrypt
for srv_ip in 10.0.1.11 10.0.1.12 10.0.1.13 10.0.1.14 10.0.1.15; do
    echo ">>> Checking $srv_ip..."
    ssh nomad@$srv_ip "grep -E '^\s*encrypt' /opt/nomad/config/server.hcl"
done
```

### 10.3 轮换 Gossip 密钥

```bash
# 1. 生成新密钥
NEW_KEY=$(nomad operator gossip keyring generate)
echo "New Key: $NEW_KEY"

# 2. 在所有 Server 上添加新密钥（不立即使用）
for srv_ip in 10.0.1.11 10.0.1.12 10.0.1.13 10.0.1.14 10.0.1.15; do
    echo ">>> Installing key on $srv_ip..."
    nomad operator gossip keyring install -key=$NEW_KEY
done

# 3. 使用新密钥
nomad operator gossip keyring use -key=$NEW_KEY

# 4. 等待传播
sleep 60

# 5. 删除旧密钥
OLD_KEY=$(nomad operator gossip keyring list | grep -v $NEW_KEY | head -1)
nomad operator gossip keyring remove -key=$OLD_KEY

# 6. 更新配置文件
for srv_ip in 10.0.1.11 10.0.1.12 10.0.1.13 10.0.1.14 10.0.1.15; do
    ssh nomad@$srv_ip "sudo sed -i 's/encrypt\s*=.*/encrypt = \"${NEW_KEY}\"/' /opt/nomad/config/server.hcl"
done
```

---

## 11. WAN 联邦配置

### 11.1 验证 WAN 联邦

```bash
# 从 HQ 查看所有 Region
export NOMAD_ADDR="https://10.0.1.11:4646"
export NOMAD_TOKEN="$NOMAD_TOKEN"

# 列出所有 Region
nomad operator members -region=group-hq
nomad operator members -region=cn-north
nomad operator members -region=ent-001

# WAN 联邦成员列表
nomad operator members -wan
```

预期输出：
```
Name              Address       Port  Status
hq-srv-01.group-hq      10.0.1.11     4648  alive
hq-srv-02.group-hq      10.0.1.12     4648  alive
...
cn-n-srv-01.cn-north    10.10.0.11    4648  alive
...
ent-001-srv-01.ent-001  10.10.1.11    4648  alive
...
```

### 11.2 跨 Region 查询

```bash
# 从集团 HQ 查询企业 001 的节点
nomad node status -region=ent-001

# 从集团 HQ 提交作业到企业 001
nomad job run -region=ent-001 app.nomad

# 从集团 HQ 查询企业 001 的作业
nomad job status -region=ent-001
```

### 11.3 跨 Region 故障转移示例

```bash
# 企业 001 的作业定义（带跨 region 故障转移）
cat > ~/jobs/ent-001-critical-app.nomad <<'EOF'
job "ent-001-critical-app" {
  region    = "ent-001"
  datacenters = ["ent-001-dc1"]
  type      = "service"

  # 故障转移目标
  migrate {
    max_parallel     = 2
  }

  update {
    max_parallel      = 2
    health_check      = "checks"
    min_healthy_time  = "30s"
    healthy_deadline  = "5m"
    progress_deadline = "10m"
    auto_revert       = true
    auto_promote      = true
    canary            = 1
  }

  group "web" {
    count = 3

    network {
      port "http" {
        to = 8080
      }
    }

    task "app" {
      driver = "docker"
      config {
        image = "registry.group.com/apps/critical-app:v2.1.0"
        ports = ["http"]
      }

      resources {
        cpu    = 500
        memory = 512
      }

      service {
        name = "critical-app"
        port = "http"

        check {
          type     = "http"
          path     = "/health"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }
  }
}
EOF
```

---

## 12. Node Pool 与多租户

### 12.1 创建 Node Pool

```bash
# 为每个企业创建 Node Pool
cat > ~/create-node-pools.sh <<'SCRIPT'
#!/bin/bash

for ent_id in $(seq -w 1 100); do
    ENT_ID="ent-${ent_id}"

    # 创建 Node Pool
    cat > /tmp/${ENT_ID}-pool.hcl <<EOF
node_pool "${ENT_ID}" {
  description = "Node pool for ${ENT_ID}"
  meta {
    enterprise = "${ENT_ID}"
  }
}
EOF

    nomad node pool apply @/tmp/${ENT_ID}-pool.hcl
    echo "Created Node Pool: ${ENT_ID}"
done
SCRIPT

chmod +x ~/create-node-pools.sh
./create-node-pools.sh
```

### 12.2 创建共享 Node Pool

```bash
# 集团共享资源池
cat > ~/pools/shared-pool.hcl <<'EOF'
node_pool "shared-services" {
  description = "Shared services pool for cross-enterprise apps"
  meta {
    type    = "shared"
    billing = "group"
  }
}
EOF

nomad node pool apply @~/pools/shared-pool.hcl

# 区域中心 Node Pool
cat > ~/pools/region-pool.hcl <<'EOF'
node_pool "cn-north-pool" {
  description = "CN North regional pool"
  meta {
    region = "cn-north"
  }
}
EOF

nomad node pool apply @~/pools/region-pool.hcl
```

### 12.3 Namespace 配置

```bash
# 为每个企业创建 Namespace
cat > ~/create-namespaces.sh <<'SCRIPT'
#!/bin/bash

for ent_id in $(seq -w 1 100); do
    ENT_ID="ent-${ent_id}"

    # 主应用 Namespace
    cat > /tmp/${ENT_ID}-apps-ns.hcl <<EOF
namespace "${ENT_ID}-apps" {
  description = "Applications for ${ENT_ID}"
  quota       = "${ENT_ID}-apps-quota"
}
EOF

    nomad namespace apply @/tmp/${ENT_ID}-apps-ns.hcl

    # CI/CD Namespace
    cat > /tmp/${ENT_ID}-cicd-ns.hcl <<EOF
namespace "${ENT_ID}-cicd" {
  description = "CI/CD jobs for ${ENT_ID}"
  quota       = "${ENT_ID}-cicd-quota"
}
EOF

    nomad namespace apply @/tmp/${ENT_ID}-cicd-ns.hcl

    echo "Created namespaces for ${ENT_ID}"
done
SCRIPT

chmod +x ~/create-namespaces.sh
./create-namespaces.sh
```

### 12.4 配额管理

```bash
# 企业 001 的配额
cat > ~/quotas/ent-001-apps-quota.hcl <<'EOF'
quota "ent-001-apps-quota" {
  description = "Resource quota for ent-001 apps"

  limit {
    region    = "ent-001"
    cores     = 200    # 200 cores
    memory    = 400    # 400 GB
    memory_mb = 409600 # MB
  }
}
EOF

nomad quota apply @~/quotas/ent-001-apps-quota.hcl

# CI/CD 配额（较小）
cat > ~/quotas/ent-001-cicd-quota.hcl <<'EOF'
quota "ent-001-cicd-quota" {
  description = "Resource quota for ent-001 CI/CD"

  limit {
    region    = "ent-001"
    cores     = 50
    memory    = 100
    memory_mb = 102400
  }
}
EOF

nomad quota apply @~/quotas/ent-001-cicd-quota.hcl
```

### 12.5 多租户作业示例

```bash
# 企业 001 的应用作业（绑定到企业 Namespace 和 Node Pool）
cat > ~/jobs/ent-001-webapp.nomad <<'EOF'
job "webapp" {
  region      = "ent-001"
  namespace   = "ent-001-apps"
  node_pool   = "ent-001"
  datacenters = ["ent-001-dc1"]
  type        = "service"

  group "web" {
    count = 3

    spread {
      target = "zone"
      attribute = "${node.meta.zone}"
      weight = 100

      target "zone-1" { percent = 50 }
      target "zone-2" { percent = 50 }
    }

    network {
      port "http" { to = 8080 }
    }

    task "app" {
      driver = "docker"
      config {
        image = "registry.group.com/ent-001/webapp:v1.0"
        ports = ["http"]
        auth {
          username = "registry-user"
          password = "${NOMAD_SECRET_REGISTRY_PASS}"
        }
      }

      template {
        data = <<EOH
DB_HOST={{ with secret "secret/ent-001/db" }}{{ .Data.data.host }}{{ end }}
DB_PASS={{ with secret "secret/ent-001/db" }}{{ .Data.data.password }}{{ end }}
EOH
        destination = "secrets/env"
        env         = true
      }

      resources {
        cpu    = 500
        memory = 512
      }

      service {
        name = "webapp"
        port = "http"
        tags = ["ent-001", "production"]

        check {
          type     = "http"
          path     = "/health"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }
  }
}
EOF
```

---

## 13. Vault 集成

### 13.1 安装 Vault

```bash
# 下载 Vault
VAULT_VERSION="1.16.0"
cd /tmp
wget https://releases.hashicorp.com/vault/${VAULT_VERSION}/vault_${VAULT_VERSION}_linux_amd64.zip
unzip vault_${VAULT_VERSION}_linux_amd64.zip
sudo mv vault /usr/local/bin/
```

### 13.2 Vault Server 配置

```bash
# 在专用 Vault 服务器上
sudo mkdir -p /opt/vault/{data,config,tls,logs}

sudo tee /opt/vault/config/vault.hcl <<'EOF'
storage "raft" {
  path    = "/opt/vault/data"
  node_id = "vault-srv-01"
}

listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_cert_file = "/opt/vault/tls/vault.crt"
  tls_key_file  = "/opt/vault/tls/vault.key"
}

api_addr     = "https://10.0.2.11:8200"
cluster_addr = "https://10.0.2.11:8201"

seal "awskms" {
  region     = "cn-north-1"
  access_key = "AKIAxxx"
  secret_key = "xxx"
  kms_key_id = "alias/vault-auto-unseal"
}

ui = true
disable_mlock = false
EOF

# 创建 systemd 服务
sudo tee /etc/systemd/system/vault.service <<'EOF'
[Unit]
Description=Vault
After=network-online.target
Wants=network-online.target

[Service]
User=vault
Group=vault
ExecStart=/usr/local/bin/vault server -config=/opt/vault/config/vault.hcl
Restart=on-failure
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable --now vault
```

### 13.3 初始化 Vault

```bash
export VAULT_ADDR="https://10.0.2.11:8200"
export VAULT_CACERT="/opt/vault/tls/ca.crt"

# 初始化
vault operator init -key-shares=5 -key-threshold=3 > /tmp/vault-init.txt

# 解封
for key in $(grep "Unseal Key" /tmp/vault-init.txt | awk '{print $4}'); do
    vault operator unseal $key
done

# 登录
ROOT_TOKEN=$(grep "Initial Root Token" /tmp/vault-init.txt | awk '{print $4}')
vault login $ROOT_TOKEN
```

### 13.4 配置 Nomad 与 Vault 集成

#### 13.4.1 启用 KV 引擎

```bash
# 启用 KV v2
vault secrets enable -path=secret kv-v2

# 为企业 001 创建路径
vault kv put secret/ent-001/db host="db-ent-001.group.com" password="s3cr3t-db-pass"
vault kv put secret/ent-001/api key="api-key-12345"
```

#### 13.4.2 启用认证后端

```bash
# 启用 JWT 认证（用于 Nomad Workload Identity）
vault auth enable jwt

# 配置 JWT 后端
vault write auth/jwt/config \
  oidc_discovery_url="https://10.0.1.11:4646/.well-known/jwks.json" \
  bound_issuer="nomad" \
  default_role="nomad-workload"
```

#### 13.4.3 创建角色和策略

```bash
# 企业 001 的 Vault 策略
cat > /tmp/ent-001-vault-policy.hcl <<'EOF'
path "secret/data/ent-001/*" {
  capabilities = ["read"]
}

path "secret/metadata/ent-001/*" {
  capabilities = ["list", "read"]
}
EOF

vault policy write ent-001-apps /tmp/ent-001-vault-policy.hcl

# 创建角色
vault write auth/jwt/role/ent-001-apps \
  role_type=jwt \
  bound_audiences="vault.io" \
  user_claim="/nomad_job_id" \
  token_type="service" \
  token_policies="ent-001-apps" \
  token_ttl="1h" \
  token_max_ttl="4h"
```

#### 13.4.4 Nomad Server 配置 Vault

在 Server 配置文件中添加：

```bash
# 在所有 Nomad Server 上执行
sudo tee -a /opt/nomad/config/server.hcl > /dev/null <<'EOF'

# Vault 配置
vault {
  enabled = true
  address = "https://10.0.2.11:8200"

  # 任务身份
  task_identity {
    enabled = true
    aud     = ["vault.io"]
    ttl     = "1h"
  }

  # 默认角色
  default_identity {
    aud = ["vault.io"]
    ttl = "1h"
  }

  # TLS
  ca_file   = "/opt/nomad/tls/ca.crt"
  cert_file = "/opt/nomad/tls/server.crt"
  key_file  = "/opt/nomad/tls/server.key"
}
EOF

sudo systemctl restart nomad-server
```

### 13.5 作业中使用 Vault

```bash
# 企业 001 应用使用 Vault
cat > ~/jobs/ent-001-app-with-vault.nomad <<'EOF'
job "ent-001-app" {
  region      = "ent-001"
  namespace   = "ent-001-apps"
  node_pool   = "ent-001"
  datacenters = ["ent-001-dc1"]

  group "web" {
    task "app" {
      driver = "docker"
      config {
        image = "registry.group.com/ent-001/app:v1.0"
      }

      # 使用 JWT 身份认证
      identity {
        env  = true
        file = true
      }

      vault {
        policies = ["ent-001-apps"]
        namespace = "ent-001"
      }

      template {
        data = <<EOH
{{ with secret "secret/ent-001/db" }}
DB_HOST={{ .Data.data.host }}
DB_PASS={{ .Data.data.password }}
{{ end }}
{{ with secret "secret/ent-001/api" }}
API_KEY={{ .Data.data.key }}
{{ end }}
EOH
        destination = "secrets/env"
        env         = true
      }

      resources {
        cpu    = 500
        memory = 512
      }
    }
  }
}
EOF
```

---

## 14. 监控部署

### 14.1 Prometheus 部署

#### 14.1.1 安装 Prometheus

```bash
# 创建用户
sudo useradd --system --no-create-home --shell /usr/sbin/nologin prometheus

# 创建目录
sudo mkdir -p /opt/prometheus/{data,config,rules}
sudo chown -R prometheus:prometheus /opt/prometheus

# 下载
PROM_VERSION="2.52.0"
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v${PROM_VERSION}/prometheus-${PROM_VERSION}.linux-amd64.tar.gz
tar xzf prometheus-${PROM_VERSION}.linux-amd64.tar.gz
sudo mv prometheus-${PROM_VERSION}.linux-amd64/{prometheus,promtool} /usr/local/bin/
```

#### 14.1.2 Prometheus 配置

```bash
sudo tee /opt/prometheus/config/prometheus.yml <<'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'group-nomad'
    environment: 'production'

# 告警规则
rule_files:
  - "rules/*.yml"

# 告警管理
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['10.0.3.11:9093']

# 抓取配置
scrape_configs:
  # HQ Server
  - job_name: 'nomad-hq-servers'
    scheme: https
    tls_config:
      ca_file: /opt/prometheus/tls/ca.crt
      cert_file: /opt/prometheus/tls/cli.crt
      key_file: /opt/prometheus/tls/cli.key
      insecure_skip_verify: false
    static_configs:
      - targets:
          - '10.0.1.11:4646'
          - '10.0.1.12:4646'
          - '10.0.1.13:4646'
          - '10.0.1.14:4646'
          - '10.0.1.15:4646'
        labels:
          region: 'group-hq'

  # 区域中心 Server
  - job_name: 'nomad-cn-north-servers'
    scheme: https
    tls_config:
      ca_file: /opt/prometheus/tls/ca.crt
      cert_file: /opt/prometheus/tls/cli.crt
      key_file: /opt/prometheus/tls/cli.key
    static_configs:
      - targets:
          - '10.10.0.11:4646'
          - '10.10.0.12:4646'
          - '10.10.0.13:4646'
        labels:
          region: 'cn-north'

  # 企业 Server (动态发现)
  - job_name: 'nomad-enterprise-servers'
    scheme: https
    tls_config:
      ca_file: /opt/prometheus/tls/ca.crt
      cert_file: /opt/prometheus/tls/cli.crt
      key_file: /opt/prometheus/tls/cli.key
    nomad_sd_configs:
      - server: 'https://10.0.1.11:4646'
        tls_config:
          ca_file: /opt/prometheus/tls/ca.crt
          cert_file: /opt/prometheus/tls/cli.crt
          key_file: /opt/prometheus/tls/cli.key
        region: 'ent-001'
    relabel_configs:
      - source_labels: [__meta_nomad_node_name]
        target_label: node_name

  # 所有 Client
  - job_name: 'nomad-clients'
    scheme: https
    tls_config:
      ca_file: /opt/prometheus/tls/ca.crt
      cert_file: /opt/prometheus/tls/cli.crt
      key_file: /opt/prometheus/tls/cli.key
    nomad_sd_configs:
      - server: 'https://10.0.1.11:4646'
        tls_config:
          ca_file: /opt/prometheus/tls/ca.crt
          cert_file: /opt/prometheus/tls/cli.crt
          key_file: /opt/prometheus/tls/cli.key

  # Node Exporter
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['10.0.1.11:9100', '10.0.1.12:9100', '10.0.1.13:9100']
        labels:
          type: 'server'
EOF
```

#### 14.1.3 告警规则

```bash
sudo tee /opt/prometheus/rules/nomad-alerts.yml <<'EOF'
groups:
  - name: nomad-cluster
    rules:
      # Server 宕机
      - alert: NomadServerDown
        expr: up{job="nomad-hq-servers"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Nomad Server {{ $labels.instance }} is down"

      # 集群无 Leader
      - alert: NomadNoLeader
        expr: nomad_raft_leader == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "No Nomad Leader in region {{ $labels.region }}"

      # 评估失败
      - alert: NomadEvalFailed
        expr: increase(nomad_scheduler_total_evals[5m]) > 10
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High evaluation failures"

      # 节点离线
      - alert: NomadNodeDown
        expr: nomad_client_allocated_cpu < 0
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Node {{ $labels.node }} is down"

      # 内存使用率高
      - alert: NomadHighMemoryUsage
        expr: (nomad_client_allocated_memory / nomad_client_total_memory) * 100 > 85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Memory usage > 85% on {{ $labels.node }}"
EOF
```

#### 14.1.4 启动 Prometheus

```bash
sudo tee /etc/systemd/system/prometheus.service <<'EOF'
[Unit]
Description=Prometheus
After=network.target

[Service]
User=prometheus
ExecStart=/usr/local/bin/prometheus \
  --config.file=/opt/prometheus/config/prometheus.yml \
  --storage.tsdb.path=/opt/prometheus/data \
  --storage.tsdb.retention.time=90d \
  --web.enable-lifecycle

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable --now prometheus
```

### 14.2 Grafana 部署

```bash
# 安装
sudo apt-get install -y adduser libfontconfig1
wget https://dl.grafana.com/oss/release/grafana_11.0.0_amd64.deb
sudo dpkg -i grafana_11.0.0_amd64.deb

# 配置数据源
sudo tee /etc/grafana/provisioning/datasources/prometheus.yml <<'EOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://localhost:9090
    isDefault: true
EOF

# 启动
sudo systemctl enable --now grafana-server
```

### 14.3 Node Exporter 部署（所有节点）

```bash
# 一键部署脚本
cat > ~/install-node-exporter.sh <<'SCRIPT'
#!/bin/bash
NE_VERSION="1.8.2"
cd /tmp
wget https://github.com/prometheus/node_exporter/releases/download/v${NE_VERSION}/node_exporter-${NE_VERSION}.linux-amd64.tar.gz
tar xzf node_exporter-${NE_VERSION}.linux-amd64.tar.gz
sudo mv node_exporter-${NE_VERSION}.linux-amd64/node_exporter /usr/local/bin/

sudo tee /etc/systemd/system/node-exporter.service <<'EOF'
[Unit]
Description=Node Exporter
After=network.target

[Service]
ExecStart=/usr/local/bin/node_exporter --web.listen-address=:9100

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable --now node-exporter
SCRIPT

chmod +x ~/install-node-exporter.sh
```

---

## 15. 日志聚合

### 15.1 使用 Loki + Promtail

#### 15.1.1 安装 Loki

```bash
# 下载
LOKI_VERSION="2.9.8"
cd /tmp
wget https://github.com/grafana/loki/releases/download/v${LOKI_VERSION}/loki-linux-amd64.zip
unzip loki-linux-amd64.zip
sudo mv loki-linux-amd64 /usr/local/bin/loki

# 配置
sudo mkdir -p /opt/loki/{data,config}
sudo tee /opt/loki/config/loki.yml <<'EOF'
auth_enabled: false

server:
  http_listen_port: 3100

common:
  path_prefix: /opt/loki/data
  storage:
    filesystem:
      chunks_directory: /opt/loki/data/chunks
      rules_directory: /opt/loki/data/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: index_
        period: 24h

limits_config:
  retention_period: 720h
  max_query_series: 5000
EOF

# 启动
sudo tee /etc/systemd/system/loki.service <<'EOF'
[Unit]
Description=Loki
After=network.target

[Service]
ExecStart=/usr/local/bin/loki -config.file=/opt/loki/config/loki.yml

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable --now loki
```

#### 15.1.2 Promtail 配置

```bash
# 在所有节点
sudo mkdir -p /opt/promtail/config

sudo tee /opt/promtail/config/promtail.yml <<'EOF'
server:
  http_listen_port: 9080

positions:
  filename: /opt/promtail/positions.yaml

clients:
  - url: http://10.0.3.12:3100/loki/api/v1/push

scrape_configs:
  # Nomad Server 日志
  - job_name: nomad-server
    static_configs:
      - targets: [localhost]
        labels:
          job: nomad-server
          host: ${HOSTNAME}
          __path__: /var/log/nomad/*.log

  # Nomad Job 日志
  - job_name: nomad-jobs
    static_configs:
      - targets: [localhost]
        labels:
          job: nomad-jobs
          host: ${HOSTNAME}
          __path__: /opt/nomad/data/alloc/*/alloc/logs/*.{stderr,stdout}.*.*
    relabel_configs:
      - source_labels: [__path__]
        regex: '/opt/nomad/data/alloc/([^/]+)/.*'
        target_label: alloc_id
EOF

sudo systemctl enable --now promtail
```

### 15.2 Nomad 作业日志查询

```bash
# 使用 nomad CLI 查询
nomad alloc logs <alloc-id>
nomad alloc logs -f <alloc-id>  # follow
nomad alloc logs -tail 100 <alloc-id>

# 在 Grafana Loki 中查询
# {job="nomad-jobs", alloc_id="<alloc-id>"}
```

---

## 16. 备份与恢复

### 16.1 Raft 快照备份

```bash
# 创建备份脚本
cat > ~/backup-nomad.sh <<'SCRIPT'
#!/bin/bash
# 用法: ./backup-nomad.sh <region>

REGION=$1
BACKUP_DIR="/opt/backups/nomad/${REGION}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${REGION}_${DATE}.snap"

mkdir -p ${BACKUP_DIR}

# 选择目标 Server
case ${REGION} in
    group-hq) NOMAD_SERVER="10.0.1.11" ;;
    cn-north) NOMAD_SERVER="10.10.0.11" ;;
    ent-001)  NOMAD_SERVER="10.10.1.11" ;;
    *) echo "Unknown region"; exit 1 ;;
esac

export NOMAD_ADDR="https://${NOMAD_SERVER}:4646"
export NOMAD_CACERT="/opt/nomad/tls/ca.crt"
export NOMAD_CLIENT_CERT="/opt/nomad/tls/cli.crt"
export NOMAD_CLIENT_KEY="/opt/nomad/tls/cli.key"
export NOMAD_TOKEN="${NOMAD_TOKEN}"

echo ">>> Backing up ${REGION}..."

# 执行快照
nomad operator snapshot save ${BACKUP_FILE}

# 压缩
gzip ${BACKUP_FILE}

# 清理 7 天前的备份
find ${BACKUP_DIR} -name "*.snap.gz" -mtime +7 -delete

echo ">>> Backup complete: ${BACKUP_FILE}.gz"
ls -lh ${BACKUP_DIR}
SCRIPT

chmod +x ~/backup-nomad.sh

# 添加到 crontab
echo "0 2 * * * /home/nomad/backup-nomad.sh group-hq >> /var/log/nomad-backup.log 2>&1" | sudo tee -a /var/spool/cron/crontabs/root
echo "0 3 * * * /home/nomad/backup-nomad.sh cn-north >> /var/log/nomad-backup.log 2>&1" | sudo tee -a /var/spool/cron/crontabs/root
```

### 16.2 配置备份

```bash
cat > ~/backup-configs.sh <<'SCRIPT'
#!/bin/bash
BACKUP_DIR="/opt/backups/configs"
DATE=$(date +%Y%m%d)
mkdir -p ${BACKUP_DIR}

# 备份所有 Server 配置
for srv_ip in 10.0.1.11 10.0.1.12 10.0.1.13; do
    HOSTNAME=$(ssh nomad@$srv_ip "hostname")
    ssh nomad@$srv_ip "sudo tar czf - /opt/nomad/config" > ${BACKUP_DIR}/${HOSTNAME}_${DATE}.tar.gz
done

# 备份 ACL 策略和 Token
nomad acl policy list -json > ${BACKUP_DIR}/policies_${DATE}.json
nomad acl token list -json > ${BACKUP_DIR}/tokens_${DATE}.json

# 备份 Namespace 和 Quota
nomad namespace list -json > ${BACKUP_DIR}/namespaces_${DATE}.json
nomad quota list -json > ${BACKUP_DIR}/quotas_${DATE}.json

# 同步到对象存储
aws s3 sync ${BACKUP_DIR} s3://group-nomad-backups/configs/ --endpoint-url https://oss.group.com
SCRIPT

chmod +x ~/backup-configs.sh
```

### 16.3 恢复流程

```bash
# 1. 恢复 Raft 快照
RESTORE_FILE="/opt/backups/nomad/group-hq/group-hq_20240101_020000.snap.gz"
gunzip ${RESTORE_FILE}

export NOMAD_ADDR="https://10.0.1.11:4646"
export NOMAD_CACERT="/opt/nomad/tls/ca.crt"
export NOMAD_CLIENT_CERT="/opt/nomad/tls/cli.crt"
export NOMAD_CLIENT_KEY="/opt/nomad/tls/cli.key"

# 停止其他 Server（保留 1 个）
ssh nomad@10.0.1.12 "sudo systemctl stop nomad-server"
ssh nomad@10.0.1.13 "sudo systemctl stop nomad-server"

# 恢复快照
nomad operator snapshot restore ${RESTORE_FILE%.gz}

# 重启其他 Server
ssh nomad@10.0.1.12 "sudo systemctl start nomad-server"
ssh nomad@10.0.1.13 "sudo systemctl start nomad-server"

# 2. 恢复 ACL
for policy in $(jq -r '.[].Name' /opt/backups/configs/policies_20240101.json); do
    nomad acl policy apply -name $policy -rules @/tmp/policies/$policy.hcl
done
```

---

## 17. CI/CD 集成

### 17.1 GitLab CI 示例

#### 17.1.1 GitLab CI 配置

```yaml
# .gitlab-ci.yml
stages:
  - build
  - deploy-staging
  - test-staging
  - deploy-production

variables:
  NOMAD_ADDR: "https://10.10.1.11:4646"
  NOMAD_CACERT: "$NOMAD_CACERT"
  NOMAD_CLIENT_CERT: "$NOMAD_CLIENT_CERT"
  NOMAD_CLIENT_KEY: "$NOMAD_CLIENT_KEY"
  NOMAD_TOKEN: "$NOMAD_CICD_TOKEN"

build-docker:
  stage: build
  image: docker:24.0
  services:
    - docker:24.0-dind
  script:
    - docker build -t registry.group.com/ent-001/webapp:${CI_COMMIT_SHA} .
    - docker push registry.group.com/ent-001/webapp:${CI_COMMIT_SHA}
  only:
    - main
    - tags

deploy-staging:
  stage: deploy-staging
  image: hashicorp/nomad:1.8
  script:
    - export IMAGE_TAG=${CI_COMMIT_SHA}
    - envsubst < jobs/webapp-staging.nomad.tpl > webapp-staging.nomad
    - nomad job run -region=ent-001 webapp-staging.nomad
  environment:
    name: staging
    url: https://staging.ent-001.group.com
  only:
    - main

test-staging:
  stage: test-staging
  image: curlimages/curl:8.8.0
  script:
    - sleep 30
    - curl -f https://staging.ent-001.group.com/health || exit 1
  only:
    - main

deploy-production:
  stage: deploy-production
  image: hashicorp/nomad:1.8
  script:
    - export IMAGE_TAG=${CI_COMMIT_SHA}
    - envsubst < jobs/webapp-prod.nomad.tpl > webapp-prod.nomad
    - nomad job run -region=ent-001 webapp-prod.nomad
  environment:
    name: production
    url: https://app.ent-001.group.com
  when: manual
  only:
    - tags
```

#### 17.1.2 作业模板

```bash
# jobs/webapp-prod.nomad.tpl
cat > jobs/webapp-prod.nomad.tpl <<'EOF'
job "webapp-prod" {
  region      = "ent-001"
  namespace   = "ent-001-apps"
  node_pool   = "ent-001"
  datacenters = ["ent-001-dc1"]
  type        = "service"

  update {
    max_parallel      = 1
    health_check      = "checks"
    min_healthy_time  = "30s"
    healthy_deadline  = "5m"
    progress_deadline = "10m"
    auto_revert       = true
    canary            = 1
  }

  group "web" {
    count = 5

    network {
      port "http" { to = 8080 }
    }

    task "app" {
      driver = "docker"
      config {
        image = "registry.group.com/ent-001/webapp:${IMAGE_TAG}"
        ports = ["http"]
      }

      resources {
        cpu    = 500
        memory = 512
      }

      service {
        name = "webapp-prod"
        port = "http"
        tags = ["ent-001", "production", "v${IMAGE_TAG}"]

        check {
          type     = "http"
          path     = "/health"
          interval = "10s"
          timeout  = "2s"
        }
      }
    }
  }
}
EOF
```

### 17.2 GitHub Actions 示例

```yaml
# .github/workflows/deploy.yml
name: Deploy to Nomad

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure Nomad CLI
        run: |
          curl -fsSL https://releases.hashicorp.com/nomad/1.8.0/nomad_1.8.0_linux_amd64.zip -o nomad.zip
          unzip nomad.zip
          sudo mv nomad /usr/local/bin/

          echo "$NOMAD_CACERT" > /tmp/ca.crt
          echo "$NOMAD_CLIENT_CERT" > /tmp/cli.crt
          echo "$NOMAD_CLIENT_KEY" > /tmp/cli.key

          echo "NOMAD_ADDR=https://10.10.1.11:4646" >> $GITHUB_ENV
          echo "NOMAD_CACERT=/tmp/ca.crt" >> $GITHUB_ENV
          echo "NOMAD_CLIENT_CERT=/tmp/cli.crt" >> $GITHUB_ENV
          echo "NOMAD_CLIENT_KEY=/tmp/cli.key" >> $GITHUB_ENV
          echo "NOMAD_TOKEN=${{ secrets.NOMAD_CICD_TOKEN }}" >> $GITHUB_ENV
        env:
          NOMAD_CACERT: ${{ secrets.NOMAD_CACERT }}
          NOMAD_CLIENT_CERT: ${{ secrets.NOMAD_CLIENT_CERT }}
          NOMAD_CLIENT_KEY: ${{ secrets.NOMAD_CLIENT_KEY }}

      - name: Deploy
        run: |
          export IMAGE_TAG=${GITHUB_REF#refs/tags/}
          envsubst < jobs/webapp-prod.nomad.tpl > webapp-prod.nomad
          nomad job run -region=ent-001 webapp-prod.nomad
          nomad job status -region=ent-001 webapp-prod
```

### 17.3 Jenkins Pipeline 示例

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        NOMAD_ADDR = 'https://10.10.1.11:4646'
        NOMAD_TOKEN = credentials('nomad-cicd-token')
    }

    stages {
        stage('Build') {
            steps {
                sh '''
                    docker build -t registry.group.com/ent-001/webapp:${BUILD_NUMBER} .
                    docker push registry.group.com/ent-001/webapp:${BUILD_NUMBER}
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    export IMAGE_TAG=${BUILD_NUMBER}
                    envsubst < jobs/webapp-prod.nomad.tpl > webapp-prod.nomad
                    nomad job run -region=ent-001 webapp-prod.nomad
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    sleep 30
                    nomad job status -region=ent-001 webapp-prod
                '''
            }
        }
    }

    post {
        failure {
            emailext (
                subject: "Deploy Failed: ${env.JOB_NAME}",
                body: "Check ${env.BUILD_URL}",
                to: "devops@ent-001.group.com"
            )
        }
    }
}
```

---

## 18. 故障处理

### 18.1 常见故障与排查

#### 18.1.1 Server 无法加入集群

```bash
# 1. 检查网络连通性
ping 10.0.1.11
nc -zv 10.0.1.11 4648  # Serf 端口

# 2. 检查防火墙
sudo ufw status
sudo ufw allow from 10.0.0.0/8 to any port 4648 proto tcp
sudo ufw allow from 10.0.0.0/8 to any port 4648 proto udp

# 3. 检查 TLS 证书
openssl s_client -connect 10.0.1.11:4647 -cert /opt/nomad/tls/server.crt -key /opt/nomad/tls/server.key -CAfile /opt/nomad/tls/ca.crt

# 4. 检查日志
sudo journalctl -u nomad-server -n 100 --no-pager

# 5. 检查配置
nomad agent -config=/opt/nomad/config/server.hcl -dev  # 测试模式
```

#### 18.1.2 Client 无法注册

```bash
# 1. 检查 Server RPC 连通性
nc -zv 10.10.1.11 4647

# 2. 检查 Client 日志
sudo journalctl -u nomad-client -n 100

# 3. 检查节点状态
nomad node status -verbose <node-id>

# 4. 检查 Client 配置
nomad agent -config=/opt/nomad/config/client.hcl -dev

# 5. 重新注册节点
sudo systemctl restart nomad-client
```

#### 18.1.3 作业调度失败

```bash
# 查看评估
nomad eval list -region=ent-001
nomad eval status -verbose <eval-id>

# 查看节点资源
nomad node status -verbose <node-id>

# 查看作业版本
nomad job status -verbose <job-name>

# 常见原因排查
# 1. 资源不足
nomad node status -allocations <node-id>

# 2. 约束不匹配
nomad job inspect <job-name> | jq '.Job.Constraints'

# 3. 驱动不可用
nomad node status -verbose <node-id> | grep -A5 "Drivers"

# 4. 网络配置错误
nomad job inspect <job-name> | jq '.Job.TaskGroups[].Networks'
```

#### 18.1.4 Raft 集群问题

```bash
# 查看 Raft 状态
nomad operator raft list-peers

# 查看 Raft 配置
nomad operator raft configuration

# 强制移除故障节点
nomad operator raft remove-peer 10.0.1.14:4647

# 恢复步骤
# 1. 停止所有 Server
for srv in 10.0.1.11 10.0.1.12 10.0.1.13; do
    ssh nomad@$srv "sudo systemctl stop nomad-server"
done

# 2. 在 Leader 上恢复
nomad operator snapshot restore /opt/backups/group-hq.snap

# 3. 重启其他 Server
for srv in 10.0.1.12 10.0.1.13; do
    ssh nomad@$srv "sudo systemctl start nomad-server"
done
```

### 18.2 紧急恢复流程

```bash
# 紧急联系人脚本
cat > ~/emergency-contacts.sh <<'EOF'
#!/bin/bash
echo "============================================"
echo "Nomad 集群紧急联系人"
echo "============================================"
echo "集团总部运维: 138-0000-0001"
echo "区域中心运维: 138-0000-0002"
echo "企业 001 运维: 138-0000-0003"
echo "HashiCorp 支持: support@hashicorp.com"
echo "============================================"
echo "紧急处理流程:"
echo "1. 确认故障范围（单节点/多节点/整个集群）"
echo "2. 查看 nomad operator members 确认集群状态"
echo "3. 查看 nomad operator raft list-peers 确认 Leader"
echo "4. 如有数据损坏，从快照恢复"
echo "5. 通知所有相关业务团队"
echo "============================================"
EOF
```

### 18.3 节点驱逐

```bash
# 优雅驱逐节点上的所有作业
NODE_ID="abc123-def456"
nomad node eligibility -disable $NODE_ID
nomad node drain -enable -yes $NODE_ID

# 监控驱逐进度
watch -n 5 "nomad node status -verbose $NODE_ID"

# 强制驱逐（紧急情况）
nomad node drain -enable -force -yes $NODE_ID
```

---

## 19. 版本升级

### 19.1 升级前检查

```bash
# 1. 检查当前版本
nomad version

# 2. 检查集群健康
nomad operator members
nomad operator raft list-peers
nomad node status

# 3. 检查作业状态
nomad job status

# 4. 创建备份
~/backup-nomad.sh group-hq
~/backup-nomad.sh cn-north
~/backup-nomad.sh ent-001

# 5. 检查 Autopilot 状态
nomad operator autopilot get-config
```

### 19.2 滚动升级 Server

```bash
# 升级脚本
cat > ~/upgrade-nomad.sh <<'SCRIPT'
#!/bin/bash
# 用法: ./upgrade-nomad.sh <version> <server_ip>

VERSION=$1
SERVER_IP=$2

echo ">>> Upgrading ${SERVER_IP} to Nomad ${VERSION}..."

# 1. 下载新版本
cd /tmp
wget https://releases.hashicorp.com/nomad/${VERSION}/nomad_${VERSION}_linux_amd64.zip
unzip nomad_${VERSION}_linux_amd64.zip

# 2. 备份旧版本
ssh nomad@${SERVER_IP} "sudo cp /opt/nomad/bin/nomad /opt/nomad/bin/nomad.bak"

# 3. 上传新版本
scp nomad nomad@${SERVER_IP}:/tmp/

# 4. 安装新版本
ssh nomad@${SERVER_IP} <<EOF
sudo mv /tmp/nomad /opt/nomad/bin/nomad
sudo chmod +x /opt/nomad/bin/nomad
nomad version
EOF

# 5. 重启服务
ssh nomad@${SERVER_IP} "sudo systemctl restart nomad-server"

# 6. 等待节点恢复
echo ">>> Waiting for ${SERVER_IP} to rejoin..."
sleep 30

# 7. 验证
nomad operator members | grep ${SERVER_IP}

# 8. 等待 Raft 追上
LEADER=$(nomad operator raft list-peers | grep "leader" | awk '{print $2}')
ssh nomad@${LEADER} "nomad operator raft list-peers"

echo ">>> Upgrade of ${SERVER_IP} complete."
SCRIPT

chmod +x ~/upgrade-nomad.sh

# 执行滚动升级（每次一个 Server）
NEW_VERSION="1.8.1"

# HQ Server
for srv_ip in 10.0.1.11 10.0.1.12 10.0.1.13 10.0.1.14 10.0.1.15; do
    ./upgrade-nomad.sh $NEW_VERSION $srv_ip
    # 等待集群稳定
    sleep 60
done

# 区域中心 Server
for srv_ip in 10.10.0.11 10.10.0.12 10.10.0.13 10.10.0.14 10.10.0.15; do
    ./upgrade-nomad.sh $NEW_VERSION $srv_ip
    sleep 60
done

# 企业 Server（批量）
for ent_id in $(seq -w 1 100); do
    for srv_num in 01 02 03; do
        srv_ip="10.10.$((10#$ent_id)).$((10 + srv_num - 1))"
        ./upgrade-nomad.sh $NEW_VERSION $srv_ip
        sleep 30
    done
done
```

### 19.3 升级 Client

```bash
cat > ~/upgrade-clients.sh <<'SCRIPT'
#!/bin/bash
# 用法: ./upgrade-clients.sh <version> <enterprise_id>

VERSION=$1
ENT_ID=$2

# 获取该企业所有 Client
NODES=$(nomad node status -region=${ENT_ID} | grep -v "^ID" | awk '{print $1}')

for node_id in $NODES; do
    # 获取节点 IP
    NODE_IP=$(nomad node status -verbose $node_id -region=${ENT_ID} | grep "Address" | awk '{print $2}')

    echo ">>> Upgrading Client ${NODE_IP}..."

    # 标记为不可调度
    nomad node eligibility -disable $node_id -region=${ENT_ID}

    # 下载新版本
    cd /tmp
    wget -q https://releases.hashicorp.com/nomad/${VERSION}/nomad_${VERSION}_linux_amd64.zip
    unzip -o nomad_${VERSION}_linux_amd64.zip

    # 备份并安装
    ssh nomad@${NODE_IP} <<EOF
sudo cp /opt/nomad/bin/nomad /opt/nomad/bin/nomad.bak
sudo mv /tmp/nomad /opt/nomad/bin/nomad 2>/dev/null || true
EOF

    scp nomad nomad@${NODE_IP}:/tmp/

    ssh nomad@${NODE_IP} <<EOF
sudo mv /tmp/nomad /opt/nomad/bin/nomad
sudo chmod +x /opt/nomad/bin/nomad
sudo systemctl restart nomad-client
EOF

    sleep 30

    # 验证
    nomad node status -verbose $node_id -region=${ENT_ID} | grep "Status"

    # 恢复调度
    nomad node eligibility -enable $node_id -region=${ENT_ID}
done

echo ">>> All clients in ${ENT_ID} upgraded."
SCRIPT

chmod +x ~/upgrade-clients.sh

# 执行升级
./upgrade-clients.sh 1.8.1 ent-001
```

### 19.4 回滚

```bash
# 回滚到旧版本
cat > ~/rollback-nomad.sh <<'SCRIPT'
#!/bin/bash
# 用法: ./rollback-nomad.sh <server_ip>

SERVER_IP=$1

echo ">>> Rolling back ${SERVER_IP}..."

ssh nomad@${SERVER_IP} <<EOF
sudo systemctl stop nomad-server
sudo mv /opt/nomad/bin/nomad /opt/nomad/bin/nomad.new
sudo mv /opt/nomad/bin/nomad.bak /opt/nomad/bin/nomad
sudo systemctl start nomad-server
nomad version
EOF

echo ">>> Rollback complete for ${SERVER_IP}."
SCRIPT

chmod +x ~/rollback-nomad.sh

# 执行回滚
./rollback-nomad.sh 10.0.1.11
```

---

## 20. 附录：完整脚本

### 20.1 一键部署新企业

```bash
cat > ~/deploy-new-enterprise.sh <<'SCRIPT'
#!/bin/bash
# 一键部署新企业 Nomad 集群
# 用法: ./deploy-new-enterprise.sh <ent_id> <net_prefix> <server_count> <client_count>

set -e

ENT_ID=$1
NET=$2
SERVER_COUNT=$3
CLIENT_COUNT=$4

echo "================================================"
echo "Deploying Enterprise: ${ENT_ID}"
echo "Network: ${NET}.0/24"
echo "Servers: ${SERVER_COUNT}, Clients: ${CLIENT_COUNT}"
echo "================================================"

# Step 1: 生成证书
echo ">>> Step 1: Generating certificates..."
cd ~/nomad-pki
for i in $(seq 1 $SERVER_COUNT); do
    IP="${NET}.$((10 + i - 1))"
    HOSTNAME="${ENT_ID}-srv-$(printf '%02d' $i)"
    ./gen-server-cert.sh $ENT_ID "${ENT_ID}-dc1" $HOSTNAME $IP
    ./distribute-certs.sh $HOSTNAME $IP "server" $HOSTNAME
done

for i in $(seq 1 $CLIENT_COUNT); do
    IP="${NET}.$((100 + i - 1))"
    HOSTNAME="${ENT_ID}-cli-$(printf '%03d' $i)"
    ./gen-client-cert.sh $HOSTNAME $IP
    ./distribute-certs.sh $HOSTNAME $IP "client" $HOSTNAME
done

# Step 2: 部署 Server
echo ">>> Step 2: Deploying Servers..."
~/deploy-enterprise-servers.sh $ENT_ID $NET $SERVER_COUNT

# Step 3: 部署 Client
echo ">>> Step 3: Deploying Clients..."
~/deploy-clients.sh $ENT_ID $NET 100 $CLIENT_COUNT

# Step 4: 配置 ACL
echo ">>> Step 4: Setting up ACL..."
~/setup-enterprise-acl.sh $ENT_ID

# Step 5: 创建 Node Pool
echo ">>> Step 5: Creating Node Pool..."
cat > /tmp/${ENT_ID}-pool.hcl <<EOF
node_pool "${ENT_ID}" {
  description = "Node pool for ${ENT_ID}"
}
EOF
nomad node pool apply @/tmp/${ENT_ID}-pool.hcl

# Step 6: 创建 Namespace
echo ">>> Step 6: Creating Namespaces..."
cat > /tmp/${ENT_ID}-apps-ns.hcl <<EOF
namespace "${ENT_ID}-apps" {
  description = "Apps for ${ENT_ID}"
}
EOF
nomad namespace apply @/tmp/${ENT_ID}-apps-ns.hcl

echo ""
echo "================================================"
echo "Deployment of ${ENT_ID} Complete!"
echo "================================================"
echo "Servers: ${SERVER_COUNT}"
echo "Clients: ${CLIENT_COUNT}"
echo ""
echo "Cluster Status:"
nomad operator members -region=${ENT_ID}
echo ""
echo "Node Status:"
nomad node status -region=${ENT_ID}
SCRIPT

chmod +x ~/deploy-new-enterprise.sh

# 使用示例
# ./deploy-new-enterprise.sh ent-101 10.10.101 3 20
```

### 20.2 健康检查脚本

```bash
cat > ~/health-check.sh <<'SCRIPT'
#!/bin/bash
# 全集团 Nomad 健康检查

echo "============================================"
echo "Nomad Cluster Health Check - $(date)"
echo "============================================"

# HQ
echo ""
echo ">>> Group HQ (group-hq):"
export NOMAD_ADDR="https://10.0.1.11:4646"
nomad operator members -region=group-hq
echo "Leader: $(nomad operator raft list-peers -region=group-hq | grep leader | awk '{print $3}')"

# 区域中心
echo ""
echo ">>> CN North (cn-north):"
nomad operator members -region=cn-north
echo "Leader: $(nomad operator raft list-peers -region=cn-north | grep leader | awk '{print $3}')"

# 抽样检查 5 家企业
for ent_id in 001 025 050 075 100; do
    echo ""
    echo ">>> Enterprise ${ent_id} (ent-${ent_id}):"
    ENT_ID="ent-${ent_id}"
    SERVER_IP="10.10.$((10#$ent_id)).11"
    nomad operator members -region=$ENT_ID 2>/dev/null || echo "  [ERROR] Cannot connect to $ENT_ID"
done

# 汇总统计
echo ""
echo "============================================"
echo "Summary:"
echo "HQ Servers: $(nomad operator members -region=group-hq | grep -c alive)"
echo "CN-North Servers: $(nomad operator members -region=cn-north | grep -c alive)"
echo "============================================"
SCRIPT

chmod +x ~/health-check.sh

# 添加定时任务
echo "0 8 * * * /home/nomad/health-check.sh | mail -s "Nomad Daily Health Report" ops@group.com" | sudo tee -a /var/spool/cron/crontabs/root
```

### 20.3 快速参考

```bash
# 常用命令速查

# === 集群管理 ===
nomad operator members                    # 查看成员
nomad operator members -wan               # WAN 联邦成员
nomad operator raft list-peers            # Raft 状态
nomad operator autopilot get-config       # Autopilot 配置
nomad operator snapshot save backup.snap  # 快照备份
nomad operator snapshot restore backup.snap  # 快照恢复

# === 节点管理 ===
nomad node status                         # 节点列表
nomad node status -verbose <node-id>      # 节点详情
nomad node eligibility -disable <node-id> # 禁用调度
nomad node eligibility -enable <node-id>  # 启用调度
nomad node drain -enable -yes <node-id>   # 驱逐节点
nomad node drain -disable -yes <node-id>  # 取消驱逐

# === 作业管理 ===
nomad job run <file.nomad>                # 提交作业
nomad job stop <job-name>                 # 停止作业
nomad job status                          # 作业列表
nomad job status <job-name>               # 作业详情
nomad job inspect <job-name>              # 作业配置
nomad job plan <file.nomad>               # 预演

# === Allocation ===
nomad alloc status <alloc-id>             # 分配状态
nomad alloc logs <alloc-id>               # 查看日志
nomad alloc logs -f <alloc-id>            # 跟踪日志
nomad alloc exec <alloc-id> <cmd>         # 执行命令
nomad alloc stop <alloc-id>               # 停止分配

# === ACL ===
nomad acl enable                          # 启用 ACL
nomad acl bootstrap                       # Bootstrap
nomad acl policy apply -name X -rules @file  # 创建策略
nomad acl token create -name X -policy Y  # 创建 Token
nomad acl token list                      # Token 列表

# === Namespace ===
nomad namespace list                      # 命名空间列表
nomad namespace apply @file               # 创建命名空间
nomad namespace delete <name>             # 删除命名空间

# === Node Pool ===
nomad node pool list                      # 节点池列表
nomad node pool apply @file               # 创建节点池
nomad node pool delete <name>             # 删除节点池

# === Quota ===
nomad quota list                          # 配额列表
nomad quota apply @file                   # 创建配额
nomad quota delete <name>                 # 删除配额

# === Vault ===
nomad ui                                  # 打开 Web UI
vault kv get secret/ent-001/db            # 查看密钥
vault kv put secret/ent-001/db key=val    # 写入密钥

# === 跨 Region ===
nomad job run -region=ent-001 file.nomad  # 指定 region
nomad job status -region=ent-001          # 查看 region 作业
nomad operator members -region=cn-north   # 查看 region 成员

# === 调试 ===
nomad agent -dev                          # 开发模式
nomad monitor                             # 监控日志
nomad operator api /v1/jobs               # 直接 API 调用
```

---

**文档版本**: v1.0
**最后更新**: 2026-07-14
**适用 Nomad 版本**: 1.8.x
**维护团队**: 集团 DevOps 团队
