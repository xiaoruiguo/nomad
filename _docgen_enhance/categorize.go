package main

import (
	"fmt"
	"strings"
)

// categorizeFile returns a Chinese description of the file's role based on its path and content.
func categorizeFile(info FileInfo) string {
	name := info.FileName
	baseName := strings.TrimSuffix(name, ".go")
	dirName := info.DirName

	// Remove platform/CE suffix for categorization
	cleanBase := baseName
	for _, suffix := range []string{"_linux", "_bsd", "_windows", "_darwin", "_default", "_unix", "_freebsd", "_ce", "_nonwindows", "_cgo", "_testing"} {
		cleanBase = strings.TrimSuffix(cleanBase, suffix)
	}

	// Root main.go
	if dirName == "" && name == "main.go" {
		return "该文件是 **Nomad 主入口**（`main` 包），实现命令行命令分发。通过导入各子命令包的 `init()` 函数注册命令，使用 `commands` 字典将命令名映射到工厂函数，解析命令行参数后调用对应命令的 `Run` 方法。还包含 `version` 和 `version-monotonic` 等内置命令的实现。\n"
	}

	// version/
	if dirName == "version" {
		return "该文件属于 **版本信息子包**（`version`），定义 Nomad 的构建元数据（GitCommit、BuildDate、GitDescribe、Version 等），通过编译时注入的方式填充版本信息，用于 `nomad version` 命令和 HTTP API 的版本端点。\n"
	}

	// analysis/
	if dirName == "analysis" {
		return "该文件属于 **分析工具**（`analysis`），是独立的命令行工具，用于分析 Nomad 的性能数据、配置或行为，通常作为开发辅助工具使用。\n"
	}

	// demo/
	if strings.HasPrefix(dirName, "demo") {
		return "该文件属于 **示例代码**（`demo/`），提供 Nomad 的使用示例和演示程序，展示如何与 Nomad API 交互或部署示例工作负载。\n"
	}

	// ci/
	if dirName == "ci" {
		return "该文件属于 **CI/CD 工具**（`ci/`），提供持续集成测试用的辅助函数，包括非 root 用户跳过测试、慢测试标记和端口管理等。\n"
	}

	// tools/
	if strings.HasPrefix(dirName, "tools") {
		return "该文件属于 **构建工具**（`tools/`），提供 Nomad 构建过程的辅助工具，如测试分组管理（`tools/missing`）和命令行入口生成（`tools/cl-entry`）。\n"
	}

	// command/
	if strings.HasPrefix(dirName, "command") {
		return categorizeCommand(info, cleanBase)
	}

	// drivers/
	if strings.HasPrefix(dirName, "drivers") {
		return categorizeDrivers(info, cleanBase)
	}

	// e2e/
	if strings.HasPrefix(dirName, "e2e") {
		return categorizeE2e(info, cleanBase)
	}

	// plugins/
	if strings.HasPrefix(dirName, "plugins") {
		return categorizePlugins(info, cleanBase)
	}

	// lib/
	if strings.HasPrefix(dirName, "lib") {
		return categorizeLib(info, cleanBase)
	}

	// jobspec2/
	if strings.HasPrefix(dirName, "jobspec2") {
		return categorizeJobspec2(info, cleanBase)
	}

	// testutil/
	if strings.HasPrefix(dirName, "testutil") {
		return categorizeTestutil(info, cleanBase)
	}

	// nomad/ root package
	if dirName == "nomad" || dirName == "" {
		return categorizeNomad(info, cleanBase)
	}

	// client/
	if strings.HasPrefix(dirName, "client") {
		return categorizeClient(info, cleanBase)
	}

	// helper/
	if strings.HasPrefix(dirName, "helper") {
		return categorizeHelper(info, cleanBase)
	}

	// scheduler/
	if strings.HasPrefix(dirName, "scheduler") {
		return categorizeScheduler(info, cleanBase)
	}

	// api/
	if strings.HasPrefix(dirName, "api") {
		return categorizeAPI(info, cleanBase)
	}

	// internal/
	if strings.HasPrefix(dirName, "internal") {
		return "该文件属于 **内部包**（`internal/`），提供 Nomad 内部使用的功能实现，不对外暴露。通常包含测试辅助、内部工具和平台特定实现。\n"
	}

	// Default categorization based on types and functions
	return categorizeByContent(info, cleanBase)
}

