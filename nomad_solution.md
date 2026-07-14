# 大型集团公司 Nomad 部署架构与实施指南

> 适用场景：拥有 100+ 家企业、每家企业拥有独立数据中心的大型集团公司
> 目标：构建统一、可扩展、高可用的全球工作负载编排平台

---

## 1. 总体架构概览

### 1.1 设计原则

| 原则 | 说明 |
|------|------|
| **分层治理** | 集团总部 + 区域中心 + 企业数据中心三级架构 |
| **数据主权** | 每家企业数据本地化，工作负载不跨企业调度 |
| **统一管控** | 集团层面统一策略、ACL、监控 |
| **联邦自治** | 各企业可独立运维，故障隔离 |
| **弹性扩展** | 支持企业数量动态增长，从 100 到 500+ |
| **多区域容灾** | 关键工作负载跨企业/跨区域容灾 |

### 1.2 三级架构总览

```
┌─────────────────────────────────────────────────────────────────────┐
│                      集团总部 (Group Headquarters)                    │
│                                                                      │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│   │  管理平台   │  │  策略中心   │  │  监控中心   │  │ 审计中心 │ │
│   │  (Portal)   │  │  (Policy)   │  │  (Monitor)  │  │ (Audit)  │ │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └────┬─────┘ │
│          │                │                │               │       │
│   ═══════╧════════════════╧════════════════╧═══════════════╧═══    │
│                      集团 Nomad 控制平面                              │
│              (Region: global, 5 Server, Raft 集群)                   │
└────────────────────────┬────────────────────────────────────────────┘
                         │ WAN Federation (Gossip 4648)
        ┌────────────────┼────────────────────────┐
        │                │                        │
┌───────▼───────┐ ┌──────▼───────┐       ┌────────▼───────┐
│  华北区区域中心 │ │  华南区区域中心 │  ...  │  海外区域中心   │
│ (Region: cn-n) │ │ (Region: cn-s) │       │ (Region: global)│
│   3-5 Server   │ │   3-5 Server   │       │    3-5 Server   │
└───────┬───────┘ └───────┬───────┘       └────────┬───────┘
        │                 │                        │
   ┌────┴────┐       ┌────┴────┐             ┌────┴────┐
   │         │       │         │             │         │
┌──▼──┐   ┌──▼──┐ ┌──▼──┐   ┌──▼──┐       ┌──▼──┐   ┌──▼──┐
│企业A│   │企业B│ │企业C│   │企业D│  ...  │企业Y│   │企业Z│
│DC-A │   │DC-B │ │DC-C │   │DC-D │       │DC-Y │   │DC-Z │
│3 Srv│   │3 Srv│ │3 Srv│   │5 Srv│       │3 Srv│   │3 Srv│
│+Cli │   │+Cli │ │+Cli │   │+Cli │       │+Cli │   │+Cli │
└─────┘   └─────┘ └─────┘   └─────┘       └─────┘   └─────┘
```

### 1.3 Nomad Region 与企业映射

| 层级 | Nomad Region 命名 | DC 命名 | Server 数量 | 职责 |
|------|-------------------|---------|-------------|------|
| 集团总部 | `group-hq` | `hq-dc1` | 5 | 全局策略、ACL 中心、跨区域联邦 |
| 区域中心 | `cn-north`, `cn-south`, `apac`, `emea`, `amer` | `<region>-dc1` | 3-5 | 区域汇聚、跨企业容灾 |
| 企业 | `ent-<企业编号>` | `ent-<编号>-dc1` | 3 (小) / 5 (大) | 企业本地工作负载编排 |

> **关键设计**：每个企业是独立的 Nomad Region，通过 WAN Federation 互联。

---

## 2. 集团网络拓扑设计

### 2.1 网络分层

```
┌─────────────────────────────────────────────────────┐
│              集团骨干网 (10.0.0.0/8)                  │
│         BGP/OSPF + MPLS / SD-WAN 互联                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ 华北区网络   │  │ 华南区网络   │  │ 海外网络   ││
│  │10.10.0.0/16  │  │10.20.0.0/16  │  │10.30.0.0/16││
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘│
│         │                 │                 │       │
│  ┌──────┴──────┐   ┌──────┴──────┐  ┌──────┴──────┐│
│  │ 企业A网络   │   │ 企业C网络   │  │ 企业Y网络   ││
│  │10.10.1.0/24 │   │10.20.1.0/24 │  │10.30.1.0/24 ││
│  └─────────────┘   └─────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────┘
```

### 2.2 Nomad 端口规划

| 端口 | 协议 | 用途 | 开放范围 |
|------|------|------|----------|
| 4646 | TCP | HTTP API | 集团内网 + VPN |
| 4647 | TCP | RPC（Server 间 + Client→Server） | 集团内网 |
| 4648 | TCP+UDP | Serf Gossip | **所有 Server 间互通** |
| 14000-14512 | TCP | Client 插件端口 | 企业内部 |
| 20000-32000 | TCP | 动态分配端口 | 企业内部 |

### 2.3 防火墙规则矩阵

```
源 → 目标              端口          说明
─────────────────────────────────────────────────────
集团HQ Server → 所有Server  4647,4648   管控与联邦
区域Server   → 区域内企业   4647,4648   区域汇聚
企业Server   → 同企业Client 4646,4647   本地编排
企业Server   → 同region其他  4647,4648   Raft+Gossip
Client       → 本企业Server 4646,4647   注册与心跳
运维终端     → 所有Server   4646        API 操作
监控中心     → 所有节点      4646        指标采集
```

### 2.4 关键网络要求

