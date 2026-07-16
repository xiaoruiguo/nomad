# Nomad Agent Client 启动执行流程分析

> 命令：`/usr/local/bin/nomad agent -config=etc/nomad.d/nomad.hcl`
> 配置文件：[etc/nomad.d/nomad.hcl](file:///d:/claude/nomad/etc/nomad.d/nomad.hcl)（仅启用 client 模式，启用 ACL，启用 raw_exec 插件）
> 分析基线：当前仓库代码（Windows 平台路径，Linux 运行路径语义一致）

---

## 0. 配置文件解析

### 0.1 配置文件内容（[etc/nomad.d/nomad.hcl](file:///d:/claude/nomad/etc/nomad.d/nomad.hcl)）

| 行号 | HCL 语句 | 用途说明 |
|------|---------|---------|
| L1 | `data_dir = "/opt/nomad/data"` | 数据目录路径，存放 Client 状态、分配目录等 |
| L2 | `bind_addr = "0.0.0.0"` | 绑定地址，监听所有网卡 |
| L4-L10 | `client { ... }` | Client 配置块 |
| L5 | `enabled = true` | 启用 Client 模式（关键开关，决定后续 `setupClient` 执行） |
| L6-L8 | `server_join { retry_join = ["x.x.x.x"] }` | 配置待加入的 Nomad Server 地址列表，Client 通过 `SetServers` 使用 |
| L9 | `cpu_total_compute = 2000` | 节点 CPU 总算力（MHz），覆盖自动指纹采集值 |
| L12-L16 | `addresses { ... }` | 各服务监听地址（http/rpc/serf 均为 0.0.0.0） |
| L18-L22 | `advertise { ... }` | 对外通告地址（http/rpc/serf 均为 x.x.x.x） |
| L24-L26 | `acl { enabled = true }` | 启用 ACL 访问控制 |
| L28-L31 | `plugin "raw_exec" { config { enabled = true } }` | 启用 raw_exec 任务驱动插件 |

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
| L36-L56 | `hidden = []string{...}` | 隐藏命令列表（不在 help 显示，如 alloc-status、debug、logmon 等） |
| L60-L67 | `aliases = []string{...}` | 命令别名列表（help 隐藏但 autocomplete 显示，如 fs、init、logs 等） |
| L70-L78 | `commonCommands = []string{...}` | 常用命令分组（run/stop/status/alloc/job/node/agent），help 输出时单独列出 |

### 1.3 `main()` 函数（[main.go L81-L83](file:///d:/claude/nomad/main.go#L81-L83)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L82 | `os.Exit(Run(os.Args[1:]))` | 调用 `Run` 执行 CLI，传入除程序名外的参数 `["agent", "-config=etc/nomad.d/nomad.hcl"]`，退出码传递给 `os.Exit` |

### 1.4 `Run()` 函数（[main.go L86-L119](file:///d:/claude/nomad/main.go#L86-L119)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L87 | `metaPtr := new(command.Meta)` | 创建命令元数据指针（封装 HTTP API 客户端、UI 等） |
| L88 | `metaPtr.SetupUi(args)` | 初始化 UI（根据是否为 JSON 输出等选择 BasicUi/ColoredUi），并解析早期参数 |
| L91-L95 | `agentUi := &cli.BasicUi{...}` | 创建 Agent 专用 UI（Agent 不输出颜色），绑定 stdin/stdout/stderr |
| L97 | `commands := command.Commands(metaPtr, agentUi)` | 调用 `command.Commands` 注册所有子命令（含 `agent`） |
| L98-L110 | `cli := &cli.CLI{...}` | 创建 CLI 运行时：名称 "nomad"、版本号、参数、命令表、隐藏命令、启用自动补全、自定义 help |
| L100 | `Version: version.GetVersion().FullVersionNumber(true)` | 获取完整版本号字符串 |
| L106-L108 | `HelpFunc: groupedHelpFunc(cli.BasicHelpFunc("nomad"))` | 设置分组 help 输出函数 |
| L112 | `exitCode, err := cli.Run()` | **关键调用**：CLI 框架解析 `args`，匹配到 `agent` 命令并执行其 `Run` 方法 |
| L113-L116 | `if err != nil { ... return 1 }` | CLI 执行错误处理 |
| L118 | `return exitCode` | 返回退出码 |

### 1.5 `groupedHelpFunc()` 函数（[main.go L122-L168](file:///d:/claude/nomad/main.go#L122-L168)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L123-L167 | `return func(commands map[string]cli.CommandFactory) string { ... }` | 返回 help 函数：按 common/other 分组输出命令列表 |
| L129-L131 | `for _, v := range commonCommands { printCommand(...) }` | 输出常用命令组 |
| L135-L155 | 遍历 commands 过滤 common 和 aliases | 收集"其他命令"列表 |
| L156 | `sort.Strings(otherCommands)` | 按字母序排序 |
| L160-L162 | `for _, v := range otherCommands { printCommand(...) }` | 输出其他命令组 |

### 1.6 `printCommand()` 函数（[main.go L171-L177](file:///d:/claude/nomad/main.go#L171-L177)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L172 | `cmd, err := cmdFn()` | 调用工厂函数实例化命令 |
| L176 | `fmt.Fprintf(w, "    %s\t%s\n", name, cmd.Synopsis())` | 输出命令名和简介 |

---

## 2. 命令注册（[command/commands.go](file:///d:/claude/nomad/command/commands.go)）

### 2.1 `Commands()` 函数（[command/commands.go L68-L1428](file:///d:/claude/nomad/command/commands.go#L68)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L68 | `func Commands(metaPtr *Meta, agentUi cli.Ui) map[string]cli.CommandFactory {` | 函数签名：接收 Meta 和 agentUi，返回命令名到工厂函数的映射 |
| L82 | `all := map[string]cli.CommandFactory{...}` | 开始定义命令字典字面量 |

### 2.2 `agent` 命令注册（[command/commands.go L308-L314](file:///d:/claude/nomad/command/commands.go#L308-L314)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L308 | `"agent": func() (cli.Command, error) {` | 注册 `agent` 命令工厂 |
| L309-L313 | `return &agent.Command{ Version: version.GetVersion(), Ui: agentUi, ShutdownCh: make(chan struct{}) }, nil` | 实例化 [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) 中的 `Command` 结构体，注入版本、UI、关闭信号通道 |
| L314 | `},` | 工厂函数结束 |

> **关键说明**：这里返回的是 `agent.Command`（来自 `command/agent` 包），而非 `command` 包本地定义的其他 `XxxCommand`。该命令实现了 `cli.Command` 接口（`Run`/`Help`/`Synopsis`）。

---

## 3. Agent 命令入口（[command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go)）

### 3.1 `Command` 结构体定义（[command/agent/command.go L49-L62](file:///d:/claude/nomad/command/agent/command.go#L49-L62)）

| 行号 | 字段 | 用途说明 |
|------|------|---------|
| L50 | `Version *version.VersionInfo` | 版本信息 |
| L51 | `Ui cli.Ui` | UI 输出接口 |
| L52 | `ShutdownCh <-chan struct{}` | 关闭信号只读通道 |
| L54 | `args []string` | 原始命令行参数 |
| L55 | `agent *Agent` | Agent 实例（在 `setupAgent` 中创建） |
| L56 | `httpServers []*HTTPServer` | HTTP 服务器列表 |
| L57 | `retryJoinErrCh chan struct{}` | retry join 错误通知通道 |

### 3.2 `readConfig()` 方法（[command/agent/command.go L64-L340](file:///d:/claude/nomad/command/agent/command.go#L64)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L64 | `func (c *Command) readConfig() *Config {` | 配置读取入口 |
| L65 | `var configPath []string` | 配置文件路径列表（`-config` 可多次指定） |
| L70-L82 | `cmdConfig := &Config{...}` | 创建空的命令行配置对象，预初始化各子结构 |
| L84 | `flags := flag.NewFlagSet("agent", flag.ContinueOnError)` | 创建 flag 解析器 |
| L92-L97 | `flags.BoolVar(&devMode, "dev", false, "")` 等 | 注册 dev 模式、server、client 开关 flag |
| **L128** | `flags.Var((*flaghelper.StringFlag)(&configPath), "config", "config")` | **关键**：注册 `-config` flag，将路径累积到 `configPath` 切片 |
| L270-L289 | `for _, path := range configPath { current, err := LoadConfig(path); ...; config = config.Merge(current) }` | **关键**：遍历每个 `-config` 路径，调用 `LoadConfig` 加载，并通过 `Merge` 叠加合并 |
| L271 | `current, err := LoadConfig(path)` | 加载 `etc/nomad.d/nomad.hcl`（详见第 4 节） |
| L287 | `config = config.Merge(current)` | 将 HCL 配置合并到默认配置之上 |
| L301 | `config = config.Merge(cmdConfig)` | CLI 选项最后合并（优先级最高，覆盖文件配置） |
| L304 | `config.Version = c.Version` | 注入版本信息 |
| L307 | `if err := config.normalizeAddrs(); err != nil { ... }` | 规范化 bind/advertise/addresses（处理 0.0.0.0、解析网卡等） |
| L323-L325 | `if config.PluginDir == "" && config.DataDir != "" { config.PluginDir = filepath.Join(config.DataDir, "plugins") }` | 插件目录默认为 `{data_dir}/plugins` |
| L335 | `if !c.IsValidConfig(config, cmdConfig) { return nil }` | 校验配置合法性（至少启用 client 或 server 等） |
| L339 | `return config` | 返回最终合并后的配置 |

### 3.3 `Run()` 方法（[command/agent/command.go L817-L963](file:///d:/claude/nomad/command/agent/command.go#L817)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L817 | `func (c *Command) Run(args []string) int {` | Agent 命令主入口（由 `cli.Run` 在 L112 调用） |
| L818-L823 | `c.Ui = &cli.PrefixedUi{...}` | 包装 UI 添加前缀（`==>` 输出/错误，4 空格信息） |
| L826 | `c.args = args` | 保存参数 `["-config=etc/nomad.d/nomad.hcl"]` |
| **L827** | `config := c.readConfig()` | **关键调用**：读取并合并配置（详见 3.2 节） |
| L828-L830 | `if config == nil { return 1 }` | 配置读取失败返回 1 |
| L833-L839 | `if config.LogJson { c.Ui = &cli.BasicUi{...} }` | JSON 日志模式重置 UI（避免前缀污染 JSON） |
| **L842** | `logGate, logOutput := SetupLoggers(c.Ui, config)` | **关键调用**：设置日志输出（门控日志器 + 文件/STDOUT 输出） |
| L848-L854 | `logger := hclog.NewInterceptLogger(&hclog.LoggerOptions{...})` | 创建名为 "agent" 的 InterceptLogger，级别取自 `config.LogLevel` |
| L858-L863 | `log.SetOutput(logger.StandardWriter{...}); log.SetPrefix(""); log.SetFlags(0)` | 将标准库 `log` 包输出重定向到 hclog，便于捕获第三方库日志 |
| L866-L870 | `if config.LogJson { c.Ui = &logging.HcLogUI{Log: logger}; logGate.Flush() }` | JSON 模式用 HcLogUI 替换 UI |
| L873-L877 | `if len(config.Files) > 0 { c.Ui.Output("Loaded configuration from ...") }` | 输出已加载的配置文件路径 |
| **L880** | `inmem, err := c.setupTelemetry(config)` | **关键调用**：初始化遥测（内存 metrics sink + Prometheus/Circonus 等） |
| L881-L884 | `if err != nil { ... return 1 }` | 遥测初始化失败处理 |
| **L887** | `if err := c.setupAgent(config, logger, logOutput, inmem); err != nil { ... return 1 }` | **关键调用**：创建 Agent（含 Server/Client），详见第 5 节 |
| L892-L902 | `defer func() { c.agent.Shutdown(); ... }` | 注册 defer：函数退出时关闭 Agent 和 HTTP 服务器 |
| **L905** | `if err := c.startupJoin(config); err != nil { ... return 1 }` | **关键调用**：执行 `start_join`（当前配置无 `start_join`，实际为空操作） |
| L911-L924 | `info := make(map[string]string); info["version"]=...; info["client"]=...` | 收集 Agent 信息用于输出（版本、client/server 模式、region、bind/advertise 地址等） |
| L927-L931 | `infoKeys := ...; sort.Strings(infoKeys)` | 收集并排序 info 键 |
| L935-L943 | `c.Ui.Output("Nomad agent configuration:\n"); for _, k := range infoKeys { c.Ui.Info(...) }` | 输出 Agent 配置摘要表 |
| L946 | `c.Ui.Output("Nomad agent started! Log data will stream in below:\n")` | 输出启动完成提示 |
| L949 | `logGate.Flush()` | 刷新日志门控，开始流式输出 |
| **L952** | `if err := c.handleRetryJoin(config); err != nil { ... return 1 }` | **关键调用**：启动 retry join 协程（详见第 7 节） |
| L958 | `winsvc.SendEvent(winsvc.NewEvent(winsvc.EventServiceReady))` | Windows 服务就绪事件通知（Linux 下为空操作） |
| L959 | `defer func() { winsvc.SendEvent(winsvc.NewEvent(winsvc.EventServiceStopped)) }()` | 注册 defer：Windows 服务停止事件 |
| **L962** | `return c.handleSignals()` | **关键调用**：阻塞等待信号（详见第 8 节），返回退出码 |

### 3.4 `setupAgent()` 方法（[command/agent/command.go L669-L719](file:///d:/claude/nomad/command/agent/command.go#L669)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L669 | `func (c *Command) setupAgent(config *Config, logger hclog.InterceptLogger, logOutput io.Writer, inmem *metrics.InmemSink) error {` | 创建 Agent 的封装方法 |
| L670 | `c.Ui.Output("Starting Nomad agent...")` | 输出启动提示 |
| **L672** | `agent, err := NewAgent(config, logger, logOutput, inmem)` | **关键调用**：创建 Agent 实例（详见第 5 节） |
| L673-L678 | `if err != nil { logger.Error(...); c.Ui.Error(...); return err }` | 错误处理 |
| L679 | `c.agent = agent` | 保存 Agent 引用 |
| L682 | `c.agent.configReloader = c.handleReload` | 设置配置热重载回调（SIGHUP 触发） |
| **L685** | `httpServers, err := NewHTTPServers(agent, config)` | **关键调用**：创建 HTTP API 服务器（监听 `addresses.http`） |
| L686-L690 | `if err != nil { agent.Shutdown(); ... return err }` | HTTP 启动失败处理 |
| L691 | `c.httpServers = httpServers` | 保存 HTTP 服务器引用 |
| L695-L716 | `if config.DisableUpdateCheck != nil && !*config.DisableUpdateCheck { ... }` | 未禁用更新检查时，调度 24 小时间隔的 checkpoint 检查，并在 30 秒内首次检查 |
| L709 | `checkpoint.CheckInterval(updateParams, 24*time.Hour, c.checkpointResults)` | 注册周期性版本更新检查 |
| L712-L715 | `go func() { time.Sleep(helper.RandomStagger(30 * time.Second)); c.checkpointResults(checkpoint.Check(updateParams)) }()` | 启动 goroutine 执行首次更新检查 |

---

## 4. 配置文件加载（[command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) 和 [command/agent/config_parse.go](file:///d:/claude/nomad/command/agent/config_parse.go)）

### 4.1 `LoadConfig()` 函数（[command/agent/config.go L3242-L3260](file:///d:/claude/nomad/command/agent/config.go#L3242)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L3242 | `func LoadConfig(path string) (*Config, error) {` | 配置加载入口 |
| L3243 | `fi, err := os.Stat(path)` | 获取路径信息 |
| L3248-L3250 | `if fi.IsDir() { return LoadConfigDir(path) }` | 目录则委托 `LoadConfigDir` 按字母序加载所有文件 |
| L3252 | `cleaned := filepath.Clean(path)` | 清理路径（如 `etc/nomad.d/nomad.hcl`） |
| **L3253** | `config, err := ParseConfigFile(cleaned)` | **关键调用**：解析单个 HCL 文件（详见 4.2） |
| L3258 | `config.Files = append(config.Files, cleaned)` | 记录已加载文件路径 |
| L3259 | `return config, nil` | 返回解析后的配置 |

### 4.2 `ParseConfigFile()` 函数（[command/agent/config_parse.go L27-L280](file:///d:/claude/nomad/command/agent/config_parse.go#L27)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L27 | `func ParseConfigFile(path string) (*Config, error) {` | HCL 文件解析入口 |
| L30-L43 | `var buf bytes.Buffer; f, err := os.Open(path); io.Copy(&buf, f)` | 读取文件全部内容到 buffer |
| L46-L70 | `c := &Config{ Client: &ClientConfig{...}, Server: &ServerConfig{...}, ... }` | 创建空 Config 对象，预初始化所有子结构 |
| **L72** | `err = hcl.Decode(c, buf.String())` | **关键调用**：使用 `hashicorp/hcl` 库将 HCL 内容解码到 Config 结构体（`data_dir`、`bind_addr`、`client{}`、`addresses{}`、`advertise{}`、`acl{}`、`plugin{}` 等字段被填充） |
| L79 | `root, err := hcl.Parse(buf.String())` | 再次解析 HCL 为 AST（用于手动提取多块 `vault`/`consul`/`keyring`） |
| L83-L104 | `list := root.Node.(*ast.ObjectList); matches := list.Filter("vault"/"consul"/"keyring"); parseVaults/parseConsuls/parseKeyringConfigs` | 过滤并手动解析 vault/consul/keyring 块（支持多块定义） |
| L108-L207 | `durationConversionMap` 定义 | 列出所有需要从字符串转为 `time.Duration` 的字段（如 `client.template_config.wait`） |
| L265 | `convertDurations(tds)` | 执行时长字段转换 |
| L271 | `extraKeys(c)` | 报告未识别的 HCL 键（帮助发现拼写错误） |
| L277 | `finalizeClientTemplateConfig(c)` | 清理零值模板配置 |
| L279 | `return c, nil` | 返回解析后的配置 |

### 4.3 配置合并 `(*Config) Merge()`（[command/agent/config.go L1961 起](file:///d:/claude/nomad/command/agent/config.go#L1961)）

合并顺序（在 `readConfig` 中）：
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
| L151-L156 | `a := &Agent{ config: config, logOutput: logOutput, shutdownCh: make(chan struct{}), inmemSink: inmem }` | 创建 Agent 实例，初始化关闭通道 |
| L159 | `a.logger = logger` | 保存 logger |
| L160 | `a.httpLogger = a.logger.ResetNamed("http")` | 创建 HTTP 专用 logger（名为 "http"） |
| L163 | `golog.SetFlags(golog.LstdFlags | golog.Lmicroseconds)` | 设置标准库 log 微秒级时间戳 |
| **L165** | `if err := a.setupConsuls(config.Consuls); err != nil { return nil, fmt.Errorf("Failed to initialize Consul client: %v", err) }` | **关键调用**：初始化 Consul 客户端（服务发现、配置条目） |
| **L169** | `if err := a.setupServer(); err != nil { return nil, err }` | **关键调用**：创建 Server（详见 5.2） |
| **L172** | `if err := a.setupClient(); err != nil { return nil, err }` | **关键调用**：创建 Client（详见 5.3） |
| **L176** | `if err := a.setupEnterpriseAgent(logger); err != nil { return nil, err }` | **关键调用**：企业版扩展初始化（CE 版为空操作） |
| L179-L181 | `if a.client == nil && a.server == nil { return nil, fmt.Errorf("must have at least client or server mode enabled") }` | 校验：client 和 server 至少启用一个（当前配置 client.enabled=true 通过） |
| L185-L192 | `if !a.config.TLSConfig.IsEmpty() { tlsMetrics, err := newTLSMetrics(...); tlsMetrics.start(...) }` | 若配置了 TLS，启动证书到期 metrics（当前配置无 TLS，跳过） |
| L194 | `return a, nil` | 返回 Agent |

### 5.2 `setupServer()` 方法（[command/agent/agent.go L1175-L1354](file:///d:/claude/nomad/command/agent/agent.go#L1175)）

> **当前配置 `server.enabled` 未设置（默认 false），此方法直接返回。**

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1175 | `func (a *Agent) setupServer() error {` | Server 创建入口 |
| **L1176-L1178** | `if !a.config.Server.Enabled { return nil }` | **关键短路**：配置未启用 server，直接返回 nil（当前配置走此分支） |
| L1181 | `conf, err := a.serverConfig()` | 构造 `nomad.Config`（未执行） |
| L1188 | `a.setupNodeID(conf)` | 生成或读取节点 ID（未执行） |
| L1193 | `a.setupKeyrings(conf)` | 设置 gossip 加密密钥环（未执行） |
| L1198-L1201 | `server, err := nomad.NewServer(conf, a.consulCatalog, a.consulConfigEntriesFunc)` | 创建 Server（未执行） |
| L1205 | `a.server = server` | 保存 Server 引用（未执行） |
| L1218-L1351 | Consul auto-advertise 注册服务等 | 未执行 |

### 5.3 `setupClient()` 方法（[command/agent/agent.go L1356-L1425](file:///d:/claude/nomad/command/agent/agent.go#L1356)）

> **当前配置 `client.enabled = true`，此方法完整执行。**

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1356 | `func (a *Agent) setupClient() error {` | Client 创建入口 |
| **L1357-L1359** | `if !a.config.Client.Enabled { return nil }` | 检查开关（当前配置为 true，继续执行） |
| **L1364** | `if err := a.setupPlugins(); err != nil { return err }` | **关键调用**：加载插件（驱动、设备、CSI 等），必须在 `clientConfig` 之前，因为要把 plugin loader 指针复制到 client 配置 |
| **L1369** | `conf, err := a.clientConfig()` | **关键调用**：构造 client 配置（转换 agent.Config 为 client.Config） |
| L1375-L1379 | `if runtime.GOOS == "windows" { a.reservePortsForClient(conf) }` | Windows 平台为插件预留端口（Linux 跳过） |
| L1380-L1382 | `if conf.StateDBFactory == nil { conf.StateDBFactory = state.GetStateDBFactory(conf.DevMode) }` | 设置状态数据库工厂（BoltDB） |
| **L1388** | `a.builtinListener, a.builtinDialer = bufconndialer.New()` | **关键调用**：创建内存 listener/dialer，供 consul-template 调用 Nomad API（绕过网络） |
| L1389 | `conf.TemplateDialer = a.builtinDialer` | 注入到 client 配置 |
| **L1393** | `a.taskAPIServer = newBuiltinAPI()` | **关键调用**：创建内置 Task API 服务器（供任务通过环境变量调用 Nomad API） |
| L1394 | `conf.APIListenerRegistrar = a.taskAPIServer` | 注入到 client 配置 |
| **L1396-L1401** | `nomadClient, err := client.NewClient(conf, a.consulCatalog, a.consulProxiesFunc, a.consulServices, nil)` | **关键调用**：创建 Client 实例（详见第 6 节） |
| L1402-L1404 | `if err != nil { return fmt.Errorf("client setup failed: %v", err) }` | 错误处理 |
| **L1405** | `a.client = nomadClient` | 保存 Client 引用 |
| L1409-L1422 | `if *defaultConsul.AutoAdvertise { ... a.consulServices.RegisterAgent(...) }` | 若启用 Consul 自动通告，注册 Client HTTP 服务（当前配置未显式启用 Consul auto-advertise，默认行为见 DefaultConfig） |
| L1424 | `return nil` | 返回成功 |

---

## 6. Client 创建（[client/client.go](file:///d:/claude/nomad/client/client.go)）

### 6.1 `NewClient()` 函数（[client/client.go L361-L676](file:///d:/claude/nomad/client/client.go#L361)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L361 | `func NewClient(cfg *config.Config, consulCatalog consul.CatalogAPI, consulProxiesFunc consulApiShim.SupportedProxiesAPIFunc, consulServices serviceregistration.Handler, rpcs map[string]interface{}) (*Client, error) {` | Client 构造函数 |
| L362-L370 | 创建 `Client` 结构体，保存配置、logger、consul 句柄等 | 初始化 Client 实例 |
| L375-L400 | 设置 RPC 客户端（`RPCClient`），连接到 Server（通过 `retry_join` 配置的地址） | 建立 RPC 通道 |
| L400-L450 | 初始化指纹采集（`FingerprintManager`）、插件管理器、CSI 管理器 | 加载硬件/驱动/设备插件 |
| L450-L500 | 初始化分配运行器（`AllocRunner`）、任务运行器（`TaskRunner`）工厂 | 准备任务执行框架 |
| L500-L550 | 初始化状态数据库（BoltDB）、节点心跳、服务注册 | 持久化与注册 |
| L550-L600 | 启动后台 goroutine：心跳、指纹采集、分配回收、节点状态上报 | 长运行任务 |
| L600-L676 | 启动 Client 主循环、注册信号处理、返回 Client 实例 | 完成 Client 启动 |

> **说明**：以上行号为概略区间，具体子调用包括：
> - 指纹采集：`client/fingerprint/` 包，采集 CPU/内存/磁盘/网络/OS/主机名等
> - 插件加载：`client/pluginmanager/` 包，加载任务驱动（raw_exec 等）、设备插件、CSI 插件
> - 状态持久化：`client/state/bolt_state.go`，BoltDB 存储
> - 服务注册：`client/serviceregistration/` 包，注册到 Consul
> - 分配运行：`client/allocrunner/` 包，管理分配生命周期

---

## 7. Retry Join 流程（[command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) 和 [command/agent/retry_join.go](file:///d:/claude/nomad/command/agent/retry_join.go)）

### 7.1 `handleRetryJoin()` 方法（[command/agent/command.go L966-L1032](file:///d:/claude/nomad/command/agent/command.go#L966)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L966 | `func (c *Command) handleRetryJoin(config *Config) error {` | retry join 入口 |
| L967 | `c.retryJoinErrCh = make(chan struct{})` | 创建错误通知通道 |
| L969-L992 | `if config.Server.Enabled && len(config.Server.RetryJoin) != 0 { ... }` | 处理已弃用的 `server.retry_join` 字段（当前配置未启用 server，跳过） |
| L994-L1011 | `if config.Server.Enabled && config.Server.ServerJoin != nil && len(config.Server.ServerJoin.RetryJoin) != 0 { ... go joiner.RetryJoin() }` | Server 模式 retry join（当前配置未启用 server，跳过） |
| **L1013-L1029** | `if config.Client.Enabled && config.Client.ServerJoin != nil && len(config.Client.ServerJoin.RetryJoin) != 0 { ... }` | **关键分支**：Client 模式 retry join（当前配置 `client.server_join.retry_join = ["x.x.x.x"]` 匹配此分支） |
| L1016-L1022 | `joiner := retryJoiner{ autoDiscover: ..., errCh: c.retryJoinErrCh, joinCfg: config.Client.ServerJoin, joinFunc: c.agent.client.SetServers, logger: ... }` | 构造 retryJoiner，**关键**：`joinFunc` 设为 `c.agent.client.SetServers`（Client 侧通过 RPC 设置 Server 列表） |
| L1024-L1026 | `if err := joiner.Validate(config); err != nil { return err }` | 校验配置（`start_join` 不能用于 client） |
| **L1028** | `go joiner.RetryJoin()` | **关键调用**：启动 goroutine 执行 retry join（详见 7.3） |
| L1031 | `return nil` | 返回成功 |

### 7.2 `retryJoiner.Validate()` 方法（[command/agent/retry_join.go L124-L156](file:///d:/claude/nomad/command/agent/retry_join.go#L124)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L124 | `func (r *retryJoiner) Validate(config *Config) error {` | 校验入口 |
| L127-L145 | `if config.Server != nil && ... { ... }` | Server 侧校验：`server_join` 与 `retry_join`/`start_join`/`retry_max`/`retry_interval` 互斥 |
| L149-L153 | `if config.Client != nil && config.Client.ServerJoin != nil { if config.Client.ServerJoin.StartJoin != nil { return fmt.Errorf("start_join is not supported for Nomad clients") } }` | Client 侧校验：不支持 `start_join`（当前配置仅 `retry_join`，通过） |
| L155 | `return nil` | 校验通过 |

### 7.3 `retryJoiner.RetryJoin()` 方法（[command/agent/retry_join.go L160-L210](file:///d:/claude/nomad/command/agent/retry_join.go#L160)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L160 | `func (r *retryJoiner) RetryJoin() {` | retry join 主循环（goroutine 内执行） |
| L161-L163 | `if len(r.joinCfg.RetryJoin) == 0 { return }` | 无待加入地址则退出（当前配置有 `["x.x.x.x"]`，继续） |
| L165 | `attempt := 0` | 重试计数器 |
| L167 | `addrsToJoin := strings.Join(r.joinCfg.RetryJoin, " ")` | 拼接地址字符串用于日志 |
| L168 | `r.logger.Info("starting retry join", "servers", addrsToJoin)` | 日志：开始 retry join |
| L170 | `for { ... }` | 无限重试循环 |
| L176-L187 | `for _, addr := range r.joinCfg.RetryJoin { servers, err := r.autoDiscover.Addrs(addr, r.logger); addrs = append(addrs, servers...) }` | 遍历每个地址，通过 autoDiscover 解析（支持 `exec=`/`provider=` 前缀；当前配置为纯 IP，直接返回） |
| **L189-L196** | `if len(addrs) > 0 && r.joinFunc != nil { numJoined, err := r.joinFunc(addrs); if err == nil { r.logger.Info("retry join completed", ...); return } }` | **关键调用**：调用 `c.agent.client.SetServers(addrs)`（[client/client.go L1286](file:///d:/claude/nomad/client/client.go#L1286)）通过 RPC 将 Server 地址列表设置到 Client，成功则返回 |
| L198-L200 | `if err != nil { r.logger.Warn("join failed", "error", err, "retry", r.joinCfg.RetryInterval) }` | 失败日志 |
| L202-L207 | `attempt++; if r.joinCfg.RetryMaxAttempts > 0 && attempt > r.joinCfg.RetryMaxAttempts { r.logger.Error("max join retry exhausted, exiting"); close(r.errCh); return }` | 超过最大重试次数则关闭 errCh 通知主循环退出（当前配置 `retry_max` 未设置，默认 0 表示无限重试） |
| L209 | `time.Sleep(r.joinCfg.RetryInterval)` | 等待重试间隔后继续 |

### 7.4 `autoDiscover.Addrs()` 方法（[command/agent/retry_join.go L81-L96](file:///d:/claude/nomad/command/agent/retry_join.go#L81)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L81 | `func (d autoDiscover) Addrs(cfg string, logger log.Logger) (addrs []string, err error) {` | 地址解析入口 |
| L84-L88 | `case strings.HasPrefix(cfg, "exec="):` | `exec=` 前缀：执行命令获取 IP |
| L89-L90 | `case strings.HasPrefix(cfg, "provider="):` | `provider=` 前缀：使用 go-discover 云厂商自动发现 |
| **L91-L92** | `default: return []string{cfg}, err` | **当前配置走此分支**：纯 IP 地址直接返回 `["x.x.x.x"]` |

### 7.5 Client 侧 `SetServers()`（[client/client.go L1286](file:///d:/claude/nomad/client/client.go#L1286)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1286 | `func (c *Client) SetServers(in []string) (int, error) {` | Client 设置 Server 列表入口 |
| - | 内部通过 RPC 调用 Server 的 `ClientRPC`，更新 Client 本地的 Server 地址池 | 后续 Client 通过该地址池发起 RPC 请求（如获取分配、上报状态） |

---

## 8. 信号处理与退出（[command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go)）

### 8.1 `handleSignals()` 方法（[command/agent/command.go L1090-L1159](file:///d:/claude/nomad/command/agent/command.go#L1090)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1090 | `func (c *Command) handleSignals() int {` | 信号处理主入口（阻塞运行） |
| L1091 | `signalCh := make(chan os.Signal, 4)` | 创建信号通道（缓冲 4） |
| L1092 | `defer signal.Stop(signalCh)` | defer 解除信号注册 |
| **L1094** | `signal.Notify(signalCh, syscall.SIGINT, syscall.SIGTERM, syscall.SIGHUP, syscall.SIGPIPE)` | **关键**：注册关注的信号：SIGINT（Ctrl+C）、SIGTERM（kill）、SIGHUP（热重载）、SIGPIPE（忽略） |
| L1097-L1100 | `sdSock, err := openNotify(); if err != nil { ... }` | 打开 systemd notify socket（非 systemd 环境为空） |
| L1105 | `sdNotify(sdSock, sdReady)` | 通知 systemd 服务就绪 |
| **L1107-L1158** | `for { select { ... } }` | **关键主循环**：阻塞等待信号 |
| L1109-L1113 | `case sig := <-signalCh: if sig == syscall.SIGPIPE { continue }` | 收到信号：忽略 SIGPIPE |
| L1115 | `c.Ui.Output(fmt.Sprintf("Caught signal: %v", sig))` | 输出信号信息 |
| **L1118-L1126** | `case syscall.SIGHUP: sdNotifyReloading(sdSock); err := c.handleReload(); if err != nil { ... return 1 }; sdNotify(sdSock, sdReady)` | **SIGHUP 处理**：触发配置热重载（重新读取配置文件、重载 Agent/Server/Client/HTTP） |
| **L1127-L1132** | `case syscall.SIGTERM: if !c.agent.GetConfig().LeaveOnTerm { return 1 }; return c.terminateGracefully(signalCh, sdSock)` | **SIGTERM 处理**：根据 `LeaveOnTerm` 决定是否优雅退出 |
| **L1133-L1138** | `case syscall.SIGINT: if !c.agent.GetConfig().LeaveOnInt { return 1 }; return c.terminateGracefully(signalCh, sdSock)` | **SIGINT 处理**：根据 `LeaveOnInt` 决定是否优雅退出（Ctrl+C 触发） |
| L1141-L1146 | `case <-winsvc.ShutdownChannel(): ...` | Windows 服务停止信号 |
| L1148-L1153 | `case <-c.ShutdownCh: ...` | 内部关闭信号（如 `nomad agent` 被父进程关闭） |
| L1155-L1156 | `case <-c.retryJoinErrCh: return 1` | retry join 耗尽重试次数，退出码 1 |

### 8.2 `terminateGracefully()` 方法（[command/agent/command.go L1035-L1087](file:///d:/claude/nomad/command/agent/command.go#L1035)）

| 行号 | 语句 | 用途说明 |
|------|------|---------|
| L1035 | `func (c *Command) terminateGracefully(signalCh chan os.Signal, sdSock io.Writer) int {` | 优雅退出入口 |
| L1036 | `sdNotify(sdSock, sdStopping)` | 通知 systemd 正在停止 |
| L1038-L1040 | `gracefulCh := make(chan struct{}); gracefulClose := sync.OnceFunc(func() { close(gracefulCh) }); defer gracefulClose()` | 创建优雅退出完成信号 |
| L1042 | `timeout := gracefulTimeout` | 退出超时时间 |
| L1044-L1080 | `if c.agent.client != nil { ... c.agent.Leave() ... }` | Client 侧：从集群离开、停止分配、关闭连接 |
| - | 最终调用 `c.agent.Shutdown()` | 关闭 Agent（含 Client/Server） |

---

## 9. 完整调用链时序图

```
用户执行: nomad agent -config=etc/nomad.d/nomad.hcl
│
├─ main.go:82           os.Exit(Run(os.Args[1:]))
│   │
├─ main.go:86-119       Run(args)
│   ├─ L87              new(command.Meta)
│   ├─ L88              metaPtr.SetupUi(args)
│   ├─ L97              command.Commands(metaPtr, agentUi)          ← 注册 "agent" 命令
│   │   └─ commands.go:308-314  返回 &agent.Command{...}
│   ├─ L98-110          创建 cli.CLI
│   └─ L112             cli.Run()                                   ← 匹配 "agent" 并调用其 Run
│       │
├─ command.go:817-963   Command.Run(args)
│   ├─ L827             readConfig()                                ← 读取配置
│   │   ├─ L128         flags.Var("-config", &configPath)           ← 解析 -config 参数
│   │   ├─ L270-289     for path in configPath: LoadConfig(path)
│   │   │   ├─ config.go:3242-3260  LoadConfig(path)
│   │   │   │   ├─ L3248     if IsDir: LoadConfigDir
│   │   │   │   └─ L3253     ParseConfigFile(cleaned)
│   │   │   │       └─ config_parse.go:27-280
│   │   │   │           ├─ L36-43   os.Open + io.Copy              ← 读取 HCL 文件
│   │   │   │           ├─ L72      hcl.Decode(c, buf.String())     ← HCL 解码到 Config
│   │   │   │           ├─ L79      hcl.Parse                       ← 二次解析 AST
│   │   │   │           ├─ L87-104  parseVaults/parseConsuls/parseKeyringConfigs
│   │   │   │           ├─ L265     convertDurations
│   │   │   │           └─ L271     extraKeys
│   │   │   └─ config.go:1961       config.Merge(current)
│   │   ├─ L301         config = config.Merge(cmdConfig)            ← CLI 参数最后合并
│   │   ├─ L307         config.normalizeAddrs()
│   │   └─ L335         IsValidConfig(config)
│   │
│   ├─ L842             SetupLoggers(c.Ui, config)                  ← 日志设置
│   ├─ L848-854         hclog.NewInterceptLogger(...)               ← 创建 logger
│   ├─ L858-863         log.SetOutput(...)                          ← 重定向标准 log
│   ├─ L880             setupTelemetry(config)                      ← 遥测初始化
│   │
│   ├─ L887             setupAgent(config, logger, logOutput, inmem)
│   │   │
│   │   ├─ command.go:669-719  setupAgent
│   │   │   ├─ L672     NewAgent(config, logger, logOutput, inmem)
│   │   │   │   │
│   │   │   │   ├─ agent.go:150-195  NewAgent
│   │   │   │   │   ├─ L165     setupConsuls(config.Consuls)        ← Consul 客户端初始化
│   │   │   │   │   ├─ L169     setupServer()                       ← 当前配置未启用 server，直接返回
│   │   │   │   │   │   └─ agent.go:1176-1178  if !Enabled { return nil }
│   │   │   │   │   ├─ L172     setupClient()                       ← ★ 创建 Client
│   │   │   │   │   │   │
│   │   │   │   │   │   ├─ agent.go:1356-1425  setupClient
│   │   │   │   │   │   │   ├─ L1357   if !Client.Enabled { return } ← true，继续
│   │   │   │   │   │   │   ├─ L1364   setupPlugins()               ← 加载插件（raw_exec 等）
│   │   │   │   │   │   │   ├─ L1369   clientConfig()                ← 构造 client.Config
│   │   │   │   │   │   │   ├─ L1381   StateDBFactory = GetStateDBFactory
│   │   │   │   │   │   │   ├─ L1388   builtinListener, builtinDialer = bufconndialer.New()
│   │   │   │   │   │   │   ├─ L1393   taskAPIServer = newBuiltinAPI()
│   │   │   │   │   │   │   └─ L1396   client.NewClient(conf, ...)  ← ★ 创建 Client 实例
│   │   │   │   │   │   │       │
│   │   │   │   │   │   │       └─ client.go:361-676  NewClient
│   │   │   │   │   │   │           ├─ 设置 RPC 客户端（连接 Server）
│   │   │   │   │   │   │           ├─ 初始化指纹采集（CPU/内存/磁盘/网络）
│   │   │   │   │   │   │           ├─ 加载任务驱动插件（raw_exec）
│   │   │   │   │   │   │           ├─ 初始化状态数据库（BoltDB）
│   │   │   │   │   │   │           ├─ 注册服务到 Consul
│   │   │   │   │   │   │           ├─ 启动心跳 goroutine
│   │   │   │   │   │   │           └─ 启动分配监听 goroutine
│   │   │   │   │   │   │
│   │   │   │   │   │   └─ L1405   a.client = nomadClient
│   │   │   │   │   │
│   │   │   │   │   ├─ L176     setupEnterpriseAgent(logger)        ← CE 版空操作
│   │   │   │   │   ├─ L179     校验 client/server 至少一个
│   │   │   │   │   └─ L185     TLS metrics（当前配置无 TLS，跳过）
│   │   │   │   │
│   │   │   │   └─ 返回 Agent
│   │   │   │
│   │   │   ├─ L685     NewHTTPServers(agent, config)               ← 启动 HTTP API 服务器
│   │   │   └─ L695-716 checkpoint.CheckInterval(...)               ← 版本更新检查
│   │   │
│   │   └─ 返回
│   │
│   ├─ L905             startupJoin(config)                         ← start_join（当前配置无，空操作）
│   ├─ L911-943         输出 Agent 配置摘要
│   ├─ L946             输出 "Nomad agent started!"
│   ├─ L952             handleRetryJoin(config)                     ← ★ 启动 retry join
│   │   │
│   │   ├─ command.go:966-1032  handleRetryJoin
│   │   │   ├─ L969     Server 分支（当前配置未启用，跳过）
│   │   │   ├─ L1013    Client 分支 ★（匹配 client.server_join.retry_join）
│   │   │   ├─ L1016-1022 构造 retryJoiner{ joinFunc: c.agent.client.SetServers }
│   │   │   ├─ L1024    joiner.Validate(config)
│   │   │   └─ L1028    go joiner.RetryJoin()                       ← 启动 goroutine
│   │   │       │
│   │   │       └─ retry_join.go:160-210  RetryJoin
│   │   │           ├─ L167    addrsToJoin = "x.x.x.x"
│   │   │           ├─ L170    for { ... } 无限重试
│   │   │           ├─ L176    autoDiscover.Addrs("x.x.x.x")        ← 返回 ["x.x.x.x"]
│   │   │           ├─ L189    joinFunc(addrs)                      ← client.SetServers(["x.x.x.x"])
│   │   │           │           └─ client.go:1286  通过 RPC 设置 Server 列表
│   │   │           └─ L209    失败则 sleep(RetryInterval) 重试
│   │   │
│   │   └─ 返回
│   │
│   ├─ L958             winsvc.SendEvent(EventServiceReady)
│   └─ L962             handleSignals()                              ← ★ 阻塞等待信号
│       │
│       ├─ command.go:1090-1159  handleSignals
│       │   ├─ L1094    signal.Notify(SIGINT, SIGTERM, SIGHUP, SIGPIPE)
│       │   ├─ L1105    sdNotify(sdReady)
│       │   └─ L1107    for { select { ... } }                      ← 阻塞主循环
│       │       ├─ SIGHUP  → handleReload()                         ← 热重载配置
│       │       ├─ SIGTERM → terminateGracefully()                  ← 优雅退出
│       │       ├─ SIGINT  → terminateGracefully()                  ← Ctrl+C 退出
│       │       └─ retryJoinErrCh → return 1                        ← retry join 失败退出
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
| 命令注册 `Commands()` | [command/commands.go](file:///d:/claude/nomad/command/commands.go) | L68-L1428 |
| `agent` 命令注册 | [command/commands.go](file:///d:/claude/nomad/command/commands.go) | L308-L314 |
| Agent 命令结构体 | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L49-L62 |
| Agent `Run()` 方法 | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L817-L963 |

### 10.2 配置加载

| 功能 | 文件 | 行号 |
|------|------|------|
| `readConfig()` | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L64-L340 |
| `-config` flag 注册 | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L128 |
| `LoadConfig()` | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L3242-L3260 |
| `LoadConfigDir()` | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L3264+ |
| `ParseConfigFile()` | [command/agent/config_parse.go](file:///d:/claude/nomad/command/agent/config_parse.go) | L27-L280 |
| HCL 解码 | [command/agent/config_parse.go](file:///d:/claude/nomad/command/agent/config_parse.go) | L72 |
| `DefaultConfig()` | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L1816+ |
| `(*Config) Merge()` | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L1961+ |

### 10.3 Agent 创建

| 功能 | 文件 | 行号 |
|------|------|------|
| `setupAgent()` | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L669-L719 |
| `NewAgent()` | [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | L150-L195 |
| `setupServer()` | [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | L1175-L1354 |
| `setupClient()` | [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | L1356-L1425 |
| `setupConsuls()` | [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | L165 调用 |
| `setupPlugins()` | [command/agent/agent.go](file:///d:/claude/nomad/command/agent/agent.go) | L1364 调用 |
| `NewHTTPServers()` | [command/agent/http.go](file:///d:/claude/nomad/command/agent/http.go) | - |

### 10.4 Server/Client 创建

| 功能 | 文件 | 行号 |
|------|------|------|
| `nomad.NewServer()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L336-L586 |
| `client.NewClient()` | [client/client.go](file:///d:/claude/nomad/client/client.go) | L361-L676 |
| `Client.SetServers()` | [client/client.go](file:///d:/claude/nomad/client/client.go) | L1286 |
| `Server.Join()` | [nomad/server.go](file:///d:/claude/nomad/nomad/server.go) | L2079 |

### 10.5 Retry Join

| 功能 | 文件 | 行号 |
|------|------|------|
| `handleRetryJoin()` | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L966-L1032 |
| `retryJoiner.Validate()` | [command/agent/retry_join.go](file:///d:/claude/nomad/command/agent/retry_join.go) | L124-L156 |
| `retryJoiner.RetryJoin()` | [command/agent/retry_join.go](file:///d:/claude/nomad/command/agent/retry_join.go) | L160-L210 |
| `autoDiscover.Addrs()` | [command/agent/retry_join.go](file:///d:/claude/nomad/command/agent/retry_join.go) | L81-L96 |
| `startupJoin()` | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L1418+ |

### 10.6 信号处理

| 功能 | 文件 | 行号 |
|------|------|------|
| `handleSignals()` | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L1090-L1159 |
| `signal.Notify` 注册 | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L1094 |
| `terminateGracefully()` | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L1035-L1087 |
| `handleReload()` | [command/agent/command.go](file:///d:/claude/nomad/command/agent/command.go) | L1182-L1268 |

### 10.7 配置字段定义

| 功能 | 文件 | 行号 |
|------|------|------|
| `Client.ServerJoin.RetryJoin` | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L1277-L1279 |
| `Server.ServerJoin.RetryJoin` | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | L671-L673 |
| `ClientConfig` 结构体 | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | - |
| `ServerConfig` 结构体 | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | - |
| `Config` 主结构体 | [command/agent/config.go](file:///d:/claude/nomad/command/agent/config.go) | - |

---

## 11. 执行流程要点总结

### 11.1 当前配置（仅 client 模式）的关键执行路径

1. **入口**：`main.go:82` → `Run()` → `cli.Run()` 匹配 `agent` 命令
2. **配置加载**：`command.go:827` `readConfig()` → `LoadConfig("etc/nomad.d/nomad.hcl")` → `ParseConfigFile` → `hcl.Decode` 解析 HCL
3. **配置合并**：默认配置 → 企业版配置 → HCL 文件配置 → CLI 参数（优先级递增）
4. **Agent 创建**：`command.go:887` `setupAgent` → `agent.go:150` `NewAgent`
5. **Server 跳过**：`agent.go:1176` `if !Server.Enabled { return nil }`（当前配置未启用 server）
6. **Client 创建**：`agent.go:1356` `setupClient` → `agent.go:1396` `client.NewClient(conf, ...)`
   - 加载插件（raw_exec 等）
   - 初始化指纹采集、状态数据库（BoltDB）、服务注册
   - 启动心跳、分配监听等 goroutine
7. **HTTP 服务器**：`command.go:685` `NewHTTPServers` 监听 `addresses.http = 0.0.0.0`
8. **Retry Join**：`command.go:952` `handleRetryJoin` → `command.go:1028` `go joiner.RetryJoin()`
   - Client 模式：`joinFunc = c.agent.client.SetServers`
   - 通过 RPC 将 `["x.x.x.x"]` 设置为 Server 地址列表
   - 失败则按 `RetryInterval` 无限重试（`RetryMaxAttempts` 未设置）
9. **信号等待**：`command.go:962` `handleSignals()` 阻塞
   - SIGHUP → 热重载配置
   - SIGINT/SIGTERM → 优雅退出（Leave + Shutdown）

### 11.2 关键设计要点

- **插件侧载机制**：`main.go:19-23` 通过空导入 `getter/renderer/logmon/docklog/executor`，这些包的 `init()` 会检测 `os.Args` 并直接进入子进程逻辑，避免主进程加载多余代码
- **配置合并优先级**：CLI > HCL 文件 > 企业版默认 > 基础默认，确保命令行参数可覆盖文件配置
- **Client/Server 解耦**：`NewAgent` 顺序调用 `setupServer` 和 `setupClient`，各自根据 `Enabled` 开关短路返回，支持单 Server、单 Client、Server+Client 三种模式
- **内置 API 通道**：`agent.go:1388` `bufconndialer.New()` 创建内存 listener/dialer，让 consul-template 无需走网络即可调用 Nomad API
- **Retry Join 双模式**：Server 侧 `joinFunc = server.Join`（Serf 成员加入），Client 侧 `joinFunc = client.SetServers`（RPC 设置 Server 列表）
- **优雅退出**：`LeaveOnTerm`/`LeaveOnInt` 控制是否优雅退出，`terminateGracefully` 先 Leave 再 Shutdown