// categorizeByContent provides a generic description based on file content.
func categorizeByContent(info FileInfo, cleanBase string) string {
	hasStruct := false
	hasInterface := false
	hasFunc := false
	for _, t := range info.Types {
		if t.Kind == "struct" {
			hasStruct = true
		}
		if t.Kind == "interface" {
			hasInterface = true
		}
	}
	if len(info.Functions) > 0 {
		hasFunc = true
	}

	parts := []string{}
	if hasInterface {
		parts = append(parts, "定义接口类型")
	}
	if hasStruct {
		parts = append(parts, "定义结构体类型")
	}
	if hasFunc {
		parts = append(parts, fmt.Sprintf("包含 %d 个方法/函数", len(info.Functions)))
	}

	desc := fmt.Sprintf("该文件属于 `%s` 包，", info.PackageName)
	if len(parts) > 0 {
		desc += strings.Join(parts, "、") + "。"
	} else {
		desc += "提供辅助功能。"
	}
	return desc + "\n"
}

func categorizeCommand(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case strings.HasPrefix(dirName, "command/agent"):
		return "该文件属于 **Agent 命令子包**（`command/agent`），实现 `nomad agent` 命令，启动 Nomad Server 或 Client 进程。包含配置加载、HTTP/RPC 服务启动、信号处理和日志初始化等逻辑，是 Nomad 节点的启动入口。\n"
	case strings.HasPrefix(dirName, "command/agent/host"):
		return "该文件属于 **Agent 主机信息子包**（`command/agent/host`），收集主机相关信息（CPU、内存、磁盘、网络），用于节点注册和心跳上报。\n"
	case strings.HasPrefix(dirName, "command/monitor"):
		return "该文件属于 **监控命令子包**（`command/monitor`），实现 `nomad monitor` 命令，实时流式输出 Nomad 日志，支持日志级别过滤和多节点订阅。\n"
	case strings.HasPrefix(dirName, "command/operator"):
		return "该文件属于 **运维命令子包**（`command/operator`），实现 `nomad operator` 命令，提供 Raft 状态查看、快照管理、调度器配置和集群健康检查等运维功能。\n"
	case strings.HasPrefix(dirName, "command/util"):
		return "该文件属于 **命令工具子包**（`command/util`），提供 CLI 命令的共享工具函数，包括表格格式化、参数解析和输出渲染等。\n"
	case dirName == "command":
		return fmt.Sprintf("该文件属于 **CLI 命令包**（`command/`），实现 `nomad %s` 命令，通过 Nomad API 客户端与 Server 交互，提供作业管理、节点查询、集群运维等命令行功能。\n", cleanBase)
	}
	return "该文件属于 **CLI 命令包**（`command/`），实现 Nomad 命令行工具的子命令，通过 API 客户端与 Server 交互。\n"
}

