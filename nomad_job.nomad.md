# Nomad job.nomad 解析及处理逻辑分析

本文档详细分析 Nomad 中 `job.nomad` 文件的完整生命周期：从 CLI 解析、HTTP 提交、Server 端验证/突变/持久化，到最终触发调度的全过程。

## 概述

`job.nomad` 是 Nomad 的工作负载声明文件（Job Specification），使用 HCL2 或 JSON 格式编写。它的处理流程涉及多个组件：

```
job.nomad 文件
    │
    ▼
[1] CLI 解析（jobspec2 包，本地）
    │   HCL2 → api.Job 结构
    ▼
[2] HTTP API 提交（api.Jobs.RegisterOpts）
    │   PUT /v1/jobs
    ▼
[3] Agent HTTP 端点（command/agent/job_endpoint.go）
    │   api.Job → structs.Job + JobSubmission
    ▼
[4] Server RPC 处理（nomad/job_endpoint.go）
    │   Job.Register RPC
    ▼
[5] 准入控制（Admission Controllers）
    │   Mutators（突变）+ Validators（校验）
    ▼
[6] Raft 持久化（state.UpsertJob）
    │   job + submission + eval
    ▼
[7] 调度器触发（scheduler 包）
    │   根据 eval 创建 allocations
    ▼
[8] Client 执行（allocrunner/taskrunner）
    │   下载 artifact + 拉取镜像 + 启动任务
```

---

## 一、CLI 端解析（jobspec2 包）

### 1.1 入口：JobGetter.Get()

