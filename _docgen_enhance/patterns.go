package main

import (
	"fmt"
	"strings"
)

// describePatterns detects and describes design patterns used in the file.
func describePatterns(info FileInfo) string {
	var patterns []string

	// Check for interface definitions
	hasInterface := false
	for _, t := range info.Types {
		if t.Kind == "interface" {
			hasInterface = true
			break
		}
	}
	if hasInterface {
		patterns = append(patterns, "- **接口抽象**：定义接口类型，实现依赖倒置和解耦，便于测试模拟")
	}

	// Check for context.Context usage
	hasContext := false
	for _, f := range info.Functions {
		for _, p := range f.Params {
			if strings.Contains(p.Type, "context.Context") {
				hasContext = true
				break
			}
		}
		if hasContext {
			break
		}
	}
	if hasContext {
		patterns = append(patterns, "- **Context 传递**：使用 `context.Context` 实现请求取消和超时控制")
	}

	// Check for sync primitives
	hasSync := false
	for _, imp := range info.Imports {
		if imp == "sync" || imp == "sync/atomic" {
			hasSync = true
			break
		}
	}
	if hasSync {
		patterns = append(patterns, "- **并发安全**：使用 `sync.Mutex`/`sync.RWMutex`/`sync.atomic` 保护共享状态")
	}

	// Check for error handling
	errorCount := 0
	for _, f := range info.Functions {
		for _, r := range f.Returns {
			if strings.Contains(r.Type, "error") {
				errorCount++
				break
			}
		}
	}
	if errorCount > 3 {
		patterns = append(patterns, "- **错误返回**：函数普遍返回 `error` 类型，遵循 Go 错误处理惯例")
	}

	// Check for io operations
	hasIO := false
	for _, imp := range info.Imports {
		if imp == "io" || imp == "io/fs" || imp == "os" {
			hasIO = true
			break
		}
	}
	if hasIO {
		patterns = append(patterns, "- **IO 操作**：涉及文件或数据流的读写操作")
	}

	// Check for crypto/tls
	for _, imp := range info.Imports {
		if strings.HasPrefix(imp, "crypto/") || imp == "crypto/tls" {
			patterns = append(patterns, "- **加密安全**：使用 Go crypto 标准库实现加密、签名或 TLS 通信")
			break
		}
	}

	// Check for plugin pattern
	for _, imp := range info.Imports {
		if strings.Contains(imp, "go-plugin") {
			patterns = append(patterns, "- **插件架构**：使用 `go-plugin` 框架实现插件化扩展")
			break
		}
	}

	// Check for gRPC
	for _, imp := range info.Imports {
		if strings.Contains(imp, "grpc") || strings.Contains(imp, "protobuf") {
			patterns = append(patterns, "- **gRPC 通信**：使用 gRPC 进行进程间通信")
			break
		}
	}

	// Check for Raft
	for _, imp := range info.Imports {
		if strings.Contains(imp, "raft") {
			patterns = append(patterns, "- **Raft 集成**：与 HashiCorp Raft 库交互，处理共识协议相关操作")
			break
		}
	}

	// Check for HCL
	for _, imp := range info.Imports {
		if strings.Contains(imp, "hcl") {
			patterns = append(patterns, "- **HCL 解析**：使用 HCL（HashiCorp 配置语言）进行配置解析")
			break
		}
	}

	// Check for struct tags
	for _, t := range info.Types {
		for _, f := range t.Fields {
			if strings.Contains(f.Tag, "json:") || strings.Contains(f.Tag, "hcl:") || strings.Contains(f.Tag, "mapstructure:") {
				patterns = append(patterns, "- **结构标签**：使用 `json`/`hcl`/`mapstructure` 结构标签支持序列化和配置解析")
				goto structTagDone
			}
		}
	}
structTagDone:

	// Check for logger
	for _, imp := range info.Imports {
		if strings.Contains(imp, "hclog") || strings.Contains(imp, "go-hclog") {
			patterns = append(patterns, "- **结构化日志**：使用 `hclog` 进行结构化日志记录")
			break
		}
	}

	// Check for metrics
	for _, imp := range info.Imports {
		if strings.Contains(imp, "metrics") {
			patterns = append(patterns, "- **指标收集**：使用 `go-metrics` 收集运行时指标")
			break
		}
	}

	// Check for platform-specific
	if info.IsPlatform {
		patterns = append(patterns, fmt.Sprintf("- **平台特定实现**：通过 build tag 机制实现 %s 平台支持", info.Platform))
	}

	// Check for CE/Enterprise
	if strings.HasSuffix(info.FileName, "_ce.go") {
		patterns = append(patterns, "- **社区版存根**：为企业版功能提供社区版的空实现，通过 build tag 选择")
	}

	// Check for testing utilities
	if strings.HasSuffix(info.FileName, "_testing.go") || info.DirName == "testlog" || info.DirName == "testtask" || info.DirName == "testutil" {
		patterns = append(patterns, "- **测试工具**：提供测试辅助工具，便于编写单元测试和集成测试")
	}

	// Check for generics (type parameters)
	for _, t := range info.Types {
		if strings.Contains(t.Def, "[T") || strings.Contains(t.Def, "[T ") {
			patterns = append(patterns, "- **泛型编程**：使用 Go 泛型实现类型安全的通用工具")
			break
		}
	}

	// Check for caching pattern
	for _, t := range info.Types {
		if strings.Contains(t.Name, "Cache") || strings.Contains(t.Name, "cache") {
			patterns = append(patterns, "- **缓存模式**：实现缓存机制，减少重复计算或 I/O 操作")
			break
		}
	}

	// Check for pool pattern
	for _, t := range info.Types {
		if strings.Contains(t.Name, "Pool") || strings.Contains(t.Name, "pool") {
			patterns = append(patterns, "- **对象池模式**：实现对象池，复用资源减少分配开销")
			break
		}
	}

	// Check for e2e test pattern
	if strings.HasPrefix(info.DirName, "e2e") {
		patterns = append(patterns, "- **端到端测试**：通过真实 Nomad 集群验证功能，使用测试框架组织测试用例")
	}

	// Check for driver pattern
	if strings.HasPrefix(info.DirName, "drivers") {
		patterns = append(patterns, "- **任务驱动**：实现 Nomad 任务驱动接口，管理任务的完整生命周期")
	}

	// Check for Docker
	for _, imp := range info.Imports {
		if strings.Contains(imp, "docker") {
			patterns = append(patterns, "- **Docker 集成**：与 Docker Engine API 交互，管理容器生命周期")
			break
		}
	}

	// Check for WebSocket/HTTP server
	for _, imp := range info.Imports {
		if imp == "net/http" {
			patterns = append(patterns, "- **HTTP 服务**：提供 HTTP API 端点或客户端")
			break
		}
	}

	// Check for goroutine usage in function comments
	hasGoroutine := false
	for _, f := range info.Functions {
		if strings.Contains(f.DocComment, "goroutine") || strings.Contains(f.DocComment, "background") {
			hasGoroutine = true
			break
		}
	}
	if hasGoroutine {
		patterns = append(patterns, "- **后台协程**：启动 goroutine 执行后台任务")
	}

	// Check for factory pattern (New* functions)
	hasFactory := false
	for _, f := range info.Functions {
		if strings.HasPrefix(f.Name, "New") {
			hasFactory = true
			break
		}
	}
	if hasFactory {
		patterns = append(patterns, "- **工厂模式**：提供 `New*` 构造函数创建对象实例")
	}

	if len(patterns) == 0 {
		patterns = append(patterns, "- 遵循 Go 标准代码组织规范，作为 Nomad 项目的一部分")
	}

	return strings.Join(patterns, "\n") + "\n\n"
}