func categorizeDrivers(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case strings.HasPrefix(dirName, "drivers/docker"):
		return "该文件属于 **Docker 驱动子包**（`drivers/docker`），实现 Nomad 的 Docker 任务驱动，通过 Docker API 管理容器的生命周期（创建、启动、停止、销毁）、资源限制、网络配置和日志收集。支持 Docker API 版本协商、认证、健康检查和统计信息收集。\n"
	case strings.HasPrefix(dirName, "drivers/exec"):
		return "该文件属于 **Exec 驱动子包**（`drivers/exec`），实现 Nomad 的隔离执行驱动，使用 chroot/isolation 隔离运行任意二进制文件，支持资源限制和 cgroups 集成。\n"
	case strings.HasPrefix(dirName, "drivers/java"):
		return "该文件属于 **Java 驱动子包**（`drivers/java`），实现 Nomad 的 Java 任务驱动，通过 JVM 运行 Java 应用程序（jar 文件），支持 JVM 参数配置和进程管理。\n"
	case strings.HasPrefix(dirName, "drivers/qemu"):
		return "该文件属于 **QEMU 驱动子包**（`drivers/qemu`），实现 Nomad 的 QEMU 任务驱动，通过 QEMU 虚拟机运行镜像文件，支持端口映射和资源限制。\n"
	case strings.HasPrefix(dirName, "drivers/rawexec"):
		return "该文件属于 **Raw Exec 驱动子包**（`drivers/rawexec`），实现 Nomad 的原始执行驱动，直接在主机上运行命令（无隔离），用于无法使用容器化或隔离的场景，不推荐在生产环境使用。\n"
	case strings.HasPrefix(dirName, "drivers/mock"):
		return "该文件属于 **Mock 驱动子包**（`drivers/mock`），实现 Nomad 的模拟驱动，用于测试和开发，模拟任务执行的各种状态和行为（成功、失败、日志等）。\n"
	case strings.HasPrefix(dirName, "drivers/shared"):
		return "该文件属于 **驱动共享工具子包**（`drivers/shared`），提供各任务驱动的共享功能，包括驱动事件处理、重启策略、执行器接口、网络配置、资源隔离和选择器逻辑等。\n"
	}
	return "该文件属于 **任务驱动子包**（`drivers/`），实现 Nomad 支持的任务驱动，每个驱动负责特定运行时（容器、进程、虚拟机）的任务生命周期管理。\n"
}

func categorizeE2e(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case strings.HasPrefix(dirName, "e2e/e2eutil"):
		return "该文件属于 **E2E 测试工具子包**（`e2e/e2eutil`），提供端到端测试的共享工具函数，包括 Nomad 客户端创建、作业提交、分配查询、等待逻辑和断言辅助等，是所有 E2E 测试的基础设施。\n"
	case strings.HasPrefix(dirName, "e2e/framework"):
		return "该文件属于 **E2E 测试框架子包**（`e2e/framework`），实现端到端测试的框架基础设施，包括测试套件组织、Setup/Teardown 机制、断言工具和测试运行器。\n"
	case strings.HasPrefix(dirName, "e2e/v3"):
		return "该文件属于 **E2E v3 测试框架子包**（`e2e/v3`），实现新一代端到端测试框架，提供更结构化的测试编写模式和更丰富的断言工具。\n"
	}
	return fmt.Sprintf("该文件属于 **端到端测试子包**（`e2e/%s`），针对 Nomad 的特定功能领域编写端到端测试，通过真实的 Nomad 集群验证功能正确性。\n", strings.TrimPrefix(dirName, "e2e/"))
}

func categorizePlugins(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case dirName == "plugins" || info.RelPath == "plugins/serve.go":
		return "该文件属于 **插件根包**（`plugins/`），定义插件系统的核心接口和工具，包括插件服务入口、插件类型注册和插件工厂函数。\n"
	case strings.HasPrefix(dirName, "plugins/base"):
		return "该文件属于 **基础插件接口子包**（`plugins/base`），定义所有 Nomad 插件必须实现的基础接口，包括插件信息查询、配置设置、TLS 证书设置和 gRPC 通信协议。\n"
	case strings.HasPrefix(dirName, "plugins/drivers"):
		return "该文件属于 **驱动插件接口子包**（`plugins/drivers`），定义任务驱动插件的接口规范，包括任务生命周期管理（Fingerprint、Launch、Stop、Destroy、Signal）、统计信息收集、能力声明和 gRPC 通信协议。\n"
	case strings.HasPrefix(dirName, "plugins/device"):
		return "该文件属于 **设备插件接口子包**（`plugins/device`），定义设备插件的接口规范，用于发现和管理硬件设备（GPU、FPGA 等），包括设备指纹采集、资源预留和挂载管理。\n"
	case strings.HasPrefix(dirName, "plugins/shared"):
		return "该文件属于 **插件共享工具子包**（`plugins/shared`），提供插件系统各组件共享的工具，包括 HCL 规格序列化、gRPC 流式日志转发和 proto 工具函数。\n"
	case strings.HasPrefix(dirName, "plugins/csi"):
		return "该文件属于 **CSI 插件接口子包**（`plugins/csi`），定义容器存储接口（CSI）插件的客户端实现，通过 gRPC 与 CSI 控制器和节点服务通信，管理卷的创建、挂载和快照。\n"
	}
	return "该文件属于 **插件子系统**（`plugins/`），定义 Nomad 插件系统的接口和实现，支持任务驱动、设备管理和 CSI 存储等插件类型。\n"
}

