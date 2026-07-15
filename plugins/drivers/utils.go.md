# utils.go 代码说明文档

> 文件路径：[plugins/drivers/utils.go](file:///d:/claude/nomad/plugins/drivers/utils.go)
> 总行数：737 行
> 所属包：`drivers`
> 版权：Copyright IBM Corp. 2015, 2026
> 许可证：SPDX-License-Identifier: MPL-2.0

---

## 1. 文件定位与核心职责

该文件属于 **驱动插件接口子包**（`plugins/drivers`），定义任务驱动插件的接口规范，包括任务生命周期管理（Fingerprint、Launch、Stop、Destroy、Signal）、统计信息收集、能力声明和 gRPC 通信协议。

## 2. 类型定义

该文件未定义类型。

## 3. 常量与变量

### 变量

| 名称 | 类型 | 值 | 中文说明 |
|------|------|----|----------|
| `taskStateToProtoMap` | `—` | `map[TaskState]proto.TaskState{...}` | — |
| `taskStateFromProtoMap` | `—` | `map[proto.TaskState]TaskState{...}` | — |
| `cpuUsageMeasuredFieldToProtoMap` | `—` | `map[string]proto.CPUUsage_Fields{...}` | — |
| `cpuUsageMeasuredFieldFromProtoMap` | `—` | `map[proto.CPUUsage_Fields]string{...}` | — |
| `memoryUsageMeasuredFieldToProtoMap` | `—` | `map[string]proto.MemoryUsage_Fields{...}` | — |
| `memoryUsageMeasuredFieldFromProtoMap` | `—` | `map[proto.MemoryUsage_Fields]string{...}` | — |

## 4. 方法与函数

| 方法 | 接收者 | 参数 | 返回值 | 行号 |
|------|--------|------|--------|------|
| `healthStateToProto` | - | `health HealthState` | `proto.FingerprintResponse_HealthState` | [L26](file:///d:/claude/nomad/plugins/drivers/utils.go#L26) |
| `healthStateFromProto` | - | `pb proto.FingerprintResponse_HealthState` | `HealthState` | [L38](file:///d:/claude/nomad/plugins/drivers/utils.go#L38) |
| `taskConfigFromProto` | - | `pb *proto.TaskConfig` | `*TaskConfig` | [L50](file:///d:/claude/nomad/plugins/drivers/utils.go#L50) |
| `taskConfigToProto` | - | `cfg *TaskConfig` | `*proto.TaskConfig` | [L79](file:///d:/claude/nomad/plugins/drivers/utils.go#L79) |
| `ResourcesFromProto` | - | `pb *proto.Resources` | `*Resources` | [L109](file:///d:/claude/nomad/plugins/drivers/utils.go#L109) |
| `ResourcesToProto` | - | `r *Resources` | `*proto.Resources` | [L178](file:///d:/claude/nomad/plugins/drivers/utils.go#L178) |
| `DevicesFromProto` | - | `devices []*proto.Device` | `[]*DeviceConfig` | [L249](file:///d:/claude/nomad/plugins/drivers/utils.go#L249) |
| `DeviceFromProto` | - | `device *proto.Device` | `*DeviceConfig` | [L262](file:///d:/claude/nomad/plugins/drivers/utils.go#L262) |
| `MountsFromProto` | - | `mounts []*proto.Mount` | `[]*MountConfig` | [L274](file:///d:/claude/nomad/plugins/drivers/utils.go#L274) |
| `MountFromProto` | - | `mount *proto.Mount` | `*MountConfig` | [L287](file:///d:/claude/nomad/plugins/drivers/utils.go#L287) |
| `DevicesToProto` | - | `devices []*DeviceConfig` | `[]*proto.Device` | [L302](file:///d:/claude/nomad/plugins/drivers/utils.go#L302) |
| `DeviceToProto` | - | `device *DeviceConfig` | `*proto.Device` | [L315](file:///d:/claude/nomad/plugins/drivers/utils.go#L315) |
| `MountsToProto` | - | `mounts []*MountConfig` | `[]*proto.Mount` | [L327](file:///d:/claude/nomad/plugins/drivers/utils.go#L327) |
| `MountToProto` | - | `mount *MountConfig` | `*proto.Mount` | [L340](file:///d:/claude/nomad/plugins/drivers/utils.go#L340) |
| `taskHandleFromProto` | - | `pb *proto.TaskHandle` | `*TaskHandle` | [L355](file:///d:/claude/nomad/plugins/drivers/utils.go#L355) |
| `taskHandleToProto` | - | `handle *TaskHandle` | `*proto.TaskHandle` | [L367](file:///d:/claude/nomad/plugins/drivers/utils.go#L367) |
| `exitResultToProto` | - | `result *ExitResult` | `*proto.ExitResult` | [L376](file:///d:/claude/nomad/plugins/drivers/utils.go#L376) |
| `exitResultFromProto` | - | `pb *proto.ExitResult` | `*ExitResult` | [L387](file:///d:/claude/nomad/plugins/drivers/utils.go#L387) |
| `taskStatusToProto` | - | `status *TaskStatus` | `*proto.TaskStatus, error` | [L395](file:///d:/claude/nomad/plugins/drivers/utils.go#L395) |
| `taskStatusFromProto` | - | `pb *proto.TaskStatus` | `*TaskStatus, error` | [L414](file:///d:/claude/nomad/plugins/drivers/utils.go#L414) |
| `TaskStatsToProto` | - | `stats *TaskResourceUsage` | `*proto.TaskStats, error` | [L435](file:///d:/claude/nomad/plugins/drivers/utils.go#L435) |
| `TaskStatsFromProto` | - | `pb *proto.TaskStats` | `*TaskResourceUsage, error` | [L453](file:///d:/claude/nomad/plugins/drivers/utils.go#L453) |
| `resourceUsageToProto` | - | `ru *ResourceUsage` | `*proto.TaskResourceUsage` | [L473](file:///d:/claude/nomad/plugins/drivers/utils.go#L473) |
| `resourceUsageFromProto` | - | `pb *proto.TaskResourceUsage` | `*ResourceUsage` | [L505](file:///d:/claude/nomad/plugins/drivers/utils.go#L505) |
| `BytesToMB` | - | `bytes int64` | `int64` | [L539](file:///d:/claude/nomad/plugins/drivers/utils.go#L539) |
| `cpuUsageMeasuredFieldsToProto` | - | `fields []string` | `[]proto.CPUUsage_Fields` | [L561](file:///d:/claude/nomad/plugins/drivers/utils.go#L561) |
| `cpuUsageMeasuredFieldsFromProto` | - | `fields []proto.CPUUsage_Fields` | `[]string` | [L573](file:///d:/claude/nomad/plugins/drivers/utils.go#L573) |
| `memoryUsageMeasuredFieldsToProto` | - | `fields []string` | `[]proto.MemoryUsage_Fields` | [L605](file:///d:/claude/nomad/plugins/drivers/utils.go#L605) |
| `memoryUsageMeasuredFieldsFromProto` | - | `fields []proto.MemoryUsage_Fields` | `[]string` | [L617](file:///d:/claude/nomad/plugins/drivers/utils.go#L617) |
| `netIsolationModeToProto` | - | `mode NetIsolationMode` | `proto.NetworkIsolationSpec_NetworkIsolationMode` | [L629](file:///d:/claude/nomad/plugins/drivers/utils.go#L629) |
| `netIsolationModeFromProto` | - | `pb proto.NetworkIsolationSpec_NetworkIsolationMode` | `NetIsolationMode` | [L644](file:///d:/claude/nomad/plugins/drivers/utils.go#L644) |
| `networkCreateRequestFromProto` | - | `pb *proto.CreateNetworkRequest` | `*NetworkCreateRequest` | [L659](file:///d:/claude/nomad/plugins/drivers/utils.go#L659) |
| `NetworkIsolationSpecToProto` | - | `spec *NetworkIsolationSpec` | `*proto.NetworkIsolationSpec` | [L668](file:///d:/claude/nomad/plugins/drivers/utils.go#L668) |
| `NetworkIsolationSpecFromProto` | - | `pb *proto.NetworkIsolationSpec` | `*NetworkIsolationSpec` | [L680](file:///d:/claude/nomad/plugins/drivers/utils.go#L680) |
| `hostsConfigToProto` | - | `cfg *HostsConfig` | `*proto.HostsConfig` | [L692](file:///d:/claude/nomad/plugins/drivers/utils.go#L692) |
| `hostsConfigFromProto` | - | `pb *proto.HostsConfig` | `*HostsConfig` | [L703](file:///d:/claude/nomad/plugins/drivers/utils.go#L703) |
| `dnsConfigToProto` | - | `dns *DNSConfig` | `*proto.DNSConfig` | [L714](file:///d:/claude/nomad/plugins/drivers/utils.go#L714) |
| `dnsConfigFromProto` | - | `pb *proto.DNSConfig` | `*DNSConfig` | [L726](file:///d:/claude/nomad/plugins/drivers/utils.go#L726) |

## 5. 核心方法详解

该文件无导出的核心方法。

## 6. 依赖关系

### 导入包

| 包路径 | 类型 |
|--------|------|
| `time` | 标准库 |
| `github.com/hashicorp/nomad/nomad/structs` | 内部包 |
| `github.com/hashicorp/nomad/plugins/drivers/proto` | 内部包 |
| `github.com/golang/protobuf/ptypes` | 第三方库 |

## 7. 设计模式与技术特点

- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例
- **gRPC 通信**：使用 gRPC 进行进程间通信

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| [utils_test.go](file:///d:/claude/nomad/plugins/drivers/utils_test.go) | 对应测试文件 |
| [client.go](file:///d:/claude/nomad/plugins/drivers/client.go) | 同目录源文件 |
| [cstructs.go](file:///d:/claude/nomad/plugins/drivers/cstructs.go) | 同目录源文件 |
| [driver.go](file:///d:/claude/nomad/plugins/drivers/driver.go) | 同目录源文件 |
| [errors.go](file:///d:/claude/nomad/plugins/drivers/errors.go) | 同目录源文件 |
| [execstreaming.go](file:///d:/claude/nomad/plugins/drivers/execstreaming.go) | 同目录源文件 |

