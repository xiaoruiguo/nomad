# Nomad UI Administration 路由启用方法

## 概述

Nomad UI 的 `administration` 路由提供了 ACL 管理功能，包括：策略（Policies）、角色（Roles）、令牌（Tokens）、命名空间（Namespaces）和 Sentinel 策略的管理。该路由受到严格的权限控制，只有满足特定条件才能访问。

---

## 一、路由定义与结构

### 1.1 路由配置

`administration` 路由在 [router.ts](file:///D:/claude/nomad/ui/app/router.ts) 中定义：

```typescript
this.route('administration', function () {
  this.route('policies', function () {
    this.route('new');
    this.route('policy', { path: '/:name' });
  });
  this.route('roles', function () {
    this.route('new');
    this.route('role', { path: '/:id' });
  });
  this.route('tokens', function () {
    this.route('new');
    this.route('token', { path: '/:id' });
  });
  this.route('namespaces', function () {
    this.route('new');
    this.route('acl-namespace', { path: '/:name' });
  });
  this.route('sentinel-policies', function () {
    this.route('new');
    this.route('gallery');
    this.route('policy', { path: '/:id' });
  });
});
```

### 1.2 路由层级

| 路由路径 | 功能描述 |
|---------|---------|
| `/administration` | 管理面板首页 |
| `/administration/policies` | ACL 策略管理 |
| `/administration/roles` | ACL 角色管理 |
| `/administration/tokens` | ACL 令牌管理 |
| `/administration/namespaces` | 命名空间管理 |
| `/administration/sentinel-policies` | Sentinel 策略管理（企业版） |

---

## 二、权限控制机制

### 2.1 路由守卫逻辑

[administration.js](file:///D:/claude/nomad/ui/app/routes/administration.js) 中的 `beforeModel()` 钩子实现了路由级别的权限控制：

```javascript
beforeModel() {
  if (
    this.abilities.cannot('list policies') ||
    this.abilities.cannot('list roles') ||
    this.abilities.cannot('list tokens') ||
    this.abilities.cannot('list namespaces')
  ) {
    this.router.transitionTo('/jobs');  // 权限不足时重定向到 jobs 页面
  }
}
```

**访问条件**：必须同时满足以下四个权限才能访问 administration 路由：
- ✅ `can('list policies')` - 列出策略
- ✅ `can('list roles')` - 列出角色  
- ✅ `can('list tokens')` - 列出令牌
- ✅ `can('list namespaces')` - 列出命名空间

### 2.2 能力系统（Abilities System）

UI 使用 `ember-can` 库实现基于能力的权限控制。相关能力定义如下：

#### Policy 能力
[policy.js](file:///D:/claude/nomad/ui/app/abilities/policy.js):
```javascript
export default class Policy extends AbstractAbility {
  @alias('selfTokenIsManagement') canRead;
  @alias('selfTokenIsManagement') canList;
  @alias('selfTokenIsManagement') canWrite;
  @alias('selfTokenIsManagement') canUpdate;
  @alias('selfTokenIsManagement') canDestroy;
}
```

#### Role 能力
[role.js](file:///D:/claude/nomad/ui/app/abilities/role.js):
```javascript
export default class Role extends AbstractAbility {
  @alias('selfTokenIsManagement') canRead;
  @alias('selfTokenIsManagement') canList;
  @alias('selfTokenIsManagement') canWrite;
  @alias('selfTokenIsManagement') canUpdate;
  @alias('selfTokenIsManagement') canDestroy;
}
```

#### Token 能力
[token.js](file:///D:/claude/nomad/ui/app/abilities/token.js):
```javascript
export default class extends AbstractAbility {
  @alias('selfTokenIsManagement') canRead;
  @alias('selfTokenIsManagement') canList;
  @alias('selfTokenIsManagement') canWrite;
  @alias('selfTokenIsManagement') canUpdate;
  @alias('selfTokenIsManagement') canDestroy;
}
```

#### Namespace 能力
[namespace.js](file:///D:/claude/nomad/ui/app/abilities/namespace.js):
```javascript
export default class Namespace extends AbstractAbility {
  @alias('selfTokenIsManagement') canList;
  @alias('selfTokenIsManagement') canUpdate;
  @alias('selfTokenIsManagement') canWrite;
  @alias('selfTokenIsManagement') canDestroy;
}
```

### 2.3 核心判断条件

所有 administration 相关能力（policy、role、token、namespace）都**只依赖于** `selfTokenIsManagement` 属性，定义在 [abstract.js](file:///D:/claude/nomad/ui/app/abilities/abstract.js):

```javascript
@not('token.aclEnabled') bypassAuthorization;
@equal('token.selfToken.type', 'management') selfTokenIsManagement;
```

**⚠️ 关键设计差异**：

| 能力类 | 权限检查逻辑 | 说明 |
|-------|-------------|------|
| policy.js, role.js, token.js, namespace.js | `@alias('selfTokenIsManagement')` | 仅检查 management token |
| job.js, client.js, allocation.js 等 | `@or('bypassAuthorization', 'selfTokenIsManagement')` | 同时检查 ACL 状态和 token |

**实际权限判断流程**：

```
┌─────────────────────────────────────────────────────────────┐
│                   访问 administration 路由                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │ selfToken 是否存在？   │
                    └──────────┬───────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
        selfToken = null                  selfToken 存在
              │                                 │
              ▼                                 ▼
    ┌──────────────────┐               ┌────────────────────┐
    │ selfTokenIs      │               │ selfToken.type     │
    │ Management =     │               │ === 'management'?  │
    │    false         │               └────────┬───────────┘
    └────────┬─────────┘                        │
             │                          ┌───────┴───────┐
             ▼                          │               │
     ❌ 重定向到 /jobs                  ▼               ▼
                              ✅ 允许访问         ❌ 重定向到 /jobs
```

**说明**：
- 即使 ACL 被禁用（`bypassAuthorization = true`），administration 路由的权限检查**不会使用**此属性
- 必须有有效的 management token 才能访问 administration 路由
- 这是一个安全设计决策，确保 ACL 管理功能始终受到保护

---

## 三、启用方法

### 方法一：使用 Management Token（推荐）

这是生产环境中推荐的方式，使用具有管理权限的 token 登录 UI。

**Token 类型要求**：
- Token 的 `type` 字段必须为 `management`
- 可以通过以下方式获取 Management Token：

```bash
# 1. 初始引导时获取（首次启动时）
nomad acl bootstrap

# 2. 创建新的 Management Token
nomad acl token create -name="admin-token" -type=management
```

**Token 验证**：

[token.js](file:///D:/claude/nomad/ui/app/services/token.js) 中的 `fetchSelfToken` task 会验证 token：

```javascript
@task(function* (regionOverride = null) {
  const TokenAdapter = getOwner(this).lookup('adapter:token');
  try {
    var token = yield TokenAdapter.findSelf(regionOverride);
    if (token.accessor === 'acls-disabled') {
      this.set('aclEnabled', false);
      return null;
    }
    this.secret = token.secret;
    return token;
  } catch (e) {
    // 处理错误...
  }
})
fetchSelfToken;
```

### 方法二：禁用 ACL （开发/测试环境 - 注意限制）

**⚠️ 重要说明**：根据源码分析，禁用 ACL **并不能直接启用 administration 路由**。

**技术原因**：

administration 相关的能力类（policy、role、token、namespace）只依赖 `selfTokenIsManagement`：

```javascript
// policy.js, role.js, token.js, namespace.js
@alias('selfTokenIsManagement') canList;
```

而其他能力类（如 job、client）则同时检查两个条件：

```javascript
// job.js, client.js 等
@or('bypassAuthorization', 'selfTokenIsManagement') canList;
```

当 ACL 禁用时：
- `bypassAuthorization = true`（绕过授权）
- `selfToken = null`（没有 token）
- `selfTokenIsManagement = false`（因为 selfToken 为 null）

由于 administration 能力类**没有使用 `bypassAuthorization`**，即使 ACL 禁用，权限检查仍会失败。

**配置方式**（仍可参考）：

编辑 Nomad 服务器配置文件：

```hcl
acl {
  enabled = false
}
```

**或启动时通过环境变量**：

```bash
nomad agent -server -acl-enabled=false
```

**实际效果**：
- 虽然其他路由（jobs、clients 等）可以正常访问
- 但 administration 路由**仍需要 management token 才能访问**
- 这是一个设计决策，确保管理功能始终受到保护

---

## 四、测试验证证据

### 测试用例验证

[acceptance/policies-test.js](file:///D:/claude/nomad/ui/tests/acceptance/policies-test.js) 中的测试用例验证了这一行为：

**正面测试（有权限）**：
```javascript
test('Policies index route looks good', async function (assert) {
  allScenarios.policiesTestCluster(this.server);
  window.localStorage.nomadTokenSecret = this.server.db.tokens[0].secretId;
  await visit('/administration/policies');
  assert.dom('[data-test-gutter-link="administration"]').exists();
  assert.deepEqual(currentURL(), '/administration/policies');
});
```

**负面测试（无权限）**：
```javascript
test('Prevents policies access if you lack a management token', async function (assert) {
  allScenarios.policiesTestCluster(this.server);
  window.localStorage.nomadTokenSecret = this.server.db.tokens[1].secretId;
  await visit('/administration/policies');
  assert.deepEqual(currentURL(), '/jobs');  // 被重定向
  assert.dom('[data-test-gutter-link="administration"]').doesNotExist();
});
```

### Token Factory 配置

[mirage/factories/token.js](file:///D:/claude/nomad/ui/mirage/factories/token.js) 显示：

```javascript
type: (i) => (i === 0 ? 'management' : 'client'),
```

| Token 索引 | 类型 | 是否可访问 administration |
|-----------|------|--------------------------|
| `tokens[0]` | management | ✅ 是 |
| `tokens[1]` | client | ❌ 否（重定向到 /jobs） |

---

## 五、侧边栏菜单显示控制

除了路由级别的权限检查，UI 侧边栏菜单也有独立的权限判断。

[gutter-menu.hbs](file:///D:/claude/nomad/ui/app/components/gutter-menu.hbs):

```handlebars
{{#if (can "list policies")}}
  {{!-- 显示 administration 菜单项 --}}
{{/if}}
```

**显示条件**：只需满足 `can('list policies')` 权限即可在侧边栏显示菜单入口。

---

## 六、Sentinel 策略的额外权限

Sentinel 策略是企业版功能，有额外的权限检查：

```javascript
// 在 model() 钩子中
sentinelPolicies: this.abilities.can('list sentinel-policy')
  ? this.store.findAll('sentinel-policy', { reload: true })
  : [],
```

**要求**：除了 management token，还需要 Nomad Enterprise 许可证才能使用 Sentinel 功能。

---

## 七、常见问题与排查

### 问题 1：访问 /administration 自动跳转到 /jobs

**原因**：当前 token 不具有 management 权限。

**排查步骤**：

```bash
# 1. 检查当前 token 类型
nomad acl token self

# 2. 如果不是 management 类型，获取 bootstrap token
nomad acl bootstrap

# 3. 在 UI 设置中更新 token
# 访问: /settings/tokens
```

### 问题 2：侧边栏不显示 Administration 菜单

**原因**：当前 token 没有 `list policies` 权限。

**解决方案**：使用 management token（禁用 ACL 无效）。

### 问题 3：Sentinel Policies 页面为空

**原因**：需要 Nomad Enterprise 版本和相应许可证。

**验证**：

```bash
# 检查 Nomad 版本
nomad version

# 检查企业功能状态
nomad operator license get
```

---

## 八、安全最佳实践

### 生产环境

| 做法 | 说明 |
|-----|------|
| ✅ 使用 Management Token | 仅在必要时使用管理令牌 |
| ✅ 启用 ACL | 始终保持 ACL 功能开启 |
| ✅ 定期轮换 Token | 定期更换敏感令牌 |
| ✅ 使用 Role-Based ACL | 对于非管理操作，使用 role-based token |

### 开发/测试环境

| 做法 | 说明 |
|-----|------|
| ✅ 需要 Management Token | 即使禁用 ACL，administration 路由仍需要 management token |
| ⚠️ ACL 禁用限制 | `NOMAD_ACL_ENABLED=false` 对 administration 路由无效 |
| ✅ 记录配置 | 在 README 中说明 ACL 配置状态和 token 要求 |

---

## 九、源码文件索引

| 文件路径 | 功能描述 |
|---------|---------|
| [ui/app/router.ts](file:///D:/claude/nomad/ui/app/router.ts) | 路由定义 |
| [ui/app/routes/administration.js](file:///D:/claude/nomad/ui/app/routes/administration.js) | 管理路由逻辑与权限检查 |
| [ui/app/abilities/abstract.js](file:///D:/claude/nomad/ui/app/abilities/abstract.js) | 能力抽象基类 |
| [ui/app/abilities/policy.js](file:///D:/claude/nomad/ui/app/abilities/policy.js) | Policy 能力定义 |
| [ui/app/abilities/role.js](file:///D:/claude/nomad/ui/app/abilities/role.js) | Role 能力定义 |
| [ui/app/abilities/token.js](file:///D:/claude/nomad/ui/app/abilities/token.js) | Token 能力定义 |
| [ui/app/abilities/namespace.js](file:///D:/claude/nomad/ui/app/abilities/namespace.js) | Namespace 能力定义 |
| [ui/app/services/token.js](file:///D:/claude/nomad/ui/app/services/token.js) | Token 服务与 ACL 状态管理 |
| [ui/app/components/gutter-menu.hbs](file:///D:/claude/nomad/ui/app/components/gutter-menu.hbs) | 侧边栏菜单权限控制 |

---

## 十、附录：Token 类型说明

| Token 类型 | 说明 | 权限范围 |
|-----------|------|---------|
| `management` | 管理令牌 | 完全访问所有资源 |
| `client` | 客户端令牌 | 受策略限制的访问 |

**判断逻辑**：

```javascript
@equal('token.selfToken.type', 'management') selfTokenIsManagement;
```

只有当 `selfToken.type === 'management'` 时，`selfTokenIsManagement` 才为 `true`，从而获得管理面板的访问权限。

---

## 十一、`nomad agent -dev` 模式详细启用指南

### 11.1 Dev 模式概述

`nomad agent -dev` 是单节点开发模式，适合本地开发和测试：

| 特性 | 说明 |
|-----|------|
| 节点类型 | 同时作为 Server 和 Client |
| 数据存储 | 内存（重启后丢失） |
| HTTP 端口 | 4646 |
| RPC 端口 | 4647 |

### 11.2 完整启用步骤

#### 第一步：启动 Dev 模式并启用 ACL

```bash
# 启动命令（必须添加 -acl-enabled 标志）
nomad agent -dev -acl-enabled -bind 0.0.0.0

# 可选：指定数据目录（dev 模式默认使用内存）
nomad agent -dev -acl-enabled -data-dir /tmp/nomad-dev
```

**输出示例**：
```
==> No configuration files loaded
==> Starting Nomad agent...
==> Nomad agent configuration:

       Client: true
      Log Level: INFO
        Region: global (DC: dc1)
        Server: true (Bootstrap: 1)

    Addr: HTTP: 0.0.0.0:4646, RPC: 127.0.0.1:4647, Serf: 0.0.0.0:4648
==> Nomad agent started!
```

#### 第二步：获取 Bootstrap Token

在另一个终端窗口执行：

```bash
nomad acl bootstrap
```

**输出示例**：
```
Accessor ID:       acltoken-abc123
Secret ID:         s.xyz789secret
Name:              Bootstrap Token
Type:              management
Global:            true
Policies:          n/a
Roles:             n/a
Create Time:       2024-01-15 10:30:00 +0000 UTC
Expiration Time:   <none>
```

**关键信息**：
- `Secret ID`: **s.xyz789secret**（需要复制此值）
- `Type`: **management**（确认是管理令牌）

#### 第三步：在 UI 中配置 Token

1. **打开 UI**：访问 `http://localhost:4646/ui`

2. **进入设置**：点击右上角齿轮图标 → **Settings**

3. **配置令牌**：
   - 选择 **Tokens** 选项卡
   - 在 **Token Secret ID** 输入框中粘贴 `Secret ID`
   - 点击 **Save Token** 按钮

4. **验证配置**：
   - 页面会刷新并显示当前令牌信息
   - 确认显示 **Type: management**

#### 第四步：访问 Administration 路由

配置成功后，有两种方式访问：

**方式一：通过侧边栏菜单**
- 左侧导航栏会出现 **Administration** 菜单项
- 点击展开子菜单：**Policies**、**Roles**、**Tokens**、**Namespaces**

**方式二：直接访问 URL**
```
# 管理面板首页
http://localhost:4646/ui/administration

# 策略管理
http://localhost:4646/ui/administration/policies

# 角色管理
http://localhost:4646/ui/administration/roles

# 令牌管理
http://localhost:4646/ui/administration/tokens

# 命名空间管理
http://localhost:4646/ui/administration/namespaces
```

### 11.3 自动化启动脚本

创建 `start-nomad-dev.sh`：

```bash
#!/bin/bash

# 清理旧进程和状态
pkill nomad 2>/dev/null || true
rm -rf /tmp/nomad-dev 2>/dev/null || true

# 启动 Dev 模式
echo "=== 启动 Nomad Dev 模式 ==="
nomad agent -dev -acl-enabled -bind 0.0.0.0 &
NOMAD_PID=$!

# 等待启动完成
echo "=== 等待 Nomad 启动 ==="
sleep 3

# 检查是否已启动
if ! curl -s http://localhost:4646/v1/agent/self > /dev/null; then
    echo "=== Nomad 启动失败 ==="
    kill $NOMAD_PID
    exit 1
fi

# 获取或创建 Bootstrap Token
echo "=== 获取管理令牌 ==="
BOOTSTRAP_OUTPUT=$(nomad acl bootstrap 2>&1)
if echo "$BOOTSTRAP_OUTPUT" | grep -q "Secret ID"; then
    SECRET_ID=$(echo "$BOOTSTRAP_OUTPUT" | grep "Secret ID:" | awk '{print $4}')
else
    # 已存在 bootstrap token，获取当前 token
    SECRET_ID=$(nomad acl token self -format=json | jq -r '.SecretID')
fi

# 保存到文件
echo "$SECRET_ID" > /tmp/nomad-management-token.txt

# 输出信息
echo ""
echo "=== 配置完成 ==="
echo "UI 地址:       http://localhost:4646/ui"
echo "管理令牌:      $SECRET_ID"
echo "令牌文件:      /tmp/nomad-management-token.txt"
echo "停止命令:      kill $NOMAD_PID"
echo ""
echo "=== 快速访问链接 ==="
echo "管理面板:      http://localhost:4646/ui/administration"
echo "策略管理:      http://localhost:4646/ui/administration/policies"
echo "令牌管理:      http://localhost:4646/ui/administration/tokens"
```

**使用方法**：
```bash
chmod +x start-nomad-dev.sh
./start-nomad-dev.sh
```

### 11.4 Dev 模式常见问题

#### 问题 1：启动时提示端口被占用

**错误信息**：
```
Error starting agent: listen tcp 0.0.0.0:4646: bind: address already in use
```

**解决方案**：
```bash
# 查找占用进程
lsof -i :4646  # Linux/macOS
netstat -ano | findstr :4646  # Windows

# 杀死进程
kill -9 <PID>  # Linux/macOS
taskkill /F /PID <PID>  # Windows
```

#### 问题 2：Bootstrap 失败

**错误信息**：
```
Error bootstrapping ACLs: Unexpected response code: 500 (ACL bootstrap already done)
```

**解决方案**：
```bash
# 获取已存在的 token
nomad acl token self -format=json | jq -r '.SecretID'
```

#### 问题 3：UI 显示 "Token not found"

**原因**：Token 过期或未正确配置

**解决方案**：
```bash
# 1. 重新获取 token
nomad acl token self -format=json | jq -r '.SecretID'

# 2. 在 UI 中重新配置
# Settings → Tokens → 粘贴新的 Secret ID → Save Token
```

#### 问题 4：Administration 菜单不显示

**原因**：
- Token 不是 management 类型
- ACL 未正确启用

**验证**：
```bash
# 检查 token 类型
nomad acl token self -format=json | jq -r '.Type'
# 输出应为 "management"

# 检查 ACL 状态
nomad acl info
```

### 11.5 Dev 模式 vs 生产模式对比

| 对比项 | Dev 模式 | 生产模式 |
|-------|---------|---------|
| **节点数量** | 1（单节点） | 3+（高可用集群） |
| **数据持久化** | 内存（重启丢失） | 磁盘（持久化） |
| **ACL 启用** | 需要 `-acl-enabled` | 配置文件 `acl.enabled = true` |
| **Bootstrap** | 每次重启需重新执行 | 仅首次执行一次 |
| **网络绑定** | 0.0.0.0（开放） | 内网 IP（安全） |
| **适用场景** | 开发、测试 | 生产环境 |

### 11.6 清理与重置

**停止 Nomad**：
```bash
# 方式 1：使用进程 ID
kill $NOMAD_PID

# 方式 2：使用 pkill
pkill nomad
```

**完全重置**：
```bash
# 停止进程
pkill nomad 2>/dev/null || true

# 清理所有状态
rm -rf /tmp/nomad*
rm -rf ~/.nomad 2>/dev/null || true

# 清理浏览器存储（可选）
# 在浏览器中清除 localStorage（nomadTokenSecret）
```

### 11.7 关键配置参数

| 参数 | 说明 | 默认值 |
|-----|------|-------|
| `-dev` | 启用开发模式 | false |
| `-acl-enabled` | 启用 ACL 系统 | false |
| `-bind` | 绑定地址 | 127.0.0.1 |
| `-data-dir` | 数据目录 | /tmp/nomad-xxx |
| `-log-level` | 日志级别 | INFO |

### 11.8 总结

在 `nomad agent -dev` 模式下启用 administration 路由的核心步骤：

```
1. 启动: nomad agent -dev -acl-enabled
           ↓
2. 获取: nomad acl bootstrap → 复制 Secret ID
           ↓
3. 配置: UI → Settings → Tokens → 粘贴并保存
           ↓
4. 访问: UI → Administration 菜单
```

**关键要点**：
- ✅ 必须使用 `-acl-enabled` 标志
- ✅ 必须使用 **management** 类型的 token
- ❌ 禁用 ACL 无法访问 administration 路由
- ⚠️ Dev 模式数据不持久化，重启需重新配置