func categorizeLib(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case strings.HasPrefix(dirName, "lib/auth"):
		return "该文件属于 **认证库子包**（`lib/auth`），实现 Nomad 的认证辅助功能，包括 OIDC（OpenID Connect）和 SSO 集成、令牌管理和认证流程处理。\n"
	case strings.HasPrefix(dirName, "lib/lang"):
		return "该文件属于 **语言工具子包**（`lib/lang`），提供 Go 语言的通用工具函数，包括类型转换、反射辅助和泛型工具。\n"
	case strings.HasPrefix(dirName, "lib/resolvconf"):
		return "该文件属于 **DNS 解析配置子包**（`lib/resolvconf`），实现 `/etc/resolv.conf` 文件的解析和生成，用于任务网络的 DNS 配置。\n"
	case strings.HasPrefix(dirName, "lib/delayheap"):
		return "该文件属于 **延迟堆子包**（`lib/delayheap`），实现基于堆的延迟队列数据结构，用于按时间顺序处理延迟任务。\n"
	case strings.HasPrefix(dirName, "lib/file"):
		return "该文件属于 **文件工具子包**（`lib/file`），提供文件操作的高级工具函数，包括原子写入和文件锁管理。\n"
	case strings.HasPrefix(dirName, "lib/kheap"):
		return "该文件属于 **K 堆子包**（`lib/kheap`），实现泛型堆数据结构，支持 Top-K 查询，用于调度器和资源排序。\n"
	}
	return "该文件属于 **基础库子包**（`lib/`），提供 Nomad 使用的通用库函数和数据结构。\n"
}

func categorizeJobspec2(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case strings.HasPrefix(dirName, "jobspec2/addrs"):
		return "该文件属于 **地址解析子包**（`jobspec2/addrs`），实现 jobspec 中的地址解析逻辑，处理服务和网络地址的引用和解析。\n"
	case strings.HasPrefix(dirName, "jobspec2/hclutil"):
		return "该文件属于 **HCL 工具子包**（`jobspec2/hclutil`），提供 HCL 解析的辅助工具函数，支持 jobspec 的 HCL 语法解析和转换。\n"
	}
	return "该文件属于 **Jobspec v2 解析子包**（`jobspec2/`），实现 Nomad 作业规范（jobspec）的 HCL 解析、验证和转换，将用户编写的 HCL 配置转换为内部 API 对象。\n"
}

func categorizeTestutil(info FileInfo, cleanBase string) string {
	return "该文件属于 **测试工具子包**（`testutil/`），提供 Nomad 测试的基础设施，包括测试服务器启动、TLS 配置、Vault 集成、HTTP 响应记录器和等待/重试工具，用于单元测试和集成测试。\n"
}

