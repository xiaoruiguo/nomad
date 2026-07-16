# Nomad Agent Server 启动执行流程分析

> 命令：`/usr/local/bin/nomad agent -config=etc/nomad.d/nomad.server.hcl`
> 配置文件：[etc/nomad.d/nomad.server.hcl](file:///d:/claude/nomad/etc/nomad.d/nomad.server.hcl)（仅启用 server 模式，bootstrap_expect=1，启用 ACL，启用 UI）
> 分析基线：当前仓库代码（Windows 平台路径，Linux 运行路径语义一致）

---

## 0. 配置文件解析

### 0.1 配置文件内容（[etc/nomad.d/nomad.server.hcl](file:///d:/claude/nomad/etc/nomad.d/nomad.server.hcl)）

| 行号 | HCL 语句 | 用途说明 |
|------|---------|---------|
| L2 | `data_dir = "/opt/nomad/data"` | 数据目录路径，存放 Raft 日志、状态快照、节点 ID 等 |
| L3 | `bind_addr = "0.0.0.0"` | 绑定地址，监听所有网卡 |
| L5-L8 | `server { ... }` | Server 配置块 |
| L6 | `enabled = true` | 启用 Server 模式（关键开关，决定后续 `setupServer` 执行） |
| L7 | `bootstrap_expect = 1` | 期望引导节点数为 1（单节点集群，Raft 自举条件） |
| L10-L14 | `addresses { ... }` | 各服务监听地址（http/rpc/serf 均为 0.0.0.0） |
| L16-L20 | `advertise { ... }` | 对外通告地址（http/rpc/serf 均为 x.x.x.x，供 Client 和其他 Server 连接） |
| L22-L24 | `acl { enabled = true }` | 启用 ACL 访问控制 |
| L25-L26 | `ui { enabled = true }` | 启用内置 Web UI |

> **注意**：当前配置未设置 `client { enabled = true }`，因此 `setupClient` 会直接返回，Agent 仅以 Server 模式运行。

---

## 1. 程序入口（[main.go](file:///d:/claude/nomad/main.go)）

### 1.1 包初始化：侧载子进程插件（[main.go L6-L29](file:///d:/claude/nomad/main.go#L6-L29)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L19 | `_ "github.com/hashicorp/nomad/client/allocrunner/taskrunner/getter"` | 空导入：getter 子进程的 `init()` 检测 `os.Args` 并直接进入其逻辑，避免主进程加载多余代码占用内存 |
| L20 | `_ "github.com/hashicorp/nomad/client/allocrunner/taskrunner/template/renderer"` | 空导入：consul-template 渲染器子进程入口 |
| L21 | `_ "github.com/hashicorp/nomad/client/logmon"` | 空导入：日志监控子进程入口 |
| L22 | `_ "github.com/hashicorp/nomad/drivers/docker/docklog"` | 空导入：Docker 日志收集子进程入口 |
| L23 | `_ "github.com/hashicorp/nomad/drivers/shared/executor"` | 空导入：通用执行器子进程入口 |
| L26 | `"github.com/hashicorp/cli"` | 导入 HashiCorp CLI 框架 |
| L27 | `"github.com/hashicorp/nomad/command"` | 导入 Nomad 命令注册包 |
| L28 | `"github.com/hashicorp/nomad/version"` | 导入版本信息包 |

### 1.2 全局变量（[main.go L31-L79](file:///d:/claude/nomad/main.go#L31-L79)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L36-L56 | `hidden = []string{...}` | 隐藏命令列表（不在 help 显示） |
| L60-L67 | `aliases = []string{...}` | 命令别名列表（help 隐藏但 autocomplete 显示） |
| L70-L78 | `commonCommands = []string{...}` | 常用命令分组（含 `agent`） |

### 1.3 `main()` 函数（[main.go L81-L83](file:///d:/claude/nomad/main.go#L81-L83)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L82 | `os.Exit(Run(os.Args[1:]))` | 调用 `Run` 执行 CLI，传入参数 `["agent", "-config=etc/nomad.d/nomad.server.hcl"]` |

### 1.4 `Run()` 函数（[main.go L86-L119](file:///d:/claude/nomad/main.go#L86-L119)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L87 | `metaPtr := new(command.Meta)` | 创建命令元数据指针 |
| L88 | `metaPtr.SetupUi(args)` | 初始化 UI |
| L91-L95 | `agentUi := &cli.BasicUi{...}` | 创建 Agent 专用 UI（不输出颜色） |
| L97 | `commands := command.Commands(metaPtr, agentUi)` | 注册所有子命令（含 `agent`） |
| L98-L110 | `cli := &cli.CLI{...}` | 创建 CLI 运行时 |
| L112 | `exitCode, err := cli.Run()` | **关键调用**：CLI 框架匹配 `agent` 命令并执行其 `Run` 方法 |
| L118 | `return exitCode` | 返回退出码 |

### 1.5 `groupedHelpFunc()` 与 `printCommand()`（[main.go L122-L177](file:///d:/claude/nomad/main.go#L122-L177)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L123-L167 | `return func(commands map[string]cli.CommandFactory) string { ... }` | 分组 help 输出（common/other） |
| L176 | `fmt.Fprintf(w, "    %s\t%s\n", name, cmd.Synopsis())` | 输出命令名和简介 |

---

## 2. 命令注册（[command/commands.go](file:///d:/claude/nomad/command/commands.go)）

### 2.1 `Commands()` 函数（[command/commands.go L68-L1428](file:///d:/claude/nomad/command/commands.go#L68)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L68 | `func Commands(metaPtr *Meta, agentUi cli.Ui) map[string]cli.CommandFactory {` | 函数签名 |
| L82 | `all := map[string]cli.CommandFactory{...}` | 开始命令字典字面量 |

### 2.2 `agent` 命令注册（[command/commands.go L308-L314](file:///d:/claude/nomad/command/commands.go#L308-L314)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L308 | `"agent": func() (cli.Command, error) {` | 注册 `agent` 命令工厂 |
| L309-L313 | `return &agent.Command{ Version: version.GetVersion(), Ui: agentUi, ShutdownCh: make(chan struct{}) }, nil` | 实例化 [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) 中的 `Command` 结构体 |
| L314 | `},` | 工厂函数结束 |

---

## 3. Agent 命令入口（[command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go)）

### 3.1 `Command` 结构体定义（[command/agent/command.go L49-L62](file:///d:/claude/nomad/command/agent/command.go#L49-L62)）

| 行号 | 字段 | 用途说明 |
|------|------|---------|
| L50 | `Version *version.VersionInfo` | 版本信息 |
| L51 | `Ui cli.Ui` | UI 输出接口 |
| L52 | `ShutdownCh <-chan struct{}` | 关闭信号只读通道 |
| L55 | `agent *Agent` | Agent 实例 |
| L56 | `httpServers []*HTTPServer` | HTTP 服务器列表 |

### 3.2 `readConfig()` 方法（[command/agent/command.go L64-L340](file:///d:/claude/nomad/command/agent/command.go#L64)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L64 | `func (c *Command) readConfig() *Config {` | 配置读取入口 |
| L70-L82 | `cmdConfig := &Config{...}` | 创建空的命令行配置对象 |
| **L128** | `flags.Var((*flaghelper.StringFlag)(&configPath), "config", "config")` | **关键**：注册 `-config` flag |
| L270-L289 | `for _, path := range configPath { current, err := LoadConfig(path); ...; config = config.Merge(current) }` | **关键**：遍历 `-config` 路径，加载并合并 |
| L271 | `current, err := LoadConfig(path)` | 加载 `etc/nomad.d/nomad.server.hcl`（详见第 4 节） |
| L287 | `config = config.Merge(current)` | HCL 配置合并到默认配置 |
| L301 | `config = config.Merge(cmdConfig)` | CLI 选项最后合并（优先级最高） |
| L307 | `if err := config.normalizeAddrs(); err != nil { ... }` | 规范化 bind/advertise/addresses |
| L335 | `if !c.IsValidConfig(config, cmdConfig) { return nil }` | 校验配置合法性 |

### 3.3 `Run()` 方法（[command/agent/command.go L817-L963](file:///d:/claude/nomad/command/agent/command.go#L817)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L817 | `func (c *Command) Run(args []string) int {` | Agent 命令主入口 |
| L818-L823 | `c.Ui = &cli.PrefixedUi{...}` | 包装 UI 添加前缀 |
| L826 | `c.args = args` | 保存参数 |
| **L827** | `config := c.readConfig()` | **关键调用**：读取并合并配置（详见 3.2 节） |
| L833-L839 | `if config.LogJson { c.Ui = &cli.BasicUi{...} }` | JSON 日志模式重置 UI |
| **L842** | `logGate, logOutput := SetupLoggers(c.Ui, config)` | **关键调用**：设置日志输出 |
| L848-L854 | `logger := hclog.NewInterceptLogger(&hclog.LoggerOptions{...})` | 创建名为 "agent" 的 InterceptLogger |
| L858-L863 | `log.SetOutput(...)` | 将标准库 `log` 包输出重定向到 hclog |
| L873-L877 | `if len(config.Files) > 0 { c.Ui.Output("Loaded configuration from ...") }` | 输出已加载的配置文件路径 |
| **L880** | `inmem, err := c.setupTelemetry(config)` | **关键调用**：初始化遥测 |
| **L887** | `if err := c.setupAgent(config, logger, logOutput, inmem); err != nil { ... return 1 }` | **关键调用**：创建 Agent（详见第 5 节） |
| L892-L902 | `defer func() { c.agent.Shutdown(); ... }` | 注册 defer：函数退出时关闭 Agent 和 HTTP 服务器 |
| **L905** | `if err := c.startupJoin(config); err != nil { ... return 1 }` | **关键调用**：执行 `start_join`（当前配置无 `start_join`，空操作） |
| L911-L924 | `info := make(map[string]string); info["server"]=...` | 收集 Agent 信息（版本、server 模式、region、bind/advertise 地址、node id） |
| L935-L943 | `c.Ui.Output("Nomad agent configuration:\n"); for _, k := range infoKeys { ... }` | 输出 Agent 配置摘要表 |
| L946 | `c.Ui.Output("Nomad agent started! Log data will stream in below:\n")` | 输出启动完成提示 |
| L949 | `logGate.Flush()` | 刷新日志门控 |
| **L952** | `if err := c.handleRetryJoin(config); err != nil { ... return 1 }` | **关键调用**：启动 retry join（当前配置无 `retry_join`，空操作） |
| L958 | `winsvc.SendEvent(winsvc.NewEvent(winsvc.EventServiceReady))` | Windows 服务就绪事件 |
| **L962** | `return c.handleSignals()` | **关键调用**：阻塞等待信号（详见第 8 节） |

### 3.4 `setupAgent()` 方法（[command/agent/command.go L669-L719](file:///d:/claude/nomad/command/agent/command.go#L669)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L669 | `func (c *Command) setupAgent(config *Config, logger hclog.InterceptLogger, logOutput io.Writer, inmem *metrics.InmemSink) error {` | 创建 Agent 的封装方法 |
| L670 | `c.Ui.Output("Starting Nomad agent...")` | 输出启动提示 |
| **L672** | `agent, err := NewAgent(config, logger, logOutput, inmem)` | **关键调用**：创建 Agent 实例（详见第 5 节） |
| L679 | `c.agent = agent` | 保存 Agent 引用 |
| L682 | `c.agent.configReloader = c.handleReload` | 设置配置热重载回调 |
| **L685** | `httpServers, err := NewHTTPServers(agent, config)` | **关键调用**：创建 HTTP API 服务器（监听 `addresses.http = 0.0.0.0`，提供 REST API 和 UI） |
| L691 | `c.httpServers = httpServers` | 保存 HTTP 服务器引用 |
| L695-L716 | `if config.DisableUpdateCheck != nil && !*config.DisableUpdateCheck { ... }` | 未禁用更新检查时，调度 24 小时间隔的 checkpoint 检查 |

---

## 4. 配置文件加载（[command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) 和 [command/agent/config_parse.go](file:///d:/claude/nomad/command/agent/config_parse.go)）

### 4.1 `LoadConfig()` 函数（[command/agent/config.go L3242-L3260](file:///d:/claude/nomad/command/agent/config.go#L3242)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L3242 | `func LoadConfig(path string) (*Config, error) {` | 配置加载入口 |
| L3243 | `fi, err := os.Stat(path)` | 获取路径信息 |
| L3248-L3250 | `if fi.IsDir() { return LoadConfigDir(path) }` | 目录则委托 `LoadConfigDir` |
| L3252 | `cleaned := filepath.Clean(path)` | 清理路径 |
| **L3253** | `config, err := ParseConfigFile(cleaned)` | **关键调用**：解析单个 HCL 文件 |
| L3258 | `config.Files = append(config.Files, cleaned)` | 记录已加载文件路径 |
| L3259 | `return config, nil` | 返回解析后的配置 |

### 4.2 `ParseConfigFile()` 函数（[command/agent/config_parse.go L27-L280](file:///d:/claude/nomad/command/agent/config_parse.go#L27)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L30-L43 | `var buf bytes.Buffer; f, err := os.Open(path); io.Copy(&buf, f)` | 读取文件全部内容 |
| L46-L70 | `c := &Config{ Client: &ClientConfig{...}, Server: &ServerConfig{...}, ... }` | 创建空 Config 对象 |
| **L72** | `err = hcl.Decode(c, buf.String())` | **关键调用**：HCL 解码（`data_dir`、`bind_addr`、`server{enabled=true, bootstrap_expect=1}`、`addresses{}`、`advertise{}`、`acl{enabled=true}`、`ui{enabled=true}` 被填充） |
| L79 | `root, err := hcl.Parse(buf.String())` | 二次解析 HCL 为 AST（用于手动提取 `vault`/`consul`/`keyring` 块） |
| L83-L104 | `list := root.Node.(*ast.ObjectList); list.Filter("vault"/"consul"/"keyring"); parseVaults/parseConsuls/parseKeyringConfigs` | 手动解析多块定义（当前配置无这些块） |
| L265 | `convertDurations(tds)` | 执行时长字段转换 |
| L271 | `extraKeys(c)` | 报告未识别的 HCL 键 |
| L277 | `finalizeClientTemplateConfig(c)` | 清理零值模板配置 |

### 4.3 配置合并 `(*Config) Merge()`（[command/agent/config.go L1961 起](file:///d:/claude/nomad/command/agent/config.go#L1961)）

合并顺序：
1. `DefaultConfig()`（L260）→ 默认值
2. `DefaultEntConfig()`（L264）→ 企业版叠加
3. `LoadConfig(path)` 返回的 HCL 配置（L287）→ 文件配置
4. `cmdConfig`（L301）→ CLI 参数（优先级最高）

---

## 5. Agent 创建（[command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go)）

### 5.1 `NewAgent()` 函数（[command/agent/agent.go L150-L195](file:///d:/claude/nomad/command/agent/agent.go#L150)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L150 | `func NewAgent(config *Config, logger log.InterceptLogger, logOutput io.Writer, inmem *metrics.InmemSink) (*Agent, error) {` | Agent 构造函数 |
| L151-L156 | `a := &Agent{ config: config, ... }` | 创建 Agent 实例 |
| L159 | `a.logger = logger` | 保存 logger |
| L160 | `a.httpLogger = a.logger.ResetNamed("http")` | 创建 HTTP 专用 logger |
| **L165** | `if err := a.setupConsuls(config.Consuls); err != nil { ... }` | **关键调用**：初始化 Consul 客户端 |
| **L169** | `if err := a.setupServer(); err != nil { return nil, err }` | **关键调用**：创建 Server（详见 5.2，当前配置 `server.enabled=true` 完整执行） |
| **L172** | `if err := a.setupClient(); err != nil { return nil, err }` | **关键调用**：创建 Client（详见 5.3，当前配置未启用 client，直接返回） |
| **L176** | `if err := a.setupEnterpriseAgent(logger); err != nil { ... }` | 企业版扩展初始化（CE 版为空操作） |
| L179-L181 | `if a.client == nil && a.server == nil { return nil, fmt.Errorf("must have at least client or server mode enabled") }` | 校验：至少启用一个（当前配置 server 启用，通过） |
| L185-L192 | `if !a.config.TLSConfig.IsEmpty() { ... }` | TLS metrics（当前配置无 TLS，跳过） |
| L194 | `return a, nil` | 返回 Agent |

### 5.2 `setupServer()` 方法（[command/agent/agent.go L1175-L1354](file:///d:/claude/nomad/command/agent/agent.go#L1175)）

> **当前配置 `server.enabled = true`，此方法完整执行。**

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1175 | `func (a *Agent) setupServer() error {` | Server 创建入口 |
| **L1176-L1178** | `if !a.config.Server.Enabled { return nil }` | 检查开关（当前配置为 true，继续执行） |
| **L1181** | `conf, err := a.serverConfig()` | **关键调用**：构造 `nomad.Config`（转换 agent.Config 为 server 配置：Region、Datacenter、NodeID、BootstrapExpect=1、ACL 配置等） |
| **L1188** | `if err := a.setupNodeID(conf); err != nil { ... }` | **关键调用**：生成或读取节点 ID（详见 5.4） |
| **L1193** | `if err := a.setupKeyrings(conf); err != nil { ... }` | **关键调用**：设置 gossip 加密密钥环（当前配置未设 `encrypt`，加载现有 keyring 或跳过） |
| **L1198-L1201** | `server, err := nomad.NewServer(conf, a.consulCatalog, a.consulConfigEntriesFunc)` | **关键调用**：创建 Server 实例（详见第 6 节） |
| L1202-L1204 | `if err != nil { return fmt.Errorf("server setup failed: %v", err) }` | 错误处理 |
| **L1205** | `a.server = server` | 保存 Server 引用 |
| L1207-L1216 | `rpcCheckAddr := ...; serfCheckAddr := ...; if *defaultConsul.ChecksUseAdvertise { ... }` | 确定 Consul 健康检查地址（默认 bind，可切换 advertise） |
| L1218-L1267 | `if *defaultConsul.AutoAdvertise { ... a.consulServices.RegisterAgent(consulRoleServer, ...) }` | 若启用 Consul 自动通告，注册 Server 的 HTTP/RPC/Serf 服务（当前配置未显式启用 Consul auto-advertise） |
| L1269 | `return nil` | 返回成功 |

### 5.3 `setupClient()` 方法（[command/agent/agent.go L1356-L1425](file:///d:/claude/nomad/command/agent/agent.go#L1356)）

> **当前配置未设置 `client.enabled`（默认 false），此方法直接返回。**

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1356 | `func (a *Agent) setupClient() error {` | Client 创建入口 |
| **L1357-L1359** | `if !a.config.Client.Enabled { return nil }` | **关键短路**：配置未启用 client，直接返回 nil（当前配置走此分支） |

### 5.4 `setupNodeID()` 方法（[command/agent/agent.go L1274-L1329](file:///d:/claude/nomad/command/agent/agent.go#L1274)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1274 | `func (a *Agent) setupNodeID(config *nomad.Config) error {` | 节点 ID 设置入口 |
| L1276-L1279 | `if a.config.DevMode { config.NodeID = uuid.Generate(); return nil }` | dev 模式直接生成（当前配置非 dev，跳过） |
| L1283 | `fileID := filepath.Join(config.DataDir, "node-id")` | 节点 ID 文件路径：`/opt/nomad/data/node-id` |
| L1284-L1297 | `if _, err := os.Stat(fileID); err == nil { rawID, err := os.ReadFile(fileID); ...; config.NodeID = nodeID }` | **首次启动跳过此分支**；重启时从文件读取已持久化的节点 ID |
| L1301-L1314 | `if config.NodeID != "" { ... os.WriteFile(fileID, []byte(config.NodeID), 0600) }` | 若配置了 NodeID，持久化到文件 |
| **L1317-L1327** | `if config.NodeID == "" { id := uuid.Generate(); ...; os.WriteFile(fileID, []byte(id), 0600); config.NodeID = id }` | **首次启动走此分支**：生成随机 UUID 并持久化到 `/opt/nomad/data/node-id` |

### 5.5 `setupKeyrings()` 方法（[command/agent/agent.go L1332-L1353](file:///d:/claude/nomad/command/agent/agent.go#L1332)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1332 | `func (a *Agent) setupKeyrings(config *nomad.Config) error {` | 密钥环设置入口 |
| L1333 | `file := filepath.Join(a.config.DataDir, serfKeyring)` | 密钥环文件路径：`/opt/nomad/data/serf.keyring` |
| L1335-L1337 | `if a.config.Server.EncryptKey == "" { goto LOAD }` | **当前配置未设 `encrypt`，跳过初始化，直接到 LOAD** |
| L1344-L1350 | `LOAD: if _, err := os.Stat(file); err == nil { config.SerfConfig.KeyringFile = file }; if err := loadKeyringFile(config.SerfConfig); err != nil { return err }` | 若密钥环文件存在则加载（首次启动文件不存在，跳过） |

---

## 6. Server 创建（[nomad/server.go](file:///d:/claude/nomad/nomad/server.go)）

### 6.1 `NewServer()` 函数（[nomad/server.go L336-L586](file:///d:/claude/nomad/nomad/server.go#L336)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L336 | `func NewServer(config *Config, consulCatalog consul.CatalogAPI, consulConfigFunc consul.ConfigAPIFunc) (*Server, error) {` | Server 构造函数 |
| L338-L340 | `if config.RaftBoltNoFreelistSync { return nil, fmt.Errorf(...) }` | 校验已弃用字段 |
| L343-L350 | `tlsConf, err := tlsutil.NewTLSConfiguration(config.TLSConfig, true, true); incomingTLS, tlsWrap, err := getTLSConf(...)` | 配置 TLS（当前配置无 TLS，返回空配置） |
| L353 | `logger := config.Logger.ResetNamedIntercept("nomad")` | 创建名为 "nomad" 的 logger |
| L356-L358 | `if err = config.LicenseConfig.Validate(); err != nil { return nil, err }` | 校验企业版许可证 |
| **L361-L381** | `s := &Server{ config: config, consulCatalog: consulCatalog, connPool: pool.NewPool(...), rpcServer: rpc.NewServer(), streamingRpcs: ..., peersCache: peers.NewPeerCache(config.Region), bootstrapped: &atomic.Bool{}, ... }` | **关键**：创建 Server 实例，初始化连接池、RPC 服务器、流式 RPC 注册表、对等节点缓存、Raft 选举相关通道 |
| L383-L384 | `s.shutdownCtx, s.shutdownCancel = context.WithCancel(context.Background()); s.shutdownCh = s.shutdownCtx.Done()` | 创建关闭上下文和通道 |
| L388-L389 | `startupTimeout, startupCancel := context.WithTimeout(s.shutdownCtx, s.config.StartTimeout); defer startupCancel()` | 创建启动超时上下文 |
| **L392-L400** | `evalBroker, err := NewEvalBroker(s.shutdownCtx, config.EvalNackTimeout, ...); s.evalBroker = evalBroker` | **关键调用**：创建评估代理器（管理待处理评估队列） |
| **L404** | `s.blockedEvals = NewBlockedEvals(s.evalBroker, s.logger)` | **关键调用**：创建阻塞评估管理器（跟踪因资源不足无法调度的评估） |
| **L407** | `s.rpcHandler = newRpcHandler(s)` | **关键调用**：创建 RPC 处理器 |
| **L410-L414** | `planner, err := newPlanner(s); s.planner = planner` | **关键调用**：创建计划器（调度器提交分配方案的通道） |
| **L417** | `s.nodeHeartbeater = newNodeHeartbeater(s)` | **关键调用**：创建节点心跳跟踪器（跟踪 Client 节点存活状态） |
| **L420** | `s.periodicDispatcher = NewPeriodicDispatch(s.logger, s)` | **关键调用**：创建周期性调度器（处理周期性作业） |
| **L423-L424** | `s.statsFetcher = NewStatsFetcher(s.logger, s.connPool, s.config.Region); s.statsFetcher.SetLocalServer(s)` | **关键调用**：创建状态获取器（autopilot 用于获取集群统计） |
| L427 | `s.consulConfigEntries = NewConsulConfigsAPI(consulConfigFunc, s.logger)` | 创建 Consul 配置条目 API |
| **L430-L441** | `keystorePath := filepath.Join(s.config.DataDir, "keystore"); encrypter, err := NewEncrypter(s, keystorePath); s.encrypter = encrypter` | **关键调用**：创建加密器（管理根密钥，用于加密 ACL 令牌、变量等敏感数据） |
| L445-L454 | `if iss := config.OIDCIssuer; iss != "" { ... } else { ... }` | OIDC 发现配置（当前配置未设，输出 debug 日志） |
| L459 | `s.oidcProviderCache = oidc.NewProviderCache()` | 创建 OIDC 提供者缓存 |
| L466 | `s.oidcRequestCache = oidc.NewRequestCache(6 * time.Minute)` | 创建 OIDC 请求缓存 |
| **L469-L473** | `if err := s.setupRPC(tlsWrap); err != nil { s.Shutdown(); ... }` | **关键调用**：初始化 RPC 层（详见 6.2） |
| **L475-L483** | `s.auth = auth.NewAuthenticator(&auth.AuthenticatorConfig{ StateFn: s.State, AclsEnabled: s.config.ACLEnabled, ... })` | **关键调用**：创建认证器（当前配置 `acl.enabled=true`，ACL 启用） |
| **L486-L490** | `if err := s.setupRaft(); err != nil { s.Shutdown(); ... }` | **关键调用**：初始化 Raft 共识（详见 6.3） |
| **L493-L498** | `s.serf, err = s.setupSerf(config.SerfConfig, s.eventCh, serfSnapshot); if err != nil { s.Shutdown(); ... }` | **关键调用**：初始化 Serf（WAN gossip，用于集群成员管理和故障检测，详见 6.4） |
| **L501-L505** | `if err := s.setupWorkers(s.shutdownCtx); err != nil { s.Shutdown(); ... }` | **关键调用**：初始化调度 Worker（详见 6.5） |
| **L508-L511** | `if err := s.setupConsulSyncer(); err != nil { ... }` | **关键调用**：创建 Consul 同步器（若启用 `server_auto_join`，处理 bootstrap） |
| **L514-L517** | `if err := s.setupDeploymentWatcher(); err != nil { ... }` | **关键调用**：创建部署监视器（监控部署状态变化） |
| **L520-L523** | `if err := s.setupVolumeWatcher(); err != nil { ... }` | **关键调用**：创建卷监视器（处理 CSI 卷操作） |
| L524 | `s.volumeControllerFutures = map[string]context.Context{}` | 初始化卷控制器 futures 映射 |
| L528 | `go s.evalBroker.enabledNotifier.Run()` | 启动评估代理器启用通知器 goroutine |
| **L531** | `s.setupNodeDrainer()` | **关键调用**：创建节点排空器（详见 6.6） |
| **L534-L536** | `if err := s.setupEnterprise(config); err != nil { return nil, err }` | **关键调用**：设置企业版状态（CE 版创建 autopilot，详见 6.7） |
| **L539** | `go s.monitorLeadership()` | **关键调用**：启动领导权监控 goroutine（详见第 7 节） |
| **L542** | `go s.serfEventHandler()` | **关键调用**：启动 Serf 事件处理 goroutine（详见 6.8） |
| **L545** | `s.startRPCListener()` | **关键调用**：启动 RPC 监听器（详见 6.9） |
| L548 | `go evalBroker.EmitStats(time.Second, s.shutdownCh)` | 启动评估代理器 metrics 上报 goroutine |
| L551 | `go s.planQueue.EmitStats(time.Second, s.shutdownCh)` | 启动计划队列 metrics 上报 goroutine |
| L554 | `go s.planner.badNodeTracker.EmitStats(time.Second, s.shutdownCh)` | 启动坏节点跟踪器 metrics goroutine |
| L557 | `go s.blockedEvals.EmitStats(time.Second, s.shutdownCh)` | 启动阻塞评估 metrics goroutine |
| **L560** | `go s.heartbeatStats()` | 启动心跳统计 metrics goroutine（[nomad/heartbeat.go L256](file:///d:/claude/nomad/nomad/heartbeat.go#L256)） |
| **L563** | `go s.EmitRaftStats(10*time.Second, s.shutdownCh)` | 启动 Raft 状态 metrics goroutine（[nomad/server.go L2202](file:///d:/claude/nomad/nomad/server.go#L2202)） |
| **L566** | `s.startEnterpriseBackground()` | 企业版后台任务（CE 版空操作，[nomad/server_setup_ce.go L37](file:///d:/claude/nomad/nomad/server_setup_ce.go#L37)） |
| **L571** | `s.keyringReplicator = NewKeyringReplicator(s, encrypter)` | 创建密钥环复制器（跨区域复制根密钥） |
| **L579-L582** | `if err := s.encrypter.IsReady(startupTimeout); err != nil { _ = s.Shutdown(); return nil, fmt.Errorf(...) }` | **关键**：等待密钥环就绪（阻塞，超时则关闭 Server 并返回错误） |
| L585 | `return s, nil` | 返回 Server |

### 6.2 `setupRPC()` 方法（[nomad/server.go L1203-L1264](file:///d:/claude/nomad/nomad/server.go#L1203)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1203 | `func (s *Server) setupRPC(tlsWrap tlsutil.RegionWrapper) error {` | RPC 层初始化入口 |
| **L1205** | `s.setupRpcServer(s.rpcServer, nil)` | **关键调用**：注册静态 RPC 端点（Node/Job/Alloc/Eval/System/Deployments/ACL 等，详见 [server.go L1296](file:///d:/claude/nomad/nomad/server.go#L1296)） |
| **L1208** | `s.setupStreamingEndpoints(s.rpcServer)` | **关键调用**：注册流式 RPC 端点（Alloc/FileSystem/Agent/Event/Operator，详见 [server.go L1268](file:///d:/claude/nomad/nomad/server.go#L1268)） |
| **L1210** | `listener, err := s.createRPCListener()` | **关键调用**：创建 TCP 监听器（监听 `addresses.rpc = 0.0.0.0`） |
| L1216-L1220 | `if s.config.ClientRPCAdvertise != nil { ... } else { s.clientRpcAdvertise = s.rpcListener.Addr() }` | 设置 Client RPC 通告地址 |
| L1222-L1231 | 校验 Client RPC 通告地址可用性 | 不能是 0.0.0.0（需为具体 IP） |
| L1233-L1249 | `if s.config.ServerRPCAdvertise != nil { ... } else { serfIP := ...; addr := net.JoinHostPort(serfIP, ...); s.serverRpcAdvertise = resolved }` | 设置 Server RPC 通告地址（默认从 Serf 通告地址派生） |
| L1251-L1259 | 校验 Server RPC 通告地址可用性 | 不能是 0.0.0.0 |
| **L1261-L1262** | `wrapper := tlsutil.RegionSpecificWrapper(s.config.Region, tlsWrap); s.raftLayer = NewRaftLayer(s.serverRpcAdvertise, wrapper)` | **关键**：创建 Raft 传输层（用于 Raft 节点间通信） |

### 6.3 `setupRaft()` 方法（[nomad/server.go L1345-L1601](file:///d:/claude/nomad/nomad/server.go#L1345)）

> **当前配置 `bootstrap_expect = 1`，会触发单节点集群自举。**

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1345 | `func (s *Server) setupRaft() error {` | Raft 初始化入口 |
| L1348-L1354 | `defer func() { if s.raft == nil && s.raftStore != nil { s.raftStore.Close() } }()` | defer：失败时关闭 Raft 存储 |
| **L1357-L1367** | `fsmConfig := &FSMConfig{ EvalBroker: s.evalBroker, Periodic: s.periodicDispatcher, Blocked: s.blockedEvals, Encrypter: s.encrypter, ... }` | 构造 FSM 配置 |
| **L1370** | `s.fsm, err = NewFSM(fsmConfig)` | **关键调用**：创建有限状态机（Raft 状态存储后端，包含 StateStore、EvalBroker 等） |
| L1376-L1389 | `logger := log.New{...}; netConfig := &raft.NetworkTransportConfig{ Stream: s.raftLayer, ... }; trans := raft.NewNetworkTransportWithConfig(netConfig); s.raftTransport = trans` | 创建 Raft 网络传输层（基于 `raftLayer`） |
| L1392-L1393 | `s.config.RaftConfig.Logger = s.logger.Named("raft"); s.config.RaftConfig.LogOutput = nil` | 设置 Raft logger |
| L1397-L1400 | `s.config.RaftConfig.LocalID = raft.ServerID(trans.LocalAddr()); if s.config.RaftConfig.ProtocolVersion >= 3 { s.config.RaftConfig.LocalID = raft.ServerID(s.config.NodeID) }` | 设置 Raft 本地节点 ID（协议 v3+ 使用 NodeID） |
| **L1407-L1412** | `if s.config.DevMode { store := raft.NewInmemStore(); ... } else { ... }` | dev 模式用内存存储，否则磁盘存储（当前配置非 dev，走 else） |
| **L1416-L1419** | `path := filepath.Join(s.config.DataDir, raftState); if err := ensurePath(path, true); err != nil { return err }` | 创建 Raft 数据目录：`/opt/nomad/data/raft/` |
| L1422-L1429 | 检查并更新 Raft 版本文件 | 记录当前 Raft 协议版本 |
| **L1432-L1487** | `backend := LogStoreBackendBoltDB; switch backend { case LogStoreBackendWAL: ...; case LogStoreBackendBoltDB: boltStore, boltErr := raftboltdb.New(raftboltdb.Options{ Path: filepath.Join(path, "raft.db"), ... }); store = boltStore; ... }` | **关键**：创建 Raft 日志存储后端（默认 BoltDB，文件 `/opt/nomad/data/raft/raft.db`） |
| L1489-L1499 | `s.raftStore = store; stable = store; if s.config.RaftLogStoreConfig.VerificationEnabled { s.startRaftLogVerifier() }` | 保存存储后端，可选启动日志验证器 |
| L1502-L1512 | `if disableLogCache { log = store } else { cacheStore, err := raft.NewLogCache(raftLogCacheSize, store); log = cacheStore }` | 包装日志缓存（提升性能） |
| **L1515-L1522** | `snapshots, err := raft.NewFileSnapshotStore(path, snapshotsRetained, s.config.LogOutput); snap = snapshots` | **关键**：创建快照存储（文件系统，`/opt/nomad/data/raft/`） |
| L1531-L1569 | peers.json 恢复逻辑 | 首次启动无 peers.json，跳过；存在则用于 Raft 配置恢复 |
| **L1574-L1593** | `if s.isSingleServerCluster() { hasState, err := raft.HasExistingState(log, stable, snap); if !hasState { configuration := raft.Configuration{ Servers: []raft.Server{{ ID: s.config.RaftConfig.LocalID, Address: trans.LocalAddr() }} }; raft.BootstrapCluster(s.config.RaftConfig, log, stable, snap, trans, configuration) } }` | **★ 关键：单节点自举**（当前配置 `bootstrap_expect=1`，`isSingleServerCluster` 返回 true）。若 Raft 无现有状态，则用当前节点配置引导集群 |
| **L1596-L1600** | `s.raft, err = raft.NewRaft(s.config.RaftConfig, s.fsm, log, stable, snap, trans)` | **关键调用**：创建 Raft 实例（启动 Raft 状态机，开始选举） |

### 6.4 `setupSerf()` 方法（[nomad/server.go L1738-L1791](file:///d:/claude/nomad/nomad/server.go#L1738)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1738 | `func (s *Server) setupSerf(conf *serf.Config, ch chan serf.Event, path string) (*serf.Serf, error) {` | Serf 初始化入口 |
| L1739 | `conf.Init()` | 初始化 Serf 配置 |
| L1740 | `conf.NodeName = fmt.Sprintf("%s.%s", s.config.NodeName, s.config.Region)` | 节点名：`{NodeName}.{Region}` |
| L1741-L1750 | `conf.Tags["role"] = "nomad"; conf.Tags["region"] = ...; conf.Tags["dc"] = ...; conf.Tags["build"] = ...; conf.Tags["port"] = ...; conf.Tags["rpc_addr"] = ...` | 设置 Serf 成员标签（供其他节点识别 Nomad Server、RPC 地址、端口等） |
| **L1751-L1753** | `if s.isSingleServerCluster() { conf.Tags["bootstrap"] = "1" }` | **当前配置走此分支**：单节点集群设置 bootstrap 标签 |
| L1754-L1757 | `bootstrapExpect := s.config.BootstrapExpect; if bootstrapExpect != 0 { conf.Tags["expect"] = fmt.Sprintf("%d", bootstrapExpect) }` | 设置期望节点数标签（当前配置为 "1"） |
| L1767-L1771 | `logger := ...; conf.MemberlistConfig.Logger = logger; conf.Logger = logger; conf.EventCh = ch` | 设置 logger 和事件通道 |
| **L1773-L1778** | `if !s.config.DevMode { conf.SnapshotPath = filepath.Join(s.config.DataDir, path); if err := ensurePath(conf.SnapshotPath, false); err != nil { return nil, err } }` | 设置 Serf 快照路径：`/opt/nomad/data/serf.snapshot` |
| L1783 | `conf.LeavePropagateDelay = 1 * time.Second` | 设置离开传播延迟 |
| L1784 | `conf.Merge = &serfMergeDelegate{}` | 设置合并委托 |
| L1789 | `conf.EnableNameConflictResolution = false` | 禁用自动名称冲突解决 |
| **L1790** | `return serf.Create(conf)` | **关键调用**：创建 Serf 实例（启动 gossip 协议，开始成员发现） |

### 6.5 `setupWorkers()` 方法（[nomad/server.go L1930-L1940](file:///d:/claude/nomad/nomad/server.go#L1930)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1930 | `func (s *Server) setupWorkers(ctx context.Context) error {` | Worker 初始化入口 |
| L1931 | `poolArgs := s.GetSchedulerWorkerConfig()` | 获取调度 Worker 池配置（NumSchedulers、EnabledSchedulers） |
| L1933 | `go s.listenWorkerEvents()` | 启动 Worker 事件监听 goroutine |
| L1936-L1937 | `s.workerLock.Lock(); defer s.workerLock.Unlock()` | 加锁保护 Worker 切片 |
| **L1939** | `return s.setupWorkersLocked(ctx, poolArgs)` | **关键调用**：实际创建 Worker（详见下文） |

#### `setupWorkersLocked()` 方法（[nomad/server.go L1944-L1981](file:///d:/claude/nomad/nomad/server.go#L1944)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1946-L1949 | `if len(poolArgs.EnabledSchedulers) == 0 || poolArgs.NumSchedulers == 0 { s.logger.Warn("no enabled schedulers"); return nil }` | 检查是否禁用所有调度器 |
| L1952-L1965 | 校验启用的调度器列表（必须包含 `core`，其他必须在内置列表中） | 默认启用 `service`/`batch`/`system`/`core` |
| L1970-L1978 | `for i := 0; i < s.config.NumSchedulers; i++ { w, err := NewWorker(ctx, s, poolArgs); s.workerShutdownGroup.AddCh(w.ShutdownCh()); s.workers = append(s.workers, w) }` | **关键**：创建 `NumSchedulers` 个 Worker（默认 2 个），每个 Worker 从 evalBroker 获取评估并调度 |

### 6.6 `setupNodeDrainer()` 方法（[nomad/server.go L1187-L1200](file:///d:/claude/nomad/nomad/server.go#L1187)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1187 | `func (s *Server) setupNodeDrainer() {` | 节点排空器初始化入口 |
| L1189 | `shim := drainerShim{s}` | 创建 Raft 请求 shim |
| L1190-L1198 | `c := &drainer.NodeDrainerConfig{ Logger: ..., Raft: shim, JobFactory: ..., NodeFactory: ..., DrainDeadlineFactory: ..., ... }` | 构造排空器配置 |
| L1199 | `s.nodeDrainer = drainer.NewNodeDrainer(c)` | 创建节点排空器（在成为领导者后启用） |

### 6.7 `setupEnterprise()` 方法（[nomad/server_setup_ce.go L22-L36](file:///d:/claude/nomad/nomad/server_setup_ce.go#L22)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L22 | `func (s *Server) setupEnterprise(config *Config) error {` | 企业版初始化入口（CE 版） |
| L24 | `apDelegate := &AutopilotDelegate{s}` | 创建 Autopilot 委托 |
| **L26-L33** | `s.autopilot = autopilot.New(s.raft, apDelegate, autopilot.WithLogger(s.logger), autopilot.WithReconcileInterval(config.AutopilotInterval), autopilot.WithUpdateInterval(config.ServerHealthInterval), autopilot.WithPromoter(s.autopilotPromoter()))` | **关键调用**：创建 Autopilot（自动集群管理：故障容忍度、领导者提升等） |
| L35 | `return nil` | 返回成功 |

### 6.8 `serfEventHandler()` 方法（[nomad/serf.go L34-L57](file:///d:/claude/nomad/nomad/serf.go#L34)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L34 | `func (s *Server) serfEventHandler() {` | Serf 事件处理入口（goroutine 内运行） |
| L35-L56 | `for { select { case e := <-s.eventCh: switch e.EventType() { ... } case <-s.shutdownCh: return } }` | 主循环：监听 Serf 事件和关闭信号 |
| L39-L42 | `case serf.EventMemberJoin: s.updatePeer(e); s.maybeBootstrap(); s.localMemberEvent(e)` | **成员加入**：更新对等节点缓存、尝试引导集群、处理本地成员事件 |
| L43-L44 | `case serf.EventMemberFailed, serf.EventMemberUpdate: s.updatePeer(e)` | **成员失败/更新**：更新对等节点缓存 |
| L45-L47 | `case serf.EventMemberLeave, serf.EventMemberReap: s.deletePeer(e); s.localMemberEvent(e)` | **成员离开/回收**：删除对等节点、处理本地成员事件 |

#### `maybeBootstrap()` 方法（[nomad/serf.go L88+](file:///d:/claude/nomad/nomad/serf.go#L88)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L90-L92 | `if s.config.BootstrapExpect == 0 || s.bootstrapped.Load() { return }` | 未配置 bootstrap 或已引导则返回 |
| L97-L109 | `index, err := s.raftStore.LastIndex()` | 获取 Raft 日志最后索引 |
| L113-L116 | `if index != 0 { s.bootstrapped.Store(true); return }` | 已有 Raft 日志则标记已引导 |
| L119-L142 | `members := s.serf.Members(); ...; for _, serfMem := range members { ... }` | 扫描 Serf 成员，统计符合条件的 Server |
| - | 达到 `BootstrapExpect` 数量后调用 `raft.BootstrapCluster` | **多节点集群引导**（当前配置 `bootstrap_expect=1`，已在 `setupRaft` 中通过单节点自举完成，此处直接返回） |

### 6.9 `startRPCListener()` 方法（[nomad/server.go L589-L593](file:///d:/claude/nomad/nomad/server.go#L589)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L589 | `func (s *Server) startRPCListener() {` | RPC 监听器启动入口 |
| L590-L591 | `ctx, cancel := context.WithCancel(context.Background()); s.rpcCancel = cancel` | 创建可取消上下文 |
| **L592** | `go s.listen(ctx)` | **关键调用**：启动监听 goroutine（接受 RPC 连接，分发给 `rpcServer`） |

---

## 7. 领导权选举与领导者职责（[nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go)）

### 7.1 `monitorLeadership()` 方法（[nomad/leader.go L111-L176](file:///d:/claude/nomad/nomad/leader.go#L111)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L111 | `func (s *Server) monitorLeadership() {` | 领导权监控入口（goroutine 内运行） |
| L115 | `leaderCh := s.raft.LeaderCh()` | 获取 Raft 领导权变更通知通道 |
| L117-L144 | `leaderStep := func(isLeader bool) { ... }` | 定义领导权切换函数：获得领导权时启动 `leaderLoop` goroutine，失去时关闭 |
| **L126-L129** | `go func(ch chan struct{}) { defer leaderLoop.Done(); s.leaderLoop(ch) }(weAreLeaderCh)` | **关键**：启动领导者循环 goroutine |
| L146-L175 | `for { select { case isLeader := <-leaderCh: ...; case <-s.shutdownCh: ... } }` | 主循环：监听领导权变更和关闭信号 |

> **当前配置 `bootstrap_expect=1`**：单节点集群中，Raft 选举超时后该节点自动成为领导者，`leaderCh` 发送 `true`，触发 `leaderLoop`。

### 7.2 `leaderLoop()` 方法（[nomad/leader.go L248-L370+](file:///d:/claude/nomad/nomad/leader.go#L248)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L248 | `func (s *Server) leaderLoop(stopCh chan struct{}) {` | 领导者循环入口 |
| L255 | `interval := time.After(s.config.ReconcileInterval)` | 设置协调定时器 |
| **L259-L263** | `barrier := s.raft.Barrier(barrierWriteTimeout); if err := barrier.Error(); err != nil { ... }` | **关键调用**：应用 Raft 屏障，确保 FSM 追上最新提交的日志 |
| **L267-L294** | `if !establishedLeader { if err := s.establishLeadership(stopCh); err != nil { ... } establishedLeader = true; defer func() { s.revokeLeadership() }() }` | **关键调用**：首次成为领导者时建立领导权（详见 7.3），注册 defer 在退出时撤销 |
| **L297-L300** | `if err := s.reconcile(); err != nil { ... }` | **关键调用**：协调缺失数据（重置阻塞评估、重新入队等） |
| L304 | `reconcileCh = s.reconcileCh` | 启用 Serf 事件触发的协调 |
| L315-L370 | `for { select { case <-stopCh: return; case <-s.shutdownCh: return; case <-interval: goto RECONCILE; case member := <-reconcileCh: s.reconcileMember(member); case errCh := <-s.reassertLeaderCh: ... } }` | 主等待循环：周期性协调、处理 Serf 成员变更、重新断言领导权 |

### 7.3 `establishLeadership()` 方法（[nomad/leader.go L378-L470+](file:///d:/claude/nomad/nomad/leader.go#L378)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L378 | `func (s *Server) establishLeadership(stopCh chan struct{}) error {` | 建立领导权入口 |
| **L383** | `s.setLeaderAcl(uuid.Generate())` | **关键**：生成领导者 ACL 令牌（用于领导者执行管理任务时的认证） |
| **L387** | `s.handlePausableWorkers(true)` | **关键**：暂停可暂停的 Worker（释放一半核心给计划队列和评估代理器） |
| **L390-L391** | `s.getOrCreateAutopilotConfig(); s.autopilot.Start(s.shutdownCtx)` | **关键**：初始化并启动 Autopilot（自动集群管理） |
| **L394** | `schedulerConfig := s.getOrCreateSchedulerConfig()` | **关键**：初始化调度器配置 |
| L397-L400 | `clusterMetadata, err := s.ClusterMetadata()` | 获取集群元数据 |
| **L403** | `s.planQueue.SetEnabled(true)` | **关键**：启用计划队列（调度器提交分配方案的通道） |
| **L406** | `go s.planApply()` | **关键调用**：启动计划应用 goroutine（处理调度器提交的计划，通过 Raft 提交分配变更） |
| **L410** | `restoreEvals := s.handleEvalBrokerStateChange(schedulerConfig)` | **关键**：处理评估代理器状态变更（根据配置决定是否恢复评估） |
| **L413** | `s.deploymentWatcher.SetEnabled(true, s.State())` | **关键**：启用部署监视器 |
| **L416** | `s.nodeDrainer.SetEnabled(true, s.State())` | **关键**：启用节点排空器 |
| **L419** | `s.volumeWatcher.SetEnabled(true, s.State(), s.getLeaderAcl())` | **关键**：启用卷监视器 |
| L423-L427 | `if restoreEvals { if err := s.restoreEvals(); err != nil { return err } }` | 恢复评估状态（从 FSM 状态机重置评估队列） |
| **L430** | `s.periodicDispatcher.SetEnabled(true)` | **关键**：启用周期性调度器 |
| **L435** | `s.setConsistentReadReady()` | **关键**：标记 Server 已就绪可接受一致性读请求 |
| **L440** | `go s.initializeKeyring(stopCh)` | **关键调用**：启动密钥环初始化 goroutine（创建第一个根密钥，若不存在） |
| L443-L445 | `if err := s.restorePeriodicDispatcher(); err != nil { return err }` | 恢复周期性调度器状态 |
| **L449** | `go s.schedulePeriodic(stopCh)` | **关键调用**：启动周期性任务调度 goroutine（包括过期 ACL 令牌垃圾回收） |
| **L452** | `go s.reapFailedEvaluations(stopCh)` | **关键调用**：启动失败评估回收 goroutine |

---

## 8. 信号处理与退出（[command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go)）

### 8.1 `handleSignals()` 方法（[command/agent/command.go L1090-L1159](file:///d:/claude/nomad/command/agent/command.go#L1090)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1090 | `func (c *Command) handleSignals() int {` | 信号处理主入口（阻塞运行） |
| L1091 | `signalCh := make(chan os.Signal, 4)` | 创建信号通道 |
| **L1094** | `signal.Notify(signalCh, syscall.SIGINT, syscall.SIGTERM, syscall.SIGHUP, syscall.SIGPIPE)` | **关键**：注册信号：SIGINT、SIGTERM、SIGHUP、SIGPIPE |
| L1105 | `sdNotify(sdSock, sdReady)` | 通知 systemd 服务就绪 |
| **L1107-L1158** | `for { select { ... } }` | **关键主循环**：阻塞等待信号 |
| **L1118-L1126** | `case syscall.SIGHUP: sdNotifyReloading(sdSock); err := c.handleReload(); ...; sdNotify(sdSock, sdReady)` | **SIGHUP 处理**：触发配置热重载（重新读取配置文件、重载 Agent/Server/HTTP） |
| **L1127-L1132** | `case syscall.SIGTERM: if !c.agent.GetConfig().LeaveOnTerm { return 1 }; return c.terminateGracefully(signalCh, sdSock)` | **SIGTERM 处理**：根据 `LeaveOnTerm` 决定是否优雅退出 |
| **L1133-L1138** | `case syscall.SIGINT: if !c.agent.GetConfig().LeaveOnInt { return 1 }; return c.terminateGracefully(signalCh, sdSock)` | **SIGINT 处理**（Ctrl+C）：根据 `LeaveOnInt` 决定 |
| L1141-L1146 | `case <-winsvc.ShutdownChannel(): ...` | Windows 服务停止信号 |
| L1148-L1153 | `case <-c.ShutdownCh: ...` | 内部关闭信号 |
| L1155-L1156 | `case <-c.retryJoinErrCh: return 1` | retry join 耗尽重试次数（当前配置无 retry_join，不会触发） |

### 8.2 `terminateGracefully()` 方法（[command/agent/command.go L1035-L1087](file:///d:/claude/nomad/command/agent/command.go#L1035)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1035 | `func (c *Command) terminateGracefully(signalCh chan os.Signal, sdSock io.Writer) int {` | 优雅退出入口 |
| L1036 | `sdNotify(sdSock, sdStopping)` | 通知 systemd 正在停止 |
| L1044-L1080 | `if c.agent.client != nil { ... c.agent.Leave() ... }` | Client 侧离开（当前配置无 client，跳过） |
| - | `if c.agent.server != nil { ... c.agent.server.Leave() ... }` | **Server 侧离开**：从 Raft 集群移除、Serf 离开、关闭 RPC、关闭 Raft、关闭 FSM |
| - | 最终调用 `c.agent.Shutdown()` | 关闭 Agent |

---

## 9. 完整调用链时序图

```
用户执行: nomad agent -config=etc/nomad.d/nomad.server.hcl
│
├─ main.go:82           os.Exit(Run(os.Args[1:]))
│   │
├─ main.go:86-119       Run(args)
│   ├─ L97              command.Commands(metaPtr, agentUi)          ← 注册 "agent" 命令
│   │   └─ commands.go:308-314  返回 &agent.Command{...}
│   └─ L112             cli.Run()                                   ← 匹配 "agent" 并调用其 Run
│       │
├─ command.go:817-963   Command.Run(args)
│   ├─ L827             readConfig()                                ← 读取配置
│   │   ├─ L128         flags.Var("-config", &configPath)
│   │   ├─ L270-289     for path in configPath: LoadConfig(path)
│   │   │   ├─ config.go:3242-3260  LoadConfig(path)
│   │   │   │   └─ L3253     ParseConfigFile(cleaned)
│   │   │   │       └─ config_parse.go:27-280
│   │   │   │           ├─ L36-43   os.Open + io.Copy              ← 读取 HCL 文件
│   │   │   │           ├─ L72      hcl.Decode(c, buf.String())     ← HCL 解码
│   │   │   │           └─ L79-104  parseVaults/parseConsuls/parseKeyringConfigs
│   │   │   └─ config.go:1961       config.Merge(current)
│   │   ├─ L301         config = config.Merge(cmdConfig)
│   │   ├─ L307         config.normalizeAddrs()
│   │   └─ L335         IsValidConfig(config)
│   │
│   ├─ L842             SetupLoggers(c.Ui, config)
│   ├─ L848-854         hclog.NewInterceptLogger(...)
│   ├─ L880             setupTelemetry(config)
│   │
│   ├─ L887             setupAgent(config, logger, logOutput, inmem)
│   │   │
│   │   ├─ command.go:669-719  setupAgent
│   │   │   ├─ L672     NewAgent(config, logger, logOutput, inmem)
│   │   │   │   │
│   │   │   │   ├─ agent.go:150-195  NewAgent
│   │   │   │   │   ├─ L165     setupConsuls(config.Consuls)        ← Consul 客户端初始化
│   │   │   │   │   ├─ L169     setupServer()                       ← ★ 创建 Server
│   │   │   │   │   │   │
│   │   │   │   │   │   ├─ agent.go:1175-1354  setupServer
│   │   │   │   │   │   │   ├─ L1176   if !Server.Enabled { return } ← true，继续
│   │   │   │   │   │   │   ├─ L1181   serverConfig()               ← 构造 nomad.Config
│   │   │   │   │   │   │   ├─ L1188   setupNodeID(conf)            ← 生成/读取节点 ID
│   │   │   │   │   │   │   │   └─ agent.go:1274-1329
│   │   │   │   │   │   │   │       └─ L1317-1327  uuid.Generate() + 持久化到 /opt/nomad/data/node-id
│   │   │   │   │   │   │   ├─ L1193   setupKeyrings(conf)          ← 密钥环（无 encrypt，跳过）
│   │   │   │   │   │   │   └─ L1198   nomad.NewServer(conf, ...)   ← ★ 创建 Server 实例
│   │   │   │   │   │   │       │
│   │   │   │   │   │   │       └─ server.go:336-586  NewServer
│   │   │   │   │   │   │           ├─ L361-381  创建 Server 结构体（connPool, rpcServer, peersCache 等）
│   │   │   │   │   │   │           ├─ L392-400  NewEvalBroker     ← 评估代理器
│   │   │   │   │   │   │           ├─ L404      NewBlockedEvals   ← 阻塞评估管理器
│   │   │   │   │   │   │           ├─ L407      newRpcHandler     ← RPC 处理器
│   │   │   │   │   │   │           ├─ L410      newPlanner        ← 计划器
│   │   │   │   │   │   │           ├─ L417      newNodeHeartbeater← 节点心跳跟踪器
│   │   │   │   │   │   │           ├─ L420      NewPeriodicDispatch ← 周期性调度器
│   │   │   │   │   │   │           ├─ L423      NewStatsFetcher   ← 状态获取器
│   │   │   │   │   │   │           ├─ L437      NewEncrypter      ← 加密器（根密钥管理）
│   │   │   │   │   │   │           │
│   │   │   │   │   │   │           ├─ L469      setupRPC(tlsWrap) ← ★ RPC 层初始化
│   │   │   │   │   │   │           │   └─ server.go:1203-1264
│   │   │   │   │   │   │           │       ├─ L1205  setupRpcServer  ← 注册静态 RPC 端点
│   │   │   │   │   │   │           │       ├─ L1208  setupStreamingEndpoints ← 流式 RPC 端点
│   │   │   │   │   │   │           │       ├─ L1210  createRPCListener ← TCP 监听器
│   │   │   │   │   │   │           │       └─ L1262  NewRaftLayer   ← Raft 传输层
│   │   │   │   │   │   │           │
│   │   │   │   │   │   │           ├─ L475      auth.NewAuthenticator ← 认证器（ACL 启用）
│   │   │   │   │   │   │           │
│   │   │   │   │   │   │           ├─ L486      setupRaft()        ← ★ Raft 共识初始化
│   │   │   │   │   │   │           │   └─ server.go:1345-1601
│   │   │   │   │   │   │           │       ├─ L1370  NewFSM        ← 有限状态机
│   │   │   │   │   │   │           │       ├─ L1388  raft.NewNetworkTransportWithConfig ← 网络传输
│   │   │   │   │   │   │           │       ├─ L1416  ensurePath(/opt/nomad/data/raft/)
│   │   │   │   │   │   │           │       ├─ L1468  raftboltdb.New(raft.db) ← BoltDB 日志存储
│   │   │   │   │   │   │           │       ├─ L1515  raft.NewFileSnapshotStore ← 快照存储
│   │   │   │   │   │   │           │       ├─ L1574  isSingleServerCluster() ← ★ bootstrap_expect=1
│   │   │   │   │   │   │           │       ├─ L1588  raft.BootstrapCluster ← ★ 单节点自举
│   │   │   │   │   │   │           │       └─ L1596  raft.NewRaft  ← ★ 创建 Raft 实例（开始选举）
│   │   │   │   │   │   │           │
│   │   │   │   │   │   │           ├─ L493      setupSerf()        ← ★ Serf WAN gossip 初始化
│   │   │   │   │   │   │           │   └─ server.go:1738-1791
│   │   │   │   │   │   │           │       ├─ L1740-1750  设置 NodeName 和 Tags（role/region/dc/rpc_addr/port）
│   │   │   │   │   │   │           │       ├─ L1751  conf.Tags["bootstrap"] = "1" ← 单节点标记
│   │   │   │   │   │   │           │       ├─ L1774  conf.SnapshotPath = /opt/nomad/data/serf.snapshot
│   │   │   │   │   │   │           │       └─ L1790  serf.Create  ← ★ 启动 gossip
│   │   │   │   │   │   │           │
│   │   │   │   │   │   │           ├─ L501      setupWorkers()     ← ★ 调度 Worker 初始化
│   │   │   │   │   │   │           │   └─ server.go:1930-1981
│   │   │   │   │   │   │           │       └─ L1970-1978  for i := 0; i < NumSchedulers; i++ { NewWorker(...) }
│   │   │   │   │   │   │           │
│   │   │   │   │   │   │           ├─ L508      setupConsulSyncer()← Consul 同步器
│   │   │   │   │   │   │           ├─ L514      setupDeploymentWatcher() ← 部署监视器
│   │   │   │   │   │   │           ├─ L520      setupVolumeWatcher() ← 卷监视器
│   │   │   │   │   │   │           ├─ L531      setupNodeDrainer() ← 节点排空器
│   │   │   │   │   │   │           ├─ L534      setupEnterprise()  ← Autopilot（CE 版）
│   │   │   │   │   │   │           │
│   │   │   │   │   │   │           ├─ L539      go monitorLeadership()  ← ★ 领导权监控 goroutine
│   │   │   │   │   │   │           │   └─ leader.go:111-176
│   │   │   │   │   │   │           │       ├─ L115  leaderCh := s.raft.LeaderCh()
│   │   │   │   │   │   │           │       └─ L126  go s.leaderLoop(ch)  ← ★ 领导者循环
│   │   │   │   │   │   │           │           └─ leader.go:248-370
│   │   │   │   │   │   │           │               ├─ L259  raft.Barrier  ← 等待 FSM 追上
│   │   │   │   │   │   │           │               ├─ L268  establishLeadership()  ← ★ 建立领导权
│   │   │   │   │   │   │           │               │   └─ leader.go:378-470
│   │   │   │   │   │   │           │               │       ├─ L383  setLeaderAcl(uuid)
│   │   │   │   │   │   │           │               │       ├─ L387  handlePausableWorkers(true) ← 暂停 Worker
│   │   │   │   │   │   │           │               │       ├─ L390  autopilot.Start()
│   │   │   │   │   │   │           │               │       ├─ L403  planQueue.SetEnabled(true)
│   │   │   │   │   │   │           │               │       ├─ L406  go planApply()  ← ★ 计划应用 goroutine
│   │   │   │   │   │   │           │               │       ├─ L413  deploymentWatcher.SetEnabled(true)
│   │   │   │   │   │   │           │               │       ├─ L416  nodeDrainer.SetEnabled(true)
│   │   │   │   │   │   │           │               │       ├─ L419  volumeWatcher.SetEnabled(true)
│   │   │   │   │   │   │           │               │       ├─ L430  periodicDispatcher.SetEnabled(true)
│   │   │   │   │   │   │           │               │       ├─ L435  setConsistentReadReady()  ← ★ 一致性读就绪
│   │   │   │   │   │   │           │               │       ├─ L440  go initializeKeyring()  ← 创建根密钥
│   │   │   │   │   │   │           │               │       ├─ L449  go schedulePeriodic()  ← 周期性任务
│   │   │   │   │   │   │           │               │       └─ L452  go reapFailedEvaluations()  ← 回收失败评估
│   │   │   │   │   │   │           │               └─ L297  reconcile()  ← 协调缺失数据
│   │   │   │   │   │   │           │
│   │   │   │   │   │   │           ├─ L542      go serfEventHandler()  ← ★ Serf 事件处理 goroutine
│   │   │   │   │   │   │           │   └─ serf.go:34-57
│   │   │   │   │   │   │           │       ├─ EventMemberJoin → updatePeer + maybeBootstrap + localMemberEvent
│   │   │   │   │   │   │           │       ├─ EventMemberFailed/Update → updatePeer
│   │   │   │   │   │   │           │       └─ EventMemberLeave/Reap → deletePeer + localMemberEvent
│   │   │   │   │   │   │           │
│   │   │   │   │   │   │           ├─ L545      startRPCListener()  ← ★ 启动 RPC 监听
│   │   │   │   │   │   │           │   └─ server.go:589-593
│   │   │   │   │   │   │           │       └─ L592  go s.listen(ctx)  ← 接受 RPC 连接
│   │   │   │   │   │   │           │
│   │   │   │   │   │   │           ├─ L548-563  启动多个 metrics goroutine
│   │   │   │   │   │   │           │   ├─ go evalBroker.EmitStats()
│   │   │   │   │   │   │           │   ├─ go planQueue.EmitStats()
│   │   │   │   │   │   │           │   ├─ go blockedEvals.EmitStats()
│   │   │   │   │   │   │           │   ├─ go heartbeatStats()
│   │   │   │   │   │   │           │   └─ go EmitRaftStats()
│   │   │   │   │   │   │           │
│   │   │   │   │   │   │           ├─ L566      startEnterpriseBackground()  ← CE 版空操作
│   │   │   │   │   │   │           ├─ L571      NewKeyringReplicator()  ← 密钥环复制器
│   │   │   │   │   │   │           └─ L579      encrypter.IsReady(startupTimeout)  ← 等待密钥环就绪
│   │   │   │   │   │   │
│   │   │   │   │   │   └─ L1205     a.server = server
│   │   │   │   │   │
│   │   │   │   │   ├─ L172     setupClient()                       ← 当前配置未启用 client，直接返回
│   │   │   │   │   │   └─ agent.go:1357-1359  if !Client.Enabled { return nil }
│   │   │   │   │   │
│   │   │   │   │   ├─ L176     setupEnterpriseAgent(logger)        ← CE 版空操作
│   │   │   │   │   ├─ L179     校验 client/server 至少一个（server 启用，通过）
│   │   │   │   │   └─ L185     TLS metrics（当前配置无 TLS，跳过）
│   │   │   │   │
│   │   │   │   └─ 返回 Agent
│   │   │   │
│   │   │   ├─ L685     NewHTTPServers(agent, config)               ← 启动 HTTP API + UI 服务器
│   │   │   └─ L695-716 checkpoint.CheckInterval(...)               ← 版本更新检查
│   │   │
│   │   └─ 返回
│   │
│   ├─ L905             startupJoin(config)                         ← start_join（当前配置无，空操作）
│   ├─ L911-943         输出 Agent 配置摘要
│   ├─ L946             输出 "Nomad agent started!"
│   ├─ L952             handleRetryJoin(config)                     ← 当前配置无 retry_join，空操作
│   ├─ L958             winsvc.SendEvent(EventServiceReady)
│   └─ L962             handleSignals()                              ← ★ 阻塞等待信号
│       │
│       ├─ command.go:1090-1159  handleSignals
│       │   ├─ L1094    signal.Notify(SIGINT, SIGTERM, SIGHUP, SIGPIPE)
│       │   ├─ L1105    sdNotify(sdReady)
│       │   └─ L1107    for { select { ... } }                      ← 阻塞主循环
│       │       ├─ SIGHUP  → handleReload()                         ← 热重载配置
│       │       ├─ SIGTERM → terminateGracefully()                  ← 优雅退出
│       │       └─ SIGINT  → terminateGracefully()                  ← Ctrl+C 退出
│       │
│       └─ 返回退出码
│
└─ main.go:118          return exitCode → os.Exit(exitCode)
```

---

## 10. 关键代码位置索引

### 10.1 入口与注册

| 功能 | 文件 | 行号 |
|------|------|------|
| 程序入口 `main()` | [main.go](file:///d:/claude/nomad/main.go) | L81-L83 |
| CLI 运行 `Run()` | [main.go](file:///d:/claude/nomad/main.go) | L86-L119 |
| `agent` 命令注册 | [command/commands.go](file:///d:/claude/nomad/command/commands.go) | L308-L314 |
| Agent `Run()` 方法 | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L817-L963 |
| `setupAgent()` | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L669-L719 |

### 10.2 配置加载

| 功能 | 文件 | 行号 |
|------|------|------|
| `readConfig()` | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L64-L340 |
| `-config` flag 注册 | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L128 |
| `LoadConfig()` | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L3242-L3260 |
| `ParseConfigFile()` | [command/agent/config_parse.go](file:///d:/claude/nomad/command/agent/config_parse.go) | L27-L280 |
| `(*Config) Merge()` | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L1961+ |

### 10.3 Agent 与 Server 创建

| 功能 | 文件 | 行号 |
|------|------|------|
| `NewAgent()` | [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | L150-L195 |
| `setupServer()` | [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | L1175-L1354 |
| `setupClient()`（短路返回） | [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | L1356-L1425 |
| `setupNodeID()` | [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | L1274-L1329 |
| `setupKeyrings()` | [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | L1332-L1353 |
| `nomad.NewServer()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L336-L586 |

### 10.4 Server 核心组件初始化

| 功能 | 文件 | 行号 |
|------|------|------|
| `setupRPC()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L1203-L1264 |
| `setupRpcServer()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L1296+ |
| `setupStreamingEndpoints()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L1268-L1291 |
| `createRPCListener()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L596-L606 |
| `startRPCListener()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L589-L593 |
| `setupRaft()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L1345-L1601 |
| `setupSerf()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L1738-L1791 |
| `setupWorkers()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L1930-L1940 |
| `setupWorkersLocked()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L1944-L1981 |
| `setupConsulSyncer()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L1142-L1151 |
| `setupDeploymentWatcher()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L1156-L1175 |
| `setupVolumeWatcher()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L1178-L1183 |
| `setupNodeDrainer()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L1187-L1200 |
| `setupEnterprise()`（CE） | [nomad/server_setup_ce.go](file:///d:/claude/nomad/nomad/server_setup_ce.go) | L22-L36 |
| `isSingleServerCluster()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L2314-L2316 |

### 10.5 领导权与 Serf 事件

| 功能 | 文件 | 行号 |
|------|------|------|
| `monitorLeadership()` | [nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go) | L111-L176 |
| `leaderLoop()` | [nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go) | L248-L370 |
| `establishLeadership()` | [nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go) | L378-L470+ |
| `reconcile()` | [nomad/leader.go](file:///d:/claude/nomad/nomad/leader.go) | - |
| `serfEventHandler()` | [nomad/serf.go](file:///d:/claude/nomad/nomad/serf.go) | L34-L57 |
| `maybeBootstrap()` | [nomad/serf.go](file:///d:/claude/nomad/nomad/serf.go) | L88+ |
| `updatePeer()` | [nomad/serf.go](file:///d:/claude/nomad/nomad/serf.go) | L60-L71 |
| `deletePeer()` | [nomad/serf.go](file:///d:/claude/nomad/nomad/serf.go) | L74-L85 |

### 10.6 信号处理

| 功能 | 文件 | 行号 |
|------|------|------|
| `handleSignals()` | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L1090-L1159 |
| `signal.Notify` 注册 | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L1094 |
| `terminateGracefully()` | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L1035-L1087 |
| `handleReload()` | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L1182-L1268 |

### 10.7 Metrics 与后台任务

| 功能 | 文件 | 行号 |
|------|------|------|
| `evalBroker.EmitStats()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L548 调用 |
| `planQueue.EmitStats()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L551 调用 |
| `blockedEvals.EmitStats()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L557 调用 |
| `heartbeatStats()` | [nomad/heartbeat.go](file:///d:/claude/nomad/nomad/heartbeat.go) | L256 |
| `EmitRaftStats()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L2202 |
| `listenWorkerEvents()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L2020 |

---

## 11. 执行流程要点总结

### 11.1 当前配置（仅 server 模式，bootstrap_expect=1）的关键执行路径

1. **入口**：`main.go:82` → `Run()` → `cli.Run()` 匹配 `agent` 命令
2. **配置加载**：`command.go:827` `readConfig()` → `LoadConfig("etc/nomad.d/nomad.server.hcl")` → `ParseConfigFile` → `hcl.Decode` 解析 HCL
3. **配置合并**：默认配置 → 企业版配置 → HCL 文件配置 → CLI 参数（优先级递增）
4. **Agent 创建**：`command.go:887` `setupAgent` → `agent.go:150` `NewAgent`
5. **Client 跳过**：`agent.go:1357` `if !Client.Enabled { return nil }`（当前配置未启用 client）
6. **Server 创建**：`agent.go:1198` `nomad.NewServer(conf, ...)`，内部顺序：
   - 创建评估代理器、阻塞评估管理器、RPC 处理器、计划器、心跳跟踪器、周期性调度器、加密器
   - `setupRPC`：注册 RPC 端点、创建 TCP 监听器、创建 Raft 传输层
   - `setupRaft`：创建 FSM、BoltDB 日志存储、快照存储，**单节点自举**（`bootstrap_expect=1`），创建 Raft 实例开始选举
   - `setupSerf`：创建 Serf WAN gossip，设置成员标签（含 `bootstrap=1`），启动成员发现
   - `setupWorkers`：创建 2 个调度 Worker（默认）
   - 创建部署监视器、卷监视器、节点排空器、Autopilot
   - 启动 `monitorLeadership` goroutine（监听 Raft 领导权变更）
   - 启动 `serfEventHandler` goroutine（处理 Serf 成员事件）
   - `startRPCListener`：启动 RPC 监听 goroutine
   - 启动多个 metrics goroutine
   - 等待密钥环就绪
7. **HTTP 服务器**：`command.go:685` `NewHTTPServers` 监听 `addresses.http = 0.0.0.0`，提供 REST API 和 Web UI
8. **领导权获取**：单节点集群中，Raft 选举超时后该节点自动成为领导者：
   - `monitorLeadership` 收到 `leaderCh <- true`
   - 启动 `leaderLoop` goroutine
   - `establishLeadership`：生成领导者 ACL、暂停部分 Worker、启动 Autopilot、启用计划队列、启动 `planApply` goroutine、启用部署监视器/节点排空器/卷监视器/周期性调度器、标记一致性读就绪、初始化密钥环、启动周期性任务调度和失败评估回收
9. **信号等待**：`command.go:962` `handleSignals()` 阻塞
   - SIGHUP → 热重载配置
   - SIGINT/SIGTERM → 优雅退出（Server Leave + Shutdown）

### 11.2 关键设计要点

- **单节点自举**：`bootstrap_expect=1` 时，`isSingleServerCluster` 返回 true，`setupRaft` 中直接调用 `raft.BootstrapCluster` 用当前节点配置引导集群，无需等待其他节点
- **Raft 状态持久化**：日志存储在 `/opt/nomad/data/raft/raft.db`（BoltDB），快照在 `/opt/nomad/data/raft/` 目录
- **Serf 成员标签**：每个 Server 通过 Serf 标签广播 `role=nomad`、`region`、`dc`、`rpc_addr`、`port`、`bootstrap`、`expect` 等，供其他节点发现和识别
- **领导权建立**：成为领导者后需执行大量初始化（启用计划队列、部署监视器、节点排空器、卷监视器、周期性调度器、Autopilot、密钥环初始化等），通过 `establishLeadership` 集中处理
- **一致性读就绪**：`setConsistentReadReady` 在 FSM 追上 Raft 日志（Barrier 成功）且所有领导组件启用后调用，确保 Server 可接受一致性读请求
- **Worker 暂停机制**：`handlePausableWorkers(true)` 在成为领导者时暂停部分 Worker，释放 CPU 核心给计划队列和评估代理器
- **密钥环就绪等待**：`encrypter.IsReady(startupTimeout)` 阻塞等待密钥环解密完成，确保敏感数据可访问后才返回
- **UI 启用**：`ui.enabled=true` 让 HTTP 服务器提供内置 Web UI（通过 `NewHTTPServers` 处理）