1. **Gossip 互通**：所有 Server 的 4648 端口必须互通（单一全局 gossip 池）
2. **低延迟**：同 region Server 间延迟 < 10ms（Raft 要求）
3. **带宽**：每企业 Server 间预留 100Mbps+ 用于 Raft 复制和 Gossip
4. **MTU**：建议 9000（Jumbo Frame）减少分片开销

---

## 3. 集团 Nomad 架构详细设计

### 3.1 集团总部控制平面

#### 3.1.1 Server 集群配置

```hcl
# 集团总部 Server 配置 (group-hq-dc1)
datacenter = "hq-dc1"
region     = "group-hq"
data_dir   = "/opt/nomad/data"
bind_addr  = "10.0.1.10"  # HQ Server IP

# Server 配置
server {
  enabled          = true
  bootstrap_expect = 5  # 5 节点 Raft
  raft_protocol    = 3
  
  # 加密
  encrypt = "<base64-encoded-key>"
  
  # 广播地址（其他 Server/Client 连接此地址）
  advertise {
    rpc = "10.0.1.10:4647"
    serf = "10.0.1.10:4648"
  }
}

# WAN 联邦：自动加入所有区域中心
server_join {
  retry_join = [
    "10.10.0.10:4648",  # cn-north 区域中心
    "10.20.0.10:4648",  # cn-south 区域中心
    "10.30.0.10:4648",  # 海外区域中心
    # ... 其他区域中心
  ]
  retry_interval = "15s"
  retry_max_attempts = 0  # 无限重试
}

# ACL 配置（集团统一管理）
acl {
  enabled                  = true
  token_ttl                = "1h"
  policy_ttl               = "5m"
  role_ttl                 = "5m"
  enable_key_indices       = true
}

# TLS 配置
tls {
  http = true
  rpc  = true
  ca_file   = "/opt/nomad/tls/ca.crt"
  cert_file = "/opt/nomad/tls/server.crt"
  key_file  = "/opt/nomad/tls/server.key"
  verify_server_client_cert = true
  verify_https_client       = true
}

# Autopilot：自动运维
autopilot {
  cleanup_dead_servers      = true
  last_contact_threshold    = "500ms"
  max_trailing_logs         = 500
  server_stabilization_time = "10s"
  enable_redundancy_zones   = true
  disable_upgrade_migration = false
  enable_custom_upgrades    = true
}
```

#### 3.1.2 集团职责

| 职责 | 实现方式 |
|------|----------|
| **ACL 策略中心** | 所有 ACL Policy/Role/AuthMethod 在 `group-hq` region 定义，其他 region 复制 |
| **全局 Namespace** | 定义跨企业的 namespace 模板 |
| **跨区域监控** | 聚合所有 region 的指标 |
| **审计日志** | 收集所有 region 的审计事件 |
| **密钥管理** | Gossip 加密密钥轮换中心 |

### 3.2 区域中心设计

#### 3.2.1 区域划分策略

| 区域 | 覆盖企业 | Region 名 | Server 数 | 容灾策略 |
|------|---------|-----------|-----------|----------|
| 华北区 | 30 家企业 | `cn-north` | 5 | 北京+天津双活 |
| 华南区 | 25 家企业 | `cn-south` | 5 | 广州+深圳双活 |
| 华东区 | 20 家企业 | `cn-east` | 5 | 上海+杭州双活 |
| 西南区 | 15 家企业 | `cn-southwest` | 3 | 成都单中心 |
| 海外区 | 15 家企业 | `overseas` | 5 | 新加坡+法兰克福 |

#### 3.2.2 区域中心 Server 配置

```hcl
# 区域中心 Server 配置 (cn-north-dc1)
datacenter = "cn-north-dc1"
region     = "cn-north"
data_dir   = "/opt/nomad/data"

server {
  enabled          = true
  bootstrap_expect = 5
  raft_protocol    = 3
  encrypt          = "<same-key-as-hq>"  # 同一加密密钥
  
  advertise {
    rpc  = "10.10.0.10:4647"
    serf = "10.10.0.10:4648"
  }
}

# 加入集团 gossip 池
server_join {
  retry_join = [
    "10.0.1.10:4648",  # 集团总部
    # 其他区域中心
  ]
}

# ACL 从集团总部复制
acl {
  enabled             = true
  replication_token   = "<replication-token-from-hq>"
}

# Autopilot 冗余区
autopilot {
  redundancy_zone = "cn-north-primary"
}
```

### 3.3 企业数据中心设计

#### 3.3.1 企业分类与 Server 规模

| 企业类型 | Server 数 | Client 数 | 特点 |
|----------|-----------|-----------|------|
| 大型企业 (>1000 节点) | 5 | 100+ | 高可用，冗余区 |
| 中型企业 (100-1000 节点) | 3 | 20-100 | 标准高可用 |
| 小型企业 (<100 节点) | 3 | 5-20 | 最小高可用 |

#### 3.3.2 企业 Server 配置

```hcl
# 企业 A 的 Server 配置 (ent-001)
datacenter = "ent-001-dc1"
region     = "ent-001"  # 每企业独立 region
data_dir   = "/opt/nomad/data"
bind_addr  = "10.10.1.10"

server {
  enabled          = true
  bootstrap_expect = 3  # 小型企业 3 节点
  raft_protocol    = 3
  encrypt          = "<same-key>"  # 集团统一密钥
  
  # 非投票节点选项（仅作为 gossip 成员，不参与 Raft）
  # non_voter = true
  
  advertise {
    rpc  = "10.10.1.10:4647"
    serf = "10.10.1.10:4648"
  }
}

# 通过区域中心加入 gossip 池
server_join {
  retry_join = [
    "10.10.0.10:4648",  # cn-north 区域中心
  ]
  retry_interval = "15s"
}

# ACL 复制
acl {
  enabled           = true
  replication_token = "<token-from-cn-north>"
}

# Autopilot
autopilot {
  redundancy_zone = "ent-001"
  cleanup_dead_servers = true
}
```

