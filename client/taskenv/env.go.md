# env.go 代码说明文档

> 文件路径：[taskenv/env.go](file:///d:/claude/nomad/client/taskenv/env.go)
> 总行数：1203 行
> 所属包：`taskenv`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: BUSL-1.1

---

## 1. 文件定位与核心职责

该文件属于 **任务环境子包**（`client/taskenv`），构建任务的环境变量（节点属性、元数据、服务发现等）。

## 2. 类型定义

### TaskEnv

**定义位置**：[L159](file:///d:/claude/nomad/client/taskenv/env.go#L159)

**类型**：struct

```go
	NodeAttrs map[string]string
	EnvMap map[string]string
	TaskSecrets map[string]string
	deviceEnv map[string]string
	envList []string
	EnvMapClient map[string]string
	clientTaskDir string
	clientSharedAllocDir string
```

**关联方法**（11 个）：`List`, `DeviceEnv`, `Map`, `All`, `WithTask`, `AllValues`, `ParseAndReplace`, `ReplaceEnv`, `replaceEnvClient`, `checkEscape`, `ClientPath`

### Builder

**定义位置**：[L426](file:///d:/claude/nomad/client/taskenv/env.go#L426)

**类型**：struct

```go
	envvars map[string]string
	templateEnv map[string]string
	hostEnv map[string]string
	nodeAttrs map[string]string
	taskSecrets map[string]string
	taskMeta map[string]string
	allocDir string
	localDir string
	secretsDir string
	clientSharedAllocDir string
	clientTaskRoot string
	clientTaskLocalDir string
	clientTaskSecretsDir string
	cpuCores string
	cpuLimit int64
	memLimit int64
	memMaxLimit int64
	taskName string
	allocIndex int
	datacenter string
	cgroupParent string
	namespace string
	region string
	allocId string
	allocName string
	groupName string
	vaultToken string
	vaultNamespace string
	injectVaultToken bool
	workloadTokenDefault string
	workloadTokens map[string]string
	jobID string
	jobName string
	jobParentID string
	otherPorts map[string]string
	driverNetwork *drivers.DriverNetwork
	networks []*structs.NetworkResource
	networkStatus *structs.AllocNetworkStatus
	allocatedPorts structs.AllocatedPorts
	hookEnvs map[string]map[string]string
	hookNames []string
	deviceHookName string
	upstreams []structs.ConsulUpstream
	mu *sync.RWMutex
```

**关联方法**（25 个）：`buildEnv`, `Build`, `SetSecrets`, `SetHookEnv`, `setHookEnvLocked`, `SetDeviceHookEnv`, `setTask`, `setAlloc`, `setNode`, `SetAllocDir`, `SetTaskLocalDir`, `SetClientSharedAllocDir`, `SetClientTaskRoot`, `SetClientTaskLocalDir`, `SetClientTaskSecretsDir`, `SetSecretsDir`, `SetDriverNetwork`, `SetUpstreams`, `setUpstreamsLocked`, `SetNetworkStatus`, `SetHostEnvvars`, `SetTemplateEnv`, `SetVaultToken`, `SetDefaultWorkloadToken`, `SetWorkloadToken`

## 3. 常量与变量

### 常量

| 名称 | 值 |
|------|----|
| `AllocDir` | `"NOMAD_ALLOC_DIR"` |
| `TaskLocalDir` | `"NOMAD_TASK_DIR"` |
| `SecretsDir` | `"NOMAD_SECRETS_DIR"` |
| `MemLimit` | `"NOMAD_MEMORY_LIMIT"` |
| `MemMaxLimit` | `"NOMAD_MEMORY_MAX_LIMIT"` |
| `CpuLimit` | `"NOMAD_CPU_LIMIT"` |
| `CpuCores` | `"NOMAD_CPU_CORES"` |
| `AllocID` | `"NOMAD_ALLOC_ID"` |
| `ShortAllocID` | `"NOMAD_SHORT_ALLOC_ID"` |
| `AllocName` | `"NOMAD_ALLOC_NAME"` |
| `TaskName` | `"NOMAD_TASK_NAME"` |
| `GroupName` | `"NOMAD_GROUP_NAME"` |
| `JobID` | `"NOMAD_JOB_ID"` |
| `JobName` | `"NOMAD_JOB_NAME"` |
| `JobParentID` | `"NOMAD_JOB_PARENT_ID"` |
| `AllocIndex` | `"NOMAD_ALLOC_INDEX"` |
| `Datacenter` | `"NOMAD_DC"` |
| `CgroupParent` | `"NOMAD_PARENT_CGROUP"` |
| `Namespace` | `"NOMAD_NAMESPACE"` |
| `Region` | `"NOMAD_REGION"` |
| `AddrPrefix` | `"NOMAD_ADDR_"` |
| `HostAddrPrefix` | `"NOMAD_HOST_ADDR_"` |
| `UnixAddr` | `"NOMAD_UNIX_ADDR"` |
| `IpPrefix` | `"NOMAD_IP_"` |
| `HostIpPrefix` | `"NOMAD_HOST_IP_"` |
| `PortPrefix` | `"NOMAD_PORT_"` |
| `AllocPortPrefix` | `"NOMAD_ALLOC_PORT_"` |
| `HostPortPrefix` | `"NOMAD_HOST_PORT_"` |
| `MetaPrefix` | `"NOMAD_META_"` |
| `UpstreamPrefix` | `"NOMAD_UPSTREAM_"` |
| `AllocPrefix` | `"NOMAD_ALLOC_"` |
| `VaultToken` | `"VAULT_TOKEN"` |
| `VaultNamespace` | `"VAULT_NAMESPACE"` |
| `WorkloadToken` | `"NOMAD_TOKEN"` |
| `nodeIdKey` | `"node.unique.id"` |
| `nodeDcKey` | `"node.datacenter"` |
| `nodeRegionKey` | `"node.region"` |
| `nodeNameKey` | `"node.unique.name"` |
| `nodeClassKey` | `"node.class"` |
| `nodePoolKey` | `"node.pool"` |
| `nodeAttributePrefix` | `"attr."` |
| `nodeMetaPrefix` | `"meta."` |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `NewTaskEnv` | - | `env map[string]string, envClient map[string]string, deviceEnv map[string]str...` | `*TaskEnv` | [L191](file:///d:/claude/nomad/client/taskenv/env.go#L191) |
| `NewEmptyTaskEnv` | - | - | `*TaskEnv` | [L204](file:///d:/claude/nomad/client/taskenv/env.go#L204) |
| `List` | `t *TaskEnv` | - | `[]string` | [L213](file:///d:/claude/nomad/client/taskenv/env.go#L213) |
| `DeviceEnv` | `t *TaskEnv` | - | `map[string]string` | [L227](file:///d:/claude/nomad/client/taskenv/env.go#L227) |
| `Map` | `t *TaskEnv` | - | `map[string]string` | [L237](file:///d:/claude/nomad/client/taskenv/env.go#L237) |
| `All` | `t *TaskEnv` | - | `map[string]string` | [L248](file:///d:/claude/nomad/client/taskenv/env.go#L248) |
| `WithTask` | `t *TaskEnv` | `alloc *structs.Allocation, task *structs.Task` | `*TaskEnv` | [L264](file:///d:/claude/nomad/client/taskenv/env.go#L264) |
| `AllValues` | `t *TaskEnv` | - | `map[string]cty.Value, map[string]error, error` | [L293](file:///d:/claude/nomad/client/taskenv/env.go#L293) |
| `ParseAndReplace` | `t *TaskEnv` | `args []string` | `[]string` | [L359](file:///d:/claude/nomad/client/taskenv/env.go#L359) |
| `ReplaceEnv` | `t *TaskEnv` | `arg string` | `string` | [L375](file:///d:/claude/nomad/client/taskenv/env.go#L375) |
| `replaceEnvClient` | `t *TaskEnv` | `arg string` | `string` | [L390](file:///d:/claude/nomad/client/taskenv/env.go#L390) |
| `checkEscape` | `t *TaskEnv` | `testPath string` | `bool` | [L397](file:///d:/claude/nomad/client/taskenv/env.go#L397) |
| `ClientPath` | `t *TaskEnv` | `rawPath string, joinEscape bool` | `string, bool` | [L415](file:///d:/claude/nomad/client/taskenv/env.go#L415) |
| `NewBuilder` | - | `node *structs.Node, alloc *structs.Allocation, task *structs.Task, region st...` | `*Builder` | [L524](file:///d:/claude/nomad/client/taskenv/env.go#L524) |
| `NewEmptyBuilder` | - | - | `*Builder` | [L531](file:///d:/claude/nomad/client/taskenv/env.go#L531) |
| `buildEnv` | `b *Builder` | `allocDir string, localDir string, secretsDir string, nodeAttrs map[string]st...` | `map[string]string, map[string]string` | [L542](file:///d:/claude/nomad/client/taskenv/env.go#L542) |
| `Build` | `b *Builder` | - | `*TaskEnv` | [L708](file:///d:/claude/nomad/client/taskenv/env.go#L708) |
| `SetSecrets` | `b *Builder` | `secrets map[string]string` | - | [L730](file:///d:/claude/nomad/client/taskenv/env.go#L730) |
| `SetHookEnv` | `b *Builder` | `hook string, envs map[string]string` | `*Builder` | [L739](file:///d:/claude/nomad/client/taskenv/env.go#L739) |
| `setHookEnvLocked` | `b *Builder` | `hook string, envs map[string]string` | `*Builder` | [L747](file:///d:/claude/nomad/client/taskenv/env.go#L747) |
| `SetDeviceHookEnv` | `b *Builder` | `hookName string, envs map[string]string` | `*Builder` | [L759](file:///d:/claude/nomad/client/taskenv/env.go#L759) |
| `setTask` | `b *Builder` | `task *structs.Task` | `*Builder` | [L770](file:///d:/claude/nomad/client/taskenv/env.go#L770) |
| `setAlloc` | `b *Builder` | `alloc *structs.Allocation` | `*Builder` | [L795](file:///d:/claude/nomad/client/taskenv/env.go#L795) |
| `setNode` | `b *Builder` | `n *structs.Node` | `*Builder` | [L901](file:///d:/claude/nomad/client/taskenv/env.go#L901) |
| `SetAllocDir` | `b *Builder` | `dir string` | `*Builder` | [L926](file:///d:/claude/nomad/client/taskenv/env.go#L926) |
| `SetTaskLocalDir` | `b *Builder` | `dir string` | `*Builder` | [L933](file:///d:/claude/nomad/client/taskenv/env.go#L933) |
| `SetClientSharedAllocDir` | `b *Builder` | `dir string` | `*Builder` | [L940](file:///d:/claude/nomad/client/taskenv/env.go#L940) |
| `SetClientTaskRoot` | `b *Builder` | `dir string` | `*Builder` | [L947](file:///d:/claude/nomad/client/taskenv/env.go#L947) |
| `SetClientTaskLocalDir` | `b *Builder` | `dir string` | `*Builder` | [L954](file:///d:/claude/nomad/client/taskenv/env.go#L954) |
| `SetClientTaskSecretsDir` | `b *Builder` | `dir string` | `*Builder` | [L961](file:///d:/claude/nomad/client/taskenv/env.go#L961) |
| `SetSecretsDir` | `b *Builder` | `dir string` | `*Builder` | [L968](file:///d:/claude/nomad/client/taskenv/env.go#L968) |
| `SetDriverNetwork` | `b *Builder` | `n *drivers.DriverNetwork` | `*Builder` | [L976](file:///d:/claude/nomad/client/taskenv/env.go#L976) |
| `buildNetworkEnv` | - | `envMap map[string]string, nets structs.Networks, driverNet *drivers.DriverNe...` | - | [L992](file:///d:/claude/nomad/client/taskenv/env.go#L992) |
| `buildPortEnv` | - | `envMap map[string]string, p structs.Port, ip string, driverNet *drivers.Driv...` | - | [L1003](file:///d:/claude/nomad/client/taskenv/env.go#L1003) |
| `SetUpstreams` | `b *Builder` | `upstreams []structs.ConsulUpstream` | `*Builder` | [L1029](file:///d:/claude/nomad/client/taskenv/env.go#L1029) |
| `setUpstreamsLocked` | `b *Builder` | `upstreams []structs.ConsulUpstream` | `*Builder` | [L1035](file:///d:/claude/nomad/client/taskenv/env.go#L1035) |
| `SetNetworkStatus` | `b *Builder` | `netStatus *structs.AllocNetworkStatus` | `*Builder` | [L1040](file:///d:/claude/nomad/client/taskenv/env.go#L1040) |
| `buildUpstreamsEnv` | - | `envMap map[string]string, upstreams []structs.ConsulUpstream` | - | [L1048](file:///d:/claude/nomad/client/taskenv/env.go#L1048) |
| `addNomadAllocNetwork` | - | `envMap map[string]string, p structs.AllocatedPorts, netStatus *structs.Alloc...` | - | [L1068](file:///d:/claude/nomad/client/taskenv/env.go#L1068) |
| `SetPortMapEnvs` | - | `envs map[string]string, ports map[string]int` | `map[string]string` | [L1088](file:///d:/claude/nomad/client/taskenv/env.go#L1088) |
| `SetHostEnvvars` | `b *Builder` | `filter []string` | `*Builder` | [L1102](file:///d:/claude/nomad/client/taskenv/env.go#L1102) |
| `SetTemplateEnv` | `b *Builder` | `m map[string]string` | `*Builder` | [L1128](file:///d:/claude/nomad/client/taskenv/env.go#L1128) |
| `SetVaultToken` | `b *Builder` | `token string, namespace string, inject bool` | `*Builder` | [L1135](file:///d:/claude/nomad/client/taskenv/env.go#L1135) |
| `SetDefaultWorkloadToken` | `b *Builder` | `token string` | `*Builder` | [L1144](file:///d:/claude/nomad/client/taskenv/env.go#L1144) |
| `SetWorkloadToken` | `b *Builder` | `name string, token string` | `*Builder` | [L1151](file:///d:/claude/nomad/client/taskenv/env.go#L1151) |
| `addPort` | - | `m map[string]string, taskName string, ip string, portLabel string, port int` | - | [L1162](file:///d:/claude/nomad/client/taskenv/env.go#L1162) |
| `addGroupPort` | - | `m map[string]string, port structs.Port` | - | [L1173](file:///d:/claude/nomad/client/taskenv/env.go#L1173) |
| `addPorts` | - | `m map[string]string, ports structs.AllocatedPorts` | - | [L1183](file:///d:/claude/nomad/client/taskenv/env.go#L1183) |

## 5. 核心方法详解

### List()

**签名**：`func (t *TaskEnv) List() []string`

**位置**：[L213](file:///d:/claude/nomad/client/taskenv/env.go#L213)

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `fmt` | 标准库 |
| `maps` | 标准库 |
| `net` | 标准库 |
| `os` | 标准库 |
| `path/filepath` | 标准库 |
| `strconv` | 标准库 |
| `strings` | 标准库 |
| `sync` | 标准库 |
| `github.com/hashicorp/nomad/client/lib/idset` | 内部包 |
| `github.com/hashicorp/nomad/helper` | 内部包 |
| `github.com/hashicorp/nomad/helper/args` | 内部包 |
| `github.com/hashicorp/nomad/helper/escapingfs` | 内部包 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers` | 内部包 |
| `github.com/zclconf/go-cty/cty` | 第三方库 |

## 7. 设计模式与技术特点

- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [env_test.go](file:///d:/claude/nomad/client/taskenv/env_test.go) | 对应测试文件 |