文件：[command/helpers.go:472](file:///d:/claude/nomad/command/helpers.go#L472)

`nomad job run` 命令通过 `JobGetter.Get(jpath)` 加载和解析 job 文件：

```go
func (j *JobGetter) Get(jpath string) (*api.JobSubmission, *api.Job, error) {
    // 1. 读取文件（支持 stdin "-"、本地文件、go-getter 源如 git/s3）
    // 2. 根据 j.JSON 标志选择解析路径
    switch {
    case j.JSON:
        // JSON 直接 json.Decode
    default:
        // HCL2 走 jobspec2.ParseWithConfigEx
        parseResult, err := jobspec2.ParseWithConfigEx(&jobspec2.ParseConfig{
            Path:     pathName,
            Body:     source.Bytes(),
            ArgVars:  j.Vars,       // -var 参数
            AllowFS:  true,         // 允许文件系统访问（如 file() 函数）
            VarFiles: j.VarFiles,   // -var-file 参数
            Envs:     os.Environ(), // 环境变量 NOMAD_VAR_*
            Strict:   j.Strict,     // 严格模式
        })
    }
}
```

### 1.2 文件读取

支持多种来源（通过 go-getter）：
- **本地文件**：`/path/to/job.nomad`
- **标准输入**：`-`（从 stdin 读取）
- **远程源**：`git::https://github.com/org/repo//job.nomad`、`s3::https://...`

### 1.3 格式判断

文件：[jobspec2/parse.go:241](file:///d:/claude/nomad/jobspec2/parse.go#L241)

```go
func isJSON(src []byte) bool {
    for _, c := range src {
        if c == ' ' { continue }
        return c == '{'  // 首个非空字符为 { 则视为 JSON
    }
    return false
}

func parseHCLOrJSON(src []byte, filename string) (*hcl.File, hcl.Diagnostics) {
    if isJSON(src) {
        return hcljson.Parse(src, filename)
    }
    return hclsyntax.ParseConfig(src, filename, hcl.Pos{Line: 1, Column: 1})
}
```

---

## 二、HCL2 解析详解（jobspec2 包）

### 2.1 ParseConfig 结构

文件：[jobspec2/parse.go:115](file:///d:/claude/nomad/jobspec2/parse.go#L115)

```go
type ParseConfig struct {
    Path       string   // 文件路径
    BaseDir    string   // 基础目录（用于相对路径解析）
    Body       []byte   // HCL/JSON 内容
    AllowFS    bool     // 是否允许文件系统函数
    ArgVars    []string // -var "key=val" 参数
    VarFiles   []string // -var-file 文件路径
    VarContent string   // 直接传入的变量内容
    Envs       []string // 环境变量
    Strict     bool     // 严格模式（禁止未声明变量）
}
```

### 2.2 解析流程

文件：[jobspec2/parse.go:96](file:///d:/claude/nomad/jobspec2/parse.go#L96)

```go
func parseWithConfigImpl(args *ParseConfig) (*jobConfig, error) {
    args.normalize()
    c := newJobConfig(args)
    err := decode(c)           // 核心：HCL → jobConfig
    normalizeJob(c)            // 归一化（设置默认值、分离 task 等）
    return c, nil
}
```

### 2.3 decode 函数详解

文件：[jobspec2/parse.go:139](file:///d:/claude/nomad/jobspec2/parse.go#L139)

```go
func decode(c *jobConfig) error {
    // 1. 解析 HCL/JSON 文件为 HCL AST
    file, diags := parseHCLOrJSON(config.Body, config.Path)

    // 2. 解析变量文件（-var-file）
    for _, varFile := range config.VarFiles {
        parsedVarFile, ds := parseFile(varFile)
        config.parsedVarFiles = append(config.parsedVarFiles, parsedVarFile)
    }

    // 3. 解析变量内容（VarContent）
    if config.VarContent != "" {
        hclFile, _ := parseHCLOrJSON([]byte(config.VarContent), "input.hcl")
        config.parsedVarFiles = append(config.parsedVarFiles, hclFile)
    }

    // 4. 解码 body（核心步骤）
    diags = append(diags, c.decodeBody(file.Body)...)

    // 5. 处理 map[string]interface{} 类型字段（Meta 等）
    diags = append(diags, decodeMapInterfaceType(&c.Job, c.EvalContext())...)
    diags = append(diags, decodeMapInterfaceType(&c.Tasks, c.EvalContext())...)
    diags = append(diags, decodeMapInterfaceType(&c.Vault, c.EvalContext())...)
    diags = append(diags, decodeMapInterfaceType(&c.Secrets, c.EvalContext())...)

    return nil
}
```

### 2.4 decodeBody：变量和 Job 解码

文件：[jobspec2/types.config.go:62](file:///d:/claude/nomad/jobspec2/types.config.go#L62)

`jobConfig` 的 schema 定义了顶级允许的 block 类型：

```go
var jobConfigSchema = &hcl.BodySchema{
    Blocks: []hcl.BlockHeaderSchema{
        {Type: "variables"},                            // variables 块
        {Type: "variable", LabelNames: []string{"name"}}, // variable 块
        {Type: "locals"},                               // locals 块
        {Type: "job", LabelNames: []string{"name"}},    // job 块
    },
}
```

解码顺序（**关键**）：

```go
func (c *jobConfig) decodeBody(body hcl.Body) hcl.Diagnostics {
    content, diags := body.Content(jobConfigSchema)

    // ① 解码输入变量（variable / variables 块）
    diags = append(diags, c.decodeInputVariables(content)...)

    // ② 解析局部变量（locals 块）
    diags = append(diags, c.parseLocalVariables(content)...)

    // ③ 收集变量值（环境变量 + -var + -var-file）
    diags = append(diags, c.collectInputVariableValues(...)...)

    // ④ 计算变量值（类型检查、默认值）
    _, moreDiags := c.InputVariables.Values()
    _, moreDiags = c.LocalVariables.Values()

    // ⑤ 求值局部变量（处理 locals 间的依赖）
    diags = append(diags, c.evaluateLocalVariables(c.LocalBlocks)...)

    // ⑥ 构建 EvalContext（var.X / local.Y 可用）
    nctx := c.EvalContext()

    // ⑦ 解码 job 块（核心）
    diags = append(diags, c.decodeJob(content, nctx)...)

    return diags
}
```

### 2.5 变量解析

#### variable 块（声明变量）

```hcl
variable "image_tag" {
    type        = string
    default     = "latest"
    description = "Docker image tag"
    sensitive   = false
}
```

- 通过 `c.InputVariables.decodeVariableBlock()` 解析
- 支持 `type`、`default`、`description`、`sensitive` 字段
- 类型支持：string、number、bool、list(...)、set(...)、map(...)、object(...)、tuple(...)

#### variables 块（简写形式）

```hcl
variables {
    image_tag = "latest"
    replicas  = 3
}
```

- 通过 `block.Body.JustAttributes()` 提取属性
- 自动推断类型，无 type/default/description

#### locals 块（局部变量）

```hcl
locals {
    full_image = "nginx:${var.image_tag}"
    port       = 8080
}
```

- 通过 `evaluateLocalVariables()` 处理 locals 间的依赖
- 支持循环依赖检测（最多 100 次重试）

#### 变量值优先级（从高到低）

1. `-var` 命令行参数
2. `-var-file` 文件
3. `NOMAD_VAR_*` 环境变量
4. `variable` 块的 `default` 默认值

### 2.6 EvalContext 构建

文件：[jobspec2/types.config.go:347](file:///d:/claude/nomad/jobspec2/types.config.go#L347)

```go
func (c *jobConfig) EvalContext() *hcl.EvalContext {
    vars, _ := c.InputVariables.Values()
    locals, _ := c.LocalVariables.Values()
    return &hcl.EvalContext{
        Functions: Functions(c.ParseConfig.BaseDir, c.ParseConfig.AllowFS),
        Variables: map[string]cty.Value{
            "var":   cty.ObjectVal(vars),    // var.X 访问输入变量
            "local": cty.ObjectVal(locals),  // local.Y 访问局部变量
        },
        UndefinedVariable: func(t hcl.Traversal) (cty.Value, hcl.Diagnostics) {
            // 未定义变量处理（用于 ${...} 字符串插值保留）
        },
    }
}
```

支持的 HCL 函数（[jobspec2/functions.go](file:///d:/claude/nomad/jobspec2/functions.go)）：
- 字符串：`upper`、`lower`、`trim`、`trimspace`、`split`、`join`、`replace`、`substr`、`format`、`formatlist`、`regex`、`regexall`
- 集合：`compact`、`distinct`、`flatten`、`keys`、`values`、`merge`、`zipmap`、`contains`、`element`、`lookup`、`coalesce`、`coalescelist`
- 数值：`abs`、`ceil`、`floor`、`max`、`min`、`pow`、`log`、`parseint`
- 文件：`file`、`fileset`、`fileexists`、`basename`、`dirname`、`pathexpand`、`absdir`（需 `AllowFS`）
- 日期：`formatdate`、`timeadd`、`timecmp`、`timestamp`
- 类型：`tostring`、`tonumber`、`tobool`、`tolist`、`toset`、`tomap`、`can`、`try`、`typeconvert`

### 2.7 decodeJob：Job 块解码

文件：[jobspec2/types.config.go:296](file:///d:/claude/nomad/jobspec2/types.config.go#L296)

```go
func (c *jobConfig) decodeJob(content *hcl.BodyContent, ctx *hcl.EvalContext) hcl.Diagnostics {
    c.Job = &api.Job{}

    for _, b := range content.Blocks {
        if b.Type != "job" { continue }

        // 1. 处理动态块（for/each 展开动态 block）
        body := hclutil.BlocksAsAttrs(b.Body)
        body = dynblock.Expand(body, ctx)

        // 2. 提取 job ID（label）
        c.JobID = b.Labels[0]

        // 3. 单独处理 meta 属性（map[string]string）
        metaAttr, body, _ := decodeAsAttribute(body, ctx, "meta")

        // 4. 分离顶级 vault/secret/task 块（兼容历史）
        extra, remain, _ := body.PartialContent(&hcl.BodySchema{
            Blocks: []hcl.BlockHeaderSchema{
                {Type: "vault"},
                {Type: "secret", LabelNames: []string{"name"}},
                {Type: "task", LabelNames: []string{"name"}},
            },
        })

        // 5. 解码顶级 vault/secret/task
        diags = append(diags, c.decodeTopLevelExtras(extra, ctx)...)

        // 6. 解码剩余 job 字段（用 hclDecoder）
        diags = append(diags, hclDecoder.DecodeBody(remain, ctx, c.Job)...)

        // 7. 设置 meta
        if metaAttr != nil { c.Job.Meta = metaAttr }
    }
}
```

### 2.8 自定义 Decoder

文件：[jobspec2/hcl_conversions.go:25](file:///d:/claude/nomad/jobspec2/hcl_conversions.go#L25)

```go
func init() {
    hclDecoder = newHCLDecoder()
    // 注册 TaskGroup 自定义解码器（处理内联 task）
    hclDecoder.RegisterBlockDecoder(reflect.TypeOf(api.TaskGroup{}), decodeTaskGroup)
    // 注册 Task 自定义解码器（处理 driver config 的 map[string]interface{}）
    hclDecoder.RegisterBlockDecoder(reflect.TypeOf(api.Task{}), decodeTask)

    // 注册 time.Duration 解码器（支持 "5m" 字符串）
    hclDecoder.RegisterExpressionDecoder(reflect.TypeOf(d), decodeDuration)
    // 注册 Affinity / Constraint 解码器
    hclDecoder.RegisterBlockDecoder(reflect.TypeOf(api.Affinity{}), decodeAffinity)
    hclDecoder.RegisterBlockDecoder(reflect.TypeOf(api.Constraint{}), decodeConstraint)
}
```

### 2.9 normalizeJob：归一化

文件：[jobspec2/parse_job.go:8](file:///d:/claude/nomad/jobspec2/parse_job.go#L8)

```go
func normalizeJob(jc *jobConfig) {
    j := jc.Job

    // 1. 设置默认 Name/ID
    if j.Name == nil { j.Name = &jc.JobID }
    if j.ID == nil   { j.ID = &jc.JobID }

    // 2. Periodic 设置 SpecType
    if j.Periodic != nil && (j.Periodic.Spec != nil || j.Periodic.Specs != nil) {
        v := "cron"; j.Periodic.SpecType = &v
    }

    // 3. Vault 默认值
    normalizeVault(jc.Vault)

    // 4. 顶级 task 块包装为独立 TaskGroup
    if len(jc.Tasks) != 0 {
        alone := make([]*api.TaskGroup, 0, len(jc.Tasks))
        for _, t := range jc.Tasks {
            alone = append(alone, &api.TaskGroup{
                Name:  &t.Name,
                Tasks: []*api.Task{t},
            })
        }
        j.TaskGroups = append(alone, j.TaskGroups...)
    }

    // 5. 每个 task group 内的归一化
    for _, tg := range j.TaskGroups {
        normalizeNetworkPorts(tg.Networks)
        for _, t := range tg.Tasks {
            normalizeTemplates(t.Templates)
            normalizeVault(t.Vault)
            // 继承 job 级 vault / secrets
            if t.Vault == nil  { t.Vault = jc.Vault }
            if len(t.Secrets) == 0 {
                t.Secrets = jc.Secrets
            } else {
                t.Secrets = append(t.Secrets, jc.Secrets...)
            }
            // 兼容性：default identity 迁移到 Task.Identity
            ...
        }
    }
}
```

---

## 三、JobSubmission 构建

### 3.1 目的

`JobSubmission` 保存原始 HCL/JSON 源码和变量信息，用于：
- UI 中显示 job 原始定义
- `nomad job inspect` 输出 source
- 跨 region 同步原始定义（multiregion）

### 3.2 结构

文件：[api/jobs.go](file:///d:/claude/nomad/api/jobs.go)

```go
type JobSubmission struct {
    Source        string            // 原始 HCL/JSON 源码
    Format        string            // "hcl2" 或 "json"
    VariableFlags map[string]string // 简单类型变量（string/number/bool）
    Variables     string            // 复杂类型变量（HCL 格式）+ var-file 内容
}
```

### 3.3 submissionFromJob 流程

文件：[jobspec2/parse.go:206](file:///d:/claude/nomad/jobspec2/parse.go#L206)

```go
func submissionFromJob(args *ParseConfig, j *jobConfig) (*api.JobSubmission, error) {
    // 1. 判断格式
    format := formatHCL2
    if isJSON(args.Body) { format = formatJSON }

    // 2. 合并 -var-file 内容
    varFileCat, _ := extractVarFiles(args.VarFiles)

    // 3. 提取 -var 和 NOMAD_VAR_* 环境变量
    extractedVarFlags := extractVarFlags(args.ArgVars)
    extractedEnvVars := extractJobSpecEnvVars(args.Envs)
    maps.Copy(extractedEnvVars, extractedVarFlags) // -var 优先级更高

    // 4. 分离简单/复杂变量
    simpleVars, complexVarsHCL := separateVariables(extractedEnvVars, j.InputVariables)

    // 5. 合并复杂变量到 Variables 字段
    if varFileCat != "" && complexVarsHCL != "" {
        varFileCat = strings.TrimRight(varFileCat, "\n") + "\n\n" + complexVarsHCL
    }

    return &api.JobSubmission{
        Source:        string(args.Body),
        Format:        format,
        VariableFlags: simpleVars,
        Variables:     varFileCat,
    }, nil
}
```

---

## 四、HTTP API 提交

### 4.1 客户端调用

文件：[api/jobs.go:146](file:///d:/claude/nomad/api/jobs.go#L146)

```go
func (j *Jobs) RegisterOpts(job *Job, opts *RegisterOptions, q *WriteOptions) (*JobRegisterResponse, *WriteMeta, error) {
    req := &JobRegisterRequest{Job: job}
    if opts != nil {
        req.EnforceIndex      = opts.EnforceIndex
        req.JobModifyIndex    = opts.ModifyIndex
        req.PolicyOverride    = opts.PolicyOverride
        req.PreserveCounts    = opts.PreserveCounts
        req.PreserveResources = opts.PreserveResources
        req.EvalPriority      = opts.EvalPriority
        req.Submission        = opts.Submission
    }
    var resp JobRegisterResponse
    wm, err := j.client.put("/v1/jobs", req, &resp, q)
    return &resp, wm, err
}
```

### 4.2 RegisterOptions 字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `EnforceIndex` | bool | 乐观并发控制，强制检查 ModifyIndex |
| `ModifyIndex` | uint64 | 期望的当前 job 的 ModifyIndex |
| `PolicyOverride` | bool | 覆盖 Sentinel 策略 |
| `PreserveCounts` | bool | 更新时保留现有 count（忽略 jobspec 中的 count） |
| `PreserveResources` | bool | 更新时保留现有资源 |
| `EvalPriority` | int | 覆盖 eval 优先级 |
| `Submission` | *JobSubmission | 原始 HCL 源码和变量 |

### 4.3 Server API 端点（可选路径）

Nomad 还提供 `/v1/jobs/parse` 端点，让 Server 代为解析 HCL（用于 UI 等）：

文件：[command/agent/job_endpoint.go:932](file:///d:/claude/nomad/command/agent/job_endpoint.go#L932)

```go
func (s *HTTPServer) JobsParseRequest(resp http.ResponseWriter, req *http.Request) (interface{}, error) {
    args := &api.JobsParseRequest{}
    decodeBody(req, &args)

    // ACL 检查（ParseJob 或 SubmitJob 权限）
    if !allowed { return nil, structs.ErrPermissionDenied }

    // 在 agent 进程内调用 jobspec2 解析
    jobStruct, err := jobspec2.ParseWithConfig(&jobspec2.ParseConfig{
        Path:       "input.hcl",
        Body:       []byte(args.JobHCL),
        AllowFS:    false,  // Server 端不允许文件访问
        VarContent: args.Variables,
    })

    if args.Canonicalize {
        jobStruct.Canonicalize()
    }
    return jobStruct, nil
}
```

**注意**：`/v1/jobs/parse` 仅用于解析预览，**不持久化** job。注册 job 必须通过 `/v1/jobs`。

---

## 五、Agent HTTP 端点处理

### 5.1 路由

文件：[command/agent/job_endpoint.go:29](file:///d:/claude/nomad/command/agent/job_endpoint.go#L29)

```go
func (s *HTTPServer) JobsRequest(resp http.ResponseWriter, req *http.Request) (interface{}, error) {
    switch req.Method {
    case http.MethodGet:
        return s.jobListRequest(resp, req)
    case http.MethodPut, http.MethodPost:
        return s.jobUpdate(resp, req, "")  // ← 注册/更新 job
    }
}
```

### 5.2 jobUpdate：HTTP 请求转 RPC

文件：[command/agent/job_endpoint.go:556](file:///d:/claude/nomad/command/agent/job_endpoint.go#L556)

```go
func (s *HTTPServer) jobUpdate(resp http.ResponseWriter, req *http.Request, jobID string) (interface{}, error) {
    // 1. 解码请求体
    var args api.JobRegisterRequest
    decodeBody(req, &args)

    // 2. 基本校验
    if args.Job == nil     { return 400 "Job must be specified" }
    if args.Job.ID == nil  { return 400 "Job ID hasn't been provided" }
    if jobID != "" && *args.Job.ID != jobID { return 400 "Job ID does not match name" }

    // 3. 特殊校验：system job 不支持 scaling
    if *args.Job.Type == api.JobTypeSystem {
        for _, tg := range args.Job.TaskGroups {
            if tg.Scaling != nil { return 400 "..." }
        }
    }

    // 4. 校验 eval_priority
    if args.EvalPriority != 0 {
        validateEvalPriorityOpt(args.EvalPriority)
    }

    // 5. api.Job → structs.Job 转换
    sJob, writeReq := s.apiJobAndRequestToStructs(args.Job, req, args.WriteRequest)

    // 6. api.JobSubmission → structs.JobSubmission
    submission := apiJobSubmissionToStructs(args.Submission)

    // 7. 构造 RPC 请求
    regReq := structs.JobRegisterRequest{
        Job:               sJob,
        Submission:        submission,
        EnforceIndex:      args.EnforceIndex,
        JobModifyIndex:    args.JobModifyIndex,
        PolicyOverride:    args.PolicyOverride,
        PreserveCounts:    args.PreserveCounts,
        PreserveResources: args.PreserveResources,
        EvalPriority:      args.EvalPriority,
        WriteRequest:      *writeReq,
    }

    // 8. 调用 Server RPC
    var out structs.JobRegisterResponse
    s.agent.RPC("Job.Register", &regReq, &out)

    setIndex(resp, out.Index)
    return out, nil
}
```

---

## 六、Server 端 RPC 处理

### 6.1 Job.Register 入口

文件：[nomad/job_endpoint.go:94](file:///d:/claude/nomad/nomad/job_endpoint.go#L94)

```go
func (j *Job) Register(args *structs.JobRegisterRequest, reply *structs.JobRegisterResponse) error {
    // 1. 认证
    authErr := j.srv.Authenticate(j.ctx, args)
    if done, err := j.srv.forward("Job.Register", args, args, reply); done {
        return err  // 非 leader 转发到 leader
    }

    // 2. 速率限制
    j.srv.MeasureRPCRate("job", structs.RateMetricWrite, args)

    // 3. ACL 解析
    aclObj, err := j.srv.ResolveACL(args)

    // 4. 调用 doRegister
    return j.doRegister(aclObj, []string{acl.NamespaceCapabilityRegisterJob}, args, reply)
}
```

### 6.2 doRegister 主流程

文件：[nomad/job_endpoint.go:115](file:///d:/claude/nomad/nomad/job_endpoint.go#L115)

```go
func (j *Job) doRegister(aclObj *acl.ACL, additionalAllowedPermissions []string, args *structs.JobRegisterRequest, reply *structs.JobRegisterResponse) error {
    // ① 检查注册是否被允许
    if ok, err := registrationsAreAllowed(aclObj, j.srv.State()); !ok || err != nil {
        return structs.ErrJobRegistrationDisabled
    }

    // ② 基本校验
    if args.Job == nil { return fmt.Errorf("missing job") }
    if args.RequestNamespace() != args.Job.Namespace {
        return fmt.Errorf("mismatched namespace")
    }

    // ③ 准入控制（Mutators + Validators）
    job, warnings, err := j.admissionControllers(args.Job)
    args.Job = job

    // ④ Submission 控制器（保存源码）
    warnings = append(warnings, j.submissionController(args))

    // ⑤ 记录提交者 token（用于 multiregion 部署）
    if args.GetIdentity().ACLToken != nil {
        args.Job.NomadTokenID = args.GetIdentity().ACLToken.AccessorID
    }
    reply.Warnings = helper.MergeMultierrorWarnings(warnings...)

    // ⑥ 权限检查
    permissions := append([]string{acl.NamespaceCapabilitySubmitJob}, additionalAllowedPermissions...)
    if !aclObj.AllowNsOpAnyOf(args.RequestNamespace(), permissions...) {
        return structs.ErrPermissionDenied
    }

    // ⑦ Volume 权限检查
    for _, tg := range args.Job.TaskGroups {
        for _, vol := range tg.Volumes {
            // CSI / Host volume 权限
        }
    }

    // ⑧ Sentinel 策略检查
    if args.PolicyOverride {
        if !aclObj.AllowNsOp(args.RequestNamespace(), acl.NamespaceCapabilitySentinelOverride) {
            return structs.ErrPermissionDenied
        }
    }

    // ⑨ 查询现有 job
    snap, _ := j.srv.State().Snapshot()
    existingJob, _ := snap.JobByID(ws, args.RequestNamespace(), args.Job.ID)

    // ⑩ EnforceIndex 乐观锁
    if args.EnforceIndex {
        existingJob.EnforceIndex(args.JobModifyIndex)
    }

    // ⑪ Job 更新校验（状态转换合法性）
    validateJobUpdate(existingJob, args.Job)

    // ⑫ 传播 scaling policy ID
    propagateScalingPolicyIDs(existingJob, args.Job)

    // ⑬ Sentinel 策略执行
    policyWarnings, err := j.enforceSubmitJob(args.PolicyOverride, args.Job.Copy(), existingJob, ...)

    // ⑭ Consul Configuration Entries（Ingress/Terminating Gateway）
    for ns, entries := range args.Job.ConfigEntries() {
        j.srv.consulConfigEntries.SetIngressCE(...)
        j.srv.consulConfigEntries.SetTerminatingCE(...)
    }

    // ⑮ Multiregion 处理（企业版）
    isRunner, err := j.multiregionRegister(args, reply, newVersion)

    // ⑯ 设置 SubmitTime
    args.Job.SubmitTime = time.Now().UnixNano()

    // ⑰ 创建 evaluation（非 periodic / parameterized job）
    if !(args.Job.IsPeriodic() || args.Job.IsParameterized()) {
        evalPriority := args.Job.Priority
        if args.EvalPriority > 0 { evalPriority = args.EvalPriority }
        args.Eval = &structs.Evaluation{
            ID:          uuid.Generate(),
            Namespace:   args.RequestNamespace(),
            Priority:    evalPriority,
            Type:        args.Job.Type,
            TriggeredBy: structs.EvalTriggerJobRegister,
            JobID:       args.Job.ID,
            Status:      structs.EvalStatusPending,
        }
        reply.EvalID = args.Eval.ID
    }

    // ⑱ 检查 spec 是否变化
    specChanged, _ := j.multiregionSpecChanged(existingJob, args)

    if !specChanged {
        // ⑲ Spec 未变：仅触发 eval
        reply.JobModifyIndex = existingJob.ModifyIndex
        if args.Eval != nil {
            j.srv.raftApply(structs.EvalUpdateRequestType, evalUpdate)
        }
    } else {
        // ⑳ Spec 变化：通过 Raft 持久化 job + eval
        args.Deployment = j.multiregionCreateDeployment(job, args.Eval)
        _, index, err := j.srv.raftApply(structs.JobRegisterRequestType, args)
        reply.JobModifyIndex = index
        reply.Index = index
        if args.Eval != nil { reply.EvalCreateIndex = index }
    }

    // ㉑ Multiregion 启动（企业版）
    if isRunner {
        j.multiregionStart(args, reply)
        j.multiregionDrop(args, reply)
    }

    return nil
}
```

---

## 七、准入控制器（Admission Controllers）

### 7.1 概念

准入控制器是 Server 端对 job 进行的"突变"（Mutate）和"校验"（Validate）流水线，**在 Raft 持久化之前执行**。

### 7.2 注册的控制器

文件：[nomad/job_endpoint.go:67](file:///d:/claude/nomad/nomad/job_endpoint.go#L67)

#### Mutators（突变器，按顺序执行）

| 顺序 | 名称 | 作用 |
|------|------|------|
| 1 | `jobCanonicalizer` | 调用 `job.Canonicalize()` 设置默认值，设置默认优先级 |
| 2 | `jobVaultHook` | 处理 Vault token 策略、namespace 继承 |
| 3 | `jobConsulHook` | 处理 Consul namespace、service 配置 |
| 4 | `jobConnectHook` | 处理 Consul Connect sidecar 注入（添加 proxy task） |
| 5 | `jobExposeCheckHook` | 处理 Connect 服务的 expose 配置 |
| 6 | `jobImpliedConstraints` | 添加隐含约束（如信号约束、架构约束） |
| 7 | `jobNodePoolMutatingHook` | 处理 node pool 默认值 |
| 8 | `jobImplicitIdentitiesHook` | 添加隐含的 workload identity |
| 9 | `jobNumaHook` | 处理 NUMA 亲和性配置 |

#### Validators（校验器，在 Mutators 之后执行）

| 顺序 | 名称 | 作用 |
|------|------|------|
| 1 | `jobConnectHook` | 校验 Connect 配置合法性 |
| 2 | `jobExposeCheckHook` | 校验 expose 配置 |
| 3 | `jobVaultHook` | 校验 Vault 配置 |
| 4 | `jobConsulHook` | 校验 Consul 配置 |
| 5 | `jobNamespaceConstraintCheckHook` | 校验 namespace 约束 |
| 6 | `jobNodePoolValidatingHook` | 校验 node pool 存在性 |
| 7 | `jobValidate` | 通用 job 校验（字段合法性、driver 配置等） |
| 8 | `memoryOversubscriptionValidate` | 校验内存超售配置 |
| 9 | `jobNumaHook` | 校验 NUMA 配置 |
| 10 | `jobSchedHook` | 校验调度器类型 |

### 7.3 执行流程

文件：[nomad/job_endpoint_hooks.go:178](file:///d:/claude/nomad/nomad/job_endpoint_hooks.go#L178)

```go
func (j *Job) admissionControllers(job *structs.Job) (*structs.Job, []error, error) {
    // 1. 先执行 Mutators（按顺序，前一个的输出是后一个的输入）
    out, warnings, err := j.admissionMutators(job)
    if err != nil { return nil, nil, err }

    // 2. 再执行 Validators（在突变后的 job 上校验）
    validateWarnings, err := j.admissionValidators(job)
    warnings = append(warnings, validateWarnings...)

    return out, warnings, nil
}

func (j *Job) admissionMutators(job *structs.Job) (*structs.Job, []error, error) {
    for _, mutator := range j.mutators {
        job, w, err = mutator.Mutate(job)  // 链式调用
        if err != nil { return nil, nil, err }
        warnings = append(warnings, w...)
    }
    return job, warnings, nil
}

func (j *Job) admissionValidators(origJob *structs.Job) ([]error, error) {
    job := origJob.Copy()  // 校验器不修改原 job
    for _, validator := range j.validators {
        w, err := validator.Validate(job)
        if err != nil { errs = multierror.Append(errs, err) }
        warnings = append(warnings, w...)
    }
    return warnings, errs
}
```

### 7.4 jobCanonicalizer 示例

文件：[nomad/job_endpoint_hooks.go:227](file:///d:/claude/nomad/nomad/job_endpoint_hooks.go#L227)

```go
func (c *jobCanonicalizer) Mutate(job *structs.Job) (*structs.Job, []error, error) {
    job.Canonicalize()  // 设置所有 nil 字段的默认值

    // 设置默认优先级（来自 server 配置）
    if job.Priority == 0 {
        job.Priority = c.srv.GetConfig().JobDefaultPriority
    }
    return job, nil, nil
}
```

`job.Canonicalize()` 完成的默认值设置包括：
- `ID`、`Name`、`Namespace`、`Region`、`Type`、`Priority`
- `Status`、`Stable`、`Version`、`Stop`
- `CreateIndex`、`ModifyIndex`、`JobModifyIndex`
- 每个 TaskGroup 的 `Count`、`RestartPolicy`、`EphemeralDisk` 等
- 每个 Task 的 `Resources`、`Services`、`Env`、`Vault` 等

---

## 八、Raft 持久化

### 8.1 Raft 应用

文件：[nomad/job_endpoint.go:368](file:///d:/claude/nomad/nomad/job_endpoint.go#L368)

```go
_, index, err := j.srv.raftApply(structs.JobRegisterRequestType, args)
```

`raftApply` 将 `JobRegisterRequest` 通过 Raft 共识协议复制到所有 Server 节点，然后在每个节点上应用 `JobRegisterRequestType` 对应的 FSM handler。

### 8.2 StateStore.UpsertJob

文件：[nomad/state/state_store.go:1789](file:///d:/claude/nomad/nomad/state/state_store.go#L1789)

```go
func (s *StateStore) upsertJobImpl(index uint64, sub *structs.JobSubmission, job *structs.Job, keepVersion bool, txn *txn, req *structs.JobRegisterRequest) error {
    // 1. 校验 namespace 存在
    if exists, _ := s.namespaceExists(txn, job.Namespace); !exists {
        return fmt.Errorf("nonexistent namespace")
    }

    // 2. 校验 node pool 存在
    if job.NodePool == "" { job.NodePool = structs.NodePoolDefault }
    if exists, _ := s.nodePoolExists(txn, job.NodePool); !exists {
        return fmt.Errorf("nonexistent node pool")
    }

    // 3. 查询现有 job
    existing, _ := txn.First("jobs", "id", job.Namespace, job.ID)
    var existingJob *structs.Job
    if existing != nil { existingJob = existing.(*structs.Job) }

    // 4. EnforceIndex 检查
    if req != nil && req.EnforceIndex {
        existingJob.EnforceIndex(req.JobModifyIndex)
    }

    // 5. 设置索引
    if existingJob != nil {
        job.CreateIndex = existingJob.CreateIndex
        job.ModifyIndex = index
        job.Version = existingJob.Version + 1
    } else {
        job.CreateIndex = index
        job.ModifyIndex = index
        job.Version = 0
    }

    // 6. 保留历史版本（用于 revert）
    if existingJob != nil && !keepVersion {
        txn.Insert("job_version", &structs.JobVersion{
            Job: existingJob,
            Version: existingJob.Version,
            ...
        })
    }

    // 7. 保存 submission（如果配置启用）
    if sub != nil {
        txn.Insert("job_submission", sub)
    }

    // 8. 保存 job
    txn.Insert("jobs", job)

    // 9. 创建/更新 JobSummary
    if existingJob == nil {
        s.upsertJobSummaryTxn(index, job.Summary, txn)
    }

    // 10. 处理 PreserveCounts / PreserveResources
    if req != nil {
        if req.PreserveCounts    { /* 从 existingJob 复制 count */ }
        if req.PreserveResources { /* 从 existingJob 复制 resources */ }
    }

    return nil
}
```

---

## 九、Evaluation 与调度

### 9.1 Evaluation 创建

在 `doRegister` 中，对于非 periodic/parameterized job，会创建一个 `Evaluation`：

```go
args.Eval = &structs.Evaluation{
    ID:          uuid.Generate(),
    Namespace:   args.RequestNamespace(),
    Priority:    evalPriority,
    Type:        args.Job.Type,        // service / batch / system
    TriggeredBy: structs.EvalTriggerJobRegister,
    JobID:       args.Job.ID,
    Status:      structs.EvalStatusPending,
}
```

### 9.2 调度器类型

文件：[scheduler/scheduler.go:23](file:///d:/claude/nomad/scheduler/scheduler.go#L23)

```go
var BuiltinSchedulers = map[string]structs.Factory{
    "service":  NewServiceScheduler,  // 长运行服务
    "batch":    NewBatchScheduler,    // 批处理任务
    "system":   NewSystemScheduler,   // 系统任务（每个节点一个）
    "_sysbatch": NewSysBatchScheduler, // 系统批处理
}
```

### 9.3 调度流程

```
Raft 应用 → eval 入队 → Worker 取出 eval
    │
    ▼
Scheduler.Process(eval)
    │
    ├── 1. 计算 job 的预期 allocations（缺多少、多多少）
    │   （reconciler 完成）
    │
    ├── 2. 过滤可用节点（constraints、affinities）
    │
    ├── 3. 评分选节点（bin packing、spread、anti-affinity）
    │
    ├── 4. 创建 allocations（分配到节点）
    │
    └── 5. 通过 Raft 持久化 allocations
            │
            ▼
        Client 接收 allocation → 启动 task
```

---

## 十、完整调用链总结

### 10.1 解析阶段（CLI 端）

```
nomad job run web.nomad
    │
    ├─[1] command/job_run.go: Run()
    │      解析 -var/-var-file/-hcl2-strict 等 flag
    │
    ├─[2] command/helpers.go: JobGetter.Get("web.nomad")
    │      ├─ go-getter 读取文件（支持 git/s3 等源）
    │      └─ 判断 JSON 还是 HCL2
    │
    ├─[3] jobspec2/parse.go: ParseWithConfigEx()
    │      ├─ parseHCLOrJSON() → HCL AST
    │      ├─ parseFile() 解析 -var-file
    │      └─ decode()
    │
    ├─[4] jobspec2/types.config.go: decodeBody()
    │      ├─ decodeInputVariables() → variable/variables 块
    │      ├─ parseLocalVariables() → locals 块
    │      ├─ collectInputVariableValues() → 合并变量值
    │      ├─ evaluateLocalVariables() → 求值 locals
    │      ├─ EvalContext() → 构建 var.X / local.Y 上下文
    │      └─ decodeJob() → 解码 job 块
    │          ├─ dynblock.Expand() → 展开动态块
    │          ├─ decodeAsAttribute("meta") → 提取 meta
    │          ├─ decodeTopLevelExtras() → 顶级 vault/secret/task
    │          └─ hclDecoder.DecodeBody() → 解码剩余字段
    │
    ├─[5] jobspec2/hcl_conversions.go
    │      ├─ decodeTaskGroup() → 自定义 TaskGroup 解码
    │      ├─ decodeTask() → 自定义 Task 解码（driver config）
    │      ├─ decodeDuration() → "5m" → time.Duration
    │      ├─ decodeAffinity() → Affinity 块
    │      └─ decodeConstraint() → Constraint 块
    │
    ├─[6] jobspec2/parse_job.go: normalizeJob()
    │      ├─ 设置默认 Name/ID
    │      ├─ Periodic.SpecType = "cron"
    │      ├─ normalizeVault() → Vault 默认值
    │      ├─ 顶级 task 包装为 TaskGroup
    │      └─ 每个 task 继承 job 级 vault/secrets
    │
    └─[7] jobspec2/parse.go: submissionFromJob()
           构建 JobSubmission（源码 + 变量）
```

### 10.2 提交阶段

```
    ├─[8] command/job_run.go: Run()（续）
    │      client.Jobs().RegisterOpts(job, opts, nil)
    │
    ├─[9] api/jobs.go: RegisterOpts()
    │      构造 JobRegisterRequest{Job, Submission, ...}
    │      HTTP PUT /v1/jobs
    │
    ├─[10] command/agent/job_endpoint.go: JobsRequest()
    │       路由到 jobUpdate()
    │
    ├─[11] command/agent/job_endpoint.go: jobUpdate()
    │       ├─ decodeBody() 解码请求体
    │       ├─ 校验 Job.ID、system job scaling
    │       ├─ apiJobAndRequestToStructs() → api.Job 转 structs.Job
    │       └─ agent.RPC("Job.Register", regReq, &out)
    │
    └─[12] nomad/job_endpoint.go: Job.Register()
            ├─ Authenticate() → 认证
            ├─ forward() → 非 leader 转发
            └─ doRegister()
```

### 10.3 Server 处理阶段

```
    ├─[13] nomad/job_endpoint.go: doRegister()
    │       ├─ registrationsAreAllowed() → 检查注册是否允许
    │       ├─ admissionControllers() → 准入控制
    │       │   ├─ admissionMutators()
    │       │   │   ├─ jobCanonicalizer → 设置默认值
    │       │   │   ├─ jobVaultHook → Vault 突变
    │       │   │   ├─ jobConsulHook → Consul 突变
    │       │   │   ├─ jobConnectHook → Connect sidecar 注入
    │       │   │   ├─ jobImpliedConstraints → 隐含约束
    │       │   │   ├─ jobNodePoolMutatingHook → node pool
    │       │   │   ├─ jobImplicitIdentitiesHook → workload identity
    │       │   │   └─ jobNumaHook → NUMA
    │       │   └─ admissionValidators()
    │       │       ├─ jobValidate → 通用校验
    │       │       ├─ jobSchedHook → 调度器类型校验
    │       │       └─ ...（10 个校验器）
    │       │
    │       ├─ submissionController() → 保存 submission
    │       ├─ ACL 权限检查（SubmitJob / RegisterJob / Volume）
    │       ├─ Sentinel 策略检查
    │       ├─ Consul ConfigEntries 设置
    │       ├─ multiregionRegister() → 多区域（企业版）
    │       ├─ 创建 Evaluation（非 periodic/parameterized）
    │       └─ raftApply(JobRegisterRequestType, args)
    │
    ├─[14] Raft 共识
    │       ├─ Leader 复制 log 到 followers
    │       ├─ 多数确认后 commit
    │       └─ 应用到 FSM
    │
    ├─[15] nomad/state/state_store.go: UpsertJobWithRequest()
    │       ├─ 校验 namespace / node pool 存在
    │       ├─ 查询 existing job
    │       ├─ EnforceIndex 检查
    │       ├─ 设置 CreateIndex / ModifyIndex / Version
    │       ├─ 保留历史版本（job_version 表）
    │       ├─ 保存 submission（job_submission 表）
    │       ├─ 保存 job（jobs 表）
    │       ├─ 创建/更新 JobSummary
    │       └─ 处理 PreserveCounts / PreserveResources
    │
    └─[16] Evaluation 入队
            eval 进入待处理队列
            Worker 取出 eval → 调度器处理
```

### 10.4 调度执行阶段

```
    ├─[17] scheduler worker 取出 eval
    │       根据 eval.Type 选择调度器（service/batch/system）
    │
    ├─[18] scheduler.Process(eval)
    │       ├─ reconciler 计算预期 allocations
    │       ├─ feasible 过滤可用节点（constraints）
    │       ├─ rank 评分选节点（bin packing）
    │       └─ 创建 allocations
    │
    ├─[19] raftApply(EvalUpdateRequestType) → 持久化 allocations
    │
    └─[20] Client 接收 allocation
            ├─ allocrunner 启动
            ├─ taskrunner.prestart() → 下载 artifact
            ├─ driver.StartTask() → 拉取 docker 镜像
            └─ 容器启动
```

---

## 十一、Job 结构关键字段

### 11.1 api.Job 结构

文件：[api/jobs.go:1105](file:///d:/claude/nomad/api/jobs.go#L1105)

```go
type Job struct {
    // === 从 HCL 解析的字段 ===
    Region           *string                 `hcl:"region,optional"`
    Namespace        *string                 `hcl:"namespace,optional"`
    ID               *string                 `hcl:"id,optional"`
    Name             *string                 `hcl:"name,optional"`
    Type             *string                 `hcl:"type,optional"`       // service/batch/system
    Priority         *int                    `hcl:"priority,optional"`
    AllAtOnce        *bool                   `hcl:"all_at_once,optional"`
    Datacenters      []string                `hcl:"datacenters,optional"`
    NodePool         *string                 `hcl:"node_pool,optional"`
    Constraints      []*Constraint           `hcl:"constraint,block"`
    Affinities       []*Affinity             `hcl:"affinity,block"`
    TaskGroups       []*TaskGroup            `hcl:"group,block"`
    Update           *UpdateStrategy         `hcl:"update,block"`
    Multiregion      *Multiregion            `hcl:"multiregion,block"`
    Spreads          []*Spread               `hcl:"spread,block"`
    Periodic         *PeriodicConfig         `hcl:"periodic,block"`
    ParameterizedJob *ParameterizedJobConfig `hcl:"parameterized,block"`
    Reschedule       *ReschedulePolicy       `hcl:"reschedule,block"`
    Migrate          *MigrateStrategy        `hcl:"migrate,block"`
    Meta             map[string]string       `hcl:"meta,block"`
    UI               *JobUIConfig            `hcl:"ui,block"`

    // === Server 设置的字段（不从 HCL 解析） ===
    Stop                     *bool
    ParentID                 *string
    Dispatched               bool
    DispatchIdempotencyToken *string
    Payload                  []byte
    ConsulNamespace          *string
    VaultNamespace           *string
    NomadTokenID             *string
    Status                   *string
    StatusDescription        *string
    Stable                   *bool
    Version                  *uint64
    SubmitTime               *int64
    CreateIndex              *uint64
    ModifyIndex              *uint64
    JobModifyIndex           *uint64
    VersionTag               *JobVersionTag
}
```

### 11.2 字段来源对照

| 字段类别 | 来源 | 示例 |
|---------|------|------|
| **HCL 解析字段** | job.nomad 文件 | `ID`、`Type`、`TaskGroups`、`Constraints` |
| **Server 突变字段** | Admission Controllers | `Status`、`NomadTokenID`、Consul/Vault namespace |
| **持久化字段** | StateStore | `CreateIndex`、`ModifyIndex`、`Version`、`SubmitTime` |
| **运行时字段** | 调度器/Client | `StatusDescription`、`Stable` |

---

## 十二、job.nomad 示例与解析对照

### 12.1 示例 job.nomad

```hcl
# 输入变量
variable "image_tag" {
  type    = string
  default = "latest"
}

variable "replicas" {
  type    = number
  default = 3
}

# 局部变量
locals {
  full_image = "nginx:${var.image_tag}"
}

# Job 定义
job "web-app" {
  region      = "global"
  datacenters = ["dc1", "dc2"]
  type        = "service"
  priority    = 50

  constraint {
    attribute = "${attr.kernel.name}"
    value     = "linux"
  }

  update {
    max_parallel      = 2
    health_check      = "checks"
    min_healthy_time  = "10s"
    healthy_deadline  = "5m"
    progress_deadline = "10m"
    auto_revert       = true
  }

  group "web" {
    count = var.replicas

    network {
      port "http" {
        to = 80
      }
    }

    task "server" {
      driver = "docker"
      config {
        image = local.full_image
        ports = ["http"]
      }

      resources {
        cpu    = 500
        memory = 256
      }

      service {
        name = "web-service"
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

  meta {
    owner     = "team-web"
    cost_code = "cc-1234"
  }
}
```

### 12.2 解析过程对照

| 步骤 | 处理内容 | 输出 |
|------|---------|------|
| ① decodeInputVariables | 解析 `variable "image_tag"` 和 `variable "replicas"` | `InputVariables["image_tag"] = "latest"`, `InputVariables["replicas"] = 3` |
| ② parseLocalVariables | 解析 `locals` 块 | `LocalBlocks[0] = {Name: "full_image", Expr: "nginx:${var.image_tag}"}` |
| ③ collectInputVariableValues | 收集变量值（无 -var 和环境变量，用默认值） | `image_tag="latest"`, `replicas=3` |
| ④ evaluateLocalVariables | 求值 `local.full_image` | `LocalVariables["full_image"] = "nginx:latest"` |
| ⑤ decodeJob | 解码 `job "web-app"` 块 | `Job.ID = "web-app"`, `Job.Region = "global"` |
| ⑥ dynblock.Expand | 展开 `constraint`、`group`、`task` 等动态块 | 无变化（无 dynamic 块） |
| ⑦ hclDecoder.DecodeBody | 解码 `region`、`datacenters`、`type`、`priority`、`update`、`meta` | `Job.Type = "service"`, `Job.Priority = 50` |
| ⑧ decodeTaskGroup | 解码 `group "web"` | `TaskGroup{Name: "web", Count: 3}` |
| ⑨ decodeTask | 解码 `task "server"` | `Task{Name: "server", Driver: "docker", Config: {image: "nginx:latest"}}` |
| ⑩ normalizeJob | 归一化 | 设置默认值，`Name = "web-app"` |
| ⑪ admissionControllers | Server 端突变 | `jobCanonicalizer` 设置所有默认值 |

---

## 十三、关键设计点

### 13.1 HCL2 vs JSON

| 特性 | HCL2 | JSON |
|------|------|------|
| **解析器** | `hclsyntax.ParseConfig` | `hcljson.Parse` |
| **变量支持** | 支持 `variable`/`variables`/`locals` | 不支持 |
| **函数支持** | 支持 `${func()}` | 不支持 |
| **注释** | 支持 `#` 和 `//` | 不支持 |
| **格式判断** | 首字符非 `{` | 首字符为 `{` |
| **Submission.Format** | `"hcl2"` | `"json"` |

### 13.2 变量作用域

```
EvalContext.Variables = {
    "var":   cty.ObjectVal(InputVariables),  // var.X
    "local": cty.ObjectVal(LocalVariables),  // local.Y
}
```

- `var.X`：引用输入变量
- `local.Y`：引用局部变量
- 不支持 `job.X`、`group.X` 等自引用

### 13.3 UndefinedVariable 处理

文件：[jobspec2/types.config.go:360](file:///d:/claude/nomad/jobspec2/types.config.go#L360)

对于未定义的变量引用（如 `${unknown_var}`），Nomad 不报错，而是将其作为字符串字面量保留：

```go
UndefinedVariable: func(t hcl.Traversal) (cty.Value, hcl.Diagnostics) {
    // 提取原始文本
    v := string(body[start:end])
    // 如果在 ${...} 中，保留整个 ${...}
    // 否则包装为 ${...}
    return cty.StringVal(v), nil
}
```

**目的**：兼容 Consul Template 语法（`${...}` 也是 consul-template 的插值语法）。

### 13.4 动态块展开

`dynblock.Expand` 支持 `dynamic` 块，用于循环生成 block：

```hcl
variable "services" {
  type = list(string)
  default = ["web", "api"]
}

group "example" {
  dynamic "service" {
    for_each = var.services
    labels   = [service.value]
    content {
      name = service.value
      port = "http"
    }
  }
}
```

### 13.5 顶级 task/vault/secret 兼容

`job.nomad` 支持 job 级别的 `task`、`vault`、`secret` 块（历史兼容）：

```hcl
job "example" {
  # 顶级 task（被包装为只有一个 task 的 TaskGroup）
  task "standalone" {
    driver = "docker"
    config { image = "nginx" }
  }

  # 顶级 vault（被所有 task 继承）
  vault {
    policies = ["default"]
  }

  # 顶级 secret（被所有 task 继承）
  secret "my-secret" {
    name = "db-password"
  }
}
```

处理逻辑在 `normalizeJob()` 中：
- 顶级 `task` → 包装为 `TaskGroup{Name: task.Name, Tasks: [task]}`
- 顶级 `vault` → 每个 task 的 `t.Vault` 若为 nil 则继承
- 顶级 `secret` → 追加到每个 task 的 `t.Secrets`

### 13.6 Submission 保存策略

`JobSubmission` 的保存由 `submissionController` 控制，受 Server 配置影响：

- `nomad.configuration.job_submission_gc_threshold`：submission 保留时间
- 如果配置为 0，则不保存 submission
- Submission 用于 UI 显示和 `nomad job inspect -submission`

### 13.7 版本管理

每次 job 更新都会：
1. 保留旧版本到 `job_version` 表（用于 `nomad job revert`）
2. 递增 `Version` 字段
3. 更新 `ModifyIndex`（不变 `CreateIndex`）

---

## 十四、源码位置索引

### 解析相关

| 文件 | 作用 |
|------|------|
| [command/helpers.go](file:///d:/claude/nomad/command/helpers.go) | JobGetter.Get() 入口 |
| [jobspec2/parse.go](file:///d:/claude/nomad/jobspec2/parse.go) | Parse/ParseWithConfig/ParseWithConfigEx 入口 + submission 构建 |
| [jobspec2/types.config.go](file:///d:/claude/nomad/jobspec2/types.config.go) | jobConfig + decodeBody + decodeJob + EvalContext |
| [jobspec2/parse_job.go](file:///d:/claude/nomad/jobspec2/parse_job.go) | normalizeJob 归一化 |
| [jobspec2/hcl_conversions.go](file:///d:/claude/nomad/jobspec2/hcl_conversions.go) | 自定义 decoder 注册（TaskGroup/Task/Duration/Affinity/Constraint） |
| [jobspec2/functions.go](file:///d:/claude/nomad/jobspec2/functions.go) | HCL 函数定义 |
| [jobspec2/hclutil/block_attrs.go](file:///d:/claude/nomad/jobspec2/hclutil/block_attrs.go) | BlocksAsAttrs 辅助 |
| [jobspec2/addrs/](file:///d:/claude/nomad/jobspec2/addrs) | 变量引用解析 |

### 提交相关

| 文件 | 作用 |
|------|------|
| [command/job_run.go](file:///d:/claude/nomad/command/job_run.go) | job run 命令实现 |
| [api/jobs.go](file:///d:/claude/nomad/api/jobs.go) | Jobs.RegisterOpts() HTTP 客户端 |
| [command/agent/job_endpoint.go](file:///d:/claude/nomad/command/agent/job_endpoint.go) | HTTP 端点 JobsRequest/jobUpdate/JobsParseRequest |
| [nomad/job_endpoint.go](file:///d:/claude/nomad/nomad/job_endpoint.go) | Job.Register RPC + doRegister + 准入控制器注册 |

### 准入控制

| 文件 | 作用 |
|------|------|
| [nomad/job_endpoint_hooks.go](file:///d:/claude/nomad/nomad/job_endpoint_hooks.go) | admissionController 接口 + jobCanonicalizer + jobImpliedConstraints |
| [nomad/job_endpoint_hook_vault.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_vault.go) | jobVaultHook |
| [nomad/job_endpoint_hook_consul.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_consul.go) | jobConsulHook |
| [nomad/job_endpoint_hook_connect.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_connect.go) | jobConnectHook + jobExposeCheckHook |
| [nomad/job_endpoint_hook_node_pool.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_node_pool.go) | node pool 突变/校验 |
| [nomad/job_endpoint_hook_implicit_identities.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_implicit_identities.go) | 隐含 workload identity |
| [nomad/job_endpoint_hook_numa.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_numa.go) | NUMA 亲和性 |
| [nomad/job_endpoint_hook_sched.go](file:///d:/claude/nomad/nomad/job_endpoint_hook_sched.go) | 调度器类型校验 |
| [nomad/job_endpoint_validators.go](file:///d:/claude/nomad/nomad/job_endpoint_validators.go) | jobValidate 通用校验 |

### 持久化与调度

| 文件 | 作用 |
|------|------|
| [nomad/state/state_store.go](file:///d:/claude/nomad/nomad/state/state_store.go) | UpsertJobWithRequest 持久化 |
| [scheduler/scheduler.go](file:///d:/claude/nomad/scheduler/scheduler.go) | 调度器工厂注册 |
| [scheduler/reconciler/](file:///d:/claude/nomad/scheduler/reconciler) | 计算 job 预期 allocations |

### 数据结构

| 文件 | 作用 |
|------|------|
| [api/jobs.go](file:///d:/claude/nomad/api/jobs.go) | api.Job + JobSubmission + JobRegisterRequest |
| [nomad/structs/job.go](file:///d:/claude/nomad/nomad/structs/job.go) | structs.Job + JobRegisterRequest（Server 端） |
| [api/tasks.go](file:///d:/claude/nomad/api/tasks.go) | TaskGroup + Task + TaskArtifact + Constraint 等 |

---

## 十五、总结

| 阶段 | 组件 | 关键操作 |
|------|------|---------|
| **解析** | jobspec2 包 | HCL2/JSON → api.Job，支持变量、locals、函数、动态块 |
| **提交** | api.Jobs.RegisterOpts | HTTP PUT /v1/jobs，携带 Job + Submission + Options |
| **路由** | agent HTTP endpoint | api.Job → structs.Job，调用 Job.Register RPC |
| **准入** | Admission Controllers | 9 个 Mutators + 10 个 Validators 突变和校验 |
| **持久化** | StateStore.UpsertJob | Raft 共识，保存 job + submission + version history |
| **调度** | scheduler | 创建 Evaluation，reconciler 计算 allocations，分配到节点 |
| **执行** | Client allocrunner | 接收 allocation，prestart hooks + driver.StartTask |

**核心设计**：
1. **解析在客户端**：`nomad job run` 在 CLI 端完成 HCL 解析，Server 接收的是 JSON 格式的 `api.Job`
2. **Submission 保留源码**：原始 HCL 和变量信息通过 `JobSubmission` 一并提交，用于 UI 显示和跨 region 同步
3. **准入控制器链式处理**：Mutators 先突变（设置默认值、注入 sidecar），Validators 后校验
4. **Raft 强一致性**：所有 job 变更通过 Raft 复制，确保多 Server 一致
5. **版本管理**：每次更新保留历史版本，支持 `nomad job revert` 回滚