#### 3.3.3 企业 Client 配置

```hcl
# 企业 A 的 Client 配置
datacenter = "ent-001-dc1"
region     = "ent-001"
data_dir   = "/opt/nomad/data"
bind_addr  = "10.10.1.100"

client {
  enabled    = true
  node_class = "general"  # 或 "gpu", "highmem"
  
  meta {
    enterprise  = "ent-001"
    rack        = "rack-1"
    environment = "production"
    zone        = "zone-a"
  }
  
  # 资源预留
  reserve {
    cpu            = 500   # MHz
    memory         = 512   # MB
    disk           = 1024  # MB
    reserved_ports = "22,80,443,4646,4647,4648"
  }
}

# 指向企业 Server
server_join {
  retry_join = ["10.10.1.10:4647", "10.10.1.11:4647", "10.10.1.12:4647"]
}

# TLS
tls {
  http = true
  rpc  = true
  ca_file   = "/opt/nomad/tls/ca.crt"
  cert_file = "/opt/nomad/tls/client.crt"
  key_file  = "/opt/nomad/tls/client.key"
}
```

---

## 4. 多租户与隔离设计

### 4.1 Namespace 隔离模型

```
集团 Nomad
├── Namespace: <enterprise> (每企业一个 namespace)
│   ├── Job: ent-001-web-app
│   ├── Job: ent-001-db
│   └── Job: ent-001-batch
├── Namespace: <enterprise>-staging
├── Namespace: <enterprise>-dev
├── Namespace: group-shared (集团共享服务)
└── Namespace: monitoring (监控)
```

### 4.2 ACL 策略设计

#### 4.2.1 集团管理员策略

```hcl
# group-admin.policy
Namespace "*" {
  Policy       = "write"
  Capabilities = ["alloc-exec", "alloc-lifecycle", "csi-list-volume"]
}

Operator {
  Policy = "write"
}

HostVolumes "*" {
  Policy = "write"
}

CSIPlugin "*" {
  Policy = "write"
}

Node {
  Policy = "write"
}
```

#### 4.2.2 企业管理员策略（限制到本企业）

```hcl
# ent-001-admin.policy
Namespace "ent-001" {
  Policy       = "write"
  Capabilities = ["alloc-exec", "alloc-lifecycle"]
}

Namespace "ent-001-staging" {
  Policy       = "write"
  Capabilities = ["alloc-exec", "alloc-lifecycle"]
}

Namespace "ent-001-dev" {
  Policy       = "write"
  Capabilities = ["alloc-exec", "alloc-lifecycle"]
}

Node {
  Policy = "read"
  
  # 限制只能看到本企业的节点
  NodePool "ent-001" {
    Policy = "write"
  }
}
```

#### 4.2.3 企业开发者策略

```hcl
# ent-001-developer.policy
Namespace "ent-001-dev" {
  Policy       = "write"
  Capabilities = ["alloc-exec"]
}

Namespace "ent-001-staging" {
  Policy = "read"
}

Namespace "ent-001" {
  Policy = "read"
}
```

### 4.3 Node Pool 隔离

```hcl
# 创建企业专属 Node Pool
node_pool "ent-001" {
  description = "企业 A 专用节点池"
  meta {
    enterprise = "ent-001"
  }
}
```

Job 指定 Node Pool：
```hcl
job "ent-001-web" {
  node_pool = "ent-001"
  datacenters = ["ent-001-dc1"]
  
  group "web" {
    # ...
  }
}
```

### 4.4 网络隔离

| 隔离层级 | 实现 |
|----------|------|
| 企业间 | VLAN/VXLAN + 防火墙规则 |
| Namespace 间 | Nomad ACL + Node Pool |
| Job 间 | Docker network / CNI 插件 |
| 数据库 | 主机卷 + ACL 限制访问 |

---

## 5. 安全架构

### 5.1 TLS 证书体系

```
集团 CA (根证书)
├── 集团总部 Server 证书
├── 区域中心 Server 证书
├── 企业 Server 证书
├── 企业 Client 证书
├── 运维人员客户端证书
└── 服务间通信证书
```

#### 5.1.1 证书生成脚本

```bash
#!/bin/bash
# 生成企业 Server 证书

# 1. 生成私钥
openssl genrsa -out ent-001-server.key 2048

# 2. 生成 CSR（包含所有 Server IP）
cat > server.cnf <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
CN = nomad-server.ent-001.group.com

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = nomad-server.ent-001.group.com
DNS.2 = nomad-server.ent-001-dc1
IP.1 = 10.10.1.10
IP.2 = 10.10.1.11
IP.3 = 10.10.1.12
EOF

openssl req -new -key ent-001-server.key -out ent-001-server.csr -config server.cnf

# 3. 用集团 CA 签名
openssl x509 -req -in ent-001-server.csr \
  -CA group-ca.crt -CAkey group-ca.key -CAcreateserial \
  -out ent-001-server.crt -days 365 -extensions v3_req -extfile server.cnf
```

### 5.2 Gossip 加密

```bash
# 1. 生成 32 字节密钥（AES-256）
nomad operator gossip keyring generate

# 2. 所有节点配置相同密钥
# config.hcl:
# server {
#   encrypt = "base64-encoded-key="
# }

# 3. 运行时轮换
nomad operator gossip keyring install <new-key>
nomad operator gossip keyring use <new-key>
nomad operator gossip keyring remove <old-key>
```