func categorizeNomad(info FileInfo, cleanBase string) string {
	switch cleanBase {
	case "server":
		return "该文件是 **Nomad Server 核心实现**，定义 `Server` 结构体——Nomad 集群的核心控制器。负责 Raft 共识、RPC 服务、调度协调、状态管理等核心功能的统一管理。是 Server 节点的中央调度器，管理所有子系统的生命周期。\n"
	case "client":
		return "该文件是 **Nomad Client 核心实现**，定义 `Client` 结构体——Nomad 客户端节点的主控制器。负责任务执行、节点注册、心跳上报、分配管理和驱动调度等客户端功能。\n"
	case "fsm":
		return "该文件实现 **有限状态机（FSM）**，作为 Raft 共识的状态存储后端。通过 Apply 方法将 Raft 日志应用到状态机，维护作业、节点、评估、分配等核心数据结构的一致性。\n"
	case "state_store":
		return "该文件实现 **状态存储（State Store）**，提供对 Nomad 所有持久化数据的读写接口，包括作业、节点、评估、分配、部署等。支持事务操作、索引管理和快照恢复。\n"
	case "worker":
		return "该文件实现 **调度 Worker**，从评估队列获取评估并调度执行。Worker 是调度系统的执行单元，负责评估处理、计划提交和分配更新。\n"
	case "config":
		return "该文件定义 **配置结构**，包含 Server 和 Client 的所有配置项，支持从文件、环境变量和命令行参数加载配置。提供配置验证和默认值设置。\n"
	default:
		return fmt.Sprintf("该文件属于 **Nomad 核心包**（`nomad/`），实现 Server/Client 核心功能，包括 Raft 共识、状态管理、调度系统、RPC 处理等。当前文件 `%s` 提供相关功能实现。\n", info.FileName)
	}
}

func categorizeClient(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case strings.HasPrefix(dirName, "client/allocrunner"):
		return "该文件属于 **分配运行器子包**（`client/allocrunner`），管理单个分配（Allocation）的完整生命周期，包括任务启动、停止、监控和状态上报。使用状态机模式驱动分配状态转换。\n"
	case strings.HasPrefix(dirName, "client/taskrunner"):
		return "该文件属于 **任务运行器子包**（`client/taskrunner`），管理单个任务的执行生命周期，包括脚本执行、环境变量设置、服务注册和日志收集。\n"
	case strings.HasPrefix(dirName, "client/devicemanager"):
		return "该文件属于 **设备管理器子包**（`client/devicemanager`），管理客户端节点上的硬件设备（GPU、FPGA 等），通过设备插件发现设备并分配给任务。\n"
	case strings.HasPrefix(dirName, "client/fingerprint"):
		return "该文件属于 **指纹采集子包**（`client/fingerprint`），采集客户端节点的硬件和软件信息（CPU、内存、OS、网络），用于节点注册和资源上报。\n"
	case strings.HasPrefix(dirName, "client/pluginmanager"):
		return "该文件属于 **插件管理器子包**（`client/pluginmanager`），管理客户端节点上的插件生命周期，包括驱动插件和设备插件的发现、加载和监控。\n"
	case strings.HasPrefix(dirName, "client/serviceregistration"):
		return "该文件属于 **服务注册子包**（`client/serviceregistration`），将任务暴露的服务注册到 Consul 或 Nomad 内置服务发现，支持健康检查和负载均衡。\n"
	case strings.HasPrefix(dirName, "client/allocdir"):
		return "该文件属于 **分配目录子包**（`client/allocdir`），管理分配的文件系统目录结构，包括任务数据、日志和 secrets 目录的创建和清理。\n"
	case strings.HasPrefix(dirName, "client/host"):
		return "该文件属于 **主机信息子包**（`client/host`），收集客户端主机的资源信息（CPU、内存、磁盘），用于指纹采集和资源上报。\n"
	case strings.HasPrefix(dirName, "client/lib"):
		return "该文件属于 **客户端库子包**（`client/lib`），提供客户端使用的通用库函数和数据结构。\n"
	case dirName == "client":
		return "该文件属于 **Nomad Client 核心包**（`client/`），实现客户端节点的主要功能，包括分配管理、任务执行、心跳上报和驱动调度。\n"
	}
	return "该文件属于 **客户端子包**（`client/`），实现 Nomad 客户端的功能组件。\n"
}