### 5.3 ACL Token 管理

#### 5.3.1 Token 层级

```
Bootstrap Token (集团总部，仅初始化时使用)
├── 集团管理 Token (group-admin)
│   ├── 区域管理 Token (region-admin-<region>)
│   │   ├── 企业管理 Token (ent-admin-<enterprise>)
│   │   │   ├── 企业开发 Token (ent-dev-<enterprise>)
│   │   │   └── 企业部署 Token (ent-deploy-<enterprise>)
│   │   └── 复制 Token (replication-<region>)
│   └── 监控 Token (monitoring-readonly)
└── 服务 Token (per-service)
```

#### 5.3.2 ACL 复制配置

```hcl
# 区域中心 / 企业 Server 配置
acl {
  enabled           = true
  replication_token = "<token-from-parent-region>"
  # 区域中心从集团总部复制
  # 企业从区域中心复制
}
```

### 5.4 Secret 管理

#### 5.4.1 Vault 集成架构

```
集团 Vault 集群 (Primary)
├── 区域 Vault 集群 (Replica)
│   └── 企业 Vault 集群 (Replica / Standalone)
└── 企业应用通过 Nomad Vault 集成获取 Secret
```

#### 5.4.2 Nomad Job 集成 Vault

```hcl
job "ent-001-secure-app" {
  group "app" {
    vault {
      policies = ["ent-001-app-policy"]
      change_mode = "restart"
    }
    
    task "app" {
      config {
        # Vault token 自动注入
      }
      
      template {
        data = <<EOF
{{ with secret "secret/data/ent-001/db-credentials" }}
DB_USER={{ .Data.data.username }}
DB_PASS={{ .Data.data.password }}
{{ end }}
EOF
        destination = "secrets/db.env"
      }
    }
  }
}
```

---

## 6. 工作负载调度设计

### 6.1 调度策略分层

| 层级 | 调度器 | 用途 |
|------|--------|------|
| 企业内部 | `service` | 长期运行服务 |
| 企业内部 | `batch` | 批处理任务 |
| 企业内部 | `sysbatch` | 系统级批处理 |
| 跨企业 | 手动指定 region | 容灾切换 |
| 集团共享 | `system` | 监控 Agent 等基础服务 |

### 6.2 企业内调度示例

```hcl
job "ent-001-microservice" {
  region      = "ent-001"        # 限制在企业 A
  datacenters = ["ent-001-dc1"]  # 限制数据中心
  node_pool   = "ent-001"        # 限制节点池
  type        = "service"
  
  # 跨可用区 spread
  spread {
    attribute = "${meta.zone}"
    target "zone-a" { percent = 50 }
    target "zone-b" { percent = 50 }
  }
  
  group "api" {
    count = 4
    
    # 跨节点 anti-affinity
    constraint {
      operator = "distinct_hosts"
      value    = "true"
    }
    
    task "api" {
      driver = "docker"
      config {
        image = "registry.group.com/ent-001/api:v1.2.0"
        ports = ["http"]
      }
      
      resources {
        cpu    = 500
        memory = 512
      }
    }
  }
}
```

### 6.3 跨企业容灾设计

#### 6.3.1 双活部署

```hcl
# 企业 A 主站点
job "critical-service" {
  region = "ent-001"
  # ...
}

# 企业 B 容灾站点（通过 CI/CD 同步部署）
job "critical-service-dr" {
  region = "ent-002"
  # 相同配置
  meta {
    disaster_recovery = "true"
    primary_region    = "ent-001"
  }
}
```

#### 6.3.2 指标驱动的故障切换

```bash
#!/bin/bash
# 故障切换脚本
# 监控企业 A 健康状态，故障时提升企业 B 的实例数

if ! nomad operator api /v1/nodes?region=ent-001 | jq '.[].Status' | grep -q "ready"; then
  echo "Enterprise A is down, scaling up DR site..."
  nomad job scale -region=ent-002 critical-service-dr 10
fi
```

### 6.4 滚动升级策略

```hcl
job "ent-001-web" {
  update {
    stagger      = "30s"
    max_parallel = 2
    health_check = "checks"
    min_healthy_time = "10s"
    healthy_deadline = "5m"
    progress_deadline = "10m"
    auto_revert       = true
    auto_promote      = false
    canary            = 1
  }
  
  group "web" {
    # ...
  }
}
```

---

## 7. 存储架构

### 7.1 存储分层

```
┌─────────────────────────────────────┐
│           存储类型选择               │
├──────────────┬──────────────────────┤
│ 无状态服务   │ Docker volume (临时)  │
│ 配置文件     │ Consul KV / Vault     │
│ 应用日志     │ Host Volume → NFS     │
│ 数据库       │ Host Volume → SAN     │
│ 共享存储     │ CSI 插件 (Ceph/NFS)   │
└──────────────┴──────────────────────┘
```

### 7.2 Host Volume 配置

```hcl
# Client 配置
client {
  host_volume "ent-001-data" {
    path      = "/opt/nomad/volumes/ent-001-data"
    read_only = false
  }
  
  host_volume "ent-001-logs" {
    path      = "/var/log/nomad-jobs"
    read_only = false
  }
}
```

### 7.3 CSI 插件部署

```hcl
# Ceph CSI 插件
job "ceph-csi" {
  datacenters = ["ent-001-dc1"]
  type        = "system"
  
  group "controller" {
    task "csi-plugin" {
      driver = "docker"
      config {
        image = "quay.io/cephcsi/cephcsi:v3.6.0"
        args = [
          "--type=controller",
          "--drivername=ceph.cephfs.com",
          "--endpoint=unix://csi/csi.sock",
        ]
      }
      
      csi_plugin {
        id        = "cephfs"
        type      = "controller"
        mount_dir = "/csi"
      }
    }
  }
}
```

---

## 8. 监控与可观测性

### 8.1 监控架构

```
┌─────────────────────────────────────────────┐
│              集团监控中心                     │
│   Prometheus + Grafana + AlertManager       │
│   (部署在 group-hq region)                  │
└──────────────────┬──────────────────────────┘
                   │
      ┌────────────┼────────────┐
      │            │            │
┌─────▼─────┐ ┌───▼─────┐ ┌───▼─────┐
│区域监控   │ │区域监控 │ │区域监控 │
│(cn-north)│ │(cn-south)│ │(overseas)│
└─────┬─────┘ └────┬────┘ └────┬────┘
      │            │            │
   ┌──┴──┐      ┌──┴──┐      ┌──┴──┐
   │企业A│      │企业C│      │企业Y│
   │Prom│       │Prom│       │Prom│
   └─────┘      └─────┘      └─────┘
```

### 8.2 Prometheus 联邦配置

```yaml
# 集团 Prometheus 配置
scrape_configs:
  - job_name: 'nomad-federation'
    scrape_interval: 30s
    
    # 联邦拉取各区域 Prometheus
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        - '{job="nomad"}'
        - '{job="nomad_client"}'
        - '{__name__=~"nomad:.*"}'
    static_configs:
      - targets:
        - 'prometheus.cn-north.group.com:9090'
        - 'prometheus.cn-south.group.com:9090'
        - 'prometheus.overseas.group.com:9090'
```

### 8.3 关键指标

| 指标 | 告警阈值 | 说明 |
|------|----------|------|
| `nomad_raft_leader_lastContact` | > 500ms | Leader 联系延迟 |
| `nomad_raft_commitTime` | > 100ms | Raft 提交延迟 |
| `nomad_client_allocated_cpu` | > 90% | CPU 使用率 |
| `nomad_client_allocated_memory` | > 90% | 内存使用率 |
| `nomad_job_allocations_failed` | > 0 | 分配失败 |
| `nomad_serf_members` | < 预期值 | Gossip 成员减少 |
| `nomad_raft_peers` | < 预期值 | Raft peer 减少 |

### 8.4 日志聚合

```hcl
# 所有 Client 部署 Filebeat (system job)
job "filebeat" {
  type        = "system"
  datacenters = ["ent-001-dc1"]
  
  group "filebeat" {
    task "filebeat" {
      driver = "docker"
      config {
        image = "docker.elastic.co/beats/filebeat:8.0.0"
        mounts = [
          {
            type   = "bind"
            source = "/opt/nomad/data/alloc"
            target = "/usr/share/filebeat/alloc"
            readonly = true
          }
        ]
      }
    }
  }
}
```

### 8.5 分布式追踪

```hcl
# Jaeger Agent 作为 system job
job "jaeger-agent" {
  type = "system"
  
  group "agent" {
    task "jaeger" {
      driver = "docker"
      config {
        image = "jaegertracing/jaeger-agent:1.35"
        args = [
          "--collector.host-port=jaeger-collector.group.com:14250"
        ]
      }
    }
  }
}
```

---

## 9. 灾备与高可用

### 9.1 高可用设计

| 组件 | 高可用方案 | RTO | RPO |
|------|-----------|-----|-----|
| Server 集群 | 3/5 节点 Raft | 0 | 0 |
| Client | 无状态，自动重新注册 | < 30s | N/A |
| Raft 日志 | 多副本复制 | 0 | 0 |
| Gossip | 去中心化自愈 | < 60s | N/A |
| ACL 数据 | 跨 region 复制 | < 5min | < 5min |

### 9.2 备份策略

```bash
#!/bin/bash
# 企业 Server 状态备份脚本

BACKUP_DIR="/backup/nomad/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# 1. Raft 快照
nomad operator snapshot save $BACKUP_DIR/raft.snapshot -region=ent-001

# 2. ACL 策略导出
nomad acl policy list -region=ent-001 > $BACKUP_DIR/policies.json

# 3. Job 定义导出
for ns in ent-001 ent-001-staging; do
  for job in $(nomad job list -namespace=$ns -region=ent-001 -json | jq -r '.[].ID'); do
    nomad job inspect $job -namespace=$ns -region=ent-001 > $BACKUP_DIR/job-$ns-$job.json
  done
done

# 4. 推送到异地备份
rsync -az $BACKUP_DIR/ backup-server.group.com:/backup/nomad-remote/
```

### 9.3 恢复流程

```bash
#!/bin/bash
# 企业数据中心灾难恢复

# 1. 恢复 Raft 状态
nomad operator snapshot restore /backup/nomad/latest/raft.snapshot

# 2. 验证集群状态
nomad server members -region=ent-001
nomad job status -region=ent-001

# 3. 恢复 ACL（若需要）
for policy in $(cat /backup/policies.json | jq -r '.[] | .Name'); do
  nomad acl policy apply $policy /backup/policy-$policy.hcl
done

# 4. 恢复 Job
for jobfile in /backup/jobs/*.json; do
  nomad job run -namespace=$ns $jobfile
done
```

### 9.4 跨企业容灾

```
正常状态:
企业A (ent-001): 主服务 (count=10)  ←─── 流量
企业B (ent-002): 备服务 (count=2)

故障切换:
企业A 故障 → 企业B 提升至 count=10 → 流量切换到企业B
```

---

## 10. CI/CD 集成

### 10.1 部署流水线