func categorizeHelper(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case strings.HasPrefix(dirName, "helper/tlsutil"):
		return "该文件属于 **TLS 工具子包**（`helper/tlsutil`），提供 TLS 配置生成、证书管理和连接包装功能，用于 Nomad 的 RPC 和 HTTP 通信加密。\n"
	case strings.HasPrefix(dirName, "helper/uuid"):
		return "该文件属于 **UUID 工具子包**（`helper/uuid`），提供 UUID 生成功能，用于生成全局唯一的标识符。\n"
	case strings.HasPrefix(dirName, "helper/logging"):
		return "该文件属于 **日志工具子包**（`helper/logging`），提供日志配置、日志格式化和日志级别管理功能，基于 hclog 实现。\n"
	case strings.HasPrefix(dirName, "helper/backoff"):
		return "该文件属于 **退避重试子包**（`helper/backoff`），实现指数退避重试逻辑，用于网络请求和 Raft 操作的重试机制。\n"
	case strings.HasPrefix(dirName, "helper/crypto"):
		return "该文件属于 **加密工具子包**（`helper/crypto`），提供加密、解密和哈希等安全相关的工具函数。\n"
	case strings.HasPrefix(dirName, "helper/codec"):
		return "该文件属于 **编解码子包**（`helper/codec`），提供消息编解码功能，用于 RPC 通信的序列化。\n"
	case strings.HasPrefix(dirName, "helper/constraints"):
		return "该文件属于 **约束工具子包**（`helper/constraints`），实现调度约束的匹配逻辑，用于过滤符合条件的节点。\n"
	case strings.HasPrefix(dirName, "helper/pool"):
		return "该文件属于 **连接池子包**（`helper/pool`），实现 RPC 连接池，复用连接以减少建立开销。\n"
	case strings.HasPrefix(dirName, "helper/raftutil"):
		return "该文件属于 **Raft 工具子包**（`helper/raftutil`），提供 Raft 相关的辅助工具，包括传输层实现和存储后端配置。\n"
	case strings.HasPrefix(dirName, "helper"):
		return fmt.Sprintf("该文件属于 **工具包子包**（`helper/%s`），提供 Nomad 使用的通用工具函数和数据结构。\n", strings.TrimPrefix(dirName, "helper/"))
	}
	return "该文件属于 **工具包**（`helper/`），提供 Nomad 使用的通用工具函数和数据结构。\n"
}

func categorizeScheduler(info FileInfo, cleanBase string) string {
	dirName := info.DirName
	switch {
	case dirName == "scheduler":
		return fmt.Sprintf("该文件属于 **调度器包**（`scheduler/`），实现 Nomad 的调度逻辑，包括评估处理、节点筛选、分配计划和抢占策略。当前文件 `%s` 提供相关调度功能。\n", info.FileName)
	case strings.HasPrefix(dirName, "scheduler/feasible"):
		return "该文件属于 **可行性检查子包**（`scheduler/feasible`），实现节点可行性检查器，根据约束、资源、节点池等条件筛选符合条件的节点。\n"
	case strings.HasPrefix(dirName, "scheduler/rank"):
		return "该文件属于 **节点排序子包**（`scheduler/rank`），实现节点排序算法，根据资源利用率、亲和性等因素对可行节点进行评分排序。\n"
	}
	return "该文件属于 **调度器包**（`scheduler/`），实现 Nomad 的调度逻辑和算法。\n"
}

func categorizeAPI(info FileInfo, cleanBase string) string {
	return fmt.Sprintf("该文件属于 **API 客户端包**（`api/`），提供 Go 语言客户端库，通过 HTTP API 与 Nomad Server 交互。当前文件 `%s` 实现相关 API 端点的客户端方法。\n", info.FileName)
}