```
开发 → 代码提交 → CI 构建 → 镜像推送 → Dev 部署 → Staging 部署 → 生产部署
                                          ↓
                                     企业内 Dev Namespace
                                          ↓
                                     企业内 Staging Namespace
                                          ↓
                                     企业内 Production Namespace
                                          ↓
                                     (可选) 跨企业容灾部署
```

### 10.2 GitOps 部署模型

```yaml
# .gitlab-ci.yml 示例
stages:
  - build
  - deploy-dev
  - deploy-staging
  - deploy-production

deploy-production:
  stage: deploy-production
  script:
    # 遍历所有目标企业，并行部署
    - |
      for enterprise in ent-001 ent-002 ent-003; do
        nomad job run \
          -region=$enterprise \
          -namespace=$enterprise \
          -var="enterprise=$enterprise" \
          -var="image_tag=$CI_COMMIT_SHA" \
          jobs/microservice.nomad &
      done
      wait
  only:
    - main
```

### 10.3 多企业配置管理

```hcl
# jobs/microservice.nomad.hcl
job "microservice" {
  region      = "${enterprise}"
  datacenters = ["${enterprise}-dc1"]
  namespace   = "${enterprise}"
  node_pool   = "${enterprise}"
  
  group "api" {
    task "api" {
      driver = "docker"
      config {
        image = "registry.group.com/${enterprise}/api:${image_tag}"
      }
    }
  }
}
```

---

## 11. 实施路线图

### 阶段一：集团总部建设（第 1-2 月）

| 任务 | 产出 |
|------|------|
| 集团 Nomad Server 集群部署 | 5 节点高可用集群 |
| TLS CA 与证书体系 | 完整 PKI |
| ACL 初始化 | Bootstrap + 管理 Token |
| 监控平台搭建 | Prometheus + Grafana |
| Gossip 加密 | 密钥生成与配置 |
| 文档与培训 | 运维手册 |

### 阶段二：区域中心建设（第 3-4 月）

| 任务 | 产出 |
|------|------|
| 5 个区域中心 Server 部署 | 每区域 5 节点 |
| WAN Federation 配置 | 跨区域 gossip 互通 |
| ACL 复制配置 | 策略同步 |
| 网络打通 | 防火墙规则、VPN |

### 阶段三：试点企业接入（第 5-6 月）

| 任务 | 产出 |
|------|------|
| 选择 3-5 家试点企业 | 试点名单 |
| 企业 Server 部署 | 每企业 3 节点 |
| Client 节点接入 | 工作负载迁移 |
| Namespace/ACL 配置 | 多租户隔离 |
| 问题修复与优化 | 经验总结 |

### 阶段四：全面推广（第 7-12 月）

| 任务 | 产出 |
|------|------|
| 剩余 95+ 企业接入 | 全覆盖 |
| CI/CD 流水线建设 | 自动化部署 |
| 容灾演练 | 故障切换验证 |
| 性能调优 | 容量规划 |

### 阶段五：持续运营（第 12 月后）

| 任务 | 频率 |
|------|------|
| 版本升级 | 季度 |
| 密钥轮换 | 半年 |
| 灾备演练 | 季度 |
| 安全审计 | 年度 |
| 容量评估 | 月度 |

---

## 12. 运维手册

### 12.1 日常运维操作

```bash
# 查看集团所有区域
nomad operator members -region=group-hq

# 查看特定企业状态
nomad server members -region=ent-001
nomad node status -region=ent-001
nomad job status -region=ent-001 -namespace=ent-001

# 跨区域查询
nomad job status -region=ent-001 -namespace=ent-001 my-app
nomad alloc status -region=ent-001 <alloc-id>

# 节点维护模式
nomad node eligibility -disable -region=ent-001 <node-id>
nomad node drain -enable -yes -region=ent-001 <node-id>
```

### 12.2 故障处理

#### 12.2.1 Server 故障

```bash
# 1. 检查集群状态
nomad operator raft list-peers -region=ent-001

# 2. 移除故障 Server
nomad operator raft remove-peer -region=ent-001 <address>

# 3. 新 Server 加入
# 启动新 Server，配置 retry_join 指向健康节点
```

#### 12.2.2 Gossip 分区

```bash
# 检查 gossip 成员
nomad operator members -region=group-hq

# 强制移除故障节点
nomad operator members -force-leave -region=group-hq <node-name>

# 验证恢复
nomad operator members -region=group-hq | grep -c alive
```

#### 12.2.3 ACL Token 泄露

```bash
# 1. 吊销 Token
nomad acl token delete -region=group-hq <token-accessor-id>

# 2. 更新受影响的 Job
nomad job run -vault-token=<new-token> job.nomad

# 3. 审计 Token 使用记录
grep "<token>" /var/log/nomad/audit.log
```

### 12.3 版本升级流程

```bash
# 1. 备份
nomad operator snapshot save /backup/pre-upgrade.snapshot -region=ent-001

# 2. 设置 Autopilot 暂停自动清理
nomad operator autopilot set-config -cleanup-dead-servers=false -region=ent-001

# 3. 逐个升级 Server（从 Follower 开始）
for server in server2 server3 server1; do
  # 停止旧版本
  systemctl stop nomad@$server
  
  # 升级二进制
  cp nomad-new /usr/local/bin/nomad
  
  # 启动新版本
  systemctl start nomad@$server
  
  # 等待健康
  until nomad operator raft list-peers -region=ent-001 | grep $server; do
    sleep 5
  done
done

# 4. 恢复 Autopilot
nomad operator autopilot set-config -cleanup-dead-servers=true -region=ent-001

# 5. 升级 Client（滚动）
for node in $(nomad node status -region=ent-001 -json | jq -r '.[].ID'); do
  nomad node drain -enable -yes -region=ent-001 $node
  # 升级 Client
  nomad node drain -disable -yes -region=ent-001 $node
done
```

---

## 13. 容量规划

### 13.1 Server 硬件规格

| 企业规模 | CPU | 内存 | 磁盘 | 网络 |
|----------|-----|------|------|------|
| 小 (<20 节点) | 4 核 | 16 GB | 100 GB SSD | 1 Gbps |
| 中 (20-100 节点) | 8 核 | 32 GB | 500 GB SSD | 10 Gbps |
| 大 (>100 节点) | 16 核 | 64 GB | 1 TB NVMe | 10 Gbps |
| 集团 HQ | 32 核 | 128 GB | 2 TB NVMe | 10 Gbps |

### 13.2 Client 硬件规格

| 工作负载类型 | CPU | 内存 | 磁盘 |
|-------------|-----|------|------|
| 通用服务 | 8-16 核 | 32-64 GB | 200 GB |
| 计算密集 | 32 核 | 64 GB | 200 GB |
| 内存密集 | 8 核 | 128 GB | 200 GB |
| GPU | 8 核 + GPU | 32 GB | 200 GB |
| 存储 | 4 核 | 16 GB | 10 TB |

### 13.3 网络带宽估算

```
单企业 Server 间流量:
  Raft 复制: ~10 Mbps (每 1000 ops)
  Gossip: ~1 Mbps
  总计: ~15 Mbps

集团 gossip 流量 (100 企业):
  每企业: ~2 Mbps (gossip 全局池)
  HQ Server: ~200 Mbps (聚合)

跨区域 RPC:
  ACL 复制: ~5 Mbps
  联邦查询: ~10 Mbps
```

---

## 14. 成本估算

### 14.1 硬件成本（一次性）

| 组件 | 数量 | 单价 (万元) | 小计 (万元) |
|------|------|------------|------------|
| 集团 HQ Server | 5 | 10 | 50 |
| 区域中心 Server | 25 (5区域×5) | 8 | 200 |
| 企业 Server | 300 (100×3) | 5 | 1500 |
| 企业 Client | 2000 | 3 | 6000 |
| 网络设备 | - | - | 500 |
| **合计** | | | **8250** |

### 14.2 年度运营成本

| 项目 | 年费用 (万元) |
|------|--------------|
| 电力与机房 | 500 |
| 网络带宽 | 200 |
| 软件许可 (Nomad Enterprise) | 300 |
| 运维团队 (10 人) | 500 |
| 备份与灾备 | 100 |
| **合计** | **1600** |

---

## 15. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Gossip 风暴（100+ Server） | 网络拥塞 | 监控 gossip 流量，必要时调整 memberlist 参数 |
| 跨区域延迟 | Raft 性能 | 每 region 独立 Raft，仅 ACL 跨区复制 |
| 单点配置错误 | 集群故障 | 配置版本管理 + 灰度发布 |
| ACL 策略冲突 | 权限错误 | 策略审计 + 测试环境验证 |
| 证书过期 | 服务中断 | 自动化证书续期 + 提前告警 |
| 版本不一致 | 兼容性问题 | 统一版本管理 + 升级前测试 |

---

## 16. 最佳实践

### 16.1 配置管理

1. **所有配置版本化**：Git 仓库管理所有 Nomad 配置
2. **配置模板化**：使用变量区分企业/环境
3. **配置验证**：CI 流水线验证配置语法
4. **灰度发布**：先试点企业，再全量推广

### 16.2 Job 管理

1. **Job 文件版本化**：与代码同库管理
2. **使用 variables**：`variable "enterprise" {}` 参数化
3. **资源限制**：所有 Job 必须指定 resources
4. **健康检查**：所有 service job 必须配置 check

### 16.3 安全

1. **最小权限原则**：ACL 策略按角色最小化授权
2. **Token 轮换**：定期轮换服务 Token
3. **审计日志**：开启 ACL 审计，集中收集
4. **网络分段**：企业间网络隔离

### 16.4 监控

1. **多层级监控**：集团/区域/企业三级
2. **关键指标告警**：Raft 健康、资源使用、Job 状态
3. **容量预测**：基于历史数据预测扩容需求
4. **SLO 定义**：API 可用性 99.9%，调度延迟 < 5s

---

## 17. 附录

### 17.1 完整配置模板

<details>
<summary>集团 HQ Server 完整配置</summary>

```hcl
# /etc/nomad.d/group-hq.hcl
datacenter = "hq-dc1"
region     = "group-hq"
data_dir   = "/opt/nomad/data"
bind_addr  = "10.0.1.10"
log_level  = "INFO"
log_file   = "/var/log/nomad/"
log_rotate_duration = "24h"
log_rotate_max_files = 7

server {
  enabled          = true
  bootstrap_expect = 5
  raft_protocol    = 3
  encrypt          = "BASE64_KEY_HERE"
  num_schedulers   = 4
  enabled_schedulers = ["service", "batch", "sysbatch", "system"]
  
  advertise {
    rpc  = "10.0.1.10:4647"
    serf = "10.0.1.10:4648"
  }
}

server_join {
  retry_join = [
    "10.10.0.10:4648",
    "10.20.0.10:4648",
    "10.30.0.10:4648",
  ]
  retry_interval     = "15s"
  retry_max_attempts = 0
}

acl {
  enabled            = true
  token_ttl          = "1h"
  policy_ttl         = "5m"
  role_ttl           = "5m"
  enable_key_indices = true
}

tls {
  http                      = true
  rpc                       = true
  ca_file                   = "/opt/nomad/tls/ca.crt"
  cert_file                 = "/opt/nomad/tls/server.crt"
  key_file                  = "/opt/nomad/tls/server.key"
  verify_server_client_cert = true
  verify_https_client       = true
  rpc_upgrade_mode          = false
}

autopilot {
  cleanup_dead_servers      = true
  last_contact_threshold    = "500ms"
  max_trailing_logs         = 500
  server_stabilization_time = "10s"
  enable_redundancy_zones   = true
  disable_upgrade_migration = false
  enable_custom_upgrades    = true
}

telemetry {
  prometheus_metrics     = true
  publish_allocation_metrics = true
  publish_node_metrics   = true
  statsd_address         = "localhost:8125"
}

limits {
  rpc_handshake_timeout    = "10s"
  rpc_request_timeout      = "30s"
  rpc_max_connections      = 5000
  rpc_rate                 = 1000
  rpc_burst                = 2000
}
```
</details>

<details>
<summary>企业 Client 完整配置</summary>

```hcl
# /etc/nomad.d/ent-001-client.hcl
datacenter = "ent-001-dc1"
region     = "ent-001"
data_dir   = "/opt/nomad/data"
bind_addr  = "10.10.1.100"
log_level  = "INFO"

client {
  enabled    = true
  node_class = "general"
  
  meta {
    enterprise  = "ent-001"
    environment = "production"
    rack        = "rack-1"
    zone        = "zone-a"
  }
  
  node_pool = "ent-001"
  
  reserve {
    cpu            = 500
    memory         = 512
    disk           = 1024
    reserved_ports = "22,80,443,4646,4647,4648"
  }
  
  host_volume "ent-001-data" {
    path      = "/opt/nomad/volumes/data"
    read_only = false
  }
}

server_join {
  retry_join = ["10.10.1.10:4647", "10.10.1.11:4647", "10.10.1.12:4647"]
}

tls {
  http = true
  rpc  = true
  ca_file   = "/opt/nomad/tls/ca.crt"
  cert_file = "/opt/nomad/tls/client.crt"
  key_file  = "/opt/nomad/tls/client.key"
}

telemetry {
  prometheus_metrics = true
}
```
</details>

### 17.2 部署脚本

<details>
<summary>批量企业部署脚本</summary>

```bash
#!/bin/bash
# deploy-enterprise.sh - 批量部署企业 Nomad 集群

ENTPRISES=(
  "ent-001:10.10.1.0/24:10.10.1.10:3"
  "ent-002:10.10.2.0/24:10.10.2.10:3"
  # ... 100 家企业
)

for entry in "${ENTPRISES[@]}"; do
  IFS=':' read -r ent_id network server_ip server_count <<< "$entry"
  
  echo "Deploying $ent_id..."
  
  # 1. 生成配置
  cat > /tmp/nomad-${ent_id}.hcl <<EOF
datacenter = "${ent_id}-dc1"
region     = "$ent_id"
data_dir   = "/opt/nomad/data"
bind_addr  = "$server_ip"

server {
  enabled          = true
  bootstrap_expect = $server_count
  encrypt          = "$GOSSIP_KEY"
  
  advertise {
    rpc  = "$server_ip:4647"
    serf = "$server_ip:4648"
  }
}

server_join {
  retry_join = ["10.10.0.10:4648"]
}

acl {
  enabled           = true
  replication_token = "$REPLICATION_TOKEN"
}
EOF

  # 2. 分发配置到所有 Server
  for i in $(seq 1 $server_count); do
    ip_suffix=$((10 + i - 1))
    target_ip="${network%.0/24}.${ip_suffix}"
    
    scp /tmp/nomad-${ent_id}.hcl root@${target_ip}:/etc/nomad.d/nomad.hcl
    ssh root@${target_ip} "systemctl restart nomad"
  done
  
  # 3. 等待集群就绪
  until nomad server members -region=$ent_id | grep -c alive | grep -q $server_count; do
    sleep 5
  done
  
  echo "$ent_id deployed successfully."
done
```
</details>

### 17.3 监控告警规则

<details>
<summary>Prometheus 告警规则</summary>

```yaml
# nomad-alerts.yml
groups:
  - name: nomad-cluster
    rules:
      - alert: NomadNoLeader
        expr: nomad_raft_has_leader == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Nomad cluster has no leader (region={{ $labels.region }})"
      
      - alert: NomadServerDown
        expr: nomad_serf_members{status="failed"} > 0
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Nomad server member failed"
      
      - alert: NomadHighRaftLatency
        expr: histogram_quantile(0.99, nomad_raft_commitTime_bucket) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Raft commit latency > 100ms"
      
      - alert: NomadClientHighCPU
        expr: nomad_client_allocated_cpu / nomad_client_total_cpu > 0.9
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Client CPU usage > 90%"
      
      - alert: NomadJobAllocationFailed
        expr: increase(nomad_job_allocations_failed[5m]) > 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Job allocations failing"
```
</details>

---

## 总结

本方案为 100+ 企业的大型集团设计了基于 Nomad 的统一工作负载编排平台，核心特点：

1. **三级架构**：集团总部（策略中心）→ 区域中心（汇聚）→ 企业（自治）
2. **单一 Gossip 池**：所有 Server 通过 WAN Federation 互联，自动发现
3. **多租户隔离**：Namespace + Node Pool + ACL 三重隔离
4. **安全合规**：TLS + Gossip 加密 + ACL + Vault 集成
5. **高可用容灾**：Raft 多副本 + 跨企业容灾 + 自动故障切换
6. **统一运维**：集团/区域/企业三级监控 + GitOps 自动化部署
7. **弹性扩展**：支持从 100 到 500+ 企业的平滑扩展

通过分阶段实施（总部→区域→试点→全面推广），可在 12 个月内完成全集团部署，建立统一的云原生工作负载编排能力。
